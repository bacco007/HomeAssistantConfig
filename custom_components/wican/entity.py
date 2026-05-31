"""Base entity for WiCAN integration."""

from __future__ import annotations

from abc import abstractmethod
from typing import TYPE_CHECKING

from homeassistant.core import callback
from homeassistant.helpers.device_registry import CONNECTION_NETWORK_MAC, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import WiCANDataUpdateCoordinator

if TYPE_CHECKING:
    from homeassistant.helpers.entity import EntityDescription

    from . import WiCANConfigEntry


class WiCANEntity(CoordinatorEntity[WiCANDataUpdateCoordinator]):
    """Base entity using DataUpdateCoordinator."""

    _attr_has_entity_name = True

    def __init__(
        self,
        config_entry: WiCANConfigEntry,
        entity_description: EntityDescription,
    ) -> None:
        """Initialize the entity."""
        super().__init__(config_entry.runtime_data.coordinator)
        self.config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_{entity_description.key}"
        self.entity_description = entity_description
        self.webhook_id = config_entry.runtime_data.webhook_id
        self._attr_name = entity_description.key
        self._attr_device_info = DeviceInfo(
            connections={(DOMAIN, config_entry.entry_id)},
            manufacturer="MeatPi",
            model="WiCAN",
            name=config_entry.title,
        )

    @abstractmethod
    def _async_handle_event(self, webhook_id: str, data: dict[str, str]) -> None:
        """Handle the WiCAN event.

        This method is kept for backward compatibility during migration.
        Subclasses should override _handle_coordinator_update() instead.
        """

    async def async_added_to_hass(self) -> None:
        """Register event callback."""
        await super().async_added_to_hass()

        # Keep dispatcher for backward compatibility during migration
        @callback
        def _handle_event_filtered(webhook_id: str, data: dict[str, str]) -> None:
            if webhook_id != self.webhook_id:
                return
            self._async_handle_event(webhook_id, data)

        self.async_on_remove(
            async_dispatcher_connect(self.hass, DOMAIN, _handle_event_filtered),
        )

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        # Default implementation - subclasses should override this
        self.async_write_ha_state()

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        info = self.config_entry.data
        config_url = info.get("mdns")
        if not isinstance(config_url, str) or not config_url.startswith("http"):
            config_url = None

        # Use device_id or MAC as stable identifier (survives hostname changes)
        device_id = info.get("device_id") or self.config_entry.entry_id

        # Build device info with MAC connection if available
        device_info_dict = {
            "identifiers": {(DOMAIN, device_id)},
            "manufacturer": "MeatPi",
            "model": info.get("hw_version", "Unknown"),
            "name": self.config_entry.title,
            "sw_version": info.get("fw_version", "Unknown"),
            "configuration_url": config_url,
        }

        # Add MAC address connection if available (from firmware)
        mac_address = info.get("mac")
        if mac_address:
            device_info_dict["connections"] = {(CONNECTION_NETWORK_MAC, mac_address)}

        # Add serial number if device_id available
        if info.get("device_id"):
            device_info_dict["serial_number"] = info.get("device_id")

        return DeviceInfo(**device_info_dict)
