"""Constants for foldingathomecontrol."""
import logging

# Base component constants
DOMAIN = "foldingathomecontrol"
DOMAIN_DATA = f"{DOMAIN}_data"
VERSION = "0.1.0"
PLATFORMS = ["binary_sensor", "sensor"]
DATA_UPDATED = f"{DOMAIN}_data_updated"
SENSOR_ADDED = f"{DOMAIN}_sensor_added"
SENSOR_REMOVED = f"{DOMAIN}_sensor_removed"

# Logger
_LOGGER = logging.getLogger(__package__)

# Icons
ICON = "mdi:state-machine"

# Device classes
BINARY_SENSOR_DEVICE_CLASS = "connectivity"

# Configuration
CONF_ADDRESS = "address"
CONF_PORT = "port"
CONF_PASSWORD = "password"
