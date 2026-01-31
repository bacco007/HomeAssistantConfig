"""Constants for the NEO Watcher integration."""

DOMAIN = "neo_watcher"
CONF_API_KEY = "api_key"
CONF_WEEKS_AHEAD = "weeks_ahead"  # New constant for weeks ahead
DEFAULT_WEEKS_AHEAD = 4  # Default value (4 weeks)
ATTRIBUTION = "Data provided by NASA NeoWs API https://api.nasa.gov/"
SCAN_INTERVAL = 86400  # 1 day in seconds
DEFAULT_NEO_SELECTION = "Top NEOs"
NEO_SELECTION_OPTIONS = ["Top NEOs", "Watch a specific NEO"]
CONF_NEO_SELECTION = "watch_selection"
CONF_WATCH_NUMBER = "watch_number"
CONF_TOP_NEOS = "top_neos"
DEFAULT_TOP_NEOS = 10
CONF_SPECIFIC_NEO = "specific_neo"
CONF_UPDATE_HOUR = "update_hour"
DEFAULT_UPDATE_HOUR = 3  # Default to 3 AM