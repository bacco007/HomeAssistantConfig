"""NSW Rural Fire Service - Fire Danger - Binary Sensor."""
import logging
from typing import Callable, List

from homeassistant.components.binary_sensor import (
    BinarySensorEntity,
    DEVICE_CLASS_SAFETY,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity

from .const import DOMAIN, BINARY_SENSOR_TYPES
from .entity import NswFireServiceFireDangerEntity

_LOGGER = logging.getLogger(__name__)

# An update of this entity is not making a web request, but uses internal data only.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: Callable[[List[Entity], bool], None],
) -> None:
    """Set up the NSW Rural Fire Service Fire Danger Feed platform."""
    manager = hass.data[DOMAIN][entry.entry_id]
    config_entry_unique_id = entry.unique_id

    async_add_entities(
        [
            NswFireServiceFireDangerBinarySensor(
                hass, manager, sensor_type, config_entry_unique_id
            )
            for sensor_type in BINARY_SENSOR_TYPES
        ],
        True,
    )
    _LOGGER.debug("Binary sensor setup done")


class NswFireServiceFireDangerBinarySensor(
    NswFireServiceFireDangerEntity, BinarySensorEntity
):
    """Implementation of the binary sensor."""

    @property
    def is_on(self):
        """Return true if the binary sensor is on."""
        return bool(self._state)

    @property
    def device_class(self):
        """Return the class of this device."""
        return DEVICE_CLASS_SAFETY
