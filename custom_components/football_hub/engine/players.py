"""Players engine for Football Hub."""

from __future__ import annotations

from typing import Any


def clean_player_stat(item: dict[str, Any]) -> dict[str, Any]:
    """Convert API-Football player stat into a smaller object."""
    player = item.get("player", {}) or {}
    stats = (item.get("statistics") or [{}])[0] or {}
    team = stats.get("team", {}) or {}
    games = stats.get("games", {}) or {}
    goals = stats.get("goals", {}) or {}
    cards = stats.get("cards", {}) or {}

    return {
        "player_id": player.get("id"),
        "name": player.get("name"),
        "firstname": player.get("firstname"),
        "lastname": player.get("lastname"),
        "age": player.get("age"),
        "photo": player.get("photo"),
        "team": team.get("name"),
        "team_id": team.get("id"),
        "team_logo": team.get("logo"),
        "appearances": games.get("appearences"),
        "position": games.get("position"),
        "rating": games.get("rating"),
        "goals": goals.get("total"),
        "assists": goals.get("assists"),
        "yellow_cards": cards.get("yellow"),
        "red_cards": cards.get("red"),
    }


def top_scorers(raw: list[dict[str, Any]], limit: int = 20) -> list[dict[str, Any]]:
    """Return clean top scorers."""
    return [clean_player_stat(item) for item in (raw or [])[:limit]]


def top_assists(raw: list[dict[str, Any]], limit: int = 20) -> list[dict[str, Any]]:
    """Return clean top assists."""
    return [clean_player_stat(item) for item in (raw or [])[:limit]]
