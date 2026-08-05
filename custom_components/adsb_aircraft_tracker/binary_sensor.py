"""ADSB Aircraft Tracker binary sensors."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, INTEGRATION_VERSION
from .coordinator import ADSBDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up ADSB binary sensors from config entry."""
    coordinator: ADSBDataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]["coordinator"]

    # Military detection always enabled
    async_add_entities([ADSBMilitaryAircraftSensor(coordinator, config_entry)])


class ADSBBinarySensorBase(CoordinatorEntity, BinarySensorEntity):
    """Base class for ADSB binary sensors."""

    def __init__(
        self,
        coordinator: ADSBDataUpdateCoordinator,
        config_entry: ConfigEntry,
        sensor_type: str,
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator)
        self.config_entry = config_entry
        self.sensor_type = sensor_type

        # Entity attributes
        self._attr_unique_id = f"{config_entry.entry_id}_{sensor_type}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, config_entry.entry_id)},
            name=f"ADSB Tracker ({coordinator.adsb_host})",
            manufacturer="ADSB Aircraft Tracker",
            model="Aircraft Tracker",
            sw_version=INTEGRATION_VERSION,
            configuration_url=coordinator.adsb_url,
        )


class ADSBMilitaryAircraftSensor(ADSBBinarySensorBase):
    """Binary sensor for military aircraft presence.

    Detection and the military database both live in the coordinator —
    this entity only renders them.
    """

    def __init__(
        self,
        coordinator: ADSBDataUpdateCoordinator,
        config_entry: ConfigEntry
    ) -> None:
        """Initialize military aircraft sensor."""
        super().__init__(coordinator, config_entry, "military_aircraft")
        self._attr_name = "ADSB Military Aircraft Present"
        self._attr_icon = "mdi:airplane-shield"

    @property
    def is_on(self) -> bool | None:
        """Return true if military aircraft detected."""
        if not self.coordinator.data:
            return None
        aircraft_list = self.coordinator.data.get("aircraft") or []
        return len(self.coordinator.detect_military_aircraft(aircraft_list)) > 0

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return military aircraft details as attributes."""
        if not self.coordinator.data or not self.coordinator.data.get("aircraft"):
            return {"status": "No aircraft detected"}

        aircraft_list = self.coordinator.data["aircraft"]
        military_aircraft = self.coordinator.detect_military_aircraft(aircraft_list)

        status = self.coordinator.get_military_database_status()
        db_status = {
            "database_loaded": status["database_loaded"],
            "database_size": status["database_size"],
            "database_updated": status["last_updated"],
        }

        if not military_aircraft:
            return {
                "status": "No military aircraft detected",
                "total_aircraft": len(aircraft_list),
                **db_status,
            }

        attributes = {
            "status": f"{len(military_aircraft)} military aircraft detected",
            "total_aircraft": len(aircraft_list),
            "military_count": len(military_aircraft),
            **db_status,
        }

        # Add details for up to 3 detected aircraft
        for i, aircraft in enumerate(military_aircraft[:3], 1):
            aircraft_info = {
                "hex": aircraft.get("hex"),
                "tail": aircraft.get("tail"),
                "flight": aircraft.get("flight"),
                "distance_mi": aircraft.get("distance_mi"),
                "altitude_ft": aircraft.get("altitude_ft"),
                "description": aircraft.get("description"),
                "detection_reasons": aircraft.get("_detection_reasons", []),
            }

            # Add database information if available
            if aircraft.get("_db_info"):
                db_info = aircraft["_db_info"]
                aircraft_info["db_tail"] = db_info["tail"]
                aircraft_info["db_type"] = db_info["type"]
                aircraft_info["db_description"] = db_info["description"]

            attributes[f"military_{i}"] = aircraft_info

        return attributes
