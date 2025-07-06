"""Constants for the WHOOP integration."""

DOMAIN = "whoop"
ISSUE_URL = "https://github.com/prankstr/whoop-go-client/issues"

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
PROFILE_URL = "/v1/user/profile/basic"
BODY_MEASUREMENT_URL = "/v1/user/measurement/body"
RECOVERY_COLLECTION_URL = "/v1/recovery"
SLEEP_COLLECTION_URL = "/v1/activity/sleep"
CYCLE_COLLECTION_URL = "/v1/cycle"
WORKOUT_COLLECTION_URL = "/v1/activity/workout"
