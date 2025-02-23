"""Fuel Price entity base type."""

from __future__ import annotations

from homeassistant.helpers.entity import Entity
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.config_entries import ConfigEntry

from .coordinator import FuelPricesCoordinator


class FuelPriceEntity:
    """Top level entity type."""

    config: ConfigEntry


class FuelStationEntity(FuelPriceEntity, CoordinatorEntity):
    """Represents a fuel station."""

    def __init__(
        self, coordinator: FuelPricesCoordinator, fuel_station_id, entity_id, source, area, state_value, config: ConfigEntry
    ) -> None:
        """Initialize."""
        self.config = config
        super().__init__(coordinator)
        self.coordinator: FuelPricesCoordinator = coordinator
        self._fuel_station_id = fuel_station_id
        self._entity_id = entity_id
        self._fuel_station_source = str(source).lower()
        self.area = area
        self.state_value = state_value

    @property
    def _fuel_station(self):
        """Return the fuel station."""
        return self.coordinator.api.configured_sources[
            self._fuel_station_source
        ].location_cache[self._fuel_station_id]

    @property
    def unique_id(self) -> str | None:
        """Return unique ID."""
        return f"fuelprices_{self._fuel_station_id}_{self._entity_id}"


class CheapestFuelEntity(FuelPriceEntity, Entity):
    """Represents a fuel."""

    def __init__(
            self, coordinator: FuelPricesCoordinator, count: str, area: str, fuel: str, coords: tuple, radius: float, config: ConfigEntry):
        """Initialize."""
        self.coordinator: FuelPricesCoordinator = coordinator
        self.config = config
        self._count = count
        self._area = area
        self._coords = coords
        self._radius = radius
        self._fuel = fuel

    @property
    def unique_id(self) -> str | None:
        """Return unique ID."""
        return f"fuelprices_cheapest_{self._fuel}_{self._count}_{self._area}"
