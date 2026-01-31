"""Sensor platform for Matter Binding Helper."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from .const import DOMAIN
from .matter_client import (
    BindingEntry,
    get_bindings,
    get_nodes,
)

_LOGGER = logging.getLogger(__name__)

# Update interval for binding data
SCAN_INTERVAL_SECONDS = 30


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Matter Binding sensors from a config entry."""
    coordinator = MatterBindingCoordinator(hass, config_entry)
    await coordinator.async_config_entry_first_refresh()

    # Store coordinator for later use
    hass.data[DOMAIN][config_entry.entry_id]["coordinator"] = coordinator

    # Get device registry to look up Matter devices
    device_registry = dr.async_get(hass)

    # Create sensors for each endpoint with binding cluster
    entities: list[MatterBindingSensor] = []

    for node_data in coordinator.data.get("nodes", []):
        node_id = node_data["node_id"]
        node_name = node_data.get("name", f"Node {node_id}")
        ha_device_id = node_data.get("ha_device_id")

        # Look up the Matter device to get its identifiers
        matter_device = None
        matter_identifiers: set[tuple[str, str]] | None = None
        if ha_device_id:
            matter_device = device_registry.async_get(ha_device_id)
            if matter_device:
                matter_identifiers = matter_device.identifiers
                _LOGGER.debug(
                    "Found Matter device for node %s: %s (identifiers: %s)",
                    node_id,
                    matter_device.name,
                    matter_identifiers,
                )

        for endpoint in node_data.get("endpoints", []):
            endpoint_id = endpoint["endpoint_id"]

            # Only create sensor for endpoints with binding cluster
            if not endpoint.get("has_binding_cluster"):
                continue

            # Skip endpoint 0 (root node)
            if endpoint_id == 0:
                continue

            entities.append(
                MatterBindingSensor(
                    coordinator=coordinator,
                    node_id=node_id,
                    endpoint_id=endpoint_id,
                    node_name=node_name,
                    matter_identifiers=matter_identifiers,
                    device_info_data=node_data.get("device_info", {}),
                )
            )

    _LOGGER.info("Setting up %d Matter Binding sensors", len(entities))
    async_add_entities(entities)

    # NOTE: Proprietary sensors DISABLED - was causing Matter integration to crash
    # The issue is that reading proprietary attributes via Matter client triggers
    # something in the Matter integration that causes validation errors.
    # TODO: Investigate alternative approach that doesn't use Matter client directly


class MatterBindingCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator to manage fetching Matter binding data."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        from datetime import timedelta

        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_coordinator",
            update_interval=timedelta(seconds=SCAN_INTERVAL_SECONDS),
        )
        self.config_entry = config_entry

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from Matter server."""
        data: dict[str, Any] = {
            "nodes": [],
            "bindings": {},  # Key: (node_id, endpoint_id), Value: list of bindings
        }

        try:
            # Get all nodes
            nodes = await get_nodes(self.hass)
            data["nodes"] = nodes

            # Fetch bindings for each endpoint with binding cluster
            for node in nodes:
                node_id = node["node_id"]
                for endpoint in node.get("endpoints", []):
                    endpoint_id = endpoint["endpoint_id"]
                    if endpoint.get("has_binding_cluster") and endpoint_id != 0:
                        bindings = await get_bindings(self.hass, node_id, endpoint_id)
                        data["bindings"][(node_id, endpoint_id)] = bindings

            _LOGGER.debug(
                "Coordinator update: %d nodes, %d binding endpoints",
                len(nodes),
                len(data["bindings"]),
            )

        except Exception as err:
            _LOGGER.error("Error fetching Matter binding data: %s", err)
            raise

        return data


class MatterBindingSensor(CoordinatorEntity[MatterBindingCoordinator], SensorEntity):
    """Sensor showing Matter bindings for a device endpoint."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_icon = "mdi:link-variant"

    def __init__(
        self,
        coordinator: MatterBindingCoordinator,
        node_id: int,
        endpoint_id: int,
        node_name: str,
        matter_identifiers: set[tuple[str, str]] | None,
        device_info_data: dict[str, Any],
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)

        self._node_id = node_id
        self._endpoint_id = endpoint_id
        self._node_name = node_name
        self._matter_identifiers = matter_identifiers
        self._device_info_data = device_info_data

        # Unique ID based on node and endpoint
        self._attr_unique_id = f"matter_bindings_{node_id}_{endpoint_id}"

        # Entity name - will be combined with device name
        if endpoint_id == 1:
            self._attr_name = "Matter bindings"
        else:
            self._attr_name = f"Matter bindings (EP{endpoint_id})"

    @property
    def device_info(self) -> DeviceInfo | None:
        """Return device info to link this sensor to the Matter device."""
        if self._matter_identifiers:
            # Use the exact same identifiers as the Matter device
            # This will attach our sensor to the existing Matter device
            return DeviceInfo(
                identifiers=self._matter_identifiers,
            )

        # Fallback: create a standalone device if we can't link to Matter device
        # This shouldn't normally happen, but handles demo mode
        return DeviceInfo(
            identifiers={(DOMAIN, f"node_{self._node_id}")},
            name=self._node_name,
            manufacturer=self._device_info_data.get("vendor_name"),
            model=self._device_info_data.get("product_name"),
            sw_version=self._device_info_data.get("software_version"),
        )

    @property
    def native_value(self) -> int:
        """Return the number of bindings."""
        bindings = self._get_bindings()
        return len(bindings)

    @property
    def native_unit_of_measurement(self) -> str:
        """Return the unit of measurement."""
        return "bindings"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return binding details as attributes."""
        bindings = self._get_bindings()
        attrs: dict[str, Any] = {
            "node_id": self._node_id,
            "endpoint_id": self._endpoint_id,
            "binding_count": len(bindings),
        }

        # Add each binding as a numbered attribute
        for i, binding in enumerate(bindings):
            binding_info = self._format_binding(binding)
            attrs[f"binding_{i}"] = binding_info

        # Also provide a structured list for easier template access
        attrs["bindings"] = [self._format_binding_dict(b) for b in bindings]

        return attrs

    def _get_bindings(self) -> list[BindingEntry]:
        """Get bindings for this endpoint from coordinator data."""
        if not self.coordinator.data:
            return []
        return self.coordinator.data.get("bindings", {}).get(
            (self._node_id, self._endpoint_id), []
        )

    def _format_binding(self, binding: BindingEntry) -> str:
        """Format a binding entry as a human-readable string."""
        parts = []

        if binding.target_node_id is not None:
            # Try to get target node name
            target_name = self._get_node_name(binding.target_node_id)
            parts.append(f"→ {target_name}")

            if binding.target_endpoint_id is not None:
                parts.append(f"EP{binding.target_endpoint_id}")
        elif binding.target_group_id is not None:
            parts.append(f"→ Group {binding.target_group_id}")

        # Add cluster name
        cluster_name = self._get_cluster_name(binding.cluster_id)
        parts.append(f"({cluster_name})")

        return " ".join(parts)

    def _format_binding_dict(self, binding: BindingEntry) -> dict[str, Any]:
        """Format a binding entry as a dictionary."""
        result: dict[str, Any] = {
            "cluster_id": binding.cluster_id,
            "cluster_name": self._get_cluster_name(binding.cluster_id),
        }

        if binding.target_node_id is not None:
            result["target_node_id"] = binding.target_node_id
            result["target_node_name"] = self._get_node_name(binding.target_node_id)
        if binding.target_endpoint_id is not None:
            result["target_endpoint_id"] = binding.target_endpoint_id
        if binding.target_group_id is not None:
            result["target_group_id"] = binding.target_group_id

        return result

    def _get_node_name(self, node_id: int) -> str:
        """Get the name of a node by ID."""
        if not self.coordinator.data:
            return f"Node {node_id}"

        for node in self.coordinator.data.get("nodes", []):
            if node["node_id"] == node_id:
                return node.get("name", f"Node {node_id}")

        return f"Node {node_id}"

    def _get_cluster_name(self, cluster_id: int) -> str:
        """Get a human-readable cluster name."""
        # Common Matter cluster names
        cluster_names = {
            0x0003: "Identify",
            0x0004: "Groups",
            0x0005: "Scenes",
            0x0006: "On/Off",
            0x0008: "Level Control",
            0x001D: "Descriptor",
            0x001E: "Binding",
            0x0028: "Basic Information",
            0x0030: "General Commissioning",
            0x0031: "Network Commissioning",
            0x0033: "General Diagnostics",
            0x0034: "Software Diagnostics",
            0x0039: "Bridged Device Basic",
            0x003C: "Administrator Commissioning",
            0x003E: "Operational Credentials",
            0x003F: "Group Key Management",
            0x0101: "Door Lock",
            0x0102: "Window Covering",
            0x0200: "Pump Configuration",
            0x0201: "Thermostat",
            0x0202: "Fan Control",
            0x0204: "Thermostat UI",
            0x0300: "Color Control",
            0x0400: "Illuminance Measurement",
            0x0402: "Temperature Measurement",
            0x0403: "Pressure Measurement",
            0x0404: "Flow Measurement",
            0x0405: "Humidity Measurement",
            0x0406: "Occupancy Sensing",
            0x0500: "IAS Zone",
            0x0502: "IAS WD",
        }
        return cluster_names.get(cluster_id, f"Cluster 0x{cluster_id:04X}")
