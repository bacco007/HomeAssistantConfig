"""H.A.C.A — Dashboard Analyzer.

Parses all Lovelace dashboards and detects entity references that no longer
exist in Home Assistant.

Strategy for entity extraction:
- Explicit known keys: entity, entities[], entity_id, camera_image, camera_entity
- Generic scan: any string VALUE in a card dict that matches the HA entity_id
  pattern (domain.name), covering custom card attributes like detailEntity,
  rainChanceEntity, alertEntity, etc.
"""
from __future__ import annotations

import asyncio
import json
import logging
import re
from pathlib import Path
from typing import Any

import yaml

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
# Note: entity_registry intentionally NOT used here.
# Lovelace shows "Entity not found" when the entity has no state in hass.states,
# regardless of whether it exists in the registry (disabled, ghost entries, etc.).

from .translation_utils import TranslationHelper
_LOGGER = logging.getLogger(__name__)

# Keys whose string value is directly an entity_id
_DIRECT_ENTITY_KEYS = {
    "entity",
    "entity_id",
    "camera_image",
    "camera_entity",
}

# Keys that hold a list of entity refs (string or {entity: ...} dict)
_LIST_ENTITY_KEYS = {
    "entities",
}

# Keys whose values are NOT entity_ids even if they look like one
_SKIP_KEYS = {
    "type", "icon", "name", "title", "theme", "style", "class",
    "id", "color", "unit", "unit_of_measurement", "attribute",
    "tap_action", "hold_action", "double_tap_action",
    "state_color", "show_name", "show_icon", "show_state",
    "layout", "mode", "path", "url", "target", "service",
    "forecast_type", "graph", "detail", "columns", "square",
    "hvac_modes", "features",
}

# Regex: matches HA entity_id  domain.object_id  (both parts ≥ 2 chars, lowercase+digits+_)
_ENTITY_RE = re.compile(r"^[a-z][a-z0-9_]+\.[a-z0-9][a-z0-9_]+$")


def _looks_like_entity(value: str) -> bool:
    """Return True if the string matches HA entity_id pattern."""
    return bool(_ENTITY_RE.match(value))


class DashboardAnalyzer:

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.issues: list[dict[str, Any]] = []
        self._translator = TranslationHelper(hass)

    # ── Public API ────────────────────────────────────────────────────────

    async def analyze_all(self) -> list[dict[str, Any]]:
        self.issues = []
        language = self.hass.data.get("config_auditor", {}).get("user_language") or self.hass.config.language or "en"
        await self._translator.async_load_language(language)
        # Load haca_ignore label (store as instance attr so _add_issue can access it)
        self._haca_ignored = set()
        try:
            for entry in er.async_get(self.hass).entities.values():
                if "haca_ignore" in entry.labels: self._haca_ignored.add(entry.entity_id)
        except Exception: pass

        known = await self._build_known_entities()
        _LOGGER.warning(
            "[HACA Dashboard] analyze_all() START — %d known entities", len(known)
        )

        dashboards = await self._load_all_dashboards()
        _LOGGER.warning(
            "[HACA Dashboard] Dashboards loaded: %d — %s",
            len(dashboards), list(dashboards.keys()),
        )

        for title, (config, url_path) in dashboards.items():
            await asyncio.sleep(0)
            if not isinstance(config, dict):
                continue

            views = config.get("views", [])
            _LOGGER.warning(
                "[HACA Dashboard] '%s' (url_path='%s'): %d view(s)", title, url_path,
                len(views) if isinstance(views, list) else 0,
            )

            refs = self._extract_entity_refs(config, title)
            _LOGGER.warning(
                "[HACA Dashboard] '%s': %d entity refs extracted — %s",
                title, len(refs),
                list({r[0] for r in refs})[:20],
            )

            missing = []
            for entity_id, card_path in refs:
                if entity_id not in known:
                    missing.append((entity_id, card_path))
                    self._add_issue(entity_id, title, card_path, url_path)

            _LOGGER.warning(
                "[HACA Dashboard] '%s': %d missing — %s",
                title, len(missing), missing[:10],
            )

        _LOGGER.warning(
            "[HACA Dashboard] analyze_all() END — %d total issue(s)", len(self.issues)
        )
        return self.issues

    # ── Known entities ────────────────────────────────────────────────────

    async def _build_known_entities(self) -> set[str]:
        """Return entity_ids that have an active state in HA.

        Intentionally excludes the entity registry: Lovelace shows
        "Entity not found" when hass.states has no entry, even if the
        entity exists in the registry (disabled, ghost, orphaned device).
        Using states-only matches exactly what the Lovelace UI sees.
        """
        known = {s.entity_id for s in self.hass.states.async_all()}
        _LOGGER.warning("[HACA Dashboard] Known entities (states only): %d", len(known))
        return known

    # ── Dashboard loading ─────────────────────────────────────────────────

    async def _load_all_dashboards(self) -> dict[str, tuple[dict, str]]:
        """Return {title: (config, url_path)} for all dashboards.

        url_path is the HA path used to navigate to the dashboard,
        e.g. 'lovelace' for the default, 'dashboard_jm' for extras.
        """
        dashboards: dict[str, tuple[dict, str]] = {}

        storage_dir = Path(self.hass.config.config_dir) / ".storage"
        _LOGGER.warning("[HACA Dashboard] Config dir: %s", self.hass.config.config_dir)

        storage_results = await self.hass.async_add_executor_job(
            self._read_storage_dashboards, storage_dir
        )
        _LOGGER.warning(
            "[HACA Dashboard] Storage results: %d — %s",
            len(storage_results), list(storage_results.keys()),
        )
        dashboards.update(storage_results)

        # HA API — always try, to catch dashboards not in .storage
        try:
            api_results = await self._load_via_ha_api()
            for k, v in api_results.items():
                if k not in dashboards:
                    dashboards[k] = v
                    _LOGGER.warning("[HACA Dashboard] Extra from API: '%s'", k)
        except Exception as exc:
            _LOGGER.warning("[HACA Dashboard] HA API failed: %s", exc)

        yaml_results = await self.hass.async_add_executor_job(self._find_yaml_dashboards)
        _LOGGER.warning(
            "[HACA Dashboard] YAML results: %d — %s",
            len(yaml_results), list(yaml_results.keys()),
        )
        dashboards.update(yaml_results)

        return dashboards

    def _read_storage_dashboards(self, storage_dir: Path) -> dict[str, dict]:
        result: dict[str, dict] = {}
        if not storage_dir.exists():
            _LOGGER.warning("[HACA Dashboard] .storage dir not found: %s", storage_dir)
            return result

        lovelace_files = [
            p for p in storage_dir.iterdir()
            if p.name == "lovelace" or p.name.startswith("lovelace.")
        ]
        _LOGGER.warning(
            "[HACA Dashboard] Lovelace files in .storage: %s",
            [p.name for p in lovelace_files],
        )

        for path in lovelace_files:
            try:
                with open(path, encoding="utf-8") as f:
                    raw = json.load(f)

                # Format: {"data": {"config": {views: [...]}}}
                data_section = raw.get("data", {})
                config = data_section.get("config") if isinstance(data_section, dict) else None

                # Some HA versions store config directly in data
                if not isinstance(config, dict) and isinstance(data_section, dict) and "views" in data_section:
                    config = data_section
                    _LOGGER.warning("[HACA Dashboard] %s: using data directly (has 'views')", path.name)

                if not isinstance(config, dict):
                    _LOGGER.warning(
                        "[HACA Dashboard] %s: data.config=%s — skipping",
                        path.name, type(config).__name__,
                    )
                    continue

                views = config.get("views", [])
                if not isinstance(views, list) or not views:
                    _LOGGER.warning("[HACA Dashboard] %s: no views — skipping", path.name)
                    continue

                title = config.get("title") or path.name
                # url_path: "lovelace" for default, "dashboard_jm" for lovelace.dashboard_jm
                url_path = path.name[len("lovelace."):] if path.name.startswith("lovelace.") else "lovelace"
                result[str(title)] = (config, url_path)
                _LOGGER.warning(
                    "[HACA Dashboard] Loaded '%s' from %s (%d views) url_path='%s'",
                    title, path.name, len(views), url_path,
                )

            except Exception as exc:
                _LOGGER.warning("[HACA Dashboard] Failed to parse %s: %s", path, exc)

        return result

    async def _load_via_ha_api(self) -> dict[str, dict]:
        result: dict[str, dict] = {}
        lovelace_data = self.hass.data.get("lovelace", {})
        if not isinstance(lovelace_data, dict):
            return result
        for url_path, obj in lovelace_data.get("dashboards", {}).items():
            try:
                config = await obj.async_load(False)
                if isinstance(config, dict):
                    title = config.get("title") or url_path or "default"
                    result[str(title)] = (config, url_path or "lovelace")
            except Exception as exc:
                _LOGGER.warning("[HACA Dashboard] API load failed for '%s': %s", url_path, exc)
        return result

    def _find_yaml_dashboards(self) -> dict[str, dict]:
        result: dict[str, dict] = {}
        config_dir = Path(self.hass.config.config_dir)
        for candidate in ("ui-lovelace.yaml", "lovelace.yaml"):
            path = config_dir / candidate
            if path.exists():
                cfg = self._safe_load_yaml(path)
                if isinstance(cfg, dict):
                    result[candidate] = (cfg, "lovelace")
        return result

    def _safe_load_yaml(self, path: Path) -> dict | None:
        try:
            with open(path, encoding="utf-8") as f:
                c = yaml.safe_load(f)
            return c if isinstance(c, dict) else None
        except Exception:
            return None

    # ── Entity extraction ─────────────────────────────────────────────────

    def _extract_entity_refs(self, config: dict, dashboard_title: str) -> list[tuple[str, str]]:
        refs: list[tuple[str, str]] = []
        for view_idx, view in enumerate(config.get("views", [])):
            if not isinstance(view, dict):
                continue
            view_label = view.get("title") or view.get("path") or f"vue_{view_idx}"

            # Legacy layout: view → cards[]
            cards = view.get("cards", [])
            if isinstance(cards, list) and cards:
                self._walk_cards(cards, str(view_label), refs)

            # 2024 sections layout: view → sections[] → cards[]
            for sec_idx, section in enumerate(view.get("sections", [])):
                if not isinstance(section, dict):
                    continue
                sec_label = section.get("title") or f"section_{sec_idx}"
                sec_cards = section.get("cards", [])
                if isinstance(sec_cards, list):
                    self._walk_cards(sec_cards, f"{view_label} › {sec_label}", refs)

        return refs

    def _walk_cards(self, cards: list, path: str, refs: list[tuple[str, str]]) -> None:
        for card_idx, card in enumerate(cards):
            if not isinstance(card, dict):
                continue
            card_type = card.get("type", "unknown")
            card_path = f"{path} › {card_type}[{card_idx}]"

            self._extract_from_card(card, card_path, refs)

            # Recurse into nested card lists
            for nest_key in ("cards", "elements"):
                nested = card.get(nest_key)
                if isinstance(nested, list):
                    self._walk_cards(nested, card_path, refs)

            # Single nested card (conditional etc.)
            inner = card.get("card")
            if isinstance(inner, dict):
                self._walk_cards([inner], card_path, refs)

            # Nested sections inside card
            for sec_idx, section in enumerate(card.get("sections", []) or []):
                if not isinstance(section, dict):
                    continue
                sec_cards = section.get("cards", [])
                if isinstance(sec_cards, list):
                    self._walk_cards(sec_cards, f"{card_path} › section_{sec_idx}", refs)

    def _extract_from_card(
        self, card: dict, card_path: str, refs: list[tuple[str, str]]
    ) -> None:
        """Extract all entity refs from a single card dict.

        Two strategies:
        1. Explicit known keys (entity, entities, entity_id, camera_*)
        2. Generic scan: any string value matching domain.object_id pattern,
           covering custom card attributes (detailEntity, rainChanceEntity…)
        3. Jinja2 template scan: extract entity_ids from {{ states('...') }},
           {{ state_attr('...') }}, is_state('...'), etc. inside string values
           for keys like content, title, body, label, secondary.
        """
        import re as _re

        # Jinja2 functions that take entity_id as first arg
        _JINJA_ENTITY_RE = _re.compile(
            r"""(?:states|state_attr|is_state|is_state_attr|states\.)\s*\(\s*['"]([a-z_]+\.[a-z0-9_]+)['"]""",
            _re.IGNORECASE,
        )
        # Keys whose string values may contain Jinja2 templates
        _TEMPLATE_KEYS = {
            "content", "title", "body", "label", "secondary", "subheader",
            "message", "attribute", "value_template", "tap_action",
        }

        for key, val in card.items():
            if key in _SKIP_KEYS:
                continue

            # ── Explicit list keys: entities: ["eid"] or [{entity: "eid"}] ──
            if key in _LIST_ENTITY_KEYS:
                if isinstance(val, list):
                    for item in val:
                        if isinstance(item, str) and _looks_like_entity(item):
                            refs.append((item, card_path))
                        elif isinstance(item, dict):
                            eid = item.get("entity") or item.get("entity_id")
                            if isinstance(eid, str) and _looks_like_entity(eid):
                                refs.append((eid, card_path))
                continue

            # ── Explicit direct keys: entity, entity_id, camera_* ────────
            if key in _DIRECT_ENTITY_KEYS:
                if isinstance(val, str) and _looks_like_entity(val):
                    refs.append((val, card_path))
                continue

            # ── Jinja2 template scan ──────────────────────────────────────
            if isinstance(val, str) and "{{" in val and key in _TEMPLATE_KEYS:
                for match in _JINJA_ENTITY_RE.finditer(val):
                    eid = match.group(1)
                    if _looks_like_entity(eid):
                        refs.append((eid, f"{card_path}[template:{key}]"))
                continue

            # ── Generic scan: any other string value that looks like entity_id
            if isinstance(val, str) and _looks_like_entity(val):
                refs.append((val, card_path))

    # ── Issue creation ────────────────────────────────────────────────────

    def _add_issue(self, entity_id: str, dashboard_title: str, card_path: str, url_path: str = "lovelace") -> None:
        # Build the HA navigation URL for this dashboard
        # Default dashboard: /lovelace/0  |  Extra: /dashboard_jm/0
        dashboard_url = f"/{url_path}/0"

        for existing in self.issues:
            if existing.get("entity_id") == entity_id and existing.get("source_name") == dashboard_title:
                locs = existing.get("locations", [])
                if card_path not in locs:
                    locs.append(card_path)
                existing["locations"] = locs
                existing["message"] = self._translator.t("dashboard_referenced_in_n_cards", count=len(locs))
                return

        if entity_id in getattr(self, "_haca_ignored", set()):
            return
        self.issues.append({
            "entity_id":      entity_id,
            "alias":          entity_id,
            "type":           "dashboard_missing_entity",
            "severity":       "high",
            "message":        self._translator.t("dashboard_referenced_in_1_card"),
            "recommendation": self._translator.t("dashboard_edit_fix_reference"),
            "location":       card_path,
            "locations":      [card_path],
            "source_name":    dashboard_title,
            "dashboard":      dashboard_title,
            "dashboard_url":  dashboard_url,
            "fix_available":  False,
        })
