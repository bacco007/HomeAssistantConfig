"""Binding operations for Matter devices."""

from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant

from ..const import CLUSTER_BINDING
from .acl import provision_acl_for_binding, remove_acl_entry
from .client import get_raw_matter_client
from .group_keys import _accessing_fabric_index
from .groups import provision_group_for_binding, teardown_group_for_binding
from .demo import (
    add_demo_binding,
    get_demo_bindings,
    is_demo_mode,
    remove_demo_binding,
)
from .models import BindingEntry, BindingVerificationResult, OperationErrorType
from .utils import (
    binding_matches,
    check_node_available,
    get_user_friendly_error,
    parse_error_type,
)

if TYPE_CHECKING:
    from matter_server.client import MatterClient

_LOGGER = logging.getLogger(__name__)


async def get_bindings(
    hass: HomeAssistant, node_id: int, endpoint_id: int
) -> list[BindingEntry]:
    """Get bindings for a specific node endpoint."""
    # Check for demo mode first
    if is_demo_mode(hass):
        _LOGGER.debug(
            "Demo mode enabled, returning demo bindings for node %s endpoint %s",
            node_id,
            endpoint_id,
        )
        return get_demo_bindings(node_id, endpoint_id)

    client = get_raw_matter_client(hass)
    if not client:
        _LOGGER.warning("get_bindings: Matter client not available")
        return []

    bindings = []
    try:
        # First, try to get bindings from node's cached endpoint data
        bindings_from_cache = _get_bindings_from_node_cache(
            client, node_id, endpoint_id
        )
        if bindings_from_cache is not None:
            _LOGGER.debug(
                "get_bindings: Found %d bindings from node cache for node %s ep %s",
                len(bindings_from_cache),
                node_id,
                endpoint_id,
            )
            return bindings_from_cache

        # Fall back to reading via read_attribute API
        _LOGGER.debug(
            "get_bindings: No cached bindings, trying read_attribute for node %s ep %s",
            node_id,
            endpoint_id,
        )
        attribute_path = f"{endpoint_id}/{CLUSTER_BINDING}/0"
        _LOGGER.debug(
            "get_bindings: Calling read_attribute with path: %s", attribute_path
        )

        result = await client.read_attribute(
            node_id=node_id,
            attribute_path=attribute_path,
        )

        _LOGGER.debug(
            "get_bindings: read_attribute returned type=%s, value=%s",
            type(result).__name__,
            result,
        )

        # read_attribute may wrap the value as {"<ep>/<cluster>/0": value}; unwrap
        # and parse through _parse_binding_value so camelCase and matter.js's
        # numeric TLV tag keys are both handled.
        if isinstance(result, dict) and attribute_path in result:
            result = result[attribute_path]
        bindings = _parse_binding_value(node_id, endpoint_id, result)
    except Exception as err:
        _LOGGER.error(
            "Error reading bindings for node %s endpoint %s: %s",
            node_id,
            endpoint_id,
            err,
            exc_info=True,
        )

    _LOGGER.debug(
        "get_bindings: Returning %d bindings for node %s ep %s",
        len(bindings),
        node_id,
        endpoint_id,
    )
    return bindings


def _get_bindings_from_node_cache(
    client: "MatterClient", node_id: int, endpoint_id: int
) -> list[BindingEntry] | None:
    """Try to get bindings from the node's cached endpoint data.

    Uses the MatterEndpoint object's get_cluster() or get_attribute_value() methods
    to access binding data from the matter-server's cache.

    Returns None if bindings are not found in the cache.
    Returns empty list if the binding attribute exists but is empty.
    """
    try:
        for node in client.get_nodes():
            if node.node_id != node_id:
                continue

            # Access the endpoint from node.endpoints dict
            endpoints = getattr(node, "endpoints", None)
            if not endpoints:
                _LOGGER.debug(
                    "_get_bindings_from_node_cache: Node %s has no endpoints", node_id
                )
                return None

            endpoint = endpoints.get(endpoint_id)
            if not endpoint:
                _LOGGER.debug(
                    "_get_bindings_from_node_cache: Node %s has no endpoint %s",
                    node_id,
                    endpoint_id,
                )
                return None

            _LOGGER.debug(
                "_get_bindings_from_node_cache: Found endpoint %s (type=%s), available methods: %s",
                endpoint_id,
                type(endpoint).__name__,
                [m for m in dir(endpoint) if not m.startswith("_")][:15],
            )

            binding_value = None

            # Method 1: Try get_cluster() to get the Binding cluster
            if hasattr(endpoint, "get_cluster"):
                binding_cluster = endpoint.get_cluster(CLUSTER_BINDING)
                _LOGGER.debug(
                    "_get_bindings_from_node_cache: get_cluster(%s) returned: %s (type=%s)",
                    CLUSTER_BINDING,
                    binding_cluster,
                    type(binding_cluster).__name__ if binding_cluster else None,
                )
                if binding_cluster:
                    # Try to get the Binding attribute (attribute 0) from the cluster
                    if hasattr(binding_cluster, "binding"):
                        binding_value = binding_cluster.binding
                        _LOGGER.debug(
                            "_get_bindings_from_node_cache: Found via cluster.binding: %s",
                            binding_value,
                        )
                    elif hasattr(binding_cluster, "get_attribute_value"):
                        binding_value = binding_cluster.get_attribute_value(0)
                        _LOGGER.debug(
                            "_get_bindings_from_node_cache: Found via cluster.get_attribute_value(0): %s",
                            binding_value,
                        )
                    elif isinstance(binding_cluster, dict):
                        binding_value = binding_cluster.get(0) or binding_cluster.get(
                            "binding"
                        )
                        _LOGGER.debug(
                            "_get_bindings_from_node_cache: Found via cluster dict: %s",
                            binding_value,
                        )
                    else:
                        # Log available attributes on the cluster
                        cluster_attrs = [
                            a for a in dir(binding_cluster) if not a.startswith("_")
                        ]
                        _LOGGER.debug(
                            "_get_bindings_from_node_cache: Binding cluster attrs: %s",
                            cluster_attrs,
                        )

            # Method 2: Try endpoint.get_attribute_value() directly
            if binding_value is None and hasattr(endpoint, "get_attribute_value"):
                try:
                    binding_value = endpoint.get_attribute_value(CLUSTER_BINDING, 0)
                    _LOGGER.debug(
                        "_get_bindings_from_node_cache: endpoint.get_attribute_value(%s, 0) returned: %s",
                        CLUSTER_BINDING,
                        binding_value,
                    )
                except Exception as attr_err:
                    _LOGGER.debug(
                        "_get_bindings_from_node_cache: get_attribute_value failed: %s",
                        attr_err,
                    )

            # Method 3: Try accessing clusters dict directly
            if binding_value is None and hasattr(endpoint, "clusters"):
                clusters = endpoint.clusters
                _LOGGER.debug(
                    "_get_bindings_from_node_cache: endpoint.clusters type=%s, keys=%s",
                    type(clusters).__name__,
                    list(clusters.keys()) if isinstance(clusters, dict) else "N/A",
                )
                if isinstance(clusters, dict):
                    binding_cluster = clusters.get(CLUSTER_BINDING)
                    if binding_cluster:
                        _LOGGER.debug(
                            "_get_bindings_from_node_cache: Found binding cluster in dict: %s (type=%s)",
                            binding_cluster,
                            type(binding_cluster).__name__,
                        )
                        # Try to get binding attribute
                        if hasattr(binding_cluster, "binding"):
                            binding_value = binding_cluster.binding
                        elif isinstance(binding_cluster, dict):
                            binding_value = binding_cluster.get(
                                0
                            ) or binding_cluster.get("binding")

            if binding_value is None:
                _LOGGER.debug(
                    "_get_bindings_from_node_cache: No binding value found for node %s ep %s",
                    node_id,
                    endpoint_id,
                )
                return None

            # Parse the binding value into BindingEntry objects
            return _parse_binding_value(node_id, endpoint_id, binding_value)

        _LOGGER.debug("_get_bindings_from_node_cache: Node %s not found", node_id)
        return None

    except Exception as err:
        _LOGGER.debug("_get_bindings_from_node_cache: Error: %s", err, exc_info=True)
        return None


def _parse_binding_value(
    node_id: int, endpoint_id: int, binding_value: Any
) -> list[BindingEntry]:
    """Parse a binding attribute value into BindingEntry objects."""
    bindings = []

    if not binding_value:
        return bindings

    if not isinstance(binding_value, list):
        _LOGGER.debug(
            "_parse_binding_value: binding_value is not a list: type=%s, value=%s",
            type(binding_value).__name__,
            binding_value,
        )
        return bindings

    _LOGGER.debug(
        "_parse_binding_value: Parsing %d binding entries", len(binding_value)
    )

    for binding in binding_value:
        _LOGGER.debug(
            "_parse_binding_value: Processing entry: %s (type=%s)",
            binding,
            type(binding).__name__,
        )

        # Extract binding fields - handle various formats
        # cluster_id can be None (meaning "any cluster" per Matter spec)
        cluster_id: int | None = None
        target_node = None
        target_endpoint = None
        target_group = None

        if isinstance(binding, dict):
            # Dict format - try multiple key naming conventions. matter.js returns
            # the Binding TargetStruct keyed by numeric TLV tags (node=1, group=2,
            # endpoint=3, cluster=4); python-matter-server uses camelCase names.
            # Use explicit None check to allow cluster_id=0 (which is falsy but valid)
            for key in ("Cluster", "cluster", "ClusterId", "clusterId", "4"):
                if key in binding and binding[key] is not None:
                    cluster_id = binding[key]
                    break
            target_node = (
                binding.get("Node")
                or binding.get("node")
                or binding.get("NodeId")
                or binding.get("nodeId")
                or binding.get("1")
            )
            target_endpoint = (
                binding.get("Endpoint")
                or binding.get("endpoint")
                or binding.get("EndpointId")
                or binding.get("endpointId")
                or binding.get("3")
            )
            target_group = (
                binding.get("Group")
                or binding.get("group")
                or binding.get("GroupId")
                or binding.get("groupId")
                or binding.get("2")
            )
        elif hasattr(binding, "cluster"):
            # Object with snake_case attributes
            # cluster can be None (meaning "any cluster" per Matter spec)
            cluster_id = getattr(binding, "cluster", None)
            target_node = getattr(binding, "node", None)
            target_endpoint = getattr(binding, "endpoint", None)
            target_group = getattr(binding, "group", None)

        entry = BindingEntry(
            node_id=node_id,
            endpoint_id=endpoint_id,
            cluster_id=cluster_id,
            target_node_id=target_node,
            target_endpoint_id=target_endpoint,
            target_group_id=target_group,
        )
        bindings.append(entry)
        _LOGGER.debug("_parse_binding_value: Created BindingEntry: %s", entry)

    return bindings


async def verify_bindings(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
) -> BindingVerificationResult:
    """Force re-read bindings from device and verify they match cached state.

    This bypasses the cache and reads directly from the Matter device to
    confirm the actual binding state.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID to verify

    Returns:
        BindingVerificationResult with verification status
    """
    # Handle demo mode
    if is_demo_mode(hass):
        cached = get_demo_bindings(node_id, endpoint_id)
        return BindingVerificationResult(
            success=True,
            verified=True,
            message=f"Demo mode: {len(cached)} bindings verified",
            bindings_found=len(cached),
        )

    client = get_raw_matter_client(hass)
    if not client:
        return BindingVerificationResult(
            success=False,
            verified=False,
            message="Matter client not available",
        )

    try:
        _LOGGER.info(
            "verify_bindings: Force reading bindings from node %s endpoint %s",
            node_id,
            endpoint_id,
        )

        # Read directly from device using read_attribute API
        attribute_path = f"{endpoint_id}/{CLUSTER_BINDING}/0"
        result = await client.read_attribute(
            node_id=node_id,
            attribute_path=attribute_path,
        )

        _LOGGER.debug(
            "verify_bindings: read_attribute returned type=%s, value=%s",
            type(result).__name__,
            result,
        )

        if result is None:
            return BindingVerificationResult(
                success=True,
                verified=True,
                message="No bindings found on device (empty)",
                bindings_found=0,
            )

        # Parse the bindings
        bindings = _parse_binding_value(node_id, endpoint_id, result)

        _LOGGER.info(
            "verify_bindings: Successfully verified %d bindings on node %s endpoint %s",
            len(bindings),
            node_id,
            endpoint_id,
        )

        return BindingVerificationResult(
            success=True,
            verified=True,
            message=f"Verified {len(bindings)} bindings on device",
            bindings_found=len(bindings),
        )

    except Exception as err:
        _LOGGER.error("verify_bindings: Error reading bindings: %s", err, exc_info=True)
        error_type = parse_error_type(err)
        return BindingVerificationResult(
            success=False,
            verified=False,
            message=get_user_friendly_error(error_type, err),
            error_type=error_type,
        )


def _binding_entry(
    target: dict[str, Any], tag_keys: bool, fabric_index: int = 1
) -> dict[str, Any]:
    """Render one Binding TargetStruct entry in camelCase or numeric TLV tag keys.

    matter.js only persists tag-keyed list-of-struct entries (Binding tags:
    node=1, group=2, endpoint=3, cluster=4, fabricIndex=254); python-matter-server
    accepts either. The fabric index must be the real accessing fabric: chip
    coerces a 0, but matter.js writes it literally and rs-matter rejects
    fabricIndex 0 with CONSTRAINT_ERROR.
    """
    cluster = target["cluster"]
    node = target.get("node")
    endpoint = target.get("endpoint")
    group = target.get("group")
    if tag_keys:
        entry: dict[str, Any] = {"4": cluster, "254": fabric_index}
        if node is not None:
            entry["1"] = node
        if group is not None:
            entry["2"] = group
        if endpoint is not None:
            entry["3"] = endpoint
        return entry
    entry = {"cluster": cluster, "fabricIndex": fabric_index}
    if node is not None:
        entry["node"] = node
    if endpoint is not None:
        entry["endpoint"] = endpoint
    if group is not None:
        entry["group"] = group
    return entry


async def create_binding(
    hass: HomeAssistant,
    source_node_id: int,
    source_endpoint_id: int,
    cluster_id: int,
    target_node_id: int | None = None,
    target_endpoint_id: int | None = None,
    target_group_id: int | None = None,
    verify: bool = True,
    provision_acl: bool = True,
    provision_group: bool = True,
) -> BindingVerificationResult:
    """Create a new binding with optional verification and ACL provisioning.

    Args:
        hass: Home Assistant instance
        source_node_id: Source Matter node ID
        source_endpoint_id: Source endpoint ID
        cluster_id: Cluster ID for the binding
        target_node_id: Target node ID (for unicast binding)
        target_endpoint_id: Target endpoint ID (for unicast binding)
        target_group_id: Target group ID (for group binding)
        verify: If True, verify the binding was created by reading back
        provision_acl: If True, provision ACL on target device (unicast only)
        provision_group: If True, provision group key/ACL on members (group only)

    Returns:
        BindingVerificationResult with success/verification status
    """
    # Handle demo mode
    if is_demo_mode(hass):
        _LOGGER.debug(
            "Demo mode: creating binding for node %s endpoint %s",
            source_node_id,
            source_endpoint_id,
        )
        binding = BindingEntry(
            node_id=source_node_id,
            endpoint_id=source_endpoint_id,
            cluster_id=cluster_id,
            target_node_id=target_node_id,
            target_endpoint_id=target_endpoint_id,
            target_group_id=target_group_id,
        )
        add_demo_binding(binding)
        cached = get_demo_bindings(source_node_id, source_endpoint_id)
        return BindingVerificationResult(
            success=True,
            verified=True,
            message="Demo mode: binding created",
            bindings_found=len(cached),
        )

    client = get_raw_matter_client(hass)
    if not client:
        _LOGGER.error("create_binding: Matter client not available")
        return BindingVerificationResult(
            success=False,
            verified=False,
            message="Matter client not available",
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )

    # Pre-check: Is the source device available?
    is_available, unavail_msg = check_node_available(client, source_node_id)
    if not is_available:
        _LOGGER.warning("create_binding: Source node unavailable: %s", unavail_msg)
        return BindingVerificationResult(
            success=False,
            verified=False,
            message=get_user_friendly_error(
                OperationErrorType.DEVICE_UNAVAILABLE, Exception(unavail_msg or "")
            ),
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )

    try:
        _LOGGER.info(
            "create_binding: Creating binding from node %s ep %s to node %s ep %s (cluster %s)",
            source_node_id,
            source_endpoint_id,
            target_node_id,
            target_endpoint_id,
            cluster_id,
        )

        # Get current bindings
        current_bindings = await get_bindings(hass, source_node_id, source_endpoint_id)
        _LOGGER.debug(
            "create_binding: Current bindings count: %d", len(current_bindings)
        )

        # Targets to write: existing bindings plus the new one. Kept as plain
        # field tuples so the list can be rendered in either key format below.
        targets = [
            {
                "cluster": b.cluster_id,
                "node": b.target_node_id,
                "endpoint": b.target_endpoint_id,
                "group": b.target_group_id,
            }
            for b in current_bindings
        ]
        targets.append(
            {
                "cluster": cluster_id,
                "node": target_node_id,
                "endpoint": target_endpoint_id,
                "group": target_group_id,
            }
        )

        # Write the binding attribute. Like GroupKeyMap, Binding is a fabric-scoped
        # list-of-struct: python-matter-server accepts camelCase field names, but
        # matter.js silently drops entries it can't map and only persists numeric
        # TLV tag keys. Write camelCase first, read back, and retry with tag keys
        # on a miss so both backends work.
        attribute_path = f"{source_endpoint_id}/{CLUSTER_BINDING}/0"
        _LOGGER.info("create_binding: Writing to attribute path: %s", attribute_path)

        # Binding is fabric-scoped: rs-matter rejects fabricIndex 0 with
        # CONSTRAINT_ERROR when the controller (matter.js) writes it literally.
        fabric_index = await _accessing_fabric_index(client, source_node_id)
        for tag_keys in (False, True):
            binding_list = [_binding_entry(t, tag_keys, fabric_index) for t in targets]
            _LOGGER.debug(
                "create_binding: writing binding list (%s keys): %s",
                "tag" if tag_keys else "name",
                binding_list,
            )
            result = await client.write_attribute(
                node_id=source_node_id,
                attribute_path=attribute_path,
                value=binding_list,
            )
            _LOGGER.info("create_binding: write_attribute result: %s", result)

            # Poll the readback: matter-server's attribute cache lags a fresh
            # fabric-scoped write, so a single immediate read can false-negative a
            # write that succeeded.
            persisted = False
            for _ in range(5):
                read_back = await get_bindings(hass, source_node_id, source_endpoint_id)
                if any(
                    binding_matches(
                        b,
                        target_node_id,
                        target_endpoint_id,
                        target_group_id,
                        cluster_id,
                    )
                    for b in read_back
                ):
                    persisted = True
                    break
                await asyncio.sleep(1.5)
            if persisted:
                if tag_keys:
                    _LOGGER.info("create_binding: binding accepted using tag keys")
                break
        else:
            _LOGGER.warning(
                "create_binding: binding did not persist on node %s after "
                "camelCase and tag-key writes",
                source_node_id,
            )

        # Provision ACL on target device if requested (for unicast bindings)
        acl_result = None
        if (
            provision_acl
            and target_node_id is not None
            and target_endpoint_id is not None
        ):
            _LOGGER.info(
                "create_binding: Provisioning ACL on target node %s for source node %s",
                target_node_id,
                source_node_id,
            )
            acl_result = await provision_acl_for_binding(
                hass=hass,
                source_node_id=source_node_id,
                target_node_id=target_node_id,
                target_endpoint_id=target_endpoint_id,
                cluster_id=cluster_id,
            )

            if not acl_result.success:
                _LOGGER.warning(
                    "create_binding: ACL provisioning failed: %s "
                    "(binding was still created)",
                    acl_result.message,
                )
            else:
                _LOGGER.info("create_binding: ACL provisioned successfully")

        # Provision group key + ACL on members for a groupcast binding
        elif provision_group and target_group_id is not None:
            _LOGGER.info(
                "create_binding: Provisioning groupcast binding source %s -> group %s",
                source_node_id,
                target_group_id,
            )
            group_result = await provision_group_for_binding(
                hass=hass,
                source_node_id=source_node_id,
                group_id=target_group_id,
                cluster_id=cluster_id,
            )
            if not group_result.success:
                _LOGGER.warning(
                    "create_binding: group provisioning failed: %s "
                    "(binding was still created)",
                    group_result.message,
                )
            else:
                _LOGGER.info("create_binding: group binding provisioned successfully")

        # Verify the binding was created if requested
        if verify:
            _LOGGER.info("create_binding: Verifying binding was written to device...")

            # Small delay to allow device to process
            await asyncio.sleep(0.2)

            # Read back bindings directly from device
            verification = await verify_bindings(
                hass, source_node_id, source_endpoint_id
            )

            if not verification.success:
                return BindingVerificationResult(
                    success=True,  # Write succeeded
                    verified=False,
                    message=f"Binding written but verification failed: {verification.message}",
                    bindings_found=verification.bindings_found,
                )

            # Check if our new binding is present
            read_bindings = await get_bindings(hass, source_node_id, source_endpoint_id)
            binding_found = any(
                binding_matches(
                    b, target_node_id, target_endpoint_id, target_group_id, cluster_id
                )
                for b in read_bindings
            )

            if binding_found:
                _LOGGER.info("create_binding: Binding verified successfully on device")
                return BindingVerificationResult(
                    success=True,
                    verified=True,
                    message="Binding created and verified on device",
                    bindings_found=len(read_bindings),
                )
            else:
                _LOGGER.warning(
                    "create_binding: Binding was written but not found when reading back"
                )
                return BindingVerificationResult(
                    success=True,
                    verified=False,
                    message=get_user_friendly_error(
                        OperationErrorType.DEVICE_REJECTED,
                        Exception("binding not found"),
                    ),
                    bindings_found=len(read_bindings),
                    error_type=OperationErrorType.DEVICE_REJECTED,
                )

        return BindingVerificationResult(
            success=True,
            verified=False,  # Not verified because verify=False
            message="Binding written (verification skipped)",
            bindings_found=len(binding_list),
        )

    except Exception as err:
        _LOGGER.error("Error creating binding: %s", err, exc_info=True)
        error_type = parse_error_type(err)
        return BindingVerificationResult(
            success=False,
            verified=False,
            message=get_user_friendly_error(error_type, err),
            error_type=error_type,
        )


async def delete_binding(
    hass: HomeAssistant,
    source_node_id: int,
    source_endpoint_id: int,
    target_node_id: int | None = None,
    target_endpoint_id: int | None = None,
    target_group_id: int | None = None,
    cluster_id: int | None = None,
    verify: bool = True,
    remove_acl: bool = True,
    remove_group: bool = True,
) -> BindingVerificationResult:
    """Delete a binding with optional verification and ACL cleanup.

    Args:
        hass: Home Assistant instance
        source_node_id: Source Matter node ID
        source_endpoint_id: Source endpoint ID
        target_node_id: Target node ID to delete (for unicast binding)
        target_endpoint_id: Target endpoint ID to delete (for unicast binding)
        target_group_id: Target group ID to delete (for group binding)
        cluster_id: Cluster ID of binding to delete (optional, for ACL cleanup)
        verify: If True, verify the binding was deleted by reading back
        remove_acl: If True, remove ACL entry from target device (unicast only)

    Returns:
        BindingVerificationResult with success/verification status
    """
    # Handle demo mode
    if is_demo_mode(hass):
        _LOGGER.debug(
            "Demo mode: deleting binding for node %s endpoint %s",
            source_node_id,
            source_endpoint_id,
        )
        removed = remove_demo_binding(
            source_node_id,
            source_endpoint_id,
            target_node_id,
            target_endpoint_id,
            target_group_id,
            cluster_id,
        )
        cached = get_demo_bindings(source_node_id, source_endpoint_id)
        if removed:
            return BindingVerificationResult(
                success=True,
                verified=True,
                message="Demo mode: binding deleted",
                bindings_found=len(cached),
            )
        return BindingVerificationResult(
            success=False,
            verified=False,
            message="Demo mode: binding not found",
            bindings_found=len(cached),
        )

    client = get_raw_matter_client(hass)
    if not client:
        return BindingVerificationResult(
            success=False,
            verified=False,
            message="Matter client not available",
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )

    # Pre-check: Is the source device available?
    is_available, unavail_msg = check_node_available(client, source_node_id)
    if not is_available:
        _LOGGER.warning("delete_binding: Source node unavailable: %s", unavail_msg)
        return BindingVerificationResult(
            success=False,
            verified=False,
            message=get_user_friendly_error(
                OperationErrorType.DEVICE_UNAVAILABLE, Exception(unavail_msg or "")
            ),
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )

    try:
        _LOGGER.info(
            "delete_binding: Deleting binding from node %s ep %s to node %s ep %s",
            source_node_id,
            source_endpoint_id,
            target_node_id,
            target_endpoint_id,
        )

        # Get current bindings
        current_bindings = await get_bindings(hass, source_node_id, source_endpoint_id)

        # Find the binding(s) being deleted to get cluster_id for ACL cleanup
        deleted_bindings = [
            b
            for b in current_bindings
            if binding_matches(
                b, target_node_id, target_endpoint_id, target_group_id, cluster_id
            )
        ]

        # Filter out the binding to delete
        filtered_bindings = [
            b
            for b in current_bindings
            if not binding_matches(
                b, target_node_id, target_endpoint_id, target_group_id, cluster_id
            )
        ]

        if len(filtered_bindings) == len(current_bindings):
            _LOGGER.warning("delete_binding: Binding not found")
            return BindingVerificationResult(
                success=False,
                verified=False,
                message="Binding not found in current bindings",
                bindings_found=len(current_bindings),
            )

        # Rewrite the remaining bindings. Same fabric-scoped/tag-key concerns as
        # create_binding: use the real accessing fabric index, and retry with tag
        # keys if matter.js drops the camelCase write.
        attribute_path = f"{source_endpoint_id}/{CLUSTER_BINDING}/0"
        _LOGGER.info("delete_binding: Writing to attribute path: %s", attribute_path)
        fabric_index = await _accessing_fabric_index(client, source_node_id)
        targets = [
            {
                "cluster": b.cluster_id,
                "node": b.target_node_id,
                "endpoint": b.target_endpoint_id,
                "group": b.target_group_id,
            }
            for b in filtered_bindings
        ]

        result = None
        for tag_keys in (False, True):
            binding_list = [_binding_entry(t, tag_keys, fabric_index) for t in targets]
            result = await client.write_attribute(
                node_id=source_node_id,
                attribute_path=attribute_path,
                value=binding_list,
            )
            read_back = await get_bindings(hass, source_node_id, source_endpoint_id)
            if len(read_back) == len(filtered_bindings):
                break
        _LOGGER.info("delete_binding: write_attribute result: %s", result)

        # Remove ACL entry from target device if requested (for unicast bindings)
        if (
            remove_acl
            and target_node_id is not None
            and target_endpoint_id is not None
            and deleted_bindings
        ):
            # Use cluster_id from the deleted binding if not provided
            acl_cluster_id = cluster_id or (
                deleted_bindings[0].cluster_id if deleted_bindings else None
            )

            if acl_cluster_id is not None:
                _LOGGER.info(
                    "delete_binding: Removing ACL from target node %s for source node %s",
                    target_node_id,
                    source_node_id,
                )
                acl_result = await remove_acl_entry(
                    hass=hass,
                    node_id=target_node_id,
                    source_node_id=source_node_id,
                    target_endpoint_id=target_endpoint_id,
                    cluster_id=acl_cluster_id,
                )

                if not acl_result.success:
                    _LOGGER.warning(
                        "delete_binding: ACL removal failed: %s "
                        "(binding was still deleted)",
                        acl_result.message,
                    )
                else:
                    _LOGGER.info("delete_binding: ACL removed successfully")

        # Tear down group-auth ACL for a deleted groupcast binding
        elif remove_group and target_group_id is not None and deleted_bindings:
            group_cluster_id = cluster_id or (
                deleted_bindings[0].cluster_id if deleted_bindings else None
            )
            if group_cluster_id is not None:
                _LOGGER.info(
                    "delete_binding: Tearing down groupcast binding to group %s",
                    target_group_id,
                )
                group_result = await teardown_group_for_binding(
                    hass=hass,
                    group_id=target_group_id,
                    cluster_id=group_cluster_id,
                )
                if not group_result.success:
                    _LOGGER.warning(
                        "delete_binding: group teardown failed: %s "
                        "(binding was still deleted)",
                        group_result.message,
                    )

        # Verify the binding was deleted if requested
        if verify:
            _LOGGER.info("delete_binding: Verifying binding was deleted from device...")

            # Small delay to allow device to process
            await asyncio.sleep(0.2)

            # Read back bindings directly from device
            verification = await verify_bindings(
                hass, source_node_id, source_endpoint_id
            )

            if not verification.success:
                return BindingVerificationResult(
                    success=True,  # Write succeeded
                    verified=False,
                    message=f"Binding deleted but verification failed: {verification.message}",
                    bindings_found=verification.bindings_found,
                )

            # Check if the binding is gone
            read_bindings = await get_bindings(hass, source_node_id, source_endpoint_id)
            binding_still_exists = any(
                binding_matches(
                    b, target_node_id, target_endpoint_id, target_group_id, cluster_id
                )
                for b in read_bindings
            )

            if not binding_still_exists:
                _LOGGER.info(
                    "delete_binding: Binding deletion verified successfully on device"
                )
                return BindingVerificationResult(
                    success=True,
                    verified=True,
                    message="Binding deleted and verified on device",
                    bindings_found=len(read_bindings),
                )
            else:
                _LOGGER.warning(
                    "delete_binding: Binding was written but still found when reading back"
                )
                return BindingVerificationResult(
                    success=True,
                    verified=False,
                    message=get_user_friendly_error(
                        OperationErrorType.DEVICE_REJECTED,
                        Exception("binding still present"),
                    ),
                    bindings_found=len(read_bindings),
                    error_type=OperationErrorType.DEVICE_REJECTED,
                )

        return BindingVerificationResult(
            success=True,
            verified=False,  # Not verified because verify=False
            message="Binding deletion written (verification skipped)",
            bindings_found=len(binding_list),
        )

    except Exception as err:
        _LOGGER.error("Error deleting binding: %s", err, exc_info=True)
        error_type = parse_error_type(err)
        return BindingVerificationResult(
            success=False,
            verified=False,
            message=get_user_friendly_error(error_type, err),
            error_type=error_type,
        )


async def provision_acls_for_existing_bindings(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
) -> list[dict[str, Any]]:
    """Provision ACLs for all existing bindings on an endpoint.

    Reads current bindings and provisions ACL entries on each target device.
    Useful for retroactively fixing bindings that were created without
    ACL provisioning.

    Args:
        hass: Home Assistant instance
        node_id: Source node ID
        endpoint_id: Source endpoint ID

    Returns:
        List of provisioning results for each binding
    """
    results: list[dict[str, Any]] = []

    # Get existing bindings
    bindings = await get_bindings(hass, node_id, endpoint_id)

    for binding in bindings:
        # Only process unicast bindings (have target_node_id and target_endpoint_id)
        if binding.target_node_id is None:
            _LOGGER.debug(
                "provision_acls_for_existing_bindings: Skipping group binding"
            )
            continue

        if binding.target_endpoint_id is None:
            _LOGGER.debug(
                "provision_acls_for_existing_bindings: Skipping binding without endpoint"
            )
            continue

        if binding.cluster_id is None:
            # Wildcard bindings (cluster_id=None means "any cluster" per Matter spec)
            # are intentionally skipped because the ACL provisioning functions
            # (add_acl_entry, provision_acl_for_binding) don't support wildcard clusters.
            # TODO: Consider adding wildcard cluster ACL support in the future.
            _LOGGER.debug(
                "provision_acls_for_existing_bindings: Skipping wildcard binding "
                "(cluster_id=None means 'any cluster')"
            )
            continue

        cluster_label = (
            f"0x{binding.cluster_id:04X}"
            if binding.cluster_id is not None
            else "Any Cluster"
        )
        _LOGGER.info(
            "provision_acls_for_existing_bindings: Processing binding -> "
            "node %s ep %s cluster %s",
            binding.target_node_id,
            binding.target_endpoint_id,
            cluster_label,
        )

        result = await provision_acl_for_binding(
            hass=hass,
            source_node_id=node_id,
            target_node_id=binding.target_node_id,
            target_endpoint_id=binding.target_endpoint_id,
            cluster_id=binding.cluster_id,
        )

        results.append(
            {
                "target_node_id": binding.target_node_id,
                "target_endpoint_id": binding.target_endpoint_id,
                "cluster_id": binding.cluster_id,
                **result.to_dict(),
            }
        )

    return results


async def repair_group_bindings(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
) -> list[dict[str, Any]]:
    """Re-provision the group chain for existing groupcast bindings on an endpoint.

    The group analogue of provision_acls_for_existing_bindings: reads the source
    endpoint's bindings and, for each one targeting a group, re-runs the groupcast
    provisioning (group key on source + members, group-auth ACL on members). Useful
    when a binding was created while a member was offline, or before provisioning
    existed.

    Returns a list of per-binding result dicts.
    """
    results: list[dict[str, Any]] = []
    bindings = await get_bindings(hass, node_id, endpoint_id)

    for binding in bindings:
        # Only groupcast bindings (have a target group and a concrete cluster).
        if binding.target_group_id is None:
            continue
        if binding.cluster_id is None:
            _LOGGER.debug("repair_group_bindings: skipping wildcard-cluster binding")
            continue

        _LOGGER.info(
            "repair_group_bindings: re-provisioning node %s ep %s -> group %s cluster 0x%04X",
            node_id,
            endpoint_id,
            binding.target_group_id,
            binding.cluster_id,
        )
        result = await provision_group_for_binding(
            hass=hass,
            source_node_id=node_id,
            group_id=binding.target_group_id,
            cluster_id=binding.cluster_id,
        )
        results.append(
            {
                "target_group_id": binding.target_group_id,
                "cluster_id": binding.cluster_id,
                **result.to_dict(),
            }
        )

    return results
