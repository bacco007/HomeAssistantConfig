"""The aviationweather integration."""

from __future__ import annotations

from homeassistant import config_entries
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import _LOGGER, DOMAIN
from .coordinator import AviationWeatherCoordinator

_PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup_entry(
    hass: HomeAssistant, entry: config_entries.ConfigEntry
) -> bool:
    """Set up aviationweather from a config entry."""

    hass.data.setdefault(DOMAIN, {})

    hass.data[DOMAIN][entry.entry_id] = coordinator = AviationWeatherCoordinator(
        hass, entry
    )

    await coordinator.async_config_entry_first_refresh()

    await hass.config_entries.async_forward_entry_setups(entry, _PLATFORMS)

    return True


async def async_remove_entry(
    hass: HomeAssistant, entry: config_entries.ConfigEntry
) -> None:
    """Handle removal of an entry."""
    try:
        # Perform any cleanup needed
        pass
    except Exception as ex:
        _LOGGER.error("Error removing entry: %s", ex)


async def async_unload_entry(
    hass: HomeAssistant, entry: config_entries.ConfigEntry
) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, _PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok
