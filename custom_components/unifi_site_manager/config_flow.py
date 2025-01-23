"""Config flow for UniFi Site Manager integration."""
from __future__ import annotations

from typing import Any
from asyncio import timeout

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_API_KEY
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import (
    UnifiSiteManagerAPI,
    UnifiSiteManagerAuthError,
    UnifiSiteManagerConnectionError,
)
from .const import DOMAIN

class UnifiSiteManagerFlowHandler(ConfigFlow, domain=DOMAIN):
    """Config flow for UniFi Site Manager."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initialized by the user."""
        errors = {}

        if user_input is not None:
            try:
                async with timeout(10):
                    api = UnifiSiteManagerAPI(
                        hass=self.hass,
                        api_key=user_input[CONF_API_KEY],
                    )
                    # Validate the API key by making a test request
                    await api.async_validate_api_key()

            except UnifiSiteManagerAuthError:
                errors[CONF_API_KEY] = "invalid_auth"
            except UnifiSiteManagerConnectionError:
                errors["base"] = "cannot_connect"
            except Exception:  # pylint: disable=broad-except
                errors["base"] = "unknown"
            else:
                await self.async_set_unique_id(
                    user_input[CONF_API_KEY],
                    raise_on_progress=False,
                )
                return self.async_create_entry(
                    title="UniFi Site Manager",
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_API_KEY): str,
                }
            ),
            errors=errors,
        )

    async def async_step_reauth(self, entry_data: dict[str, Any]) -> ConfigFlowResult:
        """Handle reauthorization flow."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle reauthorization confirmation."""
        errors = {}

        if user_input is not None:
            try:
                async with timeout(10):
                    api = UnifiSiteManagerAPI(
                        hass=self.hass,
                        api_key=user_input[CONF_API_KEY],
                    )
                    await api.async_validate_api_key()

            except UnifiSiteManagerAuthError:
                errors[CONF_API_KEY] = "invalid_auth"
            except UnifiSiteManagerConnectionError:
                errors["base"] = "cannot_connect"
            except Exception:  # pylint: disable=broad-except
                errors["base"] = "unknown"
            else:
                existing_entry = await self.async_set_unique_id(
                    user_input[CONF_API_KEY]
                )
                if existing_entry:
                    self.hass.config_entries.async_update_entry(
                        existing_entry,
                        data=user_input,
                    )
                    await self.hass.config_entries.async_reload(existing_entry.entry_id)
                    return self.async_abort(reason="reauth_successful")

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=vol.Schema({vol.Required(CONF_API_KEY): str}),
            errors=errors,
        )