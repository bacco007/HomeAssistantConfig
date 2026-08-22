"""ECCC setup, reconfigure, and options steps."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlowResult

from ..const import (
    CONF_FEED_SOURCE,
    CONF_GPS_LOC,
    CONF_LANGUAGE,
    CONF_PROVIDER,
    CONF_PROVINCE,
    CONF_STREAMING,
    CONF_TRACKER_ENTITY,
    DEFAULT_FEED_SOURCE,
    ECCC_PROVINCES,
)
from .common import (
    ScopedEntryFlowMixin,
    OptionsSchema,
    _tracker_schema,
    _validate_gps,
)


def _validate_province(value: str) -> tuple[str, str | None]:
    """Validate province code. Returns (cleaned, error_key_or_None)."""
    cleaned = value.strip().upper()
    if cleaned not in ECCC_PROVINCES:
        return value, "invalid_province"
    return cleaned, None


def options_schema(entry: ConfigEntry) -> OptionsSchema:
    """ECCC-specific option fields: content language, streaming, feed host."""
    return {
        vol.Optional(
            CONF_LANGUAGE,
            default=entry.options.get(CONF_LANGUAGE, "auto"),
        ): vol.In(["auto", "en-CA", "fr-CA"]),
        vol.Optional(
            CONF_STREAMING,
            default=entry.options.get(CONF_STREAMING, True),
        ): bool,
        vol.Optional(
            CONF_FEED_SOURCE,
            default=entry.options.get(CONF_FEED_SOURCE, DEFAULT_FEED_SOURCE),
        ): vol.In(["auto", "alertready", "pelmorex"]),
    }


class ECCCFlowMixin(ScopedEntryFlowMixin):
    """ECCC steps, mixed into the domain's flow handler."""

    # ── ECCC setup ──

    async def async_step_eccc(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """ECCC location type menu."""
        return self.async_show_menu(
            step_id="eccc",
            menu_options=["eccc_province", "eccc_gps_loc", "eccc_gps_tracker"],
        )

    async def async_step_eccc_province(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            province, err = _validate_province(user_input[CONF_PROVINCE])
            if err:
                errors["base"] = err
            else:
                data = {CONF_PROVIDER: "eccc", CONF_PROVINCE: province}
                return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="eccc_province",
            data_schema=vol.Schema({vol.Required(CONF_PROVINCE): str}),
            errors=errors,
        )

    async def async_step_eccc_gps_loc(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            gps, err = _validate_gps(user_input[CONF_GPS_LOC])
            if err:
                errors["base"] = err
            else:
                data = {CONF_PROVIDER: "eccc", CONF_GPS_LOC: gps}
                return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="eccc_gps_loc",
            data_schema=vol.Schema({vol.Required(CONF_GPS_LOC): str}),
            errors=errors,
        )

    async def async_step_eccc_gps_tracker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            data = {
                CONF_PROVIDER: "eccc",
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
            }
            return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="eccc_gps_tracker",
            data_schema=_tracker_schema(),
        )

    # ── ECCC reconfigure ──

    async def async_step_reconfigure_eccc(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self.async_show_menu(
            step_id="reconfigure_eccc",
            menu_options=[
                "reconfigure_eccc_province",
                "reconfigure_eccc_gps_loc",
                "reconfigure_eccc_gps_tracker",
            ],
        )

    async def async_step_reconfigure_eccc_province(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            province, err = _validate_province(user_input[CONF_PROVINCE])
            if err:
                errors["base"] = err
            else:
                new_data = {CONF_PROVIDER: "eccc", CONF_PROVINCE: province}
                return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_eccc_province",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_PROVINCE, default=entry.data.get(CONF_PROVINCE, "")
                    ): str,
                }
            ),
            errors=errors,
        )

    async def async_step_reconfigure_eccc_gps_loc(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            gps, err = _validate_gps(user_input[CONF_GPS_LOC])
            if err:
                errors["base"] = err
            else:
                new_data = {CONF_PROVIDER: "eccc", CONF_GPS_LOC: gps}
                return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_eccc_gps_loc",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_GPS_LOC, default=entry.data.get(CONF_GPS_LOC, "")
                    ): str,
                }
            ),
            errors=errors,
        )

    async def async_step_reconfigure_eccc_gps_tracker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            new_data = {
                CONF_PROVIDER: "eccc",
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
            }
            return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_eccc_gps_tracker",
            data_schema=_tracker_schema(
                default=entry.data.get(CONF_TRACKER_ENTITY, "")
            ),
        )
