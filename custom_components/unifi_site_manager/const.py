"""Constants for the UniFi Site Manager integration."""
from __future__ import annotations

from datetime import timedelta
from typing import Final

DOMAIN: Final = "unifi_site_manager"
MANUFACTURER: Final = "Ubiquiti Inc."
DEFAULT_API_HOST: Final = "https://api.ui.com"
DEFAULT_SCAN_INTERVAL: Final = timedelta(minutes=1)

# API configurations
DEFAULT_REQUEST_TIMEOUT: Final = 10
DEFAULT_RATE_LIMIT: Final = 100
MIN_SCAN_INTERVAL: Final = 30  # seconds
MAX_SCAN_INTERVAL: Final = 3600  # 1 hour

API_RETRIES: Final = 3
API_RETRY_DELAY: Final = 1.0  # seconds

# Entry Config
CONF_API_KEY: Final = "api_key"
CONF_SITE_ID: Final = "site_id"

# Device Classes
DEVICE_CLASS_CLIENTS: Final = "clients"
DEVICE_CLASS_GATEWAY: Final = "gateway"
DEVICE_CLASS_NETWORK: Final = "network"
DEVICE_CLASS_PROTECT: Final = "protect"

# API Headers
UNIFI_API_HEADERS: Final = {
    "Accept": "application/json",
    "Content-Type": "application/json",
}

# Device Attributes
ATTR_MAC_ADDRESS: Final = "mac_address"
ATTR_IP_ADDRESS: Final = "ip_address"
ATTR_HOSTNAME: Final = "hostname"
ATTR_FIRMWARE_VERSION: Final = "firmware_version"
ATTR_MODEL: Final = "model"
ATTR_SERIAL_NUMBER: Final = "serial_number"
ATTR_LAST_SEEN: Final = "last_seen"
ATTR_IS_ONLINE: Final = "is_online"
ATTR_SITE_ID: Final = "site_id"
ATTR_SITE_NAME: Final = "site_name"
ATTR_HOST_ID: Final = "host_id"
ATTR_TYPE: Final = "type"
ATTR_RELEASE_CHANNEL: Final = "release_channel"
DEVICE_ATTR_UPTIME = "uptime"
DEVICE_ATTR_ADOPTION_TIME = "adoption_time"
DEVICE_ATTR_STARTUP_TIME = "startup_time"
ATTR_LAST_UPDATED: Final = "last_updated"
ATTR_API_VERSION: Final = "api_version"

# ISP Metrics
ATTR_ISP_NAME: Final = "isp_name"
ATTR_ISP_ORGANIZATION: Final = "isp_organization"
ATTR_DOWNLOAD_SPEED: Final = "download_speed"
ATTR_UPLOAD_SPEED: Final = "upload_speed"
ATTR_LATENCY_AVG: Final = "latency_avg"
ATTR_LATENCY_MAX: Final = "latency_max"
ATTR_PACKET_LOSS: Final = "packet_loss"
ATTR_UPTIME: Final = "uptime"

# Site Statistics
ATTR_TOTAL_DEVICES: Final = "total_devices"
ATTR_OFFLINE_DEVICES: Final = "offline_devices"
ATTR_WIFI_CLIENTS: Final = "wifi_clients"
ATTR_WIRED_CLIENTS: Final = "wired_clients"
ATTR_GUEST_CLIENTS: Final = "guest_clients"
ATTR_TX_RETRY: Final = "tx_retry"
ATTR_IPS_RULES: Final = "ips_rules"

# Controller Types
CONTROLLER_TYPE_NETWORK: Final = "network"
CONTROLLER_TYPE_PROTECT: Final = "protect"
CONTROLLER_TYPE_ACCESS: Final = "access"
CONTROLLER_TYPE_TALK: Final = "talk"
CONTROLLER_TYPE_CONNECT: Final = "connect"
CONTROLLER_TYPE_INNERSPACE: Final = "innerspace"

# Controller States
CONTROLLER_STATE_ACTIVE: Final = "active"
CONTROLLER_STATE_INACTIVE: Final = "inactive"

# Error Messages
ERROR_AUTH_INVALID: Final = "invalid_auth"
ERROR_CANNOT_CONNECT: Final = "cannot_connect"
ERROR_UNKNOWN: Final = "unknown"
ERROR_TIMEOUT: Final = "timeout"
ERROR_RATE_LIMIT: Final = "rate_limit"
ERROR_SERVER: Final = "server_error"
ERROR_INVALID_RESPONSE: Final = "invalid_response"

# Service Names
SERVICE_REFRESH: Final = "refresh"

# Entity Categories
ENTITY_CATEGORY_CONFIG: Final = "config"
ENTITY_CATEGORY_DIAGNOSTIC: Final = "diagnostic"
ENTITY_CATEGORY_SYSTEM: Final = "system"

# Icons
ICON_GATEWAY: Final = "mdi:router-wireless"
ICON_NETWORK: Final = "mdi:network"
ICON_CLIENTS: Final = "mdi:account-group"
ICON_PROTECT: Final = "mdi:camera"
ICON_SPEED_TEST: Final = "mdi:speedometer"
ICON_LATENCY: Final = "mdi:timer-outline"
ICON_PACKET_LOSS: Final = "mdi:connection"
ICON_UPTIME: Final = "mdi:clock-outline"
ICON_WIFI_CLIENTS = "mdi:wifi-marker"
ICON_WIRED_CLIENTS = "mdi:ethernet"
ICON_GUEST_CLIENTS = "mdi:account-group"
ICON_IPS = "mdi:shield"
ICON_TX_RETRY = "mdi:wifi-sync"
ICON_DEVICE = "mdi:devices"
ICON_ADOPTION = "mdi:account-clock"
ICON_STARTUP = "mdi:clock-start"

# Metric Types
METRIC_TYPE_5M: Final = "5m"
METRIC_TYPE_1H: Final = "1h"

# State Classes
STATE_CLASS_MEASUREMENT: Final = "measurement"
STATE_CLASS_TOTAL: Final = "total"
STATE_CLASS_TOTAL_INCREASING: Final = "total_increasing"

# Update Intervals
SCAN_INTERVAL_FAST: Final = timedelta(seconds=30)
SCAN_INTERVAL_NORMAL: Final = timedelta(minutes=1)
SCAN_INTERVAL_SLOW: Final = timedelta(minutes=5)
SCAN_INTERVAL_METRICS: Final = timedelta(minutes=5)

# Unit Conversions
KBPS_TO_MBPS: Final = 1000  # Convert Kbps to Mbps
MS_TO_S: Final = 1000  # Convert milliseconds to seconds

# Sensor Units
UNIT_BYTES_PER_SEC: Final = "B/s"
UNIT_KBPS: Final = "kbps"
UNIT_MBPS: Final = "Mbps"
UNIT_MS: Final = "ms"
UNIT_PERCENTAGE: Final = "%"

# Configuration
CONF_SCAN_INTERVAL = "scan_interval"
CONF_CACHE_TTL = "cache_ttl"
CONF_METRICS_INTERVAL = "metrics_interval"

# Defaults
DEFAULT_SCAN_INTERVAL = 60  # seconds
DEFAULT_CACHE_TTL = 300  # seconds
DEFAULT_METRICS_INTERVAL = 300  # seconds

# Services
SERVICE_REFRESH = "refresh"
SERVICE_CLEAR_CACHE = "clear_cache"
SERVICE_RESET_ERRORS = "reset_errors"
SERVICE_UPDATE_SITE = "update_site"
SERVICE_REBOOT_DEVICE = "reboot_device"