""" Config flow """
from collections import OrderedDict
from homeassistant.core import callback
import voluptuous as vol
from homeassistant import config_entries
from datetime import datetime
import uuid

from .const import (
    DOMAIN,
    DEFAULT_ICON_NORMAL,
    DEFAULT_ICON_SOON,
    DEFAULT_ICON_TODAY,
    DEFAULT_SOON,
    DEFAULT_HALF_ANNIVERSARY,
    DEFAULT_UNIT_OF_MEASUREMENT,
    DEFAULT_ONE_TIME,
    DEFAULT_CATEGORY,
    CONF_ICON_NORMAL,
    CONF_ICON_TODAY,
    CONF_ICON_SOON,
    CONF_DATE,
    CONF_SOON,
    CONF_HALF_ANNIVERSARY,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_ONE_TIME,
    CONF_CATEGORY,
    CATEGORY_OPTIONS,
    CONF_UPCOMING_ANNIVERSARIES_SENSOR,
    CONF_EMOJI,
    DEFAULT_EMOJI,
    CATEGORY_EMOJIS,
    EMOJI_OPTIONS,
)

from homeassistant.const import CONF_NAME


from homeassistant.helpers import selector

@config_entries.HANDLERS.register(DOMAIN)
class AnniversariesFlowHandler(config_entries.ConfigFlow):
    """Handle a config flow for Anniversaries."""

    VERSION = 1
    
    def get_default_emoji_for_category(self, category):
        """Get the default emoji for a given category."""
        return CATEGORY_EMOJIS.get(category, DEFAULT_EMOJI)

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        if user_input is not None:
            try:
                # Prevent leading anniversary_ prefix in name to avoid double prefix
                raw_name = user_input[CONF_NAME].strip()
                if raw_name.lower().startswith("anniversary_"):
                    errors[CONF_NAME] = "no_prefix"
                    raise ValueError("name has forbidden prefix")

                # Validate date
                if is_not_date(user_input[CONF_DATE], user_input.get(CONF_ONE_TIME, False)):
                    errors[CONF_DATE] = "invalid"
                    raise ValueError("Invalid date")

                # Set a unique ID for the entry
                await self.async_set_unique_id(str(uuid.uuid4()))
                self._abort_if_unique_id_configured()

                return self.async_create_entry(title=user_input[CONF_NAME], data=user_input)
            except ValueError:
                if "base" not in errors and not errors:
                    errors["base"] = "invalid"
            except Exception:
                errors["base"] = "invalid"

        data_schema = vol.Schema(
            {
                vol.Required(CONF_NAME): str,
                vol.Required(CONF_DATE): str,
                vol.Optional(CONF_CATEGORY, default=DEFAULT_CATEGORY): vol.In(CATEGORY_OPTIONS),
                vol.Optional(CONF_EMOJI, default=self.get_default_emoji_for_category(DEFAULT_CATEGORY)): vol.In(EMOJI_OPTIONS),
                vol.Optional(CONF_ONE_TIME, default=DEFAULT_ONE_TIME): bool,
                vol.Optional(CONF_HALF_ANNIVERSARY, default=DEFAULT_HALF_ANNIVERSARY): bool,
                vol.Optional(CONF_UNIT_OF_MEASUREMENT, default=DEFAULT_UNIT_OF_MEASUREMENT): str,
                vol.Optional(CONF_ICON_NORMAL, default=DEFAULT_ICON_NORMAL): selector.IconSelector(),
                vol.Optional(CONF_ICON_TODAY, default=DEFAULT_ICON_TODAY): selector.IconSelector(),
                vol.Optional(CONF_SOON, default=DEFAULT_SOON): int,
                vol.Optional(CONF_ICON_SOON, default=DEFAULT_ICON_SOON): selector.IconSelector(),
            }
        )
        return self.async_show_form(step_id="user", data_schema=data_schema, errors=errors)

    async def async_step_import(self, user_input):
        """Import a config entry from configuration.yaml."""
        name = user_input[CONF_NAME]
        unique_id = f"yaml_{name.lower().replace(' ', '_')}"

        await self.async_set_unique_id(unique_id)
        self._abort_if_unique_id_configured()

        return self.async_create_entry(
            title=f"{name} (YAML)",
            data=user_input,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return OptionsFlowHandler(config_entry)

def is_not_date(date, one_time):
    try:
        datetime.strptime(date, "%Y-%m-%d")
        return False
    except ValueError:
        if not one_time:
            pass
        else:
            return True
    try:
        datetime.strptime(date, "%m-%d")
        return False
    except ValueError:
        return True


class OptionsFlowHandler(config_entries.OptionsFlow):
    """Handle an options flow for Anniversaries."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self._config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        errors = {}
        if user_input is not None:
            # Validate date if it was provided
            if CONF_DATE in user_input and user_input[CONF_DATE]:
                if is_not_date(user_input[CONF_DATE], user_input.get(CONF_ONE_TIME, False)):
                    errors[CONF_DATE] = "invalid"
            
            if not errors:
                return self.async_create_entry(title="", data=user_input)

        # Properly merge data and options to get current values
        current_config = {**self._config_entry.data}
        if self._config_entry.options:
            current_config.update(self._config_entry.options)

        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_DATE,
                    default=current_config.get(CONF_DATE, ""),
                ): str,
                vol.Optional(
                    CONF_UPCOMING_ANNIVERSARIES_SENSOR,
                    default=current_config.get(CONF_UPCOMING_ANNIVERSARIES_SENSOR, False),
                ): bool,
                vol.Optional(
                    CONF_CATEGORY,
                    default=current_config.get(CONF_CATEGORY, DEFAULT_CATEGORY),
                ): vol.In(CATEGORY_OPTIONS),
                vol.Optional(
                    CONF_EMOJI,
                    default=current_config.get(CONF_EMOJI, CATEGORY_EMOJIS.get(current_config.get(CONF_CATEGORY, DEFAULT_CATEGORY), DEFAULT_EMOJI)),
                ): vol.In(EMOJI_OPTIONS),
                vol.Optional(
                    CONF_ONE_TIME,
                    default=current_config.get(CONF_ONE_TIME, DEFAULT_ONE_TIME),
                ): bool,
                vol.Optional(
                    CONF_HALF_ANNIVERSARY,
                    default=current_config.get(CONF_HALF_ANNIVERSARY, DEFAULT_HALF_ANNIVERSARY),
                ): bool,
                vol.Optional(
                    CONF_UNIT_OF_MEASUREMENT,
                    default=current_config.get(CONF_UNIT_OF_MEASUREMENT, DEFAULT_UNIT_OF_MEASUREMENT),
                ): str,
                vol.Optional(
                    CONF_ICON_NORMAL,
                    default=current_config.get(CONF_ICON_NORMAL, DEFAULT_ICON_NORMAL),
                ): selector.IconSelector(),
                vol.Optional(
                    CONF_ICON_TODAY,
                    default=current_config.get(CONF_ICON_TODAY, DEFAULT_ICON_TODAY),
                ): selector.IconSelector(),
                vol.Optional(
                    CONF_SOON,
                    default=current_config.get(CONF_SOON, DEFAULT_SOON),
                ): int,
                vol.Optional(
                    CONF_ICON_SOON,
                    default=current_config.get(CONF_ICON_SOON, DEFAULT_ICON_SOON),
                ): selector.IconSelector(),
            }
        )
        return self.async_show_form(step_id="init", data_schema=data_schema, errors=errors)
