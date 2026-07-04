DOMAIN = "uix"
NAME = "UI eXtension for Home Assistant"

CARD_MOD_FRONTEND_SCRIPT_URL = "card-mod.js"
FRONTEND_SCRIPT_URL = "uix.js"

DATA_EXTRA_MODULE_URL = "frontend_extra_module_url"

WS_CONNECT = f"{DOMAIN}/connect"
WS_LOG = f"{DOMAIN}/log"

CONF_FOUNDRIES = "foundries"
CONF_FOUNDRY_FILES = "foundry_files"

CONF_HASS_THROTTLE_ENABLE = "hass_throttle_enable"
CONF_HASS_THROTTLE_MS = "hass_throttle_ms"
DEFAULT_HASS_THROTTLE_MS = 200

CONF_DIALOG_APPLY_AFTER_SHOW = "dialog_apply_after_show"
CONF_DISABLE_HASH_TEMPLATE_VARIABLE = "disable_hash_template_variable"

WS_GET_FOUNDRIES = f"{DOMAIN}/get_foundries"
WS_SET_FOUNDRY = f"{DOMAIN}/set_foundry"
WS_DELETE_FOUNDRY = f"{DOMAIN}/delete_foundry"
WS_ADD_FOUNDRY_FILE = f"{DOMAIN}/add_foundry_file"
WS_REMOVE_FOUNDRY_FILE = f"{DOMAIN}/remove_foundry_file"
WS_RELOAD_FOUNDRY_FILES = f"{DOMAIN}/reload_foundry_files"
WS_CHECK_FOUNDRY_FILES = f"{DOMAIN}/check_foundry_files"

EVENT_FOUNDRIES_UPDATED = f"{DOMAIN}_foundries_updated"