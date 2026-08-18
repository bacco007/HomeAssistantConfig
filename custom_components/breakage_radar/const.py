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

#: Findings kept in the report. Everything beyond this is counted but not
#: listed; the full set is in the downloadable diagnostics.
MAX_DETAILS: Final = 200

#: Findings put on the sensor. The recorder drops state attributes over 16 KB,
#: so this stays well inside it even with long file paths.
MAX_SENSOR_FINDINGS: Final = 40

#: Deadlines inside this many days get their own notification; everything else
#: is listed in the summary. Configurable per entry via the options flow.
ALERT_WINDOW_DAYS: Final = 30

CONF_ALERT_WINDOW_DAYS: Final = "alert_window_days"

#: Offered in the options flow, in days.
ALERT_WINDOW_CHOICES: Final = (30, 60, 90, 180, 365)

#: Domains the user does not want reported at all. Empty by default; nothing is
#: ever excluded on their behalf.
CONF_IGNORED_DOMAINS: Final = "ignored_domains"

#: However wide the window, only the nearest few deadlines get their own
#: notification. The rest stay in the summary, which lists every date anyway.
MAX_ALERT_CARDS: Final = 5

ISSUE_ID: Final = "integrations_affected"

ATTR_SCHEDULE: Final = "schedule"
ATTR_DETAILS: Final = "findings"
ATTR_INDEX_GENERATED: Final = "index_generated_utc"
