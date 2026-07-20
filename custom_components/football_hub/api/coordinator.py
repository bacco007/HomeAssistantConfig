"""Football Hub data coordinator with independent dataset refresh periods."""

from __future__ import annotations

import asyncio
import copy
from datetime import datetime, timezone
from datetime import timedelta
import logging
import random
from time import monotonic
from typing import Any, Awaitable

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from ..competitions import COMPETITIONS
from ..engine import FootballHubEngine
from .api import FootballHubAPI

_LOGGER = logging.getLogger(__name__)

LIVE_TTL = 60
LIVE_DISCOVERY_TTL = 60 * 60
LIVE_PREMATCH_TTL = 5 * 60
LIVE_PREMATCH_WINDOW = 10 * 60
FIXTURES_TTL = 6 * 60 * 60
STANDINGS_TTL = 6 * 60 * 60
PLAYERS_TTL = 12 * 60 * 60
LIVE_EVENTS_TTL = 60
LIVE_STATISTICS_TTL = 60
LINEUPS_TTL = 5 * 60
CLUB_PROFILE_TTL = 24 * 60 * 60
CLUB_STATS_TTL = 12 * 60 * 60
CLUB_SQUAD_TTL = 7 * 24 * 60 * 60
CLUB_INJURIES_TTL = 4 * 60 * 60
CLUB_TRANSFERS_TTL = 24 * 60 * 60
CLUB_HISTORY_TTL = 7 * 24 * 60 * 60
NEWS_TTL = 60 * 60
TV_GUIDE_TTL = 6 * 60 * 60
TRANSFER_MARKET_TTL = 60 * 60
COMPETITION_CATALOGUE_TTL = 7 * 24 * 60 * 60
LIVE_RATE_LIMIT_BACKOFF = 30
PRE_LIVE_WINDOW = timedelta(minutes=5)
POST_LIVE_WINDOW = timedelta(hours=3, minutes=15)
PRE_LIVE_PROMOTION_END = timedelta(minutes=20)


class FootballHubCoordinator(DataUpdateCoordinator):
    """Coordinate Football Hub data updates."""

    def __init__(self, hass, entry):
        """Initialise the coordinator."""
        self.entry = entry
        self.api = FootballHubAPI(hass, entry.data.get("api_key"))
        requested_competition = entry.options.get(
            "active_competition", entry.data["competition"]
        )
        self.competition_key = (
            requested_competition
            if requested_competition in COMPETITIONS
            else "premier_league"
        )
        self.competition = COMPETITIONS[self.competition_key]
        requested_cup = entry.options.get("active_cup", "")
        self.cup_key = requested_cup if requested_cup in COMPETITIONS and COMPETITIONS[requested_cup].get("type") == "cup" else ""
        self.cup_competition = COMPETITIONS.get(self.cup_key)
        self.season = entry.data["season"]
        self.engine = FootballHubEngine()
        self.cup_engine = FootballHubEngine()
        self._cache: dict[str, Any] = {}
        self._updated_at: dict[str, float] = {}
        self._random_ttls: dict[str, float] = {}
        self._live_rate_limited_until = 0.0
        self.supported_teams = dict(entry.options.get("supported_teams", {}))
        self.supported_team = self.supported_teams.get(
            self.competition_key, entry.options.get("supported_team", "")
        )
        self.my_clubs = dict(entry.options.get("my_clubs", {}))
        self.my_club = self.my_clubs.get(self.competition_key, "")
        self.selected_live_fixture = ""

        super().__init__(
            hass,
            _LOGGER,
            name=f"Football Hub - {self.competition['name']}",
            update_interval=timedelta(seconds=30),
        )

    def _is_stale(self, key: str, ttl: int, *, randomise: bool = True) -> bool:
        """Return whether a cached dataset needs refreshing."""
        if key not in self._cache or key not in self._updated_at:
            return True
        effective_ttl = ttl
        if randomise:
            effective_ttl = self._random_ttls.setdefault(
                key, random.uniform(ttl, ttl * 2)
            )
        return monotonic() - self._updated_at[key] >= effective_ttl

    def _store(self, key: str, value: Any) -> None:
        """Store a refreshed dataset."""
        self._cache[key] = value
        self._updated_at[key] = monotonic()
        self._random_ttls.pop(key, None)

    def _live_feed_refresh_due(self) -> bool:
        """Use hourly discovery, five-minute pre-match and one-minute live polling."""
        if "live_feed" not in self._cache or "live_feed" not in self._updated_at:
            return True
        age = monotonic() - self._updated_at["live_feed"]
        feed = self._cache.get("live_feed", []) or []
        live_statuses = {"1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"}
        if any(
            (((item or {}).get("fixture") or {}).get("status") or {}).get("short") in live_statuses
            for item in feed
        ):
            return age >= LIVE_TTL

        # Reconstruct the wall-clock time of the last successful feed request,
        # then wake exactly ten minutes before the nearest scheduled kickoff.
        fetched_at = datetime.now(timezone.utc).timestamp() - age
        seconds_to_window: list[float] = []
        now = datetime.now(timezone.utc)
        for item in feed:
            fixture = (item or {}).get("fixture", {}) or {}
            status = (fixture.get("status", {}) or {}).get("short")
            if status not in {"NS", "TBD"}:
                continue
            value = fixture.get("date")
            if not value:
                continue
            try:
                kickoff = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            except ValueError:
                continue
            seconds = (kickoff - now).total_seconds()
            if 0 <= seconds <= LIVE_PREMATCH_WINDOW:
                return age >= LIVE_PREMATCH_TTL
            if seconds > LIVE_PREMATCH_WINDOW:
                seconds_to_window.append(kickoff.timestamp() - fetched_at - LIVE_PREMATCH_WINDOW)

        next_due = min([LIVE_DISCOVERY_TTL, *seconds_to_window]) if seconds_to_window else LIVE_DISCOVERY_TTL
        return age >= max(30, next_due)

    def _live_poll_window_active(self) -> bool:
        """Poll live data from five minutes before kickoff through match end."""
        now = datetime.now(timezone.utc)
        for item in self._cache.get("fixtures", []) or []:
            fixture = (item or {}).get("fixture", {}) or {}
            status = (fixture.get("status", {}) or {}).get("short")
            if status in {"1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"}:
                return True
            value = fixture.get("date")
            if not value:
                continue
            try:
                kickoff = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            except ValueError:
                continue
            if kickoff - PRE_LIVE_WINDOW <= now <= kickoff + POST_LIVE_WINDOW:
                return True
        return not self._cache.get("fixtures")

    def _pre_live_matches(self) -> list[dict[str, Any]]:
        """Expose matches as awaiting live data shortly before kickoff."""
        now = datetime.now(timezone.utc)
        waiting: list[dict[str, Any]] = []
        for item in self._cache.get("fixtures", []) or []:
            fixture = (item or {}).get("fixture", {}) or {}
            status = (fixture.get("status", {}) or {}).get("short")
            if status not in {"NS", "TBD"}:
                continue
            value = fixture.get("date")
            if not value:
                continue
            try:
                kickoff = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            except ValueError:
                continue
            if not kickoff - PRE_LIVE_WINDOW <= now <= kickoff + PRE_LIVE_PROMOTION_END:
                continue
            promoted = copy.deepcopy(item)
            promoted_fixture = promoted.setdefault("fixture", {})
            promoted_fixture["status"] = {
                "short": "LIVE",
                "long": "Awaiting kickoff API data",
                "elapsed": None,
            }
            promoted["awaiting_live_api_data"] = True
            waiting.append(promoted)
        return waiting

    async def async_set_competition(self, competition_key: str) -> None:
        """Switch the active competition and refresh every dataset."""
        if competition_key not in COMPETITIONS:
            raise ValueError(f"Unknown competition: {competition_key}")
        if competition_key == self.competition_key:
            return
        self.competition_key = competition_key
        self.competition = COMPETITIONS[competition_key]
        self.supported_team = self.supported_teams.get(competition_key, "")
        self.my_club = self.my_clubs.get(competition_key, "")
        self._cache.clear()
        self._updated_at.clear()
        self._random_ttls.clear()
        self._live_rate_limited_until = 0.0
        empty_data = {
            "live": [],
            "fixtures": [],
            "standings": [],
            "top_scorers": [],
            "top_assists": [],
            "live_events": [],
            "live_statistics": [],
            "live_lineups": [],
            "live_details": {},
        }
        self.engine.update(empty_data)
        options = {**self.entry.options, "active_competition": competition_key}
        self.hass.config_entries.async_update_entry(self.entry, options=options)
        self.async_set_updated_data(empty_data)
        await self.async_request_refresh()

    async def async_set_cup(self, competition_key: str) -> None:
        """Select a cup without changing the active domestic league."""
        competition = COMPETITIONS.get(competition_key)
        if not competition or competition.get("type") != "cup":
            raise ValueError(f"Unknown cup competition: {competition_key}")
        if competition_key == self.cup_key and self._cache.get("cup_fixtures") is not None:
            return
        self.cup_key = competition_key
        self.cup_competition = competition
        for key in list(self._cache):
            if key.startswith("cup_"):
                self._cache.pop(key, None)
                self._updated_at.pop(key, None)
        self.cup_engine.update({"live": [], "fixtures": [], "standings": [], "top_scorers": [], "top_assists": []})
        options = {**self.entry.options, "active_cup": competition_key}
        self.hass.config_entries.async_update_entry(self.entry, options=options)
        current = dict(self.data or {})
        current.update({"cup_key": self.cup_key, "cup_fixtures": [], "cup_standings": []})
        self.async_set_updated_data(current)
        await self.async_request_refresh()

    async def async_set_supported_team(self, team: str) -> None:
        """Persist the team whose live match receives detailed API polling."""
        self.supported_team = str(team or "").strip()
        self.supported_teams[self.competition_key] = self.supported_team
        options = {
            **self.entry.options,
            "supported_team": self.supported_team,
            "supported_teams": self.supported_teams,
        }
        self.hass.config_entries.async_update_entry(self.entry, options=options)
        await self.async_request_refresh()

    async def async_set_my_club(self, team: str) -> None:
        """Persist the My Club selection and refresh club datasets."""
        self.my_club = str(team or "").strip()
        self.my_clubs[self.competition_key] = self.my_club
        for key in list(self._cache):
            if key.startswith("club_"):
                self._cache.pop(key, None)
                self._updated_at.pop(key, None)
        options = {**self.entry.options, "my_clubs": self.my_clubs}
        self.hass.config_entries.async_update_entry(self.entry, options=options)
        await self.async_request_refresh()

    async def async_set_selected_live_match(self, fixture_id: str) -> None:
        """Load detailed data for the live match selected in the panel."""
        self.selected_live_fixture = str(fixture_id or "").strip()
        await self.async_request_refresh()

    def _club_context(self) -> tuple[int | None, int | None, int | None]:
        """Return selected team id, next opponent id and fixture id."""
        team_id = opponent_id = fixture_id = None
        for item in self._cache.get("fixtures", []) or []:
            teams = (item or {}).get("teams", {}) or {}
            home = teams.get("home", {}) or {}
            away = teams.get("away", {}) or {}
            if str(home.get("name", "")).casefold() == self.my_club.casefold():
                team_id, opponent_id = home.get("id"), away.get("id")
            elif str(away.get("name", "")).casefold() == self.my_club.casefold():
                team_id, opponent_id = away.get("id"), home.get("id")
            if team_id:
                fixture_id = ((item or {}).get("fixture", {}) or {}).get("id")
                break
        return team_id, opponent_id, fixture_id

    async def _async_update_data(self):
        """Refresh only datasets whose cache period has expired."""
        league_id = self.competition["league_id"]
        requests: list[tuple[str, Awaitable[Any]]] = []

        if self._live_feed_refresh_due():
            requests.append(("live_feed", self.api.get_live_feed(league_id, self.season)))
        if self._is_stale("fixtures", FIXTURES_TTL):
            requests.append(("fixtures", self.api.get_fixtures(league_id, self.season)))
        if self._is_stale("standings", STANDINGS_TTL):
            requests.append(("standings", self.api.get_standings(league_id, self.season)))
        if self._is_stale("player_leaderboards", PLAYERS_TTL):
            requests.append(
                ("player_leaderboards", self.api.get_player_leaderboards(league_id, self.season))
            )

        # Portal feeds are cached independently and never join the one-minute
        # live loop. They refresh only when their own longer TTL expires.
        portal_requests = [
            ("news", NEWS_TTL, self.api.get_trending_news),
            (
                "tv_guide",
                TV_GUIDE_TTL,
                lambda: self.api.get_tv_guide(self.competition.get("country", "England")),
            ),
            ("latest_transfers", TRANSFER_MARKET_TTL, self.api.get_latest_transfers),
            ("top_transfers", TRANSFER_MARKET_TTL, self.api.get_top_transfers),
            ("competition_catalogue", COMPETITION_CATALOGUE_TTL, self.api.get_competition_catalogue),
        ]
        portal_request_budget = 2
        for key, ttl, request_factory in portal_requests:
            if portal_request_budget and self._is_stale(key, ttl):
                requests.append((key, request_factory()))
                portal_request_budget -= 1

        # Cup datasets are independent so selecting a cup never replaces the
        # active domestic league used by the main dashboard tabs.
        if self.cup_competition:
            cup_league_id = self.cup_competition["league_id"]
            if self._is_stale("cup_fixtures", FIXTURES_TTL):
                requests.append(("cup_fixtures", self.api.get_fixtures(cup_league_id, self.season)))
            if self.cup_competition.get("has_table") and self._is_stale("cup_standings", STANDINGS_TTL):
                requests.append(("cup_standings", self.api.get_standings(cup_league_id, self.season)))
            if self._is_stale("cup_top_scorers", PLAYERS_TTL):
                requests.append(("cup_top_scorers", self.api.get_top_scorers(cup_league_id, self.season)))

        team_id, opponent_id, next_fixture_id = self._club_context()
        if self.my_club and team_id:
            # Keep club enrichment below low-tier per-minute API limits. Two
            # datasets per 30-second coordinator cycle allows the page to fill
            # progressively without creating a large burst of requests.
            club_request_budget = 2
            club_requests = [
                ("club_profile", CLUB_PROFILE_TTL, lambda: self.api.get_team(team_id, league_id)),
                ("club_statistics", CLUB_STATS_TTL, lambda: self.api.get_team_statistics(team_id, league_id, self.season)),
                ("club_seasons", CLUB_PROFILE_TTL, lambda: self.api.get_team_seasons(team_id)),
                ("club_squad", CLUB_SQUAD_TTL, lambda: self.api.get_squad(team_id)),
                ("club_coach", CLUB_PROFILE_TTL, lambda: self.api.get_coach(team_id)),
                ("club_injuries", CLUB_INJURIES_TTL, lambda: self.api.get_injuries(team_id, self.season)),
                ("club_transfers", CLUB_TRANSFERS_TTL, lambda: self.api.get_transfers(team_id)),
                ("club_history", CLUB_HISTORY_TTL, lambda: self.api.get_team_history(team_id)),
                ("club_players", CLUB_STATS_TTL, lambda: self.api.get_team_players(team_id, league_id, self.season)),
            ]
            if opponent_id:
                club_requests.append(("club_head_to_head", CLUB_STATS_TTL, lambda: self.api.get_head_to_head(team_id, opponent_id)))
            if next_fixture_id:
                club_requests.append(("club_prediction", CLUB_STATS_TTL, lambda: self.api.get_prediction(next_fixture_id)))
            for key, ttl, request_factory in club_requests:
                if club_request_budget and self._is_stale(key, ttl):
                    requests.append((key, request_factory()))
                    club_request_budget -= 1

            squad_response = self._cache.get("club_squad", []) or []
            squad_players = (squad_response[0].get("players", []) if squad_response else []) or []
            player_ids = [item.get("id") for item in squad_players if item.get("id")]
            coach_response = self._cache.get("club_coach", []) or []
            coach_id = (coach_response[0] or {}).get("id") if coach_response else None
            if club_request_budget and player_ids and self._is_stale("club_player_trophies", CLUB_SQUAD_TTL):
                requests.append(("club_player_trophies", self.api.get_trophies_for_players(player_ids)))
                club_request_budget -= 1
            if club_request_budget and player_ids and self._is_stale("club_sidelined", CLUB_INJURIES_TTL):
                requests.append(("club_sidelined", self.api.get_sidelined_players(player_ids)))
                club_request_budget -= 1
            if club_request_budget and coach_id and self._is_stale("club_coach_trophies", CLUB_SQUAD_TTL):
                requests.append(("club_coach_trophies", self.api.get_trophies_for_coach(coach_id)))
                club_request_budget -= 1

        if requests:
            results = await asyncio.gather(
                *(request for _, request in requests), return_exceptions=True
            )
            failures: list[str] = []

            for (key, _), result in zip(requests, results, strict=True):
                if isinstance(result, Exception):
                    failures.append(f"{key}: {result}")
                    _LOGGER.warning("Football Hub %s refresh failed: %s", key, result)
                else:
                    self._store(key, result)

            # The integration cannot work without fixture data on the first load.
            if failures and "fixtures" not in self._cache:
                raise UpdateFailed("; ".join(failures))

        raw_live = [
            item for item in (self._cache.get("live_feed", []) or [])
            if (((item or {}).get("fixture") or {}).get("status") or {}).get("short")
            in {"1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"}
        ]
        if not raw_live:
            raw_live = self._pre_live_matches()
        live_fixture_ids: list[int] = []
        supported_fixture_id = None
        for item in raw_live:
            if not isinstance(item, dict):
                continue
            fixture_id = (item.get("fixture") or {}).get("id")
            if fixture_id:
                live_fixture_ids.append(fixture_id)
                teams = (item.get("teams") or {}) if isinstance(item, dict) else {}
                home_name = str((teams.get("home") or {}).get("name") or "").casefold()
                away_name = str((teams.get("away") or {}).get("name") or "").casefold()
                if self.supported_team.casefold() in {home_name, away_name}:
                    supported_fixture_id = fixture_id

        selected_fixture_id = next(
            (fixture_id for fixture_id in live_fixture_ids if str(fixture_id) == self.selected_live_fixture),
            None,
        )
        detail_fixture_ids = [selected_fixture_id or supported_fixture_id or live_fixture_ids[0]] if live_fixture_ids else []

        # World Cup-style per-fixture live caches. This allows the frontend to
        # select any live match while the remaining games stay score-only.
        if live_fixture_ids and monotonic() >= self._live_rate_limited_until:
            detail_requests: list[tuple[str, int, str, Awaitable[Any]]] = []
            for fixture_id in detail_fixture_ids:
                event_key = f"live_events:{fixture_id}"
                stats_key = f"live_statistics:{fixture_id}"
                lineup_key = f"live_lineups:{fixture_id}"
                info_key = f"live_info:{fixture_id}"
                if self._is_stale(event_key, LIVE_EVENTS_TTL, randomise=False):
                    detail_requests.append((event_key, fixture_id, "events", self.api.get_fixture_events(fixture_id)))
                if self._is_stale(stats_key, LIVE_STATISTICS_TTL, randomise=False):
                    detail_requests.append((stats_key, fixture_id, "statistics", self.api.get_fixture_statistics(fixture_id)))
                if self._is_stale(lineup_key, LINEUPS_TTL, randomise=False):
                    detail_requests.append((lineup_key, fixture_id, "lineups", self.api.get_fixture_lineups(fixture_id)))
                if self._is_stale(info_key, LIVE_EVENTS_TTL, randomise=False):
                    detail_requests.append((info_key, fixture_id, "details", self.api.get_fixture_details(fixture_id)))

            if detail_requests:
                detail_results = await asyncio.gather(
                    *(request for _, _, _, request in detail_requests),
                    return_exceptions=True,
                )
                for (cache_key, fixture_id, kind, _), result in zip(
                    detail_requests, detail_results, strict=True
                ):
                    if isinstance(result, Exception):
                        if "rate limit" in str(result).lower() or "429" in str(result):
                            self._live_rate_limited_until = monotonic() + LIVE_RATE_LIMIT_BACKOFF
                        _LOGGER.warning(
                            "Football Hub live %s refresh failed for fixture %s: %s",
                            kind,
                            fixture_id,
                            result,
                        )
                    else:
                        self._store(cache_key, result)

        live_details: dict[str, dict[str, Any]] = {}
        for fixture_id in detail_fixture_ids:
            live_details[str(fixture_id)] = {
                **(self._cache.get(f"live_info:{fixture_id}", {}) or {}),
                "events": self._cache.get(f"live_events:{fixture_id}", []),
                "statistics": self._cache.get(f"live_statistics:{fixture_id}", []),
                "lineups": self._cache.get(f"live_lineups:{fixture_id}", []),
            }

        primary_fixture_id = live_fixture_ids[0] if live_fixture_ids else None

        club_profile = copy.deepcopy(self._cache.get("club_profile", []))
        if isinstance(club_profile, list) and club_profile:
            profile = club_profile[0] or {}
            if not isinstance(profile, dict):
                profile = {}
                club_profile[0] = profile
            venue = profile.get("venue")
            if not isinstance(venue, dict):
                venue = {}
                profile["venue"] = venue
            for match in self._cache.get("fixtures", []) or []:
                teams = (match or {}).get("teams", {}) or {}
                home = teams.get("home", {}) or {}
                if str(home.get("name", "")).casefold() != self.my_club.casefold():
                    continue
                fixture_venue = ((match or {}).get("fixture", {}) or {}).get("venue", {}) or {}
                if fixture_venue.get("name"):
                    venue.setdefault("name", fixture_venue.get("name"))
                if fixture_venue.get("city"):
                    venue.setdefault("city", fixture_venue.get("city"))
                break

        self.cup_engine.update({
            "live": [],
            "fixtures": self._cache.get("cup_fixtures", []),
            "standings": self._cache.get("cup_standings", []),
            "top_scorers": self._cache.get("cup_top_scorers", []),
            "top_assists": [],
        })

        data = {
            "live": raw_live,
            "fixtures": self._cache.get("fixtures", []),
            "standings": self._cache.get("standings", []),
            "top_scorers": (self._cache.get("player_leaderboards", {}) or {}).get("top_scorers", []),
            "top_assists": (self._cache.get("player_leaderboards", {}) or {}).get("top_assists", []),
            "top_yellow_cards": (self._cache.get("player_leaderboards", {}) or {}).get("top_yellow_cards", []),
            "top_red_cards": (self._cache.get("player_leaderboards", {}) or {}).get("top_red_cards", []),
            "top_ratings": (self._cache.get("player_leaderboards", {}) or {}).get("top_ratings", []),
            "top_appearances": (self._cache.get("player_leaderboards", {}) or {}).get("top_appearances", []),
            "top_minutes": (self._cache.get("player_leaderboards", {}) or {}).get("top_minutes", []),
            "live_events": live_details.get(str(primary_fixture_id), {}).get("events", []),
            "live_statistics": live_details.get(str(primary_fixture_id), {}).get("statistics", []),
            "live_lineups": live_details.get(str(primary_fixture_id), {}).get("lineups", []),
            "live_details": live_details,
            "my_club": self.my_club,
            "my_club_team_id": team_id,
            "club_profile": club_profile,
            "club_statistics": self._cache.get("club_statistics", []),
            "club_seasons": self._cache.get("club_seasons", []),
            "club_squad": self._cache.get("club_squad", []),
            "club_coach": self._cache.get("club_coach", []),
            "club_injuries": self._cache.get("club_injuries", []),
            "club_transfers": self._cache.get("club_transfers", []),
            "club_history": self._cache.get("club_history", {}),
            "club_players": self._cache.get("club_players", []),
            "club_yellow_cards": (self._cache.get("player_leaderboards", {}) or {}).get("top_yellow_cards", []),
            "club_red_cards": (self._cache.get("player_leaderboards", {}) or {}).get("top_red_cards", []),
            "club_head_to_head": self._cache.get("club_head_to_head", []),
            "club_prediction": self._cache.get("club_prediction", []),
            "club_player_trophies": self._cache.get("club_player_trophies", []),
            "club_coach_trophies": self._cache.get("club_coach_trophies", []),
            "club_sidelined": self._cache.get("club_sidelined", []),
            "cup_key": self.cup_key,
            "cup_fixtures": self._cache.get("cup_fixtures", []),
            "cup_standings": self._cache.get("cup_standings", []),
            "cup_top_scorers": self._cache.get("cup_top_scorers", []),
            "news": self._cache.get("news", []),
            "tv_guide": self._cache.get("tv_guide", []),
            "tv_guide_country": self.competition.get("country", "England"),
            "latest_transfers": self._cache.get("latest_transfers", []),
            "top_transfers": self._cache.get("top_transfers", []),
            "competition_catalogue": self._cache.get("competition_catalogue", {}),
        }
        self.engine.update(data)
        return data
