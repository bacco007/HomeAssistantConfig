import json
import requests
import logging
from homeassistant.util import Throttle
from homeassistant.const import (
    CONF_ID,
    CONF_LOCATION
)
from .const import SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)

class WaqiDataRequester(object):

    def __init__(self, lat, lng, token, idx, method):
        self._lat = lat
        self._lng = lng
        self._token = token
        self._idx = idx
        self._method = method
        self._data = None
        self._stationName = None
        self._stationIdx = None
        self._updateLastTime = None

    @Throttle(SCAN_INTERVAL)
    def update(self):
        _LOGGER.debug("Updating WAQI sensors")
        try:
            if self._method == CONF_LOCATION:
                _dat = requests.get(f"https://api.waqi.info/feed/geo:{self._lat};{self._lng}/?token={self._token}").text
            elif self._method == CONF_ID:
                _dat = requests.get(f"https://api.waqi.info/feed/@{self._idx}/?token={self._token}").text
            else:
                _LOGGER.debug("No choosen method")
                
            if _dat:
                self._data = json.loads(_dat)
                if self._data:
                    if "data" in self._data:
                        if "idx" in self._data["data"]:
                            if self._method == CONF_LOCATION:
                                self._stationIdx = self._data["data"]["idx"]
                            elif self._method == CONF_ID:
                                self._stationIdx = self._idx

                        if "city" in self._data["data"]:
                            if "name" in self._data["data"]["city"]:
                                self._stationName = self._data["data"]["city"]["name"]

                            if self._stationName:
                                self._stationName = self._stationName.replace(", ", "_").replace(" ", "_").replace("(", "").replace(")","").lower()
                            else:
                                self._stationName = "UnknownName_" + self._stationIdx
                        
                            if "time" in self._data["data"]:
                                if "iso" in self._data["data"]["time"]:
                                    self._updateLastTime = self._data["data"]["time"]["iso"]

        except requests.exceptions.RequestException as exc:
            _LOGGER.error("Error occurred while fetching data: %r", exc)
            self._data = None
            self._stationName = None
            self._stationIdx = None
            return False
    
    def GetData(self):
        return self._data

    def GetStationName(self):
        return self._stationName
        
    def GetStationIdx(self):
        return self._stationIdx
        
    def GetUpdateLastTime(self):
        return self._updateLastTime
