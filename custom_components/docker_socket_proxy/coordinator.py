"""Coordinator for Docker Socket Proxy with smart parsing."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
import logging
import re
from typing import Any
from urllib.parse import urlparse

import aiohttp

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_URL
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_CONTAINERS,
    ATTR_DEFAULT_NA,
    ATTR_DEFAULT_STANDALONE,
    ATTR_DEFAULT_STRING,
    ATTR_DOCKER_HOSTNAME,
    ATTR_VERSION,
    CONF_GRACE_PERIOD_ENABLED,
    CONF_GRACE_PERIOD_SECONDS,
    CONF_SCAN_INTERVAL,
    DEFAULT_GRACE_PERIOD_ENABLED,
    DEFAULT_GRACE_PERIOD_SECONDS,
    DEFAULT_SCAN_INTERVAL,
    HOST_STATUS_CONTAINERS_UNAVAILABLE,
    HOST_STATUS_RUNNING_TEMPLATE,
    HOST_STATUS_VERSION_UNAVAILABLE,
)

_LOGGER = logging.getLogger(__name__)


class DockerProxyCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Class to manage fetching Docker data with smart parsing and update indicators."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        self.url = entry.data[CONF_URL].rstrip("/")
        self.host_name = entry.title
        self.entry = entry
        self.last_seen: dict[str, datetime] = {}
        self.host_status = HOST_STATUS_VERSION_UNAVAILABLE

        parsed_url = urlparse(self.url)
        self.docker_hostname = parsed_url.hostname or self.url

        scan_interval = entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)

        super().__init__(
            hass,
            _LOGGER,
            name=f"Docker {entry.title}",
            update_interval=timedelta(seconds=int(scan_interval)),
        )

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data sequentially and process into safe UI strings."""
        session = async_get_clientsession(self.hass)
        current_time = dt_util.now()

        # 1. Version Check
        version_info = {}
        try:
            async with asyncio.timeout(5):
                res = await session.get(f"{self.url}/version")
                if res.status != 200:
                    self.host_status = HOST_STATUS_VERSION_UNAVAILABLE
                    return self.data or {}
                v_raw = await res.json()
                version_info = {
                    "Platform": str(
                        v_raw.get("Platform", {}).get("Name", ATTR_DEFAULT_NA)
                    ),
                    "Version": str(v_raw.get("Version", ATTR_DEFAULT_NA)),
                    "ApiVersion": str(v_raw.get("ApiVersion", ATTR_DEFAULT_NA)),
                    "Os": str(v_raw.get("Os", ATTR_DEFAULT_NA)),
                    "Arch": str(v_raw.get("Arch", ATTR_DEFAULT_NA)),
                    "KernelVersion": str(v_raw.get("KernelVersion", ATTR_DEFAULT_NA)),
                }
        except (aiohttp.ClientError, TimeoutError):
            self.host_status = HOST_STATUS_VERSION_UNAVAILABLE
            return self.data or {}

        # 2. Containers Check
        raw_containers = []
        try:
            async with asyncio.timeout(5):
                res = await session.get(f"{self.url}/containers/json?all=1")
                if res.status != 200:
                    self.host_status = HOST_STATUS_CONTAINERS_UNAVAILABLE
                    return self.data or {}
                raw_containers = await res.json()
        except (aiohttp.ClientError, TimeoutError):
            self.host_status = HOST_STATUS_CONTAINERS_UNAVAILABLE
            return self.data or {}

        # 3. Processing
        processed_containers: dict[str, Any] = {}
        running_count = 0
        host_ip = self.url.split("//")[-1].split(":")[0]

        for container in raw_containers:
            cid = container.get("Id", "")
            if not cid:
                continue

            if container.get("State") == "running":
                running_count += 1

            self.last_seen[cid] = current_time
            processed_containers[cid] = self._format_container_for_ui(
                container, host_ip
            )

        self.host_status = HOST_STATUS_RUNNING_TEMPLATE.format(
            x=running_count, y=len(raw_containers)
        )

        # 4. Grace Period / Tombstone Logic
        if self.data and ATTR_CONTAINERS in self.data:
            grace_enabled = self.entry.options.get(
                CONF_GRACE_PERIOD_ENABLED, DEFAULT_GRACE_PERIOD_ENABLED
            )
            grace_seconds = self.entry.options.get(
                CONF_GRACE_PERIOD_SECONDS, DEFAULT_GRACE_PERIOD_SECONDS
            )

            old_containers = self.data[ATTR_CONTAINERS]
            for cid, old_entry in old_containers.items():
                if cid not in processed_containers:
                    last_seen_at = self.last_seen.get(cid)

                    if grace_enabled and last_seen_at:
                        diff = (current_time - last_seen_at).total_seconds()
                        if diff <= grace_seconds:
                            remaining = int(grace_seconds - diff)
                            processed_containers[cid] = self._apply_tombstone(
                                old_entry, remaining
                            )
                            continue

                    self.last_seen.pop(cid, None)

        return {
            ATTR_CONTAINERS: processed_containers,
            ATTR_VERSION: version_info,
            ATTR_DOCKER_HOSTNAME: self.docker_hostname,
        }

    def _format_container_for_ui(self, container: dict, host_ip: str) -> dict[str, str]:
        """Convert container data into pre-formatted strings for the UI."""
        labels = container.get("Labels", {})
        status_raw = container.get("Status", "")
        ports_raw = container.get("Ports", [])

        # 1. Names & Image
        name = container.get("Names", ["/unknown"])[0].lstrip("/")
        image = container.get("Image", ATTR_DEFAULT_NA).split("@")[0]

        # 2. Smart Uptime & Health
        health = ATTR_DEFAULT_NA
        if "(" in status_raw:
            health = status_raw.split("(")[-1].replace(")", "").lower()

        # Strip "Up " and health info to get clean uptime: "Up 2 hours (healthy)" -> "2 hours"
        uptime = re.sub(r" \(.+\)", "", status_raw).replace("Up ", "").strip()

        # 3. Update Indicator (Watchtower monitor-only label)
        if "com.centurylinklabs.watchtower.monitor-only" not in labels:
            update_available = ATTR_DEFAULT_NA
        else:
            update_available = (
                "yes"
                if labels.get("com.centurylinklabs.watchtower.monitor-only") == "true"
                else "no"
            )

        # 4. Service URLs & Display Name
        display_name = name
        service_urls_list = []
        port_bindings = {
            str(p.get("PrivatePort")): p.get("IP", "0.0.0.0") for p in ports_raw
        }

        if "ha.web_port" in labels:
            for entry in labels["ha.web_port"].split(","):
                parts = entry.strip().split(":")
                p_num = parts[0]
                proto = parts[1] if len(parts) > 1 else "http"
                target = (
                    host_ip if port_bindings.get(p_num) != "127.0.0.1" else "127.0.0.1"
                )
                url = f"{proto}://{target}:{p_num}"
                service_urls_list.append(url)

            if service_urls_list:
                display_name = (
                    f"<a href='{service_urls_list[0]}' target='_blank' "
                    f"style='color:var(--primary-color);text-decoration:none;font-weight:bold;'>"
                    f"{name}</a>"
                )

        # 5. Ports (HTML pre-formatted)
        ports_raw = container.get("Ports", [])
        seen_ports = set()
        port_list = []
        for p in ports_raw:
            pub = p.get("PublicPort")
            priv = p.get("PrivatePort")
            proto = p.get("Type")  # tcp or udp
            if pub:
                port_key = f"{pub}:{priv}/{proto}"
                if port_key not in seen_ports:
                    port_list.append(f"{pub}:{priv}")
                    seen_ports.add(port_key)

        # 6. Network & Creation
        nets = container.get("NetworkSettings", {}).get("Networks", {})

        ip_address = ""
        mac_address = ""
        net_names = []

        if not nets:
            network_display = "no network"
            mac_address = ATTR_DEFAULT_NA
        else:
            for net_name, net_info in nets.items():
                net_names.append(net_name)
                current_ip = net_info.get("IPAddress") or net_info.get(
                    "GlobalIPv6Address"
                )
                if current_ip and not ip_address:
                    ip_address = current_ip
                current_mac = net_info.get("MacAddress")
                if current_mac and not mac_address:
                    mac_address = current_mac

            primary_net = net_names[0]
            if primary_net == "host":
                network_display = f"{host_ip} (host)"
                mac_address = "Host Shared"
            elif primary_net == "none":
                network_display = "Isolated (none)"
                mac_address = "None"
            elif not ip_address:
                network_display = f"No IP ({primary_net})"
            else:
                network_display = f"{ip_address} ({primary_net})"

        created_ts = container.get("Created", 0)
        created_str = (
            dt_util.as_local(datetime.fromtimestamp(created_ts)).strftime(
                "%Y-%m-%d %H:%M"
            )
            if created_ts
            else ATTR_DEFAULT_NA
        )

        return {
            "Names": str(name),
            "DisplayName": str(display_name),
            "Image": str(image),
            "State": str(container.get("State", ATTR_DEFAULT_NA)),
            "Uptime": str(uptime or ATTR_DEFAULT_STRING),
            "Health": str(health),
            "UpdateAvailable": update_available,
            "Project": str(
                labels.get("com.docker.compose.project", ATTR_DEFAULT_STANDALONE)
            ),
            "ServiceUrls": ", ".join(service_urls_list)
            if service_urls_list
            else ATTR_DEFAULT_STRING,
            "Created": str(created_str),
            "Ports": "<br>".join(port_list) if port_list else ATTR_DEFAULT_STRING,
            "NetworkSettings": str(network_display),
            "MacAddress": str(mac_address or ATTR_DEFAULT_NA),
        }

    def _apply_tombstone(self, old: dict, remaining: int) -> dict[str, Any]:
        return {
            "Names": old.get("Names", ATTR_DEFAULT_NA),
            "DisplayName": old.get("DisplayName", ATTR_DEFAULT_NA),
            "Image": old.get("Image", ATTR_DEFAULT_NA),
            "Project": old.get("Project", ATTR_DEFAULT_NA),
            "State": "removed",
            "Uptime": f"Removed ({remaining}s)",
            "UpdateAvailable": "no",
            "ServiceUrls": old.get("ServiceUrls", ATTR_DEFAULT_STRING),
            "Created": old.get("Created", ATTR_DEFAULT_NA),
            "Ports": ATTR_DEFAULT_STRING,
            "NetworkSettings": ATTR_DEFAULT_STRING,
            "MacAddress": ATTR_DEFAULT_STRING,
        }
