"""Tests for the haca_ignore label feature — v1.1.0.

Guards against:
  - Entities with haca_ignore label appearing in any scan result
  - _load_ignored_entities crashing when entity registry raises
  - _is_ignored returning False for non-ignored entities
  - dashboard_analyzer._add_issue using instance attr (not leaked local var)
  - battery_monitor respecting haca_ignore
"""
from __future__ import annotations

import pytest
import sys
from pathlib import Path
from unittest.mock import MagicMock, AsyncMock, patch

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.tests.conftest import (
    MockHass, MockRegistryEntry, MockEntityRegistry,
)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _make_registry(entries):
    return MockEntityRegistry(entries)


def _make_automation_analyzer(hass, registry):
    """Build AutomationAnalyzer and pre-wire it with the given registry."""
    with patch("custom_components.config_auditor.automation_analyzer.TranslationHelper") as TH:
        TH.return_value.t = lambda key, **kw: key
        TH.return_value.async_load_language = AsyncMock()
        from custom_components.config_auditor.automation_analyzer import AutomationAnalyzer
        a = AutomationAnalyzer(hass)

    # Override _load_ignored_entities to use our mock registry
    async def _mock_load():
        a._ignored_entity_ids = set()
        for entry in registry.entities.values():
            if "haca_ignore" in entry.labels:
                a._ignored_entity_ids.add(entry.entity_id)

    a._load_ignored_entities = _mock_load
    return a


def _make_entity_analyzer(hass, registry):
    with patch("custom_components.config_auditor.entity_analyzer.TranslationHelper") as TH:
        TH.return_value.t = lambda key, **kw: key
        TH.return_value.async_load_language = AsyncMock()
        from custom_components.config_auditor.entity_analyzer import EntityAnalyzer
        a = EntityAnalyzer(hass)

    async def _mock_load():
        result = set()
        for entry in registry.entities.values():
            if "haca_ignore" in entry.labels:
                result.add(entry.entity_id)
        return result

    a._load_ignored_entity_ids = _mock_load
    return a


# ══════════════════════════════════════════════════════════════════════════════
# AutomationAnalyzer — _load_ignored_entities / _is_ignored
# ══════════════════════════════════════════════════════════════════════════════

class TestAutomationAnalyzerIgnore:

    def _make(self, entries=None):
        hass = MockHass()
        registry = _make_registry(entries or [])
        return _make_automation_analyzer(hass, registry)

    @pytest.mark.asyncio
    async def test_ignored_entity_not_is_ignored_before_load(self):
        a = self._make()
        assert not a._is_ignored("automation.my_auto")

    @pytest.mark.asyncio
    async def test_load_ignored_entities_populates_set(self):
        entries = [
            MockRegistryEntry("automation.ignored_one", labels={"haca_ignore"}),
            MockRegistryEntry("automation.normal"),
        ]
        a = self._make(entries)
        await a._load_ignored_entities()
        assert a._is_ignored("automation.ignored_one")
        assert not a._is_ignored("automation.normal")

    @pytest.mark.asyncio
    async def test_multiple_labels_with_haca_ignore(self):
        entries = [MockRegistryEntry("light.x", labels={"haca_ignore", "other_label"})]
        a = self._make(entries)
        await a._load_ignored_entities()
        assert a._is_ignored("light.x")

    @pytest.mark.asyncio
    async def test_no_haca_ignore_label(self):
        entries = [MockRegistryEntry("light.y", labels={"some_other_label"})]
        a = self._make(entries)
        await a._load_ignored_entities()
        assert not a._is_ignored("light.y")

    @pytest.mark.asyncio
    async def test_registry_exception_silenced(self):
        """_load_ignored_entities must not propagate exceptions from the registry."""
        hass = MockHass()

        # Use real implementation with a broken registry mock
        import custom_components.config_auditor.automation_analyzer as _aa_mod
        orig_er = _aa_mod.er
        broken_er = MagicMock()
        broken_er.async_get.side_effect = RuntimeError("registry broken")
        _aa_mod.er = broken_er
        try:
            with patch("custom_components.config_auditor.automation_analyzer.TranslationHelper") as TH:
                TH.return_value.t = lambda key, **kw: key
                TH.return_value.async_load_language = AsyncMock()
                from custom_components.config_auditor.automation_analyzer import AutomationAnalyzer
                a = AutomationAnalyzer(hass)
            # Call the REAL method — it should not raise
            await AutomationAnalyzer._load_ignored_entities(a)
            assert len(a._ignored_entity_ids) == 0
        finally:
            _aa_mod.er = orig_er

    @pytest.mark.asyncio
    async def test_empty_registry(self):
        a = self._make([])
        await a._load_ignored_entities()
        assert len(a._ignored_entity_ids) == 0

    @pytest.mark.asyncio
    async def test_many_ignored_entities(self):
        entries = [
            MockRegistryEntry(f"automation.auto_{i}", labels={"haca_ignore"})
            for i in range(50)
        ]
        a = self._make(entries)
        await a._load_ignored_entities()
        assert len(a._ignored_entity_ids) == 50
        assert a._is_ignored("automation.auto_25")


# ══════════════════════════════════════════════════════════════════════════════
# EntityAnalyzer — _load_ignored_entity_ids
# ══════════════════════════════════════════════════════════════════════════════

class TestEntityAnalyzerIgnore:

    @pytest.mark.asyncio
    async def test_returns_set_of_ignored_ids(self):
        hass = MockHass()
        entries = [
            MockRegistryEntry("sensor.ignored", labels={"haca_ignore"}),
            MockRegistryEntry("sensor.normal"),
        ]
        registry = _make_registry(entries)
        a = _make_entity_analyzer(hass, registry)
        result = await a._load_ignored_entity_ids()
        assert "sensor.ignored" in result
        assert "sensor.normal" not in result

    @pytest.mark.asyncio
    async def test_registry_exception_returns_empty_set(self):
        hass = MockHass()

        import custom_components.config_auditor.entity_analyzer as _ea_mod
        orig_er = _ea_mod.er
        broken_er = MagicMock()
        broken_er.async_get.side_effect = Exception("broken")
        _ea_mod.er = broken_er
        try:
            with patch("custom_components.config_auditor.entity_analyzer.TranslationHelper") as TH:
                TH.return_value.t = lambda key, **kw: key
                TH.return_value.async_load_language = AsyncMock()
                from custom_components.config_auditor.entity_analyzer import EntityAnalyzer
                a = EntityAnalyzer(hass)
            from custom_components.config_auditor.entity_analyzer import EntityAnalyzer as EA
            result = await EA._load_ignored_entity_ids(a)
            assert isinstance(result, set)
            assert len(result) == 0
        finally:
            _ea_mod.er = orig_er


# ══════════════════════════════════════════════════════════════════════════════
# DashboardAnalyzer — _haca_ignored instance attribute
# ══════════════════════════════════════════════════════════════════════════════

class TestDashboardAnalyzerIgnore:
    """Regression: _haca_ignored was a local var in analyze_all(), invisible to _add_issue()."""

    def _make(self):
        hass = MockHass()
        with patch("custom_components.config_auditor.dashboard_analyzer.TranslationHelper") as TH, \
             patch("custom_components.config_auditor.dashboard_analyzer.er") as er_mock:
            TH.return_value.t = lambda key, **kw: key
            TH.return_value.async_load_language = AsyncMock()
            er_mock.async_get.return_value = MockEntityRegistry()
            from custom_components.config_auditor.dashboard_analyzer import DashboardAnalyzer
            return DashboardAnalyzer(hass)

    def test_add_issue_uses_instance_haca_ignored(self):
        d = self._make()
        d._haca_ignored = {"sensor.ignored_entity"}
        d.issues = []
        d._translator = MagicMock()
        d._translator.t = lambda key, **kw: key

        d._add_issue("sensor.ignored_entity", "Test Dashboard", "cards[0]")
        assert len(d.issues) == 0, "Ignored entity must not be added to issues"

    def test_add_issue_non_ignored_entity_appended(self):
        d = self._make()
        d._haca_ignored = set()
        d.issues = []
        d._translator = MagicMock()
        d._translator.t = lambda key, **kw: key

        d._add_issue("sensor.normal_entity", "Test Dashboard", "cards[0]")
        assert len(d.issues) == 1
        assert d.issues[0]["entity_id"] == "sensor.normal_entity"

    def test_add_issue_without_haca_ignored_uses_getattr_default(self):
        """_add_issue uses getattr(self, '_haca_ignored', set()) — must not raise."""
        d = self._make()
        if hasattr(d, "_haca_ignored"):
            del d._haca_ignored
        d.issues = []
        d._translator = MagicMock()
        d._translator.t = lambda key, **kw: key

        d._add_issue("sensor.x", "Dashboard", "cards[0]")
        assert len(d.issues) == 1


# ══════════════════════════════════════════════════════════════════════════════
# BatteryMonitor — haca_ignore
# ══════════════════════════════════════════════════════════════════════════════

class TestBatteryMonitorIgnore:

    @pytest.mark.asyncio
    async def test_ignored_battery_entity_not_in_results(self):
        hass = MockHass()
        hass.add_state("sensor.phone_battery", "5", {"unit_of_measurement": "%"})

        entries = [MockRegistryEntry("sensor.phone_battery", labels={"haca_ignore"})]
        registry = MockEntityRegistry(entries)

        import custom_components.config_auditor.battery_monitor as _bm_mod
        orig_er = _bm_mod.er
        er_mock = MagicMock()
        er_mock.async_get.return_value = registry
        _bm_mod.er = er_mock
        try:
            with patch("custom_components.config_auditor.battery_monitor.TranslationHelper") as TH:
                TH.return_value.t = lambda key, **kw: key
                TH.return_value.async_load_language = AsyncMock()
                from custom_components.config_auditor.battery_monitor import BatteryMonitor
                monitor = BatteryMonitor(hass)
            result = await monitor.analyze_all()
            ids = [r["entity_id"] for r in result]
            assert "sensor.phone_battery" not in ids, \
                "Battery entity with haca_ignore label must not appear in scan results"
        finally:
            _bm_mod.er = orig_er

    @pytest.mark.asyncio
    async def test_non_ignored_battery_entity_in_results(self):
        hass = MockHass()
        hass.add_state("sensor.door_battery", "3", {"unit_of_measurement": "%"})

        entries = [MockRegistryEntry("sensor.door_battery")]
        registry = MockEntityRegistry(entries)

        import custom_components.config_auditor.battery_monitor as _bm_mod
        orig_er = _bm_mod.er
        er_mock = MagicMock()
        er_mock.async_get.return_value = registry
        _bm_mod.er = er_mock
        try:
            with patch("custom_components.config_auditor.battery_monitor.TranslationHelper") as TH:
                TH.return_value.t = lambda key, **kw: key
                TH.return_value.async_load_language = AsyncMock()
                from custom_components.config_auditor.battery_monitor import BatteryMonitor
                monitor = BatteryMonitor(hass)
            result = await monitor.analyze_all()
            ids = [r["entity_id"] for r in result]
            assert "sensor.door_battery" in ids
        finally:
            _bm_mod.er = orig_er
