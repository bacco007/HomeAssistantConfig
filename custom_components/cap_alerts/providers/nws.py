"""NWS GeoJSON API provider — zone/GPS/tracker."""

from __future__ import annotations

import hashlib
import logging
import re
from collections.abc import Mapping
from datetime import datetime, timedelta, timezone
from typing import Any

import aiohttp

from homeassistant.helpers.update_coordinator import UpdateFailed

from ..const import CONF_GPS_LOC, CONF_ZONE_ID
from ..conventions import NWS_MARINE_UGC_PREFIXES as _NWS_MARINE_UGC_PREFIXES
from ..conventions import StageContext, conventions_for, is_marine_code
from ..model import CAPAlert, geocodes_from

_LOGGER = logging.getLogger(__name__)

NWS_API_BASE = "https://api.weather.gov/alerts/active"
# Cancellations never appear on the active endpoint; they are only reachable
# through the all-messages one. See ``_fetch_cancellations``.
NWS_ALL_BASE = "https://api.weather.gov/alerts"
# Zone lookup, for validating a configured zone before an entry is created.
# Takes a comma-separated ``id`` list and answers with one feature per zone it
# knows, so the whole configured list costs one request.
NWS_ZONES_BASE = "https://api.weather.gov/zones"
MAX_PAGINATION_FOLLOWS = 5

# How far back the cancellation lookup reaches. It only has to cover the gap
# between an alert leaving the active endpoint and the next reconciliation, so
# this is generous rather than tuned; the query is scoped to one zone or point
# and returned single digits over a six-hour national sample.
CANCEL_LOOKBACK = timedelta(hours=6)

# Ceiling on absent alerts still eligible for cancellation discovery. Ids whose
# alert published an expiry age out on their own; one that published none never
# does, so without a cap a source omitting ``expires`` could grow this set for
# the life of the config entry. A zone tracks single-digit concurrent alerts, so
# this is far above any real working set and exists only to bound the pathology.
_MAX_CANCELLABLE_IDS = 256


def _still_cancellable(expires: str, now: datetime) -> bool:
    """Whether an absent alert's cancellation is still worth discovering.

    Mirrors ``store._retain_on_absence`` deliberately: eligibility must last
    exactly as long as the store keeps the alert, or the two halves of the
    contract disagree about the same alert. An alert with no parseable
    ``expires`` is retained until an explicit terminal signal arrives, and for
    NWS that signal is a VTEC ``CAN`` product this lookup is the only way to
    see. Dropping such an id would therefore pin the alert live permanently
    while switching off the one mechanism that could ever end it — the worst
    of both policies, and the reason this returns True rather than False for
    an empty or unparseable expiry.

    The store owns the retention decision; this only decides whether to keep
    asking. ``_MAX_CANCELLABLE_IDS`` bounds the resulting set, since ids kept
    on this branch have no timestamp to age them out.
    """
    if not expires:
        return True
    try:
        expires_at = datetime.fromisoformat(expires.replace("Z", "+00:00"))
    except ValueError:
        return True
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return now < expires_at


# The marine-prefix vocabulary itself lives in the convention table; re-bound
# here so the parse site below reads in NWS terms.
NWS_MARINE_UGC_PREFIXES = _NWS_MARINE_UGC_PREFIXES

_NWS_CONVENTIONS = conventions_for("nws")


def _is_marine_nws(codes: tuple[str, ...]) -> bool:
    """Return True if any UGC/zone code is a marine-area code."""
    return is_marine_code(codes, _NWS_CONVENTIONS)


# VTEC regex: /P.ACTION.OFFICE.PP.S.NNNN.YYMMDDTHHMMZ-YYMMDDTHHMMZ/
_VTEC_RE = re.compile(
    r"/[A-Z]\.([A-Z]{3})\.([A-Z]{4})\.([A-Z]{2})\.([A-Z])\.(\d{4})"
    r"\.(\d{2})\d{4}T\d{4}Z-\d{6}T\d{4}Z/"
)


def _parse_vtec(vtec_str: str) -> dict[str, str]:
    """Parse a VTEC string into component fields."""
    m = _VTEC_RE.match(vtec_str)
    if not m:
        return {}
    return {
        "vtec_action": m.group(1),
        "vtec_office": m.group(2),
        "vtec_phenomena": m.group(3),
        "vtec_significance": m.group(4),
        "vtec_tracking": m.group(5),
        "_year": m.group(6),
    }


def _compute_alert_id(props: dict[str, Any]) -> str:
    """Compute lifecycle-aware alert ID.

    VTEC-bearing: hash the stable event identity tuple.
    Non-VTEC: hash the alert URL.
    """
    vtec_list = (props.get("parameters") or {}).get("VTEC", [])
    if vtec_list:
        parsed = _parse_vtec(vtec_list[0])
        if parsed:
            # Stable identity: office.phenomena.significance.tracking.year
            key = (
                f"{parsed['vtec_office']}.{parsed['vtec_phenomena']}."
                f"{parsed['vtec_significance']}.{parsed['vtec_tracking']}."
                f"20{parsed['_year']}"
            )
            return hashlib.sha256(key.encode()).hexdigest()[:12]

    # Fallback for non-VTEC alerts
    url = props.get("id", props.get("@id", ""))
    return hashlib.sha256(url.encode()).hexdigest()[:12]


def _extract_zone_codes(uris: list[str]) -> tuple[str, ...]:
    """Extract zone codes from NWS zone URIs."""
    codes = []
    for uri in uris:
        # URI like https://api.weather.gov/zones/county/OHC049
        code = uri.rsplit("/", 1)[-1].upper()
        if code:
            codes.append(code)
    return tuple(codes)


def _parse_feature(feature: dict[str, Any]) -> CAPAlert:
    """Parse a single GeoJSON feature into a CAPAlert."""
    props = feature.get("properties", {})

    # VTEC parsing
    vtec_list = (props.get("parameters") or {}).get("VTEC", [])
    vtec_fields: dict[str, str] = {}
    if vtec_list:
        vtec_fields = _parse_vtec(vtec_list[0])
        vtec_fields.pop("_year", None)

    # Zone URIs and codes
    zone_uris = props.get("affectedZones", [])
    zone_codes = _extract_zone_codes(zone_uris)

    # Geocodes — every scheme the feature publishes; UGC is also read locally
    # below for marine classification.
    geocodes = geocodes_from(props.get("geocode") or {})
    geocode_ugc = tuple(geocodes.get("UGC", ()))

    # Event codes
    event_codes = props.get("eventCode") or {}
    nws_codes = event_codes.get("NationalWeatherService", [])
    same_codes = event_codes.get("SAME", [])

    # Headline fallback
    headline = props.get("headline", "")
    if not headline:
        nws_headlines = (props.get("parameters") or {}).get("NWSheadline", [])
        if nws_headlines:
            headline = nws_headlines[0]

    # Geometry — from feature or parsed from properties
    geometry = feature.get("geometry")

    alert_id = _compute_alert_id(props)

    is_marine = _is_marine_nws(geocode_ugc + zone_codes)

    return CAPAlert(
        id=alert_id,
        url=props.get("id", ""),
        identifier=props.get("id", ""),
        event=props.get("event", ""),
        msg_type=props.get("messageType", ""),
        status=props.get("status", ""),
        scope=props.get("scope", ""),
        category=props.get("category", ""),
        urgency=props.get("urgency", ""),
        severity=props.get("severity", ""),
        certainty=props.get("certainty", ""),
        response_type=props.get("response", ""),
        sent=props.get("sent", ""),
        effective=props.get("effective", ""),
        onset=props.get("onset", ""),
        expires=props.get("expires", ""),
        ends=props.get("ends"),
        headline=headline,
        description=props.get("description", ""),
        instruction=props.get("instruction"),
        note=props.get("note", ""),
        web=props.get("web", ""),
        area_desc=props.get("areaDesc", ""),
        affected_zones=zone_codes,
        affected_zone_uris=tuple(zone_uris),
        geocodes=geocodes,
        geometry=geometry,
        event_code_nws=nws_codes[0] if nws_codes else "",
        event_code_same=same_codes[0] if same_codes else "",
        vtec=tuple(vtec_list),
        vtec_office=vtec_fields.get("vtec_office", ""),
        vtec_phenomena=vtec_fields.get("vtec_phenomena", ""),
        vtec_significance=vtec_fields.get("vtec_significance", ""),
        vtec_action=vtec_fields.get("vtec_action", ""),
        vtec_tracking=vtec_fields.get("vtec_tracking", ""),
        sender=props.get("sender", ""),
        sender_name=props.get("senderName", ""),
        references=tuple(
            ref["identifier"] if isinstance(ref, dict) else str(ref)
            for ref in (props.get("references", []) or [])
        ),
        replaced_by=props.get("replacedBy", "") or "",
        replaced_at=props.get("replacedAt", "") or "",
        parameters=props.get("parameters"),
        provider="nws",
        is_marine=is_marine,
    )


class NWSProvider:
    """NWS GeoJSON API provider."""

    def __init__(self) -> None:
        # Ids eligible for cancellation discovery, mapped to their published
        # ``expires``. The coordinator holds one provider instance for the life
        # of the config entry, so this survives between reconciliations and
        # scopes the cancellation lookup to alerts this entry was actually
        # tracking. An id stays eligible after leaving the active set for as
        # long as its expiry has not passed — the store retains the alert for
        # exactly that window, so a lookup that fails in the cycle an alert
        # vanishes can still discover its cancellation on a later cycle instead
        # of forgetting the id and holding the alert to expiry. Dropping the id
        # once its expiry passes mirrors the store, which has terminated the
        # alert by then: emitting a late cancellation past that point would
        # fire a second, unpaired ``incident_removed``.
        self._tracked: dict[str, str] = {}

    @property
    def name(self) -> str:
        return "nws"

    async def async_validate_config(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        *,
        user_agent: str | None = None,
    ) -> str | None:
        """Check that every configured zone is a zone NWS publishes.

        Only zone mode is checkable: a point query answers for any coordinate
        in or near the US and returns an empty collection rather than an error,
        so there is nothing authoritative to test for GPS or tracker entries.

        One request covers the whole list — ``/zones?id=A,B`` returns a feature
        per zone it knows — and a well-formed zone that simply does not exist
        comes back as an empty collection, which is the case ``_validate_zone``
        cannot catch: ``OHZ999`` matches the pattern and does not exist.
        """
        zones = str(config.get(CONF_ZONE_ID, "") or "").strip()
        if not zones:
            return None
        headers = {"Accept": "application/geo+json"}
        if user_agent:
            headers["User-Agent"] = user_agent
        async with session.get(f"{NWS_ZONES_BASE}?id={zones}", headers=headers) as resp:
            if resp.status != 200:
                # The shape is already guaranteed by ``_validate_zone``, so a
                # non-200 here is the service, not the input.
                return "cannot_connect"
            data = await resp.json()
        published = {
            (feature.get("properties") or {}).get("id")
            for feature in data.get("features", [])
        }
        wanted = [z.strip() for z in zones.split(",") if z.strip()]
        return "unknown_zone" if any(z not in published for z in wanted) else None

    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        options: Mapping[str, Any],
        *,
        cap_content_cache=None,
        user_agent=None,
    ) -> list[CAPAlert]:
        """Fetch active alerts from NWS."""
        url = self._build_url(config)
        if not url:
            return []

        alerts: list[CAPAlert] = []
        follows = 0

        while url and follows <= MAX_PAGINATION_FOLLOWS:
            data = await self._fetch_page(session, url)
            for feature in data.get("features", []):
                alerts.append(_parse_feature(feature))

            # Follow pagination
            pagination = data.get("pagination", {})
            url = pagination.get("next")
            follows += 1

        # Runs after pagination completes, never per page: a product and the
        # re-issue superseding it can land on either side of a page boundary.
        ctx = StageContext(now=datetime.now(timezone.utc))
        for run in _NWS_CONVENTIONS.stages_at("merge"):
            alerts = run(alerts, ctx)

        active_ids = {a.id for a in alerts}
        cancellations = await self._fetch_cancellations(session, config, active_ids)
        cancelled_ids = {c.id for c in cancellations}
        now = datetime.now(timezone.utc)
        tracked = {a.id: a.expires for a in alerts}
        # Carry over absent-but-still-cancellable ids, newest first, so the cap
        # sheds the ones that have gone longest without a cancellation.
        carried = 0
        for alert_id, expires in reversed(self._tracked.items()):
            if alert_id in tracked or alert_id in cancelled_ids:
                continue
            if not _still_cancellable(expires, now):
                continue
            if carried >= _MAX_CANCELLABLE_IDS:
                break
            tracked[alert_id] = expires
            carried += 1
        self._tracked = tracked
        return alerts + cancellations

    async def _fetch_cancellations(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        active_ids: set[str],
    ) -> list[CAPAlert]:
        """Cancellations for alerts this provider returned last time.

        NWS publishes cancellations as first-class products carrying VTEC action
        ``CAN`` and ``messageType=Cancel``, but **never on the active endpoint**:
        measured over a six-hour national window, 101 of 101 cancellations were
        absent from ``/alerts/active``. Polling only that endpoint therefore
        makes a genuine cancellation indistinguishable from a dropped record,
        which is what forces the store's retain-on-absence rule to hold a
        cancelled warning until its published expiry. Fetching them restores the
        explicit signal, so a cancelled alert terminates in the cycle it was
        cancelled rather than at expiry, and does so with a provider-declared
        reason rather than an inference.

        Two filters keep this from manufacturing events. Cancellations are
        emitted only for ids this provider previously returned that are still
        within their published expiry (``_tracked``), because a
        terminal alert the store has never seen fires ``incident_removed`` with
        no matching creation — which is correct for a feed that can deliver an
        already-ended alert, and wrong here, where the window would otherwise
        produce removals for alerts filtered out as marine or issued before this
        entry existed. And an id still in the active set is skipped: NWS can
        cancel a warning over part of its area while it runs on elsewhere (1 of
        174 terminal products in the sample), and there the active record is the
        truthful one.

        A failure here is not a poll failure. Losing the confirmation means an
        alert lingers to its expiry, which is the behavior without this fetch at
        all, so the error is swallowed rather than failing an otherwise good
        update. The id stays eligible (see ``_tracked``), so the next cycle's
        lookup retries the discovery rather than forgetting the alert.
        """
        previously_tracked = self._tracked
        if not previously_tracked:
            return []
        scope = self._build_scope(config)
        if not scope:
            return []

        since = (datetime.now(timezone.utc) - CANCEL_LOOKBACK).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )
        url = f"{NWS_ALL_BASE}?message_type=cancel&{scope}&start={since}"
        try:
            data = await self._fetch_page(session, url)
        except (UpdateFailed, aiohttp.ClientError, TimeoutError) as err:
            _LOGGER.debug("nws: cancellation lookup failed, retaining alerts: %s", err)
            return []

        out: list[CAPAlert] = []
        for feature in data.get("features", []):
            alert = _parse_feature(feature)
            if alert.id in previously_tracked and alert.id not in active_ids:
                out.append(alert)
        return out

    def _build_url(self, config: Mapping[str, Any]) -> str:
        """Build the NWS active-alerts URL from config."""
        scope = self._build_scope(config)
        return f"{NWS_API_BASE}?{scope}" if scope else ""

    def _build_scope(self, config: Mapping[str, Any]) -> str:
        """The location query fragment, shared by the active and cancel URLs."""
        if CONF_ZONE_ID in config and config[CONF_ZONE_ID]:
            zone_id = config[CONF_ZONE_ID]
            return f"zone={zone_id}"

        if CONF_GPS_LOC in config and config[CONF_GPS_LOC]:
            gps = config[CONF_GPS_LOC]
            # Round to 4 decimal places for CDN cache hits
            try:
                parts = gps.split(",")
                lat = round(float(parts[0].strip()), 4)
                lon = round(float(parts[1].strip()), 4)
                return f"point={lat},{lon}"
            except (ValueError, IndexError):
                return ""

        return ""

    async def _fetch_page(
        self, session: aiohttp.ClientSession, url: str
    ) -> dict[str, Any]:
        """Fetch a single page from NWS API."""
        headers = {"Accept": "application/geo+json"}
        async with session.get(url, headers=headers) as resp:
            if resp.status != 200:
                raise UpdateFailed(f"NWS API returned {resp.status} for {url}")
            data = await resp.json()

        # NWS sometimes returns error objects with 200 status
        if data.get("type") != "FeatureCollection":
            problem_type = data.get("type", "unknown")
            detail = data.get("detail", "")
            raise UpdateFailed(f"NWS API returned {problem_type}: {detail}")

        return data
