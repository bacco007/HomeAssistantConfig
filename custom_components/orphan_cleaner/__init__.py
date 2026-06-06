"""
Orphan Entity Cleaner — Custom Integration for Home Assistant.
"""
from __future__ import annotations

import logging
import shutil
import pathlib

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components import frontend
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, PANEL_URL, PANEL_NAME, PANEL_ICON, VERSION
from .panel_api import async_register_views
from .services import async_register_services, async_unregister_services

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["config_entry"] = entry
    # Carica ignore list salvata nelle opzioni
    hass.data[DOMAIN]["ignore_list"] = list(entry.options.get("ignore_list", []))

    _pycache = pathlib.Path(__file__).parent / "__pycache__"
    if _pycache.exists():
        await hass.async_add_executor_job(
            lambda: shutil.rmtree(_pycache, ignore_errors=True)
        )

    async_register_views(hass, hass.http.app)
    async_register_services(hass)

    # Remove any previously registered panel before re-registering
    # This ensures the versioned URL is always refreshed after an update
    try:
        frontend.async_remove_panel(hass, PANEL_URL)
    except Exception:
        pass

    # Use iframe panel pointing directly to panel.html — no JS cache issues
    frontend.async_register_built_in_panel(
        hass,
        component_name="iframe",
        sidebar_title=PANEL_NAME,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        config={"url": f"/api/orphan_cleaner/panel?v={VERSION}"},
        require_admin=True,
    )

    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    _LOGGER.info("Orphan Entity Cleaner %s loaded", VERSION)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    async_unregister_services(hass)
    frontend.async_remove_panel(hass, PANEL_URL)
    hass.data[DOMAIN].pop("config_entry", None)
    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)
