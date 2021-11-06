"""Energy platform."""
from __future__ import annotations

from homeassistant.core import HomeAssistant

from .const import DOMAIN
import logging
from homeassistant.components.recorder.util import session_scope
from homeassistant.components.recorder.models import Events
import json
import datetime
from isodate import parse_datetime
from . import SolcastRooftopSite

#is_entity_recorded
#def is_entity_recorded(hass: HomeAssistant, entity_id: str) -> bool:


#async def async_get_solar_forecast(hass, config_entry_id: str):
#    """Get solar forecast for a config entry ID."""
#    #logging.warn(config_entry_id)
#    #logging.warn(hass.data[config_entry_id])
#    return {"wh_hours": {
#                "2021-10-24T13:00:00+10:00": 1200,
#                "2021-10-24T14:00:00+10:00": 800,
#                "2021-10-24T15:00:00+10:00": 8000,
#            }
#    }

#async def async_get_solar_forecast(hass: HomeAssistant, config_entry_id: str) -> dict[str, dict[str, float | int]] | None:
async def async_get_solar_forecast(hass: HomeAssistant, config_entry_id: str):
    """Get solar forecast for a config entry ID."""

    coordinator: SolcastRooftopSite = hass.data[config_entry_id]
    
    if coordinator is None:
        return None

    return coordinator.get_energy_tab_data()