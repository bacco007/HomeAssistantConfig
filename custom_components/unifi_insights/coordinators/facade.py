"""Facade coordinator providing backward-compatible unified data view."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from collections.abc import Awaitable, Callable

    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

    from custom_components.unifi_insights.api.network import UniFiNetworkClient
    from custom_components.unifi_insights.api.protect import UniFiProtectClient

    from .config import UnifiConfigCoordinator
    from .device import UnifiDeviceCoordinator
    from .protect import UnifiProtectCoordinator

from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from custom_components.unifi_insights.const import DOMAIN

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
            update_interval=None,
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
            "firewall_rules": self._config_coordinator.data.get("firewall_rules", {}),
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

    def _require_protect_client(self) -> UniFiProtectClient:
        """Return the Protect client or raise a user-facing error."""
        if self.protect_client is None:
            msg = "Protect is not available for this config"
            raise HomeAssistantError(msg)
        return self.protect_client

    async def _async_execute_api_action[ActionResult](
        self,
        error_message: str,
        action: Callable[..., Awaitable[ActionResult]],
        *args: Any,
        **kwargs: Any,
    ) -> ActionResult:
        """Execute an API action and convert failures to Home Assistant errors."""
        try:
            return await action(*args, **kwargs)
        except HomeAssistantError:
            raise
        except Exception as err:
            _LOGGER.exception("%s", error_message)
            raise HomeAssistantError(error_message) from err

    async def async_restart_device(self, site_id: str, device_id: str) -> bool:
        """Restart a network device."""
        return await self._async_execute_api_action(
            f"Unable to restart device {device_id}",
            self.network_client.devices.restart,
            site_id,
            device_id,
        )

    async def async_set_firewall_rule_enabled(
        self,
        site_id: str,
        rule_id: str,
        *,
        enabled: bool,
    ) -> None:
        """Enable or disable a firewall rule."""
        await self._async_execute_api_action(
            f"Unable to update firewall rule {rule_id}",
            self.network_client.firewall.update_rule,
            site_id,
            rule_id,
            enabled=enabled,
        )

    async def async_update_camera(self, camera_id: str, **kwargs: Any) -> None:
        """Update a camera via the Protect cameras endpoint."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to update camera {camera_id}",
            protect_client.cameras.update,
            camera_id,
            **kwargs,
        )

    async def async_update_camera_settings(
        self,
        camera_id: str,
        **kwargs: Any,
    ) -> None:
        """Update camera settings (alias for async_update_camera)."""
        await self.async_update_camera(camera_id, **kwargs)

    async def async_execute_port_action(
        self,
        site_id: str,
        device_id: str,
        port_idx: int,
        **kwargs: Any,
    ) -> None:
        """Execute a network port action."""
        await self._async_execute_api_action(
            f"Unable to update port {port_idx} on device {device_id}",
            self.network_client.devices.execute_port_action,
            site_id,
            device_id,
            port_idx,
            **kwargs,
        )

    async def async_unblock_client(self, site_id: str, client_id: str) -> None:
        """Unblock a network client."""
        await self._async_execute_api_action(
            f"Unable to unblock client {client_id}",
            self.network_client.clients.unblock,
            site_id,
            client_id,
        )

    async def async_block_client(self, site_id: str, client_id: str) -> None:
        """Block a network client."""
        await self._async_execute_api_action(
            f"Unable to block client {client_id}",
            self.network_client.clients.block,
            site_id,
            client_id,
        )

    async def async_reconnect_client(self, site_id: str, client_id: str) -> None:
        """Reconnect a network client."""
        await self._async_execute_api_action(
            f"Unable to reconnect client {client_id}",
            self.network_client.clients.reconnect,
            site_id,
            client_id,
        )

    async def async_update_wifi_network(
        self,
        site_id: str,
        wifi_id: str,
        *,
        enabled: bool,
    ) -> None:
        """Enable or disable a WiFi network."""
        await self._async_execute_api_action(
            f"Unable to update WiFi network {wifi_id}",
            self.network_client.wifi.update,
            site_id,
            wifi_id,
            enabled=enabled,
        )

    async def async_play_chime(self, chime_id: str) -> None:
        """Play a chime sound."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to play chime {chime_id}",
            protect_client.chimes.play,
            chime_id,
        )

    async def async_start_ptz_patrol(self, camera_id: str, slot: int) -> None:
        """Start PTZ patrol for a camera."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to start PTZ patrol for camera {camera_id}",
            protect_client.cameras.ptz_patrol_start,
            camera_id,
            slot,
        )

    async def async_stop_ptz_patrol(self, camera_id: str) -> None:
        """Stop PTZ patrol for a camera."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to stop PTZ patrol for camera {camera_id}",
            protect_client.cameras.ptz_patrol_stop,
            camera_id,
        )

    async def async_set_hdr_mode(self, camera_id: str, mode: str) -> None:
        """Set HDR mode for a camera."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to set HDR mode for camera {camera_id}",
            protect_client.cameras.set_hdr_mode,
            camera_id,
            mode,
        )

    async def async_set_video_mode(self, camera_id: str, mode: str) -> None:
        """Set video mode for a camera."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to set video mode for camera {camera_id}",
            protect_client.cameras.set_video_mode,
            camera_id,
            mode,
        )

    async def async_set_recording_mode(self, camera_id: str, mode: str) -> None:
        """Set recording mode for a camera."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to set recording mode for camera {camera_id}",
            protect_client.cameras.update,
            camera_id,
            recordingMode=mode,
        )

    async def async_set_chime_ringtone(self, chime_id: str, ringtone_id: str) -> None:
        """Set ringtone for a chime."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to set ringtone for chime {chime_id}",
            protect_client.chimes.update,
            chime_id,
            ringtone=ringtone_id,
        )

    async def async_move_ptz_to_preset(self, camera_id: str, preset: int) -> None:
        """Move a PTZ camera to a preset."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to move camera {camera_id} to PTZ preset {preset}",
            protect_client.cameras.ptz_goto_preset,
            camera_id,
            str(preset),
        )

    async def async_update_viewer(self, viewer_id: str, **kwargs: Any) -> None:
        """Update viewer settings."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to update viewer {viewer_id}",
            protect_client.viewers.update,
            viewer_id,
            **kwargs,
        )

    async def async_set_microphone_volume(self, camera_id: str, volume: int) -> None:
        """Set microphone volume for a camera."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to set microphone volume for camera {camera_id}",
            protect_client.cameras.set_microphone_volume,
            camera_id,
            volume,
        )

    async def async_set_light_brightness(self, light_id: str, level: int) -> None:
        """Set light brightness for a Protect light."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to set brightness for light {light_id}",
            protect_client.lights.set_brightness,
            light_id,
            level,
        )

    async def async_set_light_mode(self, light_id: str, mode: str) -> None:
        """Set mode for a Protect light."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to set mode for light {light_id}",
            protect_client.lights.update,
            light_id,
            lightMode=mode,
        )

    async def async_set_chime_volume(self, chime_id: str, volume: int) -> None:
        """Set volume for a chime."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to set volume for chime {chime_id}",
            protect_client.chimes.set_volume,
            chime_id,
            volume,
        )

    async def async_set_chime_repeat(
        self,
        chime_id: str,
        repeat_times: int,
    ) -> None:
        """Set repeat count for a chime."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to set repeat count for chime {chime_id}",
            protect_client.chimes.update,
            chime_id,
            repeatTimes=repeat_times,
        )

    async def async_generate_voucher(
        self,
        site_id: str,
        *,
        count: int = 1,
        time_limit_minutes: int | None = None,
        tx_rate_limit_kbps: int | None = None,
        rx_rate_limit_kbps: int | None = None,
        data_usage_limit_mbytes: int | None = None,
        name: str | None = None,
    ) -> None:
        """Generate voucher(s) for a site."""
        kwargs: dict[str, Any] = {"count": count}
        if time_limit_minutes is not None:
            kwargs["time_limit_minutes"] = time_limit_minutes
        if tx_rate_limit_kbps is not None:
            kwargs["tx_rate_limit_kbps"] = tx_rate_limit_kbps
        if rx_rate_limit_kbps is not None:
            kwargs["rx_rate_limit_kbps"] = rx_rate_limit_kbps
        if data_usage_limit_mbytes is not None:
            kwargs["data_usage_limit_mbytes"] = data_usage_limit_mbytes
        if name is not None:
            kwargs["name"] = name
        await self._async_execute_api_action(
            f"Unable to generate voucher in site {site_id}",
            self.network_client.vouchers.create,
            site_id,
            **kwargs,
        )

    async def async_delete_voucher(self, site_id: str, voucher_id: str) -> None:
        """Delete a voucher."""
        await self._async_execute_api_action(
            f"Unable to delete voucher {voucher_id}",
            self.network_client.vouchers.delete,
            site_id,
            voucher_id,
        )

    async def async_trigger_alarm(self, alarm_id: str) -> None:
        """Trigger an alarm."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to trigger alarm {alarm_id}",
            protect_client.application.trigger_alarm_webhook,
            alarm_id,
        )

    async def async_create_liveview(
        self,
        *,
        name: str,
        layout: int,
        is_default: bool = False,
    ) -> None:
        """Create a liveview."""
        protect_client = self._require_protect_client()
        await self._async_execute_api_action(
            f"Unable to create liveview {name}",
            protect_client.liveviews.create,
            name=name,
            layout=layout,
            isDefault=is_default,
        )
