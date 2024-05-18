"""Sensor platform for Google Fit."""

from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.exceptions import ConfigEntryAuthFailed

from .const import DOMAIN, ENTITY_DESCRIPTIONS
from .coordinator import Coordinator
from .entity import GoogleFitEntity
from .api_types import GoogleFitSensorDescription


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_devices: AddEntitiesCallback
) -> None:
    """Set up the sensor platform."""
    entry_data = hass.data[DOMAIN][entry.entry_id]
    coordinator: Coordinator = entry_data.get("coordinator")
    async_add_devices(
        GoogleFitBlueprintSensor(
            coordinator=coordinator,
            entity_description=entity_description,
        )
        for entity_description in ENTITY_DESCRIPTIONS
    )


class GoogleFitBlueprintSensor(GoogleFitEntity, SensorEntity):
    """Google Fit Template Sensor class."""

    entity_description: GoogleFitSensorDescription
    coordinator: Coordinator

    def __init__(
        self,
        coordinator: Coordinator,
        entity_description: GoogleFitSensorDescription,
    ) -> None:
        """Initialise the sensor class."""
        super().__init__(coordinator)
        self.entity_description = entity_description
        self.coordinator = coordinator
        # Follow method in core Google Mail component and use oauth session to create unique ID
        if coordinator.oauth_session:
            self._attr_unique_id = (
                f"{coordinator.oauth_session.config_entry.entry_id}_"
                + f"{entity_description.key}_{entity_description.data_key}"
            )
        else:
            raise ConfigEntryAuthFailed(
                "No valid OAuth Session associated for this Google Fit Sensor"
            )

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self.coordinator.last_update_success

    def _read_value(self) -> None:
        if self.coordinator.current_data is not None:
            value = self.coordinator.current_data.get(self.entity_description.data_key)
            if value is not None:
                self._attr_native_value = value
                self.async_write_ha_state()

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._read_value()
