"""Sensor platform for NSW Air Quality"""
import logging
import requests
import datetime
import voluptuous as vol
from datetime import timedelta
from lxml import html
from homeassistant.helpers.entity import Entity
import homeassistant.helpers.config_validation as cv
from homeassistant.components.sensor import (PLATFORM_SCHEMA)
from homeassistant.const import CONF_NAME, ATTR_ATTRIBUTION
from homeassistant.util import Throttle

__version__ = '0.0.1'
_LOGGER = logging.getLogger(__name__)

REQUIREMENTS = []

DEFAULT_UOM = 'AQI'

# DEFAULT_SCAN_INTERVAL = timedelta(hours=1)
# SCAN_INTERVAL = timedelta(hours=1)

ICON = 'mdi:chemical-weapon'

MIN_TIME_BETWEEN_UPDATES = datetime.timedelta(minutes=5)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_NAME): cv.string
})


def setup_platform(hass, config, add_entities, discovery_info=None):
    "Setup Platform"
    add_entities([NSWAQISensor(
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
        return DEFAULT_UOM

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    def update(self):

        url = "https://airquality.environment.nsw.gov.au/aquisnetnswphp/getPage.php?reportid=35"

        response = requests.get(url)
        tree = html.fromstring(response.content)

        pm10 = tree.xpath('.//table/tbody/tr[td/text()="Tamworth"]/td[8]/text()')[0]
        pm25 = tree.xpath('.//table/tbody/tr[td/text()="Tamworth"]/td[9]/text()')[0]
        maxval = max(int(pm10), int(pm25))

        self._attributes = {}
        self._state = 0

        self._attributes["pm25"] = pm25
        self._attributes["pm10"] = pm10
        self._attributes[ATTR_ATTRIBUTION] = "Data provided by NSW Dept of Environment"
        self._state = maxval
