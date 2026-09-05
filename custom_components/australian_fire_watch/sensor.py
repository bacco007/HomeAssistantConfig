"""Sensor entities for Australian Fire Watch."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, VERSION
from .coordinator import FireWatchCoordinator

SUMMARY_OPTIONS = [
    "emergency_warning",
    "watch_and_act",
    "advice",
    "incident_nearby",
    "planned_activity",
    "no_current_warning",
    "stale",
    "unavailable",
]
FEED_OPTIONS = ["fresh", "degraded", "stale", "unavailable"]
DANGER_OPTIONS = ["No Rating", "Moderate", "High", "Extreme", "Catastrophic", "Unknown"]


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator: FireWatchCoordinator = hass.data[DOMAIN]["entries"][entry.entry_id]
    async_add_entities(
        [
            FireWatchSummarySensor(coordinator),
            FireWatchDangerSensor(coordinator),
            FireWatchHighestIncidentSensor(coordinator),
            FireWatchIncidentCountSensor(coordinator),
            FireWatchFeedHealthSensor(coordinator),
        ]
    )


class FireWatchSensorBase(CoordinatorEntity[FireWatchCoordinator], SensorEntity):
    """Base sensor attached to the config entry's device."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: FireWatchCoordinator, key: str) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{key}"

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self.coordinator.entry.entry_id)},
            name=self.coordinator.entry.title,
            manufacturer="Australian Fire Watch community project",
            model=f"Official {self.coordinator.jurisdiction.code} fire feed monitor",
            sw_version=VERSION,
            configuration_url=self.coordinator.jurisdiction.official_url,
        )


class FireWatchSummarySensor(FireWatchSensorBase):
    _attr_name = "Status"
    _attr_icon = "mdi:fire-alert"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = SUMMARY_OPTIONS

    def __init__(self, coordinator: FireWatchCoordinator) -> None:
        super().__init__(coordinator, "status")

    @property
    def native_value(self) -> str:
        return str(self.coordinator.data.get("status", "unavailable"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            key: value
            for key, value in self.coordinator.data.items()
            if key != "status"
        }


class FireWatchDangerSensor(FireWatchSensorBase):
    _attr_name = "Fire danger today"
    _attr_icon = "mdi:fire-circle"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = DANGER_OPTIONS

    def __init__(self, coordinator: FireWatchCoordinator) -> None:
        super().__init__(coordinator, "fire_danger_today")

    @property
    def available(self) -> bool:
        return super().available and bool(
            self.coordinator.data.get("danger", {})
            .get("today", {})
            .get("available", False)
        )

    @property
    def native_value(self) -> str:
        return str(
            self.coordinator.data.get("danger", {})
            .get("today", {})
            .get("rating", "Unknown")
        )

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return dict(self.coordinator.data.get("danger", {}))


class FireWatchHighestIncidentSensor(FireWatchSensorBase):
    _attr_name = "Highest priority incident"
    _attr_icon = "mdi:map-marker-alert"

    def __init__(self, coordinator: FireWatchCoordinator) -> None:
        super().__init__(coordinator, "highest_priority_incident")

    @property
    def native_value(self) -> str:
        incident = self.coordinator.data.get("highest_priority_incident")
        return str(incident.get("title", "None"))[:255] if incident else "None"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        incident = self.coordinator.data.get("highest_priority_incident")
        return dict(incident or {})


class FireWatchIncidentCountSensor(FireWatchSensorBase):
    _attr_name = "Monitored incident count"
    _attr_icon = "mdi:counter"

    def __init__(self, coordinator: FireWatchCoordinator) -> None:
        super().__init__(coordinator, "incident_count")

    @property
    def native_value(self) -> int:
        return int(self.coordinator.data.get("incident_count", 0))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "active_incidents": self.coordinator.data.get("incident_count", 0),
            "planned_activity": self.coordinator.data.get("planned_burn_count", 0),
            "monitor_radius_km": self.coordinator.config.get("monitor_radius_km"),
        }


class FireWatchFeedHealthSensor(FireWatchSensorBase):
    _attr_name = "Feed health"
    _attr_icon = "mdi:cloud-sync"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = FEED_OPTIONS

    def __init__(self, coordinator: FireWatchCoordinator) -> None:
        super().__init__(coordinator, "feed_health")

    @property
    def native_value(self) -> str:
        return str(self.coordinator.data.get("feed", {}).get("status", "unavailable"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return dict(self.coordinator.data.get("feed", {}))
