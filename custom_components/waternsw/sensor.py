"""Sensor platform for WaterNSW"""
import datetime
import json
import logging
import requests
from datetime import timedelta

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import ATTR_ATTRIBUTION, CONF_NAME, CONF_ICON
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle

__version__ = 'v0.4'
_LOGGER = logging.getLogger(__name__)

REQUIREMENTS = []

CONF_SITE = 'site_id'
CONF_VARFROM = 'from_variable'
CONF_VARTO = 'to_variable'
CONF_UOM = 'unit_of_measure'

DEFAULT_UOM = 'Unknown'
DEFAULT_ICON = 'mdi:water'

MIN_TIME_BETWEEN_UPDATES = datetime.timedelta(minutes=10)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_NAME): cv.string,
    vol.Optional(CONF_ICON, default=DEFAULT_ICON): cv.string,
    vol.Required(CONF_SITE): cv.string,
    vol.Required(CONF_VARFROM): cv.string,
    vol.Required(CONF_VARTO): cv.string,
    vol.Required(CONF_UOM, default=DEFAULT_UOM): cv.string
})


def setup_platform(hass, config, add_entities, discovery_info=None):
    "Setup Platform"
    add_entities([WaterNSWSensor(
        name=config[CONF_NAME],
        icon=config[CONF_ICON],
        site=config[CONF_SITE],
        varfrom=config[CONF_VARFROM],
        varto=config[CONF_VARTO],
        uom=config[CONF_UOM]
    )])


class WaterNSWSensor(Entity):
    def __init__(self, name: str, icon: str, site: str, varfrom: str, varto: str, uom: str):
        self._state = None
        self._name = name
        self._icon = icon
        self._attributes = {}
        self._site = site
        self._varfrom = varfrom
        self._varto = varto
        self._uom = uom

    @property
    def name(self):
        return "WaterNSW " + self._name

    @property
    def state(self):
        return self._state

    @property
    def icon(self):
        return self._icon

    @property
    def state_attributes(self):
        return self._attributes

    @property
    def unit_of_measurement(self):
        return self._uom

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    def update(self):

        url = "https://realtimedata.waternsw.com.au/cgi/webservice.pl?{'function':'get_latest_ts_values','version':'2','params':{'site_list':'" + str(
            self._site) + "','datasource':'PROV','trace_list':[{'varfrom':'" + str(self._varfrom) + "','varto':'" + str(self._varto) + "'}]}}&ver=2"

        try:
            response = requests.get(url)
            response.raise_for_status()
        except HTTPError as http_err:
            _LOGGER.warning("HTTP Error: %s", http_err)
        except Exception as err:
            _LOGGER.warning("Other Error: %s", err)

        results = response.json()

        self._attributes = {}
        self._state = 0

        try:
            reqvalue = results['return'][self._site][0]['values'][0]['v']
        except:
            reqvalue = "unknown"
            _LOGGER.error('Cannot retrieve date, check config')

        try:
            time = results['return'][self._site][0]['values'][0]['time']
        except:
            time = "unknown"

        if time == "unknown":
            datetime_obj = datetime.datetime.now()
        else:
            datetime_obj = datetime.datetime.strptime(time, '%Y%m%d%H%M%S')

        # Check for stale data
        today_obj = datetime.datetime.now()
        difftime = today_obj - datetime_obj

        if difftime.days <= 7:
            output_str = reqvalue
        else:
            output_str = "unknown"

        self._attributes["lastupdate"] = datetime_obj
        self._attributes["site_id"] = self._site
        self._attributes[ATTR_ATTRIBUTION] = "Data provided by WaterNSW Real Time Data Platform"
        self._state = output_str
