"""Constants for temperature_feels_like."""

# Base component constants
NAME = "Temperature Feels Like"
DOMAIN = "temperature_feels_like"
VERSION = "0.3.2"
ISSUE_URL = "https://github.com/Limych/ha-temperature-feeling/issues"

STARTUP_MESSAGE = f"""
-------------------------------------------------------------------
{NAME}
Version: {VERSION}
This is a custom integration!
If you have ANY issues with this you need to open an issue here:
{ISSUE_URL}
-------------------------------------------------------------------
"""


# Attributes
ATTR_TEMPERATURE_SOURCE = "temperature_source"
ATTR_HUMIDITY_SOURCE = "humidity_source"
ATTR_WIND_SPEED_SOURCE = "wind_speed_source"
