import logging
from datetime import timedelta

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.exceptions import ConfigEntryAuthFailed

from .const import API_BASE_URL, DOMAIN

_LOGGER = logging.getLogger(__name__)


class EmergencyAPICoordinator(DataUpdateCoordinator):

    def __init__(
        self,
        hass: HomeAssistant,
        api_key: str,
        latitude: float,
        longitude: float,
        radius: int,
        scan_interval: int,
    ) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=scan_interval),
        )
        self._api_key = api_key
        self._latitude = latitude
        self._longitude = longitude
        self._radius = radius

    async def _async_update_data(self) -> dict:
        url = (
            f"{API_BASE_URL}/incidents/nearby"
            f"?lat={self._latitude}&lng={self._longitude}&radius={self._radius}"
        )
        headers = {"Authorization": f"Bearer {self._api_key}"}

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                    if resp.status == 401:
                        raise ConfigEntryAuthFailed("Invalid API key")
                    if resp.status == 429:
                        raise UpdateFailed("Rate limited by EmergencyAPI (429)")
                    if resp.status != 200:
                        raise UpdateFailed(f"EmergencyAPI returned {resp.status}")
                    data = await resp.json()
        except aiohttp.ClientError as err:
            raise UpdateFailed(f"Error communicating with EmergencyAPI: {err}") from err

        features = data.get("features", [])
        _LOGGER.debug("EmergencyAPI returned %d incidents within %d km", len(features), self._radius)
        return data

    @property
    def incidents(self) -> list[dict]:
        if self.data is None:
            return []
        return self.data.get("features", [])

    @property
    def incident_count(self) -> int:
        return len(self.incidents)
