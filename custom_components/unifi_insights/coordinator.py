"""Data update coordinator for UniFi Insights."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)

from .api import (
    UnifiInsightsAuthError,
    UnifiInsightsClient,
    UnifiInsightsConnectionError,
)
from .const import DOMAIN, SCAN_INTERVAL_NORMAL

_LOGGER = logging.getLogger(__name__)


class UnifiInsightsDataUpdateCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Class to manage fetching UniFi Insights data."""

    config_entry: ConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        api: UnifiInsightsClient,
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
        self.data = {
            "sites": {},
            "devices": {},
            "clients": {},
            "stats": {},
            "last_update": None,
        }

    def get_site(self, site_id: str) -> dict[str, Any] | None:
        """Get site data by site ID."""
        return self.data.get("sites", {}).get(site_id)

    def get_device(self, site_id: str, device_id: str) -> dict[str, Any] | None:
        """Get device data by site ID and device ID."""
        return self.data.get("devices", {}).get(site_id, {}).get(device_id)

    def get_device_stats(self, site_id: str, device_id: str) -> dict[str, Any] | None:
        """Get device statistics by site ID and device ID."""
        return self.data.get("stats", {}).get(site_id, {}).get(device_id)

    async def _process_device(
        self, site_id: str, device: dict[str, Any], clients: list[dict[str, Any]]
    ) -> tuple[str, dict[str, Any], dict[str, Any]]:
        """Process a single device and its stats."""
        device_id = device["id"]
        device_name = device.get("name", device_id)

        try:
            # Get device info and stats in parallel
            info_task = self.api.async_get_device_info(site_id, device_id)
            stats_task = self.api.async_get_device_stats(site_id, device_id)
            device_info, stats = await asyncio.gather(info_task, stats_task)

            # Update device info
            device.update(device_info)

            # Add client data and device info to stats
            if stats is not None:
                stats["clients"] = [
                    c for c in clients if c.get("uplinkDeviceId") == device_id
                ]
                stats["id"] = device_id
            else:
                stats = {}

            return device_id, device, stats

        except Exception as err:
            _LOGGER.error(
                "Error processing device %s (%s): %s",
                device_name,
                device_id,
                err
            )
            return device_id, device, {}

    async def _process_site(self, site_id: str) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]] | None:
        """Process a single site's devices and clients."""
        try:
            # Get devices and clients in parallel
            devices_task = self.api.async_get_devices(site_id)
            clients_task = self.api.async_get_clients(site_id)
            devices, clients = await asyncio.gather(devices_task, clients_task)

            # Process devices in parallel
            tasks = [
                self._process_device(site_id, device, clients)
                for device in devices
            ]
            results = await asyncio.gather(*tasks)

            # Organize results
            devices_dict = {}
            stats_dict = {}
            for device_id, device, stats in results:
                devices_dict[device_id] = device
                stats_dict[device_id] = stats

            clients_dict = {client["id"]: client for client in clients}

            return devices_dict, stats_dict, clients_dict

        except Exception as err:
            _LOGGER.error(
                "Error processing site %s: %s",
                site_id,
                err,
                exc_info=True
            )
            return None

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from API."""
        try:
            # Get all sites first
            sites = await self.api.async_get_sites()
            self.data["sites"] = {site["id"]: site for site in sites}

            # Process all sites in parallel
            tasks = [
                self._process_site(site_id) for site_id in self.data["sites"]
            ]
            results = await asyncio.gather(*tasks)

            # Update data structure with results
            for site_id, result in zip(self.data["sites"], results):
                if result is not None:
                    devices_dict, stats_dict, clients_dict = result
                    self.data["devices"][site_id] = devices_dict
                    self.data["stats"][site_id] = stats_dict
                    self.data["clients"][site_id] = clients_dict

                    _LOGGER.debug(
                        "Successfully processed site %s with %d devices and %d clients",
                        site_id,
                        len(devices_dict),
                        len(clients_dict)
                    )

            self._available = True
            self.data["last_update"] = datetime.now()
            return self.data

        except UnifiInsightsAuthError as err:
            self._available = False
            raise ConfigEntryAuthFailed from err
        except UnifiInsightsConnectionError as err:
            self._available = False
            raise UpdateFailed(f"Error communicating with API: {err}") from err
        except Exception as err:
            self._available = False
            _LOGGER.error("Unexpected error updating data: %s", err, exc_info=True)
            raise UpdateFailed(f"Error updating data: {err}") from err

    @property
    def available(self) -> bool:
        """Return coordinator availability."""
        return self._available