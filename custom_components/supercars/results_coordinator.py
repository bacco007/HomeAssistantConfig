"""Supercars results coordinator.

Strategy (Options B + C):
  - Option C (primary during live session): If NatsoftCoordinator reports an
    active session, use its live timing data as the current results. This is
    real-time and requires no web requests.
  - Option B (primary when no session): Fetch supercars.com/results and
    extract JSON embedded by the SPA (Next.js, Redux, etc.). Falls back to
    trying known REST API endpoints.
  - Stale fallback: If all remote sources fail, serve the last successfully
    parsed results. No hard-coded dummy data.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import timedelta
from typing import Any, TYPE_CHECKING

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN

if TYPE_CHECKING:
    from .coordinator import NatsoftCoordinator

_LOGGER = logging.getLogger(__name__)

RESULTS_PAGE_URL = "https://www.supercars.com/results"
RESULTS_SCAN_INTERVAL = 3600  # 1 hour; switches to 60 s during active sessions

_API_CANDIDATES = [
    "https://www.supercars.com/wp-json/supercars/v1/results",
    "https://www.supercars.com/wp-json/supercars/v1/race-results",
    "https://www.supercars.com/api/results",
    "https://www.supercars.com/api/race/results",
]

_EMPTY: dict[str, Any] = {"finishers": [], "source": "unavailable", "session": None}


# ── Option C — Natsoft live feed ──────────────────────────────────────────────

def _natsoft_to_results(natsoft_data: dict[str, Any]) -> dict[str, Any]:
    """Convert live Natsoft timing data into the results format."""
    finishers = []
    for comp in natsoft_data.get("top_10", []):
        finishers.append({
            "position": comp.get("position"),
            "driver":   comp.get("driver") or "Unknown",
            "car":      comp.get("car_number") or "",
            "team":     comp.get("team") or "",
            "gap":      comp.get("gap") or "Leader" if comp.get("position") == 1 else comp.get("gap") or "",
            "best_lap": comp.get("best_lap") or "",
        })

    return {
        "finishers": finishers,
        "source":    "natsoft_live",
        "session":   natsoft_data.get("session_name"),
        "round":     natsoft_data.get("round_name"),
        "live":      True,
    }


# ── Option B — SPA JSON extraction ───────────────────────────────────────────

def _looks_like_results_list(obj: list) -> bool:
    if not obj or not isinstance(obj[0], dict):
        return False
    first = obj[0]
    has_pos    = any(k in first for k in ("position", "pos", "finishing_position", "finishingPosition"))
    has_driver = any(k in first for k in ("driver", "driverName", "name", "firstName", "fullName"))
    return has_pos and has_driver


def _search_json_results(obj: Any, depth: int = 0) -> list | None:
    """Recursively search a parsed JSON structure for a results-shaped list."""
    if depth > 12:
        return None

    if isinstance(obj, list) and len(obj) >= 3:
        if _looks_like_results_list(obj):
            return obj

    if isinstance(obj, dict):
        priority = (
            "finishers", "results", "raceResults", "race_results",
            "competitors", "finishingOrder", "classification",
        )
        for key in priority:
            if key in obj:
                result = _search_json_results(obj[key], depth + 1)
                if result:
                    return result
        for val in obj.values():
            result = _search_json_results(val, depth + 1)
            if result:
                return result

    if isinstance(obj, list):
        for item in obj:
            result = _search_json_results(item, depth + 1)
            if result:
                return result

    return None


def _normalise_finisher(raw: dict, pos: int) -> dict:
    name = (
        raw.get("driver")
        or raw.get("driverName")
        or raw.get("fullName")
        or f"{raw.get('firstName', '')} {raw.get('lastName', '')}".strip()
        or raw.get("name")
        or "Unknown"
    )
    return {
        "position": (
            raw.get("position")
            or raw.get("pos")
            or raw.get("finishing_position")
            or raw.get("finishingPosition")
            or pos
        ),
        "driver":   name,
        "car":      str(raw.get("car") or raw.get("carNumber") or raw.get("number") or ""),
        "team":     raw.get("team") or raw.get("teamName") or "",
        "gap":      raw.get("gap") or raw.get("timeBehind") or ("Winner" if pos == 1 else ""),
        "best_lap": raw.get("bestLap") or raw.get("best_lap") or "",
    }


def _parse_results_json(data: Any) -> list[dict] | None:
    raw_list = _search_json_results(data)
    if not raw_list:
        return None
    return [_normalise_finisher(r, i + 1) for i, r in enumerate(raw_list)]


def _extract_from_html(html: str) -> list[dict] | None:
    # Next.js __NEXT_DATA__
    m = re.search(
        r'<script[^>]+id=["\']__NEXT_DATA__["\'][^>]*>\s*(\{.*?\})\s*</script>',
        html, re.DOTALL | re.IGNORECASE,
    )
    if m:
        try:
            parsed = _parse_results_json(json.loads(m.group(1)))
            if parsed:
                _LOGGER.debug("Results extracted from __NEXT_DATA__")
                return parsed
        except json.JSONDecodeError:
            pass

    for pat in (
        r"window\.__(?:INITIAL|PRELOADED)_STATE__\s*=\s*(\{.+?\})(?:;|\s*<)",
        r"window\.__STATE__\s*=\s*(\{.+?\})(?:;|\s*<)",
    ):
        for m in re.finditer(pat, html, re.DOTALL):
            try:
                parsed = _parse_results_json(json.loads(m.group(1)))
                if parsed:
                    _LOGGER.debug("Results extracted from window state")
                    return parsed
            except json.JSONDecodeError:
                continue

    for m in re.finditer(
        r'<script[^>]+type=["\']application/json["\'][^>]*>\s*(\{.*?\})\s*</script>',
        html, re.DOTALL | re.IGNORECASE,
    ):
        try:
            parsed = _parse_results_json(json.loads(m.group(1)))
            if parsed:
                return parsed
        except json.JSONDecodeError:
            continue

    return None


# ── Coordinator ───────────────────────────────────────────────────────────────

class ResultsCoordinator(DataUpdateCoordinator):
    """
    Provides latest race results.

    During an active Natsoft session: serves live Natsoft timing (Option C).
    Otherwise: fetches and parses supercars.com/results (Option B), with a
    stale-cache fallback.
    """

    def __init__(self, hass: HomeAssistant, natsoft_coordinator: "NatsoftCoordinator") -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_results",
            update_interval=timedelta(seconds=RESULTS_SCAN_INTERVAL),
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
                    data = await resp.json(content_type=None)
                    parsed = _parse_results_json(data)
                    if parsed:
                        _LOGGER.info("Results fetched from API: %s", url)
                        return parsed
            except Exception as err:
                _LOGGER.debug("Results API candidate %s failed: %s", url, err)
        return None

    async def _try_page_scrape(self) -> list[dict] | None:
        session = self._get_session()
        try:
            async with session.get(
                RESULTS_PAGE_URL, timeout=aiohttp.ClientTimeout(total=15)
            ) as resp:
                resp.raise_for_status()
                html = await resp.text()
            return _extract_from_html(html)
        except Exception as err:
            _LOGGER.warning("Results page scrape failed: %s", err)
            return None

    async def _async_update_data(self) -> dict[str, Any]:
        natsoft_data = self._natsoft.data or {}
        session_active = natsoft_data.get("session_active", False)

        # Option C — live session: use Natsoft directly, no web request needed
        if session_active:
            _LOGGER.debug("Active session detected; using Natsoft live timing for results")
            result = _natsoft_to_results(natsoft_data)
            # Poll faster while session is live
            if self.update_interval.seconds != 60:
                self.update_interval = timedelta(seconds=60)
            return result

        # Revert to hourly polling outside sessions
        if self.update_interval.seconds != RESULTS_SCAN_INTERVAL:
            self.update_interval = timedelta(seconds=RESULTS_SCAN_INTERVAL)

        # Option B step 1 — direct API endpoints
        finishers = await self._try_api_endpoints()

        # Option B step 2 — page HTML scrape
        if not finishers:
            finishers = await self._try_page_scrape()

        if finishers:
            result = {"finishers": finishers, "source": "supercars.com", "live": False, "session": None}
            self._stale = result
            return result

        # Stale fallback
        if self._stale:
            _LOGGER.warning("Results unavailable; serving stale data")
            return {**self._stale, "source": "stale"}

        _LOGGER.warning("Results unavailable and no stale data")
        return _EMPTY
