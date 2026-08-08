"""Fetches the published breakage index and matches it against this system."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN, FETCH_TIMEOUT, INDEX_URL, UPDATE_INTERVAL
from .report import build_report, discover_installed, validate_index

_LOGGER = logging.getLogger(__name__)


class BreakageRadarCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Keeps the local breakage report up to date.

    On a fetch failure the last good report is kept in ``self.data`` and
    ``last_update_success`` goes false, which makes the sensor unavailable
    instead of raising or reporting stale data as fresh.
    """

    def __init__(self, hass: HomeAssistant, index_url: str = INDEX_URL) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=UPDATE_INTERVAL,
        )
        self.index_url = index_url
        self.last_error: str | None = None
        self._index: dict[str, Any] | None = None

    async def _fetch_index(self) -> dict[str, Any]:
        session = async_get_clientsession(self.hass)
        try:
            async with session.get(
                self.index_url,
                timeout=aiohttp.ClientTimeout(total=FETCH_TIMEOUT),
                headers={"Accept": "application/json"},
            ) as response:
                if response.status == 429:
                    raise UpdateFailed(
                        "Breakage Radar index is rate limited (HTTP 429); "
                        "keeping the previous report"
                    )
                if response.status != 200:
                    raise UpdateFailed(
                        f"Breakage Radar index returned HTTP {response.status} "
                        f"for {self.index_url}"
                    )
                body = await response.text()
        except asyncio.TimeoutError as err:
            raise UpdateFailed(
                f"Timed out after {FETCH_TIMEOUT}s fetching {self.index_url}"
            ) from err
        except aiohttp.ClientError as err:
            raise UpdateFailed(
                f"Could not reach {self.index_url}: {err}"
            ) from err

        try:
            payload = json.loads(body)
        except ValueError as err:
            raise UpdateFailed(f"Index at {self.index_url} is not valid JSON: {err}") from err

        problem = validate_index(payload)
        if problem:
            raise UpdateFailed(f"Index at {self.index_url} is unusable: {problem}")
        return payload

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            index = await self._fetch_index()
        except UpdateFailed as err:
            self.last_error = str(err)
            if self._index is None:
                # Nothing cached yet -- there is genuinely no report to give.
                raise
            _LOGGER.warning(
                "%s; reusing the index fetched earlier and marking the sensor "
                "unavailable",
                err,
            )
            raise

        self.last_error = None
        self._index = index

        installed = await self.hass.async_add_executor_job(
            discover_installed, self.hass.config.path("custom_components")
        )
        report = build_report(index, installed)
        _LOGGER.debug(
            "Breakage Radar: %d of %d custom integrations affected",
            report["affected_count"],
            report["installed_count"],
        )
        return report
