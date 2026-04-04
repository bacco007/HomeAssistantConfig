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
SERVICE_RUN_SPEEDTEST: Final = "run_speedtest"

GATEWAY_DEVICES: Final = ["udm", "ugw", "uxg", "uxg-pro", "ucg-ultra", "ucg"]
MAX_WAN_INTERFACES: Final = 4