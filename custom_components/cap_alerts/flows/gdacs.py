"""GDACS setup, reconfigure, and options steps."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlowResult
from homeassistant.helpers.selector import (
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from ..const import (
    CONF_ALERT_LEVEL,
    CONF_GDACS_EVENT_TYPES,
    CONF_GPS_LOC,
    CONF_PROVIDER,
    CONF_TRACKER_ENTITY,
    GDACS_ALERT_LEVELS,
    GDACS_DEFAULT_ALERT_LEVEL,
    GDACS_EVENT_TYPES,
)
from .common import ScopedEntryFlowMixin, OptionsSchema, _tracker_schema, _validate_gps


def _gdacs_event_type_selector() -> SelectSelector:
    """Multi-select of GDACS hazard codes, labelled with their event names.

    No ``custom_value``: unlike the MeteoAlarm region codes, this list is the
    complete published hazard set, and an unselected list already means "every
    type", so there is nothing a typed-in code could add.
    """
    options = [
        SelectOptionDict(value=code, label=label)
        for code, label in GDACS_EVENT_TYPES.items()
    ]
    return SelectSelector(
        SelectSelectorConfig(
            options=options,
            mode=SelectSelectorMode.DROPDOWN,
            multiple=True,
            sort=True,
        )
    )


def options_schema(entry: ConfigEntry) -> OptionsSchema:
    """GDACS-specific option fields: hazard types and the alert-level floor.

    Both fields are applied to the RSS indexes *before* any geometry is
    fetched, so the floor is what keeps a global feed of green wildfires from
    costing a fetch cascade every poll. It defaults to Orange rather than the
    widest value for that reason — the form shows the same default the
    provider applies when unset.
    """
    return {
        vol.Optional(
            CONF_GDACS_EVENT_TYPES,
            default=entry.options.get(CONF_GDACS_EVENT_TYPES, list(GDACS_EVENT_TYPES)),
        ): _gdacs_event_type_selector(),
        vol.Optional(
            CONF_ALERT_LEVEL,
            default=entry.options.get(CONF_ALERT_LEVEL, GDACS_DEFAULT_ALERT_LEVEL),
        ): vol.In(list(GDACS_ALERT_LEVELS)),
    }


class GDACSFlowMixin(ScopedEntryFlowMixin):
    """GDACS steps, mixed into the domain's flow handler."""

    # ── GDACS setup ──

    async def async_step_gdacs(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """GDACS location scope menu.

        Scope only: the event-type and alert-level filters are volume tuning,
        so they live in the options flow and a fresh entry works without them.
        """
        return self.async_show_menu(
            step_id="gdacs",
            menu_options=["gdacs_global", "gdacs_gps_loc", "gdacs_gps_tracker"],
        )

    async def async_step_gdacs_global(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        data = {CONF_PROVIDER: "gdacs"}
        return await self._async_create_scoped_entry(data)

    async def async_step_gdacs_gps_loc(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            gps, err = _validate_gps(user_input[CONF_GPS_LOC])
            if err:
                errors["base"] = err
            else:
                data = {CONF_PROVIDER: "gdacs", CONF_GPS_LOC: gps}
                return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="gdacs_gps_loc",
            data_schema=vol.Schema({vol.Required(CONF_GPS_LOC): str}),
            errors=errors,
        )

    async def async_step_gdacs_gps_tracker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            data = {
                CONF_PROVIDER: "gdacs",
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
            }
            return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="gdacs_gps_tracker",
            data_schema=_tracker_schema(),
        )

    # ── GDACS reconfigure ──

    async def async_step_reconfigure_gdacs(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self.async_show_menu(
            step_id="reconfigure_gdacs",
            menu_options=[
                "reconfigure_gdacs_global",
                "reconfigure_gdacs_gps_loc",
                "reconfigure_gdacs_gps_tracker",
            ],
        )

    async def async_step_reconfigure_gdacs_global(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        new_data = {CONF_PROVIDER: "gdacs"}
        return await self._async_update_scoped_entry(entry, new_data)

    async def async_step_reconfigure_gdacs_gps_loc(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            gps, err = _validate_gps(user_input[CONF_GPS_LOC])
            if err:
                errors["base"] = err
            else:
                new_data = {CONF_PROVIDER: "gdacs", CONF_GPS_LOC: gps}
                return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_gdacs_gps_loc",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_GPS_LOC, default=entry.data.get(CONF_GPS_LOC, "")
                    ): str,
                }
            ),
            errors=errors,
        )

    async def async_step_reconfigure_gdacs_gps_tracker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            new_data = {
                CONF_PROVIDER: "gdacs",
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
            }
            return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_gdacs_gps_tracker",
            data_schema=_tracker_schema(
                default=entry.data.get(CONF_TRACKER_ENTITY, "")
            ),
        )
