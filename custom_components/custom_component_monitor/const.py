"""Constants for the Custom Component Monitor integration."""

DOMAIN = "custom_component_monitor"

# Sensor keys
SENSOR_ALL_COMPONENTS = "all_hacs_components"
SENSOR_UNUSED_INTEGRATIONS = "unused_integrations"
SENSOR_UNUSED_THEMES = "unused_themes"
SENSOR_UNUSED_FRONTEND = "unused_frontend"
SENSOR_HACS_UPDATES = "hacs_updates"

# Sensor attributes
ATTR_COMPONENTS = "components"
ATTR_TOTAL_COMPONENTS = "total_components"
ATTR_USED_COMPONENTS = "used_components"
ATTR_UNUSED_COMPONENTS = "unused_components"
ATTR_EXCLUDED_COMPONENTS = "excluded_components"
ATTR_UPDATES = "updates"

# Options
CONF_EXCLUDE = "exclude"  # user-maintained list of components to treat as used (#70)

# HACS category to display type mapping
CATEGORY_MAP = {
    "integration": "Integration",
    "plugin": "Frontend / Card",
    "theme": "Theme",
}

# Update interval (in seconds)
DEFAULT_SCAN_INTERVAL = 3600  # 1 hour

# --- Update Action Tracker (merged from HACS-Update-Action-Tracker) ---
STORAGE_KEY = "custom_component_monitor.update_actions"
STORAGE_VERSION = 1
SERVICE_UPDATE_AND_ACTION = "update_and_action"
SERVICE_UPDATE_ALL = "update_all"
UAT_CARD_JS = "update-action-tracker-card.js"
UAT_CARD_BASE_PATH = f"/local/{DOMAIN}/{UAT_CARD_JS}"