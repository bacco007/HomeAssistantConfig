"""The Bulk Entity Editor integration."""
from __future__ import annotations

import logging
from pathlib import Path

from aiohttp import web
from homeassistant.components.frontend import async_register_built_in_panel, async_remove_panel
from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    DOMAIN,
    PANEL_FILENAME,
    PANEL_ICON,
    PANEL_JS_URL,
    PANEL_TITLE,
    PANEL_URL_PATH,
    PANEL_WEBCOMPONENT_NAME,
)

_LOGGER = logging.getLogger(__name__)

_VIEW_REGISTERED_KEY = "view_registered"


class PanelAssetView(HomeAssistantView):
    """Serves the panel bundle with mtime-based ETag and no-cache headers so
    clients always revalidate — any time the file on disk changes, browsers
    and WKWebView pick it up without an HA restart or integration reload."""

    requires_auth = False
    url = PANEL_JS_URL
    name = f"api:{DOMAIN}:panel"

    def __init__(self, file_path: Path) -> None:
        self._file_path = file_path

    async def get(self, request: web.Request) -> web.StreamResponse:
        if not self._file_path.is_file():
            raise web.HTTPNotFound()

        stat = self._file_path.stat()
        etag = f'W/"{int(stat.st_mtime)}-{stat.st_size}"'
        headers = {
            "ETag": etag,
            "Cache-Control": "no-cache, must-revalidate",
            "Content-Type": "application/javascript; charset=utf-8",
        }

        if request.headers.get("If-None-Match") == etag:
            return web.Response(status=304, headers=headers)

        return web.FileResponse(path=self._file_path, headers=headers)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Bulk Entity Editor from a config entry."""
    frontend_dir = Path(__file__).parent / "frontend"
    panel_file = frontend_dir / PANEL_FILENAME

    if not panel_file.is_file():
        _LOGGER.error(
            "Panel bundle missing at %s — did you forget to build the frontend?",
            panel_file,
        )
        return False

    # HA has no public API to un-register an HTTP view, so we guard against
    # double-registration if the integration gets reloaded in the same
    # process lifetime.
    domain_data = hass.data.setdefault(DOMAIN, {})
    if not domain_data.get(_VIEW_REGISTERED_KEY):
        hass.http.register_view(PanelAssetView(panel_file))
        domain_data[_VIEW_REGISTERED_KEY] = True

    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL_PATH,
        config={
            "_panel_custom": {
                "name": PANEL_WEBCOMPONENT_NAME,
                "embed_iframe": False,
                "trust_external": False,
                # The Vite bundle is an ES module — load via module_url so the
                # browser parses `export` statements. PanelAssetView serves
                # this URL with ETag + no-cache so clients always revalidate.
                "module_url": PANEL_JS_URL,
            }
        },
        require_admin=True,
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    async_remove_panel(hass, PANEL_URL_PATH)
    # HTTP view stays registered — HA exposes no clean way to remove it.
    return True
