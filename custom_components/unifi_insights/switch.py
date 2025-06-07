"""Support for UniFi Protect switches."""
from __future__ import annotations

import logging
from typing import Any, Final

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    ATTR_CAMERA_ID,
    ATTR_CAMERA_NAME,
    ATTR_MIC_ENABLED,
    DEVICE_TYPE_CAMERA,
    DOMAIN,
)
from .coordinator import UnifiInsightsDataUpdateCoordinator
from .entity import UnifiProtectEntity

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up switches for UniFi Protect integration."""
    coordinator: UnifiInsightsDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]

    # Skip if Protect API is not available
    if not coordinator.protect_api:
        _LOGGER.debug("Skipping switch setup - Protect API not available")
        return

    entities = []

    # Add camera microphone switches
    for camera_id, camera_data in coordinator.data["protect"]["cameras"].items():
        _LOGGER.debug("Adding microphone switch for camera %s", camera_data.get("name", camera_id))
        entities.append(
            UnifiProtectMicrophoneSwitch(
                coordinator=coordinator,
                camera_id=camera_id,
            )
        )

    _LOGGER.info("Adding %d UniFi Protect switches", len(entities))
    async_add_entities(entities)


class UnifiProtectMicrophoneSwitch(UnifiProtectEntity, SwitchEntity):
    """Representation of a UniFi Protect Camera Microphone Switch."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the switch."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "microphone")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set name
        self._attr_name = "Microphone"

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(self._device_id, {})

        # Set state
        self._attr_is_on = camera_data.get("micEnabled", False)

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CAMERA_ID: self._device_id,
            ATTR_CAMERA_NAME: camera_data.get("name"),
            ATTR_MIC_ENABLED: self._attr_is_on,
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn the microphone on."""
        _LOGGER.debug("Turning on microphone for camera %s", self._device_id)

        try:
            await self.coordinator.protect_api.async_update_camera(
                camera_id=self._device_id,
                data={"micEnabled": True},
            )
            self._attr_is_on = True
            self.async_write_ha_state()
        except Exception as err:
            _LOGGER.error("Error turning on microphone: %s", err)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn the microphone off."""
        _LOGGER.debug("Turning off microphone for camera %s", self._device_id)

        try:
            await self.coordinator.protect_api.async_update_camera(
                camera_id=self._device_id,
                data={"micEnabled": False},
            )
            self._attr_is_on = False
            self.async_write_ha_state()
        except Exception as err:
            _LOGGER.error("Error turning off microphone: %s", err)
