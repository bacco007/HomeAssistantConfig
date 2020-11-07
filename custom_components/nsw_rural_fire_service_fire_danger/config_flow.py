"""Config flow to configure the NSW Rural Fire Service Fire Danger integration."""
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import callback, HomeAssistant

from .const import (
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    CONF_DISTRICT_NAME,
    VALID_DISTRICT_NAMES,
)


@callback
def configured_instances(hass: HomeAssistant):
    """Return a set of configured NSW Rural Fire Service Fire Danger instances."""
    return {
        f"{entry.data[CONF_DISTRICT_NAME]}"
        for entry in hass.config_entries.async_entries(DOMAIN)
    }


class NswRuralFireServiceFireDangerFlowHandler(
    config_entries.ConfigFlow, domain=DOMAIN
):
    """Handle a NSW Rural Fire Service Fire Danger config flow."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    async def _show_form(self, errors=None):
        """Show the form to the user."""
        data_schema = vol.Schema(
            {vol.Required(CONF_DISTRICT_NAME): vol.In(VALID_DISTRICT_NAMES)}
        )

        return self.async_show_form(
            step_id="user", data_schema=data_schema, errors=errors or {}
        )

    async def async_step_import(self, import_config):
        """Import a config entry from configuration.yaml."""
        return await self.async_step_user(import_config)

    async def async_step_user(self, user_input=None):
        """Handle the start of the config flow."""
        if not user_input:
            return await self._show_form()

        identifier = f"{user_input[CONF_DISTRICT_NAME]}"
        await self.async_set_unique_id(identifier)
        self._abort_if_unique_id_configured()

        if identifier in configured_instances(self.hass):
            return self.async_abort(reason="already_configured")

        scan_interval = user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        user_input[CONF_SCAN_INTERVAL] = scan_interval.seconds

        return self.async_create_entry(title=identifier, data=user_input)
