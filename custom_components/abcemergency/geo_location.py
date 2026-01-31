"""Geo location platform for ABC Emergency integration.

This module provides geo location entities that display emergency incidents
as markers on the Home Assistant map.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.geo_location import GeolocationEvent
from homeassistant.const import UnitOfLength
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import slugify

from .const import DOMAIN, GeoJSONMultiPolygon, GeoJSONPolygon
from .coordinator import ABCEmergencyCoordinator
from .models import EmergencyIncident

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)


def _get_instance_source(entry: ConfigEntry) -> str:
    """Generate an instance-based source identifier for geo-location filtering.

    Uses the config entry title directly (e.g., "ABC Emergency (Treehouse)")
    as the source for map card filtering.

    Args:
        entry: The config entry for this integration instance.

    Returns:
        The entry title as the source string, or a default if no title.
    """
    return entry.title or "ABC Emergency"


class ABCEmergencyGeolocationEvent(
    CoordinatorEntity[ABCEmergencyCoordinator],
    GeolocationEvent,
):
    """Geo location event for an emergency incident."""

    _attr_should_poll = False
    _attr_unit_of_measurement = UnitOfLength.KILOMETERS

    def __init__(
        self,
        coordinator: ABCEmergencyCoordinator,
        incident: EmergencyIncident,
        instance_source: str = "abc_emergency",
    ) -> None:
        """Initialize the geo location event.

        Args:
            coordinator: The data update coordinator.
            incident: The emergency incident data.
            instance_source: The source identifier for this instance (e.g., abc_emergency_treehouse).
        """
        super().__init__(coordinator)
        self._incident = incident
        self._instance_source = instance_source
        self._attr_unique_id = f"{instance_source}_{incident.id}"
        self._attr_name = incident.headline
        # Force predictable entity_id from unique incident ID to match sensor entity_ids
        # attribute format and avoid collisions from duplicate headlines (#103)
        self.entity_id = f"geo_location.{slugify(f'{instance_source}_{incident.id}')}"

    @property
    def source(self) -> str:
        """Return source of the event for map filtering."""
        return self._instance_source

    @property
    def latitude(self) -> float | None:
        """Return latitude of the event."""
        return self._incident.location.latitude

    @property
    def longitude(self) -> float | None:
        """Return longitude of the event."""
        return self._incident.location.longitude

    @property
    def distance(self) -> float | None:
        """Return distance from home in km."""
        return self._incident.distance_km

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        attrs: dict[str, Any] = {
            "alert_level": self._incident.alert_level,
            "alert_text": self._incident.alert_text,
            "event_type": self._incident.event_type,
            "event_icon": self._incident.event_icon,
            "status": self._incident.status,
            "agency": self._incident.source,  # Renamed from 'source' to avoid conflict with geo_location source property
            "direction": self._incident.direction,
            "updated": self._incident.updated.isoformat(),
        }
        if self._incident.size:
            attrs["size"] = self._incident.size

        # Expose geometry information
        attrs["has_polygon"] = self._incident.has_polygon
        if self._incident.geometry_type:
            attrs["geometry_type"] = self._incident.geometry_type

        # Expose GeoJSON geometry for map rendering
        if self._incident.has_polygon and self._incident.polygons:
            geojson = self._build_geojson()
            if geojson:
                attrs["geojson"] = geojson

        return attrs

    def _build_geojson(self) -> GeoJSONPolygon | GeoJSONMultiPolygon | None:
        """Convert stored polygons to GeoJSON format.

        Returns:
            GeoJSON Polygon or MultiPolygon geometry, or None if no polygon data.
        """
        polygons = self._incident.polygons
        if not polygons:
            return None

        if len(polygons) == 1:
            # Single polygon - return as Polygon type
            poly = polygons[0]
            coordinates: list[list[list[float]]] = [poly["outer_ring"]]
            inner_rings = poly.get("inner_rings")
            if inner_rings:
                coordinates.extend(inner_rings)
            return GeoJSONPolygon(type="Polygon", coordinates=coordinates)
        else:
            # Multiple polygons - return as MultiPolygon type
            multi_coords: list[list[list[list[float]]]] = []
            for poly in polygons:
                coords: list[list[list[float]]] = [poly["outer_ring"]]
                inner = poly.get("inner_rings")
                if inner:
                    coords.extend(inner)
                multi_coords.append(coords)
            return GeoJSONMultiPolygon(type="MultiPolygon", coordinates=multi_coords)

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        # Find this incident in the updated data
        for incident in self.coordinator.data.incidents:
            if incident.id == self._incident.id:
                self._incident = incident
                self._attr_name = incident.headline
                self.async_write_ha_state()
                return
        # Incident no longer exists - it will be removed by the manager


class ABCEmergencyGeoLocationManager:
    """Manager for geo location entities.

    This class manages the lifecycle of geo location entities, adding new
    entities when incidents appear and tracking existing ones.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        coordinator: ABCEmergencyCoordinator,
        async_add_entities: AddEntitiesCallback,
        instance_source: str = "abc_emergency",
    ) -> None:
        """Initialize the manager.

        Args:
            hass: Home Assistant instance.
            coordinator: The data update coordinator.
            async_add_entities: Callback to add entities.
            instance_source: The source identifier for this instance (e.g., abc_emergency_treehouse).
        """
        self._hass = hass
        self._coordinator = coordinator
        self._async_add_entities = async_add_entities
        self._instance_source = instance_source
        self._entities: dict[str, ABCEmergencyGeolocationEvent] = {}

    @callback
    def async_update(self) -> None:
        """Update geo location entities based on current data."""
        if self._coordinator.data is None:
            return

        current_ids = {i.id for i in self._coordinator.data.incidents}
        existing_ids = set(self._entities.keys())

        # Add new incidents
        new_ids = current_ids - existing_ids
        if new_ids:
            new_incidents = [i for i in self._coordinator.data.incidents if i.id in new_ids]
            new_entities = [
                ABCEmergencyGeolocationEvent(
                    self._coordinator, incident, instance_source=self._instance_source
                )
                for incident in new_incidents
            ]
            self._async_add_entities(new_entities)
            for entity in new_entities:
                self._entities[entity._incident.id] = entity

        # Remove old incidents
        removed_ids = existing_ids - current_ids
        for incident_id in removed_ids:
            if incident_id in self._entities:
                entity = self._entities.pop(incident_id)
                self._hass.async_create_task(entity.async_remove(force_remove=True))


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up ABC Emergency geo location platform.

    Args:
        hass: Home Assistant instance.
        entry: Config entry being set up.
        async_add_entities: Callback to add entities.
    """
    coordinator: ABCEmergencyCoordinator = hass.data[DOMAIN][entry.entry_id]

    # Generate instance-specific source for map filtering
    instance_source = _get_instance_source(entry)

    manager = ABCEmergencyGeoLocationManager(
        hass, coordinator, async_add_entities, instance_source=instance_source
    )

    # Initial population
    manager.async_update()

    # Subscribe to updates
    entry.async_on_unload(coordinator.async_add_listener(manager.async_update))
