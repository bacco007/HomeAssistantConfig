"""Support for UniFi Protect cameras."""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Final

from homeassistant.components.camera import Camera, CameraEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    ATTR_CAMERA_ID,
    ATTR_CAMERA_NAME,
    ATTR_CAMERA_STATE,
    ATTR_CAMERA_TYPE,
    ATTR_IS_PACKAGE_CAMERA,
    ATTR_PARENT_CAMERA_ID,
    CAMERA_STATE_CONNECTED,
    CAMERA_TYPE_DOORBELL_MAIN,
    CAMERA_TYPE_DOORBELL_PACKAGE,
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
    """Set up cameras for UniFi Protect integration."""
    coordinator: UnifiInsightsDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]

    # Skip if Protect API is not available
    if not coordinator.protect_api:
        _LOGGER.debug("Skipping camera setup - Protect API not available")
        return

    entities = []

    # Add cameras
    for camera_id, camera_data in coordinator.data["protect"]["cameras"].items():
        _LOGGER.debug("Adding camera entity for %s", camera_data.get("name", camera_id))
        entities.append(
            UnifiProtectCamera(
                coordinator=coordinator,
                camera_id=camera_id,
            )
        )

    _LOGGER.info("Adding %d UniFi Protect cameras", len(entities))
    async_add_entities(entities)


class UnifiProtectCamera(UnifiProtectEntity, Camera):
    """Representation of a UniFi Protect Camera."""

    _attr_has_entity_name = True
    _attr_name = None

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the camera."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id)
        Camera.__init__(self)

        # Set up camera features
        self._attr_supported_features = CameraEntityFeature.STREAM

        # Set entity category
        self._attr_entity_category = None

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(self._device_id, {})

        # Set availability
        self._attr_available = camera_data.get("state") == CAMERA_STATE_CONNECTED

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CAMERA_ID: self._device_id,
            ATTR_CAMERA_NAME: camera_data.get("name"),
            ATTR_CAMERA_STATE: camera_data.get("state"),
            ATTR_CAMERA_TYPE: camera_data.get("_camera_type", "regular"),
            ATTR_IS_PACKAGE_CAMERA: camera_data.get("_is_package_camera", False),
            ATTR_PARENT_CAMERA_ID: camera_data.get("_parent_camera_id"),
        }

    async def async_camera_image(
        self, width: int | None = None, height: int | None = None
    ) -> bytes | None:
        """Return a still image from the camera."""
        _LOGGER.debug("Getting camera image for %s", self._device_id)

        # First try with standard quality
        try:
            return await self.coordinator.protect_api.async_get_camera_snapshot(
                camera_id=self._device_id,
                high_quality=False,
            )
        except Exception as err:
            # If standard quality fails, log the error but don't return yet
            _LOGGER.debug("Error getting standard quality camera image: %s", err)

            # Check if the camera supports high quality snapshots
            camera_data = self.coordinator.data["protect"]["cameras"].get(self._device_id, {})
            feature_flags = camera_data.get("featureFlags", {})
            supports_full_hd = feature_flags.get("supportFullHdSnapshot", False)

            if supports_full_hd:
                # Try with high quality if supported
                try:
                    return await self.coordinator.protect_api.async_get_camera_snapshot(
                        camera_id=self._device_id,
                        high_quality=True,
                    )
                except Exception as high_err:
                    _LOGGER.error("Error getting high quality camera image: %s", high_err)
            else:
                _LOGGER.debug("Camera %s does not support full HD snapshots", self._device_id)

            # If we get here, both attempts failed or high quality is not supported
            return None

    async def async_stream_source(self) -> str | None:
        """Return the stream source."""
        _LOGGER.debug("Getting stream source for %s", self._device_id)

        try:
            # Get RTSPS stream URL
            stream_data = await self.coordinator.protect_api.async_get_camera_rtsps_stream(
                camera_id=self._device_id,
                qualities=["high"],
            )

            # Return high quality stream URL
            return stream_data.get("high")
        except Exception as err:
            _LOGGER.error("Error getting stream source: %s", err)
            return None
