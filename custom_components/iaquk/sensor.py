"""Sensor platform to calculate IAQ UK index."""

import logging
from collections.abc import Mapping
from typing import Any, Final

from homeassistant.components.sensor import (
    ENTITY_ID_FORMAT,
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.const import CONF_NAME, CONF_SENSORS
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import async_generate_entity_id
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

from . import IaqukController
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
    SENSOR_INDEX,
    SENSOR_LEVEL,
    SENSORS,
)

_LOGGER: Final = logging.getLogger(__name__)


# pylint: disable=unused-argument
async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,  # noqa: ARG001
    async_add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    """Set up a sensors to calculate IAQ UK index."""
    if discovery_info is None:
        return

    object_id = discovery_info[CONF_NAME]
    controller = hass.data[DOMAIN][object_id]

    sensors = []
    for sensor_type in discovery_info[CONF_SENSORS]:
        _LOGGER.debug("Initialize sensor %s for controller %s", sensor_type, object_id)
        sensors.append(IaqukSensor(controller, sensor_type))

    async_add_entities(sensors, update_before_add=True)


class IaqukSensor(SensorEntity):
    """IAQ UK sensor."""

    def __init__(self, controller: IaqukController, sensor_type: str) -> None:
        """Initialize sensor."""
        self._controller = controller
        self._sensor_type = sensor_type
        self._attr_unique_id = f"{controller.unique_id}_{sensor_type}"

        self.entity_id = async_generate_entity_id(
            ENTITY_ID_FORMAT, self._attr_unique_id, hass=controller.hass
        )

        self._attr_name = f"{controller.name} {SENSORS[sensor_type]}"
        self._attr_state_class = (
            SensorStateClass.MEASUREMENT if sensor_type == SENSOR_INDEX else None
        )
        self._attr_device_class = (
            f"{DOMAIN}__level" if sensor_type == SENSOR_LEVEL else SensorDeviceClass.AQI
        )
        self._attr_icon = ICON_DEFAULT if sensor_type == SENSOR_INDEX else ICON_FAIR

    async def async_added_to_hass(self) -> None:
        """Register callbacks."""
        self._controller.async_added_to_hass()

    @property
    def extra_state_attributes(self) -> Mapping[str, Any] | None:
        """Return the state attributes."""
        return self._controller.state_attributes

    async def async_update(self) -> None:
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
