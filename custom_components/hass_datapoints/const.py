"""Constants for Hass Data Points."""

DOMAIN = "hass_datapoints"

STORAGE_KEY = "hass_datapoints.events"
STORAGE_VERSION = 1

MONITOR_SCAN_HISTORY_MAX = 96

# Maximum data points fed into anomaly detection or returned by history fetch.
# Shared between websocket_api.py and history_utils.py to avoid circular imports.
ANOMALY_MAX_PTS = 50_000

# hass.data[DOMAIN] keys
KEY_STORE = "store"
KEY_ANOMALY_CACHE = "anomaly_cache"
KEY_ADD_SENSOR_ENTITIES = "add_sensor_entities"
KEY_ADD_BINARY_SENSOR_ENTITIES = "add_binary_sensor_entities"
KEY_ADD_SWITCH_ENTITIES = "add_switch_entities"
KEY_MONITOR_SENSORS = "monitor_sensors"
KEY_MONITOR_BINARY_SENSORS = "monitor_binary_sensors"
KEY_MONITOR_SWITCHES = "monitor_switches"

# Ranges ending within this many seconds of now are considered "live" and are
# not written to the anomaly cache (result would change on the next request).
ANOMALY_LIVE_EDGE_SECONDS = 300

MONITOR_DEFAULT_LOOK_BACK_HOURS = 24
MONITOR_DEFAULT_SCAN_INTERVAL_MINUTES = 30

EVENT_RECORDED = f"{DOMAIN}_event_recorded"
EVENT_MONITORS_UPDATED = f"{DOMAIN}_monitors_updated"
EVENT_ANOMALY_DETECTED = f"{DOMAIN}_anomaly_detected"
EVENT_ANOMALY_RESOLVED = f"{DOMAIN}_anomaly_resolved"

# Service fields
ATTR_MESSAGE = "message"
ATTR_ANNOTATION = "annotation"
ATTR_ENTITY_IDS = "entity_ids"
ATTR_DEVICE_IDS = "device_ids"
ATTR_AREA_IDS = "area_ids"
ATTR_LABEL_IDS = "label_ids"
ATTR_ICON = "icon"
ATTR_COLOR = "color"
ATTR_DATE = "date"
ATTR_DEV = "dev"
ATTR_AUTOMATION_ID = "automation_id"

SERVICE_RECORD = "record"

# Frontend resource URL (served by integration)
FRONTEND_URL = "/hass_datapoints/cards.js"

PANEL_COMPONENT = "hass-datapoints-history-panel"
PANEL_URL_PATH = "hass-datapoints-history"
PANEL_TITLE = "Data Points"
PANEL_ICON = "mdi:chart-timeline-variant"
