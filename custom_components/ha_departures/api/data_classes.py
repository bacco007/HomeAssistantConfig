"""Data classes and enums for API classes."""

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from typing import Any

from custom_components.ha_departures.helper import str_to_datetime


class ApiCommand(StrEnum):
    """API commanStrEnum."""

    STOPS = "v1/map/stops"
    STOP_TIMES = "v5/stoptimes"
    ONE_TO_ALL = "v1/one-to-all"
    TRIP_DETAILS = "v5/trip"
    REVERSE_GEOCODE = "v1/reverse-geocode"


class TransportMode(StrEnum):
    """Transport mode enums."""

    BIKE = "BIKE"
    RENTAL = "RENTAL"
    CAR = "CAR"
    CAR_PARKING = "CAR_PARKING"
    CAR_DROPOFF = "CAR_DROPOFF"
    ODM = "ODM"
    RIDE_SHARING = "RIDE_SHARING"
    FLEX = "FLEX"
    TRANSIT = "TRANSIT"
    TRAM = "TRAM"
    SUBWAY = "SUBWAY"
    FERRY = "FERRY"
    AIRPLANE = "AIRPLANE"
    SUBURBAN = "SUBURBAN"
    BUS = "BUS"
    COACH = "COACH"
    RAIL = "RAIL"
    HIGHSPEED_RAIL = "HIGHSPEED_RAIL"
    LONG_DISTANCE = "LONG_DISTANCE"
    NIGHT_RAIL = "NIGHT_RAIL"
    REGIONAL_FAST_RAIL = "REGIONAL_FAST_RAIL"
    REGIONAL_RAIL = "REGIONAL_RAIL"
    CABLE_CAR = "CABLE_CAR"
    FUNICULAR = "FUNICULAR"
    AERIAL_LIFT = "AERIAL_LIFT"
    OTHER = "OTHER"
    AREAL_LIFT = "AREAL_LIFT"
    METRO = "METRO"
    UNKNOWN = "unknown"


@dataclass
class Stop:
    """Data class for a transit stop."""

    id: str
    name: str
    latitude: float
    longitude: float

    @staticmethod
    def from_dict(data: dict[str, Any]) -> "Stop":
        """Create a Stop object from a dictionary."""
        return Stop(
            id=data.get("stopId", "unknown"),
            name=data.get("name", "unknown"),
            latitude=data.get("lat", 0.0),
            longitude=data.get("lon", 0.0),
        )

    def __str__(self):
        """Return string representation of Stop object."""
        return self.id


@dataclass
class StopTime:
    """Data class for a stop time."""

    mode: TransportMode
    real_time: bool
    head_sign: str
    short_name: str
    route_id: str
    direction: str
    arrival_time: str
    departure_time: str
    scheduled_arrival_time: str
    scheduled_departure_time: str
    cancelled: bool

    @staticmethod
    def from_dict(data: dict[str, Any]) -> "StopTime":
        """Create a StopTime object from a dictionary."""
        return StopTime(
            mode=TransportMode(data.get("mode", "unknown")),
            real_time=data.get("realTime", False),
            head_sign=data.get("headsign", "unknown"),
            short_name=data.get("routeShortName", "unknown"),
            route_id=data.get("routeId", "unknown"),
            direction=data.get("directionId", "unknown"),
            arrival_time=data.get("place", {}).get("arrival", ""),
            departure_time=data.get("place", {}).get("departure", ""),
            scheduled_arrival_time=data.get("place", {}).get("scheduledArrival", ""),
            scheduled_departure_time=data.get("place", {}).get("scheduledDeparture"),
            cancelled=data.get("cancelled", False),
        )


@dataclass
class Line:
    """Data class for a transit line."""

    route_id: str
    direction_id: str
    head_sign: str
    route_short_name: str
    mode: TransportMode

    def to_dict(self) -> dict[str, Any]:
        """Convert Line object to dictionary."""
        return {
            "route_id": self.route_id,
            "direction_id": self.direction_id,
            "head_sign": self.head_sign,
            "route_short_name": self.route_short_name,
            "transport_mode": self.mode.value,
        }

    @staticmethod
    def from_dict(data: dict[str, Any]) -> "Line":
        """Create a Line object from a dictionary."""
        return Line(
            route_id=data.get("route_id", "unknown"),
            direction_id=data.get("direction_id", "unknown"),
            head_sign=data.get("head_sign", "unknown"),
            route_short_name=data.get("route_short_name", "unknown"),
            mode=TransportMode(data.get("transport_mode", "unknown")),
        )

    def __hash__(self) -> int:
        """Override hash function for Line class."""
        return hash((self.route_id, self.direction_id))

    def __eq__(self, value: object) -> bool:
        """Override equality check for Line class."""
        if not isinstance(value, Line):
            return NotImplemented
        return (
            self.route_id == value.route_id and self.direction_id == value.direction_id
        )



@dataclass
class Departure:
    """Data class for a departure."""

    route_id: str
    direction_id: str
    trip_id: str
    stop_id: str
    departure: datetime | None
    head_sign: str
    scheduled_departure: datetime | None
    real_time: bool
    cancelled: bool = False
    trip_cancelled: bool = False
    alerts: bool = False

    @staticmethod
    def from_dict(data: dict[str, Any]) -> "Departure":
        """Create a Departure object from a dictionary."""

        departure_time = data.get("place", {}).get("departure")
        scheduled_departure_time = data.get("place", {}).get("scheduledDeparture")
        alerts = data.get("place", {}).get("alerts", [])

        return Departure(
            route_id=data.get("routeId", "unknown"),
            direction_id=data.get("directionId", "unknown"),
            trip_id=data.get("tripId", "unknown"),
            stop_id=data.get("place", {}).get("stopId", "unknown"),
            departure=str_to_datetime(departure_time),
            scheduled_departure=str_to_datetime(scheduled_departure_time),
            head_sign=data.get("headsign", ""),
            real_time=data.get("realTime", False),
            cancelled=data.get("cancelled", False),
            trip_cancelled=data.get("tripCancelled", False),
            alerts=bool(alerts),
        )

    def __hash__(self) -> int:
        """Override hash function for Departure class."""
        return hash(
            (
                self.route_id,
                self.direction_id,
                self.trip_id,
                self.departure,
                self.stop_id,
            )
        )
