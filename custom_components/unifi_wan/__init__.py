from __future__ import annotations

import asyncio
import logging
from collections.abc import Awaitable, Callable
from datetime import timedelta
from dataclasses import dataclass, field
from typing import Any, Final

import aiohttp
import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, CALLBACK_TYPE, callback
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    DOMAIN,
    PLATFORMS,
    CONF_HOST,
    CONF_API_KEY,
    CONF_SITE,
    CONF_VERIFY_SSL,
    CONF_SCAN_INTERVAL,
    CONF_RATE_INTERVAL,
    CONF_AUTO_SPEEDTEST,
    CONF_AUTO_SPEEDTEST_MINUTES,
    DEFAULT_SITE,
    DEFAULT_VERIFY_SSL,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_RATE_INTERVAL,
    DEFAULT_AUTO_SPEEDTEST,
    DEFAULT_AUTO_SPEEDTEST_MINUTES,
    LEGACY_CONF_DEVICE_INTERVAL,
    SIGNAL_SPEEDTEST_RUNNING,
    SIGNAL_AUTO_SPEEDTEST_CHANGED,
    SIGNAL_SPEEDTEST_RESULT,
    GATEWAY_DEVICES,
    MAX_WAN_INTERFACES,
    SERVICE_RUN_SPEEDTEST,
    ATTR_WAN,
    SPEEDTEST_TIMEOUT_SECONDS,
    SPEEDTEST_POLL_SECONDS,
)

_LOGGER = logging.getLogger(__name__)

SERVICE_RUN_SPEEDTEST_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_WAN): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=MAX_WAN_INTERFACES)
        )
    }
)

@dataclass
class UniFiWanData:
    """Structured data to avoid repeated list parsing in sensors."""
    devices: list[dict]
    gateway: dict[str, Any] | None
    uplink: dict[str, Any]
    wan: dict[int, dict[str, Any]]
    wan_alive: dict[int, bool]
    wan_status: dict[int, str]
    speedtest: dict[str, Any]
    # Per-WAN speedtest results straight from the controller, keyed by WAN
    # number. Empty when the controller has no per-WAN speedtest API.
    per_wan_speedtest: dict[int, dict[str, Any]] = field(default_factory=dict)
    # The per-WAN speedtest API's last response, kept verbatim so diagnostics
    # can show what the controller actually returned. None when unavailable.
    speedtest_history_raw: dict[str, Any] | None = None


@dataclass
class UniFiWanRuntimeData:
    """Per-config-entry runtime objects shared with the platform entities.

    Stored in ``hass.data[DOMAIN][entry_id]`` instead of a bare dict so entity
    code accesses fields by attribute (with IDE/type-checker support) rather
    than hard-coded string keys.
    """
    client: UnifiWanClient
    device_coordinator: DataUpdateCoordinator
    rates_coordinator: DataUpdateCoordinator | None
    host: str
    site: str
    dev_meta: dict[str, Any]
    device_info: dict[str, Any]
    auto_enabled: bool
    manage_auto: Callable[[bool], None]
    run_speedtest_now: Callable[[int | None], Awaitable[None]]
    speedtest_running_signal: str
    auto_changed_signal: str
    get_speedtest_running: Callable[[], bool]
    set_speedtest_running: Callable[[bool], Awaitable[None]]
    wan_numbers: list[int]
    reload_signature: dict[str, Any]
    speedtest_results: dict[int, dict[str, Any]]
    speedtest_result_signal: str


class UnifiWanClient:
    """Simple HTTP client for UniFi Network endpoints."""

    def __init__(self, hass: HomeAssistant, host: str, api_key: str, site: str, verify_ssl: bool):
        self._hass = hass
        self.host = (host or "").strip().rstrip("/")
        self.api_key = (api_key or "").strip()
        self.site = site or DEFAULT_SITE
        self.verify_ssl = bool(verify_ssl)
        self._session = async_get_clientsession(hass, self.verify_ssl)
        # Set once the controller has told us it has no per-WAN speedtest
        # API, so we stop asking on every poll.
        self._speedtest_history_unsupported = False
        # None until a targeted speedtest tells us whether this controller
        # accepts one; False stops us retrying endpoints it has rejected.
        self.targeted_speedtest_supported: bool | None = None

    def _url(self, path: str) -> str:
        return f"https://{self.host}/proxy/network/api/s/{self.site}/{path}"

    def _url_v2(self, path: str) -> str:
        return f"https://{self.host}/proxy/network/v2/api/site/{self.site}/{path}"

    async def get_json(self, path: str) -> dict:
        url = self._url(path)
        headers = {"X-API-Key": self.api_key}
        try:
            async with self._session.get(url, headers=headers) as resp:
                if resp.status in (401, 403):
                    raise ConfigEntryAuthFailed(
                        f"Authentication failed (HTTP {resp.status})"
                    )
                text = await resp.text()
                if resp.status != 200:
                    raise UpdateFailed(f"HTTP {resp.status} for {url}: {text[:200]}")
                return await resp.json(content_type=None)
        except (ConfigEntryAuthFailed, UpdateFailed):
            raise
        except Exception as e:
            raise UpdateFailed(f"Connection error: {e}") from e

    async def _post(self, url: str, payload: dict) -> tuple[int, Any]:
        """POST and return (status, decoded body). Status 0 means the request
        itself failed. A 200 with an empty or non-JSON body still counts as
        accepted, so the body falls back to a plain ok marker.
        """
        headers = {"X-API-Key": self.api_key}
        try:
            async with self._session.post(url, headers=headers, json=payload) as resp:
                try:
                    body = await resp.json(content_type=None)
                except (aiohttp.ContentTypeError, ValueError):
                    body = {"ok": resp.status == 200}
                if resp.status != 200:
                    _LOGGER.debug("HTTP %s for %s", resp.status, url)
                return resp.status, body
        except Exception as e:
            _LOGGER.error("POST failed: %s", e)
            return 0, None

    async def post_json(self, path: str, payload: dict) -> dict:
        status, body = await self._post(self._url(path), payload)
        if status != 200:
            _LOGGER.error("HTTP %s for %s", status, self._url(path))
            return {"ok": False}
        return body if isinstance(body, dict) else {"ok": True}

    async def get_speedtest_history(self) -> dict | None:
        """Per-WAN speedtest records from the v2 API, or None if this
        controller does not offer them.

        Unlike the gateway's single global result, this endpoint keeps a
        record per WAN, which is the only way to know a non-active WAN's
        own throughput. Older firmware answers 404/405 and is expected.
        """
        if self._speedtest_history_unsupported:
            return None
        url = self._url_v2("speedtest")
        headers = {"X-API-Key": self.api_key}
        try:
            async with self._session.get(url, headers=headers) as resp:
                if resp.status in (400, 401, 403, 404, 405):
                    self._speedtest_history_unsupported = True
                    _LOGGER.debug(
                        "Per-WAN speedtest API unavailable (HTTP %s for %s); "
                        "falling back to attributing the gateway's global result",
                        resp.status,
                        url,
                    )
                    return None
                if resp.status != 200:
                    return None
                body = await resp.json(content_type=None)
                return body if isinstance(body, dict) else None
        except Exception as e:
            _LOGGER.debug("Per-WAN speedtest fetch failed: %s", e)
            return None

    async def get_devices(self) -> dict:
        return await self.get_json("stat/device")

    async def get_device(self, mac: str) -> dict:
        return await self.get_json(f"stat/device/{mac}")

    async def run_speedtest(
        self,
        mac: str,
        wan_number: int | None = None,
        interface_name: str | None = None,
    ) -> dict:
        """Trigger a speedtest, optionally against a specific WAN.

        A targeted run identifies the interface with "interface_name" (the
        WAN's own ifname, e.g. "eth7"). Firmware differs over which endpoint
        accepts it, so the known forms are tried in turn until one is not
        rejected. Once a controller has rejected all of them it is not asked
        again, and every run uses the plain whole-gateway command.
        """
        plain = {"cmd": "speedtest", "mac": mac}
        if wan_number is None or self.targeted_speedtest_supported is False:
            return await self.post_json("cmd/devmgr", plain)

        # Fall back to the logical name when the WAN section has no ifname.
        iface = interface_name or ("wan" if wan_number == 1 else f"wan{wan_number}")
        attempts: list[tuple[str, dict]] = [
            (self._url("cmd/devmgr/speedtest"), {"interface_name": iface}),
            (
                self._url("cmd/devmgr"),
                {"cmd": "speedtest", "mac": mac, "interface_name": iface},
            ),
            (self._url_v2("speedtest"), {"interface_name": iface}),
        ]
        tried: list[str] = []
        for url, payload in attempts:
            status, body = await self._post(url, payload)
            # Record the path from /network/ onwards; the host and site add
            # nothing and the site name is not worth putting in a log.
            tried.append(f"{url.split('/network/', 1)[-1]}={status}")
            if status == 200:
                self.targeted_speedtest_supported = True
                _LOGGER.debug("Speedtest for WAN%s accepted by %s", wan_number, url)
                return body if isinstance(body, dict) else {"ok": True}
            if status not in (400, 401, 403, 404, 405):
                # A real failure rather than "this endpoint isn't the one".
                break
        self.targeted_speedtest_supported = False
        _LOGGER.warning(
            "This controller rejected every per-WAN speedtest request for WAN%s "
            "(interface %r; tried %s). Falling back to a whole-gateway speedtest "
            "and not asking again this session. Results are still recorded "
            "against whichever WAN the controller reports having tested.",
            wan_number,
            iface,
            ", ".join(tried),
        )
        return await self.post_json("cmd/devmgr", plain)


def _log_raw_payload(gateway: dict[str, Any] | None, devices: list[dict]) -> None:
    """Emit a debug log that surfaces the gateway fields behind the IPv6,
    WAN identification and speedtest sensors so users can see what the
    controller is actually returning. Enable with:
        logger:
          default: warning
          logs:
            custom_components.unifi_wan: debug
    """
    if not _LOGGER.isEnabledFor(logging.DEBUG):
        return
    if not gateway:
        _LOGGER.debug("UniFi raw payload: no gateway device found in %d devices", len(devices))
        return
    uplink = gateway.get("uplink") or {}
    wan_keys = [k for k in gateway.keys() if k == "wan" or (k.startswith("wan") and k[3:].isdigit())]
    wan_dump = {k: gateway.get(k) for k in wan_keys}
    port_table = gateway.get("port_table")
    ports = (
        [
            {k: p.get(k) for k in ("port_idx", "name", "ifname")}
            for p in port_table
            if isinstance(p, dict)
        ]
        if isinstance(port_table, list)
        else None
    )
    _LOGGER.debug(
        "UniFi raw gateway debug: uplink_keys=%s uplink.ip=%s uplink.ip6=%s "
        "uplink.name=%s uplink.physical_ports=%s speedtest-status=%s "
        "wan_blocks=%s last_wan_interfaces=%s port_table=%s",
        sorted(uplink.keys()),
        uplink.get("ip"),
        uplink.get("ip6"),
        uplink.get("name"),
        uplink.get("physical_ports"),
        gateway.get("speedtest-status"),
        wan_dump,
        gateway.get("last_wan_interfaces"),
        ports,
    )


def _is_routable_ipv6(addr: str | None) -> bool:
    """True only for public/ULA IPv6 addresses worth exposing as a WAN IP.
    Skips link-local (fe80::/10), loopback (::1), unspecified (::) and
    obvious junk so we don't mislead users into thinking they have IPv6
    when their ISP only auto-assigned a link-local.
    """
    if not addr or not isinstance(addr, str):
        return False
    a = addr.strip().lower().split("%", 1)[0].split("/", 1)[0]
    if not a or ":" not in a:
        return False
    if a in ("::", "::1"):
        return False
    # fe80::/10 link-local spans the fe8/fe9/fea/feb prefixes.
    if a.startswith(("fe8", "fe9", "fea", "feb")):
        return False
    return True


def _get_ip6_from(data: dict[str, Any]) -> str | None:
    """Extract a routable IPv6 address from a data dict, trying multiple
    field names and formats. Link-local addresses are ignored.
    """
    for key in ("ip6", "ip6_address", "ipv6_address"):
        val = data.get(key)
        if isinstance(val, str) and _is_routable_ipv6(val):
            return val
    for key in ("ipv6", "ip6_addresses", "ipv6_addresses"):
        val = data.get(key)
        if val and isinstance(val, list):
            for entry in val:
                if isinstance(entry, str) and _is_routable_ipv6(entry):
                    return entry
                if isinstance(entry, dict):
                    addr = entry.get("address") or entry.get("ip6") or entry.get("ip")
                    if isinstance(addr, str) and _is_routable_ipv6(addr):
                        return addr
    return None


def wan_group_to_number(group: Any) -> int | None:
    """Map a controller WAN group name to a WAN number: "WAN" is WAN1,
    "WAN2" is WAN2, and so on. Used for both last_wan_interfaces keys and
    the per-WAN speedtest API's wan_networkgroup.
    """
    if not isinstance(group, str):
        return None
    s = group.strip().upper()
    if s == "WAN":
        return 1
    if s.startswith("WAN") and s[3:].isdigit():
        return int(s[3:])
    return None


def _normalise_interface(iface: Any) -> str | None:
    """Clean a controller-reported interface name.

    The speedtest block prefixes the interface with "if!" (e.g. "if!eth6")
    and reports an empty string when it has nothing to say.
    """
    if not isinstance(iface, str):
        return None
    s = iface.strip()
    if s.startswith("if!"):
        s = s[3:]
    return s or None


def _extract_speedtest(
    gateway: dict[str, Any] | None, uplink: dict[str, Any]
) -> dict[str, Any]:
    """Normalise the gateway's speedtest result into a single dict.

    The authoritative source is the gateway's ``speedtest-status`` block,
    which is the only place the controller records *which* interface the
    test actually ran on (``source_interface``). The ``uplink`` fields carry
    the same numbers under different names and are used as a fallback for
    firmware that omits the block.
    """
    raw = gateway.get("speedtest-status") if gateway else None
    status = raw if isinstance(raw, dict) else {}

    def pick(primary: Any, fallback: Any) -> Any:
        return primary if primary is not None else fallback

    return {
        "down": pick(status.get("xput_download"), uplink.get("xput_down")),
        "up": pick(status.get("xput_upload"), uplink.get("xput_up")),
        "ping": pick(status.get("latency"), uplink.get("speedtest_ping")),
        "lastrun": pick(status.get("rundate"), uplink.get("speedtest_lastrun")),
        "status": pick(status.get("status_summary"), uplink.get("speedtest_status")),
        # None when the controller does not say; never guessed.
        "source_interface": _normalise_interface(status.get("source_interface")),
    }


def _first_present(entry: dict[str, Any], *keys: str) -> Any:
    """First key holding a non-null value.

    Not dict.get(a, dict.get(b)): the controller sends a key with an explicit
    null while an older spelling alongside it still carries the figure, and
    the default form would return that null instead of falling through.
    """
    for key in keys:
        value = entry.get(key)
        if value is not None:
            return value
    return None


def _speedtest_epoch(value: Any) -> int | None:
    """Coerce a speedtest timestamp to epoch seconds.

    The v2 API reports milliseconds while the gateway block reports
    seconds; anything past the year 5138 in seconds is really milliseconds.
    """
    try:
        ts = int(value)
    except (TypeError, ValueError):
        return None
    if ts <= 0:
        return None
    return ts // 1000 if ts > 100_000_000_000 else ts


def parse_speedtest_history(
    body: dict[str, Any] | None, wan: dict[int, dict[str, Any]]
) -> dict[int, dict[str, Any]]:
    """Latest speedtest per WAN from the v2 API's records.

    Each record names its WAN directly (wan_networkgroup), which removes
    the guesswork of deciding which interface a global result belonged to.
    Records are applied oldest first so the newest wins per WAN.
    """
    if not isinstance(body, dict):
        return {}
    entries = body.get("data")
    if not isinstance(entries, list):
        return {}

    results: dict[int, dict[str, Any]] = {}
    for entry in sorted(
        (e for e in entries if isinstance(e, dict)),
        key=lambda e: _speedtest_epoch(e.get("time")) or 0,
    ):
        wan_number = wan_group_to_number(
            entry.get("wan_networkgroup") or entry.get("wan_group")
        )
        if wan_number is None:
            wan_number = interface_to_wan_number(
                entry.get("interface_name")
                or entry.get("interface")
                or entry.get("ifname"),
                wan,
            )
        if wan_number is None:
            continue
        down = _first_present(entry, "download_mbps", "xput_down", "download")
        up = _first_present(entry, "upload_mbps", "xput_up", "upload")
        ping = _first_present(entry, "latency_ms", "speedtest_ping", "latency")
        if down is None and up is None:
            continue
        if down is None or up is None:
            # A spelling we don't know would show up here as a permanently
            # missing figure, so say which record and what it contained.
            _LOGGER.debug(
                "Speedtest record for WAN%s has no %s value (record keys: %s)",
                wan_number,
                "download" if down is None else "upload",
                sorted(entry),
            )
        results[wan_number] = {
            "down": down,
            "up": up,
            "ping": ping,
            "lastrun": _speedtest_epoch(entry.get("time")),
            "source": "speedtest_api",
            "requested_wan": None,
        }
    return results


def _extract_wan_data(payload: dict[str, Any] | None) -> UniFiWanData:
    """Process raw JSON into a structured object once."""
    devices = []
    if isinstance(payload, dict):
        devices = payload.get("data", []) or []

    gateway = None
    for t in GATEWAY_DEVICES:
        candidates = [d for d in devices if isinstance(d, dict) and d.get("type") == t]
        if candidates:
            candidates.sort(key=lambda d: (not d.get("adopted", True), "uplink" not in d))
            gateway = candidates[0]
            break

    _log_raw_payload(gateway, devices)

    uplink = dict((gateway.get("uplink") or {}) if gateway else {})
    last_wan_interfaces = (gateway.get("last_wan_interfaces") or {}) if gateway else {}
    last_wan_status_raw = (gateway.get("last_wan_status") or {}) if gateway else {}
    wan_interfaces = last_wan_interfaces.keys()

    wan_numbers: set[int] = set()
    for wan_interface in wan_interfaces:
        if wan_interface == "WAN":
            wan_numbers.add(1)
        elif wan_interface.startswith("WAN"):
            try:
                wan_numbers.add(int(wan_interface[3:]))
            except ValueError:
                pass

    # Fallback: if last_wan_interfaces is absent, detect WAN entries directly from gateway
    if not wan_numbers and gateway:
        if gateway.get("wan1") or gateway.get("wan"):
            wan_numbers.add(1)
        for i in range(2, MAX_WAN_INTERFACES + 1):
            if gateway.get(f"wan{i}"):
                wan_numbers.add(i)

    wan: dict[int, dict[str, Any]] = {}
    for wan_number in wan_numbers:
        if wan_number == 1:
            raw = (gateway.get("wan1") or gateway.get("wan") or {}) if gateway else {}
        else:
            raw = (gateway.get(f"wan{wan_number}") or {}) if gateway else {}
        wan_entry = dict(raw)
        # Normalise IPv6 into the canonical "ip6" key for uniform sensor access
        if not wan_entry.get("ip6"):
            ip6 = _get_ip6_from(wan_entry)
            if ip6:
                wan_entry["ip6"] = ip6
        wan[wan_number] = wan_entry

    # Supplement uplink IPv6 from WAN data or gateway-level fields if not directly present
    if gateway and not uplink.get("ip6"):
        ip6 = _get_ip6_from(uplink)
        if not ip6:
            # Try matching active WAN by IPv4 first, then fall back to any WAN with IPv6
            active_ip = uplink.get("ip")
            for wan_data in wan.values():
                if not wan_data:
                    continue
                if active_ip and wan_data.get("ip") != active_ip:
                    continue
                ip6 = wan_data.get("ip6") or _get_ip6_from(wan_data)
                if ip6:
                    break
        # Last resort: check gateway root-level IPv6 fields
        if not ip6:
            ip6 = _get_ip6_from(gateway)
        if ip6:
            uplink["ip6"] = ip6

    wan_alive: dict[int, bool] = {}
    wan_status_map: dict[int, str] = {}
    for wan_key, iface_data in last_wan_interfaces.items():
        if wan_key == "WAN":
            n = 1
        elif wan_key.startswith("WAN"):
            try:
                n = int(wan_key[3:])
            except ValueError:
                continue
        else:
            continue
        wan_alive[n] = bool(iface_data.get("alive", False))
        wan_status_map[n] = last_wan_status_raw.get(wan_key, "unknown")

    return UniFiWanData(
        devices=devices,
        gateway=gateway,
        uplink=uplink,
        wan=wan,
        wan_alive=wan_alive,
        wan_status=wan_status_map,
        speedtest=_extract_speedtest(gateway, uplink),
    )


def resolve_active_wan(d: UniFiWanData) -> tuple[int | None, str]:
    """Resolve which WAN number is the active uplink, and how it was matched.

    This is the single source of truth used by both the Active WAN ID and
    Active WAN Name sensors, so the two can never point at different
    interfaces. Match order: the uplink's IP against each WAN section's IP,
    then the uplink's port name against each WAN section's ifname, and
    finally the only WAN that is up. In load-balanced dual-WAN setups the
    controller's uplink object can mix fields from both interfaces, which
    is why the IP match takes precedence over the port name.
    """
    u_ip = d.uplink.get("ip")
    if u_ip:
        for wan_number, wan_data in d.wan.items():
            if u_ip == wan_data.get("ip"):
                return wan_number, "uplink_ip"
    u_name = str(d.uplink.get("name") or "").strip().lower()
    if u_name:
        for wan_number, wan_data in d.wan.items():
            if u_name == str(wan_data.get("ifname") or "").strip().lower():
                return wan_number, "uplink_ifname"
    up_numbers = [n for n, wan_data in d.wan.items() if wan_data.get("up")]
    if len(up_numbers) == 1:
        return up_numbers[0], "only_wan_up"
    return None, "no_match"


def interface_to_wan_number(iface: Any, wan: dict[int, dict[str, Any]]) -> int | None:
    """Map a controller-reported interface to a WAN number.

    Matches against each WAN section's own interface fields, so PPPoE
    uplinks ("ppp0") resolve as readily as plain ethernet ones. The
    "wan"/"wan2" spellings used by the speedtest command are handled too,
    but only after the section match: a literal interface name is stronger
    evidence than a naming convention.
    """
    s = _normalise_interface(iface)
    if not s:
        return None
    s = s.lower()
    for wan_number, wan_data in wan.items():
        for key in ("ifname", "name"):
            if s == str(wan_data.get(key) or "").strip().lower():
                return wan_number
    if s == "wan":
        return 1
    if s.startswith("wan") and s[3:].isdigit():
        return int(s[3:])
    return None


async def _async_migrate_registry(
    hass: HomeAssistant, entry: ConfigEntry, host: str, site: str
) -> None:
    """Migrate legacy host/site-based unique IDs and device identifiers to
    the config entry ID, so entities survive a host or site rename.
    """
    old_prefix = f"{host}_{site}_"
    new_prefix = f"{entry.entry_id}_"

    @callback
    def _migrate(entity_entry: er.RegistryEntry) -> dict[str, str] | None:
        if entity_entry.unique_id.startswith(old_prefix):
            return {
                "new_unique_id": new_prefix + entity_entry.unique_id[len(old_prefix):]
            }
        return None

    try:
        await er.async_migrate_entries(hass, entry.entry_id, _migrate)
    except ValueError as e:
        _LOGGER.warning("Could not migrate legacy unique IDs: %s", e)

    dev_reg = dr.async_get(hass)
    # Legacy releases used a non-standard 3-tuple identifier
    device = dev_reg.async_get_device(identifiers={(DOMAIN, host, site)})  # type: ignore[arg-type]
    if device:
        dev_reg.async_update_device(
            device.id, new_identifiers={(DOMAIN, entry.entry_id)}
        )


# Config keys whose change requires a full reload of the entry. CONF_AUTO_SPEEDTEST
# is deliberately excluded: the switch entity applies it live, so persisting it
# must not tear down every entity.
RELOAD_OPTION_KEYS: Final = (
    CONF_HOST,
    CONF_API_KEY,
    CONF_SITE,
    CONF_VERIFY_SSL,
    CONF_SCAN_INTERVAL,
    CONF_RATE_INTERVAL,
    CONF_AUTO_SPEEDTEST_MINUTES,
)


def merged_option(entry: ConfigEntry, key: str, default: Any = None) -> Any:
    """Effective config value: options first, then data, then default.

    Setup and the options flow both resolve settings this way; centralising it
    keeps the two paths consistent.
    """
    return entry.options.get(key, entry.data.get(key, default))


def _reload_signature(entry: ConfigEntry) -> dict[str, Any]:
    """Snapshot of the config values that require a full reload when changed."""
    merged = {**entry.data, **entry.options}
    return {key: merged.get(key) for key in RELOAD_OPTION_KEYS}


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    options = entry.options or {}

    host = merged_option(entry, CONF_HOST)
    api_key = merged_option(entry, CONF_API_KEY)
    site = merged_option(entry, CONF_SITE, DEFAULT_SITE)
    verify_ssl = merged_option(entry, CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)

    scan_seconds = int(options.get(CONF_SCAN_INTERVAL, options.get(LEGACY_CONF_DEVICE_INTERVAL, DEFAULT_SCAN_INTERVAL)))
    rate_seconds = int(options.get(CONF_RATE_INTERVAL, DEFAULT_RATE_INTERVAL))

    auto_minutes = int(merged_option(entry, CONF_AUTO_SPEEDTEST_MINUTES, DEFAULT_AUTO_SPEEDTEST_MINUTES))
    auto_enabled = bool(merged_option(entry, CONF_AUTO_SPEEDTEST, DEFAULT_AUTO_SPEEDTEST))

    await _async_migrate_registry(hass, entry, host, site)

    client = UnifiWanClient(hass, host, api_key, site, verify_ssl)

    async def _update_devices() -> UniFiWanData:
        """Fetch and process data."""
        raw = await client.get_devices()
        data = _extract_wan_data(raw)
        # Best effort: controllers that offer it report a result per WAN,
        # which beats inferring which WAN a global result belonged to.
        history = await client.get_speedtest_history()
        if history is not None:
            data.speedtest_history_raw = history
            data.per_wan_speedtest = parse_speedtest_history(history, data.wan)
        return data

    device_coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=f"{DOMAIN}_device",
        update_method=_update_devices,
        update_interval=timedelta(seconds=scan_seconds),
    )
    await device_coordinator.async_config_entry_first_refresh()

    dev_meta: dict[str, Any] = {"sw_version": None, "model": "UDM/UGW", "mac": None}
    if device_coordinator.data.gateway:
        gw = device_coordinator.data.gateway
        dev_meta["sw_version"] = gw.get("version") or gw.get("firmware_version")
        dev_meta["model"] = gw.get("model") or gw.get("type") or "UDM/UGW"
        dev_meta["mac"] = gw.get("mac")

    wan_numbers = sorted(device_coordinator.data.wan)

    rates_coordinator: DataUpdateCoordinator | None = None
    if dev_meta["mac"] and rate_seconds > 0:
        mac = dev_meta["mac"]
        async def _update_rates():
            raw = await client.get_device(mac)
            return _extract_wan_data(raw)

        rates_coordinator = DataUpdateCoordinator(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_rates",
            update_method=_update_rates,
            update_interval=timedelta(seconds=rate_seconds),
        )
        await rates_coordinator.async_config_entry_first_refresh()

    entry_signal = f"{SIGNAL_SPEEDTEST_RUNNING}_{entry.entry_id}"
    auto_changed_signal = f"{SIGNAL_AUTO_SPEEDTEST_CHANGED}_{entry.entry_id}"
    result_signal = f"{SIGNAL_SPEEDTEST_RESULT}_{entry.entry_id}"
    speedtest_running: bool = False
    unsub_auto: CALLBACK_TYPE | None = None

    # Per-WAN speedtest results latched by _process_speedtest_result. The
    # controller only stores the latest result, so the integration attributes
    # each completed run to a WAN and keeps it here.
    speedtest_results: dict[int, dict[str, Any]] = {}
    # WAN number requested for the speedtest currently in flight, if any.
    # Used only to report on the controller's behaviour - never to attribute
    # a result. See _process_speedtest_result.
    pending_speedtest_wan: int | None = None
    # None until a targeted run tells us whether this controller honours the
    # requested interface; False disables the auto-speedtest WAN rotation.
    per_wan_speedtest_supported: bool | None = None
    # Seed with the result already on the controller so a stale run isn't
    # re-attributed after every restart; per-WAN sensors restore their own
    # previous state instead.
    last_attributed_run = device_coordinator.data.speedtest.get("lastrun")

    def _dispatch_running():
        async_dispatcher_send(hass, entry_signal)

    @callback
    def _process_speedtest_result() -> None:
        """Publish per-WAN speedtest results on every coordinator refresh.

        When the controller offers a per-WAN speedtest API its records are
        authoritative and are used as-is. Otherwise the gateway's single
        global result is attributed to a WAN on evidence: the interface the
        controller says the test ran on, or failing that the active uplink.
        The requested interface is deliberately never used as a fallback -
        firmware that ignores it always tests the active uplink, so trusting
        the request labels one WAN's throughput as another's.
        """
        nonlocal last_attributed_run, per_wan_speedtest_supported
        data: UniFiWanData | None = device_coordinator.data
        if not data:
            return

        if data.per_wan_speedtest:
            changed = False
            for wan_number, result in data.per_wan_speedtest.items():
                # Compare the whole record, not just its timestamp: the
                # controller fills a run's figures in over several seconds
                # and keeps the same timestamp while doing so, so a poll
                # that catches a half-written record must still accept the
                # completed one rather than treating it as already seen.
                if speedtest_results.get(wan_number) == result:
                    continue
                speedtest_results[wan_number] = dict(result)
                changed = True
            if changed:
                _LOGGER.debug(
                    "Per-WAN speedtest results updated: %s",
                    {
                        f"WAN{n}": {
                            k: r.get(k) for k in ("down", "up", "ping", "lastrun")
                        }
                        for n, r in sorted(speedtest_results.items())
                    },
                )
                async_dispatcher_send(hass, result_signal)
            return

        result = data.speedtest
        lastrun = result.get("lastrun")
        if not lastrun or lastrun == last_attributed_run:
            return
        if result.get("down") is None and result.get("up") is None:
            return
        last_attributed_run = lastrun

        requested = pending_speedtest_wan
        wan_number = interface_to_wan_number(result.get("source_interface"), data.wan)
        source = "source_interface"
        if wan_number is None:
            wan_number, _ = resolve_active_wan(data)
            source = "active_wan"
        if wan_number is None:
            _LOGGER.debug(
                "Speedtest result could not be attributed to a WAN "
                "(source_interface=%r)",
                result.get("source_interface"),
            )
            return

        if requested is not None and requested != wan_number:
            if per_wan_speedtest_supported is not False:
                per_wan_speedtest_supported = False
                _LOGGER.warning(
                    "Speedtest was requested on WAN%s but the controller ran it "
                    "on WAN%s (matched by %s). This gateway appears to always "
                    "test the active uplink, so per-WAN speedtest requests are "
                    "not supported; the result has been recorded against WAN%s "
                    "and the automatic speedtest will stop cycling interfaces.",
                    requested,
                    wan_number,
                    source,
                    wan_number,
                )
        elif requested is not None and source == "source_interface":
            per_wan_speedtest_supported = True

        speedtest_results[wan_number] = {
            "down": result.get("down"),
            "up": result.get("up"),
            "ping": result.get("ping"),
            "lastrun": lastrun,
            "source": source,
            "requested_wan": requested,
        }
        _LOGGER.debug(
            "Attributed speedtest result to WAN%s (matched by %s, requested %s)",
            wan_number,
            source,
            requested,
        )
        async_dispatcher_send(hass, result_signal)

    entry.async_on_unload(
        device_coordinator.async_add_listener(_process_speedtest_result)
    )

    async def set_speedtest_running(is_running: bool) -> None:
        nonlocal speedtest_running
        if speedtest_running == is_running:
            return
        speedtest_running = is_running
        _dispatch_running()

    async def _run_speedtest_now(wan_number: int | None = None) -> None:
        """Trigger a speedtest, optionally on a specific WAN interface, and
        wait (with a timeout) for the controller to report a fresh result.
        """
        nonlocal pending_speedtest_wan
        if speedtest_running:
            _LOGGER.debug("Speedtest already in progress; ignoring trigger")
            return

        await set_speedtest_running(True)
        pending_speedtest_wan = wan_number
        try:
            gw_data = device_coordinator.data
            mac_local = gw_data.gateway.get("mac") if gw_data.gateway else None

            if not mac_local:
                await device_coordinator.async_request_refresh()
                gw_data = device_coordinator.data
                mac_local = gw_data.gateway.get("mac") if gw_data.gateway else None

            if not mac_local:
                _LOGGER.warning("Cannot run speedtest: No gateway found.")
                return

            def _lastrun_of(gw: UniFiWanData | None) -> Any:
                """The timestamp this run should be watching.

                A targeted run on a controller with a per-WAN speedtest API
                may only update that WAN's record, leaving the gateway's
                global result untouched, so watch the WAN's own timestamp
                there and the global one otherwise.
                """
                if gw is None:
                    return None
                if wan_number is not None and gw.per_wan_speedtest:
                    entry = gw.per_wan_speedtest.get(wan_number)
                    return entry.get("lastrun") if entry else None
                return gw.speedtest.get("lastrun")

            last_run_before = _lastrun_of(gw_data)
            # With a single WAN the whole-gateway speedtest already is that
            # WAN's speedtest, so don't ask the controller to target it -
            # firmware that rejects targeted requests would otherwise turn
            # every press of the per-WAN button into three failed calls.
            target = wan_number if len(wan_numbers) > 1 else None
            iface = None
            if target is not None:
                iface = (gw_data.wan.get(target) or {}).get("ifname")
            await client.run_speedtest(mac_local, target, iface)

            # Poll until the controller reports a new result or we time out.
            deadline = hass.loop.time() + SPEEDTEST_TIMEOUT_SECONDS
            while hass.loop.time() < deadline:
                await asyncio.sleep(SPEEDTEST_POLL_SECONDS)
                await device_coordinator.async_request_refresh()
                gw_data = device_coordinator.data
                last_run = _lastrun_of(gw_data)
                if last_run and last_run != last_run_before:
                    break
            else:
                _LOGGER.warning(
                    "Speedtest did not report a result within %s seconds",
                    SPEEDTEST_TIMEOUT_SECONDS,
                )
        except Exception as e:
            _LOGGER.error("Speedtest trigger failed: %s", e)
        finally:
            pending_speedtest_wan = None
            if rates_coordinator:
                await rates_coordinator.async_request_refresh()
            await set_speedtest_running(False)

    auto_wan_index = 0

    async def _auto_speedtest_callback(_now) -> None:
        """Run the scheduled speedtest, cycling through the WAN interfaces
        that currently have link so each WAN accumulates its own results.

        The rotation stops as soon as the controller is seen to ignore a
        requested interface (see _process_speedtest_result): on those
        gateways every run tests the active uplink anyway, so cycling would
        only spend extra tests to measure the same WAN repeatedly.
        """
        nonlocal auto_wan_index
        data: UniFiWanData | None = device_coordinator.data
        # A controller with a per-WAN speedtest API records each run against
        # its own WAN, so cycling is worthwhile there - but only if it will
        # accept a targeted request in the first place.
        has_per_wan_api = bool(data and data.per_wan_speedtest)
        pointless = client.targeted_speedtest_supported is False or (
            per_wan_speedtest_supported is False and not has_per_wan_api
        )
        if pointless:
            await _run_speedtest_now()
            return
        candidates = [
            n for n in wan_numbers if (data.wan.get(n) or {}).get("up")
        ] if data else []
        if len(candidates) > 1:
            wan_number = candidates[auto_wan_index % len(candidates)]
            auto_wan_index += 1
            await _run_speedtest_now(wan_number)
        else:
            await _run_speedtest_now()

    def _schedule_auto(enabled: bool) -> None:
        nonlocal unsub_auto
        if unsub_auto:
            unsub_auto()
            unsub_auto = None

        if enabled:
            unsub_auto = async_track_time_interval(
                hass, _auto_speedtest_callback, timedelta(minutes=max(1, auto_minutes))
            )
            _LOGGER.debug("Auto speedtest scheduled every %s min", auto_minutes)

    _schedule_auto(auto_enabled)

    device_info: dict[str, Any] = {
        "identifiers": {(DOMAIN, entry.entry_id)},
        "name": f"UniFi WAN ({host} / {site})",
        "manufacturer": "Ubiquiti",
        "model": dev_meta["model"],
        "sw_version": dev_meta["sw_version"],
        "configuration_url": f"https://{host}/",
    }

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = UniFiWanRuntimeData(
        client=client,
        device_coordinator=device_coordinator,
        rates_coordinator=rates_coordinator,
        host=host,
        site=site,
        dev_meta=dev_meta,
        device_info=device_info,
        auto_enabled=auto_enabled,
        manage_auto=_schedule_auto,
        run_speedtest_now=_run_speedtest_now,
        speedtest_running_signal=entry_signal,
        auto_changed_signal=auto_changed_signal,
        get_speedtest_running=lambda: speedtest_running,
        set_speedtest_running=set_speedtest_running,
        wan_numbers=wan_numbers,
        reload_signature=_reload_signature(entry),
        speedtest_results=speedtest_results,
        speedtest_result_signal=result_signal,
    )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    # Register the service once for the whole domain; the handler looks up
    # the currently loaded entries each call so it works with multiple
    # gateways and survives individual entries being unloaded.
    if not hass.services.has_service(DOMAIN, SERVICE_RUN_SPEEDTEST):
        async def handle_run_speedtest(call: ServiceCall) -> None:
            wan_number = call.data.get(ATTR_WAN)
            for runtime_data in list(hass.data.get(DOMAIN, {}).values()):
                hass.async_create_task(runtime_data.run_speedtest_now(wan_number))

        hass.services.async_register(
            DOMAIN,
            SERVICE_RUN_SPEEDTEST,
            handle_run_speedtest,
            schema=SERVICE_RUN_SPEEDTEST_SCHEMA,
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    runtime: UniFiWanRuntimeData | None = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if runtime is not None:
        runtime.manage_auto(False)

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)

    if not hass.data.get(DOMAIN) and hass.services.has_service(DOMAIN, SERVICE_RUN_SPEEDTEST):
        hass.services.async_remove(DOMAIN, SERVICE_RUN_SPEEDTEST)

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    runtime: UniFiWanRuntimeData | None = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if runtime is not None and _reload_signature(entry) == runtime.reload_signature:
        # Nothing that requires a fresh setup changed. The auto-speedtest enable
        # flag is the only live-managed option: the switch entity applies it
        # directly, and when it is changed through the options dialog we apply it
        # here too. Either way we avoid a full reload that would briefly mark
        # every entity unavailable.
        enabled = bool(merged_option(entry, CONF_AUTO_SPEEDTEST, DEFAULT_AUTO_SPEEDTEST))
        if enabled != runtime.auto_enabled:
            runtime.manage_auto(enabled)
            runtime.auto_enabled = enabled
            async_dispatcher_send(hass, runtime.auto_changed_signal)
        return
    await hass.config_entries.async_reload(entry.entry_id)
