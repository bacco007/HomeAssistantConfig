"""Demo mode infrastructure for Matter operations.

Provides mock data for UI development without real Matter devices.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant

from ..const import (
    ACL_AUTH_MODE_CASE,
    ACL_PRIVILEGE_ADMINISTER,
    CLUSTER_BINDING,
    CLUSTER_LEVEL_CONTROL,
    CLUSTER_ON_OFF,
    CONF_DEMO_MODE,
    DEFAULT_DEMO_MODE,
    DOMAIN,
)
from .models import ACLEntry, BindingEntry

_LOGGER = logging.getLogger(__name__)


def is_demo_mode(hass: HomeAssistant) -> bool:
    """Check if demo mode is enabled."""
    # Get demo mode from config entry options
    for entry in hass.config_entries.async_entries(DOMAIN):
        demo_mode = entry.options.get(CONF_DEMO_MODE, DEFAULT_DEMO_MODE)
        _LOGGER.debug("Demo mode check: %s", demo_mode)
        return demo_mode

    return DEFAULT_DEMO_MODE


def get_demo_nodes() -> list[dict[str, Any]]:
    """Return demo Matter nodes for UI development."""
    return [
        {
            "node_id": 1,
            "name": "Demo Light",
            "available": True,
            "device_info": {
                "vendor_name": "Demo Vendor",
                "vendor_id": 1234,
                "product_name": "Demo Light",
                "product_id": 1,
                "node_label": None,
                "hardware_version": "1.0",
                "software_version": "1.0.0",
            },
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 256, "revision": 2}],  # On/Off Light
                    "has_binding_cluster": True,
                    # Light is a SERVER for On/Off (receives commands)
                    # Binding is typically a server cluster on lights for group bindings
                    "server_clusters": [CLUSTER_ON_OFF, CLUSTER_BINDING],
                    "client_clusters": [],
                },
            ],
        },
        {
            "node_id": 2,
            "name": "Demo Switch",
            "available": True,
            "device_info": {
                "vendor_name": "Demo Vendor",
                "vendor_id": 1234,
                "product_name": "Demo Switch",
                "product_id": 2,
                "node_label": None,
                "hardware_version": "1.0",
                "software_version": "1.0.0",
            },
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 259, "revision": 2}],  # On/Off Light Switch
                    "has_binding_cluster": True,
                    # Switch is a CLIENT for On/Off (sends commands)
                    # Binding is a server cluster (stores where to send commands)
                    "server_clusters": [CLUSTER_BINDING],
                    "client_clusters": [CLUSTER_ON_OFF],
                },
            ],
        },
        {
            "node_id": 3,
            "name": "Demo Dimmer",
            "available": True,
            "device_info": {
                "vendor_name": "Demo Vendor",
                "vendor_id": 1234,
                "product_name": "Demo Dimmer",
                "product_id": 3,
                "node_label": None,
                "hardware_version": "1.0",
                "software_version": "2.1.0",
            },
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 257, "revision": 2}],  # Dimmable Light
                    "has_binding_cluster": True,
                    # Dimmable Light is a SERVER for On/Off and Level Control
                    "server_clusters": [
                        CLUSTER_ON_OFF,
                        CLUSTER_LEVEL_CONTROL,
                        CLUSTER_BINDING,
                    ],
                    "client_clusters": [],
                },
                {
                    "endpoint_id": 2,
                    "device_types": [{"id": 260, "revision": 2}],  # Dimmer Switch
                    "has_binding_cluster": True,
                    # Dimmer Switch is a CLIENT for On/Off and Level Control
                    "server_clusters": [CLUSTER_BINDING],
                    "client_clusters": [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL],
                },
            ],
        },
        {
            "node_id": 4,
            "name": "Demo Sensor",
            "available": False,  # Unavailable for demo
            "device_info": {
                "vendor_name": "Demo Sensors Inc",
                "vendor_id": 5678,
                "product_name": "Temperature Sensor",
                "product_id": 10,
                "node_label": None,
                "hardware_version": "2.0",
                "software_version": "1.2.3",
            },
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 770, "revision": 1}],  # Temperature Sensor
                    "has_binding_cluster": False,
                    # Temperature Sensor is a SERVER for Temperature Measurement
                    "server_clusters": [0x0402],  # Temperature Measurement
                    "client_clusters": [],
                },
            ],
        },
    ]


# Demo bindings storage (in-memory for demo mode)
_demo_bindings: dict[tuple[int, int], list[BindingEntry]] = {
    (2, 1): [  # Demo Switch endpoint 1 has a binding to Demo Light
        BindingEntry(
            node_id=2,
            endpoint_id=1,
            cluster_id=CLUSTER_ON_OFF,
            target_node_id=1,
            target_endpoint_id=1,
        ),
    ],
    (3, 2): [  # Demo Dimmer endpoint 2 has a binding to Demo Dimmer endpoint 1
        BindingEntry(
            node_id=3,
            endpoint_id=2,
            cluster_id=CLUSTER_LEVEL_CONTROL,
            target_node_id=3,
            target_endpoint_id=1,
        ),
    ],
}


# Default ACL entries for demo mode
_demo_acl_default: list[ACLEntry] = [
    ACLEntry(
        privilege=ACL_PRIVILEGE_ADMINISTER,
        auth_mode=ACL_AUTH_MODE_CASE,
        subjects=[1],  # HA fabric node
        targets=[],  # All resources
        fabric_index=1,
    ),
]


# Per-node ACL storage for demo mode (stores ACLEntry objects)
_demo_acl_entries: dict[int, list[ACLEntry]] = {}


def get_demo_bindings(node_id: int, endpoint_id: int) -> list[BindingEntry]:
    """Get demo bindings for a node/endpoint."""
    return _demo_bindings.get((node_id, endpoint_id), [])


def set_demo_bindings(
    node_id: int, endpoint_id: int, bindings: list[BindingEntry]
) -> None:
    """Set demo bindings for a node/endpoint."""
    _demo_bindings[(node_id, endpoint_id)] = bindings


def add_demo_binding(binding: BindingEntry) -> None:
    """Add a binding to demo storage."""
    key = (binding.node_id, binding.endpoint_id)
    if key not in _demo_bindings:
        _demo_bindings[key] = []
    _demo_bindings[key].append(binding)


def remove_demo_binding(
    node_id: int,
    endpoint_id: int,
    target_node_id: int | None,
    target_endpoint_id: int | None,
    target_group_id: int | None,
    cluster_id: int | None,
) -> bool:
    """Remove all matching bindings from demo storage.

    Returns True if at least one binding was removed.

    Note: This removes ALL matching bindings, not just the first one,
    to match the behavior of the original matter_client.py implementation.
    """
    key = (node_id, endpoint_id)
    if key not in _demo_bindings:
        return False

    original_count = len(_demo_bindings[key])

    # Filter out all matching bindings (remove ALL matches, not just first)
    _demo_bindings[key] = [
        b
        for b in _demo_bindings[key]
        if not _binding_matches_for_delete(
            b, target_node_id, target_endpoint_id, target_group_id, cluster_id
        )
    ]

    return len(_demo_bindings[key]) < original_count


def _binding_matches_for_delete(
    binding: BindingEntry,
    target_node_id: int | None,
    target_endpoint_id: int | None,
    target_group_id: int | None,
    cluster_id: int | None,
) -> bool:
    """Check if a binding matches the delete criteria.

    Uses the same matching logic as the original matter_client.py:
    - If target_node_id is provided, it must match
    - If target_endpoint_id is provided, it must match
    - target_group_id is always compared (None == None is a match)
    - If cluster_id is provided, it must match
    """
    # Match target_node_id if provided
    if target_node_id is not None and binding.target_node_id != target_node_id:
        return False

    # Match target_endpoint_id if provided
    if (
        target_endpoint_id is not None
        and binding.target_endpoint_id != target_endpoint_id
    ):
        return False

    # Always compare target_group_id (None == None matches)
    if binding.target_group_id != target_group_id:
        return False

    # Match cluster_id if provided
    if cluster_id is not None and binding.cluster_id != cluster_id:
        return False

    return True


def get_demo_acl(node_id: int) -> list[ACLEntry]:
    """Get demo ACL entries for a node."""
    return _demo_acl_entries.get(node_id, _demo_acl_default.copy())


def set_demo_acl(node_id: int, entries: list[ACLEntry]) -> None:
    """Set demo ACL entries for a node."""
    _demo_acl_entries[node_id] = entries


def add_demo_acl_entry(node_id: int, entry: ACLEntry) -> None:
    """Add an ACL entry to demo storage for a node."""
    if node_id not in _demo_acl_entries:
        _demo_acl_entries[node_id] = _demo_acl_default.copy()
    _demo_acl_entries[node_id].append(entry)


def remove_demo_acl_entry(node_id: int, source_node_id: int | None = None) -> bool:
    """Remove ACL entries matching the source node ID from demo storage.

    Args:
        node_id: The node whose ACL to modify
        source_node_id: If provided, remove entries where this node is in subjects

    Returns:
        True if at least one entry was removed, False otherwise.
    """
    if node_id not in _demo_acl_entries:
        return False

    if source_node_id is None:
        return False

    original_count = len(_demo_acl_entries[node_id])

    # Filter out entries that have source_node_id in their subjects
    _demo_acl_entries[node_id] = [
        entry
        for entry in _demo_acl_entries[node_id]
        if source_node_id not in entry.subjects
    ]

    return len(_demo_acl_entries[node_id]) < original_count


def reset_demo_data() -> None:
    """Reset all demo data to initial state."""
    global _demo_bindings, _demo_acl_entries

    _demo_bindings = {
        (2, 1): [
            BindingEntry(
                node_id=2,
                endpoint_id=1,
                cluster_id=CLUSTER_ON_OFF,
                target_node_id=1,
                target_endpoint_id=1,
            ),
        ],
        (3, 2): [
            BindingEntry(
                node_id=3,
                endpoint_id=2,
                cluster_id=CLUSTER_LEVEL_CONTROL,
                target_node_id=3,
                target_endpoint_id=1,
            ),
        ],
    }

    _demo_acl_entries = {}
