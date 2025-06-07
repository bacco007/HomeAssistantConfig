"""UniFi Insights entity base class."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import callback
from homeassistant.helpers.entity import DeviceInfo, EntityDescription
from homeassistant.helpers.device_registry import CONNECTION_NETWORK_MAC
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    DOMAIN,
    MANUFACTURER,
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_LIGHT,
    DEVICE_TYPE_SENSOR,
    DEVICE_TYPE_NVR,
    DEVICE_TYPE_CHIME,
)
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

        # Set name (just the entity type, device name will be added automatically)
        self._attr_name = description.name

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


class UnifiProtectEntity(CoordinatorEntity[UnifiInsightsDataUpdateCoordinator]):
    """Base class for UniFi Protect entities."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        device_type: str,
        device_id: str,
        entity_type: str = None,
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        self._device_type = device_type
        self._device_id = device_id
        self._entity_type = entity_type

        # Get device data
        device_data = coordinator.data["protect"][f"{device_type}s"].get(device_id, {})
        device_name = device_data.get("name", f"UniFi {device_type.capitalize()} {device_id}")

        # For dual-camera entities, extract the original device ID for device grouping
        original_device_id = device_id
        parent_camera_id = device_data.get("_parent_camera_id")
        if parent_camera_id:
            original_device_id = parent_camera_id
            # Use the original device name without camera type suffix for device grouping
            original_device_name = device_name
            if " Main Camera" in device_name:
                original_device_name = device_name.replace(" Main Camera", "")
            elif " Package Camera" in device_name:
                original_device_name = device_name.replace(" Package Camera", "")
            device_name = original_device_name

        # Set unique ID - include entity type if provided
        if entity_type:
            self._attr_unique_id = f"{DOMAIN}_{device_type}_{device_id}_{entity_type}"
        else:
            self._attr_unique_id = f"{DOMAIN}_{device_type}_{device_id}"

        # Check if this device has a corresponding network device
        network_device_id = None
        network_site_id = None

        # For cameras, try to find a matching network device by MAC address
        # Use the original device ID for MAC lookup in case of dual-camera
        lookup_device_id = original_device_id if parent_camera_id else device_id
        lookup_device_data = coordinator.data["protect"][f"{device_type}s"].get(lookup_device_id, device_data)

        if device_type == DEVICE_TYPE_CAMERA and "mac" in lookup_device_data:
            camera_mac = lookup_device_data.get("mac")
            if camera_mac:
                # Search for a network device with the same MAC
                for site_id, devices in coordinator.data["devices"].items():
                    for net_device_id, net_device in devices.items():
                        if net_device.get("macAddress") == camera_mac:
                            network_device_id = net_device_id
                            network_site_id = site_id
                            _LOGGER.debug(
                                "Found matching network device %s in site %s for camera %s",
                                net_device_id,
                                site_id,
                                lookup_device_id
                            )
                            break
                    if network_device_id:
                        break

        # Create device info based on whether we found a matching network device
        if network_device_id and network_site_id:
            # Use the network device's identifiers to ensure all entities appear under the same device
            network_device = coordinator.data["devices"][network_site_id][network_device_id]
            network_device_name = network_device.get("name", f"UniFi Device {network_device_id}")
            ip_address = network_device.get("ipAddress", "")

            device_info: dict[str, Any] = {
                "identifiers": {(DOMAIN, f"{network_site_id}_{network_device_id}")},
                "name": f"{network_device_name} ({ip_address})" if ip_address else network_device_name,
                "manufacturer": MANUFACTURER,
                "model": network_device.get("model", "Unknown Model"),
                "sw_version": network_device.get("firmwareVersion"),
                "configuration_url": f"{coordinator.api.host}/network/devices/{network_device_id}",
            }

            # Add network connections
            if mac := network_device.get("macAddress"):
                device_info["connections"] = {(CONNECTION_NETWORK_MAC, mac)}

            _LOGGER.debug(
                "Using network device info for %s device %s (network device %s in site %s)",
                device_type,
                device_id,
                network_device_id,
                network_site_id
            )
        else:
            # Create a new device entry for this Protect device
            # Use original device ID for dual-camera grouping
            device_id_for_identifier = original_device_id if parent_camera_id else device_id
            device_info: dict[str, Any] = {
                "identifiers": {(DOMAIN, f"protect_{device_type}_{device_id_for_identifier}")},
                "name": device_name,
                "manufacturer": MANUFACTURER,
                "model": lookup_device_data.get("type", f"UniFi {device_type.capitalize()}"),
                "sw_version": lookup_device_data.get("firmwareVersion"),
                "configuration_url": f"{coordinator.protect_api.host}/protect/devices/{device_id_for_identifier}",
            }

            # Set suggested area
            if device_type == DEVICE_TYPE_CAMERA:
                device_info["suggested_area"] = "Security"
            elif device_type == DEVICE_TYPE_LIGHT:
                device_info["suggested_area"] = "Exterior"
            elif device_type == DEVICE_TYPE_SENSOR:
                device_info["suggested_area"] = "Security"

            # Add MAC connection if available
            if "mac" in lookup_device_data:
                device_info["connections"] = {(CONNECTION_NETWORK_MAC, lookup_device_data.get("mac"))}

            _LOGGER.debug(
                "Created new device info for %s device %s",
                device_type,
                device_id
            )

        self._attr_device_info = DeviceInfo(**device_info)

    @property
    def device_info(self) -> DeviceInfo:
        """Return device information."""
        return self._attr_device_info

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        device_data = self.coordinator.data["protect"][f"{self._device_type}s"].get(self._device_id)
        if not device_data:
            return False
        return device_data.get("state") == "CONNECTED"

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_from_data()
        self.async_write_ha_state()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        # To be implemented by subclasses
        pass

    @property
    def device_data(self) -> dict[str, Any] | None:
        """Return device data."""
        return self.coordinator.data["protect"][f"{self._device_type}s"].get(self._device_id)