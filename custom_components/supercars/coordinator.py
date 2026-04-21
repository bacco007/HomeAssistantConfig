"""Natsoft live timing data coordinator for Supercars Championship."""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    DOMAIN,
    NATSOFT_URL,
    SCAN_INTERVAL_ACTIVE,
    SCAN_INTERVAL_IDLE,
    STREAM_URL,
    STREAM_NOTE,
    SESSION_STATES,
)

_LOGGER = logging.getLogger(__name__)


def parse_natsoft(raw: str) -> dict[str, Any]:
    """
    Parse the Natsoft CSV-style timing feed.

    The feed is a series of lines, each beginning with a record type identifier.
    Common record types:
      $F  - Session / flag state
      $G  - Grid / competitor entry
      $J  - Competitor lap data
      $B  - Best lap
      $SP - Sector / split times
      $H  - Session header / round info
      $W  - Weather

    Each field is pipe-delimited: $TYPE|field1|field2|...
    """
    result: dict[str, Any] = {
        "session_active": False,
        "session_name": None,
        "round_name": None,
        "flag_state": "inactive",
        "flag_state_raw": None,
        "current_lap": None,
        "total_laps": None,
        "session_time_remaining": None,
        "leader": None,
        "leader_car": None,
        "leader_team": None,
        "top_10": [],
        "weather_temp": None,
        "weather_track": None,
        "weather_humidity": None,
        "stream_url": STREAM_URL,
        "stream_note": STREAM_NOTE,
        "raw_competitors": {},
    }

    if not raw or not raw.strip():
        return result

    competitors: dict[str, dict] = {}

    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue

        parts = line.split("|")
        record_type = parts[0].upper() if parts else ""

        try:
            # --- Session header / round info ---
            if record_type == "$H":
                # $H|RoundName|SessionName|...
                if len(parts) > 1:
                    result["round_name"] = parts[1].strip() or None
                if len(parts) > 2:
                    result["session_name"] = parts[2].strip() or None

            # --- Flag / session state ---
            elif record_type == "$F":
                # $F|FlagState|CurrentLap|TotalLaps|TimeRemaining|...
                if len(parts) > 1:
                    raw_flag = parts[1].strip()
                    result["flag_state_raw"] = raw_flag
                    result["flag_state"] = SESSION_STATES.get(raw_flag, raw_flag.lower())
                    result["session_active"] = raw_flag not in ("Inactive", "")
                if len(parts) > 2:
                    result["current_lap"] = _safe_int(parts[2])
                if len(parts) > 3:
                    result["total_laps"] = _safe_int(parts[3])
                if len(parts) > 4:
                    result["session_time_remaining"] = parts[4].strip() or None

            # --- Competitor / grid entry ---
            elif record_type == "$G":
                # $G|Position|CarNo|Driver|Team|...
                if len(parts) > 3:
                    car_no = parts[2].strip()
                    competitors.setdefault(car_no, {})
                    competitors[car_no].update(
                        {
                            "position": _safe_int(parts[1]),
                            "car_number": car_no,
                            "driver": parts[3].strip(),
                            "team": parts[4].strip() if len(parts) > 4 else None,
                        }
                    )

            # --- Lap data ---
            elif record_type == "$J":
                # $J|CarNo|Position|LastLapTime|BestLapTime|Gap|...
                if len(parts) > 1:
                    car_no = parts[1].strip()
                    competitors.setdefault(car_no, {"car_number": car_no})
                    competitors[car_no].update(
                        {
                            "position": _safe_int(parts[2]) if len(parts) > 2 else None,
                            "last_lap": parts[3].strip() if len(parts) > 3 else None,
                            "best_lap": parts[4].strip() if len(parts) > 4 else None,
                            "gap": parts[5].strip() if len(parts) > 5 else None,
                        }
                    )

            # --- Weather ---
            elif record_type == "$W":
                # $W|AirTemp|TrackTemp|Humidity|...
                if len(parts) > 1:
                    result["weather_temp"] = _safe_float(parts[1])
                if len(parts) > 2:
                    result["weather_track"] = _safe_float(parts[2])
                if len(parts) > 3:
                    result["weather_humidity"] = _safe_float(parts[3])

        except Exception as exc:  # pylint: disable=broad-except
            _LOGGER.debug("Error parsing Natsoft line '%s': %s", line, exc)

    # Build sorted top-10 from competitors
    ranked = sorted(
        [c for c in competitors.values() if c.get("position") is not None],
        key=lambda x: x["position"],
    )
    result["top_10"] = ranked[:10]
    result["raw_competitors"] = competitors

    if ranked:
        leader = ranked[0]
        result["leader"] = leader.get("driver")
        result["leader_car"] = leader.get("car_number")
        result["leader_team"] = leader.get("team")

    return result


def _safe_int(val: str | None) -> int | None:
    try:
        return int(val.strip()) if val and val.strip() else None
    except (ValueError, AttributeError):
        return None


def _safe_float(val: str | None) -> float | None:
    try:
        return float(val.strip()) if val and val.strip() else None
    except (ValueError, AttributeError):
        return None


class NatsoftCoordinator(DataUpdateCoordinator):
    """Polls the Natsoft timing feed and coordinates data updates."""

    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=SCAN_INTERVAL_IDLE),
        )
        self._session: aiohttp.ClientSession | None = None

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch and parse the Natsoft feed."""
        try:
            if self._session is None or self._session.closed:
                self._session = aiohttp.ClientSession()

            async with self._session.get(
                NATSOFT_URL, timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                resp.raise_for_status()
                raw = await resp.text()

        except aiohttp.ClientError as err:
            raise UpdateFailed(f"Error fetching Natsoft data: {err}") from err
        except Exception as err:
            raise UpdateFailed(f"Unexpected error: {err}") from err

        data = parse_natsoft(raw)

        # Adjust poll interval based on whether a session is active
        new_interval = (
            timedelta(seconds=SCAN_INTERVAL_ACTIVE)
            if data["session_active"]
            else timedelta(seconds=SCAN_INTERVAL_IDLE)
        )
        if self.update_interval != new_interval:
            self.update_interval = new_interval
            _LOGGER.debug(
                "Natsoft poll interval changed to %s seconds",
                new_interval.seconds,
            )

        return data
