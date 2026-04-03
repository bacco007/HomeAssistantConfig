from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import CONF_RESOURCE, CONF_SELECTOR, DEFAULT_NAME, DEFAULT_RESOURCE, DOMAIN


class DoomsdayClockConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Doomsday Clock."""

    VERSION = 1

    async def async_step_user(self, user_input=None) -> FlowResult:
        """Handle the initial step."""
        if user_input is not None:
            await self.async_set_unique_id("doomsday_clock_main")
            self._abort_if_unique_id_configured()

            return self.async_create_entry(
                title=DEFAULT_NAME,
                data=user_input,
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_RESOURCE, default=DEFAULT_RESOURCE): str,
                    vol.Optional(CONF_SELECTOR): str,
                }
            ),
            errors={},
        )