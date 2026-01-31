"""Constants for the Moon Astro integration.

This module centralizes stable keys used by the coordinator and entities.
Keys must remain stable over time to avoid entity_id churn in Home Assistant.
"""

from __future__ import annotations

# Domain and basic config
DOMAIN = "moon_astro"
MANUFACTURER = "Moon Astro"
MODEL = "Skyfield DE440"
NAME = "Moon Astro"
DEFAULT_SCAN_INTERVAL = 300  # seconds
DEFAULT_USE_HA_TZ = True
DEFAULT_HIGH_PRECISION = False
DEFAULT_EVENTS_REFRESH_FALLBACK = 86400  # seconds (24h)
DEFAULT_EVENTS_STARTUP_DELAY = 180  # seconds
CONF_SCAN_INTERVAL = "scan_interval"
CONF_LAT = "latitude"
CONF_LON = "longitude"
CONF_ALT = "elevation"
CONF_USE_HA_TZ = "use_ha_timezone"
CONF_HIGH_PRECISION = "high_precision"
CONF_EVENTS_REFRESH_FALLBACK = "events_refresh_fallback"

# Precision computation parameters
HIGH_PRECISION_STEP_HOURS = 1.0
HIGH_PRECISION_BRACKET_EXPAND = 2
HIGH_PRECISION_BRACKETS_TO_REFINE = 6
STANDARD_PRECISION_STEP_HOURS = 2.0
STANDARD_PRECISION_BRACKET_EXPAND = 1

# Files and external resources
CACHE_DIR_NAME = ".skyfield"
DE440_FILE = "de440.bsp"

# Internal hass.data keys used by the integration to store entry runtime objects.
DATA_COORDINATOR = "coordinator"
DATA_EVENTS_COORDINATOR = "events_coordinator"

# Moon phase codes from Skyfield almanac (integers)
DARK_MOON = 0
FIRST_QUARTER = 1
FULL_MOON = 2
LAST_QUARTER = 3

# Data keys exposed by the coordinator
KEY_PHASE = "phase"
KEY_AZIMUTH = "azimuth"
KEY_ELEVATION = "elevation"
KEY_ILLUMINATION = "illumination"
KEY_DISTANCE = "distance"
KEY_PARALLAX = "parallax"

# Topocentric ecliptic coordinates (apparent, ecliptic of date)
KEY_ECLIPTIC_LONGITUDE_TOPOCENTRIC = "ecliptic_longitude_topocentric"
KEY_ECLIPTIC_LATITUDE_TOPOCENTRIC = "ecliptic_latitude_topocentric"

# Geocentric ecliptic coordinates (apparent, ecliptic of date)
KEY_ECLIPTIC_LONGITUDE_GEOCENTRIC = "ecliptic_longitude_geocentric"
KEY_ECLIPTIC_LATITUDE_GEOCENTRIC = "ecliptic_latitude_geocentric"

# Ecliptic coordinates at lunations (geocentric, true-of-date)
KEY_ECLIPTIC_LONGITUDE_NEXT_FULL_MOON = "ecliptic_longitude_next_full_moon"
KEY_ECLIPTIC_LATITUDE_NEXT_FULL_MOON = "ecliptic_latitude_next_full_moon"
KEY_ECLIPTIC_LONGITUDE_NEXT_NEW_MOON = "ecliptic_longitude_next_new_moon"
KEY_ECLIPTIC_LATITUDE_NEXT_NEW_MOON = "ecliptic_latitude_next_new_moon"
KEY_ECLIPTIC_LONGITUDE_PREVIOUS_NEW_MOON = "ecliptic_longitude_previous_new_moon"
KEY_ECLIPTIC_LATITUDE_PREVIOUS_NEW_MOON = "ecliptic_latitude_previous_new_moon"
KEY_ECLIPTIC_LONGITUDE_PREVIOUS_FULL_MOON = "ecliptic_longitude_previous_full_moon"
KEY_ECLIPTIC_LATITUDE_PREVIOUS_FULL_MOON = "ecliptic_latitude_previous_full_moon"

# Next event timestamps (ISO strings localized, converted to UTC datetime by sensors)
KEY_NEXT_RISE = "next_rise"
KEY_NEXT_SET = "next_set"
KEY_NEXT_APOGEE = "next_apogee"
KEY_NEXT_PERIGEE = "next_perigee"
KEY_NEXT_FIRST_QUARTER = "next_first_quarter"
KEY_NEXT_FULL_MOON = "next_full_moon"
KEY_NEXT_LAST_QUARTER = "next_last_quarter"
KEY_NEXT_NEW_MOON = "next_new_moon"

# Previous event timestamps (ISO strings localized, converted to UTC datetime by sensors)
KEY_PREVIOUS_RISE = "previous_rise"
KEY_PREVIOUS_SET = "previous_set"
KEY_PREVIOUS_APOGEE = "previous_apogee"
KEY_PREVIOUS_PERIGEE = "previous_perigee"
KEY_PREVIOUS_FIRST_QUARTER = "previous_first_quarter"
KEY_PREVIOUS_FULL_MOON = "previous_full_moon"
KEY_PREVIOUS_LAST_QUARTER = "previous_last_quarter"
KEY_PREVIOUS_NEW_MOON = "previous_new_moon"

# Lunation names (strings)
KEY_NEXT_FULL_MOON_NAME = "next_full_moon_name"
KEY_NEXT_FULL_MOON_ALT_NAMES = "next_full_moon_alt_names"
KEY_PREVIOUS_FULL_MOON_NAME = "previous_full_moon_name"
KEY_PREVIOUS_FULL_MOON_ALT_NAMES = "previous_full_moon_alt_names"

# Additional flags
KEY_ABOVE_HORIZON = "above_horizon"
KEY_WAXING = "waxing"

# Zodiac sign sensors (strings)
KEY_ZODIAC_SIGN_CURRENT_MOON = "zodiac_sign_current_moon"
KEY_ZODIAC_SIGN_NEXT_FULL_MOON = "zodiac_sign_next_full_moon"
KEY_ZODIAC_SIGN_NEXT_NEW_MOON = "zodiac_sign_next_new_moon"
KEY_ZODIAC_SIGN_PREVIOUS_FULL_MOON = "zodiac_sign_previous_full_moon"
KEY_ZODIAC_SIGN_PREVIOUS_NEW_MOON = "zodiac_sign_previous_new_moon"

# Zodiac icons for lunations (MDI icon names as strings)
KEY_ZODIAC_ICON_CURRENT_MOON = "zodiac_icon_current_moon"
KEY_ZODIAC_ICON_NEXT_FULL_MOON = "zodiac_icon_next_full_moon"
KEY_ZODIAC_ICON_NEXT_NEW_MOON = "zodiac_icon_next_new_moon"
KEY_ZODIAC_ICON_PREVIOUS_FULL_MOON = "zodiac_icon_previous_full_moon"
KEY_ZODIAC_ICON_PREVIOUS_NEW_MOON = "zodiac_icon_previous_new_moon"

# Zodiac degree sensors (floats, degrees within sign 0..30)
KEY_ZODIAC_DEGREE_CURRENT_MOON = "zodiac_degree_current_moon"
KEY_ZODIAC_DEGREE_NEXT_FULL_MOON = "zodiac_degree_next_full_moon"
KEY_ZODIAC_DEGREE_NEXT_NEW_MOON = "zodiac_degree_next_new_moon"
KEY_ZODIAC_DEGREE_PREVIOUS_FULL_MOON = "zodiac_degree_previous_full_moon"
KEY_ZODIAC_DEGREE_PREVIOUS_NEW_MOON = "zodiac_degree_previous_new_moon"

# Suggested display precision defaults (used in sensor.py)
PRECISION_AZIMUTH = 2
PRECISION_ELEVATION = 2
PRECISION_ILLUMINATION = 1
PRECISION_DISTANCE = 0
PRECISION_PARALLAX = 2
PRECISION_ECL_TOPO = 3
PRECISION_ECL_GEO = 3
PRECISION_ZODIAC_DEGREE = 2

# Nominal phase thresholds/tolerances
NEW_MOON_STRICT_PCT = 0.8
FULL_MOON_STRICT_PCT = 99.5
QUARTER_TOL_PCT = 3.0
