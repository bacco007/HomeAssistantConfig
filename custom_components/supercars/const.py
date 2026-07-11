"""Constants for the Supercars Championship integration."""

DOMAIN = "supercars"
DEFAULT_NAME = "Supercars"

# Natsoft live timing endpoint — a websocket feed, not a plain HTTP resource.
# "V8SUPER" is a standing channel name for the whole category (it does not
# change per event/round; confirmed live against the current meeting).
NATSOFT_URL = "ws://server.natsoft.com.au:8080/LiveMeeting/V8SUPER"

# How often to poll when a session is active (seconds)
SCAN_INTERVAL_ACTIVE = 5
# How often to poll when no session is detected (seconds)
SCAN_INTERVAL_IDLE = 60

# After a race finishes (flag -> "Ended"), supercars.com takes a little while
# to publish updated championship points. Wait this long, then re-scrape
# standings and results so they reflect the just-completed race.
POST_RACE_REFRESH_DELAY = 900  # 15 minutes

# Stream link (geo-locked, for at-circuit use only)
STREAM_URL = "https://supercars.fm"
STREAM_NOTE = "Available at-circuit only"

# Session state values from Natsoft (the feed's <S S="..."> attribute)
SESSION_STATES = {
    "Green": "green_flag",
    "Yellow": "yellow_flag",
    "SafetyCar": "safety_car",
    "VSC": "virtual_safety_car",
    "Red": "red_flag",
    "Chequered": "chequered_flag",
    "Paused": "paused",
    "Ended": "ended",
    "Inactive": "inactive",
}

# Flag states that mean no session is actively running. A finished race sends
# "Ended", and between events the feed reports "Inactive"; either way we retain
# the last data but stop treating the session as live.
INACTIVE_FLAGS = frozenset({None, "", "Inactive", "Ended"})

# Sensor unique ID suffixes
SENSOR_SESSION = "session"
SENSOR_LEADER = "leader"
SENSOR_LAP = "lap"
SENSOR_FLAG = "flag"
SENSOR_WEATHER = "weather"

CONF_SCAN_INTERVAL = "scan_interval"
