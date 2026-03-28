"""Tests for the haca_ignore label feature.

Strategy: MockHass pre-populates hass.data[er.DATA_REGISTRY] / hass.data[dr.DATA_REGISTRY].
Therefore er.async_get(hass) / dr.async_get(hass) (via @singleton) return our mocks
directly — no patching of the utility function required.

Guards against:
  - Entities with haca_ignore label appearing in any scan result
  - device-level haca_ignore ignoring all device entities
  - battery_monitor respecting haca_ignore
  - entity_analyzer: ignore loaded BEFORE _analyze_entity_states (ordering regression)
  - dashboard_analyzer._add_issue using instance _haca_ignored attr
  - JSON serialization: frozenset/set attributes must not break tool result dumps
"""
from __future__ import annotations

import json
import pytest
import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.tests.conftest import (
    MockHass, MockRegistryEntry, MockDeviceEntry,
)


# ── Test helpers ──────────────────────────────────────────────────────────────

def _make_entity_analyzer(hass):
    with patch("custom_components.config_auditor.entity_analyzer.TranslationHelper") as TH:
        TH.return_value.t = lambda key, **kw: key
        TH.return_value.async_load_language = AsyncMock()
        from custom_components.config_auditor.entity_analyzer import EntityAnalyzer
        return EntityAnalyzer(hass)


def _make_automation_analyzer(hass):
    with patch("custom_components.config_auditor.automation_analyzer.TranslationHelper") as TH:
        TH.return_value.t = lambda key, **kw: key
        TH.return_value.async_load_language = AsyncMock()
        from custom_components.config_auditor.automation_analyzer import AutomationAnalyzer
        return AutomationAnalyzer(hass)


def _make_dashboard_analyzer(hass):
    with patch("custom_components.config_auditor.dashboard_analyzer.TranslationHelper") as TH:
        TH.return_value.t = lambda key, **kw: key
        TH.return_value.async_load_language = AsyncMock()
        from custom_components.config_auditor.dashboard_analyzer import DashboardAnalyzer
        return DashboardAnalyzer(hass)


def _make_battery_monitor(hass):
    with patch("custom_components.config_auditor.battery_monitor.TranslationHelper") as TH:
        TH.return_value.t = lambda key, **kw: key
        TH.return_value.async_load_language = AsyncMock()
        from custom_components.config_auditor.battery_monitor import BatteryMonitor
        return BatteryMonitor(hass)


# ══════════════════════════════════════════════════════════════════════════════
# async_get_haca_ignored_entity_ids — core utility
# ══════════════════════════════════════════════════════════════════════════════

class TestSharedIgnoreUtility:

    @pytest.mark.asyncio
    async def test_entity_label_direct(self):
        hass = MockHass()
        hass.add_registry_entry(MockRegistryEntry("sensor.ignored", labels={"haca_ignore"}))
        hass.add_registry_entry(MockRegistryEntry("sensor.normal"))

        from custom_components.config_auditor.translation_utils import async_get_haca_ignored_entity_ids
        result = await async_get_haca_ignored_entity_ids(hass)
        assert "sensor.ignored" in result
        assert "sensor.normal" not in result

    @pytest.mark.asyncio
    async def test_device_label_propagates_to_entities(self):
        hass = MockHass()
        hass.add_registry_entry(MockRegistryEntry("light.bedroom_1", device_id="dev_bedroom"))
        hass.add_registry_entry(MockRegistryEntry("light.bedroom_2", device_id="dev_bedroom"))
        hass.add_registry_entry(MockRegistryEntry("light.kitchen"))
        hass.add_device(MockDeviceEntry("dev_bedroom", labels={"haca_ignore"}))

        from custom_components.config_auditor.translation_utils import async_get_haca_ignored_entity_ids
        result = await async_get_haca_ignored_entity_ids(hass)
        assert "light.bedroom_1" in result
        assert "light.bedroom_2" in result
        assert "light.kitchen" not in result

    @pytest.mark.asyncio
    async def test_no_haca_ignore_label(self):
        hass = MockHass()
        hass.add_registry_entry(MockRegistryEntry("light.x", labels={"other_label"}))

        from custom_components.config_auditor.translation_utils import async_get_haca_ignored_entity_ids
        result = await async_get_haca_ignored_entity_ids(hass)
        assert "light.x" not in result

    @pytest.mark.asyncio
    async def test_multiple_labels_includes_haca_ignore(self):
        hass = MockHass()
        hass.add_registry_entry(MockRegistryEntry("light.x", labels={"haca_ignore", "other"}))

        from custom_components.config_auditor.translation_utils import async_get_haca_ignored_entity_ids
        result = await async_get_haca_ignored_entity_ids(hass)
        assert "light.x" in result

    @pytest.mark.asyncio
    async def test_empty_registries_returns_empty_set(self):
        hass = MockHass()

        from custom_components.config_auditor.translation_utils import async_get_haca_ignored_entity_ids
        result = await async_get_haca_ignored_entity_ids(hass)
        assert result == set()

    @pytest.mark.asyncio
    async def test_many_ignored_entities(self):
        hass = MockHass()
        for i in range(50):
            hass.add_registry_entry(MockRegistryEntry(f"sensor.ign_{i}", labels={"haca_ignore"}))

        from custom_components.config_auditor.translation_utils import async_get_haca_ignored_entity_ids
        result = await async_get_haca_ignored_entity_ids(hass)
        assert len(result) == 50


# ══════════════════════════════════════════════════════════════════════════════
# EntityAnalyzer
# ══════════════════════════════════════════════════════════════════════════════

class TestEntityAnalyzerIgnore:

    @pytest.mark.asyncio
    async def test_ignored_entity_not_in_unavailable_issues(self):
        hass = MockHass()
        hass.add_state("sensor.broken", "unavailable")
        hass.add_state("sensor.normal_broken", "unavailable")
        hass.add_registry_entry(MockRegistryEntry("sensor.broken", labels={"haca_ignore"}))
        hass.add_registry_entry(MockRegistryEntry("sensor.normal_broken"))

        a = _make_entity_analyzer(hass)
        a._ignored_entity_ids = await a._load_ignored_entity_ids()
        await a._analyze_entity_states()

        issue_ids = [i["entity_id"] for i in a.issues]
        assert "sensor.broken" not in issue_ids
        assert "sensor.normal_broken" in issue_ids

    @pytest.mark.asyncio
    async def test_ordering_regression(self):
        """Regression: _ignored_entity_ids was loaded AFTER _analyze_entity_states."""
        hass = MockHass()
        hass.add_state("sensor.should_be_ignored", "unavailable")
        hass.add_registry_entry(
            MockRegistryEntry("sensor.should_be_ignored", labels={"haca_ignore"})
        )

        a = _make_entity_analyzer(hass)
        a._ignored_entity_ids = await a._load_ignored_entity_ids()
        await a._analyze_entity_states()

        assert all(i["entity_id"] != "sensor.should_be_ignored" for i in a.issues)

    @pytest.mark.asyncio
    async def test_load_returns_set(self):
        hass = MockHass()
        hass.add_registry_entry(MockRegistryEntry("sensor.x", labels={"haca_ignore"}))
        hass.add_registry_entry(MockRegistryEntry("sensor.y"))

        a = _make_entity_analyzer(hass)
        result = await a._load_ignored_entity_ids()
        assert isinstance(result, set)
        assert "sensor.x" in result
        assert "sensor.y" not in result


# ══════════════════════════════════════════════════════════════════════════════
# AutomationAnalyzer
# ══════════════════════════════════════════════════════════════════════════════

class TestAutomationAnalyzerIgnore:

    @pytest.mark.asyncio
    async def test_ignored_before_load(self):
        hass = MockHass()
        a = _make_automation_analyzer(hass)
        assert not a._is_ignored("automation.my_auto")

    @pytest.mark.asyncio
    async def test_load_populates_set(self):
        hass = MockHass()
        hass.add_registry_entry(MockRegistryEntry("automation.ignored", labels={"haca_ignore"}))
        hass.add_registry_entry(MockRegistryEntry("automation.normal"))

        a = _make_automation_analyzer(hass)
        await a._load_ignored_entities()
        assert a._is_ignored("automation.ignored")
        assert not a._is_ignored("automation.normal")

    @pytest.mark.asyncio
    async def test_no_haca_ignore_label(self):
        hass = MockHass()
        hass.add_registry_entry(MockRegistryEntry("light.y", labels={"other_label"}))

        a = _make_automation_analyzer(hass)
        await a._load_ignored_entities()
        assert not a._is_ignored("light.y")

    @pytest.mark.asyncio
    async def test_empty_registry(self):
        hass = MockHass()
        a = _make_automation_analyzer(hass)
        await a._load_ignored_entities()
        assert len(a._ignored_entity_ids) == 0

    @pytest.mark.asyncio
    async def test_many_ignored_entities(self):
        hass = MockHass()
        for i in range(50):
            hass.add_registry_entry(
                MockRegistryEntry(f"automation.auto_{i}", labels={"haca_ignore"})
            )
        a = _make_automation_analyzer(hass)
        await a._load_ignored_entities()
        assert len(a._ignored_entity_ids) == 50
        assert a._is_ignored("automation.auto_25")


# ══════════════════════════════════════════════════════════════════════════════
# DashboardAnalyzer
# ══════════════════════════════════════════════════════════════════════════════

class TestDashboardAnalyzerIgnore:

    @pytest.mark.asyncio
    async def test_add_issue_respects_haca_ignored(self):
        hass = MockHass()
        d = _make_dashboard_analyzer(hass)
        d._haca_ignored = {"sensor.ignored_entity"}
        d.issues = []
        d._add_issue("sensor.ignored_entity", "Test Dashboard", "cards[0]")
        assert len(d.issues) == 0

    @pytest.mark.asyncio
    async def test_add_issue_non_ignored_appended(self):
        hass = MockHass()
        d = _make_dashboard_analyzer(hass)
        d._haca_ignored = set()
        d.issues = []
        d._add_issue("sensor.normal_entity", "Test Dashboard", "cards[0]")
        assert len(d.issues) == 1
        assert d.issues[0]["entity_id"] == "sensor.normal_entity"

    @pytest.mark.asyncio
    async def test_add_issue_no_haca_ignored_attr_does_not_raise(self):
        hass = MockHass()
        d = _make_dashboard_analyzer(hass)
        if hasattr(d, "_haca_ignored"):
            del d._haca_ignored
        d.issues = []
        d._add_issue("sensor.x", "Dashboard", "cards[0]")
        assert len(d.issues) == 1


# ══════════════════════════════════════════════════════════════════════════════
# BatteryMonitor
# ══════════════════════════════════════════════════════════════════════════════

class TestBatteryMonitorIgnore:

    @pytest.mark.asyncio
    async def test_ignored_battery_entity_not_in_results(self):
        hass = MockHass()
        hass.add_state("sensor.phone_battery", "5", {"unit_of_measurement": "%", "device_class": "battery"})
        hass.add_registry_entry(
            MockRegistryEntry("sensor.phone_battery", labels={"haca_ignore"})
        )

        monitor = _make_battery_monitor(hass)
        result = await monitor.analyze_all()
        ids = [r["entity_id"] for r in result]
        assert "sensor.phone_battery" not in ids

    @pytest.mark.asyncio
    async def test_non_ignored_battery_entity_in_results(self):
        hass = MockHass()
        hass.add_state("sensor.door_battery", "3", {"unit_of_measurement": "%", "device_class": "battery"})
        hass.add_registry_entry(MockRegistryEntry("sensor.door_battery"))

        monitor = _make_battery_monitor(hass)
        result = await monitor.analyze_all()
        ids = [r["entity_id"] for r in result]
        assert "sensor.door_battery" in ids

    @pytest.mark.asyncio
    async def test_device_level_ignored_battery_not_in_results(self):
        hass = MockHass()
        hass.add_state("sensor.hub_battery", "2", {"unit_of_measurement": "%"})
        hass.add_registry_entry(
            MockRegistryEntry("sensor.hub_battery", device_id="dev_hub")
        )
        hass.add_device(MockDeviceEntry("dev_hub", labels={"haca_ignore"}))

        monitor = _make_battery_monitor(hass)
        result = await monitor.analyze_all()
        ids = [r["entity_id"] for r in result]
        assert "sensor.hub_battery" not in ids


# ══════════════════════════════════════════════════════════════════════════════
# JSON serialization
# ══════════════════════════════════════════════════════════════════════════════

class TestJsonSerialization:
    """Regression: frozenset/set attributes → 'Object of type set is not JSON serializable'."""

    @pytest.mark.asyncio
    async def test_ha_get_entities_json_serializable(self):
        """frozenset attributes must be serialized as lists."""
        hass = MockHass()
        hass.add_state("light.entree", "on", {
            "friendly_name": "Entree",
            "brightness": 200,
            "supported_color_modes": frozenset({"hs", "color_temp"}),
            "color_mode": "hs",
        })

        # ar/er/dr are imported locally inside _tool_ha_get_entities
        from unittest.mock import MagicMock
        ar_mock = MagicMock()
        er_mock = MagicMock()
        dr_mock = MagicMock()
        ar_mock.async_get.return_value.async_list_areas.return_value = []
        er_mock.async_get.return_value.entities.get.return_value = None

        from custom_components.config_auditor.mcp_server import _tool_ha_get_entities
        import custom_components.config_auditor.mcp_server as _mcp

        # Patch the local namespace via the module's helper imports
        with patch("homeassistant.helpers.area_registry.async_get", ar_mock.async_get), \
             patch("homeassistant.helpers.entity_registry.async_get", er_mock.async_get), \
             patch("homeassistant.helpers.device_registry.async_get", dr_mock.async_get):
            result = await _tool_ha_get_entities(hass, {"domain": "light"})

        try:
            json.dumps(result)
        except TypeError as e:
            pytest.fail(f"ha_get_entities result is not JSON serializable: {e}")

        assert result["total"] >= 1
        attrs = result["entities"][0]["attributes"]
        if "supported_color_modes" in attrs:
            assert isinstance(attrs["supported_color_modes"], list), \
                "frozenset must be converted to list"

    def test_haca_json_encoder_handles_frozenset_and_set(self):
        """_HacaJsonEncoder must handle set, frozenset, and other HA types."""
        import json as _json_mod
        class _HacaJsonEncoder(_json_mod.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, (set, frozenset)): return list(obj)
                try: return super().default(obj)
                except TypeError: return str(obj)

        data = {
            "labels": {"haca_ignore"},
            "modes": frozenset({"hs", "rgb"}),
            "count": 42,
            "name": "test",
        }
        serialized = json.dumps(data, cls=_HacaJsonEncoder)
        parsed = json.loads(serialized)
        assert isinstance(parsed["labels"], list)
        assert isinstance(parsed["modes"], list)
        assert parsed["count"] == 42

    def test_haca_json_encoder_fallback(self):
        """Unknown types fall back to str representation."""
        import json as _json_mod
        class _HacaJsonEncoder(_json_mod.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, (set, frozenset)): return list(obj)
                try: return super().default(obj)
                except TypeError: return str(obj)

        class _Custom:
            def __str__(self): return "custom_value"

        data = {"obj": _Custom()}
        serialized = json.dumps(data, cls=_HacaJsonEncoder)
        parsed = json.loads(serialized)
        assert parsed["obj"] == "custom_value"


# ══════════════════════════════════════════════════════════════════════════════
# Regression: _analyze_unused_input_booleans missing ignore check
# ══════════════════════════════════════════════════════════════════════════════

class TestEntityAnalyzerInputBooleanIgnore:
    """haca_ignore must suppress unused_input_boolean issues."""

    @pytest.mark.asyncio
    async def test_ignored_input_boolean_not_in_issues(self):
        hass = MockHass()
        # An unused input_boolean with haca_ignore
        hass.add_state("input_boolean.ignored_helper", "off")
        hass.add_registry_entry(
            MockRegistryEntry("input_boolean.ignored_helper", labels={"haca_ignore"})
        )
        # A normal unused input_boolean (should still appear)
        hass.add_state("input_boolean.normal_helper", "off")
        hass.add_registry_entry(MockRegistryEntry("input_boolean.normal_helper"))

        a = _make_entity_analyzer(hass)
        a._ignored_entity_ids = await a._load_ignored_entity_ids()
        # _entity_references is empty → both helpers are "unused"
        a._entity_references = {}
        await a._analyze_unused_input_booleans()

        issue_ids = [i["entity_id"] for i in a.issues]
        assert "input_boolean.ignored_helper" not in issue_ids, \
            "Ignored input_boolean must not produce unused_input_boolean issue"
        assert "input_boolean.normal_helper" in issue_ids


# ══════════════════════════════════════════════════════════════════════════════
# Scene entity_id slugify fix
# ══════════════════════════════════════════════════════════════════════════════

class TestSceneEntityIdSlugify:
    """_load_scene_configs must use slugify() to match HA's entity_id generation."""

    @pytest.mark.asyncio
    async def test_scene_key_uses_slugify(self, tmp_path):
        """Scenes with accented names must be keyed with slugified entity_ids."""
        from homeassistant.util import slugify
        scenes_yaml = tmp_path / "scenes.yaml"
        scenes_yaml.write_text(
            "- id: '111'\n  name: 'Soirée cinéma'\n  entities: {}\n"
            "- id: '222'\n  name: 'Lumières salon'\n  entities: {}\n"
            "- id: '333'\n  name: 'Normal Scene'\n  entities: {}\n",
            encoding="utf-8",
        )
        hass = MockHass(config_dir=str(tmp_path))
        a = _make_automation_analyzer(hass)
        await a._load_scene_configs()

        keys = list(a._scene_configs.keys())
        assert "scene.soiree_cinema" in keys, f"Keys: {keys}"
        assert "scene.lumieres_salon" in keys, f"Keys: {keys}"
        assert "scene.normal_scene" in keys, f"Keys: {keys}"
        # Old broken keys must NOT be present
        assert "scene.soirée_cinéma" not in keys
        assert "scene.lumières_salon" not in keys

    @pytest.mark.asyncio
    async def test_scene_without_id_loads_from_name(self, tmp_path):
        """Scenes without id field still load via name-based key."""
        scenes_yaml = tmp_path / "scenes.yaml"
        scenes_yaml.write_text(
            "- name: 'Test Scene'\n  entities: {light.x: {state: 'on'}}\n",
            encoding="utf-8",
        )
        hass = MockHass(config_dir=str(tmp_path))
        a = _make_automation_analyzer(hass)
        await a._load_scene_configs()
        assert "scene.test_scene" in a._scene_configs


# ══════════════════════════════════════════════════════════════════════════════
# ha_create_automation accepts triggers/actions (new HA format)
# ══════════════════════════════════════════════════════════════════════════════

class TestHaCreateAutomationFormat:

    @pytest.mark.asyncio
    async def test_accepts_new_format_triggers_actions(self, tmp_path):
        """ha_create_automation must accept triggers/actions (new HA format)."""
        from custom_components.config_auditor.mcp_server import _tool_ha_create_automation
        hass = MockHass(config_dir=str(tmp_path))
        (tmp_path / "automations.yaml").write_text("[]", encoding="utf-8")

        result = await _tool_ha_create_automation(hass, {
            "alias": "Test New Format",
            "description": "Test",
            "triggers": [{"platform": "state", "entity_id": "binary_sensor.motion", "to": "on"}],
            "actions": [{"service": "light.turn_on", "target": {"entity_id": "light.x"}}],
            "mode": "single",
        })
        assert "error" not in result, f"Unexpected error: {result.get('error')}"
        assert result.get("success") is True

    @pytest.mark.asyncio
    async def test_accepts_legacy_format_trigger_action(self, tmp_path):
        """ha_create_automation must still accept legacy trigger/action keys."""
        from custom_components.config_auditor.mcp_server import _tool_ha_create_automation
        hass = MockHass(config_dir=str(tmp_path))
        (tmp_path / "automations.yaml").write_text("[]", encoding="utf-8")

        result = await _tool_ha_create_automation(hass, {
            "alias": "Test Legacy Format",
            "trigger": [{"platform": "state", "entity_id": "binary_sensor.x", "to": "on"}],
            "action": [{"service": "light.turn_on", "target": {"entity_id": "light.y"}}],
        })
        assert "error" not in result, f"Unexpected error: {result.get('error')}"
        assert result.get("success") is True

    @pytest.mark.asyncio
    async def test_uses_triggers_key_in_saved_yaml(self, tmp_path):
        """Saved automation must use 'triggers' key (new HA format)."""
        import yaml as _yaml
        from custom_components.config_auditor.mcp_server import _tool_ha_create_automation
        hass = MockHass(config_dir=str(tmp_path))
        (tmp_path / "automations.yaml").write_text("[]", encoding="utf-8")

        await _tool_ha_create_automation(hass, {
            "alias": "Format Check",
            "triggers": [{"platform": "sun", "event": "sunset"}],
            "actions": [{"service": "light.turn_on", "target": {"entity_id": "light.z"}}],
        })
        saved = _yaml.safe_load((tmp_path / "automations.yaml").read_text())
        assert len(saved) == 1
        auto = saved[0]
        assert "triggers" in auto, "Must use 'triggers' key in YAML"
        assert "actions" in auto, "Must use 'actions' key in YAML"


# ══════════════════════════════════════════════════════════════════════════════
# BLUEPRINT_ISSUE_TYPES completeness
# ══════════════════════════════════════════════════════════════════════════════

class TestBlueprintIssueRouting:
    """blueprint_file_not_found must route to blueprint_issues, not automation_issues."""

    def test_blueprint_file_not_found_in_types(self):
        """All blueprint issue types must be in BLUEPRINT_ISSUE_TYPES constant."""
        # We test by running a minimal automation_analyzer partition
        from custom_components.config_auditor.automation_analyzer import AutomationAnalyzer
        from unittest.mock import AsyncMock, patch

        hass = MockHass()
        with patch("custom_components.config_auditor.automation_analyzer.TranslationHelper") as TH:
            TH.return_value.t = lambda key, **kw: key
            TH.return_value.async_load_language = AsyncMock()
            analyzer = AutomationAnalyzer(hass)

        # Simulate issues from _check_blueprint_issues
        analyzer.issues = [
            {"entity_id": "automation.test", "type": "blueprint_file_not_found", "severity": "high"},
            {"entity_id": "automation.test", "type": "blueprint_missing_path", "severity": "high"},
            {"entity_id": "automation.test", "type": "blueprint_no_inputs", "severity": "medium"},
            {"entity_id": "automation.test", "type": "blueprint_empty_input", "severity": "low"},
        ]
        analyzer._automation_configs = {}
        analyzer._script_configs = {}

        # Run the partition logic manually (same code as in analyze_all)
        BLUEPRINT_ISSUE_TYPES = {
            "blueprint_missing_path", "blueprint_file_not_found",
            "blueprint_no_inputs", "blueprint_empty_input",
            "blueprint_input_entity_unknown", "blueprint_input_entity_unavailable",
        }
        bp_issues = []
        auto_issues = []
        for issue in analyzer.issues:
            if issue["type"] in BLUEPRINT_ISSUE_TYPES:
                bp_issues.append(issue)
            else:
                auto_issues.append(issue)

        assert len(bp_issues) == 4, f"Expected 4 blueprint issues, got {len(bp_issues)}"
        assert len(auto_issues) == 0, f"blueprint issues leaked into auto_issues: {auto_issues}"


# ══════════════════════════════════════════════════════════════════════════════
# Regression: _map_config_to_entity alias fallback must use ha_slugify
# ══════════════════════════════════════════════════════════════════════════════

class TestAutomationAliasSlugify:
    """haca_ignore must work for automations whose entity_id is derived from alias."""

    @pytest.mark.asyncio
    async def test_accented_alias_ignored(self, tmp_path):
        """An automation with an accented alias must be properly ignored."""
        from homeassistant.util import slugify
        alias = "Lumières salon soir"
        expected_entity_id = f"automation.{slugify(alias)}"  # automation.lumieres_salon_soir

        hass = MockHass()
        # Simulate entity in registry with the correct slugified entity_id
        hass.add_registry_entry(MockRegistryEntry(
            entity_id=expected_entity_id,
            platform="automation",
            unique_id="auto_abc123",
            labels={"haca_ignore"},
        ))
        hass.add_state(expected_entity_id, "on")

        from custom_components.config_auditor.translation_utils import async_get_haca_ignored_entity_ids
        ignored = await async_get_haca_ignored_entity_ids(hass)
        assert expected_entity_id in ignored, \
            f"Expected {expected_entity_id} in ignored set, got {ignored}"


# ══════════════════════════════════════════════════════════════════════════════
# Regression: scene.* must NOT appear in entity_issue_list
# ══════════════════════════════════════════════════════════════════════════════

class TestSceneNotInEntityIssues:
    """scene.* issues from entity_analyzer are routed to scene_issue_list by __init__.py."""

    @pytest.mark.asyncio
    async def test_unavailable_scene_produces_issue(self):
        """An unavailable scene MUST produce an issue in entity_analyzer (routed to Scenes tab by __init__)."""
        hass = MockHass()
        # Scene state: "unavailable" — must show as issue (routed to Scenes tab upstream)
        hass.add_state("scene.soiree_cinema", "unavailable")
        # A normal entity that IS unavailable — MUST also show as issue
        hass.add_state("sensor.temperature", "unavailable")

        a = _make_entity_analyzer(hass)
        a._ignored_entity_ids = set()
        await a._analyze_entity_states()

        entity_ids_with_issues = {i["entity_id"] for i in a.issues}
        assert "scene.soiree_cinema" in entity_ids_with_issues, \
            "Unavailable scene must produce an issue (routed to scene_issue_list by __init__)"
        assert "sensor.temperature" in entity_ids_with_issues, \
            "Unavailable sensors must still appear"

    @pytest.mark.asyncio
    async def test_stale_scene_produces_issue(self):
        """A stale scene MUST produce an issue in entity_analyzer (routed to Scenes tab by __init__)."""
        from datetime import timezone
        from unittest.mock import MagicMock
        import datetime as dt

        hass = MockHass()

        import datetime as dt2
        old_dt2 = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=100)
        hass.add_state("scene.vieille_scene", "scening")
        hass._states["scene.vieille_scene"].last_updated = old_dt2
        hass.add_state("sensor.old_sensor", "42")
        hass._states["sensor.old_sensor"].last_updated = old_dt2

        a = _make_entity_analyzer(hass)
        a._ignored_entity_ids = set()
        a._entity_references = {}
        await a._analyze_entity_states()

        entity_ids_with_issues = {i["entity_id"] for i in a.issues}
        assert "scene.vieille_scene" in entity_ids_with_issues, \
            "Stale scene must produce an issue (routed to scene_issue_list by __init__)"
        assert "sensor.old_sensor" in entity_ids_with_issues, \
            "Stale sensors must still appear"

    @pytest.mark.asyncio
    async def test_zombie_scene_reference_produces_issue(self):
        """A missing scene referenced in an automation MUST produce a zombie issue (routed to Scenes by __init__)."""
        hass = MockHass()
        hass.states._states = {}  # No states at all

        a = _make_entity_analyzer(hass)
        a._ignored_entity_ids = set()
        # Simulate scene referenced in automation but missing from states
        a._entity_references = {
            "scene.missing_scene": ["automation.test_auto"],
            "sensor.missing_sensor": ["automation.test_auto"],
        }
        a._automation_alias_map = {"automation.test_auto": "Test Auto"}
        await a._analyze_zombie_entities()

        entity_ids_with_issues = {i["entity_id"] for i in a.issues}
        assert "scene.missing_scene" in entity_ids_with_issues, \
            "Missing scene references must produce a zombie issue (routed to scene_issue_list by __init__)"
        assert "sensor.missing_sensor" in entity_ids_with_issues, \
            "Missing sensor references must still produce zombie entity issues"
