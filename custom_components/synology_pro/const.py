"""Constants for the Synology Pro integration."""
from __future__ import annotations

DOMAIN = "synology_pro"

# Platforms
PLATFORMS = ["sensor", "binary_sensor", "switch"]

# Configuration keys
CONF_HOST = "host"
CONF_PORT = "port"
CONF_USERNAME = "username"
CONF_PASSWORD = "password"
CONF_SSL = "use_ssl"
CONF_VERIFY_SSL = "verify_ssl"
CONF_DSM_VERSION = "dsm_version"
CONF_SCAN_INTERVAL = "scan_interval"

# Defaults
DEFAULT_PORT = 5001
DEFAULT_SSL = True
DEFAULT_VERIFY_SSL = False
DEFAULT_DSM_VERSION = 7
DEFAULT_SCAN_INTERVAL = 60

# Service names
SERVICE_CREATE_SNAPSHOT = "create_snapshot"
SERVICE_DELETE_SNAPSHOT = "delete_snapshot"
SERVICE_RESTART_CONTAINER = "restart_container"
SERVICE_UPDATE_CONTAINER = "update_container"
SERVICE_RUN_SECURITY_SCAN = "run_security_scan"

# Service attributes
ATTR_SHARE = "share"
ATTR_DESCRIPTION = "description"
ATTR_SNAPSHOT_NAME = "snapshot_name"
ATTR_CONTAINER_ID = "container_id"

# ── Entity priority: only these key prefixes start enabled ──────────
# Every other sensor starts DISABLED and appears under
# "Entità disattive" on the device page — user enables manually.
# Use prefix matching: any key starting with these strings is enabled.
PRIMARY_PREFIXES: list[str] = [
    # ── System overview ──
    "core_sys_info.dsm_info.model",
    "core_sys_info.dsm_info.serial",
    "core_sys_info.dsm_info.version",
    "core_sys_info.dsm_info.temperature",
    "core_sys_info.dsm_info.ram",
    "core_sys_info.dsm_info.uptime",
    # ── Performance ──
    "core_sys_info.get_cpu_utilization",
    "core_sys_info.get_memory_utilization",
    # ── Health & status ──
    "core_sys_info.get_system_health",
    "core_sys_info.sys_status",
    "core_sys_info.upgrade_status",
    # ── Security ──
    "security_advisor.general_info",
    # ── Docker summary ──
    "docker_api.containers.count",
    # ── Download Station ──
    "downloadstation.tasks_list.count",
    # ── File Station ──
    "filestation.get_info",
]


def is_entity_enabled_default(sensor_key: str) -> bool:
    """Only a curated set of ~20 sensors start active.
    
    Uses prefix matching against PRIMARY_PREFIXES.
    Everything else starts disabled → user enables from device page.
    """
    return any(sensor_key.startswith(prefix) for prefix in PRIMARY_PREFIXES)
