"""Live engine for Football Hub."""

from __future__ import annotations

from typing import Any

from .helpers import clean_fixture, sort_by_time


def live_matches(raw_live: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return live matches as clean objects."""
    return [clean_fixture(match) for match in sort_by_time(raw_live or [])]


def primary_live_match(raw_live: list[dict[str, Any]]) -> dict[str, Any]:
    """Return the first live match."""
    matches = live_matches(raw_live)
    return matches[0] if matches else {}


def live_match_state(raw_live: list[dict[str, Any]]) -> str:
    """Return a useful state for the primary live match."""
    match = primary_live_match(raw_live)
    if not match:
        return "No live match"

    status = match.get("status_short") or "LIVE"
    elapsed = match.get("elapsed")

    if status in {"1H", "2H", "ET"} and elapsed is not None:
        return f"{elapsed}'"

    return status


def process_events(raw_events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return compact, ordered live events."""
    events: list[dict[str, Any]] = []
    for item in raw_events or []:
        time_data = item.get("time", {}) or {}
        team = item.get("team", {}) or {}
        player = item.get("player", {}) or {}
        assist = item.get("assist", {}) or {}
        events.append(
            {
                "elapsed": time_data.get("elapsed"),
                "extra": time_data.get("extra"),
                "team": team.get("name"),
                "team_id": team.get("id"),
                "player": player.get("name"),
                "assist": assist.get("name"),
                "type": item.get("type"),
                "detail": item.get("detail"),
                "comments": item.get("comments"),
            }
        )
    return sorted(
        events,
        key=lambda event: (
            event.get("elapsed") or 0,
            event.get("extra") or 0,
        ),
    )


def process_statistics(raw_statistics: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return compact team statistics."""
    teams: list[dict[str, Any]] = []
    for item in raw_statistics or []:
        team = item.get("team", {}) or {}
        stats = {}
        for stat in item.get("statistics", []) or []:
            stat_type = stat.get("type")
            if stat_type:
                stats[stat_type] = stat.get("value")
        teams.append(
            {
                "team": team.get("name"),
                "team_id": team.get("id"),
                "logo": team.get("logo"),
                "statistics": stats,
            }
        )
    return teams


def process_lineups(raw_lineups: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return compact starting line-ups and substitutes."""
    lineups: list[dict[str, Any]] = []
    for item in raw_lineups or []:
        team = item.get("team", {}) or {}
        coach = item.get("coach", {}) or {}
        formation = item.get("formation")
        start_xi = []
        for row in item.get("startXI", []) or []:
            player = row.get("player", {}) or {}
            start_xi.append(
                {
                    "id": player.get("id"),
                    "name": player.get("name"),
                    "number": player.get("number"),
                    "position": player.get("pos"),
                    "grid": player.get("grid"),
                }
            )
        substitutes = []
        for row in item.get("substitutes", []) or []:
            player = row.get("player", {}) or {}
            substitutes.append(
                {
                    "id": player.get("id"),
                    "name": player.get("name"),
                    "number": player.get("number"),
                    "position": player.get("pos"),
                }
            )
        lineups.append(
            {
                "team": team.get("name"),
                "team_id": team.get("id"),
                "logo": team.get("logo"),
                "coach": coach.get("name"),
                "formation": formation,
                "starting_xi": start_xi,
                "substitutes": substitutes,
            }
        )
    return lineups
