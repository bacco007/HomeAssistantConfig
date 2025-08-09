import voluptuous as vol
from typing import Any

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    TextSelector,
    TextSelectorConfig,
    BooleanSelector,
    BooleanSelectorConfig,
)

from .const import (
    DOMAIN,
    CONF_ENTITY_ID,
    CONF_IGNORE_UNAVAILABLE,
    CONF_IGNORE_UNKNOWN,
)

class PreviousStateTrackerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    def __init__(self):
        self.data: dict[str, Any] = {}

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry) -> config_entries.OptionsFlow:
        return PreviousStateTrackerOptionsFlow(config_entry)

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> config_entries.FlowResult:
        if user_input is not None:
            # ---- DE NIEUWE CONTROLE ----
            await self.async_set_unique_id(user_input[CONF_ENTITY_ID])
            self._abort_if_unique_id_configured()
            # --------------------------

            self.data[CONF_ENTITY_ID] = user_input[CONF_ENTITY_ID]
            return await self.async_step_options()

        schema = vol.Schema({
            vol.Required(CONF_ENTITY_ID): EntitySelector(EntitySelectorConfig()),
        })
        return self.async_show_form(step_id="user", data_schema=schema)

    async def async_step_options(self, user_input: dict[str, Any] | None = None) -> config_entries.FlowResult:
        if user_input is None:
            entity_registry = er.async_get(self.hass)
            original_entity_id = self.data[CONF_ENTITY_ID]
            entity = entity_registry.async_get(original_entity_id)
            
            base_name = ""
            if entity and entity.name:
                base_name = entity.name
            else:
                state = self.hass.states.get(original_entity_id)
                if state and state.attributes.get("friendly_name"):
                    base_name = state.attributes.get("friendly_name")
                else:
                    base_name = original_entity_id.split('.')[-1].replace('_', ' ').title()

            suggested_name = f"{base_name} Vorige Status"

            options_schema = vol.Schema({
                vol.Required("name", default=suggested_name): TextSelector(TextSelectorConfig()),
                vol.Required(CONF_IGNORE_UNKNOWN, default=True): BooleanSelector(BooleanSelectorConfig()),
                vol.Required(CONF_IGNORE_UNAVAILABLE, default=True): BooleanSelector(BooleanSelectorConfig()),
            })
            return self.async_show_form(step_id="options", data_schema=options_schema)

        final_data = {CONF_ENTITY_ID: self.data[CONF_ENTITY_ID], **user_input}
        
        entity_registry = er.async_get(self.hass)
        entity_entry = entity_registry.async_get(final_data[CONF_ENTITY_ID])
        if entity_entry:
            final_data["device_id"] = entity_entry.device_id

        return self.async_create_entry(title=final_data["name"], data=final_data)


class PreviousStateTrackerOptionsFlow(config_entries.OptionsFlow):
    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self.config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> config_entries.FlowResult:
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current_ignore_unknown = self.config_entry.options.get(CONF_IGNORE_UNKNOWN, True)
        current_ignore_unavailable = self.config_entry.options.get(CONF_IGNORE_UNAVAILABLE, True)

        schema = vol.Schema({
            vol.Required(CONF_IGNORE_UNKNOWN, default=current_ignore_unknown): BooleanSelector(BooleanSelectorConfig()),
            vol.Required(CONF_IGNORE_UNAVAILABLE, default=current_ignore_unavailable): BooleanSelector(BooleanSelectorConfig()),
        })

        return self.async_show_form(step_id="init", data_schema=schema)
