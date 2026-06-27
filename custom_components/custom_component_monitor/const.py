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

# Options
CONF_EXCLUDE = "exclude"  # user-maintained list of components to treat as used (#70)
# AI summarise & categorise updates (#67) — opt-in
CONF_AI_CATEGORIZATION_ENABLED = "ai_categorization_enabled"
CONF_AI_TASK_ENTITY = "ai_task_entity"

# AI categorisation (#67)
AI_CACHE_STORAGE_KEY = "custom_component_monitor.ai_categories"
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
UAT_CARD_JS = "update-action-tracker-card.js"
UAT_CARD_BASE_PATH = f"/local/{DOMAIN}/{UAT_CARD_JS}"

# --- Recently Installed but Unused card ---
RIU_CARD_JS = "recently-installed-unused-card.js"
RIU_CARD_BASE_PATH = f"/local/{DOMAIN}/{RIU_CARD_JS}"