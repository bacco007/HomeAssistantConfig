"""GeoJSON construction from CAP area shapes — provider-neutral (issue #27).

CAP describes an ``<area>`` with any mix of ``<polygon>``, ``<circle>``, and
``<geocode>`` elements; this module turns the coordinate-bearing ones into the
GeoJSON that ``CAPAlert.geometry`` carries. It was three copies of the same
single-ring/multi-ring branch (ECCC, WMO, MeteoAlarm) before ``<circle>``
support would have made it four.

Coordinates are ``[lon, lat]`` throughout — GeoJSON order, already flipped from
CAP's ``lat,lon`` by the parser.

**Polygons win the ``geometry`` slot.** CAP 1.2 §3.2.4 defines an area carrying
several shapes as their *union*, with no precedence among them, so neither
element is more authoritative than the other. Representing that union honestly
would mean a ``GeometryCollection``, which every existing consumer — the bbox
derivation, the WMO point-in-polygon filter, the card's geometry map — would
have to learn. Instead the richer areal shape stays in ``geometry`` and points
are published alongside it in ``CAPAlert.points``, so nothing is discarded
(issue #27, option (b)). Points become the geometry only when no polygon exists
at all, which is what gives a point-only alert a usable degenerate bbox.
"""

from __future__ import annotations

from typing import Any

# A CAP circle of this radius (km) or less is a point. Radius 0 is a point by
# arithmetic, not by local convention — no source-specific rule is involved, so
# this deliberately lives here rather than in the convention table. Feeds that
# mark locations with a small *non-zero* radius would need a per-source
# threshold; none is known to, so none is offered.
POINT_RADIUS_KM = 0.0


def points_from_circles(
    circles: list[tuple[float, float, float]],
) -> list[list[float]]:
    """Return ``[[lon, lat], ...]`` for every degenerate (point) circle.

    Circles with a real radius are left out: they describe an area this module
    has no lossless GeoJSON representation for (GeoJSON has no circle type),
    and approximating them as polygons would invent precision the feed never
    published.
    """
    return [[lon, lat] for lon, lat, radius in circles if radius <= POINT_RADIUS_KM]


# Coordinate precision for the distinct-vertex test, ~0.1 m at the equator.
# Matches what the MeteoAlarm parser already used, so rings that were accepted
# before are accepted now.
_VERTEX_PRECISION = 6


def normalize_ring(ring: list[list[float]]) -> list[list[float]] | None:
    """Return ``ring`` as a valid GeoJSON linear ring, or ``None`` if it isn't one.

    Closes the ring when its first and last positions differ, and rejects it
    when fewer than three *distinct* vertices remain — the actual validity
    condition, since three distinct points closed is the smallest real polygon
    (4 positions) and a repeated coordinate is not an area at all.

    Both CAP 1.2 §3.2.4 and RFC 7946 §3.1.6 require a closed ring of 4+
    positions, but feeds do not reliably send one. Repairing beats rejecting
    here — a ring one position short of closure still describes the area the
    sender meant — which matches the fail-open posture used for marine
    classification and unknown lifecycle tokens.

    This is the choke point every ring passes through on its way to GeoJSON,
    whichever of the three parsers produced it (CAP XML, CAP-over-JSON,
    GeoRSS), so the guard cannot drift between them again (issue #85).
    """
    if not ring:
        return None
    distinct = {
        (round(pos[0], _VERTEX_PRECISION), round(pos[1], _VERTEX_PRECISION))
        for pos in ring
    }
    if len(distinct) < 3:
        return None
    if ring[0] != ring[-1]:
        return [*ring, list(ring[0])]
    return ring


def geometry_from_polygons(
    polygons: list[list[list[float]]],
) -> dict[str, Any] | None:
    """Build a GeoJSON geometry from one or more polygon rings.

    Rings are closed and validated on the way through; ones that cannot be a
    polygon are dropped rather than emitted as malformed GeoJSON.
    """
    rings = [
        normalized
        for normalized in (normalize_ring(ring) for ring in polygons)
        if normalized is not None
    ]
    if not rings:
        return None
    if len(rings) == 1:
        return {"type": "Polygon", "coordinates": [rings[0]]}
    return {"type": "MultiPolygon", "coordinates": [[ring] for ring in rings]}


def geometry_from_points(points: list[list[float]]) -> dict[str, Any] | None:
    """Build a GeoJSON ``Point``/``MultiPoint`` from ``[[lon, lat], ...]``."""
    if not points:
        return None
    if len(points) == 1:
        return {"type": "Point", "coordinates": points[0]}
    return {"type": "MultiPoint", "coordinates": points}


def geometry_from_shapes(
    polygons: list[list[list[float]]],
    points: list[list[float]] | None = None,
) -> dict[str, Any] | None:
    """Pick the geometry for an alert carrying any mix of shapes.

    Polygons take precedence; points are the fallback for alerts that publish
    no areal shape. Returns ``None`` when the alert has no coordinates at all,
    leaving it geocode-only.
    """
    return geometry_from_polygons(polygons) or geometry_from_points(points or [])
