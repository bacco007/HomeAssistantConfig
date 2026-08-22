"""MeteoAlarm (EUMETNET) per-country JSON warnings feed provider.

Uses the aggregate JSON endpoint
(``feeds.meteoalarm.org/api/v1/warnings/feeds-{country-slug}``) which ships
proper CAP-1.2 ``info`` blocks (multi-language) and per-area geocodes. Feeds
carry a mix of area-geocode schemes across countries (``EMMA_ID``, ``NUTS3``,
``NUTS2``, ``WARNCELLID``, ``CISORP``); some countries carry two at once and
some none (polygon-only). Geocodes are collected into the scheme-keyed
``CAPAlert.geocodes`` container rather than a single named field.

Three filter modes selectable via config-flow:

* country-wide — all warnings for the configured country.
* gps-polygon — parses ``area.polygon`` from each warning and keeps only
  warnings whose polygon contains the configured point. Fails loud when a
  non-empty warnings page contains zero polygons (the country does not
  publish per-warning geometry).
* region-picker — keeps warnings whose region codes intersect the configured
  region selection. Region codes are resolved from ``geocodes`` by scheme
  priority (``METEOALARM_REGION_SCHEMES``) so a country's coarsest
  administrative scheme (e.g. ``EMMA_ID`` for DE, ``NUTS3`` for FR) is what
  both the picker offers and the filter matches.

The picker list itself is derived from the warnings feed. No usable regions
endpoint exists: ``feeds.meteoalarm.org/api/v1/regions/feeds-{slug}`` is 404
for all 38 countries, the official successor ``api.meteoalarm.org/metadata/v1``
needs a re-user API key, and the public endpoint behind meteoalarm.org's own
map keys areas by internal UUID rather than by any CAP geocode. Deriving from
warnings is not the fallback it reads as — members publish green/no-warning
entries for every area, so a live feed enumerates the country's full
administrative tree (measured 2026-08-04: DE 408 regions, PL 383, ES 233).

An area may publish several region codes under a single ``areaDesc`` — FMI
names four sea areas in one string — so ``_region_entries`` offers every code of
the area's scheme and labels each from the most specific honest source
available: per-code names when the description zips 1:1 with the codes, the
block name qualified by the code when it carries a single name, the bare code
otherwise. Harvesting reads one ``<info>`` block per warning, chosen by
language, because a feed whose areas carry no region-selectable scheme falls
back to ``areaDesc`` — there the code *is* the label, so reading every block
would offer each region once per published language.
"""

from __future__ import annotations

import hashlib
import logging
import re
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import replace
from datetime import datetime, timezone
from typing import Any

import aiohttp

from homeassistant.helpers.update_coordinator import UpdateFailed

from ..const import (
    CONF_COUNTRY,
    CONF_COUNTRY_ENTITY,
    CONF_GPS_LOC,
    CONF_LANGUAGE,
    CONF_REGIONS,
    METEOALARM_COUNTRY_SLUGS,
)
from ..conventions import (
    METEOALARM_REGION_SCHEMES,
    RegionEntry,
    SourceConventions,
    StageContext,
    conventions_for,
)
from ..conventions import meteoalarm_region_codes as _region_codes
from ..model import CAPAlert, geocodes_from
from .cap import parse_cap_polygon_text
from .geometry import geometry_from_polygons
from .gps import alert_polygons, parse_gps, point_in_polygon

_LOGGER = logging.getLogger(__name__)

METEOALARM_FEED_URL = "https://feeds.meteoalarm.org/api/v1/warnings/feeds-{country}"

# ``Region (District, District, …)`` — the Czech areaDesc shape, where the
# parenthesized list names the area's individual region codes and the prefix
# names the block they belong to. Requires balanced, non-nested parentheses so
# a name that merely contains a bracket never reaches the split.
_PARENTHETICAL = re.compile(r"^[^()]+\(([^()]+)\)$")


def _sender_conventions(alert: CAPAlert) -> SourceConventions:
    """The convention entry for one alert's sender.

    MeteoAlarm relays every EUMETNET member, so the dialect is a property of
    the *sender*, not of the provider: the table resolves ``meteoalarm/<sender>``
    before falling back to the shared MeteoAlarm entry.
    """
    return conventions_for("meteoalarm", alert.sender)


def _batch_conventions(alerts: list[CAPAlert]) -> list[SourceConventions]:
    """Every distinct convention entry present in a batch, first-seen order."""
    seen: list[SourceConventions] = []
    for alert in alerts:
        conventions = _sender_conventions(alert)
        if not any(conventions is entry for entry in seen):
            seen.append(conventions)
    return seen


def _run_slot(alerts: list[CAPAlert], slot: str, ctx: StageContext) -> list[CAPAlert]:
    """Run every dialect stage bound to ``slot`` over the whole batch.

    Stages see the full list, foreign senders included, and pass through what
    is not theirs — the alternative, partitioning by sender and concatenating,
    would reorder alerts that a stage deliberately orders itself.
    """
    for conventions in _batch_conventions(alerts):
        for run in conventions.stages_at(slot):
            alerts = run(alerts, ctx)
    return alerts


def _drop_non_warnings(alerts: list[CAPAlert]) -> list[CAPAlert]:
    """Drop records a sender's conventions declare not to be warnings.

    Only MeteoFrance publishes such a marker today (its green/no-warning
    bulletins); every other sender has no ``keep`` rule and passes untouched.
    """
    kept = [a for a in alerts if _keeps(a)]
    dropped = len(alerts) - len(kept)
    if dropped:
        _LOGGER.debug(
            "MeteoAlarm: dropped %d no-warning marker(s) of %d",
            dropped,
            len(alerts),
        )
    return kept


def _keeps(alert: CAPAlert) -> bool:
    keep = _sender_conventions(alert).keep
    return keep is None or keep(alert)


def _default_id(identifier: str, uuid: str) -> str:
    """Hash a CAP identifier (or ``uuid`` fallback) to a 12-hex stable ID.

    This is the identity for every authority whose conventions do not mint
    their own.
    """
    key = identifier or uuid
    return hashlib.sha256(key.encode()).hexdigest()[:12]


def _apply_identity(alert: CAPAlert) -> CAPAlert:
    """Let the sender's conventions replace the default id, if they mint one.

    Identity is rewritten on the finished alert rather than threaded through
    the parser: every key a dialect could want is recoverable from the record
    itself. ``None`` — and every sender without an ``identity`` rule — keeps
    the per-message identifier hash, byte-for-byte unchanged.
    """
    identity = _sender_conventions(alert).identity
    if identity is None:
        return alert
    minted = identity(alert)
    return replace(alert, id=minted) if minted else alert


def _lang_prefix(value: str) -> str:
    """Lowercase 2-letter prefix of a BCP-47 code (``de-DE`` → ``de``)."""
    if not value:
        return ""
    return value.split("-", 1)[0].lower()


# Language prefixes that mean the same language to a reader, so a block tagged
# with one satisfies a request for another. Norwegian is the one case that
# matters: met.no tags its blocks ``no`` (the macrolanguage), while Home
# Assistant only offers ``nb`` (Bokmål) and ``nn`` (Nynorsk) — ``no`` is not in
# ``homeassistant.generated.languages.LANGUAGES`` — so exact prefix matching
# never fires and a Norwegian install silently reads English (issue #79).
# Checked against every ``<info>`` language published across all 38 country
# feeds on 2026-08-04: the other unreachable tags (``cnr``, ``rm``, ``kl``) have
# no HA locale to be reached *from*, so no group would help them.
_LANG_EQUIVALENCE_GROUPS: tuple[frozenset[str], ...] = (frozenset({"no", "nb", "nn"}),)
_LANG_EQUIVALENTS: Mapping[str, frozenset[str]] = {
    prefix: group for group in _LANG_EQUIVALENCE_GROUPS for prefix in group
}


def _lang_matches(info_prefix: str, preferred_prefix: str) -> bool:
    """Check whether an info block's language prefix satisfies the request."""
    if not info_prefix or not preferred_prefix:
        return False
    if info_prefix == preferred_prefix:
        return True
    return info_prefix in _LANG_EQUIVALENTS.get(preferred_prefix, frozenset())


def _pick_info_blocks(
    infos: list[dict[str, Any]], preferred_prefix: str
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    """Pick the primary info block by language and an alternate if any.

    Preference order:
    1. info with a ``language`` whose 2-letter prefix equals
       ``preferred_prefix``;
    2. info whose prefix is equivalent to it (``_LANG_EQUIVALENTS``);
    3. info whose language prefix is ``en`` (generic fallback);
    4. first info block in document order.

    Exact beats equivalent so that a feed publishing both members of a group
    still honours the requested one; no live feed does today, but document
    order is the wrong tie-breaker for a language choice.

    The alternate is the first remaining block, if any.
    """
    primary_idx: int | None = None
    equiv_idx: int | None = None
    en_idx: int | None = None
    for idx, info in enumerate(infos):
        prefix = _lang_prefix(info.get("language", ""))
        if prefix and prefix == preferred_prefix:
            if primary_idx is None:
                primary_idx = idx
        elif _lang_matches(prefix, preferred_prefix) and equiv_idx is None:
            equiv_idx = idx
        if prefix == "en" and en_idx is None:
            en_idx = idx

    if primary_idx is None:
        primary_idx = equiv_idx if equiv_idx is not None else en_idx
    if primary_idx is None:
        primary_idx = 0

    primary = infos[primary_idx]
    alt: dict[str, Any] | None = None
    for idx, info in enumerate(infos):
        if idx == primary_idx:
            continue
        alt = info
        break
    return primary, alt


def _flatten_parameters(info: Mapping[str, Any]) -> dict[str, str]:
    """Collect ``parameter`` valueName/value pairs into a flat dict.

    When the same ``valueName`` repeats, values are joined with ``"; "``.
    """
    params: dict[str, str] = {}
    for entry in info.get("parameter") or []:
        name = entry.get("valueName") or ""
        value = entry.get("value") or ""
        if not name:
            continue
        existing = params.get(name)
        params[name] = f"{existing}; {value}" if existing else value
    return params


def _join_areas(info: Mapping[str, Any]) -> str:
    """Concatenate ``areaDesc`` from every area block in document order."""
    descs: list[str] = []
    for area in info.get("area") or []:
        desc = area.get("areaDesc") or ""
        if desc and desc not in descs:
            descs.append(desc)
    return ", ".join(descs)


def _scheme_geocodes(info: Mapping[str, Any]) -> Mapping[str, tuple[str, ...]]:
    """All area geocodes keyed by ``valueName`` (scheme).

    Collects every ``geocode`` across the info's area blocks into a
    scheme→values mapping, e.g. ``{"EMMA_ID": (...), "WARNCELLID": (...)}``.
    ``geocodes_from`` de-duplicates per scheme, order-preserving, and drops
    empty schemes/values. Areas without any geocode contribute nothing.
    """
    collected: dict[str, list[str]] = {}
    for area in info.get("area") or []:
        for code in area.get("geocode") or []:
            scheme = code.get("valueName") or ""
            collected.setdefault(scheme, []).append(code.get("value") or "")
    return geocodes_from(collected)


def _split_area_names(desc: str, count: int) -> tuple[str, ...]:
    """Per-code region names derived from an ``areaDesc``, or ``()``.

    An area may carry several region codes under a single ``areaDesc`` that
    names each of them, e.g. FMI's ``"Pohjois-Itämeren itäosa, Pohjois-Itämeren
    länsiosa, Ahvenanmeri, Saaristomeri"`` over four ``EMMA_ID`` values. The
    CAP profile lists those names in geocode order separated by ``", "``, so a
    split that yields exactly ``count`` names zips 1:1 with the codes.

    A label must never claim to name a code it does not name, so the split is
    only trusted when it is unambiguous:

    * ``count <= 1`` — no derivation at all. The single code keeps the whole
      ``areaDesc`` byte for byte, which protects names that legitimately
      contain a comma or parentheses (``"Ibiza y Formentera (Illes
      Balears)"``).
    * ``Region (District, District, …)`` — the parenthesized list is used when
      it yields exactly ``count`` names.
    * otherwise the whole ``desc`` is split, and accepted only when it yields
      exactly ``count`` names **and** no part contains a bracket. A stray
      bracket means the split cut through a structural name, not between two
      region names.

    Anything else (notably the elided ``"Etelä-, Keski- ja
    Pohjois-Pohjanmaa"``, 2 parts over 3 codes) returns ``()`` so the caller
    can fall back to a label that stays true.
    """
    if count <= 1:
        return (desc,) if desc else ()

    match = _PARENTHETICAL.match(desc)
    if match:
        inner = _split_names(match.group(1))
        if len(inner) == count:
            return inner

    parts = _split_names(desc)
    if len(parts) == count and not any("(" in p or ")" in p for p in parts):
        return parts
    return ()


def _split_names(desc: str) -> tuple[str, ...]:
    """Split a comma-separated name list, stripped, empties dropped."""
    return tuple(part.strip() for part in desc.split(",") if part.strip())


def _qualified_labels(desc: str, codes: Sequence[str]) -> tuple[str, ...]:
    """``"{name} ({code})"`` per code when ``desc`` carries exactly one name.

    An area whose ``areaDesc`` holds a single name over several codes names
    the *block* the codes were published under (Denmark's ``"All areas"``,
    Czechia's bare ``"Karlovarský kraj"``, Germany's shared ``"Kreis
    Göttingen"``), not any individual code. The code is appended because the
    name is true of the block rather than of the code alone — and because a
    dropdown holding 28 options that all read ``"All areas"`` is unusable.

    Returns ``()`` when ``desc`` is empty or splits to more than one name;
    those shapes have no honest per-code mapping and fall through to the bare
    code.
    """
    names = _split_names(desc)
    if len(names) != 1:
        return ()
    return tuple(f"{names[0]} ({code})" for code in codes)


def _label_tier(code: str, label: str) -> int:
    """Rank a label's specificity: 1 per-code, 2 block-qualified, 3 bare code.

    Inferred from the label's shape rather than tracked alongside it, which
    keeps ``_region_pairs``' ``(code, label)`` contract unchanged. The shapes
    read here are the ones ``_qualified_labels`` produces one function
    earlier; a feed name that happens to end in its own parenthesized code
    would only shift a preference between two labels, never invent one.
    """
    if label == code:
        return 3
    if label.endswith(f" ({code})"):
        return 2
    return 1


def _merge_region_entries(entries: Iterable[RegionEntry]) -> list[RegionEntry]:
    """De-duplicate ``(scheme, code, label)`` by code, keeping the best label.

    The same code can be labeled differently by two warnings — named on its
    own in one area and block-qualified in another — so the most specific
    label wins (``_label_tier``), ties going to the first seen. Empty codes are
    dropped and an empty label falls back to the code. First-appearance order
    is preserved; sorting is the caller's business.
    """
    best: dict[str, tuple[str, str]] = {}
    for scheme, code, label in entries:
        if not code:
            continue
        resolved = label or code
        tier = _label_tier(code, resolved)
        current = best.get(code)
        if current is None or tier < _label_tier(code, current[1]):
            best[code] = (scheme, resolved)
    return [(scheme, code, label) for code, (scheme, label) in best.items()]


def _merge_region_pairs(pairs: Iterable[tuple[str, str]]) -> list[tuple[str, str]]:
    """``_merge_region_entries`` for callers that never needed the scheme.

    The region picker and the config flow speak ``(code, label)``; only the
    episode explode needs to know which scheme a code belongs to.
    """
    entries = _merge_region_entries(("", code, label) for code, label in pairs)
    return [(code, label) for _scheme, code, label in entries]


def _region_entries(info: Mapping[str, Any]) -> list[RegionEntry]:
    """``(scheme, code, label)`` region entries for the info's areas.

    Per area, take **every** value of the first scheme present in
    ``METEOALARM_REGION_SCHEMES`` — an area may carry several region codes
    under one ``areaDesc`` (issue #48), and the region filter matches on all of
    them, so the picker has to offer all of them. Labels come from the first
    tier that applies:

    1. per-code names, when ``areaDesc`` splits 1:1 with the codes
       (``_split_area_names``);
    2. the block name qualified by the code, when ``areaDesc`` carries a single
       name (``_qualified_labels``);
    3. the bare code, when neither mapping is honest.

    If no region-selectable scheme is present but ``areaDesc`` is set, fall
    back to a schemeless ``("", areaDesc, areaDesc)`` entry so named-but-
    schemeless feeds still populate the picker. Document order; de-duplicated
    by code.

    The scheme rides along for the episode explode, which scopes an exploded
    alert's ``geocodes`` to the one code it keeps and so has to know which
    container to put it in.
    """
    out: list[RegionEntry] = []
    for area in info.get("area") or []:
        desc = area.get("areaDesc") or ""
        by_scheme: dict[str, list[str]] = {}
        for code in area.get("geocode") or []:
            scheme = code.get("valueName") or ""
            value = code.get("value") or ""
            if scheme and value:
                values = by_scheme.setdefault(scheme, [])
                if value not in values:
                    values.append(value)
        codes: tuple[str, ...] = ()
        selected = ""
        for scheme in METEOALARM_REGION_SCHEMES:
            if by_scheme.get(scheme):
                codes = tuple(by_scheme[scheme])
                selected = scheme
                break
        if not codes:
            if desc:
                out.append(("", desc, desc))
            continue
        labels = (
            _split_area_names(desc, len(codes))
            or _qualified_labels(desc, codes)
            or codes
        )
        out.extend((selected, code, label) for code, label in zip(codes, labels))
    return _merge_region_entries(out)


def _region_pairs(info: Mapping[str, Any]) -> list[tuple[str, str]]:
    """``(code, label)`` region-picker pairs — ``_region_entries`` less scheme."""
    return [(code, label) for _scheme, code, label in _region_entries(info)]


def _first(value: Any) -> str:
    """Return the first element of a list-or-string value as a string.

    The JSON feed wraps several CAP fields (``category``, ``responseType``)
    in single-element lists; this normalizes them back to a scalar.
    """
    if isinstance(value, list):
        return str(value[0]) if value else ""
    return str(value or "")


def _info_text(info: Mapping[str, Any] | None, key: str) -> str:
    if info is None:
        return ""
    return str(info.get(key) or "")


def _extract_geometries(info: Mapping[str, Any]) -> list[list[list[float]]]:
    """Return polygon rings from a CAP info block.

    One ring per area that carries a usable polygon, in GeoJSON
    ``[[lon, lat], ...]`` order. ``area.polygon`` is accepted as a string or a
    list of strings; unparseable entries are skipped. Region-picker pairs are
    derived separately by ``_region_pairs``.
    """
    rings: list[list[list[float]]] = []
    for area in info.get("area") or []:
        polygon = area.get("polygon")
        candidates: list[str]
        if isinstance(polygon, list):
            candidates = [p for p in polygon if isinstance(p, str)]
        elif isinstance(polygon, str):
            candidates = [polygon]
        else:
            candidates = []
        for text in candidates:
            ring = parse_cap_polygon_text(text)
            if ring is not None:
                rings.append(ring)
    return rings


def _primary_info(
    warning: Mapping[str, Any], preferred_prefix: str
) -> Mapping[str, Any] | None:
    """The info block ``_warning_to_alert`` selected, for callers needing areas.

    ``_warning_to_alert`` flattens the area blocks into ``area_desc`` and a
    de-duplicated ``geocodes`` container, which loses the pairing between a
    department's code and its name. The region explosion needs that pairing, so
    it re-selects the same block rather than trying to re-zip two independently
    de-duplicated sequences.
    """
    infos = (warning.get("alert") or {}).get("info") or []
    if not infos:
        return None
    primary, _alt = _pick_info_blocks(infos, preferred_prefix)
    return primary


def _warning_to_alert(
    warning: Mapping[str, Any], preferred_prefix: str
) -> CAPAlert | None:
    """Convert one ``{"alert": ..., "uuid": ...}`` warning to a ``CAPAlert``.

    The id is the per-message identifier hash; a sender whose conventions mint
    their own identity gets it rewritten here, on the finished record.

    Returns ``None`` for warnings filtered out (non-Actual status, missing
    info blocks).
    """
    alert = warning.get("alert") or {}
    status = alert.get("status") or ""
    if status and status != "Actual":
        return None

    infos = alert.get("info") or []
    if not infos:
        return None

    primary, alt = _pick_info_blocks(infos, preferred_prefix)
    identifier = alert.get("identifier") or ""
    uuid = warning.get("uuid") or ""
    parameters = _flatten_parameters(primary)
    geocodes = _scheme_geocodes(primary)
    rings = _extract_geometries(primary)
    geometry = geometry_from_polygons(rings)

    sender = alert.get("sender") or ""
    event = _info_text(primary, "event")
    onset = _info_text(primary, "onset")
    sent = alert.get("sent") or ""

    parsed = CAPAlert(
        id=_default_id(identifier, uuid),
        url="",
        identifier=identifier,
        event=event,
        msg_type=alert.get("msgType") or "",
        status=status,
        scope=alert.get("scope") or "",
        category=_first(primary.get("category")),
        urgency=_info_text(primary, "urgency"),
        severity=_info_text(primary, "severity"),
        certainty=_info_text(primary, "certainty"),
        response_type=_first(primary.get("responseType")),
        sent=sent,
        effective="",
        onset=onset,
        expires=_info_text(primary, "expires"),
        headline=_info_text(primary, "headline"),
        description=_info_text(primary, "description"),
        instruction=_info_text(primary, "instruction") or None,
        web=_info_text(primary, "web"),
        area_desc=_join_areas(primary),
        geocodes=geocodes,
        geometry=geometry,
        sender=sender,
        sender_name=_info_text(primary, "senderName"),
        parameters=parameters or None,
        language=_info_text(primary, "language"),
        event_alt=_info_text(alt, "event"),
        headline_alt=_info_text(alt, "headline"),
        description_alt=_info_text(alt, "description"),
        instruction_alt=_info_text(alt, "instruction") or None,
        language_alt=_info_text(alt, "language"),
        provider="meteoalarm",
    )
    return _apply_identity(parsed)


async def fetch_regions_for_country(
    session: aiohttp.ClientSession, country_iso: str, *, language: str = ""
) -> list[tuple[str, str]]:
    """Return ``[(region_code, label), ...]`` for the given country.

    ``region_code`` is in the country's region-selectable scheme (EMMA_ID for
    most, NUTS3 for FR/BG/RO/MK, NUTS2 for HU/BE) — the same namespace the
    per-alert region filter matches against. Countries whose feeds carry no
    region-selectable scheme at all (CH, EE, IE, IL, LU, NO, SE, SI, UA, UK,
    LV) fall back to ``areaDesc`` strings in both places.

    ``language`` picks the ``<info>`` block labels are read from; defaults to
    English, matching ``async_fetch``. It is load-bearing for the ``areaDesc``
    countries, where the label *is* the code.

    Returns ``[]`` when the feed is reachable but names no regions — a real
    state for a single-zone or currently-quiet country, and the caller's
    business to present. Raises ``UpdateFailed`` for an unsupported country or
    a feed that could not be read.
    """
    country = (country_iso or "").upper()
    slug = METEOALARM_COUNTRY_SLUGS.get(country)
    if slug is None:
        raise UpdateFailed(f"MeteoAlarm: unsupported country {country}")

    preferred_prefix = _lang_prefix(language) or "en"
    regions = await _fetch_regions_from_warnings(session, slug, preferred_prefix)
    return sorted(_merge_region_pairs(regions), key=lambda item: item[1].lower())


async def _fetch_regions_from_warnings(
    session: aiohttp.ClientSession, slug: str, preferred_prefix: str
) -> list[tuple[str, str]]:
    """Derive the region list from the warnings feed.

    Reads one info block per warning — the one ``_pick_info_blocks`` selects
    for ``preferred_prefix`` — rather than all of them. A multi-language feed
    repeats its areas per language, and for the ``areaDesc`` fallback those
    repeats are distinct codes that no de-duplication can merge (Norway
    published 26 entries for 13 regions on 2026-08-04).

    Raises ``UpdateFailed`` on any failure to read the feed, so the caller can
    tell a broken fetch from a country that genuinely names no regions.
    """
    url = METEOALARM_FEED_URL.format(country=slug)
    try:
        async with session.get(url) as resp:
            if resp.status != 200:
                raise UpdateFailed(f"MeteoAlarm {slug}: HTTP {resp.status}")
            try:
                payload = await resp.json(content_type=None)
            except (aiohttp.ContentTypeError, ValueError) as err:
                raise UpdateFailed(f"MeteoAlarm {slug}: invalid JSON: {err}") from err
    except aiohttp.ClientError as err:
        raise UpdateFailed(f"MeteoAlarm {slug}: {err}") from err

    warnings = payload.get("warnings") if isinstance(payload, dict) else None
    if not isinstance(warnings, list):
        raise UpdateFailed(f"MeteoAlarm {slug}: feed missing 'warnings' array")

    out: list[tuple[str, str]] = []
    for warning in warnings:
        if not isinstance(warning, dict):
            continue
        infos = (warning.get("alert") or {}).get("info") or []
        if not infos:
            continue
        primary, _alt = _pick_info_blocks(infos, preferred_prefix)
        out.extend(_region_pairs(primary))
    return out


class MeteoAlarmProvider:
    """Per-country MeteoAlarm JSON warnings provider."""

    @property
    def name(self) -> str:
        return "meteoalarm"

    async def async_validate_config(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        *,
        user_agent: str | None = None,
    ) -> str | None:
        """Check that this country still has a feed.

        The country comes from a dropdown, so the code is always one we know —
        what a request settles is whether EUMETNET still publishes it. The
        slug table is curated by hand against live feeds, and a member leaving
        or renaming would otherwise show up as an entry that sets up cleanly
        and reports nothing.

        Fully-mobile mode carries no country at all (it resolves one per poll
        from a source entity), so there is nothing to check.
        """
        country = str(config.get(CONF_COUNTRY, "") or "").strip().upper()
        if not country:
            return None
        slug = METEOALARM_COUNTRY_SLUGS.get(country)
        if slug is None:
            return "invalid_country"
        async with session.get(METEOALARM_FEED_URL.format(country=slug)) as resp:
            if resp.status == 404:
                return "unknown_country_feed"
            return None if resp.status == 200 else "cannot_connect"

    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        options: Mapping[str, Any],
        *,
        cap_content_cache=None,
        user_agent=None,
        now: datetime | None = None,
    ) -> list[CAPAlert]:
        """Fetch the country feed and return a ``CAPAlert`` per warning.

        The order is the convention table's contract — construct, identity,
        explode, keep, mode filters, merge — and each dialect present in the
        page contributes the stages it declares at the explode and merge slots.

        ``now`` is the clock the episode merge uses to decide which forecast
        days have finished; injected so tests never race the wall clock. Extra
        keyword with a default, so the ``AlertProvider`` protocol is still
        satisfied.
        """
        country = (config.get(CONF_COUNTRY, "") or "").upper()
        if not country:
            raise UpdateFailed("MeteoAlarm: country not configured")
        slug = METEOALARM_COUNTRY_SLUGS.get(country)
        if slug is None:
            raise UpdateFailed(f"MeteoAlarm: unsupported country {country}")

        url = METEOALARM_FEED_URL.format(country=slug)
        async with session.get(url) as resp:
            if resp.status != 200:
                raise UpdateFailed(f"MeteoAlarm {country}: HTTP {resp.status}")
            try:
                payload = await resp.json(content_type=None)
            except (aiohttp.ContentTypeError, ValueError) as err:
                raise UpdateFailed(f"MeteoAlarm: invalid JSON: {err}") from err

        warnings = payload.get("warnings") if isinstance(payload, dict) else None
        if not isinstance(warnings, list):
            raise UpdateFailed("MeteoAlarm: feed missing 'warnings' array")

        preferred_prefix = _lang_prefix(options.get(CONF_LANGUAGE, "")) or "en"

        gps_loc = config.get(CONF_GPS_LOC)
        regions = config.get(CONF_REGIONS)
        # Region-picker mode only: the configured scope an ``explode`` stage
        # splits a bulletin against.
        wanted = (
            frozenset(str(r) for r in regions if r)
            if regions and not gps_loc
            else frozenset[str]()
        )

        alerts: list[CAPAlert] = []
        # The regions each alert covers, keyed by object identity and valid for
        # this fetch only. ``CAPAlert`` flattens the area blocks, so a stage
        # that needs the name ↔ code pairing has to be handed it — and handing
        # it the picker's own entries is what keeps an exploded entity's name
        # equal to the label the user selected. Resolved only in region-picker
        # mode: the explode is the sole consumer and is a no-op without
        # configured regions, so the other modes skip the label derivation.
        region_entries: dict[int, tuple[RegionEntry, ...]] = {}
        for warning in warnings:
            if not isinstance(warning, dict):
                continue
            alert = _warning_to_alert(warning, preferred_prefix)
            if alert is None:
                continue
            if wanted:
                info = _primary_info(warning, preferred_prefix)
                if info is not None:
                    region_entries[id(alert)] = tuple(_region_entries(info))
            alerts.append(alert)

        ctx = StageContext(
            now=now or datetime.now(timezone.utc),
            wanted_regions=wanted,
            regions_for=lambda alert: region_entries.get(id(alert), ()),
        )
        alerts = _run_slot(alerts, "explode", ctx)

        # Before any mode filter, so all three modes are equally protected.
        alerts = _drop_non_warnings(alerts)

        if gps_loc:
            # Fully-mobile mode (country resolved from a source entity) can
            # roam into countries that publish partial or no per-warning
            # geometry; there, warnings without geometry are kept rather
            # than dropped. Explicit fixed-country GPS/tracker modes still
            # filter strictly and fail loud on zero polygons.
            mobile = CONF_COUNTRY_ENTITY in config
            alerts = self._filter_by_polygon(
                alerts, gps_loc, country, keep_polygonless=mobile
            )
        elif regions:
            alerts = self._filter_by_regions(alerts, regions)

        # Last, so the merged ids are what reaches the alert store.
        return _run_slot(alerts, "merge", ctx)

    @staticmethod
    def _filter_by_polygon(
        alerts: list[CAPAlert],
        gps_loc: str,
        country: str,
        *,
        keep_polygonless: bool = False,
    ) -> list[CAPAlert]:
        """Keep alerts whose geometry contains the configured GPS point.

        When the page has alerts but none carry polygons, the country does
        not publish per-warning geometry. By default this fails loud — the
        user explicitly chose GPS filtering for a known country — and
        warnings without geometry are dropped when others carry it. In
        fully-mobile mode (``keep_polygonless``) warnings without usable
        geometry are kept instead: roaming into a country with partial or
        absent geometry degrades to broader coverage rather than silently
        dropped warnings or an unavailable entry.
        """
        if not alerts:
            return []
        with_polygons = [a for a in alerts if alert_polygons(a)]
        if not with_polygons:
            if keep_polygonless:
                _LOGGER.info(
                    "MeteoAlarm %s: no per-warning geometry; keeping all %d warnings",
                    country,
                    len(alerts),
                )
                return alerts
            raise UpdateFailed(
                f"MeteoAlarm {country}: GPS filter requested but "
                f"{len(alerts)} warnings carry no polygons; this country "
                "does not publish per-warning geometry — use region-picker "
                "mode instead"
            )
        gps = parse_gps(gps_loc)
        if gps is None:
            raise UpdateFailed(
                f"MeteoAlarm {country}: invalid GPS coordinates {gps_loc!r}"
            )
        lat, lon = gps
        kept: list[CAPAlert] = []
        for alert in alerts:
            rings = alert_polygons(alert)
            if not rings:
                if keep_polygonless:
                    kept.append(alert)
                continue
            if any(point_in_polygon(lat, lon, ring) for ring in rings):
                kept.append(alert)
        return kept

    @staticmethod
    def _filter_by_regions(alerts: list[CAPAlert], regions: Any) -> list[CAPAlert]:
        """Keep alerts whose resolved region codes intersect ``regions``.

        Region codes are resolved from each alert's ``geocodes`` container via
        the shared scheme-priority resolver, so the values compared here are
        the same scheme the region picker offered (see ``_region_pairs``).

        Pure filtering for every sender: a dialect that owns its own identity
        re-mints it in the ``merge`` slot, which runs after this.
        """
        wanted = {str(r) for r in regions if r}
        if not wanted:
            return []
        kept: list[CAPAlert] = []
        for a in alerts:
            descs = tuple(d.strip() for d in a.area_desc.split(",") if d.strip())
            resolved = _region_codes(a.geocodes, descs)
            if wanted.intersection(resolved):
                kept.append(a)
        return kept
