"""Sensor platform to calculate IAQ UK index."""

import logging
from typing import Any, Final, Mapping, Optional

from homeassistant.components.sensor import (
    ENTITY_ID_FORMAT,
    STATE_CLASS_MEASUREMENT,
    SensorEntity,
)
from homeassistant.const import CONF_NAME, CONF_SENSORS
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import async_generate_entity_id
from homeassistant.helpers.typing import ConfigType

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

_LOGGER: Final = logging.getLogger(__name__)

SENSOR_INDEX: Final = "iaq_index"
SENSOR_LEVEL: Final = "iaq_level"

SENSORS: Final = {
    SENSOR_INDEX: "Indoor Air Quality Index",
    SENSOR_LEVEL: "Indoor Air Quality Level",
}


# pylint: disable=unused-argument
async def async_setup_platform(
    hass: HomeAssistant, config: ConfigType, async_add_entities, discovery_info=None
):
    """Set up a sensors to calculate IAQ UK index."""
    if discovery_info is None:
        return

    object_id = discovery_info[CONF_NAME]
    controller = hass.data[DOMAIN][object_id]

    sensors = []
    for sensor_type in discovery_info[CONF_SENSORS]:
        _LOGGER.debug("Initialize sensor %s for controller %s", sensor_type, object_id)
        sensors.append(IaqukSensor(controller, sensor_type))

    async_add_entities(sensors, True)


class IaqukSensor(SensorEntity):
    """IAQ UK sensor."""

    def __init__(self, controller, sensor_type: str):
        """Initialize sensor."""
        self._controller = controller
        self._sensor_type = sensor_type

        self.entity_id = async_generate_entity_id(
            ENTITY_ID_FORMAT, self._attr_unique_id, hass=controller.hass
        )

        self._attr_unique_id = f"{controller.unique_id}_{sensor_type}"
        self._attr_name = f"{controller.name} {SENSORS[sensor_type]}"
        self._attr_state_class = STATE_CLASS_MEASUREMENT
        self._attr_device_class = (
            f"{DOMAIN}__level" if sensor_type == SENSOR_LEVEL else None
        )
        self._attr_native_unit_of_measurement = (
            "IAQI" if sensor_type == SENSOR_INDEX else None
        )
        self._attr_icon = ICON_DEFAULT if sensor_type == SENSOR_INDEX else ICON_FAIR

    async def async_added_to_hass(self):
        """Register callbacks."""
        self._controller.async_added_to_hass()

    @property
    def extra_state_attributes(self) -> Optional[Mapping[str, Any]]:
        """Return the state attributes."""
        return self._controller.state_attributes

    async def async_update(self):
        """Update sensor state."""
        if self._sensor_type == SENSOR_INDEX:
            self._attr_native_value = self._controller.iaq_index

        else:
            self._attr_native_value = self._controller.iaq_level
            self._attr_icon = (
                ICON_EXCELLENT
                if self.state == LEVEL_EXCELLENT
                else ICON_GOOD
                if self.state == LEVEL_GOOD
                else ICON_POOR
                if self.state == LEVEL_POOR
                else ICON_INADEQUATE
                if self.state == LEVEL_INADEQUATE
                else ICON_FAIR
            )
