"""NSW Rural Fire Service - Fire Danger - Consts."""
from datetime import timedelta
from typing import Final

from homeassistant.const import Platform

CONF_CONVERT_NO_RATING: Final = "convert_no_rating"
CONF_DISTRICT_NAME: Final = "district_name"
CONF_DATA_FEED: Final = "data_feed"

DEFAULT_ATTRIBUTION: Final = "NSW Rural Fire Service"

DEFAULT_DATA_FEED: Final = "standard"

DEFAULT_CONVERT_NO_RATING: Final = False
DEFAULT_ENCODING: Final = "utf-8"
DEFAULT_FORCE_UPDATE: Final = True
DEFAULT_METHOD: Final = "GET"
DEFAULT_NAME_PREFIX: Final = "Fire danger"
DEFAULT_SCAN_INTERVAL: Final = timedelta(minutes=15)
DEFAULT_VERIFY_SSL: Final = True

DOMAIN: Final = "nsw_rural_fire_service_fire_danger"

XML_DISTRICT: Final = "District"
XML_FIRE_DANGER_MAP: Final = "FireDangerMap"
XML_NAME: Final = "Name"
XML_SENSOR_ATTRIBUTES: Final = {
    # <XML Key>: [<Display Name>, <Conversion Function>]
    "RegionNumber": ["region_number", lambda x, y: int(x)],
    "Councils": ["councils", lambda x, y: [z.strip() for z in x.split(";")]],
    "DangerLevelToday": [
        "danger_level_today",
        lambda x, y: x.lower().capitalize() if x != "NONE" or not y else "No Rating",
    ],
    "DangerLevelTomorrow": [
        "danger_level_tomorrow",
        lambda x, y: x.lower().capitalize() if x != "NONE" or not y else "No Rating",
    ],
    "FireBanToday": ["fire_ban_today", lambda x, y: x == "Yes"],
    "FireBanTomorrow": ["fire_ban_tomorrow", lambda x, y: x == "Yes"],
}

JSON_AREA_NAME = "areaName"
JSON_FIRE_WEATHER_AREA_RATINGS = "fireWeatherAreaRatings"
JSON_SENSOR_ATTRIBUTES: Final = {
    # <JSON Key>: [<Display Name>, <Conversion Function>]
    "areaId": ["region_number", lambda x, y: int(x)],
    "areaCouncils": ["councils", lambda x, y: [z.strip() for z in x.split(";")]],
    "ratingToday": [
        "danger_level_today",
        lambda x, y: x.lower().capitalize() if x != "NONE" or not y else "No Rating",
    ],
    "ratingTomorrow": [
        "danger_level_tomorrow",
        lambda x, y: x.lower().capitalize() if x != "NONE" or not y else "No Rating",
    ],
    "ratingDay3": [
        "danger_level_day3",
        lambda x, y: x.lower().capitalize() if x != "NONE" or not y else "No Rating",
    ],
    "ratingDay4": [
        "danger_level_day4",
        lambda x, y: x.lower().capitalize() if x != "NONE" or not y else "No Rating",
    ],
    "tobanToday": ["fire_ban_today", lambda x, y: x == "Yes"],
    "tobanTomorrow": ["fire_ban_tomorrow", lambda x, y: x == "Yes"],
    "tobanDay3": ["fire_ban_day3", lambda x, y: x == "Yes"],
    "tobanDay4": ["fire_ban_day4", lambda x, y: x == "Yes"],
}

BINARY_SENSOR_TYPES_STANDARD: Final = ["fire_ban_today", "fire_ban_tomorrow"]
BINARY_SENSOR_TYPES_EXTENDED: Final = BINARY_SENSOR_TYPES_STANDARD + [
    "fire_ban_day3",
    "fire_ban_day4",
]
BINARY_SENSOR_TYPES: Final = {
    "standard": BINARY_SENSOR_TYPES_STANDARD,
    "extended": BINARY_SENSOR_TYPES_EXTENDED,
}

SENSOR_TYPES_STANDARD: Final = ["danger_level_today", "danger_level_tomorrow"]
SENSOR_TYPES_EXTENDED: Final = SENSOR_TYPES_STANDARD + [
    "danger_level_day3",
    "danger_level_day4",
]
SENSOR_TYPES: Final = {
    "standard": SENSOR_TYPES_STANDARD,
    "extended": SENSOR_TYPES_EXTENDED,
}

TYPES: Final = {
    "danger_level_today": "Danger level today",
    "danger_level_tomorrow": "Danger level tomorrow",
    "danger_level_day3": "Danger level day 3",
    "danger_level_day4": "Danger level day 4",
    "fire_ban_today": "Fire ban today",
    "fire_ban_tomorrow": "Fire ban tomorrow",
    "fire_ban_day3": "Fire ban day 3",
    "fire_ban_day4": "Fire ban day 4",
}

PLATFORMS: Final = [Platform.BINARY_SENSOR, Platform.SENSOR]

COORDINATOR_TYPES = {"standard": "", "extended": ""}

URL_DATA: Final = {
    "standard": "http://www.rfs.nsw.gov.au/feeds/fdrToban.xml",
    "extended": "https://www.rfs.nsw.gov.au/_designs/xml/fire-danger-ratings/fire-danger-ratings-v2",
}

URL_SERVICE: Final = "http://www.rfs.nsw.gov.au/"

VALID_DATA_FEEDS: Final = ["standard", "extended"]

VALID_DISTRICT_NAMES: Final = [
    "Far North Coast",
    "North Coast",
    "Greater Hunter",
    "Greater Sydney Region",
    "Illawarra/Shoalhaven",
    "Far South Coast",
    "Monaro Alpine",
    "ACT",
    "Southern Ranges",
    "Central Ranges",
    "New England",
    "Northern Slopes",
    "North Western",
    "Upper Central West Plains",
    "Lower Central West Plains",
    "Southern Slopes",
    "Eastern Riverina",
    "Southern Riverina",
    "Northern Riverina",
    "South Western",
    "Far Western",
]
