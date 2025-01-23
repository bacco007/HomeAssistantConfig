"""Support for UniFi Site Manager sensors."""
from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
import dateutil.parser
from typing import Any, Final

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    PERCENTAGE,
    SIGNAL_STRENGTH_DECIBELS_MILLIWATT,
    UnitOfDataRate,
    UnitOfTime,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import StateType

from .const import (
    ATTR_DOWNLOAD_SPEED,
    ATTR_ISP_NAME,
    ATTR_LATENCY_AVG,
    ATTR_LATENCY_MAX,
    ATTR_PACKET_LOSS,
    ATTR_TOTAL_DEVICES,
    ATTR_UPLOAD_SPEED,
    ATTR_UPTIME,
    DOMAIN,
    ICON_ADOPTION,
    ICON_CLIENTS,
    ICON_DEVICE,
    ICON_LATENCY,
    ICON_PACKET_LOSS,
    ICON_SPEED_TEST,
    ICON_STARTUP,
    ICON_UPTIME,
    KBPS_TO_MBPS,
    STATE_CLASS_MEASUREMENT,
)
from .entity import UnifiSiteManagerSiteEntity, UnifiSiteManagerDeviceEntity

_LOGGER = logging.getLogger(__name__)

@dataclass(frozen=True, kw_only=True)
class UnifiSensorEntityDescription(SensorEntityDescription):
    """Class describing UniFi sensor entities."""

    value_fn: Callable[[dict[str, Any]], StateType | datetime]

SITE_SENSORS: Final[tuple[UnifiSensorEntityDescription, ...]] = (
    UnifiSensorEntityDescription(
        key="download_speed",
        translation_key="download_speed",
        icon=ICON_SPEED_TEST,
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=STATE_CLASS_MEASUREMENT,
        value_fn=lambda data: data.get("wan", {}).get("download_kbps", 0) / KBPS_TO_MBPS,
    ),
    UnifiSensorEntityDescription(
        key="upload_speed",
        translation_key="upload_speed",
        icon=ICON_SPEED_TEST,
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=STATE_CLASS_MEASUREMENT,
        value_fn=lambda data: data.get("wan", {}).get("upload_kbps", 0) / KBPS_TO_MBPS,
    ),
    UnifiSensorEntityDescription(
        key="latency_average",
        translation_key="latency_average",
        icon=ICON_LATENCY,
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=STATE_CLASS_MEASUREMENT,
        value_fn=lambda data: data.get("wan", {}).get("avgLatency"),
    ),
    UnifiSensorEntityDescription(
        key="latency_max",
        translation_key="latency_max",
        icon=ICON_LATENCY,
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=STATE_CLASS_MEASUREMENT,
        value_fn=lambda data: data.get("wan", {}).get("maxLatency"),
    ),
    UnifiSensorEntityDescription(
        key="packet_loss",
        translation_key="packet_loss",
        icon=ICON_PACKET_LOSS,
        native_unit_of_measurement=PERCENTAGE,
        state_class=STATE_CLASS_MEASUREMENT,
        value_fn=lambda data: data.get("wan", {}).get("packetLoss", 0),
    ),
    UnifiSensorEntityDescription(
        key="uptime",
        translation_key="uptime",
        icon=ICON_UPTIME,
        native_unit_of_measurement=PERCENTAGE,
        state_class=STATE_CLASS_MEASUREMENT,
        value_fn=lambda data: data.get("wan", {}).get("uptime", 0),
    ),
    UnifiSensorEntityDescription(
        key="total_devices",
        translation_key="total_devices",
        icon=ICON_CLIENTS,
        state_class=STATE_CLASS_MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda data: data.get("counts", {}).get("totalDevice", 0),
    ),
)

DEVICE_SENSORS: Final[tuple[UnifiSensorEntityDescription, ...]] = (
    UnifiSensorEntityDescription(
        key="firmware_version",
        translation_key="firmware_version",
        icon="mdi:text-box-check",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda data: data.get("version"),
    ),
    UnifiSensorEntityDescription(
        key="ip_address",
        translation_key="ip_address",
        icon="mdi:ip-network",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda data: data.get("ip"),
    ),
    UnifiSensorEntityDescription(
        key="model",
        translation_key="model",
        icon=ICON_DEVICE,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda data: data.get("model"),
    ),
    UnifiSensorEntityDescription(
        key="product_line",
        translation_key="product_line",
        icon=ICON_DEVICE,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda data: data.get("productLine"),
    ),
    UnifiSensorEntityDescription(
        key="adoption_time",
        translation_key="adoption_time",
        icon=ICON_ADOPTION,
        device_class=SensorDeviceClass.TIMESTAMP,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda data: (
            dateutil.parser.parse(data["adoptionTime"])
            if data.get("adoptionTime")
            else None
        ),
    ),
    UnifiSensorEntityDescription(
        key="startup_time",
        translation_key="startup_time",
        icon=ICON_STARTUP,
        device_class=SensorDeviceClass.TIMESTAMP,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda data: (
            dateutil.parser.parse(data["startupTime"])
            if data.get("startupTime")
            else None
        ),
    ),
)

async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the UniFi Site Manager sensors."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    
    _LOGGER.debug("Setting up sensors with sites data: %s", coordinator.data["sites"])
    
    entities: list[UnifiSiteManagerSensor | UnifiSiteManagerDeviceSensor] = []

    # Add site-level sensors
    for site_id, site_data in coordinator.data["sites"].items():
        # Check if site has metrics
        site_metrics = coordinator.get_site_metrics(site_id)
        _LOGGER.debug("Site %s metrics: %s", site_id, site_metrics)
        
        if not site_metrics or not isinstance(site_metrics, list) or not site_metrics:
            _LOGGER.debug("No valid metrics found for site %s", site_id)
            continue
            
        # Verify data structure
        metric_set = site_metrics[0]
        if not metric_set.get("periods"):
            _LOGGER.debug("No periods found in metrics for site %s", site_id)
            continue
            
        periods = metric_set["periods"]
        if not periods:
            _LOGGER.debug("Empty periods list for site %s", site_id)
            continue
            
        latest_data = periods[0].get("data", {})
        if not latest_data.get("wan"):
            _LOGGER.debug("No WAN data found for site %s", site_id)
            continue

        # Create sensors since we have valid data
        for description in SITE_SENSORS:
            _LOGGER.debug("Creating sensor %s for site %s", description.key, site_id)
            entities.append(
                UnifiSiteManagerSensor(
                    coordinator=coordinator,
                    description=description,
                    site_id=site_id,
                )
            )

    # Add device-level sensors
    for device_id, device_data in coordinator.data.get("devices", {}).items():
        _LOGGER.debug("Creating sensors for device %s", device_id)
        entities.extend(
            UnifiSiteManagerDeviceSensor(
                coordinator=coordinator,
                description=description,
                device_id=device_id,
            )
            for description in DEVICE_SENSORS
        )

    async_add_entities(entities)

class UnifiSiteManagerSensor(UnifiSiteManagerSiteEntity, SensorEntity):
    """Representation of a UniFi Site Manager Sensor."""

    entity_description: UnifiSensorEntityDescription

    @property
    def native_value(self) -> StateType | datetime:
        """Return the state of the sensor with validation."""
        metrics = self.site_metrics
        if not metrics:
            return None
        
        wan_data = metrics.get("wan", {})
        if not wan_data:
            _LOGGER.debug(
                "No WAN data available for sensor %s", 
                self.entity_description.key
            )
            return None
        
        try:
            return self.entity_description.value_fn(metrics)
        except Exception as err:
            _LOGGER.error(
                "Error getting value for sensor %s: %s. Metrics data: %s",
                self.entity_description.key,
                err,
                metrics
            )
            return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional state attributes."""
        metrics = self.site_metrics
        if not metrics:
            return {}
        
        metrics_data = metrics.get("wan", {})
        site_data = self.site_data or {}
        
        attrs = {
            ATTR_ISP_NAME: metrics_data.get("ispName"),
            ATTR_DOWNLOAD_SPEED: metrics_data.get("download_kbps"),
            ATTR_UPLOAD_SPEED: metrics_data.get("upload_kbps"),
            ATTR_LATENCY_AVG: metrics_data.get("avgLatency"),
            ATTR_LATENCY_MAX: metrics_data.get("maxLatency"), 
            ATTR_PACKET_LOSS: metrics_data.get("packetLoss"),
            ATTR_UPTIME: metrics_data.get("uptime"),
        }
        
        # Add total devices only if available in site data
        if site_data.get("statistics", {}).get("counts", {}).get("totalDevice") is not None:
            attrs[ATTR_TOTAL_DEVICES] = site_data["statistics"]["counts"]["totalDevice"]
            
        return attrs
    
class UnifiSiteManagerDeviceSensor(UnifiSiteManagerDeviceEntity, SensorEntity):
    """Representation of a UniFi Site Manager Device Sensor."""

    entity_description: UnifiSensorEntityDescription

    @property
    def native_value(self) -> StateType | datetime:
        """Return the state of the sensor."""
        if not self.device_data:
            return None
        
        try:
            return self.entity_description.value_fn(self.device_data)
        except Exception as err:
            _LOGGER.error(
                "Error getting value for device sensor %s: %s. Device data: %s",
                self.entity_description.key,
                err,
                self.device_data
            )
            return None