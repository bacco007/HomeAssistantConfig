"""WMO setup, reconfigure, and options steps."""

from __future__ import annotations

import re
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from ..const import (
    CONF_GEOCODE_PREFIXES,
    CONF_GPS_LOC,
    CONF_LANGUAGE,
    CONF_PROVIDER,
    CONF_SOURCE_ID,
    CONF_TRACKER_ENTITY,
    WMO_LANGUAGES,
    WMO_SOURCE_NAMES,
)
from ..providers.wmo import fetch_wmo_sources
from .common import (
    ScopedEntryFlowMixin,
    OptionsSchema,
    _tracker_schema,
    _validate_geocode_prefixes,
    _validate_gps,
)

# WMO SWIC source IDs: {country}-{agency}[-{extra}…] (e.g. mx-smn-es,
# us-noaa-nws-en-marine). The trailing segment is NOT a reliable language —
# 17 registry IDs end in "-xx", one ends in "-marine", and 15 of the 110
# sources sampled disagree with their CAP body's first <info> block. Body
# language is selected at fetch time (providers/wmo.py:_select_info).
_WMO_SOURCE_RE = re.compile(r"^[a-z]{2}(-[a-z0-9]+){2,4}$")


def _validate_wmo_source(value: str) -> tuple[str, str | None]:
    """Validate a WMO source ID. Returns (cleaned, error_key_or_None).

    Accepts both catalog entries and free-text that matches the
    ``{country}-{agency}[-{extra}…]`` source-ID shape, so advanced users can
    enter sources not yet in ``WMO_SOURCE_NAMES``.
    """
    cleaned = value.strip().lower()
    if not cleaned:
        return value, "invalid_wmo_source"
    if cleaned not in WMO_SOURCE_NAMES and not _WMO_SOURCE_RE.match(cleaned):
        return value, "invalid_wmo_source"
    return cleaned, None


def _wmo_source_selector(options: list[tuple[str, str]]) -> SelectSelector:
    """Dropdown selector for WMO source IDs, allowing custom IDs.

    ``options`` is ``[(sourceId, label), ...]``, built dynamically from the
    live SWIC registry (or the static ``WMO_SOURCE_NAMES`` fallback).
    """
    select_options = [
        SelectOptionDict(value=sid, label=label) for sid, label in options
    ]
    return SelectSelector(
        SelectSelectorConfig(
            options=select_options,
            mode=SelectSelectorMode.DROPDOWN,
            custom_value=True,
            sort=True,
        )
    )


def _wmo_language_selector() -> SelectSelector:
    """Dropdown of WMO body languages, allowing any custom BCP 47 tag.

    ``WMO_LANGUAGES`` seeds the list with the primary subtags actually seen in
    SWIC bodies, but a source may publish a script- or region-tagged form
    (``zh-Hans``, ``pt-BR``, ``sr-Latn``), so free text is accepted too — the
    provider's matcher falls back to English then document order for anything
    a document does not carry. ``sort=False`` keeps ``auto`` first.
    """
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=code, label=code) for code in WMO_LANGUAGES
            ],
            mode=SelectSelectorMode.DROPDOWN,
            custom_value=True,
            sort=False,
        )
    )


def options_schema(entry: ConfigEntry) -> OptionsSchema:
    """WMO-specific option fields: which ``<info>`` language to read."""
    return {
        vol.Optional(
            CONF_LANGUAGE,
            default=entry.options.get(CONF_LANGUAGE, "auto"),
        ): _wmo_language_selector(),
    }


class WMOFlowMixin(ScopedEntryFlowMixin):
    """WMO steps, mixed into the domain's flow handler."""

    async def _wmo_source_options(self) -> list[tuple[str, str]]:
        """Build the WMO source dropdown options.

        Fetches the live SWIC registry once per flow (cached on the handler so
        a re-rendered form doesn't re-fetch); on any failure falls back to the
        static ``WMO_SOURCE_NAMES`` catalog so setup never hard-fails.
        """
        cached = getattr(self, "_wmo_source_options_cache", None)
        if cached is not None:
            return cached
        options = await fetch_wmo_sources(async_get_clientsession(self.hass))
        if not options:
            options = sorted(WMO_SOURCE_NAMES.items(), key=lambda item: item[1])
        self._wmo_source_options_cache = options
        return options

    # ── WMO setup ──

    async def async_step_wmo(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """WMO: source first, then location filter."""
        return await self.async_step_wmo_source()

    async def async_step_wmo_source(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            source_id, err = _validate_wmo_source(user_input[CONF_SOURCE_ID])
            if not err:
                # Checked here, before the filter menu: country-wide commits on
                # a menu click, and the geocode step's form is about prefixes
                # rather than the source, so this is the last form that can
                # report an unpublished source id.
                err = await self._async_validate_scope(
                    {CONF_PROVIDER: "wmo", CONF_SOURCE_ID: source_id}
                )
            if err:
                errors["base"] = err
            else:
                self._wmo_source_id = source_id
                return await self.async_step_wmo_filter()
        options = await self._wmo_source_options()
        return self.async_show_form(
            step_id="wmo_source",
            data_schema=vol.Schema(
                {vol.Required(CONF_SOURCE_ID): _wmo_source_selector(options)}
            ),
            errors=errors,
        )

    async def async_step_wmo_filter(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self.async_show_menu(
            step_id="wmo_filter",
            menu_options=[
                "wmo_country_wide",
                "wmo_gps_loc",
                "wmo_gps_tracker",
                "wmo_geocode",
            ],
        )

    async def async_step_wmo_country_wide(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        source_id = getattr(self, "_wmo_source_id", "")
        data = {CONF_PROVIDER: "wmo", CONF_SOURCE_ID: source_id}
        return await self._async_create_scoped_entry(data)

    async def async_step_wmo_gps_loc(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        source_id = getattr(self, "_wmo_source_id", "")
        if user_input is not None:
            gps, err = _validate_gps(user_input[CONF_GPS_LOC])
            if err:
                errors["base"] = err
            else:
                data = {
                    CONF_PROVIDER: "wmo",
                    CONF_SOURCE_ID: source_id,
                    CONF_GPS_LOC: gps,
                }
                return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="wmo_gps_loc",
            data_schema=vol.Schema({vol.Required(CONF_GPS_LOC): str}),
            errors=errors,
        )

    async def async_step_wmo_gps_tracker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        source_id = getattr(self, "_wmo_source_id", "")
        if user_input is not None:
            data = {
                CONF_PROVIDER: "wmo",
                CONF_SOURCE_ID: source_id,
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
            }
            return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="wmo_gps_tracker",
            data_schema=_tracker_schema(),
        )

    async def async_step_wmo_geocode(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Country-wide fetch narrowed by area-code prefixes.

        The prefixes are an *option*, not entry data — the filter is
        provider-neutral and editable later in the options flow. This step only
        exists so a high-volume source can be narrowed **before** the first
        refresh: setting it afterwards means creating hundreds of entities and
        immediately removing most of them (``cn-cma-xx`` publishes ~260 active
        alerts country-wide, ~30 for prefix ``13``).
        """
        errors: dict[str, str] = {}
        source_id = getattr(self, "_wmo_source_id", "")
        if user_input is not None:
            prefixes, err = _validate_geocode_prefixes(
                str(user_input.get(CONF_GEOCODE_PREFIXES, "") or "")
            )
            # Unlike the options-flow field, empty is rejected here: the user
            # picked this mode, so an empty value is a mistake rather than
            # "filter off".
            if err or not prefixes:
                errors["base"] = err or "invalid_geocode_prefix"
            else:
                data = {CONF_PROVIDER: "wmo", CONF_SOURCE_ID: source_id}
                return await self._async_create_scoped_entry(
                    data, options={CONF_GEOCODE_PREFIXES: prefixes}
                )
        return self.async_show_form(
            step_id="wmo_geocode",
            data_schema=vol.Schema({vol.Required(CONF_GEOCODE_PREFIXES): str}),
            errors=errors,
        )

    # ── WMO reconfigure ──

    async def async_step_reconfigure_wmo(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return await self.async_step_reconfigure_wmo_source()

    async def async_step_reconfigure_wmo_source(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            source_id, err = _validate_wmo_source(user_input[CONF_SOURCE_ID])
            if not err:
                # Checked here, before the filter menu: country-wide commits on
                # a menu click, and the geocode step's form is about prefixes
                # rather than the source, so this is the last form that can
                # report an unpublished source id.
                err = await self._async_validate_scope(
                    {CONF_PROVIDER: "wmo", CONF_SOURCE_ID: source_id}
                )
            if err:
                errors["base"] = err
            else:
                self._wmo_source_id = source_id
                return await self.async_step_reconfigure_wmo_filter()
        existing = entry.data.get(CONF_SOURCE_ID, "")
        source_kwargs: dict[str, Any] = {}
        if existing:
            source_kwargs["default"] = existing
        options = await self._wmo_source_options()
        return self.async_show_form(
            step_id="reconfigure_wmo_source",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SOURCE_ID, **source_kwargs): _wmo_source_selector(
                        options
                    ),
                }
            ),
            errors=errors,
        )

    async def async_step_reconfigure_wmo_filter(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self.async_show_menu(
            step_id="reconfigure_wmo_filter",
            menu_options=[
                "reconfigure_wmo_country_wide",
                "reconfigure_wmo_gps_loc",
                "reconfigure_wmo_gps_tracker",
                "reconfigure_wmo_geocode",
            ],
        )

    async def async_step_reconfigure_wmo_country_wide(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        source_id = getattr(self, "_wmo_source_id", "")
        new_data = {CONF_PROVIDER: "wmo", CONF_SOURCE_ID: source_id}
        return await self._async_update_scoped_entry(entry, new_data)

    async def async_step_reconfigure_wmo_gps_loc(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        source_id = getattr(self, "_wmo_source_id", "")
        if user_input is not None:
            gps, err = _validate_gps(user_input[CONF_GPS_LOC])
            if err:
                errors["base"] = err
            else:
                new_data = {
                    CONF_PROVIDER: "wmo",
                    CONF_SOURCE_ID: source_id,
                    CONF_GPS_LOC: gps,
                }
                return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_wmo_gps_loc",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_GPS_LOC, default=entry.data.get(CONF_GPS_LOC, "")
                    ): str,
                }
            ),
            errors=errors,
        )

    async def async_step_reconfigure_wmo_gps_tracker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        source_id = getattr(self, "_wmo_source_id", "")
        if user_input is not None:
            new_data = {
                CONF_PROVIDER: "wmo",
                CONF_SOURCE_ID: source_id,
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
            }
            return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_wmo_gps_tracker",
            data_schema=_tracker_schema(
                default=entry.data.get(CONF_TRACKER_ENTITY, "")
            ),
        )

    async def async_step_reconfigure_wmo_geocode(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Switch to country-wide fetch narrowed by area-code prefixes."""
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        source_id = getattr(self, "_wmo_source_id", "")
        if user_input is not None:
            prefixes, err = _validate_geocode_prefixes(
                str(user_input.get(CONF_GEOCODE_PREFIXES, "") or "")
            )
            if err or not prefixes:
                errors["base"] = err or "invalid_geocode_prefix"
            else:
                new_data = {CONF_PROVIDER: "wmo", CONF_SOURCE_ID: source_id}
                return await self._async_update_scoped_entry(
                    entry,
                    new_data,
                    # Merged, not replaced: `options=` overwrites the whole
                    # mapping, which would silently drop scan_interval,
                    # timeout, and the language selection.
                    options={**entry.options, CONF_GEOCODE_PREFIXES: prefixes},
                )
        return self.async_show_form(
            step_id="reconfigure_wmo_geocode",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_GEOCODE_PREFIXES,
                        default=",".join(
                            entry.options.get(CONF_GEOCODE_PREFIXES, []) or []
                        ),
                    ): str,
                }
            ),
            errors=errors,
        )
