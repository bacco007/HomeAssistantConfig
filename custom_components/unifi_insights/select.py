"""Support for UniFi Protect select entities."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, ClassVar

from homeassistant.components.select import SelectEntity
from homeassistant.helpers.entity import EntityCategory

from .const import (
    ATTR_CAMERA_ID,
    ATTR_CAMERA_NAME,
    ATTR_CHIME_ID,
    ATTR_CHIME_NAME,
    ATTR_CHIME_RINGTONE_ID,
    ATTR_HDR_MODE,
    ATTR_VIDEO_MODE,
    ATTR_VIEWER_ID,
    ATTR_VIEWER_NAME,
    CHIME_RINGTONE_CHRISTMAS,
    CHIME_RINGTONE_CUSTOM_1,
    CHIME_RINGTONE_CUSTOM_2,
    CHIME_RINGTONE_DEFAULT,
    CHIME_RINGTONE_DIGITAL,
    CHIME_RINGTONE_MECHANICAL,
    CHIME_RINGTONE_TRADITIONAL,
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_CHIME,
    DEVICE_TYPE_VIEWER,
    HDR_MODE_AUTO,
    HDR_MODE_OFF,
    HDR_MODE_ON,
    VIDEO_MODE_DEFAULT,
    VIDEO_MODE_HIGH_FPS,
    VIDEO_MODE_SLOW_SHUTTER,
    VIDEO_MODE_SPORT,
)
from .entity import UnifiProtectEntity

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry
    from .coordinators import UnifiFacadeCoordinator

_LOGGER = logging.getLogger(__name__)

# Select entities are action-based, allow parallel execution
PARALLEL_UPDATES = 1


async def async_setup_entry(
    hass: HomeAssistant,
    entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up select entities for UniFi Protect integration."""
    _ = hass
    coordinator: UnifiFacadeCoordinator = entry.runtime_data.coordinator

    # Skip if Protect API is not available
    if not coordinator.protect_client:
        _LOGGER.debug("Skipping select setup - Protect API not available")
        return

    entities = []

    # Add camera HDR mode selects
    for camera_id, camera_data in coordinator.data["protect"]["cameras"].items():
        _LOGGER.debug(
            "Adding HDR mode select for camera %s", camera_data.get("name", camera_id)
        )
        entities.append(
            UnifiProtectHDRModeSelect(
                coordinator=coordinator,
                camera_id=camera_id,
            )
        )

        _LOGGER.debug(
            "Adding video mode select for camera %s", camera_data.get("name", camera_id)
        )
        entities.append(
            UnifiProtectVideoModeSelect(
                coordinator=coordinator,
                camera_id=camera_id,
            )
        )

    # Add chime ringtone selects
    for chime_id, chime_data in coordinator.data["protect"]["chimes"].items():
        _LOGGER.debug(
            "Adding ringtone select for chime %s", chime_data.get("name", chime_id)
        )
        entities.append(
            UnifiProtectChimeRingtoneSelect(
                coordinator=coordinator,
                chime_id=chime_id,
            )
        )

    # Add PTZ preset selects for cameras with PTZ support
    for camera_id, camera_data in coordinator.data["protect"]["cameras"].items():
        if camera_data.get("hasPtz", False):
            _LOGGER.debug(
                "Adding PTZ preset select for camera %s",
                camera_data.get("name", camera_id),
            )
            entities.append(
                UnifiProtectPTZPresetSelect(
                    coordinator=coordinator,
                    camera_id=camera_id,
                )
            )

    # Add liveview selects for viewers
    for viewer_id, viewer_data in coordinator.data["protect"]["viewers"].items():
        _LOGGER.debug(
            "Adding liveview select for viewer %s", viewer_data.get("name", viewer_id)
        )
        entities.append(
            UnifiProtectViewerLiveviewSelect(
                coordinator=coordinator,
                viewer_id=viewer_id,
            )
        )

    _LOGGER.info("Adding %d UniFi Protect select entities", len(entities))
    async_add_entities(entities)


class UnifiProtectHDRModeSelect(UnifiProtectEntity, SelectEntity):  # type: ignore[misc]
    """Representation of a UniFi Protect Camera HDR Mode Select."""

    _attr_has_entity_name = True
    _attr_options: ClassVar[list[str]] = [HDR_MODE_AUTO, HDR_MODE_ON, HDR_MODE_OFF]

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
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
        camera_data = self.coordinator.data["protect"]["cameras"].get(
            self._device_id, {}
        )

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
            await self.coordinator.protect_client.set_hdr_mode(
                camera_id=self._device_id,
                mode=option,
            )
            self._attr_current_option = option
            self.async_write_ha_state()
        except Exception:
            _LOGGER.exception("Error setting HDR mode")


class UnifiProtectVideoModeSelect(UnifiProtectEntity, SelectEntity):  # type: ignore[misc]
    """Representation of a UniFi Protect Camera Video Mode Select."""

    _attr_has_entity_name = True
    _attr_options: ClassVar[list[str]] = [
        VIDEO_MODE_DEFAULT,
        VIDEO_MODE_HIGH_FPS,
        VIDEO_MODE_SPORT,
        VIDEO_MODE_SLOW_SHUTTER,
    ]

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
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
        camera_data = self.coordinator.data["protect"]["cameras"].get(
            self._device_id, {}
        )

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
            await self.coordinator.protect_client.set_video_mode(
                camera_id=self._device_id,
                mode=option,
            )
            self._attr_current_option = option
            self.async_write_ha_state()
        except Exception:
            _LOGGER.exception("Error setting video mode")


class UnifiProtectChimeRingtoneSelect(UnifiProtectEntity, SelectEntity):  # type: ignore[misc]
    """Representation of a UniFi Protect Chime Ringtone Select."""

    _attr_has_entity_name = True
    _attr_options: ClassVar[list[str]] = [
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
        coordinator: UnifiFacadeCoordinator,
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
            await self.coordinator.protect_client.set_chime_ringtone(
                chime_id=self._device_id,
                ringtone_id=option,
            )
            self._attr_current_option = option
            self.async_write_ha_state()
        except Exception:
            _LOGGER.exception("Error setting ringtone")


class UnifiProtectPTZPresetSelect(UnifiProtectEntity, SelectEntity):  # type: ignore[misc]
    """Representation of a UniFi Protect Camera PTZ Preset Select."""

    _attr_has_entity_name = True
    _attr_options: ClassVar[list[str]] = ["0", "1", "2", "3", "4"]
    _attr_icon = "mdi:camera-control"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the select entity."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "ptz_preset")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set name
        self._attr_name = "PTZ Preset"

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(
            self._device_id, {}
        )

        # Set current option
        current_preset = camera_data.get("currentPtzPreset", 0)
        self._attr_current_option = str(current_preset)

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CAMERA_ID: self._device_id,
            ATTR_CAMERA_NAME: camera_data.get("name"),
            "current_preset": current_preset,
        }

    async def async_select_option(self, option: str) -> None:
        """Change the selected option."""
        _LOGGER.debug("Setting PTZ preset to %s for camera %s", option, self._device_id)

        try:
            slot = int(option)
            await self.coordinator.protect_client.ptz_move_to_preset(
                camera_id=self._device_id,
                slot=slot,
            )
            self._attr_current_option = option
            self.async_write_ha_state()
        except Exception:
            _LOGGER.exception("Error setting PTZ preset")


class UnifiProtectViewerLiveviewSelect(UnifiProtectEntity, SelectEntity):  # type: ignore[misc]
    """Representation of a UniFi Protect Viewer Liveview Select."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:monitor-multiple"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        viewer_id: str,
    ) -> None:
        """Initialize the select entity."""
        super().__init__(coordinator, DEVICE_TYPE_VIEWER, viewer_id, "liveview")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set name
        self._attr_name = "Liveview"

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        viewer_data = self.coordinator.data["protect"]["viewers"].get(
            self._device_id, {}
        )
        liveviews = self.coordinator.data["protect"]["liveviews"]

        # Set options from available liveviews
        self._attr_options = [lv.get("name", lv_id) for lv_id, lv in liveviews.items()]

        # Set current option
        liveview_id = viewer_data.get("liveview")
        if liveview_id and liveview_id in liveviews:
            self._attr_current_option = liveviews[liveview_id].get("name", liveview_id)
        else:
            self._attr_current_option = None

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_VIEWER_ID: self._device_id,
            ATTR_VIEWER_NAME: viewer_data.get("name"),
            "liveview_id": liveview_id,
        }

    async def async_select_option(self, option: str) -> None:
        """Change the selected option."""
        _LOGGER.debug("Setting liveview to %s for viewer %s", option, self._device_id)

        try:
            # Find liveview ID by name
            liveviews = self.coordinator.data["protect"]["liveviews"]
            liveview_id = None
            for lv_id, lv in liveviews.items():
                if lv.get("name") == option:
                    liveview_id = lv_id
                    break

            if liveview_id:
                await self.coordinator.protect_client.update_viewer(
                    viewer_id=self._device_id,
                    data={"liveview": liveview_id},
                )
                self._attr_current_option = option
                self.async_write_ha_state()
            else:
                _LOGGER.error("Liveview not found: %s", option)
        except Exception:
            _LOGGER.exception("Error setting liveview")
