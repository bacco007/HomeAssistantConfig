"""Support for UniFi Insights sensors."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.components.sensor import (
    EntityCategory,
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import (
    LIGHT_LUX,
    PERCENTAGE,
    UnitOfDataRate,
    UnitOfInformation,
    UnitOfPower,
    UnitOfTemperature,
)
from homeassistant.core import callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    ATTR_NVR_ID,
    ATTR_NVR_NAME,
    ATTR_NVR_STORAGE_AVAILABLE,
    ATTR_NVR_STORAGE_TOTAL,
    ATTR_NVR_STORAGE_USED,
    ATTR_NVR_STORAGE_USED_PERCENT,
    ATTR_NVR_VERSION,
    ATTR_SENSOR_BATTERY,
    ATTR_SENSOR_BATTERY_LOW,
    ATTR_SENSOR_HUMIDITY_VALUE,
    ATTR_SENSOR_ID,
    ATTR_SENSOR_LIGHT_VALUE,
    ATTR_SENSOR_NAME,
    ATTR_SENSOR_TEMPERATURE_VALUE,
    DEVICE_TYPE_NVR,
    DEVICE_TYPE_SENSOR,
    DOMAIN,
    MANUFACTURER,
)
from .coordinators import UnifiFacadeCoordinator
from .entity import UnifiInsightsEntity, UnifiProtectEntity, get_field
from .entity import get_client_type as _get_client_type

if TYPE_CHECKING:
    from collections.abc import Callable

    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback
    from homeassistant.helpers.typing import StateType

    from . import UnifiInsightsConfigEntry

from homeassistant.helpers.entity import DeviceInfo

_LOGGER = logging.getLogger(__name__)


# Coordinator handles updates centrally (Gold/Platinum requirement)
PARALLEL_UPDATES = 0


@dataclass
class UnifiInsightsSensorEntityDescription(SensorEntityDescription):  # type: ignore[misc]
    """Class describing UniFi Insights sensor entities."""

    value_fn: Callable[[dict[str, Any]], StateType] | None = None
    # Device feature required for this sensor (e.g., 'switching', 'accessPoint')
    # If None, sensor applies to all devices
    required_feature: str | None = None


@dataclass
class UnifiProtectSensorEntityDescription(SensorEntityDescription):  # type: ignore[misc]
    """Class describing UniFi Protect sensor entities."""

    value_fn: Callable[[dict[str, Any]], StateType] | None = None
    device_type: str | None = None
    capability_fn: Callable[[dict[str, Any]], bool] | None = None


def format_uptime(seconds: int | None) -> str | None:
    """Format uptime into days, hours, minutes."""
    if seconds is None:
        return None

    days = seconds // (24 * 3600)
    seconds %= 24 * 3600
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


def get_stats_field(stats: dict, *keys: str, default: Any = None) -> Any:
    """Get a field from stats handling both camelCase and snake_case."""
    return get_field(stats, *keys, default=default)


def bytes_to_megabits(bytes_per_sec: float | None) -> float | None:
    """Convert bytes per second to megabits per second."""
    if bytes_per_sec is None:
        return None
    return round(bytes_per_sec * 8 / 1_000_000, 2)


def bytes_to_bits(bytes_per_sec: float | None) -> float | None:
    """Convert bytes per second to bits per second."""
    if bytes_per_sec is None:
        return None
    return bytes_per_sec * 8


def _get_temperature_entry_value(
    temperatures: list[dict[str, Any]],
    preferred_name: str,
) -> float | int | None:
    """Return a temperature value from a named legacy device temperature entry."""
    preferred_name_lower = preferred_name.lower()
    for temperature in temperatures:
        name = temperature.get("name")
        value = temperature.get("value")
        if (
            isinstance(name, str)
            and preferred_name_lower in name.lower()
            and isinstance(value, (int, float))
        ):
            return value

    return None


def get_network_device_temperature(device: dict[str, Any]) -> float | int | None:
    """Extract a network device temperature from merged device data."""
    direct_temperature = get_field(
        device,
        "generalTemperature",
        "general_temperature",
        "temperature",
    )
    if isinstance(direct_temperature, (int, float)):
        return direct_temperature

    temperatures = get_field(device, "temperatures", default=[])
    if not isinstance(temperatures, list):
        return None

    normalized_temperatures = [
        item
        for item in temperatures
        if isinstance(item, dict) and item.get("value") is not None
    ]
    if not normalized_temperatures:
        return None

    for preferred_name in ("local", "cpu", "phy"):
        value = _get_temperature_entry_value(normalized_temperatures, preferred_name)
        if value is not None:
            return value

    first_value = normalized_temperatures[0].get("value")
    return first_value if isinstance(first_value, (int, float)) else None


# Sensor descriptions for UniFi Protect sensors
def _has_protect_stat(
    stat_key: str, flat_key: str | None = None
) -> Callable[[dict[str, Any]], bool]:
    """Return a capability check for a Protect sensor measurement."""

    def check(data: dict[str, Any]) -> bool:
        stats = data.get("stats")
        if isinstance(stats, dict):
            entry = stats.get(stat_key)
            if isinstance(entry, dict) and entry.get("value") is not None:
                return True
        return bool(flat_key and data.get(flat_key) is not None)

    return check


PROTECT_SENSOR_TYPES: tuple[UnifiProtectSensorEntityDescription, ...] = (
    # Temperature sensor
    UnifiProtectSensorEntityDescription(
        key="temperature",
        translation_key="temperature",
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda sensor: (
            sensor.get("stats", {}).get("temperature", {}).get("value")
        ),
        device_type=DEVICE_TYPE_SENSOR,
        capability_fn=_has_protect_stat("temperature", "temperature"),
    ),
    # Humidity sensor
    UnifiProtectSensorEntityDescription(
        key="humidity",
        translation_key="humidity",
        native_unit_of_measurement=PERCENTAGE,
        device_class=SensorDeviceClass.HUMIDITY,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda sensor: (
            sensor.get("stats", {}).get("humidity", {}).get("value")
        ),
        device_type=DEVICE_TYPE_SENSOR,
        capability_fn=_has_protect_stat("humidity", "humidity"),
    ),
    # Light sensor
    UnifiProtectSensorEntityDescription(
        key="light",
        translation_key="light",
        native_unit_of_measurement=LIGHT_LUX,
        device_class=SensorDeviceClass.ILLUMINANCE,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda sensor: sensor.get("stats", {}).get("light", {}).get("value"),
        device_type=DEVICE_TYPE_SENSOR,
        capability_fn=_has_protect_stat("light", "lightValue"),
    ),
    # Battery sensor
    UnifiProtectSensorEntityDescription(
        key="battery",
        translation_key="battery",
        native_unit_of_measurement=PERCENTAGE,
        device_class=SensorDeviceClass.BATTERY,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda sensor: sensor.get("batteryStatus", {}).get("percentage"),
        device_type=DEVICE_TYPE_SENSOR,
    ),
)


def _bytes_to_gb(bytes_value: int | None) -> float | None:
    """Convert bytes to gigabytes."""
    if bytes_value is None:
        return None
    return round(bytes_value / (1024**3), 2)


def _has_storage_info(nvr_data: dict[str, Any]) -> bool:
    """
    Check if NVR data contains storage information.

    The UniFi Protect Integration API v1 (public API with API keys) does not
    return storage information. This function checks if storage data is available.
    """
    # Check for direct storage fields
    if nvr_data.get("storageUsedBytes") or nvr_data.get("storageTotalBytes"):
        return True
    if nvr_data.get("storage_used_bytes") or nvr_data.get("storage_total_bytes"):
        return True

    # Check nested storageInfo
    storage_info = nvr_data.get("storageInfo")
    if isinstance(storage_info, dict):
        # Check library model field names (usedSize, totalSize)
        if storage_info.get("usedSize") or storage_info.get("totalSize"):
            return True
        # Check alternative field names
        if storage_info.get("used_size") or storage_info.get("total_size"):
            return True

    return False


def _get_storage_bytes(nvr_data: dict[str, Any], field: str) -> int | None:
    """
    Get storage bytes from NVR data, checking both direct and nested fields.

    The API may return storage data in different formats:
    - Direct: storageUsedBytes, storageTotalBytes
    - Snake case: storage_used_bytes, storage_total_bytes
    - Nested (library model): storageInfo.usedSize, storageInfo.totalSize
    - Nested (snake_case): storageInfo.used_size, storageInfo.total_size
    """
    # Check direct camelCase fields
    if field == "used":
        value = nvr_data.get("storageUsedBytes") or nvr_data.get("storage_used_bytes")
        if value is not None:
            return int(value) if isinstance(value, (int, float)) else None
        # Check nested storageInfo (library model uses usedSize/totalSize)
        storage_info = nvr_data.get("storageInfo")
        if isinstance(storage_info, dict):
            nested_value = (
                storage_info.get("usedSize")
                or storage_info.get("used_size")
                or storage_info.get("usedSpaceBytes")
                or storage_info.get("used_space_bytes")
            )
            return int(nested_value) if isinstance(nested_value, (int, float)) else None
    elif field == "total":
        value = nvr_data.get("storageTotalBytes") or nvr_data.get("storage_total_bytes")
        if value is not None:
            return int(value) if isinstance(value, (int, float)) else None
        # Check nested storageInfo (library model uses usedSize/totalSize)
        storage_info = nvr_data.get("storageInfo")
        if isinstance(storage_info, dict):
            nested_value = (
                storage_info.get("totalSize")
                or storage_info.get("total_size")
                or storage_info.get("totalSpaceBytes")
                or storage_info.get("total_space_bytes")
            )
            return int(nested_value) if isinstance(nested_value, (int, float)) else None
    return None


def _calculate_storage_percent(nvr_data: dict[str, Any]) -> float | None:
    """Calculate storage used percentage."""
    used = _get_storage_bytes(nvr_data, "used")
    total = _get_storage_bytes(nvr_data, "total")
    if used is None or total is None or total == 0:
        return None
    result: float = round((used / total) * 100, 1)
    return result


def _calculate_storage_available(nvr_data: dict[str, Any]) -> float | None:
    """Calculate available storage in GB."""
    used = _get_storage_bytes(nvr_data, "used")
    total = _get_storage_bytes(nvr_data, "total")
    if used is None or total is None:
        return None
    return _bytes_to_gb(total - used)


# Sensor descriptions for UniFi Protect NVR
NVR_SENSOR_TYPES: tuple[UnifiProtectSensorEntityDescription, ...] = (
    # Storage Used
    UnifiProtectSensorEntityDescription(
        key="storage_used",
        translation_key="storage_used",
        native_unit_of_measurement=UnitOfInformation.GIGABYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:harddisk",
        value_fn=lambda nvr: _bytes_to_gb(_get_storage_bytes(nvr, "used")),
        device_type=DEVICE_TYPE_NVR,
    ),
    # Storage Total
    UnifiProtectSensorEntityDescription(
        key="storage_total",
        translation_key="storage_total",
        native_unit_of_measurement=UnitOfInformation.GIGABYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:harddisk",
        value_fn=lambda nvr: _bytes_to_gb(_get_storage_bytes(nvr, "total")),
        device_type=DEVICE_TYPE_NVR,
    ),
    # Storage Available
    UnifiProtectSensorEntityDescription(
        key="storage_available",
        translation_key="storage_available",
        native_unit_of_measurement=UnitOfInformation.GIGABYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:harddisk",
        value_fn=_calculate_storage_available,
        device_type=DEVICE_TYPE_NVR,
    ),
    # Storage Used Percentage
    UnifiProtectSensorEntityDescription(
        key="storage_used_percent",
        translation_key="storage_used_percent",
        native_unit_of_measurement=PERCENTAGE,
        device_class=None,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:harddisk",
        value_fn=_calculate_storage_percent,
        device_type=DEVICE_TYPE_NVR,
    ),
)

# Sensor descriptions for UniFi Insights sensors
SENSOR_TYPES: tuple[UnifiInsightsSensorEntityDescription, ...] = (
    UnifiInsightsSensorEntityDescription(
        key="cpu_usage",
        translation_key="cpu_usage",
        native_unit_of_measurement=PERCENTAGE,
        device_class=None,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:cpu-64-bit",
        value_fn=lambda stats: get_stats_field(
            stats, "cpuUtilizationPct", "cpu_utilization_pct", "cpu_percent", "cpu"
        ),
    ),
    UnifiInsightsSensorEntityDescription(
        key="memory_usage",
        translation_key="memory_usage",
        native_unit_of_measurement=PERCENTAGE,
        device_class=None,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:memory",
        value_fn=lambda stats: get_stats_field(
            stats,
            "memoryUtilizationPct",
            "memory_utilization_pct",
            "memory_percent",
            "memory",
        ),
    ),
    UnifiInsightsSensorEntityDescription(
        key="uptime",
        translation_key="uptime",
        device_class=None,
        # Diagnostic - uptime is informational/troubleshooting data
        entity_category=EntityCategory.DIAGNOSTIC,
        # Gold: Disable diagnostic entities by default
        entity_registry_enabled_default=False,
        icon="mdi:clock-start",
        value_fn=lambda stats: format_uptime(
            get_stats_field(
                stats, "uptimeSec", "uptime_sec", "uptime_seconds", "uptime"
            )
        ),
    ),
    UnifiInsightsSensorEntityDescription(
        key="tx_rate",
        translation_key="tx_rate",
        native_unit_of_measurement=UnitOfDataRate.BITS_PER_SECOND,
        suggested_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        suggested_display_precision=1,
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:upload-network",
        value_fn=lambda stats: bytes_to_bits(
            get_stats_field(stats, "uplink", "uplink_stats", default={}).get(
                "txRateBps"
            )
            or get_stats_field(stats, "uplink", "uplink_stats", default={}).get(
                "tx_rate_bps"
            )
            or get_stats_field(stats, "txRateBps", "tx_rate_bps", "tx_bytes_per_sec")
        ),
    ),
    UnifiInsightsSensorEntityDescription(
        key="rx_rate",
        translation_key="rx_rate",
        native_unit_of_measurement=UnitOfDataRate.BITS_PER_SECOND,
        suggested_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        suggested_display_precision=1,
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:download-network",
        value_fn=lambda stats: bytes_to_bits(
            get_stats_field(stats, "uplink", "uplink_stats", default={}).get(
                "rxRateBps"
            )
            or get_stats_field(stats, "uplink", "uplink_stats", default={}).get(
                "rx_rate_bps"
            )
            or get_stats_field(stats, "rxRateBps", "rx_rate_bps", "rx_bytes_per_sec")
        ),
    ),
    UnifiInsightsSensorEntityDescription(
        key="poe_total_power",
        translation_key="poe_total_power",
        native_unit_of_measurement=UnitOfPower.WATT,
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:flash",
        # Only show on switch devices (devices with 'switching' feature)
        required_feature="switching",
        value_fn=lambda stats: get_stats_field(
            stats,
            "poe_total_w",
            "poeTotalW",
            "total_used_power",
            "totalUsedPower",
        ),
    ),
    UnifiInsightsSensorEntityDescription(
        key="firmware_version",
        translation_key="firmware_version",
        entity_category=EntityCategory.DIAGNOSTIC,
        # Gold: Disable diagnostic entities by default
        entity_registry_enabled_default=False,
        icon="mdi:text-box-check",
        value_fn=lambda device: get_field(
            device, "firmwareVersion", "firmware_version", "version"
        ),
    ),
    UnifiInsightsSensorEntityDescription(
        key="general_temperature",
        translation_key="general_temperature",
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        icon="mdi:thermometer",
        value_fn=get_network_device_temperature,
    ),
    UnifiInsightsSensorEntityDescription(
        key="wired_clients",
        translation_key="wired_clients",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:network",
        # Only show on switch devices (devices with 'switching' feature)
        required_feature="switching",
        value_fn=lambda stats: len(
            [c for c in stats.get("clients", []) if _get_client_type(c) == "WIRED"]
        ),
    ),
    UnifiInsightsSensorEntityDescription(
        key="wireless_clients",
        translation_key="wireless_clients",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:wifi",
        # Only show on access point devices (devices with 'accessPoint' feature)
        required_feature="accessPoint",
        value_fn=lambda stats: len(
            [c for c in stats.get("clients", []) if _get_client_type(c) == "WIRELESS"]
        ),
    ),
)

# Port sensor descriptions for UniFi switches
# These are templates - actual sensors are created dynamically per port
PORT_SENSOR_TYPES: tuple[UnifiInsightsSensorEntityDescription, ...] = (
    # PoE Power Consumption
    UnifiInsightsSensorEntityDescription(
        key="port_poe_power",
        translation_key="port_poe_power",
        native_unit_of_measurement=UnitOfPower.WATT,
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=None,  # Changed from DIAGNOSTIC to make visible by default
        icon="mdi:flash",
        value_fn=lambda port: (
            get_field(port, "poe_power_w")
            or get_field(port, "poe", default={}).get("power")
            or get_field(port, "poe", default={}).get("watts")
        ),
    ),
    # Port Speed
    UnifiInsightsSensorEntityDescription(
        key="port_speed",
        translation_key="port_speed",
        native_unit_of_measurement="Mbps",
        device_class=None,
        state_class=SensorStateClass.MEASUREMENT,
        # Diagnostic - port speed is configuration/status, not monitored data
        entity_category=EntityCategory.DIAGNOSTIC,
        # Gold: Disable diagnostic entities by default
        entity_registry_enabled_default=False,
        icon="mdi:speedometer",
        value_fn=lambda port: (
            get_field(port, "speedMbps", "speed_mbps", "speed")
            if get_field(port, "state", "status", default="").upper() == "UP"
            else 0
        ),
    ),
    # Port TX
    UnifiInsightsSensorEntityDescription(
        key="port_tx_bytes",
        translation_key="port_tx_bytes",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        suggested_unit_of_measurement=UnitOfInformation.GIGABYTES,
        suggested_display_precision=1,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.TOTAL_INCREASING,
        entity_category=None,  # Changed from DIAGNOSTIC to make visible by default
        icon="mdi:upload",
        value_fn=lambda port: (
            get_field(port, "stats", default={}).get("txBytes")
            or get_field(port, "stats", default={}).get("tx_bytes", 0)
        ),
    ),
    # Port RX
    UnifiInsightsSensorEntityDescription(
        key="port_rx_bytes",
        translation_key="port_rx_bytes",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        suggested_unit_of_measurement=UnitOfInformation.GIGABYTES,
        suggested_display_precision=1,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.TOTAL_INCREASING,
        entity_category=None,  # Changed from DIAGNOSTIC to make visible by default
        icon="mdi:download",
        value_fn=lambda port: (
            get_field(port, "stats", default={}).get("rxBytes")
            or get_field(port, "stats", default={}).get("rx_bytes", 0)
        ),
    ),
)

# Per-port throughput rate sensor descriptions (computed from byte count deltas)
PORT_RATE_SENSOR_TYPES: tuple[UnifiInsightsSensorEntityDescription, ...] = (
    # Port TX Rate
    UnifiInsightsSensorEntityDescription(
        key="port_tx_rate",
        translation_key="port_tx_rate",
        native_unit_of_measurement=UnitOfDataRate.BITS_PER_SECOND,
        suggested_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        suggested_display_precision=1,
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=None,
        icon="mdi:upload-network",
        value_fn=lambda _port: None,  # Handled in entity native_value
    ),
    # Port RX Rate
    UnifiInsightsSensorEntityDescription(
        key="port_rx_rate",
        translation_key="port_rx_rate",
        native_unit_of_measurement=UnitOfDataRate.BITS_PER_SECOND,
        suggested_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        suggested_display_precision=1,
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=None,
        icon="mdi:download-network",
        value_fn=lambda _port: None,  # Handled in entity native_value
    ),
)

# SFP sensor descriptions for SFP/SFP+ ports
SFP_SENSOR_TYPES: tuple[UnifiInsightsSensorEntityDescription, ...] = (
    # SFP Module Model
    UnifiInsightsSensorEntityDescription(
        key="port_sfp_module",
        translation_key="port_sfp_module",
        device_class=None,
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        icon="mdi:expansion-card",
        value_fn=lambda port: port.get("sfp_part"),
    ),
    # SFP Vendor
    UnifiInsightsSensorEntityDescription(
        key="port_sfp_vendor",
        translation_key="port_sfp_vendor",
        device_class=None,
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        icon="mdi:factory",
        value_fn=lambda port: port.get("sfp_vendor"),
    ),
    # SFP Compliance (DAC, SR, LR, etc.)
    UnifiInsightsSensorEntityDescription(
        key="port_sfp_compliance",
        translation_key="port_sfp_compliance",
        device_class=None,
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        icon="mdi:tag",
        value_fn=lambda port: port.get("sfp_compliance"),
    ),
    # SFP Serial
    UnifiInsightsSensorEntityDescription(
        key="port_sfp_serial",
        translation_key="port_sfp_serial",
        device_class=None,
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        icon="mdi:barcode",
        value_fn=lambda port: port.get("sfp_serial"),
    ),
)


def _get_port_label(port: dict[str, Any], port_idx: int) -> str:
    """Return user-friendly port label based on port type."""
    name = port.get("name")
    if name and name != f"Port {port_idx}":
        return str(name)
    media = port.get("media", "")
    if media.startswith("SFP"):
        return f"{media} {port_idx}"
    return f"Port {port_idx}"


# WAN sensor descriptions for UniFi gateways
WAN_SENSOR_TYPES: tuple[UnifiInsightsSensorEntityDescription, ...] = (
    # WAN IP Address
    UnifiInsightsSensorEntityDescription(
        key="wan_ip",
        translation_key="wan_ip",
        device_class=None,
        entity_category=EntityCategory.DIAGNOSTIC,
        # Gold: Disable diagnostic entities by default
        entity_registry_enabled_default=False,
        icon="mdi:ip-network",
        value_fn=lambda device: get_field(device, "ipAddress", "ip_address", "ip"),
    ),
    # WAN Uptime
    UnifiInsightsSensorEntityDescription(
        key="wan_uptime",
        translation_key="wan_uptime",
        device_class=None,
        entity_category=EntityCategory.DIAGNOSTIC,
        # Gold: Disable diagnostic entities by default
        entity_registry_enabled_default=False,
        icon="mdi:clock-start",
        value_fn=lambda stats: format_uptime(
            get_stats_field(
                stats, "uptimeSec", "uptime_sec", "uptime_seconds", "uptime"
            )
        ),
    ),
)


# Site-level client count sensor descriptions
SITE_CLIENT_SENSOR_TYPES: tuple[UnifiInsightsSensorEntityDescription, ...] = (
    UnifiInsightsSensorEntityDescription(
        key="site_total_clients",
        translation_key="site_total_clients",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:account-group",
        value_fn=len,
    ),
    UnifiInsightsSensorEntityDescription(
        key="site_wired_clients",
        translation_key="site_wired_clients",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:ethernet",
        value_fn=lambda clients: len(
            [c for c in clients.values() if _get_client_type(c) == "WIRED"]
        ),
    ),
    UnifiInsightsSensorEntityDescription(
        key="site_wireless_clients",
        translation_key="site_wireless_clients",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:wifi",
        value_fn=lambda clients: len(
            [c for c in clients.values() if _get_client_type(c) == "WIRELESS"]
        ),
    ),
)


@callback
def _migrate_sensor_units(
    hass: HomeAssistant,
    config_entry: UnifiInsightsConfigEntry,
) -> None:
    """
    Migrate existing sensor entities to use updated suggested units.

    Sets the refresh_initial_entity_options flag on sensor entities whose
    stored suggested_unit_of_measurement differs from the current description.
    HA will then re-evaluate and apply the new suggested unit on next load.
    """
    registry = er.async_get(hass)

    # Build a lookup of current suggested units from sensor descriptions
    expected_units: dict[str, str | None] = {}
    for desc in (*SENSOR_TYPES, *PORT_SENSOR_TYPES, *PORT_RATE_SENSOR_TYPES):
        if desc.suggested_unit_of_measurement is not None:
            expected_units[desc.key] = str(desc.suggested_unit_of_measurement)

    if not expected_units:
        return

    for entity_entry in er.async_entries_for_config_entry(
        registry, config_entry.entry_id
    ):
        if entity_entry.domain != "sensor":
            continue

        # Match entity to a description key via unique_id suffix
        unique_id = entity_entry.unique_id or ""
        matched_key: str | None = None
        for key in expected_units:
            if unique_id.endswith(f"_{key}"):
                matched_key = key
                break

        if matched_key is None:
            continue

        # Check if stored suggested unit already matches
        private_opts: dict[str, Any] = entity_entry.options.get("sensor.private", {})
        stored_suggested = private_opts.get("suggested_unit_of_measurement")
        if stored_suggested == expected_units[matched_key]:
            continue

        # Flag for refresh so HA picks up the new suggested unit
        new_opts = dict(private_opts)
        new_opts["refresh_initial_entity_options"] = True
        registry.async_update_entity_options(
            entity_entry.entity_id,
            "sensor.private",
            new_opts,
        )
        _LOGGER.debug(
            "Migrated unit for %s: %s -> %s",
            entity_entry.entity_id,
            stored_suggested,
            expected_units[matched_key],
        )


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensors for UniFi Insights integration."""
    _ = hass
    _LOGGER.debug("Setting up UniFi Insights sensors")

    # Migrate existing entities to pick up new suggested_unit_of_measurement
    _migrate_sensor_units(hass, config_entry)

    coordinator: UnifiFacadeCoordinator = config_entry.runtime_data.coordinator
    entities: list[SensorEntity] = []

    # Add sensors for each device in each site
    for site_id, devices in coordinator.data["devices"].items():
        _LOGGER.debug("Processing site %s with %d devices", site_id, len(devices))
        site_data = coordinator.get_site(site_id)
        site_name = (
            site_data.get("meta", {}).get("name", site_id) if site_data else site_id
        )

        for device_id in devices:
            device_data = (
                coordinator.data.get("devices", {}).get(site_id, {}).get(device_id, {})
            )
            device_name = device_data.get("name", device_id)
            # Get device features for filtering (e.g., ['switching'], ['accessPoint'])
            device_features = device_data.get("features", [])
            if not isinstance(device_features, list):
                device_features = []

            _LOGGER.debug(
                "Creating sensors for device %s (%s) in site %s (%s), features: %s",
                device_id,
                device_name,
                site_id,
                site_name,
                device_features,
            )

            for description in SENSOR_TYPES:
                # Skip sensor if it requires a specific feature the device doesn't have
                if (
                    description.required_feature is not None
                    and description.required_feature not in device_features
                ):
                    _LOGGER.debug(
                        "Skipping sensor %s for %s - needs feature %s",
                        description.key,
                        device_name,
                        description.required_feature,
                    )
                    continue

                if (
                    description.key == "general_temperature"
                    and get_network_device_temperature(device_data) is None
                    and not get_field(
                        device_data,
                        "hasTemperature",
                        "has_temperature",
                        default=False,
                    )
                ):
                    _LOGGER.debug(
                        "Skipping sensor %s for %s - no temperature data",
                        description.key,
                        device_name,
                    )
                    continue

                # Only create uplink rate sensors if uplink data exists
                if description.key in ("tx_rate", "rx_rate"):
                    stats = (
                        coordinator.data.get("stats", {})
                        .get(site_id, {})
                        .get(device_id, {})
                    )
                    if not isinstance(stats, dict):
                        continue
                    uplink = get_field(stats, "uplink", "uplink_stats", default=None)
                    has_uplink = isinstance(uplink, dict) and bool(uplink)
                    has_top_level = any(
                        stats.get(k) is not None
                        for k in (
                            "txRateBps",
                            "tx_rate_bps",
                            "rxRateBps",
                            "rx_rate_bps",
                            "tx_bytes_per_sec",
                            "rx_bytes_per_sec",
                        )
                    )
                    if not has_uplink and not has_top_level:
                        _LOGGER.debug(
                            "Skipping sensor %s for %s - no uplink rate data",
                            description.key,
                            device_name,
                        )
                        continue

                # Only create Total PoE Power sensor if coordinator
                if description.key == "poe_total_power":
                    stats = (
                        coordinator.data.get("stats", {})
                        .get(site_id, {})
                        .get(device_id, {})
                    )
                    if not isinstance(stats, dict):
                        continue
                    poe_keys = (
                        "poe_total_w",
                        "poeTotalW",
                        "total_used_power",
                        "totalUsedPower",
                    )
                    has_any_total = any(stats.get(k) is not None for k in poe_keys)
                    has_ports = isinstance(stats.get("poe_ports"), dict)
                    if not has_any_total and not has_ports:
                        continue

                entities.append(
                    UnifiInsightsSensor(
                        coordinator=coordinator,
                        description=description,
                        site_id=site_id,
                        device_id=device_id,
                    )
                )

            # Add port sensors for switches with port interfaces
            # Port data can come from:
            # 1. device_data["ports"] - merged from legacy port_table by coordinator
            # 2. device_data["interfaces"]["ports"] - new API format (dict)
            ports = device_data.get("ports", [])
            if not ports:
                interfaces = get_field(device_data, "interfaces", default={})
                if isinstance(interfaces, dict):
                    ports = get_field(interfaces, "ports", default=[])
            if ports:
                _LOGGER.debug(
                    "Device %s has %d ports, creating port sensors",
                    device_name,
                    len(ports),
                )

                for port in ports:
                    port_idx = get_field(port, "idx", "index", "port_idx")
                    if port_idx is None:
                        continue

                    # Only create sensors for active ports (state = "UP")
                    port_state = get_field(port, "state", "status", default="DOWN")
                    if str(port_state).upper() != "UP":
                        _LOGGER.debug(
                            "Skipping port %d on device %s - port state is %s (not UP)",
                            port_idx,
                            device_name,
                            port_state,
                        )
                        continue

                    # Determine port label from legacy data
                    port_label = _get_port_label(port, port_idx)
                    is_sfp = str(port.get("media", "")).startswith("SFP")

                    # Create PoE power sensor only for ports where a PoE
                    # device is actually connected and drawing power. Skip
                    # PoE-capable ports with non-PoE devices attached.
                    poe_data = get_field(port, "poe", default={})
                    poe_marker = False
                    if isinstance(poe_data, dict):
                        # "good" indicates successful PoE negotiation
                        if poe_data.get("good"):
                            poe_marker = True
                        else:
                            # Fallback: check actual power draw > 0
                            for pw_key in ("power", "watts"):
                                pw = poe_data.get(pw_key)
                                try:
                                    if pw is not None and float(pw) > 0:
                                        poe_marker = True
                                        break
                                except ValueError, TypeError:
                                    pass

                    if not poe_marker:
                        norm = get_field(port, "poe_power_w")
                        try:
                            poe_marker = norm is not None and float(norm) > 0
                        except ValueError, TypeError:
                            poe_marker = False

                    if poe_marker:
                        poe_desc = PORT_SENSOR_TYPES[0]  # PoE power sensor
                        entities.append(
                            UnifiPortSensor(
                                coordinator=coordinator,
                                description=poe_desc,
                                site_id=site_id,
                                device_id=device_id,
                                port_idx=port_idx,
                                port_label=port_label,
                            )
                        )

                    # Create speed sensor for all active ports
                    speed_desc = PORT_SENSOR_TYPES[1]  # Port speed sensor
                    entities.append(
                        UnifiPortSensor(
                            coordinator=coordinator,
                            description=speed_desc,
                            site_id=site_id,
                            device_id=device_id,
                            port_idx=port_idx,
                            port_label=port_label,
                        )
                    )

                    # Create TX/RX sensors for all active ports
                    tx_desc = PORT_SENSOR_TYPES[2]  # TX sensor
                    rx_desc = PORT_SENSOR_TYPES[3]  # RX sensor
                    entities.append(
                        UnifiPortSensor(
                            coordinator=coordinator,
                            description=tx_desc,
                            site_id=site_id,
                            device_id=device_id,
                            port_idx=port_idx,
                            port_label=port_label,
                        )
                    )
                    entities.append(
                        UnifiPortSensor(
                            coordinator=coordinator,
                            description=rx_desc,
                            site_id=site_id,
                            device_id=device_id,
                            port_idx=port_idx,
                            port_label=port_label,
                        )
                    )

                    # Create TX/RX rate sensors for all active ports
                    tx_rate_desc = PORT_RATE_SENSOR_TYPES[0]
                    rx_rate_desc = PORT_RATE_SENSOR_TYPES[1]
                    entities.append(
                        UnifiPortSensor(
                            coordinator=coordinator,
                            description=tx_rate_desc,
                            site_id=site_id,
                            device_id=device_id,
                            port_idx=port_idx,
                            port_label=port_label,
                        )
                    )
                    entities.append(
                        UnifiPortSensor(
                            coordinator=coordinator,
                            description=rx_rate_desc,
                            site_id=site_id,
                            device_id=device_id,
                            port_idx=port_idx,
                            port_label=port_label,
                        )
                    )

                    # Create SFP module sensors for SFP/SFP+ ports
                    if is_sfp and port.get("sfp_found"):
                        entities.extend(
                            UnifiPortSensor(
                                coordinator=coordinator,
                                description=sfp_desc,
                                site_id=site_id,
                                device_id=device_id,
                                port_idx=port_idx,
                                port_label=port_label,
                            )
                            for sfp_desc in SFP_SENSOR_TYPES
                        )

            # Build set of active (UP) port indices for filtering
            active_port_indices: set[int] = set()
            for port in ports:
                p_idx = get_field(port, "idx", "index", "port_idx")
                if p_idx is None:
                    continue
                p_state = get_field(port, "state", "status", default="DOWN")
                if str(p_state).upper() == "UP":
                    active_port_indices.add(int(p_idx))

            # Fallback: create PoE power sensors from stats
            # when interfaces.ports is unavailable
            def _create_port_sensors_from_stats(
                stat_key: str,
                sensor_descriptions: tuple[UnifiInsightsSensorEntityDescription, ...]
                | list[UnifiInsightsSensorEntityDescription],
                port_filter: Callable[[UnifiInsightsSensorEntityDescription], bool],
                *,
                _site_id: str = site_id,
                _device_id: str = device_id,
                _device_features: dict[str, Any] = device_features,
                _active_ports: set[int] = active_port_indices,
            ) -> None:
                """Create per-port sensors from stats."""
                if "switching" not in _device_features:
                    return

                stats = (
                    coordinator.data.get("stats", {})
                    .get(_site_id, {})
                    .get(_device_id, {})
                )
                if not isinstance(stats, dict):
                    return

                per_port_stats = stats.get(stat_key)
                if not isinstance(per_port_stats, dict) or not per_port_stats:
                    return

                existing_uids = {getattr(e, "unique_id", None) for e in entities}
                normalised_ports = {
                    int(k)
                    for k in per_port_stats
                    if isinstance(k, int) or (isinstance(k, str) and k.isdigit())
                }

                for port_idx_int in normalised_ports:
                    # Only create sensors for active ports
                    if _active_ports and port_idx_int not in _active_ports:
                        continue

                    # For PoE stats, skip ports with zero power draw
                    # (non-PoE device connected to a PoE-capable port)
                    if stat_key == "poe_ports":
                        try:
                            val = per_port_stats.get(port_idx_int)
                            if val is None:
                                val = per_port_stats.get(str(port_idx_int))
                            if val is not None and float(val) <= 0:
                                continue
                        except ValueError, TypeError:
                            pass

                    for desc in sensor_descriptions:
                        if not port_filter(desc):
                            continue

                        uid = f"{_device_id}_{desc.key}_{port_idx_int}"
                        if uid in existing_uids:
                            continue

                        entities.append(
                            UnifiPortSensor(
                                coordinator=coordinator,
                                description=desc,
                                site_id=_site_id,
                                device_id=_device_id,
                                port_idx=port_idx_int,
                            )
                        )
                        existing_uids.add(uid)

            # Fallback: create port PoE sensors from stats
            _create_port_sensors_from_stats(
                stat_key="poe_ports",
                sensor_descriptions=[PORT_SENSOR_TYPES[0]],
                port_filter=lambda _desc: True,
            )

            # Fallback: create port TX/RX sensors from stats
            _create_port_sensors_from_stats(
                stat_key="port_bytes",
                sensor_descriptions=PORT_SENSOR_TYPES,
                port_filter=lambda desc: desc.key in ("port_tx_bytes", "port_rx_bytes"),
            )
            # Add WAN sensors for gateway devices
            features = get_field(device_data, "features", default={})
            model = get_field(device_data, "model", default="")
            if (
                "switching" in features or "gateway" in features or "router" in features
            ) and (model.startswith(("UDM", "USG")) or "gateway" in model.lower()):
                _LOGGER.debug(
                    "Device %s is a gateway, creating WAN sensors", device_name
                )

                entities.extend(
                    UnifiInsightsSensor(
                        coordinator=coordinator,
                        description=description,
                        site_id=site_id,
                        device_id=device_id,
                    )
                    for description in WAN_SENSOR_TYPES
                )

    # Add site-level client count sensors
    for site_id in coordinator.data.get("clients", {}):
        _LOGGER.debug("Creating site-level client count sensors for site %s", site_id)
        entities.extend(
            UnifiSiteClientSensor(
                coordinator=coordinator,
                description=description,
                site_id=site_id,
            )
            for description in SITE_CLIENT_SENSOR_TYPES
        )

    # Add UniFi Protect sensors if API is available
    if coordinator.protect_client:
        # Add sensors for UniFi Protect sensors
        for sensor_id, sensor_data in coordinator.data["protect"]["sensors"].items():
            sensor_name = sensor_data.get("name", f"Sensor {sensor_id}")

            _LOGGER.debug(
                "Creating sensors for UniFi Protect sensor %s (%s)",
                sensor_id,
                sensor_name,
            )

            entities.extend(
                UnifiProtectSensor(
                    coordinator=coordinator,
                    description=description,
                    device_id=sensor_id,
                )
                for description in PROTECT_SENSOR_TYPES
                if description.device_type == DEVICE_TYPE_SENSOR
                and (
                    description.capability_fn is None
                    or description.capability_fn(sensor_data)
                )
            )

        # Add sensors for UniFi Protect NVRs
        for nvr_id, nvr_data in coordinator.data["protect"]["nvrs"].items():
            nvr_name = nvr_data.get("name", f"NVR {nvr_id}")

            _LOGGER.debug(
                "Creating sensors for UniFi Protect NVR %s (%s)",
                nvr_id,
                nvr_name,
            )

            # Check if storage information is available
            # Note: The UniFi Protect Integration API v1 (public API) does not
            # expose storage information. Storage sensors are only created when
            # the data is actually available.
            has_storage = _has_storage_info(nvr_data)
            if not has_storage:
                _LOGGER.debug(
                    "NVR %s: Storage information not available via API, "
                    "skipping storage sensors",
                    nvr_name,
                )

            for nvr_desc in NVR_SENSOR_TYPES:
                if nvr_desc.device_type == DEVICE_TYPE_NVR:
                    # Skip storage sensors if storage info is not available
                    if nvr_desc.key.startswith("storage_") and not has_storage:
                        continue
                    entities.append(
                        UnifiProtectNVRSensor(
                            coordinator=coordinator,
                            description=nvr_desc,
                            device_id=nvr_id,
                        )
                    )

    _LOGGER.info("Adding %d UniFi Insights sensors", len(entities))
    async_add_entities(entities)

    # Clean up stale port entities from previous runs
    created_uids = {getattr(e, "unique_id", None) for e in entities}
    ent_reg = er.async_get(hass)
    stale = [
        entry
        for entry in er.async_entries_for_config_entry(ent_reg, config_entry.entry_id)
        if entry.domain == "sensor"
        and "_port_" in entry.unique_id
        and entry.unique_id not in created_uids
    ]
    for entry in stale:
        _LOGGER.debug("Removing stale port sensor entity: %s", entry.unique_id)
        ent_reg.async_remove(entry.entity_id)


class UnifiInsightsSensor(UnifiInsightsEntity, SensorEntity):
    """Representation of a UniFi Insights Sensor."""

    entity_description: UnifiInsightsSensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
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
            site_id,
        )

    @property
    def native_value(self) -> StateType:
        """Return the state of the sensor."""
        # Special handling for sensors that come from device data (not stats)
        if self.entity_description.key in [
            "firmware_version",
            "wan_ip",
            "general_temperature",
        ]:
            device = (
                self.coordinator.data["devices"]
                .get(self._site_id, {})
                .get(self._device_id)
            )
            if not device:
                _LOGGER.debug(
                    "No device data available for %s sensor (device %s in site %s)",
                    self.entity_description.key,
                    self._device_id,
                    self._site_id,
                )
                return None
            value = self.entity_description.value_fn(device)  # type: ignore[misc]
        else:
            # For all other sensors, use stats data
            if (
                not self.coordinator.data["stats"]
                .get(self._site_id, {})
                .get(self._device_id)
            ):
                _LOGGER.debug(
                    "No stats available for sensor %s (device %s in site %s)",
                    self.entity_description.key,
                    self._device_id,
                    self._site_id,
                )
                return None

            stats = self.coordinator.data["stats"][self._site_id][self._device_id]
            value = self.entity_description.value_fn(stats)  # type: ignore[misc]

        _LOGGER.debug(
            "Sensor %s for device %s in site %s updated to %s %s",
            self.entity_description.key,
            self._device_id,
            self._site_id,
            value,
            self.native_unit_of_measurement or "",
        )

        return value


class UnifiPortSensor(UnifiInsightsEntity, SensorEntity):
    """Representation of a UniFi Port Sensor."""

    entity_description: UnifiInsightsSensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        description: UnifiInsightsSensorEntityDescription,
        site_id: str,
        device_id: str,
        port_idx: int,
        port_label: str | None = None,
    ) -> None:
        """Initialize the port sensor."""
        super().__init__(coordinator, description, site_id, device_id)
        self._port_idx = port_idx

        # Use port label (e.g. "SFP+ 1") or fall back to "Port {idx}"
        label = port_label or f"Port {port_idx}"
        # Replace "Port {port_idx}" placeholder in the description name
        # with the actual port label
        base = description.name if isinstance(description.name, str) else ""
        if "{port_idx}" in base:
            # e.g. "Port {port_idx} Speed" → "SFP+ 1 Speed"
            self._attr_name = base.replace("Port {port_idx}", label)
        else:
            self._attr_name = f"{label} {base}"

        # Create unique ID with port index (stable, doesn't change with rename)
        self._attr_unique_id = f"{device_id}_{description.key}_{port_idx}"

        _LOGGER.debug(
            "Initializing %s sensor for port %d on device %s in site %s",
            description.key,
            port_idx,
            device_id,
            site_id,
        )

    @property
    def native_value(self) -> StateType:
        """Return the state of the sensor."""
        # Get device data to access port information
        device_data = (
            self.coordinator.data.get("devices", {})
            .get(self._site_id, {})
            .get(self._device_id, {})
        )

        if not device_data:
            _LOGGER.debug(
                "No device data available for port sensor %s (device %s in site %s)",
                self.entity_description.key,
                self._device_id,
                self._site_id,
            )
            return None

        # Find the port data
        # Port data can come from:
        # 1. device_data["ports"] - merged from legacy port_table by coordinator
        # 2. device_data["interfaces"]["ports"] - new API format (dict)
        ports = device_data.get("ports", [])
        if not ports:
            interfaces = device_data.get("interfaces", {})
            ports = interfaces.get("ports", []) if isinstance(interfaces, dict) else []
        port_data = None
        for port in ports:
            idx = port.get("idx") or port.get("port_idx")
            if idx == self._port_idx:
                port_data = port
                break

        if not port_data:
            # PoE power can be sourced from stats when interfaces.ports is unavailable
            if self.entity_description.key == "port_poe_power":
                stats = (
                    self.coordinator.data.get("stats", {})
                    .get(self._site_id, {})
                    .get(self._device_id, {})
                )
                if isinstance(stats, dict):
                    poe_ports = stats.get("poe_ports")
                    if isinstance(poe_ports, dict):
                        watts = poe_ports.get(self._port_idx) or poe_ports.get(
                            str(self._port_idx)
                        )
                        if isinstance(watts, (int, float)):
                            return float(watts)
                        if isinstance(watts, str):
                            try:
                                return float(watts)
                            except ValueError:
                                return None

            # TX/RX bytes can be sourced from stats when interfaces.ports is unavailable
            if self.entity_description.key in ("port_tx_bytes", "port_rx_bytes"):
                stats = (
                    self.coordinator.data.get("stats", {})
                    .get(self._site_id, {})
                    .get(self._device_id, {})
                )
                if isinstance(stats, dict):
                    port_bytes = stats.get("port_bytes")
                    if isinstance(port_bytes, dict):
                        pb = port_bytes.get(self._port_idx) or port_bytes.get(
                            str(self._port_idx)
                        )
                        if isinstance(pb, dict):
                            v = (
                                pb.get("tx_bytes")
                                if self.entity_description.key == "port_tx_bytes"
                                else pb.get("rx_bytes")
                            )
                            if isinstance(v, (int, float)):
                                return int(v)

            # TX/RX rate sourced from stats when interfaces.ports is unavailable
            if self.entity_description.key in ("port_tx_rate", "port_rx_rate"):
                return self._get_port_rate_value()

            _LOGGER.debug(
                "No port data available for port %d on device %s",
                self._port_idx,
                self._device_id,
            )
            return None

        # Port TX/RX rate always comes from computed stats, not port data
        if self.entity_description.key in ("port_tx_rate", "port_rx_rate"):
            return self._get_port_rate_value()

        # Prefer PoE watts from coordinator stats when available
        if self.entity_description.key == "port_poe_power":
            stats = (
                self.coordinator.data.get("stats", {})
                .get(self._site_id, {})
                .get(self._device_id, {})
            )
            if isinstance(stats, dict):
                poe_ports = stats.get("poe_ports")
                if isinstance(poe_ports, dict):
                    watts = poe_ports.get(self._port_idx) or poe_ports.get(
                        str(self._port_idx)
                    )
                    if isinstance(watts, (int, float)):
                        return float(watts)
                    if isinstance(watts, str):
                        try:
                            return float(watts)
                        except ValueError:
                            return None

        # TX/RX bytes from coordinator stats
        if self.entity_description.key in ["port_tx_bytes", "port_rx_bytes"]:
            stats = (
                self.coordinator.data.get("stats", {})
                .get(self._site_id, {})
                .get(self._device_id, {})
            )
            if not isinstance(stats, dict):
                return None

            counter_key = (
                "tx_bytes"
                if self.entity_description.key == "port_tx_bytes"
                else "rx_bytes"
            )

            # 1) Preferred: legacy-mapped per-port counters
            port_bytes = stats.get("port_bytes")
            if isinstance(port_bytes, dict):
                pb = port_bytes.get(self._port_idx) or port_bytes.get(
                    str(self._port_idx)
                )
                if isinstance(pb, dict):
                    v = pb.get(counter_key)
                    if isinstance(v, (int, float)):
                        return int(v)

            # 2) Optional fallback: upstream per-port counters dict
            port_data = stats.get("port_data")
            if isinstance(port_data, dict):
                pb = port_data.get(self._port_idx) or port_data.get(str(self._port_idx))
                if isinstance(pb, dict):
                    v = pb.get(counter_key)
                    if isinstance(v, (int, float)):
                        return int(v)

            return None

        # Use value_fn to extract the value
        value = self.entity_description.value_fn(port_data)  # type: ignore[misc]

        _LOGGER.debug(
            "Port sensor %s for port %d on device %s updated to %s %s",
            self.entity_description.key,
            self._port_idx,
            self._device_id,
            value,
            self.native_unit_of_measurement or "",
        )

        return value

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        # PoE power availability based on coordinator stats
        if self.entity_description.key == "port_poe_power":
            if not self.coordinator.last_update_success:
                return False
            stats = (
                self.coordinator.data.get("stats", {})
                .get(self._site_id, {})
                .get(self._device_id, {})
            )
            if isinstance(stats, dict):
                poe_ports = stats.get("poe_ports")
                if isinstance(poe_ports, dict):
                    # If the device provides poe_ports at all,
                    # keep PoE power sensors available
                    # (link state may be DOWN while PoE is
                    # disabled or idle).
                    return True
            # Fall through to standard port-state availability logic

        # TX/RX availability based on coordinator stats
        if self.entity_description.key in ("port_tx_bytes", "port_rx_bytes"):
            if not self.coordinator.last_update_success:
                return False
            stats = (
                self.coordinator.data.get("stats", {})
                .get(self._site_id, {})
                .get(self._device_id, {})
            )
            if isinstance(stats, dict):
                port_bytes = stats.get("port_bytes")
                if isinstance(port_bytes, dict):
                    pb = port_bytes.get(self._port_idx) or port_bytes.get(
                        str(self._port_idx)
                    )
                    if isinstance(pb, dict):
                        return True
            # Fall through to standard port-state availability logic

        # TX/RX rate availability based on computed port_rates
        if self.entity_description.key in ("port_tx_rate", "port_rx_rate"):
            if not self.coordinator.last_update_success:
                return False
            stats = (
                self.coordinator.data.get("stats", {})
                .get(self._site_id, {})
                .get(self._device_id, {})
            )
            if isinstance(stats, dict):
                port_rates = stats.get("port_rates")
                if isinstance(port_rates, dict):
                    pr = port_rates.get(self._port_idx) or port_rates.get(
                        str(self._port_idx)
                    )
                    if isinstance(pr, dict):
                        return True
            # Fall through to standard port-state availability logic

        # Port sensors are available if the device is available AND the port is UP
        if not self.coordinator.last_update_success:
            return False

        # Get device data
        devices = self.coordinator.data.get("devices", {})
        if not isinstance(devices, dict):
            return False
        site_devices = devices.get(self._site_id, {})
        if not isinstance(site_devices, dict):
            return False
        device_data = site_devices.get(self._device_id, {})
        if not device_data or not isinstance(device_data, dict):
            return False

        # Find the port data
        # Check device_data["ports"] first (from legacy merge),
        # fall back to interfaces["ports"]
        port_list = device_data.get("ports", [])
        if not port_list:
            interfaces = device_data.get("interfaces", {})
            if isinstance(interfaces, dict):
                port_list = interfaces.get("ports", [])
        if not isinstance(port_list, list):
            return False

        port_data = None
        for port in port_list:
            idx = port.get("idx") or port.get("port_idx")
            if idx == self._port_idx:
                port_data = port
                break

        if not port_data:
            return False

        # SFP info sensors stay available regardless of port state
        if self.entity_description.key.startswith("port_sfp_"):
            return True

        # Port sensor is only available if port state is UP
        port_state = port_data.get("state", "DOWN")
        return isinstance(port_state, str) and port_state == "UP"

    def _get_port_rate_value(self) -> StateType:
        """Get the computed port byte rate as bits/sec."""
        stats = (
            self.coordinator.data.get("stats", {})
            .get(self._site_id, {})
            .get(self._device_id, {})
        )
        if not isinstance(stats, dict):
            return None

        port_rates = stats.get("port_rates")
        if not isinstance(port_rates, dict):
            return None

        pr = port_rates.get(self._port_idx) or port_rates.get(str(self._port_idx))
        if not isinstance(pr, dict):
            return None

        rate_key = (
            "tx_bytes_rate"
            if self.entity_description.key == "port_tx_rate"
            else "rx_bytes_rate"
        )
        bytes_per_sec = pr.get(rate_key)
        if bytes_per_sec is None:
            return None

        # Convert bytes/sec to bits/sec (native unit)
        return round(float(bytes_per_sec) * 8)

    def _find_port_data(self) -> dict[str, Any] | None:
        """Find port data for this sensor's port index."""
        device_data = (
            self.coordinator.data.get("devices", {})
            .get(self._site_id, {})
            .get(self._device_id, {})
        )
        if not device_data:
            return None
        ports = device_data.get("ports", [])
        if not ports:
            interfaces = device_data.get("interfaces", {})
            if isinstance(interfaces, dict):
                ports = interfaces.get("ports", [])
        for port in ports:
            idx = port.get("idx") or port.get("port_idx")
            if idx == self._port_idx:
                return dict(port)
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return port type attributes."""
        port = self._find_port_data()
        if not port:
            return None

        attrs: dict[str, Any] = {}
        media = port.get("media")
        if media:
            attrs["media_type"] = media
        is_uplink = port.get("is_uplink")
        if is_uplink is not None:
            attrs["is_uplink"] = is_uplink
        network_name = port.get("network_name")
        if network_name:
            attrs["network"] = network_name
        port_name = port.get("name")
        if port_name:
            attrs["port_name"] = port_name
        sfp_found = port.get("sfp_found")
        if sfp_found is not None:
            attrs["sfp_module_present"] = sfp_found
        return attrs or None


class UnifiProtectSensor(UnifiProtectEntity, SensorEntity):
    """Representation of a UniFi Protect Sensor."""

    entity_description: UnifiProtectSensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        description: UnifiProtectSensorEntityDescription,
        device_id: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(
            coordinator, description.device_type or "", device_id, description.key
        )
        self.entity_description = description

        # Set entity category for battery sensors
        if description.key == "battery":
            self._attr_entity_category = EntityCategory.DIAGNOSTIC

        # Set name
        self._attr_name = description.name  # type: ignore[assignment]

        # Update initial state
        self._update_from_data()

        _LOGGER.debug(
            "Initializing %s sensor for %s device %s",
            description.key,
            description.device_type,
            device_id,
        )

    @property
    def native_value(self) -> StateType:
        """Return the state of the sensor."""
        device_data = self.coordinator.data["protect"][
            f"{self.entity_description.device_type}s"
        ].get(self._device_id)
        if not device_data:
            return None

        value = self.entity_description.value_fn(device_data)  # type: ignore[misc]

        _LOGGER.debug(
            "Sensor %s for %s device %s updated to %s %s",
            self.entity_description.key,
            self.entity_description.device_type,
            self._device_id,
            value,
            self.native_unit_of_measurement or "",
        )

        return value

    def _update_from_data(self) -> None:
        """Update entity from data."""
        device_data = self.coordinator.data["protect"][
            f"{self.entity_description.device_type}s"
        ].get(self._device_id, {})

        # Set attributes based on sensor type
        if self.entity_description.key == "temperature":
            self._attr_extra_state_attributes = {
                ATTR_SENSOR_ID: self._device_id,
                ATTR_SENSOR_NAME: device_data.get("name"),
                ATTR_SENSOR_TEMPERATURE_VALUE: device_data.get("stats", {})
                .get("temperature", {})
                .get("value"),
            }
        elif self.entity_description.key == "humidity":
            self._attr_extra_state_attributes = {
                ATTR_SENSOR_ID: self._device_id,
                ATTR_SENSOR_NAME: device_data.get("name"),
                ATTR_SENSOR_HUMIDITY_VALUE: device_data.get("stats", {})
                .get("humidity", {})
                .get("value"),
            }
        elif self.entity_description.key == "light":
            self._attr_extra_state_attributes = {
                ATTR_SENSOR_ID: self._device_id,
                ATTR_SENSOR_NAME: device_data.get("name"),
                ATTR_SENSOR_LIGHT_VALUE: device_data.get("stats", {})
                .get("light", {})
                .get("value"),
            }
        elif self.entity_description.key == "battery":
            self._attr_extra_state_attributes = {
                ATTR_SENSOR_ID: self._device_id,
                ATTR_SENSOR_NAME: device_data.get("name"),
                ATTR_SENSOR_BATTERY: device_data.get("batteryStatus", {}).get(
                    "percentage"
                ),
                ATTR_SENSOR_BATTERY_LOW: device_data.get("batteryStatus", {}).get(
                    "isLow", False
                ),
            }


class UnifiProtectNVRSensor(UnifiProtectEntity, SensorEntity):
    """Representation of a UniFi Protect NVR Sensor."""

    entity_description: UnifiProtectSensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        description: UnifiProtectSensorEntityDescription,
        device_id: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(
            coordinator, description.device_type or "", device_id, description.key
        )
        self.entity_description = description

        # Set name
        self._attr_name = description.name  # type: ignore[assignment]

        # Update initial state
        self._update_from_data()

        _LOGGER.debug(
            "Initializing %s sensor for NVR %s",
            description.key,
            device_id,
        )

    @property
    def available(self) -> bool:
        """
        Return True if entity is available.

        NVR doesn't have a 'state' field like cameras, so we check if we have
        valid NVR data and if storage info is available for storage sensors.
        """
        nvr_data = self.coordinator.data["protect"]["nvrs"].get(self._device_id)
        if not nvr_data or not isinstance(nvr_data, dict):
            return False

        # For storage sensors, check if storage data is available
        if self.entity_description.key in [
            "storage_used",
            "storage_total",
            "storage_available",
            "storage_used_percent",
        ]:
            # Check both direct fields and nested storageInfo
            storage_info = nvr_data.get("storageInfo")
            has_direct = (
                nvr_data.get("storageUsedBytes") is not None
                or nvr_data.get("storageTotalBytes") is not None
            )
            has_nested = storage_info is not None and isinstance(storage_info, dict)
            return has_direct or has_nested

        # For other NVR sensors, just check if we have data
        return True

    @property
    def native_value(self) -> StateType:
        """Return the state of the sensor."""
        nvr_data = self.coordinator.data["protect"]["nvrs"].get(self._device_id)
        if not nvr_data:
            return None

        value = self.entity_description.value_fn(nvr_data)  # type: ignore[misc]

        _LOGGER.debug(
            "NVR sensor %s for device %s updated to %s %s",
            self.entity_description.key,
            self._device_id,
            value,
            self.native_unit_of_measurement or "",
        )

        return value

    def _update_from_data(self) -> None:
        """Update entity from data."""
        nvr_data = self.coordinator.data["protect"]["nvrs"].get(self._device_id, {})

        # Get storage values
        storage_used = nvr_data.get("storageUsedBytes") or nvr_data.get(
            "storage_used_bytes"
        )
        storage_total = nvr_data.get("storageTotalBytes") or nvr_data.get(
            "storage_total_bytes"
        )

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_NVR_ID: self._device_id,
            ATTR_NVR_NAME: nvr_data.get("name"),
            ATTR_NVR_VERSION: nvr_data.get("version"),
            ATTR_NVR_STORAGE_USED: _bytes_to_gb(storage_used),
            ATTR_NVR_STORAGE_TOTAL: _bytes_to_gb(storage_total),
            ATTR_NVR_STORAGE_AVAILABLE: _calculate_storage_available(nvr_data),
            ATTR_NVR_STORAGE_USED_PERCENT: _calculate_storage_percent(nvr_data),
        }


class UnifiSiteClientSensor(CoordinatorEntity[UnifiFacadeCoordinator], SensorEntity):
    """Representation of a site-level client count sensor."""

    _attr_has_entity_name = True
    entity_description: UnifiInsightsSensorEntityDescription

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        description: UnifiInsightsSensorEntityDescription,
        site_id: str,
    ) -> None:
        """Initialize the site-level client sensor."""
        super().__init__(coordinator)
        self.entity_description = description
        self._site_id = site_id

        self._attr_unique_id = f"{site_id}_{description.key}"
        self._attr_name = description.name  # type: ignore[assignment]
        self._attr_device_info = DeviceInfo(**self._build_device_info())  # type: ignore[typeddict-item]

    def _find_gateway_device_id(self) -> str | None:
        """Find the gateway device ID for this site."""
        site_devices = self.coordinator.data.get("devices", {}).get(self._site_id, {})
        if not isinstance(site_devices, dict):
            return None

        for device_id, device_data in site_devices.items():
            if not isinstance(device_data, dict):
                continue
            model = str(device_data.get("model", "")).upper()
            features = device_data.get("features", [])
            if not isinstance(features, list):
                features = []
            if "gateway" in features or "router" in features:
                return str(device_id)
            if model.startswith(("UDM", "USG", "UXG", "UCG")):
                return str(device_id)

        return None

    def _build_device_info(self) -> dict[str, Any]:
        """Build device info for site-level entity grouping."""
        gateway_id = self._find_gateway_device_id()
        if gateway_id is not None:
            return {"identifiers": {(DOMAIN, f"{self._site_id}_{gateway_id}")}}

        site_data = self.coordinator.data.get("sites", {}).get(self._site_id, {})
        meta = site_data.get("meta", {})
        site_name = (
            meta.get("name") if isinstance(meta, dict) else None
        ) or site_data.get("name", self._site_id)

        return {
            "identifiers": {(DOMAIN, f"site_{self._site_id}")},
            "name": f"UniFi Site ({site_name})",
            "manufacturer": MANUFACTURER,
            "model": "UniFi Site",
        }

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return bool(self.coordinator.last_update_success)

    @property
    def native_value(self) -> StateType:
        """Return the client count."""
        clients = self.coordinator.data.get("clients", {}).get(self._site_id, {})
        if not isinstance(clients, dict):
            return 0
        return self.entity_description.value_fn(clients)  # type: ignore[misc]
