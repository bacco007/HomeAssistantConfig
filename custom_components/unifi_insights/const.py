"""Constants for the UniFi Insights integration."""
from datetime import timedelta
from typing import Final

DOMAIN = "unifi_insights"

MANUFACTURER: Final = "Ubiquiti Inc."

DEFAULT_API_HOST = "https://192.168.10.1"
DEFAULT_SCAN_INTERVAL = timedelta(seconds=30)
SCAN_INTERVAL_METRICS = timedelta(minutes=5)
SCAN_INTERVAL_NORMAL = timedelta(seconds=30)

METRIC_TYPE_5M = "5m"
METRIC_TYPE_1H = "1h"

UNIFI_API_HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}

COORDINATOR_UPDATE_INTERVAL = timedelta(seconds=30)