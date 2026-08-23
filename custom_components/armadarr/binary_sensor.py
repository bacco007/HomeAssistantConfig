"""Binary sensor platform for Armadarr."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)

from .entity import ArmadarrEntity

if TYPE_CHECKING:
    from collections.abc import Callable

    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from .data import ArmadarrConfigEntry


@dataclass(frozen=True, kw_only=True)
class ArmadarrBinarySensorEntityDescription(BinarySensorEntityDescription):
    """Class describing Armadarr binary sensor entities."""

    is_on_fn: Callable[[Any], bool]


def _update_available(data: Any) -> bool:
    """
    Return whether the app reports a newer version than the installed one.

    The update endpoint lists the known versions, each flagged ``installed``
    and ``latest``. An update is available when the version flagged latest is
    not the one flagged installed. An empty list means the app knows of no
    newer version, so the answer is no.
    """
    if not data:
        return False
    return any(
        entry.get("latest") and not entry.get("installed")
        for entry in data.get("update") or []
        if isinstance(entry, dict)
    )


async def async_setup_entry(
    _hass: HomeAssistant,
    entry: ArmadarrConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the binary sensor platform."""
    coordinator = entry.runtime_data.standard_coordinator
    app_type = entry.data["app_type"]

    entities = [
        ArmadarrBinarySensor(
            coordinator,
            ArmadarrBinarySensorEntityDescription(
                key="connectivity",
                name="Connectivity",
                device_class=BinarySensorDeviceClass.CONNECTIVITY,
                is_on_fn=lambda data: (
                    data.get("system_status") is not None if data else False
                ),
            ),
        ),
    ]

    # Bazarr and Dispatcharr expose no update endpoint, so there is no data
    # from which this sensor could ever be correct.
    if app_type not in ["Bazarr", "Dispatcharr"]:
        entities.append(
            ArmadarrBinarySensor(
                coordinator,
                ArmadarrBinarySensorEntityDescription(
                    key="update_available",
                    name="Update Available",
                    device_class=BinarySensorDeviceClass.UPDATE,
                    is_on_fn=_update_available,
                ),
            )
        )

    async_add_entities(entities)


class ArmadarrBinarySensor(ArmadarrEntity, BinarySensorEntity):
    """Armadarr Binary Sensor class."""

    entity_description: ArmadarrBinarySensorEntityDescription

    @property
    def is_on(self) -> bool:
        """Return true if the binary sensor is on."""
        return self.entity_description.is_on_fn(self.coordinator.data)
