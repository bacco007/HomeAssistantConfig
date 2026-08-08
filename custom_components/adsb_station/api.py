"""Client for the local ADS-B receiver and, when present, fr24feed."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiohttp

from .const import (
    AIRCRAFT_URL_CANDIDATES,
    DEFAULT_HTTP_PORT,
    FEATURE_AIRCRAFT_TYPES,
    FEATURE_FREQUENCY_ERROR,
    FEATURE_GAIN,
    FEATURE_POSITIONS,
    FEEDERS,
    RECEIVER_FILENAME,
    STATS_FILENAME,
)

# Periods that dump1090 reports in stats.json. Their presence tells us the
# document really is a statistics file.
STATS_MARKER_KEYS = frozenset({"last1min", "last5min", "total"})

_LOGGER = logging.getLogger(__name__)

TIMEOUT = 10
# Probing runs against many candidates at once, so a stuck one should not hold
# up the config flow for the full timeout.
DETECT_TIMEOUT = 4


class AdsbStationError(Exception):
    """Generic error while talking to the feeder."""


class AdsbStationConnectionError(AdsbStationError):
    """The endpoint could not be reached."""


class AdsbStationInvalidResponseError(AdsbStationError):
    """The endpoint answered, but not with the data we expect."""


def build_feeder_url(host: str, port: int, feeder_type: str) -> str:
    """Return the status URL of one kind of feeder."""
    return f"http://{host}:{port}{FEEDERS[feeder_type].path}"


def sibling_url(url: str, filename: str) -> str:
    """Return the URL of a file in the same directory as another one."""
    return f"{url.rsplit('/', 1)[0]}/{filename}"


def web_root(aircraft_url: str) -> str:
    """Return the page a human would open for this receiver.

    Every layout we know serves aircraft.json from a "data" directory below the
    web interface, so /tar1090/data/aircraft.json belongs to /tar1090/. A URL
    that does not follow that shape falls back to the root of the server.
    """
    base, separator, _ = aircraft_url.partition("/data/")
    if not separator:
        scheme, _, remainder = aircraft_url.partition("://")
        return f"{scheme}://{remainder.split('/', 1)[0]}/"
    return f"{base}/"


async def async_fetch_json(
    session: aiohttp.ClientSession, url: str, timeout: int = TIMEOUT
) -> Any:
    """Fetch and decode a JSON document."""
    try:
        async with asyncio.timeout(timeout):
            response = await session.get(url)
            _LOGGER.debug("GET %s returned HTTP %s", url, response.status)
            response.raise_for_status()
            # dump1090 builds serve aircraft.json as text/plain, so do not let
            # aiohttp reject the payload on its content type.
            return await response.json(content_type=None)
    except TimeoutError as err:
        raise AdsbStationConnectionError(f"Timeout connecting to {url}") from err
    except aiohttp.ClientError as err:
        raise AdsbStationConnectionError(f"Error connecting to {url}: {err}") from err
    except ValueError as err:
        raise AdsbStationInvalidResponseError(
            f"{url} did not return JSON: {err}"
        ) from err


def build_candidate_urls(host: str) -> list[str]:
    """Return the aircraft.json URLs to probe, in the order we prefer them."""
    # Port 80 is left out of the URL. It is the default for http, so writing it
    # produces an address that is equal to the bare one for a reader but not
    # for a URL library, and it is not what anyone would type by hand.
    return [
        f"http://{host}{path}"
        if port == DEFAULT_HTTP_PORT
        else f"http://{host}:{port}{path}"
        for port, path in AIRCRAFT_URL_CANDIDATES
    ]


async def _async_is_aircraft_json(session: aiohttp.ClientSession, url: str) -> bool:
    """Return True if this URL serves an aircraft.json."""
    try:
        data = await async_fetch_json(session, url, timeout=DETECT_TIMEOUT)
    except AdsbStationError:
        return False
    return isinstance(data, dict) and "aircraft" in data


async def async_detect_aircraft_url(
    session: aiohttp.ClientSession, host: str
) -> str | None:
    """Look for aircraft.json in the usual places and return the best match.

    The candidates span two ports, so they are probed at the same time; walking
    them one by one would leave someone with a firewalled port waiting through
    a timeout for every single one.
    """
    urls = build_candidate_urls(host)
    found = await asyncio.gather(
        *(_async_is_aircraft_json(session, url) for url in urls)
    )

    # Report the first hit in candidate order, not the first to answer.
    for url, is_match in zip(urls, found, strict=True):
        if is_match:
            _LOGGER.debug("Detected aircraft.json at %s", url)
            return url

    _LOGGER.debug("No aircraft.json found on %s", host)
    return None


async def async_detect_statistics(
    session: aiohttp.ClientSession, aircraft_url: str
) -> tuple[str | None, list[str]]:
    """Look for the stats.json next to an aircraft.json.

    Returns its URL and the optional features it was found to report, so the
    entities for those can be created only where they can have a value.
    """
    url = sibling_url(aircraft_url, STATS_FILENAME)
    try:
        data = await async_fetch_json(session, url)
    except AdsbStationError as err:
        _LOGGER.debug("No statistics at %s: %s", url, err)
        return None, []
    if not isinstance(data, dict) or not STATS_MARKER_KEYS & data.keys():
        _LOGGER.debug("%s does not look like a dump1090 stats.json", url)
        return None, []

    features = stats_features(data)
    _LOGGER.debug("Detected stats.json at %s, reporting %s", url, features or "nothing")
    return url, features


def stats_features(data: dict[str, Any]) -> list[str]:
    """Return the optional things this stats.json was found to report."""
    features: list[str] = []
    if stats_report_gain(data):
        features.append(FEATURE_GAIN)
    if isinstance(data.get("aircraft_count_by_type"), dict):
        features.append(FEATURE_AIRCRAFT_TYPES)
    if data.get("estimated_ppm") is not None:
        features.append(FEATURE_FREQUENCY_ERROR)
    if any(_window_counts_positions(window) for window in data.values()):
        features.append(FEATURE_POSITIONS)
    return features


def _window_counts_positions(window: Any) -> bool:
    """Return True if a stats.json window keeps track of positions."""
    if not isinstance(window, dict):
        return False
    return "position_count_total" in window or isinstance(window.get("cpr"), dict)


def stats_report_gain(data: dict[str, Any]) -> bool:
    """Return True if this stats.json carries gain figures.

    The dump1090 fork that fr24feed ships reports none, so its users would
    otherwise get a gain sensor that can never have a value.
    """
    if _as_gain(data.get("gain_db")) is not None:
        return True
    return any(
        isinstance(window, dict) and read_gain(window) is not None
        for window in data.values()
    )


def _as_gain(value: Any) -> float | None:
    """Parse a gain figure, which is a number of decibels or nothing."""
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        _LOGGER.debug("Could not parse gain %r", value)
        return None


def read_gain(
    window: dict[str, Any], document: dict[str, Any] | None = None
) -> float | None:
    """Return the gain the dongle is running at, in dB.

    The two decoder families disagree on where it lives. dump1090-fa reports it
    per window under "local", or under "adaptive" when adaptive gain is running
    and that is the value actually in use. readsb puts a single "gain_db" at the
    root of the document instead, which is the more honest place: the gain
    belongs to the dongle, not to a measurement window.
    """
    for section in ("adaptive", "local"):
        block = window.get(section)
        if (
            isinstance(block, dict)
            and (gain := _as_gain(block.get("gain_db"))) is not None
        ):
            return gain
    if document is not None:
        return _as_gain(document.get("gain_db"))
    return None


class AdsbStationClient:
    """Reads the local endpoints of an ADS-B station.

    The fr24feed status page is optional: a station that only runs a decoder,
    or that feeds a network other than Flightradar24, has no port to read it on.
    """

    def __init__(
        self,
        session: aiohttp.ClientSession,
        host: str,
        port: int | None = None,
        aircraft_url: str | None = None,
        stats_url: str | None = None,
        feeder_type: str | None = None,
    ) -> None:
        """Initialize the client."""
        self._session = session
        self.host = host
        self.port = port
        self.aircraft_url = aircraft_url
        self.stats_url = stats_url
        self.feeder_type = feeder_type

    @property
    def has_feeder(self) -> bool:
        """Return True when this station uploads through a feeder we can read."""
        return self.port is not None and self.feeder_type is not None

    @property
    def feeder_url(self) -> str | None:
        """Return the feeder's status URL, if there is a feeder to read."""
        if self.port is None or self.feeder_type is None:
            return None
        return build_feeder_url(self.host, self.port, self.feeder_type)

    async def async_get_feeder(self) -> dict[str, Any]:
        """Fetch the status document of the feeder this entry was set up for."""
        if (url := self.feeder_url) is None or self.feeder_type is None:
            raise AdsbStationInvalidResponseError("No feeder configured")
        data = await async_fetch_json(self._session, url)
        if not isinstance(data, dict):
            raise AdsbStationInvalidResponseError(
                f"Unexpected feeder status response: {data!r}"
            )
        kind = FEEDERS[self.feeder_type]
        if not kind.markers & data.keys():
            raise AdsbStationInvalidResponseError(
                f"{url} does not look like a {kind.model} status page"
            )
        return data

    async def async_get_aircraft(self) -> dict[str, Any]:
        """Fetch aircraft.json from the dump1090 web server."""
        if not self.aircraft_url:
            raise AdsbStationInvalidResponseError("No aircraft.json URL configured")
        data = await async_fetch_json(self._session, self.aircraft_url)
        if not isinstance(data, dict) or not isinstance(data.get("aircraft"), list):
            raise AdsbStationInvalidResponseError(
                f"Unexpected aircraft.json response: {data!r}"
            )
        return data

    async def async_get_stats(self) -> dict[str, Any]:
        """Fetch stats.json from the dump1090 web server."""
        if not self.stats_url:
            raise AdsbStationInvalidResponseError("No stats.json URL configured")
        data = await async_fetch_json(self._session, self.stats_url)
        if not isinstance(data, dict) or not STATS_MARKER_KEYS & data.keys():
            raise AdsbStationInvalidResponseError(
                f"Unexpected stats.json response: {data!r}"
            )
        return data

    async def async_get_receiver(self) -> dict[str, Any]:
        """Fetch receiver.json, which holds the position of the antenna."""
        if not self.aircraft_url:
            raise AdsbStationInvalidResponseError("No receiver.json URL configured")
        url = sibling_url(self.aircraft_url, RECEIVER_FILENAME)
        data = await async_fetch_json(self._session, url)
        if not isinstance(data, dict):
            raise AdsbStationInvalidResponseError(
                f"Unexpected receiver.json response: {data!r}"
            )
        return data
