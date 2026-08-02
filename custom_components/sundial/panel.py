"""Web-ui backend for Sundial: static asset, sidebar panel, WebSocket API.

The Lit panel (served from ``frontend/dist``) talks to these WebSocket commands
to read and write the stored configuration. All mutations go through the
coordinator so the running adaptation reflects changes immediately.
"""

from __future__ import annotations

from datetime import datetime
import hashlib
import os

from homeassistant.components import frontend, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_COLOR_MODE,
    ATTR_COLOR_TEMP_KELVIN,
    ATTR_RGB_COLOR,
    ATTR_SUPPORTED_COLOR_MODES,
)
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.loader import async_get_integration
import homeassistant.util.dt as dt_util
import voluptuous as vol

from . import engine
from .const import (
    DEFAULT_SCHEMA_ID,
    DOMAIN,
    PANEL_ELEMENT,
    PANEL_ICON,
    PANEL_STATIC_PATH,
    PANEL_TITLE,
    PANEL_URL_PATH,
)
from .coordinator import SundialCoordinator, get_coordinator, local_hour
from .engine import Target
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
        _, supports_color_temp, supports_rgb = coordinator.supported_modes(entity_id)
        lights.append(
            {
                "entity_id": entity_id,
                "name": state.name if state else entity_id,
                "area_name": area_name,
                "supports_rgb": supports_rgb,
                # A light that can render neither a colour temperature nor an
                # RGB colour only takes brightness — the editor hides its
                # colour controls and the timeline drops the warmth colouring.
                "supports_color_temp": supports_color_temp,
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


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


def _values_payload(
    brightness_pct: int | None,
    color_temp_kelvin: int | None,
    rgb_color=None,
) -> dict:
    return {
        "brightness_pct": brightness_pct,
        "color_temp_kelvin": color_temp_kelvin,
        "rgb_color": list(rgb_color) if rgb_color else None,
    }


def _target_payload(target: Target | None) -> dict | None:
    if target is None:
        return None
    return _values_payload(
        target.brightness_pct, target.color_temp_kelvin, target.rgb_color
    )


def _reported_payload(state) -> dict:
    """What the light itself currently reports, in our own units."""
    attrs = state.attributes if state else {}
    brightness = attrs.get(ATTR_BRIGHTNESS)
    payload = _values_payload(
        round(brightness / 255 * 100) if brightness is not None else None,
        attrs.get(ATTR_COLOR_TEMP_KELVIN),
        attrs.get(ATTR_RGB_COLOR),
    )
    payload["color_mode"] = attrs.get(ATTR_COLOR_MODE)
    return payload


def _light_status(
    hass: HomeAssistant, coordinator: SundialCoordinator, entity_id: str, now: datetime
) -> dict:
    state = hass.states.get(entity_id)
    rt = coordinator.runtime(entity_id)
    brightness, color_temp, rgb = coordinator.supported_modes(entity_id)
    cfg = coordinator.data.active_schema.light_config(entity_id)
    attrs = state.attributes if state else {}
    return {
        "state": state.state if state else None,
        "manual_control": bool(rt and rt.manual_control),
        "manual_reason": rt.manual_reason if rt else None,
        "manual_since": _iso(rt.manual_since if rt else None),
        "auto_reset_at": _iso(rt.auto_reset_at if rt else None),
        "target": _target_payload(coordinator.compute_target(entity_id, now)),
        "reported": _reported_payload(state),
        "last_applied": _target_payload(rt.last_target if rt else None),
        "last_applied_at": _iso(rt.last_applied_at if rt else None),
        "last_evaluated_at": _iso(rt.last_evaluated_at if rt else None),
        "last_outcome": rt.last_outcome if rt else None,
        "settling": coordinator.is_settling(entity_id),
        "supports": {
            "brightness": brightness,
            "color_temp": color_temp,
            "rgb": rgb,
        },
        "supported_color_modes": list(attrs.get(ATTR_SUPPORTED_COLOR_MODES) or []),
        "config": {
            "min_brightness": cfg.min_brightness,
            "max_brightness": cfg.max_brightness,
            "min_color_temp": cfg.min_color_temp,
            "max_color_temp": cfg.max_color_temp,
            "limit_mode": cfg.limit_mode,
            "render_mode": cfg.render_mode,
            "separate_turn_on_commands": cfg.separate_turn_on_commands,
        },
    }


def _sun_status(
    hass: HomeAssistant, coordinator: SundialCoordinator, now: datetime
) -> dict:
    sun = coordinator.data.active_schema.sun
    snap, drive = coordinator.sun_state(sun, now)
    sun_brightness, sun_color_temp = engine.drive_to_values(
        drive,
        sun.min_brightness,
        sun.max_brightness,
        sun.min_color_temp,
        sun.max_color_temp,
    )
    settings = coordinator.settings
    custom_coords = (
        settings.sun_latitude is not None and settings.sun_longitude is not None
    )
    return {
        "position": round(snap.position, 4),
        "is_day": snap.is_day,
        "nearest_sunrise": _iso(snap.nearest_sunrise),
        "nearest_sunset": _iso(snap.nearest_sunset),
        "sunrise_source": "fixed" if sun.sunrise_time else "astral",
        "sunset_source": "fixed" if sun.sunset_time else "astral",
        "latitude": settings.sun_latitude if custom_coords else hass.config.latitude,
        "longitude": settings.sun_longitude if custom_coords else hass.config.longitude,
        "coordinates_source": "settings" if custom_coords else "home",
        "drive": {
            "brightness": round(drive.brightness, 4),
            "warmth": round(drive.warmth, 4),
        },
        "values": _values_payload(
            int(round(sun_brightness)), int(round(sun_color_temp / 5) * 5)
        ),
    }


def _status_payload(hass: HomeAssistant, coordinator: SundialCoordinator) -> dict:
    """A live snapshot of what the integration is doing, for the panel's
    per-item Status section. Read-only and never persisted."""
    now = dt_util.utcnow()
    schema = coordinator.data.active_schema
    lights = {
        entity_id: _light_status(hass, coordinator, entity_id, now)
        for entity_id in coordinator.controlled_lights
    }
    return {
        "now": now.isoformat(),
        "local_hour": round(local_hour(now), 4),
        "sun": _sun_status(hass, coordinator, now),
        "lights": lights,
        "global": {
            "enabled": coordinator.enabled,
            "active_schema_id": schema.id,
            "active_schema_name": schema.name,
            "interval": coordinator.settings.interval,
            "transition": coordinator.settings.transition,
            "initial_transition": coordinator.settings.initial_transition,
            "take_over_control": coordinator.settings.take_over_control,
            "autoreset_control": coordinator.settings.autoreset_control,
            "last_pass_at": _iso(coordinator.last_pass_at),
            "next_pass_at": _iso(coordinator.next_pass_at),
            "pass_running": coordinator.pass_running,
            "light_count": len(lights),
            "manual_count": sum(1 for s in lights.values() if s["manual_control"]),
            "unavailable_count": sum(
                1
                for s in lights.values()
                if s["state"] in (None, STATE_UNAVAILABLE, STATE_UNKNOWN)
            ),
        },
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
        ws_status,
        ws_set_manual_control,
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


@websocket_api.websocket_command({vol.Required("type"): "sundial/status"})
@websocket_api.async_response
async def ws_status(hass, connection, msg) -> None:
    """Live diagnostics for the panel's Status section (polled while open)."""
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is not None:
        connection.send_result(msg["id"], _status_payload(hass, coordinator))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "sundial/set_manual_control",
        vol.Required("entity_id"): str,
        vol.Required("manual"): bool,
    }
)
@websocket_api.async_response
async def ws_set_manual_control(hass, connection, msg) -> None:
    """Hand a light back to the schedule (or take it away) from the panel.

    Returns the refreshed status so the section updates immediately instead of
    waiting for the next poll.
    """
    coordinator = _error_if_not_ready(connection, msg)
    if coordinator is None:
        return
    coordinator.set_manual_control(msg["entity_id"], msg["manual"])
    connection.send_result(msg["id"], _status_payload(hass, coordinator))
