"""Support for UniFi Protect select entities."""
from __future__ import annotations

import logging
from typing import Any, Final

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    ATTR_CAMERA_ID,
    ATTR_CAMERA_NAME,
    ATTR_CHIME_ID,
    ATTR_CHIME_NAME,
    ATTR_CHIME_RINGTONE_ID,
    ATTR_HDR_MODE,
    ATTR_VIDEO_MODE,
    CHIME_RINGTONE_DEFAULT,
    CHIME_RINGTONE_MECHANICAL,
    CHIME_RINGTONE_DIGITAL,
    CHIME_RINGTONE_CHRISTMAS,
    CHIME_RINGTONE_TRADITIONAL,
    CHIME_RINGTONE_CUSTOM_1,
    CHIME_RINGTONE_CUSTOM_2,
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_CHIME,
    DOMAIN,
    HDR_MODE_AUTO,
    HDR_MODE_ON,
    HDR_MODE_OFF,
    VIDEO_MODE_DEFAULT,
    VIDEO_MODE_HIGH_FPS,
    VIDEO_MODE_SPORT,
    VIDEO_MODE_SLOW_SHUTTER,
)
from .coordinator import UnifiInsightsDataUpdateCoordinator
from .entity import UnifiProtectEntity

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up select entities for UniFi Protect integration."""
    coordinator: UnifiInsightsDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]

    # Skip if Protect API is not available
    if not coordinator.protect_api:
        _LOGGER.debug("Skipping select setup - Protect API not available")
        return

    entities = []

    # Add camera HDR mode selects
    for camera_id, camera_data in coordinator.data["protect"]["cameras"].items():
        _LOGGER.debug("Adding HDR mode select for camera %s", camera_data.get("name", camera_id))
        entities.append(
            UnifiProtectHDRModeSelect(
                coordinator=coordinator,
                camera_id=camera_id,
            )
        )

        _LOGGER.debug("Adding video mode select for camera %s", camera_data.get("name", camera_id))
        entities.append(
            UnifiProtectVideoModeSelect(
                coordinator=coordinator,
                camera_id=camera_id,
            )
        )

    # Add chime ringtone selects
    for chime_id, chime_data in coordinator.data["protect"]["chimes"].items():
        _LOGGER.debug("Adding ringtone select for chime %s", chime_data.get("name", chime_id))
        entities.append(
            UnifiProtectChimeRingtoneSelect(
                coordinator=coordinator,
                chime_id=chime_id,
            )
        )

    _LOGGER.info("Adding %d UniFi Protect select entities", len(entities))
    async_add_entities(entities)


class UnifiProtectHDRModeSelect(UnifiProtectEntity, SelectEntity):
    """Representation of a UniFi Protect Camera HDR Mode Select."""

    _attr_has_entity_name = True
    _attr_options = [HDR_MODE_AUTO, HDR_MODE_ON, HDR_MODE_OFF]

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the select entity."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "hdr_mode")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set name
        self._attr_name = "HDR Mode"

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(self._device_id, {})

        # Set current option
        self._attr_current_option = camera_data.get("hdrType", HDR_MODE_AUTO)

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CAMERA_ID: self._device_id,
            ATTR_CAMERA_NAME: camera_data.get("name"),
            ATTR_HDR_MODE: self._attr_current_option,
        }

    async def async_select_option(self, option: str) -> None:
        """Change the selected option."""
        _LOGGER.debug("Setting HDR mode to %s for camera %s", option, self._device_id)

        try:
            await self.coordinator.protect_api.async_set_camera_hdr_mode(
                camera_id=self._device_id,
                mode=option,
            )
            self._attr_current_option = option
            self.async_write_ha_state()
        except Exception as err:
            _LOGGER.error("Error setting HDR mode: %s", err)


class UnifiProtectVideoModeSelect(UnifiProtectEntity, SelectEntity):
    """Representation of a UniFi Protect Camera Video Mode Select."""

    _attr_has_entity_name = True
    _attr_options = [
        VIDEO_MODE_DEFAULT,
        VIDEO_MODE_HIGH_FPS,
        VIDEO_MODE_SPORT,
        VIDEO_MODE_SLOW_SHUTTER,
    ]

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the select entity."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "video_mode")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set name
        self._attr_name = "Video Mode"

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(self._device_id, {})

        # Set current option
        self._attr_current_option = camera_data.get("videoMode", VIDEO_MODE_DEFAULT)

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CAMERA_ID: self._device_id,
            ATTR_CAMERA_NAME: camera_data.get("name"),
            ATTR_VIDEO_MODE: self._attr_current_option,
        }

    async def async_select_option(self, option: str) -> None:
        """Change the selected option."""
        _LOGGER.debug("Setting video mode to %s for camera %s", option, self._device_id)

        try:
            await self.coordinator.protect_api.async_set_camera_video_mode(
                camera_id=self._device_id,
                mode=option,
            )
            self._attr_current_option = option
            self.async_write_ha_state()
        except Exception as err:
            _LOGGER.error("Error setting video mode: %s", err)


class UnifiProtectChimeRingtoneSelect(UnifiProtectEntity, SelectEntity):
    """Representation of a UniFi Protect Chime Ringtone Select."""

    _attr_has_entity_name = True
    _attr_options = [
        CHIME_RINGTONE_DEFAULT,
        CHIME_RINGTONE_MECHANICAL,
        CHIME_RINGTONE_DIGITAL,
        CHIME_RINGTONE_CHRISTMAS,
        CHIME_RINGTONE_TRADITIONAL,
        CHIME_RINGTONE_CUSTOM_1,
        CHIME_RINGTONE_CUSTOM_2,
    ]
    _attr_icon = "mdi:bell-ring"

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        chime_id: str,
    ) -> None:
        """Initialize the select entity."""
        super().__init__(coordinator, DEVICE_TYPE_CHIME, chime_id, "ringtone")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set name
        self._attr_name = "Ringtone"

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        chime_data = self.coordinator.data["protect"]["chimes"].get(self._device_id, {})

        # Get ring settings - use the first camera's settings or default
        ring_settings = chime_data.get("ringSettings", [])
        ringtone_id = CHIME_RINGTONE_DEFAULT  # Default ringtone

        if ring_settings:
            # Use the first camera's settings
            ringtone_id = ring_settings[0].get("ringtoneId", CHIME_RINGTONE_DEFAULT)

        # Set current option
        self._attr_current_option = ringtone_id

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CHIME_ID: self._device_id,
            ATTR_CHIME_NAME: chime_data.get("name"),
            ATTR_CHIME_RINGTONE_ID: ringtone_id,
        }

    async def async_select_option(self, option: str) -> None:
        """Change the selected option."""
        _LOGGER.debug("Setting ringtone to %s for chime %s", option, self._device_id)

        try:
            await self.coordinator.protect_api.async_set_chime_ringtone(
                chime_id=self._device_id,
                ringtone_id=option,
            )
            self._attr_current_option = option
            self.async_write_ha_state()
        except Exception as err:
            _LOGGER.error("Error setting ringtone: %s", err)
