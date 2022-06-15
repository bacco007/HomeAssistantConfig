"""Config flow for Jellyfin."""
import asyncio
import logging
import uuid

import voluptuous as vol

from homeassistant import config_entries, exceptions
from homeassistant.core import callback
from homeassistant.const import ( # pylint: disable=import-error
    CONF_URL,
    CONF_VERIFY_SSL,
    CONF_USERNAME,
    CONF_PASSWORD,
    CONF_CLIENT_ID,
)

from .const import (
    DOMAIN,
    DEFAULT_SSL,
    DEFAULT_VERIFY_SSL,
    CONF_GENERATE_UPCOMING,
    CONF_GENERATE_YAMC,
)
_LOGGER = logging.getLogger(__name__)

RESULT_CONN_ERROR = "cannot_connect"
RESULT_LOG_MESSAGE = {RESULT_CONN_ERROR: "Connection error"}


@config_entries.HANDLERS.register(DOMAIN)
class JellyfinFlowHandler(config_entries.ConfigFlow):
    """Config flow for Jellyfin component."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_PUSH

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Jellyfin options callback."""
        return JellyfinOptionsFlowHandler(config_entry)

    def __init__(self):
        """Init JellyfinFlowHandler."""
        self._errors = {}
        self._url = None
        self._ssl = DEFAULT_SSL
        self._verify_ssl = DEFAULT_VERIFY_SSL

    async def async_step_import(self, user_input=None):
        """Handle configuration by yaml file."""
        self._is_import = True
        return await self.async_step_user(user_input)

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""

        self._errors = {}

        data_schema = {
            vol.Required(CONF_URL): str,
            vol.Required(CONF_USERNAME): str,
            vol.Optional(CONF_PASSWORD, default=""): str,
            vol.Optional(CONF_VERIFY_SSL, default=DEFAULT_VERIFY_SSL): bool,
            vol.Optional(CONF_GENERATE_UPCOMING, default=False): bool,
            vol.Optional(CONF_GENERATE_YAMC, default=False): bool,
        }

        if user_input is not None:
            self._url = str(user_input[CONF_URL])
            self._username = user_input[CONF_USERNAME]
            self._password = user_input[CONF_PASSWORD]
            self._verify_ssl = user_input[CONF_VERIFY_SSL]
            self._generate_upcoming = user_input[CONF_GENERATE_UPCOMING]
            self._generate_yamc = user_input[CONF_GENERATE_YAMC]

            try:
                await self.async_set_unique_id(DOMAIN)
                self._abort_if_unique_id_configured()

                return self.async_create_entry(
                    title=DOMAIN,
                    data={
                        CONF_URL: self._url,
                        CONF_USERNAME: self._username,
                        CONF_PASSWORD: self._password,
                        CONF_VERIFY_SSL: self._verify_ssl,
                        CONF_CLIENT_ID: str(uuid.uuid4()),
                        CONF_GENERATE_UPCOMING: self._generate_upcoming,
                        CONF_GENERATE_YAMC: self._generate_yamc,
                    },
                )

            except (asyncio.TimeoutError, CannotConnect):
                result = RESULT_CONN_ERROR

            if self._is_import:
                _LOGGER.error(
                    "Error importing from configuration.yaml: %s",
                    RESULT_LOG_MESSAGE.get(result, "Generic Error"),
                )
                return self.async_abort(reason=result)

            self._errors["base"] = result

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(data_schema),
            errors=self._errors,
        )


class JellyfinOptionsFlowHandler(config_entries.OptionsFlow):
    """Option flow for Jellyfin component."""

    def __init__(self, config_entry):
        """Init JellyfinOptionsFlowHandler."""
        self._errors = {}
        self._url = config_entry.data[CONF_URL] if CONF_URL in config_entry.data else None
        self._username = config_entry.data[CONF_USERNAME] if CONF_USERNAME in config_entry.data else None
        self._password = config_entry.data[CONF_PASSWORD] if CONF_PASSWORD in config_entry.data else None
        self._verify_ssl = config_entry.data[CONF_VERIFY_SSL] if CONF_VERIFY_SSL in config_entry.data else DEFAULT_VERIFY_SSL
        self._generate_upcoming = config_entry.data[CONF_GENERATE_UPCOMING] if CONF_GENERATE_UPCOMING in config_entry.data else False
        self._generate_yamc = config_entry.data[CONF_GENERATE_YAMC] if CONF_GENERATE_YAMC in config_entry.data else False

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        return await self.async_step_user()

    async def async_step_user(self, user_input=None):
        self._errors = {}

        if user_input is not None:
            self._url = str(user_input[CONF_URL])
            self._username = user_input[CONF_USERNAME]
            self._password = user_input[CONF_PASSWORD]
            self._verify_ssl = user_input[CONF_VERIFY_SSL]
            self._generate_upcoming = user_input[CONF_GENERATE_UPCOMING]
            self._generate_yamc = user_input[CONF_GENERATE_YAMC]

        data_schema = {
            vol.Required(CONF_URL, default=self._url): str,
            vol.Required(CONF_USERNAME, default=self._username): str,
            vol.Required(CONF_PASSWORD, default=self._password): str,
            vol.Optional(CONF_VERIFY_SSL, default=self._verify_ssl): bool,
            vol.Optional(CONF_GENERATE_UPCOMING, default=self._generate_upcoming): bool,
            vol.Optional(CONF_GENERATE_YAMC, default=self._generate_yamc): bool,
        }

        if user_input is not None:
            try:
                return self.async_create_entry(
                    title=DOMAIN,
                    data={
                        CONF_URL: self._url,
                        CONF_USERNAME: self._username,
                        CONF_PASSWORD: self._password,
                        CONF_VERIFY_SSL: self._verify_ssl,
                        CONF_GENERATE_UPCOMING: self._generate_upcoming,
                        CONF_GENERATE_YAMC: self._generate_yamc,
                    },
                )

            except (asyncio.TimeoutError, CannotConnect):
                _LOGGER.error("cannot connect")
                result = RESULT_CONN_ERROR

            self._errors["base"] = result

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(data_schema),
            errors=self._errors,
        )

class CannotConnect(exceptions.HomeAssistantError):
    """Error to indicate we can not connect."""
