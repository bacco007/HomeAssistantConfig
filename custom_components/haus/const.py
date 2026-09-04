"""Constants for the HAUS integration.

Every tunable lives here with the reasoning behind its value, so retuning is a
one-line change that does not cascade into the tests. Tests assert on behaviour
(bounds, monotonicity, saturation), never on the specific numbers below.
"""

DOMAIN = "haus"

# Pillar weights. Hygiene is consumed from HAGHS rather than recomputed; the
# three owned pillars carry 70% between them so that HAUS remains meaningful,
# and comparable to itself, on an instance where HAGHS is not installed.
PILLAR_WEIGHTS: dict[str, float] = {
    "hygiene": 0.30,
    "usage": 0.30,
    "diversity": 0.25,
    "users": 0.15,
}

# The published score is always on a 0-100 scale, whatever the pillars do. A
# pillar that misbehaves must not be able to push the headline number off scale.
SCORE_MIN = 0
SCORE_MAX = 100

# Tier labels. This is the one place the playful framing belongs: the domain,
# entity ids and documentation stay neutral so the substantive claims the score
# makes are not dismissed along with the joke. Ordered by ascending threshold.
SCORE_TIERS: tuple[tuple[int, str], ...] = (
    (0, "Starter"),
    (40, "Tinkerer"),
    (60, "Enthusiast"),
    (80, "Power user"),
    (93, "Overengineered"),
)

# Knee of the saturating curve for the number of automations defined. Around a
# dozen automations is where an instance stops being a demo, so k=12 puts the
# 63% mark there and still gives the first few automations real weight. The
# usage pillar grows further in M1; this is the seed signal.
K_AUTOMATION_COUNT = 12.0

# Entity domain of automations. Spelled out rather than imported from
# homeassistant.components.automation, which would pull the whole component in
# for the sake of one string.
AUTOMATION_DOMAIN = "automation"

# Title of the single config entry, and the name of the service device the
# entities hang off.
INTEGRATION_TITLE = "HAUS"

# Coordinator refresh interval, in minutes. Everything collected is a registry
# or state read, so this is cheap; five minutes keeps the card feeling live
# without putting a pointless load on the event loop.
UPDATE_INTERVAL_MINUTES = 5

# Composition of the usage pillar. Firing is what this pillar claims to
# measure, so the fire rate carries the most weight and the raw count is only a
# supporting signal. The pillar is a weighted mean over whichever of these
# metrics is implemented, so the set grows without retuning the rest.
USAGE_METRIC_WEIGHTS: dict[str, float] = {
    "fire_rate": 0.30,
    "automation_count": 0.15,
    "scripts_scenes": 0.15,
    "helpers": 0.10,
    "notifications": 0.15,
    "advanced": 0.15,
}

# The window over which "did this actually get used" is judged, in days. Thirty
# days covers seasonal-ish routines without letting a rule that ran once in
# spring count as current use.
USAGE_WINDOW_DAYS = 30

# Attribute automations carry with the time they last ran.
ATTR_LAST_TRIGGERED = "last_triggered"

# Knee for the combined script and scene count. Ten between them is a house
# with a few one-touch routines, which is the behaviour this rewards.
K_SCRIPT_SCENE_COUNT = 10.0

# Entity domains for scripts and scenes.
SCRIPT_DOMAIN = "script"
SCENE_DOMAIN = "scene"

# Knee for the helper count. A dozen helpers is a house someone has actually
# shaped around how they live, rather than one left at defaults.
K_HELPER_COUNT = 12.0

# Domains that count as helpers. Read from the entity registry rather than from
# states, so a helper that is currently unavailable still counts as configured.
HELPER_DOMAINS: frozenset[str] = frozenset(
    {
        "input_boolean",
        "input_button",
        "input_datetime",
        "input_number",
        "input_select",
        "input_text",
        "counter",
        "timer",
        "schedule",
    }
)

# Notifications have no history without the recorder, so HAUS keeps its own
# rolling tally. Until it has this many days of data the metric sits at a
# neutral value: a fresh install must not be punished for a counter that has
# not had time to run.
NOTIFY_MIN_HISTORY_DAYS = 7

# The score a metric takes while it has nothing trustworthy to say. Deliberately
# mid-scale: neither a reward nor a penalty.
NEUTRAL_METRIC_SCORE = 50.0

# Knee for notifications sent in the window. Thirty over thirty days is roughly
# one a day, which is a house that talks back.
K_NOTIFICATION_COUNT = 30.0

# Storage for the counters HAUS keeps itself. Bumping the version requires a
# migration in store.py; the counters are cheap to lose but not free.
STORAGE_VERSION = 1
STORAGE_KEY = "haus.counters"

# Debounce for writes. Notifications can arrive in bursts, and none of this is
# worth a disk write per event.
STORE_SAVE_DELAY_SECONDS = 60

# Service domain whose calls count as a notification going out.
NOTIFY_DOMAIN = "notify"

# Advanced features worth recognising, each an equal share of that metric.
# "Blueprints in use" is deliberately absent: knowing whether an automation was
# built from a blueprint means reading configuration from disk, which the
# collectors do not do. See the README for the open question.
ADVANCED_FEATURES: frozenset[str] = frozenset(
    {
        "template_entities",
        "zones",
        "voice_assistant",
    }
)

# Zones a stock instance already has. `zone.home` exists on every install, so it
# is not evidence of anything.
STOCK_ZONE_ENTITY_IDS: frozenset[str] = frozenset({"zone.home"})

ZONE_DOMAIN = "zone"

# Entity registry platform that template helpers and template entities use.
TEMPLATE_PLATFORM = "template"

# Entity domains that indicate a voice assistant is actually set up.
VOICE_ASSISTANT_DOMAINS: frozenset[str] = frozenset(
    {"assist_satellite", "stt", "tts", "wake_word"}
)

# The groups breadth is measured across. Forty Hue bulbs is one integration,
# not forty, and two lighting brands are still one kind of thing: the pillar
# scores the spread across these groups, not the size of the estate.
DIVERSITY_GROUPS: frozenset[str] = frozenset(
    {
        "lighting",
        "climate",
        "energy",
        "media",
        "network",
        "protocols",
        "presence",
        "security",
        "alarm",
        "camera",
        "doorbell",
        "lock",
        "covers",
        "vacuum",
        "irrigation",
        "weather",
        "air_quality",
        "calendar",
        "voice",
        "notify",
        "sensors",
        "appliance",
        "transport",
        "health",
        "printer",
        "storage",
        "tools",
    }
)

# Where an unrecognised domain lands. Not a group anyone can "cover": it exists
# so an unknown custom integration never crashes the mapping.
OTHER_GROUP = "other"

# How many groups a well-rounded instance covers. Not the full 27 - nobody has
# a printer, a vacuum and an irrigation controller - but deliberately above the
# broadest real estate seen so far, so the coverage half does not saturate and
# leave a quarter of the score with nothing left to earn. Raised 12 -> 16 -> 20:
# at 16 an instance covering 17 groups still capped at a pinned 98, where at 20
# it reads about 90 and the bar has somewhere to go.
TARGET_GROUPS = 20

# Curated domain to group mapping. Anything absent falls into OTHER_GROUP.
DOMAIN_GROUPS: dict[str, str] = {
    # lighting
    "hue": "lighting",
    "lifx": "lighting",
    "tradfri": "lighting",
    "wled": "lighting",
    "yeelight": "lighting",
    "deconz": "lighting",
    "elgato": "lighting",
    "nanoleaf": "lighting",
    "twinkly": "lighting",
    "govee_light_local": "lighting",
    "hyperion": "lighting",
    # climate
    "nest": "climate",
    "ecobee": "climate",
    "tado": "climate",
    "honeywell": "climate",
    "netatmo": "climate",
    "daikin": "climate",
    "sensibo": "climate",
    "melcloud": "climate",
    "evohome": "climate",
    "generic_thermostat": "climate",
    "smartthinq": "climate",
    # energy
    "tesla_powerwall": "energy",
    "solaredge": "energy",
    "enphase_envoy": "energy",
    "fronius": "energy",
    "sma": "energy",
    "growatt_server": "energy",
    "dsmr": "energy",
    "p1_monitor": "energy",
    "sense": "energy",
    "tibber": "energy",
    "forecast_solar": "energy",
    "energyzero": "energy",
    "nordpool": "energy",
    # media
    "cast": "media",
    "spotify": "media",
    "sonos": "media",
    "plex": "media",
    "jellyfin": "media",
    "kodi": "media",
    "apple_tv": "media",
    "androidtv": "media",
    "samsungtv": "media",
    "webostv": "media",
    "roku": "media",
    "denonavr": "media",
    "squeezebox": "media",
    "music_assistant": "media",
    "emby": "media",
    "heos": "media",
    # network
    "unifi": "network",
    "fritz": "network",
    "fritzbox": "network",
    "asuswrt": "network",
    "mikrotik": "network",
    "netgear": "network",
    "ping": "network",
    "dnsip": "network",
    "speedtestdotnet": "network",
    "nmap_tracker": "network",
    "upnp": "network",
    "adguard": "network",
    "pi_hole": "network",
    # protocols and hubs
    "mqtt": "protocols",
    "zha": "protocols",
    "zwave_js": "protocols",
    "esphome": "protocols",
    "matter": "protocols",
    "thread": "protocols",
    "bluetooth": "protocols",
    "tuya": "protocols",
    "homekit_controller": "protocols",
    "insteon": "protocols",
    "rfxtrx": "protocols",
    "knx": "protocols",
    "modbus": "protocols",
    "tasmota": "protocols",
    "shelly": "protocols",
    "homematicip_cloud": "protocols",
    # presence
    "mobile_app": "presence",
    "life360": "presence",
    "owntracks": "presence",
    "ibeacon": "presence",
    "private_ble_device": "presence",
    "traccar": "presence",
    # security and alarm
    "konnected": "security",
    "abode": "security",
    "simplisafe": "security",
    "alarmdecoder": "alarm",
    "elkm1": "alarm",
    "satel_integra": "alarm",
    "manual": "alarm",
    "ialarm": "alarm",
    # camera and doorbell
    "unifiprotect": "camera",
    "reolink": "camera",
    "amcrest": "camera",
    "onvif": "camera",
    "motioneye": "camera",
    "blink": "camera",
    "generic": "camera",
    "ring": "doorbell",
    "doorbird": "doorbell",
    "aiphone": "doorbell",
    # lock
    "august": "lock",
    "nuki": "lock",
    "tedee": "lock",
    "yale_smart_alarm": "lock",
    "verisure": "lock",
    # covers
    "overkiz": "covers",
    "myq": "covers",
    "motion_blinds": "covers",
    "soma": "covers",
    "tahoma": "covers",
    "aladdin_connect": "covers",
    # vacuum
    "roomba": "vacuum",
    "roborock": "vacuum",
    "neato": "vacuum",
    "ecovacs": "vacuum",
    "dreame_vacuum": "vacuum",
    "xiaomi_miio": "vacuum",
    # irrigation
    "rainmachine": "irrigation",
    "rachio": "irrigation",
    "hydrawise": "irrigation",
    "bhyve": "irrigation",
    # weather and air quality
    "met": "weather",
    "openweathermap": "weather",
    "accuweather": "weather",
    "buienradar": "weather",
    "metoffice": "weather",
    "pirateweather": "weather",
    "airly": "air_quality",
    "airvisual": "air_quality",
    "awair": "air_quality",
    "purpleair": "air_quality",
    "waqi": "air_quality",
    "airthings": "air_quality",
    # calendar
    "google": "calendar",
    "caldav": "calendar",
    "local_calendar": "calendar",
    "ics_calendar": "calendar",
    # voice
    "assist_pipeline": "voice",
    "wyoming": "voice",
    "openai_conversation": "voice",
    "google_generative_ai_conversation": "voice",
    "ollama": "voice",
    "assist_microphone": "voice",
    # notify
    "telegram_bot": "notify",
    "pushover": "notify",
    "pushbullet": "notify",
    "signal_messenger": "notify",
    "slack": "notify",
    "smtp": "notify",
    "gotify": "notify",
    "ntfy": "notify",
    # generic sensing
    "aranet": "sensors",
    "xiaomi_ble": "sensors",
    "govee_ble": "sensors",
    "inkbird": "sensors",
    "switchbot": "sensors",
    "qingping": "sensors",
    "moat": "sensors",
    # appliances
    "home_connect": "appliance",
    "smartthings": "appliance",
    "miele": "appliance",
    "lg_thinq": "appliance",
    "nespresso": "appliance",
    # transport
    "tesla_fleet": "transport",
    "bmw_connected_drive": "transport",
    "renault": "transport",
    "kia_uvo": "transport",
    "nissan_leaf": "transport",
    "volvooncall": "transport",
    "nederlandse_spoorwegen": "transport",
    "easyenergy": "transport",
    # health
    "withings": "health",
    "fitbit": "health",
    "google_fit": "health",
    "oralb": "health",
    # printer
    "cups": "printer",
    "ipp": "printer",
    "brother": "printer",
    "epson": "printer",
    "prusalink": "printer",
    "octoprint": "printer",
    # storage and system
    "synology_dsm": "storage",
    "qnap": "storage",
    "systemmonitor": "storage",
    "glances": "storage",
    "nut": "storage",
    "backup": "storage",
    # tools
    "command_line": "tools",
    "rest": "tools",
    "scrape": "tools",
    "file": "tools",
    "folder_watcher": "tools",
    "workday": "tools",
    "uptime": "tools",
    "worldclock": "tools",
    "sun": "tools",
}

# Composition of the users pillar. Accounts carry the most: a home only its
# builder can operate is a hobby, and everything else here is a refinement of
# that. Recent activity is worth more than sustained activity because it says
# the house is being operated now, not that it once was.
USERS_METRIC_WEIGHTS: dict[str, float] = {
    "accounts": 0.35,
    "mobile_apps": 0.20,
    "activity_7d": 0.25,
    "activity_30d": 0.20,
}

# Knee for the count of usable accounts. Two is the point of the pillar - a
# second person who can operate the house - so k=2 puts the 63% mark there.
K_ACTIVE_ACCOUNTS = 2.0

# Config-entry domain each mobile app registration creates.
MOBILE_APP_DOMAIN = "mobile_app"

# Two windows for household activity. Seven days says the house is being
# operated now; thirty says it is operated at all. Both are rolling.
ACTIVITY_RECENT_DAYS = 7
ACTIVITY_SUSTAINED_DAYS = 30

# Per-user activity detail is opt-in and defaults off. Even when it is on, the
# counts are never state attributes: the detail card asks for them over an
# admin-checked websocket command.
CONF_EXPOSE_PER_USER_DETAIL = "expose_per_user_detail"
DEFAULT_EXPOSE_PER_USER_DETAIL = False

# Websocket command the household detail card calls. Admin-checked, and only
# answered when the instance has opted in to per-user detail.
WS_TYPE_USER_ACTIVITY = "haus/user_activity"

# HAGHS measures whether an instance is healthy; HAUS measures whether it is
# being used, and consumes the hygiene pillar from it rather than recomputing
# it. Detection is by loaded config entry, so installing HAGHS later makes the
# pillar appear without touching HAUS's own configuration. There is
# deliberately no manifest dependency: HAUS must set up cleanly without it.
HAGHS_DOMAIN = "haghs"
CONF_HAGHS_ENTITY_ID = "haghs_entity_id"
# HAGHS sets `_attr_name` to its own DEFAULT_NAME, "System: HA - Global
# Health Score", with no `has_entity_name`, so Home Assistant slugifies that
# into the entity id. Every release up to 0.4.1 defaulted to
# `sensor.haghs_global_score`, which HAGHS has never created - so the hygiene
# pillar silently never engaged on a stock install. A default pointing at a
# missing entity is indistinguishable from HAGHS being absent, which is
# absent-is-never-zero working correctly and hiding the bug in the process.
DEFAULT_HAGHS_ENTITY_ID = "sensor.system_ha_global_health_score"

# Weeks of score history kept for the card's sparkline. HAUS keeps its own
# weekly snapshots rather than querying the recorder, for the same reason it
# tallies notifications itself: the recorder may not be there, may exclude
# these entities, and must not be queried on the event loop.
SCORE_HISTORY_WEEKS = 12

# The card ships inside the integration, not as a separate HACS plugin: HACS
# treats a repository as a single category, so users install one thing and the
# integration serves and registers the card itself.
URL_BASE = "/haus"
CARD_FILENAME = "haus-card.js"

# Household activity is tallied from the moment HAUS starts watching, so a
# fresh install has no history at all. Scoring that as "nobody did anything"
# punishes a new install for a counter that has not had time to run, the same
# trap the notification tally avoids. Each activity metric therefore sits at
# the neutral score until the tally covers its own window: judging a thirty-day
# window on ten days of data would be a guess dressed up as a measurement.
ACTIVITY_MIN_HISTORY_DAYS: dict[str, int] = {
    "activity_7d": ACTIVITY_RECENT_DAYS,
    "activity_30d": ACTIVITY_SUSTAINED_DAYS,
}


# --- Community comparison -------------------------------------------------
#
# Bundled, not fetched. Home Assistant's public analytics publishes no
# distribution of any kind - only means - so there is no percentile to be had
# and nothing a weekly download would learn that a release cannot carry. The
# document is 1 MB gzipped and does not honour a conditional request, which
# would be a poor trade for two integers.
#
# Refresh these when cutting a release, from
# https://analytics.home-assistant.io/data.json ("current" block), and move
# COMMUNITY_AS_OF with them - the card states the date, so a stale figure is
# visible rather than silent.
COMMUNITY_SOURCE_URL = "https://analytics.home-assistant.io/data.json"
COMMUNITY_AS_OF = "2026-09-03"

# avg_automations. Home Assistant counts automation entities, which is exactly
# what automations_defined counts, so this one is like for like.
COMMUNITY_AVG_AUTOMATIONS = 14

# avg_users. Home Assistant counts non-system-generated users; HAUS's
# active_accounts additionally requires the account to be active, so this
# figure can read very slightly high against ours. The explanation says so.
COMMUNITY_AVG_USERS = 2

# reports_statistics against active_installations at the time above: the
# averages cover this many installs, not the whole fleet.
COMMUNITY_REPORTING_INSTALLS = 526848

# avg_integrations is deliberately NOT carried. Home Assistant counts loaded
# built-in integrations that pass its reporting filter, excluding custom ones
# entirely; the diversity pillar counts distinct config-entry domains and does
# include custom integrations. The two numbers do not measure the same thing,
# and comparing them would flatter or punish an instance for no reason.


# --- Tier transitions -----------------------------------------------------
#
# Fired when the score crosses into a different tier, so an automation can
# react to "you levelled up" without polling the sensor and doing the banding
# itself. Carries previous_tier, tier, score and direction.
EVENT_TIER_CHANGED = "haus_tier_changed"
