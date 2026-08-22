"""NWS setup and reconfigure steps."""

from __future__ import annotations

import re
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlowResult

from ..const import CONF_GPS_LOC, CONF_PROVIDER, CONF_TRACKER_ENTITY, CONF_ZONE_ID
from .common import ScopedEntryFlowMixin, _tracker_schema, _validate_gps

_ZONE_RE = re.compile(r"^[A-Za-z]{2}[CZ]\d{3}(,[A-Za-z]{2}[CZ]\d{3})*$")


def _validate_zone(value: str) -> tuple[str, str | None]:
    """Validate zone ID(s). Returns (cleaned, error_key_or_None)."""
    cleaned = value.strip().upper()
    if not _ZONE_RE.match(cleaned):
        return value, "invalid_zone"
    return cleaned, None


class NWSFlowMixin(ScopedEntryFlowMixin):
    """NWS steps, mixed into the domain's flow handler.

    Subclasses ``ConfigFlow`` without a ``domain`` so nothing registers here —
    only the composed handler in ``__init__.py`` claims the domain.
    """

    # ── NWS setup ──

    async def async_step_nws(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """NWS location type menu."""
        return self.async_show_menu(
            step_id="nws",
            menu_options=["nws_zone", "nws_gps_loc", "nws_gps_tracker"],
        )

    async def async_step_nws_zone(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            zone_id, err = _validate_zone(user_input[CONF_ZONE_ID])
            if err:
                errors["base"] = err
            else:
                data = {CONF_PROVIDER: "nws", CONF_ZONE_ID: zone_id}
                if err := await self._async_validate_scope(data):
                    errors["base"] = err
                else:
                    return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="nws_zone",
            data_schema=vol.Schema({vol.Required(CONF_ZONE_ID): str}),
            errors=errors,
        )

    async def async_step_nws_gps_loc(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            gps, err = _validate_gps(user_input[CONF_GPS_LOC])
            if err:
                errors["base"] = err
            else:
                data = {CONF_PROVIDER: "nws", CONF_GPS_LOC: gps}
                return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="nws_gps_loc",
            data_schema=vol.Schema({vol.Required(CONF_GPS_LOC): str}),
            errors=errors,
        )

    async def async_step_nws_gps_tracker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            data = {
                CONF_PROVIDER: "nws",
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
            }
            return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="nws_gps_tracker",
            data_schema=_tracker_schema(),
            errors=errors,
        )

    # ── NWS reconfigure ──

    async def async_step_reconfigure_nws(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self.async_show_menu(
            step_id="reconfigure_nws",
            menu_options=[
                "reconfigure_nws_zone",
                "reconfigure_nws_gps_loc",
                "reconfigure_nws_gps_tracker",
            ],
        )

    async def async_step_reconfigure_nws_zone(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            zone_id, err = _validate_zone(user_input[CONF_ZONE_ID])
            if err:
                errors["base"] = err
            else:
                new_data = {CONF_PROVIDER: "nws", CONF_ZONE_ID: zone_id}
                if err := await self._async_validate_scope(new_data):
                    errors["base"] = err
                else:
                    return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_nws_zone",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_ZONE_ID, default=entry.data.get(CONF_ZONE_ID, "")
                    ): str,
                }
            ),
            errors=errors,
        )

    async def async_step_reconfigure_nws_gps_loc(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            gps, err = _validate_gps(user_input[CONF_GPS_LOC])
            if err:
                errors["base"] = err
            else:
                new_data = {CONF_PROVIDER: "nws", CONF_GPS_LOC: gps}
                return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_nws_gps_loc",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_GPS_LOC, default=entry.data.get(CONF_GPS_LOC, "")
                    ): str,
                }
            ),
            errors=errors,
        )

    async def async_step_reconfigure_nws_gps_tracker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            new_data = {
                CONF_PROVIDER: "nws",
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
            }
            return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_nws_gps_tracker",
            data_schema=_tracker_schema(
                default=entry.data.get(CONF_TRACKER_ENTITY, "")
            ),
        )
