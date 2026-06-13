"""Config flow for World Cup 2026."""
from __future__ import annotations

import logging
from typing import Any

import aiohttp
import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_API_KEY,
    DEFAULT_DEMO_MODE,
    DEFAULT_NAME,
    DOMAIN,
    OPT_DEMO_MODE,
)

_LOGGER = logging.getLogger(__name__)

_API_VALIDATE_URL = "https://api.football-data.org/v4/competitions/WC"
_REQUEST_TIMEOUT = aiohttp.ClientTimeout(total=10)


class CannotConnect(Exception):
    """Raised when the API cannot be reached."""


class InvalidAuth(Exception):
    """Raised when the API key is rejected (403)."""


async def _validate_api_key(hass: HomeAssistant, api_key: str) -> None:
    """
    Perform a lightweight validation call to football-data.org.

    Fetches the WC competition resource (not the full match list) to keep
    the validation fast and within free-tier rate limits.

    Raises:
        InvalidAuth: API returned HTTP 403 — key is wrong or inactive.
        CannotConnect: Any network / timeout / unexpected HTTP error.
    """
    session = async_get_clientsession(hass)
    try:
        async with session.get(
            _API_VALIDATE_URL,
            headers={"X-Auth-Token": api_key},
            timeout=_REQUEST_TIMEOUT,
        ) as resp:
            if resp.status == 403:
                raise InvalidAuth
            resp.raise_for_status()
    except InvalidAuth:
        raise
    except Exception as err:
        _LOGGER.debug("API validation failed: %s", err)
        raise CannotConnect from err


class WorldCupConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the initial setup config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Show the API key form and validate on submit."""
        errors: dict[str, str] = {}

        if user_input is not None:
            try:
                await _validate_api_key(self.hass, user_input[CONF_API_KEY])
            except InvalidAuth:
                errors[CONF_API_KEY] = "invalid_auth"
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:  # noqa: BLE001
                _LOGGER.exception("Unexpected error during API key validation")
                errors["base"] = "unknown"
            else:
                # Prevent duplicate entries for the same integration
                await self.async_set_unique_id(DOMAIN)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(title=DEFAULT_NAME, data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({vol.Required(CONF_API_KEY): str}),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> WorldCupOptionsFlow:
        """Return the options flow handler."""
        return WorldCupOptionsFlow(config_entry)


class WorldCupOptionsFlow(OptionsFlow):
    """
    Handle the integration options (Settings → Configure).

    Currently exposes a single toggle:
      • Demo mode — when ON, the integration loads from local fixture files
        instead of calling football-data.org.  Useful for dashboard development
        when no live tournament is running.

    Saving options triggers an automatic integration reload so the change
    takes effect immediately without a manual HA restart.
    """

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Store the config entry so we can read the current option values."""
        self._config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Show the options form."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current_demo = self._config_entry.options.get(OPT_DEMO_MODE, DEFAULT_DEMO_MODE)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(OPT_DEMO_MODE, default=current_demo): bool,
                }
            ),
        )
