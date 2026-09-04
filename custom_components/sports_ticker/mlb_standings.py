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
from .mlb_standings_parser import normalize_mlb_standings

_LOGGER = logging.getLogger(__name__)
MLB_STANDINGS_URL = "https://site.web.api.espn.com/apis/v2/sports/baseball/mlb/standings?region=us&lang=en&contentorigin=espn&type=0&level=3"
MIN_POLL_SECONDS = 15 * 60


class MLBStandingsCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator for ESPN MLB standings."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.entry = entry
        self.session = async_get_clientsession(hass)
        self._last_good_data: dict[str, Any] | None = None
        self._store: Store = Store(hass, 1, f"{DOMAIN}.mlb_standings.{entry.entry_id}")
        raw = entry.options.get(CONF_POLL_INTERVAL, entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL))
        try:
            interval = int(raw)
        except (TypeError, ValueError):
            interval = DEFAULT_POLL_INTERVAL
        super().__init__(hass, _LOGGER, name=f"{DOMAIN}_mlb_standings", update_interval=timedelta(seconds=max(MIN_POLL_SECONDS, interval)))

    async def async_load_cached_data(self) -> None:
        stored = await self._store.async_load()
        if isinstance(stored, dict):
            self._last_good_data = stored
            self.data = stored

    def _favorite_team(self) -> str | None:
        opts = {**self.entry.data, **self.entry.options}
        favorites = opts.get(CONF_FAVORITE_TEAMS, {})
        favorite = favorites.get("mlb") if isinstance(favorites, dict) else None
        return str(favorite).strip().upper() if favorite else None

    async def _async_update_data(self) -> dict[str, Any]:
        now = dt_util.utcnow().isoformat()
        try:
            async with async_timeout.timeout(20):
                response = await self.session.get(MLB_STANDINGS_URL)
                if response.status != 200:
                    raise aiohttp.ClientResponseError(request_info=response.request_info, history=response.history, status=response.status, message=f"Unexpected status {response.status}", headers=response.headers)
                payload = await response.json()
            data = normalize_mlb_standings(payload, favorite_team=self._favorite_team(), updated_at=now)
            data["_sports_ticker_meta"] = {"stale": False, "source": "espn", "league": "mlb", "data_type": "standings", "endpoint": MLB_STANDINGS_URL, "last_successful_update": now, "last_attempted_update": now, "last_error": None}
            self._last_good_data = data
            await self._store.async_save(data)
            return data
        except Exception as err:
            _LOGGER.warning("Failed to update MLB standings; using cache if available: %s", err)
            if self._last_good_data:
                data = copy.deepcopy(self._last_good_data)
                favorite = self._favorite_team()
                data["favorite_team"] = favorite
                for row in data.get("teams", []):
                    if isinstance(row, dict):
                        row["favorite"] = bool(favorite and row.get("abbreviation") == favorite)
                meta = dict(data.get("_sports_ticker_meta", {}))
                meta.update({"stale": True, "source": "cache", "last_attempted_update": now, "last_error": str(err)})
                data["_sports_ticker_meta"] = meta
                return data
            return {"league": "mlb", "data_type": "standings", "season": None, "season_type": None, "season_type_name": None, "favorite_team": self._favorite_team(), "updated_at": None, "leagues": {"AL": [], "NL": []}, "divisions": {}, "teams": [], "_sports_ticker_meta": {"stale": True, "source": "cache", "endpoint": MLB_STANDINGS_URL, "last_successful_update": None, "last_attempted_update": now, "last_error": str(err)}}


class ESPNMLBStandingsRaw(CoordinatorEntity[MLBStandingsCoordinator], SensorEntity):
    _attr_icon = "mdi:format-list-numbered"
    _attr_unique_id = "espn_mlb_standings_raw"
    _attr_name = "ESPN MLB Standings Raw"

    @property
    def available(self) -> bool:
        return isinstance(self.coordinator.data, dict)

    @property
    def native_value(self) -> str:
        data = self.coordinator.data or {}
        count = len(data.get("teams", [])) if isinstance(data.get("teams"), list) else 0
        if not count:
            return "No standings"
        meta = data.get("_sports_ticker_meta", {})
        return f"Cached - {count} teams" if isinstance(meta, dict) and meta.get("stale") else f"{count} teams"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        meta = data.get("_sports_ticker_meta", {}) if isinstance(data.get("_sports_ticker_meta"), dict) else {}
        return {"league": "mlb", "league_name": "MLB", "data_type": "standings", "season": data.get("season"), "season_type": data.get("season_type"), "season_type_name": data.get("season_type_name"), "favorite_team": data.get("favorite_team"), "updated_at": data.get("updated_at"), "leagues": data.get("leagues", {"AL": [], "NL": []}), "divisions": data.get("divisions", {}), "teams": data.get("teams", []), "stale": bool(meta.get("stale", False)), "source": meta.get("source"), "endpoint": meta.get("endpoint"), "last_successful_update": meta.get("last_successful_update"), "last_attempted_update": meta.get("last_attempted_update"), "last_error": meta.get("last_error")}
