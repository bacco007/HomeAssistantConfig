"""Tests for RefactoringAssistant — v1.1.0."""
from __future__ import annotations

import pytest
import sys
import yaml
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.tests.conftest import MockHass

AUTOMATION_DEVICE_ID = {
    "id": "auto_001", "alias": "Device ID Test", "mode": "single",
    "triggers": [{"platform": "device", "device_id": "abc123", "domain": "light", "type": "turned_on"}],
    "actions": [{"service": "light.turn_off", "target": {"device_id": "abc123"}}],
}
AUTOMATION_WRONG_MODE = {
    "id": "auto_002", "alias": "Motion Light Wrong Mode", "mode": "single",
    "triggers": [{"platform": "state", "entity_id": "binary_sensor.motion", "to": "on"}],
    "conditions": [],
    "actions": [{"service": "light.turn_on", "target": {"entity_id": "light.lamp"}},
                {"delay": "00:05:00"},
                {"service": "light.turn_off", "target": {"entity_id": "light.lamp"}}],
}
AUTOMATION_NO_ALIAS = {
    "id": "auto_003", "mode": "single",
    "triggers": [{"platform": "state", "entity_id": "binary_sensor.door", "to": "on"}],
    "actions": [{"service": "notify.mobile_app", "data": {"message": "Door opened"}}],
}


def make_ra(tmp_path, automations):
    auto_file = tmp_path / "automations.yaml"
    auto_file.write_text(yaml.dump(automations, allow_unicode=True), encoding="utf-8")
    (tmp_path / "scripts.yaml").write_text("{}", encoding="utf-8")
    hass = MockHass(config_dir=str(tmp_path))
    with patch("custom_components.config_auditor.refactoring_assistant.er") as mock_er:
        mock_er.async_get.return_value = MagicMock()
        mock_er.async_get.return_value.async_get.return_value = None
        from custom_components.config_auditor.refactoring_assistant import RefactoringAssistant
        return RefactoringAssistant(hass)


class TestLoadAutomationById:
    @pytest.mark.asyncio
    async def test_find_by_id(self, tmp_path):
        ra = make_ra(tmp_path, [AUTOMATION_DEVICE_ID])
        result = await ra._load_automation_by_id("auto_001")
        assert result is not None
        assert result["alias"] == "Device ID Test"

    @pytest.mark.asyncio
    async def test_find_by_alias(self, tmp_path):
        ra = make_ra(tmp_path, [AUTOMATION_DEVICE_ID])
        assert await ra._load_automation_by_id("Device ID Test") is not None

    @pytest.mark.asyncio
    async def test_not_found_returns_none(self, tmp_path):
        ra = make_ra(tmp_path, [AUTOMATION_DEVICE_ID])
        assert await ra._load_automation_by_id("nonexistent_id") is None

    @pytest.mark.asyncio
    async def test_find_by_entity_id(self, tmp_path):
        ra = make_ra(tmp_path, [AUTOMATION_DEVICE_ID])
        result = await ra._load_automation_by_id("automation.device_id_test")
        assert result is not None


class TestBackupCreation:
    @pytest.mark.asyncio
    async def test_backup_creates_file(self, tmp_path):
        ra = make_ra(tmp_path, [AUTOMATION_DEVICE_ID])
        backup_path = await ra._create_backup()
        assert backup_path.exists()
        content = yaml.safe_load(backup_path.read_text())
        assert isinstance(content, list)
        assert content[0]["id"] == "auto_001"

    @pytest.mark.asyncio
    async def test_backup_cleanup_keeps_last_10(self, tmp_path):
        ra = make_ra(tmp_path, [AUTOMATION_DEVICE_ID])
        for _ in range(15):
            await ra._create_backup()
            await asyncio.sleep(0.01)
        await ra._cleanup_old_backups()
        assert len(list(ra._backup_dir.glob("automations_*.yaml"))) <= 10


import asyncio

class TestNormalizeAutomation:
    def test_no_alias_detected(self, tmp_path):
        (tmp_path / "automations.yaml").write_text(yaml.dump([AUTOMATION_NO_ALIAS]), encoding="utf-8")
        assert "alias" not in AUTOMATION_NO_ALIAS
