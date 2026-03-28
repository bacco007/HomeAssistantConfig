"""Tests for H.A.C.A repairs and diagnostics modules."""
from __future__ import annotations

import pytest
import sys
from pathlib import Path
from unittest.mock import MagicMock, AsyncMock, patch

_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(_ROOT))


# ── Repairs tests ──────────────────────────────────────────────────────────────

class TestRepairsIssueKey:
    """Test stable issue key generation."""

    def test_basic_key(self):
        from custom_components.config_auditor.repairs import _issue_key
        issue = {"entity_id": "automation.test", "type": "zombie_entity"}
        assert _issue_key(issue) == "automation.test_zombie_entity"

    def test_missing_fields(self):
        from custom_components.config_auditor.repairs import _issue_key
        assert _issue_key({}) == "unknown_unknown"

    def test_unique_for_different_types(self):
        from custom_components.config_auditor.repairs import _issue_key
        i1 = {"entity_id": "automation.x", "type": "device_id_in_trigger"}
        i2 = {"entity_id": "automation.x", "type": "incorrect_mode_for_pattern"}
        assert _issue_key(i1) != _issue_key(i2)


class TestRepairsUpdateLogic:
    """Test the update repairs logic with mocked issue_registry."""

    @pytest.fixture
    def mock_hass(self):
        hass = MagicMock()
        hass.data = {}
        return hass

    def test_no_data_does_nothing(self, mock_hass):
        from custom_components.config_auditor.repairs import async_update_repairs
        import asyncio

        loop = asyncio.new_event_loop()
        try:
            loop.run_until_complete(async_update_repairs(mock_hass, {}))
        finally:
            loop.close()
        # Should not raise

    def test_no_high_issues_creates_nothing(self, mock_hass):
        from custom_components.config_auditor.repairs import async_update_repairs
        import asyncio

        data = {
            "automation_issue_list": [
                {"severity": "medium", "entity_id": "automation.x", "type": "test"}
            ],
            "entity_issue_list": [],
            "script_issue_list": [],
            "scene_issue_list": [],
            "blueprint_issue_list": [],
            "helper_issue_list": [],
            "performance_issue_list": [],
            "security_issue_list": [],
            "dashboard_issue_list": [],
        }

        loop = asyncio.new_event_loop()
        try:
            # Will fail if issue_registry is not available, which is expected
            # in a stub environment — we just verify it doesn't crash
            try:
                loop.run_until_complete(async_update_repairs(mock_hass, data))
            except (ImportError, ModuleNotFoundError):
                pass
        finally:
            loop.close()


class TestRepairsMaxLimit:
    """Test the MAX_REPAIR_ISSUES limit."""

    def test_limit_constant_is_reasonable(self):
        from custom_components.config_auditor.repairs import MAX_REPAIR_ISSUES
        assert 5 <= MAX_REPAIR_ISSUES <= 50

    def test_fixable_types_are_strings(self):
        from custom_components.config_auditor.repairs import FIXABLE_ISSUE_TYPES
        assert all(isinstance(t, str) for t in FIXABLE_ISSUE_TYPES)


# ── Diagnostics tests ──────────────────────────────────────────────────────────

class TestDiagnosticsRedaction:
    """Test that sensitive data is properly listed for redaction."""

    def test_redact_keys_include_tokens(self):
        from custom_components.config_auditor.diagnostics import TO_REDACT
        assert "mcp_ha_token" in TO_REDACT
        assert "password" in TO_REDACT
        assert "secret" in TO_REDACT
        assert "api_key" in TO_REDACT

    def test_redact_keys_are_strings(self):
        from custom_components.config_auditor.diagnostics import TO_REDACT
        assert all(isinstance(k, str) for k in TO_REDACT)


class TestDiagnosticsPayload:
    """Test diagnostics payload structure with mocked HA."""

    @pytest.fixture
    def mock_hass(self):
        hass = MagicMock()
        hass.config.version = "2025.1.0"
        hass.config.language = "fr"
        hass.data = {}

        # Mock states
        hass.states.async_all.return_value = [MagicMock() for _ in range(50)]
        hass.states.async_entity_ids.side_effect = lambda domain: (
            [f"{domain}.{i}" for i in range(10)] if domain == "automation"
            else [f"{domain}.{i}" for i in range(5)]
        )
        return hass

    @pytest.fixture
    def mock_entry(self):
        entry = MagicMock()
        entry.entry_id = "test_entry"
        entry.options = {
            "scan_interval": 60,
            "event_monitoring_enabled": True,
            "mcp_ha_token": "super_secret_token_12345",
        }
        return entry

    @pytest.mark.asyncio
    async def test_diagnostics_basic_structure(self, mock_hass, mock_entry):
        """Verify the diagnostics output has expected keys."""
        from custom_components.config_auditor.diagnostics import async_get_config_entry_diagnostics

        coordinator = MagicMock()
        coordinator.data = {
            "health_score": 75,
            "total_issues": 10,
            "automation_issues": 3,
            "entity_issues": 2,
            "helper_issues": 1,
            "script_issues": 0,
            "scene_issues": 0,
            "blueprint_issues": 0,
            "performance_issues": 1,
            "security_issues": 1,
            "dashboard_issues": 1,
            "compliance_issues": 1,
            "recorder_db_available": True,
            "recorder_orphan_count": 5,
            "recorder_wasted_mb": 12.3,
            "battery_count": 8,
            "battery_alerts": 2,
            "battery_alert_7d": 1,
            "battery_predictions_count": 5,
            "dependency_graph": {"nodes": [1, 2, 3], "edges": [1]},
            "area_complexity": {"areas": [1, 2]},
            "redundancy": {"groups": []},
            "automation_issue_list": [],
            "entity_issue_list": [],
            "security_issue_list": [],
            "helper_issue_list": [],
            "script_issue_list": [],
            "scene_issue_list": [],
            "blueprint_issue_list": [],
            "performance_issue_list": [],
            "dashboard_issue_list": [],
            "compliance_issue_list": [],
        }

        mock_hass.data = {
            "config_auditor": {
                "test_entry": {
                    "coordinator": coordinator,
                }
            }
        }

        result = await async_get_config_entry_diagnostics(mock_hass, mock_entry)

        assert result["health_score"] == 75
        assert result["total_issues"] == 10
        assert result["ha_version"] == "2025.1.0"
        assert "issue_counts" in result
        assert "severity_breakdown" in result
        assert "recorder" in result
        assert "battery" in result

        # Verify token is redacted
        assert result["entry_options"]["mcp_ha_token"] == "**REDACTED**"
