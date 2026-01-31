"""DataUpdateCoordinator for Solstice Season integration."""

from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .calculations import SeasonData, calculate_season_data
from .const import CONF_HEMISPHERE, CONF_MODE, DOMAIN

_LOGGER = logging.getLogger(__name__)

# Update once per day
UPDATE_INTERVAL = timedelta(days=1)


class SolsticeSeasonCoordinator(DataUpdateCoordinator[SeasonData]):
    """Coordinator for solstice season data.

    This coordinator manages data updates for all sensors. It calculates
    all season-related data once per day and provides it to all entities.
    """

    config_entry: ConfigEntry

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize the coordinator.

        Args:
            hass: Home Assistant instance.
            config_entry: The config entry for this integration instance.
        """
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=UPDATE_INTERVAL,
        )
        self.config_entry = config_entry
        self.hemisphere: str = config_entry.data[CONF_HEMISPHERE]
        self.mode: str = config_entry.data[CONF_MODE]

    async def _async_update_data(self) -> SeasonData:
        """Fetch data from calculations.

        This method is called by the coordinator at the configured interval.
        It runs the calculation in an executor to avoid blocking the event loop.

        Returns:
            Dictionary containing all calculated season data.
        """
        now = dt_util.utcnow()
        _LOGGER.debug(
            "Updating solstice season data for %s (hemisphere=%s, mode=%s)",
            self.config_entry.title,
            self.hemisphere,
            self.mode,
        )

        # Run calculation in executor as it may be CPU-intensive
        return await self.hass.async_add_executor_job(
            calculate_season_data,
            self.hemisphere,
            self.mode,
            now,
        )
