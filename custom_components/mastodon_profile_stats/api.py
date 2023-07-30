"""Sample API Client."""
from __future__ import annotations

import asyncio
import socket

import aiohttp
import async_timeout

from homeassistant.const import CONF_URL

from .profile import MastodonProfile


class MastodonProfileStatsApiClientError(Exception):
    """Exception to indicate a general API error."""


class MastodonProfileStatsApiClientCommunicationError(
    MastodonProfileStatsApiClientError
):
    """Exception to indicate a communication error."""


class MastodonProfileStatsApiClient:
    """Sample API Client."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        entry,
    ) -> None:
        """Sample API Client."""
        self._session = session
        self.config_entry = entry
        self._url = entry[CONF_URL]

    async def async_get_data(self) -> any:
        """Get data from the API."""

        # Construct the user profile to derive the api url
        user_profile = MastodonProfile(any_profile=self._url)

        return await self._api_wrapper(method="get", url=user_profile.apiurl)

    async def _api_wrapper(
        self,
        method: str,
        url: str,
        data: dict | None = None,
        headers: dict | None = None,
    ) -> any:
        """Get information from the API."""
        try:
            async with async_timeout.timeout(10):
                response = await self._session.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=data,
                )
                response.raise_for_status()
                return await response.json()

        except asyncio.TimeoutError as exception:
            raise MastodonProfileStatsApiClientCommunicationError(
                "Timeout error fetching information",
            ) from exception
        except (aiohttp.ClientError, socket.gaierror) as exception:
            raise MastodonProfileStatsApiClientCommunicationError(
                "Error fetching information",
            ) from exception
        except Exception as exception:  # pylint: disable=broad-except
            raise MastodonProfileStatsApiClientError(
                "Something really wrong happened!"
            ) from exception
