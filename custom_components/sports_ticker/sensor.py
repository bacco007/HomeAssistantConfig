from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    DOMAIN,
    CONF_LEAGUES,
    CONF_FAVORITE_TEAMS,
    LEAGUES,
    LEAGUE_LABELS,
    TEAM_OPTIONS,
    CONF_TICKER_SPEED,
    DEFAULT_TICKER_SPEED,
    CONF_TICKER_THEME,
    DEFAULT_TICKER_THEME,
)
from .coordinator import MLB_PLAYER_LEADERS_KEY, SportsTickerCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Sports Ticker sensors."""
    coordinator: SportsTickerCoordinator = hass.data[DOMAIN][entry.entry_id]

    leagues = entry.options.get(
        CONF_LEAGUES,
        entry.data.get(CONF_LEAGUES, ["mlb", "nfl"]),
    )

    if isinstance(leagues, str):
        leagues = [leagues]

    leagues = [
        str(league).strip().lower()
        for league in (leagues or [])
        if str(league).strip().lower() in LEAGUES
    ]

    entities: list[SensorEntity] = [
        ESPNRawScoreboard(coordinator, league)
        for league in leagues
    ]

    if "mlb" in leagues:
        entities.append(ESPNMLBPlayerLeaders(coordinator))

    async_add_entities(entities, update_before_add=True)


class ESPNRawScoreboard(CoordinatorEntity[SportsTickerCoordinator], SensorEntity):
    """Raw ESPN scoreboard sensor."""

    _attr_icon = "mdi:scoreboard-outline"

    def __init__(self, coordinator: SportsTickerCoordinator, league: str) -> None:
        """Initialize raw ESPN scoreboard sensor."""
        super().__init__(coordinator)

        self.league = league
        self.league_name = LEAGUE_LABELS.get(league, league.upper())

        self._attr_unique_id = f"espn_{league}_scoreboard_raw"
        self._attr_name = f"ESPN {self.league_name} Scoreboard Raw"

    @property
    def available(self) -> bool:
        """Keep the entity available when cached league data exists."""
        if not self.coordinator.data:
            return False

        league_data = self.coordinator.data.get(self.league)

        return isinstance(league_data, dict)

    @property
    def native_value(self) -> str:
        """Return a simple readable state."""
        if not self.coordinator.data:
            return "No data"

        data = self.coordinator.data.get(self.league, {})

        if not isinstance(data, dict):
            return "No data"

        events = data.get("events", [])
        if not isinstance(events, list):
            events = []

        meta = data.get("_sports_ticker_meta", {})
        if not isinstance(meta, dict):
            meta = {}

        if meta.get("stale"):
            return f"Cached - {len(events)} games"

        return f"{len(events)} games"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Expose ESPN payload, favorite team info, and ticker card helpers."""
        data = self.coordinator.data.get(self.league, {}) if self.coordinator.data else {}

        if not isinstance(data, dict):
            data = {}

        entry = self.coordinator.entry
        opts = {**entry.data, **entry.options}

        meta = data.get("_sports_ticker_meta", {})
        if not isinstance(meta, dict):
            meta = {}

        favorite_teams = opts.get(CONF_FAVORITE_TEAMS, {})
        if not isinstance(favorite_teams, dict):
            favorite_teams = {}

        favorite_team = favorite_teams.get(self.league)
        favorite_team_name = self._favorite_team_name(favorite_team)

        return {
            # League helpers
            "league": self.league,
            "league_name": self.league_name,

            # Favorite team helpers
            "favorite_team": favorite_team,
            "favorite_team_name": favorite_team_name,
            "has_favorite_team": bool(favorite_team),

            # Cache / freshness helpers
            "stale": bool(meta.get("stale", False)),
            "source": meta.get("source"),
            "last_successful_update": meta.get("last_successful_update"),
            "last_attempted_update": meta.get("last_attempted_update"),
            "last_error": meta.get("last_error"),

            # ESPN payload bits
            "events": data.get("events", []),
            "leagues": data.get("leagues"),
            "day": data.get("day"),
            "season": data.get("season"),
            "next": data.get("next"),

            # Card helpers
            "ticker_speed": int(opts.get(CONF_TICKER_SPEED, DEFAULT_TICKER_SPEED)),
            "ticker_theme": str(opts.get(CONF_TICKER_THEME, DEFAULT_TICKER_THEME)),
        }

    def _favorite_team_name(self, favorite_team: str | None) -> str | None:
        """Return readable favorite team name from configured team abbreviation."""
        if not favorite_team:
            return None

        for team in TEAM_OPTIONS.get(self.league, []):
            if team.get("value") == favorite_team:
                return team.get("label")

        return favorite_team


class ESPNMLBPlayerLeaders(CoordinatorEntity[SportsTickerCoordinator], SensorEntity):
    """Raw ESPN MLB player leaders sensor."""

    _attr_icon = "mdi:account-star-outline"
    _attr_unique_id = "espn_mlb_player_leaders_raw"
    _attr_name = "ESPN MLB Player Leaders Raw"

    def __init__(self, coordinator: SportsTickerCoordinator) -> None:
        """Initialize MLB player leaders sensor."""
        super().__init__(coordinator)

    @property
    def available(self) -> bool:
        """Keep the entity available when cached leaders data exists."""
        if not self.coordinator.data:
            return False

        data = self.coordinator.data.get(MLB_PLAYER_LEADERS_KEY)

        return isinstance(data, dict)

    @property
    def native_value(self) -> str:
        """Return a simple readable state."""
        if not self.coordinator.data:
            return "No data"

        data = self.coordinator.data.get(MLB_PLAYER_LEADERS_KEY, {})

        if not isinstance(data, dict):
            return "No data"

        categories = data.get("categories", {})
        if not isinstance(categories, dict):
            categories = {}

        meta = data.get("_sports_ticker_meta", {})
        if not isinstance(meta, dict):
            meta = {}

        if meta.get("stale"):
            return f"Cached - {len(categories)} categories"

        return f"{len(categories)} categories"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Expose MLB player leader categories."""
        data = self.coordinator.data.get(MLB_PLAYER_LEADERS_KEY, {}) if self.coordinator.data else {}

        if not isinstance(data, dict):
            data = {}

        meta = data.get("_sports_ticker_meta", {})
        if not isinstance(meta, dict):
            meta = {}

        categories = data.get("categories", {})
        if not isinstance(categories, dict):
            categories = {}

        return {
            "league": "mlb",
            "league_name": "MLB",
            "data_type": "player_leaders",
            "limit": data.get("limit"),
            "categories": categories,

            # Convenient top-level aliases for Lovelace cards
            "home_runs": categories.get("home_runs", {}).get("leaders", []),
            "rbi": categories.get("rbi", {}).get("leaders", []),
            "hits": categories.get("hits", {}).get("leaders", []),
            "stolen_bases": categories.get("stolen_bases", {}).get("leaders", []),
            "wins": categories.get("wins", {}).get("leaders", []),
            "era": categories.get("era", {}).get("leaders", []),
            "strikeouts": categories.get("strikeouts", {}).get("leaders", []),
            "saves": categories.get("saves", {}).get("leaders", []),

            # Cache / freshness helpers
            "stale": bool(meta.get("stale", False)),
            "source": meta.get("source"),
            "last_successful_update": meta.get("last_successful_update"),
            "last_attempted_update": meta.get("last_attempted_update"),
            "last_error": meta.get("last_error"),
        }
