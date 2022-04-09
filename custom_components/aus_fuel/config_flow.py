"""Config flow for Australia Fuel Prices integration."""
from __future__ import annotations

import logging
from typing import Any
import pprint

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.exceptions import HomeAssistantError
import homeassistant.helpers.config_validation as cv
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE

from .const import DOMAIN
from .aus_fuel_api import AusFuelAPI

_LOGGER = logging.getLogger(__name__)

# Three options for the user
STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required("search_distance", default=5): int,
        vol.Required(CONF_LATITUDE): float,
        vol.Required(CONF_LONGITUDE): float,
    }
)


async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict:
    """Validate the user input allows us to connect.

    Data has the keys from STEP_USER_DATA_SCHEMA with values provided by the user.
    """
    # Validate the data can be used to set up a connection.
    api = AusFuelAPI(data["search_distance"], data[CONF_LATITUDE], data[CONF_LONGITUDE])
    result = await hass.async_add_executor_job(api.refresh_data)
    if not result:
        raise CannotConnect

    # All good if got to here
    return api.get_stations_fuel_types()


class AusFuelConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Australia Fuel Prices."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        if user_input is None:
            return self.async_show_form(
                step_id="user", data_schema=STEP_USER_DATA_SCHEMA
            )

        errors = {}

        try:
            self.stations_fuel_types = await validate_input(self.hass, user_input)
            # Save this setups user inputs for the next step
            self.data = user_input
        except CannotConnect:
            errors["base"] = "cannot_connect"
        except Exception:  # pylint: disable=broad-except
            _LOGGER.exception("Unexpected exception")
            errors["base"] = "unknown"
        else:
            return await self.async_step_select()

        # Got here with user input but errors, show the form again with the errors to the user
        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
        )

    async def async_step_select(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Location data from the first step ready, confirm which stations to add"""
        if user_input is None:

            stations_list = {
                station["id"]: station["name"]
                for station in self.stations_fuel_types["stations"]
            }
            fuel_types = {
                fuel_type: fuel_type
                for fuel_type in self.stations_fuel_types["fuel_types"]
            }

            schema = vol.Schema(
                {
                    vol.Required(
                        "stations", default=list(stations_list)
                    ): cv.multi_select(stations_list),
                    vol.Required(
                        "fuel_types", default=list(fuel_types)
                    ): cv.multi_select(fuel_types),
                    vol.Required("devices", default="Station"): vol.In(
                        ["Station", "Fuel Type"]
                    ),
                }
            )

            return self.async_show_form(step_id="select", data_schema=schema)

        # Add this selected stations and fuel types to the data to be saved
        self.data["stations"] = user_input["stations"]
        self.data["fuel_types"] = user_input["fuel_types"]
        self.data["fuel_type_devices"] = user_input["devices"] == "Fuel Type"

        # User input has been processed (since selection errors not possible)
        # return the new configuration entry ready for __init__ to process
        return self.async_create_entry(title="Australian Fuel Prices", data=self.data)


class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""
