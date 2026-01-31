"""Sensor for fuel prices."""

from __future__ import annotations


import logging

from collections.abc import Mapping
from typing import Any
from datetime import datetime, timedelta

from homeassistant.components.sensor import SensorEntity
from homeassistant.components.sensor.const import SensorDeviceClass
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE, CONF_RADIUS, CONF_NAME, STATE_UNKNOWN, CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from pyfuelprices.const import PROP_FUEL_LOCATION_SOURCE
from . import FuelPricesConfigEntry
from .const import CONF_STATE_VALUE, CONF_CHEAPEST_SENSORS, CONF_CHEAPEST_SENSORS_COUNT, CONF_CHEAPEST_SENSORS_FUEL_TYPE
from .entity import FuelStationEntity, CheapestFuelEntity

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
        if area.get(CONF_CHEAPEST_SENSORS, False) and area.get(CONF_CHEAPEST_SENSORS_FUEL_TYPE) is not None:
            _LOGGER.debug("Registering %s cheapest entities for area %s",
                          area[CONF_CHEAPEST_SENSORS_COUNT],
                          area[CONF_NAME])
            for x in range(0, int(area[CONF_CHEAPEST_SENSORS_COUNT]), 1):
                entities.append(CheapestFuelSensor(
                    coordinator=entry.runtime_data.coordinator,
                    count=x+1,
                    area=area[CONF_NAME],
                    fuel=area[CONF_CHEAPEST_SENSORS_FUEL_TYPE],
                    coords=(area[CONF_LATITUDE], area[CONF_LONGITUDE]),
                    radius=area[CONF_RADIUS],
                    config=entry
                ))
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


class CheapestFuelSensor(CheapestFuelEntity, SensorEntity):
    """A entity that shows the cheapest fuel for an area."""

    _attr_force_update = True
    _attr_should_poll = True  # we need to query the module for this data
    _last_update = None
    _next_update = datetime.now()
    _cached_data = None

    async def async_update(self) -> None:
        """Update device data."""
        if (self._last_update is not None) and (
            self._next_update > datetime.now()
        ):
            return True
        data = await self.coordinator.api.find_fuel_from_point(
            coordinates=self._coords,
            fuel_type=self._fuel,
            radius=self._radius
        )
        if len(data) >= (int(self._count)-1):
            self._last_update = datetime.now()
            self._next_update = datetime.now() + timedelta(minutes=self.config.options.get(
                CONF_SCAN_INTERVAL, self.config.data.get(
                    CONF_SCAN_INTERVAL, 1440)
            ))
            if len(data) >= self._count:
                self._cached_data = data[int(self._count)-1]
            else:
                self._cached_data = {}
            return True
        self._cached_data = None

    @property
    def native_value(self) -> str | float | int:
        """Return state of entity."""
        if self._cached_data is not None:
            return self._cached_data.get("cost", STATE_UNKNOWN)
        return STATE_UNKNOWN

    @property
    def device_class(self) -> SensorDeviceClass | None:
        """Return device class."""
        if isinstance(self.native_value, float) or isinstance(self.native_value, int):
            return SensorDeviceClass.MONETARY
        return None

    @property
    def name(self) -> str:
        """Name of the entity."""
        return f"{self._area} cheapest {self._fuel} {self._count}"

    @property
    def native_unit_of_measurement(self) -> str:
        """Return unit of measurement."""
        if isinstance(self.native_value, float) or isinstance(self.native_value, int):
            return self._cached_data["currency"]
        return None

    @property
    def state_class(self) -> str:
        """Return state type."""
        if isinstance(self.native_value, float) or isinstance(self.native_value, int):
            return "total"
        return None

    @property
    def extra_state_attributes(self) -> Mapping[str, Any] | None:
        """Return extra state attributes."""
        data = {}
        if self._cached_data is not None:
            data = self._cached_data
        data["area"] = self._area
        data["sensor_last_poll"] = self._last_update
        data["sensor_next_poll"] = self._next_update
        return data
