"""Sensor platform for Synology Pro — dynamic discovery."""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    PERCENTAGE,
    UnitOfInformation,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL, DOMAIN, is_entity_enabled_default

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
            "get_user_list",
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
            "login_activity",
            "scan_config",
            "security_scan",
        ],
    },
    "core_user": {
        "class": "User",
        "methods": [
            "get_users",
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
    "oauth": {
        "class": "OAuth",
        "methods": [
            "logs",
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
            "openvpn_export_configuration",
        ],
    },
}


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
        """Probe all configured API methods and return flattened results."""
        return await self.hass.async_add_executor_job(self._sync_probe)

    def _sync_probe(self) -> dict:
        """Synchronous probe of all API methods."""
        config = self.config
        data: dict[str, Any] = {}
        sensors: dict[str, Any] = {}  # Flattened sensor values with metadata

        for module_name, cfg in API_DISCOVERY.items():
            class_name = cfg["class"]
            methods = cfg["methods"]

            # Try to import and instantiate the API class
            try:
                mod = __import__(f"synology_api.{module_name}", fromlist=[class_name])
                api_cls = getattr(mod, class_name)
                api = api_cls(
                    config["host"], config["port"],
                    config["username"], config["password"],
                    secure=config.get("use_ssl", True),
                    cert_verify=config.get("verify_ssl", False),
                    dsm_version=config.get("dsm_version", 7),
                )
            except Exception as e:
                _LOGGER.debug("Module %s unavailable: %s", module_name, e)
                continue

            # Probe each method
            for method_name in methods:
                try:
                    fn = getattr(api, method_name, None)
                    if fn is None:
                        continue

                    # Check if method requires arguments
                    import inspect
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

                    # Handle different response shapes
                    if isinstance(result, dict):
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

        data["sensors"] = sensors
        return data


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities
) -> None:
    """Set up Synology Pro sensors dynamically."""
    config = entry.data
    scan_interval = config.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)

    coordinator = SynologyDynamicCoordinator(hass, config, scan_interval)
    await coordinator.async_config_entry_first_refresh()

    # Store coordinator for other platforms
    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Create a sensor for every discovered value
    entities = []
    discovered = coordinator.data.get("sensors", {})

    for sensor_key, meta in discovered.items():
        value = meta["value"]
        val_type = meta["type"]

        # Determine sensor characteristics
        device_class = None
        state_class = None
        unit = None
        icon = "mdi:nas"

        if val_type in ("int", "float"):
            state_class = SensorStateClass.MEASUREMENT
            key_lower = sensor_key.lower()
            if "temp" in key_lower or "temperature" in key_lower:
                device_class = SensorDeviceClass.TEMPERATURE
                unit = UnitOfTemperature.CELSIUS
                icon = "mdi:thermometer"
            elif "ram" in key_lower or "memory" in key_lower:
                unit = UnitOfInformation.MEGABYTES
                icon = "mdi:memory"
            elif "percent" in key_lower or "usage" in key_lower or "load" in key_lower:
                unit = PERCENTAGE
                icon = "mdi:gauge"
            elif "speed" in key_lower or "fan" in key_lower:
                icon = "mdi:fan"
            elif "uptime" in key_lower:
                icon = "mdi:timer-outline"
            elif "disk" in key_lower:
                icon = "mdi:harddisk"

        enabled_default = is_entity_enabled_default(sensor_key)

        entities.append(
            SynologyDynamicSensor(
                coordinator, sensor_key, sensor_key, unit, device_class, state_class, icon,
                enabled_default=enabled_default,
            )
        )

    _LOGGER.info("Synology Pro: discovered %d sensors", len(entities))
    async_add_entities(entities)

    # ── Explicit one-time disable of secondary entities ──
    # Does NOT rely on _attr_entity_registry_enabled_default (which
    # behaves inconsistently across HA versions). Directly updates
    # the entity registry. Runs once per config entry, never on restart.
    if not entry.data.get("_entities_setup_v3"):
        async def _post_setup_disable() -> None:
            """Background task: disable non-primary entities."""
            try:
                import asyncio
                await asyncio.sleep(1.5)
            except asyncio.CancelledError:
                return
            from homeassistant.helpers import entity_registry as er
            reg = er.async_get(hass)
            if not reg:
                return
            disabled = 0
            for entity in entities:
                if entity._enabled_default:
                    continue
                entity_id = reg.async_get_entity_id(
                    "sensor", DOMAIN, entity._attr_unique_id
                )
                if entity_id:
                    entry_data = reg.async_get(entity_id)
                    if entry_data and entry_data.disabled_by is None:
                        reg.async_update_entity(
                            entity_id, disabled_by="integration"
                        )
                        disabled += 1
            if disabled:
                _LOGGER.info(
                    "Synology Pro: post-setup disabled %d secondary entities",
                    disabled,
                )

        hass.async_create_task(_post_setup_disable())
        new_data = dict(entry.data)
        new_data["_entities_setup_v3"] = True
        hass.config_entries.async_update_entry(entry, data=new_data)


class SynologyDynamicSensor(SensorEntity):
    """A sensor dynamically created from NAS API data."""

    def __init__(
        self,
        coordinator: SynologyDynamicCoordinator,
        sensor_key: str,
        name: str,
        unit: str | None = None,
        device_class: SensorDeviceClass | None = None,
        state_class: SensorStateClass | None = None,
        icon: str | None = None,
        enabled_default: bool = True,
    ):
        """Initialize."""
        self.coordinator = coordinator
        self._sensor_key = sensor_key
        self._enabled_default = enabled_default
        # Standard HA pattern for entity_registry_enabled_default
        self._attr_entity_registry_enabled_default = enabled_default
        # Human-readable name from key
        self._attr_name = sensor_key.replace(".", " ").replace("_", " ").title()
        self._attr_unique_id = f"{DOMAIN}_{sensor_key.replace('.', '_')}"
        self._attr_native_unit_of_measurement = unit
        self._attr_device_class = device_class
        self._attr_state_class = state_class
        if icon:
            self._attr_icon = icon

        self._attr_device_info = {
            "identifiers": {(DOMAIN, coordinator.config["host"])},
            "name": f"Synology NAS ({coordinator.config['host']})",
            "manufacturer": "Synology",
        }

    @property
    def available(self) -> bool:
        """Return if sensor is available."""
        return self.coordinator.last_update_success

    @property
    def native_value(self):
        """Return the sensor value."""
        sensors = self.coordinator.data.get("sensors", {})
        entry = sensors.get(self._sensor_key, {})
        return entry.get("value")

    async def async_update(self) -> None:
        """Update the entity."""
        await self.coordinator.async_request_refresh()
