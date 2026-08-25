"""Sensor platform for Synology Pro — dynamic discovery."""
from __future__ import annotations

import logging

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    PERCENTAGE,
    UnitOfInformation,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from .const import DOMAIN, is_entity_enabled_default

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities
) -> None:
    """Set up Synology Pro sensors dynamically."""
    coordinator = hass.data[DOMAIN].get(entry.entry_id)

    if not coordinator or not isinstance(coordinator, DataUpdateCoordinator):
        _LOGGER.warning("No coordinator found for sensor platform")
        return

    # Create a sensor for every discovered value
    entities = []
    discovered = coordinator.data.get("sensors", {})

    for sensor_key, meta in discovered.items():
        value = meta["value"]
        val_type = meta["type"]

        # Determine sensor characteristics
        device_class = None
        state_class = None
        unit = None
        icon = "mdi:nas"

        if val_type in ("int", "float"):
            state_class = SensorStateClass.MEASUREMENT
            key_lower = sensor_key.lower()
            if "temp" in key_lower or "temperature" in key_lower:
                device_class = SensorDeviceClass.TEMPERATURE
                unit = UnitOfTemperature.CELSIUS
                icon = "mdi:thermometer"
            elif "ram" in key_lower or "memory" in key_lower:
                unit = UnitOfInformation.MEGABYTES
                icon = "mdi:memory"
            elif "percent" in key_lower or "usage" in key_lower or "load" in key_lower:
                unit = PERCENTAGE
                icon = "mdi:gauge"
            elif "speed" in key_lower or "fan" in key_lower:
                icon = "mdi:fan"
            elif "uptime" in key_lower:
                icon = "mdi:timer-outline"
            elif "disk" in key_lower:
                icon = "mdi:harddisk"

        enabled_default = is_entity_enabled_default(sensor_key)

        entities.append(
            SynologyDynamicSensor(
                coordinator, sensor_key, sensor_key, unit, device_class, state_class, icon,
                enabled_default=enabled_default,
            )
        )

    _LOGGER.info("Synology Pro: discovered %d sensors", len(entities))
    async_add_entities(entities)

    # ── Explicit one-time disable of secondary entities ──
    # Does NOT rely on _attr_entity_registry_enabled_default (which
    # behaves inconsistently across HA versions). Directly updates
    # the entity registry. Runs once per config entry, never on restart.
    if not entry.data.get("_entities_setup_v3"):
        async def _post_setup_disable() -> None:
            """Background task: disable non-primary entities."""
            try:
                import asyncio
                await asyncio.sleep(1.5)
            except asyncio.CancelledError:
                return
            from homeassistant.helpers import entity_registry as er
            reg = er.async_get(hass)
            if not reg:
                return
            disabled = 0
            for entity in entities:
                if entity._enabled_default:
                    continue
                entity_id = reg.async_get_entity_id(
                    "sensor", DOMAIN, entity._attr_unique_id
                )
                if entity_id:
                    entry_data = reg.async_get(entity_id)
                    if entry_data and entry_data.disabled_by is None:
                        reg.async_update_entity(
                            entity_id, disabled_by="integration"
                        )
                        disabled += 1
            if disabled:
                _LOGGER.info(
                    "Synology Pro: post-setup disabled %d secondary entities",
                    disabled,
                )

        hass.async_create_task(_post_setup_disable())
        new_data = dict(entry.data)
        new_data["_entities_setup_v3"] = True
        hass.config_entries.async_update_entry(entry, data=new_data)


class SynologyDynamicSensor(CoordinatorEntity, SensorEntity):
    """A sensor dynamically created from NAS API data."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        sensor_key: str,
        name: str,
        unit: str | None = None,
        device_class: SensorDeviceClass | None = None,
        state_class: SensorStateClass | None = None,
        icon: str | None = None,
        enabled_default: bool = True,
    ):
        """Initialize."""
        super().__init__(coordinator)
        self._sensor_key = sensor_key
        self._enabled_default = enabled_default
        # Standard HA pattern for entity_registry_enabled_default
        self._attr_entity_registry_enabled_default = enabled_default
        # Human-readable name from key
        self._attr_name = sensor_key.replace(".", " ").replace("_", " ").title()
        self._attr_unique_id = f"{DOMAIN}_{sensor_key.replace('.', '_')}"
        self._attr_native_unit_of_measurement = unit
        self._attr_device_class = device_class
        self._attr_state_class = state_class
        if icon:
            self._attr_icon = icon

        self._attr_device_info = {
            "identifiers": {(DOMAIN, coordinator.config["host"])},
            "name": f"Synology NAS ({coordinator.config['host']})",
            "manufacturer": "Synology",
        }

    @property
    def native_value(self):
        """Return the sensor value."""
        sensors = self.coordinator.data.get("sensors", {})
        entry = sensors.get(self._sensor_key, {})
        return entry.get("value")
