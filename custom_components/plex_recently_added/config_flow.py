from typing import Any

import voluptuous as vol

from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    ConstantSelector,
    ConstantSelectorConfig
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import callback
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
    DEFAULT_NAME,
    CONF_MAX,
    CONF_SECTION_TYPES,
    ALL_SECTION_TYPES,
    CONF_SECTION_LIBRARIES,
    CONF_EXCLUDE_KEYWORDS,
    CONF_SECTION_LIBRARIES_LABEL,
    CONF_EXCLUDE_KEYWORDS_LABEL,
    CONF_ON_DECK,
    CONF_VERIFY_SSL
    )

from .helpers import setup_client
from .plex_api import (
    FailedToLogin,
)
from .options_flow import PlexOptionFlow

PLEX_SCHEMA = vol.Schema({
    vol.Optional(CONF_NAME, default=''): vol.All(str),
    vol.Required(CONF_HOST, default='localhost'): vol.All(str),
    vol.Required(CONF_PORT, default=32400): vol.All(vol.Coerce(int), vol.Range(min=0)),
    vol.Required(CONF_API_KEY): vol.All(str),
    vol.Optional(CONF_SSL, default=False): vol.All(bool),
    vol.Optional(CONF_VERIFY_SSL, default=True): vol.All(bool),
    vol.Optional(CONF_MAX, default=5): vol.All(vol.Coerce(int), vol.Range(min=0)),
    vol.Optional(CONF_ON_DECK, default=False): vol.All(bool),
    vol.Optional(CONF_SECTION_TYPES, default={"movie", "show"}): SelectSelector(SelectSelectorConfig(options=ALL_SECTION_TYPES, mode=SelectSelectorMode.DROPDOWN ,multiple=True)),
    vol.Optional(CONF_SECTION_LIBRARIES + "_label"): ConstantSelector(ConstantSelectorConfig(value=CONF_SECTION_LIBRARIES_LABEL)),
    vol.Optional(CONF_SECTION_LIBRARIES): TextSelector(TextSelectorConfig(multiple=True, multiline=False)),
    vol.Optional(CONF_EXCLUDE_KEYWORDS + "_label"): ConstantSelector(ConstantSelectorConfig(value=CONF_EXCLUDE_KEYWORDS_LABEL)),
    vol.Optional(CONF_EXCLUDE_KEYWORDS): TextSelector(TextSelectorConfig(multiple=True, multiline=False)),
})

class PlexConfigFlow(ConfigFlow, domain=DOMAIN):
    """Config flow for the Plex integration."""
    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> PlexOptionFlow:
        return PlexOptionFlow(config_entry)

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ):
        errors = {}

        if user_input is not None:
            self._async_abort_entries_match({CONF_API_KEY: user_input[CONF_API_KEY]})
            try:
                await setup_client(
                    self.hass,
                    user_input[CONF_NAME],
                    user_input[CONF_SSL],
                    user_input[CONF_API_KEY],
                    user_input[CONF_MAX],
                    user_input[CONF_ON_DECK],
                    user_input[CONF_HOST],
                    user_input[CONF_PORT],
                    user_input.get(CONF_SECTION_TYPES, []),
                    user_input.get(CONF_SECTION_LIBRARIES, []),
                    user_input.get(CONF_EXCLUDE_KEYWORDS, []),
                    user_input[CONF_VERIFY_SSL],
                )
            except FailedToLogin as err:
                errors = {'base': 'failed_to_login'}
            else:
                return self.async_create_entry(title=user_input[CONF_NAME] if len(user_input[CONF_NAME]) > 0 else DEFAULT_NAME, data=user_input)

        schema = self.add_suggested_values_to_schema(PLEX_SCHEMA, user_input)
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)