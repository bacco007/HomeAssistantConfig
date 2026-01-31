"""WebSocket API for Matter Binding Helper."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr

from .const import (
    WS_TYPE_ADD_TO_GROUP,
    WS_TYPE_CLEAR_SCHEDULE,
    WS_TYPE_CREATE_AUTOMATION,
    WS_TYPE_CREATE_BINDING,
    WS_TYPE_CREATE_GROUP,
    WS_TYPE_DELETE_BINDING,
    WS_TYPE_DELETE_GROUP,
    WS_TYPE_GET_SCHEDULE,
    WS_TYPE_LIST_ACL,
    WS_TYPE_LIST_BINDINGS,
    WS_TYPE_LIST_GROUPS,
    WS_TYPE_LIST_NODES,
    WS_TYPE_PROVISION_ACL,
    WS_TYPE_PROVISION_ACL_FOR_BINDINGS,
    WS_TYPE_REMOVE_ACL,
    WS_TYPE_REMOVE_FROM_GROUP,
    WS_TYPE_SET_SCHEDULE,
    WS_TYPE_VERIFY_BINDINGS,
)
from .automation_generator import (
    create_automation_from_template,
    preview_automation,
)
from . import matter_client
from .telemetry import collect_survey_data
from .devices.parsers.eve import (
    EVE_CLUSTER_ID,
    EVE_SCHEDULE_ATTR,
    is_eve_thermostat,
    parse_eve_schedule,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant) -> None:
    """Set up the WebSocket API."""
    websocket_api.async_register_command(hass, ws_list_nodes)
    websocket_api.async_register_command(hass, ws_debug_node)
    websocket_api.async_register_command(hass, ws_debug_devices)
    websocket_api.async_register_command(hass, ws_debug_match)
    websocket_api.async_register_command(hass, ws_debug_bindings)
    websocket_api.async_register_command(hass, ws_debug_client)
    websocket_api.async_register_command(hass, ws_debug_cluster_commands)
    websocket_api.async_register_command(hass, ws_debug_cluster_attributes)
    websocket_api.async_register_command(hass, ws_get_eve_schedule)
    websocket_api.async_register_command(hass, ws_list_bindings)
    websocket_api.async_register_command(hass, ws_create_binding)
    websocket_api.async_register_command(hass, ws_delete_binding)
    websocket_api.async_register_command(hass, ws_verify_bindings)
    websocket_api.async_register_command(hass, ws_list_acl)
    websocket_api.async_register_command(hass, ws_provision_acl)
    websocket_api.async_register_command(hass, ws_remove_acl)
    websocket_api.async_register_command(hass, ws_provision_acl_for_bindings)
    websocket_api.async_register_command(hass, ws_list_groups)
    websocket_api.async_register_command(hass, ws_create_group)
    websocket_api.async_register_command(hass, ws_delete_group)
    websocket_api.async_register_command(hass, ws_add_to_group)
    websocket_api.async_register_command(hass, ws_remove_from_group)
    # Thermostat schedule commands
    websocket_api.async_register_command(hass, ws_get_schedule)
    websocket_api.async_register_command(hass, ws_set_schedule)
    websocket_api.async_register_command(hass, ws_clear_schedule)
    # Debug: telemetry preview
    websocket_api.async_register_command(hass, ws_debug_telemetry)
    websocket_api.async_register_command(hass, ws_debug_v3_extraction)
    # Automation creation
    websocket_api.async_register_command(hass, ws_create_automation)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_LIST_NODES,
    }
)
@websocket_api.async_response
async def ws_list_nodes(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all Matter nodes."""
    nodes = await matter_client.get_nodes(hass)
    connection.send_result(msg["id"], {"nodes": nodes})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_node",
        vol.Required("node_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_debug_node(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: Get raw node structure info."""
    client = matter_client.get_matter_client(hass)
    if not client:
        connection.send_error(msg["id"], "no_client", "Matter client not available")
        return

    target_node_id = msg["node_id"]
    for node in client.get_nodes():
        if node.node_id == target_node_id:
            # Get all public attributes of the node object
            node_attrs = [attr for attr in dir(node) if not attr.startswith("_")]

            # Get attributes dict info
            attributes = getattr(node, "attributes", None)
            attr_info = {
                "has_attributes": attributes is not None,
                "attributes_type": type(attributes).__name__ if attributes else None,
                "attributes_len": len(attributes) if attributes else 0,
                "sample_keys": list(attributes.keys())[:20] if attributes else [],
            }

            # Get endpoints property info
            endpoints_prop = getattr(node, "endpoints", None)
            endpoints_info = {
                "has_endpoints": endpoints_prop is not None,
                "endpoints_type": type(endpoints_prop).__name__
                if endpoints_prop
                else None,
                "endpoints_len": len(endpoints_prop) if endpoints_prop else 0,
            }

            # Inspect first endpoint if available
            first_endpoint_info = None
            if endpoints_prop:
                try:
                    if isinstance(endpoints_prop, dict):
                        # endpoints is a dict keyed by endpoint_id
                        first_ep_id = next(iter(endpoints_prop.keys()), None)
                        if first_ep_id is not None:
                            first_ep = endpoints_prop[first_ep_id]
                            first_endpoint_info = {
                                "endpoint_id": first_ep_id,
                                "type": type(first_ep).__name__,
                                "attrs": [
                                    a for a in dir(first_ep) if not a.startswith("_")
                                ],
                            }
                    elif isinstance(endpoints_prop, list) and len(endpoints_prop) > 0:
                        first_ep = endpoints_prop[0]
                        first_endpoint_info = {
                            "type": type(first_ep).__name__,
                            "attrs": [
                                a for a in dir(first_ep) if not a.startswith("_")
                            ],
                        }
                except Exception as ep_err:
                    first_endpoint_info = {"error": str(ep_err)}

            # Get node_data info
            node_data = getattr(node, "node_data", None)
            node_data_info = {
                "has_node_data": node_data is not None,
                "node_data_type": type(node_data).__name__ if node_data else None,
            }

            connection.send_result(
                msg["id"],
                {
                    "node_id": node.node_id,
                    "node_type": type(node).__name__,
                    "available_attrs": node_attrs,
                    "attributes_info": attr_info,
                    "endpoints_info": endpoints_info,
                    "first_endpoint": first_endpoint_info,
                    "node_data_info": node_data_info,
                },
            )
            return

    connection.send_error(msg["id"], "not_found", f"Node {target_node_id} not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_devices",
    }
)
@websocket_api.async_response
async def ws_debug_devices(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: List all devices with Matter identifiers."""
    device_registry = dr.async_get(hass)
    area_registry = ar.async_get(hass)

    matter_devices = []
    for device in device_registry.devices.values():
        # Check if any identifier starts with "matter"
        matter_identifiers = [
            list(ident)
            for ident in device.identifiers
            if len(ident) >= 2 and ident[0] == "matter"
        ]

        if matter_identifiers:
            area_name = None
            if device.area_id:
                area = area_registry.async_get_area(device.area_id)
                if area:
                    area_name = area.name

            matter_devices.append(
                {
                    "device_id": device.id,
                    "name": device.name,
                    "name_by_user": device.name_by_user,
                    "identifiers": matter_identifiers,
                    "area_id": device.area_id,
                    "area_name": area_name,
                    "model": device.model,
                    "manufacturer": device.manufacturer,
                }
            )

    connection.send_result(msg["id"], {"devices": matter_devices})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_bindings",
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_debug_bindings(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: Dump raw binding cluster data for a node/endpoint."""
    from .const import CLUSTER_BINDING

    client = matter_client.get_matter_client(hass)
    if not client:
        connection.send_error(msg["id"], "no_client", "Matter client not available")
        return

    target_node_id = msg["node_id"]
    target_endpoint_id = msg["endpoint_id"]
    result = {
        "node_id": target_node_id,
        "endpoint_id": target_endpoint_id,
        "binding_cluster_id": CLUSTER_BINDING,
        "endpoint_info": None,
        "binding_cluster_info": None,
        "binding_value": None,
        "clusters_on_endpoint": [],
    }

    for node in client.get_nodes():
        if node.node_id != target_node_id:
            continue

        # Access endpoints
        endpoints = getattr(node, "endpoints", None)
        if not endpoints:
            result["error"] = "Node has no endpoints property"
            connection.send_result(msg["id"], result)
            return

        endpoint = endpoints.get(target_endpoint_id)
        if not endpoint:
            result["error"] = (
                f"Endpoint {target_endpoint_id} not found. Available: {list(endpoints.keys())}"
            )
            connection.send_result(msg["id"], result)
            return

        # Endpoint info
        result["endpoint_info"] = {
            "type": type(endpoint).__name__,
            "available_attrs": [a for a in dir(endpoint) if not a.startswith("_")][:20],
        }

        # Get clusters on endpoint
        if hasattr(endpoint, "clusters"):
            clusters = endpoint.clusters
            if isinstance(clusters, dict):
                result["clusters_on_endpoint"] = list(clusters.keys())

                # Check for binding cluster
                binding_cluster = clusters.get(CLUSTER_BINDING)
                if binding_cluster:
                    result["binding_cluster_info"] = {
                        "type": type(binding_cluster).__name__,
                        "available_attrs": [
                            a for a in dir(binding_cluster) if not a.startswith("_")
                        ][:20],
                    }

                    # Try to get binding attribute value
                    if hasattr(binding_cluster, "binding"):
                        result["binding_value"] = {
                            "source": "cluster.binding",
                            "type": type(binding_cluster.binding).__name__,
                            "value": repr(binding_cluster.binding)[:1000],
                        }

        # Try get_cluster method
        if hasattr(endpoint, "get_cluster") and result["binding_cluster_info"] is None:
            binding_cluster = endpoint.get_cluster(CLUSTER_BINDING)
            if binding_cluster:
                result["binding_cluster_info"] = {
                    "type": type(binding_cluster).__name__,
                    "available_attrs": [
                        a for a in dir(binding_cluster) if not a.startswith("_")
                    ][:20],
                    "source": "get_cluster()",
                }

        # Try get_attribute_value method
        if hasattr(endpoint, "get_attribute_value") and result["binding_value"] is None:
            try:
                attr_value = endpoint.get_attribute_value(CLUSTER_BINDING, 0)
                if attr_value is not None:
                    result["binding_value"] = {
                        "source": "endpoint.get_attribute_value(30, 0)",
                        "type": type(attr_value).__name__,
                        "value": repr(attr_value)[:1000],
                    }
            except Exception as e:
                result["get_attribute_value_error"] = str(e)

        connection.send_result(msg["id"], result)
        return

    result["error"] = f"Node {target_node_id} not found"
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_match",
        vol.Required("node_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_debug_match(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: Test device matching for a specific node ID."""
    device_registry = dr.async_get(hass)
    area_registry = ar.async_get(hass)
    node_id = msg["node_id"]

    # Convert node_id to 16-digit uppercase hex
    node_id_hex = f"{node_id:016X}"
    search_pattern = f"-{node_id_hex}-"

    matches = []
    checked = []

    for device in device_registry.devices.values():
        for identifier in device.identifiers:
            if len(identifier) >= 2 and identifier[0] == "matter":
                id_value = str(identifier[1])
                is_deviceid = id_value.startswith("deviceid_")
                has_pattern = search_pattern in id_value

                checked.append(
                    {
                        "device_name": device.name,
                        "identifier": id_value,
                        "is_deviceid": is_deviceid,
                        "has_pattern": has_pattern,
                    }
                )

                if is_deviceid and has_pattern:
                    area_name = None
                    if device.area_id:
                        area = area_registry.async_get_area(device.area_id)
                        if area:
                            area_name = area.name

                    matches.append(
                        {
                            "device_id": device.id,
                            "name": device.name,
                            "name_by_user": device.name_by_user,
                            "area_name": area_name,
                            "matched_identifier": id_value,
                        }
                    )

    connection.send_result(
        msg["id"],
        {
            "node_id": node_id,
            "node_id_hex": node_id_hex,
            "search_pattern": search_pattern,
            "matches": matches,
            "checked_count": len(checked),
            "checked_sample": checked[:10],
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_LIST_BINDINGS,
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_list_bindings(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List bindings for a node endpoint."""
    bindings = await matter_client.get_bindings(
        hass, msg["node_id"], msg["endpoint_id"]
    )
    connection.send_result(
        msg["id"],
        {"bindings": [b.to_dict() for b in bindings]},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_client",
    }
)
@websocket_api.async_response
async def ws_debug_client(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: Show available methods on Matter client."""
    client = matter_client.get_matter_client(hass)
    if not client:
        connection.send_error(msg["id"], "no_client", "Matter client not available")
        return

    # Get all public methods
    methods = [
        m
        for m in dir(client)
        if not m.startswith("_") and callable(getattr(client, m, None))
    ]
    attrs = [
        a
        for a in dir(client)
        if not a.startswith("_") and not callable(getattr(client, a, None))
    ]

    connection.send_result(
        msg["id"],
        {
            "client_type": type(client).__name__,
            "methods": methods,
            "attributes": attrs,
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_cluster_commands",
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
        vol.Optional("cluster_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_debug_cluster_commands(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: List accepted commands for clusters on a node endpoint."""
    # AcceptedCommandList attribute ID
    ATTR_ACCEPTED_COMMAND_LIST = 65529  # 0xFFF9
    ATTR_GENERATED_COMMAND_LIST = 65528  # 0xFFF8

    client = matter_client.get_matter_client(hass)
    if not client:
        connection.send_error(msg["id"], "no_client", "Matter client not available")
        return

    target_node_id = msg["node_id"]
    target_endpoint_id = msg["endpoint_id"]
    target_cluster_id = msg.get("cluster_id")

    result = {
        "node_id": target_node_id,
        "endpoint_id": target_endpoint_id,
        "clusters": [],
    }

    for node in client.get_nodes():
        if node.node_id != target_node_id:
            continue

        endpoints = getattr(node, "endpoints", None)
        if not endpoints:
            result["error"] = "Node has no endpoints"
            connection.send_result(msg["id"], result)
            return

        endpoint = endpoints.get(target_endpoint_id)
        if not endpoint:
            result["error"] = f"Endpoint {target_endpoint_id} not found"
            connection.send_result(msg["id"], result)
            return

        clusters = getattr(endpoint, "clusters", {})
        if not isinstance(clusters, dict):
            result["error"] = "Clusters not available as dict"
            connection.send_result(msg["id"], result)
            return

        # Filter to specific cluster if requested
        cluster_ids = (
            [target_cluster_id] if target_cluster_id else list(clusters.keys())
        )

        for cluster_id in cluster_ids:
            cluster = clusters.get(cluster_id)
            if not cluster:
                continue

            cluster_info = {
                "cluster_id": cluster_id,
                "cluster_name": type(cluster).__name__,
                "accepted_commands": [],
                "generated_commands": [],
            }

            # Try to get AcceptedCommandList
            try:
                if hasattr(endpoint, "get_attribute_value"):
                    accepted = endpoint.get_attribute_value(
                        cluster_id, ATTR_ACCEPTED_COMMAND_LIST
                    )
                    if accepted is not None:
                        cluster_info["accepted_commands"] = (
                            list(accepted)
                            if hasattr(accepted, "__iter__")
                            else [accepted]
                        )
                    generated = endpoint.get_attribute_value(
                        cluster_id, ATTR_GENERATED_COMMAND_LIST
                    )
                    if generated is not None:
                        cluster_info["generated_commands"] = (
                            list(generated)
                            if hasattr(generated, "__iter__")
                            else [generated]
                        )
            except Exception as e:
                cluster_info["error"] = str(e)

            # Try to get command names from cluster class
            try:
                if hasattr(cluster, "Commands"):
                    commands_class = cluster.Commands
                    command_names = {}
                    for name in dir(commands_class):
                        if not name.startswith("_"):
                            cmd_obj = getattr(commands_class, name, None)
                            if cmd_obj and hasattr(cmd_obj, "command_id"):
                                command_names[cmd_obj.command_id] = name
                    cluster_info["command_names"] = command_names
            except Exception:
                pass

            result["clusters"].append(cluster_info)

        connection.send_result(msg["id"], result)
        return

    result["error"] = f"Node {target_node_id} not found"
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_cluster_attributes",
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
        vol.Required("cluster_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_debug_cluster_attributes(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: Dump all attributes from a specific cluster (including proprietary)."""
    client = matter_client.get_matter_client(hass)
    if not client:
        connection.send_error(msg["id"], "no_client", "Matter client not available")
        return

    target_node_id = msg["node_id"]
    target_endpoint_id = msg["endpoint_id"]
    target_cluster_id = msg["cluster_id"]

    result = {
        "node_id": target_node_id,
        "endpoint_id": target_endpoint_id,
        "cluster_id": target_cluster_id,
        "cluster_hex": f"0x{target_cluster_id:08X}",
        "vendor_id": (target_cluster_id >> 16) & 0xFFFF
        if target_cluster_id > 0xFFFF
        else None,
    }

    for node in client.get_nodes():
        if node.node_id != target_node_id:
            continue

        # Try to get raw attributes from node_data first (works for all clusters)
        node_data = getattr(node, "node_data", None)
        if node_data:
            node_data_attrs = getattr(node_data, "attributes", None)
            if node_data_attrs:
                raw_attrs = {}
                for key, value in node_data_attrs.items():
                    key_str = str(key)
                    # Match format: "endpoint/cluster/attribute" or AttributePath objects
                    if hasattr(key, "EndpointId") and hasattr(key, "ClusterId"):
                        if (
                            key.EndpointId == target_endpoint_id
                            and key.ClusterId == target_cluster_id
                        ):
                            attr_id = key.AttributeId
                            raw_attrs[f"0x{attr_id:04X} ({attr_id})"] = (
                                _serialize_value(value)
                            )
                    elif f"{target_endpoint_id}/{target_cluster_id}/" in key_str:
                        attr_id = key_str.split("/")[-1]
                        raw_attrs[attr_id] = _serialize_value(value)
                if raw_attrs:
                    result["raw_attributes_from_node_data"] = raw_attrs

        endpoints = getattr(node, "endpoints", None)
        if not endpoints:
            result["error"] = "Node has no endpoints"
            connection.send_result(msg["id"], result)
            return

        endpoint = endpoints.get(target_endpoint_id)
        if not endpoint:
            result["error"] = f"Endpoint {target_endpoint_id} not found"
            connection.send_result(msg["id"], result)
            return

        clusters = getattr(endpoint, "clusters", {})
        cluster = clusters.get(target_cluster_id)

        if not cluster:
            # Cluster not instantiated - check if we found raw attributes
            if "raw_attributes_from_node_data" in result:
                result["note"] = (
                    "Cluster not parsed by python-matter-server, showing raw data"
                )
                connection.send_result(msg["id"], result)
                return
            result["error"] = f"Cluster {target_cluster_id} not found on endpoint"
            result["available_clusters"] = list(clusters.keys())
            connection.send_result(msg["id"], result)
            return

        result["cluster_class"] = type(cluster).__name__
        result["cluster_module"] = type(cluster).__module__

        # Get all attributes from the cluster object
        cluster_attrs = {}
        attr_descriptors = {}

        # Method 1: Try to get Attributes class for descriptor info
        if hasattr(cluster, "Attributes"):
            attrs_class = cluster.Attributes
            for name in dir(attrs_class):
                if not name.startswith("_"):
                    attr_obj = getattr(attrs_class, name, None)
                    if attr_obj and hasattr(attr_obj, "attribute_id"):
                        attr_descriptors[attr_obj.attribute_id] = {
                            "name": name,
                            "type": type(attr_obj).__name__,
                        }

        result["attribute_descriptors"] = attr_descriptors

        # Method 2: Get actual attribute values from cluster instance
        for attr_name in dir(cluster):
            if attr_name.startswith("_"):
                continue
            if attr_name in (
                "Attributes",
                "Commands",
                "Events",
                "Enums",
                "Bitmaps",
                "Structs",
            ):
                continue

            try:
                attr_value = getattr(cluster, attr_name)
                # Skip methods
                if callable(attr_value):
                    continue

                cluster_attrs[attr_name] = _serialize_value(attr_value)
            except Exception as e:
                cluster_attrs[attr_name] = {"error": str(e)}

        result["attributes"] = cluster_attrs

        # Method 3: Check for raw data in node attributes dict
        node_attributes = getattr(node, "attributes", {})
        if node_attributes:
            raw_attrs = {}
            prefix = f"{target_endpoint_id}/{target_cluster_id}/"
            for key, value in node_attributes.items():
                key_str = str(key)
                if key_str.startswith(prefix):
                    attr_id = key_str.replace(prefix, "")
                    raw_attrs[attr_id] = _serialize_value(value)
            if raw_attrs:
                result["raw_attributes"] = raw_attrs

        connection.send_result(msg["id"], result)
        return

    result["error"] = f"Node {target_node_id} not found"
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/get_eve_schedule",
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_get_eve_schedule(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get Eve thermostat schedule data."""
    client = matter_client.get_matter_client(hass)
    if not client:
        connection.send_error(msg["id"], "no_client", "Matter client not available")
        return

    target_node_id = msg["node_id"]
    target_endpoint_id = msg["endpoint_id"]

    result: dict[str, Any] = {
        "node_id": target_node_id,
        "endpoint_id": target_endpoint_id,
        "has_eve_cluster": False,
        "schedule": None,
    }

    for node in client.get_nodes():
        if node.node_id != target_node_id:
            continue

        # Check vendor ID
        node_data = getattr(node, "node_data", None)
        vendor_id = None
        if node_data:
            basic_info = getattr(node_data, "attributes", {})
            # Try to get vendor ID from basic info cluster
            for key, value in basic_info.items():
                if hasattr(key, "ClusterId") and key.ClusterId == 40:  # Basic Info
                    if hasattr(key, "AttributeId") and key.AttributeId == 1:  # VendorID
                        vendor_id = value
                        break

        # Get endpoint and check for Eve cluster
        endpoints = getattr(node, "endpoints", None)
        if not endpoints:
            result["error"] = "Node has no endpoints"
            connection.send_result(msg["id"], result)
            return

        endpoint = endpoints.get(target_endpoint_id)
        if not endpoint:
            result["error"] = f"Endpoint {target_endpoint_id} not found"
            connection.send_result(msg["id"], result)
            return

        clusters = getattr(endpoint, "clusters", {})
        cluster_ids = list(clusters.keys())

        # Also check raw node_data for clusters
        if node_data:
            node_attrs = getattr(node_data, "attributes", {})
            for key in node_attrs.keys():
                if hasattr(key, "EndpointId") and key.EndpointId == target_endpoint_id:
                    if hasattr(key, "ClusterId") and key.ClusterId not in cluster_ids:
                        cluster_ids.append(key.ClusterId)

        result["cluster_ids"] = cluster_ids
        result["vendor_id"] = vendor_id

        # Check if this is an Eve thermostat
        if (
            not is_eve_thermostat(vendor_id, cluster_ids)
            and EVE_CLUSTER_ID not in cluster_ids
        ):
            # Try to detect by cluster presence even without vendor ID
            if EVE_CLUSTER_ID not in cluster_ids:
                result["error"] = "Not an Eve thermostat (Eve cluster not found)"
                connection.send_result(msg["id"], result)
                return

        result["has_eve_cluster"] = True

        # Read schedule attribute from node_data
        schedule_data = None
        if node_data:
            node_attrs = getattr(node_data, "attributes", {})
            for key, value in node_attrs.items():
                # Try AttributePath object format
                if (
                    hasattr(key, "EndpointId")
                    and hasattr(key, "ClusterId")
                    and hasattr(key, "AttributeId")
                ):
                    if (
                        key.EndpointId == target_endpoint_id
                        and key.ClusterId == EVE_CLUSTER_ID
                    ):
                        if key.AttributeId == EVE_SCHEDULE_ATTR:
                            schedule_data = value
                            break
                # Try string format "endpoint/cluster/attribute"
                key_str = str(key)
                if (
                    f"{target_endpoint_id}/{EVE_CLUSTER_ID}/{EVE_SCHEDULE_ATTR}"
                    in key_str
                ):
                    schedule_data = value
                    break

        if schedule_data is None:
            result["error"] = "Schedule attribute not found"
            result["debug_keys"] = (
                [str(k)[:100] for k in list(node_attrs.keys())[:10]]
                if node_data
                else []
            )
            connection.send_result(msg["id"], result)
            return

        # Parse the schedule
        schedule = parse_eve_schedule(schedule_data)
        if schedule:
            result["schedule"] = schedule.to_dict()
        else:
            result["error"] = "Failed to parse schedule data"
            result["raw_data"] = str(schedule_data)[:200]

        connection.send_result(msg["id"], result)
        return

    result["error"] = f"Node {target_node_id} not found"
    connection.send_result(msg["id"], result)


def _serialize_value(value: Any) -> dict[str, Any]:
    """Serialize a value to JSON-compatible format."""
    if value is None:
        return {"type": "NoneType", "value": None}
    elif isinstance(value, bytes):
        return {
            "type": "bytes",
            "length": len(value),
            "hex": value.hex()[:200],
        }
    elif isinstance(value, (list, tuple)):
        return {
            "type": "list",
            "length": len(value),
            "value": str(value)[:500],
        }
    elif isinstance(value, dict):
        return {
            "type": "dict",
            "keys": list(value.keys())[:20],
            "value": str(value)[:500],
        }
    elif isinstance(value, (int, float, bool, str)):
        return {"type": type(value).__name__, "value": value}
    elif hasattr(value, "__dict__"):
        return {
            "type": type(value).__name__,
            "value": str(value)[:500],
            "dict": {
                k: str(v)[:100] for k, v in vars(value).items() if not k.startswith("_")
            }
            if hasattr(value, "__dict__")
            else None,
        }
    else:
        return {"type": type(value).__name__, "value": str(value)[:500]}


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_CREATE_BINDING,
        vol.Required("source_node_id"): vol.Coerce(int),
        vol.Required("source_endpoint_id"): vol.Coerce(int),
        vol.Required("cluster_id"): vol.Coerce(int),
        vol.Optional("target_node_id"): vol.Coerce(int),
        vol.Optional("target_endpoint_id"): vol.Coerce(int),
        vol.Optional("target_group_id"): vol.Coerce(int),
        vol.Optional("verify", default=True): bool,
        vol.Optional("provision_acl", default=True): bool,
    }
)
@websocket_api.async_response
async def ws_create_binding(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a new binding with optional verification and ACL provisioning.

    Returns:
        success: True if the write operation succeeded
        verified: True if the binding was confirmed on the device
        message: Description of the result
        bindings_found: Number of bindings on the endpoint after operation
    """
    _LOGGER.info("ws_create_binding called with: %s", msg)
    result = await matter_client.create_binding(
        hass,
        source_node_id=msg["source_node_id"],
        source_endpoint_id=msg["source_endpoint_id"],
        cluster_id=msg["cluster_id"],
        target_node_id=msg.get("target_node_id"),
        target_endpoint_id=msg.get("target_endpoint_id"),
        target_group_id=msg.get("target_group_id"),
        verify=msg.get("verify", True),
        provision_acl=msg.get("provision_acl", True),
    )
    _LOGGER.info("ws_create_binding result: %s", result)
    if result.success:
        connection.send_result(msg["id"], result.to_dict())
    else:
        # Use specific error type for better frontend handling
        connection.send_error(msg["id"], result.error_type.value, result.message)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_VERIFY_BINDINGS,
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_verify_bindings(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Force re-read bindings from the device to verify current state.

    This bypasses any cached state and reads directly from the Matter device.

    Returns:
        success: True if the read operation succeeded
        verified: True if bindings were successfully read from device
        message: Description of the result
        bindings_found: Number of bindings found on the device
    """
    _LOGGER.info(
        "ws_verify_bindings called for node %s endpoint %s",
        msg["node_id"],
        msg["endpoint_id"],
    )
    result = await matter_client.verify_bindings(
        hass,
        node_id=msg["node_id"],
        endpoint_id=msg["endpoint_id"],
    )
    _LOGGER.info("ws_verify_bindings result: %s", result)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_LIST_ACL,
        vol.Required("node_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_list_acl(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List Access Control List entries for a node.

    ACL entries define which devices/subjects have permission to control this node.

    Returns:
        success: True if the read operation succeeded
        entries: List of ACL entries with privilege, auth_mode, subjects, targets
    """
    _LOGGER.debug("ws_list_acl called for node %s", msg["node_id"])
    try:
        entries = await matter_client.get_acl(hass, node_id=msg["node_id"])
        result = {
            "success": True,
            "entries": [entry.to_dict() for entry in entries],
        }
        _LOGGER.debug("ws_list_acl: Found %d ACL entries", len(entries))
        connection.send_result(msg["id"], result)
    except Exception as err:
        _LOGGER.error("ws_list_acl error: %s", err, exc_info=True)
        connection.send_error(msg["id"], "acl_read_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_PROVISION_ACL,
        vol.Required("target_node_id"): vol.Coerce(int),
        vol.Required("target_endpoint_id"): vol.Coerce(int),
        vol.Required("source_node_id"): vol.Coerce(int),
        vol.Required("cluster_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_provision_acl(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Provision an ACL entry for a binding.

    Adds an ACL entry on the target device to allow the source node
    to control the specified endpoint/cluster.

    Returns:
        success: True if ACL was provisioned
        message: Status message
        acl_entries_count: Number of ACL entries after provisioning
    """
    _LOGGER.info("ws_provision_acl called with: %s", msg)
    result = await matter_client.provision_acl_for_binding(
        hass,
        source_node_id=msg["source_node_id"],
        target_node_id=msg["target_node_id"],
        target_endpoint_id=msg["target_endpoint_id"],
        cluster_id=msg["cluster_id"],
    )

    if result.success:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], result.error_type.value, result.message)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_REMOVE_ACL,
        vol.Required("target_node_id"): vol.Coerce(int),
        vol.Required("source_node_id"): vol.Coerce(int),
        vol.Optional("target_endpoint_id"): vol.Coerce(int),
        vol.Optional("cluster_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_remove_acl(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove an ACL entry.

    Removes ACL entry from target device that grants access to source node.

    Returns:
        success: True if ACL was removed
        message: Status message
        acl_entries_count: Number of ACL entries after removal
    """
    _LOGGER.info("ws_remove_acl called with: %s", msg)
    result = await matter_client.remove_acl_entry(
        hass,
        node_id=msg["target_node_id"],
        source_node_id=msg["source_node_id"],
        target_endpoint_id=msg.get("target_endpoint_id"),
        cluster_id=msg.get("cluster_id"),
    )

    if result.success:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], result.error_type.value, result.message)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_PROVISION_ACL_FOR_BINDINGS,
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_provision_acl_for_bindings(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Provision ACLs for all existing bindings on an endpoint.

    Reads all bindings from the endpoint and provisions ACL entries
    on each target device. Useful for retroactively fixing bindings
    that were created without ACL provisioning.

    Returns:
        success: True if all ACLs were provisioned
        results: List of provisioning results for each binding
        total: Total number of bindings processed
        succeeded: Number of successful ACL provisions
    """
    _LOGGER.info("ws_provision_acl_for_bindings called with: %s", msg)

    results = await matter_client.provision_acls_for_existing_bindings(
        hass,
        node_id=msg["node_id"],
        endpoint_id=msg["endpoint_id"],
    )

    connection.send_result(
        msg["id"],
        {
            "success": all(r["success"] for r in results) if results else True,
            "results": results,
            "total": len(results),
            "succeeded": sum(1 for r in results if r["success"]),
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_DELETE_BINDING,
        vol.Required("source_node_id"): vol.Coerce(int),
        vol.Required("source_endpoint_id"): vol.Coerce(int),
        vol.Optional("target_node_id"): vol.Coerce(int),
        vol.Optional("target_endpoint_id"): vol.Coerce(int),
        vol.Optional("target_group_id"): vol.Coerce(int),
        vol.Optional("cluster_id"): vol.Coerce(int),
        vol.Optional("verify", default=True): bool,
        vol.Optional("remove_acl", default=True): bool,
    }
)
@websocket_api.async_response
async def ws_delete_binding(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a binding with optional verification and ACL cleanup.

    Returns:
        success: True if the write operation succeeded
        verified: True if the binding deletion was confirmed on the device
        message: Description of the result
        bindings_found: Number of bindings remaining on the endpoint
    """
    _LOGGER.info("ws_delete_binding called with: %s", msg)
    result = await matter_client.delete_binding(
        hass,
        source_node_id=msg["source_node_id"],
        source_endpoint_id=msg["source_endpoint_id"],
        target_node_id=msg.get("target_node_id"),
        target_endpoint_id=msg.get("target_endpoint_id"),
        target_group_id=msg.get("target_group_id"),
        cluster_id=msg.get("cluster_id"),
        verify=msg.get("verify", True),
        remove_acl=msg.get("remove_acl", True),
    )
    _LOGGER.info("ws_delete_binding result: %s", result)
    if result.success:
        connection.send_result(msg["id"], result.to_dict())
    else:
        # Use specific error type for better frontend handling
        connection.send_error(msg["id"], result.error_type.value, result.message)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_LIST_GROUPS,
    }
)
@websocket_api.async_response
async def ws_list_groups(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all Matter groups."""
    groups = await matter_client.get_groups(hass)
    connection.send_result(
        msg["id"],
        {"groups": [g.to_dict() for g in groups]},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_CREATE_GROUP,
        vol.Required("group_id"): vol.Coerce(int),
        vol.Required("name"): str,
    }
)
@websocket_api.async_response
async def ws_create_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a new Matter group."""
    success = await matter_client.create_group(hass, msg["group_id"], msg["name"])
    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "create_failed", "Failed to create group")


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_DELETE_GROUP,
        vol.Required("group_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_delete_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a Matter group."""
    success = await matter_client.delete_group(hass, msg["group_id"])
    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "delete_failed", "Failed to delete group")


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_ADD_TO_GROUP,
        vol.Required("group_id"): vol.Coerce(int),
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_add_to_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add an endpoint to a group."""
    success = await matter_client.add_to_group(
        hass, msg["group_id"], msg["node_id"], msg["endpoint_id"]
    )
    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "add_failed", "Failed to add to group")


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_REMOVE_FROM_GROUP,
        vol.Required("group_id"): vol.Coerce(int),
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_remove_from_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove an endpoint from a group."""
    success = await matter_client.remove_from_group(
        hass, msg["group_id"], msg["node_id"], msg["endpoint_id"]
    )
    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "remove_failed", "Failed to remove from group")


# =============================================================================
# Thermostat Schedule WebSocket Commands
# =============================================================================


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_GET_SCHEDULE,
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
        vol.Optional("days"): vol.All(
            [
                vol.In(
                    [
                        "sunday",
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "away",
                    ]
                )
            ]
        ),
        vol.Optional("heat", default=True): bool,
        vol.Optional("cool", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_get_schedule(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get thermostat weekly schedule.

    Request:
        node_id: Matter node ID
        endpoint_id: Endpoint with thermostat cluster
        days: Optional list of days to retrieve (default: all)
        heat: Request heat setpoints (default: true)
        cool: Request cool setpoints (default: false)

    Response:
        schedule: {
            day_of_week: int (bitmap),
            day_names: list of day names,
            mode: int (bitmap),
            mode_names: list of mode names,
            transitions: [{
                transition_time: minutes from midnight,
                heat_setpoint: temperature in °C or null,
                cool_setpoint: temperature in °C or null
            }]
        }
    """
    schedule = await matter_client.get_thermostat_schedule(
        hass,
        node_id=msg["node_id"],
        endpoint_id=msg["endpoint_id"],
        days=msg.get("days"),
        heat=msg.get("heat", True),
        cool=msg.get("cool", False),
    )

    if schedule is not None:
        connection.send_result(msg["id"], {"schedule": schedule.to_dict()})
    elif schedule is False:
        # Device explicitly doesn't support this command
        connection.send_error(
            msg["id"],
            "schedule_not_supported",
            "This thermostat does not support Matter weekly schedules",
        )
    else:
        connection.send_error(
            msg["id"], "get_schedule_failed", "Failed to get thermostat schedule"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_SET_SCHEDULE,
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
        vol.Required("days"): vol.All(
            [
                vol.In(
                    [
                        "sunday",
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "away",
                    ]
                )
            ],
            vol.Length(min=1),
        ),
        vol.Required("transitions"): vol.All(
            [
                vol.Schema(
                    {
                        vol.Required("transition_time"): vol.All(
                            vol.Coerce(int), vol.Range(min=0, max=1439)
                        ),
                        vol.Optional("heat_setpoint"): vol.Coerce(float),
                        vol.Optional("cool_setpoint"): vol.Coerce(float),
                    }
                )
            ],
            vol.Length(min=1, max=10),
        ),
        vol.Optional("heat", default=True): bool,
        vol.Optional("cool", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_set_schedule(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Set thermostat weekly schedule.

    Request:
        node_id: Matter node ID
        endpoint_id: Endpoint with thermostat cluster
        days: List of days this schedule applies to
        transitions: List of schedule transitions:
            - transition_time: Minutes from midnight (0-1439)
            - heat_setpoint: Temperature in °C (optional)
            - cool_setpoint: Temperature in °C (optional)
        heat: Schedule includes heat setpoints (default: true)
        cool: Schedule includes cool setpoints (default: false)

    Response:
        success: true if schedule was set
    """
    success = await matter_client.set_thermostat_schedule(
        hass,
        node_id=msg["node_id"],
        endpoint_id=msg["endpoint_id"],
        days=msg["days"],
        transitions=msg["transitions"],
        heat=msg.get("heat", True),
        cool=msg.get("cool", False),
    )

    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(
            msg["id"], "set_schedule_failed", "Failed to set thermostat schedule"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_CLEAR_SCHEDULE,
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_clear_schedule(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Clear thermostat weekly schedule.

    Request:
        node_id: Matter node ID
        endpoint_id: Endpoint with thermostat cluster

    Response:
        success: true if schedule was cleared
    """
    success = await matter_client.clear_thermostat_schedule(
        hass,
        node_id=msg["node_id"],
        endpoint_id=msg["endpoint_id"],
    )

    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(
            msg["id"], "clear_schedule_failed", "Failed to clear thermostat schedule"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_telemetry",
    }
)
@websocket_api.async_response
async def ws_debug_telemetry(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: Preview telemetry data that would be sent.

    Returns the v3 telemetry data structure for inspection.
    """
    data = await collect_survey_data(hass)
    connection.send_result(msg["id"], data)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_v3_extraction",
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_debug_v3_extraction(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: Show v3 attribute extraction details for a specific endpoint."""
    client = matter_client.get_matter_client(hass)
    if not client:
        connection.send_error(msg["id"], "no_client", "Matter client not available")
        return

    target_node_id = msg["node_id"]
    target_endpoint_id = msg["endpoint_id"]

    result: dict[str, Any] = {
        "node_id": target_node_id,
        "endpoint_id": target_endpoint_id,
        "node_found": False,
        "attributes_source": None,
        "attributes_count": 0,
        "sample_keys": [],
        "global_attrs_found": {},
    }

    # Global attribute IDs we care about
    global_attr_ids = {
        65532: "feature_map",
        65531: "attribute_list",
        65529: "accepted_command_list",
        65528: "generated_command_list",
    }

    for node in client.get_nodes():
        if node.node_id != target_node_id:
            continue

        result["node_found"] = True

        # Try to get attributes
        attributes = None
        node_data = getattr(node, "node_data", None)
        if node_data:
            attributes = getattr(node_data, "attributes", None)
            if attributes:
                result["attributes_source"] = "node_data.attributes"

        if not attributes:
            attributes = getattr(node, "attributes", None)
            if attributes:
                result["attributes_source"] = "node.attributes"

        if not attributes:
            result["attributes_source"] = "none"
            connection.send_result(msg["id"], result)
            return

        result["attributes_count"] = len(attributes)

        # Sample some keys to understand structure
        for i, (key, value) in enumerate(attributes.items()):
            if i >= 10:
                break

            key_info = {
                "key_type": type(key).__name__,
                "key_str": str(key)[:100],
                "has_EndpointId": hasattr(key, "EndpointId"),
                "has_ClusterId": hasattr(key, "ClusterId"),
                "has_AttributeId": hasattr(key, "AttributeId"),
            }

            if hasattr(key, "EndpointId"):
                key_info["EndpointId"] = key.EndpointId
                key_info["ClusterId"] = key.ClusterId
                key_info["AttributeId"] = key.AttributeId

            result["sample_keys"].append(key_info)

        # Now look for global attributes for the target endpoint
        for key, value in attributes.items():
            ep_id = None
            cl_id = None
            at_id = None

            if (
                hasattr(key, "EndpointId")
                and hasattr(key, "ClusterId")
                and hasattr(key, "AttributeId")
            ):
                ep_id = key.EndpointId
                cl_id = key.ClusterId
                at_id = key.AttributeId
            else:
                try:
                    parts = str(key).split("/")
                    if len(parts) >= 3:
                        ep_id = int(parts[0])
                        cl_id = int(parts[1])
                        at_id = int(parts[2])
                except (ValueError, IndexError):
                    continue

            if ep_id != target_endpoint_id:
                continue

            if at_id in global_attr_ids:
                attr_name = global_attr_ids[at_id]
                cluster_key = f"cluster_{cl_id}"
                if cluster_key not in result["global_attrs_found"]:
                    result["global_attrs_found"][cluster_key] = {}

                # Store value info
                if isinstance(value, (list, tuple)):
                    result["global_attrs_found"][cluster_key][attr_name] = {
                        "type": "list",
                        "length": len(value),
                        "sample": list(value)[:5],
                    }
                else:
                    result["global_attrs_found"][cluster_key][attr_name] = {
                        "type": type(value).__name__,
                        "value": value,
                    }

        connection.send_result(msg["id"], result)
        return

    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_CREATE_AUTOMATION,
        vol.Required("template_id"): str,
        vol.Required("source_node_id"): vol.Coerce(int),
        vol.Required("source_endpoint_id"): vol.Coerce(int),
        vol.Required("target_node_id"): vol.Coerce(int),
        vol.Required("target_endpoint_id"): vol.Coerce(int),
        vol.Optional("source_device_types"): [vol.Coerce(int)],
        vol.Optional("target_device_types"): [vol.Coerce(int)],
        vol.Optional("trigger_entity_id"): str,
        vol.Optional("action_entity_id"): str,
        vol.Optional("alias"): str,
        vol.Optional("preview_only", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_create_automation(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create or preview a Home Assistant automation from a template.

    Request:
        template_id: Automation template ID (e.g., "light-occupancy")
        source_node_id: Matter node ID of the action target (light/plug/thermostat)
        source_endpoint_id: Endpoint ID of the action target
        target_node_id: Matter node ID of the trigger source (sensor/switch)
        target_endpoint_id: Endpoint ID of the trigger source
        source_device_types: Optional device types for the source
        target_device_types: Optional device types for the target
        trigger_entity_id: Optional specific trigger entity to use
        action_entity_id: Optional specific action entity to use
        alias: Optional custom name for the automation
        preview_only: If true, return config without creating (default: false)

    Response:
        success: Whether the operation succeeded
        automation_id: ID of created automation (if created)
        automation_config: The automation configuration
        available_entities: Trigger and action entity options for selection
        message: Status message
        error_code: Error code if failed
    """
    template_id = msg["template_id"]
    source_node_id = msg["source_node_id"]
    source_endpoint_id = msg["source_endpoint_id"]
    target_node_id = msg["target_node_id"]
    target_endpoint_id = msg["target_endpoint_id"]
    source_device_types = msg.get("source_device_types", [])
    target_device_types = msg.get("target_device_types", [])
    trigger_entity_id = msg.get("trigger_entity_id")
    action_entity_id = msg.get("action_entity_id")
    alias = msg.get("alias")
    preview_only = msg.get("preview_only", False)

    _LOGGER.debug(
        "Create automation request: template=%s, source=%d/%d, target=%d/%d, preview=%s",
        template_id,
        source_node_id,
        source_endpoint_id,
        target_node_id,
        target_endpoint_id,
        preview_only,
    )

    if preview_only:
        result = await preview_automation(
            hass,
            template_id=template_id,
            source_node_id=source_node_id,
            source_device_types=source_device_types,
            target_node_id=target_node_id,
            target_device_types=target_device_types,
            trigger_entity_id=trigger_entity_id,
            action_entity_id=action_entity_id,
            alias=alias,
        )
    else:
        result = await create_automation_from_template(
            hass,
            template_id=template_id,
            source_node_id=source_node_id,
            source_device_types=source_device_types,
            target_node_id=target_node_id,
            target_device_types=target_device_types,
            trigger_entity_id=trigger_entity_id,
            action_entity_id=action_entity_id,
            alias=alias,
        )

    response = {
        "success": result.success,
        "automation_id": result.automation_id,
        "automation_config": result.automation_config,
        "available_entities": result.available_entities,
        "message": result.message,
        "error_code": result.error_code.value if result.error_code else None,
    }

    if result.success:
        connection.send_result(msg["id"], response)
    else:
        connection.send_error(
            msg["id"],
            result.error_code.value if result.error_code else "unknown_error",
            result.message,
        )
