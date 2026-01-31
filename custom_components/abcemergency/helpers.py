"""Helper functions for ABC Emergency integration.

This module provides utility functions for geographic calculations,
including distance, bearing, and compass direction conversions.
"""

from __future__ import annotations

import math

from .const import INCIDENT_TYPE_TO_RADIUS_CATEGORY, RadiusCategoryLiteral

# Earth's radius in kilometers
EARTH_RADIUS_KM = 6371.0


def calculate_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """Calculate distance between two points in kilometers using Haversine formula.

    The Haversine formula determines the great-circle distance between two points
    on a sphere given their longitudes and latitudes.

    Args:
        lat1: Latitude of first point in degrees.
        lon1: Longitude of first point in degrees.
        lat2: Latitude of second point in degrees.
        lon2: Longitude of second point in degrees.

    Returns:
        Distance between the two points in kilometers.
    """
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    # Haversine formula
    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return EARTH_RADIUS_KM * c


def get_bearing(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """Calculate initial bearing from point 1 to point 2 in degrees.

    The bearing is the direction you would need to travel from point 1
    to reach point 2, measured clockwise from north.

    Args:
        lat1: Latitude of first point in degrees.
        lon1: Longitude of first point in degrees.
        lat2: Latitude of second point in degrees.
        lon2: Longitude of second point in degrees.

    Returns:
        Bearing in degrees (0-360), where 0 is north, 90 is east, etc.
    """
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lon = math.radians(lon2 - lon1)

    x = math.sin(delta_lon) * math.cos(lat2_rad)
    y = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(
        lat2_rad
    ) * math.cos(delta_lon)

    bearing_rad = math.atan2(x, y)
    bearing_deg = math.degrees(bearing_rad)

    # Normalize to 0-360
    return (bearing_deg + 360) % 360


def bearing_to_direction(bearing: float) -> str:
    """Convert bearing in degrees to compass direction.

    Args:
        bearing: Bearing in degrees (any value, will be normalized).

    Returns:
        One of 8 compass directions: N, NE, E, SE, S, SW, W, NW.
    """
    # Normalize bearing to 0-360
    bearing = bearing % 360

    # Each direction covers 45 degrees, centered on the cardinal/intercardinal points
    # N: 337.5 - 22.5 (includes 0)
    # NE: 22.5 - 67.5
    # E: 67.5 - 112.5
    # SE: 112.5 - 157.5
    # S: 157.5 - 202.5
    # SW: 202.5 - 247.5
    # W: 247.5 - 292.5
    # NW: 292.5 - 337.5

    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

    # Add 22.5 to shift the boundaries (so 0 is center of N, not edge)
    # Then divide by 45 to get the index
    index = int((bearing + 22.5) / 45) % 8

    return directions[index]


def get_radius_category(event_type: str) -> RadiusCategoryLiteral:
    """Get the radius category for an incident event type.

    Maps incident types from the API to radius categories used for
    per-type radius configuration.

    Args:
        event_type: The event type string from the API (e.g., "Bushfire", "Flood").

    Returns:
        The radius category for this event type.
    """
    return INCIDENT_TYPE_TO_RADIUS_CATEGORY.get(event_type, "other")


# Approximate bounding boxes for Australian states/territories
# Format: (min_lat, max_lat, min_lon, max_lon)
STATE_BOUNDING_BOXES: dict[str, tuple[float, float, float, float]] = {
    "act": (-35.92, -35.12, 148.76, 149.40),  # ACT
    "nsw": (-37.50, -28.16, 140.99, 153.64),  # NSW
    "nt": (-26.00, -10.97, 129.00, 138.00),  # NT
    "qld": (-29.18, -10.69, 138.00, 153.55),  # QLD
    "sa": (-38.06, -26.00, 129.00, 141.00),  # SA
    "tas": (-43.65, -39.45, 143.82, 148.48),  # TAS
    "vic": (-39.20, -33.98, 140.96, 149.98),  # VIC
    "wa": (-35.13, -13.69, 112.92, 129.00),  # WA
}


def get_state_from_coordinates(latitude: float, longitude: float) -> str | None:
    """Determine which Australian state/territory contains a coordinate.

    Uses approximate bounding boxes to determine the likely state.
    ACT is checked first as it's enclosed within NSW.

    Args:
        latitude: Latitude in degrees.
        longitude: Longitude in degrees (will be normalized to -180 to 180).

    Returns:
        State code (e.g., 'nsw', 'vic') or None if outside Australia.
    """
    # Normalize longitude to -180 to 180 range (fixes issue #105)
    while longitude > 180:
        longitude -= 360
    while longitude < -180:
        longitude += 360

    # Check ACT first as it's enclosed by NSW
    act_box = STATE_BOUNDING_BOXES["act"]
    if act_box[0] <= latitude <= act_box[1] and act_box[2] <= longitude <= act_box[3]:
        return "act"

    # Check other states
    for state_code, bbox in STATE_BOUNDING_BOXES.items():
        if state_code == "act":
            continue  # Already checked
        if bbox[0] <= latitude <= bbox[1] and bbox[2] <= longitude <= bbox[3]:
            return state_code

    return None
