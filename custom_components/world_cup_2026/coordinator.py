"""World Cup 2026 data coordinator."""

from __future__ import annotations

from datetime import timedelta, datetime, timezone
import asyncio
import base64
import hashlib
import json
import logging
from pathlib import Path

import aiohttp

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import WorldCupAPI

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL_IDLE = timedelta(minutes=30)
SCAN_INTERVAL_NORMAL = timedelta(minutes=5)
SCAN_INTERVAL_PRE_MATCH = timedelta(seconds=30)
SCAN_INTERVAL_LIVE = timedelta(seconds=10)

TOTAL_WORLD_CUP_MATCHES = 104
LIVE_STATUSES = {"IN_PLAY", "PAUSED", "LIVE", "1H", "2H", "HT", "HALF_TIME", "ET", "BT", "P", "SUSP", "INT"}
FINISHED_STATUSES = {"FINISHED", "FT", "AET", "PEN"}

STADIUM_WEATHER_CACHE_SECONDS = 10 * 60
STADIUM_WEATHER_LOCATIONS = {
    "atlanta stadium": {"stadium": "Mercedes-Benz Stadium", "city": "Atlanta", "country": "USA", "lat": 33.7554, "lon": -84.4008},
    "mercedes-benz stadium": {"stadium": "Mercedes-Benz Stadium", "city": "Atlanta", "country": "USA", "lat": 33.7554, "lon": -84.4008},
    "boston stadium": {"stadium": "Gillette Stadium", "city": "Boston", "country": "USA", "lat": 42.0909, "lon": -71.2643},
    "gillette stadium": {"stadium": "Gillette Stadium", "city": "Boston", "country": "USA", "lat": 42.0909, "lon": -71.2643},
    "dallas stadium": {"stadium": "AT&T Stadium", "city": "Dallas", "country": "USA", "lat": 32.7473, "lon": -97.0945},
    "at&t stadium": {"stadium": "AT&T Stadium", "city": "Dallas", "country": "USA", "lat": 32.7473, "lon": -97.0945},
    "guadalajara stadium": {"stadium": "Estadio Akron", "city": "Guadalajara", "country": "Mexico", "lat": 20.6818, "lon": -103.4622},
    "estadio akron": {"stadium": "Estadio Akron", "city": "Guadalajara", "country": "Mexico", "lat": 20.6818, "lon": -103.4622},
    "houston stadium": {"stadium": "NRG Stadium", "city": "Houston", "country": "USA", "lat": 29.6847, "lon": -95.4107},
    "nrg stadium": {"stadium": "NRG Stadium", "city": "Houston", "country": "USA", "lat": 29.6847, "lon": -95.4107},
    "kansas city stadium": {"stadium": "Arrowhead Stadium", "city": "Kansas City", "country": "USA", "lat": 39.0489, "lon": -94.4839},
    "arrowhead stadium": {"stadium": "Arrowhead Stadium", "city": "Kansas City", "country": "USA", "lat": 39.0489, "lon": -94.4839},
    "los angeles stadium": {"stadium": "SoFi Stadium", "city": "Los Angeles", "country": "USA", "lat": 33.9535, "lon": -118.3392},
    "sofi stadium": {"stadium": "SoFi Stadium", "city": "Los Angeles", "country": "USA", "lat": 33.9535, "lon": -118.3392},
    "mexico city stadium": {"stadium": "Estadio Banorte", "city": "Mexico City", "country": "Mexico", "lat": 19.3030, "lon": -99.1505},
    "estadio banorte": {"stadium": "Estadio Banorte", "city": "Mexico City", "country": "Mexico", "lat": 19.3030, "lon": -99.1505},
    "estadio azteca": {"stadium": "Estadio Banorte", "city": "Mexico City", "country": "Mexico", "lat": 19.3030, "lon": -99.1505},
    "miami stadium": {"stadium": "Hard Rock Stadium", "city": "Miami", "country": "USA", "lat": 25.9580, "lon": -80.2389},
    "hard rock stadium": {"stadium": "Hard Rock Stadium", "city": "Miami", "country": "USA", "lat": 25.9580, "lon": -80.2389},
    "monterrey stadium": {"stadium": "Estadio BBVA", "city": "Monterrey", "country": "Mexico", "lat": 25.6682, "lon": -100.2446},
    "estadio bbva": {"stadium": "Estadio BBVA", "city": "Monterrey", "country": "Mexico", "lat": 25.6682, "lon": -100.2446},
    "new york new jersey stadium": {"stadium": "MetLife Stadium", "city": "New York/New Jersey", "country": "USA", "lat": 40.8135, "lon": -74.0745},
    "metlife stadium": {"stadium": "MetLife Stadium", "city": "New York/New Jersey", "country": "USA", "lat": 40.8135, "lon": -74.0745},
    "philadelphia stadium": {"stadium": "Lincoln Financial Field", "city": "Philadelphia", "country": "USA", "lat": 39.9008, "lon": -75.1675},
    "lincoln financial field": {"stadium": "Lincoln Financial Field", "city": "Philadelphia", "country": "USA", "lat": 39.9008, "lon": -75.1675},
    "san francisco bay area stadium": {"stadium": "Levi's Stadium", "city": "San Francisco Bay Area", "country": "USA", "lat": 37.4030, "lon": -121.9700},
    "levi's stadium": {"stadium": "Levi's Stadium", "city": "San Francisco Bay Area", "country": "USA", "lat": 37.4030, "lon": -121.9700},
    "seattle stadium": {"stadium": "Lumen Field", "city": "Seattle", "country": "USA", "lat": 47.5952, "lon": -122.3316},
    "lumen field": {"stadium": "Lumen Field", "city": "Seattle", "country": "USA", "lat": 47.5952, "lon": -122.3316},
    "toronto stadium": {"stadium": "BMO Field", "city": "Toronto", "country": "Canada", "lat": 43.6332, "lon": -79.4186},
    "bmo field": {"stadium": "BMO Field", "city": "Toronto", "country": "Canada", "lat": 43.6332, "lon": -79.4186},
    "vancouver stadium": {"stadium": "BC Place", "city": "Vancouver", "country": "Canada", "lat": 49.2768, "lon": -123.1119},
    "bc place": {"stadium": "BC Place", "city": "Vancouver", "country": "Canada", "lat": 49.2768, "lon": -123.1119},
}

FIXTURE_WEATHER_VENUES = {
    "mexico|south africa": "Mexico City Stadium",
    "korea|czechia": "Guadalajara Stadium",
    "canada|bosnia herzegovina": "Toronto Stadium",
    "united states|paraguay": "Los Angeles Stadium",
    "qatar|switzerland": "San Francisco Bay Area Stadium",
    "haiti|scotland": "Boston Stadium",
    "brazil|morocco": "New York New Jersey Stadium",
    "australia|turkey": "Vancouver Stadium",
    "germany|curacao": "Houston Stadium",
    "netherlands|japan": "Dallas Stadium",
    "tunisia|sweden": "Monterrey Stadium",
    "ivory coast|ecuador": "Philadelphia Stadium",
    "spain|cape verde": "Atlanta Stadium",
    "belgium|egypt": "Seattle Stadium",
    "iran|new zealand": "Los Angeles Stadium",
    "austria|jordan": "San Francisco Bay Area Stadium",
    "france|senegal": "New York New Jersey Stadium",
    "norway|iraq": "Boston Stadium",
    "argentina|algeria": "Kansas City Stadium",
    "portugal|congo dr": "Houston Stadium",
    "england|croatia": "Dallas Stadium",
    "ghana|panama": "Toronto Stadium",
    "uzbekistan|colombia": "Mexico City Stadium",
    "canada|qatar": "Vancouver Stadium",
    "south africa|czechia": "Atlanta Stadium",
    "switzerland|bosnia herzegovina": "Los Angeles Stadium",
    "mexico|korea": "Guadalajara Stadium",
    "scotland|morocco": "Boston Stadium",
    "brazil|haiti": "Philadelphia Stadium",
    "united states|australia": "Seattle Stadium",
    "paraguay|turkey": "San Francisco Bay Area Stadium",
    "germany|ivory coast": "Toronto Stadium",
    "tunisia|japan": "Monterrey Stadium",
    "netherlands|sweden": "Houston Stadium",
    "ecuador|curacao": "Kansas City Stadium",
    "new zealand|egypt": "Vancouver Stadium",
    "spain|saudi arabia": "Atlanta Stadium",
    "belgium|iran": "Los Angeles Stadium",
    "uruguay|cape verde": "Miami Stadium",
    "france|iraq": "Philadelphia Stadium",
    "norway|senegal": "New York New Jersey Stadium",
    "jordan|algeria": "San Francisco Bay Area Stadium",
    "argentina|austria": "Dallas Stadium",
    "portugal|uzbekistan": "Houston Stadium",
    "england|ghana": "Boston Stadium",
    "panama|croatia": "Toronto Stadium",
    "colombia|congo dr": "Guadalajara Stadium",
    "canada|switzerland": "Vancouver Stadium",
    "qatar|bosnia herzegovina": "Seattle Stadium",
    "morocco|haiti": "Atlanta Stadium",
    "scotland|brazil": "Miami Stadium",
    "mexico|czechia": "Mexico City Stadium",
    "korea|south africa": "Monterrey Stadium",
    "ecuador|germany": "New York New Jersey Stadium",
    "curacao|ivory coast": "Philadelphia Stadium",
    "tunisia|netherlands": "Kansas City Stadium",
    "japan|sweden": "Dallas Stadium",
    "united states|turkey": "Los Angeles Stadium",
    "paraguay|australia": "San Francisco Bay Area Stadium",
    "senegal|iraq": "Toronto Stadium",
    "norway|france": "Boston Stadium",
    "cape verde|saudi arabia": "Houston Stadium",
    "uruguay|spain": "Guadalajara Stadium",
    "new zealand|belgium": "Vancouver Stadium",
    "egypt|iran": "Seattle Stadium",
    "panama|england": "New York New Jersey Stadium",
    "croatia|ghana": "Philadelphia Stadium",
    "colombia|portugal": "Miami Stadium",
    "uzbekistan|congo dr": "Atlanta Stadium",
    "jordan|argentina": "Dallas Stadium",
    "algeria|austria": "Kansas City Stadium",
}


def _country_flag(country):
    """Return the flag emoji for a host country."""
    return {
        "USA": "🇺🇸",
        "Canada": "🇨🇦",
        "Mexico": "🇲🇽",
    }.get(country, "")


def _stadium_note(stadium):
    """Return the current venue note used by the existing frontend."""
    real_name = stadium.get("real_name")

    if real_name == "MetLife Stadium":
        return "Final venue"
    if real_name == "Estadio Azteca":
        return "Opening match venue"

    return "Host venue"


def _load_stadiums():
    """Load stadium data from local JSON file."""
    stadiums_file = Path(__file__).parent / "data" / "stadiums.json"

    try:
        with open(stadiums_file, encoding="utf-8") as file:
            stadiums = json.load(file)
    except FileNotFoundError:
        _LOGGER.error("stadiums.json not found: %s", stadiums_file)
        return []
    except json.JSONDecodeError as err:
        _LOGGER.error("Invalid stadiums.json: %s", err)
        return []
    except Exception as err:  # pylint: disable=broad-exception-caught
        _LOGGER.error("Failed to load stadiums.json: %s", err)
        return []

    if not isinstance(stadiums, list):
        _LOGGER.error("stadiums.json must contain a list of stadiums")
        return []

    return stadiums


async def _async_load_stadiums(hass):
    """Load stadium data without blocking the event loop."""
    return await hass.async_add_executor_job(_load_stadiums)


def _serialise_stadium(stadium):
    """Convert local JSON stadium data into the existing frontend format."""
    country = stadium.get("country", "")

    return {
        "name": stadium.get("name"),
        "real_name": stadium.get("real_name"),
        "stadium": stadium.get("real_name") or stadium.get("name", "TBC"),
        "city": stadium.get("city", "TBC"),
        "country": country,
        "flag": _country_flag(country),
        "capacity": stadium.get("capacity", 0),
        "matches": stadium.get("matches", 0),
        "image": stadium.get("image"),
        "note": _stadium_note(stadium),
    }


def _team_name(team):
    if isinstance(team, dict):
        return team.get("shortName") or team.get("name") or team.get("tla") or "TBC"
    return team or "TBC"


def _normalise_team_name(value):
    """Normalise team names so football-data and API-Football can be matched."""
    value = str(value or "").lower()
    replacements = {
        "&": " and ",
        "republic": "",
        "south korea": "korea",
        "korea republic": "korea",
        "usa": "united states",
        "u.s.a.": "united states",
        "turkiye": "turkey",
        "türkiye": "turkey",
        "côte d’ivoire": "ivory coast",
        "cote d ivoire": "ivory coast",
        "cote d'ivoire": "ivory coast",
        "bosnia and herzegovina": "bosnia herzegovina",
        "bosnia-herzegovina": "bosnia herzegovina",
        "bosnia & herzegovina": "bosnia herzegovina",
        "bosnia and herzeg.": "bosnia herzegovina",
        "bosnia and herz.": "bosnia herzegovina",
        "bosnia herzeg.": "bosnia herzegovina",
        "bosnia herz.": "bosnia herzegovina",
        "bosnia h.": "bosnia herzegovina",
        "bosnia-h.": "bosnia herzegovina",
        "bosnia-h": "bosnia herzegovina",
        "bosnia h": "bosnia herzegovina",
        "bosnia-herz": "bosnia herzegovina",
        "bosnia herz": "bosnia herzegovina",
        "bosnia and herz": "bosnia herzegovina",
        "bosnia and herzeg": "bosnia herzegovina",
        "cape verde islands": "cape verde",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)

    # API-Football can abbreviate Bosnia and Herzegovina in several ways.
    # Expand these before punctuation is stripped so Canada v Bosnia-H.
    # matches football-data's Bosnia-Herzegovina / Bosnia-H. naming.
    value = value.replace("herzeg.", "herzegovina")
    value = value.replace("herz.", "herzegovina")
    value = value.replace("bosnia h ", "bosnia herzegovina ")

    value = "".join(ch if ch.isalnum() else " " for ch in value)
    return " ".join(value.split())


def _match_key_from_names(home, away):
    return f"{_normalise_team_name(home)}|{_normalise_team_name(away)}"



def _team_names_match(left, right):
    """Return True when two provider team names are close enough to be the same team."""
    left_norm = _normalise_team_name(left)
    right_norm = _normalise_team_name(right)

    if not left_norm or not right_norm:
        return False

    if left_norm == right_norm:
        return True

    left_tokens = set(left_norm.split())
    right_tokens = set(right_norm.split())

    # Handle provider abbreviations like "Bosnia-H." / "Bosnia and Herz.".
    if left_tokens and right_tokens and left_tokens.issubset(right_tokens):
        return True
    if left_tokens and right_tokens and right_tokens.issubset(left_tokens):
        return True

    return False


def _api_fixture_matches_match(api_home, api_away, match):
    """Match API-Football fixture names against a football-data.org match."""
    match_home = _team_name(match.get("homeTeam", {}))
    match_away = _team_name(match.get("awayTeam", {}))

    return (
        _team_names_match(api_home, match_home)
        and _team_names_match(api_away, match_away)
    ) or (
        _team_names_match(api_home, match_away)
        and _team_names_match(api_away, match_home)
    )




def _api_football_item_datetime(item):
    """Return API-Football fixture kickoff as UTC datetime when present."""
    fixture = item.get("fixture") or {} if isinstance(item, dict) else {}
    value = fixture.get("date")
    return parse_datetime_utc(value)


def _api_football_item_score(item):
    """Return API-Football home/away score for an item."""
    goals = item.get("goals") or {} if isinstance(item, dict) else {}
    home = _safe_int(goals.get("home"))
    away = _safe_int(goals.get("away"))
    if home is None or away is None:
        score = item.get("score") or {} if isinstance(item, dict) else {}
        fulltime = score.get("fulltime") or {}
        if home is None:
            home = _safe_int(fulltime.get("home"))
        if away is None:
            away = _safe_int(fulltime.get("away"))
    return home, away


def _api_football_item_matches_candidate(item, candidate):
    """Return True when an API-Football item is the same game as a candidate match."""
    teams = item.get("teams") or {} if isinstance(item, dict) else {}
    api_home = (teams.get("home") or {}).get("name")
    api_away = (teams.get("away") or {}).get("name")

    if not _api_fixture_matches_match(api_home, api_away, candidate):
        return False

    candidate_dt = parse_datetime_utc(candidate.get("utcDate"))
    item_dt = _api_football_item_datetime(item)
    if candidate_dt and item_dt:
        # Providers sometimes disagree on date around midnight/timezone. Allow
        # a generous window, but still reject unrelated fixtures.
        if abs((candidate_dt - item_dt).total_seconds()) > 36 * 60 * 60:
            return False

    api_home_score, api_away_score = _api_football_item_score(item)
    match_home_score, match_away_score = _full_time_score(candidate)
    match_home_score = _safe_int(match_home_score)
    match_away_score = _safe_int(match_away_score)

    if api_home_score is not None and api_away_score is not None and match_home_score is not None and match_away_score is not None:
        candidate_home = _team_name(candidate.get("homeTeam", {}))
        candidate_away = _team_name(candidate.get("awayTeam", {}))
        same_order = _team_names_match(api_home, candidate_home) and _team_names_match(api_away, candidate_away)
        reverse_order = _team_names_match(api_home, candidate_away) and _team_names_match(api_away, candidate_home)
        if same_order and (api_home_score, api_away_score) != (match_home_score, match_away_score):
            return False
        if reverse_order and (api_home_score, api_away_score) != (match_away_score, match_home_score):
            return False

    return True

def _full_time_score(match):
    score = match.get("score") or {}
    full_time = score.get("fullTime") or {}
    return full_time.get("home"), full_time.get("away")


def _expected_goal_count_from_match(match):
    """Return the final score total when it is available."""
    home_score, away_score = _full_time_score(match)
    home_score = _safe_int(home_score)
    away_score = _safe_int(away_score)
    if home_score is None or away_score is None:
        return None
    return home_score + away_score


def _expected_goal_count_from_api_football_item(item):
    """Return the current/final goal total from an API-Football fixture item."""
    goals = item.get("goals") or {}
    home_score = _safe_int(goals.get("home"))
    away_score = _safe_int(goals.get("away"))
    if home_score is None or away_score is None:
        score = item.get("score") or {}
        fulltime = score.get("fulltime") or {}
        home_score = _safe_int(fulltime.get("home"))
        away_score = _safe_int(fulltime.get("away"))
    if home_score is None or away_score is None:
        return None
    return home_score + away_score


def _count_goal_events(events):
    """Count real scoring events, including own goals and penalties."""
    count = 0
    for event in events or []:
        if not isinstance(event, dict):
            continue
        if _is_disallowed_goal_event(event):
            continue
        event_type = str(event.get("type") or "").lower()
        detail = str(event.get("detail") or "").lower()
        if "goal" in event_type or "goal" in detail:
            count += 1
    return count


def _is_disallowed_goal_event(event):
    """Return True when a goal-looking event was cancelled by VAR/referee."""
    if not isinstance(event, dict):
        return False
    text = " ".join(
        str(event.get(key) or "")
        for key in ("type", "rawType", "detail", "comments", "reason", "subType")
    ).lower()
    return any(
        marker in text
        for marker in (
            "disallowed",
            "disallow",
            "cancelled",
            "canceled",
            "goal cancelled",
            "goal canceled",
            "goal disallowed",
            "no goal",
            "var - no goal",
        )
    )


def _is_real_goal_event(event):
    """Return True only for scoring events that should count on the scoreboard."""
    if not isinstance(event, dict) or _is_disallowed_goal_event(event):
        return False
    event_type = str(event.get("type") or "").lower()
    raw_type = str(event.get("rawType") or "").lower()
    detail = str(event.get("detail") or "").lower()
    return (
        event_type in {"goal", "own goal", "penalty"}
        or raw_type == "goal"
        or ("goal" in detail and "missed" not in detail)
    )


def _has_matching_disallowed_event(event, events):
    """Return True when a nearby VAR/no-goal event cancels this goal row."""
    if not isinstance(event, dict):
        return False
    event_minute = event.get("timerSeconds")
    if event_minute is None:
        event_minute = event.get("minute")
    event_team = _normalise_team_name(event.get("team"))
    event_player = str(event.get("player") or "").lower().strip()

    for other in events or []:
        if other is event or not _is_disallowed_goal_event(other):
            continue
        other_minute = other.get("timerSeconds")
        if other_minute is None:
            other_minute = other.get("minute")
        same_minute = event_minute is not None and other_minute is not None and str(event_minute) == str(other_minute)
        same_team = event_team and event_team == _normalise_team_name(other.get("team"))
        same_player = event_player and event_player == str(other.get("player") or "").lower().strip()
        if same_minute and (same_team or same_player):
            return True
    return False



def _safe_int(value):
    try:
        if value in (None, ""):
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


def _extract_match_minute(match):
    """Return a useful live minute from football-data.org when present.

    Some football-data payloads include minute=0 when the field is not really
    populated yet. Treat 0 as missing during live play so it cannot reset a
    real API-Football/live clock back to 00:00. A positive football-data minute
    still wins as the master clock.
    """
    for key in ("minute", "elapsed", "matchMinute", "currentMinute"):
        minute = _safe_int(match.get(key))
        if minute is not None and minute > 0:
            return minute

    score = match.get("score") or {}
    for key in ("minute", "elapsed", "matchMinute", "currentMinute"):
        minute = _safe_int(score.get(key))
        if minute is not None and minute > 0:
            return minute

    return None


def _normalise_event_team_name(team):
    if isinstance(team, dict):
        return team.get("shortName") or team.get("name") or team.get("tla")
    return team


def _normalise_event_person_name(player):
    if isinstance(player, dict):
        return player.get("name") or player.get("shortName")
    return player


def _normalise_football_data_goal_event(event, match=None):
    """Convert a football-data.org goal item to the frontend goal-event format."""
    if not isinstance(event, dict):
        return None

    event_type = str(event.get("type") or event.get("eventType") or "Goal").lower()
    detail = str(event.get("detail") or event.get("reason") or "")
    if event_type and "goal" not in event_type and "goal" not in detail.lower():
        return None

    minute = _safe_int(event.get("minute") or event.get("elapsed"))
    extra = _safe_int(event.get("injuryTime") or event.get("extra") or event.get("stoppageTime"))

    player = (
        _normalise_event_person_name(event.get("scorer"))
        or _normalise_event_person_name(event.get("player"))
        or _normalise_event_person_name(event.get("playerName"))
        or event.get("name")
    )

    assist = (
        _normalise_event_person_name(event.get("assist"))
        or _normalise_event_person_name(event.get("assistBy"))
    )

    team = (
        _normalise_event_team_name(event.get("team"))
        or _normalise_event_team_name(event.get("teamName"))
    )

    if not team and match is not None:
        # football-data goal payloads can omit team but include a score side.
        side = str(event.get("side") or event.get("teamSide") or "").lower()
        if side == "home":
            team = _team_name(match.get("homeTeam", {}))
        elif side == "away":
            team = _team_name(match.get("awayTeam", {}))

    if not player or str(player).strip().lower() == "goal":
        return None

    if minute is None:
        return None

    timer_seconds = (minute + (extra or 0)) * 60
    display_minute = f"{minute}+{extra}'" if extra and extra > 0 else f"{minute}'"

    return {
        "type": "Goal",
        "team": team,
        "player": player,
        "minute": minute,
        "extra": extra,
        "assist": assist,
        "detail": event.get("detail") or event.get("type") or "Goal",
        "timer": f"{timer_seconds // 60}:{timer_seconds % 60:02d}",
        "timerSeconds": timer_seconds,
        "displayMinute": display_minute,
        "source": "football_data",
    }


def _extract_football_data_goal_events(match):
    """Return real goal events from football-data.org match payloads."""
    raw_events = []
    for key in ("goals", "goalEvents"):
        value = match.get(key)
        if isinstance(value, list):
            raw_events.extend(value)

    # Some payloads use a generic events list; keep only goal events.
    events = match.get("events")
    if isinstance(events, list):
        raw_events.extend(events)

    goal_events = []
    for item in raw_events:
        event = _normalise_football_data_goal_event(item, match=match)
        if event:
            event["matchId"] = match.get("id")
            event["matchUtcDate"] = match.get("utcDate")
            event["homeTeam"] = _team_name(match.get("homeTeam", {}))
            event["awayTeam"] = _team_name(match.get("awayTeam", {}))
            goal_events.append(event)

    goal_events.sort(key=lambda event: int(event.get("timerSeconds") or 0))
    for index, event in enumerate(goal_events, start=1):
        event["goalNumber"] = index
    return goal_events

def parse_datetime_utc(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).astimezone(timezone.utc)
    except (TypeError, ValueError):
        return None


def _is_finished(match):
    home, away = _full_time_score(match)
    return match.get("status") in FINISHED_STATUSES or (home is not None and away is not None)


def _serialise_basic_match(match):
    home, away = _full_time_score(match)
    return {
        "id": match.get("id"),
        "utcDate": match.get("utcDate"),
        "status": match.get("status"),
        "stage": match.get("stage"),
        "group": match.get("group"),
        "homeTeam": _team_name(match.get("homeTeam", {})),
        "awayTeam": _team_name(match.get("awayTeam", {})),
        "homeScore": home,
        "awayScore": away,
    }


def _build_team_goal_stats(matches):
    stats = {}

    for match in matches:
        if not _is_finished(match):
            continue

        home_name = _team_name(match.get("homeTeam", {}))
        away_name = _team_name(match.get("awayTeam", {}))
        home_score, away_score = _full_time_score(match)

        if home_score is None or away_score is None:
            continue

        for team in (home_name, away_name):
            stats.setdefault(
                team,
                {
                    "team": team,
                    "played": 0,
                    "goalsFor": 0,
                    "goalsAgainst": 0,
                    "goalDifference": 0,
                    "cleanSheets": 0,
                    "wins": 0,
                    "draws": 0,
                    "losses": 0,
                },
            )

        stats[home_name]["played"] += 1
        stats[home_name]["goalsFor"] += home_score
        stats[home_name]["goalsAgainst"] += away_score

        stats[away_name]["played"] += 1
        stats[away_name]["goalsFor"] += away_score
        stats[away_name]["goalsAgainst"] += home_score

        if away_score == 0:
            stats[home_name]["cleanSheets"] += 1
        if home_score == 0:
            stats[away_name]["cleanSheets"] += 1

        if home_score > away_score:
            stats[home_name]["wins"] += 1
            stats[away_name]["losses"] += 1
        elif away_score > home_score:
            stats[away_name]["wins"] += 1
            stats[home_name]["losses"] += 1
        else:
            stats[home_name]["draws"] += 1
            stats[away_name]["draws"] += 1

    for item in stats.values():
        item["goalDifference"] = item["goalsFor"] - item["goalsAgainst"]

    return list(stats.values())


def _build_statistics(matches, standings, scorers):
    finished = [m for m in matches if _is_finished(m)]
    live = [m for m in matches if m.get("status") in LIVE_STATUSES]

    total_goals = 0
    draws = 0
    btts = 0
    over_25 = 0

    for match in finished:
        home, away = _full_time_score(match)
        if home is None or away is None:
            continue

        goals = home + away
        total_goals += goals

        if home == away:
            draws += 1
        if home > 0 and away > 0:
            btts += 1
        if goals >= 3:
            over_25 += 1

    played = len(finished)

    return {
        "matches_total": TOTAL_WORLD_CUP_MATCHES,
        "matches_loaded": len(matches),
        "matches_played": played,
        "matches_remaining": max(TOTAL_WORLD_CUP_MATCHES - played, 0),
        "progress": round((played / TOTAL_WORLD_CUP_MATCHES) * 100, 1) if TOTAL_WORLD_CUP_MATCHES else 0,
        "total_goals": total_goals,
        "goals_per_match": round(total_goals / played, 2) if played else 0,
        "draws": draws,
        "draw_rate": round((draws / played) * 100, 1) if played else 0,
        "btts": btts,
        "btts_rate": round((btts / played) * 100, 1) if played else 0,
        "over_25": over_25,
        "over_25_rate": round((over_25 / played) * 100, 1) if played else 0,
        "live_matches": len(live),
        "groups": len(standings),
        "scorers": len(scorers),
    }


def _build_records(matches):
    finished = [m for m in matches if _is_finished(m)]
    team_stats = _build_team_goal_stats(matches)

    biggest_win = None
    biggest_margin = -1
    highest_scoring_match = None
    highest_total_goals = -1
    latest_result = None

    for match in finished:
        home, away = _full_time_score(match)
        if home is None or away is None:
            continue

        margin = abs(home - away)
        total_goals = home + away

        if margin > biggest_margin:
            biggest_margin = margin
            biggest_win = _serialise_basic_match(match)
            biggest_win["margin"] = margin

        if total_goals > highest_total_goals:
            highest_total_goals = total_goals
            highest_scoring_match = _serialise_basic_match(match)
            highest_scoring_match["totalGoals"] = total_goals

    if finished:
        latest_result = _serialise_basic_match(finished[-1])

    top_scoring_team = None
    best_defence = None
    clean_sheets = None

    if team_stats:
        top_scoring_team = sorted(team_stats, key=lambda t: t["goalsFor"], reverse=True)[0]
        best_defence = sorted(team_stats, key=lambda t: (t["goalsAgainst"], -t["played"]))[0]
        clean_sheets = sorted(team_stats, key=lambda t: t["cleanSheets"], reverse=True)[0]

    return {
        "highest_scoring_match": highest_scoring_match,
        "biggest_win": biggest_win,
        "latest_result": latest_result,
        "top_scoring_team": top_scoring_team,
        "best_defence": best_defence,
        "clean_sheets": clean_sheets,
        "team_stats": sorted(team_stats, key=lambda t: t["goalsFor"], reverse=True),
    }


async def _build_venues(hass):
    stadiums = [
        _serialise_stadium(stadium)
        for stadium in await _async_load_stadiums(hass)
    ]

    countries = {}
    for venue in stadiums:
        country = venue["country"]
        countries[country] = countries.get(country, 0) + 1

    final_venue = next(
        (venue for venue in stadiums if venue["stadium"] == "MetLife Stadium"),
        stadiums[0] if stadiums else None,
    )

    return {
        "stadiums": stadiums,
        "host_cities": [
            {
                "city": venue["city"],
                "country": venue["country"],
                "flag": venue["flag"],
                "stadium": venue["stadium"],
            }
            for venue in stadiums
        ],
        "country_counts": countries,
        "final_venue": final_venue,
    }


class WorldCupCoordinator(DataUpdateCoordinator):
    def __init__(self, hass, api: WorldCupAPI) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name="World Cup 2026",
            update_interval=SCAN_INTERVAL_NORMAL,
        )
        self.api = api
        self._live_api_football_cache = {}
        self._live_api_football_last_fetch = None
        self._live_fixture_status_last_fetch = None
        self._post_match_api_football_cache = {}
        self._post_match_api_football_last_fetch = None
        self._api_football_rate_limited_until = None
        self._api_football_rate_limited_logged = False
        self._api_football_live_rate_limited_until = None
        self._api_football_live_rate_limited_logged = False
        self._live_events_last_fetch_by_fixture = {}
        self._live_statistics_cache_by_fixture = {}
        self._live_statistics_last_fetch_by_fixture = {}
        self._goal_event_store = {}
        self._goal_event_store_loaded = False
        self._github_payload_hashes = {}
        self._stadium_weather_cache = {}
        self._api_football_player_photo_cache = {}

    def _api_football_is_rate_limited(self):
        """Return True while API-Football is in rate-limit cool-down."""
        if not self._api_football_rate_limited_until:
            return False
        now = datetime.now(timezone.utc)
        if now >= self._api_football_rate_limited_until:
            self._api_football_rate_limited_until = None
            self._api_football_rate_limited_logged = False
            return False
        return True

    def _mark_api_football_rate_limited(self, source="API-Football"):
        """Back off API-Football calls after a 429 so Home Assistant keeps loading."""
        self._api_football_rate_limited_until = datetime.now(timezone.utc) + timedelta(hours=1)
        if not self._api_football_rate_limited_logged:
            _LOGGER.warning(
                "%s rate limit hit. Pausing API-Football calls for 1 hour and using cached/football-data data.",
                source,
            )
            self._api_football_rate_limited_logged = True

    def _api_football_live_is_rate_limited(self):
        """Return True only while live API-Football calls are cooling down.

        Live polling must not be blocked by slower post-match/date lookups,
        otherwise a stale HT value can remain on screen after second half starts.
        """
        if not self._api_football_live_rate_limited_until:
            return False
        now = datetime.now(timezone.utc)
        if now >= self._api_football_live_rate_limited_until:
            self._api_football_live_rate_limited_until = None
            self._api_football_live_rate_limited_logged = False
            return False
        return True

    def _mark_api_football_live_rate_limited(self, source="API-Football live lookup"):
        """Short live-only backoff after a 429.

        Do not use the 1 hour post-match backoff for live games. During a live
        match we need to retry soon so HT can change to 2H/46' automatically.
        """
        self._api_football_live_rate_limited_until = datetime.now(timezone.utc) + timedelta(seconds=30)
        if not self._api_football_live_rate_limited_logged:
            _LOGGER.warning(
                "%s rate limit hit. Pausing live API-Football calls for 30 seconds and using cached/football-data data.",
                source,
            )
            self._api_football_live_rate_limited_logged = True

    @staticmethod
    def _truthy(value):
        """Return True for common YAML truthy values."""
        return str(value or "").strip().lower() in {"1", "true", "yes", "on", "main", "master"}

    async def _is_main_live_provider(self):
        """Return True when this install is allowed to call/publish live data.

        Emergency rule: if an API-Football key exists on this install, treat it
        as the master/provider. This stops live polling being disabled because
        a provider flag is missing/misread while a match is live. Viewer installs
        should not have the API-Football key in secrets.yaml.
        """
        settings = await self._async_read_github_settings()
        if settings.get("api_football_key"):
            return True
        return any(
            self._truthy(settings.get(key))
            for key in (
                "world_cup_2026_main_provider",
                "world_cup_main_provider",
                "main_provider",
                "live_data_provider",
            )
        )

    def _cached_live_api_active(self, now=None):
        """Return True when the previous API-Football live response still looks active.

        This keeps the coordinator on the 10 second live loop during half-time
        and between API status transitions, so HT can change to 2H/46' without
        waiting for the normal slow poll.
        """
        now = now or datetime.now(timezone.utc)
        if not self._live_api_football_cache or not self._live_api_football_last_fetch:
            return False
        if now - self._live_api_football_last_fetch > timedelta(hours=4):
            return False
        for data in self._live_api_football_cache.values():
            status = self._status_from_api_football(data.get("apiFootballStatus"))
            if status in LIVE_STATUSES:
                return True
        return False

    def _match_live_poll_window_active(self, matches, now=None):
        """Return True only when API-Football live polling is worth doing.

        This prevents repeated /fixtures?live=all calls when there are no games
        near live. We start checking shortly before kick-off and keep checking
        for a normal match-length window after kick-off in case football-data is
        late switching status.
        """
        now = now or datetime.now(timezone.utc)
        if self._cached_live_api_active(now):
            return True
        for match in matches or []:
            if str(match.get("status") or "").upper() in LIVE_STATUSES:
                return True
            kickoff = parse_datetime_utc(match.get("utcDate"))
            if not kickoff:
                continue
            if kickoff - timedelta(minutes=30) <= now <= kickoff + timedelta(hours=3, minutes=15):
                return True
        return False

    def _next_match_seconds(self, matches, now=None):
        """Seconds until the next unfinished match, or None."""
        now = now or datetime.now(timezone.utc)
        soonest = None
        for match in matches or []:
            if _is_finished(match):
                continue
            kickoff = parse_datetime_utc(match.get("utcDate"))
            if not kickoff or kickoff < now:
                continue
            if soonest is None or kickoff < soonest:
                soonest = kickoff
        if not soonest:
            return None
        return max(0, int((soonest - now).total_seconds()))

    def _promote_near_kickoff_matches_to_live(self, matches, now=None):
        """Move matches into Live shortly before kick-off so panels are ready."""
        now = now or datetime.now(timezone.utc)
        for match in matches or []:
            if _is_finished(match):
                continue
            status = str(match.get("status") or "").upper()
            if status in LIVE_STATUSES:
                continue
            kickoff = parse_datetime_utc(match.get("utcDate"))
            if not kickoff:
                continue
            if not kickoff - timedelta(minutes=5) <= now <= kickoff + timedelta(minutes=20):
                continue

            match["status"] = "LIVE"
            match["liveSource"] = "pre_kickoff_window"
            match["awaitingLiveApiData"] = True
            match["minute"] = None
            match["clockSeconds"] = 0
            match["displayMinute"] = "Awaiting kickoff API data"
            match["manualClockText"] = "Awaiting kickoff API data"
            match["clockSource"] = "awaiting_api_football_minute"
            match["manualClock"] = {
                "seconds": 0,
                "timer": "Awaiting kickoff API data",
                "displayMinute": "Awaiting kickoff API data",
                "active": False,
                "status": "LIVE",
                "source": "awaiting_api_football_minute",
                "lastApiSync": None,
            }
        return matches

    def _weather_location_key(self, value):
        return " ".join(
            "".join(ch if ch.isalnum() else " " for ch in str(value or "").lower()).split()
        )

    def _match_weather_location(self, match):
        """Return the best known stadium location for a match."""
        venue = match.get("venue") or match.get("stadium") or match.get("location") or {}
        candidates = []
        if isinstance(venue, dict):
            candidates.extend([
                venue.get("real_name"),
                venue.get("realName"),
                venue.get("name"),
                venue.get("stadium"),
                venue.get("venue"),
                venue.get("shortName"),
            ])
        else:
            candidates.append(venue)

        candidates.extend([
            match.get("venueRealName"),
            match.get("venueName"),
            match.get("venue"),
            match.get("stadium"),
        ])

        for candidate in candidates:
            key = self._weather_location_key(candidate)
            if key in STADIUM_WEATHER_LOCATIONS:
                return STADIUM_WEATHER_LOCATIONS[key]

        home = _normalise_team_name(_team_name(match.get("homeTeam", {})))
        away = _normalise_team_name(_team_name(match.get("awayTeam", {})))
        for key in (f"{home}|{away}", f"{away}|{home}"):
            venue_name = FIXTURE_WEATHER_VENUES.get(key)
            venue_key = self._weather_location_key(venue_name)
            if venue_key in STADIUM_WEATHER_LOCATIONS:
                return STADIUM_WEATHER_LOCATIONS[venue_key]

        return None

    async def _fetch_stadium_weather(self, session, location):
        """Fetch current stadium weather from met.no without touching HA weather entities."""
        if not location:
            return None

        cache_key = f"{location.get('lat')},{location.get('lon')}"
        now = datetime.now(timezone.utc)
        cached = self._stadium_weather_cache.get(cache_key)
        if cached and now - cached.get("fetched_at", now) < timedelta(seconds=STADIUM_WEATHER_CACHE_SECONDS):
            return cached.get("weather")

        url = (
            "https://api.met.no/weatherapi/locationforecast/2.0/compact"
            f"?lat={location.get('lat')}&lon={location.get('lon')}"
        )
        headers = {
            "User-Agent": "ha-world-cup-2026/4.2.10 Home Assistant stadium weather",
            "Accept": "application/json",
        }

        try:
            async with session.get(url, headers=headers) as response:
                if response.status >= 400:
                    text = await response.text()
                    _LOGGER.warning("Stadium weather lookup failed for %s: %s %s", location.get("stadium"), response.status, text)
                    return cached.get("weather") if cached else None
                payload = await response.json()
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("Stadium weather lookup failed for %s: %s", location.get("stadium"), err)
            return cached.get("weather") if cached else None

        timeseries = ((payload.get("properties") or {}).get("timeseries") or [])
        if not timeseries:
            return cached.get("weather") if cached else None

        current = timeseries[0] or {}
        data = current.get("data") or {}
        instant = (data.get("instant") or {}).get("details") or {}
        next_hour = data.get("next_1_hours") or data.get("next_6_hours") or {}
        summary = (next_hour.get("summary") or {}).get("symbol_code")

        weather = {
            "name": f"{location.get('stadium')} weather",
            "condition": summary,
            "temperature": instant.get("air_temperature"),
            "temperatureUnit": "C",
            "humidity": instant.get("relative_humidity"),
            "cloudCoverage": instant.get("cloud_area_fraction"),
            "pressure": instant.get("air_pressure_at_sea_level"),
            "pressureUnit": "hPa",
            "windBearing": instant.get("wind_from_direction"),
            "windSpeed": instant.get("wind_speed"),
            "windSpeedUnit": "m/s",
            "dewPoint": instant.get("dew_point_temperature"),
            "source": "met_no_stadium",
            "attribution": "Weather forecast from met.no, delivered by the Norwegian Meteorological Institute.",
            "stadium": location.get("stadium"),
            "city": location.get("city"),
            "country": location.get("country"),
            "latitude": location.get("lat"),
            "longitude": location.get("lon"),
            "observedAt": current.get("time"),
            "fetchedAt": now.isoformat(),
        }

        self._stadium_weather_cache[cache_key] = {
            "fetched_at": now,
            "weather": weather,
        }
        return weather

    async def _add_stadium_weather_to_live_matches(self, matches):
        """Attach stadium weather to live/pre-live matches for display/export."""
        live_matches = [match for match in matches or [] if str(match.get("status") or "").upper() in LIVE_STATUSES]
        if not live_matches:
            return matches

        timeout = aiohttp.ClientTimeout(total=20)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            for match in live_matches:
                location = self._match_weather_location(match)
                weather = await self._fetch_stadium_weather(session, location)
                if weather:
                    match["weather"] = weather
                    match["matchWeather"] = weather
                else:
                    match.pop("weather", None)
                    match.pop("matchWeather", None)
        return matches

    def _choose_poll_interval(self, matches):
        """Use fast polling only when there is a live or nearly-live match."""
        now = datetime.now(timezone.utc)
        if self._cached_live_api_active(now):
            return SCAN_INTERVAL_LIVE
        if any(str(m.get("status") or "").upper() in LIVE_STATUSES for m in matches or []):
            return SCAN_INTERVAL_LIVE

        next_seconds = self._next_match_seconds(matches, now)
        if next_seconds is not None:
            if next_seconds <= 60 * 60:
                return SCAN_INTERVAL_PRE_MATCH
            if next_seconds <= 3 * 60 * 60:
                return SCAN_INTERVAL_NORMAL

        return SCAN_INTERVAL_IDLE


    def _goal_event_store_path(self):
        return Path("/config/world_cup_2026_goal_events.json")

    def _goal_event_store_read_paths(self):
        """Home Assistant usually maps /config to /homeassistant, but support both."""
        primary = self._goal_event_store_path()
        return [
            primary,
            Path("/homeassistant/world_cup_2026_goal_events.json"),
        ]

    def _load_goal_event_store_sync(self):
        """Load persisted match clocks and goal events off the event loop."""
        for path in self._goal_event_store_read_paths():
            if not path.exists():
                continue
            data = json.loads(path.read_text(encoding="utf-8"))
            return data if isinstance(data, dict) else {}
        return {}

    async def _async_load_goal_event_store(self):
        """Load persisted match clocks and goal events without blocking Home Assistant."""
        if self._goal_event_store_loaded:
            return
        try:
            self._goal_event_store = await self.hass.async_add_executor_job(
                self._load_goal_event_store_sync
            )
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("Could not load World Cup goal event store: %s", err)
            self._goal_event_store = {}
        self._goal_event_store_loaded = True

    def _save_goal_event_store_sync(self):
        """Persist match clocks and goal events off the event loop."""
        path = self._goal_event_store_path()
        path.write_text(json.dumps(self._goal_event_store, indent=2), encoding="utf-8")

    async def _async_save_goal_event_store(self):
        """Persist match clocks and goal events without blocking Home Assistant."""
        try:
            await self.hass.async_add_executor_job(self._save_goal_event_store_sync)
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("Could not save World Cup goal event store: %s", err)

    def _match_store_key(self, match):
        match_id = match.get("id")
        if match_id is not None:
            return str(match_id)
        return _match_key_from_names(
            _team_name(match.get("homeTeam", {})),
            _team_name(match.get("awayTeam", {})),
        )

    def _score_duration(self, match):
        score = match.get("score") or {}
        return score.get("duration")

    def _normalise_goal_minute(self, seconds):
        try:
            seconds = int(seconds)
        except (TypeError, ValueError):
            seconds = 0
        minute = max(seconds // 60, 0)
        return f"{minute}'"

    def _format_timer_value(self, seconds):
        try:
            seconds = int(seconds)
        except (TypeError, ValueError):
            seconds = 0
        seconds = max(seconds, 0)
        return f"{seconds // 60}:{seconds % 60:02d}"

    def _update_match_clock_state(self, match, state, now):
        """Maintain a practical fallback match clock using status transitions."""
        status = match.get("status")
        previous_status = state.get("status")
        duration = self._score_duration(match)

        # Provider minute is the master clock. Reset to the API minute on every
        # pull and do NOT locally increment it. This HA instance exports the
        # master value to GitHub/public JSON, and every other panel displays the
        # same API minute instead of drifting with its own browser timer.
        api_minute = _extract_match_minute(match)
        if api_minute is not None and status in LIVE_STATUSES:
            api_seconds = max(int(api_minute), 0) * 60
            api_display = f"{int(api_minute)}'"
            state["base_seconds"] = api_seconds
            state["clock_seconds"] = api_seconds
            state["phase_start"] = now.isoformat()
            state["clock_active"] = False
            state["status"] = status
            state["source"] = "api_football_live_minute" if match.get("apiFootballFixtureId") else "football_data_live_minute"
            state["displayMinute"] = api_display
            state["manualClockText"] = api_display
            state["lastApiSync"] = now.isoformat()
            return state

        base_seconds = int(state.get("base_seconds") or 0)
        phase_start = state.get("phase_start")

        if status in FINISHED_STATUSES:
            state["clock_active"] = False
            state["status"] = status
            if duration == "EXTRA_TIME" or status == "AET":
                state["clock_seconds"] = max(int(state.get("clock_seconds") or 0), 120 * 60)
            elif status == "PEN":
                state["clock_seconds"] = max(int(state.get("clock_seconds") or 0), 120 * 60)
            else:
                state["clock_seconds"] = max(int(state.get("clock_seconds") or 0), 90 * 60)
            return state

        if status in {"PAUSED", "HT", "HALF_TIME"}:
            if duration == "EXTRA_TIME" or base_seconds >= 90 * 60:
                state["base_seconds"] = 105 * 60
                state["clock_seconds"] = 105 * 60
            else:
                state["base_seconds"] = 45 * 60
                state["clock_seconds"] = 45 * 60
            state["clock_active"] = False
            state["phase_start"] = None
            state["status"] = status
            return state

        if status in LIVE_STATUSES:
            # Do not invent a clock from kick-off time. Live clocks must be
            # seeded by API minute data above, then the frontend may count
            # locally only between 20-second API pulls.
            state["clock_active"] = False
            state["phase_start"] = None
            state["status"] = status
            state["source"] = "awaiting_api_football_minute"
            return state

        state["clock_active"] = False
        state["status"] = status
        return state

    def _normalise_goal_event(self, event, match=None, clock_seconds=None):
        """Return a permanent, display-ready goal event.

        Every stored goal event keeps the real scorer name, team, exact timer
        value and football-style display minute. This is what gets exported to
        GitHub and then reused by Live, Results and finished-match cards.
        """
        if not isinstance(event, dict):
            return None

        event = dict(event)
        raw_type = str(event.get("rawType") or event.get("type") or event.get("eventType") or "").lower()
        detail_text = str(event.get("detail") or event.get("comments") or event.get("reason") or "").lower()

        # Only permanent goalEvents may enter the goal store. The full API
        # timeline can contain cards, substitutions and VAR checks; those must
        # stay in events/cardEvents/substitutionEvents and never be converted
        # into fake goals/scorers.
        is_card = "card" in raw_type or "yellow" in detail_text or "red card" in detail_text
        is_sub = "subst" in raw_type or "substitution" in raw_type or "substitution" in detail_text
        is_var = "var" in raw_type or "video assistant" in detail_text or "video review" in detail_text
        is_goal = "goal" in raw_type or "goal" in detail_text or event.get("isGoal") is True
        if not is_goal or is_card or is_sub or is_var:
            return None

        player = event.get("player") or event.get("playerName") or event.get("name")
        team = event.get("team") or event.get("teamName") or event.get("country")

        # Do not create permanent match events without a real scorer name.
        # This prevents old/bad fallback entries like "Goal 90'" replacing
        # proper API-Football scorer names.
        if not player or str(player).strip().lower() == "goal":
            return None

        try:
            minute = int(event.get("minute")) if event.get("minute") not in (None, "") else None
        except (TypeError, ValueError):
            minute = None

        try:
            extra = int(event.get("extra")) if event.get("extra") not in (None, "") else None
        except (TypeError, ValueError):
            extra = None

        timer_seconds = event.get("timerSeconds")
        try:
            timer_seconds = int(timer_seconds) if timer_seconds not in (None, "") else None
        except (TypeError, ValueError):
            timer_seconds = None

        # Prefer exact event minute from API-Football. If an event arrives
        # without a minute, attach the current fallback clock at the time we
        # see it so the scorer is permanently timestamped.
        if timer_seconds is None:
            if minute is not None:
                timer_seconds = (minute + (extra or 0)) * 60
            elif clock_seconds is not None:
                try:
                    timer_seconds = int(clock_seconds)
                except (TypeError, ValueError):
                    timer_seconds = None

        if timer_seconds is None:
            timer_seconds = 0

        if minute is None:
            minute = max(int(timer_seconds) // 60, 0)

        if event.get("displayMinute"):
            display_minute = str(event.get("displayMinute"))
        elif extra and extra > 0:
            display_minute = f"{minute}+{extra}'"
        else:
            display_minute = f"{minute}'"

        event.update({
            "type": "Goal",
            "team": team,
            "player": player,
            "minute": minute,
            "extra": extra,
            "timer": event.get("timer") or self._format_timer_value(timer_seconds),
            "timerSeconds": int(timer_seconds),
            "displayMinute": display_minute,
            "source": event.get("source") or "api_football",
        })

        if match is not None:
            event["matchId"] = match.get("id")
            event["matchUtcDate"] = match.get("utcDate")
            event["homeTeam"] = _team_name(match.get("homeTeam", {}))
            event["awayTeam"] = _team_name(match.get("awayTeam", {}))

        return event

    def _event_signature(self, event):
        return "|".join([
            str(event.get("matchId") or ""),
            str(event.get("team") or "").lower().strip(),
            str(event.get("player") or "").lower().strip(),
            str(event.get("displayMinute") or event.get("minute") or event.get("timer") or ""),
            str(event.get("detail") or "").lower().strip(),
        ])

    def _event_base_signature(self, event):
        return "|".join([
            str(event.get("matchId") or ""),
            str(event.get("team") or "").lower().strip(),
            str(event.get("player") or "").lower().strip(),
            str(event.get("displayMinute") or event.get("minute") or event.get("timer") or ""),
        ])

    def _goal_detail_score(self, event):
        text = " ".join(
            str(event.get(key) or "").lower()
            for key in ("detail", "comments", "reason", "subType", "type", "rawType")
        )
        score = 0
        if text and text.strip() not in {"goal", "normal goal"}:
            score += 1
        for marker in ("header", "headed", "left foot", "right foot", "free kick", "freekick", "penalty", "own goal"):
            if marker in text:
                score += 3
        if event.get("assist"):
            score += 1
        return score

    def _merge_goal_events(self, existing, incoming, match=None, clock_seconds=None):
        merged = []
        seen = set()
        by_base_signature = {}

        for raw_event in list(existing or []) + list(incoming or []):
            event = self._normalise_goal_event(raw_event, match=match, clock_seconds=clock_seconds)
            if not event:
                continue

            base_sig = self._event_base_signature(event)
            existing_index = by_base_signature.get(base_sig)
            if existing_index is not None:
                existing_event = merged[existing_index]
                if self._goal_detail_score(event) > self._goal_detail_score(existing_event):
                    old_sig = self._event_signature(existing_event)
                    if old_sig in seen:
                        seen.remove(old_sig)
                    merged[existing_index] = event
                    seen.add(self._event_signature(event))
                continue

            sig = self._event_signature(event)
            if sig in seen:
                continue

            merged.append(event)
            by_base_signature[base_sig] = len(merged) - 1
            seen.add(sig)

        merged.sort(key=lambda event: int(event.get("timerSeconds") or 0))

        for index, event in enumerate(merged, start=1):
            event["goalNumber"] = index

        return merged

    def _is_generic_fallback_event(self, event):
        """True for old locally guessed events that have no real scorer name."""
        return (
            isinstance(event, dict)
            and (
                event.get("source") == "fallback_timer"
                or str(event.get("player") or "").lower() == "goal"
            )
        )

    async def _merge_persistent_goal_events_to_matches(self, matches):
        """Detect score changes, timestamp goals, and keep real events on finished matches.

        Important behaviour:
        - API-Football goal events with real player names always win.
        - Generic fallback "Goal 90'" events are removed once real events are available.
        - Fallback goal events are only created while the match is live and the
          fallback clock is active. This prevents completed games being backfilled
          as generic 90' goals on first load.
        """
        now = datetime.now(timezone.utc)
        changed = False

        for match in matches:
            key = self._match_store_key(match)
            if not key:
                continue

            state = self._goal_event_store.setdefault(key, {"goalEvents": []})
            state_before = json.dumps(state, sort_keys=True, default=str)
            self._update_match_clock_state(match, state, now)

            existing_events = state.get("goalEvents") or []
            # Prefer explicit goalEvents. If only a full timeline is present,
            # filter it through _normalise_goal_event so cards/subs/VAR cannot
            # be persisted as scorers.
            api_events_source = match.get("goalEvents") or match.get("events") or []
            api_events = [
                event for event in api_events_source
                if isinstance(event, dict) and self._normalise_goal_event(event, match=match, clock_seconds=state.get("clock_seconds"))
            ]

            # If real API/football-data events exist, they are the source of truth.
            # Do not merge old persisted scorer times, because an old saved 24'
            # must not override/copy alongside a corrected API 17'.
            if api_events:
                merged_events = self._merge_goal_events([], api_events, match=match, clock_seconds=state.get("clock_seconds"))
            else:
                merged_events = self._merge_goal_events(existing_events, [], match=match, clock_seconds=state.get("clock_seconds"))

            home_score, away_score = _full_time_score(match)
            home_score = home_score if home_score is not None else 0
            away_score = away_score if away_score is not None else 0
            clock_seconds = int(state.get("clock_seconds") or 0)

            # Do not create generic "Goal 90'" fallback events. Goal events
            # are only stored when a real scorer name is available from the
            # live event feed, then they are kept permanently for Results.

            if merged_events != (state.get("goalEvents") or []):
                state["goalEvents"] = merged_events
                changed = True

            state["homeScore"] = home_score
            state["awayScore"] = away_score
            state["utcDate"] = match.get("utcDate")
            state["homeTeam"] = _team_name(match.get("homeTeam", {}))
            state["awayTeam"] = _team_name(match.get("awayTeam", {}))

            if merged_events:
                # Permanent event data exported to matches.json and reused by
                # Live, Results and finished-match cards.
                match["goalEvents"] = merged_events
                if not match.get("events"):
                    match["events"] = merged_events

            if match.get("events"):
                state["events"] = match.get("events")
            elif state.get("events"):
                match["events"] = state.get("events")

            if match.get("cardEvents"):
                state["cardEvents"] = match.get("cardEvents")
            elif state.get("cardEvents"):
                match["cardEvents"] = state.get("cardEvents")

            if match.get("substitutionEvents"):
                state["substitutionEvents"] = match.get("substitutionEvents")
            elif state.get("substitutionEvents"):
                match["substitutionEvents"] = state.get("substitutionEvents")

            if match.get("referees"):
                state["referees"] = match.get("referees")
            elif state.get("referees"):
                match["referees"] = state.get("referees")

            if match.get("apiFootballFixtureId"):
                state["apiFootballFixtureId"] = match.get("apiFootballFixtureId")
            elif state.get("apiFootballFixtureId"):
                match["apiFootballFixtureId"] = state.get("apiFootballFixtureId")

            # Export the API-synchronised match clock into matches.json/GitHub.
            # The clock is deliberately NOT active/incrementing locally; this HA
            # instance is the master and every client displays the last API minute.
            clock_seconds = int(state.get("clock_seconds") or 0)
            source = state.get("source") or "awaiting_api_football_minute"
            has_api_minute = source in {"api_football_live_minute", "football_data_live_minute", "api_football_minute", "football_data_minute"}
            display_minute = state.get("displayMinute") or self._normalise_goal_minute(clock_seconds)
            clock_text = display_minute if has_api_minute else self._format_timer_value(clock_seconds)
            manual_clock = {
                "seconds": clock_seconds,
                "timer": clock_text,
                "displayMinute": display_minute,
                "active": False,
                "status": match.get("status"),
                "source": source,
                "lastApiSync": state.get("lastApiSync"),
            }

            if match.get("status") in LIVE_STATUSES:
                match["manualClock"] = manual_clock
                match["clockSource"] = source
                match["lastApiSync"] = state.get("lastApiSync")
                if has_api_minute and clock_seconds > 0:
                    match.pop("awaitingLiveApiData", None)
                    match["fallbackClock"] = clock_seconds
                    match["fallbackClockText"] = clock_text
                    match["manualClockText"] = clock_text
                    match["displayMinute"] = display_minute
                    match["clockSeconds"] = clock_seconds
                else:
                    match["awaitingLiveApiData"] = True
                    match["manualClockText"] = "Awaiting kickoff API data"
                    match["displayMinute"] = "Awaiting kickoff API data"

            # Persist score/status/clock snapshots and permanent events so
            # the backend can keep goal data after a match moves from Live to
            # Results, and so GitHub receives the same live timer/event data.
            if state_before != json.dumps(state, sort_keys=True, default=str):
                changed = True

        if changed:
            await self._async_save_goal_event_store()

        return matches


    def _read_github_settings_sync(self):
        """Read GitHub sync settings from /config/secrets.yaml off the event loop.

        Expected entries:
        github_token: "your GitHub token"
        github_repo: "Adya84/ha-world-cup-2026"
        github_branch: "main"   # optional
        """
        secrets_file = Path("/config/secrets.yaml")
        settings = {
            "github_token": None,
            "github_repo": "Adya84/ha-world-cup-2026",
            "github_branch": "main",
            "api_football_key": None,
            "world_cup_2026_main_provider": None,
            "world_cup_main_provider": None,
            "main_provider": None,
            "live_data_provider": None,
        }

        if not secrets_file.exists():
            return settings

        try:
            content = secrets_file.read_text(encoding="utf-8")
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("Could not read secrets.yaml for GitHub sync: %s", err)
            return settings

        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#") or ":" not in line:
                continue

            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            if key in settings:
                settings[key] = value

        return settings

    def _build_public_results_feed(self, matches):
        """Build the public Results feed from the full API fixture list.

        Live data is still exported separately for Live Now. Finished matches are
        taken from the API fixture/results data so a game can leave Live Now
        without disappearing from the public Results page/GitHub feed.
        """
        seen = set()
        results = []

        for match in matches or []:
            if not _is_finished(match):
                continue

            match_id = (
                match.get("id")
                or match.get("matchId")
                or match.get("apiFootballFixtureId")
                or f"{_team_name(match.get('homeTeam', {}))}-{_team_name(match.get('awayTeam', {}))}-{match.get('utcDate') or match.get('date') or ''}"
            )

            if match_id in seen:
                continue

            seen.add(match_id)
            public_match = dict(match)
            public_match["matchDetails"] = {
                "events": public_match.get("events") or [],
                "goalEvents": public_match.get("goalEvents") or [],
                "cardEvents": public_match.get("cardEvents") or [],
                "substitutionEvents": public_match.get("substitutionEvents") or [],
                "referees": public_match.get("referees") or [],
                "officials": public_match.get("officials") or public_match.get("referees") or [],
                "apiFootballFixtureId": public_match.get("apiFootballFixtureId"),
                "goalEventsSource": public_match.get("goalEventsSource"),
                "liveStatistics": public_match.get("liveStatistics") or {},
                "homeCorners": public_match.get("homeCorners"),
                "awayCorners": public_match.get("awayCorners"),
                "homeShotsOnGoal": public_match.get("homeShotsOnGoal"),
                "awayShotsOnGoal": public_match.get("awayShotsOnGoal"),
                "homePossession": public_match.get("homePossession"),
                "awayPossession": public_match.get("awayPossession"),
                "homeFouls": public_match.get("homeFouls"),
                "awayFouls": public_match.get("awayFouls"),
                "homeOffsides": public_match.get("homeOffsides"),
                "awayOffsides": public_match.get("awayOffsides"),
                "lineups": public_match.get("lineups") or public_match.get("lineupsData") or public_match.get("teamLineups") or [],
                "lineupsData": public_match.get("lineupsData") or public_match.get("lineups") or public_match.get("teamLineups") or [],
                "weather": public_match.get("matchWeather") or public_match.get("weather") or {},
            }
            results.append(public_match)

        results.sort(key=lambda match: match.get("utcDate") or match.get("date") or "")
        return results

    async def _export_public_json(self, matches, standings, scorers):
        """Export public JSON files to /config/www/worldcup and GitHub.

        Important split:
        - matches/live feeds keep current live fixtures for the Live page.
        - results feeds use the finished-match API fixture data for Results.
        """
        export_dir = Path("/config/www/worldcup")
        export_dir.mkdir(parents=True, exist_ok=True)

        live_matches = [match for match in matches if match.get("status") in LIVE_STATUSES]
        results = self._build_public_results_feed(matches)

        files = {
            # Root files for the existing public panel URLs.
            "matches.json": {"matches": matches},
            "world_cup_2026_live.json": {"matches": live_matches, "live": live_matches},
            "world_cup_2026_results.json": {"results": results, "matches": results},
            "standings.json": {"standings": standings},
            "scorers.json": {"scorers": scorers},
            "world_cup_2026_goal_events.json": self._goal_event_store,

            # Duplicate into the new GitHub /worldcup folder as well.
            "worldcup/matches.json": {"matches": matches},
            "worldcup/world_cup_2026_live.json": {"matches": live_matches, "live": live_matches},
            "worldcup/world_cup_2026_results.json": {"results": results, "matches": results},
            "worldcup/standings.json": {"standings": standings},
            "worldcup/scorers.json": {"scorers": scorers},
            "worldcup/world_cup_2026_goal_events.json": self._goal_event_store,
        }

        for filename, payload in files.items():
            path = export_dir / filename
            await asyncio.to_thread(path.parent.mkdir, parents=True, exist_ok=True)
            await asyncio.to_thread(
                path.write_text,
                json.dumps(payload, indent=2),
                encoding="utf-8",
            )

        _LOGGER.info(
            "World Cup public JSON built: %s live matches, %s finished results",
            len(live_matches),
            len(results),
        )

        return files

    async def _github_get_sha(self, session, repo, branch, filename, headers):
        """Return the existing GitHub file SHA if the file already exists."""
        url = f"https://api.github.com/repos/{repo}/contents/{filename}?ref={branch}"

        async with session.get(url, headers=headers) as response:
            if response.status == 404:
                return None

            if response.status >= 400:
                text = await response.text()
                raise UpdateFailed(
                    f"GitHub SHA lookup failed for {filename}: {response.status} {text}"
                )

            data = await response.json()
            return data.get("sha")

    async def _github_upload_file(self, session, repo, branch, filename, payload, headers):
        """Upload one JSON file to GitHub."""
        raw_content = json.dumps(payload, indent=2, sort_keys=True)
        payload_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()
        cache_key = f"{repo}:{branch}:{filename}"
        if self._github_payload_hashes.get(cache_key) == payload_hash:
            return False

        encoded_content = base64.b64encode(raw_content.encode("utf-8")).decode("utf-8")
        url = f"https://api.github.com/repos/{repo}/contents/{filename}"

        sha = await self._github_get_sha(session, repo, branch, filename, headers)

        body = {
            "message": f"Update {filename}",
            "content": encoded_content,
            "branch": branch,
        }

        if sha:
            body["sha"] = sha

        async with session.put(url, headers=headers, json=body) as response:
            if response.status not in (200, 201):
                text = await response.text()
                raise UpdateFailed(
                    f"GitHub upload failed for {filename}: {response.status} {text}"
                )
        self._github_payload_hashes[cache_key] = payload_hash
        return True

    async def _async_read_github_settings(self):
        """Read GitHub/API keys without blocking Home Assistant."""
        return await self.hass.async_add_executor_job(self._read_github_settings_sync)

    async def _sync_public_json_to_github(self, files):
        """Sync exported JSON files to the configured GitHub repository.

        Only the main/provider install should publish the shared feed.
        """
        if not await self._is_main_live_provider():
            _LOGGER.debug("GitHub sync skipped: this install is not marked as the main provider")
            return

        settings = await self._async_read_github_settings()
        token = settings.get("github_token")
        repo = settings.get("github_repo") or "Adya84/ha-world-cup-2026"
        branch = settings.get("github_branch") or "main"

        if not token:
            _LOGGER.debug("GitHub sync skipped: github_token not set in secrets.yaml")
            return

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

        live_first = [
            "world_cup_2026_live.json",
            "worldcup/world_cup_2026_live.json",
            "world_cup_2026_goal_events.json",
            "worldcup/world_cup_2026_goal_events.json",
            "matches.json",
            "worldcup/matches.json",
        ]
        ordered_filenames = [
            *[filename for filename in live_first if filename in files],
            *[filename for filename in files if filename not in live_first],
        ]

        timeout = aiohttp.ClientTimeout(total=30)
        uploaded_count = 0

        async with aiohttp.ClientSession(timeout=timeout) as session:
            for filename in ordered_filenames:
                uploaded = await self._github_upload_file(
                    session,
                    repo,
                    branch,
                    filename,
                    files[filename],
                    headers,
                )
                if uploaded:
                    uploaded_count += 1

        _LOGGER.info("World Cup public JSON synced to GitHub repo %s (%s files changed)", repo, uploaded_count)


    def _add_football_data_live_fields_to_matches(self, matches):
        """Promote football-data.org live minute and goal events onto matches.

        football-data.org is the main paid feed for this integration. When it
        supplies live minute/goals, those fields must win over API-Football,
        GitHub exports and browser localStorage.
        """
        for match in matches:
            minute = _extract_match_minute(match)
            if minute is not None:
                match["minute"] = minute
                match["clockSeconds"] = minute * 60
                match["displayMinute"] = f"{minute}'"
                if match.get("status") in LIVE_STATUSES:
                    match["manualClock"] = {
                        "seconds": minute * 60,
                        "timer": self._format_timer_value(minute * 60),
                        "displayMinute": f"{minute}'",
                        "active": True,
                        "status": match.get("status"),
                        "source": "football_data_minute",
                    }

            goal_events = _extract_football_data_goal_events(match)
            if goal_events:
                match["goalEvents"] = goal_events
                match["events"] = goal_events
                match["goalEventsSource"] = "football_data"

        return matches

    async def _api_football_enabled(self):
        settings = await self._async_read_github_settings()
        return settings.get("api_football_key")

    def _scorer_player_name(self, scorer):
        player = scorer.get("player", {}) if isinstance(scorer, dict) else {}
        if isinstance(player, dict):
            return player.get("name") or player.get("firstName") or scorer.get("name")
        return player or scorer.get("name") if isinstance(scorer, dict) else None

    def _scorer_team_name(self, scorer):
        team = scorer.get("team", {}) if isinstance(scorer, dict) else {}
        if isinstance(team, dict):
            return team.get("shortName") or team.get("name") or team.get("tla") or scorer.get("teamName")
        return team or scorer.get("teamName") or scorer.get("nationality") if isinstance(scorer, dict) else None

    def _api_football_player_result_matches_team(self, item, team_name):
        if not team_name:
            return True
        for stat in item.get("statistics") or []:
            stat_team = (stat.get("team") or {}).get("name")
            if stat_team and _team_names_match(stat_team, team_name):
                return True
        return False

    def _api_football_player_searches(self, player_name):
        """Return API-Football player-photo searches, starting with World Cup then major club leagues."""
        seasons = [2025, 2024, 2026]
        major_leagues = [
            39,   # Premier League
            140,  # La Liga
            135,  # Serie A
            78,   # Bundesliga
            61,   # Ligue 1
            253,  # MLS
            262,  # Liga MX
            307,  # Saudi Pro League
            88,   # Eredivisie
            94,   # Primeira Liga
            203,  # Turkish Super Lig
            2,    # UEFA Champions League
            3,    # UEFA Europa League
        ]

        searches = [{"endpoint": "players/profiles", "params": {"search": player_name}}]
        searches.append({"endpoint": "players", "params": {"search": player_name, "league": 1, "season": 2026}})
        for season in seasons:
            for league in major_leagues:
                searches.append({"endpoint": "players", "params": {"search": player_name, "league": league, "season": season}})
        searches.append({"endpoint": "players", "params": {"search": player_name}})
        return searches

    def _normalise_person_name(self, value):
        return " ".join(
            "".join(
                ch if ch.isalnum() else " "
                for ch in str(value or "").lower()
            ).split()
        )

    def _api_football_player_name_score(self, api_name, wanted_name):
        api_norm = self._normalise_person_name(api_name)
        wanted_norm = self._normalise_person_name(wanted_name)
        if not api_norm or not wanted_norm:
            return 0
        if api_norm == wanted_norm:
            return 100

        api_parts = api_norm.split()
        wanted_parts = wanted_norm.split()
        api_set = set(api_parts)
        wanted_set = set(wanted_parts)
        if wanted_set and wanted_set.issubset(api_set):
            return 75
        if api_set and api_set.issubset(wanted_set):
            return 65

        api_last = api_parts[-1] if api_parts else ""
        wanted_last = wanted_parts[-1] if wanted_parts else ""
        api_first = api_parts[0] if api_parts else ""
        wanted_first = wanted_parts[0] if wanted_parts else ""
        if api_last and api_last == wanted_last:
            if api_first and wanted_first and api_first[0] == wanted_first[0]:
                return 80
            return 55
        return 0

    def _api_football_player_match_score(self, item, player_name, team_name):
        player = item.get("player") or {}
        score = self._api_football_player_name_score(player.get("name"), player_name)
        if not score:
            return 0

        nationality = player.get("nationality")
        if nationality and team_name and _team_names_match(nationality, team_name):
            score += 30
        if self._api_football_player_result_matches_team(item, team_name):
            score += 20
        if player.get("photo"):
            score += 10
        return score

    async def _fetch_api_football_player_photo(self, session, headers, player_name, team_name):
        """Find the correct API-Football player photo by player name and team."""
        player_name = str(player_name or "").strip()
        team_name = str(team_name or "").strip()
        if not player_name or player_name.lower() == "unknown":
            return {}

        cache_key = f"{_normalise_team_name(team_name)}|{player_name.lower()}"
        if cache_key in self._api_football_player_photo_cache:
            return self._api_football_player_photo_cache.get(cache_key) or {}

        if self._api_football_is_rate_limited():
            return {}

        matched = None
        best_score = 0
        matched_with_photo = None
        best_photo_score = 0

        for search in self._api_football_player_searches(player_name):
            endpoint = search.get("endpoint") or "players"
            params = search.get("params") or {}
            url = f"https://v3.football.api-sports.io/{endpoint}"
            try:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status == 429:
                        await response.text()
                        self._mark_api_football_rate_limited("API-Football player photo lookup")
                        return {}
                    if response.status >= 400:
                        text = await response.text()
                        _LOGGER.warning("API-Football player photo lookup failed for %s: %s %s", player_name, response.status, text)
                        continue
                    payload = await response.json()
            except Exception as err:  # pylint: disable=broad-exception-caught
                _LOGGER.warning("API-Football player photo lookup failed for %s: %s", player_name, err)
                continue

            for item in payload.get("response", []) or []:
                if endpoint == "players/profiles":
                    item = {"player": item.get("player") or item}
                score = self._api_football_player_match_score(item, player_name, team_name)
                if score > best_score:
                    matched = item
                    best_score = score
                if ((item.get("player") or {}).get("photo")) and score > best_photo_score:
                    matched_with_photo = item
                    best_photo_score = score
            if matched_with_photo and best_photo_score >= 80:
                break

        if matched_with_photo:
            matched = matched_with_photo
            best_score = best_photo_score

        if best_score < 80:
            matched = None

        player = (matched or {}).get("player") or {}
        player_id = player.get("id")
        photo_url = player.get("photo") or (f"https://media.api-sports.io/football/players/{player_id}.png" if player_id else None)
        if photo_url:
            result = {
                "apiFootballPlayerId": player_id,
                "photo": photo_url,
                "image": photo_url,
                "photoLookup": "matched_with_photo" if player.get("photo") else "matched_with_api_id_photo",
                "photoScore": best_score,
                "photoMatchedName": player.get("name"),
                "photoMatchedId": player_id,
            }
        else:
            result = {
                "photoLookup": "matched_no_photo" if matched else "no_match",
                "photoScore": best_score,
                "photoMatchedName": player.get("name"),
                "photoMatchedId": player_id,
            }

        self._api_football_player_photo_cache[cache_key] = result
        return result

    async def _add_api_football_photos_to_scorers(self, scorers, limit=12):
        """Attach real API-Football player photos to scorer rows when available."""
        if not scorers:
            return scorers
        api_key = await self._api_football_enabled()
        if not api_key:
            return scorers

        enriched = [dict(scorer) for scorer in scorers]
        headers = {"x-apisports-key": api_key}
        timeout = aiohttp.ClientTimeout(total=30)

        async with aiohttp.ClientSession(timeout=timeout) as session:
            for scorer in enriched[:limit]:
                player_name = self._scorer_player_name(scorer)
                team_name = self._scorer_team_name(scorer)
                photo_data = await self._fetch_api_football_player_photo(session, headers, player_name, team_name)
                if not photo_data:
                    continue
                scorer.update(photo_data)
                player = scorer.get("player")
                if isinstance(player, dict):
                    player.update(photo_data)

        return enriched

    def _normalise_api_football_event(self, event):
        """Convert one API-Football timeline event into a panel-friendly object."""
        if not isinstance(event, dict):
            return None

        event_type_raw = str(event.get("type") or "").strip()
        event_type = event_type_raw.lower()
        detail = event.get("detail")
        detail_lower = str(detail or "").lower()
        is_disallowed = _is_disallowed_goal_event({
            "type": event_type_raw,
            "detail": detail,
            "comments": event.get("comments"),
        })

        time_data = event.get("time") or {}
        team_data = event.get("team") or {}
        player_data = event.get("player") or {}
        assist_data = event.get("assist") or {}

        player_name = player_data.get("name") if isinstance(player_data, dict) else None
        team_name = team_data.get("name") if isinstance(team_data, dict) else None
        assist_name = assist_data.get("name") if isinstance(assist_data, dict) else None

        minute = time_data.get("elapsed") if isinstance(time_data, dict) else None
        extra = time_data.get("extra") if isinstance(time_data, dict) else None

        try:
            minute = int(minute) if minute is not None else None
        except (TypeError, ValueError):
            minute = None

        try:
            extra = int(extra) if extra is not None else None
        except (TypeError, ValueError):
            extra = None

        if not team_name and not player_name:
            return None

        if extra and extra > 0 and minute is not None:
            display_minute = f"{minute}+{extra}'"
            timer_seconds = (minute + extra) * 60
        elif minute is not None:
            display_minute = f"{minute}'"
            timer_seconds = minute * 60
        else:
            display_minute = None
            timer_seconds = None

        # Keep API-Football detail names but make common goal/card cases explicit.
        panel_type = event_type_raw or "Event"
        if is_disallowed:
            panel_type = "Disallowed Goal"
        elif event_type == "goal":
            panel_type = "Own Goal" if "own" in detail_lower else "Penalty" if "penalty" in detail_lower else "Goal"
        elif event_type == "card":
            panel_type = "Red Card" if "red" in detail_lower else "Yellow Card" if "yellow" in detail_lower else "Card"
        elif event_type in {"subst", "substitution"}:
            panel_type = "Substitution"
        elif event_type == "var":
            panel_type = "VAR"

        substitution_on = assist_name if event_type in {"subst", "substitution"} else None
        substitution_off = player_name if event_type in {"subst", "substitution"} else None

        return {
            "type": panel_type,
            "rawType": event_type_raw,
            "team": team_name,
            "player": player_name,
            "playerOn": substitution_on,
            "playerOff": substitution_off,
            "minute": minute,
            "extra": extra,
            "displayMinute": display_minute,
            "timer": f"{timer_seconds // 60}:{timer_seconds % 60:02d}" if timer_seconds is not None else None,
            "timerSeconds": timer_seconds,
            "detail": detail,
            "comments": event.get("comments"),
            "assist": assist_name,
            "isDisallowed": is_disallowed,
            "source": "api_football",
        }

    def _normalise_match_officials(self, *sources):
        """Merge referee/official lists without losing assistant or VAR roles."""
        officials = []
        seen = set()

        def add_official(ref, default_type="REFEREE"):
            if not ref:
                return
            if isinstance(ref, str):
                name = ref.strip()
                role = default_type
                nationality = ""
            elif isinstance(ref, dict):
                name = (
                    ref.get("name")
                    or ref.get("referee")
                    or ref.get("fullName")
                    or ref.get("displayName")
                )
                role = ref.get("type") or ref.get("role") or ref.get("position") or default_type
                nationality = ref.get("nationality") or ref.get("country") or ""
            else:
                return

            if not name:
                return
            key = f"{str(name).lower().strip()}|{str(role).lower().strip()}"
            if key in seen:
                return
            seen.add(key)
            item = {"name": name, "type": role}
            if nationality:
                item["nationality"] = nationality
            officials.append(item)

        for source in sources:
            if isinstance(source, list):
                for ref in source:
                    add_official(ref)
            else:
                add_official(source)

        return officials

    def _normalise_api_football_goal_event(self, event):
        """Return only goal-type events for the scorer display."""
        normalised = self._normalise_api_football_event(event)
        if not normalised:
            return None
        if not _is_real_goal_event(normalised):
            return None
        if not normalised.get("player") or not normalised.get("team"):
            return None
        return normalised

    def _normalise_api_football_card_event(self, event):
        """Return only yellow/red card events."""
        normalised = self._normalise_api_football_event(event)
        if not normalised:
            return None
        if normalised.get("rawType", "").lower() != "card" and normalised.get("type") not in {"Yellow Card", "Red Card", "Card"}:
            return None
        return normalised

    def _normalise_api_football_substitution_event(self, event):
        """Return only substitution events."""
        normalised = self._normalise_api_football_event(event)
        if not normalised:
            return None
        raw_type = str(normalised.get("rawType", "")).lower()
        event_type = str(normalised.get("type", "")).lower()
        detail = str(normalised.get("detail", "")).lower()
        if raw_type not in {"subst", "substitution"} and "substitution" not in event_type and "substitution" not in detail:
            return None
        return normalised

    async def _fetch_api_football_events_for_fixture(self, session, fixture_id, headers):
        """Fetch timeline events for one API-Football fixture."""
        if not fixture_id:
            return {"events": [], "goalEvents": [], "cardEvents": []}
        if self._api_football_is_rate_limited():
            return {"events": [], "goalEvents": [], "cardEvents": [], "substitutionEvents": []}

        url = f"https://v3.football.api-sports.io/fixtures/events?fixture={fixture_id}"
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 429:
                    await response.text()
                    self._mark_api_football_rate_limited("API-Football fixture events lookup")
                    return {"events": [], "goalEvents": [], "cardEvents": [], "substitutionEvents": []}
                if response.status >= 400:
                    text = await response.text()
                    _LOGGER.warning(
                        "API-Football fixture events lookup failed for %s: %s %s",
                        fixture_id,
                        response.status,
                        text,
                    )
                    return {"events": [], "goalEvents": [], "cardEvents": [], "substitutionEvents": []}
                payload = await response.json()
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("API-Football fixture events lookup failed for %s: %s", fixture_id, err)
            return {"events": [], "goalEvents": [], "cardEvents": []}

        raw_events = payload.get("response", []) or []
        all_events = [event for event in (self._normalise_api_football_event(item) for item in raw_events) if event]
        goal_events = [
            event
            for event in all_events
            if _is_real_goal_event(event) and not _has_matching_disallowed_event(event, all_events)
        ]
        card_events = [event for event in all_events if event.get("rawType", "").lower() == "card" or event.get("type") in {"Yellow Card", "Red Card", "Card"}]
        substitution_events = [event for event in all_events if event.get("rawType", "").lower() in {"subst", "substitution"} or str(event.get("type", "")).lower() == "substitution" or "substitution" in str(event.get("detail", "")).lower()]

        all_events.sort(key=lambda event: int(event.get("timerSeconds") or 0))
        goal_events.sort(key=lambda event: int(event.get("timerSeconds") or 0))
        card_events.sort(key=lambda event: int(event.get("timerSeconds") or 0))
        substitution_events.sort(key=lambda event: int(event.get("timerSeconds") or 0))

        return {
            "events": all_events,
            "goalEvents": goal_events,
            "cardEvents": card_events,
            "substitutionEvents": substitution_events,
        }

    def _normalise_api_football_stat_name(self, value):
        """Make API-Football stat names easier to match across wording changes."""
        return "".join(ch for ch in str(value or "").lower() if ch.isalnum())

    def _stat_value_from_api_football(self, statistics, wanted_type, *aliases):
        """Read one statistic value from an API-Football statistics list."""
        wanted_names = {
            self._normalise_api_football_stat_name(name)
            for name in (wanted_type, *aliases)
            if name
        }
        for item in statistics or []:
            if self._normalise_api_football_stat_name(item.get("type")) in wanted_names:
                return item.get("value")
        return None

    def _build_api_football_live_statistics(self, sides, home_name=None, away_name=None):
        """Build live statistics from an API-Football statistics payload."""
        if not sides:
            return {}

        def build_side_stats(raw_stats):
            return {
                "corners": self._stat_value_from_api_football(raw_stats, "Corner Kicks", "Corners", "Corner kicks"),
                "shotsOnGoal": self._stat_value_from_api_football(raw_stats, "Shots on Goal", "Shots on Target"),
                "shotsOffGoal": self._stat_value_from_api_football(raw_stats, "Shots off Goal", "Shots off Target"),
                "totalShots": self._stat_value_from_api_football(raw_stats, "Total Shots"),
                "possession": self._stat_value_from_api_football(raw_stats, "Ball Possession"),
                "fouls": self._stat_value_from_api_football(raw_stats, "Fouls"),
                "offsides": self._stat_value_from_api_football(raw_stats, "Offsides"),
                "yellowCards": self._stat_value_from_api_football(raw_stats, "Yellow Cards"),
                "redCards": self._stat_value_from_api_football(raw_stats, "Red Cards"),
            }

        result = {"home": {}, "away": {}}
        for index, side in enumerate(sides):
            team_name = ((side.get("team") or {}).get("name") or "")
            key = "home" if index == 0 else "away"
            if home_name and _team_names_match(team_name, home_name):
                key = "home"
            elif away_name and _team_names_match(team_name, away_name):
                key = "away"
            result[key] = build_side_stats(side.get("statistics") or [])

        has_values = any(
            value is not None
            for team_stats in result.values()
            for value in team_stats.values()
        )
        return result if has_values else {}

    async def _fetch_api_football_statistics_for_fixture(self, session, fixture_id, headers, home_name=None, away_name=None):
        """Fetch live statistics such as corners and shots for one fixture."""
        if not fixture_id:
            return {}
        if self._api_football_live_is_rate_limited():
            return self._live_statistics_cache_by_fixture.get(str(fixture_id), {})

        url = f"https://v3.football.api-sports.io/fixtures/statistics?fixture={fixture_id}"
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 429:
                    await response.text()
                    self._mark_api_football_live_rate_limited("API-Football fixture statistics lookup")
                    return self._live_statistics_cache_by_fixture.get(str(fixture_id), {})
                if response.status >= 400:
                    text = await response.text()
                    _LOGGER.warning(
                        "API-Football fixture statistics lookup failed for %s: %s %s",
                        fixture_id,
                        response.status,
                        text,
                    )
                    return self._live_statistics_cache_by_fixture.get(str(fixture_id), {})
                payload = await response.json()
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("API-Football fixture statistics lookup failed for %s: %s", fixture_id, err)
            return self._live_statistics_cache_by_fixture.get(str(fixture_id), {})

        sides = payload.get("response", []) or []
        if not sides:
            return self._live_statistics_cache_by_fixture.get(str(fixture_id), {})

        result = self._build_api_football_live_statistics(sides, home_name, away_name)
        if not result:
            return self._live_statistics_cache_by_fixture.get(str(fixture_id), {})

        self._live_statistics_cache_by_fixture[str(fixture_id)] = result
        return result

    async def _fetch_live_data_from_api_football(self):
        """Fetch live elapsed minutes and goal events from API-Football only.

        Uses /fixtures?live=all and extracts fixture.status.elapsed.
        Goal events are read from the live payload when available, otherwise
        /fixtures/events is queried for each live fixture. Results are cached
        briefly so live score/scorer/card data updates on every 10-second live poll.
        """
        api_key = await self._api_football_enabled()
        if not api_key:
            return {}

        now = datetime.now(timezone.utc)
        if self._api_football_live_is_rate_limited():
            return self._live_api_football_cache
        if (
            self._live_api_football_last_fetch
            and now - self._live_api_football_last_fetch < timedelta(seconds=8)
        ):
            return self._live_api_football_cache

        url = "https://v3.football.api-sports.io/fixtures?live=all"
        headers = {"x-apisports-key": api_key}
        timeout = aiohttp.ClientTimeout(total=30)
        live_data = {}

        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 429:
                        await response.text()
                        self._mark_api_football_live_rate_limited("API-Football live lookup")
                        return self._live_api_football_cache
                    if response.status >= 400:
                        text = await response.text()
                        _LOGGER.warning(
                            "API-Football live lookup failed: %s %s",
                            response.status,
                            text,
                        )
                        return self._live_api_football_cache

                    payload = await response.json()

                live_items = payload.get("response", []) or []
                if not live_items:
                    _LOGGER.debug("API-Football live lookup returned no live fixtures")
                for item in live_items:
                    fixture = item.get("fixture") or {}
                    fixture_id = fixture.get("id")
                    fixture_venue = fixture.get("venue") or {}
                    status = fixture.get("status") or {}
                    elapsed = status.get("elapsed")

                    teams = item.get("teams") or {}
                    home = (teams.get("home") or {}).get("name")
                    away = (teams.get("away") or {}).get("name")

                    if not home or not away:
                        continue

                    try:
                        elapsed = int(elapsed) if elapsed is not None else None
                    except (TypeError, ValueError):
                        elapsed = None

                    inline_events = [
                        event
                        for event in (
                            self._normalise_api_football_event(event)
                            for event in (item.get("events", []) or [])
                        )
                        if event
                    ]
                    goal_events = [
                        event
                        for event in inline_events
                        if _is_real_goal_event(event) and not _has_matching_disallowed_event(event, inline_events)
                    ]
                    card_events = [event for event in inline_events if event.get("rawType", "").lower() == "card" or event.get("type") in {"Yellow Card", "Red Card", "Card"}]
                    substitution_events = [event for event in inline_events if event.get("rawType", "").lower() in {"subst", "substitution"} or str(event.get("type", "")).lower() == "substitution" or "substitution" in str(event.get("detail", "")).lower()]

                    expected_goals = _expected_goal_count_from_api_football_item(item)
                    should_fetch_fixture_events = bool(fixture_id) and (
                        not inline_events
                        or not goal_events
                        or (
                            expected_goals is not None
                            and expected_goals > 0
                            and _count_goal_events(goal_events) < expected_goals
                        )
                    )
                    if should_fetch_fixture_events and not self._api_football_is_rate_limited():
                        last_event_fetch = self._live_events_last_fetch_by_fixture.get(str(fixture_id))
                        # Keep live events on the same rhythm as the match clock so
                        # goals/cards/subs/VAR are not minutes behind the live feed.
                        if last_event_fetch and now - last_event_fetch < timedelta(seconds=10):
                            should_fetch_fixture_events = False

                    if should_fetch_fixture_events and not self._api_football_is_rate_limited():
                        self._live_events_last_fetch_by_fixture[str(fixture_id)] = now
                        fixture_event_data = await self._fetch_api_football_events_for_fixture(
                            session,
                            fixture_id,
                            headers,
                        )
                        fixture_goal_events = fixture_event_data.get("goalEvents", [])
                        if fixture_event_data.get("events") and _count_goal_events(fixture_goal_events) >= _count_goal_events(goal_events):
                            inline_events = fixture_event_data.get("events", [])
                            goal_events = fixture_goal_events
                            card_events = fixture_event_data.get("cardEvents", [])
                            substitution_events = fixture_event_data.get("substitutionEvents", [])

                    live_statistics = self._build_api_football_live_statistics(
                        item.get("statistics") or [],
                        home,
                        away,
                    )
                    if live_statistics and fixture_id:
                        self._live_statistics_cache_by_fixture[str(fixture_id)] = live_statistics
                    if fixture_id and not self._api_football_live_is_rate_limited():
                        fixture_key = str(fixture_id)
                        last_stats_fetch = self._live_statistics_last_fetch_by_fixture.get(fixture_key)
                        has_corner_stats = any(
                            (team_stats or {}).get("corners") is not None
                            for team_stats in live_statistics.values()
                        )
                        if not has_corner_stats and (not last_stats_fetch or now - last_stats_fetch >= timedelta(seconds=10)):
                            self._live_statistics_last_fetch_by_fixture[fixture_key] = now
                            live_statistics = await self._fetch_api_football_statistics_for_fixture(
                                session,
                                fixture_id,
                                headers,
                                home,
                                away,
                            )
                        elif not live_statistics:
                            live_statistics = self._live_statistics_cache_by_fixture.get(fixture_key, {})

                    referees = self._normalise_match_officials(
                        item.get("referees"),
                        item.get("officials"),
                        fixture.get("referees"),
                        fixture.get("officials"),
                        fixture.get("referee"),
                    )

                    goals = item.get("goals") or {}
                    score_data = item.get("score") or {}
                    fulltime = score_data.get("fulltime") or {}
                    halftime = score_data.get("halftime") or {}
                    live_home_score = _safe_int(goals.get("home"))
                    live_away_score = _safe_int(goals.get("away"))
                    if live_home_score is None:
                        live_home_score = _safe_int(fulltime.get("home"))
                    if live_away_score is None:
                        live_away_score = _safe_int(fulltime.get("away"))

                    item_data = {
                        "minute": elapsed,
                        "homeScore": live_home_score,
                        "awayScore": live_away_score,
                        "halfTimeHome": _safe_int(halftime.get("home")),
                        "halfTimeAway": _safe_int(halftime.get("away")),
                        "apiFootballStatus": status.get("short") or status.get("long"),
                        "apiFootballStatusLong": status.get("long"),
                        "events": inline_events,
                        "goalEvents": goal_events,
                        "cardEvents": card_events,
                        "substitutionEvents": substitution_events,
                        "referees": referees,
                        "liveStatistics": live_statistics,
                        "apiFootballFixtureId": fixture_id,
                        "venue": fixture_venue,
                    }

                    live_data[_match_key_from_names(home, away)] = item_data
                    live_data[_match_key_from_names(away, home)] = item_data

        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("API-Football live lookup failed: %s", err)
            return self._live_api_football_cache

        self._live_api_football_cache = live_data
        self._live_api_football_last_fetch = now
        _LOGGER.debug("API-Football live data loaded for %s matches", len(live_data))
        return live_data

    async def _fetch_api_football_fixtures_for_date(self, session, match_date, headers):
        """Fetch API-Football fixtures for one World Cup date.

        Keep this to the World Cup league endpoint only. The old date-only
        fallback could pull loads of unrelated fixtures and burn the API quota.
        On 429, stop immediately and pause API-Football calls for an hour.
        """
        if self._api_football_is_rate_limited():
            return []

        url = f"https://v3.football.api-sports.io/fixtures?date={match_date}&league=1&season=2026"
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 429:
                    await response.text()
                    self._mark_api_football_rate_limited("API-Football fixture date lookup")
                    return []
                if response.status >= 400:
                    text = await response.text()
                    _LOGGER.warning(
                        "API-Football fixture date lookup failed for %s: %s %s",
                        match_date,
                        response.status,
                        text,
                    )
                    return []
                payload = await response.json()
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("API-Football fixture date lookup failed for %s: %s", match_date, err)
            return []

        return payload.get("response", []) or []

    async def _fetch_active_fixture_status_from_api_football(self, matches):
        """Backup live status lookup for HT/live matches using the date fixture endpoint.

        API-Football's /fixtures?live=all endpoint can occasionally lag or return
        no rows around half-time. The date endpoint often has the fixture status
        already updated, so use it sparingly to unstick HT -> 2H.
        """
        api_key = await self._api_football_enabled()
        if not api_key or self._api_football_is_rate_limited():
            return {}

        now = datetime.now(timezone.utc)
        if self._live_fixture_status_last_fetch and now - self._live_fixture_status_last_fetch < timedelta(seconds=60):
            return {}

        active_matches = []
        for match in matches or []:
            status = str(match.get("status") or "").upper()
            kickoff = parse_datetime_utc(match.get("utcDate"))
            if status in LIVE_STATUSES:
                active_matches.append(match)
            elif kickoff and kickoff - timedelta(minutes=10) <= now <= kickoff + timedelta(hours=3, minutes=15):
                active_matches.append(match)

        if not active_matches:
            return {}

        self._live_fixture_status_last_fetch = now
        headers = {"x-apisports-key": api_key}
        timeout = aiohttp.ClientTimeout(total=30)
        date_values = set()
        for match in active_matches:
            match_dt = parse_datetime_utc(match.get("utcDate"))
            if match_dt:
                date_values.add(match_dt.date().isoformat())
                date_values.add((match_dt - timedelta(days=1)).date().isoformat())
                date_values.add((match_dt + timedelta(days=1)).date().isoformat())

        live_data = {}
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                for match_date in sorted(date_values):
                    fixtures = await self._fetch_api_football_fixtures_for_date(session, match_date, headers)
                    for item in fixtures:
                        fixture = item.get("fixture") or {}
                        fixture_venue = fixture.get("venue") or {}
                        status = fixture.get("status") or {}
                        api_status = self._status_from_api_football(status.get("short") or status.get("long"))
                        if not api_status or api_status not in LIVE_STATUSES | FINISHED_STATUSES:
                            continue

                        teams = item.get("teams") or {}
                        home = (teams.get("home") or {}).get("name")
                        away = (teams.get("away") or {}).get("name")
                        if not home or not away:
                            continue

                        item_dt = _api_football_item_datetime(item)
                        matched = any(
                            _api_fixture_matches_match(home, away, match)
                            and (
                                not item_dt
                                or not parse_datetime_utc(match.get("utcDate"))
                                or abs((parse_datetime_utc(match.get("utcDate")) - item_dt).total_seconds()) <= 36 * 60 * 60
                            )
                            for match in active_matches
                        )
                        if not matched:
                            continue

                        elapsed = status.get("elapsed")
                        try:
                            elapsed = int(elapsed) if elapsed is not None else None
                        except (TypeError, ValueError):
                            elapsed = None

                        goals = item.get("goals") or {}
                        score_data = item.get("score") or {}
                        fulltime = score_data.get("fulltime") or {}
                        halftime = score_data.get("halftime") or {}
                        live_home_score = _safe_int(goals.get("home"))
                        live_away_score = _safe_int(goals.get("away"))
                        if live_home_score is None:
                            live_home_score = _safe_int(fulltime.get("home"))
                        if live_away_score is None:
                            live_away_score = _safe_int(fulltime.get("away"))

                        fixture_id = fixture.get("id")
                        live_statistics = self._build_api_football_live_statistics(
                            item.get("statistics") or [],
                            home,
                            away,
                        )
                        if live_statistics and fixture_id:
                            self._live_statistics_cache_by_fixture[str(fixture_id)] = live_statistics
                        if fixture_id and not self._api_football_live_is_rate_limited():
                            fixture_key = str(fixture_id)
                            last_stats_fetch = self._live_statistics_last_fetch_by_fixture.get(fixture_key)
                            has_corner_stats = any(
                                (team_stats or {}).get("corners") is not None
                                for team_stats in live_statistics.values()
                            )
                            if not has_corner_stats and (not last_stats_fetch or now - last_stats_fetch >= timedelta(seconds=10)):
                                self._live_statistics_last_fetch_by_fixture[fixture_key] = now
                                live_statistics = await self._fetch_api_football_statistics_for_fixture(
                                    session,
                                    fixture_id,
                                    headers,
                                    home,
                                    away,
                                )
                            elif not live_statistics:
                                live_statistics = self._live_statistics_cache_by_fixture.get(fixture_key, {})

                        item_data = {
                            "minute": elapsed,
                            "homeScore": live_home_score,
                            "awayScore": live_away_score,
                            "halfTimeHome": _safe_int(halftime.get("home")),
                            "halfTimeAway": _safe_int(halftime.get("away")),
                            "apiFootballStatus": status.get("short") or status.get("long"),
                            "apiFootballStatusLong": status.get("long"),
                            "events": [],
                            "goalEvents": [],
                            "cardEvents": [],
                            "substitutionEvents": [],
                            "referees": self._normalise_match_officials(
                                item.get("referees"),
                                item.get("officials"),
                                fixture.get("referees"),
                                fixture.get("officials"),
                                fixture.get("referee"),
                            ),
                            "liveStatistics": live_statistics,
                            "apiFootballFixtureId": fixture_id,
                            "venue": fixture_venue,
                        }
                        live_data[_match_key_from_names(home, away)] = item_data
                        live_data[_match_key_from_names(away, home)] = item_data
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("API-Football active fixture status backup failed: %s", err)
            return {}

        if live_data:
            _LOGGER.debug("API-Football active fixture status backup loaded for %s matches", len(live_data) // 2)
        return live_data

    def _needs_post_match_events(self, match, now):
        """Return True when a finished match is missing rich timeline data.

        Results exported to GitHub should be more than just the score. Keep
        checking recent finished matches until goals/own goals/assists/cards,
        substitutions, VAR/referee and the full event timeline have been pulled
        from API-Football.
        """
        if match.get("status") not in FINISHED_STATUSES:
            return False

        kickoff = parse_datetime_utc(match.get("utcDate"))
        if kickoff and not (timedelta(0) <= (now - kickoff) <= timedelta(days=14)):
            return False

        events = match.get("events") or []
        goal_events = match.get("goalEvents") or []
        card_events = match.get("cardEvents") or []
        substitution_events = match.get("substitutionEvents") or []

        expected_goals = _expected_goal_count_from_match(match)
        existing_goal_count = _count_goal_events(goal_events or events)

        # Important: do not only check "has events". A match can have a partial
        # API-Football event list, e.g. USA 4-1 showing only 3 USA goal events.
        # Re-fetch until the stored goal-event count matches the final score.
        if expected_goals is not None and expected_goals > 0 and existing_goal_count < expected_goals:
            return True

        # The full Results feed should carry the match timeline, not just goals.
        # Substitutions are the best signal that the full event endpoint has
        # been pulled; cards/referees/fixture id are kept when the provider has
        # them, but some matches genuinely may have no cards.
        if not events:
            return True
        if not substitution_events:
            return True
        if not match.get("apiFootballFixtureId"):
            return True

        return False

    async def _fetch_post_match_events_from_api_football(self, matches):
        """Fetch goal events for recently finished matches missing goal times.

        football-data.org gives reliable scores but can omit scorer/timeline
        events. API-Football is used here as a post-match backfill so finished
        matches get the same goalEvents arrays as matches that were tracked live.
        """
        api_key = await self._api_football_enabled()
        if not api_key:
            return {}

        now = datetime.now(timezone.utc)
        if self._api_football_is_rate_limited():
            return self._post_match_api_football_cache
        candidates = [match for match in matches if self._needs_post_match_events(match, now)]
        if not candidates:
            return {}

        if (
            self._post_match_api_football_last_fetch
            and now - self._post_match_api_football_last_fetch < timedelta(minutes=30)
        ):
            return self._post_match_api_football_cache

        headers = {"x-apisports-key": api_key}
        timeout = aiohttp.ClientTimeout(total=30)
        # Search the match day plus one day either side. This fixes games that
        # providers place on different dates because one API is using local
        # stadium time and the other is using UTC.
        date_values = set()
        for match in candidates:
            match_dt = parse_datetime_utc(match.get("utcDate"))
            if not match_dt:
                continue
            for offset_days in (-1, 0, 1):
                date_values.add((match_dt + timedelta(days=offset_days)).date().isoformat())
        dates = sorted(date_values)
        post_match_data = {}

        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                for match_date in dates:
                    if self._api_football_is_rate_limited():
                        break
                    fixtures = await self._fetch_api_football_fixtures_for_date(session, match_date, headers)
                    for item in fixtures:
                        fixture = item.get("fixture") or {}
                        fixture_id = fixture.get("id")
                        teams = item.get("teams") or {}
                        home = (teams.get("home") or {}).get("name")
                        away = (teams.get("away") or {}).get("name")

                        if not home or not away:
                            continue

                        goal_events = [
                            event
                            for event in (
                                self._normalise_api_football_goal_event(event)
                                for event in (item.get("events", []) or [])
                            )
                            if event
                        ]

                        card_events = [
                            event
                            for event in (
                                self._normalise_api_football_card_event(event)
                                for event in (item.get("events", []) or [])
                            )
                            if event
                        ]
                        substitution_events = [
                            event
                            for event in (
                                self._normalise_api_football_substitution_event(event)
                                for event in (item.get("events", []) or [])
                            )
                            if event
                        ]
                        all_events = [
                            event
                            for event in (
                                self._normalise_api_football_event(event)
                                for event in (item.get("events", []) or [])
                            )
                            if event
                        ]

                        if fixture_id:
                            # Always call the dedicated events endpoint for
                            # recent finished matches. The date fixture payload
                            # can contain only scores or partial events; this is
                            # where subs, cards, VAR, assists and own-goal
                            # details are normally complete.
                            fixture_event_data = await self._fetch_api_football_events_for_fixture(
                                session,
                                fixture_id,
                                headers,
                            )
                            if fixture_event_data.get("events"):
                                all_events = fixture_event_data.get("events", [])
                                fixture_goal_events = fixture_event_data.get("goalEvents", [])
                                if _count_goal_events(fixture_goal_events) >= _count_goal_events(goal_events):
                                    goal_events = fixture_goal_events
                                card_events = fixture_event_data.get("cardEvents", [])
                                substitution_events = fixture_event_data.get("substitutionEvents", [])

                        # Keep the fixture even if the provider returns no events yet,
                        # so matches.json can still receive apiFootballFixtureId/referee
                        # and the logs can show that matching worked.
                        for event in all_events:
                            event["source"] = "api_football_post_match"
                        for event in goal_events:
                            event["source"] = "api_football_post_match"
                        for event in card_events:
                            event["source"] = "api_football_post_match"
                        for event in substitution_events:
                            event["source"] = "api_football_post_match"

                        referees = self._normalise_match_officials(
                            item.get("referees"),
                            item.get("officials"),
                            fixture.get("referees"),
                            fixture.get("officials"),
                            fixture.get("referee"),
                        )
                        item_data = {
                            "events": all_events,
                            "goalEvents": goal_events,
                            "cardEvents": card_events,
                            "substitutionEvents": substitution_events,
                            "referees": referees,
                            "apiFootballFixtureId": fixture_id,
                            "apiFootballHome": home,
                            "apiFootballAway": away,
                            "apiFootballDate": match_date,
                        }

                        # Store using the provider names both ways.
                        post_match_data[_match_key_from_names(home, away)] = item_data
                        post_match_data[_match_key_from_names(away, home)] = item_data

                        # Also store using the football-data match key for any
                        # candidate on the same date that this API-Football
                        # fixture clearly matches. This fixes provider naming
                        # differences such as Canada v Bosnia-Herzegovina,
                        # Bosnia-H., Bosnia and Herzegovina, etc.
                        for candidate in candidates:
                            if _api_football_item_matches_candidate(item, candidate):
                                candidate_home = _team_name(candidate.get("homeTeam", {}))
                                candidate_away = _team_name(candidate.get("awayTeam", {}))
                                post_match_data[_match_key_from_names(candidate_home, candidate_away)] = item_data
                                post_match_data[_match_key_from_names(candidate_away, candidate_home)] = item_data
                                _LOGGER.debug(
                                    "API-Football post-match matched %s v %s to %s v %s fixture=%s goals=%s cards=%s subs=%s",
                                    candidate_home,
                                    candidate_away,
                                    home,
                                    away,
                                    fixture_id,
                                    len(goal_events),
                                    len(card_events),
                                    len(substitution_events),
                                )
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("API-Football post-match events lookup failed: %s", err)
            return self._post_match_api_football_cache

        self._post_match_api_football_cache = post_match_data
        self._post_match_api_football_last_fetch = now
        _LOGGER.debug("API-Football post-match events loaded for %s matches", len(post_match_data))
        return post_match_data

    async def _add_post_match_api_football_events_to_matches(self, matches):
        """Attach post-match API-Football goal events to finished matches."""
        post_match_data = await self._fetch_post_match_events_from_api_football(matches)
        if not post_match_data:
            return matches

        for match in matches:
            now = datetime.now(timezone.utc)
            if not self._needs_post_match_events(match, now):
                continue

            home = _team_name(match.get("homeTeam", {}))
            away = _team_name(match.get("awayTeam", {}))
            data = post_match_data.get(_match_key_from_names(home, away))
            if not data:
                for possible in post_match_data.values():
                    if _api_fixture_matches_match(
                        possible.get("apiFootballHome"),
                        possible.get("apiFootballAway"),
                        match,
                    ):
                        data = possible
                        break
            if not data:
                _LOGGER.debug("No API-Football post-match data matched %s v %s", home, away)
                continue

            goal_events = data.get("goalEvents") or []
            all_events = data.get("events") or []
            card_events = data.get("cardEvents") or []
            substitution_events = data.get("substitutionEvents") or []

            # Apply anything we managed to recover. Do not require goals before
            # writing cards/referee/fixture id, otherwise a partial provider
            # response can make the match look completely empty in matches.json.
            if goal_events:
                match["goalEvents"] = goal_events
                match["goalEventsSource"] = "api_football_post_match"
            if all_events:
                match["events"] = all_events
            elif goal_events:
                match["events"] = goal_events
            if card_events:
                match["cardEvents"] = card_events
            if substitution_events:
                match["substitutionEvents"] = substitution_events
            if data.get("referees"):
                match["referees"] = self._normalise_match_officials(
                    match.get("referees"),
                    match.get("officials"),
                    match.get("referee"),
                    data.get("referees"),
                )
                match["officials"] = match["referees"]
            if data.get("apiFootballFixtureId"):
                match["apiFootballFixtureId"] = data.get("apiFootballFixtureId")

            if not goal_events and not all_events and not card_events:
                _LOGGER.debug(
                    "API-Football post-match found fixture for %s v %s but no events/cards were returned (fixture=%s)",
                    home,
                    away,
                    data.get("apiFootballFixtureId"),
                )

        return matches



    def _status_from_api_football(self, short_status):
        """Map API-Football live status into the dashboard live/finished statuses."""
        short = str(short_status or "").upper().strip()
        if short in {"1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"}:
            return short
        if short in {"LIVE", "IN_PLAY"}:
            return "LIVE"
        if short == "FT":
            return "FINISHED"
        if short in {"AET", "PEN"}:
            return short
        return None

    async def _add_live_api_football_data_to_matches(self, matches):
        """Overlay API-Football live data onto all known fixtures.

        This intentionally checks every fixture, not only matches football-data.org
        already marks as live. API-Football is the live source of truth, so if
        /fixtures?live=all says Spain v Cape Verde is 1H/2H/HT, the dashboard
        must switch that fixture to live and poll every 20 seconds.
        """
        if not await self._is_main_live_provider():
            return matches

        # Master installs must keep checking the live API while a match may be
        # active. Do not let the local poll-window gate stop HT -> 2H updates.
        live_data = await self._fetch_live_data_from_api_football()
        backup_live_data = {}
        if not live_data:
            backup_live_data = await self._fetch_active_fixture_status_from_api_football(matches)
            if not backup_live_data:
                return matches
            live_data = backup_live_data

        for match in matches:
            home = _team_name(match.get("homeTeam", {}))
            away = _team_name(match.get("awayTeam", {}))
            data = live_data.get(_match_key_from_names(home, away))
            if not data and not backup_live_data and str(match.get("status") or "").upper() in {"PAUSED", "HT", "HALF_TIME"}:
                backup_live_data = await self._fetch_active_fixture_status_from_api_football(matches)
                data = backup_live_data.get(_match_key_from_names(home, away))

            if not data:
                continue

            api_status = self._status_from_api_football(data.get("apiFootballStatus"))
            if api_status:
                match["status"] = api_status
                match["liveSource"] = "api_football"

            # API-Football is the primary LIVE feed now. It fills in live
            # score/clock/event detail even when football-data.org is still
            # behind and reporting the game as TIMED/SCHEDULED.
            minute = data.get("minute")
            if minute is not None:
                minute = int(minute)
                match["minute"] = minute
                match["clockSeconds"] = minute * 60
                match["displayMinute"] = f"{minute}'"
                match["manualClockText"] = f"{minute}'"
                match["clockSource"] = "api_football_live_minute"
                match["lastApiSync"] = datetime.now(timezone.utc).isoformat()
                match["manualClock"] = {
                    "seconds": minute * 60,
                    "timer": f"{minute}'",
                    "displayMinute": f"{minute}'",
                    "active": False,
                    "status": match.get("status"),
                    "source": "api_football_live_minute",
                    "lastApiSync": match["lastApiSync"],
                }
                match.pop("awaitingLiveApiData", None)

            home_score = data.get("homeScore")
            away_score = data.get("awayScore")
            if home_score is not None or away_score is not None:
                score = match.setdefault("score", {})
                full_time = score.setdefault("fullTime", {})
                if home_score is not None:
                    full_time["home"] = home_score
                    match["homeScore"] = home_score
                if away_score is not None:
                    full_time["away"] = away_score
                    match["awayScore"] = away_score
                match["scoreSource"] = "api_football_live"

            half_home = data.get("halfTimeHome")
            half_away = data.get("halfTimeAway")
            if half_home is not None or half_away is not None:
                score = match.setdefault("score", {})
                half_time = score.setdefault("halfTime", {})
                if half_home is not None:
                    half_time["home"] = half_home
                if half_away is not None:
                    half_time["away"] = half_away

            if data.get("apiFootballStatus"):
                match["apiFootballStatus"] = data.get("apiFootballStatus")
                match["apiFootballStatusLong"] = data.get("apiFootballStatusLong")

            goal_events = data.get("goalEvents") or []
            has_master_events = match.get("goalEventsSource") == "football_data" and bool(match.get("goalEvents"))
            if goal_events and not has_master_events:
                match["goalEvents"] = goal_events
                match["events"] = data.get("events") or goal_events
                match["goalEventsSource"] = "api_football_live"
            elif data.get("events"):
                match["events"] = data.get("events")

            if data.get("cardEvents"):
                match["cardEvents"] = data.get("cardEvents")
            if data.get("substitutionEvents"):
                match["substitutionEvents"] = data.get("substitutionEvents")
            if data.get("liveStatistics"):
                stats = data.get("liveStatistics") or {}
                home_stats = stats.get("home") or {}
                away_stats = stats.get("away") or {}
                match["liveStatistics"] = stats
                match["homeCorners"] = home_stats.get("corners")
                match["awayCorners"] = away_stats.get("corners")
                match["homeShotsOnGoal"] = home_stats.get("shotsOnGoal")
                match["awayShotsOnGoal"] = away_stats.get("shotsOnGoal")
                match["homePossession"] = home_stats.get("possession")
                match["awayPossession"] = away_stats.get("possession")
                match["homeFouls"] = home_stats.get("fouls")
                match["awayFouls"] = away_stats.get("fouls")
                match["homeOffsides"] = home_stats.get("offsides")
                match["awayOffsides"] = away_stats.get("offsides")
            if data.get("referees"):
                match["referees"] = self._normalise_match_officials(
                    match.get("referees"),
                    match.get("officials"),
                    match.get("referee"),
                    data.get("referees"),
                )
                match["officials"] = match["referees"]
            if data.get("apiFootballFixtureId"):
                match["apiFootballFixtureId"] = data.get("apiFootballFixtureId")
            if data.get("venue"):
                match["venue"] = data.get("venue")

        return matches

    async def _async_update_data(self) -> dict:
        """Fetch all World Cup data and build app-ready derived data."""
        await self._async_load_goal_event_store()

        try:
            matches_data = await self.api.get_matches()
            standings_data = await self.api.get_standings()
        except Exception as err:
            raise UpdateFailed(f"Error fetching World Cup data: {err}") from err

        try:
            scorers_data = await self.api.get_scorers()
        except Exception as err:
            _LOGGER.warning("Failed to fetch scorers (will retry next cycle): %s", err)
            scorers_data = {"scorers": []}

        matches = matches_data.get("matches", [])
        matches = self._add_football_data_live_fields_to_matches(matches)
        matches = await self._add_live_api_football_data_to_matches(matches)
        matches = self._promote_near_kickoff_matches_to_live(matches)
        matches = await self._add_stadium_weather_to_live_matches(matches)

        # While any match is live/HT/ET, keep the coordinator focused on the
        # lightweight live endpoint. Heavy post-match date/event lookups can hit
        # rate limits and must not block the live clock/status polling.
        if not any(str(m.get("status") or "").upper() in LIVE_STATUSES for m in matches or []):
            matches = await self._add_post_match_api_football_events_to_matches(matches)

        matches = await self._merge_persistent_goal_events_to_matches(matches)
        standings = standings_data.get("standings", [])
        scorers = scorers_data.get("scorers", [])
        scorers = await self._add_api_football_photos_to_scorers(scorers)

        new_interval = self._choose_poll_interval(matches)

        if self.update_interval != new_interval:
            _LOGGER.debug("Switching poll interval to %s", new_interval)
            self.update_interval = new_interval

        data = {
            "matches": matches,
            "standings": standings,
            "scorers": scorers,
            "statistics": _build_statistics(matches, standings, scorers),
            "records": _build_records(matches),
            "venues": await _build_venues(self.hass),
        }

        try:
            files = await self._export_public_json(matches, standings, scorers)
            await self._sync_public_json_to_github(files)
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("World Cup public JSON export/sync failed: %s", err)

        return data
