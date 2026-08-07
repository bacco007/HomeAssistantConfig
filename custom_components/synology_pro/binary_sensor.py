"""Binary sensor platform for Synology Pro — dynamic discovery."""
from __future__ import annotations

import logging

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN, is_entity_enabled_default

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities
) -> None:
    """Set up Synology Pro binary sensors dynamically."""
    coordinator = hass.data[DOMAIN].get(entry.entry_id)

    if not coordinator or not isinstance(coordinator, DataUpdateCoordinator):
        _LOGGER.warning("No coordinator found for binary_sensor platform")
        return

    discovered = coordinator.data.get("sensors", {})
    entities = []

    # Boolean values become binary sensors
    for sensor_key, meta in discovered.items():
        if meta["type"] != "bool":
            continue

        value = meta["value"]
        device_class = None
        icon = "mdi:checkbox-marked"

        key_lower = sensor_key.lower()
        if "warn" in key_lower or "fail" in key_lower or "error" in key_lower:
            device_class = BinarySensorDeviceClass.PROBLEM
            icon = "mdi:alert-circle"
        elif "running" in key_lower:
            device_class = BinarySensorDeviceClass.RUNNING
            icon = "mdi:play-circle"

        enabled_default = is_entity_enabled_default(sensor_key)

        entities.append(
            SynologyDynamicBinarySensor(
                coordinator, sensor_key, sensor_key, device_class, icon,
                enabled_default=enabled_default,
            )
        )

    # Also add system health as a synthetic binary sensor
    entities.append(
        SynologyHealthBinarySensor(coordinator)
    )

    _LOGGER.info("Synology Pro: discovered %d binary sensors", len(entities))
    async_add_entities(entities)

    # ── Explicit one-time disable of secondary binary sensors ──
    if not entry.data.get("_bin_entities_setup_v3"):
        async def _post_setup_disable() -> None:
            """Background task: disable non-primary binary sensors."""
            try:
                import asyncio
                await asyncio.sleep(1.5)
            except asyncio.CancelledError:
                return
            from homeassistant.helpers import entity_registry as er
            reg = er.async_get(hass)
            if not reg:
                return
            for entity in entities:
                if entity._enabled_default:
                    continue
                entity_id = reg.async_get_entity_id(
                    "binary_sensor", DOMAIN, entity._attr_unique_id
                )
                if entity_id:
                    entry_data = reg.async_get(entity_id)
                    if entry_data and entry_data.disabled_by is None:
                        reg.async_update_entity(
                            entity_id, disabled_by="integration"
                        )

        hass.async_create_task(_post_setup_disable())
        new_data = dict(entry.data)
        new_data["_bin_entities_setup_v3"] = True
        hass.config_entries.async_update_entry(entry, data=new_data)


class SynologyDynamicBinarySensor(BinarySensorEntity):
    """A binary sensor dynamically created from NAS API boolean data."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        sensor_key: str,
        name: str,
        device_class: BinarySensorDeviceClass | None = None,
        icon: str | None = None,
        enabled_default: bool = True,
    ):
        """Initialize."""
        self.coordinator = coordinator
        self._sensor_key = sensor_key
        self._enabled_default = enabled_default
        # Standard HA pattern for entity_registry_enabled_default
        self._attr_entity_registry_enabled_default = enabled_default
        self._attr_name = sensor_key.replace(".", " ").replace("_", " ").title()
        self._attr_unique_id = f"{DOMAIN}_bin_{sensor_key.replace('.', '_')}"
        self._attr_device_class = device_class
        if icon:
            self._attr_icon = icon

        self._attr_device_info = {
            "identifiers": {(DOMAIN, coordinator.config["host"])},
            "name": f"Synology NAS ({coordinator.config['host']})",
            "manufacturer": "Synology",
        }

    @property
    def available(self) -> bool:
        """Return if sensor is available."""
        return self.coordinator.last_update_success

    @property
    def is_on(self) -> bool:
        """Return True if the binary sensor is on."""
        sensors = self.coordinator.data.get("sensors", {})
        entry = sensors.get(self._sensor_key, {})
        return bool(entry.get("value", False))

    async def async_update(self) -> None:
        """Update entity."""
        await self.coordinator.async_request_refresh()


class SynologyHealthBinarySensor(BinarySensorEntity):
    """Synthetic sensor: True if the coordinator successfully fetched data."""

    _attr_entity_registry_enabled_default = True

    def __init__(self, coordinator: DataUpdateCoordinator):
        """Initialize."""
        self.coordinator = coordinator
        self._attr_name = "System Health"
        self._attr_unique_id = f"{DOMAIN}_system_health"
        self._attr_device_class = BinarySensorDeviceClass.PROBLEM
        self._attr_icon = "mdi:shield-check"

        self._attr_device_info = {
            "identifiers": {(DOMAIN, coordinator.config["host"])},
            "name": f"Synology NAS ({coordinator.config['host']})",
            "manufacturer": "Synology",
        }

    @property
    def available(self) -> bool:
        """Always available."""
        return True

    @property
    def is_on(self) -> bool:
        """True if coordinator has data."""
        sensors = self.coordinator.data.get("sensors", {})
        return len(sensors) > 0

    async def async_update(self) -> None:
        """Update entity."""
        await self.coordinator.async_request_refresh()
