"""Switch platform for Hass Data Points monitor devices."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DOMAIN,
    KEY_ADD_SWITCH_ENTITIES,
    KEY_MONITOR_SWITCHES,
    KEY_STORE,
)
from .store import DatapointsStore


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Hass Data Points switch entities from a config entry."""
    store: DatapointsStore = hass.data[DOMAIN][KEY_STORE]

    hass.data[DOMAIN][KEY_ADD_SWITCH_ENTITIES] = async_add_entities
    hass.data[DOMAIN][KEY_MONITOR_SWITCHES] = {}

    entities: list[SwitchEntity] = []
    for monitor in store.get_monitors():
        mid = monitor["id"]
        switch = DatapointsMonitorEnabledSwitch(entry, store, hass, mid)
        hass.data[DOMAIN][KEY_MONITOR_SWITCHES][mid] = switch
        entities.append(switch)

    async_add_entities(entities)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------


def _monitor_device_info(
    entry: ConfigEntry, store: DatapointsStore, monitor_id: str
) -> DeviceInfo:
    monitor = store.get_monitor(monitor_id) or {}
    return DeviceInfo(
        identifiers={(DOMAIN, f"{entry.entry_id}_monitor_{monitor_id}")},
        name=monitor.get("name", f"Anomaly monitor {monitor_id[:8]}"),
        manufacturer="buggedcom",
        model="Anomaly Monitor",
        via_device=(DOMAIN, entry.entry_id),
    )


# ---------------------------------------------------------------------------
# Monitor enabled switch
# ---------------------------------------------------------------------------


class DatapointsMonitorEnabledSwitch(SwitchEntity):
    """Switch that enables or disables an anomaly monitor."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:bell-outline"

    def __init__(
        self,
        entry: ConfigEntry,
        store: DatapointsStore,
        hass: HomeAssistant,
        monitor_id: str,
    ) -> None:
        self._entry = entry
        self._store = store
        self._hass = hass
        self._monitor_id = monitor_id
        self._unsub_store: Any = None
        self._attr_unique_id = f"{entry.entry_id}_monitor_{monitor_id}_enabled"
        self._attr_name = "Enabled"
        self._attr_is_on = self._current_enabled()

    @property
    def device_info(self) -> DeviceInfo:
        return _monitor_device_info(self._entry, self._store, self._monitor_id)

    @property
    def is_on(self) -> bool:
        return self._current_enabled()

    def _current_enabled(self) -> bool:
        monitor = self._store.get_monitor(self._monitor_id)
        return bool(monitor.get("enabled", True)) if monitor else False

    async def async_added_to_hass(self) -> None:
        self._unsub_store = self._store.async_add_listener(self._on_store_update)
        self.async_on_remove(self._cleanup)

    def _cleanup(self) -> None:
        if self._unsub_store:
            self._unsub_store()
            self._unsub_store = None

    def _on_store_update(self) -> None:
        self.async_write_ha_state()

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self._store.async_update_monitor(self._monitor_id, {"enabled": True})

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self._store.async_update_monitor(self._monitor_id, {"enabled": False})
