"""Config flow for Entity Manager integration."""

import logging
from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.config_entries import ConfigFlowResult as FlowResult  # type: ignore[attr-defined]

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class EntityManagerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for Entity Manager."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle a flow initialized by the user."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="Entity Manager", data={})

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
        )
