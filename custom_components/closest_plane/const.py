"""Constants for the Closest Plane integration."""

from __future__ import annotations

DOMAIN = "closest_plane"
PLATFORMS: list[str] = ["sensor"]

CONF_LATITUDE = "latitude"
CONF_LONGITUDE = "longitude"
CONF_RADIUS_KM = "radius_km"
CONF_REFRESH_MINUTES = "refresh_minutes"
CONF_OPENSKY_CLIENT_ID = "opensky_client_id"
CONF_OPENSKY_CLIENT_SECRET = "opensky_client_secret"
CONF_AERODATABOX_API_KEY = "aerodatabox_api_key"
CONF_AVIATIONSTACK_API_KEY = "aviationstack_api_key"
CONF_CACHE_DIR = "cache_dir"

DEFAULT_RADIUS_KM = 180
DEFAULT_REFRESH_MINUTES = 2

OPENSKY_API = "https://opensky-network.org/api"
OPENSKY_TOKEN_URL = (
    "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"
)
ADSBDB_API = "https://api.adsbdb.com/v0"
AERODATABOX_API = "https://aerodatabox.p.rapidapi.com"
AVIATIONSTACK_API = "https://api.aviationstack.com/v1"

AIRLINES: dict[str, dict] = {
    "SAS": {"name": "Scandinavian Airlines", "iata": "SK"},
    "DLH": {"name": "Lufthansa", "iata": "LH"},
    "EWG": {"name": "Eurowings", "iata": "EW"},
    "RYR": {"name": "Ryanair", "iata": "FR"},
    "EZY": {"name": "easyJet", "iata": "U2"},
    "BAW": {"name": "British Airways", "iata": "BA"},
    "KLM": {"name": "KLM", "iata": "KL"},
    "AFR": {"name": "Air France", "iata": "AF"},
    "SWR": {"name": "SWISS", "iata": "LX"},
    "UAE": {"name": "Emirates", "iata": "EK"},
    "QTR": {"name": "Qatar Airways", "iata": "QR"},
    "THY": {"name": "Turkish Airlines", "iata": "TK"},
    "AAL": {"name": "American Airlines", "iata": "AA"},
    "DAL": {"name": "Delta Air Lines", "iata": "DL"},
    "UAL": {"name": "United Airlines", "iata": "UA"},
    "CFG": {"name": "Condor", "iata": "DE"},
    "WZZ": {"name": "Wizz Air", "iata": "W6"},
    "WUK": {"name": "Wizz Air UK", "iata": "W9"},
    "FIN": {"name": "Finnair", "iata": "AY"},
    "IBE": {"name": "Iberia", "iata": "IB"},
    "VLG": {"name": "Vueling", "iata": "VY"},
    "EXS": {"name": "Jet2.com", "iata": "LS"},
    "TAP": {"name": "TAP Air Portugal", "iata": "TP"},
    "NAX": {"name": "Norwegian Air Shuttle", "iata": "DY"},
    "NSZ": {"name": "Norwegian Air Sweden", "iata": "D8"},
    "TUI": {"name": "TUI Airways", "iata": "BY"},
    "TOM": {"name": "TUI Airways", "iata": "BY"},
    "TRA": {"name": "Transavia", "iata": "HV"},
    "TVF": {"name": "Transavia France", "iata": "TO"},
    "AUA": {"name": "Austrian Airlines", "iata": "OS"},
    "BEL": {"name": "Brussels Airlines", "iata": "SN"},
    "LOT": {"name": "LOT Polish Airlines", "iata": "LO"},
    "EIN": {"name": "Aer Lingus", "iata": "EI"},
    "ICE": {"name": "Icelandair", "iata": "FI"},
    "MSR": {"name": "EgyptAir", "iata": "MS"},
    "FDX": {"name": "FedEx Express", "iata": "FX"},
    "UPS": {"name": "UPS Airlines", "iata": "5X"},
    "BFD": {"name": "Bertelsmann Media Jet", "iata": None},
    # German/Austrian/Swiss cargo & charter
    "GEC": {"name": "Lufthansa Cargo", "iata": "LH"},
    "AHO": {"name": "Air Hamburg", "iata": None},
    "HHN": {"name": "Hahn Air", "iata": "HR"},
    "SCX": {"name": "Sun Country Airlines", "iata": "SY"},
    # Rescue / EMS helicopter operators
    "CHX": {"name": "DRF Luftrettung (Christoph)", "iata": None},
    "ADR": {"name": "ADAC Luftrettung", "iata": None},
    "RHB": {"name": "ÖAMTC Flugrettung", "iata": None},
    "HEM": {"name": "Heli-Medico (Swiss Air-Rescue)", "iata": None},
    "REA": {"name": "Rega (Swiss Air-Rescue)", "iata": None},
    "HTM": {"name": "HTM Helicopters (Netherlands)", "iata": None},
    "NHV": {"name": "NHV (North Sea Helicopters)", "iata": None},
    "SHT": {"name": "Bristow Helicopters", "iata": None},
    # German Police / Federal agencies
    "DPO": {"name": "German Federal Police Aviation", "iata": None},
    "BGS": {"name": "German Federal Police", "iata": None},
}

IATA_TO_ICAO: dict[str, str] = {v["iata"]: k for k, v in AIRLINES.items() if v.get("iata")}

AIRCRAFT_CATEGORY: dict[int, str] = {
    0: "No category information",
    1: "No ADS-B emitter category",
    2: "Light",
    3: "Small",
    4: "Large",
    5: "High vortex large",
    6: "Heavy",
    7: "High performance",
    8: "Rotorcraft",
    9: "Glider / sailplane",
    10: "Lighter-than-air",
    11: "Parachutist / skydiver",
    12: "Ultralight / hang-glider / paraglider",
    13: "Reserved",
    14: "Unmanned aerial vehicle",
    15: "Space / trans-atmospheric vehicle",
    16: "Surface vehicle - emergency",
    17: "Surface vehicle - service",
    18: "Point obstacle",
}

POSITION_SOURCE: dict[int, str] = {
    0: "ADS-B",
    1: "ASTERIX",
    2: "MLAT",
    3: "FLARM",
}
