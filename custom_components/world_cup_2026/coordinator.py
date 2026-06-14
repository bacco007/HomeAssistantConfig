"""World Cup 2026 data coordinator."""

from __future__ import annotations

from datetime import timedelta, datetime, timezone
import asyncio
import base64
import json
import logging
from pathlib import Path

import aiohttp

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import WorldCupAPI

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL_NORMAL = timedelta(minutes=5)
SCAN_INTERVAL_LIVE = timedelta(seconds=20)

TOTAL_WORLD_CUP_MATCHES = 104
LIVE_STATUSES = {"IN_PLAY", "PAUSED", "LIVE", "1H", "2H", "HT", "HALF_TIME"}
FINISHED_STATUSES = {"FINISHED", "FT", "AET", "PEN"}


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
        event_type = str(event.get("type") or "").lower()
        detail = str(event.get("detail") or "").lower()
        if "goal" in event_type or "goal" in detail:
            count += 1
    return count



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
        self._live_minutes_cache = {}
        self._live_minutes_last_fetch = None
        self._live_api_football_cache = {}
        self._live_api_football_last_fetch = None
        self._post_match_api_football_cache = {}
        self._post_match_api_football_last_fetch = None
        self._goal_event_store = {}
        self._goal_event_store_loaded = False


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

        # football-data.org live minute is the master clock. Reset the backend
        # clock to this minute on every API pull; the frontend then counts
        # locally between pulls and re-syncs on the next update.
        api_minute = _extract_match_minute(match)
        if api_minute is not None and status in LIVE_STATUSES:
            api_seconds = max(int(api_minute), 0) * 60
            state["base_seconds"] = api_seconds
            state["clock_seconds"] = api_seconds
            state["phase_start"] = now.isoformat()
            state["clock_active"] = True
            state["status"] = status
            state["source"] = "football_data_minute"
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
            # First live transition starts from kick-off time when possible.
            if previous_status not in LIVE_STATUSES or not phase_start:
                if previous_status in {"PAUSED", "HT", "HALF_TIME"}:
                    # Restart after half-time or extra-time break.
                    base_seconds = int(state.get("base_seconds") or 45 * 60)
                elif duration == "EXTRA_TIME" or int(state.get("clock_seconds") or 0) >= 90 * 60:
                    base_seconds = 90 * 60
                else:
                    base_seconds = 0
                    kickoff = parse_datetime_utc(match.get("utcDate"))
                    if kickoff and now > kickoff:
                        elapsed = int((now - kickoff).total_seconds())
                        # Clamp normal-time first half fallback so delays do not run away.
                        base_seconds = 0
                        state["clock_seconds"] = min(max(elapsed, 0), 45 * 60)
                        state["phase_start"] = now.isoformat()
                        state["base_seconds"] = max(int(state.get("clock_seconds") or 0), 0)
                        state["clock_active"] = True
                        state["status"] = status
                        return state
                state["phase_start"] = now.isoformat()
                state["base_seconds"] = base_seconds

            phase_start_dt = parse_datetime_utc(state.get("phase_start"))
            if phase_start_dt:
                elapsed = max(int((now - phase_start_dt).total_seconds()), 0)
                state["clock_seconds"] = int(state.get("base_seconds") or 0) + elapsed
            else:
                state["clock_seconds"] = int(state.get("base_seconds") or 0)
            state["clock_active"] = True
            state["status"] = status
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

    def _merge_goal_events(self, existing, incoming, match=None, clock_seconds=None):
        merged = []
        seen = set()

        for raw_event in list(existing or []) + list(incoming or []):
            event = self._normalise_goal_event(raw_event, match=match, clock_seconds=clock_seconds)
            if not event:
                continue

            sig = self._event_signature(event)
            if sig in seen:
                continue

            merged.append(event)
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
            api_events = match.get("goalEvents") or match.get("events") or []
            api_events = [event for event in api_events if isinstance(event, dict)]

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
            old_home = int(state.get("homeScore") or 0)
            old_away = int(state.get("awayScore") or 0)
            clock_seconds = int(state.get("clock_seconds") or 0)
            status = match.get("status")

            # Only create fallback events during a live game. Do not backfill
            # finished games as generic 90' goals. If API-Football supplies
            # real events, those are merged above instead.
            can_create_fallback = (
                status in LIVE_STATUSES
                and bool(state.get("clock_active"))
                and not api_events
            )

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

            # Export the backend/manual match clock into matches.json so the
            # GitHub feed carries the same clock data users see in the panel.
            # This does not replace scores/statuses from football-data.org.
            clock_seconds = int(state.get("clock_seconds") or 0)
            clock_text = self._format_timer_value(clock_seconds)
            display_minute = self._normalise_goal_minute(clock_seconds)
            manual_clock = {
                "seconds": clock_seconds,
                "timer": clock_text,
                "displayMinute": display_minute,
                "active": bool(state.get("clock_active")),
                "status": match.get("status"),
                "source": "local_status_timer",
            }

            if match.get("status") in LIVE_STATUSES:
                match["manualClock"] = manual_clock
                match["fallbackClock"] = clock_seconds
                match["fallbackClockText"] = clock_text
                match["manualClockText"] = clock_text
                match["displayMinute"] = display_minute
                match["clockSeconds"] = clock_seconds

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
        github_token: "github_pat_..."
        github_repo: "Adya84/ha-world-cup-2026"
        github_branch: "main"   # optional
        """
        secrets_file = Path("/config/secrets.yaml")
        settings = {
            "github_token": None,
            "github_repo": "Adya84/ha-world-cup-2026",
            "github_branch": "main",
            "api_football_key": None,
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
                "apiFootballFixtureId": public_match.get("apiFootballFixtureId"),
                "goalEventsSource": public_match.get("goalEventsSource"),
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
        raw_content = json.dumps(payload, indent=2)
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

    async def _async_read_github_settings(self):
        """Read GitHub/API keys without blocking Home Assistant."""
        return await self.hass.async_add_executor_job(self._read_github_settings_sync)

    async def _sync_public_json_to_github(self, files):
        """Sync exported JSON files to the configured GitHub repository."""
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

        timeout = aiohttp.ClientTimeout(total=30)

        async with aiohttp.ClientSession(timeout=timeout) as session:
            for filename, payload in files.items():
                await self._github_upload_file(
                    session,
                    repo,
                    branch,
                    filename,
                    payload,
                    headers,
                )

        _LOGGER.info("World Cup public JSON synced to GitHub repo %s", repo)


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

    def _normalise_api_football_event(self, event):
        """Convert one API-Football timeline event into a panel-friendly object."""
        if not isinstance(event, dict):
            return None

        event_type_raw = str(event.get("type") or "").strip()
        event_type = event_type_raw.lower()
        detail = event.get("detail")
        detail_lower = str(detail or "").lower()

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
        if event_type == "goal":
            panel_type = "Own Goal" if "own" in detail_lower else "Penalty" if "penalty" in detail_lower else "Goal"
        elif event_type == "card":
            panel_type = "Red Card" if "red" in detail_lower else "Yellow Card" if "yellow" in detail_lower else "Card"
        elif event_type in {"subst", "substitution"}:
            panel_type = "Substitution"
        elif event_type == "var":
            panel_type = "VAR"

        return {
            "type": panel_type,
            "rawType": event_type_raw,
            "team": team_name,
            "player": player_name,
            "minute": minute,
            "extra": extra,
            "displayMinute": display_minute,
            "timer": f"{timer_seconds // 60}:{timer_seconds % 60:02d}" if timer_seconds is not None else None,
            "timerSeconds": timer_seconds,
            "detail": detail,
            "comments": event.get("comments"),
            "assist": assist_name,
            "source": "api_football",
        }

    def _normalise_api_football_goal_event(self, event):
        """Return only goal-type events for the scorer display."""
        normalised = self._normalise_api_football_event(event)
        if not normalised:
            return None
        if normalised.get("rawType", "").lower() != "goal" and normalised.get("type") not in {"Goal", "Own Goal", "Penalty"}:
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

        url = f"https://v3.football.api-sports.io/fixtures/events?fixture={fixture_id}"
        try:
            async with session.get(url, headers=headers) as response:
                if response.status >= 400:
                    text = await response.text()
                    _LOGGER.warning(
                        "API-Football fixture events lookup failed for %s: %s %s",
                        fixture_id,
                        response.status,
                        text,
                    )
                    return {"events": [], "goalEvents": [], "cardEvents": []}
                payload = await response.json()
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("API-Football fixture events lookup failed for %s: %s", fixture_id, err)
            return {"events": [], "goalEvents": [], "cardEvents": []}

        raw_events = payload.get("response", []) or []
        all_events = [event for event in (self._normalise_api_football_event(item) for item in raw_events) if event]
        goal_events = [event for event in all_events if event.get("rawType", "").lower() == "goal" or event.get("type") in {"Goal", "Own Goal", "Penalty"}]
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

    async def _fetch_live_data_from_api_football(self):
        """Fetch live elapsed minutes and goal events from API-Football only.

        Uses /fixtures?live=all and extracts fixture.status.elapsed.
        Goal events are read from the live payload when available, otherwise
        /fixtures/events is queried for each live fixture. Results are cached
        briefly so live score/scorer/card data updates on every 20-second live poll.
        """
        api_key = await self._api_football_enabled()
        if not api_key:
            return {}

        now = datetime.now(timezone.utc)
        if (
            self._live_api_football_last_fetch
            and now - self._live_api_football_last_fetch < timedelta(seconds=15)
        ):
            return self._live_api_football_cache

        url = "https://v3.football.api-sports.io/fixtures?live=all"
        headers = {"x-apisports-key": api_key}
        timeout = aiohttp.ClientTimeout(total=30)
        live_data = {}

        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url, headers=headers) as response:
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
                for item in live_items:
                    fixture = item.get("fixture") or {}
                    fixture_id = fixture.get("id")
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
                    goal_events = [event for event in inline_events if event.get("rawType", "").lower() == "goal" or event.get("type") in {"Goal", "Own Goal", "Penalty"}]
                    card_events = [event for event in inline_events if event.get("rawType", "").lower() == "card" or event.get("type") in {"Yellow Card", "Red Card", "Card"}]
                    substitution_events = [event for event in inline_events if event.get("rawType", "").lower() in {"subst", "substitution"} or str(event.get("type", "")).lower() == "substitution" or "substitution" in str(event.get("detail", "")).lower()]

                    expected_goals = _expected_goal_count_from_api_football_item(item)
                    if fixture_id and (
                        not inline_events
                        or not goal_events
                        or (
                            expected_goals is not None
                            and expected_goals > 0
                            and _count_goal_events(goal_events) < expected_goals
                        )
                    ):
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

                    fixture_referee = fixture.get("referee")
                    referees = [{"name": fixture_referee, "type": "REFEREE"}] if fixture_referee else []

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
                        "apiFootballFixtureId": fixture_id,
                    }

                    live_data[_match_key_from_names(home, away)] = item_data
                    live_data[_match_key_from_names(away, home)] = item_data

        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("API-Football live lookup failed: %s", err)
            return self._live_api_football_cache

        self._live_api_football_cache = live_data
        self._live_api_football_last_fetch = now
        self._live_minutes_cache = {
            key: value.get("minute")
            for key, value in live_data.items()
            if value.get("minute") is not None
        }
        self._live_minutes_last_fetch = now
        _LOGGER.debug("API-Football live data loaded for %s matches", len(live_data))
        return live_data

    async def _fetch_live_minutes_from_api_football(self):
        """Backward-compatible helper returning only live minutes."""
        live_data = await self._fetch_live_data_from_api_football()
        return {
            key: value.get("minute")
            for key, value in live_data.items()
            if value.get("minute") is not None
        }

    async def _fetch_api_football_fixtures_for_date(self, session, match_date, headers):
        """Fetch API-Football fixtures for one date and return the raw response list.

        The World Cup API-Football league is normally 1. If that filtered lookup
        returns no fixtures, fall back to the date-only lookup so post-match
        scorer times can still be recovered if the provider changes league ids.
        """
        urls = [
            f"https://v3.football.api-sports.io/fixtures?date={match_date}&league=1&season=2026",
            f"https://v3.football.api-sports.io/fixtures?date={match_date}",
        ]

        for url in urls:
            try:
                async with session.get(url, headers=headers) as response:
                    if response.status >= 400:
                        text = await response.text()
                        _LOGGER.warning(
                            "API-Football fixture date lookup failed for %s: %s %s",
                            match_date,
                            response.status,
                            text,
                        )
                        continue
                    payload = await response.json()
            except Exception as err:  # pylint: disable=broad-exception-caught
                _LOGGER.warning("API-Football fixture date lookup failed for %s: %s", match_date, err)
                continue

            items = payload.get("response", []) or []
            if items:
                return items

        return []

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
        candidates = [match for match in matches if self._needs_post_match_events(match, now)]
        if not candidates:
            return {}

        if (
            self._post_match_api_football_last_fetch
            and now - self._post_match_api_football_last_fetch < timedelta(minutes=10)
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

                        fixture_referee = fixture.get("referee")
                        referees = [{"name": fixture_referee, "type": "REFEREE"}] if fixture_referee else []
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
                match["referees"] = data.get("referees")
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

    async def _add_live_api_football_data_to_matches(self, matches):
        """Add minute and goalEvents fields to live football-data matches."""
        if not any(match.get("status") in LIVE_STATUSES for match in matches):
            return matches

        live_data = await self._fetch_live_data_from_api_football()
        if not live_data:
            return matches

        for match in matches:
            if match.get("status") not in LIVE_STATUSES:
                continue

            home = _team_name(match.get("homeTeam", {}))
            away = _team_name(match.get("awayTeam", {}))
            data = live_data.get(_match_key_from_names(home, away))

            if not data:
                continue

            # API-Football is the primary LIVE feed now. It fills in any
            # live score/clock/event detail that football-data.org is missing
            # or slower to provide. football-data remains the tournament source
            # for fixtures, groups, standings and fallback match data.
            minute = data.get("minute")
            if minute is not None:
                match["minute"] = minute

            home_score = data.get("homeScore")
            away_score = data.get("awayScore")
            if home_score is not None or away_score is not None:
                score = match.setdefault("score", {})
                full_time = score.setdefault("fullTime", {})
                if home_score is not None:
                    full_time["home"] = home_score
                if away_score is not None:
                    full_time["away"] = away_score

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
            if data.get("referees"):
                match["referees"] = data.get("referees")
            if data.get("apiFootballFixtureId"):
                match["apiFootballFixtureId"] = data.get("apiFootballFixtureId")

        return matches

    async def _add_live_minutes_to_matches(self, matches):
        """Backward-compatible wrapper for older internal calls."""
        return await self._add_live_api_football_data_to_matches(matches)

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
        matches = await self._add_post_match_api_football_events_to_matches(matches)
        matches = await self._merge_persistent_goal_events_to_matches(matches)
        standings = standings_data.get("standings", [])
        scorers = scorers_data.get("scorers", [])

        has_live = any(m.get("status") in LIVE_STATUSES for m in matches)
        new_interval = SCAN_INTERVAL_LIVE if has_live else SCAN_INTERVAL_NORMAL

        if self.update_interval != new_interval:
            _LOGGER.debug("Switching poll interval to %s (live=%s)", new_interval, has_live)
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
