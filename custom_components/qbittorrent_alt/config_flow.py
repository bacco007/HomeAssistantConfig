from os import path
from typing import Any, Optional

import voluptuous as vol
from aiohttp.client_exceptions import ClientConnectorError
from aioqbt.exc import LoginError
from homeassistant.config_entries import ConfigFlow
from homeassistant.const import (
    CONF_NAME,
    CONF_PASSWORD,
    CONF_URL,
    CONF_USERNAME,
    CONF_VERIFY_SSL,
)
from homeassistant.data_entry_flow import FlowResult

from .const import DEFAULT_NAME, DEFAULT_URL, DOMAIN
from .helpers import setup_client

USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_URL, default=DEFAULT_URL): str,
        vol.Required(CONF_NAME, default=DEFAULT_NAME): str,
        vol.Required(CONF_USERNAME): str,
        vol.Required(CONF_PASSWORD): str,
        vol.Optional(CONF_VERIFY_SSL, default=True): bool,
    }
)


class QbittorrentConfigFlow(ConfigFlow, domain=DOMAIN):
    async def async_step_user(
        self, user_input: Optional[dict[str, Any]] = None
    ) -> FlowResult:
        errors = {}
        if user_input is not None:
            self._async_abort_entries_match({CONF_URL: user_input[CONF_URL]})
            try:
                await setup_client(
                    path.join(user_input[CONF_URL], "api/v2"),
                    user_input[CONF_USERNAME],
                    user_input[CONF_PASSWORD],
                    user_input[CONF_VERIFY_SSL],
                )
            except LoginError:
                errors = {"base": "invalid_auth"}
            except ClientConnectorError:
                errors = {"base": "cannot_connect"}
            else:
                return self.async_create_entry(
                    title=user_input[CONF_NAME], data=user_input
                )

        schema = self.add_suggested_values_to_schema(USER_DATA_SCHEMA, user_input)
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)
