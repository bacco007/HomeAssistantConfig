"""Supercars standings coordinator.

Strategy (Option B):
  1. Try known WordPress/REST API candidate endpoints.
  2. Fall back to fetching the standings page HTML and extracting JSON
     embedded by the SPA (Next.js __NEXT_DATA__, Redux window state, etc.).
  3. If all remote sources fail, return the most recent successfully parsed
     data (stale cache). Never return hard-coded dummy data.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import timedelta
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STANDINGS_PAGE_URL = "https://www.supercars.com/standings"
STANDINGS_SCAN_INTERVAL = 3600  # 1 hour

# Candidate REST/JSON API endpoints — try these before falling back to HTML scraping
_API_CANDIDATES = [
    "https://www.supercars.com/wp-json/supercars/v1/championship",
    "https://www.supercars.com/wp-json/supercars/v1/standings",
    "https://www.supercars.com/wp-json/supercars/v1/drivers",
    "https://www.supercars.com/api/championship/standings",
    "https://www.supercars.com/api/standings",
]

_EMPTY: dict[str, Any] = {"drivers": [], "teams": [], "source": "unavailable"}


# ── JSON search helpers ───────────────────────────────────────────────────────

def _looks_like_driver_list(obj: list) -> bool:
    if not obj or not isinstance(obj[0], dict):
        return False
    first = obj[0]
    has_pos    = any(k in first for k in ("position", "pos", "rank"))
    has_driver = any(k in first for k in ("driver", "driverName", "name", "firstName", "fullName"))
    has_points = any(k in first for k in ("points", "pts", "score", "totalPoints", "championshipPoints"))
    return has_pos and has_driver and has_points


def _looks_like_team_list(obj: list) -> bool:
    if not obj or not isinstance(obj[0], dict):
        return False
    first = obj[0]
    has_pos  = any(k in first for k in ("position", "pos", "rank"))
    has_team = any(k in first for k in ("team", "teamName", "name"))
    has_pts  = any(k in first for k in ("points", "pts", "score", "totalPoints", "championshipPoints"))
    return has_pos and has_team and has_pts


def _search_json(obj: Any, depth: int = 0) -> dict[str, list] | None:
    """Recursively search a parsed JSON structure for standings-shaped data."""
    if depth > 12:
        return None

    if isinstance(obj, list) and len(obj) >= 3:
        if _looks_like_driver_list(obj):
            return {"drivers": obj, "teams": []}
        if _looks_like_team_list(obj):
            return {"drivers": [], "teams": obj}

    if isinstance(obj, dict):
        # Prefer keys that sound like standings containers
        priority = (
            "drivers", "driverStandings", "driver_standings",
            "teams", "teamStandings", "team_standings",
            "championship", "standings", "leaderboard",
        )
        for key in priority:
            if key in obj:
                result = _search_json(obj[key], depth + 1)
                if result and (result["drivers"] or result["teams"]):
                    return result
        # Generic recursive search
        for val in obj.values():
            result = _search_json(val, depth + 1)
            if result and (result["drivers"] or result["teams"]):
                return result

    if isinstance(obj, list):
        for item in obj:
            result = _search_json(item, depth + 1)
            if result and (result["drivers"] or result["teams"]):
                return result

    return None


def _normalise_driver(raw: dict, pos: int) -> dict:
    name = (
        raw.get("driver")
        or raw.get("driverName")
        or raw.get("fullName")
        or f"{raw.get('firstName', '')} {raw.get('lastName', '')}".strip()
        or raw.get("name")
        or "Unknown"
    )
    points = str(
        raw.get("points")
        or raw.get("totalPoints")
        or raw.get("championshipPoints")
        or raw.get("pts")
        or raw.get("score")
        or 0
    )
    return {
        "position": raw.get("position") or raw.get("pos") or raw.get("rank") or pos,
        "driver":   name,
        "team":     raw.get("team") or raw.get("teamName") or None,
        "points":   points,
        "gap":      raw.get("gap") or raw.get("pointsGap") or "",
    }


def _normalise_team(raw: dict, pos: int) -> dict:
    name = (
        raw.get("team")
        or raw.get("teamName")
        or raw.get("name")
        or "Unknown"
    )
    points = str(
        raw.get("points")
        or raw.get("totalPoints")
        or raw.get("championshipPoints")
        or raw.get("pts")
        or 0
    )
    return {
        "position": raw.get("position") or raw.get("pos") or raw.get("rank") or pos,
        "team":     name,
        "points":   points,
        "gap":      raw.get("gap") or raw.get("pointsGap") or "",
    }


def _parse_standings_json(data: Any) -> dict[str, Any] | None:
    """Extract and normalise standings from a parsed JSON blob."""
    found = _search_json(data)
    if not found:
        return None

    drivers = [_normalise_driver(r, i + 1) for i, r in enumerate(found.get("drivers", []))]
    teams   = [_normalise_team(r, i + 1) for i, r in enumerate(found.get("teams", []))]

    if not drivers and not teams:
        return None

    return {"drivers": drivers, "teams": teams, "source": "api"}


def _extract_from_html(html: str) -> dict[str, Any] | None:
    """Extract standings from embedded SPA JSON in a page's HTML."""

    # Pattern 1 — Next.js __NEXT_DATA__
    m = re.search(
        r'<script[^>]+id=["\']__NEXT_DATA__["\'][^>]*>\s*(\{.*?\})\s*</script>',
        html, re.DOTALL | re.IGNORECASE,
    )
    if m:
        try:
            parsed = _parse_standings_json(json.loads(m.group(1)))
            if parsed:
                _LOGGER.debug("Standings extracted from __NEXT_DATA__")
                return parsed
        except json.JSONDecodeError:
            pass

    # Pattern 2 — window.__INITIAL_STATE__ / __PRELOADED_STATE__ / __STATE__
    for pat in (
        r"window\.__(?:INITIAL|PRELOADED)_STATE__\s*=\s*(\{.+?\})(?:;|\s*<)",
        r"window\.__STATE__\s*=\s*(\{.+?\})(?:;|\s*<)",
    ):
        for m in re.finditer(pat, html, re.DOTALL):
            try:
                parsed = _parse_standings_json(json.loads(m.group(1)))
                if parsed:
                    _LOGGER.debug("Standings extracted from window state pattern")
                    return parsed
            except json.JSONDecodeError:
                continue

    # Pattern 3 — any <script type="application/json"> block
    for m in re.finditer(
        r'<script[^>]+type=["\']application/json["\'][^>]*>\s*(\{.*?\})\s*</script>',
        html, re.DOTALL | re.IGNORECASE,
    ):
        try:
            parsed = _parse_standings_json(json.loads(m.group(1)))
            if parsed:
                _LOGGER.debug("Standings extracted from application/json script tag")
                return parsed
        except json.JSONDecodeError:
            continue

    return None


# ── Coordinator ───────────────────────────────────────────────────────────────

class StandingsCoordinator(DataUpdateCoordinator):
    """
    Polls supercars.com for championship standings.

    Tries known REST/API endpoints first, then falls back to extracting
    JSON embedded in the SPA page HTML. Stale data is served on failure.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_standings",
            update_interval=timedelta(seconds=STANDINGS_SCAN_INTERVAL),
        )
        self._session: aiohttp.ClientSession | None = None
        self._stale: dict[str, Any] | None = None

    def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                headers={"User-Agent": "Mozilla/5.0 (HomeAssistant Supercars Integration)"}
            )
        return self._session

    async def _try_api_endpoints(self) -> dict[str, Any] | None:
        """Attempt each candidate API URL. Returns on first parseable response."""
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
                    parsed = _parse_standings_json(data)
                    if parsed:
                        _LOGGER.info("Standings fetched from API: %s", url)
                        parsed["source"] = url
                        return parsed
            except Exception as err:
                _LOGGER.debug("API candidate %s failed: %s", url, err)
        return None

    async def _try_page_scrape(self) -> dict[str, Any] | None:
        """Fetch standings page HTML and extract embedded SPA JSON."""
        session = self._get_session()
        try:
            async with session.get(
                STANDINGS_PAGE_URL, timeout=aiohttp.ClientTimeout(total=15)
            ) as resp:
                resp.raise_for_status()
                html = await resp.text()
            parsed = _extract_from_html(html)
            if parsed:
                parsed["source"] = STANDINGS_PAGE_URL
                return parsed
            _LOGGER.debug("Could not find standings JSON in page HTML")
        except Exception as err:
            _LOGGER.warning("Standings page scrape failed: %s", err)
        return None

    async def _async_update_data(self) -> dict[str, Any]:
        # Option B step 1 — direct API
        result = await self._try_api_endpoints()

        # Option B step 2 — HTML embedded JSON
        if not result:
            result = await self._try_page_scrape()

        if result:
            self._stale = result
            return result

        # All sources failed
        if self._stale:
            _LOGGER.warning("Standings unavailable; serving stale data from last successful fetch")
            return {**self._stale, "source": "stale"}

        # First-run failure — return empty (no dummy data)
        _LOGGER.warning("Standings unavailable and no stale data; sensors will show unavailable")
        return _EMPTY
