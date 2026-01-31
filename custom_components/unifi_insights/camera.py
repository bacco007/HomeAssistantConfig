"""Support for UniFi Protect cameras."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from homeassistant.components.camera import Camera, CameraEntityFeature

from .const import (
    ATTR_CAMERA_ID,
    ATTR_CAMERA_NAME,
    ATTR_CAMERA_STATE,
    ATTR_CAMERA_TYPE,
    ATTR_IS_PACKAGE_CAMERA,
    ATTR_PARENT_CAMERA_ID,
    CAMERA_STATE_CONNECTED,
    DEVICE_TYPE_CAMERA,
)
from .entity import UnifiProtectEntity

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry
    from .coordinators import UnifiFacadeCoordinator

_LOGGER = logging.getLogger(__name__)

# Camera streaming/snapshots can be parallel
PARALLEL_UPDATES = 1


async def async_setup_entry(
    hass: HomeAssistant,
    entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up cameras for UniFi Protect integration."""
    coordinator: UnifiFacadeCoordinator = entry.runtime_data.coordinator
    _ = hass  # hass is unused but kept for HA signature

    # Skip if Protect API is not available
    if not coordinator.protect_client:
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


class UnifiProtectCamera(UnifiProtectEntity, Camera):  # type: ignore[misc]
    """Representation of a UniFi Protect Camera."""

    _attr_has_entity_name = True
    _attr_name = None

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the camera."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id)
        Camera.__init__(self)

        # Set up camera features - use CameraEntityFeature flags for proper type
        # STREAM enables streaming support for the camera
        self._attr_supported_features = CameraEntityFeature.STREAM

        # Set entity category
        self._attr_entity_category = None

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(
            self._device_id, {}
        )

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

        try:
            # Use the correct library API: cameras.get_snapshot()
            # The library supports width and height parameters
            snapshot = await self.coordinator.protect_client.cameras.get_snapshot(
                self._device_id,
                width=width or 1920,
                height=height or 1080,
            )
            return snapshot if isinstance(snapshot, bytes) else None
        except Exception:  # noqa: BLE001
            _LOGGER.debug("Error getting camera snapshot", exc_info=True)
            return None

    async def async_stream_source(self) -> str | None:
        """
        Return the stream source.

        Returns RTSPS URL for UniFi Protect cameras.
        Uses the API to create a dynamic stream URL when possible, with fallback
        to static URL construction if needed.
        """
        _LOGGER.debug("Getting stream source for %s", self._device_id)

        # Try to use the API to create a dynamic RTSPS stream (preferred method)
        if self.coordinator.protect_client:
            try:
                stream = (
                    await self.coordinator.protect_client.cameras.create_rtsps_stream(
                        self._device_id,
                        qualities=["high"],
                    )
                )
                if stream and stream.high:
                    _LOGGER.debug(
                        "Using dynamic stream URL for camera %s", self._device_id
                    )
                    stream_url: str = stream.high
                    return stream_url
            except Exception:  # noqa: BLE001
                _LOGGER.debug(
                    "Failed to create dynamic stream, falling back to static URL",
                    exc_info=True,
                )

        # Fallback: Construct static RTSPS URL
        nvr_host = None

        # Try to get from NVR data
        nvr_data = self.coordinator.data["protect"].get("nvrs", {})
        for nvr in nvr_data.values():
            if nvr.get("host"):
                nvr_host = nvr["host"]
                break

        # Fall back to configured base URL host
        if not nvr_host and self.coordinator.protect_client:
            base_url = str(self.coordinator.protect_client.base_url)
            if "://" in base_url:
                nvr_host = base_url.split("://")[1].split("/")[0].split(":")[0]

        if not nvr_host:
            _LOGGER.warning(
                "Could not determine NVR host for camera %s stream", self._device_id
            )
            return None

        # Static RTSPS URL format
        stream_url = f"rtsps://{nvr_host}:7441/{self._device_id}?enableSrtp"
        _LOGGER.debug(
            "Using static stream URL for camera %s: %s", self._device_id, stream_url
        )
        return stream_url
