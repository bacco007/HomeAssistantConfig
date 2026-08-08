"""Binary sensor platform for the ADS-B Station integration."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
import logging
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import FEEDER_FR24, FEEDER_PLANEFINDER
from .coordinator import AdsbStationConfigEntry, AdsbStationDataUpdateCoordinator
from .entity import AdsbStationAircraftEntity, AdsbStationEntity
from .sensor import aircraft_attributes

_LOGGER = logging.getLogger(__name__)

# Updates are centralized through the coordinator
PARALLEL_UPDATES = 0

TRUE_VALUES = frozenset({"1", "true", "yes", "on", "connected"})
FALSE_VALUES = frozenset({"0", "false", "no", "off", "disconnected"})


def _as_int(value: Any) -> int | None:
    """Parse a counter, which a feeder may quote as a string."""
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _as_bool(value: Any) -> bool | None:
    """Parse a flag a feeder reports as bool, number or string."""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        text = value.strip().lower()
        if text in TRUE_VALUES:
            return True
        if text in FALSE_VALUES:
            return False
    if value is not None:
        _LOGGER.debug("Could not parse %r as a boolean", value)
    return None


@dataclass(frozen=True, kw_only=True)
class AdsbStationBinarySensorEntityDescription(BinarySensorEntityDescription):
    """Describes a binary sensor that reads the feeder's status document."""

    value_fn: Callable[[dict[str, Any]], bool | None]
    # Builds differ in what they report. When set, this decides from the first
    # poll whether the field is there at all, so a feeder that never sends it
    # does not get a sensor stuck on unknown for the life of the entry.
    supported_fn: Callable[[dict[str, Any]], bool] | None = None


FR24_BINARY_SENSORS: tuple[AdsbStationBinarySensorEntityDescription, ...] = (
    AdsbStationBinarySensorEntityDescription(
        key="receiver",
        translation_key="receiver",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda payload: _as_bool(payload.get("rx_connected")),
    ),
    AdsbStationBinarySensorEntityDescription(
        key="feed",
        translation_key="feed",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda payload: _as_bool(payload.get("feed_status")),
    ),
    AdsbStationBinarySensorEntityDescription(
        key="mlat",
        translation_key="mlat",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda payload: _as_bool(payload.get("mlat_ok")),
        # Not every build reports on multilateration. The x86 ones leave the
        # field out entirely rather than saying it is off.
        supported_fn=lambda payload: "mlat_ok" in payload,
    ),
)

PLANEFINDER_BINARY_SENSORS: tuple[AdsbStationBinarySensorEntityDescription, ...] = (
    AdsbStationBinarySensorEntityDescription(
        key="pf_mlat",
        translation_key="pf_mlat",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        # pfclient publishes no multilateration flag, but it does count what it
        # has sent, and a station whose clock is too unstable to multilaterate
        # sends nothing at all.
        value_fn=lambda payload: (
            (value := _as_int(payload.get("mlat_bytes_out"))) is not None and value > 0
        ),
    ),
)

FEEDER_BINARY_SENSORS: dict[
    str, tuple[AdsbStationBinarySensorEntityDescription, ...]
] = {
    FEEDER_FR24: FR24_BINARY_SENSORS,
    FEEDER_PLANEFINDER: PLANEFINDER_BINARY_SENSORS,
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: AdsbStationConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the binary sensor platform."""
    coordinator = entry.runtime_data
    entities: list[BinarySensorEntity] = []
    if coordinator.client.has_feeder:
        payload = coordinator.data.feeder or {}
        entities.extend(
            AdsbStationBinarySensor(coordinator, description)
            for description in FEEDER_BINARY_SENSORS.get(
                coordinator.feeder_type or "", ()
            )
            if description.supported_fn is None or description.supported_fn(payload)
        )
    if coordinator.client.aircraft_url:
        entities.append(AdsbStationEmergencyBinarySensor(coordinator))
        entities.append(AdsbStationNearbyBinarySensor(coordinator))

    async_add_entities(entities)


class AdsbStationBinarySensor(AdsbStationEntity, BinarySensorEntity):
    """Binary sensor backed by monitor.json."""

    entity_description: AdsbStationBinarySensorEntityDescription

    def __init__(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        description: AdsbStationBinarySensorEntityDescription,
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def is_on(self) -> bool | None:
        """Return True when the monitored part is connected."""
        return self.entity_description.value_fn(self.feeder)


class AdsbStationEmergencyBinarySensor(AdsbStationAircraftEntity, BinarySensorEntity):
    """On while an aircraft in range is squawking an emergency code."""

    _attr_device_class = BinarySensorDeviceClass.SAFETY
    _attr_translation_key = "emergency"

    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator, "emergency")

    @property
    def is_on(self) -> bool | None:
        """Return True when at least one aircraft is in distress."""
        if (aircraft := self.aircraft) is None:
            return None
        return bool(aircraft.emergencies)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return which aircraft are in distress."""
        if (aircraft := self.aircraft) is None:
            return None
        return {
            "aircraft": [
                {
                    "hex": entry.hex,
                    "flight": entry.flight,
                    "squawk": entry.squawk,
                    "reason": entry.reason,
                }
                for entry in aircraft.emergencies
            ]
        }


class AdsbStationNearbyBinarySensor(AdsbStationAircraftEntity, BinarySensorEntity):
    """On while at least one aircraft is inside the configured radius."""

    _attr_translation_key = "nearby"

    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator, "nearby")

    @property
    def is_on(self) -> bool | None:
        """Return True when something is overhead."""
        if (aircraft := self.aircraft) is None:
            return None
        return bool(aircraft.nearby)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return which aircraft are nearby, nearest first."""
        if (aircraft := self.aircraft) is None:
            return None
        return {
            "radius": self.coordinator.proximity_radius / 1000,
            "aircraft": [
                aircraft_attributes(summary, include_distance=True)
                for summary in aircraft.nearby
            ],
        }
