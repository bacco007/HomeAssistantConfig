"""Binary sensors for warning, Total Fire Ban and feed health."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import FireWatchCoordinator
from .sensor import FireWatchSensorBase


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator: FireWatchCoordinator = hass.data[DOMAIN]["entries"][entry.entry_id]
    async_add_entities(
        [
            FireWatchActiveWarningBinarySensor(coordinator),
            FireWatchTotalFireBanBinarySensor(coordinator),
            FireWatchFeedProblemBinarySensor(coordinator),
            FireWatchDeliveryProblemBinarySensor(coordinator),
        ]
    )


class FireWatchBinarySensorBase(
    CoordinatorEntity[FireWatchCoordinator], BinarySensorEntity
):
    _attr_has_entity_name = True

    def __init__(self, coordinator: FireWatchCoordinator, key: str) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{key}"

    @property
    def device_info(self):
        return FireWatchSensorBase.device_info.fget(self)  # type: ignore[attr-defined]


class FireWatchActiveWarningBinarySensor(FireWatchBinarySensorBase):
    _attr_name = "Official warning in alert radius"
    _attr_icon = "mdi:alert-decagram"

    def __init__(self, coordinator: FireWatchCoordinator) -> None:
        super().__init__(coordinator, "active_warning")

    @property
    def is_on(self) -> bool | None:
        data = self.coordinator.data or {}
        status = data.get("status")
        feed = data.get("feed", {})
        if status in {None, "stale", "unavailable"}:
            return None
        if status in {"advice", "watch_and_act", "emergency_warning"}:
            return True if feed.get("current_incident_feeds") else None
        return False if feed.get("assessment_complete") else None

    @property
    def available(self) -> bool:
        return super().available and self.is_on is not None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        return {
            "warning_level": data.get("official_warning_level"),
            "incident": data.get("highest_priority_incident"),
            "last_known_warning_records": data.get("last_known_warning_records", []),
            "assessment_complete": data.get("feed", {}).get(
                "assessment_complete", False
            ),
            "retained": not self.available,
        }


class FireWatchTotalFireBanBinarySensor(FireWatchBinarySensorBase):
    _attr_name = "Total Fire Ban today"
    _attr_icon = "mdi:fire-off"

    def __init__(self, coordinator: FireWatchCoordinator) -> None:
        super().__init__(coordinator, "total_fire_ban_today")

    @property
    def is_on(self) -> bool | None:
        return (
            self.coordinator.data.get("danger", {})
            .get("today", {})
            .get("total_fire_ban")
        )

    @property
    def available(self) -> bool:
        return (
            super().available
            and self.coordinator.data.get("danger", {})
            .get("today", {})
            .get("available", False)
            and self.is_on is not None
        )

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        danger = self.coordinator.data.get("danger", {})
        return {
            "district": danger.get("district"),
            "issued_at": danger.get("rfs_issued_at"),
        }


class FireWatchFeedProblemBinarySensor(FireWatchBinarySensorBase):
    _attr_name = "Feed problem"
    _attr_icon = "mdi:cloud-alert"
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(self, coordinator: FireWatchCoordinator) -> None:
        super().__init__(coordinator, "feed_problem")

    @property
    def is_on(self) -> bool:
        return self.coordinator.data.get("feed", {}).get("status") != "fresh"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return dict(self.coordinator.data.get("feed", {}))


class FireWatchDeliveryProblemBinarySensor(FireWatchBinarySensorBase):
    """Expose pending, failed, and expired delivery obligations in HA."""

    _attr_name = "Notification delivery problem"
    _attr_icon = "mdi:message-alert"
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(self, coordinator: FireWatchCoordinator) -> None:
        super().__init__(coordinator, "notification_delivery_problem")

    @property
    def is_on(self) -> bool:
        delivery = self.coordinator.data.get("notification_delivery", {})
        return bool(delivery.get("pending_count") or delivery.get("last_error"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return dict(self.coordinator.data.get("notification_delivery", {}))
