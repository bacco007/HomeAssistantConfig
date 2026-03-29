"""Constants for the Custom Component Monitor integration."""

DOMAIN = "custom_component_monitor"

# Sensor keys
SENSOR_ALL_COMPONENTS = "all_hacs_components"
SENSOR_UNUSED_INTEGRATIONS = "unused_integrations"
SENSOR_UNUSED_THEMES = "unused_themes"
SENSOR_UNUSED_FRONTEND = "unused_frontend"

# Sensor attributes
ATTR_COMPONENTS = "components"
ATTR_TOTAL_COMPONENTS = "total_components"
ATTR_USED_COMPONENTS = "used_components"
ATTR_UNUSED_COMPONENTS = "unused_components"

# HACS category to display type mapping
CATEGORY_MAP = {
    "integration": "Integration",
    "plugin": "Frontend / Card",
    "theme": "Theme",
}

# Update interval (in seconds)
DEFAULT_SCAN_INTERVAL = 3600  # 1 hour