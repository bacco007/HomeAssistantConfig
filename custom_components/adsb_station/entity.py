"""Base entity for the ADS-B Station integration."""

from __future__ import annotations

from typing import Any

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .api import web_root
from .const import (
    DEFAULT_STATION_NAME,
    DOMAIN,
    FEEDER_FR24,
    FEEDERS,
    MODEL_RECEIVER,
)
from .coordinator import AdsbStationDataUpdateCoordinator, AircraftStats, ReceiverStats


def _text(value: Any) -> str | None:
    """Return a non-empty string, or None."""
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _device_info(
    coordinator: AdsbStationDataUpdateCoordinator, device_id: str
) -> DeviceInfo:
    """Describe the station this entity belongs to.

    With fr24feed the feeder identifies the device, down to the alias it feeds
    under. Without it there is only the decoder, which is not a Flightradar24
    product and gets no manufacturer.
    """
    client = coordinator.client
    # has_feeder is true only when there is a feeder type to look the kind up
    # by, but naming it here is what lets that be checked rather than trusted.
    if not client.has_feeder or (feeder_type := client.feeder_type) is None:
        aircraft_url = client.aircraft_url
        return DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            model=MODEL_RECEIVER,
            name=DEFAULT_STATION_NAME,
            sw_version=coordinator.receiver_version,
            configuration_url=None if aircraft_url is None else web_root(aircraft_url),
        )

    payload = coordinator.data.feeder or {}
    kind = FEEDERS[feeder_type]
    return DeviceInfo(
        identifiers={(DOMAIN, device_id)},
        manufacturer=kind.manufacturer,
        model=kind.model,
        name=_feeder_name(kind.key, payload) or kind.default_name,
        sw_version=_feeder_version(payload),
        hw_version=_text(payload.get("build_arch")),
        configuration_url=f"http://{client.host}:{client.port}/",
    )


def _feeder_name(feeder_type: str, payload: dict[str, Any]) -> str | None:
    """Return what this feeder calls itself, if it says.

    Only fr24feed publishes a name of its own; the others are known by what
    they are, so they fall back to the default for their kind.
    """
    if feeder_type == FEEDER_FR24:
        return _text(payload.get("feed_alias"))
    return None


def _feeder_version(payload: dict[str, Any]) -> str | None:
    """Return the version this feeder reports, under whichever name it uses."""
    for key in ("build_version", "piaware_version", "client_version"):
        if (version := _text(payload.get(key))) is not None:
            return version
    return None


class AdsbStationEntity(CoordinatorEntity[AdsbStationDataUpdateCoordinator]):
    """Base entity for an ADS-B station."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator, key: str) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        entry = coordinator.config_entry
        device_id = entry.unique_id or entry.entry_id
        self._attr_unique_id = f"{device_id}_{key}"
        self._attr_device_info = _device_info(coordinator, device_id)

    @property
    def feeder(self) -> dict[str, Any]:
        """Return the last status document the feeder served.

        Only entities that exist alongside a feeder read this, so an empty
        payload means the feeder has not answered yet rather than that there
        is none.
        """
        return self.coordinator.data.feeder or {}


class AdsbStationAircraftEntity(AdsbStationEntity):
    """Base entity for values that come from aircraft.json."""

    @property
    def aircraft(self) -> AircraftStats | None:
        """Return the last derived aircraft figures."""
        return self.coordinator.data.aircraft

    @property
    def available(self) -> bool:
        """Return True only while the receiver is answering."""
        return super().available and self.aircraft is not None


class AdsbStationReceptionEntity(AdsbStationEntity):
    """Base entity for values that come from stats.json."""

    @property
    def reception(self) -> ReceiverStats | None:
        """Return the last derived reception statistics."""
        return self.coordinator.data.stats

    @property
    def available(self) -> bool:
        """Return True only while the receiver is answering."""
        return super().available and self.reception is not None
