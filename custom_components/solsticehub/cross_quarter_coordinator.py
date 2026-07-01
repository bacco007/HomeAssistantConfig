"""DataUpdateCoordinator for Cross-Quarter calendar."""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import datetime, timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .calculations import CrossQuarterData, calculate_cross_quarter_data
from .const import CONF_HEMISPHERE, CONF_MODE, DOMAIN, HEMISPHERE_NORTHERN

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


class CrossQuarterCoordinator(DataUpdateCoordinator[CrossQuarterData]):
    """Coordinator for Cross-Quarter calendar data.

    This coordinator manages data updates for all Cross-Quarter sensors.
    Updates occur at local midnight and at the exact moment of period changes.
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
            name=f"{DOMAIN}_cross_quarter",
            update_interval=_calculate_time_until_midnight(),
        )
        self.config_entry = config_entry
        self.mode: str = config_entry.data[CONF_MODE]
        self.hemisphere: str = config_entry.data.get(
            CONF_HEMISPHERE, HEMISPHERE_NORTHERN
        )
        self._unsub_event: Callable[[], None] | None = None

    async def _async_update_data(self) -> CrossQuarterData:
        """Fetch data from calculations.

        This method is called by the coordinator at local midnight and
        at the exact moment of period changes.

        Returns:
            Dictionary containing all calculated Cross-Quarter data.
        """
        # Schedule next update for midnight
        self.update_interval = _calculate_time_until_midnight()

        now = dt_util.utcnow()
        _LOGGER.debug(
            "Updating Cross-Quarter data for %s (mode=%s), next update in %s",
            self.config_entry.title,
            self.mode,
            self.update_interval,
        )

        # Run calculation in executor as it may be CPU-intensive
        data = await self.hass.async_add_executor_job(
            calculate_cross_quarter_data,
            self.hemisphere,
            self.mode,
            now,
        )

        # Schedule event-based update for next period change
        self._schedule_event_update(data["next_period_change"])

        return data

    def _schedule_event_update(self, event_time: datetime) -> None:
        """Schedule an update at the exact event time.

        Args:
            event_time: The datetime when the next period change occurs.
        """
        # Cancel previous event listener if exists
        if self._unsub_event:
            self._unsub_event()
            self._unsub_event = None

        # Only schedule if event is in the future
        if event_time > dt_util.utcnow():
            _LOGGER.debug(
                "Scheduling period change update for %s at %s",
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

        This is called at the exact moment of a period change.
        """
        _LOGGER.info(
            "Period change event triggered for %s, refreshing data",
            self.config_entry.title,
        )
        await self.async_refresh()

    def async_unload(self) -> None:
        """Clean up event listener when coordinator is unloaded."""
        if self._unsub_event:
            self._unsub_event()
            self._unsub_event = None
