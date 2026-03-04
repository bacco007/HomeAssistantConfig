"""Config flow for ADS-B SkyVista integration."""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback

from .const import (
    CONF_DATA_URL,
    CONF_HEXDB_ENABLED,
    CONF_MAX_AGE,
    CONF_NAME,
    CONF_UPDATE_INTERVAL,
    DEMO_DATA_URL,
    DEFAULT_HEXDB_ENABLED,
    DEFAULT_MAX_AGE,
    DEFAULT_NAME,
    DEFAULT_UPDATE_INTERVAL,
    DOMAIN,
    normalize_data_url,
)


def _user_schema() -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(CONF_NAME): str,
            vol.Required(CONF_DATA_URL): str,
            vol.Required(CONF_UPDATE_INTERVAL): vol.All(
                vol.Coerce(int),
                vol.Range(min=2, max=600),
            ),
            vol.Required(CONF_MAX_AGE): vol.All(
                vol.Coerce(int),
                vol.Range(min=1, max=3600),
            ),
            vol.Required(CONF_HEXDB_ENABLED): bool,
        }
    )


def _options_schema() -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(CONF_UPDATE_INTERVAL): vol.All(
                vol.Coerce(int),
                vol.Range(min=2, max=600),
            ),
            vol.Required(CONF_MAX_AGE): vol.All(
                vol.Coerce(int),
                vol.Range(min=1, max=3600),
            ),
            vol.Required(CONF_HEXDB_ENABLED): bool,
        }
    )


def _reconfigure_schema() -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(CONF_DATA_URL): str,
        }
    )


def _validate_data_url(url: str) -> str | None:
    """Validate user-provided data URL."""
    if not url:
        return "invalid_data_url"

    if url == DEMO_DATA_URL:
        return "replace_demo_data_url"

    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return "invalid_data_url"

    return None


class FlightCardConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for ADS-B SkyVista."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        """Handle initial user setup."""
        if user_input is not None:
            cleaned_input = dict(user_input)
            cleaned_input[CONF_DATA_URL] = normalize_data_url(cleaned_input.get(CONF_DATA_URL))
            errors: dict[str, str] = {}

            data_url_error = _validate_data_url(cleaned_input[CONF_DATA_URL])
            if data_url_error:
                errors[CONF_DATA_URL] = data_url_error

            if not errors:
                await self.async_set_unique_id(cleaned_input[CONF_NAME].strip().lower())
                self._abort_if_unique_id_configured()

                title = cleaned_input[CONF_NAME].strip() or DEFAULT_NAME
                return self.async_create_entry(title=title, data=cleaned_input)

            return self.async_show_form(
                step_id="user",
                data_schema=self.add_suggested_values_to_schema(_user_schema(), cleaned_input),
                errors=errors,
            )

        defaults = {
            CONF_NAME: DEFAULT_NAME,
            CONF_DATA_URL: DEMO_DATA_URL,
            CONF_UPDATE_INTERVAL: DEFAULT_UPDATE_INTERVAL,
            CONF_MAX_AGE: DEFAULT_MAX_AGE,
            CONF_HEXDB_ENABLED: DEFAULT_HEXDB_ENABLED,
        }

        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(_user_schema(), defaults),
        )

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None):
        """Handle reconfiguration of required setup values."""
        reconfigure_entry = self._get_reconfigure_entry()

        if user_input is not None:
            cleaned_input = dict(user_input)
            cleaned_input[CONF_DATA_URL] = normalize_data_url(cleaned_input.get(CONF_DATA_URL))
            errors: dict[str, str] = {}

            data_url_error = _validate_data_url(cleaned_input[CONF_DATA_URL])
            if data_url_error:
                errors[CONF_DATA_URL] = data_url_error

            if not errors:
                return self.async_update_reload_and_abort(
                    reconfigure_entry,
                    data_updates={CONF_DATA_URL: cleaned_input[CONF_DATA_URL]},
                )

            return self.async_show_form(
                step_id="reconfigure",
                data_schema=self.add_suggested_values_to_schema(
                    _reconfigure_schema(), cleaned_input
                ),
                errors=errors,
            )

        defaults = {
            CONF_DATA_URL: normalize_data_url(
                reconfigure_entry.data.get(CONF_DATA_URL, DEMO_DATA_URL)
            ),
        }
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=self.add_suggested_values_to_schema(_reconfigure_schema(), defaults),
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        """Return options flow handler."""
        return FlightCardOptionsFlow(config_entry)


class FlightCardOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow for ADS-B SkyVista."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self._config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None):
        """Manage options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=dict(user_input))

        defaults = {
            CONF_UPDATE_INTERVAL: self._config_entry.options.get(
                CONF_UPDATE_INTERVAL,
                self._config_entry.data.get(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL),
            ),
            CONF_MAX_AGE: self._config_entry.options.get(
                CONF_MAX_AGE,
                self._config_entry.data.get(CONF_MAX_AGE, DEFAULT_MAX_AGE),
            ),
            CONF_HEXDB_ENABLED: self._config_entry.options.get(
                CONF_HEXDB_ENABLED,
                self._config_entry.data.get(CONF_HEXDB_ENABLED, DEFAULT_HEXDB_ENABLED),
            ),
        }

        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(_options_schema(), defaults),
        )
