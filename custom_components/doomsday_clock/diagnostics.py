from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .coordinator import DoomsdayClockCoordinator


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> dict:
    """Return diagnostics for a config entry."""
    coordinator = DoomsdayClockCoordinator(hass, entry.data)

    diagnostics = {
        "entry_data": dict(entry.data),
        "resource": coordinator.resource,
        "selectors": list(coordinator.selectors),
    }

    try:
        data = await coordinator._async_update_data()
        diagnostics["last_fetch_success"] = True
        diagnostics["parsed"] = {
            "sentence": data.sentence,
            "minutes_to_midnight": data.minutes_to_midnight,
            "midnight_time": data.midnight_time,
            "selector_used": data.selector_used,
        }
    except Exception as err:
        diagnostics["last_fetch_success"] = False
        diagnostics["error"] = str(err)

    return diagnostics