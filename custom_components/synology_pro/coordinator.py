"""Data coordinator for Synology Pro."""
from __future__ import annotations

import inspect
import logging
from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# ── API Discovery Map ──────────────────────────────────────────
# Maps synology-api modules to methods to probe.
# When synology-api adds new modules/methods, add them here.
API_DISCOVERY = {
    "core_sys_info": {
        "class": "SysInfo",
        "methods": [
            "dsm_info",
            "disk_list",
            "get_volume_info",
            "get_cpu_utilization",
            "get_memory_utilization",
            "get_network_info",
            "hardware_fan_speed",
            "get_cpu_temp",
            "sys_status",
            "web_status",
            "shared_folders_info",
            "storage",
            "get_all_system_utilization",
            "get_system_health",
            "get_system_info",
            "services_status",
            "active_notifications",
            "current_connection",
            "firewall_info",
            "network_status",
            "quickconnect_info",
            "snmp_info",
            "terminal_info",
            "bandwidth_control_status",
            "file_transfer_status",
            "ftp_security_info",
            "bonjour_service_info",
            "cms_info",
            "ddns_external_ip",
            "gateway_list",
            "get_security_scan_info",
            "get_security_scan_rules",
            "get_security_scan_status",
            "ldap_info",
            "proxy_info",
            "resource_monitor_settings_list",
            "sso_info",
            "upgrade_status",
        ],
    },
    "docker_api": {
        "class": "Docker",
        "methods": [
            "containers",
            "docker_stats",
            "system_resources",
            "container_resources",
            "downloaded_images",
            "images_registry_resources",
            "network",
        ],
    },
    "downloadstation": {
        "class": "DownloadStation",
        "methods": [
            "tasks_list",
            "get_info",
        ],
    },
    "filestation": {
        "class": "FileStation",
        "methods": [
            "get_info",
        ],
    },
    "security_advisor": {
        "class": "SecurityAdvisor",
        "methods": [
            "advisor_config",
            "checklist",
            "general_info",
            "scan_config",
            "security_scan",
        ],
    },
    "core_share": {
        "class": "Share",
        "methods": [
            "list_folders",
        ],
    },
    "core_backup": {
        "class": "Backup",
        "methods": [
            "backup_task_list",
            "backup_repository_list",
        ],
    },
    "core_certificate": {
        "class": "Certificate",
        "methods": [
            "list_cert",
        ],
    },
    "log_center": {
        "class": "LogCenter",
        "methods": [
            "history",
            "display_logs",
        ],
    },
    "snapshot": {
        "class": "Snapshot",
        "methods": [
            "list_snapshots",
        ],
    },
    "photos": {
        "class": "Photos",
        "methods": [
            "list_albums",
        ],
    },
    "surveillancestation": {
        "class": "SurveillanceStation",
        "methods": [
            "alarm_event_enum",
        ],
    },
    "core_active_backup": {
        "class": "ActiveBackupBusiness",
        "methods": [
            "list_tasks",
        ],
    },
    "audiostation": {
        "class": "AudioStation",
        "methods": [
            "get_info",
            "get_playlist_info",
            "list_pinned_song",
        ],
    },
    "cloud_sync": {
        "class": "CloudSync",
        "methods": [
            "get_connection_information",
            "get_connection_logs",
        ],
    },
    "core_group": {
        "class": "Group",
        "methods": [
            "get_groups",
            "get_permissions",
            "get_quota",
            "get_speed_limits",
        ],
    },
    "core_package": {
        "class": "Package",
        "methods": [
            "get_package_center_infos",
        ],
    },
    "dhcp_server": {
        "class": "DhcpServer",
        "methods": [
            "general_info",
        ],
    },
    "directory_server": {
        "class": "DirectoryServer",
        "methods": [
            "get_directory_info",
            "get_task_status",
        ],
    },
    "drive_admin_console": {
        "class": "AdminConsole",
        "methods": [
            "config_info",
            "active_connections",
        ],
    },
    "notestation": {
        "class": "NoteStation",
        "methods": [
            "info",
            "notebooks_info",
            "settings_info",
        ],
    },
    "usb_copy": {
        "class": "USBCopy",
        "methods": [
            "get_package_settings",
            "get_package_logs",
            "get_task_settings",
        ],
    },
    "virtualization": {
        "class": "Virtualization",
        "methods": [
            "get_host_operation",
            "get_images_list",
            "get_network_group_list",
        ],
    },
    "vpn": {
        "class": "VPN",
        "methods": [
            "l2tp_settings_info",
            "log_list",
        ],
    },
}


def _extract_containers(result: dict) -> list:
    """Normalize docker_api.containers() output into a list of container dicts.

    containers() returns {"data": {"containers": [...], "limit":.., "offset":..,
    "total":..}, "success": true}. Each entry is docker-inspect style with
    lowercase keys: id, name, status, and a State dict with a Running bool.
    """
    raw = result.get("data", {}) if isinstance(result, dict) else {}
    raw_list = raw.get("containers", []) if isinstance(raw, dict) else []
    containers = []
    if isinstance(raw_list, list):
        for c in raw_list:
            if not isinstance(c, dict):
                continue
            cid = c.get("id") or ""
            name = c.get("name") or cid
            state = c.get("State") if isinstance(c.get("State"), dict) else {}
            running = bool(state.get("Running")) or str(c.get("status", "")).lower() == "running"
            containers.append({
                "id": cid,
                "name": name,
                "status": c.get("status", ""),
                "running": running,
            })
    return containers


def _flatten_dict(d: dict, prefix: str = "") -> dict[str, Any]:
    """Flatten a nested dict into dot-notation keys, filtering out complex values."""
    result = {}
    for key, value in d.items():
        if key in ("success",):
            continue
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            result.update(_flatten_dict(value, full_key))
        elif isinstance(value, list):
            if not value:
                result[full_key] = 0  # empty list → 0
            elif isinstance(value[0], dict):
                # List of dicts: store count + first item's keys as summary
                result[f"{full_key}.count"] = len(value)
                first = value[0]
                for sub_k, sub_v in first.items():
                    if isinstance(sub_v, (int, float, str, bool)):
                        result[f"{full_key}.0.{sub_k}"] = sub_v
            elif isinstance(value[0], (int, float, str)):
                result[full_key] = ", ".join(str(v) for v in value[:10])
        elif isinstance(value, bool):
            result[full_key] = value
        elif isinstance(value, (int, float, str)):
            result[full_key] = value
    return result


class SynologyDynamicCoordinator(DataUpdateCoordinator):
    """Coordinator that dynamically probes all available NAS APIs."""

    def __init__(self, hass: HomeAssistant, config: dict, scan_interval: int):
        """Initialize."""
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_coordinator",
            update_interval=timedelta(seconds=scan_interval),
        )
        self.config = config

    async def _async_update_data(self) -> dict:
        """Probe all configured API methods (blocking, runs in HA's executor)."""
        return await self.hass.async_add_executor_job(self._sync_probe)

    def _sync_probe(self) -> dict:
        """Synchronous probe of all modules.

        Deliberately sequential: parallel logins trip the NAS session limit
        (DS218+) and cause partial failures. Each module's blocking login+probe
        runs inside HA's executor thread, so the event loop is never blocked.
        """
        data: dict[str, Any] = {}
        sensors: dict[str, Any] = {}

        for module_name, cfg in API_DISCOVERY.items():
            mod_sensors, containers = self._probe_module(module_name, cfg)
            sensors.update(mod_sensors)
            if containers is not None:
                data["containers"] = containers

        data["sensors"] = sensors
        return data

    def _probe_module(self, module_name: str, cfg: dict):
        """Probe a single module (blocking); return (sensors, containers_or_None)."""
        config = self.config
        class_name = cfg["class"]
        methods = cfg["methods"]
        sensors: dict[str, Any] = {}
        containers = None

        try:
            mod = __import__(f"synology_api.{module_name}", fromlist=[class_name])
            api_cls = getattr(mod, class_name)
            api = api_cls(
                config["host"], config["port"],
                config["username"], config["password"],
                secure=config.get("use_ssl", True),
                cert_verify=config.get("verify_ssl", False),
                dsm_version=config.get("dsm_version", 7),
                device_id=config.get("device_id"),
            )
        except Exception as e:
            _LOGGER.debug("Module %s unavailable: %s", module_name, e)
            return sensors, containers

        for method_name in methods:
            try:
                fn = getattr(api, method_name, None)
                if fn is None:
                    continue

                sig = inspect.signature(fn)
                required = [
                    p for p in sig.parameters.values()
                    if p.default is inspect.Parameter.empty and p.name != "self"
                ]
                if required and "offset" in [p.name for p in required]:
                    result = fn(offset=0, limit=20)
                elif required:
                    result = fn()  # Will raise TypeError, caught below
                else:
                    result = fn()

                if module_name == "docker_api" and method_name == "containers":
                    containers = _extract_containers(result)
                    sensors[f"{module_name}.{method_name}.count"] = {
                        "value": len(containers),
                        "type": "int",
                    }

                elif isinstance(result, dict):
                    if "data" in result:
                        flat = _flatten_dict(result["data"], method_name)
                    elif "success" in result and len(result) > 1:
                        flat = _flatten_dict(result, method_name)
                    else:
                        continue

                    for key, value in flat.items():
                        sensor_key = f"{module_name}.{key}"
                        sensors[sensor_key] = {
                            "value": value,
                            "type": type(value).__name__,
                        }

                elif isinstance(result, list):
                    sensors[f"{module_name}.{method_name}"] = {
                        "value": len(result),
                        "type": "int",
                    }

            except Exception as e:
                _LOGGER.debug(
                    "Method %s.%s() failed: %s", module_name, method_name, e
                )

        return sensors, containers
