"""
Config flow for HA WeatherSense integration.

@license: CC BY-NC-SA 4.0 International
@author: SMKRV
@github: https://github.com/smkrv/ha-weathersense
@source: https://github.com/smkrv/ha-weathersense
"""
import logging
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers import selector
from homeassistant.const import UnitOfTemperature

from .const import (
    DOMAIN,
    CONF_TEMPERATURE_SENSOR,
    CONF_HUMIDITY_SENSOR,
    CONF_WIND_SPEED_SENSOR,
    CONF_PRESSURE_SENSOR,
    CONF_IS_OUTDOOR,
    CONF_SOLAR_RADIATION_SENSOR,
    DEFAULT_NAME,
    DEFAULT_IS_OUTDOOR,
    CONF_DISPLAY_UNIT,
)

_LOGGER = logging.getLogger(__name__)

class WeatherSenseConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for HA WeatherSense."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return WeatherSenseOptionsFlow(config_entry)

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            # Validate the inputs
            if not user_input.get(CONF_TEMPERATURE_SENSOR):
                errors[CONF_TEMPERATURE_SENSOR] = "temperature_required"
            if not user_input.get(CONF_HUMIDITY_SENSOR):
                errors[CONF_HUMIDITY_SENSOR] = "humidity_required"

            if not errors:
                # Create entry
                return self.async_create_entry(
                    title=user_input.get("name", DEFAULT_NAME),
                    data=user_input,
                )

        # Show the form
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required("name", default=DEFAULT_NAME): str,
                    vol.Required(CONF_TEMPERATURE_SENSOR): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain="sensor")
                    ),
                    vol.Required(CONF_HUMIDITY_SENSOR): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain="sensor")
                    ),
                    vol.Optional(CONF_WIND_SPEED_SENSOR): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain="sensor")
                    ),
                    vol.Optional(CONF_PRESSURE_SENSOR): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain="sensor")
                    ),
                    vol.Optional(CONF_SOLAR_RADIATION_SENSOR): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain="sensor")
                    ),
                    vol.Optional(CONF_IS_OUTDOOR, default=DEFAULT_IS_OUTDOOR): bool,
                    vol.Optional(CONF_DISPLAY_UNIT): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=[
                                {"value": UnitOfTemperature.CELSIUS, "label": "Celsius (°C)"},
                                {"value": UnitOfTemperature.FAHRENHEIT, "label": "Fahrenheit (°F)"},
                            ],
                            mode=selector.SelectSelectorMode.DROPDOWN,
                        )
                    ),
                }
            ),
            errors=errors,
        )


class WeatherSenseOptionsFlow(config_entries.OptionsFlow):
    """Handle options."""

    def __init__(self, config_entry):
        """Initialize options flow."""
        self.config_entry = config_entry
        _LOGGER.debug("Initializing options flow for entry: %s", config_entry.entry_id)

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current_config = {**self.config_entry.data, **self.config_entry.options}

        options = {
            vol.Required(
                CONF_TEMPERATURE_SENSOR,
                default=current_config.get(CONF_TEMPERATURE_SENSOR),
            ): selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor")),
            vol.Required(
                CONF_HUMIDITY_SENSOR,
                default=current_config.get(CONF_HUMIDITY_SENSOR),
            ): selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor")),
            vol.Optional(
                CONF_WIND_SPEED_SENSOR,
                default=current_config.get(CONF_WIND_SPEED_SENSOR),
            ): selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor")),
            vol.Optional(
                CONF_PRESSURE_SENSOR,
                default=current_config.get(CONF_PRESSURE_SENSOR),
            ): selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor")),
            vol.Optional(
                CONF_SOLAR_RADIATION_SENSOR,
                default=current_config.get(CONF_SOLAR_RADIATION_SENSOR),
            ): selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor")),
            vol.Optional(
                CONF_IS_OUTDOOR,
                default=current_config.get(CONF_IS_OUTDOOR, DEFAULT_IS_OUTDOOR),
            ): bool,
            vol.Optional(
                CONF_DISPLAY_UNIT,
                default=current_config.get(CONF_DISPLAY_UNIT),
            ): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=[
                        {"value": UnitOfTemperature.CELSIUS, "label": "Celsius (°C)"},
                        {"value": UnitOfTemperature.FAHRENHEIT, "label": "Fahrenheit (°F)"},
                    ],
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            ),
        }

        return self.async_show_form(step_id="init", data_schema=vol.Schema(options))
