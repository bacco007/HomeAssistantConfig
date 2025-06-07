"""Config flow for UniFi Insights integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_API_KEY, CONF_HOST, CONF_VERIFY_SSL

from .unifi_network_api import UnifiInsightsClient, UnifiInsightsAuthError, UnifiInsightsConnectionError
from .const import DEFAULT_API_HOST, DOMAIN

_LOGGER = logging.getLogger(__name__)

class UnifiInsightsConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for UniFi Insights."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            try:
                api = UnifiInsightsClient(
                    hass=self.hass,
                    api_key=user_input[CONF_API_KEY],
                    host=user_input.get(CONF_HOST, DEFAULT_API_HOST),
                    verify_ssl=user_input.get(CONF_VERIFY_SSL, False),
                )

                # Validate the API key
                if await api.async_validate_api_key():
                    await self.async_set_unique_id(user_input[CONF_API_KEY])
                    self._abort_if_unique_id_configured()

                    return self.async_create_entry(
                        title="UniFi Insights",
                        data={
                            CONF_API_KEY: user_input[CONF_API_KEY],
                            CONF_HOST: user_input.get(CONF_HOST, DEFAULT_API_HOST),
                            CONF_VERIFY_SSL: user_input.get(CONF_VERIFY_SSL, False),
                        },
                    )

                errors[CONF_API_KEY] = "invalid_auth"

            except UnifiInsightsAuthError:
                errors[CONF_API_KEY] = "invalid_auth"
            except UnifiInsightsConnectionError:
                errors["base"] = "cannot_connect"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_API_KEY): str,
                    vol.Optional(CONF_HOST, default=DEFAULT_API_HOST): str,
                    vol.Optional(CONF_VERIFY_SSL, default=False): bool,
                }
            ),
            errors=errors,
        )

    async def async_step_reauth(self, entry_data: dict[str, Any]) -> ConfigFlowResult:
        """Handle reauthorization if the API key becomes invalid."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Dialog that informs the user that reauth is required."""
        errors = {}

        if user_input is not None:
            try:
                api = UnifiInsightsClient(
                    hass=self.hass,
                    api_key=user_input[CONF_API_KEY],
                    host=self.entry.data.get(CONF_HOST, DEFAULT_API_HOST),
                    verify_ssl=self.entry.data.get(CONF_VERIFY_SSL, False),
                )

                if await api.async_validate_api_key():
                    existing_entry = await self.async_set_unique_id(
                        user_input[CONF_API_KEY]
                    )
                    if existing_entry:
                        self.hass.config_entries.async_update_entry(
                            existing_entry,
                            data={**self.entry.data, CONF_API_KEY: user_input[CONF_API_KEY]},
                        )
                        await self.hass.config_entries.async_reload(existing_entry.entry_id)
                        return self.async_abort(reason="reauth_successful")

            except UnifiInsightsAuthError:
                errors[CONF_API_KEY] = "invalid_auth"
            except UnifiInsightsConnectionError:
                errors["base"] = "cannot_connect"
            except Exception:  # pylint: disable=broad-except
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=vol.Schema({vol.Required(CONF_API_KEY): str}),
            errors=errors,
        )