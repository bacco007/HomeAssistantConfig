"""Config flow for Bulk Entity Editor."""
from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class BulkEntityEditorConfigFlow(ConfigFlow, domain=DOMAIN):
    """Zero-input config flow — single instance, just registers the panel."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        return self.async_create_entry(title="Bulk Entity Editor", data={})
