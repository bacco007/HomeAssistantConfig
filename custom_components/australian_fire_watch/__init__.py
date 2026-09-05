"""Australian Fire Watch integration setup, services and bundled dashboard."""

from __future__ import annotations

import asyncio
from datetime import timedelta
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components.frontend import (
    add_extra_js_url,
    async_register_built_in_panel,
    async_remove_panel,
    remove_extra_js_url,
)
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME, Platform
from homeassistant.core import Event, HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.typing import ConfigType

from .const import (
    CONF_ADVICE_RADIUS,
    CONF_DISTRICT,
    CONF_ENABLE_BOM,
    CONF_EMERGENCY_RADIUS,
    CONF_JURISDICTION,
    CONF_MONITOR_RADIUS,
    CONF_NOTIFY_SERVICES,
    CONF_READINESS_ENTITIES,
    CONF_STALE_AFTER,
    CONF_UNCLASSIFIED_RADIUS,
    CONF_WATCH_RADIUS,
    CONF_WEATHER_ENTITY,
    CONF_ZONE,
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
    FRONTEND_URL_PATH,
    PANEL_ELEMENT,
    PANEL_ICON,
    PANEL_JS_FILE,
    PANEL_SLUG,
    PANEL_TITLE,
    PLATFORMS,
    SERVICE_ACKNOWLEDGE,
    SERVICE_SNOOZE,
    SERVICE_TEST_ALERT,
    VERSION,
)
from .coordinator import FireWatchCoordinator

DATA_ENTRIES = "entries"
DATA_PANEL = "panel_registered"
DATA_FRONTEND_MODULE = "frontend_module_registered"
DATA_PANEL_LOCK = "panel_lock"
DATA_MOBILE_LISTENER = "mobile_listener"


def _notify_list(value: Any) -> list[str]:
    if isinstance(value, str):
        values = value.replace("\n", ",").split(",")
    else:
        values = cv.ensure_list(value)
    result = [str(item).strip() for item in values if str(item).strip()]
    if any(not item.startswith("notify.") for item in result):
        raise vol.Invalid(
            "notification services must be fully-qualified notify.* services"
        )
    return list(dict.fromkeys(result))


def _readiness_list(value: Any) -> list[str]:
    result = [
        cv.entity_id(str(item).strip())
        for item in cv.ensure_list(value)
        if str(item).strip()
    ]
    if any(not item.startswith("input_boolean.") for item in result):
        raise vol.Invalid("readiness entities must be input_boolean entities")
    return list(dict.fromkeys(result))


YAML_ENTRY_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
        vol.Optional(CONF_ZONE, default=DEFAULT_ZONE): cv.entity_id,
        vol.Optional(CONF_JURISDICTION, default=DEFAULT_JURISDICTION): vol.In(
            ("ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA")
        ),
        vol.Optional(CONF_DISTRICT, default=DEFAULT_DISTRICT): vol.Any(
            "", vol.In(FIRE_DANGER_DISTRICTS)
        ),
        vol.Optional(CONF_WEATHER_ENTITY): cv.entity_id,
        vol.Optional(CONF_READINESS_ENTITIES, default=[]): _readiness_list,
        vol.Optional(CONF_NOTIFY_SERVICES, default=[]): _notify_list,
        vol.Optional(CONF_MONITOR_RADIUS, default=DEFAULT_MONITOR_RADIUS_KM): vol.All(
            vol.Coerce(float), vol.Range(min=1, max=500)
        ),
        vol.Optional(
            CONF_EMERGENCY_RADIUS, default=DEFAULT_EMERGENCY_RADIUS_KM
        ): vol.All(vol.Coerce(float), vol.Range(min=1, max=500)),
        vol.Optional(CONF_WATCH_RADIUS, default=DEFAULT_WATCH_RADIUS_KM): vol.All(
            vol.Coerce(float), vol.Range(min=1, max=500)
        ),
        vol.Optional(CONF_ADVICE_RADIUS, default=DEFAULT_ADVICE_RADIUS_KM): vol.All(
            vol.Coerce(float), vol.Range(min=1, max=500)
        ),
        vol.Optional(
            CONF_UNCLASSIFIED_RADIUS, default=DEFAULT_UNCLASSIFIED_RADIUS_KM
        ): vol.All(vol.Coerce(float), vol.Range(min=1, max=500)),
        vol.Optional(CONF_STALE_AFTER, default=DEFAULT_STALE_AFTER_MINUTES): vol.All(
            vol.Coerce(int), vol.Range(min=15, max=180)
        ),
        vol.Optional(CONF_ENABLE_BOM, default=DEFAULT_ENABLE_BOM): cv.boolean,
    },
    extra=vol.PREVENT_EXTRA,
)

CONFIG_SCHEMA = vol.Schema(
    {
        vol.Optional(DOMAIN): vol.Any(
            YAML_ENTRY_SCHEMA, vol.All(cv.ensure_list, [YAML_ENTRY_SCHEMA])
        )
    },
    extra=vol.ALLOW_EXTRA,
)

ACK_SCHEMA = vol.Schema(
    {
        vol.Required("entry_id"): cv.string,
        vol.Required("incident_id"): cv.string,
    }
)
SNOOZE_SCHEMA = ACK_SCHEMA.extend(
    {
        vol.Required("duration_minutes"): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=120)
        )
    }
)
TEST_SCHEMA = vol.Schema(
    {
        vol.Required("entry_id"): cv.string,
        vol.Required("level"): vol.In(["Advice", "Watch and Act", "Emergency Warning"]),
    }
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up integration-level state and import optional YAML config."""
    domain_data = hass.data.setdefault(
        DOMAIN,
        {
            DATA_ENTRIES: {},
            DATA_PANEL: False,
            DATA_FRONTEND_MODULE: False,
            DATA_PANEL_LOCK: asyncio.Lock(),
            DATA_MOBILE_LISTENER: None,
        },
    )
    domain_data.setdefault(DATA_PANEL_LOCK, asyncio.Lock())
    yaml_config = config.get(DOMAIN)
    if yaml_config:
        entries = yaml_config if isinstance(yaml_config, list) else [yaml_config]
        for item in entries:
            hass.async_create_task(
                hass.config_entries.flow.async_init(
                    DOMAIN, context={"source": "import"}, data=dict(item)
                )
            )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up one monitored zone."""
    domain_data = hass.data.setdefault(
        DOMAIN,
        {
            DATA_ENTRIES: {},
            DATA_PANEL: False,
            DATA_FRONTEND_MODULE: False,
            DATA_PANEL_LOCK: asyncio.Lock(),
            DATA_MOBILE_LISTENER: None,
        },
    )
    domain_data.setdefault(DATA_PANEL_LOCK, asyncio.Lock())
    coordinator = FireWatchCoordinator(hass, entry)
    await coordinator.async_initialize()
    await coordinator.async_config_entry_first_refresh()
    domain_data[DATA_ENTRIES][entry.entry_id] = coordinator

    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))
    await hass.config_entries.async_forward_entry_setups(
        entry, [Platform(platform) for platform in PLATFORMS]
    )
    await _async_register_panel(hass)
    _register_services(hass)
    _register_mobile_actions(hass)
    entry.async_on_unload(
        async_track_time_interval(
            hass, coordinator.async_retry_notifications, timedelta(seconds=30)
        )
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload an entry and shared UI/services when the last one leaves."""
    unloaded = await hass.config_entries.async_unload_platforms(
        entry, [Platform(platform) for platform in PLATFORMS]
    )
    if not unloaded:
        return False
    domain_data = hass.data[DOMAIN]
    domain_data[DATA_ENTRIES].pop(entry.entry_id, None)
    if not domain_data[DATA_ENTRIES]:
        for service in (SERVICE_ACKNOWLEDGE, SERVICE_SNOOZE, SERVICE_TEST_ALERT):
            hass.services.async_remove(DOMAIN, service)
        if remove := domain_data.get(DATA_MOBILE_LISTENER):
            remove()
            domain_data[DATA_MOBILE_LISTENER] = None
        if domain_data.get(DATA_PANEL):
            async_remove_panel(hass, PANEL_SLUG)
            domain_data[DATA_PANEL] = False
        if domain_data.get(DATA_FRONTEND_MODULE):
            remove_extra_js_url(hass, _frontend_module_url())
            domain_data[DATA_FRONTEND_MODULE] = False
    return True


async def _async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def _async_register_panel(hass: HomeAssistant) -> None:
    data = hass.data[DOMAIN]
    async with data.setdefault(DATA_PANEL_LOCK, asyncio.Lock()):
        if data.get(DATA_PANEL):
            return
        frontend_dir = Path(__file__).parent / "frontend"
        panel_file = frontend_dir / PANEL_JS_FILE
        if not panel_file.is_file():
            # HACS should ship the bundle. Keeping the backend usable makes a
            # missing/corrupt frontend recoverable through entities/services.
            return
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(FRONTEND_URL_PATH, str(frontend_dir), False)]
            )
        except RuntimeError:
            # Static paths survive config-entry reloads until HA restarts.
            pass
        module_url = _frontend_module_url()
        if not data.get(DATA_FRONTEND_MODULE):
            # The panel js_url loads only after that panel is opened. This also
            # makes the masonry card available on a cold Home dashboard.
            add_extra_js_url(hass, module_url)
            data[DATA_FRONTEND_MODULE] = True
        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title=PANEL_TITLE,
            sidebar_icon=PANEL_ICON,
            frontend_url_path=PANEL_SLUG,
            config={
                "_panel_custom": {
                    "name": PANEL_ELEMENT,
                    "embed_iframe": False,
                    "trust_external": False,
                    "js_url": module_url,
                }
            },
            require_admin=False,
        )
        data[DATA_PANEL] = True


def _frontend_module_url() -> str:
    """Return the cache-busted same-origin frontend module URL."""
    return f"{FRONTEND_URL_PATH}/{PANEL_JS_FILE}?v={VERSION}"


def _coordinator(hass: HomeAssistant, entry_id: str) -> FireWatchCoordinator:
    coordinator = hass.data.get(DOMAIN, {}).get(DATA_ENTRIES, {}).get(entry_id)
    if coordinator is None:
        raise HomeAssistantError(
            f"Australian Fire Watch entry is not loaded: {entry_id}"
        )
    return coordinator


def _register_services(hass: HomeAssistant) -> None:
    if hass.services.has_service(DOMAIN, SERVICE_ACKNOWLEDGE):
        return

    async def acknowledge(call: ServiceCall) -> None:
        await _coordinator(hass, call.data["entry_id"]).async_acknowledge(
            call.data["incident_id"]
        )

    async def snooze(call: ServiceCall) -> None:
        await _coordinator(hass, call.data["entry_id"]).async_snooze(
            call.data["incident_id"], call.data["duration_minutes"]
        )

    async def test_alert(call: ServiceCall) -> None:
        await _coordinator(hass, call.data["entry_id"]).async_test_alert(
            call.data["level"]
        )

    hass.services.async_register(
        DOMAIN, SERVICE_ACKNOWLEDGE, acknowledge, schema=ACK_SCHEMA
    )
    hass.services.async_register(DOMAIN, SERVICE_SNOOZE, snooze, schema=SNOOZE_SCHEMA)
    hass.services.async_register(
        DOMAIN, SERVICE_TEST_ALERT, test_alert, schema=TEST_SCHEMA
    )


def _register_mobile_actions(hass: HomeAssistant) -> None:
    data = hass.data[DOMAIN]
    if data.get(DATA_MOBILE_LISTENER):
        return

    @callback
    def mobile_action(event: Event) -> None:
        action = str(event.data.get("action", ""))
        parts = action.split("|")
        if len(parts) < 3 or parts[0] not in {
            "AUSTRALIAN_FIRE_WATCH_ACK",
            "AUSTRALIAN_FIRE_WATCH_SNOOZE",
        }:
            return
        coordinator = data[DATA_ENTRIES].get(parts[1])
        if coordinator is None:
            return
        if parts[0] == "AUSTRALIAN_FIRE_WATCH_ACK" and len(parts) == 3:
            hass.async_create_task(coordinator.async_acknowledge(parts[2]))
        elif parts[0] == "AUSTRALIAN_FIRE_WATCH_SNOOZE" and len(parts) == 4:
            try:
                minutes = int(parts[3])
            except ValueError:
                return
            hass.async_create_task(coordinator.async_snooze(parts[2], minutes))

    data[DATA_MOBILE_LISTENER] = hass.bus.async_listen(
        "mobile_app_notification_action", mobile_action
    )
