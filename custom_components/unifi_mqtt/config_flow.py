"""Config flow for UniFi Device Info integration."""
import logging
import voluptuous as vol

import homeassistant.helpers.config_validation as cv
from homeassistant import config_entries

from .const import (
    DOMAIN,
    CONF_HOST,
    CONF_USERNAME,
    CONF_PASSWORD,
    CONF_SITE_ID,
    CONF_PORT,
    CONF_VERIFY_SSL,
    CONF_VERSION,
    CONF_UPDATE_INTERVAL,
    VERSION_OPTIONS,
    DEFAULT_SITE_ID,
    DEFAULT_PORT,
    DEFAULT_VERIFY_SSL,
    DEFAULT_VERSION,
    DEFAULT_UPDATE_INTERVAL
)

_LOGGER = logging.getLogger(__name__)

DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_HOST): cv.string,
    vol.Required(CONF_USERNAME): cv.string,
    vol.Required(CONF_PASSWORD): cv.string,
    vol.Optional(CONF_SITE_ID, default=DEFAULT_SITE_ID): cv.string,
    vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
    vol.Optional(CONF_VERIFY_SSL, default=DEFAULT_VERIFY_SSL): cv.boolean,
    vol.Optional(CONF_VERSION, default=DEFAULT_VERSION): vol.In(VERSION_OPTIONS),
    vol.Optional(CONF_UPDATE_INTERVAL, default=DEFAULT_UPDATE_INTERVAL): cv.positive_int,
})

class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for UniFi Device Info integration."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        if user_input is not None:
            return self.async_create_entry(title="UniFi MQTT", data=user_input)

        return self.async_show_form(
            step_id="user", data_schema=DATA_SCHEMA, errors=errors
        )
