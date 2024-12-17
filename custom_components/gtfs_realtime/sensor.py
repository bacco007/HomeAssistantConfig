"""Platform for sensor integration."""

from __future__ import annotations

import os

from gtfs_station_stop.arrival import Arrival
from gtfs_station_stop.calendar import Calendar
from gtfs_station_stop.route_info import RouteInfoDatabase, RouteType
from gtfs_station_stop.station_stop import StationStop
from gtfs_station_stop.station_stop_info import StationStopInfo, StationStopInfoDatabase
from gtfs_station_stop.trip_info import TripInfoDatabase
from homeassistant.components.sensor import (
    PLATFORM_SCHEMA as SENSOR_PLATFORM_SCHEMA,
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant, callback
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType
from homeassistant.helpers.update_coordinator import CoordinatorEntity
import voluptuous as vol

from .const import (
    CAL_DB,
    CONF_ARRIVAL_LIMIT,
    CONF_ROUTE_ICONS,
    CONF_STOP_IDS,
    COORDINATOR_REALTIME,
    DOMAIN,
    HEADSIGN_PRETTY,
    ROUTE_COLOR_PRETTY,
    ROUTE_ID,
    ROUTE_TEXT_COLOR_PRETTY,
    ROUTE_TYPE_PRETTY,
    RTI_DB,
    SSI_DB,
    STOP_ID,
    TI_DB,
    TRIP_ID_PRETTY,
)
from .coordinator import GtfsRealtimeCoordinator

PLATFORM_SCHEMA = SENSOR_PLATFORM_SCHEMA.extend(
    {vol.Required(STOP_ID): cv.string, vol.Optional(CONF_ARRIVAL_LIMIT, default=4): int}
)


async def async_setup_entry(
    hass: HomeAssistant,
    config: ConfigType,
    add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    """Set up the sensor platform."""
    coordinator: GtfsRealtimeCoordinator = hass.data[DOMAIN][COORDINATOR_REALTIME]
    if discovery_info is None:
        if CONF_STOP_IDS in config.data:
            ssi_db: StationStopInfoDatabase = hass.data[DOMAIN][SSI_DB]
            ti_db: TripInfoDatabase = hass.data[DOMAIN][TI_DB]
            cal_db: Calendar = hass.data[DOMAIN][CAL_DB]
            rti_db: RouteInfoDatabase = hass.data[DOMAIN][RTI_DB]
            arrival_limit: int = config.data[CONF_ARRIVAL_LIMIT]
            route_icons: os.PathLike = hass.data[DOMAIN].get(CONF_ROUTE_ICONS)
            arrival_sensors = []
            for i in range(arrival_limit):
                for stop_id in config.data[CONF_STOP_IDS]:
                    arrival_sensors.append(
                        ArrivalSensor(
                            coordinator,
                            StationStop(stop_id, coordinator.hub),
                            i,
                            ssi_db[stop_id],
                            ti_db,
                            cal_db,
                            rti_db,
                            route_icons=route_icons,
                        )
                    )
            add_entities(arrival_sensors, update_before_add=True)


class ArrivalSensor(SensorEntity, CoordinatorEntity):
    """Representation of a Station GTFS Realtime Arrival Sensor."""

    _attr_native_unit_of_measurement = UnitOfTime.SECONDS
    _attr_suggested_unit_of_measurement = UnitOfTime.MINUTES
    _attr_device_class = SensorDeviceClass.DURATION
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_entity_picture: str | None = None

    ICON_DICT = {
        RouteType.TRAM: "mdi:tram",
        RouteType.SUBWAY: "mdi:subway-variant",
        RouteType.RAIL: "mdi:train",
        RouteType.FERRY: "mdi:ferry",
    }

    def __init__(
        self,
        coordinator: GtfsRealtimeCoordinator,
        station_stop: StationStop,
        idx: int,
        station_stop_info: StationStopInfo | None = None,
        trip_info_db: TripInfoDatabase | None = None,
        calendar_db: Calendar | None = None,
        route_info_db: RouteInfoDatabase | None = None,
        route_icons: os.PathLike | None = None,
    ) -> None:
        """Initialize the sensor."""
        # Required
        super().__init__(coordinator)
        self.station_stop = station_stop
        self._idx = idx
        # Allowed to be `None`
        self.station_stop_info = station_stop_info
        self.trip_info_db = trip_info_db
        self.calendar_db = calendar_db
        self.route_icons = route_icons
        self.route_info_db = route_info_db
        self.route_type = RouteType.UNKNOWN

        self._name = f"{self._idx + 1}: {self._get_station_ref()}"
        self._attr_unique_id = f"arrival_{self.station_stop.id}_{self._idx}"
        self._attr_suggested_display_precision = 0
        self._attr_suggested_unit_of_measurement = UnitOfTime.MINUTES
        self._arrival_detail: dict[str, str] = {}

    def _get_station_ref(self):
        return (
            self.station_stop_info.name
            if self.station_stop_info is not None
            else self.station_stop.id
        )

    @property
    def name(self) -> str:
        """Name of the station from static data or else the Stop ID."""
        return self._name

    @property
    def extra_state_attributes(self) -> dict[str, str]:
        """Explanation of Alerts for a given Stop ID."""
        return self._arrival_detail

    @property
    def entity_picture(self) -> str | None:
        return (
            str(self.route_icons).format(
                self._arrival_detail[ROUTE_ID],
                self._arrival_detail.get(ROUTE_COLOR_PRETTY, "%230039A6"),
                self._arrival_detail.get(ROUTE_TEXT_COLOR_PRETTY, "%23FFFFFF"),
            )
            if self.route_icons and self._arrival_detail.get(ROUTE_ID) is not None
            else None
        )

    @property
    def icon(self) -> str:
        return self.__class__.ICON_DICT.get(self.route_type, "mdi:bus-clock")

    def update(self) -> None:
        time_to_arrivals = sorted(self.station_stop.get_time_to_arrivals())
        self._arrival_detail = {}
        if len(time_to_arrivals) > self._idx:
            time_to_arrival: Arrival = time_to_arrivals[self._idx]
            self._attr_native_value = max(
                time_to_arrival.time, 0
            )  # do not allow negative numbers
            self._arrival_detail[ROUTE_ID] = time_to_arrival.route
            if self.trip_info_db is not None:
                trip_info = self.trip_info_db.get_close_match(
                    time_to_arrival.trip, self.calendar_db
                )
                if trip_info is not None:
                    self._arrival_detail[HEADSIGN_PRETTY] = trip_info.trip_headsign
                    self._arrival_detail[TRIP_ID_PRETTY] = trip_info.trip_id
            if self.route_info_db is not None:
                route_info = self.route_info_db.get(time_to_arrival.route)
                if route_info is not None:
                    self._arrival_detail[ROUTE_COLOR_PRETTY] = route_info.color
                    self._arrival_detail[ROUTE_TEXT_COLOR_PRETTY] = (
                        route_info.text_color
                    )
                    self.route_type = route_info.type
                    self._arrival_detail[ROUTE_TYPE_PRETTY] = (
                        route_info.type.pretty_name()
                    )
        else:
            self._attr_native_value = None
        self.async_write_ha_state()

    @callback
    def _handle_coordinator_update(self) -> None:
        self.update()
