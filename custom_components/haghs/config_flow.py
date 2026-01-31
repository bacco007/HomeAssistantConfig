"""Config flow for HAGHS integration."""
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.helpers import selector
import homeassistant.helpers.config_validation as cv

from .const import (
    DOMAIN,
    CONF_CPU_SENSOR,
    CONF_RAM_SENSOR,
    CONF_DISK_SENSOR,
    CONF_DB_SENSOR,
    CONF_LOG_SENSOR,
    CONF_CORE_UPDATE_ENTITY,
    CONF_IGNORE_LABEL,
    DEFAULT_IGNORE_LABEL,
)

class HaghsConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for HAGHS."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        if user_input is not None:
            # Create the integration entry
            return self.async_create_entry(title="Global Health Score", data=user_input)

        # The Form Schema (UI)
        schema = vol.Schema({
            vol.Required(CONF_CPU_SENSOR): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor")
            ),
            vol.Required(CONF_RAM_SENSOR): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor")
            ),
            vol.Required(CONF_DISK_SENSOR): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor")
            ),
            vol.Required(CONF_DB_SENSOR): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor")
            ),
            vol.Optional(CONF_LOG_SENSOR): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor")
            ),
            vol.Optional(CONF_CORE_UPDATE_ENTITY, default="update.home_assistant_core_update"): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="update")
            ),
            vol.Optional(CONF_IGNORE_LABEL, default=DEFAULT_IGNORE_LABEL): selector.TextSelector(),
        })

        return self.async_show_form(step_id="user", data_schema=schema)
