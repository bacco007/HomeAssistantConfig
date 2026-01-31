"""ABC Emergency API Client.

This module provides an async HTTP client for the ABC Emergency API,
which aggregates emergency data from state and territory emergency services
across Australia.
"""

from __future__ import annotations

import json
import logging
from typing import TYPE_CHECKING, cast
from urllib.parse import urlencode

from aiohttp import ClientError, ClientResponseError, ClientTimeout

from .const import (
    API_BASE_URL,
    USER_AGENT,
    EmergencyFeedResponse,
    EmergencySearchResponse,
)
from .exceptions import (
    ABCEmergencyAPIError,
    ABCEmergencyConnectionError,
)

if TYPE_CHECKING:
    from aiohttp import ClientSession

_LOGGER = logging.getLogger(__name__)

# Default timeout for API requests (30 seconds)
DEFAULT_TIMEOUT = 30


class ABCEmergencyClient:
    """Client for ABC Emergency API.

    This client provides methods to fetch emergency incident data from the
    ABC Emergency service, which aggregates data from state and territory
    emergency services across Australia.
    """

    def __init__(
        self,
        session: ClientSession,
        *,
        base_url: str = API_BASE_URL,
    ) -> None:
        """Initialize the client.

        Args:
            session: An aiohttp ClientSession for making HTTP requests.
            base_url: The base URL for the API. Defaults to the production URL.
        """
        self._session = session
        self._base_url = base_url.rstrip("/")

    async def _async_request(
        self,
        endpoint: str,
        params: dict[str, str] | None = None,
    ) -> dict[str, object]:
        """Make an async request to the API.

        Args:
            endpoint: The API endpoint (e.g., "emergencySearch").
            params: Optional query parameters.

        Returns:
            The JSON response as a dictionary.

        Raises:
            ABCEmergencyConnectionError: If a connection error occurs.
            ABCEmergencyAPIError: If the API returns an error or invalid response.
        """
        url = f"{self._base_url}/{endpoint}"
        if params:
            url = f"{url}?{urlencode(params, safe='[]')}"

        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        }

        _LOGGER.debug("Requesting %s", url)

        try:
            async with self._session.get(
                url,
                headers=headers,
                timeout=ClientTimeout(total=DEFAULT_TIMEOUT),
            ) as response:
                response.raise_for_status()
                data: dict[str, object] = await response.json()
                _LOGGER.debug("Received response with %d bytes", len(str(data)))
                return data

        except TimeoutError as err:
            _LOGGER.error("Timeout connecting to ABC Emergency API: %s", err)
            raise ABCEmergencyConnectionError(
                f"Timeout connecting to ABC Emergency API: {err}"
            ) from err

        except ClientResponseError as err:
            _LOGGER.error("HTTP error from ABC Emergency API: %s %s", err.status, err.message)
            raise ABCEmergencyAPIError(f"HTTP error {err.status}: {err.message}") from err

        except ClientError as err:
            _LOGGER.error("Connection error to ABC Emergency API: %s", err)
            raise ABCEmergencyConnectionError(
                f"Connection error to ABC Emergency API: {err}"
            ) from err

        except json.JSONDecodeError as err:
            _LOGGER.error("Invalid JSON response from ABC Emergency API: %s", err)
            raise ABCEmergencyAPIError(
                f"Invalid JSON response from ABC Emergency API: {err}"
            ) from err

    async def async_get_emergencies_by_state(
        self,
        state: str,
    ) -> EmergencySearchResponse:
        """Fetch emergencies for a specific state.

        Args:
            state: The state code (e.g., "nsw", "vic", "qld").

        Returns:
            EmergencySearchResponse containing all emergencies in the state.

        Raises:
            ABCEmergencyConnectionError: If a connection error occurs.
            ABCEmergencyAPIError: If the API returns an error.
        """
        _LOGGER.debug("Fetching emergencies for state: %s", state)

        result = await self._async_request(
            "emergencySearch",
            params={"state": state.lower()},
        )

        return cast(EmergencySearchResponse, result)

    async def async_get_emergencies_by_geohash(
        self,
        geohashes: list[str],
    ) -> EmergencySearchResponse:
        """Fetch emergencies for geohash locations.

        Geohashes provide location-based filtering. Common Australian prefixes:
        - r1, r3, r4, r5, r6, r7 - NSW regions
        - r65 - Sydney metropolitan area

        Args:
            geohashes: List of geohash prefixes to search.

        Returns:
            EmergencySearchResponse containing emergencies in the specified areas.

        Raises:
            ABCEmergencyConnectionError: If a connection error occurs.
            ABCEmergencyAPIError: If the API returns an error.
        """
        _LOGGER.debug("Fetching emergencies for geohashes: %s", geohashes)

        # Format geohashes as JSON array string
        geohash_param = json.dumps(geohashes)

        result = await self._async_request(
            "emergencySearch",
            params={"geohashes": geohash_param},
        )

        return cast(EmergencySearchResponse, result)

    async def async_get_all_emergencies(self) -> EmergencyFeedResponse:
        """Fetch all emergencies across Australia.

        This returns all active emergencies from the emergency feed,
        which is useful for getting a complete picture of current incidents.

        Returns:
            EmergencyFeedResponse containing all active emergencies.

        Raises:
            ABCEmergencyConnectionError: If a connection error occurs.
            ABCEmergencyAPIError: If the API returns an error.
        """
        _LOGGER.debug("Fetching all emergencies from feed")

        result = await self._async_request("emergencyFeed")

        return cast(EmergencyFeedResponse, result)
