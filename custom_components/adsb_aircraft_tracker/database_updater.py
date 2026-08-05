"""Database updater for ADSB Aircraft Tracker."""
from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)

AIRCRAFT_TYPES_DB_URL = (
    "https://raw.githubusercontent.com/wiedehopf/tar1090-db"
    "/master/icao_aircraft_types.json"
)


class DatabaseUpdater:
    """Handle updating aircraft databases."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the database updater."""
        self.hass = hass

    async def update_aircraft_types_db(self) -> dict[str, Any]:
        """Update the aircraft types database from tar1090-db."""
        try:
            session = async_get_clientsession(self.hass)

            async with asyncio.timeout(60):
                async with session.get(AIRCRAFT_TYPES_DB_URL) as response:
                    if response.status != 200:
                        return {
                            "success": False,
                            "message": f"Failed to download database: HTTP {response.status}",
                        }
                    new_db = await response.json(content_type=None)

            db_path = os.path.join(
                os.path.dirname(__file__), "icao_aircraft_types.json"
            )

            def _write_db() -> None:
                backup_path = f"{db_path}.backup"
                if os.path.exists(db_path):
                    os.replace(db_path, backup_path)
                with open(db_path, "w", encoding="utf-8") as f:
                    json.dump(new_db, f, separators=(",", ":"))

            await self.hass.async_add_executor_job(_write_db)

            return {
                "success": True,
                "aircraft_types": len(new_db),
                "message": f"Successfully updated aircraft types database with {len(new_db)} entries",
            }

        except Exception as err:
            _LOGGER.error("Failed to update aircraft types database: %s", err)
            return {
                "success": False,
                "message": f"Update failed: {err}",
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
            # Reload config entries so the new database is read into memory
            entries = hass.config_entries.async_entries("adsb_aircraft_tracker")
            for entry in entries:
                await hass.config_entries.async_reload(entry.entry_id)

    # Register the service
    hass.services.async_register(
        "adsb_aircraft_tracker",
        "update_aircraft_types_database",
        update_aircraft_types_service
    )
