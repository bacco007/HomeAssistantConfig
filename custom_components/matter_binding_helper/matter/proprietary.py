"""Proprietary attribute operations for Matter devices.

Handles vendor-specific (non-standard) cluster attributes like Eve Energy's
custom power monitoring clusters.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant

from .client import get_raw_matter_client
from .demo import is_demo_mode

_LOGGER = logging.getLogger(__name__)


async def get_proprietary_attributes(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
    cluster_id: int,
    attribute_ids: list[int],
) -> dict[int, Any]:
    """Read proprietary attribute values from a Matter node.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID on the node
        cluster_id: Proprietary cluster ID
        attribute_ids: List of attribute IDs to read

    Returns:
        Dictionary mapping attribute_id to value (None if read failed)
    """
    results: dict[int, Any] = {}

    # Demo mode returns empty values
    if is_demo_mode(hass):
        return results

    client = get_raw_matter_client(hass)
    if not client:
        _LOGGER.warning("get_proprietary_attributes: Matter client not available")
        return results

    # Try reading from cached node data first
    for node in client.get_nodes():
        if node.node_id != node_id:
            continue

        # Try to get values from node_data.attributes
        node_data = getattr(node, "node_data", None)
        if node_data:
            node_attrs = getattr(node_data, "attributes", {})

            for attr_id in attribute_ids:
                # Try AttributePath object format
                for key, value in node_attrs.items():
                    if (
                        hasattr(key, "EndpointId")
                        and hasattr(key, "ClusterId")
                        and hasattr(key, "AttributeId")
                    ):
                        if (
                            key.EndpointId == endpoint_id
                            and key.ClusterId == cluster_id
                            and key.AttributeId == attr_id
                        ):
                            results[attr_id] = value
                            break
                    # Try string format "endpoint/cluster/attribute"
                    key_str = str(key)
                    if f"{endpoint_id}/{cluster_id}/{attr_id}" in key_str:
                        results[attr_id] = value
                        break

        # If not found in cache, try reading directly
        for attr_id in attribute_ids:
            if attr_id in results:
                continue

            try:
                attribute_path = f"{endpoint_id}/{cluster_id}/{attr_id}"
                _LOGGER.debug(
                    "Reading proprietary attribute: node %s, path %s",
                    node_id,
                    attribute_path,
                )

                result = await client.read_attribute(
                    node_id=node_id,
                    attribute_path=attribute_path,
                )
                results[attr_id] = result
                _LOGGER.debug(
                    "Read proprietary attribute %s: %s (type: %s)",
                    attribute_path,
                    result,
                    type(result).__name__,
                )
            except Exception as err:
                _LOGGER.debug(
                    "Failed to read proprietary attribute %d/%d/%d: %s",
                    endpoint_id,
                    cluster_id,
                    attr_id,
                    err,
                )
                results[attr_id] = None

        return results

    _LOGGER.debug("Node %s not found for proprietary attribute read", node_id)
    return results
