from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.button import ButtonEntity, ButtonEntityDescription
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .coordinator import QBittorrentDataCoordinator

if TYPE_CHECKING:
    from collections.abc import Callable, Coroutine

    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import QBittorrentConfigEntry


class QBittorrentButtonEntityDescription(
    ButtonEntityDescription, frozen_or_thawed=True
):
    press_fn: Callable[[QBittorrentDataCoordinator], Coroutine]


BUTTON_TYPES: tuple[QBittorrentButtonEntityDescription, ...] = (
    QBittorrentButtonEntityDescription(
        key="resume_torrents",
        name="Resume all Torrents",
        icon="mdi:play",
        press_fn=lambda coordinator: coordinator.client.torrents.resume("all"),
    ),
    QBittorrentButtonEntityDescription(
        key="pause_torrents",
        name="Pause all Torrents",
        icon="mdi:pause",
        press_fn=lambda coordinator: coordinator.client.torrents.pause("all"),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: QBittorrentConfigEntry,
    async_add_entites: AddEntitiesCallback,
) -> None:
    coordinator = config_entry.runtime_data
    entities = [
        QBittorrentNumber(description, coordinator, config_entry)
        for description in BUTTON_TYPES
    ]
    async_add_entites(entities)


class QBittorrentNumber(CoordinatorEntity[QBittorrentDataCoordinator], ButtonEntity):
    entity_description: QBittorrentButtonEntityDescription

    def __init__(
        self,
        description: QBittorrentButtonEntityDescription,
        coordinator: QBittorrentDataCoordinator,
        config_entry: QBittorrentConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{config_entry.entry_id}-{description.key}"
        self._attr_name = f"{config_entry.title} {description.name}"
        self._attr_available = False
        self._attr_device_info = self.coordinator.device_info

    async def async_press(self) -> None:
        await self.entity_description.press_fn(self.coordinator)
