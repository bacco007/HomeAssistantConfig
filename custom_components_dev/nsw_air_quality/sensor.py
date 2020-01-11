"""Sensor platform for NSW Air Quality"""
import logging
import scrapy
import datetime
import voluptuous as vol
from datetime import timedelta
from homeassistant.helpers.entity import Entity
import homeassistant.helpers.config_validation as cv
from homeassistant.components.sensor import (PLATFORM_SCHEMA)
from homeassistant.const import CONF_NAME, ATTR_ATTRIBUTION

__version__ = '0.0.1'
_LOGGER = logging.getLogger(__name__)

REQUIREMENTS = []

USER_AGENT = "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36"

DEFAULT_UOM = 'AQL'

# DEFAULT_SCAN_INTERVAL = timedelta(hours=1)
# SCAN_INTERVAL = timedelta(hours=1)

ICON = 'mdi:water'

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_NAME): cv.string
})


def setup_platform(hass, config, add_entities, discovery_info=None):
    "Setup Platform"
    add_entities([NSWAQIensor(
        name=config[CONF_NAME]
    )])


class NSWAQISensor(Entity):
    def __init__(self, name: str):
        self._state = None
        self._name = name
        self._attributes = {}

    @property
    def name(self):
        return "NSW Air Quality - " + self._name

    @property
    def state(self):
        return self._state

    @property
    def icon(self):
        return ICON

    @property
    def state_attributes(self):
        return self._attributes

    @property
    def unit_of_measurement(self):
        return self._uom

    def update(self):

        url = "https://realtimedata.waternsw.com.au/cgi/webservice.pl?{'function':'get_latest_ts_values','version':'2','params':{'site_list':'" + str(
            self._site) + "','datasource':'PROV','trace_list':[{'varfrom':'" + str(self._varfrom) + "','varto':'" + str(self._varto) + "'}]}}&ver=2"
        results = json.load(urllib.request.urlopen(url))

        self._attributes = {}
        self._state = 0

        output_str = results['return'][self._site][0]['values'][0]['v']
        time = results['return'][self._site][0]['values'][0]['time']
        datetime_obj = datetime.datetime.strptime(time, '%Y%m%d%H%M%S')

        self._attributes["lastupdate"] = datetime_obj
        self._attributes["site_id"] = self._site
        self._attributes[ATTR_ATTRIBUTION] = "Data provided by WaterNSW Realtime Data"
        self._state = output_str
