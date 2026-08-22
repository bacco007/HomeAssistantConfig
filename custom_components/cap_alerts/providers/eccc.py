"""Environment Canada NAAD Atom feed provider."""

from __future__ import annotations

import asyncio
import hashlib
import logging
import re
from collections import defaultdict
from collections.abc import Mapping, Sequence
from dataclasses import replace
from typing import Any
from xml.etree.ElementTree import Element

import aiohttp
from defusedxml import ElementTree as ET

from homeassistant.helpers.update_coordinator import UpdateFailed

from ..const import (
    CONF_FEED_SOURCE,
    CONF_GPS_LOC,
    CONF_LANGUAGE,
    CONF_PROVINCE,
    DEFAULT_FEED_SOURCE,
)
from ..conventions import ECCC_MARINE_CLC_PREFIX as _ECCC_MARINE_CLC_PREFIX
from ..conventions import conventions_for, is_marine_code
from ..model import GEOCODE_CLC, GEOCODE_SGC, CAPAlert, geocodes_from
from .cap import (
    CAPDoc,
    CAPInfoDoc,
    parse_cap_alert,
    resolve_chain_leaves,
    ring_from_lat_lon_pairs,
)
from .cap_content_cache import CAPContentCache
from .geometry import (
    geometry_from_polygons,
    geometry_from_shapes,
    points_from_circles,
)
from .gps import point_in_polygon

_LOGGER = logging.getLogger(__name__)

# NAAD public dissemination GeoRSS hosts. Migrated April 2026 from
# rss.naad-adna.pelmorex.com to rss.alertready.ca per the NAAD System Governance
# Council (March 2026 Public Summary): an intentional domain rebrand off the
# Pelmorex name, with both feeds maintained concurrently for 6 months (legacy
# host sunsets ~late Sept 2026).
#
# Neither host alone is complete (issue #38). Measured 2026-07-23 from
# simultaneous samples: rss.alertready.ca retains ~48 h of history but
# persistently omits ~10 live status=Actual alerts at any moment that pelmorex
# carries (one OID absent across 110 of 179 probe samples, ~11.5 h); pelmorex
# retains only ~13.5 h, so it drops alerts older than that which alertready still
# serves. "auto" fetches both and unions their entries deduplicated by CAP OID,
# which is complete on both axes. The rss.alertready.ca Atom <id> authority is
# "rsstrainingdqs.alertready.ca" — that is the tag-URI authority of the feed
# generator instance, *not* a per-alert test marker (all 1,254 entries carry it,
# and the OIDs behind them are the same alerts pelmorex serves), so it is NOT
# filtered on.
NAAD_FEED_ALERTREADY = "https://rss.alertready.ca/"
NAAD_FEED_PELMOREX = "https://rss.naad-adna.pelmorex.com/"
NAAD_FEED_HOSTS: dict[str, str] = {
    "alertready": NAAD_FEED_ALERTREADY,
    "pelmorex": NAAD_FEED_PELMOREX,
}
# Union / href tie-break priority: the first host to yield a surviving entry for
# a given CAP OID wins, so its CAP href is the one fetched. alertready is first
# because it serves CAP bodies over HTTPS (pelmorex serves them over plain HTTP)
# and is the endpoint that survives the September 2026 sunset.
NAAD_FEED_UNION_ORDER: tuple[str, ...] = ("alertready", "pelmorex")

# The alertready.ca feed is a large (~7 MB) chunked response with no
# Content-Length, served behind istio-envoy. When the upstream stream is
# terminated early, aiohttp returns a partial (or empty) body *without* raising
# a ClientError, so parsing it fails at a random offset ("no element found",
# "unclosed token"). The endpoint offers no server-side filtering, compression,
# range, or conditional GET, so the whole document must be pulled each poll. We
# guard by requiring a complete document (non-empty, ending in </feed>) and
# retrying a bounded number of times, so a single truncation doesn't blank the
# entry for a whole poll cycle.
_FEED_FETCH_ATTEMPTS = 3
_FEED_RETRY_BACKOFF_S = 0.5

NS_ATOM = "http://www.w3.org/2005/Atom"
NS_GEORSS = "http://www.georss.org/georss"
NS_CAP = "urn:oasis:names:tc:emergency:cap:1.2"

# ECCC Canadian Location Code area geocode scheme. Land zones carry a
# province-numbered prefix (e.g. QC=03, SK=06, BC=08); marine/water zones get
# no province prefix and start with "00". Verified perfect separation on 552
# live CAP files (summer/squall-heavy sample — re-verify against winter
# gale/storm warnings). Fail-open: a mis-prefixed marine zone stays visible.
# Read off the canonicalized container, not the raw CAP ``valueName``: the
# feed publishes ``layer:EC-MSC-SMC:<version>:CLC`` and ``geocodes_from()``
# folds every version onto this one name.
_CLC_GEOCODE_KEY = GEOCODE_CLC
# The "00" prefix itself lives in the convention table; re-bound here so this
# module still names the scheme it belongs to.
ECCC_MARINE_CLC_PREFIX = _ECCC_MARINE_CLC_PREFIX

# ECCC CAP bodies carry a Statistics Canada SGC location code under this
# geocode valueName; the first two digits are the province/territory SGC code.
# This is the province signal used for province-configured filtering since the
# alertready.ca migration dropped the Atom-envelope "geocode" category. Preferred
# over the CLC prefix: present on effectively every alert (CLC is occasionally
# absent) and correct for water zones, which all share CLC prefix "00" but keep
# their province in the SGC code (e.g. Lake Nipigon → 35 = Ontario).
# Canonical name for ``profile:CAP-CP:Location:<version>``; see ``_CLC_GEOCODE_KEY``.
_SGC_GEOCODE_KEY = GEOCODE_SGC

# 2-letter province/territory code → StatCan SGC 2-digit code (SGC 2021).
_PROVINCE_TO_SGC: dict[str, str] = {
    "NL": "10",
    "PE": "11",
    "NS": "12",
    "NB": "13",
    "QC": "24",
    "ON": "35",
    "MB": "46",
    "SK": "47",
    "AB": "48",
    "BC": "59",
    "YT": "60",
    "NT": "61",
    "NU": "62",
}

# Coarse province/territory bounding boxes for the province-mode envelope
# pre-filter, as (min_lon, min_lat, max_lon, max_lat) — the repo-wide bbox order,
# matching the [lon, lat] polygon storage. Since the alertready.ca migration the
# envelope carries no geographic category, so province mode would otherwise have
# to fetch the CAP body of every national Actual entry (~1800) just to read its
# SGC code — unfeasible inside the poll timeout. Instead we reject entries whose
# georss-polygon bbox does not intersect the (padded) province box before the
# fetch. This is a coarse gate only: survivors are still confirmed by the
# authoritative SGC check (_matches_province_sgc), so the boxes are rounded
# outward generously — over-inclusion is harmless (SGC removes it), while a
# too-tight box would drop a real in-province alert.
_PROVINCE_BBOX: dict[str, tuple[float, float, float, float]] = {
    "NL": (-67.9, 46.6, -52.5, 60.4),
    "PE": (-64.5, 45.9, -61.9, 47.1),
    "NS": (-66.4, 43.3, -59.7, 47.1),
    "NB": (-69.1, 44.5, -63.7, 48.1),
    "QC": (-79.8, 44.9, -57.1, 62.6),
    "ON": (-95.2, 41.6, -74.3, 56.9),
    "MB": (-102.2, 48.9, -88.9, 60.1),
    "SK": (-110.0, 48.9, -101.3, 60.1),
    "AB": (-120.1, 48.9, -109.9, 60.1),
    "BC": (-139.1, 48.2, -114.0, 60.1),
    "YT": (-141.1, 59.9, -123.7, 69.7),
    "NT": (-136.6, 59.9, -101.9, 78.9),
    "NU": (-120.5, 51.5, -60.9, 83.2),
}

# Degrees added to every side of a province box before the intersection test.
# Absorbs polygon coordinate imprecision and near-shore marine zones spilling
# just past the land boundary; residual over-inclusion is cleaned up by the SGC
# check.
_PROVINCE_BBOX_PAD_DEG = 0.5


_ECCC_CONVENTIONS = conventions_for("eccc")


def _is_marine_eccc(clc: tuple[str, ...]) -> bool:
    """Return True if any CLC area geocode is a marine/water zone ("00…")."""
    return is_marine_code(clc, _ECCC_CONVENTIONS)


# ---------------------------------------------------------------------------
# Feed source resolution + cross-host deduplication
# ---------------------------------------------------------------------------


def resolve_feed_urls(options: Mapping[str, Any]) -> list[tuple[str, str]]:
    """Return the ``(source_id, url)`` pairs to fetch, in union priority order.

    ``feed_source`` "auto" (the default, and any unrecognised value — fail open)
    yields every host in ``NAAD_FEED_UNION_ORDER``; a named host yields just that
    one, as an escape hatch pinning a single feed.
    """
    source = options.get(CONF_FEED_SOURCE, DEFAULT_FEED_SOURCE)
    if source in NAAD_FEED_HOSTS:
        return [(source, NAAD_FEED_HOSTS[source])]
    return [(host, NAAD_FEED_HOSTS[host]) for host in NAAD_FEED_UNION_ORDER]


# CAP OID embedded in an Atom <id> tag URI, e.g.
# "tag:rsstrainingdqs.alertready.ca,2026:feed.atom/urn:oid:2.49.0.1.124.…".
# The same alert on both hosts carries the same OID under a different tag
# authority, so the OID is the cross-host identity.
_ATOM_ID_OID_RE = re.compile(r"urn:oid:[\w.]+")


def _entry_oid(entry: Element) -> str:
    """Return an Atom entry's CAP OID for cross-host deduplication.

    Reads the ``urn:oid:…`` out of the Atom ``<id>``. Fails open to the whole
    ``<id>`` when no OID is present, which preserves per-entry identity for feeds
    whose ids carry no OID (e.g. the synthetic ``eccc_naad_atom.xml`` fixture).
    """
    atom_id = entry.findtext(f"{{{NS_ATOM}}}id", "") or ""
    match = _ATOM_ID_OID_RE.search(atom_id)
    return match.group(0) if match else atom_id


# ---------------------------------------------------------------------------
# Atom envelope helpers (unchanged from original)
# ---------------------------------------------------------------------------


def _parse_categories(entry: Element) -> dict[str, str]:
    """Extract category term key=value pairs from an Atom entry."""
    cats: dict[str, str] = {}
    for cat in entry.findall(f"{{{NS_ATOM}}}category"):
        term = cat.get("term", "")
        if "=" in term:
            key, _, val = term.partition("=")
            cats[key.strip()] = val.strip()
    return cats


def _parse_georss_polygons(entry: Element) -> list[list[list[float]]]:
    """Parse all <georss:polygon> into a list of lists of [lon, lat] coordinate pairs."""
    polygons: list[list[list[float]]] = []
    for poly_el in entry.findall(f"{{{NS_GEORSS}}}polygon"):
        polygon = _parse_georss_polygon(poly_el)
        if polygon is not None:
            polygons.append(polygon)
    return polygons


def _parse_georss_polygon(poly_el: Element[str]) -> list[list[float]] | None:
    """Parse <georss:polygon> into a list of [lon, lat] coordinate pairs.

    GeoRSS writes a flat ``lat lon lat lon`` run rather than CAP's ``lat,lon``
    tokens, so only the tokenizing differs; the pair count, numeric parsing,
    and fail-closed behaviour are shared with the CAP parser so the two cannot
    drift (issue #85).
    """
    if not poly_el.text:
        return None
    parts = poly_el.text.strip().split()
    # An odd token count is malformed GeoRSS specifically — a dangling
    # latitude with no longitude — so it is checked here rather than shared.
    if len(parts) % 2 != 0:
        return None
    return ring_from_lat_lon_pairs(
        (parts[i], parts[i + 1]) for i in range(0, len(parts), 2)
    )


def _point_in_polygons(
    lat: float, lon: float, polygons: list[list[list[float]]]
) -> bool:
    """Check if a point is in any of the polygons."""
    for polygon in polygons:
        if point_in_polygon(lat, lon, polygon):
            return True
    return False


def _matches_province_sgc(geocodes: Mapping[str, Sequence[str]], province: str) -> bool:
    """Check if a CAP body's SGC location codes fall in the configured province.

    Reads ``profile:CAP-CP:Location:<version>`` geocodes from the CAP body (the
    Atom envelope no longer carries province info after the alertready.ca
    migration); the first two digits are the StatCan SGC province/territory
    code. Takes the raw CAP mapping and canonicalizes it here, so a caller
    cannot pass an un-normalized body and silently match nothing.
    """
    sgc_prefix = _PROVINCE_TO_SGC.get(province.upper())
    if sgc_prefix is None:
        return False
    canonical = geocodes_from(geocodes)
    return any(v.startswith(sgc_prefix) for v in canonical.get(_SGC_GEOCODE_KEY, ()))


def _bbox_of_polygons(
    polygons: list[list[list[float]]],
) -> tuple[float, float, float, float] | None:
    """Return (min_lon, min_lat, max_lon, max_lat) over all [lon, lat] vertices.

    Returns ``None`` when there are no vertices to bound.
    """
    min_lon = min_lat = float("inf")
    max_lon = max_lat = float("-inf")
    for ring in polygons:
        for lon, lat in ring:
            min_lon = min(min_lon, lon)
            max_lon = max(max_lon, lon)
            min_lat = min(min_lat, lat)
            max_lat = max(max_lat, lat)
    if min_lon == float("inf"):
        return None
    return (min_lon, min_lat, max_lon, max_lat)


def _province_bbox_intersects(polygons: list[list[list[float]]], province: str) -> bool:
    """Return True if the alert geometry plausibly touches the province.

    Coarse envelope pre-filter for province mode: tests the alert polygon's
    bounding box against the configured province's (padded) box. Fails open —
    an unknown province code or geometry with no boundable vertices returns
    True, deferring the decision to the authoritative SGC check.
    """
    box = _PROVINCE_BBOX.get(province.upper())
    if box is None:
        return True
    alert_bbox = _bbox_of_polygons(polygons)
    if alert_bbox is None:
        return True
    a_min_lon, a_min_lat, a_max_lon, a_max_lat = alert_bbox
    p_min_lon, p_min_lat, p_max_lon, p_max_lat = box
    pad = _PROVINCE_BBOX_PAD_DEG
    return (
        a_min_lon <= p_max_lon + pad
        and a_max_lon >= p_min_lon - pad
        and a_min_lat <= p_max_lat + pad
        and a_max_lat >= p_min_lat - pad
    )


# ---------------------------------------------------------------------------
# CAP XML parsing
# ---------------------------------------------------------------------------


def _pick_cap_link(entry: Element) -> tuple[str, str]:
    """Return (cap_url, web_url) from Atom entry <link> elements.

    Prefers explicit MIME types; falls back to href extension heuristics.
    """
    cap_url = ""
    web_url = ""

    for link_el in entry.findall(f"{{{NS_ATOM}}}link"):
        href = link_el.get("href", "")
        link_type = link_el.get("type", "")
        if not cap_url and link_type == "application/cap+xml":
            cap_url = href
        if not web_url and link_type == "text/html":
            web_url = href

    # Fallback: extension heuristics for links without explicit type
    if not cap_url or not web_url:
        for link_el in entry.findall(f"{{{NS_ATOM}}}link"):
            href = link_el.get("href", "")
            link_type = link_el.get("type", "")
            if link_type in ("application/cap+xml", "text/html"):
                continue
            href_lower = href.lower()
            if not cap_url and (
                href_lower.endswith(".cap") or href_lower.endswith(".xml")
            ):
                cap_url = href
            elif not web_url:
                web_url = href

    return cap_url, web_url


# ---------------------------------------------------------------------------
# Info selection
# ---------------------------------------------------------------------------


def _language_matches(info_lang: str, preferred: str) -> bool:
    """Check language match with BCP 47 primary-subtag fallback.

    Exact match wins (``en-CA`` == ``en-CA``). When that fails, the primary
    subtag (the part before the first ``-``) is compared so that a bare
    ``en`` info block matches a preferred ``en-CA`` and vice-versa. This
    hardens against CAP documents that declare a bare primary subtag
    instead of the full region-tagged form the ECCC feed normally carries.
    """
    if not info_lang or not preferred:
        return False
    if info_lang == preferred:
        return True
    return (
        preferred.split("-", 1)[0].casefold() == info_lang.split("-", 1)[0].casefold()
    )


def _select_info(doc: CAPDoc, language: str) -> CAPInfoDoc:
    """Pick the <info> block matching language; fall back to first.

    Language-only selection, with no notion of area groups — correct for a
    single-area-group document, and still the right helper wherever the caller
    has already decided which area group it means. Region-aware callers want
    ``_select_region_info``.
    """
    if not doc.infos:
        return CAPInfoDoc()
    for info in doc.infos:
        if _language_matches(info.language, language):
            return info
    return doc.infos[0]


def _location_status(info: CAPInfoDoc) -> str:
    """Return the ECCC ``Alert_Location_Status`` of an <info> block, or "".

    Reads ``_ALERT_LOCATION_STATUS_PARAM_KEYS`` in precedence order (v1.1 before
    v1.0). An empty result means the block carries no lifecycle signal, which is
    read as active everywhere downstream.
    """
    for key in _ALERT_LOCATION_STATUS_PARAM_KEYS:
        value = info.parameters.get(key, "").strip()
        if value:
            return value
    return ""


def _is_terminal_info(info: CAPInfoDoc) -> bool:
    """Whether this area group has ended (``ended`` / ``transitioned_out``).

    Fails open: an absent parameter, or a value outside
    ``ECCC_TERMINAL_LOCATION_STATUSES``, is not terminal.
    """
    return _location_status(info) in ECCC_TERMINAL_LOCATION_STATUSES


def _select_region_info(
    doc: CAPDoc,
    *,
    language: str,
    province: str,
    gps_lat: float | None,
    gps_lon: float | None,
) -> CAPInfoDoc | None:
    """Pick the <info> block for this region and language, preferring an active one.

    ECCC emits one block per (language × area group), so "the block matching the
    language" is ambiguous the moment a document covers areas at different
    lifecycle stages — and taking the first match reads another area group's
    expires, severity and headline (issue #45). The rule instead is: among the
    blocks whose ``<area>`` matches the configured region, prefer a non-terminal
    one; if *every* region-matching block has ended, the alert is terminal here
    and that block is returned so its ``lifecycle_status`` can retire the entity.

    Returns ``None`` when no block matches the region — the document does not
    concern this configuration and is skipped, exactly as before.

    Province mode keeps province granularity: an SGC prefix cannot distinguish
    sub-province areas, so "any in-province block still active ⇒ still active"
    is the intended reading. Announcing an all-clear to users in the part of the
    province where the alert is still live would be the worse failure.
    """
    candidates = (
        [info for info in doc.infos if _language_matches(info.language, language)]
        if language
        else []
    )
    if not candidates:
        # No block declares this language (single-language document, or a
        # document with no <language> at all) — consider them all, preserving
        # _select_info's fall-back-to-first behaviour.
        candidates = list(doc.infos)

    matches = [
        info
        for info in candidates
        if _info_matches_region(info, province, gps_lat, gps_lon)
    ]
    if not matches:
        return None
    for info in matches:
        if not _is_terminal_info(info):
            return info
    return matches[0]


# ---------------------------------------------------------------------------
# Event name normalisation
# ---------------------------------------------------------------------------

# ECCC CAP XML uses a generic category string in <event> for some alert types
# (e.g. "weather" for Special Weather Statements).  When that happens the
# specific event name is only available in <headline>, formatted as:
#   "<Event Type> in effect [for <Area>]"
#   "<Event Type> continued"
#   "<Event Type> ended"   … etc.
_ECCC_GENERIC_EVENTS: frozenset[str] = frozenset({"weather"})

# ECCC CAP <parameter> keys carrying the canonical event name (e.g.
# "yellow warning - wind").  v1.1 preferred when both layers are present.
_ALERT_NAME_PARAM_KEYS: tuple[str, ...] = (
    "layer:EC-MSC-SMC:1.1:Alert_Name",
    "layer:EC-MSC-SMC:1.0:Alert_Name",
)

# ECCC segments one CAP document into an <info> block per (language × area
# group), each with its own <area>, expires, severity and headline. This
# parameter is the area-group discriminator. v1.1 preferred when both layers are
# present, matching _ALERT_NAME_PARAM_KEYS precedence (a national snapshot taken
# 2026-07-22 carried both on the same block with identical values).
_ALERT_LOCATION_STATUS_PARAM_KEYS: tuple[str, ...] = (
    "layer:EC-MSC-SMC:1.1:Alert_Location_Status",
    "layer:EC-MSC-SMC:1.0:Alert_Location_Status",
)

# Values meaning the alert has reached end-of-life *for that area group*:
# "ended" is a natural expiry, "transitioned_out" means the area moved to a
# different alert (yellow → orange), which arrives as its own document. Neither
# is visible through msgType — ECCC keeps `Update` and leaves up to an hour of
# `expires` on the clock — so this parameter is the only termination signal the
# feed offers (issue #45). Fail-open by design: a block with no such parameter,
# or with an unrecognised value, is treated as active. 11 of 92 sampled
# documents came from non-ECCC senders (Amber, flood, 911) and carry no
# Alert_Location_Status at all; reading absence as terminal would drop them.
ECCC_TERMINAL_LOCATION_STATUSES: frozenset[str] = frozenset(
    {"ended", "transitioned_out"}
)

# Trailing separator chars left over after stripping a status suffix from a
# colour-coded headline like "Yellow Warning - Wind - in effect".
_TRAILING_SEPARATORS = re.compile(r"[\s\-–—:,;·]+$")


def _strip_trailing_separators(text: str) -> str:
    return _TRAILING_SEPARATORS.sub("", text)


# Status suffixes stripped from ECCC headlines to recover the bare event type.
# Ordered longest-first so " in effect for " beats " in effect".
_HEADLINE_SUFFIXES: tuple[str, ...] = (
    " in effect for ",
    " en vigueur pour ",
    " in effect",
    " en vigueur",
    " continued for ",
    " continued",
    " maintenu pour ",
    " maintenue pour ",
    " maintenu",
    " maintenue",
    " ended",
    " terminé",
    " terminée",
    " cancelled",
    " annulé",
    " annulée",
    " lifted",
    " levé",
    " levée",
    " extended for ",
    " prolongé pour ",
    " extended",
    " prolongé",
    " prolongée",
)


def _headline_to_event(headline: str) -> str:
    """Strip a status suffix from an ECCC headline to recover the event type.

    Example: "Special Weather Statement in effect for James Bay" → "Special Weather Statement"
    """
    text = headline.strip()
    lower = text.lower()
    for suffix in _HEADLINE_SUFFIXES:
        idx = lower.find(suffix)
        if idx > 0:
            return _strip_trailing_separators(text[:idx].strip())
    return text


def _best_event_name(
    event: str,
    headline: str,
    atom_title: str = "",
    parameters: Mapping[str, str] | None = None,
) -> str:
    """Return the best display name for an ECCC alert event.

    ECCC's CAP <event> is a generic category ("weather") or a lowercase event
    type ("special weather statement").  Production data is often all-lowercase
    across the Atom <title>, the CAP <headline>, and <event>.  We try sources
    in order of fidelity:
      1. CAP <parameter> ``Alert_Name`` — the provider's canonical event name.
      2. Atom <title> / CAP <headline> with status suffix stripped.
      3. Raw CAP <event>.
    Results are title-cased only when nothing properly-cased is available.
    """
    if parameters:
        for key in _ALERT_NAME_PARAM_KEYS:
            candidate = parameters.get(key, "").strip()
            candidate = _strip_trailing_separators(candidate)
            if not candidate:
                continue
            return candidate if candidate != candidate.lower() else candidate.title()

    for candidate in (atom_title, headline):
        if not candidate:
            continue
        extracted = _headline_to_event(candidate)
        if not extracted:
            continue
        if extracted != extracted.lower():
            return extracted
        return extracted.title()
    if event:
        return event if event != event.lower() else event.title()
    return event


# ---------------------------------------------------------------------------
# Alert identity
# ---------------------------------------------------------------------------


def _bilingual_key(doc: CAPDoc, info: CAPInfoDoc) -> str:
    """Compute a language-independent 12-hex ID shared by en/fr siblings.

    Uses (sender, sent, primary CAP-CP eventCode value, polygon-hash).
    Urgency is excluded by design — urgency shifts between revisions and
    caused the original dedup bug in ``_compute_eccc_id``.
    """
    primary_event_code = next((v for v in info.event_codes.values() if v), "")

    if info.polygons:
        poly_parts = [
            f"{round(lon, 6)},{round(lat, 6)}"
            for ring in info.polygons
            for lon, lat in ring
        ]
        polygon_hash = hashlib.sha256(" ".join(poly_parts).encode()).hexdigest()[:16]
    else:
        polygon_hash = ""

    if not primary_event_code and not polygon_hash:
        _LOGGER.warning(
            "ECCC: alert %s has no eventCode or polygon; bilingual pairing may fail",
            doc.identifier,
        )
        key = f"{doc.sender}|{doc.sent}|{info.area_desc}"
    else:
        key = f"{doc.sender}|{doc.sent}|{primary_event_code}|{polygon_hash}"

    return hashlib.sha256(key.encode()).hexdigest()[:12]


def _fallback_id(atom_id: str, language: str) -> str:
    """Fallback ID for metadata-only alerts when CAP fetch fails."""
    return hashlib.sha256(f"{atom_id}|{language}".encode()).hexdigest()[:12]


# ---------------------------------------------------------------------------
# CAPAlert construction
# ---------------------------------------------------------------------------


def _build_alert_from_cap(
    doc: CAPDoc,
    info: CAPInfoDoc,
    atom_metadata: dict[str, Any],
    fallback_web: str,
    alert_id: str,
) -> CAPAlert:
    """Build CAPAlert from CAP body fields."""
    points = points_from_circles(info.circles)
    geometry = geometry_from_shapes(info.polygons, points)

    # Merge event_codes into parameters (parameters win on collision)
    merged_params: dict[str, str] = {**info.event_codes, **info.parameters}

    geocodes = geocodes_from(info.geocodes)
    clc = tuple(geocodes.get(_CLC_GEOCODE_KEY, ()))

    return CAPAlert(
        id=alert_id,
        url=atom_metadata.get("atom_id", ""),
        identifier=doc.identifier,
        event=_best_event_name(
            info.event,
            info.headline,
            atom_metadata.get("title", ""),
            info.parameters,
        ),
        msg_type=doc.msg_type,
        status=doc.status,
        scope=doc.scope,
        category=info.category,
        urgency=info.urgency,
        severity=info.severity,
        certainty=info.certainty,
        response_type=",".join(info.response_type) if info.response_type else "",
        sent=doc.sent,
        effective=info.effective,
        onset=info.onset,
        expires=info.expires,
        headline=info.headline,
        description=info.description,
        instruction=info.instruction or None,
        web=info.web or fallback_web,
        area_desc=info.area_desc,
        geometry=geometry,
        points=tuple((lon, lat) for lon, lat in points),
        geocodes=geocodes,
        is_marine=_is_marine_eccc(clc),
        sender=doc.sender,
        sender_name=info.sender_name,
        references=tuple(ref_id for _, ref_id, _ in doc.references),
        parameters=merged_params if merged_params else None,
        language=info.language or atom_metadata.get("language", ""),
        lifecycle_status=_location_status(info),
        provider="eccc",
    )


def _build_fallback_alert(
    atom_metadata: dict[str, Any],
    fallback_web: str,
    alert_id: str,
) -> CAPAlert:
    """Build a metadata-only CAPAlert from Atom envelope on CAP fetch failure."""
    polygon = atom_metadata.get("polygon")
    geometry = geometry_from_polygons([polygon] if polygon else [])
    event_raw = atom_metadata.get("event", "")
    title_raw = atom_metadata.get("title", "")
    event = _best_event_name(event_raw, "", title_raw)
    return CAPAlert(
        id=alert_id,
        url=atom_metadata.get("atom_id", ""),
        event=event,
        msg_type=atom_metadata.get("msg_type", ""),
        status=atom_metadata.get("status", ""),
        severity=atom_metadata.get("severity", ""),
        urgency=atom_metadata.get("urgency", ""),
        certainty=atom_metadata.get("certainty", ""),
        area_desc=atom_metadata.get("area_desc", ""),
        geometry=geometry,
        web=fallback_web,
        language=atom_metadata.get("language", ""),
        provider="eccc",
    )


# ---------------------------------------------------------------------------
# Bilingual merge (unchanged logic, new key basis)
# ---------------------------------------------------------------------------


def _merge_languages(variants: list[CAPAlert], preferred_lang: str) -> CAPAlert:
    """Merge bilingual variants into one alert with primary + alt content."""
    if len(variants) == 1:
        return variants[0]

    primary = None
    alt = None
    for v in variants:
        if _language_matches(v.language, preferred_lang):
            primary = v
        else:
            alt = v

    if primary is None:
        primary = variants[0]
        alt = variants[1] if len(variants) > 1 else None

    if alt is None:
        return primary

    return replace(
        primary,
        event_alt=alt.event,
        headline_alt=alt.headline,
        description_alt=alt.description,
        instruction_alt=alt.instruction,
        language_alt=alt.language,
    )


# ---------------------------------------------------------------------------
# Shared doc → alert builder
# ---------------------------------------------------------------------------


def is_actual(doc: CAPDoc) -> bool:
    """Whether a CAP doc is a real alert rather than test/exercise traffic.

    The GeoRSS path drops non-``Actual`` entries on the Atom envelope before the
    body is ever fetched, but the streaming feed carries the whole NAAD channel —
    ``Test``, ``Exercise`` and ``Draft`` messages included — so the rule lives
    here, on the one path both ingestion sources share. Fails open on an absent
    status: ``<status>`` is mandatory in CAP 1.2, so its absence means a
    malformed document, and dropping a real alert over a parse quirk is the
    worse error.

    Public because the coordinator's streaming admission needs it directly: its
    "references something we already track" escape bypasses ``doc_matches_region``
    entirely, so the status rule has to be applied ahead of that branch too.
    """
    return not doc.status or doc.status == "Actual"


def _info_matches_region(
    info: CAPInfoDoc,
    province: str,
    gps_lat: float | None,
    gps_lon: float | None,
) -> bool:
    """Whether a CAP ``<info>`` block falls inside the configured region.

    Province mode tests the authoritative SGC geocode; GPS/tracker mode runs a
    point-in-polygon test against the CAP-body polygon.
    """
    if province and not _matches_province_sgc(info.geocodes, province):
        return False
    if (
        gps_lat is not None
        and gps_lon is not None
        and not _point_in_polygons(gps_lat, gps_lon, info.polygons)
    ):
        return False
    return True


def doc_matches_region(
    doc: CAPDoc,
    *,
    province: str,
    gps_lat: float | None,
    gps_lon: float | None,
    preferred_lang: str,
) -> bool:
    """Whether a streamed CAP document is worth keeping for this configuration.

    The streaming admission test. The socket carries every alert in Canada, so
    the coordinator screens docs here — before they enter its live set — rather
    than paying for national volume in memory and in every rebuild.

    Deliberately looser than the later build: a document matches when **any** of
    its ``<info>`` blocks falls in the region, terminal or not, and the language
    is ignored entirely (``preferred_lang`` is kept only for signature
    compatibility with the coordinator's build kwargs). A document whose only
    in-region block is ``ended`` is precisely the one that retires a tracked
    alert; rejecting it at admission would mean the coordinator never learns the
    alert ended and the entity lingers — issue #45 on the streaming path.
    Terminality is resolved later, in ``build_alerts_from_cap_docs``.
    """
    if not is_actual(doc):
        return False
    return any(
        _info_matches_region(info, province, gps_lat, gps_lon) for info in doc.infos
    )


def build_alerts_from_cap_docs(
    docs: list[CAPDoc],
    *,
    province: str,
    gps_lat: float | None,
    gps_lon: float | None,
    preferred_lang: str,
    atom_meta_by_id: Mapping[str, dict[str, Any]] | None = None,
    web_by_id: Mapping[str, str] | None = None,
) -> list[CAPAlert]:
    """Build merged bilingual ``CAPAlert``s from parsed CAP documents.

    The provider-neutral half of ingestion, shared by the GeoRSS ``async_fetch``
    path and the real-time streaming path: drop non-``Actual`` documents,
    de-duplicate by CAP ``identifier``, resolve revision chains to leaves, then
    for each language the document carries select the ``<info>`` block covering
    the configured region (province via SGC geocode, GPS via CAP-body polygon),
    preferring one that has not ended. Selected blocks are grouped by bilingual
    key and merged into one alert per document.

    De-duplication matters because the GeoRSS envelope emits one Atom entry per
    (language × area group) while all of them point at the *same* CAP body, so
    ``async_fetch`` hands over the same document up to four times; the streaming
    path can likewise re-deliver one. Left in, each copy resolved to the same
    ``<info>``, the same bilingual key, and the merge would splice an alert with
    itself — publishing the same language in both ``headline`` and
    ``headline_alt``.

    Language selection reads the CAP body only. The Atom entry's ``language``
    category describes which entry happened to be last in feed order, not what
    the user asked for, so ``preferred_lang`` is honoured directly against the
    bodies (which carry both languages anyway).

    ``atom_meta_by_id`` / ``web_by_id`` (keyed by CAP ``identifier``) let the
    GeoRSS path supply Atom-envelope niceties (entry id, title, alternate web
    link) so its output is unchanged; the streaming path omits them and builds
    purely from the CAP body.
    """
    # Screen test/exercise traffic before chain resolution, so a test message's
    # <references> cannot suppress the real alert it points at.
    docs = [doc for doc in docs if is_actual(doc)]
    docs = _dedupe_by_identifier(docs)
    leaf_ids = {d.identifier for d in resolve_chain_leaves(docs)}
    groups: dict[str, list[CAPAlert]] = defaultdict(list)

    for doc in docs:
        if doc.identifier not in leaf_ids:
            continue
        meta = (atom_meta_by_id or {}).get(doc.identifier, {})
        web_url = (web_by_id or {}).get(doc.identifier, "")
        for info in _select_region_infos(
            doc, province=province, gps_lat=gps_lat, gps_lon=gps_lon
        ):
            alert_id = _bilingual_key(doc, info)
            alert = _build_alert_from_cap(doc, info, meta, web_url, alert_id)
            groups[alert.id].append(alert)

    return [_merge_languages(variants, preferred_lang) for variants in groups.values()]


def _dedupe_by_identifier(docs: list[CAPDoc]) -> list[CAPDoc]:
    """Drop repeated CAP documents, keeping the first occurrence of each.

    Documents with an empty ``identifier`` cannot be keyed and are all kept —
    an unidentifiable body is malformed, and silently collapsing several into
    one would lose real alerts.
    """
    seen: set[str] = set()
    unique: list[CAPDoc] = []
    for doc in docs:
        if doc.identifier:
            if doc.identifier in seen:
                continue
            seen.add(doc.identifier)
        unique.append(doc)
    return unique


def _select_region_infos(
    doc: CAPDoc,
    *,
    province: str,
    gps_lat: float | None,
    gps_lon: float | None,
) -> list[CAPInfoDoc]:
    """Select one region-matching ``<info>`` block per language in the document.

    One pass of ``_select_region_info`` per declared language, so a bilingual
    document still yields the en/fr sibling pair the merge expects, and each
    sibling resolves to its *own* language's block for the same area group.
    A document declaring no language at all gets a single unconstrained pass.

    Results are de-duplicated by identity: a document mixing language-tagged and
    untagged blocks would otherwise reach the same block twice (once by tag,
    once via the unconstrained fall-back) and hand the merge two copies of one
    variant.
    """
    languages = sorted({info.language for info in doc.infos if info.language}) or [""]
    selected: list[CAPInfoDoc] = []
    for language in languages:
        info = _select_region_info(
            doc,
            language=language,
            province=province,
            gps_lat=gps_lat,
            gps_lon=gps_lon,
        )
        if info is not None and not any(info is chosen for chosen in selected):
            selected.append(info)
    return selected


# ---------------------------------------------------------------------------
# Provider
# ---------------------------------------------------------------------------


class ECCCProvider:
    """Environment Canada NAAD Atom feed provider."""

    def __init__(self) -> None:
        # Warn-once-per-streak state, keyed by feed source id: True while a host
        # is in a failure streak so the union logs one warning per streak, reset
        # on that host's next success.
        self._feed_warned: dict[str, bool] = {}

    @property
    def name(self) -> str:
        return "eccc"

    async def async_validate_config(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        *,
        user_agent: str | None = None,
    ) -> str | None:
        """Check the province code, without a request.

        The NAAD feed is national — every province is served by the same two
        hosts — so there is no per-scope endpoint to ask. What can be wrong is
        the code itself, and that is answerable from the SGC table the province
        filter matches on: a code absent from it filters everything out and the
        entry would never produce an alert.

        Deliberately *not* wired into the config flow, which reaches
        ``_validate_province`` against the same 13 codes before this could ever
        fire. It implements the protocol for the paths the flow does not own —
        a hand-edited entry, or a future import — rather than duplicating a
        check the form already makes.
        """
        province = str(config.get(CONF_PROVINCE, "") or "").strip().upper()
        if not province:
            return None
        return None if province in _PROVINCE_TO_SGC else "invalid_province"

    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        options: Mapping[str, Any],
        *,
        cap_content_cache: CAPContentCache | None = None,
        user_agent: str | None = None,
    ) -> list[CAPAlert]:
        """Fetch active alerts from the ECCC NAAD GeoRSS feed.

        Runs the envelope pre-filter + CAP-body fetch/parse (``_collect``), builds
        merged bilingual alerts from the successfully-parsed docs via the shared
        ``build_alerts_from_cap_docs``, and — for survivors whose CAP body could
        not be fetched — applies the Atom-envelope fallback: province mode fails
        closed (drops, cannot verify location), GPS/tracker mode surfaces a
        metadata-only alert (its location was already verified by the envelope
        polygon).

        ``_collect`` returns one result per surviving *Atom entry*, and the feed
        emits an entry per (language × area group) while all of them link to one
        CAP body, so ``docs`` legitimately contains repeats — de-duplicating
        them is ``build_alerts_from_cap_docs``'s job. The ``identifier``-keyed
        metadata maps below are therefore last-write-wins across an entry group;
        harmless, since selection no longer reads the entry's language and the
        remaining keys (atom id, title, web link) are per-document.
        """
        preferred_lang = options.get(CONF_LANGUAGE, "en-CA")
        province = config.get(CONF_PROVINCE, "")
        gps_lat, gps_lon = self._parse_gps(config)

        results = await self._collect(
            session,
            config,
            options,
            cap_content_cache=cap_content_cache,
            user_agent=user_agent,
        )

        docs = [doc for _, _, doc in results if doc is not None]
        atom_meta_by_id = {
            doc.identifier: meta for meta, _, doc in results if doc is not None
        }
        web_by_id = {doc.identifier: web for _, web, doc in results if doc is not None}

        alerts = build_alerts_from_cap_docs(
            docs,
            province=province,
            gps_lat=gps_lat,
            gps_lon=gps_lon,
            preferred_lang=preferred_lang,
            atom_meta_by_id=atom_meta_by_id,
            web_by_id=web_by_id,
        )

        # Fallback for survivors whose CAP body could not be fetched/parsed.
        for atom_metadata, web_url, doc in results:
            if doc is not None:
                continue
            atom_id = atom_metadata["atom_id"]
            if province:
                # No CAP body → no SGC code → province can't be verified.
                # Fail closed: showing a province user an alert from elsewhere in
                # the country is worse than transiently missing one.
                _LOGGER.warning(
                    "ECCC: CAP fetch failed for atom id %s; dropping "
                    "(province mode cannot verify location without CAP body)",
                    atom_id,
                )
                continue
            alert_id = _fallback_id(atom_id, atom_metadata.get("language", "en-CA"))
            alerts.append(_build_fallback_alert(atom_metadata, web_url, alert_id))
            _LOGGER.warning(
                "ECCC: CAP fetch failed for atom id %s; surfacing metadata-only alert",
                atom_id,
            )

        return alerts

    async def async_fetch_docs(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        options: Mapping[str, Any],
        *,
        cap_content_cache: CAPContentCache | None = None,
        user_agent: str | None = None,
    ) -> list[CAPDoc]:
        """Fetch region-relevant CAP documents from the GeoRSS feed.

        The streaming backfill source: runs the same envelope pre-filter and
        CAP-body fetch/parse as ``async_fetch`` but returns the parsed ``CAPDoc``s
        directly, for the coordinator's live-doc set to merge. Unlike
        ``async_fetch`` there is no metadata-only fallback — a body that could not
        be fetched is simply omitted and recovered on a later backfill.
        """
        results = await self._collect(
            session,
            config,
            options,
            cap_content_cache=cap_content_cache,
            user_agent=user_agent,
        )
        return [doc for _, _, doc in results if doc is not None]

    async def _collect(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        options: Mapping[str, Any],
        *,
        cap_content_cache: CAPContentCache | None = None,
        user_agent: str | None = None,
    ) -> list[tuple[dict[str, Any], str, CAPDoc | None]]:
        """Run the GeoRSS envelope pre-filter + CAP-body fetch/parse.

        Returns one ``(atom_metadata, web_url, doc)`` tuple per surviving entry,
        with ``doc`` ``None`` when its CAP body could not be fetched or parsed:

        (a) Fetches the configured NAAD host(s) and unions their Atom entries
            (``_fetch_feed_entries``; ``options`` selects the feed source).
        (b) Pre-filters entries by status; province mode by georss-polygon bbox,
            GPS/tracker mode by georss-polygon point-in-polygon. The authoritative
            region check happens later against the CAP body.
        (b') Cross-host dedup: after an entry survives the region filter, the
            first survivor per CAP OID wins (the first host in
            ``NAAD_FEED_UNION_ORDER``), so a cross-host duplicate is collapsed
            before its CAP body is fetched. Deduplicating *survivors* (not raw
            entries) keeps the per-entry region test exact — see
            ``_fetch_feed_entries``.
        (c) Fetches CAP XML for survivors via a shared cache.
        (d) Parses CAP XML in the thread pool executor.
        """
        entries = await self._fetch_feed_entries(session, options)

        province = config.get(CONF_PROVINCE, "")
        gps_lat, gps_lon = self._parse_gps(config)

        if not province and gps_lat is None:
            return []

        # (b) Pre-filter entries using the Atom envelope
        SurvivorTuple = tuple[str, dict[str, Any], str]
        survivors: list[SurvivorTuple] = []
        seen: set[str] = set()

        for entry in entries:
            cats = _parse_categories(entry)

            if cats.get("status", "") != "Actual":
                continue

            area_desc = cats.get("areaDesc", "")
            summary = entry.findtext(f"{{{NS_ATOM}}}summary", "")
            if not area_desc and summary and summary.startswith("Area:"):
                area_desc = summary[5:].strip()

            geocode = cats.get("geocode", "")
            language = cats.get("language", "en-CA")

            if province:
                # The alertready.ca envelope no longer carries a "geocode"
                # category, so province can only be confirmed from the CAP body
                # (SGC code) after fetch. To avoid fetching every national Actual
                # entry, coarsely reject entries whose georss-polygon bbox does
                # not intersect the province box here; survivors are still
                # confirmed by SGC. Fail open: a polygonless entry is kept.
                polygons = _parse_georss_polygons(entry)
                if polygons and not _province_bbox_intersects(polygons, province):
                    continue
            else:
                polygons = _parse_georss_polygons(entry)
                if not _point_in_polygons(gps_lat, gps_lon, polygons):  # type: ignore[arg-type]
                    continue

            cap_url, web_url = _pick_cap_link(entry)
            atom_id = entry.findtext(f"{{{NS_ATOM}}}id", "")
            atom_title = entry.findtext(f"{{{NS_ATOM}}}title", "")

            atom_metadata: dict[str, Any] = {
                "atom_id": atom_id,
                "language": language,
                "area_desc": area_desc,
                "geocode": geocode,
                "event": cats.get("event", ""),
                "title": atom_title,
                "severity": cats.get("severity", ""),
                "urgency": cats.get("urgency", ""),
                "certainty": cats.get("certainty", ""),
                "msg_type": cats.get("msgType", ""),
                "status": cats.get("status", ""),
                "polygon": _parse_georss_polygon(entry),
            }
            # (b') Cross-host dedup on survivors: first host in union order wins.
            oid = _entry_oid(entry)
            if oid in seen:
                continue
            seen.add(oid)
            survivors.append((cap_url, atom_metadata, web_url))

        if not survivors:
            return []

        # (c) Fetch CAP XML with bounded concurrency
        cache = (
            cap_content_cache if cap_content_cache is not None else CAPContentCache()
        )
        semaphore = asyncio.Semaphore(5)

        async def _fetch_one(cap_url: str) -> str | None:
            if not cap_url:
                return None
            async with semaphore:
                return await cache.get_or_fetch(session, cap_url, user_agent=user_agent)

        bodies: list[str | None] = await asyncio.gather(
            *[_fetch_one(cap_url) for cap_url, _, _ in survivors]
        )

        # (d) Parse CAP XML in executor (CPU-bound)
        loop = asyncio.get_running_loop()
        results: list[tuple[dict[str, Any], str, CAPDoc | None]] = []
        for (_, atom_metadata, web_url), body in zip(survivors, bodies):
            if body is None:
                results.append((atom_metadata, web_url, None))
            else:
                doc = await loop.run_in_executor(None, parse_cap_alert, body)
                results.append((atom_metadata, web_url, doc))

        return results

    async def _fetch_feed_entries(
        self, session: aiohttp.ClientSession, options: Mapping[str, Any]
    ) -> list[Element]:
        """Fetch the configured NAAD host(s) and return their Atom entries.

        Hosts (``resolve_feed_urls``) are fetched in ``NAAD_FEED_UNION_ORDER``
        (also the href tie-break priority) and their entries concatenated in that
        order, with **no** deduplication here — dedup runs later in ``_collect``
        on the entries that survive the region filter, because the entries of one
        document are per (language × area group) and carry *different* polygons,
        so collapsing them before the region test could keep an area group the
        user is not in (issue #45 shape) and drop the document.

        Hosts are fetched sequentially rather than concurrently: since #49 made
        the GeoRSS path a ~30-minute backfill (not a hot poll), the latency of a
        second ~1 MB request is immaterial, and a sequential ``await`` keeps the
        whole fetch inside the caller's coroutine — an ``asyncio.gather`` here
        would spawn child tasks whose completion ordering makes the backfill
        availability signal (issue #16) race the coordinator's update cycle.

        Per-host failure is tolerated: as long as one host succeeds the union is
        returned, with one warning logged per failure streak per host. Only an
        all-hosts failure raises ``UpdateFailed``, naming each host and its error.
        """
        sources = resolve_feed_urls(options)
        entries: list[Element] = []
        failures: list[str] = []
        for source_id, url in sources:
            try:
                root = await self._fetch_one_feed(session, source_id, url)
            except Exception as err:  # noqa: BLE001 — one host down must not sink the union
                failures.append(f"{source_id} ({url}): {err}")
                # A pinned single host needs no warning here: its failure is the
                # whole fetch failing, which the UpdateFailed below reports.
                if len(sources) > 1 and not self._feed_warned.get(source_id):
                    _LOGGER.warning(
                        "ECCC: NAAD host %s failed (%s); continuing with the "
                        "other host",
                        source_id,
                        err,
                    )
                    self._feed_warned[source_id] = True
                continue
            self._feed_warned[source_id] = False
            entries.extend(root.findall(f"{{{NS_ATOM}}}entry"))

        if len(failures) == len(sources):
            raise UpdateFailed("ECCC: all NAAD hosts failed: " + "; ".join(failures))
        return entries

    async def _fetch_one_feed(
        self, session: aiohttp.ClientSession, source_id: str, url: str
    ) -> Element:
        """Fetch and parse one NAAD Atom feed, guarding against truncated downloads.

        The alertready.ca feed can be delivered incomplete: an early-terminated
        chunked stream makes ``resp.text()`` return a partial or empty body
        without raising, and parsing it fails at a random offset. A body that is
        not a complete document (empty, or not ending in ``</feed>``) is treated
        as a transient truncation and retried a bounded number of times before
        surfacing ``UpdateFailed`` (retried by the coordinator next poll).
        """
        last_error = "no attempts made"
        for attempt in range(1, _FEED_FETCH_ATTEMPTS + 1):
            async with session.get(url) as resp:
                if resp.status != 200:
                    raise UpdateFailed(
                        f"ECCC NAAD feed {source_id} returned {resp.status}"
                    )
                text = await resp.text()

            if text.rstrip().endswith("</feed>"):
                try:
                    return ET.fromstring(text)
                except ET.ParseError as err:
                    last_error = f"failed to parse Atom feed: {err}"
            else:
                last_error = (
                    f"truncated feed response ({len(text)} bytes, missing </feed>)"
                )

            _LOGGER.debug(
                "ECCC: %s from %s (attempt %d/%d)",
                last_error,
                source_id,
                attempt,
                _FEED_FETCH_ATTEMPTS,
            )
            if attempt < _FEED_FETCH_ATTEMPTS:
                await asyncio.sleep(_FEED_RETRY_BACKOFF_S)

        raise UpdateFailed(f"ECCC: {last_error}")

    @staticmethod
    def _parse_gps(
        config: Mapping[str, Any],
    ) -> tuple[float | None, float | None]:
        """Extract GPS coordinates from config."""
        gps_loc = config.get(CONF_GPS_LOC, "")
        if not gps_loc:
            return None, None
        try:
            parts = gps_loc.split(",")
            return float(parts[0].strip()), float(parts[1].strip())
        except (ValueError, IndexError):
            return None, None
