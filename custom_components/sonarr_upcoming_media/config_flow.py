from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow
from homeassistant.const import (
    CONF_API_KEY, 
    CONF_NAME, 
    CONF_HOST, 
    CONF_PORT, 
    CONF_SSL
    )

from .const import (
    DOMAIN, 
    CONF_DAYS,
    CONF_URLBASE,
    CONF_MAX,
    )
from .helpers import setup_client
from .sonarr_api import (
    FailedToLogin,
    SonarrCannotBeReached
)

def valid_max():
    return lambda x: type(x) == int and x > 0

SONARR_SCHEMA = vol.Schema({
    vol.Optional(CONF_NAME, default=''): vol.All(str),
    vol.Optional(CONF_HOST, default='localhost'): vol.All(str),
    vol.Optional(CONF_PORT, default=8989): vol.All(vol.Coerce(int), vol.Range(min=0)),
    vol.Optional(CONF_URLBASE, default=''): vol.All(str),
    vol.Required(CONF_API_KEY): vol.All(str),
    vol.Optional(CONF_SSL, default=False): vol.All(bool),
    vol.Required(CONF_DAYS, default=7): vol.All(vol.Coerce(int), vol.Range(min=1, max=31)),
    vol.Required(CONF_MAX, default=5): vol.All(vol.Coerce(int), vol.Range(min=0)),
})


class SonarrConfigFlow(ConfigFlow, domain=DOMAIN):
    """Config flow for the Sonarr integration."""
    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ):
        errors = {}

        if user_input is not None:
            self._async_abort_entries_match({CONF_API_KEY: user_input[CONF_API_KEY]})
            try:
                await self.hass.async_add_executor_job(
                    setup_client,
                    self.hass,
                    user_input[CONF_API_KEY],
                    user_input[CONF_DAYS],
                    user_input[CONF_HOST],
                    user_input[CONF_PORT],
                    user_input[CONF_SSL],
                    user_input[CONF_URLBASE],
                    user_input[CONF_MAX],
                )
            except FailedToLogin as err:
                errors = {'base': 'failed_to_login'}
            except SonarrCannotBeReached as err:
                errors = {'base': 'cannot_be_reached'}
            else:
                return self.async_create_entry(title=user_input[CONF_NAME], data=user_input)

        schema = self.add_suggested_values_to_schema(SONARR_SCHEMA, user_input)
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)