"""Shared normalization applied after provider fetch."""

from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from dataclasses import replace
from datetime import datetime, timezone
from types import MappingProxyType

from .const import BUDDHIST_ERA_OFFSET, MIN_BUDDHIST_ERA_YEAR
from .conventions import SourceConventions, conventions_for
from .icons import icon_for
from .model import CAPAlert

MAX_STATE_LENGTH = 255

# Some feeds — notably TMD, surfaced via WMO SWIC — emit Buddhist-Era years
# (Gregorian + 543) in CAP dateTime fields, e.g. "2568-08-05T22:50:00+07:00".
# Left as-is, _compute_phase never expires the alert and the card renders
# "STARTS IN 198034d". The detection threshold (MIN_BUDDHIST_ERA_YEAR) lives in
# const.py, shared with the WMO RSS-envelope correction. Only the year is
# rewritten; the time and UTC offset are preserved verbatim.
_ISO_YEAR_RE = re.compile(r"^(\d{4})(\D.*)$")

# CAP canonical severity set (RFC §2.1). Anything outside clamps to "unknown".
_CANONICAL_SEVERITIES = frozenset({"extreme", "severe", "moderate", "minor", "unknown"})

# Canonical severity ordering, ascending. Public because providers that have to
# pick the most severe of several records (the MeteoAlarm episode merge) must
# rank with the same ladder normalization uses — two ladders would drift apart
# silently. Note "unknown" sits at the bottom, so a MeteoAlarm green (which maps
# to "unknown", not "minor") can never outrank a real warning.
SEVERITY_RANK: Mapping[str, int] = MappingProxyType(
    {"unknown": 0, "minor": 1, "moderate": 2, "severe": 3, "extreme": 4}
)

# Default for ``_compute_phase``'s terminal-token argument: a source that
# declares no lifecycle vocabulary retires nothing.
_NO_TERMINAL_STATUSES: Mapping[str, str] = MappingProxyType({})


def normalize_alerts(alerts: list[CAPAlert], entry_id: str = "") -> list[CAPAlert]:
    """Apply shared normalization to a list of provider-parsed alerts.

    ``entry_id`` namespaces each alert's ``geometry_ref`` so config entries
    that share a provider don't evict one another's geometry from the shared
    store. Defaults to "" for callers that don't externalize geometry.
    """
    now = datetime.now(timezone.utc)
    return [_normalize(a, now, entry_id) for a in alerts]


def count_by_onset(alerts: Sequence[CAPAlert], now: datetime) -> tuple[int, int]:
    """Split ``alerts`` into ``(active, upcoming)`` counts on ``onset``.

    An alert whose ``onset`` parses to a timestamp later than ``now`` is
    upcoming; everything else is active, including an alert with no ``onset``
    at all — a feed that omits it is describing something already in force
    (issue #99). An unparseable ``onset`` falls the same way, since the
    alternative is hiding a live warning behind a formatting quirk.
    """
    upcoming = 0
    for alert in alerts:
        onset_at = _parse_iso(alert.onset)
        if onset_at is not None and onset_at > now:
            upcoming += 1
    return len(alerts) - upcoming, upcoming


def _geometry_ref(alert: CAPAlert, entry_id: str) -> str:
    """Build the externalized-geometry handle, or "" when no geometry.

    Namespaced by config entry: the geometry store is a process-wide
    singleton shared across entries, so two entries on the same provider
    would otherwise mint identical ``{provider}:{id}`` refs and each entry's
    purge would evict the other's polygons (RFC §2.4).
    """
    if not alert.geometry:
        return ""
    scope = f"{entry_id}:" if entry_id else ""
    return f"{scope}{alert.provider}:{alert.id}"


def _normalize(alert: CAPAlert, now: datetime, entry_id: str = "") -> CAPAlert:
    """Normalize a single alert. Returns a new frozen instance."""
    sent = _gregorian(alert.sent)
    effective = _gregorian(alert.effective)
    onset = _gregorian(alert.onset)
    expires = _gregorian(alert.expires)
    conventions = conventions_for(alert.provider, alert.sender)
    return replace(
        alert,
        sent=sent,
        effective=effective,
        onset=onset,
        expires=expires,
        event=_truncate_state(alert.event),
        severity_normalized=_normalize_severity(alert, conventions),
        phase=_compute_phase(
            expires,
            alert.msg_type,
            now,
            alert.lifecycle_status,
            conventions.lifecycle_removal_reasons,
        ),
        icon=icon_for(alert),
        bbox=_bbox_from_geometry(alert.geometry),
        geometry_ref=_geometry_ref(alert, entry_id),
    )


def _normalize_severity(alert: CAPAlert, conventions: SourceConventions) -> str:
    """Map provider-native severity to lowercase CAP canonical value.

    CAP canonical: extreme, severe, moderate, minor, unknown. Any value
    outside that set — including provider-specific strings — clamps to
    "unknown" so the entity state stays on the five-value axis that the
    frontend styles against (RFC §2.1).

    A source's own derivation (NWS VTEC, MeteoAlarm awareness colour) gets
    first refusal via the convention table; returning ``None`` — no such
    signal, or an unrecognized one — falls through to CAP ``severity``.
    """
    raw = conventions.severity(alert) if conventions.severity else None
    if raw is None:
        raw = alert.severity.lower() if alert.severity else "unknown"
    return raw if raw in _CANONICAL_SEVERITIES else "unknown"


def _gregorian(value: str) -> str:
    """Rewrite a Buddhist-Era year in a CAP dateTime to Gregorian.

    Returns ``value`` unchanged when it lacks a leading 4-digit year or the
    year is already Gregorian (< 2400). Only the year is touched; month, day,
    time, and UTC offset are preserved verbatim — the Thai solar calendar is
    Gregorian apart from the era number (BE = CE + 543).
    """
    if not value:
        return value
    m = _ISO_YEAR_RE.match(value)
    if m is None:
        return value
    year = int(m.group(1))
    if year < MIN_BUDDHIST_ERA_YEAR:
        return value
    return f"{year - BUDDHIST_ERA_OFFSET:04d}{m.group(2)}"


def _compute_phase(
    expires: str,
    msg_type: str,
    now: datetime,
    lifecycle_status: str = "",
    terminal_statuses: Mapping[str, str] = _NO_TERMINAL_STATUSES,
) -> str:
    """Lifecycle phase: terminal if past ``expires`` or ended early, else msg_type.

    ``lifecycle_status`` is the provider-supplied termination hint (see
    ``CAPAlert.lifecycle_status``). Some feeds never signal end-of-life through
    ``msgType`` — ECCC keeps ``Update`` and marks the area group ``ended`` in a
    CAP parameter instead, leaving an hour of ``expires`` still on the clock —
    so a terminal status retires the alert regardless of ``msg_type``.

    The two terminal phases are not interchangeable, and which one applies is
    decided by the clock rather than by the signal that revealed it (issue #95):

    * ``expired`` — the alert ran to its ``expires`` timestamp. Checked first,
      so an alert already past its expiry stays ``expired`` even if the feed
      also marks it ended.
    * ``cancel`` — the alert ended before that timestamp. A consumer cannot
      infer this from ``expires`` alone, which is exactly why it has to survive
      into the event payload: ending early is news, reaching a published expiry
      is not.

    This mirrors ``store._infer_terminal_phase``, which already calls a silently
    vanished alert ``cancel`` when its ``expires`` is still in the future. A
    provider that *announces* an early end must not land on a worse phase than
    one that simply drops the record.

    ``terminal_statuses`` comes from the source's convention table entry — its
    ``lifecycle_removal_reasons``, whose keys are the terminal tokens and whose
    values say why the alert went away (``store`` publishes those as
    ``removal_reason``; only the keys matter here). Scoping it to the source
    means one feed's vocabulary can never retire another's alerts. Values
    outside it — including the empty default every source without such a signal
    supplies — fall through unchanged.
    """
    expires_at = _parse_iso(expires)
    if expires_at is not None and now > expires_at:
        return "expired"
    if lifecycle_status and lifecycle_status in terminal_statuses:
        return "cancel"
    return _normalize_phase(msg_type)


def _normalize_phase(msg_type: str) -> str:
    """Map msg_type to lowercase lifecycle phase.

    Known CAP msg_types map: ``Alert → new``, ``Update → update``,
    ``Cancel → cancel``. Any other value (provider-specific vocabulary such
    as ECCC's ``Actual``, or a missing field) defaults to ``"new"`` so the
    RFC §2.1 guarantee that ``phase`` is always one of
    ``{new, update, cancel, expired}`` is never broken.
    """
    return {
        "Alert": "new",
        "Update": "update",
        "Cancel": "cancel",
    }.get(msg_type, "new")


def _parse_iso(value: str) -> datetime | None:
    """Parse an ISO 8601 timestamp; return None on any failure."""
    if not value:
        return None
    try:
        # datetime.fromisoformat handles offsets in 3.11+; normalize 'Z'.
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _bbox_from_geometry(
    geometry: dict | None,
) -> tuple[float, float, float, float] | None:
    """Return ``(min_lon, min_lat, max_lon, max_lat)`` from a GeoJSON geometry.

    Supports Point, MultiPoint, LineString, Polygon, MultiPolygon. Returns
    ``None`` when geometry is missing, malformed, or contains no usable
    coordinates.

    A point-only alert yields a degenerate bbox (``[lon, lat, lon, lat]``),
    which is the shape the card derives a location from (issue #27).
    """
    if not geometry:
        return None
    gtype = geometry.get("type")
    coords = geometry.get("coordinates")
    if coords is None:
        return None

    points: list[tuple[float, float]] = []
    try:
        if gtype == "Point":
            points.append((float(coords[0]), float(coords[1])))
        elif gtype in ("MultiPoint", "LineString"):
            for c in coords:
                points.append((float(c[0]), float(c[1])))
        elif gtype == "Polygon":
            for ring in coords:
                for c in ring:
                    points.append((float(c[0]), float(c[1])))
        elif gtype == "MultiPolygon":
            for poly in coords:
                for ring in poly:
                    for c in ring:
                        points.append((float(c[0]), float(c[1])))
        else:
            return None
    except (TypeError, ValueError, IndexError):
        return None

    if not points:
        return None

    lons = [p[0] for p in points]
    lats = [p[1] for p in points]
    return (min(lons), min(lats), max(lons), max(lats))


def _truncate_state(value: str) -> str:
    """Truncate to HA's 255-character state limit."""
    if len(value) <= MAX_STATE_LENGTH:
        return value
    return value[: MAX_STATE_LENGTH - 1] + "\u2026"
