"""Tests for H.A.C.A sensor platform."""
from __future__ import annotations

import pytest
from unittest.mock import MagicMock, PropertyMock

# Minimal stubs for HA classes
import sys
from pathlib import Path

_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(_ROOT))


class FakeCoordinator:
    """Minimal DataUpdateCoordinator stub."""

    def __init__(self, data=None):
        self.data = data or {}


class FakeEntry:
    """Minimal ConfigEntry stub."""

    def __init__(self, entry_id="test_entry_123"):
        self.entry_id = entry_id


@pytest.fixture
def coordinator():
    return FakeCoordinator({
        "health_score": 85,
        "automation_issues": 3,
        "script_issues": 1,
        "scene_issues": 0,
        "blueprint_issues": 2,
        "entity_issues": 5,
        "helper_issues": 1,
        "performance_issues": 2,
        "security_issues": 0,
        "dashboard_issues": 1,
        "compliance_issues": 4,
        "total_issues": 19,
        "battery_alerts": 2,
        "battery_alert_7d": 1,
        "battery_count": 10,
    })


@pytest.fixture
def entry():
    return FakeEntry()


class TestSensorBase:
    """Test basic sensor initialization patterns."""

    def test_health_score_sensor(self, coordinator, entry):
        from config_auditor.sensor import HACAHealthScoreSensor
        sensor = HACAHealthScoreSensor(coordinator, entry)
        assert sensor.native_value == 85
        assert sensor._attr_unique_id == "test_entry_123_health_score"
        assert sensor._attr_icon == "mdi:heart-pulse"
        attrs = sensor.extra_state_attributes
        assert attrs["status"] == "good"
        assert attrs["color"] == "blue"

    def test_health_score_excellent(self, entry):
        coord = FakeCoordinator({"health_score": 95})
        from config_auditor.sensor import HACAHealthScoreSensor
        sensor = HACAHealthScoreSensor(coord, entry)
        assert sensor.extra_state_attributes["status"] == "excellent"

    def test_health_score_critical(self, entry):
        coord = FakeCoordinator({"health_score": 30})
        from config_auditor.sensor import HACAHealthScoreSensor
        sensor = HACAHealthScoreSensor(coord, entry)
        assert sensor.extra_state_attributes["status"] == "critical"

    def test_health_score_none_when_no_data(self, entry):
        coord = FakeCoordinator(None)
        from config_auditor.sensor import HACAHealthScoreSensor
        sensor = HACAHealthScoreSensor(coord, entry)
        assert sensor.native_value is None
        assert sensor.extra_state_attributes == {}

    def test_automation_issues_sensor(self, coordinator, entry):
        from config_auditor.sensor import HACAAutomationIssuesSensor
        sensor = HACAAutomationIssuesSensor(coordinator, entry)
        assert sensor.native_value == 3

    def test_total_issues_sensor(self, coordinator, entry):
        from config_auditor.sensor import HACATotalIssuesSensor
        sensor = HACATotalIssuesSensor(coordinator, entry)
        assert sensor.native_value == 19


class TestNewSensors:
    """Test the 3 newly added sensors."""

    def test_helper_issues_sensor(self, coordinator, entry):
        from config_auditor.sensor import HACAHelperIssuesSensor
        sensor = HACAHelperIssuesSensor(coordinator, entry)
        assert sensor.native_value == 1
        assert sensor._attr_unique_id == "test_entry_123_helper_issues"
        assert sensor._attr_icon == "mdi:tools"

    def test_compliance_issues_sensor(self, coordinator, entry):
        from config_auditor.sensor import HACAComplianceIssuesSensor
        sensor = HACAComplianceIssuesSensor(coordinator, entry)
        assert sensor.native_value == 4
        assert sensor._attr_unique_id == "test_entry_123_compliance_issues"
        assert sensor._attr_icon == "mdi:clipboard-check-outline"

    def test_battery_alerts_sensor(self, coordinator, entry):
        from config_auditor.sensor import HACABatteryAlertsSensor
        sensor = HACABatteryAlertsSensor(coordinator, entry)
        assert sensor.native_value == 2
        assert sensor._attr_unique_id == "test_entry_123_battery_alerts"
        assert sensor._attr_icon == "mdi:battery-alert-variant-outline"
        attrs = sensor.extra_state_attributes
        assert attrs["alert_7d"] == 1
        assert attrs["battery_count"] == 10

    def test_battery_alerts_no_data(self, entry):
        coord = FakeCoordinator(None)
        from config_auditor.sensor import HACABatteryAlertsSensor
        sensor = HACABatteryAlertsSensor(coord, entry)
        assert sensor.native_value is None
        assert sensor.extra_state_attributes == {}

    def test_helper_issues_defaults_to_zero(self, entry):
        coord = FakeCoordinator({})
        from config_auditor.sensor import HACAHelperIssuesSensor
        sensor = HACAHelperIssuesSensor(coord, entry)
        assert sensor.native_value == 0
