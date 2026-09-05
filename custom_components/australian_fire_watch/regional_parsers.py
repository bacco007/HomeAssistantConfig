"""Pure adapters for official fire feeds outside New South Wales."""

from __future__ import annotations

from datetime import datetime, timezone
import json
from typing import Any

from .model import Incident, ParsedFeed
from .parsers import (
    FeedParseError,
    _centroid,
    _description_fields,
    _descendants,
    _float,
    _feature_collection,
    _geojson_warning_areas,
    _rss_channel,
    _require_properties,
    _geojson_point,
    _geojson_polygons,
    _local,
    _parse_datetime,
    _plain_html,
    _safe_xml,
    _text,
)

_FIRE_MARKERS = (
    "bushfire",
    "bush fire",
    "grass fire",
    "vegetation fire",
    "wildfire",
    "wild fire",
    "forest fire",
    "scrub fire",
    "planned burn",
    "permitted burn",
    "hazard reduction",
    "burn off",
    "burn-off",
)
_NON_BUSH_FIRE_MARKERS = (
    "structure fire",
    "building fire",
    "house fire",
    "vehicle fire",
    "car fire",
    "alarm activation",
    "fire structure",
    "fire building",
    "fire vehicle",
)


def fire_incidents_only(feed: ParsedFeed) -> ParsedFeed:
    """Retain bush/vegetation fire records without guessing from control state."""
    incidents: list[Incident] = []
    for incident in feed.incidents:
        text = f"{incident.title} {incident.incident_type} {incident.description or ''}".casefold()
        if incident.control_status.casefold() in {
            "closed",
            "complete",
            "completed",
            "finalised",
        }:
            continue
        if any(marker in text for marker in _NON_BUSH_FIRE_MARKERS):
            continue
        if (
            incident.is_fire is True
            or any(marker in text for marker in _FIRE_MARKERS)
            or (" fire " in f" {text} " and "region: cfs" in text)
        ):
            incidents.append(incident)
    return ParsedFeed(tuple(incidents), feed.generated_at, feed.metadata)


def _json(payload: bytes | str) -> Any:
    text = (
        payload.decode("utf-8-sig", errors="replace")
        if isinstance(payload, bytes)
        else payload
    )
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError) as err:
        raise FeedParseError(f"Invalid JSON: {err}") from err


def _epoch_datetime(value: object) -> datetime | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return _parse_datetime(value)
    if number > 10_000_000_000:
        number /= 1000
    try:
        return datetime.fromtimestamp(number, timezone.utc)
    except (OSError, OverflowError, ValueError):
        return None


def parse_vic_geojson(
    payload: bytes | str,
    *,
    official_url: str,
    source: str = "Emergency Management Victoria",
) -> ParsedFeed:
    """Parse Emergency Victoria's public combined event GeoJSON."""
    data = _json(payload)
    _feature_collection(data, "Victorian feed")
    incidents: list[Incident] = []
    generated: list[datetime] = []
    for index, feature in enumerate(data.get("features", [])):
        if not isinstance(feature, dict):
            continue
        props = feature.get("properties") or {}
        if not isinstance(props, dict):
            continue
        _require_properties(props, ("category1", "category2"), "Victorian event")
        category_1 = str(props.get("category1") or "")
        category_2 = str(props.get("category2") or "")
        feed_type = str(props.get("feedType") or "").casefold()
        combined = f"{category_1} {category_2} {props.get('name', '')}"
        if not any(
            marker in combined.casefold() for marker in _FIRE_MARKERS + ("fire",)
        ):
            continue
        if any(marker in combined.casefold() for marker in _NON_BUSH_FIRE_MARKERS):
            continue
        latitude, longitude = _geojson_point(feature.get("geometry"))
        polygons = _geojson_polygons(feature.get("geometry"))
        if latitude is None or longitude is None:
            latitude, longitude = _centroid(polygons)
        updated = _epoch_datetime(props.get("updated")) or _parse_datetime(
            props.get("updated")
        )
        published = _epoch_datetime(props.get("created")) or _parse_datetime(
            props.get("created")
        )
        if updated:
            generated.append(updated)
        warning = category_1 if feed_type == "warning" else "Not Applicable"
        title = str(props.get("name") or props.get("location") or "Fire incident")
        incidents.append(
            Incident(
                id=f"VIC-{props.get('id') or index}",
                title=title,
                incident_type=category_2 or category_1 or "Fire",
                warning_level=warning,
                control_status=str(props.get("status") or "Unknown"),
                is_fire=True,
                latitude=latitude,
                longitude=longitude,
                location=str(props.get("location") or "") or None,
                published_at=published,
                updated_at=updated or published,
                description=_plain_html(props.get("description")) or None,
                official_url=str(
                    props.get("webUrl") or props.get("link") or official_url
                ),
                polygons=polygons,
                warning_areas=_geojson_warning_areas(feature.get("geometry")),
                responsible_agency=source,
                sources=(source,),
            )
        )
    return ParsedFeed(
        tuple(incidents),
        max(generated) if generated else None,
        {"feature_count": len(data.get("features", []))},
    )


def parse_qld_geojson(
    payload: bytes | str,
    *,
    official_url: str,
    source: str = "Queensland Fire Department",
) -> ParsedFeed:
    """Parse Queensland's public ESCAD current-incidents GeoJSON."""
    data = _json(payload)
    _feature_collection(data, "Queensland feed")
    incidents: list[Incident] = []
    generated: list[datetime] = []
    for index, feature in enumerate(data.get("features", [])):
        if not isinstance(feature, dict):
            continue
        props = feature.get("properties") or {}
        _require_properties(props, ("GroupedType", "Type"), "Queensland incident")
        incident_type = str(props.get("GroupedType") or props.get("Type") or "")
        lowered = incident_type.casefold()
        if "fire vegetation" not in lowered and "fire permitted burn" not in lowered:
            continue
        latitude, longitude = _geojson_point(feature.get("geometry"))
        if latitude is None or longitude is None:
            latitude = _float(props.get("Latitude"))
            longitude = _float(props.get("Longitude"))
        updated = _epoch_datetime(props.get("LastUpdate"))
        published = _epoch_datetime(props.get("Response_Date"))
        if updated:
            generated.append(updated)
        location = str(props.get("Location") or props.get("Locality") or "")
        incidents.append(
            Incident(
                id=f"QLD-{props.get('Master_Incident_Number') or props.get('OBJECTID') or index}",
                title=location or incident_type or "Fire incident",
                incident_type=incident_type or "Vegetation fire",
                warning_level="Not Applicable",
                control_status=str(props.get("CurrentStatus") or "Unknown"),
                is_fire=True,
                is_planned="permitted burn" in lowered,
                latitude=latitude,
                longitude=longitude,
                location=location or None,
                council=str(props.get("Jurisdiction") or "") or None,
                published_at=published,
                updated_at=updated or published,
                official_url=official_url,
                responsible_agency=source,
                sources=(source,),
            )
        )
    return ParsedFeed(
        tuple(incidents),
        max(generated) if generated else None,
        {"feature_count": len(data.get("features", []))},
    )


def parse_qld_warning_geojson(
    payload: bytes | str,
    *,
    official_url: str,
    source: str = "Queensland Fire Department",
) -> ParsedFeed:
    """Parse the official Queensland public warning-point layer."""
    data = _json(payload)
    _feature_collection(data, "Queensland warning")
    incidents: list[Incident] = []
    generated: list[datetime] = []
    for index, feature in enumerate(data.get("features", [])):
        if not isinstance(feature, dict):
            continue
        props = feature.get("properties") or {}
        _require_properties(props, ("EventType",), "Queensland warning")
        if str(props.get("EventType") or "").casefold() != "fire":
            continue
        latitude, longitude = _geojson_point(feature.get("geometry"))
        updated = _epoch_datetime(props.get("ModifiedDate"))
        if updated:
            generated.append(updated)
        title = str(props.get("WarningTitle") or "Queensland fire warning")
        call_to_action = str(props.get("CallToAction") or "Fire warning")
        incidents.append(
            Incident(
                id=f"QLD-{props.get('UniqueID') or props.get('OBJECTID') or index}",
                title=title,
                incident_type=call_to_action,
                warning_level=props.get("WarningLevel"),
                control_status="Official warning active",
                is_fire=True,
                latitude=latitude,
                longitude=longitude,
                location=str(props.get("WarningArea") or "") or None,
                updated_at=updated,
                instruction=_plain_html(props.get("ShouldDo")) or None,
                description=_plain_html(props.get("WarningText")) or None,
                official_url=official_url,
                responsible_agency=source,
                sources=(f"{source} warnings",),
            )
        )
    return ParsedFeed(
        tuple(incidents),
        max(generated) if generated else None,
        {"feature_count": len(data.get("features", []))},
    )


def parse_nt_json(
    payload: bytes | str,
    *,
    official_url: str,
    source: str = "NT Police, Fire and Emergency Services",
) -> ParsedFeed:
    """Parse the NT PFES incident-map FeatureCollection wrapper."""
    data = _json(payload)
    collection = data.get("incidents") if isinstance(data, dict) else None
    if (
        not isinstance(collection, dict)
        or collection.get("type") != "FeatureCollection"
    ):
        raise FeedParseError("NT incidents root is not a FeatureCollection")
    _feature_collection(collection, "NT incidents")
    incidents: list[Incident] = []
    for index, feature in enumerate(collection.get("features", [])):
        if not isinstance(feature, dict):
            continue
        props = feature.get("properties") or {}
        _require_properties(
            props, ("_category", "Category", "_eventtype", "Fire Type"), "NT incident"
        )
        category = str(props.get("_category") or props.get("Category") or "")
        incident_type = str(props.get("_eventtype") or props.get("Fire Type") or "")
        status = str(props.get("_status") or props.get("Status") or "Unknown")
        combined = f"{category} {incident_type}".casefold()
        if "fire" not in combined or any(
            marker in combined for marker in _NON_BUSH_FIRE_MARKERS
        ):
            continue
        if status.casefold() in {"closed", "completed", "finalised"}:
            continue
        latitude, longitude = _geojson_point(feature.get("geometry"))
        location = str(props.get("_location") or props.get("Location") or "")
        incidents.append(
            Incident(
                id=f"NT-{props.get('_id') or props.get('id') or index}",
                title=location or incident_type or "Fire incident",
                incident_type=incident_type or category or "Fire",
                warning_level=props.get("Alert Level"),
                control_status=status,
                is_fire=True,
                latitude=latitude,
                longitude=longitude,
                location=location or None,
                published_at=_parse_datetime(props.get("_datenotified")),
                updated_at=_parse_datetime(props.get("_lastupdate")),
                official_url=official_url,
                responsible_agency=str(props.get("Responsible Agency") or source),
                sources=(source,),
            )
        )
    return ParsedFeed(
        tuple(incidents),
        _parse_datetime(data.get("lastupdated")) if isinstance(data, dict) else None,
        {"feature_count": len(collection.get("features", []))},
    )


def parse_tas_kml(
    payload: bytes | str,
    *,
    official_url: str,
    source: str = "Tasmania Fire Service",
) -> ParsedFeed:
    """Parse Tasmania Fire Service bushfire or alert KML."""
    root = _safe_xml(payload)
    if _local(root).casefold() != "kml" or not (
        _descendants(root, "Document") or _descendants(root, "Folder")
    ):
        raise FeedParseError("Expected KML Document or Folder")
    incidents: list[Incident] = []
    for index, placemark in enumerate(_descendants(root, "Placemark")):
        title = _text(placemark, "name") or "Fire incident"
        description = _text(placemark, "description")
        fields = _description_fields(description)
        coordinates = ""
        for node in placemark.iter():
            if _local(node) == "coordinates":
                tokens = "".join(node.itertext()).strip().split()
                if not tokens:
                    raise FeedParseError("Empty KML coordinates")
                coordinates = tokens[0]
                break
        latitude = longitude = None
        try:
            first, second = (float(item) for item in coordinates.split(",")[:2])
            # The current TFS feed emits latitude,longitude while conventional
            # KML is longitude,latitude. Detect the Australian longitude.
            if abs(second) > 90:
                latitude, longitude = first, second
            else:
                longitude, latitude = first, second
        except (TypeError, ValueError):
            pass
        incident_type = fields.get("TYPE") or fields.get("INCIDENT TYPE") or title
        combined = f"{title} {incident_type} {description}"
        if not any(
            marker in combined.casefold() for marker in _FIRE_MARKERS + ("fire",)
        ):
            continue
        incidents.append(
            Incident(
                id=f"TAS-{_text(placemark, 'id') or index}-{title}",
                title=title,
                incident_type=incident_type,
                warning_level=fields.get("ALERT LEVEL"),
                control_status=fields.get("STATUS", "Unknown"),
                is_fire=True,
                latitude=latitude,
                longitude=longitude,
                location=fields.get("LOCATION") or title,
                updated_at=_parse_datetime(
                    fields.get("LAST UPDATE") or fields.get("UPDATED")
                ),
                description=_plain_html(description) or None,
                official_url=official_url,
                responsible_agency=source,
                sources=(source,),
            )
        )
    return ParsedFeed(tuple(incidents), None, {"feature_count": len(incidents)})


def parse_georss(
    payload: bytes | str,
    *,
    official_url: str,
    source: str,
) -> ParsedFeed:
    """Parse a publisher-designated GeoRSS/RSS incident feed."""
    root = _safe_xml(payload)
    channel = _rss_channel(root)
    incidents: list[Incident] = []
    generated: list[datetime] = []
    records = [
        node for node in channel.iter() if _local(node).casefold() in {"item", "entry"}
    ]
    for index, item in enumerate(records):
        title = _text(item, "title") or "Fire incident"
        description = _text(item, "description") or _text(item, "summary")
        combined = f"{title} {description}"
        if not any(
            marker in combined.casefold() for marker in _FIRE_MARKERS + ("fire",)
        ):
            continue
        latitude = longitude = None
        for node in item.iter():
            local = _local(node).casefold()
            value = "".join(node.itertext()).strip()
            if local == "point":
                try:
                    latitude, longitude = (float(part) for part in value.split()[:2])
                except (TypeError, ValueError):
                    pass
            elif local in {"lat", "latitude"}:
                latitude = _float(value)
            elif local in {"long", "lon", "longitude"}:
                longitude = _float(value)
        updated = _parse_datetime(_text(item, "updated")) or _parse_datetime(
            _text(item, "pubDate")
        )
        if updated:
            generated.append(updated)
        fields = _description_fields(description)
        warning_level = fields.get("ALERT LEVEL")
        if not warning_level:
            # Some designated warning RSS feeds publish the official AWS level
            # in the item title instead of a separate field.
            folded_title = title.casefold()
            warning_level = next(
                (
                    level
                    for level in ("Emergency Warning", "Watch and Act", "Advice")
                    if level.casefold() in folded_title
                ),
                None,
            )
        identifier = _text(item, "guid") or _text(item, "id") or str(index)
        incidents.append(
            Incident(
                id=f"RSS-{identifier}",
                title=title,
                incident_type=fields.get("TYPE", "Fire"),
                warning_level=warning_level,
                control_status=fields.get("STATUS", "Unknown"),
                is_fire=True,
                latitude=latitude,
                longitude=longitude,
                location=fields.get("LOCATION") or title,
                updated_at=updated,
                description=_plain_html(description) or None,
                official_url=_text(item, "link") or official_url,
                responsible_agency=source,
                sources=(source,),
            )
        )
    return ParsedFeed(
        tuple(incidents),
        max(generated) if generated else None,
        {"feature_count": len(records)},
    )


PARSER_NAMES = {
    "vic_geojson": parse_vic_geojson,
    "qld_geojson": parse_qld_geojson,
    "qld_warning_geojson": parse_qld_warning_geojson,
    "nt_json": parse_nt_json,
    "tas_kml": parse_tas_kml,
    "georss": parse_georss,
}
