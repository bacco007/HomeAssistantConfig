from __future__ import annotations

from typing import Any

LEAGUES = ("AL", "NL")


def normalize_mlb_standings(payload: dict[str, Any], *, favorite_team: str | None = None, updated_at: str | None = None) -> dict[str, Any]:
    """Normalize ESPN MLB standings into a stable card-friendly structure."""
    if not isinstance(payload, dict):
        raise ValueError("ESPN MLB standings response was not a JSON object")
    children = payload.get("children")
    if not isinstance(children, list):
        raise ValueError("ESPN MLB standings response did not contain groups")

    favorite = str(favorite_team).strip().upper() if favorite_team else None
    leagues: dict[str, list[dict[str, Any]]] = {"AL": [], "NL": []}
    divisions: dict[str, dict[str, Any]] = {}
    teams: list[dict[str, Any]] = []

    for group in children:
        if not isinstance(group, dict):
            continue
        league = _league(group)
        if league not in LEAGUES:
            continue
        for division in group.get("children", []):
            if not isinstance(division, dict):
                continue
            division_name = str(division.get("name") or division.get("abbreviation") or "").strip()
            standings = division.get("standings") if isinstance(division.get("standings"), dict) else {}
            entries = standings.get("entries") if isinstance(standings.get("entries"), list) else []
            div_rows: list[dict[str, Any]] = []
            for rank, entry in enumerate(entries, 1):
                if not isinstance(entry, dict):
                    continue
                row = _team_row(entry, league, division_name, rank, favorite)
                div_rows.append(row)
                leagues[league].append(row)
                teams.append(row)
            divisions[division_name] = {"league": league, "leader": div_rows[0].get("abbreviation") if div_rows else None, "teams": div_rows}

    if not teams:
        raise ValueError("ESPN MLB standings response contained no teams")

    for league_rows in leagues.values():
        league_rows.sort(key=lambda r: (-(r.get("win_percentage") or 0), -(r.get("wins") or 0), r.get("abbreviation") or ""))
        for rank, row in enumerate(league_rows, 1):
            row["league_rank"] = rank

    season = payload.get("season")
    if isinstance(season, dict):
        season = season.get("year")
    season_type = payload.get("seasonType")
    if isinstance(season_type, dict):
        season_type_name = season_type.get("name")
        season_type = season_type.get("type") or season_type.get("id")
    else:
        season_type_name = None

    return {"league": "mlb", "data_type": "standings", "season": season, "season_type": season_type, "season_type_name": season_type_name, "favorite_team": favorite, "updated_at": updated_at, "leagues": leagues, "divisions": divisions, "teams": teams}


def _league(group: dict[str, Any]) -> str | None:
    text = " ".join(str(group.get(k) or "") for k in ("name", "shortName", "abbreviation")).upper()
    if "AMERICAN" in text or text.strip() == "AL" or " AL" in text:
        return "AL"
    if "NATIONAL" in text or text.strip() == "NL" or " NL" in text:
        return "NL"
    return None


def _team_row(entry: dict[str, Any], league: str, division: str, rank: int, favorite: str | None) -> dict[str, Any]:
    team = entry.get("team") if isinstance(entry.get("team"), dict) else {}
    stats = {}
    for stat in entry.get("stats", []):
        if isinstance(stat, dict):
            key = str(stat.get("name") or stat.get("abbreviation") or stat.get("displayName") or "").lower().replace(" ", "").replace("_", "")
            stats[key] = stat

    def stat(*names: str) -> dict[str, Any] | None:
        for name in names:
            key = name.lower().replace(" ", "").replace("_", "")
            if key in stats:
                return stats[key]
        return None

    def number(item: dict[str, Any] | None) -> float | None:
        if not item:
            return None
        for key in ("value", "displayValue"):
            try:
                return float(str(item.get(key)).replace("%", ""))
            except (TypeError, ValueError):
                pass
        return None

    def integer(item: dict[str, Any] | None) -> int | None:
        value = number(item)
        return int(value) if value is not None else None

    def display(item: dict[str, Any] | None) -> str | None:
        if not item:
            return None
        value = item.get("displayValue")
        return str(value) if value not in (None, "") else None

    wins, losses = integer(stat("wins")), integer(stat("losses"))
    pct = number(stat("winPercent", "winPercentage", "pct"))
    if pct is not None and pct > 1:
        pct /= 100
    runs_for = integer(stat("runsFor", "runs", "runsScored"))
    runs_against = integer(stat("runsAgainst", "runsAllowed"))
    diff = integer(stat("runDifferential", "differential"))
    if diff is None and runs_for is not None and runs_against is not None:
        diff = runs_for - runs_against
    abbr = str(team.get("abbreviation") or "").upper() or None
    logos = team.get("logos") if isinstance(team.get("logos"), list) else []
    logo = logos[0].get("href") if logos and isinstance(logos[0], dict) else team.get("logo")
    gb = number(stat("gamesBehind", "gamesBack"))
    gb_display = display(stat("gamesBehind", "gamesBack"))
    if gb_display in {"-", "--", "—"}:
        gb = 0.0

    return {"team_id": team.get("id"), "abbreviation": abbr, "display_name": team.get("displayName"), "short_name": team.get("shortDisplayName") or team.get("name"), "logo": logo, "league": league, "division": division, "division_rank": rank, "division_leader": rank == 1, "league_rank": None, "wins": wins, "losses": losses, "games_played": wins + losses if wins is not None and losses is not None else None, "record": display(stat("overall", "record")) or (f"{wins}-{losses}" if wins is not None and losses is not None else None), "win_percentage": pct, "games_back": gb, "games_back_display": gb_display, "home_record": display(stat("home", "homeRecord")), "away_record": display(stat("road", "away", "roadRecord")), "last_10": display(stat("lastTen", "last10")), "streak": display(stat("streak")), "runs_for": runs_for, "runs_against": runs_against, "run_differential": diff, "favorite": bool(favorite and abbr == favorite)}
