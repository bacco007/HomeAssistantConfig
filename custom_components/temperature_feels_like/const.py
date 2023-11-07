"""Constants for temperature_feels_like."""

# Base component constants
from typing import Final

NAME: Final = "Temperature Feels Like"
DOMAIN: Final = "temperature_feels_like"
VERSION: Final = "0.3.8"
ISSUE_URL: Final = "https://github.com/Limych/ha-temperature-feeling/issues"

STARTUP_MESSAGE: Final = f"""
-------------------------------------------------------------------
{NAME}
Version: {VERSION}
This is a custom integration!
If you have ANY issues with this you need to open an issue here:
{ISSUE_URL}
-------------------------------------------------------------------
"""


# Attributes
ATTR_TEMPERATURE_SOURCE: Final = "temperature_source"
ATTR_TEMPERATURE_SOURCE_VALUE: Final = "temperature_source_value"
ATTR_HUMIDITY_SOURCE: Final = "humidity_source"
ATTR_HUMIDITY_SOURCE_VALUE: Final = "humidity_source_value"
ATTR_WIND_SPEED_SOURCE: Final = "wind_speed_source"
ATTR_WIND_SPEED_SOURCE_VALUE: Final = "wind_speed_source_value"
