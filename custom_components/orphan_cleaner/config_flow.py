"""Config flow for Orphan Entity Cleaner."""
from __future__ import annotations

from homeassistant import config_entries
from .const import DOMAIN


class OrphanCleanerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Single-step config flow — no parameters needed."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")
        if user_input is not None:
            return self.async_create_entry(title="Orphan Entity Cleaner", data={})
        return self.async_show_form(step_id="user", data_schema=None)
