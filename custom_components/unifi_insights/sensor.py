"""Support for UniFi Insights sensors."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
    EntityCategory,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    PERCENTAGE,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import StateType

from .const import DOMAIN
from .coordinator import UnifiInsightsDataUpdateCoordinator
from .entity import UnifiInsightsEntity

_LOGGER = logging.getLogger(__name__)

@dataclass
class UnifiInsightsSensorEntityDescription(SensorEntityDescription):
    """Class describing UniFi Insights sensor entities."""
    value_fn: callable[[dict[str, Any]], StateType] = None

def format_uptime(seconds: int | None) -> str | None:
    """Format uptime into days, hours, minutes."""
    if seconds is None:
        return None
        
    days = seconds // (24 * 3600)
    seconds %= (24 * 3600)
    hours = seconds // 3600
    seconds %= 3600
    minutes = seconds // 60
    
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0 or days > 0:  # Show hours if days present
        parts.append(f"{hours}h")
    parts.append(f"{minutes}m")
    
    return " ".join(parts)

def bytes_to_megabits(bytes_per_sec: float | None) -> float | None:
    """Convert bytes per second to megabits per second."""
    if bytes_per_sec is None:
        return None
    return round(bytes_per_sec * 8 / 1_000_000, 2)

SENSOR_TYPES: tuple[UnifiInsightsSensorEntityDescription, ...] = (
    UnifiInsightsSensorEntityDescription(
        key="cpu_usage",
        translation_key="cpu_usage",
        name="CPU Usage",
        native_unit_of_measurement=PERCENTAGE,
        device_class=SensorDeviceClass.POWER_FACTOR,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:cpu-64-bit",
        value_fn=lambda stats: stats.get("cpuUtilizationPct"),
    ),
    UnifiInsightsSensorEntityDescription(
        key="memory_usage",
        translation_key="memory_usage",
        name="Memory Usage",
        native_unit_of_measurement=PERCENTAGE,
        device_class=SensorDeviceClass.POWER_FACTOR,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:memory",
        value_fn=lambda stats: stats.get("memoryUtilizationPct"),
    ),
    UnifiInsightsSensorEntityDescription(
        key="uptime",
        translation_key="uptime",
        name="Uptime",
        device_class=None,
        icon="mdi:clock-start",
        value_fn=lambda stats: format_uptime(stats.get("uptimeSec")),
    ),
    UnifiInsightsSensorEntityDescription(
        key="tx_rate",
        translation_key="tx_rate",
        name="TX Rate",
        native_unit_of_measurement="Mbit/s",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:upload-network",
        value_fn=lambda stats: bytes_to_megabits(stats.get("uplink", {}).get("txRateBps")),
    ),
    UnifiInsightsSensorEntityDescription(
        key="rx_rate",
        translation_key="rx_rate",
        name="RX Rate",
        native_unit_of_measurement="Mbit/s",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:download-network",
        value_fn=lambda stats: bytes_to_megabits(stats.get("uplink", {}).get("rxRateBps")),
    ),
    UnifiInsightsSensorEntityDescription(
        key="firmware_version",
        translation_key="firmware_version",
        name="Firmware Version",
        entity_category=EntityCategory.DIAGNOSTIC,
        icon="mdi:text-box-check",
        value_fn=lambda device: device.get("firmwareVersion"),
    ),
    UnifiInsightsSensorEntityDescription(
        key="wired_clients",
        translation_key="wired_clients",
        name="Wired Clients",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:network",
        value_fn=lambda stats: len([
            c for c in stats.get("clients", [])
            if c.get("type") == "WIRED" and c.get("uplinkDeviceId") == stats.get("id")
        ]),
    ),
    UnifiInsightsSensorEntityDescription(
        key="wireless_clients",
        translation_key="wireless_clients", 
        name="Wireless Clients",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:wifi",
        value_fn=lambda stats: len([
            c for c in stats.get("clients", [])
            if c.get("type") == "WIRELESS" and c.get("uplinkDeviceId") == stats.get("id")
        ]),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensors for UniFi Insights integration."""
    _LOGGER.debug("Setting up UniFi Insights sensors")
    
    coordinator: UnifiInsightsDataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]
    entities = []
    
    # Add sensors for each device in each site
    for site_id, devices in coordinator.data["devices"].items():
        _LOGGER.debug(
            "Processing site %s with %d devices",
            site_id,
            len(devices)
        )
        site_data = coordinator.get_site(site_id)
        site_name = site_data.get("meta", {}).get("name", site_id) if site_data else site_id
        
        for device_id in devices:
            device_data = coordinator.data.get("devices", {}).get(site_id, {}).get(device_id, {})
            device_name = device_data.get("name", device_id)
            
            _LOGGER.debug(
                "Creating sensors for device %s (%s) in site %s (%s)",
                device_id,
                device_name,
                site_id,
                site_name
            )
            
            for description in SENSOR_TYPES:
                entities.append(
                    UnifiInsightsSensor(
                        coordinator=coordinator,
                        description=description,
                        site_id=site_id,
                        device_id=device_id,
                    )
                )
    
    _LOGGER.info(
        "Adding %d UniFi Insights sensors for %d devices",
        len(entities),
        len(coordinator.data["devices"])
    )
    async_add_entities(entities)


class UnifiInsightsSensor(UnifiInsightsEntity, SensorEntity):
    """Representation of a UniFi Insights Sensor."""

    entity_description: UnifiInsightsSensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        description: UnifiInsightsSensorEntityDescription,
        site_id: str,
        device_id: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, description, site_id, device_id)
        
        _LOGGER.debug(
            "Initializing %s sensor for device %s in site %s",
            description.key,
            device_id,
            site_id
        )

    @property
    def native_value(self) -> StateType:
        """Return the state of the sensor."""
        # Special handling for firmware version which comes from device data
        if self.entity_description.key == "firmware_version":
            device = self.coordinator.data["devices"].get(self._site_id, {}).get(self._device_id)
            if not device:
                _LOGGER.debug(
                    "No device data available for firmware version sensor (device %s in site %s)",
                    self._device_id,
                    self._site_id
                )
                return None
            value = self.entity_description.value_fn(device)
        else:
            # For all other sensors, use stats data
            if not self.coordinator.data["stats"].get(self._site_id, {}).get(self._device_id):
                _LOGGER.debug(
                    "No stats available for sensor %s (device %s in site %s)",
                    self.entity_description.key,
                    self._device_id,
                    self._site_id
                )
                return None
                
            stats = self.coordinator.data["stats"][self._site_id][self._device_id]
            value = self.entity_description.value_fn(stats)
        
        _LOGGER.debug(
            "Sensor %s for device %s in site %s updated to %s %s",
            self.entity_description.key,
            self._device_id,
            self._site_id,
            value,
            self.native_unit_of_measurement or ""
        )
        
        return value

    async def async_update(self) -> None:
        """Update the sensor."""
        await super().async_update()
        _LOGGER.debug(
            "Updated sensor %s for device %s in site %s",
            self.entity_description.key,
            self._device_id,
            self._site_id
        )