"""Support for UniFi Protect events."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any, ClassVar

from homeassistant.components.event import (
    EventDeviceClass,
    EventEntity,
)
from homeassistant.core import callback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    DOMAIN,
    MANUFACTURER,
    SMART_DETECT_ANIMAL,
    SMART_DETECT_PACKAGE,
    SMART_DETECT_PERSON,
    SMART_DETECT_VEHICLE,
)
from .entity import get_field

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry
    from .coordinators import UnifiFacadeCoordinator

_LOGGER = logging.getLogger(__name__)

# Coordinator handles updates
PARALLEL_UPDATES = 0

# Event types
EVENT_TYPE_DOORBELL_RING = "ring"
EVENT_TYPE_MOTION = "motion"
EVENT_TYPE_SMART_DETECT_PERSON = "person_detected"
EVENT_TYPE_SMART_DETECT_VEHICLE = "vehicle_detected"
EVENT_TYPE_SMART_DETECT_ANIMAL = "animal_detected"
EVENT_TYPE_SMART_DETECT_PACKAGE = "package_detected"
EVENT_TYPE_SENSOR_OPEN = "opened"
EVENT_TYPE_SENSOR_CLOSE = "closed"


async def async_setup_entry(
    hass: HomeAssistant,  # noqa: ARG001
    entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up event entities for UniFi Insights integration."""
    coordinator = entry.runtime_data.coordinator

    # Skip if Protect API is not available
    if not coordinator.protect_client:
        return

    entities: list[
        UnifiProtectDoorbellEventEntity
        | UnifiProtectSmartDetectEventEntity
        | UnifiProtectSensorEventEntity
    ] = []

    # Get cameras data
    cameras = coordinator.data["protect"].get("cameras", {})

    # Add doorbell event entities for cameras with doorbell feature
    for camera_id, camera_data in cameras.items():
        # Check if doorbell camera
        if _is_doorbell_camera(camera_data):
            entities.append(
                UnifiProtectDoorbellEventEntity(
                    coordinator=coordinator,
                    device_id=camera_id,
                )
            )

        # Add smart detection event entity for all cameras
        smart_detect_types = camera_data.get("smartDetectTypes", [])
        if smart_detect_types:
            entities.append(
                UnifiProtectSmartDetectEventEntity(
                    coordinator=coordinator,
                    device_id=camera_id,
                )
            )

    # Add sensor open/close event entities
    entities.extend(
        UnifiProtectSensorEventEntity(
            coordinator=coordinator,
            device_id=sensor_id,
        )
        for sensor_id in coordinator.data["protect"].get("sensors", {})
    )

    async_add_entities(entities)


def _is_doorbell_camera(camera_data: dict[str, Any]) -> bool:
    """Check if a camera is a doorbell camera."""
    # Check camera type metadata
    camera_type = camera_data.get("_camera_type") or ""
    if "doorbell" in camera_type.lower():
        return True

    # Check API type field
    api_camera_type = (camera_data.get("type") or "").lower()
    if "doorbell" in api_camera_type:
        return True

    # Check name for doorbell indicators
    camera_name = (camera_data.get("name") or "").lower()
    return "doorbell" in camera_name


class UnifiProtectDoorbellEventEntity(
    CoordinatorEntity["UnifiFacadeCoordinator"],  # type: ignore[misc]
    EventEntity,  # type: ignore[misc]
):
    """Event entity for UniFi Protect doorbell ring events."""

    _attr_has_entity_name = True
    _attr_device_class = EventDeviceClass.DOORBELL
    _attr_event_types: ClassVar[list[str]] = [EVENT_TYPE_DOORBELL_RING]

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        device_id: str,
    ) -> None:
        """Initialize the event entity."""
        super().__init__(coordinator)
        self._device_id = device_id
        self._last_ring_start: int | None = None

        camera_data = coordinator.data["protect"]["cameras"].get(device_id, {})
        camera_name = camera_data.get("name", f"Camera {device_id}")

        self._attr_unique_id = f"{DOMAIN}_camera_{device_id}_doorbell_event"
        self._attr_name = "Doorbell"

        # Set device info
        self._attr_device_info = {
            "identifiers": {(DOMAIN, f"protect_camera_{device_id}")},
            "name": camera_name,
            "manufacturer": MANUFACTURER,
            "model": camera_data.get("type", "UniFi Camera"),
        }

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(self._device_id)
        if not camera_data:
            return False
        return bool(camera_data.get("state") == "CONNECTED")

    @callback  # type: ignore[misc]
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(
            self._device_id, {}
        )

        # Check for new ring event
        ring_start = camera_data.get("lastRingStart")
        ring_end = camera_data.get("lastRingEnd")

        # Fire event if new ring detected (ring_start changed and ring_end is None)
        if (
            ring_start is not None
            and ring_start != self._last_ring_start
            and ring_end is None
        ):
            self._last_ring_start = ring_start
            self._trigger_event(
                EVENT_TYPE_DOORBELL_RING,
                {"camera_id": self._device_id},
            )

        self.async_write_ha_state()


class UnifiProtectSmartDetectEventEntity(
    CoordinatorEntity["UnifiFacadeCoordinator"],  # type: ignore[misc]
    EventEntity,  # type: ignore[misc]
):
    """Event entity for UniFi Protect smart detection events."""

    _attr_has_entity_name = True
    _attr_device_class = EventDeviceClass.MOTION
    _attr_event_types: ClassVar[list[str]] = [
        EVENT_TYPE_MOTION,
        EVENT_TYPE_SMART_DETECT_PERSON,
        EVENT_TYPE_SMART_DETECT_VEHICLE,
        EVENT_TYPE_SMART_DETECT_ANIMAL,
        EVENT_TYPE_SMART_DETECT_PACKAGE,
    ]

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        device_id: str,
    ) -> None:
        """Initialize the event entity."""
        super().__init__(coordinator)
        self._device_id = device_id
        self._last_motion_start: int | None = None
        self._last_smart_detect_types: list[str] = []

        camera_data = coordinator.data["protect"]["cameras"].get(device_id, {})
        camera_name = camera_data.get("name", f"Camera {device_id}")

        self._attr_unique_id = f"{DOMAIN}_camera_{device_id}_smart_detect_event"
        self._attr_name = "Smart Detection"

        # Set device info
        self._attr_device_info = {
            "identifiers": {(DOMAIN, f"protect_camera_{device_id}")},
            "name": camera_name,
            "manufacturer": MANUFACTURER,
            "model": camera_data.get("type", "UniFi Camera"),
        }

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(self._device_id)
        if not camera_data:
            return False
        return bool(camera_data.get("state") == "CONNECTED")

    @callback  # type: ignore[misc]
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(
            self._device_id, {}
        )

        # Check for new motion/smart detect event
        motion_start = camera_data.get("lastMotionStart")
        motion_end = camera_data.get("lastMotionEnd")
        smart_detect_types = camera_data.get("lastSmartDetectTypes", [])

        # Fire event if new motion detected
        if (
            motion_start is not None
            and motion_start != self._last_motion_start
            and motion_end is None
        ):
            self._last_motion_start = motion_start
            self._last_smart_detect_types = smart_detect_types

            # Determine event type based on smart detect types
            event_data: dict[str, Any] = {"camera_id": self._device_id}

            if SMART_DETECT_PERSON in smart_detect_types:
                self._trigger_event(EVENT_TYPE_SMART_DETECT_PERSON, event_data)
            elif SMART_DETECT_VEHICLE in smart_detect_types:
                self._trigger_event(EVENT_TYPE_SMART_DETECT_VEHICLE, event_data)
            elif SMART_DETECT_ANIMAL in smart_detect_types:
                self._trigger_event(EVENT_TYPE_SMART_DETECT_ANIMAL, event_data)
            elif SMART_DETECT_PACKAGE in smart_detect_types:
                self._trigger_event(EVENT_TYPE_SMART_DETECT_PACKAGE, event_data)
            else:
                # Generic motion
                self._trigger_event(EVENT_TYPE_MOTION, event_data)

        self.async_write_ha_state()


class UnifiProtectSensorEventEntity(
    CoordinatorEntity["UnifiFacadeCoordinator"],  # type: ignore[misc]
    EventEntity,  # type: ignore[misc]
):
    """Event entity for UniFi Protect sensor open/close events."""

    _attr_has_entity_name = True
    _attr_event_types: ClassVar[list[str]] = [
        EVENT_TYPE_SENSOR_OPEN,
        EVENT_TYPE_SENSOR_CLOSE,
    ]

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        device_id: str,
    ) -> None:
        """Initialize the event entity."""
        super().__init__(coordinator)
        self._device_id = device_id
        self._last_open_status_changed_at: int | None = None
        self._last_is_opened: bool | None = None

        sensor_data = coordinator.data["protect"]["sensors"].get(device_id, {})
        sensor_name = sensor_data.get("name", f"Sensor {device_id}")

        self._attr_unique_id = f"{DOMAIN}_sensor_{device_id}_event"
        self._attr_name = "Door/Window"

        # Set device info
        self._attr_device_info = {
            "identifiers": {(DOMAIN, f"protect_sensor_{device_id}")},
            "name": sensor_name,
            "manufacturer": MANUFACTURER,
            "model": sensor_data.get("type", "UniFi Sensor"),
        }

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        sensor_data = self.coordinator.data["protect"]["sensors"].get(self._device_id)
        if not sensor_data:
            return False
        return bool(sensor_data.get("state") == "CONNECTED")

    @callback  # type: ignore[misc]
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        sensor_data = self.coordinator.data["protect"]["sensors"].get(
            self._device_id, {}
        )

        # Check for open/close status change
        open_status_changed_at = get_field(
            sensor_data, "openStatusChangedAt", "open_status_changed_at"
        )
        is_opened = get_field(
            sensor_data, "isOpened", "is_opened", "opened", default=False
        )

        # Fire event if status changed
        if (
            open_status_changed_at is not None
            and open_status_changed_at != self._last_open_status_changed_at
        ):
            self._last_open_status_changed_at = open_status_changed_at
            self._last_is_opened = is_opened

            if is_opened:
                event_type = EVENT_TYPE_SENSOR_OPEN
            else:
                event_type = EVENT_TYPE_SENSOR_CLOSE

            self._trigger_event(
                event_type,
                {"sensor_id": self._device_id},
            )

        self.async_write_ha_state()
