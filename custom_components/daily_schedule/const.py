"""Constants for the Daily Schedule integration."""
import logging
from typing import Final

DOMAIN: Final = "daily_schedule"
LOGGER = logging.getLogger(__package__)

CONF_DISABLED = "disabled"
CONF_FROM: Final = "from"
CONF_TO: Final = "to"
CONF_SCHEDULE: Final = "schedule"
CONF_UTC: Final = "utc"

ATTR_NEXT_TOGGLE: Final = "next_toggle"

SERVICE_SET: Final = "set"
