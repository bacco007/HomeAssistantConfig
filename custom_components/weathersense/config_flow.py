"""
Config flow for HA WeatherSense integration.

@license: PolyForm Noncommercial 1.0.0
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
from homeassistant.helpers import entity_registry as er
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
    CONF_WIND_DIRECTION_SENSOR,
    CONF_WIND_DIRECTION_CORRECTION,
    CONF_SMOOTHING_ENABLED,
    CONF_SMOOTHING_FACTOR,
    DEFAULT_NAME,
    DEFAULT_IS_OUTDOOR,
    DEFAULT_SMOOTHING_FACTOR,
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
                    vol.Optional(CONF_WIND_DIRECTION_SENSOR): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain="sensor")
                    ),
                    vol.Optional(CONF_WIND_DIRECTION_CORRECTION, default=False): bool,
                    vol.Optional(CONF_SMOOTHING_ENABLED, default=False): bool,
                    vol.Optional(CONF_SMOOTHING_FACTOR, default=DEFAULT_SMOOTHING_FACTOR): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=0.05, max=0.95, step=0.05, mode=selector.NumberSelectorMode.SLIDER
                        )
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
        # Keep our own reference: the OptionsFlow.config_entry property only
        # exists since HA 2024.12, while this integration supports 2024.11.
        # (Assigning to self.config_entry itself is deprecated since 2024.12.)
        self._entry = config_entry
        _LOGGER.debug("Initializing options flow for entry: %s", config_entry.entry_id)

    # Optional fields that the user may clear in the options form. A cleared
    # field is absent from user_input, so it is written back explicitly as
    # None: the {**entry.data, **entry.options} merge would otherwise
    # resurrect the old value from the initial setup data.
    _CLEARABLE_FIELDS = (
        CONF_WIND_SPEED_SENSOR,
        CONF_PRESSURE_SENSOR,
        CONF_SOLAR_RADIATION_SENSOR,
        CONF_WIND_DIRECTION_SENSOR,
        CONF_DISPLAY_UNIT,
    )

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        current_config = {**self._entry.data, **self._entry.options}

        if user_input is not None:
            for field in self._CLEARABLE_FIELDS:
                user_input.setdefault(field, None)
            if current_config.get(CONF_DISPLAY_UNIT) and user_input.get(CONF_DISPLAY_UNIT) is None:
                self._clear_unit_override()
            return self.async_create_entry(title="", data=user_input)

        return self._show_options_form(current_config)

    def _clear_unit_override(self):
        """Drop the entity-registry unit override when the display unit is cleared.

        The override was written by the sensor for the previously chosen
        display unit; without this the state would keep the old unit forever,
        while the README promises the system unit when nothing is selected.
        """
        registry = er.async_get(self.hass)
        for reg_entry in er.async_entries_for_config_entry(registry, self._entry.entry_id):
            sensor_options = dict(reg_entry.options.get("sensor", {}))
            if "unit_of_measurement" in sensor_options:
                sensor_options.pop("unit_of_measurement")
                registry.async_update_entity_options(
                    reg_entry.entity_id, "sensor", sensor_options
                )

    def _show_options_form(self, current_config):
        """Build and show the options form."""

        def _entity_selector():
            return selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor"))

        def _suggested(key):
            # suggested_value pre-fills the form but, unlike default=, lets
            # the user clear the field and submit it empty.
            value = current_config.get(key)
            return {"suggested_value": value} if value is not None else None

        options = {
            vol.Required(
                CONF_TEMPERATURE_SENSOR,
                default=current_config.get(CONF_TEMPERATURE_SENSOR),
            ): _entity_selector(),
            vol.Required(
                CONF_HUMIDITY_SENSOR,
                default=current_config.get(CONF_HUMIDITY_SENSOR),
            ): _entity_selector(),
            vol.Optional(CONF_WIND_SPEED_SENSOR, description=_suggested(CONF_WIND_SPEED_SENSOR)): _entity_selector(),
            vol.Optional(CONF_PRESSURE_SENSOR, description=_suggested(CONF_PRESSURE_SENSOR)): _entity_selector(),
            vol.Optional(CONF_SOLAR_RADIATION_SENSOR, description=_suggested(CONF_SOLAR_RADIATION_SENSOR)): _entity_selector(),
            vol.Optional(CONF_WIND_DIRECTION_SENSOR, description=_suggested(CONF_WIND_DIRECTION_SENSOR)): _entity_selector(),
            vol.Optional(
                CONF_WIND_DIRECTION_CORRECTION,
                default=current_config.get(CONF_WIND_DIRECTION_CORRECTION, False),
            ): bool,
            vol.Optional(
                CONF_SMOOTHING_ENABLED,
                default=current_config.get(CONF_SMOOTHING_ENABLED, False),
            ): bool,
            vol.Optional(
                CONF_SMOOTHING_FACTOR,
                default=current_config.get(CONF_SMOOTHING_FACTOR, DEFAULT_SMOOTHING_FACTOR),
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=0.05, max=0.95, step=0.05, mode=selector.NumberSelectorMode.SLIDER
                )
            ),
            vol.Optional(
                CONF_IS_OUTDOOR,
                default=current_config.get(CONF_IS_OUTDOOR, DEFAULT_IS_OUTDOOR),
            ): bool,
            vol.Optional(CONF_DISPLAY_UNIT, description=_suggested(CONF_DISPLAY_UNIT)): selector.SelectSelector(
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
