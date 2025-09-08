"""Websocket API for Home Assistant Entity Visualizer."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


@callback
def async_register_websocket_handlers(hass: HomeAssistant) -> None:
    """Register websocket API handlers."""
    _LOGGER.info("Registering websocket API handlers for ha_visualiser")
    websocket_api.async_register_command(hass, websocket_search_entities)
    websocket_api.async_register_command(hass, websocket_get_neighborhood)
    websocket_api.async_register_command(hass, websocket_get_filtered_neighborhood)
    websocket_api.async_register_command(hass, websocket_get_graph_statistics)
    _LOGGER.info("Successfully registered 4 websocket commands")


@websocket_api.websocket_command({
    vol.Required("type"): "ha_visualiser/search_entities",
    vol.Required("query"): str,
    vol.Optional("limit", default=20): int,
})
@websocket_api.async_response
async def websocket_search_entities(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Search for entities matching the query."""
    try:
        graph_service = hass.data[DOMAIN]["graph_service"]
        results = await graph_service.search_entities(
            msg["query"], 
            msg["limit"]
        )
        
        connection.send_result(msg["id"], results)
    except Exception as error:
        _LOGGER.error("Error searching entities: %s", error)
        connection.send_error(
            msg["id"], 
            websocket_api.const.ERR_UNKNOWN_ERROR, 
            str(error)
        )


@websocket_api.websocket_command({
    vol.Required("type"): "ha_visualiser/get_neighborhood",
    vol.Required("entity_id"): str,
    vol.Optional("max_depth", default=3): int,
    vol.Optional("show_areas", default=True): bool,
})
@websocket_api.async_response
async def websocket_get_neighborhood(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get the neighborhood graph for an entity."""
    try:
        graph_service = hass.data[DOMAIN]["graph_service"]
        result = await graph_service.get_entity_neighborhood(
            msg["entity_id"],
            msg["max_depth"],
            show_areas=msg["show_areas"]
        )
        
        # Validate result structure and add defensive checks
        if not isinstance(result, dict):
            raise ValueError(f"Graph service returned invalid result type: {type(result)}")
        
        nodes = result.get("nodes")
        edges = result.get("edges")
        center_node = result.get("center_node")
        
        if nodes is None:
            _LOGGER.error("Graph service returned None for nodes. Result keys: %s", list(result.keys()))
            nodes = []
        elif not isinstance(nodes, (list, tuple)):
            _LOGGER.error("Graph service returned invalid nodes type: %s", type(nodes))
            nodes = []
            
        if edges is None:
            _LOGGER.error("Graph service returned None for edges. Result keys: %s", list(result.keys()))
            edges = []
        elif not isinstance(edges, (list, tuple)):
            _LOGGER.error("Graph service returned invalid edges type: %s", type(edges))
            edges = []
            
        # Convert dataclasses to dicts for JSON serialization with safe iteration
        serialized_result = {
            "nodes": [
                {
                    "id": node.id,
                    "label": node.label,
                    "domain": node.domain,
                    "area": node.area,
                    "device_id": node.device_id,
                    "state": node.state,
                    "icon": node.icon
                }
                for node in nodes
            ],
            "edges": [
                {
                    "from_node": edge.from_node,
                    "to_node": edge.to_node,
                    "relationship_type": edge.relationship_type,
                    "label": edge.label
                }
                for edge in edges
            ],
            "center_node": center_node or msg["entity_id"]
        }
        
        connection.send_result(msg["id"], serialized_result)
    except ValueError as error:
        _LOGGER.warning("Invalid entity requested: %s", error)
        connection.send_error(
            msg["id"], 
            websocket_api.const.ERR_NOT_FOUND, 
            str(error)
        )
    except Exception as error:
        _LOGGER.error("Error getting neighborhood: %s", error)
        connection.send_error(
            msg["id"], 
            websocket_api.const.ERR_UNKNOWN_ERROR, 
            str(error)
        )


@websocket_api.websocket_command({
    vol.Required("type"): "ha_visualiser/get_filtered_neighborhood",
    vol.Required("entity_id"): str,
    vol.Optional("max_depth", default=3): int,
    vol.Optional("domain_filter"): [str],
    vol.Optional("area_filter"): [str],
    vol.Optional("relationship_filter"): [str],
})
@websocket_api.async_response
async def websocket_get_filtered_neighborhood(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get the filtered neighborhood graph for an entity."""
    try:
        graph_service = hass.data[DOMAIN]["graph_service"]
        result = await graph_service.get_filtered_neighborhood(
            msg["entity_id"],
            msg["max_depth"],
            msg.get("domain_filter"),
            msg.get("area_filter"), 
            msg.get("relationship_filter")
        )
        
        # Convert dataclasses to dicts for JSON serialization
        serialized_result = {
            "nodes": [
                {
                    "id": node.id,
                    "label": node.label,
                    "domain": node.domain,
                    "area": node.area,
                    "device_id": node.device_id,
                    "state": node.state,
                    "icon": node.icon
                }
                for node in result["nodes"]
            ],
            "edges": [
                {
                    "from_node": edge.from_node,
                    "to_node": edge.to_node,
                    "relationship_type": edge.relationship_type,
                    "label": edge.label
                }
                for edge in result["edges"]
            ],
            "center_node": result["center_node"],
            "filtered_count": result["filtered_count"]
        }
        
        connection.send_result(msg["id"], serialized_result)
    except ValueError as error:
        _LOGGER.warning("Invalid entity requested: %s", error)
        connection.send_error(
            msg["id"], 
            websocket_api.const.ERR_NOT_FOUND, 
            str(error)
        )
    except Exception as error:
        _LOGGER.error("Error getting filtered neighborhood: %s", error)
        connection.send_error(
            msg["id"], 
            websocket_api.const.ERR_UNKNOWN_ERROR, 
            str(error)
        )


@websocket_api.websocket_command({
    vol.Required("type"): "ha_visualiser/get_graph_statistics",
})
@websocket_api.async_response
async def websocket_get_graph_statistics(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get overall graph statistics."""
    try:
        graph_service = hass.data[DOMAIN]["graph_service"]
        result = await graph_service.get_graph_statistics()
        
        connection.send_result(msg["id"], result)
    except Exception as error:
        _LOGGER.error("Error getting graph statistics: %s", error)
        connection.send_error(
            msg["id"], 
            websocket_api.const.ERR_UNKNOWN_ERROR, 
            str(error)
        )