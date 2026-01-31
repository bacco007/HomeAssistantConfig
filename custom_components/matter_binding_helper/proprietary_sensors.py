"""Proprietary sensor platform for Matter devices.

This module automatically creates sensor entities for proprietary Matter
cluster attributes based on metadata from the device-definitions registry.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.const import EntityCategory
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .registry import AttributeMeta, ClusterMeta, ProprietaryRegistry

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from .sensor import MatterBindingCoordinator

_LOGGER = logging.getLogger(__name__)

# Mapping of registry device class names to HA SensorDeviceClass
DEVICE_CLASS_MAP: dict[str, SensorDeviceClass] = {
    "temperature": SensorDeviceClass.TEMPERATURE,
    "humidity": SensorDeviceClass.HUMIDITY,
    "battery": SensorDeviceClass.BATTERY,
    "power": SensorDeviceClass.POWER,
    "energy": SensorDeviceClass.ENERGY,
    "voltage": SensorDeviceClass.VOLTAGE,
    "current": SensorDeviceClass.CURRENT,
    "pressure": SensorDeviceClass.PRESSURE,
    "illuminance": SensorDeviceClass.ILLUMINANCE,
}

# Mapping of registry state class names to HA SensorStateClass
STATE_CLASS_MAP: dict[str, SensorStateClass] = {
    "measurement": SensorStateClass.MEASUREMENT,
    "total": SensorStateClass.TOTAL,
    "total_increasing": SensorStateClass.TOTAL_INCREASING,
}

# Mapping of registry entity category names to HA EntityCategory
ENTITY_CATEGORY_MAP: dict[str, EntityCategory] = {
    "config": EntityCategory.CONFIG,
    "diagnostic": EntityCategory.DIAGNOSTIC,
}


async def async_setup_proprietary_sensors(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    coordinator: MatterBindingCoordinator,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Discover and create sensors for proprietary attributes.

    This function scans all Matter nodes for proprietary clusters and creates
    sensor entities for attributes that have sensor metadata defined in the
    device-definitions registry.

    Only creates sensors for devices that match the full fingerprint
    (vendor ID, required clusters, and device types).
    """
    registry = ProprietaryRegistry.get()
    entities: list[ProprietaryAttributeSensor] = []

    for node_data in coordinator.data.get("nodes", []):
        node_id = node_data["node_id"]
        vendor_id = node_data.get("device_info", {}).get("vendor_id")
        matter_identifiers = _get_matter_identifiers(hass, node_data)

        for endpoint in node_data.get("endpoints", []):
            endpoint_id = endpoint["endpoint_id"]

            # Skip root node endpoint
            if endpoint_id == 0:
                continue

            # Get endpoint info for fingerprint matching
            server_clusters = endpoint.get("server_clusters", [])
            device_types = [
                dt.get("id") for dt in endpoint.get("device_types", []) if dt.get("id")
            ]

            # Find matching device definition by fingerprint
            device_meta = registry.find_device(
                vendor_id=vendor_id or 0,
                cluster_ids=server_clusters,
                device_types=device_types,
            )

            if not device_meta:
                # No matching device definition - skip proprietary sensors
                continue

            _LOGGER.debug(
                "Matched device %s for node %d endpoint %d (vendor=%s, clusters=%s, types=%s)",
                device_meta.id,
                node_id,
                endpoint_id,
                vendor_id,
                server_clusters[:5],
                device_types,
            )

            # Check each cluster on the endpoint
            for cluster_id in server_clusters:
                # Look up proprietary cluster in registry
                cluster_meta = registry.get_cluster(cluster_id)
                if not cluster_meta:
                    continue

                # Only use clusters from matching vendor
                if cluster_meta.vendor_id and cluster_meta.vendor_id != vendor_id:
                    continue

                _LOGGER.debug(
                    "Found proprietary cluster %s (0x%08X) on node %d endpoint %d",
                    cluster_meta.name,
                    cluster_id,
                    node_id,
                    endpoint_id,
                )

                # Create sensor for each exposable attribute
                for attr_meta in cluster_meta.get_exposable_attributes():
                    # Only create sensors for now (not number entities)
                    if attr_meta.sensor and attr_meta.sensor.entity_type == "sensor":
                        entities.append(
                            ProprietaryAttributeSensor(
                                coordinator=coordinator,
                                node_id=node_id,
                                endpoint_id=endpoint_id,
                                cluster_id=cluster_id,
                                cluster_meta=cluster_meta,
                                attribute_meta=attr_meta,
                                matter_identifiers=matter_identifiers,
                                vendor_id=vendor_id,
                            )
                        )

    if entities:
        _LOGGER.info(
            "Setting up %d proprietary attribute sensors",
            len(entities),
        )
        async_add_entities(entities)


def _get_matter_identifiers(
    hass: HomeAssistant, node_data: dict[str, Any]
) -> set[tuple[str, str]] | None:
    """Get Matter device identifiers for linking entities to devices."""
    from homeassistant.helpers import device_registry as dr

    ha_device_id = node_data.get("ha_device_id")
    if not ha_device_id:
        return None

    device_registry = dr.async_get(hass)
    matter_device = device_registry.async_get(ha_device_id)
    if matter_device:
        return matter_device.identifiers

    return None


class ProprietaryAttributeSensor(
    CoordinatorEntity["MatterBindingCoordinator"], SensorEntity
):
    """Sensor entity for a proprietary cluster attribute.

    This sensor reads values from Matter node attributes for vendor-specific
    clusters and exposes them as Home Assistant sensor entities.
    """

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: MatterBindingCoordinator,
        node_id: int,
        endpoint_id: int,
        cluster_id: int,
        cluster_meta: ClusterMeta,
        attribute_meta: AttributeMeta,
        matter_identifiers: set[tuple[str, str]] | None,
        vendor_id: int | None,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)

        self._node_id = node_id
        self._endpoint_id = endpoint_id
        self._cluster_id = cluster_id
        self._cluster_meta = cluster_meta
        self._attr_meta = attribute_meta
        self._matter_identifiers = matter_identifiers
        self._vendor_id = vendor_id

        # Extract sensor metadata
        sensor = attribute_meta.sensor
        assert sensor is not None  # Guaranteed by caller

        # Set HA entity attributes from registry metadata
        if sensor.device_class and sensor.device_class in DEVICE_CLASS_MAP:
            self._attr_device_class = DEVICE_CLASS_MAP[sensor.device_class]

        if sensor.state_class and sensor.state_class in STATE_CLASS_MAP:
            self._attr_state_class = STATE_CLASS_MAP[sensor.state_class]

        if sensor.entity_category and sensor.entity_category in ENTITY_CATEGORY_MAP:
            self._attr_entity_category = ENTITY_CATEGORY_MAP[sensor.entity_category]

        if sensor.icon:
            self._attr_icon = sensor.icon

        if attribute_meta.unit:
            self._attr_native_unit_of_measurement = attribute_meta.unit

        self._scale = sensor.scale
        self._value_map = sensor.value_map

        # Unique ID: matter_prop_{node}_{endpoint}_{cluster}_{attr}
        self._attr_unique_id = (
            f"matter_prop_{node_id}_{endpoint_id}_"
            f"{cluster_id:08x}_{attribute_meta.id:08x}"
        )

        # Entity name from attribute name (converted from camelCase)
        self._attr_name = self._format_name(attribute_meta.name)

    @property
    def device_info(self) -> DeviceInfo | None:
        """Return device info to link this sensor to the Matter device."""
        if self._matter_identifiers:
            return DeviceInfo(identifiers=self._matter_identifiers)
        return None

    @property
    def native_value(self) -> float | int | str | None:
        """Return the sensor value."""
        raw_value = self._get_raw_value()
        if raw_value is None:
            return None

        # Apply value map if defined (for enum types)
        if self._value_map and isinstance(raw_value, int):
            return self._value_map.get(raw_value, str(raw_value))

        # Apply scale factor for numeric values
        if isinstance(raw_value, (int, float)) and self._scale != 1.0:
            return raw_value * self._scale

        return raw_value

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional state attributes."""
        return {
            "cluster_id": f"0x{self._cluster_id:08X}",
            "cluster_name": self._cluster_meta.name,
            "attribute_id": f"0x{self._attr_meta.id:08X}",
            "attribute_name": self._attr_meta.name,
            "node_id": self._node_id,
            "endpoint_id": self._endpoint_id,
        }

    def _get_raw_value(self) -> Any:
        """Get raw attribute value from coordinator data.

        The coordinator stores raw attribute values in a nested structure:
        data["proprietary_attributes"][(node_id, endpoint_id, cluster_id, attr_id)]
        """
        if not self.coordinator.data:
            return None

        prop_attrs = self.coordinator.data.get("proprietary_attributes", {})
        key = (
            self._node_id,
            self._endpoint_id,
            self._cluster_id,
            self._attr_meta.id,
        )
        return prop_attrs.get(key)

    @staticmethod
    def _format_name(camel_case: str) -> str:
        """Convert camelCase to Title Case with spaces.

        Examples:
            valvePosition -> Valve position
            temperatureOffset -> Temperature offset
        """
        if not camel_case:
            return camel_case

        # Insert space before uppercase letters and convert to lowercase
        result = []
        for i, char in enumerate(camel_case):
            if char.isupper() and i > 0:
                result.append(" ")
                result.append(char.lower())
            else:
                result.append(char)

        # Capitalize first letter
        name = "".join(result)
        return name[0].upper() + name[1:] if name else name
