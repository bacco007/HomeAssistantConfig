"""Motis API client."""

import logging
from typing import Any

from aiohttp import (
    ClientError,
    ClientResponseError,
    ClientSession,
    ClientSSLError,
    ClientTimeout,
)

from custom_components.ha_departures.const import (
    GITHUB_REPO_URL,
    REQUEST_HEADER_JSON,
    VERSION,
)

from .data_classes import ApiCommand

logger = logging.getLogger(__name__)


class MotisApi:
    """Client for the Motis API."""

    def __init__(self, base_url: str, session: ClientSession | None = None) -> None:
        """Create an API instance.

        :param base_url: API base URL
        :type base_url: str
        :param session: Client session to use for requests
        :type session: ClientSession | None
        """
        logger.debug("Initializing MotisApi with base_url: %s", base_url)

        self.base_url = base_url
        self.session = session

    def __get_headers(self) -> dict[str, str]:
        return {
            "User-Agent": str(f"ha-departures/{VERSION} ({GITHUB_REPO_URL})"),
            "Accept": str(REQUEST_HEADER_JSON),
        }

    async def __send_get_request(
        self,
        url: str,
        session: ClientSession,
        headers: dict[str, str],
        timeout: ClientTimeout,
        params: dict[str, str] | None = None,
    ):
        logger.debug("Sending GET request to URL: %s with params: %s", url, params)
        logger.debug("Request headers: %s", headers)
        logger.debug("Request timeout: %s", timeout)

        try:
            async with session.get(
                url, params=params, headers=headers, timeout=timeout
            ) as response:
                response.raise_for_status()
                return await response.json()
        except ClientResponseError as e:
            logger.error("HTTP error %s for URL: %s", e.status, url)
            raise
        except (ClientError, ClientSSLError) as e:
            logger.error("Network error for URL: %s; Error: %s", url, str(e))
            raise

    async def get(
        self,
        command: ApiCommand,
        params: dict[str, str] | None = None,
        timeout: int = 10,
        retry: int = 0,
    ) -> Any:
        """Get data from the Motis API.

        :param command: Command to execute
        :type command: ApiCommand
        :param params: Parameters for the request
        :type params: dict[str, str] | None
        :param timeout: Timeout for the request in seconds. Default is 10 seconds.
        :type timeout: int
        :param retry: Number of retries to attempt in case of failure. Default is 0 retries.
        :type retry: int
        :return: Data from the API
        :rtype: Any

        :raises ClientResponseError: If an HTTP error occurs
        :raises ClientError: If a network error occurs
        :raises ClientSSLError: If an SSL error occurs

        """
        url = f"{self.base_url}/{command.value}"
        headers = self.__get_headers()

        _timeout = ClientTimeout(total=timeout)

        for attempt in range(retry + 1):
            try:
                if self.session:
                    return await self.__send_get_request(
                        url, self.session, headers, _timeout, params
                    )

                async with ClientSession() as session:
                    return await self.__send_get_request(
                        url, session, headers, _timeout, params
                    )
            except (ClientResponseError, ClientError, ClientSSLError):
                if attempt < retry:
                    logger.debug(
                        "Retrying request to '%s' (attempt %d of %d)",
                        url,
                        attempt + 1,
                        retry,
                    )
                else:
                    raise

        return (
            None  # This line is unreachable but added to satisfy function return type
        )
