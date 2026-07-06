"""Config flow for Moon Phase integration."""

from __future__ import annotations

import logging
from typing import Any

from astral import LocationInfo
import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE, CONF_REGION, CONF_TIME_ZONE
from homeassistant.core import HomeAssistant

from .const import CONF_CITY, DOMAIN

_LOGGER = logging.getLogger(__name__)


def _location_schema(hass: HomeAssistant) -> vol.Schema:
    """Build location schema pre-filled with HA home coordinates."""
    return vol.Schema(
        {
            vol.Required(CONF_CITY, default=hass.config.location_name): str,
            vol.Required(CONF_LATITUDE, default=hass.config.latitude): float,
            vol.Required(CONF_LONGITUDE, default=hass.config.longitude): float,
        }
    )


class ConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Moon Phase."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        return await self.async_step_location(user_input)

    async def async_step_location(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the location step."""
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                data = {
                    **user_input,
                    CONF_REGION: self.hass.config.country or "",
                    CONF_TIME_ZONE: self.hass.config.time_zone,
                }
                location = LocationInfo(
                    data[CONF_CITY],
                    data[CONF_REGION],
                    data[CONF_TIME_ZONE],
                    data[CONF_LATITUDE],
                    data[CONF_LONGITUDE],
                )
                return self.async_create_entry(title=location.name, data=data)
            except Exception:
                _LOGGER.exception("Unexpected exception in config flow")
                errors["base"] = "unknown"
        return self.async_show_form(
            step_id="location",
            data_schema=_location_schema(self.hass),
            errors=errors,
        )
