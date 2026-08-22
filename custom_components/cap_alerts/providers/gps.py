"""Shared GPS point-filtering helpers.

One home for the pieces a provider's GPS location mode needs: parsing the
``"lat,lon"`` config string, the ray-cast point-in-polygon test, and reading
polygon rings back off a built ``CAPAlert`` geometry. WMO, MeteoAlarm and
GDACS use all three; ECCC tests raw CAP rings before any geometry is built,
so it takes only the ray-cast and keeps its own config parsing.

The ray-cast had been copied into every provider that needed it — three of
them before this module existed, identical in what they computed and drifting
only in their comments — so a fix to the algorithm had three places to land,
and each new provider with a GPS mode added another.
"""

from __future__ import annotations

from ..model import CAPAlert


def parse_gps(value: str) -> tuple[float, float] | None:
    """Extract ``(lat, lon)`` from a ``"lat,lon"`` config string."""
    if not value:
        return None
    try:
        parts = value.split(",")
        return float(parts[0].strip()), float(parts[1].strip())
    except (ValueError, IndexError):
        return None


def point_in_polygon(lat: float, lon: float, polygon: list[list[float]]) -> bool:
    """Ray-casting point-in-polygon test. Polygon is ``[[lon, lat], ...]``."""
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i][0], polygon[i][1]  # lon, lat
        xj, yj = polygon[j][0], polygon[j][1]
        if ((yi > lat) != (yj > lat)) and (
            lon < (xj - xi) * (lat - yi) / (yj - yi) + xi
        ):
            inside = not inside
        j = i
    return inside


def alert_polygons(alert: CAPAlert) -> list[list[list[float]]]:
    """Extract the polygon rings stored on a CAPAlert geometry."""
    geom = alert.geometry
    if not geom:
        return []
    gtype = geom.get("type")
    coords = geom.get("coordinates")
    if not coords:
        return []
    if gtype == "Polygon":
        return [coords[0]] if coords else []
    if gtype == "MultiPolygon":
        return [poly[0] for poly in coords if poly]
    return []
