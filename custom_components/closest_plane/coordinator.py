"""DataUpdateCoordinator for Closest Plane."""

from __future__ import annotations

import asyncio
import logging
from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import CONF_LATITUDE, CONF_LONGITUDE, CONF_RADIUS_KM, CONF_REFRESH_MINUTES, DOMAIN
from .enrichment import enrich_aircraft
from .opensky import fetch_closest_raw

_LOGGER = logging.getLogger(__name__)


class ClosestPlaneCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Fetch and enrich the closest aircraft on a configured schedule."""

    def __init__(self, hass: HomeAssistant, entry) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=entry.data.get(CONF_REFRESH_MINUTES, 2)),
        )
        self._entry = entry

    async def _async_update_data(self) -> dict[str, Any]:
        session = async_get_clientsession(self.hass)
        lat = self._entry.data[CONF_LATITUDE]
        lon = self._entry.data[CONF_LONGITUDE]
        radius_km = self._entry.data.get(CONF_RADIUS_KM, 180)

        try:
            async with asyncio.timeout(30):
                raw = await fetch_closest_raw(session, lat, lon, radius_km, self._entry.data)
                if raw is None:
                    return {}
                return await enrich_aircraft(session, raw, self._entry.data)
        except TimeoutError as err:
            raise UpdateFailed(f"Timeout fetching aircraft data: {err}") from err
        except Exception as err:
            raise UpdateFailed(f"Error fetching closest plane: {err}") from err
