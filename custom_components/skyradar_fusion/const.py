"""Constants for the SkyRadar Fusion integration."""

DOMAIN = "skyradar_fusion"
NAME = "SkyRadar Fusion"
VERSION = "2.0.1"

API_BASE_URL = "https://api.airplanes.live/v2"

CONF_TRACKING_MODE = "tracking_mode"
CONF_IDENTIFIER_TYPE = "identifier_type"
CONF_IDENTIFIER = "identifier"
CONF_RADIUS = "radius"
CONF_LATITUDE = "latitude"
CONF_LONGITUDE = "longitude"
CONF_ENABLE_FR24_ENRICHMENT = "enable_fr24_enrichment"
CONF_FR24_RADIUS = "fr24_radius"

CONF_FR24_COMMERCIAL = "fr24_commercial"
CONF_FR24_PRIVATE = "fr24_private"
CONF_FR24_HELICOPTER = "fr24_helicopter"
CONF_ADVANCED_ADSB_FILTER = "advanced_adsb_filter"

CONF_TRACKED_LIST = "tracked_list"
CONF_GLOBAL_EMERGENCY = "global_emergency"
CONF_GLOBAL_MILITARY = "global_military"

CONF_ENABLE_TRACKER = "enable_tracker"

MODE_SINGLE = "single_aircraft"
MODE_ZONE = "zone_radius"

DEFAULT_SCAN_INTERVAL = 10
PLATFORMS = ["sensor", "device_tracker", "text", "button"]
