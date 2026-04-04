from __future__ import annotations

from datetime import datetime, timezone
from dataclasses import dataclass
from typing import Any, Callable, Final

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
    SensorEntityDescription,
)
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)
from homeassistant.config_entries import ConfigEntry

from .const import DOMAIN
from .__init__ import UniFiWanData


DATA_RATE_UNIT_MEGABITS_PER_SECOND: Final = "Mbit/s"


@dataclass
class UniFiSensorDescription(SensorEntityDescription):
    """Description for UniFi Sensors."""

    value_fn: Callable[[UniFiWanData], Any] = lambda x: None
    use_rate_coordinator: bool = False


def _mbps(val: Any) -> float:
    try:
        return round(float(val) * 8 / 1_000_000, 2)
    except Exception:
        return 0.0


def _ts_date(val: Any) -> datetime | None:
    try:
        ts = int(val)
        if ts > 0:
            return datetime.fromtimestamp(ts, tz=timezone.utc)
    except Exception:
        pass
    return None


def _wan_id(d: UniFiWanData) -> str:
    """Infer Active WAN ID."""
    u_ip = d.uplink.get("ip")
    if u_ip:
        for wan_number in d.wan.keys():
            if u_ip == d.wan[wan_number].get("ip"):
                return f"WAN{wan_number}"
    for wan_number in d.wan.keys():
        if d.wan[wan_number].get("up") and all(
            not other_data.get("up")
            for other_num, other_data in d.wan.items()
            if other_num != wan_number
        ):
            return f"WAN{wan_number}"
    return "Unknown"


def _wan_name(d: UniFiWanData) -> str:
    """Get Active WAN Name."""
    c = (d.uplink.get("comment") or "").strip()
    n = (d.uplink.get("name") or "").strip()
    if c and n and c.lower() != n.lower():
        return f"{c} ({n})"
    return c or n or "Unknown"


SENSORS: Final[tuple[UniFiSensorDescription, ...]] = (
    UniFiSensorDescription(
        key="wan_ipv4",
        name="UniFi WAN IPv4",
        icon="mdi:ip",
        value_fn=lambda d: d.uplink.get("ip") or "unknown",
    ),
    UniFiSensorDescription(
        key="wan_ipv6",
        name="UniFi WAN IPv6",
        icon="mdi:ip-network-outline",
        value_fn=lambda d: d.uplink.get("ip6") or "unknown",
    ),
    UniFiSensorDescription(
        key="wan_down_mbps",
        name="UniFi WAN Download",
        icon="mdi:download",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: _mbps(d.uplink.get("rx_bytes-r", 0)),
        use_rate_coordinator=True,
    ),
    UniFiSensorDescription(
        key="wan_up_mbps",
        name="UniFi WAN Upload",
        icon="mdi:upload",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: _mbps(d.uplink.get("tx_bytes-r", 0)),
        use_rate_coordinator=True,
    ),
    UniFiSensorDescription(
        key="wan_down_mbps_scan_interval",
        name="UniFi WAN Download (Scan Interval)",
        icon="mdi:download",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: _mbps(d.uplink.get("rx_bytes-r", 0)),
    ),
    UniFiSensorDescription(
        key="wan_up_mbps_scan_interval",
        name="UniFi WAN Upload (Scan Interval)",
        icon="mdi:upload",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: _mbps(d.uplink.get("tx_bytes-r", 0)),
    ),
    UniFiSensorDescription(
        key="speedtest_down",
        name="UniFi Speedtest Download",
        icon="mdi:download",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: d.uplink.get("xput_down"),
    ),
    UniFiSensorDescription(
        key="speedtest_up",
        name="UniFi Speedtest Upload",
        icon="mdi:upload",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: d.uplink.get("xput_up"),
    ),
    UniFiSensorDescription(
        key="speedtest_ping",
        name="UniFi Speedtest Ping",
        icon="mdi:timer",
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        value_fn=lambda d: d.uplink.get("speedtest_ping"),
    ),
    UniFiSensorDescription(
        key="speedtest_last_run",
        name="UniFi Speedtest Last Run",
        icon="mdi:clock-outline",
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda d: _ts_date(d.uplink.get("speedtest_lastrun")),
    ),
    UniFiSensorDescription(
        key="speedtest_interface",
        name="UniFi Speedtest WAN Interface",
        icon="mdi:wan",
        value_fn=lambda d: d.uplink.get("speedtest_interface") or "unknown",
    ),
    UniFiSensorDescription(
        key="active_wan_id",
        name="UniFi Active WAN ID",
        icon="mdi:numeric",
        value_fn=_wan_id,
    ),
    UniFiSensorDescription(
        key="active_wan_name",
        name="UniFi Active WAN Name",
        icon="mdi:wan",
        value_fn=_wan_name,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    shared = hass.data[DOMAIN][entry.entry_id]
    rates_coord = shared.get("rates_coordinator") or shared["device_coordinator"]
    device_coord = shared["device_coordinator"]

    host = shared["host"]
    site = shared["site"]
    meta = shared["dev_meta"]
    devname = f"UniFi WAN ({host} / {site})"
    wan_numbers = shared["wan_numbers"]

    entities: list[UniFiGenericSensor] = []

    for desc in SENSORS:
        coord: DataUpdateCoordinator = (
            rates_coord if desc.use_rate_coordinator else device_coord
        )
        entities.append(
            UniFiGenericSensor(
                coord,
                host,
                site,
                devname,
                meta,
                desc,
            )
        )

    for wan_number in wan_numbers:
        ipv4 = UniFiSensorDescription(
            key=f"wan{wan_number}_ipv4",
            name=f"UniFi WAN{wan_number} IPv4",
            icon="mdi:ip",
            value_fn=lambda d, wn=wan_number: d.wan[wn].get("ip") or "unknown",
        )
        coord: DataUpdateCoordinator = (
            rates_coord if ipv4.use_rate_coordinator else device_coord
        )
        entities.append(
            UniFiGenericSensor(
                coord,
                host,
                site,
                devname,
                meta,
                ipv4,
            )
        )
        ipv6 = UniFiSensorDescription(
            key=f"wan{wan_number}_ipv6",
            name=f"UniFi WAN{wan_number} IPv6",
            icon="mdi:ip-network-outline",
            value_fn=lambda d, wn=wan_number: d.wan[wn].get("ip6") or "unknown",
        )
        coord: DataUpdateCoordinator = (
            rates_coord if ipv6.use_rate_coordinator else device_coord
        )
        entities.append(
            UniFiGenericSensor(
                coord,
                host,
                site,
                devname,
                meta,
                ipv6,
            )
        )

    async_add_entities(entities)


class UniFiGenericSensor(CoordinatorEntity, SensorEntity):
    entity_description: UniFiSensorDescription

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        host: str,
        site: str,
        devname: str,
        meta: dict[str, Any],
        description: UniFiSensorDescription,
    ) -> None:
        super().__init__(coordinator)
        self._host = host
        self._site = site
        self._devname = devname
        self._meta = meta
        self.entity_description = description

    @property
    def unique_id(self) -> str:
        return f"{self._host}_{self._site}_{self.entity_description.key}"

    @property
    def device_info(self) -> dict[str, Any]:
        return {
            "identifiers": {(DOMAIN, self._host, self._site)},
            "name": self._devname,
            "manufacturer": "Ubiquiti",
            "model": self._meta.get("model"),
            "sw_version": self._meta.get("sw_version"),
            "configuration_url": f"https://{self._host}/",
        }

    @property
    def native_value(self) -> Any:
        return self.entity_description.value_fn(self.coordinator.data)
