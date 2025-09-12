"""
Sensor Support for Weather.com weather service.
For more details about this platform, please refer to the documentation at
https://github.com/jaydeethree/Home-Assistant-weatherdotcom
"""
from __future__ import annotations

import logging

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import generate_entity_id
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util.unit_system import METRIC_SYSTEM

from .coordinator import WeatherUpdateCoordinator

from .const import (
    CONF_ATTRIBUTION,
    DOMAIN,
    FIELD_DAYPART,
    FIELD_WINDGUST,
    FIELD_WINDSPEED,
    RESULTS_CURRENT,
    RESULTS_FORECAST_DAILY,
    RESULTS_FORECAST_HOURLY
)
from .weather_current_conditions_sensors import *

_LOGGER = logging.getLogger(__name__)

# Declaration of supported Weather.com observation/condition sensors
SENSOR_DESCRIPTIONS: tuple[WeatherSensorEntityDescription, ...] = (
    current_condition_sensor_descriptions
)


async def async_setup_entry(
        hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Add Weather.com entities from a config_entry."""
    coordinator: WeatherUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]
    sensors = [
        WeatherSensor(coordinator, description) for description in SENSOR_DESCRIPTIONS
    ]

    async_add_entities(sensors)


class WeatherSensor(CoordinatorEntity, SensorEntity):
    """Implementing the Weather.com sensor."""
    _attr_has_entity_name = True
    _attr_attribution = CONF_ATTRIBUTION
    entity_description: WeatherSensorEntityDescription

    def __init__(
            self,
            coordinator: WeatherUpdateCoordinator,
            description: WeatherSensorEntityDescription,
    ):
        super().__init__(coordinator)
        self.entity_description = description

        entity_id_format = description.key + ".{}"

        self._attr_unique_id = f"{self.coordinator.location_name},{description.key}".lower()
        self.entity_id = generate_entity_id(
            entity_id_format, f"{self.coordinator.location_name}_{description.name}", hass=coordinator.hass
        )
        self._unit_system = coordinator.unit_system
        self._attr_device_info = coordinator.device_info
        if description.key == 'latitude':
            self._sensor_data = coordinator._latitude
        elif description.key == 'longitude':
            self._sensor_data = coordinator._longitude
        else:
            self._sensor_data = _get_sensor_data(
                coordinator.data, description.key, self._unit_system)
        self._attr_native_unit_of_measurement = self.entity_description.unit_fn(
            self.coordinator.hass.config.units is METRIC_SYSTEM)

    @property
    def available(self) -> bool:
        """Return if weather data is available."""
        return self.coordinator.data is not None

    @property
    def name(self):
        """Return the name of the sensor."""
        if self.entity_description.key in self.coordinator._tranfile.keys() or \
                self.entity_description.key in self.coordinator._tranfile[FIELD_DAYPART].keys():
            return self.coordinator._tranfile[self.entity_description.key]

        return self.entity_description.name

    @property
    def native_value(self) -> StateType:
        """Return the state."""
        return self.entity_description.value_fn(self._sensor_data, self._unit_system)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        return self.entity_description.attr_fn(self.coordinator.data)

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle data update."""
        if self.entity_description.key == 'latitude':
            self._sensor_data = self.coordinator._latitude
        elif self.entity_description.key == 'longitude':
            self._sensor_data = self.coordinator._longitude
        else:
            self._sensor_data = _get_sensor_data(
                self.coordinator.data, self.entity_description.key, self._unit_system
            )
        self.async_write_ha_state()


def _get_sensor_data(
        sensors: dict[str, Any],
        kind: str,
        unit_system: str
) -> Any:
    """Get sensor data."""
    # windGust is often null. When it is, set it to windSpeed instead.
    if sensors[RESULTS_CURRENT] == None:
        return None
    if kind == FIELD_WINDGUST and sensors[RESULTS_CURRENT][kind] == None:
        return sensors[RESULTS_CURRENT][FIELD_WINDSPEED]
    else:
        return sensors[RESULTS_CURRENT][kind]