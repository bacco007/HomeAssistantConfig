"""ADSB Aircraft Tracker sensors."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import ADSBDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up ADSB sensors from config entry."""
    coordinator: ADSBDataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]["coordinator"]
    
    entities = [
        ADSBClosestAircraftSensor(coordinator, config_entry),
        ADSBTopAircraftSensor(coordinator, config_entry),
        ADSBAllAircraftSensor(coordinator, config_entry),
        ADSBMilitaryDetailsSensor(coordinator, config_entry),  # Always enabled
        ADSBMilitaryDatabaseStatusSensor(coordinator, config_entry),  # Database monitoring
    ]
    
    async_add_entities(entities)


class ADSBSensorBase(CoordinatorEntity, SensorEntity):
    """Base class for ADSB sensors."""
    
    def __init__(
        self,
        coordinator: ADSBDataUpdateCoordinator,
        config_entry: ConfigEntry,
        sensor_type: str,
    ) -> None:
        """Initialize the sensor."""
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
            sw_version="1.0.0",
            configuration_url=coordinator.adsb_url,
        )



class ADSBClosestAircraftSensor(ADSBSensorBase):
    """Sensor for closest aircraft details."""
    
    def __init__(
        self,
        coordinator: ADSBDataUpdateCoordinator,
        config_entry: ConfigEntry
    ) -> None:
        """Initialize closest aircraft sensor."""
        super().__init__(coordinator, config_entry, "closest_aircraft")
        self._attr_name = "ADSB Closest Aircraft"
        self._attr_icon = "mdi:airplane-marker"
        
    @property
    def native_value(self) -> str | None:
        """Return the closest aircraft identifier."""
        aircraft = self._get_closest_aircraft()
        if not aircraft:
            return "No aircraft"
        
        # Return the best available identifier
        if aircraft.get("flight"):
            return aircraft["flight"]
        elif aircraft.get("tail"):
            return aircraft["tail"]
        else:
            return aircraft.get("hex", "Unknown")
    
    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return closest aircraft details as attributes."""
        aircraft = self._get_closest_aircraft()
        if not aircraft:
            return {"status": "No aircraft detected"}
        
        return {
            "hex": aircraft.get("hex"),
            "tail": aircraft.get("tail"),
            "flight": aircraft.get("flight"),
            "distance_mi": aircraft.get("distance_mi"),
            "distance_display": self.coordinator.format_distance(aircraft.get("distance_mi")),
            "altitude_ft": aircraft.get("altitude_ft"),
            "speed_kts": aircraft.get("speed_kts"),
            "heading": aircraft.get("heading"),
            "aircraft_type": aircraft.get("aircraft_type"),
            "description": aircraft.get("description"),
            "operator": aircraft.get("operator"),
            "squawk": aircraft.get("squawk"),
            "emergency": aircraft.get("emergency"),
            "route_origin": aircraft.get("route_origin"),
            "route_origin_name": aircraft.get("route_origin_name"),
            "route_destination": aircraft.get("route_destination"),
            "route_destination_name": aircraft.get("route_destination_name"),
        }
    
    def _get_closest_aircraft(self) -> dict[str, Any] | None:
        """Get the closest aircraft from coordinator data."""
        if not self.coordinator.data or not self.coordinator.data.get("aircraft"):
            return None
        
        aircraft_list = self.coordinator.data["aircraft"]
        return aircraft_list[0] if aircraft_list else None


class ADSBTopAircraftSensor(ADSBSensorBase):
    """Sensor for top 5 closest aircraft."""

    def __init__(
        self,
        coordinator: ADSBDataUpdateCoordinator,
        config_entry: ConfigEntry
    ) -> None:
        """Initialize top aircraft sensor."""
        super().__init__(coordinator, config_entry, "top_aircraft")
        self._attr_name = "ADSB Nearest 5 Aircraft"
        self._attr_icon = "mdi:format-list-numbered"

    @property
    def native_value(self) -> str | None:
        """Return summary of top aircraft."""
        if not self.coordinator.data or not self.coordinator.data.get("aircraft"):
            return "No aircraft detected"

        aircraft_list = self.coordinator.data["aircraft"][:5]
        count = len(aircraft_list)

        if count == 0:
            return "No aircraft detected"
        elif count == 1:
            return "1 aircraft detected"
        else:
            return f"{count} aircraft detected"

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return top 5 aircraft as attributes."""
        if not self.coordinator.data or not self.coordinator.data.get("aircraft"):
            return {"status": "No aircraft detected"}

        aircraft_list = self.coordinator.data["aircraft"][:5]
        attributes = {}

        for i, aircraft in enumerate(aircraft_list, 1):
            attributes[f"aircraft_{i}"] = {
                "hex": aircraft.get("hex"),
                "tail": aircraft.get("tail"),
                "flight": aircraft.get("flight"),
                "distance_mi": aircraft.get("distance_mi"),
                "distance_display": self.coordinator.format_distance(aircraft.get("distance_mi")),
                "altitude_ft": aircraft.get("altitude_ft"),
                "speed_kts": aircraft.get("speed_kts"),
                "heading": aircraft.get("heading"),
                "aircraft_type": aircraft.get("aircraft_type"),
                "description": aircraft.get("description"),
                "operator": aircraft.get("operator"),
                "squawk": aircraft.get("squawk"),
                "emergency": aircraft.get("emergency"),
                "nav_altitude": aircraft.get("nav_altitude"),
                "nav_heading": aircraft.get("nav_heading"),
                "vertical_rate_fpm": aircraft.get("vertical_rate_fpm", 0),
                "latitude": aircraft.get("latitude"),
                "longitude": aircraft.get("longitude"),
            }

        return attributes


class ADSBMilitaryDetailsSensor(ADSBSensorBase):
    """Sensor for military aircraft details and detection reasons."""
    
    def __init__(
        self,
        coordinator: ADSBDataUpdateCoordinator,
        config_entry: ConfigEntry
    ) -> None:
        """Initialize military details sensor."""
        super().__init__(coordinator, config_entry, "military_details")
        self._attr_name = "ADSB Military Aircraft Details"
        self._attr_icon = "mdi:information-outline"
        
    @property
    def native_value(self) -> str | None:
        """Return summary of military aircraft detection."""
        if not self.coordinator.data or not self.coordinator.data.get("aircraft"):
            return "No aircraft data available"
        
        # Get military aircraft from binary sensor logic
        from .binary_sensor import ADSBMilitaryAircraftSensor
        
        # Create temporary military sensor instance to use detection logic
        temp_sensor = ADSBMilitaryAircraftSensor(self.coordinator, self.config_entry)
        aircraft_list = self.coordinator.data["aircraft"]
        military_aircraft = temp_sensor._detect_military_aircraft(aircraft_list)
        
        if not military_aircraft:
            return f"No military aircraft detected (scanned {len(aircraft_list)} aircraft)"
        
        return f"Military aircraft detected: {len(military_aircraft)} aircraft"
    
    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return military aircraft details as attributes."""
        if not self.coordinator.data or not self.coordinator.data.get("aircraft"):
            return {"status": "No aircraft data"}
        
        # Get military aircraft from binary sensor logic
        from .binary_sensor import ADSBMilitaryAircraftSensor
        
        temp_sensor = ADSBMilitaryAircraftSensor(self.coordinator, self.config_entry)
        aircraft_list = self.coordinator.data["aircraft"]
        military_aircraft = temp_sensor._detect_military_aircraft(aircraft_list)
        
        attributes = {
            "total_aircraft": len(aircraft_list),
            "military_count": len(military_aircraft),
            "detection_method": "database_only",
            "scan_time": self.coordinator.data.get("last_update"),
        }
        
        if military_aircraft:
            attributes["summary"] = f"Detected {len(military_aircraft)} military aircraft:"
            
            for i, aircraft in enumerate(military_aircraft, 1):
                aircraft_info = {
                    "hex": aircraft.get("hex"),
                    "tail": aircraft.get("tail", "Unknown"),
                    "flight": aircraft.get("flight") or "",
                    "distance_mi": aircraft.get("distance_mi", 0),
                    "distance_display": self.coordinator.format_distance(aircraft.get("distance_mi")),
                    "altitude_ft": aircraft.get("altitude_ft", 0),
                    "speed_kts": aircraft.get("speed_kts", 0),
                    "aircraft_type": aircraft.get("aircraft_type", ""),
                    "description": aircraft.get("description", "Unknown aircraft"),
                    "operator": aircraft.get("operator", ""),
                    "squawk": aircraft.get("squawk", ""),
                    "detection_reasons": aircraft.get("_detection_reasons", []),
                }
                attributes[f"military_{i}"] = aircraft_info
        else:
            attributes["summary"] = f"No military aircraft detected out of {len(aircraft_list)} scanned"
            
        return attributes


class ADSBAllAircraftSensor(ADSBSensorBase):
    """Sensor for all tracked aircraft with complete details."""
    
    def __init__(self, coordinator: ADSBDataUpdateCoordinator, config_entry: ConfigEntry) -> None:
        """Initialize all aircraft sensor."""
        super().__init__(coordinator, config_entry, "all_aircraft")
        self._attr_name = "ADSB All Aircraft"
        self._attr_icon = "mdi:airplane-outline"
        
    @property
    def native_value(self) -> str | None:
        """Return summary of all aircraft data."""
        if not self.coordinator.data:
            return "No data"
        
        aircraft_list = self.coordinator.data.get("aircraft", [])
        aircraft_count = len(aircraft_list)
        
        if aircraft_count == 0:
            return "No aircraft"
        
        # Find closest aircraft for summary
        closest_distance = min((a.get("distance_mi", 999) for a in aircraft_list if a.get("distance_mi")), default=999)
        if closest_distance < 999:
            closest_formatted = self.coordinator.format_distance(closest_distance)
            return f"{aircraft_count} aircraft (closest: {closest_formatted})"
        else:
            return f"{aircraft_count} aircraft"
        
    @property 
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return all aircraft details as attributes."""
        if not self.coordinator.data or not self.coordinator.data.get("aircraft"):
            return {"status": "No aircraft detected"}
        
        aircraft_list = self.coordinator.data["aircraft"]
        # Distance filter information
        distance_limit = self.coordinator.distance_limit
        if distance_limit > 0:
            distance_text = f"within {self.coordinator.format_distance(distance_limit)}"
        else:
            distance_text = "all ranges"

        attributes = {
            "total_aircraft": len(aircraft_list),
            "distance_filter": distance_text,
            "data_source": "ADSB Feeder",
            "last_update": self.coordinator.data.get("last_update"),
            "total_messages": self.coordinator.data.get("total_messages"),
            "source_url": self.coordinator.adsb_url,
        }
        
        # Add each aircraft with full details
        for i, aircraft in enumerate(aircraft_list, 1):
            aircraft_info = {
                "hex": aircraft.get("hex"),
                "tail": aircraft.get("tail"),
                "flight": aircraft.get("flight") or "",
                "distance_mi": aircraft.get("distance_mi"),
                "distance_display": self.coordinator.format_distance(aircraft.get("distance_mi")),
                "altitude_ft": aircraft.get("altitude_ft"),
                "speed_kts": aircraft.get("speed_kts"),
                "heading": aircraft.get("heading"),
                "aircraft_type": aircraft.get("aircraft_type"),
                "description": aircraft.get("description", "Unknown aircraft"),
                "operator": aircraft.get("operator", ""),
                "squawk": aircraft.get("squawk", ""),
                "vertical_rate_fpm": aircraft.get("vertical_rate_fpm", 0),
                "latitude": aircraft.get("latitude"),
                "longitude": aircraft.get("longitude"),
            }
            attributes[f"aircraft_{i}"] = aircraft_info
            
        return attributes


class ADSBMilitaryDatabaseStatusSensor(ADSBSensorBase):
    """Sensor for military database status monitoring."""
    
    def __init__(
        self,
        coordinator: ADSBDataUpdateCoordinator,
        config_entry: ConfigEntry
    ) -> None:
        """Initialize database status sensor."""
        super().__init__(coordinator, config_entry, "military_database_status")
        self._attr_name = "ADSB Military Database Status"
        self._attr_icon = "mdi:database-check"
        self._attr_native_unit_of_measurement = "aircraft"
    
    @property
    def native_value(self) -> int | None:
        """Return the number of aircraft in the military database."""
        db_status = self.coordinator.get_military_database_status()
        return db_status.get("database_size", 0)
    
    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return database status attributes."""
        db_status = self.coordinator.get_military_database_status()
        
        return {
            "database_loaded": db_status.get("database_loaded", False),
            "database_size": db_status.get("database_size", 0),
            "last_updated": db_status.get("last_updated"),
            "last_updated_friendly": db_status.get("last_updated_friendly", "Never"),
            "source": "tar1090-db (Mictronics)",
            "update_interval": "24 hours",
            "status": "OK" if db_status.get("database_loaded", False) else "Database not loaded",
        }