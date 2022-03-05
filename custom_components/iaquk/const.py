"""Constants for calculate IAQ UK index."""
from typing import Final

from homeassistant.components.sensor import DOMAIN as SENSOR

# Base component constants
NAME: Final = "Indoor Air Quality UK Index"
DOMAIN: Final = "iaquk"
VERSION: Final = "1.6.2"
ISSUE_URL: Final = "https://github.com/Limych/ha-iaquk/issues"

STARTUP_MESSAGE: Final = f"""
-------------------------------------------------------------------
{NAME}
Version: {VERSION}
This is a custom integration!
If you have ANY issues with this you need to open an issue here:
{ISSUE_URL}
-------------------------------------------------------------------
"""

# Icons
ICON_DEFAULT: Final = "mdi:air-filter"
ICON_EXCELLENT: Final = "mdi:emoticon-excited"
ICON_GOOD: Final = "mdi:emoticon-happy"
ICON_FAIR: Final = "mdi:emoticon-neutral"
ICON_POOR: Final = "mdi:emoticon-sad"
ICON_INADEQUATE: Final = "mdi:emoticon-dead"

# Device classes
BINARY_SENSOR_DEVICE_CLASS: Final = "connectivity"

# Platforms
PLATFORMS: Final = [SENSOR]

# Configuration and options
CONF_SOURCES: Final = "sources"
CONF_TEMPERATURE: Final = "temperature"
CONF_HUMIDITY: Final = "humidity"
CONF_CO2: Final = "co2"
CONF_TVOC: Final = "tvoc"
CONF_PM: Final = "pm"
CONF_NO2: Final = "no2"
CONF_CO: Final = "co"
CONF_HCHO: Final = "hcho"  # Formaldehyde
CONF_RADON: Final = "radon"

# Attributes
ATTR_SOURCES_SET: Final = "sources_set"
ATTR_SOURCES_USED: Final = "sources_used"
ATTR_SOURCE_INDEX_TPL: Final = "{}_index"


LEVEL_EXCELLENT: Final = "Excellent"
LEVEL_GOOD: Final = "Good"
LEVEL_FAIR: Final = "Fair"
LEVEL_POOR: Final = "Poor"
LEVEL_INADEQUATE: Final = "Inadequate"

UNIT_PPM: Final = {
    "ppm": 1,  # Target unit -- conversion rate will be ignored
    "ppb": 0.001,
}
UNIT_PPB: Final = {
    "ppb": 1,  # Target unit -- conversion rate will be ignored
    "ppm": 1000,
}
UNIT_UGM3: Final = {
    "µg/m³": 1,  # Target unit -- conversion rate will be ignored
    "µg/m3": 1,
    "µg/m^3": 1,
    "mg/m³": 1000,
    "mg/m3": 1000,
    "mg/m^3": 1000,
}
UNIT_MGM3: Final = {
    "mg/m³": 1,  # Target unit -- conversion rate will be ignored
    "mg/m3": 1,
    "mg/m^3": 1,
    "µg/m³": 0.001,
    "µg/m3": 0.001,
    "µg/m^3": 0.001,
}

MWEIGTH_TVOC: Final = 100  # g/mol
MWEIGTH_HCHO: Final = 30.0260  # g/mol
MWEIGTH_CO: Final = 28.0100  # g/mol
MWEIGTH_NO2: Final = 46.0100  # g/mol
MWEIGTH_CO2: Final = 44.0100  # g/mol
