"""Sensor platform for ADS-B SkyVista integration."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import FlightCardDataUpdateCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up ADS-B SkyVista sensor from config entry."""
    coordinator: FlightCardDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([FlightCardAircraftSensor(coordinator, entry)])


class FlightCardAircraftSensor(
    CoordinatorEntity[FlightCardDataUpdateCoordinator], SensorEntity
):
    """Expose aircraft summary and geojson payload."""

    _attr_has_entity_name = True
    _attr_name = "Aircraft"
    _attr_icon = "mdi:airplane"

    def __init__(self, coordinator: FlightCardDataUpdateCoordinator, entry: ConfigEntry) -> None:
        """Initialize sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_aircraft"

    @property
    def native_value(self) -> int:
        """Return current aircraft count."""
        data = self.coordinator.data or {}
        count = data.get("aircraft_count", 0)
        try:
            return int(count)
        except (TypeError, ValueError):
            return 0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return sensor attributes."""
        data = self.coordinator.data or {}
        return {
            "source_domain": DOMAIN,
            "config_entry_id": self._entry.entry_id,
            "geojson": data.get("geojson", {"type": "FeatureCollection", "features": []}),
            "updated": data.get("updated"),
            "data_url": data.get("data_url"),
            "max_age": data.get("max_age"),
            "hexdb_enabled": data.get("hexdb_enabled"),
        }
