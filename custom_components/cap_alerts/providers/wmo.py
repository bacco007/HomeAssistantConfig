"""WMO Severe Weather Information Centre (SWIC) provider.

Two-step fetch: pull a per-source RSS 2.0 feed, extract the per-item
``<link>`` CAP XML URLs, fetch those via the shared ``CAPContentCache``, and
parse standard CAP 1.2 XML into ``CAPAlert`` objects.

The CAP body parsing is shared with ECCC via the provider-neutral ``cap``
module: ``parse_cap_alert`` is namespace-agnostic and handles the
``urn:oasis:names:tc:emergency:cap:1.2`` namespace WMO feeds use, and the
``CAPDoc`` / ``CAPInfoDoc`` containers and ``resolve_chain_leaves`` revision
logic are reused verbatim by both this provider and ECCC.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import re
from collections.abc import Mapping, Sequence
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any

import aiohttp
from defusedxml import ElementTree as ET

from homeassistant.helpers.update_coordinator import UpdateFailed

from ..const import (
    BUDDHIST_ERA_OFFSET,
    CONF_GEOCODE_PREFIXES,
    CONF_GPS_LOC,
    CONF_LANGUAGE,
    CONF_SOURCE_ID,
    MIN_BUDDHIST_ERA_YEAR,
    WMO_SOURCES_URL,
    WMO_UNMIRRORED_SOURCES,
)
from ..model import CAPAlert, geocodes_from
from .cap import CAPDoc, CAPInfoDoc, parse_cap_alert, resolve_chain_leaves
from .cap_content_cache import CAPContentCache
from .geometry import geometry_from_shapes, points_from_circles
from .gps import alert_polygons, parse_gps, point_in_polygon

_LOGGER = logging.getLogger(__name__)

WMO_RSS_URL = "https://severeweather.wmo.int/v2/cap-alerts/{source_id}/rss.xml"


# ---------------------------------------------------------------------------
# RSS envelope parsing
# ---------------------------------------------------------------------------


def _gregorian_year(dt: datetime) -> datetime | None:
    """Correct a Buddhist-Era year on a parsed datetime to Gregorian.

    Thai feeds (TMD) emit BE years (Gregorian + 543) in the RSS envelope's
    RFC-2822 ``cap:expires`` too, not just the CAP body. Without this the
    pre-filter reads every Thai alert as ~543 years in the future and never
    drops the expired ones. Returns the datetime unchanged when its year is
    already Gregorian, or ``None`` if the corrected date is invalid (a
    BE-labelled 29 Feb with no Gregorian counterpart) so the caller fails open.
    """
    if dt.year < MIN_BUDDHIST_ERA_YEAR:
        return dt
    try:
        return dt.replace(year=dt.year - BUDDHIST_ERA_OFFSET)
    except ValueError:
        return None


def _item_expires(item: Any) -> datetime | None:
    """Parse an RSS item's CAP ``expires`` extension (namespace-agnostic).

    The WMO mirror enriches each ``<item>`` with CAP-namespace elements
    (``cap:expires``, ``cap:severity``, …). Returns the expiry as an aware
    ``datetime`` (naive values are assumed UTC, Buddhist-Era years corrected
    to Gregorian), or ``None`` when the element is absent or unparseable.
    """
    for child in item:
        if child.tag.rsplit("}", 1)[-1] != "expires" or not child.text:
            continue
        try:
            dt = parsedate_to_datetime(child.text.strip())
        except (TypeError, ValueError):
            return None
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return _gregorian_year(dt)
    return None


# An RSS <guid> whose leading digits are the item's area code followed by a
# per-alert serial, then "_<timestamp>" — e.g. "52272741600000_20260804103516",
# where 522727 is Pingtang County (GB/T 2260) and the CAP body's geocode is
# "522727000000". Observed on every one of cn-cma-xx's 500 items (2026-08-04).
# Used only to skip CAP-body fetches that the geocode filter would discard
# anyway; see _prefilter_by_guid for why this can never drop a wanted alert.
_GUID_AREA_CODE_RE = re.compile(r"^(\d{6})\d*_\d+$")

# Width of the area code embedded in the guid above. Prefixes longer than this
# reach into the serial digits, where guid and geocode diverge, so the
# pre-filter disengages rather than guess.
_GUID_AREA_CODE_WIDTH = 6


def _prefilter_by_guid(items: list[Any], prefixes: Sequence[str]) -> set[int] | None:
    """Indices of items whose guid area code matches a prefix, or ``None``.

    A pure optimization layered under the authoritative post-fetch geocode
    filter: it exists so a narrowed entry does not pay for CAP bodies it is
    about to discard. cn-cma-xx publishes 501 CAP URLs per poll at ~89 KiB
    each, which costs ~32 s and blows the default 30 s timeout; with a
    province prefix this fetches ~30 of them instead.

    Returns ``None`` — meaning "fetch everything, decide after parsing" —
    whenever the guid cannot be trusted to answer the question, so the
    optimization can only ever be lossless:

    * any configured prefix is non-numeric or longer than the embedded area
      code, where guid and geocode provably diverge (a full 12-digit code
      matches the body's ``130709000000`` but never the guid's
      ``13070941600000``);
    * any item's guid does not match the expected shape, i.e. this is not a
      feed whose guids carry area codes;
    * the filter would keep nothing, which is far more likely to mean the guid
      convention changed than that the user has zero alerts.

    Under those guards a kept/dropped decision on ``guid[:6]`` is identical to
    one on ``geocode[:6]``, because both are the same GB/T 2260 code.
    """
    wanted = [p.strip() for p in prefixes if p and p.strip()]
    if not wanted:
        return None
    if any(not p.isdigit() or len(p) > _GUID_AREA_CODE_WIDTH for p in wanted):
        return None

    kept: set[int] = set()
    for index, item in enumerate(items):
        guid = (item.findtext("guid") or "").strip()
        match = _GUID_AREA_CODE_RE.match(guid)
        if match is None:
            return None
        code = match.group(1)
        if any(code.startswith(p) for p in wanted):
            kept.add(index)
    return kept or None


def _parse_rss_links(
    xml_text: str,
    *,
    now: datetime | None = None,
    geocode_prefixes: Sequence[str] | None = None,
) -> list[str]:
    """Extract per-item ``<link>`` CAP XML URLs for currently-active alerts.

    RSS 2.0 ``<link>`` is a plain-text element (the URL is the element text,
    unlike Atom where it is an ``href`` attribute). Items whose CAP
    ``expires`` extension is already in the past are skipped, so high-volume
    feeds (PAGASA lists ~500 items, nearly all expired) only trigger CAP-body
    fetches for live alerts — without this the cold-start cascade exceeds the
    coordinator poll timeout. Items lacking a parseable ``expires`` are kept
    (fail-open), so feeds without the extension behave as before. Raises
    ``ET.ParseError`` on malformed XML — the caller converts that to
    ``UpdateFailed``. Returns ``[]`` for a feed with no live items.
    """
    cutoff = now or datetime.now(timezone.utc)
    root = ET.fromstring(xml_text)
    items = list(root.iter("item"))
    # Optional area-code gate, applied before any CAP body is fetched. Returns
    # None whenever the guid cannot answer the question, in which case every
    # item is kept and the post-fetch geocode filter decides as before.
    allowed = _prefilter_by_guid(items, geocode_prefixes or ())
    links: list[str] = []
    for index, item in enumerate(items):
        if allowed is not None and index not in allowed:
            continue
        link = item.findtext("link")
        if not (link and link.strip()):
            continue
        expires = _item_expires(item)
        if expires is not None and expires < cutoff:
            continue
        links.append(link.strip())
    return links


# ---------------------------------------------------------------------------
# Source registry (config-flow dropdown)
# ---------------------------------------------------------------------------


def _source_languages(source: Mapping[str, Any]) -> str:
    """Join a registry record's ``byLanguage`` primary subtags, e.g. ``de/en``.

    The source-ID's trailing segment is *not* the body language and must not
    be used here: 15 of the 110 sources sampled on 2026-08-03 disagree with
    their CAP body's first ``<info>`` block (``at-zamg-en`` leads with
    ``de-DE``, ``ch-meteoswiss-de`` leads with ``en``), 17 end in ``-xx``, and
    one ends in ``-marine``. ``byLanguage`` is itself only a hint — it
    over-claims for 35 of those 110 and under-claims for 20 — so it seeds the
    display label only, never selection (see ``_select_info``). Registry order
    is preserved, duplicates collapsed. Returns ``""`` when absent or empty.
    """
    by_language = source.get("byLanguage")
    if not isinstance(by_language, list):
        return ""
    codes: list[str] = []
    for entry in by_language:
        if not isinstance(entry, Mapping):
            continue
        code = str(entry.get("code") or "").strip().split("-", 1)[0].lower()
        if code and code not in codes:
            codes.append(code)
    return "/".join(codes)


def _wmo_source_label(source: Mapping[str, Any]) -> str:
    """Build a compact dropdown label from a registry source record.

    Prefers ``"{countryName} ({AUTHORITYABBREV}, {langs})"``, where ``langs``
    are the record's ``byLanguage`` primary subtags (``mx-smn-es`` → ``es``,
    ``at-zamg-en`` → ``de/en``) — multi-valued labels also signal which
    sources are multilingual, and so worth setting a language option on.
    Falls back to the first ``byLanguage`` name, then the bare source ID.
    """
    sid = str(source.get("sourceId") or "").strip()
    country = str(source.get("countryName") or "").strip()
    abbrev = str(source.get("authorityAbbrev") or "").strip()
    langs = _source_languages(source)
    if country and abbrev:
        head = f"{country} ({abbrev.upper()}"
        return f"{head}, {langs})" if langs else f"{head})"
    by_language = source.get("byLanguage")
    if isinstance(by_language, list) and by_language:
        first = by_language[0]
        if isinstance(first, Mapping):
            name = str(first.get("name") or "").strip()
            if name:
                return name
    return sid


async def fetch_wmo_sources(
    session: aiohttp.ClientSession, *, user_agent: str | None = None
) -> list[tuple[str, str]]:
    """Return ``[(sourceId, label), ...]`` for mirror-reachable WMO sources.

    Fetches the live SWIC registry (``WMO_SOURCES_URL``) and drops only the
    known-unmirrored sources (the ~21 that 404 on the mirror). No
    cross-provider uniqueness filtering — feeds also covered by MeteoAlarm or
    NWS are included. Returns ``[]`` on any failure (HTTP error, JSON error,
    unexpected shape); the caller falls back to the static ``WMO_SOURCE_NAMES``
    catalog. Sorted by label.
    """
    headers = {"User-Agent": user_agent} if user_agent else None
    try:
        async with session.get(WMO_SOURCES_URL, headers=headers) as resp:
            if resp.status != 200:
                return []
            try:
                payload = await resp.json(content_type=None)
            except (aiohttp.ContentTypeError, ValueError):
                return []
    except aiohttp.ClientError:
        return []

    sources = payload.get("sources") if isinstance(payload, dict) else None
    if not isinstance(sources, list):
        return []

    seen: dict[str, str] = {}
    for entry in sources:
        if not isinstance(entry, Mapping):
            continue
        source = entry.get("source")
        if not isinstance(source, Mapping):
            continue
        sid = str(source.get("sourceId") or "").strip()
        if not sid or sid in WMO_UNMIRRORED_SOURCES or sid in seen:
            continue
        seen[sid] = _wmo_source_label(source)
    return sorted(seen.items(), key=lambda item: item[1].lower())


# ---------------------------------------------------------------------------
# Alert identity
# ---------------------------------------------------------------------------


def _compute_wmo_id(identifier: str, fallback_url: str) -> str:
    """Hash the CAP ``<identifier>`` (or the CAP URL) to a 12-hex stable ID.

    WMO CAP identifiers are sender-scoped and stable across Update/Cancel
    re-issues for a single event, so they survive the lifecycle. Falls back
    to the CAP URL when the identifier is missing.
    """
    key = identifier or fallback_url
    return hashlib.sha256(key.encode()).hexdigest()[:12]


# ---------------------------------------------------------------------------
# CAPAlert construction
# ---------------------------------------------------------------------------


def _normalize_lang(value: str) -> str:
    """Strip and casefold a BCP 47 tag for comparison."""
    return value.strip().casefold()


def _language_matches(info_lang: str, preferred: str) -> bool:
    """Check language match with BCP 47 primary-subtag fallback.

    Casefolded exact match wins (``EN-us`` == ``en-US``); failing that the
    primary subtag (before the first ``-``) is compared, so ``zh-Hans``
    matches ``zh-CN`` and a bare ``en`` matches ``en-GB``. An empty tag on
    either side never matches.

    The primary-subtag step is script-blind: a ``zh-Hans`` (Simplified)
    preference matches a ``zh-HK``/``zh-mo`` (Traditional) block. That is
    deliberate — a user only reaches those sources by choosing them
    explicitly, and the related script beats an unrelated language.
    """
    if not info_lang or not preferred:
        return False
    info_norm = _normalize_lang(info_lang)
    pref_norm = _normalize_lang(preferred)
    if not info_norm or not pref_norm:
        return False
    if info_norm == pref_norm:
        return True
    return info_norm.split("-", 1)[0] == pref_norm.split("-", 1)[0]


def _select_info(doc: CAPDoc, language: str) -> CAPInfoDoc:
    """Pick the ``<info>`` block matching ``language``.

    SWIC bodies are frequently multilingual and document order is *not*
    language order: of the 110 sources sampled on 2026-08-03, 46 carried more
    than one ``<info>`` block and 25 of those led with a non-English one.
    ``at-zamg-en`` leads with ``de-DE``, so reading ``infos[0]`` served German
    from the source whose ID ends ``-en``.

    Preference order:
    1. first block whose language matches (``_language_matches``);
    2. first block whose primary subtag is ``en`` — a predictable fallback
       when the document lacks the preferred language, rather than an
       arbitrary one (a German user on ``mo-smg-xx`` gets ``en-US``, not
       ``zh-mo``);
    3. ``infos[0]``, so single-language documents, documents whose blocks
       declare no ``<language>``, and an unset language option all behave
       exactly as before.

    First match wins on duplicate tags. ``ca-aema-xx`` emits one ``<info>``
    per *area group* (``en-CA``/``fr-CA``/``en-CA``/``fr-CA``), so only its
    first group survives — the same pre-existing limitation ``infos[0]`` had,
    and the same defect class as ECCC issue #45.
    """
    if not doc.infos:
        return CAPInfoDoc()
    if language:
        for info in doc.infos:
            if _language_matches(info.language, language):
                return info
    for info in doc.infos:
        if _normalize_lang(info.language).split("-", 1)[0] == "en":
            return info
    return doc.infos[0]


def _select_alt_info(doc: CAPDoc, primary: CAPInfoDoc) -> CAPInfoDoc | None:
    """Return the first ``<info>`` block that is not the selected one."""
    for info in doc.infos:
        if info is not primary:
            return info
    return None


def _build_alert(
    doc: CAPDoc,
    info: CAPInfoDoc,
    url: str,
    alert_id: str,
    alt: CAPInfoDoc | None = None,
) -> CAPAlert:
    """Build a ``CAPAlert`` from a parsed WMO CAP document.

    ``alt`` is the non-selected ``<info>`` block on a multilingual document;
    its text populates the ``*_alt`` fields, matching what ECCC and MeteoAlarm
    already publish. Every other field comes from ``info``.
    """
    merged_params: dict[str, str] = {**info.event_codes, **info.parameters}
    points = points_from_circles(info.circles)
    return CAPAlert(
        id=alert_id,
        url=url,
        identifier=doc.identifier,
        event=info.event or info.headline,
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
        web=info.web,
        area_desc=info.area_desc,
        geometry=geometry_from_shapes(info.polygons, points),
        points=tuple((lon, lat) for lon, lat in points),
        geocodes=geocodes_from(info.geocodes),
        sender=doc.sender,
        sender_name=info.sender_name,
        references=tuple(ref_id for _, ref_id, _ in doc.references),
        parameters=merged_params if merged_params else None,
        language=info.language,
        event_alt=(alt.event or alt.headline) if alt is not None else "",
        headline_alt=alt.headline if alt is not None else "",
        description_alt=alt.description if alt is not None else "",
        instruction_alt=(alt.instruction or None) if alt is not None else None,
        language_alt=alt.language if alt is not None else "",
        provider="wmo",
    )


# ---------------------------------------------------------------------------
# Provider
# ---------------------------------------------------------------------------


class WMOProvider:
    """WMO SWIC per-source RSS → CAP XML provider."""

    @property
    def name(self) -> str:
        return "wmo"

    async def async_validate_config(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        *,
        user_agent: str | None = None,
    ) -> str | None:
        """Check that the SWIC mirror actually serves this source.

        The source field accepts a custom value on purpose — the registry gains
        sources faster than the catalog here does — so a well-formed id is not
        evidence that anything is published under it. Asking the mirror is,
        and it is the same URL the coordinator will poll: 404 for a source it
        does not carry, which covers both a typo and one of the registered but
        unmirrored sources in ``WMO_UNMIRRORED_SOURCES``.
        """
        source_id = str(config.get(CONF_SOURCE_ID, "") or "").strip()
        if not source_id:
            return None
        headers = {"User-Agent": user_agent} if user_agent else None
        async with session.get(
            WMO_RSS_URL.format(source_id=source_id), headers=headers
        ) as resp:
            if resp.status == 404:
                return "unknown_wmo_source"
            return None if resp.status == 200 else "cannot_connect"

    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        options: Mapping[str, Any],
        *,
        cap_content_cache: CAPContentCache | None = None,
        user_agent: str | None = None,
    ) -> list[CAPAlert]:
        """Fetch active alerts from a WMO SWIC source.

        (a) Fetches the per-source RSS feed.
        (b) Extracts per-item CAP XML URLs.
        (c) Fetches CAP XML for each via a shared cache (bounded concurrency).
        (d) Parses CAP XML in the thread pool executor.
        (e) Resolves revision chains to leaf revisions.
        (f) Selects the preferred-language ``<info>`` block, builds CAPAlert
            objects, and applies the optional GPS filter.
        """
        source_id = (config.get(CONF_SOURCE_ID) or "").strip()
        if not source_id:
            raise UpdateFailed("WMO: source_id not configured")

        url = WMO_RSS_URL.format(source_id=source_id)
        async with session.get(url) as resp:
            if resp.status != 200:
                raise UpdateFailed(f"WMO {source_id}: RSS HTTP {resp.status}")
            rss_text = await resp.text()

        try:
            cap_urls = _parse_rss_links(
                rss_text, geocode_prefixes=options.get(CONF_GEOCODE_PREFIXES)
            )
        except ET.ParseError as err:
            raise UpdateFailed(f"WMO {source_id}: failed to parse RSS: {err}") from err

        if not cap_urls:
            return []

        # (c) Fetch CAP XML with bounded concurrency via the shared cache.
        cache = (
            cap_content_cache if cap_content_cache is not None else CAPContentCache()
        )
        semaphore = asyncio.Semaphore(5)

        async def _fetch_one(cap_url: str) -> str | None:
            async with semaphore:
                return await cache.get_or_fetch(session, cap_url, user_agent=user_agent)

        bodies: list[str | None] = await asyncio.gather(
            *[_fetch_one(cap_url) for cap_url in cap_urls]
        )

        # (d) Parse CAP XML in the executor (CPU-bound). Drop CAP fetch
        # failures gracefully — a missing body means that one alert is skipped.
        loop = asyncio.get_running_loop()
        parsed: list[tuple[str, CAPDoc]] = []
        for cap_url, body in zip(cap_urls, bodies):
            if body is None:
                _LOGGER.warning("WMO %s: CAP fetch failed for %s", source_id, cap_url)
                continue
            doc = await loop.run_in_executor(None, parse_cap_alert, body)
            if doc is not None:
                parsed.append((cap_url, doc))

        # (e) Resolve revision chains within this poll.
        leaf_ids = {d.identifier for d in resolve_chain_leaves([d for _, d in parsed])}

        # (f) Build CAPAlert objects for the leaf revisions.
        language = str(options.get(CONF_LANGUAGE, "") or "").strip()
        alerts: list[CAPAlert] = []
        for cap_url, doc in parsed:
            if doc.identifier and doc.identifier not in leaf_ids:
                continue
            info = _select_info(doc, language)
            alt = _select_alt_info(doc, info)
            alert_id = _compute_wmo_id(doc.identifier, cap_url)
            alerts.append(_build_alert(doc, info, cap_url, alert_id, alt))

        gps_loc = config.get(CONF_GPS_LOC)
        if gps_loc:
            return self._filter_by_polygon(alerts, gps_loc, source_id)
        return alerts

    @staticmethod
    def _filter_by_polygon(
        alerts: list[CAPAlert], gps_loc: str, source_id: str
    ) -> list[CAPAlert]:
        """Keep alerts whose geometry contains the configured GPS point.

        Fails loud when the feed has alerts but none carry polygons — that
        signals the source does not publish per-alert geometry, so GPS mode
        cannot work (matches the ECCC/MeteoAlarm GPS-mode contract).
        """
        if not alerts:
            return []
        with_polygons = [a for a in alerts if a.geometry]
        if not with_polygons:
            raise UpdateFailed(
                f"WMO {source_id}: GPS filter requested but {len(alerts)} alerts "
                "carry no polygons; this source does not publish per-alert geometry"
            )
        gps = parse_gps(gps_loc)
        if gps is None:
            raise UpdateFailed(f"WMO {source_id}: invalid GPS coordinates {gps_loc!r}")
        lat, lon = gps
        kept: list[CAPAlert] = []
        for alert in alerts:
            for ring in alert_polygons(alert):
                if point_in_polygon(lat, lon, ring):
                    kept.append(alert)
                    break
        return kept
