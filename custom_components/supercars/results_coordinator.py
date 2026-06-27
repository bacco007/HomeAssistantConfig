"""Supercars results coordinator.

Strategy (Options B + C):

  - Option C (live sessions): If `NatsoftCoordinator` reports an active
    session, use its live timing data as the current results. No web
    request needed; this is real-time.
  - Option B (idle): Try speculative API endpoints, then a Next.js RSC
    fetch (`RSC: 1`) against the results page, then HTML scraping of every
    embedded JSON blob (`__NEXT_DATA__`, window state, App Router
    `self.__next_f.push(...)` flight chunks).
  - Stale fallback: If all remote sources fail, serve the last successful
    parse. No hard-coded dummy data.
"""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any, TYPE_CHECKING

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN
from .spa_extract import (
    fetch_rsc,
    iter_html_json_blobs,
    iter_rsc_chunks,
    search_json,
)

if TYPE_CHECKING:
    from .coordinator import NatsoftCoordinator

_LOGGER = logging.getLogger(__name__)

RESULTS_PAGE_URL = "https://www.supercars.com/results"
RESULTS_SCAN_INTERVAL_IDLE = 3600  # 1 hour outside sessions
RESULTS_SCAN_INTERVAL_LIVE = 60    # 1 minute during sessions

_API_CANDIDATES = (
    "https://www.supercars.com/wp-json/supercars/v1/results",
    "https://www.supercars.com/wp-json/supercars/v1/race-results",
    "https://www.supercars.com/api/results",
    "https://www.supercars.com/api/race/results",
)

_EMPTY: dict[str, Any] = {"finishers": [], "source": "unavailable", "session": None}


# ── Option C — Natsoft live feed ──────────────────────────────────────────────

def _natsoft_to_results(natsoft_data: dict[str, Any]) -> dict[str, Any]:
    finishers: list[dict] = []
    for comp in natsoft_data.get("top_10", []):
        position = comp.get("position")
        gap_raw = comp.get("gap") or ""
        gap = gap_raw if gap_raw else ("Leader" if position == 1 else "")
        finishers.append({
            "position": position,
            "driver":   comp.get("driver") or "Unknown",
            "car":      comp.get("car_number") or "",
            "team":     comp.get("team") or "",
            "gap":      gap,
            "best_lap": comp.get("best_lap") or "",
        })

    return {
        "finishers": finishers,
        "source":    "natsoft_live",
        "session":   natsoft_data.get("session_name"),
        "round":     natsoft_data.get("round_name"),
        "live":      True,
    }


# ── Option B — JSON shape detection ──────────────────────────────────────────

_DRIVER_NAME_KEYS = ("driver", "driverName", "fullName", "name", "firstName")
_POSITION_KEYS    = ("position", "pos", "finishing_position", "finishingPosition")


def _is_finisher_row(row: Any) -> bool:
    if not isinstance(row, dict):
        return False
    return (
        any(k in row for k in _POSITION_KEYS)
        and any(k in row for k in _DRIVER_NAME_KEYS)
    )


def _match_results(node: Any) -> list[dict] | None:
    if not isinstance(node, list) or len(node) < 3:
        return None
    if all(_is_finisher_row(r) for r in node):
        return node
    return None


def _normalise_finisher(raw: dict, fallback_pos: int) -> dict:
    name = (
        raw.get("driver")
        or raw.get("driverName")
        or raw.get("fullName")
        or f"{raw.get('firstName', '')} {raw.get('lastName', '')}".strip()
        or raw.get("name")
        or "Unknown"
    )
    pos = (
        raw.get("position")
        or raw.get("pos")
        or raw.get("finishing_position")
        or raw.get("finishingPosition")
        or fallback_pos
    )
    return {
        "position": pos,
        "driver":   name,
        "car":      str(raw.get("car") or raw.get("carNumber") or raw.get("number") or ""),
        "team":     raw.get("team") or raw.get("teamName") or "",
        "gap":      raw.get("gap") or raw.get("timeBehind") or ("Winner" if pos == 1 else ""),
        "best_lap": raw.get("bestLap") or raw.get("best_lap") or "",
    }


def _parse_blob(data: Any) -> list[dict] | None:
    found = search_json(data, _match_results)
    if not found:
        return None
    return [_normalise_finisher(r, i + 1) for i, r in enumerate(found)]


# ── Coordinator ───────────────────────────────────────────────────────────────

class ResultsCoordinator(DataUpdateCoordinator):
    """Provides latest race results, preferring Natsoft live timing."""

    def __init__(self, hass: HomeAssistant, natsoft_coordinator: "NatsoftCoordinator") -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_results",
            update_interval=timedelta(seconds=RESULTS_SCAN_INTERVAL_IDLE),
        )
        self._natsoft = natsoft_coordinator
        self._session: aiohttp.ClientSession | None = None
        self._stale: dict[str, Any] | None = None

    def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                headers={"User-Agent": "Mozilla/5.0 (HomeAssistant Supercars Integration)"}
            )
        return self._session

    def _set_interval(self, seconds: int) -> None:
        if self.update_interval != timedelta(seconds=seconds):
            self.update_interval = timedelta(seconds=seconds)

    async def _try_api_endpoints(self) -> list[dict] | None:
        session = self._get_session()
        for url in _API_CANDIDATES:
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status != 200:
                        continue
                    content_type = resp.headers.get("Content-Type", "")
                    if "json" not in content_type and "javascript" not in content_type:
                        continue
                    parsed = _parse_blob(await resp.json(content_type=None))
                    if parsed:
                        _LOGGER.info("Results fetched from API: %s", url)
                        return parsed
            except Exception as err:  # pylint: disable=broad-except
                _LOGGER.debug("Results API candidate %s failed: %s", url, err)
        return None

    async def _try_rsc(self) -> list[dict] | None:
        payload = await fetch_rsc(self._get_session(), RESULTS_PAGE_URL)
        if not payload:
            return None
        for blob in iter_rsc_chunks(payload):
            parsed = _parse_blob(blob)
            if parsed:
                _LOGGER.info("Results extracted from RSC payload")
                return parsed
        return None

    async def _try_page_scrape(self) -> list[dict] | None:
        session = self._get_session()
        try:
            async with session.get(
                RESULTS_PAGE_URL, timeout=aiohttp.ClientTimeout(total=15)
            ) as resp:
                resp.raise_for_status()
                html = await resp.text()
        except Exception as err:  # pylint: disable=broad-except
            _LOGGER.warning("Results page fetch failed: %s", err)
            return None

        for blob in iter_html_json_blobs(html):
            parsed = _parse_blob(blob)
            if parsed:
                _LOGGER.info("Results extracted from page HTML")
                return parsed
        return None

    async def _async_update_data(self) -> dict[str, Any]:
        natsoft_data = self._natsoft.data or {}

        # Option C — live session, no web request needed
        if natsoft_data.get("session_active"):
            _LOGGER.debug("Active session; using Natsoft live timing")
            self._set_interval(RESULTS_SCAN_INTERVAL_LIVE)
            return _natsoft_to_results(natsoft_data)

        self._set_interval(RESULTS_SCAN_INTERVAL_IDLE)

        # Option B — exhaust remote strategies in priority order
        for attempt in (self._try_api_endpoints, self._try_rsc, self._try_page_scrape):
            finishers = await attempt()
            if finishers:
                result = {
                    "finishers": finishers,
                    "source":    "supercars.com",
                    "live":      False,
                    "session":   None,
                }
                self._stale = result
                return result

        if self._stale:
            _LOGGER.warning("Results unavailable; serving stale data")
            return {**self._stale, "source": "stale"}

        _LOGGER.warning("Results unavailable and no stale data")
        return _EMPTY
