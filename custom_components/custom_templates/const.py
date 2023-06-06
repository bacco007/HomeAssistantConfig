import homeassistant.helpers.config_validation as cv
import voluptuous as vol

DOMAIN = "custom_templates"
CONF_PRELOAD_TRANSLATIONS = "preload_translations"

CUSTOM_TEMPLATES_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema({
            vol.Required(CONF_PRELOAD_TRANSLATIONS): cv.ensure_list(cv.string)
        })
    },
    extra=vol.ALLOW_EXTRA
)

CONST_EVAL_FUNCTION_NAME = "ct_eval"
CONST_STATE_TRANSLATED_FUNCTION_NAME = "ct_state_translated"
CONST_STATE_ATTR_TRANSLATED_FUNCTION_NAME = "ct_state_attr_translated"
CONST_TRANSLATED_FUNCTION_NAME = "ct_translated"
CONST_ALL_TRANSLATIONS_FUNCTION_NAME = "ct_all_translations"
