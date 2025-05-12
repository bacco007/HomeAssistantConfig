import time
from datetime import datetime
from pytz import timezone
import requests
import json

from homeassistant.core import HomeAssistant

from .parsing import parse_data

def get_date(zone, offset=0):
    """Get date based on timezone and offset of days."""
    return datetime.date(datetime.fromtimestamp(
        time.time() + 86400 * offset, tz=zone))

class SonarrApi():
    def __init__(
        self,
        hass: HomeAssistant,
        api: str, 
        days: int, 
        host: str, 
        port: int, 
        ssl: bool, 
        urlbase: str, 
        max: int
    ):
        self._api = api
        self._max = max
        self._days = days
        self._hass = hass
        self._host = host
        self._port = port
        self._ssl = ssl
        self._url_base = urlbase

    def update(self):
        tz = timezone(str(self._hass.config.time_zone))
        start = get_date(tz)
        end = get_date(tz, self._days)
        address = 'http{0}://{1}:{2}/{3}api/v3/calendar?start={4}&end={5}&includeEpisodeImages=true&includeSeries=true'.format(
                    's' if self._ssl else '', 
                    self._host,
                    self._port,
                    "{}/".format(self._url_base.strip('/')) if self._url_base else self._url_base,
                    start,
                    end
                    )
        try:
            api = requests.get(address, headers={'X-Api-Key': self._api}, timeout=10)
        except OSError:
            raise SonarrCannotBeReached

        if api.status_code == 200:
            if self._days == 1:
                return {
                    'online': True,
                    'data': parse_data(list(
                                        filter(
                                            lambda x: x['airDate'][:-10] == str(start),
                                            api.json()))[:self._max], tz, self._host, self._port, self._ssl, self._url_base)
                }
                            
            return {
                'online': True,
                'data': parse_data(api.json()[:self._max], tz, self._host, self._port, self._ssl, self._url_base)
            }
        
        raise SonarrCannotBeReached

class FailedToLogin(Exception):
    "Raised when the Sonarr user fail to Log-in"
    pass

class SonarrCannotBeReached(Exception):
    "Raised when the Sonarr cannot be reached"
    pass