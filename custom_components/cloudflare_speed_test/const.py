"""Constants used by Cloudflare Speed Test."""

from __future__ import annotations

from typing import Final


DOMAIN: Final = "cloudflare_speed_test"

ATTR_SERVER_REGION: Final = "server_region"
ATTR_SERVER_CODE: Final = "server_code"
ATTR_SERVER_CITY: Final = "server_city"

DEFAULT_NAME: Final = "Cloudflare Speed Test"
DEFAULT_SCAN_INTERVAL: Final = 60

ATTRIBUTION: Final = "Data retrieved from Cloudflare Speed Test"
