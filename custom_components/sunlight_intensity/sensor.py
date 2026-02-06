"""Platform for sensor integration."""
from __future__ import annotations

from datetime import datetime, timedelta
import logging

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)

from .const import DOMAIN, CONF_LATITUDE, CONF_LONGITUDE, CONF_HOUSE_ANGLE, WALLS
from .sun_calculations import calculate_sun_angle, angle_to_percentage

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(minutes=5)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor platform."""
    
    coordinator = SunWallIntensityCoordinator(hass, config_entry)
    await coordinator.async_config_entry_first_refresh()

    entities = []
    
    # Add wall intensity sensors
    for wall in WALLS:
        entities.append(SunWallIntensitySensor(coordinator, config_entry, wall))
    
    # Add sun position sensors
    entities.append(SunAzimuthSensor(coordinator, config_entry))
    entities.append(SunElevationSensor(coordinator, config_entry))

    async_add_entities(entities)


class SunWallIntensityCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data from the API."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize."""
        self.latitude = config_entry.data[CONF_LATITUDE]
        self.longitude = config_entry.data[CONF_LONGITUDE]
        self.house_angle = config_entry.data[CONF_HOUSE_ANGLE]
        
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=SCAN_INTERVAL,
        )

    async def _async_update_data(self):
        """Update data via library."""
        try:
            # Get current time with timezone
            now = datetime.now()
            
            # Calculate sun position
            sun_data = await self.hass.async_add_executor_job(
                calculate_sun_angle,
                self.latitude,
                self.longitude,
                now,
                str(self.hass.config.time_zone)
            )
            
            # Calculate wall intensities
            wall_data = {}
            for wall in WALLS:
                intensity = await self.hass.async_add_executor_job(
                    angle_to_percentage,
                    sun_data['azimuth'],
                    self.house_angle,
                    wall,
                    sun_data['elevation']
                )
                wall_data[wall] = round(intensity, 2)
            
            return {
                'sun_position': sun_data,
                'wall_intensities': wall_data
            }
            
        except Exception as err:
            raise UpdateFailed(f"Error communicating with API: {err}")


class SunWallIntensitySensor(CoordinatorEntity, SensorEntity):
    """Representation of a Sunlight Intensity sensor."""

    def __init__(
        self,
        coordinator: SunWallIntensityCoordinator,
        config_entry: ConfigEntry,
        wall: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._wall = wall
        self._config_entry = config_entry
        self._attr_name = f"Sun Wall Intensity {wall.title()}"
        self._attr_unique_id = f"{config_entry.entry_id}_{wall}"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_native_unit_of_measurement = PERCENTAGE
        self._attr_icon = "mdi:white-balance-sunny"

    @property
    def native_value(self) -> float | None:
        """Return the native value of the sensor."""
        if self.coordinator.data is None:
            return None
        return self.coordinator.data['wall_intensities'].get(self._wall)

    @property
    def extra_state_attributes(self) -> dict[str, any]:
        """Return extra state attributes."""
        if self.coordinator.data is None:
            return {}
        
        sun_pos = self.coordinator.data['sun_position']
        return {
            'sun_elevation': round(sun_pos['elevation'], 2),
            'sun_azimuth': round(sun_pos['azimuth'], 2),
            'house_angle': self.coordinator.house_angle,
            'wall': self._wall,
        }

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return self.coordinator.last_update_success

    @property
    def device_info(self) -> dict[str, any]:
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, self._config_entry.entry_id)},
            "name": "Sunlight Intensity",
            "manufacturer": "UrbanFrame",
            "model": "Sunlight Intensity Calculator",
            "sw_version": "1.0.5",
        }


class SunAzimuthSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Sun Azimuth sensor."""

    def __init__(
        self,
        coordinator: SunWallIntensityCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "Sun Azimuth"
        self._attr_unique_id = f"{config_entry.entry_id}_sun_azimuth"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_native_unit_of_measurement = "°"
        self._attr_icon = "mdi:sun-compass"

    @property
    def native_value(self) -> float | None:
        """Return the native value of the sensor."""
        if self.coordinator.data is None:
            return None
        # Return azimuth 180 degrees opposite
        original_azimuth = self.coordinator.data['sun_position']['azimuth']
        opposite_azimuth = (original_azimuth + 180) % 360
        return round(opposite_azimuth, 2)

    @property
    def extra_state_attributes(self) -> dict[str, any]:
        """Return extra state attributes."""
        if self.coordinator.data is None:
            return {}
        
        sun_pos = self.coordinator.data['sun_position']
        return {
            'sun_elevation': round(sun_pos['elevation'], 2),
            'latitude': self.coordinator.latitude,
            'longitude': self.coordinator.longitude,
        }

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return self.coordinator.last_update_success

    @property
    def device_info(self) -> dict[str, any]:
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, self._config_entry.entry_id)},
            "name": "Sunlight Intensity",
            "manufacturer": "UrbanFrame",
            "model": "Sunlight Intensity Calculator",
            "sw_version": "1.0.5",
        }


class SunElevationSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Sun Elevation sensor."""

    def __init__(
        self,
        coordinator: SunWallIntensityCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "Sun Elevation"
        self._attr_unique_id = f"{config_entry.entry_id}_sun_elevation"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_native_unit_of_measurement = "°"
        self._attr_icon = "mdi:sun-angle"

    @property
    def native_value(self) -> float | None:
        """Return the native value of the sensor."""
        if self.coordinator.data is None:
            return None
        return round(self.coordinator.data['sun_position']['elevation'], 2)

    @property
    def extra_state_attributes(self) -> dict[str, any]:
        """Return extra state attributes."""
        if self.coordinator.data is None:
            return {}
        
        sun_pos = self.coordinator.data['sun_position']
        return {
            'sun_azimuth': round(sun_pos['azimuth'], 2),
            'latitude': self.coordinator.latitude,
            'longitude': self.coordinator.longitude,
        }

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return self.coordinator.last_update_success

    @property
    def device_info(self) -> dict[str, any]:
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, self._config_entry.entry_id)},
            "name": "Sunlight Intensity",
            "manufacturer": "UrbanFrame",
            "model": "Sunlight Intensity Calculator",
            "sw_version": "1.0.7",
        }
