"""Support for testing internet speed via Cloudflare Speed Test."""

from __future__ import annotations

from cfspeedtest import CloudflareSpeedtest

from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.start import async_at_started

from .coordinator import (
    CloudflareSpeedTestConfigEntry,
    CloudflareSpeedTestDataCoordinator,
)

PLATFORMS = [Platform.SENSOR]


async def async_setup_entry(
    hass: HomeAssistant, config_entry: CloudflareSpeedTestConfigEntry
) -> bool:
    """Set up the Cloudflare Speed Test component."""
    api = CloudflareSpeedtest
    coordinator = CloudflareSpeedTestDataCoordinator(hass, config_entry, api)

    config_entry.runtime_data = coordinator

    async def _async_finish_startup(hass: HomeAssistant) -> None:
        """Run this only when HA has finished its startup."""
        if config_entry.state is ConfigEntryState.LOADED:
            await coordinator.async_refresh()
        else:
            await coordinator.async_config_entry_first_refresh()

    # Don't start a cloudflare speed test during startup
    async_at_started(hass, _async_finish_startup)

    await hass.config_entries.async_forward_entry_setups(config_entry, PLATFORMS)
    config_entry.async_on_unload(config_entry.add_update_listener(update_listener))

    return True


async def async_unload_entry(
    hass: HomeAssistant, config_entry: CloudflareSpeedTestConfigEntry
) -> bool:
    """Unload CloudflareSpeedTest Entry from config_entry."""
    return await hass.config_entries.async_unload_platforms(config_entry, PLATFORMS)


async def update_listener(
    hass: HomeAssistant, config_entry: CloudflareSpeedTestConfigEntry
) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(config_entry.entry_id)
