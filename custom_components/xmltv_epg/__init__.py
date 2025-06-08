"""Custom integration to integrate XMLTV EPG data with Home Assistant.

For more details about this integration, please refer to
https://github.com/shadow578/homeassistant_xmltv-epg
"""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import XMLTVClient
from .const import (
    DEFAULT_ENABLE_CHANNEL_ICONS,
    DEFAULT_ENABLE_PROGRAM_IMAGES,
    DEFAULT_ENABLE_UPCOMING_SENSOR,
    DEFAULT_PROGRAM_LOOKAHEAD,
    DEFAULT_UPDATE_INTERVAL,
    DOMAIN,
    LOGGER,
    OPT_ENABLE_CHANNEL_ICONS,
    OPT_ENABLE_PROGRAM_IMAGES,
    OPT_ENABLE_UPCOMING_SENSOR,
    OPT_PROGRAM_LOOKAHEAD,
    OPT_UPDATE_INTERVAL,
)
from .coordinator import XMLTVDataUpdateCoordinator

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.IMAGE,
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
            logger=LOGGER,
        ),
        update_interval=entry.options.get(OPT_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL),
        lookahead=entry.options.get(OPT_PROGRAM_LOOKAHEAD, DEFAULT_PROGRAM_LOOKAHEAD),
        enable_upcoming_sensor=entry.options.get(
            OPT_ENABLE_UPCOMING_SENSOR, DEFAULT_ENABLE_UPCOMING_SENSOR
        ),
        enable_channel_icon=entry.options.get(
            OPT_ENABLE_CHANNEL_ICONS, DEFAULT_ENABLE_CHANNEL_ICONS
        ),
        enable_program_image=entry.options.get(
            OPT_ENABLE_PROGRAM_IMAGES, DEFAULT_ENABLE_PROGRAM_IMAGES
        ),
    )

    # https://developers.home-assistant.io/docs/integration_fetching_data#coordinated-single-api-poll-for-data-for-all-entities
    await coordinator.async_config_entry_first_refresh()

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # listen for updates to the config entry to re-setup it
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    # FIXME for some reason, following the example for a coordinated single API poll, the
    # sensors created in sensor.py don't display the data until the next refresh interval.
    # causing a refresh manually after they are set up works around this issue.
    # see https://developers.home-assistant.io/docs/integration_fetching_data/#coordinated-single-api-poll-for-data-for-all-entities
    await coordinator.async_refresh()

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Handle removal of an entry."""
    if unloaded := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)
    return unloaded


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await hass.config_entries.async_reload(entry.entry_id)
