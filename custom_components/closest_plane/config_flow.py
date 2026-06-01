"""Config flow for the Closest Plane integration."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_AERODATABOX_API_KEY,
    CONF_AVIATIONSTACK_API_KEY,
    CONF_CACHE_DIR,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_OPENSKY_CLIENT_ID,
    CONF_OPENSKY_CLIENT_SECRET,
    CONF_RADIUS_KM,
    CONF_REFRESH_MINUTES,
    DEFAULT_RADIUS_KM,
    DEFAULT_REFRESH_MINUTES,
    DOMAIN,
)


class ClosestPlaneConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Two-step config flow: location + radius, then optional API keys."""

    VERSION = 1
    _data: dict[str, Any]

    def __init__(self) -> None:
        self._data = {}

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        if user_input is not None:
            self._data = {
                CONF_LATITUDE: user_input[CONF_LATITUDE],
                CONF_LONGITUDE: user_input[CONF_LONGITUDE],
                CONF_RADIUS_KM: user_input[CONF_RADIUS_KM],
                CONF_REFRESH_MINUTES: user_input[CONF_REFRESH_MINUTES],
            }
            return await self.async_step_apis()

        schema = vol.Schema(
            {
                vol.Required(CONF_LATITUDE, default=self.hass.config.latitude): cv.latitude,
                vol.Required(CONF_LONGITUDE, default=self.hass.config.longitude): cv.longitude,
                vol.Required(CONF_RADIUS_KM, default=DEFAULT_RADIUS_KM): vol.All(
                    vol.Coerce(int), vol.Range(min=25, max=500)
                ),
                vol.Required(CONF_REFRESH_MINUTES, default=DEFAULT_REFRESH_MINUTES): vol.All(
                    vol.Coerce(int), vol.Range(min=1, max=60)
                ),
            }
        )
        return self.async_show_form(step_id="user", data_schema=schema)

    async def async_step_apis(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        if user_input is not None:
            # Only store non-empty optional values
            for key in (
                CONF_OPENSKY_CLIENT_ID,
                CONF_OPENSKY_CLIENT_SECRET,
                CONF_AVIATIONSTACK_API_KEY,
                CONF_AERODATABOX_API_KEY,
                CONF_CACHE_DIR,
            ):
                if user_input.get(key):
                    self._data[key] = user_input[key]
            return self.async_create_entry(title="Closest Plane", data=self._data)

        schema = vol.Schema(
            {
                vol.Optional(CONF_OPENSKY_CLIENT_ID, default=""): str,
                vol.Optional(CONF_OPENSKY_CLIENT_SECRET, default=""): str,
                vol.Optional(CONF_AVIATIONSTACK_API_KEY, default=""): str,
                vol.Optional(CONF_AERODATABOX_API_KEY, default=""): str,
                vol.Optional(CONF_CACHE_DIR, default=""): str,
            }
        )
        return self.async_show_form(step_id="apis", data_schema=schema)
