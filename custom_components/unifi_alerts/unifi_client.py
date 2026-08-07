"""Async HTTP client for the UniFi Network controller."""

from __future__ import annotations

import json
import logging
from datetime import UTC, datetime, timedelta
from typing import Any

import aiohttp

from .const import (
    CONF_VERIFY_SSL,
    DEFAULT_SYSTEM_LOG_LOOKBACK_HOURS,
    DEFAULT_VERIFY_SSL,
    MAX_SYSTEM_LOG_PAGES,
    SYSTEM_LOG_PAGE_SIZE,
    classify_event_key,
)
from .models import UniFiAlert, UniFiClientConfig
from .unifi_auth import (
    CannotConnectError,
    InvalidAuthError,
    SslCertificateError,
    UniFiAuth,
)

_LOGGER = logging.getLogger(__name__)

# UniFi OS consoles (UDM, UCG, etc.) prefix all network API paths
UNIFI_OS_NETWORK_PREFIX = "/proxy/network"


class InvalidSiteError(CannotConnectError):
    """Raised when the site name does not exist on the controller."""


class UniFiClient:
    """Minimal, stateless async client for fetching alarms from a UniFi controller.

    Authenticates with an API key (X-API-Key header). API keys are stateless,
    so there is no session bootstrap, cookie, or logout to manage. The client
    itself holds no state across calls beyond its own connection config and
    the per-site alarm-URL cache (a fixed discovery result, not mutable
    retry/backoff state) — anything that needs to persist or accumulate
    across poll cycles (e.g. system-log-probe backoff) lives on
    UniFiAlertsCoordinator, which is the layer designed to hold that kind of
    state (#240).

    Requires UniFi OS (UDM, UDM-Pro, UDM-SE, UCG-Ultra, UCG-Max, Cloud Key Gen2+)
    running Network Application 8.x+ (for API key support). Classic self-hosted
    Network Application controllers are not supported.

    Auth concerns are composed via a UniFiAuth instance (self._auth).
    """

    def __init__(
        self,
        session: aiohttp.ClientSession,
        controller_url: str,
        config: UniFiClientConfig,
    ) -> None:
        self._session = session
        self._base = controller_url.rstrip("/")
        self._config: UniFiClientConfig = config
        self._auth = UniFiAuth(session, self._base, config)
        # Keys seen during the most recent categorise_alarms() call that could not
        # be matched to any category. Reset each call; callers accumulate as needed.
        self._unrecognised_keys: dict[str, int] = {}
        # Confirmed-working alarm endpoint URL per site, populated by
        # _discover_alarm_url() the first time fetch_alarms() is called for a
        # site. Cleared if the cached URL later stops resolving (e.g. a
        # firmware upgrade removes/moves the path) so discovery runs again.
        self._alarm_url_cache: dict[str, str] = {}

    # ── Public interface ──────────────────────────────────────────────────

    async def authenticate(self) -> None:
        """Verify the configured API key against the UniFi OS controller.

        Delegates entirely to UniFiAuth; see its docstring for what "verify"
        means for API-key auth.
        """
        await self._auth.authenticate()

    async def fetch_alarms(self, site: str = "default") -> list[dict[str, Any]]:
        """Return all unarchived alarms from the controller.

        The API key is a stateless header (see UniFiAuth), so there is no
        session to bootstrap here; the key is verified once at setup. Uses
        the cached endpoint URL for `site` once one has been discovered, so
        steady-state polling is a single request with no path-fallback
        iteration or HTTP 400 body parsing (see #239). Discovery only runs on
        the first call for a site, or again later if the cached URL stops
        resolving (e.g. a firmware upgrade moves the endpoint).
        """
        cached_url = self._alarm_url_cache.get(site)
        if cached_url is not None:
            result = await self._try_fetch_alarms(cached_url, site)
            if result is not None:
                return result
            _LOGGER.debug(
                "Cached alarm URL %s no longer resolves for site %s — rediscovering",
                cached_url,
                site,
            )
            del self._alarm_url_cache[site]

        return await self._discover_alarm_url(site)

    async def _discover_alarm_url(self, site: str) -> list[dict[str, Any]]:
        """Probe candidate alarm endpoint paths and cache the first one that resolves.

        Different firmware versions expose the alarm endpoint at different paths.
        Try the newest path first so modern firmware succeeds in one call; fall
        back to older variants for backwards compatibility. Order matters —
        update docs/UNIFI.md § "Alarm API endpoint" if you change this list.

          /list/alarm  — newest (UniFi Network 9.x+)
          /alarm       — long-standing universal path
          /stat/alarm  — older intermediate variant; some firmware exposes only this
        """
        alarm_paths = [
            f"{self._base}{UNIFI_OS_NETWORK_PREFIX}/api/s/{site}/list/alarm",
            f"{self._base}{UNIFI_OS_NETWORK_PREFIX}/api/s/{site}/alarm",
            f"{self._base}{UNIFI_OS_NETWORK_PREFIX}/api/s/{site}/stat/alarm",
        ]
        for path in alarm_paths:
            result = await self._try_fetch_alarms(path, site)
            if result is not None:
                self._alarm_url_cache[site] = path
                return result
            # None means path not found (404 or api.err.InvalidObject) — try next
        raise InvalidSiteError(
            f"Site '{site}' not found on the controller. Tried: {', '.join(alarm_paths)}"
        )

    async def _try_fetch_alarms(self, url: str, site: str) -> list[dict[str, Any]] | None:
        """Fetch alarms from one URL. Returns None if this path doesn't exist here.

        "Doesn't exist" covers both a plain 404 and the HTTP 400 +
        api.err.InvalidObject some firmware returns instead of a 404 — see
        _is_missing_alarm_path(). Any other error is a genuine failure and is
        raised to the caller.
        """
        _LOGGER.debug("Fetching alarms from %s", url)
        try:
            async with self._session.get(
                url,
                headers=self._auth.headers(),
                ssl=self._config.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL),
                timeout=aiohttp.ClientTimeout(total=10),
                allow_redirects=False,
            ) as resp:
                if 300 <= resp.status < 400:
                    raise CannotConnectError(
                        f"Controller issued a redirect (HTTP {resp.status}) on an authenticated "
                        "request; refusing to follow to protect credentials"
                    )
                if resp.status == 401:
                    raise InvalidAuthError("API key rejected (HTTP 401)")
                if resp.status == 404:
                    _LOGGER.debug("Alarm URL %s returned 404 — trying next URL", url)
                    return None
                if resp.status == 400:
                    unifi_msg = await self._parse_unifi_error_msg(resp, url)
                    if self._is_missing_alarm_path(unifi_msg):
                        _LOGGER.debug(
                            "Alarm URL %s returned 400 api.err.InvalidObject — trying next URL",
                            url,
                        )
                        return None
                    detail = f" ({unifi_msg})" if unifi_msg else ""
                    raise CannotConnectError(
                        f"Alarm endpoint rejected the request (HTTP 400{detail}). "
                        f"Check that the site name '{site}' exists on the controller."
                    )
                resp.raise_for_status()
                data = await resp.json()
                if data.get("meta", {}).get("rc") != "ok":
                    msg = data.get("meta", {}).get("msg", "unknown error")
                    raise CannotConnectError(f"UniFi API error: {msg}")
                return [a for a in data.get("data", []) if not a.get("archived", False)]
        except aiohttp.ClientConnectorCertificateError as err:
            raise SslCertificateError(type(err).__name__) from err
        except aiohttp.ClientResponseError as err:
            # Include HTTP status so users (and logs) can tell a 404 from a 500.
            # Status-only — no URL — to avoid leaking creds that may be embedded in a URL.
            raise CannotConnectError(f"{type(err).__name__} {err.status}") from err
        except aiohttp.ClientError as err:
            raise CannotConnectError(type(err).__name__) from err

    @staticmethod
    async def _parse_unifi_error_msg(resp: aiohttp.ClientResponse, url: str) -> str:
        """Best-effort extraction of the `meta.msg` field from a UniFi error body.

        UniFi returns JSON even on error responses. Isolated from the fetch
        loop so the endpoint-discovery heuristic in _is_missing_alarm_path()
        can be tested independently of the HTTP body-parsing mechanics.
        """
        try:
            body = await resp.json(content_type=None)
            return str(body.get("meta", {}).get("msg", ""))
        except (json.JSONDecodeError, UnicodeDecodeError) as err:
            _LOGGER.debug(
                "Could not parse 400 response body from %s: %s",
                url,
                type(err).__name__,
            )
            return ""

    @staticmethod
    def _is_missing_alarm_path(unifi_msg: str) -> bool:
        """Decide whether a UniFi error message means "this endpoint path doesn't exist".

        Some firmware returns HTTP 400 + api.err.InvalidObject for alarm paths
        that don't exist on that firmware version, instead of a plain 404.
        This heuristic is kept separate from the core fetch/parse flow in
        _try_fetch_alarms so it can change (or be dropped, per #239's "legacy
        controller support" scope) without touching data-retrieval code.
        """
        return unifi_msg == "api.err.InvalidObject"

    async def probe_system_log_endpoint(self, site: str = "default") -> bool | None:
        """Probe the v2 system-log endpoint once, with no caching or retry state.

        Calls POST /proxy/network/v2/api/site/{site}/system-log/count with an
        empty body. Returns True on HTTP 200 (endpoint available), False on
        HTTP 404 (the controller's definitive "endpoint not implemented"
        response), or None for any other outcome (unexpected status or
        network error) — the caller should treat None as transient and retry
        on the next poll.

        This is a single stateless HTTP call; caching the result across poll
        cycles and backing off after repeated transient failures is the
        coordinator's concern (see UniFiAlertsCoordinator._probe_has_system_log).
        """
        url = f"{self._base}{UNIFI_OS_NETWORK_PREFIX}/v2/api/site/{site}/system-log/count"
        _LOGGER.debug("Probing v2 system-log endpoint: %s", url)
        try:
            async with self._session.post(
                url,
                json={},
                headers=self._auth.headers(),
                ssl=self._config.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL),
                timeout=aiohttp.ClientTimeout(total=10),
                allow_redirects=False,
            ) as resp:
                if resp.status == 200:
                    _LOGGER.debug("v2 system-log endpoint available")
                    return True
                if resp.status == 404:
                    _LOGGER.debug(
                        "v2 system-log endpoint not implemented (HTTP 404); using legacy path"
                    )
                    return False
                _LOGGER.debug(
                    "v2 system-log probe got HTTP %d (transient); legacy path this poll",
                    resp.status,
                )
                return None
        except aiohttp.ClientError as err:
            _LOGGER.debug(
                "v2 system-log probe failed with %s (transient); legacy path this poll",
                type(err).__name__,
            )
            return None

    async def fetch_system_log_alarms(
        self,
        site: str = "default",
        since: datetime | None = None,
    ) -> list[dict[str, Any]]:
        """Fetch alarms from the v2 system-log/all endpoint with pagination.

        Uses timestampFrom = since (or now - DEFAULT_SYSTEM_LOG_LOOKBACK_HOURS
        when not specified) and paginates through results up to
        MAX_SYSTEM_LOG_PAGES pages. Returns the raw alarm dicts as-is for the
        caller to parse with UniFiAlert.from_system_log_event().

        Only events with status="NEW" are returned (equivalent to the legacy
        archived=False filter). Events with any other status are skipped.
        """
        now = datetime.now(UTC)
        if since is not None:
            from_dt = since
        else:
            from_dt = now - timedelta(hours=DEFAULT_SYSTEM_LOG_LOOKBACK_HOURS)

        timestamp_from = int(from_dt.timestamp() * 1000)
        timestamp_to = int(now.timestamp() * 1000)

        url = f"{self._base}{UNIFI_OS_NETWORK_PREFIX}/v2/api/site/{site}/system-log/all"
        results: list[dict[str, Any]] = []

        for page in range(MAX_SYSTEM_LOG_PAGES):
            body = {
                "timestampFrom": timestamp_from,
                "timestampTo": timestamp_to,
                "pageNumber": page,
                "pageSize": SYSTEM_LOG_PAGE_SIZE,
            }
            _LOGGER.debug(
                "Fetching v2 system-log page %d from %s",
                page,
                url,
            )
            try:
                async with self._session.post(
                    url,
                    json=body,
                    headers=self._auth.headers(),
                    ssl=self._config.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL),
                    timeout=aiohttp.ClientTimeout(total=15),
                    allow_redirects=False,
                ) as resp:
                    if 300 <= resp.status < 400:
                        raise CannotConnectError(
                            f"Controller issued a redirect (HTTP {resp.status}) on an authenticated "
                            "request; refusing to follow to protect credentials"
                        )
                    if resp.status == 401:
                        raise InvalidAuthError(
                            "API key rejected during system-log fetch (HTTP 401)"
                        )
                    resp.raise_for_status()
                    data = await resp.json()
            except aiohttp.ClientConnectorCertificateError as err:
                raise SslCertificateError(type(err).__name__) from err
            except aiohttp.ClientResponseError as err:
                raise CannotConnectError(f"{type(err).__name__} {err.status}") from err
            except aiohttp.ClientError as err:
                raise CannotConnectError(type(err).__name__) from err

            page_data: list[dict[str, Any]] = data.get("data") or []
            # Filter to open/unacknowledged events only (status="NEW")
            new_events = [e for e in page_data if e.get("status") == "NEW"]
            results.extend(new_events)

            total_pages: int = data.get("total_page_count", 1)
            _LOGGER.debug(
                "v2 system-log page %d: %d total events, %d NEW, %d/%d pages",
                page,
                len(page_data),
                len(new_events),
                page + 1,
                total_pages,
            )
            if page + 1 >= total_pages or not page_data:
                break
        else:
            # for-loop exhausted range(MAX_SYSTEM_LOG_PAGES) without breaking:
            # the page cap was reached before all events were fetched.
            _LOGGER.warning(
                "v2 system-log page cap reached (%d pages / %d events); "
                "some recent alarms may have been missed. "
                "Clear categories more frequently or reduce the polling window.",
                MAX_SYSTEM_LOG_PAGES,
                len(results),
            )

        return results

    @property
    def unrecognised_keys(self) -> dict[str, int]:
        """Keys seen in the most recent categorise_alarms() call with no category mapping."""
        return self._unrecognised_keys

    async def categorise_alarms(self, site: str = "default") -> dict[str, list[UniFiAlert]]:
        """Fetch alarms and group them by category."""
        raw = await self.fetch_alarms(site)
        self._unrecognised_keys = {}
        result: dict[str, list[UniFiAlert]] = {}
        for alarm in raw:
            category = self._classify(alarm)
            if category is None:
                key = alarm.get("key", "")
                if key:
                    self._unrecognised_keys[key] = self._unrecognised_keys.get(key, 0) + 1
                continue
            alert = UniFiAlert.from_api_alarm(category, alarm)
            result.setdefault(category, []).append(alert)
        return result

    async def close(self) -> None:
        """Release client resources.

        API-key auth is stateless (no session to log out) and the aiohttp
        session is owned by Home Assistant, so there is nothing to tear down.
        Kept as an awaitable no-op so call sites (setup teardown, unload) need
        no special-casing.
        """

    # ── Private helpers ───────────────────────────────────────────────────

    @staticmethod
    def _classify(alarm: dict[str, Any]) -> str | None:
        """Map a raw alarm dict to a category string, or None if unrecognised."""
        key = alarm.get("key", "")
        category = classify_event_key(key)
        if not category and key:
            _LOGGER.debug(
                "Unclassified UniFi event key %r — consider reporting it at "
                "https://github.com/PHeonix25/unifi_alerts/issues",
                key,
            )
        return category or None
