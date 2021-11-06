"""Config flow for Solcast Solar integration."""
from __future__ import annotations

from typing import Any
from homeassistant.helpers.config_validation import boolean

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlow
from homeassistant.const import CONF_NAME, CONF_API_KEY
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import CONF_RESOURCE_ID, CONF_API_LIMIT, CONF_SSL_DISABLE, CONF_AUTO_FORCAST, CONF_AUTO_HISTORY, DOMAIN


class SolcastSolarFlowHandler(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Solcast Solar."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: ConfigEntry,
    ) -> SolcastSolarOptionFlowHandler:
        """Get the options flow for this handler."""
        return SolcastSolarOptionFlowHandler(config_entry)

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle a flow initiated by the user."""
        if user_input is not None:
            return self.async_create_entry(
                title=user_input[CONF_NAME],
                data = {},
                options={
                    CONF_API_KEY: user_input[CONF_API_KEY],
                    CONF_RESOURCE_ID: user_input[CONF_RESOURCE_ID],
                    #CONF_AUTO_FORCAST: user_input[CONF_AUTO_FORCAST],
                    #CONF_AUTO_HISTORY: user_input[CONF_AUTO_HISTORY],
                    CONF_API_LIMIT: user_input[CONF_API_LIMIT],
                    CONF_SSL_DISABLE: user_input[CONF_SSL_DISABLE],
                },
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_NAME, default=self.hass.config.location_name
                    ): str,
                    vol.Required(CONF_API_KEY, default=""): str,
                    vol.Required(CONF_RESOURCE_ID, default=""): str,
                    #vol.Optional(CONF_AUTO_FORCAST, default=False): bool,
                    #vol.Optional(CONF_AUTO_HISTORY, default=False): bool,
                    vol.Optional(CONF_API_LIMIT, default=50): vol.All(
                        vol.Coerce(int), vol.Range(min=1, max=50)
                    ),
                    vol.Optional(CONF_SSL_DISABLE, default=False): boolean,
                }
            ),
        )


class SolcastSolarOptionFlowHandler(OptionsFlow):
    """Handle options."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_API_KEY,
                        default=self.config_entry.options.get(CONF_API_KEY),
                    ): str,
                    vol.Required(
                        CONF_RESOURCE_ID,
                        default=self.config_entry.options.get(CONF_RESOURCE_ID),
                    ): str,
                    #vol.Required(
                    #    CONF_AUTO_FORCAST,
                    #    default=self.config_entry.options.get(CONF_AUTO_FORCAST),
                    #): boolean,
                    #vol.Required(
                    #    CONF_AUTO_HISTORY,
                    #    default=self.config_entry.options.get(CONF_AUTO_HISTORY),
                    #): boolean,
                    vol.Required(
                        CONF_API_LIMIT,
                        default=self.config_entry.options[CONF_API_LIMIT],
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=50)),
                    vol.Required(
                        CONF_SSL_DISABLE,
                        default=self.config_entry.options.get(CONF_SSL_DISABLE),
                    ): boolean,
                }
            ),
        )
