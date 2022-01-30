"""Adds config flow for GarbageCollection."""
import logging
import uuid
from typing import Dict

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.core import callback

from . import config_definition
from .const import (
    CONF_HOLIDAY_POP_NAMED,
    CONF_ICON_NORMAL,
    CONF_ICON_TODAY,
    CONF_ICON_TOMORROW,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


class holidays_shared:
    """Store configuration for both YAML and config_flow."""

    def __init__(self, unique_id):
        """Create class attributes and set initial values."""
        self._data = {}
        self._data["unique_id"] = unique_id
        self.name = None
        self.errors = {}
        self.data_schema = {}

    def update_data(self, user_input: Dict, step: int):
        """Remove empty fields, and fields that should not be stored in the config."""
        self._data.update(user_input)
        items = {
            key: value
            for (key, value) in config_definition.options.items()
            if ("step" in value and value["step"] == step)
        }
        for key, value in items.items():
            if key in self._data and (key not in user_input or user_input[key] == ""):
                del self._data[key]
        if CONF_NAME in self._data:
            self.name = self._data[CONF_NAME]
            del self._data[CONF_NAME]

    def step1_user_init(self, user_input: Dict, defaults=None):
        """User init."""
        self.errors = {}
        if user_input is not None:
            validation = config_definition.compile_schema(step=1)
            # Name is not used in OptionsFlow
            if defaults is not None and CONF_NAME in validation:
                del validation[CONF_NAME]
            if CONF_HOLIDAY_POP_NAMED in user_input:
                user_input[CONF_HOLIDAY_POP_NAMED] = string_to_list(
                    user_input[CONF_HOLIDAY_POP_NAMED]
                )
            try:
                _ = vol.Schema(validation)(user_input)
            except vol.Invalid as exception:
                error = str(exception)
                if (
                    CONF_ICON_NORMAL in error
                    or CONF_ICON_TODAY in error
                    or CONF_ICON_TOMORROW in error
                ):
                    self.errors["base"] = "icon"
                else:
                    _LOGGER.error(f"Unknown exception: {exception}")
                    self.errors["base"] = "value"
                config_definition.set_defaults(1, user_input)
            if self.errors == {}:
                # Valid input - go to the next step!
                self.update_data(user_input, 1)
                return True
        elif defaults is not None:
            config_definition.reset_defaults()
            config_definition.set_defaults(1, defaults)
            config_definition.join_list(CONF_HOLIDAY_POP_NAMED)
        self.data_schema = config_definition.compile_config_flow(step=1)
        # Do not show name for Options_Flow. The name cannot be changed here
        if defaults is not None and CONF_NAME in self.data_schema:
            del self.data_schema[CONF_NAME]
        return False

    @property
    def data(self):
        """Return whole data store."""
        return self._data


@config_entries.HANDLERS.register(DOMAIN)
class HolidaysFlowHandler(config_entries.ConfigFlow):
    """Config flow for holidays."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_POLL

    def __init__(self):
        """Initialize."""
        config_definition.reset_defaults()
        self.shared_class = holidays_shared(str(uuid.uuid4()))

    async def async_step_user(
        self, user_input={}
    ):  # pylint: disable=dangerous-default-value
        """Step 1 - user init."""
        if self.shared_class.step1_user_init(user_input):
            return self.async_create_entry(
                title=self.shared_class.name, data=self.shared_class.data
            )
        else:
            return self.async_show_form(
                step_id="user",
                data_schema=vol.Schema(self.shared_class.data_schema),
                errors=self.shared_class.errors,
            )

    async def async_step_import(self, user_input):  # pylint: disable=unused-argument
        """Import a config entry.

        Special type of import, we're not actually going to store any data.
        Instead, we're going to rely on the values that are in config file.
        """
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        return self.async_create_entry(title="configuration.yaml", data={})

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Return options flow handler, or empty options flow if no unique_id."""
        if config_entry.data.get("unique_id", None) is not None:
            return OptionsFlowHandler(config_entry)
        else:
            return EmptyOptions(config_entry)


"""


O P T I O N S   F L O W


"""


class OptionsFlowHandler(config_entries.OptionsFlow):
    """Options flow handler."""

    def __init__(self, config_entry):
        """Create and initualize class variables."""
        self.config_entry = config_entry
        self.shared_class = holidays_shared(config_entry.data.get("unique_id"))

    async def async_step_init(self, user_input=None):
        """Genral parameters."""
        if self.shared_class.step1_user_init(user_input, self.config_entry.data):
            return self.async_create_entry(title="", data=self.shared_class.data)
        else:
            return self.async_show_form(
                step_id="init",
                data_schema=vol.Schema(self.shared_class.data_schema),
                errors=self.shared_class.errors,
            )


class EmptyOptions(config_entries.OptionsFlow):
    """A class for default options. Not sure why this is required."""

    def __init__(self, config_entry):
        """Just set the config_entry parameter."""
        self.config_entry = config_entry


def string_to_list(string) -> list:
    """Convert comma separated text to list."""
    if string is None or string == "":
        return []
    return list(map(lambda x: x.strip("'\" "), string.split(",")))
