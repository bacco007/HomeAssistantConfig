from typing import Any
from homeassistant.config_entries import OptionsFlow, ConfigEntry, ConfigFlowResult
import voluptuous as vol

from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    ConstantSelector,
    ConstantSelectorConfig,
)

from .const import (
    DOMAIN, 
    CONF_SECTION_TYPES,
    CONF_SECTION_LIBRARIES,
    ALL_SECTION_TYPES,
    CONF_EXCLUDE_KEYWORDS,
    CONF_EXCLUDE_KEYWORDS_LABEL,
    CONF_MAX,
    CONF_ON_DECK,
    )


class PlexOptionFlow(OptionsFlow):
    def __init__(self, config_entry: ConfigEntry) -> None:
        self._config_entry = config_entry


    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors = {}

        coordinator = self.hass.data[DOMAIN][self._config_entry.entry_id]

        if user_input is not None:
            # Validate and process user input here
            updated_data = {
                **self._config_entry.data,
                CONF_MAX: user_input.get(CONF_MAX, 5),
                CONF_SECTION_TYPES: user_input.get(CONF_SECTION_TYPES, []),
                CONF_SECTION_LIBRARIES: user_input.get(CONF_SECTION_LIBRARIES, []),
                CONF_EXCLUDE_KEYWORDS: user_input.get(CONF_EXCLUDE_KEYWORDS, []),
                CONF_ON_DECK: user_input.get(CONF_ON_DECK, False),
            }
            self.hass.config_entries.async_update_entry(self._config_entry, data=updated_data, minor_version=0, version=1)

            return self.async_create_entry(title="", data=updated_data)

        PLEX_SCHEMA = vol.Schema({
            vol.Optional(CONF_MAX, default=self._config_entry.data[CONF_MAX]): vol.All(vol.Coerce(int), vol.Range(min=0)),
            vol.Optional(CONF_SECTION_TYPES, default=self._config_entry.data.get(CONF_SECTION_TYPES, [])): SelectSelector(SelectSelectorConfig(options=ALL_SECTION_TYPES ,multiple=True, mode=SelectSelectorMode.DROPDOWN)),
            vol.Optional(CONF_SECTION_LIBRARIES, default=self._config_entry.data.get(CONF_SECTION_LIBRARIES, [])): SelectSelector(SelectSelectorConfig(options=[str(item) for item in coordinator.data["libraries"]] ,multiple=True, mode=SelectSelectorMode.DROPDOWN)),
            vol.Optional(CONF_EXCLUDE_KEYWORDS + "_label"): ConstantSelector(ConstantSelectorConfig(value=CONF_EXCLUDE_KEYWORDS_LABEL)),
            vol.Optional(CONF_EXCLUDE_KEYWORDS, default=self._config_entry.data.get(CONF_EXCLUDE_KEYWORDS, [])): TextSelector(TextSelectorConfig(multiple=True, multiline=False)),
            vol.Optional(CONF_ON_DECK, default=self._config_entry.data.get(CONF_ON_DECK, False)): vol.All(bool),
        })

        # Display a form to gather user input
        return self.async_show_form(step_id="init", data_schema=PLEX_SCHEMA, errors=errors)

def keys(d) -> list:
    return [i for i in d.keys()]