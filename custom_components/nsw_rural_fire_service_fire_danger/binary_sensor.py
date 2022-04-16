"""NSW Rural Fire Service - Fire Danger - Binary Sensor."""
from __future__ import annotations

import logging

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import BINARY_SENSOR_TYPES, DOMAIN
from .entity import NswFireServiceFireDangerEntity

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the NSW Rural Fire Service Fire Danger Feed platform."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    config_entry_unique_id = config_entry.unique_id

    async_add_entities(
        [
            NswFireServiceFireDangerBinarySensor(
                coordinator, sensor_type, config_entry_unique_id
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

    _attr_device_class = BinarySensorDeviceClass.SAFETY

    @property
    def is_on(self) -> bool | None:
        """Return true if the binary sensor is on."""
        return bool(self._state)
