"""Node discovery and information extraction for Matter devices."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant

from ..const import (
    ATTR_ACCEPTED_COMMAND_LIST,
    ATTR_CLIENT_LIST,
    ATTR_SERVER_LIST,
    CLUSTER_BINDING,
    CLUSTER_DESCRIPTOR,
)
from .client import get_raw_matter_client
from .demo import get_demo_nodes, is_demo_mode
from .ha_registry import get_ha_device_info

if TYPE_CHECKING:
    from matter_server.common.models import MatterNodeData

_LOGGER = logging.getLogger(__name__)


async def get_nodes(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Get all Matter nodes."""
    # Check for demo mode first
    if is_demo_mode(hass):
        _LOGGER.debug("Demo mode enabled, returning demo nodes")
        return get_demo_nodes()

    client = get_raw_matter_client(hass)
    if not client:
        _LOGGER.error("Matter client not available")
        return []

    nodes = []
    try:
        _LOGGER.info("Fetching Matter nodes from client (live mode)")
        all_nodes = client.get_nodes()
        _LOGGER.info("Found %d nodes from Matter client", len(all_nodes))

        for node in all_nodes:
            endpoints = get_endpoints_info(node)
            ha_info = get_ha_device_info(hass, node.node_id)

            # Use HA device name if available, otherwise fall back to Matter name
            name = ha_info.get("ha_device_name") or get_node_name(node)

            node_info = {
                "node_id": node.node_id,
                "name": name,
                "available": node.available,
                "device_info": get_device_info(node),
                "endpoints": endpoints,
                "area_name": ha_info.get("area_name"),
                "ha_device_id": ha_info.get("ha_device_id"),
                "entities": ha_info.get("entities", []),
            }
            _LOGGER.info(
                "Node %s (%s): available=%s, endpoints=%d, area=%s",
                node.node_id,
                node_info["name"],
                node.available,
                len(endpoints),
                node_info["area_name"],
            )
            nodes.append(node_info)
    except Exception as err:
        _LOGGER.error("Error getting Matter nodes: %s", err, exc_info=True)

    return nodes


def get_node_name(node: "MatterNodeData") -> str:
    """Extract a friendly name for the node."""
    try:
        # Approach 1: Use node.name property (MatterNode objects)
        name_prop = getattr(node, "name", None)
        if name_prop and str(name_prop).strip():
            return str(name_prop).strip()

        # Approach 2: Try node.device_info property
        device_info = getattr(node, "device_info", None)
        if device_info:
            # Try node_label first, then product_name
            node_label = getattr(device_info, "node_label", None) or getattr(
                device_info, "nodeLabel", None
            )
            if node_label and str(node_label).strip():
                return str(node_label).strip()
            product_name = getattr(device_info, "product_name", None) or getattr(
                device_info, "productName", None
            )
            if product_name and str(product_name).strip():
                return str(product_name).strip()

        # Approach 3: Fall back to attributes dict
        attributes = getattr(node, "attributes", None)
        if attributes:
            node_label = attributes.get("0/40/5")
            if node_label and str(node_label).strip():
                return str(node_label).strip()
            product_name = attributes.get("0/40/3")
            if product_name and str(product_name).strip():
                return str(product_name).strip()
    except Exception:
        pass
    return f"Node {node.node_id}"


def get_device_info(node: "MatterNodeData") -> dict[str, Any]:
    """Extract device information from node.

    Tries multiple approaches:
    1. Use node.device_info property (MatterNode objects)
    2. Fall back to parsing node.attributes dict
    """
    device_info: dict[str, Any] = {
        "vendor_name": None,
        "vendor_id": None,
        "product_name": None,
        "product_id": None,
        "node_label": None,
        "hardware_version": None,
        "software_version": None,
    }

    try:
        # Approach 1: Use node.device_info property directly
        node_device_info = getattr(node, "device_info", None)
        _LOGGER.debug(
            "Node %s: device_info property type=%s, value=%s",
            node.node_id,
            type(node_device_info).__name__ if node_device_info else None,
            node_device_info,
        )
        if node_device_info:
            # Try to access as dict first (some objects support dict-like access)
            if hasattr(node_device_info, "__getitem__"):
                try:
                    device_info["vendor_name"] = node_device_info.get(
                        "vendorName"
                    ) or node_device_info.get("vendor_name")
                    device_info["vendor_id"] = node_device_info.get(
                        "vendorID"
                    ) or node_device_info.get("vendor_id")
                    device_info["product_name"] = node_device_info.get(
                        "productName"
                    ) or node_device_info.get("product_name")
                    device_info["product_id"] = node_device_info.get(
                        "productID"
                    ) or node_device_info.get("product_id")
                    device_info["node_label"] = node_device_info.get(
                        "nodeLabel"
                    ) or node_device_info.get("node_label")
                    device_info["hardware_version"] = node_device_info.get(
                        "hardwareVersionString"
                    ) or node_device_info.get("hardware_version")
                    device_info["software_version"] = node_device_info.get(
                        "softwareVersionString"
                    ) or node_device_info.get("software_version")
                    if any(v is not None for v in device_info.values()):
                        _LOGGER.debug(
                            "Node %s: extracted device_info via dict access: %s",
                            node.node_id,
                            device_info,
                        )
                        return device_info
                except (TypeError, KeyError):
                    pass

            # Log available attributes to help debug
            all_attrs = [a for a in dir(node_device_info) if not a.startswith("_")]
            _LOGGER.debug(
                "Node %s: device_info available attrs: %s", node.node_id, all_attrs[:20]
            )

            # Try direct attribute access with all possible name formats
            device_info["vendor_name"] = getattr(
                node_device_info, "vendorName", None
            ) or getattr(node_device_info, "vendor_name", None)
            device_info["vendor_id"] = (
                getattr(node_device_info, "vendorID", None)
                or getattr(node_device_info, "vendorId", None)
                or getattr(node_device_info, "vendor_id", None)
            )
            device_info["product_name"] = getattr(
                node_device_info, "productName", None
            ) or getattr(node_device_info, "product_name", None)
            device_info["product_id"] = (
                getattr(node_device_info, "productID", None)
                or getattr(node_device_info, "productId", None)
                or getattr(node_device_info, "product_id", None)
            )
            device_info["node_label"] = getattr(
                node_device_info, "nodeLabel", None
            ) or getattr(node_device_info, "node_label", None)
            device_info["hardware_version"] = (
                getattr(node_device_info, "hardwareVersionString", None)
                or getattr(node_device_info, "hardware_version_string", None)
                or getattr(node_device_info, "hardwareVersion", None)
            )
            device_info["software_version"] = (
                getattr(node_device_info, "softwareVersionString", None)
                or getattr(node_device_info, "software_version_string", None)
                or getattr(node_device_info, "softwareVersion", None)
            )

            # If we got any data, return it
            if any(v is not None for v in device_info.values()):
                _LOGGER.debug(
                    "Node %s: extracted device_info from property: %s",
                    node.node_id,
                    device_info,
                )
                return device_info

        # Approach 2: Fall back to attributes dict
        _LOGGER.debug(
            "Node %s: device_info property had no data, trying attributes dict",
            node.node_id,
        )
        attributes = getattr(node, "attributes", None)
        if attributes:
            _LOGGER.debug(
                "Node %s: attributes dict has %d keys, sample keys: %s",
                node.node_id,
                len(attributes),
                list(attributes.keys())[:5],
            )

            # Try string keys first (older format)
            device_info["vendor_name"] = attributes.get("0/40/1")
            device_info["vendor_id"] = attributes.get("0/40/2")
            device_info["product_name"] = attributes.get("0/40/3")
            device_info["product_id"] = attributes.get("0/40/4")
            device_info["node_label"] = attributes.get("0/40/5")
            device_info["hardware_version"] = attributes.get("0/40/8")
            device_info["software_version"] = attributes.get("0/40/10")

            # If string keys didn't work, try iterating and matching by path components
            if not any(v is not None for v in device_info.values()):
                _LOGGER.debug(
                    "Node %s: string keys didn't work, trying path matching",
                    node.node_id,
                )
                for attr_key, attr_value in attributes.items():
                    # Convert key to string and parse
                    key_str = str(attr_key)
                    if "/40/" in key_str or "BasicInformation" in key_str:
                        _LOGGER.debug(
                            "Node %s: found Basic Info attr: %s = %s",
                            node.node_id,
                            key_str,
                            attr_value,
                        )
                    # Check for endpoint 0, cluster 40 (Basic Information)
                    if (
                        hasattr(attr_key, "endpoint_id")
                        and hasattr(attr_key, "cluster_id")
                        and hasattr(attr_key, "attribute_id")
                    ):
                        if attr_key.endpoint_id == 0 and attr_key.cluster_id == 40:
                            attr_id = attr_key.attribute_id
                            if attr_id == 1:
                                device_info["vendor_name"] = attr_value
                            elif attr_id == 2:
                                device_info["vendor_id"] = attr_value
                            elif attr_id == 3:
                                device_info["product_name"] = attr_value
                            elif attr_id == 4:
                                device_info["product_id"] = attr_value
                            elif attr_id == 5:
                                device_info["node_label"] = attr_value
                            elif attr_id == 8:
                                device_info["hardware_version"] = attr_value
                            elif attr_id == 10:
                                device_info["software_version"] = attr_value

            _LOGGER.debug(
                "Node %s: extracted device_info from attributes: %s",
                node.node_id,
                device_info,
            )
        else:
            _LOGGER.debug("Node %s: no attributes dict found", node.node_id)

    except Exception as err:
        _LOGGER.debug("Error getting device info for node %s: %s", node.node_id, err)

    _LOGGER.debug("Node %s: final device_info: %s", node.node_id, device_info)
    return device_info


def get_endpoints_info(node: "MatterNodeData") -> list[dict[str, Any]]:
    """Get endpoint information for a node.

    Tries multiple approaches:
    1. Use node.endpoints property directly (MatterNode objects)
    2. Fall back to parsing node.attributes dict
    """
    endpoints: list[dict[str, Any]] = []

    try:
        # Approach 1: Try using node.endpoints property directly
        endpoints_prop = getattr(node, "endpoints", None)
        if endpoints_prop:
            _LOGGER.debug(
                "Node %s: using endpoints property (type: %s, len: %s)",
                node.node_id,
                type(endpoints_prop).__name__,
                len(endpoints_prop) if endpoints_prop else 0,
            )
            endpoints = _extract_from_endpoints_property(node.node_id, endpoints_prop)
            if endpoints:
                return endpoints

        # Approach 2: Fall back to parsing attributes dict
        attributes = getattr(node, "attributes", None)
        if attributes:
            _LOGGER.debug(
                "Node %s: using attributes dict (len: %s)",
                node.node_id,
                len(attributes),
            )
            endpoints = _extract_from_attributes_dict(node.node_id, attributes)
            if endpoints:
                return endpoints

        _LOGGER.debug("Node %s: no endpoint data found", node.node_id)
        return []

    except Exception as err:
        _LOGGER.warning(
            "Error getting endpoints for node %s: %s", node.node_id, err, exc_info=True
        )
        return []


def _extract_from_endpoints_property(
    node_id: int, endpoints_prop: Any
) -> list[dict[str, Any]]:
    """Extract endpoint info from node.endpoints property."""
    endpoints: list[dict[str, Any]] = []

    try:
        # endpoints can be a dict keyed by endpoint_id or a list
        if isinstance(endpoints_prop, dict):
            items = endpoints_prop.items()
        elif hasattr(endpoints_prop, "__iter__"):
            # Try to iterate if it's some other iterable
            items = [
                (getattr(ep, "endpoint_id", i), ep)
                for i, ep in enumerate(endpoints_prop)
            ]
        else:
            return []

        for endpoint_id, endpoint in items:
            try:
                ep_info = {
                    "endpoint_id": int(endpoint_id),
                    "device_types": [],
                    "has_binding_cluster": False,
                    "server_clusters": [],
                    "client_clusters": [],
                    "cluster_commands": {},  # Map of cluster_id -> list of accepted command IDs
                }

                # Try to get clusters from endpoint
                clusters = None
                if hasattr(endpoint, "clusters"):
                    clusters = endpoint.clusters
                elif isinstance(endpoint, dict):
                    clusters = endpoint.get("clusters")

                server_cluster_ids = set()
                client_cluster_ids = set()

                if clusters:
                    # clusters might be a dict keyed by cluster_id or a list
                    if isinstance(clusters, dict):
                        # All clusters in endpoint.clusters are server clusters
                        server_cluster_ids = set(clusters.keys())

                        # Look for Descriptor cluster to get the official lists
                        descriptor = clusters.get(CLUSTER_DESCRIPTOR)
                        if descriptor:
                            # Try to get ServerList and ClientList attributes
                            server_list = _get_cluster_attribute(
                                descriptor, ATTR_SERVER_LIST
                            )
                            client_list = _get_cluster_attribute(
                                descriptor, ATTR_CLIENT_LIST
                            )

                            if server_list is not None:
                                server_cluster_ids = (
                                    set(server_list)
                                    if isinstance(server_list, list)
                                    else server_cluster_ids
                                )
                            if client_list is not None:
                                client_cluster_ids = (
                                    set(client_list)
                                    if isinstance(client_list, list)
                                    else set()
                                )

                    elif hasattr(clusters, "__iter__"):
                        for c in clusters:
                            if hasattr(c, "cluster_id"):
                                server_cluster_ids.add(c.cluster_id)
                            elif isinstance(c, (int, str)):
                                server_cluster_ids.add(int(c))

                ep_info["server_clusters"] = sorted(server_cluster_ids)
                ep_info["client_clusters"] = sorted(client_cluster_ids)
                # Binding cluster can be either server or client - check both
                ep_info["has_binding_cluster"] = (
                    CLUSTER_BINDING in server_cluster_ids
                    or CLUSTER_BINDING in client_cluster_ids
                )

                # Extract accepted commands for each server cluster
                if clusters and isinstance(clusters, dict):
                    for cluster_id in server_cluster_ids:
                        cluster = clusters.get(cluster_id)
                        if cluster:
                            try:
                                # Try to get AcceptedCommandList attribute
                                accepted_cmds = None
                                if hasattr(endpoint, "get_attribute_value"):
                                    accepted_cmds = endpoint.get_attribute_value(
                                        cluster_id, ATTR_ACCEPTED_COMMAND_LIST
                                    )
                                if accepted_cmds is not None:
                                    cmd_list = (
                                        list(accepted_cmds)
                                        if hasattr(accepted_cmds, "__iter__")
                                        else [accepted_cmds]
                                    )

                                    # Get command names from cluster class
                                    cmd_names = {}
                                    if hasattr(cluster, "Commands"):
                                        commands_class = cluster.Commands
                                        for name in dir(commands_class):
                                            if not name.startswith("_"):
                                                cmd_obj = getattr(
                                                    commands_class, name, None
                                                )
                                                if cmd_obj and hasattr(
                                                    cmd_obj, "command_id"
                                                ):
                                                    cmd_names[cmd_obj.command_id] = name

                                    ep_info["cluster_commands"][cluster_id] = {
                                        "accepted": cmd_list,
                                        "names": cmd_names,
                                    }
                            except Exception:
                                pass  # Skip if can't get commands

                # Try to get device types
                device_types = None
                if hasattr(endpoint, "device_types"):
                    device_types = endpoint.device_types
                elif isinstance(endpoint, dict):
                    device_types = endpoint.get("device_types")

                if device_types:
                    for dt in device_types:
                        if hasattr(dt, "device_type"):
                            ep_info["device_types"].append(
                                {
                                    "id": dt.device_type,
                                    "revision": getattr(dt, "revision", 1),
                                }
                            )
                        elif isinstance(dt, dict):
                            ep_info["device_types"].append(
                                {
                                    "id": dt.get("device_type") or dt.get("id"),
                                    "revision": dt.get("revision", 1),
                                }
                            )

                endpoints.append(ep_info)
                _LOGGER.debug(
                    "  Node %s Endpoint %d: device_types=%s, server_clusters=%s, client_clusters=%s, has_binding=%s",
                    node_id,
                    ep_info["endpoint_id"],
                    ep_info["device_types"],
                    ep_info["server_clusters"],
                    ep_info["client_clusters"],
                    ep_info["has_binding_cluster"],
                )

            except Exception as ep_err:
                _LOGGER.debug("Error processing endpoint %s: %s", endpoint_id, ep_err)
                continue

    except Exception as err:
        _LOGGER.debug("Error extracting from endpoints property: %s", err)

    return endpoints


def _get_cluster_attribute(cluster: Any, attribute_id: int) -> Any:
    """Get an attribute value from a cluster object."""
    try:
        # Try as dict first
        if isinstance(cluster, dict):
            return cluster.get(attribute_id) or cluster.get(str(attribute_id))

        # Try attributes dict on cluster object
        if hasattr(cluster, "attributes"):
            attrs = cluster.attributes
            if isinstance(attrs, dict):
                return attrs.get(attribute_id) or attrs.get(str(attribute_id))

        # Try direct attribute access
        attr_names = {
            ATTR_SERVER_LIST: ["server_list", "serverList", "ServerList"],
            ATTR_CLIENT_LIST: ["client_list", "clientList", "ClientList"],
        }
        for name in attr_names.get(attribute_id, []):
            if hasattr(cluster, name):
                return getattr(cluster, name)

    except Exception:
        pass
    return None


def _extract_from_attributes_dict(
    node_id: int, attributes: dict
) -> list[dict[str, Any]]:
    """Extract endpoint info from node.attributes dict (legacy approach)."""
    endpoints_dict: dict[int, dict[str, Any]] = {}

    try:
        # Parse attribute keys to extract endpoints and clusters
        # Keys are in format: 'endpoint/cluster/attribute'
        for attr_key in attributes.keys():
            try:
                parts = str(attr_key).split("/")
                if len(parts) >= 2:
                    endpoint_id = int(parts[0])
                    cluster_id = int(parts[1])

                    if endpoint_id not in endpoints_dict:
                        endpoints_dict[endpoint_id] = {
                            "endpoint_id": endpoint_id,
                            "device_types": [],
                            "has_binding_cluster": False,
                            "server_clusters": set(),
                            "client_clusters": set(),
                            "cluster_commands": {},
                        }

                    # By default, clusters we see in attributes are server clusters
                    endpoints_dict[endpoint_id]["server_clusters"].add(cluster_id)

                    # Check for binding cluster
                    if cluster_id == CLUSTER_BINDING:
                        endpoints_dict[endpoint_id]["has_binding_cluster"] = True

                    # Get data from Descriptor cluster (29)
                    if cluster_id == CLUSTER_DESCRIPTOR and len(parts) >= 3:
                        attr_id = parts[2]
                        attr_value = attributes.get(attr_key)

                        # Attribute 0: DeviceTypeList
                        if attr_id == "0" and isinstance(attr_value, list):
                            for dt in attr_value:
                                if isinstance(dt, dict):
                                    dt_id = dt.get(0) or dt.get("deviceType")
                                    dt_rev = dt.get(1) or dt.get("revision", 1)
                                    if dt_id is not None:
                                        endpoints_dict[endpoint_id][
                                            "device_types"
                                        ].append(
                                            {
                                                "id": dt_id,
                                                "revision": dt_rev,
                                            }
                                        )

                        # Attribute 1: ServerList
                        elif attr_id == "1" and isinstance(attr_value, list):
                            endpoints_dict[endpoint_id]["server_clusters"] = set(
                                attr_value
                            )

                        # Attribute 2: ClientList
                        elif attr_id == "2" and isinstance(attr_value, list):
                            endpoints_dict[endpoint_id]["client_clusters"] = set(
                                attr_value
                            )
                            # Update has_binding_cluster if binding is in client list
                            if CLUSTER_BINDING in attr_value:
                                endpoints_dict[endpoint_id]["has_binding_cluster"] = (
                                    True
                                )

                    # Check for AcceptedCommandList (attribute 65529 / 0xFFF9)
                    if len(parts) >= 3:
                        attr_id_int = int(parts[2])
                        if attr_id_int == ATTR_ACCEPTED_COMMAND_LIST:
                            attr_value = attributes.get(attr_key)
                            if isinstance(attr_value, (list, tuple)):
                                cmd_list = list(attr_value)
                                if (
                                    cluster_id
                                    not in endpoints_dict[endpoint_id][
                                        "cluster_commands"
                                    ]
                                ):
                                    endpoints_dict[endpoint_id]["cluster_commands"][
                                        cluster_id
                                    ] = {
                                        "accepted": cmd_list,
                                        "names": {},
                                    }
                                else:
                                    endpoints_dict[endpoint_id]["cluster_commands"][
                                        cluster_id
                                    ]["accepted"] = cmd_list

            except (ValueError, IndexError) as parse_err:
                _LOGGER.debug(
                    "Could not parse attribute key %s: %s", attr_key, parse_err
                )
                continue

        # Try to get command names from chip clusters module
        cluster_command_names: dict[int, dict[int, str]] = {}
        try:
            from chip.clusters import Objects as clusters

            # Build mapping of cluster_id -> {cmd_id -> name}
            for attr_name in dir(clusters):
                if attr_name.startswith("_"):
                    continue
                cluster_class = getattr(clusters, attr_name, None)
                if (
                    cluster_class
                    and hasattr(cluster_class, "id")
                    and hasattr(cluster_class, "Commands")
                ):
                    cluster_id = cluster_class.id
                    commands_class = cluster_class.Commands
                    cmd_names = {}
                    for cmd_name in dir(commands_class):
                        if not cmd_name.startswith("_"):
                            cmd_obj = getattr(commands_class, cmd_name, None)
                            if cmd_obj and hasattr(cmd_obj, "command_id"):
                                cmd_names[cmd_obj.command_id] = cmd_name
                    if cmd_names:
                        cluster_command_names[cluster_id] = cmd_names
        except Exception as e:
            _LOGGER.debug("Could not load chip clusters for command names: %s", e)

        # Convert to list and convert cluster sets to lists
        endpoints = []
        for endpoint_id in sorted(endpoints_dict.keys()):
            ep_info = endpoints_dict[endpoint_id]
            ep_info["server_clusters"] = sorted(ep_info["server_clusters"])
            ep_info["client_clusters"] = sorted(ep_info["client_clusters"])

            # Add command names to cluster_commands
            for cluster_id, cmd_info in ep_info.get("cluster_commands", {}).items():
                if cluster_id in cluster_command_names:
                    cmd_info["names"] = cluster_command_names[cluster_id]

            endpoints.append(ep_info)

        return endpoints

    except Exception as err:
        _LOGGER.debug("Error extracting from attributes dict: %s", err)
        return []


# Backwards compatibility aliases with underscore prefix
_get_node_name = get_node_name
_get_device_info = get_device_info
_get_endpoints_info = get_endpoints_info
