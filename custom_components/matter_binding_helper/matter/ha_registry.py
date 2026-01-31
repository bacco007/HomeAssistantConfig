"""Home Assistant device/entity/area registry integration.

Bridges Matter nodes to Home Assistant device registry.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

_LOGGER = logging.getLogger(__name__)


def get_entities_for_device(
    hass: HomeAssistant, device_id: str
) -> list[dict[str, Any]]:
    """Get all entities associated with a device.

    Returns a list of entity info dicts with:
    - entity_id: The full entity ID (e.g., "light.living_room")
    - domain: The entity domain (e.g., "light", "switch", "event")
    - name: The entity's friendly name
    - original_name: The original name before user customization
    - platform: The integration platform (should be "matter")
    - disabled: Whether the entity is disabled
    """
    entities: list[dict[str, Any]] = []

    try:
        entity_registry = er.async_get(hass)

        for entity in entity_registry.entities.values():
            if entity.device_id == device_id:
                entities.append(
                    {
                        "entity_id": entity.entity_id,
                        "domain": entity.domain,
                        "name": entity.name or entity.original_name,
                        "original_name": entity.original_name,
                        "platform": entity.platform,
                        "disabled": entity.disabled,
                    }
                )

        _LOGGER.debug(
            "Found %d entities for device %s: %s",
            len(entities),
            device_id,
            [e["entity_id"] for e in entities],
        )
    except Exception as err:
        _LOGGER.debug("Error getting entities for device %s: %s", device_id, err)

    return entities


def get_ha_device_info(hass: HomeAssistant, node_id: int) -> dict[str, Any]:
    """Get Home Assistant device info for a Matter node.

    Looks up the HA device associated with the Matter node to get:
    - HA device name (user-configured)
    - Area name
    - HA device ID
    - Associated entities

    Matter device identifiers use the format:
    ("matter", "deviceid_{fabric_id}-{node_id_hex_16}-MatterNodeDevice")
    where node_id_hex_16 is the node ID as a 16-digit uppercase hex string.
    """
    ha_info: dict[str, Any] = {
        "ha_device_id": None,
        "ha_device_name": None,
        "area_id": None,
        "area_name": None,
        "entities": [],
    }

    # Convert node_id to 16-digit uppercase hex for matching
    node_id_hex = f"{node_id:016X}"

    try:
        device_registry = dr.async_get(hass)
        area_registry = ar.async_get(hass)

        # Find devices with Matter identifiers containing our node_id
        for device in device_registry.devices.values():
            for identifier in device.identifiers:
                # Check if this is a Matter device
                if len(identifier) >= 2 and identifier[0] == "matter":
                    id_value = str(identifier[1])

                    # Match deviceid_ format: deviceid_{fabric}-{node_id_hex}-MatterNodeDevice
                    if (
                        id_value.startswith("deviceid_")
                        and f"-{node_id_hex}-" in id_value
                    ):
                        ha_info["ha_device_id"] = device.id
                        ha_info["ha_device_name"] = device.name_by_user or device.name
                        ha_info["area_id"] = device.area_id

                        if device.area_id:
                            area = area_registry.async_get_area(device.area_id)
                            if area:
                                ha_info["area_name"] = area.name

                        # Get all entities for this device
                        ha_info["entities"] = get_entities_for_device(hass, device.id)

                        _LOGGER.debug(
                            "Found HA device for Matter node %s: %s (area: %s, entities: %d)",
                            node_id,
                            ha_info["ha_device_name"],
                            ha_info["area_name"],
                            len(ha_info["entities"]),
                        )
                        return ha_info

        _LOGGER.debug("No HA device found for Matter node %s", node_id)
    except Exception as err:
        _LOGGER.debug("Error getting HA device info for node %s: %s", node_id, err)

    return ha_info


# Backwards compatibility aliases with underscore prefix
_get_entities_for_device = get_entities_for_device
_get_ha_device_info = get_ha_device_info
