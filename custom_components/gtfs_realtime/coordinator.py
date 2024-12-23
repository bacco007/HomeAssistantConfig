"""GTFS Realtime Coordinator."""

import asyncio
from collections.abc import Iterable
from datetime import datetime, timedelta
import logging
import os

from gtfs_station_stop.calendar import Calendar
from gtfs_station_stop.feed_subject import FeedSubject
from gtfs_station_stop.route_info import RouteInfoDatabase
from gtfs_station_stop.route_status import RouteStatus
from gtfs_station_stop.static_database import async_factory
from gtfs_station_stop.station_stop import StationStop
from gtfs_station_stop.station_stop_info import StationStopInfoDatabase
from gtfs_station_stop.trip_info import TripInfoDatabase
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import CONF_ROUTE_ICONS, CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT

_LOGGER = logging.getLogger(__name__)


class GtfsRealtimeCoordinator(DataUpdateCoordinator):
    """GTFS Realtime Update Coordinator."""

    def __init__(
        self,
        hass: HomeAssistant,
        feed_subject: FeedSubject,
        gtfs_static_zip: Iterable[os.PathLike] | os.PathLike = list[os.PathLike],
        **kwargs,
    ) -> None:
        """Initialize the GTFS Update Coordinator to notify all entities upon poll."""
        self.realtime_timedelta: timedelta = kwargs.get(
            "realtime_timedelta", timedelta(seconds=60)
        )
        super().__init__(
            hass,
            _LOGGER,
            name="GTFS Realtime",
            update_interval=self.realtime_timedelta,
        )
        self.static_timedelta: dict[os.PathLike, timedelta] = kwargs.get(
            "static_timedelta", {}
        )
        self.kwargs = kwargs
        self.hub: FeedSubject = feed_subject
        self.station_stops: dict[str, StationStop] = {}
        self.routes_statuses: dict[str, RouteStatus] = {}
        self.gtfs_static_zip: Iterable[os.PathLike] | os.PathLike = gtfs_static_zip
        self.calendar: Calendar = Calendar()
        self.station_stop_info_db: StationStopInfoDatabase = StationStopInfoDatabase()
        self.trip_info_db: TripInfoDatabase = TripInfoDatabase()
        self.route_info_db: RouteInfoDatabase = RouteInfoDatabase()
        self.services_len: int = 0
        self.stop_infos_len: int = 0
        self.trip_infos_len: int = 0
        self.route_infos_len: int = 0
        self.route_icons: str | None = kwargs.get(CONF_ROUTE_ICONS)
        self.static_update_targets: set[os.PathLike] = set(gtfs_static_zip)
        self.last_static_update: dict[os.PathLike, datetime] = {}
        _LOGGER.debug("Setup GTFS Realtime Update Coordinator")
        _LOGGER.debug(f"Realtime GTFS update interval {self.realtime_timedelta}")
        for uri, delta in self.static_timedelta.items():
            _LOGGER.info(f"Static GTFS update interval for {uri} is {delta}")

    async def _async_update_data(self):
        """Fetch data from API endpoint."""
        self.static_update_targets |= {
            uri
            for uri, last_update in self.last_static_update.items()
            if datetime.now() - last_update
            > self.static_timedelta.get(
                uri, CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT
            )
        }
        await self.async_update_static_data()
        await self.hub.async_update()

    async def _async_update_static_data(self):
        async with asyncio.TaskGroup() as tg:
            cal_db_task = tg.create_task(
                async_factory(Calendar, *self.static_update_targets, **self.kwargs)
            )
            ssi_db_task = tg.create_task(
                async_factory(
                    StationStopInfoDatabase, *self.static_update_targets, **self.kwargs
                )
            )
            ti_db_task = tg.create_task(
                async_factory(
                    TripInfoDatabase, *self.static_update_targets, **self.kwargs
                )
            )
            rti_db_task = tg.create_task(
                async_factory(
                    RouteInfoDatabase, *self.static_update_targets, **self.kwargs
                )
            )
        return (
            cal_db_task.result(),
            ssi_db_task.result(),
            ti_db_task.result(),
            rti_db_task.result(),
        )

    async def async_update_static_data(self, clear_old_data=False):
        """Update or clear static feeds and merge with existing databases."""
        # Check for clear old data to reset the databases
        if clear_old_data:
            self.calendar = Calendar()
            self.station_stop_info_db = StationStopInfoDatabase()
            self.trip_info_db = TripInfoDatabase()
            self.route_info_db = RouteInfoDatabase()
            _LOGGER.debug("GTFS Static data cleared")
        elif not self.static_update_targets:
            return

        cal_db, ssi_db, ti_db, rti_db = await self._async_update_static_data()

        old_services_len = self.services_len
        self.calendar.services |= cal_db.services
        self.services_len = len(self.calendar.services)

        old_stop_infos_len = self.stop_infos_len
        self.station_stop_info_db.station_stop_infos |= ssi_db.station_stop_infos
        self.stop_infos_len = len(self.station_stop_info_db.station_stop_infos)

        old_trip_infos_len = self.trip_infos_len
        self.trip_info_db.trip_infos |= ti_db.trip_infos
        self.trip_infos_len = len(self.trip_info_db.trip_infos)

        old_route_infos_len = self.route_infos_len
        self.route_info_db.route_infos |= rti_db.route_infos
        self.route_infos_len = len(self.route_info_db.route_infos)

        _LOGGER.debug(
            f"GTFS Coordinator Merge New Static Data Update Complete {self.gtfs_static_zip}"
        )
        _LOGGER.debug(
            f"GTFS Coordinator Services: {old_services_len} -> {self.services_len}"
        )
        _LOGGER.debug(
            f"GTFS Coordinator Station Stop Infos: {old_stop_infos_len} -> {self.stop_infos_len}"
        )
        _LOGGER.debug(
            f"GTFS Coordinator Trip Infos: {old_trip_infos_len} -> {self.trip_infos_len}"
        )
        _LOGGER.debug(
            f"GTFS Coordinator Route Infos: {old_route_infos_len} -> {self.route_infos_len}"
        )

        for target in self.static_update_targets:
            self.last_static_update.setdefault(target, datetime.now())
        self.static_update_targets.clear()

        if os.environ.get("GTFS_REALTIME_SHOW_MEMORY_USE", "off") == "on":
            try:
                from pympler import asizeof

                _LOGGER.debug(
                    f"Calendar using {asizeof.asizeof(self.calendar) / 2**20:.2f} MB"
                )
                _LOGGER.debug(
                    f"Stations using {asizeof.asizeof(self.station_stop_info_db) / 2**20:.2f} MB"
                )
                _LOGGER.debug(
                    f"Trips using    {asizeof.asizeof(self.trip_info_db) / 2**20:.2f} MB"
                )
                _LOGGER.debug(
                    f"Routes using   {asizeof.asizeof(self.route_info_db) / 2**20:.2f} MB"
                )
            except ImportError:
                """Failed to import pympler for memory usage stats. When using environment variable GTFS_REALTIME_SHOW_MEMORY_USE=on, pympler must be added to the python environment running homeassitant."""
