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
from .coordinator import SportsTickerCoordinator
from .nfl_standings_parser import normalize_nfl_standings

_LOGGER = logging.getLogger(__name__)

NFL_STANDINGS_URL = (
    "https://site.web.api.espn.com/apis/v2/sports/football/nfl/standings"
    "?region=us&lang=en&contentorigin=espn&type=0&level=3"
)
NFL_STANDINGS_STORAGE_VERSION = 1
NFL_STANDINGS_MIN_POLL_SECONDS = 15 * 60


class NFLStandingsCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator for normalized ESPN NFL standings."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        scoreboard_coordinator: SportsTickerCoordinator,
    ) -> None:
        """Initialize the NFL standings coordinator."""
        self.hass = hass
        self.entry = entry
        self.scoreboard_coordinator = scoreboard_coordinator
        self.session = async_get_clientsession(hass)
        self._last_good_data: dict[str, Any] | None = None
        self._store: Store = Store(
            hass,
            NFL_STANDINGS_STORAGE_VERSION,
            f"{DOMAIN}.nfl_standings.{entry.entry_id}",
        )

        raw_interval = entry.options.get(
            CONF_POLL_INTERVAL,
            entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
        )
        try:
            poll_interval = int(raw_interval)
        except (TypeError, ValueError):
            poll_interval = DEFAULT_POLL_INTERVAL

        # Standings do not need scoreboard-frequency polling. Keep the user setting
        # as a floor only when it is already more conservative than 15 minutes.
        poll_interval = max(NFL_STANDINGS_MIN_POLL_SECONDS, poll_interval)

        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_nfl_standings",
            update_interval=timedelta(seconds=poll_interval),
        )

    async def async_load_cached_data(self) -> None:
        """Load the last successful normalized standings from storage."""
        stored = await self._store.async_load()
        if isinstance(stored, dict):
            self._last_good_data = stored
            self.data = stored

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch and normalize ESPN NFL standings."""
        now = dt_util.utcnow().isoformat()

        try:
            payload = await self._fetch_json()
            normalized = normalize_nfl_standings(
                payload,
                favorite_team=self._favorite_team(),
                week=self._scoreboard_week(),
                updated_at=now,
            )
            normalized["_sports_ticker_meta"] = {
                "stale": False,
                "source": "espn",
                "league": "nfl",
                "data_type": "standings",
                "endpoint": NFL_STANDINGS_URL,
                "last_successful_update": now,
                "last_attempted_update": now,
                "last_error": None,
            }
            self._last_good_data = normalized
            await self._store.async_save(normalized)
            return normalized
        except Exception as err:
            _LOGGER.warning(
                "Failed to update NFL standings. Keeping last good data if available. Error: %s",
                err,
            )

            if self._last_good_data:
                cached = copy.deepcopy(self._last_good_data)
                self._apply_current_favorite(cached)
                meta = dict(cached.get("_sports_ticker_meta", {}))
                meta.update(
                    {
                        "stale": True,
                        "source": "cache",
                        "last_attempted_update": now,
                        "last_error": str(err),
                    }
                )
                cached["_sports_ticker_meta"] = meta
                return cached

            return self._empty_data(now, str(err))

    async def _fetch_json(self) -> dict[str, Any]:
        """Fetch standings JSON from ESPN."""
        async with async_timeout.timeout(20):
            response = await self.session.get(NFL_STANDINGS_URL)
            if response.status != 200:
                raise aiohttp.ClientResponseError(
                    request_info=response.request_info,
                    history=response.history,
                    status=response.status,
                    message=f"Unexpected status {response.status}",
                    headers=response.headers,
                )
            payload = await response.json()

        if not isinstance(payload, dict):
            raise ValueError("ESPN NFL standings response was not a JSON object")
        if not isinstance(payload.get("children"), list):
            raise ValueError("ESPN NFL standings response did not contain conference groups")
        return payload

    def _favorite_team(self) -> str | None:
        """Return the selected NFL favorite team abbreviation."""
        opts = {**self.entry.data, **self.entry.options}
        favorite_teams = opts.get(CONF_FAVORITE_TEAMS, {})
        if not isinstance(favorite_teams, dict):
            return None
        favorite = favorite_teams.get("nfl")
        return str(favorite).strip().upper() if favorite else None

    def _apply_current_favorite(self, data: dict[str, Any]) -> None:
        """Refresh favorite-team flags on cached standings after option changes."""
        favorite = self._favorite_team()
        data["favorite_team"] = favorite

        conferences = data.get("conferences")
        if isinstance(conferences, dict):
            for rows in conferences.values():
                if not isinstance(rows, list):
                    continue
                for row in rows:
                    if isinstance(row, dict):
                        row["favorite"] = bool(
                            favorite and str(row.get("abbreviation") or "").upper() == favorite
                        )

        teams = data.get("teams")
        if isinstance(teams, list):
            for row in teams:
                if isinstance(row, dict):
                    row["favorite"] = bool(
                        favorite and str(row.get("abbreviation") or "").upper() == favorite
                    )

    def _scoreboard_week(self) -> int | None:
        """Reuse ESPN week metadata already fetched by the scoreboard coordinator."""
        data = self.scoreboard_coordinator.data or {}
        nfl = data.get("nfl", {}) if isinstance(data, dict) else {}
        if not isinstance(nfl, dict):
            return None

        week = nfl.get("week")
        if isinstance(week, dict):
            number = week.get("number")
            try:
                return int(number) if number is not None else None
            except (TypeError, ValueError):
                pass
        elif week is not None:
            try:
                return int(week)
            except (TypeError, ValueError):
                pass

        events = nfl.get("events", [])
        if isinstance(events, list):
            for event in events:
                if not isinstance(event, dict):
                    continue
                event_week = event.get("week")
                if isinstance(event_week, dict):
                    number = event_week.get("number")
                    try:
                        return int(number) if number is not None else None
                    except (TypeError, ValueError):
                        continue
        return None

    def _empty_data(self, now: str, error: str) -> dict[str, Any]:
        """Return a predictable empty shape when no cache is available."""
        return {
            "league": "nfl",
            "data_type": "standings",
            "season": None,
            "season_type": None,
            "season_type_name": None,
            "week": self._scoreboard_week(),
            "favorite_team": self._favorite_team(),
            "updated_at": None,
            "conferences": {"AFC": [], "NFC": []},
            "divisions": {},
            "teams": [],
            "playoff": {
                "seeds_per_conference": 7,
                "division_leader_seeds": 4,
                "cut_line_seed": 7,
                "source": "nfl_rule",
                "derived_helpers_apply": False,
            },
            "normalization": {
                "derived_fields": [
                    "division_leader",
                    "wildcard",
                    "in_playoffs",
                    "in_the_hunt",
                ],
                "espn_clincher_codes_preserved": True,
                "clinched_conference_inferred": False,
            },
            "_sports_ticker_meta": {
                "stale": True,
                "source": "cache",
                "league": "nfl",
                "data_type": "standings",
                "endpoint": NFL_STANDINGS_URL,
                "last_successful_update": None,
                "last_attempted_update": now,
                "last_error": error,
            },
        }


class ESPNNFLStandingsRaw(CoordinatorEntity[NFLStandingsCoordinator], SensorEntity):
    """Normalized NFL standings and playoff-picture sensor."""

    _attr_icon = "mdi:format-list-numbered"
    _attr_unique_id = "espn_nfl_standings_raw"
    _attr_name = "ESPN NFL Standings Raw"

    def __init__(self, coordinator: NFLStandingsCoordinator) -> None:
        """Initialize the standings sensor."""
        super().__init__(coordinator)

    @property
    def available(self) -> bool:
        """Remain available when fresh or cached normalized data exists."""
        return isinstance(self.coordinator.data, dict)

    @property
    def native_value(self) -> str:
        """Return a compact readable state."""
        data = self.coordinator.data or {}
        teams = data.get("teams", [])
        count = len(teams) if isinstance(teams, list) else 0

        if count == 0:
            return "No standings"

        meta = data.get("_sports_ticker_meta", {})
        if isinstance(meta, dict) and meta.get("stale"):
            return f"Cached - {count} teams"
        return f"{count} teams"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Expose normalized conference, division, and playoff data."""
        data = self.coordinator.data or {}
        meta = data.get("_sports_ticker_meta", {})
        if not isinstance(meta, dict):
            meta = {}

        return {
            "league": "nfl",
            "league_name": "NFL",
            "data_type": "standings",
            "season": data.get("season"),
            "season_type": data.get("season_type"),
            "season_type_name": data.get("season_type_name"),
            "week": data.get("week"),
            "favorite_team": data.get("favorite_team"),
            "updated_at": data.get("updated_at"),
            "conferences": data.get("conferences", {"AFC": [], "NFC": []}),
            "divisions": data.get("divisions", {}),
            "teams": data.get("teams", []),
            "playoff": data.get("playoff", {}),
            "normalization": data.get("normalization", {}),
            "stale": bool(meta.get("stale", False)),
            "source": meta.get("source"),
            "endpoint": meta.get("endpoint"),
            "last_successful_update": meta.get("last_successful_update"),
            "last_attempted_update": meta.get("last_attempted_update"),
            "last_error": meta.get("last_error"),
        }
