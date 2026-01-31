"""Config flow for NEO Watcher integration."""
from __future__ import annotations

import asyncio
import logging
from typing import Any
from urllib.parse import quote

import aiohttp
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
    TimeSelector, 
    TimeSelectorConfig
)

from .const import (
    DOMAIN,
    CONF_API_KEY,
    CONF_WEEKS_AHEAD,
    DEFAULT_WEEKS_AHEAD,
    DEFAULT_NEO_SELECTION,
    CONF_NEO_SELECTION,
    NEO_SELECTION_OPTIONS,
    CONF_TOP_NEOS,
    DEFAULT_TOP_NEOS,
    CONF_SPECIFIC_NEO,
    CONF_UPDATE_HOUR,
    DEFAULT_UPDATE_HOUR,
)

_LOGGER = logging.getLogger(__name__)

SPECIFIC_NEO_RETRIES = 3


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for NEO Watcher."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize the config flow."""
        self.api_key: str | None = None
        self.weeks_ahead: int | None = None
        self.watch_selection: str | None = None
        self.watch_number: int | None = None
        self.top_neos: int | None = None
        self.specific_neo: str | None = None

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}
        if user_input is not None:
            api_key = user_input[CONF_API_KEY]
            self.update_hour = user_input[CONF_UPDATE_HOUR]
            if len(api_key) != 40:
                errors[CONF_API_KEY] = "API Key should be 40 characters long."
            else:
                self.api_key = api_key
                self.watch_selection = user_input[CONF_NEO_SELECTION]
                if self.watch_selection == NEO_SELECTION_OPTIONS[0]:
                    return await self.async_step_top_neos()
                else:
                    return await self.async_step_specific_neo()

        data_schema = vol.Schema(
            {
                vol.Required(CONF_API_KEY): str,
                vol.Optional(
                    CONF_NEO_SELECTION, default=DEFAULT_NEO_SELECTION
                ): vol.In(NEO_SELECTION_OPTIONS),
                vol.Required(
                    CONF_UPDATE_HOUR, default=DEFAULT_UPDATE_HOUR
                ): vol.All(vol.Coerce(int), vol.Range(min=0, max=23)),
            }
        )

        return self.async_show_form(
            step_id="user", data_schema=data_schema, errors=errors
        )

    async def async_step_top_neos(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the top neos step."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self.weeks_ahead = user_input[CONF_WEEKS_AHEAD]
            top_neos = user_input[CONF_TOP_NEOS]
            self.top_neos = top_neos
            return await self.async_step_top_neos_finish()

        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_WEEKS_AHEAD, default=DEFAULT_WEEKS_AHEAD
                ): vol.All(vol.Coerce(int), vol.Range(min=1, max=104)),
                vol.Required(
                    CONF_TOP_NEOS, default=DEFAULT_TOP_NEOS
                ): vol.All(vol.Coerce(int), vol.Range(min=1, max=20)),
            }
        )

        return self.async_show_form(
            step_id="top_neos", data_schema=data_schema, errors=errors
        )

    async def async_step_top_neos_finish(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the finish step."""
        user_data = {
            CONF_API_KEY: self.api_key,
            CONF_WEEKS_AHEAD: self.weeks_ahead,
            CONF_NEO_SELECTION: self.watch_selection,
            CONF_UPDATE_HOUR: self.update_hour,
        }
        if self.top_neos:
            user_data[CONF_TOP_NEOS] = self.top_neos
            await self.async_set_unique_id("Neo_Watcher_TOP_NEOS")
            self._abort_if_unique_id_configured()
        # Validate the input
        try:
            info = await validate_input(self.hass, user_data)
        except CannotConnect:
            return self.async_abort(reason="cannot_connect")
        except InvalidAuth:
            return self.async_abort(reason="invalid_auth")
        except Exception:  # pylint: disable=broad-except
            _LOGGER.exception("Unexpected exception")
            return self.async_abort(reason="unknown")
        else:
            return self.async_create_entry(title="Neo_Watcher", data=user_data)

    async def async_step_specific_neo(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the specific neo step."""
        errors: dict[str, str] = {}
        if user_input is not None:
            specific_neo = user_input[CONF_SPECIFIC_NEO]
            session = async_get_clientsession(self.hass)
            valid, error_message = await self.validate_specific_neo(
                session, specific_neo
            )
            if valid:
                self.specific_neo = specific_neo
                return await self.async_step_specific_neo_finish()
            else:
                errors[CONF_SPECIFIC_NEO] = error_message

        data_schema = vol.Schema(
            {
                vol.Required(CONF_SPECIFIC_NEO): str,
            }
        )

        return self.async_show_form(
            step_id="specific_neo", data_schema=data_schema, errors=errors
        )

    async def async_step_specific_neo_finish(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the finish step."""
        user_data = {
            CONF_API_KEY: self.api_key,
            CONF_NEO_SELECTION: self.watch_selection,
            CONF_UPDATE_HOUR: self.update_hour,
        }
        if self.specific_neo:
            user_data[CONF_SPECIFIC_NEO] = self.specific_neo
            await self.async_set_unique_id("Neo_Watcher_" + str(self.specific_neo))
            self._abort_if_unique_id_configured()
        # Validate the input
        try:
            info = await validate_input(self.hass, user_data)
        except CannotConnect:
            return self.async_abort(reason="cannot_connect")
        except InvalidAuth:
            return self.async_abort(reason="invalid_auth")
        except Exception:  # pylint: disable=broad-except
            _LOGGER.exception("Unexpected exception")
            return self.async_abort(reason="unknown")
        else:
            return self.async_create_entry(title="Neo_Watcher", data=user_data)

    async def validate_specific_neo(
        self, session: aiohttp.ClientSession, specific_neo: str, retry_count=0
    ) -> tuple[bool, str]:
        """Validate the specific NEO name against the NASA API."""
        encoded_neo = quote(specific_neo)
        url = f"http://api.nasa.gov/neo/rest/v1/neo/{encoded_neo}?api_key={self.api_key}"
        # Don't leak API key! _LOGGER.debug(f"Validating specific NEO URL: {url}")
        try:
            async with session.get(url) as response:
                if response.status == 200:
                    _LOGGER.debug(f"Specific NEO '{specific_neo}' is valid.")
                    return True, ""
                elif response.status == 404:
                    _LOGGER.warning(f"Specific NEO '{specific_neo}' not found.")
                    return False, "Please check the designation on the NASA website"
                elif retry_count < SPECIFIC_NEO_RETRIES:
                    _LOGGER.warning(
                        f"Specific NEO validation failed with status {response.status}. Retrying ({retry_count + 1}/{SPECIFIC_NEO_RETRIES})."
                    )
                    await asyncio.sleep(1)  # Wait for 1 second before retrying
                    return await self.validate_specific_neo(
                        session, specific_neo, retry_count + 1
                    )
                else:
                    _LOGGER.error(
                        f"Specific NEO validation failed after {SPECIFIC_NEO_RETRIES} retries with status {response.status}."
                    )
                    return False, "api_error"
        except aiohttp.ClientError as err:
            _LOGGER.error(f"Error communicating with API: {err}")
            return False, "api_error"
        except Exception as err:
            _LOGGER.error(f"An unexpected error occurred: {err}")
            return False, "unknown"


async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Validate the user input allows us to connect.

    Data has the keys from STEP_USER_DATA_SCHEMA with values provided by the user.
    """
    # You could add API validation here if needed.
    # For example, try to make a request to the API with the provided key.
    # If the request fails, raise an exception.
    # If the request succeeds, return a dictionary with user data.

    return {}  # <--- Corrected: Return an empty dictionary


class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""


class InvalidAuth(HomeAssistantError):
    """Error to indicate there is invalid auth."""
