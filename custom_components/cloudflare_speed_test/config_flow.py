"""Config flow for Cloudflare Speed Test."""

from homeassistant.config_entries import ConfigFlow

from .const import (
    DOMAIN,
)


class CloudflareSpeedTestFlowHandler(ConfigFlow, domain=DOMAIN):
    """Handle Cloudflare Speed Test config flow."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""
        if user_input is not None:
            return self.async_create_entry(title="Cloudflare Speed Test", data={})

        return self.async_show_form(step_id="user")
