DOMAIN = "cap_alerts"
CONF_FEEDS = "feeds"  # list of {name, url, format}
DEFAULT_SCAN_INTERVAL = 300  # seconds (5 minutes)
CATALOG_URL = "https://raw.githubusercontent.com/twcau/CAP-au-for-home-assistant/main/data/feed_catalog.json"
ATTR_ALERTS = 'alerts'
ATTR_FEATURES = 'features'
EVENT_PIP_RESULT = f"{DOMAIN}.point_in_polygon_result"
EVENT_MATCHES = f"{DOMAIN}.matches"

# Disclaimer acceptance storage and enforcement
ACCEPTANCE_STORE_VERSION = 1
ACCEPTANCE_STORE_KEY = f"{DOMAIN}_disclaimer_acceptance"
DISCLAIMER_FILE = "LEGAL-DISCLAIMER.md"
ACCEPTANCE_PEPPER = "cap_alerts_pepper_v1_2026_01_27"
ISSUE_DISCLAIMER_REQUIRED = "disclaimer_required"
ISSUE_FEED_DISABLED_PREFIX = "feed_disabled_"
MAX_FEED_FAILURES = 5
ISSUE_FEED_NO_GEOMETRY_PREFIX = "feed_no_geometry_"
ISSUE_FEED_NO_CONTENT_PREFIX = "feed_no_content_"
EMPTY_ALERTS_THRESHOLD = 3
