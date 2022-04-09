"""Constants for the Australia Fuel Prices integration."""
from datetime import timedelta

DOMAIN = "aus_fuel"

SCAN_INTERVAL = timedelta(hours=1)

QUERY_URL = "https://trafficbuddy.com.au/?lat={lat}&lon={long}&distance={dist}"
