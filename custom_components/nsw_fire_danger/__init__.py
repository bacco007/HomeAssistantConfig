"""The NSW Fire Danger Ratings integration."""
from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
import homeassistant.helpers.config_validation as cv

import os
from homeassistant.components.http import StaticPathConfig

DOMAIN = "nsw_fire_danger"
PLATFORMS: list[Platform] = [Platform.SENSOR]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the NSW Fire Danger component."""
    # Register the custom card static path
    www_path = os.path.join(os.path.dirname(__file__), "www")
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            url_path=f"/{DOMAIN}_ui",
            path=www_path,
            cache_headers=True,
        )
    ])

    # Automatically register the Lovelace resource
    hass.async_create_task(_async_register_lovelace_resource(hass))
    
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up NSW Fire Danger from a config entry."""
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    """Register Lovelace resource for the custom card."""
    resource_url = f"/{DOMAIN}_ui/nsw-fire-danger-card.js?v=1.3.10"
    
    # Check if Lovelace is available
    if "lovelace" not in hass.data:
        return

    # Check for resources in storage-based Lovelace
    resources = hass.data["lovelace"].get("resources")
    if resources:
        # Check if already registered
        if any(res.get("url") == resource_url for res in resources.async_items()):
            return
            
        # Add the resource
        if hasattr(resources, "async_create_item"):
            await resources.async_create_item({
                "res_type": "module",
                "url": resource_url
            })
    
    # Also handle the frontend resource registration for better compatibility
    if hasattr(hass.components.frontend, "async_register_built_in_panel"):
        # This is more for panels, but some components use it to inject JS
        pass


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
