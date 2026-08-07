"""Button platform for UniFi Alerts — manual alert clear buttons."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
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

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: UniFiAlertsCoordinator = entry.runtime_data.coordinator

    entities: list[ButtonEntity] = [
        UniFiClearCategoryButton(coordinator, entry, category)
        for category in ALL_CATEGORIES
        if (state := coordinator.get_category_state(category)) is not None and state.enabled
    ]
    entities.append(UniFiClearAllButton(coordinator, entry))
    async_add_entities(entities)


class UniFiClearCategoryButton(CoordinatorEntity[UniFiAlertsCoordinator], ButtonEntity):
    """Button that manually clears the alert state for one category."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(
        self,
        coordinator: UniFiAlertsCoordinator,
        entry: ConfigEntry,
        category: str,
    ) -> None:
        super().__init__(coordinator)
        self._category = category
        self._attr_unique_id = f"{entry.entry_id}_{category}_clear"
        self._attr_translation_key = f"clear_{category}"
        self._attr_device_info = _device_info(entry)

    @property
    def available(self) -> bool:
        state = self.coordinator.get_category_state(self._category)
        if state is None:
            return False
        return state.enabled

    async def async_press(self) -> None:
        await self.coordinator.async_clear_category(self._category)


class UniFiClearAllButton(CoordinatorEntity[UniFiAlertsCoordinator], ButtonEntity):
    """Button that clears alert state for all categories at once."""

    _attr_has_entity_name = True
    _attr_translation_key = "clear_all"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(
        self,
        coordinator: UniFiAlertsCoordinator,
        entry: ConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_clear_all"
        self._attr_device_info = _device_info(entry)

    @property
    def available(self) -> bool:
        return any(state.enabled for state in self.coordinator.category_states.values())

    async def async_press(self) -> None:
        await self.coordinator.async_clear_all()


def _device_info(entry: ConfigEntry) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name="UniFi Alerts",
        manufacturer="Ubiquiti",
        model="UniFi Network Controller",
        entry_type=DeviceEntryType.SERVICE,
        configuration_url=entry.data.get(CONF_CONTROLLER_URL),
    )
