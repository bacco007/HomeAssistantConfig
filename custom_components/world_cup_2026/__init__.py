"""World Cup 2026 integration."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .api import WorldCupAPI
from .app.websocket import async_register_websocket_api
from .const import CONF_API_KEY, DEFAULT_DEMO_MODE, DOMAIN, OPT_DEMO_MODE
from .coordinator import WorldCupCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor"]

PANEL_PATH = "world-cup-2026"
PANEL_TITLE = "🏆 World Cup 2026 ⚽"
PANEL_ICON = "mdi:trophy"
FRONTEND_URL = f"/{DOMAIN}_frontend"
PANEL_FILENAME = "world-cup-2026-panel.js"



async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the World Cup 2026 integration from a config entry."""
    demo_mode: bool = entry.options.get(OPT_DEMO_MODE, DEFAULT_DEMO_MODE)

    api = WorldCupAPI(api_key=entry.data[CONF_API_KEY], demo_mode=demo_mode)
    coordinator = WorldCupCoordinator(hass, api)

    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await async_register_websocket_api(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    frontend_dir = Path(__file__).parent / "frontend" / "dist"
    panel_file = frontend_dir / PANEL_FILENAME
    try:
        panel_stat = panel_file.stat()
        panel_version = f"{int(panel_stat.st_mtime)}-{panel_stat.st_size}"
    except OSError:
        panel_version = str(entry.version)

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_URL,
                str(frontend_dir),
                False,
            )
        ]
    )

    try:
        frontend.async_remove_panel(hass, PANEL_PATH)
    except Exception:
        pass

    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_PATH,
        config={
            "_panel_custom": {
                "name": "world-cup-2026-panel",
                "js_url": f"{FRONTEND_URL}/{PANEL_FILENAME}?v={panel_version}",
                "embed_iframe": False,
                "trust_external": False,
            }
        },
        require_admin=False,
    )

    _LOGGER.info("World Cup 2026 app registered")

    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))

    return True


async def _async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the integration when options are updated."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unloaded:
        hass.data[DOMAIN].pop(entry.entry_id, None)

        try:
            frontend.async_remove_panel(hass, PANEL_PATH)
        except Exception:
            pass

    return unloaded
