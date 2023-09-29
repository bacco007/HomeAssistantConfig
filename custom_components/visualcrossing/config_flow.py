"""Config flow to configure Visual Crossing component."""
from __future__ import annotations

import logging
import voluptuous as vol
from typing import Any
from homeassistant import config_entries
from homeassistant.const import (
    CONF_API_KEY,
    CONF_LANGUAGE,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_NAME,
)
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.aiohttp_client import async_create_clientsession
from pyVisualCrossing import (
    VisualCrossing,
    VisualCrossingBadRequest,
    VisualCrossingInternalServerError,
    VisualCrossingTooManyRequests,
    VisualCrossingUnauthorized,
    SUPPORTED_LANGUAGES,
)

from .const import (
    DEFAULT_DAYS,
    DEFAULT_LANGUAGE,
    DEFAULT_NAME,
    DOMAIN,
    CONF_DAYS,
)

_LOGGER = logging.getLogger(__name__)


class VCHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Config Flow for WeatherFlow Forecast."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Get the options flow for WeatherFlow Forecast."""
        return VCOptionsFlowHandler(config_entry)

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle a flow initialized by the user."""
        errors = {}

        if user_input is None:
            return await self._show_setup_form(user_input)

        session = async_create_clientsession(self.hass)

        try:
            vc_api = VisualCrossing(
                user_input[CONF_API_KEY],
                user_input[CONF_LATITUDE],
                user_input[CONF_LATITUDE],
                days=1,
                session=session,
            )

            await vc_api.async_fetch_data()

        except VisualCrossingUnauthorized as err:
            _LOGGER.debug(err)
            errors["base"] = "unauthorized"
            return await self._show_setup_form(errors)
        except VisualCrossingBadRequest as err:
            _LOGGER.debug(err)
            errors["base"] = "bad_request"
            return await self._show_setup_form(errors)
        except VisualCrossingInternalServerError as err:
            _LOGGER.debug(err)
            errors["base"] = "server_error"
            return await self._show_setup_form(errors)
        except VisualCrossingTooManyRequests as err:
            _LOGGER.debug(err)
            errors["base"] = "too_many"
            return await self._show_setup_form(errors)

        await self.async_set_unique_id(
            f"{user_input[CONF_LATITUDE]}-{user_input[CONF_LONGITUDE]}"
        )
        self._abort_if_unique_id_configured

        return self.async_create_entry(
            title=user_input[CONF_NAME],
            data={
                CONF_NAME: user_input[CONF_NAME],
                CONF_API_KEY: user_input[CONF_API_KEY],
                CONF_LATITUDE: user_input[CONF_LATITUDE],
                CONF_LONGITUDE: user_input[CONF_LONGITUDE],
            },
            options={
                CONF_DAYS: DEFAULT_DAYS,
                CONF_LANGUAGE: DEFAULT_LANGUAGE,
            },
        )

    async def _show_setup_form(self, errors=None):
        """Show the setup form to the user."""
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_NAME, default=DEFAULT_NAME): str,
                    vol.Required(CONF_API_KEY): str,
                    vol.Required(
                        CONF_LATITUDE, default=self.hass.config.latitude
                    ): cv.latitude,
                    vol.Required(
                        CONF_LONGITUDE, default=self.hass.config.longitude
                    ): cv.longitude,
                }
            ),
            errors=errors or {},
        )


class VCOptionsFlowHandler(config_entries.OptionsFlow):
    """Options Flow for WeatherFlow Forecast component."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize the WeatherFlow Forecast Options Flows."""
        self._config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Configure Options for WeatherFlow Forecast."""

        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_NAME,
                        default=self._config_entry.data.get(CONF_NAME, DEFAULT_NAME),
                    ): str,
                    vol.Optional(
                        CONF_LANGUAGE,
                        default=self._config_entry.options.get(CONF_LANGUAGE, DEFAULT_LANGUAGE),
                    ): vol.In(SUPPORTED_LANGUAGES),
                    vol.Optional(
                        CONF_DAYS,
                        default=self._config_entry.options.get(CONF_DAYS, DEFAULT_DAYS),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=14)),
                }
            ),
        )
