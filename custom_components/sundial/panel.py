"""Web-ui backend for Sundial: static asset, sidebar panel, WebSocket API.

The Lit panel (served from ``frontend/dist``) talks to these WebSocket commands
to read and write the stored configuration. All mutations go through the
coordinator so the running adaptation reflects changes immediately.
"""

from __future__ import annotations

import hashlib
import os

from homeassistant.components import frontend, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.loader import async_get_integration
import voluptuous as vol

from .const import (
    DEFAULT_SCHEMA_ID,
    DOMAIN,
    PANEL_ELEMENT,
    PANEL_ICON,
    PANEL_STATIC_PATH,
    PANEL_TITLE,
    PANEL_URL_PATH,
)
from .coordinator import SundialCoordinator, get_coordinator
from .models import GlobalSettings, Schema, StoreData

# The manifest version, resolved once at panel setup (single instance) so the
# sync payload builder can include it.
_version: str = ""


def _bundle_token(path: str) -> str:
    """Short content hash of the built bundle, for cache-busting the panel URL."""
    try:
        with open(path, "rb") as handle:
            return hashlib.md5(handle.read()).hexdigest()[:8]  # noqa: S324
    except OSError:
        return "0"


async def async_setup_panel(
    hass: HomeAssistant, coordinator: SundialCoordinator
) -> None:
    """Serve the bundle, register the sidebar panel, and the WS commands."""
    global _version  # noqa: PLW0603
    integration = await async_get_integration(hass, DOMAIN)
    _version = str(integration.version or "")

    js_path = os.path.join(
        os.path.dirname(__file__), "frontend", "dist", "sundial-panel.js"
    )
    await hass.http.async_register_static_paths(
        [StaticPathConfig(PANEL_STATIC_PATH, js_path, False)]
    )
    # Hash the bundle so the browser always fetches a new build.
    token = await hass.async_add_executor_job(_bundle_token, js_path)
    module_url = f"{PANEL_STATIC_PATH}?v={token}"

    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL_PATH,
        require_admin=True,
        config={
            "_panel_custom": {
                "name": PANEL_ELEMENT,
                "embed_iframe": False,
                "trust_external": False,
                "module_url": module_url,
            }
        },
    )

    _register_ws_commands(hass)


def async_remove_panel(hass: HomeAssistant) -> None:
    frontend.async_remove_panel(hass, PANEL_URL_PATH)


# --- payload helpers ---------------------------------------------------------


def _lights_payload(hass: HomeAssistant, coordinator: SundialCoordinator) -> list[dict]:
    ent_reg = er.async_get(hass)
    area_reg = ar.async_get(hass)
    dev_reg = dr.async_get(hass)
    lights = []
    for entity_id in coordinator.controlled_lights:
        state = hass.states.get(entity_id)
        # Resolve area name via entity -> device -> area chain
        area_name: str | None = None
        if entry := ent_reg.async_get(entity_id):
            area_id = entry.area_id
            if (
                area_id is None
                and entry.device_id
                and (device := dev_reg.async_get(entry.device_id))
            ):
                area_id = device.area_id
            if area_id and (area := area_reg.async_get_area(area_id)):
                area_name = area.name
        attrs = state.attributes if state else {}
        lights.append(
            {
                "entity_id": entity_id,
                "name": state.name if state else entity_id,
                "area_name": area_name,
                "supports_rgb": coordinator.supports_rgb(entity_id),
                # The bulb's own supported colour-temperature range (None for
                # RGB-only lights or while unavailable) — the editor uses it
                # as the default bounds.
                "min_color_temp_kelvin": attrs.get("min_color_temp_kelvin"),
                "max_color_temp_kelvin": attrs.get("max_color_temp_kelvin"),
            }
        )
    # Group by area (unassigned last), then alphabetically by name.
    lights.sort(
        key=lambda light: (
            light["area_name"] is None,
            (light["area_name"] or "").casefold(),
            light["name"].casefold(),
        )
    )
    return lights


def _config_payload(hass: HomeAssistant, coordinator: SundialCoordinator) -> dict:
    data = coordinator.data
    return {
        "settings": data.settings.to_dict(),
        "schemas": {sid: schema.to_dict() for sid, schema in data.schemas.items()},
        "active_schema_id": data.active_schema_id,
        "lights": _lights_payload(hass, coordinator),
        # The home's configured coordinates — the fallback when the settings
        # leave latitude/longitude blank (shown as the fields' placeholder).
        "home_latitude": hass.config.latitude,
        "home_longitude": hass.config.longitude,
        "version": _version,
    }


def _error_if_not_ready(connection, msg) -> SundialCoordinator | None:
    coordinator = get_coordinator(connection.hass)
    if coordinator is None:
        connection.send_error(msg["id"], "not_ready", "Integration not set up")
        return None
    return coordinator


# --- WebSocket commands ------------------------------------------------------


def _register_ws_commands(hass: HomeAssistant) -> None:
    for handler in (
        ws_get_config,
        ws_update_settings,
        ws_save_schema,
        ws_delete_schema,
        ws_set_active_schema,
        ws_timeline,
        ws_preview,
        ws_apply,
        ws_export,
        ws_import,
    ):
        websocket_api.async_register_command(hass, handler)


@websocket_api.websocket_command({vol.Required("type"): "sundial/get_config"})
@websocket_api.async_response
async def ws_get_config(hass, connection, msg) -> None:
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is not None:
        connection.send_result(msg["id"], _config_payload(hass, coordinator))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "sundial/update_settings",
        vol.Required("settings"): dict,
    }
)
@websocket_api.async_response
async def ws_update_settings(hass, connection, msg) -> None:
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is None:
        return
    merged = coordinator.data.settings.to_dict()
    merged.update(msg["settings"])
    coordinator.data.settings = GlobalSettings.from_dict(merged)
    await coordinator.async_apply_config_change()
    connection.send_result(msg["id"], _config_payload(hass, coordinator))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "sundial/save_schema",
        vol.Required("schema"): dict,
    }
)
@websocket_api.async_response
async def ws_save_schema(hass, connection, msg) -> None:
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is None:
        return
    if not msg["schema"].get("id"):
        connection.send_error(msg["id"], "invalid_schema", "Schema id is required")
        return
    schema = Schema.from_dict(msg["schema"])
    coordinator.data.schemas[schema.id] = schema
    await coordinator.async_apply_config_change()
    connection.send_result(msg["id"], _config_payload(hass, coordinator))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "sundial/delete_schema",
        vol.Required("schema_id"): str,
    }
)
@websocket_api.async_response
async def ws_delete_schema(hass, connection, msg) -> None:
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is None:
        return
    schema_id = msg["schema_id"]
    if schema_id == DEFAULT_SCHEMA_ID:
        connection.send_error(
            msg["id"], "invalid_schema", "The default schema cannot be deleted"
        )
        return
    coordinator.data.schemas.pop(schema_id, None)
    if coordinator.data.active_schema_id == schema_id:
        coordinator.data.active_schema_id = DEFAULT_SCHEMA_ID
    await coordinator.async_apply_config_change()
    connection.send_result(msg["id"], _config_payload(hass, coordinator))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "sundial/set_active_schema",
        vol.Required("schema_id"): str,
    }
)
@websocket_api.async_response
async def ws_set_active_schema(hass, connection, msg) -> None:
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is None:
        return
    coordinator.set_active_schema(msg["schema_id"])
    await coordinator.async_apply_config_change()
    connection.send_result(msg["id"], _config_payload(hass, coordinator))


def _resolve_schema(coordinator: SundialCoordinator, msg) -> Schema | None:
    """The inline draft ``schema`` if given, else the stored one by id."""
    if msg.get("schema"):
        return Schema.from_dict(msg["schema"])
    return coordinator.data.schemas.get(msg.get("schema_id"))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "sundial/timeline",
        vol.Optional("schema_id"): str,
        vol.Optional("schema"): dict,
    }
)
@websocket_api.async_response
async def ws_timeline(hass, connection, msg) -> None:
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is None:
        return
    schema = _resolve_schema(coordinator, msg)
    if schema is None:
        connection.send_error(msg["id"], "not_found", "Unknown schema")
        return
    connection.send_result(msg["id"], coordinator.compute_timeline(schema))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "sundial/preview",
        vol.Optional("schema_id"): str,
        vol.Optional("schema"): dict,
        vol.Required("hour"): vol.Coerce(float),
        vol.Optional("apply", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_preview(hass, connection, msg) -> None:
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is None:
        return
    schema = _resolve_schema(coordinator, msg) or coordinator.data.active_schema
    targets = await coordinator.async_preview(schema, msg["hour"], msg["apply"])
    connection.send_result(msg["id"], {"targets": targets})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "sundial/apply",
        vol.Optional("entity_id"): vol.Any(str, [str], None),
    }
)
@websocket_api.async_response
async def ws_apply(hass, connection, msg) -> None:
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is None:
        return
    raw = msg.get("entity_id")
    entity_ids = [raw] if isinstance(raw, str) else raw
    await coordinator.async_apply(entity_ids)
    connection.send_result(msg["id"], _config_payload(hass, coordinator))


@websocket_api.websocket_command({vol.Required("type"): "sundial/export"})
@websocket_api.async_response
async def ws_export(hass, connection, msg) -> None:
    """The raw store document, used by the panel's backup download."""
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is not None:
        connection.send_result(msg["id"], coordinator.data.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): "sundial/import",
        vol.Required("data"): dict,
    }
)
@websocket_api.async_response
async def ws_import(hass, connection, msg) -> None:
    """Restore a previously exported configuration.

    ``StoreData.from_dict`` normalises everything (unknown keys are dropped,
    hour cells coerced, a default schema guaranteed), so a malformed file
    degrades to defaults rather than corrupting the store.
    """
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is None:
        return
    coordinator.store.data = StoreData.from_dict(msg["data"])
    await coordinator.async_apply_config_change()
    connection.send_result(msg["id"], _config_payload(hass, coordinator))
