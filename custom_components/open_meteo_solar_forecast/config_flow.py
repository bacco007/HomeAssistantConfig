"""Config flow for Open-Meteo Solar Forecast integration."""

from __future__ import annotations

from collections.abc import Sequence
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
    CONF_MAX_FORECAST_AGE_MINUTES,
    CONF_INVERTER_POWER,
    CONF_MODEL,
    CONF_USE_HORIZON,
    CONF_PARTIAL_SHADING,
    CONF_HORIZON_FILEPATH,
    CONF_MODULES_POWER,
    CONF_RETAIN_LATEST_FORECAST_WHEN_UNAVAILABLE,
    DOMAIN,
)

try:
    from homeassistant.config_entries import ConfigFlowResult  # >=2024.4.0b0
except ImportError:
    from homeassistant.data_entry_flow import FlowResult as ConfigFlowResult


def _is_sequence(value: Any) -> bool:
    return isinstance(value, Sequence) and not isinstance(value, (str, bytes))


def _serialize_for_form(value: Any) -> str | int | float | bool:
    if _is_sequence(value):
        return ", ".join(str(item) for item in value)
    return value


def _text_default(value: Any) -> str:
    return str(_serialize_for_form(value))


def _parse_scalar_or_list(value: Any, item_parser: Any) -> Any:
    if _is_sequence(value):
        return [item_parser(item) for item in value]

    if isinstance(value, str):
        raw_value = value.strip()
        if "," in raw_value:
            items = [item.strip() for item in raw_value.split(",")]
            if any(not item for item in items):
                raise vol.Invalid("Comma-separated values cannot contain empty items")
            return [item_parser(item) for item in items]
        value = raw_value

    return item_parser(value)


def _parse_int(min_value: int | None = None, max_value: int | None = None):
    def _parser(value: Any) -> int | list[int]:
        def _parse_item(item: Any) -> int:
            parsed = vol.Coerce(int)(item)
            if min_value is not None and parsed < min_value:
                raise vol.Invalid(f"Value {parsed} is below minimum {min_value}")
            if max_value is not None and parsed > max_value:
                raise vol.Invalid(f"Value {parsed} is above maximum {max_value}")
            return parsed

        return _parse_scalar_or_list(value, _parse_item)

    return _parser


def _parse_float(min_value: float | None = None, max_value: float | None = None):
    def _parser(value: Any) -> float | list[float]:
        def _parse_item(item: Any) -> float:
            parsed = vol.Coerce(float)(item)
            if min_value is not None and parsed < min_value:
                raise vol.Invalid(f"Value {parsed} is below minimum {min_value}")
            if max_value is not None and parsed > max_value:
                raise vol.Invalid(f"Value {parsed} is above maximum {max_value}")
            return parsed

        return _parse_scalar_or_list(value, _parse_item)

    return _parser


def _parse_bool(value: Any) -> bool | list[bool]:
    true_values = {"1", "true", "yes", "on"}
    false_values = {"0", "false", "no", "off"}

    def _parse_item(item: Any) -> bool:
        if isinstance(item, bool):
            return item

        normalized = str(item).strip().lower()
        if normalized in true_values:
            return True
        if normalized in false_values:
            return False

        raise vol.Invalid(f"Invalid boolean value: {item}")

    return _parse_scalar_or_list(value, _parse_item)


def _parse_non_empty_str(value: Any) -> str | list[str]:
    def _parse_item(item: Any) -> str:
        parsed = str(item).strip()
        if not parsed:
            raise vol.Invalid("Value cannot be empty")
        return parsed

    return _parse_scalar_or_list(value, _parse_item)


def _parse_latitude(value: Any) -> float | list[float]:
    return _parse_scalar_or_list(value, cv.latitude)


def _parse_longitude(value: Any) -> float | list[float]:
    return _parse_scalar_or_list(value, cv.longitude)


def _normalize_flow_values(user_input: dict[str, Any]) -> dict[str, Any]:
    def _default_if_empty(value: Any, default: Any) -> Any:
        if value is None:
            return default
        if isinstance(value, str) and value.strip() == "":
            return default
        return value

    use_horizon_value = _default_if_empty(user_input.get(CONF_USE_HORIZON), False)
    partial_shading_value = _default_if_empty(
        user_input.get(CONF_PARTIAL_SHADING), False
    )
    horizon_filepath_value = _default_if_empty(
        user_input.get(
            CONF_HORIZON_FILEPATH,
            "/config/custom_components/open_meteo_solar_forecast/horizon.txt",
        ),
        "/config/custom_components/open_meteo_solar_forecast/horizon.txt",
    )

    return {
        **user_input,
        CONF_LATITUDE: _parse_latitude(user_input[CONF_LATITUDE]),
        CONF_LONGITUDE: _parse_longitude(user_input[CONF_LONGITUDE]),
        CONF_DECLINATION: _parse_int(min_value=0, max_value=90)(
            user_input[CONF_DECLINATION]
        ),
        CONF_AZIMUTH: _parse_int(min_value=0, max_value=360)(user_input[CONF_AZIMUTH]),
        CONF_MODULES_POWER: _parse_int(min_value=1)(user_input[CONF_MODULES_POWER]),
        CONF_EFFICIENCY_FACTOR: _parse_float(min_value=0, max_value=1)(
            _default_if_empty(user_input.get(CONF_EFFICIENCY_FACTOR), 1.0)
        ),
        CONF_DAMPING_MORNING: _parse_float(min_value=0, max_value=1)(
            _default_if_empty(user_input.get(CONF_DAMPING_MORNING), 0.0)
        ),
        CONF_DAMPING_EVENING: _parse_float(min_value=0, max_value=1)(
            _default_if_empty(user_input.get(CONF_DAMPING_EVENING), 0.0)
        ),
        CONF_USE_HORIZON: _parse_bool(use_horizon_value),
        CONF_PARTIAL_SHADING: _parse_bool(partial_shading_value),
        CONF_HORIZON_FILEPATH: _parse_non_empty_str(horizon_filepath_value),
    }


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
        errors = {}
        if user_input is not None:
            try:
                normalized_input = _normalize_flow_values(user_input)
            except vol.Invalid:
                errors["base"] = "invalid_multi_value"
            else:
                return self.async_create_entry(
                    title=normalized_input[CONF_NAME],
                    data={
                        CONF_LATITUDE: normalized_input[CONF_LATITUDE],
                        CONF_LONGITUDE: normalized_input[CONF_LONGITUDE],
                    },
                    options={
                        CONF_API_KEY: normalized_input[CONF_API_KEY],
                        CONF_AZIMUTH: normalized_input[CONF_AZIMUTH],
                        CONF_BASE_URL: normalized_input[CONF_BASE_URL],
                        CONF_DAMPING_MORNING: normalized_input[CONF_DAMPING_MORNING],
                        CONF_DAMPING_EVENING: normalized_input[CONF_DAMPING_EVENING],
                        CONF_DECLINATION: normalized_input[CONF_DECLINATION],
                        CONF_MODULES_POWER: normalized_input[CONF_MODULES_POWER],
                        CONF_INVERTER_POWER: normalized_input[CONF_INVERTER_POWER],
                        CONF_EFFICIENCY_FACTOR: normalized_input[CONF_EFFICIENCY_FACTOR],
                        CONF_USE_HORIZON: normalized_input[CONF_USE_HORIZON],
                        CONF_PARTIAL_SHADING: normalized_input[CONF_PARTIAL_SHADING],
                        CONF_HORIZON_FILEPATH: normalized_input[CONF_HORIZON_FILEPATH],
                        CONF_MODEL: normalized_input[CONF_MODEL],
                        CONF_RETAIN_LATEST_FORECAST_WHEN_UNAVAILABLE: normalized_input[
                            CONF_RETAIN_LATEST_FORECAST_WHEN_UNAVAILABLE
                        ],
                        CONF_MAX_FORECAST_AGE_MINUTES: normalized_input[
                            CONF_MAX_FORECAST_AGE_MINUTES
                        ],
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
                        CONF_LATITUDE, default=_text_default(self.hass.config.latitude)
                    ): str,
                    vol.Required(
                        CONF_LONGITUDE, default=_text_default(self.hass.config.longitude)
                    ): str,
                    vol.Required(CONF_DECLINATION, default="25"): str,
                    vol.Required(CONF_AZIMUTH, default="180"): str,
                    vol.Required(CONF_USE_HORIZON, default="false"): str,
                    vol.Required(CONF_PARTIAL_SHADING, default="false"): str,
                    vol.Optional(
                        CONF_HORIZON_FILEPATH,
                        default="/config/custom_components/open_meteo_solar_forecast/horizon.txt",
                    ): str,
                    vol.Required(CONF_MODULES_POWER): str,
                    vol.Required(CONF_INVERTER_POWER, default=0): vol.All(
                        vol.Coerce(int), vol.Range(min=0)
                    ),
                    vol.Optional(CONF_DAMPING_MORNING, default="0.0"): str,
                    vol.Optional(CONF_DAMPING_EVENING, default="0.0"): str,
                    vol.Optional(CONF_EFFICIENCY_FACTOR, default="1.0"): str,
                    vol.Optional(CONF_MODEL, default="best_match"): str,
                    vol.Required(
                        CONF_RETAIN_LATEST_FORECAST_WHEN_UNAVAILABLE,
                        default=True,
                    ): bool,
                    vol.Required(
                        CONF_MAX_FORECAST_AGE_MINUTES,
                        default=0,
                    ): vol.All(vol.Coerce(int), vol.Range(min=0)),
                }
            ),
            errors=errors,
        )


class OpenMeteoSolarForecastOptionFlowHandler(OptionsFlow):
    """Handle options."""

    def _current_latitude(self) -> Any:
        return self.config_entry.options.get(
            CONF_LATITUDE, self.config_entry.data[CONF_LATITUDE]
        )

    def _current_longitude(self) -> Any:
        return self.config_entry.options.get(
            CONF_LONGITUDE, self.config_entry.data[CONF_LONGITUDE]
        )

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        errors = {}
        if user_input is not None:
            try:
                normalized_input = _normalize_flow_values(user_input)
            except vol.Invalid:
                errors["base"] = "invalid_multi_value"
            else:
                return self.async_create_entry(
                    title="",
                    data=normalized_input
                    | {CONF_API_KEY: normalized_input.get(CONF_API_KEY)},
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
                        CONF_LATITUDE,
                        default=_text_default(self._current_latitude()),
                    ): str,
                    vol.Required(
                        CONF_LONGITUDE,
                        default=_text_default(self._current_longitude()),
                    ): str,
                    vol.Required(
                        CONF_DECLINATION,
                        default=_text_default(
                            self.config_entry.options[CONF_DECLINATION]
                        ),
                    ): str,
                    vol.Required(
                        CONF_AZIMUTH,
                        default=_text_default(
                            self.config_entry.options.get(CONF_AZIMUTH)
                        ),
                    ): str,
                    vol.Required(
                        CONF_MODULES_POWER,
                        default=_text_default(
                            self.config_entry.options[CONF_MODULES_POWER]
                        ),
                    ): str,
                    vol.Optional(
                        CONF_DAMPING_MORNING,
                        default=_text_default(
                            self.config_entry.options.get(CONF_DAMPING_MORNING, 0.0)
                        ),
                    ): str,
                    vol.Optional(
                        CONF_DAMPING_EVENING,
                        default=_text_default(
                            self.config_entry.options.get(CONF_DAMPING_EVENING, 0.0)
                        ),
                    ): str,
                    vol.Required(
                        CONF_USE_HORIZON,
                        default=_text_default(
                            self.config_entry.options.get(CONF_USE_HORIZON, False)
                        ),
                    ): str,
                    vol.Required(
                        CONF_PARTIAL_SHADING,
                        default=_text_default(
                            self.config_entry.options.get(CONF_PARTIAL_SHADING, False)
                        ),
                    ): str,
                    vol.Optional(
                        CONF_HORIZON_FILEPATH,
                        default=_text_default(
                            self.config_entry.options.get(
                                CONF_HORIZON_FILEPATH,
                                "/config/custom_components/open_meteo_solar_forecast/horizon.txt",
                            )
                        ),
                    ): str,
                    vol.Required(
                        CONF_INVERTER_POWER,
                        default=self.config_entry.options.get(CONF_INVERTER_POWER, 0),
                    ): vol.All(vol.Coerce(int), vol.Range(min=0)),
                    vol.Optional(
                        CONF_EFFICIENCY_FACTOR,
                        default=_text_default(
                            self.config_entry.options.get(CONF_EFFICIENCY_FACTOR, 1.0)
                        ),
                    ): str,
                    vol.Optional(
                        CONF_MODEL,
                        default=self.config_entry.options.get(CONF_MODEL, "best_match"),
                    ): str,
                    vol.Required(
                        CONF_RETAIN_LATEST_FORECAST_WHEN_UNAVAILABLE,
                        default=self.config_entry.options.get(
                            CONF_RETAIN_LATEST_FORECAST_WHEN_UNAVAILABLE, True
                        ),
                    ): bool,
                    vol.Required(
                        CONF_MAX_FORECAST_AGE_MINUTES,
                        default=self.config_entry.options.get(
                            CONF_MAX_FORECAST_AGE_MINUTES, 0
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=0)),
                }
            ),
            errors=errors,
        )
