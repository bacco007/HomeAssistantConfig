"""Support for UniFi Site Manager binary sensors."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Final

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DOMAIN,
    ICON_NETWORK,
    ICON_PROTECT,
)
from .entity import UnifiSiteManagerHostEntity, UnifiSiteManagerSiteEntity, UnifiSiteManagerDeviceEntity

@dataclass(frozen=True, kw_only=True)
class UnifiBinarySensorEntityDescription(BinarySensorEntityDescription):
    """Class describing UniFi binary sensor entities."""

    is_on_fn: Callable[[dict[str, Any]], bool | None]

SITE_BINARY_SENSORS: Final[tuple[UnifiBinarySensorEntityDescription, ...]] = (
    UnifiBinarySensorEntityDescription(
        key="site_online",
        translation_key="site_online",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        entity_category=EntityCategory.DIAGNOSTIC,
        is_on_fn=lambda data: data.get("statistics", {}).get("percentages", {}).get("wanUptime", 0) > 0,
    ),
    UnifiBinarySensorEntityDescription(
        key="devices_all_online",
        translation_key="devices_all_online",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        entity_category=EntityCategory.DIAGNOSTIC,
        is_on_fn=lambda data: data.get("statistics", {}).get("counts", {}).get("offlineDevice", 0) == 0
        and data.get("statistics", {}).get("counts", {}).get("totalDevice", 0) > 0,
    ),
    UnifiBinarySensorEntityDescription(
        key="updates_available",
        translation_key="updates_available",
        device_class=BinarySensorDeviceClass.UPDATE,
        entity_category=EntityCategory.DIAGNOSTIC,
        is_on_fn=lambda data: data.get("statistics", {}).get("counts", {}).get("pendingUpdateDevice", 0) > 0,
    ),
)

HOST_BINARY_SENSORS: Final[tuple[UnifiBinarySensorEntityDescription, ...]] = (
    UnifiBinarySensorEntityDescription(
        key="host_online",
        translation_key="host_online",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        entity_category=EntityCategory.DIAGNOSTIC,
        is_on_fn=lambda data: data.get("reportedState", {}).get("state") == "connected",
    ),
    UnifiBinarySensorEntityDescription(
        key="network_active",
        translation_key="network_active",
        icon=ICON_NETWORK,
        entity_category=EntityCategory.DIAGNOSTIC,
        is_on_fn=lambda data: any(
            controller.get("name") == "network"
            and controller.get("state") == "active"
            for controller in data.get("reportedState", {}).get("controllers", [])
        ),
    ),
    UnifiBinarySensorEntityDescription(
        key="protect_active",
        translation_key="protect_active",
        icon=ICON_PROTECT,
        entity_category=EntityCategory.DIAGNOSTIC,
        is_on_fn=lambda data: any(
            controller.get("name") == "protect"
            and controller.get("state") == "active"
            for controller in data.get("reportedState", {}).get("controllers", [])
        ),
    ),
)

DEVICE_BINARY_SENSORS: Final[tuple[UnifiBinarySensorEntityDescription, ...]] = (
    UnifiBinarySensorEntityDescription(
        key="device_online",
        translation_key="device_online",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        entity_category=EntityCategory.DIAGNOSTIC,
        is_on_fn=lambda data: data.get("status") == "online",
    ),
    UnifiBinarySensorEntityDescription(
        key="device_managed",
        translation_key="device_managed",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        entity_category=EntityCategory.DIAGNOSTIC,
        is_on_fn=lambda data: data.get("isManaged", False),
    ),
    UnifiBinarySensorEntityDescription(
        key="firmware_up_to_date",
        translation_key="firmware_up_to_date",
        device_class=BinarySensorDeviceClass.UPDATE,
        entity_category=EntityCategory.DIAGNOSTIC,
        is_on_fn=lambda data: data.get("firmwareStatus") == "upToDate",
    ),
)

async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the UniFi Site Manager binary sensors."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]

    entities: list[
        UnifiSiteManagerBinarySensor 
        | UnifiSiteManagerHostBinarySensor 
        | UnifiSiteManagerDeviceBinarySensor
    ] = []

    # Add site-level binary sensors
    for site_id in coordinator.data["sites"]:
        entities.extend(
            UnifiSiteManagerBinarySensor(
                coordinator=coordinator,
                description=description,
                site_id=site_id,
            )
            for description in SITE_BINARY_SENSORS
        )

    # Add host-level binary sensors
    for host_id, host_data in coordinator.data["hosts"].items():
        if host_data.get("type") == "console":  # Only add for UniFi OS Consoles
            entities.extend(
                UnifiSiteManagerHostBinarySensor(
                    coordinator=coordinator,
                    description=description,
                    host_id=host_id,
                )
                for description in HOST_BINARY_SENSORS
            )

    # Add device-level binary sensors
    for device_id, device_data in coordinator.data.get("devices", {}).items():
        entities.extend(
            UnifiSiteManagerDeviceBinarySensor(
                coordinator=coordinator,
                description=description,
                device_id=device_id,
            )
            for description in DEVICE_BINARY_SENSORS
        )

    async_add_entities(entities)


class UnifiSiteManagerBinarySensor(UnifiSiteManagerSiteEntity, BinarySensorEntity):
    """Representation of a UniFi Site Manager Binary Sensor."""

    entity_description: UnifiBinarySensorEntityDescription

    @property
    def is_on(self) -> bool | None:
        """Return true if the binary sensor is on."""
        if not self.site_data:
            return None
        return self.entity_description.is_on_fn(self.site_data)

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        # Only check coordinator availability for site binary sensors
        return self.coordinator.last_update_success

class UnifiSiteManagerHostBinarySensor(UnifiSiteManagerHostEntity, BinarySensorEntity):
    """Representation of a UniFi Site Manager Host Binary Sensor."""

    entity_description: UnifiBinarySensorEntityDescription

    @property
    def is_on(self) -> bool | None:
        """Return true if the binary sensor is on."""
        if not self.host_data:
            return None
        return self.entity_description.is_on_fn(self.host_data)

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        if not self.host_data:
            return False
        # For host entities, we need both coordinator and host connection status
        return (
            self.coordinator.last_update_success
            and self.host_data.get("reportedState", {}).get("state") == "connected"
        )
    
class UnifiSiteManagerDeviceBinarySensor(UnifiSiteManagerDeviceEntity, BinarySensorEntity):
    """Representation of a UniFi Site Manager Device Binary Sensor."""

    entity_description: UnifiBinarySensorEntityDescription

    @property
    def is_on(self) -> bool | None:
        """Return true if the binary sensor is on."""
        if not self.device_data:
            return None
        return self.entity_description.is_on_fn(self.device_data)

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return (
            self.coordinator.last_update_success
            and self.device_data is not None
        )