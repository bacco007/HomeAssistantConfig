"""Constants for the GTFS Realtime integration."""

DOMAIN = "gtfs_realtime"

CONF_GTFS_PROVIDER = "gtfs_provider"
CONF_GTFS_PROVIDER_ID = "gtfs_provider_id"
CONF_API_KEY = "api_key"
CONF_GTFS_STATIC_DATA = "gtfs_static_data"
CONF_STATIC_SOURCES_UPDATE_FREQUENCY = "static_sources_update_frequency"
CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT = 2  # hours
CONF_URL_ENDPOINTS = "url_endpoints"
CONF_ROUTE_ICONS = "route_icons"
CONF_ROUTE_IDS = "route_ids"
CONF_STOP_IDS = "stop_ids"
CONF_ARRIVAL_LIMIT = "arrival_limit"
CONF_VERSION = 2
CONF_MINOR_VERSION = 0

# SERVICES
REFRESH_STATIC_FEEDS = "refresh_static_feeds"
CLEAR_STATIC_FEEDS = "clear_static_feeds"

# ERRORS
CONF_SELECT_AT_LEAST_ONE_STOP_OR_ROUTE = "select_at_least_one_stop_or_route"

FEEDS_URL = "https://gist.githubusercontent.com/bcpearce/cc60c18f4022c4a11c460c5ccd2ec158/raw/feeds.json"

STOP_ID = "stop_id"
ROUTE_ID = "route_id"
TRIP_ID = "trip_id"
ROUTE_COLOR = "route_color"
ROUTE_TEXT_COLOR = "route_text_color"
HEADSIGN = "headsign"
ROUTE_TYPE = "route_type"

SSI_DB = "station_stop_info_db"
TI_DB = "trip_info_db"
CAL_DB = "calendar_db"
RTI_DB = "route_info_db"

COORDINATOR_REALTIME = "coordinator_realtime"

PLATFORM = "platform"
