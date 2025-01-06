"""GTFS Realtime Coordinator."""

from collections import defaultdict
from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import logging
import os

from gtfs_station_stop.feed_subject import FeedSubject
from gtfs_station_stop.route_status import RouteStatus
from gtfs_station_stop.schedule import GtfsSchedule, async_build_schedule
from gtfs_station_stop.station_stop import StationStop
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT, DOMAIN

PARALLEL_UPDATES = 0

_LOGGER = logging.getLogger(__name__)


@dataclass
class GtfsUpdateData:
    """Collection of GTFS Data For Sensors to Lookup."""

    station_stops: dict[str, StationStop] = field(
        default_factory=lambda: defaultdict(dict)
    )
    routes_statuses: dict[str, RouteStatus] = field(
        default_factory=lambda: defaultdict(dict)
    )
    schedule: GtfsSchedule = field(default_factory=GtfsSchedule)


class GtfsRealtimeCoordinator(DataUpdateCoordinator):
    """GTFS Realtime Update Coordinator."""

    def __init__(
        self,
        hass: HomeAssistant,
        feed_subject: FeedSubject,
        gtfs_static_zip: Iterable[os.PathLike] | os.PathLike = list[os.PathLike],
        *,
        gtfs_provider: str | None = None,
        static_timedelta: dict[os.PathLike, timedelta] = {},
        route_icons: str | None = None,
        **kwargs,
    ) -> None:
        """Initialize the GTFS Update Coordinator to notify all entities upon poll."""
        self.realtime_timedelta: timedelta = kwargs.get(
            "realtime_timedelta", timedelta(seconds=60)
        )
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=self.realtime_timedelta,
        )
        self.static_timedelta = static_timedelta
        self.kwargs = kwargs
        self.gtfs_provider = gtfs_provider
        self.hub: FeedSubject = feed_subject
        self.gtfs_update_data = GtfsUpdateData()
        self.gtfs_static_zip: Iterable[os.PathLike] | os.PathLike = gtfs_static_zip
        self.route_icons = route_icons
        self.static_update_targets: set[os.PathLike] = set(gtfs_static_zip)
        self.last_static_update: dict[os.PathLike, datetime] = {}
        _LOGGER.debug("Setup GTFS Realtime Update Coordinator")
        _LOGGER.debug(f"Realtime GTFS update interval {self.realtime_timedelta}")
        for uri, delta in self.static_timedelta.items():
            _LOGGER.info(f"Static GTFS update interval for {uri} is {delta}")

    async def _async_update_data(self) -> GtfsUpdateData:
        """Fetch data from API endpoint."""
        self.static_update_targets |= {
            uri
            for uri, last_update in self.last_static_update.items()
            if datetime.now() - last_update
            > self.static_timedelta.get(
                uri, timedelta(hours=CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT)
            )
        }
        await self.async_update_static_data()
        await self.hub.async_update()
        return self.gtfs_update_data

    async def async_update_static_data(self, clear_old_data=False):
        """Update or clear static feeds and merge with existing datasets."""
        # Check for clear old data to reset the datasets
        if clear_old_data:
            self.gtfs_update_data.schedule = GtfsSchedule()
            _LOGGER.debug("GTFS Static data cleared")

        if self.gtfs_update_data.schedule == GtfsSchedule():
            self.gtfs_update_data.schedule = await async_build_schedule(
                *self.static_update_targets, **self.kwargs
            )
        else:
            await self.gtfs_update_data.schedule.async_update_schedule(
                *self.static_update_targets, **self.kwargs
            )

        for target in self.static_update_targets:
            _LOGGER.debug(f"GTFS Static Feed {target} updated")
            self.last_static_update[target] = datetime.now()
        self.static_update_targets.clear()
