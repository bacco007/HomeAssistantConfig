"""The epg Browser integration."""
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from .const import DOMAIN
import logging
from typing import Final
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.entity_registry import async_get as get_entity_registry


_LOGGER: Final = logging.getLogger(__name__)
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up Your Integration from a config entry."""

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data
    entry.async_on_unload(entry.add_update_listener(update_listener))

    await hass.config_entries.async_forward_entry_setups(entry, ["sensor"])
    return True
async def update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Update listener."""
    await hass.config_entries.async_reload(entry.entry_id)

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    hass.data[DOMAIN].pop(entry.entry_id, None)
    registry = get_entity_registry(hass)
    entities_to_remove =[]
    for entity in registry.entities:
        reg_entity=registry.entities.get(entity)
        if reg_entity.config_entry_id == entry.entry_id and reg_entity.unique_id not in entry.options["selected_channels"]:
            entities_to_remove.append(entity)
    try:
        for entity in entities_to_remove:
            await registry.async_remove(entity)
    except Exception as ignore:
        _LOGGER.debug(ignore)

    await hass.config_entries.async_forward_entry_unload(entry, "sensor")
    return True
