from typing import Final

from homeassistant.const import Platform

DOMAIN: Final = "qbittorrent_alt"
PLATFORMS = [Platform.SENSOR, Platform.SWITCH, Platform.NUMBER, Platform.BUTTON]

DEFAULT_NAME = "qBittorrent"
DEFAULT_URL = "http://127.0.0.1:8080"
