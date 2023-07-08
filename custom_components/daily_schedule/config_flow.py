"""Config flow for daily schedule integration."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlow
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector
import homeassistant.helpers.config_validation as cv

from .const import CONF_FROM, CONF_SCHEDULE, CONF_TO, CONF_UTC, DOMAIN
from .schedule import Schedule

ADD_RANGE = "add_range"
RANGE_DELIMITER = " - "

CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME): selector.TextSelector(),
        vol.Required(ADD_RANGE, default=True): selector.BooleanSelector(),
        vol.Required(CONF_UTC, default=False): selector.BooleanSelector(),
    }
)
CONFIG_RANGE = vol.Schema(
    {
        vol.Required(CONF_FROM, default="00:00:00"): selector.TimeSelector(),
        vol.Required(CONF_TO, default="00:00:00"): selector.TimeSelector(),
        vol.Required(ADD_RANGE, default=False): selector.BooleanSelector(),
    }
)
OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Required(ADD_RANGE, default=False): cv.boolean,
        vol.Required(CONF_FROM, default="00:00:00"): selector.TimeSelector(),
        vol.Required(CONF_TO, default="00:00:00"): selector.TimeSelector(),
    }
)


class DailyScheduleConfigFlow(ConfigFlow, domain=DOMAIN):
    """Config flow."""

    def __init__(self):
        """Initialize a new flow."""
        self.options: dict[str, Any] = {CONF_SCHEDULE: []}

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle a flow initialized by the user."""
        errors: dict[str, str] = {}

        if user_input is not None:

            # Verify uniqueness of the name (used as the key).
            duplicated = filter(
                lambda entry: entry.title == user_input[CONF_NAME],
                self.hass.config_entries.async_entries(DOMAIN),
            )
            if list(duplicated):
                errors["base"] = "duplicated"

            if not errors:

                if user_input[ADD_RANGE]:
                    self.options[CONF_NAME] = user_input[CONF_NAME]
                    self.options[CONF_UTC] = user_input[CONF_UTC]
                    return await self.async_step_time_range()

                return self.async_create_entry(
                    title=user_input[CONF_NAME],
                    data={},
                    options={CONF_SCHEDULE: [], CONF_UTC: user_input[CONF_UTC]},
                )

        return self.async_show_form(
            step_id="user", data_schema=CONFIG_SCHEMA, errors=errors
        )

    async def async_step_time_range(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle adding a time range."""
        errors: dict[str, str] = {}

        if user_input is not None:

            # Validate the new schedule.
            time_ranges = self.options[CONF_SCHEDULE].copy()
            time_ranges.append(
                {CONF_FROM: user_input[CONF_FROM], CONF_TO: user_input[CONF_TO]}
            )
            try:
                schedule = Schedule(time_ranges)
            except ValueError as err:
                errors["base"] = "overlap" if "overlap" in str(err) else "length"

            if not errors:
                self.options[CONF_SCHEDULE] = schedule.to_list()

                if user_input[ADD_RANGE]:
                    return await self.async_step_time_range()

                return self.async_create_entry(
                    title=self.options[CONF_NAME],
                    data={},
                    options={
                        CONF_SCHEDULE: self.options[CONF_SCHEDULE],
                        CONF_UTC: self.options[CONF_UTC]
                    },
                )

        return self.async_show_form(
            step_id="time_range", data_schema=CONFIG_RANGE, errors=errors
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlowHandler:
        """Get the options flow for this handler."""
        return OptionsFlowHandler(config_entry)


class OptionsFlowHandler(OptionsFlow):
    """Handles options flow for the component."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any]) -> FlowResult:
        """Handle an options flow."""
        errors: dict[str, str] = {}

        if user_input is not None:

            # Get all time ranges except for the ones which were unchecked by the user.
            time_ranges = [
                {
                    CONF_FROM: time_range.split(RANGE_DELIMITER)[0],
                    CONF_TO: time_range.split(RANGE_DELIMITER)[1],
                }
                for time_range in user_input.get(CONF_SCHEDULE, [])
            ]

            # Add the additional time range.
            if user_input[ADD_RANGE]:
                time_ranges.append(
                    {
                        CONF_FROM: user_input.get(CONF_FROM, "00:00:00"),
                        CONF_TO: user_input.get(CONF_TO, "00:00:00"),
                    }
                )

            try:
                schedule = Schedule(time_ranges)
            except ValueError as err:
                errors["base"] = "overlap" if "overlap" in str(err) else "length"

            if not errors:
                return self.async_create_entry(
                    title="",
                    data={
                        CONF_SCHEDULE: schedule.to_list(),
                        CONF_UTC: user_input[CONF_UTC],
                    },
                )

        time_ranges = [
            f"{time_range[CONF_FROM]}{RANGE_DELIMITER}{time_range[CONF_TO]}"
            for time_range in self.config_entry.options.get(CONF_SCHEDULE, [])
        ]
        if time_ranges:
            schema = vol.Schema(
                {
                    vol.Required(CONF_SCHEDULE, default=time_ranges): cv.multi_select(
                        time_ranges
                    ),
                }
            ).extend(OPTIONS_SCHEMA.schema)
        else:
            schema = OPTIONS_SCHEMA

        conf_utc = self.config_entry.options.get(CONF_UTC, False)
        schema = schema.extend(vol.Schema({
            vol.Required(CONF_UTC, default=conf_utc): selector.BooleanSelector(),
        }).schema)

        return self.async_show_form(step_id="init", data_schema=schema, errors=errors)
