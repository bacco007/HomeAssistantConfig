"""Platform for sensor integration."""
from __future__ import annotations

import logging
from datetime import datetime

import iso8601
from homeassistant.components.weather import Forecast, WeatherEntity, WeatherEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfSpeed, UnitOfTemperature, UnitOfPressure, UnitOfLength
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_sunrise, async_track_sunset
from homeassistant.helpers.sun import is_up
from zoneinfo import ZoneInfo

from . import BomDataUpdateCoordinator
from .const import (
    ATTRIBUTION,
    COLLECTOR,
    CONDITION_FRIENDLY,
    CONF_ENTITY_PREFIX,
    CONF_WEATHER_NAME,
    COORDINATOR,
    DOMAIN,
    MAP_CONDITION,
    SHORT_ATTRIBUTION,
    MODEL_NAME,
)
from .PyBoM.collector import Collector
from .PyBoM.const import MAP_MDI_ICON, apply_day_night

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Add sensors for passed config_entry in HA."""
    hass_data = hass.data[DOMAIN][config_entry.entry_id]

    new_entities = []

    location_name = config_entry.options.get(
        CONF_WEATHER_NAME, config_entry.data.get(CONF_WEATHER_NAME, "Home")
    )

    # Get entity prefix from config, fallback to default based on location name
    entity_prefix = config_entry.options.get(
        CONF_ENTITY_PREFIX,
        config_entry.data.get(
            CONF_ENTITY_PREFIX,
            f"bom_{location_name.lower().replace(' ', '_').replace('-', '_')}"
        )
    )

    # Create a single comprehensive weather entity that supports both daily and hourly forecasts
    new_entities.append(BomWeather(hass_data, location_name, entity_prefix))

    if new_entities:
        async_add_entities(new_entities, update_before_add=False)


class WeatherBase(WeatherEntity):
    """Base representation of a BOM weather entity."""

    def __init__(self, hass_data, location_name, entity_prefix) -> None:
        """Initialize the sensor."""
        self.collector: Collector = hass_data[COLLECTOR]
        self.coordinator: BomDataUpdateCoordinator = hass_data[COORDINATOR]
        self.location_name: str = location_name
        self.entity_prefix: str = entity_prefix
        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{self.entity_prefix}")},
            manufacturer=SHORT_ATTRIBUTION,
            model=MODEL_NAME,
            name=f"BOM {self.location_name}",
        )

    async def async_added_to_hass(self) -> None:
        """Set up a listener and load data."""
        self.async_on_remove(self.coordinator.async_add_listener(self._update_callback))
        # Re-render at the actual sunrise/sunset so the sunny <-> clear-night
        # transition is immediate rather than lagging to the next hour block.
        self.async_on_remove(async_track_sunrise(self.hass, self._update_callback))
        self.async_on_remove(async_track_sunset(self.hass, self._update_callback))
        self._update_callback()

    async def async_forecast_daily(self) -> list[Forecast]:
        """Return the daily forecast."""
        if not self.collector.daily_forecasts_data or "data" not in self.collector.daily_forecasts_data:
            return []
        if not self.collector.locations_data or "data" not in self.collector.locations_data:
            return []

        tzinfo = ZoneInfo(self.collector.locations_data["data"]["timezone"])
        return [
            Forecast(
                datetime=iso8601.parse_date(data["date"]).astimezone(tzinfo).replace(tzinfo=None).isoformat(),
                native_temperature=data.get("temp_max"),
                condition=MAP_CONDITION.get(data.get("icon_descriptor")),
                templow=data.get("temp_min"),
                native_precipitation=data.get("rain_amount_max"),
                precipitation_probability=data.get("rain_chance"),
            )
            for data in self.collector.daily_forecasts_data["data"]
            # BOM returns a trailing partial day beyond its 7-day horizon for which it
            # hasn't issued a worded forecast: icon_descriptor, short_text and
            # extended_text are null (temp_max is sometimes populated, sometimes not).
            # Gate on icon_descriptor so the card never renders a tile with a missing
            # icon, matching the official BOM app.
            if data.get("icon_descriptor") is not None
        ]

    async def async_forecast_hourly(self) -> list[Forecast]:
        """Return the hourly forecast."""
        if not self.collector.hourly_forecasts_data or "data" not in self.collector.hourly_forecasts_data:
            return []
        if not self.collector.locations_data or "data" not in self.collector.locations_data:
            return []

        tzinfo = ZoneInfo(self.collector.locations_data["data"]["timezone"])
        return [
            Forecast(
                datetime=iso8601.parse_date(data["time"]).astimezone(tzinfo).replace(tzinfo=None).isoformat(),
                native_temperature=data.get("temp"),
                condition=MAP_CONDITION.get(data.get("icon_descriptor")),
                native_precipitation=data.get("rain_amount_max"),
                precipitation_probability=data.get("rain_chance"),
                wind_bearing=data.get("wind_direction"),
                native_wind_speed=data.get("wind_speed_kilometre"),
                wind_gust_speed=data.get("wind_gust_speed_kilometre"),
                humidity=data.get("relative_humidity"),
                uv_index=data.get("uv"),
            )
            for data in self.collector.hourly_forecasts_data["data"]
        ]

    @property
    def supported_features(self) -> WeatherEntityFeature:
        """Determine supported features based on available data sets reported by BOM."""
        return WeatherEntityFeature.FORECAST_DAILY | WeatherEntityFeature.FORECAST_HOURLY

    @callback
    def _update_callback(self) -> None:
        """Load data from integration."""
        self.async_write_ha_state()

    @property
    def should_poll(self) -> bool:
        """Entities do not individually poll."""
        return False

    @property
    def native_temperature(self) -> float | None:
        """Return the platform temperature."""
        if self.collector.observations_data and "data" in self.collector.observations_data:
            return self.collector.observations_data["data"].get("temp")
        return None

    def _current_icon_descriptor(self) -> str | None:
        """Return the current hour's icon descriptor, corrected for real-time sun position.

        BOM's hourly ``is_night`` flag only flips at the top of the hour, which makes the
        sunny <-> clear-night transition lag up to an hour behind the actual sunrise/sunset.
        Re-derive the day/night swap from Home Assistant's current sun position instead.
        """
        data = self.collector.hourly_forecasts_data
        if not data or "data" not in data or not data["data"]:
            return None
        descriptor = data["data"][0].get("icon_descriptor")
        if self.hass is not None:
            descriptor = apply_day_night(descriptor, not is_up(self.hass))
        return descriptor

    @property
    def icon(self) -> str | None:
        """Return the icon from most recent hourly forecast."""
        return MAP_MDI_ICON.get(self._current_icon_descriptor())

    @property
    def native_temperature_unit(self) -> str:
        """Return the unit of measurement."""
        return UnitOfTemperature.CELSIUS

    @property
    def humidity(self) -> float | None:
        """Return the humidity."""
        if self.collector.observations_data and "data" in self.collector.observations_data:
            return self.collector.observations_data["data"].get("humidity")
        return None

    @property
    def native_wind_speed(self) -> float | None:
        """Return the wind speed."""
        if self.collector.observations_data and "data" in self.collector.observations_data:
            return self.collector.observations_data["data"].get("wind_speed_kilometre")
        return None

    @property
    def native_wind_speed_unit(self) -> str:
        """Return the unit of measurement for wind speed."""
        return UnitOfSpeed.KILOMETERS_PER_HOUR

    @property
    def wind_bearing(self) -> float | None:
        """Return the wind bearing."""
        if self.collector.observations_data and "data" in self.collector.observations_data:
            return self.collector.observations_data["data"].get("wind_direction")
        return None

    @property
    def native_wind_gust_speed(self) -> float | None:
        """Return the wind gust speed."""
        if self.collector.observations_data and "data" in self.collector.observations_data:
            return self.collector.observations_data["data"].get("gust_speed_kilometre")
        return None

    @property
    def native_apparent_temperature(self) -> float | None:
        """Return the apparent temperature (feels like)."""
        if self.collector.observations_data and "data" in self.collector.observations_data:
            return self.collector.observations_data["data"].get("temp_feels_like")
        return None

    @property
    def native_dew_point(self) -> float | None:
        """Return the dew point."""
        if self.collector.observations_data and "data" in self.collector.observations_data:
            return self.collector.observations_data["data"].get("dew_point")
        return None

    @property
    def uv_index(self) -> float | None:
        """Return the UV index from today's forecast."""
        if self.collector.daily_forecasts_data and "data" in self.collector.daily_forecasts_data:
            if len(self.collector.daily_forecasts_data["data"]) > 0:
                return self.collector.daily_forecasts_data["data"][0].get("uv_max_index")
        return None

    @property
    def attribution(self) -> str:
        """Return the attribution."""
        return ATTRIBUTION

    @property
    def condition(self) -> str | None:
        """Return the current condition, corrected for real-time sun position."""
        return MAP_CONDITION.get(self._current_icon_descriptor())

    async def async_update(self) -> None:
        """Update the weather data."""
        await self.coordinator.async_update()


class BomWeather(WeatherBase):
    """Comprehensive representation of a BOM weather entity with daily and hourly forecasts."""

    def __init__(self, hass_data, location_name: str, entity_prefix: str) -> None:
        """Initialize the sensor."""
        super().__init__(hass_data, location_name, entity_prefix)

    @property
    def supported_features(self) -> WeatherEntityFeature:
        """Return supported features - both daily and hourly forecasts."""
        return WeatherEntityFeature.FORECAST_DAILY | WeatherEntityFeature.FORECAST_HOURLY

    @property
    def name(self) -> str:
        """Return the name."""
        return f"BOM {self.location_name}"

    @property
    def unique_id(self) -> str:
        """Return Unique ID string."""
        return self.entity_prefix

    @property
    def extra_state_attributes(self) -> dict[str, str | int | None]:
        """Return comprehensive weather attributes."""
        try:
            attrs = {}

            # Add station data
            if self.collector.observations_data and "data" in self.collector.observations_data:
                obs_data = self.collector.observations_data["data"]
                station = obs_data.get("station")
                if station:
                    attrs["station_name"] = station.get("name")
                    attrs["station_id"] = station.get("bom_id")

            # Add today's forecast data (supplementary information not in standard weather properties)
            if self.collector.daily_forecasts_data and "data" in self.collector.daily_forecasts_data:
                if len(self.collector.daily_forecasts_data["data"]) > 0:
                    today = self.collector.daily_forecasts_data["data"][0]
                    attrs["uv_category"] = today.get("uv_category")
                    attrs["uv_start_time"] = today.get("uv_start_time")
                    attrs["uv_end_time"] = today.get("uv_end_time")
                    attrs["fire_danger"] = today.get("fire_danger")
                    attrs["sunrise"] = today.get("astronomical_sunrise_time")
                    attrs["sunset"] = today.get("astronomical_sunset_time")
                    attrs["extended_text"] = today.get("extended_text")
                    attrs["now_label"] = today.get("now_label")
                    attrs["now_temp"] = today.get("temp_now")
                    attrs["later_label"] = today.get("later_label")
                    attrs["later_temp"] = today.get("temp_later")

                    # Add short text forecast with punctuation removed
                    short_text = today.get("short_text")
                    if short_text:
                        # Remove trailing punctuation (periods, etc.)
                        attrs["short_text"] = short_text.rstrip(".!,;:")

            # Add warning count
            if self.collector.warnings_data and "data" in self.collector.warnings_data:
                attrs["warning_count"] = len(self.collector.warnings_data["data"])

            attrs["attribution"] = ATTRIBUTION

            return attrs
        except (KeyError, TypeError) as err:
            _LOGGER.debug(f"Error building weather attributes: {err}")
            return {"attribution": ATTRIBUTION}
