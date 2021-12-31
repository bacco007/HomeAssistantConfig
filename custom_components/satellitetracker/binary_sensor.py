"""Definition and setup of a Binary Sensor for Satellite Trackers in Home Assistant."""

import logging
import time

from homeassistant.util.dt import as_local, utc_from_timestamp
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.const import ATTR_NAME
from homeassistant.components.sensor import ENTITY_ID_FORMAT
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import N2YOSatelliteCoordinator
from .const import (
    ATTR_IDENTIFIERS, 
    ATTR_MANUFACTURER, 
    ATTR_MODEL, 
    DOMAIN, 
    COORDINATOR,
    CONF_MIN_ALERT,
    DEFAULT_MIN_ALERT,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass, entry, async_add_entities):
    """Set up the binary sensor platforms."""

    coordinator = hass.data[DOMAIN][entry.entry_id][COORDINATOR]
    sensors = []
    conf = entry.data
    min_alert = entry.options.get(CONF_MIN_ALERT, DEFAULT_MIN_ALERT)                                 

    sensors.append(
        SatellitePassSensor(
            coordinator,
            latitude=conf["latitude"],
            longitude=conf["longitude"],
            elevation=conf["elevation"],
            min_alert=min_alert,
        )
    )

    async_add_entities(sensors)


class SatellitePassSensor(CoordinatorEntity, BinarySensorEntity):
    """Defines a Satellite Pass Warning Binary sensor."""

    def __init__(
        self, 
        coordinator: N2YOSatelliteCoordinator, 
        latitude: float,
        longitude: float,
        elevation: float,
        min_alert: int,
        ):
        """Initialize Entities."""

        super().__init__(coordinator=coordinator)

        self._name = f"{self.coordinator._name} 10 Minute Pass Warning"
        self._unique_id = f"{self.coordinator._satellite}_{latitude}_{longitude}_{elevation}"
        self._state = None
        self._min_alert = min_alert
        self.attrs = {}

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self.coordinator.last_update_success

    @property
    def unique_id(self):
        """Return the unique Home Assistant friendly identifier for this entity."""
        return self._unique_id

    @property
    def name(self):
        """Return the friendly name of this entity."""
        return self._name

    @property
    def icon(self):
        """Return the icon for this entity."""
        return "mdi:satellite-variant"

    @property
    def extra_state_attributes(self):
        """Return the attributes."""
        return self.attrs

    @property
    def device_info(self):
        """Define the device based on device_identifier."""

        device_name = self.coordinator._name
        device_model = "Satellite Sensor"

        return {
            ATTR_IDENTIFIERS: {(DOMAIN, self.coordinator._satellite)},
            ATTR_NAME: device_name,
            ATTR_MANUFACTURER: "N2YO.com",
            ATTR_MODEL: device_model,
        }

    @property
    def is_on(self) -> bool:
        """Return the state."""
        if self.coordinator.data["visual_passes"]:
            next_pass = self.coordinator.data["visual_passes"][0]

            if next_pass["startUTC"] < (
                time.time() + (10 * 60)
            ) and next_pass["startUTC"] > (
                time.time()
            ) and next_pass["maxEl"] > self._min_alert:
                return True

        return False


