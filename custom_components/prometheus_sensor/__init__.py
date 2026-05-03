from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
import logging
from typing import TYPE_CHECKING, Final, Optional
from urllib.parse import urljoin

import aiohttp

from homeassistant.const import STATE_PROBLEM, STATE_UNKNOWN
from homeassistant.helpers.reload import async_setup_reload_service

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, PLATFORMS

_LOGGER: Final = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the prometheus-sensor integration."""
    await async_setup_reload_service(hass, DOMAIN, PLATFORMS)
    return True


@dataclass(frozen=True)
class QueryResult:
    value: Optional[float] = None
    error: Optional[str] = None


class Prometheus:
    """Wrapper for Prometheus API Requests."""

    def __init__(
        self,
        url: str,
        session: aiohttp.ClientSession,
        headers: Mapping[str, str] | None = None,
    ) -> None:
        """Initialize the Prometheus API wrapper."""
        self._session = session
        self._url = urljoin(f"{url}/", "api/v1/query")
        self._headers = headers

    async def query(self, expr: str) -> QueryResult:
        """Query expression response."""
        try:
            response = await self._session.get(
                self._url, params={"query": expr}, headers=self._headers
            )
        except aiohttp.ClientError as error:
            _LOGGER.error("Error querying %s: %s", self._url, error)
            return QueryResult(error=STATE_PROBLEM)

        if response.status != 200:
            _LOGGER.error(
                "Unexpected HTTP status code %s for expression '%s'",
                response.status,
                expr,
            )
            return QueryResult(error=STATE_UNKNOWN)

        try:
            result = (await response.json())["data"]["result"]
        except (ValueError, KeyError) as error:
            _LOGGER.error("Invalid query response: %s", error)
            return QueryResult(error=STATE_UNKNOWN)

        if not result:
            _LOGGER.error("Expression '%s' yielded no result", expr)
            return QueryResult(error=STATE_PROBLEM)
        elif len(result) > 1:
            _LOGGER.error("Expression '%s' yielded multiple metrics", expr)
            return QueryResult(error=STATE_PROBLEM)

        value = float(result[0]["value"][1])

        _LOGGER.debug("Expression '%s' yields result %f", expr, value)

        return QueryResult(value)
