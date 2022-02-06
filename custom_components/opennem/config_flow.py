"""OpenNEM Config Flow"""
from __future__ import annotations

from typing import Any
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult

from .const import CONF_REGION, CONF_REGION_SIMP, DEFAULT_NAME, DOMAIN


@callback
def configured_instances(hass: HomeAssistant):
    """Return configured OpenNEM Instances"""
    return {
        f"{entry.data[CONF_REGION]}"
        for entry in hass.config_entries.async_entries(DOMAIN)
    }


class OpenNEMFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle OpenNEM Config Flow"""

    VERSION = 1

    async def _show_form(self, errors: dict[str, Any] | None = None) -> FlowResult:
        """Show Form to User"""
        data_schema = vol.Schema({vol.Required(CONF_REGION): vol.In(CONF_REGION_SIMP)})

        return self.async_show_form(
            step_id="user", data_schema=data_schema, errors=errors or {}
        )

    async def async_step_import(self, user_input: dict[str, Any]) -> FlowResult:
        """Import Config from YAML"""
        return await self.async_step_user(user_input)

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle Start ConfigFlow"""
        if not user_input:
            return await self._show_form()

        identifier = f"{DEFAULT_NAME} {user_input[CONF_REGION].upper()}"
        await self.async_set_unique_id(identifier)
        self._abort_if_unique_id_configured()

        if identifier in configured_instances(self.hass):
            return self.async_abort(reason="already_configured")

        return self.async_create_entry(title=identifier, data=user_input)
