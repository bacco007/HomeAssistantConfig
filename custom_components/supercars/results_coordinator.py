"""Supercars results coordinator.

Strategy:

  - Live session: If `NatsoftCoordinator` reports an active session, use its
    live timing data as the current results. No web request needed.
  - Idle: Fetch the season results list page, find the most recently
    completed race's result-page link (the list is in chronological order,
    so the last link is the latest race), then scrape that race's finishing
    order from its server-rendered results table. The supercars.com site
    renders this table as plain HTML (no embedded JSON), so this uses a
    regex-based DOM scrape rather than JSON extraction.
  - Stale fallback: If all remote sources fail, serve the last successful
    parse. No hard-coded dummy data.
"""
from __future__ import annotations

import logging
import re
from datetime import timedelta
from typing import Any, TYPE_CHECKING

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN

if TYPE_CHECKING:
    from .coordinator import NatsoftCoordinator

_LOGGER = logging.getLogger(__name__)

SEASON_RESULTS_URL = "https://www.supercars.com/results/2026/supercars"
RESULTS_SCAN_INTERVAL_IDLE = 3600  # 1 hour outside sessions
RESULTS_SCAN_INTERVAL_LIVE = 60    # 1 minute during sessions

_EMPTY: dict[str, Any] = {"finishers": [], "source": "unavailable", "session": None}

_LATEST_RACE_HREF_RE = re.compile(r'href="(/results/2026/[^"/]+/R\d+)"')

_ROW_ANCHOR_RE = re.compile(r'<a href="/drivers/[^"]+"[^>]*>([^<]+)</a>')
_CAR_NUMBER_RE = re.compile(r">(\d+)</span>")
_POSITION_RE = re.compile(r">(\d+)</div>")
_TEAM_RE = re.compile(r'</a>\s*</div>\s*<div[^>]*>([^<]*)</div>')


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


# ── Idle — scrape the latest completed race's result page ────────────────────

def _find_latest_race_path(html: str) -> str | None:
    """Return the last `/results/2026/<slug>/R<n>` link (season list is
    in chronological order, so this is the most recently completed race)."""
    matches = _LATEST_RACE_HREF_RE.findall(html)
    return matches[-1] if matches else None


def _parse_race_result_html(html: str) -> list[dict]:
    """Scrape the finishing order from a race result page's results table."""
    finishers: list[dict] = []
    for match in _ROW_ANCHOR_RE.finditer(html):
        driver = match.group(1).strip()

        window = html[max(0, match.start() - 400): match.start()]
        cars = _CAR_NUMBER_RE.findall(window)
        positions = _POSITION_RE.findall(window)
        if not positions:
            continue

        team_match = _TEAM_RE.match("</a>" + html[match.end():match.end() + 300])
        team = team_match.group(1).strip() if team_match else ""

        finishers.append({
            "position": int(positions[-1]),
            "driver":   driver,
            "car":      cars[-1] if cars else "",
            "team":     team,
            "gap":      "Winner" if positions[-1] == "1" else "",
            "best_lap": "",
        })

    return finishers


def _event_label_from_slug(slug: str) -> str:
    return slug.split("-", 1)[-1].replace("-", " ").title() if "-" in slug else slug


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

    async def _try_scrape_latest_race(self) -> dict[str, Any] | None:
        session = self._get_session()
        try:
            async with session.get(
                SEASON_RESULTS_URL, timeout=aiohttp.ClientTimeout(total=15)
            ) as resp:
                resp.raise_for_status()
                season_html = await resp.text()
        except Exception as err:  # pylint: disable=broad-except
            _LOGGER.warning("Season results fetch failed: %s", err)
            return None

        race_path = _find_latest_race_path(season_html)
        if not race_path:
            _LOGGER.debug("No completed race found on season results page")
            return None

        try:
            async with session.get(
                f"https://www.supercars.com{race_path}",
                timeout=aiohttp.ClientTimeout(total=15),
            ) as resp:
                resp.raise_for_status()
                race_html = await resp.text()
        except Exception as err:  # pylint: disable=broad-except
            _LOGGER.warning("Race result page fetch failed: %s", err)
            return None

        finishers = _parse_race_result_html(race_html)
        if not finishers:
            return None

        # race_path looks like /results/2026/2026-townsville/R13
        parts = race_path.strip("/").split("/")
        slug = parts[2] if len(parts) > 2 else None
        race_no = parts[3] if len(parts) > 3 else None

        _LOGGER.info("Results scraped from %s", race_path)
        return {
            "finishers": finishers,
            "source":    f"https://www.supercars.com{race_path}",
            "live":      False,
            "session":   race_no,
            "round":     _event_label_from_slug(slug) if slug else None,
        }

    async def _async_update_data(self) -> dict[str, Any]:
        natsoft_data = self._natsoft.data or {}

        # Live session — no web request needed
        if natsoft_data.get("session_active"):
            _LOGGER.debug("Active session; using Natsoft live timing")
            self._set_interval(RESULTS_SCAN_INTERVAL_LIVE)
            return _natsoft_to_results(natsoft_data)

        self._set_interval(RESULTS_SCAN_INTERVAL_IDLE)

        result = await self._try_scrape_latest_race()
        if result:
            self._stale = result
            return result

        if self._stale:
            _LOGGER.warning("Results unavailable; serving stale data")
            return {**self._stale, "source": "stale"}

        _LOGGER.warning("Results unavailable and no stale data")
        return _EMPTY
