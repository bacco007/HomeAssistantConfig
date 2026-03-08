"""Shared pytest fixtures for H.A.C.A v1.1.2 tests.

Run with:
    pip install pytest pytest-asyncio
    pytest tests/ -v

No real HA installation required — all HA dependencies are stubbed here.
"""
from __future__ import annotations

import sys
import json
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock
import pytest

# ── Make custom_components importable ────────────────────────────────────────
_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(_ROOT))


# ═══════════════════════════════════════════════════════════════════════════
# Minimal HA object stubs
# ═══════════════════════════════════════════════════════════════════════════

class MockState:
    def __init__(self, entity_id: str, state: str = "on", attributes: dict | None = None):
        self.entity_id = entity_id
        self.state = state
        self.attributes = attributes or {}


class _MockStatesProxy:
    def __init__(self, store: dict):
        self._store = store

    def get(self, entity_id: str):
        return self._store.get(entity_id)

    def async_entity_ids(self, domain: str):
        return [eid for eid in self._store if eid.startswith(domain + ".")]

    def async_all(self):
        return list(self._store.values())


class MockRegistryEntry:
    """Minimal entity registry entry with label support (v1.1.2: haca_ignore)."""

    def __init__(
        self,
        entity_id: str,
        *,
        labels: set | None = None,
        disabled_by=None,
        device_id: str | None = None,
        platform: str = "test",
        unique_id: str | None = None,
    ):
        self.entity_id = entity_id
        self.labels: set = labels or set()
        self.disabled_by = disabled_by
        self.device_id = device_id
        self.platform = platform
        self.unique_id = unique_id or entity_id


class MockEntityRegistry:
    """Minimal entity registry mock."""

    def __init__(self, entries: list | None = None):
        self._entries: dict = {}
        for e in (entries or []):
            self._entries[e.entity_id] = e

    @property
    def entities(self):
        return self._entries

    def async_get(self, entity_id: str):
        return self._entries.get(entity_id)

    def add(self, entry) -> None:
        self._entries[entry.entity_id] = entry


class MockHass:
    """Minimal HomeAssistant mock sufficient for all HACA unit tests."""

    def __init__(self, config_dir: str = "/tmp/haca_test"):
        self.config = MagicMock()
        self.config.config_dir = config_dir
        self.config.language = "en"
        self._states: dict = {}
        self.states = _MockStatesProxy(self._states)
        self.loop = MagicMock()
        self.bus = MagicMock()
        self.data: dict = {}
        self.config_entries = MagicMock()
        self.config_entries.async_entries = MagicMock(return_value=[])
        self.services = MagicMock()
        self.services.async_call = AsyncMock(return_value=None)
        self._entity_registry = MockEntityRegistry()

    def add_state(self, entity_id: str, state: str = "on", attributes: dict | None = None):
        self._states[entity_id] = MockState(entity_id, state, attributes or {})

    def add_registry_entry(self, entry) -> None:
        self._entity_registry.add(entry)
        if entry.entity_id not in self._states:
            self._states[entry.entity_id] = MockState(entry.entity_id)

    async def async_add_executor_job(self, func, *args):
        return func(*args)


# ═══════════════════════════════════════════════════════════════════════════
# Pytest fixtures
# ═══════════════════════════════════════════════════════════════════════════

@pytest.fixture
def mock_hass(tmp_path):
    """MockHass with a temporary config directory and standard YAML stubs."""
    hass = MockHass(config_dir=str(tmp_path))
    (tmp_path / "automations.yaml").write_text("[]", encoding="utf-8")
    (tmp_path / "scripts.yaml").write_text("{}", encoding="utf-8")
    (tmp_path / "scenes.yaml").write_text("[]", encoding="utf-8")
    return hass


@pytest.fixture
def mock_hass_fr(tmp_path):
    """French-language MockHass."""
    hass = MockHass(config_dir=str(tmp_path))
    hass.config.language = "fr"
    hass.data["config_auditor"] = {"user_language": "fr"}
    (tmp_path / "automations.yaml").write_text("[]", encoding="utf-8")
    (tmp_path / "scripts.yaml").write_text("{}", encoding="utf-8")
    (tmp_path / "scenes.yaml").write_text("[]", encoding="utf-8")
    return hass


@pytest.fixture
def translations_dir():
    return Path(__file__).parent.parent / "translations"


@pytest.fixture
def en_translations(translations_dir):
    with open(translations_dir / "en.json", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def fr_translations(translations_dir):
    with open(translations_dir / "fr.json", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def sample_automation():
    return {
        "id": "test_auto_001",
        "alias": "Test Automation",
        "description": "A test automation",
        "mode": "single",
        "triggers": [{"platform": "state", "entity_id": "binary_sensor.motion", "to": "on"}],
        "conditions": [],
        "actions": [{"service": "light.turn_on", "target": {"entity_id": "light.living_room"}}],
    }


@pytest.fixture
def god_automation():
    actions = [
        {"service": "light.turn_on", "target": {"entity_id": f"light.room_{i}"}}
        for i in range(20)
    ]
    actions += [
        {"condition": "state", "entity_id": f"sensor.temp_{i}", "state": "high"}
        for i in range(5)
    ]
    return {
        "id": "god_auto_001",
        "alias": "God Automation",
        "triggers": [
            {"platform": "state", "entity_id": f"sensor.motion_{i}"}
            for i in range(6)
        ],
        "conditions": [
            {"condition": "state", "entity_id": "input_boolean.enabled", "state": "on"},
        ] * 4,
        "actions": actions,
    }
