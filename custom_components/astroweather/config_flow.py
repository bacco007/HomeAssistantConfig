"""Config Flow to configure AstroWeather Integration."""

import logging

import voluptuous as vol
from voluptuous.schema_builder import Schema

from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_ELEVATION, CONF_LATITUDE, CONF_LONGITUDE
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import AbortFlow
from homeassistant.helpers.typing import ConfigType

from .const import (
    CONF_CONDITION_CALM_WEIGHT,
    CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING,
    CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING,
    CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING,
    CONF_CONDITION_CLOUDCOVER_WEIGHT,
    CONF_CONDITION_SEEING_WEIGHT,
    CONF_CONDITION_TRANSPARENCY_WEIGHT,
    CONF_EXPERIMENTAL_FEATURES,
    CONF_FORECAST_INTERVAL,
    CONF_LOCATION_NAME,
    CONF_TIMEZONE_INFO,
    CONF_UPTONIGHT_PATH,
    DEFAULT_CONDITION_CALM_WEIGHT,
    DEFAULT_CONDITION_CLOUDCOVER_HIGH_WEAKENING,
    DEFAULT_CONDITION_CLOUDCOVER_LOW_WEAKENING,
    DEFAULT_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING,
    DEFAULT_CONDITION_CLOUDCOVER_WEIGHT,
    DEFAULT_CONDITION_SEEING_WEIGHT,
    DEFAULT_CONDITION_TRANSPARENCY_WEIGHT,
    DEFAULT_ELEVATION,
    DEFAULT_EXPERIMENTAL_FEATURES,
    DEFAULT_FORECAST_INTERVAL,
    DEFAULT_LOCATION_NAME,
    DEFAULT_UPTONIGHT_PATH,
    DOMAIN,
    FORECAST_INTERVAL_MAX,
    FORECAST_INTERVAL_MIN,
    TIMEZONES,
)

_LOGGER = logging.getLogger(__name__)


def _get_current_values(hass: HomeAssistant, data: ConfigType):
    """Return current values."""

    if CONF_LOCATION_NAME not in data:
        data[CONF_LOCATION_NAME] = DEFAULT_LOCATION_NAME
    if CONF_LATITUDE not in data:
        data[CONF_LATITUDE] = hass.config.latitude
    if CONF_LONGITUDE not in data:
        data[CONF_LONGITUDE] = hass.config.longitude
    if CONF_ELEVATION not in data:
        data[CONF_ELEVATION] = DEFAULT_ELEVATION
    if CONF_TIMEZONE_INFO not in data:
        data[CONF_TIMEZONE_INFO] = hass.config.time_zone
    if CONF_CONDITION_CLOUDCOVER_WEIGHT not in data:
        data[CONF_CONDITION_CLOUDCOVER_WEIGHT] = DEFAULT_CONDITION_CLOUDCOVER_WEIGHT
    if CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING not in data:
        data[CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING] = (
            DEFAULT_CONDITION_CLOUDCOVER_HIGH_WEAKENING
        )
    if CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING not in data:
        data[CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING] = (
            DEFAULT_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING
        )
    if CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING not in data:
        data[CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING] = (
            DEFAULT_CONDITION_CLOUDCOVER_LOW_WEAKENING
        )
    if CONF_CONDITION_SEEING_WEIGHT not in data:
        data[CONF_CONDITION_SEEING_WEIGHT] = DEFAULT_CONDITION_SEEING_WEIGHT
    if CONF_CONDITION_TRANSPARENCY_WEIGHT not in data:
        data[CONF_CONDITION_TRANSPARENCY_WEIGHT] = DEFAULT_CONDITION_TRANSPARENCY_WEIGHT
    if CONF_CONDITION_CALM_WEIGHT not in data:
        data[CONF_CONDITION_CALM_WEIGHT] = DEFAULT_CONDITION_CALM_WEIGHT
    if CONF_FORECAST_INTERVAL not in data:
        data[CONF_FORECAST_INTERVAL] = DEFAULT_FORECAST_INTERVAL
    if CONF_UPTONIGHT_PATH not in data:
        data[CONF_UPTONIGHT_PATH] = DEFAULT_UPTONIGHT_PATH
    if CONF_EXPERIMENTAL_FEATURES not in data:
        data[CONF_EXPERIMENTAL_FEATURES] = DEFAULT_EXPERIMENTAL_FEATURES

    return data


def _get_config_data(
    hass: HomeAssistant, data: ConfigType, user_input: ConfigType
) -> ConfigType:
    """Return config data."""

    data = _get_current_values(hass, data)
    return {
        CONF_LOCATION_NAME: user_input.get(
            CONF_LOCATION_NAME,
            data[CONF_LOCATION_NAME],
        ),
        CONF_LATITUDE: user_input.get(
            CONF_LATITUDE,
            data[CONF_LATITUDE],
        ),
        CONF_LONGITUDE: user_input.get(
            CONF_LONGITUDE,
            data[CONF_LONGITUDE],
        ),
        CONF_ELEVATION: user_input.get(
            CONF_ELEVATION,
            data[CONF_ELEVATION],
        ),
        CONF_TIMEZONE_INFO: user_input.get(
            CONF_TIMEZONE_INFO,
            data[CONF_TIMEZONE_INFO],
        ),
        CONF_CONDITION_CLOUDCOVER_WEIGHT: user_input.get(
            CONF_CONDITION_CLOUDCOVER_WEIGHT,
            data[CONF_CONDITION_CLOUDCOVER_WEIGHT],
        ),
        CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING: user_input.get(
            CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING,
            data[CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING],
        ),
        CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING: user_input.get(
            CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING,
            data[CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING],
        ),
        CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING: user_input.get(
            CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING,
            data[CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING],
        ),
        CONF_CONDITION_SEEING_WEIGHT: user_input.get(
            CONF_CONDITION_SEEING_WEIGHT, data[CONF_CONDITION_SEEING_WEIGHT]
        ),
        CONF_CONDITION_TRANSPARENCY_WEIGHT: user_input.get(
            CONF_CONDITION_TRANSPARENCY_WEIGHT,
            data[CONF_CONDITION_TRANSPARENCY_WEIGHT],
        ),
        CONF_CONDITION_CALM_WEIGHT: user_input.get(
            CONF_CONDITION_CALM_WEIGHT, data[CONF_CONDITION_CALM_WEIGHT]
        ),
        CONF_FORECAST_INTERVAL: data.get(
            CONF_FORECAST_INTERVAL, data[CONF_FORECAST_INTERVAL]
        ),
        CONF_UPTONIGHT_PATH: user_input.get(
            CONF_UPTONIGHT_PATH, data[CONF_UPTONIGHT_PATH]
        ),
        CONF_EXPERIMENTAL_FEATURES: user_input.get(
            CONF_EXPERIMENTAL_FEATURES, data[CONF_EXPERIMENTAL_FEATURES]
        ),
    }


def get_location_schema(hass: HomeAssistant, data: ConfigType) -> Schema:
    """Return the location schema."""

    return vol.Schema(
        {
            vol.Required(CONF_LOCATION_NAME, default=DEFAULT_LOCATION_NAME): vol.All(
                vol.Coerce(str)
            ),
            vol.Required(CONF_LATITUDE, default=hass.config.latitude): vol.All(
                vol.Coerce(float), vol.Range(min=-89, max=89)
            ),
            vol.Required(CONF_LONGITUDE, default=hass.config.longitude): vol.All(
                vol.Coerce(float), vol.Range(min=-180, max=180)
            ),
            vol.Required(CONF_ELEVATION, default=DEFAULT_ELEVATION): vol.All(
                vol.Coerce(int), vol.Range(min=0, max=4000)
            ),
            vol.Required(CONF_TIMEZONE_INFO, default=hass.config.time_zone): vol.All(
                vol.Coerce(str), vol.In(TIMEZONES)
            ),
        }
    )


def get_calculation_schema(hass: HomeAssistant, data: ConfigType) -> Schema:
    """Return the calculation schema."""

    data = _get_current_values(hass, data)
    return vol.Schema(
        {
            vol.Required(
                CONF_CONDITION_CLOUDCOVER_WEIGHT,
                default=data[CONF_CONDITION_CLOUDCOVER_WEIGHT],
            ): vol.All(
                vol.Coerce(int),
                vol.Range(min=0, max=5),
            ),
            vol.Required(
                CONF_CONDITION_SEEING_WEIGHT,
                default=data[CONF_CONDITION_SEEING_WEIGHT],
            ): vol.All(
                vol.Coerce(int),
                vol.Range(min=0, max=5),
            ),
            vol.Required(
                CONF_CONDITION_TRANSPARENCY_WEIGHT,
                default=data[CONF_CONDITION_TRANSPARENCY_WEIGHT],
            ): vol.All(
                vol.Coerce(int),
                vol.Range(min=0, max=5),
            ),
            vol.Required(
                CONF_CONDITION_CALM_WEIGHT,
                default=data[CONF_CONDITION_CALM_WEIGHT],
            ): vol.All(
                vol.Coerce(int),
                vol.Range(min=0, max=5),
            ),
            vol.Required(
                CONF_FORECAST_INTERVAL, default=data[CONF_FORECAST_INTERVAL]
            ): vol.All(
                vol.Coerce(int),
                vol.Range(min=FORECAST_INTERVAL_MIN, max=FORECAST_INTERVAL_MAX),
            ),
            vol.Optional(
                CONF_UPTONIGHT_PATH,
                default=data[CONF_UPTONIGHT_PATH],
            ): vol.All(
                vol.Coerce(str),
            ),
            vol.Required(
                CONF_EXPERIMENTAL_FEATURES,
                default=data[CONF_EXPERIMENTAL_FEATURES],
            ): vol.All(
                vol.Coerce(bool),
            ),
        }
    )


def get_cloudweakening_schema(hass: HomeAssistant, data: ConfigType) -> Schema:
    """Return the cloudweakening schema."""

    data = _get_current_values(hass, data)
    return vol.Schema(
        {
            vol.Required(
                CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING,
                default=data[CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING],
            ): vol.All(
                vol.Coerce(int),
                vol.Range(min=0, max=100),
            ),
            vol.Required(
                CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING,
                default=data[CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING],
            ): vol.All(
                vol.Coerce(int),
                vol.Range(min=0, max=100),
            ),
            vol.Required(
                CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING,
                default=data[CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING],
            ): vol.All(
                vol.Coerce(int),
                vol.Range(min=0, max=100),
            ),
        }
    )


def _update_location_input(
    hass: HomeAssistant, data: ConfigType, location_input: ConfigType
) -> None:
    """Update location data."""

    if location_input is not None:
        data[CONF_LOCATION_NAME] = location_input.get(
            CONF_LOCATION_NAME, DEFAULT_LOCATION_NAME
        )
        data[CONF_LATITUDE] = location_input.get(CONF_LATITUDE, hass.config.latitude)
        data[CONF_LONGITUDE] = location_input.get(
            CONF_LONGITUDE,
            hass.config.longitude,
        )
        data[CONF_ELEVATION] = location_input.get(CONF_ELEVATION, DEFAULT_ELEVATION)
        data[CONF_TIMEZONE_INFO] = location_input.get(
            CONF_TIMEZONE_INFO, hass.config.time_zone
        )


def _update_calculation_input(data: ConfigType, calculation_input: ConfigType) -> None:
    """Update calculation data."""

    if calculation_input is not None:
        data[CONF_CONDITION_CLOUDCOVER_WEIGHT] = calculation_input.get(
            CONF_CONDITION_CLOUDCOVER_WEIGHT, DEFAULT_CONDITION_CLOUDCOVER_WEIGHT
        )
        data[CONF_CONDITION_SEEING_WEIGHT] = calculation_input.get(
            CONF_CONDITION_SEEING_WEIGHT, DEFAULT_CONDITION_SEEING_WEIGHT
        )
        data[CONF_CONDITION_TRANSPARENCY_WEIGHT] = calculation_input.get(
            CONF_CONDITION_TRANSPARENCY_WEIGHT,
            DEFAULT_CONDITION_TRANSPARENCY_WEIGHT,
        )
        data[CONF_CONDITION_CALM_WEIGHT] = calculation_input.get(
            CONF_CONDITION_CALM_WEIGHT, DEFAULT_CONDITION_CALM_WEIGHT
        )
        data[CONF_FORECAST_INTERVAL] = calculation_input.get(
            CONF_FORECAST_INTERVAL, DEFAULT_FORECAST_INTERVAL
        )
        data[CONF_UPTONIGHT_PATH] = calculation_input.get(
            CONF_UPTONIGHT_PATH, DEFAULT_UPTONIGHT_PATH
        )
        data[CONF_EXPERIMENTAL_FEATURES] = calculation_input.get(
            CONF_EXPERIMENTAL_FEATURES, DEFAULT_EXPERIMENTAL_FEATURES
        )


def _update_cloudweakening_input(
    data: ConfigType, cloudweakening_input: ConfigType
) -> None:
    """Update cloudweakening data."""

    if cloudweakening_input is not None:
        data[CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING] = cloudweakening_input.get(
            CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING,
            DEFAULT_CONDITION_CLOUDCOVER_HIGH_WEAKENING,
        )
        data[CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING] = cloudweakening_input.get(
            CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING,
            DEFAULT_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING,
        )
        data[CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING] = cloudweakening_input.get(
            CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING,
            DEFAULT_CONDITION_CLOUDCOVER_LOW_WEAKENING,
        )


class AstroWeatherConfigFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a AstroWeather config flow."""

    # As of 0.50.0 it's version 2
    VERSION = 2
    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_POLL

    def __init__(self) -> None:
        """Init the ConfigFlow."""

        self.data: ConfigType = {}

    async def async_step_user(
        self, user_input: ConfigType | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initiated by the user."""

        return await self.async_step_location(user_input=user_input)

    async def async_step_location(
        self, user_input: ConfigType | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initiated by the user."""

        if user_input is not None:
            self.data = _get_config_data(self.hass, self.data, user_input=user_input)
            return await self.async_step_calculation()

        _update_location_input(self.hass, data=self.data, location_input=user_input)

        return self.async_show_form(
            step_id="location",
            data_schema=get_location_schema(hass=self.hass, data=self.data),
        )

    async def async_step_calculation(
        self, calculation_input: ConfigType | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initiated by the user."""

        if calculation_input is not None:
            self.data = _get_config_data(
                self.hass, self.data, user_input=calculation_input
            )
            return await self.async_step_cloudweakening()

        _update_calculation_input(data=self.data, calculation_input=calculation_input)

        return self.async_show_form(
            step_id="calculation",
            data_schema=get_calculation_schema(self.hass, data=self.data),
        )

    async def async_step_cloudweakening(
        self, cloudweakening_input: ConfigType | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initiated by the user."""

        if cloudweakening_input is None:
            return self.async_show_form(
                step_id="cloudweakening",
                data_schema=get_cloudweakening_schema(self.hass, data=self.data),
            )

        _update_cloudweakening_input(
            data=self.data, cloudweakening_input=cloudweakening_input
        )

        try:
            unique_id = f"{self.data[CONF_LOCATION_NAME]!s}"
            await self.async_set_unique_id(unique_id)
            self._abort_if_unique_id_configured()
        except AbortFlow as af:
            _LOGGER.error("Exception: %s", str(af))
            msg = f"Location {self.data[CONF_LOCATION_NAME]!s} is {af.reason.replace('_', ' ')}"
            return self.async_abort(reason=msg)
        else:
            return self.async_create_entry(
                title=self.data[CONF_LOCATION_NAME], data=self.data
            )

        # return self.async_show_form(
        #     step_id="location",
        #     data_schema=get_location_schema(hass=self.hass, data=self.data),
        # )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""

        return AstroWeatherOptionsFlowHandler(config_entry)


class AstroWeatherOptionsFlowHandler(OptionsFlow):
    """Handle options."""

    def __init__(self, entry: ConfigEntry) -> None:
        """Initialize options flow."""

        self.entry = entry
        self.data: ConfigType = dict(self.entry.data.items())

    async def async_step_init(
        self, user_input: ConfigType | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""

        # return await self.async_step_location(user_input=user_input)
        return await self.async_step_calculation(calculation_input=user_input)

    async def async_step_location(
        self, user_input: ConfigType | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initiated by the user."""

        if user_input is not None:
            self.data = _get_config_data(self.hass, self.data, user_input=user_input)
            return await self.async_step_calculation()

        # test
        _update_location_input(self.hass, data=self.data, location_input=user_input)

        return self.async_show_form(
            step_id="location",
            data_schema=get_location_schema(hass=self.hass, data=self.data),
        )

    async def async_step_calculation(
        self, calculation_input: ConfigType | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initiated by the user."""

        if calculation_input is not None:
            self.data = _get_config_data(
                self.hass, self.data, user_input=calculation_input
            )
            return await self.async_step_cloudweakening()

        _update_calculation_input(data=self.data, calculation_input=calculation_input)

        return self.async_show_form(
            step_id="calculation",
            data_schema=get_calculation_schema(self.hass, data=self.data),
        )

    async def async_step_cloudweakening(
        self, cloudweakening_input: ConfigType | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initiated by the user."""

        if cloudweakening_input is None:
            return self.async_show_form(
                step_id="cloudweakening",
                data_schema=get_cloudweakening_schema(self.hass, data=self.data),
            )

        _update_cloudweakening_input(
            data=self.data, cloudweakening_input=cloudweakening_input
        )

        self.hass.config_entries.async_update_entry(
            entry=self.entry,
            unique_id=f"{self.data[CONF_LOCATION_NAME]!s}",
            data=self.data,
        )

        return self.async_create_entry(title="", data={})

        # return self.async_show_form(
        #     step_id="location",
        #     data_schema=get_location_schema(hass=self.hass, data=self.data),
        # )
