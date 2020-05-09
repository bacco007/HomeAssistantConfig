"""Support for climacell.co"""

import asyncio
import logging

from homeassistant.util import Throttle
from homeassistant.core import callback

import datetime
from datetime import timedelta

import json
import requests
import socket

DOMAIN = "climacell"

_LOGGER = logging.getLogger(__name__)

_HOSTNAME = 'api.climacell.co'
_ENDPOINT = 'https://' + _HOSTNAME + '/v3'

@asyncio.coroutine
def async_setup(hass, config):
    _LOGGER.info("__init__ async_setup start for domain %s.", DOMAIN)

    @callback
    def climacell_service(call):
        """climacell service."""
        _LOGGER.info("__init__ async_setup start service for domain %s. Receive data %s", DOMAIN, call.data)

    # Register our service with Home Assistant.
    hass.services.async_register(DOMAIN, 'climacell_weather', climacell_service)

    _LOGGER.info("__init__ async_setup done for domain %s.", DOMAIN)
    return True


class ClimacellData:
    """Get the latest data from Climacell."""

    def __init__(self, api_key, latitude, longitude, units,
                 realtime_fields, forecast_fields, forecast_mode, forecast_observations, interval):

        """Initialize the data object."""
        self._api_key = api_key
        self.latitude = latitude
        self.longitude = longitude
        self.units = units
        self.realtime_fields = realtime_fields
        self.forecast_fields = forecast_fields
        self.forecast_mode = forecast_mode
        self.forecast_observations = forecast_observations

        self.realtime_data = None
        self.forecast_data = None
        self.unit_system = None
        self.data_currently = None
        self.data_minutely = None
        self.data_hourly = None
        self.data_daily = None
        self.data_alerts = None

        self._headers = {
            'Content-Type': 'application/json',
            # 'Content-Type': 'application/json; charset=utf-8',
            'apikey': api_key,
            # 'X-Real-Ip': ip
        }

        self._params = 'lat=' + str(latitude) + '&lon=' + str(longitude) + '&unit_system=' + units

        # Apply throttling to methods using configured interval
        self.update = Throttle(interval)(self._update)
        # self.update_currently = Throttle(interval)(self._update_currently)
        # self.update_minutely = Throttle(interval)(self._update_minutely)
        # self.update_hourly = Throttle(interval)(self._update_hourly)
        # self.update_daily = Throttle(interval)(self._update_daily)
        # self.update_alerts = Throttle(interval)(self._update_alerts)

    def _update(self):
        """Get the latest data from Climacell."""


        if self.realtime_fields is not None:
            # _LOGGER.debug("ClimacellData _retrieve_data _params: %s - realtime_fields: %s", self._params, self.realtime_fields)
            querystring = self._params + '&fields=' + self.realtime_fields  # + '&start_time=now'
            url = _ENDPOINT + '/weather/realtime'
            self.realtime_data = self._retrieve_data(url, self._headers, querystring)

        if self.forecast_fields is not None:
            end_date = datetime.datetime.utcnow()\
                       + (timedelta(days=self.forecast_observations)
                          if self.forecast_mode == 'daily' else timedelta(hours=self.forecast_observations))
            querystring = self._params + '&fields=' + self.forecast_fields\
                          + '&start_time=now&end_time='\
                          + end_date.replace(microsecond=0).isoformat()
            url = _ENDPOINT + '/weather/forecast/' + self.forecast_mode

            # _LOGGER.debug("ClimacellData _retrieve_data _params: %s - realtime_fields: %s", self._params, self.realtime_fields)
            self.forecast_data = self._retrieve_data(url, self._headers, querystring)

    def _retrieve_data(self, url, headers, querystring):
        result = None

        try:
            _LOGGER.debug("ClimacellData _retrieve_data url: %s - headers: %s", url, self._headers)
            _LOGGER.debug("ClimacellData _retrieve_data querystring: %s", querystring)

            response = requests.request("GET", url,
                                        headers=headers, params=querystring,
                                        timeout=(10.05, 27), verify=True
                                        )
            _LOGGER.debug("ClimacellData _retrieve_data response data: %s", response.text)

            if response.status_code == 200:
                result = json.loads(response.text)

        except socket.error as err:
            _LOGGER.error("Unable to connect to Climatecell '%s' while try to retrieve data from %s.", err, url)

        return result
