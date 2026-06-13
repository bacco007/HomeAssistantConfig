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
SCAN_INTERVAL_LIVE = timedelta(minutes=1)

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
        "cape verde islands": "cape verde",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    value = "".join(ch if ch.isalnum() else " " for ch in value)
    return " ".join(value.split())


def _match_key_from_names(home, away):
    return f"{_normalise_team_name(home)}|{_normalise_team_name(away)}"


def _full_time_score(match):
    score = match.get("score") or {}
    full_time = score.get("fullTime") or {}
    return full_time.get("home"), full_time.get("away")


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
        self._goal_event_store = {}
        self._goal_event_store_loaded = False


    def _goal_event_store_path(self):
        return Path("/config/world_cup_2026_goal_events.json")

    def _load_goal_event_store_sync(self):
        """Load persisted match clocks and goal events off the event loop."""
        path = self._goal_event_store_path()
        if not path.exists():
            return {}
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}

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

            # If real API events exist, remove the old guessed "Goal 90'" entries.
            # This fixes old/bad stored events and keeps proper scorer names.
            if api_events:
                existing_events = [
                    event for event in existing_events
                    if not self._is_generic_fallback_event(event)
                ]

            merged_events = self._merge_goal_events(existing_events, api_events, match=match, clock_seconds=state.get("clock_seconds"))

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
                match["events"] = merged_events

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

    async def _export_public_json(self, matches, standings, scorers):
        """Export public JSON files to /config/www/worldcup."""
        export_dir = Path("/config/www/worldcup")
        export_dir.mkdir(parents=True, exist_ok=True)

        files = {
            "matches.json": {"matches": matches},
            "standings.json": {"standings": standings},
            "scorers.json": {"scorers": scorers},
        }

        for filename, payload in files.items():
            await asyncio.to_thread(
                lambda name=filename, data=payload: (export_dir / name).write_text(
                    json.dumps(data, indent=2),
                    encoding="utf-8",
                )
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

    async def _api_football_enabled(self):
        settings = await self._async_read_github_settings()
        return settings.get("api_football_key")

    def _normalise_api_football_goal_event(self, event):
        """Convert an API-Football event into a small goal-event object."""
        if not isinstance(event, dict):
            return None

        event_type = str(event.get("type") or "").lower()
        if event_type != "goal":
            return None

        time_data = event.get("time") or {}
        team_data = event.get("team") or {}
        player_data = event.get("player") or {}
        assist_data = event.get("assist") or {}

        player_name = player_data.get("name") if isinstance(player_data, dict) else None
        team_name = team_data.get("name") if isinstance(team_data, dict) else None
        assist_name = assist_data.get("name") if isinstance(assist_data, dict) else None

        if not player_name or not team_name:
            return None

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

        return {
            "type": "Goal",
            "team": team_name,
            "player": player_name,
            "minute": minute,
            "extra": extra,
            "detail": event.get("detail"),
            "assist": assist_name,
        }

    async def _fetch_api_football_events_for_fixture(self, session, fixture_id, headers):
        """Fetch goal events for one API-Football fixture."""
        if not fixture_id:
            return []

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
                    return []
                payload = await response.json()
        except Exception as err:  # pylint: disable=broad-exception-caught
            _LOGGER.warning("API-Football fixture events lookup failed for %s: %s", fixture_id, err)
            return []

        return [
            event
            for event in (
                self._normalise_api_football_goal_event(item)
                for item in (payload.get("response", []) or [])
            )
            if event
        ]

    async def _fetch_live_data_from_api_football(self):
        """Fetch live elapsed minutes and goal events from API-Football only.

        Uses /fixtures?live=all and extracts fixture.status.elapsed.
        Goal events are read from the live payload when available, otherwise
        /fixtures/events is queried for each live fixture. Results are cached
        for five minutes to protect the free API limit.
        """
        api_key = await self._api_football_enabled()
        if not api_key:
            return {}

        now = datetime.now(timezone.utc)
        if (
            self._live_api_football_last_fetch
            and now - self._live_api_football_last_fetch < timedelta(minutes=5)
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

                    goal_events = [
                        event
                        for event in (
                            self._normalise_api_football_goal_event(event)
                            for event in (item.get("events", []) or [])
                        )
                        if event
                    ]

                    if not goal_events and fixture_id:
                        goal_events = await self._fetch_api_football_events_for_fixture(
                            session,
                            fixture_id,
                            headers,
                        )

                    item_data = {
                        "minute": elapsed,
                        "goalEvents": goal_events,
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

            minute = data.get("minute")
            if minute is not None:
                match["minute"] = minute

            goal_events = data.get("goalEvents") or []
            if goal_events:
                match["goalEvents"] = goal_events
                match["events"] = goal_events

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
        matches = await self._add_live_api_football_data_to_matches(matches)
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
