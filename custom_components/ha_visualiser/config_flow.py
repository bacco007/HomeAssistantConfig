"""Config flow for Home Assistant Entity Visualizer integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Home Assistant Entity Visualizer."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        # Check if already configured
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")

        if user_input is not None:
            # Simple setup complete - create the integration entry
            _LOGGER.info("Entity Visualizer: Creating config entry via UI")
            return self.async_create_entry(
                title="Entity Visualizer",
                data={},
            )

        # Show the setup form with helpful description
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
            description_placeholders={
                "description": (
                    "**Entity Visualizer** adds an interactive graph panel to your Home Assistant sidebar.\n\n"
                    "**What you'll get:**\n"
                    "• **Interactive Entity Graph** - Visualize your entities and their relationships\n"
                    "• **Smart Search** - Find and explore any entity (lights, sensors, switches, etc.)\n"
                    "• **Relationship Discovery** - See how devices, areas, automations, and templates connect\n"
                    "• **Visual Navigation** - Click through your Home Assistant setup graphically\n"
                    "• **Advanced Filtering** - Filter by domains, areas, or relationship types\n\n"
                    "**After setup:** Look for '**Entity Visualizer**' in your sidebar to start exploring!\n\n"
                    "*No configuration needed - just click Submit to install.*"
                )
            },
        )

    async def async_step_import(self, import_info: dict[str, Any]) -> FlowResult:
        """Handle import from YAML configuration."""
        _LOGGER.info("Entity Visualizer: Importing from YAML configuration")
        
        # Check if already configured via UI
        if self._async_current_entries():
            _LOGGER.debug("Entity Visualizer already configured via UI, skipping YAML import")
            return self.async_abort(reason="already_configured")

        # Create entry from YAML import
        return self.async_create_entry(
            title="Entity Visualizer (YAML)",
            data=import_info or {},
        )