"""Binary sensor: is the sun above the local horizon right now?"""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import RealHorizonConfigEntry
from .const import DOMAIN
from .coordinator import RealHorizonCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RealHorizonConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([SunAboveLocalHorizon(entry.runtime_data, entry)])


class SunAboveLocalHorizon(
    CoordinatorEntity[RealHorizonCoordinator], BinarySensorEntity
):
    _attr_has_entity_name = True
    _attr_translation_key = "above_local_horizon"

    def __init__(
        self,
        coordinator: RealHorizonCoordinator,
        entry: RealHorizonConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_above_local_horizon"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name="Real Horizon",
            manufacturer="PVGIS / SRTM",
            entry_type=DeviceEntryType.SERVICE,
        )

    @property
    def is_on(self) -> bool | None:
        return self.coordinator.data.above_horizon
