"""Supercars Championship integration for Home Assistant."""
from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import NatsoftCoordinator
from .news_coordinator import NewsCoordinator
from .schedule_coordinator import ScheduleCoordinator
from .standings_coordinator import StandingsCoordinator
from .results_coordinator import ResultsCoordinator

PLATFORMS = [Platform.SENSOR, Platform.CALENDAR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Supercars from a config entry."""
    timing_coordinator = NatsoftCoordinator(hass)
    news_coordinator = NewsCoordinator(hass)
    schedule_coordinator = ScheduleCoordinator(hass)
    standings_coordinator = StandingsCoordinator(hass)
    results_coordinator = ResultsCoordinator(hass, timing_coordinator)

    await timing_coordinator.async_config_entry_first_refresh()
    await news_coordinator.async_config_entry_first_refresh()
    await schedule_coordinator.async_config_entry_first_refresh()
    await standings_coordinator.async_config_entry_first_refresh()
    await results_coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {
        "timing":   timing_coordinator,
        "news":     news_coordinator,
        "schedule": schedule_coordinator,
        "standings": standings_coordinator,
        "results":   results_coordinator,
    }

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        coordinators = hass.data[DOMAIN].pop(entry.entry_id)
        for coord in coordinators.values():
            if hasattr(coord, "_session") and coord._session and not coord._session.closed:
                await coord._session.close()
    return unload_ok
