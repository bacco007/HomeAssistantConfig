from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def normalize_recent_games(
    events: list[Any],
    favorite_team: str,
    *,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """Return the favorite team's most recent completed games."""
    favorite = str(favorite_team or "").strip().upper()
    if not favorite or not isinstance(events, list):
        return []

    completed: list[tuple[datetime, dict[str, Any]]] = []
    for event in events:
        if not isinstance(event, dict):
            continue
        competition = _competition(event)
        if not competition:
            continue
        favorite_competitor, opponent = _matchup(competition, favorite)
        if not favorite_competitor or not opponent:
            continue
        if _state(event, competition) != "post":
            continue
        when = _datetime(competition.get("date") or event.get("date"))
        if when is None:
            continue
        completed.append(
            (
                when,
                _recent_game(event, competition, favorite_competitor, opponent),
            )
        )

    completed.sort(key=lambda item: item[0], reverse=True)
    return [item[1] for item in completed[: max(0, int(limit))]]


def recent_form(games: list[Any]) -> str | None:
    """Return a compact W/L/T form string for recent normalized games."""
    if not isinstance(games, list):
        return None
    values = [
        str(game.get("result") or "").upper()
        for game in games
        if isinstance(game, dict) and str(game.get("result") or "").upper() in {"W", "L", "T"}
    ]
    return "".join(values) or None


def _recent_game(
    event: dict[str, Any],
    competition: dict[str, Any],
    favorite: dict[str, Any],
    opponent: dict[str, Any],
) -> dict[str, Any]:
    favorite_score = _score(favorite)
    opponent_score = _score(opponent)
    result = _result(favorite_score, opponent_score)
    venue = competition.get("venue") if isinstance(competition.get("venue"), dict) else {}
    status = competition.get("status") if isinstance(competition.get("status"), dict) else event.get("status")
    status_type = status.get("type") if isinstance(status, dict) and isinstance(status.get("type"), dict) else {}
    week = event.get("week") if isinstance(event.get("week"), dict) else {}
    season = event.get("season") if isinstance(event.get("season"), dict) else {}

    return {
        "event_id": event.get("id"),
        "date": competition.get("date") or event.get("date"),
        "week": _int(week.get("number")),
        "season_year": _int(season.get("year")),
        "season_type": season.get("type") or season.get("slug"),
        "home_away": favorite.get("homeAway"),
        "opponent": _team_abbreviation(opponent),
        "opponent_name": _team_name(opponent),
        "opponent_logo": _team_logo(opponent),
        "favorite_score": favorite_score,
        "opponent_score": opponent_score,
        "result": result,
        "margin": (
            favorite_score - opponent_score
            if favorite_score is not None and opponent_score is not None
            else None
        ),
        "score": (
            f"{favorite_score}-{opponent_score}"
            if favorite_score is not None and opponent_score is not None
            else None
        ),
        "status_detail": status_type.get("shortDetail") or status_type.get("detail"),
        "venue": venue.get("fullName"),
        "broadcasts": _broadcasts(competition),
    }


def _competition(event: dict[str, Any]) -> dict[str, Any]:
    competitions = event.get("competitions")
    if not isinstance(competitions, list) or not competitions:
        return {}
    competition = competitions[0]
    return competition if isinstance(competition, dict) else {}


def _matchup(
    competition: dict[str, Any],
    favorite: str,
) -> tuple[dict[str, Any], dict[str, Any]]:
    favorite_competitor: dict[str, Any] = {}
    opponent: dict[str, Any] = {}
    competitors = competition.get("competitors")
    if not isinstance(competitors, list):
        return favorite_competitor, opponent
    for competitor in competitors:
        if not isinstance(competitor, dict):
            continue
        if _team_abbreviation(competitor) == favorite:
            favorite_competitor = competitor
        else:
            opponent = competitor
    return favorite_competitor, opponent


def _state(event: dict[str, Any], competition: dict[str, Any]) -> str | None:
    status = competition.get("status") if isinstance(competition.get("status"), dict) else event.get("status")
    if not isinstance(status, dict):
        return None
    status_type = status.get("type")
    if not isinstance(status_type, dict):
        return None
    value = status_type.get("state")
    return str(value).lower() if value is not None else None


def _score(competitor: dict[str, Any]) -> int | None:
    value = competitor.get("score")
    if isinstance(value, dict):
        value = value.get("value") or value.get("displayValue")
    return _int(value)


def _result(favorite_score: int | None, opponent_score: int | None) -> str | None:
    if favorite_score is None or opponent_score is None:
        return None
    if favorite_score > opponent_score:
        return "W"
    if favorite_score < opponent_score:
        return "L"
    return "T"


def _team_abbreviation(competitor: dict[str, Any]) -> str | None:
    team = competitor.get("team") if isinstance(competitor.get("team"), dict) else {}
    value = team.get("abbreviation")
    return str(value).upper() if value else None


def _team_name(competitor: dict[str, Any]) -> str | None:
    team = competitor.get("team") if isinstance(competitor.get("team"), dict) else {}
    value = team.get("displayName") or team.get("shortDisplayName") or team.get("name")
    return str(value) if value else None


def _team_logo(competitor: dict[str, Any]) -> str | None:
    team = competitor.get("team") if isinstance(competitor.get("team"), dict) else {}
    value = team.get("logo")
    if value:
        return str(value)
    logos = team.get("logos")
    if isinstance(logos, list):
        for item in logos:
            if isinstance(item, dict) and (item.get("href") or item.get("url")):
                return str(item.get("href") or item.get("url"))
    return None


def _broadcasts(competition: dict[str, Any]) -> list[str]:
    values: list[str] = []
    broadcasts = competition.get("broadcasts")
    if not isinstance(broadcasts, list):
        return values
    for broadcast in broadcasts:
        if not isinstance(broadcast, dict):
            continue
        names = broadcast.get("names")
        if isinstance(names, list):
            values.extend(str(name) for name in names if name)
    return values


def _datetime(value: Any) -> datetime | None:
    if not value:
        return None
    text = str(value).strip()
    if text.endswith("Z"):
        text = f"{text[:-1]}+00:00"
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _int(value: Any) -> int | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        return int(float(str(value).strip()))
    except (TypeError, ValueError):
        return None
