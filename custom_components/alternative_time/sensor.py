"""Sensor platform for Alternative Time Systems."""
from __future__ import annotations

import os
import logging
import asyncio
from datetime import timedelta
from typing import Any, Dict, List, Optional
from importlib import import_module

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Global cache for discovered calendars
_DISCOVERED_CALENDARS_CACHE: Optional[Dict[str, Dict[str, Any]]] = None
_DISCOVERY_LOCK = asyncio.Lock()

# Store config entries globally for sensor access
_CONFIG_ENTRIES: Dict[str, ConfigEntry] = {}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Alternative Time Systems sensors from a config entry."""
    
    # Store config entry for sensor access
    entry_id = config_entry.entry_id
    _CONFIG_ENTRIES[entry_id] = config_entry
    
    # Get selected calendars from config
    selected_calendars = config_entry.data.get("calendars", [])
    name = config_entry.data.get("name", "Alternative Time")
    
    # Debug logging für plugin_options
    plugin_options = config_entry.data.get("plugin_options", {})
    _LOGGER.info(f"=== Setting up Alternative Time '{name}' ===")
    _LOGGER.debug(f"Config Entry ID: {entry_id[:8]}...")
    _LOGGER.debug(f"Selected calendars: {selected_calendars}")
    _LOGGER.info(f"Plugin options available: {list(plugin_options.keys())}")
    for cal_id, opts in plugin_options.items():
        _LOGGER.debug(f"  {cal_id}: {opts}")
    
    if not selected_calendars:
        _LOGGER.warning("No calendars selected")
        return
    
    # Clear cache to force re-discovery
    global _DISCOVERED_CALENDARS_CACHE
    _DISCOVERED_CALENDARS_CACHE = None
    
    # Discover all available calendars
    discovered_calendars = await async_discover_all_calendars(hass)
    
    if not discovered_calendars:
        _LOGGER.error("No calendars could be discovered!")
        return
    
    _LOGGER.info(f"Discovered {len(discovered_calendars)} calendars: {list(discovered_calendars.keys())}")
    
    # Create sensors for selected calendars
    sensors = []
    entities_to_exclude = []  # Track entities for recorder exclusion
    
    for calendar_id in selected_calendars:
        _LOGGER.debug(f"Processing calendar: {calendar_id}")
        
        if calendar_id not in discovered_calendars:
            _LOGGER.error(f"Calendar '{calendar_id}' is enabled but not found in registry")
            _LOGGER.debug(f"Available calendars: {list(discovered_calendars.keys())}")
            continue
        
        calendar_info = discovered_calendars[calendar_id]
        
        # Debug: Check if we have options for this calendar
        calendar_plugin_options = plugin_options.get(calendar_id, {})
        if calendar_plugin_options:
            _LOGGER.info(f"Calendar {calendar_id} has options: {calendar_plugin_options}")
        else:
            _LOGGER.debug(f"Calendar {calendar_id} has no custom options")
        
        try:
            # Import the calendar module asynchronously
            module = await async_import_calendar_module(hass, calendar_id)
            
            if not module:
                _LOGGER.error(f"Failed to import calendar module: {calendar_id}")
                continue
            
            # Find the sensor class
            sensor_class = None
            for item_name in dir(module):
                item = getattr(module, item_name)
                if (isinstance(item, type) and 
                    issubclass(item, AlternativeTimeSensorBase) and 
                    item != AlternativeTimeSensorBase):
                    sensor_class = item
                    break
            
            if not sensor_class:
                _LOGGER.error(f"No sensor class found in calendar module: {calendar_id}")
                continue
            
            # Create sensor instance - ALLE Sensoren bekommen nur (base_name, hass)
            sensor = sensor_class(name, hass)
            
            # WICHTIG: Setze die IDs SOFORT nach der Erstellung
            sensor._calendar_id = calendar_id  # Store for plugin options lookup
            sensor._config_entry_id = entry_id  # Store entry ID
            
            # Debug: Verify the sensor can get its options
            _LOGGER.debug(f"Sensor {calendar_id} initialized:")
            _LOGGER.debug(f"  - _calendar_id: {sensor._calendar_id}")
            _LOGGER.debug(f"  - _config_entry_id: {sensor._config_entry_id}")
            
            # Test if sensor can retrieve its options
            test_options = sensor.get_plugin_options()
            if test_options:
                _LOGGER.info(f"✓ Sensor {calendar_id} successfully retrieved options: {test_options}")
            else:
                _LOGGER.debug(f"  Sensor {calendar_id} has no options or using defaults")
            
            # WICHTIG: Unique ID muss entry_id enthalten um Kollisionen zu vermeiden
            # Überschreibe die unique_id, die vom Kalender gesetzt wurde
            if hasattr(sensor, '_attr_unique_id'):
                # Füge die entry_id zur unique_id hinzu für Eindeutigkeit
                base_unique_id = sensor._attr_unique_id
                sensor._attr_unique_id = f"{entry_id}_{base_unique_id}"
                _LOGGER.debug(f"Set unique_id for {calendar_id}: {sensor._attr_unique_id[:30]}...")
            else:
                # Falls keine unique_id gesetzt wurde, erstelle eine
                sensor._attr_unique_id = f"{entry_id}_{name}_{calendar_id}"
                _LOGGER.debug(f"Created unique_id for {calendar_id}: {sensor._attr_unique_id[:30]}...")
            
            sensors.append(sensor)
            
            # Track entity for recorder exclusion if it updates frequently
            update_interval = calendar_info.get('update_interval', 3600)
            if update_interval < 60:  # Exclude sensors that update more than once per minute
                entities_to_exclude.append(sensor.entity_id)
            
            _LOGGER.info(f"✓ Created sensor for calendar: {calendar_id}")
            
        except Exception as e:
            _LOGGER.error(f"Failed to create sensor for calendar {calendar_id}: {e}")
            import traceback
            _LOGGER.debug(traceback.format_exc())
            continue
    
    if sensors:
        async_add_entities(sensors)
        _LOGGER.info(f"=== Successfully added {len(sensors)} sensors to Home Assistant ===")
        
        # Register recorder exclusions if needed
        # WICHTIG: Diese Zeile ist auskommentiert, um den Recorder-Fehler zu vermeiden
        # if entities_to_exclude:
        #     await register_recorder_exclusion(hass, entities_to_exclude)
    else:
        _LOGGER.warning("No sensors were created!")


async def async_discover_all_calendars(hass: HomeAssistant) -> Dict[str, Dict[str, Any]]:
    """Discover all available calendar implementations asynchronously."""
    global _DISCOVERED_CALENDARS_CACHE
    
    async with _DISCOVERY_LOCK:
        # Return cached result if available
        if _DISCOVERED_CALENDARS_CACHE is not None:
            return _DISCOVERED_CALENDARS_CACHE
        
        discovered = {}
        
        # Get calendars directory path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        calendars_dir = os.path.join(current_dir, "calendars")
        
        if not os.path.exists(calendars_dir):
            _LOGGER.warning(f"Calendars directory not found: {calendars_dir}")
            _DISCOVERED_CALENDARS_CACHE = discovered
            return discovered
        
        # List files asynchronously
        files = await hass.async_add_executor_job(os.listdir, calendars_dir)
        _LOGGER.debug(f"Found files in calendars directory: {files}")
        
        for filename in files:
            if filename.endswith(".py") and not filename.startswith("__"):
                module_name = filename[:-3]  # Remove .py extension
                
                # Skip template and example files
                if "template" in module_name.lower() or "example" in module_name.lower():
                    continue
                
                try:
                    # Import module asynchronously
                    module = await async_import_calendar_module(hass, module_name)
                    
                    if module and hasattr(module, 'CALENDAR_INFO'):
                        cal_info = module.CALENDAR_INFO
                        cal_id = cal_info.get('id', module_name)
                        discovered[cal_id] = cal_info
                        _LOGGER.debug(f"Discovered calendar: {cal_id}")
                    elif module:
                        _LOGGER.debug(f"Module {module_name} has no CALENDAR_INFO")
                    else:
                        _LOGGER.debug(f"Could not import module {module_name}")
                        
                except Exception as e:
                    _LOGGER.warning(f"Failed to discover calendar {module_name}: {e}")
                    import traceback
                    _LOGGER.debug(traceback.format_exc())
                    continue
        
        if not discovered:
            _LOGGER.error(f"No calendars discovered! Directory contents: {files}")
        else:
            _LOGGER.info(f"Discovered {len(discovered)} calendars: {list(discovered.keys())}")
        
        _DISCOVERED_CALENDARS_CACHE = discovered
        return discovered


async def async_import_calendar_module(hass: HomeAssistant, module_name: str):
    """Import a calendar module asynchronously."""
    def _import():
        try:
            # Add parent directory to path for imports
            import sys
            current_dir = os.path.dirname(os.path.abspath(__file__))
            parent_dir = os.path.dirname(current_dir)
            if parent_dir not in sys.path:
                sys.path.insert(0, parent_dir)
            
            # Try different import methods
            try:
                module = import_module(f'.calendars.{module_name}', 
                                   package='custom_components.alternative_time')
                _LOGGER.debug(f"Successfully imported {module_name} via method 1")
                return module
            except ImportError as e1:
                _LOGGER.debug(f"Method 1 failed for {module_name}: {e1}")
                try:
                    module = import_module(
                        f'custom_components.alternative_time.calendars.{module_name}'
                    )
                    _LOGGER.debug(f"Successfully imported {module_name} via method 2")
                    return module
                except ImportError as e2:
                    _LOGGER.debug(f"Method 2 failed for {module_name}: {e2}")
                    try:
                        module = import_module(module_name)
                        _LOGGER.debug(f"Successfully imported {module_name} via method 3")
                        return module
                    except ImportError as e3:
                        _LOGGER.debug(f"Method 3 failed for {module_name}: {e3}")
                        raise e3
        except Exception as e:
            _LOGGER.error(f"Failed to import calendar module {module_name}: {e}")
            import traceback
            _LOGGER.debug(traceback.format_exc())
            return None
    
    return await hass.async_add_executor_job(_import)


def export_discovered_calendars() -> Dict[str, Dict[str, Any]]:
    """Export discovered calendars for use by config flow.
    
    This function is synchronous for backward compatibility,
    but should only be called from an executor.
    """
    global _DISCOVERED_CALENDARS_CACHE
    
    if _DISCOVERED_CALENDARS_CACHE is not None:
        return _DISCOVERED_CALENDARS_CACHE
    
    # Perform synchronous discovery if cache is empty
    discovered = {}
    current_dir = os.path.dirname(os.path.abspath(__file__))
    calendars_dir = os.path.join(current_dir, "calendars")
    
    if not os.path.exists(calendars_dir):
        _LOGGER.warning(f"Calendars directory not found in export: {calendars_dir}")
        return discovered
    
    files = os.listdir(calendars_dir)
    _LOGGER.debug(f"Export discovery - found files: {files}")
    
    for filename in files:
        if filename.endswith(".py") and not filename.startswith("__"):
            module_name = filename[:-3]
            
            # Skip template and example files
            if "template" in module_name.lower() or "example" in module_name.lower():
                continue
            
            try:
                module = import_module(f'.calendars.{module_name}', 
                                     package='custom_components.alternative_time')
                
                if hasattr(module, 'CALENDAR_INFO'):
                    cal_info = module.CALENDAR_INFO
                    cal_id = cal_info.get('id', module_name)
                    discovered[cal_id] = cal_info
                    _LOGGER.debug(f"Export discovered: {cal_id}")
                else:
                    _LOGGER.debug(f"Export - no CALENDAR_INFO in {module_name}")
                    
            except Exception as e:
                _LOGGER.debug(f"Export failed for {module_name}: {e}")
                continue
    
    if not discovered:
        _LOGGER.error(f"Export - no calendars discovered! Files: {files}")
    else:
        _LOGGER.info(f"Export discovered {len(discovered)} calendars")
    
    _DISCOVERED_CALENDARS_CACHE = discovered
    return discovered


def get_config_entry(entry_id: str) -> Optional[ConfigEntry]:
    """Get a config entry by ID."""
    return _CONFIG_ENTRIES.get(entry_id)


# RECORDER EXCLUSION - Deaktiviert wegen Kompatibilitätsproblemen
async def register_recorder_exclusion(hass: HomeAssistant, entities_to_exclude: List[str]) -> None:
    """Register entities to be excluded from recorder.
    
    Note: Diese Funktion ist in neueren Home Assistant Versionen nicht mehr nötig.
    Die Recorder-Konfiguration erfolgt über configuration.yaml oder die UI.
    """
    _LOGGER.debug(f"Recorder exclusion requested for {len(entities_to_exclude)} entities")
    # Funktion macht nichts mehr - nur für Rückwärtskompatibilität vorhanden
    pass


class AlternativeTimeSensorBase(SensorEntity):
    """Base class for Alternative Time System sensors."""

    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Normalized parent attributes as a dict (never None).

        HA's SensorEntity.extra_state_attributes returns None by default.
        Returning a dict here ensures plugin code that calls
        ``super().extra_state_attributes.update(...)`` won't crash.
        """
        parent = getattr(super(), "extra_state_attributes", None)
        try:
            # If parent is a property on base class, access its value
            parent_val = super().extra_state_attributes  # type: ignore[attr-defined]
        except Exception:
            parent_val = None
        base_attrs = parent_val if isinstance(parent_val, dict) else (parent_val or {})
        return dict(base_attrs)
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the sensor."""
        self._base_name = base_name
        self._hass = hass
        self._state = None
        self._attr_should_poll = True
        self._calendar_id = None  # Will be set by async_setup_entry
        self._config_entry_id = None  # Will be set by async_setup_entry
        
        # Set update interval from class attribute if available
        if hasattr(self.__class__, 'UPDATE_INTERVAL'):
            self._update_interval = self.__class__.UPDATE_INTERVAL
        else:
            self._update_interval = 3600  # Default 1 hour
    
    def get_plugin_options(self) -> Dict[str, Any]:
        """Get plugin options for this sensor with detailed debugging."""
        # Basis-Debug nur wenn wirklich ein Problem besteht
        if not self._config_entry_id or not self._calendar_id:
            _LOGGER.debug(f"get_plugin_options called for {self.__class__.__name__}")
            _LOGGER.debug(f"  _config_entry_id: {self._config_entry_id}")
            _LOGGER.debug(f"  _calendar_id: {self._calendar_id}")
            
            if not self._config_entry_id:
                _LOGGER.warning(f"{self.__class__.__name__}: No config_entry_id set - called too early?")
            if not self._calendar_id:
                _LOGGER.warning(f"{self.__class__.__name__}: No calendar_id set - called too early?")
            return {}
        
        config_entry = _CONFIG_ENTRIES.get(self._config_entry_id)
        if not config_entry:
            _LOGGER.error(f"Config entry {self._config_entry_id} not found in _CONFIG_ENTRIES")
            _LOGGER.debug(f"Available entries: {list(_CONFIG_ENTRIES.keys())}")
            return {}
        
        plugin_options = config_entry.data.get("plugin_options", {})
        calendar_options = plugin_options.get(self._calendar_id, {})
        
        # Nur loggen wenn tatsächlich Optionen vorhanden sind
        if calendar_options:
            _LOGGER.debug(f"{self.__class__.__name__} ({self._calendar_id}) loaded options: {calendar_options}")
        
        return calendar_options
    
    @property
    def update_interval(self) -> int:
        """Return the update interval in seconds."""
        return self._update_interval
    
    @property
    def should_poll(self) -> bool:
        """Return True if entity has to be polled for state."""
        return True
    
    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return True
    
    def _translate(self, key: str, default: str = "") -> str:
        """Translate a CALENDAR_INFO text block for the user's language.
        
        - Reads the integration's CALENDAR_INFO from the concrete sensor module.
        - Chooses hass.config.language if available; falls back to primary subtag (e.g. "de" from "de-DE"),
          then to English ("en"), and finally to the provided default.
        - If CALENDAR_INFO[key] is not a mapping (e.g. a plain string), that value is returned.
        """
        # Lazy-load CALENDAR_INFO from module
        info = {}
        try:
            mod = __import__(self.__class__.__module__, fromlist=["CALENDAR_INFO"])
            if hasattr(mod, "CALENDAR_INFO"):
                info = getattr(mod, "CALENDAR_INFO") or {}
        except Exception:
            info = {}
        
        value = info.get(key, default)
        if not isinstance(value, dict):
            return str(value)
        
        # Get user's language from Home Assistant
        lang = getattr(self._hass.config, "language", "en")
        
        # Try exact match first
        if lang in value:
            return value[lang]
        
        # Try primary language tag (e.g., "de" from "de-DE")
        primary = lang.split("-")[0] if "-" in lang else lang.split("_")[0] if "_" in lang else lang
        if primary in value:
            return value[primary]
        
        # Fallback to English
        if "en" in value:
            return value["en"]
        
        # Return default or first available value
        return default if default else next(iter(value.values()), "")
    
    @property
    def device_info(self):
        """Return device registry information for this entity."""
        # Lazy-load CALENDAR_INFO from module
        info = {}
        try:
            mod = __import__(self.__class__.__module__, fromlist=["CALENDAR_INFO"])
            if hasattr(mod, "CALENDAR_INFO"):
                info = getattr(mod, "CALENDAR_INFO") or {}
        except Exception:
            info = {}
        category = str(info.get("category") or "uncategorized")
        if category == "religious":
            category = "religion"
        device_name = f"Alternative Time – {category.title()}"
        return {
            "identifiers": {(DOMAIN, f"group:{category}")},
            "manufacturer": "Alternative Time Systems",
            "model": "Category Group",
            "name": device_name,
        }

    async def async_added_to_hass(self) -> None:
        """Schedule periodic updates in a non-blocking way."""
        # Log when entity is added
        _LOGGER.debug(f"{self._attr_name} added to Home Assistant")
        
        # Determine interval from CALENDAR_INFO or class constant
        interval = None
        try:
            mod = __import__(self.__class__.__module__, fromlist=["CALENDAR_INFO"])
            info = getattr(mod, "CALENDAR_INFO", {}) or {}
            interval = info.get("update_interval")
        except Exception:
            interval = None
        if not isinstance(interval, (int, float)):
            interval = getattr(self.__class__, "UPDATE_INTERVAL", None)
        try:
            seconds = max(1, int(interval)) if interval else 3600
        except Exception:
            seconds = 3600

        _LOGGER.debug(f"{self._attr_name} will update every {seconds} seconds")

        # Avoid platform-wide polling
        self._attr_should_poll = False

        # Start scheduler
        from datetime import timedelta as _td
        self._unsub_timer = async_track_time_interval(self._hass, self._async_timer_tick, _td(seconds=seconds))
        
        # Trigger first run
        self._hass.async_create_task(self._async_timer_tick(None))

    async def async_will_remove_from_hass(self) -> None:
        """Cancel the scheduled timer when entity is removed."""
        _LOGGER.debug(f"{self._attr_name} being removed from Home Assistant")
        
        unsub = getattr(self, "_unsub_timer", None)
        if unsub:
            try:
                unsub()
            except Exception:
                pass
            self._unsub_timer = None

    async def _async_timer_tick(self, _now) -> None:
        """Call plugin update without blocking the event loop."""
        try:
            # Prefer plugin's async_update if available
            if hasattr(self, "async_update") and callable(getattr(self, "async_update")):
                await getattr(self, "async_update")()
            else:
                await self._hass.async_add_executor_job(getattr(self, "update"))
        except Exception as exc:
            _LOGGER.debug(f"Scheduled update failed for {self.name}: {exc}")
        finally:
            try:
                self.async_write_ha_state()
            except Exception:
                pass