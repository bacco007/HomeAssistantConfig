"""Support for WillyWeather binary sensors."""
from __future__ import annotations

from datetime import timezone
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .const import (
    ATTRIBUTION,
    CONF_INCLUDE_WARNINGS,
    CONF_SENSOR_PREFIX,
    CONF_STATION_ID,
    CONF_STATION_NAME,
    CONF_WARNING_MONITORED,
    DEFAULT_SENSOR_PREFIX,
    DOMAIN,
    MANUFACTURER,
    WARNING_BINARY_SENSOR_TYPES,
)
from .coordinator import WillyWeatherDataUpdateCoordinator

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up WillyWeather binary sensor based on a config entry."""
    coordinator: WillyWeatherDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = []

    station_id = entry.data[CONF_STATION_ID]
    station_name = entry.data.get(CONF_STATION_NAME, f"Station {station_id}")
    # For backward compatibility: if CONF_SENSOR_PREFIX is not in options (existing installations),
    # use empty string. New installations will have it set to DEFAULT_SENSOR_PREFIX ("ww_").
    sensor_prefix = entry.options.get(CONF_SENSOR_PREFIX, "" if CONF_SENSOR_PREFIX not in entry.options else DEFAULT_SENSOR_PREFIX)

    # Add warning sensors if enabled
    if entry.options.get(CONF_INCLUDE_WARNINGS, False):
        # Get list of monitored warning types
        monitored_warnings = entry.options.get(
            CONF_WARNING_MONITORED,
            list(WARNING_BINARY_SENSOR_TYPES.keys())
        )

        for sensor_type in WARNING_BINARY_SENSOR_TYPES:
            # Only add if this warning type is in the monitored list
            if sensor_type in monitored_warnings:
                entities.append(
                    WillyWeatherWarningBinarySensor(
                        coordinator,
                        station_id,
                        station_name,
                        sensor_type,
                        sensor_prefix,
                    )
                )

    async_add_entities(entities)


class WillyWeatherWarningBinarySensor(CoordinatorEntity, BinarySensorEntity):
    """Implementation of a WillyWeather warning binary sensor."""

    _attr_attribution = ATTRIBUTION

    def __init__(
        self,
        coordinator: WillyWeatherDataUpdateCoordinator,
        station_id: str,
        station_name: str,
        sensor_type: str,
        sensor_prefix: str = DEFAULT_SENSOR_PREFIX,
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._station_id = station_id
        self._station_name = station_name
        self._sensor_prefix = sensor_prefix

        sensor_info = WARNING_BINARY_SENSOR_TYPES[sensor_type]

        # Format prefix for display: "ww_melbourne" -> "WW Melbourne"
        if sensor_prefix:
            display_prefix = sensor_prefix.replace('_', ' ').title().replace('Ww ', 'WW ')
            self._attr_name = f"{display_prefix} {sensor_info['name']}"
            # Use prefix in unique_id for entity_id generation
            self._attr_unique_id = f"{sensor_prefix}_{sensor_type}"
        else:
            self._attr_name = sensor_info['name']
            # Backward compatibility: use station_id when no prefix
            self._attr_unique_id = f"{station_id}_{sensor_type}"
        self._attr_icon = sensor_info["icon"]
        self._attr_device_class = sensor_info.get("device_class")

        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{station_id}_binary_sensors")},
            manufacturer=MANUFACTURER,
            name=f"{station_name} Binary Sensors",
            via_device=(DOMAIN, station_id),
        )

    @property
    def is_on(self) -> bool | None:
        """Return True if warning is active."""
        if not self.coordinator.data:
            return None

        warning_data = self.coordinator.data.get("warnings", {})
        if not warning_data:
            return False

        try:
            warnings_list = warning_data.get("warnings", [])
            if not warnings_list:
                return False

            # Map sensor types to warning classifications
            classification_map = {
                "storm_warning": "storm",
                "flood_warning": "flood",
                "fire_warning": "fire",
                "heat_warning": "heat",
                "strong_wind_warning": "strong-wind",
                "frost_warning": "frost",
                "rain_warning": "cold-rain",
                "snow_warning": "snow",
                "cyclone_warning": "hurricane",
                "tsunami_warning": "tsunami",
                "fog_warning": "fog",
            }

            target_classification = classification_map.get(self._sensor_type)
            if not target_classification:
                return False

            # Check if any active warning matches this classification
            for warning in warnings_list:
                warning_type = warning.get("warningType", {})
                if warning_type.get("classification") == target_classification:
                    # Check expiry
                    expire_time_str = warning.get("expireDateTime")
                    if expire_time_str:
                        try:
                            expire_time = dt_util.parse_datetime(expire_time_str)
                            if expire_time:
                                # API returns UTC time - ensure it's marked as UTC
                                if expire_time.tzinfo is None:
                                    expire_time = expire_time.replace(tzinfo=timezone.utc)
                                
                                if expire_time > dt_util.now():
                                    return True
                        except (ValueError, TypeError):
                            pass

            return False

        except (KeyError, TypeError) as err:
            _LOGGER.debug("Error getting warning value for %s: %s", self._sensor_type, err)
            return None
    
    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional state attributes."""
        # Default attributes structure - always present
        default_attributes = {
            "warning_count": 0,
            "code": None,
            "name": None,
            "warnings": [],
        }
        
        if not self.coordinator.data:
            _LOGGER.debug("No coordinator data for %s", self._sensor_type)
            return default_attributes

        warning_data = self.coordinator.data.get("warnings", {})
        _LOGGER.debug("Warning data for %s: %s", self._sensor_type, warning_data)
        
        if not warning_data:
            _LOGGER.debug("No warning data dict for %s", self._sensor_type)
            return default_attributes

        try:
            warnings_list = warning_data.get("warnings", [])
            _LOGGER.debug("Warnings list for %s: %s warnings found", self._sensor_type, len(warnings_list))
            
            if not warnings_list:
                return default_attributes

            # Map sensor types to warning classifications
            classification_map = {
                "storm_warning": "storm",
                "flood_warning": "flood",
                "fire_warning": "fire",
                "heat_warning": "heat",
                "strong_wind_warning": "strong-wind",
                "frost_warning": "frost",
                "rain_warning": "cold-rain",
                "snow_warning": "snow",
                "cyclone_warning": "hurricane",
                "tsunami_warning": "tsunami",
                "fog_warning": "fog",
            }

            target_classification = classification_map.get(self._sensor_type)
            _LOGGER.debug("Looking for classification: %s for sensor %s", target_classification, self._sensor_type)
            
            if not target_classification:
                return default_attributes

            # Collect all active warnings for this classification
            active_warnings = []
            for warning in warnings_list:
                warning_type = warning.get("warningType", {})
                warning_classification = warning_type.get("classification")
                _LOGGER.debug("Checking warning with classification: %s", warning_classification)
                
                if warning_classification == target_classification:
                    # Check expiry
                    expire_time_str = warning.get("expireDateTime")
                    if expire_time_str:
                        try:
                            expire_time = dt_util.parse_datetime(expire_time_str)
                            if expire_time:
                                # API returns UTC time - ensure it's marked as UTC
                                if expire_time.tzinfo is None:
                                    expire_time = expire_time.replace(tzinfo=timezone.utc)
                                
                                now = dt_util.now()
                                _LOGGER.debug("Warning expires at %s, now is %s, active: %s", 
                                            expire_time, now, expire_time > now)
                                
                                if expire_time > now:
                                    _LOGGER.debug("Adding active warning: %s", warning.get("name"))
                                    
                                    active_warnings.append({
                                        "code": warning.get("code"),
                                        "name": warning.get("name"),
                                        "issue_time": warning.get("issueDateTime"),
                                        "expire_time": expire_time_str,
                                        "warning_type": warning_type.get("name"),
                                    })
                        except (ValueError, TypeError) as err:
                            _LOGGER.debug("Error parsing warning time: %s", err)
                            pass

            _LOGGER.debug("Found %s active warnings for %s", len(active_warnings), self._sensor_type)

            if not active_warnings:
                return default_attributes

            # Return info about the first warning (or most recent)
            first_warning = active_warnings[0]

            attributes = {
                "warning_count": len(active_warnings),
                "code": first_warning.get("code"),
                "name": first_warning.get("name"),
                "warnings": active_warnings,
            }
            
            _LOGGER.debug("Returning attributes for %s: %s", self._sensor_type, attributes)
            return attributes

        except (KeyError, TypeError) as err:
            _LOGGER.error("Error getting warning attributes for %s: %s", self._sensor_type, err, exc_info=True)
            return default_attributes
