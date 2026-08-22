"""Per-source convention table — declarative interpretive rules (issue #82).

A *convention* is an encoding that is true for one alert source and meaningless
everywhere else: which area-code prefixes denote water, which lifecycle token
means "this is over", how a source spells severity. They are not CAP 1.2; they
are local habits layered on top of it.

The governing split is **parse faithfully, interpret separately**. Providers and
``providers/cap.py`` reproduce what a feed actually published, losing nothing;
this module holds the interpretation applied on top. That keeps the shared CAP
parser spec-pure — safe for every provider to reuse — and keeps ``normalize.py``
source-agnostic, since it consults the table rather than hard-coding one
source's vocabulary.

The pattern mirrors ``model._CANONICAL_SCHEMES``: conventions are *data*, so
adding a source is a table entry rather than a new branch in shared code, and a
source that publishes no such signal simply omits the field instead of being
silently absent from an ``if`` somewhere.

Entries are keyed by source, **not** by provider. A single provider can carry
several dialects — MeteoAlarm relays every EUMETNET member, and MeteoFrance
alone needs its own identity, green-marker, and episode handling — so
``conventions_for()`` resolves ``provider/sender`` before falling back to
``provider``. A sender-scoped entry *replaces* the provider's rather than
layering on top of it, so it restates every rule it still wants: the
MeteoFrance entry repeats the MeteoAlarm severity derivation for that reason.

Where two senders share a shape but not its details, the *difference* becomes
data rather than a second implementation. Both MeteoFrance and FMI split one
continuous episode across several messages, so both declare an
``EpisodeDialect``; all they disagree on is what makes consecutive messages one
episode (a run of forecast days vs. a run of touching windows), so that
predicate is the declared field and the rest of the pipeline is shared.

Two hook shapes cover what a dialect can do. Most rules are per-alert
callables — ``severity``, ``identity``, ``keep`` — and stay pure functions of
one alert. The two that cannot be (splitting one message into several,
collapsing several into one) are list-shaped ``PipelineStage`` entries bound to
a named slot in the fetch. The provider owns the order and decides where the
slots sit; conventions declare stages, they never reorder the fetch:

    construct → [identity] → [explode] → [keep] → mode filters → [merge] → return

Every constraint in that order is load-bearing:

* **identity** first — it feeds entity ids, and everything downstream keys on
  them.
* **explode** before **keep** — markers are dropped per exploded region.
* **keep** before the provider's mode filters, so all three MeteoAlarm modes
  are equally protected.
* **merge** last, immediately before the fetch returns. It must precede the
  alert store, which keys incoming alerts by id and would silently drop one of
  any pair sharing the window-free id the merge produces.
"""

from __future__ import annotations

import hashlib
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass, field, replace
from datetime import date, datetime, timezone
from types import MappingProxyType
from typing import Literal

from .const import REMOVAL_REASON_ENDED, REMOVAL_REASON_SUPERSEDED
from .model import CAPAlert, geocodes_from

# ---------------------------------------------------------------------------
# Source-specific vocabularies
# ---------------------------------------------------------------------------

# UGC area prefixes (first two chars of a zone code) that denote marine/water
# zones — coastal/offshore waters, Great Lakes, and high-seas areas. These are
# disjoint from the US state/territory postal codes used for land zones, so a
# prefix test never misclassifies a land alert. A newly minted marine-area code
# would need to be added here; until then such an alert classifies as land
# (fail-open — a marine alert is shown, never a non-marine alert hidden).
NWS_MARINE_UGC_PREFIXES: frozenset[str] = frozenset(
    {
        "AM",  # Western North Atlantic / Caribbean / Gulf offshore
        "AN",  # Atlantic coastal/offshore
        "GM",  # Gulf of Mexico
        "LC",  # Lake St. Clair
        "LE",  # Lake Erie
        "LH",  # Lake Huron
        "LM",  # Lake Michigan
        "LO",  # Lake Ontario
        "LS",  # Lake Superior
        "PH",  # Hawaiian coastal/offshore
        "PK",  # Alaskan coastal
        "PM",  # Western Pacific (Marianas)
        "PS",  # American Samoa
        "PZ",  # Pacific coastal/offshore
        "SL",  # St. Lawrence River
    }
)

# ECCC Canadian Location Codes are province-numbered for land zones; marine and
# water zones are the "00…" block.
ECCC_MARINE_CLC_PREFIX = "00"

# ECCC ``Alert_Location_Status`` tokens that mean the alert has reached
# end-of-life for the area it was selected for, whatever its ``msgType`` and
# ``expires`` still say, each mapped to what it means for a consumer. Unknown
# values are deliberately absent so an unfamiliar token degrades to msg_type
# handling rather than silently retiring a live alert.
#
# The keys are also the terminal set — "this token ends the alert" and "here is
# why" are one fact, so they are one declaration (issue #108). ``ended`` is an
# all-clear for this area group; ``transitioned_out`` means the area moved to a
# different alert, whose own ``incident_created`` carries the same news.
ECCC_LIFECYCLE_REMOVAL_REASONS: Mapping[str, str] = MappingProxyType(
    {
        "ended": REMOVAL_REASON_ENDED,
        "transitioned_out": REMOVAL_REASON_SUPERSEDED,
    }
)

# VTEC significance → severity tier (NWS).
_VTEC_SIG_SEVERITY = {
    "W": "severe",  # Warning
    "A": "moderate",  # Watch
    "Y": "minor",  # Advisory
    "S": "unknown",  # Statement
}

# Phenomena codes that escalate a Warning to "extreme".
_VTEC_EXTREME_PHENOMENA = {"TO", "EW"}  # Tornado, Extreme Wind

# MeteoAlarm awareness color → CAP canonical tier. Green has no analogue on
# the canonical axis (no "none" tier), so it lands on the neutral "unknown"
# rather than the misleading "minor".
_METEOALARM_AWARENESS_TO_SEVERITY = {
    "green": "unknown",
    "yellow": "moderate",
    "orange": "severe",
    "red": "extreme",
}

# Region-selectable geocode schemes in priority order: EUMETNET canonical
# region id first, then NUTS3 (department/county) preferred over NUTS2 (region)
# when both are present. The first scheme present on an area is what the region
# picker offers and the region filter matches. Sub-region cell schemes
# (WARNCELLID, CISORP) always co-occur with one of these and are stored in
# ``geocodes`` but never offered in the picker. ``areaDesc`` is a last resort
# when a feed names areas but carries no region-selectable scheme.
METEOALARM_REGION_SCHEMES: tuple[str, ...] = ("EMMA_ID", "NUTS3", "NUTS2")

# MeteoFrance publishes via MeteoAlarm with a per-message CAP identifier that
# embeds an issue timestamp, so every re-issue of the same logical warning mints
# a fresh identifier (issue #37). Identity for this sender alone is derived from
# a content key (see ``episode_id``); every other authority keeps the
# per-message identifier hash, whose collisions there are genuinely-distinct
# concurrent warnings, not re-issues.
METEOFRANCE_SENDER = "vigilance@meteo.fr"

# The Finnish Meteorological Institute, the second sender to split a continuous
# warning across messages (issue #98). Its split is at the window edge rather
# than the calendar day, which is the whole reason the run predicate is
# declared per dialect — see ``EpisodeDialect``.
FMI_SENDER = "cap@fmi.fi"


# ---------------------------------------------------------------------------
# Parameter accessors
# ---------------------------------------------------------------------------


def meteoalarm_awareness_type_code(parameters: Mapping[str, str] | None) -> str:
    """Language-independent phenomenon key: the leading token of the
    ``awareness_type`` parameter (``"3; Thunderstorm"`` → ``"3"``).

    MeteoAlarm CAP Profile v2.0 §2.2.17 defines the value as ``code + "; " +
    label``, and the label is the same hazard spelled however the member
    service prefers — live feeds carry both ``"1; Wind"`` and ``"1; wind"`` —
    so the code is the only stable key. Returns ``""`` when the parameter (or
    the whole mapping) is absent.
    """
    if not parameters:
        return ""
    raw = parameters.get("awareness_type") or ""
    return raw.split(";", 1)[0].strip()


def meteoalarm_region_codes(
    geocodes: Mapping[str, tuple[str, ...]],
    area_descs: tuple[str, ...] = (),
) -> tuple[str, ...]:
    """Region codes for an alert, matching ``_region_pairs`` selection.

    Returns the values of the first scheme present in
    ``METEOALARM_REGION_SCHEMES``; if none is present, falls back to the
    alert's area descriptions (mirroring ``_region_pairs``' ``areaDesc``
    fallback) so picker values and filter keys stay in the same namespace for
    the same feed.
    """
    for scheme in METEOALARM_REGION_SCHEMES:
        values = geocodes.get(scheme)
        if values:
            return tuple(values)
    return tuple(area_descs)


# ---------------------------------------------------------------------------
# Severity derivations
# ---------------------------------------------------------------------------
#
# Each returns ``None`` when the source-specific signal is absent or
# unrecognized, which tells the caller to fall back to CAP ``severity``.


def nws_vtec_severity(alert: CAPAlert) -> str | None:
    """Derive severity from VTEC codes (authoritative for NWS)."""
    sig = alert.vtec_significance
    if not sig:
        return None
    # Tornado/Extreme Wind warnings are "extreme", not just "severe"
    if sig == "W" and alert.vtec_phenomena in _VTEC_EXTREME_PHENOMENA:
        return "extreme"
    return _VTEC_SIG_SEVERITY.get(sig, "unknown")


def meteoalarm_awareness_severity(alert: CAPAlert) -> str | None:
    """Map MeteoAlarm ``awareness_level`` to a canonical severity, or None.

    The parameter format published by EUMETNET members is ``"N; color; Label"``
    (e.g. ``"3; orange; Severe"``). The color token is the contract; the
    numeric prefix and trailing label are ignored. Returns ``None`` for
    missing, malformed, or unrecognized values so the caller falls back to
    CAP ``severity``.
    """
    if alert.parameters is None:
        return None
    raw = alert.parameters.get("awareness_level")
    if not raw:
        return None
    parts = raw.split(";")
    if len(parts) < 2:
        return None
    color = parts[1].strip().lower()
    return _METEOALARM_AWARENESS_TO_SEVERITY.get(color)


# ---------------------------------------------------------------------------
# List-shaped hooks
# ---------------------------------------------------------------------------


# ``(scheme, code, label)`` for one region an alert covers.
RegionEntry = tuple[str, str, str]


def _no_regions(alert: CAPAlert) -> tuple[RegionEntry, ...]:
    """Default ``regions_for``: the provider supplies no region entries."""
    return ()


@dataclass(frozen=True, slots=True)
class StageContext:
    """Everything a stage may read beyond the alerts themselves."""

    now: datetime
    # Empty outside the provider's region-picker mode.
    wanted_regions: frozenset[str] = frozenset()
    # The regions an alert covers, one ``(scheme, code, label)`` each, when the
    # provider can still supply them. A deliberate seam: ``CAPAlert`` flattens
    # every ``<area>`` into one comma-joined ``area_desc`` and one merged
    # geocode container, which destroys the name ↔ code pairing a region
    # explode depends on. The provider already resolves these entries for its
    # region picker, so routing them through here makes an exploded entity's
    # name the same string the user picked *by construction*, instead of
    # re-deriving the pairing rules a second time in this module.
    regions_for: Callable[[CAPAlert], tuple[RegionEntry, ...]] = _no_regions


@dataclass(frozen=True, slots=True)
class PipelineStage:
    """A list-shaped dialect stage, bound to a named point in the fetch."""

    slot: Literal["explode", "merge"]
    run: Callable[[list[CAPAlert], StageContext], list[CAPAlert]]


# ---------------------------------------------------------------------------
# Episode dialects (issues #37, #88, #98)
# ---------------------------------------------------------------------------
#
# Two senders publish one continuous warning as a chain of messages, and both
# put a component of that chain into the entity id, so a single episode becomes
# one entity per message and the id rolls over mid-episode — breaking any
# automation or dashboard card that referenced it.
#
# MeteoFrance publishes one warning per calendar *day*, each running roughly
# 00:00 → 00:00 local, with the next day's bulletin live alongside the current
# day's for most of the day. FMI instead re-issues at the window edge: a
# nine-day wildfire warning arrived as nine messages, most of them ending
# exactly at the midnight the next one starts on.
#
# The merge below collapses a run of such messages back into one episode, keyed
# without the per-message component so it survives the split. In region-picker
# mode the message is first exploded into one alert per configured region,
# because the *set* of regions covered moves message to message (measured:
# a France thunderstorm bulletin went from 83 departments to 54 overnight; the
# FMI wildfire chain grew from one region to five), so any set-derived key would
# split the episode anyway.
#
# What the two senders do *not* share is what makes consecutive messages one
# episode, so that predicate is declared per sender (``EpisodeDialect.split``)
# and everything else here is one implementation.


def _parse_ts(value: str) -> datetime | None:
    """Parse an ISO-8601 timestamp, or ``None`` when absent or unparseable."""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _instant(value: str) -> datetime | None:
    """Parse a timestamp to a comparable aware instant, or ``None``.

    Window edges within one episode can carry different UTC offsets across a
    DST boundary, and a feed may drop the offset entirely, so every comparison
    in this module goes through here rather than comparing raw values. Naive
    timestamps are read as UTC.
    """
    parsed = _parse_ts(value)
    if parsed is None:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed


def _forecast_window_key(onset: str, effective: str, sent: str) -> str:
    """Forecast-day key: the ``YYYY-MM-DD`` prefix of the first non-empty of
    ``onset``/``effective``/``sent``.

    MeteoFrance re-issues a given day's warning several times but keeps the
    ``onset`` date stable, so the date (not the full timestamp) merges re-issues
    while keeping forecast days distinct. The episode merge groups days on this
    key; it reaches a shipped id only as the collision tie-breaker for a second
    live run of one episode key. Returns ``""`` when all three are empty.
    """
    for value in (onset, effective, sent):
        if value:
            return value[:10]
    return ""


def _severity_ranks() -> Mapping[str, int]:
    """The canonical severity ladder, fetched lazily.

    ``normalize`` consults this table, so importing it at module scope would
    close an import cycle. The merge has to rank days on the same ladder the
    normalizer will later apply, or the entity's dominant day and its
    ``severity_normalized`` could disagree.
    """
    from .normalize import SEVERITY_RANK

    return SEVERITY_RANK


def _canonical_severity(alert: CAPAlert) -> str:
    """Canonical severity for ranking, using normalization's own mapping.

    MeteoAlarm severity lives in the ``awareness_level`` parameter rather than
    CAP ``<severity>``, so the ranking reads that first and falls back to the
    CAP field.
    """
    severity = meteoalarm_awareness_severity(alert) or alert.severity.lower()
    return severity if severity in _severity_ranks() else "unknown"


def _severity_rank(alert: CAPAlert) -> int:
    return _severity_ranks()[_canonical_severity(alert)]


def _ts_sort_key(value: str) -> tuple[int, float, str]:
    """Total ordering over ISO timestamps: instant when parseable, else text.

    Unparseable values sort last but stay deterministic.
    """
    parsed = _instant(value)
    if parsed is None:
        return (1, 0.0, value)
    return (0, parsed.timestamp(), value)


def _parse_day(value: str) -> date | None:
    """Parse a ``YYYY-MM-DD`` forecast-day key, or ``None``."""
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def _is_finished(alert: CAPAlert, now: datetime) -> bool:
    """True once the warning's window has closed.

    Finished messages must leave the episode before the id drops its
    per-message component, or a finished run and an upcoming run for the same
    key would collide on one id — the alert store keys by id, so one would
    silently overwrite the other.
    """
    expires = _instant(alert.expires)
    return expires is not None and expires <= now


# --- identity -------------------------------------------------------------


def episode_id(
    sender: str,
    event_key: str,
    region_codes: Sequence[str],
    window_key: str,
    *,
    fallback: str,
) -> str:
    """Content-key identity for an episode dialect's alerts.

    Keys on sender + phenomenon + region set + window so a re-issue (fresh
    per-message identifier, same logical warning) keeps one stable id, while
    distinct phenomena and regions stay distinct entities. Shipped ids are
    minted by the merge stage with an *empty* ``window_key`` so they survive
    the message split; the window component survives only as the collision
    tie-breaker for a second live run of one episode key. Severity/color is
    intentionally excluded so an orange→red escalation updates the existing
    entity rather than spawning a new one. Falls back to hashing ``fallback``
    when every key component is empty (degenerate warning).
    """
    region_key = ";".join(sorted(region_codes))
    if not (sender or event_key or region_key or window_key):
        return hashlib.sha256(fallback.encode()).hexdigest()[:12]
    key = f"{sender}|{event_key}|{region_key}|{window_key}"
    return hashlib.sha256(key.encode()).hexdigest()[:12]


def meteofrance_identity(alert: CAPAlert) -> str | None:
    """Re-mint a MeteoFrance id from the finished alert's own fields.

    Every component of the content key is recoverable after construction, so
    identity is a rewrite rather than a hook threaded through the parser. The
    id minted here is provisional — the merge stage recomputes every live
    MeteoFrance id before the fetch returns — which is what makes computing it
    one step later than the parser safe.
    """
    event_key = (
        meteoalarm_awareness_type_code(alert.parameters) or alert.event.casefold()
    )
    descs = tuple(d.strip() for d in alert.area_desc.split(",") if d.strip())
    return episode_id(
        alert.sender,
        event_key,
        meteoalarm_region_codes(alert.geocodes, descs),
        _forecast_window_key(alert.onset, alert.effective, alert.sent),
        fallback=alert.identifier or alert.id,
    )


# --- green markers --------------------------------------------------------


def meteofrance_is_live_warning(alert: CAPAlert) -> bool:
    """False for a MeteoFrance "no warning" marker, True for a real bulletin.

    MeteoFrance encodes green/no-warning as an ``Actual``/``Update`` with a
    degenerate window, in two shapes: ``expires < onset`` (supersede marker,
    ``expires`` is the replacement's issue time) and ``expires == onset``
    (zero-length). Both are non-warnings, but they carry the same ``event``
    text, ``awareness_type``, and areas as the real bulletin for that
    department-day — and ``episode_id`` deliberately excludes severity, so
    a marker and the bulletin it refers to hash to the *same* id. The alert
    store keys incoming alerts by id, so whichever arrives last wins and the
    real warning can be silently displaced by a green one (issue #37).

    The ``>`` is load-bearing and must not be "tidied" to ``>=``: the
    zero-length shape is a third of a live France feed, its ``expires`` is a
    future day boundary (so a plain ``expires <= now`` check never catches it),
    and it is sent seconds apart from the genuine bulletin.

    Fails open — an absent or unparseable window keeps the warning, so a feed
    format change can never silently drop real alerts. The table gates this on
    the sender; the shape is unverified for other authorities.

    Known interplay with absence retention: a green marker is also how
    MeteoFrance announces a warning lifted early, and dropping it here means
    that announcement never reaches the alert store — the lifted warning goes
    absent and is retained ``stale`` until its published expiry (end of the
    forecast day) instead of clearing on the next poll. Accepted deliberately:
    the marker cannot be forwarded as a terminal record, because the
    zero-length shape routinely coexists with a *live* bulletin of the same
    episode (a green day alongside a warned day), so treating any marker as
    termination would end running warnings — the displacement bug of issue #37
    in terminal form. Distinguishing "green for a day that currently has a
    live warning" needs run-aware state this per-alert hook does not have.
    """
    onset = _parse_ts(alert.onset)
    expires = _parse_ts(alert.expires)
    if onset is None or expires is None:
        return True
    try:
        return expires > onset
    except TypeError:
        # Mixed offset-aware/naive timestamps — not comparable, fail open.
        return True


# --- region explode -------------------------------------------------------


def _explode_alert(
    alert: CAPAlert, entries: tuple[RegionEntry, ...], wanted: frozenset[str]
) -> list[CAPAlert]:
    """One alert per configured region the message covers.

    Splitting on the *region entry* rather than on the ``<area>`` block is what
    makes this sender-neutral: France publishes one area block per department
    (one name, one NUTS3 code), while FMI packs every warned region into a
    single block holding N ``EMMA_ID`` codes and an ``areaDesc`` naming all N.
    A per-block split would leave an FMI alert still scoped to the whole set.

    Each resulting alert is scoped to one region: the label the region picker
    offered, and that code alone. That makes the episode key stable (the covered
    set churns from message to message; a single configured region does not) and
    replaces an ``area_desc`` listing up to 83 departments with the one the user
    actually selected. Sub-region schemes on the same area (``WARNCELLID``,
    ``CISORP``) are dropped with the rest of the set — they belong to the
    message's full footprint, not to the region being scoped to.

    Ids are left alone here — the merge recomputes them.
    """
    out: list[CAPAlert] = []
    seen: set[str] = set()
    for scheme, code, label in entries:
        if code not in wanted or code in seen:
            continue
        seen.add(code)
        out.append(
            replace(
                alert,
                area_desc=label or alert.area_desc,
                # A schemeless entry is the ``areaDesc`` fallback, where the
                # description *is* the region key, so an empty container leaves
                # ``meteoalarm_region_codes`` resolving it off ``area_desc``.
                geocodes=geocodes_from({scheme: [code]}),
            )
        )
    return out


def _explode_by_region(
    alerts: list[CAPAlert], ctx: StageContext, dialect: EpisodeDialect
) -> list[CAPAlert]:
    """Explode each of this dialect's messages into the regions it covers.

    A no-op outside region-picker mode (no configured regions) and for any
    message whose region entries the provider could not supply. A message
    covering none of the configured regions contributes nothing, which the mode
    filter would have done anyway.
    """
    if not ctx.wanted_regions:
        return alerts
    out: list[CAPAlert] = []
    for alert in alerts:
        entries = ctx.regions_for(alert) if alert.sender == dialect.sender else ()
        if not entries:
            out.append(alert)
            continue
        out.extend(_explode_alert(alert, entries, ctx.wanted_regions))
    return out


# --- episode merge --------------------------------------------------------


def _episode_group_key(alert: CAPAlert) -> tuple[str, str, str]:
    """``(sender, phenomenon, region scope)`` — everything but the window.

    The region component is whatever scope the alert already carries: a single
    region after ``_explode_by_region`` in region-picker mode, the message's
    full resolved set otherwise. Country-wide mode therefore still splits an
    episode when the footprint moves between messages; that is a known
    limitation, kept because per-region explosion there would turn France into
    roughly 150 entities.
    """
    event_key = (
        meteoalarm_awareness_type_code(alert.parameters) or alert.event.casefold()
    )
    descs = tuple(d.strip() for d in alert.area_desc.split(",") if d.strip())
    region_key = ";".join(sorted(meteoalarm_region_codes(alert.geocodes, descs)))
    return (alert.sender, event_key, region_key)


def _calendar_day_runs(alerts: list[CAPAlert]) -> list[list[CAPAlert]]:
    """Runs of consecutive forecast days — the MeteoFrance run rule.

    Two alerts on the same day are resolved by ``(severity, sent)`` — severity
    first, so a lower-severity message can never displace a higher one on send
    order alone. Live sampling says this should not happen (at most one live
    warning per department, phenomenon and day across 203 samples), so it is
    defensive; the ordering matters because the alternative silently picks by
    upstream timing.

    A gap of more than one calendar day starts a new run, on the reading that
    MeteoFrance skipping a day means a genuinely separate episode. That case
    has never been observed live, so a wrong reading here degrades to the
    previous behaviour (two entities) rather than losing anything.
    """
    by_day: dict[str, CAPAlert] = {}
    for alert in alerts:
        day = _forecast_window_key(alert.onset, alert.effective, alert.sent)
        current = by_day.get(day)
        if current is None or (_severity_rank(alert), _ts_sort_key(alert.sent)) > (
            _severity_rank(current),
            _ts_sort_key(current.sent),
        ):
            by_day[day] = alert

    runs: list[list[CAPAlert]] = []
    run: list[CAPAlert] = []
    previous: date | None = None
    for day in sorted(by_day):
        parsed = _parse_day(day)
        contiguous = (
            run
            and parsed is not None
            and previous is not None
            and (parsed - previous).days <= 1
        )
        if run and not contiguous:
            runs.append(run)
            run = []
        run.append(by_day[day])
        previous = parsed
    if run:
        runs.append(run)
    return runs


def _contiguous_window_runs(alerts: list[CAPAlert]) -> list[list[CAPAlert]]:
    """Runs of touching windows — the FMI run rule.

    Sorted by onset, a message joins the current run when it starts at or
    before the run's furthest reach, and starts a new one otherwise. That
    merges the midnight split the reporter saw (``… → 08-05T00:00`` followed by
    ``08-05T00:00 → …``, nine messages deep in the sampled wildfire chain) while
    keeping genuinely separate advisories apart: two live ``FI809`` wind
    warnings on 2026-08-06 sat an hour apart (``09:00–21:00`` and
    ``22:00–00:00``) and must stay two entities.

    Calendar-day collapse is wrong here in both directions — it would drop one
    of those two same-day advisories, and its ``(severity, sent)`` tie-break
    could not even choose, because FMI stamps a whole batch with one ``sent``
    (12 of 23 sampled warnings shared a timestamp to the second).

    A message whose onset cannot be placed on the timeline is contiguous with
    nothing and gets its own run, degrading to one entity per message rather
    than merging on an unknown.
    """
    ordered = sorted(
        alerts, key=lambda a: (_ts_sort_key(a.onset), _ts_sort_key(a.expires))
    )
    runs: list[list[CAPAlert]] = []
    run: list[CAPAlert] = []
    reach: datetime | None = None
    for alert in ordered:
        onset = _instant(alert.onset)
        contiguous = (
            bool(run) and onset is not None and reach is not None and onset <= reach
        )
        if run and not contiguous:
            runs.append(run)
            run = []
            reach = None
        run.append(alert)
        expires = _instant(alert.expires)
        if expires is not None and (reach is None or expires > reach):
            reach = expires
    if run:
        runs.append(run)
    return runs


def _forecast_day_key(alert: CAPAlert) -> str:
    """The MeteoFrance tie-breaker window: the run's first forecast day.

    Day-truncated on purpose. MeteoFrance re-issues a day's bulletin with the
    onset *time* clipped to the issue time, so any finer key would churn a
    pending run's id on every re-issue of its first day.
    """
    return _forecast_window_key(alert.onset, alert.effective, alert.sent)


def _window_edge_key(alert: CAPAlert) -> str:
    """The FMI tie-breaker window: the run's opening window, verbatim.

    Day truncation is not enough here: the contiguity rule splits sub-day, so
    a second and a third disjoint same-day run would collide on the day key —
    and the alert store, keying by id, would silently drop one of them. Two
    distinct runs always differ in their opening window, because a run
    boundary *is* a gap between one window and the next. Verbatim rather than
    parsed: the strings repeat identically on every poll of the same message,
    and unparseable edges still yield distinct keys.
    """
    return f"{alert.onset}/{alert.expires}"


def _episode_day(alert: CAPAlert) -> dict[str, str]:
    """One ``episode_days`` entry: what this message actually said.

    ``date`` is the message's own window key. It is a forecast day for
    MeteoFrance, one message per day; for a dialect that splits at the window
    edge instead, two entries of one run can share a date (FMI publishes two
    same-day wind advisories an hour apart), so the entry is keyed by nothing —
    it is a profile, and ``onset``/``expires`` carry the exact window.
    """
    return {
        "date": _forecast_window_key(alert.onset, alert.effective, alert.sent),
        "onset": alert.onset,
        "expires": alert.expires,
        "severity": _canonical_severity(alert),
        "awareness_level": (alert.parameters or {}).get("awareness_level", ""),
        "event": alert.event,
        "headline": alert.headline,
        "area_desc": alert.area_desc,
    }


def _merge_run(
    run: list[CAPAlert], key: tuple[str, str, str], window_key: str
) -> CAPAlert:
    """Collapse one run of messages into a single episode alert.

    The most severe message supplies the content wholesale, tie-broken to the
    earliest onset. Blending fields instead would let the record contradict
    itself — ``severity_normalized`` comes from ``awareness_level`` and the
    icon from ``event``, so a mixed record could read "Vigilance **jaune**
    canicule" while carrying an **orange** level. Per-message truth goes to
    ``episode_days``; the window is widened to span the whole run.

    A single-message run leaves ``episode_days`` empty: the profile would only
    restate the alert's own fields, and the attribute stays sparse.
    """
    sender, event_key, region_key = key
    dominant = min(run, key=lambda a: (-_severity_rank(a), _ts_sort_key(a.onset)))
    onsets = [a.onset for a in run if a.onset]
    expiries = [a.expires for a in run if a.expires]
    region_codes = tuple(region_key.split(";")) if region_key else ()
    return replace(
        dominant,
        id=episode_id(
            sender,
            event_key,
            region_codes,
            window_key,
            fallback=dominant.identifier or dominant.id,
        ),
        onset=min(onsets, key=_ts_sort_key) if onsets else dominant.onset,
        expires=max(expiries, key=_ts_sort_key) if expiries else dominant.expires,
        episode_days=tuple(_episode_day(a) for a in run) if len(run) > 1 else (),
    )


def _merge_episodes(
    alerts: list[CAPAlert], ctx: StageContext, dialect: EpisodeDialect
) -> list[CAPAlert]:
    """Collapse this dialect's messages into episodes; pass everything else.

    Bound to the ``merge`` slot, which the provider runs last: it must precede
    the alert store, which keys incoming alerts by id and would silently drop
    one of any pair sharing the window-free id this produces.
    """
    if not any(a.sender == dialect.sender for a in alerts):
        return alerts

    passthrough = [a for a in alerts if a.sender != dialect.sender]
    groups: dict[tuple[str, str, str], list[CAPAlert]] = {}
    for alert in alerts:
        if alert.sender != dialect.sender or _is_finished(alert, ctx.now):
            continue
        groups.setdefault(_episode_group_key(alert), []).append(alert)

    merged: list[CAPAlert] = []
    for key, members in groups.items():
        runs = dialect.split(members)
        for index, run in enumerate(runs):
            # The earliest run keeps the window-free id — surviving the message
            # split is the entire point. A *second* live run for one phenomenon
            # and region is normal for FMI (two wind advisories an hour apart)
            # and needs MeteoFrance to skip a forecast day mid-episode, which
            # 227 live samples never showed. Either way the runs must not
            # collide on a single id, because the alert store keys by id and
            # would silently drop one. Later runs therefore re-add their first
            # message's window — at the dialect's own granularity
            # (``EpisodeDialect.window_key``) — which churns only the pending
            # entity and never the one currently in effect.
            first = run[0]
            window_key = "" if index == 0 else dialect.window_key(first)
            merged.append(_merge_run(run, key, window_key))
    merged.sort(key=lambda a: (_ts_sort_key(a.onset), a.event, a.id))
    return passthrough + merged


# --- dialect registration -------------------------------------------------


@dataclass(frozen=True, slots=True)
class EpisodeDialect:
    """One sender's episode conventions: whose messages, and what makes a run.

    ``split`` is the only thing two dialects disagree on, and it is the one
    thing that cannot be shared — each sender's rule is wrong for the other.
    MeteoFrance re-issues a forecast day with the onset clipped to the issue
    time, so two re-issues of one day *overlap*, and contiguity would merge
    them into a bogus two-day episode with ``onset`` widened back to the
    superseded issue time. In the other direction, day-collapse would silently
    drop one of FMI's two same-day advisories, with its ``(severity, sent)``
    tie-break unable to even choose because FMI stamps a whole batch with one
    ``sent``.

    ``window_key`` is the run rule's granularity applied to identity: the
    window a second-or-later live run re-adds to its id so two runs of one
    episode key can never collide. It must be exactly as fine as ``split`` can
    cut. MeteoFrance's day key would collapse a second and a third same-day
    FMI run onto one id (and the alert store would drop one); FMI's verbatim
    key would churn a pending MeteoFrance run's id on every re-issue, whose
    onset time moves with the issue time.

    Everything downstream of the split — the finished-drop, dominant selection,
    window widening, ``episode_days``, id minting — is one implementation.
    """

    sender: str
    split: Callable[[list[CAPAlert]], list[list[CAPAlert]]]
    window_key: Callable[[CAPAlert], str]


METEOFRANCE_EPISODES = EpisodeDialect(
    METEOFRANCE_SENDER, _calendar_day_runs, _forecast_day_key
)
FMI_EPISODES = EpisodeDialect(FMI_SENDER, _contiguous_window_runs, _window_edge_key)


def episode_stages(dialect: EpisodeDialect) -> tuple[PipelineStage, ...]:
    """The explode + merge stage pair for one episode dialect.

    Closures over the dialect rather than sender literals in the stage bodies,
    so registering a sender is a table entry (the module's whole thesis) and
    the pipeline is implemented once however many senders declare it.
    """

    def explode(alerts: list[CAPAlert], ctx: StageContext) -> list[CAPAlert]:
        return _explode_by_region(alerts, ctx, dialect)

    def merge(alerts: list[CAPAlert], ctx: StageContext) -> list[CAPAlert]:
        return _merge_episodes(alerts, ctx, dialect)

    return (PipelineStage("explode", explode), PipelineStage("merge", merge))


# ---------------------------------------------------------------------------
# NWS re-issue collapse
# ---------------------------------------------------------------------------
#
# A VTEC string is a supersession protocol: it carries a stable event identity
# across every revision, which is what ``_compute_alert_id`` keys on. NWS
# products published *without* one have no such protocol — each re-transmission
# is a fresh ``messageType: Alert`` with an empty ``<references>`` and a new
# ``urn:oid:`` identifier, and the message it replaces stays active until its
# own ``expires``. Hashing that identifier mints an entity per transmission, so
# one running advisory reads as a pile of duplicates.
#
# Measured on the national feed 2026-08-06: 23 of 65 active non-VTEC alerts
# were surplus re-issues (35%), the deepest cluster six messages of one Air
# Quality Alert, and ``<references>`` was populated on none of the 65 — so the
# store's reference-based supersession path cannot see them either.


def _nws_parameter(alert: CAPAlert, name: str) -> str:
    """First value of an NWS ``parameters`` entry, whose values are lists.

    ``CAPAlert.parameters`` is an untyped dict carrying each provider's native
    shape; NWS publishes ``{"AWIPSidentifier": ["AQABOU"]}`` where MeteoAlarm
    publishes a bare string, so both are accepted here.
    """
    raw = (alert.parameters or {}).get(name)
    if isinstance(raw, str):
        return raw
    if isinstance(raw, (list, tuple)) and raw:
        return str(raw[0])
    return ""


def _nws_reissue_key(alert: CAPAlert) -> tuple[str, str, tuple[str, ...]] | None:
    """Content key for a re-issuable NWS product, or ``None`` to leave it alone.

    ``AWIPSidentifier`` names the product *and* the issuing office (``AQABOU``
    = Air Quality Alert out of Boulder), which is precisely the slot a
    re-transmission supersedes. ``event`` guards one office publishing two
    hazards under a single product, and the UGC set keeps genuinely concurrent
    advisories apart — the sampled feed carried two live ``AQABOU`` groups over
    different county sets, which must stay two entities.

    Returns ``None`` — meaning "keep the per-message identity" — for anything
    VTEC-bearing, and for a degenerate key naming neither product nor area.
    Refusing to collapse on an unknown is the fail-open direction: a duplicate
    entity is a nuisance, a silently dropped alert is not.
    """
    if alert.vtec:
        return None
    awips = _nws_parameter(alert, "AWIPSidentifier")
    ugc = tuple(sorted(alert.geocodes.get("UGC", ())))
    if not awips and not ugc:
        return None
    return (awips, alert.event, ugc)


def _reissue_recency(alert: CAPAlert) -> tuple[int, float, str]:
    """Recency ordering for ``max``: a parseable ``sent`` beats an unparseable
    one, ties broken on identifier so the winner is deterministic.

    Deliberately not ``_ts_sort_key``, which sorts unparseable values *last* for
    ascending callers — under ``max`` that would hand the group to the one
    message whose timestamp could not be read.
    """
    parsed = _instant(alert.sent)
    if parsed is None:
        return (0, 0.0, alert.identifier)
    return (1, parsed.timestamp(), alert.identifier)


def collapse_nws_reissues(alerts: list[CAPAlert], ctx: StageContext) -> list[CAPAlert]:
    """Keep the newest transmission of each non-VTEC NWS product, re-minting its
    id from the content key.

    Both halves are load-bearing. Dropping the older messages alone would still
    churn the entity id on every re-transmission — the failure issue #37
    documents for MeteoFrance, where an id that rolls over breaks any automation
    or card referencing it. Re-minting alone would collapse the group onto one
    id and leave the alert store, which keys incoming alerts by id, to pick the
    winner by list order; NWS returns newest-first, so the *oldest* message
    would win.

    The newest by ``sent`` supplies the record wholesale rather than blending
    fields, for the reason ``_merge_run`` gives: a blended record can contradict
    itself. It is the right choice operationally too — a re-transmission
    restates the currently-running advisory, so its window is the live one.
    Verified across every multi-message cluster in the national sample: the
    newest member was already in effect in all of them, never pending.

    No window component enters the key, which is what retires a finished-but-
    unexpired advisory. NWS stamps these with an ``expires`` well past the
    window they describe (the sampled Denver cluster carried a Wed→Thu advisory
    expiring Friday 09:00), so keying on the window would keep it alongside the
    live one as a second entity.
    """
    keyed: dict[tuple[str, str, tuple[str, ...]], list[CAPAlert]] = {}
    passthrough: list[CAPAlert] = []
    for alert in alerts:
        key = _nws_reissue_key(alert)
        if key is None:
            passthrough.append(alert)
        else:
            keyed.setdefault(key, []).append(alert)

    collapsed: list[CAPAlert] = []
    for (awips, event, ugc), members in keyed.items():
        newest = max(members, key=_reissue_recency)
        collapsed.append(
            replace(
                newest,
                id=episode_id(
                    newest.sender,
                    f"{awips}|{event}",
                    ugc,
                    "",
                    fallback=newest.identifier or newest.id,
                ),
            )
        )
    return passthrough + collapsed


NWS_REISSUE_STAGES: tuple[PipelineStage, ...] = (
    PipelineStage("merge", collapse_nws_reissues),
)


# ---------------------------------------------------------------------------
# The table
# ---------------------------------------------------------------------------


# Shared empty mapping for sources that declare no lifecycle vocabulary. A
# frozen/slots dataclass rejects a mutable default, so the field uses a
# ``default_factory`` returning this singleton (as ``model.CAPAlert`` does for
# ``geocodes``).
_NO_REMOVAL_REASONS: Mapping[str, str] = MappingProxyType({})

# Values for ``SourceConventions.absence_policy``. See the field for why
# retaining is the default.
ABSENCE_RETAIN = "retain"
ABSENCE_ENDS = "ends"


@dataclass(frozen=True, slots=True)
class SourceConventions:
    """Interpretive rules for one alert source. Every field is optional.

    An omitted field means "this source publishes no such signal", which is a
    declaration rather than an absence: ``classifies_marine`` is what the
    options flow asks before offering the exclude-marine toggle, instead of
    re-listing the supporting providers by hand.
    """

    # Area-code prefixes denoting marine/water zones. Empty when the source
    # publishes no marine discriminator.
    marine_code_prefixes: frozenset[str] = frozenset()
    # Provider-native ``lifecycle_status`` tokens meaning end-of-life, mapped to
    # the neutral reason published as ``removal_reason`` on ``incident_removed``
    # (``const.REMOVAL_REASON_*``). The keys are the terminal set normalization
    # tests against, so a token cannot end an alert without saying why.
    lifecycle_removal_reasons: Mapping[str, str] = field(
        default_factory=lambda: _NO_REMOVAL_REASONS
    )
    # Source-specific severity derivation, or None to use CAP ``severity``.
    severity: Callable[[CAPAlert], str | None] | None = None
    # Replacement entity id for a finished alert, or None to keep the
    # provider's default. Runs after construction, so it reads the alert.
    identity: Callable[[CAPAlert], str | None] | None = None
    # False for a record this source publishes that is not a warning at all.
    keep: Callable[[CAPAlert], bool] | None = None
    # List-shaped stages, each bound to a named slot in the provider's fetch.
    stages: tuple[PipelineStage, ...] = ()
    # What an alert's absence from a reconciliation means for this source.
    # ``ABSENCE_RETAIN`` (the default) says absence is an observation failure
    # until proven otherwise: the store keeps the alert, marks it stale, and
    # waits for its ``expires`` or an explicit terminal signal. ``ABSENCE_ENDS``
    # says the feed publishes only live records and withdrawing one is how this
    # source announces the end, so absence terminates immediately — with or
    # without an ``expires`` on the record. The policy is the *only* thing that
    # makes absence authoritative: an alert that merely omits ``expires`` under
    # ``ABSENCE_RETAIN`` is retained indefinitely (visibly stale) until an
    # explicit terminal signal, because a missing field on one message is not a
    # statement about what withdrawal means for the source.
    #
    # Retaining is the safe default because a feed gap is indistinguishable
    # from a cancellation at the moment of observation, and the two errors are
    # not symmetric: retaining a finished alert shows a stale warning until its
    # published expiry, while dropping a live one silently clears a hazard from
    # the user's dashboard and then re-creates it as a *new* incident when the
    # feed recovers, fragmenting its history (RFC §1.2, §1.4 item 8). Declare
    # ``ABSENCE_ENDS`` only on positive evidence of the source's contract —
    # a feed documented (or observed) to withdraw records as its end-of-life
    # announcement. No shipped source meets that bar today: NWS, ECCC, and
    # MeteoAlarm publish expiries and terminal signals, and WMO's RSS sources
    # are exactly the lossy feeds retention exists to protect, so declaring it
    # there on speculation would forfeit the protection. The cost of that
    # caution is that a WMO alert with no ``expires`` in its CAP body can stay
    # stale until its source re-publishes or a human removes the entry — an
    # accepted trade against silently clearing a live hazard.
    absence_policy: str = ABSENCE_RETAIN
    # False for a source that never publishes CAP ``<geocode>`` at all, which
    # is what the options flow asks before offering the area-code narrowing
    # field — on such a source the coordinator's geocode filter can only ever
    # trip its fail-loud path and leave the entry permanently unavailable.
    # Unlike the other fields the default here is positive, because geocodes
    # are the CAP norm rather than a per-source signal: every shipped source
    # except GDACS publishes them, so the flag marks the exception.
    publishes_geocodes: bool = True
    # True when the provider actively fetches terminations the active feed
    # omits, rather than waiting for one to arrive. NWS is the case: it
    # publishes cancellations as VTEC ``CAN`` products but never on
    # ``/alerts/active``, so the provider queries them separately.
    #
    # Read by ``store._retain_on_absence`` as one of the three ways an alert
    # can eventually be ended. It matters only for alerts with no ``expires``,
    # where time cannot end them: retaining one is safe if a termination will
    # be fetched, and unsafe if nothing will ever arrive. A source with no
    # expiry, no terminal vocabulary and no lookup has no exit at all, and
    # retaining its alerts would leave entities that outlive the hazard
    # indefinitely — measured on WMO, where two authorities publish no
    # ``<expires>`` on any alert.
    discovers_terminations: bool = False

    @property
    def classifies_marine(self) -> bool:
        """True when this source can tell marine zones from land zones."""
        return bool(self.marine_code_prefixes)

    def stages_at(
        self, slot: str
    ) -> tuple[Callable[[list[CAPAlert], StageContext], list[CAPAlert]], ...]:
        """The stage callables registered at ``slot``, in declaration order."""
        return tuple(stage.run for stage in self.stages if stage.slot == slot)


CONVENTIONS: Mapping[str, SourceConventions] = MappingProxyType(
    {
        # The collapse is a stage rather than an ``identity`` hook because a
        # per-alert rewrite cannot also discard the messages it superseded, and
        # leaving that to the store's id-keyed last-write-wins would pick the
        # oldest of them off a newest-first feed.
        "nws": SourceConventions(
            marine_code_prefixes=NWS_MARINE_UGC_PREFIXES,
            severity=nws_vtec_severity,
            stages=NWS_REISSUE_STAGES,
            # NWSProvider._fetch_cancellations goes and gets the VTEC CAN
            # products the active endpoint never carries.
            discovers_terminations=True,
        ),
        "eccc": SourceConventions(
            marine_code_prefixes=frozenset({ECCC_MARINE_CLC_PREFIX}),
            lifecycle_removal_reasons=ECCC_LIFECYCLE_REMOVAL_REASONS,
        ),
        "meteoalarm": SourceConventions(
            severity=meteoalarm_awareness_severity,
        ),
        # A sender-scoped entry replaces the provider's, so the MeteoAlarm
        # severity derivation is restated here rather than inherited.
        f"meteoalarm/{METEOFRANCE_SENDER}": SourceConventions(
            severity=meteoalarm_awareness_severity,
            identity=meteofrance_identity,
            keep=meteofrance_is_live_warning,
            stages=episode_stages(METEOFRANCE_EPISODES),
        ),
        # FMI splits a continuous warning at the window edge (issue #98), so it
        # declares the episode stages with its own run rule — and nothing else.
        # No ``keep``: Finland publishes no green/no-warning markers (all 23
        # sampled warnings were ``2; yellow``, none with a degenerate window).
        # No ``identity`` either: the merge re-mints every shipped id, and
        # MeteoFrance's identity hook is load-bearing there only because of the
        # green-marker collision FMI does not have.
        f"meteoalarm/{FMI_SENDER}": SourceConventions(
            severity=meteoalarm_awareness_severity,
            stages=episode_stages(FMI_EPISODES),
        ),
        "wmo": SourceConventions(),
        # GDACS publishes no area geocodes at all (its identity travels in the
        # RSS envelope instead), so the area-code narrowing option is withheld.
        # Everything else is deliberately default — in particular no absence
        # policy: GDACS alerts have no <expires> and no terminal vocabulary, so
        # ``_retain_on_absence`` already ends them the moment they leave the
        # feed, which is the only end-of-life signal this source has.
        # ``iscurrent`` is not that signal: it goes false for droughts and
        # nothing else, while every earthquake, cyclone, flood, volcano and
        # wildfire observed stayed true right up to the poll it vanished on.
        "gdacs": SourceConventions(publishes_geocodes=False),
    }
)

# Every field empty: a source with no registered conventions gets pure CAP
# handling rather than an error, so an unknown provider degrades gracefully.
_NO_CONVENTIONS = SourceConventions()


def conventions_for(provider: str, sender: str = "") -> SourceConventions:
    """Resolve conventions for a source, most specific key first.

    Tries ``"{provider}/{sender}"`` before ``provider`` so a single provider
    can host per-sender dialects, and falls back to an all-empty entry for
    sources the table does not know.
    """
    if sender:
        scoped = CONVENTIONS.get(f"{provider}/{sender}")
        if scoped is not None:
            return scoped
    return CONVENTIONS.get(provider, _NO_CONVENTIONS)


def is_marine_code(codes: Iterable[str], conventions: SourceConventions) -> bool:
    """True when any area code carries one of the source's marine prefixes.

    Sources whose prefixes are fixed-width (NWS's two-char UGC block) and those
    testing a leading run (ECCC's ``"00…"``) are the same test, so both go
    through this one predicate.
    """
    prefixes = conventions.marine_code_prefixes
    if not prefixes:
        return False
    return any(code.startswith(prefix) for code in codes for prefix in prefixes)
