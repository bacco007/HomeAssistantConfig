"""Support for WillyWeather sensors."""
from __future__ import annotations

from datetime import datetime
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .const import (
    ATTRIBUTION,
    CONF_FORECAST_DAYS,
    CONF_FORECAST_MONITORED,
    CONF_INCLUDE_FORECAST_SENSORS,
    CONF_INCLUDE_OBSERVATIONAL,
    CONF_INCLUDE_UV,
    CONF_INCLUDE_TIDES,
    CONF_INCLUDE_WIND,
    CONF_INCLUDE_SWELL,
    CONF_SENSOR_PREFIX,
    CONF_STATION_ID,
    CONF_STATION_NAME,
    DEFAULT_SENSOR_PREFIX,
    DOMAIN,
    FORECAST_SENSOR_TYPES,
    MANUFACTURER,
    SENSOR_TYPES,
    SUNMOON_SENSOR_TYPES,
    SWELL_SENSOR_TYPES,
    TIDES_SENSOR_TYPES,
    UV_SENSOR_TYPES,
    WIND_FORECAST_TYPES,
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
    """Set up WillyWeather sensor based on a config entry."""
    coordinator: WillyWeatherDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = []

    station_id = entry.data[CONF_STATION_ID]
    station_name = entry.data.get(CONF_STATION_NAME, f"Station {station_id}")
    # For backward compatibility: if CONF_SENSOR_PREFIX is not in options (existing installations),
    # use empty string. New installations will have it set to DEFAULT_SENSOR_PREFIX ("ww_").
    sensor_prefix = entry.options.get(CONF_SENSOR_PREFIX, "" if CONF_SENSOR_PREFIX not in entry.options else DEFAULT_SENSOR_PREFIX)

    # Add observational sensors if enabled
    if entry.options.get(CONF_INCLUDE_OBSERVATIONAL, True):
        for sensor_type in SENSOR_TYPES:
            entities.append(
                WillyWeatherSensor(
                    coordinator,
                    station_id,
                    station_name,
                    sensor_type,
                    SENSOR_TYPES,
                    sensor_prefix,
                )
            )

        # Add sun/moon sensors
        for sensor_type in SUNMOON_SENSOR_TYPES:
            entities.append(
                WillyWeatherSunMoonSensor(
                    coordinator,
                    station_id,
                    station_name,
                    sensor_type,
                    sensor_prefix,
                )
            )

    # Add tide sensors if enabled
    if entry.options.get(CONF_INCLUDE_TIDES, False):
        for sensor_type in TIDES_SENSOR_TYPES:
            entities.append(
                WillyWeatherTideSensor(
                    coordinator,
                    station_id,
                    station_name,
                    sensor_type,
                    sensor_prefix,
                )
            )

    # Add UV sensors if enabled
    if entry.options.get(CONF_INCLUDE_UV, False):
        for sensor_type in UV_SENSOR_TYPES:
            entities.append(
                WillyWeatherUVSensor(
                    coordinator,
                    station_id,
                    station_name,
                    sensor_type,
                    sensor_prefix,
                )
            )

    # Add wind forecast sensors if enabled
    if entry.options.get(CONF_INCLUDE_WIND, True):
        for sensor_type in WIND_FORECAST_TYPES:
            entities.append(
                WillyWeatherWindForecastSensor(
                    coordinator,
                    station_id,
                    station_name,
                    sensor_type,
                    sensor_prefix,
                )
            )

    # Add swell sensors if enabled
    if entry.options.get(CONF_INCLUDE_SWELL, False):
        for sensor_type in SWELL_SENSOR_TYPES:
            entities.append(
                WillyWeatherSwellSensor(
                    coordinator,
                    station_id,
                    station_name,
                    sensor_type,
                    sensor_prefix,
                )
            )

    # Add forecast sensors if enabled
    if entry.options.get(CONF_INCLUDE_FORECAST_SENSORS, False):
        forecast_days = entry.options.get(CONF_FORECAST_DAYS, [0, 1, 2, 3, 4])
        monitored_conditions = entry.options.get(
            CONF_FORECAST_MONITORED,
            list(FORECAST_SENSOR_TYPES.keys())
        )

        _LOGGER.debug(
            "Setting up forecast sensors for days %s with conditions %s",
            forecast_days,
            monitored_conditions,
        )

        for day in forecast_days:
            for condition in monitored_conditions:
                if condition in FORECAST_SENSOR_TYPES:
                    # UV forecast data only provides 4 days (0-3), skip UV sensors beyond day 3
                    if condition in ["uv_index", "uv_alert"] and day > 3:
                        _LOGGER.debug(
                            "Skipping UV forecast sensor for day %s (UV data only available for days 0-3)",
                            day
                        )
                        continue

                    entities.append(
                        WillyWeatherForecastSensor(
                            coordinator,
                            entry,
                            station_id,
                            station_name,
                            condition,
                            day,
                            sensor_prefix,
                        )
                    )

    async_add_entities(entities)


class WillyWeatherSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a WillyWeather observational sensor."""

    _attr_attribution = ATTRIBUTION

    def __init__(
        self,
        coordinator: WillyWeatherDataUpdateCoordinator,
        station_id: str,
        station_name: str,
        sensor_type: str,
        sensor_types_dict: dict,
        sensor_prefix: str = DEFAULT_SENSOR_PREFIX,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._sensor_types_dict = sensor_types_dict
        self._station_id = station_id
        self._station_name = station_name
        self._sensor_prefix = sensor_prefix

        sensor_info = sensor_types_dict[sensor_type]

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
        self._attr_native_unit_of_measurement = sensor_info["unit"]
        self._attr_icon = sensor_info["icon"]
        self._attr_device_class = sensor_info.get("device_class")
        self._attr_state_class = sensor_info.get("state_class")

        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{station_id}_sensors")},
            manufacturer=MANUFACTURER,
            name=f"{station_name} Sensors",
            via_device=(DOMAIN, station_id),
        )

    @property
    def native_value(self) -> Any:
        """Return the state of the sensor."""
        if not self.coordinator.data:
            return None

        # Special handling for precis - returns today's forecast text
        if self._sensor_type == "precis":
            forecast_data = self.coordinator.data.get("forecast", {})
            forecasts = forecast_data.get("forecasts", {})
            weather_days = forecasts.get("weather", {}).get("days", [])
            if weather_days and weather_days[0].get("entries"):
                return weather_days[0]["entries"][0].get("precis")
            return None

        # Special handling for forecast_extended - uses regionPrecis data (truncated to 255 chars)
        if self._sensor_type == "forecast_extended":
            forecast_data = self.coordinator.data.get("forecast", {})
            region_precis = forecast_data.get("regionPrecis", {})
            region_precis_days = region_precis.get("days", [])
            if region_precis_days and region_precis_days[0].get("entries"):
                entries = region_precis_days[0]["entries"]
                # Try both French-accented and non-accented versions
                extended_text = entries[0].get("précis") or entries[0].get("precis")
                if extended_text:
                    # Truncate to 255 characters for state value
                    return extended_text[:255]
            return None

        observations = self.coordinator.data.get("observational", {}).get("observations", {})

        sensor_info = self._sensor_types_dict[self._sensor_type]
        path = sensor_info["path"]

        value = observations
        for key in path:
            if isinstance(value, dict):
                value = value.get(key)
            else:
                return None

        return value

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional attributes."""
        # Special handling for forecast_extended - add full text as attribute
        if self._sensor_type == "forecast_extended" and self.coordinator.data:
            forecast_data = self.coordinator.data.get("forecast", {})
            region_precis = forecast_data.get("regionPrecis", {})
            region_precis_days = region_precis.get("days", [])

            attributes = {}

            # Add full extended forecast text as attribute
            if region_precis_days and region_precis_days[0].get("entries"):
                entries = region_precis_days[0]["entries"]
                # Try both French-accented and non-accented versions
                extended_text = entries[0].get("précis") or entries[0].get("precis")
                if extended_text:
                    attributes["full_text"] = extended_text

            return attributes

        return {}


class WillyWeatherSunMoonSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a WillyWeather sun/moon sensor."""

    _attr_attribution = ATTRIBUTION

    def __init__(
        self,
        coordinator: WillyWeatherDataUpdateCoordinator,
        station_id: str,
        station_name: str,
        sensor_type: str,
        sensor_prefix: str = DEFAULT_SENSOR_PREFIX,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._station_id = station_id
        self._station_name = station_name
        self._sensor_prefix = sensor_prefix

        sensor_info = SUNMOON_SENSOR_TYPES[sensor_type]
        self._attr_name = sensor_info['name']
        self._attr_unique_id = f"{station_id}_{sensor_type}"
        self._attr_native_unit_of_measurement = sensor_info.get("unit")
        # Don't set icon here for moon_phase - we'll do it dynamically
        if sensor_type != "moon_phase":
            self._attr_icon = sensor_info["icon"]
        self._attr_device_class = sensor_info.get("device_class")

        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{station_id}_sensors")},
            manufacturer=MANUFACTURER,
            name=f"{station_name} Sensors",
            via_device=(DOMAIN, station_id),
            )

    @staticmethod
    def _get_moon_phase_icon(phase: str) -> str:
        """Get the appropriate moon phase icon."""
        phase_lower = phase.lower() if phase else ""
        
        # Map WillyWeather phase names to Material Design Icons
        phase_map = {
            "new moon": "mdi:moon-new",
            "waxing crescent": "mdi:moon-waxing-crescent",
            "first quarter": "mdi:moon-first-quarter",
            "waxing gibbous": "mdi:moon-waxing-gibbous",
            "full moon": "mdi:moon-full",
            "waning gibbous": "mdi:moon-waning-gibbous",
            "last quarter": "mdi:moon-last-quarter",
            "third quarter": "mdi:moon-last-quarter",  # Alternative name
            "waning crescent": "mdi:moon-waning-crescent",
        }
        
        return phase_map.get(phase_lower, "mdi:moon-full")

    @property
    def icon(self) -> str | None:
        """Return the icon for the sensor."""
        if self._sensor_type == "moon_phase":
            phase = self.native_value
            if phase:
                return self._get_moon_phase_icon(phase)
            return "mdi:moon-full"
        return self._attr_icon

    @property
    def native_value(self) -> Any:
        """Return the state of the sensor."""
        if not self.coordinator.data:
            return None

        try:
            forecasts = self.coordinator.data.get("forecast", {}).get("forecasts", {})
            now = dt_util.now()
            
            # Handle sunrise/sunset
            if self._sensor_type in ["sunrise", "sunset"]:
                sunrisesunset_data = forecasts.get("sunrisesunset", {})
                if not sunrisesunset_data:
                    _LOGGER.debug("No sunrisesunset data available")
                    return None
                    
                days = sunrisesunset_data.get("days", [])
                
                # Search through multiple days to find next occurrence
                for day in days:
                    if not day.get("entries"):
                        continue
                    
                    entry = day["entries"][0]
                    if self._sensor_type == "sunrise":
                        time_val = entry.get("riseDateTime")
                    else:  # sunset
                        time_val = entry.get("setDateTime")
                    
                    if time_val:
                        dt = dt_util.parse_datetime(time_val)
                        if dt:
                            if dt.tzinfo is None:
                                tz = dt_util.get_time_zone(self.coordinator.hass.config.time_zone)
                                if tz:
                                    try:
                                        dt = tz.localize(dt)
                                    except AttributeError:
                                        dt = dt.replace(tzinfo=tz)
                            
                            # Return first future occurrence
                            if dt > now:
                                return dt
            
            # Handle moon phases
            elif self._sensor_type in ["moonrise", "moonset", "moon_phase"]:
                moonphases_data = forecasts.get("moonphases", {})
                if not moonphases_data:
                    _LOGGER.debug("No moonphases data available")
                    return None
                    
                days = moonphases_data.get("days", [])
                
                # For moon phase, just return today's phase
                if self._sensor_type == "moon_phase":
                    if days and days[0].get("entries"):
                        return days[0]["entries"][0].get("phase")
                    return None
                
                # For moonrise/moonset, find next occurrence
                for day in days:
                    if not day.get("entries"):
                        continue
                    
                    entry = day["entries"][0]
                    if self._sensor_type == "moonrise":
                        time_val = entry.get("riseDateTime")
                    else:  # moonset
                        time_val = entry.get("setDateTime")
                    
                    if time_val:
                        dt = dt_util.parse_datetime(time_val)
                        if dt:
                            if dt.tzinfo is None:
                                tz = dt_util.get_time_zone(self.coordinator.hass.config.time_zone)
                                if tz:
                                    try:
                                        dt = tz.localize(dt)
                                    except AttributeError:
                                        dt = dt.replace(tzinfo=tz)
                            
                            # Return first future occurrence
                            if dt > now:
                                return dt

        except (KeyError, IndexError, TypeError) as err:
            _LOGGER.debug("Error getting sun/moon value for %s: %s", self._sensor_type, err)
            return None

        return None

class WillyWeatherTideSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a WillyWeather tide sensor."""

    _attr_attribution = ATTRIBUTION

    def __init__(
        self,
        coordinator: WillyWeatherDataUpdateCoordinator,
        station_id: str,
        station_name: str,
        sensor_type: str,
        sensor_prefix: str = DEFAULT_SENSOR_PREFIX,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._station_id = station_id
        self._station_name = station_name
        self._sensor_prefix = sensor_prefix

        sensor_info = TIDES_SENSOR_TYPES[sensor_type]
        self._attr_name = sensor_info['name']
        self._attr_unique_id = f"{station_id}_{sensor_type}"
        self._attr_native_unit_of_measurement = sensor_info.get("unit")
        self._attr_icon = sensor_info["icon"]
        self._attr_device_class = sensor_info.get("device_class")

        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{station_id}_sensors")},
            manufacturer=MANUFACTURER,
            name=f"{station_name} Sensors",
            via_device=(DOMAIN, station_id),
            )

    @property
    def native_value(self) -> Any:
        """Return the state of the sensor."""
        if not self.coordinator.data:
            _LOGGER.debug("No coordinator data for tides")
            return None

        try:
            forecasts = self.coordinator.data.get("forecast", {})
            if not forecasts:
                _LOGGER.debug("No forecast data available")
                return None
                
            forecasts_dict = forecasts.get("forecasts", {})
            if not forecasts_dict:
                _LOGGER.debug("No forecasts dict available")
                return None
            
            tides_data = forecasts_dict.get("tides")
            
            if not tides_data:
                _LOGGER.debug("No tides data in forecasts")
                return None
            
            days = tides_data.get("days", [])
            
            if not days:
                _LOGGER.debug("No days in tides data")
                return None
            
            now = dt_util.now()
            
            # Search through all days to find next tide
            for day in days:
                entries = day.get("entries", [])
                if not entries:
                    continue
                
                # Find next high or low tide
                if self._sensor_type == "next_high_tide":
                    for entry in entries:
                        if entry.get("type") == "high":
                            tide_time = entry.get("dateTime")
                            if tide_time:
                                dt = dt_util.parse_datetime(tide_time)
                                if dt:
                                    if dt.tzinfo is None:
                                        tz = dt_util.get_time_zone(self.coordinator.hass.config.time_zone)
                                        if tz:
                                            try:
                                                dt = tz.localize(dt)
                                            except AttributeError:
                                                dt = dt.replace(tzinfo=tz)
                                    
                                    # Return first future high tide
                                    if dt > now:
                                        return dt
                        
                elif self._sensor_type == "next_low_tide":
                    for entry in entries:
                        if entry.get("type") == "low":
                            tide_time = entry.get("dateTime")
                            if tide_time:
                                dt = dt_util.parse_datetime(tide_time)
                                if dt:
                                    if dt.tzinfo is None:
                                        tz = dt_util.get_time_zone(self.coordinator.hass.config.time_zone)
                                        if tz:
                                            try:
                                                dt = tz.localize(dt)
                                            except AttributeError:
                                                dt = dt.replace(tzinfo=tz)
                                    
                                    # Return first future low tide
                                    if dt > now:
                                        return dt
                        
                elif self._sensor_type == "next_high_tide_height":
                    for entry in entries:
                        if entry.get("type") == "high":
                            tide_time = entry.get("dateTime")
                            if tide_time:
                                dt = dt_util.parse_datetime(tide_time)
                                if dt:
                                    if dt.tzinfo is None:
                                        tz = dt_util.get_time_zone(self.coordinator.hass.config.time_zone)
                                        if tz:
                                            try:
                                                dt = tz.localize(dt)
                                            except AttributeError:
                                                dt = dt.replace(tzinfo=tz)
                                    
                                    # Return height of first future high tide
                                    if dt > now:
                                        return entry.get("height")
                        
                elif self._sensor_type == "next_low_tide_height":
                    for entry in entries:
                        if entry.get("type") == "low":
                            tide_time = entry.get("dateTime")
                            if tide_time:
                                dt = dt_util.parse_datetime(tide_time)
                                if dt:
                                    if dt.tzinfo is None:
                                        tz = dt_util.get_time_zone(self.coordinator.hass.config.time_zone)
                                        if tz:
                                            try:
                                                dt = tz.localize(dt)
                                            except AttributeError:
                                                dt = dt.replace(tzinfo=tz)
                                    
                                    # Return height of first future low tide
                                    if dt > now:
                                        return entry.get("height")

        except (KeyError, IndexError, TypeError) as err:
            _LOGGER.error("Error getting tide value for %s: %s", self._sensor_type, err, exc_info=True)
            return None

        return None


class WillyWeatherUVSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a WillyWeather UV sensor."""

    _attr_attribution = ATTRIBUTION

    def __init__(
        self,
        coordinator: WillyWeatherDataUpdateCoordinator,
        station_id: str,
        station_name: str,
        sensor_type: str,
        sensor_prefix: str = DEFAULT_SENSOR_PREFIX,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._station_id = station_id
        self._station_name = station_name
        self._sensor_prefix = sensor_prefix

        sensor_info = UV_SENSOR_TYPES[sensor_type]
        self._attr_name = sensor_info['name']
        self._attr_unique_id = f"{station_id}_{sensor_type}"
        self._attr_native_unit_of_measurement = sensor_info.get("unit")
        self._attr_icon = sensor_info["icon"]
        self._attr_device_class = sensor_info.get("device_class")
        self._attr_state_class = sensor_info.get("state_class")

        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{station_id}_sensors")},
            manufacturer=MANUFACTURER,
            name=f"{station_name} Sensors",
            via_device=(DOMAIN, station_id),
            )

    @property
    def native_value(self) -> Any:
        """Return the state of the sensor."""
        if not self.coordinator.data:
            return None

        try:
            forecasts = self.coordinator.data.get("forecast", {}).get("forecasts", {})
            uv_days = forecasts.get("uv", {}).get("days", [])

            if not uv_days or not uv_days[0].get("entries"):
                return None

            entries = uv_days[0]["entries"]

            # Get current time and floor to the hour
            now = dt_util.now()
            current_hour = now.replace(minute=0, second=0, microsecond=0)

            # Find the entry matching the current hour
            current_entry = None

            for entry in entries:
                entry_time_str = entry.get("dateTime")
                if not entry_time_str:
                    continue

                entry_time = dt_util.parse_datetime(entry_time_str)
                if not entry_time:
                    continue

                # Ensure entry_time has timezone info
                if entry_time.tzinfo is None:
                    tz = dt_util.get_time_zone(self.coordinator.hass.config.time_zone)
                    if tz:
                        try:
                            entry_time = tz.localize(entry_time)
                        except AttributeError:
                            entry_time = entry_time.replace(tzinfo=tz)

                # Check if this entry matches the current hour
                if entry_time.replace(minute=0, second=0, microsecond=0) == current_hour:
                    current_entry = entry
                    break

            if not current_entry:
                # Fallback to first entry if no match found
                current_entry = entries[0]

            if self._sensor_type == "uv_index":
                return current_entry.get("index")
            elif self._sensor_type == "uv_alert":
                # Use the scale directly from the API
                scale = current_entry.get("scale")
                if scale:
                    # Convert API format to display format
                    # API: "low", "moderate", "high", "very-high", "extreme"
                    # Display: "Low", "Moderate", "High", "Very High", "Extreme"
                    scale_map = {
                        "low": "Low",
                        "moderate": "Moderate",
                        "high": "High",
                        "very-high": "Very High",
                        "extreme": "Extreme"
                    }
                    return scale_map.get(scale, scale.title())
                return None

        except (KeyError, IndexError, TypeError) as err:
            _LOGGER.debug("Error getting UV value for %s: %s", self._sensor_type, err)
            return None

        return None


class WillyWeatherWindForecastSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a WillyWeather wind forecast sensor."""

    _attr_attribution = ATTRIBUTION

    def __init__(
        self,
        coordinator: WillyWeatherDataUpdateCoordinator,
        station_id: str,
        station_name: str,
        sensor_type: str,
        sensor_prefix: str = DEFAULT_SENSOR_PREFIX,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._station_id = station_id
        self._station_name = station_name
        self._sensor_prefix = sensor_prefix

        sensor_info = WIND_FORECAST_TYPES[sensor_type]
        self._attr_name = sensor_info['name']
        self._attr_unique_id = f"{station_id}_{sensor_type}"
        self._attr_native_unit_of_measurement = sensor_info.get("unit")
        self._attr_icon = sensor_info["icon"]
        self._attr_device_class = sensor_info.get("device_class")

        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{station_id}_sensors")},
            manufacturer=MANUFACTURER,
            name=f"{station_name} Sensors",
            via_device=(DOMAIN, station_id),
            )

    @property
    def native_value(self) -> Any:
        """Return the state of the sensor."""
        if not self.coordinator.data:
            return None

        try:
            forecasts = self.coordinator.data.get("forecast", {}).get("forecasts", {})
            wind_days = forecasts.get("wind", {}).get("days", [])

            if not wind_days or not wind_days[0].get("entries"):
                return None

            entries = wind_days[0]["entries"]

            # Get current time and floor to the hour
            now = dt_util.now()
            current_hour = now.replace(minute=0, second=0, microsecond=0)

            # Find the entry matching the current hour
            current_entry = None

            for entry in entries:
                entry_time_str = entry.get("dateTime")
                if not entry_time_str:
                    continue

                entry_time = dt_util.parse_datetime(entry_time_str)
                if not entry_time:
                    continue

                # Ensure entry_time has timezone info
                if entry_time.tzinfo is None:
                    tz = dt_util.get_time_zone(self.coordinator.hass.config.time_zone)
                    if tz:
                        try:
                            entry_time = tz.localize(entry_time)
                        except AttributeError:
                            entry_time = entry_time.replace(tzinfo=tz)

                # Check if this entry matches the current hour
                if entry_time.replace(minute=0, second=0, microsecond=0) == current_hour:
                    current_entry = entry
                    break

            if not current_entry:
                # Fallback to first entry if no match found
                current_entry = entries[0]

            if self._sensor_type == "wind_speed_forecast":
                return current_entry.get("speed")
            elif self._sensor_type == "wind_direction_forecast":
                return current_entry.get("direction")

        except (KeyError, IndexError, TypeError) as err:
            _LOGGER.debug("Error getting wind forecast value for %s: %s", self._sensor_type, err)
            return None

        return None


class WillyWeatherSwellSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a WillyWeather swell sensor."""

    _attr_attribution = ATTRIBUTION

    def __init__(
        self,
        coordinator: WillyWeatherDataUpdateCoordinator,
        station_id: str,
        station_name: str,
        sensor_type: str,
        sensor_prefix: str = DEFAULT_SENSOR_PREFIX,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._station_id = station_id
        self._station_name = station_name
        self._sensor_prefix = sensor_prefix

        sensor_info = SWELL_SENSOR_TYPES[sensor_type]
        self._attr_name = sensor_info['name']
        self._attr_unique_id = f"{station_id}_{sensor_type}"
        self._attr_native_unit_of_measurement = sensor_info.get("unit")
        self._attr_icon = sensor_info["icon"]

        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{station_id}_sensors")},
            manufacturer=MANUFACTURER,
            name=f"{station_name} Sensors",
            via_device=(DOMAIN, station_id),
            )

    @property
    def native_value(self) -> Any:
        """Return the state of the sensor."""
        if not self.coordinator.data:
            return None

        try:
            forecasts = self.coordinator.data.get("forecast", {})
            if not forecasts:
                _LOGGER.debug("No forecast data available for swell")
                return None

            forecasts_dict = forecasts.get("forecasts", {})
            if not forecasts_dict:
                _LOGGER.debug("No forecasts dict available for swell")
                return None

            swell_data = forecasts_dict.get("swell")

            if not swell_data:
                _LOGGER.debug("No swell data in forecasts")
                return None

            days = swell_data.get("days", [])

            if not days:
                _LOGGER.debug("No days in swell data")
                return None

            first_day = days[0]
            entries = first_day.get("entries", [])

            if not entries:
                _LOGGER.debug("No entries in first swell day")
                return None

            # Get current time and floor to the hour
            now = dt_util.now()
            current_hour = now.replace(minute=0, second=0, microsecond=0)

            # Find the entry matching the current hour
            current_entry = None

            for entry in entries:
                entry_time_str = entry.get("dateTime")
                if not entry_time_str:
                    continue

                entry_time = dt_util.parse_datetime(entry_time_str)
                if not entry_time:
                    continue

                # Ensure entry_time has timezone info
                if entry_time.tzinfo is None:
                    tz = dt_util.get_time_zone(self.coordinator.hass.config.time_zone)
                    if tz:
                        try:
                            entry_time = tz.localize(entry_time)
                        except AttributeError:
                            entry_time = entry_time.replace(tzinfo=tz)

                # Check if this entry matches the current hour
                if entry_time.replace(minute=0, second=0, microsecond=0) == current_hour:
                    current_entry = entry
                    break

            if not current_entry:
                # Fallback to first entry if no match found
                current_entry = entries[0]

            if self._sensor_type == "swell_height":
                return current_entry.get("height")
            elif self._sensor_type == "swell_period":
                return current_entry.get("period")
            elif self._sensor_type == "swell_direction":
                return current_entry.get("direction")
            elif self._sensor_type == "swell_direction_text":
                return current_entry.get("directionText")

        except (KeyError, IndexError, TypeError) as err:
            _LOGGER.debug("Error getting swell value for %s: %s", self._sensor_type, err)
            return None

        return None


class WillyWeatherForecastSensor(CoordinatorEntity, SensorEntity):
    """Representation of a WillyWeather forecast sensor."""

    _attr_attribution = ATTRIBUTION

    def __init__(
        self,
        coordinator: WillyWeatherDataUpdateCoordinator,
        entry: ConfigEntry,
        station_id: str,
        station_name: str,
        sensor_type: str,
        forecast_day: int,
        sensor_prefix: str = DEFAULT_SENSOR_PREFIX,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._station_id = station_id
        self._station_name = station_name
        self._sensor_type = sensor_type
        self._forecast_day = forecast_day
        self._sensor_prefix = sensor_prefix

        sensor_config = FORECAST_SENSOR_TYPES[sensor_type]
        day_label = f"{forecast_day}"

        # Format prefix for display: "ww_melbourne" -> "WW Melbourne"
        if sensor_prefix:
            display_prefix = sensor_prefix.replace('_', ' ').title().replace('Ww ', 'WW ')
            self._attr_name = f"{display_prefix} {sensor_config['name']} {day_label}"
            # Use prefix in unique_id for entity_id generation
            self._attr_unique_id = f"{sensor_prefix}_forecast_{sensor_type}_day_{forecast_day}"
        else:
            self._attr_name = f"{sensor_config['name']} {day_label}"
            # Backward compatibility: use station_id when no prefix
            self._attr_unique_id = f"{station_id}_forecast_{sensor_type}_day_{forecast_day}"
        self._attr_native_unit_of_measurement = sensor_config.get("unit")
        self._attr_device_class = sensor_config.get("device_class")
        self._attr_state_class = sensor_config.get("state_class")
        self._attr_icon = sensor_config.get("icon")

        # Link to forecast sensors device
        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{station_id}_forecast_sensors")},
            manufacturer=MANUFACTURER,
            name=f"{station_name} Forecast Sensors",
            via_device=(DOMAIN, station_id),
        )

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        if not self.coordinator.last_update_success:
            return False

        forecast_data = self.coordinator.data.get("forecast", {})
        if not forecast_data:
            return False

        # Check if we have forecast data for this day
        return self._get_forecast_data(forecast_data) is not None

    @property
    def native_value(self) -> Any:
        """Return the state of the sensor."""
        forecast_data = self.coordinator.data.get("forecast", {})
        if not forecast_data:
            return None

        day_data = self._get_forecast_data(forecast_data)

        if not day_data:
            return None

        return self._extract_value(day_data)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional attributes."""
        forecast_data = self.coordinator.data.get("forecast", {})
        if not forecast_data:
            return {}

        day_data = self._get_forecast_data(forecast_data)

        if not day_data:
            return {}

        attributes = {
            "forecast_day": self._forecast_day,
            "date": day_data.get("dateTime"),
        }

        # Add precis code for weather condition
        if self._sensor_type == "precis" and "precisCode" in day_data:
            attributes["precis_code"] = day_data["precisCode"]

        return attributes

    def _get_forecast_data(self, forecast_data: dict) -> dict | None:
        """Get forecast data for the specific day."""
        # WillyWeather forecast structure varies by type
        # We need to look in the right place for each sensor type
        forecasts = forecast_data.get("forecasts", {})

        # temp_max, temp_min, precis, and icon all come from the "weather" forecast
        if self._sensor_type in ["temp_max", "temp_min", "precis", "icon"]:
            weather_data = forecasts.get("weather", {}).get("days", [])
            if self._forecast_day < len(weather_data):
                day_data = weather_data[self._forecast_day]
                _LOGGER.debug(
                    "Weather forecast data for day %s (%s sensor): %s",
                    self._forecast_day,
                    self._sensor_type,
                    day_data
                )
                return day_data
            else:
                _LOGGER.warning(
                    "No weather forecast data for day %s (available days: %s)",
                    self._forecast_day,
                    len(weather_data)
                )

        elif self._sensor_type in ["rain_amount_min", "rain_amount_max", "rain_amount_range", "rain_probability"]:
            rainfall_data = forecasts.get("rainfall", {}).get("days", [])
            if self._forecast_day < len(rainfall_data):
                day_data = rainfall_data[self._forecast_day]
                _LOGGER.debug(
                    "Rainfall data for day %s: %s",
                    self._forecast_day,
                    day_data
                )
                return day_data
            else:
                _LOGGER.warning(
                    "No rainfall data for day %s (available days: %s)",
                    self._forecast_day,
                    len(rainfall_data)
                )

        elif self._sensor_type in ["uv_index", "uv_alert"]:
            uv_data = forecasts.get("uv", {}).get("days", [])
            if self._forecast_day < len(uv_data):
                day_data = uv_data[self._forecast_day]
                _LOGGER.debug(
                    "UV data for day %s: %s",
                    self._forecast_day,
                    day_data
                )
                return day_data
            else:
                _LOGGER.warning(
                    "No UV data for day %s (available days: %s)",
                    self._forecast_day,
                    len(uv_data)
                )

        elif self._sensor_type in ["sunrise", "sunset"]:
            sunrisesunset_data = forecasts.get("sunrisesunset", {}).get("days", [])
            if self._forecast_day < len(sunrisesunset_data):
                day_data = sunrisesunset_data[self._forecast_day]
                _LOGGER.debug(
                    "Sunrise/sunset data for day %s: %s",
                    self._forecast_day,
                    day_data
                )
                return day_data
            else:
                _LOGGER.warning(
                    "No sunrise/sunset data for day %s (available days: %s)",
                    self._forecast_day,
                    len(sunrisesunset_data)
                )

        return None

    def _extract_value(self, day_data: dict) -> Any:
        """Extract the specific value for this sensor type."""
        if not day_data:
            _LOGGER.debug(
                "No day_data available for sensor %s (day %s)",
                self._sensor_type,
                self._forecast_day
            )
            return None

        # Handle different sensor types
        if self._sensor_type == "temp_max":
            # Weather forecast has min/max in the first entry
            entries = day_data.get("entries", [])
            if entries:
                return entries[0].get("max")
            return None

        elif self._sensor_type == "temp_min":
            # Weather forecast has min/max in the first entry
            entries = day_data.get("entries", [])
            if entries:
                return entries[0].get("min")
            return None

        elif self._sensor_type == "rain_amount_min":
            entries = day_data.get("entries", [])
            if entries:
                start = entries[0].get("startRange")
                # startRange can be None for < 1mm
                return start if start is not None else 0
            return None

        elif self._sensor_type == "rain_amount_max":
            entries = day_data.get("entries", [])
            if entries:
                return entries[0].get("endRange")
            return None

        elif self._sensor_type == "rain_amount_range":
            entries = day_data.get("entries", [])
            if entries:
                start = entries[0].get("startRange")
                end = entries[0].get("endRange")

                # Handle < 1mm case (startRange is None)
                if start is None and end is not None:
                    return f"<{end} mm"
                elif start is not None and end is not None:
                    if start == end:
                        return f"{start} mm"
                    return f"{start}-{end} mm"
                return None
            return None

        elif self._sensor_type == "rain_probability":
            entries = day_data.get("entries", [])
            if entries:
                value = entries[0].get("probability")
                if value is None:
                    _LOGGER.warning(
                        "rain_probability: 'probability' not found in entry. Available keys: %s",
                        list(entries[0].keys())
                    )
                return value
            _LOGGER.warning("rain_probability: No entries found in day_data. Keys: %s", list(day_data.keys()))

        elif self._sensor_type == "precis":
            # Weather forecast has precis in the first entry
            entries = day_data.get("entries", [])
            if entries:
                return entries[0].get("precis")
            return None

        elif self._sensor_type == "icon":
            # Map precisCode from weather forecast to Home Assistant condition
            from .const import CONDITION_MAP
            entries = day_data.get("entries", [])
            if entries:
                precis_code = entries[0].get("precisCode")
                if precis_code:
                    condition = CONDITION_MAP.get(precis_code, "unknown")
                    return condition
            return None

        elif self._sensor_type == "uv_index":
            # UV data has an 'alert' object at the day level with maxIndex
            alert = day_data.get("alert")
            if alert:
                return alert.get("maxIndex")
            # If no alert, UV is likely below 3 (no alert threshold)
            return None

        elif self._sensor_type == "uv_alert":
            # UV alert uses the 'scale' from the alert object
            alert = day_data.get("alert")
            if alert:
                return alert.get("scale")
            # If no alert, UV is below alert threshold
            return None

        elif self._sensor_type == "sunrise":
            entries = day_data.get("entries", [])
            if entries and "firstLightDateTime" in entries[0]:
                timestamp = entries[0]["firstLightDateTime"]
                return self._parse_timestamp(timestamp)
            if entries:
                _LOGGER.warning(
                    "sunrise: 'firstLightDateTime' not found in entry. Available keys: %s",
                    list(entries[0].keys())
                )
            else:
                _LOGGER.warning("sunrise: No entries found in day_data. Keys: %s", list(day_data.keys()))

        elif self._sensor_type == "sunset":
            entries = day_data.get("entries", [])
            if entries and "lastLightDateTime" in entries[0]:
                timestamp = entries[0]["lastLightDateTime"]
                return self._parse_timestamp(timestamp)
            if entries:
                _LOGGER.warning(
                    "sunset: 'lastLightDateTime' not found in entry. Available keys: %s",
                    list(entries[0].keys())
                )
            else:
                _LOGGER.warning("sunset: No entries found in day_data. Keys: %s", list(day_data.keys()))

        return None

    def _parse_timestamp(self, timestamp: str) -> datetime | None:
        """Parse WillyWeather timestamp to datetime object."""
        try:
            # WillyWeather timestamps are in ISO format
            dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            return dt_util.as_utc(dt)
        except (ValueError, AttributeError):
            _LOGGER.warning("Failed to parse timestamp: %s", timestamp)
            return None