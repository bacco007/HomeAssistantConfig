from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import EntityCategory

from .const import DOMAIN
from . import UniFiWanData

@dataclass(frozen=True, kw_only=True)
class UniFiBinaryEntityDescription(BinarySensorEntityDescription):
    value_fn: Callable[[UniFiWanData], bool] = lambda x: False

BINARY_SENSORS: tuple[UniFiBinaryEntityDescription, ...] = (
    UniFiBinaryEntityDescription(
        key="wan_internet",
        name="UniFi WAN Internet",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda d: any(d.wan_alive.values()) if d.wan_alive else bool(d.uplink.get("up")),
    ),
    UniFiBinaryEntityDescription(
        key="active_wan_up",
        name="UniFi Active WAN Up",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda d: bool(d.uplink.get("up")),
    ),
)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities):
    shared = hass.data[DOMAIN][entry.entry_id]
    device = shared["device_coordinator"]

    entry_id = entry.entry_id
    device_info = shared["device_info"]
    wan_numbers = shared["wan_numbers"]

    entities = []
    for desc in BINARY_SENSORS:
        entities.append(UniFiGenericBinary(device, entry_id, device_info, desc))

    for wan_number in wan_numbers:
        # The controller's last_wan_interfaces "alive" flag can stay stale for a
        # WAN whose cable is unplugged, so a WAN with no physical link is never
        # treated as having internet regardless of the reported alive state.
        internet = UniFiBinaryEntityDescription(
            key=f"wan{wan_number}_internet",
            name=f"UniFi WAN{wan_number} Internet",
            device_class=BinarySensorDeviceClass.CONNECTIVITY,
            value_fn=lambda d, wn=wan_number: bool(d.wan.get(wn, {}).get("up")) and d.wan_alive.get(wn, bool(d.wan.get(wn, {}).get("ip"))),
        )
        entities.append(UniFiGenericBinary(device, entry_id, device_info, internet))
        link = UniFiBinaryEntityDescription(
            key=f"wan{wan_number}_link",
            name=f"UniFi WAN{wan_number} Link",
            device_class=BinarySensorDeviceClass.CONNECTIVITY,
            value_fn=lambda d, wn=wan_number: bool(d.wan.get(wn, {}).get("up")),
        )
        entities.append(UniFiGenericBinary(device, entry_id, device_info, link))

    entities.append(UniFiSpeedtestInProgress(shared, entry_id, device_info))
    async_add_entities(entities)


class UniFiGenericBinary(CoordinatorEntity, BinarySensorEntity):
    entity_description: UniFiBinaryEntityDescription

    def __init__(self, coordinator, entry_id: str, device_info: dict[str, Any], description):
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_{description.key}"
        self._attr_device_info = device_info
        self.entity_description = description

    @property
    def is_on(self) -> bool:
        return self.entity_description.value_fn(self.coordinator.data)


class UniFiSpeedtestInProgress(BinarySensorEntity):
    _attr_name = "UniFi Speedtest In Progress"
    _attr_device_class = BinarySensorDeviceClass.RUNNING
    _attr_icon = "mdi:progress-clock"
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, shared, entry_id: str, device_info: dict[str, Any]):
        self._shared = shared
        self._attr_unique_id = f"{entry_id}_speedtest_in_progress"
        self._attr_device_info = device_info

    async def async_added_to_hass(self) -> None:
        signal = self._shared["speedtest_running_signal"]
        self.async_on_remove(
            async_dispatcher_connect(self.hass, signal, self._signal_update)
        )

    @callback
    def _signal_update(self) -> None:
        self.async_write_ha_state()

    @property
    def is_on(self) -> bool:
        return bool(self._shared["get_speedtest_running"]())
