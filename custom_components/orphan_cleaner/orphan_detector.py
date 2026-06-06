"""
Orphan entity detection logic.
"""
from __future__ import annotations

import fnmatch
import time
import logging
from dataclasses import dataclass, asdict
from datetime import datetime, timezone

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .const import MANUAL_PLATFORMS

_LOGGER = logging.getLogger(__name__)

ALWAYS_UNAVAILABLE_PLATFORMS = {
    "template", "group", "universal", "input_boolean",
}

CORE_PLATFORMS = {
    "homeassistant", "persistent_notification", "recorder",
    "frontend", "history", "logbook", "system_log", "mobile_app",
} | MANUAL_PLATFORMS

FAILED_STATES = {
    ConfigEntryState.NOT_LOADED,
    ConfigEntryState.SETUP_ERROR,
    ConfigEntryState.SETUP_RETRY,
    ConfigEntryState.FAILED_UNLOAD,
    ConfigEntryState.MIGRATION_ERROR,
}


@dataclass
class OrphanInfo:
    entity_id:   str
    platform:    str
    method:      str
    age_hours:   float | None
    disabled_by: str | None
    state:       str | None = None

    def as_dict(self) -> dict:
        return asdict(self)


def detect_orphans(
    hass: HomeAssistant,
    min_age_hours: int = 24,
    aggressive: bool = False,
    ignore_platforms: set[str] | None = None,
    ignore_globs: list[str] | None = None,
) -> list[OrphanInfo]:

    entity_registry  = er.async_get(hass)
    now              = time.time()
    orphans: list[OrphanInfo] = []
    seen: set[str]   = set()
    _ignore          = ignore_platforms or set()
    _globs           = ignore_globs or []

    def _is_ignored(entity_id: str, platform: str) -> bool:
        if platform and platform in _ignore:
            return True
        for pattern in _globs:
            if (fnmatch.fnmatch(entity_id, pattern)
                    or fnmatch.fnmatch(platform, pattern)
                    or platform == pattern):
                return True
        return False

    for entry in entity_registry.entities.values():
        platform     = entry.platform or ""
        cfg_entry_id = entry.config_entry_id

        # Skip platforms/globs the user wants to ignore
        if _is_ignored(entry.entity_id, platform):
            continue

        # Method 1: orphaned_timestamp
        ts = getattr(entry, "orphaned_timestamp", None)
        if ts is not None:
            age_h = (now - ts) / 3600
            if age_h >= min_age_hours:
                orphans.append(OrphanInfo(
                    entity_id=entry.entity_id, platform=platform or "—",
                    method="timestamp", age_hours=round(age_h, 1),
                    disabled_by=entry.disabled_by, state="orphaned",
                ))
                seen.add(entry.entity_id)
            continue

        # Method 2: dead or failed config entry
        if cfg_entry_id:
            cfg_obj = hass.config_entries.async_get_entry(cfg_entry_id)
            if cfg_obj is None or cfg_obj.state in FAILED_STATES:
                orphans.append(OrphanInfo(
                    entity_id=entry.entity_id, platform=platform or "—",
                    method="dead_entry", age_hours=None,
                    disabled_by=entry.disabled_by,
                ))
                seen.add(entry.entity_id)
                continue

        # Method 3: unavailable state
        if platform not in ALWAYS_UNAVAILABLE_PLATFORMS and entry.disabled_by is None:
            state_obj = hass.states.get(entry.entity_id)
            if state_obj and state_obj.state == "unavailable":
                mod = getattr(entry, "modified_at", None) or getattr(entry, "created_at", None)
                age_h = (datetime.now(timezone.utc) - mod).total_seconds() / 3600 if mod else 0
                if age_h >= min_age_hours:
                    orphans.append(OrphanInfo(
                        entity_id=entry.entity_id, platform=platform or "—",
                        method="unavailable", age_hours=round(age_h, 1),
                        disabled_by=entry.disabled_by, state="unavailable",
                    ))
                    seen.add(entry.entity_id)
                    continue

        # Method 4: heuristic
        if aggressive and not cfg_entry_id and platform and platform not in MANUAL_PLATFORMS:
            if entry.entity_id not in seen:
                orphans.append(OrphanInfo(
                    entity_id=entry.entity_id, platform=platform,
                    method="heuristic", age_hours=None,
                    disabled_by=entry.disabled_by,
                ))

    _LOGGER.info(
        "Scan: %d total, %d orphans (ts:%d dead:%d unavail:%d heuristic:%d)",
        len(entity_registry.entities), len(orphans),
        sum(1 for o in orphans if o.method == "timestamp"),
        sum(1 for o in orphans if o.method == "dead_entry"),
        sum(1 for o in orphans if o.method == "unavailable"),
        sum(1 for o in orphans if o.method == "heuristic"),
    )
    return orphans


async def async_delete_entities(
    hass: HomeAssistant,
    entity_ids: list[str],
) -> tuple[list[str], list[str]]:
    registry = er.async_get(hass)
    deleted: list[str] = []
    failed:  list[str] = []
    for eid in entity_ids:
        entry = registry.async_get(eid)
        if entry is None:
            failed.append(eid)
            continue
        try:
            registry.async_remove(eid)
            deleted.append(eid)
        except Exception as exc:
            _LOGGER.error("Error deleting %s: %s", eid, exc)
            failed.append(eid)
    return deleted, failed
