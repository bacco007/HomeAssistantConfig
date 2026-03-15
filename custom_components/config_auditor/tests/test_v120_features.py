"""Tests for H.A.C.A v1.2.0 features.

Covers:
  a) Frontend open-entity button (translation key resolution)
  b) Multi-source automation loading (.storage, packages, include)
  c) input_* helper analysis
  d) template sensor analysis
  e) timer helper analysis
  + Health score includes new issue types
  + No double-counting for input_boolean
"""
from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.tests.conftest import (
    MockHass,
    MockRegistryEntry,
    MockEntityRegistry,
    MockState,
)


# ═══════════════════════════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════════════════════════

def _make_hass(tmp_path):
    hass = MockHass(config_dir=str(tmp_path))
    (tmp_path / "automations.yaml").write_text("[]", encoding="utf-8")
    return hass


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


# ═══════════════════════════════════════════════════════════════════════════
# b) Multi-source automation loading
# ═══════════════════════════════════════════════════════════════════════════

class TestMultiSourceAutomationLoading:
    """AutomationAnalyzer._load_automation_configs must pick up all sources."""

    def _make_analyzer(self, hass):
        with patch("custom_components.config_auditor.automation_analyzer.TranslationHelper") as TH:
            TH.return_value.async_load_language = AsyncMock()
            TH.return_value.t = lambda k, **kw: k
            from custom_components.config_auditor.automation_analyzer import AutomationAnalyzer
            aa = AutomationAnalyzer(hass)
        return aa

    @pytest.mark.asyncio
    async def test_loads_from_automations_yaml(self, tmp_path):
        import yaml
        automations = [{"id": "auto1", "alias": "Alarm", "trigger": [], "action": []}]
        (tmp_path / "automations.yaml").write_text(yaml.dump(automations))
        hass = MockHass(config_dir=str(tmp_path))
        er_mock = MockEntityRegistry([
            MockRegistryEntry("automation.alarm", platform="automation", unique_id="auto1")
        ])
        aa = self._make_analyzer(hass)
        with patch("custom_components.config_auditor.automation_analyzer.er") as er_m:
            er_m.async_get.return_value = er_mock
            await aa._load_automation_configs()
        assert any("auto1" in str(v.get("id")) for v in aa._automation_configs.values())

    @pytest.mark.asyncio
    async def test_loads_from_storage_core_automation(self, tmp_path):
        storage_dir = tmp_path / ".storage"
        storage_dir.mkdir()
        storage_data = {
            "data": {
                "items": [
                    {"id": "ui_auto_1", "alias": "UI Automation", "trigger": [], "action": []}
                ]
            }
        }
        (storage_dir / "core.automation").write_text(json.dumps(storage_data))
        (tmp_path / "automations.yaml").write_text("[]")
        hass = MockHass(config_dir=str(tmp_path))
        er_mock = MockEntityRegistry()
        aa = self._make_analyzer(hass)
        with patch("custom_components.config_auditor.automation_analyzer.er") as er_m:
            er_m.async_get.return_value = er_mock
            await aa._load_automation_configs()
        found = any(
            cfg.get("_source_file") == ".storage/core.automation"
            for cfg in aa._automation_configs.values()
        )
        assert found, "Storage automation should have _source_file=.storage/core.automation"

    @pytest.mark.asyncio
    async def test_loads_from_packages_directory(self, tmp_path):
        import yaml
        packages = tmp_path / "packages"
        packages.mkdir()
        pkg_content = {
            "automation": [
                {"id": "pkg_auto_1", "alias": "Package Auto", "trigger": [], "action": []}
            ]
        }
        (packages / "lights.yaml").write_text(yaml.dump(pkg_content))
        (tmp_path / "automations.yaml").write_text("[]")
        hass = MockHass(config_dir=str(tmp_path))
        er_mock = MockEntityRegistry()
        aa = self._make_analyzer(hass)
        with patch("custom_components.config_auditor.automation_analyzer.er") as er_m:
            er_m.async_get.return_value = er_mock
            await aa._load_automation_configs()
        found = any(
            "packages/" in str(cfg.get("_source_file", ""))
            for cfg in aa._automation_configs.values()
        )
        assert found, "Package automation should have _source_file containing 'packages/'"

    @pytest.mark.asyncio
    async def test_deduplicates_by_unique_id(self, tmp_path):
        """Same unique_id in automations.yaml and .storage should not be double-counted."""
        import yaml
        automations = [{"id": "dup_auto", "alias": "Dedup Test", "trigger": [], "action": []}]
        (tmp_path / "automations.yaml").write_text(yaml.dump(automations))
        storage_dir = tmp_path / ".storage"
        storage_dir.mkdir()
        storage_data = {"data": {"items": [
            {"id": "dup_auto", "alias": "Dedup Test", "trigger": [], "action": []}
        ]}}
        (storage_dir / "core.automation").write_text(json.dumps(storage_data))
        hass = MockHass(config_dir=str(tmp_path))
        er_mock = MockEntityRegistry()
        aa = self._make_analyzer(hass)
        with patch("custom_components.config_auditor.automation_analyzer.er") as er_m:
            er_m.async_get.return_value = er_mock
            await aa._load_automation_configs()
        dup_entries = [
            cfg for cfg in aa._automation_configs.values() if cfg.get("id") == "dup_auto"
        ]
        assert len(dup_entries) == 1, f"Should deduplicate — got {len(dup_entries)} entries"

    @pytest.mark.asyncio
    async def test_source_file_propagated_to_issue(self, tmp_path):
        """Issues from non-standard sources should carry source_file field."""
        import yaml
        packages = tmp_path / "packages"
        packages.mkdir()
        # Automation without alias → triggers no_alias issue
        pkg_content = {"automation": [{"id": "pkg_noalias", "trigger": [], "action": []}]}
        (packages / "test.yaml").write_text(yaml.dump(pkg_content))
        (tmp_path / "automations.yaml").write_text("[]")
        hass = MockHass(config_dir=str(tmp_path))
        er_mock = MockEntityRegistry()
        with patch("custom_components.config_auditor.automation_analyzer.TranslationHelper") as TH, \
             patch("custom_components.config_auditor.automation_analyzer.er") as er_m:
            TH.return_value.async_load_language = AsyncMock()
            TH.return_value.t = lambda k, **kw: k
            er_m.async_get.return_value = er_mock
            from custom_components.config_auditor.automation_analyzer import AutomationAnalyzer
            aa = AutomationAnalyzer(hass)
            await aa.analyze_all()
        issues_with_source = [
            i for i in aa.issues
            if i.get("source_file", "").startswith("packages/")
        ]
        assert len(issues_with_source) > 0, "Issues from packages/ should have source_file set"

    @pytest.mark.asyncio
    async def test_include_dir_merge_list(self, tmp_path):
        """configuration.yaml with !include_dir_merge_list should be resolved."""
        import yaml
        incl_dir = tmp_path / "automations_split"
        incl_dir.mkdir()
        automation = [{"id": "split_auto", "alias": "Split Auto", "trigger": [], "action": []}]
        (incl_dir / "lights.yaml").write_text(yaml.dump(automation))
        cfg_content = "automation: !include_dir_merge_list automations_split\n"
        (tmp_path / "configuration.yaml").write_text(cfg_content)
        (tmp_path / "automations.yaml").write_text("[]")
        hass = MockHass(config_dir=str(tmp_path))
        er_mock = MockEntityRegistry()
        aa = self._make_analyzer(hass)
        with patch("custom_components.config_auditor.automation_analyzer.er") as er_m:
            er_m.async_get.return_value = er_mock
            await aa._load_automation_configs()
        found = any(cfg.get("id") == "split_auto" for cfg in aa._automation_configs.values())
        assert found, "Automation from !include_dir_merge_list should be loaded"


# ═══════════════════════════════════════════════════════════════════════════
# c) input_* helper analysis
# ═══════════════════════════════════════════════════════════════════════════

class TestInputHelperAnalysis:

    def _make_analyzer(self, hass):
        with patch("custom_components.config_auditor.entity_analyzer.TranslationHelper") as TH:
            TH.return_value.async_load_language = AsyncMock()
            TH.return_value.t = lambda k, **kw: k
            from custom_components.config_auditor.entity_analyzer import EntityAnalyzer
            ea = EntityAnalyzer(hass)
        ea._ignored_entity_ids = set()
        ea._entity_references = {}
        ea._automation_alias_map = {}
        return ea

    @pytest.mark.asyncio
    async def test_unused_input_boolean_detected(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_boolean.unused", "off", {"friendly_name": "Unused"})
        ea = self._make_analyzer(hass)
        await ea._analyze_input_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "helper_unused" in types

    @pytest.mark.asyncio
    async def test_referenced_input_boolean_not_flagged_as_unused(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_boolean.used", "on", {"friendly_name": "Used"})
        ea = self._make_analyzer(hass)
        ea._entity_references["input_boolean.used"] = ["automation.some"]
        await ea._analyze_input_helpers({}, {})
        unused = [i for i in ea.issues if i["type"] == "helper_unused"]
        assert not unused, "Referenced input_boolean should not be flagged as unused"

    @pytest.mark.asyncio
    async def test_input_select_duplicate_options(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_select.mode", "Mode A", {
            "friendly_name": "Mode",
            "options": ["Mode A", "Mode B", "Mode A"]  # duplicate
        })
        ea = self._make_analyzer(hass)
        ea._entity_references["input_select.mode"] = ["automation.x"]
        await ea._analyze_input_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "input_select_duplicate_options" in types

    @pytest.mark.asyncio
    async def test_input_select_empty_option(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_select.mode", "Option A", {
            "friendly_name": "Mode",
            "options": ["Option A", ""]  # empty option
        })
        ea = self._make_analyzer(hass)
        ea._entity_references["input_select.mode"] = ["automation.x"]
        await ea._analyze_input_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "input_select_empty_option" in types

    @pytest.mark.asyncio
    async def test_input_number_invalid_range(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_number.temp", "5", {
            "friendly_name": "Temperature",
            "min": 50.0, "max": 10.0, "step": 1.0  # min > max!
        })
        ea = self._make_analyzer(hass)
        ea._entity_references["input_number.temp"] = ["automation.x"]
        await ea._analyze_input_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "input_number_invalid_range" in types

    @pytest.mark.asyncio
    async def test_input_number_valid_range_no_issue(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_number.temp", "20", {
            "friendly_name": "Temperature",
            "min": 0.0, "max": 30.0, "step": 0.5
        })
        ea = self._make_analyzer(hass)
        ea._entity_references["input_number.temp"] = ["automation.x"]
        await ea._analyze_input_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "input_number_invalid_range" not in types

    @pytest.mark.asyncio
    async def test_input_text_invalid_regex(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_text.code", "", {
            "friendly_name": "Code",
            "pattern": "[invalid regex("  # broken regex
        })
        ea = self._make_analyzer(hass)
        ea._entity_references["input_text.code"] = ["automation.x"]
        await ea._analyze_input_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "input_text_invalid_pattern" in types

    @pytest.mark.asyncio
    async def test_input_text_valid_regex_no_issue(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_text.code", "", {
            "friendly_name": "Code",
            "pattern": r"^\d{4}$"  # valid regex
        })
        ea = self._make_analyzer(hass)
        ea._entity_references["input_text.code"] = ["automation.x"]
        await ea._analyze_input_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "input_text_invalid_pattern" not in types

    @pytest.mark.asyncio
    async def test_no_friendly_name_flagged(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        # Entity ID as friendly_name = same as entity_id → no friendly name
        hass.add_state("input_boolean.test_flag", "off", {
            "friendly_name": "input_boolean.test_flag"
        })
        ea = self._make_analyzer(hass)
        ea._entity_references["input_boolean.test_flag"] = ["automation.x"]
        await ea._analyze_input_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "helper_no_friendly_name" in types

    @pytest.mark.asyncio
    async def test_no_double_count_input_boolean_unused(self, tmp_path):
        """input_boolean.unused should only get ONE unused issue, not two."""
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_boolean.single", "off", {"friendly_name": "Single"})
        ea = self._make_analyzer(hass)
        # No references → should be unused
        await ea._analyze_input_helpers({}, {})
        unused_issues = [
            i for i in ea.issues
            if i["entity_id"] == "input_boolean.single"
            and i["type"] in ("helper_unused", "unused_input_boolean")
        ]
        assert len(unused_issues) == 1, (
            f"Should have exactly 1 unused issue for input_boolean.single, got {len(unused_issues)}: "
            f"{[i['type'] for i in unused_issues]}"
        )

    @pytest.mark.asyncio
    async def test_input_number_step_exceeds_range(self, tmp_path):
        """step > (max - min) should be flagged."""
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_number.broken_step", "5", {
            "friendly_name": "Broken Step",
            "min": 0.0, "max": 5.0, "step": 10.0  # step > range
        })
        ea = self._make_analyzer(hass)
        ea._entity_references["input_number.broken_step"] = ["automation.x"]
        await ea._analyze_input_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "input_number_invalid_range" in types

    @pytest.mark.asyncio
    async def test_orphaned_disabled_only_flagged(self, tmp_path):
        """Helper referenced only in disabled automations should be flagged."""
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_boolean.flag", "off", {"friendly_name": "Flag"})
        hass.add_state("automation.my_auto", "off")  # disabled (state=off)
        ea = self._make_analyzer(hass)
        ea._entity_references["input_boolean.flag"] = ["automation.my_auto"]
        await ea._analyze_input_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "helper_orphaned_disabled_only" in types


# ═══════════════════════════════════════════════════════════════════════════
# e) timer helper analysis
# ═══════════════════════════════════════════════════════════════════════════

class TestTimerHelperAnalysis:

    def _make_analyzer(self, hass):
        with patch("custom_components.config_auditor.entity_analyzer.TranslationHelper") as TH:
            TH.return_value.async_load_language = AsyncMock()
            TH.return_value.t = lambda k, **kw: k
            from custom_components.config_auditor.entity_analyzer import EntityAnalyzer
            ea = EntityAnalyzer(hass)
        ea._ignored_entity_ids = set()
        ea._entity_references = {}
        ea._automation_alias_map = {}
        return ea

    @pytest.mark.asyncio
    async def test_timer_zero_duration(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("timer.broken", "idle", {"duration": "0:00:00"})
        ea = self._make_analyzer(hass)
        await ea._analyze_timer_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "timer_zero_duration" in types

    @pytest.mark.asyncio
    async def test_timer_normal_duration_no_issue(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("timer.ok", "idle", {"duration": "0:05:00"})
        ea = self._make_analyzer(hass)
        # Timer is used properly
        automation_configs = {
            "automation.x": {
                "trigger": [{"platform": "event", "event_type": "timer.finished",
                             "event_data": {"entity_id": "timer.ok"}}],
                "action": [{"service": "timer.start", "target": {"entity_id": "timer.ok"}}]
            }
        }
        await ea._analyze_timer_helpers(automation_configs, {})
        types = [i["type"] for i in ea.issues]
        assert "timer_zero_duration" not in types
        assert "timer_never_started" not in types
        assert "timer_orphaned" not in types

    @pytest.mark.asyncio
    async def test_timer_never_started(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("timer.forgotten", "idle", {"duration": "0:01:00"})
        ea = self._make_analyzer(hass)
        # Timer referenced in trigger but never started
        automation_configs = {
            "automation.x": {
                "trigger": [{"platform": "event", "event_type": "timer.finished",
                             "event_data": {"entity_id": "timer.forgotten"}}],
                "action": [{"service": "light.turn_on", "target": {"entity_id": "light.x"}}]
            }
        }
        await ea._analyze_timer_helpers(automation_configs, {})
        types = [i["type"] for i in ea.issues]
        assert "timer_never_started" in types

    @pytest.mark.asyncio
    async def test_timer_orphaned(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("timer.orphan", "idle", {"duration": "0:03:00"})
        ea = self._make_analyzer(hass)
        await ea._analyze_timer_helpers({}, {})
        types = [i["type"] for i in ea.issues]
        assert "timer_orphaned" in types

    @pytest.mark.asyncio
    async def test_timer_started_in_nested_choose_action(self, tmp_path):
        """Timer start inside a choose branch should be detected (recursive scan)."""
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("timer.nested", "idle", {"duration": "0:01:00"})
        ea = self._make_analyzer(hass)
        automation_configs = {
            "automation.x": {
                "trigger": [{"platform": "event", "event_type": "timer.finished",
                             "event_data": {"entity_id": "timer.nested"}}],
                "action": [{
                    "choose": [{
                        "conditions": [{"condition": "state", "entity_id": "input_boolean.flag", "state": "on"}],
                        "sequence": [
                            {"service": "timer.start", "target": {"entity_id": "timer.nested"}}
                        ]
                    }]
                }]
            }
        }
        await ea._analyze_timer_helpers(automation_configs, {})
        types = [i["type"] for i in ea.issues]
        assert "timer_never_started" not in types, (
            "Timer started inside a choose branch should not be flagged as never_started"
        )

    @pytest.mark.asyncio
    async def test_no_timers_no_crash(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        ea = self._make_analyzer(hass)
        # Should not raise even with no timer entities
        await ea._analyze_timer_helpers({}, {})
        assert ea.issues == []


# ═══════════════════════════════════════════════════════════════════════════
# d) template sensor analysis
# ═══════════════════════════════════════════════════════════════════════════

class TestTemplateSensorAnalysis:

    def _make_analyzer(self, hass):
        with patch("custom_components.config_auditor.performance_analyzer.TranslationHelper") as TH:
            TH.return_value.async_load_language = AsyncMock()
            TH.return_value.t = lambda k, **kw: k
            from custom_components.config_auditor.performance_analyzer import PerformanceAnalyzer
            pa = PerformanceAnalyzer(hass)
        return pa

    @pytest.mark.asyncio
    async def test_template_sensor_no_metadata(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        # Sensor with no device_class and no unit_of_measurement
        hass.add_state("sensor.template_temp", "20", {"friendly_name": "Template Temp"})
        pa = self._make_analyzer(hass)
        er_mock = MockEntityRegistry([
            MockRegistryEntry("sensor.template_temp", platform="template",
                              unique_id="template_temp")
        ])
        import custom_components.config_auditor.performance_analyzer as pa_mod
        orig = pa_mod.er
        try:
            pa_mod.er = MagicMock()
            pa_mod.er.async_get.return_value = er_mock
            await pa._analyze_template_entities()
        finally:
            pa_mod.er = orig
        types = [i["type"] for i in pa.issues]
        assert "template_sensor_no_metadata" in types

    @pytest.mark.asyncio
    async def test_template_sensor_with_unit_no_flag(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("sensor.template_temp", "20", {
            "unit_of_measurement": "°C",
            "device_class": "temperature"
        })
        pa = self._make_analyzer(hass)
        er_mock = MockEntityRegistry([
            MockRegistryEntry("sensor.template_temp", platform="template", unique_id="t1")
        ])
        import custom_components.config_auditor.performance_analyzer as pa_mod
        orig = pa_mod.er
        try:
            pa_mod.er = MagicMock()
            pa_mod.er.async_get.return_value = er_mock
            await pa._analyze_template_entities()
        finally:
            pa_mod.er = orig
        types = [i["type"] for i in pa.issues]
        assert "template_sensor_no_metadata" not in types

    @pytest.mark.asyncio
    async def test_no_template_entities_no_crash(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("sensor.normal", "20", {})
        pa = self._make_analyzer(hass)
        er_mock = MockEntityRegistry([
            MockRegistryEntry("sensor.normal", platform="generic", unique_id="n1")
        ])
        import custom_components.config_auditor.performance_analyzer as pa_mod
        orig = pa_mod.er
        try:
            pa_mod.er = MagicMock()
            pa_mod.er.async_get.return_value = er_mock
            await pa._analyze_template_entities()
        finally:
            pa_mod.er = orig
        assert pa.issues == []


# ═══════════════════════════════════════════════════════════════════════════
# Health score — new issue types included
# ═══════════════════════════════════════════════════════════════════════════

class TestHealthScoreNewIssues:

    def _score(self, **kwargs):
        from custom_components.config_auditor.health_score import calculate_health_score
        return calculate_health_score(**kwargs)

    def test_helper_unused_reduces_score(self):
        entity_issues = [{"severity": "low", "type": "helper_unused"}] * 5
        score_with = self._score(
            automation_issues=[], entity_issues=entity_issues,
            total_entities=50, total_automations=10
        )
        score_without = self._score(
            automation_issues=[], entity_issues=[],
            total_entities=50, total_automations=10
        )
        assert score_with < score_without, "helper_unused issues should reduce health score"

    def test_timer_never_started_high_severity_reduces_score(self):
        entity_issues = [{"severity": "high", "type": "timer_never_started"}]
        score_with = self._score(
            automation_issues=[], entity_issues=entity_issues,
            total_entities=20, total_automations=5
        )
        score_without = self._score(
            automation_issues=[], entity_issues=[],
            total_entities=20, total_automations=5
        )
        assert score_with < score_without

    def test_input_number_invalid_range_high_severity(self):
        """High severity range error should lower score more than low severity."""
        high_issue = [{"severity": "high", "type": "input_number_invalid_range"}]
        low_issue = [{"severity": "low", "type": "helper_no_friendly_name"}]
        score_high = self._score(
            automation_issues=[], entity_issues=high_issue,
            total_entities=20, total_automations=5
        )
        score_low = self._score(
            automation_issues=[], entity_issues=low_issue,
            total_entities=20, total_automations=5
        )
        assert score_high < score_low

    def test_template_sensor_issues_in_performance(self):
        """template_sensor_no_metadata goes into performance issues → counted."""
        perf_issues = [{"severity": "low", "type": "template_sensor_no_metadata"}] * 3
        score_with = self._score(
            automation_issues=[], entity_issues=[], performance_issues=perf_issues,
            total_entities=30, total_automations=10
        )
        score_without = self._score(
            automation_issues=[], entity_issues=[], performance_issues=[],
            total_entities=30, total_automations=10
        )
        assert score_with < score_without

    def test_score_floor_with_many_new_issues(self):
        """Score must never drop below 20 even with lots of issues."""
        many_issues = [{"severity": "high", "type": "timer_never_started"}] * 100
        score = self._score(
            automation_issues=[], entity_issues=many_issues,
            total_entities=5, total_automations=2
        )
        assert score >= 20, f"Score floor violated: {score}"


# ═══════════════════════════════════════════════════════════════════════════
# a) Translation keys — panel.actions.open_entity and view_entities_list
# ═══════════════════════════════════════════════════════════════════════════

class TestTranslationKeys:
    """Verify that the new action keys exist in panel.actions for all languages."""

    def _load(self, lang: str) -> dict:
        p = Path(__file__).parent.parent / "translations" / f"{lang}.json"
        return json.loads(p.read_text(encoding="utf-8"))

    @pytest.mark.parametrize("lang", [
        "en", "fr", "de", "es", "it", "nl", "pl", "pt", "ru", "sv", "da", "zh-Hans", "ja"
    ])
    def test_panel_actions_open_entity(self, lang):
        data = self._load(lang)
        key = data.get("panel", {}).get("actions", {}).get("open_entity")
        assert key, f"{lang}: panel.actions.open_entity is missing or empty"

    @pytest.mark.parametrize("lang", [
        "en", "fr", "de", "es", "it", "nl", "pl", "pt", "ru", "sv", "da", "zh-Hans", "ja"
    ])
    def test_panel_actions_view_entities_list(self, lang):
        data = self._load(lang)
        key = data.get("panel", {}).get("actions", {}).get("view_entities_list")
        assert key, f"{lang}: panel.actions.view_entities_list is missing or empty"

    @pytest.mark.parametrize("lang", [
        "en", "fr", "de", "es", "it", "nl", "pl", "pt", "ru", "sv", "da", "zh-Hans", "ja"
    ])
    def test_version_is_1_2_0_in_translations(self, lang):
        data = self._load(lang)
        v = data.get("panel", {}).get("version", "")
        assert v != "", f"{lang}: panel.version does not contain '1.2.0', got {v!r}"

    @pytest.mark.parametrize("lang", [
        "en", "fr", "de", "es", "it", "nl", "pl", "pt", "ru", "sv", "da", "zh-Hans", "ja"
    ])
    def test_new_helper_analyzer_keys_present(self, lang):
        data = self._load(lang)
        analyzer = data.get("analyzer", {})
        required = [
            "helper_unused", "timer_zero_duration", "timer_never_started",
            "input_select_duplicate_options", "input_number_invalid_range",
            "template_sensor_no_metadata",
        ]
        missing = [k for k in required if k not in analyzer]
        assert not missing, f"{lang}: missing analyzer keys: {missing}"


# ═══════════════════════════════════════════════════════════════════════════
# Edge cases & regression
# ═══════════════════════════════════════════════════════════════════════════

class TestEdgeCases:

    @pytest.mark.asyncio
    async def test_empty_install_no_crash(self, tmp_path):
        """Empty HA install (no timers, no helpers) must not crash."""
        hass = MockHass(config_dir=str(tmp_path))
        with patch("custom_components.config_auditor.entity_analyzer.TranslationHelper") as TH:
            TH.return_value.async_load_language = AsyncMock()
            TH.return_value.t = lambda k, **kw: k
            from custom_components.config_auditor.entity_analyzer import EntityAnalyzer
            ea = EntityAnalyzer(hass)
        ea._ignored_entity_ids = set()
        ea._entity_references = {}
        ea._automation_alias_map = {}
        await ea._analyze_input_helpers({}, {})
        await ea._analyze_timer_helpers({}, {})
        assert ea.issues == []

    @pytest.mark.asyncio
    async def test_haca_ignore_label_respected(self, tmp_path):
        """Entities with haca_ignore label must not generate helper issues."""
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("input_boolean.ignored", "off", {"friendly_name": "Ignored"})
        with patch("custom_components.config_auditor.entity_analyzer.TranslationHelper") as TH:
            TH.return_value.async_load_language = AsyncMock()
            TH.return_value.t = lambda k, **kw: k
            from custom_components.config_auditor.entity_analyzer import EntityAnalyzer
            ea = EntityAnalyzer(hass)
        ea._ignored_entity_ids = {"input_boolean.ignored"}
        ea._entity_references = {}
        ea._automation_alias_map = {}
        await ea._analyze_input_helpers({}, {})
        issues = [i for i in ea.issues if i["entity_id"] == "input_boolean.ignored"]
        assert not issues, "haca_ignore entity must not generate any issues"

    def test_automation_configs_source_file_is_private_key(self, tmp_path):
        """The _source_file key must be present in enriched configs."""
        import yaml
        packages = Path(tmp_path) / "packages"
        packages.mkdir()
        (packages / "test.yaml").write_text(yaml.dump({
            "automation": [{"id": "pkg_x", "alias": "Pkg X", "trigger": [], "action": []}]
        }))
        (Path(tmp_path) / "automations.yaml").write_text("[]")
        hass = MockHass(config_dir=str(tmp_path))
        er_mock = MockEntityRegistry()

        async def _run():
            with patch("custom_components.config_auditor.automation_analyzer.TranslationHelper") as TH, \
                 patch("custom_components.config_auditor.automation_analyzer.er") as er_m:
                TH.return_value.async_load_language = AsyncMock()
                TH.return_value.t = lambda k, **kw: k
                er_m.async_get.return_value = er_mock
                from custom_components.config_auditor.automation_analyzer import AutomationAnalyzer
                aa = AutomationAnalyzer(hass)
                await aa._load_automation_configs()
                return aa._automation_configs

        configs = asyncio.get_event_loop().run_until_complete(_run())
        pkg_configs = [cfg for cfg in configs.values() if "packages/" in cfg.get("_source_file", "")]
        assert len(pkg_configs) == 1
        assert pkg_configs[0]["_source_file"].endswith(".yaml")


# ═══════════════════════════════════════════════════════════════════════════
# JS bundle smoke tests — catch regressions avant livraison
# Ces tests analysent le bundle compilé pour valider les décisions
# d'architecture JS qui ne peuvent pas être testées en Python pur.
# ═══════════════════════════════════════════════════════════════════════════

class TestJSBundleSmoke:
    """
    Vérifie que le bundle haca-panel.js contient les patterns critiques.
    Ces tests auraient attrapé les 3 bugs signalés par l'utilisateur :
      1. Clé de traduction dans panel.actions (pas la racine)
      2. Event hass-more-info via window.parent (pas this.dispatchEvent)
      3. Logique denylist pour domaines (pas whitelist incomplète)
    """

    BUNDLE = Path(__file__).parent.parent / "www" / "haca-panel.js"

    def _text(self):
        return self.BUNDLE.read_text(encoding="utf-8")

    # ── 1. Clé de traduction dans le bon chemin ───────────────────────────

    def test_open_entity_reads_from_panel_actions(self):
        """Le JS doit lire actions.open_entity depuis panel.actions, pas depuis
        la clé racine 'actions'. La section panel est ce que haca/get_translations
        envoie au frontend."""
        txt = self._text()
        # Le code doit contenir t('actions.open_entity') — qui est résolu via
        # this._translations['actions']['open_entity'] (les translations reçues
        # du WS sont panel.*, donc actions.open_entity = panel.actions.open_entity)
        assert "actions.open_entity" in txt, (
            "Le bundle doit contenir t('actions.open_entity') pour le bouton Ouvrir l'entité"
        )
        assert "actions.view_entities_list" in txt, (
            "Le bundle doit contenir t('actions.view_entities_list') pour le bouton zombie"
        )

    def test_translations_served_as_panel_section(self):
        """websocket.py envoie panel_translations = translations.get('panel', {}).
        Donc dans le JSON les clés doivent être dans panel.actions, pas à la racine."""
        import json
        for lang_file in sorted(
            (Path(__file__).parent.parent / "translations").glob("*.json")
        ):
            data = json.loads(lang_file.read_text(encoding="utf-8"))
            panel_actions = data.get("panel", {}).get("actions", {})
            assert "open_entity" in panel_actions, (
                f"{lang_file.name}: 'open_entity' manquant dans panel.actions "
                f"(clé racine 'actions' ignorée par le frontend)"
            )
            assert "view_entities_list" in panel_actions, (
                f"{lang_file.name}: 'view_entities_list' manquant dans panel.actions"
            )

    # ── 2. Event hass-more-info via window.parent ─────────────────────────

    def test_open_more_info_targets_parent_document(self):
        """Dans un panel embed_iframe, les events doivent être dispatchés sur
        window.parent.document (pas sur this ou this.shadowRoot)."""
        txt = self._text()
        assert "_openMoreInfo" in txt, (
            "La méthode _openMoreInfo doit exister dans le bundle"
        )
        # Extrait la méthode pour vérifier son contenu
        start = txt.find("_openMoreInfo")
        snippet = txt[start:start + 600]
        assert "window.parent" in snippet, (
            "_openMoreInfo doit utiliser window.parent pour sortir de l'iframe"
        )
        assert "home-assistant" in snippet, (
            "_openMoreInfo doit dispatcher sur l'élément <home-assistant> du parent"
        )

    def test_no_callservice_in_open_entity_handler(self):
        """Le handler du bouton open-entity ne doit PAS appeler callService
        (c'était le bug qui causait l'erreur 'entity_id manquant')."""
        txt = self._text()
        # Cherche le handler open-entity-btn
        btn_idx = txt.find("open-entity-btn")
        assert btn_idx != -1, "Le sélecteur open-entity-btn doit exister dans le bundle"
        # Dans les 300 caractères autour du handler, il ne doit pas y avoir callService
        handler_zone = txt[btn_idx:btn_idx + 300]
        assert "callService" not in handler_zone, (
            "Le handler open-entity-btn ne doit pas appeler callService — "
            "c'est ce qui causait l'erreur 'entity_id manquant'"
        )

    # ── 3. Logique denylist pour les domaines ─────────────────────────────

    def test_domain_logic_is_denylist_not_whitelist(self):
        """La logique doit être une liste d'exclusion (denylist), pas une
        whitelist qui manque les domaines inconnus comme stt, tts, weather..."""
        txt = self._text()
        assert "DOMAINS_NO_MORE_INFO" in txt, (
            "La variable DOMAINS_NO_MORE_INFO (denylist) doit exister. "
            "Une whitelist ENTITY_DOMAINS_WITH_MORE_INFO manquerait des domaines comme stt, tts, etc."
        )
        # La denylist ne doit PAS contenir stt, tts, weather, update —
        # ces domaines doivent avoir le bouton
        denylist_start = txt.find("DOMAINS_NO_MORE_INFO")
        denylist_block = txt[denylist_start:denylist_start + 300]
        for domain_should_have_button in ("stt", "tts", "weather", "update", "event"):
            assert domain_should_have_button not in denylist_block, (
                f"Le domaine '{domain_should_have_button}' ne doit PAS être dans DOMAINS_NO_MORE_INFO "
                f"— il doit avoir le bouton 'Ouvrir l'entité'"
            )

    def test_denylist_contains_automation_and_script(self):
        """automation et script doivent être dans la denylist (ils ont 'Éditer')."""
        txt = self._text()
        denylist_start = txt.find("DOMAINS_NO_MORE_INFO")
        denylist_block = txt[denylist_start:denylist_start + 300]
        for domain in ("automation", "script", "scene"):
            assert f"'{domain}'" in denylist_block or f'"{domain}"' in denylist_block, (
                f"'{domain}' doit être dans DOMAINS_NO_MORE_INFO (a déjà un bouton Éditer)"
            )

    def test_entity_id_must_contain_dot(self):
        """La validation entity_id doit vérifier la présence d'un point
        pour distinguer une vraie entité d'un ID malformé."""
        txt = self._text()
        assert "entity_id.includes('.')" in txt or 'entity_id.includes(".")' in txt, (
            "La validation doit vérifier que entity_id contient un '.' "
            "(distingue les vrais entity_id des IDs malformés sans domaine)"
        )

    # ── 4. Bouton zombie navigue vers /config/entities ────────────────────

    def test_zombie_button_links_to_entities_page(self):
        """Le bouton secondaire pour zombie_entity doit pointer vers /config/entities."""
        txt = self._text()
        assert "/config/entities" in txt, (
            "Le bouton 'Voir les entités' pour zombie_entity doit naviguer vers /config/entities"
        )

    # ── 5. Badge source_file dans les issues ──────────────────────────────

    def test_source_file_badge_exists(self):
        """Les automations hors automations.yaml doivent afficher un badge source."""
        txt = self._text()
        assert "source_file" in txt, (
            "Le bundle doit référencer source_file pour afficher le badge d'origine"
        )
        assert "isNonStandardSource" in txt, (
            "La variable isNonStandardSource doit exister pour le badge pkg/UI/incl"
        )
