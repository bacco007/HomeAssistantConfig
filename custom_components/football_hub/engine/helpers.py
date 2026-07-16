"""Shared Football Hub engine helpers."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

FINISHED_STATUS = {"FT", "AET", "PEN"}
NOT_STARTED_STATUS = {"NS", "TBD"}
LIVE_STATUS = {"1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"}

STATUS_NAMES = {
    "TBD": "Time To Be Defined",
    "NS": "Not Started",
    "1H": "First Half",
    "HT": "Half Time",
    "2H": "Second Half",
    "ET": "Extra Time",
    "BT": "Break Time",
    "P": "Penalty In Progress",
    "SUSP": "Suspended",
    "INT": "Interrupted",
    "FT": "Full Time",
    "AET": "After Extra Time",
    "PEN": "Penalties",
    "PST": "Postponed",
    "CANC": "Cancelled",
    "ABD": "Abandoned",
    "AWD": "Technical Loss",
    "WO": "Walkover",
}


def now_timestamp() -> int:
    """Return current UTC timestamp."""
    return int(datetime.now(timezone.utc).timestamp())


def get_path(data: dict[str, Any], *path: str, default=None):
    """Safely get nested dict value."""
    current = data
    for item in path:
        if not isinstance(current, dict):
            return default
        current = current.get(item)
    return default if current is None else current


def status_short(match: dict[str, Any]) -> str | None:
    """Return fixture short status."""
    return get_path(match, "fixture", "status", "short")


def status_long(match: dict[str, Any]) -> str | None:
    """Return readable fixture status."""
    short = status_short(match)
    long_status = get_path(match, "fixture", "status", "long")
    return long_status or STATUS_NAMES.get(short, short)


def fixture_timestamp(match: dict[str, Any]) -> int:
    """Return fixture timestamp."""
    return get_path(match, "fixture", "timestamp", default=0) or 0


def is_finished(match: dict[str, Any]) -> bool:
    """Return true if fixture is finished."""
    return status_short(match) in FINISHED_STATUS


def is_not_started(match: dict[str, Any]) -> bool:
    """Return true if fixture has not started."""
    return status_short(match) in NOT_STARTED_STATUS


def is_live(match: dict[str, Any]) -> bool:
    """Return true if fixture is live."""
    return status_short(match) in LIVE_STATUS


def sort_by_time(matches: list[dict[str, Any]], reverse: bool = False) -> list[dict[str, Any]]:
    """Sort matches by timestamp."""
    return sorted(matches or [], key=fixture_timestamp, reverse=reverse)


def clean_fixture(match: dict[str, Any] | None) -> dict[str, Any]:
    """Convert API-Football fixture response into a small Football Hub fixture object."""
    if not match:
        return {}

    fixture = match.get("fixture", {}) or {}
    league = match.get("league", {}) or {}
    teams = match.get("teams", {}) or {}
    goals = match.get("goals", {}) or {}
    score = match.get("score", {}) or {}
    venue = fixture.get("venue", {}) or {}
    status = fixture.get("status", {}) or {}
    home = teams.get("home", {}) or {}
    away = teams.get("away", {}) or {}

    short = status.get("short")

    return {
        "fixture_id": fixture.get("id"),
        "kickoff": fixture.get("date"),
        "timestamp": fixture.get("timestamp"),
        "timezone": fixture.get("timezone"),
        "status": status.get("long") or STATUS_NAMES.get(short, short),
        "status_short": short,
        "elapsed": status.get("elapsed"),
        "league": league.get("name"),
        "league_id": league.get("id"),
        "country": league.get("country"),
        "season": league.get("season"),
        "round": league.get("round"),
        "home_team": home.get("name"),
        "home_team_id": home.get("id"),
        "home_logo": home.get("logo"),
        "home_winner": home.get("winner"),
        "away_team": away.get("name"),
        "away_team_id": away.get("id"),
        "away_logo": away.get("logo"),
        "away_winner": away.get("winner"),
        "home_goals": goals.get("home"),
        "away_goals": goals.get("away"),
        "score_halftime_home": get_path(score, "halftime", "home"),
        "score_halftime_away": get_path(score, "halftime", "away"),
        "score_fulltime_home": get_path(score, "fulltime", "home"),
        "score_fulltime_away": get_path(score, "fulltime", "away"),
        "score_extratime_home": get_path(score, "extratime", "home"),
        "score_extratime_away": get_path(score, "extratime", "away"),
        "score_penalty_home": get_path(score, "penalty", "home"),
        "score_penalty_away": get_path(score, "penalty", "away"),
        "stadium": venue.get("name"),
        "city": venue.get("city"),
    }


def limit_items(items: list[Any], limit: int = 20) -> list[Any]:
    """Limit list size for Home Assistant attributes."""
    return (items or [])[:limit]
