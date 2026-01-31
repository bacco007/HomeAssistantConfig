"""Support for UniFi Insights buttons."""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.components.button import (
    ButtonEntity,
    ButtonEntityDescription,
)

from .const import (
    ATTR_CHIME_ID,
    ATTR_CHIME_NAME,
    ATTR_CHIME_RINGTONE_ID,
    CHIME_RINGTONE_DEFAULT,
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_CHIME,
    DOMAIN,
    MANUFACTURER,
)
from .entity import UnifiInsightsEntity, UnifiProtectEntity

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry
    from .coordinators import UnifiFacadeCoordinator

_LOGGER = logging.getLogger(__name__)

# Buttons are action-based, allow parallel execution
PARALLEL_UPDATES = 1


@dataclass
class UnifiInsightsButtonEntityDescription(ButtonEntityDescription):  # type: ignore[misc]
    """Class describing UniFi Insights button entities."""


BUTTON_TYPES: tuple[UnifiInsightsButtonEntityDescription, ...] = (
    UnifiInsightsButtonEntityDescription(
        key="device_restart",
        translation_key="device_restart",
        name="Device Restart",
        icon="mdi:restart",
    ),
)


async def async_setup_entry(  # noqa: PLR0912
    hass: HomeAssistant,
    config_entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up buttons for UniFi Insights integration."""
    _ = hass
    coordinator: UnifiFacadeCoordinator = config_entry.runtime_data.coordinator
    entities = []

    _LOGGER.debug("Setting up buttons for UniFi Insights")

    # Add buttons for each device in each site
    for site_id, devices in coordinator.data["devices"].items():
        site_data = coordinator.get_site(site_id)
        site_name = (
            site_data.get("meta", {}).get("name", site_id) if site_data else site_id
        )

        _LOGGER.debug(
            "Processing site %s (%s) with %d devices", site_id, site_name, len(devices)
        )

        for device_id in devices:
            device_data = (
                coordinator.data.get("devices", {}).get(site_id, {}).get(device_id, {})
            )
            device_name = device_data.get("name", device_id)

            _LOGGER.debug(
                "Creating buttons for device %s (%s) in site %s (%s)",
                device_id,
                device_name,
                site_id,
                site_name,
            )

            for description in BUTTON_TYPES:
                entities.append(  # noqa: PERF401
                    UnifiInsightsButton(
                        coordinator=coordinator,
                        description=description,
                        site_id=site_id,
                        device_id=device_id,
                    )
                )

    # Add port power cycle buttons for PoE-capable switch ports
    for site_id, devices in coordinator.data["devices"].items():
        for device_id in devices:
            device_data = (
                coordinator.data.get("devices", {}).get(site_id, {}).get(device_id, {})
            )

            # Check if device has switching feature and ports
            features = device_data.get("features", [])
            if "switching" not in features:
                continue

            # Get ports from interfaces structure (new API format)
            # Note: interfaces can be a list (from get_all) or dict (from get)
            # When it's a list like ['ports'], it only indicates interface types
            # When it's a dict like {'ports': [...]}, it contains actual port data
            interfaces = device_data.get("interfaces", {})
            # interfaces is a list from get_all(), dict from get()
            ports = interfaces.get("ports", []) if isinstance(interfaces, dict) else []
            for port in ports:
                # Only add power cycle button for ports that have PoE enabled
                poe_config = port.get("poe", {})
                if poe_config.get("enabled"):
                    port_idx = port.get("idx") or port.get("portIdx")
                    if port_idx is not None:
                        entities.append(
                            UnifiPortPowerCycleButton(
                                coordinator=coordinator,
                                site_id=site_id,
                                device_id=device_id,
                                port_idx=port_idx,
                            )
                        )

    # Add reconnect buttons for connected clients
    for site_id, clients in coordinator.data.get("clients", {}).items():
        for client_id, client_data in clients.items():
            client_name = (
                client_data.get("name")
                or client_data.get("hostname")
                or client_data.get("mac", client_id)
            )

            _LOGGER.debug("Adding reconnect button for client %s", client_name)
            entities.append(
                UnifiClientReconnectButton(
                    coordinator=coordinator,
                    site_id=site_id,
                    client_id=client_id,
                )
            )

    # Add UniFi Protect chime play buttons
    if coordinator.protect_client:
        _LOGGER.debug("Setting up UniFi Protect chime play buttons")

        # Add play button for each chime
        for chime_id, chime_data in coordinator.data["protect"]["chimes"].items():
            chime_name = chime_data.get("name", f"Chime {chime_id}")

            _LOGGER.debug("Adding play button for chime %s", chime_name)
            entities.append(
                UnifiProtectChimePlayButton(
                    coordinator=coordinator,
                    chime_id=chime_id,
                )
            )

        # Add PTZ patrol start/stop buttons for cameras with PTZ support
        for camera_id, camera_data in coordinator.data["protect"]["cameras"].items():
            # Check if camera has PTZ support
            feature_flags = camera_data.get("featureFlags", {})
            if feature_flags.get("hasPtz"):
                camera_name = camera_data.get("name", f"Camera {camera_id}")

                _LOGGER.debug("Adding PTZ patrol buttons for camera %s", camera_name)

                # Add start patrol button
                entities.append(
                    UnifiProtectPTZPatrolStartButton(
                        coordinator=coordinator,
                        camera_id=camera_id,
                    )
                )

                # Add stop patrol button
                entities.append(
                    UnifiProtectPTZPatrolStopButton(
                        coordinator=coordinator,
                        camera_id=camera_id,
                    )
                )

    _LOGGER.info("Adding %d UniFi Insights buttons", len(entities))
    async_add_entities(entities)


class UnifiInsightsButton(UnifiInsightsEntity, ButtonEntity):  # type: ignore[misc]
    """Representation of a UniFi Insights Button."""

    entity_description: UnifiInsightsButtonEntityDescription

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        description: UnifiInsightsButtonEntityDescription,
        site_id: str,
        device_id: str,
    ) -> None:
        """Initialize the button."""
        super().__init__(coordinator, description, site_id, device_id)

        _LOGGER.debug(
            "Initializing button %s for device %s in site %s",
            description.key,
            device_id,
            site_id,
        )

    async def async_press(self) -> None:
        """Handle the button press."""
        _LOGGER.debug(
            "Restarting device %s (%s) in site %s",
            self._device_id,
            self.device_data.get("name", self._device_id)
            if self.device_data
            else self._device_id,
            self._site_id,
        )

        try:
            success = await self.coordinator.network_client.restart_device(
                self._site_id, self._device_id
            )
            if success:
                _LOGGER.info(
                    "Successfully initiated restart for device %s in site %s",
                    self._device_id,
                    self._site_id,
                )
            else:
                _LOGGER.error(
                    "Failed to restart device %s in site %s",
                    self._device_id,
                    self._site_id,
                )
        except Exception:
            _LOGGER.exception(
                "Error restarting device %s in site %s",
                self._device_id,
                self._site_id,
            )

    @property
    def available(self) -> bool:
        """Return if the device is available."""
        devices = self.coordinator.data.get("devices", {})
        if not isinstance(devices, dict):
            return False
        site_devices = devices.get(self._site_id, {})
        if not isinstance(site_devices, dict):
            return False
        device_data = site_devices.get(self._device_id)
        if not device_data or not isinstance(device_data, dict):
            return False
        state = device_data.get("state")
        return isinstance(state, str) and state == "ONLINE"


class UnifiProtectChimePlayButton(UnifiProtectEntity, ButtonEntity):  # type: ignore[misc]
    """Button to play a ringtone on a UniFi Protect Chime."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:bell-ring-outline"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        chime_id: str,
    ) -> None:
        """Initialize the button."""
        super().__init__(coordinator, DEVICE_TYPE_CHIME, chime_id, "play")

        # Set name
        self._attr_name = "Play"

        # Set attributes
        self._update_attributes()

    def _update_attributes(self) -> None:
        """Update button attributes."""
        chime_data = self.coordinator.data["protect"]["chimes"].get(self._device_id, {})

        # Get current ringtone from ring settings
        ring_settings = chime_data.get("ringSettings", [])
        ringtone_id = CHIME_RINGTONE_DEFAULT

        if ring_settings:
            ringtone_id = ring_settings[0].get("ringtoneId", CHIME_RINGTONE_DEFAULT)

        self._attr_extra_state_attributes = {
            ATTR_CHIME_ID: self._device_id,
            ATTR_CHIME_NAME: chime_data.get("name"),
            ATTR_CHIME_RINGTONE_ID: ringtone_id,
        }

    async def async_press(self) -> None:
        """Play the chime ringtone."""
        chime_data = self.coordinator.data["protect"]["chimes"].get(self._device_id, {})

        # Get current ringtone from ring settings
        ring_settings = chime_data.get("ringSettings", [])
        ringtone_id = CHIME_RINGTONE_DEFAULT

        if ring_settings:
            ringtone_id = ring_settings[0].get("ringtoneId", CHIME_RINGTONE_DEFAULT)

        _LOGGER.debug("Playing ringtone %s on chime %s", ringtone_id, self._device_id)

        try:
            await self.coordinator.protect_client.play_chime(
                chime_id=self._device_id,
                ringtone_id=ringtone_id,
            )
        except Exception:
            _LOGGER.exception("Error playing chime ringtone")


class UnifiPortPowerCycleButton(UnifiInsightsEntity, ButtonEntity):  # type: ignore[misc]
    """Button to power cycle a PoE port on a UniFi switch."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:power-cycle"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        site_id: str,
        device_id: str,
        port_idx: int,
    ) -> None:
        """Initialize the button."""
        # Create a fake description for the base class
        description = UnifiInsightsButtonEntityDescription(
            key=f"port_{port_idx}_power_cycle",
            name=f"Port {port_idx} Power Cycle",
            icon="mdi:power-cycle",
        )
        super().__init__(coordinator, description, site_id, device_id)
        self._port_idx = port_idx

        # Override unique ID to include port index
        self._attr_unique_id = f"{site_id}_{device_id}_port_{port_idx}_power_cycle"
        self._attr_name = f"Port {port_idx} Power Cycle"

    async def async_press(self) -> None:
        """
        Power cycle the PoE port.

        This performs a power cycle by disabling PoE, waiting briefly,
        then re-enabling PoE. This is useful for rebooting PoE devices
        like IP cameras or access points.
        """
        _LOGGER.debug(
            "Power cycling port %s on device %s in site %s",
            self._port_idx,
            self._device_id,
            self._site_id,
        )

        try:
            # Disable PoE on the port
            await self.coordinator.network_client.devices.execute_port_action(
                self._site_id,
                self._device_id,
                self._port_idx,
                poe_mode="off",
            )

            # Wait briefly for the port to power down
            await asyncio.sleep(2)

            # Re-enable PoE on the port
            await self.coordinator.network_client.devices.execute_port_action(
                self._site_id,
                self._device_id,
                self._port_idx,
                poe_mode="auto",
            )

            _LOGGER.info(
                "Successfully power cycled port %s on device %s in site %s",
                self._port_idx,
                self._device_id,
                self._site_id,
            )
        except Exception:
            _LOGGER.exception(
                "Error power cycling port %d on device %s in site %s",
                self._port_idx,
                self._device_id,
                self._site_id,
            )

    @property
    def available(self) -> bool:  # noqa: PLR0911
        """Return if the port is available for power cycling."""
        devices = self.coordinator.data.get("devices", {})
        if not isinstance(devices, dict):
            return False
        site_devices = devices.get(self._site_id, {})
        if not isinstance(site_devices, dict):
            return False
        device_data = site_devices.get(self._device_id)
        if not device_data or not isinstance(device_data, dict):
            return False

        # Check if device is online
        state = device_data.get("state")
        if not isinstance(state, str) or state != "ONLINE":
            return False

        # Check if port exists and has PoE enabled (new API format)
        interfaces = device_data.get("interfaces", {})
        if not isinstance(interfaces, dict):
            return False
        ports = interfaces.get("ports", [])
        if not isinstance(ports, list):
            return False

        for port in ports:
            if not isinstance(port, dict):
                continue
            port_idx = port.get("idx") or port.get("portIdx")
            if port_idx == self._port_idx:
                poe_config = port.get("poe", {})
                if isinstance(poe_config, dict):
                    return poe_config.get("enabled", False) is True
        return False


class UnifiClientReconnectButton(ButtonEntity):  # type: ignore[misc]
    """Button to force a client to reconnect."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:refresh"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        site_id: str,
        client_id: str,
    ) -> None:
        """Initialize the button."""
        self.coordinator = coordinator
        self._site_id = site_id
        self._client_id = client_id

        # Get client info for naming
        client_data = self._get_client_data()
        client_name = (
            client_data.get("name")
            or client_data.get("hostname")
            or client_data.get("mac", client_id)
        )

        self._attr_unique_id = f"{site_id}_{client_id}_reconnect"
        self._attr_name = f"{client_name} Reconnect"

        # Device info - associate with the connected network device (switch/AP)
        uplink_device_id = client_data.get("uplinkDeviceId") or client_data.get(
            "uplink_device_id"
        )
        if uplink_device_id:
            # Use the network device's identifiers to group under it
            self._attr_device_info: dict[str, Any] = {
                "identifiers": {(DOMAIN, f"{site_id}_{uplink_device_id}")},
            }
        else:
            # Fallback: create a standalone client device if no uplink found
            self._attr_device_info = {
                "identifiers": {(DOMAIN, f"client_{client_id}")},
                "name": client_name,
                "manufacturer": MANUFACTURER,
                "model": "Network Client",
                "via_device": (DOMAIN, site_id),
            }

    def _get_client_data(self) -> dict[str, Any]:
        """Get client data from coordinator."""
        result: dict[str, Any] = (
            self.coordinator.data.get("clients", {})
            .get(self._site_id, {})
            .get(self._client_id, {})
        )
        return result

    @property
    def available(self) -> bool:
        """Return if button is available."""
        client_data = self._get_client_data()
        return bool(client_data)

    async def async_press(self) -> None:
        """Force client to reconnect."""
        _LOGGER.debug(
            "Reconnecting client %s in site %s", self._client_id, self._site_id
        )

        try:
            await self.coordinator.network_client.clients.reconnect(
                self._site_id, self._client_id
            )
            _LOGGER.info(
                "Successfully reconnected client %s in site %s",
                self._client_id,
                self._site_id,
            )
        except Exception:
            _LOGGER.exception(
                "Error reconnecting client %s in site %s",
                self._client_id,
                self._site_id,
            )


class UnifiProtectPTZPatrolStartButton(UnifiProtectEntity, ButtonEntity):  # type: ignore[misc]
    """Button to start PTZ patrol on a UniFi Protect camera."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:cctv"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the button."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "ptz_patrol_start")
        self._attr_name = "Start PTZ Patrol"

    async def async_press(self) -> None:
        """Start PTZ patrol."""
        _LOGGER.debug("Starting PTZ patrol for camera %s", self._device_id)

        try:
            # Start patrol on slot 0 by default
            await self.coordinator.protect_client.ptz_start_patrol(
                camera_id=self._device_id,
                slot=0,
            )
            _LOGGER.info(
                "Successfully started PTZ patrol for camera %s", self._device_id
            )
        except Exception:
            _LOGGER.exception(
                "Error starting PTZ patrol for camera %s", self._device_id
            )


class UnifiProtectPTZPatrolStopButton(UnifiProtectEntity, ButtonEntity):  # type: ignore[misc]
    """Button to stop PTZ patrol on a UniFi Protect camera."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:stop-circle-outline"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the button."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "ptz_patrol_stop")
        self._attr_name = "Stop PTZ Patrol"

    async def async_press(self) -> None:
        """Stop PTZ patrol."""
        _LOGGER.debug("Stopping PTZ patrol for camera %s", self._device_id)

        try:
            await self.coordinator.protect_client.ptz_stop_patrol(
                camera_id=self._device_id,
            )
            _LOGGER.info(
                "Successfully stopped PTZ patrol for camera %s", self._device_id
            )
        except Exception:
            _LOGGER.exception(
                "Error stopping PTZ patrol for camera %s", self._device_id
            )
