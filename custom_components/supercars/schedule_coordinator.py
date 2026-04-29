"""Dynamic Supercars schedule coordinator.

Selects the current or next event from the 2026 calendar by date.
Session data is loaded from the bundled schedule_2026.json first; if no
local sessions are found for the event, falls back to fetching and parsing
the official schedule article from supercars.com.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN

_LOCAL_SCHEDULE_PATH = Path(__file__).parent / "schedule_2026.json"

_LOGGER = logging.getLogger(__name__)

# ── 2026 Calendar ─────────────────────────────────────────────────────────────
# Each entry: (round, name, venue, timezone_str, event_start_date, event_end_date, schedule_url, schedule_timezone)
# schedule_timezone is the local time zone used in the published schedule tables
CALENDAR_2026 = [
    {
        "round": 1,
        "name": "Sydney 500",
        "venue": "Sydney Motorsport Park",
        "slug": "2026-sydney",
        "tz": "Australia/Sydney",
        "start": (2026, 2, 20),
        "end":   (2026, 2, 22),
        "schedule_url": "https://www.supercars.com/news/supercars-2026-sydney-500-track-schedule-race-start-times-session-programme",
    },
    {
        "round": 2,
        "name": "Melbourne SuperSprint",
        "venue": "Albert Park Circuit",
        "slug": "2026-melbourne",
        "tz": "Australia/Melbourne",
        "start": (2026, 3, 5),
        "end":   (2026, 3, 8),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-melbourne-supersprint-agp-track-schedule-race-times-albert-park",
    },
    {
        "round": 3,
        "name": "ITM Taupō Super 440",
        "venue": "Taupō Motorsport Park",
        "slug": "2026-taupo",
        "tz": "Pacific/Auckland",
        "start": (2026, 4, 10),
        "end":   (2026, 4, 12),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-taupo-track-schedule-race-start-times-how-to-watch-session-new-zealand",
    },
    {
        "round": 4,
        "name": "ITM Christchurch Super 440",
        "venue": "Ruapuna Raceway",
        "slug": "2026-christchurch",
        "tz": "Pacific/Auckland",
        "start": (2026, 4, 17),
        "end":   (2026, 4, 19),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-christchurch-ruapuna-revised-track-schedule-race-start-times-friday-sprint",
    },
    {
        "round": 5,
        "name": "Tasmania Super 440",
        "venue": "Symmons Plains",
        "slug": "2026-tasmania",
        "tz": "Australia/Hobart",
        "start": (2026, 5, 22),
        "end":   (2026, 5, 24),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-tasmania-symmons-plains-track-schedule-race-start-times-session",
    },
    {
        "round": 6,
        "name": "Darwin Triple Crown",
        "venue": "Hidden Valley Raceway",
        "slug": "2026-darwin",
        "tz": "Australia/Darwin",
        "start": (2026, 6, 19),
        "end":   (2026, 6, 21),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-darwin-hidden-valley-track-schedule-race-start-times-session",
    },
    {
        "round": 7,
        "name": "Townsville 500",
        "venue": "Reid Park",
        "slug": "2026-townsville",
        "tz": "Australia/Brisbane",
        "start": (2026, 7, 10),
        "end":   (2026, 7, 12),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-townsville-500-track-schedule-race-start-times-session",
    },
    {
        "round": 8,
        "name": "Perth Super 440",
        "venue": "Wanneroo Raceway",
        "slug": "2026-perth",
        "tz": "Australia/Perth",
        "start": (2026, 7, 31),
        "end":   (2026, 8, 2),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-perth-wanneroo-track-schedule-race-start-times-session",
    },
    {
        "round": 9,
        "name": "Ipswich Super 440",
        "venue": "Queensland Raceway",
        "slug": "2026-ipswich",
        "tz": "Australia/Brisbane",
        "start": (2026, 8, 21),
        "end":   (2026, 8, 23),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-ipswich-queensland-raceway-track-schedule-race-start-times-session",
    },
    {
        "round": 10,
        "name": "The Bend 500",
        "venue": "The Bend Motorsport Park",
        "slug": "2026-the-bend",
        "tz": "Australia/Adelaide",
        "start": (2026, 9, 18),
        "end":   (2026, 9, 20),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-the-bend-500-track-schedule-race-start-times-session",
    },
    {
        "round": 11,
        "name": "Bathurst 1000",
        "venue": "Mount Panorama",
        "slug": "2026-bathurst",
        "tz": "Australia/Sydney",
        "start": (2026, 10, 8),
        "end":   (2026, 10, 11),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-bathurst-1000-track-schedule-race-start-times-session",
    },
    {
        "round": 12,
        "name": "Gold Coast 500",
        "venue": "Surfers Paradise Street Circuit",
        "slug": "2026-gold-coast",
        "tz": "Australia/Brisbane",
        "start": (2026, 10, 23),
        "end":   (2026, 10, 25),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-gold-coast-500-track-schedule-race-start-times-session",
    },
    {
        "round": 13,
        "name": "Sandown 500",
        "venue": "Sandown Raceway",
        "slug": "2026-sandown",
        "tz": "Australia/Melbourne",
        "start": (2026, 11, 6),
        "end":   (2026, 11, 8),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-sandown-500-track-schedule-race-start-times-session",
    },
    {
        "round": 14,
        "name": "Adelaide Grand Final",
        "venue": "Adelaide Street Circuit",
        "slug": "2026-adelaide",
        "tz": "Australia/Adelaide",
        "start": (2026, 11, 27),
        "end":   (2026, 11, 29),
        "schedule_url": "https://www.supercars.com/news/supercars-news-2026-adelaide-grand-final-track-schedule-race-start-times-session",
    },
]

# Session type keywords
SESSION_TYPE_PRACTICE   = "practice"
SESSION_TYPE_QUALIFYING = "qualifying"
SESSION_TYPE_RACE       = "race"
SESSION_TYPE_SHOOTOUT   = "shootout"

# Keywords to identify Supercars rows vs support categories
SUPERCARS_KEYWORDS = {"supercars", "v8", "repco"}
SUPPORT_KEYWORDS   = {"gtnz", "formula ford", "historic", "gt", "events", "entertainment",
                      "super2", "porsche", "toyota gr cup"}

# Month name → number
MONTH_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def _classify_session(label: str) -> str:
    label_l = label.lower()
    if any(k in label_l for k in ("shootout", "top ten")):
        return SESSION_TYPE_SHOOTOUT
    if "race" in label_l:
        return SESSION_TYPE_RACE
    if any(k in label_l for k in ("qual", "q1", "q2", "q3")):
        return SESSION_TYPE_QUALIFYING
    if "practice" in label_l or "prac" in label_l:
        return SESSION_TYPE_PRACTICE
    return "other"


def _is_supercars_row(category: str, session: str) -> bool:
    combined = (category + " " + session).lower()
    if any(k in combined for k in SUPPORT_KEYWORDS):
        return False
    if any(k in combined for k in SUPERCARS_KEYWORDS):
        return True
    # Rows with no category label but a race/qualifying/practice session
    # are likely Supercars if no support keyword matched
    if any(k in session.lower() for k in ("race", "qual", "practice", "shootout", "top ten")):
        return True
    return False


def _parse_time(time_str: str, year: int, month: int, day: int, tz: ZoneInfo) -> datetime | None:
    """Parse 'HH:MM' into a timezone-aware datetime."""
    m = re.match(r"(\d{1,2}):(\d{2})", time_str.strip())
    if not m:
        return None
    try:
        return datetime(year, month, day, int(m.group(1)), int(m.group(2)), tzinfo=tz)
    except ValueError:
        return None


def _load_local_sessions(slug: str, event_tz: str) -> list[dict]:
    """Load sessions for *slug* from the bundled schedule_2026.json.

    Returns an empty list when the slug is absent or has no sessions.
    """
    try:
        data = json.loads(_LOCAL_SCHEDULE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as err:
        _LOGGER.warning("Could not read local schedule file: %s", err)
        return []

    raw_sessions = data.get(slug, {}).get("sessions", [])
    sessions: list[dict] = []
    tz = ZoneInfo(event_tz)

    for raw in raw_sessions:
        try:
            start_dt = datetime.fromisoformat(raw["start_iso"]).astimezone(tz)
        except (KeyError, ValueError):
            continue
        sessions.append({
            "label":       raw.get("label", "Session"),
            "type":        raw.get("type", "other"),
            "start":       start_dt,
            "start_iso":   start_dt.isoformat(),
            "start_local": raw.get("start_local", start_dt.strftime(f"%a %d %b %H:%M {event_tz.split('/')[-1]}")),
        })

    return sorted(sessions, key=lambda s: s["start"])


def _parse_schedule_html(html: str, event: dict) -> list[dict]:
    """
    Parse session tables from a supercars.com schedule article.

    Tables look like:
      | Start | Finish | Category | Duration | Session |
      | 09:35 | 10:20  | Supercars | 0:45    | Practice |

    Day headers look like: **Friday April 17** or **Saturday 18 Apr**
    """
    tz = ZoneInfo(event["tz"])
    year = event["start"][0]
    sessions: list[dict] = []

    current_day: tuple[int, int, int] | None = None

    # Normalise to lines
    lines = html.splitlines()

    for line in lines:
        line = line.strip()

        # ── Day header detection ──────────────────────────────────────────────
        # e.g. "**Friday April 17**" or "**Saturday 18 Apr**"
        day_match = re.search(
            r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b"
            r"[^\d]*(\d{1,2})\s+([a-z]{3,9})|"
            r"\b([a-z]{3,9})\s+(\d{1,2})\b",
            line.lower(),
        )
        if day_match and re.search(r"\*\*|##|####|---", line):
            # Try to find a month name and day number
            nums  = re.findall(r"\d{1,2}", line)
            words = re.findall(r"[a-z]{3,9}", line.lower())
            month_num = None
            day_num   = None
            for w in words:
                if w[:3] in MONTH_MAP:
                    month_num = MONTH_MAP[w[:3]]
                    break
            for n in nums:
                v = int(n)
                if 1 <= v <= 31:
                    day_num = v
                    break
            if month_num and day_num:
                current_day = (year, month_num, day_num)
            continue

        # Also catch plain bold day headers without markdown tables
        plain_day = re.search(
            r"(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)[,\s]+(\d{1,2})\s+([a-z]{3,9})",
            line.lower(),
        )
        if plain_day:
            day_num   = int(plain_day.group(1))
            month_str = plain_day.group(2)[:3]
            if month_str in MONTH_MAP and 1 <= day_num <= 31:
                current_day = (year, MONTH_MAP[month_str], day_num)
            continue

        # ── Table row detection ───────────────────────────────────────────────
        if "|" not in line or current_day is None:
            continue

        cells = [c.strip() for c in line.split("|") if c.strip()]
        if len(cells) < 3:
            continue

        # Skip header rows
        if any(h in cells[0].lower() for h in ("start", "---", "time")):
            continue

        # Expect: Start | Finish | Category | Duration | Session
        # or:     Start | Finish | Category | Session  (4 cols)
        if len(cells) >= 5:
            start_str, _, category, _, session = cells[0], cells[1], cells[2], cells[3], cells[4]
        elif len(cells) == 4:
            start_str, _, category, session = cells[0], cells[1], cells[2], cells[3]
        else:
            continue

        if not _is_supercars_row(category, session):
            continue

        start_dt = _parse_time(start_str, *current_day, tz)
        if start_dt is None:
            continue

        stype = _classify_session(session)
        if stype == "other":
            continue  # skip TV time, event rides, etc.

        sessions.append({
            "label":      session,
            "type":       stype,
            "start":      start_dt,
            "start_iso":  start_dt.isoformat(),
            "start_local": start_dt.strftime(f"%a %d %b %H:%M {event['tz'].split('/')[-1]}"),
        })

    # Sort and de-duplicate (same label+time from repeated page sections)
    seen = set()
    unique = []
    for s in sorted(sessions, key=lambda x: x["start"]):
        key = s["start_iso"] + s["label"]
        if key not in seen:
            seen.add(key)
            unique.append(s)

    return unique


def _select_event(now: datetime) -> dict | None:
    """
    Return the current or next event:
    - If today falls within an event window → that event
    - Otherwise → the next upcoming event
    - If the season is over → None
    """
    today = now.date()

    for event in CALENDAR_2026:
        start = datetime(*event["start"]).date()
        end   = datetime(*event["end"]).date()
        if start <= today <= end:
            return event  # We're inside this event right now

    for event in CALENDAR_2026:
        start = datetime(*event["start"]).date()
        if start > today:
            return event  # First future event

    return None  # Season complete


def _countdown_data(sessions: list[dict], now: datetime) -> dict[str, Any]:
    """Build the countdown fields from a session list."""
    future = [s for s in sessions if s["start"] > now]

    result: dict[str, Any] = {
        "next_session":                    None,
        "next_session_type":               None,
        "next_session_start":              None,
        "next_session_countdown_seconds":  None,
        "next_practice":                   None,
        "next_practice_start":             None,
        "next_practice_countdown_seconds": None,
        "next_qualifying":                 None,
        "next_qualifying_start":           None,
        "next_qualifying_countdown_seconds": None,
        "next_race":                       None,
        "next_race_start":                 None,
        "next_race_countdown_seconds":     None,
        "sessions_remaining":              len(future),
        "all_sessions": [
            {k: v for k, v in s.items() if k != "start"}
            for s in sessions
        ],
    }

    if future:
        nxt   = future[0]
        delta = int((nxt["start"] - now).total_seconds())
        result["next_session"]                   = nxt["label"]
        result["next_session_type"]              = nxt["type"]
        result["next_session_start"]             = nxt["start_local"]
        result["next_session_countdown_seconds"] = max(0, delta)

    for stype, prefix in [
        (SESSION_TYPE_PRACTICE,   "next_practice"),
        (SESSION_TYPE_QUALIFYING, "next_qualifying"),
        (SESSION_TYPE_RACE,       "next_race"),
    ]:
        typed = [s for s in future if s["type"] == stype]
        if typed:
            s     = typed[0]
            delta = int((s["start"] - now).total_seconds())
            result[prefix]                     = s["label"]
            result[f"{prefix}_start"]          = s["start_local"]
            result[f"{prefix}_countdown_seconds"] = max(0, delta)

    return result


class ScheduleCoordinator(DataUpdateCoordinator):
    """
    Fetches the schedule for the current/next Supercars event and provides
    per-session countdown data, refreshing every 30 seconds.

    Schedule HTML is re-fetched at most once per event (cached until the
    event changes), keeping outbound requests minimal.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_schedule",
            update_interval=timedelta(seconds=30),
        )
        self._session: aiohttp.ClientSession | None = None
        self._cached_slug: str | None = None
        self._cached_sessions: list[dict] = []

    async def _fetch_schedule(self, url: str) -> str:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                headers={"User-Agent": "Mozilla/5.0 (HomeAssistant Supercars Integration)"}
            )
        async with self._session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
            resp.raise_for_status()
            return await resp.text()

    async def _async_update_data(self) -> dict[str, Any]:
        now = datetime.now(tz=timezone.utc)

        event = _select_event(now)

        if event is None:
            return {
                "event": None,
                "round": None,
                "venue": None,
                "schedule_source": None,
                "sessions_remaining": 0,
                "all_sessions": [],
                "next_session": None,
                "next_session_type": None,
                "next_session_start": None,
                "next_session_countdown_seconds": None,
                "next_practice": None,
                "next_practice_start": None,
                "next_practice_countdown_seconds": None,
                "next_qualifying": None,
                "next_qualifying_start": None,
                "next_qualifying_countdown_seconds": None,
                "next_race": None,
                "next_race_start": None,
                "next_race_countdown_seconds": None,
            }

        # Reload sessions only when the event changes
        if event["slug"] != self._cached_slug:
            # Prefer local JSON — no network request needed
            local = _load_local_sessions(event["slug"], event["tz"])
            if local:
                _LOGGER.info(
                    "Loaded %d local sessions for %s", len(local), event["name"]
                )
                self._cached_sessions = local
                self._cached_slug = event["slug"]
            else:
                # Fall back to web scraping
                _LOGGER.info(
                    "No local sessions for %s; fetching from %s",
                    event["name"],
                    event["schedule_url"],
                )
                try:
                    html = await self._fetch_schedule(event["schedule_url"])
                    self._cached_sessions = _parse_schedule_html(html, event)
                    self._cached_slug = event["slug"]
                    _LOGGER.debug(
                        "Parsed %d Supercars sessions for %s",
                        len(self._cached_sessions),
                        event["name"],
                    )
                except Exception as err:
                    _LOGGER.warning("Could not fetch schedule for %s: %s", event["name"], err)
                    if not self._cached_sessions:
                        raise UpdateFailed(f"Schedule fetch failed: {err}") from err
                    # Fall through with stale cache

        local_now = now.astimezone(ZoneInfo(event["tz"]))
        data = _countdown_data(self._cached_sessions, local_now)
        data.update({
            "event":           event["name"],
            "round":           f"Round {event['round']}",
            "venue":           event["venue"],
            "schedule_source": event["schedule_url"],
            "event_slug":      event["slug"],
        })
        return data
