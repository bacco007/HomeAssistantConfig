"""Constants for the UniFi Insights integration."""
from datetime import timedelta
from typing import Final

DOMAIN = "unifi_insights"

MANUFACTURER: Final = "Ubiquiti Inc."

DEFAULT_API_HOST = "https://192.168.10.1"
SCAN_INTERVAL_NORMAL = timedelta(seconds=30)

UNIFI_API_HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}



# Device types
DEVICE_TYPE_CAMERA: Final = "camera"
DEVICE_TYPE_LIGHT: Final = "light"
DEVICE_TYPE_SENSOR: Final = "sensor"
DEVICE_TYPE_NVR: Final = "nvr"
DEVICE_TYPE_VIEWER: Final = "viewer"
DEVICE_TYPE_CHIME: Final = "chime"

# Camera attributes
ATTR_CAMERA_ID: Final = "camera_id"
ATTR_CAMERA_NAME: Final = "camera_name"
ATTR_CAMERA_STATE: Final = "camera_state"
ATTR_CAMERA_TYPE: Final = "camera_type"
ATTR_IS_PACKAGE_CAMERA: Final = "is_package_camera"
ATTR_PARENT_CAMERA_ID: Final = "parent_camera_id"
ATTR_MIC_ENABLED: Final = "mic_enabled"
ATTR_RECORDING_MODE: Final = "recording_mode"
ATTR_HDR_MODE: Final = "hdr_mode"
ATTR_VIDEO_MODE: Final = "video_mode"
ATTR_LAST_MOTION: Final = "last_motion"
ATTR_SMART_DETECT_TYPES: Final = "smart_detect_types"

# Light attributes
ATTR_LIGHT_ID: Final = "light_id"
ATTR_LIGHT_NAME: Final = "light_name"
ATTR_LIGHT_STATE: Final = "light_state"
ATTR_LIGHT_MODE: Final = "light_mode"
ATTR_LIGHT_LEVEL: Final = "light_level"
ATTR_LIGHT_MOTION: Final = "light_motion"
ATTR_LIGHT_DARK: Final = "light_dark"

# Services
SERVICE_SET_RECORDING_MODE: Final = "set_recording_mode"
SERVICE_SET_HDR_MODE: Final = "set_hdr_mode"
SERVICE_SET_VIDEO_MODE: Final = "set_video_mode"
SERVICE_SET_MIC_VOLUME: Final = "set_mic_volume"
SERVICE_SET_LIGHT_MODE: Final = "set_light_mode"
SERVICE_SET_LIGHT_LEVEL: Final = "set_light_level"
SERVICE_PTZ_MOVE: Final = "ptz_move"

SERVICE_PTZ_PATROL: Final = "ptz_patrol"

# Service descriptions
SERVICE_PTZ_MOVE_DESCRIPTION: Final = "Move a PTZ camera to a preset position."
SERVICE_PTZ_PATROL_DESCRIPTION: Final = "Start or stop a PTZ camera patrol."

# API endpoints
API_PATH_INFO: Final = "/proxy/protect/integration/v1/meta/info"
API_PATH_CAMERAS: Final = "/proxy/protect/integration/v1/cameras"
API_PATH_CAMERA: Final = "/proxy/protect/integration/v1/cameras/{id}"
API_PATH_CAMERA_SNAPSHOT: Final = "/proxy/protect/integration/v1/cameras/{id}/snapshot"
API_PATH_CAMERA_RTSPS: Final = "/proxy/protect/integration/v1/cameras/{id}/rtsps-stream"
API_PATH_LIGHTS: Final = "/proxy/protect/integration/v1/lights"
API_PATH_LIGHT: Final = "/proxy/protect/integration/v1/lights/{id}"
API_PATH_SENSORS: Final = "/proxy/protect/integration/v1/sensors"
API_PATH_SENSOR: Final = "/proxy/protect/integration/v1/sensors/{id}"
API_PATH_NVRS: Final = "/proxy/protect/integration/v1/nvrs"
API_PATH_NVR: Final = "/proxy/protect/integration/v1/nvrs/{id}"
API_PATH_CHIMES: Final = "/proxy/protect/integration/v1/chimes"
API_PATH_CHIME: Final = "/proxy/protect/integration/v1/chimes/{id}"
API_PATH_PTZ_MOVE: Final = "/proxy/protect/integration/v1/cameras/{id}/ptz/goto/{slot}"
API_PATH_PTZ_PATROL_START: Final = (
    "/proxy/protect/integration/v1/cameras/{id}/ptz/patrol/start/{slot}"
)
API_PATH_PTZ_PATROL_STOP: Final = "/proxy/protect/integration/v1/cameras/{id}/ptz/patrol/stop"

# WebSocket endpoints
API_PATH_WEBSOCKET_DEVICES: Final = "/proxy/protect/integration/v1/subscribe/devices"
API_PATH_WEBSOCKET_EVENTS: Final = "/proxy/protect/integration/v1/subscribe/events"

# WebSocket update types
WS_DEVICE_UPDATE_TYPES: Final = [
    "camera",
    "light",
    "sensor",
    "nvr",
    "doorlock",
    "viewport",
    "chime",
]
WS_EVENT_UPDATE_TYPES: Final = [
    "motion",
    "smartDetectZone",
    "smartDetectLine",
    "doorbell",
    "disconnect",
]

# WebSocket connection parameters - Improved Timeouts
WS_CONNECTION_TIMEOUT: Final = 15.0  # Increase from 30s to 15s for faster feedback
WS_INITIAL_CONNECTION_TIMEOUT: Final = 20.0  # Even longer for first connection
WS_ADAPTIVE_TIMEOUT_MULTIPLIER: Final = 1.5  # Increase timeout on retries
WS_MAX_CONNECTION_TIMEOUT: Final = 60.0  # Maximum connection timeout

# Heartbeat Configuration
WS_HEARTBEAT_INTERVAL: Final = 30.0  # Send heartbeat every 30 seconds
WS_HEARTBEAT_TIMEOUT: Final = 45.0  # Consider connection dead after 45 seconds
WS_HEALTH_CHECK_INTERVAL: Final = 12.0  # Check health every 12 seconds

# Reconnection Configuration
WS_RECONNECT_BASE_DELAY: Final = 8.0  # Start with 8 seconds (matches your logs)
WS_RECONNECT_MAX_DELAY: Final = 120.0  # Increase max delay to 2 minutes
WS_RECONNECT_JITTER: Final = 0.2  # 20% jitter
WS_MAX_CONSECUTIVE_ERRORS: Final = 15  # Allow more errors before giving up

# Connection Health
WS_STALE_CONNECTION_THRESHOLD: Final = 60.0  # Force reconnect if no messages for 60 seconds

# WebSocket connection states
WS_STATE_DISCONNECTED: Final = "disconnected"
WS_STATE_CONNECTING: Final = "connecting"
WS_STATE_CONNECTED: Final = "connected"
WS_STATE_RECONNECTING: Final = "reconnecting"
WS_STATE_FAILED: Final = "failed"

# WebSocket error types
WS_ERROR_NETWORK: Final = "network_error"
WS_ERROR_AUTHENTICATION: Final = "authentication_error"
WS_ERROR_SERVER: Final = "server_error"
WS_ERROR_TIMEOUT: Final = "timeout_error"
WS_ERROR_UNKNOWN: Final = "unknown_error"

# Camera states
CAMERA_STATE_CONNECTED: Final = "CONNECTED"
CAMERA_STATE_CONNECTING: Final = "CONNECTING"
CAMERA_STATE_DISCONNECTED: Final = "DISCONNECTED"

# Camera types
CAMERA_TYPE_REGULAR: Final = "regular"
CAMERA_TYPE_DOORBELL: Final = "doorbell"
CAMERA_TYPE_DOORBELL_WITH_PACKAGE_DETECTION: Final = "doorbell_with_package_detection"
CAMERA_TYPE_CAMERA_WITH_PACKAGE_DETECTION: Final = "camera_with_package_detection"
CAMERA_TYPE_DOORBELL_MAIN: Final = "doorbell_main"
CAMERA_TYPE_DOORBELL_PACKAGE: Final = "doorbell_package"
CAMERA_TYPE_CAMERA_MAIN: Final = "camera_main"
CAMERA_TYPE_CAMERA_PACKAGE: Final = "camera_package"

# HDR modes
HDR_MODE_AUTO: Final = "auto"
HDR_MODE_ON: Final = "on"
HDR_MODE_OFF: Final = "off"

# Video modes
VIDEO_MODE_DEFAULT: Final = "default"
VIDEO_MODE_HIGH_FPS: Final = "highFps"
VIDEO_MODE_SPORT: Final = "sport"
VIDEO_MODE_SLOW_SHUTTER: Final = "slowShutter"

# Smart detect types
SMART_DETECT_PERSON: Final = "person"
SMART_DETECT_VEHICLE: Final = "vehicle"
SMART_DETECT_ANIMAL: Final = "animal"
SMART_DETECT_PACKAGE: Final = "package"

# Sensor attributes
ATTR_SENSOR_ID: Final = "sensor_id"
ATTR_SENSOR_NAME: Final = "sensor_name"
ATTR_SENSOR_TYPE: Final = "sensor_type"
ATTR_SENSOR_STATE: Final = "sensor_state"
ATTR_SENSOR_BATTERY: Final = "battery_percentage"
ATTR_SENSOR_BATTERY_LOW: Final = "battery_low"
ATTR_SENSOR_MOTION_DETECTED: Final = "motion_detected"
ATTR_SENSOR_MOTION_DETECTED_AT: Final = "motion_detected_at"
ATTR_SENSOR_MOTION_ENABLED: Final = "motion_enabled"
ATTR_SENSOR_MOTION_SENSITIVITY: Final = "motion_sensitivity"
ATTR_SENSOR_IS_OPENED: Final = "is_opened"
ATTR_SENSOR_OPEN_STATUS_CHANGED_AT: Final = "open_status_changed_at"
ATTR_SENSOR_LIGHT_VALUE: Final = "light_value"
ATTR_SENSOR_HUMIDITY_VALUE: Final = "humidity_value"
ATTR_SENSOR_TEMPERATURE_VALUE: Final = "temperature_value"

# NVR attributes
ATTR_NVR_ID: Final = "nvr_id"
ATTR_NVR_NAME: Final = "nvr_name"
ATTR_NVR_STATE: Final = "nvr_state"
ATTR_NVR_VERSION: Final = "nvr_version"

# Chime attributes
ATTR_CHIME_ID: Final = "chime_id"
ATTR_CHIME_NAME: Final = "chime_name"
ATTR_CHIME_STATE: Final = "chime_state"
ATTR_CHIME_VOLUME: Final = "chime_volume"
ATTR_CHIME_RINGTONE_ID: Final = "chime_ringtone_id"
ATTR_CHIME_REPEAT_TIMES: Final = "chime_repeat_times"
ATTR_CHIME_CAMERA_IDS: Final = "chime_camera_ids"
ATTR_CHIME_RING_SETTINGS: Final = "chime_ring_settings"

# Chime ringtone IDs
CHIME_RINGTONE_DEFAULT: Final = "default"
CHIME_RINGTONE_MECHANICAL: Final = "mechanical"
CHIME_RINGTONE_DIGITAL: Final = "digital"
CHIME_RINGTONE_CHRISTMAS: Final = "christmas"
CHIME_RINGTONE_TRADITIONAL: Final = "traditional"
CHIME_RINGTONE_CUSTOM_1: Final = "custom1"
CHIME_RINGTONE_CUSTOM_2: Final = "custom2"

# Chime services
SERVICE_SET_CHIME_VOLUME: Final = "set_chime_volume"
SERVICE_PLAY_CHIME_RINGTONE: Final = "play_chime_ringtone"
SERVICE_SET_CHIME_RINGTONE: Final = "set_chime_ringtone"
SERVICE_SET_CHIME_REPEAT_TIMES: Final = "set_chime_repeat_times"

# Chime API endpoints
API_PATH_CHIME_PLAY: Final = "/proxy/protect/integration/v1/chimes/{id}/play"

# Light modes
LIGHT_MODE_ALWAYS: Final = "always"
LIGHT_MODE_MOTION: Final = "motion"
LIGHT_MODE_OFF: Final = "off"