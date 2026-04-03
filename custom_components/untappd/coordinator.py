from __future__ import annotations

from dataclasses import dataclass
import logging

from aiohttp import ClientError

from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import CONF_CLIENT_ID, CONF_CLIENT_SECRET, CONF_USERNAME, DEFAULT_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)

BASE_URL = "https://api.untappd.com/v4"


@dataclass
class UntappdData:
    checkin: dict | None
    userinfo: dict | None
    wishlist: dict | None
    badge: dict | None
    rate_limit: int | None
    rate_remaining: int | None


class UntappdCoordinator(DataUpdateCoordinator[UntappdData]):

    def __init__(self, hass, config: dict):
        self.username = config[CONF_USERNAME]
        self.client_id = config[CONF_CLIENT_ID]
        self.client_secret = config[CONF_CLIENT_SECRET]

        super().__init__(
            hass,
            _LOGGER,
            name=f"untappd_{self.username}",
            update_interval=DEFAULT_SCAN_INTERVAL,
        )

    async def _api_get(self, endpoint: str, **extra_params):
        session = async_get_clientsession(self.hass)

        url = f"{BASE_URL}/{endpoint}"
        params = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            **extra_params,
        }

        try:
            async with session.get(url, params=params, timeout=30) as resp:
                text = await resp.text()
                _LOGGER.debug("Untappd GET %s -> %s", resp.url, resp.status)

                if resp.status != 200:
                    error_message = f"Untappd API error {resp.status}"
                    try:
                        error_json = await resp.json(content_type=None)
                        meta = error_json.get("meta", {})
                        detail = meta.get("error_detail")
                        error_type = meta.get("error_type")
                        if detail:
                            error_message = f"{error_message}: {detail}"
                        if error_type:
                            error_message = f"{error_message} ({error_type})"
                    except Exception:
                        pass

                    _LOGGER.error(
                        "Untappd API error for %s: status=%s body=%s",
                        endpoint,
                        resp.status,
                        text[:1000],
                    )
                    raise UpdateFailed(error_message)

                try:
                    data = await resp.json(content_type=None)
                except Exception as err:
                    _LOGGER.error(
                        "Untappd returned non-JSON for %s: %s",
                        endpoint,
                        text[:1000],
                    )
                    raise UpdateFailed("Untappd returned invalid JSON") from err

                return data, resp.headers

        except ClientError as err:
            raise UpdateFailed(f"Connection error: {err}") from err
        except TimeoutError as err:
            raise UpdateFailed(f"Timeout calling Untappd endpoint {endpoint}") from err

    async def _async_update_data(self) -> UntappdData:
        try:
            checkin_data, headers = await self._api_get(
                f"user/checkins/{self.username}",
                limit=1,
            )
            userinfo_data, _ = await self._api_get(
                f"user/info/{self.username}",
            )
            wishlist_data, _ = await self._api_get(
                f"user/wishlist/{self.username}",
                limit=50,
            )
            badge_data, _ = await self._api_get(
                f"user/badges/{self.username}",
                limit=1,
            )
        except Exception as err:
            _LOGGER.exception("Untappd refresh failed for %s", self.username)
            raise UpdateFailed(str(err)) from err

        rate_limit = headers.get("X-Ratelimit-Limit")
        rate_remaining = headers.get("X-Ratelimit-Remaining")

        return UntappdData(
            checkin=checkin_data,
            userinfo=userinfo_data,
            wishlist=wishlist_data,
            badge=badge_data,
            rate_limit=int(rate_limit) if rate_limit else None,
            rate_remaining=int(rate_remaining) if rate_remaining else None,
        )
