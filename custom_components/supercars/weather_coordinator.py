"""Air-temperature coordinator for the current Supercars event venue.

The Natsoft timing feed carries no weather data, so air temperature is
sourced from Open-Meteo (free, no API key) using the venue coordinates of
the current/next event. Track temperature is not available from any source
and is intentionally not provided.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN
from .schedule_coordinator import _select_event

_LOGGER = logging.getLogger(__name__)

WEATHER_SCAN_INTERVAL = 900  # 15 minutes
_OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

_EMPTY: dict[str, Any] = {"air_temp": None, "venue": None, "source": None}


class WeatherCoordinator(DataUpdateCoordinator):
    """Fetches current air temperature for the active event's venue."""

    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_weather",
            update_interval=timedelta(seconds=WEATHER_SCAN_INTERVAL),
        )
        self._session: aiohttp.ClientSession | None = None

    def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                headers={"User-Agent": "Mozilla/5.0 (HomeAssistant Supercars Integration)"}
            )
        return self._session

    async def _async_update_data(self) -> dict[str, Any]:
        event = _select_event(datetime.now(tz=timezone.utc))
        if event is None or not event.get("coords"):
            return _EMPTY

        lat, lon = event["coords"]
        try:
            async with self._get_session().get(
                _OPEN_METEO_URL,
                params={"latitude": lat, "longitude": lon, "current": "temperature_2m"},
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                resp.raise_for_status()
                payload = await resp.json()
        except Exception as err:  # pylint: disable=broad-except
            _LOGGER.warning("Air temperature fetch failed: %s", err)
            # Preserve the last good reading rather than blanking the sensor.
            return self.data or _EMPTY

        temp = (payload.get("current") or {}).get("temperature_2m")
        return {
            "air_temp": temp,
            "venue":    event["venue"],
            "source":   "open-meteo",
        }
