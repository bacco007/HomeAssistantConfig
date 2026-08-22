"""MeteoAlarm setup, reconfigure, and options steps."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlowResult
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)
from homeassistant.helpers.update_coordinator import UpdateFailed

from ..const import (
    CONF_COUNTRY,
    CONF_COUNTRY_ATTRIBUTE,
    CONF_COUNTRY_ENTITY,
    CONF_GPS_LOC,
    CONF_LANGUAGE,
    CONF_PROVIDER,
    CONF_REGION_LABELS,
    CONF_REGIONS,
    CONF_TRACKER_ENTITY,
    METEOALARM_COUNTRIES,
    METEOALARM_COUNTRY_NAMES,
)
from ..providers.meteoalarm import fetch_regions_for_country
from .common import (
    ScopedEntryFlowMixin,
    OptionsSchema,
    _tracker_schema,
    _validate_gps,
)

# Languages exposed in the options-flow dropdown for MeteoAlarm entries.
# Covers the locales the MeteoAlarm member feeds typically ship plus
# generic English fallback. `auto` resolves to hass.config.language at
# coordinator level.
_METEOALARM_LANGUAGES = (
    "auto",
    "en",
    "de",
    "fr",
    "it",
    "es",
    "nl",
    "pl",
    "pt",
    "cs",
    "sv",
    "no",
    "da",
    "fi",
    "el",
    "hu",
    "ro",
    "bg",
    "hr",
    "sl",
    "sk",
    "et",
    "lv",
    "lt",
    "is",
    "ga",
    "mt",
    "tr",
    "mk",
    "sr",
    "bs",
    "me",
    "he",
)


def _country_source_schema(
    tracker_default: str | None = None,
    country_default: str | None = None,
    attribute_default: str | None = None,
) -> vol.Schema:
    """Schema for MeteoAlarm fully-mobile mode.

    A ``device_tracker`` for coordinates, an (unrestricted) entity whose value
    names the country, and an optional attribute to read that country from.
    Defaults carry current values forward in reconfigure flows.
    """
    if tracker_default is not None:
        tracker_key: Any = vol.Required(CONF_TRACKER_ENTITY, default=tracker_default)
    else:
        tracker_key = vol.Required(CONF_TRACKER_ENTITY)
    if country_default is not None:
        country_key: Any = vol.Required(CONF_COUNTRY_ENTITY, default=country_default)
    else:
        country_key = vol.Required(CONF_COUNTRY_ENTITY)
    attribute_key: Any = vol.Optional(
        CONF_COUNTRY_ATTRIBUTE, default=attribute_default or ""
    )
    return vol.Schema(
        {
            tracker_key: EntitySelector(EntitySelectorConfig(domain="device_tracker")),
            country_key: EntitySelector(EntitySelectorConfig()),
            attribute_key: str,
        }
    )


def _validate_country(value: str) -> tuple[str, str | None]:
    """Validate MeteoAlarm country code. Returns (cleaned, error_key_or_None)."""
    cleaned = value.strip().upper()
    if not cleaned or cleaned not in METEOALARM_COUNTRIES:
        return value, "invalid_country"
    return cleaned, None


def _country_selector() -> SelectSelector:
    """Dropdown selector backed by ``METEOALARM_COUNTRY_NAMES``."""
    options = [
        SelectOptionDict(value=iso, label=METEOALARM_COUNTRY_NAMES[iso])
        for iso in METEOALARM_COUNTRY_NAMES
    ]
    return SelectSelector(
        SelectSelectorConfig(
            options=options,
            mode=SelectSelectorMode.DROPDOWN,
            sort=True,
        )
    )


def _region_selector(
    regions: list[tuple[str, str]],
    *,
    extra: Sequence[tuple[str, str]] = (),
) -> SelectSelector:
    """Multi-select dropdown for region codes, accepting typed-in codes.

    The list can only offer regions named by warnings currently in the feed
    (no usable regions endpoint exists — see the provider docstring), so
    ``custom_value`` lets a user enter a code no live warning mentions — e.g.
    an ``EMMA_ID`` whose warning has expired. ``extra`` carries
    already-configured codes that the current fetch does not offer, so
    reconfigure renders them as real options instead of dropping them.
    """
    options = [
        SelectOptionDict(value=code, label=label) for code, label in [*regions, *extra]
    ]
    return SelectSelector(
        SelectSelectorConfig(
            options=options,
            mode=SelectSelectorMode.DROPDOWN,
            multiple=True,
            custom_value=True,
            sort=True,
        )
    )


def _picker_language(hass: HomeAssistant, entry: ConfigEntry | None = None) -> str:
    """Language the MeteoAlarm region picker harvests labels in.

    Mirrors the coordinator's ``"auto"`` resolution (see
    ``_resolved_config``) so the picker agrees with the alert entities the
    entry will produce. That is cosmetic for the geocoded countries and
    load-bearing for the ``areaDesc``-namespace ones, where the label *is*
    the stored region code. Setup has no entry yet, so it takes the HA
    locale — which is what ``"auto"`` resolves to anyway.
    """
    configured = entry.options.get(CONF_LANGUAGE, "auto") if entry else "auto"
    if configured and configured != "auto":
        return str(configured)
    return hass.config.language or "en"


def _normalize_region_selection(selected: list[Any]) -> list[str]:
    """Clean a region multi-select: stringify, strip, drop empties, de-dup.

    Typed-in values arrive as free text, so they can carry stray whitespace or
    be entered twice; codes span several namespaces (``EMMA_ID``, ``NUTS3``,
    ``NUTS2``, and the ``areaDesc`` fallback) and are deliberately not
    validated beyond this — any pattern tight enough to catch a typo would
    reject a legitimate namespace, and a wrong code simply matches nothing.
    """
    out: list[str] = []
    for value in selected:
        code = str(value).strip()
        if code and code not in out:
            out.append(code)
    return out


def _region_label_map(
    selected: list[str],
    fetched: dict[str, str],
    stored: dict[str, str],
) -> dict[str, str]:
    """Label every selected code: fetched label, else stored, else the code."""
    return {code: fetched.get(code) or stored.get(code) or code for code in selected}


def options_schema(entry: ConfigEntry) -> OptionsSchema:
    """MeteoAlarm-specific option fields: alert-content language."""
    return {
        vol.Optional(
            CONF_LANGUAGE,
            default=entry.options.get(CONF_LANGUAGE, "auto"),
        ): vol.In(list(_METEOALARM_LANGUAGES)),
    }


class MeteoAlarmFlowMixin(ScopedEntryFlowMixin):
    """MeteoAlarm steps, mixed into the domain's flow handler."""

    # ── MeteoAlarm setup ──

    async def async_step_meteoalarm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """MeteoAlarm: pick a fixed country or the fully-mobile mode."""
        return self.async_show_menu(
            step_id="meteoalarm",
            menu_options=["meteoalarm_country", "meteoalarm_country_source"],
        )

    async def async_step_meteoalarm_country(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            country, err = _validate_country(user_input[CONF_COUNTRY])
            if not err:
                # Checked here rather than at entry creation: two of the three
                # modes commit straight off the following menu, with no form to
                # report a dead feed on.
                err = await self._async_validate_scope(
                    {CONF_PROVIDER: "meteoalarm", CONF_COUNTRY: country}
                )
            if err:
                errors["base"] = err
            else:
                self._meteoalarm_country = country
                return await self.async_step_meteoalarm_filter()
        return self.async_show_form(
            step_id="meteoalarm_country",
            data_schema=vol.Schema({vol.Required(CONF_COUNTRY): _country_selector()}),
            errors=errors,
        )

    async def async_step_meteoalarm_filter(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self.async_show_menu(
            step_id="meteoalarm_filter",
            menu_options=[
                "meteoalarm_country_only",
                "meteoalarm_gps_polygon",
                "meteoalarm_gps_tracker",
                "meteoalarm_region_picker",
            ],
        )

    async def async_step_meteoalarm_country_only(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        country = getattr(self, "_meteoalarm_country", "")
        data = {CONF_PROVIDER: "meteoalarm", CONF_COUNTRY: country}
        return await self._async_create_scoped_entry(data)

    async def async_step_meteoalarm_gps_polygon(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        country = getattr(self, "_meteoalarm_country", "")
        if user_input is not None:
            gps, err = _validate_gps(user_input[CONF_GPS_LOC])
            if err:
                errors["base"] = err
            else:
                data = {
                    CONF_PROVIDER: "meteoalarm",
                    CONF_COUNTRY: country,
                    CONF_GPS_LOC: gps,
                }
                # Title is GPS-based when GPS is present (matches NWS/ECCC).
                return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="meteoalarm_gps_polygon",
            data_schema=vol.Schema({vol.Required(CONF_GPS_LOC): str}),
            errors=errors,
        )

    async def async_step_meteoalarm_gps_tracker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        country = getattr(self, "_meteoalarm_country", "")
        if user_input is not None:
            data = {
                CONF_PROVIDER: "meteoalarm",
                CONF_COUNTRY: country,
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
            }
            return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="meteoalarm_gps_tracker",
            data_schema=_tracker_schema(),
        )

    async def async_step_meteoalarm_country_source(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Fully-mobile MeteoAlarm: tracker for coords + country-source entity."""
        if user_input is not None:
            data = {
                CONF_PROVIDER: "meteoalarm",
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
                CONF_COUNTRY_ENTITY: user_input[CONF_COUNTRY_ENTITY],
            }
            attribute = (user_input.get(CONF_COUNTRY_ATTRIBUTE) or "").strip()
            if attribute:
                data[CONF_COUNTRY_ATTRIBUTE] = attribute
            return await self._async_create_scoped_entry(data)
        return self.async_show_form(
            step_id="meteoalarm_country_source",
            data_schema=_country_source_schema(),
        )

    async def async_step_meteoalarm_region_picker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        country = getattr(self, "_meteoalarm_country", "")
        errors: dict[str, str] = {}

        try:
            regions = await fetch_regions_for_country(
                async_get_clientsession(self.hass),
                country,
                language=_picker_language(self.hass),
            )
        except UpdateFailed:
            return self.async_show_form(
                step_id="meteoalarm_region_picker",
                data_schema=vol.Schema({}),
                errors={"base": "cannot_fetch_regions"},
            )

        if not regions:
            # The feed was read fine and named no regions — a single-zone
            # country, or one with nothing live. Retrying (what
            # ``cannot_fetch_regions`` invites) cannot change that, so name
            # the mode that does work instead of looping on an empty form.
            return self.async_abort(reason="no_regions_available")

        if user_input is not None:
            selected = _normalize_region_selection(user_input.get(CONF_REGIONS) or [])
            if not selected:
                errors["base"] = "no_regions_selected"
            else:
                data = {
                    CONF_PROVIDER: "meteoalarm",
                    CONF_COUNTRY: country,
                    CONF_REGIONS: selected,
                    CONF_REGION_LABELS: _region_label_map(selected, dict(regions), {}),
                }
                return await self._async_create_scoped_entry(data)

        return self.async_show_form(
            step_id="meteoalarm_region_picker",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_REGIONS, default=[]): _region_selector(regions),
                }
            ),
            errors=errors,
        )

    # ── MeteoAlarm reconfigure ──

    async def async_step_reconfigure_meteoalarm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self.async_show_menu(
            step_id="reconfigure_meteoalarm",
            menu_options=[
                "reconfigure_meteoalarm_country",
                "reconfigure_meteoalarm_country_source",
            ],
        )

    async def async_step_reconfigure_meteoalarm_country(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            country, err = _validate_country(user_input[CONF_COUNTRY])
            if not err:
                # Checked here rather than at entry creation: two of the three
                # modes commit straight off the following menu, with no form to
                # report a dead feed on.
                err = await self._async_validate_scope(
                    {CONF_PROVIDER: "meteoalarm", CONF_COUNTRY: country}
                )
            if err:
                errors["base"] = err
            else:
                self._meteoalarm_country = country
                return await self.async_step_reconfigure_meteoalarm_filter()
        existing = entry.data.get(CONF_COUNTRY, "")
        country_kwargs: dict[str, Any] = {}
        if existing in METEOALARM_COUNTRIES:
            country_kwargs["default"] = existing
        return self.async_show_form(
            step_id="reconfigure_meteoalarm_country",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_COUNTRY, **country_kwargs): _country_selector(),
                }
            ),
            errors=errors,
        )

    async def async_step_reconfigure_meteoalarm_filter(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self.async_show_menu(
            step_id="reconfigure_meteoalarm_filter",
            menu_options=[
                "reconfigure_meteoalarm_country_only",
                "reconfigure_meteoalarm_gps_polygon",
                "reconfigure_meteoalarm_gps_tracker",
                "reconfigure_meteoalarm_region_picker",
            ],
        )

    async def async_step_reconfigure_meteoalarm_country_only(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        country = getattr(self, "_meteoalarm_country", "")
        new_data = {CONF_PROVIDER: "meteoalarm", CONF_COUNTRY: country}
        return await self._async_update_scoped_entry(entry, new_data)

    async def async_step_reconfigure_meteoalarm_gps_polygon(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        country = getattr(self, "_meteoalarm_country", "")
        if user_input is not None:
            gps, err = _validate_gps(user_input[CONF_GPS_LOC])
            if err:
                errors["base"] = err
            else:
                new_data = {
                    CONF_PROVIDER: "meteoalarm",
                    CONF_COUNTRY: country,
                    CONF_GPS_LOC: gps,
                }
                return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_meteoalarm_gps_polygon",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_GPS_LOC, default=entry.data.get(CONF_GPS_LOC, "")
                    ): str,
                }
            ),
            errors=errors,
        )

    async def async_step_reconfigure_meteoalarm_gps_tracker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        country = getattr(self, "_meteoalarm_country", "")
        if user_input is not None:
            new_data = {
                CONF_PROVIDER: "meteoalarm",
                CONF_COUNTRY: country,
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
            }
            return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_meteoalarm_gps_tracker",
            data_schema=_tracker_schema(
                default=entry.data.get(CONF_TRACKER_ENTITY, "")
            ),
        )

    async def async_step_reconfigure_meteoalarm_country_source(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            new_data = {
                CONF_PROVIDER: "meteoalarm",
                CONF_TRACKER_ENTITY: user_input[CONF_TRACKER_ENTITY],
                CONF_COUNTRY_ENTITY: user_input[CONF_COUNTRY_ENTITY],
            }
            attribute = (user_input.get(CONF_COUNTRY_ATTRIBUTE) or "").strip()
            if attribute:
                new_data[CONF_COUNTRY_ATTRIBUTE] = attribute
            return await self._async_update_scoped_entry(entry, new_data)
        return self.async_show_form(
            step_id="reconfigure_meteoalarm_country_source",
            data_schema=_country_source_schema(
                tracker_default=entry.data.get(CONF_TRACKER_ENTITY, ""),
                country_default=entry.data.get(CONF_COUNTRY_ENTITY, ""),
                attribute_default=entry.data.get(CONF_COUNTRY_ATTRIBUTE, ""),
            ),
        )

    async def async_step_reconfigure_meteoalarm_region_picker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        country = getattr(self, "_meteoalarm_country", "")
        errors: dict[str, str] = {}

        try:
            regions = await fetch_regions_for_country(
                async_get_clientsession(self.hass),
                country,
                language=_picker_language(self.hass, entry),
            )
        except UpdateFailed:
            return self.async_show_form(
                step_id="reconfigure_meteoalarm_region_picker",
                data_schema=vol.Schema({}),
                errors={"base": "cannot_fetch_regions"},
            )

        fetched = dict(regions)
        stored = dict(entry.data.get(CONF_REGION_LABELS) or {})
        # Carry every stored selection forward, including codes the current
        # fetch doesn't offer (typed-in, or their warning has since expired):
        # they are injected as options so the form can render them as selected.
        existing = _normalize_region_selection(entry.data.get(CONF_REGIONS) or [])

        if not regions and not existing:
            # Nothing to offer and nothing to preserve — same dead end as
            # setup. A quiet feed alone must not abort, or a reconfigure
            # would strand an entry whose regions are simply not live now.
            return self.async_abort(reason="no_regions_available")

        if user_input is not None:
            selected = _normalize_region_selection(user_input.get(CONF_REGIONS) or [])
            if not selected:
                errors["base"] = "no_regions_selected"
            else:
                new_data = {
                    CONF_PROVIDER: "meteoalarm",
                    CONF_COUNTRY: country,
                    CONF_REGIONS: selected,
                    CONF_REGION_LABELS: _region_label_map(selected, fetched, stored),
                }
                return await self._async_update_scoped_entry(entry, new_data)

        extra = [
            (code, stored.get(code) or code) for code in existing if code not in fetched
        ]
        return self.async_show_form(
            step_id="reconfigure_meteoalarm_region_picker",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_REGIONS, default=existing): _region_selector(
                        regions, extra=extra
                    ),
                }
            ),
            errors=errors,
        )
