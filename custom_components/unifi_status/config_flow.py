"""Config flow to configure qnap component."""
from __future__ import annotations

import logging
from typing import Any
from .pyunifi.controller import Controller, APIError

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import (
    CONF_NAME,
    CONF_HOST,
    CONF_USERNAME,
    CONF_PORT,
    CONF_PASSWORD,
    CONF_MONITORED_CONDITIONS,
    CONF_VERIFY_SSL,
)
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_SITE_ID,
    CONF_UNIFI_VERSION,
    DEFAULT_NAME,
    DEFAULT_HOST,
    DEFAULT_PORT,
    DEFAULT_UNIFI_VERSION,
    DEFAULT_SITE,
    DEFAULT_VERIFY_SSL,
    MIN_TIME_BETWEEN_UPDATES,
    DOMAIN,
)

DATA_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
        vol.Optional(CONF_HOST, default=DEFAULT_HOST): cv.string,
        vol.Optional(CONF_SITE_ID, default=DEFAULT_SITE): cv.string,
        vol.Required(CONF_PASSWORD): cv.string,
        vol.Required(CONF_USERNAME): cv.string,
        vol.Optional(CONF_UNIFI_VERSION, default=DEFAULT_UNIFI_VERSION): cv.string,
        vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
        vol.Optional(CONF_VERIFY_SSL, default=DEFAULT_VERIFY_SSL): vol.Any(
            cv.boolean, cv.isfile
        ),
        vol.Optional(CONF_MONITORED_CONDITIONS, default=DEFAULT_MONITORED): vol.All(
            cv.ensure_list, [vol.In(POSSIBLE_MONITORED)]
        ),
    }
)

_LOGGER = logging.getLogger(__name__)


class UnifiConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Unifi configuration flow."""

    VERSION = 1

    def async_step_user(hass, config, add_entities, discovery_info=None):
    """Set up the Unifi sensor."""

    name = config.get(CONF_NAME)
    host = config.get(CONF_HOST)
    username = config.get(CONF_USERNAME)
    password = config.get(CONF_PASSWORD)
    site_id = config.get(CONF_SITE_ID)
    version = config.get(CONF_UNIFI_VERSION)
    port = config.get(CONF_PORT)
    verify_ssl = config.get(CONF_VERIFY_SSL)

    try:
        ctrl = Controller(
            host,
            username,
            password,
            port,
            version,
            site_id=site_id,
            ssl_verify=verify_ssl,
        )
    except APIError as ex:
        _LOGGER.error(f"Failed to connect to Unifi Controler: {ex}")
        return False

    
    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Handle a flow initialized by the user."""
        errors = {}
        if user_input is not None:
            host = user_input[CONF_HOST]
            protocol = "https" if user_input[CONF_SSL] else "http"
            api = QNAPStats(
                host=f"{protocol}://{host}",
                port=user_input[CONF_PORT],
                username=user_input[CONF_USERNAME],
                password=user_input[CONF_PASSWORD],
                verify_ssl=user_input[CONF_VERIFY_SSL],
                timeout=DEFAULT_TIMEOUT,
            )
            try:
                stats = await self.hass.async_add_executor_job(api.get_system_stats)
            except ConnectTimeout:
                errors["base"] = "cannot_connect"
            except TypeError:
                errors["base"] = "invalid_auth"
            except Exception as error:  # pylint: disable=broad-except
                _LOGGER.error(error)
                errors["base"] = "unknown"
            else:
                unique_id = stats["system"]["serial_number"]
                await self.async_set_unique_id(unique_id)
                self._abort_if_unique_id_configured()
                title = stats["system"]["name"]
                return self.async_create_entry(title=title, data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(DATA_SCHEMA, user_input),
            errors=errors,
        )
