# API
API_ENDPOINT = "https://data.opennem.org.au/v3/stats/au/NEM/{}/power/7d.json"
API_ENDPOINT_NEM = "https://data.opennem.org.au/v3/stats/au/NEM/power/7d.json"
API_ENDPOINT_WA = "https://data.opennem.org.au/v3/stats/au/WEM/power/7d.json"

# Config
CONF_REGION = "nem"
CONF_REGION_LIST = {
    "nem": "NEM",
    "nsw": "New South Wales",
    "qld": "Queensland",
    "sa": "South Australia",
    "tas": "Tasmania",
    "vic": "Victoria",
    "wa": "Western Australia",
}

# Defaults
DEFAULT_ICON = "mdi:transmission-tower"
DEFAULT_NAME = "OpenNEM"

# Misc
VERSION = "2022.01.2"
DOMAIN = "opennem"
PLATFORM = "sensor"
ATTRIBUTION = "Data provided by OpenNEM"
COORDINATOR = "coordinator"
PLATFORMS = ["sensor"]

# Data
DATA = {
    "bioenergy_biomass": ["Bioenergy (Biomass)", "", "", "", 0],
    "bioenergy_biogas": ["Bioenergy (Biogas)", "", "", "", 0],
    "coal_black": ["Black Coal", "", "", "", 0],
    "coal_brown": ["Brown Coal", "", "", "", 0],
    "distillate": ["Distillate", "", "", "", 0],
    "gas_ccgt": ["Gas (CCGT)", "", "", "", 0],
    "gas_ocgt": ["Gas (OCGT)", "", "", "", 0],
    "gas_recip": ["Gas (Recip)", "", "", "", 0],
    "gas_steam": ["Gas (Steam)", "", "", "", 0],
    "gas_wcmg": ["Gas (Waste)", "", "", "", 0],
    "hydro": ["Hydro", "", "", "", 0],
    "pumps": ["Pumps", "", "", "", 0],
    "solar_utility": ["Solar (Utility)", "", "", "", 0],
    "wind": ["Wind", "", "", "", 0],
    "battery_discharging": ["Battery (Discharging)", "", "", "", 0],
    "battery_charging": ["Battery (Charging)", "", "", "", 0],
    "exports": ["Exports", "", "", "", 0],
    "imports": ["Imports", "", "", "", 0],
    "solar_rooftop": ["Solar (Rooftop)", "", "", "", 0],
    "price": ["Price", "", "", "", 0],
    "demand": ["Demand", "", "", "", 0],
    "generation": ["Generation", "", "", "", 0],
    "temperature": ["Temperature", "", "", "", 0],
    "fossilfuel": ["Fossil Fuels", "", "", "", 0],
    "renewables": ["Renewables", "", "", "", 0],
}
