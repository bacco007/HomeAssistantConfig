"""Constants for Armadarr."""

from logging import Logger, getLogger

LOGGER: Logger = getLogger(__package__)

DOMAIN = "armadarr"

CONF_APP_TYPE = "app_type"
CONF_URL = "url"
CONF_API_KEY = "api_key"
CONF_VERIFY_SSL = "verify_ssl"
CONF_UPCOMING_DAYS = "upcoming_days"
CONF_WANTED_COUNT = "wanted_count"

DEFAULT_UPCOMING_DAYS = 30
DEFAULT_WANTED_COUNT = 50

APP_TYPES = [
    "Sonarr",
    "Radarr",
    "Lidarr",
    "Readarr",
    "Prowlarr",
    "Bazarr",
    "Whisparr",
    "Dispatcharr",
]
