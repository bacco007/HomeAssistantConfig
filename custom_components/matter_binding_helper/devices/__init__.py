"""Matter Device Definitions Registry.

This module provides access to the Matter device definitions registry,
which contains metadata about proprietary Matter device clusters and attributes.

The registry is loaded from a bundled JSON file that is generated from the
TypeScript definitions in the matter-device-definitions package.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

_LOGGER = logging.getLogger(__name__)

# Path to bundled registry JSON (generated from TypeScript definitions)
REGISTRY_PATH = Path(__file__).parent / "registry.json"

# Cached registry data
_registry: dict[str, Any] | None = None


def get_registry() -> dict[str, Any]:
    """Get the device registry.

    Returns:
        The device registry dictionary containing devices and clusters.
    """
    global _registry
    if _registry is None:
        _registry = _load_registry()
    return _registry


def _load_registry() -> dict[str, Any]:
    """Load the registry from the bundled JSON file.

    Returns:
        The loaded registry dictionary.
    """
    if not REGISTRY_PATH.exists():
        _LOGGER.warning(
            "Device registry not found at %s. Using empty registry.", REGISTRY_PATH
        )
        return {"version": "0.0.0", "devices": [], "clusters": []}

    try:
        with open(REGISTRY_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        _LOGGER.error("Failed to load device registry: %s", e)
        return {"version": "0.0.0", "devices": [], "clusters": []}


def find_device(
    vendor_id: int,
    cluster_ids: list[int] | None = None,
    device_types: list[int] | None = None,
) -> dict[str, Any] | None:
    """Find a device definition by fingerprint matching.

    Args:
        vendor_id: Matter vendor ID
        cluster_ids: Cluster IDs present on the device
        device_types: Device type IDs present on the device

    Returns:
        Matching device definition or None
    """
    registry = get_registry()

    for device in registry.get("devices", []):
        fingerprint = device.get("fingerprint", {})

        # Vendor ID must match
        if fingerprint.get("vendorId") != vendor_id:
            continue

        # If required clusters are specified, all must be present
        required_clusters = fingerprint.get("requiredClusters")
        if required_clusters and cluster_ids:
            if not all(c in cluster_ids for c in required_clusters):
                continue

        # If required device types are specified, all must be present
        required_types = fingerprint.get("requiredDeviceTypes")
        if required_types and device_types:
            if not all(t in device_types for t in required_types):
                continue

        return device

    return None


def get_cluster(cluster_id: int) -> dict[str, Any] | None:
    """Get a cluster definition by ID.

    Args:
        cluster_id: Cluster ID to look up

    Returns:
        Cluster definition or None
    """
    registry = get_registry()

    for cluster in registry.get("clusters", []):
        if cluster.get("id") == cluster_id:
            return cluster

    return None


def get_cluster_name(cluster_id: int) -> str | None:
    """Get the human-readable name of a cluster.

    Args:
        cluster_id: Cluster ID to look up

    Returns:
        Cluster name or None if not found
    """
    cluster = get_cluster(cluster_id)
    return cluster.get("name") if cluster else None


def get_attribute_name(cluster_id: int, attribute_id: int) -> str | None:
    """Get the human-readable name of an attribute.

    Args:
        cluster_id: Cluster ID
        attribute_id: Attribute ID

    Returns:
        Attribute name or None if not found
    """
    cluster = get_cluster(cluster_id)
    if not cluster:
        return None

    for attr in cluster.get("attributes", []):
        if attr.get("id") == attribute_id:
            return attr.get("name")

    return None


def get_vendor_clusters(vendor_id: int) -> list[dict[str, Any]]:
    """Get all clusters for a specific vendor.

    Args:
        vendor_id: Vendor ID

    Returns:
        List of cluster definitions
    """
    registry = get_registry()
    return [
        cluster
        for cluster in registry.get("clusters", [])
        if cluster.get("vendorId") == vendor_id
    ]


def get_vendor_devices(vendor_id: int) -> list[dict[str, Any]]:
    """Get all devices for a specific vendor.

    Args:
        vendor_id: Vendor ID

    Returns:
        List of device definitions
    """
    registry = get_registry()
    return [
        device
        for device in registry.get("devices", [])
        if device.get("fingerprint", {}).get("vendorId") == vendor_id
    ]
