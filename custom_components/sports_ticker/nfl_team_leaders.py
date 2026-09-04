from __future__ import annotations

from typing import Any

NFL_SUMMARY_URL = (
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={event_id}"
)

LEADER_CATEGORIES = ("passing", "rushing", "receiving", "sacks", "tackles")


def empty_team_leaders() -> dict[str, dict[str, dict[str, Any] | None]]:
    """Return the stable away/home leader structure used by raw NFL events."""
    return {
        "away": {category: None for category in LEADER_CATEGORIES},
        "home": {category: None for category in LEADER_CATEGORIES},
    }


def team_leaders_have_data(team_leaders: Any) -> bool:
    """Return True when at least one leader record is populated."""
    if not isinstance(team_leaders, dict):
        return False
    for side in ("away", "home"):
        side_data = team_leaders.get(side)
        if not isinstance(side_data, dict):
            continue
        if any(isinstance(side_data.get(category), dict) for category in LEADER_CATEGORIES):
            return True
    return False


def get_event_team_leaders(event: Any) -> dict[str, Any] | None:
    """Return previously enriched team leaders from an event, if present."""
    if not isinstance(event, dict):
        return None
    competitions = event.get("competitions")
    if not isinstance(competitions, list) or not competitions:
        return None
    competition = competitions[0]
    if not isinstance(competition, dict):
        return None
    leaders = competition.get("team_leaders")
    return leaders if isinstance(leaders, dict) else None


def merge_nfl_team_leaders(event: dict[str, Any], summary: dict[str, Any]) -> dict[str, Any]:
    """Attach normalized per-team leaders to an ESPN NFL scoreboard event.

    ESPN's original competition-level ``leaders`` array is intentionally left
    untouched for backward compatibility.
    """
    competitions = event.get("competitions")
    if not isinstance(competitions, list) or not competitions:
        return event

    competition = competitions[0]
    if not isinstance(competition, dict):
        return event

    competition["team_leaders"] = extract_nfl_team_leaders(summary, competition)
    return event


def extract_nfl_team_leaders(
    summary: dict[str, Any],
    competition: dict[str, Any],
) -> dict[str, dict[str, dict[str, Any] | None]]:
    """Extract away/home NFL leaders from ESPN summary box-score data.

    Team assignment is based only on explicit scoreboard competitor IDs and
    ``homeAway`` values. Unknown or missing teams are ignored rather than
    guessed by array order.
    """
    result = empty_team_leaders()
    side_by_team_id, abbreviation_by_team_id = _competition_team_map(competition)

    boxscore = summary.get("boxscore")
    players = boxscore.get("players") if isinstance(boxscore, dict) else None
    if not isinstance(players, list):
        return result

    for team_box in players:
        if not isinstance(team_box, dict):
            continue

        team = team_box.get("team")
        if not isinstance(team, dict):
            continue

        team_id = _string_or_none(team.get("id"))
        if not team_id:
            continue

        side = side_by_team_id.get(team_id)
        if side not in ("away", "home"):
            continue

        team_abbreviation = (
            _string_or_none(team.get("abbreviation"))
            or abbreviation_by_team_id.get(team_id)
        )

        statistics = team_box.get("statistics")
        if not isinstance(statistics, list):
            continue

        for section in statistics:
            if not isinstance(section, dict):
                continue
            section_name = str(section.get("name") or "").strip().lower()

            if section_name == "passing":
                result[side]["passing"] = _pick_section_leader(
                    section,
                    primary_keys=("passingYards",),
                    team_id=team_id,
                    team_abbreviation=team_abbreviation,
                    detail_builder=_passing_detail,
                )
            elif section_name == "rushing":
                result[side]["rushing"] = _pick_section_leader(
                    section,
                    primary_keys=("rushingYards",),
                    team_id=team_id,
                    team_abbreviation=team_abbreviation,
                    detail_builder=_rushing_detail,
                )
            elif section_name == "receiving":
                result[side]["receiving"] = _pick_section_leader(
                    section,
                    primary_keys=("receivingYards",),
                    team_id=team_id,
                    team_abbreviation=team_abbreviation,
                    detail_builder=_receiving_detail,
                )
            elif section_name in ("defensive", "defense"):
                result[side]["sacks"] = _pick_section_leader(
                    section,
                    primary_keys=("sacks", "sacksTotal"),
                    team_id=team_id,
                    team_abbreviation=team_abbreviation,
                    detail_builder=_sacks_detail,
                )
                result[side]["tackles"] = _pick_section_leader(
                    section,
                    primary_keys=("totalTackles", "tackles"),
                    team_id=team_id,
                    team_abbreviation=team_abbreviation,
                    detail_builder=_tackles_detail,
                )

    return result


def _competition_team_map(
    competition: dict[str, Any],
) -> tuple[dict[str, str], dict[str, str]]:
    side_by_team_id: dict[str, str] = {}
    abbreviation_by_team_id: dict[str, str] = {}

    competitors = competition.get("competitors")
    if not isinstance(competitors, list):
        return side_by_team_id, abbreviation_by_team_id

    for competitor in competitors:
        if not isinstance(competitor, dict):
            continue
        side = str(competitor.get("homeAway") or "").lower()
        if side not in ("away", "home"):
            continue

        team = competitor.get("team")
        if not isinstance(team, dict):
            team = {}

        team_id = _string_or_none(team.get("id") or competitor.get("id"))
        if not team_id:
            continue

        side_by_team_id[team_id] = side
        abbreviation = _string_or_none(team.get("abbreviation"))
        if abbreviation:
            abbreviation_by_team_id[team_id] = abbreviation

    return side_by_team_id, abbreviation_by_team_id


def _pick_section_leader(
    section: dict[str, Any],
    *,
    primary_keys: tuple[str, ...],
    team_id: str,
    team_abbreviation: str | None,
    detail_builder,
) -> dict[str, Any] | None:
    keys = section.get("keys")
    athletes = section.get("athletes")
    if not isinstance(keys, list) or not isinstance(athletes, list):
        return None

    key_index = {str(key): index for index, key in enumerate(keys)}
    primary_index = next(
        (key_index[key] for key in primary_keys if key in key_index),
        None,
    )
    if primary_index is None:
        return None

    best: tuple[float, dict[str, Any], dict[str, Any]] | None = None

    for athlete_row in athletes:
        if not isinstance(athlete_row, dict) or athlete_row.get("didNotPlay") is True:
            continue

        athlete = athlete_row.get("athlete")
        stats = athlete_row.get("stats")
        if not isinstance(athlete, dict) or not isinstance(stats, list):
            continue
        if primary_index >= len(stats):
            continue

        value = _number(stats[primary_index])
        if value is None:
            continue

        row_stats = {
            key: stats[index] if index < len(stats) else None
            for key, index in key_index.items()
        }

        if best is None or value > best[0]:
            best = (value, athlete, row_stats)

    if best is None:
        return None

    value, athlete, row_stats = best
    position = athlete.get("position")
    if isinstance(position, dict):
        position_value = (
            position.get("abbreviation")
            or position.get("displayName")
            or position.get("name")
        )
    else:
        position_value = position

    name = (
        athlete.get("displayName")
        or athlete.get("fullName")
        or athlete.get("name")
    )
    short_name = athlete.get("shortName") or name

    return {
        "name": name,
        "short_name": short_name,
        "position": position_value,
        "headshot": _headshot_url(athlete.get("headshot")),
        "value": _display_number(value),
        "detail": detail_builder(row_stats),
        "team_id": team_id,
        "team_abbreviation": team_abbreviation,
    }


def _passing_detail(stats: dict[str, Any]) -> str | None:
    completions_attempts = _text_or_none(stats.get("completions/passingAttempts"))
    if completions_attempts:
        return f"{completions_attempts} CMP/ATT"
    return None


def _rushing_detail(stats: dict[str, Any]) -> str | None:
    carries = _number(stats.get("rushingAttempts"))
    return f"{_display_number(carries)} CAR" if carries is not None else None


def _receiving_detail(stats: dict[str, Any]) -> str | None:
    receptions = _number(stats.get("receptions"))
    return f"{_display_number(receptions)} REC" if receptions is not None else None


def _sacks_detail(stats: dict[str, Any]) -> str | None:
    tackles = _number(stats.get("totalTackles"))
    return f"{_display_number(tackles)} TKL" if tackles is not None else None


def _tackles_detail(stats: dict[str, Any]) -> str | None:
    solo = _number(stats.get("soloTackles"))
    return f"{_display_number(solo)} SOLO" if solo is not None else None


def _headshot_url(value: Any) -> str | None:
    if isinstance(value, str):
        return value or None
    if isinstance(value, dict):
        return value.get("href") or value.get("url")
    return None


def _number(value: Any) -> float | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text or text in {"-", "--"}:
        return None
    try:
        return float(text)
    except (TypeError, ValueError):
        return None


def _display_number(value: float | None) -> int | float | None:
    if value is None:
        return None
    return int(value) if float(value).is_integer() else value


def _string_or_none(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _text_or_none(value: Any) -> str | None:
    text = _string_or_none(value)
    if text in {"-", "--"}:
        return None
    return text
