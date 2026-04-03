from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import logging

from aiohttp import ClientError
from dateutil import parser

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import CONF_CLIENT_ID, CONF_CLIENT_SECRET, CONF_USERNAME, DEFAULT_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)


BASE_URL = "https://api.untappd.com/v4"


@dataclass
class UntappdData:
    checkin: dict | None
    wishlist: dict | None
    badge: dict | None
    rate_limit: int | None
    rate_remaining: int | None


class UntappdCoordinator(DataUpdateCoordinator[UntappdData]):
    def __init__(self, hass: HomeAssistant, config: dict):
        self.username = config[CONF_USERNAME]
        self.client_id = config[CONF_CLIENT_ID]
        self.client_secret = config[CONF_CLIENT_SECRET]

        super().__init__(
            hass,
            _LOGGER,
            name=f"untappd_{self.username}",
            update_interval=DEFAULT_SCAN_INTERVAL,
        )

    async def _api_get(self, endpoint: str):
        session = async_get_clientsession(self.hass)

        url = (
            f"{BASE_URL}/{endpoint}"
            f"?client_id={self.client_id}&client_secret={self.client_secret}"
        )

        async with session.get(url, timeout=30) as resp:
            if resp.status != 200:
                raise UpdateFailed(f"Untappd API error {resp.status}")

            data = await resp.json()

            return data, resp.headers

    async def _async_update_data(self) -> UntappdData:
        try:
            checkin_data, headers = await self._api_get(
                f"user/checkins/{self.username}?limit=1"
            )
            wishlist_data, _ = await self._api_get(
                f"user/wishlist/{self.username}?limit=50"
            )
            badge_data, _ = await self._api_get(
                f"user/badges/{self.username}?limit=1"
            )
        except ClientError as err:
            raise UpdateFailed(f"Connection error: {err}") from err

        rate_limit = headers.get("X-Ratelimit-Limit")
        rate_remaining = headers.get("X-Ratelimit-Remaining")

        return UntappdData(
            checkin=checkin_data,
            wishlist=wishlist_data,
            badge=badge_data,
            rate_limit=int(rate_limit) if rate_limit else None,
            rate_remaining=int(rate_remaining) if rate_remaining else None,
        )