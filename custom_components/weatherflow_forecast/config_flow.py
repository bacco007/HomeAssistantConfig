"""Config flow to configure WeatherFlow Forecast component."""
from __future__ import annotations

import logging
import voluptuous as vol
from typing import Any
from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.aiohttp_client import async_create_clientsession
from pyweatherflow_forecast import (
    WeatherFlow,
    WeatherFlowStationData,
    WeatherFlowSensorData,
    WeatherFlowForecastBadRequest,
    WeatherFlowForecastInternalServerError,
    WeatherFlowForecastUnauthorized,
    WeatherFlowForecastWongStationId,
)
from .const import (
    DEFAULT_ADD_SENSOR,
    DEFAULT_FORECAST_HOURS,
    DOMAIN,
    CONF_ADD_SENSORS,
    CONF_API_TOKEN,
    CONF_DEVICE_ID,
    CONF_FIRMWARE_REVISION,
    CONF_FORECAST_HOURS,
    CONF_SERIAL_NUMBER,
    CONF_STATION_ID,
)

_LOGGER = logging.getLogger(__name__)

class WeatherFlowForecastHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Config Flow for WeatherFlow Forecast."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry) -> config_entries.OptionsFlow:
        """Get the options flow for WeatherFlow Forecast."""
        return WeatherFlowForecastOptionsFlowHandler(config_entry)

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Handle a flow initialized by the user."""

        if user_input is None:
            return await self._show_setup_form(user_input)

        errors = {}
        session = async_create_clientsession(self.hass)

        try:
            weatherflow_api = WeatherFlow(user_input[CONF_STATION_ID],
                                          user_input[CONF_API_TOKEN], session=session)

            station_data: WeatherFlowStationData = await weatherflow_api.async_get_station()
            if user_input[CONF_ADD_SENSORS]:
                sensor_data: WeatherFlowSensorData = await weatherflow_api.async_fetch_sensor_data()
                if not sensor_data.data_available:
                    errors["base"] = "offline_error"
                    return await self._show_setup_form(errors)
        except WeatherFlowForecastWongStationId as err:
            _LOGGER.debug(err)
            errors["base"] = "wrong_station_id"
            return await self._show_setup_form(errors)
        except WeatherFlowForecastBadRequest as err:
            _LOGGER.debug(err)
            errors["base"] = "bad_request"
            return await self._show_setup_form(errors)
        except WeatherFlowForecastInternalServerError as err:
            _LOGGER.debug(err)
            errors["base"] = "server_error"
            return await self._show_setup_form(errors)
        except WeatherFlowForecastUnauthorized as err:
            _LOGGER.debug("401 Error: %s", err)
            errors["base"] = "wrong_token"
            return await self._show_setup_form(errors)

        await self.async_set_unique_id(str(user_input[CONF_STATION_ID]))
        self._abort_if_unique_id_configured

        return self.async_create_entry(
            title=station_data.station_name,
            data={
                CONF_NAME: station_data.station_name,
                CONF_STATION_ID: user_input[CONF_STATION_ID],
                CONF_API_TOKEN: user_input[CONF_API_TOKEN],
                CONF_DEVICE_ID: station_data.device_id,
                CONF_FIRMWARE_REVISION: station_data.firmware_revision,
                CONF_SERIAL_NUMBER: station_data.serial_number,
            },
            options={
                CONF_FORECAST_HOURS: user_input[CONF_FORECAST_HOURS],
                CONF_ADD_SENSORS: user_input[CONF_ADD_SENSORS],
            }
        )

    async def _show_setup_form(self, errors=None):
        """Show the setup form to the user."""
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_STATION_ID): str,
                    vol.Required(CONF_API_TOKEN): str,
                    vol.Optional(CONF_FORECAST_HOURS, default=DEFAULT_FORECAST_HOURS): vol.All(vol.Coerce(int), vol.Range(min=12, max=96)),
                    vol.Optional(CONF_ADD_SENSORS, default=DEFAULT_ADD_SENSOR): bool,
                }
            ),
            errors=errors or {},
        )

class WeatherFlowForecastOptionsFlowHandler(config_entries.OptionsFlow):
    """Options Flow for WeatherFlow Forecast component."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize the WeatherFlow Forecast Options Flows."""
        self._config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Configure Options for WeatherFlow Forecast."""

        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_API_TOKEN, default=self._config_entry.data.get(CONF_API_TOKEN, "")): str,
                    vol.Optional(CONF_FORECAST_HOURS, default=self._config_entry.options.get(CONF_FORECAST_HOURS, DEFAULT_FORECAST_HOURS)): vol.All(vol.Coerce(int), vol.Range(min=12, max=96)),
                    vol.Optional(CONF_ADD_SENSORS, default=self._config_entry.options.get(CONF_ADD_SENSORS, DEFAULT_ADD_SENSOR)): bool,
                }
            )
        )
