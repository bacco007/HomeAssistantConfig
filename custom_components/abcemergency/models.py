"""Data models for ABC Emergency integration.

This module defines dataclasses for representing emergency incidents
and coordinator data in a type-safe manner.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from .const import StoredPolygon


@dataclass
class Coordinate:
    """Geographic coordinate.

    Represents a point on Earth using latitude and longitude.

    Attributes:
        latitude: Latitude in degrees (-90 to 90).
        longitude: Longitude in degrees (-180 to 180).
    """

    latitude: float
    longitude: float


@dataclass
class EmergencyIncident:
    """Processed emergency incident.

    Represents a single emergency incident with all relevant details
    for display and alerting purposes.

    Attributes:
        id: Unique identifier for the incident (e.g., "AUREMER-...").
        headline: Brief headline describing the incident location.
        alert_level: Australian Warning System level (extreme, severe, moderate, minor).
        alert_text: Human-readable alert text (Emergency, Watch and Act, Advice, "").
        event_type: Type of incident (e.g., Bushfire, Flood, Storm).
        event_icon: Icon category (fire, weather, heat, other).
        status: Current status of the incident (e.g., "Being controlled").
        size: Affected area size (e.g., "100 ha").
        source: Reporting agency (e.g., "NSW Rural Fire Service").
        location: Geographic coordinates of the incident centroid.
        updated: Last update timestamp.
        distance_km: Distance from monitored location in kilometers.
        bearing: Bearing from monitored location in degrees (0-360).
        direction: Compass direction from monitored location (N, NE, E, etc.).
        geometry_type: Original geometry type (Point, Polygon, MultiPolygon, GeometryCollection).
        polygons: List of stored polygons for point-in-polygon testing.
        has_polygon: Whether this incident has polygon data for containment testing.
    """

    id: str
    headline: str
    alert_level: str
    alert_text: str
    event_type: str
    event_icon: str
    status: str | None
    size: str | None
    source: str
    location: Coordinate
    updated: datetime
    distance_km: float | None = None
    bearing: float | None = None
    direction: str | None = None
    geometry_type: str | None = None
    polygons: list[StoredPolygon] | None = None
    has_polygon: bool = False
    contains_point: bool | None = None
    # Cache for prepared Shapely geometries (not serializable, excluded from repr)
    _prepared_polygons: list[Any] | None = field(default=None, repr=False, compare=False)


@dataclass
class CoordinatorData:
    """Data returned by the coordinator.

    Contains all processed emergency data for consumption by entities.

    Attributes:
        incidents: List of all processed emergency incidents.
        total_count: Total number of incidents in the state.
        nearby_count: Number of incidents within the configured radius.
        nearest_distance_km: Distance to the nearest incident in kilometers.
        nearest_incident: Reference to the nearest incident, if any.
        highest_alert_level: Highest alert level among nearby incidents.
        incidents_by_type: Count of incidents grouped by event type.
        instance_type: Type of instance (state, zone, person).
        location_available: Whether location is available (for person mode).
        current_latitude: Current latitude used for calculations.
        current_longitude: Current longitude used for calculations.
        containing_incidents: List of incidents whose polygons contain the monitored point.
        inside_polygon: True if monitored point is inside any incident polygon.
        inside_emergency_warning: True if inside polygon with extreme alert level.
        inside_watch_and_act: True if inside polygon with severe or higher alert level.
        inside_advice: True if inside polygon with moderate or higher alert level.
        highest_containing_alert_level: Highest alert level among containing incidents.
    """

    incidents: list[EmergencyIncident] = field(default_factory=list)
    total_count: int = 0
    nearby_count: int | None = None
    nearest_distance_km: float | None = None
    nearest_incident: EmergencyIncident | None = None
    highest_alert_level: str = ""
    incidents_by_type: dict[str, int] = field(default_factory=dict)
    instance_type: str = "state"
    location_available: bool = True
    current_latitude: float | None = None
    current_longitude: float | None = None
    containing_incidents: list[EmergencyIncident] = field(default_factory=list)
    inside_polygon: bool = False
    inside_emergency_warning: bool = False
    inside_watch_and_act: bool = False
    inside_advice: bool = False
    highest_containing_alert_level: str = ""
