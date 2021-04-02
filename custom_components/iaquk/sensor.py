"""Sensor platform to calculate IAQ UK index."""

import logging
from typing import Any, Dict, Optional, Union

from homeassistant.components.sensor import ENTITY_ID_FORMAT
from homeassistant.const import CONF_NAME, CONF_SENSORS
from homeassistant.helpers.entity import Entity, async_generate_entity_id

from .const import (
    DOMAIN,
    ICON_DEFAULT,
    ICON_EXCELLENT,
    ICON_FAIR,
    ICON_GOOD,
    ICON_INADEQUATE,
    ICON_POOR,
    LEVEL_EXCELLENT,
    LEVEL_GOOD,
    LEVEL_INADEQUATE,
    LEVEL_POOR,
)

_LOGGER = logging.getLogger(__name__)

SENSOR_INDEX = "iaq_index"
SENSOR_LEVEL = "iaq_level"

SENSORS = {
    SENSOR_INDEX: "Indoor Air Quality Index",
    SENSOR_LEVEL: "Indoor Air Quality Level",
}


# pylint: disable=w0613
async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up a sensors to calculate IAQ UK index."""
    if discovery_info is None:
        return

    object_id = discovery_info[CONF_NAME]
    controller = hass.data[DOMAIN][object_id]

    sensors = []
    for sensor_type in discovery_info[CONF_SENSORS]:
        _LOGGER.debug("Initialize sensor %s for controller %s", sensor_type, object_id)
        sensors.append(IaqukSensor(hass, controller, sensor_type))

    async_add_entities(sensors, True)


class IaqukSensor(Entity):
    """IAQ UK sensor."""

    def __init__(self, hass, controller, sensor_type: str):
        """Initialize sensor."""
        self._hass = hass
        self._controller = controller
        self._sensor_type = sensor_type
        self._unique_id = f"{self._controller.unique_id}_{self._sensor_type}"
        self._name = "{} {}".format(self._controller.name, SENSORS[self._sensor_type])

        self.entity_id = async_generate_entity_id(
            ENTITY_ID_FORMAT, self._unique_id, hass=hass
        )

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
        icon = ICON_DEFAULT
        if self._sensor_type == SENSOR_LEVEL:
            icon = ICON_FAIR
            if self.state == LEVEL_EXCELLENT:
                icon = ICON_EXCELLENT
            elif self.state == LEVEL_GOOD:
                icon = ICON_GOOD
            # Skip for LEVEL_FAIR -- default state
            elif self.state == LEVEL_POOR:
                icon = ICON_POOR
            elif self.state == LEVEL_INADEQUATE:
                icon = ICON_INADEQUATE

        return icon

    @property
    def state(self) -> Union[None, str, int, float]:
        """Return the state of the sensor."""
        return (
            self._controller.iaq_index
            if self._sensor_type == SENSOR_INDEX
            else self._controller.iaq_level
        )

    @property
    def device_class(self) -> Optional[str]:
        """Return the class of this device, from component DEVICE_CLASSES."""
        return f"{DOMAIN}__level" if self._sensor_type == SENSOR_LEVEL else None

    @property
    def unit_of_measurement(self) -> Optional[str]:
        """Return the unit of measurement of this entity, if any."""
        return "IAQI" if self._sensor_type == SENSOR_INDEX else None

    @property
    def state_attributes(self) -> Optional[Dict[str, Any]]:
        """Return the state attributes."""
        return self._controller.state_attributes
