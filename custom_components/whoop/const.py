"""Constants for the WHOOP integration."""
DOMAIN = "whoop"
ISSUE_URL = "https://github.com/prankstr/hassio-whoop/issues"

CONFIG_FLOW_VERSION = 3

CONF_DURATION_UNIT = "duration_unit"
CONF_ENERGY_UNIT = "energy_unit"

DURATION_SECONDS = "seconds"
DURATION_MINUTES = "minutes"
DURATION_HOURS = "hours"
DURATION_MANUAL = "manual"

ENERGY_KILOJOULES = "kj"
ENERGY_KILOCALORIES = "kcal"

DEFAULT_DURATION_UNIT = DURATION_HOURS
DEFAULT_ENERGY_UNIT = ENERGY_KILOCALORIES

OAUTH2_AUTHORIZE = "https://api.prod.whoop.com/oauth/oauth2/auth"
OAUTH2_TOKEN = "https://api.prod.whoop.com/oauth/oauth2/token"

SCOPES = [
    "read:profile",
    "read:cycles",
    "read:recovery",
    "read:sleep",
    "read:workout",
    "read:body_measurement",
]

API_BASE_URL = "https://api.prod.whoop.com/developer"

PROFILE_URL = "/v2/user/profile/basic"
BODY_MEASUREMENT_URL = "/v2/user/measurement/body"
RECOVERY_COLLECTION_URL = "/v2/recovery"
SLEEP_COLLECTION_URL = "/v2/activity/sleep"
CYCLE_COLLECTION_URL = "/v2/cycle"
WORKOUT_COLLECTION_URL = "/v2/activity/workout"
