DOMAIN = "dockhand"

CONF_API_URL = "api_url"
CONF_API_TOKEN = "api_token"
CONF_POLL_INTERVAL = "poll_interval"
CONF_POLL_INTERVAL_SLOW = "poll_interval_slow"
CONF_ENABLE_SCHEDULES = "enable_schedules"
CONF_ENABLE_IMAGES = "enable_images"
CONF_ENABLE_VOLUMES = "enable_volumes"
CONF_ENABLE_NETWORKS = "enable_networks"
CONF_ENABLE_PRECISE_UPDATES = "enable_precise_updates"
CONF_POLL_INTERVAL_UPDATES = "poll_interval_updates"
CONF_ENABLE_RUNTIME_CONTROLS = "enable_runtime_controls"
CONF_ENABLE_CONTAINER_STATS = "enable_container_stats"
CONF_VERIFY_SSL = "verify_ssl"

# Removed in 1.2.0 (breaking change) — session-cookie auth replaced by API tokens.
# Kept as constants only so __init__.py can detect and migrate legacy config entries.
_LEGACY_CONF_USERNAME = "username"
_LEGACY_CONF_PASSWORD = "password"
_LEGACY_CONF_SESSION_COOKIE = "session_cookie"

# Renamed in 1.8.0: the old name ("enable updates") was misleading once update
# entities became always-on (Tier 1) — this option only ever controlled Tier 2
# (precise digest versions via real registry queries) even before the rename.
# Kept as a constant only so __init__.py's async_migrate_entry can carry an
# existing user's stored value over to the new key (config entry VERSION 1 -> 2).
_LEGACY_CONF_ENABLE_UPDATES = "enable_updates"

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
DEFAULT_ENABLE_PRECISE_UPDATES = False
# Runtime controls (number/select entities for update-runtime) require an
# extra GET .../inspect call per stack-less container per slow-poll cycle —
# unlike other DIAGNOSTIC entities, this has a real, non-trivial API cost,
# so it's gated the same way images/networks/volumes are.
DEFAULT_ENABLE_RUNTIME_CONTROLS = False
DEFAULT_ENABLE_CONTAINER_STATS = False

PLATFORMS = [
    "sensor",
    "switch",
    "binary_sensor",
    "button",
    "update",
    "number",
    "select",
]
