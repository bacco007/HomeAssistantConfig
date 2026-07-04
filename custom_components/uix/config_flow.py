from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.selector import (
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    ObjectSelector,
)

from .checks import (
    check_card_mod_frontend_script_extra_module, 
    check_card_mod_frontend_script_resource
)
from .const import (
    DOMAIN, 
    NAME, 
    CARD_MOD_FRONTEND_SCRIPT_URL,
    CONF_FOUNDRIES,
    CONF_FOUNDRY_FILES,
    CONF_HASS_THROTTLE_ENABLE,
    CONF_HASS_THROTTLE_MS,
    DEFAULT_HASS_THROTTLE_MS,
    CONF_DIALOG_APPLY_AFTER_SHOW,
    CONF_DISABLE_HASH_TEMPLATE_VARIABLE,
    EVENT_FOUNDRIES_UPDATED,
)
from .helpers import validate_foundry_file

class UixConfigFlow(ConfigFlow, domain=DOMAIN):

    VERSION = 1

    def __init__(self) -> None:
        """Initialize the config flow."""

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        
        if self.hass.data.get(DOMAIN):
            return self.async_abort(reason="single_instance_allowed")
        
        if await check_card_mod_frontend_script_resource(self.hass):
            return self.async_abort(
                reason="old_frontend_script_resource",
                description_placeholders={"resource": CARD_MOD_FRONTEND_SCRIPT_URL},
            )
        
        if await check_card_mod_frontend_script_extra_module(self.hass):
            return self.async_abort(
                reason="old_frontend_script_extra_module",
                description_placeholders={"resource": CARD_MOD_FRONTEND_SCRIPT_URL},
            )
        
        return self.async_create_entry(
            title=NAME,
            data={},
            description="refresh_message",
        )

    @staticmethod
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return UixOptionsFlow(config_entry)


class UixOptionsFlow(OptionsFlow):
    """Options flow for configuring UIX."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Initialize the options flow."""
        self._config_entry = config_entry
        self._foundries: dict[str, Any] = dict(
            config_entry.options.get(CONF_FOUNDRIES, {})
        )
        self._foundry_files: list[str] = list(
            config_entry.options.get(CONF_FOUNDRY_FILES, [])
        )
        self._foundry_name: str | None = None

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Show the top-level UIX settings menu."""
        return self.async_show_menu(
            step_id="init",
            menu_options=[
                "foundry_menu",
                "foundry_file_menu",
                "performance_settings",
            ],
            description_placeholders={
                "foundries_docs_link": "[Foundries documentation](https://uix.lf.technology/forge/foundries)",
            },
        )

    async def async_step_foundry_menu(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Show the UI foundry sub-menu with the loaded foundries list."""
        foundries_list = "\n".join(
            f"- {name}" for name in self._foundries
        ) or "_None_"
        return self.async_show_menu(
            step_id="foundry_menu",
            menu_options=[
                "add_foundry",
                "edit_foundry",
                "delete_foundry",
            ],
            description_placeholders={
                "foundries_docs_link": "[Foundries documentation](https://uix.lf.technology/forge/foundries)",
                "foundries_list": foundries_list,
            },
        )

    async def async_step_foundry_file_menu(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Show the foundry-file sub-menu with the registered files list."""
        foundry_files_list = "\n".join(
            f"- {f}" for f in self._foundry_files
        ) or "_None_"
        return self.async_show_menu(
            step_id="foundry_file_menu",
            menu_options=[
                "register_foundry_file",
                "deregister_foundry_file",
                "reload_foundry_files",
            ],
            description_placeholders={
                "foundries_docs_link": "[Foundries documentation](https://uix.lf.technology/forge/foundries)",
                "foundry_files_list": foundry_files_list,
            },
        )

    async def async_step_performance_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Configure performance settings."""
        if user_input is not None:
            return self.async_create_entry(
                title="",
                data={
                    **self._config_entry.options,
                    CONF_HASS_THROTTLE_ENABLE: user_input[CONF_HASS_THROTTLE_ENABLE],
                    CONF_HASS_THROTTLE_MS: int(user_input[CONF_HASS_THROTTLE_MS]),
                    CONF_DIALOG_APPLY_AFTER_SHOW: user_input[CONF_DIALOG_APPLY_AFTER_SHOW],
                    CONF_DISABLE_HASH_TEMPLATE_VARIABLE: user_input[CONF_DISABLE_HASH_TEMPLATE_VARIABLE],
                },
            )

        return self.async_show_form(
            step_id="performance_settings",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_HASS_THROTTLE_ENABLE,
                        default=self._config_entry.options.get(CONF_HASS_THROTTLE_ENABLE, False),
                    ): BooleanSelector(),
                    vol.Optional(
                        CONF_HASS_THROTTLE_MS,
                        default=self._config_entry.options.get(CONF_HASS_THROTTLE_MS, DEFAULT_HASS_THROTTLE_MS),
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=50,
                            max=10000,
                            step=50,
                            unit_of_measurement="ms",
                            mode=NumberSelectorMode.BOX,
                        )
                    ),
                    vol.Optional(
                        CONF_DIALOG_APPLY_AFTER_SHOW,
                        default=self._config_entry.options.get(CONF_DIALOG_APPLY_AFTER_SHOW, False),
                    ): BooleanSelector(),
                    vol.Optional(
                        CONF_DISABLE_HASH_TEMPLATE_VARIABLE,
                        default=self._config_entry.options.get(CONF_DISABLE_HASH_TEMPLATE_VARIABLE, False),
                    ): BooleanSelector(),
                }
            ),
        )

    async def async_step_add_foundry(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Add a new foundry (name + config in one form)."""
        errors: dict[str, str] = {}

        if user_input is not None:
            name = user_input["name"].strip()
            config = user_input["config"]
            if not isinstance(config, dict):
                errors["config"] = "invalid_config"
            else:
                self._foundries[name] = config
                return self.async_create_entry(
                    title="",
                    data={**self._config_entry.options, CONF_FOUNDRIES: self._foundries},
                )

        return self.async_show_form(
            step_id="add_foundry",
            data_schema=vol.Schema(
                {
                    vol.Required("name"): cv.string,
                    vol.Required("config"): ObjectSelector(),
                }
            ),
            errors=errors,
        )

    async def async_step_edit_foundry(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Step 1: select an existing foundry to edit."""
        if not self._foundries:
            return self.async_abort(reason="no_foundries")

        if user_input is not None:
            self._foundry_name = user_input["name"]
            return await self.async_step_edit_foundry_config()

        return self.async_show_form(
            step_id="edit_foundry",
            data_schema=vol.Schema(
                {
                    vol.Required("name"): vol.In(list(self._foundries.keys())),
                }
            ),
        )

    async def async_step_edit_foundry_config(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Step 2: edit the selected foundry's configuration."""
        errors: dict[str, str] = {}

        if user_input is not None:
            config = user_input["config"]
            if not isinstance(config, dict):
                errors["config"] = "invalid_config"
            else:
                self._foundries[self._foundry_name] = config
                return self.async_create_entry(
                    title="",
                    data={**self._config_entry.options, CONF_FOUNDRIES: self._foundries},
                )

        existing = self._foundries.get(self._foundry_name)
        return self.async_show_form(
            step_id="edit_foundry_config",
            data_schema=vol.Schema(
                {
                    vol.Required("config", default=existing): ObjectSelector(),
                }
            ),
            description_placeholders={"name": self._foundry_name},
            errors=errors,
        )

    async def async_step_delete_foundry(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Delete a foundry."""
        errors: dict[str, str] = {}

        if not self._foundries:
            return self.async_abort(reason="no_foundries")

        if user_input is not None:
            name = user_input["name"]
            if name in self._foundries:
                del self._foundries[name]
            return self.async_create_entry(
                title="",
                data={**self._config_entry.options, CONF_FOUNDRIES: self._foundries},
            )

        return self.async_show_form(
            step_id="delete_foundry",
            data_schema=vol.Schema(
                {
                    vol.Required("name"): vol.In(list(self._foundries.keys())),
                }
            ),
            errors=errors,
        )

    async def async_step_register_foundry_file(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Register a foundry YAML file path."""
        errors: dict[str, str] = {}

        if user_input is not None:
            file_path: str = user_input["file_path"].strip()
            if file_path in self._foundry_files:
                errors["file_path"] = "file_already_added"
            else:
                error_key = await self.hass.async_add_executor_job(
                    validate_foundry_file, self.hass, file_path
                )
                if error_key is not None:
                    errors["file_path"] = error_key
                else:
                    self._foundry_files.append(file_path)
                    return self.async_create_entry(
                        title="",
                        data={
                            **self._config_entry.options,
                            CONF_FOUNDRY_FILES: self._foundry_files,
                        },
                    )

        return self.async_show_form(
            step_id="register_foundry_file",
            data_schema=vol.Schema(
                {
                    vol.Required("file_path"): cv.string,
                }
            ),
            errors=errors,
        )

    async def async_step_deregister_foundry_file(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Deregister a foundry YAML file path."""
        if not self._foundry_files:
            return self.async_abort(reason="no_foundry_files")

        if user_input is not None:
            file_path = user_input["file_path"]
            if file_path in self._foundry_files:
                self._foundry_files.remove(file_path)
            return self.async_create_entry(
                title="",
                data={
                    **self._config_entry.options,
                    CONF_FOUNDRY_FILES: self._foundry_files,
                },
            )

        return self.async_show_form(
            step_id="deregister_foundry_file",
            data_schema=vol.Schema(
                {
                    vol.Required("file_path"): vol.In(self._foundry_files),
                }
            ),
        )

    async def async_step_reload_foundry_files(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Reload all foundry YAML files and push updates to connected clients."""
        self.hass.bus.async_fire(EVENT_FOUNDRIES_UPDATED, {})
        return self.async_create_entry(
            title="",
            data=self._config_entry.options,
        )