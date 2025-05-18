""" OpenNEM Constants"""
# API
API_ENDPOINT = "https://data.openelectricity.org.au/v3/stats/au/NEM/{}/power/7d.json"
API_ENDPOINT_NEM = "https://data.openelectricity.org.au/v3/stats/au/NEM/power/7d.json"
API_ENDPOINT_WA = "https://data.openelectricity.org.au/v3/stats/au/WEM/power/7d.json"
API_ENDPOINT_AU = "https://data.openelectricity.org.au/v3/stats/au/AU/power/7d.json"
API_ENDPOINT_EM = "https://api.opennem.org.au/stats/emissionfactor/network/NEM"
API_ENDPOINT_FLOW = "https://api.opennem.org.au/stats/flow/network/NEM"

# Config
CONF_REGION = "region"
CONF_REGION_DEFAULT = "nem"
CONF_REGION_LIST = {
    "au": "All Regions",
    "nem": "NEM",
    "nsw": "New South Wales",
    "qld": "Queensland",
    "sa": "South Australia",
    "tas": "Tasmania",
    "vic": "Victoria",
    "wa": "Western Australia",
}
CONF_REGION_SIMP = ["au", "nem", "nsw", "qld", "sa", "tas", "vic", "wa"]

# Defaults
DEFAULT_ICON = "mdi:transmission-tower"
DEFAULT_NAME = "OpenNEM"
DEFAULT_FORCE_UPDATE = True

# Misc
VERSION = "2023.09.1"
DOMAIN = "opennem"
PLATFORM = "sensor"
ATTRIBUTION = "Data provided by OpenNEM"
COORDINATOR = "coordinator"
PLATFORMS = ["sensor"]
DEVICE_CLASS = "connectivity"

# Values
DEFAULT_VALUES = {
    "bioenergy_biomass": 0,
    "bioenergy_biogas": 0,
    "coal_black": 0,
    "coal_brown": 0,
    "distillate": 0,
    "gas_ccgt": 0,
    "gas_ocgt": 0,
    "gas_recip": 0,
    "gas_steam": 0,
    "gas_wcmg": 0,
    "hydro": 0,
    "pumps": 0,
    "solar_utility": 0,
    "solar_rooftop": 0,
    "wind": 0,
    "battery_discharging": 0,
    "battery_charging": 0,
    "exports": 0,
    "imports": 0,
    "price": 0,
    "demand": 0,
    "generation": 0,
    "temperature": 0,
    "fossilfuel": 0,
    "renewables": 0,
    "flow_NSW": 0,
    "flow_QLD": 0,
    "flow_SA": 0,
    "flow_TAS": 0,
    "flow_VIC": 0,
    "last_update": None,
}
