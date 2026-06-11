"""Config flow for Custom Component Monitor integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector

from .const import CONF_EXCLUDE, DOMAIN

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema({})


class PlaceholderHub:
    """Placeholder class to make tests pass."""

    def __init__(self, host: str) -> None:
        """Initialize."""
        self.host = host

    async def authenticate(self, username: str, password: str) -> bool:
        """Test if we can authenticate with the host."""
        return True


async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Validate the user input allows us to connect."""
    # For now, no validation is needed as this integration doesn't require configuration
    return {"title": "Custom Component Monitor"}


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Custom Component Monitor."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> "OptionsFlowHandler":
        """Get the options flow (exclusion list, #70)."""
        return OptionsFlowHandler()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                info = await validate_input(self.hass, user_input)
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(title=info["title"], data=user_input)

        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
        )


class OptionsFlowHandler(config_entries.OptionsFlow):
    """Manage the exclusion list of components wrongly flagged as unused (#70)."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            exclude = user_input.get(CONF_EXCLUDE, [])
            # Normalise to a clean list of strings.
            if isinstance(exclude, str):
                exclude = [exclude]
            exclude = [str(x).strip() for x in exclude if str(x).strip()]
            return self.async_create_entry(title="", data={CONF_EXCLUDE: exclude})

        current = self.config_entry.options.get(CONF_EXCLUDE, []) or []

        # Offer the currently-unused component names as quick-pick options, while
        # still allowing free-text entries (custom_value) for anything else.
        unused_names: set[str] = set(current)
        coordinator = self.hass.data.get(DOMAIN, {}).get("coordinator")
        if coordinator is not None and coordinator.data:
            for bucket in ("integrations", "themes", "frontend"):
                for item in coordinator.data.get(bucket, {}).get("unused", []):
                    name = item.get("name") or item.get("domain") or item.get("card_type")
                    if name:
                        unused_names.add(str(name))

        schema = vol.Schema(
            {
                vol.Optional(CONF_EXCLUDE, default=current): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=sorted(unused_names),
                        multiple=True,
                        custom_value=True,
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                )
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)