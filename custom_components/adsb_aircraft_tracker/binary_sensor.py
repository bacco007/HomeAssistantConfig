"""ADSB Aircraft Tracker binary sensors."""
from __future__ import annotations

import logging
import aiohttp
import asyncio
import json
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
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
    """Set up ADSB binary sensors from config entry."""
    _LOGGER.info("Setting up ADSB binary sensors...")
    coordinator: ADSBDataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]["coordinator"]
    
    # Military detection always enabled
    entities = [ADSBMilitaryAircraftSensor(coordinator, config_entry)]
    _LOGGER.info("Created military aircraft sensor, adding to Home Assistant...")
    
    async_add_entities(entities)


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
            sw_version="1.0.0",
            configuration_url=coordinator.adsb_url,
        )


class ADSBMilitaryAircraftSensor(ADSBBinarySensorBase):
    """Binary sensor for military aircraft presence."""
    
    def __init__(
        self,
        coordinator: ADSBDataUpdateCoordinator,
        config_entry: ConfigEntry
    ) -> None:
        """Initialize military aircraft sensor."""
        super().__init__(coordinator, config_entry, "military_aircraft")
        self._attr_name = "ADSB Military Aircraft Present"
        self._attr_icon = "mdi:airplane-shield"
        self._military_database = None
        self._db_last_updated = None
        self._db_loading = False
        self._db_load_task = None

        # Register this sensor with the coordinator for database status monitoring
        self.coordinator.military_sensor = self
        
    @property
    def is_on(self) -> bool | None:
        """Return true if military aircraft detected."""
        if not self.coordinator.data or not self.coordinator.data.get("aircraft"):
            return False
        
        aircraft_list = self.coordinator.data["aircraft"]
        military_aircraft = self._detect_military_aircraft(aircraft_list)
        
        return len(military_aircraft) > 0
    
    async def _load_military_database(self) -> bool:
        """Load military aircraft database from tar1090-db (Mictronics)."""
        # Prevent concurrent loads
        if self._db_loading:
            _LOGGER.debug("Database load already in progress, skipping duplicate request")
            return False

        self._db_loading = True
        try:
            _LOGGER.info("Starting military aircraft database loading...")
            from datetime import datetime, timedelta

            # Check if we need to refresh (cache for 24 hours)
            if (self._military_database is not None and
                self._db_last_updated is not None and
                datetime.now() - self._db_last_updated < timedelta(hours=24)):
                _LOGGER.info("Military database cache still valid, skipping download")
                return True

            from homeassistant.helpers.aiohttp_client import async_get_clientsession
            session = async_get_clientsession(self.coordinator.hass)

            # Increased timeout to 60 seconds for large file
            async with asyncio.timeout(60):
                async with session.get(
                    "https://raw.githubusercontent.com/Mictronics/readsb-protobuf/dev/webapp/src/db/aircrafts.json",
                    timeout=aiohttp.ClientTimeout(total=60, sock_connect=10, sock_read=50)
                ) as response:
                    if response.status == 200:
                        # Handle GitHub returning text/plain instead of application/json
                        content = await response.text()
                        db_data = json.loads(content)

                        # Extract only military aircraft (flag "10")
                        military_db = {}
                        for icao_hex, aircraft_info in db_data.items():
                            if len(aircraft_info) >= 3 and aircraft_info[2] == "10":
                                military_db[icao_hex.upper()] = {
                                    "tail": aircraft_info[0],
                                    "type": aircraft_info[1],
                                    "flag": aircraft_info[2],
                                    "description": aircraft_info[3] if len(aircraft_info) > 3 else ""
                                }

                        self._military_database = military_db
                        self._db_last_updated = datetime.now()

                        _LOGGER.info("Successfully loaded %d military aircraft from tar1090-db", len(military_db))
                        return True
                    else:
                        _LOGGER.warning("Failed to load military database: HTTP %d", response.status)
                        # Set empty database to prevent repeated failures
                        self._military_database = {}
                        self._db_last_updated = datetime.now()
                        return False

        except asyncio.TimeoutError:
            _LOGGER.error("Timeout loading military aircraft database - file may be too large or network is slow")
            # Set empty database to prevent repeated failures
            self._military_database = {}
            self._db_last_updated = datetime.now()
            return False
        except Exception as err:
            _LOGGER.error("Error loading military aircraft database: %s", err)
            # Set empty database to prevent repeated failures
            self._military_database = {}
            self._db_last_updated = datetime.now()
            return False
        finally:
            self._db_loading = False
    
    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return military aircraft details as attributes."""
        if not self.coordinator.data or not self.coordinator.data.get("aircraft"):
            return {"status": "No aircraft detected"}
        
        aircraft_list = self.coordinator.data["aircraft"]
        military_aircraft = self._detect_military_aircraft(aircraft_list)
        
        db_status = {
            "database_loaded": self._military_database is not None,
            "database_size": len(self._military_database) if self._military_database else 0,
            "database_updated": self._db_last_updated.isoformat() if self._db_last_updated else None,
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
    
    def _detect_military_aircraft(self, aircraft_list: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Detect military aircraft using tar1090-db database first, then fallback patterns."""
        military_aircraft = []
        
        for aircraft in aircraft_list:
            if self._is_military_aircraft(aircraft):
                military_aircraft.append(aircraft)
        
        return military_aircraft
    
    def _is_military_aircraft(self, aircraft: dict[str, Any]) -> bool:
        """Determine if aircraft is military using tar1090-db database ONLY."""
        hex_code = aircraft.get("hex")
        if not hex_code:
            return False
        
        # Load database on first access if not already loaded
        if self._military_database is None:
            if not self._db_loading and self._db_load_task is None:
                _LOGGER.info("Military database not loaded yet, triggering load...")
                # Since this is sync, we'll schedule the load and return False for now
                self._db_load_task = self.coordinator.hass.async_create_task(self._load_military_database())
            return False
            
        # Only use tar1090-db military database - no fallback pattern matching
        if hex_code.upper() in self._military_database:
            db_info = self._military_database[hex_code.upper()]
            aircraft["_db_info"] = db_info
            aircraft["_detection_reasons"] = ["DATABASE_MATCH"]
            return True
        
        # No fallback detection - database only
        return False
    
    def get_database_status(self) -> dict[str, Any]:
        """Get military database status for monitoring."""
        return {
            "database_loaded": self._military_database is not None,
            "database_size": len(self._military_database) if self._military_database else 0,
            "last_updated": self._db_last_updated.isoformat() if self._db_last_updated else None,
            "last_updated_friendly": self._db_last_updated.strftime("%Y-%m-%d %H:%M:%S UTC") if self._db_last_updated else "Never",
        }