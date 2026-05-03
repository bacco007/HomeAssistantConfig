from datetime import timedelta
from typing import Final

DOMAIN = "prometheus_sensor"
PLATFORMS = ["binary_sensor", "sensor"]

# Match the default scrape_interval in Prometheus
SCAN_INTERVAL: Final = timedelta(seconds=15)

DEFAULT_URL: Final = "http://localhost:9090"

CONF_QUERIES: Final = "queries"
CONF_EXPR: Final = "expr"
CONF_HEADERS: Final = "headers"
