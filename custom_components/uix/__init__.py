from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import (
    DOMAIN,
    FRONTEND_SCRIPT_URL,
    EVENT_FOUNDRIES_UPDATED,
)
from .frontend import (
    async_register_frontend_script_resource,
    async_register_static_path, 
    async_remove_frontend_script_resource
)
from .connection import async_setup_connection

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

async def _async_initialize_integration(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
) -> bool:
    """Initialize the integration."""
    await async_register_frontend_script_resource(hass, FRONTEND_SCRIPT_URL)

    return True

async def _async_cleanup_integration(
    hass: HomeAssistant,
) -> bool:
    """Cleanup the integration."""
    await async_remove_frontend_script_resource(hass)

    return True

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    await async_register_static_path(hass)
    await async_setup_connection(hass)
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    return await _async_initialize_integration(hass, entry)


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Fire the foundries updated event when integration options change."""
    hass.bus.async_fire(EVENT_FOUNDRIES_UPDATED, {})

async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    return await _async_cleanup_integration(hass)