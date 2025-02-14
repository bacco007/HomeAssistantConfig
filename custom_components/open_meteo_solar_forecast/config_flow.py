"""Config flow for Open-Meteo Solar Forecast integration."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlow
from homeassistant.const import CONF_API_KEY, CONF_LATITUDE, CONF_LONGITUDE, CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_AZIMUTH,
    CONF_BASE_URL,
    CONF_DAMPING_EVENING,
    CONF_DAMPING_MORNING,
    CONF_DECLINATION,
    CONF_EFFICIENCY_FACTOR,
    CONF_INVERTER_POWER,
    CONF_MODEL,
    CONF_MODULES_POWER,
    DOMAIN,
)

try:
    from homeassistant.config_entries import ConfigFlowResult  # >=2024.4.0b0
except ImportError:
    from homeassistant.data_entry_flow import FlowResult as ConfigFlowResult


class OpenMeteoSolarForecastFlowHandler(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Open-Meteo Solar Forecast."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: ConfigEntry,
    ) -> OpenMeteoSolarForecastOptionFlowHandler:
        """Get the options flow for this handler."""
        return OpenMeteoSolarForecastOptionFlowHandler()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initiated by the user."""
        if user_input is not None:
            return self.async_create_entry(
                title=user_input[CONF_NAME],
                data={
                    CONF_LATITUDE: user_input[CONF_LATITUDE],
                    CONF_LONGITUDE: user_input[CONF_LONGITUDE],
                },
                options={
                    CONF_API_KEY: user_input[CONF_API_KEY],
                    CONF_AZIMUTH: user_input[CONF_AZIMUTH],
                    CONF_BASE_URL: user_input[CONF_BASE_URL],
                    CONF_DAMPING_MORNING: user_input[CONF_DAMPING_MORNING],
                    CONF_DAMPING_EVENING: user_input[CONF_DAMPING_EVENING],
                    CONF_DECLINATION: user_input[CONF_DECLINATION],
                    CONF_MODULES_POWER: user_input[CONF_MODULES_POWER],
                    CONF_INVERTER_POWER: user_input[CONF_INVERTER_POWER],
                    CONF_EFFICIENCY_FACTOR: user_input[CONF_EFFICIENCY_FACTOR],
                    CONF_MODEL: user_input[CONF_MODEL],
                },
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_API_KEY, default=""): str,
                    vol.Required(
                        CONF_BASE_URL, default="https://api.open-meteo.com"
                    ): str,
                    vol.Required(
                        CONF_NAME, default=self.hass.config.location_name
                    ): str,
                    vol.Required(
                        CONF_LATITUDE, default=self.hass.config.latitude
                    ): cv.latitude,
                    vol.Required(
                        CONF_LONGITUDE, default=self.hass.config.longitude
                    ): cv.longitude,
                    vol.Required(CONF_DECLINATION, default=25): vol.All(
                        vol.Coerce(int), vol.Range(min=0, max=90)
                    ),
                    vol.Required(CONF_AZIMUTH, default=180): vol.All(
                        vol.Coerce(int), vol.Range(min=0, max=360)
                    ),
                    vol.Required(CONF_MODULES_POWER): vol.All(
                        vol.Coerce(int), vol.Range(min=1)
                    ),
                    vol.Required(CONF_INVERTER_POWER, default=0): vol.All(
                        vol.Coerce(int), vol.Range(min=0)
                    ),
                    vol.Optional(CONF_DAMPING_MORNING, default=0.0): vol.Coerce(float),
                    vol.Optional(CONF_DAMPING_EVENING, default=0.0): vol.Coerce(float),
                    vol.Optional(CONF_EFFICIENCY_FACTOR, default=1.0): vol.All(
                        vol.Coerce(float), vol.Range(min=0)
                    ),
                    vol.Optional(CONF_MODEL, default="best_match"): str,
                }
            ),
        )


class OpenMeteoSolarForecastOptionFlowHandler(OptionsFlow):
    """Handle options."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        errors = {}
        if user_input is not None:
            return self.async_create_entry(
                title="", data=user_input | {CONF_API_KEY: user_input.get(CONF_API_KEY)}
            )

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_API_KEY,
                        description={
                            "suggested_value": self.config_entry.options.get(
                                CONF_API_KEY, ""
                            )
                        },
                    ): str,
                    vol.Required(
                        CONF_BASE_URL,
                        default=self.config_entry.options[CONF_BASE_URL],
                    ): str,
                    vol.Required(
                        CONF_DECLINATION,
                        default=self.config_entry.options[CONF_DECLINATION],
                    ): vol.All(vol.Coerce(int), vol.Range(min=0, max=90)),
                    vol.Required(
                        CONF_AZIMUTH,
                        default=self.config_entry.options.get(CONF_AZIMUTH),
                    ): vol.All(vol.Coerce(int), vol.Range(min=-0, max=360)),
                    vol.Required(
                        CONF_MODULES_POWER,
                        default=self.config_entry.options[CONF_MODULES_POWER],
                    ): vol.All(vol.Coerce(int), vol.Range(min=1)),
                    vol.Optional(
                        CONF_DAMPING_MORNING,
                        default=self.config_entry.options.get(
                            CONF_DAMPING_MORNING, 0.0
                        ),
                    ): vol.Coerce(float),
                    vol.Optional(
                        CONF_DAMPING_EVENING,
                        default=self.config_entry.options.get(
                            CONF_DAMPING_EVENING, 0.0
                        ),
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_INVERTER_POWER,
                        default=self.config_entry.options.get(CONF_INVERTER_POWER, 0),
                    ): vol.All(vol.Coerce(int), vol.Range(min=0)),
                    vol.Optional(
                        CONF_EFFICIENCY_FACTOR,
                        default=self.config_entry.options.get(
                            CONF_EFFICIENCY_FACTOR, 1.0
                        ),
                    ): vol.All(vol.Coerce(float), vol.Range(min=0)),
                    vol.Optional(
                        CONF_MODEL,
                        default=self.config_entry.options.get(CONF_MODEL, "best_match"),
                    ): str,
                }
            ),
            errors=errors,
        )
