"""WeatherFlow Forecast Platform."""
from __future__ import annotations

from datetime import timedelta
import logging
from random import randrange
from types import MappingProxyType
from typing import Any, Self

from pyweatherflow_forecast import (
    WeatherFlow,
    WeatherFlowForecastData,
    WeatherFlowForecastDaily,
    WeatherFlowForecastHourly,
    WeatherFlowForecastUnauthorized,
    WeatherFlowForecastBadRequest,
    WeatherFlowForecastInternalServerError,
    WeatherFlowForecastWongStationId,
    WeatherFlowSensorData,
)

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError, ConfigEntryNotReady, Unauthorized
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    DEFAULT_ADD_SENSOR,
    DOMAIN,
    CONF_ADD_SENSORS,
    CONF_API_TOKEN,
    CONF_STATION_ID,
)

PLATFORMS = [Platform.WEATHER, Platform.SENSOR]

_LOGGER = logging.getLogger(__name__)

def _get_platforms(config_entry: ConfigEntry):

    add_sensors = DEFAULT_ADD_SENSOR if config_entry.options.get(
        CONF_ADD_SENSORS) is None else config_entry.options.get(CONF_ADD_SENSORS)

    return add_sensors


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Set up WeatherFlow Forecast as config entry."""

    add_sensors = _get_platforms(config_entry)

    coordinator = WeatherFlowForecastDataUpdateCoordinator(hass, config_entry, add_sensors)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][config_entry.entry_id] = coordinator

    config_entry.async_on_unload(config_entry.add_update_listener(async_update_entry))

    await hass.config_entries.async_forward_entry_setups(config_entry, PLATFORMS)

    return True

async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    unload_ok = await hass.config_entries.async_unload_platforms(
        config_entry, PLATFORMS
    )

    hass.data[DOMAIN].pop(config_entry.entry_id)

    return unload_ok

async def async_update_entry(hass: HomeAssistant, config_entry: ConfigEntry):
    """Reload WeatherFlow Forecast component when options changed."""
    await hass.config_entries.async_reload(config_entry.entry_id)


class CannotConnect(HomeAssistantError):
    """Unable to connect to the web site."""

class WeatherFlowForecastDataUpdateCoordinator(DataUpdateCoordinator["WeatherFlowForecastWeatherData"]):
    """Class to manage fetching WeatherFlow data."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry, add_sensors: bool) -> None:
        """Initialize global WeatherFlow forecast data updater."""
        self.weather = WeatherFlowForecastWeatherData(hass, config_entry.data, add_sensors)
        self.weather.initialize_data()
        self.hass = hass
        self.config_entry = config_entry
        self.add_sensors = add_sensors

        if add_sensors:
            update_interval = timedelta(minutes=randrange(1, 5))
        else:
            update_interval = timedelta(minutes=randrange(25, 35))

        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=update_interval)

    async def _async_update_data(self) -> WeatherFlowForecastWeatherData:
        """Fetch data from WeatherFlow Forecast."""
        try:
            return await self.weather.fetch_data()
        except Exception as err:
            raise UpdateFailed(f"Update failed: {err}") from err


class WeatherFlowForecastWeatherData:
    """Keep data for WeatherFlow Forecast entity data."""

    def __init__(self, hass: HomeAssistant, config: MappingProxyType[str, Any], add_sensors: bool) -> None:
        """Initialise the weather entity data."""
        self.hass = hass
        self._config = config
        self._add_sensors = add_sensors
        self._weather_data: WeatherFlow
        self.current_weather_data: WeatherFlowForecastData = {}
        self.daily_forecast: WeatherFlowForecastDaily = []
        self.hourly_forecast: WeatherFlowForecastHourly = []
        self.sensor_data: WeatherFlowSensorData = {}

    def initialize_data(self) -> bool:
        """Establish connection to API."""
        self._weather_data = WeatherFlow(
            self._config[CONF_STATION_ID], self._config[CONF_API_TOKEN], session=async_get_clientsession(self.hass))

        return True

    async def fetch_data(self) -> Self:
        """Fetch data from API - (current weather and forecast)."""

        try:
            resp: WeatherFlowForecastData = await self._weather_data.async_get_forecast()
        except WeatherFlowForecastWongStationId as unauthorized:
            _LOGGER.debug(unauthorized)
            raise Unauthorized from unauthorized
        except WeatherFlowForecastBadRequest as err:
            _LOGGER.debug(err)
            return False
        except WeatherFlowForecastUnauthorized as unauthorized:
            _LOGGER.debug(unauthorized)
            raise Unauthorized from unauthorized
        except WeatherFlowForecastInternalServerError as notreadyerror:
            _LOGGER.debug(notreadyerror)
            raise ConfigEntryNotReady from notreadyerror

        if not resp:
            raise CannotConnect()
        self.current_weather_data = resp
        self.daily_forecast = resp.forecast_daily
        self.hourly_forecast = resp.forecast_hourly

        if self._add_sensors:
            try:
                resp: WeatherFlowForecastData = await self._weather_data.async_get_sensors()
            except WeatherFlowForecastWongStationId as unauthorized:
                _LOGGER.debug(unauthorized)
                raise Unauthorized from unauthorized
            except WeatherFlowForecastBadRequest as err:
                _LOGGER.debug(err)
                return False
            except WeatherFlowForecastUnauthorized as unauthorized:
                _LOGGER.debug(unauthorized)
                raise Unauthorized from unauthorized
            except WeatherFlowForecastInternalServerError as notreadyerror:
                _LOGGER.debug(notreadyerror)
                raise ConfigEntryNotReady from notreadyerror

            if not resp:
                raise CannotConnect()
            self.sensor_data = resp
            # _LOGGER.debug(vars(self.sensor_data))

        return self
