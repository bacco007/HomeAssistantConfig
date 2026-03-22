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
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, MANUFACTURER
from .coordinators import UnifiFacadeCoordinator
from .entity import get_field

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry

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
    entities: list[UnifiNetworkDeviceUpdate] = []

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

    async_add_entities(entities)


class UnifiNetworkDeviceUpdate(CoordinatorEntity[UnifiFacadeCoordinator], UpdateEntity):  # type: ignore[misc]
    """Update entity for UniFi network devices."""

    _attr_has_entity_name = True
    _attr_translation_key = "firmware"
    _attr_device_class = UpdateDeviceClass.FIRMWARE
    _attr_supported_features = UpdateEntityFeature(0)  # No install support for now

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        site_id: str,
        device_id: str,
    ) -> None:
        """Initialize the update entity."""
        super().__init__(coordinator)
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
            # Try to get the actual available firmware version
            new_version = get_field(
                device_data,
                "upgradeToFirmware",
                "upgrade_to_firmware",
                "availableFirmwareVersion",
                "available_firmware_version",
            )
            if new_version:
                return new_version  # type: ignore[no-any-return]
            # Fallback: indicate update by returning a synthetic higher version
            current = self.installed_version
            if current:
                return f"{current}+update"
            return "update-available"

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
