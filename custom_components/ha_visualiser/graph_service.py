"""Graph service for analyzing Home Assistant entity relationships."""
from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Set
from dataclasses import dataclass

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry, entity_registry, area_registry, label_registry
from homeassistant.const import ATTR_LATITUDE, ATTR_LONGITUDE

_LOGGER = logging.getLogger(__name__)


@dataclass
class GraphNode:
    """Represents a node in the entity graph."""
    id: str
    label: str
    domain: str
    area: str | None
    device_id: str | None
    state: str | None
    icon: str | None


@dataclass
class GraphEdge:
    """Represents an edge in the entity graph."""
    from_node: str
    to_node: str
    relationship_type: str
    label: str


class GraphService:
    """Service for building and analyzing entity relationship graphs."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the graph service."""
        self.hass = hass
        self._entity_registry = entity_registry.async_get(hass)
        self._device_registry = device_registry.async_get(hass)
        self._area_registry = area_registry.async_get(hass)
        self._label_registry = label_registry.async_get(hass)

    async def get_entity_neighborhood(
        self, entity_id: str, max_depth: int = 3, show_areas: bool = True
    ) -> Dict[str, Any]:
        """Get the neighborhood graph for a specific entity, device, area, zone, or label."""
        
        try:
            # Handle device nodes
            if entity_id.startswith("device:"):
                device_id = entity_id.replace("device:", "")
                device = self._device_registry.async_get(device_id)
                if not device:
                    raise ValueError(f"Device {device_id} not found")
            # Handle area nodes
            elif entity_id.startswith("area:"):
                area_id = entity_id.replace("area:", "")
                area = self._area_registry.async_get_area(area_id)
                if not area:
                    raise ValueError(f"Area {area_id} not found")
            # Handle zone nodes
            elif entity_id.startswith("zone."):
                zone_state = self.hass.states.get(entity_id)
                if not zone_state:
                    raise ValueError(f"Zone {entity_id} not found")
            # Handle label nodes
            elif entity_id.startswith("label:"):
                label_id = entity_id.replace("label:", "")
                label_entry = self._label_registry.async_get_label(label_id)
                if not label_entry:
                    raise ValueError(f"Label {label_id} not found")
            # Handle regular entities
            elif entity_id not in self.hass.states.async_entity_ids():
                raise ValueError(f"Entity {entity_id} not found")

            nodes = {}
            edges = []
            distances = {}  # Track minimum distance to each node
            edge_set = set()  # Track edges to prevent duplicates
            
            # Start with the target entity or device
            _LOGGER.debug(f"Building neighborhood for {entity_id}")
            await self._add_entity_and_neighbors_with_distance(
                entity_id, nodes, edges, distances, edge_set, max_depth, 0, show_areas
            )
            _LOGGER.debug(f"Graph complete: {len(nodes)} nodes, {len(edges)} edges")
            
            # Validate results before returning
            if nodes is None:
                _LOGGER.error(f"Graph building resulted in None nodes for {entity_id}")
                nodes = {}
            if edges is None:
                _LOGGER.error(f"Graph building resulted in None edges for {entity_id}")
                edges = []
            
            nodes_list = list(nodes.values()) if isinstance(nodes, dict) else []
            edges_list = edges if isinstance(edges, list) else []
            
            _LOGGER.debug(f"Returning graph: {len(nodes_list)} nodes, {len(edges_list)} edges")
            
            return {
                "nodes": nodes_list,
                "edges": edges_list,
                "center_node": entity_id
            }
            
        except Exception as e:
            _LOGGER.error(f"Error building neighborhood graph for {entity_id}: {e}", exc_info=True)
            # Return safe empty result on any error
            return {
                "nodes": [],
                "edges": [],
                "center_node": entity_id
            }

    def _get_entities_for_label(self, label_id: str) -> List[Any]:
        """Get entities for a label with compatibility check."""
        try:
            # Manual approach - safe for all HA versions
            result = []
            for entity_entry in self._entity_registry.entities.values():
                if hasattr(entity_entry, 'labels') and entity_entry.labels and label_id in entity_entry.labels:
                    result.append(entity_entry)
            return result
        except Exception as e:
            _LOGGER.debug(f"Error getting entities for label {label_id}: {e}")
            return []
    
    def _get_devices_for_label(self, label_id: str) -> List[Any]:
        """Get devices for a label with compatibility check."""
        try:
            # Manual approach - safe for all HA versions
            result = []
            for device in self._device_registry.devices.values():
                if hasattr(device, 'labels') and device.labels and label_id in device.labels:
                    result.append(device)
            return result
        except Exception as e:
            _LOGGER.debug(f"Error getting devices for label {label_id}: {e}")
            return []
    
    def _get_areas_for_label(self, label_id: str) -> List[Any]:
        """Get areas for a label with compatibility check."""
        try:
            # Manual approach - safe for all HA versions
            result = []
            for area in self._area_registry.areas.values():
                if hasattr(area, 'labels') and area.labels and label_id in area.labels:
                    result.append(area)
            return result
        except Exception as e:
            _LOGGER.debug(f"Error getting areas for label {label_id}: {e}")
            return []

    async def search_entities(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search for entities and devices matching the query."""
        query_lower = query.lower()
        results = []
        
        # Search entities
        for entity_id in self.hass.states.async_entity_ids():
            state = self.hass.states.get(entity_id)
            if not state:
                continue
                
            # Search in entity_id and friendly_name
            friendly_name = state.attributes.get("friendly_name", entity_id)
            
            if (query_lower in entity_id.lower() or 
                query_lower in friendly_name.lower()):
                
                # For group-like entities, check if they have any relationships before including
                domain = entity_id.split(".")[0]
                group_domains = ["group", "light", "switch", "cover", "fan", "media_player", "climate"]
                
                if domain in group_domains:
                    # Check if group-like entity has any member entities
                    member_entities = []
                    
                    if domain == "group":
                        member_entities = state.attributes.get("entity_id", [])
                    elif domain == "light":
                        light_entities = state.attributes.get("entity_id", [])
                        lights_attr = state.attributes.get("lights", [])
                        member_entities = light_entities + lights_attr
                    elif domain in ["switch", "cover", "fan", "climate"]:
                        entity_attr = state.attributes.get("entity_id", [])
                        plural_attr = state.attributes.get(f"{domain}s", [])
                        member_entities = entity_attr + plural_attr
                    elif domain == "media_player":
                        media_entities = state.attributes.get("entity_id", [])
                        group_members = state.attributes.get("group_members", [])
                        member_entities = media_entities + group_members
                    
                    # Only include if it's a real group with members or if it might be a group
                    # (some groups might not have members at search time but still be valid)
                    if not member_entities and domain == "group":
                        continue  # Skip traditional groups with no members
                
                results.append({
                    "entity_id": entity_id,
                    "friendly_name": friendly_name,
                    "domain": domain,
                    "state": state.state
                })
                
                if len(results) >= limit:
                    break
        
        # Search devices if we have room for more results
        if len(results) < limit:
            for device_id, device in self._device_registry.devices.items():
                device_name = device.name_by_user or device.name or "Unknown Device"
                
                if query_lower in device_name.lower():
                    results.append({
                        "entity_id": f"device:{device_id}",
                        "friendly_name": f"Device: {device_name}",
                        "domain": "device",
                        "state": "connected" if device.disabled_by is None else "disabled"
                    })
                    
                    if len(results) >= limit:
                        break
        
        # Search areas if we have room for more results  
        if len(results) < limit:
            for area_id, area in self._area_registry.areas.items():
                if query_lower in area.name.lower():
                    results.append({
                        "entity_id": f"area:{area_id}",
                        "friendly_name": f"Area: {area.name}",
                        "domain": "area", 
                        "state": "active"
                    })
                    
                    if len(results) >= limit:
                        break
        
        # Search zones if we have room for more results
        if len(results) < limit:
            zone_entities = [
                eid for eid in self.hass.states.async_entity_ids() 
                if eid.startswith("zone.")
            ]
            
            for zone_id in zone_entities:
                zone_state = self.hass.states.get(zone_id)
                if not zone_state:
                    continue
                    
                zone_name = zone_state.attributes.get("friendly_name", zone_id)
                
                if query_lower in zone_name.lower() or query_lower in zone_id.lower():
                    results.append({
                        "entity_id": zone_id,
                        "friendly_name": f"Zone: {zone_name}",
                        "domain": "zone",
                        "state": zone_state.state
                    })
                    
                    if len(results) >= limit:
                        break
        
        # Search labels if we have room for more results
        if len(results) < limit:
            for label_entry in self._label_registry.async_list_labels():
                if query_lower in label_entry.name.lower():
                    # Count items with this label
                    entity_count = len(self._get_entities_for_label(label_entry.label_id))
                    device_count = len(self._get_devices_for_label(label_entry.label_id))
                    area_count = len(self._get_areas_for_label(label_entry.label_id))
                    total_count = entity_count + device_count + area_count
                    
                    results.append({
                        "entity_id": f"label:{label_entry.label_id}",
                        "friendly_name": f"Label: {label_entry.name}",
                        "domain": "label",
                        "state": f"{total_count} items"
                    })
                    
                    if len(results) >= limit:
                        break
        
        return results

    async def get_filtered_neighborhood(
        self, 
        entity_id: str, 
        max_depth: int = 3,
        domain_filter: List[str] = None,
        area_filter: List[str] = None,
        relationship_filter: List[str] = None
    ) -> Dict[str, Any]:
        """Get filtered neighborhood graph for a specific entity, device, area, or zone."""
        
        try:
            # Handle device nodes
            if entity_id.startswith("device:"):
                device_id = entity_id.replace("device:", "")
                device = self._device_registry.async_get(device_id)
                if not device:
                    raise ValueError(f"Device {device_id} not found")
            # Handle area nodes
            elif entity_id.startswith("area:"):
                area_id = entity_id.replace("area:", "")
                area = self._area_registry.async_get_area(area_id)
                if not area:
                    raise ValueError(f"Area {area_id} not found")
            # Handle zone nodes
            elif entity_id.startswith("zone."):
                zone_state = self.hass.states.get(entity_id)
                if not zone_state:
                    raise ValueError(f"Zone {entity_id} not found")
            # Handle label nodes
            elif entity_id.startswith("label:"):
                label_id = entity_id.replace("label:", "")
                label_entry = self._label_registry.async_get_label(label_id)
                if not label_entry:
                    raise ValueError(f"Label {label_id} not found")
            # Handle regular entities
            elif entity_id not in self.hass.states.async_entity_ids():
                raise ValueError(f"Entity {entity_id} not found")

            nodes = {}
            edges = []
            visited = set()
            edge_set = set()  # Track edges to prevent duplicates
            filtered_count = 0
            
            # Start with the target entity
            await self._add_entity_and_neighbors_filtered(
                entity_id, nodes, edges, visited, edge_set, max_depth,
                domain_filter, area_filter, relationship_filter, filtered_count
            )
            
            # Validate results before returning
            if nodes is None:
                _LOGGER.error(f"Filtered graph building resulted in None nodes for {entity_id}")
                nodes = {}
            if edges is None:
                _LOGGER.error(f"Filtered graph building resulted in None edges for {entity_id}")
                edges = []
            
            nodes_list = list(nodes.values()) if isinstance(nodes, dict) else []
            edges_list = edges if isinstance(edges, list) else []
            
            return {
                "nodes": nodes_list,
                "edges": edges_list,
                "center_node": entity_id,
                "filtered_count": filtered_count
            }
            
        except Exception as e:
            _LOGGER.error(f"Error building filtered neighborhood graph for {entity_id}: {e}", exc_info=True)
            # Return safe empty result on any error
            return {
                "nodes": [],
                "edges": [],
                "center_node": entity_id,
                "filtered_count": 0
            }

    async def get_graph_statistics(self) -> Dict[str, Any]:
        """Get overall graph statistics."""
        entity_ids = self.hass.states.async_entity_ids()
        total_entities = len(entity_ids)
        
        # Count by domain
        domain_counts = {}
        area_counts = {}
        device_counts = {}
        
        for entity_id in entity_ids:
            domain = entity_id.split(".")[0]
            domain_counts[domain] = domain_counts.get(domain, 0) + 1
            
            entity_entry = self._entity_registry.async_get(entity_id)
            if entity_entry:
                # Count by area
                area_id = entity_entry.area_id
                if not area_id and entity_entry.device_id:
                    device = self._device_registry.async_get(entity_entry.device_id)
                    if device:
                        area_id = device.area_id
                
                if area_id:
                    area = self._area_registry.async_get_area(area_id)
                    area_name = area.name if area else "Unknown"
                    area_counts[area_name] = area_counts.get(area_name, 0) + 1
                
                # Count by device
                if entity_entry.device_id:
                    device = self._device_registry.async_get(entity_entry.device_id)
                    device_name = device.name_by_user or device.name if device else "Unknown"
                    device_counts[device_name] = device_counts.get(device_name, 0) + 1
        
        return {
            "total_entities": total_entities,
            "domain_counts": domain_counts,
            "area_counts": area_counts,
            "device_counts": device_counts,
            "total_areas": len(area_counts),
            "total_devices": len(device_counts),
            "total_domains": len(domain_counts)
        }

    async def _add_entity_and_neighbors_filtered(
        self, 
        entity_id: str, 
        nodes: Dict[str, GraphNode], 
        edges: List[GraphEdge], 
        visited: Set[str], 
        edge_set: Set[str],
        depth: int,
        domain_filter: List[str] = None,
        area_filter: List[str] = None, 
        relationship_filter: List[str] = None,
        filtered_count: int = 0
    ) -> int:
        """Recursively add entity and its neighbors with filtering."""
        if depth < 0:
            return filtered_count
            
        # Always try to add the entity as a node if it passes filters (even if already visited for neighbor exploration)
        if entity_id not in nodes:
            node = await self._create_node(entity_id)
            if node and self._passes_filters(node, domain_filter, area_filter):
                nodes[entity_id] = node
            elif node:  # Node exists but filtered out
                filtered_count += 1
            
        # Only explore neighbors if we haven't visited this entity yet and depth allows
        if entity_id in visited or depth <= 0:
            return filtered_count
            
        visited.add(entity_id)
        
        # Find and add related entities
        related_entities = await self._find_related_entities(entity_id)
        
        for related_id, relationship_type in related_entities:
            # Apply relationship filter
            if relationship_filter and not any(
                rel_filter in relationship_type for rel_filter in relationship_filter
            ):
                filtered_count += 1
                continue
                
            # Create edge between current entity and related entity
            edge = self._create_symmetrical_edge(entity_id, related_id, relationship_type)
            if edge:
                # Create unique edge identifier for deduplication
                edge_key = f"{edge.from_node}:{edge.to_node}:{edge.relationship_type}"
                if edge_key not in edge_set:
                    edges.append(edge)
                    edge_set.add(edge_key)
            
            # Recursively add neighbor (this will add the node even if depth-1 is 0)
            filtered_count = await self._add_entity_and_neighbors_filtered(
                related_id, nodes, edges, visited, edge_set, depth - 1,
                domain_filter, area_filter, relationship_filter, filtered_count
            )
            
        return filtered_count

    def _passes_filters(
        self, 
        node: GraphNode, 
        domain_filter: List[str] = None, 
        area_filter: List[str] = None
    ) -> bool:
        """Check if a node passes the specified filters."""
        if domain_filter and node.domain not in domain_filter:
            return False
            
        if area_filter and node.area and node.area not in area_filter:
            return False
            
        return True

    async def _add_entity_and_neighbors_with_distance(
        self, 
        entity_id: str, 
        nodes: Dict[str, GraphNode], 
        edges: List[GraphEdge], 
        distances: Dict[str, int],
        edge_set: Set[str],
        max_depth: int,
        current_distance: int,
        show_areas: bool = True
    ) -> None:
        """Recursively add entity and its neighbors using distance-based traversal."""
        # Skip if we're beyond max depth
        if current_distance > max_depth:
            return
            
        # Always add the entity as a node
        if entity_id not in nodes:
            node = await self._create_node(entity_id)
            if node:
                nodes[entity_id] = node
        
        # Update distance if we found a shorter path, or if this is the first time we see this entity
        if entity_id not in distances or current_distance < distances[entity_id]:
            distances[entity_id] = current_distance
        else:
            # We've already processed this entity from a shorter or equal distance, skip neighbor exploration
            return
        
        # Don't explore neighbors if we're at max depth
        if current_distance >= max_depth:
            return
        
        # Find and add related entities
        related_entities = await self._find_related_entities(entity_id)
        
        for related_id, relationship_type in related_entities:
            # Filter out area-related entities if show_areas is False
            if not show_areas:
                if (related_id.startswith("area:") or 
                    relationship_type in ["area_contains", "area_contains_device", "device_in_area"]):
                    continue
                    
            # Create edge between current entity and related entity
            edge = self._create_symmetrical_edge(entity_id, related_id, relationship_type)
            if edge:
                # Create unique edge identifier for deduplication
                edge_key = f"{edge.from_node}:{edge.to_node}:{edge.relationship_type}"
                if edge_key not in edge_set:
                    edges.append(edge)
                    edge_set.add(edge_key)
            
            # Recursively add neighbor with increased distance
            await self._add_entity_and_neighbors_with_distance(
                related_id, nodes, edges, distances, edge_set, max_depth, current_distance + 1, show_areas
            )
    
    async def _add_entity_and_neighbors(
        self, 
        entity_id: str, 
        nodes: Dict[str, GraphNode], 
        edges: List[GraphEdge], 
        visited: Set[str], 
        edge_set: Set[str],
        depth: int
    ) -> None:
        """Recursively add entity and its neighbors to the graph (legacy method for filtered version)."""
        if depth < 0:
            return
            
        # Always add the entity as a node (even if already visited for neighbor exploration)
        if entity_id not in nodes:
            node = await self._create_node(entity_id)
            if node:
                nodes[entity_id] = node
        
        # Only explore neighbors if we haven't visited this entity yet and depth allows
        if entity_id in visited or depth <= 0:
            return
            
        visited.add(entity_id)
        
        # Find and add related entities
        related_entities = await self._find_related_entities(entity_id)
        
        for related_id, relationship_type in related_entities:
            # Create edge between current entity and related entity
            edge = self._create_symmetrical_edge(entity_id, related_id, relationship_type)
            if edge:
                # Create unique edge identifier for deduplication
                edge_key = f"{edge.from_node}:{edge.to_node}:{edge.relationship_type}"
                if edge_key not in edge_set:
                    edges.append(edge)
                    edge_set.add(edge_key)
            
            # Recursively add neighbor (this will add the node even if depth-1 is 0)
            await self._add_entity_and_neighbors(
                related_id, nodes, edges, visited, edge_set, depth - 1
            )
    
    def _create_symmetrical_edge(self, node_a: str, node_b: str, relationship_type: str) -> GraphEdge | None:
        """Create a symmetrical edge with consistent direction regardless of discovery order.
        
        Edge directions are determined by node types and relationship semantics, not by which
        node was discovered first. This ensures symmetrical navigation.
        """
        
        
        # Determine canonical direction based on node types and relationship semantics
        # Priority hierarchy: area > device > entity > automation > zone
        
        def get_node_priority(node_id: str) -> int:
            """Get priority for canonical edge ordering."""
            if node_id.startswith("label:"):
                return 0  # Highest priority - labels label everything
            elif node_id.startswith("area:"):
                return 1  # Areas contain everything
            elif node_id.startswith("device:"):
                return 2  # Devices contain entities
            elif node_id.startswith("zone."):
                return 3  # Zones contain entities
            elif node_id.startswith("automation."):
                return 4  # Automations have specific trigger/control semantics
            elif node_id.startswith("script."):
                return 4  # Scripts have specific trigger/control semantics (same as automations)
            elif node_id.startswith("scene."):
                return 4  # Scenes have specific control semantics (same as automations/scripts)
            else:
                return 5  # Regular entities
        
        # Standard containment and labelling relationships - always container/label -> contained/labelled
        if relationship_type in ["has_entity", "device_has", "area_contains", "area_contains_device", 
                                "device_in_area", "zone_contains", "in_zone", "labelled"]:
            
            priority_a = get_node_priority(node_a)
            priority_b = get_node_priority(node_b)
            
            # Container (lower priority number) -> Contained (higher priority number)
            if priority_a < priority_b:
                from_node, to_node = node_a, node_b
            else:
                from_node, to_node = node_b, node_a
                
            # Determine label based on container type
            if from_node.startswith("label:"):
                label = "labelled"
            elif from_node.startswith("area:"):
                label = "contains"
            elif from_node.startswith("device:"):
                label = "has entity"
            elif from_node.startswith("zone."):
                label = "contains"
            else:
                label = "contains"
                
        # Automation relationships have specific semantics
        elif relationship_type == "automation_trigger":
            # Entity -> Automation (Entity triggers Automation)
            if node_a.startswith("automation."):
                from_node, to_node = node_b, node_a  # entity -> automation
            else:
                from_node, to_node = node_a, node_b  # entity -> automation
            label = "triggers"
            
        elif relationship_type == "automation_action":
            # Automation -> Entity (Automation controls Entity)
            if node_a.startswith("automation."):
                from_node, to_node = node_a, node_b  # automation -> entity
            else:
                from_node, to_node = node_b, node_a  # automation -> entity
            label = "controls"
            
        elif relationship_type == "automation_condition":
            # Entity -> Automation (Entity is used in Automation condition)
            if node_a.startswith("automation."):
                from_node, to_node = node_b, node_a  # entity -> automation
            else:
                from_node, to_node = node_a, node_b  # entity -> automation
            label = "conditions"
            
        # Script relationships have same semantics as automations
        elif relationship_type == "script_trigger":
            # Entity -> Script (Entity triggers Script)
            if node_a.startswith("script."):
                from_node, to_node = node_b, node_a  # entity -> script
            else:
                from_node, to_node = node_a, node_b  # entity -> script
            label = "triggers"
            
        elif relationship_type == "script_action":
            # Script -> Entity (Script controls Entity)
            if node_a.startswith("script."):
                from_node, to_node = node_a, node_b  # script -> entity
            else:
                from_node, to_node = node_b, node_a  # script -> entity
            label = "controls"
            
        elif relationship_type == "script_condition":
            # Entity -> Script (Entity is used in Script condition)
            if node_a.startswith("script."):
                from_node, to_node = node_b, node_a  # entity -> script
            else:
                from_node, to_node = node_a, node_b  # entity -> script
            label = "conditions"
            
        elif relationship_type.startswith("template:"):
            # Template -> Entity (Template uses Entity)
            # For now, assume template relationships point from template to entity
            from_node, to_node = node_a, node_b
            label = "uses"
            
        elif relationship_type == "template_uses":
            # Template -> Entity (Template uses Entity in its template)
            if node_a.startswith("switch.") or node_a.startswith("sensor.") or node_a.startswith("binary_sensor."):
                from_node, to_node = node_a, node_b  # template -> entity it uses
            else:
                from_node, to_node = node_b, node_a  # template -> entity it uses
            label = "uses"
            
        elif relationship_type == "template_depends":
            # Entity -> Template (Template depends on Entity)
            if node_a.startswith("switch.") or node_a.startswith("sensor.") or node_a.startswith("binary_sensor."):
                from_node, to_node = node_b, node_a  # entity -> template that depends on it
            else:
                from_node, to_node = node_a, node_b  # entity -> template that depends on it
            label = "depends on"
            
        elif relationship_type == "alert_monitors":
            # Alert -> Entity (Alert monitors Entity)
            if node_a.startswith("alert."):
                from_node, to_node = node_a, node_b  # alert -> entity it monitors
            else:
                from_node, to_node = node_b, node_a  # alert -> entity it monitors
            label = "monitors"
            
        elif relationship_type == "alert_depends":
            # Entity -> Alert (Alert depends on Entity)
            if node_a.startswith("alert."):
                from_node, to_node = node_b, node_a  # entity -> alert that depends on it
            else:
                from_node, to_node = node_a, node_b  # entity -> alert that depends on it
            label = "alerts"
            
        elif relationship_type == "scene_controls":
            # Scene -> Entity (Scene controls Entity state)
            if node_a.startswith("scene."):
                from_node, to_node = node_a, node_b  # scene -> entity it controls
            else:
                from_node, to_node = node_b, node_a  # scene -> entity it controls
            label = "controls"
            
        elif relationship_type == "labelled":
            # Label -> Object (Label labels Object)
            if node_a.startswith("label:"):
                from_node, to_node = node_a, node_b  # label -> object
            else:
                from_node, to_node = node_b, node_a  # label -> object
            label = "labelled"
            
        elif relationship_type == "group_contains":
            # Group -> Entity (Group contains Entity)
            # Determine which is the group and which is the entity
            if (node_a.startswith("group.") or 
                node_a.startswith("light.") or 
                node_a.startswith("switch.") or 
                node_a.startswith("cover.") or 
                node_a.startswith("fan.") or 
                node_a.startswith("media_player.") or 
                node_a.startswith("climate.") or 
                node_a.startswith("scene.")):
                # Check if node_a is actually a group by seeing if it has group-like attributes
                # For now, assume the first node in group domains is the group
                from_node, to_node = node_a, node_b  # group -> entity
            else:
                from_node, to_node = node_b, node_a  # group -> entity
            # Different label for scenes vs groups
            if from_node.startswith("scene."):
                label = "controls"
            else:
                label = "contains"
            
        elif relationship_type == "group_contains_reverse":
            # Entity -> Group relationship, but we want Group -> Entity direction
            # Always reverse the direction for this relationship type
            if (node_b.startswith("group.") or 
                node_b.startswith("light.") or 
                node_b.startswith("switch.") or 
                node_b.startswith("cover.") or 
                node_b.startswith("fan.") or 
                node_b.startswith("media_player.") or 
                node_b.startswith("climate.") or 
                node_b.startswith("scene.")):
                from_node, to_node = node_b, node_a  # group -> entity
            else:
                from_node, to_node = node_a, node_b  # group -> entity
            # Different label for scenes vs groups
            if from_node.startswith("scene."):
                label = "controls"
            else:
                label = "contains"
            
        elif relationship_type == "helper_converts":
            # Helper -> Original (Helper converts/proxies Original entity)
            # The helper entity points to what it's converting/representing
            from_node, to_node = node_a, node_b  # helper -> original
            label = "converts"
            
        else:
            # Default: use node priority to determine direction
            priority_a = get_node_priority(node_a)
            priority_b = get_node_priority(node_b)
            
            if priority_a <= priority_b:
                from_node, to_node = node_a, node_b
            else:
                from_node, to_node = node_b, node_a
                
            label = relationship_type.replace("_", " ")
        
        return GraphEdge(
            from_node=from_node,
            to_node=to_node,
            relationship_type=relationship_type,
            label=label
        )

    async def _create_node(self, entity_id: str) -> GraphNode | None:
        """Create a graph node for an entity or device."""
        
        # Handle device nodes
        if entity_id.startswith("device:"):
            device_id = entity_id.replace("device:", "")
            device = self._device_registry.async_get(device_id)
            if not device:
                return None
                
            device_name = device.name_by_user or device.name or "Unknown Device"
            area_name = None
            
            # Get area name for device
            if device.area_id:
                area = self._area_registry.async_get_area(device.area_id)
                area_name = area.name if area else None
                
            return GraphNode(
                id=entity_id,
                label=device_name,
                domain="device",
                area=area_name,
                device_id=device_id,
                state="connected" if device.disabled_by is None else "disabled",
                icon="mdi:devices"
            )
        
        # Handle area nodes
        if entity_id.startswith("area:"):
            area_id = entity_id.replace("area:", "")
            area = self._area_registry.async_get_area(area_id)
            if not area:
                return None
                
            return GraphNode(
                id=entity_id,
                label=area.name,
                domain="area",
                area=area.name,
                device_id=None,
                state="active",
                icon="mdi:home-map-marker"
            )
        
        # Handle zone nodes
        if entity_id.startswith("zone."):
            zone_state = self.hass.states.get(entity_id)
            if not zone_state:
                return None
                
            zone_name = zone_state.attributes.get("friendly_name", entity_id)
            return GraphNode(
                id=entity_id,
                label=zone_name,
                domain="zone",
                area=None,
                device_id=None,
                state=zone_state.state,
                icon=zone_state.attributes.get("icon", "mdi:map-marker")
            )
        
        # Handle label nodes
        if entity_id.startswith("label:"):
            label_id = entity_id.replace("label:", "")
            label_entry = self._label_registry.async_get_label(label_id)
            if not label_entry:
                return None
                
            # Count how many entities/devices/areas have this label
            entity_count = len(self._get_entities_for_label(label_id))
            device_count = len(self._get_devices_for_label(label_id))
            area_count = len(self._get_areas_for_label(label_id))
            total_count = entity_count + device_count + area_count
            
            state_info = f"{total_count} items"
            if entity_count > 0:
                state_info += f" ({entity_count} entities"
                if device_count > 0:
                    state_info += f", {device_count} devices"
                if area_count > 0:
                    state_info += f", {area_count} areas"
                state_info += ")"
            
            return GraphNode(
                id=entity_id,
                label=label_entry.name,
                domain="label",
                area=None,
                device_id=None,
                state=state_info,
                icon="mdi:tag"
            )
        
        # Handle regular entity nodes
        state = self.hass.states.get(entity_id)
        if not state:
            return None
            
        entity_entry = self._entity_registry.async_get(entity_id)
        area_name = None
        device_id = None
        
        if entity_entry:
            device_id = entity_entry.device_id
            area_id = entity_entry.area_id
            
            # Get area name
            if area_id:
                area = self._area_registry.async_get_area(area_id)
                area_name = area.name if area else None
            
            # If no direct area, try to get it from device
            elif device_id:
                device = self._device_registry.async_get(device_id)
                if device and device.area_id:
                    area = self._area_registry.async_get_area(device.area_id)
                    area_name = area.name if area else None
        
        # Extract icon from entity state attributes, with domain-based fallback
        entity_icon = state.attributes.get("icon")
        if not entity_icon:
            entity_icon = self._get_domain_fallback_icon(entity_id.split(".")[0])
        
        return GraphNode(
            id=entity_id,
            label=state.attributes.get("friendly_name", entity_id),
            domain=entity_id.split(".")[0],
            area=area_name,
            device_id=device_id,
            state=state.state,
            icon=entity_icon
        )

    def _get_domain_fallback_icon(self, domain: str) -> str:
        """Get fallback MDI icon for entity domain."""
        domain_icons = {
            'light': 'mdi:lightbulb',
            'switch': 'mdi:toggle-switch',
            'sensor': 'mdi:gauge',
            'binary_sensor': 'mdi:radiobox-marked',
            'climate': 'mdi:thermostat',
            'cover': 'mdi:window-shutter',
            'fan': 'mdi:fan',
            'lock': 'mdi:lock',
            'media_player': 'mdi:speaker',
            'camera': 'mdi:camera',
            'automation': 'mdi:robot',
            'script': 'mdi:script-text',
            'scene': 'mdi:palette',
            'input_boolean': 'mdi:toggle-switch-off',
            'input_number': 'mdi:numeric',
            'input_select': 'mdi:format-list-bulleted',
            'input_text': 'mdi:form-textbox',
            'timer': 'mdi:timer',
            'counter': 'mdi:counter',
            'person': 'mdi:account',
            'device_tracker': 'mdi:map-marker',
            'zone': 'mdi:map-marker-radius',
            'sun': 'mdi:weather-sunny',
            'weather': 'mdi:weather-cloudy',
            'calendar': 'mdi:calendar',
            'alarm_control_panel': 'mdi:shield-home',
            'vacuum': 'mdi:robot-vacuum',
            'water_heater': 'mdi:water-boiler',
            'humidifier': 'mdi:air-humidifier',
            'air_quality': 'mdi:air-filter',
            'plant': 'mdi:flower',
            'remote': 'mdi:remote',
            'button': 'mdi:gesture-tap-button',
            'siren': 'mdi:bullhorn',
            'number': 'mdi:ray-vertex',
            'select': 'mdi:format-list-checks',
            'text': 'mdi:form-textbox',
            'date': 'mdi:calendar-blank',
            'time': 'mdi:clock-outline',
            'datetime': 'mdi:calendar-clock',
            'image': 'mdi:image',
            'tts': 'mdi:speaker-message',
            'stt': 'mdi:microphone-message',
            'conversation': 'mdi:message-processing',
            'notify': 'mdi:bell-ring',
            'persistent_notification': 'mdi:bell-alert',
            'group': 'mdi:group',
            'homeassistant': 'mdi:home-assistant',
            'update': 'mdi:package-up',
            'todo': 'mdi:clipboard-list',
            'lawn_mower': 'mdi:robot-mower',
            'valve': 'mdi:valve',
            'event': 'mdi:calendar-star'
        }
        return domain_icons.get(domain, 'mdi:help-circle')


    async def _find_related_entities(self, entity_id: str) -> List[tuple[str, str]]:
        """Find entities related to the given entity."""
        related = []
        
        # Handle device node relationships - show all entities on the device
        if entity_id.startswith("device:"):
            device_id = entity_id.replace("device:", "")
            
            device_entities = entity_registry.async_entries_for_device(
                self._entity_registry, device_id
            )
            
            for entity_entry in device_entities:
                # Device contains entity: return entity with device_has relationship
                related.append((entity_entry.entity_id, "device_has"))
            
            # Also find the area that contains this device
            device = self._device_registry.async_get(device_id)
            if device and device.area_id:
                area = self._area_registry.async_get_area(device.area_id)
                area_name = area.name if area else "Unknown Area"
                area_node_id = f"area:{device.area_id}"
                # Area contains device: return area with device_in_area relationship
                related.append((area_node_id, "device_in_area"))
            
            # Add label relationships for device
            device = self._device_registry.async_get(device_id)
            if device and device.labels:
                for label_id in device.labels:
                    label_entry = self._label_registry.async_get_label(label_id)
                    if label_entry:
                        label_node_id = f"label:{label_id}"
                        related.append((label_node_id, "labelled"))
            
            # IMPORTANT: Also check for automation relationships for device nodes
            # This was missing and caused the bidirectional relationship bug
            automation_related = await self._find_automation_relationships(entity_id)
            related.extend(automation_related)
            
            return related
        
        # Handle area node relationships - show all entities in the area
        if entity_id.startswith("area:"):
            area_id = entity_id.replace("area:", "")
            
            # Find entities directly assigned to the area
            area_entities = entity_registry.async_entries_for_area(
                self._entity_registry, area_id
            )
            
            for entity_entry in area_entities:
                # Area contains entity: return entity with area_contains relationship
                related.append((entity_entry.entity_id, "area_contains"))
            
            # Also find entities on devices that are in this area
            devices_in_area = [
                device for device in self._device_registry.devices.values()
                if device.area_id == area_id
            ]
            
            for device in devices_in_area:
                # Add the device itself as a node that the area contains
                device_node_id = f"device:{device.id}"
                related.append((device_node_id, "area_contains_device"))
                
                # Also add entities on devices in this area (for completeness)
                device_entities = entity_registry.async_entries_for_device(
                    self._entity_registry, device.id
                )
                for entity_entry in device_entities:
                    # Area contains entity (via device): return entity with area_contains relationship
                    related.append((entity_entry.entity_id, "area_contains"))
            
            # Add label relationships for area
            area = self._area_registry.async_get_area(area_id)
            if area and area.labels:
                for label_id in area.labels:
                    label_entry = self._label_registry.async_get_label(label_id)
                    if label_entry:
                        label_node_id = f"label:{label_id}"
                        related.append((label_node_id, "labelled"))
            
            # Also check for automation relationships for area nodes
            automation_related = await self._find_automation_relationships(entity_id)
            related.extend(automation_related)
            
            return related
        
        # Handle zone node relationships - show all entities in the zone
        if entity_id.startswith("zone."):
            # Find all entities that have location and are in this zone
            zone_state = self.hass.states.get(entity_id)
            if not zone_state:
                return related
                
            zone_lat = zone_state.attributes.get(ATTR_LATITUDE)
            zone_lon = zone_state.attributes.get(ATTR_LONGITUDE)
            zone_radius = zone_state.attributes.get("radius", 100)
            
            if zone_lat is None or zone_lon is None:
                return related
                
            # Check all entities for location
            for test_entity_id in self.hass.states.async_entity_ids():
                # Skip self-references (zone can't contain itself)
                if test_entity_id == entity_id:
                    continue
                    
                test_state = self.hass.states.get(test_entity_id)
                if not test_state:
                    continue
                    
                entity_lat = test_state.attributes.get(ATTR_LATITUDE)
                entity_lon = test_state.attributes.get(ATTR_LONGITUDE)
                
                if entity_lat is not None and entity_lon is not None:
                    distance = self._calculate_distance(entity_lat, entity_lon, zone_lat, zone_lon)
                    if distance <= zone_radius:
                        # Zone contains entity: return entity with zone_contains relationship
                        related.append((test_entity_id, "zone_contains"))
            
            # Also check for automation relationships for zone nodes
            automation_related = await self._find_automation_relationships(entity_id)
            related.extend(automation_related)
            
            return related
        
        # Handle group node relationships - show all entities in the group
        # This includes traditional groups and domain-specific groups
        group_domains = ["group", "light", "switch", "cover", "fan", "media_player", "climate"]
        entity_domain = entity_id.split('.')[0]
        
        if entity_domain in group_domains:
            
            group_state = self.hass.states.get(entity_id)
            if group_state:
                member_entities = []
                
                # Traditional groups use 'entity_id' attribute
                if entity_id.startswith("group."):
                    member_entities = group_state.attributes.get("entity_id", [])
                
                # Light groups
                elif entity_id.startswith("light."):
                    # Standard entity_id attribute
                    light_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(light_entities)
                    
                    # Alternative attributes that group helpers might use
                    lights_attr = group_state.attributes.get("lights", [])
                    member_entities.extend(lights_attr)
                    
                    # Some light groups might use different attributes
                    group_members = group_state.attributes.get("group_members", [])
                    member_entities.extend(group_members)
                    
                    # Light helper-specific attributes
                    light_list = group_state.attributes.get("light_list", [])
                    member_entities.extend(light_list)
                    
                    # Debug logging for empty light groups
                    all_attrs = group_state.attributes
                    if not member_entities and all_attrs:
                        _LOGGER.debug(f"Light group {entity_id} has no members found. All attributes: {list(all_attrs.keys())}")
                        # Check for any attribute that might contain entity IDs
                        for attr_name, attr_value in all_attrs.items():
                            if isinstance(attr_value, list) and attr_value:
                                # Look for attributes that contain entity-like strings
                                if any(isinstance(item, str) and '.' in item for item in attr_value):
                                    _LOGGER.debug(f"Potential entity list found in attribute '{attr_name}': {attr_value}")
                                    member_entities.extend([item for item in attr_value if isinstance(item, str) and '.' in item])
                
                # Switch groups
                elif entity_id.startswith("switch."):
                    switch_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(switch_entities)
                    switches_attr = group_state.attributes.get("switches", [])
                    member_entities.extend(switches_attr)
                    
                    # Additional switch group attributes
                    group_members = group_state.attributes.get("group_members", [])
                    member_entities.extend(group_members)
                    
                    # Debug logging for empty switch groups
                    if not member_entities:
                        all_attrs = group_state.attributes
                        _LOGGER.debug(f"Switch group {entity_id} has no members found. All attributes: {list(all_attrs.keys())}")
                        # Check for any attribute that might contain entity IDs
                        for attr_name, attr_value in all_attrs.items():
                            if isinstance(attr_value, list) and attr_value:
                                if any(isinstance(item, str) and '.' in item for item in attr_value):
                                    _LOGGER.debug(f"Potential entity list found in attribute '{attr_name}': {attr_value}")
                                    member_entities.extend([item for item in attr_value if isinstance(item, str) and '.' in item])
                
                # Cover groups
                elif entity_id.startswith("cover."):
                    cover_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(cover_entities)
                    covers_attr = group_state.attributes.get("covers", [])
                    member_entities.extend(covers_attr)
                
                # Fan groups
                elif entity_id.startswith("fan."):
                    fan_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(fan_entities)
                    fans_attr = group_state.attributes.get("fans", [])
                    member_entities.extend(fans_attr)
                
                # Media player groups
                elif entity_id.startswith("media_player."):
                    media_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(media_entities)
                    players_attr = group_state.attributes.get("group_members", [])
                    member_entities.extend(players_attr)
                
                # Climate groups
                elif entity_id.startswith("climate."):
                    climate_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(climate_entities)
                
                # Scene groups
                elif entity_id.startswith("scene."):
                    # Use the helper method to extract entities from scene config
                    scene_entities = self._extract_entities_from_scene_config(
                        group_state.attributes.get("configuration", {})
                    )
                    member_entities.extend(scene_entities)
                    
                    # Also check for entities stored directly in attributes
                    entities_in_scene = group_state.attributes.get("entities", {})
                    if entities_in_scene:
                        member_entities.extend([
                            eid for eid in entities_in_scene.keys() 
                            if self._is_valid_entity_id(eid)
                        ])
                
                # Remove duplicates
                member_entities = list(set(member_entities))
                
                for member_entity_id in member_entities:
                    # Group contains entity: return entity with group_contains relationship
                    related.append((member_entity_id, "group_contains"))
            
            # Don't return early - continue to check other relationship types
            # including reverse group relationships
        
        # Handle label node relationships - show all entities/devices/areas with this label
        if entity_id.startswith("label:"):
            label_id = entity_id.replace("label:", "")
            
            label_entry = self._label_registry.async_get_label(label_id)
            if label_entry:
                # Find all entities with this label
                label_entities = self._get_entities_for_label(label_id)
                for entity_entry in label_entities:
                    # Label labels entity: return entity with labelled relationship
                    related.append((entity_entry.entity_id, "labelled"))
                
                # Find all devices with this label
                label_devices = self._get_devices_for_label(label_id)
                for device in label_devices:
                    device_node_id = f"device:{device.id}"
                    # Label labels device: return device with labelled relationship
                    related.append((device_node_id, "labelled"))
                
                # Find all areas with this label
                label_areas = self._get_areas_for_label(label_id)
                for area in label_areas:
                    area_node_id = f"area:{area.id}"
                    # Label labels area: return area with labelled relationship
                    related.append((area_node_id, "labelled"))
            
            # Also check for automation relationships for label nodes
            automation_related = await self._find_automation_relationships(entity_id)
            related.extend(automation_related)
            
            return related
        
        # Handle scene node relationships - show all entities controlled by the scene
        if entity_id.startswith("scene."):
            
            scene_state = self.hass.states.get(entity_id)
            if scene_state:
                # Find all entities controlled by this scene
                scene_related = await self._find_scene_referenced_entities(entity_id)
                related.extend(scene_related)
            
            # Also check for automation relationships for scene nodes
            automation_related = await self._find_automation_relationships(entity_id)
            related.extend(automation_related)
            
            return related
        
        # Automation-based relationships (do this for ALL entities, including automations)
        automation_related = await self._find_automation_relationships(entity_id)
        related.extend(automation_related)
        
        # Script-based relationships (do this for ALL entities, including scripts)
        script_related = await self._find_script_relationships(entity_id)
        related.extend(script_related)
        
        # Alert-based relationships (do this for ALL entities, including alerts)
        alert_related = await self._find_alert_relationships(entity_id)
        related.extend(alert_related)
        
        # Scene-based relationships (do this for ALL entities, including scenes)
        scene_related = await self._find_scene_relationships(entity_id)
        related.extend(scene_related)
        
        # Helper/Proxy relationships (change type, input helpers, etc.)
        helper_related = await self._find_helper_relationships(entity_id)
        related.extend(helper_related)
        
        # Handle regular entity relationships
        entity_entry = self._entity_registry.async_get(entity_id)
        
        if entity_entry:
            # Device-based relationships
            device_related = await self._find_device_relationships(entity_entry)
            related.extend(device_related)
            
            # Area-based relationships (exclude entities already found via device)
            area_related = await self._find_area_relationships(entity_entry, device_related)
            related.extend(area_related)
            
            # Zone-based relationships
            zone_related = await self._find_zone_relationships(entity_id)
            related.extend(zone_related)
            
            # Template-based relationships
            template_related = await self._find_template_relationships(entity_id)
            related.extend(template_related)
            
            # Label-based relationships
            label_related = await self._find_label_relationships(entity_entry)
            related.extend(label_related)
            
            # Group-based relationships - find groups that contain this entity
            group_related = await self._find_group_relationships(entity_id)
            related.extend(group_related)
        
        return related

    async def _find_script_relationships(self, entity_id: str) -> List[tuple[str, str]]:
        """Find entities related through script triggers/actions."""
        related = []
        
        
        # If this IS a script, find all entities it references
        if entity_id.startswith("script."):
            
            # First, let's see what we can find about this script
            state = self.hass.states.get(entity_id)
            if state:
                pass  # Script state available
            else:
                pass  # No state available
            
            script_related = await self._find_script_referenced_entities(entity_id)
            related.extend(script_related)
        
        # Scripts don't expose their configuration, but we can find automations that call this script
        # by checking all automations for script service calls
        
        if entity_id.startswith("script."):
            
            # Check all automations to see which ones call this script
            automation_entities = [
                eid for eid in self.hass.states.async_entity_ids() 
                if eid.startswith("automation.")
            ]
            
            for automation_id in automation_entities:
                # Use existing automation relationship detection
                automation_related = await self._find_automation_referenced_entities(automation_id)
                
                # Check if this script is in the automation's referenced entities
                for referenced_entity, relationship_type in automation_related:
                    if referenced_entity == entity_id:
                        # Reverse the relationship: automation -> script becomes script <- automation
                        related.append((automation_id, "script_trigger"))
                        break
        
        return related

    async def _find_script_referenced_entities(self, script_id: str) -> List[tuple[str, str]]:
        """Find all entities referenced by a script."""
        related = []
        
        state = self.hass.states.get(script_id)
        if not state:
            return related
            
        script_config = state.attributes
        
        # Scripts have a "sequence" which contains actions
        sequence = script_config.get("sequence", [])
        
        # If no sequence in attributes, try accessing through script domain
        if not sequence:
            
            # Try to access script configuration through script component
            try:
                # Method 1: Try script component in hass.data
                script_component = self.hass.data.get("script")
                if script_component:
                    script_name = script_id.replace("script.", "")
                    
                    # Try to get the script entity from the component
                    if hasattr(script_component, 'entities'):
                        script_entity = script_component.entities.get(script_id)
                        if script_entity:
                            if hasattr(script_entity, 'sequence'):
                                sequence = script_entity.sequence
                    
                    # Method 2: Try accessing as dict
                    if not sequence and isinstance(script_component, dict):
                        script_entity = script_component.get(script_name)
                        if script_entity:
                            if hasattr(script_entity, 'sequence'):
                                sequence = script_entity.sequence
                
                # Method 3: Try accessing through script domain services
                if not sequence:
                    services = self.hass.services.async_services().get("script", {})
                    
                # Method 4: Check if script config is available through config entries
                if not sequence:
                    for key, value in self.hass.data.items():
                        if "script" in key.lower():
                            _LOGGER.debug(f"Found script-related data key: {key} = {type(value)}")
                
            except Exception as e:
                _LOGGER.debug(f"Error accessing script configuration: {e}")
            
            # If still no sequence, list what we found
            if not sequence:
                _LOGGER.debug(f"Still no sequence found, checking attributes again:")
                for key, value in script_config.items():
                    _LOGGER.debug(f"Script attribute {key}: {type(value)} = {value}")
                return related
        else:
            _LOGGER.debug(f"Found sequence with {len(sequence)} actions")
            
            # Extract entities from actions
            action_entities = self._extract_entities_from_config(sequence)
            for entity_id in action_entities:
                related.append((entity_id, "script_action"))
            
            # Extract entities from conditions (scripts can have conditional actions)
            condition_entities = self._extract_entities_from_conditions(sequence)
            for entity_id in condition_entities:
                related.append((entity_id, "script_condition"))
        
        return related

    async def _find_alert_relationships(self, entity_id: str) -> List[tuple[str, str]]:
        """Find entities related through alert configurations."""
        related = []
        
        _LOGGER.debug(f"Finding alert relationships for: {entity_id}")
        
        # If this IS an alert, find all entities it references
        if entity_id.startswith("alert."):
            _LOGGER.debug(f"Entity is alert, finding referenced entities")
            alert_related = await self._find_alert_referenced_entities(entity_id)
            related.extend(alert_related)
            _LOGGER.debug(f"Found {len(alert_related)} alert-referenced entities: {alert_related}")
        
        # Find alerts that reference this entity
        alert_entities = [
            eid for eid in self.hass.states.async_entity_ids() 
            if eid.startswith("alert.")
        ]
        
        _LOGGER.debug(f"Found {len(alert_entities)} total alerts to check")
        
        for alert_id in alert_entities:
            if alert_id == entity_id:  # Skip self
                continue
                
            state = self.hass.states.get(alert_id)
            if not state:
                _LOGGER.debug(f"No state for alert: {alert_id}")
                continue
                
            # Check alert configuration for entity references
            alert_config = state.attributes
            _LOGGER.debug(f"Checking alert {alert_id} for references to {entity_id}")
            _LOGGER.debug(f"Alert attributes: {list(alert_config.keys())}")
            
            # Check if our entity is referenced as the alert's entity_id
            alert_entity_id = alert_config.get("entity_id")
            if alert_entity_id == entity_id:
                alert_name = state.attributes.get("friendly_name", alert_id)
                related.append((alert_id, "alert_monitors"))
                _LOGGER.debug(f"Found alert relationship: {alert_name} monitors {entity_id}")
        
        _LOGGER.debug(f"Total alert relationships found: {len(related)}")
        return related

    async def _find_alert_referenced_entities(self, alert_id: str) -> List[tuple[str, str]]:
        """Find all entities referenced by a specific alert."""
        related = []
        
        _LOGGER.debug(f"Finding entities referenced by alert: {alert_id}")
        
        state = self.hass.states.get(alert_id)
        if not state:
            _LOGGER.debug(f"No state found for alert: {alert_id}")
            return related
            
        alert_config = state.attributes
        alert_name = state.attributes.get("friendly_name", alert_id)
        _LOGGER.debug(f"Alert name: {alert_name}")
        _LOGGER.debug(f"Alert config keys: {list(alert_config.keys()) if alert_config else 'No config'}")
        
        # Check for entity_id in alert configuration
        alert_entity_id = alert_config.get("entity_id")
        if alert_entity_id:
            _LOGGER.debug(f"Found alert entity_id dependency: {alert_entity_id}")
            related.append((alert_entity_id, "alert_depends"))
        
        _LOGGER.debug(f"Total entities found for {alert_name}: {len(related)}")
        return related

    async def _find_scene_relationships(self, entity_id: str) -> List[tuple[str, str]]:
        """Find scene relationships - scenes control entities."""
        related = []
        
        # Check all scenes to see if they control our entity
        scene_entities = [
            eid for eid in self.hass.states.async_entity_ids() 
            if eid.startswith("scene.")
        ]
        
        for scene_id in scene_entities:
            scene_state = self.hass.states.get(scene_id)
            if not scene_state:
                continue
                
            # Scene entities are stored in the attributes, often under configuration
            scene_config = scene_state.attributes.get("configuration", {})
            
            # Check if the scene configuration contains our entity
            if self._entity_referenced_in_scene_config(entity_id, scene_config):
                scene_name = scene_state.attributes.get("friendly_name", scene_id)
                related.append((scene_id, "scene_controls"))
                _LOGGER.debug(f"Found scene control relationship: {scene_name} controls {entity_id}")
            
            # Also check for scenes that might store entities directly in attributes
            # Some scenes store entity states directly as attributes
            entities_in_scene = scene_state.attributes.get("entities", {})
            if entity_id in entities_in_scene:
                scene_name = scene_state.attributes.get("friendly_name", scene_id)
                related.append((scene_id, "scene_controls"))
                _LOGGER.debug(f"Found scene entity relationship: {scene_name} controls {entity_id}")
        
        return related

    async def _find_scene_referenced_entities(self, scene_id: str) -> List[tuple[str, str]]:
        """Find all entities referenced by a scene."""
        related = []
        _LOGGER.debug(f"Finding entities referenced by scene: {scene_id}")
        
        state = self.hass.states.get(scene_id)
        if not state:
            _LOGGER.debug(f"No state found for scene: {scene_id}")
            return related
            
        scene_config = state.attributes.get("configuration", {})
        scene_name = state.attributes.get("friendly_name", scene_id)
        _LOGGER.debug(f"Scene name: {scene_name}")
        _LOGGER.debug(f"Scene config keys: {list(scene_config.keys()) if scene_config else 'No config'}")
        _LOGGER.debug(f"Scene attributes: {list(state.attributes.keys())}")
        
        # Extract entities from scene configuration
        entities_controlled = self._extract_entities_from_scene_config(scene_config)
        for entity_id in entities_controlled:
            _LOGGER.debug(f"Found scene control: {scene_name} -> {entity_id}")
            related.append((entity_id, "scene_controls"))
        
        # Also check for entities stored directly in attributes
        entities_in_scene = state.attributes.get("entities", {})
        if entities_in_scene:
            _LOGGER.debug(f"Scene has 'entities' attribute with {len(entities_in_scene)} items")
            for entity_id in entities_in_scene:
                if self._is_valid_entity_id(entity_id):
                    _LOGGER.debug(f"Found scene entity: {scene_name} -> {entity_id}")
                    related.append((entity_id, "scene_controls"))
        
        # Check additional attribute formats that might contain entity data
        for attr_name in ["entity_id", "targets", "entity_ids"]:
            if attr_name in state.attributes:
                attr_value = state.attributes[attr_name]
                _LOGGER.debug(f"Scene has '{attr_name}' attribute: {attr_value}")
                if isinstance(attr_value, list):
                    for entity_id in attr_value:
                        if self._is_valid_entity_id(entity_id):
                            _LOGGER.debug(f"Found scene entity from '{attr_name}': {scene_name} -> {entity_id}")
                            related.append((entity_id, "scene_controls"))
        
        # If still no entities found, log all attributes for debugging
        if not related:
            _LOGGER.warning(f"Scene {scene_name} has no entities found. All attributes: {state.attributes}")
        
        _LOGGER.debug(f"Total entities found for {scene_name}: {len(related)}")
        return related

    async def _find_device_relationships(self, entity_entry) -> List[tuple[str, str]]:
        """Find device relationship - device has entity."""
        related = []
        
        if not entity_entry.device_id:
            return related
            
        # Add relationship to the device itself
        device = self._device_registry.async_get(entity_entry.device_id)
        device_name = device.name_by_user or device.name if device else "Unknown Device"
        device_node_id = f"device:{entity_entry.device_id}"
        
        # Create relationship: device -> entity with "has_entity" relationship
        # This will be reversed in the graph to show device -> entity
        related.append((device_node_id, "has_entity"))
        
        return related

    async def _find_area_relationships(self, entity_entry, exclude_list: List[tuple[str, str]]) -> List[tuple[str, str]]:
        """Find area relationship - area has entity."""
        related = []
        
        # Determine the area for this entity
        area_id = entity_entry.area_id
        if not area_id and entity_entry.device_id:
            # Get area from device
            device = self._device_registry.async_get(entity_entry.device_id)
            if device:
                area_id = device.area_id
        
        if not area_id:
            return related
            
        area = self._area_registry.async_get_area(area_id)
        area_name = area.name if area else "Unknown Area"
        area_node_id = f"area:{area_id}"
        
        # Create relationship: area -> entity with "has_entity" relationship
        related.append((area_node_id, "has_entity"))
        
        return related

    async def _find_zone_relationships(self, entity_id: str) -> List[tuple[str, str]]:
        """Find zone relationships - entity in zone."""
        related = []
        
        # Get entity state to check for location
        state = self.hass.states.get(entity_id)
        if not state:
            return related
            
        # Check if entity has location attributes
        latitude = state.attributes.get(ATTR_LATITUDE)
        longitude = state.attributes.get(ATTR_LONGITUDE)
        
        # Debug logging
        if latitude is not None or longitude is not None:
            _LOGGER.debug(f"Entity {entity_id} has location: lat={latitude}, lon={longitude}")
        
        if latitude is None or longitude is None:
            return related
            
        # Check all zone entities to see if this entity is in any zones
        zone_entities = [
            eid for eid in self.hass.states.async_entity_ids() 
            if eid.startswith("zone.")
        ]
        
        _LOGGER.debug(f"Found {len(zone_entities)} zones to check: {zone_entities}")
        
        for zone_id in zone_entities:
            # Skip self-references (zone can't contain itself)
            if zone_id == entity_id:
                continue
                
            zone_state = self.hass.states.get(zone_id)
            if not zone_state:
                continue
                
            zone_lat = zone_state.attributes.get(ATTR_LATITUDE)
            zone_lon = zone_state.attributes.get(ATTR_LONGITUDE)
            zone_radius = zone_state.attributes.get("radius", 100)  # Default 100m radius
            
            if zone_lat is None or zone_lon is None:
                _LOGGER.debug(f"Zone {zone_id} missing coordinates: lat={zone_lat}, lon={zone_lon}")
                continue
                
            # Calculate distance (simple approximation)
            distance = self._calculate_distance(latitude, longitude, zone_lat, zone_lon)
            _LOGGER.debug(f"Entity {entity_id} distance from zone {zone_id}: {distance}m (radius: {zone_radius}m)")
            
            if distance <= zone_radius:
                _LOGGER.info(f"Entity {entity_id} is in zone {zone_id}")
                related.append((zone_id, "in_zone"))
                
        return related
    
    def _calculate_distance(self, entity_lat: float, entity_lon: float, 
                           zone_lat: float, zone_lon: float) -> float:
        """Calculate distance between two coordinates in meters."""
        import math
        
        # Convert to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [entity_lat, entity_lon, zone_lat, zone_lon])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        distance = 6371000 * c  # Earth radius in meters
        
        return distance

    async def _find_automation_relationships(self, entity_id: str) -> List[tuple[str, str]]:
        """Find entities related through automation triggers/actions."""
        related = []
        
        _LOGGER.debug(f"Finding automation relationships for: {entity_id}")
        
        # If this IS an automation, find all entities it references
        if entity_id.startswith("automation."):
            _LOGGER.debug(f"Entity is automation, finding referenced entities")
            automation_related = await self._find_automation_referenced_entities(entity_id)
            related.extend(automation_related)
            _LOGGER.debug(f"Found {len(automation_related)} automation-referenced entities: {automation_related}")
        
        # Find automations that reference this entity
        automation_entities = [
            eid for eid in self.hass.states.async_entity_ids() 
            if eid.startswith("automation.")
        ]
        
        _LOGGER.debug(f"Found {len(automation_entities)} total automations to check")
        
        for automation_id in automation_entities:
            if automation_id == entity_id:  # Skip self
                continue
                
            state = self.hass.states.get(automation_id)
            if not state:
                _LOGGER.debug(f"No state for automation: {automation_id}")
                continue
                
            # Check automation configuration for entity references
            automation_config = state.attributes.get("configuration", {})
            if not automation_config:
                _LOGGER.debug(f"No configuration for automation: {automation_id}")
                _LOGGER.debug(f"Available attributes: {list(state.attributes.keys())}")
                
                # Try to get automation config from automation registry/component
                try:
                    # Access automation component to get config
                    automation_component = self.hass.data.get("automation")
                    if automation_component:
                        _LOGGER.debug(f"Found automation component: {type(automation_component)}")
                        
                        # EntityComponent has entities accessible via get_entity()
                        automation_entity = automation_component.get_entity(automation_id)
                        if automation_entity:
                            _LOGGER.debug(f"Found automation entity: {type(automation_entity)}")
                            # Try different config attribute names
                            for config_attr in ["raw_config", "config", "_config", "_raw_config", "automation_config"]:
                                if hasattr(automation_entity, config_attr):
                                    config_value = getattr(automation_entity, config_attr)
                                    if config_value:
                                        automation_config = config_value
                                        _LOGGER.debug(f"Found config via {config_attr}: {type(automation_config)}")
                                        break
                        else:
                            _LOGGER.debug(f"No automation entity found for: {automation_id}")
                            
                        # Also try direct access to entities dict
                        if not automation_config and hasattr(automation_component, "entities"):
                            entities_dict = automation_component.entities
                            if automation_id in entities_dict:
                                automation_entity = entities_dict[automation_id]
                                _LOGGER.debug(f"Found automation in entities dict: {type(automation_entity)}")
                                for config_attr in ["raw_config", "config", "_config", "_raw_config"]:
                                    if hasattr(automation_entity, config_attr):
                                        config_value = getattr(automation_entity, config_attr)
                                        if config_value:
                                            automation_config = config_value
                                            _LOGGER.debug(f"Found config via entities.{config_attr}: {type(automation_config)}")
                                            break
                                
                    # Try alternative data sources
                    if not automation_config:
                        automation_configs = self.hass.data.get("automation_config")
                        if automation_configs and automation_id in automation_configs:
                            automation_config = automation_configs[automation_id]
                            _LOGGER.debug(f"Found config from automation_config data")
                            
                except Exception as e:
                    _LOGGER.debug(f"Error accessing automation component: {e}")
                        
                if not automation_config:
                    continue
                
            _LOGGER.debug(f"Checking automation {automation_id} for references to {entity_id}")
            
            # Parse triggers for entity references (try both 'triggers' and 'trigger')
            triggers = automation_config.get("triggers", automation_config.get("trigger", []))
            if not isinstance(triggers, list):
                triggers = [triggers] if triggers else []
                
            # Parse actions for entity references (try both 'actions' and 'action')
            actions = automation_config.get("actions", automation_config.get("action", []))
            if not isinstance(actions, list):
                actions = [actions] if actions else []
            
            _LOGGER.debug(f"  Triggers: {len(triggers)}, Actions: {len(actions)}")
            
            # Parse conditions for entity references (try both 'conditions' and 'condition')
            conditions = automation_config.get("conditions", automation_config.get("condition", []))
            if not isinstance(conditions, list):
                conditions = [conditions] if conditions else []
            
            _LOGGER.debug(f"  Triggers: {len(triggers)}, Actions: {len(actions)}, Conditions: {len(conditions)}")
            
            # Check if our entity is referenced in triggers
            if self._entity_referenced_in_config(entity_id, triggers):
                automation_name = state.attributes.get("friendly_name", automation_id)
                related.append((automation_id, "automation_trigger"))
                _LOGGER.debug(f"  Found trigger relationship: {automation_name}")
            # Check if our entity is referenced in actions  
            elif self._entity_referenced_in_config(entity_id, actions):
                automation_name = state.attributes.get("friendly_name", automation_id)
                related.append((automation_id, "automation_action"))
                _LOGGER.debug(f"  Found action relationship: {automation_name}")
            # Check if our entity is referenced in conditions
            elif self._entity_referenced_in_conditions(entity_id, conditions):
                automation_name = state.attributes.get("friendly_name", automation_id)
                related.append((automation_id, "automation_condition"))
                _LOGGER.debug(f"  Found condition relationship: {automation_name}")
        
        _LOGGER.debug(f"Total automation relationships found: {len(related)}")
        return related

    async def _find_automation_referenced_entities(self, automation_id: str) -> List[tuple[str, str]]:
        """Find all entities referenced by a specific automation."""
        related = []
        
        _LOGGER.debug(f"Finding entities referenced by automation: {automation_id}")
        
        state = self.hass.states.get(automation_id)
        if not state:
            _LOGGER.debug(f"No state found for automation: {automation_id}")
            return related
            
        automation_config = state.attributes.get("configuration", {})
        if not automation_config:
            _LOGGER.debug(f"No configuration found for automation: {automation_id}")
            _LOGGER.debug(f"Available attributes: {list(state.attributes.keys())}")
            
            # Try to get automation config from automation registry/component
            try:
                # Access automation component to get config
                automation_component = self.hass.data.get("automation")
                if automation_component:
                    _LOGGER.debug(f"Found automation component: {type(automation_component)}")
                    
                    # EntityComponent has entities accessible via get_entity()
                    automation_entity = automation_component.get_entity(automation_id)
                    if automation_entity:
                        _LOGGER.debug(f"Found automation entity: {type(automation_entity)}")
                        # Try different config attribute names
                        for config_attr in ["raw_config", "config", "_config", "_raw_config", "automation_config"]:
                            if hasattr(automation_entity, config_attr):
                                config_value = getattr(automation_entity, config_attr)
                                if config_value:
                                    automation_config = config_value
                                    _LOGGER.debug(f"Found config via {config_attr}: {type(automation_config)}")
                                    break
                    else:
                        _LOGGER.debug(f"No automation entity found for: {automation_id}")
                        
                    # Also try direct access to entities dict
                    if not automation_config and hasattr(automation_component, "entities"):
                        entities_dict = automation_component.entities
                        if automation_id in entities_dict:
                            automation_entity = entities_dict[automation_id]
                            _LOGGER.debug(f"Found automation in entities dict: {type(automation_entity)}")
                            for config_attr in ["raw_config", "config", "_config", "_raw_config"]:
                                if hasattr(automation_entity, config_attr):
                                    config_value = getattr(automation_entity, config_attr)
                                    if config_value:
                                        automation_config = config_value
                                        _LOGGER.debug(f"Found config via entities.{config_attr}: {type(automation_config)}")
                                        break
                            
                # Try alternative data sources
                if not automation_config:
                    automation_configs = self.hass.data.get("automation_config")
                    if automation_configs and automation_id in automation_configs:
                        automation_config = automation_configs[automation_id]
                        _LOGGER.debug(f"Found config from automation_config data")
                        
            except Exception as e:
                _LOGGER.debug(f"Error accessing automation component: {e}")
                    
            if not automation_config:
                _LOGGER.debug(f"No automation config found through any method")
                return related
            
        automation_name = state.attributes.get("friendly_name", automation_id)
        _LOGGER.debug(f"Automation name: {automation_name}")
        _LOGGER.debug(f"Raw automation config structure: {automation_config}")
        _LOGGER.debug(f"Config keys: {list(automation_config.keys()) if automation_config else 'No config'}")
        
        # Parse triggers for entity references (try both 'triggers' and 'trigger')
        triggers = automation_config.get("triggers", automation_config.get("trigger", []))
        if not isinstance(triggers, list):
            triggers = [triggers] if triggers else []
            
        _LOGGER.debug(f"Parsing {len(triggers)} triggers: {triggers}")
        trigger_entities = self._extract_entities_from_config(triggers)
        _LOGGER.debug(f"Found trigger entities: {trigger_entities}")
        
        for entity_id in trigger_entities:
            if entity_id != automation_id:  # Avoid self-reference
                related.append((entity_id, "automation_trigger"))
                _LOGGER.debug(f"Added trigger relationship: {entity_id} -> {automation_name}")
        
        # Parse actions for entity references (try both 'actions' and 'action')
        actions = automation_config.get("actions", automation_config.get("action", []))
        if not isinstance(actions, list):
            actions = [actions] if actions else []
            
        _LOGGER.debug(f"Parsing {len(actions)} actions: {actions}")
        action_entities = self._extract_entities_from_config(actions)
        _LOGGER.debug(f"Found action entities: {action_entities}")
        
        for entity_id in action_entities:
            if entity_id != automation_id:
                related.append((entity_id, "automation_action"))
                _LOGGER.debug(f"Added control relationship: {automation_name} -> {entity_id}")
        
        # Parse conditions for entity references (try both 'conditions' and 'condition')
        conditions = automation_config.get("conditions", automation_config.get("condition", []))
        if not isinstance(conditions, list):
            conditions = [conditions] if conditions else []
            
        _LOGGER.debug(f"Parsing {len(conditions)} conditions: {conditions}")
        condition_entities = self._extract_entities_from_conditions(conditions)
        _LOGGER.debug(f"Found condition entities: {condition_entities}")
        
        for entity_id in condition_entities:
            if entity_id != automation_id:
                related.append((entity_id, "automation_condition"))
                _LOGGER.debug(f"Added condition relationship: {entity_id} conditions {automation_name}")
        
        _LOGGER.debug(f"Total entities found for {automation_name}: {len(related)}")
        return related


    def _extract_entities_from_config(self, config_list: List[Dict[str, Any]]) -> Set[str]:
        """Extract all entity IDs from automation config."""
        entities = set()
        
        _LOGGER.debug(f"Extracting entities from config list: {config_list}")
        
        for config in config_list:
            if not isinstance(config, dict):
                _LOGGER.debug(f"Skipping non-dict config: {config}")
                continue
                
            _LOGGER.debug(f"Processing config item: {config}")
                
            # Check direct entity_id references
            entity_id = config.get("entity_id")
            if isinstance(entity_id, str):
                # Check if this is a UUID that needs to be resolved to actual entity_id
                resolved_entity_id = self._resolve_entity_uuid(entity_id)
                if resolved_entity_id:
                    entities.add(resolved_entity_id)
                else:
                    entities.add(entity_id)  # Add as-is if not a UUID
            elif isinstance(entity_id, list):
                for eid in entity_id:
                    resolved_entity_id = self._resolve_entity_uuid(eid)
                    if resolved_entity_id:
                        entities.add(resolved_entity_id)
                    else:
                        entities.add(eid)
                
            # Check for script service calls (both 'service' and 'action' keys)
            service = config.get("service", config.get("action", ""))
            if isinstance(service, str):
                if service.startswith("script."):
                    # Direct script call like "script.my_script"
                    entities.add(service)
                    _LOGGER.debug(f"Found script service call: {service}")
                elif service == "script.turn_on":
                    # script.turn_on service with entity_id in data
                    service_data = config.get("data", {})
                    if isinstance(service_data, dict):
                        script_entity = service_data.get("entity_id")
                        if isinstance(script_entity, str) and script_entity.startswith("script."):
                            entities.add(script_entity)
                            _LOGGER.debug(f"Found script.turn_on call: {script_entity}")
                        elif isinstance(script_entity, list):
                            for script_id in script_entity:
                                if isinstance(script_id, str) and script_id.startswith("script."):
                                    entities.add(script_id)
                                    _LOGGER.debug(f"Found script.turn_on call: {script_id}")
                
            # Check in service data
            service_data = config.get("data", {})
            if isinstance(service_data, dict):
                data_entity_id = service_data.get("entity_id")
                if isinstance(data_entity_id, str):
                    entities.add(data_entity_id)
                elif isinstance(data_entity_id, list):
                    entities.update(data_entity_id)
                    
            # Check target entities (for newer HA automation format)
            target = config.get("target", {})
            if isinstance(target, dict):
                target_entity_id = target.get("entity_id")
                if isinstance(target_entity_id, str):
                    entities.add(target_entity_id)
                elif isinstance(target_entity_id, list):
                    entities.update(target_entity_id)
                    
            # Check device_id references - for device triggers, use device node
            device_id = config.get("device_id")
            if device_id:
                # If there's both device_id and entity_id, prioritize the specific entity
                specific_entity_id = config.get("entity_id")
                if specific_entity_id:
                    # Resolve UUID to actual entity ID if needed
                    resolved_entity_id = self._resolve_entity_uuid(specific_entity_id)
                    if resolved_entity_id:
                        entities.add(resolved_entity_id)
                        _LOGGER.debug(f"Found specific entity {resolved_entity_id} on device {device_id}")
                    else:
                        # UUID resolution failed, but this is likely a device trigger
                        # Create relationship to the device itself instead of all device entities
                        device_node_id = f"device:{device_id}"
                        entities.add(device_node_id)
                        _LOGGER.debug(f"Could not resolve entity UUID {specific_entity_id}, using device node: {device_node_id}")
                else:
                    # No specific entity, this is a device trigger - use device node
                    device_node_id = f"device:{device_id}"
                    entities.add(device_node_id)
                    _LOGGER.debug(f"Found device trigger for device {device_id}, using device node: {device_node_id}")
                
            # Check area_id references and resolve to entities  
            area_id = config.get("area_id")
            if area_id:
                area_entities = self._get_entities_for_area(area_id)
                entities.update(area_entities)
                
            # Recursively check nested configurations
            for value in config.values():
                if isinstance(value, list):
                    entities.update(self._extract_entities_from_config(value))
                elif isinstance(value, dict):
                    entities.update(self._extract_entities_from_config([value]))
        
        return entities

    def _extract_entities_from_conditions(self, conditions: Any) -> Set[str]:
        """Extract all entity IDs from automation conditions."""
        entities = set()
        
        _LOGGER.debug(f"Extracting entities from conditions: {conditions}")
        
        if not conditions:
            return entities
        
        # Handle different condition formats
        if isinstance(conditions, str):
            # Template shorthand condition
            entities.update(self._extract_entities_from_template_string_advanced(conditions))
            _LOGGER.debug(f"Found entities in template condition: {entities}")
        elif isinstance(conditions, dict):
            # Single condition object
            entities.update(self._extract_entities_from_condition_config(conditions))
        elif isinstance(conditions, list):
            # List of conditions
            for condition in conditions:
                entities.update(self._extract_entities_from_conditions(condition))
        
        return entities

    def _extract_entities_from_condition_config(self, condition: Dict[str, Any]) -> Set[str]:
        """Extract entities from a single condition configuration."""
        entities = set()
        
        if not isinstance(condition, dict):
            return entities
        
        condition_type = condition.get("condition")
        _LOGGER.debug(f"Processing condition type: {condition_type}")
        
        # Direct entity_id references
        entity_id = condition.get("entity_id")
        if entity_id:
            if isinstance(entity_id, str):
                entities.add(entity_id)
                _LOGGER.debug(f"Found entity_id: {entity_id}")
            elif isinstance(entity_id, list):
                entities.update(entity_id)
                _LOGGER.debug(f"Found entity_id list: {entity_id}")
        
        # Zone references (zones are entities)
        zone = condition.get("zone")
        if zone:
            if isinstance(zone, str):
                entities.add(zone)
                _LOGGER.debug(f"Found zone: {zone}")
            elif isinstance(zone, list):
                entities.update(zone)
                _LOGGER.debug(f"Found zone list: {zone}")
        
        # Device references - convert to entities
        device_id = condition.get("device_id")
        if device_id:
            # Get all entities for this device
            device_entities = self._get_entities_for_device(device_id)
            entities.update(device_entities)
            _LOGGER.debug(f"Found device {device_id} entities: {device_entities}")
            
            # If specific entity_id is specified in device condition, prioritize it
            specific_entity = condition.get("entity_id")
            if specific_entity:
                entities.add(specific_entity)
                _LOGGER.debug(f"Found specific device entity: {specific_entity}")
        
        # Template conditions
        value_template = condition.get("value_template")
        if value_template:
            template_entities = self._extract_entities_from_template_string_advanced(value_template)
            entities.update(template_entities)
            _LOGGER.debug(f"Found entities in value_template: {template_entities}")
        
        # Logical conditions - recursively process nested conditions
        if condition_type in ["and", "or", "not"]:
            nested_conditions = condition.get("conditions", [])
            nested_entities = self._extract_entities_from_conditions(nested_conditions)
            entities.update(nested_entities)
            _LOGGER.debug(f"Found entities in nested {condition_type} conditions: {nested_entities}")
        
        return entities

    def _extract_entities_from_template_string_advanced(self, template_str: str) -> Set[str]:
        """Extract entity references from Jinja2 templates with comprehensive patterns."""
        entities = set()
        
        if not isinstance(template_str, str):
            return entities
        
        _LOGGER.debug(f"Extracting entities from template: {template_str}")
        
        # Normalize whitespace and newlines for multi-line templates
        # This handles complex templates with line breaks and indentation
        normalized_template = re.sub(r'\s+', ' ', template_str.strip())
        _LOGGER.debug(f"Normalized template: {normalized_template}")
        
        # Enhanced patterns for entity references with flexible whitespace handling
        patterns = [
            # Core HA functions with flexible whitespace
            r"states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",                           # states('entity.id')
            r"state_attr\s*\(\s*['\"]([^'\"]+)['\"]\s*,",                       # state_attr('entity.id', 'attr')  
            r"is_state\s*\(\s*['\"]([^'\"]+)['\"]\s*,",                         # is_state('entity.id', 'state')
            r"device_attr\s*\(\s*['\"]([^'\"]+)['\"]\s*,",                      # device_attr('entity.id', 'attr')
            r"has_value\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",                       # has_value('entity.id')
            
            # Complex nested function calls with whitespace
            r"as_timestamp\s*\(\s*states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\)", # as_timestamp(states('entity.id'))
            r"float\s*\(\s*states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\)",        # float(states('entity.id'))
            r"int\s*\(\s*states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\)",          # int(states('entity.id'))
            
            # Mathematical operations with states
            r"states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\|\s*float",             # states('entity.id') | float
            r"states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\|\s*int",               # states('entity.id') | int
            r"states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\+",                     # states('entity.id') +
            r"states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\-",                     # states('entity.id') -
            r"states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\*",                     # states('entity.id') *
            r"states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*/",                      # states('entity.id') /
            
            # Direct states.entity.id format (dot notation)
            r"states\.([a-z_]+\.[a-z0-9_]+(?:\.[a-z0-9_]+)*)",                 # states.entity.id
            
            # Generic entity.id patterns (catch remaining references)  
            r"([a-z_]+\.[a-z0-9_]+(?:\.[a-z0-9_]+)*)",                         # Direct entity.id references
        ]
        
        # Process both original and normalized templates to catch edge cases
        for template_variant in [template_str, normalized_template]:
            for pattern in patterns:
                matches = re.findall(pattern, template_variant, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    # Handle different regex group structures
                    entity_candidate = match if isinstance(match, str) else match[0] if match else None
                    
                    if entity_candidate and self._is_valid_entity_id(entity_candidate):
                        entities.add(entity_candidate)
                        _LOGGER.debug(f"Found entity from pattern '{pattern}': {entity_candidate}")
        
        # Additional processing for complex multi-line templates  
        # Look for entity patterns that might span line breaks in the original
        multiline_patterns = [
            r"states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)[^}]*\|[^}]*float",         # Multi-line states() | float
            r"as_timestamp\s*\([^)]*states\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",    # Multi-line as_timestamp(states())
        ]
        
        for pattern in multiline_patterns:
            matches = re.findall(pattern, template_str, re.IGNORECASE | re.MULTILINE | re.DOTALL)
            for match in matches:
                entity_candidate = match if isinstance(match, str) else match[0] if match else None
                if entity_candidate and self._is_valid_entity_id(entity_candidate):
                    entities.add(entity_candidate)
                    _LOGGER.debug(f"Found entity from multiline pattern: {entity_candidate}")
        
        _LOGGER.debug(f"Final extracted entities: {entities}")
        return entities

    def _is_valid_entity_id(self, entity_id: str) -> bool:
        """Check if a string looks like a valid Home Assistant entity ID."""
        if not entity_id or not isinstance(entity_id, str):
            return False
            
        # Basic entity_id format: domain.entity_name
        if not re.match(r'^[a-z_]+\.[a-z0-9_]+$', entity_id):
            return False
            
        # Must have exactly one dot
        if entity_id.count('.') != 1:
            return False
            
        domain, entity_name = entity_id.split('.')
        
        # Domain must be at least 2 chars, entity name at least 1
        if len(domain) < 2 or len(entity_name) < 1:
            return False
            
        # Exclude obvious false positives
        false_positives = {
            'set.hourstodawn', 'int.60', 'float.batdawn',  # template variables
            'var.i', 'let.j', 'tmp.value',                  # programming constructs
        }
        
        if entity_id in false_positives:
            return False
            
        return True

    def _get_entities_for_device(self, device_id: str) -> Set[str]:
        """Get all entity IDs for a specific device."""
        entities = set()
        for entity_entry in self._entity_registry.entities.values():
            if entity_entry.device_id == device_id:
                entities.add(entity_entry.entity_id)
        return entities

    def _get_entities_for_area(self, area_id: str) -> Set[str]:
        """Get all entity IDs for a specific area."""
        entities = set()
        for entity_entry in self._entity_registry.entities.values():
            if entity_entry.area_id == area_id:
                entities.add(entity_entry.entity_id)
        return entities

    def _entity_referenced_in_scene_config(self, entity_id: str, scene_config: Dict[str, Any]) -> bool:
        """Check if an entity is referenced in scene configuration."""
        if not scene_config:
            return False
        
        # Check for entity in entities dict
        entities = scene_config.get("entities", {})
        if entity_id in entities:
            return True
        
        # Check for entity in snapshot data (some scenes store it this way)
        snapshot = scene_config.get("snapshot", {})
        if entity_id in snapshot:
            return True
            
        return False

    def _extract_entities_from_scene_config(self, scene_config: Dict[str, Any]) -> Set[str]:
        """Extract all entity IDs from scene configuration."""
        entities = set()
        
        if not scene_config:
            return entities
        
        # Check entities dict (most common format)
        scene_entities = scene_config.get("entities", {})
        if isinstance(scene_entities, dict):
            for entity_id in scene_entities.keys():
                if self._is_valid_entity_id(entity_id):
                    entities.add(entity_id)
                elif '.' not in entity_id:
                    # Might be a UUID, try to resolve it
                    resolved_id = self._resolve_entity_uuid(entity_id)
                    if resolved_id and self._is_valid_entity_id(resolved_id):
                        entities.add(resolved_id)
        
        # Check snapshot data (created by scene.create service)
        snapshot = scene_config.get("snapshot", {})
        if isinstance(snapshot, dict):
            for entity_id in snapshot.keys():
                if self._is_valid_entity_id(entity_id):
                    entities.add(entity_id)
                elif '.' not in entity_id:
                    # Might be a UUID, try to resolve it
                    resolved_id = self._resolve_entity_uuid(entity_id)
                    if resolved_id and self._is_valid_entity_id(resolved_id):
                        entities.add(resolved_id)
        
        # Check entity_data (alternative format used by some integrations)
        entity_data = scene_config.get("entity_data", {})
        if isinstance(entity_data, dict):
            for entity_id in entity_data.keys():
                if self._is_valid_entity_id(entity_id):
                    entities.add(entity_id)
                elif '.' not in entity_id:
                    # Might be a UUID, try to resolve it
                    resolved_id = self._resolve_entity_uuid(entity_id)
                    if resolved_id and self._is_valid_entity_id(resolved_id):
                        entities.add(resolved_id)
        
        # Check states (alternative format)
        states = scene_config.get("states", {})
        if isinstance(states, dict):
            for entity_id in states.keys():
                if self._is_valid_entity_id(entity_id):
                    entities.add(entity_id)
                elif '.' not in entity_id:
                    # Might be a UUID, try to resolve it
                    resolved_id = self._resolve_entity_uuid(entity_id)
                    if resolved_id and self._is_valid_entity_id(resolved_id):
                        entities.add(resolved_id)
        
        return entities

    def _resolve_entity_uuid(self, uuid_or_entity_id: str) -> str | None:
        """Resolve entity UUID to actual entity ID, or return None if it's not a UUID."""
        # Entity UUIDs are typically 32-character hex strings without dots
        if len(uuid_or_entity_id) == 32 and all(c in '0123456789abcdef' for c in uuid_or_entity_id.lower()):
            # This looks like a UUID, try to resolve it
            try:
                # Look through entity registry to find entity with this UUID
                for entity_entry in self._entity_registry.entities.values():
                    if hasattr(entity_entry, 'id') and entity_entry.id == uuid_or_entity_id:
                        _LOGGER.debug(f"Resolved UUID {uuid_or_entity_id} to entity {entity_entry.entity_id}")
                        return entity_entry.entity_id
                    elif hasattr(entity_entry, 'unique_id') and entity_entry.unique_id == uuid_or_entity_id:
                        _LOGGER.debug(f"Resolved unique_id {uuid_or_entity_id} to entity {entity_entry.entity_id}")
                        return entity_entry.entity_id
                        
                _LOGGER.debug(f"Could not resolve UUID {uuid_or_entity_id} to any entity")
                return None
            except Exception as e:
                _LOGGER.debug(f"Error resolving UUID {uuid_or_entity_id}: {e}")
                return None
        
        # Not a UUID pattern, return as-is if it's a valid entity ID format
        if '.' in uuid_or_entity_id:
            return uuid_or_entity_id
        
        return None

    def _get_entities_for_device(self, device_id: str) -> Set[str]:
        """Get all entity IDs for a given device."""
        try:
            device_entities = entity_registry.async_entries_for_device(
                self._entity_registry, device_id
            )
            return {entity.entity_id for entity in device_entities}
        except Exception:
            return set()

    def _get_entities_for_area(self, area_id: str) -> Set[str]:
        """Get all entity IDs for a given area."""
        try:
            area_entities = entity_registry.async_entries_for_area(
                self._entity_registry, area_id
            )
            return {entity.entity_id for entity in area_entities}
        except Exception:
            return set()

    async def _find_template_relationships(self, entity_id: str) -> List[tuple[str, str]]:
        """Find entities related through template references."""
        related = []
        
        # First try to find template entities from config entries
        template_related = await self._find_template_config_relationships(entity_id)
        related.extend(template_related)
        
        # Also check traditional template entities and input_* entities that might use templates
        template_domains = ["template", "input_boolean", "input_number", "input_text", "input_select"]
        
        for domain in template_domains:
            domain_entities = [
                eid for eid in self.hass.states.async_entity_ids() 
                if eid.startswith(f"{domain}.")
            ]
            
            for template_entity_id in domain_entities:
                state = self.hass.states.get(template_entity_id)
                if not state:
                    continue
                
                # Check if entity is referenced in template attributes
                if self._entity_referenced_in_templates(entity_id, state.attributes):
                    template_name = state.attributes.get("friendly_name", template_entity_id)
                    related.append((template_entity_id, f"template:{template_name}"))
        
        return related

    async def _find_template_config_relationships(self, entity_id: str) -> List[tuple[str, str]]:
        """Find template relationships by examining config entries."""
        related = []
        
        # Only debug log for template entities to reduce noise
        is_template_entity = entity_id.startswith(('binary_sensor.', 'sensor.', 'switch.', 'button.', 'number.', 'select.', 'text.'))
        if is_template_entity:
            _LOGGER.debug(f"Looking for template relationships for entity: {entity_id}")
        
        try:
            # Get config entries for template domain
            config_entries = self.hass.config_entries.async_entries("template")
            if is_template_entity:
                _LOGGER.debug(f"Found {len(config_entries)} template config entries")
            
            for config_entry in config_entries:
                if not config_entry.options:
                    continue
                    
                template_data = config_entry.options
                
                # Check different template types
                template_type = template_data.get("template_type")
                if template_type in ["switch", "sensor", "binary_sensor", "button", "number", "select", "text"]:
                    
                    # Get the template entity ID from the config
                    template_name = template_data.get("name", "Unknown Template")
                    template_entity_id = f"{template_type}.{template_name.lower().replace(' ', '_')}"
                    
                    # Check if this template is relevant to our entity
                    is_relevant = (entity_id == template_entity_id or 
                                   entity_id.startswith(f"{template_type}.") and 
                                   template_name.lower().replace(' ', '_') in entity_id)
                    
                    if is_relevant and is_template_entity:
                        _LOGGER.debug(f"Template config entry: {template_data}")
                        _LOGGER.debug(f"Generated template entity ID: {template_entity_id} for name: {template_name}")
                        
                        # Also check what template entities actually exist
                        all_template_entities = [eid for eid in self.hass.states.async_entity_ids() 
                                               if eid.startswith(f"{template_type}.")]
                        matching_entities = [eid for eid in all_template_entities 
                                           if template_name.lower().replace(' ', '_') in eid.lower()]
                        _LOGGER.debug(f"Actual {template_type} entities containing '{template_name.lower().replace(' ', '_')}': {matching_entities}")
                    
                    # Check various template fields for entity references
                    template_fields = [
                        "state",              # Direct state field for template entities
                        "value_template",
                        "state_template", 
                        "availability_template",
                        "icon_template",
                        "picture_template"
                    ]
                    
                    for field in template_fields:
                        template_str = template_data.get(field, "")
                        if isinstance(template_str, str) and template_str:
                            # Parse template for entity references
                            referenced_entities = self._extract_entities_from_template_string_advanced(template_str)
                            
                            if is_relevant and is_template_entity:
                                _LOGGER.debug(f"Found template field '{field}' with content: {template_str[:100]}...")
                                _LOGGER.debug(f"Extracted entities from {field}: {referenced_entities}")
                            
                            if entity_id in referenced_entities:
                                if is_template_entity:
                                    _LOGGER.debug(f"Found template relationship: {template_entity_id} uses {entity_id}")
                                related.append((template_entity_id, "template_uses"))
                            
                            # Also check reverse - if this IS the template entity, show what it depends on
                            if entity_id == template_entity_id:
                                if is_template_entity:
                                    _LOGGER.debug(f"This IS the template entity ({template_entity_id}), adding dependencies")
                                for referenced_entity in referenced_entities:
                                    if is_template_entity:
                                        _LOGGER.debug(f"Found template dependency: {entity_id} depends on {referenced_entity}")
                                    related.append((referenced_entity, "template_depends"))
                            
                            # IMPORTANT: Also check if entity_id might be this template entity 
                            # even if generated ID doesn't match exactly
                            if (template_str and entity_id.startswith(f"{template_type}.") and
                                template_name.lower().replace(' ', '_') in entity_id.lower()):
                                for referenced_entity in referenced_entities:
                                    if is_template_entity:
                                        _LOGGER.debug(f"Template dependency fuzzy match: {entity_id} depends on {referenced_entity}")
                                    related.append((referenced_entity, "template_depends"))
                                    
        except Exception as e:
            _LOGGER.debug(f"Error finding template config relationships: {e}")
        
        return related

    async def _find_label_relationships(self, entity_entry) -> List[tuple[str, str]]:
        """Find label relationships for entity."""
        related = []
        
        if not entity_entry or not entity_entry.labels:
            return related
        
        # For each label on this entity, create a relationship to the label node
        # The label node will handle showing all other items with the same label
        for label_id in entity_entry.labels:
            label_entry = self._label_registry.async_get_label(label_id)
            if not label_entry:
                continue
            
            # Create relationship to label node: label -> entity
            label_node_id = f"label:{label_id}"
            related.append((label_node_id, "labelled"))
        
        return related

    async def _find_group_relationships(self, entity_id: str) -> List[tuple[str, str]]:
        """Find group relationships for this entity."""
        related = []
        
        group_domains = ["group", "light", "switch", "cover", "fan", "media_player", "climate", "scene"]
        entity_domain = entity_id.split('.')[0]
        
        # Part 1: If this IS a group entity, find what entities it contains
        if entity_domain in group_domains:
            group_state = self.hass.states.get(entity_id)
            if group_state:
                member_entities = []
                
                # Get member entities based on group type
                if entity_id.startswith("group."):
                    member_entities = group_state.attributes.get("entity_id", [])
                elif entity_id.startswith("light."):
                    # Standard entity_id attribute
                    light_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(light_entities)
                    
                    # Alternative attributes that group helpers might use
                    lights_attr = group_state.attributes.get("lights", [])
                    member_entities.extend(lights_attr)
                    
                    # Some light groups might use different attributes
                    group_members = group_state.attributes.get("group_members", [])
                    member_entities.extend(group_members)
                    
                    # Light helper-specific attributes
                    light_list = group_state.attributes.get("light_list", [])
                    member_entities.extend(light_list)
                    
                    # Debug logging for empty light groups
                    all_attrs = group_state.attributes
                    if not member_entities and all_attrs:
                        _LOGGER.debug(f"Light group {entity_id} has no members found in _find_group_relationships. All attributes: {list(all_attrs.keys())}")
                        # Check for any attribute that might contain entity IDs
                        for attr_name, attr_value in all_attrs.items():
                            if isinstance(attr_value, list) and attr_value:
                                # Look for attributes that contain entity-like strings
                                if any(isinstance(item, str) and '.' in item for item in attr_value):
                                    _LOGGER.debug(f"Potential entity list found in attribute '{attr_name}': {attr_value}")
                                    member_entities.extend([item for item in attr_value if isinstance(item, str) and '.' in item])
                elif entity_id.startswith("switch."):
                    switch_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(switch_entities)
                    switches_attr = group_state.attributes.get("switches", [])
                    member_entities.extend(switches_attr)
                    
                    # Additional switch group attributes
                    group_members = group_state.attributes.get("group_members", [])
                    member_entities.extend(group_members)
                    
                    # Debug logging for empty switch groups
                    if not member_entities:
                        all_attrs = group_state.attributes
                        _LOGGER.debug(f"Switch group {entity_id} has no members found in _find_group_relationships. All attributes: {list(all_attrs.keys())}")
                        # Check for any attribute that might contain entity IDs
                        for attr_name, attr_value in all_attrs.items():
                            if isinstance(attr_value, list) and attr_value:
                                if any(isinstance(item, str) and '.' in item for item in attr_value):
                                    _LOGGER.debug(f"Potential entity list found in attribute '{attr_name}': {attr_value}")
                                    member_entities.extend([item for item in attr_value if isinstance(item, str) and '.' in item])
                elif entity_id.startswith("cover."):
                    cover_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(cover_entities)
                    covers_attr = group_state.attributes.get("covers", [])
                    member_entities.extend(covers_attr)
                elif entity_id.startswith("fan."):
                    fan_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(fan_entities)
                    fans_attr = group_state.attributes.get("fans", [])
                    member_entities.extend(fans_attr)
                elif entity_id.startswith("media_player."):
                    media_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(media_entities)
                    players_attr = group_state.attributes.get("group_members", [])
                    member_entities.extend(players_attr)
                elif entity_id.startswith("climate."):
                    climate_entities = group_state.attributes.get("entity_id", [])
                    member_entities.extend(climate_entities)
                
                # Remove duplicates
                member_entities = list(set(member_entities))
                
                if member_entities:
                    _LOGGER.debug(f"Entity {entity_id} is a {entity_domain} group containing {len(member_entities)} entities: {member_entities}")
                    for member_entity_id in member_entities:
                        # Group contains entity: return entity with group_contains relationship
                        related.append((member_entity_id, "group_contains"))
        
        # Part 2: Find groups that contain this entity (for reverse relationships)  
        # This works for ALL entities, including groups that might be in other groups
        _LOGGER.debug(f"🔄 PART 2: Finding groups containing entity: {entity_id}")
        
        # Special debugging for our test case
        if entity_id == "light.a_test_switch":
            pass  # Debug case
        
        # Find all group-like entities that can contain other entities
        all_group_candidates = []
        
        for domain in group_domains:
            domain_entities = [
                eid for eid in self.hass.states.async_entity_ids() 
                if eid.startswith(f"{domain}.")
            ]
            all_group_candidates.extend(domain_entities)
        
        # Add debugging to see what groups we're checking  
        if entity_id.startswith(('light.', 'switch.', 'sensor.')):  # Common entity types
            _LOGGER.debug(f"Checking {len(all_group_candidates)} group candidates for entity {entity_id}")
            
        # Special debugging for the specific case you mentioned
        if entity_id == "light.a_test_switch":
            light_candidates = [c for c in all_group_candidates if c.startswith('light.')]

        for group_candidate_id in all_group_candidates:
            group_state = self.hass.states.get(group_candidate_id)
            if not group_state:
                continue
            
            # Check various attributes that indicate group membership
            member_entities = []
            
            # Traditional groups use 'entity_id' attribute
            if group_candidate_id.startswith("group."):
                member_entities = group_state.attributes.get("entity_id", [])
            
            # Light groups use 'entity_id' attribute 
            elif group_candidate_id.startswith("light."):
                # Standard entity_id attribute
                light_entities = group_state.attributes.get("entity_id", [])
                member_entities.extend(light_entities)
                
                # Alternative attributes that group helpers might use
                lights_attr = group_state.attributes.get("lights", [])
                member_entities.extend(lights_attr)
                
                # Some light groups might use different attributes
                group_members = group_state.attributes.get("group_members", [])
                member_entities.extend(group_members)
                
                # Light helper-specific attributes
                light_list = group_state.attributes.get("light_list", [])
                member_entities.extend(light_list)
                
                # Debug for light groups specifically and check for unknown attributes
                all_attrs = group_state.attributes
                if not member_entities and all_attrs:
                    _LOGGER.debug(f"Light group {group_candidate_id} has no members found in reverse lookup. All attributes: {list(all_attrs.keys())}")
                    # Check for any attribute that might contain entity IDs
                    for attr_name, attr_value in all_attrs.items():
                        if isinstance(attr_value, list) and attr_value:
                            # Look for attributes that contain entity-like strings
                            if any(isinstance(item, str) and '.' in item for item in attr_value):
                                _LOGGER.debug(f"Potential entity list found in attribute '{attr_name}': {attr_value}")
                                member_entities.extend([item for item in attr_value if isinstance(item, str) and '.' in item])
                
                if entity_id.startswith('light.') and member_entities:
                    _LOGGER.debug(f"Light group {group_candidate_id} has members: {member_entities}")
                
                # Special debugging for light.light_group
                if group_candidate_id == "light.light_group":
                    pass  # Debug case
            
            # Switch groups
            elif group_candidate_id.startswith("switch."):
                switch_entities = group_state.attributes.get("entity_id", [])
                member_entities.extend(switch_entities)
                
                # Some switch groups might use 'switches' attribute
                switches_attr = group_state.attributes.get("switches", [])
                member_entities.extend(switches_attr)
                
                # Additional switch group attributes
                group_members = group_state.attributes.get("group_members", [])
                member_entities.extend(group_members)
                
                # Debug logging for empty switch groups in reverse lookup
                if not member_entities:
                    all_attrs = group_state.attributes
                    _LOGGER.debug(f"Switch group {group_candidate_id} has no members found in reverse lookup. All attributes: {list(all_attrs.keys())}")
                    # Check for any attribute that might contain entity IDs
                    for attr_name, attr_value in all_attrs.items():
                        if isinstance(attr_value, list) and attr_value:
                            if any(isinstance(item, str) and '.' in item for item in attr_value):
                                _LOGGER.debug(f"Potential entity list found in attribute '{attr_name}': {attr_value}")
                                member_entities.extend([item for item in attr_value if isinstance(item, str) and '.' in item])
            
            # Cover groups
            elif group_candidate_id.startswith("cover."):
                cover_entities = group_state.attributes.get("entity_id", [])
                member_entities.extend(cover_entities)
                
                covers_attr = group_state.attributes.get("covers", [])
                member_entities.extend(covers_attr)
            
            # Fan groups
            elif group_candidate_id.startswith("fan."):
                fan_entities = group_state.attributes.get("entity_id", [])
                member_entities.extend(fan_entities)
                
                fans_attr = group_state.attributes.get("fans", [])
                member_entities.extend(fans_attr)
            
            # Media player groups
            elif group_candidate_id.startswith("media_player."):
                media_entities = group_state.attributes.get("entity_id", [])
                member_entities.extend(media_entities)
                
                # Sonos and other systems might use different attributes
                players_attr = group_state.attributes.get("group_members", [])
                member_entities.extend(players_attr)
            
            # Climate groups
            elif group_candidate_id.startswith("climate."):
                climate_entities = group_state.attributes.get("entity_id", [])
                member_entities.extend(climate_entities)
                
            # Scene groups (reverse lookup)
            elif group_candidate_id.startswith("scene."):
                # Use the helper method to extract entities from scene config
                scene_entities = self._extract_entities_from_scene_config(
                    group_state.attributes.get("configuration", {})
                )
                member_entities.extend(scene_entities)
                
                # Also check for entities stored directly in attributes
                entities_in_scene = group_state.attributes.get("entities", {})
                if entities_in_scene:
                    member_entities.extend([
                        eid for eid in entities_in_scene.keys() 
                        if self._is_valid_entity_id(eid)
                    ])
            
            # Remove duplicates and check if our entity is in the group
            member_entities = list(set(member_entities))
            
            # Debug what we found for this group
            if entity_id.startswith(('light.', 'switch.', 'sensor.')) and member_entities:
                _LOGGER.debug(f"Group {group_candidate_id} has members: {member_entities}, checking if {entity_id} is in list")
            
            # Avoid self-references (group shouldn't contain itself)
            if entity_id in member_entities and entity_id != group_candidate_id:
                _LOGGER.debug(f"✅ Found entity {entity_id} in {group_candidate_id.split('.')[0]} group {group_candidate_id}")
                # Entity is in group: show group pointing to entity (group → entity)
                # Use negative relationship to indicate reverse direction 
                related.append((group_candidate_id, "group_contains_reverse"))
            elif entity_id.startswith(('light.', 'switch.', 'sensor.')) and member_entities:
                _LOGGER.debug(f"❌ Entity {entity_id} NOT found in {group_candidate_id} members: {member_entities}")
        
        _LOGGER.debug(f"Found {len(related)} groups containing entity {entity_id}")
        return related

    async def _find_helper_relationships(self, entity_id: str) -> List[tuple[str, str]]:
        """Find helper/proxy relationships (change type, input helpers, etc.)."""
        related = []
        
        # Only debug for light/switch entities to reduce noise
        is_light_or_switch = entity_id.startswith(('light.', 'switch.'))
        if is_light_or_switch:
            pass  # Debug case
        
        # Get the entity's state to examine its attributes
        state = self.hass.states.get(entity_id)
        if not state:
            return related
        
        # Check for "change type" / conversion helper indicators
        _LOGGER.debug(f"Checking helper relationships for {entity_id}")
        attributes = state.attributes
        
        # Debug all attributes for light/switch entities
        if is_light_or_switch:
            pass  # Debug case
        
        # Method 1: Check for original_entity or source_entity attributes
        original_entity = attributes.get("original_entity")
        source_entity = attributes.get("source_entity")
        wrapped_entity = attributes.get("wrapped_entity")  # Some integrations use this
        
        if original_entity:
            if is_light_or_switch:
                pass  # Debug case
            related.append((original_entity, "helper_converts"))
            
        if source_entity:
            if is_light_or_switch:
                pass  # Debug case
            related.append((source_entity, "helper_converts"))
            
        if wrapped_entity:
            if is_light_or_switch:
                pass  # Debug case
            related.append((wrapped_entity, "helper_converts"))
        
        # Method 2: Check for common helper patterns in entity_id
        # Many change-type helpers follow patterns like domain.original_name -> different_domain.original_name
        if "_" in entity_id or "original" in entity_id.lower():
            # Try to find potential source entities with similar names
            entity_domain = entity_id.split(".")[0]
            entity_name = entity_id.split(".", 1)[1]
            
            # Look for entities with the same name but different domains
            all_entities = self.hass.states.async_entity_ids()
            potential_sources = []
            
            for other_entity_id in all_entities:
                other_domain = other_entity_id.split(".")[0]
                other_name = other_entity_id.split(".", 1)[1]
                
                # Skip self
                if other_entity_id == entity_id:
                    continue
                
                # Look for same name, different domain
                if (other_name == entity_name and other_domain != entity_domain):
                    potential_sources.append(other_entity_id)
                
                # Look for similar names (common patterns: switch.something -> light.something)
                name_similarity_patterns = [
                    entity_name.replace("_light", "").replace("_switch", ""),
                    entity_name.replace("light_", "").replace("switch_", ""),
                ]
                
                for pattern in name_similarity_patterns:
                    if (other_name == pattern or 
                        other_name == f"{pattern}_switch" or 
                        other_name == f"{pattern}_light" or
                        other_name == f"switch_{pattern}" or
                        other_name == f"light_{pattern}"):
                        if other_entity_id not in potential_sources:
                            potential_sources.append(other_entity_id)
            
            # Add debug info for potential matches
            if potential_sources:
                # For now, add all potential sources - we can refine this logic
                for source in potential_sources:
                    related.append((source, "helper_converts"))
        
        # Method 3: Check for entity registry hints
        entity_entry = self._entity_registry.async_get(entity_id)
        if entity_entry and entity_entry.original_name:
            pass  # Could use this to find relationships, but need more context
        
        # Method 4: Check specific helper domains
        helper_domains = ["input_boolean", "input_number", "input_text", "input_select", "input_datetime"]
        entity_domain = entity_id.split(".")[0]
        
        if entity_domain in helper_domains:
            # This is a helper entity - look for automations/scripts that use it
            # Helper relationships are typically found through automation/template analysis
            # which we already handle elsewhere
            pass
        
        _LOGGER.debug(f"Found {len(related)} helper relationships for entity {entity_id}")
        return related

    def _entity_referenced_in_config(self, entity_id: str, config_list: List[Dict[str, Any]]) -> bool:
        """Check if entity or device is referenced in automation config."""
        # Handle device node IDs
        if entity_id.startswith("device:"):
            device_id = entity_id.replace("device:", "")
            return self._device_referenced_in_config(device_id, config_list)
        
        for config in config_list:
            if not isinstance(config, dict):
                continue
                
            # Check direct entity_id references
            if config.get("entity_id") == entity_id:
                return True
                
            # Check in lists of entity_ids
            entity_ids = config.get("entity_id", [])
            if isinstance(entity_ids, list) and entity_id in entity_ids:
                return True
                
            # Check in service data
            service_data = config.get("data", {})
            if isinstance(service_data, dict):
                if service_data.get("entity_id") == entity_id:
                    return True
                if isinstance(service_data.get("entity_id"), list) and entity_id in service_data.get("entity_id", []):
                    return True
                    
            # Recursively check nested configurations
            for value in config.values():
                if isinstance(value, list):
                    if self._entity_referenced_in_config(entity_id, value):
                        return True
                elif isinstance(value, dict):
                    if self._entity_referenced_in_config(entity_id, [value]):
                        return True
        
        return False

    def _device_referenced_in_config(self, device_id: str, config_list: List[Dict[str, Any]]) -> bool:
        """Check if device is referenced in automation config."""
        for config in config_list:
            if not isinstance(config, dict):
                continue
                
            # Check direct device_id references
            if config.get("device_id") == device_id:
                return True
                
            # Check in lists of device_ids
            device_ids = config.get("device_id", [])
            if isinstance(device_ids, list) and device_id in device_ids:
                return True
                
            # Check in service data
            service_data = config.get("data", {})
            if isinstance(service_data, dict):
                if service_data.get("device_id") == device_id:
                    return True
                if isinstance(service_data.get("device_id"), list) and device_id in service_data.get("device_id", []):
                    return True
                    
            # Recursively check nested configurations
            for value in config.values():
                if isinstance(value, list):
                    if self._device_referenced_in_config(device_id, value):
                        return True
                elif isinstance(value, dict):
                    if self._device_referenced_in_config(device_id, [value]):
                        return True
        
        return False

    def _entity_referenced_in_conditions(self, entity_id: str, conditions: Any) -> bool:
        """Check if entity or device is referenced in automation conditions."""
        if not conditions:
            return False
        
        # Handle device node IDs
        if entity_id.startswith("device:"):
            device_id = entity_id.replace("device:", "")
            return self._device_referenced_in_conditions(device_id, conditions)
        
        # Handle different condition formats
        if isinstance(conditions, str):
            # Template shorthand condition
            return self._entity_referenced_in_template_string(entity_id, conditions)
        elif isinstance(conditions, dict):
            # Single condition object
            return self._entity_referenced_in_condition(entity_id, conditions)
        elif isinstance(conditions, list):
            # List of conditions
            for condition in conditions:
                if self._entity_referenced_in_conditions(entity_id, condition):
                    return True
        
        return False

    def _device_referenced_in_conditions(self, device_id: str, conditions: Any) -> bool:
        """Check if device is referenced in automation conditions."""
        if not conditions:
            return False
        
        # Handle different condition formats
        if isinstance(conditions, dict):
            # Single condition object
            if conditions.get("device_id") == device_id:
                return True
        elif isinstance(conditions, list):
            # List of conditions
            for condition in conditions:
                if self._device_referenced_in_conditions(device_id, condition):
                    return True
        
        return False

    def _entity_referenced_in_condition(self, entity_id: str, condition: Dict[str, Any]) -> bool:
        """Check if entity is referenced in a single condition object."""
        if not isinstance(condition, dict):
            return False
        
        condition_type = condition.get("condition")
        
        # Direct entity_id references
        entity_id_ref = condition.get("entity_id")
        if entity_id_ref:
            if isinstance(entity_id_ref, str) and entity_id_ref == entity_id:
                return True
            elif isinstance(entity_id_ref, list) and entity_id in entity_id_ref:
                return True
        
        # Zone references (zones are entities)
        zone_ref = condition.get("zone")
        if zone_ref:
            if isinstance(zone_ref, str) and zone_ref == entity_id:
                return True
            elif isinstance(zone_ref, list) and entity_id in zone_ref:
                return True
        
        # Device references - check if entity belongs to this device
        device_id = condition.get("device_id")
        if device_id and self._entity_belongs_to_device(entity_id, device_id):
            return True
        
        # Template conditions
        value_template = condition.get("value_template")
        if value_template and self._entity_referenced_in_template_string(entity_id, value_template):
            return True
        
        # Logical conditions - recursively process nested conditions
        if condition_type in ["and", "or", "not"]:
            nested_conditions = condition.get("conditions", [])
            if self._entity_referenced_in_conditions(entity_id, nested_conditions):
                return True
        
        return False

    def _entity_referenced_in_template_string(self, entity_id: str, template_str: str) -> bool:
        """Check if entity is referenced in a Jinja2 template string."""
        import re
        
        if not isinstance(template_str, str):
            return False
        
        # Common template patterns for entity references
        patterns = [
            rf"states\(['\"]?{re.escape(entity_id)}['\"]?\)",           # states('entity.id')
            rf"state_attr\(['\"]?{re.escape(entity_id)}['\"]?,",        # state_attr('entity.id', 'attr')
            rf"is_state\(['\"]?{re.escape(entity_id)}['\"]?,",          # is_state('entity.id', 'state')
            rf"states\.{re.escape(entity_id.replace('.', r'\.'))}",     # states.entity.id
        ]
        
        for pattern in patterns:
            if re.search(pattern, template_str):
                return True
        
        # Simple containment check as fallback
        return entity_id in template_str

    def _entity_belongs_to_device(self, entity_id: str, device_id: str) -> bool:
        """Check if an entity belongs to a specific device."""
        entity_entry = self._entity_registry.async_get(entity_id)
        return entity_entry and entity_entry.device_id == device_id

    def _entity_referenced_in_templates(self, entity_id: str, attributes: Dict[str, Any]) -> bool:
        """Check if entity is referenced in template attributes."""
        # Common template attributes that might reference entities
        template_attrs = [
            "state_template", "value_template", "icon_template", 
            "entity_picture_template", "availability_template"
        ]
        
        for attr in template_attrs:
            template_str = attributes.get(attr, "")
            if isinstance(template_str, str) and entity_id in template_str:
                return True
                
        # Check in any string attribute that looks like a template
        for key, value in attributes.items():
            if isinstance(value, str) and "{{" in value and entity_id in value:
                return True
                
        return False