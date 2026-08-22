"""CAPAlert dataclass — provider-agnostic alert model based on CAP 1.2."""

from __future__ import annotations

import re
from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field, fields
from types import MappingProxyType
from typing import Any

# Immutable empty mapping shared as the ``geocodes`` default. A plain ``{}``
# would be rejected as a mutable default on a frozen/slots dataclass, so the
# field uses ``default_factory`` returning this singleton.
_EMPTY_GEOCODES: Mapping[str, tuple[str, ...]] = MappingProxyType({})

# Canonical publishing names for well-known area-geocode schemes.
#
# ``geocodes`` is the complete area-geocode surface — every scheme a feed
# publishes lands there, and a new scheme needs no model change. Schemes whose
# CAP ``valueName`` embeds a version are published under a short canonical name
# instead, so a consumer's key survives the source bumping that version:
#   UGC / SAME  — zone matching, already canonical as published
#   CLC         — ECCC marine detection (province-numbered for land zones,
#                 "00…" for marine/water zones)
#   SGC         — StatCan SGC codes, what ECCC province filtering matches on
#
# Rewriting by pattern rather than by an enumerated accept-list is deliberate.
# ECCC has already bumped its layer names once (``:1.0:Alert_Name`` →
# ``:1.1:Alert_Name``, see ``providers/eccc.py``), and an enumerated list only
# absorbs the bumps someone remembered to add. This absorbs the next one with
# no code change, which is the property the old alias accept-list advertised
# and never actually had (issue #150 follow-up).
#
# Anything unrecognized passes through under its raw ``valueName``, which keeps
# the container open to schemes this integration has never seen.
_CANONICAL_SCHEMES: tuple[tuple[re.Pattern[str], str], ...] = (
    # ECCC Canadian Location Code, e.g. ``layer:EC-MSC-SMC:1.0:CLC``.
    (re.compile(r"layer:EC-MSC-SMC:\d+(?:\.\d+)*:CLC\Z"), "CLC"),
    # StatCan SGC location code, e.g. ``profile:CAP-CP:Location:0.3``.
    (re.compile(r"profile:CAP-CP:Location:\d+(?:\.\d+)*\Z"), "SGC"),
)

# The canonical names themselves, for code that reaches into the container.
GEOCODE_UGC = "UGC"
GEOCODE_SAME = "SAME"
GEOCODE_CLC = "CLC"
GEOCODE_SGC = "SGC"


def canonical_scheme(scheme: str) -> str:
    """Return the publishing name for a CAP geocode ``valueName``.

    Unrecognized schemes come back unchanged, which is the common case: only
    versioned well-known schemes are rewritten.
    """
    for pattern, canonical in _CANONICAL_SCHEMES:
        if pattern.match(scheme):
            return canonical
    return scheme


def geocodes_from(
    raw: Mapping[str, Iterable[str]],
) -> Mapping[str, tuple[str, ...]]:
    """Normalize a provider's scheme→codes mapping into a ``geocodes`` container.

    The single funnel every provider routes its area geocodes through: scheme
    names are canonicalized, values are de-duplicated order-preserving, empty
    schemes and empty values are dropped, and the result is immutable. Returns
    the shared empty singleton when nothing survives.

    Two raw schemes that canonicalize to the same name are unioned rather than
    letting the last one win, so a feed publishing both ``:1.0:CLC`` and
    ``:1.1:CLC`` mid-bump keeps every code, exactly once.
    """
    normalized: dict[str, list[str]] = {}
    for scheme, values in raw.items():
        if not scheme:
            continue
        codes = normalized.setdefault(canonical_scheme(scheme), [])
        for value in values:
            if value and value not in codes:
                codes.append(value)
    collapsed = {scheme: tuple(codes) for scheme, codes in normalized.items() if codes}
    if not collapsed:
        return _EMPTY_GEOCODES
    return MappingProxyType(collapsed)


@dataclass(frozen=True, slots=True)
class CAPAlert:
    """Provider-agnostic alert modeled on CAP 1.2. All fields optional except id."""

    # -- Identity --
    id: str
    url: str = ""
    identifier: str = ""

    # -- Classification (CAP required) --
    event: str = ""
    msg_type: str = ""
    status: str = ""
    scope: str = ""
    category: str = ""
    urgency: str = ""
    severity: str = ""
    certainty: str = ""
    response_type: str = ""

    # -- Timestamps (ISO 8601 strings as received) --
    sent: str = ""
    effective: str = ""
    onset: str = ""
    expires: str = ""
    ends: str | None = None

    # -- Content --
    headline: str = ""
    description: str = ""
    instruction: str | None = None
    note: str = ""
    web: str = ""

    # -- Geography --
    area_desc: str = ""
    affected_zones: tuple[str, ...] = ()
    affected_zone_uris: tuple[str, ...] = ()
    # Every area geocode a feed publishes, keyed by CAP ``valueName`` (e.g.
    # ``UGC``, ``SAME``, ``EMMA_ID``, ``NUTS3``) or, for well-known versioned
    # schemes, by the canonical short name ``geocodes_from()`` rewrites them to
    # (``CLC``, ``SGC`` — see ``_CANONICAL_SCHEMES``). The complete geocode
    # surface for all providers, and the only one published as an attribute;
    # well-known schemes are also reachable in code through the ``geocode_*``
    # accessors below. Build it with ``geocodes_from()``.
    # Serialized as ``{scheme: [codes]}``, omitted if empty.
    geocodes: Mapping[str, tuple[str, ...]] = field(
        default_factory=lambda: _EMPTY_GEOCODES
    )
    geometry: dict | None = None
    geometry_ref: str = ""
    bbox: tuple[float, float, float, float] | None = None
    # Point locations the feed published, as ``(lon, lat)`` pairs derived from
    # zero-radius CAP ``<circle>`` elements (issue #27). A list because
    # ``<circle>`` is 0..* per ``<area>`` (CAP 1.2 §3.2.4).
    #
    # Deliberately *not* named for what a point means: CAP defines circles as
    # part of the affected area, unioned with any polygons, so reading one as
    # "where the incident is" is a sender's convention (NSW RFS publishes a
    # street-address incident marker this way) and not something the standard
    # blesses. This field records the geometry; consumers decide the meaning.
    #
    # Published alongside ``geometry`` rather than replacing it, so an alert
    # carrying both a fire-ground polygon and a location point keeps each.
    points: tuple[tuple[float, float], ...] = ()
    # Marine/water-zone classification, set per-provider (NWS UGC marine-area
    # prefix, ECCC CLC "00…"). Drives the opt-in exclude-marine filter and is
    # surfaced as an attribute only when True.
    is_marine: bool = False

    # -- Event Codes --
    event_code_nws: str = ""
    event_code_same: str = ""

    # -- VTEC (NWS-specific) --
    vtec: tuple[str, ...] = ()
    vtec_office: str = ""
    vtec_phenomena: str = ""
    vtec_significance: str = ""
    vtec_action: str = ""
    vtec_tracking: str = ""

    # -- Sender --
    sender: str = ""
    sender_name: str = ""

    # -- References / Lifecycle --
    references: tuple[str, ...] = ()
    replaced_by: str = ""
    replaced_at: str = ""
    # Reserved for sub-incident relationships (RFC §6.3). Never populated in
    # v1; ``to_attributes()`` skips empty strings so the attribute stays
    # absent until a future provider sets it.
    parent_id: str = ""

    # -- NWS Parameters (catch-all) --
    parameters: dict | None = None

    # -- Alternate language content (populated when available) --
    # ``event_alt`` exists for classification, not display: ``<event>`` is CAP
    # free text, so a localized one matches no icon keyword. Keeping the
    # alternate block's event lets ``icons.icon_for`` classify on English while
    # the user still reads their own language (issue #91).
    event_alt: str = ""
    headline_alt: str = ""
    description_alt: str = ""
    instruction_alt: str | None = None
    language: str = ""  # BCP-47 of primary content (e.g. "en-CA")
    language_alt: str = ""  # BCP-47 of alternate content (e.g. "fr-CA")

    # -- Episode (MeteoFrance multi-day merge) --
    # Per-day profile of a merged episode, ordered by date, one entry per
    # forecast day. Populated only by the MeteoAlarm provider for MeteoFrance,
    # which publishes one warning per calendar day rather than one per episode
    # (issue #37); empty for every other sender and provider. The merged alert
    # carries the dominant day's content, so this is where per-day truth lives.
    # Keys: date, onset, expires, severity, awareness_level, event, headline,
    # area_desc. Serialized by ``to_attributes``'s tuple branch as a list of
    # objects, and omitted while empty.
    episode_days: tuple[dict[str, str], ...] = ()

    # -- Provider --
    provider: str = "nws"

    # -- Normalization metadata (set by integration, not providers) --
    severity_normalized: str = ""
    phase: str = ""
    # The one exception in this group: a provider-supplied *input* to
    # ``normalize._compute_phase``, not an output of it. Carries provider-native
    # lifecycle vocabulary — ECCC's ``ended`` / ``transitioned_out``, read from
    # the ``Alert_Location_Status`` CAP parameter of the selected ``<info>``
    # block — for feeds that signal termination somewhere other than
    # ``msgType``. Empty for providers that publish no such signal, which keeps
    # phase computation bit-identical for them.
    lifecycle_status: str = ""
    icon: str = ""

    # -- State transition metadata (set by alert store) --
    previous_phase: str = ""
    phase_changed: bool = False
    # Retention markers (RFC §2.1). ``stale`` says the most recent
    # reconciliation did not observe this alert but the store kept it anyway
    # rather than treating one absence as a lifecycle signal (RFC §1.4 item 8);
    # ``last_confirmed`` is the ISO timestamp of the last reconciliation that
    # did see it. Both are meaningless while an alert is being observed
    # normally, so ``stale`` is omitted from attributes when False and
    # ``last_confirmed`` is only stamped once an alert has gone unconfirmed.
    stale: bool = False
    last_confirmed: str = ""

    # -- Promoted geocode schemes (derived from ``geocodes``) --
    # Read-only aliases, not fields: ``geocodes`` is the single source of truth,
    # so a provider cannot populate an alias and the container inconsistently.
    # They are also not attributes — see ``to_attributes()``. Each is a direct
    # lookup because ``geocodes_from()`` has already canonicalized the key.

    @property
    def geocode_ugc(self) -> tuple[str, ...]:
        """NWS Universal Geographic Code zones (``UGC``)."""
        return tuple(self.geocodes.get(GEOCODE_UGC, ()))

    @property
    def geocode_same(self) -> tuple[str, ...]:
        """FIPS-based SAME/FIPS6 area codes (``SAME``)."""
        return tuple(self.geocodes.get(GEOCODE_SAME, ()))

    @property
    def geocode_clc(self) -> tuple[str, ...]:
        """ECCC Canadian Location Codes (``CLC``)."""
        return tuple(self.geocodes.get(GEOCODE_CLC, ()))

    @property
    def geocode_sgc(self) -> tuple[str, ...]:
        """StatCan SGC location codes (``SGC``)."""
        return tuple(self.geocodes.get(GEOCODE_SGC, ()))

    def to_attributes(self) -> dict[str, Any]:
        """Flat attribute dict. Omits empty/None/False values (except id).

        Full ``geometry`` is never included — consumers fetch polygons out-of-band
        via the ``geometry_ref`` handle (see websocket command ``cap_alerts/geometry``
        and REST endpoint ``/api/cap_alerts/geometry/{geometry_ref}``).

        The promoted ``geocode_*`` aliases are **not** serialized: they are the
        same codes ``geocodes`` already carries under its own key, and
        publishing both put the geocode surface twice on the wire — 5,510
        bytes of one live ECCC alert's 19,080-byte payload, on the alert that
        overflowed the recorder's ceiling (issue #150). The aliases remain as
        typed accessors for integration code; a consumer reads the container.
        """
        attrs: dict[str, Any] = {}
        for f in fields(self):
            if f.name == "geometry":
                continue
            val = getattr(self, f.name)
            if f.name in ("is_marine", "stale") and not val:
                continue
            if f.name == "geocodes":
                if val:
                    attrs[f.name] = {
                        scheme: list(codes) for scheme, codes in val.items()
                    }
                continue
            if val is None or val == "" or val == ():
                continue
            if isinstance(val, tuple):
                attrs[f.name] = list(val)
            else:
                attrs[f.name] = val
        return attrs
