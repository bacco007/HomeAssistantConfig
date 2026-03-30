"""Support for UniFi Insights buttons."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.components.button import (
    ButtonEntity,
    ButtonEntityDescription,
)
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.device_registry import DeviceInfo

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
from .entity import (
    UnifiInsightsEntity,
    UnifiProtectEntity,
    async_call_coordinator_action,
    camera_supports_ptz,
)

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


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up buttons for UniFi Insights integration."""
    _ = hass
    coordinator: UnifiFacadeCoordinator = config_entry.runtime_data.coordinator
    entities: list[ButtonEntity] = []

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

            entities.extend(
                UnifiInsightsButton(
                    coordinator=coordinator,
                    description=description,
                    site_id=site_id,
                    device_id=device_id,
                )
                for description in BUTTON_TYPES
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
            if camera_supports_ptz(camera_data):
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


class UnifiInsightsButton(UnifiInsightsEntity, ButtonEntity):
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

        success = await async_call_coordinator_action(
            self.coordinator,
            "async_restart_device",
            f"Unable to restart device {self._device_id}",
            self._site_id,
            self._device_id,
            fallback_factory=lambda: self.coordinator.network_client.restart_device(  # type: ignore[attr-defined]
                self._site_id,
                self._device_id,
            ),
        )
        if not success:
            msg = "Unable to restart device"
            raise HomeAssistantError(msg)

        _LOGGER.info(
            "Successfully initiated restart for device %s in site %s",
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


class UnifiProtectChimePlayButton(UnifiProtectEntity, ButtonEntity):
    """Button to play a ringtone on a UniFi Protect Chime."""

    _attr_has_entity_name = True
    _attr_translation_key = "play"
    _attr_icon = "mdi:bell-ring-outline"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        chime_id: str,
    ) -> None:
        """Initialize the button."""
        super().__init__(coordinator, DEVICE_TYPE_CHIME, chime_id, "play")

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

        await async_call_coordinator_action(
            self.coordinator,
            "async_play_chime",
            f"Unable to play ringtone on chime {self._device_id}",
            self._device_id,
            ringtone_id,
            fallback_factory=lambda: self.coordinator.protect_client.play_chime(  # type: ignore[union-attr]
                chime_id=self._device_id,
                ringtone_id=ringtone_id,
            ),
        )


class UnifiClientReconnectButton(ButtonEntity):
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
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, f"{site_id}_{uplink_device_id}")},
            )
        else:
            # Fallback: create a standalone client device if no uplink found
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, f"client_{client_id}")},
                name=client_name,
                manufacturer=MANUFACTURER,
                model="Network Client",
            )

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

        await async_call_coordinator_action(
            self.coordinator,
            "async_reconnect_client",
            f"Unable to reconnect client {self._client_id}",
            self._site_id,
            self._client_id,
            fallback_factory=lambda: self.coordinator.network_client.clients.reconnect(
                self._site_id,
                self._client_id,
            ),
        )
        _LOGGER.info(
            "Successfully reconnected client %s in site %s",
            self._client_id,
            self._site_id,
        )


class UnifiProtectPTZPatrolStartButton(UnifiProtectEntity, ButtonEntity):
    """Button to start PTZ patrol on a UniFi Protect camera."""

    _attr_has_entity_name = True
    _attr_translation_key = "ptz_patrol_start"
    _attr_icon = "mdi:cctv"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the button."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "ptz_patrol_start")

    async def async_press(self) -> None:
        """Start PTZ patrol."""
        _LOGGER.debug("Starting PTZ patrol for camera %s", self._device_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_start_ptz_patrol",
            f"Unable to start PTZ patrol for camera {self._device_id}",
            self._device_id,
            0,
            fallback_factory=lambda: self.coordinator.protect_client.ptz_start_patrol(  # type: ignore[union-attr]
                camera_id=self._device_id,
                slot=0,
            ),
        )
        _LOGGER.info("Successfully started PTZ patrol for camera %s", self._device_id)


class UnifiProtectPTZPatrolStopButton(UnifiProtectEntity, ButtonEntity):
    """Button to stop PTZ patrol on a UniFi Protect camera."""

    _attr_has_entity_name = True
    _attr_translation_key = "ptz_patrol_stop"
    _attr_icon = "mdi:stop-circle-outline"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the button."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "ptz_patrol_stop")

    async def async_press(self) -> None:
        """Stop PTZ patrol."""
        _LOGGER.debug("Stopping PTZ patrol for camera %s", self._device_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_stop_ptz_patrol",
            f"Unable to stop PTZ patrol for camera {self._device_id}",
            self._device_id,
            fallback_factory=lambda: self.coordinator.protect_client.ptz_stop_patrol(  # type: ignore[union-attr]
                camera_id=self._device_id,
            ),
        )
        _LOGGER.info("Successfully stopped PTZ patrol for camera %s", self._device_id)
