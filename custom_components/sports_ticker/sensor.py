from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .cfb_rankings import CFBRankingsCoordinator, ESPNCFBRankings
from .const import DOMAIN, CONF_LEAGUES, CONF_FAVORITE_TEAMS, LEAGUES, LEAGUE_LABELS, TEAM_OPTIONS, CONF_TICKER_SPEED, DEFAULT_TICKER_SPEED, CONF_TICKER_THEME, DEFAULT_TICKER_THEME
from .coordinator import MLB_PLAYER_LEADERS_KEY, SportsTickerCoordinator
from .league_data import GENERIC_STANDINGS_LEAGUES, POSTSEASON_LEAGUES, TEAM_LEAGUES
from .mlb_standings import ESPNMLBStandingsRaw, MLBStandingsCoordinator
from .next_game import ESPNFavoriteTeamNextGame, FavoriteTeamScheduleCoordinator
from .nfl_standings import ESPNNFLStandingsRaw, NFLStandingsCoordinator
from .postseason import ESPNPostseason, PostseasonCoordinator
from .standings import ESPNLeagueStandingsRaw, LeagueStandingsCoordinator


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    """Set up Sports Ticker sensors."""
    coordinator: SportsTickerCoordinator = hass.data[DOMAIN][entry.entry_id]
    leagues = entry.options.get(CONF_LEAGUES, entry.data.get(CONF_LEAGUES, ["mlb", "nfl"]))
    if isinstance(leagues, str): leagues = [leagues]
    leagues = [str(league).strip().lower() for league in (leagues or []) if str(league).strip().lower() in LEAGUES]
    entities: list[SensorEntity] = [ESPNRawScoreboard(coordinator, league) for league in leagues]

    for league in leagues:
        if league not in TEAM_LEAGUES: continue
        next_game_coordinator = FavoriteTeamScheduleCoordinator(hass, entry, league)
        await next_game_coordinator.async_config_entry_first_refresh()
        entities.append(ESPNFavoriteTeamNextGame(next_game_coordinator))

    if "nfl" in leagues:
        standings_coordinator = NFLStandingsCoordinator(hass, entry, coordinator)
        await standings_coordinator.async_load_cached_data(); await standings_coordinator.async_config_entry_first_refresh(); entities.append(ESPNNFLStandingsRaw(standings_coordinator))

    if "mlb" in leagues:
        mlb_standings_coordinator = MLBStandingsCoordinator(hass, entry)
        await mlb_standings_coordinator.async_load_cached_data(); await mlb_standings_coordinator.async_config_entry_first_refresh(); entities.append(ESPNMLBStandingsRaw(mlb_standings_coordinator)); entities.append(ESPNMLBPlayerLeaders(coordinator))

    for league in leagues:
        if league not in GENERIC_STANDINGS_LEAGUES: continue
        league_standings = LeagueStandingsCoordinator(hass, entry, league)
        await league_standings.async_load_cached_data(); await league_standings.async_config_entry_first_refresh(); entities.append(ESPNLeagueStandingsRaw(league_standings))

    if "cfb" in leagues:
        rankings_coordinator = CFBRankingsCoordinator(hass, entry)
        await rankings_coordinator.async_load_cached_data(); await rankings_coordinator.async_config_entry_first_refresh(); entities.append(ESPNCFBRankings(rankings_coordinator))

    for league in leagues:
        if league not in POSTSEASON_LEAGUES: continue
        postseason_coordinator = PostseasonCoordinator(hass, entry, league, coordinator)
        await postseason_coordinator.async_load_cached_data(); await postseason_coordinator.async_config_entry_first_refresh(); entities.append(ESPNPostseason(postseason_coordinator))

    async_add_entities(entities, update_before_add=True)


class ESPNRawScoreboard(CoordinatorEntity[SportsTickerCoordinator], SensorEntity):
    """Raw ESPN scoreboard sensor."""
    _attr_icon = "mdi:scoreboard-outline"

    def __init__(self, coordinator: SportsTickerCoordinator, league: str) -> None:
        super().__init__(coordinator); self.league = league; self.league_name = LEAGUE_LABELS.get(league, league.upper()); self._attr_unique_id = f"espn_{league}_scoreboard_raw"; self._attr_name = f"ESPN {self.league_name} Scoreboard Raw"

    @property
    def available(self) -> bool:
        return bool(self.coordinator.data) and isinstance(self.coordinator.data.get(self.league), dict)

    @property
    def native_value(self) -> str:
        if not self.coordinator.data: return "No data"
        data = self.coordinator.data.get(self.league, {})
        if not isinstance(data, dict): return "No data"
        events = data.get("events", []) if isinstance(data.get("events"), list) else []; meta = data.get("_sports_ticker_meta", {})
        return f"Cached - {len(events)} games" if isinstance(meta, dict) and meta.get("stale") else f"{len(events)} games"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data.get(self.league, {}) if self.coordinator.data else {}
        if not isinstance(data, dict): data = {}
        opts = {**self.coordinator.entry.data, **self.coordinator.entry.options}; meta = data.get("_sports_ticker_meta", {})
        if not isinstance(meta, dict): meta = {}
        favorite_teams = opts.get(CONF_FAVORITE_TEAMS, {})
        if not isinstance(favorite_teams, dict): favorite_teams = {}
        favorite_team = favorite_teams.get(self.league)
        return {"league": self.league, "league_name": self.league_name, "favorite_team": favorite_team, "favorite_team_name": self._favorite_team_name(favorite_team), "has_favorite_team": bool(favorite_team), "stale": bool(meta.get("stale", False)), "source": meta.get("source"), "last_successful_update": meta.get("last_successful_update"), "last_attempted_update": meta.get("last_attempted_update"), "last_error": meta.get("last_error"), "events": data.get("events", []), "leagues": data.get("leagues"), "day": data.get("day"), "season": data.get("season"), "next": data.get("next"), "ticker_speed": int(opts.get(CONF_TICKER_SPEED, DEFAULT_TICKER_SPEED)), "ticker_theme": str(opts.get(CONF_TICKER_THEME, DEFAULT_TICKER_THEME))}

    def _favorite_team_name(self, favorite_team: str | None) -> str | None:
        if not favorite_team: return None
        for team in TEAM_OPTIONS.get(self.league, []):
            if team.get("value") == favorite_team: return team.get("label")
        return favorite_team


class ESPNMLBPlayerLeaders(CoordinatorEntity[SportsTickerCoordinator], SensorEntity):
    """Raw ESPN MLB player leaders sensor."""
    _attr_icon = "mdi:account-star-outline"; _attr_unique_id = "espn_mlb_player_leaders_raw"; _attr_name = "ESPN MLB Player Leaders Raw"

    def __init__(self, coordinator: SportsTickerCoordinator) -> None: super().__init__(coordinator)

    @property
    def available(self) -> bool: return bool(self.coordinator.data) and isinstance(self.coordinator.data.get(MLB_PLAYER_LEADERS_KEY), dict)

    @property
    def native_value(self) -> str:
        if not self.coordinator.data: return "No data"
        data = self.coordinator.data.get(MLB_PLAYER_LEADERS_KEY, {})
        if not isinstance(data, dict): return "No data"
        categories = data.get("categories", {}) if isinstance(data.get("categories"), dict) else {}; meta = data.get("_sports_ticker_meta", {})
        return f"Cached - {len(categories)} categories" if isinstance(meta, dict) and meta.get("stale") else f"{len(categories)} categories"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data.get(MLB_PLAYER_LEADERS_KEY, {}) if self.coordinator.data else {}
        if not isinstance(data, dict): data = {}
        meta = data.get("_sports_ticker_meta", {}) if isinstance(data.get("_sports_ticker_meta"), dict) else {}; categories = data.get("categories", {}) if isinstance(data.get("categories"), dict) else {}
        return {"league": "mlb", "league_name": "MLB", "data_type": "player_leaders", "limit": data.get("limit"), "categories": categories, "home_runs": categories.get("home_runs", {}).get("leaders", []), "rbi": categories.get("rbi", {}).get("leaders", []), "hits": categories.get("hits", {}).get("leaders", []), "stolen_bases": categories.get("stolen_bases", {}).get("leaders", []), "wins": categories.get("wins", {}).get("leaders", []), "era": categories.get("era", {}).get("leaders", []), "strikeouts": categories.get("strikeouts", {}).get("leaders", []), "saves": categories.get("saves", {}).get("leaders", []), "stale": bool(meta.get("stale", False)), "source": meta.get("source"), "last_successful_update": meta.get("last_successful_update"), "last_attempted_update": meta.get("last_attempted_update"), "last_error": meta.get("last_error")}
