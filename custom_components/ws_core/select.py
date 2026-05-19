"""Select entities for Weather Station Core."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import CONF_PREFIX, DEFAULT_PREFIX, DOMAIN

GRAPH_RANGE_OPTIONS = ["6h", "24h", "3d"]
GRAPH_RANGE_DEFAULT = "24h"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up select entities."""
    prefix = (entry.options.get(CONF_PREFIX) or entry.data.get(CONF_PREFIX) or DEFAULT_PREFIX).strip().lower()
    async_add_entities([WSGraphRangeSelect(entry, prefix)])


class WSGraphRangeSelect(RestoreEntity, SelectEntity):
    """Select entity for dashboard graph time range."""

    _attr_options = GRAPH_RANGE_OPTIONS
    _attr_icon = "mdi:chart-timeline-variant"

    _attr_has_entity_name = True
    _attr_translation_key = "ws_graph_range"

    def __init__(self, entry: ConfigEntry, prefix: str) -> None:
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_graph_range"
        self._attr_suggested_object_id = f"{prefix}_graph_range"
        self._attr_current_option = GRAPH_RANGE_DEFAULT

    @property
    def device_info(self):
        return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

    async def async_added_to_hass(self) -> None:
        """Restore last state."""
        await super().async_added_to_hass()
        desired = f"select.{self._attr_suggested_object_id}"
        if self.entity_id and self.entity_id != desired:
            reg = er.async_get(self.hass)
            current = reg.async_get(self.entity_id)
            if current and current.unique_id == self.unique_id and reg.async_get(desired) is None:
                reg.async_update_entity(self.entity_id, new_entity_id=desired)
        last_state = await self.async_get_last_state()
        if last_state and last_state.state in GRAPH_RANGE_OPTIONS:
            self._attr_current_option = last_state.state

    async def async_select_option(self, option: str) -> None:
        """Update the selected option."""
        self._attr_current_option = option
        self.async_write_ha_state()
