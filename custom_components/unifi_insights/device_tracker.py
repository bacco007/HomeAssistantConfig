"""Support for UniFi Insights device tracker."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.device_tracker.config_entry import ScannerEntity
from homeassistant.components.device_tracker.const import SourceType
from homeassistant.core import callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CONF_TRACK_CLIENTS,
    CONF_TRACK_WIFI_CLIENTS,
    CONF_TRACK_WIRED_CLIENTS,
    DEFAULT_TRACK_CLIENTS,
    DOMAIN,
    MANUFACTURER,
)
from .coordinators import UnifiFacadeCoordinator
from .entity import get_client_type as _get_client_type
from .entity import get_field

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry

_LOGGER = logging.getLogger(__name__)

# Coordinator handles updates centrally
PARALLEL_UPDATES = 0


def _client_should_be_tracked(
    client_data: dict[str, Any],
    *,
    track_wifi: bool,
    track_wired: bool,
) -> bool:
    """Return True if a connected client should be tracked per the options."""
    client_type = _get_client_type(client_data)
    if client_type == "WIRELESS":
        return track_wifi
    if client_type == "WIRED":
        return track_wired
    # Unknown type: track only if any tracking is enabled.
    return track_wifi or track_wired


def _connected_clients_to_track(
    coordinator: UnifiFacadeCoordinator,
    *,
    track_wifi: bool,
    track_wired: bool,
) -> dict[str, str]:
    """Map MAC (lowercase) -> site_id for connected clients that should track."""
    wanted: dict[str, str] = {}
    for site_id, clients in coordinator.data.get("clients", {}).items():
        if not isinstance(clients, dict):
            continue
        for client_data in clients.values():
            mac = get_field(client_data, "macAddress", "mac_address", "mac", default="")
            if not mac:
                continue
            if _client_should_be_tracked(
                client_data, track_wifi=track_wifi, track_wired=track_wired
            ):
                wanted[mac.lower()] = site_id
    return wanted


async def async_setup_entry(
    hass: HomeAssistant,
    entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up device tracker for UniFi Insights integration."""
    coordinator = entry.runtime_data.coordinator

    # Check which client types to track (support both old and new options).
    # Migrate from the old single option if the new options are not set.
    old_track_clients = entry.options.get(CONF_TRACK_CLIENTS, DEFAULT_TRACK_CLIENTS)
    track_wifi = entry.options.get(CONF_TRACK_WIFI_CLIENTS, old_track_clients)
    track_wired = entry.options.get(CONF_TRACK_WIRED_CLIENTS, old_track_clients)

    _LOGGER.debug("Client tracking - WiFi: %s, Wired: %s", track_wifi, track_wired)

    # Reconcile the entity registry with the current options/connected clients.
    # This runs on every setup (including option-change reloads), so disabling a
    # client type removes its trackers and only currently connected clients of
    # the enabled types remain. Without this, toggling options would leave stale
    # "unavailable" trackers behind.
    wanted = _connected_clients_to_track(
        coordinator, track_wifi=track_wifi, track_wired=track_wired
    )
    wanted_unique_ids = {f"{DOMAIN}_{mac}" for mac in wanted}
    registry = er.async_get(hass)
    for reg_entry in er.async_entries_for_config_entry(registry, entry.entry_id):
        if (
            reg_entry.domain == "device_tracker"
            and reg_entry.platform == DOMAIN
            and reg_entry.unique_id not in wanted_unique_ids
        ):
            _LOGGER.debug(
                "Removing client tracker %s (no longer tracked)", reg_entry.entity_id
            )
            registry.async_remove(reg_entry.entity_id)

    if not track_wifi and not track_wired:
        _LOGGER.debug("Client tracking disabled - no client trackers created")
        return

    # Per-setup dedup set (recreated on every reload so re-enabling re-adds
    # entities); MAC is globally unique so it is used as the key.
    tracked: set[str] = set()

    @callback
    def async_add_clients() -> None:
        """Add trackers for currently connected clients of the enabled types."""
        current = _connected_clients_to_track(
            coordinator, track_wifi=track_wifi, track_wired=track_wired
        )
        entities = [
            UnifiClientTracker(coordinator=coordinator, site_id=site_id, mac=mac)
            for mac, site_id in current.items()
            if mac not in tracked
        ]
        tracked.update(current)
        if entities:
            async_add_entities(entities)

    # Initial setup
    async_add_clients()

    # Listen for new clients connecting later
    entry.async_on_unload(coordinator.async_add_listener(async_add_clients))


class UnifiClientTracker(CoordinatorEntity[UnifiFacadeCoordinator], ScannerEntity):
    """Representation of a UniFi network client."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        site_id: str,
        mac: str,
    ) -> None:
        """Initialize the tracker."""
        super().__init__(coordinator)
        self._site_id = site_id
        self._mac = mac.lower()

        # Get initial client data
        client_data = self._get_client_data() or {}

        # Set unique ID based on MAC address for stability
        self._attr_unique_id = f"{DOMAIN}_{self._mac}"

        # Set name from client data
        self._attr_name = get_field(
            client_data, "name", "hostname", default=f"Client {self._mac}"
        )

        # Device info - associate with connected network device (switch/AP)
        # This groups client trackers under their uplink device for cleaner UI
        uplink_device_id = get_field(client_data, "uplinkDeviceId", "uplink_device_id")
        if uplink_device_id:
            # Use the network device's identifiers to group under it
            self._device_info = DeviceInfo(
                identifiers={(DOMAIN, f"{site_id}_{uplink_device_id}")},
            )
        else:
            # Fallback: create a standalone client device if no uplink found
            model = get_field(
                client_data, "deviceName", "osName", default="Network Client"
            )
            self._device_info = DeviceInfo(
                identifiers={(DOMAIN, f"client_{self._mac}")},
                name=self._attr_name,
                manufacturer=MANUFACTURER,
                model=model,
            )

    @property  # type: ignore[misc]
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return self._device_info

    def _get_client_data(self) -> dict[str, Any] | None:
        """Get connected-client data for this MAC, if currently connected."""
        clients = self.coordinator.data.get("clients", {}).get(self._site_id, {})
        if not isinstance(clients, dict):
            return None
        for client_data in clients.values():
            mac = get_field(client_data, "macAddress", "mac_address", "mac", default="")
            if mac and mac.lower() == self._mac:
                return client_data
        return None

    @property
    def is_connected(self) -> bool:
        """Return true if the client is connected."""
        client_data = self._get_client_data()
        if not client_data:
            return False
        return bool(get_field(client_data, "connected", default=False))

    @property
    def source_type(self) -> SourceType:
        """Return the source type."""
        return SourceType.ROUTER

    @property
    def ip_address(self) -> str | None:
        """Return the IP address of the client."""
        client_data = self._get_client_data()
        if not client_data:
            return None
        return get_field(client_data, "ipAddress", "ip_address", "ip")  # type: ignore[no-any-return]

    @property
    def mac_address(self) -> str | None:
        """Return the MAC address of the client."""
        client_data = self._get_client_data()
        if not client_data:
            return None
        return get_field(client_data, "macAddress", "mac_address", "mac")  # type: ignore[no-any-return]

    @property
    def hostname(self) -> str | None:
        """Return the hostname of the client."""
        client_data = self._get_client_data()
        if not client_data:
            return None
        return get_field(client_data, "hostname", "name")  # type: ignore[no-any-return]

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return bool(self.coordinator.last_update_success)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        client_data = self._get_client_data()
        if not client_data:
            return {}

        return {
            "connection_type": get_field(client_data, "type", "connection_type"),
            "connected_at": get_field(client_data, "connectedAt", "connected_at"),
            "uplink_device_id": get_field(
                client_data, "uplinkDeviceId", "uplink_device_id"
            ),
            "authorized": get_field(client_data, "authorized", default=True),
            "blocked": get_field(client_data, "blocked", default=False),
        }
