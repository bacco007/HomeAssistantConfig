"""Support for UniFi Insights firmware updates."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.update import (
    UpdateDeviceClass,
    UpdateEntity,
    UpdateEntityFeature,
)
from homeassistant.helpers.device_registry import CONNECTION_NETWORK_MAC, DeviceInfo

from .const import DOMAIN, MANUFACTURER
from .entity import UnifiProtectEntity, get_field

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry
    from .coordinators import UnifiFacadeCoordinator

_LOGGER = logging.getLogger(__name__)

# Coordinator handles updates centrally
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,  # noqa: ARG001
    entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up update entities for UniFi Insights integration."""
    coordinator = entry.runtime_data.coordinator
    entities: list[UnifiNetworkDeviceUpdate | UnifiProtectDeviceUpdate] = []

    # Add update entities for network devices
    entities.extend(
        UnifiNetworkDeviceUpdate(
            coordinator=coordinator,
            site_id=site_id,
            device_id=device_id,
        )
        for site_id, devices in coordinator.data.get("devices", {}).items()
        for device_id in devices
    )

    # Add update entities for Protect devices (cameras, NVR, etc.)
    if coordinator.protect_client:
        # Camera updates
        entities.extend(
            UnifiProtectDeviceUpdate(
                coordinator=coordinator,
                device_type="camera",
                device_id=camera_id,
            )
            for camera_id in coordinator.data["protect"].get("cameras", {})
        )

        # NVR updates
        entities.extend(
            UnifiProtectDeviceUpdate(
                coordinator=coordinator,
                device_type="nvr",
                device_id=nvr_id,
            )
            for nvr_id in coordinator.data["protect"].get("nvrs", {})
        )

        # Light updates
        entities.extend(
            UnifiProtectDeviceUpdate(
                coordinator=coordinator,
                device_type="light",
                device_id=light_id,
            )
            for light_id in coordinator.data["protect"].get("lights", {})
        )

        # Chime updates
        entities.extend(
            UnifiProtectDeviceUpdate(
                coordinator=coordinator,
                device_type="chime",
                device_id=chime_id,
            )
            for chime_id in coordinator.data["protect"].get("chimes", {})
        )

        # Sensor updates
        entities.extend(
            UnifiProtectDeviceUpdate(
                coordinator=coordinator,
                device_type="sensor",
                device_id=sensor_id,
            )
            for sensor_id in coordinator.data["protect"].get("sensors", {})
        )

    async_add_entities(entities)


class UnifiNetworkDeviceUpdate(UpdateEntity):  # type: ignore[misc]
    """Update entity for UniFi network devices."""

    _attr_has_entity_name = True
    _attr_device_class = UpdateDeviceClass.FIRMWARE
    _attr_supported_features = UpdateEntityFeature(0)  # No install support for now

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        site_id: str,
        device_id: str,
    ) -> None:
        """Initialize the update entity."""
        self.coordinator = coordinator
        self._site_id = site_id
        self._device_id = device_id

        # Get device data
        device_data = coordinator.data["devices"][site_id][device_id]
        device_name = get_field(
            device_data, "name", default=f"UniFi Device {device_id}"
        )
        ip_address = get_field(device_data, "ipAddress", "ip_address", "ip", default="")

        # Set unique ID
        self._attr_unique_id = f"{site_id}_{device_id}_firmware_update"

        # Set name
        self._attr_name = "Firmware"

        # Create device info
        device_info: dict[str, Any] = {
            "identifiers": {(DOMAIN, f"{site_id}_{device_id}")},
            "name": f"{device_name} ({ip_address})" if ip_address else device_name,
            "manufacturer": MANUFACTURER,
            "model": get_field(device_data, "model", default="Unknown Model"),
            "sw_version": get_field(
                device_data, "firmwareVersion", "firmware_version", "version"
            ),
        }

        # Add network connections (only if MAC is not None)
        mac = get_field(device_data, "macAddress", "mac_address", "mac")
        if mac:
            device_info["connections"] = {(CONNECTION_NETWORK_MAC, mac)}

        self._attr_device_info = DeviceInfo(**device_info)

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return bool(self.coordinator.last_update_success)

    @property
    def _device_data(self) -> dict[str, Any] | None:
        """Return device data."""
        devices = self.coordinator.data["devices"].get(self._site_id, {})
        result = devices.get(self._device_id)
        return result if isinstance(result, dict) else None

    @property
    def installed_version(self) -> str | None:
        """Return the current firmware version."""
        device_data = self._device_data
        if not device_data:
            return None
        return get_field(device_data, "firmwareVersion", "firmware_version", "version")  # type: ignore[no-any-return]

    @property
    def latest_version(self) -> str | None:
        """Return the latest available firmware version."""
        device_data = self._device_data
        if not device_data:
            return None

        # Check if update is available
        is_updatable = get_field(
            device_data, "firmwareUpdatable", "firmware_updatable", default=False
        )
        if is_updatable:
            # Return a placeholder version indicating update available
            return "Update Available"

        # No update available - return current version
        return self.installed_version

    @property
    def in_progress(self) -> bool:
        """Return if an update is in progress."""
        device_data = self._device_data
        if not device_data:
            return False

        state = get_field(device_data, "state", "status", default="")
        return isinstance(state, str) and state.upper() == "UPGRADING"

    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        self.async_on_remove(
            self.coordinator.async_add_listener(self._handle_coordinator_update)
        )

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self.async_write_ha_state()


class UnifiProtectDeviceUpdate(UnifiProtectEntity, UpdateEntity):  # type: ignore[misc]
    """Update entity for UniFi Protect devices."""

    _attr_device_class = UpdateDeviceClass.FIRMWARE
    _attr_supported_features = UpdateEntityFeature(0)  # No install support for now

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        device_type: str,
        device_id: str,
    ) -> None:
        """Initialize the update entity."""
        super().__init__(coordinator, device_type, device_id, "firmware_update")

        self._attr_name = "Firmware"

    @property
    def installed_version(self) -> str | None:
        """Return the current firmware version."""
        device_data = self.device_data
        if not device_data:
            return None
        return get_field(device_data, "firmwareVersion", "firmware_version", "version")  # type: ignore[no-any-return]

    @property
    def latest_version(self) -> str | None:
        """Return the latest available firmware version."""
        device_data = self.device_data
        if not device_data:
            return None

        # Check for available firmware
        available_version = get_field(device_data, "firmwareBuild", "available_version")
        if available_version and available_version != self.installed_version:
            return available_version  # type: ignore[no-any-return]

        # Check if update is scheduled or available
        is_updating = get_field(device_data, "isUpdating", "is_updating", default=False)
        if is_updating:
            return "Updating..."

        # No update available - return current version
        return self.installed_version

    @property
    def in_progress(self) -> bool:
        """Return if an update is in progress."""
        device_data = self.device_data
        if not device_data:
            return False
        return bool(get_field(device_data, "isUpdating", "is_updating", default=False))
