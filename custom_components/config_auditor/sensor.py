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
        HACAHelperIssuesSensor(coordinator, entry),
        HACAPerformanceIssuesSensor(coordinator, entry),
        HACASecurityIssuesSensor(coordinator, entry),
        HACAComplianceIssuesSensor(coordinator, entry),
        HACABatteryAlertsSensor(coordinator, entry),
        HACARecorderOrphansSensor(coordinator, entry),
        HACATotalIssuesSensor(coordinator, entry),
    ]
    
    async_add_entities(sensors)


class HACASensorBase(CoordinatorEntity, SensorEntity):
    """Base class for H.A.C.A sensors."""

    # Subclasses MUST set this to their English sensor type key
    _haca_type: str = ""

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

    @property
    def suggested_object_id(self) -> str:
        """Return a stable English object_id regardless of HA language.

        HA's entity_platform.py does: f"{device_name} {suggested_object_id}"
        where device_name = "H.A.C.A" → slugified = "h_a_c_a".
        So we return just the type key (e.g. "health_score"),
        and HA produces: sensor.h_a_c_a_health_score

        NOTE: Only affects NEW entity registrations. Existing entities
        keep their current entity_id (stored in entity registry).
        To reset: Settings → Entities → select entity → ⋮ → Reset entity ID.
        """
        return self._haca_type

    @property
    def extra_state_attributes(self) -> dict:
        """Expose haca_type for frontend card discovery.

        The JS cards use this attribute to identify HACA sensors
        regardless of the entity_id language.
        """
        return {"haca_type": self._haca_type}


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
        self._haca_type = "health_score"
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
        base = super().extra_state_attributes
        if not self.coordinator.data:
            return base
        
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
            **base,
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
        self._haca_type = "automation_issues"
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
        self._haca_type = "entity_issues"
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
        self._haca_type = "performance_issues"
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
        self._haca_type = "total_issues"
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
        self._haca_type = "blueprint_issues"
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
        self._haca_type = "dashboard_issues"
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
        self._haca_type = "script_issues"
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
        self._haca_type = "scene_issues"
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
        self._haca_type = "security_issues"
        self._attr_translation_key = "security_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:shield-alert"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("security_issues", 0)
        return None


class HACAHelperIssuesSensor(HACASensorBase):
    """Sensor for helper issues (input_*, timer, group)."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_helper_issues"
        self._haca_type = "helper_issues"
        self._attr_translation_key = "helper_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:tools"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("helper_issues", 0)
        return None


class HACAComplianceIssuesSensor(HACASensorBase):
    """Sensor for compliance issues (naming, areas, descriptions)."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_compliance_issues"
        self._haca_type = "compliance_issues"
        self._attr_translation_key = "compliance_issues"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:clipboard-check-outline"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("compliance_issues", 0)
        return None


class HACABatteryAlertsSensor(HACASensorBase):
    """Sensor for battery alerts (devices with low/critical battery)."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_battery_alerts"
        self._haca_type = "battery_alerts"
        self._attr_translation_key = "battery_alerts"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:battery-alert-variant-outline"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("battery_alerts", 0)
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra attributes with 7-day prediction alerts."""
        base = super().extra_state_attributes
        if not self.coordinator.data:
            return base
        return {
            **base,
            "alert_7d": self.coordinator.data.get("battery_alert_7d", 0),
            "battery_count": self.coordinator.data.get("battery_count", 0),
        }


class HACARecorderOrphansSensor(HACASensorBase):
    """Sensor for recorder orphan count (entities with stale DB data)."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_recorder_orphans"
        self._haca_type = "recorder_orphans"
        self._attr_translation_key = "recorder_orphans"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:database-alert-outline"

    @property
    def native_value(self) -> int | None:
        """Return the state."""
        if self.coordinator.data:
            return self.coordinator.data.get("recorder_orphan_count", 0)
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra attributes with wasted space estimate."""
        base = super().extra_state_attributes
        if not self.coordinator.data:
            return base
        return {
            **base,
            "wasted_mb": self.coordinator.data.get("recorder_wasted_mb", 0.0),
            "db_available": self.coordinator.data.get("recorder_db_available", False),
        }
