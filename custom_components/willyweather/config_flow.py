"""Config flow for WillyWeather integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_API_KEY
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import config_validation as cv, selector

from .const import (
    CONF_FORECAST_DAYS,
    CONF_FORECAST_MONITORED,
    CONF_INCLUDE_FORECAST_SENSORS,
    CONF_INCLUDE_OBSERVATIONAL,
    CONF_INCLUDE_WARNINGS,
    CONF_INCLUDE_WIND,
    CONF_INCLUDE_UV,
    CONF_INCLUDE_TIDES,
    CONF_INCLUDE_SWELL,
    CONF_INCLUDE_EXTENDED_FORECAST,
    CONF_SENSOR_PREFIX,
    CONF_STATION_ID,
    CONF_STATION_NAME,
    CONF_UPDATE_INTERVAL_DAY,
    CONF_UPDATE_INTERVAL_NIGHT,
    CONF_FORECAST_UPDATE_INTERVAL_DAY,
    CONF_FORECAST_UPDATE_INTERVAL_NIGHT,
    CONF_NIGHT_START_HOUR,
    CONF_NIGHT_END_HOUR,
    CONF_WARNING_MONITORED,
    DEFAULT_SENSOR_PREFIX,
    DEFAULT_UPDATE_INTERVAL_DAY,
    DEFAULT_UPDATE_INTERVAL_NIGHT,
    DEFAULT_FORECAST_UPDATE_INTERVAL_DAY,
    DEFAULT_FORECAST_UPDATE_INTERVAL_NIGHT,
    DEFAULT_NIGHT_START_HOUR,
    DEFAULT_NIGHT_END_HOUR,
    DOMAIN,
    FORECAST_SENSOR_TYPES,
    WARNING_BINARY_SENSOR_TYPES,
)
from .coordinator import async_get_station_id, async_get_station_name

_LOGGER = logging.getLogger(__name__)

# Default forecast sensors for Platinum Weather card compatibility
DEFAULT_FORECAST_SENSORS = ["icon", "precis", "temp_min", "temp_max", "rain_probability", "rain_amount_range"]


class WillyWeatherConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for WillyWeather."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize."""
        self._api_key: str = ""
        self._station_id: str = ""
        self._station_name: str = ""

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle user step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            self._api_key = user_input[CONF_API_KEY].strip()
            station_id = user_input.get(CONF_STATION_ID, "").strip()

            _LOGGER.debug("Starting WillyWeather setup")
            
            # Auto-detect station if not provided
            if not station_id:
                _LOGGER.info("Auto-detecting station")
                try:
                    station_id = await async_get_station_id(
                        self.hass,
                        self.hass.config.latitude,
                        self.hass.config.longitude,
                        self._api_key,
                    )
                    if not station_id:
                        errors["base"] = "no_station_found"
                except Exception as err:
                    _LOGGER.error("Error auto-detecting station: %s", err)
                    errors["base"] = "search_failed"
            
            # Get station name
            if not errors and station_id:
                try:
                    station_name = await async_get_station_name(
                        self.hass, station_id, self._api_key
                    )
                    if not station_name:
                        errors["base"] = "invalid_station_or_key"
                    else:
                        self._station_id = station_id
                        self._station_name = station_name
                        return await self.async_step_prefix()
                except Exception as err:
                    _LOGGER.error("Error fetching station name: %s", err)
                    errors["base"] = "api_error"

        data_schema = vol.Schema(
            {
                vol.Required(CONF_API_KEY): cv.string,
                vol.Optional(CONF_STATION_ID): cv.string,
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors,
            description_placeholders={
                "api_register_url": "https://www.willyweather.com.au/api/register.html"
            },
        )

    async def async_step_prefix(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle sensor prefix configuration step."""
        if user_input is not None:
            self._sensor_prefix = user_input.get(CONF_SENSOR_PREFIX, DEFAULT_SENSOR_PREFIX)
            return await self.async_step_observational()

        # Create default prefix with station name: "ww_{station_name}"
        # Sanitize station name: lowercase, replace spaces with underscores, remove special chars
        station_name = getattr(self, '_station_name', 'weather')
        sanitized_name = station_name.lower().replace(' ', '_').replace('-', '_')
        # Remove any characters that aren't alphanumeric or underscore
        sanitized_name = ''.join(c for c in sanitized_name if c.isalnum() or c == '_')
        default_prefix = f"ww_{sanitized_name}"

        data_schema = vol.Schema(
            {
                vol.Optional(CONF_SENSOR_PREFIX, default=default_prefix): cv.string,
            }
        )

        return self.async_show_form(
            step_id="prefix",
            data_schema=data_schema,
            description_placeholders={"station_name": getattr(self, '_station_name', 'Weather Station')},
        )

    async def async_step_observational(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle observational sensor options step."""
        if user_input is not None:
            self._observational_options = user_input
            _LOGGER.debug("Stored observational options: %s", user_input)
            return await self.async_step_forecast_options()

        data_schema = vol.Schema(
            {
                vol.Required(CONF_INCLUDE_OBSERVATIONAL, default=True): cv.boolean,
                vol.Optional(CONF_INCLUDE_UV, default=True): cv.boolean,
                vol.Optional(CONF_INCLUDE_TIDES, default=False): cv.boolean,
                vol.Optional(CONF_INCLUDE_SWELL, default=False): cv.boolean,
                vol.Optional(CONF_INCLUDE_EXTENDED_FORECAST, default=False): cv.boolean,
            }
        )

        return self.async_show_form(
            step_id="observational",
            data_schema=data_schema,
            description_placeholders={"station_name": getattr(self, '_station_name', 'Weather Station')},
        )

    async def async_step_forecast_options(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle forecast data options step."""
        if user_input is not None:
            self._forecast_options = user_input
            _LOGGER.debug("Stored forecast options: %s", user_input)
            # Always go to warnings next
            return await self.async_step_warnings()

        data_schema = vol.Schema(
            {
                vol.Optional(CONF_INCLUDE_WIND, default=True): cv.boolean,
                vol.Required(CONF_INCLUDE_FORECAST_SENSORS, default=False): cv.boolean,
            }
        )

        return self.async_show_form(
            step_id="forecast_options",
            data_schema=data_schema,
            description_placeholders={"station_name": getattr(self, '_station_name', 'Weather Station')},
        )

    async def async_step_warnings(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle warning sensor options step."""
        if user_input is not None:
            self._warning_options = user_input
            # If forecast sensors enabled, go to forecast sensor selection
            forecast_options = getattr(self, '_forecast_options', {})
            forecast_sensors_enabled = forecast_options.get(CONF_INCLUDE_FORECAST_SENSORS, False)
            if forecast_sensors_enabled:
                return await self.async_step_forecast_sensors()
            # Otherwise go to update intervals
            return await self.async_step_update_intervals()

        data_schema = vol.Schema(
            {
                vol.Required(CONF_INCLUDE_WARNINGS, default=True): cv.boolean,
                vol.Optional(
                    CONF_WARNING_MONITORED,
                    default=list(WARNING_BINARY_SENSOR_TYPES.keys())
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(value=k, label=v["name"])
                            for k, v in WARNING_BINARY_SENSOR_TYPES.items()
                        ],
                        multiple=True,
                        mode=selector.SelectSelectorMode.LIST,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="warnings",
            data_schema=data_schema,
            description_placeholders={"station_name": getattr(self, '_station_name', 'Weather Station')},
        )

    async def async_step_forecast_sensors(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle forecast sensor selection step."""
        if user_input is not None:
            self._forecast_sensor_options = user_input
            return await self.async_step_update_intervals()

        # Build selector options
        forecast_options = []
        for k, v in FORECAST_SENSOR_TYPES.items():
            forecast_options.append(
                selector.SelectOptionDict(value=k, label=v["name"])
            )

        # Build the schema
        forecast_selector = selector.SelectSelector(
            selector.SelectSelectorConfig(
                options=forecast_options,
                multiple=True,
                mode=selector.SelectSelectorMode.LIST,
            )
        )

        # Use NumberSelector for days instead of SelectSelector with DROPDOWN
        # DROPDOWN mode appears to cause issues in some Home Assistant versions
        days_selector = selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=1,
                max=7,
                mode=selector.NumberSelectorMode.SLIDER,
            )
        )

        # Default to Platinum Weather card essentials
        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_FORECAST_MONITORED,
                    default=DEFAULT_FORECAST_SENSORS
                ): forecast_selector,
                vol.Optional(
                    CONF_FORECAST_DAYS,
                    default=5
                ): days_selector,
            }
        )

        return self.async_show_form(
            step_id="forecast_sensors",
            data_schema=data_schema,
            description_placeholders={"station_name": getattr(self, '_station_name', 'Weather Station')},
        )

    async def async_step_update_intervals(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle update interval configuration step."""
        if user_input is not None:
            await self.async_set_unique_id(f"{DOMAIN}_{self._station_id}")
            self._abort_if_unique_id_configured()

            # Get stored options with defaults in case state was lost
            observational_options = getattr(self, '_observational_options', {})
            forecast_options = getattr(self, '_forecast_options', {})
            warning_options = getattr(self, '_warning_options', {})

            # Build options dict from observational options
            # Use the stored prefix or empty string if not set (backward compatibility)
            sensor_prefix = getattr(self, '_sensor_prefix', '')
            options = {
                CONF_SENSOR_PREFIX: sensor_prefix,
                CONF_INCLUDE_OBSERVATIONAL: observational_options.get(CONF_INCLUDE_OBSERVATIONAL, True),
                CONF_INCLUDE_UV: observational_options.get(CONF_INCLUDE_UV, True),
                CONF_INCLUDE_TIDES: observational_options.get(CONF_INCLUDE_TIDES, False),
                CONF_INCLUDE_SWELL: observational_options.get(CONF_INCLUDE_SWELL, False),
                CONF_INCLUDE_EXTENDED_FORECAST: observational_options.get(CONF_INCLUDE_EXTENDED_FORECAST, False),
                CONF_INCLUDE_WIND: forecast_options.get(CONF_INCLUDE_WIND, True),
                CONF_INCLUDE_FORECAST_SENSORS: forecast_options.get(CONF_INCLUDE_FORECAST_SENSORS, False),
                CONF_INCLUDE_WARNINGS: warning_options.get(CONF_INCLUDE_WARNINGS, True),
                CONF_WARNING_MONITORED: warning_options.get(CONF_WARNING_MONITORED, list(WARNING_BINARY_SENSOR_TYPES.keys())),
                CONF_UPDATE_INTERVAL_DAY: user_input.get(CONF_UPDATE_INTERVAL_DAY, DEFAULT_UPDATE_INTERVAL_DAY),
                CONF_UPDATE_INTERVAL_NIGHT: user_input.get(CONF_UPDATE_INTERVAL_NIGHT, DEFAULT_UPDATE_INTERVAL_NIGHT),
                CONF_FORECAST_UPDATE_INTERVAL_DAY: user_input.get(CONF_FORECAST_UPDATE_INTERVAL_DAY, DEFAULT_FORECAST_UPDATE_INTERVAL_DAY),
                CONF_FORECAST_UPDATE_INTERVAL_NIGHT: user_input.get(CONF_FORECAST_UPDATE_INTERVAL_NIGHT, DEFAULT_FORECAST_UPDATE_INTERVAL_NIGHT),
                CONF_NIGHT_START_HOUR: user_input.get(CONF_NIGHT_START_HOUR, DEFAULT_NIGHT_START_HOUR),
                CONF_NIGHT_END_HOUR: user_input.get(CONF_NIGHT_END_HOUR, DEFAULT_NIGHT_END_HOUR),
            }

            # Add forecast sensor options if they were configured
            if hasattr(self, '_forecast_sensor_options'):
                # Convert max days (single integer/float) to list of days [0, 1, ..., max_days-1]
                # NumberSelector returns float, so convert to int for range()
                max_days = int(self._forecast_sensor_options.get(CONF_FORECAST_DAYS, 5))
                options[CONF_FORECAST_DAYS] = list(range(max_days))

                options[CONF_FORECAST_MONITORED] = self._forecast_sensor_options.get(
                    CONF_FORECAST_MONITORED, DEFAULT_FORECAST_SENSORS
                )
            else:
                # Defaults if forecast sensors step was skipped
                options[CONF_FORECAST_DAYS] = [0, 1, 2, 3, 4]
                options[CONF_FORECAST_MONITORED] = DEFAULT_FORECAST_SENSORS

            return self.async_create_entry(
                title=self._station_name or f"Station {self._station_id}",
                data={
                    CONF_API_KEY: self._api_key,
                    CONF_STATION_ID: self._station_id,
                    CONF_STATION_NAME: self._station_name,
                },
                options=options,
            )

        data_schema = vol.Schema(
            {
                vol.Required(CONF_UPDATE_INTERVAL_DAY, default=DEFAULT_UPDATE_INTERVAL_DAY): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=5, max=60, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="minutes")
                ),
                vol.Required(CONF_UPDATE_INTERVAL_NIGHT, default=DEFAULT_UPDATE_INTERVAL_NIGHT): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=10, max=120, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="minutes")
                ),
                vol.Required(CONF_FORECAST_UPDATE_INTERVAL_DAY, default=DEFAULT_FORECAST_UPDATE_INTERVAL_DAY): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=30, max=240, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="minutes")
                ),
                vol.Required(CONF_FORECAST_UPDATE_INTERVAL_NIGHT, default=DEFAULT_FORECAST_UPDATE_INTERVAL_NIGHT): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=60, max=480, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="minutes")
                ),
                vol.Required(CONF_NIGHT_START_HOUR, default=DEFAULT_NIGHT_START_HOUR): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=0, max=23, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="hour")
                ),
                vol.Required(CONF_NIGHT_END_HOUR, default=DEFAULT_NIGHT_END_HOUR): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=0, max=23, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="hour")
                ),
            }
        )

        return self.async_show_form(
            step_id="update_intervals",
            data_schema=data_schema,
            description_placeholders={"station_name": getattr(self, '_station_name', 'Weather Station')},
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle reconfiguration of the integration."""
        errors: dict[str, str] = {}
        reconfigure_entry = self._get_reconfigure_entry()

        if user_input is not None:
            api_key = user_input[CONF_API_KEY].strip()
            station_id = user_input.get(CONF_STATION_ID, "").strip()

            # If no station ID provided, use the existing one
            if not station_id:
                station_id = reconfigure_entry.data[CONF_STATION_ID]

            # Validate the API key and station ID
            try:
                station_name = await async_get_station_name(
                    self.hass, station_id, api_key
                )
                if not station_name:
                    errors["base"] = "invalid_station_or_key"
                else:
                    # Ensure unique ID hasn't changed
                    await self.async_set_unique_id(f"{DOMAIN}_{station_id}")
                    self._abort_if_unique_id_mismatch()

                    # Update the config entry
                    return self.async_update_reload_and_abort(
                        reconfigure_entry,
                        data={
                            CONF_API_KEY: api_key,
                            CONF_STATION_ID: station_id,
                            CONF_STATION_NAME: station_name,
                        },
                    )
            except Exception as err:
                _LOGGER.error("Error validating credentials during reconfigure: %s", err)
                errors["base"] = "cannot_connect"

        # Show the reconfigure form
        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_API_KEY,
                    default=reconfigure_entry.data.get(CONF_API_KEY, "")
                ): cv.string,
                vol.Optional(
                    CONF_STATION_ID,
                    description={
                        "suggested_value": reconfigure_entry.data.get(CONF_STATION_ID, "")
                    }
                ): cv.string,
            }
        )

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=data_schema,
            errors=errors,
            description_placeholders={
                "station_name": reconfigure_entry.data.get(CONF_STATION_NAME, "Weather Station")
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Get the options flow for this handler."""
        return WillyWeatherOptionsFlow()

class WillyWeatherOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow for WillyWeather."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options for observational sensors."""
        if user_input is not None:
            self._observational_options = user_input
            return await self.async_step_forecast_options()

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_INCLUDE_OBSERVATIONAL,
                        default=self.config_entry.options.get(
                            CONF_INCLUDE_OBSERVATIONAL, True
                        ),
                    ): cv.boolean,
                    vol.Optional(
                        CONF_INCLUDE_UV,
                        default=self.config_entry.options.get(CONF_INCLUDE_UV, True),
                    ): cv.boolean,
                    vol.Optional(
                        CONF_INCLUDE_TIDES,
                        default=self.config_entry.options.get(CONF_INCLUDE_TIDES, False),
                    ): cv.boolean,
                    vol.Optional(
                        CONF_INCLUDE_SWELL,
                        default=self.config_entry.options.get(CONF_INCLUDE_SWELL, False),
                    ): cv.boolean,
                    vol.Optional(
                        CONF_INCLUDE_EXTENDED_FORECAST,
                        default=self.config_entry.options.get(CONF_INCLUDE_EXTENDED_FORECAST, False),
                    ): cv.boolean,
                }
            ),
        )

    async def async_step_forecast_options(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage forecast data options."""
        if user_input is not None:
            self._forecast_options = user_input
            # Always go to warnings next
            return await self.async_step_warnings()

        return self.async_show_form(
            step_id="forecast_options",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_INCLUDE_WIND,
                        default=self.config_entry.options.get(CONF_INCLUDE_WIND, True),
                    ): cv.boolean,
                    vol.Required(
                        CONF_INCLUDE_FORECAST_SENSORS,
                        default=self.config_entry.options.get(CONF_INCLUDE_FORECAST_SENSORS, False),
                    ): cv.boolean,
                }
            ),
        )

    async def async_step_warnings(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage warning sensor options."""
        if user_input is not None:
            self._warning_options = user_input
            # If forecast sensors enabled, go to forecast sensor selection
            forecast_sensors_enabled = getattr(self, '_forecast_options', {}).get(CONF_INCLUDE_FORECAST_SENSORS, False)
            if forecast_sensors_enabled:
                return await self.async_step_forecast_sensors()
            # Otherwise go to update intervals
            return await self.async_step_update_intervals()

        return self.async_show_form(
            step_id="warnings",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_INCLUDE_WARNINGS,
                        default=self.config_entry.options.get(CONF_INCLUDE_WARNINGS, True),
                    ): cv.boolean,
                    vol.Optional(
                        CONF_WARNING_MONITORED,
                        default=self.config_entry.options.get(CONF_WARNING_MONITORED, list(WARNING_BINARY_SENSOR_TYPES.keys()))
                    ): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=[
                                selector.SelectOptionDict(value=k, label=v["name"])
                                for k, v in WARNING_BINARY_SENSOR_TYPES.items()
                            ],
                            multiple=True,
                            mode=selector.SelectSelectorMode.LIST,
                        )
                    ),
                }
            ),
        )

    async def async_step_forecast_sensors(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle forecast sensor selection step."""
        if user_input is not None:
            self._forecast_sensor_options = user_input
            return await self.async_step_update_intervals()

        # Convert stored list of days to max days count for the slider
        stored_days = self.config_entry.options.get(CONF_FORECAST_DAYS, [0, 1, 2, 3, 4])
        default_max_days = len(stored_days) if isinstance(stored_days, list) else 5

        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_FORECAST_MONITORED,
                    default=self.config_entry.options.get(CONF_FORECAST_MONITORED, DEFAULT_FORECAST_SENSORS)
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(value=k, label=v["name"])
                            for k, v in FORECAST_SENSOR_TYPES.items()
                        ],
                        multiple=True,
                        mode=selector.SelectSelectorMode.LIST,
                    )
                ),
                vol.Optional(
                    CONF_FORECAST_DAYS,
                    default=default_max_days
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=1,
                        max=7,
                        mode=selector.NumberSelectorMode.SLIDER,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="forecast_sensors",
            data_schema=data_schema,
        )

    async def async_step_update_intervals(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the update interval options."""
        if user_input is not None:
            # Get stored options with defaults in case state was lost
            observational_options = getattr(self, '_observational_options', {})
            forecast_options = getattr(self, '_forecast_options', {})
            warning_options = getattr(self, '_warning_options', {})

            # Merge all options together
            options_data = {
                **observational_options,
                **forecast_options,
                **warning_options,
                CONF_SENSOR_PREFIX: self.config_entry.options.get(CONF_SENSOR_PREFIX, DEFAULT_SENSOR_PREFIX),
                CONF_UPDATE_INTERVAL_DAY: user_input.get(
                    CONF_UPDATE_INTERVAL_DAY, DEFAULT_UPDATE_INTERVAL_DAY
                ),
                CONF_UPDATE_INTERVAL_NIGHT: user_input.get(
                    CONF_UPDATE_INTERVAL_NIGHT, DEFAULT_UPDATE_INTERVAL_NIGHT
                ),
                CONF_FORECAST_UPDATE_INTERVAL_DAY: user_input.get(
                    CONF_FORECAST_UPDATE_INTERVAL_DAY, DEFAULT_FORECAST_UPDATE_INTERVAL_DAY
                ),
                CONF_FORECAST_UPDATE_INTERVAL_NIGHT: user_input.get(
                    CONF_FORECAST_UPDATE_INTERVAL_NIGHT, DEFAULT_FORECAST_UPDATE_INTERVAL_NIGHT
                ),
                CONF_NIGHT_START_HOUR: user_input.get(
                    CONF_NIGHT_START_HOUR, DEFAULT_NIGHT_START_HOUR
                ),
                CONF_NIGHT_END_HOUR: user_input.get(
                    CONF_NIGHT_END_HOUR, DEFAULT_NIGHT_END_HOUR
                ),
            }

            # Add forecast sensor options if they were configured
            if hasattr(self, '_forecast_sensor_options'):
                # Convert max days (single integer/float) to list of days [0, 1, ..., max_days-1]
                # NumberSelector returns float, so convert to int for range()
                max_days = int(self._forecast_sensor_options.get(CONF_FORECAST_DAYS, 5))
                options_data[CONF_FORECAST_DAYS] = list(range(max_days))

                options_data[CONF_FORECAST_MONITORED] = self._forecast_sensor_options.get(
                    CONF_FORECAST_MONITORED, DEFAULT_FORECAST_SENSORS
                )
            else:
                # Preserve existing forecast sensor config if step was skipped
                options_data[CONF_FORECAST_DAYS] = self.config_entry.options.get(CONF_FORECAST_DAYS, [0, 1, 2, 3, 4])
                options_data[CONF_FORECAST_MONITORED] = self.config_entry.options.get(CONF_FORECAST_MONITORED, DEFAULT_FORECAST_SENSORS)

            return self.async_create_entry(
                title="",
                data=options_data,
            )

        return self.async_show_form(
            step_id="update_intervals",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_UPDATE_INTERVAL_DAY,
                        default=self.config_entry.options.get(
                            CONF_UPDATE_INTERVAL_DAY, DEFAULT_UPDATE_INTERVAL_DAY
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=5, max=60, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="minutes")
                    ),
                    vol.Required(
                        CONF_UPDATE_INTERVAL_NIGHT,
                        default=self.config_entry.options.get(
                            CONF_UPDATE_INTERVAL_NIGHT, DEFAULT_UPDATE_INTERVAL_NIGHT
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=10, max=120, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="minutes")
                    ),
                    vol.Required(
                        CONF_FORECAST_UPDATE_INTERVAL_DAY,
                        default=self.config_entry.options.get(
                            CONF_FORECAST_UPDATE_INTERVAL_DAY, DEFAULT_FORECAST_UPDATE_INTERVAL_DAY
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=30, max=240, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="minutes")
                    ),
                    vol.Required(
                        CONF_FORECAST_UPDATE_INTERVAL_NIGHT,
                        default=self.config_entry.options.get(
                            CONF_FORECAST_UPDATE_INTERVAL_NIGHT, DEFAULT_FORECAST_UPDATE_INTERVAL_NIGHT
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=60, max=480, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="minutes")
                    ),
                    vol.Required(
                        CONF_NIGHT_START_HOUR,
                        default=self.config_entry.options.get(
                            CONF_NIGHT_START_HOUR, DEFAULT_NIGHT_START_HOUR
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=0, max=23, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="hour")
                    ),
                    vol.Required(
                        CONF_NIGHT_END_HOUR,
                        default=self.config_entry.options.get(
                            CONF_NIGHT_END_HOUR, DEFAULT_NIGHT_END_HOUR
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=0, max=23, mode=selector.NumberSelectorMode.SLIDER, unit_of_measurement="hour")
                    ),
                }
            ),
        )