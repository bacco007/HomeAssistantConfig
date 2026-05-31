"""Sensor platform for WiCAN integration."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from homeassistant.components.sensor import (
    RestoreSensor,
    SensorDeviceClass,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .attributes import SENSOR_DESCRIPTIONS, WiCANSensorEntityDescription, get_sensor_attributes
from .const import DOMAIN
from .entity import WiCANEntity
from .param_loader import (
    get_param_device_class,
    get_param_icon,
    get_param_unit,
    is_valid_class_unit_combo,
    is_valid_device_class,
)

if TYPE_CHECKING:
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import WiCANConfigEntry

_LOGGER = logging.getLogger(__name__)
PARALLEL_UPDATES = 0


def _get_pid_unit(pid_key: str, config_unit: str | None = None) -> str | None:
    """Determine the appropriate unit for a PID sensor.

    Priority order:
    1. Config unit from device (if valid/non-empty)
    2. Fallback from params.json lookup

    This ensures consistent units even if device sometimes sends None.

    Args:
        pid_key: The PID sensor key/name from the device.
        config_unit: Unit from device config (may be None/empty/"none").

    Returns:
        Unit string (e.g., "km/h", "°C") or None if no match.
    """
    # Normalize "none", empty string, None to actual None
    if config_unit in ("none", "", None):
        config_unit = None

    # If device provided a valid unit, use it
    if config_unit is not None:
        return config_unit

    # Fallback to params.json lookup
    return get_param_unit(pid_key)


def _get_pid_icon(
    pid_key: str,
    device_class: SensorDeviceClass | None,
) -> str:
    """Determine the appropriate icon for a PID sensor.

    Args:
        pid_key: The PID sensor key/name from the device.
        device_class: The resolved SensorDeviceClass, if any.

    Returns:
        MDI icon string (e.g., "mdi:engine").
    """
    device_class_str = None
    if device_class is not None:
        device_class_str = device_class.value if isinstance(device_class, SensorDeviceClass) else str(device_class)
    return get_param_icon(pid_key, device_class_str)


def _normalize_device_class(
    device_class: str | SensorDeviceClass | None,
    unit: str | None,
    pid_key: str | None = None,
) -> SensorDeviceClass | None:
    """Convert and validate device_class, filtering invalid combinations.

    Handles multiple validation scenarios:
    1. Invalid/unknown device class strings → None
    2. Mismatched class+unit combinations (e.g., speed+rpm) → None
    3. Fallback to params.json if no class provided

    Args:
        device_class: Device class from config (string or enum).
        unit: Unit of measurement for validation.
        pid_key: Optional PID key for fallback lookup.

    Returns:
        Valid SensorDeviceClass enum or None.
    """
    # Handle "none" string as None
    if isinstance(device_class, str) and device_class.lower() == "none":
        device_class = None

    # Try to get fallback from params.json if no class provided
    if device_class is None and pid_key:
        device_class = get_param_device_class(pid_key)

    # Validate the device class is known to Home Assistant
    if isinstance(device_class, str):
        if not is_valid_device_class(device_class):
            _LOGGER.debug(
                "Invalid device class '%s' for %s, ignoring",
                device_class, pid_key or "sensor",
            )
            return None
        try:
            device_class = SensorDeviceClass(device_class)
        except ValueError:
            _LOGGER.debug(
                "Unknown SensorDeviceClass '%s' for %s, ignoring",
                device_class, pid_key or "sensor",
            )
            return None

    # Validate class+unit combination
    if device_class is not None and unit is not None:
        dc_str = device_class.value if isinstance(device_class, SensorDeviceClass) else str(device_class)
        if not is_valid_class_unit_combo(dc_str, unit):
            _LOGGER.debug(
                "Invalid device_class+unit combo: %s + %s for %s, dropping device_class",
                dc_str, unit, pid_key or "sensor",
            )
            return None

    return device_class


DYNAMIC_PID_SENSORS = {}


async def async_setup_entry(  # noqa: C901
    hass: HomeAssistant,
    config_entry: WiCANConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor platform."""

    async_add_entities(
        WiCANSensorEntity(config_entry, description)
        for description in SENSOR_DESCRIPTIONS
    )

    DYNAMIC_PID_SENSORS[config_entry.entry_id] = {}

    # Restore PID sensors from config entry
    pid_keys = config_entry.data.get("pid_keys", [])
    pid_config = config_entry.data.get("config", {})
    restored_entities = []
    for pid_key in pid_keys:
        config = pid_config.get(pid_key, {})
        # Use _get_pid_unit with config unit for consistent fallback handling
        unit = _get_pid_unit(pid_key, config.get("unit"))
        device_class = _normalize_device_class(config.get("class"), unit, pid_key)
        icon = _get_pid_icon(pid_key, device_class)

        _LOGGER.debug(
            "Restoring PID sensor %s with unit=%s, device_class=%s, icon=%s",
            pid_key, unit, device_class, icon,
        )

        entity_description = WiCANSensorEntityDescription(
            key=pid_key,
            name=pid_key,
            device_class=device_class,
            native_unit_of_measurement=unit,
            state_class="measurement",
            icon=icon,
        )
        entity = WiCANPidSensorEntity(config_entry, pid_key, entity_description)
        DYNAMIC_PID_SENSORS[config_entry.entry_id][pid_key] = entity
        restored_entities.append(entity)
    if restored_entities:
        async_add_entities(restored_entities)

    async def _async_process_pid_update(data):
        pid_data = data.get("autopid_data", {})
        if not pid_data:
            return

        pid_config = data.get("config", {})
        new_entities = []
        sensors = DYNAMIC_PID_SENSORS[config_entry.entry_id]

        for pid_key in pid_data:
            if pid_key not in sensors:
                config = pid_config.get(pid_key, {})
                # Use _get_pid_unit with config unit for consistent fallback handling
                unit = _get_pid_unit(pid_key, config.get("unit"))
                device_class = _normalize_device_class(config.get("class"), unit, pid_key)
                icon = _get_pid_icon(pid_key, device_class)

                _LOGGER.debug(
                    "Creating new PID sensor %s with unit=%s, device_class=%s, icon=%s",
                    pid_key, unit, device_class, icon,
                )

                entity_description = WiCANSensorEntityDescription(
                    key=pid_key,
                    name=pid_key,
                    device_class=device_class,
                    native_unit_of_measurement=unit,
                    icon=icon,
                )
                entity = WiCANPidSensorEntity(config_entry, pid_key, entity_description)
                new_entities.append(entity)
                sensors[pid_key] = entity

        if new_entities:
            pid_keys = set(sensors.keys())
            existing_config = dict(config_entry.data.get("config", {}))
            for pid_key in pid_data:
                if pid_key in pid_config:
                    existing_config[pid_key] = pid_config[pid_key]
            new_data = dict(config_entry.data)
            new_data["pid_keys"] = list(pid_keys)
            new_data["config"] = existing_config
            hass.config_entries.async_update_entry(config_entry, data=new_data)
            async_add_entities(new_entities)

    def handle_pid_update(webhook_id, data):
        # IMPORTANT: multiple WiCAN entries share the same dispatcher signal.
        # Filter by this entry's webhook_id to avoid cross-device entity creation.
        if webhook_id != config_entry.runtime_data.webhook_id:
            return
        hass.loop.call_soon_threadsafe(
            hass.async_create_task,
            _async_process_pid_update(data),
        )

    # Connect the dispatcher signal to handle_pid_update
    unsub = async_dispatcher_connect(hass, DOMAIN, handle_pid_update)
    config_entry.async_on_unload(unsub)


class WiCANSensorEntity(WiCANEntity, RestoreSensor):
    """A sensor entity."""

    __slots__ = ("_attr_extra_state_attributes", "_attr_native_value")

    entity_description: WiCANSensorEntityDescription

    def __init__(self, config_entry, entity_description):
        super().__init__(config_entry, entity_description)
        self._attr_native_value = None
        self._attr_extra_state_attributes = None

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        key = self.entity_description.key
        status = self.coordinator.data.get("status", {})

        if key not in status:
            return

        # Get raw value and normalize it
        raw_value = status[key]
        normalized_value = self.coordinator.normalize_sensor_value(key, raw_value)

        # Update entity state
        self._attr_native_value = normalized_value
        self._attr_extra_state_attributes = get_sensor_attributes(
            self.entity_description, self.coordinator.data,
        )

        # Write state to Home Assistant
        self.async_write_ha_state()

    @callback
    def _async_handle_event(self, webhook_id: str, data) -> None:
        """Handle webhook event (backward compatibility).

        This method is kept for backward compatibility during migration.
        The coordinator pattern now handles updates via _handle_coordinator_update().
        """
        # Coordinator update will trigger _handle_coordinator_update()

    async def async_added_to_hass(self) -> None:
        """Restore entity state."""
        # Restore last known state
        state = await self.async_get_last_sensor_data()
        if state and state.native_value is not None:
            # Normalize restored value using coordinator logic
            self._attr_native_value = self.coordinator.normalize_sensor_value(
                self.entity_description.key, state.native_value,
            )

        await super().async_added_to_hass()

class WiCANPidSensorEntity(WiCANEntity, RestoreSensor):
    """Dynamic PID sensor entity."""

    __slots__ = ("_attr_native_value", "_pending_value", "_pid_key")

    entity_description: WiCANSensorEntityDescription

    def __init__(self, config_entry, pid_key, entity_description):
        _LOGGER.debug("Creating WiCANPidSensorEntity for PID: %s", pid_key)
        super().__init__(config_entry, entity_description)
        self._pid_key = pid_key
        self._attr_unique_id = f"{config_entry.entry_id}_pid_{pid_key}"
        self._attr_entity_category = None  # Regular sensor
        self._pending_value = None
        self._attr_native_value = None  # Initialize to None

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        pid_data = self.coordinator.data.get("autopid_data", {})

        if self._pid_key in pid_data:
            raw_value = pid_data[self._pid_key]
            # Normalize the value (handles numeric strings, etc.)
            self._attr_native_value = self.coordinator.normalize_sensor_value(
                self._pid_key, raw_value,
            )
            self.async_write_ha_state()

    @callback
    def _async_handle_event(self, webhook_id: str, data) -> None:
        """Handle webhook event (backward compatibility).

        Coordinator pattern now handles updates via _handle_coordinator_update().
        """

    async def async_added_to_hass(self) -> None:
        """Restore entity state and set pending value if present."""
        state = await self.async_get_last_sensor_data()
        if state:
            self._attr_native_value = state.native_value
        if self._pending_value is not None:
            self._attr_native_value = self._pending_value
            self.async_write_ha_state()
            self._pending_value = None
        await super().async_added_to_hass()
