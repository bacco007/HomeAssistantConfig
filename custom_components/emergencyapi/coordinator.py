import logging
from datetime import timedelta

import aiohttp
from homeassistant.components import persistent_notification
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.exceptions import ConfigEntryAuthFailed

from .const import API_BASE_URL, DOMAIN

_LOGGER = logging.getLogger(__name__)

_RATE_LIMIT_NOTIFICATION_ID = "emergencyapi_rate_limit"


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
        self._base_interval = timedelta(minutes=scan_interval)

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
                        # Rate limited (free-tier monthly cap). Keep entities available on the
                        # last-known data, notify once, and back off; restore on the next success.
                        persistent_notification.async_create(
                            self.hass,
                            (
                                "EmergencyAPI has hit its free-tier monthly limit (5,000 calls). "
                                "Incident data is paused until the limit resets. Raise the update "
                                "interval under Settings > Devices & Services > EmergencyAPI > "
                                "Configure, or upgrade your plan."
                            ),
                            title="EmergencyAPI rate limit reached",
                            notification_id=_RATE_LIMIT_NOTIFICATION_ID,
                        )
                        self.update_interval = timedelta(minutes=30)
                        # self.data is None on a cold-start 429; coalesce so entities don't wipe.
                        return self.data if self.data is not None else {"features": []}
                    if resp.status != 200:
                        raise UpdateFailed(f"EmergencyAPI returned {resp.status}")
                    data = await resp.json()
        except aiohttp.ClientError as err:
            raise UpdateFailed(f"Error communicating with EmergencyAPI: {err}") from err

        features = data.get("features", [])
        _LOGGER.debug("EmergencyAPI returned %d incidents within %d km", len(features), self._radius)
        # Recovered (or never rate limited): restore cadence and clear any notice.
        self.update_interval = self._base_interval
        persistent_notification.async_dismiss(self.hass, _RATE_LIMIT_NOTIFICATION_ID)
        return data

    @property
    def incidents(self) -> list[dict]:
        if self.data is None:
            return []
        return self.data.get("features", [])

    @property
    def incident_count(self) -> int:
        return len(self.incidents)
