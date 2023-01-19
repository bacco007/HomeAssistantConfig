""""
Based on the good work from @JayBlackedOut
https://github.com/JayBlackedOut/hass-nhlapi/blob/master/README.md
"""

from audioop import add
import logging
from datetime import datetime as dt
from custom_components.formulaone_api.driverssensor import DriversSensor
from custom_components.formulaone_api.constructorsensor import ConstructorsSensor
from custom_components.formulaone_api.racessensor import RacesSensor
from custom_components.formulaone_api.const import DEFAULT_NAME, DEFAULT_SCAN_INTERVAL
from custom_components.formulaone_api.lastresultsensor import LastResultSensor
import voluptuous as vol
import json

from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (CONF_NAME, CONF_ID, CONF_SCAN_INTERVAL)
import homeassistant.helpers.config_validation as cv

_LOGGER = logging.getLogger(__name__)

__version__ = '0.8.1'

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_ID, default=0): cv.positive_int,
    vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
    vol.Optional(
        CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL
    ): cv.time_period,
})

def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the Formula One sensor."""
    name = config.get(CONF_NAME, DEFAULT_NAME)
    scan_interval = config.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
    add_entities([RacesSensor(name, scan_interval, hass)])
    add_entities([ConstructorsSensor(name, scan_interval, hass)])
    add_entities([DriversSensor(name, scan_interval, hass)])
    add_entities([LastResultSensor(name, scan_interval, hass)])
