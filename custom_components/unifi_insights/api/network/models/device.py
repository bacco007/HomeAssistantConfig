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
    access_point: dict[str, Any] | bool | None = Field(
        default=None, alias="accessPoint"
    )

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


class Outlet(BaseModel):
    """Model representing an outlet on a UniFi PDU or smart strip."""

    index: int
    name: str | None = None
    relay_state: bool = False
    cycle_enabled: bool | None = None
    outlet_caps: int | None = Field(default=None, alias="outletCaps")
    outlet_voltage: float | None = Field(default=None, alias="outletVoltage")
    outlet_current: float | None = Field(default=None, alias="outletCurrent")
    outlet_power: float | None = Field(default=None, alias="outletPower")
    outlet_power_factor: float | None = Field(default=None, alias="outletPowerFactor")

    model_config = {"populate_by_name": True, "extra": "allow"}


class LegacyOutletMetrics(BaseModel):
    """Normalized outlet metrics from the legacy Network API."""

    outlets: list[Outlet] = Field(default_factory=list)
    ac_power_consumption: float | None = None
    ac_power_budget: float | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}


def parse_outlet_metrics(legacy_device: dict[str, Any]) -> LegacyOutletMetrics:
    """
    Parse outlet metrics and device-level power totals from legacy device data.

    Args:
        legacy_device: Raw device dictionary from /stat/device.

    Returns:
        LegacyOutletMetrics containing normalized outlets and device power totals.

    """
    if not isinstance(legacy_device, dict):
        return LegacyOutletMetrics()

    raw_table = legacy_device.get("outlet_table")
    if not isinstance(raw_table, list):
        raw_table = []

    def _to_float(value: Any) -> float | None:
        try:
            return float(value)
        except TypeError, ValueError:
            return None

    def _to_int(value: Any) -> int | None:
        try:
            return int(value)
        except TypeError, ValueError:
            return None

    outlets: list[Outlet] = []
    for item in raw_table:
        if not isinstance(item, dict):
            continue
        idx = item.get("index")
        if idx is None:
            idx = item.get("outlet_idx") or item.get("outletIdx")
        idx_int = _to_int(idx)
        if idx_int is None:
            continue

        relay_val = item.get("relay_state")
        if relay_val is None:
            relay_val = item.get("relayState")
        if relay_val is None:
            relay_val = item.get("state")
        relay_state = bool(relay_val) if relay_val is not None else False

        cycle_val = item.get("cycle_enabled")
        if cycle_val is None:
            cycle_val = item.get("cycleEnabled")
        cycle_enabled = bool(cycle_val) if cycle_val is not None else None

        caps = item.get("outlet_caps")
        if caps is None:
            caps = item.get("outletCaps") or item.get("caps")

        voltage = _to_float(
            item.get("outlet_voltage")
            if item.get("outlet_voltage") is not None
            else item.get("outletVoltage", item.get("voltage"))
        )
        current = _to_float(
            item.get("outlet_current")
            if item.get("outlet_current") is not None
            else item.get("outletCurrent", item.get("current"))
        )
        power = _to_float(
            item.get("outlet_power")
            if item.get("outlet_power") is not None
            else item.get("outletPower", item.get("power"))
        )
        power_factor = _to_float(
            item.get("outlet_power_factor")
            if item.get("outlet_power_factor") is not None
            else item.get("outletPowerFactor", item.get("power_factor"))
        )

        outlets.append(
            Outlet(
                index=idx_int,
                name=item.get("name"),
                relay_state=relay_state,
                cycle_enabled=cycle_enabled,
                outlet_caps=_to_int(caps),
                outlet_voltage=voltage,
                outlet_current=current,
                outlet_power=power,
                outlet_power_factor=power_factor,
            )
        )

    ac_consumption = _to_float(
        legacy_device.get("outlet_ac_power_consumption")
        if legacy_device.get("outlet_ac_power_consumption") is not None
        else legacy_device.get(
            "outletAcPowerConsumption",
            legacy_device.get(
                "ac_power_consumption", legacy_device.get("acPowerConsumption")
            ),
        )
    )
    ac_budget = _to_float(
        legacy_device.get("outlet_ac_power_budget")
        if legacy_device.get("outlet_ac_power_budget") is not None
        else legacy_device.get(
            "outletAcPowerBudget",
            legacy_device.get("ac_power_budget", legacy_device.get("acPowerBudget")),
        )
    )

    return LegacyOutletMetrics(
        outlets=outlets,
        ac_power_consumption=ac_consumption,
        ac_power_budget=ac_budget,
    )
