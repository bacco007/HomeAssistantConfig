"""Constants for the SolsticeHub integration."""

from typing import Final

DOMAIN: Final = "solsticehub"

# Configuration keys
CONF_NAME: Final = "name"
CONF_DEVICE_TYPE: Final = "device_type"
CONF_HEMISPHERE: Final = "hemisphere"
CONF_MODE: Final = "mode"
CONF_NAMING: Final = "naming"
CONF_SCOPE: Final = "scope"

# Device types
DEVICE_FOUR_SEASONS: Final = "four_seasons"
DEVICE_CROSS_QUARTER: Final = "cross_quarter"
DEVICE_CHINESE: Final = "chinese"

# Hemisphere options
HEMISPHERE_NORTHERN: Final = "northern"
HEMISPHERE_SOUTHERN: Final = "southern"

# Mode options (Four Seasons)
MODE_ASTRONOMICAL: Final = "astronomical"
MODE_METEOROLOGICAL: Final = "meteorological"

# Mode options (Cross-Quarter)
MODE_TRADITIONAL: Final = "traditional"

# Naming options (Cross-Quarter)
NAMING_SYSTEM: Final = "system"
NAMING_CELTIC: Final = "celtic"

# Naming options (Chinese)
NAMING_PINYIN: Final = "pinyin"
NAMING_HANZI: Final = "hanzi"

# Scope options (Chinese)
SCOPE_ALL_24: Final = "all_24"
SCOPE_8_MAJOR: Final = "8_major"

# Season states
SEASON_SPRING: Final = "spring"
SEASON_SUMMER: Final = "summer"
SEASON_AUTUMN: Final = "autumn"
SEASON_WINTER: Final = "winter"

# Daylight trend states
TREND_LONGER: Final = "days_getting_longer"
TREND_SHORTER: Final = "days_getting_shorter"
TREND_SOLSTICE: Final = "solstice_today"

# Sensor keys - Base Data
SENSOR_SOLAR_LONGITUDE: Final = "solar_longitude"
SENSOR_DAYLIGHT_TREND: Final = "daylight_trend"
SENSOR_NEXT_TREND_CHANGE: Final = "next_daylight_trend_change"

# Sensor keys - Four Seasons
SENSOR_CURRENT_SEASON: Final = "current_season"
SENSOR_SPRING_EQUINOX: Final = "spring_equinox"
SENSOR_SUMMER_SOLSTICE: Final = "summer_solstice"
SENSOR_AUTUMN_EQUINOX: Final = "autumn_equinox"
SENSOR_WINTER_SOLSTICE: Final = "winter_solstice"
SENSOR_NEXT_SEASON_CHANGE: Final = "next_season_change"

# Sensor keys - Cross-Quarter
SENSOR_CURRENT_PERIOD: Final = "current_period"
SENSOR_NEXT_PERIOD_CHANGE: Final = "next_period_change"

# Sensor keys - Chinese Solar Terms
SENSOR_CURRENT_TERM: Final = "current_term"
SENSOR_NEXT_TERM_CHANGE: Final = "next_term_change"

# Cross-Quarter period names (Celtic)
PERIOD_YULE: Final = "yule"
PERIOD_IMBOLC: Final = "imbolc"
PERIOD_OSTARA: Final = "ostara"
PERIOD_BELTANE: Final = "beltane"
PERIOD_LITHA: Final = "litha"
PERIOD_LUGHNASADH: Final = "lughnasadh"
PERIOD_MABON: Final = "mabon"
PERIOD_SAMHAIN: Final = "samhain"

# Cross-Quarter periods list
CROSS_QUARTER_PERIODS: Final = [
    PERIOD_YULE,
    PERIOD_IMBOLC,
    PERIOD_OSTARA,
    PERIOD_BELTANE,
    PERIOD_LITHA,
    PERIOD_LUGHNASADH,
    PERIOD_MABON,
    PERIOD_SAMHAIN,
]

# Chinese Solar Terms - all 24 in order
CHINESE_TERM_NAMES: Final = [
    "lichun", "yushui", "jingzhe", "chunfen", "qingming", "guyu",
    "lixia", "xiaoman", "mangzhong", "xiazhi", "xiaoshu", "dashu",
    "liqiu", "chushu", "bailu", "qiufen", "hanlu", "shuangjiang",
    "lidong", "xiaoxue", "daxue", "dongzhi", "xiaohan", "dahan",
]

# Chinese Solar Terms - 8 major terms
CHINESE_MAJOR_TERMS: Final = [
    "lichun", "chunfen", "lixia", "xiazhi",
    "liqiu", "qiufen", "lidong", "dongzhi",
]

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
ICON_SOLAR_LONGITUDE: Final = "mdi:sun-compass"
ICON_CROSS_QUARTER: Final = "mdi:calendar-star"
ICON_NEXT_PERIOD_CHANGE: Final = "mdi:calendar-arrow-right"
ICON_CHINESE_TERM: Final = "mdi:yin-yang"
ICON_NEXT_TERM_CHANGE: Final = "mdi:calendar-arrow-right"

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

# Cross-Quarter icon mapping
CROSS_QUARTER_ICONS: Final = {
    PERIOD_YULE: ICON_WINTER,
    PERIOD_IMBOLC: "mdi:candle",
    PERIOD_OSTARA: ICON_SPRING,
    PERIOD_BELTANE: "mdi:fire",
    PERIOD_LITHA: ICON_SUMMER,
    PERIOD_LUGHNASADH: "mdi:corn",
    PERIOD_MABON: ICON_AUTUMN,
    PERIOD_SAMHAIN: "mdi:ghost",
}
