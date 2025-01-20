"""Support for UniFi Insights binary sensors."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.entity import EntityCategory

from .const import DOMAIN
from .coordinator import UnifiInsightsDataUpdateCoordinator
from .entity import UnifiInsightsEntity

_LOGGER = logging.getLogger(__name__)


@dataclass
class UnifiInsightsBinarySensorEntityDescription(BinarySensorEntityDescription):
    """Class describing UniFi Insights binary sensor entities."""
    value_fn: callable[[dict[str, Any]], bool] = None


BINARY_SENSOR_TYPES: tuple[UnifiInsightsBinarySensorEntityDescription, ...] = (
    UnifiInsightsBinarySensorEntityDescription(
        key="device_status",
        translation_key="device_status",  # Added translation key
        name="Device Status",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda device: device.get("state") == "ONLINE",
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up binary sensors for UniFi Insights integration."""
    coordinator: UnifiInsightsDataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]
    entities = []

    _LOGGER.debug("Setting up binary sensors for UniFi Insights")

    # Add binary sensors for each device in each site
    for site_id, devices in coordinator.data["devices"].items():
        site_data = coordinator.get_site(site_id)
        site_name = site_data.get("meta", {}).get("name", site_id) if site_data else site_id
        
        _LOGGER.debug(
            "Processing site %s (%s) with %d devices",
            site_id,
            site_name,
            len(devices)
        )
        
        for device_id in devices:
            device_data = coordinator.data.get("devices", {}).get(site_id, {}).get(device_id, {})
            device_name = device_data.get("name", device_id)
            
            _LOGGER.debug(
                "Creating binary sensors for device %s (%s) in site %s (%s)",
                device_id,
                device_name,
                site_id,
                site_name
            )
            
            for description in BINARY_SENSOR_TYPES:
                entities.append(
                    UnifiInsightsBinarySensor(
                        coordinator=coordinator,
                        description=description,
                        site_id=site_id,
                        device_id=device_id,
                    )
                )

    _LOGGER.info("Adding %d UniFi Insights binary sensors", len(entities))
    async_add_entities(entities)


class UnifiInsightsBinarySensor(UnifiInsightsEntity, BinarySensorEntity):
    """Representation of a UniFi Insights Binary Sensor."""

    entity_description: UnifiInsightsBinarySensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        description: UnifiInsightsBinarySensorEntityDescription,
        site_id: str,
        device_id: str,
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator, description, site_id, device_id)
        
        _LOGGER.debug(
            "Initializing binary sensor %s for device %s in site %s",
            description.key,
            device_id,
            site_id
        )

        # Mark binary sensors as "Diagnostic" entities
        self._attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def is_on(self) -> bool | None:
        """Return true if the binary sensor is on."""
        if not self.coordinator.data["devices"].get(self._site_id, {}).get(self._device_id):
            _LOGGER.debug(
                "No device data for binary sensor %s (device %s in site %s)",
                self.entity_description.key,
                self._device_id,
                self._site_id
            )
            return None

        device = self.coordinator.data["devices"][self._site_id][self._device_id]
        return self.entity_description.value_fn(device)