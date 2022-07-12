"""Define constants used in garbage_collection."""

# Constants for holidays.
# Base component constants
DOMAIN = "holidays"
CALENDAR_PLATFORM = "calendar"
ATTRIBUTION = "Data from this is provided by holidays."

CONFIG_VERSION = 3

ATTR_NEXT_DATE = "next_date"
ATTR_NEXT_HOLIDAY = "next_holiday"
ATTR_LAST_UPDATED = "last_updated"
ATTR_HOLIDAYS = "holidays"

# Device classes
BINARY_SENSOR_DEVICE_CLASS = "connectivity"
DEVICE_CLASS = "holidays__schedule"

# Configuration
CONF_CALENDAR = "calendar"
CONF_ICON_NORMAL = "icon_normal"
CONF_ICON_TODAY = "icon_today"
CONF_ICON_TOMORROW = "icon_tomorrow"
CONF_COUNTRY = "country"
CONF_HOLIDAY_POP_NAMED = "holiday_pop_named"
CONF_PROV = "prov"  # obsolete
CONF_STATE = "state"  # obsolete
CONF_SUBDIV = "subdiv"  # Subdivision - replaces state and prov
CONF_OBSERVED = "observed"
CONF_CALENDARS = "calendars"

# Defaults
DEFAULT_NAME = DOMAIN

# Icons
DEFAULT_ICON_NORMAL = "mdi:calendar-blank"
DEFAULT_ICON_TODAY = "mdi:calendar-arrow-right"
DEFAULT_ICON_TOMORROW = "mdi:calendar-check"
ICON = DEFAULT_ICON_NORMAL
