"""Device coordinator for UniFi Insights - handles fast-changing device data."""

from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from homeassistant.helpers import device_registry as dr

from custom_components.unifi_insights.api import (
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

    from custom_components.unifi_insights.api.network import UniFiNetworkClient
    from custom_components.unifi_insights.api.protect import UniFiProtectClient

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

    @staticmethod
    def _normalize_mac(value: Any) -> str | None:
        """Normalize a MAC address for dictionary lookups."""
        if not isinstance(value, str) or not value:
            return None
        return value.strip().lower()

    @staticmethod
    def _has_legacy_temperature_data(legacy_device: dict[str, Any]) -> bool:
        """Return True when legacy device data contains usable temperature info."""
        general_temperature = legacy_device.get("general_temperature")
        if general_temperature is None:
            general_temperature = legacy_device.get("generalTemperature")

        temperatures = legacy_device.get("temperatures")
        has_temperature = legacy_device.get("has_temperature")
        if has_temperature is None:
            has_temperature = legacy_device.get("hasTemperature")

        has_temperature_entries = isinstance(temperatures, list) and any(
            isinstance(item, dict) and item.get("value") is not None
            for item in temperatures
        )

        return bool(
            has_temperature
            or general_temperature is not None
            or has_temperature_entries
        )

    @classmethod
    def _merge_legacy_temperature_data(
        cls,
        device_dict: dict[str, Any],
        legacy_devices_by_mac: dict[str, dict[str, Any]],
    ) -> None:
        """Merge temperature-related legacy fields into device data."""
        mac_address = cls._normalize_mac(
            device_dict.get("macAddress") or device_dict.get("mac")
        )
        if mac_address is None:
            return

        legacy_device = legacy_devices_by_mac.get(mac_address)
        if legacy_device is None or not cls._has_legacy_temperature_data(legacy_device):
            return

        general_temperature = legacy_device.get("general_temperature")
        if general_temperature is None:
            general_temperature = legacy_device.get("generalTemperature")

        temperatures = legacy_device.get("temperatures")

        if general_temperature is not None:
            device_dict["generalTemperature"] = general_temperature

        if isinstance(temperatures, list):
            device_dict["temperatures"] = temperatures

        device_dict["hasTemperature"] = True

    @classmethod
    def _merge_legacy_port_data(
        cls,
        device_dict: dict[str, Any],
        legacy_devices_by_mac: dict[str, dict[str, Any]],
    ) -> None:
        """Merge port_table from legacy device data into device dict."""
        mac_address = cls._normalize_mac(
            device_dict.get("macAddress") or device_dict.get("mac")
        )
        if mac_address is None:
            return

        legacy_device = legacy_devices_by_mac.get(mac_address)
        if legacy_device is None:
            return

        port_table = legacy_device.get("port_table")
        if not isinstance(port_table, list) or not port_table:
            return

        # Normalize port_table entries into the format expected by sensor.py
        ports: list[dict[str, Any]] = []
        for port in port_table:
            if not isinstance(port, dict):
                continue
            port_idx = port.get("port_idx")
            if port_idx is None:
                continue

            normalized: dict[str, Any] = {
                "idx": port_idx,
                "port_idx": port_idx,
                "state": "UP" if port.get("up") else "DOWN",
                "speedMbps": port.get("speed"),
                "speed": port.get("speed"),
            }

            # PoE data
            poe_enabled = port.get("poe_enable") or port.get("port_poe")
            poe_power = port.get("poe_power") or port.get("poePower")
            if poe_enabled or poe_power is not None:
                normalized["poe"] = {
                    "enabled": bool(poe_enabled),
                    "power": poe_power,
                }

            # TX/RX bytes
            normalized["stats"] = {
                "txBytes": port.get("tx_bytes", 0),
                "rxBytes": port.get("rx_bytes", 0),
            }

            ports.append(normalized)

        if ports:
            device_dict["ports"] = ports

    def _map_legacy_site_names(
        self,
        site_ids: list[str],
        legacy_sites: list[dict[str, Any]],
    ) -> dict[str, str]:
        """Map integration site IDs to legacy site names used by `/api/s/{site}`."""
        mappings: dict[str, str] = {}

        def _match_string(value: Any) -> str | None:
            if not isinstance(value, str):
                return None
            stripped = value.strip().lower()
            return stripped or None

        normalized_legacy_sites: list[tuple[str, set[str]]] = []
        for legacy_site in legacy_sites:
            legacy_name = legacy_site.get("name")
            if not isinstance(legacy_name, str) or not legacy_name:
                continue

            candidates = {
                candidate
                for candidate in {
                    _match_string(legacy_name),
                    _match_string(legacy_site.get("desc")),
                    _match_string(legacy_site.get("description")),
                }
                if candidate is not None
            }
            normalized_legacy_sites.append((legacy_name, candidates))

        for site_id in site_ids:
            site_data = self.config_coordinator.get_site(site_id) or {}
            site_candidates = {
                candidate
                for candidate in {
                    _match_string(site_id),
                    _match_string(site_data.get("name")),
                    _match_string(site_data.get("description")),
                    _match_string(site_data.get("desc")),
                }
                if candidate is not None
            }

            for legacy_name, legacy_candidates in normalized_legacy_sites:
                if site_candidates & legacy_candidates:
                    mappings[site_id] = legacy_name
                    break

            if site_id not in mappings and len(normalized_legacy_sites) == 1:
                mappings[site_id] = normalized_legacy_sites[0][0]

        return mappings

    async def _process_device(
        self,
        site_id: str,
        device_dict: dict[str, Any],
        clients: list[dict[str, Any]],
        legacy_site_name: str | None = None,
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

            # Use vendored API for legacy per-port PoE/byte metrics
            try:
                device_mac = (
                    device_dict.get("mac")
                    or device_dict.get("macAddress")
                    or device_dict.get("mac_address")
                )

                site_name = legacy_site_name or site_id
                if not legacy_site_name:
                    try:
                        get_site = getattr(self.config_coordinator, "get_site", None)
                        if callable(get_site):
                            site_obj = get_site(site_id)
                            if isinstance(site_obj, dict):
                                site_name = (
                                    site_obj.get("internalReference")
                                    or site_obj.get("internal_reference")
                                    or site_name
                                )
                    except Exception:  # noqa: S110
                        pass

                if device_mac and site_name:
                    metrics = await self.network_client.devices.get_port_metrics(
                        site_name, device_mac
                    )

                    if metrics.port_bytes:
                        stats["port_bytes"] = {
                            idx: {"rx_bytes": pb.rx_bytes, "tx_bytes": pb.tx_bytes}
                            for idx, pb in metrics.port_bytes.items()
                        }

                    if metrics.poe_ports:
                        stats["poe_ports"] = dict(metrics.poe_ports)

                    if metrics.poe_total_w is not None:
                        stats["poe_total_w"] = metrics.poe_total_w
            except Exception as err:
                _LOGGER.debug(
                    "Legacy PoE wattage fetch failed for %s: %s",
                    device_mac or device_id,
                    err,
                )

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

            return device_id, device_dict, stats

        except Exception as err:
            _LOGGER.debug(
                "Error getting stats for device %s (%s): %s",
                device_name,
                device_id,
                err,
            )
            return device_id, device_dict, {}

    async def _process_site(
        self, site_id: str, legacy_site_name: str | None = None
    ) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]] | None:
        """Process a single site's devices and clients."""
        try:
            # Get devices and clients in parallel using new API
            devices_task = self.network_client.devices.get_all(site_id)
            clients_task = self.network_client.clients.get_all(site_id)
            devices_models, clients_models = await asyncio.gather(
                devices_task, clients_task
            )

            legacy_devices: list[dict[str, Any]] = []
            if legacy_site_name is not None:
                try:
                    legacy_devices = (
                        await self.network_client.devices.get_legacy_site_devices(
                            legacy_site_name
                        )
                    )
                except Exception as err:
                    _LOGGER.debug(
                        "Device coordinator: Failed to fetch legacy device data "
                        "for site %s (%s): %s",
                        site_id,
                        legacy_site_name,
                        err,
                    )

            # Convert model objects to dictionaries
            devices = [self._model_to_dict(d) for d in devices_models]
            clients = [self._model_to_dict(c) for c in clients_models]

            legacy_devices_by_mac = {
                normalized_mac: legacy_device
                for legacy_device in legacy_devices
                if isinstance(legacy_device, dict)
                and (
                    normalized_mac := self._normalize_mac(
                        legacy_device.get("mac") or legacy_device.get("macAddress")
                    )
                )
                is not None
            }

            if legacy_devices_by_mac:
                for device in devices:
                    self._merge_legacy_temperature_data(device, legacy_devices_by_mac)
                    self._merge_legacy_port_data(device, legacy_devices_by_mac)

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
                self._process_device(
                    site_id,
                    device,
                    clients,
                    legacy_site_name=legacy_site_name,
                )
                for device in devices
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

            return devices_dict, stats_dict, clients_dict

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

            legacy_site_names: dict[str, str] = {}
            try:
                legacy_sites = await self.network_client.sites.get_legacy_all()
                legacy_site_names = self._map_legacy_site_names(site_ids, legacy_sites)
            except Exception as err:
                _LOGGER.debug(
                    "Device coordinator: Unable to fetch legacy site mapping: %s",
                    err,
                )

            # Process all sites in parallel
            tasks = [
                self._process_site(site_id, legacy_site_names.get(site_id))
                for site_id in site_ids
            ]
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

            return self.data

        except UniFiAuthenticationError as err:
            self._handle_auth_error(err)
        except UniFiConnectionError as err:
            self._handle_connection_error(err)
        except UniFiTimeoutError as err:
            self._handle_timeout_error(err)
        except UniFiResponseError as err:
            self._handle_response_error(err)
        except Exception as err:
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
        result: dict[str, Any] = self.data.get("clients", {}).get(site_id, {})
        return result
