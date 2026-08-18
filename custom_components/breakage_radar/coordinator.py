"""Fetches the published breakage index and matches it against this system."""

from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import Iterable
from datetime import UTC, datetime
from typing import Any

import aiohttp
from homeassistant import const as ha_const
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    ALERT_WINDOW_DAYS,
    DOMAIN,
    FETCH_TIMEOUT,
    INDEX_URL,
    UPDATE_INTERVAL,
)
from .discovery import discover_installed
from .report import build_report, validate_index
from .scanner import scan_installed

_LOGGER = logging.getLogger(__name__)


class BreakageRadarCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Keeps the local breakage report up to date.

    On a fetch failure the last good report is kept in ``self.data`` and
    ``last_update_success`` goes false, which makes the sensor unavailable
    instead of raising or reporting stale data as fresh.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        index_url: str = INDEX_URL,
        alert_window_days: int = ALERT_WINDOW_DAYS,
        ignored_domains: Iterable[str] = (),
    ) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=UPDATE_INTERVAL,
        )
        self.index_url = index_url
        self.alert_window_days = alert_window_days
        self.ignored_domains = tuple(ignored_domains)
        self.last_error: str | None = None
        self._index: dict[str, Any] | None = None
        #: ``domain -> (signature, result)``; lets the 12-hourly refresh skip
        #: re-parsing any integration whose files and rules have not changed.
        self._scan_cache: dict[str, Any] = {}
        #: Last completed local scan. Updates never wait for a scan; see
        #: async_run_local_scan (and issue #1) for why.
        self._local_scan: dict[str, Any] | None = None
        self._installed: dict[str, str] = {}
        self._scan_lock = asyncio.Lock()

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
        except TimeoutError as err:
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

        # Discovery is one scandir plus a manifest.json per component, cheap
        # enough to do inline. The scan is not, so it goes to the background
        # and this update returns with whatever the last scan produced.
        self._installed = await self.hass.async_add_executor_job(
            discover_installed, self.hass.config.path("custom_components")
        )
        self._schedule_local_scan()
        return self._compose(index, self._installed, self._local_scan)

    def _compose(
        self,
        index: dict[str, Any],
        installed: dict[str, str],
        local_scan: dict[str, Any] | None,
    ) -> dict[str, Any]:
        current_version = getattr(ha_const, "__version__", "") or index.get(
            "core_version", ""
        )
        report = build_report(
            index,
            installed,
            local_scan,
            current_version=current_version,
            today=datetime.now(UTC).date(),
            alert_window_days=self.alert_window_days,
            ignored_domains=self.ignored_domains,
        )
        _LOGGER.debug(
            "Breakage Radar: %d of %d custom integrations affected "
            "(%d broken now, %d imminent, %d summarised; "
            "%d file(s) scanned locally, %d cached)",
            report["affected_count"],
            report["installed_count"],
            report["broken_now_count"],
            report["imminent_count"],
            len(report["summarised_domains"]),
            report["files_scanned"],
            (local_scan or {}).get("cached_domains", 0),
        )
        return report

    def _schedule_local_scan(self) -> None:
        create = getattr(self.hass, "async_create_background_task", None)
        if create is not None:
            create(self.async_run_local_scan(), name=f"{DOMAIN}_local_scan")
        else:  # pragma: no cover - cores older than 2022.10
            self.hass.async_create_task(self.async_run_local_scan())

    async def async_run_local_scan(self) -> None:
        """Scan the installed source in the background, then publish.

        Parsing every installed integration can take minutes on a slow box,
        and config entry setup waits on the first update, so the scan must
        never run inside one (issue #1: setup cancelled mid-scan). Instead the
        sensor starts with index-only results and this replaces them when the
        scan lands. The per-domain mtime cache makes repeat runs cheap, so it
        is fine to do this on every refresh.
        """
        async with self._scan_lock:
            index = self._index
            if index is None:
                return
            current_version = getattr(ha_const, "__version__", "") or index.get(
                "core_version", ""
            )
            scan = await self.hass.async_add_executor_job(
                self._scan_local,
                self.hass.config.path("custom_components"),
                index,
                current_version,
            )
            if scan is None:
                return  # failure already logged; keep the previous results
            self._local_scan = scan
            self.async_set_updated_data(
                self._compose(index, self._installed, scan)
            )

    def _scan_local(
        self, components_dir: str, index: dict[str, Any], current_version: str
    ) -> dict[str, Any] | None:
        """Run the local source scan. Blocking -- called from the executor.

        The scan itself swallows per-file problems; anything unexpected beyond
        that degrades to index-only matching rather than losing the report.
        """
        try:
            return scan_installed(
                components_dir,
                index.get("rules", []),
                current_version=current_version,
                cache=self._scan_cache,
            )
        except Exception:  # noqa: BLE001 - a scan bug must never kill the sensor
            _LOGGER.exception(
                "Local source scan failed; falling back to index-only matching"
            )
            return None
