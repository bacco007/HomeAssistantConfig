"""Home Assistant Entity Visualizer integration."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.components.http import StaticPathConfig
from homeassistant.components import panel_custom
import homeassistant.helpers.config_validation as cv
import voluptuous as vol

from .const import DOMAIN
from .graph_service import GraphService
from .websocket_api import async_register_websocket_handlers

_LOGGER = logging.getLogger(__name__)

# Add a module-level log to confirm import
_LOGGER.info("ha_visualiser __init__.py module loaded")

PLATFORMS: list[str] = []

# Configuration schema - empty since this integration has no YAML config
CONFIG_SCHEMA = vol.Schema({DOMAIN: cv.empty_config_schema}, extra=vol.ALLOW_EXTRA)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Home Assistant Entity Visualizer integration."""
    _LOGGER.info("Setting up Home Assistant Entity Visualizer integration")
    
    if DOMAIN not in config:
        _LOGGER.debug("No configuration found for %s", DOMAIN)
        return True
    
    hass.data.setdefault(DOMAIN, {})
    
    # Initialize the graph service
    graph_service = GraphService(hass)
    hass.data[DOMAIN]["graph_service"] = graph_service
    
    # Register websocket API handlers
    async_register_websocket_handlers(hass)
    
    # Register the frontend panel
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            "/api/ha_visualiser/static",
            hass.config.path("custom_components/ha_visualiser/www"),
            False
        )
    ])
    
    # Register the panel with defensive error handling
    try:
        await panel_custom.async_register_panel(
            hass,
            frontend_url_path="ha_visualiser",
            webcomponent_name="ha-visualiser-panel",
            sidebar_title="Entity Visualizer",
            sidebar_icon="mdi:graph",
            module_url="/api/ha_visualiser/static/ha-visualiser-panel.js",
            config={},
            require_admin=False,
        )
        _LOGGER.debug("Panel registered successfully")
    except ValueError as e:
        if "Overwriting panel" in str(e):
            _LOGGER.debug("Panel already registered, skipping registration")
        else:
            _LOGGER.error("Failed to register panel: %s", e)
            raise
    
    _LOGGER.info("Home Assistant Entity Visualizer integration loaded successfully")
    _LOGGER.debug("Integration setup completed - panel and websocket handlers registered")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Home Assistant Entity Visualizer from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    
    # Check if already set up to avoid duplicates
    if "graph_service" not in hass.data[DOMAIN]:
        # Initialize the graph service
        graph_service = GraphService(hass)
        hass.data[DOMAIN]["graph_service"] = graph_service
        
        # Register websocket API handlers
        async_register_websocket_handlers(hass)
        
        # Register the frontend panel
        await hass.http.async_register_static_paths([
            StaticPathConfig(
                "/api/ha_visualiser/static",
                hass.config.path("custom_components/ha_visualiser/www"),
                False
            )
        ])
        
        # Register the panel with defensive error handling
        try:
            await panel_custom.async_register_panel(
                hass,
                frontend_url_path="ha_visualiser",
                webcomponent_name="ha-visualiser-panel",
                sidebar_title="Entity Visualizer",
                sidebar_icon="mdi:graph",
                module_url="/api/ha_visualiser/static/ha-visualiser-panel.js",
                config={},
                require_admin=False,
            )
            _LOGGER.debug("Panel registered successfully")
        except ValueError as e:
            if "Overwriting panel" in str(e):
                _LOGGER.debug("Panel already registered, skipping registration")
            else:
                _LOGGER.error("Failed to register panel: %s", e)
                raise
    
    _LOGGER.info("Home Assistant Entity Visualizer integration loaded via config entry")
    _LOGGER.debug("Config entry setup completed - services available")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # Clean up stored data
    if DOMAIN in hass.data:
        hass.data.pop(DOMAIN)
    
    # Try to remove the panel (this helps with clean restarts)
    try:
        hass.components.frontend.async_remove_panel("ha_visualiser")
        _LOGGER.debug("Panel removed successfully during unload")
    except (AttributeError, KeyError):
        # Panel wasn't registered or already removed
        _LOGGER.debug("Panel was not registered or already removed")
    except Exception as e:
        # Log but don't fail unload for panel removal issues
        _LOGGER.debug("Could not remove panel during unload: %s", e)
    
    _LOGGER.info("Home Assistant Entity Visualizer integration unloaded")
    return True