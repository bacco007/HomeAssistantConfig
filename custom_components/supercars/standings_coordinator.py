"""Supercars standings coordinator.

Strategy (Option B):

  1. Try known WordPress/REST API candidate endpoints.
  2. Issue a Next.js RSC fetch (`RSC: 1`) against the standings page; the
     server replies with the React Server Component flight payload, which
     contains the data when the page is fully SSR'd.
  3. Fetch the standings page HTML and scan every embedded JSON blob —
     `__NEXT_DATA__`, `window.__*STATE__`, `<script type="application/json">`
     and App Router `self.__next_f.push(...)` flight chunks.
  4. If every remote source fails, return the last successfully parsed
     response (stale cache). Never return hard-coded dummy data.
"""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

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

_LOGGER = logging.getLogger(__name__)

STANDINGS_PAGE_URL = "https://www.supercars.com/standings"
STANDINGS_SCAN_INTERVAL = 3600  # 1 hour

# Candidate REST/JSON API endpoints — speculative, tried before scraping
_API_CANDIDATES = (
    "https://www.supercars.com/wp-json/supercars/v1/championship",
    "https://www.supercars.com/wp-json/supercars/v1/standings",
    "https://www.supercars.com/wp-json/supercars/v1/drivers",
    "https://www.supercars.com/api/championship/standings",
    "https://www.supercars.com/api/standings",
)

_EMPTY: dict[str, Any] = {"drivers": [], "teams": [], "source": "unavailable"}


# ── Standings shape detection ─────────────────────────────────────────────────

_DRIVER_NAME_KEYS = ("driver", "driverName", "fullName", "name", "firstName")
_TEAM_NAME_KEYS   = ("team", "teamName", "name")
_POINTS_KEYS      = ("points", "pts", "score", "totalPoints", "championshipPoints")
_POSITION_KEYS    = ("position", "pos", "rank")


def _is_standings_row(row: Any, name_keys: tuple[str, ...]) -> bool:
    if not isinstance(row, dict):
        return False
    return (
        any(k in row for k in _POSITION_KEYS)
        and any(k in row for k in name_keys)
        and any(k in row for k in _POINTS_KEYS)
    )


def _match_standings(node: Any) -> dict[str, list] | None:
    """Matcher for `search_json` — accepts a list of standings rows."""
    if not isinstance(node, list) or len(node) < 3:
        return None
    if all(_is_standings_row(r, _DRIVER_NAME_KEYS) for r in node):
        # Looks like driver standings — but may also be a teams list with a
        # `name` key. Disambiguate via team-only fields.
        first = node[0]
        if any(k in first for k in ("driverName", "fullName", "firstName")):
            return {"drivers": node, "teams": []}
        if "team" in first and "driver" not in first:
            return {"drivers": [], "teams": node}
        return {"drivers": node, "teams": []}
    if all(_is_standings_row(r, _TEAM_NAME_KEYS) for r in node):
        return {"drivers": [], "teams": node}
    return None


def _normalise_driver(raw: dict, fallback_pos: int) -> dict:
    name = (
        raw.get("driver")
        or raw.get("driverName")
        or raw.get("fullName")
        or f"{raw.get('firstName', '')} {raw.get('lastName', '')}".strip()
        or raw.get("name")
        or "Unknown"
    )
    return {
        "position": raw.get("position") or raw.get("pos") or raw.get("rank") or fallback_pos,
        "driver":   name,
        "team":     raw.get("team") or raw.get("teamName"),
        "points":   str(
            raw.get("points")
            or raw.get("totalPoints")
            or raw.get("championshipPoints")
            or raw.get("pts")
            or raw.get("score")
            or 0
        ),
        "gap":      raw.get("gap") or raw.get("pointsGap") or "",
    }


def _normalise_team(raw: dict, fallback_pos: int) -> dict:
    return {
        "position": raw.get("position") or raw.get("pos") or raw.get("rank") or fallback_pos,
        "team":     raw.get("team") or raw.get("teamName") or raw.get("name") or "Unknown",
        "points":   str(
            raw.get("points")
            or raw.get("totalPoints")
            or raw.get("championshipPoints")
            or raw.get("pts")
            or 0
        ),
        "gap":      raw.get("gap") or raw.get("pointsGap") or "",
    }


def _parse_blob(data: Any) -> dict[str, Any] | None:
    found = search_json(data, _match_standings)
    if not found:
        return None
    drivers = [_normalise_driver(r, i + 1) for i, r in enumerate(found["drivers"])]
    teams   = [_normalise_team(r, i + 1)   for i, r in enumerate(found["teams"])]
    if not drivers and not teams:
        return None
    return {"drivers": drivers, "teams": teams}


# ── Coordinator ───────────────────────────────────────────────────────────────

class StandingsCoordinator(DataUpdateCoordinator):
    """Polls supercars.com for championship standings."""

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
                        _LOGGER.info("Standings fetched from API: %s", url)
                        return {**parsed, "source": url}
            except Exception as err:  # pylint: disable=broad-except
                _LOGGER.debug("API candidate %s failed: %s", url, err)
        return None

    async def _try_rsc(self) -> dict[str, Any] | None:
        payload = await fetch_rsc(self._get_session(), STANDINGS_PAGE_URL)
        if not payload:
            return None
        for blob in iter_rsc_chunks(payload):
            parsed = _parse_blob(blob)
            if parsed:
                _LOGGER.info("Standings extracted from RSC payload")
                return {**parsed, "source": f"{STANDINGS_PAGE_URL}#rsc"}
        return None

    async def _try_page_scrape(self) -> dict[str, Any] | None:
        session = self._get_session()
        try:
            async with session.get(
                STANDINGS_PAGE_URL, timeout=aiohttp.ClientTimeout(total=15)
            ) as resp:
                resp.raise_for_status()
                html = await resp.text()
        except Exception as err:  # pylint: disable=broad-except
            _LOGGER.warning("Standings page fetch failed: %s", err)
            return None

        for blob in iter_html_json_blobs(html):
            parsed = _parse_blob(blob)
            if parsed:
                _LOGGER.info("Standings extracted from page HTML")
                return {**parsed, "source": STANDINGS_PAGE_URL}

        _LOGGER.debug("Standings JSON not found in page HTML")
        return None

    async def _async_update_data(self) -> dict[str, Any]:
        for attempt in (self._try_api_endpoints, self._try_rsc, self._try_page_scrape):
            result = await attempt()
            if result:
                self._stale = result
                return result

        if self._stale:
            _LOGGER.warning("Standings unavailable; serving stale data")
            return {**self._stale, "source": "stale"}

        _LOGGER.warning("Standings unavailable and no stale data")
        return _EMPTY
