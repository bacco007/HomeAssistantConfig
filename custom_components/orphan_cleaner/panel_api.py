"""
Endpoint HTTP per il panel web di Orphan Entity Cleaner.

Tutte le route sono registrate tramite HomeAssistantView, che applica
l'autenticazione di Home Assistant per default (requires_auth = True).
Gli endpoint che leggono o modificano lo stato del registry richiedono
inoltre privilegi di amministratore (requires_admin = True).
"""
from __future__ import annotations

import datetime
import json
import logging
import pathlib

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DOMAIN, CONF_MIN_AGE_HOURS, DEFAULT_MIN_AGE_HOURS
from .orphan_detector import detect_orphans, async_delete_entities

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = pathlib.Path(__file__).parent / "frontend"
IMAGES_DIR   = pathlib.Path(__file__).parent / "images"


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _get_config_entry(hass: HomeAssistant):
    """Recupera la prima config entry dell'integrazione."""
    entries = hass.config_entries.async_entries(DOMAIN)
    return entries[0] if entries else None


# ---------------------------------------------------------------------------
# Static asset views — no destructive action, served like the panel itself.
# These mirror how HA core serves static panel assets and remain unauthenticated
# only for the HTML/JS/icon files, never for data-bearing endpoints below.
# ---------------------------------------------------------------------------

class OrphanCleanerIndexView(HomeAssistantView):
    """Serve la pagina HTML del panel."""

    url           = "/api/orphan_cleaner/panel"
    name          = "api:orphan_cleaner:panel"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        html = await hass.async_add_executor_job(
            (FRONTEND_DIR / "panel.html").read_text, "utf-8"
        )
        return web.Response(
            content_type="text/html",
            text=html,
            headers={"Cache-Control": "no-store, no-cache, must-revalidate"},
        )


class OrphanCleanerJsView(HomeAssistantView):
    """Serve il file JavaScript del custom panel."""

    url           = "/api/orphan_cleaner/orphan-cleaner-panel.js"
    name          = "api:orphan_cleaner:js"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        js_path = FRONTEND_DIR / "orphan-cleaner-panel.js"
        if not js_path.exists():
            raise web.HTTPNotFound()
        hass: HomeAssistant = request.app["hass"]
        data = await hass.async_add_executor_job(js_path.read_bytes)
        return web.Response(body=data, content_type="application/javascript",
                            headers={"Cache-Control": "no-cache"})


class OrphanCleanerIconView(HomeAssistantView):
    """Serve l'icona PNG."""

    url           = "/api/orphan_cleaner/icon.png"
    name          = "api:orphan_cleaner:icon"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        icon_path = IMAGES_DIR / "icon.png"
        if not icon_path.exists():
            raise web.HTTPNotFound()
        hass: HomeAssistant = request.app["hass"]
        data = await hass.async_add_executor_job(icon_path.read_bytes)
        return web.Response(body=data, content_type="image/png",
                            headers={"Cache-Control": "public, max-age=86400"})


# ---------------------------------------------------------------------------
# Data views — all require authentication. Destructive/mutating ones also
# require admin privileges.
# ---------------------------------------------------------------------------

class OrphanCleanerScanView(HomeAssistantView):
    """GET /api/orphan_cleaner/scan — restituisce le entità orfane in JSON."""

    url           = "/api/orphan_cleaner/scan"
    name          = "api:orphan_cleaner:scan"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]

        entry  = _get_config_entry(hass)
        config = {**entry.data, **entry.options} if entry else {}

        min_age    = int(request.rel_url.query.get("min_age", config.get(CONF_MIN_AGE_HOURS, DEFAULT_MIN_AGE_HOURS)))
        aggressive = request.rel_url.query.get("heuristic", "0") == "1"
        raw_ignore = request.rel_url.query.get("ignore_platforms", "")
        ignore_platforms = {p.strip() for p in raw_ignore.split(",") if p.strip()} if raw_ignore else set()

        saved = hass.data.get(DOMAIN, {}).get("ignore_list", [])
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


class OrphanCleanerDeleteView(HomeAssistantView):
    """POST /api/orphan_cleaner/delete — elimina le entità specificate. Richiede admin."""

    url            = "/api/orphan_cleaner/delete"
    name           = "api:orphan_cleaner:delete"
    requires_auth  = True
    requires_admin = True

    async def post(self, request: web.Request) -> web.Response:
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


class OrphanCleanerExportView(HomeAssistantView):
    """POST /api/orphan_cleaner/export — salva un backup JSON. Richiede admin
    perché scrive un file nella directory di configurazione."""

    url            = "/api/orphan_cleaner/export"
    name           = "api:orphan_cleaner:export"
    requires_auth  = True
    requires_admin = True

    async def post(self, request: web.Request) -> web.Response:
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


class OrphanCleanerIgnoreListView(HomeAssistantView):
    """GET/POST /api/orphan_cleaner/ignore_list — legge/salva la lista persistente.
    Lettura richiede solo autenticazione, scrittura richiede admin."""

    url           = "/api/orphan_cleaner/ignore_list"
    name          = "api:orphan_cleaner:ignore_list"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        ignore_list = hass.data.get(DOMAIN, {}).get("ignore_list", [])
        return web.Response(
            content_type="application/json",
            text=json.dumps({"ignore_list": ignore_list}),
        )

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        user = request.get("hass_user")
        if user is not None and not user.is_admin:
            return web.Response(status=403, content_type="application/json",
                                text='{"error":"Admin privileges required"}')
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
        entries = hass.config_entries.async_entries(DOMAIN)
        if entries:
            entry = entries[0]
            new_options = {**entry.options, "ignore_list": ignore_list}
            hass.config_entries.async_update_entry(entry, options=new_options)
        return web.Response(
            content_type="application/json",
            text=json.dumps({"ok": True, "count": len(ignore_list)}),
        )


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

def async_register_views(hass: HomeAssistant) -> None:
    """Registra tutte le view tramite l'API ufficiale di Home Assistant."""
    hass.http.register_view(OrphanCleanerIndexView())
    hass.http.register_view(OrphanCleanerJsView())
    hass.http.register_view(OrphanCleanerIconView())
    hass.http.register_view(OrphanCleanerScanView())
    hass.http.register_view(OrphanCleanerDeleteView())
    hass.http.register_view(OrphanCleanerExportView())
    hass.http.register_view(OrphanCleanerIgnoreListView())
    _LOGGER.debug("Route Orphan Cleaner registrate")
