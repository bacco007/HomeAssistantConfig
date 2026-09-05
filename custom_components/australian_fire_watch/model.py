"""Pure incident models, ranking, distance and lifecycle logic."""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import date, datetime
from enum import StrEnum
from hashlib import sha1
from math import asin, atan2, cos, degrees, radians, sin, sqrt
from typing import Any, Iterable, Mapping

from .geometry import Area, warning_area_distance


class WarningLevel(StrEnum):
    """Australian Warning System fire-warning categories."""

    NOT_APPLICABLE = "Not Applicable"
    ADVICE = "Advice"
    WATCH_AND_ACT = "Watch and Act"
    EMERGENCY_WARNING = "Emergency Warning"
    UNKNOWN = "Unknown"


WARNING_RANK: dict[str, int] = {
    # Unknown is neutral, never below an explicit Not Applicable category.
    WarningLevel.UNKNOWN: 0,
    WarningLevel.NOT_APPLICABLE: 0,
    WarningLevel.ADVICE: 1,
    WarningLevel.WATCH_AND_ACT: 2,
    WarningLevel.EMERGENCY_WARNING: 3,
}

CONTROL_RANK = {
    "out of control": 3,
    "not yet controlled": 3,
    "being controlled": 2,
    "under control": 1,
}

FIRE_DANGER_RANK = {
    "unknown": -1,
    "no rating": 0,
    "moderate": 1,
    "high": 2,
    "extreme": 3,
    "catastrophic": 4,
}


def normalize_warning(value: object) -> str:
    """Return the official display value without inventing a warning."""
    text = " ".join(str(value or "").replace("&", "and").split()).casefold()
    aliases = {
        "emergency warning": WarningLevel.EMERGENCY_WARNING,
        "emergency": WarningLevel.EMERGENCY_WARNING,
        "watch and act": WarningLevel.WATCH_AND_ACT,
        "watch act": WarningLevel.WATCH_AND_ACT,
        "advice": WarningLevel.ADVICE,
        "not applicable": WarningLevel.NOT_APPLICABLE,
        "n/a": WarningLevel.NOT_APPLICABLE,
        "na": WarningLevel.NOT_APPLICABLE,
        "": WarningLevel.UNKNOWN,
        "unknown": WarningLevel.UNKNOWN,
    }
    return str(aliases.get(text, WarningLevel.UNKNOWN))


def normalize_danger(value: object) -> str:
    """Normalize AFDRS labels. Unknown never becomes No Rating."""
    text = " ".join(str(value or "").replace("_", " ").split()).casefold()
    aliases = {
        "none": "No Rating",
        "no rating": "No Rating",
        "low moderate": "Moderate",
        "moderate": "Moderate",
        "high": "High",
        "very high": "High",
        "severe": "Extreme",
        "extreme": "Extreme",
        "catastrophic": "Catastrophic",
        "code red": "Catastrophic",
    }
    return aliases.get(text, "Unknown")


def is_planned_activity(incident_type: str, title: str = "") -> bool:
    """Classify explicitly planned/hazard-reduction work separately."""
    value = f"{incident_type} {title}".casefold()
    return any(
        marker in value
        for marker in (
            "hazard reduction",
            "planned burn",
            "planned event",
            "burn off",
            "burn-off",
            "cultural burn",
            "pile burn",
        )
    )


def _safe_text(value: object, limit: int = 500) -> str:
    return " ".join(str(value or "").split())[:limit]


@dataclass(frozen=True, slots=True)
class Incident:
    """Normalized fire incident. Warning, control and distance remain separate."""

    id: str
    title: str
    incident_type: str = "Unknown"
    warning_level: str = str(WarningLevel.UNKNOWN)
    control_status: str = "Unknown"
    is_fire: bool | None = None
    is_planned: bool = False
    latitude: float | None = None
    longitude: float | None = None
    distance_km: float | None = None
    direction: str | None = None
    location: str | None = None
    council: str | None = None
    published_at: datetime | None = None
    updated_at: datetime | None = None
    expires_at: datetime | None = None
    size_ha: float | None = None
    responsible_agency: str | None = None
    instruction: str | None = None
    description: str | None = None
    official_url: str | None = None
    polygons: tuple[tuple[tuple[float, float], ...], ...] = ()
    sources: tuple[str, ...] = ()
    warning_areas: tuple[Area, ...] = ()
    distance_to_warning_area_km: float | None = None
    within_warning_area: bool | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "id", _safe_text(self.id, 160))
        object.__setattr__(
            self, "title", _safe_text(self.title, 180) or "Unnamed incident"
        )
        object.__setattr__(
            self, "incident_type", _safe_text(self.incident_type, 100) or "Unknown"
        )
        object.__setattr__(self, "warning_level", normalize_warning(self.warning_level))
        object.__setattr__(
            self, "control_status", _safe_text(self.control_status, 100) or "Unknown"
        )
        object.__setattr__(
            self,
            "is_planned",
            bool(
                self.is_planned or is_planned_activity(self.incident_type, self.title)
            ),
        )

    @property
    def warning_rank(self) -> int:
        return WARNING_RANK.get(self.warning_level, -1)

    @property
    def control_rank(self) -> int:
        return CONTROL_RANK.get(self.control_status.casefold(), 0)

    @property
    def material_signature(self) -> tuple[Any, ...]:
        """Fields that justify an update alert; feed timestamps alone do not."""
        return (
            self.warning_level,
            self.control_status.casefold(),
            self.incident_type.casefold(),
            self.is_fire,
            self.is_planned,
            (self.instruction or "").casefold(),
            self.within_warning_area,
        )

    @property
    def alert_distance_km(self) -> float | None:
        """Use the warning area for relevance, never its representative marker."""
        if self.warning_rank > 0 and self.distance_to_warning_area_km is not None:
            return self.distance_to_warning_area_km
        return self.distance_km

    def with_home(self, latitude: float, longitude: float) -> "Incident":
        distance = direction = None
        if self.latitude is not None and self.longitude is not None:
            distance = haversine_km(latitude, longitude, self.latitude, self.longitude)
            direction = compass_direction(
                latitude, longitude, self.latitude, self.longitude
            )
        area_distance = within = None
        if self.warning_rank > 0:
            areas = self.warning_areas or tuple((ring,) for ring in self.polygons)
            area_distance, within = warning_area_distance((latitude, longitude), areas)
        return replace(
            self,
            distance_km=distance,
            direction=direction,
            distance_to_warning_area_km=area_distance,
            within_warning_area=within,
        )

    def as_dict(
        self,
        *,
        entity_id: str | None = None,
        acknowledged: bool = False,
        snoozed_until: str | None = None,
    ) -> dict[str, Any]:
        return {
            "id": self.id,
            "entity_id": entity_id,
            "title": self.title,
            "type": self.incident_type,
            "warning_level": self.warning_level,
            "control_status": self.control_status,
            "distance_km": None
            if self.distance_km is None
            else round(self.distance_km, 1),
            "direction": self.direction,
            "distance_to_warning_area_km": self.distance_to_warning_area_km,
            "within_warning_area": self.within_warning_area,
            "alert_distance_km": self.alert_distance_km,
            "location": self.location,
            "council": self.council,
            "updated_at": _iso(self.updated_at),
            "published_at": _iso(self.published_at),
            "expires_at": _iso(self.expires_at),
            "size_ha": self.size_ha,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "official_url": self.official_url,
            "is_fire": self.is_fire,
            "is_planned": self.is_planned,
            "has_warning_polygon": bool(self.polygons),
            "sources": list(self.sources),
            "acknowledged": acknowledged,
            "snoozed_until": snoozed_until,
        }


@dataclass(frozen=True, slots=True)
class ParsedFeed:
    """Result from a pure feed parser."""

    incidents: tuple[Incident, ...] = ()
    generated_at: datetime | None = None
    metadata: Mapping[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class LifecycleEvent:
    """A deduplicated material incident transition."""

    incident_id: str
    lifecycle: str
    incident: Incident | None
    previous: Mapping[str, Any] | None = None
    qualifies_for_alert: bool = False


@dataclass(frozen=True, slots=True)
class DangerLifecycleEvent:
    """A material AFDRS/Total Fire Ban transition for one calendar date."""

    danger_id: str
    lifecycle: str
    danger: Mapping[str, Any]
    previous: Mapping[str, Any] | None = None
    qualifies_for_alert: bool = False


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in kilometres."""
    earth_radius_km = 6371.0088
    p1, p2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(p1) * cos(p2) * sin(dlambda / 2) ** 2
    return earth_radius_km * 2 * asin(sqrt(min(1.0, max(0.0, a))))


def compass_direction(lat1: float, lon1: float, lat2: float, lon2: float) -> str:
    """Return the incident's bearing from home as a 16-point compass label."""
    p1, p2 = radians(lat1), radians(lat2)
    dlambda = radians(lon2 - lon1)
    y = sin(dlambda) * cos(p2)
    x = cos(p1) * sin(p2) - sin(p1) * cos(p2) * cos(dlambda)
    bearing = (degrees(atan2(y, x)) + 360) % 360
    labels = (
        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
    )
    return labels[int((bearing + 11.25) // 22.5) % 16]


def priority_key(incident: Incident) -> tuple[Any, ...]:
    """Rank warning first, then proximity and control status.

    Planned activity is always segregated behind active incidents. Unknown
    distance sorts last and never implies low risk.
    """
    distance = (
        incident.distance_km if incident.distance_km is not None else float("inf")
    )
    updated = incident.updated_at.timestamp() if incident.updated_at else 0.0
    return (
        1 if incident.is_planned else 0,
        -incident.warning_rank,
        -(1 if incident.is_fire else 0),
        -incident.control_rank,
        distance,
        -updated,
        incident.title.casefold(),
    )


def sort_incidents(incidents: Iterable[Incident]) -> list[Incident]:
    """Return incidents in alert/hero priority order."""
    return sorted(incidents, key=priority_key)


def distance_key(incident: Incident) -> tuple[Any, ...]:
    """Rank a display list by proximity, with unknown distances last.

    Warning priority is only a deterministic tie-breaker here. Alerting and the
    highest-priority incident continue to use :func:`priority_key`.
    """
    distance = (
        incident.distance_km if incident.distance_km is not None else float("inf")
    )
    updated = incident.updated_at.timestamp() if incident.updated_at else 0.0
    return (
        distance,
        -incident.warning_rank,
        -(1 if incident.is_fire else 0),
        -incident.control_rank,
        -updated,
        incident.title.casefold(),
    )


def sort_incidents_by_distance(incidents: Iterable[Incident]) -> list[Incident]:
    """Return incidents nearest first for maps and human-scannable lists."""
    return sorted(incidents, key=distance_key)


def radius_band(distance_km: float | None) -> int:
    """Stable proximity bands used only to detect meaningful approach."""
    if distance_km is None:
        return 5
    for index, radius in enumerate((10.0, 20.0, 50.0, 100.0)):
        if distance_km <= radius:
            return index
    return 4


def incident_snapshot(incident: Incident, *, qualified: bool = False) -> dict[str, Any]:
    """Minimal persistent record used for lifecycle classification."""
    return {
        "warning_level": incident.warning_level,
        "warning_rank": incident.warning_rank,
        "control_status": incident.control_status,
        "material_signature": list(incident.material_signature),
        "distance_band": radius_band(incident.alert_distance_km),
        "within_warning_area": incident.within_warning_area,
        "distance_km": incident.distance_km,
        "title": incident.title,
        "qualified": bool(qualified),
        "missing_count": 0,
    }


def classify_transition(previous: Mapping[str, Any], current: Incident) -> str | None:
    """Classify a material change without conflating warning and control."""
    previous_warning = int(previous.get("warning_rank", -1))
    previous_band = int(previous.get("distance_band", 5))
    if (
        current.warning_rank > previous_warning
        or radius_band(current.alert_distance_km) < previous_band
        or (
            current.within_warning_area is True
            and previous.get("within_warning_area") is not True
        )
    ):
        return "escalated"
    if current.warning_rank < previous_warning:
        return "deescalated"
    previous_signature = tuple(previous.get("material_signature", ()))
    if len(previous_signature) == 6:
        previous_signature = (*previous_signature, None)  # 1.0.0 stored signature
    if current.material_signature != previous_signature:
        return "updated"
    return None


def track_incident_lifecycle(
    records: Mapping[str, Mapping[str, Any]],
    incidents: Iterable[Incident],
    qualified_ids: Iterable[str],
    *,
    baseline_complete: bool,
    authoritative_incidents: Iterable[Incident] | None = None,
    allow_missing_updates: bool = True,
    allow_deescalation: bool = True,
) -> tuple[dict[str, dict[str, Any]], tuple[LifecycleEvent, ...], bool]:
    """Advance incident records using one confirmed-current feed snapshot.

    Missing incidents are retained for one healthy snapshot. A resolution is
    emitted only on the second consecutive healthy snapshot, and it carries the
    last persisted radius qualification even though no current Incident remains.
    """
    incident_items = tuple(incidents)
    current = {incident.id: incident for incident in incident_items}
    authoritative = {
        incident.id: incident
        for incident in (
            authoritative_incidents
            if authoritative_incidents is not None
            else incident_items
        )
    }
    qualified = set(qualified_ids)
    previous_records = {str(key): dict(value) for key, value in records.items()}

    if not baseline_complete:
        established = {
            incident_id: incident_snapshot(incident, qualified=incident_id in qualified)
            for incident_id, incident in current.items()
        }
        return established, (), True

    next_records: dict[str, dict[str, Any]] = {}
    events: list[LifecycleEvent] = []
    for incident_id, incident in current.items():
        is_qualified = incident_id in qualified
        previous = previous_records.get(incident_id)
        if previous is None:
            events.append(
                LifecycleEvent(
                    incident_id,
                    "new",
                    incident,
                    None,
                    is_qualified,
                )
            )
        else:
            transition = classify_transition(previous, incident)
            if not allow_deescalation and incident.warning_rank < int(
                previous.get("warning_rank", 0)
            ):
                # Partial source availability can add/escalate, but it cannot
                # overwrite a known warning with a weaker representation.
                next_records[incident_id] = dict(previous)
                continue
            # The configured radius may be any value, not just one of the
            # generic display bands used by classify_transition.
            if is_qualified and not bool(previous.get("qualified", False)):
                transition = "escalated"
            if transition:
                events.append(
                    LifecycleEvent(
                        incident_id,
                        transition,
                        incident,
                        dict(previous),
                        is_qualified,
                    )
                )
        next_records[incident_id] = incident_snapshot(incident, qualified=is_qualified)

    for incident_id in set(previous_records) - set(current):
        record = dict(previous_records[incident_id])
        if incident_id in authoritative:
            if not allow_missing_updates:
                next_records[incident_id] = record
                continue
            events.append(
                LifecycleEvent(
                    incident_id,
                    "left_radius",
                    authoritative[incident_id],
                    dict(record),
                    bool(record.get("qualified", False)),
                )
            )
            continue
        if not allow_missing_updates:
            # One current representation is enough to add/escalate, but
            # absence only advances when both full publisher products agree.
            next_records[incident_id] = record
            continue
        record["missing_count"] = int(record.get("missing_count", 0)) + 1
        if record["missing_count"] >= 2:
            events.append(
                LifecycleEvent(
                    incident_id,
                    "resolved",
                    None,
                    dict(record),
                    bool(record.get("qualified", False)),
                )
            )
        else:
            next_records[incident_id] = record

    return next_records, tuple(events), True


def incident_event_summary(event: LifecycleEvent) -> str:
    """Return cautious lifecycle wording suitable for events/notifications."""
    if event.lifecycle == "left_radius" and event.incident is not None:
        return f"{event.incident.title} moved outside the configured monitor radius"
    if event.incident is not None:
        return f"{event.incident.warning_level}: {event.incident.title}"
    title = _safe_text((event.previous or {}).get("title"), 180) or event.incident_id
    return f"{title} is no longer in current feed after two healthy snapshots"


def incident_notification_priority(event: LifecycleEvent, *, test: bool = False) -> str:
    """Return normal, time-sensitive, or critical incident delivery."""
    if test or event.lifecycle in {"deescalated", "resolved", "left_radius"}:
        return "normal"
    if event.incident is None:
        return "normal"
    if event.incident.warning_level == WarningLevel.EMERGENCY_WARNING:
        return "critical"
    if event.incident.warning_level == WarningLevel.WATCH_AND_ACT:
        return "time_sensitive"
    return "normal"


def authoritative_incident_snapshot_valid(
    *,
    response_received: bool,
    parsed_count: int,
    advertised_count: int,
    existing_record_count: int,
    empty_corroborated: bool = False,
) -> bool:
    """Gate absence tracking on a structurally complete authoritative feed.

    A successful-but-partial parser result cannot age incidents toward resolved.
    An unexpected empty statewide dataset also cannot clear an existing baseline.
    """
    return bool(
        response_received
        and advertised_count >= 0
        and parsed_count == advertised_count
        and (parsed_count > 0 or existing_record_count == 0 or empty_corroborated)
    )


def fire_danger_rank(value: object) -> int:
    """Return the ordered AFDRS rank, keeping Unknown below No Rating."""
    return FIRE_DANGER_RANK[normalize_danger(value).casefold()]


def danger_day_records(danger: Mapping[str, Any]) -> dict[str, dict[str, Any]]:
    """Normalize today/tomorrow danger details, keyed by calendar date.

    Date keys prevent a published tomorrow declaration alerting again merely
    because it becomes today. Unknown values remain explicit.
    """
    district = _safe_text(danger.get("district"), 120) or "Unknown district"
    records: dict[str, dict[str, Any]] = {}
    for period in ("today", "tomorrow"):
        raw = danger.get(period)
        if not isinstance(raw, Mapping):
            continue
        date_text = _safe_text(raw.get("date"), 10)
        try:
            date.fromisoformat(date_text)
        except ValueError:
            continue
        rating = normalize_danger(raw.get("rating"))
        raw_ban = raw.get("total_fire_ban")
        total_fire_ban = raw_ban if isinstance(raw_ban, bool) else None
        rating_rank = fire_danger_rank(rating)
        qualifies = bool(
            total_fire_ban is True or rating_rank >= FIRE_DANGER_RANK["high"]
        )
        records[date_text] = {
            "id": date_text,
            "period": period,
            "date": date_text,
            "district": district,
            "rating": rating,
            "rating_rank": rating_rank,
            "total_fire_ban": total_fire_ban,
            "issued_at": raw.get("issued_at"),
            "rating_source": raw.get("rating_source"),
            "qualifies": qualifies,
            "fingerprint": [rating, total_fire_ban],
        }
    return records


def _effective_danger_record(
    current: Mapping[str, Any], previous: Mapping[str, Any] | None
) -> dict[str, Any]:
    """Retain known fields when a current publisher field becomes unknown."""
    result = dict(current)
    if previous:
        if result.get("rating") == "Unknown":
            result["rating"] = normalize_danger(previous.get("rating"))
        if result.get("total_fire_ban") is None:
            previous_ban = previous.get("total_fire_ban")
            result["total_fire_ban"] = (
                previous_ban if isinstance(previous_ban, bool) else None
            )
    rating = normalize_danger(result.get("rating"))
    ban = result.get("total_fire_ban")
    result["rating"] = rating
    result["rating_rank"] = fire_danger_rank(rating)
    result["qualifies"] = bool(
        ban is True or result["rating_rank"] >= FIRE_DANGER_RANK["high"]
    )
    result["fingerprint"] = [rating, ban]
    return result


def classify_danger_transition(
    previous: Mapping[str, Any], current: Mapping[str, Any]
) -> str | None:
    """Classify only alert-relevant AFDRS/Total Fire Ban changes."""
    became_current_critical = bool(
        previous.get("period") == "tomorrow"
        and current.get("period") == "today"
        and (
            current.get("total_fire_ban") is True
            or int(current.get("rating_rank", -1)) >= FIRE_DANGER_RANK["catastrophic"]
        )
    )
    if became_current_critical:
        # A tomorrow declaration was time-sensitive. Once it becomes today's
        # Catastrophic/TFB declaration, deliberately upgrade to critical.
        return "escalated"
    if tuple(previous.get("fingerprint", ())) == tuple(current.get("fingerprint", ())):
        return None
    previous_qualified = bool(previous.get("qualifies", False))
    current_qualified = bool(current.get("qualifies", False))
    if not previous_qualified and not current_qualified:
        return None
    if current_qualified and not previous_qualified:
        return "escalated"
    if previous_qualified and not current_qualified:
        return "resolved"

    previous_rank = int(previous.get("rating_rank", -1))
    current_rank = int(current.get("rating_rank", -1))
    ban_started = (
        previous.get("total_fire_ban") is not True
        and current.get("total_fire_ban") is True
    )
    ban_ended = (
        previous.get("total_fire_ban") is True
        and current.get("total_fire_ban") is False
    )
    if ban_started or (current_rank > previous_rank and not ban_ended):
        return "escalated"
    if ban_ended or current_rank < previous_rank:
        return "deescalated"
    return "updated"


def track_danger_lifecycle(
    records: Mapping[str, Mapping[str, Any]],
    danger: Mapping[str, Any],
    *,
    baseline_complete: bool,
) -> tuple[dict[str, dict[str, Any]], tuple[DangerLifecycleEvent, ...], bool]:
    """Advance date-keyed danger records after one healthy RFS snapshot."""
    previous_records = {str(key): dict(value) for key, value in records.items()}
    raw_current = danger_day_records(danger)
    current = {
        danger_id: _effective_danger_record(item, previous_records.get(danger_id))
        for danger_id, item in raw_current.items()
    }
    if not baseline_complete:
        return current, (), True

    events: list[DangerLifecycleEvent] = []
    for danger_id, item in current.items():
        previous = previous_records.get(danger_id)
        if previous is None:
            if item.get("qualifies"):
                events.append(
                    DangerLifecycleEvent(
                        danger_id,
                        "new",
                        item,
                        None,
                        True,
                    )
                )
            continue
        transition = classify_danger_transition(previous, item)
        if transition:
            events.append(
                DangerLifecycleEvent(
                    danger_id,
                    transition,
                    item,
                    dict(previous),
                    bool(item.get("qualifies") or previous.get("qualifies", False)),
                )
            )
    return current, tuple(events), True


def danger_notification_priority(
    danger: Mapping[str, Any], lifecycle: str, *, test: bool = False
) -> str:
    """Classify danger delivery urgency without critical tests or clears.

    Current-day Catastrophic or Total Fire Ban is critical. Tomorrow declarations
    and Extreme are time-sensitive. High, de-escalation, resolution, and every
    test remain normal.
    """
    if test or lifecycle in {"deescalated", "resolved"}:
        return "normal"
    rating = normalize_danger(danger.get("rating"))
    total_fire_ban = danger.get("total_fire_ban") is True
    if danger.get("period") == "today" and (rating == "Catastrophic" or total_fire_ban):
        return "critical"
    if rating in {"Extreme", "Catastrophic"} or total_fire_ban:
        return "time_sensitive"
    return "normal"


def incident_entity_id(entry_id: str, incident_id: str) -> str:
    """Return a deterministic geo_location entity id for dashboard maps."""
    digest = sha1(incident_id.encode("utf-8"), usedforsecurity=False).hexdigest()[:12]
    return f"geo_location.australian_fire_watch_{entry_id[:8].lower()}_{digest}"
