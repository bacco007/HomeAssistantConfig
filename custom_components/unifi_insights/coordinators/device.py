"""Device coordinator for UniFi Insights - handles fast-changing device data."""

from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from homeassistant.helpers import device_registry as dr
from unifi_official_api import (
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiResponseError,
    UniFiTimeoutError,
)

from custom_components.unifi_insights.const import DOMAIN, SCAN_INTERVAL_DEVICE

from .base import UnifiBaseCoordinator

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant
    from unifi_official_api.network import UniFiNetworkClient
    from unifi_official_api.protect import UniFiProtectClient

    from .config import UnifiConfigCoordinator

_LOGGER = logging.getLogger(__name__)


class UnifiDeviceCoordinator(UnifiBaseCoordinator):
    """
    Coordinator for fast-changing device data (30 second updates).

    Handles:
    - Device online status
    - Device statistics (CPU, memory, uptime)
    - Client connections
    - Port statistics
    """

    def __init__(
        self,
        hass: HomeAssistant,
        network_client: UniFiNetworkClient,
        protect_client: UniFiProtectClient | None,
        entry: ConfigEntry,
        config_coordinator: UnifiConfigCoordinator,
    ) -> None:
        """Initialize the device coordinator."""
        super().__init__(
            hass=hass,
            network_client=network_client,
            protect_client=protect_client,
            entry=entry,
            name="device",
            update_interval=SCAN_INTERVAL_DEVICE,
        )
        self.config_coordinator = config_coordinator
        # Track previous device IDs for stale device cleanup (Gold requirement)
        self._previous_network_device_ids: set[str] = set()
        self.data: dict[str, Any] = {
            "devices": {},
            "clients": {},
            "stats": {},
            "vouchers": {},
            "last_update": None,
        }

    async def _process_device(
        self, site_id: str, device_dict: dict[str, Any], clients: list[dict[str, Any]]
    ) -> tuple[str, dict[str, Any], dict[str, Any]]:
        """Process a single device and its stats."""
        device_id = device_dict.get("id")
        device_name = device_dict.get("name", device_id)

        try:
            # Get device statistics
            stats_model = await self.network_client.devices.get_statistics(
                site_id, device_id=device_id
            )
            stats = self._model_to_dict(stats_model) if stats_model else {}

            # Add client data to stats
            if stats:
                # Use camelCase uplinkDeviceId as returned by model_dump(by_alias=True)
                stats["clients"] = [
                    c
                    for c in clients
                    if (c.get("uplinkDeviceId") or c.get("uplink_device_id"))
                    == device_id
                ]
                stats["id"] = device_id

            return device_id, device_dict, stats  # noqa: TRY300

        except Exception as err:  # noqa: BLE001
            _LOGGER.debug(
                "Error getting stats for device %s (%s): %s",
                device_name,
                device_id,
                err,
            )
            return device_id, device_dict, {}

    async def _process_site(
        self, site_id: str
    ) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]] | None:
        """Process a single site's devices and clients."""
        try:
            # Get devices and clients in parallel using new API
            devices_task = self.network_client.devices.get_all(site_id)
            clients_task = self.network_client.clients.get_all(site_id)
            devices_models, clients_models = await asyncio.gather(
                devices_task, clients_task
            )

            # Convert model objects to dictionaries
            devices = [self._model_to_dict(d) for d in devices_models]
            clients = [self._model_to_dict(c) for c in clients_models]

            _LOGGER.debug(
                "Device coordinator: Site %s - Found %d devices and %d clients",
                site_id,
                len(devices),
                len(clients),
            )

            # Log sample device keys for debugging data format issues
            if devices:
                sample_device = devices[0]
                _LOGGER.debug(
                    "Device coordinator: Sample device keys for site %s: %s",
                    site_id,
                    list(sample_device.keys()),
                )

            # Process devices in parallel (get stats)
            tasks = [
                self._process_device(site_id, device, clients) for device in devices
            ]
            results = await asyncio.gather(*tasks)

            # Organize results
            devices_dict = {}
            stats_dict = {}
            for device_id, device, stats in results:
                if device_id:
                    devices_dict[device_id] = device
                    stats_dict[device_id] = stats

            clients_dict = {
                client.get("id"): client for client in clients if client.get("id")
            }

            return devices_dict, stats_dict, clients_dict  # noqa: TRY300

        except Exception:
            _LOGGER.exception("Device coordinator: Error processing site %s", site_id)
            return None

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch device data from API."""
        try:
            # Get site IDs from config coordinator
            site_ids = self.config_coordinator.get_site_ids()

            if not site_ids:
                _LOGGER.warning(
                    "Device coordinator: No sites available from config coordinator"
                )
                return self.data

            _LOGGER.debug(
                "Device coordinator: Processing %d sites",
                len(site_ids),
            )

            # Process all sites in parallel
            tasks = [self._process_site(site_id) for site_id in site_ids]
            results = await asyncio.gather(*tasks)

            # Update data structure with results
            for site_id, result in zip(site_ids, results, strict=False):
                if result is not None:
                    devices_dict, stats_dict, clients_dict = result
                    self.data["devices"][site_id] = devices_dict
                    self.data["stats"][site_id] = stats_dict
                    self.data["clients"][site_id] = clients_dict

                    _LOGGER.debug(
                        "Device coordinator: Processed site %s - "
                        "%d devices, %d clients",
                        site_id,
                        len(devices_dict),
                        len(clients_dict),
                    )

            self._available = True
            self.data["last_update"] = datetime.now(tz=UTC)

            # Clean up stale devices (Gold requirement)
            self._cleanup_stale_devices()

            _LOGGER.debug(
                "Device coordinator: Update complete - %d sites processed",
                len(site_ids),
            )

            return self.data  # noqa: TRY300

        except UniFiAuthenticationError as err:
            self._handle_auth_error(err)
        except UniFiConnectionError as err:
            self._handle_connection_error(err)
        except UniFiTimeoutError as err:
            self._handle_timeout_error(err)
        except UniFiResponseError as err:
            self._handle_response_error(err)
        except Exception as err:  # noqa: BLE001
            self._handle_generic_error(err)

        # Should never reach here due to raises above
        return self.data  # pragma: no cover

    def _cleanup_stale_devices(self) -> None:
        """Remove stale network devices from the device registry (Gold requirement)."""
        device_registry = dr.async_get(self.hass)

        # Collect current network device IDs
        current_network_device_ids: set[str] = set()
        for site_id, devices in self.data.get("devices", {}).items():
            for device_id in devices:
                current_network_device_ids.add(f"{site_id}_{device_id}")

        # Find and remove stale network devices
        stale_network_ids = (
            self._previous_network_device_ids - current_network_device_ids
        )
        for device_identifier in stale_network_ids:
            device = device_registry.async_get_device(
                identifiers={(DOMAIN, device_identifier)}
            )
            if device:
                _LOGGER.info(
                    "Device coordinator: Removing stale network device: %s",
                    device_identifier,
                )
                device_registry.async_update_device(
                    device_id=device.id,
                    remove_config_entry_id=self.config_entry.entry_id,
                )

        self._previous_network_device_ids = current_network_device_ids

    def get_device(self, site_id: str, device_id: str) -> dict[str, Any] | None:
        """Get device data by site ID and device ID."""
        devices = self.data.get("devices", {}).get(site_id, {})
        result = devices.get(device_id)
        return result if isinstance(result, dict) else None

    def get_device_stats(self, site_id: str, device_id: str) -> dict[str, Any] | None:
        """Get device statistics by site ID and device ID."""
        stats = self.data.get("stats", {}).get(site_id, {})
        result = stats.get(device_id)
        return result if isinstance(result, dict) else None

    def get_clients(self, site_id: str) -> dict[str, Any]:
        """Get all clients for a site."""
        return self.data.get("clients", {}).get(site_id, {})
