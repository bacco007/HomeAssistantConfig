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

class RadarrApi():
    def __init__(
        self,
        hass: HomeAssistant,
        api: str,
        days: int,
        host: str,
        port: int,
        ssl: bool,
        urlbase: str,
        theaters: bool,
        max: int
    ):
        self._api = api
        self._max = max
        self._days = days
        self._hass = hass
        self._host = host
        self._port = port
        self._urlbase = urlbase
        self._ssl = ssl
        self._theaters = theaters

    def update(self):
        tz = timezone(str(self._hass.config.time_zone))
        radarr = requests.Session()
        start = get_date(tz)
        end = get_date(tz, self._days)
        address = 'http{0}://{1}:{2}/{3}api/v3/calendar?start={4}&end={5}'.format(
            's' if self._ssl else '', 
            self._host,
            self._port,
            '{}/'.format(self._urlbase.strip('/') if self._urlbase else self._urlbase),
            start, 
            end
        )
        try:
            api = radarr.get(address, headers={'X-Api-Key': self._api}, timeout=10)
        except OSError:
            raise RadarrCannotBeReached

        if api.status_code == 200:
            if self._days == 1:
                in_cinemas = list(filter(
                    lambda x: x['inCidemas'][:-10] == str(start), api.json()
                    ))
                digital_release = list(filter(
                    lambda x: x['digitalRelease'][:-10] == str(start), api.json()
                    ))
                physical_release = list(filter(
                    lambda x: x['physicalRelease'][:-10] == str(start), api.json()
                    ))
                return {
                    'online': True,
                    'data': parse_data((in_cinemas + digital_release + physical_release)[:self._max], tz, self._host, self._port, self._ssl, self._theaters)
                }

            return {
                'online': True,
                'data': parse_data(api.json()[:self._max], tz, self._host, self._port, self._ssl, self._theaters)
            }

        raise RadarrCannotBeReached


class FailedToLogin(Exception):
    "Raised when the Radarr user fail to Log-in"
    pass

class RadarrCannotBeReached(Exception):
    "Raisen when the Radarr cannot be reached"
    pass
