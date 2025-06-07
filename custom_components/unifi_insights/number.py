"""Support for UniFi Protect number entities."""
from __future__ import annotations

import logging
from typing import Any, Final

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    ATTR_CAMERA_ID,
    ATTR_CAMERA_NAME,
    ATTR_MIC_ENABLED,
    ATTR_LIGHT_ID,
    ATTR_LIGHT_NAME,
    ATTR_LIGHT_LEVEL,
    ATTR_CHIME_ID,
    ATTR_CHIME_NAME,
    ATTR_CHIME_VOLUME,
    ATTR_CHIME_REPEAT_TIMES,
    ATTR_CHIME_RINGTONE_ID,
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_LIGHT,
    DEVICE_TYPE_CHIME,
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
    """Set up number entities for UniFi Protect integration."""
    coordinator: UnifiInsightsDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]

    # Skip if Protect API is not available
    if not coordinator.protect_api:
        _LOGGER.debug("Skipping number setup - Protect API not available")
        return

    entities = []

    # Add camera microphone volume numbers
    for camera_id, camera_data in coordinator.data["protect"]["cameras"].items():
        _LOGGER.debug("Adding microphone volume number for camera %s", camera_data.get("name", camera_id))
        entities.append(
            UnifiProtectMicrophoneVolumeNumber(
                coordinator=coordinator,
                camera_id=camera_id,
            )
        )

    # Add light brightness level numbers
    for light_id, light_data in coordinator.data["protect"]["lights"].items():
        _LOGGER.debug("Adding brightness level number for light %s", light_data.get("name", light_id))
        entities.append(
            UnifiProtectLightLevelNumber(
                coordinator=coordinator,
                light_id=light_id,
            )
        )

    # Add chime volume numbers
    for chime_id, chime_data in coordinator.data["protect"]["chimes"].items():
        _LOGGER.debug("Adding volume number for chime %s", chime_data.get("name", chime_id))
        entities.append(
            UnifiProtectChimeVolumeNumber(
                coordinator=coordinator,
                chime_id=chime_id,
            )
        )

        # Add repeat times number
        _LOGGER.debug("Adding repeat times number for chime %s", chime_data.get("name", chime_id))
        entities.append(
            UnifiProtectChimeRepeatTimesNumber(
                coordinator=coordinator,
                chime_id=chime_id,
            )
        )

    _LOGGER.info("Adding %d UniFi Protect number entities", len(entities))
    async_add_entities(entities)


class UnifiProtectMicrophoneVolumeNumber(UnifiProtectEntity, NumberEntity):
    """Representation of a UniFi Protect Camera Microphone Volume Number."""

    _attr_has_entity_name = True
    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_mode = NumberMode.SLIDER

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the number entity."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "microphone_volume")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set name
        self._attr_name = "Microphone Volume"

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(self._device_id, {})

        # Set value
        self._attr_native_value = camera_data.get("micVolume", 0)

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CAMERA_ID: self._device_id,
            ATTR_CAMERA_NAME: camera_data.get("name"),
            ATTR_MIC_ENABLED: camera_data.get("micEnabled", False),
        }

    async def async_set_native_value(self, value: float) -> None:
        """Set the microphone volume."""
        _LOGGER.debug("Setting microphone volume to %s for camera %s", value, self._device_id)

        try:
            await self.coordinator.protect_api.async_set_camera_mic_volume(
                camera_id=self._device_id,
                volume=int(value),
            )
            self._attr_native_value = value
            self.async_write_ha_state()
        except Exception as err:
            _LOGGER.error("Error setting microphone volume: %s", err)


class UnifiProtectLightLevelNumber(UnifiProtectEntity, NumberEntity):
    """Representation of a UniFi Protect Light Brightness Level Number."""

    _attr_has_entity_name = True
    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_mode = NumberMode.SLIDER

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        light_id: str,
    ) -> None:
        """Initialize the number entity."""
        super().__init__(coordinator, DEVICE_TYPE_LIGHT, light_id, "brightness_level")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set name
        self._attr_name = "Brightness Level"

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        light_data = self.coordinator.data["protect"]["lights"].get(self._device_id, {})

        # Set value
        self._attr_native_value = light_data.get("lightDeviceSettings", {}).get("ledLevel", 100)

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_LIGHT_ID: self._device_id,
            ATTR_LIGHT_NAME: light_data.get("name"),
            ATTR_LIGHT_LEVEL: self._attr_native_value,
        }

    async def async_set_native_value(self, value: float) -> None:
        """Set the light brightness level."""
        _LOGGER.debug("Setting light level to %s for light %s", value, self._device_id)

        try:
            await self.coordinator.protect_api.async_set_light_level(
                light_id=self._device_id,
                level=int(value),
            )
            self._attr_native_value = value
            self.async_write_ha_state()
        except Exception as err:
            _LOGGER.error("Error setting light level: %s", err)


class UnifiProtectChimeVolumeNumber(UnifiProtectEntity, NumberEntity):
    """Representation of a UniFi Protect Chime Volume Number."""

    _attr_has_entity_name = True
    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_mode = NumberMode.SLIDER
    _attr_icon = "mdi:volume-high"

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        chime_id: str,
    ) -> None:
        """Initialize the number entity."""
        super().__init__(coordinator, DEVICE_TYPE_CHIME, chime_id, "volume")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set name
        self._attr_name = "Volume"

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        chime_data = self.coordinator.data["protect"]["chimes"].get(self._device_id, {})

        # Get ring settings - use the first camera's settings or default to 80
        ring_settings = chime_data.get("ringSettings", [])
        volume = 80  # Default volume

        if ring_settings:
            # Use the first camera's settings
            volume = ring_settings[0].get("volume", 80)

        # Set value
        self._attr_native_value = volume

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CHIME_ID: self._device_id,
            ATTR_CHIME_NAME: chime_data.get("name"),
            ATTR_CHIME_VOLUME: volume,
        }

    async def async_set_native_value(self, value: float) -> None:
        """Set the chime volume level."""
        _LOGGER.debug("Setting chime volume to %s for chime %s", value, self._device_id)

        try:
            await self.coordinator.protect_api.async_set_chime_volume(
                chime_id=self._device_id,
                volume=int(value),
            )
            self._attr_native_value = value
            self.async_write_ha_state()
        except Exception as err:
            _LOGGER.error("Error setting chime volume: %s", err)


class UnifiProtectChimeRepeatTimesNumber(UnifiProtectEntity, NumberEntity):
    """Representation of a UniFi Protect Chime Repeat Times Number."""

    _attr_has_entity_name = True
    _attr_native_min_value = 1
    _attr_native_max_value = 10
    _attr_native_step = 1
    _attr_mode = NumberMode.BOX
    _attr_icon = "mdi:repeat"

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        chime_id: str,
    ) -> None:
        """Initialize the number entity."""
        super().__init__(coordinator, DEVICE_TYPE_CHIME, chime_id, "repeat_times")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set name
        self._attr_name = "Repeat Times"

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        chime_data = self.coordinator.data["protect"]["chimes"].get(self._device_id, {})

        # Get ring settings - use the first camera's settings or default to 3
        ring_settings = chime_data.get("ringSettings", [])
        repeat_times = 3  # Default repeat times

        if ring_settings:
            # Use the first camera's settings
            repeat_times = ring_settings[0].get("repeatTimes", 3)

        # Set value
        self._attr_native_value = repeat_times

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CHIME_ID: self._device_id,
            ATTR_CHIME_NAME: chime_data.get("name"),
            ATTR_CHIME_REPEAT_TIMES: repeat_times,
        }

    async def async_set_native_value(self, value: float) -> None:
        """Set the chime repeat times."""
        _LOGGER.debug("Setting chime repeat times to %s for chime %s", value, self._device_id)

        try:
            await self.coordinator.protect_api.async_set_chime_repeat_times(
                chime_id=self._device_id,
                repeat_times=int(value),
            )
            self._attr_native_value = value
            self.async_write_ha_state()
        except Exception as err:
            _LOGGER.error("Error setting chime repeat times: %s", err)
