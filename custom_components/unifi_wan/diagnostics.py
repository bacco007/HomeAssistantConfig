"""Diagnostics support for UniFi WAN.

Adds a "Download diagnostics" button to the integration page that returns
what the controller actually sent, alongside what the integration made of
it. Nearly every issue raised against this integration has come down to
that comparison, and this needs no logger configuration to produce.
"""
from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Final

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import DOMAIN
from . import UniFiWanData, UniFiWanRuntimeData, resolve_active_wan

# Matches the marker Home Assistant's own diagnostics helper renders.
REDACTED: Final = "**REDACTED**"

# Applied recursively by key, to the controller payload as well as to the
# config entry. Structural fields the WAN logic turns on - ifname,
# physical_ports, port_idx, up/enable flags, speedtest figures, timestamps,
# wan_networkgroup, source_interface - are deliberately left intact.
#
# Addresses are redacted, which also hides whether two of them matched, so
# the "derived" section reports the outcome of those comparisons instead.
TO_REDACT: set[str] = {
    # Credentials and where the console lives
    "api_key",
    "host",
    "guest_token",
    "syslog_key",
    "x_aes_gcm_keys",
    "x_authkey",
    "x_fingerprint",
    "x_inform_authkey",
    "x_ssh_hostkey_fingerprint",
    "x_vwirekey",
    # Addressing
    "address",
    "ip",
    "ip6",
    "ipv6",
    "ip6_address",
    "ip6_addresses",
    "ipv6_addresses",
    "ipv6_link_local_address",
    "lan_ip",
    "last_wan_ip",
    "wan_ip",
    "gateway",
    "gateway_v6",
    "dns",
    "nameservers",
    "nameservers_dynamic",
    # Hardware and account identifiers. "gw" and "sw" are short but are the
    # gateway's and switch's own identifiers in the controller payload.
    "mac",
    "ap_mac",
    "gw",
    "gw_mac",
    "sw",
    "sw_mac",
    "bssid",
    "chassis_id",
    "serial",
    "serial_number",
    "hardware_uuid",
    "sha_256",
    "dns_shield_server_list_hash",
    "_id",
    "oid",
    "anon_id",
    "anonymous_id",
    "connection_network_id",
    "device_domain",
    "device_id",
    "external_id",
    "hash_id",
    "native_networkconf_id",
    "site_id",
    "hostname",
    # Speedtest server location, which locates the subscriber too
    "provider_url",
    "city",
    "lat",
    "lon",
    "latitude",
    "longitude",
}

# A key ending in any of these is redacted whether or not it is listed above.
# The controller sends hundreds of fields and gains more with each firmware,
# so an exact list is always one release behind - and a field only turns out
# to be missing from it after someone has posted their diagnostics publicly.
# No field the WAN logic reads ends in any of these: the closest is
# "port_idx", which is not "_id", and "sw_version", which is not "sw".
REDACT_SUFFIXES: Final[tuple[str, ...]] = (
    "_id",
    "_uuid",
    "_token",
    "_key",
    "_authkey",
    "_hash",
    "_mac",
    "_ip",
    "_secret",
    "_password",
    "_fingerprint",
)


def _should_redact(key: Any) -> bool:
    return isinstance(key, str) and (key in TO_REDACT or key.endswith(REDACT_SUFFIXES))


def _redact(data: Any) -> Any:
    """Recursively redact by key name.

    Home Assistant's async_redact_data matches keys exactly, so this adds
    the suffix rules above. Empty and null values are left alone, as they
    reveal nothing and replacing them only obscures that a field was unset.
    """
    if isinstance(data, list):
        return [_redact(item) for item in data]
    if not isinstance(data, Mapping):
        return data
    redacted: dict[Any, Any] = {}
    for key, value in data.items():
        if value is None or (isinstance(value, str) and not value):
            redacted[key] = value
        elif _should_redact(key):
            redacted[key] = REDACTED
        elif isinstance(value, (Mapping, list)):
            redacted[key] = _redact(value)
        else:
            redacted[key] = value
    return redacted


def _device_summary(devices: list[dict], gateway: dict[str, Any] | None) -> list[dict]:
    """Everything on the site other than the gateway, named but not dumped.

    Only the gateway's own payload drives this integration, so the rest is
    reduced to enough context to spot a misidentified gateway.
    """
    gateway_id = id(gateway) if gateway else None
    summary = []
    for device in devices:
        if not isinstance(device, dict) or id(device) == gateway_id:
            continue
        summary.append(
            {
                "type": device.get("type"),
                "model": device.get("model"),
                "adopted": device.get("adopted"),
                "has_uplink": "uplink" in device,
            }
        )
    return summary


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    runtime: UniFiWanRuntimeData = hass.data[DOMAIN][entry.entry_id]
    data: UniFiWanData | None = runtime.device_coordinator.data

    try:
        integration = await async_get_integration(hass, DOMAIN)
        version = str(integration.version)
    except Exception:  # pragma: no cover - version is a nicety, not a feature
        version = None

    diagnostics: dict[str, Any] = {
        "integration": {
            "version": version,
            "gateway_model": runtime.dev_meta.get("model"),
            "gateway_firmware": runtime.dev_meta.get("sw_version"),
        },
        "entry": {
            "data": _redact(dict(entry.data)),
            "options": _redact(dict(entry.options)),
        },
    }

    if data is None:
        diagnostics["error"] = "coordinator has no data"
        return diagnostics

    active_wan, match_reason = resolve_active_wan(data)
    # Redacted like everything else: nothing here carries an address today,
    # but a field added later should not leak by having been overlooked.
    diagnostics["derived"] = _redact({
        # What the integration concluded, so a wrong conclusion can be told
        # apart from wrong data.
        "wan_numbers": runtime.wan_numbers,
        "active_wan": active_wan,
        "match_reason": match_reason,
        "wan_alive": data.wan_alive,
        "wan_status": data.wan_status,
        "speedtest": data.speedtest,
        "per_wan_speedtest": data.per_wan_speedtest,
        # What the sensors are actually showing, which can lag the above.
        "latched_speedtest_results": runtime.speedtest_results,
        "per_wan_api_available": data.speedtest_history_raw is not None,
        "targeted_speedtest_supported": runtime.client.targeted_speedtest_supported,
        "auto_speedtest_enabled": runtime.auto_enabled,
        "speedtest_running": runtime.get_speedtest_running(),
    })
    diagnostics["controller"] = {
        # The gateway verbatim: WAN sections, uplink, speedtest-status,
        # port_table and everything else it reports.
        "gateway_device": _redact(data.gateway or {}),
        # The per-WAN speedtest API's raw response, the source of the
        # per-WAN sensors.
        "speedtest_history": _redact(data.speedtest_history_raw or {}),
        "other_devices": _device_summary(data.devices, data.gateway),
    }
    return diagnostics
