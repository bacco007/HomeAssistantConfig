"""Networked feeder state client.

Looks up live state for an ICAO hex from public ADS-B aggregator APIs when the
local feed is missing fields (typically callsign for MLAT-only contacts).
Tries adsb.fi first, then airplanes.live. Both are free, no-auth, and update
in near-real time.
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

_LOGGER = logging.getLogger(__name__)

# Aggregator endpoints — both return the same `ac[]` shape as tar1090.
_SOURCES = [
    "https://opendata.adsb.fi/api/v2/icao/{hex}",
    "https://api.airplanes.live/v2/icao/{hex}",
]

_USER_AGENT = "ha-adsb-aircraft-tracker/1.0"
_TIMEOUT = 4
_CACHE_TTL = timedelta(seconds=30)


@dataclass
class AircraftState:
    """Subset of upstream feeder state used for enrichment."""

    hex: str
    callsign: str | None = None
    description: str | None = None
    operator: str | None = None
    valid: bool = False


class StateClient:
    """Async client for networked feeder state with TTL cache."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._cache: dict[str, tuple[AircraftState, datetime]] = {}

    async def async_get_state(self, hex_code: str) -> AircraftState:
        """Fetch state for a hex, using cache when available."""
        if not hex_code:
            return AircraftState(hex="", valid=False)

        normalized = hex_code.strip().lower()

        cached = self._cache.get(normalized)
        if cached:
            state, cached_at = cached
            if dt_util.utcnow() - cached_at < _CACHE_TTL:
                return state

        state = await self._async_fetch(normalized)
        now = dt_util.utcnow()
        # Drop expired entries so the cache can't grow without bound
        self._cache = {
            key: value
            for key, value in self._cache.items()
            if now - value[1] < _CACHE_TTL
        }
        self._cache[normalized] = (state, now)
        return state

    async def _async_fetch(self, hex_code: str) -> AircraftState:
        """Try each source in order. First valid hit wins. Never raises."""
        session = async_get_clientsession(self._hass)
        headers = {"User-Agent": _USER_AGENT, "Accept": "application/json"}

        for url_tpl in _SOURCES:
            url = url_tpl.format(hex=hex_code)
            try:
                async with asyncio.timeout(_TIMEOUT):
                    async with session.get(url, headers=headers) as response:
                        if response.status != 200:
                            _LOGGER.debug("State API %s -> HTTP %d", url, response.status)
                            continue
                        data = await response.json()
            except asyncio.TimeoutError:
                _LOGGER.debug("State API timeout: %s", url)
                continue
            except Exception as err:
                _LOGGER.debug("State API error %s: %s", url, err)
                continue

            state = _parse_response(hex_code, data)
            if state.valid:
                return state

        return AircraftState(hex=hex_code, valid=False)


def _parse_response(hex_code: str, data: Any) -> AircraftState:
    """Parse aggregator JSON into AircraftState."""
    try:
        ac_list = data.get("ac") if isinstance(data, dict) else None
        if not ac_list:
            return AircraftState(hex=hex_code, valid=False)

        ac = ac_list[0]
        callsign = (ac.get("flight") or "").strip() or None
        description = (ac.get("desc") or "").strip() or None
        operator = (ac.get("ownOp") or "").strip() or None

        if not (callsign or description or operator):
            return AircraftState(hex=hex_code, valid=False)

        return AircraftState(
            hex=hex_code,
            callsign=callsign,
            description=description,
            operator=operator,
            valid=True,
        )
    except Exception as err:
        _LOGGER.debug("Failed to parse state response for %s: %s", hex_code, err)
        return AircraftState(hex=hex_code, valid=False)
