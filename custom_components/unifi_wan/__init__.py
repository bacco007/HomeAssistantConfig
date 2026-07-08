from __future__ import annotations

import asyncio
import logging
from datetime import timedelta
from dataclasses import dataclass
from typing import Any

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

class UnifiWanClient:
    """Simple HTTP client for UniFi Network endpoints."""

    def __init__(self, hass: HomeAssistant, host: str, api_key: str, site: str, verify_ssl: bool):
        self._hass = hass
        self.host = (host or "").strip().rstrip("/")
        self.api_key = (api_key or "").strip()
        self.site = site or DEFAULT_SITE
        self.verify_ssl = bool(verify_ssl)
        self._session = async_get_clientsession(hass, self.verify_ssl)

    def _url(self, path: str) -> str:
        return f"https://{self.host}/proxy/network/api/s/{self.site}/{path}"

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

    async def post_json(self, path: str, payload: dict) -> dict:
        url = self._url(path)
        headers = {"X-API-Key": self.api_key}
        try:
            async with self._session.post(url, headers=headers, json=payload) as resp:
                text = await resp.text()
                if resp.status != 200:
                    _LOGGER.error("HTTP %s for %s: %s", resp.status, url, text[:200])
                    return {"ok": False}
                try:
                    return await resp.json(content_type=None)
                except Exception:
                    return {"ok": True}
        except Exception as e:
            _LOGGER.error("POST failed: %s", e)
            return {"ok": False}

    async def get_devices(self) -> dict:
        return await self.get_json("stat/device")

    async def get_device(self, mac: str) -> dict:
        return await self.get_json(f"stat/device/{mac}")

    async def run_speedtest(self, mac: str, wan_number: int | None = None) -> dict:
        payload: dict = {"cmd": "speedtest", "mac": mac}
        if wan_number is not None:
            # UniFi API uses "wan" for WAN1 and "wan{n}" for WAN2+
            payload["interface"] = "wan" if wan_number == 1 else f"wan{wan_number}"
        return await self.post_json("cmd/devmgr", payload)


def _log_raw_payload(gateway: dict[str, Any] | None, devices: list[dict]) -> None:
    """Emit a debug log that surfaces the gateway fields relevant to the
    IPv6 / speedtest_interface sensors so users can see what the controller
    is actually returning. Enable with:
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
    _LOGGER.debug(
        "UniFi raw gateway debug: uplink_keys=%s uplink.ip=%s uplink.ip6=%s "
        "uplink.speedtest_interface=%s wan_blocks=%s last_wan_interfaces=%s",
        sorted(uplink.keys()),
        uplink.get("ip"),
        uplink.get("ip6"),
        uplink.get("speedtest_interface"),
        wan_dump,
        gateway.get("last_wan_interfaces"),
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
    if a.startswith("fe8") or a.startswith("fe9") or a.startswith("fea") or a.startswith("feb"):
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
    )


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


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    data = entry.data
    options = entry.options or {}

    host = options.get(CONF_HOST, data.get(CONF_HOST))
    api_key = options.get(CONF_API_KEY, data.get(CONF_API_KEY))
    site = options.get(CONF_SITE, data.get(CONF_SITE, DEFAULT_SITE))
    verify_ssl = options.get(CONF_VERIFY_SSL, data.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL))

    scan_seconds = int(options.get(CONF_SCAN_INTERVAL, options.get(LEGACY_CONF_DEVICE_INTERVAL, DEFAULT_SCAN_INTERVAL)))
    rate_seconds = int(options.get(CONF_RATE_INTERVAL, DEFAULT_RATE_INTERVAL))

    auto_minutes = int(options.get(CONF_AUTO_SPEEDTEST_MINUTES, data.get(CONF_AUTO_SPEEDTEST_MINUTES, DEFAULT_AUTO_SPEEDTEST_MINUTES)))
    auto_enabled = bool(options.get(CONF_AUTO_SPEEDTEST, data.get(CONF_AUTO_SPEEDTEST, DEFAULT_AUTO_SPEEDTEST)))

    await _async_migrate_registry(hass, entry, host, site)

    client = UnifiWanClient(hass, host, api_key, site, verify_ssl)

    async def _update_devices() -> UniFiWanData:
        """Fetch and process data."""
        raw = await client.get_devices()
        return _extract_wan_data(raw)

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
    speedtest_running: bool = False
    unsub_auto: CALLBACK_TYPE | None = None

    def _dispatch_running():
        async_dispatcher_send(hass, entry_signal)

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
        if speedtest_running:
            _LOGGER.debug("Speedtest already in progress; ignoring trigger")
            return

        await set_speedtest_running(True)
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

            last_run_before = gw_data.uplink.get("speedtest_lastrun")
            await client.run_speedtest(mac_local, wan_number)

            # Poll until the controller reports a new result or we time out.
            deadline = hass.loop.time() + SPEEDTEST_TIMEOUT_SECONDS
            while hass.loop.time() < deadline:
                await asyncio.sleep(SPEEDTEST_POLL_SECONDS)
                await device_coordinator.async_request_refresh()
                gw_data = device_coordinator.data
                last_run = gw_data.uplink.get("speedtest_lastrun") if gw_data else None
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
            if rates_coordinator:
                await rates_coordinator.async_request_refresh()
            await set_speedtest_running(False)

    async def _auto_speedtest_callback(_now) -> None:
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

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {
        "client": client,
        "device_coordinator": device_coordinator,
        "rates_coordinator": rates_coordinator,
        "host": host,
        "site": site,
        "dev_meta": dev_meta,
        "device_info": device_info,
        "auto_enabled": auto_enabled,
        "manage_auto": _schedule_auto,
        "run_speedtest_now": _run_speedtest_now,
        "speedtest_running_signal": entry_signal,
        "get_speedtest_running": lambda: speedtest_running,
        "set_speedtest_running": set_speedtest_running,
        "wan_numbers": wan_numbers,
    }

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    # Register the service once for the whole domain; the handler looks up
    # the currently loaded entries each call so it works with multiple
    # gateways and survives individual entries being unloaded.
    if not hass.services.has_service(DOMAIN, SERVICE_RUN_SPEEDTEST):
        async def handle_run_speedtest(call: ServiceCall) -> None:
            wan_number = call.data.get(ATTR_WAN)
            for shared_data in list(hass.data.get(DOMAIN, {}).values()):
                hass.async_create_task(shared_data["run_speedtest_now"](wan_number))

        hass.services.async_register(
            DOMAIN,
            SERVICE_RUN_SPEEDTEST,
            handle_run_speedtest,
            schema=SERVICE_RUN_SPEEDTEST_SCHEMA,
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    shared = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if shared:
        shared["manage_auto"](False)

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)

    if not hass.data.get(DOMAIN) and hass.services.has_service(DOMAIN, SERVICE_RUN_SPEEDTEST):
        hass.services.async_remove(DOMAIN, SERVICE_RUN_SPEEDTEST)

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)
