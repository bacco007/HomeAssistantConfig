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
# Seer Content Types
SEER_CONTENT_TYPES = ["requests", "trending", "popular", "discover"]

# Search Related Constants
SEARCH_TYPE_MOVIE = "movie"
SEARCH_TYPE_TV = "tv"
SEARCH_TYPES = [SEARCH_TYPE_MOVIE, SEARCH_TYPE_TV]

# API Endpoints
SEER_SEARCH_ENDPOINT = "/api/v1/search"
SEER_REQUEST_ENDPOINT = "/api/v1/request"
SEER_TV_DETAILS_ENDPOINT = "/api/v1/tv"

# Service Names and Attributes
SERVICE_MOVIE_REQUEST = "submit_movie_request"
SERVICE_TV_REQUEST = "submit_tv_request"
SERVICE_UPDATE_REQUEST = "update_request"

ATTR_REQUEST_NAME = "name"
ATTR_REQUEST_TYPE = "type"
ATTR_REQUEST_STATUS = "new_status"
ATTR_REQUEST_ID = "request_id"
ATTR_REQUEST_SEASON = "season"

# Request Status
REQUEST_STATUS_APPROVED = "approve"
REQUEST_STATUS_DECLINED = "decline"
REQUEST_STATUS_REMOVE = "remove" 

DEFAULT_REQUEST_SEASON = "latest"

# Endpoints

TRAKT_ENDPOINTS = []
