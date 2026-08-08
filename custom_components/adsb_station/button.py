"""Button platform for the ADS-B Station integration."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import AdsbStationConfigEntry, AdsbStationDataUpdateCoordinator
from .entity import AdsbStationEntity

# Updates are centralized through the coordinator
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: AdsbStationConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the button platform."""
    coordinator = entry.runtime_data
    if coordinator.client.aircraft_url:
        async_add_entities([AdsbStationResetRangeButton(coordinator)])


class AdsbStationResetRangeButton(AdsbStationEntity, ButtonEntity):
    """Clears the range record of every compass sector.

    The records only ever grow, which is what makes them useful, and also what
    makes them wrong the moment the antenna moves or a neighbour puts up a
    shed. This is how you start measuring again.
    """

    _attr_translation_key = "reset_range"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator) -> None:
        """Initialize the button."""
        super().__init__(coordinator, "reset_range")

    async def async_press(self) -> None:
        """Forget every sector record."""
        for sensor in self.coordinator.sector_sensors:
            sensor.reset()
