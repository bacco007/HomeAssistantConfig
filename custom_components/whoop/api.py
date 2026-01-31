"""API client for WHOOP."""

import asyncio
import logging
from typing import Any, Dict, Optional

from aiohttp import ClientError, ClientResponseError, ClientSession

from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import UpdateFailed

from .const import (
    API_BASE_URL,
    PROFILE_URL,
    BODY_MEASUREMENT_URL,
    RECOVERY_COLLECTION_URL,
    SLEEP_COLLECTION_URL,
    CYCLE_COLLECTION_URL,
    WORKOUT_COLLECTION_URL,
)

_LOGGER = logging.getLogger(__name__)

DEFAULT_TIMEOUT = 15
CLIENT_VERSION = "0.1.0"


class WhoopApiClient:
    """WHOOP API Client."""

    def __init__(
        self, session: ClientSession, access_token: str, base_url: str = API_BASE_URL
    ):
        """Initialize the API client."""
        self._session = session
        self._access_token = access_token
        self._base_url = base_url
        self._update_headers()

    def _update_headers(self):
        """Update headers, typically when access token changes."""
        self._headers = {
            "Authorization": f"Bearer {self._access_token}",
            "Accept": "application/json",
            "User-Agent": f"HomeAssistantWhoop/{CLIENT_VERSION}",
        }

    async def _request(
        self, method: str, path: str, params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make an API request."""
        url = f"{self._base_url}{path}"
        _LOGGER.debug("Requesting %s %s with params %s", method, url, params)
        self._update_headers()

        try:
            async with self._session.request(
                method,
                url,
                headers=self._headers,
                params=params,
                timeout=DEFAULT_TIMEOUT,
            ) as response:
                response_text_for_error = await response.text()
                response.raise_for_status()
                data = await response.json(content_type=None)
                _LOGGER.debug("API Response for %s: Successful", url)
                return data
        except ClientResponseError as err:
            _LOGGER.error(
                "API request to %s failed: %s (status: %s), body: %s",
                url,
                err.message,
                err.status,
                response_text_for_error,
            )
            if err.status == 401:
                raise ConfigEntryAuthFailed(
                    f"Authentication failed: {err.message}"
                ) from err
            if err.status == 429:
                raise UpdateFailed(f"Rate limit exceeded: {err.message}") from err
            raise UpdateFailed(
                f"API error: {err.message} (status: {err.status})"
            ) from err
        except (ClientError, asyncio.TimeoutError) as err:
            _LOGGER.error(
                "API request to %s failed with client/timeout error: %s", url, err
            )
            raise UpdateFailed(f"Network or timeout error: {err}") from err
        except Exception as err:
            _LOGGER.exception("Unexpected error during API request to %s", url)
            raise UpdateFailed(f"An unexpected error occurred: {err}") from err

    def update_access_token(self, new_access_token: str):
        """Update the access token for subsequent requests."""
        _LOGGER.debug("Updating API client access token.")
        self._access_token = new_access_token
        self._update_headers()

    async def get_user_profile_basic(self) -> Optional[Dict[str, Any]]:
        """Get the user's basic profile."""
        try:
            return await self._request("GET", PROFILE_URL)
        except UpdateFailed:
            return None

    async def get_body_measurement(self) -> Optional[Dict[str, Any]]:
        """Get the user's body measurements."""
        try:
            return await self._request("GET", BODY_MEASUREMENT_URL)
        except UpdateFailed:
            return None

    async def get_latest_recovery(self) -> Optional[Dict[str, Any]]:
        """Get the latest recovery record."""
        params = {"limit": 1}
        try:
            response_data = await self._request(
                "GET", RECOVERY_COLLECTION_URL, params=params
            )
            if (
                response_data
                and isinstance(response_data.get("records"), list)
                and response_data["records"]
            ):
                return response_data["records"][0]
            _LOGGER.debug("No records found in get_latest_recovery response.")
            return None
        except UpdateFailed:
            return None

    async def get_latest_sleep(self) -> Optional[Dict[str, Any]]:
        """Get the latest sleep record."""
        params = {"limit": 1}
        try:
            response_data = await self._request(
                "GET", SLEEP_COLLECTION_URL, params=params
            )
            if (
                response_data
                and isinstance(response_data.get("records"), list)
                and response_data["records"]
            ):
                _LOGGER.debug(
                    "get_latest_sleep: Returning latest_record: %s",
                    response_data["records"][0],
                )
                return response_data["records"][0]
            _LOGGER.debug(
                "No records found in get_latest_sleep response or records not a list."
            )
            return None
        except UpdateFailed:
            return None

    async def get_latest_cycle(self) -> Optional[Dict[str, Any]]:
        """Get the latest (current or most recent) physiological cycle."""
        params = {"limit": 1}
        try:
            response_data = await self._request(
                "GET", CYCLE_COLLECTION_URL, params=params
            )
            if (
                response_data
                and isinstance(response_data.get("records"), list)
                and response_data["records"]
            ):
                return response_data["records"][0]
            _LOGGER.debug("No records found in get_latest_cycle response.")
            return None
        except UpdateFailed:
            return None

    async def get_latest_workout(self) -> Optional[Dict[str, Any]]:
        """Get the latest workout."""
        params = {"limit": 1}
        try:
            response_data = await self._request(
                "GET", WORKOUT_COLLECTION_URL, params=params
            )
            if (
                response_data
                and isinstance(response_data.get("records"), list)
                and response_data["records"]
            ):
                return response_data["records"][0]
            _LOGGER.debug("No records found in get_latest_workout response.")
            return None
        except UpdateFailed:
            return None
