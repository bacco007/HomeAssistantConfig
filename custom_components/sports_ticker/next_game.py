from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

import async_timeout

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import CoordinatorEntity, DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import (
    CONF_FAVORITE_TEAMS,
    CONF_POLL_INTERVAL,
    DEFAULT_POLL_INTERVAL,
    TEAM_OPTIONS,
)

_LOGGER = logging.getLogger(__name__)

NFL_TEAM_SCHEDULE_URL = (
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{team}/schedule"
)


class NFLNextGameCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Fetch the selected favorite NFL team's schedule."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the favorite-team schedule coordinator."""
        self.entry = entry
        self.session = async_get_clientsession(hass)
        self._last_good_data: dict[str, Any] | None = None

        raw_interval = entry.options.get(
            CONF_POLL_INTERVAL,
            entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
        )
        try:
            poll_interval = int(raw_interval)
        except (TypeError, ValueError):
            poll_interval = DEFAULT_POLL_INTERVAL

        super().__init__(
            hass,
            _LOGGER,
            name="sports_ticker_nfl_next_game",
            update_interval=timedelta(seconds=max(15, min(poll_interval, 600))),
        )

    @property
    def favorite_team(self) -> str | None:
        """Return the currently selected NFL favorite abbreviation."""
        opts = {**self.entry.data, **self.entry.options}
        favorite_teams = opts.get(CONF_FAVORITE_TEAMS, {})

        if not isinstance(favorite_teams, dict):
            return None

        favorite = favorite_teams.get("nfl")
        if not favorite:
            return None

        return str(favorite).strip().upper() or None

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch the favorite team's schedule and select its next game."""
        favorite = self.favorite_team
        now = dt_util.utcnow().isoformat()

        if not favorite:
            return {
                "favorite_team": None,
                "event": None,
                "_sports_ticker_meta": {
                    "stale": False,
                    "source": "config",
                    "last_successful_update": now,
                    "last_attempted_update": now,
                    "last_error": None,
                },
            }

        url = NFL_TEAM_SCHEDULE_URL.format(team=favorite.lower())

        try:
            async with async_timeout.timeout(20):
                async with self.session.get(url) as response:
                    if response.status != 200:
                        raise ValueError(f"ESPN returned HTTP {response.status}")

                    payload = await response.json()

            if not isinstance(payload, dict):
                raise ValueError("ESPN team schedule was not a JSON object")

            events = payload.get("events", [])
            if not isinstance(events, list):
                raise ValueError("ESPN team schedule did not contain an events list")

            event = self._find_next_event(events, favorite)
            data = {
                "favorite_team": favorite,
                "event": event,
                "_sports_ticker_meta": {
                    "stale": False,
                    "source": "espn",
                    "last_successful_update": now,
                    "last_attempted_update": now,
                    "last_error": None,
                },
            }
            self._last_good_data = data
            return data

        except Exception as err:
            _LOGGER.warning(
                "Failed to update next NFL game for %s. Error: %s",
                favorite,
                err,
            )

            if (
                isinstance(self._last_good_data, dict)
                and self._last_good_data.get("favorite_team") == favorite
            ):
                cached = dict(self._last_good_data)
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

            return {
                "favorite_team": favorite,
                "event": None,
                "_sports_ticker_meta": {
                    "stale": True,
                    "source": "espn",
                    "last_successful_update": None,
                    "last_attempted_update": now,
                    "last_error": str(err),
                },
            }

    @staticmethod
    def _find_next_event(
        events: list[Any],
        favorite: str,
    ) -> dict[str, Any] | None:
        """Return the earliest future pre-game event involving the favorite team."""
        now = dt_util.utcnow()
        candidates: list[tuple[Any, dict[str, Any]]] = []

        for event in events:
            if not isinstance(event, dict):
                continue

            competition = NFLNextGameCoordinator._competition(event)
            if not competition:
                continue

            competitors = competition.get("competitors", [])
            if not isinstance(competitors, list):
                continue

            abbreviations = {
                str(team.get("team", {}).get("abbreviation", "")).upper()
                for team in competitors
                if isinstance(team, dict) and isinstance(team.get("team"), dict)
            }
            if favorite not in abbreviations:
                continue

            status = competition.get("status") or event.get("status") or {}
            status_type = status.get("type", {}) if isinstance(status, dict) else {}
            state = status_type.get("state") if isinstance(status_type, dict) else None
            if state and state != "pre":
                continue

            raw_date = competition.get("date") or event.get("date")
            if not raw_date:
                continue

            start = dt_util.parse_datetime(str(raw_date))
            if start is None:
                continue

            start = dt_util.as_utc(start)
            if start <= now:
                continue

            candidates.append((start, event))

        if not candidates:
            return None

        candidates.sort(key=lambda item: item[0])
        return candidates[0][1]

    @staticmethod
    def _competition(event: dict[str, Any]) -> dict[str, Any]:
        """Return an event's primary competition."""
        competitions = event.get("competitions", [])
        if not isinstance(competitions, list) or not competitions:
            return {}

        competition = competitions[0]
        return competition if isinstance(competition, dict) else {}


class ESPNNFLNextGame(CoordinatorEntity[NFLNextGameCoordinator], SensorEntity):
    """Next scheduled game for the selected favorite NFL team."""

    _attr_icon = "mdi:calendar-clock"
    _attr_unique_id = "espn_nfl_next_game"
    _attr_name = "ESPN NFL Next Game"

    @property
    def native_value(self) -> str:
        """Return a compact matchup as the sensor state."""
        data = self.coordinator.data or {}
        favorite = data.get("favorite_team")

        if not favorite:
            return "No favorite team"

        event = data.get("event")
        if not isinstance(event, dict):
            return "No upcoming game"

        away, home = self._teams(event)
        away_abbr = self._team_abbreviation(away) or "AWAY"
        home_abbr = self._team_abbreviation(home) or "HOME"
        return f"{away_abbr} @ {home_abbr}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Expose next-game details for cards and automations."""
        data = self.coordinator.data or {}
        favorite = data.get("favorite_team")
        event = data.get("event")
        meta = data.get("_sports_ticker_meta", {})

        if not isinstance(meta, dict):
            meta = {}

        attrs: dict[str, Any] = {
            "league": "nfl",
            "favorite_team": favorite,
            "favorite_team_name": self._favorite_team_name(favorite),
            "has_upcoming_game": isinstance(event, dict),
            "stale": bool(meta.get("stale", False)),
            "source": meta.get("source"),
            "last_successful_update": meta.get("last_successful_update"),
            "last_attempted_update": meta.get("last_attempted_update"),
            "last_error": meta.get("last_error"),
        }

        if not isinstance(event, dict):
            return attrs

        competition = NFLNextGameCoordinator._competition(event)
        away, home = self._teams(event)

        away_abbr = self._team_abbreviation(away)
        home_abbr = self._team_abbreviation(home)
        favorite_side = self._favorite_side(favorite, away, home)
        opponent = home if favorite_side == "away" else away if favorite_side == "home" else {}

        status = competition.get("status") or event.get("status") or {}
        status_type = status.get("type", {}) if isinstance(status, dict) else {}

        venue = competition.get("venue", {})
        if not isinstance(venue, dict):
            venue = {}
        address = venue.get("address", {})
        if not isinstance(address, dict):
            address = {}

        broadcasts = competition.get("broadcasts", [])
        networks: list[str] = []
        if isinstance(broadcasts, list):
            for broadcast in broadcasts:
                if not isinstance(broadcast, dict):
                    continue
                names = broadcast.get("names", [])
                if isinstance(names, list):
                    networks.extend(str(name) for name in names if name)

        season = event.get("season", {})
        if not isinstance(season, dict):
            season = {}
        week = event.get("week", {})
        if not isinstance(week, dict):
            week = {}

        attrs.update(
            {
                "event_id": event.get("id"),
                "event_name": event.get("name"),
                "short_name": event.get("shortName"),
                "date": competition.get("date") or event.get("date"),
                "matchup": (
                    f"{away_abbr} @ {home_abbr}"
                    if away_abbr and home_abbr
                    else event.get("shortName") or event.get("name")
                ),
                "home_team": home_abbr,
                "home_team_name": self._team_name(home),
                "home_team_logo": self._team_logo(home),
                "away_team": away_abbr,
                "away_team_name": self._team_name(away),
                "away_team_logo": self._team_logo(away),
                "home_away": favorite_side,
                "opponent": self._team_abbreviation(opponent),
                "opponent_name": self._team_name(opponent),
                "opponent_logo": self._team_logo(opponent),
                "venue": venue.get("fullName"),
                "venue_city": address.get("city"),
                "venue_state": address.get("state"),
                "broadcasts": networks,
                "status": status_type.get("state") if isinstance(status_type, dict) else None,
                "status_detail": (
                    (status_type.get("shortDetail") or status_type.get("detail"))
                    if isinstance(status_type, dict)
                    else None
                ),
                "season_year": season.get("year"),
                "season_type": season.get("type") or season.get("slug"),
                "week": week.get("number"),
                "event": event,
            }
        )
        return attrs

    @staticmethod
    def _teams(event: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
        """Return away and home competitor objects."""
        competition = NFLNextGameCoordinator._competition(event)
        competitors = competition.get("competitors", [])

        away: dict[str, Any] = {}
        home: dict[str, Any] = {}

        if isinstance(competitors, list):
            for competitor in competitors:
                if not isinstance(competitor, dict):
                    continue
                if competitor.get("homeAway") == "away":
                    away = competitor
                elif competitor.get("homeAway") == "home":
                    home = competitor

        return away, home

    @staticmethod
    def _team_abbreviation(competitor: dict[str, Any]) -> str | None:
        team = competitor.get("team", {}) if isinstance(competitor, dict) else {}
        if not isinstance(team, dict):
            return None
        value = team.get("abbreviation")
        return str(value).upper() if value else None

    @staticmethod
    def _team_name(competitor: dict[str, Any]) -> str | None:
        team = competitor.get("team", {}) if isinstance(competitor, dict) else {}
        if not isinstance(team, dict):
            return None
        return team.get("displayName") or team.get("shortDisplayName") or team.get("name")

    @staticmethod
    def _team_logo(competitor: dict[str, Any]) -> str | None:
        team = competitor.get("team", {}) if isinstance(competitor, dict) else {}
        if not isinstance(team, dict):
            return None
        return team.get("logo")

    @staticmethod
    def _favorite_side(
        favorite: str | None,
        away: dict[str, Any],
        home: dict[str, Any],
    ) -> str | None:
        if not favorite:
            return None
        if ESPNNFLNextGame._team_abbreviation(away) == favorite:
            return "away"
        if ESPNNFLNextGame._team_abbreviation(home) == favorite:
            return "home"
        return None

    @staticmethod
    def _favorite_team_name(favorite: str | None) -> str | None:
        if not favorite:
            return None

        for team in TEAM_OPTIONS.get("nfl", []):
            if team.get("value") == favorite:
                return team.get("label")

        return favorite
