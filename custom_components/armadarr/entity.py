"""Base entity for Armadarr."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import DailyCoordinator, StandardCoordinator

if TYPE_CHECKING:
    from homeassistant.helpers.entity import EntityDescription

    from .data import ArmadarrConfigEntry


class ArmadarrEntity(CoordinatorEntity[StandardCoordinator | DailyCoordinator]):
    """Base class for Amadarr entities."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: StandardCoordinator | DailyCoordinator,
        description: EntityDescription,
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        # Add this line to handle the description
        self.entity_description = description

        self.config_entry: ArmadarrConfigEntry = coordinator.config_entry
        app_type = self.config_entry.data["app_type"]
        url = self.config_entry.data["url"]

        self._attr_unique_id = f"{self.config_entry.entry_id}_{description.key}"

        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{app_type}_{url}")},
            name=f"{app_type}",  # Cleaner name, URL is in config_url
            manufacturer="PyArr",
            entry_type=DeviceEntryType.SERVICE,
        )

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        return {
            "entry_id": self.config_entry.entry_id,
            "app_type": self.config_entry.data["app_type"],
        }
