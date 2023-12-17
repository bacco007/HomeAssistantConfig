"""Data Update coordinator for the GTFS integration."""
from __future__ import annotations

import datetime
from datetime import timedelta
import logging


from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
import homeassistant.util.dt as dt_util

from .const import (
    DEFAULT_PATH, 
    DEFAULT_REFRESH_INTERVAL, 
    CONF_API_KEY, 
    CONF_X_API_KEY,
    ATTR_DUE_IN,
    ATTR_LATITUDE,
    ATTR_LONGITUDE,
    ATTR_RT_UPDATED_AT
)    
from .gtfs_helper import get_gtfs, get_next_departure, check_datasource_index, create_trip_geojson, check_extracting
from .gtfs_rt_helper import get_rt_route_statuses, get_rt_trip_statuses, get_next_services, get_rt_alerts

_LOGGER = logging.getLogger(__name__)


class GTFSUpdateCoordinator(DataUpdateCoordinator):
    """Data update coordinator for the GTFS integration."""

    config_entry: ConfigEntry

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass=hass,
            logger=_LOGGER,
            name=entry.entry_id,
            update_interval=timedelta(minutes=1),
        )
        self.config_entry = entry
        self.hass = hass
        
        self._pygtfs = ""
        self._data: dict[str, str] = {}

    async def _async_update_data(self) -> dict[str, str]:
        """Get the latest data from GTFS and GTFS relatime, depending refresh interval"""
        data = self.config_entry.data
        options = self.config_entry.options
        previous_data = None if self.data is None else self.data.copy()
        _LOGGER.debug("Previous data: %s", previous_data)  

        self._pygtfs = get_gtfs(
            self.hass, DEFAULT_PATH, data, False
        )        
        self._data = {
            "schedule": self._pygtfs,
            "origin": data["origin"],
            "destination": data["destination"],
            "offset": options["offset"] if "offset" in options else 0,
            "include_tomorrow": data["include_tomorrow"],
            "gtfs_dir": DEFAULT_PATH,
            "name": data["name"],
            "file": data["file"],
            "route_type": data["route_type"],
            "extracting": False,
            "next_departure": {},
            "next_departure_realtime_attr": {},
            "alert": {}
        }           

        if check_extracting(self):    
            _LOGGER.warning("Cannot update this sensor as still unpacking: %s", self._data["file"])
            previous_data["extracting"] = True
            return previous_data
        

        # determin static + rt or only static (refresh schedule depending)
        #1. sensor exists with data but refresh interval not yet reached, use existing data
        if previous_data is not None and (datetime.datetime.strptime(previous_data["gtfs_updated_at"],'%Y-%m-%dT%H:%M:%S.%f%z') + timedelta(minutes=options.get("refresh_interval", DEFAULT_REFRESH_INTERVAL))) >  dt_util.utcnow() + timedelta(seconds=1) :        
            run_static = False
            _LOGGER.debug("No run static refresh: sensor exists but not yet refresh for name: %s", data["name"])
        #2. sensor exists and refresh interval reached, get static data
        else:
            run_static = True
            _LOGGER.debug("Run static refresh: sensor without gtfs data OR refresh for name: %s", data["name"])
        
        if not run_static:
            # do nothing awaiting refresh interval and use existing data
            self._data = previous_data
        else:
            check_index = await self.hass.async_add_executor_job(
                    check_datasource_index, self
                )

            try:
                self._data["next_departure"] = await self.hass.async_add_executor_job(
                    get_next_departure, self
                )
                self._data["gtfs_updated_at"] = dt_util.utcnow().isoformat()
            except Exception as ex:  # pylint: disable=broad-except
                _LOGGER.error("Error getting gtfs data from generic helper: %s", ex)
                return None
            _LOGGER.debug("GTFS coordinator data from helper: %s", self._data["next_departure"]) 
        
        # collect and return rt attributes
        # STILL REQUIRES A SOLUTION IF TIMING OUT
        if "real_time" in options:
            if options["real_time"]:
                self._get_next_service = {}
                """Initialize the info object."""
                self._trip_update_url = options["trip_update_url"]
                self._vehicle_position_url = options["vehicle_position_url"]
                self._alerts_url = options.get("alerts_url", None)
                self._route_delimiter = None
                if CONF_API_KEY in options:
                    self._headers = {"Authorization": options[CONF_API_KEY]}
                elif CONF_X_API_KEY in options:
                    self._headers = {"x-api-key": options[CONF_X_API_KEY]}
                else:
                    self._headers = None
                self._headers = None
                self.info = {}
                self._route_id = self._data["next_departure"].get("route_id", None)
                if self._route_id == None:
                    _LOGGER.debug("GTFS RT: no route_id in sensor data, using route_id from config_entry")
                    self._route_id = data["route"].split(": ")[0]
                self._stop_id = data["origin"].split(": ")[0]
                self._destination_id = data["destination"].split(": ")[0]
                self._trip_id = self._data.get('next_departure', {}).get('trip_id', None) 
                self._direction = data["direction"]
                self._relative = False
                try:
                    self._get_rt_route_statuses = await self.hass.async_add_executor_job(get_rt_route_statuses, self)
                    self._get_rt_alerts = await self.hass.async_add_executor_job(get_rt_alerts, self)
                    self._get_next_service = await self.hass.async_add_executor_job(get_next_services, self)
                    self._data["next_departure_realtime_attr"] = self._get_next_service
                    self._data["next_departure_realtime_attr"]["gtfs_rt_updated_at"] = dt_util.utcnow()
                    self._data["alert"] = self._get_rt_alerts
                except Exception as ex:  # pylint: disable=broad-except
                   _LOGGER.error("Error getting gtfs realtime data, for origin: %s with error: %s", data["origin"], ex)
            else:
                _LOGGER.debug("GTFS RT: RealTime = false, selected in entity options")            
        else:
            _LOGGER.debug("GTFS RT: RealTime not selected in entity options")
        
        return self._data

