from __future__ import annotations

from datetime import timedelta

DOMAIN = "doomsday_clock"

DEFAULT_NAME = "Doomsday Clock"
DEFAULT_ICON = "mdi:nuke"
DEFAULT_UNIT = "min"
DEFAULT_RESOURCE = "https://thebulletin.org/doomsday-clock/past-announcements/"
DEFAULT_SELECTORS = [
    ".uabb-infobox-title",
    "h2.uabb-infobox-title",
    ".doomsday-clock .uabb-infobox-title",
]

ATTRIBUTION = "Threat assessment by the Bulletin of the Atomic Scientists"

UPDATE_INTERVAL = timedelta(hours=6)

CONF_RESOURCE = "resource"
CONF_SELECTOR = "selector"