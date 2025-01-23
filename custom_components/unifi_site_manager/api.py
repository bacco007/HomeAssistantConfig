"""API Client for UniFi Site Manager."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any

import async_timeout
from aiohttp import ClientError, ClientResponse, ClientSession
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import DEFAULT_API_HOST, UNIFI_API_HEADERS

_LOGGER = logging.getLogger(__name__)

# First define the base exception class
class UnifiSiteManagerAPIError(Exception):
    """General API error."""

# Then define the subclasses
class UnifiSiteManagerServerError(UnifiSiteManagerAPIError):
    """API server error."""

class UnifiSiteManagerGatewayError(UnifiSiteManagerAPIError):
    """API gateway error."""

class UnifiSiteManagerConnectionError(UnifiSiteManagerAPIError):
    """API connection error."""

class UnifiSiteManagerAuthError(UnifiSiteManagerAPIError):
    """API authentication error."""

class UnifiSiteManagerRateLimitError(UnifiSiteManagerAPIError):
    """API rate limit error."""

class UnifiSiteManagerAPI:
    """UniFi Site Manager API client."""

    def __init__(
        self,
        hass: HomeAssistant,
        api_key: str,
        host: str = DEFAULT_API_HOST,
        session: ClientSession | None = None,
        rate_limit: int = 100,
        timeout: int = 10,
    ) -> None:
        """Initialize the API client."""
        self._hass = hass
        self._api_key = api_key
        self._host = host
        self._session = session or async_get_clientsession(hass)
        self._rate_limit_remaining = rate_limit
        self._request_timeout = timeout
        self._rate_limit_reset: datetime | None = None
        self._request_lock = asyncio.Lock()

    def _update_rate_limit(self, response: ClientResponse) -> None:
        """Update rate limit information from response headers."""
        if "X-RateLimit-Remaining" in response.headers:
            self._rate_limit_remaining = int(response.headers["X-RateLimit-Remaining"])
        if "X-RateLimit-Reset" in response.headers:
            self._rate_limit_reset = datetime.fromtimestamp(
                int(response.headers["X-RateLimit-Reset"])
            )

    async def _handle_rate_limit(self) -> None:
        """Handle rate limiting."""
        if self._rate_limit_remaining <= 0 and self._rate_limit_reset:
            wait_time = (self._rate_limit_reset - datetime.now()).total_seconds()
            if wait_time > 0:
                _LOGGER.warning(
                    "Rate limit reached. Waiting %s seconds before next request",
                    wait_time,
                )
                await asyncio.sleep(wait_time)

    async def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Make an API request with improved error handling."""
        async with self._request_lock:
            await self._handle_rate_limit()

            headers = {
                **UNIFI_API_HEADERS,
                "X-API-Key": self._api_key,
            }

            if "headers" in kwargs:
                headers.update(kwargs.pop("headers"))

            url = f"{self._host}{endpoint}"

            try:
                async with async_timeout.timeout(self._request_timeout):
                    async with self._session.request(
                        method,
                        url,
                        headers=headers,
                        **kwargs,
                    ) as resp:
                        self._update_rate_limit(resp)

                        # Enhanced error handling
                        if resp.status == 401:
                            raise ConfigEntryAuthFailed("Invalid API key")
                        elif resp.status == 429:
                            retry_after = int(resp.headers.get("Retry-After", 60))
                            _LOGGER.warning(
                                "Rate limit exceeded. Need to wait %s seconds",
                                retry_after
                            )
                            raise UnifiSiteManagerRateLimitError(
                                f"Rate limit exceeded, retry after {retry_after} seconds"
                            )
                        elif resp.status >= 500:
                            _LOGGER.error(
                                "Server error %s: %s", 
                                resp.status,
                                await resp.text()
                            )
                            raise UnifiSiteManagerServerError(
                                f"Server error: {resp.status}"
                            )
                        
                        resp.raise_for_status()
                        return await resp.json()

            except asyncio.TimeoutError as err:
                _LOGGER.error("Timeout requesting data from %s: %s", url, str(err))
                raise UnifiSiteManagerConnectionError(
                    f"Timeout error requesting data from {url}"
                ) from err

    async def async_get_sites(self) -> list[dict[str, Any]]:
        """Get all sites."""
        response = await self._request("GET", "/ea/sites")
        return response.get("data", [])

    async def async_get_devices(
        self,
        host_ids: list[str] | None = None,
        time: datetime | None = None,
    ) -> list[dict[str, Any]]:
        """Get all devices managed by hosts."""
        params = {}
        if host_ids:
            params["hostIds[]"] = host_ids
        if time:
            params["time"] = time.isoformat()
        
        try:
            response = await self._request("GET", "/ea/devices", params=params)
            return response.get("data", [])
        except Exception as err:
            _LOGGER.error("Error getting devices data: %s", err)
            return []

    async def async_get_hosts(self) -> list[dict[str, Any]]:
        """Get all hosts."""
        response = await self._request("GET", "/ea/hosts")
        return response.get("data", [])

    async def async_get_host(self, host_id: str) -> dict[str, Any]:
        """Get host by ID."""
        response = await self._request("GET", f"/ea/hosts/{host_id}")
        return response.get("data", {})

    async def async_get_isp_metrics(
        self,
        metric_type: str,
        site_id: str | None = None,
        begin_timestamp: datetime | None = None,
        end_timestamp: datetime | None = None,
        duration: str | None = None,
    ) -> list[dict[str, Any]]:
        """Get ISP metrics.
        
        Args:
            metric_type: Either '5m' or '1h'
            site_id: Optional site ID to filter results
            duration: Time duration ('24h' for 5m metrics, '7d' or '30d' for 1h metrics)
        """
        try:
            # Use duration parameter as documented
            params = {"duration": "24h" if metric_type == "5m" else "7d"}
            
            _LOGGER.debug(
                "Getting metrics with type=%s, params=%s, site_id=%s",
                metric_type,
                params,
                site_id
            )
            
            response = await self._request(
                "GET",
                f"/ea/isp-metrics/{metric_type}",
                params=params,
            )
            
            _LOGGER.debug("Raw API response: %s", response)
            
            metrics = response.get("data", [])
            _LOGGER.debug("Extracted metrics data: %s", metrics)
            
            # If we have a site_id, filter the results
            if site_id:
                _LOGGER.debug("Filtering metrics for site_id: %s", site_id)
                metrics = [
                    metric for metric in metrics 
                    if metric.get("siteId") == site_id
                ]
                
            _LOGGER.debug("Got %d metrics after filtering", len(metrics))
            return metrics
            
        except UnifiSiteManagerAPIError as err:
            _LOGGER.error("Error getting metrics: %s", err)
            return []

    async def async_validate_api_key(self) -> bool:
        """Validate API key by making a test request."""
        try:
            await self.async_get_sites()
            return True
        except (UnifiSiteManagerAuthError, ConfigEntryAuthFailed):
            return False