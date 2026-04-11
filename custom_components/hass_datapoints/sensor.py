"""Sensor platform for Hass Data Points."""

from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .store import DatapointsStore


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Hass Data Points sensor entities from a config entry."""
    store: DatapointsStore = hass.data[DOMAIN]["store"]
    async_add_entities([DatapointsCountSensor(entry, store)])


class DatapointsCountSensor(SensorEntity):
    """Expose the total number of recorded datapoints."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:counter"

    def __init__(self, entry: ConfigEntry, store: DatapointsStore) -> None:
        """Initialize the datapoint count sensor."""
        self._entry = entry
        self._store = store
        self._attr_unique_id = f"{entry.entry_id}_datapoint_count"
        self._attr_name = "Datapoint count"
        self._attr_native_value = store.get_event_count()

    @property
    def device_info(self) -> DeviceInfo:
        """Return device information for the integration."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry.entry_id)},
            name="Hass Data Points",
            manufacturer="buggedcom",
            model="Data Points",
        )

    async def async_added_to_hass(self) -> None:
        """Register store listeners when the entity is added."""
        await super().async_added_to_hass()
        self.async_on_remove(self._store.async_add_listener(self._handle_store_update))

    def _handle_store_update(self) -> None:
        """Refresh state after a store mutation."""
        self._attr_native_value = self._store.get_event_count()
        self.async_write_ha_state()
