"""Visual Crossing Weather Platform."""
from __future__ import annotations

from collections.abc import Callable
from datetime import timedelta
import logging
from random import randrange
from types import MappingProxyType
from typing import Any, Self

from pyVisualCrossing import (
    VisualCrossing,
    ForecastData,
    ForecastDailyData,
    ForecastHourlyData,
    VisualCrossingTooManyRequests,
    VisualCrossingBadRequest,
    VisualCrossingInternalServerError,
    VisualCrossingUnauthorized,
)

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    Platform,
    CONF_API_KEY,
    CONF_LANGUAGE,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    EVENT_CORE_CONFIG_UPDATE,
)
from homeassistant.core import Event, HomeAssistant
from homeassistant.exceptions import HomeAssistantError, ConfigEntryNotReady
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN, CONF_DAYS

PLATFORMS = [Platform.WEATHER]


_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Set up Visual Crossing as config entry."""

    coordinator = VCDataUpdateCoordinator(hass, config_entry)
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
    """Reload Visual Crossing component when options changed."""
    await hass.config_entries.async_reload(config_entry.entry_id)


class CannotConnect(HomeAssistantError):
    """Unable to connect to the web site."""


class VCDataUpdateCoordinator(DataUpdateCoordinator["VCWeatherData"]):
    """Class to manage fetching Visual Crossing data."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize global Visual Crossing data updater."""
        self._unsub_track_home: Callable[[], None] | None = None
        self.weather = VCWeatherData(hass, config_entry.data, config_entry.options)
        self.weather.initialize_data()

        update_interval = timedelta(minutes=randrange(31, 32))

        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=update_interval)

    async def _async_update_data(self) -> VCWeatherData:
        """Fetch data from Visual Crossing."""
        try:
            return await self.weather.fetch_data()
        except Exception as err:
            raise UpdateFailed(f"Update failed: {err}") from err

    def track_home(self) -> None:
        """Start tracking changes to HA home setting."""
        if self._unsub_track_home:
            return

        async def _async_update_weather_data(_event: Event | None = None) -> None:
            """Update weather data."""
            if self.weather.initialize_data():
                _LOGGER.debug("Refreshing called")
                await self.async_refresh()

        self._unsub_track_home = self.hass.bus.async_listen(
            EVENT_CORE_CONFIG_UPDATE, _async_update_weather_data
        )

    def untrack_home(self) -> None:
        """Stop tracking changes to HA home setting."""
        if self._unsub_track_home:
            self._unsub_track_home()
            self._unsub_track_home = None


class VCWeatherData:
    """Keep data for Visual Crossing entity data."""

    def __init__(
        self,
        hass: HomeAssistant,
        config: MappingProxyType[str, Any],
        options: MappingProxyType[str, Any],
    ) -> None:
        """Initialise the weather entity data."""
        self.hass = hass
        self._config = config
        self._options = options
        self._weather_data: VisualCrossing
        self.current_weather_data: ForecastData = {}
        self.daily_forecast: ForecastDailyData = []
        self.hourly_forecast: ForecastHourlyData = []

    def initialize_data(self) -> bool:
        """Establish connection to API."""
        self._weather_data = VisualCrossing(
            self._config[CONF_API_KEY],
            self._config[CONF_LATITUDE],
            self._config[CONF_LONGITUDE],
            days=self._options[CONF_DAYS],
            language=self._options[CONF_LANGUAGE],
            session=async_get_clientsession(self.hass),
        )

        return True

    async def fetch_data(self) -> Self:
        """Fetch data from API - (current weather and forecast)."""
        _LOGGER.debug("Refreshing Weather Data from Visual Crossing")
        try:
            resp: ForecastData = await self._weather_data.async_fetch_data()
        except VisualCrossingUnauthorized as notreadyerror:
            _LOGGER.debug(notreadyerror)
            raise ConfigEntryNotReady from notreadyerror
        except VisualCrossingBadRequest as err:
            _LOGGER.debug(err)
            return False
        except VisualCrossingInternalServerError as notreadyerror:
            _LOGGER.debug(notreadyerror)
            raise ConfigEntryNotReady from notreadyerror
        except VisualCrossingTooManyRequests as err:
            _LOGGER.debug(err)
            return False


        if not resp:
            raise CannotConnect()
        self.current_weather_data = resp
        self.daily_forecast = resp.forecast_daily
        self.hourly_forecast = resp.forecast_hourly
        return self
