from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

import aiohttp
import async_timeout

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import (
    CONF_LEAGUES,
    CONF_POLL_INTERVAL,
    DEFAULT_POLL_INTERVAL,
    DOMAIN,
    LEAGUES,
    STORAGE_KEY,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)

DEFAULT_LEAGUES = ["mlb", "nfl"]


class SportsTickerCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator for Sports Ticker data."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
    ) -> None:
        """Initialize coordinator."""
        self.hass = hass
        self.entry = entry
        self.session = async_get_clientsession(hass)

        self.leagues = self._get_configured_leagues(entry)

        poll_interval = self._get_poll_interval(entry)

        self._store: Store = Store(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
        )

        self._last_good_data: dict[str, Any] = {}

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=poll_interval),
        )

    async def async_load_cached_data(self) -> None:
        """Load cached last-good data from Home Assistant storage."""
        stored = await self._store.async_load()

        if isinstance(stored, dict):
            # Only keep cached data for currently selected leagues.
            self._last_good_data = {
                league: payload
                for league, payload in stored.items()
                if league in self.leagues and isinstance(payload, dict)
            }

            self.data = dict(self._last_good_data)

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch ESPN scoreboard data and preserve last good data on failure."""
        results: dict[str, Any] = {}

        for league in self.leagues:
            url = LEAGUES.get(league)

            if not url:
                _LOGGER.warning("No ESPN URL configured for league: %s", league)
                continue

            previous = self._last_good_data.get(league)

            try:
                async with async_timeout.timeout(15):
                    response = await self.session.get(url)

                    if response.status != 200:
                        raise aiohttp.ClientResponseError(
                            request_info=response.request_info,
                            history=response.history,
                            status=response.status,
                            message=f"Unexpected status {response.status}",
                            headers=response.headers,
                        )

                    payload = await response.json()

                if not self._is_valid_scoreboard_payload(payload):
                    raise ValueError(f"Invalid ESPN payload for {league}")

                now = dt_util.utcnow().isoformat()

                payload["_sports_ticker_meta"] = {
                    "stale": False,
                    "source": "espn",
                    "league": league,
                    "last_successful_update": now,
                    "last_attempted_update": now,
                    "last_error": None,
                }

                results[league] = payload
                self._last_good_data[league] = payload

            except Exception as err:
                _LOGGER.warning(
                    "Failed to update %s scoreboard. Keeping last good data. Error: %s",
                    league,
                    err,
                )

                now = dt_util.utcnow().isoformat()

                if previous:
                    cached_payload = dict(previous)

                    meta = dict(cached_payload.get("_sports_ticker_meta", {}))
                    meta["stale"] = True
                    meta["source"] = "cache"
                    meta["league"] = league
                    meta["last_attempted_update"] = now
                    meta["last_error"] = str(err)

                    cached_payload["_sports_ticker_meta"] = meta

                    results[league] = cached_payload
                    self._last_good_data[league] = cached_payload

                else:
                    results[league] = {
                        "events": [],
                        "_sports_ticker_meta": {
                            "stale": True,
                            "source": "cache",
                            "league": league,
                            "last_successful_update": None,
                            "last_attempted_update": now,
                            "last_error": str(err),
                        },
                    }

        # Remove leagues that are no longer selected from memory before saving.
        self._last_good_data = {
            league: payload
            for league, payload in self._last_good_data.items()
            if league in self.leagues
        }

        await self._store.async_save(self._last_good_data)

        return results

    async def async_shutdown(self) -> None:
        """Shutdown coordinator."""
        await self._store.async_save(self._last_good_data)

    @staticmethod
    def _is_valid_scoreboard_payload(payload: Any) -> bool:
        """Validate ESPN scoreboard payload."""
        if not isinstance(payload, dict):
            return False

        # ESPN scoreboard payloads normally include events.
        # Empty events is valid when there are no games.
        events = payload.get("events")

        return isinstance(events, list)

    @staticmethod
    def _get_configured_leagues(entry: ConfigEntry) -> list[str]:
        """Return configured leagues from entry data/options."""
        raw_leagues = entry.options.get(
            CONF_LEAGUES,
            entry.data.get(CONF_LEAGUES, DEFAULT_LEAGUES),
        )

        if isinstance(raw_leagues, str):
            raw_leagues = [raw_leagues]

        leagues = [
            str(league).strip().lower()
            for league in (raw_leagues or [])
            if str(league).strip().lower() in LEAGUES
        ]

        return leagues or DEFAULT_LEAGUES

    @staticmethod
    def _get_poll_interval(entry: ConfigEntry) -> int:
        """Return configured poll interval."""
        raw_interval = entry.options.get(
            CONF_POLL_INTERVAL,
            entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
        )

        try:
            interval = int(raw_interval)
        except (TypeError, ValueError):
            interval = DEFAULT_POLL_INTERVAL

        return max(15, min(interval, 600))
