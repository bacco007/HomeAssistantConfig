"""Support for UniFi Insights binary sensors."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Callable

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.entity import EntityCategory

from .const import (
    ATTR_CAMERA_ID,
    ATTR_CAMERA_NAME,
    ATTR_LAST_MOTION,
    ATTR_SENSOR_ID,
    ATTR_SENSOR_NAME,
    ATTR_SENSOR_MOTION_DETECTED,
    ATTR_SENSOR_MOTION_DETECTED_AT,
    ATTR_SENSOR_IS_OPENED,
    ATTR_SENSOR_OPEN_STATUS_CHANGED_AT,
    CAMERA_TYPE_DOORBELL,
    CAMERA_TYPE_DOORBELL_WITH_PACKAGE_DETECTION,
    CAMERA_TYPE_DOORBELL_MAIN,
    CAMERA_TYPE_DOORBELL_PACKAGE,
    DOMAIN,
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_SENSOR,
    MANUFACTURER,
    SMART_DETECT_PERSON,
    SMART_DETECT_VEHICLE,
    SMART_DETECT_ANIMAL,
    SMART_DETECT_PACKAGE,
)
from .coordinator import UnifiInsightsDataUpdateCoordinator
from .entity import UnifiInsightsEntity, UnifiProtectEntity

_LOGGER = logging.getLogger(__name__)


def _is_doorbell_camera(camera_data: dict[str, Any]) -> bool:
    """Check if a camera is a doorbell camera."""
    # Check camera type metadata set by the API client
    camera_type = camera_data.get("_camera_type", "")
    if camera_type in [
        CAMERA_TYPE_DOORBELL,
        CAMERA_TYPE_DOORBELL_WITH_PACKAGE_DETECTION,
        CAMERA_TYPE_DOORBELL_MAIN,
        CAMERA_TYPE_DOORBELL_PACKAGE,
    ]:
        return True

    # Fallback: Check camera type field from API
    api_camera_type = camera_data.get("type", "").lower()
    if any(doorbell_type in api_camera_type for doorbell_type in [
        "doorbell", "g4-doorbell", "ai-doorbell", "g4doorbell", "aidoorbell"
    ]):
        return True

    # Fallback: Check camera name for doorbell indicators
    camera_name = camera_data.get("name", "").lower()
    if any(doorbell_name in camera_name for doorbell_name in [
        "doorbell", "door bell", "front door", "entrance"
    ]):
        return True

    return False


@dataclass
class UnifiInsightsBinarySensorEntityDescription(BinarySensorEntityDescription):
    """Class describing UniFi Insights binary sensor entities."""
    value_fn: callable[[dict[str, Any]], bool] = None
    device_type: str = None
    entity_type: str = "device"  # "device" or "protect"


BINARY_SENSOR_TYPES: tuple[UnifiInsightsBinarySensorEntityDescription, ...] = (
    # Network device status
    UnifiInsightsBinarySensorEntityDescription(
        key="device_status",
        translation_key="device_status",
        name="Device Status",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda device: device.get("state") == "ONLINE",
        entity_type="device",
    ),

    # Camera motion detection
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_motion",
        translation_key="camera_motion",
        name="Motion Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: device.get("lastMotion", 0) > 0,
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),

    # Camera person detection
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_person_detection",
        translation_key="camera_person_detection",
        name="Person Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: (
            SMART_DETECT_PERSON in device.get("smartDetectTypes", []) and
            SMART_DETECT_PERSON in device.get("lastSmartDetectTypes", [])
        ),
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),

    # Camera vehicle detection
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_vehicle_detection",
        translation_key="camera_vehicle_detection",
        name="Vehicle Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: (
            SMART_DETECT_VEHICLE in device.get("smartDetectTypes", []) and
            SMART_DETECT_VEHICLE in device.get("lastSmartDetectTypes", [])
        ),
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),

    # Camera animal detection
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_animal_detection",
        translation_key="camera_animal_detection",
        name="Animal Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: (
            SMART_DETECT_ANIMAL in device.get("smartDetectTypes", []) and
            SMART_DETECT_ANIMAL in device.get("lastSmartDetectTypes", [])
        ),
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),

    # Camera package detection
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_package_detection",
        translation_key="camera_package_detection",
        name="Package Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: (
            SMART_DETECT_PACKAGE in device.get("smartDetectTypes", []) and
            SMART_DETECT_PACKAGE in device.get("lastSmartDetectTypes", [])
        ),
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),

    # Camera doorbell ring
    UnifiInsightsBinarySensorEntityDescription(
        key="camera_doorbell_ring",
        translation_key="camera_doorbell_ring",
        name="Ring",
        device_class=BinarySensorDeviceClass.OCCUPANCY,
        value_fn=lambda device: device.get("lastRing", 0) > 0,
        device_type=DEVICE_TYPE_CAMERA,
        entity_type="protect",
    ),

    # Sensor motion detection
    UnifiInsightsBinarySensorEntityDescription(
        key="sensor_motion",
        translation_key="sensor_motion",
        name="Motion Detection",
        device_class=BinarySensorDeviceClass.MOTION,
        value_fn=lambda device: device.get("isMotionDetected", False),
        device_type=DEVICE_TYPE_SENSOR,
        entity_type="protect",
    ),

    # Sensor door/window status
    UnifiInsightsBinarySensorEntityDescription(
        key="sensor_door",
        translation_key="sensor_door",
        name="Door/Window Status",
        device_class=BinarySensorDeviceClass.DOOR,
        value_fn=lambda device: device.get("isOpened", False),
        device_type=DEVICE_TYPE_SENSOR,
        entity_type="protect",
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up binary sensors for UniFi Insights integration."""
    coordinator: UnifiInsightsDataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]
    entities = []

    _LOGGER.debug("Setting up binary sensors for UniFi Insights")

    # Add binary sensors for each device in each site
    for site_id, devices in coordinator.data["devices"].items():
        site_data = coordinator.get_site(site_id)
        site_name = site_data.get("meta", {}).get("name", site_id) if site_data else site_id

        _LOGGER.debug(
            "Processing site %s (%s) with %d devices",
            site_id,
            site_name,
            len(devices)
        )

        for device_id in devices:
            device_data = coordinator.data.get("devices", {}).get(site_id, {}).get(device_id, {})
            device_name = device_data.get("name", device_id)

            _LOGGER.debug(
                "Creating binary sensors for device %s (%s) in site %s (%s)",
                device_id,
                device_name,
                site_id,
                site_name
            )

            for description in BINARY_SENSOR_TYPES:
                if description.entity_type == "device":
                    entities.append(
                        UnifiInsightsBinarySensor(
                            coordinator=coordinator,
                            description=description,
                            site_id=site_id,
                            device_id=device_id,
                        )
                    )

    # Add binary sensors for Protect devices
    if coordinator.protect_api:
        # Add camera binary sensors
        for camera_id, camera_data in coordinator.data["protect"]["cameras"].items():
            camera_name = camera_data.get("name", camera_id)

            _LOGGER.debug(
                "Creating binary sensors for camera %s (%s)",
                camera_id,
                camera_name
            )

            for description in BINARY_SENSOR_TYPES:
                if (description.entity_type == "protect" and
                    description.device_type == DEVICE_TYPE_CAMERA):

                    # Skip package detection and doorbell ring for non-doorbell cameras
                    if (description.key in ["camera_package_detection", "camera_doorbell_ring"] and
                        not _is_doorbell_camera(camera_data)):
                        _LOGGER.debug(
                            "Skipping %s sensor for non-doorbell camera %s (%s)",
                            description.key,
                            camera_id,
                            camera_name
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
                "Creating binary sensors for sensor %s (%s)",
                sensor_id,
                sensor_name
            )

            for description in BINARY_SENSOR_TYPES:
                if (description.entity_type == "protect" and
                    description.device_type == DEVICE_TYPE_SENSOR):
                    entities.append(
                        UnifiProtectBinarySensor(
                            coordinator=coordinator,
                            description=description,
                            device_id=sensor_id,
                        )
                    )

    _LOGGER.info("Adding %d UniFi Insights binary sensors", len(entities))
    async_add_entities(entities)


class UnifiInsightsBinarySensor(UnifiInsightsEntity, BinarySensorEntity):
    """Representation of a UniFi Insights Binary Sensor."""

    entity_description: UnifiInsightsBinarySensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
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
            site_id
        )

        # Mark binary sensors as "Diagnostic" entities
        self._attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def is_on(self) -> bool | None:
        """Return true if the binary sensor is on."""
        if not self.coordinator.data["devices"].get(self._site_id, {}).get(self._device_id):
            _LOGGER.debug(
                "No device data for binary sensor %s (device %s in site %s)",
                self.entity_description.key,
                self._device_id,
                self._site_id
            )
            return None

        device = self.coordinator.data["devices"][self._site_id][self._device_id]
        return self.entity_description.value_fn(device)


class UnifiProtectBinarySensor(UnifiProtectEntity, BinarySensorEntity):
    """Representation of a UniFi Protect Binary Sensor."""

    entity_description: UnifiInsightsBinarySensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        description: UnifiInsightsBinarySensorEntityDescription,
        device_id: str,
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator, description.device_type, device_id, description.key)
        self.entity_description = description

        # Set name
        self._attr_name = description.name

        _LOGGER.debug(
            "Initializing %s binary sensor %s for device %s",
            description.device_type,
            description.key,
            device_id
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
        device_name = device_data.get("name", f"UniFi {self.entity_description.device_type.capitalize()} {self._device_id}")

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
                ATTR_SENSOR_OPEN_STATUS_CHANGED_AT: device_data.get("openStatusChangedAt", 0),
            }