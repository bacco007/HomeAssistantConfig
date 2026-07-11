"""Natsoft live timing data coordinator for Supercars Championship.

The Natsoft "LiveMeeting" URL looks like an HTTP resource but it isn't one:
fetching it with a plain GET always returns a generic JS-loader HTML shell,
even mid-session. The real telemetry is pushed over a websocket opened to
that same URL (protocol swapped to ws://), streaming small XML fragments:

  <New ...>          initial snapshot: meeting/track/event info, full roster
  <S S="Green" .../> flag state change
  <C C="13" .../>    laps-remaining countdown for the current race
  <L Y="f">...</L>   full leaderboard snapshot (one <P> per car)
  <L Y="p">...</L>   incremental leaderboard update (changed cars only)

This is a push feed, not a request/response API, so unlike a typical
DataUpdateCoordinator this doesn't poll on a timer (`update_interval=None`):
a persistent background task maintains the connection (auto-reconnecting on
drop) and pushes state via `async_set_updated_data` as messages arrive.
"""
from __future__ import annotations

import asyncio
import contextlib
import logging
import xml.etree.ElementTree as ET
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    DOMAIN,
    INACTIVE_FLAGS,
    NATSOFT_URL,
    STREAM_URL,
    STREAM_NOTE,
    SESSION_STATES,
)

_LOGGER = logging.getLogger(__name__)

_RECONNECT_DELAY = 5  # seconds


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


def _format_laptime(seconds: float | None) -> str | None:
    if seconds is None or seconds <= 0:
        return None
    minutes, rem = divmod(seconds, 60)
    return f"{int(minutes)}:{rem:06.3f}"


def _format_gap(seconds: float | None) -> str:
    if seconds is None or seconds <= 0:
        return ""
    return f"+{seconds:.3f}"


class NatsoftCoordinator(DataUpdateCoordinator):
    """Maintains a persistent websocket connection to the Natsoft feed."""

    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=None)
        self._session: aiohttp.ClientSession | None = None
        self._listen_task: asyncio.Task | None = None

        self._roster: dict[str, dict] = {}
        self._board: dict[str, dict] = {}
        self._meeting_name: str | None = None
        self._event_name: str | None = None
        self._total_laps: int | None = None
        self._laps_remaining: int | None = None
        self._flag_state_raw: str | None = None
        # True once any real timing message has been received this run. Stays
        # True: the coordinator keeps the last values in memory, so sensors can
        # tell "we have (last-known) data" from "never connected this run".
        self._has_live_data = False

        self._data = self._build_data()

    async def _async_update_data(self) -> dict[str, Any]:
        # Push feed: ensure the listener is running and return current state.
        # Real updates arrive via async_set_updated_data from _listen_forever.
        if self._listen_task is None or self._listen_task.done():
            self._listen_task = self.hass.async_create_background_task(
                self._listen_forever(), f"{DOMAIN}_natsoft_listener"
            )
        return self._data

    async def async_shutdown(self) -> None:
        if self._listen_task is not None:
            self._listen_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._listen_task
        if self._session is not None and not self._session.closed:
            await self._session.close()
        await super().async_shutdown()

    async def _listen_forever(self) -> None:
        while True:
            try:
                await self._listen_once()
            except asyncio.CancelledError:
                raise
            except Exception as err:  # pylint: disable=broad-except
                _LOGGER.debug("Natsoft websocket error: %s", err)
            await asyncio.sleep(_RECONNECT_DELAY)

    async def _listen_once(self) -> None:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
        async with self._session.ws_connect(NATSOFT_URL, timeout=15) as ws:
            _LOGGER.debug("Connected to Natsoft live timing feed")
            async for msg in ws:
                if msg.type != aiohttp.WSMsgType.TEXT:
                    continue
                self._handle_message(msg.data)

    def _handle_message(self, raw: str) -> None:
        try:
            el = ET.fromstring(raw)
        except ET.ParseError:
            _LOGGER.debug("Unparsable Natsoft message: %s", raw[:200])
            return

        if el.tag == "New":
            self._handle_new(el)
        elif el.tag == "S":
            self._flag_state_raw = el.attrib.get("S")
        elif el.tag == "C":
            self._laps_remaining = _safe_int(el.attrib.get("C"))
        elif el.tag == "L":
            self._handle_leaderboard(el)
        else:
            return  # G (grid/safety-car) and A (fastest-lap alert) not surfaced

        self._has_live_data = True
        self._data = self._build_data()
        self.async_set_updated_data(self._data)

    def _handle_new(self, el: ET.Element) -> None:
        self._roster = {}
        rl = el.find("RL")
        if rl is not None:
            for r in rl.findall("R"):
                v = r.find("V")
                self._roster[r.attrib.get("ID")] = {
                    "car_number": r.attrib.get("C"),
                    "driver": v.attrib.get("N") if v is not None else None,
                }
        self._board = {}

        m = el.find("M")
        if m is not None:
            self._meeting_name = m.attrib.get("D")

        e = el.find("E")
        if e is not None:
            self._event_name = e.attrib.get("D")
            self._total_laps = _safe_int(e.attrib.get("L"))
        else:
            self._event_name = None
            self._total_laps = None
        self._laps_remaining = None

    def _handle_leaderboard(self, el: ET.Element) -> None:
        if el.attrib.get("Y") == "f":
            self._board = {}
        for p in el.findall("P"):
            car_id = p.attrib.get("C")
            if car_id is None:
                continue
            entry = self._board.setdefault(car_id, {})
            if "P" in p.attrib:
                entry["position"] = _safe_int(p.attrib["P"])
            d = p.find("D")
            if d is not None:
                if "I" in d.attrib:
                    entry["last_lap"] = _safe_float(d.attrib["I"])
                if "FI" in d.attrib:
                    entry["best_lap"] = _safe_float(d.attrib["FI"])
                if "GI" in d.attrib:
                    entry["gap"] = _safe_float(d.attrib["GI"])

    def _ranked_board(self) -> list[dict[str, Any]]:
        cars = [
            {
                "position": entry.get("position"),
                "car_number": (self._roster.get(car_id) or {}).get("car_number"),
                "driver": (self._roster.get(car_id) or {}).get("driver"),
                "team": None,  # not present in this feed
                "last_lap": _format_laptime(entry.get("last_lap")),
                "best_lap": _format_laptime(entry.get("best_lap")),
                "gap": _format_gap(entry.get("gap")),
            }
            for car_id, entry in self._board.items()
            if entry.get("position") is not None
        ]
        cars.sort(key=lambda c: c["position"])
        return cars

    def _build_data(self) -> dict[str, Any]:
        flag_raw = self._flag_state_raw
        data: dict[str, Any] = {
            "has_live_data": self._has_live_data,
            "session_active": flag_raw not in INACTIVE_FLAGS,
            "session_name": self._event_name,
            "round_name": self._meeting_name,
            "flag_state": SESSION_STATES.get(flag_raw, (flag_raw or "inactive").lower()),
            "flag_state_raw": flag_raw,
            "current_lap": None,
            "total_laps": self._total_laps,
            "session_time_remaining": None,
            "leader": None,
            "leader_car": None,
            "leader_team": None,
            "top_10": [],
            "stream_url": STREAM_URL,
            "stream_note": STREAM_NOTE,
            "raw_competitors": {},
        }

        if self._laps_remaining is not None and self._total_laps is not None:
            data["current_lap"] = max(0, self._total_laps - self._laps_remaining)
            data["session_time_remaining"] = f"{self._laps_remaining} laps"

        ranked = self._ranked_board()
        data["top_10"] = ranked[:10]
        data["raw_competitors"] = {c["car_number"]: c for c in ranked if c["car_number"]}
        if ranked:
            data["leader"] = ranked[0]["driver"]
            data["leader_car"] = ranked[0]["car_number"]

        return data
