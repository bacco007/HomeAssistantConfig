"""Config and options flow for HAUS."""

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback

from .const import (
    CONF_EXPOSE_PER_USER_DETAIL,
    CONF_HAGHS_ENTITY_ID,
    DEFAULT_EXPOSE_PER_USER_DETAIL,
    DEFAULT_HAGHS_ENTITY_ID,
    DOMAIN,
    INTEGRATION_TITLE,
)


class HausConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the HAUS config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle a flow started by the user."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is None:
            return self.async_show_form(step_id="user")
        return self.async_create_entry(title=INTEGRATION_TITLE, data={})

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow."""
        return HausOptionsFlow()


class HausOptionsFlow(OptionsFlow):
    """Handle the HAUS options."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        options = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_EXPOSE_PER_USER_DETAIL,
                    default=options.get(
                        CONF_EXPOSE_PER_USER_DETAIL, DEFAULT_EXPOSE_PER_USER_DETAIL
                    ),
                ): bool,
                vol.Optional(
                    CONF_HAGHS_ENTITY_ID,
                    default=options.get(CONF_HAGHS_ENTITY_ID, DEFAULT_HAGHS_ENTITY_ID),
                ): str,
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
