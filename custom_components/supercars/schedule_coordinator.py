"""Dynamic Supercars schedule coordinator.

Selects the current or next event from the 2026 calendar by date.
Session data is loaded from the bundled schedule_2026.json first; if no
local sessions are found for the event, falls back to fetching and parsing
the event's official Track Schedule page on supercars.com (a Contentful-
backed `raceSessionsCollection` embedded as a Next.js flight-chunk JSON blob,
not a news article — those URLs are not stable enough to hard-code).
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN
from .spa_extract import iter_html_json_blobs, search_json

_LOCAL_SCHEDULE_PATH = Path(__file__).parent / "schedule_2026.json"

_LOGGER = logging.getLogger(__name__)

# Real Supercars championship series code in the schedule's Contentful data
# (support categories like ARC/TCM/T82 use their own natsoftSeriesId).
_SUPERCARS_SERIES_ID = "SG3"


def _schedule_url(slug: str) -> str:
    return f"https://www.supercars.com/events/{slug}/schedule"


# ── 2026 Calendar ─────────────────────────────────────────────────────────────
# Each entry: round, name, venue, tz, event_start_date, event_end_date, slug,
# coords (venue lat/lon, used for the Open-Meteo air-temperature lookup)
CALENDAR_2026 = [
    {
        "round": 1,
        "name": "Sydney 500",
        "venue": "Sydney Motorsport Park",
        "slug": "2026-sydney",
        "coords": (-33.8033, 150.8706),
        "tz": "Australia/Sydney",
        "start": (2026, 2, 20),
        "end":   (2026, 2, 22),
    },
    {
        "round": 2,
        "name": "Melbourne SuperSprint",
        "venue": "Albert Park Circuit",
        "slug": "2026-melbourne",
        "coords": (-37.8497, 144.9680),
        "tz": "Australia/Melbourne",
        "start": (2026, 3, 5),
        "end":   (2026, 3, 8),
    },
    {
        "round": 3,
        "name": "ITM Taupō Super 440",
        "venue": "Taupō Motorsport Park",
        "slug": "2026-taupo",
        "coords": (-38.6653, 176.0447),
        "tz": "Pacific/Auckland",
        "start": (2026, 4, 10),
        "end":   (2026, 4, 12),
    },
    {
        "round": 4,
        "name": "ITM Christchurch Super 440",
        "venue": "Ruapuna Raceway",
        "slug": "2026-christchurch",
        "coords": (-43.4886, 172.4700),
        "tz": "Pacific/Auckland",
        "start": (2026, 4, 17),
        "end":   (2026, 4, 19),
    },
    {
        "round": 5,
        "name": "Tasmania Super 440",
        "venue": "Symmons Plains",
        "slug": "2026-tasmania",
        "coords": (-41.6497, 147.2508),
        "tz": "Australia/Hobart",
        "start": (2026, 5, 22),
        "end":   (2026, 5, 24),
    },
    {
        "round": 6,
        "name": "Darwin Triple Crown",
        "venue": "Hidden Valley Raceway",
        "slug": "2026-darwin",
        "coords": (-12.4247, 130.9153),
        "tz": "Australia/Darwin",
        "start": (2026, 6, 19),
        "end":   (2026, 6, 21),
    },
    {
        "round": 7,
        "name": "Townsville 500",
        "venue": "Reid Park",
        "slug": "2026-townsville",
        "coords": (-19.2830, 146.8100),
        "tz": "Australia/Brisbane",
        "start": (2026, 7, 10),
        "end":   (2026, 7, 12),
    },
    {
        "round": 8,
        "name": "Perth Super 440",
        "venue": "Wanneroo Raceway",
        "slug": "2026-perth",
        "coords": (-31.6636, 115.7869),
        "tz": "Australia/Perth",
        "start": (2026, 7, 31),
        "end":   (2026, 8, 2),
    },
    {
        "round": 9,
        "name": "Ipswich Super 440",
        "venue": "Queensland Raceway",
        "slug": "2026-ipswich",
        "coords": (-27.6903, 152.6547),
        "tz": "Australia/Brisbane",
        "start": (2026, 8, 21),
        "end":   (2026, 8, 23),
    },
    {
        "round": 10,
        "name": "The Bend 500",
        "venue": "The Bend Motorsport Park",
        "slug": "2026-the-bend",
        "coords": (-35.2372, 139.3080),
        "tz": "Australia/Adelaide",
        "start": (2026, 9, 18),
        "end":   (2026, 9, 20),
    },
    {
        "round": 11,
        "name": "Bathurst 1000",
        "venue": "Mount Panorama",
        "slug": "2026-bathurst",
        "coords": (-33.4472, 149.5581),
        "tz": "Australia/Sydney",
        "start": (2026, 10, 8),
        "end":   (2026, 10, 11),
    },
    {
        "round": 12,
        "name": "Gold Coast 500",
        "venue": "Surfers Paradise Street Circuit",
        "slug": "2026-gold-coast",
        "coords": (-27.9990, 153.4290),
        "tz": "Australia/Brisbane",
        "start": (2026, 10, 23),
        "end":   (2026, 10, 25),
    },
    {
        "round": 13,
        "name": "Sandown 500",
        "venue": "Sandown Raceway",
        "slug": "2026-sandown",
        "coords": (-37.9469, 145.1633),
        "tz": "Australia/Melbourne",
        "start": (2026, 11, 6),
        "end":   (2026, 11, 8),
    },
    {
        "round": 14,
        "name": "Adelaide Grand Final",
        "venue": "Adelaide Street Circuit",
        "slug": "2026-adelaide",
        "coords": (-34.9240, 138.6170),
        "tz": "Australia/Adelaide",
        "start": (2026, 11, 27),
        "end":   (2026, 11, 29),
    },
]

# Session type keywords
SESSION_TYPE_PRACTICE   = "practice"
SESSION_TYPE_QUALIFYING = "qualifying"
SESSION_TYPE_RACE       = "race"
SESSION_TYPE_SHOOTOUT   = "shootout"

def _classify_session(label: str) -> str:
    # Order matters: real labels like "Boost Mobile Qualifying (Race 20)" or
    # "Boost Mobile TTSO (Race 21)" embed the parent race number, so the
    # generic "race" check must run last or it swallows qualifying/shootout.
    label_l = label.lower()
    if any(k in label_l for k in ("shootout", "top ten", "ttso")):
        return SESSION_TYPE_SHOOTOUT
    if any(k in label_l for k in ("qual", "q1", "q2", "q3")):
        return SESSION_TYPE_QUALIFYING
    if "practice" in label_l or "prac" in label_l:
        return SESSION_TYPE_PRACTICE
    if "race" in label_l:
        return SESSION_TYPE_RACE
    return "other"


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


def _match_race_sessions(node: Any) -> list[dict] | None:
    """Matcher for `search_json` — finds `raceSessionsCollection.items`."""
    if (
        isinstance(node, dict)
        and isinstance(node.get("raceSessionsCollection"), dict)
        and isinstance(node["raceSessionsCollection"].get("items"), list)
    ):
        return node["raceSessionsCollection"]["items"]
    return None


def _parse_schedule_json(html: str, event: dict) -> list[dict]:
    """
    Parse the event's Track Schedule page.

    supercars.com renders this as a Contentful-backed `raceSessionsCollection`
    embedded in a Next.js flight-chunk JSON blob (not a plain HTML table).
    Each item carries an ISO `startDate`/`endDate` and a `series` block;
    real Supercars championship sessions are identified by
    `series.natsoftSeriesId == "SG3"` (support categories use their own ids).
    """
    tz = ZoneInfo(event["tz"])
    items: list[dict] | None = None
    for blob in iter_html_json_blobs(html):
        items = search_json(blob, _match_race_sessions)
        if items:
            break
    if not items:
        return []

    sessions: list[dict] = []
    for item in items:
        series = item.get("series") or {}
        if series.get("natsoftSeriesId") != _SUPERCARS_SERIES_ID:
            continue

        label = item.get("name") or "Session"
        stype = _classify_session(label)
        if stype == "other":
            continue  # skip gate times, track crossings, etc.

        start_raw = item.get("startDate")
        if not start_raw:
            continue
        try:
            start_dt = datetime.fromisoformat(start_raw).astimezone(tz)
        except ValueError:
            continue

        sessions.append({
            "label":       label,
            "type":        stype,
            "start":       start_dt,
            "start_iso":   start_dt.isoformat(),
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
                "event_in_progress": False,
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
                url = _schedule_url(event["slug"])
                _LOGGER.info(
                    "No local sessions for %s; fetching from %s",
                    event["name"],
                    url,
                )
                try:
                    html = await self._fetch_schedule(url)
                    self._cached_sessions = _parse_schedule_json(html, event)
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

        today = now.date()
        event_in_progress = (
            datetime(*event["start"]).date() <= today <= datetime(*event["end"]).date()
        )

        local_now = now.astimezone(ZoneInfo(event["tz"]))
        data = _countdown_data(self._cached_sessions, local_now)
        data.update({
            "event":           event["name"],
            "round":           f"Round {event['round']}",
            "venue":           event["venue"],
            "event_in_progress": event_in_progress,
            "schedule_source": _schedule_url(event["slug"]),
            "event_slug":      event["slug"],
        })
        return data
