"""Base entity for the Docker status integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo, Entity
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from .const import DOMAIN, DOMAIN_NAME


# ------------------------------------------------------------------
# ------------------------------------------------------------------
class ComponentEntity(CoordinatorEntity[DataUpdateCoordinator], Entity):
    """Defines a Docker status entity."""

    _attr_has_entity_name = False

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the Docker status entity."""
        super().__init__(coordinator=coordinator)
        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, entry.entry_id)},
            manufacturer="KGN",
            suggested_area="",
            sw_version="1.0",
            name=DOMAIN_NAME,
        )
