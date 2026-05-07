from __future__ import annotations

import logging

import homeassistant.helpers.config_validation as cv
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, PLATFORMS
from .coordinator import SportsTickerCoordinator

LOGGER = logging.getLogger(__name__)

# ✅ hassfest: integration has async_setup, so define CONFIG_SCHEMA
# This integration is config-entry only (no YAML configuration)
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the integration."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Sports Ticker from a config entry."""
    coordinator = SportsTickerCoordinator(hass, entry)

    # Load last-good cached data before the first ESPN refresh.
    # This prevents sensors from starting empty if ESPN is unavailable.
    await coordinator.async_load_cached_data()

    # Fetch fresh data. If ESPN fails, the coordinator keeps cached data.
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Reload the integration when Options are changed.
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload Sports Ticker."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        coordinator: SportsTickerCoordinator | None = hass.data.get(DOMAIN, {}).pop(
            entry.entry_id,
            None,
        )

        if coordinator:
            await coordinator.async_shutdown()

    return unload_ok


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)
