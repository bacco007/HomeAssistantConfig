from __future__ import annotations

from typing import Final

from homeassistant.const import Platform

DOMAIN: Final = "unifi_wan"

CONF_HOST: Final = "host"
CONF_API_KEY: Final = "api_key"
CONF_SITE: Final = "site"
CONF_VERIFY_SSL: Final = "verify_ssl"

CONF_SCAN_INTERVAL: Final = "scan_interval"
DEFAULT_SCAN_INTERVAL: Final = 30
LEGACY_CONF_DEVICE_INTERVAL: Final = "device_interval"

CONF_RATE_INTERVAL: Final = "rate_interval_seconds"
DEFAULT_RATE_INTERVAL: Final = 5

CONF_AUTO_SPEEDTEST: Final = "auto_speedtest"
CONF_AUTO_SPEEDTEST_MINUTES: Final = "auto_speedtest_minutes"
DEFAULT_AUTO_SPEEDTEST: Final = True
DEFAULT_AUTO_SPEEDTEST_MINUTES: Final = 60

DEFAULT_SITE: Final = "default"
DEFAULT_VERIFY_SSL: Final = False

PLATFORMS: Final = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.SWITCH,
]

SIGNAL_SPEEDTEST_RUNNING: Final = f"{DOMAIN}_speedtest_running"
SIGNAL_AUTO_SPEEDTEST_CHANGED: Final = f"{DOMAIN}_auto_speedtest_changed"
SIGNAL_SPEEDTEST_RESULT: Final = f"{DOMAIN}_speedtest_result"
SERVICE_RUN_SPEEDTEST: Final = "run_speedtest"
ATTR_WAN: Final = "wan"

# How long to wait for a triggered speedtest to finish, and how often to
# poll the controller for its result while waiting.
SPEEDTEST_TIMEOUT_SECONDS: Final = 300
SPEEDTEST_POLL_SECONDS: Final = 15

GATEWAY_DEVICES: Final = ["udm", "ugw", "uxg", "uxg-pro", "ucg-ultra", "ucg"]
MAX_WAN_INTERFACES: Final = 4

# The gateway's blocks of per-WAN ISP and geolocation details, in the order
# they are consulted. Each is keyed by WAN network group ("WAN", "WAN2"),
# the same convention as last_wan_interfaces. A later block only fills in a
# field the earlier ones left unset: "last_geo_info" in particular is a
# cut-down record that often carries the operator alone.
WAN_GEO_INFO_BLOCKS: Final[tuple[str, ...]] = (
    "geo_info",
    "active_geo_info",
    "last_geo_info",
)

# ISP and geolocation details to read out of those blocks, as
# {canonical name: spellings to try, best first}.
#
# The controller derives these by looking up each WAN's own public address,
# so they identify the operator of that line. They come only from these
# per-WAN blocks: the speedtest records carry no ISP fields at all, and the
# speedtest block's "server" sub-object is the far end of the test, not the
# subscriber's line - see SPEEDTEST_SERVER_FIELDS for that.
#
# Firmware differs over the spellings and a gateway that performs no lookup
# reports none of them, so every field is optional and an absent one stays
# unset.
WAN_ISP_FIELDS: Final[dict[str, tuple[str, ...]]] = {
    "isp_name": ("isp_name", "isp"),
    "isp_organization": ("isp_organization", "isp_org", "organization"),
    "asn": ("asn", "isp_asn"),
    "city": ("city",),
    "country_name": ("country_name", "country"),
}

# Which speedtest server the gateway tested against, read out of the
# "server" sub-object of its speedtest-status block, as
# {canonical name: spellings to try, best first}.
#
# Every name is prefixed "server_" so nothing here can be confused with the
# subscriber-side lookup above: "city" in this sub-object is the server's
# city, and labelling a line with it would be wrong twice over.
#
# Unlike the ISP details this is not reported per WAN. The gateway records
# one server, belonging to whichever run finished last, so it is attributed
# to a WAN on the same evidence as the throughput it arrived with.
SPEEDTEST_SERVER_FIELDS: Final[dict[str, tuple[str, ...]]] = {
    "server_provider": ("provider", "sponsor", "name"),
    "server_provider_url": ("provider_url", "url"),
    "server_city": ("city",),
    "server_country": ("country", "country_name"),
}