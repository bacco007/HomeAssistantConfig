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
            # Name of the data. For logging purposes.
            name=config_entry.title,
            config_entry=config_entry,
            update_interval=COORDINATOR_UPDATE_INTERVAL,
            # Set always_update to `False` if the data returned from the
            # api can be compared via `__eq__` to avoid duplicate updates
            # being dispatched to listeners
            always_update=True,
        )
        self._icao = config_entry.data.get("icao_id")
        self._metar = avwx.Metar(self._icao)

    async def _async_setup(self):
        """Set up the coordinator.

        This is the place to set up your coordinator,
        or to load data, that only needs to be loaded once.

        This method will be called automatically during
        coordinator.async_config_entry_first_refresh.
        """

    async def _async_update_data(self):
        """Fetch data from API endpoint.

        This is the place to pre-process the data to lookup tables
        so entities can quickly look up their data.
        """
        await self._metar.async_update()
        return self._metar.data
