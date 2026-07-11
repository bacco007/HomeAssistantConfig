"""Supercars standings coordinator.

Strategy:

  1. Fetch the real standings page (`/standings/2026/supercars`), which
     server-renders a Contentful-backed JSON blob (inside a Next.js App
     Router flight chunk) containing per-driver season stats
     (`driverStats`). Team standings aren't server-rendered on their own
     page, so they're derived by aggregating driver stats by team.
  2. If the remote fetch fails, return the last successfully parsed
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
from .spa_extract import iter_html_json_blobs, search_json

_LOGGER = logging.getLogger(__name__)

STANDINGS_PAGE_URL = "https://www.supercars.com/standings/2026/supercars"
STANDINGS_SCAN_INTERVAL = 3600  # 1 hour

_EMPTY: dict[str, Any] = {"drivers": [], "teams": [], "source": "unavailable"}


# ── Standings shape detection ─────────────────────────────────────────────────

def _is_driver_row(row: Any) -> bool:
    return (
        isinstance(row, dict)
        and "driverName" in row
        and "totalSeasonPoints" in row
    )


def _match_driver_stats(node: Any) -> list[dict] | None:
    """Matcher for `search_json` — finds the `driverStats` list."""
    if isinstance(node, list) and len(node) >= 3 and all(_is_driver_row(r) for r in node):
        return node
    return None


def _normalise_driver(raw: dict, position: int) -> dict:
    return {
        "position": position,
        "driver":   raw.get("driverName") or "Unknown",
        "team":     raw.get("teamName"),
        "car":      str(raw.get("driverNumber") or ""),
        "points":   str(raw.get("totalSeasonPoints") or 0),
    }


def _aggregate_teams(driver_rows: list[dict]) -> list[dict]:
    """Derive team standings by summing driver points per team."""
    totals: dict[str, dict[str, Any]] = {}
    for raw in driver_rows:
        code = raw.get("teamCode") or raw.get("teamName")
        if not code:
            continue
        entry = totals.setdefault(code, {"team": raw.get("teamName") or code, "points": 0})
        entry["points"] += raw.get("totalSeasonPoints") or 0

    ranked = sorted(totals.values(), key=lambda t: t["points"], reverse=True)
    return [
        {"position": i + 1, "team": t["team"], "points": str(t["points"])}
        for i, t in enumerate(ranked)
    ]


def _parse_blob(data: Any) -> dict[str, Any] | None:
    found = search_json(data, _match_driver_stats)
    if not found:
        return None
    ranked = sorted(found, key=lambda r: r.get("totalSeasonPoints") or 0, reverse=True)
    drivers = [_normalise_driver(r, i + 1) for i, r in enumerate(ranked)]
    teams = _aggregate_teams(found)
    if not drivers:
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
                _LOGGER.info("Standings extracted from page JSON")
                return {**parsed, "source": STANDINGS_PAGE_URL}

        _LOGGER.debug("Standings JSON not found in page HTML")
        return None

    async def _async_update_data(self) -> dict[str, Any]:
        result = await self._try_page_scrape()
        if result:
            self._stale = result
            return result

        if self._stale:
            _LOGGER.warning("Standings unavailable; serving stale data")
            return {**self._stale, "source": "stale"}

        _LOGGER.warning("Standings unavailable and no stale data")
        return _EMPTY
