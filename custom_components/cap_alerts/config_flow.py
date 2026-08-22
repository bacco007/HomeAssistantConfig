"""Config flow for CAP Alerts: setup, reconfigure, and options flows.

The flow handler is one class per Home Assistant's contract, assembled here
from one mixin per provider. Each module under ``flows/`` owns its steps, its
validators, and the option fields only it renders; this module owns the
entry points that pick a provider and the options flow's shared fields.

The steps sit in a sibling package rather than a ``config_flow/`` package of
their own because hassfest requires the flow to be defined in a file literally
named ``config_flow.py``.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback

from .const import (
    CONF_EXCLUDE_MARINE,
    CONF_GDACS_EVENT_TYPES,
    CONF_GEOCODE_PREFIXES,
    CONF_PROVIDER,
    CONF_SCAN_INTERVAL,
    CONF_TIMEOUT,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_TIMEOUT,
    DOMAIN,
    GDACS_EVENT_TYPES,
)
from .conventions import conventions_for
from .flows import eccc, gdacs, meteoalarm, nws, wmo
from .flows.common import OptionsSchema, _validate_geocode_prefixes

# Providers that add fields to the options form, in the order the setup menu
# offers them. A provider absent here (NWS) has nothing beyond the shared
# polling fields.
_OPTIONS_SCHEMAS: dict[str, Callable[[ConfigEntry], OptionsSchema]] = {
    "eccc": eccc.options_schema,
    "meteoalarm": meteoalarm.options_schema,
    "wmo": wmo.options_schema,
    "gdacs": gdacs.options_schema,
}


class CAPAlertsFlowHandler(
    nws.NWSFlowMixin,
    eccc.ECCCFlowMixin,
    meteoalarm.MeteoAlarmFlowMixin,
    wmo.WMOFlowMixin,
    gdacs.GDACSFlowMixin,
    ConfigFlow,
    domain=DOMAIN,
):
    """Handle config flow for CAP Alerts."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return CAPAlertsOptionsFlowHandler()

    # ── Initial setup ──

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Provider selection menu."""
        return self.async_show_menu(
            step_id="user",
            menu_options=["nws", "eccc", "meteoalarm", "wmo", "gdacs"],
        )

    # ── Reconfigure flow ──

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Allow full reconfiguration including provider change."""
        return self.async_show_menu(
            step_id="reconfigure",
            menu_options=[
                "reconfigure_nws",
                "reconfigure_eccc",
                "reconfigure_meteoalarm",
                "reconfigure_wmo",
                "reconfigure_gdacs",
            ],
        )


class CAPAlertsOptionsFlowHandler(OptionsFlow):
    """Handle options flow for CAP Alerts."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            prefixes, err = _validate_geocode_prefixes(
                str(user_input.get(CONF_GEOCODE_PREFIXES, "") or "")
            )
            if err:
                errors["base"] = err
            else:
                data = {**user_input}
                # Absent rather than empty when unset, so the coordinator's
                # `.get(...) or []` short-circuits and options stay tidy.
                if prefixes:
                    data[CONF_GEOCODE_PREFIXES] = prefixes
                else:
                    data.pop(CONF_GEOCODE_PREFIXES, None)
                # The GDACS multiselect materializes its all-types default into
                # user_input on save, and a stored list is a closed set — a
                # hazard code GDACS adds later would be silently dropped by an
                # entry that never chose to narrow. All types selected (or
                # none) means "no narrowing", and no narrowing is spelled
                # "absent", same as the prefixes above.
                event_types = data.get(CONF_GDACS_EVENT_TYPES)
                if event_types is not None and (
                    not event_types or set(event_types) == set(GDACS_EVENT_TYPES)
                ):
                    data.pop(CONF_GDACS_EVENT_TYPES)
                return self.async_create_entry(title="", data=data)

        provider = self.config_entry.data.get(CONF_PROVIDER)
        schema: OptionsSchema = {
            vol.Optional(
                CONF_SCAN_INTERVAL,
                default=self.config_entry.options.get(
                    CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL
                ),
            ): vol.All(vol.Coerce(int), vol.Range(min=60, max=3600)),
            vol.Optional(
                CONF_TIMEOUT,
                default=self.config_entry.options.get(CONF_TIMEOUT, DEFAULT_TIMEOUT),
            ): vol.All(vol.Coerce(int), vol.Range(min=5, max=120)),
        }

        provider_schema = _OPTIONS_SCHEMAS.get(provider or "")
        if provider_schema is not None:
            schema.update(provider_schema(self.config_entry))

        # Marine-alert exclusion is only meaningful for providers that classify
        # marine zones (NWS UGC prefixes, ECCC CLC "00…"). Asked of the
        # convention table rather than re-listing them here, so a provider that
        # gains a marine discriminator gets the toggle without a second edit.
        if conventions_for(provider or "").classifies_marine:
            schema[
                vol.Optional(
                    CONF_EXCLUDE_MARINE,
                    default=self.config_entry.options.get(CONF_EXCLUDE_MARINE, False),
                )
            ] = bool

        # Area-code narrowing composes with every location mode, but only on
        # sources that publish geocodes at all — GDACS never does, so there the
        # field's only possible effect is a permanently unavailable entry.
        # Asked of the convention table, like the marine toggle above. The
        # field re-renders from the rejected input rather than the stored
        # value, so a typo is shown back to the user to correct instead of
        # silently reverting.
        if conventions_for(provider or "").publishes_geocodes:
            stored_prefixes = self.config_entry.options.get(CONF_GEOCODE_PREFIXES) or []
            prefix_default = (
                str(user_input.get(CONF_GEOCODE_PREFIXES, "") or "")
                if user_input is not None
                else ",".join(stored_prefixes)
            )
            schema[vol.Optional(CONF_GEOCODE_PREFIXES, default=prefix_default)] = str

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(schema),
            errors=errors,
        )
