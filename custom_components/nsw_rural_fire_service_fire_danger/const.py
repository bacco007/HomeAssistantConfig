"""NSW Rural Fire Service - Fire Danger - Consts."""
from datetime import timedelta

CONF_DISTRICT_NAME = "district_name"

DEFAULT_ATTRIBUTION = "NSW Rural Fire Service"

DEFAULT_FORCE_UPDATE = True
DEFAULT_METHOD = "GET"
DEFAULT_NAME = "Fire Danger"
DEFAULT_SCAN_INTERVAL = timedelta(minutes=15)
DEFAULT_VERIFY_SSL = True

DOMAIN = "nsw_rural_fire_service_fire_danger"

SENSOR_ATTRIBUTES = {
    # <XML Key>: [<Display Name>, <Conversion Function>]
    "RegionNumber": ["region_number", lambda x: int(x)],
    "Councils": ["councils", lambda x: x.split(";")],
    "DangerLevelToday": ["danger_level_today", lambda x: x.lower().capitalize()],
    "DangerLevelTomorrow": ["danger_level_tomorrow", lambda x: x.lower().capitalize()],
    "FireBanToday": ["fire_ban_today", lambda x: x == "Yes"],
    "FireBanTomorrow": ["fire_ban_tomorrow", lambda x: x == "Yes"],
}

BINARY_SENSOR_TYPES = ["fire_ban_today", "fire_ban_tomorrow"]
SENSOR_TYPES = ["danger_level_today", "danger_level_tomorrow"]
TYPES = {
    "danger_level_today": "Danger Level Today",
    "danger_level_tomorrow": "Danger Level Tomorrow",
    "fire_ban_today": "Fire Ban Today",
    "fire_ban_tomorrow": "Fire Ban Tomorrow",
}

COMPONENTS = ["binary_sensor", "sensor"]

URL = "http://www.rfs.nsw.gov.au/feeds/fdrToban.xml"

VALID_DISTRICT_NAMES = [
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

XML_DISTRICT = "District"
XML_FIRE_DANGER_MAP = "FireDangerMap"
XML_NAME = "Name"
