"""Football Hub shared processing engine.

This module keeps the existing engine file layout and provides a small facade so
all sensors reuse the same processed data for each coordinator refresh.
"""

from __future__ import annotations

from typing import Any

from .fixtures import next_fixture, today as fixtures_today, this_week, upcoming
from .live import (
    live_matches,
    primary_live_match,
    process_events,
    process_lineups,
    process_statistics,
)
from .players import top_assists as process_top_assists
from .players import top_scorers as process_top_scorers
from .results import all_results, last_result, latest
from .standings import league_table


class FixtureEngine:
    """Processed fixture access."""

    def __init__(self, owner: "FootballHubEngine") -> None:
        self._owner = owner

    def all(self) -> list[dict[str, Any]]:
        return self._owner._processed["fixtures"]

    def next(self) -> dict[str, Any]:
        return self._owner._processed["next_fixture"]

    def today(self) -> list[dict[str, Any]]:
        return self._owner._processed["matches_today"]

    def this_week(self) -> list[dict[str, Any]]:
        return self._owner._processed["matches_this_week"]


class LiveEngine:
    """Processed live match access."""

    def __init__(self, owner: "FootballHubEngine") -> None:
        self._owner = owner

    def matches(self) -> list[dict[str, Any]]:
        return self._owner._processed["live"]

    def primary(self) -> dict[str, Any]:
        return self._owner._processed["primary_live"]

    def events(self) -> list[dict[str, Any]]:
        return self._owner._processed["live_events"]

    def statistics(self) -> list[dict[str, Any]]:
        return self._owner._processed["live_statistics"]

    def lineups(self) -> list[dict[str, Any]]:
        return self._owner._processed["live_lineups"]

    def details(self, fixture_id: int | str) -> dict[str, Any]:
        """Return processed live details for one fixture."""
        return self._owner._processed.get("live_details", {}).get(str(fixture_id), {})


class ResultsEngine:
    """Processed results access."""

    def __init__(self, owner: "FootballHubEngine") -> None:
        self._owner = owner

    def all(self) -> list[dict[str, Any]]:
        return self._owner._processed["results"]

    def last(self) -> dict[str, Any]:
        return self._owner._processed["last_result"]

    def latest(self, limit: int = 5) -> list[dict[str, Any]]:
        return self._owner._processed["results"][:limit]


class StandingsEngine:
    """Processed standings access."""

    def __init__(self, owner: "FootballHubEngine") -> None:
        self._owner = owner

    def table(self) -> list[dict[str, Any]]:
        return self._owner._processed["standings"]


class FootballHubEngine:
    """Process coordinator data once and share it across all sensors."""

    def __init__(self) -> None:
        self._processed: dict[str, Any] = {}
        self.fixtures = FixtureEngine(self)
        self.live = LiveEngine(self)
        self.results = ResultsEngine(self)
        self.standings = StandingsEngine(self)
        self.top_scorers: list[dict[str, Any]] = []
        self.top_assists: list[dict[str, Any]] = []
        self.update({})

    def update(self, data: dict[str, Any] | None) -> None:
        """Rebuild processed data from the latest coordinator payload."""
        payload = data or {}
        raw_fixtures = payload.get("fixtures", []) or []
        raw_live = payload.get("live", []) or []
        raw_standings = payload.get("standings", []) or []

        processed_results = all_results(raw_fixtures)
        processed_live_details = {}
        for fixture_id, details in (payload.get("live_details", {}) or {}).items():
            processed_live_details[str(fixture_id)] = {
                "events": process_events(details.get("events", []) or []),
                "statistics": process_statistics(details.get("statistics", []) or []),
                "lineups": process_lineups(details.get("lineups", []) or []),
            }
        self._processed = {
            "fixtures": upcoming(raw_fixtures),
            "next_fixture": next_fixture(raw_fixtures),
            "matches_today": fixtures_today(raw_fixtures),
            "matches_this_week": this_week(raw_fixtures),
            "live": live_matches(raw_live),
            "primary_live": primary_live_match(raw_live),
            "live_events": process_events(payload.get("live_events", []) or []),
            "live_statistics": process_statistics(payload.get("live_statistics", []) or []),
            "live_lineups": process_lineups(payload.get("live_lineups", []) or []),
            "live_details": processed_live_details,
            "results": processed_results,
            "last_result": processed_results[0] if processed_results else {},
            "standings": league_table(raw_standings),
        }
        self.top_scorers = process_top_scorers(payload.get("top_scorers", []) or [])
        self.top_assists = process_top_assists(payload.get("top_assists", []) or [])


__all__ = [
    "FootballHubEngine",
    "all_results",
    "fixtures_today",
    "last_result",
    "latest",
    "league_table",
    "live_matches",
    "next_fixture",
    "primary_live_match",
    "this_week",
    "upcoming",
]

