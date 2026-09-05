"""Constants for Australian Fire Watch."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import timedelta
from typing import Any

DOMAIN = "australian_fire_watch"
NAME = "Australian Fire Watch"
VERSION = "1.0.1"
CONFIG_ENTRY_VERSION = 1

PLATFORMS = ["sensor", "binary_sensor", "geo_location"]

CONF_NAME = "name"
CONF_JURISDICTION = "jurisdiction"
CONF_ZONE = "zone"
CONF_DISTRICT = "fire_danger_district"
CONF_WEATHER_ENTITY = "weather_entity"
CONF_READINESS_ENTITIES = "readiness_entities"
CONF_NOTIFY_SERVICES = "notify_services"
CONF_MONITOR_RADIUS = "monitor_radius_km"
CONF_EMERGENCY_RADIUS = "emergency_radius_km"
CONF_WATCH_RADIUS = "watch_radius_km"
CONF_ADVICE_RADIUS = "advice_radius_km"
CONF_UNCLASSIFIED_RADIUS = "unclassified_fire_radius_km"
CONF_STALE_AFTER = "stale_after_minutes"
CONF_ENABLE_BOM = "enable_bom_enrichment"

DEFAULT_NAME = "Home"
DEFAULT_JURISDICTION = "NSW"
DEFAULT_ZONE = "zone.home"
DEFAULT_DISTRICT = "Greater Sydney Region"
DEFAULT_MONITOR_RADIUS_KM = 150.0
DEFAULT_EMERGENCY_RADIUS_KM = 100.0
DEFAULT_WATCH_RADIUS_KM = 50.0
DEFAULT_ADVICE_RADIUS_KM = 20.0
DEFAULT_UNCLASSIFIED_RADIUS_KM = 10.0
DEFAULT_STALE_AFTER_MINUTES = 45
DEFAULT_ENABLE_BOM = True


def config_entry_unique_id(data: Mapping[str, Any]) -> str:
    """Return the stable identity used by UI and YAML-configured entries."""
    jurisdiction = str(data.get(CONF_JURISDICTION, DEFAULT_JURISDICTION)).upper()
    district = (
        str(data.get(CONF_DISTRICT, DEFAULT_DISTRICT)) if jurisdiction == "NSW" else ""
    )
    return f"{data.get(CONF_ZONE, DEFAULT_ZONE)}|{jurisdiction}|{district}".casefold()


MIN_UPDATE_INTERVAL = timedelta(minutes=5)
REQUEST_TIMEOUT_SECONDS = 20
MAX_RESPONSE_BYTES = 5_000_000
MAX_BACKOFF = timedelta(hours=1)

CAP_URL = "https://www.rfs.nsw.gov.au/feeds/majorIncidentsCAP.xml"
GEOJSON_URL = "https://www.rfs.nsw.gov.au/feeds/majorIncidents.json"
INCIDENT_ALERTS_URL = "https://www.rfs.nsw.gov.au/feeds/IncidentAlerts.xml"
FDR_TOBAN_URL = "https://www.rfs.nsw.gov.au/feeds/fdrToban.xml"
BOM_FIRE_DANGER_URL = "https://www.bom.gov.au/fwo/IDN10016.xml"
BOM_WARNINGS_URL = "https://www.bom.gov.au/fwo/IDZ00061.warnings_land_nsw.xml"

OFFICIAL_INCIDENTS_URL = "https://www.rfs.nsw.gov.au/fire-information/fires-near-me"
OFFICIAL_DANGER_URL = "https://www.rfs.nsw.gov.au/fire-information/fdr-and-tobans"
OFFICIAL_BOM_WARNINGS_URL = "https://www.bom.gov.au/nsw/warnings/"

ATTRIBUTION_RFS = (
    "© State of New South Wales (NSW Rural Fire Service). "
    "For current information go to www.rfs.nsw.gov.au."
)
ATTRIBUTION_BOM = "Australian Government Bureau of Meteorology"

EVENT_ALERT = "australian_fire_watch_alert"
SERVICE_ACKNOWLEDGE = "acknowledge"
SERVICE_SNOOZE = "snooze"
SERVICE_TEST_ALERT = "test_alert"

PANEL_SLUG = "australian-fire-watch"
PANEL_TITLE = "Australian Fire Watch"
PANEL_ICON = "mdi:fire-alert"
FRONTEND_URL_PATH = "/api/australian_fire_watch/frontend"
PANEL_JS_FILE = "australian-fire-watch-panel.js"
PANEL_ELEMENT = "australian-fire-watch-panel"

FIRE_DANGER_DISTRICTS = (
    "Far North Coast",
    "North Coast",
    "Greater Hunter",
    "Greater Sydney Region",
    "Illawarra/Shoalhaven",
    "Far South Coast",
    "Monaro Alpine",
    "ACT",
    "Southern Ranges",
    "Central Ranges",
    "New England",
    "Northern Slopes",
    "North Western",
    "Upper Central West Plains",
    "Lower Central West Plains",
    "Southern Slopes",
    "Eastern Riverina",
    "Southern Riverina",
    "Northern Riverina",
    "South Western",
    "Far Western",
)

# Keep the primary sensor below Home Assistant Recorder's 16 KiB attribute
# ceiling. Totals remain separate attributes and every mapped item is still a
# dynamic geo_location entity; these limits only bound the mobile list payload.
SUMMARY_INCIDENT_LIMIT = 10
SUMMARY_PLANNED_LIMIT = 4
