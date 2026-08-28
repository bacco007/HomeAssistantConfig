from __future__ import annotations

import re
from datetime import datetime, timezone
from dataclasses import dataclass
from typing import Any, Callable, Final

from homeassistant.components.sensor import (
    RestoreSensor,
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
    SensorEntityDescription,
)
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import ExtraStoredData
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)
from homeassistant.config_entries import ConfigEntry

from .const import DOMAIN
from . import (
    UniFiWanData,
    UniFiWanRuntimeData,
    gateway_result_wan,
    interface_to_wan_number,
    resolve_active_wan,
)


DATA_RATE_UNIT_MEGABITS_PER_SECOND: Final = "Mbit/s"

# Bumped whenever per-WAN speedtest results stop being comparable with those
# stored by earlier releases; values stamped with an older version are not
# restored. See UniFiWanSpeedtestSensor._restored_value_is_trusted.
ATTRIBUTION_VERSION: Final = 2


@dataclass
class _WanSpeedtestExtraData(ExtraStoredData):
    """Restore-state payload recording how a stored result was attributed."""

    version: int
    source: str | None

    def as_dict(self) -> dict[str, Any]:
        return {"version": self.version, "source": self.source}


@dataclass(frozen=True, kw_only=True)
class UniFiSensorDescription(SensorEntityDescription):
    """Description for UniFi Sensors."""

    value_fn: Callable[[UniFiWanData], Any] = lambda x: None
    attributes_fn: Callable[[UniFiWanData], dict[str, Any] | None] | None = None
    use_rate_coordinator: bool = False


def _mbps(val: Any) -> float | None:
    try:
        return round(float(val) * 8 / 1_000_000, 2)
    except (TypeError, ValueError):
        return None


def _epoch(val: Any) -> int | None:
    """A speedtest timestamp as epoch seconds, or None if there isn't one."""
    try:
        ts = int(val)
    except (TypeError, ValueError):
        return None
    if ts <= 0:
        return None
    return ts // 1000 if ts > 100_000_000_000 else ts


def _ts_date(val: Any) -> datetime | None:
    try:
        ts = int(val)
        if ts > 0:
            return datetime.fromtimestamp(ts, tz=timezone.utc)
    except (TypeError, ValueError):
        pass
    return None


def _wan_id(d: UniFiWanData) -> str:
    """Infer Active WAN ID."""
    wan_number, _ = resolve_active_wan(d)
    return f"WAN{wan_number}" if wan_number is not None else "Unknown"


_INTERFACE_NAME_RE: Final = re.compile(r"(eth|ppp|pppoe|bond|br|vlan|wan)\d*(\.\d+)?")


def _looks_like_interface(value: str) -> bool:
    """True for controller placeholders like "eth8", "ppp0", "WAN" or "wan2"
    that name a link rather than describe it.
    """
    return bool(_INTERFACE_NAME_RE.fullmatch(value.strip().lower()))


def _port_label(d: UniFiWanData, wan_data: dict[str, Any]) -> str | None:
    """Chassis port label for a WAN, e.g. "Port 9".

    Only ever read from the controller's own physical_ports/port_table data,
    never computed from the interface name: UniFi numbers kernel interfaces
    from zero while the chassis ports are labelled from one, so eth8 is the
    port silk-screened 9. Deriving one from the other would turn a wrong
    guess into a confident-looking answer, so an unrecognised layout yields
    no port label at all.
    """
    ports = wan_data.get("physical_ports")
    if isinstance(ports, list):
        labels = [str(p).strip() for p in ports if str(p).strip()]
        if labels:
            return f"Port {'/'.join(labels)}"

    ifname = str(wan_data.get("ifname") or "").strip().lower()
    port_table = (d.gateway or {}).get("port_table")
    if ifname and isinstance(port_table, list):
        for port in port_table:
            if not isinstance(port, dict):
                continue
            if str(port.get("ifname") or "").strip().lower() != ifname:
                continue
            name = str(port.get("name") or "").strip()
            if name:
                return name
            idx = port.get("port_idx")
            if idx is not None:
                return f"Port {idx}"
    return None


def _active_port_label(d: UniFiWanData, section: dict[str, Any], reason: str) -> str | None:
    """Chassis port for the active WAN, allowing the uplink block to supply
    it when the WAN section itself carries no port data.

    Only the "uplink_*" match reasons prove the uplink block describes this
    WAN; after an "only_wan_up" match it has told us nothing about which
    interface it refers to, so its ports are not borrowed.
    """
    label = _port_label(d, section)
    if label is None and reason.startswith("uplink_"):
        label = _port_label(d, d.uplink)
    return label


def _friendly_wan_name(section: dict[str, Any]) -> str:
    """The user-facing description of a WAN, if the controller has one."""
    for key in ("comment", "name"):
        value = str(section.get(key) or "").strip()
        if value and not _looks_like_interface(value):
            return value
    return ""


def _wan_name(d: UniFiWanData) -> str:
    """Get Active WAN Name, derived from the same WAN section as the Active
    WAN ID so the two sensors can never point at different interfaces.

    The state leads with the WAN's description, or its WAN number when the
    controller only offers placeholders, and qualifies it with the chassis
    port rather than the raw interface name - "eth8" reads like port 8 but
    is in fact port 9, which is exactly the confusion this avoids.
    """
    wan_number, reason = resolve_active_wan(d)
    if wan_number is None:
        friendly = _friendly_wan_name(d.uplink)
        return friendly or "Unknown"

    section = d.wan.get(wan_number) or {}
    friendly = _friendly_wan_name(section)
    if not friendly and reason.startswith("uplink_"):
        friendly = _friendly_wan_name(d.uplink)

    label = friendly or f"WAN{wan_number}"
    detail = _active_port_label(d, section, reason) or str(
        section.get("ifname") or ""
    ).strip()
    if detail and detail.lower() != label.lower():
        return f"{label} ({detail})"
    return label


def _active_wan_attributes(d: UniFiWanData) -> dict[str, Any]:
    """Debug attributes showing how the active WAN was resolved."""
    wan_number, reason = resolve_active_wan(d)
    section = d.wan.get(wan_number) or {} if wan_number is not None else {}
    return {
        "active_wan": wan_number,
        "match_reason": reason,
        "active_wan_ifname": section.get("ifname"),
        "active_wan_port": _active_port_label(d, section, reason) if section else None,
        "uplink_ip": d.uplink.get("ip"),
        "uplink_name": d.uplink.get("name"),
        "uplink_comment": d.uplink.get("comment"),
        "wan_ips": {f"WAN{n}": (w or {}).get("ip") for n, w in d.wan.items()},
        "wan_ifnames": {f"WAN{n}": (w or {}).get("ifname") for n, w in d.wan.items()},
        "wan_ports": {
            f"WAN{n}": _port_label(d, w or {}) for n, w in d.wan.items()
        },
    }


def _has_figures(result: dict[str, Any]) -> bool:
    """Whether a speedtest result actually measured anything."""
    return result.get("down") is not None or result.get("up") is not None


def _gateway_result_is_wan(d: UniFiWanData, wan_number: int | None) -> bool:
    """Whether the gateway's last-run block may be shown as that WAN's result.

    Defers to gateway_result_wan, the same rule the integration records
    per-WAN results by, so a figure can never appear on these sensors
    without appearing on that WAN's own.
    """
    if wan_number is None:
        return False
    return gateway_result_wan(d, wan_number) == wan_number


def _displayed_speedtest(d: UniFiWanData) -> tuple[dict[str, Any], int | None]:
    """The result the gateway-wide Speedtest sensors show, and its WAN.

    Two sources can hold the active WAN's result and either may be the
    fresher one: the controller's per-WAN record, and the gateway's own
    last-run block. The newer wins, but the gateway block is only eligible
    when it demonstrably belongs to the active WAN - otherwise testing a
    non-active WAN would put its throughput back on these sensors.
    """
    active, _ = resolve_active_wan(d)
    candidates: list[dict[str, Any]] = []
    if active is not None:
        # What this WAN's own sensors are showing. The integration records it
        # from these same two sources, so it is normally the newest of the
        # three - but unlike them it is remembered, which is what stops these
        # sensors falling back to an older figure when the gateway rewrites
        # its block or the controller drops a record.
        latched = d.speedtest_latched.get(active)
        if latched:
            candidates.append(latched)
        record = d.per_wan_speedtest.get(active)
        if record:
            candidates.append(record)
    if _gateway_result_is_wan(d, active):
        candidates.append(d.speedtest)
    # A result has to carry figures to be worth showing. The gateway rewrites
    # its block around a run and can carry a fresh timestamp with nothing in
    # it; picking that on newest-wins would blank sensors that have a
    # perfectly good previous result to show.
    candidates = [c for c in candidates if _has_figures(c)]
    if candidates:
        return max(candidates, key=lambda r: _epoch(r.get("lastrun")) or 0), active

    if d.per_wan_speedtest:
        if active is not None:
            # The active WAN has simply never been tested, and the gateway
            # block belongs to a different one. Reporting nothing beats
            # reporting another line's throughput.
            return {}, None
        # Which WAN is the active uplink could not be resolved at all. The
        # newest record there is, labelled with the WAN it came from, is
        # more use than blank sensors - the WAN Interface sensor alongside
        # them says which line it describes.
        wan_number, record = max(
            d.per_wan_speedtest.items(),
            key=lambda item: _epoch(item[1].get("lastrun")) or 0,
        )
        return record, wan_number

    # No per-WAN records at all: the gateway's single result is everything
    # this controller offers, so report it and say which WAN it came from.
    iface = d.speedtest.get("source_interface")
    return d.speedtest, (interface_to_wan_number(iface, d.wan) if iface else active)


def _active_speedtest(d: UniFiWanData) -> dict[str, Any]:
    """The speedtest result the gateway-wide sensors show."""
    return _displayed_speedtest(d)[0]


def _active_speedtest_server(d: UniFiWanData) -> dict[str, Any]:
    """The speedtest server the gateway-wide sensors show.

    Read straight from the gateway's block whenever that block belongs to
    the active WAN, rather than from whichever result _displayed_speedtest
    picked. The per-WAN records name no server, so there is no competing
    source for the newest-wins rule to arbitrate - applying it anyway would
    blank these sensors every time a per-WAN record happened to be the
    fresher of the two.

    The block counts as the active WAN's on the same terms as its throughput
    does, rather than on the stricter evidence gateway_speedtest_wan wants:
    a gateway that names the interface only while a run is fresh would
    otherwise blank these sensors again minutes later. Nothing latches here -
    the next poll re-reads them - so the wrong-guess-forever risk that
    strictness guards against does not arise.
    """
    active, _ = resolve_active_wan(d)
    if active is None or not _gateway_result_is_wan(d, active):
        return {}
    return d.speedtest


def _speedtest_interface(d: UniFiWanData) -> str:
    """Return the WAN whose result the gateway-wide Speedtest sensors show,
    so the interface named always matches the figures displayed.
    """
    result, wan_number = _displayed_speedtest(d)
    if wan_number is not None:
        return f"WAN{wan_number}"
    iface = d.speedtest.get("source_interface")
    if result and iface:
        # An interface the controller named but we cannot map to a WAN.
        return iface
    return "unknown"


# How each of the per-WAN ISP/geolocation fields the gateway looks up is
# presented, as (field, key suffix, label, icon). One entry per
# WAN_ISP_FIELDS key; the same set is built gateway-wide below and, on a
# multi-WAN gateway, once more for each WAN.
#
# The key suffix is spelled out rather than derived so that "isp_name"
# reads as the plain "ISP" the rest of the UniFi UI calls it.
WAN_ISP_SENSORS: Final[tuple[tuple[str, str, str, str], ...]] = (
    ("isp_name", "isp_name", "ISP", "mdi:web"),
    ("isp_organization", "isp_organization", "ISP Organization", "mdi:domain"),
    ("asn", "asn", "ASN", "mdi:identifier"),
    ("city", "city", "City", "mdi:city"),
    ("country_name", "country_name", "Country", "mdi:earth"),
)


def _isp_value_fn(field: str) -> Callable[[UniFiWanData], Any]:
    """Read one ISP field for whichever WAN is currently the active uplink.

    Returns None rather than another WAN's value when the active uplink
    cannot be resolved or the gateway looked nothing up for it.
    """

    def value(d: UniFiWanData) -> Any:
        active, _ = resolve_active_wan(d)
        if active is None:
            return None
        return (d.geo_info.get(active) or {}).get(field)

    return value


# The far end of the last speedtest, as (result field, label, icon). One
# entry per SPEEDTEST_SERVER_FIELDS key. These describe the server the
# gateway tested against, never the subscriber's own line - the ISP
# sensors above are that.
SPEEDTEST_SERVER_SENSORS: Final[tuple[tuple[str, str, str], ...]] = (
    ("server_provider", "Server Provider", "mdi:server-network"),
    ("server_provider_url", "Server Provider URL", "mdi:link-variant"),
    ("server_city", "Server City", "mdi:city-variant-outline"),
    ("server_country", "Server Country", "mdi:earth-arrow-right"),
)


def _server_value_fn(field: str) -> Callable[[UniFiWanData], Any]:
    """Read one server field from the gateway's own speedtest block."""
    return lambda d: _active_speedtest_server(d).get(field)


# Gateway-wide speedtest server sensors, describing the active uplink's
# last recorded run.
_SERVER_SENSORS: Final[tuple[UniFiSensorDescription, ...]] = tuple(
    UniFiSensorDescription(
        key=f"speedtest_{field}",
        name=f"UniFi Speedtest {label}",
        icon=icon,
        value_fn=_server_value_fn(field),
    )
    for field, label, icon in SPEEDTEST_SERVER_SENSORS
)


def _wan_isp_value_fn(wan_number: int, field: str) -> Callable[[UniFiWanData], Any]:
    """Read one ISP field for a specific WAN, so a line is only ever
    labelled with its own operator.
    """
    return lambda d: (d.geo_info.get(wan_number) or {}).get(field)


# Gateway-wide ISP sensors, describing the active uplink's line.
_ISP_SENSORS: Final[tuple[UniFiSensorDescription, ...]] = tuple(
    UniFiSensorDescription(
        key=f"wan_{suffix}",
        name=f"UniFi WAN {label}",
        icon=icon,
        value_fn=_isp_value_fn(field),
    )
    for field, suffix, label, icon in WAN_ISP_SENSORS
)


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
        attributes_fn=lambda d: {
            "uplink_keys": sorted((d.uplink or {}).keys()),
            "uplink_ip": d.uplink.get("ip"),
            "uplink_ip6": d.uplink.get("ip6"),
            "uplink_ip6_address": d.uplink.get("ip6_address"),
            "uplink_ipv6_addresses": d.uplink.get("ipv6_addresses"),
            "uplink_ip6_addresses": d.uplink.get("ip6_addresses"),
        },
    ),
    UniFiSensorDescription(
        key="wan_down_mbps",
        name="UniFi WAN Download",
        icon="mdi:download",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: _mbps(d.uplink.get("rx_bytes-r")),
        use_rate_coordinator=True,
    ),
    UniFiSensorDescription(
        key="wan_up_mbps",
        name="UniFi WAN Upload",
        icon="mdi:upload",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: _mbps(d.uplink.get("tx_bytes-r")),
        use_rate_coordinator=True,
    ),
    UniFiSensorDescription(
        key="wan_down_mbps_scan_interval",
        name="UniFi WAN Download (Scan Interval)",
        icon="mdi:download",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: _mbps(d.uplink.get("rx_bytes-r")),
    ),
    UniFiSensorDescription(
        key="wan_up_mbps_scan_interval",
        name="UniFi WAN Upload (Scan Interval)",
        icon="mdi:upload",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: _mbps(d.uplink.get("tx_bytes-r")),
    ),
    UniFiSensorDescription(
        key="speedtest_down",
        name="UniFi Speedtest Download",
        icon="mdi:download",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: _active_speedtest(d).get("down"),
    ),
    UniFiSensorDescription(
        key="speedtest_up",
        name="UniFi Speedtest Upload",
        icon="mdi:upload",
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
        value_fn=lambda d: _active_speedtest(d).get("up"),
    ),
    UniFiSensorDescription(
        key="speedtest_ping",
        name="UniFi Speedtest Ping",
        icon="mdi:timer",
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        value_fn=lambda d: _active_speedtest(d).get("ping"),
    ),
    UniFiSensorDescription(
        key="speedtest_last_run",
        name="UniFi Speedtest Last Run",
        icon="mdi:clock-outline",
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda d: _ts_date(_active_speedtest(d).get("lastrun")),
    ),
    UniFiSensorDescription(
        key="speedtest_interface",
        name="UniFi Speedtest WAN Interface",
        icon="mdi:wan",
        value_fn=_speedtest_interface,
        attributes_fn=lambda d: {
            # What the gateway-wide Speedtest sensors are showing.
            "xput_down": _active_speedtest(d).get("down"),
            "xput_up": _active_speedtest(d).get("up"),
            "speedtest_lastrun": _active_speedtest(d).get("lastrun"),
            "per_wan_results": bool(d.per_wan_speedtest),
            # The gateway's own last-run block, whichever WAN that was on.
            "raw_speedtest_interface": d.speedtest.get("source_interface"),
            "derived_from_active_wan": not bool(d.speedtest.get("source_interface")),
            "gateway_last_speedtest_lastrun": d.speedtest.get("lastrun"),
            "speedtest_status": d.speedtest.get("status"),
        },
    ),
    *_SERVER_SENSORS,
    *_ISP_SENSORS,
    UniFiSensorDescription(
        key="active_wan_id",
        name="UniFi Active WAN ID",
        icon="mdi:numeric",
        value_fn=_wan_id,
        attributes_fn=_active_wan_attributes,
    ),
    UniFiSensorDescription(
        key="active_wan_name",
        name="UniFi Active WAN Name",
        icon="mdi:wan",
        value_fn=_wan_name,
        attributes_fn=_active_wan_attributes,
    ),
)


def _wan_speedtest_descriptions(
    wan_number: int,
) -> tuple[tuple[SensorEntityDescription, str, Callable[[Any], Any] | None], ...]:
    """Entity descriptions for one WAN's speedtest sensors, as
    (description, result field, value transform) tuples.
    """
    return (
        (
            SensorEntityDescription(
                key=f"wan{wan_number}_speedtest_down",
                name=f"UniFi WAN{wan_number} Speedtest Download",
                icon="mdi:download",
                device_class=SensorDeviceClass.DATA_RATE,
                state_class=SensorStateClass.MEASUREMENT,
                native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
            ),
            "down",
            None,
        ),
        (
            SensorEntityDescription(
                key=f"wan{wan_number}_speedtest_up",
                name=f"UniFi WAN{wan_number} Speedtest Upload",
                icon="mdi:upload",
                device_class=SensorDeviceClass.DATA_RATE,
                state_class=SensorStateClass.MEASUREMENT,
                native_unit_of_measurement=DATA_RATE_UNIT_MEGABITS_PER_SECOND,
            ),
            "up",
            None,
        ),
        (
            SensorEntityDescription(
                key=f"wan{wan_number}_speedtest_ping",
                name=f"UniFi WAN{wan_number} Speedtest Ping",
                icon="mdi:timer",
                device_class=SensorDeviceClass.DURATION,
                state_class=SensorStateClass.MEASUREMENT,
                native_unit_of_measurement=UnitOfTime.MILLISECONDS,
            ),
            "ping",
            None,
        ),
        (
            SensorEntityDescription(
                key=f"wan{wan_number}_speedtest_last_run",
                name=f"UniFi WAN{wan_number} Speedtest Last Run",
                icon="mdi:clock-outline",
                device_class=SensorDeviceClass.TIMESTAMP,
            ),
            "lastrun",
            _ts_date,
        ),
        # The server details latch with the figures they arrived with, so a
        # WAN keeps the last server it can be shown to have tested against
        # rather than borrowing whichever one another WAN reached.
        *(
            (
                SensorEntityDescription(
                    key=f"wan{wan_number}_speedtest_{field}",
                    name=f"UniFi WAN{wan_number} Speedtest {label}",
                    icon=icon,
                ),
                field,
                None,
            )
            for field, label, icon in SPEEDTEST_SERVER_SENSORS
        ),
    )


def _wan_isp_descriptions(wan_number: int) -> tuple[UniFiSensorDescription, ...]:
    """One WAN's ISP/geolocation sensors.

    These read the gateway's live per-WAN lookup rather than a speedtest
    result, so unlike the throughput sensors above they need no latching:
    the controller reports every WAN's operator on every poll, whether or
    not that WAN has ever been speedtested.
    """
    return tuple(
        UniFiSensorDescription(
            key=f"wan{wan_number}_{suffix}",
            name=f"UniFi WAN{wan_number} {label}",
            icon=icon,
            value_fn=_wan_isp_value_fn(wan_number, field),
        )
        for field, suffix, label, icon in WAN_ISP_SENSORS
    )


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    runtime: UniFiWanRuntimeData = hass.data[DOMAIN][entry.entry_id]
    rates_coord = runtime.rates_coordinator or runtime.device_coordinator
    device_coord = runtime.device_coordinator

    entry_id = entry.entry_id
    device_info = runtime.device_info
    wan_numbers = runtime.wan_numbers

    entities: list[SensorEntity] = []

    for desc in SENSORS:
        coord: DataUpdateCoordinator = (
            rates_coord if desc.use_rate_coordinator else device_coord
        )
        entities.append(UniFiGenericSensor(coord, entry_id, device_info, desc))

    # Per-WAN sensors are only created on a multi-WAN gateway. With a single
    # WAN that WAN is always the uplink, so each of these would just restate
    # its gateway-wide counterpart above.
    if len(wan_numbers) > 1:
        for wan_number in wan_numbers:
            ipv4 = UniFiSensorDescription(
                key=f"wan{wan_number}_ipv4",
                name=f"UniFi WAN{wan_number} IPv4",
                icon="mdi:ip",
                value_fn=lambda d, wn=wan_number: d.wan.get(wn, {}).get("ip") or "unknown",
            )
            entities.append(UniFiGenericSensor(device_coord, entry_id, device_info, ipv4))
            ipv6 = UniFiSensorDescription(
                key=f"wan{wan_number}_ipv6",
                name=f"UniFi WAN{wan_number} IPv6",
                icon="mdi:ip-network-outline",
                value_fn=lambda d, wn=wan_number: d.wan.get(wn, {}).get("ip6") or "unknown",
                attributes_fn=lambda d, wn=wan_number: {
                    "wan_keys": sorted((d.wan.get(wn) or {}).keys()),
                    "ip": (d.wan.get(wn) or {}).get("ip"),
                    "ip6": (d.wan.get(wn) or {}).get("ip6"),
                    "ip6_address": (d.wan.get(wn) or {}).get("ip6_address"),
                    "ipv6_addresses": (d.wan.get(wn) or {}).get("ipv6_addresses"),
                    "ip6_addresses": (d.wan.get(wn) or {}).get("ip6_addresses"),
                },
            )
            entities.append(UniFiGenericSensor(device_coord, entry_id, device_info, ipv6))

            for isp_desc in _wan_isp_descriptions(wan_number):
                entities.append(
                    UniFiGenericSensor(device_coord, entry_id, device_info, isp_desc)
                )

            for desc, field, transform in _wan_speedtest_descriptions(wan_number):
                entities.append(
                    UniFiWanSpeedtestSensor(
                        runtime, entry_id, device_info, desc, wan_number, field, transform
                    )
                )

    async_add_entities(entities)


class UniFiGenericSensor(CoordinatorEntity, SensorEntity):
    entity_description: UniFiSensorDescription

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        entry_id: str,
        device_info: dict[str, Any],
        description: UniFiSensorDescription,
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_{description.key}"
        self._attr_device_info = device_info
        self.entity_description = description

    @property
    def native_value(self) -> Any:
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        fn = self.entity_description.attributes_fn
        if fn is None:
            return None
        try:
            return fn(self.coordinator.data)
        except Exception:
            return None


class UniFiWanSpeedtestSensor(RestoreSensor):
    """Per-WAN speedtest result, latched by the integration whenever a
    completed speedtest is attributed to this WAN interface.

    The controller only stores the latest result globally, overwriting it on
    every run regardless of interface, so these sensors keep the last value
    seen for their WAN and restore it across restarts instead of re-reading
    it from the API.
    """

    _attr_should_poll = False

    def __init__(
        self,
        runtime: UniFiWanRuntimeData,
        entry_id: str,
        device_info: dict[str, Any],
        description: SensorEntityDescription,
        wan_number: int,
        field: str,
        transform: Callable[[Any], Any] | None = None,
    ) -> None:
        self._runtime = runtime
        self._wan_number = wan_number
        self._field = field
        self._transform = transform
        self._restored_value: Any = None
        self._attr_unique_id = f"{entry_id}_{description.key}"
        self._attr_device_info = device_info
        self.entity_description = description

    @property
    def extra_restore_state_data(self) -> _WanSpeedtestExtraData:
        """Stamp stored values with the attribution scheme that produced
        them, so a later release can tell which ones it may trust.
        """
        result = self._runtime.speedtest_results.get(self._wan_number)
        return _WanSpeedtestExtraData(
            version=ATTRIBUTION_VERSION,
            source=result.get("source") if result else None,
        )

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if await self._restored_value_is_trusted():
            if (last := await self.async_get_last_sensor_data()) is not None:
                self._restored_value = last.native_value
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                self._runtime.speedtest_result_signal,
                self._handle_result,
            )
        )

    async def _restored_value_is_trusted(self) -> bool:
        """Whether a stored value may be shown again after a restart.

        Values written before ATTRIBUTION_VERSION 2 are discarded: that
        release attributed a result to whichever WAN the speedtest was
        requested on, which on gateways that only ever test the active
        uplink recorded one line's throughput against another. Those
        figures would otherwise survive indefinitely on a WAN that is
        rarely active, so they are dropped rather than trusted.
        """
        extra = await self.async_get_last_extra_data()
        if extra is None:
            return False
        stored = extra.as_dict() or {}
        try:
            return int(stored.get("version", 0)) >= ATTRIBUTION_VERSION
        except (TypeError, ValueError):
            return False

    @callback
    def _handle_result(self) -> None:
        self.async_write_ha_state()

    @property
    def native_value(self) -> Any:
        result = self._runtime.speedtest_results.get(self._wan_number)
        if result is None:
            return self._restored_value
        value = result.get(self._field)
        return self._transform(value) if self._transform else value

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        result = self._runtime.speedtest_results.get(self._wan_number)
        if result is None:
            return {"attributed_by": None, "restored": True}
        return {
            # How this WAN was identified as the one the test ran on:
            # "source_interface" is the controller's own record, "active_wan"
            # means it was inferred from the active uplink instead.
            "attributed_by": result.get("source"),
            "requested_wan": result.get("requested_wan"),
            "restored": False,
        }
