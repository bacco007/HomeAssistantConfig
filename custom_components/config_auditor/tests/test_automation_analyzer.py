"""Unit + regression tests for AutomationAnalyzer — v1.1.2.

Covers:
  - Core analysis helpers (delay parsing, fingerprinting, Jaccard similarity)
  - haca_ignore integration (regression: entities must be skipped)
  - AutomationOptimizer deprecated pattern detection
  - _get_unavailable_trigger_entities state checks
"""
from __future__ import annotations

import pytest
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.tests.conftest import (
    MockHass, MockRegistryEntry, MockEntityRegistry,
)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _mock_er(registry=None):
    mock = MagicMock()
    mock.async_get.return_value = registry or MockEntityRegistry()
    return mock


def make_analyzer(hass=None, registry=None):
    import custom_components.config_auditor.automation_analyzer as _aa_mod
    if hass is None:
        hass = MockHass()
    er_mock = _mock_er(registry)
    _aa_mod.er = er_mock  # patch module-level 'er' directly (survives method calls)
    with patch("custom_components.config_auditor.automation_analyzer.TranslationHelper") as TH:
        TH.return_value.t = lambda key, **kw: key
        TH.return_value.async_load_language = AsyncMock()
        from custom_components.config_auditor.automation_analyzer import AutomationAnalyzer
        return AutomationAnalyzer(hass)


# ══════════════════════════════════════════════════════════════════════════════
# _parse_delay_to_minutes
# ══════════════════════════════════════════════════════════════════════════════

class TestParseDelayToMinutes:
    def setup_method(self):
        self.a = make_analyzer()

    def test_none_returns_none(self):
        assert self.a._parse_delay_to_minutes(None) is None

    def test_integer_seconds(self):
        assert self.a._parse_delay_to_minutes(60) == 1.0
        assert self.a._parse_delay_to_minutes(3600) == 60.0
        assert self.a._parse_delay_to_minutes(90) == 1.5

    def test_float_seconds(self):
        assert self.a._parse_delay_to_minutes(30.0) == 0.5

    def test_hhmmss_string(self):
        assert self.a._parse_delay_to_minutes("00:30:00") == 30.0
        assert self.a._parse_delay_to_minutes("01:00:00") == 60.0
        assert self.a._parse_delay_to_minutes("00:00:30") == 0.5
        assert self.a._parse_delay_to_minutes("02:15:00") == 135.0

    def test_mmss_string(self):
        assert self.a._parse_delay_to_minutes("30:00") == 30.0
        assert self.a._parse_delay_to_minutes("01:30") == 1.5

    def test_invalid_string_returns_none(self):
        assert self.a._parse_delay_to_minutes("not_a_delay") is None
        assert self.a._parse_delay_to_minutes("") is None

    def test_dict_with_minutes(self):
        assert self.a._parse_delay_to_minutes({"minutes": 5}) == 5

    def test_dict_with_hours(self):
        assert self.a._parse_delay_to_minutes({"hours": 1}) == 60

    def test_dict_with_seconds(self):
        assert self.a._parse_delay_to_minutes({"seconds": 120}) == 2.0

    def test_dict_mixed(self):
        assert self.a._parse_delay_to_minutes({"hours": 1, "minutes": 30}) == 90


# ══════════════════════════════════════════════════════════════════════════════
# _normalize_config
# ══════════════════════════════════════════════════════════════════════════════

class TestNormalizeConfig:
    def setup_method(self):
        self.a = make_analyzer()

    def test_empty_input(self):
        assert self.a._normalize_config(None) == ""
        assert self.a._normalize_config([]) == ""

    def test_key_order_irrelevant(self):
        assert self.a._normalize_config({"b": 2, "a": 1}) == self.a._normalize_config({"a": 1, "b": 2})

    def test_list_order_preserved(self):
        c1 = [{"service": "light.turn_on"}, {"service": "light.turn_off"}]
        c2 = [{"service": "light.turn_off"}, {"service": "light.turn_on"}]
        assert self.a._normalize_config(c1) != self.a._normalize_config(c2)

    def test_nested_structure(self):
        config = {"choose": [{"conditions": [], "sequence": [{"service": "notify.send"}]}]}
        assert "notify.send" in self.a._normalize_config(config)


# ══════════════════════════════════════════════════════════════════════════════
# _exact_fingerprint
# ══════════════════════════════════════════════════════════════════════════════

class TestExactFingerprint:
    def setup_method(self):
        self.a = make_analyzer()

    def test_identical_configs_same_hash(self):
        t = [{"platform": "state", "entity_id": "light.x", "to": "on"}]
        act = [{"service": "light.turn_off", "target": {"entity_id": "light.x"}}]
        assert self.a._exact_fingerprint(t, act) == self.a._exact_fingerprint(t, act)

    def test_different_entity_ids_give_different_fingerprint(self):
        t1 = [{"platform": "state", "entity_id": "light.room_a", "to": "on"}]
        t2 = [{"platform": "state", "entity_id": "light.room_b", "to": "on"}]
        act = [{"service": "light.turn_off"}]
        assert self.a._exact_fingerprint(t1, act) != self.a._exact_fingerprint(t2, act)

    def test_alias_stripped_from_fingerprint(self):
        t1 = [{"platform": "state", "entity_id": "light.x", "alias": "v1"}]
        t2 = [{"platform": "state", "entity_id": "light.x", "alias": "v2"}]
        assert self.a._exact_fingerprint(t1, []) == self.a._exact_fingerprint(t2, [])


# ══════════════════════════════════════════════════════════════════════════════
# _jaccard_tokens
# ══════════════════════════════════════════════════════════════════════════════

class TestJaccardTokens:
    def setup_method(self):
        self.a = make_analyzer()

    def _sim(self, a, b):
        sa = self.a._jaccard_tokens(a)
        sb = self.a._jaccard_tokens(b)
        if not sa or not sb:
            return 0.0
        return len(sa & sb) / len(sa | sb)

    def test_identical_automations_similarity_1(self):
        config = {"triggers": [{"platform": "state", "entity_id": "light.x"}],
                  "actions": [{"service": "light.turn_on"}]}
        assert self._sim(config, config) == 1.0

    def test_different_domains_low_similarity(self):
        light = {"triggers": [{"platform": "state", "entity_id": "light.x"}],
                 "actions": [{"service": "light.turn_on"}]}
        climate = {"triggers": [{"platform": "numeric_state", "entity_id": "sensor.temp"}],
                   "actions": [{"service": "climate.set_temperature"}]}
        assert self._sim(light, climate) < 0.5

    def test_same_logic_different_entity_ids_high_similarity(self):
        a = {"triggers": [{"platform": "state", "entity_id": "light.room_a", "to": "on"}],
             "actions": [{"service": "light.turn_off", "target": {"entity_id": "light.room_a"}}]}
        b = {"triggers": [{"platform": "state", "entity_id": "light.room_b", "to": "on"}],
             "actions": [{"service": "light.turn_off", "target": {"entity_id": "light.room_b"}}]}
        assert self._sim(a, b) >= 0.80


# ══════════════════════════════════════════════════════════════════════════════
# _get_unavailable_trigger_entities
# ══════════════════════════════════════════════════════════════════════════════

class TestGetUnavailableTriggerEntities:
    def setup_method(self):
        self.hass = MockHass()
        self.a = make_analyzer(self.hass)

    def test_available_entity_not_returned(self):
        self.hass.add_state("binary_sensor.motion", "on")
        config = {"triggers": [{"platform": "state", "entity_id": "binary_sensor.motion"}]}
        assert "binary_sensor.motion" not in self.a._get_unavailable_trigger_entities(config)

    def test_unavailable_entity_returned(self):
        self.hass.add_state("sensor.broken", "unavailable")
        config = {"triggers": [{"platform": "state", "entity_id": "sensor.broken"}]}
        assert "sensor.broken" in self.a._get_unavailable_trigger_entities(config)

    def test_unknown_state_returned(self):
        self.hass.add_state("sensor.unknown", "unknown")
        config = {"triggers": [{"platform": "state", "entity_id": "sensor.unknown"}]}
        assert "sensor.unknown" in self.a._get_unavailable_trigger_entities(config)

    def test_no_trigger_entities(self):
        config = {"triggers": [{"platform": "time", "at": "08:00:00"}]}
        assert self.a._get_unavailable_trigger_entities(config) == set()

    def test_list_entity_ids(self):
        self.hass.add_state("light.a", "unavailable")
        self.hass.add_state("light.b", "on")
        config = {"triggers": [{"platform": "state", "entity_id": ["light.a", "light.b"]}]}
        result = self.a._get_unavailable_trigger_entities(config)
        assert "light.a" in result
        assert "light.b" not in result


# ══════════════════════════════════════════════════════════════════════════════
# AutomationOptimizer — _detect_deprecated
# ══════════════════════════════════════════════════════════════════════════════

class TestDetectDeprecated:
    @pytest.fixture(autouse=True)
    def setup(self, tmp_path):
        (tmp_path / "automations.yaml").write_text("[]")
        (tmp_path / "scripts.yaml").write_text("{}")
        hass = MockHass(config_dir=str(tmp_path))
        from custom_components.config_auditor.automation_optimizer import AutomationOptimizer
        self.opt = AutomationOptimizer(hass)

    def test_is_state_detected(self):
        yaml_text = "condition: template\nvalue_template: '{{ is_state(\"light.x\", \"on\") }}'"
        assert any("is_state" in p for p in self.opt._detect_deprecated(yaml_text))

    def test_states_domain_detected(self):
        yaml_text = "value_template: '{{ states.light.salon.state }}'"
        assert any("states.domain" in p for p in self.opt._detect_deprecated(yaml_text))

    def test_clean_yaml_no_patterns(self):
        yaml_text = "triggers:\n  - platform: state\n    entity_id: binary_sensor.motion\nactions:\n  - service: light.turn_on\n"
        assert self.opt._detect_deprecated(yaml_text) == []

    def test_empty_yaml(self):
        assert self.opt._detect_deprecated("") == []
        assert self.opt._detect_deprecated(None) == []


# ══════════════════════════════════════════════════════════════════════════════
# haca_ignore — scan-level regression
# ══════════════════════════════════════════════════════════════════════════════

class TestHacaIgnoreInAutomationAnalyzer:
    """Regression: ignored entities must not appear in any issue list."""

    @pytest.mark.asyncio
    async def test_is_ignored_method_exists(self):
        a = make_analyzer()
        assert hasattr(a, "_is_ignored")
        assert callable(a._is_ignored)

    @pytest.mark.asyncio
    async def test_load_ignored_entities_method_exists(self):
        a = make_analyzer()
        assert hasattr(a, "_load_ignored_entities")

    @pytest.mark.asyncio
    async def test_ignored_entity_ids_attribute_initialized(self):
        a = make_analyzer()
        assert hasattr(a, "_ignored_entity_ids")
        assert isinstance(a._ignored_entity_ids, set)

    @pytest.mark.asyncio
    async def test_is_ignored_returns_false_by_default(self):
        a = make_analyzer()
        assert a._is_ignored("automation.anything") is False

    @pytest.mark.asyncio
    async def test_is_ignored_returns_true_after_load(self):
        entries = [MockRegistryEntry("automation.skip_me", labels={"haca_ignore"})]
        registry = MockEntityRegistry(entries)
        er_mock = _mock_er(registry)
        hass = MockHass()
        import custom_components.config_auditor.automation_analyzer as _aa_mod
        with patch("custom_components.config_auditor.automation_analyzer.TranslationHelper") as TH, \
             patch.object(_aa_mod, "er", er_mock):
            TH.return_value.t = lambda key, **kw: key
            TH.return_value.async_load_language = AsyncMock()
            from custom_components.config_auditor.automation_analyzer import AutomationAnalyzer
            a = AutomationAnalyzer(hass)
        _aa_mod.er = er_mock
        await a._load_ignored_entities()
        assert a._is_ignored("automation.skip_me") is True
        assert a._is_ignored("automation.normal") is False
