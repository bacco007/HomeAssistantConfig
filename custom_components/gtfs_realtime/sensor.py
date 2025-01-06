"""Platform for sensor integration."""

from __future__ import annotations

from gtfs_station_stop.arrival import Arrival
from gtfs_station_stop.route_info import RouteType
from gtfs_station_stop.station_stop import StationStop
from gtfs_station_stop.station_stop_info import StationStopInfo
from homeassistant.components.sensor import (
    PLATFORM_SCHEMA as SENSOR_PLATFORM_SCHEMA,
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant, callback
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
import voluptuous as vol

from custom_components.gtfs_realtime import GtfsRealtimeConfigEntry

from .const import (
    CONF_ARRIVAL_LIMIT,
    CONF_STOP_IDS,
    DOMAIN,
    HEADSIGN,
    ROUTE_COLOR,
    ROUTE_ID,
    ROUTE_TEXT_COLOR,
    ROUTE_TYPE,
    STOP_ID,
    TRIP_ID,
)
from .coordinator import GtfsRealtimeCoordinator

PLATFORM_SCHEMA = SENSOR_PLATFORM_SCHEMA.extend(
    {vol.Required(STOP_ID): cv.string, vol.Optional(CONF_ARRIVAL_LIMIT, default=4): int}
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: GtfsRealtimeConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor platform."""
    coordinator: GtfsRealtimeCoordinator = entry.runtime_data
    if CONF_STOP_IDS in entry.data:
        arrival_limit: int = int(round(entry.data[CONF_ARRIVAL_LIMIT]))
        arrival_sensors = []
        for i in range(arrival_limit):
            for stop_id in entry.data[CONF_STOP_IDS]:
                arrival_sensors.append(
                    ArrivalSensor(
                        coordinator=coordinator,
                        stop_id=stop_id,
                        idx=i,
                    )
                )
        async_add_entities(arrival_sensors, update_before_add=True)


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
        self, coordinator: GtfsRealtimeCoordinator, stop_id: str, idx: int
    ) -> None:
        """Initialize the sensor."""
        # Required
        super().__init__(coordinator=coordinator)
        self.station_stop = coordinator.gtfs_update_data.station_stops.setdefault(
            stop_id, StationStop(stop_id, coordinator.hub)
        )
        self._idx = idx
        self.coordinator = coordinator
        self.route_type = RouteType.UNKNOWN

        self._name = f"{self._idx + 1}: {self._get_stop_ref()}"
        self._attr_unique_id = f"arrival_{self.station_stop.id}_{self._idx}"
        self._attr_suggested_display_precision = 0
        self._attr_suggested_unit_of_measurement = UnitOfTime.MINUTES
        self._arrival_detail: dict[str, str] = {}

    def _get_stop_info(self) -> StationStopInfo | None:
        return self.coordinator.gtfs_update_data.schedule.get_stop_info(
            self.station_stop.id
        )

    def _get_stop_ref(self):
        station_stop_info = self._get_stop_info()
        if station_stop_info is not None:
            return station_stop_info.name
        return self.station_stop.id

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
        """Provide the entity picture from a URL."""
        return (
            str(self.coordinator.route_icons).format(
                self._arrival_detail[ROUTE_ID],
                self._arrival_detail.get(ROUTE_COLOR, "%230039A6"),
                self._arrival_detail.get(ROUTE_TEXT_COLOR, "%23FFFFFF"),
            )
            if self.coordinator.route_icons
            and self._arrival_detail.get(ROUTE_ID) is not None
            else None
        )

    @property
    def icon(self) -> str:
        """Provide the icon."""
        return self.__class__.ICON_DICT.get(self.route_type, "mdi:bus-clock")

    @property
    def device_info(self) -> DeviceInfo:
        """Return the device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self.station_stop.id)},
            name=f"{self._get_stop_ref()} ({self.station_stop.id})",
            manufacturer=self.coordinator.gtfs_provider,
            model=self.station_stop.id,
        )

    def update(self) -> None:
        """Update state from coordinator data."""
        time_to_arrivals = sorted(self.station_stop.get_time_to_arrivals())
        self._arrival_detail = {}
        if len(time_to_arrivals) > self._idx:
            time_to_arrival: Arrival = time_to_arrivals[self._idx]
            self._attr_native_value = max(
                time_to_arrival.time, 0
            )  # do not allow negative numbers
            self._arrival_detail[ROUTE_ID] = time_to_arrival.route
            self._arrival_detail[HEADSIGN] = (
                self.coordinator.data.schedule.get_trip_headsign(time_to_arrival.trip)
            )
            self._arrival_detail[TRIP_ID] = time_to_arrival.trip
            self._arrival_detail[ROUTE_COLOR] = (
                self.coordinator.data.schedule.get_route_color(time_to_arrival.route)
            )
            self._arrival_detail[ROUTE_TEXT_COLOR] = (
                self.coordinator.data.schedule.get_route_text_color(
                    time_to_arrival.route
                )
            )
            self._arrival_detail[ROUTE_TYPE] = (
                self.coordinator.data.schedule.get_route_type(time_to_arrival.route)
            )
        else:
            self._attr_native_value = None

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordainator."""
        self.update()
        super()._handle_coordinator_update()
