"""Diagnostics support for Holidays."""
from __future__ import annotations

from typing import Any, Dict

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from . import const


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> Dict[str, Any]:
    """Return diagnostics for a config entry."""
    entities = hass.data[const.DOMAIN][const.CALENDAR_PLATFORM]
    entity_data = [
        entities[entity]
        for entity in entities
        if entities[entity].unique_id == entry.data["unique_id"]
    ][0]
    attributes = entity_data.extra_state_attributes
    attributes["holidays"] = entity_data.holidays
    data = {
        "entity_id": entity_data.entity_id,
        "state": entity_data.state,
        "attributes": attributes,
        "config_entry": entry.as_dict(),
    }
    return data
