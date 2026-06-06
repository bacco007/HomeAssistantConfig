"""
Endpoint HTTP per il panel web di Orphan Entity Cleaner.
Registra le route direttamente su aiohttp.
"""
from __future__ import annotations

import datetime
import json
import logging
import pathlib

from aiohttp import web
from homeassistant.core import HomeAssistant

from .const import DOMAIN, CONF_MIN_AGE_HOURS, DEFAULT_MIN_AGE_HOURS
from .orphan_detector import detect_orphans, async_delete_entities

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = pathlib.Path(__file__).parent / "frontend"
IMAGES_DIR   = pathlib.Path(__file__).parent / "images"


# ---------------------------------------------------------------------------
# Handlers
# ---------------------------------------------------------------------------

async def _handle_panel(request: web.Request) -> web.Response:
    """Serve la pagina HTML del panel."""
    hass: HomeAssistant = request.app["hass"]
    html = await hass.async_add_executor_job(
        (FRONTEND_DIR / "panel.html").read_text, "utf-8"
    )
    return web.Response(
        content_type="text/html",
        text=html,
        headers={"Cache-Control": "no-store, no-cache, must-revalidate"},
    )


async def _handle_scan(request: web.Request) -> web.Response:
    """Endpoint GET /api/orphan_cleaner/scan."""
    hass: HomeAssistant = request.app["hass"]

    entry  = _get_config_entry(hass)
    config = {**entry.data, **entry.options} if entry else {}

    min_age    = int(request.rel_url.query.get("min_age", config.get(CONF_MIN_AGE_HOURS, DEFAULT_MIN_AGE_HOURS)))
    aggressive = request.rel_url.query.get("heuristic", "0") == "1"
    raw_ignore = request.rel_url.query.get("ignore_platforms", "")
    ignore_platforms = {p.strip() for p in raw_ignore.split(",") if p.strip()} if raw_ignore else set()

    # Merge session ignore + saved default list
    saved = hass.data.get(DOMAIN, {}).get("ignore_list", [])
    # Separate globs (contain * or ?) from plain platforms
    saved_platforms = {e for e in saved if "*" not in e and "?" not in e and "." not in e}
    saved_globs     = [e for e in saved if "*" in e or "?" in e or "." in e]
    all_platforms   = ignore_platforms | saved_platforms

    try:
        from homeassistant.helpers import entity_registry as er
        registry = er.async_get(hass)
        total    = len(registry.entities)
        orphans  = detect_orphans(hass, min_age_hours=min_age, aggressive=aggressive,
                                  ignore_platforms=all_platforms,
                                  ignore_globs=saved_globs)
        return web.Response(
            content_type="application/json",
            text=json.dumps({
                "total":            total,
                "orphans":          [o.as_dict() for o in orphans],
                "min_age":          min_age,
                "aggressive":       aggressive,
                "ignore_platforms": list(ignore_platforms),
                "error":            None,
            }),
        )
    except Exception:
        _LOGGER.exception("Errore scansione API")
        return web.Response(
            status=500,
            content_type="application/json",
            text=json.dumps({"error": "Internal server error", "orphans": [], "total": 0}),
        )


async def _handle_delete(request: web.Request) -> web.Response:
    """Endpoint POST /api/orphan_cleaner/delete."""
    hass: HomeAssistant = request.app["hass"]
    try:
        body = await request.json()
    except Exception:
        return web.Response(status=400, content_type="application/json",
                            text='{"error":"JSON non valido"}')

    entity_ids = body.get("entity_ids", [])
    if not entity_ids:
        return web.Response(status=400, content_type="application/json",
                            text='{"error":"entity_ids mancante o vuoto"}')
    try:
        deleted, failed = await async_delete_entities(hass, entity_ids)
        return web.Response(
            content_type="application/json",
            text=json.dumps({
                "deleted":       deleted,
                "failed":        failed,
                "deleted_count": len(deleted),
                "failed_count":  len(failed),
            }),
        )
    except Exception:
        _LOGGER.exception("Errore delete API")
        return web.Response(status=500, content_type="application/json",
                            text=json.dumps({"error": "Internal server error"}))


async def _handle_export(request: web.Request) -> web.Response:
    """Endpoint POST /api/orphan_cleaner/export."""
    hass: HomeAssistant = request.app["hass"]
    try:
        body = await request.json()
    except Exception:
        return web.Response(status=400, content_type="application/json",
                            text='{"error":"JSON non valido"}')

    entity_ids = body.get("entity_ids", [])
    orphans    = body.get("orphans", [])
    if not entity_ids:
        return web.Response(status=400, content_type="application/json",
                            text='{"error":"entity_ids mancante o vuoto"}')

    ts       = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"orphan_cleaner_backup_{ts}.json"
    path     = pathlib.Path(hass.config.config_dir) / filename
    payload  = {
        "exported_at":  datetime.datetime.now().isoformat(),
        "entity_count": len(entity_ids),
        "entities":     [o for o in orphans if o.get("entity_id") in entity_ids],
    }
    try:
        await hass.async_add_executor_job(
            path.write_text, json.dumps(payload, indent=2, ensure_ascii=False)
        )
        return web.Response(
            content_type="application/json",
            text=json.dumps({"ok": True, "filename": filename, "path": str(path)}),
        )
    except Exception:
        _LOGGER.exception("Errore export API")
        return web.Response(status=500, content_type="application/json",
                            text=json.dumps({"error": "Internal server error"}))


async def _handle_get_ignore(request: web.Request) -> web.Response:
    """GET /api/orphan_cleaner/ignore_list — restituisce la lista salvata."""
    hass: HomeAssistant = request.app["hass"]
    ignore_list = hass.data.get(DOMAIN, {}).get("ignore_list", [])
    return web.Response(
        content_type="application/json",
        text=json.dumps({"ignore_list": ignore_list}),
    )


async def _handle_set_ignore(request: web.Request) -> web.Response:
    """POST /api/orphan_cleaner/ignore_list — salva la lista."""
    hass: HomeAssistant = request.app["hass"]
    try:
        body = await request.json()
    except Exception:
        return web.Response(status=400, content_type="application/json",
                            text='{"error":"JSON non valido"}')
    ignore_list = body.get("ignore_list", [])
    if not isinstance(ignore_list, list):
        return web.Response(status=400, content_type="application/json",
                            text='{"error":"ignore_list deve essere un array"}')
    hass.data.setdefault(DOMAIN, {})["ignore_list"] = ignore_list
    # Persisti nelle opzioni della config entry
    entries = hass.config_entries.async_entries(DOMAIN)
    if entries:
        entry = entries[0]
        new_options = {**entry.options, "ignore_list": ignore_list}
        hass.config_entries.async_update_entry(entry, options=new_options)
    return web.Response(
        content_type="application/json",
        text=json.dumps({"ok": True, "count": len(ignore_list)}),
    )


async def _handle_js(request: web.Request) -> web.Response:
    """Serve il file JavaScript del custom panel."""
    js_path = FRONTEND_DIR / "orphan-cleaner-panel.js"
    if not js_path.exists():
        raise web.HTTPNotFound()
    hass: HomeAssistant = request.app["hass"]
    data = await hass.async_add_executor_job(js_path.read_bytes)
    return web.Response(body=data, content_type="application/javascript",
                        headers={"Cache-Control": "no-cache"})


async def _handle_icon(request: web.Request) -> web.Response:
    """Serve l'icona PNG."""
    icon_path = IMAGES_DIR / "icon.png"
    if not icon_path.exists():
        raise web.HTTPNotFound()
    hass: HomeAssistant = request.app["hass"]
    data = await hass.async_add_executor_job(icon_path.read_bytes)
    return web.Response(body=data, content_type="image/png",
                        headers={"Cache-Control": "public, max-age=86400"})


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _get_config_entry(hass: HomeAssistant):
    """Recupera la prima config entry dell'integrazione."""
    entries = hass.config_entries.async_entries(DOMAIN)
    return entries[0] if entries else None


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

def async_register_views(hass: HomeAssistant, app) -> None:
    """Registra le route direttamente su aiohttp."""
    app.router.add_get("/api/orphan_cleaner/panel",                   _handle_panel)
    app.router.add_get("/api/orphan_cleaner/scan",                    _handle_scan)
    app.router.add_post("/api/orphan_cleaner/delete",                 _handle_delete)
    app.router.add_post("/api/orphan_cleaner/export",                 _handle_export)
    app.router.add_get("/api/orphan_cleaner/ignore_list",             _handle_get_ignore)
    app.router.add_post("/api/orphan_cleaner/ignore_list",            _handle_set_ignore)
    app.router.add_get("/api/orphan_cleaner/orphan-cleaner-panel.js", _handle_js)
    app.router.add_get("/api/orphan_cleaner/icon.png",                _handle_icon)
    _LOGGER.debug("Route Orphan Cleaner registrate")
