"""Constants for Public Transport Departures."""

from typing import Final

NAME: Final = "Public Transport Departures"
DOMAIN: Final = "ha_departures"
VERSION: Final = "3.1.3"

# Github URLs
GITHUB_REPO_URL: Final = "https://github.com/alex-jung/ha-departures"
GITHUB_ISSUE_URL: Final = f"{GITHUB_REPO_URL}/issues"

# Motis API constants
PROVIDER_URL: Final = "https://transitous.org/"
REQUEST_API_URL: Final = "https://api.transitous.org/api"
REQUEST_HEADER_JSON: Final = "application/json"
REQUEST_TIMEOUT: Final = 10  # seconds
REQUEST_RETRIES: Final = 3  # number of retries for failed requests
REQUEST_TIMES_PER_LINE_COUNT: Final = 100  # number of departure times to fetch per line
UPDATE_INTERVAL: Final = 60  # seconds
RADIUS_FOR_STOPS_REQUEST = 250  # meters

# Configuration and options
CONF_LOCATION: Final = "location"
CONF_STOP_NAME: Final = "stop_name"
CONF_STOP_IDS: Final = "stop_ids"
CONF_STOP_COORD: Final = "stop_coord"
CONF_API_URL: Final = "api_url"
CONF_ENDPOINT: Final = "endpoint"
CONF_LINES: Final = "lines"
CONF_AVAILABLE_LINES: Final = "available_lines"
CONF_HUB_NAME: Final = "hub_name"
CONF_ERROR_NO_STOP_FOUND: Final = "no_stop_found"
CONF_ERROR_NO_LINE_SELECTED: Final = "no_line_selected"
CONF_ERROR_NO_CHANGES_OPTIONS: Final = "no_changes_configured"
CONF_ERROR_INVALID_RESPONSE: Final = "invalid_api_response"
CONF_ERROR_CONNECTION_FAILED: Final = "connection_failed"

# Sensor attributes
ATTR_LINE_NAME: Final = "line_name"
ATTR_LINE_ID: Final = "line_id"
ATTR_TRANSPORT_TYPE: Final = "transport"
ATTR_DIRECTION: Final = "direction"
ATTR_PROVIDER_URL: Final = "data_provider"
ATTR_TIMES: Final = "times"
ATTR_PLANNED_DEPARTURE_TIME: Final = "planned"
ATTR_ESTIMATED_DEPARTURE_TIME: Final = "estimated"
ATTR_TRIP_ID: Final = "trip_id"
ATTR_DEPARTURE_CANCELLED: Final = "cancelled"
ATTR_HEAD_SIGN: Final = "head_sign"
ATTR_DEPARTURE_ALERTS: Final = "alerts"

DEPARTURES_PER_SENSOR_LIMIT: Final = 10  # max number of departures per sensor


STARTUP_MESSAGE = f"""
-------------------------------------------------------------------
{NAME}
Version: {VERSION}
If you have any issues with this you need to open an issue here:
{GITHUB_ISSUE_URL}
-------------------------------------------------------------------
"""
