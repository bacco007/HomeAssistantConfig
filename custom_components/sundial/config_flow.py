"""Config flow for Sundial.

By design this is intentionally tiny: the only thing configured here is *which*
light/group entities to control. Everything else (schemas, curves, modes,
timing) is edited in the web-ui panel.
"""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers import selector
import voluptuous as vol

from .const import CONF_LIGHTS, DOMAIN, PANEL_TITLE

_LIGHTS_SELECTOR = selector.EntitySelector(
    selector.EntitySelectorConfig(domain="light", multiple=True)
)


class SundialConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the initial setup (entity selection only)."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(
                title=PANEL_TITLE,
                data={CONF_LIGHTS: user_input[CONF_LIGHTS]},
            )

        schema = vol.Schema(
            {vol.Required(CONF_LIGHTS, default=[]): _LIGHTS_SELECTOR}
        )
        return self.async_show_form(step_id="user", data_schema=schema)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return SundialOptionsFlow(config_entry)


class SundialOptionsFlow(OptionsFlow):
    """Let the user change the controlled lights after setup."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        self._entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(
                title="", data={CONF_LIGHTS: user_input[CONF_LIGHTS]}
            )

        current = self._entry.options.get(CONF_LIGHTS) or self._entry.data.get(
            CONF_LIGHTS, []
        )
        schema = vol.Schema(
            {vol.Required(CONF_LIGHTS, default=current): _LIGHTS_SELECTOR}
        )
        return self.async_show_form(step_id="init", data_schema=schema)
