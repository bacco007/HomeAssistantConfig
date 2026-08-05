"""ADSB Aircraft Tracker integration for Home Assistant."""
from __future__ import annotations

import logging
import os
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.helpers.service import async_set_service_schema
import voluptuous as vol

from .const import (
    DOMAIN,
    CONF_UPDATE_INTERVAL,
    DEFAULT_UPDATE_INTERVAL,
    MILITARY_DB_REFRESH_INTERVAL,
)
from .coordinator import ADSBDataUpdateCoordinator
from .notify import ADSBNotificationManager
from .database_updater import async_setup_database_services
from .route_client import RouteClient
from .state_client import StateClient
from .intent import async_setup_intents

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ADSB Aircraft Tracker from a config entry."""
    
    # Create data coordinator (options override the original setup data)
    update_interval = timedelta(
        seconds=entry.options.get(
            CONF_UPDATE_INTERVAL,
            entry.data.get(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL),
        )
    )
    
    coordinator = ADSBDataUpdateCoordinator(
        hass=hass,
        config_entry=entry,
        update_interval=update_interval,
    )
    
    # Fetch initial data
    await coordinator.async_config_entry_first_refresh()
    
    # Create notification manager and route client
    notification_manager = ADSBNotificationManager(hass, coordinator, entry)
    route_client = RouteClient(hass)
    state_client = StateClient(hass)

    # Store coordinator, notification manager, route client, state client in hass data
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "notification_manager": notification_manager,
        "route_client": route_client,
        "state_client": state_client,
    }
    
    # Setup platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    
    # Register services
    await _async_setup_services(hass, entry, coordinator)
    
    # Set up database update services
    await async_setup_database_services(hass)

    # Set up voice/Assist intent handlers and services
    await async_setup_intents(hass)
    await _async_setup_voice_services(hass)

    # Set up notification monitoring
    coordinator.notification_manager = notification_manager

    # Reload this entry when options change so new settings take effect
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    # Refresh the military database daily (it only loads once at startup
    # otherwise)
    async def _async_refresh_military_db(now) -> None:
        await coordinator._async_load_military_database()

    entry.async_on_unload(
        async_track_time_interval(
            hass, _async_refresh_military_db, MILITARY_DB_REFRESH_INTERVAL
        )
    )

    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the config entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def _async_setup_services(hass: HomeAssistant, entry: ConfigEntry, coordinator: ADSBDataUpdateCoordinator) -> None:
    """Set up integration services."""
    
    async def refresh_data_service(call: ServiceCall) -> None:
        """Handle refresh data service call."""
        _LOGGER.info("Manual refresh requested for ADSB data")
        await coordinator.async_request_refresh()
        
    async def test_military_detection_service(call: ServiceCall) -> dict:
        """Handle test military detection service call."""
        if not coordinator.data or not coordinator.data.get("aircraft"):
            return {"error": "No aircraft data available"}

        aircraft_list = coordinator.data["aircraft"]
        military_aircraft = coordinator.detect_military_aircraft(aircraft_list)
        
        result = {
            "total_aircraft": len(aircraft_list),
            "military_detected": len(military_aircraft),
            "detection_method": "database_only",
            "military_aircraft": []
        }
        
        for aircraft in military_aircraft:
            result["military_aircraft"].append({
                "tail": aircraft.get("tail", "Unknown"),
                "flight": aircraft.get("flight", ""),
                "distance_mi": aircraft.get("distance_mi", 0),
                "detection_reasons": aircraft.get("_detection_reasons", []),
                "description": aircraft.get("description", ""),
            })
        
        _LOGGER.info("Military detection test: %d/%d aircraft detected", len(military_aircraft), len(aircraft_list))
        return result
    
    async def get_aircraft_details_service(call: ServiceCall) -> dict:
        """Handle get aircraft details service call."""
        hex_code = call.data.get("hex_code", "").lower()
        
        if not coordinator.data or not coordinator.data.get("aircraft"):
            return {"error": "No aircraft data available"}
        
        # Find aircraft by hex code
        for aircraft in coordinator.data["aircraft"]:
            if aircraft.get("hex", "").lower() == hex_code:
                return {
                    "found": True,
                    "aircraft": {
                        "hex": aircraft.get("hex"),
                        "tail": aircraft.get("tail"),
                        "flight": aircraft.get("flight"),
                        "distance_mi": aircraft.get("distance_mi"),
                        "altitude_ft": aircraft.get("altitude_ft"),
                        "speed_kts": aircraft.get("speed_kts"),
                        "heading": aircraft.get("heading"),
                        "aircraft_type": aircraft.get("aircraft_type"),
                        "description": aircraft.get("description"),
                        "operator": aircraft.get("operator"),
                        "squawk": aircraft.get("squawk"),
                        "emergency": aircraft.get("emergency"),
                        "latitude": aircraft.get("latitude"),
                        "longitude": aircraft.get("longitude"),
                    }
                }
        
        return {"found": False, "error": f"Aircraft with hex code {hex_code} not found"}
    
    async def load_military_database_service(call: ServiceCall) -> dict:
        """Handle manual military database loading service call."""
        _LOGGER.info("Manual military database load requested")
        await coordinator._async_load_military_database()
        status = coordinator.get_military_database_status()
        success = status["database_loaded"] and status["database_size"] > 0
        return {
            "success": success,
            "database_size": status["database_size"],
            "message": "Database loaded successfully" if success else "Database load failed",
        }
    
    # Register services with the integration domain
    hass.services.async_register(
        DOMAIN,
        "refresh_data",
        refresh_data_service,
    )
    
    hass.services.async_register(
        DOMAIN,
        "test_military_detection",
        test_military_detection_service,
        supports_response=True,
    )
    
    hass.services.async_register(
        DOMAIN,
        "get_aircraft_details",
        get_aircraft_details_service,
        schema=vol.Schema({
            vol.Required("hex_code"): str,
        }),
        supports_response=True,
    )
    
    hass.services.async_register(
        DOMAIN,
        "load_military_database",
        load_military_database_service,
        supports_response=True,
    )


_SENTENCES_YAML = """\
language: en
intents:
  ADSBWhatPlane:
    data:
      - sentences:
          - "what plane is that"
          - "what aircraft is that"
          - "what is that plane"
          - "what is that aircraft"
          - "what plane is overhead"
          - "what aircraft is overhead"
          - "what's flying overhead"
          - "what is flying overhead"
          - "what plane just flew over"
          - "identify that plane"
          - "identify that aircraft"
          - "what's that flying"
          - "what kind of plane is that"
          - "tell me about that plane"
          - "what's that plane"
          - "what's up there"
          - "what flew over"
          - "what just flew by"
  ADSBNearestAircraft:
    data:
      - sentences:
          - "what is the closest aircraft"
          - "what is the nearest plane"
          - "what plane is closest to me"
          - "tell me about the nearest aircraft"
          - "what aircraft are nearby"
          - "are there any planes nearby"
          - "what planes are in the area"
          - "what planes can you see"
          - "any planes around"
          - "any aircraft nearby"
          - "what's nearby"
          - "what planes are near me"
          - "what do you see flying"
  ADSBMilitaryStatus:
    data:
      - sentences:
          - "are there any military aircraft"
          - "any military planes nearby"
          - "are there military planes"
          - "any military aircraft around"
          - "is there anything military flying"
          - "do you see any military planes"
          - "military aircraft status"
          - "any military flights"
  ADSBAircraftCount:
    data:
      - sentences:
          - "how many planes are being tracked"
          - "how many aircraft are there"
          - "how many planes are you tracking"
          - "how many aircraft can you see"
          - "aircraft count"
          - "how many planes"
          - "how many aircraft"
          - "how many planes are out there"
  ADSBAircraftRoute:
    data:
      - sentences:
          - "where is that plane going"
          - "where is that plane headed"
          - "where is that aircraft going"
          - "what is the route"
          - "where is it flying to"
          - "where is it going"
          - "what's the flight route"
          - "where did that plane come from"
  ADSBAircraftByType:
    data:
      - sentences:
          - "are there any {type} aircraft nearby"
          - "are there any {type} planes nearby"
          - "any {type} aircraft overhead"
          - "any {type} planes overhead"
          - "do you see any {type} aircraft"
          - "do you see any {type} planes"
          - "are there {type} aircraft around"
          - "are there {type} planes around"
          - "any {type} aircraft flying"
          - "any {type} planes flying"
          - "can you see any {type} aircraft"
          - "can you see any {type} planes"
  ADSBAircraftSuperlative:
    data:
      - sentences:
          - "what is the {query} aircraft"
          - "what is the {query} plane"
          - "what's the {query} plane"
          - "what's the {query} aircraft"
          - "which plane is the {query}"
          - "which aircraft is the {query}"
          - "what plane is {query}"
          - "what aircraft is {query}"
          - "show me the {query} aircraft"
          - "find the {query} plane"
lists:
  type:
    wildcard: true
  query:
    wildcard: true
"""


async def _async_setup_voice_services(hass: HomeAssistant) -> None:
    """Register voice/Assist related services."""

    async def install_sentences_service(call: ServiceCall) -> dict:
        """Write custom sentences YAML to config/custom_sentences/en/."""
        sentences_dir = hass.config.path("custom_sentences", "en")
        sentences_path = os.path.join(sentences_dir, "adsb_aircraft_tracker.yaml")

        def _write_file():
            os.makedirs(sentences_dir, exist_ok=True)
            existed = os.path.exists(sentences_path)
            with open(sentences_path, "w", encoding="utf-8") as f:
                f.write(_SENTENCES_YAML)
            return existed

        existed = await hass.async_add_executor_job(_write_file)
        action = "updated" if existed else "created"
        _LOGGER.info("ADSB voice sentences %s at %s", action, sentences_path)

        return {
            "path": sentences_path,
            "action": action,
        }

    if not hass.services.has_service(DOMAIN, "install_sentences"):
        hass.services.async_register(
            DOMAIN,
            "install_sentences",
            install_sentences_service,
            supports_response=True,
        )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok