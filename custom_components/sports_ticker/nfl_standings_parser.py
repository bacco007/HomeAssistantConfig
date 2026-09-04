from __future__ import annotations

from typing import Any

CONFERENCES = ("AFC", "NFC")
PLAYOFF_SEEDS_PER_CONFERENCE = 7
DIVISION_LEADER_SEEDS = 4


def normalize_nfl_standings(
    payload: dict[str, Any],
    *,
    favorite_team: str | None = None,
    week: int | None = None,
    updated_at: str | None = None,
) -> dict[str, Any]:
    """Normalize ESPN NFL standings into a stable card-friendly structure."""
    if not isinstance(payload, dict):
        raise ValueError("ESPN standings response was not a JSON object")
    groups = payload.get("children")
    if not isinstance(groups, list):
        raise ValueError("ESPN standings response did not contain conference groups")

    favorite = str(favorite_team).strip().upper() if favorite_team else None
    conferences: dict[str, list[dict[str, Any]]] = {"AFC": [], "NFC": []}
    divisions: dict[str, dict[str, Any]] = {}
    season = _season_year(payload)
    season_type = _season_type(payload)
    season_type_name = _season_type_name(payload)
    week = _week(payload) if _week(payload) is not None else week

    conference_groups = _find_conference_groups(groups)
    if not conference_groups:
        raise ValueError("ESPN standings response did not contain AFC/NFC standings")

    for group in conference_groups:
        conference = _conference(group)
        if conference not in CONFERENCES:
            continue
        standings = group.get("standings") if isinstance(group.get("standings"), dict) else {}
        season = season if season is not None else _int(standings.get("season"))
        season_type = season_type if season_type is not None else _int(standings.get("seasonType"))
        season_type_name = season_type_name or _text(standings.get("seasonTypeName"))

        division_meta, division_entries = _division_membership(group, conference)
        entries = standings.get("entries")
        if not isinstance(entries, list) or not entries:
            entries = list(division_entries.values())

        rows: list[dict[str, Any]] = []
        seen: set[str] = set()
        for order, raw in enumerate(entries, 1):
            if not isinstance(raw, dict):
                continue
            key = _team_key(raw)
            if not key or key in seen:
                continue
            seen.add(key)
            merged = _merge_entries(raw, division_entries.get(key))
            meta = division_meta.get(key, {})
            rows.append(
                _team_row(
                    merged,
                    conference=conference,
                    conference_order=order,
                    division=meta.get("division"),
                    division_order=meta.get("rank"),
                    favorite=favorite,
                    season_type=season_type,
                )
            )
        rows.sort(key=lambda row: (_sort(row.get("seed")), _sort(row.get("conference_rank")), row.get("abbreviation") or ""))
        conferences[conference] = rows

        for row in rows:
            division = row.get("division")
            abbr = row.get("abbreviation")
            if not division or not abbr:
                continue
            item = divisions.setdefault(division, {"conference": conference, "leader": None, "teams": []})
            item["teams"].append(abbr)
            if row.get("division_leader") is True:
                item["leader"] = abbr

    all_rows = [*conferences["AFC"], *conferences["NFC"]]
    for name, item in divisions.items():
        by_abbr = {row.get("abbreviation"): row for row in all_rows if row.get("division") == name}
        item["teams"].sort(key=lambda abbr: (_sort(by_abbr.get(abbr, {}).get("division_rank")), abbr))

    return {
        "league": "nfl",
        "data_type": "standings",
        "season": season,
        "season_type": season_type,
        "season_type_name": season_type_name,
        "week": week,
        "favorite_team": favorite,
        "updated_at": updated_at,
        "conferences": conferences,
        "divisions": divisions,
        "teams": all_rows,
        "playoff": {
            "seeds_per_conference": PLAYOFF_SEEDS_PER_CONFERENCE,
            "division_leader_seeds": DIVISION_LEADER_SEEDS,
            "cut_line_seed": PLAYOFF_SEEDS_PER_CONFERENCE,
            "source": "nfl_rule",
            "derived_helpers_apply": season_type in (None, 2),
        },
        "normalization": {
            "derived_fields": ["division_leader", "wildcard", "in_playoffs", "in_the_hunt"],
            "espn_clincher_codes_preserved": True,
            "clinched_conference_inferred": False,
        },
    }


def _team_row(
    entry: dict[str, Any],
    *,
    conference: str,
    conference_order: int,
    division: str | None,
    division_order: int | None,
    favorite: str | None,
    season_type: int | None,
) -> dict[str, Any]:
    team = entry.get("team") if isinstance(entry.get("team"), dict) else {}
    stats = _stats(entry.get("stats"))

    seed_stat = _get(stats, "playoffseed", "playoffposition", "seed")
    seed = _stat_int(seed_stat)

    division_stat = _get(stats, "divisionrank", "divisionstanding")
    division_rank = _stat_int(division_stat)
    division_rank_source = "espn_stat" if division_rank is not None else None
    if division_rank is None and division_order is not None:
        division_rank, division_rank_source = division_order, "espn_division_order"

    conference_stat = _get(stats, "conferencerank", "conferenceposition")
    conference_rank = _stat_int(conference_stat)
    conference_rank_source = "espn_stat" if conference_rank is not None else None
    if conference_rank is None and seed is not None:
        conference_rank, conference_rank_source = seed, "espn_playoff_seed"
    elif conference_rank is None:
        conference_rank, conference_rank_source = conference_order, "espn_conference_order"

    wins = _stat_int(_get(stats, "wins"))
    losses = _stat_int(_get(stats, "losses"))
    ties = _stat_int(_get(stats, "ties"))
    win_percentage = _stat_float(_get(stats, "winpercent", "winpercentage"))

    games_played = (
        wins + losses + (ties or 0)
        if wins is not None and losses is not None
        else None
    )
    points_for = _stat_float(_get(stats, "pointsfor", "points", "pf"))
    points_against = _stat_float(_get(stats, "pointsagainst", "pa"))
    differential_stat = _get(stats, "pointdifferential", "differential", "pointdiff")
    point_differential = _stat_float(differential_stat)
    point_differential_source = "espn_stat" if point_differential is not None else None
    if point_differential is None and points_for is not None and points_against is not None:
        point_differential = points_for - points_against
        point_differential_source = "derived_from_espn_points"

    points_per_game = (
        round(points_for / games_played, 1)
        if points_for is not None and games_played
        else None
    )
    points_allowed_per_game = (
        round(points_against / games_played, 1)
        if points_against is not None and games_played
        else None
    )

    home_record = _display(_get(stats, "home", "homerecord"))
    away_record = _display(_get(stats, "road", "away", "roadrecord", "awayrecord"))
    division_record = _display(_get(stats, "division", "divisionrecord", "divrecord", "vsdivision"))
    conference_record = _display(_get(stats, "conference", "conferencerecord", "confrecord", "vsconference"))

    record_stat = _get(stats, "overall", "overallrecord", "record")
    record = _display(record_stat)
    record_source = "espn_stat" if record else None
    if not record and wins is not None and losses is not None:
        record = f"{wins}-{losses}" + (f"-{ties}" if ties else "")
        record_source = "derived_from_espn_wlt"

    streak = _streak(_get(stats, "streak"))
    games_stat = _get(stats, "gamesbehind", "gamesback")
    games_back = _stat_float(games_stat)
    games_back_display = _display(games_stat)
    if games_back_display in {"-", "--", "—"}:
        games_back = None

    clincher_stat = _get(stats, "clincher", "clinched")
    clincher_present = clincher_stat is not None
    clincher = _clincher(clincher_stat)
    decoded = _decode_clincher(clincher, clincher_present)

    direct_playoff = _stat_bool(_get(stats, "clinchedplayoff", "clinchedplayoffberth"))
    direct_division = _stat_bool(_get(stats, "clincheddivision"))
    direct_conference = _stat_bool(_get(stats, "clinchedconference"))
    direct_eliminated = _stat_bool(_get(stats, "eliminated", "playoffeliminated"))
    clinched_playoff, playoff_source = _flag(direct_playoff, decoded["clinched_playoff"], clincher_present)
    clinched_division, division_source = _flag(direct_division, decoded["clinched_division"], clincher_present)
    eliminated, eliminated_source = _flag(direct_eliminated, decoded["eliminated"], clincher_present)

    abbr = _text(team.get("abbreviation"))
    abbr = abbr.upper() if abbr else None
    division_leader = division_rank == 1 if division_rank is not None else None
    regular = season_type in (None, 2)
    wildcard = (5 <= seed <= PLAYOFF_SEEDS_PER_CONFERENCE) if regular and seed is not None else None
    in_playoffs = (1 <= seed <= PLAYOFF_SEEDS_PER_CONFERENCE) if regular and seed is not None else None
    in_the_hunt = (
        seed > PLAYOFF_SEEDS_PER_CONFERENCE and eliminated is False
        if regular and seed is not None and eliminated is not None
        else None
    )

    return {
        "seed": seed,
        "team_id": team.get("id"),
        "abbreviation": abbr,
        "display_name": team.get("displayName"),
        "short_name": team.get("shortDisplayName") or team.get("name") or team.get("nickname"),
        "logo": _logo(team),
        "wins": wins,
        "losses": losses,
        "ties": ties,
        "record": record,
        "win_percentage": win_percentage,
        "games_played": games_played,
        "points_for": points_for,
        "points_against": points_against,
        "point_differential": point_differential,
        "points_per_game": points_per_game,
        "points_allowed_per_game": points_allowed_per_game,
        "home_record": home_record,
        "away_record": away_record,
        "division_record": division_record,
        "conference_record": conference_record,
        "conference": conference,
        "division": division,
        "division_rank": division_rank,
        "conference_rank": conference_rank,
        "division_leader": division_leader,
        "wildcard": wildcard,
        "playoff_position": seed,
        "in_playoffs": in_playoffs,
        "in_the_hunt": in_the_hunt,
        "streak": streak,
        "games_back": games_back,
        "games_back_display": games_back_display,
        "espn_clincher": clincher,
        "clinched_playoff": clinched_playoff,
        "clinched_wildcard": decoded["clinched_wildcard"] if clincher_present else None,
        "clinched_division": clinched_division,
        "clinched_conference": direct_conference,
        "clinched_first_seed": decoded["clinched_first_seed"] if clincher_present else None,
        "eliminated": eliminated,
        "favorite": bool(favorite and abbr == favorite),
        "derived": {
            "division_leader": division_leader,
            "wildcard": wildcard,
            "in_playoffs": in_playoffs,
            "in_the_hunt": in_the_hunt,
        },
        "sources": {
            "seed": "espn_stat" if seed_stat is not None else None,
            "record": record_source,
            "points_for": "espn_stat" if points_for is not None else None,
            "points_against": "espn_stat" if points_against is not None else None,
            "point_differential": point_differential_source,
            "points_per_game": "derived_from_espn_points_and_wlt" if points_per_game is not None else None,
            "points_allowed_per_game": "derived_from_espn_points_and_wlt" if points_allowed_per_game is not None else None,
            "home_record": "espn_stat" if home_record else None,
            "away_record": "espn_stat" if away_record else None,
            "division_record": "espn_stat" if division_record else None,
            "conference_record": "espn_stat" if conference_record else None,
            "division_rank": division_rank_source,
            "conference_rank": conference_rank_source,
            "division_leader": "derived_from_division_rank" if division_rank is not None else None,
            "wildcard": "derived_from_regular_season_seed" if wildcard is not None else None,
            "in_playoffs": "derived_from_regular_season_seed" if in_playoffs is not None else None,
            "in_the_hunt": "derived_from_seed_and_elimination" if in_the_hunt is not None else None,
            "clinched_playoff": playoff_source,
            "clinched_division": division_source,
            "clinched_conference": "espn_stat" if direct_conference is not None else None,
            "eliminated": eliminated_source,
        },
    }


def _find_conference_groups(groups: list[Any]) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []

    def walk(items: Any) -> None:
        if not isinstance(items, list):
            return
        for item in items:
            if not isinstance(item, dict):
                continue
            if _conference(item) in CONFERENCES:
                found.append(item)
            else:
                walk(item.get("children"))

    walk(groups)
    return found


def _division_membership(group: dict[str, Any], conference: str) -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    metadata: dict[str, dict[str, Any]] = {}
    entries_by_team: dict[str, dict[str, Any]] = {}
    children = group.get("children")
    if not isinstance(children, list):
        return metadata, entries_by_team
    for child in children:
        if not isinstance(child, dict):
            continue
        name = _division_name(child, conference)
        standings = child.get("standings") if isinstance(child.get("standings"), dict) else {}
        entries = standings.get("entries")
        if not name or not isinstance(entries, list):
            continue
        for rank, raw in enumerate(entries, 1):
            if not isinstance(raw, dict):
                continue
            key = _team_key(raw)
            if key:
                metadata[key] = {"division": name, "rank": rank}
                entries_by_team[key] = raw
    return metadata, entries_by_team


def _merge_entries(primary: dict[str, Any], secondary: dict[str, Any] | None) -> dict[str, Any]:
    if not isinstance(secondary, dict):
        return primary
    merged = dict(secondary)
    merged.update(primary)
    combined: list[dict[str, Any]] = []
    seen: set[str] = set()
    for source in (primary.get("stats"), secondary.get("stats")):
        if not isinstance(source, list):
            continue
        for stat in source:
            if not isinstance(stat, dict):
                continue
            key = _key(stat.get("name") or stat.get("abbreviation") or stat.get("displayName"))
            if key and key in seen:
                continue
            if key:
                seen.add(key)
            combined.append(stat)
    merged["stats"] = combined
    return merged


def _stats(raw: Any) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    if not isinstance(raw, list):
        return result
    for stat in raw:
        if not isinstance(stat, dict):
            continue
        for field in ("name", "abbreviation", "displayName", "shortDisplayName", "description"):
            key = _key(stat.get(field))
            if key and key not in result:
                result[key] = stat
    return result


def _get(stats: dict[str, dict[str, Any]], *names: str) -> dict[str, Any] | None:
    return next((stats[_key(name)] for name in names if _key(name) in stats), None)


def _display(stat: dict[str, Any] | None) -> str | None:
    if not isinstance(stat, dict):
        return None
    for field in ("displayValue", "display", "value"):
        value = stat.get(field)
        if value is not None and str(value).strip():
            return str(value).strip()
    return None


def _streak(stat: dict[str, Any] | None) -> str | None:
    if not isinstance(stat, dict):
        return None
    for field in ("displayValue", "display"):
        value = stat.get(field)
        if value is not None and str(value).strip():
            return str(value).strip()
    value = _float(stat.get("value"))
    if value is None or value == 0:
        return None
    amount = abs(value)
    amount = int(amount) if amount.is_integer() else amount
    return f"{'W' if value > 0 else 'L'}{amount}"


def _clincher(stat: dict[str, Any] | None) -> str | None:
    if not isinstance(stat, dict):
        return None
    for field in ("displayValue", "display", "value"):
        value = stat.get(field)
        if value is None or not str(value).strip():
            continue
        text = str(value).strip()
        return None if text in {"0", "0.0"} else text
    return None


def _decode_clincher(value: str | None, present: bool) -> dict[str, bool | None]:
    if not present:
        return {"clinched_playoff": None, "clinched_wildcard": None, "clinched_division": None, "clinched_first_seed": None, "eliminated": None}
    chars = set((value or "").lower().replace("-", "").replace(" ", ""))
    return {
        "clinched_playoff": bool(chars & {"x", "y", "z", "*"}),
        "clinched_wildcard": "y" in chars,
        "clinched_division": bool(chars & {"z", "*"}),
        "clinched_first_seed": "*" in chars,
        "eliminated": "e" in chars,
    }


def _flag(direct: bool | None, decoded: bool | None, clincher_present: bool) -> tuple[bool | None, str | None]:
    if direct is not None:
        return direct, "espn_stat"
    if clincher_present:
        return decoded, "espn_clincher"
    return None, None


def _stat_int(stat: dict[str, Any] | None) -> int | None:
    if not isinstance(stat, dict):
        return None
    for field in ("value", "displayValue"):
        value = _int(stat.get(field))
        if value is not None:
            return value
    return None


def _stat_float(stat: dict[str, Any] | None) -> float | None:
    if not isinstance(stat, dict):
        return None
    for field in ("value", "displayValue"):
        value = _float(stat.get(field))
        if value is not None:
            return value
    return None


def _stat_bool(stat: dict[str, Any] | None) -> bool | None:
    if not isinstance(stat, dict):
        return None
    value = stat.get("value", stat.get("displayValue"))
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        value = value.strip().lower()
        if value in {"true", "yes", "y", "1"}:
            return True
        if value in {"false", "no", "n", "0"}:
            return False
    return None


def _conference(group: dict[str, Any]) -> str | None:
    abbr = _text(group.get("abbreviation"))
    if abbr and abbr.upper() in CONFERENCES:
        return abbr.upper()
    text = " ".join(str(group.get(field) or "") for field in ("name", "displayName", "shortName")).lower().strip()
    if "american football conference" in text or text == "afc":
        return "AFC"
    if "national football conference" in text or text == "nfc":
        return "NFC"
    return None


def _division_name(group: dict[str, Any], conference: str) -> str | None:
    candidate = _text(group.get("name") or group.get("displayName") or group.get("abbreviation"))
    if not candidate:
        return None
    upper = candidate.upper().replace("-", " ")
    for direction in ("EAST", "NORTH", "SOUTH", "WEST"):
        if direction in upper:
            return f"{conference} {direction.title()}"
    return candidate


def _team_key(entry: dict[str, Any]) -> str | None:
    team = entry.get("team") if isinstance(entry.get("team"), dict) else {}
    for field in ("id", "uid", "abbreviation"):
        value = team.get(field)
        if value:
            return f"{field}:{str(value).upper()}"
    return None


def _logo(team: dict[str, Any]) -> str | None:
    if isinstance(team.get("logo"), str) and team.get("logo"):
        return team["logo"]
    logos = team.get("logos")
    if isinstance(logos, list):
        for item in logos:
            if isinstance(item, dict) and (item.get("href") or item.get("url")):
                return str(item.get("href") or item.get("url"))
    return None


def _season_year(payload: dict[str, Any]) -> int | None:
    season = payload.get("season")
    return _int(season.get("year")) if isinstance(season, dict) else _int(season)


def _season_type(payload: dict[str, Any]) -> int | None:
    season = payload.get("season")
    if isinstance(season, dict) and _int(season.get("type")) is not None:
        return _int(season.get("type"))
    return _int(payload.get("seasonType"))


def _season_type_name(payload: dict[str, Any]) -> str | None:
    season = payload.get("season")
    if isinstance(season, dict):
        return _text(season.get("typeName") or season.get("name")) or _text(payload.get("seasonTypeName"))
    return _text(payload.get("seasonTypeName"))


def _week(payload: dict[str, Any]) -> int | None:
    week = payload.get("week")
    return _int(week.get("number")) if isinstance(week, dict) else _int(week)


def _key(value: Any) -> str:
    return "".join(ch for ch in str(value or "").lower() if ch.isalnum())


def _text(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _int(value: Any) -> int | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        return int(float(str(value).strip()))
    except (TypeError, ValueError):
        return None


def _float(value: Any) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        text = str(value).strip().replace("%", "")
        return None if text in {"", "-", "--", "—"} else float(text)
    except (TypeError, ValueError):
        return None


def _sort(value: Any) -> float:
    number = _float(value)
    return number if number is not None else float("inf")
