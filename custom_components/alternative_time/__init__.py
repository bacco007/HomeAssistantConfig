"""The Alternative Time integration."""
from __future__ import annotations

import logging
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Platform list - sensor.py must exist in the same directory as this file
PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Alternative Time component."""
    # This is for backward compatibility if someone uses YAML config
    # We only support config entries now
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Alternative Time from a config entry."""
    _LOGGER.debug(f"Setting up Alternative Time integration for {entry.title}")
    _LOGGER.debug(f"Config data: {entry.data}")
    
    # Initialize the domain in hass.data if needed
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}
    
    # Store config entry data
    hass.data[DOMAIN][entry.entry_id] = entry.data
    
    # Forward setup to sensor platform
    # This will look for sensor.py in the same directory as __init__.py
    try:
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
        _LOGGER.info(f"Successfully set up Alternative Time integration for {entry.title}")
    except Exception as e:
        _LOGGER.error(f"Error setting up platforms: {e}")
        return False
    
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.debug(f"Unloading Alternative Time integration for {entry.title}")
    
    # Unload sensor platform
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    
    if unload_ok:
        # Remove config entry from hass.data
        hass.data[DOMAIN].pop(entry.entry_id, None)
        
        # Clean up domain if no more entries
        if not hass.data[DOMAIN]:
            hass.data.pop(DOMAIN)
    
    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)