from __future__ import annotations

import logging

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import QBittorrentDataCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entites: AddEntitiesCallback,
) -> None:
    coordinator: QBittorrentDataCoordinator = hass.data[DOMAIN][config_entry.entry_id]
    entities = [QBittorrentAlternativeSpeedSwitch(coordinator, config_entry)]
    async_add_entites(entities)


class QBittorrentAlternativeSpeedSwitch(
    CoordinatorEntity[QBittorrentDataCoordinator], SwitchEntity
):
    def __init__(
        self,
        coordinator: QBittorrentDataCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{config_entry.entry_id}-alternative_speed_switch"
        self._attr_name = f"{config_entry.title} Alternative Speed"
        self._attr_available = False
        self._attr_device_info = self.coordinator.device_info

    @property
    def is_on(self) -> StateType:
        return self.coordinator.data["sync"].server_state["use_alt_speed_limits"]

    async def async_turn_on(self, **kwargs):
        await self.coordinator.client.transfer.set_speed_limits_mode(1)
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs):
        await self.coordinator.client.transfer.set_speed_limits_mode(0)
        await self.coordinator.async_request_refresh()
