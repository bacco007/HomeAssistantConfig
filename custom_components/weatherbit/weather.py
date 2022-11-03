"""Support for the Weatherbit weather service."""
from __future__ import annotations

import logging

from homeassistant.components.weather import (
    ATTR_FORECAST_CONDITION,
    ATTR_FORECAST_NATIVE_PRECIPITATION,
    ATTR_FORECAST_PRECIPITATION_PROBABILITY,
    ATTR_FORECAST_NATIVE_TEMP,
    ATTR_FORECAST_NATIVE_TEMP_LOW,
    ATTR_FORECAST_TIME,
    ATTR_FORECAST_WIND_BEARING,
    ATTR_FORECAST_NATIVE_WIND_SPEED,
    Forecast,
    WeatherEntity,
    WeatherEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    PRECISION_TENTHS,
    UnitOfLength,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant
from pyweatherbitdata.data import ForecastDetailDescription

from .const import ATTR_ALT_CONDITION, DOMAIN
from .entity import WeatherbitEntity
from .models import WeatherBitEntryData

_WEATHER_DAILY = "weather_daily"

WEATHER_TYPES: tuple[WeatherEntityDescription, ...] = (
    WeatherEntityDescription(
        key=_WEATHER_DAILY,
        name="Weatherbit",
    ),
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities
) -> None:
    """Add a weather entity from a config_entry."""
    entry_data: WeatherBitEntryData = hass.data[DOMAIN][entry.entry_id]
    weatherbitapi = entry_data.weatherbitapi
    coordinator = entry_data.coordinator
    forecast_coordinator = entry_data.forecast_coordinator
    station_data = entry_data.station_data

    entities = []
    for description in WEATHER_TYPES:
        entities.append(
            WeatherbitWeatherEntity(
                weatherbitapi,
                coordinator,
                forecast_coordinator,
                station_data,
                description,
                entry,
            )
        )

        _LOGGER.debug(
            "Adding weather entity %s",
            description.name,
        )

    async_add_entities(entities)


class WeatherbitWeatherEntity(WeatherbitEntity, WeatherEntity):
    """A WeatherBit weather entity."""

    # pylint: disable=too-many-instance-attributes
    # pylint: disable=too-many-arguments
    # Seven is reasonable in this case.

    def __init__(
        self,
        weatherbitapi,
        coordinator,
        forecast_coordinator,
        station_data,
        description,
        entries: ConfigEntry,
    ):
        """Initialize an WeatherBit Weather Entity."""
        super().__init__(
            weatherbitapi,
            coordinator,
            forecast_coordinator,
            station_data,
            description,
            entries,
        )
        self.daily_forecast = self.entity_description.key in _WEATHER_DAILY
        self._attr_name = self.entity_description.name
        self._attr_native_precipitation_unit = UnitOfLength.MILLIMETERS
        self._attr_precision = PRECISION_TENTHS
        self._attr_native_temperature_unit = UnitOfTemperature.CELSIUS

    @property
    def condition(self):
        """Return the current condition."""
        return getattr(self.forecast_coordinator.data, "condition")

    @property
    def native_temperature(self):
        """Return the temperature."""
        return getattr(self.coordinator.data, "temp")

    @property
    def humidity(self):
        """Return the humidity."""
        return getattr(self.coordinator.data, "humidity")

    @property
    def native_pressure(self):
        """Return the pressure."""
        if getattr(self.coordinator.data, "slp") is None:
            return None

        return getattr(self.coordinator.data, "slp")

    @property
    def native_wind_speed(self):
        """Return the wind speed."""
        if getattr(self.coordinator.data, "wind_spd") is None:
            return None

        return getattr(self.coordinator.data, "wind_spd")

    @property
    def wind_bearing(self):
        """Return the wind bearing."""
        return getattr(self.coordinator.data, "wind_dir")

    @property
    def native_visibility(self):
        """Return the visibility."""
        return getattr(self.coordinator.data, "vis")

    @property
    def ozone(self):
        """Return the ozone."""
        return getattr(self.forecast_coordinator.data, "ozone")

    @property
    def extra_state_attributes(self):
        """Return extra state attributes"""
        return {
            **super().extra_state_attributes,
            ATTR_ALT_CONDITION: getattr(
                self.forecast_coordinator.data, "alt_condition"
            ),
        }

    @property
    def forecast(self) -> list[Forecast] | None:
        """Return the forecast array."""
        data: list[Forecast] = []
        if self.daily_forecast:
            forecast_data: ForecastDetailDescription = (
                self.forecast_coordinator.data.forecast
            )
            for item in forecast_data:
                data.append(
                    {
                        ATTR_FORECAST_TIME: item.utc_time,
                        ATTR_FORECAST_NATIVE_TEMP: item.max_temp,
                        ATTR_FORECAST_NATIVE_TEMP_LOW: item.min_temp,
                        ATTR_FORECAST_NATIVE_PRECIPITATION: item.precip,
                        ATTR_FORECAST_PRECIPITATION_PROBABILITY: item.pop,
                        ATTR_FORECAST_CONDITION: item.condition,
                        ATTR_FORECAST_NATIVE_WIND_SPEED: item.wind_spd,
                        ATTR_FORECAST_WIND_BEARING: item.wind_dir,
                    }
                )
            return data
        return data
