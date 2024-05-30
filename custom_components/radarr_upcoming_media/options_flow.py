from typing import Any
from homeassistant.config_entries import OptionsFlow, ConfigEntry, ConfigFlowResult
import voluptuous as vol

from .const import (
    CONF_DAYS,
    CONF_MAX,
    CONF_THEATERS,
    DOMAIN,
    )

import logging
_LOGGER = logging.getLogger(__name__)
class RadarrOptionFlow(OptionsFlow):
    def __init__(self, config_entry: ConfigEntry) -> None:
        self._config_entry = config_entry


    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors = {}

        client = self.hass.data[DOMAIN][self._config_entry.entry_id]._client

        if user_input is not None:
            # Validate and process user input here
            updated_data = {
                **self._config_entry.data,
                CONF_DAYS: user_input[CONF_DAYS],
                CONF_MAX: user_input[CONF_MAX],
                CONF_THEATERS: user_input[CONF_THEATERS]
            }
            self._config_entry.data = updated_data

            return self.async_create_entry(title="", data=updated_data)

        RADARR_SCHEMA = vol.Schema({
            vol.Required(CONF_DAYS, default=self._config_entry.data[CONF_DAYS]): vol.All(vol.Coerce(int), vol.Range(min=1)),
            vol.Required(CONF_MAX, default=self._config_entry.data[CONF_MAX]): vol.All(vol.Coerce(int), vol.Range(min=0)),
            vol.Optional(CONF_THEATERS, default=self._config_entry.data[CONF_THEATERS]): vol.All(bool),
        })

        # Display a form to gather user input
        return self.async_show_form(step_id="init", data_schema=RADARR_SCHEMA, errors=errors)

def keys(d) -> list:
    return [i for i in d.keys()]