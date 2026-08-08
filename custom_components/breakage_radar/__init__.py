"""Breakage Radar for Home Assistant.

Tells you which of your installed custom integrations use Home Assistant APIs
that are already scheduled for removal, and in which release they go away.
"""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir

from .const import DOMAIN, ISSUE_ID
from .coordinator import BreakageRadarCoordinator
from .repairs import async_sync_issue

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Breakage Radar from a config entry."""
    coordinator = BreakageRadarCoordinator(hass)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    @callback
    def _handle_update() -> None:
        """Keep the repairs issue in step with every refresh."""
        if coordinator.last_update_success and coordinator.data:
            async_sync_issue(hass, coordinator.data)

    entry.async_on_unload(coordinator.async_add_listener(_handle_update))
    if coordinator.data:
        async_sync_issue(hass, coordinator.data)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
        if not hass.data.get(DOMAIN):
            hass.data.pop(DOMAIN, None)
            ir.async_delete_issue(hass, DOMAIN, ISSUE_ID)
    return unloaded
