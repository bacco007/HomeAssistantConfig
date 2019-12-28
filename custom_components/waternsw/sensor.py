"""Sensor platform for WaterNSW"""
import logging
import json
import urllib.request
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

CONF_SITE = 'site_id'
CONF_VARFROM = 'from_variable'
CONF_VARTO = 'to_variable'
CONF_UOM = 'unit_of_measure'

DEFAULT_UOM = 'Unknown'

# DEFAULT_SCAN_INTERVAL = timedelta(hours=1)
# SCAN_INTERVAL = timedelta(hours=1)

ICON = 'mdi:water'

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_NAME): cv.string,
    vol.Required(CONF_SITE): cv.string,
    vol.Required(CONF_VARFROM): cv.string,
    vol.Required(CONF_VARTO): cv.string,
    vol.Required(CONF_UOM, default=DEFAULT_UOM): cv.string
})


def setup_platform(hass, config, add_entities, discovery_info=None):
    "Setup Platform"
    add_entities([WaterNSWSensor(
        name=config[CONF_NAME],
        site=config[CONF_SITE],
        varfrom=config[CONF_VARFROM],
        varto=config[CONF_VARTO],
        uom=config[CONF_UOM]
    )])


class WaterNSWSensor(Entity):
    def __init__(self, name: str, site: str, varfrom: str, varto: str, uom: str):
        self._state = None
        self._name = name
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
