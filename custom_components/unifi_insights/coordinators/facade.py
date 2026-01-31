"""Facade coordinator providing backward-compatible unified data view."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from custom_components.unifi_insights.const import DOMAIN, SCAN_INTERVAL_DEVICE

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant
    from unifi_official_api.network import UniFiNetworkClient
    from unifi_official_api.protect import UniFiProtectClient

    from .config import UnifiConfigCoordinator
    from .device import UnifiDeviceCoordinator
    from .protect import UnifiProtectCoordinator

_LOGGER = logging.getLogger(__name__)


class UnifiFacadeCoordinator(DataUpdateCoordinator[dict[str, Any]]):  # type: ignore[misc]
    """
    Facade coordinator providing unified data view for backward compatibility.

    This coordinator aggregates data from the specialized coordinators
    (config, device, protect) and presents a unified interface that matches
    the original single-coordinator structure. This allows existing entity
    classes to work without modifications.

    Data structure (matches original coordinator):
    - sites: from config_coordinator
    - devices: from device_coordinator
    - clients: from device_coordinator
    - stats: from device_coordinator
    - wifi: from config_coordinator
    - protect: from protect_coordinator (cameras, lights, sensors, etc.)
    - last_update: combined from all coordinators
    """

    config_entry: ConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        network_client: UniFiNetworkClient,
        protect_client: UniFiProtectClient | None,
        entry: ConfigEntry,
        config_coordinator: UnifiConfigCoordinator,
        device_coordinator: UnifiDeviceCoordinator,
        protect_coordinator: UnifiProtectCoordinator | None,
    ) -> None:
        """Initialize the facade coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_facade",
            # Facade doesn't poll - it aggregates from other coordinators
            update_interval=SCAN_INTERVAL_DEVICE,
        )
        self.network_client = network_client
        self.protect_client = protect_client
        self.config_entry = entry
        self._config_coordinator = config_coordinator
        self._device_coordinator = device_coordinator
        self._protect_coordinator = protect_coordinator

        # Register listeners to update when any coordinator updates
        self._setup_listeners()

    def _setup_listeners(self) -> None:
        """Set up listeners to aggregate data when coordinators update."""
        # When device coordinator updates, trigger facade update
        self._device_coordinator.async_add_listener(self._handle_coordinator_update)
        self._config_coordinator.async_add_listener(self._handle_coordinator_update)
        if self._protect_coordinator:
            self._protect_coordinator.async_add_listener(
                self._handle_coordinator_update
            )

    def _handle_coordinator_update(self) -> None:
        """Handle update from any coordinator by refreshing aggregated data."""
        self._aggregate_data()
        self.async_update_listeners()

    def _aggregate_data(self) -> None:
        """Aggregate data from all coordinators into unified structure."""
        self.data = {
            # From config coordinator
            "sites": self._config_coordinator.data.get("sites", {}),
            "wifi": self._config_coordinator.data.get("wifi", {}),
            "network_info": self._config_coordinator.data.get("network_info", {}),
            # From device coordinator
            "devices": self._device_coordinator.data.get("devices", {}),
            "clients": self._device_coordinator.data.get("clients", {}),
            "stats": self._device_coordinator.data.get("stats", {}),
            "vouchers": self._device_coordinator.data.get("vouchers", {}),
            # From protect coordinator
            "protect": (
                self._protect_coordinator.data
                if self._protect_coordinator
                else {
                    "cameras": {},
                    "lights": {},
                    "sensors": {},
                    "nvrs": {},
                    "viewers": {},
                    "chimes": {},
                    "liveviews": {},
                    "protect_info": {},
                    "events": {},
                }
            ),
            # Combined timestamp
            "last_update": datetime.now(tz=UTC),
        }

    def get_site(self, site_id: str) -> dict[str, Any] | None:
        """Get site data by site ID (delegates to config coordinator)."""
        return self._config_coordinator.get_site(site_id)

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

    @property
    def available(self) -> bool:
        """Return combined availability from all coordinators."""
        device_available = self._device_coordinator.last_update_success
        config_available = self._config_coordinator.last_update_success
        protect_available = (
            self._protect_coordinator.last_update_success
            if self._protect_coordinator
            else True
        )
        return device_available and config_available and protect_available

    async def _async_update_data(self) -> dict[str, Any]:
        """
        Update aggregated data.

        The facade doesn't fetch data itself - it aggregates from coordinators.
        This method is called periodically and ensures data is fresh.
        """
        self._aggregate_data()
        return self.data

    async def async_request_refresh(self) -> None:
        """Request refresh of all underlying coordinators."""
        # Refresh all coordinators
        await self._config_coordinator.async_request_refresh()
        await self._device_coordinator.async_request_refresh()
        if self._protect_coordinator:
            await self._protect_coordinator.async_request_refresh()
        # Aggregate the updated data
        self._aggregate_data()
