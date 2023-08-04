"""Support for the Solcast diagnostics."""
from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import SolcastUpdateCoordinator


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    coordinator: SolcastUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]

    return {
        "tz_conversion": coordinator.solcast._tz,
        "remaining_requests": coordinator.solcast.get_api_used_count(),
        "rooftop_site_count": len(coordinator.solcast._sites),
        "solcast_data": coordinator.data,
        "converted_data": coordinator.solcast._tzdataconverted,
        "energy_history_graph": coordinator._previousenergy,
        "energy_forecasts_graph": coordinator.solcast._dataenergy["wh_hours"],
    }
    