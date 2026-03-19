"""Constants for NSW Fuel Check Integration."""

import datetime

DOMAIN = "nsw_tas_fuel_station"
ALL_FUEL_TYPES = {
    "E10-U91": "Ethanol 94 & Unleaded 91",
    "E10": "Ethanol 94",
    "U91": "Unleaded 91",
    "E85": "Ethanol 105",
    "P95-P98": "Premium Unleaded 95/98",
    "P95": "Premium 95",
    "P98": "Premium 98",
    "DL": "Diesel",
    "PDL": "Premium Diesel",
    "B20": "Biodiesel 20",
    "EV": "EV charge",
    "LPG": "LPG",
    "LNG": "LNG",
    "H2": "Hydrogen",
    "CNG": "CNG/NGV",
}
CHEAPEST_RESULTS_LIMIT = 5
CONF_AU_STATE = "au_state"
CONF_FUEL_TYPE = "fuel_type"
CONF_LOCATION = "location"
CONF_NICKNAME = "nickname"
CONF_RADIUS = "radius"
CONF_SELECTED_FUEL_TYPES = "selected_fuel_types"
CONF_SELECTED_STATIONS = "selected_station_codes"
DEFAULT_FUEL_TYPE = "E10-U91"  # Some fuel types in TAS return NSW stations!
DEFAULT_FUEL_TYPE_NON_E10 = "U91"
DEFAULT_NICKNAME = "Home"
DEFAULT_RADIUS_KM = 25  # km
DEFAULT_SCAN_INTERVAL = datetime.timedelta(
    minutes=720
)  # It can be days between price changes
E10_AVAILABLE_STATES: tuple[str, ...] = ("NSW",)
E10_CODE = "E10"
LAT_CAMERON_CORNER_BOUND = -28.99608
LON_CAMERON_CORNER_BOUND = 141.00180
LAT_SE_BOUND = -50
LON_SE_BOUND = 154
LAT_TAS_N_BOUND = -39
STATION_LIST_LIMIT = 35
PRICE_UNIT = "¢/L"
