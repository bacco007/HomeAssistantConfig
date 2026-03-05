"""Sensor platform for H.A.C.A."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import (
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from .const import DOMAIN, NAME

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up H.A.C.A sensors."""
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    
    sensors = [
        HACAHealthScoreSensor(coordinator, entry),
        HACAAutomationIssuesSensor(coordinator, entry),
        HACAScriptIssuesSensor(coordinator, entry),
        HACASceneIssuesSensor(coordinator, entry),
        HACABlueprintIssuesSensor(coordinator, entry),
        HACaDashboardIssuesSensor(coordinator, entry),
        HACAEntityIssuesSensor(coordinator, entry),
        HACAPerformanceIssuesSensor(coordinator, entry),
        HACASecurityIssuesSensor(coordinator, entry),
        HACATotalIssuesSensor(coordinator, entry),
    ]
    
    async_add_entities(sensors)


class HACASensorBase(CoordinatorEntity, SensorEntity):
    """Base class for H.A.C.A sensors."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_has_entity_name = True
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": NAME,
            "manufacturer": "Community",
            "model": "Config Auditor",
        }


class HACAHealthScoreSensor(HACASensorBase):
    """Sensor for health score."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_health_score"
        self._attr_translation_key = "health_score"
        self._attr_native_unit_of_measurement = "%"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:heart-pulse"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("health_score")
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra attributes."""
        if not self.coordinator.data:
            return {}
        
        score = self.coordinator.data.get("health_score", 0)
        
        if score >= 90:
            status = "excellent"
            color = "green"
        elif score >= 75:
            status = "good"
            color = "blue"
        elif score >= 60:
            status = "fair"
            color = "yellow"
        elif score >= 40:
            status = "poor"
            color = "orange"
        else:
            status = "critical"
            color = "red"
        
        return {
            "status": status,
            "color": color,
        }


class HACAAutomationIssuesSensor(HACASensorBase):
    """Sensor for automation issues."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_automation_issues"
        self._attr_translation_key = "automation_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:robot"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("automation_issues", 0)
        return None



class HACAEntityIssuesSensor(HACASensorBase):
    """Sensor for entity issues."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_entity_issues"
        self._attr_translation_key = "entity_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:alert-circle"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("entity_issues", 0)
        return None



class HACAPerformanceIssuesSensor(HACASensorBase):
    """Sensor for performance issues."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_performance_issues"
        self._attr_translation_key = "performance_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:speedometer"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("performance_issues", 0)
        return None



class HACATotalIssuesSensor(HACASensorBase):
    """Sensor for total issues."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_total_issues"
        self._attr_translation_key = "total_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:counter"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("total_issues", 0)
        return None


class HACABlueprintIssuesSensor(HACASensorBase):
    """Sensor for blueprint issues."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_blueprint_issues"
        self._attr_translation_key = "blueprint_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:file-document-outline"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("blueprint_issues", 0)
        return None


class HACaDashboardIssuesSensor(HACASensorBase):
    """Sensor for dashboard issues."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_dashboard_issues"
        self._attr_translation_key = "dashboard_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:view-dashboard-outline"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("dashboard_issues", 0)
        return None


class HACAScriptIssuesSensor(HACASensorBase):
    """Sensor for script issues."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_script_issues"
        self._attr_translation_key = "script_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:script-text"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("script_issues", 0)
        return None


class HACASceneIssuesSensor(HACASensorBase):
    """Sensor for scene issues."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_scene_issues"
        self._attr_translation_key = "scene_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:palette"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("scene_issues", 0)
        return None


class HACASecurityIssuesSensor(HACASensorBase):
    """Sensor for security issues (proper CoordinatorEntity)."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_security_issues"
        self._attr_translation_key = "security_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:shield-alert"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("security_issues", 0)
        return None
