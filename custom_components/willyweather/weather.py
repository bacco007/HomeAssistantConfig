"""Support for WillyWeather weather entity."""
from __future__ import annotations

from datetime import datetime
import logging
from typing import TYPE_CHECKING, Any
from homeassistant.util import dt as dt_util

from homeassistant.components.weather import (
    Forecast,
    SingleCoordinatorWeatherEntity,
    WeatherEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    UnitOfPrecipitationDepth,
    UnitOfPressure,
    UnitOfSpeed,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    ATTRIBUTION,
    CONDITION_MAP,
    CONF_INCLUDE_UV,
    CONF_INCLUDE_TIDES,
    CONF_INCLUDE_SWELL,
    CONF_SENSOR_PREFIX,
    CONF_STATION_ID,
    CONF_STATION_NAME,
    DEFAULT_SENSOR_PREFIX,
    DOMAIN,
    MANUFACTURER,
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
    """Set up WillyWeather weather entity based on a config entry."""
    coordinator: WillyWeatherDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]

    # For backward compatibility: if CONF_SENSOR_PREFIX is not in options (existing installations),
    # use empty string. New installations will have it set to DEFAULT_SENSOR_PREFIX ("ww_").
    sensor_prefix = entry.options.get(CONF_SENSOR_PREFIX, "" if CONF_SENSOR_PREFIX not in entry.options else DEFAULT_SENSOR_PREFIX)

    async_add_entities([WillyWeatherEntity(coordinator, entry, sensor_prefix)])


class WillyWeatherEntity(SingleCoordinatorWeatherEntity):
    """Implementation of a WillyWeather weather entity."""

    _attr_attribution = ATTRIBUTION
    _attr_native_precipitation_unit = UnitOfPrecipitationDepth.MILLIMETERS
    _attr_native_pressure_unit = UnitOfPressure.HPA
    _attr_native_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_native_wind_speed_unit = UnitOfSpeed.KILOMETERS_PER_HOUR
    _attr_supported_features = (
        WeatherEntityFeature.FORECAST_DAILY | WeatherEntityFeature.FORECAST_HOURLY
    )

    def __init__(
        self,
        coordinator: WillyWeatherDataUpdateCoordinator,
        entry: ConfigEntry,
        sensor_prefix: str = DEFAULT_SENSOR_PREFIX,
    ) -> None:
        """Initialize the weather entity."""
        super().__init__(coordinator)
        self._station_id = entry.data[CONF_STATION_ID]
        self._station_name = entry.data.get(CONF_STATION_NAME, f"Station {self._station_id}")
        self._sensor_prefix = sensor_prefix
        self._entry = entry

        # Format prefix for display: "ww_melbourne" -> "WW Melbourne"
        if sensor_prefix:
            self._attr_name = sensor_prefix.replace('_', ' ').title().replace('Ww ', 'WW ')
            # Use prefix in unique_id for entity_id generation
            self._attr_unique_id = f"{sensor_prefix}_weather"
        else:
            self._attr_name = self._station_name
            # Backward compatibility: use station_id when no prefix
            self._attr_unique_id = f"{self._station_id}_weather"

        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, self._station_id)},
            manufacturer=MANUFACTURER,
            name=self._station_name,
        )

    @property
    def condition(self) -> str | None:
        """Return the current condition."""
        if not self.coordinator.data:
            return None

        try:
            forecasts = self.coordinator.data.get("forecast", {}).get("forecasts", {})
            weather_days = forecasts.get("weather", {}).get("days", [])

            if weather_days and weather_days[0].get("entries"):
                precis_code = weather_days[0]["entries"][0].get("precisCode")
                return CONDITION_MAP.get(precis_code, "unknown")
        except (KeyError, IndexError, TypeError):
            pass

        return None

    @property
    def native_temperature(self) -> float | None:
        """Return the temperature."""
        return self._get_observation_value(["temperature", "temperature"])

    @property
    def native_apparent_temperature(self) -> float | None:
        """Return the apparent temperature."""
        return self._get_observation_value(["temperature", "apparentTemperature"])

    @property
    def native_pressure(self) -> float | None:
        """Return the pressure."""
        return self._get_observation_value(["pressure", "pressure"])

    @property
    def humidity(self) -> float | None:
        """Return the humidity."""
        return self._get_observation_value(["humidity", "percentage"])

    @property
    def native_wind_speed(self) -> float | None:
        """Return the wind speed."""
        return self._get_observation_value(["wind", "speed"])

    @property
    def wind_bearing(self) -> float | str | None:
        """Return the wind bearing."""
        return self._get_observation_value(["wind", "direction"])

    @property
    def native_wind_gust_speed(self) -> float | None:
        """Return the wind gust speed."""
        return self._get_observation_value(["wind", "gustSpeed"])

    @property
    def cloud_coverage(self) -> float | None:
        """Return the cloud coverage in percentage."""
        oktas = self._get_observation_value(["cloud", "oktas"])
        if oktas is not None:
            return (oktas / 8) * 100
        return None

    @property
    def native_dew_point(self) -> float | None:
        """Return the dew point."""
        return self._get_observation_value(["dewPoint", "temperature"])

    @property
    def uv_index(self) -> float | None:
        """Return the UV index."""
        if not self.coordinator.data:
            return None

        try:
            forecasts = self.coordinator.data.get("forecast", {}).get("forecasts", {})
            uv_days = forecasts.get("uv", {}).get("days", [])

            if not uv_days or not uv_days[0].get("entries"):
                return None

            entry = uv_days[0]["entries"][0]
            return entry.get("index")
        except (KeyError, IndexError, TypeError):
            return None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return additional state attributes."""
        if not self.coordinator.data:
            return None

        try:
            forecasts = self.coordinator.data.get("forecast", {}).get("forecasts", {})
            weather_days = forecasts.get("weather", {}).get("days", [])

            if weather_days and weather_days[0].get("entries"):
                entry = weather_days[0]["entries"][0]
                precis = entry.get("precis")
                if precis:
                    return {"precis": precis}
        except (KeyError, IndexError, TypeError):
            pass

        return None

    def _get_observation_value(self, path: list[str]) -> Any:
        """Get value from observational data using path."""
        if not self.coordinator.data:
            return None

        try:
            observations = self.coordinator.data.get("observational", {}).get("observations", {})
            value = observations
            for key in path:
                if isinstance(value, dict):
                    value = value.get(key)
                else:
                    return None
            return value
        except (KeyError, TypeError):
            return None

    @callback
    def _async_forecast_daily(self) -> list[Forecast] | None:
        """Return the daily forecast."""
        if not self.coordinator.data:
            return None

        try:
            forecasts = self.coordinator.data.get("forecast", {}).get("forecasts", {})
            weather_days = forecasts.get("weather", {}).get("days", [])

            uv_enabled = self._entry.options.get(CONF_INCLUDE_UV, False)
            uv_days = forecasts.get("uv", {}).get("days", []) if uv_enabled else []
            
            tides_enabled = self._entry.options.get(CONF_INCLUDE_TIDES, False)
            tides_days = forecasts.get("tides", {}).get("days", []) if tides_enabled else []
            
            sunrisesunset_days = forecasts.get("sunrisesunset", {}).get("days", [])
            moonphases_days = forecasts.get("moonphases", {}).get("days", [])
            rainfall_days = forecasts.get("rainfall", {}).get("days", [])

            forecast_data = []
            for idx, day in enumerate(weather_days):
                if not day.get("entries"):
                    continue

                entry = day["entries"][0]
                date_string = entry.get("dateTime")

                if not date_string:
                    continue

                try:
                    # Parse the datetime from WillyWeather
                    dt = dt_util.parse_datetime(date_string)
                    if not dt:
                        continue
                    
                    # If no timezone, assume local timezone
                    if dt.tzinfo is None:
                        tz = dt_util.get_time_zone(self.hass.config.time_zone)
                        if tz:
                            try:
                                dt = tz.localize(dt)
                            except AttributeError:
                                dt = dt.replace(tzinfo=tz)
                    
                except ValueError:
                    continue

                forecast_dict: Forecast = {
                    "datetime": dt.isoformat(),
                    "temperature": entry.get("max"),
                    "templow": entry.get("min"),
                    "condition": CONDITION_MAP.get(entry.get("precisCode"), "unknown"),
                }

                # Add UV index if enabled
                if uv_enabled and idx < len(uv_days):
                    uv_day = uv_days[idx]
                    if uv_day.get("entries"):
                        uv_entry = uv_day["entries"][0]
                        uv_index = uv_entry.get("index")
                        if uv_index is not None:
                            forecast_dict["uv_index"] = uv_index

                # Add sunrise/sunset with timezone handling
                if idx < len(sunrisesunset_days):
                    sun_day = sunrisesunset_days[idx]
                    if sun_day.get("entries"):
                        sun_entry = sun_day["entries"][0]
                        
                        # Handle sunrise
                        if sun_entry.get("riseDateTime"):
                            sunrise_str = sun_entry.get("riseDateTime")
                            sunrise_dt = dt_util.parse_datetime(sunrise_str)
                            if sunrise_dt:
                                if sunrise_dt.tzinfo is None:
                                    tz = dt_util.get_time_zone(self.hass.config.time_zone)
                                    if tz:
                                        try:
                                            sunrise_dt = tz.localize(sunrise_dt)
                                        except AttributeError:
                                            sunrise_dt = sunrise_dt.replace(tzinfo=tz)
                                forecast_dict["sunrise"] = sunrise_dt.isoformat()
                        
                        # Handle sunset
                        if sun_entry.get("setDateTime"):
                            sunset_str = sun_entry.get("setDateTime")
                            sunset_dt = dt_util.parse_datetime(sunset_str)
                            if sunset_dt:
                                if sunset_dt.tzinfo is None:
                                    tz = dt_util.get_time_zone(self.hass.config.time_zone)
                                    if tz:
                                        try:
                                            sunset_dt = tz.localize(sunset_dt)
                                        except AttributeError:
                                            sunset_dt = sunset_dt.replace(tzinfo=tz)
                                forecast_dict["sunset"] = sunset_dt.isoformat()

                # Add moon phase
                if idx < len(moonphases_days):
                    moon_day = moonphases_days[idx]
                    if moon_day.get("entries"):
                        moon_entry = moon_day["entries"][0]
                        if moon_entry.get("phase"):
                            forecast_dict["moon_phase"] = moon_entry.get("phase")

                # Add tides if enabled with timezone handling
                if tides_enabled and idx < len(tides_days):
                    tides_day = tides_days[idx]
                    if tides_day.get("entries"):
                        entries = tides_day["entries"]
                        for tide_entry in entries:
                            tide_time_str = tide_entry.get("dateTime")
                            if tide_time_str:
                                tide_dt = dt_util.parse_datetime(tide_time_str)
                                if tide_dt:
                                    if tide_dt.tzinfo is None:
                                        tz = dt_util.get_time_zone(self.hass.config.time_zone)
                                        if tz:
                                            try:
                                                tide_dt = tz.localize(tide_dt)
                                            except AttributeError:
                                                tide_dt = tide_dt.replace(tzinfo=tz)
                                    
                                    if tide_entry.get("type") == "high":
                                        forecast_dict["high_tide_time"] = tide_dt.isoformat()
                                        forecast_dict["high_tide_height"] = tide_entry.get("height")
                                    elif tide_entry.get("type") == "low":
                                        forecast_dict["low_tide_time"] = tide_dt.isoformat()
                                        forecast_dict["low_tide_height"] = tide_entry.get("height")

                # Add rainfall data
                if idx < len(rainfall_days):
                    rainfall_day = rainfall_days[idx]
                    if rainfall_day.get("entries"):
                        rainfall_entry = rainfall_day["entries"][0]
                        start_range = rainfall_entry.get("startRange")
                        end_range = rainfall_entry.get("endRange")
                        if start_range is not None and end_range is not None:
                            forecast_dict["precipitation"] = (start_range + end_range) / 2
                        elif end_range is not None:
                            forecast_dict["precipitation"] = end_range
                        
                        prob = rainfall_entry.get("probability")
                        if prob is not None:
                            forecast_dict["precipitation_probability"] = prob

                forecast_data.append(forecast_dict)

            return forecast_data if forecast_data else None

        except (KeyError, IndexError, TypeError, ValueError) as err:
            _LOGGER.error("Error parsing daily forecast data: %s", err)
            return None

    @callback
    def _async_forecast_hourly(self) -> list[Forecast] | None:
        """Return hourly forecast for next 3 days."""
        if not self.coordinator.data:
            return None

        try:
            forecasts = self.coordinator.data.get("forecast", {}).get("forecasts", {})
            
            # Get all available days
            temperature_data = forecasts.get("temperature", {})
            precis_data = forecasts.get("precis", {})  # Changed from weather to precis
            wind_data = forecasts.get("wind", {})
            rainfall_data = forecasts.get("rainfall", {})
            
            temperature_days = temperature_data.get("days", [])
            precis_days = precis_data.get("days", [])  # Changed from weather_days
            wind_days = wind_data.get("days", [])
            rainfall_days = rainfall_data.get("days", [])
            
            uv_enabled = self._entry.options.get(CONF_INCLUDE_UV, False)
            uv_days = forecasts.get("uv", {}).get("days", []) if uv_enabled else []
            swell_enabled = self._entry.options.get(CONF_INCLUDE_SWELL, False)
            swell_days = forecasts.get("swell", {}).get("days", []) if swell_enabled else []

            _LOGGER.debug("Hourly forecast - temp days: %d, precis days: %d", 
                        len(temperature_days), len(precis_days))

            forecast_data = []
            
            for day_idx, day in enumerate(temperature_days):
                if not day.get("entries"):
                    continue

                entries = day["entries"]
                
                for entry in entries:
                    date_string = entry.get("dateTime")
                    if not date_string:
                        continue

                    try:
                        # Parse the datetime from WillyWeather
                        dt = dt_util.parse_datetime(date_string)
                        if not dt:
                            continue
                        
                        # If no timezone, assume local timezone
                        if dt.tzinfo is None:
                            tz = dt_util.get_time_zone(self.hass.config.time_zone)
                            if tz:
                                try:
                                    dt = tz.localize(dt)
                                except AttributeError:
                                    dt = dt.replace(tzinfo=tz)
                        
                    except ValueError:
                        continue

                    forecast_dict: Forecast = {
                        "datetime": dt.isoformat(),
                        "temperature": entry.get("temperature"),
                    }

                    # Add weather condition for icons from precis data
                    condition_found = False
                    if day_idx < len(precis_days):
                        precis_day = precis_days[day_idx]
                        if precis_day.get("entries"):
                            # Find the closest precis entry for this time
                            closest_precis = None
                            closest_diff = None
                            
                            for precis_entry in precis_day["entries"]:
                                precis_time_str = precis_entry.get("dateTime")
                                if precis_time_str:
                                    precis_time = dt_util.parse_datetime(precis_time_str)
                                    if precis_time:
                                        # Calculate time difference
                                        if precis_time.tzinfo is None:
                                            tz = dt_util.get_time_zone(self.hass.config.time_zone)
                                            if tz:
                                                try:
                                                    precis_time = tz.localize(precis_time)
                                                except AttributeError:
                                                    precis_time = precis_time.replace(tzinfo=tz)
                                        
                                        time_diff = abs((dt - precis_time).total_seconds())
                                        
                                        # Use precis if it's within 3 hours and is the closest
                                        if time_diff <= 10800:  # 3 hours in seconds
                                            if closest_diff is None or time_diff < closest_diff:
                                                closest_diff = time_diff
                                                closest_precis = precis_entry
                            
                            if closest_precis:
                                precis_code = closest_precis.get("precisCode")
                                if precis_code:
                                    forecast_dict["condition"] = CONDITION_MAP.get(precis_code, "unknown")
                                    condition_found = True
                                    _LOGGER.debug("Found condition for %s: %s (from precis)", date_string, precis_code)
                    
                    if not condition_found:
                        _LOGGER.debug("No condition found for %s in day %d", date_string, day_idx)

                    # Add wind data
                    if day_idx < len(wind_days):
                        wind_day = wind_days[day_idx]
                        if wind_day.get("entries"):
                            for wind_entry in wind_day["entries"]:
                                if wind_entry.get("dateTime") == date_string:
                                    forecast_dict["wind_speed"] = wind_entry.get("speed")
                                    forecast_dict["wind_bearing"] = wind_entry.get("direction")
                                    break

                    # Add rainfall data
                    if day_idx < len(rainfall_days):
                        rainfall_day = rainfall_days[day_idx]
                        if rainfall_day.get("entries"):
                            for rainfall_entry in rainfall_day["entries"]:
                                if rainfall_entry.get("dateTime") == date_string:
                                    forecast_dict["precipitation_probability"] = rainfall_entry.get("probability")
                                    break

                    # Add UV index if enabled
                    if uv_enabled and day_idx < len(uv_days):
                        uv_day = uv_days[day_idx]
                        if uv_day.get("entries"):
                            for uv_entry in uv_day["entries"]:
                                if uv_entry.get("dateTime") == date_string:
                                    uv_index = uv_entry.get("index")
                                    if uv_index is not None:
                                        forecast_dict["uv_index"] = uv_index
                                    break

                    # Add swell data if enabled
                    if swell_enabled and day_idx < len(swell_days):
                        swell_day = swell_days[day_idx]
                        if swell_day.get("entries"):
                            for swell_entry in swell_day["entries"]:
                                if swell_entry.get("dateTime") == date_string:
                                    forecast_dict["swell_height"] = swell_entry.get("height")
                                    forecast_dict["swell_period"] = swell_entry.get("period")
                                    forecast_dict["swell_direction"] = swell_entry.get("direction")
                                    break

                    forecast_data.append(forecast_dict)

            _LOGGER.debug("Generated %d hourly forecast entries", len(forecast_data))
            return forecast_data if forecast_data else None

        except (KeyError, IndexError, TypeError, ValueError) as err:
            _LOGGER.error("Error parsing hourly forecast data: %s", err)
            return None