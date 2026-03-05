"""Event-based monitoring for H.A.C.A (Module 10).

Listens to Home Assistant registry events and triggers a debounced
coordinator refresh so issues are detected within seconds, not waiting
for the next scheduled periodic scan.

Extracted from __init__.py for readability and testability.

Monitored events
----------------
- entity_registry_updated  — entity added, removed, renamed, disabled
- device_registry_updated  — device added/removed
- automation_reloaded      — automation saved/reloaded in UI
- script_reloaded          — script saved/reloaded
- scene_reloaded           — scene saved/reloaded
- config_entry_loaded      — integration added
- config_entry_unloaded    — integration removed
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN, DEFAULT_EVENT_DEBOUNCE_SECONDS

_LOGGER = logging.getLogger(__name__)

MONITORED_EVENTS = [
    "entity_registry_updated",
    "device_registry_updated",
    "automation_reloaded",
    "script_reloaded",
    "scene_reloaded",
    "config_entry_loaded",
    "config_entry_unloaded",
]


def async_setup_event_monitor(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> None:
    """Register event listeners that trigger a debounced coordinator refresh.

    All unsubscribe callbacks are registered via ``entry.async_on_unload``
    so they are cleaned up automatically when the entry is unloaded.
    """
    monitoring_enabled: bool = entry.options.get("event_monitoring_enabled", True)
    debounce_seconds: int = int(
        entry.options.get("event_debounce_seconds", DEFAULT_EVENT_DEBOUNCE_SECONDS)
    )

    _pending_scan_handle: asyncio.TimerHandle | None = None

    @callback
    def _schedule_debounced_scan(event_name: str, event=None) -> None:
        """Cancel any pending scan and schedule a new one after debounce_seconds."""
        nonlocal _pending_scan_handle

        if not monitoring_enabled:
            return

        if _pending_scan_handle is not None:
            _pending_scan_handle.cancel()
            _pending_scan_handle = None

        _LOGGER.debug(
            "[HACA Monitor] Event '%s' received — debounced scan in %ds",
            event_name, debounce_seconds,
        )

        def _fire_scan() -> None:
            nonlocal _pending_scan_handle
            _pending_scan_handle = None
            domain_data = hass.data.get(DOMAIN, {}).get(entry.entry_id, {})
            coord = domain_data.get("coordinator")
            if coord:
                _LOGGER.info(
                    "[HACA Monitor] Debounced scan triggered by event '%s'", event_name
                )
                hass.async_create_task(coord.async_refresh())

        _pending_scan_handle = hass.loop.call_later(debounce_seconds, _fire_scan)

    # Register one listener per monitored event
    for _event_name in MONITORED_EVENTS:
        def _make_handler(name: str):
            @callback
            def _handler(event) -> None:
                _schedule_debounced_scan(name, event)
            return _handler

        entry.async_on_unload(
            hass.bus.async_listen(_event_name, _make_handler(_event_name))
        )

    @callback
    def _cancel_pending_scan() -> None:
        nonlocal _pending_scan_handle
        if _pending_scan_handle is not None:
            _pending_scan_handle.cancel()
            _pending_scan_handle = None
            _LOGGER.debug("[HACA Monitor] Pending debounced scan cancelled (unload)")

    entry.async_on_unload(_cancel_pending_scan)

    if monitoring_enabled:
        _LOGGER.info(
            "[HACA Monitor] Event-based monitoring enabled — debounce %ds, watching: %s",
            debounce_seconds, ", ".join(MONITORED_EVENTS),
        )
    else:
        _LOGGER.info("[HACA Monitor] Event-based monitoring disabled in options")
