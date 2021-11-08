"""Energy platform."""
from __future__ import annotations

from homeassistant.core import HomeAssistant
from .const import DOMAIN
from . import SolcastRooftopSite


async def async_get_solar_forecast(hass: HomeAssistant, config_entry_id: str):
    """Get solar forecast for a config entry ID."""

    coordinator: SolcastRooftopSite = hass.data[DOMAIN][config_entry_id]
    
    if coordinator is None:
        return None

    return coordinator.get_energy_tab_data()