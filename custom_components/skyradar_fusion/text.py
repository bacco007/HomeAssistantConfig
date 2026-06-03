"""Text entities for SkyRadar Fusion."""

from homeassistant.components.text import TextEntity
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceInfo
from .const import DOMAIN


async def async_setup_entry(hass, config_entry, async_add_entities):
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    async_add_entities(
        [SkyRadarFusionAddText(coordinator), SkyRadarFusionRemoveText(coordinator)]
    )


class SkyRadarFusionTextBase(TextEntity):
    has_entity_name = True

    def __init__(self, coordinator):
        self.coordinator = coordinator
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.config_entry.entry_id)},
            name="SkyRadar Fusion",
            manufacturer="DonTranQuiL",
            model="Hybrid ADS-B Engine",
            configuration_url="https://github.com/DonTranQuiL/ADSB-For-Home-assistant",
        )
        self._attr_native_value = ""


class SkyRadarFusionAddText(SkyRadarFusionTextBase):
    def __init__(self, coordinator):
        super().__init__(coordinator)
        self._attr_name = "Add to track"
        self._attr_icon = "mdi:airplane-plus"
        self._attr_unique_id = f"{coordinator.config_entry.entry_id}_add_track"

    async def async_set_value(self, value: str) -> None:
        """Set new value."""
        if value:
            self.coordinator.add_track(value)

            self._attr_native_value = ""
            self.async_write_ha_state()

            await self.coordinator.async_request_refresh()


class SkyRadarFusionRemoveText(SkyRadarFusionTextBase):
    def __init__(self, coordinator):
        super().__init__(coordinator)
        self._attr_name = "Remove from track"
        self._attr_icon = "mdi:airplane-minus"
        self._attr_unique_id = f"{coordinator.config_entry.entry_id}_remove_track"

    async def async_set_value(self, value: str) -> None:
        clean_val = value.strip().upper().replace(" ", "")
        if not clean_val:
            return

        # KICK FOR STANDALONE TRACKERS
        registry = er.async_get(self.hass)
        entries = er.async_entries_for_config_entry(
            registry, self.coordinator.config_entry.entry_id
        )
        for entry in entries:
            if entry.domain == "device_tracker":
                if (
                    clean_val in entry.entity_id.upper()
                    or clean_val in (entry.original_name or "").upper()
                ):
                    registry.async_remove(entry.entity_id)

        self.coordinator.remove_track(clean_val)
        self._attr_native_value = ""
        self.async_write_ha_state()
        await self.coordinator.async_request_refresh()
