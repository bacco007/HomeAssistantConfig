"""Aviation weather integration using DataUpdateCoordinator."""

import logging

import avwx

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import COORDINATOR_UPDATE_INTERVAL

_LOGGER = logging.getLogger(__name__)


class AviationWeatherCoordinator(DataUpdateCoordinator):
    """My custom coordinator."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize my coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=config_entry.title,
            config_entry=config_entry,
            update_interval=COORDINATOR_UPDATE_INTERVAL,
            always_update=True,
        )
        self._hass = hass
        self._icao = config_entry.data.get("icao_id")
        self._metar = avwx.Metar(self._icao)
        self.units = None

    async def _async_setup(self):
        """Set up the coordinator.

        This is the place to set up your coordinator,
        or to load data, that only needs to be loaded once.

        This method will be called automatically during
        coordinator.async_config_entry_first_refresh.
        """
        _LOGGER.debug("Setting up aviation weather coordinator for %s", self._icao)

        await self._metar.async_update()
        self.units = self._metar.units

    async def _async_update_data(self):
        """Fetch data from API endpoint.

        This is the place to pre-process the data to lookup tables
        so entities can quickly look up their data.
        """
        _LOGGER.debug("Updating aviation weather data for %s", self._icao)

        await self._metar.async_update()
        self.units = self._metar.units
        return self._metar.data
