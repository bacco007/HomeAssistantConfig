"""Adds config flow for foldingathomecontrol."""

import voluptuous as vol
from FoldingAtHomeControl import (
    FoldingAtHomeControlAuthenticationFailed,
    FoldingAtHomeControlAuthenticationRequired,
    FoldingAtHomeControlConnectionFailed,
    FoldingAtHomeController,
)
from homeassistant import config_entries, core, exceptions
from homeassistant.core import callback

from .const import (
    CONF_ADDRESS,
    CONF_PASSWORD,
    CONF_PORT,
    CONF_READ_TIMEOUT,
    CONF_UPDATE_RATE,
    DEFAULT_READ_TIMEOUT,
    DEFAULT_UPDATE_RATE,
    DOMAIN,
)

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
    client = FoldingAtHomeController(
        data[CONF_ADDRESS], data[CONF_PORT], data.get(CONF_PASSWORD)
    )
    await client.try_connect_async(timeout=5)
    await client.cleanup_async()


@config_entries.HANDLERS.register(DOMAIN)
class FoldingAtHomeControllerFlowHandler(config_entries.ConfigFlow):
    """Config flow for FoldingAtHomeControl."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_PUSH

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return FoldingAtHomeControlOptionsFlowHandler(config_entry)

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
            except FoldingAtHomeControlConnectionFailed:
                errors["base"] = "cannot_connect"
            except FoldingAtHomeControlAuthenticationRequired:
                errors["base"] = "auth_required"
            except FoldingAtHomeControlAuthenticationFailed:
                errors["base"] = "auth_failed"

        return self.async_show_form(
            step_id="user", data_schema=DATA_SCHEMA, errors=errors
        )

    async def async_step_import(self, import_config):
        """Import from Glances sensor config."""

        return await self.async_step_user(user_input=import_config)


class FoldingAtHomeControlOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle FoldingAtHomeControl client options."""

    def __init__(self, config_entry):
        """Initialize FoldingAtHomeControl options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the FoldingAtHomeControl options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        options = {
            vol.Optional(
                CONF_UPDATE_RATE,
                default=self.config_entry.options.get(
                    CONF_UPDATE_RATE, DEFAULT_UPDATE_RATE
                ),
            ): int,
            vol.Optional(
                CONF_READ_TIMEOUT,
                default=self.config_entry.options.get(
                    CONF_READ_TIMEOUT, DEFAULT_READ_TIMEOUT
                ),
            ): int,
        }

        return self.async_show_form(step_id="init", data_schema=vol.Schema(options))


class AlreadyConfigured(exceptions.HomeAssistantError):
    """Error to indicate host is already configured."""
