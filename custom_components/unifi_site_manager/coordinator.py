"""Data update coordinator for UniFi Site Manager integration."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import (
    UnifiSiteManagerAPI,
    UnifiSiteManagerAPIError,
    UnifiSiteManagerAuthError,
    UnifiSiteManagerConnectionError,
    UnifiSiteManagerRateLimitError,
)
from .const import (
    DOMAIN,
    SCAN_INTERVAL_METRICS,
    SCAN_INTERVAL_NORMAL,
    METRIC_TYPE_5M,
)

_LOGGER = logging.getLogger(__name__)


class UnifiSiteManagerDataUpdateCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Class to manage fetching UniFi Site Manager data."""

    config_entry: ConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        api: UnifiSiteManagerAPI,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=SCAN_INTERVAL_NORMAL,
        )
        self.api = api
        self.config_entry = entry
        self._available = True
        self.data: dict[str, Any] = {
            "sites": {},
            "hosts": {},
            "metrics": {},
            "devices": {}, 
            "last_update": None,
        }
        self._metric_update_lock = asyncio.Lock()
        self._site_update_lock = asyncio.Lock()
        self._host_update_lock = asyncio.Lock()
        self._device_update_lock = asyncio.Lock()

    async def _async_update_sites(self) -> None:
        """Update sites data."""
        async with self._site_update_lock:
            try:
                sites = await self.api.async_get_sites()
                self.data["sites"] = {site["siteId"]: site for site in sites}
                _LOGGER.debug("Updated %s sites", len(sites))
            except UnifiSiteManagerAuthError as err:
                self._available = False
                raise ConfigEntryAuthFailed from err
            except UnifiSiteManagerAPIError as err:
                self._available = False
                raise UpdateFailed(f"Error updating sites: {err}") from err

    async def _async_update_hosts(self) -> None:
        """Update hosts data."""
        async with self._host_update_lock:
            try:
                hosts = await self.api.async_get_hosts()
                self.data["hosts"] = {host["id"]: host for host in hosts}
                _LOGGER.debug("Updated %s hosts", len(hosts))
            except UnifiSiteManagerAPIError as err:
                self._available = False
                raise UpdateFailed(f"Error updating hosts: {err}") from err

    async def _async_update_devices(self) -> None:
        """Update devices data."""
        async with self._device_update_lock:
            try:
                # Get list of host IDs to query
                host_ids = list(self.data["hosts"].keys())
                
                devices_data = await self.api.async_get_devices(host_ids=host_ids)
                
                # Process and organize device data by host
                devices = {}
                for device_group in devices_data:
                    # Each device group contains devices for a specific host
                    for device in device_group.get("devices", []):
                        device_id = device.get("mac")  # Use MAC as unique identifier
                        if device_id:
                            devices[device_id] = device
                
                self.data["devices"] = devices
                _LOGGER.debug("Updated %s devices", len(devices))
                
            except Exception as err:
                self._available = False
                raise UpdateFailed(f"Error updating devices: {err}") from err

    async def _async_update_metrics(self) -> None:
        """Update ISP metrics data."""
        async with self._metric_update_lock:
            try:
                # Use timezone-aware datetime
                end_time = datetime.now(timezone.utc)
                start_time = end_time - SCAN_INTERVAL_METRICS

                metrics = {}
                for site_id in self.data["sites"]:
                    try:
                        site_metrics = await self.api.async_get_isp_metrics(
                            METRIC_TYPE_5M,
                            site_id=site_id,
                            begin_timestamp=start_time,
                            end_timestamp=end_time,
                        )
                        if site_metrics:
                            metrics[site_id] = site_metrics
                    except UnifiSiteManagerRateLimitError as err:
                        _LOGGER.warning(
                            "Rate limit reached while updating metrics for site %s: %s",
                            site_id,
                            err,
                        )
                        continue
                    except UnifiSiteManagerAPIError as err:
                        _LOGGER.error(
                            "Error updating metrics for site %s: %s",
                            site_id,
                            err,
                        )
                        continue

                self.data["metrics"] = metrics
                _LOGGER.debug("Updated metrics for %s sites", len(metrics))

            except UnifiSiteManagerAPIError as err:
                self._available = False
                raise UpdateFailed(f"Error updating metrics: {err}") from err

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from API."""
        try:
            # Update sites first as we need site IDs for metrics
            await self._async_update_sites()
            
            # Update hosts and metrics concurrently
            await asyncio.gather(
                self._async_update_hosts(),
                self._async_update_devices(),
                self._async_update_metrics(),
            )

            self._available = True
            self.data["last_update"] = datetime.now(timezone.utc)
            return self.data

        except UnifiSiteManagerConnectionError as err:
            self._available = False
            raise UpdateFailed(f"Connection error: {err}") from err
        except Exception as err:  # pylint: disable=broad-except
            self._available = False
            _LOGGER.exception("Unexpected error updating coordinator")
            raise UpdateFailed(f"Unexpected error: {err}") from err

    async def async_refresh_metrics(self) -> None:
        """Refresh only the metrics data."""
        await self._async_update_metrics()
        self.async_update_listeners()

    @property
    def available(self) -> bool:
        """Return coordinator availability."""
        return self._available

    def get_host(self, host_id: str) -> dict[str, Any] | None:
        """Get host data by ID."""
        return self.data.get("hosts", {}).get(host_id)

    def get_site(self, site_id: str) -> dict[str, Any] | None:
        """Get site data by ID."""
        return self.data.get("sites", {}).get(site_id)

    def get_device(self, device_id: str) -> dict[str, Any] | None:
        """Get device data by ID (MAC address)."""
        return self.data.get("devices", {}).get(device_id)

    def validate_site_data(self, site_id: str) -> bool:
        """Validate site data exists and has required fields."""
        if not self.data.get("sites"):
            return False
        site_data = self.data["sites"].get(site_id)
        if not site_data:
            return False
        required_fields = ["meta", "statistics"]
        return all(field in site_data for field in required_fields)

    def get_site_metrics(self, site_id: str) -> list[dict[str, Any]]:
        """Return the stored metrics list for a given site with validation."""
        if not self.validate_site_data(site_id):
            _LOGGER.warning("Invalid site_id or missing site data: %s", site_id)
            return []
        return self.data["metrics"].get(site_id, [])

    @property
    def site_metrics(self) -> dict[str, Any] | None:
        """Get site metrics."""
        if not self._site_id:
            return None
                
        metrics = self.coordinator.get_site_metrics(self._site_id)
        if not metrics or not isinstance(metrics, list) or not metrics:
            return None

        # Get first metric set
        metric_set = metrics[0]
        if not metric_set.get("periods"):
            return None
                
        # Get the most recent period's data
        periods = metric_set["periods"]
        if not periods:
            return None

        latest_period = periods[0]
        return latest_period.get("data", {})