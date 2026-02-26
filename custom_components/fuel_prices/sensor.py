"""Sensor for fuel prices."""

from __future__ import annotations


import logging

from collections.abc import Mapping
from typing import Any
from datetime import timedelta

from homeassistant.components.sensor import SensorEntity
from homeassistant.components.sensor.const import SensorDeviceClass
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE, CONF_RADIUS, CONF_NAME
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from pyfuelprices.const import PROP_FUEL_LOCATION_SOURCE
from . import FuelPricesConfigEntry
from .const import CONF_STATE_VALUE
from .entity import FuelStationEntity

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(minutes=1)


async def async_setup_entry(
    hass: HomeAssistant, entry: FuelPricesConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Integration platform creation."""
    entities = []
    found_entities = []
    state_value = entry.options.get(
        CONF_STATE_VALUE, entry.data.get(CONF_STATE_VALUE, "name")
    )
    for area in entry.runtime_data.areas:
        _LOGGER.debug("Registering entities for area %s", area[CONF_NAME])
        for station in await entry.runtime_data.coordinator.api.find_fuel_locations_from_point(
            coordinates=(area[CONF_LATITUDE], area[CONF_LONGITUDE]),
            radius=area[CONF_RADIUS],
        ):
            if station["id"] not in found_entities:
                entities.append(
                    FuelStationTracker(
                        coordinator=entry.runtime_data.coordinator,
                        fuel_station_id=station["id"],
                        entity_id="devicetracker",
                        source=station["props"][PROP_FUEL_LOCATION_SOURCE],
                        area=area[CONF_NAME],
                        state_value=state_value,
                        config=entry
                    )
                )
                found_entities.append(station["id"])
    async_add_entities(entities, True)


class FuelStationTracker(FuelStationEntity, SensorEntity):
    """A fuel station entity."""

    @property
    def native_value(self) -> str:
        """Return the native value of the entity."""
        if self.state_value == "name":
            return self._fuel_station.name
        return self._get_fuels.get(self.state_value, self._fuel_station.name)

    @property
    def _get_fuels(self) -> dict:
        """Return list of fuels."""
        output = {}
        for fuel in self._fuel_station.available_fuels:
            output[fuel.fuel_type] = fuel.cost
        return output

    @property
    def extra_state_attributes(self) -> Mapping[str, Any] | None:
        """Return extra state attributes."""
        return {
            **self._fuel_station.__dict__,
            **self._get_fuels,
            "area": self.area
        }

    @property
    def icon(self) -> str:
        """Return entity icon."""
        if self._fuel_station.brand == "Pod Point":
            return "mdi:battery-charging"
        return "mdi:gas-station"

    @property
    def name(self) -> str:
        """Return the name of the entity."""
        return self._fuel_station.name

    @property
    def native_unit_of_measurement(self) -> str:
        """Return unit of measurement."""
        if isinstance(self.native_value, str):
            return None
        return self._fuel_station.currency.upper()

    @property
    def state_class(self) -> str:
        """Return state type."""
        if isinstance(self.native_value, str):
            return None
        return "total"

    @property
    def device_class(self) -> SensorDeviceClass | None:
        """Return device class."""
        if isinstance(self.native_value, str):
            return None
        return SensorDeviceClass.MONETARY
