"""DataUpdateCoordinator for Chinese Solar Terms calendar."""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import datetime, timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .calculations import ChineseSolarTermsData, calculate_chinese_solar_terms_data
from .const import CONF_HEMISPHERE, CONF_SCOPE, DOMAIN, HEMISPHERE_NORTHERN

_LOGGER = logging.getLogger(__name__)


def _calculate_time_until_midnight() -> timedelta:
    """Calculate time until next local midnight.

    Returns:
        Timedelta until next midnight (minimum 1 minute to prevent rapid updates).
    """
    now = dt_util.now()  # Local time
    next_midnight = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
    time_until = next_midnight - now

    # Ensure minimum interval of 1 minute to prevent rapid updates
    if time_until < timedelta(minutes=1):
        time_until = timedelta(days=1)

    return time_until


class ChineseSolarTermsCoordinator(DataUpdateCoordinator[ChineseSolarTermsData]):
    """Coordinator for Chinese Solar Terms calendar data.

    This coordinator manages data updates for all Chinese Solar Terms sensors.
    Updates occur at local midnight and at the exact moment of term changes.
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
            name=f"{DOMAIN}_chinese_solar_terms",
            update_interval=_calculate_time_until_midnight(),
        )
        self.config_entry = config_entry
        self.scope: str = config_entry.data.get(CONF_SCOPE, "all_24")
        self.hemisphere: str = config_entry.data.get(
            CONF_HEMISPHERE, HEMISPHERE_NORTHERN
        )
        self._unsub_event: Callable[[], None] | None = None

    async def _async_update_data(self) -> ChineseSolarTermsData:
        """Fetch data from calculations.

        This method is called by the coordinator at local midnight and
        at the exact moment of term changes.

        Returns:
            Dictionary containing all calculated Chinese Solar Terms data.
        """
        # Schedule next update for midnight
        self.update_interval = _calculate_time_until_midnight()

        now = dt_util.utcnow()
        _LOGGER.debug(
            "Updating Chinese Solar Terms data for %s (scope=%s), next update in %s",
            self.config_entry.title,
            self.scope,
            self.update_interval,
        )

        # Run calculation in executor as it may be CPU-intensive
        data = await self.hass.async_add_executor_job(
            calculate_chinese_solar_terms_data,
            self.hemisphere,
            self.scope,
            now,
        )

        # Schedule event-based update for next term change
        self._schedule_event_update(data["next_term_change"])

        return data

    def _schedule_event_update(self, event_time: datetime) -> None:
        """Schedule an update at the exact event time.

        Args:
            event_time: The datetime when the next term change occurs.
        """
        # Cancel previous event listener if exists
        if self._unsub_event:
            self._unsub_event()
            self._unsub_event = None

        # Only schedule if event is in the future
        if event_time > dt_util.utcnow():
            _LOGGER.debug(
                "Scheduling term change update for %s at %s",
                self.config_entry.title,
                event_time,
            )
            self._unsub_event = async_track_point_in_time(
                self.hass,
                self._handle_event_update,
                event_time,
            )

    async def _handle_event_update(self, _now: datetime) -> None:
        """Handle the event-based update callback.

        This is called at the exact moment of a term change.
        """
        _LOGGER.info(
            "Term change event triggered for %s, refreshing data",
            self.config_entry.title,
        )
        await self.async_refresh()

    def async_unload(self) -> None:
        """Clean up event listener when coordinator is unloaded."""
        if self._unsub_event:
            self._unsub_event()
            self._unsub_event = None
