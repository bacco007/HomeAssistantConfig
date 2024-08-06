from collections.abc import Callable, Coroutine

from homeassistant.components.number import (
    NumberDeviceClass,
    NumberEntity,
    NumberEntityDescription,
    NumberMode,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory, UnitOfDataRate
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import QBittorrentDataCoordinator


class QBittorrentNumberEntityDescription(
    NumberEntityDescription, frozen_or_thawed=True
):
    value_fn: Callable[[QBittorrentDataCoordinator], StateType]
    set_value_fn: Callable[[QBittorrentDataCoordinator, float], Coroutine]


NUMBER_TYPES: tuple[QBittorrentNumberEntityDescription, ...] = (
    QBittorrentNumberEntityDescription(
        key="current_download_limit",
        name="Current Down Limit",
        icon="mdi:cloud-download",
        device_class=NumberDeviceClass.DATA_RATE,
        native_unit_of_measurement=UnitOfDataRate.KIBIBYTES_PER_SECOND,
        native_max_value=1611391,
        mode=NumberMode.BOX,
        value_fn=lambda coordinator: coordinator.data["sync"].server_state[
            "dl_rate_limit"
        ]
        / 1024,
        set_value_fn=lambda coordinator,
        value: coordinator.client.transfer.set_download_limit(value * 1024),
        entity_category=EntityCategory.CONFIG,
        entity_registry_enabled_default=False,
    ),
    QBittorrentNumberEntityDescription(
        key="current_upload_limit",
        name="Current Up Limit",
        icon="mdi:cloud-upload",
        device_class=NumberDeviceClass.DATA_RATE,
        native_unit_of_measurement=UnitOfDataRate.KIBIBYTES_PER_SECOND,
        native_max_value=1611391,
        mode=NumberMode.BOX,
        value_fn=lambda coordinator: coordinator.data["sync"].server_state[
            "up_rate_limit"
        ]
        / 1024,
        set_value_fn=lambda coordinator,
        value: coordinator.client.transfer.set_download_limit(value * 1024),
        entity_category=EntityCategory.CONFIG,
        entity_registry_enabled_default=False,
    ),
    QBittorrentNumberEntityDescription(
        key="norm_download_limit",
        name="Normal Down Limit",
        icon="mdi:cloud-download",
        device_class=NumberDeviceClass.DATA_RATE,
        native_unit_of_measurement=UnitOfDataRate.KIBIBYTES_PER_SECOND,
        native_max_value=1611391,
        mode=NumberMode.BOX,
        value_fn=lambda coordinator: coordinator.data["preferences"]["dl_limit"] / 1024,
        set_value_fn=lambda coordinator, value: coordinator.client.app.set_preferences(
            {"dl_limit": value * 1024}
        ),
        entity_category=EntityCategory.CONFIG,
        entity_registry_enabled_default=False,
    ),
    QBittorrentNumberEntityDescription(
        key="norm_upload_limit",
        name="Normal Up Limit",
        icon="mdi:cloud-upload",
        device_class=NumberDeviceClass.DATA_RATE,
        native_unit_of_measurement=UnitOfDataRate.KIBIBYTES_PER_SECOND,
        native_max_value=1611391,
        mode=NumberMode.BOX,
        value_fn=lambda coordinator: coordinator.data["preferences"]["up_limit"] / 1024,
        set_value_fn=lambda coordinator, value: coordinator.client.app.set_preferences(
            {"up_limit": value * 1024}
        ),
        entity_category=EntityCategory.CONFIG,
        entity_registry_enabled_default=False,
    ),
    QBittorrentNumberEntityDescription(
        key="alt_download_limit",
        name="Alternative Down Limit",
        icon="mdi:cloud-download",
        device_class=NumberDeviceClass.DATA_RATE,
        native_unit_of_measurement=UnitOfDataRate.KIBIBYTES_PER_SECOND,
        native_max_value=1611391,
        mode=NumberMode.BOX,
        value_fn=lambda coordinator: coordinator.data["preferences"]["alt_dl_limit"]
        / 1024,
        set_value_fn=lambda coordinator, value: coordinator.client.app.set_preferences(
            {"alt_dl_limit": value * 1024}
        ),
        entity_category=EntityCategory.CONFIG,
        entity_registry_enabled_default=False,
    ),
    QBittorrentNumberEntityDescription(
        key="alt_upload_limit",
        name="Alternative Up Limit",
        icon="mdi:cloud-upload",
        device_class=NumberDeviceClass.DATA_RATE,
        native_unit_of_measurement=UnitOfDataRate.KIBIBYTES_PER_SECOND,
        native_max_value=1611391,
        mode=NumberMode.BOX,
        value_fn=lambda coordinator: coordinator.data["preferences"]["alt_up_limit"]
        / 1024,
        set_value_fn=lambda coordinator, value: coordinator.client.app.set_preferences(
            {"alt_up_limit": value * 1024}
        ),
        entity_category=EntityCategory.CONFIG,
        entity_registry_enabled_default=False,
    ),
    QBittorrentNumberEntityDescription(
        key="port",
        name="Listening Port",
        icon="mdi:network-outline",
        native_min_value=0,
        native_max_value=65535,
        mode=NumberMode.BOX,
        value_fn=lambda coordinator: coordinator.data["preferences"]["listen_port"],
        set_value_fn=lambda coordinator, value: coordinator.client.app.set_preferences(
            {"listen_port": value}
        ),
        entity_category=EntityCategory.CONFIG,
        entity_registry_enabled_default=False,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entites: AddEntitiesCallback,
) -> None:
    coordinator: QBittorrentDataCoordinator = hass.data[DOMAIN][config_entry.entry_id]
    entities = [
        QBittorrentNumber(description, coordinator, config_entry)
        for description in NUMBER_TYPES
    ]
    async_add_entites(entities)


class QBittorrentNumber(CoordinatorEntity[QBittorrentDataCoordinator], NumberEntity):
    entity_description: QBittorrentNumberEntityDescription

    def __init__(
        self,
        description: QBittorrentNumberEntityDescription,
        coordinator: QBittorrentDataCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{config_entry.entry_id}-{description.key}"
        self._attr_name = f"{config_entry.title} {description.name}"
        self._attr_available = False
        self._attr_device_info = self.coordinator.device_info

    @property
    def native_value(self) -> int:
        return int(self.entity_description.value_fn(self.coordinator))

    async def async_set_native_value(self, value: float) -> None:
        await self.entity_description.set_value_fn(self.coordinator, value)
        await self.coordinator.async_request_refresh()
