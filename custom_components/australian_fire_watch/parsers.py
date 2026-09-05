"""Pure parsers for documented NSW RFS and BOM public products."""

from __future__ import annotations

from dataclasses import replace
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
import json
import re
from typing import Any, Iterable
from urllib.parse import urlparse
from xml.etree import ElementTree as ET
from zoneinfo import ZoneInfo

from .const import OFFICIAL_INCIDENTS_URL
from .model import Incident, ParsedFeed, normalize_danger, normalize_warning

_TAG_RE = re.compile(r"<[^>]+>")
_TABLE_FIELD_RE = re.compile(
    r"<th\b[^>]*>(.*?)</th>\s*<td\b[^>]*>(.*?)</td>",
    re.IGNORECASE | re.DOTALL,
)
_BREAK_RE = re.compile(r"<\s*br\s*/?\s*>", re.IGNORECASE)
_LABEL_RE = re.compile(
    r"(?:^|\n)\s*([A-Za-z][A-Za-z /_-]{1,40}):\s*(.*?)"
    r"(?=(?:\n\s*[A-Za-z][A-Za-z /_-]{1,40}:)|$)",
    re.DOTALL,
)


class FeedParseError(ValueError):
    """Raised when an official feed is malformed or unsafe."""


def _safe_xml(payload: bytes | str) -> ET.Element:
    data = (
        payload.decode("utf-8-sig", errors="replace")
        if isinstance(payload, bytes)
        else payload
    )
    if "<!DOCTYPE" in data.upper() or "<!ENTITY" in data.upper():
        raise FeedParseError("DTD/entity declarations are not accepted")
    try:
        return ET.fromstring(data)
    except ET.ParseError as err:
        raise FeedParseError(f"Invalid XML: {err}") from err


def _local(element: ET.Element) -> str:
    return element.tag.rsplit("}", 1)[-1]


def _children(element: ET.Element, name: str) -> list[ET.Element]:
    return [child for child in element if _local(child) == name]


def _descendants(element: ET.Element, name: str) -> list[ET.Element]:
    return [child for child in element.iter() if _local(child) == name]


def _text(element: ET.Element, name: str, default: str = "") -> str:
    for child in element:
        if _local(child) == name:
            return "".join(child.itertext()).strip()
    return default


def _parse_datetime(
    value: object, *, assume_nsw_local: bool = False
) -> datetime | None:
    text = str(value or "").strip()
    if not text:
        return None
    candidates = (text, text.replace("Z", "+00:00"))
    for candidate in candidates:
        try:
            result = datetime.fromisoformat(candidate)
            if result.tzinfo is None:
                result = result.replace(
                    tzinfo=ZoneInfo("Australia/Sydney")
                    if assume_nsw_local
                    else timezone.utc
                )
            return result.astimezone(timezone.utc)
        except ValueError:
            pass
    try:
        result = parsedate_to_datetime(text)
        if result.tzinfo is None:
            result = result.replace(
                tzinfo=ZoneInfo("Australia/Sydney")
                if assume_nsw_local
                else timezone.utc
            )
        return result.astimezone(timezone.utc)
    except (TypeError, ValueError, OverflowError):
        pass
    for fmt in ("%d/%m/%Y %I:%M:%S %p", "%d %b %Y %H:%M", "%d/%m/%Y %H:%M:%S"):
        try:
            result = datetime.strptime(text, fmt)
            return result.replace(
                tzinfo=ZoneInfo("Australia/Sydney")
                if assume_nsw_local
                else timezone.utc
            ).astimezone(timezone.utc)
        except ValueError:
            continue
    return None


def _plain_html(value: object) -> str:
    # Some official feeds XML-escape an entire HTML table. Decode before
    # stripping tags so those tags do not leak into entity attributes.
    text = unescape(str(value or ""))
    text = _BREAK_RE.sub("\n", text)
    text = _TAG_RE.sub(" ", text)
    return "\n".join(
        " ".join(line.split()) for line in unescape(text).splitlines() if line.strip()
    )


def _description_fields(value: object) -> dict[str, str]:
    decoded = unescape(str(value or ""))
    fields = {
        " ".join(_plain_html(key).replace("_", " ").split()).upper(): " ".join(
            _plain_html(item).split()
        )
        for key, item in _TABLE_FIELD_RE.findall(decoded)
        if _plain_html(key) and _plain_html(item)
    }
    plain = _plain_html(decoded)
    fields.update(
        {
            " ".join(key.replace("_", " ").split()).upper(): " ".join(item.split())
            for key, item in _LABEL_RE.findall(plain)
        }
    )
    return fields


def _bool(value: object) -> bool | None:
    text = str(value or "").strip().casefold()
    if text in {"yes", "true", "1"}:
        return True
    if text in {"no", "false", "0"}:
        return False
    return None


def _float(value: object) -> float | None:
    if value is None:
        return None
    match = re.search(r"-?\d+(?:\.\d+)?", str(value).replace(",", ""))
    if not match:
        return None
    try:
        return float(match.group())
    except ValueError:
        return None


def _valid_coordinate(latitude: float | None, longitude: float | None) -> bool:
    return (
        latitude is not None
        and longitude is not None
        and -90 <= latitude <= 90
        and -180 <= longitude <= 180
    )


def _parse_cap_polygon(value: str) -> tuple[tuple[float, float], ...]:
    points: list[tuple[float, float]] = []
    for token in value.split():
        try:
            latitude_text, longitude_text = token.split(",", 1)
            latitude, longitude = float(latitude_text), float(longitude_text)
        except (ValueError, TypeError):
            continue
        if _valid_coordinate(latitude, longitude):
            points.append((latitude, longitude))
    return tuple(points)


def _centroid(
    polygons: Iterable[tuple[tuple[float, float], ...]],
) -> tuple[float | None, float | None]:
    points = [point for polygon in polygons for point in polygon]
    if not points:
        return None, None
    return sum(p[0] for p in points) / len(points), sum(p[1] for p in points) / len(
        points
    )


def parse_cap(
    payload: bytes | str,
    *,
    source: str = "NSW RFS CAP",
    official_url: str = OFFICIAL_INCIDENTS_URL,
) -> ParsedFeed:
    """Parse CAP-AU alerts embedded in an EDXL distribution."""
    root = _safe_xml(payload)
    if _local(root).casefold() not in {"distribution", "edxldistribution", "alert"}:
        raise FeedParseError("Expected CAP alert or EDXL distribution")
    generated_at = _parse_datetime(_text(root, "dateTimeSent"))
    alerts = _descendants(root, "alert")
    if not alerts and generated_at is None:
        raise FeedParseError("Empty CAP distribution has no generation timestamp")
    complete = True
    incidents: list[Incident] = []
    for alert in alerts:
        # CAP explicitly distinguishes live publisher information from Test,
        # Exercise, Draft and System messages. Unknown/missing status also
        # fails closed: none of those records may become a household alert.
        status = _text(alert, "status").casefold()
        if status != "actual":
            if status not in {"test", "exercise", "draft", "system"}:
                complete = False
            continue
        info_nodes = _children(alert, "info")
        if not info_nodes:
            raise FeedParseError("Actual CAP alert has no info block")
        info = info_nodes[0]
        parameters = {
            _text(node, "valueName").casefold(): _text(node, "value")
            for node in _children(info, "parameter")
            if _text(node, "valueName")
        }
        description = _text(info, "description")
        fields = _description_fields(description)
        areas = _children(info, "area")
        polygons = tuple(
            polygon
            for area in areas
            for node in _children(area, "polygon")
            if (polygon := _parse_cap_polygon("".join(node.itertext()).strip()))
        )
        latitude: float | None = None
        longitude: float | None = None
        for area in areas:
            circles = _children(area, "circle")
            if not circles:
                continue
            parts = "".join(circles[0].itertext()).strip().split()
            if not parts:
                continue
            try:
                latitude, longitude = map(float, parts[0].split(",", 1))
            except (TypeError, ValueError):
                latitude = longitude = None
            if _valid_coordinate(latitude, longitude):
                break
        if not _valid_coordinate(latitude, longitude):
            latitude, longitude = _centroid(polygons)

        incident_id = _text(alert, "incidents") or _text(alert, "identifier")
        if not incident_id:
            raise FeedParseError("Actual CAP alert has no incident identifier")
        warning = parameters.get("alertlevel") or fields.get("ALERT LEVEL")
        incident_type = (
            parameters.get("incidenttype")
            or fields.get("TYPE")
            or _text(info, "event")
            or "Unknown"
        )
        area_description = _text(areas[0], "areaDesc") if areas else ""
        updated = _parse_datetime(_text(alert, "sent")) or _parse_datetime(
            _text(info, "effective")
        )
        incidents.append(
            Incident(
                id=incident_id,
                title=parameters.get("incidentname")
                or _text(info, "headline")
                or area_description,
                incident_type=incident_type,
                warning_level=warning,
                control_status=parameters.get("status")
                or fields.get("STATUS")
                or "Unknown",
                is_fire=_bool(parameters.get("isfire") or fields.get("FIRE")),
                latitude=latitude,
                longitude=longitude,
                location=area_description or fields.get("LOCATION"),
                council=parameters.get("councilarea") or fields.get("COUNCIL AREA"),
                published_at=_parse_datetime(_text(info, "effective")) or updated,
                updated_at=updated,
                expires_at=_parse_datetime(_text(info, "expires")),
                size_ha=_float(parameters.get("fireground") or fields.get("SIZE")),
                responsible_agency=parameters.get("controlauthority")
                or fields.get("RESPONSIBLE AGENCY"),
                instruction=_plain_html(_text(info, "instruction")) or None,
                description=_plain_html(description) or None,
                official_url=_text(info, "web") or official_url,
                polygons=polygons,
                warning_areas=tuple((ring,) for ring in polygons),
                sources=(source,),
            )
        )
    return ParsedFeed(
        tuple(incidents),
        generated_at,
        {
            "distribution_id": _text(root, "distributionID"),
            "feature_count": len(alerts),
            "snapshot_complete": complete,
        },
    )


def _feature_collection(data: Any, label: str) -> list[dict[str, Any]]:
    """Reject malformed/truncated products before filtering incident types."""
    if not isinstance(data, dict) or data.get("type") != "FeatureCollection":
        raise FeedParseError(f"{label} root is not a FeatureCollection")
    features = data.get("features")
    if not isinstance(features, list):
        raise FeedParseError(f"{label} features must be an explicit array")
    collection_properties = data.get("properties") or {}
    if not isinstance(collection_properties, dict):
        raise FeedParseError(f"{label} has invalid collection properties")
    if data.get("exceededTransferLimit") or collection_properties.get(
        "exceededTransferLimit"
    ):
        raise FeedParseError(f"{label} is truncated by the publisher")
    for feature in features:
        if not isinstance(feature, dict) or not isinstance(
            feature.get("properties"), dict
        ):
            raise FeedParseError(f"{label} has an invalid feature/properties record")
        geometry = feature.get("geometry")
        if geometry is not None and not isinstance(geometry, dict):
            raise FeedParseError(f"{label} has invalid geometry")
    return features


def _require_properties(
    properties: dict[str, Any], keys: tuple[str, ...], label: str
) -> None:
    """A renamed discriminator is a schema failure, not a non-fire incident."""
    if not any(properties.get(key) not in (None, "") for key in keys):
        raise FeedParseError(
            f"{label} record is missing expected fields: {', '.join(keys)}"
        )


def _rss_channel(root: ET.Element) -> ET.Element:
    """Require a real RSS channel or Atom feed, including valid empty feeds."""
    if _local(root).casefold() == "feed":
        return root
    if _local(root).casefold() == "rss":
        channels = _children(root, "channel")
        if len(channels) == 1:
            return channels[0]
    raise FeedParseError("Expected an RSS channel or Atom feed")


def _flatten_geojson_geometries(geometry: Any) -> Iterable[dict[str, Any]]:
    if not isinstance(geometry, dict):
        return
    geometry_type = str(geometry.get("type", ""))
    if geometry_type == "GeometryCollection":
        for child in geometry.get("geometries", []):
            yield from _flatten_geojson_geometries(child)
    else:
        yield geometry


def _geojson_point(geometry: Any) -> tuple[float | None, float | None]:
    for item in _flatten_geojson_geometries(geometry):
        if item.get("type") != "Point":
            continue
        coordinates = item.get("coordinates", [])
        if not isinstance(coordinates, list) or len(coordinates) < 2:
            continue
        try:
            longitude, latitude = float(coordinates[0]), float(coordinates[1])
        except (ValueError, TypeError):
            continue
        if _valid_coordinate(latitude, longitude):
            return latitude, longitude
    return None, None


def _geojson_polygons(geometry: Any) -> tuple[tuple[tuple[float, float], ...], ...]:
    polygons: list[tuple[tuple[float, float], ...]] = []
    for item in _flatten_geojson_geometries(geometry):
        geometry_type = item.get("type")
        coordinates = item.get("coordinates")
        rings: list[Any] = []
        if geometry_type == "Polygon" and isinstance(coordinates, list):
            rings = coordinates
        elif geometry_type == "MultiPolygon" and isinstance(coordinates, list):
            rings = [ring for polygon in coordinates for ring in polygon]
        for ring in rings:
            points: list[tuple[float, float]] = []
            for point in ring if isinstance(ring, list) else []:
                try:
                    longitude, latitude = float(point[0]), float(point[1])
                except (IndexError, TypeError, ValueError):
                    continue
                if _valid_coordinate(latitude, longitude):
                    points.append((latitude, longitude))
            if points:
                polygons.append(tuple(points))
    return tuple(polygons)


def _geojson_warning_areas(geometry: Any) -> tuple:
    """Preserve exterior/interior rings; holes must not become warning areas."""
    areas = []
    for item in _flatten_geojson_geometries(geometry):
        coordinates = item.get("coordinates", [])
        groups = (
            [coordinates]
            if item.get("type") == "Polygon"
            else (coordinates if item.get("type") == "MultiPolygon" else [])
        )
        for group in groups:
            rings = _geojson_polygons({"type": "Polygon", "coordinates": group})
            if rings:
                areas.append(rings)
    return tuple(areas)


def _id_from_guid(guid: str, fallback: str) -> str:
    path = urlparse(guid).path.rstrip("/")
    candidate = path.rsplit("/", 1)[-1] if path else ""
    return candidate or guid or fallback


def parse_geojson(payload: bytes | str) -> ParsedFeed:
    """Parse the documented NSW RFS current-incidents GeoJSON fallback."""
    data_text = (
        payload.decode("utf-8-sig", errors="replace")
        if isinstance(payload, bytes)
        else payload
    )
    try:
        data = json.loads(data_text)
    except (json.JSONDecodeError, TypeError) as err:
        raise FeedParseError(f"Invalid GeoJSON: {err}") from err
    _feature_collection(data, "NSW GeoJSON")
    incidents: list[Incident] = []
    generated_candidates: list[datetime] = []
    for index, feature in enumerate(data.get("features", [])):
        if not isinstance(feature, dict):
            continue
        properties = feature.get("properties") or {}
        if not isinstance(properties, dict):
            continue
        _require_properties(
            properties, ("guid", "title", "description"), "NSW incident"
        )
        description = properties.get("description", "")
        fields = _description_fields(description)
        latitude, longitude = _geojson_point(feature.get("geometry"))
        polygons = _geojson_polygons(feature.get("geometry"))
        if not _valid_coordinate(latitude, longitude):
            latitude, longitude = _centroid(polygons)
        published = _parse_datetime(properties.get("pubDate"))
        # The HTML description's UPDATED field is a NSW wall-clock value with
        # no UTC offset. Interpret it in Australia/Sydney so AEST/AEDT records
        # do not appear 10/11 hours in the future.
        updated = (
            _parse_datetime(fields.get("UPDATED"), assume_nsw_local=True) or published
        )
        if published:
            generated_candidates.append(published)
        guid = str(properties.get("guid") or "")
        title = str(
            properties.get("title") or fields.get("LOCATION") or "Unnamed incident"
        )
        incidents.append(
            Incident(
                id=_id_from_guid(guid, f"geojson-{index}-{title}"),
                title=title,
                incident_type=fields.get("TYPE", "Unknown"),
                warning_level=properties.get("category") or fields.get("ALERT LEVEL"),
                control_status=fields.get("STATUS", "Unknown"),
                is_fire=_bool(fields.get("FIRE")),
                latitude=latitude,
                longitude=longitude,
                location=fields.get("LOCATION"),
                council=fields.get("COUNCIL AREA"),
                published_at=published,
                updated_at=updated,
                size_ha=_float(fields.get("SIZE")),
                responsible_agency=fields.get("RESPONSIBLE AGENCY"),
                description=_plain_html(description) or None,
                official_url=str(properties.get("link") or OFFICIAL_INCIDENTS_URL),
                polygons=polygons,
                warning_areas=_geojson_warning_areas(feature.get("geometry")),
                sources=("NSW RFS GeoJSON",),
            )
        )
    generated_at = max(generated_candidates) if generated_candidates else None
    return ParsedFeed(
        tuple(incidents), generated_at, {"feature_count": len(data.get("features", []))}
    )


def _prefer(primary: Any, secondary: Any) -> Any:
    return (
        primary
        if primary not in (None, "", (), "Unknown", str(normalize_warning(None)))
        else secondary
    )


def merge_incidents(
    primary: Iterable[Incident],
    fallback: Iterable[Incident] = (),
    supplemental: Iterable[Incident] = (),
) -> tuple[Incident, ...]:
    """Merge official representations by stable incident ID.

    CAP fields win normally. A higher supplemental official warning is retained,
    and polygon geometry is unioned. Control status is never used as warning.
    """
    merged: dict[str, Incident] = {incident.id: incident for incident in primary}
    for candidate in (*tuple(fallback), *tuple(supplemental)):
        current = merged.get(candidate.id)
        if current is None:
            merged[candidate.id] = candidate
            continue
        warning = current.warning_level
        warning_ranks = {
            "Unknown": 0,
            "Not Applicable": 0,
            "Advice": 1,
            "Watch and Act": 2,
            "Emergency Warning": 3,
        }
        if warning_ranks.get(candidate.warning_level, -1) > warning_ranks.get(
            warning, -1
        ):
            warning = candidate.warning_level
        polygons = tuple(dict.fromkeys((*current.polygons, *candidate.polygons)))
        merged[current.id] = replace(
            current,
            title=_prefer(current.title, candidate.title),
            incident_type=_prefer(current.incident_type, candidate.incident_type),
            warning_level=warning,
            control_status=_prefer(current.control_status, candidate.control_status),
            is_fire=current.is_fire
            if current.is_fire is not None
            else candidate.is_fire,
            latitude=current.latitude
            if current.latitude is not None
            else candidate.latitude,
            longitude=current.longitude
            if current.longitude is not None
            else candidate.longitude,
            location=_prefer(current.location, candidate.location),
            council=_prefer(current.council, candidate.council),
            published_at=current.published_at or candidate.published_at,
            updated_at=max(
                filter(None, (current.updated_at, candidate.updated_at)), default=None
            ),
            expires_at=current.expires_at or candidate.expires_at,
            size_ha=current.size_ha
            if current.size_ha is not None
            else candidate.size_ha,
            responsible_agency=_prefer(
                current.responsible_agency, candidate.responsible_agency
            ),
            instruction=_prefer(current.instruction, candidate.instruction),
            description=_prefer(current.description, candidate.description),
            official_url=_prefer(current.official_url, candidate.official_url),
            polygons=polygons,
            warning_areas=tuple(
                dict.fromkeys((*current.warning_areas, *candidate.warning_areas))
            ),
            sources=tuple(dict.fromkeys((*current.sources, *candidate.sources))),
        )
    return tuple(merged.values())


def parse_rfs_fire_danger(payload: bytes | str) -> dict[str, dict[str, Any]]:
    """Parse RFS today/tomorrow FDR and Total Fire Ban source-of-truth."""
    root = _safe_xml(payload)
    if _local(root) != "FireDangerMap" or not _descendants(root, "District"):
        raise FeedParseError("Expected a FireDangerMap containing districts")
    source_date = _parse_datetime(
        _text(root, "MapDate") or _text(root, "Date"), assume_nsw_local=True
    )
    districts: dict[str, dict[str, Any]] = {}
    for district in _descendants(root, "District"):
        name = _text(district, "Name")
        if not name or not any(
            _children(district, tag)
            for tag in (
                "DangerLevelToday",
                "FireBanToday",
                "DangerLevelTomorrow",
                "FireBanTomorrow",
            )
        ):
            raise FeedParseError("Incomplete fire-danger district record")
        districts[name] = {
            "source_date": source_date.astimezone(ZoneInfo("Australia/Sydney"))
            .date()
            .isoformat()
            if source_date
            else None,
            "region_number": _text(district, "RegionNumber") or None,
            "councils": [
                item.strip()
                for item in _text(district, "Councils").split(";")
                if item.strip()
            ],
            "today": {
                "rating": normalize_danger(_text(district, "DangerLevelToday")),
                "total_fire_ban": _bool(_text(district, "FireBanToday")),
                "source": "NSW RFS",
            },
            "tomorrow": {
                "rating": normalize_danger(_text(district, "DangerLevelTomorrow")),
                "total_fire_ban": _bool(_text(district, "FireBanTomorrow")),
                "source": "NSW RFS",
            },
        }
    return districts


def parse_bom_fire_danger(payload: bytes | str) -> dict[str, Any]:
    """Parse BOM public product IDN10016 (four-day FBI/FDR for NSW)."""
    root = _safe_xml(payload)
    if _local(root) != "product" or not _descendants(root, "amoc"):
        raise FeedParseError("Expected a BOM product with issue metadata")
    amoc_nodes = _descendants(root, "amoc")
    amoc = amoc_nodes[0] if amoc_nodes else root
    result: dict[str, Any] = {
        "identifier": _text(amoc, "identifier"),
        "issued_at": _parse_datetime(
            _text(amoc, "issue-time-local") or _text(amoc, "issue-time-utc")
        ),
        "districts": {},
    }
    for area in _descendants(root, "area"):
        if area.attrib.get("type") != "fire-district":
            continue
        name = area.attrib.get("description", "").strip()
        forecasts: list[dict[str, Any]] = []
        for period in _children(area, "forecast-period"):
            fbi: float | None = None
            rating = "Unknown"
            for node in period:
                node_type = node.attrib.get("type")
                if _local(node) == "element" and node_type == "fire_behaviour_index":
                    fbi = _float("".join(node.itertext()))
                elif _local(node) == "text" and node_type == "fire_danger":
                    rating = normalize_danger("".join(node.itertext()))
            forecasts.append(
                {
                    "index": int(period.attrib.get("index", len(forecasts) + 1)),
                    "date": period.attrib.get("start-time-local", "")[:10] or None,
                    "start_time": period.attrib.get("start-time-local")
                    or period.attrib.get("start-time-utc"),
                    "rating": rating,
                    "fbi": None
                    if fbi is None
                    else int(fbi)
                    if fbi.is_integer()
                    else fbi,
                    "source": "BOM IDN10016",
                }
            )
        if name:
            result["districts"][name] = sorted(
                forecasts, key=lambda item: item["index"]
            )
    return result


def parse_bom_fire_weather_warnings(payload: bytes | str) -> ParsedFeed:
    """Parse NSW/ACT BOM warning RSS, retaining only fire-weather items."""
    root = _safe_xml(payload)
    channel = _rss_channel(root)
    generated_at = _parse_datetime(
        _text(channel, "lastBuildDate") or _text(channel, "pubDate")
    )
    warnings: list[dict[str, Any]] = []
    for item in _children(channel, "item"):
        title = _text(item, "title")
        if "fire weather" not in title.casefold():
            continue
        warnings.append(
            {
                "id": _text(item, "guid") or _text(item, "link") or title,
                "title": title,
                "link": _text(item, "link"),
                "published_at": (
                    _parse_datetime(_text(item, "pubDate")) or generated_at
                ),
            }
        )
    serializable = [
        {
            **item,
            "published_at": item["published_at"].isoformat()
            if item["published_at"]
            else None,
        }
        for item in warnings
    ]
    return ParsedFeed((), generated_at, {"warnings": serializable})
