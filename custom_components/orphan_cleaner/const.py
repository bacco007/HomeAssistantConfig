"""Costanti per Orphan Entity Cleaner."""

DOMAIN = "orphan_cleaner"

CONF_MIN_AGE_HOURS       = "min_orphan_age_hours"
CONF_AGGRESSIVE          = "aggressive_heuristic"

DEFAULT_MIN_AGE_HOURS    = 24
DEFAULT_AGGRESSIVE       = False

# Piattaforme che non verranno mai considerate orfane
MANUAL_PLATFORMS = {
    "template",
    "input_boolean",
    "input_number",
    "input_text",
    "input_select",
    "input_datetime",
    "input_button",
    "counter",
    "timer",
    "schedule",
    "group",
    "persistent_notification",
    "script",
    "automation",
    "scene",
    "zone",
    "person",
    "tag",
}

# Nomi servizi
SERVICE_SCAN           = "scan"
SERVICE_DELETE_ORPHANS = "delete_orphans"

# Campi servizi
FIELD_ENTITY_IDS = "entity_ids"
FIELD_DRY_RUN    = "dry_run"

# Nome evento HA sparato dopo scansione
EVENT_ORPHANS_FOUND = f"{DOMAIN}_orphans_found"

# URL panel
PANEL_URL  = "orphan-cleaner"
PANEL_NAME = "Orphan Cleaner"
PANEL_ICON = "mdi:broom"

# Versione corrente (usata per cache-busting)
VERSION = "4.0.2"
