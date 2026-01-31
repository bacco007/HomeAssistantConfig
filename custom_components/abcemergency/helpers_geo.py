"""Geospatial helper functions for ABC Emergency.

This module provides point-in-polygon detection for containment checking
of emergency incident zones. Uses Shapely's prepared geometries for
efficient repeated containment checks.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from shapely.geometry import Point, Polygon
from shapely.prepared import prep

if TYPE_CHECKING:
    from .const import StoredPolygon
    from .models import EmergencyIncident

_LOGGER = logging.getLogger(__name__)


def stored_polygon_to_shapely(poly_data: StoredPolygon) -> Polygon:
    """Convert stored polygon data to Shapely Polygon.

    Args:
        poly_data: Stored polygon data with outer_ring and optional inner_rings.

    Returns:
        Shapely Polygon object.
    """
    # Shapely uses (x, y) which is (longitude, latitude)
    shell = [(coord[0], coord[1]) for coord in poly_data["outer_ring"]]
    holes = None
    inner_rings = poly_data.get("inner_rings")
    if inner_rings is not None:
        holes = [[(coord[0], coord[1]) for coord in ring] for ring in inner_rings]
    return Polygon(shell, holes)


def _build_prepared_polygons(polygons: list[StoredPolygon]) -> list[Any]:
    """Build prepared Shapely polygon objects for efficient containment checks.

    Args:
        polygons: List of stored polygon data.

    Returns:
        List of prepared Shapely geometries (PreparedGeometry objects).
    """
    prepared = []
    for poly_data in polygons:
        try:
            polygon = stored_polygon_to_shapely(poly_data)
            if polygon.is_valid:
                prepared.append(prep(polygon))
        except Exception:
            # Skip malformed polygons
            _LOGGER.debug("Skipping malformed polygon during preparation")
            continue
    return prepared


def get_prepared_polygons(incident: EmergencyIncident) -> list[Any]:
    """Get prepared Shapely polygons for an incident, creating cache if needed.

    This function lazily creates and caches prepared polygon geometries on
    the incident object for efficient repeated containment checks.

    Args:
        incident: Emergency incident to get prepared polygons for.

    Returns:
        List of prepared Shapely geometries. Empty list if no valid polygons.
    """
    # Return cached if available
    if incident._prepared_polygons is not None:
        return incident._prepared_polygons

    # Build and cache prepared polygons
    if incident.polygons:
        incident._prepared_polygons = _build_prepared_polygons(incident.polygons)
    else:
        incident._prepared_polygons = []

    return incident._prepared_polygons


def point_in_polygons(
    latitude: float,
    longitude: float,
    polygons: list[StoredPolygon] | None,
) -> bool:
    """Check if a geographic point is inside any of the given polygons.

    Note: For repeated checks on the same incident, prefer using
    point_in_incident() which uses cached prepared geometries.

    Args:
        latitude: Point latitude (y-coordinate).
        longitude: Point longitude (x-coordinate).
        polygons: List of stored polygon data, or None.

    Returns:
        True if point is inside any polygon, False otherwise.
    """
    if not polygons:
        return False

    point = Point(longitude, latitude)  # Shapely: (x, y) = (lon, lat)

    for poly_data in polygons:
        try:
            polygon = stored_polygon_to_shapely(poly_data)
            if polygon.is_valid and polygon.contains(point):
                return True
        except Exception:
            # Skip malformed polygons - log but don't crash
            _LOGGER.debug("Skipping malformed polygon during containment check")
            continue

    return False


def point_in_incident(
    latitude: float,
    longitude: float,
    incident: EmergencyIncident,
) -> bool:
    """Check if a geographic point is inside an incident's polygons.

    This function uses cached prepared geometries for efficient repeated
    containment checks on the same incident.

    Args:
        latitude: Point latitude (y-coordinate).
        longitude: Point longitude (x-coordinate).
        incident: Emergency incident to check against.

    Returns:
        True if point is inside any of the incident's polygons, False otherwise.
    """
    if not incident.has_polygon:
        return False

    prepared_polys = get_prepared_polygons(incident)
    if not prepared_polys:
        return False

    point = Point(longitude, latitude)  # Shapely: (x, y) = (lon, lat)

    for prepared in prepared_polys:
        try:
            if prepared.contains(point):
                return True
        except Exception:
            _LOGGER.debug("Error during prepared geometry containment check")
            continue

    return False
