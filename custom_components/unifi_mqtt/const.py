"""Constants for the UniFi MQTT integration."""

DOMAIN = "unifi_mqtt"

CONF_HOST = "host"
CONF_USERNAME = "username"
CONF_PASSWORD = "password"
CONF_SITE_ID = "site_id"
CONF_PORT = "port"
CONF_VERIFY_SSL = "Verify SSL"
CONF_VERSION = "version"
CONF_UPDATE_INTERVAL = "Update interval"

VERSION_OPTIONS = [
    "UDMP-unifiOS",  # default
    "v4",
    "v5",
    "unifiOS",
]

DEFAULT_SITE_ID = "default"
DEFAULT_PORT = 443
DEFAULT_VERIFY_SSL = False
DEFAULT_VERSION = "UDMP-unifiOS"

DEFAULT_UPDATE_INTERVAL = 60  # seconds
