"""Data Update coordinator for the GTFS integration."""
from __future__ import annotations

import datetime
from datetime import timedelta
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
import homeassistant.util.dt as dt_util

from .adsb_helper import (
    get_flight,
    get_point_of_interest,
)

from .const import (
    ATTR_DEFAULT_REFRESH_INTERVAL, 
    ATTR_LATITUDE,
    ATTR_LONGITUDE,
    CONF_EXTRACT_TYPE,
    CONF_ENTITY_PICTURE,
    ATTR_DEFAULT_ENTITY_PICTURE,
    CONF_ENTITY_PICTURE_ASC,
    ATTR_DEFAULT_ENTITY_PICTURE_ASC,
    CONF_ENTITY_PICTURE_DESC,
    ATTR_DEFAULT_ENTITY_PICTURE_DESC,    
    CONF_ENTITY_PICTURE_HELI,
    ATTR_DEFAULT_ENTITY_PICTURE_HELI, 
)    

_LOGGER = logging.getLogger(__name__)


class ADSBUpdateCoordinator(DataUpdateCoordinator):
    """Data update coordinator for the GTFS integration."""

    config_entry: ConfigEntry

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass=hass,
            logger=_LOGGER,
            name=entry.entry_id,
            update_interval=timedelta(minutes=entry.options.get("refresh_interval", ATTR_DEFAULT_REFRESH_INTERVAL)),
        )
        self.config_entry = entry
        self.hass = hass
        
        self._data: dict[str, str] = {}

    async def _async_update_data(self) -> dict[str, str]:
        """Get the latest data from GTFS and GTFS relatime, depending refresh interval"""
        data = self.config_entry.data
        _LOGGER.debug("Self data: %s", data) 
        options = self.config_entry.options
        
        if data["input_entity"]:
            extract_param = self.hass.states.get(data["input_entity"]).state
        else:
            extract_param = data["extract_param"]
            
        self._url = str(data["url"]) + "/" + str(data["extract_type"]) + "/" + str(extract_param)
            
        self._flight = await self.hass.async_add_executor_job(
                    get_flight, self
                )     
                
        if self._flight.get("ac", None):
            self._data = {
                "registration": self._flight["ac"][0].get("r",None),
                "callsign": self._flight["ac"][0].get("flight",None),
                "type": self._flight["ac"][0].get("t",None),
                "icao24": self._flight["ac"][0].get("hex",None),
                "altitude_baro": self._flight["ac"][0].get("alt_baro", None),
                "altitude_geom": self._flight["ac"][0].get("alt_geom", None),
                "ground_speed": self._flight["ac"][0].get("gs",None),
                "mach": self._flight["ac"][0].get("mach",None),
                "altitude_baro_rate": self._flight["ac"][0].get("baro_rate", None),
                "altitude_geom_rate": self._flight["ac"][0].get("geom_rate", None),                 
                "latitude": self._flight["ac"][0].get("lat",None),
                "longitude": self._flight["ac"][0].get("lon",None),
                "category": self._flight["ac"][0].get("category",None),
                CONF_EXTRACT_TYPE: data[CONF_EXTRACT_TYPE],
                CONF_ENTITY_PICTURE: options.get(CONF_ENTITY_PICTURE, ATTR_DEFAULT_ENTITY_PICTURE)
            }  
        else:
            _LOGGER.warning("No flights found for: %s", extract_param)
            self._data = { 
                "registration": "Not found",
                "callsign": "Not found",
                "type": "Not found",
                "icao24": "Not found",
                CONF_EXTRACT_TYPE: data[CONF_EXTRACT_TYPE],
                CONF_ENTITY_PICTURE: options.get(CONF_ENTITY_PICTURE, ATTR_DEFAULT_ENTITY_PICTURE)
            } 

        _LOGGER.debug("Coordinator data: %s", self._data)        

        return self._data
        
class ADSBPointUpdateCoordinator(DataUpdateCoordinator):
    """Data update coordinator for the GTFS integration."""

    config_entry: ConfigEntry

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass=hass,
            logger=_LOGGER,
            name=entry.entry_id,
            update_interval=timedelta(minutes=entry.options.get("refresh_interval", ATTR_DEFAULT_REFRESH_INTERVAL)),
        )
        self.config_entry = entry
        self.hass = hass
        
        self._data: dict[str, str] = {}

    async def _async_update_data(self) -> dict[str, str]:
        """Get the latest data from GTFS and GTFS relatime, depending refresh interval"""
        data = self.config_entry.data
        _LOGGER.debug("Self data: %s", data) 
        options = self.config_entry.options
        self._altitude_limit = data["altitude_limit"]
        
        device_tracker = self.hass.states.get(data["device_tracker_id"])
        latitude = device_tracker.attributes.get("latitude", None)
        longitude = device_tracker.attributes.get("longitude", None)
        _LOGGER.debug("Point search on lat: %s, lon: %s", latitude, longitude)
        self._url = str(data["url"]) + "/" + str(data["extract_type"]) + "/" + str(latitude) + "/" + str(longitude) + "/" + str(int(data["radius"] * 1000 / 1852) )
        _LOGGER.debug("Point search on URL: %s", self._url)
        self._CONF_EXTRACT_TYPE = data[CONF_EXTRACT_TYPE]
        self._CONF_ENTITY_PICTURE = options.get(CONF_ENTITY_PICTURE, ATTR_DEFAULT_ENTITY_PICTURE)
        self._CONF_ENTITY_PICTURE_ASC = options.get(CONF_ENTITY_PICTURE_ASC, ATTR_DEFAULT_ENTITY_PICTURE_ASC)
        self._CONF_ENTITY_PICTURE_DESC = options.get(CONF_ENTITY_PICTURE_DESC, ATTR_DEFAULT_ENTITY_PICTURE_DESC)
        self._CONF_ENTITY_PICTURE_HELI = options.get(CONF_ENTITY_PICTURE_HELI, ATTR_DEFAULT_ENTITY_PICTURE_HELI)           
        
        self._data = await self.hass.async_add_executor_job(
                    get_point_of_interest, self
                )   
               

        _LOGGER.debug("Coordinator data: %s", self._data)          
            
        return self._data

        

