"""Constants for the Whodunnit integration."""

DOMAIN = "whodunnit"
PLATFORMS = ["sensor"]

# Attribute keys
ATTR_SOURCE_TYPE = "source_type"
ATTR_SOURCE_ID = "source_id"
ATTR_SOURCE_NAME = "source_name"
ATTR_CONTEXT_ID = "context_id"
ATTR_USER_ID = "user_id"
ATTR_EVENT_TIME = "event_time"
ATTR_CONFIDENCE = "confidence"
ATTR_HISTORY_LOG = "history_log"
ATTR_CACHE_DEBUG = "cache_debug"

# Confidence levels
CONFIDENCE_HIGH = "high"
CONFIDENCE_MEDIUM = "medium"
CONFIDENCE_LOW = "low"

# Threshold (seconds): a context cache entry older than this on a hardware
# platform entity is considered possibly stale (ESPHome context bleed window).
# ESPHome reuses the last HA-sent context for approximately 5 seconds after
# receiving a command - empirically verified. Within that 5-second window,
# a physical button press may inherit the prior HA context and be misclassified.
# So: cache_age < 5s on an ESPHome entity = CONFIDENCE_LOW (inside bleed window).
#     cache_age > 5s on an ESPHome entity = CONFIDENCE_HIGH (bleed window passed,
#     ESPHome will report its own fresh context for any genuine HA-triggered event).
ESPHOME_BLEED_THRESHOLD = 5.0

# Number of trigger events retained in the history log attribute.
HISTORY_LOG_SIZE = 25

# Hardware integration platforms whose context may bleed from prior HA commands.
# ESPHome is the known offender; others can be added here if observed.
BLEED_PLATFORMS = frozenset({"esphome"})

# Identity Constants
ID_INDIRECT_AUTOMATION = "automation.indirect"
NAME_INDIRECT_AUTOMATION = "Automation (Indirect)"
NAME_DEVICE = "Device"
NAME_READY = "None"
NAME_UNKNOWN_USER = "Unknown User"
NAME_TRACKER_PREFIX = "Whodunnit"
NAME_SERVICE_ACCOUNT = "Service Account"

# State Slugs (Matching strings.json)
# These are the values written to the sensor's native_value (the primary state).
STATE_AUTOMATION = "automation"
STATE_DEVICE = "device"
STATE_UI = "ui"
STATE_MONITORING = "monitoring"
STATE_SCENE = "scene"
STATE_SCRIPT = "script"
STATE_SERVICE = "service"

# Source Type Values
# These are written to the source_type attribute and describe the category of
# the trigger source. They are distinct from the State Slugs above  -  the state
# slug describes the trigger mechanism (e.g. "ui"), while source_type describes
# the source category (e.g. "user"). Both are useful in automations but serve
# different purposes.
SOURCE_TYPE_USER = "user"           # Human acting via dashboard or app
SOURCE_TYPE_DEVICE = "device"       # Device-originated: physical press or internal event
SOURCE_TYPE_SERVICE = "service"     # Service account (Node-RED, AppDaemon, etc.)
# Note: automation, scene, and script source_type values reuse the STATE_* slugs
# above (STATE_AUTOMATION, STATE_SCENE, STATE_SCRIPT) since they are identical.

# Event name fired by Whodunnit after every successful trigger classification.
# Automations can use this as a trigger instead of watching the sensor state,
# which is necessary when the same source fires repeatedly (e.g. the same
# script runs twice in a row) because the sensor state value does not change
# between identical consecutive classifications  -  only event_time changes.
#
# Example automation trigger:
#   trigger:
#     - platform: event
#       event_type: whodunnit_trigger_detected
#       event_data:
#         entity_id: light.my_light   # optional: filter by tracked entity
#
# Event payload fields:
#   entity_id    - the tracked entity that changed (e.g. "light.garage")
#   state        - the trigger source slug (e.g. "script", "ui", "device")
#   source_type  - source category (e.g. "user", "device", "script")
#   source_id    - entity or person ID of the source
#   source_name  - human-readable source name
#   confidence   - "high", "medium", or "low"
#   context_id   - HA context ID of the triggering event
#   event_time   - ISO timestamp of the classification
EVENT_TRIGGER_DETECTED = "whodunnit_trigger_detected"

# Default Values
EVENT_TIME_DEFAULT = "None"
SOURCE_TYPE_DEFAULT = "None"
SOURCE_ID_DEFAULT = "None"
USER_ID_DEFAULT = "None"
CONTEXT_ID_DEFAULT = "None"

SUPPORTED_DOMAINS = [
    # Trackable device domains
    "switch", "light", "fan", "media_player",
    "cover", "lock", "vacuum", "siren", "humidifier", "climate",
    "remote", "water_heater", "valve",
    # Number / select / text - device-side
    "number", "select",
    # Button entities - device-side and Helper
    "button", "input_button",
    # Helper domains
    "input_boolean", "input_number", "input_select", "input_text",
    # Other meaningful trackable domains
    "alarm_control_panel", "timer",
]