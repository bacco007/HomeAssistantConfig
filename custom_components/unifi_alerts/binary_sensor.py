"""Binary sensor platform for UniFi Alerts."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    ALL_CATEGORIES,
    CONF_CONTROLLER_URL,
    DOMAIN,
)
from .coordinator import UniFiAlertsCoordinator
from .models import CategoryState

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: UniFiAlertsCoordinator = entry.runtime_data.coordinator

    entities: list[BinarySensorEntity] = [
        UniFiCategoryBinarySensor(coordinator, entry, category)
        for category in ALL_CATEGORIES
        if (state := coordinator.get_category_state(category)) is not None and state.enabled
    ]
    entities.append(UniFiRollupBinarySensor(coordinator, entry))
    async_add_entities(entities)


class UniFiCategoryBinarySensor(CoordinatorEntity[UniFiAlertsCoordinator], BinarySensorEntity):
    """Binary sensor that is ON when a given category has an active alert."""

    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: UniFiAlertsCoordinator,
        entry: ConfigEntry,
        category: str,
    ) -> None:
        super().__init__(coordinator)
        self._category = category
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_{category}_binary"
        self._attr_translation_key = category
        self._attr_device_info = _device_info(entry)

    @property
    def is_on(self) -> bool:
        state = self.coordinator.get_category_state(self._category)
        return bool(state and state.is_alerting)

    @property
    def available(self) -> bool:
        state = self.coordinator.get_category_state(self._category)
        return state is not None and state.enabled

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        state: CategoryState | None = self.coordinator.get_category_state(self._category)
        if not state:
            return {}
        attrs: dict[str, Any] = {
            "category": self._category,
            "alert_count": state.alert_count,
            "open_count": state.open_count,
            # Webhook health signal: confirms the Alarm Manager wiring works
            # without waiting for a real alert. webhook_health is one of
            # "never_received", "healthy", or "stale".
            "webhook_health": state.webhook_health(),
            "last_webhook_at": (
                state.last_webhook_at.isoformat() if state.last_webhook_at else None
            ),
        }
        if state.last_alert:
            attrs["last_message"] = state.last_alert.message
            attrs["last_alert_at"] = state.last_alert.received_at.isoformat()
            attrs["last_device"] = state.last_alert.device_name
            attrs["last_key"] = state.last_alert.key
            attrs["last_severity"] = state.last_alert.severity
        if state.last_cleared_at:
            attrs["last_cleared_at"] = state.last_cleared_at.isoformat()
        return attrs


class UniFiRollupBinarySensor(CoordinatorEntity[UniFiAlertsCoordinator], BinarySensorEntity):
    """Binary sensor that is ON if ANY enabled category is alerting."""

    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_has_entity_name = True
    _attr_translation_key = "any_alert"

    def __init__(
        self,
        coordinator: UniFiAlertsCoordinator,
        entry: ConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_rollup_binary"
        self._attr_device_info = _device_info(entry)

    @property
    def is_on(self) -> bool:
        return self.coordinator.any_alerting

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        last = self.coordinator.rollup_last_alert
        attrs: dict[str, Any] = {
            "total_alert_count": self.coordinator.rollup_alert_count,
            "total_open_count": self.coordinator.rollup_open_count,
        }
        if last:
            attrs["last_message"] = last.message
            attrs["last_alert_at"] = last.received_at.isoformat()
            attrs["last_category"] = last.category
            attrs["last_severity"] = last.severity
        return attrs


def _device_info(entry: ConfigEntry) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name="UniFi Alerts",
        manufacturer="Ubiquiti",
        model="UniFi Network Controller",
        entry_type=DeviceEntryType.SERVICE,
        configuration_url=entry.data.get(CONF_CONTROLLER_URL),
    )
