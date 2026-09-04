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

from .const import CONF_FAVORITE_TEAMS, CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL, DOMAIN
from .league_data import league_profile, standings_url
from .standings_parser import normalize_league_standings

_LOGGER = logging.getLogger(__name__)
STANDINGS_STORAGE_VERSION = 1
STANDINGS_MIN_POLL_SECONDS = 15 * 60


class LeagueStandingsCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Fetch and cache normalized ESPN standings for one league."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, league: str) -> None:
        self.hass = hass
        self.entry = entry
        self.league = str(league).strip().lower()
        self.profile = league_profile(self.league)
        if not self.profile.get("standings"):
            raise ValueError(f"Generic standings are not enabled for {league}")
        self.league_label = str(self.profile["label"])
        self.url = standings_url(self.league)
        self.session = async_get_clientsession(hass)
        self._last_good_data: dict[str, Any] | None = None
        self._store: Store = Store(hass, STANDINGS_STORAGE_VERSION, f"{DOMAIN}.standings.{self.league}.{entry.entry_id}")
        raw_interval = entry.options.get(CONF_POLL_INTERVAL, entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL))
        try:
            poll_interval = int(raw_interval)
        except (TypeError, ValueError):
            poll_interval = DEFAULT_POLL_INTERVAL
        super().__init__(hass, _LOGGER, name=f"{DOMAIN}_{self.league}_standings", update_interval=timedelta(seconds=max(STANDINGS_MIN_POLL_SECONDS, poll_interval)))

    @property
    def favorite_team(self) -> str | None:
        opts = {**self.entry.data, **self.entry.options}
        favorites = opts.get(CONF_FAVORITE_TEAMS, {})
        if not isinstance(favorites, dict):
            return None
        favorite = favorites.get(self.league)
        return str(favorite).strip().upper() if favorite else None

    async def async_load_cached_data(self) -> None:
        stored = await self._store.async_load()
        if isinstance(stored, dict):
            self._last_good_data = stored
            self._apply_current_favorite(stored)
            self.data = stored

    async def _async_update_data(self) -> dict[str, Any]:
        now = dt_util.utcnow().isoformat()
        try:
            payload = await self._fetch_json()
            normalized = normalize_league_standings(payload, league=self.league, profile=str(self.profile.get("standings_profile") or "soccer"), favorite_team=self.favorite_team, updated_at=now)
            normalized["_sports_ticker_meta"] = {"stale": False, "source": "espn", "league": self.league, "data_type": "standings", "endpoint": self.url, "last_successful_update": now, "last_attempted_update": now, "last_error": None}
            self._last_good_data = normalized
            await self._store.async_save(normalized)
            return normalized
        except Exception as err:
            _LOGGER.warning("Failed to update %s standings. Keeping last good data if available. Error: %s", self.league_label, err)
            if self._last_good_data:
                cached = copy.deepcopy(self._last_good_data)
                self._apply_current_favorite(cached)
                meta = dict(cached.get("_sports_ticker_meta", {}))
                meta.update({"stale": True, "source": "cache", "last_attempted_update": now, "last_error": str(err)})
                cached["_sports_ticker_meta"] = meta
                return cached
            return self._empty_data(now, str(err))

    async def _fetch_json(self) -> dict[str, Any]:
        async with async_timeout.timeout(20):
            response = await self.session.get(self.url)
            if response.status != 200:
                raise aiohttp.ClientResponseError(request_info=response.request_info, history=response.history, status=response.status, message=f"Unexpected status {response.status}", headers=response.headers)
            payload = await response.json()
        if not isinstance(payload, dict):
            raise ValueError("ESPN standings response was not a JSON object")
        return payload

    def _apply_current_favorite(self, data: dict[str, Any]) -> None:
        favorite = self.favorite_team
        data["favorite_team"] = favorite
        collections: list[Any] = [data.get("teams"), data.get("table")]
        for key in ("groups", "conferences", "leagues"):
            groups = data.get(key)
            if isinstance(groups, dict):
                collections.extend(groups.values())
        for rows in collections:
            if not isinstance(rows, list):
                continue
            for row in rows:
                if isinstance(row, dict):
                    row["favorite"] = bool(favorite and str(row.get("abbreviation") or "").upper() == favorite)

    def _empty_data(self, now: str, error: str) -> dict[str, Any]:
        return {"league": self.league, "data_type": "standings", "profile": self.profile.get("standings_profile"), "season": None, "season_type": None, "season_type_name": None, "favorite_team": self.favorite_team, "updated_at": None, "groups": {}, "conferences": {}, "leagues": {}, "divisions": {}, "table": [], "teams": [], "playoff": {}, "normalization": {}, "_sports_ticker_meta": {"stale": True, "source": "cache", "league": self.league, "data_type": "standings", "endpoint": self.url, "last_successful_update": None, "last_attempted_update": now, "last_error": error}}


class ESPNLeagueStandingsRaw(CoordinatorEntity[LeagueStandingsCoordinator], SensorEntity):
    """Normalized league standings sensor."""
    _attr_icon = "mdi:format-list-numbered"

    def __init__(self, coordinator: LeagueStandingsCoordinator) -> None:
        super().__init__(coordinator)
        self.league = coordinator.league
        self.league_label = coordinator.league_label
        self._attr_unique_id = f"espn_{self.league}_standings_raw"
        self._attr_name = f"ESPN {self.league_label} Standings Raw"

    @property
    def available(self) -> bool:
        return isinstance(self.coordinator.data, dict)

    @property
    def native_value(self) -> str:
        data = self.coordinator.data or {}
        teams = data.get("teams", [])
        count = len(teams) if isinstance(teams, list) else 0
        if count == 0:
            return "No standings"
        meta = data.get("_sports_ticker_meta", {})
        return f"Cached - {count} teams" if isinstance(meta, dict) and meta.get("stale") else f"{count} teams"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        meta = data.get("_sports_ticker_meta", {})
        if not isinstance(meta, dict):
            meta = {}
        return {"league": self.league, "league_name": self.league_label, "data_type": "standings", "profile": data.get("profile"), "season": data.get("season"), "season_type": data.get("season_type"), "season_type_name": data.get("season_type_name"), "favorite_team": data.get("favorite_team"), "updated_at": data.get("updated_at"), "groups": data.get("groups", {}), "conferences": data.get("conferences", {}), "leagues": data.get("leagues", {}), "divisions": data.get("divisions", {}), "table": data.get("table", []), "teams": data.get("teams", []), "playoff": data.get("playoff", {}), "normalization": data.get("normalization", {}), "stale": bool(meta.get("stale", False)), "source": meta.get("source"), "endpoint": meta.get("endpoint"), "last_successful_update": meta.get("last_successful_update"), "last_attempted_update": meta.get("last_attempted_update"), "last_error": meta.get("last_error")}
