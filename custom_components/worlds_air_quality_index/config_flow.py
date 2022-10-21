"""Adds config flow for worlds_air_quality_index integration."""
from __future__ import annotations

from typing import Any

from .waqi_api import WaqiDataRequester

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult
import homeassistant.helpers.config_validation as cv

from homeassistant.const import (
    CONF_NAME,
    CONF_LATITUDE, 
    CONF_LONGITUDE, 
    CONF_TOKEN,
    CONF_LOCATION,
    CONF_METHOD,
    CONF_ID,
    CONF_TEMPERATURE_UNIT,
    TEMP_FAHRENHEIT,
    TEMP_CELSIUS
)
from .const import (
    DOMAIN,
    DEFAULT_NAME,
    GEOGRAPHIC_LOCALIZATION,
    STATION_ID
)


class WorldsAirQualityIndexConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for worlds_air_quality_index integration."""

    VERSION = 3

    async def async_step_import(self, config: dict[str, Any]) -> FlowResult:
        """Import a configuration from config.yaml."""

        name = config.get(CONF_NAME, DEFAULT_NAME)
        self._async_abort_entries_match({CONF_NAME: name})
        config[CONF_NAME] = name
        return await self.async_step_user(user_input=config)

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Handle the initial step."""

        data_schema = vol.Schema(
            {
                vol.Required(CONF_METHOD, default=GEOGRAPHIC_LOCALIZATION): vol.In(
                    (
                        GEOGRAPHIC_LOCALIZATION,
                        STATION_ID
                    )
                )

            }
        )

        if user_input is None:
            return self.async_show_form(
                step_id="user",
                data_schema=data_schema,
            )

        if user_input[CONF_METHOD] == GEOGRAPHIC_LOCALIZATION:
            return await self.async_step_geographic_localization()
        return await self.async_step_station_id()
    
    async def async_step_geographic_localization(self, user_input=None) -> FlowResult:
        """Handle the geographic localization step."""
        errors = {}

        data_schema = vol.Schema(
            {
                vol.Required(CONF_TOKEN): cv.string,
                vol.Required(CONF_TEMPERATURE_UNIT, default=TEMP_CELSIUS): vol.In(
                    (
                        TEMP_CELSIUS,
                        TEMP_FAHRENHEIT
                    )
                ),
                vol.Required(CONF_LATITUDE, default=self.hass.config.latitude): cv.latitude,
                vol.Required(CONF_LONGITUDE, default=self.hass.config.longitude): cv.longitude,
                vol.Optional(CONF_NAME): cv.string
            }
        )

        if user_input:
            token = user_input[CONF_TOKEN]
            tempUnit = user_input[CONF_TEMPERATURE_UNIT]
            latitude = user_input[CONF_LATITUDE]
            longitude = user_input[CONF_LONGITUDE]
            method = CONF_LOCATION
            requester = WaqiDataRequester(latitude, longitude, token, None, method)
            await self.hass.async_add_executor_job(requester.update)

            validateData = requester.GetData()
            if validateData:
                if validateData["status"] == "ok":
                    if "status" in validateData["data"]:
                        if validateData["data"]["status"] == "error":
                            if validateData["data"]["msg"] == "Unknown ID":
                                errors["base"] = "unknow_station_id"
                            else:
                                errors["base"] = "server_error"
                elif validateData["status"] == "error":
                    if validateData["data"] == "Invalid key":
                        errors["base"] = "invalid_token"
                    else:
                        errors["base"] = "server_error"
                else:
                    errors["base"] = "server_error"
            else:
                errors["base"] = "server_not_available"

            stationName = requester.GetStationName()
            name = user_input.get(CONF_NAME, stationName)

            if not errors:
                await self.async_set_unique_id(name)
                self._abort_if_unique_id_configured()

                return self.async_create_entry(
                    title=name,
                    data={
                        CONF_TOKEN: token,
                        CONF_TEMPERATURE_UNIT: tempUnit,
                        CONF_LATITUDE: latitude,
                        CONF_LONGITUDE: longitude,
                        CONF_NAME: name,
                        CONF_METHOD: method,
                    },
                )

        return self.async_show_form(
            step_id="geographic_localization",
            data_schema=data_schema,
            errors=errors,
        )

    async def async_step_station_id(self, user_input=None) -> FlowResult:
        errors = {}

        data_schema = vol.Schema(
            {
                vol.Required(CONF_TOKEN): cv.string,
                vol.Required(CONF_TEMPERATURE_UNIT, default=TEMP_CELSIUS): vol.In(
                    (
                        TEMP_CELSIUS,
                        TEMP_FAHRENHEIT
                    )
                ),
                vol.Required(CONF_ID): cv.string,
                vol.Optional(CONF_NAME): cv.string
            }
        )

        if user_input:

            token = user_input[CONF_TOKEN]
            tempUnit = user_input[CONF_TEMPERATURE_UNIT]
            id = user_input[CONF_ID]
            method = CONF_ID
            requester = WaqiDataRequester(None, None, token, id, method)
            await self.hass.async_add_executor_job(requester.update)

            validateData = requester.GetData()
            if validateData:
                if validateData["status"] == "ok":
                    if "status" in validateData["data"]:
                        if validateData["data"]["status"] == "error":
                            if validateData["data"]["msg"] == "Unknown ID":
                                errors["base"] = "unknow_station_id"
                            else:
                                errors["base"] = "server_error"
                elif validateData["status"] == "error":
                    if validateData["data"] == "Invalid key":
                        errors["base"] = "invalid_token"
                    else:
                        errors["base"] = "server_error"
                else:
                    errors["base"] = "server_error"
            else:
                errors["base"] = "server_not_available"

            stationName = requester.GetStationName()
            name = user_input.get(CONF_NAME, stationName)
            
            if not errors:
                await self.async_set_unique_id(name)
                self._abort_if_unique_id_configured()

                return self.async_create_entry(
                    title=name,
                    data={
                        CONF_TOKEN: token,
                        CONF_TEMPERATURE_UNIT: tempUnit,
                        CONF_ID: id,
                        CONF_NAME: name,
                        CONF_METHOD: method,
                    },
                )

        return self.async_show_form(
            step_id="station_id",
            data_schema=data_schema,
            errors=errors,
        )
