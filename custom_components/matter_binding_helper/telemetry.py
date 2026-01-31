"""Telemetry module for Matter Survey data collection."""

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant

from .const import (
    ATTR_ACCEPTED_COMMAND_LIST,
    ATTR_ATTRIBUTE_LIST,
    ATTR_FEATURE_MAP,
    ATTR_GENERATED_COMMAND_LIST,
    CONF_TELEMETRY_ENABLED,
    DEFAULT_TELEMETRY_ENABLED,
    DOMAIN,
    TELEMETRY_INITIAL_DELAY_MINUTES,
    TELEMETRY_URL,
)
from .matter_client import get_matter_client, get_nodes

_LOGGER = logging.getLogger(__name__)

# Config entry option key for installation UUID
CONF_INSTALLATION_ID = "installation_id"

# Schema version for v3 telemetry
TELEMETRY_SCHEMA_VERSION = 3


def _get_cluster_details_v3(
    hass: HomeAssistant, node_id: int, endpoint_id: int, cluster_ids: list[int]
) -> dict[int, dict[str, Any]]:
    """Get detailed cluster information for telemetry v3 schema.

    For each cluster, retrieves:
    - feature_map: Bitmask of enabled cluster features
    - attribute_list: List of supported attribute IDs
    - accepted_command_list: List of accepted command IDs
    - generated_command_list: List of generated command IDs

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID
        cluster_ids: List of cluster IDs to get details for

    Returns:
        Dict mapping cluster_id to cluster details
    """
    # Initialize result with just IDs for all requested clusters
    result: dict[int, dict[str, Any]] = {}
    for cluster_id in cluster_ids:
        result[cluster_id] = {"id": cluster_id}

    client = get_matter_client(hass)
    if not client:
        return result

    try:
        nodes = client.get_nodes()
        node = next((n for n in nodes if n.node_id == node_id), None)
        if not node:
            return result

        # Get attributes - prefer node_data.attributes
        attributes = None
        node_data = getattr(node, "node_data", None)
        if node_data:
            attributes = getattr(node_data, "attributes", None)
        if not attributes:
            attributes = getattr(node, "attributes", None)
        if not attributes:
            return result

        # Global attribute IDs we want to extract
        global_attrs = {
            ATTR_FEATURE_MAP: "feature_map",
            ATTR_ATTRIBUTE_LIST: "attribute_list",
            ATTR_ACCEPTED_COMMAND_LIST: "accepted_command_list",
            ATTR_GENERATED_COMMAND_LIST: "generated_command_list",
        }

        # Build set of requested cluster IDs for fast lookup
        requested_clusters = set(cluster_ids)

        # Iterate through all attributes
        # Keys are strings like "endpoint/cluster/attribute"
        for attr_key, attr_value in attributes.items():
            ep_id = None
            cl_id = None
            at_id = None

            # Try string parsing first (most common format: "1/29/65532")
            try:
                key_str = str(attr_key)
                parts = key_str.split("/")
                if len(parts) >= 3:
                    ep_id = int(parts[0])
                    cl_id = int(parts[1])
                    at_id = int(parts[2])
            except (ValueError, IndexError, TypeError):
                # Try AttributePath object as fallback
                if (
                    hasattr(attr_key, "EndpointId")
                    and hasattr(attr_key, "ClusterId")
                    and hasattr(attr_key, "AttributeId")
                ):
                    ep_id = attr_key.EndpointId
                    cl_id = attr_key.ClusterId
                    at_id = attr_key.AttributeId

            # Skip if parsing failed
            if ep_id is None or cl_id is None or at_id is None:
                continue

            # Skip if not the target endpoint
            if ep_id != endpoint_id:
                continue

            # Skip if not a global attribute we care about
            if at_id not in global_attrs:
                continue

            # Skip if not a requested cluster
            if cl_id not in requested_clusters:
                continue

            # Extract the value
            field_name = global_attrs[at_id]
            if field_name == "feature_map":
                result[cl_id][field_name] = int(attr_value)
            elif isinstance(attr_value, (list, tuple)):
                result[cl_id][field_name] = list(attr_value)

    except Exception as err:
        _LOGGER.debug("Error getting cluster details for node %s: %s", node_id, err)

    return result


def _anonymize_node(hass: HomeAssistant, node: dict[str, Any]) -> dict[str, Any] | None:
    """Anonymize a single node, removing all personally identifiable information.

    Returns None if the node doesn't have useful capability data.

    What we collect (public device info):
    - vendor_id, vendor_name (manufacturer identification)
    - product_id, product_name (product identification)
    - hardware_version, software_version (version info)
    - endpoint structure with device_types, clusters (v3: with detailed cluster info)

    What we explicitly DO NOT collect:
    - node_id (fabric-specific identifier)
    - name (user-assigned device name)
    - node_label (user-assigned label)
    - area_name (user room/area configuration)
    - ha_device_id (Home Assistant installation identifier)
    - available status (runtime state)
    """
    device_info = node.get("device_info", {})
    node_id = node.get("node_id")

    _LOGGER.debug(
        "Anonymizing node %s: device_info=%s",
        node_id,
        device_info,
    )

    # Skip if no useful product identification
    if not device_info.get("vendor_id") and not device_info.get("product_id"):
        _LOGGER.debug(
            "Skipping node %s: no vendor_id (%s) or product_id (%s)",
            node_id,
            device_info.get("vendor_id"),
            device_info.get("product_id"),
        )
        return None

    # Anonymize endpoints - use v3 format with detailed cluster info
    anonymized_endpoints = []
    for endpoint in node.get("endpoints", []):
        endpoint_id = endpoint.get("endpoint_id")
        server_cluster_ids = endpoint.get("server_clusters", [])
        client_cluster_ids = endpoint.get("client_clusters", [])

        # Get detailed cluster information for v3 schema
        server_details = _get_cluster_details_v3(
            hass, node_id, endpoint_id, server_cluster_ids
        )
        client_details = _get_cluster_details_v3(
            hass, node_id, endpoint_id, client_cluster_ids
        )

        # Convert to v3 cluster format (list of ClusterInfo objects)
        server_clusters_v3 = [
            server_details.get(cid, {"id": cid}) for cid in server_cluster_ids
        ]
        client_clusters_v3 = [
            client_details.get(cid, {"id": cid}) for cid in client_cluster_ids
        ]

        anonymized_endpoints.append(
            {
                "endpoint_id": endpoint_id,
                "device_types": endpoint.get("device_types", []),
                "server_clusters": server_clusters_v3,
                "client_clusters": client_clusters_v3,
            }
        )

    # Skip devices with no endpoints
    if not anonymized_endpoints:
        return None

    return {
        "vendor_id": device_info.get("vendor_id"),
        "vendor_name": device_info.get("vendor_name"),
        "product_id": device_info.get("product_id"),
        "product_name": device_info.get("product_name"),
        "hardware_version": device_info.get("hardware_version"),
        "software_version": device_info.get("software_version"),
        "endpoints": anonymized_endpoints,
    }


def _get_or_create_installation_id(hass: HomeAssistant) -> str:
    """Get or create a random installation UUID for deduplication.

    This UUID is used only for deduplication on the server side to avoid
    counting the same installation multiple times. It is not linked to
    any personally identifiable information and cannot be used to track users.

    Uses config entry options for storage, which is more reliable than
    the Store helper class in various HA contexts.
    """
    entries = hass.config_entries.async_entries(DOMAIN)
    _LOGGER.debug("Looking for installation_id in %d config entries", len(entries))

    for entry in entries:
        # Check if we already have an installation ID
        if CONF_INSTALLATION_ID in entry.options:
            existing_id = entry.options[CONF_INSTALLATION_ID]
            _LOGGER.debug("Found existing installation_id: %s", existing_id)
            return existing_id

        # Generate new random UUID and persist it in config entry options
        installation_id = str(uuid.uuid4())
        new_options = {**entry.options, CONF_INSTALLATION_ID: installation_id}
        hass.config_entries.async_update_entry(entry, options=new_options)
        _LOGGER.info("Generated new installation_id: %s", installation_id)
        return installation_id

    # Fallback if no config entry exists (shouldn't happen in normal operation)
    _LOGGER.warning(
        "No config entry found for %s, generating ephemeral installation_id", DOMAIN
    )
    ephemeral_id = str(uuid.uuid4())
    _LOGGER.warning(
        "Using ephemeral installation_id: %s (data won't be deduplicated)", ephemeral_id
    )
    return ephemeral_id


async def collect_survey_data(hass: HomeAssistant) -> dict[str, Any]:
    """Collect anonymized device data for the Matter Survey.

    Returns a dictionary containing:
    - installation_id: Random UUID for deduplication only
    - devices: List of anonymized device capability data
    """
    _LOGGER.debug("Collecting survey data...")

    installation_id = _get_or_create_installation_id(hass)

    _LOGGER.debug("Fetching Matter nodes...")
    nodes = await get_nodes(hass)
    _LOGGER.debug("Retrieved %d nodes from Matter client", len(nodes))

    anonymized_devices = []
    skipped_count = 0
    for node in nodes:
        anonymized = _anonymize_node(hass, node)
        if anonymized:
            anonymized_devices.append(anonymized)
        else:
            skipped_count += 1

    if skipped_count > 0:
        _LOGGER.debug("Skipped %d nodes (no useful product data)", skipped_count)

    _LOGGER.debug(
        "Survey data ready: installation_id=%s, devices=%d, schema_version=%d",
        installation_id,
        len(anonymized_devices),
        TELEMETRY_SCHEMA_VERSION,
    )

    return {
        "installation_id": installation_id,
        "schema_version": TELEMETRY_SCHEMA_VERSION,  # v3: clusters with detailed info
        "devices": anonymized_devices,
    }


async def send_telemetry(hass: HomeAssistant) -> bool:
    """Send anonymized telemetry data to the Matter Survey service.

    Returns True if successful, False otherwise.
    """
    _LOGGER.debug("send_telemetry() called")

    # Check if telemetry is enabled
    if not is_telemetry_enabled(hass):
        _LOGGER.info("Telemetry is disabled in settings, skipping submission")
        return False

    try:
        _LOGGER.debug("Collecting survey data...")
        data = await collect_survey_data(hass)

        _LOGGER.debug(
            "Collected data: installation_id=%s, device_count=%d",
            data.get("installation_id", "MISSING"),
            len(data.get("devices", [])),
        )

        if not data["devices"]:
            _LOGGER.info("No Matter devices found to report, skipping telemetry")
            return True

        _LOGGER.info(
            "Sending anonymized telemetry for %d devices to %s",
            len(data["devices"]),
            TELEMETRY_URL,
        )

        async with aiohttp.ClientSession() as session:
            async with session.post(
                TELEMETRY_URL,
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                response_text = await response.text()
                _LOGGER.debug(
                    "Server response: status=%d, body=%s",
                    response.status,
                    response_text,
                )

                if response.status == 200:
                    _LOGGER.info(
                        "Telemetry sent successfully: %d devices reported",
                        len(data["devices"]),
                    )
                    return True
                else:
                    _LOGGER.warning(
                        "Telemetry submission failed with status %d: %s",
                        response.status,
                        response_text,
                    )
                    return False

    except asyncio.TimeoutError:
        _LOGGER.warning("Telemetry submission timed out after 30 seconds")
        return False
    except aiohttp.ClientError as err:
        _LOGGER.warning("Telemetry submission failed (network error): %s", err)
        return False
    except Exception as err:
        _LOGGER.error(
            "Unexpected error sending telemetry (%s): %s",
            type(err).__name__,
            err,
            exc_info=True,
        )
        return False


def is_telemetry_enabled(hass: HomeAssistant) -> bool:
    """Check if telemetry is enabled in the config entry options."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        return entry.options.get(CONF_TELEMETRY_ENABLED, DEFAULT_TELEMETRY_ENABLED)
    return DEFAULT_TELEMETRY_ENABLED


async def schedule_initial_telemetry(hass: HomeAssistant) -> None:
    """Schedule initial telemetry submission after a delay.

    Waits for TELEMETRY_INITIAL_DELAY_MINUTES before sending to allow
    Home Assistant to fully initialize and discover all Matter devices.
    """
    if not is_telemetry_enabled(hass):
        _LOGGER.info("Telemetry disabled in settings, skipping initial submission")
        return

    _LOGGER.info(
        "Scheduling initial Matter Survey submission in %d minutes",
        TELEMETRY_INITIAL_DELAY_MINUTES,
    )

    await asyncio.sleep(TELEMETRY_INITIAL_DELAY_MINUTES * 60)

    # Check again in case user disabled it during the delay
    if is_telemetry_enabled(hass):
        _LOGGER.info("Starting scheduled initial telemetry submission")
        result = await send_telemetry(hass)
        _LOGGER.info(
            "Initial telemetry submission %s", "succeeded" if result else "failed"
        )
    else:
        _LOGGER.info("Telemetry was disabled during delay period, skipping submission")
