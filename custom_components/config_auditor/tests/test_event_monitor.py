"""Regression tests for event_monitor.py — v1.1.2."""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.tests.conftest import MockHass


def _make_entry(options=None):
    entry = MagicMock()
    entry.options = options or {}
    cbs = []
    entry.async_on_unload = lambda cb: cbs.append(cb)
    entry._unload_callbacks = cbs
    return entry


class TestEventMonitorSetup:
    def test_exposes_async_setup_event_monitor(self):
        from custom_components.config_auditor.event_monitor import async_setup_event_monitor
        assert callable(async_setup_event_monitor)

    def test_automation_reloaded_monitored(self):
        from custom_components.config_auditor.event_monitor import MONITORED_EVENTS
        assert "automation_reloaded" in MONITORED_EVENTS

    def test_script_and_scene_monitored(self):
        from custom_components.config_auditor.event_monitor import MONITORED_EVENTS
        assert "script_reloaded" in MONITORED_EVENTS
        assert "scene_reloaded" in MONITORED_EVENTS

    def test_entity_registry_updated_monitored(self):
        from custom_components.config_auditor.event_monitor import MONITORED_EVENTS
        assert "entity_registry_updated" in MONITORED_EVENTS


class TestEventMonitorListeners:
    def test_registers_listener_per_monitored_event(self):
        from custom_components.config_auditor.event_monitor import (
            MONITORED_EVENTS, async_setup_event_monitor,
        )
        hass = MockHass()
        registered = []
        hass.bus.async_listen = lambda evt, h: registered.append(evt) or (lambda: None)
        async_setup_event_monitor(hass, _make_entry({"event_monitoring_enabled": True}))
        for event in MONITORED_EVENTS:
            assert event in registered

    def test_unsubscribe_registered_on_unload(self):
        from custom_components.config_auditor.event_monitor import async_setup_event_monitor
        hass = MockHass()
        hass.bus.async_listen = MagicMock(return_value=lambda: None)
        entry = _make_entry()
        async_setup_event_monitor(hass, entry)
        assert len(entry._unload_callbacks) >= 1

    def test_disabled_monitoring_does_not_crash(self):
        from custom_components.config_auditor.event_monitor import async_setup_event_monitor
        hass = MockHass()
        hass.bus.async_listen = MagicMock(return_value=lambda: None)
        async_setup_event_monitor(hass, _make_entry({"event_monitoring_enabled": False}))


class TestDebounce:
    @pytest.mark.asyncio
    async def test_multiple_events_trigger_single_scan(self):
        from custom_components.config_auditor.event_monitor import async_setup_event_monitor
        hass = MockHass()
        scan_count = 0
        loop = asyncio.get_event_loop()
        hass.loop = loop

        coord = MagicMock()
        async def mock_refresh():
            nonlocal scan_count
            scan_count += 1
        coord.async_refresh = mock_refresh

        entry = MagicMock()
        entry.entry_id = "test_entry"
        entry.options = {"event_debounce_seconds": 0.05}
        entry.async_on_unload = lambda cb: None
        hass.data["config_auditor"] = {"test_entry": {"coordinator": coord}}

        listeners = {}
        hass.bus.async_listen = lambda evt, h: listeners.update({evt: h}) or (lambda: None)

        async_setup_event_monitor(hass, entry)

        for _ in range(5):
            if "automation_reloaded" in listeners:
                listeners["automation_reloaded"](MagicMock())

        await asyncio.sleep(0.2)
        assert scan_count <= 1, f"Debounce failed: {scan_count} scans"
