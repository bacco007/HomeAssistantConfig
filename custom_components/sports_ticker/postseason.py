from __future__ import annotations

import copy
import logging
from datetime import timedelta
from typing import Any

import aiohttp
import async_timeout
from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import CoordinatorEntity, DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL, DOMAIN
from .coordinator import SportsTickerCoordinator
from .league_data import league_profile, site_resource_url
from .postseason_parser import normalize_postseason

_LOGGER = logging.getLogger(__name__)
POSTSEASON_STORAGE_VERSION = 1
POSTSEASON_MIN_POLL_SECONDS = 5 * 60


class PostseasonCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Fetch normalized postseason games/series for one league."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, league: str, scoreboard_coordinator: SportsTickerCoordinator) -> None:
        self.hass = hass; self.entry = entry; self.league = str(league).strip().lower(); self.profile = league_profile(self.league)
        if not self.profile.get("postseason"): raise ValueError(f"Postseason sensor is not enabled for {league}")
        self.league_label = str(self.profile["label"]); self.scoreboard_coordinator = scoreboard_coordinator; self.session = async_get_clientsession(hass); self._last_good_data: dict[str, Any] | None = None
        self._store: Store = Store(hass, POSTSEASON_STORAGE_VERSION, f"{DOMAIN}.postseason.{self.league}.{entry.entry_id}")
        raw_interval = entry.options.get(CONF_POLL_INTERVAL, entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL))
        try: poll_interval = int(raw_interval)
        except (TypeError, ValueError): poll_interval = DEFAULT_POLL_INTERVAL
        super().__init__(hass, _LOGGER, name=f"{DOMAIN}_{self.league}_postseason", update_interval=timedelta(seconds=max(POSTSEASON_MIN_POLL_SECONDS, poll_interval)))

    async def async_load_cached_data(self) -> None:
        stored = await self._store.async_load()
        if isinstance(stored, dict): self._last_good_data = stored; self.data = stored

    async def _async_update_data(self) -> dict[str, Any]:
        now = dt_util.utcnow().isoformat(); season = self._season_year(); url = site_resource_url(self.league, f"scoreboard?dates={season}&seasontype=3&limit=1000")
        try:
            payload = await self._fetch_json(url); normalized = normalize_postseason(payload, league=self.league, season=season, updated_at=now)
            normalized["_sports_ticker_meta"] = {"stale": False, "source": "espn", "endpoint": url, "last_successful_update": now, "last_attempted_update": now, "last_error": None}
            self._last_good_data = normalized; await self._store.async_save(normalized); return normalized
        except Exception as err:
            _LOGGER.warning("Failed to update %s postseason data. Keeping last good data if available. Error: %s", self.league_label, err)
            if self._last_good_data:
                cached = copy.deepcopy(self._last_good_data); meta = dict(cached.get("_sports_ticker_meta", {})); meta.update({"stale": True, "source": "cache", "last_attempted_update": now, "last_error": str(err)}); cached["_sports_ticker_meta"] = meta; return cached
            return {"league": self.league, "data_type": "postseason", "season": season, "updated_at": None, "rounds": [], "games": [], "has_postseason_data": False, "normalization": {}, "_sports_ticker_meta": {"stale": True, "source": "cache", "endpoint": url, "last_successful_update": None, "last_attempted_update": now, "last_error": str(err)}}

    async def _fetch_json(self, url: str) -> dict[str, Any]:
        async with async_timeout.timeout(20):
            response = await self.session.get(url)
            if response.status != 200: raise aiohttp.ClientResponseError(request_info=response.request_info, history=response.history, status=response.status, message=f"Unexpected status {response.status}", headers=response.headers)
            payload = await response.json()
        if not isinstance(payload, dict): raise ValueError("ESPN postseason response was not a JSON object")
        return payload

    def _season_year(self) -> int:
        data = self.scoreboard_coordinator.data or {}; league_data = data.get(self.league, {}) if isinstance(data, dict) else {}
        if isinstance(league_data, dict):
            season = league_data.get("season")
            if isinstance(season, dict):
                try:
                    if season.get("year") is not None: return int(season["year"])
                except (TypeError, ValueError): pass
            elif season is not None:
                try: return int(season)
                except (TypeError, ValueError): pass
        return dt_util.utcnow().year


class ESPNPostseason(CoordinatorEntity[PostseasonCoordinator], SensorEntity):
    """Normalized postseason rounds and series sensor."""
    _attr_icon = "mdi:tournament"

    def __init__(self, coordinator: PostseasonCoordinator) -> None:
        super().__init__(coordinator); self.league = coordinator.league; self.league_label = coordinator.league_label; self._attr_unique_id = f"espn_{self.league}_playoffs"; self._attr_name = f"ESPN {self.league_label} Playoffs"

    @property
    def native_value(self) -> str:
        data = self.coordinator.data or {}; games = data.get("games", []); count = len(games) if isinstance(games, list) else 0
        if count == 0: return "No postseason data"
        meta = data.get("_sports_ticker_meta", {}); return f"Cached - {count} games" if isinstance(meta, dict) and meta.get("stale") else f"{count} games"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}; meta = data.get("_sports_ticker_meta", {})
        if not isinstance(meta, dict): meta = {}
        return {"league": self.league, "league_name": self.league_label, "data_type": "postseason", "season": data.get("season"), "updated_at": data.get("updated_at"), "has_postseason_data": bool(data.get("has_postseason_data", False)), "rounds": data.get("rounds", []), "games": data.get("games", []), "normalization": data.get("normalization", {}), "stale": bool(meta.get("stale", False)), "source": meta.get("source"), "endpoint": meta.get("endpoint"), "last_successful_update": meta.get("last_successful_update"), "last_attempted_update": meta.get("last_attempted_update"), "last_error": meta.get("last_error")}
