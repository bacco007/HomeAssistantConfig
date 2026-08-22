"""DataUpdateCoordinator for CAP Alerts."""

from __future__ import annotations

import asyncio
import json
import logging
import re
from collections.abc import Mapping, Sequence
from datetime import datetime, timedelta, timezone
from typing import Any

import aiohttp

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_LATITUDE, ATTR_LONGITUDE
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.util.ssl import client_context

from .const import (
    CONF_COUNTRY,
    CONF_COUNTRY_ATTRIBUTE,
    CONF_COUNTRY_ENTITY,
    CONF_EXCLUDE_MARINE,
    CONF_GEOCODE_PREFIXES,
    CONF_GPS_LOC,
    CONF_LANGUAGE,
    CONF_PROVIDER,
    CONF_PROVINCE,
    CONF_SCAN_INTERVAL,
    CONF_STREAMING,
    CONF_TIMEOUT,
    CONF_TRACKER_ENTITY,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_STREAM_RESYNC_INTERVAL,
    DEFAULT_TIMEOUT,
    DOMAIN,
    METEOALARM_COUNTRIES,
    METEOALARM_COUNTRY_CODE_ALIASES,
    METEOALARM_COUNTRY_NAME_ALIASES,
    METEOALARM_COUNTRY_NAMES,
    NAAD_STREAM_BACKFILL_MIN_INTERVAL_S,
    NAAD_STREAM_HOST,
    NAAD_STREAM_PORT,
)
from .geometry_store import GeometryStore
from .model import CAPAlert
from .normalize import normalize_alerts
from .providers import AlertProvider, BackfillProvider
from .providers.cap import CAPDoc, parse_cap_alert
from .providers.cap_content_cache import CAPContentCache
from .providers.eccc import (
    ECCCProvider,
    build_alerts_from_cap_docs,
    doc_matches_region,
    is_actual,
)
from .providers.naad_stream import NAADStreamClient
from .store import AlertStore

_LOGGER = logging.getLogger(__name__)


def exclude_marine_alerts(alerts: list[CAPAlert], enabled: bool) -> list[CAPAlert]:
    """Drop marine/water-zone alerts when the exclude-marine option is on.

    Provider-neutral: relies on the per-provider ``is_marine`` flag. Returns
    the list unchanged when disabled (default), so non-marine-aware providers
    (MeteoAlarm, WMO) are unaffected.
    """
    if not enabled:
        return alerts
    return [a for a in alerts if not a.is_marine]


def matches_geocode_prefixes(alert: CAPAlert, prefixes: Sequence[str]) -> bool:
    """Whether any of the alert's area geocodes starts with any of ``prefixes``.

    Scheme-agnostic: every value in the ``geocodes`` container is compared,
    whatever its CAP ``valueName``. There is no cross-provider scheme-priority
    registry to derive a single "the" code from (MeteoAlarm's is country-scoped
    and WMO sources publish arbitrary schemes), and a colliding prefix
    over-matches — keeping extra alerts — rather than dropping wanted ones.

    Comparison is casefolded and whitespace-stripped on both sides, so
    alphabetic schemes (``UGC``, ``EMMA_ID``) behave like the numeric ones.
    ``prefixes`` is expected pre-folded by the caller.
    """
    for codes in alert.geocodes.values():
        for code in codes:
            folded = code.strip().casefold()
            if folded and any(folded.startswith(p) for p in prefixes):
                return True
    return False


def filter_by_geocode_prefixes(
    alerts: list[CAPAlert], prefixes: Sequence[str]
) -> list[CAPAlert]:
    """Keep alerts whose area geocodes match one of the configured prefixes.

    Provider-neutral narrowing on top of whatever location mode the entry uses:
    every provider populates ``CAPAlert.geocodes``, so this composes with NWS
    zones, ECCC provinces, MeteoAlarm regions, and WMO country-wide/GPS modes
    alike. Returns the list unchanged when no prefixes are configured (the
    default), so existing entries are untouched.

    A prefix is a *scope* because area codes are hierarchical: ``13`` is Hebei,
    ``1307`` Zhangjiakou, ``130709000000`` Chongli. Codes vary in length within
    one scheme — of 488 sampled CMA codes on 2026-08-04, 481 were 12 characters
    and 7 were 6 — so the match is a plain ``startswith`` with no zero-padding
    in either direction.

    Fails loud only on a *source capability* failure: the feed returned alerts
    but not one of them carries any geocode at all, so prefix filtering cannot
    work here (the parallel of "this source publishes no per-alert geometry" in
    the GPS filters). Zero *matches* is not a failure — "no alerts in my area"
    is the normal steady state, and failing there would leave the entry
    unavailable most of the time, inverting what unavailability means. The
    caller logs a one-shot warning for that case instead, which is where a
    typo'd prefix surfaces.
    """
    wanted = tuple(p.strip().casefold() for p in prefixes if p and p.strip())
    if not wanted or not alerts:
        return alerts
    if not any(a.geocodes for a in alerts):
        raise UpdateFailed(
            f"geocode filter requested but none of {len(alerts)} alerts carry "
            "area geocodes; this source does not publish them"
        )
    return [a for a in alerts if matches_geocode_prefixes(a, wanted)]


def _doc_sent_before(doc: CAPDoc, cutoff: datetime) -> bool:
    """Whether a CAP doc's ``sent`` timestamp is before ``cutoff``.

    Fails open — an unparseable or missing ``sent`` returns ``False`` so the doc
    is retained rather than pruned on a formatting quirk. A tz-naive timestamp is
    assumed UTC.
    """
    if not doc.sent:
        return False
    try:
        sent = datetime.fromisoformat(doc.sent)
    except ValueError:
        return False
    if sent.tzinfo is None:
        sent = sent.replace(tzinfo=timezone.utc)
    return sent < cutoff


def _scope_key(config: Mapping[str, Any], options: Mapping[str, Any]) -> str:
    """A stable identity for the query a reconciliation runs.

    Serialized rather than hashed so unhashable option values (the geocode
    prefix list) participate without special-casing; ``default=str`` keeps an
    exotic value from raising here, where the cost of a wrong answer is one
    suspended retention cycle.
    """
    return json.dumps([config, options], sort_keys=True, default=str)


def _resolve_tracker_gps(state: Any) -> str | None:
    """Resolve a ``device_tracker`` state to a ``"lat,lon"`` string.

    Returns ``None`` when the state is missing or carries no usable
    coordinates. Latitude/longitude of exactly ``0.0`` is valid — only a
    truly absent attribute (``None``) is treated as unresolvable, so the
    equator/prime-meridian are not silently dropped.
    """
    if state is None:
        return None
    lat = state.attributes.get(ATTR_LATITUDE)
    lon = state.attributes.get(ATTR_LONGITUDE)
    if lat is None or lon is None:
        return None
    return f"{lat},{lon}"


def _resolve_country_code(value: Any) -> str | None:
    """Map a country-source value to a MeteoAlarm ISO-2 code, or ``None``.

    Accepts a two-letter code — MeteoAlarm's own (``"UK"``), ISO 3166-1
    (``"GB"``), or the EU institutional variant (``"EL"``) — or a country
    name, case-insensitively. Names match ``METEOALARM_COUNTRY_NAMES``
    display names and ``METEOALARM_COUNTRY_NAME_ALIASES``, after stripping
    parenthetical suffixes so reverse-geocoder output like
    ``"Moldova (the Republic of)"`` resolves. Non-string or unrecognized
    values return ``None``.
    """
    if not isinstance(value, str):
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    upper = cleaned.upper()
    if upper in METEOALARM_COUNTRIES:
        return upper
    if upper in METEOALARM_COUNTRY_CODE_ALIASES:
        return METEOALARM_COUNTRY_CODE_ALIASES[upper]
    folded = re.sub(r"\s*\([^)]*\)", "", cleaned).strip().casefold()
    alias = METEOALARM_COUNTRY_NAME_ALIASES.get(folded)
    if alias is not None:
        return alias
    for iso, name in METEOALARM_COUNTRY_NAMES.items():
        if name.casefold() == folded:
            return iso
    return None


class AlertsDataUpdateCoordinator(DataUpdateCoordinator[dict[str, CAPAlert]]):
    """Coordinator that delegates fetching to a provider."""

    config_entry: ConfigEntry

    # Identity of the query the last reconciliation ran, and whether the current
    # one differs (see ``_resolve_config``). Class-level so every construction
    # path has them, including the ``object.__new__`` shortcut the resolution
    # tests use to skip the coordinator's Home Assistant dependencies.
    _scope_key: str | None = None
    _scope_changed: bool = False

    # What the last resolution produced — tracker → coordinates, country entity
    # → ISO-2, language "auto" → a concrete tag. Diagnostics reports this pair
    # rather than re-running the resolution, which owns the scope key above and
    # would consume a scope change the next real cycle needs to see. Class-level
    # for the same reason as the two above.
    _resolved_config: dict[str, Any] | None = None
    _resolved_options: dict[str, Any] | None = None

    def __init__(
        self,
        hass,
        entry: ConfigEntry,
        provider: AlertProvider,
        user_agent: str,
        geometry_store: GeometryStore,
        cap_content_cache: CAPContentCache | None = None,
    ) -> None:
        self._provider = provider
        self._store = AlertStore(hass, entry.entry_id, provider.name)
        self._geometry_store = geometry_store
        self._user_agent = user_agent
        self._cap_content_cache = cap_content_cache
        self._timeout = entry.options.get(CONF_TIMEOUT, DEFAULT_TIMEOUT)
        # Snapshot of the entry data this coordinator was built from. The
        # reconfigure flow no longer reloads the entry itself (see
        # __init__._async_entry_updated), so this is what tells the update
        # listener that a rebuild is required rather than an in-place tweak.
        self._entry_data = dict(entry.data)
        self.last_update_success_time: datetime | None = None
        # Last failed update, kept *after* a recovery rather than cleared: the
        # diagnostics dump is read after the fact, and "it broke at 04:12 and
        # has been fine since" is the answer a report needs. Compare against
        # ``last_update_success_time`` to tell which came last.
        self.last_update_failure_time: datetime | None = None
        self.last_update_failure: str | None = None
        # Guard a single warning per failure streak when a tracker or
        # MeteoAlarm country-source entity can't be resolved, so the
        # per-poll resolution doesn't spam the log.
        self._tracker_resolve_warned = False
        self._country_resolve_warned = False
        self._stream_backfill_warned = False
        # Same guard for a geocode-prefix filter that matches nothing — the
        # only signal distinguishing a typo'd prefix from a quiet period.
        self._geocode_no_match_warned = False

        # Real-time streaming (ECCC only, default on). When enabled, a background
        # NAAD stream client pushes CAP docs into _live_docs and the GeoRSS feed
        # is used only as (re)connect + periodic-resync backfill; the poll
        # interval becomes the safety-resync cadence rather than the hot loop.
        self._streaming = provider.name == "eccc" and entry.options.get(
            CONF_STREAMING, True
        )
        # The backfill needs the doc-level fetch, which the AlertProvider protocol
        # deliberately doesn't carry. Narrow once here so the backfill is typed
        # rather than reaching through an ignore on every call.
        self._backfill_provider: BackfillProvider | None = (
            provider if isinstance(provider, BackfillProvider) else None
        )
        self._live_docs: dict[str, CAPDoc] = {}
        self._ingest_lock = asyncio.Lock()
        self._stream_client: NAADStreamClient | None = None
        self._stream_task: asyncio.Task[None] | None = None
        self._stream_connected = False
        # When the last GeoRSS backfill was attempted, from either source, so a
        # reconnect-triggered one can be throttled against it.
        self._last_backfill_at: datetime | None = None

        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN}_{entry.entry_id}",
            update_interval=self.resolve_update_interval(entry),
        )

    @staticmethod
    def streaming_enabled(entry: ConfigEntry) -> bool:
        """Whether a config entry is configured for ECCC streaming (default on).

        Derived from the entry alone, so the setup path can compare a *pending*
        options change against a live coordinator's ``streaming``.
        """
        return entry.data.get(CONF_PROVIDER) == "eccc" and entry.options.get(
            CONF_STREAMING, True
        )

    def entry_data_changed(self, entry: ConfigEntry) -> bool:
        """Whether ``entry`` data differs from what this coordinator was built from.

        Provider, location, source id, and filter mode are all read once at
        construction, so a reconfigure that rewrites them needs a rebuild — the
        update listener's cue to reload. Compares the whole mapping rather than
        named keys so a newly added data key cannot silently skip the reload.
        """
        return dict(entry.data) != self._entry_data

    @property
    def streaming(self) -> bool:
        """Whether this coordinator ingests from the NAAD stream."""
        return self._streaming

    @property
    def stream_connected(self) -> bool:
        """Whether the NAAD socket is currently established.

        Always ``False`` for a non-streaming entry. Distinct from availability:
        the socket can be down while the entry is perfectly healthy on backfills,
        which is precisely the state the connectivity entity exists to surface.
        """
        return self._stream_connected

    @callback
    def _on_stream_connection_change(self, connected: bool) -> None:
        """Publish a socket connect/disconnect to entity listeners.

        Only notifies listeners — it must not touch ``last_update_success``: a
        dropped socket is not a failed data refresh (issue #16), and the entry
        stays available on backfills while the client reconnects.
        """
        self._stream_connected = connected
        self.async_update_listeners()

    def resolve_update_interval(self, entry: ConfigEntry) -> timedelta:
        """Poll interval: the GeoRSS scan interval, or the resync cadence when streaming.

        Public because the options-update listener re-derives the interval from a
        changed entry, and the streaming-vs-polling branch must not be duplicated
        there.
        """
        if self._streaming:
            return timedelta(seconds=DEFAULT_STREAM_RESYNC_INTERVAL)
        return timedelta(
            seconds=entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        )

    @property
    def provider(self) -> AlertProvider:
        """Expose provider for device_info model field."""
        return self._provider

    @property
    def device_info(self) -> DeviceInfo:
        """Device identity for every entity of this config entry.

        Single source of truth: the sensor and button platforms both defer here,
        so the device name/model cannot drift between them — a mismatch would
        split one entry's entities across two devices in the registry.
        """
        model = self._provider.name.upper()
        return DeviceInfo(
            identifiers={(DOMAIN, self.config_entry.entry_id)},
            name=f"CAP Alerts {model}",
            manufacturer="CAP Alerts",
            model=model,
        )

    def update_timeout(self, timeout: int) -> None:
        """Called by options update listener."""
        self._timeout = timeout

    def _resolve_config(self) -> tuple[dict[str, Any], dict[str, Any]]:
        """Resolve config and options before passing to provider.

        - Tracker mode: resolves tracker entity -> lat/lon coordinates.
        - Country-source mode: resolves a country entity -> ISO-2 country.
        - Language "auto": resolves to a concrete tag, per provider.
        """
        config = dict(self.config_entry.data)
        options = dict(self.config_entry.options)

        # Resolve tracker entity -> GPS coordinates. An unresolvable tracker
        # (missing state or no lat/lon) raises UpdateFailed so the entry goes
        # visibly unavailable rather than silently degrading to zero or
        # country-wide alerts.
        if CONF_TRACKER_ENTITY in config:
            entity_id = config[CONF_TRACKER_ENTITY]
            gps = _resolve_tracker_gps(self.hass.states.get(entity_id))
            if gps is None:
                provider = config.get(CONF_PROVIDER, "")
                if not self._tracker_resolve_warned:
                    _LOGGER.warning(
                        "%s: tracker %s has no location", provider, entity_id
                    )
                    self._tracker_resolve_warned = True
                raise UpdateFailed(f"{provider}: tracker {entity_id} has no location")
            self._tracker_resolve_warned = False
            config[CONF_GPS_LOC] = gps

        # Resolve country-source entity -> ISO-2 country (MeteoAlarm mobile
        # mode). Leaving CONF_COUNTRY unset lets the provider's existing
        # "country not configured" path surface UpdateFailed.
        if CONF_COUNTRY_ENTITY in config:
            entity_id = config[CONF_COUNTRY_ENTITY]
            state = self.hass.states.get(entity_id)
            value: str | None = None
            if state is not None and state.state not in (
                "",
                "unknown",
                "unavailable",
            ):
                attr = config.get(CONF_COUNTRY_ATTRIBUTE)
                value = state.attributes.get(attr) if attr else state.state
            code = _resolve_country_code(value)
            if code is None:
                if not self._country_resolve_warned:
                    _LOGGER.warning(
                        "MeteoAlarm: could not resolve country from %s (value=%r)",
                        entity_id,
                        value,
                    )
                    self._country_resolve_warned = True
            else:
                self._country_resolve_warned = False
                config[CONF_COUNTRY] = code

        # Resolve language "auto" -> concrete code, three ways:
        # - MeteoAlarm spans ~35 locales but one region set per country, so the
        #   2-letter prefix of hass.config.language is enough for its
        #   language-prefix matcher to find the closest <cap:info> block;
        # - WMO bodies carry full tags (en-GB vs en-US, pt-PT vs pt-BR,
        #   zh-CN vs zh-HK), so the tag is passed verbatim — truncating first
        #   would discard the distinction and pick arbitrarily. Its matcher
        #   casefolds and degrades to the primary subtag on its own;
        # - ECCC is bilingual EN/FR, so it resolves to one of two full tags.
        lang = options.get(CONF_LANGUAGE, "auto")
        if lang == "auto":
            provider = config.get(CONF_PROVIDER, "")
            if provider == "meteoalarm":
                options[CONF_LANGUAGE] = (
                    self.hass.config.language.split("-", 1)[0].lower() or "en"
                )
            elif provider == "wmo":
                options[CONF_LANGUAGE] = self.hass.config.language.strip() or "en"
            else:
                options[CONF_LANGUAGE] = (
                    "fr-CA" if self.hass.config.language.startswith("fr") else "en-CA"
                )

        # Compared against the previous cycle's, this decides whether the store
        # may retain alerts missing from the incoming set. Taken after
        # resolution so a moved tracker registers, and over the whole resolved
        # pair so a reconfigured zone, a flipped marine toggle, or narrowed
        # geocode prefixes register too: each of those makes the previous active
        # set answer a question no longer being asked, and none of them is a
        # feed dropout. Options that do not narrow the query cost at most one
        # cycle of suspended retention when they change.
        key = _scope_key(config, options)
        self._scope_changed = self._scope_key is not None and key != self._scope_key
        self._scope_key = key

        self._resolved_config = config
        self._resolved_options = options
        return config, options

    @property
    def resolved_config(self) -> Mapping[str, Any]:
        """Entry data as the last resolution left it, or the raw data before one."""
        if self._resolved_config is None:
            return self.config_entry.data
        return self._resolved_config

    @property
    def resolved_options(self) -> Mapping[str, Any]:
        """Entry options as the last resolution left it, or the raw options."""
        if self._resolved_options is None:
            return self.config_entry.options
        return self._resolved_options

    @property
    def live_doc_count(self) -> int:
        """How many CAP documents the streaming live set currently holds."""
        return len(self._live_docs)

    @property
    def last_backfill_time(self) -> datetime | None:
        """When a GeoRSS backfill was last attempted (streaming entries only)."""
        return self._last_backfill_at

    async def _async_update_data(self) -> dict[str, CAPAlert]:
        try:
            return await self._async_fetch_data()
        except Exception as err:
            # Recorded for diagnostics, then re-raised untouched — the base
            # coordinator still owns availability, logging, and backoff.
            self.last_update_failure = str(err) or type(err).__name__
            self.last_update_failure_time = datetime.now(timezone.utc)
            raise

    async def _async_fetch_data(self) -> dict[str, CAPAlert]:
        config, options = self._resolve_config()

        # Streaming mode: the periodic tick is a GeoRSS safety-resync backfill,
        # not the primary ingestion path (the stream client pushes in real time).
        if self._streaming:
            return await self._backfill(config, options)

        try:
            async with asyncio.timeout(self._timeout):
                alerts = await self._provider.async_fetch(
                    async_get_clientsession(self.hass),
                    config,
                    options,
                    cap_content_cache=self._cap_content_cache,
                    user_agent=self._user_agent,
                )
        except TimeoutError as err:
            raise UpdateFailed(
                f"{self._provider.name}: timeout after {self._timeout}s"
            ) from err
        except aiohttp.ClientError as err:
            raise UpdateFailed(f"{self._provider.name}: {err}") from err

        data = await self._apply(alerts)
        self.last_update_success_time = datetime.now(timezone.utc)
        return data

    async def _apply(self, alerts: list[CAPAlert]) -> dict[str, CAPAlert]:
        """Run the shared post-fetch pipeline and index the active set by ID.

        Normalize → marine filter → geocode filter → geometry externalization →
        store diff. Used by both the polling path and the streaming
        ingest/backfill paths so their transition detection, event firing, and
        geometry handling are identical.

        Deliberately does *not* stamp ``last_update_success_time``: the streaming
        path runs this pipeline on every heartbeat with no network I/O, and the
        "Last updated" sensor reports when data was last *fetched*, not when the
        active set was last recomputed. Only the fetch-backed callers stamp it.
        """
        # Shared normalization. The full normalized list — including
        # cancelled/expired alerts — is handed to store.process so it can
        # fire cap_alert_removed with the true terminal phase before
        # dropping them from the active set (RFC §2.3).
        entry_id = self.config_entry.entry_id
        alerts = normalize_alerts(alerts, entry_id)
        # Opt-in marine filter (NWS/ECCC). Dropped alerts flow through store as
        # silent disappearances, so existing marine entities are removed (firing
        # incident_removed) when the toggle is flipped on.
        exclude_marine = self.config_entry.options.get(CONF_EXCLUDE_MARINE, False)
        alerts = exclude_marine_alerts(alerts, exclude_marine)
        # Opt-in area-code narrowing, layered on the entry's location mode.
        prefixes = self.config_entry.options.get(CONF_GEOCODE_PREFIXES) or []
        if prefixes:
            kept = filter_by_geocode_prefixes(alerts, prefixes)
            self._warn_geocode_no_match(alerts, kept, prefixes)
            alerts = kept
        # Externalize geometry for alerts that will remain active. Skipping
        # terminal-phase alerts avoids caching polygons we're about to drop.
        active_refs: set[str] = set()
        for a in alerts:
            if a.phase in ("cancel", "expired"):
                continue
            if a.geometry_ref and a.geometry:
                await self._geometry_store.put(a.geometry_ref, a.geometry)
                active_refs.add(a.geometry_ref)
        # Purge only this entry's refs (geometry_ref is entry-namespaced), so a
        # sibling entry on the same provider keeps its geometry.
        await self._geometry_store.purge_missing(active_refs, prefix=f"{entry_id}:")
        # Diff against previous poll — returns only active alerts.
        alerts = self._store.process(
            alerts,
            scope_changed=self._scope_changed,
            superseded_identifiers=frozenset(
                ref_id
                for doc in self._live_docs.values()
                for _, ref_id, _ in doc.references
            ),
        )
        self._scope_changed = False
        # Index by ID for O(1) lookup
        return {a.id: a for a in alerts}

    def _warn_geocode_no_match(
        self,
        before: list[CAPAlert],
        after: list[CAPAlert],
        prefixes: Sequence[str],
    ) -> None:
        """Warn once when a geocode prefix filters everything out.

        The filter deliberately does not fail on zero matches, which leaves a
        mistyped prefix indistinguishable from a genuinely quiet area — the
        entry stays healthy and simply reports no alerts, forever. One WARNING
        per no-match streak surfaces that without flapping entity availability;
        the flag resets on the first poll that matches something.
        """
        if after:
            self._geocode_no_match_warned = False
            return
        if not before or self._geocode_no_match_warned:
            return
        self._geocode_no_match_warned = True
        _LOGGER.warning(
            "%s: geocode prefixes %s matched none of %d alerts. Alerts are "
            "published for codes such as %s — check the prefix, and note that "
            "a shorter prefix covers a wider area",
            self._provider.name,
            ",".join(prefixes),
            len(before),
            ", ".join(sorted(self._sample_geocodes(before))) or "(none)",
        )

    @staticmethod
    def _sample_geocodes(alerts: list[CAPAlert], limit: int = 5) -> set[str]:
        """A few distinct area codes from ``alerts``, to make the warning actionable."""
        sample: set[str] = set()
        for alert in alerts:
            for codes in alert.geocodes.values():
                for code in codes:
                    sample.add(code)
                    if len(sample) >= limit:
                        return sample
        return sample

    # ------------------------------------------------------------------
    # Streaming ingestion (ECCC)
    # ------------------------------------------------------------------

    def _build_kwargs(
        self, config: Mapping[str, Any], options: Mapping[str, Any]
    ) -> dict[str, Any]:
        """Region/language kwargs for build_alerts_from_cap_docs from resolved config."""
        gps_lat, gps_lon = ECCCProvider._parse_gps(config)
        return {
            "province": config.get(CONF_PROVINCE, ""),
            "gps_lat": gps_lat,
            "gps_lon": gps_lon,
            "preferred_lang": options.get(CONF_LANGUAGE, "en-CA"),
        }

    @callback
    def _async_push_data(self, data: dict[str, CAPAlert]) -> None:
        """Publish stream-sourced data to entities.

        Deliberately *not* ``async_set_updated_data``: that resets the
        ``update_interval`` timer, so heartbeats arriving every ~60 s would defer
        the 30-minute safety-resync backfill indefinitely and it would never run.
        It also asserts ``last_update_success``, which would let a heartbeat mark
        entities available again while the authoritative backfill is failing.
        Only a backfill drives availability (issue #16); the stream publishes
        data and notifies listeners, nothing more.
        """
        self.data = data
        self.async_update_listeners()

    def _admit(
        self, docs: list[CAPDoc], build_kwargs: Mapping[str, Any]
    ) -> list[CAPDoc]:
        """Screen streamed docs down to the ones worth holding in the live set.

        The socket carries every alert in Canada, so admitting everything would
        size the live set — and the rebuild it feeds on every stream event — by
        national volume rather than by the configured region. A doc is kept when
        it matches the region, or when it references something already tracked:
        the latter so an update or cancellation still supersedes an alert we hold
        even if its revised geometry no longer covers the user.

        Admission is deliberately wider than the rebuild that follows:
        ``doc_matches_region`` matches on *any* ``<info>`` block, including one
        whose area group has already ended. That is the point — an ECCC document
        segments into a block per area group, and the block that ends a tracked
        alert is often the only one still covering the user. Screening it out
        here would leave the entity live until its stale ``expires`` (issue #45).
        Which block actually speaks for this region, and whether it is terminal,
        is decided later by ``build_alerts_from_cap_docs``.

        Test/exercise traffic is rejected up front rather than left to
        ``doc_matches_region``, since the references escape bypasses that check —
        and a heartbeat's ``<references>`` lists recent alert OIDs, so a heartbeat
        that ever escaped classification would otherwise be admitted once a minute.
        """
        kept: list[CAPDoc] = []
        for doc in docs:
            if not is_actual(doc):
                continue
            if doc_matches_region(doc, **build_kwargs) or any(
                ref_id in self._live_docs for _, ref_id, _ in doc.references
            ):
                kept.append(doc)
        return kept

    def _merge_docs(self, docs: list[CAPDoc]) -> None:
        """Upsert docs into the live set by CAP identifier and prune stale ones."""
        for doc in docs:
            if doc.identifier:
                self._live_docs[doc.identifier] = doc
        # The NAAD feeds carry a rolling 48 h window; drop anything older so the
        # live set stays bounded and superseded/expired docs age out.
        cutoff = datetime.now(timezone.utc) - timedelta(hours=48)
        stale = [
            identifier
            for identifier, doc in self._live_docs.items()
            if _doc_sent_before(doc, cutoff)
        ]
        for identifier in stale:
            del self._live_docs[identifier]

    async def _backfill(
        self, config: Mapping[str, Any], options: Mapping[str, Any]
    ) -> dict[str, CAPAlert]:
        """Seed/re-sync the live set from the GeoRSS feed and rebuild the active set.

        Runs under the ingest lock so it cannot interleave with a stream push.
        Raises UpdateFailed on fetch failure (drives availability, issue #16).
        """
        provider = self._backfill_provider
        if provider is None:  # pragma: no cover — guarded by the _streaming gate
            raise UpdateFailed(
                f"{self._provider.name}: provider cannot supply backfill documents"
            )
        async with self._ingest_lock:
            # Stamped before the fetch, and whether or not it succeeds: what the
            # reconnect throttle has to bound is the ~7 MB transfer, which a
            # failing feed costs just the same.
            self._last_backfill_at = datetime.now(timezone.utc)
            try:
                async with asyncio.timeout(self._timeout):
                    docs = await provider.async_fetch_docs(
                        async_get_clientsession(self.hass),
                        config,
                        options,
                        cap_content_cache=self._cap_content_cache,
                        user_agent=self._user_agent,
                    )
            except TimeoutError as err:
                raise UpdateFailed(
                    f"{self._provider.name}: timeout after {self._timeout}s"
                ) from err
            except aiohttp.ClientError as err:
                raise UpdateFailed(f"{self._provider.name}: {err}") from err

            self._merge_docs(docs)
            alerts = build_alerts_from_cap_docs(
                list(self._live_docs.values()), **self._build_kwargs(config, options)
            )
            data = await self._apply(alerts)
        self.last_update_success_time = datetime.now(timezone.utc)
        return data

    async def async_ingest_docs(self, docs: list[CAPDoc]) -> None:
        """Merge streamed docs into the live set, rebuild, and push to entities.

        Called by the stream client for each alert doc (``docs=[doc]``) and for
        each heartbeat (``docs=[]``) — the heartbeat rebuild ages out alerts that
        have since expired, with no network I/O.
        """
        try:
            config, options = self._resolve_config()
        except UpdateFailed:
            # Region unresolvable right now (e.g. tracker has no location) — drop
            # this push; the next backfill re-seeds from the authoritative feed.
            return
        build_kwargs = self._build_kwargs(config, options)
        async with self._ingest_lock:
            self._merge_docs(self._admit(docs, build_kwargs))
            alerts = build_alerts_from_cap_docs(
                list(self._live_docs.values()), **build_kwargs
            )
            data = await self._apply(alerts)
        self._async_push_data(data)

    async def _on_backfill_needed(self) -> None:
        """GeoRSS backfill requested by the stream client on reconnect.

        Throttled against the last backfill from either source. The client's
        backoff only grows for connections that delivered nothing, so an endpoint
        that sends a heartbeat and then drops reconnects at the heartbeat (or
        watchdog) cadence with the backoff pinned at its floor — and each
        reconnect would otherwise pay a full ~7 MB feed fetch, making a flapping
        socket more expensive than the polling it replaced. Skipping is safe: the
        periodic resync still runs, and a backfill within the last few minutes has
        already recovered essentially everything this one would.

        A transient backfill failure here does not flip availability (issue #16) —
        the periodic ``_async_update_data`` backfill is the authoritative signal.
        It is still worth a warning, once per failure streak, since a persistently
        failing reconnect backfill means alerts missed while disconnected are not
        being recovered.
        """
        last = self._last_backfill_at
        if last is not None and datetime.now(timezone.utc) - last < timedelta(
            seconds=NAAD_STREAM_BACKFILL_MIN_INTERVAL_S
        ):
            _LOGGER.debug(
                "ECCC: skipping reconnect backfill; one ran %.0fs ago (floor %ds)",
                (datetime.now(timezone.utc) - last).total_seconds(),
                NAAD_STREAM_BACKFILL_MIN_INTERVAL_S,
            )
            return
        try:
            config, options = self._resolve_config()
            data = await self._backfill(config, options)
        except UpdateFailed as err:
            if not self._stream_backfill_warned:
                _LOGGER.warning(
                    "ECCC: stream-triggered backfill failed: %s; alerts issued "
                    "while disconnected may be missing until the next resync",
                    err,
                )
                self._stream_backfill_warned = True
            return
        self._stream_backfill_warned = False
        self._async_push_data(data)

    async def _on_stream_alert_doc(self, doc_str: str) -> None:
        loop = asyncio.get_running_loop()
        doc = await loop.run_in_executor(None, parse_cap_alert, doc_str)
        if doc is None or not doc.identifier:
            return
        await self.async_ingest_docs([doc])

    async def _on_stream_heartbeat(self) -> None:
        await self.async_ingest_docs([])

    async def async_start_stream(self) -> None:
        """Start the NAAD stream background task (no-op unless streaming). Idempotent."""
        if not self._streaming or self._stream_task is not None:
            return
        # Build the TLS context off the event loop: it reads the CA bundle from
        # disk, and HA flags that as a blocking call. ``client_context`` is HA's
        # certifi-backed client context and is itself cached, so entries after
        # the first pay nothing. Note it advertises no ALPN protocol — the NAAD
        # socket carries raw CAP, not HTTP, so ``get_default_context`` (which
        # pins ALPN to http/1.1) would be wrong here.
        ssl_context = await self.hass.async_add_executor_job(client_context)
        self._stream_client = NAADStreamClient(
            NAAD_STREAM_HOST,
            NAAD_STREAM_PORT,
            on_alert_doc=self._on_stream_alert_doc,
            on_heartbeat=self._on_stream_heartbeat,
            on_backfill_needed=self._on_backfill_needed,
            on_connection_change=self._on_stream_connection_change,
            ssl_context=ssl_context,
            logger=_LOGGER,
        )
        self._stream_task = self.hass.async_create_background_task(
            self._stream_client.run(),
            name=f"{DOMAIN}_naad_stream_{self.config_entry.entry_id}",
        )

    async def async_stop_stream(self) -> None:
        """Stop the NAAD stream task and client. Idempotent; no task leak."""
        client = self._stream_client
        task = self._stream_task
        self._stream_client = None
        self._stream_task = None
        if client is not None:
            client.stop()
        if task is not None:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            except Exception as err:  # noqa: BLE001 — teardown best-effort
                _LOGGER.debug("ECCC: stream task raised on teardown: %s", err)
        # run()'s finally normally publishes the disconnect, but a client that
        # never started (or a task cancelled before it ran) leaves the flag set
        # from a previous connection. Clear it directly; entities are being torn
        # down anyway, so no notification is needed.
        self._stream_connected = False
