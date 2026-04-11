"""Config flow for Hass Data Points."""

from __future__ import annotations

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class DatapointsConfigFlow(ConfigFlow, domain=DOMAIN):
    """Config flow for Hass Data Points – no user inputs required."""

    VERSION = 1

    async def async_step_user(self, user_input=None) -> ConfigFlowResult:
        """Handle the initial step."""
        # Only allow one instance of this integration
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="Hass Data Points", data={})

        return self.async_show_form(step_id="user")
