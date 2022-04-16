"""Config flow to configure the NSW Rural Fire Service Fire Danger integration."""
from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult

from .const import (
    CONF_DISTRICT_NAME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
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

    async def _show_form(self, errors: dict[str, Any] | None = None) -> FlowResult:
        """Show the form to the user."""
        data_schema = vol.Schema(
            {vol.Required(CONF_DISTRICT_NAME): vol.In(VALID_DISTRICT_NAMES)}
        )

        return self.async_show_form(
            step_id="user", data_schema=data_schema, errors=errors or {}
        )

    async def async_step_import(self, user_input: dict[str, Any]) -> FlowResult:
        """Import a config entry from configuration.yaml."""
        return await self.async_step_user(user_input)

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
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
