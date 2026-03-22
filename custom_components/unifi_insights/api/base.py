"""Base async client for UniFi APIs."""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from http import HTTPStatus
from types import TracebackType
from typing import Any, Self

import aiohttp
from yarl import URL

from .auth import ApiKeyAuth, LocalAuth
from .const import (
    CONTENT_TYPE_JSON,
    DEFAULT_CONNECT_TIMEOUT,
    DEFAULT_RATE_LIMIT_RETRY_AFTER,
    DEFAULT_TIMEOUT,
    HEADER_ACCEPT,
    HEADER_CONTENT_TYPE,
    HEADER_USER_AGENT,
    USER_AGENT,
)
from .exceptions import (
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiNotFoundError,
    UniFiRateLimitError,
    UniFiResponseError,
    UniFiTimeoutError,
)

_LOGGER = logging.getLogger(__name__)


class BaseUniFiClient(ABC):
    """
    Base async client for UniFi API interactions.

    This class provides common functionality for both Network and Protect APIs.
    """

    def __init__(
        self,
        auth: ApiKeyAuth | LocalAuth,
        base_url: str,
        *,
        session: aiohttp.ClientSession | None = None,
        timeout: int = DEFAULT_TIMEOUT,
        connect_timeout: int = DEFAULT_CONNECT_TIMEOUT,
    ) -> None:
        """
        Initialize the base client.

        Args:
            auth: Authentication configuration.
            base_url: Base URL for the API.
            session: Optional aiohttp session to reuse.
            timeout: Request timeout in seconds.
            connect_timeout: Connection timeout in seconds.

        """
        self._auth = auth
        self._base_url = URL(base_url)
        self._session = session
        self._owns_session = session is None
        self._timeout = aiohttp.ClientTimeout(
            total=timeout,
            connect=connect_timeout,
        )
        self._closed = False

    @property
    def base_url(self) -> URL:
        """Return the base URL."""
        return self._base_url

    @property
    def closed(self) -> bool:
        """Return whether the client is closed."""
        return self._closed

    async def _ensure_session(self) -> aiohttp.ClientSession:
        """
        Ensure an aiohttp session exists.

        Returns:
            The aiohttp session.

        """
        if self._session is None or self._session.closed:
            connector = aiohttp.TCPConnector(
                ssl=self._get_ssl_context(),
            )
            self._session = aiohttp.ClientSession(
                connector=connector,
                timeout=self._timeout,
            )
            self._owns_session = True
        return self._session

    def _get_ssl_context(self) -> bool:
        """
        Get SSL context based on auth configuration.

        Returns:
            SSL verification setting.

        """
        if isinstance(self._auth, LocalAuth):
            return self._auth.verify_ssl
        return True

    def _get_headers(self) -> dict[str, str]:
        """
        Get default headers for requests.

        Returns:
            Dictionary of headers.

        """
        headers = {
            HEADER_USER_AGENT: USER_AGENT,
            HEADER_CONTENT_TYPE: CONTENT_TYPE_JSON,
            HEADER_ACCEPT: CONTENT_TYPE_JSON,
        }
        headers.update(self._auth.get_headers())
        return headers

    def _build_url(self, path: str) -> URL:
        """
        Build full URL from path.

        Args:
            path: API path (should start with /).

        Returns:
            Full URL.

        """
        return self._base_url / path.lstrip("/")

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> dict[str, Any] | list[Any] | None:
        """
        Make an HTTP request to the API.

        Args:
            method: HTTP method.
            path: API path.
            params: Query parameters.
            json_data: JSON body data.
            headers: Additional headers.

        Returns:
            Response data as dict, list, or None.

        Raises:
            UniFiAuthenticationError: If authentication fails.
            UniFiConnectionError: If connection fails.
            UniFiNotFoundError: If resource not found.
            UniFiRateLimitError: If rate limited.
            UniFiResponseError: If API returns an error.
            UniFiTimeoutError: If request times out.

        """
        session = await self._ensure_session()
        url = self._build_url(path)

        request_headers = self._get_headers()
        if headers:
            request_headers.update(headers)

        _LOGGER.debug(
            "Making %s request to %s",
            method,
            url,
        )

        try:
            async with session.request(
                method,
                url,
                params=params,
                json=json_data,
                headers=request_headers,
            ) as response:
                return await self._handle_response(response)

        except aiohttp.ClientConnectorError as err:
            raise UniFiConnectionError(f"Failed to connect to {url}: {err}") from err
        except TimeoutError as err:
            raise UniFiTimeoutError(f"Request to {url} timed out") from err
        except aiohttp.ClientError as err:
            raise UniFiConnectionError(f"Request to {url} failed: {err}") from err

    async def _handle_response(
        self,
        response: aiohttp.ClientResponse,
    ) -> dict[str, Any] | list[Any] | None:
        """
        Handle API response.

        Args:
            response: The aiohttp response.

        Returns:
            Response data.

        Raises:
            UniFiAuthenticationError: If authentication fails.
            UniFiNotFoundError: If resource not found.
            UniFiRateLimitError: If rate limited.
            UniFiResponseError: If API returns an error.

        """
        status = response.status
        response_text = await response.text()

        _LOGGER.debug(
            "Response status: %s, body: %s",
            status,
            response_text[:500] if response_text else "empty",
        )

        if status == HTTPStatus.UNAUTHORIZED:
            raise UniFiAuthenticationError("Authentication failed. Check your API key.")

        if status == HTTPStatus.FORBIDDEN:
            raise UniFiAuthenticationError(
                "Access forbidden. Check your API key permissions."
            )

        if status == HTTPStatus.NOT_FOUND:
            raise UniFiNotFoundError(
                "Resource not found",
                status_code=status,
                response_body=response_text,
            )

        if status == HTTPStatus.TOO_MANY_REQUESTS:
            retry_after = response.headers.get("Retry-After")
            raise UniFiRateLimitError(
                "Rate limited by API",
                status_code=status,
                response_body=response_text,
                retry_after=int(retry_after)
                if retry_after
                else DEFAULT_RATE_LIMIT_RETRY_AFTER,
            )

        if status >= HTTPStatus.BAD_REQUEST:
            raise UniFiResponseError(
                f"API error: {response_text}",
                status_code=status,
                response_body=response_text,
            )

        if not response_text:
            return None

        try:
            data: dict[str, Any] | list[Any] = await response.json()
            return data
        except (ValueError, aiohttp.ContentTypeError):
            _LOGGER.warning("Response is not JSON: %s", response_text[:200])
            return None

    async def _get(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any] | list[Any] | None:
        """
        Make a GET request.

        Args:
            path: API path.
            params: Query parameters.

        Returns:
            Response data.

        """
        return await self._request("GET", path, params=params)

    async def _post(
        self,
        path: str,
        *,
        json_data: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any] | list[Any] | None:
        """
        Make a POST request.

        Args:
            path: API path.
            json_data: JSON body data.
            params: Query parameters.

        Returns:
            Response data.

        """
        return await self._request("POST", path, json_data=json_data, params=params)

    async def _put(
        self,
        path: str,
        *,
        json_data: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any] | list[Any] | None:
        """
        Make a PUT request.

        Args:
            path: API path.
            json_data: JSON body data.
            params: Query parameters.

        Returns:
            Response data.

        """
        return await self._request("PUT", path, json_data=json_data, params=params)

    async def _patch(
        self,
        path: str,
        *,
        json_data: dict[str, Any] | None = None,
    ) -> dict[str, Any] | list[Any] | None:
        """
        Make a PATCH request.

        Args:
            path: API path.
            json_data: JSON body data.

        Returns:
            Response data.

        """
        return await self._request("PATCH", path, json_data=json_data)

    async def _delete(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any] | list[Any] | None:
        """
        Make a DELETE request.

        Args:
            path: API path.
            params: Query parameters.

        Returns:
            Response data.

        """
        return await self._request("DELETE", path, params=params)

    @abstractmethod
    async def validate_connection(self) -> bool:
        """
        Validate the connection to the API.

        Returns:
            True if connection is valid.

        """

    async def close(self) -> None:
        """Close the client session."""
        if self._session and self._owns_session and not self._session.closed:
            await self._session.close()
        self._closed = True

    async def __aenter__(self) -> Self:
        """Enter async context manager."""
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        """Exit async context manager."""
        await self.close()
