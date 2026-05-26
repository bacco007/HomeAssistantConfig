"""Sensor entities for Real Horizon."""

from __future__ import annotations

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.const import DEGREE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import RealHorizonConfigEntry
from .const import DOMAIN
from .coordinator import RealHorizonCoordinator, RealHorizonData


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RealHorizonConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: RealHorizonCoordinator = entry.runtime_data
    async_add_entities(
        [
            TrueSunriseSensor(coordinator, entry),
            TrueSunsetSensor(coordinator, entry),
            SunClearanceSensor(coordinator, entry),
            HorizonAtSunSensor(coordinator, entry),
            LocalHorizonSensor(coordinator, entry),
        ]
    )


class _Base(CoordinatorEntity[RealHorizonCoordinator], SensorEntity):
    _attr_has_entity_name = True

    def __init__(self, coordinator: RealHorizonCoordinator, entry: RealHorizonConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_{self._attr_translation_key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name="Real Horizon",
            manufacturer="PVGIS / SRTM",
            entry_type=DeviceEntryType.SERVICE,
        )

    @property
    def _d(self) -> RealHorizonData:
        return self.coordinator.data


class TrueSunriseSensor(_Base):
    _attr_translation_key = "true_sunrise"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def native_value(self):
        return self._d.true_sunrise


class TrueSunsetSensor(_Base):
    _attr_translation_key = "true_sunset"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def native_value(self):
        return self._d.true_sunset


class SunClearanceSensor(_Base):
    _attr_translation_key = "sun_clearance"
    _attr_native_unit_of_measurement = DEGREE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 2

    @property
    def native_value(self):
        return round(self._d.clearance, 3)


class HorizonAtSunSensor(_Base):
    _attr_translation_key = "horizon_at_sun"
    _attr_native_unit_of_measurement = DEGREE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 2

    @property
    def native_value(self):
        return round(self._d.horizon_at_sun, 3)


class LocalHorizonSensor(_Base):
    """Static state ('ok'), with the full horizon profile as an attribute.

    Lets the (future) Lovelace card read entity attributes to draw the silhouette.
    """

    _attr_translation_key = "local_horizon"
    _attr_entity_registry_enabled_default = True

    @property
    def native_value(self):
        return "ok"

    @property
    def extra_state_attributes(self):
        return {
            "latitude": self.coordinator._lat,
            "longitude": self.coordinator._lon,
            "profile": self.coordinator.horizon.to_list(),
            "sun_azimuth": round(self._d.sun_azimuth, 3),
            "sun_elevation": round(self._d.sun_elevation, 3),
            "crossings": [
                {"time": t.isoformat(), "kind": k} for t, k in self._d.crossings
            ],
            "sun_path_today": [
                {"time": t.isoformat(), "az": round(az, 3), "elev": round(el, 3)}
                for t, az, el in self._d.sun_path_today
            ],
            "moon_azimuth": round(self._d.moon_azimuth, 3),
            "moon_elevation": round(self._d.moon_elevation, 3),
            "moon_phase": round(self._d.moon_phase, 4),
            "moon_path_today": [
                {"time": t.isoformat(), "az": round(az, 3), "elev": round(el, 3)}
                for t, az, el in self._d.moon_path_today
            ],
            "moon_crossings": [
                {"time": t.isoformat(), "kind": k}
                for t, k in self._d.moon_crossings
            ],
            "moon_rise": self._d.moon_rise.isoformat() if self._d.moon_rise else None,
            "moon_set": self._d.moon_set.isoformat() if self._d.moon_set else None,
        }
