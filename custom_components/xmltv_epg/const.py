"""Constants for xmltv_epg."""

from logging import Logger, getLogger

LOGGER: Logger = getLogger(__package__)

NAME = "XMLTV EPG"
DOMAIN = "xmltv_epg"

OPT_UPDATE_INTERVAL = "update_interval_hours"
DEFAULT_UPDATE_INTERVAL = 12  # hours

OPT_PROGRAM_LOOKAHEAD = "program_lookahead_minutes"
DEFAULT_PROGRAM_LOOKAHEAD = 15  # minutes

OPT_ENABLE_UPCOMING_SENSOR = "enable_upcoming_sensor"
DEFAULT_ENABLE_UPCOMING_SENSOR = False

OPT_ENABLE_CHANNEL_ICONS = "enable_channel_icons"
DEFAULT_ENABLE_CHANNEL_ICONS = False

OPT_ENABLE_PROGRAM_IMAGES = "enable_program_images"
DEFAULT_ENABLE_PROGRAM_IMAGES = False

# Interval that sensors are updated.
# This is only updating sensors from cached data, fetching new data interval is defined by OPT_UPDATE_INTERVAL.
SENSOR_REFRESH_INTERVAL = 60  # seconds
