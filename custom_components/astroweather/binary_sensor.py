"""
    Support for the AstroWeather from 7Timer
    This component will create a few binary sensors.

    For a full description, go here: https://github.com/mawinkler/astroweather

    Author: Markus Winkler
"""
import logging

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.typing import HomeAssistantType
from .const import (
    DOMAIN,
)
from .entity import AstroWeatherEntity

_LOGGER = logging.getLogger(__name__)

# Sensor types are defined like: Name, Unit Type, icon, device class
SENSOR_TYPES = {
    "deep_sky_view": ["Deep Sky View", None, "mdi:weather-night", "mdi:weather-fog"],
}


async def async_setup_entry(
    hass: HomeAssistantType, entry: ConfigEntry, async_add_entities
) -> None:

    """Set up the AstroWeather binary sensor platform."""
    _LOGGER.info("Set up AstroWeather binary sensor platform")

    fcst_coordinator = hass.data[DOMAIN][entry.entry_id]["fcst_coordinator"]
    if not fcst_coordinator.data:
        return False

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    if not coordinator.data:
        return False

    astroweather = hass.data[DOMAIN][entry.entry_id]["aw"]
    if not astroweather:
        return False

    sensors = []
    for sensor in SENSOR_TYPES:
        sensors.append(
            AstroWeatherBinarySensor(coordinator, entry.data, sensor, fcst_coordinator)
        )

    async_add_entities(sensors, True)
    return True


class AstroWeatherBinarySensor(AstroWeatherEntity, BinarySensorEntity):
    """Implementation of a AstroWeather Weatherflow Binary Sensor."""

    def __init__(self, coordinator, entries, sensor, fcst_coordinator):
        """Initialize the sensor."""
        super().__init__(coordinator, entries, sensor, fcst_coordinator)
        self._sensor = sensor
        self._device_class = SENSOR_TYPES[self._sensor][1]
        self._name = f"{DOMAIN.capitalize()} {SENSOR_TYPES[self._sensor][0]}"

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def is_on(self):
        """Return the state of the sensor."""
        return getattr(self.coordinator.data[0], self._sensor) is True

    @property
    def icon(self):
        """Icon to use in the frontend."""
        return SENSOR_TYPES[self._sensor][1]
