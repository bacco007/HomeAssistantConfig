"""Config flow to configure Weatherbit component."""
from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant import config_entries
import homeassistant.helpers.config_validation as cv
from homeassistant.const import CONF_API_KEY, CONF_ID, CONF_LATITUDE, CONF_LONGITUDE
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_create_clientsession

from pyweatherbitdata import (
    RequestError,
    InvalidApiKey,
    ResultError,
    WeatherBitApiClient,
)
from pyweatherbitdata.const import VALID_LANGUAGES
from pyweatherbitdata.data import BaseDataDescription
from .const import (
    DOMAIN,
    DEFAULT_FORECAST_LANGUAGE,
    DEFAULT_INTERVAL_FORECAST,
    DEFAULT_INTERVAL_SENSORS,
    CONF_INTERVAL_SENSORS,
    CONF_INTERVAL_FORECAST,
    CONF_FORECAST_LANGUAGE,
)

_LOGGER = logging.getLogger(__name__)


class WeatherBitFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a WeatherBit config flow."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return OptionsFlowHandler(config_entry)

    async def async_step_user(self, user_input=None):
        """Handle a flow initiated by the user."""
        if user_input is None:
            return await self._show_setup_form(user_input)

        errors = {}

        session = async_create_clientsession(self.hass)

        weatherbit = WeatherBitApiClient(
            user_input[CONF_API_KEY],
            user_input[CONF_LATITUDE],
            user_input[CONF_LONGITUDE],
            session=session,
        )

        try:
            await weatherbit.initialize()

            station_data: BaseDataDescription = weatherbit.station_data

        except InvalidApiKey as err:
            _LOGGER.debug(err)
            errors["base"] = "invalid_api_key"
            return await self._show_setup_form(errors)
        except (RequestError, ResultError) as err:
            _LOGGER.debug(err)
            errors["base"] = "connection_error"
            return await self._show_setup_form(errors)

        unique_id = f"{DOMAIN}_{station_data.latitude}_{station_data.longitude}"

        await self.async_set_unique_id(unique_id)
        self._abort_if_unique_id_configured()

        return self.async_create_entry(
            title=station_data.city_name,
            data={
                CONF_ID: station_data.city_name,
                CONF_API_KEY: user_input[CONF_API_KEY],
                CONF_LATITUDE: user_input[CONF_LATITUDE],
                CONF_LONGITUDE: user_input[CONF_LONGITUDE],
            },
            options={
                CONF_INTERVAL_SENSORS: DEFAULT_INTERVAL_SENSORS,
                CONF_INTERVAL_FORECAST: DEFAULT_INTERVAL_FORECAST,
                CONF_FORECAST_LANGUAGE: DEFAULT_FORECAST_LANGUAGE,
            },
        )

    async def _show_setup_form(self, errors=None):
        """Show the setup form to the user."""
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
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


class OptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options."""

    def __init__(self, config_entry):
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_INTERVAL_SENSORS,
                        default=self.config_entry.options.get(
                            CONF_INTERVAL_SENSORS, DEFAULT_INTERVAL_SENSORS
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=60, max=180)),
                    vol.Optional(
                        CONF_INTERVAL_FORECAST,
                        default=self.config_entry.options.get(
                            CONF_INTERVAL_FORECAST, DEFAULT_INTERVAL_FORECAST
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=60, max=240)),
                    vol.Optional(
                        CONF_FORECAST_LANGUAGE,
                        default=self.config_entry.options.get(
                            CONF_FORECAST_LANGUAGE, DEFAULT_FORECAST_LANGUAGE
                        ),
                    ): vol.In(VALID_LANGUAGES),
                }
            ),
        )
