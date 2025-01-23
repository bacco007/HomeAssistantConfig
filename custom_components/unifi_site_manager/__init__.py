"""The UniFi Site Manager integration."""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY, Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv

from .api import (
    UnifiSiteManagerAPI,
    UnifiSiteManagerAuthError,
    UnifiSiteManagerConnectionError,
)
from .const import DEFAULT_API_HOST, DOMAIN
from .coordinator import UnifiSiteManagerDataUpdateCoordinator
from .services import async_setup_services, async_unload_services

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.BINARY_SENSOR,
    Platform.SENSOR,
]

# Add config schema to satisfy hassfest
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the UniFi Site Manager component."""
    hass.data[DOMAIN] = {}
    
    # Set up services
    await async_setup_services(hass)
    
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up UniFi Site Manager from a config entry."""
    # Ensure domain data is initialized
    hass.data.setdefault(DOMAIN, {})
    
    try:
        api = UnifiSiteManagerAPI(
            hass=hass,
            api_key=entry.data[CONF_API_KEY],
            host=DEFAULT_API_HOST,
        )

        # Verify we can authenticate
        await api.async_validate_api_key()

    except UnifiSiteManagerAuthError as err:
        raise ConfigEntryAuthFailed from err
    except UnifiSiteManagerConnectionError as err:
        raise ConfigEntryNotReady(
            f"Error communicating with UniFi Site Manager API: {err}"
        ) from err

    coordinator = UnifiSiteManagerDataUpdateCoordinator(
        hass=hass,
        api=api,
        entry=entry,
    )

    # Fetch initial data so we have data when entities subscribe
    try:
        await coordinator.async_config_entry_first_refresh()
    except ConfigEntryNotReady as err:
        raise ConfigEntryNotReady(f"Failed to load initial data: {err}") from err

    # Store coordinator for platforms to access
    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Set up all platforms for this device/entry
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register update listener for config entry changes
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

        # If this is the last instance, clean up services
        if not hass.data[DOMAIN]:
            await async_unload_services(hass)
            hass.data.pop(DOMAIN)

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the config entry when it changed."""
    await hass.config_entries.async_reload(entry.entry_id)