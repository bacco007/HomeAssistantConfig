"""Sensor platform to calculate IAQ UK index."""

import logging
from typing import Optional, Union

from homeassistant.components.sensor import DOMAIN as SENSOR_DOMAIN
from homeassistant.const import CONF_SENSORS, CONF_NAME
from homeassistant.helpers.entity import Entity, async_generate_entity_id

from .const import DATA_IAQUK, LEVEL_INADEQUATE, LEVEL_POOR, LEVEL_GOOD, LEVEL_EXCELLENT

_LOGGER = logging.getLogger(__name__)

ENTITY_ID_FORMAT = SENSOR_DOMAIN + ".{}"

SENSOR_INDEX = 'iaq_index'
SENSOR_LEVEL = 'iaq_level'

SENSORS = {
    SENSOR_INDEX: 'Indoor Air Quality Index',
    SENSOR_LEVEL: 'Indoor Air Quality Level',
}


async def async_setup_platform(hass, config, async_add_entities,  # pylint: disable=w0613
                               discovery_info=None):
    """Set up a sensors to calculate IAQ UK index."""
    if discovery_info is None:
        return

    object_id = discovery_info[CONF_NAME]
    controller = hass.data[DATA_IAQUK][object_id]

    sensors = []
    for sensor_type in discovery_info[CONF_SENSORS]:
        _LOGGER.debug('Initialize sensor %s for controller %s', sensor_type, object_id)
        sensors.append(IaqukSensor(hass, controller, sensor_type))

    async_add_entities(sensors, True)


class IaqukSensor(Entity):
    """IAQ UK sensor."""

    def __init__(self, hass, controller, sensor_type: str):
        self._hass = hass
        self._controller = controller
        self._sensor_type = sensor_type
        self._unique_id = "%s_%s" % (self._controller.unique_id, self._sensor_type)
        self._name = "%s %s" % (self._controller.name, SENSORS[self._sensor_type])

        self.entity_id = async_generate_entity_id(ENTITY_ID_FORMAT, self._unique_id, hass=hass)

    async def async_added_to_hass(self):
        """Register callbacks."""
        self._controller.async_added_to_hass()

    @property
    def unique_id(self) -> Optional[str]:
        """Return a unique ID."""
        return self._unique_id

    @property
    def name(self) -> Optional[str]:
        """Return the name of the sensor."""
        return self._name

    @property
    def icon(self) -> Optional[str]:
        """Icon to use in the frontend, if any."""
        icon = "mdi:air-filter"
        if self._sensor_type == SENSOR_LEVEL:
            icon = "mdi:emoticon-neutral"
            if self.state == LEVEL_EXCELLENT:
                icon = "mdi:emoticon-excited"
            elif self.state == LEVEL_GOOD:
                icon = "mdi:emoticon-happy"
            # Skip for LEVEL_FAIR -- default state
            elif self.state == LEVEL_POOR:
                icon = "mdi:emoticon-sad"
            elif self.state == LEVEL_INADEQUATE:
                icon = "mdi:emoticon-dead"

        return icon

    @property
    def state(self) -> Union[None, str, int, float]:
        """Return the state of the sensor."""
        return self._controller.iaq_index if self._sensor_type == SENSOR_INDEX \
            else self._controller.iaq_level

    @property
    def unit_of_measurement(self) -> Optional[str]:
        """Return the unit of measurement of this entity, if any."""
        return 'IAQI' if self._sensor_type == SENSOR_INDEX \
            else None
