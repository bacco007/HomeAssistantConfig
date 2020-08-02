"""Support for climacell.co"""

import asyncio
import logging


from homeassistant.core import callback

import datetime
from datetime import timedelta

import json
import requests
import socket

from custom_components.climacell.daily_api_const import CONF_DAILY
from custom_components.climacell.data_provider import DataProviderBase

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


class ClimacellRealtimeDataProvider(DataProviderBase):
    def __init__(self, api_key, latitude, longitude, units,
                 realtime_fields, interval, exceptions):
        super(ClimacellRealtimeDataProvider, self)\
            .__init__(name="realtime", interval=interval, exceptions=exceptions)

        """Initialize the data object."""
        self.__api_key = api_key
        self.__latitude = latitude
        self.__longitude = longitude
        self.__realtime_fields = realtime_fields

        self.data = None

        self.__headers = {
            'Content-Type': 'application/json',
            'apikey': api_key,
            # 'X-Real-Ip': ip
        }

        self._params = 'lat=' + str(latitude) + '&lon=' + str(longitude) + '&unit_system=' + units

        _LOGGER.debug("ClimacellRealtimeDataProvider initializated for: %s.", self.__realtime_fields)

    def _user_update(self):
        """Get the latest data from climacell"""

        if self.__realtime_fields is not None:
            querystring = self._params + '&fields=' + self.__realtime_fields  # + '&start_time=now'
            url = _ENDPOINT + '/weather/realtime'
            _LOGGER.debug("ClimacellRealtimeDataProvider:_user_update url: %s\%s.", url, querystring)
            self.data = self.__retrieve_data(url, self.__headers, querystring)

        return True

    def __retrieve_data(self, url, headers, querystring):
        result = self.data

        try:
            _LOGGER.debug("_retrieve_data url: %s - headers: %s - querystring: %s",
                          url, self.__headers, querystring)

            response = requests.request("GET", url,
                                        headers=headers, params=querystring,
                                        timeout=(10.05, 27), verify=True
                                        )

            if response.status_code == 200:
                result = json.loads(response.text)
            else:
                _LOGGER.error("ClimacellRealtimeDataProvider._retrieve_data error status_code %s", response.status_code)

            _LOGGER.debug("_retrieve_data response.text: %s", response.text)

        except socket.error as err:
            _LOGGER.error("Unable to connect to Climatecell '%s' while try to retrieve data from %s.", err, url)

        return result


class ClimacellDailyDataProvider(DataProviderBase):
    def __init__(self, api_key, latitude, longitude, units,
                 daily_fields, observations, interval, exceptions):
        super(ClimacellDailyDataProvider, self)\
            .__init__(name="daily", interval=interval, exceptions=exceptions)

        """Initialize the data object."""
        self.__api_key = api_key
        self.__latitude = latitude
        self.__longitude = longitude
        self.__daily_fields = daily_fields
        self.__observations = observations

        self.data = None

        self.__headers = {
            'Content-Type': 'application/json',
            'apikey': api_key,
            # 'X-Real-Ip': ip
        }

        self._params = 'lat=' + str(latitude) + '&lon=' + str(longitude) + '&unit_system=' + units

        _LOGGER.debug("ClimacellDailyDataProvider initializated for: [%s] .", self.__daily_fields)

    def _user_update(self):
        """Get the latest data from climacell"""

        if self.__daily_fields is not None:
            now_utc = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = now_utc + (timedelta(days=self.__observations))

            querystring = self._params + '&fields=' + self.__daily_fields \
                          + '&start_time=' + now_utc.isoformat() \
                          + '&end_time=' + end_date.isoformat()
            url = _ENDPOINT + '/weather/forecast/daily'

            _LOGGER.debug("ClimacellData _retrieve_data _params: %s - realtime_fields: %s | %s ... %s",
                          self._params, self.__daily_fields, datetime.datetime.now(), datetime.datetime.utcnow())
            self.data = self.__retrieve_data(url, self.__headers, querystring)

        return True

    def __retrieve_data(self, url, headers, querystring):
        result = self.data

        try:
            _LOGGER.debug("_retrieve_data url: %s - headers: %s - querystring: %s",
                          url, self.__headers, querystring)

            response = requests.request("GET", url,
                                        headers=headers, params=querystring,
                                        timeout=(10.05, 27), verify=True
                                        )

            if response.status_code == 200:
                result = json.loads(response.text)
            else:
                _LOGGER.error("ClimacellDailyDataProvider._retrieve_data error status_code %s", response.status_code)

            _LOGGER.debug("_retrieve_data response.text: %s", response.text)
        except socket.error as err:
            _LOGGER.error("Unable to connect to Climatecell '%s' while try to retrieve data from %s.", err, url)

        return result


class ClimacellHourlyDataProvider(DataProviderBase):
    def __init__(self, api_key, latitude, longitude, units,
                 daily_fields, observations, interval, exceptions):
        super(ClimacellHourlyDataProvider, self)\
            .__init__(name="hourly", interval=interval, exceptions=exceptions)

        """Initialize the data object."""
        self.__api_key = api_key
        self.__latitude = latitude
        self.__longitude = longitude
        self.__daily_fields = daily_fields
        self.__observations = observations

        self.data = None

        self.__headers = {
            'Content-Type': 'application/json',
            'apikey': api_key,
            # 'X-Real-Ip': ip
        }

        self._params = 'lat=' + str(latitude) + '&lon=' + str(longitude) + '&unit_system=' + units

        _LOGGER.debug("ClimacellHourlyDataProvider initializated for: [%s] .", self.__daily_fields)

    def _user_update(self):
        """Get the latest data from climacell"""

        if self.__daily_fields is not None:
            now_utc = datetime.datetime.utcnow().replace(microsecond=0)
            end_date = now_utc + (timedelta(hours=self.__observations))

            querystring = self._params + '&fields=' + self.__daily_fields \
                          + '&start_time=' + now_utc.isoformat() \
                          + '&end_time=' + end_date.isoformat()
            url = _ENDPOINT + '/weather/forecast/hourly'

            # _LOGGER.debug("ClimacellData _retrieve_data _params: %s - realtime_fields: %s", self._params, self.realtime_fields)
            self.data = self.__retrieve_data(url, self.__headers, querystring)

        return True

    def __retrieve_data(self, url, headers, querystring):
        result = self.data

        try:
            _LOGGER.debug("_retrieve_data url: %s - headers: %s - querystring: %s",
                          url, self.__headers, querystring)

            response = requests.request("GET", url,
                                        headers=headers, params=querystring,
                                        timeout=(10.05, 27), verify=True
                                        )

            if response.status_code == 200:
                result = json.loads(response.text)
            else:
                _LOGGER.error("ClimacellHourlyDataProvider._retrieve_data error status_code %s", response.status_code)

            _LOGGER.debug("_retrieve_data response.text: %s", response.text)
        except socket.error as err:
            _LOGGER.error("Unable to connect to Climatecell '%s' while try to retrieve data from %s.", err, url)

        return result


class ClimacellNowcastDataProvider(DataProviderBase):
    def __init__(self, api_key, latitude, longitude, units,
                 api_fields, timestep, observations, interval, exceptions):
        super(ClimacellNowcastDataProvider, self) \
            .__init__(name="nowcast", interval=interval, exceptions=exceptions)

        """Initialize the data object."""
        self.__api_key = api_key
        self.__latitude = latitude
        self.__longitude = longitude
        self.__daily_fields = api_fields
        self.__timestep = timestep
        self.__observations = observations

        self.data = None

        self.__headers = {
            'Content-Type': 'application/json',
            'apikey': api_key,
            # 'X-Real-Ip': ip
        }

        self._params = 'lat=' + str(latitude) + '&lon=' + str(longitude) + '&unit_system=' + units

        _LOGGER.debug("ClimacellNowcastDataProvider initializated for: [%s] .", self.__daily_fields)

    def _user_update(self):
        """Get the latest data from climacell"""

        if self.__daily_fields is not None:
            now_utc = datetime.datetime.utcnow().replace(microsecond=0)
            end_date = now_utc + (timedelta(minutes=(self.__timestep * self.__observations)))

            querystring = self._params + '&fields=' + self.__daily_fields \
                          + '&timestep=' + str(self.__timestep) \
                          + '&start_time=now' \
                          + '&end_time=' + end_date.isoformat()
            url = _ENDPOINT + '/weather/nowcast'

            # _LOGGER.debug("ClimacellData _retrieve_data _params: %s - realtime_fields: %s", self._params, self.realtime_fields)
            self.data = self.__retrieve_data(url, self.__headers, querystring)

        return True

    def __retrieve_data(self, url, headers, querystring):
        result = self.data

        try:
            _LOGGER.debug("_retrieve_data url: %s - headers: %s - querystring: %s",
                          url, self.__headers, querystring)

            response = requests.request("GET", url,
                                        headers=headers, params=querystring,
                                        timeout=(10.05, 27), verify=True
                                        )

            if response.status_code == 200:
                result = json.loads(response.text)
            else:
                _LOGGER.error("ClimacellNowcastDataProvider._retrieve_data error status_code %s", response.status_code)

            _LOGGER.debug("_retrieve_data response.text: %s", response.text)

        except socket.error as err:
            _LOGGER.error("Unable to connect to Climatecell '%s' while try to retrieve data from %s.", err, url)

        return result
