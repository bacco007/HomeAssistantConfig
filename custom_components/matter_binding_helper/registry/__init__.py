"""Proprietary device registry for Matter devices.

This module loads and provides access to proprietary cluster and attribute
metadata from the device-definitions registry. It enables automatic creation
of sensors for vendor-specific Matter attributes.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

_LOGGER = logging.getLogger(__name__)


@dataclass
class SensorMeta:
    """Home Assistant sensor metadata for an attribute."""

    entity_type: str  # sensor, binary_sensor, number
    device_class: str | None = None
    state_class: str | None = None
    entity_category: str | None = None
    scale: float = 1.0
    icon: str | None = None
    value_map: dict[int, str] = field(default_factory=dict)


@dataclass
class AttributeMeta:
    """Metadata for a cluster attribute."""

    id: int
    name: str
    type: str | dict[str, Any]
    access: list[str]
    description: str | None = None
    unit: str | None = None
    parser: str | None = None
    sensor: SensorMeta | None = None

    @property
    def is_readable(self) -> bool:
        """Check if attribute is readable."""
        return "R" in self.access

    @property
    def is_subscribable(self) -> bool:
        """Check if attribute supports subscriptions."""
        return "S" in self.access

    @property
    def has_sensor(self) -> bool:
        """Check if attribute should be exposed as HA entity."""
        return self.sensor is not None


@dataclass
class ClusterMeta:
    """Metadata for a proprietary cluster."""

    id: int
    vendor_id: int | None
    name: str
    description: str | None = None
    attributes: dict[int, AttributeMeta] = field(default_factory=dict)

    def get_exposable_attributes(self) -> list[AttributeMeta]:
        """Get attributes that should be exposed as HA entities."""
        return [attr for attr in self.attributes.values() if attr.has_sensor]


@dataclass
class DeviceMeta:
    """Metadata for a device definition."""

    id: str
    vendor: str
    model: str
    vendor_id: int
    description: str | None = None
    required_clusters: list[int] = field(default_factory=list)
    required_device_types: list[int] = field(default_factory=list)
    product_url: str | None = None


class ProprietaryRegistry:
    """Registry of proprietary Matter cluster and attribute metadata.

    This registry is loaded from a bundled JSON file generated from the
    device-definitions TypeScript package. It provides lookup functions
    for clusters and their attributes.
    """

    _instance: ProprietaryRegistry | None = None
    _loaded: bool = False
    _clusters: dict[int, ClusterMeta] = {}
    _devices: list[DeviceMeta] = []

    def __new__(cls) -> ProprietaryRegistry:
        """Singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def get(cls) -> ProprietaryRegistry:
        """Get the registry instance, loading if necessary."""
        instance = cls()
        if not cls._loaded:
            instance.load()
        return instance

    def load(self) -> None:
        """Load registry from bundled JSON file."""
        if self._loaded:
            return

        registry_path = Path(__file__).parent / "device-registry.json"

        try:
            with open(registry_path, encoding="utf-8") as f:
                data = json.load(f)

            self._load_clusters(data.get("clusters", []))
            self._load_devices(data.get("devices", []))

            self._loaded = True
            _LOGGER.debug(
                "Loaded proprietary registry: %d clusters, %d devices",
                len(self._clusters),
                len(self._devices),
            )

        except FileNotFoundError:
            _LOGGER.warning("Proprietary registry file not found: %s", registry_path)
        except json.JSONDecodeError as err:
            _LOGGER.error("Failed to parse proprietary registry: %s", err)

    def _load_clusters(self, clusters_data: list[dict[str, Any]]) -> None:
        """Load cluster definitions from JSON data."""
        for cluster_data in clusters_data:
            cluster_id = cluster_data["id"]

            # Parse attributes
            attributes: dict[int, AttributeMeta] = {}
            for attr_data in cluster_data.get("attributes", []):
                attr = self._parse_attribute(attr_data)
                attributes[attr.id] = attr

            cluster = ClusterMeta(
                id=cluster_id,
                vendor_id=cluster_data.get("vendorId"),
                name=cluster_data["name"],
                description=cluster_data.get("description"),
                attributes=attributes,
            )
            self._clusters[cluster_id] = cluster

    def _parse_attribute(self, data: dict[str, Any]) -> AttributeMeta:
        """Parse an attribute definition from JSON data."""
        sensor_meta = None
        if sensor_data := data.get("sensor"):
            sensor_meta = SensorMeta(
                entity_type=sensor_data["entityType"],
                device_class=sensor_data.get("deviceClass"),
                state_class=sensor_data.get("stateClass"),
                entity_category=sensor_data.get("entityCategory"),
                scale=sensor_data.get("scale", 1.0),
                icon=sensor_data.get("icon"),
                value_map=sensor_data.get("valueMap", {}),
            )

        return AttributeMeta(
            id=data["id"],
            name=data["name"],
            type=data["type"],
            access=data.get("access", ["R"]),
            description=data.get("description"),
            unit=data.get("unit"),
            parser=data.get("parser"),
            sensor=sensor_meta,
        )

    def _load_devices(self, devices_data: list[dict[str, Any]]) -> None:
        """Load device definitions from JSON data."""
        for device_data in devices_data:
            fingerprint = device_data.get("fingerprint", {})

            device = DeviceMeta(
                id=device_data["id"],
                vendor=device_data["vendor"],
                model=device_data["model"],
                vendor_id=fingerprint.get("vendorId", 0),
                description=device_data.get("description"),
                required_clusters=fingerprint.get("requiredClusters", []),
                required_device_types=fingerprint.get("requiredDeviceTypes", []),
                product_url=device_data.get("productUrl"),
            )
            self._devices.append(device)

    def get_cluster(self, cluster_id: int) -> ClusterMeta | None:
        """Get cluster metadata by ID."""
        return self._clusters.get(cluster_id)

    def get_attribute(self, cluster_id: int, attribute_id: int) -> AttributeMeta | None:
        """Get attribute metadata by cluster and attribute ID."""
        cluster = self._clusters.get(cluster_id)
        if cluster:
            return cluster.attributes.get(attribute_id)
        return None

    def get_exposable_attributes(self, cluster_id: int) -> list[AttributeMeta]:
        """Get attributes that should be exposed as HA entities."""
        cluster = self._clusters.get(cluster_id)
        if cluster:
            return cluster.get_exposable_attributes()
        return []

    def is_proprietary_cluster(self, cluster_id: int) -> bool:
        """Check if a cluster ID is a known proprietary cluster."""
        return cluster_id in self._clusters

    def find_device(
        self,
        vendor_id: int,
        cluster_ids: list[int] | None = None,
        device_types: list[int] | None = None,
    ) -> DeviceMeta | None:
        """Find a device definition by fingerprint matching."""
        for device in self._devices:
            if device.vendor_id != vendor_id:
                continue

            # Check required clusters
            if device.required_clusters and cluster_ids:
                if not all(c in cluster_ids for c in device.required_clusters):
                    continue

            # Check required device types
            if device.required_device_types and device_types:
                if not all(t in device_types for t in device.required_device_types):
                    continue

            return device

        return None

    @property
    def all_clusters(self) -> list[ClusterMeta]:
        """Get all registered clusters."""
        return list(self._clusters.values())

    @property
    def all_devices(self) -> list[DeviceMeta]:
        """Get all registered devices."""
        return list(self._devices)
