"""Adds config flow for foldingathomecontrol."""

import voluptuous as vol
from homeassistant import config_entries, core, exceptions

from .const import CONF_ADDRESS, CONF_PASSWORD, CONF_PORT, DOMAIN

DATA_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_ADDRESS, default="localhost"): str,
        vol.Optional(CONF_PORT, default=36330): int,
        vol.Optional(CONF_PASSWORD): str,
    },
)


async def validate_input(hass: core.HomeAssistant, data):
    """Validate the user input allows us to connect."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.data[CONF_ADDRESS] == data[CONF_ADDRESS]:
            raise AlreadyConfigured


@config_entries.HANDLERS.register(DOMAIN)
class FoldingAtHomeControllerFlowHandler(config_entries.ConfigFlow):
    """Config flow for Blueprint."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_PUSH

    def __init__(self):
        """Initialize."""
        self._errors = {}

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        if user_input is not None:
            try:
                await validate_input(self.hass, user_input)
                return self.async_create_entry(
                    title=user_input[CONF_ADDRESS], data=user_input
                )
            except AlreadyConfigured:
                return self.async_abort(reason="already_configured")

        return self.async_show_form(
            step_id="user", data_schema=DATA_SCHEMA, errors=errors
        )

    async def async_step_import(self, import_config):
        """Import from Glances sensor config."""

        return await self.async_step_user(user_input=import_config)


class AlreadyConfigured(exceptions.HomeAssistantError):
    """Error to indicate host is already configured."""
