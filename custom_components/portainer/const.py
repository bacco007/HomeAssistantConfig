"""Constants used by the Portainer integration."""
from homeassistant.const import Platform

PLATFORMS = [
    Platform.SENSOR,
]

DOMAIN = "portainer"
DEFAULT_NAME = "root"
ATTRIBUTION = "Data provided by Portainer integration"

SCAN_INTERVAL = 30

DEFAULT_HOST = "10.0.0.1"

DEFAULT_DEVICE_NAME = "Portainer"
DEFAULT_SSL = False
DEFAULT_SSL_VERIFY = True

TO_REDACT = {
    "password",
}
