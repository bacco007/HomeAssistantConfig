"""Utility functions for Matter operations."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from ..const import (
    CLUSTER_PRIVILEGE_MAP,
    DEFAULT_CLUSTER_PRIVILEGE,
)
from .models import BindingEntry, OperationErrorType

if TYPE_CHECKING:
    from matter_server.client import MatterClient

_LOGGER = logging.getLogger(__name__)


def parse_error_type(err: Exception) -> OperationErrorType:
    """Parse an exception to determine the error type."""
    error_str = str(err).lower()

    # Check for permission/access errors
    if any(
        keyword in error_str
        for keyword in ["unsupported", "access", "permission", "denied", "not allowed"]
    ):
        return OperationErrorType.PERMISSION_DENIED

    # Check for timeout errors
    if any(keyword in error_str for keyword in ["timeout", "timed out"]):
        return OperationErrorType.DEVICE_TIMEOUT

    # Check for unavailability errors
    if any(
        keyword in error_str
        for keyword in ["unavailable", "offline", "not reachable", "disconnected"]
    ):
        return OperationErrorType.DEVICE_UNAVAILABLE

    # Check for invalid request errors
    if any(
        keyword in error_str
        for keyword in ["invalid", "malformed", "not found", "does not exist"]
    ):
        return OperationErrorType.INVALID_REQUEST

    return OperationErrorType.UNKNOWN_ERROR


def get_user_friendly_error(error_type: OperationErrorType, original: Exception) -> str:
    """Get a user-friendly error message for the given error type."""
    messages = {
        OperationErrorType.PERMISSION_DENIED: (
            "Permission denied. Check if Home Assistant has administrator access "
            "to this device."
        ),
        OperationErrorType.DEVICE_UNAVAILABLE: (
            "Device is unavailable. Ensure it's powered on and connected to the network."
        ),
        OperationErrorType.DEVICE_TIMEOUT: (
            "Device did not respond. It may be busy or temporarily unreachable."
        ),
        OperationErrorType.DEVICE_REJECTED: (
            "Device rejected the operation. This may be a device limitation or "
            "security policy."
        ),
        OperationErrorType.INVALID_REQUEST: (
            "Invalid request. The operation parameters may be incorrect."
        ),
    }
    return messages.get(error_type, f"Operation failed: {original}")


def check_node_available(
    client: "MatterClient", node_id: int
) -> tuple[bool, str | None]:
    """Check if a node is available.

    Returns:
        Tuple of (is_available, error_message if not available)
    """
    try:
        nodes = client.get_nodes()
        node = next((n for n in nodes if n.node_id == node_id), None)
        if node is None:
            return False, f"Node {node_id} not found"
        if not node.available:
            return False, f"Node {node_id} is currently unavailable"
        return True, None
    except Exception as err:
        _LOGGER.warning("Error checking node availability: %s", err)
        # Don't block operation if we can't check availability
        return True, None


def binding_matches(
    binding: BindingEntry,
    target_node_id: int | None,
    target_endpoint_id: int | None,
    target_group_id: int | None,
    cluster_id: int | None = None,
) -> bool:
    """Check if a binding matches the given target parameters."""
    if target_node_id is not None and binding.target_node_id != target_node_id:
        return False
    if (
        target_endpoint_id is not None
        and binding.target_endpoint_id != target_endpoint_id
    ):
        return False
    if target_group_id is not None and binding.target_group_id != target_group_id:
        return False
    if cluster_id is not None and binding.cluster_id != cluster_id:
        return False
    return True


def get_cluster_privilege(cluster_id: int) -> int:
    """Get the required ACL privilege level for a cluster.

    Maps standard Matter cluster IDs to their typical required privilege levels.
    Most control clusters require OPERATE privilege (3).

    Args:
        cluster_id: The Matter cluster ID

    Returns:
        The ACL privilege level (1=View, 3=Operate, 4=Manage, 5=Administer)
    """
    return CLUSTER_PRIVILEGE_MAP.get(cluster_id, DEFAULT_CLUSTER_PRIVILEGE)
