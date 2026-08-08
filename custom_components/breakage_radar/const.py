"""Constants for the Breakage Radar integration."""

from __future__ import annotations

from datetime import timedelta
from typing import Final

DOMAIN: Final = "breakage_radar"
NAME: Final = "Breakage Radar"

#: The published index, rebuilt daily by the crawler in this same repository.
INDEX_URL: Final = "https://booyaka101.github.io/hass-breakage-radar/index.json"

#: Schema version this integration knows how to read.
SUPPORTED_SCHEMA: Final = 1

UPDATE_INTERVAL: Final = timedelta(hours=12)

#: Network timeout for one index fetch, in seconds.
FETCH_TIMEOUT: Final = 30

#: Hard cap on the ``details`` attribute so a very affected system cannot
#: produce a state object Home Assistant refuses to store.
MAX_DETAILS: Final = 100

ISSUE_ID: Final = "integrations_affected"

ATTR_BY_RELEASE: Final = "by_release"
ATTR_DETAILS: Final = "details"
ATTR_INDEX_GENERATED: Final = "index_generated_utc"
