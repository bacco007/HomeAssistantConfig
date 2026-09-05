"""Warning-area membership and great-circle boundary distances.

Coordinates are latitude/longitude. Polygon rings retain their holes. The
point-in-ring test is intended for the Australian publisher geometries (not
antimeridian-spanning global polygons); boundary distances are spherical.
"""

from __future__ import annotations

from math import asin, atan2, cos, radians, sin, sqrt

Point = tuple[float, float]
Ring = tuple[Point, ...]
Area = tuple[Ring, ...]
EARTH_RADIUS_KM = 6371.0088


def _distance(a: Point, b: Point) -> float:
    lat1, lat2 = radians(a[0]), radians(b[0])
    dlat, dlon = lat2 - lat1, radians(b[1] - a[1])
    value = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * asin(sqrt(min(1.0, max(0.0, value))))


def _bearing(a: Point, b: Point) -> float:
    lat1, lat2 = radians(a[0]), radians(b[0])
    dlon = radians(b[1] - a[1])
    return atan2(
        sin(dlon) * cos(lat2), cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dlon)
    )


def _segment_distance(point: Point, start: Point, end: Point) -> float:
    length = _distance(start, end)
    if length < 1e-9:
        return _distance(point, start)
    angular = _distance(start, point) / EARTH_RADIUS_KM
    angle = _bearing(start, point) - _bearing(start, end)
    along = atan2(sin(angular) * cos(angle), cos(angular)) * EARTH_RADIUS_KM
    if along < 0 or along > length:
        return min(_distance(point, start), _distance(point, end))
    cross = sin(angular) * sin(angle)
    return abs(asin(min(1.0, max(-1.0, cross))) * EARTH_RADIUS_KM)


def _in_ring(point: Point, ring: Ring) -> bool:
    latitude, longitude = point
    inside = False
    for start, end in zip(ring, (*ring[1:], ring[0]), strict=True):
        y1, x1 = start
        y2, x2 = end
        if (y1 > latitude) != (y2 > latitude):
            intersection = x1 + (latitude - y1) * (x2 - x1) / (y2 - y1)
            if longitude < intersection:
                inside = not inside
    return inside


def warning_area_distance(
    point: Point, areas: tuple[Area, ...]
) -> tuple[float | None, bool | None]:
    """Return distance to the published area and whether the point is in it."""
    nearest: float | None = None
    for area in areas:
        if not area or len(area[0]) < 3:
            continue
        rings = tuple(ring for ring in area if len(ring) >= 3)
        boundary = min(
            _segment_distance(point, start, end)
            for ring in rings
            for start, end in zip(ring, (*ring[1:], ring[0]), strict=True)
        )
        # Treat the exact published boundary as part of the warning area.
        if boundary <= 1e-6 or (
            _in_ring(point, rings[0])
            and not any(_in_ring(point, hole) for hole in rings[1:])
        ):
            return 0.0, True
        nearest = boundary if nearest is None else min(nearest, boundary)
    return nearest, False if nearest is not None else None
