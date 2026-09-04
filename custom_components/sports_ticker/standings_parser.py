from __future__ import annotations

import re
from typing import Any


PLAYOFF_RULES: dict[str, dict[str, Any]] = {
    "mlb": {"cut_line": 6, "automatic_cut_line": 6, "wildcard_start": 4, "wildcard_end": 6, "scope": "league", "source": "mlb_rule"},
    "nba": {"cut_line": 10, "automatic_cut_line": 6, "play_in_start": 7, "play_in_end": 10, "scope": "conference", "source": "nba_rule"},
    "wnba": {"cut_line": 8, "automatic_cut_line": 8, "scope": "league", "source": "wnba_rule"},
    "nhl": {"cut_line": 8, "automatic_cut_line": None, "scope": "conference", "source": "nhl_rule", "note": "Qualification is division/wild-card based; in_playoffs is only derived when ESPN provides playoffSeed."},
    "soccer": {"cut_line": None, "automatic_cut_line": None, "scope": "table", "source": None},
}


def normalize_league_standings(payload: dict[str, Any], *, league: str, profile: str, favorite_team: str | None = None, updated_at: str | None = None) -> dict[str, Any]:
    """Normalize ESPN standings into a predictable cross-sport structure."""
    if not isinstance(payload, dict):
        raise ValueError("ESPN standings response was not a JSON object")
    favorite = str(favorite_team).strip().upper() if favorite_team else None
    occurrences = _standings_occurrences(payload)
    if not occurrences:
        raise ValueError("ESPN standings response did not contain team entries")

    teams_by_key: dict[str, dict[str, Any]] = {}
    for occurrence in occurrences:
        path = occurrence["path"]
        entries = occurrence["entries"]
        for order, entry in enumerate(entries, 1):
            if not isinstance(entry, dict):
                continue
            key = _team_key(entry)
            if not key:
                continue
            item = teams_by_key.setdefault(key, {"team": {}, "stats": {}, "occurrences": []})
            team = entry.get("team") if isinstance(entry.get("team"), dict) else {}
            item["team"] = _merge_dict(item["team"], team)
            item["stats"] = _merge_stats(item["stats"], _stats(entry.get("stats")))
            item["occurrences"].append({"path": path, "order": order})

    rows: list[dict[str, Any]] = []
    for item in teams_by_key.values():
        row = _team_row(item, profile=profile, favorite=favorite)
        if row.get("abbreviation") or row.get("team_id"):
            rows.append(row)
    if not rows:
        raise ValueError("ESPN standings response contained no usable teams")

    rows.sort(key=_row_sort)
    aliases = _group_aliases(rows, profile)
    playoff = _playoff_metadata(profile)
    season_type = _season_type(payload)
    regular = season_type in (None, 2)
    playoff["derived_helpers_apply"] = regular
    for row in rows:
        _apply_derived_playoff_fields(row, profile, regular=regular)

    result: dict[str, Any] = {
        "league": league,
        "data_type": "standings",
        "profile": profile,
        "season": _season_year(payload),
        "season_type": season_type,
        "season_type_name": _season_type_name(payload),
        "favorite_team": favorite,
        "updated_at": updated_at,
        "groups": aliases["groups"],
        "divisions": _divisions(rows),
        "teams": rows,
        "playoff": playoff,
        "normalization": {
            "raw_response_exposed": False,
            "clincher_codes_preserved": True,
            "derived_fields": ["division_leader", "wildcard", "play_in", "in_playoffs", "in_the_hunt"],
            "unknown_optional_fields": "null",
        },
    }
    result.update(aliases["top_level"])
    return result


def _standings_occurrences(payload: dict[str, Any]) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    root_standings = payload.get("standings")
    if isinstance(root_standings, dict) and isinstance(root_standings.get("entries"), list):
        found.append({"path": [], "entries": root_standings["entries"]})
    children = payload.get("children")
    if not isinstance(children, list):
        children = []

    def walk(node: Any, path: list[str]) -> None:
        if not isinstance(node, dict):
            return
        name = _group_name(node)
        next_path = [*path, name] if name else list(path)
        standings = node.get("standings")
        if isinstance(standings, dict) and isinstance(standings.get("entries"), list):
            found.append({"path": next_path, "entries": standings["entries"]})
        nested = node.get("children")
        if isinstance(nested, list):
            for child in nested:
                walk(child, next_path)

    for child in children:
        walk(child, [])
    return found


def _team_row(item: dict[str, Any], *, profile: str, favorite: str | None) -> dict[str, Any]:
    team = item.get("team") if isinstance(item.get("team"), dict) else {}
    stats = item.get("stats") if isinstance(item.get("stats"), dict) else {}
    occurrences = item.get("occurrences") if isinstance(item.get("occurrences"), list) else []
    deepest = max(occurrences, key=lambda value: len(value.get("path") or []), default={})
    path = deepest.get("path") if isinstance(deepest.get("path"), list) else []
    top_group = path[0] if path else None
    division = path[-1] if len(path) >= 2 and path[-1] != top_group else None
    division_rank = deepest.get("order") if division else _stat_int(_get(stats, "divisionrank"))

    top_order = None
    if top_group:
        candidates = [o for o in occurrences if isinstance(o, dict) and isinstance(o.get("path"), list) and o["path"] and o["path"][0] == top_group]
        if candidates:
            top_order = _int(min(candidates, key=lambda value: len(value.get("path") or [])).get("order"))

    seed = _stat_int(_get(stats, "playoffseed", "playoffposition", "seed"))
    overall_rank = _stat_int(_get(stats, "overallrank", "rank", "overallstanding"))
    conference_rank = _stat_int(_get(stats, "conferencerank", "conferenceposition"))
    league_rank = _stat_int(_get(stats, "leaguerank", "leagueposition"))
    wildcard_rank = _stat_int(_get(stats, "wildcardrank", "wildcardposition", "wildcard"))
    group_rank = conference_rank or league_rank or seed or top_order
    position = overall_rank or group_rank or _int(deepest.get("order"))

    wins = _stat_int(_get(stats, "wins"))
    losses = _stat_int(_get(stats, "losses"))
    ties = _stat_int(_get(stats, "ties", "draws"))
    draws = _stat_int(_get(stats, "draws", "ties")) if profile == "soccer" else None
    overtime_losses = _stat_int(_get(stats, "overtimelosses", "otlosses", "otl"))
    games_played = _stat_int(_get(stats, "gamesplayed", "gp"))
    if games_played is None and wins is not None and losses is not None:
        games_played = wins + losses + (ties or 0) + (overtime_losses or 0)

    win_percentage = _stat_float(_get(stats, "winpercent", "winpercentage", "pct"))
    points = _stat_float(_get(stats, "points", "pts"))
    points_percentage = _stat_float(_get(stats, "pointspercent", "pointspercentage", "pointpct"))
    games_back_stat = _get(stats, "gamesbehind", "gamesback", "gb")
    games_back = _stat_float(games_back_stat)
    games_back_display = _display(games_back_stat)
    if games_back_display in {"-", "--", "—"}:
        games_back = None

    runs_for = _stat_float(_get(stats, "runsfor", "runsscored", "rs"))
    runs_against = _stat_float(_get(stats, "runsagainst", "runsallowed", "ra"))
    goals_for = _stat_float(_get(stats, "goalsfor", "gf"))
    goals_against = _stat_float(_get(stats, "goalsagainst", "ga"))
    points_for = _stat_float(_get(stats, "pointsfor", "pf", "pointspergame", "ppg"))
    points_against = _stat_float(_get(stats, "pointsagainst", "pa", "oppointspergame", "oppppg"))
    differential = _stat_float(_get(stats, "differential", "pointdifferential", "goaldifference", "rundifferential", "diff"))
    differential_source = "espn_stat" if differential is not None else None
    if differential is None:
        pair = (runs_for, runs_against) if runs_for is not None and runs_against is not None else (goals_for, goals_against) if goals_for is not None and goals_against is not None else None
        if pair:
            differential = pair[0] - pair[1]
            differential_source = "derived_from_espn_totals"

    record = _display(_get(stats, "overall", "overallrecord", "record"))
    if not record and wins is not None and losses is not None:
        record = f"{wins}-{draws}-{losses}" if profile == "soccer" and draws is not None else f"{wins}-{losses}" + (f"-{ties}" if ties else "")

    clincher = _clincher(_get(stats, "clincher", "clinched"))
    clinch = _decode_clincher(profile, clincher)
    direct_playoff = _stat_bool(_get(stats, "clinchedplayoff", "clinchedplayoffberth"))
    direct_division = _stat_bool(_get(stats, "clincheddivision"))
    direct_conference = _stat_bool(_get(stats, "clinchedconference"))
    direct_eliminated = _stat_bool(_get(stats, "eliminated", "playoffeliminated"))
    abbr = _text(team.get("abbreviation"))
    if abbr:
        abbr = abbr.upper()

    return {
        "seed": seed, "position": position, "team_id": team.get("id"), "abbreviation": abbr,
        "display_name": team.get("displayName") or team.get("name"),
        "short_name": team.get("shortDisplayName") or team.get("name") or team.get("nickname"),
        "logo": _logo(team), "favorite": bool(favorite and abbr == favorite), "group": top_group,
        "conference": top_group if profile in {"nba", "nhl"} else None,
        "league_group": top_group if profile == "mlb" else None, "division": division,
        "division_rank": division_rank, "group_rank": group_rank, "conference_rank": conference_rank,
        "league_rank": league_rank, "overall_rank": overall_rank, "wildcard_rank": wildcard_rank,
        "division_leader": division_rank == 1 if division_rank is not None else None,
        "wins": wins, "losses": losses, "ties": ties if profile != "soccer" else None, "draws": draws,
        "overtime_losses": overtime_losses, "games_played": games_played, "record": record,
        "win_percentage": win_percentage, "points": points, "points_percentage": points_percentage,
        "games_back": games_back, "games_back_display": games_back_display,
        "home_record": _display(_get(stats, "home", "homerecord")),
        "away_record": _display(_get(stats, "away", "road", "awayrecord", "roadrecord")),
        "division_record": _display(_get(stats, "division", "divisionrecord", "divrecord")),
        "conference_record": _display(_get(stats, "conference", "conferencerecord", "confrecord")),
        "last_10": _display(_get(stats, "lastten", "last10", "l10")), "streak": _streak(_get(stats, "streak")),
        "form": _display(_get(stats, "form")), "runs_for": runs_for, "runs_against": runs_against,
        "goals_for": goals_for, "goals_against": goals_against, "points_for": points_for, "points_against": points_against,
        "differential": differential, "regulation_wins": _stat_int(_get(stats, "regulationwins", "rw")),
        "regulation_overtime_wins": _stat_int(_get(stats, "regulationandovertimewins", "row")),
        "shootout_wins": _stat_int(_get(stats, "shootoutwins", "sow")), "shootout_losses": _stat_int(_get(stats, "shootoutlosses", "sol")),
        "espn_clincher": clincher,
        "clinched_playoff": direct_playoff if direct_playoff is not None else clinch.get("clinched_playoff"),
        "clinched_play_in": clinch.get("clinched_play_in"), "clinched_wildcard": clinch.get("clinched_wildcard"),
        "clinched_division": direct_division if direct_division is not None else clinch.get("clinched_division"),
        "clinched_conference": direct_conference if direct_conference is not None else clinch.get("clinched_conference"),
        "clinched_best_record": clinch.get("clinched_best_record"),
        "eliminated": direct_eliminated if direct_eliminated is not None else clinch.get("eliminated"),
        "playoff_position": seed, "wildcard": None, "play_in": None, "in_playoffs": None, "in_the_hunt": None,
        "sources": {"membership": "espn_group_hierarchy", "division_rank": "espn_group_order" if division_rank is not None and division else "espn_stat", "group_rank": "espn_stat_or_group_order", "seed": "espn_stat" if seed is not None else None, "division_leader": "derived_from_division_rank" if division_rank is not None else None, "differential": differential_source, "clincher": "espn_clincher" if clincher else None},
        "espn_stats": {key: {"value": value.get("value"), "display_value": value.get("displayValue")} for key, value in stats.items() if isinstance(value, dict)},
    }


def _apply_derived_playoff_fields(row: dict[str, Any], profile: str, *, regular: bool) -> None:
    if not regular:
        return
    seed = _int(row.get("seed")); group_rank = _int(row.get("group_rank")); eliminated = row.get("eliminated")
    if profile == "mlb" and seed is not None:
        row["wildcard"] = 4 <= seed <= 6; row["in_playoffs"] = 1 <= seed <= 6; row["in_the_hunt"] = seed > 6 and eliminated is not True
        row["sources"].update({"wildcard": "derived_from_mlb_seed", "in_playoffs": "derived_from_mlb_seed", "in_the_hunt": "derived_from_mlb_seed_and_elimination"})
    elif profile == "nba":
        rank = seed or group_rank
        if rank is not None:
            row["play_in"] = 7 <= rank <= 10; row["in_playoffs"] = 1 <= rank <= 10; row["in_the_hunt"] = rank > 10 and eliminated is not True
            row["sources"].update({"play_in": "derived_from_nba_conference_rank", "in_playoffs": "derived_from_nba_conference_rank", "in_the_hunt": "derived_from_nba_rank_and_elimination"})
    elif profile == "wnba":
        rank = seed or _int(row.get("overall_rank")) or _int(row.get("position"))
        if rank is not None:
            row["in_playoffs"] = 1 <= rank <= 8; row["in_the_hunt"] = rank > 8 and eliminated is not True
            row["sources"].update({"in_playoffs": "derived_from_wnba_league_rank", "in_the_hunt": "derived_from_wnba_rank_and_elimination"})
    elif profile == "nhl" and seed is not None:
        row["wildcard"] = bool(row.get("wildcard_rank") in {1, 2}) if row.get("wildcard_rank") is not None else None
        row["in_playoffs"] = 1 <= seed <= 8; row["in_the_hunt"] = seed > 8 and eliminated is not True
        row["sources"].update({"wildcard": "derived_from_espn_wildcard_rank" if row.get("wildcard_rank") is not None else None, "in_playoffs": "derived_from_espn_playoff_seed", "in_the_hunt": "derived_from_espn_playoff_seed_and_elimination"})


def _group_aliases(rows: list[dict[str, Any]], profile: str) -> dict[str, Any]:
    groups: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        if row.get("group"):
            groups.setdefault(str(row["group"]), []).append(row)
    for values in groups.values(): values.sort(key=_row_sort)
    if profile == "mlb": return {"groups": groups, "top_level": {"leagues": groups, "conferences": {}}}
    if profile in {"nba", "nhl"}: return {"groups": groups, "top_level": {"conferences": groups, "leagues": {}}}
    return {"groups": groups, "top_level": {"table": sorted(rows, key=_row_sort), "conferences": {}, "leagues": {}}}


def _divisions(rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    divisions: dict[str, dict[str, Any]] = {}
    for row in rows:
        division, abbr = row.get("division"), row.get("abbreviation")
        if not division or not abbr: continue
        item = divisions.setdefault(str(division), {"group": row.get("group"), "leader": None, "teams": []})
        item["teams"].append(abbr)
        if row.get("division_leader") is True: item["leader"] = abbr
    by_abbr = {row.get("abbreviation"): row for row in rows}
    for item in divisions.values(): item["teams"].sort(key=lambda abbr: (_sort(by_abbr.get(abbr, {}).get("division_rank")), str(abbr)))
    return divisions


def _playoff_metadata(profile: str) -> dict[str, Any]:
    rule = dict(PLAYOFF_RULES.get(profile, PLAYOFF_RULES["soccer"]))
    return {"cut_line": rule.get("cut_line"), "automatic_cut_line": rule.get("automatic_cut_line"), "wildcard_start": rule.get("wildcard_start"), "wildcard_end": rule.get("wildcard_end"), "play_in_start": rule.get("play_in_start"), "play_in_end": rule.get("play_in_end"), "scope": rule.get("scope"), "source": rule.get("source"), "note": rule.get("note")}


def _decode_clincher(profile: str, value: str | None) -> dict[str, bool | None]:
    result = {"clinched_playoff": None, "clinched_play_in": None, "clinched_wildcard": None, "clinched_division": None, "clinched_conference": None, "clinched_best_record": None, "eliminated": None}
    if not value: return result
    tokens = {token.upper() for token in re.findall(r"[A-Za-z]+|\*", value)}
    if "E" in tokens: result["eliminated"] = True
    if profile == "mlb":
        if "X" in tokens: result["clinched_division"] = True; result["clinched_playoff"] = True
        if "Y" in tokens: result["clinched_wildcard"] = True; result["clinched_playoff"] = True
        if "*" in value: result["clinched_best_record"] = True; result["clinched_playoff"] = True
    elif profile in {"nba", "nhl"}:
        if "X" in tokens or "XP" in tokens: result["clinched_playoff"] = True
        if "Y" in tokens: result["clinched_division"] = True; result["clinched_playoff"] = True
        if "Z" in tokens: result["clinched_conference"] = True; result["clinched_playoff"] = True
        if "PB" in tokens and profile == "nba": result["clinched_play_in"] = True
        if "*" in value: result["clinched_best_record"] = True
    elif profile == "wnba" and "X" in tokens: result["clinched_playoff"] = True
    return result


def _stats(raw: Any) -> dict[str, dict[str, Any]]:
    result = {}
    if not isinstance(raw, list): return result
    for stat in raw:
        if not isinstance(stat, dict): continue
        name = stat.get("name") or stat.get("abbreviation") or stat.get("shortDisplayName") or stat.get("displayName")
        key = _key(name)
        if key: result[key] = stat
    return result


def _merge_stats(base: dict[str, Any], new: dict[str, Any]) -> dict[str, Any]:
    merged = dict(base)
    for key, value in new.items():
        if key not in merged or _has_value(value): merged[key] = value
    return merged


def _has_value(stat: Any) -> bool: return isinstance(stat, dict) and (stat.get("value") is not None or stat.get("displayValue") not in (None, ""))
def _get(stats: dict[str, Any], *names: str) -> dict[str, Any] | None:
    for name in names:
        value = stats.get(_key(name))
        if isinstance(value, dict): return value
    return None

def _group_name(group: dict[str, Any]) -> str | None: return _text(group.get("name") or group.get("shortName") or group.get("abbreviation"))
def _team_key(entry: dict[str, Any]) -> str | None:
    team = entry.get("team") if isinstance(entry.get("team"), dict) else {}
    for value in (team.get("id"), team.get("uid"), team.get("abbreviation"), team.get("displayName")):
        if value not in (None, ""): return str(value)
    return None

def _merge_dict(base: dict[str, Any], new: dict[str, Any]) -> dict[str, Any]:
    result = dict(base)
    for key, value in new.items():
        if key not in result or result[key] in (None, "", [], {}): result[key] = value
    return result

def _season_year(payload: dict[str, Any]) -> int | None:
    season = payload.get("season")
    if isinstance(season, dict): return _int(season.get("year"))
    return _int(season)
def _season_type(payload: dict[str, Any]) -> int | None:
    season = payload.get("season")
    if isinstance(season, dict): return _int(season.get("type") or season.get("seasonType"))
    return _int(payload.get("seasonType"))
def _season_type_name(payload: dict[str, Any]) -> str | None:
    season = payload.get("season")
    if isinstance(season, dict):
        value = season.get("typeName") or season.get("seasonTypeName") or season.get("displayName")
        if value: return str(value)
    value = payload.get("seasonTypeName"); return str(value) if value else None

def _logo(team: dict[str, Any]) -> str | None:
    if team.get("logo"): return str(team["logo"])
    logos = team.get("logos")
    if isinstance(logos, list):
        for item in logos:
            if isinstance(item, dict) and (item.get("href") or item.get("url")): return str(item.get("href") or item.get("url"))
    return None

def _streak(stat: dict[str, Any] | None) -> str | None:
    if not isinstance(stat, dict): return None
    display = _display(stat)
    if display and re.match(r"^[WLT]\d+$", display.upper()): return display.upper()
    value = _stat_float(stat)
    if value is None or value == 0: return display
    prefix = "W" if value > 0 else "L"; number = int(abs(value)) if float(abs(value)).is_integer() else abs(value)
    return f"{prefix}{number}"
def _clincher(stat: dict[str, Any] | None) -> str | None:
    if not isinstance(stat, dict): return None
    value = stat.get("displayValue") if stat.get("displayValue") is not None else stat.get("value")
    if value in (None, "", 0, "0", False): return None
    return str(value).strip() or None
def _display(stat: dict[str, Any] | None) -> str | None:
    if not isinstance(stat, dict): return None
    value = stat.get("displayValue") if stat.get("displayValue") is not None else stat.get("value")
    if value is None: return None
    text = str(value).strip(); return text or None
def _stat_int(stat: dict[str, Any] | None) -> int | None:
    if not isinstance(stat, dict): return None
    return _int(stat.get("value") if stat.get("value") is not None else stat.get("displayValue"))
def _stat_float(stat: dict[str, Any] | None) -> float | None:
    if not isinstance(stat, dict): return None
    value = stat.get("value") if stat.get("value") is not None else stat.get("displayValue")
    if value is None or isinstance(value, bool): return None
    text = str(value).strip().replace("%", "")
    if text in {"", "-", "--", "—"}: return None
    try: return float(text)
    except ValueError: return None
def _stat_bool(stat: dict[str, Any] | None) -> bool | None:
    if not isinstance(stat, dict): return None
    value = stat.get("value") if stat.get("value") is not None else stat.get("displayValue")
    if isinstance(value, bool): return value
    if isinstance(value, (int, float)): return bool(value)
    if isinstance(value, str):
        text = value.strip().lower()
        if text in {"true", "yes", "y", "1"}: return True
        if text in {"false", "no", "n", "0"}: return False
    return None
def _key(value: Any) -> str: return re.sub(r"[^a-z0-9]", "", str(value or "").lower())
def _text(value: Any) -> str | None:
    if value is None: return None
    text = str(value).strip(); return text or None
def _int(value: Any) -> int | None:
    if value is None or isinstance(value, bool): return None
    try: return int(float(str(value).strip()))
    except (TypeError, ValueError): return None
def _sort(value: Any) -> int:
    parsed = _int(value); return parsed if parsed is not None else 9999
def _row_sort(row: dict[str, Any]) -> tuple[Any, ...]: return (str(row.get("group") or ""), _sort(row.get("seed")), _sort(row.get("group_rank")), _sort(row.get("position")), str(row.get("abbreviation") or ""))
