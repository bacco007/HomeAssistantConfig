"""Config flow: a single confirmation step, no user input needed."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN, INDEX_URL, NAME


class BreakageRadarConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Breakage Radar."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Confirm and create the single entry."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title=NAME, data={})

        return self.async_show_form(
            step_id="user",
            description_placeholders={"index_url": INDEX_URL},
        )
