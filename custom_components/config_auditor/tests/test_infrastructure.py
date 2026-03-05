"""Infrastructure & integration tests — v1.1.0.

Covers:
  - health_score importable from both services.py and health_score.py
  - event_monitor: listeners registered, debounce, cleanup
  - models: AuditIssue, ComplexityScore, BatteryEntry importable + CoordinatorData keys
  - VERSION = 1.1.0
"""
from __future__ import annotations

import asyncio
import pytest
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch, AsyncMock

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


# ══════════════════════════════════════════════════════════════════════════════
# VERSION
# ══════════════════════════════════════════════════════════════════════════════

class TestVersion:
    def test_version_is_1_1_0(self):
        from custom_components.config_auditor.const import VERSION
        assert VERSION == "1.1.0", (
            f"Expected VERSION='1.1.0', got '{VERSION}'. "
            "Bump const.py VERSION when making a minor release."
        )

    def test_version_string_format(self):
        from custom_components.config_auditor.const import VERSION
        parts = VERSION.split(".")
        assert len(parts) == 3, f"VERSION must be semantic (X.Y.Z), got '{VERSION}'"
        assert all(p.isdigit() for p in parts)


# ══════════════════════════════════════════════════════════════════════════════
# health_score integration
# ══════════════════════════════════════════════════════════════════════════════

class TestHealthScoreIntegration:
    def test_health_score_importable_from_services(self):
        from custom_components.config_auditor.services import calculate_health_score
        assert callable(calculate_health_score)

    def test_health_score_importable_standalone(self):
        from custom_components.config_auditor.health_score import calculate_health_score
        assert callable(calculate_health_score)

    def test_same_function_both_paths(self):
        from custom_components.config_auditor.health_score import calculate_health_score as hs1
        from custom_components.config_auditor.services import calculate_health_score as hs2
        assert hs1 is hs2


# ══════════════════════════════════════════════════════════════════════════════
# event_monitor
# ══════════════════════════════════════════════════════════════════════════════

class TestEventMonitorSetup:
    def _make_hass_entry(self, monitoring_enabled=True, debounce=0):
        from custom_components.config_auditor.tests.conftest import MockHass
        hass = MockHass()
        hass.bus.async_listen = MagicMock(return_value=lambda: None)
        entry = MagicMock()
        entry.entry_id = "test_entry"
        entry.options = {"event_monitoring_enabled": monitoring_enabled,
                         "event_debounce_seconds": debounce}
        cbs = []
        entry.async_on_unload = lambda cb: cbs.append(cb)
        entry._unload_callbacks = cbs
        return hass, entry

    def test_registers_all_monitored_events(self):
        from custom_components.config_auditor.event_monitor import (
            async_setup_event_monitor, MONITORED_EVENTS,
        )
        hass, entry = self._make_hass_entry()
        async_setup_event_monitor(hass, entry)
        registered = [c[0][0] for c in hass.bus.async_listen.call_args_list]
        for event in MONITORED_EVENTS:
            assert event in registered, f"Missing listener for {event}"

    def test_automation_reloaded_in_monitored_events(self):
        from custom_components.config_auditor.event_monitor import MONITORED_EVENTS
        assert "automation_reloaded" in MONITORED_EVENTS

    def test_script_and_scene_in_monitored_events(self):
        from custom_components.config_auditor.event_monitor import MONITORED_EVENTS
        assert "script_reloaded" in MONITORED_EVENTS
        assert "scene_reloaded" in MONITORED_EVENTS

    def test_entity_registry_updated_in_monitored_events(self):
        from custom_components.config_auditor.event_monitor import MONITORED_EVENTS
        assert "entity_registry_updated" in MONITORED_EVENTS

    def test_unload_callbacks_registered(self):
        from custom_components.config_auditor.event_monitor import (
            async_setup_event_monitor, MONITORED_EVENTS,
        )
        hass, entry = self._make_hass_entry()
        async_setup_event_monitor(hass, entry)
        assert len(entry._unload_callbacks) >= len(MONITORED_EVENTS)

    def test_disabled_monitoring_does_not_crash(self):
        from custom_components.config_auditor.event_monitor import async_setup_event_monitor
        hass, entry = self._make_hass_entry(monitoring_enabled=False)
        async_setup_event_monitor(hass, entry)

    @pytest.mark.asyncio
    async def test_debounce_coalesces_rapid_events(self):
        from custom_components.config_auditor.event_monitor import async_setup_event_monitor
        from custom_components.config_auditor.tests.conftest import MockHass
        hass = MockHass()
        loop = asyncio.get_event_loop()
        hass.loop = loop
        scan_count = 0

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
        hass.bus.async_listen = lambda evt, handler: listeners.update({evt: handler}) or (lambda: None)

        async_setup_event_monitor(hass, entry)

        fake_event = MagicMock()
        for _ in range(5):
            if "automation_reloaded" in listeners:
                listeners["automation_reloaded"](fake_event)

        await asyncio.sleep(0.2)
        assert scan_count <= 1, f"Debounce failed: {scan_count} scans triggered"


# ══════════════════════════════════════════════════════════════════════════════
# models
# ══════════════════════════════════════════════════════════════════════════════

class TestModelsImportIntegration:
    def test_all_models_importable(self):
        from custom_components.config_auditor.models import (
            AuditIssue, ComplexityScore, BatteryEntry,
            IssueDict, GraphNodeDict, GraphEdgeDict, CoordinatorData,
        )
        assert AuditIssue is not None

    def test_coordinator_data_has_required_keys(self):
        from custom_components.config_auditor.models import CoordinatorData
        required = [
            "health_score", "total_issues", "automation_issue_list",
            "battery_list", "dependency_graph", "complexity_scores",
        ]
        ann = CoordinatorData.__annotations__
        for key in required:
            assert key in ann, f"Missing key in CoordinatorData: {key}"


# ══════════════════════════════════════════════════════════════════════════════
# manifest.json consistency
# ══════════════════════════════════════════════════════════════════════════════

class TestManifestConsistency:
    def _load_manifest(self):
        import json
        p = Path(__file__).parent.parent / "manifest.json"
        with open(p, encoding="utf-8") as f:
            return json.load(f)

    def test_manifest_version_matches_const(self):
        from custom_components.config_auditor.const import VERSION
        manifest = self._load_manifest()
        assert manifest["version"] == VERSION, (
            f"manifest.json version {manifest['version']!r} != const.py VERSION {VERSION!r}. "
            "Both must be updated together."
        )

    def test_manifest_has_required_keys(self):
        manifest = self._load_manifest()
        for key in ("domain", "name", "version", "config_flow", "requirements"):
            assert key in manifest, f"Missing key in manifest.json: {key}"

    def test_manifest_domain_is_config_auditor(self):
        manifest = self._load_manifest()
        assert manifest["domain"] == "config_auditor"
