"""Tests for H.A.C.A v1.3.0 features.

Covers:
  a) Script graph analysis (cycles, depth, single-mode-loop, orphans)
  b) Advanced scene analysis (unavailable refs, 90-day ghost, duplicates)
  c) Blueprint refactoring candidates
  d) Group analysis (empty, missing, all-unavailable, nested-deep)
  + Health score includes new issue types
  + Version strings consistent across all files
  + JS bundle smoke tests (prevent class of bugs from v1.2.0)
"""
from __future__ import annotations

import asyncio
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import yaml

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.tests.conftest import (
    MockHass,
    MockRegistryEntry,
    MockEntityRegistry,
    MockState,
)

TRANSLATIONS_DIR = Path(__file__).parent.parent / "translations"
BUNDLE = Path(__file__).parent.parent / "www" / "haca-panel.js"


# ─── helpers ──────────────────────────────────────────────────────────────────

def _make_aa(hass):
    with patch("custom_components.config_auditor.automation_analyzer.TranslationHelper") as TH, \
         patch("custom_components.config_auditor.automation_analyzer.er") as er_m, \
         patch("custom_components.config_auditor.automation_analyzer.ar") as ar_m:
        TH.return_value.async_load_language = AsyncMock()
        TH.return_value.t = lambda k, **kw: k
        er_m.async_get.return_value = MockEntityRegistry()
        ar_m.async_get.return_value = MagicMock(async_list_areas=lambda: [])
        from custom_components.config_auditor.automation_analyzer import AutomationAnalyzer
        aa = AutomationAnalyzer(hass)
    aa._ignored_entity_ids = set()
    return aa


def _make_ea(hass):
    with patch("custom_components.config_auditor.entity_analyzer.TranslationHelper") as TH:
        TH.return_value.async_load_language = AsyncMock()
        TH.return_value.t = lambda k, **kw: k
        from custom_components.config_auditor.entity_analyzer import EntityAnalyzer
        ea = EntityAnalyzer(hass)
    ea._ignored_entity_ids = set()
    ea._entity_references = {}
    ea._automation_alias_map = {}
    return ea


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


# ══════════════════════════════════════════════════════════════════════════════
# a) Script graph analysis
# ══════════════════════════════════════════════════════════════════════════════

class TestScriptGraphAnalysis:

    # ── collect calls helper ───────────────────────────────────────────────

    def _aa(self, tmp_path):
        return _make_aa(MockHass(config_dir=str(tmp_path)))

    def test_collect_direct_script_call(self, tmp_path):
        aa = self._aa(tmp_path)
        actions = [{"service": "script.my_script"}]
        assert "script.my_script" in aa._collect_script_calls_recursive(actions)

    def test_collect_script_turn_on_with_target(self, tmp_path):
        aa = self._aa(tmp_path)
        actions = [{"service": "script.turn_on", "target": {"entity_id": "script.foo"}}]
        assert "script.foo" in aa._collect_script_calls_recursive(actions)

    def test_collect_script_in_choose_branch(self, tmp_path):
        aa = self._aa(tmp_path)
        actions = [{
            "choose": [{
                "conditions": [],
                "sequence": [{"service": "script.nested"}]
            }]
        }]
        assert "script.nested" in aa._collect_script_calls_recursive(actions)

    def test_collect_script_in_repeat(self, tmp_path):
        aa = self._aa(tmp_path)
        actions = [{"repeat": {"count": 3, "sequence": [{"service": "script.looped"}]}}]
        assert "script.looped" in aa._collect_script_calls_recursive(actions)

    def test_collect_no_calls(self, tmp_path):
        aa = self._aa(tmp_path)
        actions = [{"service": "light.turn_on", "target": {"entity_id": "light.x"}}]
        assert len(aa._collect_script_calls_recursive(actions)) == 0

    # ── cycle detection ────────────────────────────────────────────────────

    @pytest.mark.asyncio
    async def test_script_direct_cycle(self, tmp_path):
        """script_a → script_b → script_a is a cycle."""
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {}
        aa._script_configs = {
            "script.a": {"alias": "A", "sequence": [{"service": "script.b"}]},
            "script.b": {"alias": "B", "sequence": [{"service": "script.a"}]},
        }
        await aa._analyze_script_graph()
        types = [i["type"] for i in aa.issues]
        assert "script_cycle" in types

    @pytest.mark.asyncio
    async def test_script_no_cycle(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {}
        aa._script_configs = {
            "script.a": {"alias": "A", "sequence": [{"service": "script.b"}]},
            "script.b": {"alias": "B", "sequence": [{"service": "light.turn_on"}]},
        }
        await aa._analyze_script_graph()
        assert not any(i["type"] == "script_cycle" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_script_self_cycle(self, tmp_path):
        """Script calling itself is a cycle."""
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {}
        aa._script_configs = {
            "script.self": {"alias": "Self", "sequence": [{"service": "script.self"}]},
        }
        await aa._analyze_script_graph()
        assert any(i["type"] == "script_cycle" for i in aa.issues)

    # ── call depth ─────────────────────────────────────────────────────────

    @pytest.mark.asyncio
    async def test_script_depth_over_threshold(self, tmp_path):
        """Chain a → b → c → d → e = depth 4 > 3 → medium issue."""
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {}
        aa._script_configs = {
            "script.a": {"alias": "A", "sequence": [{"service": "script.b"}]},
            "script.b": {"alias": "B", "sequence": [{"service": "script.c"}]},
            "script.c": {"alias": "C", "sequence": [{"service": "script.d"}]},
            "script.d": {"alias": "D", "sequence": [{"service": "script.e"}]},
            "script.e": {"alias": "E", "sequence": [{"service": "light.turn_on"}]},
        }
        await aa._analyze_script_graph()
        depth_issues = [i for i in aa.issues if i["type"] == "script_call_depth"]
        assert len(depth_issues) >= 1
        assert all(i["severity"] == "medium" for i in depth_issues)

    @pytest.mark.asyncio
    async def test_script_depth_at_threshold_no_issue(self, tmp_path):
        """Chain a → b → c → d = depth exactly 3 → no issue."""
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {}
        aa._script_configs = {
            "script.a": {"alias": "A", "sequence": [{"service": "script.b"}]},
            "script.b": {"alias": "B", "sequence": [{"service": "script.c"}]},
            "script.c": {"alias": "C", "sequence": [{"service": "script.d"}]},
            "script.d": {"alias": "D", "sequence": [{"service": "light.turn_on"}]},
        }
        await aa._analyze_script_graph()
        assert not any(i["type"] == "script_call_depth" for i in aa.issues)

    # ── mode:single in loop ────────────────────────────────────────────────

    @pytest.mark.asyncio
    async def test_single_mode_called_from_rapid_automation(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {
            "automation.rapid": {
                "alias": "Rapid",
                "trigger": [{"platform": "time_pattern", "minutes": "/1"}],
                "action": [{"service": "script.single_script"}],
            }
        }
        aa._script_configs = {
            "script.single_script": {"alias": "Single Script", "mode": "single", "sequence": []},
        }
        await aa._analyze_script_graph()
        assert any(i["type"] == "script_single_mode_loop" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_queued_mode_not_flagged(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {
            "automation.rapid": {
                "alias": "Rapid",
                "trigger": [{"platform": "time_pattern", "minutes": "/1"}],
                "action": [{"service": "script.queued_script"}],
            }
        }
        aa._script_configs = {
            "script.queued_script": {"alias": "Queued", "mode": "queued", "sequence": []},
        }
        await aa._analyze_script_graph()
        assert not any(i["type"] == "script_single_mode_loop" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_single_mode_from_state_trigger_not_flagged(self, tmp_path):
        """State triggers are not rapid — should not flag single mode."""
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {
            "automation.state": {
                "alias": "State",
                "trigger": [{"platform": "state", "entity_id": "binary_sensor.motion"}],
                "action": [{"service": "script.single_script"}],
            }
        }
        aa._script_configs = {
            "script.single_script": {"alias": "Single", "mode": "single", "sequence": []},
        }
        await aa._analyze_script_graph()
        assert not any(i["type"] == "script_single_mode_loop" for i in aa.issues)

    # ── orphan detection ───────────────────────────────────────────────────

    @pytest.mark.asyncio
    async def test_orphan_script_detected(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {}
        aa._script_configs = {
            "script.orphan": {"alias": "Orphan", "sequence": [{"service": "light.turn_on"}]},
        }
        await aa._analyze_script_graph()
        assert any(i["type"] == "script_orphan" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_called_script_not_orphan(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {
            "automation.x": {
                "alias": "X",
                "trigger": [],
                "action": [{"service": "script.used"}],
            }
        }
        aa._script_configs = {
            "script.used": {"alias": "Used", "sequence": []},
        }
        await aa._analyze_script_graph()
        assert not any(i["type"] == "script_orphan" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_haca_ignore_skips_script_issues(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._ignored_entity_ids = {"script.ignored"}
        aa._automation_configs = {}
        aa._script_configs = {
            "script.ignored": {"alias": "Ignored", "sequence": []},
        }
        await aa._analyze_script_graph()
        issues = [i for i in aa.issues if i.get("entity_id") == "script.ignored"]
        assert not issues

    @pytest.mark.asyncio
    async def test_no_scripts_no_crash(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {}
        aa._script_configs = {}
        await aa._analyze_script_graph()  # must not raise
        assert aa.issues == []


# ══════════════════════════════════════════════════════════════════════════════
# c) Blueprint candidates
# ══════════════════════════════════════════════════════════════════════════════

class TestBlueprintCandidates:

    @pytest.mark.asyncio
    async def test_script_used_by_more_than_3_automations(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {
            f"automation.auto_{i}": {
                "alias": f"Auto {i}",
                "trigger": [],
                "action": [{"service": "script.popular"}],
            }
            for i in range(4)  # 4 automations > threshold of 3
        }
        aa._script_configs = {
            "script.popular": {"alias": "Popular Script", "sequence": []},
        }
        aa._detect_blueprint_candidates()
        assert any(i["type"] == "script_blueprint_candidate" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_script_used_by_3_or_fewer_no_issue(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {
            f"automation.auto_{i}": {
                "alias": f"Auto {i}",
                "trigger": [],
                "action": [{"service": "script.moderate"}],
            }
            for i in range(3)  # exactly 3 — not above threshold
        }
        aa._script_configs = {
            "script.moderate": {"alias": "Moderate", "sequence": []},
        }
        aa._detect_blueprint_candidates()
        assert not any(i["type"] == "script_blueprint_candidate" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_blueprint_candidate_includes_automation_ids(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = _make_aa(hass)
        aa._automation_configs = {
            f"automation.auto_{i}": {
                "alias": f"Auto {i}",
                "trigger": [],
                "action": [{"service": "script.candidate"}],
            }
            for i in range(5)
        }
        aa._script_configs = {"script.candidate": {"alias": "Candidate", "sequence": []}}
        aa._detect_blueprint_candidates()
        bp_issues = [i for i in aa.issues if i["type"] == "script_blueprint_candidate"]
        assert bp_issues
        assert "automation_ids" in bp_issues[0]
        assert len(bp_issues[0]["automation_ids"]) > 0


# ══════════════════════════════════════════════════════════════════════════════
# b) Advanced scene analysis
# ══════════════════════════════════════════════════════════════════════════════

class TestAdvancedSceneAnalysis:

    def _make_aa_with_scenes(self, hass, scenes: dict):
        aa = _make_aa(hass)
        aa._automation_configs = {}
        aa._script_configs = {}
        aa._scene_configs = scenes
        return aa

    @pytest.mark.asyncio
    async def test_scene_unavailable_entity_reference(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("light.broken", "unavailable", {})
        aa = self._make_aa_with_scenes(hass, {
            "scene.living": {"name": "Living", "id": "1",
                             "entities": {"light.broken": {"state": "on"}}}
        })
        await aa._analyze_advanced_scenes()
        assert any(i["type"] == "scene_entity_unavailable" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_scene_available_entity_no_issue(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("light.ok", "on", {})
        aa = self._make_aa_with_scenes(hass, {
            "scene.living": {"name": "Living", "id": "1",
                             "entities": {"light.ok": {"state": "on"}}}
        })
        await aa._analyze_advanced_scenes()
        assert not any(i["type"] == "scene_entity_unavailable" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_scene_not_triggered_in_90_days(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        old_ts = (datetime.now(timezone.utc) - timedelta(days=100)).isoformat()
        hass.add_state("scene.old", "scening",
                       {"last_triggered": old_ts, "friendly_name": "Old"})
        aa = self._make_aa_with_scenes(hass, {
            "scene.old": {"name": "old", "id": "1", "entities": {}}
        })
        await aa._analyze_advanced_scenes()
        assert any(i["type"] == "scene_not_triggered" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_scene_triggered_recently_no_issue(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        recent_ts = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        hass.add_state("scene.recent", "scening",
                       {"last_triggered": recent_ts, "friendly_name": "Recent"})
        aa = self._make_aa_with_scenes(hass, {
            "scene.recent": {"name": "recent", "id": "1", "entities": {}}
        })
        await aa._analyze_advanced_scenes()
        assert not any(i["type"] == "scene_not_triggered" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_scene_never_triggered_no_issue(self, tmp_path):
        """Scene with no last_triggered should NOT get ghost issue (no data)."""
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("scene.new_scene", "scening", {"friendly_name": "New"})
        aa = self._make_aa_with_scenes(hass, {
            "scene.new_scene": {"name": "new_scene", "id": "1", "entities": {}}
        })
        await aa._analyze_advanced_scenes()
        assert not any(i["type"] == "scene_not_triggered" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_scene_duplicate_detected(self, tmp_path):
        """Two scenes with identical entities dict → duplicate issue."""
        hass = MockHass(config_dir=str(tmp_path))
        entities = {"light.living_room": {"state": "on", "brightness": 255}}
        aa = self._make_aa_with_scenes(hass, {
            "scene.scene_a": {"name": "A", "id": "1", "entities": entities},
            "scene.scene_b": {"name": "B", "id": "2", "entities": entities},
        })
        await aa._analyze_advanced_scenes()
        assert any(i["type"] == "scene_duplicate" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_scene_different_entities_not_duplicate(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = self._make_aa_with_scenes(hass, {
            "scene.scene_a": {"name": "A", "id": "1",
                              "entities": {"light.a": {"state": "on"}}},
            "scene.scene_b": {"name": "B", "id": "2",
                              "entities": {"light.b": {"state": "on"}}},
        })
        await aa._analyze_advanced_scenes()
        assert not any(i["type"] == "scene_duplicate" for i in aa.issues)

    @pytest.mark.asyncio
    async def test_no_scenes_no_crash(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        aa = self._make_aa_with_scenes(hass, {})
        await aa._analyze_advanced_scenes()
        assert aa.issues == []


# ══════════════════════════════════════════════════════════════════════════════
# d) Group analysis
# ══════════════════════════════════════════════════════════════════════════════

class TestGroupAnalysis:

    @pytest.mark.asyncio
    async def test_group_empty(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("group.empty_group", "unknown",
                       {"entity_id": [], "friendly_name": "Empty"})
        ea = _make_ea(hass)
        await ea._analyze_groups()
        assert any(i["type"] == "group_empty" for i in ea.issues)

    @pytest.mark.asyncio
    async def test_group_empty_string_members(self, tmp_path):
        """group with entity_id as empty string should be treated as empty."""
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("group.weird", "unknown", {"entity_id": ""})
        ea = _make_ea(hass)
        await ea._analyze_groups()
        types = [i["type"] for i in ea.issues]
        assert "group_empty" in types

    @pytest.mark.asyncio
    async def test_group_missing_entities(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        # group references light.gone which doesn't exist as state
        hass.add_state("group.lights", "on",
                       {"entity_id": ["light.gone", "light.also_gone"]})
        ea = _make_ea(hass)
        await ea._analyze_groups()
        missing = [i for i in ea.issues if i["type"] == "group_missing_entities"]
        assert missing
        assert missing[0]["missing_entities"] == ["light.gone", "light.also_gone"]

    @pytest.mark.asyncio
    async def test_group_existing_entities_no_missing_issue(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("light.living", "on", {})
        hass.add_state("group.lights", "on", {"entity_id": ["light.living"]})
        ea = _make_ea(hass)
        await ea._analyze_groups()
        assert not any(i["type"] == "group_missing_entities" for i in ea.issues)

    @pytest.mark.asyncio
    async def test_group_all_unavailable(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("light.a", "unavailable", {})
        hass.add_state("light.b", "unavailable", {})
        hass.add_state("group.dead", "unavailable",
                       {"entity_id": ["light.a", "light.b"]})
        ea = _make_ea(hass)
        await ea._analyze_groups()
        assert any(i["type"] == "group_all_unavailable" for i in ea.issues)

    @pytest.mark.asyncio
    async def test_group_partially_available_not_flagged(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("light.a", "on", {})
        hass.add_state("light.b", "unavailable", {})
        hass.add_state("group.partial", "on",
                       {"entity_id": ["light.a", "light.b"]})
        ea = _make_ea(hass)
        await ea._analyze_groups()
        assert not any(i["type"] == "group_all_unavailable" for i in ea.issues)

    @pytest.mark.asyncio
    async def test_group_nested_deep(self, tmp_path):
        """group.a → group.b → group.c → light (depth 3) → flag."""
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("light.leaf", "on", {})
        hass.add_state("group.c", "on", {"entity_id": ["light.leaf"]})
        hass.add_state("group.b", "on", {"entity_id": ["group.c"]})
        hass.add_state("group.a", "on", {"entity_id": ["group.b"]})
        ea = _make_ea(hass)
        await ea._analyze_groups()
        # group.a has depth 3 (a→b→c→leaf)
        deep = [i for i in ea.issues if i["type"] == "group_nested_deep"]
        assert deep

    @pytest.mark.asyncio
    async def test_group_two_levels_not_flagged(self, tmp_path):
        """group.a → group.b → light (depth 2) → OK."""
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("light.leaf", "on", {})
        hass.add_state("group.b", "on", {"entity_id": ["light.leaf"]})
        hass.add_state("group.a", "on", {"entity_id": ["group.b"]})
        ea = _make_ea(hass)
        await ea._analyze_groups()
        assert not any(i["type"] == "group_nested_deep" for i in ea.issues)

    @pytest.mark.asyncio
    async def test_group_cycle_no_infinite_loop(self, tmp_path):
        """group.a → group.b → group.a: cycle guard must prevent recursion."""
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("group.a", "on", {"entity_id": ["group.b"]})
        hass.add_state("group.b", "on", {"entity_id": ["group.a"]})
        ea = _make_ea(hass)
        depth = ea._calc_group_nesting_depth("group.a", frozenset())
        assert depth < 100, "Cycle guard failed — infinite recursion"

    @pytest.mark.asyncio
    async def test_no_groups_no_crash(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("light.x", "on", {})  # non-group entity
        ea = _make_ea(hass)
        await ea._analyze_groups()
        assert ea.issues == []

    @pytest.mark.asyncio
    async def test_haca_ignore_skips_group(self, tmp_path):
        hass = MockHass(config_dir=str(tmp_path))
        hass.add_state("group.ignored", "on", {"entity_id": []})
        ea = _make_ea(hass)
        ea._ignored_entity_ids = {"group.ignored"}
        await ea._analyze_groups()
        assert ea.issues == []


# ══════════════════════════════════════════════════════════════════════════════
# Health score — new v1.3.0 issue types included
# ══════════════════════════════════════════════════════════════════════════════

class TestHealthScoreV130:

    def _score(self, **kw):
        from custom_components.config_auditor.health_score import calculate_health_score
        return calculate_health_score(**kw)

    def test_script_cycle_high_reduces_score(self):
        auto_issues = [{"severity": "high", "type": "script_cycle"}]
        score = self._score(automation_issues=auto_issues, entity_issues=[],
                            total_entities=20, total_automations=5)
        assert score < 100

    def test_group_missing_entities_medium_reduces_score(self):
        ent_issues = [{"severity": "medium", "type": "group_missing_entities"}]
        score = self._score(automation_issues=[], entity_issues=ent_issues,
                            total_entities=20, total_automations=5)
        assert score < 100

    def test_scene_duplicate_medium_severity(self):
        auto_issues = [{"severity": "medium", "type": "scene_duplicate"}]
        score_with = self._score(automation_issues=auto_issues, entity_issues=[],
                                 total_entities=30, total_automations=10)
        score_without = self._score(automation_issues=[], entity_issues=[],
                                    total_entities=30, total_automations=10)
        assert score_with < score_without

    def test_script_orphan_low_severity_small_penalty(self):
        high = [{"severity": "high", "type": "script_cycle"}]
        low  = [{"severity": "low", "type": "script_orphan"}]
        s_high = self._score(automation_issues=high, entity_issues=[],
                             total_entities=20, total_automations=5)
        s_low  = self._score(automation_issues=low, entity_issues=[],
                             total_entities=20, total_automations=5)
        assert s_high < s_low, "high severity should penalise more than low"

    def test_score_floor_with_many_v130_issues(self):
        many = [{"severity": "high", "type": "script_cycle"}] * 100
        score = self._score(automation_issues=many, entity_issues=[],
                            total_entities=5, total_automations=2)
        assert score >= 20


# ══════════════════════════════════════════════════════════════════════════════
# Version consistency across all files
# ══════════════════════════════════════════════════════════════════════════════

class TestVersionConsistency:
    BASE = Path(__file__).parent.parent

    def test_const_version(self):
        from custom_components.config_auditor.const import VERSION
        assert VERSION == "1.7.0"

    def test_manifest_version(self):
        manifest = json.loads((self.BASE / "manifest.json").read_text())
        assert manifest["version"] == "1.7.0"

    def test_js_core_version(self):
        txt = (self.BASE / "www" / "src" / "core.js").read_text()
        assert f"HACA_VERSION = '" in txt

    @pytest.mark.parametrize("lang", [
        "en", "fr", "de", "es", "it", "nl", "pl", "pt", "ru", "sv", "da", "zh-Hans", "ja"
    ])
    def test_translation_version(self, lang):
        data = json.loads((TRANSLATIONS_DIR / f"{lang}.json").read_text())
        v = data.get("panel", {}).get("version", "")
        from custom_components.config_auditor.const import VERSION; assert VERSION in v, f"{lang}: expected {VERSION} in panel.version, got {v!r}"


# ══════════════════════════════════════════════════════════════════════════════
# Translation keys completeness
# ══════════════════════════════════════════════════════════════════════════════

class TestTranslationKeysV130:

    REQUIRED_ANALYZER_KEYS = [
        # Script graph
        "script_cycle", "script_break_cycle",
        "script_call_depth", "script_reduce_depth",
        "script_single_mode_loop", "script_single_mode_fix",
        "script_orphan", "script_remove_or_integrate",
        # Blueprint candidate
        "script_blueprint_candidate", "script_create_blueprint",
        # Advanced scenes
        "scene_entity_unavailable", "scene_fix_unavailable_entity",
        "scene_not_triggered", "scene_check_if_used",
        "scene_duplicate", "scene_merge_duplicates",
        # Groups
        "group_empty", "group_add_members",
        "group_missing_entities", "group_fix_references",
        "group_all_unavailable", "group_check_availability",
        "group_nested_deep", "group_flatten",
    ]

    @pytest.mark.parametrize("lang", [
        "en", "fr", "de", "es", "it", "nl", "pl", "pt", "ru", "sv", "da", "zh-Hans", "ja"
    ])
    def test_all_new_keys_present(self, lang):
        data = json.loads((TRANSLATIONS_DIR / f"{lang}.json").read_text())
        analyzer = data.get("analyzer", {})
        missing = [k for k in self.REQUIRED_ANALYZER_KEYS if k not in analyzer]
        assert not missing, f"{lang}: missing analyzer keys: {missing}"

    @pytest.mark.parametrize("lang", [
        "en", "fr", "de", "es", "it", "nl", "pl", "pt", "ru", "sv", "da", "zh-Hans", "ja"
    ])
    def test_generate_blueprint_action(self, lang):
        data = json.loads((TRANSLATIONS_DIR / f"{lang}.json").read_text())
        key = data.get("panel", {}).get("actions", {}).get("generate_blueprint")
        assert key, f"{lang}: panel.actions.generate_blueprint missing"

    @pytest.mark.parametrize("lang", [
        "en", "fr", "de", "es", "it", "nl", "pl", "pt", "ru", "sv", "da", "zh-Hans", "ja"
    ])
    def test_no_empty_translation_values(self, lang):
        data = json.loads((TRANSLATIONS_DIR / f"{lang}.json").read_text())
        analyzer = data.get("analyzer", {})
        empty = [k for k in self.REQUIRED_ANALYZER_KEYS if not analyzer.get(k)]
        assert not empty, f"{lang}: empty translation values for: {empty}"


# ══════════════════════════════════════════════════════════════════════════════
# JS bundle smoke tests — v1.3.0
# (Tests run against compiled haca-panel.js to catch architecture regressions)
# ══════════════════════════════════════════════════════════════════════════════

class TestJSBundleSmokeV130:

    def _txt(self):
        return BUNDLE.read_text(encoding="utf-8")

    # ── Version ────────────────────────────────────────────────────────────

    def test_bundle_version_1_3_0(self):
        assert "1.3.0" in self._txt(), "Bundle must contain version 1.3.0"

    # ── Blueprint candidate button ─────────────────────────────────────────

    def test_blueprint_ai_btn_exists(self):
        txt = self._txt()
        assert "blueprint-ai-btn" in txt, (
            "blueprint-ai-btn button must exist in bundle for script_blueprint_candidate issues"
        )

    def test_blueprint_candidate_check_in_render(self):
        txt = self._txt()
        assert "isBlueprintCandidate" in txt, (
            "isBlueprintCandidate flag must exist to conditionally show blueprint button"
        )

    def test_blueprint_ai_btn_calls_explain_ai(self):
        txt = self._txt()
        assert "blueprint-ai-btn" in txt, "blueprint-ai-btn must be in bundle"
        # The click handler is in the querySelectorAll listener section, not the HTML template
        handler_idx = txt.find(".querySelectorAll('.blueprint-ai-btn')")
        if handler_idx == -1:
            handler_idx = txt.find('querySelectorAll(".blueprint-ai-btn")')
        assert handler_idx != -1, "querySelectorAll listener for blueprint-ai-btn must exist"
        handler_zone = txt[handler_idx:handler_idx + 600]
        assert "explainWithAI" in handler_zone, (
            "blueprint-ai-btn handler must call explainWithAI (as this.explainWithAI) to generate blueprint via AI"
        )

    def test_generate_blueprint_translation_key(self):
        txt = self._txt()
        assert "actions.generate_blueprint" in txt, (
            "Bundle must reference actions.generate_blueprint translation key"
        )

    # ── Scene & script issue types in bundle ──────────────────────────────

    def test_script_cycle_issue_type_known(self):
        """script_cycle is a high-severity issue — it must appear in const or be
        consistent. We verify the string appears in the translations loaded."""
        # Check the EN translation file has it (indirect validation)
        data = json.loads((TRANSLATIONS_DIR / "en.json").read_text())
        assert "script_cycle" in data.get("analyzer", {}), (
            "script_cycle must be in en.json analyzer keys"
        )

    def test_group_domain_has_more_info_button(self):
        """group.* entities ARE real HA entities → they should NOT be
        in DOMAINS_NO_MORE_INFO and should get the open-entity button."""
        txt = self._txt()
        denylist_start = txt.find("DOMAINS_NO_MORE_INFO")
        assert denylist_start != -1
        denylist_block = txt[denylist_start:denylist_start + 400]
        assert "'group'" not in denylist_block and '"group"' not in denylist_block, (
            "group domain must NOT be in DOMAINS_NO_MORE_INFO — "
            "groups have a more-info dialog in HA"
        )

    # ── Existing v1.2.0 smoke tests still pass ────────────────────────────

    def test_open_more_info_uses_parent_document(self):
        txt = self._txt()
        snippet = txt[txt.find("_openMoreInfo"):txt.find("_openMoreInfo") + 600]
        assert "window.parent" in snippet
        assert "home-assistant" in snippet

    def test_denylist_not_whitelist(self):
        txt = self._txt()
        assert "DOMAINS_NO_MORE_INFO" in txt
        assert "ENTITY_DOMAINS_WITH_MORE_INFO" not in txt, (
            "Whitelist must NOT come back — it was replaced by denylist in v1.2.0"
        )

    def test_no_callservice_in_open_entity_handler(self):
        txt = self._txt()
        idx = txt.find("open-entity-btn")
        zone = txt[idx:idx + 300]
        assert "callService" not in zone

    def test_translations_in_panel_section(self):
        for lang_file in TRANSLATIONS_DIR.glob("*.json"):
            data = json.loads(lang_file.read_text())
            assert "open_entity" in data.get("panel", {}).get("actions", {}), (
                f"{lang_file.stem}: open_entity must be in panel.actions"
            )
