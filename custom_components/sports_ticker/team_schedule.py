from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def normalize_recent_games(events: list[Any], favorite_team: str, *, limit: int = 5) -> list[dict[str, Any]]:
    """Return the favorite team's most recent completed games."""
    favorite = str(favorite_team or "").strip().upper()
    if not favorite or not isinstance(events, list): return []
    completed: list[tuple[datetime, dict[str, Any]]] = []
    for event in events:
        normalized = _normalized_game(event, favorite)
        if not normalized or normalized.get("status") != "post": continue
        when = _datetime(normalized.get("date"))
        if when is not None: completed.append((when, normalized))
    completed.sort(key=lambda item: item[0], reverse=True)
    return [item[1] for item in completed[: max(0, int(limit))]]


def normalize_upcoming_games(events: list[Any], favorite_team: str, *, limit: int = 5) -> list[dict[str, Any]]:
    """Return the favorite team's next scheduled games."""
    favorite = str(favorite_team or "").strip().upper()
    if not favorite or not isinstance(events, list): return []
    now = datetime.now(timezone.utc); upcoming: list[tuple[datetime, dict[str, Any]]] = []
    for event in events:
        normalized = _normalized_game(event, favorite)
        if not normalized or normalized.get("status") not in {None, "pre"}: continue
        when = _datetime(normalized.get("date"))
        if when is not None and when > now: upcoming.append((when, normalized))
    upcoming.sort(key=lambda item: item[0])
    return [item[1] for item in upcoming[: max(0, int(limit))]]


def recent_form(games: list[Any]) -> str | None:
    if not isinstance(games, list): return None
    values = [str(game.get("result") or "").upper() for game in games if isinstance(game, dict) and str(game.get("result") or "").upper() in {"W", "L", "T"}]
    return "".join(values) or None


def recent_record(games: list[Any]) -> str | None:
    if not isinstance(games, list): return None
    results = [str(game.get("result") or "").upper() for game in games if isinstance(game, dict) and str(game.get("result") or "").upper() in {"W", "L", "T"}]
    if not results: return None
    wins, losses, ties = results.count("W"), results.count("L"), results.count("T")
    return f"{wins}-{losses}" + (f"-{ties}" if ties else "")


def current_streak(games: list[Any]) -> str | None:
    if not isinstance(games, list) or not games: return None
    first = games[0] if isinstance(games[0], dict) else {}; result = str(first.get("result") or "").upper()
    if result not in {"W", "L", "T"}: return None
    count = 0
    for game in games:
        if not isinstance(game, dict) or str(game.get("result") or "").upper() != result: break
        count += 1
    return f"{result}{count}" if count else None


def _normalized_game(event: Any, favorite: str) -> dict[str, Any] | None:
    if not isinstance(event, dict): return None
    competition = _competition(event)
    if not competition: return None
    favorite_competitor, opponent = _matchup(competition, favorite)
    if not favorite_competitor or not opponent: return None
    favorite_score, opponent_score = _score(favorite_competitor), _score(opponent)
    status = _state(event, competition); result = _result(favorite_score, opponent_score) if status == "post" else None
    venue = competition.get("venue") if isinstance(competition.get("venue"), dict) else {}
    status_obj = competition.get("status") if isinstance(competition.get("status"), dict) else event.get("status")
    status_type = status_obj.get("type") if isinstance(status_obj, dict) and isinstance(status_obj.get("type"), dict) else {}
    week = event.get("week") if isinstance(event.get("week"), dict) else {}; season = event.get("season") if isinstance(event.get("season"), dict) else {}
    favorite_abbr, opponent_abbr = _team_abbreviation(favorite_competitor), _team_abbreviation(opponent); home_away = favorite_competitor.get("homeAway")
    matchup = f"{favorite_abbr} vs {opponent_abbr}" if home_away == "home" and favorite_abbr and opponent_abbr else f"{favorite_abbr} @ {opponent_abbr}" if home_away == "away" and favorite_abbr and opponent_abbr else event.get("shortName") or event.get("name")
    return {"event_id": event.get("id"), "date": competition.get("date") or event.get("date"), "week": _int(week.get("number")), "season_year": _int(season.get("year")), "season_type": season.get("type") or season.get("slug"), "home_away": home_away, "matchup": matchup, "opponent": opponent_abbr, "opponent_name": _team_name(opponent), "opponent_logo": _team_logo(opponent), "favorite_score": favorite_score, "opponent_score": opponent_score, "result": result, "margin": favorite_score - opponent_score if favorite_score is not None and opponent_score is not None else None, "score": f"{favorite_score}-{opponent_score}" if favorite_score is not None and opponent_score is not None else None, "status": status, "status_detail": status_type.get("shortDetail") or status_type.get("detail"), "venue": venue.get("fullName"), "broadcasts": _broadcasts(competition)}


def _competition(event: dict[str, Any]) -> dict[str, Any]:
    competitions = event.get("competitions")
    if not isinstance(competitions, list) or not competitions: return {}
    competition = competitions[0]; return competition if isinstance(competition, dict) else {}

def _matchup(competition: dict[str, Any], favorite: str) -> tuple[dict[str, Any], dict[str, Any]]:
    favorite_competitor: dict[str, Any] = {}; opponent: dict[str, Any] = {}; competitors = competition.get("competitors")
    if not isinstance(competitors, list): return favorite_competitor, opponent
    for competitor in competitors:
        if not isinstance(competitor, dict): continue
        if _team_abbreviation(competitor) == favorite: favorite_competitor = competitor
        elif not opponent: opponent = competitor
    return favorite_competitor, opponent

def _state(event: dict[str, Any], competition: dict[str, Any]) -> str | None:
    status = competition.get("status") if isinstance(competition.get("status"), dict) else event.get("status")
    if not isinstance(status, dict): return None
    status_type = status.get("type")
    if not isinstance(status_type, dict): return None
    value = status_type.get("state"); return str(value).lower() if value is not None else None

def _score(competitor: dict[str, Any]) -> int | float | None:
    value = competitor.get("score")
    if isinstance(value, dict): value = value.get("value") if value.get("value") is not None else value.get("displayValue")
    if value is None or isinstance(value, bool): return None
    try: number = float(str(value).strip())
    except ValueError: return None
    return int(number) if number.is_integer() else number

def _result(favorite_score: int | float | None, opponent_score: int | float | None) -> str | None:
    if favorite_score is None or opponent_score is None: return None
    if favorite_score > opponent_score: return "W"
    if favorite_score < opponent_score: return "L"
    return "T"
def _team_abbreviation(competitor: dict[str, Any]) -> str | None:
    team = competitor.get("team") if isinstance(competitor.get("team"), dict) else {}; value = team.get("abbreviation"); return str(value).upper() if value else None
def _team_name(competitor: dict[str, Any]) -> str | None:
    team = competitor.get("team") if isinstance(competitor.get("team"), dict) else {}; value = team.get("displayName") or team.get("shortDisplayName") or team.get("name"); return str(value) if value else None
def _team_logo(competitor: dict[str, Any]) -> str | None:
    team = competitor.get("team") if isinstance(competitor.get("team"), dict) else {}; value = team.get("logo")
    if value: return str(value)
    logos = team.get("logos")
    if isinstance(logos, list):
        for item in logos:
            if isinstance(item, dict) and (item.get("href") or item.get("url")): return str(item.get("href") or item.get("url"))
    return None
def _broadcasts(competition: dict[str, Any]) -> list[str]:
    values: list[str] = []; broadcasts = competition.get("broadcasts")
    if not isinstance(broadcasts, list): return values
    for broadcast in broadcasts:
        if isinstance(broadcast, dict) and isinstance(broadcast.get("names"), list): values.extend(str(name) for name in broadcast["names"] if name)
    return list(dict.fromkeys(values))
def _datetime(value: Any) -> datetime | None:
    if not value: return None
    text = str(value).strip(); text = f"{text[:-1]}+00:00" if text.endswith("Z") else text
    try: parsed = datetime.fromisoformat(text)
    except ValueError: return None
    if parsed.tzinfo is None: parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)
def _int(value: Any) -> int | None:
    if value is None or isinstance(value, bool): return None
    try: return int(float(str(value).strip()))
    except (TypeError, ValueError): return None
