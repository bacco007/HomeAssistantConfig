"""Support for WeatherFlow binary sensor data."""
from __future__ import annotations

import logging

from dataclasses import dataclass
from types import MappingProxyType
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_NAME,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from . import WeatherFlowForecastDataUpdateCoordinator
from .const import (
    ATTR_ATTRIBUTION,
    CONF_STATION_ID,
    DOMAIN,
    MANUFACTURER,
    MODEL,
)

@dataclass
class WeatherFlowBinarySensorEntityDescription(BinarySensorEntityDescription):
    """Describes WeatherFlow binary sensor entity."""


BINARY_SENSOR_TYPES: tuple[WeatherFlowBinarySensorEntityDescription, ...] = (
    WeatherFlowBinarySensorEntityDescription(
        key="data_available",
        name="Data Available",
        icon="mdi:database-check",
    ),
    WeatherFlowBinarySensorEntityDescription(
        key="is_freezing",
        name="Is Freezing",
        icon="mdi:snowflake-alert",
        device_class=BinarySensorDeviceClass.COLD
    ),
    WeatherFlowBinarySensorEntityDescription(
        key="is_lightning",
        name="Is Lightning",
        icon="mdi:flash-alert",
        device_class=BinarySensorDeviceClass.SAFETY
    ),
    WeatherFlowBinarySensorEntityDescription(
        key="is_raining",
        name="Is Raining",
        icon="mdi:water-percent-alert",
        device_class=BinarySensorDeviceClass.MOISTURE
    ),
)

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    """WeatherFlow binary sensor platform."""
    coordinator: WeatherFlowForecastDataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]

    if coordinator.data.sensor_data == {}:
        return

    entities: list[WeatherFlowBinarySensor[Any]] = [
        WeatherFlowBinarySensor(coordinator, description, config_entry)
        for description in BINARY_SENSOR_TYPES if getattr(coordinator.data.sensor_data, description.key) is not None
    ]

    async_add_entities(entities, False)

class WeatherFlowBinarySensor(CoordinatorEntity[DataUpdateCoordinator], BinarySensorEntity):
    """A WeatherFlow binary sensor."""

    entity_description: WeatherFlowBinarySensorEntityDescription
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: WeatherFlowForecastDataUpdateCoordinator,
        description: WeatherFlowBinarySensorEntityDescription,
        config: MappingProxyType[str, Any]
    ) -> None:
        """Initialize a WeatherFlow binary sensor."""
        super().__init__(coordinator)
        self.entity_description = description
        self._config = config
        self._coordinator = coordinator
        self._hw_version = " - Not Available" if self._coordinator.data.station_data.firmware_revision is None else self._coordinator.data.station_data.firmware_revision

        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{self._config.data[CONF_STATION_ID]}_binary")},
            entry_type=DeviceEntryType.SERVICE,
            manufacturer=MANUFACTURER,
            model=MODEL,
            name=f"{self._config.data[CONF_NAME]} Binary Sensors",
            configuration_url=f"https://tempestwx.com/station/{self._config.data[CONF_STATION_ID]}/grid",
            hw_version=f"FW V{self._hw_version}",
        )
        self._attr_attribution = ATTR_ATTRIBUTION
        self._attr_unique_id = f"{config.data[CONF_STATION_ID]} {description.key}"

    @property
    def is_on(self) -> StateType:
        """Return state of the sensor."""

        return (
            getattr(self.coordinator.data.sensor_data, self.entity_description.key)
            if self.coordinator.data.sensor_data else None
        )

    async def async_added_to_hass(self):
        """When entity is added to hass."""
        self.async_on_remove(
            self.coordinator.async_add_listener(self.async_write_ha_state)
        )
