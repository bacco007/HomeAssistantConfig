"""Hass Data Points - Record custom data points with chart annotations."""

from __future__ import annotations

from pathlib import Path

import voluptuous as vol
from homeassistant.components import panel_custom
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from . import websocket_api as ws_api
from .anomaly_cache import AnomalyCache
from .const import (
    ATTR_ANNOTATION,
    ATTR_AREA_IDS,
    ATTR_COLOR,
    ATTR_DATE,
    ATTR_DEV,
    ATTR_DEVICE_IDS,
    ATTR_ENTITY_IDS,
    ATTR_ICON,
    ATTR_LABEL_IDS,
    ATTR_MESSAGE,
    DOMAIN,
    EVENT_RECORDED,
    FRONTEND_URL,
    PANEL_COMPONENT,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL_PATH,
    SERVICE_RECORD,
)
from .store import DatapointsStore

CONFIG_SCHEMA = cv.empty_config_schema(__name__)

type DatapointsConfigEntry = ConfigEntry[DatapointsStore]

PLATFORMS: list[Platform] = [Platform.SENSOR]


def _find_automation_id(hass: HomeAssistant, context) -> str | None:
    """Return the entity_id of the automation that triggered *context*, or None.

    When a service is called from an automation action the call's context (or
    its parent context) is the same context object under which the automation
    last ran.  We scan all automation states and return the first whose stored
    context id matches either the call context id or its parent id.
    """
    if context is None:
        return None

    context_ids: set[str] = set()
    if context.id:
        context_ids.add(context.id)
    if context.parent_id:
        context_ids.add(context.parent_id)

    for state in hass.states.async_all("automation"):
        if state.context.id in context_ids:
            return state.entity_id

    return None


SERVICE_RECORD_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_MESSAGE): vol.All(
            cv.string, vol.Length(max=ws_api._MAX_LEN_MESSAGE)
        ),
        vol.Optional(ATTR_ANNOTATION): vol.All(
            cv.string, vol.Length(max=ws_api._MAX_LEN_MESSAGE)
        ),
        vol.Optional(ATTR_ENTITY_IDS): vol.All(cv.ensure_list, [cv.entity_id]),
        vol.Optional(ATTR_DEVICE_IDS): vol.All(cv.ensure_list, [cv.string]),
        vol.Optional(ATTR_AREA_IDS): vol.All(cv.ensure_list, [cv.string]),
        vol.Optional(ATTR_LABEL_IDS): vol.All(cv.ensure_list, [cv.string]),
        vol.Optional(ATTR_ICON): vol.All(
            cv.string,
            vol.Length(max=ws_api._MAX_LEN_ICON),
            vol.Match(ws_api._RE_MDI_ICON),
        ),
        vol.Optional(ATTR_COLOR): vol.Any(
            vol.All(
                cv.string,
                vol.Length(max=ws_api._MAX_LEN_COLOR),
                vol.Match(ws_api._RE_HEX_COLOR),
            ),
            vol.All(
                [vol.Coerce(int)],
                vol.Length(min=3, max=3),
            ),
        ),
        vol.Optional(ATTR_DATE): cv.string,
        vol.Optional(ATTR_DEV): cv.boolean,
    }
)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up static resources shared across all config entries."""
    # Serve the frontend card JS file
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_URL,
                str(Path(__file__).parent / "hass-datapoints-cards.js"),
                cache_headers=False,
            )
        ]
    )

    # Auto-register as a Lovelace module resource so cards are immediately available
    add_extra_js_url(hass, FRONTEND_URL)

    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_COMPONENT,
        frontend_url_path=PANEL_URL_PATH,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=FRONTEND_URL,
        require_admin=False,
    )

    return True


async def async_setup_entry(hass: HomeAssistant, entry: DatapointsConfigEntry) -> bool:
    """Set up Hass Data Points from a config entry."""
    store = DatapointsStore(hass)
    await store.async_load()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["store"] = store

    # Initialise anomaly result cache (SQLite, run in executor).
    db_path = hass.config.path(".storage", "hass_datapoints_cache.db")
    cache = AnomalyCache(db_path)
    await hass.async_add_executor_job(cache.purge_old)
    hass.data[DOMAIN]["anomaly_cache"] = cache

    # Register the record service
    async def handle_record(call: ServiceCall) -> None:
        color = call.data.get(ATTR_COLOR)
        # Convert RGB list [R, G, B] to hex string
        if isinstance(color, list) and len(color) == 3:
            color = "#{:02x}{:02x}{:02x}".format(*color)

        automation_id = _find_automation_id(hass, call.context)

        # For user-initiated calls, filter entity_ids to those the caller is
        # permitted to read.  Automation / system calls (no user_id) bypass
        # this check so they can tag events with any entity.
        entity_ids = call.data.get(ATTR_ENTITY_IDS)
        if call.context.user_id:
            user = await hass.auth.async_get_user(call.context.user_id)
            if user is not None and not user.is_admin and entity_ids:
                entity_ids = [
                    eid for eid in entity_ids if ws_api._can_read_entity(user, eid)
                ]

        event_data = await store.async_record(
            message=call.data[ATTR_MESSAGE],
            annotation=call.data.get(ATTR_ANNOTATION),
            entity_ids=entity_ids,
            device_ids=call.data.get(ATTR_DEVICE_IDS),
            area_ids=call.data.get(ATTR_AREA_IDS),
            label_ids=call.data.get(ATTR_LABEL_IDS),
            icon=call.data.get(ATTR_ICON),
            color=color,
            date=call.data.get(ATTR_DATE),
            dev=call.data.get(ATTR_DEV, False),
            automation_id=automation_id,
        )
        hass.bus.async_fire(EVENT_RECORDED, event_data)

    hass.services.async_register(
        DOMAIN, SERVICE_RECORD, handle_record, schema=SERVICE_RECORD_SCHEMA
    )

    # Register websocket commands used by the frontend cards
    ws_api.async_register_commands(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: DatapointsConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    hass.services.async_remove(DOMAIN, SERVICE_RECORD)
    hass.data[DOMAIN].pop("store", None)
    hass.data[DOMAIN].pop("anomaly_cache", None)
    return unload_ok
