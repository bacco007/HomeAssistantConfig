"""Config flow for Football Hub."""

from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries

from .const import DOMAIN
from .competitions import DEFAULT_SEASON, SEASONS


class FootballHubConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Set up free ESPN-powered Football Hub."""

    VERSION = 3

    async def async_step_user(self, user_input=None):
        """Create an ESPN entry without requiring credentials."""
        if user_input is not None:
            await self.async_set_unique_id("football_hub")
            self._abort_if_unique_id_configured()

            return self.async_create_entry(
                title=f"Football Hub - {SEASONS.get(DEFAULT_SEASON, DEFAULT_SEASON)}",
                data={
                    "country": "England",
                    "competition": "premier_league",
                    "season": DEFAULT_SEASON,
                    "provider_mode": "espn",
                },
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
        )
