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
    WeatherFlowStationData,
)

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError, ConfigEntryNotReady, Unauthorized
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.loader import async_get_integration

from .const import (
    DEFAULT_ADD_SENSOR,
    DEFAULT_FORECAST_HOURS,
    DOMAIN,
    CONF_ADD_SENSORS,
    CONF_API_TOKEN,
    CONF_FORECAST_HOURS,
    CONF_STATION_ID,
    STARTUP,
)

PLATFORMS = [Platform.WEATHER, Platform.SENSOR, Platform.BINARY_SENSOR]

_LOGGER = logging.getLogger(__name__)

def _get_platforms(config_entry: ConfigEntry):

    add_sensors = DEFAULT_ADD_SENSOR if config_entry.options.get(
        CONF_ADD_SENSORS) is None else config_entry.options.get(CONF_ADD_SENSORS)

    return add_sensors

def _get_forecast_hours(config_entry: ConfigEntry):

    forecast_hours = DEFAULT_FORECAST_HOURS if config_entry.options.get(
        CONF_FORECAST_HOURS) is None else config_entry.options.get(CONF_FORECAST_HOURS)

    return forecast_hours


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Set up WeatherFlow Forecast as config entry."""
    hass.data.setdefault(DOMAIN, {})
    integration = await async_get_integration(hass, DOMAIN)
    _LOGGER.info(STARTUP, integration.version, str(config_entry.data[CONF_STATION_ID]))

    add_sensors = _get_platforms(config_entry)
    forecast_hours = _get_forecast_hours(config_entry)

    coordinator = WeatherFlowForecastDataUpdateCoordinator(
        hass, config_entry, add_sensors, forecast_hours)
    if ConfigEntryState == ConfigEntryState.SETUP_IN_PROGRESS:
        await coordinator.async_config_entry_first_refresh()
    else:
        await coordinator.async_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][config_entry.entry_id] = coordinator

    config_entry.async_on_unload(config_entry.add_update_listener(async_update_entry))

    await hass.config_entries.async_forward_entry_setups(config_entry, PLATFORMS)

    if not add_sensors:
        await cleanup_old_device(hass, str(config_entry.data[CONF_STATION_ID]))

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


async def cleanup_old_device(hass: HomeAssistant, station_id) -> None:
    """Cleanup device without proper device identifier."""
    device_reg = dr.async_get(hass)
    device = device_reg.async_get_device(
        identifiers={(DOMAIN, station_id)})  # type: ignore[arg-type]
    if device:
        _LOGGER.debug("Removing deselected sensors: %s", device.name)
        device_reg.async_remove_device(device.id)
    device = device_reg.async_get_device(
        identifiers={(DOMAIN, f"{station_id}_binary")})  # type: ignore[arg-type]
    if device:
        _LOGGER.debug("Removing deselected sensors: %s", device.name)
        device_reg.async_remove_device(device.id)

class CannotConnect(HomeAssistantError):
    """Unable to connect to the web site."""

class WeatherFlowForecastDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching WeatherFlow data."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry, add_sensors: bool, forecast_hours: int) -> None:
        """Initialize global WeatherFlow forecast data updater."""
        self.weather = WeatherFlowForecastWeatherData(
            hass, config_entry.data, add_sensors, forecast_hours)
        self.weather.initialize_data()
        self.hass = hass
        self.config_entry = config_entry
        self.add_sensors = add_sensors
        self.forecast_hours = forecast_hours

        if add_sensors:
            update_interval = timedelta(minutes=randrange(1, 5))
        else:
            update_interval = timedelta(minutes=randrange(25, 35))

        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=update_interval, config_entry=config_entry)

    async def _async_update_data(self) -> WeatherFlowForecastWeatherData:
        """Fetch data from WeatherFlow Forecast."""
        try:
            return await self.weather.fetch_data()
        except Exception as err:
            raise UpdateFailed(f"Update failed: {err}") from err


class WeatherFlowForecastWeatherData:
    """Keep data for WeatherFlow Forecast entity data."""

    def __init__(self, hass: HomeAssistant, config: MappingProxyType[str, Any], add_sensors: bool, forecast_hours: int) -> None:
        """Initialise the weather entity data."""
        self.hass = hass
        self._config = config
        self._add_sensors = add_sensors
        self._forecast_hours = forecast_hours
        self._weather_data: WeatherFlow
        self.current_weather_data: WeatherFlowForecastData = {}
        self.daily_forecast: WeatherFlowForecastDaily = []
        self.hourly_forecast: WeatherFlowForecastHourly = []
        self.sensor_data: WeatherFlowSensorData = {}
        self.station_data: WeatherFlowStationData = {}

    def initialize_data(self) -> bool:
        """Establish connection to API."""

        self._weather_data = WeatherFlow(
            str(self._config[CONF_STATION_ID]), self._config[CONF_API_TOKEN], elevation=self.hass.config.elevation, session=async_get_clientsession(self.hass), forecast_hours=self._forecast_hours)

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
                resp: WeatherFlowSensorData = await self._weather_data.async_fetch_sensor_data()
                station_info: WeatherFlowStationData = await self._weather_data.async_get_station()
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

            if not resp or not station_info:
                raise CannotConnect()
            self.sensor_data = resp
            self.station_data = station_info
            if not self.sensor_data.data_available:
                _LOGGER.warning(
                    "Weather Station either is offline or no recent observations from station. Remove Sensors to avoid this warning.")

        return self
