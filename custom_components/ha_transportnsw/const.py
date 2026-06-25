from pathlib import Path
import json

"""Constants for our integration."""

DOMAIN = "ha_transportnsw"

DEFAULT_SCAN_INTERVAL = 120
MIN_SCAN_INTERVAL = 30
MAX_TRIP_WAIT_TIME = 60
MAX_MAX_CHANGES = 5

# Optional config entry settings
CONF_REQUEST_LOCATION_UPDATE = 'request_location_update'

# Mandatory subentry data
CONF_ORIGIN_TYPE = 'origin_type'  # New
CONF_ORIGIN_ID = 'origin_id'
CONF_ORIGIN_NAME = 'origin_name'
CONF_DESTINATION_ID = 'destination_id'
CONF_DESTINATION_NAME = 'destination_name'
CONF_TRIP_WAIT_TIME = 'trip_wait_time'
CONF_CREATE_REVERSE_TRIP = 'create_reverse_trip'
DEFAULT_CREATE_REVERSE_TRIP = False

# Optional subentry settings
CONF_RETURN_INFO = 'return_info'
CONF_ORIGIN_TRANSPORT_TYPE = 'origin_transport_type'
CONF_DESTINATION_TRANSPORT_TYPE = 'destination_transport_type'
CONF_ROUTE_FILTER = 'route_filter'
CONF_MAX_CHANGES = 'max_changes'
CONF_ALERT_SEVERITY = 'alert_severity'
CONF_ALERT_TYPES = 'alert_types'
CONF_TRIPS_TO_CREATE = 'trips_to_create'

# Sensor key names
CONF_DUE_SENSOR = 'due'
CONF_CHANGES_SENSOR = 'changes'
CONF_DELAY_SENSOR = 'delay'
CONF_DURATION_SENSOR = 'duration'
CONF_ALERTS_SENSOR = 'alerts'
CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR = 'departure_time'
CONF_LAST_LEG_ARRIVAL_TIME_SENSOR = 'arrival_time'
CONF_ORIGIN_NAME_SENSOR = 'origin_name'
CONF_ORIGIN_DETAIL_SENSOR = 'origin_detail'
CONF_FIRST_LEG_LINE_NAME_SENSOR = 'origin_line_name'
CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR = 'origin_line_name_short'
CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR = 'origin_transport_type'
CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR = 'origin_transport_name'
CONF_FIRST_LEG_OCCUPANCY_SENSOR = 'origin_occupancy'
CONF_FIRST_LEG_OCCUPANCY_DETAIL_SENSOR = 'origin_occupancy_detail'
CONF_FIRST_LEG_TRAIN_SET_SENSOR = 'origin_train_set'
CONF_DESTINATION_NAME_SENSOR = 'destination_name'
CONF_DESTINATION_DETAIL_SENSOR = 'destination_detail'
CONF_LAST_LEG_LINE_NAME_SENSOR = 'destination_line_name'
CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR = 'destination_line_name_short'
CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR = 'destination_transport_type'
CONF_LAST_LEG_TRANSPORT_NAME_SENSOR = 'destination_transport_name'
CONF_LAST_LEG_OCCUPANCY_SENSOR = 'destination_occupancy'
CONF_LAST_LEG_OCCUPANCY_DETAIL_SENSOR = 'destination_occupancy_detail'
CONF_LAST_LEG_TRAIN_SET_SENSOR = 'destination_train_set'
CONF_INCLUDE_REALTIME_LOCATION = 'include_realtime_location'
CONF_SENSOR_CREATION = 'sensor_creation'
CONF_ORIGIN_END_OF_LINE = 'origin_end_of_line'
CONF_DESTINATION_END_OF_LINE = 'destination_end_of_line'

# Sensor friendly names
CONF_DUE_FRIENDLY = 'due'
CONF_CHANGES_FRIENDLY = 'changes'
CONF_DELAY_FRIENDLY = 'delay'
CONF_DURATION_FRIENDLY = 'duration'
CONF_ALERTS_FRIENDLY = 'alerts'
CONF_FIRST_LEG_DEPARTURE_TIME_FRIENDLY = 'departure from origin'
CONF_LAST_LEG_ARRIVAL_TIME_FRIENDLY = 'arrival at destination'
CONF_ORIGIN_NAME_FRIENDLY = 'origin name'
CONF_ORIGIN_DETAIL_FRIENDLY = 'origin detail'
CONF_FIRST_LEG_LINE_NAME_FRIENDLY = 'first leg line name'
CONF_FIRST_LEG_LINE_NAME_SHORT_FRIENDLY = 'first leg line name (short)'
CONF_FIRST_LEG_OCCUPANCY_FRIENDLY = 'first leg occupancy'
CONF_FIRST_LEG_OCCUPANCY_DETAIL_FRIENDLY = 'first leg occupancy detail'
CONF_FIRST_LEG_TRAIN_SET_FRIENDLY = 'first leg vehicle set'
CONF_FIRST_LEG_TRANSPORT_TYPE_FRIENDLY = 'first leg transport type'
CONF_FIRST_LEG_TRANSPORT_NAME_FRIENDLY = 'first leg transport name'
CONF_DESTINATION_NAME_FRIENDLY = 'destination name'
CONF_DESTINATION_DETAIL_FRIENDLY = 'destination detail'
CONF_LAST_LEG_LINE_NAME_FRIENDLY = 'last leg line name'
CONF_LAST_LEG_LINE_NAME_SHORT_FRIENDLY = 'last leg line name (short)'
CONF_LAST_LEG_OCCUPANCY_FRIENDLY = 'last leg occupancy'
CONF_LAST_LEG_OCCUPANCY_DETAIL_FRIENDLY = 'last leg occupancy detail'
CONF_LAST_LEG_TRAIN_SET_FRIENDLY = 'last leg vehicle set'
CONF_LAST_LEG_TRANSPORT_TYPE_FRIENDLY = 'last leg transport type'
CONF_LAST_LEG_TRANSPORT_NAME_FRIENDLY = 'last leg transport name'

# Device tracker options
CONF_FIRST_LEG_DEVICE_TRACKER = 'first_leg_device_tracker'
CONF_LAST_LEG_DEVICE_TRACKER = 'last_leg_device_tracker'
CONF_ORIGIN_DEVICE_TRACKER = 'origin_device_tracker'
CONF_DESTINATION_DEVICE_TRACKER = 'destination_device_tracker'

# Defaults
DEFAULT_REQUEST_LOCATION_UPDATE = False

DEFAULT_FIRST_LEG_DEVICE_TRACKER = 'never'
DEFAULT_LAST_LEG_DEVICE_TRACKER = 'never'
DEFAULT_ORIGIN_DEVICE_TRACKER = 'if_device_tracker_journey'
DEFAULT_DESTINATION_DEVICE_TRACKER = 'never'

ORIGIN_TRANSPORT_TYPE_LIST = ['Train', 'Metro', 'Light rail', 'Bus', 'Coach', 'Ferry', 'School bus', 'Walk']
DESTINATION_TRANSPORT_TYPE_LIST = ['Train', 'Metro', 'Light rail', 'Bus', 'Coach', 'Ferry', 'School bus', 'Walk']

# Changes info
ATTR_CHANGES_LIST = 'changes_list'
ATTR_LOCATIONS_LIST = 'locations_list'


# Defaults
DEFAULT_TRIP_WAIT_TIME = 10
DEFAULT_TRANSPORT_TYPE_SELECTOR = ['Train', 'Metro', 'Light rail', 'Bus', 'Ferry']
DEFAULT_TRANSPORT_TYPE_NUMERIC = [1, 2, 4, 5, 9]
ALL_TRANSPORT_TYPE_NUMERIC = [1, 2, 4, 5, 7, 9, 11, 99]
DEFAULT_ROUTE_FILTER = ''
DEFAULT_MAX_CHANGES = 2
DEFAULT_ALERT_TYPES = ['lineinfo', 'stopinfo', 'routeinfo', 'stopblocking', 'bannerinfo']
DEFAULT_ALERT_SEVERITY = 'high'
DEFAULT_TRIPS_TO_CREATE = 1

DEFAULT_SENSOR_CREATION = 'none'
DEFAULT_CHANGES_SENSOR = False
DEFAULT_DELAY_SENSOR = False
DEFAULT_DURATION_SENSOR = False
DEFAULT_ALERTS_SENSOR = False
DEFAULT_FIRST_LEG_DEPARTURE_TIME_SENSOR = False
DEFAULT_LAST_LEG_ARRIVAL_TIME_SENSOR = False
DEFAULT_ORIGIN_NAME_SENSOR = False
DEFAULT_ORIGIN_DETAIL_SENSOR = False
DEFAULT_FIRST_LEG_LINE_NAME_SENSOR = False
DEFAULT_FIRST_LEG_LINE_NAME_SHORT_SENSOR = False
DEFAULT_FIRST_LEG_OCCUPANCY_SENSOR = False
DEFAULT_FIRST_LEG_OCCUPANCY_DETAIL_SENSOR = False
DEFAULT_FIRST_LEG_TRAIN_SET_SENSOR = False
DEFAULT_DESTINATION_NAME_SENSOR = False
DEFAULT_DESTINATION_DETAIL_SENSOR = False
DEFAULT_LAST_LEG_LINE_NAME_SENSOR = False
DEFAULT_LAST_LEG_LINE_NAME_SHORT_SENSOR = False
DEFAULT_LAST_LEG_OCCUPANCY_SENSOR = False
DEFAULT_LAST_LEG_OCCUPANCY_DETAIL_SENSOR = False
DEFAULT_LAST_LEG_TRAIN_SET_SENSOR = False

# Misc
ORIGIN_LATITUDE = 'origin_latitude'
ORIGIN_LONGITUDE = 'origin_longitude'
DESTINATION_LATITUDE = 'destination_latitude'
DESTINATION_LONGITUDE = 'destination_longitude'

# Lovelace card stuff
## Read version from manifest.json
MANIFEST_PATH = Path(__file__).parent / "manifest.json"
with open(MANIFEST_PATH, encoding="utf-8") as f:
    INTEGRATION_VERSION = json.load(f).get("version", "0.0.0")

## Base URL for frontend resources
URL_BASE = f"/{DOMAIN}"

## List of JavaScript modules to register
JSMODULES = [
    {
        "name": "Transport NSW vehicle occupancy card",
        "filename": "vehicle-occupancy-card.js",
        "version": INTEGRATION_VERSION,
    }
]


#Transport for NSW constants
TFNSW_ATTRIBUTION = "Data provided by Transport NSW"
TFNSW_REGISTRATION = "https://opendata.transport.nsw.gov.au/data/user/register"
TFNSW_STOPFINDER = "https://transportnsw.info/routes/"


SUBENTRY_TYPE_JOURNEY = 'subentry_journey'
API_CALLS = 'api_calls'
API_CALLS_NAME = 'API calls'
STOP_TEST_ID = '200060' # Central station

# Lookups and mapping dictionaries
JOURNEY_ICONS = {
    "Train": "mdi:train",
    "Metro": "mdi:train-variant",
    "Lightrail": "mdi:tram",
    "Light rail": "mdi:tram",
    "Bus": "mdi:bus",
    "Coach": "mdi:bus",
    "Ferry": "mdi:ferry",
    "Schoolbus": "mdi:bus",
    "School bus": "mdi:bus",
    "Walk": "mdi:walk",
    "n/a": "mdi:train",
    "unavailable": "mdi:train",
    None: "mdi:train"
}

DEVICE_TRACKER_LOOKUPS = {
    CONF_FIRST_LEG_DEVICE_TRACKER : 'first leg vehicle',
    CONF_LAST_LEG_DEVICE_TRACKER: 'last leg vehicle',
    CONF_ORIGIN_DEVICE_TRACKER: 'first stop',
    CONF_DESTINATION_DEVICE_TRACKER: 'last stop'
}

# Oh I wish TfNSW would be more consistent with their constants...
OCCUPANCY_ICONS = {
    "MANY_SEATS": ["mdi:account", "Many seats"],
    "MANY_SEATS_AVAILABLE": ["mdi:account", "Many seats"],
    "FEW_SEATS": ["mdi:account-multiple", "Few seats"],
    "FEW_SEATS_AVAILABLE": ["mdi:account-multiple", "Few seats"],
    "STANDING_ONLY": ["mdi:account-group","Standing room"],
    "STANDING_ROOM_ONLY": ["mdi:account-group","Standing room"],
    "CRUSHED_STANDING_ROOM_ONLY": ["mdi:account-group","Crushed standing room"],
    "FULL": ["mdi:account-group","Full"],
    "Unknown": ["mdi:account-question", "Unknown"],
    "Unavailable": ["mdi:account-question", "Unavailable"],
    None: ["mdi:account-question", "Unknown"]
}

OCCUPANCY_DETAIL_GLYPHS = {
    0: "⬜", 
    1: "🟩",
    2: "🟨",
    3: "🟥"
}

TRANSPORT_TYPE = {
#    0:   "All",
    1:   "Train",
    2:   "Metro",
    4:   "Light rail",
    5:   "Bus",
    7:   "Coach",
    9:   "Ferry",
    11:  "School bus",
    99:  "Walk",
    100: "Walk"
}

ALERT_PRIORITIES = {
    "verylow"  : 1,
    "low"      : 2,
    "normal"   : 3,
    "high"     : 4,
    "veryhigh" : 5
}

TRAIN_SETS = {
    "A": "Waratah",
    "B": "Waratah Series 2",
    "C": "C-set",
    "D": "Mariyung",
    "H": "Oscar",
    "J": "Hunter",
    "K": "K-set",
    "M": "Millennium",
    "N": "Endeavour",
    "P": "Xplorer",
    "T": "Tangara",
    "V": "V-set",
    "X": "XPT"
}
