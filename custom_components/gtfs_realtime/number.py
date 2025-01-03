"""Time Entity for Static Updates."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import timedelta
from functools import cached_property
import os

from homeassistant.components.number import (
    NumberDeviceClass,
    NumberEntityDescription,
    RestoreNumber,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from custom_components.gtfs_realtime.coordinator import GtfsRealtimeCoordinator

from .const import CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT, DOMAIN


@dataclass(frozen=True, kw_only=True)
class GtfsRealtimeNumberDescription(NumberEntityDescription):
    """Describes GTFS Realtime number entity."""

    store_value_fn: Callable[[GtfsRealtimeCoordinator, os.PathLike, float | None], None]


def store_refresh_hours(
    coordinator: GtfsRealtimeCoordinator,
    gtfs_static_source: os.PathLike,
    value: float | None,
):
    """Store the desired update frequency."""
    coordinator.static_timedelta[str(gtfs_static_source)] = timedelta(hours=value)


NUMBER_TYPES: list[GtfsRealtimeNumberDescription] = [
    GtfsRealtimeNumberDescription(
        key="refresh",
        translation_key="refresh",
        device_class=NumberDeviceClass.DURATION,
        entity_category=EntityCategory.CONFIG,
        native_max_value=8760.0,
        native_min_value=0.5,
        native_step=0.5,
        native_unit_of_measurement=UnitOfTime.HOURS,
        store_value_fn=store_refresh_hours,
    )
]


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
):
    """Set up a timer for each static update source."""
    coordinator = config_entry.runtime_data
    async_add_entities(
        GtfsStaticUpdateInterval(
            coordinator,
            gtfs_static_source,
            NUMBER_TYPES[0],
        )
        for gtfs_static_source in coordinator.gtfs_static_zip
    )


class GtfsStaticUpdateInterval(RestoreNumber):
    """Time entity for setting static update intervals."""

    entity_description: GtfsRealtimeNumberDescription

    def __init__(
        self,
        coordinator: GtfsRealtimeCoordinator,
        gtfs_static_source: os.PathLike,
        description: GtfsRealtimeNumberDescription,
    ):
        self.coordinator = coordinator
        self._gtfs_static_source = gtfs_static_source
        self.entity_description = description
        self._attr_unique_id = f"refresh_gtfs_schedule_interval-{gtfs_static_source}"
        self._attr_name = f"Refresh Schedule Feed Interval: {self._gtfs_static_source}"
        self._attr_native_value = self.coordinator.static_timedelta.get(
            self._gtfs_static_source
        )

    async def async_set_native_value(self, value: float):
        """Update the current interval."""
        self._attr_native_value = value
        self.entity_description.store_value_fn(
            self.coordinator, self._gtfs_static_source, value
        )
        self.async_write_ha_state()

    async def async_added_to_hass(self):
        await super().async_added_to_hass()
        last_number_data = await self.async_get_last_number_data()
        value = (
            last_number_data.native_value
            if last_number_data is not None
            else timedelta(
                hours=CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT
            ).total_seconds()
            / 3600
        )
        self._attr_native_value = value
        self.entity_description.store_value_fn(
            self.coordinator, self._gtfs_static_source, value
        )

    @cached_property
    def device_info(self) -> DeviceInfo:
        """Return the device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, ",".join(self.coordinator.gtfs_static_zip))},
            name="GTFS Schedule",
            manufacturer=self.coordinator.gtfs_provider,
        )
