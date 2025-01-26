# mediarr/common/const.py
from datetime import timedelta

# Sensor Configuration Constants
CONF_MAX_ITEMS = "max_items"
CONF_DAYS = "days_to_check"
DEFAULT_MAX_ITEMS = 10
DEFAULT_DAYS = 60

# Scan Interval
SCAN_INTERVAL = timedelta(minutes=10)

# Server Types
SERVER_TYPES = ["plex", "jellyfin", "emby"]

# Manager Types
MANAGER_TYPES = ["sonarr", "radarr"]

# Discovery Types
DISCOVERY_TYPES = ["trakt", "tmdb"]

# Endpoints

TRAKT_ENDPOINTS = []
