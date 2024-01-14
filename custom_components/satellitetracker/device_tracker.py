"""Support for tracking a Satellite as device tracker."""

from homeassistant.components.device_tracker.config_entry import TrackerEntity
from homeassistant.components.device_tracker.const import DOMAIN as DEVICE_TRACKER
from homeassistant.components.device_tracker.const import SourceType
from homeassistant.const import ATTR_NAME
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import N2YOSatelliteCoordinator

from .const import (
    DOMAIN,
    ATTR_IDENTIFIERS,
    ATTR_MANUFACTURER,
    ATTR_MODEL,
    COORDINATOR,
)


async def async_setup_entry(hass, entry, async_add_entities):
    """Set up the device tracker platforms."""

    coordinator = hass.data[DOMAIN][entry.entry_id][COORDINATOR]
    entities = []

    entities.append(SatelliteTracker(coordinator=coordinator))

    async_add_entities(entities)


class SatelliteTracker(CoordinatorEntity, TrackerEntity):
    """Defines a satellite tracker."""
    @property
    def unique_id(self):
        """Return the unique_id of the sensor."""
        return f"{self.coordinator._satellite}_location"

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self.coordinator.last_update_success

    @property
    def icon(self):
        """Return the icon for the sensor."""
        return "mdi:satellite-variant"

    @property
    def name(self):
        """Return the name of the sensor."""
        return self.coordinator._name

    @property
    def latitude(self):
        """Return the current latitude of the satellite."""
        return self.coordinator.data["positions"]["positions"][0]["satlatitude"]

    @property
    def longitude(self):
        """Return the current longitude of the satellite."""
        return self.coordinator.data["positions"]["positions"][0]["satlongitude"]

    @property
    def source_type(self):
        """Return the source type of the client."""
        return SourceType.GPS

    @property
    def device_info(self):
        """Define the device as a device tracker system."""

        device_name = self.coordinator._name
        device_model = "Satellite Sensor"

        return {
            ATTR_IDENTIFIERS: {(DOMAIN, self.coordinator._satellite)},
            ATTR_NAME: device_name,
            ATTR_MANUFACTURER: "N2YO.com",
            ATTR_MODEL: device_model,
        }
        