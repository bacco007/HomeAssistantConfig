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
        language = self.hass.data.get("config_auditor", {}).get("user_language") or self.hass.config.language or "en"
        await self._translator.async_load_language(language)

        # Load haca_ignore label (entity + device level)
        from .translation_utils import async_get_haca_ignored_entity_ids
        _ignored = await async_get_haca_ignored_entity_ids(self.hass)

        for state in self.hass.states.async_all():
            entity_id = state.entity_id
            if entity_id in _ignored: continue
            # Match sensor.*battery* — case-insensitive on the slug
            slug = entity_id.lower()
            if not (slug.startswith("sensor.") and "battery" in slug):
                continue
            if state.state in ("unavailable", "unknown", "none", ""):
                continue

            # Skip power sensors (W, kW) — battery_power ≠ battery_level
            unit_raw = state.attributes.get("unit_of_measurement", "")
            device_class = state.attributes.get("device_class", "")
            if unit_raw.strip().lower() in ("w", "kw", "mw") or device_class == "power":
                continue
            # Also skip if entity name contains 'power' but not 'level'
            slug_lower = entity_id.lower()
            if "battery_power" in slug_lower or "_power" in slug_lower:
                if "battery_level" not in slug_lower and "battery_percent" not in slug_lower:
                    continue

            try:
                level = float(state.state)
            except (ValueError, TypeError):
                continue

            # Only accept % unit or no unit — not Watts/kWh etc.
            if unit_raw.strip() and unit_raw.strip() not in ("%", "pct", "percent"):
                continue

            # Filter out spurious values (e.g. 200 % from some integrations)
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

            self.battery_list.append({
                "entity_id":    entity_id,
                "friendly_name": friendly,
                "level":        level,
                "unit":         unit,
                "severity":     severity,       # None = OK
                "state_class":  state.attributes.get("state_class", ""),
                "device_class": state.attributes.get("device_class", "battery"),
            })

        # Sort: severity first (high → medium → low → ok), then level ascending
        _sev_order = {"high": 0, "medium": 1, "low": 2, None: 3}
        self.battery_list.sort(key=lambda b: (_sev_order[b["severity"]], b["level"]))

        # Fire / clear persistent notifications
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
