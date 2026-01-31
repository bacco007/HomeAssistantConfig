"""Support for UniFi Insights device tracker."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.device_tracker.config_entry import ScannerEntity
from homeassistant.components.device_tracker.const import SourceType
from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceInfo

from .const import (
    CONF_TRACK_CLIENTS,
    CONF_TRACK_WIFI_CLIENTS,
    CONF_TRACK_WIRED_CLIENTS,
    DEFAULT_TRACK_CLIENTS,
    DOMAIN,
    MANUFACTURER,
)
from .entity import get_field

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry
    from .coordinators import UnifiFacadeCoordinator

_LOGGER = logging.getLogger(__name__)

# Coordinator handles updates centrally
PARALLEL_UPDATES = 0


def _get_client_type(client: dict[str, Any]) -> str:
    """
    Extract client type from client data.

    As of unifi-official-api v1.1.0, the API properly serializes the ClientType
    enum to string values ("WIRED" or "WIRELESS"). This helper normalizes the
    value for comparison and handles edge cases.
    """
    client_type = client.get("type") or client.get("connection_type", "")
    # Normalize to uppercase string
    type_str = str(client_type).upper()
    # Handle both direct values and any legacy enum format
    if "WIRED" in type_str:
        return "WIRED"
    if "WIRELESS" in type_str:
        return "WIRELESS"
    return type_str


async def async_setup_entry(
    hass: HomeAssistant,  # noqa: ARG001
    entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up device tracker for UniFi Insights integration."""
    coordinator = entry.runtime_data.coordinator

    # Check which client types to track (support both old and new options)
    # Migrate from old single option if new options not set
    old_track_clients = entry.options.get(CONF_TRACK_CLIENTS, DEFAULT_TRACK_CLIENTS)
    track_wifi = entry.options.get(CONF_TRACK_WIFI_CLIENTS, old_track_clients)
    track_wired = entry.options.get(CONF_TRACK_WIRED_CLIENTS, old_track_clients)

    if not track_wifi and not track_wired:
        _LOGGER.debug("Client tracking is disabled, skipping device_tracker setup")
        return

    _LOGGER.debug(
        "Client tracking enabled - WiFi: %s, Wired: %s", track_wifi, track_wired
    )

    @callback  # type: ignore[misc]
    def async_add_clients() -> None:
        """Add new client trackers."""
        entities: list[UnifiClientTracker] = []

        for site_id, clients in coordinator.data.get("clients", {}).items():
            for client_id, client_data in clients.items():
                # Create unique tracker ID
                tracker_id = f"{site_id}_{client_id}"

                # Skip if already tracked
                if tracker_id in coordinator.hass.data.get(
                    f"{DOMAIN}_tracked_clients", set()
                ):
                    continue

                # Filter by client type based on options
                client_type = _get_client_type(client_data)
                if client_type == "WIRELESS" and not track_wifi:
                    _LOGGER.debug(
                        "Skipping WiFi client %s (tracking disabled)", client_id
                    )
                    continue
                if client_type == "WIRED" and not track_wired:
                    _LOGGER.debug(
                        "Skipping wired client %s (tracking disabled)", client_id
                    )
                    continue

                entities.append(
                    UnifiClientTracker(
                        coordinator=coordinator,
                        site_id=site_id,
                        client_id=client_id,
                    )
                )

                # Track this client
                coordinator.hass.data.setdefault(
                    f"{DOMAIN}_tracked_clients", set()
                ).add(tracker_id)

        if entities:
            async_add_entities(entities)

    # Initial setup
    async_add_clients()

    # Listen for new clients
    entry.async_on_unload(coordinator.async_add_listener(async_add_clients))


class UnifiClientTracker(ScannerEntity):  # type: ignore[misc]
    """Representation of a UniFi network client."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        site_id: str,
        client_id: str,
    ) -> None:
        """Initialize the tracker."""
        self.coordinator = coordinator
        self._site_id = site_id
        self._client_id = client_id

        # Get initial client data
        client_data = self._get_client_data() or {}

        # Set unique ID based on MAC address for stability
        mac = get_field(client_data, "macAddress", "mac_address", "mac", default="")
        self._attr_unique_id = f"{DOMAIN}_{mac}" if mac else f"{DOMAIN}_{client_id}"

        # Set name from client data
        self._attr_name = get_field(
            client_data, "name", "hostname", default=f"Client {client_id[:8]}"
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
                identifiers={(DOMAIN, f"client_{mac or client_id}")},
                name=self._attr_name,
                manufacturer=MANUFACTURER,
                model=model,
            )

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return self._device_info

    def _get_client_data(self) -> dict[str, Any] | None:
        """Get client data from coordinator."""
        clients = self.coordinator.data.get("clients", {}).get(self._site_id, {})
        return clients.get(self._client_id) if isinstance(clients, dict) else None  # type: ignore[no-any-return]

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
        client_data = self._get_client_data()
        if not client_data:
            return SourceType.ROUTER

        connection_type = get_field(client_data, "type", "connection_type", default="")
        if isinstance(connection_type, str) and connection_type.upper() == "WIRELESS":
            return SourceType.ROUTER
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

    @callback  # type: ignore[misc]
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """Register callbacks when entity is added."""
        self.async_on_remove(
            self.coordinator.async_add_listener(self._handle_coordinator_update)
        )
