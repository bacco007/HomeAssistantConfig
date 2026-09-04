from __future__ import annotations

from collections import OrderedDict
from typing import Any


def normalize_postseason(payload: dict[str, Any], *, league: str, season: int | None, updated_at: str | None = None) -> dict[str, Any]:
    """Normalize ESPN postseason scoreboard events without inventing bracket links."""
    if not isinstance(payload, dict): raise ValueError("ESPN postseason response was not a JSON object")
    events = payload.get("events")
    if not isinstance(events, list): raise ValueError("ESPN postseason response did not contain events")
    round_map: OrderedDict[str, dict[str, Any]] = OrderedDict(); all_games: list[dict[str, Any]] = []
    for raw_event in events:
        game = _game(raw_event)
        if not game: continue
        all_games.append(game); round_name, round_source = _round(raw_event, game)
        round_item = round_map.setdefault(round_name, {"name": round_name, "source": round_source, "series": []})
        series_key = game.get("series_id") or game.get("series_key") or game.get("event_id")
        series = next((item for item in round_item["series"] if item.get("key") == series_key), None)
        if series is None:
            series = {"key": series_key, "title": game.get("series_title"), "summary": game.get("series_summary"), "completed": game.get("series_completed"), "total_games": game.get("series_total_games"), "teams": game.get("teams", []), "games": [], "source": "espn_series" if game.get("series_id") else "derived_same_matchup_group"}
            round_item["series"].append(series)
        series["games"].append(game)
        if game.get("series_title"): series["title"] = game["series_title"]
        if game.get("series_summary"): series["summary"] = game["series_summary"]
        if game.get("series_completed") is not None: series["completed"] = game["series_completed"]
        if game.get("series_total_games") is not None: series["total_games"] = game["series_total_games"]
    rounds = list(round_map.values())
    for item in rounds:
        for series in item["series"]: series["games"].sort(key=lambda game: str(game.get("date") or ""))
    return {"league": league, "data_type": "postseason", "season": season, "updated_at": updated_at, "rounds": rounds, "games": sorted(all_games, key=lambda game: str(game.get("date") or "")), "has_postseason_data": bool(all_games), "normalization": {"rounds": "ESPN series title / event note / week label; generic Postseason fallback only", "series": "ESPN series id when available; otherwise same-round matchup grouping", "bracket_links_inferred": False, "raw_response_exposed": False}}


def _game(raw_event: Any) -> dict[str, Any] | None:
    if not isinstance(raw_event, dict): return None
    competitions = raw_event.get("competitions")
    if not isinstance(competitions, list) or not competitions or not isinstance(competitions[0], dict): return None
    competition = competitions[0]; competitors = competition.get("competitors")
    if not isinstance(competitors, list) or len(competitors) < 2: return None
    teams = []
    for competitor in competitors:
        if not isinstance(competitor, dict): continue
        team = competitor.get("team") if isinstance(competitor.get("team"), dict) else {}
        teams.append({"team_id": team.get("id"), "abbreviation": _text(team.get("abbreviation"), upper=True), "display_name": team.get("displayName") or team.get("name"), "logo": _logo(team), "home_away": competitor.get("homeAway"), "score": _number(competitor.get("score")), "winner": competitor.get("winner") if isinstance(competitor.get("winner"), bool) else None, "seed": _seed(competitor)})
    if len(teams) < 2: return None
    status = competition.get("status") if isinstance(competition.get("status"), dict) else raw_event.get("status"); status_type = status.get("type") if isinstance(status, dict) and isinstance(status.get("type"), dict) else {}
    series = competition.get("series") if isinstance(competition.get("series"), dict) else {}; series_id = series.get("id") or series.get("uid"); series_title = series.get("title") or series.get("name"); series_summary = series.get("summary")
    matchup_key = "-".join(sorted(str(team.get("team_id") or team.get("abbreviation") or "") for team in teams))
    return {"event_id": raw_event.get("id"), "date": competition.get("date") or raw_event.get("date"), "name": raw_event.get("name"), "short_name": raw_event.get("shortName"), "status": status_type.get("state"), "status_detail": status_type.get("shortDetail") or status_type.get("detail"), "teams": teams, "venue": _venue(competition), "broadcasts": _broadcasts(competition), "notes": _notes(competition), "series_id": str(series_id) if series_id not in (None, "") else None, "series_key": matchup_key, "series_title": str(series_title) if series_title else None, "series_summary": str(series_summary) if series_summary else None, "series_completed": series.get("completed") if isinstance(series.get("completed"), bool) else None, "series_total_games": _int(series.get("totalCompetitions") or series.get("totalGames")), "week": _week(raw_event)}

def _round(raw_event: dict[str, Any], game: dict[str, Any]) -> tuple[str, str]:
    if game.get("series_title"):
        for note in game.get("notes", []):
            if _roundish(note): return str(note), "espn_note"
        if _roundish(game["series_title"]): return str(game["series_title"]), "espn_series_title"
    for note in game.get("notes", []):
        if note: return str(note), "espn_note"
    week = raw_event.get("week")
    if isinstance(week, dict):
        text = week.get("text") or week.get("displayName") or week.get("name")
        if text: return str(text), "espn_week"
    return "Postseason", "generic_fallback"
def _roundish(value: Any) -> bool:
    text = str(value or "").lower(); return any(token in text for token in ("wild card", "wildcard", "division", "conference", "semifinal", "final", "championship", "world series", "stanley cup", "first round", "second round"))
def _seed(competitor: dict[str, Any]) -> int | None:
    value = competitor.get("seed"); curated = competitor.get("curatedRank")
    if value is None and isinstance(curated, dict): value = curated.get("current")
    return _int(value)
def _week(event: dict[str, Any]) -> int | None:
    week = event.get("week"); return _int(week.get("number")) if isinstance(week, dict) else _int(week)
def _notes(competition: dict[str, Any]) -> list[str]:
    result = []
    for note in competition.get("notes", []) if isinstance(competition.get("notes"), list) else []:
        if isinstance(note, dict) and (note.get("headline") or note.get("text")): result.append(str(note.get("headline") or note.get("text")))
    return result
def _venue(competition: dict[str, Any]) -> str | None:
    venue = competition.get("venue"); value = venue.get("fullName") or venue.get("name") if isinstance(venue, dict) else None; return str(value) if value else None
def _broadcasts(competition: dict[str, Any]) -> list[str]:
    result = []
    for broadcast in competition.get("broadcasts", []) if isinstance(competition.get("broadcasts"), list) else []:
        if isinstance(broadcast, dict) and isinstance(broadcast.get("names"), list): result.extend(str(name) for name in broadcast["names"] if name)
    return list(dict.fromkeys(result))
def _logo(team: dict[str, Any]) -> str | None:
    if team.get("logo"): return str(team["logo"])
    for item in team.get("logos", []) if isinstance(team.get("logos"), list) else []:
        if isinstance(item, dict) and (item.get("href") or item.get("url")): return str(item.get("href") or item.get("url"))
    return None
def _number(value: Any) -> int | float | None:
    if isinstance(value, dict): value = value.get("value") if value.get("value") is not None else value.get("displayValue")
    if value is None or isinstance(value, bool): return None
    try: number = float(str(value).strip())
    except ValueError: return None
    return int(number) if number.is_integer() else number
def _text(value: Any, *, upper: bool = False) -> str | None:
    if value is None: return None
    text = str(value).strip(); return text.upper() if upper and text else text or None
def _int(value: Any) -> int | None:
    if value is None or isinstance(value, bool): return None
    try: return int(float(str(value).strip()))
    except (TypeError, ValueError): return None
