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

from .const import CONF_FAVORITE_TEAMS, CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL, TEAM_OPTIONS
from .league_data import TEAM_LEAGUES, league_profile, site_resource_url
from .team_schedule import current_streak, normalize_recent_games, normalize_upcoming_games, recent_form, recent_record

_LOGGER = logging.getLogger(__name__)
FOOTBALL_LEAGUES = {league: {"espn_slug": TEAM_LEAGUES[league]["espn_slug"], "label": TEAM_LEAGUES[league]["label"]} for league in ("nfl", "cfb")}
TEAM_SCHEDULE_URL = "https://site.api.espn.com/apis/site/v2/sports/football/{espn_slug}/teams/{team}/schedule"


class FavoriteTeamScheduleCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Fetch the selected favorite team's ESPN schedule for any team league."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, league: str) -> None:
        self.entry = entry
        self.league = str(league).strip().lower()
        self.profile = league_profile(self.league)
        self.league_label = str(self.profile["label"])
        self.session = async_get_clientsession(hass)
        self._last_good_data: dict[str, Any] | None = None
        self._resolved_team_ids: dict[str, str] = {}
        raw_interval = entry.options.get(CONF_POLL_INTERVAL, entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL))
        try: poll_interval = int(raw_interval)
        except (TypeError, ValueError): poll_interval = DEFAULT_POLL_INTERVAL
        super().__init__(hass, _LOGGER, name=f"sports_ticker_{self.league}_next_game", update_interval=timedelta(seconds=max(15, min(poll_interval, 600))))

    @property
    def favorite_team(self) -> str | None:
        opts = {**self.entry.data, **self.entry.options}; favorites = opts.get(CONF_FAVORITE_TEAMS, {})
        if not isinstance(favorites, dict): return None
        favorite = favorites.get(self.league); return str(favorite).strip().upper() if favorite else None

    async def _async_update_data(self) -> dict[str, Any]:
        favorite = self.favorite_team; now = dt_util.utcnow().isoformat()
        if not favorite: return self._empty(None, now, stale=False, source="config")
        try:
            payload, endpoint = await self._fetch_schedule(favorite); events = payload.get("events", [])
            if not isinstance(events, list): raise ValueError("ESPN team schedule did not contain an events list")
            event = self._find_next_event(events, favorite); recent_games = normalize_recent_games(events, favorite, limit=10); upcoming_games = normalize_upcoming_games(events, favorite, limit=5)
            data = {"favorite_team": favorite, "event": event, "upcoming_games": upcoming_games, "recent_games": recent_games[:5], "recent_form": recent_form(recent_games[:5]), "recent_record": recent_record(recent_games[:5]), "last_10_record": recent_record(recent_games[:10]), "current_streak": current_streak(recent_games), "_sports_ticker_meta": {"stale": False, "source": "espn", "endpoint": endpoint, "last_successful_update": now, "last_attempted_update": now, "last_error": None}}
            self._last_good_data = data; return data
        except Exception as err:
            _LOGGER.warning("Failed to update next %s game for %s. Error: %s", self.league_label, favorite, err)
            if isinstance(self._last_good_data, dict) and self._last_good_data.get("favorite_team") == favorite:
                cached = dict(self._last_good_data); meta = dict(cached.get("_sports_ticker_meta", {})); meta.update({"stale": True, "source": "cache", "last_attempted_update": now, "last_error": str(err)}); cached["_sports_ticker_meta"] = meta; return cached
            return self._empty(favorite, now, stale=True, source="espn", error=str(err))

    async def _fetch_schedule(self, favorite: str) -> tuple[dict[str, Any], str]:
        direct_url = site_resource_url(self.league, f"teams/{favorite.lower()}/schedule")
        payload = await self._try_json(direct_url)
        if isinstance(payload, dict) and isinstance(payload.get("events"), list): return payload, direct_url
        team_id = await self._resolve_team_id(favorite)
        if not team_id: raise ValueError(f"Could not resolve ESPN team id for {favorite}")
        url = site_resource_url(self.league, f"teams/{team_id}/schedule"); payload = await self._try_json(url, required=True)
        if not isinstance(payload, dict): raise ValueError("ESPN team schedule was not a JSON object")
        return payload, url

    async def _try_json(self, url: str, *, required: bool = False) -> dict[str, Any] | None:
        async with async_timeout.timeout(20):
            async with self.session.get(url) as response:
                if response.status != 200:
                    if required: raise ValueError(f"ESPN returned HTTP {response.status}")
                    return None
                payload = await response.json()
        return payload if isinstance(payload, dict) else None

    async def _resolve_team_id(self, favorite: str) -> str | None:
        if favorite in self._resolved_team_ids: return self._resolved_team_ids[favorite]
        payload = await self._try_json(site_resource_url(self.league, "teams"), required=True)
        for team in self._team_catalog(payload):
            if str(team.get("abbreviation") or "").strip().upper() != favorite: continue
            team_id = team.get("id")
            if team_id not in (None, ""):
                value = str(team_id); self._resolved_team_ids[favorite] = value; return value
        return None

    @staticmethod
    def _team_catalog(payload: dict[str, Any] | None) -> list[dict[str, Any]]:
        if not isinstance(payload, dict): return []
        result: list[dict[str, Any]] = []; sports = payload.get("sports")
        if not isinstance(sports, list): return result
        for sport in sports:
            leagues = sport.get("leagues") if isinstance(sport, dict) else None
            if not isinstance(leagues, list): continue
            for league in leagues:
                teams = league.get("teams") if isinstance(league, dict) else None
                if not isinstance(teams, list): continue
                for wrapper in teams:
                    if not isinstance(wrapper, dict): continue
                    team = wrapper.get("team") if isinstance(wrapper.get("team"), dict) else wrapper
                    if isinstance(team, dict): result.append(team)
        return result

    @staticmethod
    def _find_next_event(events: list[Any], favorite: str) -> dict[str, Any] | None:
        now = dt_util.utcnow(); candidates: list[tuple[Any, dict[str, Any]]] = []
        for event in events:
            if not isinstance(event, dict): continue
            competition = FavoriteTeamScheduleCoordinator._competition(event)
            if not competition: continue
            competitors = competition.get("competitors", [])
            if not isinstance(competitors, list): continue
            abbreviations = {str(team.get("team", {}).get("abbreviation", "")).upper() for team in competitors if isinstance(team, dict) and isinstance(team.get("team"), dict)}
            if favorite not in abbreviations: continue
            status = competition.get("status") or event.get("status") or {}; status_type = status.get("type", {}) if isinstance(status, dict) else {}; state = status_type.get("state") if isinstance(status_type, dict) else None
            if state and state != "pre": continue
            raw_date = competition.get("date") or event.get("date")
            if not raw_date: continue
            start = dt_util.parse_datetime(str(raw_date))
            if start is None: continue
            start = dt_util.as_utc(start)
            if start <= now: continue
            candidates.append((start, event))
        if not candidates: return None
        candidates.sort(key=lambda item: item[0]); return candidates[0][1]

    @staticmethod
    def _competition(event: dict[str, Any]) -> dict[str, Any]:
        competitions = event.get("competitions", [])
        if not isinstance(competitions, list) or not competitions: return {}
        competition = competitions[0]; return competition if isinstance(competition, dict) else {}

    def _empty(self, favorite: str | None, now: str, *, stale: bool, source: str, error: str | None = None) -> dict[str, Any]:
        return {"favorite_team": favorite, "event": None, "upcoming_games": [], "recent_games": [], "recent_form": None, "recent_record": None, "last_10_record": None, "current_streak": None, "_sports_ticker_meta": {"stale": stale, "source": source, "endpoint": None, "last_successful_update": now if not stale else None, "last_attempted_update": now, "last_error": error}}


class ESPNFavoriteTeamNextGame(CoordinatorEntity[FavoriteTeamScheduleCoordinator], SensorEntity):
    """Next scheduled game and form for a configured favorite team."""
    _attr_icon = "mdi:calendar-clock"

    def __init__(self, coordinator: FavoriteTeamScheduleCoordinator) -> None:
        super().__init__(coordinator); self.league = coordinator.league; self.league_label = coordinator.league_label; self._attr_unique_id = f"espn_{self.league}_next_game"; self._attr_name = f"ESPN {self.league_label} Next Game"

    @property
    def native_value(self) -> str:
        data = self.coordinator.data or {}; favorite = data.get("favorite_team")
        if not favorite: return "No favorite team"
        event = data.get("event")
        if not isinstance(event, dict): return "No upcoming game"
        away, home = self._teams(event); return f"{self._team_abbreviation(away) or 'AWAY'} @ {self._team_abbreviation(home) or 'HOME'}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}; favorite = data.get("favorite_team"); event = data.get("event"); meta = data.get("_sports_ticker_meta", {})
        if not isinstance(meta, dict): meta = {}
        attrs: dict[str, Any] = {"league": self.league, "league_name": self.league_label, "favorite_team": favorite, "favorite_team_name": self._favorite_team_name(favorite), "has_upcoming_game": isinstance(event, dict), "upcoming_games": data.get("upcoming_games", []), "next_five": data.get("upcoming_games", []), "recent_games": data.get("recent_games", []), "last_five": data.get("recent_games", []), "recent_form": data.get("recent_form"), "record_last_5": data.get("recent_record"), "record_last_10": data.get("last_10_record"), "current_streak": data.get("current_streak"), "stale": bool(meta.get("stale", False)), "source": meta.get("source"), "endpoint": meta.get("endpoint"), "last_successful_update": meta.get("last_successful_update"), "last_attempted_update": meta.get("last_attempted_update"), "last_error": meta.get("last_error")}
        if not isinstance(event, dict): return attrs
        competition = FavoriteTeamScheduleCoordinator._competition(event); away, home = self._teams(event); away_abbr, home_abbr = self._team_abbreviation(away), self._team_abbreviation(home); favorite_side = self._favorite_side(favorite, away, home); opponent = home if favorite_side == "away" else away if favorite_side == "home" else {}; favorite_competitor = away if favorite_side == "away" else home if favorite_side == "home" else {}
        status = competition.get("status") or event.get("status") or {}; status_type = status.get("type", {}) if isinstance(status, dict) else {}; venue = competition.get("venue", {}) if isinstance(competition.get("venue"), dict) else {}; address = venue.get("address", {}) if isinstance(venue.get("address"), dict) else {}
        networks: list[str] = []
        for broadcast in competition.get("broadcasts", []) if isinstance(competition.get("broadcasts"), list) else []:
            if isinstance(broadcast, dict) and isinstance(broadcast.get("names"), list): networks.extend(str(name) for name in broadcast["names"] if name)
        season = event.get("season", {}) if isinstance(event.get("season"), dict) else {}; week = event.get("week", {}) if isinstance(event.get("week"), dict) else {}; notes = []
        for note in competition.get("notes", []) if isinstance(competition.get("notes"), list) else []:
            if isinstance(note, dict) and (note.get("headline") or note.get("text")): notes.append(str(note.get("headline") or note.get("text")))
        attrs.update({"event_id": event.get("id"), "event_name": event.get("name"), "short_name": event.get("shortName"), "date": competition.get("date") or event.get("date"), "matchup": f"{away_abbr} @ {home_abbr}" if away_abbr and home_abbr else event.get("shortName") or event.get("name"), "home_team": home_abbr, "home_team_name": self._team_name(home), "home_team_logo": self._team_logo(home), "home_team_record": self._team_record(home), "home_team_rank": self._team_rank(home), "away_team": away_abbr, "away_team_name": self._team_name(away), "away_team_logo": self._team_logo(away), "away_team_record": self._team_record(away), "away_team_rank": self._team_rank(away), "home_away": favorite_side, "favorite_team_record": self._team_record(favorite_competitor), "favorite_team_rank": self._team_rank(favorite_competitor), "opponent": self._team_abbreviation(opponent), "opponent_name": self._team_name(opponent), "opponent_logo": self._team_logo(opponent), "opponent_record": self._team_record(opponent), "opponent_rank": self._team_rank(opponent), "venue": venue.get("fullName"), "venue_city": address.get("city"), "venue_state": address.get("state"), "neutral_site": competition.get("neutralSite"), "conference_competition": competition.get("conferenceCompetition"), "broadcasts": list(dict.fromkeys(networks)), "notes": notes, "status": status_type.get("state") if isinstance(status_type, dict) else None, "status_detail": (status_type.get("shortDetail") or status_type.get("detail")) if isinstance(status_type, dict) else None, "season_year": season.get("year"), "season_type": season.get("type") or season.get("slug"), "week": week.get("number"), "event": event})
        return attrs

    @staticmethod
    def _teams(event: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
        competition = FavoriteTeamScheduleCoordinator._competition(event); away: dict[str, Any] = {}; home: dict[str, Any] = {}
        for competitor in competition.get("competitors", []) if isinstance(competition.get("competitors"), list) else []:
            if not isinstance(competitor, dict): continue
            if competitor.get("homeAway") == "away": away = competitor
            elif competitor.get("homeAway") == "home": home = competitor
        return away, home
    @staticmethod
    def _team_abbreviation(competitor: dict[str, Any]) -> str | None:
        team = competitor.get("team", {}) if isinstance(competitor, dict) else {}; value = team.get("abbreviation") if isinstance(team, dict) else None; return str(value).upper() if value else None
    @staticmethod
    def _team_name(competitor: dict[str, Any]) -> str | None:
        team = competitor.get("team", {}) if isinstance(competitor, dict) else {}; return team.get("displayName") or team.get("shortDisplayName") or team.get("name") if isinstance(team, dict) else None
    @staticmethod
    def _team_logo(competitor: dict[str, Any]) -> str | None:
        team = competitor.get("team", {}) if isinstance(competitor, dict) else {}
        if not isinstance(team, dict): return None
        if team.get("logo"): return str(team["logo"])
        for item in team.get("logos", []) if isinstance(team.get("logos"), list) else []:
            if isinstance(item, dict) and (item.get("href") or item.get("url")): return str(item.get("href") or item.get("url"))
        return None
    @staticmethod
    def _team_record(competitor: dict[str, Any]) -> str | None:
        records = competitor.get("records") if isinstance(competitor, dict) else None
        if isinstance(records, list):
            for record in records:
                if isinstance(record, dict) and (record.get("summary") or record.get("displayValue")): return str(record.get("summary") or record.get("displayValue"))
        record = competitor.get("record") if isinstance(competitor, dict) else None; return str(record) if record else None
    @staticmethod
    def _team_rank(competitor: dict[str, Any]) -> int | None:
        value = competitor.get("curatedRank") if isinstance(competitor, dict) else None
        if isinstance(value, dict): value = value.get("current")
        try: rank = int(value); return rank if rank > 0 else None
        except (TypeError, ValueError): return None
    @staticmethod
    def _favorite_side(favorite: str | None, away: dict[str, Any], home: dict[str, Any]) -> str | None:
        if not favorite: return None
        if ESPNFavoriteTeamNextGame._team_abbreviation(away) == favorite: return "away"
        if ESPNFavoriteTeamNextGame._team_abbreviation(home) == favorite: return "home"
        return None
    def _favorite_team_name(self, favorite: str | None) -> str | None:
        if not favorite: return None
        for team in TEAM_OPTIONS.get(self.league, []):
            if team.get("value") == favorite: return team.get("label")
        return favorite


FootballNextGameCoordinator = FavoriteTeamScheduleCoordinator
ESPNFootballNextGame = ESPNFavoriteTeamNextGame
