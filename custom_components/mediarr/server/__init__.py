"""The Mediarr Server integration."""
from homeassistant.const import CONF_TOKEN, CONF_URL
import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from ..common.const import CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS

# Base schema for all media servers
MEDIA_SERVER_BASE_SCHEMA = {
    vol.Required(CONF_TOKEN): cv.string,
    vol.Required(CONF_URL): cv.url,
    vol.Optional(CONF_MAX_ITEMS, default=DEFAULT_MAX_ITEMS): cv.positive_int,
}
