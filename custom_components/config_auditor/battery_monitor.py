"""Battery Monitor for H.A.C.A — Module 13."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr

from .translation_utils import TranslationHelper

_LOGGER = logging.getLogger(__name__)

# ── Thresholds ────────────────────────────────────────────────────────────────
BATTERY_CRITICAL   = 5    # <5 %  → HIGH
BATTERY_LOW        = 15   # 5-15% → MEDIUM
BATTERY_WARNING    = 25   # 15-25%→ LOW
NOTIFICATION_ID_PREFIX = "haca_battery_"


class BatteryMonitor:
    """Scan all sensor.*battery* entities and alert on low levels."""

    def __init__(
        self,
        hass: HomeAssistant,
        critical: int = BATTERY_CRITICAL,
        low: int = BATTERY_LOW,
        warning: int = BATTERY_WARNING,
    ) -> None:
        self.hass = hass
        self.battery_list: list[dict[str, Any]] = []
        self._translator = TranslationHelper(hass)
        # Configurable thresholds (from options, fallback to module-level defaults)
        self._critical = critical
        self._low      = low
        self._warning  = warning

    async def analyze_all(
        self,
        critical: int | None = None,
        low: int | None = None,
        warning: int | None = None,
    ) -> list[dict[str, Any]]:
        """Return sorted battery list and fire persistent notifications for low batteries.

        Thresholds can be overridden at call time so option changes take effect
        on the next scan without requiring an HA reload.
        """
        # Use override values when provided (fresh from entry.options)
        _critical = critical if critical is not None else self._critical
        _low      = low      if low      is not None else self._low
        _warning  = warning  if warning  is not None else self._warning
        self.battery_list = []

        # Load language-appropriate translations once per scan
        from .translation_utils import resolve_notification_language
        language = resolve_notification_language(self.hass)
        await self._translator.async_load_language(language)

        # Load haca_ignore label (entity + device level)
        from .translation_utils import async_get_haca_ignored_entity_ids
        _ignored = await async_get_haca_ignored_entity_ids(self.hass)

        # ── HACA autonomous device info ──────────────────────────────────────
        # Build a map: entity_id → {manufacturer, model, hw_version}
        # from HA's entity + device registry — no external integration needed.
        device_info_map: dict[str, dict] = {}
        try:
            from homeassistant.helpers import entity_registry as er, device_registry as dr
            ent_reg = er.async_get(self.hass)
            dev_reg = dr.async_get(self.hass)
            for entry in ent_reg.entities.values():
                if not entry.device_id:
                    continue
                dev = dev_reg.async_get(entry.device_id)
                if dev:
                    device_info_map[entry.entity_id] = {
                        "manufacturer": dev.manufacturer or "",
                        "model":        dev.model or "",
                        "hw_version":   dev.hw_version or "",
                        "name":         dev.name_by_user or dev.name or "",
                    }
        except Exception:
            pass

        # ── HACA Battery Library (autonomous) ────────────────────────────────
        # Loads battery type/quantity from a community-maintained device DB
        # (Battery Notes library, MIT licence). No external integration required.
        battery_lib = None
        try:
            from .battery_library import BatteryLibrary
            cache = self.hass.data.setdefault("haca_battery_library", None)
            if cache is None:
                battery_lib = BatteryLibrary(self.hass)
                await battery_lib.async_load()
                self.hass.data["haca_battery_library"] = battery_lib
            else:
                battery_lib = cache
        except Exception as exc:
            _LOGGER.debug("[HACA] Battery library unavailable: %s", exc)

        # ── User-set "last replaced" dates (per entity_id) stored in options ──
        # This makes HACA fully autonomous for tracking battery replacements.
        replaced_dates: dict[str, str] = {}
        try:
            for entry in self.hass.config_entries.async_entries("config_auditor"):
                replaced_dates = entry.options.get("battery_last_replaced", {}) or {}
                break
        except Exception:
            pass

        # ── Battery Notes integration (optional bonus enrichment) ────────────
        battery_notes_map: dict[str, dict] = {}
        for _bn_state in self.hass.states.async_all():
            _bn_eid = _bn_state.entity_id
            if not _bn_eid.startswith("sensor.") or not _bn_eid.endswith("_battery_plus"):
                continue
            _source = (_bn_state.attributes.get("source_entity_id")
                       or _bn_state.attributes.get("source"))
            if not _source:
                continue
            _btype = _bn_state.attributes.get("battery_type", "")
            _bqty  = _bn_state.attributes.get("battery_quantity", 1)
            _btaq  = _bn_state.attributes.get("battery_type_and_quantity", "")
            _blr   = _bn_state.attributes.get("battery_last_replaced", "")
            if _btype:
                battery_notes_map[_source] = {
                    "battery_type":             _btype,
                    "battery_quantity":          int(_bqty) if _bqty else 1,
                    "battery_type_and_quantity": _btaq or _btype,
                    "battery_last_replaced":     str(_blr) if _blr else "",
                }

        for state in self.hass.states.async_all():
            entity_id = state.entity_id
            if entity_id in _ignored: continue

            slug = entity_id.lower()
            if not slug.startswith("sensor."):
                continue

            # ── Skip HACA's own sensors ──────────────────────────────────────
            if "h_a_c_a_" in slug:
                continue

            if state.state in ("unavailable", "unknown", "none", ""):
                continue

            device_class = state.attributes.get("device_class", "")
            unit_raw = state.attributes.get("unit_of_measurement", "")
            unit_lower = unit_raw.strip().lower() if unit_raw else ""

            # ── STRICT: only device_class=battery ────────────────────────────
            if device_class != "battery":
                continue

            # ── Unit must be percentage ──────────────────────────────────────
            if unit_lower not in ("%", "pct", "percent"):
                continue

            # ── Extra safety: skip power/energy keywords in entity_id ────────
            power_keywords = ("_power", "_energy", "_voltage", "_current",
                              "_charge_rate", "_charging", "_cycle_count",
                              "_temperature", "_health")
            if any(kw in slug for kw in power_keywords):
                continue

            try:
                level = float(state.state)
            except (ValueError, TypeError):
                continue

            # Only 0-100% range
            if not (0 <= level <= 100):
                continue

            friendly = state.attributes.get("friendly_name", entity_id)

            severity = None
            if level < _critical:
                severity = "high"
            elif level < _low:
                severity = "medium"
            elif level < _warning:
                severity = "low"

            unit = state.attributes.get("unit_of_measurement", "%")

            bn = battery_notes_map.get(entity_id, {})
            di = device_info_map.get(entity_id, {})

            # ── Determine battery type with this priority ────────────────────
            # 1) Battery Notes integration (richest data, if installed)
            # 2) HACA autonomous Battery Library (manufacturer + model lookup)
            # 3) Native attributes on the entity (battery_type, battery_size, ...)
            attrs = state.attributes
            native_type = (
                attrs.get("battery_type")
                or attrs.get("battery_size")
                or attrs.get("power_source")
                or ""
            )
            if isinstance(native_type, str):
                _t = native_type.strip()
                if _t.lower() in ("mains", "ac", "wired", ""):
                    native_type = ""
                else:
                    native_type = _t
            native_qty = attrs.get("battery_quantity") or attrs.get("num_batteries") or 0
            try:
                native_qty = int(native_qty) if native_qty else 0
            except (TypeError, ValueError):
                native_qty = 0

            # Library lookup
            lib_hit: dict | None = None
            if battery_lib is not None and di.get("manufacturer") and di.get("model"):
                lib_hit = battery_lib.lookup(
                    di["manufacturer"], di["model"], di.get("hw_version", "")
                )

            final_type = (
                bn.get("battery_type")
                or (lib_hit or {}).get("battery_type")
                or native_type
                or ""
            )
            final_qty = (
                bn.get("battery_quantity")
                or (lib_hit or {}).get("battery_quantity")
                or native_qty
                or 0
            )
            final_taq = bn.get("battery_type_and_quantity") or (
                f"{final_qty}× {final_type}" if final_type and final_qty > 1 else final_type
            )

            # Last-replaced date: BN if present, else user-set HACA value
            final_replaced = bn.get("battery_last_replaced") or replaced_dates.get(entity_id, "")

            self.battery_list.append({
                "entity_id":                entity_id,
                "friendly_name":            friendly,
                "level":                    level,
                "unit":                     unit,
                "severity":                 severity,
                "state_class":              state.attributes.get("state_class", ""),
                "device_class":             state.attributes.get("device_class", "battery"),
                "battery_type":             final_type,
                "battery_quantity":         final_qty,
                "battery_type_and_quantity": final_taq,
                "battery_last_replaced":    final_replaced,
                "manufacturer":             di.get("manufacturer", ""),
                "model":                    di.get("model", ""),
                "device_name":              di.get("name", ""),
            })

        # Sort: severity first (high → medium → low → ok), then level ascending
        _sev_order = {"high": 0, "medium": 1, "low": 2, None: 3}
        self.battery_list.sort(key=lambda b: (_sev_order[b["severity"]], b["level"]))

        # Fire / clear persistent notifications (unless disabled in config)
        _notif_enabled = True
        try:
            domain_data = self.hass.data.get("config_auditor", {})
            for entry_data in domain_data.values():
                if isinstance(entry_data, dict) and "entry" in entry_data:
                    _notif_enabled = entry_data["entry"].options.get("battery_notifications_enabled", True)
                    break
        except Exception:
            pass
        if _notif_enabled:
            await self._sync_notifications()

        _LOGGER.info(
            "Battery monitor: %d batteries found, %d need attention",
            len(self.battery_list),
            sum(1 for b in self.battery_list if b["severity"] is not None),
        )
        return self.battery_list

    async def _sync_notifications(self) -> None:
        """Create persistent notifications for batteries that need attention."""
        alerted_ids: set[str] = set()

        for bat in self.battery_list:
            if bat["severity"] is None:
                continue

            severity = bat["severity"]
            level    = bat["level"]
            name     = bat["friendly_name"]
            notif_id = NOTIFICATION_ID_PREFIX + bat["entity_id"].replace(".", "_")
            alerted_ids.add(notif_id)

            if severity == "high":
                title   = self._translator.t("battery_critical_title", name=name)
                message = self._translator.t(
                    "battery_critical_message",
                    name=name, level=level, entity_id=bat["entity_id"],
                )
            elif severity == "medium":
                title   = self._translator.t("battery_low_title", name=name)
                message = self._translator.t(
                    "battery_low_message",
                    name=name, level=level, entity_id=bat["entity_id"],
                )
            else:  # low (warning)
                title   = self._translator.t("battery_warning_title", name=name)
                message = self._translator.t(
                    "battery_warning_message",
                    name=name, level=level, entity_id=bat["entity_id"],
                )

            try:
                await self.hass.services.async_call(
                    "persistent_notification",
                    "create",
                    {
                        "notification_id": notif_id,
                        "title":   title,
                        "message": message,
                    },
                    blocking=False,
                )
            except Exception as e:
                _LOGGER.warning("Could not create battery notification for %s: %s", bat["entity_id"], e)

        # Dismiss notifications for batteries that are now OK
        # (We track them by querying existing HACA battery notifications)
        try:
            existing = self.hass.states.async_all()
            for s in existing:
                if s.entity_id.startswith("persistent_notification."):
                    nid = s.attributes.get("notification_id", "")
                    if nid.startswith(NOTIFICATION_ID_PREFIX) and nid not in alerted_ids:
                        await self.hass.services.async_call(
                            "persistent_notification",
                            "dismiss",
                            {"notification_id": nid},
                            blocking=False,
                        )
        except Exception as e:
            _LOGGER.debug("Battery notification cleanup error: %s", e)
