from __future__ import annotations

from datetime import timedelta

CONF_SITE_ID = "site_id"
CONF_UNIFI_VERSION = "version"

DEFAULT_NAME = "UniFi Status"
DEFAULT_HOST = "localhost"
DEFAULT_PORT = 8443
DEFAULT_UNIFI_VERSION = "v5"
DEFAULT_SITE = "default"
DEFAULT_VERIFY_SSL = False

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=30)
