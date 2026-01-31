"""Access Control List (ACL) operations for Matter devices."""

from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant

from ..const import (
    ACL_AUTH_MODE_CASE,
    ACL_PRIVILEGE_ADMINISTER,
    ACL_PRIVILEGE_OPERATE,
    ACL_VERIFY_INTERVAL,
    ACL_VERIFY_TIMEOUT,
    ATTR_ACL,
    CLUSTER_ACCESS_CONTROL,
    EVENT_ACL_PROGRESS,
)
from .client import get_raw_matter_client
from .demo import get_demo_acl, is_demo_mode, set_demo_acl
from .models import (
    ACLEntry,
    ACLProvisioningResult,
    ACLTarget,
    OperationErrorType,
)
from .utils import (
    check_node_available,
    get_cluster_privilege,
    get_user_friendly_error,
    parse_error_type,
)

if TYPE_CHECKING:
    from matter_server.client import MatterClient

_LOGGER = logging.getLogger(__name__)


def _get_acl_from_node_cache(client: "MatterClient", node_id: int) -> list | None:
    """Try to get ACL from the node's cached endpoint 0 data.

    Returns None if ACL is not found in the cache.
    Returns empty list if the ACL attribute exists but is empty.
    """
    try:
        for node in client.get_nodes():
            if node.node_id != node_id:
                continue

            # ACL is always on endpoint 0
            endpoints = getattr(node, "endpoints", None)
            if not endpoints:
                _LOGGER.debug(
                    "_get_acl_from_node_cache: Node %s has no endpoints", node_id
                )
                return None

            endpoint = endpoints.get(0)
            if not endpoint:
                _LOGGER.debug(
                    "_get_acl_from_node_cache: Node %s has no endpoint 0", node_id
                )
                return None

            # Method 1: Try get_cluster() to get the AccessControl cluster
            if hasattr(endpoint, "get_cluster"):
                acl_cluster = endpoint.get_cluster(CLUSTER_ACCESS_CONTROL)
                _LOGGER.info(
                    "_get_acl_from_node_cache: Method 1 - get_cluster(%s) returned: %s (type=%s)",
                    CLUSTER_ACCESS_CONTROL,
                    acl_cluster,
                    type(acl_cluster).__name__ if acl_cluster else None,
                )
                if acl_cluster:
                    # Try to get the ACL attribute from the cluster
                    has_acl = hasattr(acl_cluster, "acl")
                    _LOGGER.info(
                        "_get_acl_from_node_cache: Method 1 - has .acl=%s",
                        has_acl,
                    )
                    if has_acl:
                        acl_value = acl_cluster.acl
                        _LOGGER.info(
                            "_get_acl_from_node_cache: Method 1 - cluster.acl type=%s, value=%s",
                            type(acl_value).__name__,
                            acl_value,
                        )
                        return acl_value
                    elif hasattr(acl_cluster, "get_attribute_value"):
                        acl_value = acl_cluster.get_attribute_value(ATTR_ACL)
                        _LOGGER.info(
                            "_get_acl_from_node_cache: Method 1 - get_attribute_value: %s",
                            acl_value,
                        )
                        return acl_value

            # Method 2: Try node.attributes dict directly
            node_attributes = getattr(node, "attributes", {})
            if node_attributes:
                attr_key = f"0/{CLUSTER_ACCESS_CONTROL}/{ATTR_ACL}"
                if attr_key in node_attributes:
                    acl_value = node_attributes[attr_key]
                    _LOGGER.debug(
                        "_get_acl_from_node_cache: Found via node.attributes[%s]: %s",
                        attr_key,
                        acl_value,
                    )
                    return acl_value

            # Method 3: Try node_data.attributes (raw Matter data)
            # Keys are strings in format "endpoint/cluster/attribute" e.g. "0/31/0"
            node_data = getattr(node, "node_data", None)
            if node_data:
                node_data_attrs = getattr(node_data, "attributes", {})
                if node_data_attrs:
                    # Direct key lookup: "0/31/0" (endpoint 0, cluster 31, attribute 0)
                    acl_key = f"0/{CLUSTER_ACCESS_CONTROL}/{ATTR_ACL}"
                    if acl_key in node_data_attrs:
                        value = node_data_attrs[acl_key]
                        _LOGGER.debug(
                            "_get_acl_from_node_cache: Found via direct key[%s]: %s",
                            acl_key,
                            value,
                        )
                        return value

                    # Fallback: iterate and check for matching pattern
                    for key, value in node_data_attrs.items():
                        key_str = str(key)
                        # Check exact match or pattern match
                        if key_str == acl_key or (
                            key_str.startswith("0/")
                            and "/31/" in key_str
                            and key_str.endswith("/0")
                        ):
                            _LOGGER.debug(
                                "_get_acl_from_node_cache: Found via pattern key[%s]: %s",
                                key_str,
                                value,
                            )
                            return value

            return None

    except Exception as err:
        _LOGGER.debug("_get_acl_from_node_cache: Error: %s", err)
        return None

    return None


async def get_acl(hass: HomeAssistant, node_id: int) -> list[ACLEntry]:
    """Get Access Control List entries for a node.

    ACL is always read from endpoint 0, cluster 0x001F (Access Control), attribute 0.
    """
    # Check for demo mode first
    if is_demo_mode(hass):
        _LOGGER.debug("Demo mode enabled, returning demo ACL for node %s", node_id)
        return get_demo_acl(node_id)

    client = get_raw_matter_client(hass)
    if not client:
        _LOGGER.warning("get_acl: Matter client not available")
        return []

    acl_entries: list[ACLEntry] = []
    result = None

    try:
        # First, try to get ACL from node cache
        result = _get_acl_from_node_cache(client, node_id)
        _LOGGER.info(
            "get_acl: _get_acl_from_node_cache returned type=%s, is_list=%s, len=%s",
            type(result).__name__,
            isinstance(result, list),
            len(result) if isinstance(result, list) else "N/A",
        )
        if result is not None:
            _LOGGER.debug(
                "get_acl: Found %d ACL entries in node cache for node %s",
                len(result) if isinstance(result, list) else 0,
                node_id,
            )
        else:
            # Fall back to reading via read_attribute API
            attribute_path = f"0/{CLUSTER_ACCESS_CONTROL}/{ATTR_ACL}"
            _LOGGER.debug(
                "get_acl: No cached ACL, trying read_attribute for node %s path %s",
                node_id,
                attribute_path,
            )

            result = await client.read_attribute(
                node_id=node_id,
                attribute_path=attribute_path,
            )

            _LOGGER.debug(
                "get_acl: read_attribute returned type=%s, value=%s",
                type(result).__name__,
                result,
            )

        if result and isinstance(result, list):
            for entry in result:
                acl_entry = _parse_acl_entry(entry)
                if acl_entry:
                    acl_entries.append(acl_entry)

    except Exception as err:
        _LOGGER.error(
            "Error reading ACL for node %s: %s",
            node_id,
            err,
            exc_info=True,
        )

    _LOGGER.debug(
        "get_acl: Returning %d ACL entries for node %s",
        len(acl_entries),
        node_id,
    )
    return acl_entries


def _parse_acl_entry(entry: Any) -> ACLEntry | None:
    """Parse an ACL entry from various formats."""

    def _get_value(obj: Any, *keys: Any, default: Any = None) -> Any:
        """Get value from dict or object attributes."""
        # Try dict access first
        if isinstance(obj, dict):
            for k in keys:
                if k in obj and obj[k] is not None:
                    return obj[k]
        else:
            # Try attribute access for struct objects
            for k in keys:
                if isinstance(k, str) and hasattr(obj, k):
                    val = getattr(obj, k, None)
                    if val is not None:
                        return val
        return default

    def _safe_int(val: Any) -> int | None:
        """Convert value to int, handling Nullable and other special types."""
        if val is None:
            return None
        # Check for Matter SDK Nullable type (has a Null attribute)
        if hasattr(val, "Null"):
            return None
        # Check for NullValue class name pattern
        if type(val).__name__ in ("Nullable", "NullValue"):
            return None
        try:
            return int(val)
        except (TypeError, ValueError):
            return None

    try:
        privilege = _get_value(entry, "1", 1, "privilege", "Privilege", default=0)
        auth_mode = _get_value(entry, "2", 2, "authMode", "AuthMode", default=0)
        subjects = _get_value(entry, "3", 3, "subjects", "Subjects", default=[])
        raw_targets = _get_value(entry, "4", 4, "targets", "Targets", default=[])
        fabric_index = _get_value(
            entry, "254", 254, "fabricIndex", "FabricIndex", default=0
        )

        # Parse targets if present (raw_targets may be Nullable, not a list)
        targets: list[ACLTarget] = []
        if raw_targets and isinstance(raw_targets, list):
            for t in raw_targets:
                cluster_val = _get_value(t, "0", 0, "cluster", "Cluster", default=None)
                endpoint_val = _get_value(
                    t, "1", 1, "endpoint", "Endpoint", default=None
                )
                device_type_val = _get_value(
                    t, "2", 2, "deviceType", "DeviceType", default=None
                )
                targets.append(
                    ACLTarget(
                        cluster=_safe_int(cluster_val),
                        endpoint=_safe_int(endpoint_val),
                        device_type=_safe_int(device_type_val),
                    )
                )

        # Convert subjects to native Python ints for JSON serialization
        subjects_list = []
        if isinstance(subjects, list):
            for s in subjects:
                subjects_list.append(int(s) if s is not None else None)

        return ACLEntry(
            privilege=int(privilege) if privilege is not None else 0,
            auth_mode=int(auth_mode) if auth_mode is not None else 0,
            subjects=subjects_list,
            targets=targets,
            fabric_index=int(fabric_index) if fabric_index is not None else 0,
        )

    except Exception as err:
        _LOGGER.debug("Error parsing ACL entry: %s", err)
        return None


def build_acl_entry_for_binding(
    source_node_id: int,
    target_endpoint_id: int,
    cluster_id: int,
) -> dict[str, Any]:
    """Build an ACL entry dict for a binding.

    Creates an ACL entry that allows the source node to operate
    on the target endpoint's cluster.

    Args:
        source_node_id: The node ID that needs access (source of binding)
        target_endpoint_id: The endpoint on the target device
        cluster_id: The cluster to grant access to

    Returns:
        Dict in Matter ACL entry format
    """
    privilege = get_cluster_privilege(cluster_id)

    return {
        "privilege": privilege,
        "authMode": ACL_AUTH_MODE_CASE,  # Device-to-device communication
        "subjects": [source_node_id],  # Only this node can use this entry
        "targets": [
            {
                "cluster": cluster_id,
                "endpoint": target_endpoint_id,
                "deviceType": None,
            }
        ],
        "fabricIndex": 0,  # Device sets this automatically
    }


def acl_entry_exists(
    existing_entries: list[ACLEntry],
    source_node_id: int,
    target_endpoint_id: int | None,
    cluster_id: int | None,
) -> bool:
    """Check if an ACL entry already grants the required access.

    Checks for:
    1. Exact match (same subject, endpoint, cluster)
    2. Wildcard match (entry allows all endpoints or all clusters)

    Args:
        existing_entries: Current ACL entries on the target device
        source_node_id: The node that needs access
        target_endpoint_id: The endpoint to access (None = any)
        cluster_id: The cluster to access (None = any)

    Returns:
        True if sufficient access already exists
    """
    required_privilege = (
        get_cluster_privilege(cluster_id) if cluster_id else ACL_PRIVILEGE_OPERATE
    )

    for entry in existing_entries:
        # Check privilege level (must be >= required)
        if entry.privilege < required_privilege:
            continue

        # Check auth mode (CASE for device-to-device)
        if entry.auth_mode != ACL_AUTH_MODE_CASE:
            continue

        # Check if source node is allowed
        # Empty subjects = all nodes with this auth mode
        if entry.subjects and source_node_id not in entry.subjects:
            continue

        # Check targets
        if not entry.targets:
            # Empty targets = all endpoints and clusters
            return True

        for target in entry.targets:
            # Check endpoint match (None in target = any endpoint)
            endpoint_match = (
                target.endpoint is None or target.endpoint == target_endpoint_id
            )
            # Check cluster match (None in target = any cluster)
            cluster_match = target.cluster is None or target.cluster == cluster_id

            if endpoint_match and cluster_match:
                return True

    return False


def acl_entry_to_dict(entry: ACLEntry) -> dict[str, Any]:
    """Convert an ACLEntry to dict format for writing to device.

    Args:
        entry: The ACL entry to convert

    Returns:
        Dict in Matter ACL write format
    """
    targets = None
    if entry.targets:
        targets = [
            {
                "cluster": t.cluster,
                "endpoint": t.endpoint,
                "deviceType": t.device_type,
            }
            for t in entry.targets
        ]

    return {
        "privilege": entry.privilege,
        "authMode": entry.auth_mode,
        "subjects": entry.subjects if entry.subjects else None,
        "targets": targets,
        "fabricIndex": 0,  # Device sets this automatically
    }


async def write_acl(
    hass: HomeAssistant,
    node_id: int,
    acl_entries: list[dict[str, Any]],
) -> ACLProvisioningResult:
    """Write the complete ACL list to a device.

    ACL is always written to endpoint 0, cluster 0x001F, attribute 0.
    This REPLACES the entire ACL for the current fabric.

    IMPORTANT: The admin entry must be FIRST in the list to prevent lockout.

    Args:
        hass: Home Assistant instance
        node_id: Target node ID
        acl_entries: Complete list of ACL entries to write

    Returns:
        ACLProvisioningResult indicating success/failure
    """
    # SAFETY CHECK: Ensure we have at least one admin entry to prevent lockout
    has_admin = any(
        entry.get("privilege") == ACL_PRIVILEGE_ADMINISTER for entry in acl_entries
    )
    if not has_admin:
        _LOGGER.error(
            "write_acl: SAFETY BLOCK - Refusing to write ACL without admin entry "
            "to node %s. This would lock out Home Assistant.",
            node_id,
        )
        return ACLProvisioningResult(
            success=False,
            message="Safety block: Cannot write ACL without admin entry",
            error_type=OperationErrorType.INVALID_REQUEST,
        )

    # SAFETY CHECK: Ensure admin entry is first in the list
    if acl_entries and acl_entries[0].get("privilege") != ACL_PRIVILEGE_ADMINISTER:
        _LOGGER.warning(
            "write_acl: Admin entry is not first in the list for node %s. "
            "Reordering to prevent lockout.",
            node_id,
        )
        # Move admin entries to the front
        admin_entries = [
            e for e in acl_entries if e.get("privilege") == ACL_PRIVILEGE_ADMINISTER
        ]
        other_entries = [
            e for e in acl_entries if e.get("privilege") != ACL_PRIVILEGE_ADMINISTER
        ]
        acl_entries = admin_entries + other_entries

    # Handle demo mode
    if is_demo_mode(hass):
        _LOGGER.debug("Demo mode: write_acl for node %s", node_id)
        # Store in demo ACL entries
        demo_entries: list[ACLEntry] = []
        for entry in acl_entries:
            targets = []
            if entry.get("targets"):
                for t in entry["targets"]:
                    targets.append(
                        ACLTarget(
                            cluster=t.get("cluster"),
                            endpoint=t.get("endpoint"),
                            device_type=t.get("deviceType"),
                        )
                    )
            demo_entries.append(
                ACLEntry(
                    privilege=entry.get("privilege", ACL_PRIVILEGE_OPERATE),
                    auth_mode=entry.get("authMode", ACL_AUTH_MODE_CASE),
                    subjects=entry.get("subjects") or [],
                    targets=targets,
                    fabric_index=entry.get("fabricIndex", 1),
                )
            )
        set_demo_acl(node_id, demo_entries)
        return ACLProvisioningResult(
            success=True,
            message="Demo mode: ACL written",
            acl_entries_count=len(acl_entries),
        )

    client = get_raw_matter_client(hass)
    if not client:
        return ACLProvisioningResult(
            success=False,
            message="Matter client not available",
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )

    # Pre-check: Is the device available?
    is_available, unavail_msg = check_node_available(client, node_id)
    if not is_available:
        return ACLProvisioningResult(
            success=False,
            message=get_user_friendly_error(
                OperationErrorType.DEVICE_UNAVAILABLE, Exception(unavail_msg or "")
            ),
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )

    try:
        _LOGGER.info(
            "write_acl: Writing %d ACL entries to node %s",
            len(acl_entries),
            node_id,
        )

        # Log the entries being written for debugging
        for i, entry in enumerate(acl_entries):
            _LOGGER.debug("write_acl: Entry %d: %s", i, entry)

        # Use the dedicated SET_ACL_ENTRY API for ACL writes
        # This is more reliable than generic write_attribute
        result = await client.send_command(
            "set_acl_entry",
            node_id=node_id,
            entry=acl_entries,
        )

        _LOGGER.info(
            "write_acl: set_acl_entry result: %s (type=%s)",
            result,
            type(result).__name__,
        )

        # Check the result for errors
        if result is not None:
            failed_entries = []
            if isinstance(result, list):
                for i, write_result in enumerate(result):
                    status = None
                    if isinstance(write_result, dict):
                        status = write_result.get("Status") or write_result.get(
                            "status"
                        )
                    elif hasattr(write_result, "Status"):
                        status = write_result.Status
                    elif hasattr(write_result, "status"):
                        status = write_result.status

                    if status is not None and status != 0:
                        failed_entries.append((i, status))
                        _LOGGER.error(
                            "write_acl: Entry %d failed with status %s", i, status
                        )

            if failed_entries:
                return ACLProvisioningResult(
                    success=False,
                    message=f"ACL write partially failed: {len(failed_entries)} entries rejected",
                    acl_entries_count=len(acl_entries) - len(failed_entries),
                    error_type=OperationErrorType.DEVICE_REJECTED,
                )

        return ACLProvisioningResult(
            success=True,
            message=f"Successfully wrote {len(acl_entries)} ACL entries",
            acl_entries_count=len(acl_entries),
        )

    except Exception as err:
        _LOGGER.error("Error writing ACL to node %s: %s", node_id, err, exc_info=True)
        error_type = parse_error_type(err)
        return ACLProvisioningResult(
            success=False,
            message=get_user_friendly_error(error_type, err),
            error_type=error_type,
        )


async def add_acl_entry(
    hass: HomeAssistant,
    node_id: int,
    source_node_id: int,
    target_endpoint_id: int,
    cluster_id: int,
) -> ACLProvisioningResult:
    """Add an ACL entry to allow a source node to access a target endpoint/cluster.

    Reads the current ACL, checks if entry already exists, and appends if needed.
    Admin entries are kept first to prevent lockout during write.

    Args:
        hass: Home Assistant instance
        node_id: Target device node ID (receives the ACL entry)
        source_node_id: Source node ID that needs access
        target_endpoint_id: Endpoint to grant access to
        cluster_id: Cluster to grant access to

    Returns:
        ACLProvisioningResult indicating success/failure
    """
    try:
        # Get current ACL entries
        current_entries = await get_acl(hass, node_id)

        # Check if entry already exists
        if acl_entry_exists(
            current_entries, source_node_id, target_endpoint_id, cluster_id
        ):
            _LOGGER.info(
                "add_acl_entry: ACL entry already exists for node %s -> "
                "node %s ep %s cluster 0x%04X",
                source_node_id,
                node_id,
                target_endpoint_id,
                cluster_id,
            )
            return ACLProvisioningResult(
                success=True,
                message="ACL entry already exists",
                acl_entries_count=len(current_entries),
            )

        # Separate admin entries from others (admin entries must come first)
        admin_entries = [
            e for e in current_entries if e.privilege == ACL_PRIVILEGE_ADMINISTER
        ]
        other_entries = [
            e for e in current_entries if e.privilege != ACL_PRIVILEGE_ADMINISTER
        ]

        # Build the new ACL entry
        new_entry = build_acl_entry_for_binding(
            source_node_id=source_node_id,
            target_endpoint_id=target_endpoint_id,
            cluster_id=cluster_id,
        )

        # Convert existing entries back to dict format for write
        acl_list: list[dict[str, Any]] = []

        for entry in admin_entries:
            acl_list.append(acl_entry_to_dict(entry))

        for entry in other_entries:
            acl_list.append(acl_entry_to_dict(entry))

        # Append new entry
        acl_list.append(new_entry)

        _LOGGER.info(
            "add_acl_entry: Adding ACL entry for node %s -> node %s ep %s cluster 0x%04X",
            source_node_id,
            node_id,
            target_endpoint_id,
            cluster_id,
        )

        # Write the updated ACL
        write_result = await write_acl(hass, node_id, acl_list)

        if not write_result.success:
            return write_result

        # Read-after-write verification with polling
        max_attempts = ACL_VERIFY_TIMEOUT // ACL_VERIFY_INTERVAL

        _LOGGER.debug(
            "add_acl_entry: Verifying ACL entry was persisted for node %s (polling up to %ds)",
            node_id,
            ACL_VERIFY_TIMEOUT,
        )

        # Fire initial progress event
        hass.bus.async_fire(
            EVENT_ACL_PROGRESS,
            {
                "target_node_id": node_id,
                "source_node_id": source_node_id,
                "status": "verifying",
                "attempt": 0,
                "max_attempts": max_attempts,
                "timeout_seconds": ACL_VERIFY_TIMEOUT,
                "message": "Verifying ACL was saved to device...",
            },
        )

        verified_entries: list[ACLEntry] = []
        for attempt in range(max_attempts):
            verified_entries = await get_acl(hass, node_id)

            if acl_entry_exists(
                verified_entries, source_node_id, target_endpoint_id, cluster_id
            ):
                _LOGGER.info(
                    "add_acl_entry: Verified ACL entry persisted on node %s (%d total entries) after %d attempt(s)",
                    node_id,
                    len(verified_entries),
                    attempt + 1,
                )
                # Fire success event
                hass.bus.async_fire(
                    EVENT_ACL_PROGRESS,
                    {
                        "target_node_id": node_id,
                        "source_node_id": source_node_id,
                        "status": "success",
                        "attempt": attempt + 1,
                        "max_attempts": max_attempts,
                        "message": "ACL verified successfully",
                    },
                )
                return ACLProvisioningResult(
                    success=True,
                    message=f"Successfully added ACL entry ({len(verified_entries)} total)",
                    acl_entries_count=len(verified_entries),
                )

            # Entry not found yet, wait and retry
            if attempt < max_attempts - 1:
                elapsed = (attempt + 1) * ACL_VERIFY_INTERVAL
                remaining = ACL_VERIFY_TIMEOUT - elapsed
                _LOGGER.debug(
                    "add_acl_entry: ACL entry not found on attempt %d/%d for node %s, retrying in %ds...",
                    attempt + 1,
                    max_attempts,
                    node_id,
                    ACL_VERIFY_INTERVAL,
                )
                # Fire retry progress event
                hass.bus.async_fire(
                    EVENT_ACL_PROGRESS,
                    {
                        "target_node_id": node_id,
                        "source_node_id": source_node_id,
                        "status": "retrying",
                        "attempt": attempt + 1,
                        "max_attempts": max_attempts,
                        "elapsed_seconds": elapsed,
                        "remaining_seconds": remaining,
                        "message": f"Waiting for device to process ACL... ({remaining}s remaining)",
                    },
                )
                await asyncio.sleep(ACL_VERIFY_INTERVAL)

        # Exhausted all attempts
        _LOGGER.error(
            "add_acl_entry: VERIFICATION FAILED - ACL entry not found after %d seconds! "
            "source_node=%s, target_node=%s, endpoint=%s, cluster=0x%04X. "
            "Device may have rejected the entry silently.",
            ACL_VERIFY_TIMEOUT,
            source_node_id,
            node_id,
            target_endpoint_id,
            cluster_id,
        )
        # Fire failure event
        hass.bus.async_fire(
            EVENT_ACL_PROGRESS,
            {
                "target_node_id": node_id,
                "source_node_id": source_node_id,
                "status": "failed",
                "attempt": max_attempts,
                "max_attempts": max_attempts,
                "message": f"ACL verification failed after {ACL_VERIFY_TIMEOUT}s",
            },
        )
        return ACLProvisioningResult(
            success=False,
            message=f"ACL write appeared to succeed but entry not found on device after {ACL_VERIFY_TIMEOUT}s. "
            "The device may have rejected the entry.",
            acl_entries_count=len(verified_entries),
            error_type=OperationErrorType.DEVICE_REJECTED,
        )

    except Exception as err:
        _LOGGER.error("Error adding ACL entry: %s", err, exc_info=True)
        error_type = parse_error_type(err)
        return ACLProvisioningResult(
            success=False,
            message=get_user_friendly_error(error_type, err),
            error_type=error_type,
        )


async def remove_acl_entry(
    hass: HomeAssistant,
    node_id: int,
    source_node_id: int,
    target_endpoint_id: int | None = None,
    cluster_id: int | None = None,
) -> ACLProvisioningResult:
    """Remove an ACL entry from a device.

    Finds and removes ACL entries matching the source node and target criteria.
    Admin entries are preserved first to prevent lockout.

    Args:
        hass: Home Assistant instance
        node_id: Target device node ID
        source_node_id: Source node ID to remove access for
        target_endpoint_id: Specific endpoint (None = match any)
        cluster_id: Specific cluster (None = match any)

    Returns:
        ACLProvisioningResult indicating success/failure
    """
    try:
        # Get current ACL entries
        current_entries = await get_acl(hass, node_id)

        # Filter out entries that match the criteria
        admin_entries: list[ACLEntry] = []
        kept_entries: list[ACLEntry] = []
        removed_count = 0

        for entry in current_entries:
            # Always keep admin entries
            if entry.privilege == ACL_PRIVILEGE_ADMINISTER:
                admin_entries.append(entry)
                continue

            should_remove = False

            # Check if this entry grants access to source_node_id
            subject_match = (
                source_node_id in entry.subjects if entry.subjects else False
            )

            if subject_match:
                # Check targets for match
                if not entry.targets:
                    # Wildcard entry - only remove if subjects is exactly [source_node_id]
                    if entry.subjects == [source_node_id]:
                        should_remove = True
                else:
                    for target in entry.targets:
                        endpoint_match = (
                            target_endpoint_id is None
                            or target.endpoint == target_endpoint_id
                        )
                        cluster_match = (
                            cluster_id is None or target.cluster == cluster_id
                        )

                        if endpoint_match and cluster_match:
                            should_remove = True
                            break

            if should_remove:
                removed_count += 1
            else:
                kept_entries.append(entry)

        if removed_count == 0:
            return ACLProvisioningResult(
                success=True,
                message="No matching ACL entry found to remove",
                acl_entries_count=len(current_entries),
            )

        # Build ACL list with admin first, then kept entries
        acl_list: list[dict[str, Any]] = []

        for entry in admin_entries:
            acl_list.append(acl_entry_to_dict(entry))

        for entry in kept_entries:
            acl_list.append(acl_entry_to_dict(entry))

        _LOGGER.info(
            "remove_acl_entry: Removing %d ACL entries from node %s for source %s",
            removed_count,
            node_id,
            source_node_id,
        )

        # Write the filtered ACL
        return await write_acl(hass, node_id, acl_list)

    except Exception as err:
        _LOGGER.error("Error removing ACL entry: %s", err, exc_info=True)
        error_type = parse_error_type(err)
        return ACLProvisioningResult(
            success=False,
            message=get_user_friendly_error(error_type, err),
            error_type=error_type,
        )


async def provision_acl_for_binding(
    hass: HomeAssistant,
    source_node_id: int,
    target_node_id: int,
    target_endpoint_id: int,
    cluster_id: int,
) -> ACLProvisioningResult:
    """Provision an ACL entry on the target device for a binding.

    This is the main entry point for ACL provisioning when creating bindings.
    Adds an ACL entry on the target device that allows the source device
    to operate on the specified endpoint/cluster.

    Args:
        hass: Home Assistant instance
        source_node_id: Node that will send commands (binding source)
        target_node_id: Node that will receive commands (binding target)
        target_endpoint_id: Endpoint on target node
        cluster_id: Cluster ID for the binding

    Returns:
        ACLProvisioningResult
    """
    _LOGGER.info(
        "provision_acl_for_binding: node %s -> node %s ep %s cluster 0x%04X",
        source_node_id,
        target_node_id,
        target_endpoint_id,
        cluster_id,
    )

    return await add_acl_entry(
        hass=hass,
        node_id=target_node_id,
        source_node_id=source_node_id,
        target_endpoint_id=target_endpoint_id,
        cluster_id=cluster_id,
    )


# Backwards compatibility aliases
_get_acl_from_node_cache = _get_acl_from_node_cache
_build_acl_entry_for_binding = build_acl_entry_for_binding
_acl_entry_exists = acl_entry_exists
_acl_entry_to_dict = acl_entry_to_dict
