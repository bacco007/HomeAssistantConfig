"""The ADSB integration helper."""

import requests
import logging
import os

from .const import (
    CONF_EXTRACT_TYPE, 
    CONF_ENTITY_PICTURE, 
    CONF_ENTITY_PICTURE_ASC, 
    CONF_ENTITY_PICTURE_DESC, 
    CONF_ENTITY_PICTURE_HELI,
    ATTR_DEFAULT_URL_ROUTE
)

_LOGGER = logging.getLogger(__name__)

def get_flight(self):
    _LOGGER.debug ("Get flight with data: %s", self)
    response = requests.get(self._url)
    _LOGGER.debug ("Get flight rest output: %s", response)
    return response.json()
    
def get_point_of_interest(self):
    _LOGGER.debug ("Get flight poi with data: %s", self)
    response = requests.get(self._url)
    _LOGGER.debug ("Get flight poi rest output: %s", response)
    _response_h = []
    aircraft = {}
    aircraft_h = {}
    for ac in response.json()["ac"]:
        if self._altitude_limit == 0 or (self._altitude_limit > 0 and ac.get("alt_geom",0) < self._altitude_limit * 1000 / 0.3048 ):
            aircraft["callsign"] = ac.get("flight", None)
            aircraft["registration"] = ac.get("r", "NoReg")
            self._reg = ac.get("r", "NoReg")
            aircraft["icao24"] = ac.get("hex", None)
            aircraft["type"] = ac.get("t", None)
            aircraft["groundspeed_nmph"] = ac.get("gs",None)
            aircraft["true_airspeed_nmph"] = ac.get("tas",None)
            aircraft["mach"] = ac.get("mach", None)
            aircraft["altitude_baro_ft"] = ac.get("alt_baro", None)
            aircraft["altitude_geom_ft"] = ac.get("alt_geom", None)
            aircraft["altitude_baro_rate"] = ac.get("baro_rate", 0)
            aircraft["altitude_geom_rate"] = ac.get("geom_rate", 0)            
            aircraft["latitude"] = ac.get("lat", None)
            aircraft["longitude"] = ac.get("lon", None)
            aircraft["category"] = ac.get("category", None)
            aircraft["route"] = get_route(ac.get("flight", None))
            aircraft[CONF_EXTRACT_TYPE] = self._CONF_EXTRACT_TYPE
            aircraft[CONF_ENTITY_PICTURE] = self._CONF_ENTITY_PICTURE
            aircraft[CONF_ENTITY_PICTURE_ASC] = self._CONF_ENTITY_PICTURE_ASC
            aircraft[CONF_ENTITY_PICTURE_DESC] = self._CONF_ENTITY_PICTURE_DESC            
            aircraft[CONF_ENTITY_PICTURE_HELI] = self._CONF_ENTITY_PICTURE_HELI
            aircraft_h[str(self._reg)] = aircraft.copy()
    _response_h = aircraft_h

    _LOGGER.debug ("Get flight poi: %s", response.json())
    return _response_h   
    
    
async def get_entity_pictures(hass, path) -> dict[str]:
    _LOGGER.debug(f"Getting icons for path: {path}")
    icon_dir = hass.config.path(path)
    files = await hass.async_add_executor_job(
            os.listdir, icon_dir)
    entity_pictures = []
    for file in files:
        entity_pictures.append(file)      
    _LOGGER.debug(f"Icons in folder: {entity_pictures}")
    return entity_pictures    
    
def get_route(callsign):
    _url = ATTR_DEFAULT_URL_ROUTE
    _headers = {"accept": "application/json","Content-Type": "application/json"}
    if callsign: 
        _data = '{"planes": [{"callsign": "' + callsign.strip() + '","lat": 0,"lng": 0}]}'
        response = requests.post(_url, headers = _headers, data = _data)
        if response.status_code == 200:
            _LOGGER.debug("Route details: %s", response.json())
            return response.json()
        return {}
    else:
        return {}
    
    