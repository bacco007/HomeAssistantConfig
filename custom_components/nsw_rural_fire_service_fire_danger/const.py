"""NSW Rural Fire Service - Fire Danger - Consts."""
from datetime import timedelta
from typing import Final

from homeassistant.const import Platform

CONF_DISTRICT_NAME: Final = "district_name"

DEFAULT_ATTRIBUTION: Final = "NSW Rural Fire Service"

DEFAULT_FORCE_UPDATE: Final = True
DEFAULT_METHOD: Final = "GET"
DEFAULT_NAME: Final = "Fire Danger"
DEFAULT_SCAN_INTERVAL: Final = timedelta(minutes=15)
DEFAULT_VERIFY_SSL: Final = True

DOMAIN: Final = "nsw_rural_fire_service_fire_danger"

SENSOR_ATTRIBUTES: Final = {
    # <XML Key>: [<Display Name>, <Conversion Function>]
    "RegionNumber": ["region_number", lambda x: int(x)],
    "Councils": ["councils", lambda x: x.split(";")],
    "DangerLevelToday": ["danger_level_today", lambda x: x.lower().capitalize()],
    "DangerLevelTomorrow": ["danger_level_tomorrow", lambda x: x.lower().capitalize()],
    "FireBanToday": ["fire_ban_today", lambda x: x == "Yes"],
    "FireBanTomorrow": ["fire_ban_tomorrow", lambda x: x == "Yes"],
}

BINARY_SENSOR_TYPES: Final = ["fire_ban_today", "fire_ban_tomorrow"]
SENSOR_TYPES: Final = ["danger_level_today", "danger_level_tomorrow"]
TYPES: Final = {
    "danger_level_today": "Danger Level Today",
    "danger_level_tomorrow": "Danger Level Tomorrow",
    "fire_ban_today": "Fire Ban Today",
    "fire_ban_tomorrow": "Fire Ban Tomorrow",
}

PLATFORMS: Final = [Platform.BINARY_SENSOR, Platform.SENSOR]

URL_DATA: Final = "http://www.rfs.nsw.gov.au/feeds/fdrToban.xml"
URL_SERVICE: Final = "http://www.rfs.nsw.gov.au/"

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

XML_DISTRICT: Final = "District"
XML_FIRE_DANGER_MAP: Final = "FireDangerMap"
XML_NAME: Final = "Name"
