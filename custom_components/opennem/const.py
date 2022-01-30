# API
API_ENDPOINT = "https://data.opennem.org.au/v3/stats/au/NEM/{}/power/7d.json"
API_ENDPOINT_NEM = "https://data.opennem.org.au/v3/stats/au/NEM/power/7d.json"
API_ENDPOINT_WA = "https://data.opennem.org.au/v3/stats/au/WEM/power/7d.json"
API_ENDPOINT_AU = "https://data.opennem.org.au/v3/stats/au/AU/power/7d.json"

# Config
CONF_REGION = "nem"
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

# Misc
VERSION = "2022.01.3"
DOMAIN = "opennem"
PLATFORM = "sensor"
ATTRIBUTION = "Data provided by OpenNEM"
COORDINATOR = "coordinator"
PLATFORMS = ["sensor"]
