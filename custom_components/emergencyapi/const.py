DOMAIN = "emergencyapi"
PLATFORMS = ["geo_location", "binary_sensor", "sensor"]

API_BASE_URL = "https://emergencyapi.com/api/v1"

DEFAULT_RADIUS_KM = 50
DEFAULT_SCAN_INTERVAL_MINUTES = 5
MIN_SCAN_INTERVAL_MINUTES = 2
MAX_SCAN_INTERVAL_MINUTES = 60

CONF_API_KEY = "api_key"
CONF_RADIUS = "radius"
CONF_SCAN_INTERVAL = "scan_interval"

ATTR_INCIDENT_COUNT = "incident_count"
ATTR_NEAREST_DISTANCE = "nearest_distance"
ATTR_MAX_SEVERITY = "max_severity"
ATTR_MAX_WARNING_LEVEL = "max_warning_level"
ATTR_EVENT_TYPE = "event_type"
ATTR_WARNING_LEVEL = "warning_level"
ATTR_SEVERITY = "severity"
ATTR_SOURCE_STATE = "source_state"
ATTR_SOURCE_AGENCY = "source_agency"
ATTR_STATUS = "status"

SEVERITY_ORDER = {
    "Extreme": 5,
    "Severe": 4,
    "Moderate": 3,
    "Minor": 2,
    "Unknown": 1,
}
