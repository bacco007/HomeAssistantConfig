"""Constants for the Daily Sensor integration."""

DOMAIN = "daily"
NAME = "Daily Sensor"
DOMAIN_DATA = f"{DOMAIN}_data"
VERSION = "v2024.10.1"
COORDINATOR = "coordinator"
ISSUE_URL = "https://github.com/jeroenterheerdt/HADailySensor/issues"

# Icons
ICON = "mdi:timetable"

# Platforms
SENSOR = "sensor"
PLATFORMS = [SENSOR]

# Localization
LANGUAGE_FILES_DIR = "translations"
SUPPORTED_LANGUAGES = ["da", "el", "en", "es", "fr", "nb", "nl", "sk", "sl"]

# Config
CONF_INPUT_SENSOR = "sensor"
CONF_OPERATION = "operation"
CONF_NAME = "name"
CONF_INTERVAL = "interval"
CONF_UNIT_OF_MEASUREMENT = "unit_of_measurement"
CONF_AUTO_RESET = "auto_reset"

# Attributes
ATTR_DATETIME_OF_OCCURRENCE = "datetime_of_occurrence"

# Operations
CONF_MAX = "max"
CONF_MIN = "min"
CONF_MEAN = "mean"
CONF_MEDIAN = "median"
CONF_STDEV = "stdev"
CONF_VARIANCE = "variance"
CONF_SUM = "sum"
VALID_OPERATIONS = [
    CONF_MAX,
    CONF_MIN,
    CONF_MEAN,
    CONF_MEDIAN,
    CONF_STDEV,
    CONF_VARIANCE,
    CONF_SUM,
]

# Defaults
DEFAULT_INTERVAL = 1800.0  # seconds
DEFAULT_AUTO_RESET = True
# Services
SERVICE_RESET = "reset"
SERVICE_UPDATE = "update"

# Events
EVENT_RESET = "reset"
EVENT_UPDATE = "update"

STARTUP_MESSAGE = f"""
-------------------------------------------------------------------
{NAME}
Version: {VERSION}
If you have any issues with this you need to open an issue here:
{ISSUE_URL}
-------------------------------------------------------------------
"""
