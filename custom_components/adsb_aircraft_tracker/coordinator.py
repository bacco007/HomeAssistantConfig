"""Data update coordinator for ADSB Aircraft Tracker."""
from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import timedelta
from typing import Any

import aiohttp
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    DOMAIN,
    CONF_ADSB_HOST,
    CONF_ADSB_PORT,
    CONF_DISTANCE_LIMIT,
    DEFAULT_ADSB_PORT,
    DEFAULT_DISTANCE_LIMIT,
)

_LOGGER = logging.getLogger(__name__)


class ADSBDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching ADSB aircraft data."""

    def __init__(
        self,
        hass: HomeAssistant,
        config_entry: ConfigEntry,
        update_interval: timedelta,
    ) -> None:
        """Initialize coordinator."""
        self.config_entry = config_entry
        self.adsb_host = config_entry.data[CONF_ADSB_HOST]
        self.adsb_port = config_entry.data.get(CONF_ADSB_PORT, DEFAULT_ADSB_PORT)
        self.distance_limit = config_entry.data.get(CONF_DISTANCE_LIMIT, DEFAULT_DISTANCE_LIMIT)
        
        # Build ADSB URL
        self.adsb_url = f"http://{self.adsb_host}:{self.adsb_port}/data/aircraft.json"
        
        # Load aircraft types database (will be loaded async after init)
        self.aircraft_types_db = {}
        
        # Reference to military sensor for database status
        self.military_sensor = None
        
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=update_interval,
        )
        
        # Schedule async loading of aircraft types database
        self.hass.async_create_task(self._async_load_aircraft_types_db())
        
        # Also load military database here for reliability
        self.hass.async_create_task(self._async_load_military_database())

    async def _async_load_aircraft_types_db(self) -> None:
        """Load aircraft types database from tar1090-db asynchronously."""
        try:
            import aiofiles
            db_path = os.path.join(os.path.dirname(__file__), "icao_aircraft_types.json")
            if os.path.exists(db_path):
                async with aiofiles.open(db_path, "r", encoding="utf-8") as f:
                    content = await f.read()
                    self.aircraft_types_db = json.loads(content)
                    _LOGGER.info("Loaded %d aircraft types from tar1090-db", len(self.aircraft_types_db))
            else:
                _LOGGER.warning("Aircraft types database not found at %s", db_path)
                self.aircraft_types_db = {}
        except ImportError:
            # Fallback to sync loading if aiofiles not available
            try:
                db_path = os.path.join(os.path.dirname(__file__), "icao_aircraft_types.json")
                if os.path.exists(db_path):
                    with open(db_path, "r", encoding="utf-8") as f:
                        self.aircraft_types_db = json.load(f)
                        _LOGGER.info("Loaded %d aircraft types from tar1090-db (sync fallback)", len(self.aircraft_types_db))
                else:
                    _LOGGER.warning("Aircraft types database not found at %s", db_path)
                    self.aircraft_types_db = {}
            except Exception as err:
                _LOGGER.error("Failed to load aircraft types database (sync fallback): %s", err)
                self.aircraft_types_db = {}
        except Exception as err:
            _LOGGER.error("Failed to load aircraft types database: %s", err)
            self.aircraft_types_db = {}

    def get_aircraft_type_info(self, aircraft_type: str | None) -> dict[str, Any]:
        """Get detailed aircraft type information from tar1090-db."""
        if not aircraft_type or not self.aircraft_types_db:
            return {"description": "Unknown aircraft", "category": "Unknown", "weight_class": "Unknown"}
        
        # Look up in aircraft types database
        type_info = self.aircraft_types_db.get(aircraft_type.upper(), {})
        
        # Parse description field (format: engine_count + engine_type + aircraft_category)
        desc = type_info.get("desc", "")
        wtc = type_info.get("wtc", "L")  # Weight category: L=Light, M=Medium, H=Heavy
        
        # Parse engine info from description
        engine_count = "Unknown"
        engine_type = "Unknown"
        category = "Unknown"
        
        if desc:
            # First character is usually engine count (1-8) or special codes
            if desc[0].isdigit():
                engine_count = desc[0]
            elif desc[0] in "ABCGHILRS":
                # Special engine configurations
                engine_count = {"A": "Amphibian", "B": "Balloon", "G": "Gyrocopter", 
                              "H": "Helicopter", "L": "Glider", "R": "Rotorcraft", 
                              "S": "Seaplane"}.get(desc[0], "Special")
            
            # Second character is engine type
            if len(desc) > 1:
                engine_type = {"P": "Piston", "T": "Turboprop", "J": "Jet", 
                             "E": "Electric", "R": "Rocket"}.get(desc[1], "Unknown")
            
            # Third character is aircraft category
            if len(desc) > 2:
                category = {"P": "Landplane", "S": "Seaplane", "A": "Amphibian",
                          "H": "Helicopter", "G": "Gyrocopter", "T": "Tiltrotor"}.get(desc[2], "Aircraft")
        
        # Create friendly description
        if aircraft_type.upper() in self.aircraft_types_db:
            friendly_desc = self._create_friendly_description(aircraft_type.upper(), engine_count, engine_type, category)
        else:
            friendly_desc = f"{aircraft_type} ({category})" if category != "Unknown" else aircraft_type
        
        return {
            "description": friendly_desc,
            "category": category,
            "weight_class": {"L": "Light", "M": "Medium", "H": "Heavy"}.get(wtc, "Unknown"),
            "engine_count": engine_count,
            "engine_type": engine_type,
            "raw_desc": desc,
            "raw_wtc": wtc
        }

    def _create_friendly_description(self, aircraft_type: str, engine_count: str, engine_type: str, category: str) -> str:
        """Create a friendly description for known aircraft types."""
        # Known aircraft mappings for better descriptions
        aircraft_names = {
            "A320": "Airbus A320",
            "A321": "Airbus A321",
            "A330": "Airbus A330",
            "A340": "Airbus A340",
            "A350": "Airbus A350",
            "A380": "Airbus A380",
            "B737": "Boeing 737",
            "B738": "Boeing 737-800",
            "B739": "Boeing 737-900",
            "B744": "Boeing 747-400",
            "B748": "Boeing 747-8",
            "B752": "Boeing 757-200",
            "B763": "Boeing 767-300",
            "B772": "Boeing 777-200",
            "B773": "Boeing 777-300",
            "B77W": "Boeing 777-300ER",
            "B788": "Boeing 787-8",
            "B789": "Boeing 787-9",
            "C130": "Lockheed C-130 Hercules",
            "C135": "Boeing C-135",
            "C17": "Boeing C-17 Globemaster III",
            "KC135": "Boeing KC-135 Stratotanker",
            "KC10": "McDonnell Douglas KC-10 Extender",
            "KC46": "Boeing KC-46 Pegasus",
            "F16": "General Dynamics F-16 Fighting Falcon",
            "F15": "McDonnell Douglas F-15 Eagle",
            "F18": "McDonnell Douglas F/A-18 Hornet",
            "F22": "Lockheed Martin F-22 Raptor",
            "F35": "Lockheed Martin F-35 Lightning II",
            "C172": "Cessna 172 Skyhawk",
            "C182": "Cessna 182 Skylane",
            "C206": "Cessna 206 Stationair",
            "PA28": "Piper PA-28 Cherokee",
            "P28A": "Piper PA-28 Cherokee",
            "BE20": "Beechcraft King Air",
            "BE35": "Beechcraft Bonanza",
            "UH60": "Sikorsky UH-60 Black Hawk",
            "CH47": "Boeing CH-47 Chinook",
            "AH64": "Boeing AH-64 Apache"
        }
        
        friendly_name = aircraft_names.get(aircraft_type, aircraft_type)
        
        # Add engine information if available and not helicopter
        if category != "Helicopter" and engine_count.isdigit() and engine_type != "Unknown":
            if int(engine_count) > 1:
                engine_desc = f"{engine_count}-engine {engine_type.lower()}"
            else:
                engine_desc = f"Single-engine {engine_type.lower()}"
            return f"{friendly_name} ({engine_desc})"
        
        return friendly_name

    def get_distance_unit(self) -> str:
        """Get the appropriate distance unit based on Home Assistant unit system."""
        return "km" if self.hass.config.units.length == "km" else "mi"
    
    def convert_distance(self, miles: float) -> float:
        """Convert miles to appropriate unit based on Home Assistant unit system."""
        if self.hass.config.units.length == "km":
            return miles * 1.60934  # Convert to kilometers
        return miles
    
    def format_distance(self, miles: float | None) -> str:
        """Format distance with appropriate unit."""
        if miles is None or miles == 0:
            return "Unknown"
        if self.hass.config.units.length == "km":
            km = miles * 1.60934
            return f"{km:.1f} km"
        return f"{miles:.1f} mi"

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch aircraft data from ADSB source."""
        try:
            session = async_get_clientsession(self.hass)
            
            async with asyncio.timeout(10):
                async with session.get(self.adsb_url) as response:
                    if response.status != 200:
                        raise UpdateFailed(
                            f"Error fetching ADSB data: HTTP {response.status}"
                        )
                    
                    data = await response.json()
                    
                    # Validate data structure
                    if "aircraft" not in data:
                        raise UpdateFailed("Invalid ADSB data: missing aircraft array")
                    
                    # Filter aircraft by distance if limit is set
                    aircraft = data["aircraft"]
                    if self.distance_limit > 0:
                        aircraft = [
                            plane for plane in aircraft 
                            if plane.get("r_dst") is not None and plane["r_dst"] <= self.distance_limit
                        ]
                    
                    # Process and enrich aircraft data
                    processed_aircraft = []
                    for plane in aircraft:
                        # Include all aircraft, even without position data (important for military detection)
                        processed_aircraft.append(self._process_aircraft(plane))
                    
                    # Sort by distance (closest first), putting aircraft without distance at end
                    processed_aircraft.sort(key=lambda x: x.get("distance_mi") if x.get("distance_mi") is not None else 999)
                    
                    result = {
                        "aircraft": processed_aircraft,
                        "aircraft_count": len(processed_aircraft),
                        "last_update": data.get("now"),
                        "total_messages": data.get("messages", 0),
                    }
                    
                    # Check for notifications after data update
                    if hasattr(self, 'notification_manager') and self.notification_manager:
                        try:
                            await self.notification_manager.check_and_notify()
                        except Exception as err:
                            _LOGGER.error("Error checking notifications: %s", err)
                    
                    return result
                    
        except asyncio.TimeoutError as err:
            raise UpdateFailed(f"Timeout fetching ADSB data from {self.adsb_url}") from err
        except aiohttp.ClientError as err:
            raise UpdateFailed(f"Error fetching ADSB data: {err}") from err
        except json.JSONDecodeError as err:
            raise UpdateFailed(f"Invalid JSON from ADSB source: {err}") from err
        except Exception as err:
            raise UpdateFailed(f"Unexpected error fetching ADSB data: {err}") from err

    def _process_aircraft(self, plane: dict[str, Any]) -> dict[str, Any]:
        """Process and enrich individual aircraft data."""
        # Get enhanced aircraft type information
        aircraft_type = plane.get("t")
        type_info = self.get_aircraft_type_info(aircraft_type)
        
        # Use enhanced description if available, fallback to original
        enhanced_description = type_info.get("description", "Unknown aircraft")
        if enhanced_description == "Unknown aircraft" or enhanced_description == aircraft_type:
            # Fallback to original description if no enhancement
            enhanced_description = plane.get("desc", "Unknown aircraft")
        
        return {
            # Basic identifiers
            "hex": plane.get("hex"),
            "tail": plane.get("r", "Unknown"),
            "flight": (plane.get("flight") or "").strip() or None,
            
            # Aircraft details (enhanced with tar1090-db)
            "aircraft_type": aircraft_type,
            "description": enhanced_description,
            "category": type_info.get("category", "Unknown"),
            "weight_class": type_info.get("weight_class", "Unknown"),
            "engine_count": type_info.get("engine_count", "Unknown"),
            "engine_type": type_info.get("engine_type", "Unknown"),
            "operator": plane.get("ownOp"),
            "year": plane.get("year"),
            
            # Position and movement
            "latitude": plane.get("lat"),
            "longitude": plane.get("lon"),
            "distance_mi": round(plane.get("r_dst"), 1) if plane.get("r_dst") is not None else None,
            "direction": plane.get("r_dir"),
            
            # Flight data
            "altitude_ft": plane.get("alt_baro", 0),
            "altitude_geom": plane.get("alt_geom"),
            "speed_kts": round(plane.get("gs", 0), 0),
            "heading": plane.get("track"),
            "vertical_rate_fpm": plane.get("baro_rate", 0),
            
            # Navigation
            "squawk": plane.get("squawk"),
            "emergency": plane.get("emergency", "none"),
            "nav_altitude": plane.get("nav_altitude_mcp"),
            "nav_heading": plane.get("nav_heading"),
            
            # Technical
            "icao_category": plane.get("category"),  # Original ICAO category
            "messages": plane.get("messages", 0),
            "seen": plane.get("seen", 0),
            "rssi": plane.get("rssi"),
            
            # Raw tar1090-db info for debugging
            "raw_type_desc": type_info.get("raw_desc", ""),
            "raw_weight_class": type_info.get("raw_wtc", "L"),
        }
    
    async def _async_load_military_database(self) -> None:
        """Load military aircraft database directly in coordinator."""
        try:
            _LOGGER.info("Loading military database from coordinator...")
            import aiohttp
            import json
            from datetime import datetime
            
            from homeassistant.helpers.aiohttp_client import async_get_clientsession
            session = async_get_clientsession(self.hass)
            
            async with asyncio.timeout(30):
                async with session.get("https://raw.githubusercontent.com/Mictronics/readsb-protobuf/dev/webapp/src/db/aircrafts.json") as response:
                    if response.status == 200:
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
                        
                        # Store in coordinator for sensors to access
                        self._military_database = military_db
                        self._db_last_updated = datetime.now()
                        
                        _LOGGER.info("Successfully loaded %d military aircraft from coordinator", len(military_db))
                        
                        # Also update military sensor if available
                        if self.military_sensor:
                            self.military_sensor._military_database = military_db
                            self.military_sensor._db_last_updated = datetime.now()
                        
                    else:
                        _LOGGER.warning("Failed to load military database from coordinator: HTTP %d", response.status)
                        
        except Exception as err:
            _LOGGER.error("Error loading military database from coordinator: %s", err)

    def get_military_database_status(self) -> dict[str, Any]:
        """Get military database status from the military sensor."""
        # Check coordinator first, then fallback to sensor
        if hasattr(self, '_military_database') and self._military_database:
            return {
                "database_loaded": True,
                "database_size": len(self._military_database),
                "last_updated": self._db_last_updated.isoformat() if hasattr(self, '_db_last_updated') and self._db_last_updated else None,
                "last_updated_friendly": self._db_last_updated.strftime("%Y-%m-%d %H:%M:%S UTC") if hasattr(self, '_db_last_updated') and self._db_last_updated else "Unknown",
            }
        elif self.military_sensor:
            return self.military_sensor.get_database_status()
        else:
            return {
                "database_loaded": False,
                "database_size": 0,
                "last_updated": None,
                "last_updated_friendly": "Database not loaded",
            }