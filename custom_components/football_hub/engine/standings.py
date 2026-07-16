"""Standings engine for Football Hub."""

from __future__ import annotations

from typing import Any


def league_table(raw_standings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return a clean league table."""
    if not raw_standings:
        return []

    league = raw_standings[0].get("league", {}) or {}
    standings = league.get("standings") or []
    rows = standings[0] if standings else []

    table = []
    for row in rows:
        team = row.get("team", {}) or {}
        all_stats = row.get("all", {}) or {}
        goals = all_stats.get("goals", {}) or {}
        table.append(
            {
                "rank": row.get("rank"),
                "team_id": team.get("id"),
                "team": team.get("name"),
                "logo": team.get("logo"),
                "points": row.get("points"),
                "goals_diff": row.get("goalsDiff"),
                "group": row.get("group"),
                "form": row.get("form"),
                "status": row.get("status"),
                "description": row.get("description"),
                "played": all_stats.get("played"),
                "won": all_stats.get("win"),
                "drawn": all_stats.get("draw"),
                "lost": all_stats.get("lose"),
                "goals_for": goals.get("for"),
                "goals_against": goals.get("against"),
            }
        )

    return table
