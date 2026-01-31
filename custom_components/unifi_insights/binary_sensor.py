"""Support for UniFi Insights binary sensors."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from collections.abc import Callable

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.helpers.entity import EntityCategory

from .const import (
    ATTR_CAMERA_ID,
    ATTR_CAMERA_NAME,
    ATTR_LAST_MOTION,
    ATTR_SENSOR_ID,
    ATTR_SENSOR_IS_OPENED,
    ATTR_SENSOR_LEAK_DETECTED,
    ATTR_SENSOR_LEAK_DETECTED_AT,
    ATTR_SENSOR_MOTION_DETECTED,
    ATTR_SENSOR_MOTION_DETECTED_AT,
    ATTR_SENSOR_NAME,
    ATTR_SENSOR_OPEN_STATUS_CHANGED_AT,
    ATTR_SENSOR_TAMPER_DETECTED,
    ATTR_SENSOR_TAMPER_DETECTED_AT,
    CAMERA_TYPE_DOORBELL,
    CAMERA_TYPE_DOORBELL_MAIN,
    CAMERA_TYPE_DOORBELL_PACKAGE,
    CAMERA_TYPE_DOORBELL_WITH_PACKAGE_DETECTION,
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_SENSOR,
    SMART_DETECT_ANIMAL,
    SMART_DETECT_PACKAGE,
    SMART_DETECT_PERSON,
    SMART_DETECT_VEHICLE,
)
from .entity import UnifiInsightsEntity, UnifiProtectEntity, get_field, is_device_online

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry
    from .coordinators import UnifiFacadeCoordinator

_LOGGER = logging.getLogger(__name__)

# Coordinator handles updates centrally (Gold/Platinum requirement)
PARALLEL_UPDATES = 0


def _get_supported_smart_detect_types(camera_data: dict[str, Any]) -> list[str]:
    """
    Get supported smart detection types for a camera.

    The supported types are in featureFlags.smartDetectTypes, not smartDetectTypes.
    """
    feature_flags = camera_data.get("featureFlags", {})
    if isinstance(feature_flags, dict):
        result: list[str] = feature_flags.get("smartDetectTypes", [])
        return result
    return []


def _is_smart_detect_active(camera_data: dict[str, Any], detect_type: str) -> bool:
    """
    Check if a specific smart detection type is currently active.

    For smart detection to be active:
    1. The camera must support this smart detect type (in featureFlags)
    2. Motion must be currently detected (isMotionDetected or via lastMotionStart/End)
    3. Smart detection must be active (isSmartDetected or via lastSmartDetectTypes)
    4. The specific type must be in the last detected types
    """
    # Check if camera supports this detect type
    supported_types = _get_supported_smart_detect_types(camera_data)
    if detect_type not in supported_types:
        return False

    # Check if motion is currently detected
    is_motion = camera_data.get("isMotionDetected", False)
    if not is_motion:
        # Fallback to event-based detection
        motion_start = camera_data.get("lastMotionStart")
        motion_end = camera_data.get("lastMotionEnd")
        is_motion = motion_start is not None and motion_end is None

    if not is_motion:
        return False

    # Check if smart detection is active and matches the type
    is_smart = camera_data.get("isSmartDetected", False)
    if is_smart:
        # When isSmartDetected is True, check lastSmartDetectTypes for specific type
        last_types = camera_data.get("lastSmartDetectTypes", [])
        return detect_type in last_types

    # Fallback to just checking lastSmartDetectTypes
    last_types = camera_data.get("lastSmartDetectTypes", [])
    return detect_type in last_types


def _is_doorbell_camera(camera_data: dict[str, Any]) -> bool:
    """Check if a camera is a doorbell camera."""
    # Check camera type metadata set by the API client
    camera_type = camera_data.get("_camera_type") or ""
    if camera_type in [
        CAMERA_TYPE_DOORBELL,
        CAMERA_TYPE_DOORBELL_WITH_PACKAGE_DETECTION,
        CAMERA_TYPE_DOORBELL_MAIN,
        CAMERA_TYPE_DOORBELL_PACKAGE,
    ]:
        return True

    # Fallback: Check camera type field from API (handle None safely)
    api_camera_type = (camera_data.get("type") or "").lower()
    if any(
        doorbell_type in api_camera_type
        for doorbell_type in [
            "doorbell",
            "g4-doorbell",
            "ai-doorbell",
            "g4doorbell",
            "aidoorbell",
        ]
    ):
        return True

    # Fallback: Check camera name for doorbell indicators
    camera_name = (camera_data.get("name") or "").lower()
    return bool(
        any(
            doorbell_name in camera_name
            for doorbell_name in ["doorbell", "door bell", "front door", "entrance"]
        )
    )


@dataclass
class UnifiInsightsBinarySensorEntityDescription(BinarySensorEntityDescription):  # type: ignore[misc]
    """Class describing UniFi Insights binary sensor entities."""

    value_fn: Callable[[dict[str, Any]], bool] | None = None
    device_type: str | None = None
    entity_type: str = "device"  # "device" or "protect"


BINARY_SENSOR_TYPES: tuple[UnifiInsightsBinarySensorEntityDescription, ...] = (
    # Network device status
    UnifiInsightsBinarySensorEntityDescription(
        key="device_status",
        translation_key="device_status",
        name="Device Status",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda device: is_device_online(device),
        entity_type="device",
    ),
    # WAN status (gateway devices only)
    UnifiInsightsBinarySensorEntityDescription(
        key="wan_status",
        translation_key="wan_status",
        name="WAN Status",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        entity_category=EntityCategory.DIAGNOSTIC,
        icon="mdi:wan",
        value_fn=lambda device: is_device_online(device),
        entity_type="device",
    ),
    # Camera motion detection - uses isMotionDetected from API
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_motion",
        translation_key="camera_motion",
        name="Motion Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: (
            device.get("isMotionDetected", False)
            or (
                device.get("lastMotionStart") is not None
                and device.get("lastMotionEnd") is None
            )
        ),
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),
    # Camera person detection - uses helper to check feature flags and active detection
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_person_detection",
        translation_key="camera_person_detection",
        name="Person Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: _is_smart_detect_active(device, SMART_DETECT_PERSON),
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),
    # Camera vehicle detection
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_vehicle_detection",
        translation_key="camera_vehicle_detection",
        name="Vehicle Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: _is_smart_detect_active(device, SMART_DETECT_VEHICLE),
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),
    # Camera animal detection
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_animal_detection",
        translation_key="camera_animal_detection",
        name="Animal Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: _is_smart_detect_active(device, SMART_DETECT_ANIMAL),
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),
    # Camera package detection
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_package_detection",
        translation_key="camera_package_detection",
        name="Package Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: _is_smart_detect_active(device, SMART_DETECT_PACKAGE),
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),
    # Camera doorbell ring
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_doorbell_ring",
        translation_key="camera_doorbell_ring",
        name="Ring",
        device_class=BinarySensorDeviceClass.OCCUPANCY,
        value_fn=lambda device: (
            device.get("lastRingStart") is not None
            and device.get("lastRingEnd") is None
        ),
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),
    # Sensor motion detection
    UnifiInsightsBinarySensorEntityDescription(
        key="sensor_motion",
        translation_key="sensor_motion",
        name="Motion Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: get_field(
            device,
            "isMotionDetected",
            "is_motion_detected",
            "motion_detected",
            default=False,
        ),
        device_type=DEVICE_TYPE_SENSOR,
        entity_type="protect",
    ),
    # Sensor door/window status
    UnifiInsightsBinarySensorEntityDescription(
        key="sensor_door",
        translation_key="sensor_door",
        name="Door/Window Status",
        device_class=BinarySensorDeviceClass.DOOR,
        value_fn=lambda device: get_field(
            device, "isOpened", "is_opened", "opened", default=False
        ),
        device_type=DEVICE_TYPE_SENSOR,
        entity_type="protect",
    ),
    # Sensor tamper detection
    UnifiInsightsBinarySensorEntityDescription(
        key="sensor_tamper",
        translation_key="sensor_tamper",
        name="Tamper Detection",
        device_class=BinarySensorDeviceClass.TAMPER,
        value_fn=lambda device: get_field(
            device,
            "isTamperingDetected",
            "is_tampering_detected",
            "tampering_detected",
            default=False,
        ),
        device_type=DEVICE_TYPE_SENSOR,
        entity_type="protect",
    ),
    # Sensor leak detection (for water leak sensors)
    UnifiInsightsBinarySensorEntityDescription(
        key="sensor_leak",
        translation_key="sensor_leak",
        name="Leak Detection",
        device_class=BinarySensorDeviceClass.MOISTURE,
        value_fn=lambda device: get_field(
            device,
            "isLeakDetected",
            "is_leak_detected",
            "leak_detected",
            default=False,
        ),
        device_type=DEVICE_TYPE_SENSOR,
        entity_type="protect",
    ),
)


async def async_setup_entry(  # noqa: PLR0912
    hass: HomeAssistant,
    config_entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up binary sensors for UniFi Insights integration."""
    _ = hass
    coordinator: UnifiFacadeCoordinator = config_entry.runtime_data.coordinator
    entities = []

    _LOGGER.debug("Setting up binary sensors for UniFi Insights")

    # Add binary sensors for each device in each site
    for site_id, devices in coordinator.data["devices"].items():
        site_data = coordinator.get_site(site_id)
        site_name = (
            site_data.get("meta", {}).get("name", site_id) if site_data else site_id
        )

        _LOGGER.debug(
            "Processing site %s (%s) with %d devices", site_id, site_name, len(devices)
        )

        for device_id in devices:
            device_data = (
                coordinator.data.get("devices", {}).get(site_id, {}).get(device_id, {})
            )
            device_name = device_data.get("name", device_id)

            _LOGGER.debug(
                "Creating binary sensors for device %s (%s) in site %s (%s)",
                device_id,
                device_name,
                site_id,
                site_name,
            )

            for description in BINARY_SENSOR_TYPES:
                if description.entity_type == "device":
                    # Skip WAN status sensor for non-gateway devices
                    if description.key == "wan_status" and not device_data.get(
                        "model", ""
                    ).startswith("UDM"):
                        _LOGGER.debug(
                            "Skipping WAN status sensor for non-gateway device %s (%s)",
                            device_id,
                            device_name,
                        )
                        continue

                    entities.append(
                        UnifiInsightsBinarySensor(
                            coordinator=coordinator,
                            description=description,
                            site_id=site_id,
                            device_id=device_id,
                        )
                    )

    # Add binary sensors for Protect devices
    if coordinator.protect_client:
        # Add camera binary sensors
        for camera_id, camera_data in coordinator.data["protect"]["cameras"].items():
            camera_name = camera_data.get("name", camera_id)

            _LOGGER.debug(
                "Creating binary sensors for camera %s (%s)", camera_id, camera_name
            )

            for description in BINARY_SENSOR_TYPES:
                if (
                    description.entity_type == "protect"
                    and description.device_type == DEVICE_TYPE_CAMERA
                ):
                    # Skip package detection and doorbell ring for non-doorbell cameras
                    if description.key in [
                        "camera_package_detection",
                        "camera_doorbell_ring",
                    ] and not _is_doorbell_camera(camera_data):
                        _LOGGER.debug(
                            "Skipping %s sensor for non-doorbell camera %s (%s)",
                            description.key,
                            camera_id,
                            camera_name,
                        )
                        continue

                    entities.append(
                        UnifiProtectBinarySensor(
                            coordinator=coordinator,
                            description=description,
                            device_id=camera_id,
                        )
                    )

        # Add sensor binary sensors
        for sensor_id, sensor_data in coordinator.data["protect"]["sensors"].items():
            sensor_name = sensor_data.get("name", sensor_id)

            _LOGGER.debug(
                "Creating binary sensors for sensor %s (%s)", sensor_id, sensor_name
            )

            for description in BINARY_SENSOR_TYPES:
                if (
                    description.entity_type == "protect"
                    and description.device_type == DEVICE_TYPE_SENSOR
                ):
                    entities.append(  # noqa: PERF401
                        UnifiProtectBinarySensor(
                            coordinator=coordinator,
                            description=description,
                            device_id=sensor_id,
                        )
                    )

    _LOGGER.info("Adding %d UniFi Insights binary sensors", len(entities))
    async_add_entities(entities)


class UnifiInsightsBinarySensor(UnifiInsightsEntity, BinarySensorEntity):  # type: ignore[misc]
    """Representation of a UniFi Insights Binary Sensor."""

    entity_description: UnifiInsightsBinarySensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        description: UnifiInsightsBinarySensorEntityDescription,
        site_id: str,
        device_id: str,
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator, description, site_id, device_id)

        _LOGGER.debug(
            "Initializing binary sensor %s for device %s in site %s",
            description.key,
            device_id,
            site_id,
        )

        # Mark binary sensors as "Diagnostic" entities
        self._attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def is_on(self) -> bool | None:
        """Return true if the binary sensor is on."""
        if (
            not self.coordinator.data["devices"]
            .get(self._site_id, {})
            .get(self._device_id)
        ):
            _LOGGER.debug(
                "No device data for binary sensor %s (device %s in site %s)",
                self.entity_description.key,
                self._device_id,
                self._site_id,
            )
            return None

        device = self.coordinator.data["devices"][self._site_id][self._device_id]
        return self.entity_description.value_fn(device)


class UnifiProtectBinarySensor(UnifiProtectEntity, BinarySensorEntity):  # type: ignore[misc]
    """Representation of a UniFi Protect Binary Sensor."""

    entity_description: UnifiInsightsBinarySensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        description: UnifiInsightsBinarySensorEntityDescription,
        device_id: str,
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(
            coordinator, description.device_type, device_id, description.key
        )
        self.entity_description = description

        # Set name
        self._attr_name = description.name

        _LOGGER.debug(
            "Initializing %s binary sensor %s for device %s",
            description.device_type,
            description.key,
            device_id,
        )

        # Update initial state
        self._update_from_data()

    @property
    def is_on(self) -> bool | None:
        """Return true if the binary sensor is on."""
        device_data = self.device_data
        if not device_data:
            return None

        return self.entity_description.value_fn(device_data)

    def _update_from_data(self) -> None:
        """Update entity from data."""
        device_data = self.device_data
        if not device_data:
            return

        # Get device name for attributes
        device_name = device_data.get(
            "name",
            (
                f"UniFi {self.entity_description.device_type.capitalize()} "
                f"{self._device_id}"
            ),
        )

        if self.entity_description.device_type == DEVICE_TYPE_CAMERA:
            self._attr_extra_state_attributes = {
                ATTR_CAMERA_ID: self._device_id,
                ATTR_CAMERA_NAME: device_name,
                ATTR_LAST_MOTION: device_data.get("lastMotion", 0),
            }
        elif self.entity_description.device_type == DEVICE_TYPE_SENSOR:
            self._attr_extra_state_attributes = {
                ATTR_SENSOR_ID: self._device_id,
                ATTR_SENSOR_NAME: device_name,
                ATTR_SENSOR_MOTION_DETECTED: device_data.get("isMotionDetected", False),
                ATTR_SENSOR_MOTION_DETECTED_AT: device_data.get("motionDetectedAt", 0),
                ATTR_SENSOR_IS_OPENED: device_data.get("isOpened", False),
                ATTR_SENSOR_OPEN_STATUS_CHANGED_AT: device_data.get(
                    "openStatusChangedAt", 0
                ),
                ATTR_SENSOR_TAMPER_DETECTED: device_data.get(
                    "isTamperingDetected", False
                ),
                ATTR_SENSOR_TAMPER_DETECTED_AT: device_data.get(
                    "tamperingDetectedAt", 0
                ),
                ATTR_SENSOR_LEAK_DETECTED: device_data.get("isLeakDetected", False),
                ATTR_SENSOR_LEAK_DETECTED_AT: device_data.get("leakDetectedAt", 0),
            }
