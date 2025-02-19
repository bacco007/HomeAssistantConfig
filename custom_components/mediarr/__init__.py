# mediarr/__init__.py
"""The Mediarr integration."""
from __future__ import annotations
import logging
from typing import Any
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from .services.seer_requests import SeerRequestHandler, async_setup_services, async_unload_services

DOMAIN = "mediarr"
PLATFORMS = [Platform.SENSOR]

async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Mediarr component."""
    if DOMAIN not in config:
        return True

    domain_config = config[DOMAIN]
    hass.data.setdefault(DOMAIN, {})

    if "seer" in domain_config:
        seer_config = domain_config["seer"]
        
        handler = SeerRequestHandler(
            hass,
            seer_config["url"],
            seer_config["api_key"]
        )
        
        hass.data[DOMAIN]["seer_request_handler"] = handler
        
        service_setup = await async_setup_services(hass, DOMAIN)
        
        hass.bus.async_listen_once(
            "homeassistant_stop",
            lambda _: async_unload_services(hass, DOMAIN)
        )

    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Mediarr from a config entry."""
    # Store the config entry data
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Set up all platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    
    # Reload services
    if "seer_request_handler" not in hass.data[DOMAIN]:
        seer_config = entry.data.get("seer", {})
        if seer_config:
            handler = SeerRequestHandler(
                hass,
                seer_config["url"],
                seer_config["api_key"]
            )
            hass.data[DOMAIN]["seer_request_handler"] = handler
            await async_setup_services(hass, DOMAIN)

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # Unload platforms
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
        
        # If this is the last entry, unload services
        if not hass.data[DOMAIN]:
            await async_unload_services(hass, DOMAIN)
            hass.data.pop(DOMAIN)

    return unload_ok