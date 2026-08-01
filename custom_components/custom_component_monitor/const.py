"""Constants for the Custom Component Monitor integration."""

DOMAIN = "custom_component_monitor"

# Sensor keys
SENSOR_ALL_COMPONENTS = "all_hacs_components"
SENSOR_UNUSED_INTEGRATIONS = "unused_integrations"
SENSOR_UNUSED_THEMES = "unused_themes"
SENSOR_UNUSED_FRONTEND = "unused_frontend"
SENSOR_HACS_UPDATES = "hacs_updates"

# Sensor attributes
ATTR_COMPONENTS = "components"
ATTR_TOTAL_COMPONENTS = "total_components"
ATTR_USED_COMPONENTS = "used_components"
ATTR_UNUSED_COMPONENTS = "unused_components"
ATTR_EXCLUDED_COMPONENTS = "excluded_components"
ATTR_UPDATES = "updates"
# Per-update AI enrichment (#67)
ATTR_CATEGORIES = "categories"
ATTR_SUMMARY = "summary"
ATTR_ENTITY_ID = "entity_id"
# AI run status, surfaced on sensor.hacs_updates (#91)
ATTR_AI_ENABLED = "ai_enabled"
ATTR_AI_PENDING = "ai_pending"
ATTR_AI_IN_PROGRESS = "ai_in_progress"
ATTR_AI_LAST_ERROR = "ai_last_error"
ATTR_AI_LAST_RUN = "ai_last_run"
# When exact install-date tracking began, surfaced on
# sensor.hacs_installed_components so the card can explain its "~" marks (#93)
ATTR_INSTALL_DATES_SINCE = "install_dates_since"

# Options
CONF_EXCLUDE = "exclude"  # user-maintained list of components to treat as used (#70)
# AI summarise & categorise updates (#67) — opt-in
CONF_AI_CATEGORIZATION_ENABLED = "ai_categorization_enabled"
CONF_AI_TASK_ENTITY = "ai_task_entity"

# AI categorisation (#67)
AI_CACHE_STORAGE_KEY = "custom_component_monitor.ai_categories"
# Own store version — v2 moved from a flat {name|version: {...}} dict to
# {"entries": {repo_key|version: record}, "legacy": {...}} (#91).
AI_CACHE_STORAGE_VERSION = 2
AI_CATEGORY_OPTIONS = [
    "Bug fixes",
    "New features",
    "Documentation",
    "Translations",
    "Breaking changes",
    "Dependencies",
    "Other",
]
# Models don't reliably honour the select-selector options, so map the common
# free-form tags they emit back onto the canonical set (#67).
AI_CATEGORY_ALIASES = {
    "bug fixes": "Bug fixes",
    "bug fix": "Bug fixes",
    "bugfix": "Bug fixes",
    "bugfixes": "Bug fixes",
    "fix": "Bug fixes",
    "fixes": "Bug fixes",
    "maintenance": "Bug fixes",
    "patch": "Bug fixes",
    "new features": "New features",
    "new feature": "New features",
    "feature": "New features",
    "features": "New features",
    "enhancement": "New features",
    "enhancements": "New features",
    "improvement": "New features",
    "improvements": "New features",
    "documentation": "Documentation",
    "docs": "Documentation",
    "doc": "Documentation",
    "translations": "Translations",
    "translation": "Translations",
    "i18n": "Translations",
    "localization": "Translations",
    "localisation": "Translations",
    "breaking changes": "Breaking changes",
    "breaking change": "Breaking changes",
    "breaking": "Breaking changes",
    "dependencies": "Dependencies",
    "dependency": "Dependencies",
    "deps": "Dependencies",
    "dependency updates": "Dependencies",
    "other": "Other",
    "chore": "Other",
    "chores": "Other",
    "misc": "Other",
    "miscellaneous": "Other",
}
AI_MAX_PER_SCAN = 8  # cap new AI calls per scan so refreshes stay snappy
AI_CALL_TIMEOUT = 30  # seconds per AI Task call
# A failed generation is recorded and retried with growing backoff rather than
# re-sent on every hourly scan (#91). Index by (attempts - 1), clamped.
AI_FAILURE_BACKOFF_MINUTES = (15, 60, 360, 1440)
AI_MAX_ATTEMPTS = 5  # after this, only a forced/manual run retries
AI_CACHE_MAX_AGE_DAYS = 30  # evict records untouched for this long
AI_CACHE_MAX_ENTRIES = 500  # hard cap, oldest-updated dropped first

# --- Install-date registry (#93) ---
# HACS records no install date, and a HACS *update* rewrites the component's
# directory, so filesystem timestamps make an old component look freshly
# installed. The first time a component is seen installed is recorded here and
# never moved forward again.
INSTALL_DATES_STORAGE_KEY = "custom_component_monitor.install_dates"
INSTALL_DATES_STORAGE_VERSION = 1
# A component must be missing from the HACS snapshot for this long before its
# record is dropped. The snapshot lags and flaps, so a short grace period would
# silently reset install dates. Deliberately longer than the card's 30-day
# window: an uninstall/reinstall inside it keeps the original date, which is
# "recently installed" either way.
INSTALL_DATES_GRACE_DAYS = 45
INSTALL_DATES_MAX_ENTRIES = 1000
# A component whose key we've never seen is only called a *new* install if its
# files are also recent. Scans are hourly, so this is generous — it just has to
# rule out a component that merely changed key (a repo renamed upstream), whose
# files can be any age.
INSTALL_DATES_NEW_WINDOW_DAYS = 2

# HACS category to display type mapping
CATEGORY_MAP = {
    "integration": "Integration",
    "plugin": "Frontend / Card",
    "theme": "Theme",
}

# Update interval (in seconds)
DEFAULT_SCAN_INTERVAL = 3600  # 1 hour

# --- Update Action Tracker (merged from HACS-Update-Action-Tracker) ---
STORAGE_KEY = "custom_component_monitor.update_actions"
STORAGE_VERSION = 1
SERVICE_UPDATE_AND_ACTION = "update_and_action"
SERVICE_UPDATE_ALL = "update_all"
SERVICE_GENERATE_SUMMARIES = "generate_summaries"
UAT_CARD_JS = "update-action-tracker-card.js"
UAT_CARD_BASE_PATH = f"/local/{DOMAIN}/{UAT_CARD_JS}"

# --- Recently installed but unused card ---
RIU_CARD_JS = "recently-installed-unused-card.js"
RIU_CARD_BASE_PATH = f"/local/{DOMAIN}/{RIU_CARD_JS}"