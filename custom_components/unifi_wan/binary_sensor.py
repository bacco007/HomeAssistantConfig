from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import EntityCategory

from .const import DOMAIN, CONF_HOST, CONF_SITE
from .__init__ import UniFiWanData

@dataclass
class UniFiBinaryEntityDescription(BinarySensorEntityDescription):
    value_fn: Callable[[UniFiWanData], bool] = lambda x: False

BINARY_SENSORS: tuple[UniFiBinaryEntityDescription, ...] = (
    UniFiBinaryEntityDescription(
        key="wan_internet",
        name="UniFi WAN Internet",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda d: bool(d.uplink.get("up")),
    ),
    UniFiBinaryEntityDescription(
        key="active_wan_up",
        name="UniFi Active WAN Up",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda d: bool(d.uplink.get("up")),
    )
)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities):
    shared = hass.data[DOMAIN][entry.entry_id]
    device = shared["device_coordinator"]
    meta = shared.get("dev_meta", {})
    
    host = shared["host"]
    site = shared["site"]
    devname = f"UniFi WAN ({host} / {site})"
    wan_numbers = shared["wan_numbers"]

    entities = []
    for desc in BINARY_SENSORS:
        entities.append(UniFiGenericBinary(device, host, site, devname, meta, desc))

    for wan_number in wan_numbers:
        internet = UniFiBinaryEntityDescription(
            key=f"wan{wan_number}_internet",
            name=f"UniFi WAN{wan_number} Internet",
            device_class=BinarySensorDeviceClass.CONNECTIVITY,
            value_fn=lambda d, wn=wan_number: bool(d.wan[wn].get("ip")),
        )
        entities.append(UniFiGenericBinary(device, host, site, devname, meta, internet))
        link = UniFiBinaryEntityDescription(
            key=f"wan{wan_number}_link",
            name=f"UniFi WAN{wan_number} Link",
            device_class=BinarySensorDeviceClass.CONNECTIVITY,
            value_fn=lambda d, wn=wan_number: bool(d.wan[wn].get("up")),
        )
        entities.append(UniFiGenericBinary(device, host, site, devname, meta, link))

    entities.append(UniFiSpeedtestInProgress(shared, host, site, devname, meta))
    async_add_entities(entities)


class UniFiGenericBinary(CoordinatorEntity, BinarySensorEntity):
    entity_description: UniFiBinaryEntityDescription

    def __init__(self, coordinator, host, site, devname, meta, description):
        super().__init__(coordinator)
        self._host = host
        self._site = site
        self._devname = devname
        self._meta = meta
        self.entity_description = description

    @property
    def unique_id(self):
        return f"{self._host}_{self._site}_{self.entity_description.key}"

    @property
    def device_info(self):
        return {
            "identifiers": {(DOMAIN, self._host, self._site)},
            "name": self._devname,
            "manufacturer": "Ubiquiti",
            "model": self._meta.get("model"),
            "sw_version": self._meta.get("sw_version"),
            "configuration_url": f"https://{self._host}/",
        }

    @property
    def is_on(self) -> bool:
        return self.entity_description.value_fn(self.coordinator.data)


class UniFiSpeedtestInProgress(BinarySensorEntity):
    _attr_name = "UniFi Speedtest In Progress"
    _attr_device_class = BinarySensorDeviceClass.RUNNING
    _attr_icon = "mdi:progress-clock"
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, shared, host, site, devname, meta):
        self._shared = shared
        self._host = host
        self._site = site
        self._devname = devname
        self._meta = meta
        self._unsub = None

    @property
    def unique_id(self):
        return f"{self._host}_{self._site}_speedtest_in_progress"

    @property
    def device_info(self):
        return {
            "identifiers": {(DOMAIN, self._host, self._site)},
            "name": self._devname,
            "manufacturer": "Ubiquiti",
            "model": self._meta.get("model"),
        }

    async def async_added_to_hass(self):
        signal = self._shared["speedtest_running_signal"]
        self._unsub = async_dispatcher_connect(self.hass, signal, self._signal_update)

    async def async_will_remove_from_hass(self):
        if self._unsub:
            self._unsub()

    def _signal_update(self):
        self.schedule_update_ha_state()

    @property
    def is_on(self) -> bool:
        return bool(self._shared["get_speedtest_running"]())