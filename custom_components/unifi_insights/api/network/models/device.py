"""Device models for UniFi Network API."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class DeviceType(str, Enum):
    """Types of UniFi network devices."""

    UGW = "ugw"  # UniFi Gateway
    USW = "usw"  # UniFi Switch
    UAP = "uap"  # UniFi Access Point
    UXG = "uxg"  # UniFi Next-Gen Gateway
    UDM = "udm"  # UniFi Dream Machine
    UDMPRO = "udm-pro"  # UniFi Dream Machine Pro
    UCK = "uck"  # UniFi Cloud Key
    UCG = "ucg"  # UniFi Cloud Gateway
    UBB = "ubb"  # UniFi Building Bridge
    UNKNOWN = "unknown"  # Fallback for new device types


class DeviceState(str, Enum):
    """Device connection states."""

    CONNECTED = "connected"
    ONLINE = "ONLINE"  # API returns uppercase
    DISCONNECTED = "disconnected"
    OFFLINE = "OFFLINE"  # API returns uppercase
    PENDING = "pending"
    PENDING_ADOPTION = "PENDING_ADOPTION"  # API returns uppercase
    ADOPTING = "adopting"
    PROVISIONING = "provisioning"
    UPGRADING = "upgrading"
    UPDATING = "UPDATING"  # Network 10.4.57
    DELETING = "DELETING"  # Network 10.4.57
    CONNECTION_INTERRUPTED = "CONNECTION_INTERRUPTED"  # Network 10.4.57
    ISOLATED = "ISOLATED"  # Network 10.4.57
    U5G_INCORRECT_TOPOLOGY = "U5G_INCORRECT_TOPOLOGY"  # Network 10.4.57
    GETTING_READY = "GETTING_READY"  # API returns during device startup
    UNKNOWN = "unknown"


class DevicePortPoE(BaseModel):
    """Model representing PoE state for a device port."""

    enabled: bool | None = None
    standard: str | None = None
    state: str | None = None
    type: int | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}


class DeviceInterfacePort(BaseModel):
    """Physical port as reported under ``interfaces.ports`` (Network 10.4.57)."""

    idx: int | None = None
    connector: str | None = None
    state: str | None = None
    max_speed_mbps: int | None = Field(default=None, alias="maxSpeedMbps")
    speed_mbps: int | None = Field(default=None, alias="speedMbps")
    poe: DevicePortPoE | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}


class DeviceInterfaces(BaseModel):
    """Container for a device's physical interfaces (Network 10.4.57)."""

    ports: list[DeviceInterfacePort] = Field(default_factory=list)
    radios: list[dict[str, Any]] = Field(default_factory=list)

    model_config = {"populate_by_name": True, "extra": "allow"}


class DeviceSwitchingFeature(BaseModel):
    """Switching feature overview, including LAG membership (Network 10.4.57)."""

    lags: list[dict[str, Any]] = Field(default_factory=list)

    model_config = {"populate_by_name": True, "extra": "allow"}


class DeviceFeatures(BaseModel):
    """Feature overview for a device (Network 10.4.57)."""

    switching: DeviceSwitchingFeature | dict[str, Any] | bool | None = None
    access_point: dict[str, Any] | bool | None = Field(default=None, alias="accessPoint")

    model_config = {"populate_by_name": True, "extra": "allow"}


class DeviceUplink(BaseModel):
    """Uplink interface overview for a device (Network 10.4.57)."""

    device_id: str | None = Field(default=None, alias="deviceId")

    model_config = {"populate_by_name": True, "extra": "allow"}


class DevicePort(BaseModel):
    """Model representing a device port."""

    port_idx: int | None = Field(default=None, alias="portIdx")
    name: str | None = None
    enabled: bool = True
    speed: int | None = None
    full_duplex: bool | None = Field(default=None, alias="fullDuplex")
    is_uplink: bool = Field(default=False, alias="isUplink")
    poe_enabled: bool | None = Field(default=None, alias="poeEnabled")
    poe_power: float | None = Field(default=None, alias="poePower")

    model_config = {"populate_by_name": True, "extra": "allow"}


class Device(BaseModel):
    """Model representing a UniFi network device."""

    id: str
    mac: str | None = Field(default=None, alias="macAddress")
    name: str | None = None
    model: str | None = None
    type: DeviceType | str | None = None  # Accept enum or raw string for new types
    state: DeviceState | str | None = None  # Accept enum or raw string for new states
    ip: str | None = None
    firmware_version: str | None = Field(default=None, alias="firmwareVersion")
    uptime: int | float | None = None
    last_seen: datetime | str | int | float | None = Field(
        default=None, alias="lastSeen"
    )
    adopted: bool = False
    site_id: str | None = Field(default=None, alias="siteId")
    ports: list[DevicePort] = Field(default_factory=list)
    cpu_utilization: float | int | str | None = Field(
        default=None, alias="cpuUtilization"
    )
    memory_utilization: float | int | str | None = Field(
        default=None, alias="memoryUtilization"
    )
    tx_bytes: int | float | None = Field(default=None, alias="txBytes")
    rx_bytes: int | float | None = Field(default=None, alias="rxBytes")
    features: DeviceFeatures | list[Any] | dict[str, Any] | None = None
    interfaces: DeviceInterfaces | list[Any] | dict[str, Any] | None = None
    uplink: DeviceUplink | dict[str, Any] | str | list[Any] | None = None
    extra: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True, "extra": "allow"}


class PortBytesMetrics(BaseModel):
    """Normalized per-port byte counters from legacy device stats."""

    rx_bytes: int
    tx_bytes: int

    model_config = {"populate_by_name": True, "extra": "allow"}


class LegacyPortMetrics(BaseModel):
    """
    Normalized per-port metrics from the legacy Network API.

    Note:
        Keys in ``poe_ports`` and ``port_bytes`` preserve the port index
        reported by the legacy API. These keys are not normalized to the
        0-based ``port_idx`` numbering expected by ``execute_port_action()``.

    """

    poe_total_w: float | None = None
    poe_ports: dict[int, float] = Field(default_factory=dict)
    port_bytes: dict[int, PortBytesMetrics] = Field(default_factory=dict)

    model_config = {"populate_by_name": True, "extra": "allow"}
