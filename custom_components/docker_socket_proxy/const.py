"""Custom integration to integrate Docker Socket Proxy with Home Assistant.

For more details about this integration, please refer to
https://github.com/s-t-e-f-a-n/ha_docker_socket_proxy

Constants for the Docker Socket Proxy integration.
"""

from typing import Final

# Domain
DOMAIN: Final = "docker_socket_proxy"

# Platforms
PLATFORMS: Final = ["sensor"]

# Defaults
DEFAULT_NAME: Final = "Docker Host"
DEFAULT_URL: Final = "http://192.168.1.100:2375"
DEFAULT_SCAN_INTERVAL: Final = 30  # in seconds
DEFAULT_GRACE_PERIOD_SECONDS: Final = 604800  # 7 days in seconds
DEFAULT_GRACE_PERIOD_ENABLED: Final = True

# User Configuration Keys
CONF_SCAN_INTERVAL: Final = "scan_interval"
CONF_GRACE_PERIOD_ENABLED: Final = "grace_period_enabled"
CONF_GRACE_PERIOD_SECONDS: Final = "grace_period_seconds"

# Host Status states (The logic we defined for the host_status entity)
HOST_STATUS_VERSION_UNAVAILABLE: Final = "unavailable version"
HOST_STATUS_CONTAINERS_UNAVAILABLE: Final = "unavailable containers"
HOST_STATUS_RUNNING_TEMPLATE: Final = "{x}/{y} running"

# UI / Safe-String Fallbacks
# These ensure that Lovelace never sees 'None' or 'undefined'
ATTR_DEFAULT_STRING: Final = "-"
ATTR_DEFAULT_NA: Final = "n/a"
ATTR_DEFAULT_STANDALONE: Final = "Standalone"

# Coordinator Keys from Docker API
ATTR_CONTAINERS: Final = "containers"
ATTR_VERSION: Final = "version"
ATTR_DOCKER_HOSTNAME: Final = "docker_hostname"

# Entity IDs or Unique ID suffixes
ENTITY_ID_HOST_STATUS: Final = "host_status"

# Constant for the blueprint filename to ensure consistency
BLUEPRINT_FILENAME: Final = "docker_proxy_health_alert.yaml"
