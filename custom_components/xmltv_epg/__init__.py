"""Custom integration to integrate XMLTV EPG data with Home Assistant.

For more details about this integration, please refer to
https://github.com/shadow578/homeassistant_xmltv-epg
"""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import CONF_HOST, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import XMLTVClient
from .const import (
    DEFAULT_ENABLE_UPCOMING_SENSOR,
    DEFAULT_PROGRAM_LOOKAHEAD,
    DEFAULT_UPDATE_INTERVAL,
    DOMAIN,
    OPT_ENABLE_UPCOMING_SENSOR,
    OPT_PROGRAM_LOOKAHEAD,
    OPT_UPDATE_INTERVAL,
)
from .coordinator import XMLTVDataUpdateCoordinator

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
]


# https://developers.home-assistant.io/docs/config_entries_index/#setting-up-an-entry
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up this integration using UI."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator = XMLTVDataUpdateCoordinator(
        hass=hass,
        config_entry=entry,
        client=XMLTVClient(
            session=async_get_clientsession(hass),
            url=entry.data[CONF_HOST],
        ),
        update_interval=entry.options.get(OPT_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL),
        lookahead=entry.options.get(OPT_PROGRAM_LOOKAHEAD, DEFAULT_PROGRAM_LOOKAHEAD),
        enable_upcoming_sensor=entry.options.get(
            OPT_ENABLE_UPCOMING_SENSOR, DEFAULT_ENABLE_UPCOMING_SENSOR
        ),
    )
    if entry.state == ConfigEntryState.SETUP_IN_PROGRESS:
        # https://developers.home-assistant.io/docs/integration_fetching_data#coordinated-single-api-poll-for-data-for-all-entities
        await coordinator.async_config_entry_first_refresh()
    else:
        # To fix deprecation warning (???)
        # Detected that custom integration 'xmltv_epg' uses `async_config_entry_first_refresh`, which is only supported when entry state is ConfigEntryState.SETUP_IN_PROGRESS, but it is in state ConfigEntryState.LOADED
        await coordinator.async_refresh()

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Handle removal of an entry."""
    if unloaded := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)
    return unloaded


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)
