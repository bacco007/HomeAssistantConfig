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
_LOGGER.info("ha_visualiser __init__.py module loaded - v0.8.13 with config flow enabled")

PLATFORMS: list[str] = []

# Configuration schema - empty since this integration has no YAML config
CONFIG_SCHEMA = vol.Schema({DOMAIN: cv.empty_config_schema}, extra=vol.ALLOW_EXTRA)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Home Assistant Entity Visualizer integration via YAML."""
    _LOGGER.info("Setting up Entity Visualizer integration via YAML")
    
    # Check if already initialized via config entry
    if DOMAIN in hass.data and "graph_service" in hass.data[DOMAIN]:
        _LOGGER.debug("Integration already initialized via config entry, skipping YAML setup")
        return True
    
    # Handle YAML configuration
    if DOMAIN not in config:
        _LOGGER.debug("No YAML configuration found, but config_flow is now enabled")
        _LOGGER.info("Entity Visualizer: Please add this integration via Settings → Integrations → Add Integration → Entity Visualizer")
        return True
    
    _LOGGER.info("Entity Visualizer: Setting up from YAML configuration")
    
    try:
        # Import YAML config to config entry for unified handling
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN,
                context={"source": "import"},
                data=config.get(DOMAIN, {}),
            )
        )
        return True
    except Exception as e:
        _LOGGER.error("Failed to import YAML configuration to config entry: %s", e, exc_info=True)
        return False


async def _ensure_panel_registered(hass: HomeAssistant) -> bool:
    """Ensure the panel is registered, used for retry scenarios."""
    _LOGGER.debug("Entity Visualizer: Ensuring panel registration")
    
    # Check if www directory exists
    www_path = hass.config.path("custom_components/ha_visualiser/www")
    try:
        import os
        if not os.path.exists(www_path):
            _LOGGER.error("Entity Visualizer: www directory missing at %s", www_path)
            return False
        
        js_file = os.path.join(www_path, "ha-visualiser-panel.js")
        if not os.path.exists(js_file):
            _LOGGER.error("Entity Visualizer: Frontend JS file missing at %s", js_file)
            return False
        
        _LOGGER.debug("Entity Visualizer: Frontend files verified at %s", www_path)
    except Exception as e:
        _LOGGER.error("Entity Visualizer: Error checking frontend files: %s", e)
        return False
    
    try:
        # Register static paths if not already registered
        await hass.http.async_register_static_paths([
            StaticPathConfig(
                "/api/ha_visualiser/static",
                www_path,
                False
            )
        ])
        _LOGGER.debug("Entity Visualizer: Static paths registered successfully")
    except Exception as e:
        # Static paths might already be registered, this is not critical
        _LOGGER.debug("Entity Visualizer: Static paths registration skipped or failed (likely already registered): %s", e)
    
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
        _LOGGER.info("Entity Visualizer: ✅ Panel registered successfully - look for 'Entity Visualizer' in your sidebar!")
        return True
    except ValueError as e:
        if "Overwriting panel" in str(e):
            _LOGGER.debug("Entity Visualizer: Panel already registered, skipping registration")
            return True
        else:
            _LOGGER.error("Entity Visualizer: ❌ Failed to register panel (ValueError): %s", e)
            return False
    except Exception as e:
        _LOGGER.error("Entity Visualizer: ❌ Unexpected error during panel registration: %s", e, exc_info=True)
        return False


async def _setup_integration(hass: HomeAssistant, config: ConfigType) -> bool:
    """Shared setup logic for both YAML and config entry setup."""
    _LOGGER.debug("Entity Visualizer: Starting integration setup")
    hass.data.setdefault(DOMAIN, {})
    
    # Check if already set up to avoid duplicates
    if "graph_service" in hass.data[DOMAIN]:
        _LOGGER.debug("Entity Visualizer: Services already initialized, verifying panel registration")
        # Even if services are initialized, we need to ensure panel is registered
        # This handles cases where panel registration failed on previous attempts
        panel_result = await _ensure_panel_registered(hass)
        if panel_result:
            _LOGGER.info("Entity Visualizer: Setup completed (services existed, panel verified)")
        return panel_result
    
    try:
        # Initialize the graph service
        _LOGGER.debug("Entity Visualizer: Initializing graph service")
        graph_service = GraphService(hass)
        hass.data[DOMAIN]["graph_service"] = graph_service
        _LOGGER.debug("Entity Visualizer: Graph service initialized successfully")
        
        # Register websocket API handlers
        _LOGGER.debug("Entity Visualizer: Registering websocket handlers")
        async_register_websocket_handlers(hass)
        _LOGGER.debug("Entity Visualizer: Websocket handlers registered successfully")
        
        # Register the frontend panel
        _LOGGER.debug("Entity Visualizer: Attempting panel registration")
        panel_result = await _ensure_panel_registered(hass)
        if not panel_result:
            _LOGGER.error("Entity Visualizer: ❌ Failed to register panel during initial setup")
            # Clean up on panel registration failure
            if DOMAIN in hass.data and "graph_service" in hass.data[DOMAIN]:
                hass.data[DOMAIN].pop("graph_service")
            return False
        
        _LOGGER.info("Entity Visualizer: ✅ Integration setup completed successfully")
        return True
        
    except Exception as e:
        _LOGGER.error("Entity Visualizer: ❌ Error during integration setup: %s", e, exc_info=True)
        # Clean up on any failure
        if DOMAIN in hass.data and "graph_service" in hass.data[DOMAIN]:
            hass.data[DOMAIN].pop("graph_service")
        return False


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Home Assistant Entity Visualizer from a config entry."""
    _LOGGER.info("Entity Visualizer: Setting up from config entry (ID: %s)", entry.entry_id)
    
    # Check if already initialized via YAML setup to prevent conflicts
    if DOMAIN in hass.data and "graph_service" in hass.data[DOMAIN]:
        _LOGGER.debug("Integration already initialized via YAML, merging with config entry")
        # Ensure panel registration even if services exist
        panel_result = await _ensure_panel_registered(hass)
        if panel_result:
            _LOGGER.info("Entity Visualizer: Config entry setup completed (panel verified)")
        return panel_result
    
    try:
        _LOGGER.debug("Entity Visualizer: Starting config entry initialization")
        result = await _setup_integration(hass, {})
        if result:
            _LOGGER.info("Entity Visualizer: Successfully loaded via config entry - panel should be available in sidebar")
        else:
            _LOGGER.error("Entity Visualizer: Config entry setup failed during _setup_integration")
        return result
    except Exception as e:
        _LOGGER.error("Entity Visualizer: Failed to setup integration from config entry: %s", e, exc_info=True)
        # Clean up on failure to prevent partial initialization
        if DOMAIN in hass.data:
            _LOGGER.debug("Entity Visualizer: Cleaning up failed initialization data")
            hass.data.pop(DOMAIN)
        return False


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