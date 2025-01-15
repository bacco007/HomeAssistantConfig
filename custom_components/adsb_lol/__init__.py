"""The ADSB integration."""
from __future__ import annotations

import logging
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall

from datetime import timedelta

from .const import DOMAIN, PLATFORMS
from .coordinator import ADSBUpdateCoordinator, ADSBPointUpdateCoordinator
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import CONF_HOST
import voluptuous as vol

from .const import DOMAIN, ICONS_URL, ICONS_PATH

_LOGGER = logging.getLogger(__name__)

async def async_setup(hass, config):
    
    await hass.http.async_register_static_paths([StaticPathConfig("/adsb_lol/icons", hass.config.path(ICONS_PATH), True)])
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ADSB from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    if entry.data.get('device_tracker_id',None):
        coordinator = ADSBPointUpdateCoordinator(hass, entry)    
    else:
        coordinator = ADSBUpdateCoordinator(hass, entry)

    if not coordinator.last_update_success:
        raise ConfigEntryNotReady
      
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator
    }

    entry.async_on_unload(entry.add_update_listener(update_listener))
      
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
     
async def update_listener(hass: HomeAssistant, entry: ConfigEntry):
    """Handle options update."""
    hass.data[DOMAIN][entry.entry_id]['coordinator'].update_interval = timedelta(minutes=10)
    return True
