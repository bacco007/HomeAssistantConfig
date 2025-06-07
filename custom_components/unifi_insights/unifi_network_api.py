"""UniFi Network API Client."""
from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Callable

from aiohttp import ClientError, ClientSession
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_create_clientsession

from .const import DEFAULT_API_HOST, UNIFI_API_HEADERS

_LOGGER = logging.getLogger(__name__)


class UnifiInsightsError(Exception):
    """Base class for UniFi Insights errors."""


class UnifiInsightsAuthError(UnifiInsightsError):
    """Authentication error."""


class UnifiInsightsConnectionError(UnifiInsightsError):
    """Connection error."""


class UnifiInsightsBackoff:
    """Class to implement exponential backoff."""

    def __init__(
        self,
        base_delay: float = 1.0,
        max_delay: float = 10.0,
        max_retries: int = 3,
    ):
        """Initialize backoff."""
        self._base_delay = base_delay
        self._max_delay = max_delay
        self._max_retries = max_retries
        self._tries = 0

    async def execute(self, func: Callable, *args: Any, **kwargs: Any) -> Any:
        """Execute function with backoff."""
        while True:
            try:
                return await func(*args, **kwargs)
            except Exception as err:  # pylint: disable=broad-except
                self._tries += 1
                if self._tries >= self._max_retries:
                    raise

                delay = min(
                    self._base_delay * (2 ** (self._tries - 1)),
                    self._max_delay,
                )
                _LOGGER.debug(
                    "Retrying %s in %.1f seconds after error: %s",
                    func.__name__,
                    delay,
                    err,
                )
                await asyncio.sleep(delay)


class UnifiInsightsRequestCache:
    """Cache for API requests."""

    def __init__(self, ttl: timedelta = timedelta(minutes=5)):
        """Initialize cache."""
        self._cache = {}
        self._ttl = ttl

    def get(self, key: str) -> Any | None:
        """Get item from cache."""
        if key not in self._cache:
            return None

        data, timestamp = self._cache[key]
        if datetime.now() - timestamp > self._ttl:
            del self._cache[key]
            return None

        return data

    def set(self, key: str, value: Any) -> None:
        """Set item in cache."""
        self._cache[key] = (value, datetime.now())


class UnifiInsightsClient:
    """UniFi Network API client."""

    def __init__(
        self,
        hass: HomeAssistant,
        api_key: str,
        host: str = DEFAULT_API_HOST,
        session: ClientSession | None = None,
        verify_ssl: bool = False,
    ) -> None:
        """Initialize the UniFi Network API client."""
        _LOGGER.debug("Initializing UniFi Network API client with host: %s", host)
        self._api_key = api_key
        self._host = host
        self._verify_ssl = verify_ssl

        if session:
            self._session = session
        else:
            self._session = async_create_clientsession(
                hass,
                verify_ssl=verify_ssl,
            )

        self._request_lock = asyncio.Lock()
        self._backoff = UnifiInsightsBackoff()
        self._cache = UnifiInsightsRequestCache()
        _LOGGER.info("UniFi Network API client initialized")

    @property
    def host(self) -> str:
        """Return the host address for the UniFi Network system."""
        return self._host

    async def _request(
        self,
        method: str,
        endpoint: str,
        use_cache: bool = False,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Make an API request."""
        cache_key = f"{method}_{endpoint}_{str(kwargs)}" if use_cache else None

        if use_cache:
            cached = self._cache.get(cache_key)
            if cached is not None:
                return cached

        async def _do_request() -> dict[str, Any]:
            async with self._request_lock:
                headers = {
                    **UNIFI_API_HEADERS,
                    "X-API-Key": self._api_key,
                }

                if "headers" in kwargs:
                    headers.update(kwargs.pop("headers"))

                url = f"{self._host}/proxy/network/integration{endpoint}"
                _LOGGER.debug("Making %s request to %s", method, url)

                try:
                    async with self._session.request(
                        method, url, headers=headers, ssl=self._verify_ssl, **kwargs
                    ) as resp:
                        _LOGGER.debug(
                            "Response received from %s - Status: %s",
                            endpoint,
                            resp.status
                        )

                        # Log raw response for debugging
                        try:
                            raw_data = await resp.text()
                            _LOGGER.debug("Raw response data: %s", raw_data)
                        except Exception as err:
                            _LOGGER.debug("Could not log raw response: %s", err)

                        if resp.status == 401:
                            raise UnifiInsightsAuthError("Invalid API key")
                        elif resp.status == 403:
                            raise UnifiInsightsAuthError("API key lacks permission")
                        elif resp.status == 404:
                            raise UnifiInsightsConnectionError(
                                f"Endpoint not found: {endpoint}"
                            )
                        elif resp.status >= 500:
                            raise UnifiInsightsConnectionError(
                                f"Server error: {resp.status}"
                            )

                        resp.raise_for_status()

                        try:
                            response_data = await resp.json()
                            _LOGGER.debug(
                                "Processed response from %s: %s",
                                endpoint,
                                json.dumps(response_data, indent=2)
                            )

                            if use_cache and cache_key:
                                self._cache.set(cache_key, response_data)

                            return response_data
                        except ValueError as err:
                            _LOGGER.error("Failed to parse JSON response: %s", err)
                            raise UnifiInsightsConnectionError(
                                "Invalid JSON response"
                            ) from err

                except asyncio.TimeoutError as err:
                    _LOGGER.error("Request timed out for %s: %s", url, err)
                    raise UnifiInsightsConnectionError(
                        f"Timeout connecting to {url}"
                    ) from err
                except ClientError as err:
                    _LOGGER.error("Connection error for %s: %s", url, err)
                    raise UnifiInsightsConnectionError(
                        f"Error connecting to {url}: {err}"
                    ) from err

        return await self._backoff.execute(_do_request)

    async def async_get_sites(self) -> list[dict[str, Any]]:
        """Get all sites."""
        _LOGGER.debug("Fetching all sites")
        try:
            response = await self._request("GET", "/v1/sites", use_cache=True)
            sites = response.get("data", [])

            # Log sites data
            _LOGGER.debug(
                "Sites data structure:\n%s",
                json.dumps([{
                    "id": site.get("id"),
                    "name": site.get("name"),
                    "description": site.get("description"),
                    "meta": site.get("meta", {})
                } for site in sites], indent=2)
            )

            _LOGGER.info("Successfully retrieved %d sites", len(sites))
            return sites
        except Exception as err:
            _LOGGER.error(
                "Failed to fetch sites: %s",
                err,
                exc_info=True
            )
            raise

    async def async_get_devices(self, site_id: str) -> list[dict[str, Any]]:
        """Get all devices for a site."""
        _LOGGER.debug("Fetching devices for site %s", site_id)
        try:
            response = await self._request("GET", f"/v1/sites/{site_id}/devices")
            devices = response.get("data", [])

            # Log each device's data structure
            for device in devices:
                _LOGGER.debug(
                    "Device data structure for %s:\n%s",
                    device.get("name", "Unknown"),
                    json.dumps(
                        {
                            "name": device.get("name"),
                            "model": device.get("model"),
                            "mac": device.get("macAddress"),
                            "ip": device.get("ipAddress"),
                            "state": device.get("state"),
                            "features": device.get("features", []),
                            "port_table": device.get("port_table", []),
                            "radio_table": device.get("radio_table", [])
                        },
                        indent=2
                    )
                )

            _LOGGER.info(
                "Successfully retrieved %d devices for site %s",
                len(devices),
                site_id
            )
            return devices
        except Exception as err:
            _LOGGER.error(
                "Failed to fetch devices for site %s: %s",
                site_id,
                err,
                exc_info=True
            )
            raise

    async def async_get_device_info(self, site_id: str, device_id: str) -> dict[str, Any]:
        """Get detailed device information."""
        _LOGGER.debug(
            "Fetching device info for device %s in site %s",
            device_id,
            site_id
        )
        try:
            response = await self._request(
                "GET",
                f"/v1/sites/{site_id}/devices/{device_id}"
            )
            _LOGGER.debug(
                "Device info for %s: %s",
                device_id,
                json.dumps(response, indent=2)
            )
            return response
        except Exception as err:
            _LOGGER.error(
                "Failed to fetch device info for device %s in site %s: %s",
                device_id,
                site_id,
                err
            )
            raise

    async def async_get_device_stats(
        self, site_id: str, device_id: str
    ) -> dict[str, Any]:
        """Get device statistics."""
        _LOGGER.debug(
            "Fetching statistics for device %s in site %s",
            device_id,
            site_id
        )
        try:
            response = await self._request(
                "GET",
                f"/v1/sites/{site_id}/devices/{device_id}/statistics/latest"
            )

            # Log complete statistics data
            _LOGGER.debug(
                "Complete statistics for device %s: %s",
                device_id,
                json.dumps(response, indent=2)
            )

            return response
        except Exception as err:
            _LOGGER.error(
                "Failed to fetch stats for device %s in site %s: %s",
                device_id,
                site_id,
                err,
                exc_info=True
            )
            raise

    async def async_get_clients(
        self,
        site_id: str,
        offset: int = 0,
        limit: int = 25
    ) -> list[dict[str, Any]]:
        """Get all clients for a site with pagination."""
        _LOGGER.debug(
            "Fetching clients for site %s (offset: %d, limit: %d)",
            site_id,
            offset,
            limit
        )
        try:
            response = await self._request(
                "GET",
                f"/v1/sites/{site_id}/clients",
                params={"offset": offset, "limit": limit}
            )
            clients = response.get("data", [])
            total_count = response.get("totalCount", 0)

            # If we have more clients than our current limit, fetch the rest
            if total_count > offset + limit:
                next_offset = offset + limit
                more_clients = await self.async_get_clients(
                    site_id,
                    offset=next_offset,
                    limit=limit
                )
                clients.extend(more_clients)

            _LOGGER.debug(
                "Retrieved %d clients for site %s",
                len(clients),
                site_id
            )
            return clients
        except Exception as err:
            _LOGGER.error(
                "Failed to fetch clients for site %s: %s",
                site_id,
                err
            )
            raise

    async def async_restart_device(self, site_id: str, device_id: str) -> bool:
        """Restart a device."""
        _LOGGER.debug(
            "Attempting to restart device %s in site %s",
            device_id,
            site_id
        )
        try:
            response = await self._request(
                "POST",
                f"/v1/sites/{site_id}/devices/{device_id}/actions",
                json={"action": "RESTART"}
            )
            success = response.get("status") == "OK"
            if success:
                _LOGGER.info(
                    "Successfully initiated restart for device %s in site %s",
                    device_id,
                    site_id
                )
            else:
                _LOGGER.error(
                    "Failed to restart device %s in site %s",
                    device_id,
                    site_id
                )
            return success
        except Exception as err:
            _LOGGER.error(
                "Error restarting device %s in site %s: %s",
                device_id,
                site_id,
                err
            )
            raise

    async def async_validate_api_key(self) -> bool:
        """Validate API key by fetching sites."""
        _LOGGER.debug("Validating API key")
        try:
            await self.async_get_sites()
            _LOGGER.info("API key validation successful")
            return True
        except UnifiInsightsAuthError:
            _LOGGER.error("API key validation failed")
            return False
        except Exception as err:
            _LOGGER.error("Unexpected error during API key validation: %s", err)
            return False