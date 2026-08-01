"""Constants for ADSB Aircraft Tracker integration."""

DOMAIN = "adsb_aircraft_tracker"

# Configuration keys
CONF_ADSB_HOST = "adsb_host"
CONF_ADSB_PORT = "adsb_port"
CONF_UPDATE_INTERVAL = "update_interval"
CONF_DISTANCE_LIMIT = "distance_limit"
CONF_NOTIFICATION_DEVICE = "notification_device"
CONF_EXTERNAL_URL = "external_url"
CONF_MILITARY_NOTIFICATIONS = "military_notifications"
CONF_CLOSE_AIRCRAFT_ENABLED = "close_aircraft_enabled"
CONF_CLOSE_AIRCRAFT_DISTANCE = "close_aircraft_distance"
CONF_CLOSE_AIRCRAFT_ALTITUDE = "close_aircraft_altitude"
CONF_EMERGENCY_NOTIFICATIONS = "emergency_notifications"

# Default values
DEFAULT_ADSB_PORT = 8085
DEFAULT_UPDATE_INTERVAL = 10
DEFAULT_DISTANCE_LIMIT = 0
DEFAULT_MILITARY_NOTIFICATIONS = True
DEFAULT_CLOSE_AIRCRAFT_ENABLED = True
DEFAULT_CLOSE_AIRCRAFT_DISTANCE = 2.0
DEFAULT_CLOSE_AIRCRAFT_ALTITUDE = 3000
DEFAULT_EMERGENCY_NOTIFICATIONS = True

# ICAO 3-letter airline codes to spoken names for TTS
AIRLINE_CODE_MAP = {
    "AAL": "American",
    "AAY": "Allegiant",
    "ACA": "Air Canada",
    "AFR": "Air France",
    "AIC": "Air India",
    "AMX": "Aeromexico",
    "ASA": "Alaska",
    "BAW": "British Airways",
    "CPA": "Cathay Pacific",
    "DAL": "Delta",
    "DLH": "Lufthansa",
    "EDV": "Endeavor",
    "ENY": "Envoy",
    "FDX": "FedEx",
    "FFT": "Frontier",
    "GJS": "GoJet",
    "HAL": "Hawaiian",
    "JBU": "JetBlue",
    "JIA": "PSA Airlines",
    "KAL": "Korean Air",
    "NKS": "Spirit",
    "PDT": "Piedmont",
    "QFA": "Qantas",
    "RPA": "Republic",
    "SKW": "SkyWest",
    "SWA": "Southwest",
    "THY": "Turkish",
    "UAL": "United",
    "UPS": "UPS",
    "VOI": "Volaris",
    "WJA": "WestJet",
}

# Aviation abbreviations to keep uppercase during title-casing
AVIATION_ABBREVIATIONS = {
    "ERJ", "CRJ", "ATR", "EMB", "MD", "DC", "DHC",
    "BAE", "RJ", "SF", "PC", "TBM", "SR",
    "E75", "E70", "E90", "E45",
    "II", "III", "IV", "MAX", "ER", "LR",
}

# Maps spoken aircraft type words to filter criteria
# "engine_type" values come from the ICAO types database field
# "category_prefix" matches the first char of the ICAO aircraft_type code
AIRCRAFT_TYPE_KEYWORDS = {
    "helicopter": {
        "terms": ["helicopter", "helicopters", "chopper", "choppers", "heli", "helis", "rotorcraft"],
        "category_prefix": "H",
        "description_keywords": ["HELICOPTER"],
    },
    "jet": {
        "terms": ["jet", "jets", "airliner", "airliners"],
        "engine_type": "Jet",
        "description_keywords": [],
    },
    "turboprop": {
        "terms": ["turboprop", "turboprops", "prop", "props", "propeller"],
        "engine_type": "Turboprop",
        "description_keywords": [],
    },
    "piston": {
        "terms": ["piston", "cessna", "small plane", "small planes", "light aircraft"],
        "engine_type": "Piston",
        "description_keywords": ["CESSNA", "PIPER", "BEECH", "CIRRUS", "MOONEY"],
    },
}
