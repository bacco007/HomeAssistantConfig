"""Adds config flow for GarbageCollection."""
import uuid
from collections import OrderedDict
from typing import Dict

import homeassistant.helpers.config_validation as cv
import homeassistant.util.dt as dt_util
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.core import callback

from . import const, create_holidays


class HolidaysShared:
    """Store configuration for both YAML and config_flow."""

    def __init__(self, data):
        """Create class attributes and set initial values."""
        self._data = data.copy()
        self.name = None
        self.errors = {}
        self.data_schema = {}
        self._defaults = {
            const.CONF_ICON_NORMAL: const.DEFAULT_ICON_NORMAL,
            const.CONF_ICON_TODAY: const.DEFAULT_ICON_TODAY,
            const.CONF_ICON_TOMORROW: const.DEFAULT_ICON_TOMORROW,
            const.CONF_OBSERVED: True,
        }

    def update_data(self, user_input: Dict):
        """Remove empty fields, and fields that should not be stored in the config."""
        self._data.update(user_input)
        for key, value in user_input.items():
            if value == "":
                del self._data[key]
        if CONF_NAME in self._data:
            self.name = self._data[CONF_NAME]
            del self._data[CONF_NAME]

    def required(self, key, options):
        """Return vol.Required."""
        if isinstance(options, dict) and key in options:
            suggested_value = options[key]
        elif key in self._data:
            suggested_value = self._data[key]
        elif key in self._defaults:
            suggested_value = self._defaults[key]
        else:
            return vol.Required(key)
        return vol.Required(key, description={"suggested_value": suggested_value})

    def optional(self, key, options):
        """Return vol.Optional."""
        if isinstance(options, dict) and key in options:
            suggested_value = options[key]
        elif key in self._data:
            suggested_value = self._data[key]
        elif key in self._defaults:
            suggested_value = self._defaults[key]
        else:
            return vol.Optional(key)
        return vol.Optional(key, description={"suggested_value": suggested_value})

    def step1_user_init(self, user_input: Dict, options=None):
        """User init."""
        self.errors = {}
        if user_input is not None:
            try:
                cv.icon(
                    user_input.get(const.CONF_ICON_NORMAL, const.DEFAULT_ICON_NORMAL)
                )
                cv.icon(user_input.get(const.CONF_ICON_TODAY, const.DEFAULT_ICON_TODAY))
                cv.icon(
                    user_input.get(
                        const.CONF_ICON_TOMORROW, const.DEFAULT_ICON_TOMORROW
                    )
                )
            except vol.Invalid:
                self.errors["base"] = "icon"
            if self.errors == {}:
                self.update_data(user_input)
                return True
        self.data_schema = OrderedDict()
        if not options:
            self.data_schema[self.required(CONF_NAME, user_input)] = str
        self.data_schema[self.optional(const.CONF_ICON_NORMAL, user_input)] = str
        self.data_schema[self.optional(const.CONF_ICON_TODAY, user_input)] = str
        self.data_schema[self.optional(const.CONF_ICON_TOMORROW, user_input)] = str
        self.data_schema[self.required(const.CONF_COUNTRY, user_input)] = vol.In(
            const.COUNTRY_CODES
        )
        self.data_schema[self.optional(const.CONF_PROV, user_input)] = str
        self.data_schema[self.optional(const.CONF_STATE, user_input)] = str
        self.data_schema[self.optional(const.CONF_OBSERVED, user_input)] = bool
        return False

    def step2_detail(self, user_input: Dict):
        """Step 2 - Pop countries."""
        self.errors = {}
        self.data_schema = {}

        if user_input is not None and user_input != {}:
            self.update_data(user_input)
            return True
        hol = create_holidays(
            [dt_util.now().date().year],
            self._data.get(const.CONF_COUNTRY, ""),
            self._data.get(const.CONF_STATE, ""),
            self._data.get(const.CONF_PROV, ""),
            self._data.get(const.CONF_OBSERVED, True),
        )
        list_holidays = [h for h in sorted(hol.values())]
        self.data_schema = OrderedDict()
        self.data_schema[
            self.optional(const.CONF_HOLIDAY_POP_NAMED, user_input)
        ] = cv.multi_select(list_holidays)
        return False

    @property
    def data(self):
        """Return whole data store."""
        return self._data


@config_entries.HANDLERS.register(const.DOMAIN)
class HolidaysFlowHandler(config_entries.ConfigFlow):
    """Config flow for holidays."""

    VERSION = const.VERSION
    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_POLL

    def __init__(self):
        """Initialize."""
        self.shared_class = HolidaysShared({"unique_id": str(uuid.uuid4())})

    async def async_step_user(
        self, user_input={}
    ):  # pylint: disable=dangerous-default-value
        """Step 1 - user init."""
        if self.shared_class.step1_user_init(user_input):
            return await self.async_step_detail(re_entry=False)
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                self.shared_class.data_schema, extra=vol.ALLOW_EXTRA
            ),
            errors=self.shared_class.errors,
        )

    async def async_step_detail(
        self, user_input={}, re_entry=True
    ):  # pylint: disable=dangerous-default-value
        """Step 2 - enter countries to pop."""
        self.shared_class.hass = self.hass
        self.shared_class.step2_detail(user_input)
        if re_entry:
            return self.async_create_entry(
                title=self.shared_class.name, data=self.shared_class.data
            )
        return self.async_show_form(
            step_id="detail",
            data_schema=vol.Schema(
                self.shared_class.data_schema, extra=vol.ALLOW_EXTRA
            ),
            errors=self.shared_class.errors,
        )

    async def async_step_import(self, user_input):  # pylint: disable=unused-argument
        """Import a config entry.

        Special type of import, we're not actually going to store any data.
        Instead, we're going to rely on the values that are in config file.
        """
        self.shared_class.update_data(user_input)
        return self.async_create_entry(
            title=self.shared_class.name, data=self.shared_class.data
        )

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
        self.shared_class = HolidaysShared(config_entry.data)

    async def async_step_init(self, user_input=None):
        """Genral parameters."""
        if self.shared_class.step1_user_init(user_input, options=True):
            return await self.async_step_detail(re_entry=False)
        else:
            return self.async_show_form(
                step_id="init",
                data_schema=vol.Schema(self.shared_class.data_schema),
                errors=self.shared_class.errors,
            )

    async def async_step_detail(
        self, user_input={}, re_entry=True
    ):  # pylint: disable=dangerous-default-value
        """Step 2 - enter detail depending on frequency."""
        self.shared_class.step2_detail(user_input)
        if re_entry:
            return self.async_create_entry(
                title=self.shared_class.name, data=self.shared_class.data
            )
        return self.async_show_form(
            step_id="detail",
            data_schema=vol.Schema(self.shared_class.data_schema),
            errors=self.shared_class.errors,
        )


class EmptyOptions(config_entries.OptionsFlow):
    """A class for default options. Not sure why this is required."""

    def __init__(self, config_entry):
        """Just set the config_entry parameter."""
        self.config_entry = config_entry
