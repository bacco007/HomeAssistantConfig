"""Database updater for ADSB Aircraft Tracker."""
from __future__ import annotations

import asyncio
import json
import logging
import os
import tempfile
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant, ServiceCall

_LOGGER = logging.getLogger(__name__)

class DatabaseUpdater:
    """Handle updating aircraft databases."""
    
    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the database updater."""
        self.hass = hass
        
    async def update_aircraft_types_db(self) -> dict[str, Any]:
        """Update the aircraft types database from tar1090-db."""
        try:
            session = aiohttp.ClientSession()
            
            # Download the latest aircraft types database
            url = "https://raw.githubusercontent.com/wiedehopf/tar1090-db/master/icao_aircraft_types.json"
            
            async with session.get(url) as response:
                if response.status == 200:
                    new_db = await response.json()
                    
                    # Write to the integration directory
                    db_path = os.path.join(
                        os.path.dirname(__file__), 
                        "icao_aircraft_types.json"
                    )
                    
                    # Backup existing database
                    backup_path = f"{db_path}.backup"
                    if os.path.exists(db_path):
                        os.rename(db_path, backup_path)
                    
                    # Write new database
                    with open(db_path, 'w', encoding='utf-8') as f:
                        json.dump(new_db, f, separators=(',', ':'))
                    
                    await session.close()
                    
                    return {
                        "success": True,
                        "aircraft_types": len(new_db),
                        "message": f"Successfully updated aircraft types database with {len(new_db)} entries"
                    }
                else:
                    await session.close()
                    return {
                        "success": False,
                        "message": f"Failed to download database: HTTP {response.status}"
                    }
                    
        except Exception as err:
            _LOGGER.error("Failed to update aircraft types database: %s", err)
            return {
                "success": False,
                "message": f"Update failed: {err}"
            }

async def async_setup_database_services(hass: HomeAssistant) -> None:
    """Set up database update services."""
    updater = DatabaseUpdater(hass)
    
    async def update_aircraft_types_service(call: ServiceCall) -> None:
        """Service to update aircraft types database."""
        result = await updater.update_aircraft_types_db()
        
        # Fire an event with the result
        hass.bus.async_fire("adsb_aircraft_tracker_database_updated", {
            "success": result["success"],
            "message": result["message"],
            "aircraft_types": result.get("aircraft_types", 0)
        })
        
        if result["success"]:
            # Trigger coordinator reload by firing config entry reload
            # This will reload the aircraft types database in memory
            entries = hass.config_entries.async_entries("adsb_aircraft_tracker")
            for entry in entries:
                await hass.config_entries.async_reload(entry.entry_id)
    
    # Register the service
    hass.services.async_register(
        "adsb_aircraft_tracker",
        "update_aircraft_types_database", 
        update_aircraft_types_service
    )