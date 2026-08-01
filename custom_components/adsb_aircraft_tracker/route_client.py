"""Route lookup client for ADSB Aircraft Tracker."""
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

ROUTE_API_URL = "https://adsb.im/api/0/routeset"
ROUTE_CACHE_TTL = timedelta(hours=4)
ROUTE_API_TIMEOUT = 5


@dataclass
class RouteInfo:
    """Route information for a flight."""

    callsign: str
    origin_iata: str | None = None
    origin_name: str | None = None
    destination_iata: str | None = None
    destination_name: str | None = None
    valid: bool = False


class RouteClient:
    """Async client for fetching flight route data with TTL cache."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize route client."""
        self._hass = hass
        self._cache: dict[str, tuple[RouteInfo, datetime]] = {}

    async def async_get_route(self, callsign: str) -> RouteInfo:
        """Fetch route for a callsign, using cache when available."""
        if not callsign:
            return RouteInfo(callsign="", valid=False)

        normalized = callsign.strip().upper()

        if normalized in self._cache:
            cached_route, cached_at = self._cache[normalized]
            if dt_util.utcnow() - cached_at < ROUTE_CACHE_TTL:
                return cached_route

        route = await self._async_fetch_route(normalized)
        self._cache[normalized] = (route, dt_util.utcnow())
        return route

    async def _async_fetch_route(self, callsign: str) -> RouteInfo:
        """Fetch route from adsb.im API. Never raises."""
        try:
            session = async_get_clientsession(self._hass)
            payload = {"planes": [{"callsign": callsign, "lat": 0.0, "lng": 0.0}]}
            async with asyncio.timeout(ROUTE_API_TIMEOUT):
                async with session.post(
                    ROUTE_API_URL,
                    json=payload,
                    headers={"Accept": "application/json"},
                ) as response:
                    if response.status != 200:
                        _LOGGER.debug(
                            "Route API returned HTTP %d for %s",
                            response.status,
                            callsign,
                        )
                        return RouteInfo(callsign=callsign, valid=False)

                    data = await response.json()
                    return _parse_route_response(callsign, data)

        except asyncio.TimeoutError:
            _LOGGER.debug("Route API timeout for callsign %s", callsign)
        except Exception as err:
            _LOGGER.debug("Route API error for %s: %s", callsign, err)

        return RouteInfo(callsign=callsign, valid=False)


def _parse_route_response(callsign: str, data: Any) -> RouteInfo:
    """Parse adsb.im routeset API response into RouteInfo."""
    try:
        if not isinstance(data, list) or not data:
            return RouteInfo(callsign=callsign, valid=False)

        entry = data[0]
        airports = entry.get("_airports", [])

        if len(airports) < 2:
            return RouteInfo(callsign=callsign, valid=False)

        origin = airports[0]
        destination = airports[-1]

        return RouteInfo(
            callsign=callsign,
            origin_iata=origin.get("iata"),
            origin_name=origin.get("location") or origin.get("name"),
            destination_iata=destination.get("iata"),
            destination_name=destination.get("location") or destination.get("name"),
            valid=True,
        )
    except Exception as err:
        _LOGGER.debug("Failed to parse route response for %s: %s", callsign, err)
        return RouteInfo(callsign=callsign, valid=False)
