DOMAIN = "dockhand"

CONF_API_URL = "api_url"
CONF_API_TOKEN = "api_token"
CONF_POLL_INTERVAL = "poll_interval"
CONF_POLL_INTERVAL_SLOW = "poll_interval_slow"
CONF_ENABLE_SCHEDULES = "enable_schedules"
CONF_ENABLE_IMAGES = "enable_images"
CONF_ENABLE_VOLUMES = "enable_volumes"
CONF_ENABLE_NETWORKS = "enable_networks"
CONF_ENABLE_UPDATES = "enable_updates"
CONF_POLL_INTERVAL_UPDATES = "poll_interval_updates"
CONF_VERIFY_SSL = "verify_ssl"

# Removed in 1.2.0 (breaking change) — session-cookie auth replaced by API tokens.
# Kept as constants only so __init__.py can detect and migrate legacy config entries.
_LEGACY_CONF_USERNAME = "username"
_LEGACY_CONF_PASSWORD = "password"
_LEGACY_CONF_SESSION_COOKIE = "session_cookie"

DEFAULT_POLL_INTERVAL = 60
DEFAULT_POLL_INTERVAL_SLOW = 600
DEFAULT_POLL_INTERVAL_UPDATES = 86400  # 24 hours

# Floors for the options-flow interval fields. These exist to reject zero and
# negative values, which would make DataUpdateCoordinator refresh in a tight
# loop and hammer the Dockhand API. The update floor is higher because each
# check performs real registry queries for every container.
MIN_POLL_INTERVAL = 10
MIN_POLL_INTERVAL_SLOW = 30
MIN_POLL_INTERVAL_UPDATES = 300
DEFAULT_ENABLE_SCHEDULES = False
DEFAULT_ENABLE_IMAGES = False
DEFAULT_ENABLE_VOLUMES = False
DEFAULT_ENABLE_NETWORKS = False
DEFAULT_ENABLE_UPDATES = False

PLATFORMS = ["sensor", "switch", "binary_sensor", "button", "update"]
