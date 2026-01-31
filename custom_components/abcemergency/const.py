"""Constants and TypedDict definitions for the ABC Emergency integration.

This module provides type-safe definitions for all ABC Emergency API responses
and integration constants, based on comprehensive analysis of emergency data
across all 8 Australian states/territories.
"""

from __future__ import annotations

from typing import Final, Literal, TypedDict

# Integration Domain
DOMAIN: Final = "abcemergency"

# Geo-location source identifier
SOURCE: Final = "abc_emergency"

# API Configuration
API_BASE_URL: Final = "https://www.abc.net.au/emergency-web/api"
DEFAULT_SCAN_INTERVAL: Final = 300  # 5 minutes in seconds
DEFAULT_RADIUS_KM: Final = 50
USER_AGENT: Final = "HomeAssistant-ABCEmergency/1.0"

# Configuration keys - Basic
CONF_STATE: Final = "state"
CONF_STATES: Final = "states"
CONF_USE_HOME_LOCATION: Final = "use_home_location"

# Instance type configuration (v3+)
CONF_INSTANCE_TYPE: Final = "instance_type"
CONF_PERSON_ENTITY_ID: Final = "person_entity_id"
CONF_PERSON_NAME: Final = "person_name"

# Instance type literal
InstanceTypeLiteral = Literal["state", "zone", "person"]

# Instance type constants
INSTANCE_TYPE_STATE: Final = "state"
INSTANCE_TYPE_ZONE: Final = "zone"
INSTANCE_TYPE_PERSON: Final = "person"

# Configuration keys - State-wide options
CONF_ENABLE_STATE_SENSORS: Final = "enable_state_sensors"
CONF_ENABLE_STATE_GEO: Final = "enable_state_geo"

# Configuration keys - Zone options
CONF_ZONE_SOURCE: Final = "zone_source"
CONF_ZONE_NAME: Final = "zone_name"
CONF_ENABLE_ZONE_SENSORS: Final = "enable_zone_sensors"
CONF_ENABLE_ZONE_GEO: Final = "enable_zone_geo"

# Zone source options
ZONE_SOURCE_HOME: Final = "home"
ZONE_SOURCE_CUSTOM: Final = "custom"

# Configuration keys - Per-type radius
CONF_RADIUS_BUSHFIRE: Final = "radius_bushfire"
CONF_RADIUS_EARTHQUAKE: Final = "radius_earthquake"
CONF_RADIUS_STORM: Final = "radius_storm"
CONF_RADIUS_FLOOD: Final = "radius_flood"
CONF_RADIUS_FIRE: Final = "radius_fire"
CONF_RADIUS_HEAT: Final = "radius_heat"
CONF_RADIUS_OTHER: Final = "radius_other"

# Default radii (in km)
DEFAULT_RADIUS_BUSHFIRE: Final = 50
DEFAULT_RADIUS_EARTHQUAKE: Final = 100
DEFAULT_RADIUS_STORM: Final = 75
DEFAULT_RADIUS_FLOOD: Final = 30
DEFAULT_RADIUS_FIRE: Final = 10
DEFAULT_RADIUS_HEAT: Final = 100
DEFAULT_RADIUS_OTHER: Final = 25

# Radius category type
RadiusCategoryLiteral = Literal["bushfire", "earthquake", "storm", "flood", "fire", "heat", "other"]

# Incident type to radius category mapping
INCIDENT_TYPE_TO_RADIUS_CATEGORY: Final[dict[str, RadiusCategoryLiteral]] = {
    # Bushfire category
    "Bushfire": "bushfire",
    "Grass Fire": "bushfire",
    "Fuel Reduction Burn": "bushfire",
    "Planned Burn": "bushfire",
    "Burn Off": "bushfire",
    # Earthquake
    "Earthquake": "earthquake",
    # Storm
    "Storm": "storm",
    "Thunderstorm": "storm",
    "Wind": "storm",
    "Weather": "storm",
    # Flood
    "Flood": "flood",
    # Fire (structure)
    "Fire": "fire",
    "Structure Fire": "fire",
    "Vehicle Fire": "fire",
    # Heat
    "Extreme Heat": "heat",
    "Heatwave": "heat",
    # Other types default to "other" - handled in code
}

# Australian states and territories
STATES: Final[tuple[str, ...]] = ("nsw", "vic", "qld", "sa", "wa", "tas", "nt", "act")

# State display names
STATE_NAMES: Final[dict[str, str]] = {
    "nsw": "New South Wales",
    "vic": "Victoria",
    "qld": "Queensland",
    "sa": "South Australia",
    "wa": "Western Australia",
    "tas": "Tasmania",
    "nt": "Northern Territory",
    "act": "Australian Capital Territory",
}

# State code literal type
StateLiteral = Literal["nsw", "vic", "qld", "sa", "wa", "tas", "nt", "act"]


class AlertLevel:
    """Australian Warning System alert levels mapped to API values."""

    EMERGENCY: Final = "extreme"
    WATCH_AND_ACT: Final = "severe"
    ADVICE: Final = "moderate"
    INFORMATION: Final = "minor"


# Literal types for API response values
AlertLevelLiteral = Literal["extreme", "severe", "moderate", "minor"]
AlertTextLiteral = Literal["", "Advice", "Emergency", "Watch and Act"]
AlertStyleLiteral = Literal["extreme", "severe", "moderate", "minor"]
EventIconLiteral = Literal["fire", "heat", "other", "weather"]

# Event label literal (all known event types)
EventLabelLiteral = Literal[
    "Assist Agency",
    "Burn Off",
    "Bushfire",
    "Earthquake",
    "Extreme Heat",
    "Fire",
    "Fire ban",
    "Fuel Reduction Burn",
    "Grass Fire",
    "Hazardous Materials",
    "Heatwave",
    "Motor Vehicle Accident",
    "Other Non-Urgent Alerts",
    "Planned Burn",
    "Rescue",
    "Sheep Grazier Warning",
    "Storm",
    "Structure Fire",
    "Thunderstorm",
    "Vehicle Fire",
    "Weather",
    "Wind",
]

# Card source literal (emergency service organizations)
CardSourceLiteral = Literal[
    "Australian Government Bureau of Meteorology",
    "Bushfires NT",
    "Department of Fire and Emergency Services (DFES)",
    "Department of Fire and Emergency Services WA",
    "Department of Health",
    "Emergency Management Victoria",
    "Fire and Rescue NSW",
    "Forest Fire Management Victoria",
    "Forestry Corporation of NSW",
    "Geoscience Australia",
    "NSW National Parks and Wildlife Service",
    "NSW Rural Fire Service",
    "NTFRS",
    "New South Wales State Emergency Service",
    "Queensland Fire Department",
    "South Australian Country Fire Service",
    "Tasmania Fire Service",
    "Tasmanian Department of Premier and Cabinet",
    "Unknown",
    "VIC Country Fire Authority",
]

# Geometry type literals
GeometryTypeLiteral = Literal[
    "GeometryCollection",
    "MultiPolygon",
    "Point",
    "Polygon",
]

# Feature alert type literal
FeatureAlertTypeLiteral = Literal["warning", "incident"]

# Coordinate types
Coordinate = tuple[float, float]  # [longitude, latitude]
PolygonRing = list[Coordinate]
PolygonCoordinates = list[PolygonRing]
MultiPolygonCoordinates = list[PolygonCoordinates]


class CRSProperties(TypedDict):
    """Coordinate Reference System properties."""

    name: str  # e.g., "EPSG:4326"


class CRS(TypedDict):
    """Coordinate Reference System definition."""

    type: Literal["name"]
    properties: CRSProperties


class PointGeometry(TypedDict):
    """GeoJSON Point geometry."""

    type: Literal["Point"]
    coordinates: list[float]  # [longitude, latitude]


class PolygonGeometry(TypedDict):
    """GeoJSON Polygon geometry."""

    type: Literal["Polygon"]
    coordinates: list[list[list[float]]]


class MultiPolygonGeometry(TypedDict):
    """GeoJSON MultiPolygon geometry."""

    type: Literal["MultiPolygon"]
    coordinates: list[list[list[list[float]]]]


class GeometryCollectionGeometry(TypedDict):
    """GeoJSON GeometryCollection - can contain Points and Polygons."""

    type: Literal["GeometryCollection"]
    crs: CRS
    geometries: list[PointGeometry | PolygonGeometry]


class TopLevelPointGeometry(TypedDict, total=False):
    """Top-level Point geometry (may have optional CRS)."""

    type: Literal["Point"]
    crs: CRS
    coordinates: list[float]  # [longitude, latitude]


class TopLevelPolygonGeometry(TypedDict):
    """Top-level Polygon geometry with CRS (used by BOM warnings)."""

    type: Literal["Polygon"]
    crs: CRS
    coordinates: list[list[list[float]]]


class TopLevelMultiPolygonGeometry(TypedDict):
    """Top-level MultiPolygon geometry with CRS (used by BOM warnings)."""

    type: Literal["MultiPolygon"]
    crs: CRS
    coordinates: list[list[list[list[float]]]]


# Union type for all possible top-level geometry types in Emergency objects
Geometry = (
    GeometryCollectionGeometry
    | TopLevelPointGeometry
    | TopLevelPolygonGeometry
    | TopLevelMultiPolygonGeometry
)


class AlertLevelInfo(TypedDict):
    """Alert level information using Australian Warning System."""

    text: AlertTextLiteral
    level: AlertLevelLiteral
    style: AlertStyleLiteral


class EmergencyTimestamp(TypedDict):
    """Timestamp information for an emergency."""

    date: str  # ISO 8601 datetime, e.g., "2025-12-06T05:34:00+00:00"
    formattedTime: str  # Human-readable, e.g., "4:34:00 pm AEDT"
    prefix: str  # e.g., "Effective from"
    updatedTime: str  # ISO 8601 datetime with microseconds


class EventLabelInfo(TypedDict):
    """Event categorization information."""

    icon: EventIconLiteral
    labelText: str  # The event type label (see EventLabelLiteral for known values)


class CardBody(TypedDict):
    """Card body information - varies by incident type."""

    type: str | None  # Incident type; None for BOM warnings
    size: str | None  # Fire size, e.g., "100 ha", "706.500"; None for non-fire
    status: str | None  # Incident status
    source: str  # Source organization


class Emergency(TypedDict):
    """A single emergency incident from the API."""

    id: str  # e.g., "AUREMER-72446a8d6888092c5e42f6ed9985f935"
    headline: str  # e.g., "Nimbin Rd, Koolewong"
    to: str  # URL path, e.g., "/emergency/warning/AUREMER-..."
    alertLevelInfoPrepared: AlertLevelInfo
    emergencyTimestampPrepared: EmergencyTimestamp
    eventLabelPrepared: EventLabelInfo
    cardBody: CardBody
    geometry: Geometry


class AffectedAbcRegion(TypedDict):
    """ABC Local Radio region information."""

    region: str  # e.g., "sydney"
    regionName: str  # e.g., "Sydney"
    serviceName: str  # e.g., "local_sydney"
    serviceNameRadio: str  # e.g., "local_sydney"
    brandName: str  # e.g., "ABC Radio Sydney"


class FeatureGeometry(TypedDict):
    """Geometry for a Feature - can be Point, Polygon, MultiPolygon, or GeometryCollection."""

    type: str
    crs: CRS
    coordinates: list  # type: ignore[type-arg]  # Structure varies by geometry type


class FeatureProperties(TypedDict, total=False):
    """Properties of a GeoJSON Feature object.

    All fields are optional (total=False) as different sources provide different fields.
    """

    # Core identification
    id: str
    state: str
    headline: str
    textSummary: str

    # Source information
    senderName: str
    orgName: str
    orgWeb: str
    orgAttribution: str

    # Event classification
    event: str
    alertType: FeatureAlertTypeLiteral
    alertLevel: str | None
    alertLevelRaw: str | None
    abcAlertLevel: str
    displaySequence: int

    # Incident details
    incidentType: str | None
    incidentStatus: str | None
    size: str | None
    certainty: str

    # Timestamps
    sent: str
    effective: str | None
    systemCreatedTime: str
    systemUpdatedTime: str
    systemArchivedTime: str | None

    # Location
    areaDesc: str
    centroid: PointGeometry
    affectedAbcRegion: AffectedAbcRegion

    # Response
    responseTypes: list[str]
    cyclonePath: dict[str, object] | None

    # Map styling
    fillColour: str
    fillOpacity: float
    fillOpacityActive: float
    lineColour: str
    lineOpacity: float
    lineWidth: float
    icon: str
    iconOpacity: float
    iconSize: float
    visible: str


class Feature(TypedDict):
    """GeoJSON Feature with extended properties."""

    type: Literal["Feature"]
    id: str
    geometry: FeatureGeometry
    properties: FeatureProperties


class EmergencySearchResponse(TypedDict):
    """Response from /emergencySearch endpoint."""

    emergencies: list[Emergency]
    features: list[Feature]
    mapBound: list[list[float]]  # [[lon1, lat1], [lon2, lat2]]
    stateName: str  # State code, e.g., "nsw"
    incidentsNumber: int  # Number of incidents in search area
    stateCount: int  # Total incidents in state


class EmergencyFeedResponse(TypedDict):
    """Response from /emergencyFeed endpoint."""

    allEmergencies: list[Emergency]
    features: list[Feature]


# Location and Weather TypedDicts


class State(TypedDict):
    """State information from location API."""

    id: str  # e.g., "nsw"
    __typename: Literal["State"]


class ABCRegion(TypedDict):
    """ABC Local Radio region from location API."""

    region: str  # e.g., "sydney"
    regionName: str  # e.g., "Sydney"
    __typename: Literal["ABCRegion"]


class Location(TypedDict):
    """Location from location search."""

    id: str  # e.g., "aurora://location/loc46e6625bb24d"
    suburb: str  # e.g., "Sydney"
    state: State
    postcode: str  # e.g., "2000"
    lat: str  # e.g., "-33.8688" (note: string, not float)
    long: str  # e.g., "151.2093" (note: string, not float)
    abcRegion: ABCRegion
    __typename: Literal["Location"]


class LocationResults(TypedDict):
    """Location search results."""

    byLocalitySearch: list[Location]
    __typename: Literal["LocationsRoot"]


class LocationSearchResponse(TypedDict):
    """Response from /locationSearch endpoint."""

    locations: LocationResults


# Stored polygon TypedDicts for point-in-polygon containment detection


class StoredPolygon(TypedDict):
    """Stored polygon geometry for point-in-polygon testing.

    Follows GeoJSON coordinate order: [longitude, latitude].

    Attributes:
        outer_ring: The outer boundary of the polygon as [[lon, lat], ...].
        inner_rings: Optional list of hole boundaries (exclusion zones).
    """

    outer_ring: list[list[float]]
    inner_rings: list[list[list[float]]] | None


class StoredGeometry(TypedDict):
    """Complete geometry data stored for an incident.

    Attributes:
        type: The geometry type (Point, Polygon, MultiPolygon).
        polygons: List of polygons for containment testing (None for Point).
    """

    type: Literal["Point", "Polygon", "MultiPolygon"]
    polygons: list[StoredPolygon] | None


# Containment tracking TypedDicts for polygon enter/exit events


class ContainmentState(TypedDict):
    """Previous containment state for an incident.

    Tracks the actual containment relationship between a monitored point
    and an incident polygon, not just the incident ID. This enables
    detection of polygon boundary changes and severity escalations.

    Attributes:
        was_containing: Whether the incident polygon contained the point.
        alert_level: The alert level of the incident (extreme, severe, moderate, minor).
        alert_text: Human-readable alert text (Emergency, Watch and Act, Advice, "").
    """

    was_containing: bool
    alert_level: str
    alert_text: str


# GeoJSON output TypedDicts for entity attributes


class GeoJSONPolygon(TypedDict):
    """GeoJSON Polygon output for entity attributes.

    Used to expose polygon geometry in a format that can be directly
    consumed by mapping libraries like Leaflet.

    Attributes:
        type: Always "Polygon" for this type.
        coordinates: List of coordinate rings. First is outer boundary,
                     rest are holes (inner rings).
    """

    type: Literal["Polygon"]
    coordinates: list[list[list[float]]]


class GeoJSONMultiPolygon(TypedDict):
    """GeoJSON MultiPolygon output for entity attributes.

    Used to expose multiple polygons in a format that can be directly
    consumed by mapping libraries like Leaflet.

    Attributes:
        type: Always "MultiPolygon" for this type.
        coordinates: List of polygons, each containing coordinate rings.
    """

    type: Literal["MultiPolygon"]
    coordinates: list[list[list[list[float]]]]
