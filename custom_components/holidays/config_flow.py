"""Adds config flow for GarbageCollection."""
import uuid
from collections import OrderedDict
from typing import Dict, List, Optional

import holidays
import homeassistant.helpers.config_validation as cv
import homeassistant.util.dt as dt_util
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME
from homeassistant.core import callback

from . import const, create_holidays


class HolidaysShared:
    """Store configuration for both YAML and config_flow."""

    def __init__(self, data: Dict):
        """Create class attributes and set initial values."""
        self._data = data.copy()
        self.name: Optional[str] = None
        # pylint: disable=maybe-no-member
        self._supported_countries: Dict = holidays.list_supported_countries()
        self.country_codes: List = sorted(
            [holiday for holiday in self._supported_countries]
        )
        self.errors: Dict = {}
        self.data_schema: OrderedDict = OrderedDict()
        self._defaults = {
            const.CONF_ICON_NORMAL: const.DEFAULT_ICON_NORMAL,
            const.CONF_ICON_TODAY: const.DEFAULT_ICON_TODAY,
            const.CONF_ICON_TOMORROW: const.DEFAULT_ICON_TOMORROW,
            const.CONF_OBSERVED: True,
        }

    def update_data(self, user_input: Dict) -> None:
        """Remove empty fields, and fields that should not be stored in the config."""
        self._data.update(user_input)
        for key, value in user_input.items():
            if value == "":
                del self._data[key]
        if CONF_NAME in self._data:
            self.name = self._data[CONF_NAME]
            del self._data[CONF_NAME]

    def required(self, key: str, options: Optional[Dict]) -> vol.Required:
        """Return vol.Required."""
        if isinstance(options, Dict) and key in options:
            suggested_value = options[key]
        elif key in self._data:
            suggested_value = self._data[key]
        elif key in self._defaults:
            suggested_value = self._defaults[key]
        else:
            return vol.Required(key)
        return vol.Required(key, description={"suggested_value": suggested_value})

    def optional(self, key: str, options: Optional[Dict]) -> vol.Optional:
        """Return vol.Optional."""
        if isinstance(options, Dict) and key in options:
            suggested_value = options[key]
        elif key in self._data:
            suggested_value = self._data[key]
        elif key in self._defaults:
            suggested_value = self._defaults[key]
        else:
            return vol.Optional(key)
        return vol.Optional(key, description={"suggested_value": suggested_value})

    def step1_user_init(
        self, user_input: Optional[Dict], options: bool = False
    ) -> bool:
        """User init."""
        self.errors.clear()
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
            if not self.errors:
                self.update_data(user_input)
                return True
        self.data_schema.clear()
        if not options:
            self.data_schema[self.required(CONF_NAME, user_input)] = str
        self.data_schema[self.optional(const.CONF_ICON_NORMAL, user_input)] = str
        self.data_schema[self.optional(const.CONF_ICON_TODAY, user_input)] = str
        self.data_schema[self.optional(const.CONF_ICON_TOMORROW, user_input)] = str
        self.data_schema[self.required(const.CONF_COUNTRY, user_input)] = vol.In(
            self.country_codes
        )
        self.data_schema[self.optional(const.CONF_OBSERVED, user_input)] = bool
        return False

    def step2_subdiv(self, user_input: Dict) -> bool:
        """Step 2 - Pop countries."""
        self.errors.clear()

        subdivs = self._supported_countries[self._data.get(const.CONF_COUNTRY)]
        # Skip this step if the country does not have Subdivs
        if not subdivs:
            return True
        if user_input is not None and user_input:
            self.update_data(user_input)
            return True

        self.data_schema.clear()
        self.data_schema[self.optional(const.CONF_SUBDIV, user_input)] = vol.In(subdivs)
        return False

    def step3_pop(self, user_input: Dict) -> bool:
        """Step 2 - Pop countries."""
        self.errors = {}

        if user_input is not None and user_input:
            self.update_data(user_input)
            return True
        hol = create_holidays(
            [dt_util.now().date().year],
            self._data.get(const.CONF_COUNTRY, ""),
            self._data.get(const.CONF_SUBDIV, ""),
            self._data.get(const.CONF_OBSERVED, True),
        )
        list_holidays = {h: h for h in sorted(hol.values())}
        self.data_schema.clear()
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

    async def __post_init__(self):
        """Pass Hass object to he shared class."""
        self.shared_class.hass = self.hass

    async def async_step_user(
        self, user_input: Dict = {}
    ):  # pylint: disable=dangerous-default-value
        """Step 1 - user init."""
        if self.shared_class.step1_user_init(user_input):
            return await self.async_step_subdiv(re_entry=False)
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                self.shared_class.data_schema, extra=vol.ALLOW_EXTRA
            ),
            errors=self.shared_class.errors,
        )

    async def async_step_subdiv(
        self, user_input: Dict = {}, re_entry=True
    ):  # pylint: disable=dangerous-default-value
        """Step 2 - enter country subdivision (e.g. states).

        Can be submitted without selecting any subdivision.
        In this case the user input will be blank.
        So checking if it is blank won't help, checking re_entry field
        """
        self.shared_class.step2_subdiv(user_input)
        if re_entry:
            return await self.async_step_pop(re_entry=False)
        return self.async_show_form(
            step_id="subdiv",
            data_schema=vol.Schema(
                self.shared_class.data_schema, extra=vol.ALLOW_EXTRA
            ),
            errors=self.shared_class.errors,
        )

    async def async_step_pop(
        self, user_input: Dict = {}, re_entry=True
    ):  # pylint: disable=dangerous-default-value
        """Step 3 - enter holidays to pop.

        Can be submitted without selecting any holidays to pop.
        In this case the user input will be blank.
        So checking if it is blank won't help, checking re_entry field
        """
        self.shared_class.step3_pop(user_input)
        if re_entry:
            return self.async_create_entry(
                title=self.shared_class.name, data=self.shared_class.data
            )
        return self.async_show_form(
            step_id="pop",
            data_schema=vol.Schema(
                self.shared_class.data_schema, extra=vol.ALLOW_EXTRA
            ),
            errors=self.shared_class.errors,
        )

    async def async_step_import(
        self, user_input: Dict
    ):  # pylint: disable=unused-argument
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
    def async_get_options_flow(config_entry: ConfigEntry):
        """Return options flow handler, or empty options flow if no unique_id."""
        return OptionsFlowHandler(config_entry)


class OptionsFlowHandler(config_entries.OptionsFlow):
    """Options flow handler."""

    def __init__(self, config_entry: ConfigEntry):
        """Create and initualize class variables."""
        self.shared_class = HolidaysShared(config_entry.data)

    async def async_step_init(self, user_input: Optional[Dict] = None):
        """Genral parameters."""
        if self.shared_class.step1_user_init(user_input, options=True):
            return await self.async_step_subdiv(re_entry=False)
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(self.shared_class.data_schema),
            errors=self.shared_class.errors,
        )

    async def async_step_subdiv(
        self, user_input: Dict = {}, re_entry=True
    ):  # pylint: disable=dangerous-default-value
        """Step 2 - enter country subdivision (e.g. states).

        Can be submitted without selecting any subdivision.
        In this case the user input will be blank.
        So checking if it is blank won't help, checking re_entry field
        """
        self.shared_class.step2_subdiv(user_input)
        if re_entry:
            return await self.async_step_pop(re_entry=False)
        return self.async_show_form(
            step_id="subdiv",
            data_schema=vol.Schema(self.shared_class.data_schema),
            errors=self.shared_class.errors,
        )

    async def async_step_pop(
        self, user_input: Dict = {}, re_entry=True
    ):  # pylint: disable=dangerous-default-value
        """Step 3 - enter holidays to pop.

        Can be submitted without selecting any holidays to pop.
        In this case the user input will be blank.
        So checking if it is blank won't help, checking re_entry field
        """
        self.shared_class.step3_pop(user_input)
        if re_entry:
            return self.async_create_entry(
                title=self.shared_class.name, data=self.shared_class.data
            )
        return self.async_show_form(
            step_id="pop",
            data_schema=vol.Schema(self.shared_class.data_schema),
            errors=self.shared_class.errors,
        )
