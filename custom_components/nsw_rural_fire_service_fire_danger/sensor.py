"""
NSW Rural Fire Service - Fire Danger.

https://github.com/exxamalte/home-assistant-customisations
"""
import logging
from datetime import timedelta
from pyexpat import ExpatError

import voluptuous as vol
import xmltodict

from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.components.rest.sensor import RestData
from homeassistant.const import (STATE_UNKNOWN, STATE_OK, ATTR_ATTRIBUTION)
from homeassistant.exceptions import PlatformNotReady
from homeassistant.helpers.entity import Entity
import homeassistant.helpers.config_validation as cv

_LOGGER = logging.getLogger(__name__)

DEFAULT_ATTRIBUTION = 'NSW Rural Fire Service'

CONF_DISTRICT_NAME = 'district_name'

DEFAULT_METHOD = 'GET'
DEFAULT_NAME = 'Fire Danger'
DEFAULT_VERIFY_SSL = True
DEFAULT_FORCE_UPDATE = True

SCAN_INTERVAL = timedelta(minutes=10)

SENSOR_ATTRIBUTES = {
    # <XML Key>: [<Display Name>, <Conversion Function>]
    'RegionNumber':
        ['region_number', lambda x: int(x)],
    'Councils':
        ['councils', lambda x: x.split(';')],
    'DangerLevelToday':
        ['danger_level_today', lambda x: x.lower().capitalize()],
    'DangerLevelTomorrow':
        ['danger_level_tomorrow', lambda x: x.lower().capitalize()],
    'FireBanToday':
        ['fire_ban_today', lambda x: x == 'Yes'],
    'FireBanTomorrow':
        ['fire_ban_tomorrow', lambda x: x == 'Yes']
}

URL = 'http://www.rfs.nsw.gov.au/feeds/fdrToban.xml'

XML_DISTRICT = 'District'
XML_FIRE_DANGER_MAP = 'FireDangerMap'
XML_NAME = 'Name'

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_DISTRICT_NAME): cv.string,
})


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the sensor."""
    district_name = config.get(CONF_DISTRICT_NAME)

    rest = RestData(
        DEFAULT_METHOD, URL, None, None, None, DEFAULT_VERIFY_SSL)
    rest.update()
    if rest.data is None:
        raise PlatformNotReady

    # Must update the sensor now (including fetching the rest resource) to
    # ensure it's updating its state.
    add_entities([NswFireServiceFireDangerSensor(
            hass, rest, district_name)], True)


class NswFireServiceFireDangerSensor(Entity):
    """Implementation of the sensor."""

    def __init__(self, hass, rest, district_name):
        """Initialize the sensor."""
        self._hass = hass
        self.rest = rest
        self._district_name = district_name
        self._name = 'Fire Danger in {}'.format(self._district_name)
        self._state = STATE_UNKNOWN
        self._attributes = {
            'district': district_name,
            ATTR_ATTRIBUTION: DEFAULT_ATTRIBUTION
        }

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def available(self):
        """Return if the sensor data are available."""
        return self.rest.data is not None

    @property
    def state(self):
        """Return the state of the device."""
        return self._state

    @property
    def force_update(self):
        """Force update."""
        return DEFAULT_FORCE_UPDATE

    @staticmethod
    def _attribute_in_structure(obj, keys):
        """Return the attribute found under the chain of keys."""
        key = keys.pop(0)
        if key in obj:
            return NswFireServiceFireDangerSensor._attribute_in_structure(
                obj[key], keys) if keys else obj[key]

    def update(self):
        """Get the latest data from REST API and update the state."""
        self.rest.update()
        value = self.rest.data
        attributes = {
            'district': self._district_name,
            ATTR_ATTRIBUTION: DEFAULT_ATTRIBUTION
        }
        self._state = STATE_UNKNOWN
        if value:
            try:
                value = xmltodict.parse(value)
                districts = self._attribute_in_structure(
                    value, [XML_FIRE_DANGER_MAP, XML_DISTRICT])
                if districts and isinstance(districts, list):
                    for district in districts:
                        if XML_NAME in district:
                            district_name = district.get(XML_NAME)
                            if district_name == self._district_name:
                                # Found it.
                                for key in SENSOR_ATTRIBUTES:
                                    if key in district:
                                        text_value = district.get(key)
                                        conversion = SENSOR_ATTRIBUTES[key][1]
                                        if conversion:
                                            text_value = conversion(text_value)
                                        attributes[SENSOR_ATTRIBUTES[key][0]] \
                                            = text_value
                                self._state = STATE_OK
                                break
            except ExpatError as ex:
                _LOGGER.warning("Unable to parse XML data: %s", ex)
        self._attributes = attributes

    @property
    def device_state_attributes(self):
        """Return the state attributes."""
        return self._attributes