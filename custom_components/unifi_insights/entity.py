"""UniFi Insights entity base class."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import callback
from homeassistant.helpers.entity import DeviceInfo, EntityDescription
from homeassistant.helpers.device_registry import CONNECTION_NETWORK_MAC
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, MANUFACTURER
from .coordinator import UnifiInsightsDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


class UnifiInsightsEntity(CoordinatorEntity[UnifiInsightsDataUpdateCoordinator]):
    """Base class for UniFi Insights entities."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        description: EntityDescription,
        site_id: str,
        device_id: str,
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        self.entity_description = description
        self._site_id = site_id
        self._device_id = device_id

        # Get device data
        device_data = coordinator.data["devices"][site_id][device_id]
        device_name = device_data.get("name", f"UniFi Device {device_id}")
        ip_address = device_data.get("ipAddress", "")

        # Set unique ID
        self._attr_unique_id = f"{site_id}_{device_id}_{description.key}"

        # Set name
        self._attr_name = f"{device_name} {description.name}"

        # Create device info for individual device
        device_info: dict[str, Any] = {
            "identifiers": {(DOMAIN, f"{site_id}_{device_id}")},
            "name": f"{device_name} ({ip_address})" if ip_address else device_name,
            "manufacturer": MANUFACTURER,
            "model": device_data.get("model", "Unknown Model"),
            "sw_version": device_data.get("firmwareVersion"),
            "configuration_url": f"{coordinator.api.host}/network/devices/{device_id}",
        }

        # Add network connections
        if mac := device_data.get("macAddress"):
            device_info["connections"] = {(CONNECTION_NETWORK_MAC, mac)}

        # Add hardware version based on device features
        hw_info = []

        # Get port count
        if ports := device_data.get("port_table", []):
            if isinstance(ports, list):
                port_count = len(ports)
                if port_count > 0:
                    hw_info.append(f"{port_count} Ports")

        # Get radio info
        if radio_table := device_data.get("radio_table", []):
            if isinstance(radio_table, list):
                for radio in radio_table:
                    if not isinstance(radio, dict):
                        continue
                    radio_name = radio.get("name", "")
                    radio_type = radio.get("radio", "")
                    if radio_name and radio_type:
                        hw_info.append(f"{radio_name} ({radio_type})")

        if hw_info:
            device_info["hw_version"] = " | ".join(hw_info)

        # Set suggested area based on device type
        model = device_data.get("model", "").lower()
        if any(
            model.startswith(prefix) 
            for prefix in ("usw", "switch", "uap", "ap", "udm", "usg")
        ):
            device_info["suggested_area"] = "Network"

        self._attr_device_info = DeviceInfo(**device_info)

    @property
    def device_info(self) -> DeviceInfo:
        """Return device information."""
        return self._attr_device_info

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        device_data = self.coordinator.data["devices"].get(self._site_id, {}).get(self._device_id)
        if not device_data:
            return False
        return device_data.get("state") == "ONLINE"

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        device_data = self.coordinator.data["devices"].get(self._site_id, {}).get(self._device_id)
        if not device_data:
            self._attr_available = False
            self.async_write_ha_state()
            return

        self._attr_available = device_data.get("state") == "ONLINE"
        self.async_write_ha_state()

    @property
    def device_data(self) -> dict[str, Any] | None:
        """Return device data."""
        return self.coordinator.data["devices"].get(self._site_id, {}).get(self._device_id)

    @property
    def device_stats(self) -> dict[str, Any] | None:
        """Return device statistics."""
        return self.coordinator.data["stats"].get(self._site_id, {}).get(self._device_id)