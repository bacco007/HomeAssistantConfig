"""Config flow for Moon Phase integration."""

from __future__ import annotations

import logging
from typing import Any

from astral import LocationInfo
from astral.geocoder import database, lookup
import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import (
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_REGION,
    CONF_TIME_ZONE,
)
from homeassistant.core import HomeAssistant

from .const import CONF_CITY, DOMAIN

_LOGGER = logging.getLogger(__name__)

# Define the schema for the user input
STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_CITY, description={"suggested_value": "London"}): str,
    }
)

STEP_LOCATION_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_CITY, description={"suggested_value": "London"}): str,
        vol.Required(CONF_REGION, description={"suggested_value": "England"}): str,
        vol.Required(
            CONF_TIME_ZONE, description={"suggested_value": "Europe/London"}
        ): str,
        vol.Required(CONF_LATITUDE, description={"suggested_value": 51.5074}): float,
        vol.Required(CONF_LONGITUDE, description={"suggested_value": -0.1278}): float,
    }
)


class CityNotFound(Exception):
    """Exception to indicate that the city was not found in the database."""


async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> LocationInfo:
    """Validate the user input allows us to connect.

    Data has the keys from STEP_USER_DATA_SCHEMA with values provided by the user.
    """
    city = data[CONF_CITY]

    try:
        location = lookup(city, database())
        _LOGGER.debug("Location: %s", location)

    except KeyError as error:
        _LOGGER.error("Error looking up city: %s", error)
        raise CityNotFound from error
    return location


async def create_location(hass: HomeAssistant, data: dict[str, Any]) -> LocationInfo:
    """Create a location object from the user input."""
    city = data[CONF_CITY]
    region = data.get(CONF_REGION)
    latitude = data.get(CONF_LATITUDE)
    longitude = data.get(CONF_LONGITUDE)
    timezone = data.get(CONF_TIME_ZONE)

    try:
        location = LocationInfo(city, region, timezone, latitude, longitude)
        _LOGGER.debug("Location: %s", location)
    except Exception:
        _LOGGER.exception("Unexpected exception: %s", Exception)
    return location


class ConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Moon Phase."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                location = await validate_input(self.hass, user_input)
                _LOGGER.debug("Location: %s", location)
                data = {
                    **user_input,
                    CONF_LATITUDE: location.latitude,
                    CONF_LONGITUDE: location.longitude,
                    CONF_REGION: location.region,
                    CONF_TIME_ZONE: location.timezone,
                }
                return self.async_create_entry(title=location.name, data=data)
            except CityNotFound:
                errors["base"] = "city_not_found"
                return await self.async_step_location(user_input)
            except Exception:
                _LOGGER.exception("Unexpected exception: %s", Exception)
        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
        )

    async def async_step_location(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the location step."""
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                location = await create_location(self.hass, user_input)
                _LOGGER.debug("Location: %s", location)
                data = {
                    **user_input,
                    CONF_LATITUDE: location.latitude,
                    CONF_LONGITUDE: location.longitude,
                    CONF_REGION: location.region,
                    CONF_TIME_ZONE: location.timezone,
                }
                return self.async_create_entry(title=location.name, data=data)
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "city_not_found"
        return self.async_show_form(
            step_id="location", data_schema=STEP_LOCATION_DATA_SCHEMA, errors=errors
        )
