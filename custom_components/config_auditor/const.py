"""Constants for H.A.C.A."""

DOMAIN = "config_auditor"
NAME = "H.A.C.A"
VERSION = "1.6.0"

# Configuration
DEFAULT_SCAN_INTERVAL = 60
DEFAULT_EVENT_DEBOUNCE_SECONDS = 30
MIN_SCAN_INTERVAL = 5
MAX_SCAN_INTERVAL = 1440

# Services
SERVICE_SCAN_ALL = "scan_all"
SERVICE_SCAN_AUTOMATIONS = "scan_automations"
SERVICE_SCAN_ENTITIES = "scan_entities"
SERVICE_SCAN_PERFORMANCE = "scan_performance"
SERVICE_GENERATE_REPORT = "generate_report"
SERVICE_LIST_REPORTS = "list_reports"
SERVICE_GET_REPORT_CONTENT = "get_report_content"
SERVICE_FIX_DEVICE_ID = "fix_device_id"
SERVICE_PREVIEW_DEVICE_ID = "preview_device_id"
SERVICE_FIX_MODE = "fix_mode"
SERVICE_PREVIEW_MODE = "preview_mode"
SERVICE_LIST_BACKUPS = "list_backups"
SERVICE_RESTORE_BACKUP = "restore_backup"
SERVICE_PREVIEW_TEMPLATE = "preview_template"
SERVICE_FIX_TEMPLATE = "fix_template"
SERVICE_EXPLAIN_ISSUE = "explain_issue_ai"
SERVICE_PURGE_GHOSTS = "purge_ghosts"
SERVICE_FUZZY_SUGGESTIONS = "get_fuzzy_suggestions"
SERVICE_PURGE_RECORDER_ORPHANS = "purge_recorder_orphans"
SERVICE_FIX_DESCRIPTION = "fix_description"
SERVICE_SUGGEST_DESCRIPTION = "suggest_description_ai"

# Module Status
MODULE_1_AUTOMATION_SCANNER = True  
MODULE_2_HEALTH_MONITOR = True      
MODULE_3_PERFORMANCE_ANALYZER = True
MODULE_4_COMPLIANCE_REPORT = True   
MODULE_5_REFACTORING_ASSISTANT = True 
MODULE_6_AI_ASSIST = True           
MODULE_7_SECURITY_ANALYZER = True   
MODULE_9_DASHBOARD_ANALYZER = True
MODULE_10_EVENT_MONITORING = True   
MODULE_11_RECORDER_ANALYZER = True  
MODULE_12_AUDIT_HISTORY = True      
MODULE_13_HELPER_ANALYZER = True    # v1.2.0 — input_* & timer analysis
MODULE_14_GROUP_ANALYZER = True     # v1.3.0 — group.* analysis

# Severity levels
SEVERITY_HIGH = "high"
SEVERITY_MEDIUM = "medium"
SEVERITY_LOW = "low"

# Issue types - Module 1
ISSUE_DEVICE_ID_TRIGGER = "device_id_in_trigger"
ISSUE_DEVICE_ID_ACTION = "device_id_in_action"
ISSUE_TEMPLATE_SIMPLE = "template_condition_simple"
ISSUE_TEMPLATE_NUMERIC = "template_numeric_comparison"
ISSUE_INCORRECT_MODE = "incorrect_mode_for_pattern"
ISSUE_ZOMBIE_REFERENCE = "zombie_entity_reference"

# Issue types - Module 1 
ISSUE_UNKNOWN_SERVICE = "unknown_service"
ISSUE_UNKNOWN_AREA = "unknown_area_reference"
ISSUE_UNKNOWN_FLOOR = "unknown_floor_reference"
ISSUE_UNKNOWN_LABEL = "unknown_label_reference"

# Issue types - Module 9 (Dashboard)
ISSUE_DASHBOARD_MISSING = "dashboard_missing_entity"

# Issue types - Module 2
ISSUE_UNAVAILABLE = "entity_unavailable"
ISSUE_UNKNOWN_STATE = "entity_unknown_state"
ISSUE_STALE = "entity_stale"
ISSUE_DISABLED_REFERENCED = "disabled_but_referenced"
ISSUE_ZOMBIE_ENTITY = "zombie_entity"
ISSUE_GHOST_REGISTRY = "ghost_registry_entry"
ISSUE_BROKEN_DEVICE = "broken_device_reference"
ISSUE_ORPHANED_DEVICE = "orphaned_device_reference"

# Issue types - Module 3
ISSUE_HIGH_FREQUENCY = "high_trigger_frequency"
ISSUE_VERY_HIGH_FREQUENCY = "very_high_trigger_frequency"
ISSUE_BURST_PATTERN = "burst_trigger_pattern"
ISSUE_TEMPLATE_HIGH_REFRESH = "template_high_refresh_rate"

# Issue types - Module 13 (Helper Analyzer — v1.2.0)
ISSUE_HELPER_UNUSED = "helper_unused"
ISSUE_HELPER_ORPHANED_DISABLED = "helper_orphaned_disabled_only"
ISSUE_HELPER_NO_NAME = "helper_no_friendly_name"
ISSUE_INPUT_SELECT_DUPLICATE_OPTIONS = "input_select_duplicate_options"
ISSUE_INPUT_SELECT_EMPTY_OPTION = "input_select_empty_option"
ISSUE_INPUT_NUMBER_INVALID_RANGE = "input_number_invalid_range"
ISSUE_INPUT_TEXT_INVALID_PATTERN = "input_text_invalid_pattern"
ISSUE_TIMER_NEVER_STARTED = "timer_never_started"
ISSUE_TIMER_ZERO_DURATION = "timer_zero_duration"
ISSUE_TIMER_ORPHANED = "timer_orphaned"

# Issue types - Template sensors (v1.2.0)
ISSUE_TEMPLATE_NO_UNAVAILABLE_CHECK = "template_no_unavailable_check"
ISSUE_TEMPLATE_NOW_WITHOUT_TRIGGER = "template_now_without_trigger"
ISSUE_TEMPLATE_SENSOR_NO_METADATA = "template_sensor_no_metadata"
ISSUE_TEMPLATE_SENSOR_CYCLE = "template_sensor_cycle"
ISSUE_TEMPLATE_MISSING_AVAILABILITY = "template_missing_availability"

# Paths
BACKUP_DIR = ".haca_backups"
REPORTS_DIR = "haca_reports"
# HISTORY_FILE kept for backwards compatibility; new code uses .haca_history/ directory
HISTORY_FILE = ".haca_history.json"

# Thresholds
STALE_ENTITY_DAYS = 7
HIGH_FREQUENCY_TRIGGERS_PER_HOUR = 50
VERY_HIGH_FREQUENCY_TRIGGERS_PER_HOUR = 100
BURST_TRIGGERS_IN_MINUTES = 10
BURST_WINDOW_MINUTES = 5

# Issue types - v1.3.0 — Script depth & graph analysis
ISSUE_SCRIPT_CYCLE = "script_cycle"
ISSUE_SCRIPT_CALL_DEPTH = "script_call_depth"
ISSUE_SCRIPT_SINGLE_MODE_LOOP = "script_single_mode_loop"
ISSUE_SCRIPT_ORPHAN = "script_orphan"
ISSUE_SCRIPT_BLUEPRINT_CANDIDATE = "script_blueprint_candidate"

# Issue types - v1.3.0 — Advanced scene analysis
ISSUE_SCENE_ENTITY_UNAVAILABLE = "scene_entity_unavailable"
ISSUE_SCENE_NOT_TRIGGERED = "scene_not_triggered"
ISSUE_SCENE_DUPLICATE = "scene_duplicate"

# Issue types - v1.3.0 — Group analysis (Module 14)
ISSUE_GROUP_EMPTY = "group_empty"
ISSUE_GROUP_MISSING_ENTITIES = "group_missing_entities"
ISSUE_GROUP_ALL_UNAVAILABLE = "group_all_unavailable"
ISSUE_GROUP_NESTED_DEEP = "group_nested_deep"

# Thresholds - v1.3.0
SCRIPT_CALL_DEPTH_THRESHOLD = 3     # > 3 levels → medium
SCENE_GHOST_DAYS = 90               # scene not triggered → low issue
SCRIPT_BLUEPRINT_MIN_AUTOMATIONS = 3  # used by > N automations → candidate

# ─── v1.4.0 ────────────────────────────────────────────────────────────────

# Module flags — v1.4.0
MODULE_15_MCP_SERVER = True         # Serveur MCP natif
MODULE_16_PROACTIVE_AGENT = True    # Agent IA proactif
MODULE_17_COMPLIANCE_ANALYZER = True  # Analyse de conformité

# ── v1.5.0 ────────────────────────────────────────────────────────────────
MODULE_18_BATTERY_PREDICTOR = True      # Prédiction de pannes batterie
MODULE_19_AREA_COMPLEXITY = True        # Heatmap complexité par zone
MODULE_20_REDUNDANCY_ANALYZER = True    # Automations redondantes inter-modules
MODULE_21_RECORDER_IMPACT = True        # Impact DB Recorder par automation

# Issue types - v1.4.0 — Compliance (Module 17)
ISSUE_COMPLIANCE_NO_FRIENDLY_NAME       = "compliance_no_friendly_name"
ISSUE_COMPLIANCE_RAW_ENTITY_NAME        = "compliance_raw_entity_name"
ISSUE_COMPLIANCE_AREA_NO_ICON           = "compliance_area_no_icon"
ISSUE_COMPLIANCE_UNUSED_LABEL           = "compliance_unused_label"
ISSUE_COMPLIANCE_AUTO_NO_DESCRIPTION    = "compliance_automation_no_description"
ISSUE_COMPLIANCE_AUTO_NO_UNIQUE_ID      = "compliance_automation_no_unique_id"
ISSUE_COMPLIANCE_SCRIPT_NO_DESCRIPTION  = "compliance_script_no_description"
ISSUE_COMPLIANCE_ENTITY_NO_AREA         = "compliance_entity_no_area"
ISSUE_COMPLIANCE_ENTITY_NO_AREA_BULK    = "compliance_entity_no_area_bulk"

# AI cache key (in hass.data[DOMAIN][entry_id])
AI_CACHE_KEY = "ai_explanation_cache"
