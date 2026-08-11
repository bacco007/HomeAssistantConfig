"""Football Hub sensors backed by the shared engine."""

from __future__ import annotations

from datetime import datetime, timezone
import re

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from ..competitions import COMPETITIONS, SEASONS
from ..const import DOMAIN
from ..engine.helpers import clean_fixture, fixture_timestamp, limit_items

ATTRIBUTE_LIMIT = 5


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities):
    """Set up Football Hub sensors."""
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    entities = [
            FootballHubStatusSensor(coordinator, entry),
            FootballHubLiveSensor(coordinator, entry),
            FootballHubLiveMatchSensor(coordinator, entry),
            FootballHubNextFixtureSensor(coordinator, entry),
            FootballHubMatchesTodaySensor(coordinator, entry),
            FootballHubThisWeekSensor(coordinator, entry),
            FootballHubFixturesSensor(coordinator, entry),
            FootballHubLastResultSensor(coordinator, entry),
            FootballHubResultsSensor(coordinator, entry),
            FootballHubStandingsSensor(coordinator, entry),
            FootballHubTopScorersSensor(coordinator, entry),
            FootballHubTopAssistsSensor(coordinator, entry),
            FootballHubPlayerLeaderboardSensor(coordinator, entry, "top_yellow_cards", "Top Yellow Cards"),
            FootballHubPlayerLeaderboardSensor(coordinator, entry, "top_red_cards", "Top Red Cards"),
            FootballHubPlayerLeaderboardSensor(coordinator, entry, "top_ratings", "Top Ratings"),
            FootballHubPlayerLeaderboardSensor(coordinator, entry, "top_appearances", "Top Appearances"),
            FootballHubPlayerLeaderboardSensor(coordinator, entry, "top_minutes", "Top Minutes Played"),
            FootballHubCupCentreSensor(coordinator, entry),
            FootballHubPortalDataSensor(coordinator, entry, "news", "News"),
            FootballHubPortalDataSensor(coordinator, entry, "tv_guide", "TV Guide"),
            FootballHubTransferMarketSensor(coordinator, entry),
            FootballHubCompetitionCatalogueSensor(coordinator, entry),
            FootballHubClubDataSensor(coordinator, entry, "club_profile", "My Club Profile"),
            FootballHubClubDataSensor(coordinator, entry, "club_statistics", "My Club Statistics"),
            FootballHubClubDataSensor(coordinator, entry, "club_squad", "My Club Squad"),
            FootballHubClubDataSensor(coordinator, entry, "club_coach", "My Club Coach"),
            FootballHubClubDataSensor(coordinator, entry, "club_injuries", "My Club Injuries"),
            FootballHubClubDataSensor(coordinator, entry, "club_transfers", "My Club Transfers"),
            FootballHubClubDataSensor(coordinator, entry, "club_history", "My Club History"),
            FootballHubClubDataSensor(coordinator, entry, "club_players", "My Club Player Statistics"),
            FootballHubClubDataSensor(coordinator, entry, "club_yellow_cards", "My Club Yellow Cards"),
            FootballHubClubDataSensor(coordinator, entry, "club_red_cards", "My Club Red Cards"),
            FootballHubClubDataSensor(coordinator, entry, "club_head_to_head", "My Club Head To Head"),
            FootballHubClubDataSensor(coordinator, entry, "club_prediction", "My Club Prediction"),
            FootballHubClubDataSensor(coordinator, entry, "club_seasons", "My Club Seasons"),
            FootballHubClubDataSensor(coordinator, entry, "club_player_trophies", "My Club Player Trophies"),
            FootballHubClubDataSensor(coordinator, entry, "club_coach_trophies", "My Club Coach Trophies"),
            FootballHubClubDataSensor(coordinator, entry, "club_sidelined", "My Club Sidelined"),
        ]
    for favourite in coordinator.favourite_clubs:
        for kind, label in (
            ("next_fixture", "Next Fixture"),
            ("last_result", "Last Result"),
            ("live_match", "Live Match"),
            ("events", "Live Events"),
            ("statistics", "Live Statistics"),
            ("standing", "League Position"),
        ):
            entities.append(FootballHubFavouriteClubSensor(coordinator, entry, favourite, kind, label))
    async_add_entities(entities)


class FootballHubBaseSensor(CoordinatorEntity, SensorEntity):
    """Base Football Hub sensor."""

    def __init__(self, coordinator, entry: ConfigEntry, key: str, name: str):
        super().__init__(coordinator)
        self.entry = entry
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_name = f"{entry.title} {name}"

    @property
    def engine(self):
        return self.coordinator.engine


class FootballHubCompetitionCatalogueSensor(FootballHubBaseSensor):
    """Expose the provider's complete country and competition catalogue."""

    _unrecorded_attributes = frozenset({"competitions"})

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "competition_catalogue", "Competition Catalogue")

    @property
    def native_value(self):
        return len((self.coordinator.data or {}).get("competition_catalogue", []) or [])

    @property
    def extra_state_attributes(self):
        return {"competitions": (self.coordinator.data or {}).get("competition_catalogue", []) or []}


class FootballHubClubDataSensor(FootballHubBaseSensor):
    """Expose one cached My Club API dataset safely."""

    _unrecorded_attributes = frozenset({"data"})

    def __init__(self, coordinator, entry, key: str, name: str):
        super().__init__(coordinator, entry, key, name)
        self.key = key

    def _items(self):
        value = (self.coordinator.data or {}).get(self.key, [])
        if self.key == "club_profile" and isinstance(value, list):
            selected = self.coordinator.my_club.casefold()
            value = [
                item for item in value
                if str(((item or {}).get("team", {}) or {}).get("name", "")).casefold() == selected
            ]
        if self.key == "club_transfers" and isinstance(value, list):
            movements = []
            for record in value:
                for transfer in (record or {}).get("transfers", []) or []:
                    movements.append(
                        {
                            **transfer,
                            "player": (record or {}).get("player", {}),
                            "date": transfer.get("date") or (record or {}).get("update", ""),
                        }
                    )
            value = sorted(
                movements,
                key=lambda item: str(item.get("date") or ""),
                reverse=True,
            )
        return value

    @property
    def native_value(self):
        if not self.coordinator.my_club:
            return "Not selected"
        value = self._items()
        if isinstance(value, list):
            return len(value)
        if isinstance(value, dict):
            return self.coordinator.my_club if value else "Unavailable"
        return value if value is not None else "Unavailable"

    @property
    def extra_state_attributes(self):
        value = self._items()
        safe_value = limit_items(value, 20) if isinstance(value, list) else value
        return {
            "club": self.coordinator.my_club,
            "team_id": (self.coordinator.data or {}).get("my_club_team_id"),
            "dataset": self.key,
            "data": safe_value,
        }


class FootballHubFavouriteClubSensor(FootballHubBaseSensor):
    """Expose permanent, separately addressable data for one favourite club."""

    _unrecorded_attributes = frozenset({"data"})

    def __init__(self, coordinator, entry, favourite: dict, kind: str, label: str):
        self.favourite = dict(favourite)
        self.team = str(favourite.get("team") or "Unknown club")
        self.competition_key = str(favourite.get("competition") or "")
        self.kind = kind
        slug = re.sub(r"[^a-z0-9]+", "_", self.team.casefold()).strip("_")
        super().__init__(coordinator, entry, f"favourite_{self.competition_key}_{slug}_{kind}", f"{self.team} {label}")

    @property
    def _club_data(self) -> dict:
        key = f"{self.competition_key}:{self.team.casefold()}"
        return ((self.coordinator.data or {}).get("favourite_clubs_data", {}) or {}).get(key, {}) or {}

    @property
    def device_info(self):
        return {
            "identifiers": {(DOMAIN, f"{self.entry.entry_id}_{self.competition_key}_{self.team.casefold()}")},
            "name": f"Football Hub – {self.team}",
            "manufacturer": "Football Hub",
            "model": self._club_data.get("competition_name") or "Favourite Club",
        }

    @property
    def native_value(self):
        data = self._club_data
        if self.kind == "standing":
            standing = data.get("standing") or {}
            return standing.get("rank") or standing.get("position") or "Unavailable"
        if self.kind in {"events", "statistics"}:
            details = data.get("live_details") or {}
            value = details.get(self.kind) or []
            return len(value)
        match = data.get(self.kind)
        if not match:
            return "No live match" if self.kind == "live_match" else "Unavailable"
        fixture = (match.get("fixture") or {}) if isinstance(match, dict) else {}
        status = (fixture.get("status") or {}).get("short")
        teams = (match.get("teams") or {}) if isinstance(match, dict) else {}
        home = (teams.get("home") or {}).get("name", "")
        away = (teams.get("away") or {}).get("name", "")
        goals = match.get("goals") or {}
        if self.kind in {"live_match", "last_result"}:
            return f"{home} {goals.get('home', '-')}–{goals.get('away', '-')} {away}"
        return f"{home} v {away}" if home or away else status or "Available"

    @property
    def extra_state_attributes(self):
        data = self._club_data
        value = data.get("live_details", {}).get(self.kind, []) if self.kind in {"events", "statistics"} else data.get(self.kind)
        return {
            "club": self.team,
            "team_id": data.get("team_id"),
            "competition": data.get("competition_name"),
            "competition_key": self.competition_key,
            "country": data.get("country"),
            "data": limit_items(value, 20) if isinstance(value, list) else value,
        }


class FootballHubPortalDataSensor(FootballHubBaseSensor):
    """Expose a cached portal feed without recording its large attributes."""

    _unrecorded_attributes = frozenset({"items"})

    def __init__(self, coordinator, entry, key: str, name: str):
        super().__init__(coordinator, entry, key, name)
        self.key = key

    @property
    def native_value(self):
        return len((self.coordinator.data or {}).get(self.key, []) or [])

    @property
    def extra_state_attributes(self):
        attributes = {
            "items": ((self.coordinator.data or {}).get(self.key, []) or [])[:40]
        }
        if self.key == "tv_guide":
            attributes["country"] = (
                (self.coordinator.data or {}).get("tv_guide_country") or "England"
            )
        return attributes


class FootballHubTransferMarketSensor(FootballHubBaseSensor):
    """Expose latest and leading transfers in one frontend entity."""

    _unrecorded_attributes = frozenset({"latest", "top"})

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "transfer_market", "Transfer Market")

    @property
    def native_value(self):
        return len((self.coordinator.data or {}).get("latest_transfers", []) or [])

    @property
    def extra_state_attributes(self):
        data = self.coordinator.data or {}
        return {
            "latest": (data.get("latest_transfers", []) or [])[:40],
            "top": (data.get("top_transfers", []) or [])[:40],
            "currency": "GBP",
        }



def _countdown_attributes(match: dict) -> dict:
    """Return countdown details for a fixture without bloating attributes."""
    timestamp = match.get("timestamp") if match else None
    if not timestamp:
        return {
            "seconds_to_kickoff": None,
            "minutes_to_kickoff": None,
            "hours_to_kickoff": None,
            "days_to_kickoff": None,
        }

    seconds = max(0, int(timestamp) - int(datetime.now(timezone.utc).timestamp()))
    return {
        "seconds_to_kickoff": seconds,
        "minutes_to_kickoff": seconds // 60,
        "hours_to_kickoff": seconds // 3600,
        "days_to_kickoff": seconds // 86400,
    }


class FootballHubStatusSensor(FootballHubBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "status", "Status")

    @property
    def native_value(self):
        return "Online" if self.coordinator.last_update_success else "Error"

    @property
    def extra_state_attributes(self):
        competition = self.coordinator.competition
        season = self.entry.data.get("season")
        last_updated = getattr(self.coordinator, "last_update_success_time", None)
        return {
            "competition": competition.get("name"),
            "competition_key": self.coordinator.competition_key,
            "config_entry_id": self.entry.entry_id,
            "available_competitions": [
                {
                    "key": key,
                    "name": item["name"],
                    "country": item["country"],
                    "league_id": item["league_id"],
                    "type": item.get("type", "league"),
                    "has_table": item.get("has_table", True),
                }
                for key, item in COMPETITIONS.items()
            ],
            "country": competition.get("country"),
            "league_id": competition.get("league_id"),
            "season": SEASONS.get(season, season),
            "provider_mode": self.entry.data.get("provider_mode"),
            "my_club": self.coordinator.my_club,
            "my_club_team_id": (self.coordinator.data or {}).get("my_club_team_id"),
            "favourite_clubs": self.coordinator.favourite_clubs,
            "ui_preferences": self.coordinator.ui_preferences,
            "last_updated": last_updated.isoformat() if last_updated else None,
            "live_count": len(self.engine.live.matches()),
            "fixtures_count": len(self.engine.fixtures.all()),
            "results_count": len(self.engine.results.all()),
            "teams_count": len(self.engine.standings.table()),
        }


class FootballHubLiveSensor(FootballHubBaseSensor):
    _unrecorded_attributes = frozenset({"primary_live_match", "matches"})
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "live_matches", "Live Matches")

    @property
    def native_value(self):
        return len(self.engine.live.matches())

    @property
    def extra_state_attributes(self):
        matches = self.engine.live.matches()
        coordinator_data = self.coordinator.data or {}
        raw_matches = coordinator_data.get("live", []) or []
        live_details = coordinator_data.get("live_details", {}) or {}
        raw_by_id = {
            str(((item or {}).get("fixture") or {}).get("id")): item
            for item in raw_matches
            if ((item or {}).get("fixture") or {}).get("id") is not None
        }
        enriched_matches = []
        for match in matches:
            fixture_id = str(match.get("fixture_id"))
            details = live_details.get(fixture_id) or self.engine.live.details(
                match.get("fixture_id")
            )
            raw = raw_by_id.get(str(match.get("fixture_id")), {})
            league = (raw.get("league") or {}) if isinstance(raw, dict) else {}
            enriched_matches.append({
                **match,
                "competition": league.get("name") or match.get("competition") or "Other matches",
                "competition_id": league.get("id"),
                "country_code": league.get("country_code"),
                **details,
            })
        return {
            "total_live": len(matches),
            "primary_live_match": self.engine.live.primary(),
            "matches": enriched_matches,
        }


class FootballHubLiveMatchSensor(FootballHubBaseSensor):
    """Expose the primary live match as a dedicated entity."""

    _unrecorded_attributes = frozenset({"events", "statistics", "lineups"})

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "live_match", "Live Match")

    @property
    def native_value(self):
        match = self.engine.live.primary()
        if not match:
            return "No live match"

        status = match.get("status_short") or "LIVE"
        elapsed = match.get("elapsed")
        if status in {"1H", "2H", "ET"} and elapsed is not None:
            return f"{elapsed}'"
        return status

    @property
    def extra_state_attributes(self):
        match = self.engine.live.primary()
        if not match:
            return {"is_live": False}

        events = self.engine.live.events()
        statistics = self.engine.live.statistics()
        lineups = self.engine.live.lineups()
        return {
            "is_live": True,
            **match,
            "scoreline": (
                f"{match.get('home_team')} {match.get('home_goals')}-"
                f"{match.get('away_goals')} {match.get('away_team')}"
            ),
            "events_count": len(events),
            "events": limit_items(events, 20),
            "statistics": limit_items(statistics, 2),
            "lineups_available": bool(lineups),
            "lineups": limit_items(lineups, 2),
        }


class FootballHubNextFixtureSensor(FootballHubBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "next_fixture", "Next Fixture")

    @property
    def native_value(self):
        match = self.engine.fixtures.next()
        return f"{match.get('home_team')} vs {match.get('away_team')}" if match else None

    @property
    def extra_state_attributes(self):
        match = self.engine.fixtures.next()
        if not match:
            return {}
        return {**match, **_countdown_attributes(match)}


class FootballHubMatchesTodaySensor(FootballHubBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "matches_today", "Matches Today")

    @property
    def native_value(self):
        return self.extra_state_attributes["total_today"]

    @property
    def extra_state_attributes(self):
        now = datetime.now(timezone.utc)
        start = int(datetime(now.year, now.month, now.day, tzinfo=timezone.utc).timestamp())
        end = start + 86400
        raw = self.coordinator._cache.get("live_feed", []) or []
        matches = [clean_fixture(item) for item in raw if start <= fixture_timestamp(item) < end]
        matches.sort(key=lambda item: item.get("timestamp") or 0)
        return {"total_today": len(matches), "matches": limit_items(matches, 500)}


class FootballHubThisWeekSensor(FootballHubBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "matches_this_week", "Matches This Week")

    @property
    def native_value(self):
        return len(self.engine.fixtures.this_week())

    @property
    def extra_state_attributes(self):
        matches = self.engine.fixtures.this_week()
        return {"total_this_week": len(matches), "matches": limit_items(matches, ATTRIBUTE_LIMIT)}


class FootballHubFixturesSensor(FootballHubBaseSensor):
    _unrecorded_attributes = frozenset({"fixtures"})
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "fixtures", "Fixtures")

    @property
    def native_value(self):
        return len(self.engine.fixtures.all())

    @property
    def extra_state_attributes(self):
        fixtures = self.engine.fixtures.all()
        return {
            "total_fixtures": len(fixtures),
            "today_count": len(self.engine.fixtures.today()),
            "this_week_count": len(self.engine.fixtures.this_week()),
            "next_5": limit_items(fixtures, ATTRIBUTE_LIMIT),
            "fixtures": fixtures,
        }



class FootballHubLastResultSensor(FootballHubBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "last_result", "Last Result")

    @property
    def native_value(self):
        match = self.engine.results.last()
        if not match:
            return None
        return f"{match.get('home_team')} {match.get('home_goals')}-{match.get('away_goals')} {match.get('away_team')}"

    @property
    def extra_state_attributes(self):
        return self.engine.results.last()


class FootballHubResultsSensor(FootballHubBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "results", "Results")

    @property
    def native_value(self):
        return len(self.engine.results.all())

    @property
    def extra_state_attributes(self):
        results = self.engine.results.all()
        return {
            "total_results": len(results),
            "last_result": self.engine.results.last(),
            "latest_5": self.engine.results.latest(ATTRIBUTE_LIMIT),
        }


class FootballHubStandingsSensor(FootballHubBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "standings", "Standings")

    @property
    def native_value(self):
        return len(self.engine.standings.table())

    @property
    def extra_state_attributes(self):
        table = self.engine.standings.table()
        return {"total_teams": len(table), "table": table}


class FootballHubTopScorersSensor(FootballHubBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "top_scorers", "Top Scorers")

    @property
    def native_value(self):
        return len(self.engine.top_scorers)

    @property
    def extra_state_attributes(self):
        return {
            "total_top_scorers": len(self.engine.top_scorers),
            "top_scorers": limit_items(self.engine.top_scorers, ATTRIBUTE_LIMIT),
        }


class FootballHubTopAssistsSensor(FootballHubBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "top_assists", "Top Assists")

    @property
    def native_value(self):
        return len(self.engine.top_assists)

    @property
    def extra_state_attributes(self):
        return {
            "total_top_assists": len(self.engine.top_assists),
            "top_assists": limit_items(self.engine.top_assists, ATTRIBUTE_LIMIT),
        }


class FootballHubPlayerLeaderboardSensor(FootballHubBaseSensor):
    """Expose an optional league player leaderboard."""

    _unrecorded_attributes = frozenset({"players"})

    def __init__(self, coordinator, entry, key: str, name: str):
        super().__init__(coordinator, entry, key, name)
        self.key = key

    @property
    def native_value(self):
        return len((self.coordinator.data or {}).get(self.key, []) or [])

    @property
    def extra_state_attributes(self):
        players = (self.coordinator.data or {}).get(self.key, []) or []
        return {
            "players": limit_items(players, 10),
            self.key: limit_items(players, 10),
        }


class FootballHubCupCentreSensor(FootballHubBaseSensor):
    """Expose the independently selected cup in one frontend-only dataset."""

    _unrecorded_attributes = frozenset({"fixtures", "results", "table", "top_scorers"})

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry, "cup_centre", "Cup Centre")

    @property
    def native_value(self):
        competition = self.coordinator.cup_competition or {}
        return competition.get("name", "Not selected")

    @property
    def extra_state_attributes(self):
        engine = self.coordinator.cup_engine
        competition = self.coordinator.cup_competition or {}
        raw_by_id = {
            str(((item or {}).get("fixture") or {}).get("id")): item
            for item in ((self.coordinator.data or {}).get("cup_fixtures", []) or [])
        }
        fixtures = []
        for fixture in engine.fixtures.all():
            raw = raw_by_id.get(str(fixture.get("fixture_id") or fixture.get("id")), {})
            fixtures.append({**fixture, "qualification": raw.get("qualification")})
        return {
            "competition_key": self.coordinator.cup_key,
            "competition": competition.get("name"),
            "country": competition.get("country"),
            "has_table": competition.get("has_table", False),
            "fixtures": fixtures,
            "live": engine.live.matches(),
            "results": engine.results.all(),
            "table": engine.standings.table(),
            "top_scorers": limit_items(engine.top_scorers, 10),
        }
