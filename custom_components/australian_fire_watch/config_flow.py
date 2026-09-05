"""Config and options flows for Australian Fire Watch."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector

from .const import (
    CONF_ADVICE_RADIUS,
    CONF_DISTRICT,
    CONF_ENABLE_BOM,
    CONF_EMERGENCY_RADIUS,
    CONF_JURISDICTION,
    CONF_MONITOR_RADIUS,
    CONF_NAME,
    CONF_NOTIFY_SERVICES,
    CONF_READINESS_ENTITIES,
    CONF_STALE_AFTER,
    CONF_UNCLASSIFIED_RADIUS,
    CONF_WATCH_RADIUS,
    CONF_WEATHER_ENTITY,
    CONF_ZONE,
    CONFIG_ENTRY_VERSION,
    DEFAULT_ADVICE_RADIUS_KM,
    DEFAULT_DISTRICT,
    DEFAULT_ENABLE_BOM,
    DEFAULT_EMERGENCY_RADIUS_KM,
    DEFAULT_JURISDICTION,
    DEFAULT_MONITOR_RADIUS_KM,
    DEFAULT_NAME,
    DEFAULT_STALE_AFTER_MINUTES,
    DEFAULT_UNCLASSIFIED_RADIUS_KM,
    DEFAULT_WATCH_RADIUS_KM,
    DEFAULT_ZONE,
    DOMAIN,
    FIRE_DANGER_DISTRICTS,
    config_entry_unique_id,
)
from .jurisdictions import JURISDICTION_OPTIONS


def _notify_list(value: Any) -> list[str]:
    if isinstance(value, str):
        values = value.replace("\n", ",").split(",")
    elif isinstance(value, list):
        values = value
    else:
        values = []
    return list(
        dict.fromkeys(str(item).strip() for item in values if str(item).strip())
    )


def _schema(defaults: dict[str, Any]) -> vol.Schema:
    notify_default = defaults.get(CONF_NOTIFY_SERVICES, [])
    if isinstance(notify_default, list):
        notify_default = "\n".join(notify_default)
    fields: dict[Any, Any] = {
        vol.Required(
            CONF_NAME, default=defaults.get(CONF_NAME, DEFAULT_NAME)
        ): selector.TextSelector(),
        vol.Required(
            CONF_ZONE, default=defaults.get(CONF_ZONE, DEFAULT_ZONE)
        ): selector.EntitySelector(selector.EntitySelectorConfig(domain="zone")),
        vol.Required(
            CONF_JURISDICTION,
            default=defaults.get(CONF_JURISDICTION, DEFAULT_JURISDICTION),
        ): selector.SelectSelector(
            selector.SelectSelectorConfig(
                options=list(JURISDICTION_OPTIONS),
                mode=selector.SelectSelectorMode.DROPDOWN,
            )
        ),
        vol.Optional(
            CONF_DISTRICT,
            default=defaults.get(CONF_DISTRICT, DEFAULT_DISTRICT),
        ): selector.SelectSelector(
            selector.SelectSelectorConfig(
                options=list(FIRE_DANGER_DISTRICTS),
                mode=selector.SelectSelectorMode.DROPDOWN,
            )
        ),
        vol.Optional(
            CONF_WEATHER_ENTITY,
            description={"suggested_value": defaults.get(CONF_WEATHER_ENTITY)},
        ): selector.EntitySelector(selector.EntitySelectorConfig(domain="weather")),
        vol.Optional(
            CONF_READINESS_ENTITIES,
            description={"suggested_value": defaults.get(CONF_READINESS_ENTITIES, [])},
        ): selector.EntitySelector(
            selector.EntitySelectorConfig(
                domain="input_boolean", multiple=True, reorder=True
            )
        ),
        vol.Optional(
            CONF_NOTIFY_SERVICES,
            description={"suggested_value": notify_default},
        ): selector.TextSelector(selector.TextSelectorConfig(multiline=True)),
        vol.Required(
            CONF_MONITOR_RADIUS,
            default=defaults.get(CONF_MONITOR_RADIUS, DEFAULT_MONITOR_RADIUS_KM),
        ): _radius_selector(500),
        vol.Required(
            CONF_EMERGENCY_RADIUS,
            default=defaults.get(CONF_EMERGENCY_RADIUS, DEFAULT_EMERGENCY_RADIUS_KM),
        ): _radius_selector(500),
        vol.Required(
            CONF_WATCH_RADIUS,
            default=defaults.get(CONF_WATCH_RADIUS, DEFAULT_WATCH_RADIUS_KM),
        ): _radius_selector(500),
        vol.Required(
            CONF_ADVICE_RADIUS,
            default=defaults.get(CONF_ADVICE_RADIUS, DEFAULT_ADVICE_RADIUS_KM),
        ): _radius_selector(500),
        vol.Required(
            CONF_UNCLASSIFIED_RADIUS,
            default=defaults.get(
                CONF_UNCLASSIFIED_RADIUS, DEFAULT_UNCLASSIFIED_RADIUS_KM
            ),
        ): _radius_selector(500),
        vol.Required(
            CONF_STALE_AFTER,
            default=defaults.get(CONF_STALE_AFTER, DEFAULT_STALE_AFTER_MINUTES),
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=15,
                max=180,
                step=5,
                unit_of_measurement="min",
                mode=selector.NumberSelectorMode.BOX,
            )
        ),
        vol.Required(
            CONF_ENABLE_BOM,
            default=defaults.get(CONF_ENABLE_BOM, DEFAULT_ENABLE_BOM),
        ): selector.BooleanSelector(),
    }
    return vol.Schema(fields)


def _radius_selector(maximum: int) -> selector.NumberSelector:
    return selector.NumberSelector(
        selector.NumberSelectorConfig(
            min=1,
            max=maximum,
            step=1,
            unit_of_measurement="km",
            mode=selector.NumberSelectorMode.BOX,
        )
    )


def _prepare(data: dict[str, Any]) -> dict[str, Any]:
    result = dict(data)
    result[CONF_JURISDICTION] = str(
        result.get(CONF_JURISDICTION, DEFAULT_JURISDICTION)
    ).upper()
    if result[CONF_JURISDICTION] != "NSW":
        # District products are NSW-only in this release. Never display an NSW
        # district rating for a location configured in another jurisdiction.
        result[CONF_DISTRICT] = ""
    result[CONF_NOTIFY_SERVICES] = _notify_list(result.get(CONF_NOTIFY_SERVICES, []))
    readiness = result.get(CONF_READINESS_ENTITIES, [])
    result[CONF_READINESS_ENTITIES] = (
        list(readiness) if isinstance(readiness, list) else []
    )
    if not result.get(CONF_WEATHER_ENTITY):
        result.pop(CONF_WEATHER_ENTITY, None)
    for key in (
        CONF_MONITOR_RADIUS,
        CONF_EMERGENCY_RADIUS,
        CONF_WATCH_RADIUS,
        CONF_ADVICE_RADIUS,
        CONF_UNCLASSIFIED_RADIUS,
    ):
        result[key] = float(result[key])
    result[CONF_STALE_AFTER] = int(result[CONF_STALE_AFTER])
    return result


def _valid(data: dict[str, Any]) -> bool:
    services = _notify_list(data.get(CONF_NOTIFY_SERVICES, []))
    if any(not item.startswith("notify.") for item in services):
        return False
    monitor = float(data[CONF_MONITOR_RADIUS])
    radii = [
        float(data[CONF_EMERGENCY_RADIUS]),
        float(data[CONF_WATCH_RADIUS]),
        float(data[CONF_ADVICE_RADIUS]),
        float(data[CONF_UNCLASSIFIED_RADIUS]),
    ]
    return monitor >= max(radii)


class FireWatchConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Configure a monitored zone without accounts or API keys."""

    VERSION = CONFIG_ENTRY_VERSION

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            if _valid(user_input):
                data = _prepare(user_input)
                unique = config_entry_unique_id(data)
                await self.async_set_unique_id(unique)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(title=data[CONF_NAME], data=data)
            errors["base"] = "invalid_settings"
        return self.async_show_form(
            step_id="user", data_schema=_schema(user_input or {}), errors=errors
        )

    async def async_step_import(self, user_input: dict[str, Any]) -> FlowResult:
        data = _prepare(user_input)
        unique = config_entry_unique_id(data)

        # YAML import runs at every startup. Compare the identity derived from
        # entry data as well as its stored unique ID so the import is idempotent.
        for entry in self._async_current_entries():
            if (
                entry.unique_id == unique
                or config_entry_unique_id(entry.data) == unique
            ):
                self.hass.config_entries.async_update_entry(
                    entry,
                    data=data,
                    unique_id=unique,
                    version=CONFIG_ENTRY_VERSION,
                )
                return self.async_abort(reason="already_configured")

        await self.async_set_unique_id(unique)
        self._abort_if_unique_id_configured(updates=data)
        return self.async_create_entry(title=data[CONF_NAME], data=data)

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        return FireWatchOptionsFlow(config_entry)


class FireWatchOptionsFlow(config_entries.OptionsFlow):
    """Edit all zone/radius/notification inputs."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self._entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            if _valid(user_input):
                return self.async_create_entry(title="", data=_prepare(user_input))
            errors["base"] = "invalid_settings"
        defaults = {**dict(self._entry.data), **dict(self._entry.options)}
        return self.async_show_form(
            step_id="init", data_schema=_schema(user_input or defaults), errors=errors
        )
