"""
Component to calculate IAQ UK index.

For more details about this component, please refer to
https://github.com/Limych/ha-iaquk
"""

import logging
import numbers
from typing import Optional

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.sensor import DOMAIN as SENSOR
from homeassistant.const import CONF_NAME, CONF_SENSORS, EVENT_HOMEASSISTANT_START, \
    ATTR_UNIT_OF_MEASUREMENT, TEMP_CELSIUS, TEMP_FAHRENHEIT, UNIT_NOT_RECOGNIZED_TEMPLATE, \
    TEMPERATURE
from homeassistant.core import callback, State
from homeassistant.helpers import discovery
from homeassistant.helpers.event import async_track_state_change
from homeassistant.util.temperature import convert as convert_temperature

from .const import DOMAIN, VERSION, ISSUE_URL, SUPPORT_LIB_URL, CONF_SOURCES, \
    DATA_IAQUK, CONF_CO2, CONF_TEMPERATURE, CONF_HUMIDITY, CONF_TVOC, LEVEL_INADEQUATE, \
    LEVEL_POOR, LEVEL_FAIR, LEVEL_GOOD, LEVEL_EXCELLENT
from .sensor import SENSORS

_LOGGER = logging.getLogger(__name__)

SOURCES = [
    CONF_TEMPERATURE,
    CONF_HUMIDITY,
    CONF_CO2,
    CONF_TVOC
]

SOURCES_SCHEMA = vol.All(
    vol.Schema({vol.Optional(src): cv.entity_id for src in SOURCES}),
    cv.has_at_least_one_key(CONF_TEMPERATURE, CONF_HUMIDITY, CONF_CO2, CONF_TVOC)
)

IAQ_SCHEMA = vol.Schema({
    vol.Optional(CONF_NAME): cv.string,
    vol.Required(CONF_SOURCES): SOURCES_SCHEMA,
    vol.Optional(CONF_SENSORS):
        vol.All(cv.ensure_list, [vol.In(SENSORS)]),
})

CONFIG_SCHEMA = vol.Schema({
    DOMAIN: cv.schema_with_slug_keys(IAQ_SCHEMA),
}, extra=vol.ALLOW_EXTRA)


def _deslugify(string):
    return string.replace('_', ' ').title()


async def async_setup(hass, config):
    """Set up component."""
    # Print startup message
    _LOGGER.info('Version %s', VERSION)
    _LOGGER.info('If you have ANY issues with this,'
                 ' please report them here: %s', ISSUE_URL)

    hass.data.setdefault(DATA_IAQUK, {})

    for object_id, cfg in config[DOMAIN].items():
        if not cfg:
            cfg = {}

        name = cfg.get(CONF_NAME, _deslugify(object_id))
        sources = cfg.get(CONF_SOURCES)
        sensors = cfg.get(CONF_SENSORS)

        if not sensors:
            sensors = SENSORS.keys()

        _LOGGER.debug('Initialize controller %s for sources: %s', object_id,
                      ', '.join([f'{key}={value}' for (key, value) in sources.items()]))

        controller = Iaquk(hass, object_id, name, sources)
        hass.data[DATA_IAQUK][object_id] = controller

        discovery.load_platform(hass, SENSOR, DOMAIN, {
            CONF_NAME: object_id,
            CONF_SENSORS: sensors,
        }, config)

    if not hass.data[DATA_IAQUK]:
        return False

    return True


def get_number_state(value):
    """Convert value to number."""
    if not isinstance(value, State):
        return None
    value = value.state
    if isinstance(value, numbers.Number):
        return value
    try:
        return float(value)
    except:  # pylint: disable=w0702
        return None


class Iaquk:
    """IAQ UK controller."""

    def __init__(self, hass, entity_id: str, name: str, sources):
        """Initialize controller."""
        self._hass = hass
        self._entity_id = entity_id
        self._name = name
        self._sources = sources

        self._iaq_index = None

    def async_added_to_hass(self):
        """Register callbacks."""

        # pylint: disable=unused-argument
        @callback
        def sensor_state_listener(entity, old_state, new_state):
            """Handle device state changes."""
            self.update()

        # pylint: disable=unused-argument
        @callback
        def sensor_startup(event):
            """Update template on startup."""
            async_track_state_change(self._hass, self._sources.values(),
                                     sensor_state_listener)
            sensor_state_listener(None, None, None)  # Force first update

        self._hass.bus.async_listen_once(EVENT_HOMEASSISTANT_START,
                                         sensor_startup)

    @property
    def unique_id(self):
        """Return a unique ID."""
        return self._entity_id

    @property
    def name(self):
        """Get controller name."""
        return self._name

    @property
    def iaq_index(self) -> Optional[int]:
        """Get IAQ index."""
        return self._iaq_index

    # pylint: disable=r1705
    @property
    def iaq_level(self) -> Optional[str]:
        """Get IAQ level."""
        # Transform IAQ index to human readable text according
        # to Indoor Air Quality UK: http://www.iaquk.org.uk/
        if self._iaq_index is None:
            return None
        elif self._iaq_index <= 25:
            return LEVEL_INADEQUATE
        elif self._iaq_index <= 38:
            return LEVEL_POOR
        elif self._iaq_index <= 51:
            return LEVEL_FAIR
        elif self._iaq_index <= 60:
            return LEVEL_GOOD
        return LEVEL_EXCELLENT

    def update(self):
        """Update index state."""
        _LOGGER.debug('[%s] State update', self._entity_id)

        iaq = []
        for src in SOURCES:
            index = self.__getattribute__('_%s_index' % src)
            _LOGGER.debug('[%s] %s_index=%s', self._entity_id, src, index)
            if index is not None:
                iaq.append(index)

        if iaq:
            self._iaq_index = int(sum(iaq) * 13 / len(iaq))
            _LOGGER.debug('[%s] Current IAQ index %d (%d sensors)',
                          self._entity_id, self._iaq_index, len(iaq))

    @property
    def _temperature_index(self):
        """Transform indoor temperature values to IAQ points according
        to Indoor Air Quality UK: http://www.iaquk.org.uk/ """
        entity_id = self._sources.get(CONF_TEMPERATURE)

        if entity_id is None:
            return None

        entity = self._hass.states.get(entity_id)
        value = get_number_state(entity)
        _LOGGER.debug('[%s] temperature=%s', self._entity_id, value)
        if value is None:
            return None

        entity_unit = entity.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
        if entity_unit not in (TEMP_CELSIUS, TEMP_FAHRENHEIT):
            raise ValueError(
                UNIT_NOT_RECOGNIZED_TEMPLATE.format(entity_unit,
                                                    TEMPERATURE))

        if entity_unit != TEMP_CELSIUS:
            value = convert_temperature(
                value, entity_unit, TEMP_CELSIUS)

        index = 1
        if 18 <= value <= 21:
            index = 5
        elif value > 16 or value < 23:
            index = 4
        elif value > 15 or value < 24:
            index = 3
        elif value > 14 or value < 25:
            index = 2
        return index

    @property
    def _humidity_index(self):
        """Transform indoor humidity values to IAQ points according
        to Indoor Air Quality UK: http://www.iaquk.org.uk/ """
        entity_id = self._sources.get(CONF_HUMIDITY)

        if entity_id is None:
            return None

        value = get_number_state(self._hass.states.get(entity_id))
        _LOGGER.debug('[%s] humidity=%s', self._entity_id, value)
        if value is None:
            return None

        index = 5
        if value < 10 or value > 90:
            index = 1
        elif value < 20 or value > 80:
            index = 2
        elif value < 30 or value > 70:
            index = 3
        elif value < 40 or value > 60:
            index = 4
        return index

    @property
    def _co2_index(self):
        """Transform indoor eCO2 values to IAQ points according
        to Indoor Air Quality UK: http://www.iaquk.org.uk/ """
        entity_id = self._sources.get(CONF_CO2)

        if entity_id is None:
            return None

        value = get_number_state(self._hass.states.get(entity_id))
        _LOGGER.debug('[%s] CO2=%s', self._entity_id, value)
        if value is None:
            return None

        index = 1
        if value <= 600:
            index = 5
        elif value <= 800:
            index = 4
        elif value <= 1500:
            index = 3
        elif value <= 1800:
            index = 2
        return index

    @property
    def _tvoc_index(self):
        """Transform indoor tVOC values to IAQ points according
        to Indoor Air Quality UK: http://www.iaquk.org.uk/ """
        entity_id = self._sources.get(CONF_TVOC)

        if entity_id is None:
            return None

        value = get_number_state(self._hass.states.get(entity_id))
        _LOGGER.debug('[%s] tVOC=%s', self._entity_id, value)
        if value is None:
            return None

        index = 1
        if value <= 65:
            index = 5
        elif value <= 220:
            index = 4
        elif value <= 660:
            index = 3
        elif value <= 2200:
            index = 2
        return index
