"""Constants for the Moon Phase integration."""

DOMAIN = "lunar_phase"

DEFAULT_SCAN_INTERVAL = 60

CONF_CITY = "city"


PHASE_FIRST_QUARTER = "first_quarter"
PHASE_FULL_MOON = "full_moon"
PHASE_LAST_QUARTER = "last_quarter"
PHASE_NEW_MOON = "new_moon"
PHASE_WANING_CRESCENT = "waning_crescent"
PHASE_WANING_GIBBOUS = "waning_gibbous"
PHASE_WAXING_CRESCENT = "waxing_crescent"
PHASE_WAXING_GIBBOUS = "waxing_gibbous"

STATE_ATTR_AGE = "age"
STATE_ATTR_DISTANCE_KM = "distance_km"
STATE_ATTR_DISTANCE_MI = "distance_mi"
STATE_ATTR_PHASE = "phase"
STATE_ATTR_ILLUMINATION_FRACTION = "illumination_fraction"
STATE_ATTR_NEXT_RISE = "moonrise"
STATE_ATTR_NEXT_SET = "moonset"
STATE_ATTR_NEXT_FULL = "next_full_moon"
STATE_ATTR_NEXT_NEW = "next_new_moon"
