"""Button entities for SkyRadar Fusion."""

from homeassistant.components.button import ButtonEntity
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceInfo
from .const import DOMAIN


async def async_setup_entry(hass, config_entry, async_add_entities):
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    async_add_entities([SkyRadarFusionClearButton(coordinator)])


class SkyRadarFusionClearButton(ButtonEntity):
    has_entity_name = True

    def __init__(self, coordinator):
        self.coordinator = coordinator
        self._attr_name = "Clear Additional tracked"
        self._attr_icon = "mdi:refresh"
        self._attr_unique_id = f"{coordinator.config_entry.entry_id}_clear_track"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.config_entry.entry_id)},
            name="SkyRadar Fusion",
            manufacturer="DonTranQuiL",
            model="Hybrid ADS-B Engine",
            configuration_url="https://github.com/DonTranQuiL/ADSB-For-Home-assistant",
        )

    async def async_press(self) -> None:
        self.coordinator.clear_tracks()

        registry = er.async_get(self.hass)
        entries = er.async_entries_for_config_entry(
            registry, self.coordinator.config_entry.entry_id
        )
        for entry in entries:
            if entry.domain == "device_tracker":
                registry.async_remove(entry.entity_id)

        await self.coordinator.async_request_refresh()
