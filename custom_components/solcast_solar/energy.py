"""Energy platform."""
from __future__ import annotations
from collections import OrderedDict

from homeassistant.core import HomeAssistant

from . import SolcastUpdateCoordinator
from .const import DOMAIN

import logging

_LOGGER = logging.getLogger(__name__)


async def async_get_solar_forecast(hass: HomeAssistant, config_entry_id: str):
    """Get solar forecast for a config entry ID."""

    coordinator: SolcastUpdateCoordinator = hass.data[DOMAIN][config_entry_id]
    
    if coordinator is None:
        return None
        
    d = coordinator.get_energy_tab_data()
    
    try:
        e = coordinator._previousenergy
        e.update(d['wh_hours'])
        e = OrderedDict(sorted(e.items()))
        d = {"wh_hours": e}
        #d['wh_hours'].update(e)
    except Exception as e:
        _LOGGER.warn(e)
        
    return d 
