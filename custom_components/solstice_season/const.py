"""Constants for the Solstice Season integration."""

from typing import Final

DOMAIN: Final = "solstice_season"

# Configuration keys
CONF_NAME: Final = "name"
CONF_HEMISPHERE: Final = "hemisphere"
CONF_MODE: Final = "mode"

# Default values
DEFAULT_NAME: Final = "Home"

# Hemisphere options
HEMISPHERE_NORTHERN: Final = "northern"
HEMISPHERE_SOUTHERN: Final = "southern"

# Mode options
MODE_ASTRONOMICAL: Final = "astronomical"
MODE_METEOROLOGICAL: Final = "meteorological"

# Season states
SEASON_SPRING: Final = "spring"
SEASON_SUMMER: Final = "summer"
SEASON_AUTUMN: Final = "autumn"
SEASON_WINTER: Final = "winter"

# Daylight trend states
TREND_LONGER: Final = "days_getting_longer"
TREND_SHORTER: Final = "days_getting_shorter"
TREND_SOLSTICE: Final = "solstice_today"

# Sensor keys
SENSOR_CURRENT_SEASON: Final = "current_season"
SENSOR_SPRING_EQUINOX: Final = "spring_equinox"
SENSOR_SUMMER_SOLSTICE: Final = "summer_solstice"
SENSOR_AUTUMN_EQUINOX: Final = "autumn_equinox"
SENSOR_WINTER_SOLSTICE: Final = "winter_solstice"
SENSOR_DAYLIGHT_TREND: Final = "daylight_trend"
SENSOR_NEXT_TREND_CHANGE: Final = "next_daylight_trend_change"
SENSOR_NEXT_SEASON_CHANGE: Final = "next_season_change"

# Icons
ICON_SPRING: Final = "mdi:flower"
ICON_SUMMER: Final = "mdi:white-balance-sunny"
ICON_AUTUMN: Final = "mdi:leaf"
ICON_WINTER: Final = "mdi:snowflake"
ICON_TREND_LONGER: Final = "mdi:arrow-right-bold-outline"
ICON_TREND_SHORTER: Final = "mdi:arrow-left-bold-outline"
ICON_TREND_SOLSTICE: Final = "mdi:arrow-left-right-bold-outline"
ICON_NEXT_TREND_CHANGE: Final = "mdi:sun-clock"
ICON_NEXT_SEASON_CHANGE: Final = "mdi:timelapse"

# Season icon mapping
SEASON_ICONS: Final = {
    SEASON_SPRING: ICON_SPRING,
    SEASON_SUMMER: ICON_SUMMER,
    SEASON_AUTUMN: ICON_AUTUMN,
    SEASON_WINTER: ICON_WINTER,
}

# Trend icon mapping
TREND_ICONS: Final = {
    TREND_LONGER: ICON_TREND_LONGER,
    TREND_SHORTER: ICON_TREND_SHORTER,
    TREND_SOLSTICE: ICON_TREND_SOLSTICE,
}
