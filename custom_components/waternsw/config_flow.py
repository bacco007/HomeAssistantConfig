from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import CONF_SITE_ID, CONF_WATERBODY_NAME, DOMAIN


class WaterNSWConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for WaterNSW."""

    VERSION = 1

    async def async_step_user(self, user_input=None) -> FlowResult:
        """Handle the initial step."""
        if user_input is not None:
            await self.async_set_unique_id(str(user_input[CONF_SITE_ID]))
            self._abort_if_unique_id_configured()

            return self.async_create_entry(
                title=user_input[CONF_WATERBODY_NAME],
                data=user_input,
            )

        schema = vol.Schema(
            {
                vol.Required(CONF_WATERBODY_NAME): str,
                vol.Required(CONF_SITE_ID): str,
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors={},
        )