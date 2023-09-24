"""Support for the AstroWeather weather service."""
import logging
from typing import List
from datetime import datetime
from homeassistant.components.weather import (
    ATTR_FORECAST_CONDITION,
    ATTR_FORECAST_PRECIPITATION,
    ATTR_FORECAST_PRECIPITATION_PROBABILITY,
    ATTR_FORECAST_TEMP,
    ATTR_FORECAST_TIME,
    ATTR_FORECAST_WIND_BEARING,
    ATTR_FORECAST_WIND_SPEED,
    ATTR_WEATHER_HUMIDITY,
    ATTR_WEATHER_WIND_BEARING,
    ATTR_WEATHER_WIND_SPEED,
    Forecast,
    WeatherEntity,
    WeatherEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.util.unit_system import METRIC_SYSTEM
from homeassistant.const import (
    CONF_ID,
    TEMP_CELSIUS,
)
from homeassistant.core import HomeAssistant

# from pyastroweatherio import (
#     FORECAST_TYPE_DAILY,
#     FORECAST_TYPE_HOURLY,
# )
from .const import (
    DOMAIN,
    ATTR_FORECAST_CLOUDCOVER,
    ATTR_FORECAST_CLOUDLESS,
    ATTR_FORECAST_SEEING,
    ATTR_FORECAST_TRANSPARENCY,
    ATTR_FORECAST_LIFTED_INDEX,
    ATTR_FORECAST_HUMIDITY,
    ATTR_FORECAST_PREC_TYPE,
    ATTR_WEATHER_CLOUDCOVER,
    ATTR_WEATHER_CLOUDLESS,
    ATTR_WEATHER_SEEING,
    ATTR_WEATHER_TRANSPARENCY,
    ATTR_WEATHER_LIFTED_INDEX,
    ATTR_WEATHER_CONDITION,
    ATTR_WEATHER_CONDITION_PLAIN,
    ATTR_WEATHER_PREC_TYPE,
    ATTR_WEATHER_WIND_SPEED_PLAIN,
    ATTR_WEATHER_DEEPSKY_TODAY_DAYNAME,
    ATTR_WEATHER_DEEPSKY_TODAY_PLAIN,
    ATTR_WEATHER_DEEPSKY_TODAY_DESC,
    ATTR_WEATHER_DEEPSKY_TOMORROW_DAYNAME,
    ATTR_WEATHER_DEEPSKY_TOMORROW_PLAIN,
    ATTR_WEATHER_DEEPSKY_TOMORROW_DESC,
    ATTR_WEATHER_SUN_NEXT_RISING,
    ATTR_WEATHER_SUN_NEXT_SETTING,
    ATTR_WEATHER_SUN_NEXT_RISING_NAUTICAL,
    ATTR_WEATHER_SUN_NEXT_SETTING_NAUTICAL,
    ATTR_WEATHER_SUN_NEXT_RISING_ASTRO,
    ATTR_WEATHER_SUN_NEXT_SETTING_ASTRO,
    ATTR_WEATHER_MOON_NEXT_RISING,
    ATTR_WEATHER_MOON_NEXT_SETTING,
    ATTR_WEATHER_MOON_PHASE,
    CONDITION_CLASSES,
    DEFAULT_ATTRIBUTION,
    DEVICE_TYPE_WEATHER,
)
from .entity import AstroWeatherEntity

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    """Set up the AstroWeather weather platform."""
    _LOGGER.info("Set up AstroWeather weather platform")

    unit_system = "metric" if hass.config.units is METRIC_SYSTEM else "imperial"

    fcst_coordinator = hass.data[DOMAIN][entry.entry_id]["fcst_coordinator"]
    if not fcst_coordinator.data:
        return False

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    if not coordinator.data:
        return False

    fcst_type = hass.data[DOMAIN][entry.entry_id]["fcst_type"]
    if not fcst_type:
        return False

    weather_entity = AstroWeatherWeather(
        coordinator,
        entry.data,
        DEVICE_TYPE_WEATHER,
        fcst_coordinator,
        unit_system,
        fcst_type,
    )

    async_add_entities([weather_entity], True)
    return True


class AstroWeatherWeather(AstroWeatherEntity, WeatherEntity):
    """Representation of a weather entity."""

    _attr_supported_features = WeatherEntityFeature.FORECAST_HOURLY

    def __init__(
        self,
        coordinator,
        entries,
        device_type,
        fcst_coordinator,
        unit_system,
        fcst_type,
    ) -> None:
        """Initialize the AstroWeather weather entity."""
        super().__init__(coordinator, entries, device_type, fcst_coordinator)
        self._name = f"{DOMAIN.capitalize()} {entries[CONF_ID]}"
        self._unit_system = unit_system
        self._forecast_type = fcst_type
        self.weather = None

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return self._name

    @property
    def timestamp(self) -> datetime:
        """Return the current data timestamp."""
        if self._current is not None:
            return self._current.timestamp
        return None

    @property
    def cloudcover_percentage(self) -> int:
        """Return current cloud coverage."""
        if self._current is not None:
            return self._current.cloudcover_percentage
        return None

    @property
    def cloudless_percentage(self) -> int:
        """Return current cloud coverage."""
        if self._current is not None:
            return self._current.cloudless_percentage
        return None

    @property
    def seeing_percentage(self) -> int:
        """Return current seeing."""
        if self._current is not None:
            return self._current.seeing_percentage
        return None

    @property
    def transparency_percentage(self) -> int:
        """Return current transparency."""
        if self._current is not None:
            return self._current.transparency_percentage
        return None

    @property
    def condition_percentage(self) -> int:
        """Return current view conditions."""
        if self._current is not None:
            return self._current.condition_percentage
        return None

    @property
    def condition(self) -> str:
        return self._current.condition_plain

    @property
    def condition_plain(self) -> str:
        """Return the weather condition."""
        if self._current is not None:
            if self._current.condition_percentage > 80:
                return CONDITION_CLASSES[0].capitalize()
            if self._current.condition_percentage > 60:
                return CONDITION_CLASSES[1].capitalize()
            if self._current.condition_percentage > 40:
                return CONDITION_CLASSES[2].capitalize()
            if self._current.condition_percentage > 20:
                return CONDITION_CLASSES[3].capitalize()
            return CONDITION_CLASSES[4].capitalize()
        return None

    @property
    def lifted_index(self) -> int:
        """Return lifted index."""
        if self._current is not None:
            return self._current.lifted_index
        return None

    @property
    def native_temperature(self) -> int:
        """Return 2m temperature."""
        if self._current is not None:
            return self._current.temp2m
        return None

    @property
    def prec_type(self) -> str:
        """Return precipitation type."""
        if self._current is not None:
            return self._current.prec_type.capitalize()
        return None

    @property
    def deepsky_forecast_today_dayname(self) -> str:
        """Return tomorrows todays visibility."""
        if self._current is not None:
            return self._current.deepsky_forecast_today_dayname
        return None

    @property
    def deepsky_forecast_today_plain(self) -> str:
        """Return tomorrows todays visibility."""
        if self._current is not None:
            return self._current.deepsky_forecast_today_plain
        return None

    @property
    def deepsky_forecast_today_desc(self) -> str:
        """Return the description of todays deepsky visibility."""
        if self._current is not None:
            return self._current.deepsky_forecast_today_desc
        return None

    @property
    def deepsky_forecast_tomorrow_dayname(self) -> str:
        """Return tomorrows deepsky visibility."""
        if self._current is not None:
            return self._current.deepsky_forecast_tomorrow_dayname
        return None

    @property
    def deepsky_forecast_tomorrow_plain(self) -> str:
        """Return tomorrows deepsky visibility."""
        if self._current is not None:
            return self._current.deepsky_forecast_tomorrow_plain
        return None

    @property
    def deepsky_forecast_tomorrow_desc(self) -> str:
        """Return the description of tomorrows deepsky visibility."""
        if self._current is not None:
            return self._current.deepsky_forecast_tomorrow_desc
        return None

    @property
    def native_temperature_unit(self) -> str:
        """Return the unit of measurement for temperature."""
        return TEMP_CELSIUS

    @property
    def humidity(self) -> int:
        """Return the humidity."""
        if self._current is not None:
            return self._current.rh2m
        return None

    @property
    def native_wind_speed(self) -> float:
        """Return the wind speed."""
        if self._current is not None:
            return self._current.wind10m_speed
        return None

    @property
    def wind_speed_plain(self) -> str:
        """Return the wind speed plain."""
        if self._current is not None:
            return self._current.wind10m_speed_plain
        return None

    @property
    def wind_bearing(self) -> int:
        """Return the wind bearing."""
        if self._current is not None:
            return self._current.wind10m_direction
        return None

    @property
    def sun_next_rising(self) -> datetime:
        """Return sun next rising."""
        if self._current is not None:
            return self._current.sun_next_rising
        return None

    @property
    def sun_next_setting(self) -> datetime:
        """Return sun next setting."""
        if self._current is not None:
            return self._current.sun_next_setting
        return None

    @property
    def sun_next_setting_nautical(self) -> datetime:
        """Return sun next nautical setting."""
        if self._current is not None:
            return self._current.sun_next_setting_nautical
        return None

    @property
    def sun_next_rising_nautical(self) -> datetime:
        """Return sun next nautical rising."""
        if self._current is not None:
            return self._current.sun_next_rising_nautical
        return None

    @property
    def sun_next_setting_astro(self) -> datetime:
        """Return sun next astronomical setting."""
        if self._current is not None:
            return self._current.sun_next_setting_astro
        return None

    @property
    def sun_next_rising_astro(self) -> datetime:
        """Return sun next astronomical rising."""
        if self._current is not None:
            return self._current.sun_next_rising_astro
        return None

    @property
    def moon_next_rising(self) -> datetime:
        """Return moon next rising."""
        if self._current is not None:
            return self._current.moon_next_rising
        return None

    @property
    def moon_next_setting(self) -> datetime:
        """Return moon next setting."""
        if self._current is not None:
            return self._current.moon_next_setting
        return None

    @property
    def moon_phase(self) -> int:
        """Return moon phase."""
        if self._current is not None:
            return self._current.moon_phase
        return None

    @property
    def attribution(self) -> str:
        """Return the attribution."""
        return DEFAULT_ATTRIBUTION

    @property
    def extra_state_attributes(self):
        """Return the sensor state attributes."""
        return {
            **super().extra_state_attributes,
            "timestamp": self.timestamp,
            ATTR_WEATHER_CLOUDCOVER: self.cloudcover_percentage,
            ATTR_WEATHER_CLOUDLESS: self.cloudless_percentage,
            ATTR_WEATHER_SEEING: self.seeing_percentage,
            ATTR_WEATHER_TRANSPARENCY: self.transparency_percentage,
            ATTR_WEATHER_LIFTED_INDEX: self.lifted_index,
            ATTR_WEATHER_CONDITION: self.condition_percentage,
            ATTR_WEATHER_CONDITION_PLAIN: self.condition_plain,
            ATTR_WEATHER_PREC_TYPE: self.prec_type,
            ATTR_WEATHER_WIND_SPEED: self.native_wind_speed,
            ATTR_WEATHER_WIND_SPEED_PLAIN: self.wind_speed_plain,
            ATTR_WEATHER_WIND_BEARING: self.wind_bearing,
            ATTR_WEATHER_DEEPSKY_TODAY_DAYNAME: self.deepsky_forecast_today_dayname,
            ATTR_WEATHER_DEEPSKY_TODAY_PLAIN: self.deepsky_forecast_today_plain,
            ATTR_WEATHER_DEEPSKY_TODAY_DESC: self.deepsky_forecast_today_desc,
            ATTR_WEATHER_DEEPSKY_TOMORROW_DAYNAME: self.deepsky_forecast_tomorrow_dayname,
            ATTR_WEATHER_DEEPSKY_TOMORROW_PLAIN: self.deepsky_forecast_tomorrow_plain,
            ATTR_WEATHER_DEEPSKY_TOMORROW_DESC: self.deepsky_forecast_tomorrow_desc,
            ATTR_WEATHER_SUN_NEXT_RISING: self.sun_next_rising,
            ATTR_WEATHER_SUN_NEXT_SETTING: self.sun_next_setting,
            ATTR_WEATHER_SUN_NEXT_RISING_NAUTICAL: self.sun_next_rising_nautical,
            ATTR_WEATHER_SUN_NEXT_SETTING_NAUTICAL: self.sun_next_setting_nautical,
            ATTR_WEATHER_SUN_NEXT_RISING_ASTRO: self.sun_next_rising_astro,
            ATTR_WEATHER_SUN_NEXT_SETTING_ASTRO: self.sun_next_setting_astro,
            ATTR_WEATHER_MOON_NEXT_RISING: self.moon_next_rising,
            ATTR_WEATHER_MOON_NEXT_SETTING: self.moon_next_setting,
            ATTR_WEATHER_MOON_PHASE: self.moon_phase,
        }

    def get_forecast(self, index, param):
        """Retrieve forecast parameter."""
        try:
            forecast = self.weather["forecasts"][index]
            return forecast[param]
        except (IndexError, KeyError) as err:
            raise ValueError from err

    def _forecast(self) -> list[Forecast] | None:
        """Return the forecast array."""

        if self.fcst_coordinator.data is None or len(self.fcst_coordinator.data) < 2:
            return None

        forecasts: list[Forecast] = []

        for forecast in self.fcst_coordinator.data:
            forecasts.append(
                {
                    ATTR_FORECAST_TIME: forecast.timestamp,
                    ATTR_FORECAST_PRECIPITATION: None,
                    ATTR_FORECAST_PRECIPITATION_PROBABILITY: None,
                    ATTR_FORECAST_CLOUDCOVER: forecast.cloudcover_percentage,
                    ATTR_FORECAST_CLOUDLESS: forecast.cloudless_percentage,
                    ATTR_FORECAST_SEEING: forecast.seeing_percentage,
                    ATTR_FORECAST_TRANSPARENCY: forecast.transparency_percentage,
                    ATTR_FORECAST_LIFTED_INDEX: forecast.lifted_index,
                    ATTR_FORECAST_CONDITION: forecast.condition_percentage,
                    ATTR_FORECAST_HUMIDITY: forecast.rh2m,
                    ATTR_FORECAST_WIND_SPEED: forecast.wind10m_speed,
                    ATTR_FORECAST_WIND_BEARING: forecast.wind10m_direction,
                    ATTR_FORECAST_TEMP: forecast.temp2m,
                    ATTR_FORECAST_PREC_TYPE: forecast.prec_type,
                }
            )

        if forecasts:
            return forecasts
        return None

    @property
    def forecast(self) -> list[Forecast] | None:
        """Return the forecast array."""
        return self._forecast()

    async def async_forecast_hourly(self) -> list[Forecast] | None:
        """Return the hourly forecast in native units."""
        return self._forecast()

    async def async_update(self) -> None:
        """Get the latest weather data."""
        # await self.fcst_coordinator.update()
        # thermostat = self.data.ecobee.get_thermostat(self._index)
        self.weather = self.fcst_coordinator.data
        await self.async_update_listeners(("hourly",))
