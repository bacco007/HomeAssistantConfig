"""GTFS Realtime Coordinator."""

import asyncio
from collections.abc import Iterable
from datetime import datetime, timedelta
import logging
import os

from gtfs_station_stop.calendar import Calendar
from gtfs_station_stop.feed_subject import FeedSubject
from gtfs_station_stop.route_info import RouteInfoDatabase
from gtfs_station_stop.static_database import async_factory
from gtfs_station_stop.station_stop_info import StationStopInfoDatabase
from gtfs_station_stop.trip_info import TripInfoDatabase
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


class GtfsRealtimeCoordinator(DataUpdateCoordinator):
    """GTFS Realtime Update Coordinator."""

    def __init__(
        self,
        hass: HomeAssistant,
        feed_subject: FeedSubject,
        gtfs_static_zip: Iterable[os.PathLike] | os.PathLike | None = None,
        **kwargs,
    ) -> None:
        """Initialize the GTFS Update Coordinator to notify all entities upon poll."""
        self.static_timedelta: timedelta = kwargs.get(
            "static_timedelta", timedelta(hours=24)
        )
        self.realtime_timedelta: timedelta = kwargs.get(
            "realtime_timedelta", timedelta(seconds=60)
        )
        super().__init__(
            hass,
            _LOGGER,
            name="GTFS Realtime",
            update_interval=self.realtime_timedelta,
        )
        self.hub = feed_subject
        self.gtfs_static_zip = gtfs_static_zip
        self.calendar: Calendar | None = None
        self.station_stop_info_db: StationStopInfoDatabase | None = None
        self.trip_info_db: TripInfoDatabase | None = None
        self.route_info_db: RouteInfoDatabase | None = None
        self.kwargs = kwargs
        self.services_len: int = 0
        self.stop_infos_len: int = 0
        self.trip_infos_len: int = 0
        self.route_infos_len: int = 0
        self.last_static_update: datetime | None = None
        _LOGGER.info("Setup GTFS Realtime Update Coordinator")
        _LOGGER.info(f"Realtime GTFS update interval {self.realtime_timedelta}")
        _LOGGER.info(f"Static GTFS update interval {self.static_timedelta}")

    async def _async_update_data(self):
        """Fetch data from API endpoint."""
        await self.hub.async_update()
        # Update the static resource if it is past that timedelta
        if (
            self.last_static_update is None
            or datetime.now() - self.last_static_update > self.static_timedelta
        ):
            await self.async_update_static_data()

    async def async_update_static_data(self):
        async with asyncio.TaskGroup() as tg:
            cal_db_task = tg.create_task(
                async_factory(Calendar, *self.gtfs_static_zip, **self.kwargs)
            )
            ssi_db_task = tg.create_task(
                async_factory(
                    StationStopInfoDatabase, *self.gtfs_static_zip, **self.kwargs
                )
            )
            ti_db_task = tg.create_task(
                async_factory(TripInfoDatabase, *self.gtfs_static_zip, **self.kwargs)
            )
            rti_db_task = tg.create_task(
                async_factory(RouteInfoDatabase, *self.gtfs_static_zip, **self.kwargs)
            )
        if any(
            db is None
            for db in (
                self.calendar,
                self.station_stop_info_db,
                self.trip_info_db,
                self.route_info_db,
            )
        ):
            (
                self.calendar,
                self.station_stop_info_db,
                self.trip_info_db,
                self.route_info_db,
            ) = (
                cal_db_task.result(),
                ssi_db_task.result(),
                ti_db_task.result(),
                rti_db_task.result(),
            )
            self.services_len = len(self.calendar.services)
            self.stop_infos_len = len(self.station_stop_info_db.station_stop_infos)
            self.trip_infos_len = len(self.trip_info_db.trip_infos)
            self.route_infos_len = len(self.route_info_db.route_infos)
            _LOGGER.info(
                f"GTFS Static Coordinator Initial Update Complete {self.gtfs_static_zip}"
            )
            _LOGGER.info(f"GTFS Static Coordinator Services: {self.services_len}")
            _LOGGER.info(
                f"GTFS Static Coordinator Station Stop Infos: {self.stop_infos_len}"
            )
            _LOGGER.info(f"GTFS Static Coordinator Trip Infos: {self.trip_infos_len}")
            _LOGGER.info(f"GTFS Static Coordinator Route Infos: {self.route_infos_len}")
        else:
            old_services_len = self.services_len
            self.calendar.services = (
                self.calendar.services | cal_db_task.result().services
            )
            self.services_len = len(self.calendar.services)

            old_stop_infos_len = self.stop_infos_len
            self.station_stop_info_db.station_stop_infos = (
                self.station_stop_info_db.station_stop_infos
                | (ssi_db_task.result().station_stop_infos)
            )
            self.stop_infos_len = len(self.station_stop_info_db.station_stop_infos)

            old_trip_infos_len = self.trip_infos_len
            self.trip_info_db.trip_infos = (
                self.trip_info_db.trip_infos | ti_db_task.result().trip_infos
            )
            self.trip_infos_len = len(self.trip_info_db.trip_infos)

            old_route_infos_len = self.route_infos_len
            self.route_info_db.route_infos = (
                self.route_info_db.route_infos | rti_db_task.result().route_infos
            )
            self.route_infos_len = len(self.route_info_db.route_infos)

            _LOGGER.info(
                f"GTFS Static Coordinator Merge New Data Update Complete {self.gtfs_static_zip}"
            )
            _LOGGER.info(
                f"GTFS Static Coordinator Services: {old_services_len} -> {self.services_len}"
            )
            _LOGGER.info(
                f"GTFS Static Coordinator Station Stop Infos: {old_stop_infos_len} -> {self.stop_infos_len}"
            )
            _LOGGER.info(
                f"GTFS Static Coordinator Trip Infos: {old_trip_infos_len} -> {self.trip_infos_len}"
            )
            _LOGGER.info(
                f"GTFS Static Coordinator Route Infos: {old_route_infos_len} -> {self.route_infos_len}"
            )
        self.last_static_update = datetime.now()


class GtfsStaticCoordinator(DataUpdateCoordinator):
    """GTFS Static Update Coordinator. Polls Static Data Endpoints for new data on a slower basis."""

    def __init__(
        self,
        hass: HomeAssistant,
    ) -> None:
        """Initialize the GTFS Update Coordinator to notify all entities upon poll."""
        super().__init__(
            hass, _LOGGER, name="GTFS Static", update_interval=timedelta(days=1)
        )
        # Save the resource path to reload periodically
        _LOGGER.info("Setup GTFS Static Update Coordinator")

    async def _async_update_data(self):
        """Fetch data from API endpoint."""
