from __future__ import annotations

from copy import deepcopy
from typing import Any


def empty_game_center() -> dict[str, Any]:
    """Return the stable NFL live-game structure exposed on competitions."""
    return {
        "available": False,
        "state": None,
        "situation": {
            "possession_team_id": None,
            "possession_team_abbreviation": None,
            "possession_side": None,
            "down": None,
            "distance": None,
            "yard_line": None,
            "yards_to_endzone": None,
            "down_distance_text": None,
            "short_down_distance_text": None,
            "possession_text": None,
            "is_red_zone": None,
            "home_timeouts": None,
            "away_timeouts": None,
        },
        "last_play": {
            "id": None,
            "text": None,
            "short_text": None,
            "type": None,
            "type_abbreviation": None,
            "scoring_play": None,
            "period": None,
            "clock": None,
            "home_score": None,
            "away_score": None,
        },
        "win_probability": {
            "home": None,
            "away": None,
            "tie": None,
            "play_id": None,
            "source": None,
        },
        "current_drive": {
            "id": None,
            "team_id": None,
            "team_abbreviation": None,
            "description": None,
            "result": None,
            "yards": None,
            "offensive_plays": None,
            "time_elapsed": None,
            "start": {
                "period": None,
                "clock": None,
                "yard_line": None,
                "yards_to_endzone": None,
                "text": None,
            },
            "end": {
                "period": None,
                "clock": None,
                "yard_line": None,
                "yards_to_endzone": None,
                "text": None,
            },
        },
    }


def game_center_have_data(value: Any) -> bool:
    """Return True when a normalized game-center payload contains useful data."""
    if not isinstance(value, dict):
        return False
    if value.get("available") is True:
        return True
    return _contains_useful_data(value)


def get_event_game_center(event: Any) -> dict[str, Any] | None:
    """Return previously normalized game-center data from an event."""
    if not isinstance(event, dict):
        return None
    competitions = event.get("competitions")
    if not isinstance(competitions, list) or not competitions:
        return None
    competition = competitions[0]
    if not isinstance(competition, dict):
        return None
    game_center = competition.get("game_center")
    return game_center if isinstance(game_center, dict) else None


def merge_nfl_game_center(event: dict[str, Any], summary: dict[str, Any] | None = None) -> dict[str, Any]:
    """Attach normalized live-game data to an NFL scoreboard competition."""
    competitions = event.get("competitions")
    if not isinstance(competitions, list) or not competitions:
        return event
    competition = competitions[0]
    if not isinstance(competition, dict):
        return event
    competition["game_center"] = extract_nfl_game_center(
        event,
        competition,
        summary if isinstance(summary, dict) else {},
    )
    return event


def merge_game_center_fallback(current: Any, cached: Any) -> dict[str, Any]:
    """Fill missing current fields from cached data without replacing fresh values."""
    base = deepcopy(current) if isinstance(current, dict) else empty_game_center()
    if not isinstance(cached, dict):
        return base
    _fill_missing(base, cached)
    base["available"] = game_center_have_data(base)
    return base


def extract_nfl_game_center(
    event: dict[str, Any],
    competition: dict[str, Any],
    summary: dict[str, Any],
) -> dict[str, Any]:
    """Normalize ESPN scoreboard + summary data for a live NFL game card."""
    result = empty_game_center()
    side_by_id, abbr_by_id = _competition_team_map(competition)

    result["state"] = _game_state(event, competition)

    situation = _situation_source(competition, summary)
    last_play = _last_play_source(situation, summary)
    end_state = last_play.get("end") if isinstance(last_play, dict) else None
    if not isinstance(end_state, dict):
        end_state = {}

    possession_team_id = _team_id(
        situation.get("possession") if isinstance(situation, dict) else None
    )
    if possession_team_id is None and isinstance(situation, dict):
        possession_team_id = _string_or_none(situation.get("possessionTeamId"))
    if possession_team_id is None:
        possession_team_id = _team_id(end_state.get("team"))

    possession_text = _first_text(
        situation.get("possessionText") if isinstance(situation, dict) else None,
        end_state.get("possessionText"),
    )

    situation_out = result["situation"]
    situation_out.update(
        {
            "possession_team_id": possession_team_id,
            "possession_team_abbreviation": abbr_by_id.get(possession_team_id),
            "possession_side": side_by_id.get(possession_team_id),
            "down": _first_int(_value(situation, "down"), end_state.get("down")),
            "distance": _first_int(_value(situation, "distance"), end_state.get("distance")),
            "yard_line": _first_int(_value(situation, "yardLine"), end_state.get("yardLine")),
            "yards_to_endzone": _first_int(
                _value(situation, "yardsToEndzone"), end_state.get("yardsToEndzone")
            ),
            "down_distance_text": _first_text(
                _value(situation, "downDistanceText"), end_state.get("downDistanceText")
            ),
            "short_down_distance_text": _first_text(
                _value(situation, "shortDownDistanceText"), end_state.get("shortDownDistanceText")
            ),
            "possession_text": possession_text,
            "is_red_zone": _first_bool(
                _value(situation, "isRedZone"),
                _derive_red_zone(end_state.get("yardsToEndzone")),
            ),
            "home_timeouts": _first_int(_value(situation, "homeTimeouts")),
            "away_timeouts": _first_int(_value(situation, "awayTimeouts")),
        }
    )

    if isinstance(last_play, dict):
        play_type = last_play.get("type") or last_play.get("playType")
        if not isinstance(play_type, dict):
            play_type = {}
        period = last_play.get("period")
        if isinstance(period, dict):
            period = period.get("number") or period.get("value")
        clock = last_play.get("clock")
        if isinstance(clock, dict):
            clock = clock.get("displayValue") or clock.get("value")

        result["last_play"].update(
            {
                "id": _first_text(last_play.get("id"), last_play.get("playId")),
                "text": _first_text(last_play.get("text")),
                "short_text": _first_text(last_play.get("shortText")),
                "type": _first_text(play_type.get("text"), play_type.get("name")),
                "type_abbreviation": _first_text(play_type.get("abbreviation")),
                "scoring_play": _first_bool(last_play.get("scoringPlay")),
                "period": _int_or_none(period),
                "clock": _text_or_none(clock),
                "home_score": _int_or_none(last_play.get("homeScore")),
                "away_score": _int_or_none(last_play.get("awayScore")),
            }
        )

    probability = _latest_win_probability(summary.get("winprobability"))
    if probability is not None:
        home = _float_or_none(probability.get("homeWinPercentage"))
        tie = _float_or_none(probability.get("tiePercentage")) or 0.0
        away = None
        if home is not None:
            away = max(0.0, min(1.0, 1.0 - home - tie))
        result["win_probability"].update(
            {
                "home": home,
                "away": away,
                "tie": tie,
                "play_id": _first_text(probability.get("playId")),
                "source": "espn_summary" if home is not None else None,
            }
        )

    drive = _current_drive(summary.get("drives"))
    if isinstance(drive, dict):
        team = drive.get("team") if isinstance(drive.get("team"), dict) else {}
        team_id = _first_text(team.get("id"), drive.get("teamId"))
        start = _drive_point(drive.get("start"))
        end = _drive_point(drive.get("end"))
        result["current_drive"].update(
            {
                "id": _first_text(drive.get("id")),
                "team_id": team_id,
                "team_abbreviation": _first_text(team.get("abbreviation"), abbr_by_id.get(team_id)),
                "description": _first_text(drive.get("description")),
                "result": _first_text(drive.get("result"), drive.get("displayResult")),
                "yards": _first_int(drive.get("yards")),
                "offensive_plays": _first_int(drive.get("offensivePlays"), drive.get("plays")),
                "time_elapsed": _drive_time(drive.get("timeElapsed")),
                "start": start,
                "end": end,
            }
        )

    result["available"] = _contains_useful_data(result)
    return result


def _contains_useful_data(result: dict[str, Any]) -> bool:
    for section_name in ("situation", "last_play", "win_probability", "current_drive"):
        section = result.get(section_name)
        if not isinstance(section, dict):
            continue
        for key, value in section.items():
            if key in {"start", "end"} and isinstance(value, dict):
                if any(item is not None for item in value.values()):
                    return True
            elif value is not None:
                return True
    return False


def _situation_source(competition: dict[str, Any], summary: dict[str, Any]) -> dict[str, Any]:
    direct = competition.get("situation")
    if isinstance(direct, dict):
        return direct
    header = summary.get("header")
    if isinstance(header, dict):
        competitions = header.get("competitions")
        if isinstance(competitions, list) and competitions:
            comp = competitions[0]
            if isinstance(comp, dict) and isinstance(comp.get("situation"), dict):
                return comp["situation"]
    direct = summary.get("situation")
    return direct if isinstance(direct, dict) else {}


def _last_play_source(situation: dict[str, Any], summary: dict[str, Any]) -> dict[str, Any]:
    if isinstance(situation.get("lastPlay"), dict):
        return situation["lastPlay"]
    drives = summary.get("drives")
    if isinstance(drives, dict):
        current = drives.get("current")
        if isinstance(current, dict):
            plays = current.get("plays")
            if isinstance(plays, list) and plays and isinstance(plays[-1], dict):
                return plays[-1]
        previous = drives.get("previous")
        if isinstance(previous, list) and previous:
            drive = previous[-1]
            if isinstance(drive, dict):
                plays = drive.get("plays")
                if isinstance(plays, list) and plays and isinstance(plays[-1], dict):
                    return plays[-1]
    return {}


def _latest_win_probability(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, list):
        return None
    for item in reversed(raw):
        if isinstance(item, dict) and _float_or_none(item.get("homeWinPercentage")) is not None:
            return item
    return None


def _current_drive(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    current = raw.get("current")
    if isinstance(current, dict):
        return current
    return None


def _drive_point(raw: Any) -> dict[str, Any]:
    result = {
        "period": None,
        "clock": None,
        "yard_line": None,
        "yards_to_endzone": None,
        "text": None,
    }
    if not isinstance(raw, dict):
        return result
    period = raw.get("period")
    if isinstance(period, dict):
        period = period.get("number") or period.get("value")
    clock = raw.get("clock")
    if isinstance(clock, dict):
        clock = clock.get("displayValue") or clock.get("value")
    result.update(
        {
            "period": _int_or_none(period),
            "clock": _text_or_none(clock),
            "yard_line": _int_or_none(raw.get("yardLine")),
            "yards_to_endzone": _int_or_none(raw.get("yardsToEndzone")),
            "text": _first_text(raw.get("text"), raw.get("possessionText")),
        }
    )
    return result


def _drive_time(raw: Any) -> str | None:
    if isinstance(raw, dict):
        return _first_text(raw.get("displayValue"), raw.get("value"))
    return _text_or_none(raw)


def _competition_team_map(competition: dict[str, Any]) -> tuple[dict[str, str], dict[str, str]]:
    side_by_id: dict[str, str] = {}
    abbr_by_id: dict[str, str] = {}
    competitors = competition.get("competitors")
    if not isinstance(competitors, list):
        return side_by_id, abbr_by_id
    for competitor in competitors:
        if not isinstance(competitor, dict):
            continue
        team = competitor.get("team") if isinstance(competitor.get("team"), dict) else {}
        team_id = _first_text(team.get("id"), competitor.get("id"))
        if not team_id:
            continue
        side = _first_text(competitor.get("homeAway"))
        if side in {"home", "away"}:
            side_by_id[team_id] = side
        abbreviation = _first_text(team.get("abbreviation"))
        if abbreviation:
            abbr_by_id[team_id] = abbreviation
    return side_by_id, abbr_by_id


def _game_state(event: dict[str, Any], competition: dict[str, Any]) -> str | None:
    status = competition.get("status") if isinstance(competition.get("status"), dict) else event.get("status")
    if not isinstance(status, dict):
        return None
    status_type = status.get("type")
    if not isinstance(status_type, dict):
        return None
    return _text_or_none(status_type.get("state"))


def _team_id(value: Any) -> str | None:
    if isinstance(value, dict):
        return _first_text(value.get("id"), value.get("teamId"))
    return _string_or_none(value)


def _value(mapping: Any, key: str) -> Any:
    return mapping.get(key) if isinstance(mapping, dict) else None


def _derive_red_zone(yards_to_endzone: Any) -> bool | None:
    yards = _int_or_none(yards_to_endzone)
    return yards <= 20 if yards is not None else None


def _fill_missing(destination: dict[str, Any], source: dict[str, Any]) -> None:
    for key, source_value in source.items():
        if key not in destination:
            destination[key] = deepcopy(source_value)
            continue
        destination_value = destination[key]
        if isinstance(destination_value, dict) and isinstance(source_value, dict):
            _fill_missing(destination_value, source_value)
        elif destination_value is None and source_value is not None:
            destination[key] = deepcopy(source_value)


def _first_text(*values: Any) -> str | None:
    for value in values:
        text = _text_or_none(value)
        if text is not None:
            return text
    return None


def _first_int(*values: Any) -> int | None:
    for value in values:
        parsed = _int_or_none(value)
        if parsed is not None:
            return parsed
    return None


def _first_bool(*values: Any) -> bool | None:
    for value in values:
        if isinstance(value, bool):
            return value
        if value is None:
            continue
        text = str(value).strip().lower()
        if text in {"true", "1", "yes"}:
            return True
        if text in {"false", "0", "no"}:
            return False
    return None


def _int_or_none(value: Any) -> int | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        return int(float(str(value).strip()))
    except (TypeError, ValueError):
        return None


def _float_or_none(value: Any) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return None


def _string_or_none(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _text_or_none(value: Any) -> str | None:
    text = _string_or_none(value)
    if text in {"-", "--", "—"}:
        return None
    return text
