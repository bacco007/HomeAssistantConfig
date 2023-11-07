"""Base SamsungTV Entity."""
from __future__ import annotations

from typing import Any

from homeassistant.const import (
    ATTR_CONNECTIONS,
    ATTR_IDENTIFIERS,
    ATTR_SW_VERSION,
    CONF_HOST,
    CONF_ID,
    CONF_MAC,
    CONF_NAME,
)
from homeassistant.helpers.device_registry import CONNECTION_NETWORK_MAC
from homeassistant.helpers.entity import DeviceInfo, Entity

from .const import CONF_DEVICE_MODEL, CONF_DEVICE_NAME, CONF_DEVICE_OS, DOMAIN


class SamsungTVEntity(Entity):
    """Defines a base SamsungTV entity."""

    _attr_has_entity_name = True

    def __init__(self, config: dict[str, Any], entry_id: str) -> None:
        """Initialize the class."""
        self._name = config.get(CONF_NAME, config[CONF_HOST])
        self._mac = config.get(CONF_MAC)
        self._attr_unique_id = config.get(CONF_ID, entry_id)

        model = config.get(CONF_DEVICE_MODEL, "Samsung TV")
        if dev_name := config.get(CONF_DEVICE_NAME):
            model = f"{model} ({dev_name})"

        self._attr_device_info = DeviceInfo(
            manufacturer="Samsung Electronics",
            model=model,
            name=self._name,
        )
        if self.unique_id:
            self._attr_device_info[ATTR_IDENTIFIERS] = {(DOMAIN, self.unique_id)}
        if dev_os := config.get(CONF_DEVICE_OS):
            self._attr_device_info[ATTR_SW_VERSION] = dev_os
        if self._mac:
            self._attr_device_info[ATTR_CONNECTIONS] = {
                (CONNECTION_NETWORK_MAC, self._mac)
            }
