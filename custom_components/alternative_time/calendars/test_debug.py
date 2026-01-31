"""Test Debug Calendar - Fixed ID
Version 2.1.0 - Corrected calendar ID
"""
from __future__ import annotations

from datetime import datetime
import logging
import json
from typing import Dict, Any, Optional

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

UPDATE_INTERVAL = 30  # Update every 30 seconds

CALENDAR_INFO = {
    "id": "test_debug",  # WICHTIG: Muss mit dem Dateinamen übereinstimmen!
    "version": "2.1.0",
    "icon": "mdi:bug",
    "category": "technical",
    "accuracy": "debug",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Debug Test Calendar",
        "de": "Debug-Test Kalender"
    },
    
    # Descriptions
    "description": {
        "en": "Deep debugging of option flow and config entries",
        "de": "Tiefes Debugging von Options-Flow und Config-Entries"
    },
    
    # Configuration options - Simple test cases
    "config_options": {
        # Simple boolean
        "enable_feature": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Enable Test Feature",
                "de": "Test-Feature aktivieren"
            },
            "description": {
                "en": "Simple boolean test",
                "de": "Einfacher Boolean-Test"
            }
        },
        
        # Simple select
        "mode": {
            "type": "select",
            "default": "mode_a",
            "options": ["mode_a", "mode_b", "mode_c"],
            "label": {
                "en": "Operation Mode",
                "de": "Betriebsmodus"
            },
            "description": {
                "en": "Select operation mode",
                "de": "Betriebsmodus auswählen"
            }
        },
        
        # Simple text
        "custom_text": {
            "type": "text",
            "default": "Hello World",
            "label": {
                "en": "Custom Text",
                "de": "Eigener Text"
            },
            "description": {
                "en": "Enter custom text",
                "de": "Eigenen Text eingeben"
            }
        },
        
        # Simple number
        "test_value": {
            "type": "number",
            "default": 100,
            "min": 0,
            "max": 1000,
            "label": {
                "en": "Test Value (0-1000)",
                "de": "Testwert (0-1000)"
            },
            "description": {
                "en": "Numeric value for testing",
                "de": "Numerischer Testwert"
            }
        }
    }
}


class TestDebugSensor(AlternativeTimeSensorBase):  # Klassenname geändert
    """Debug test sensor with extensive logging."""
    
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the debug sensor."""
        super().__init__(base_name, hass)
        
        # Get translated name
        calendar_name = self._translate('name', 'Debug Test Calendar')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_test_debug"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:bug")
        
        # Initialize with defaults from CALENDAR_INFO
        self._enable_feature = False
        self._mode = "mode_a"
        self._custom_text = "Hello World"
        self._test_value = 100
        
        # Debug tracking
        self._debug_log = []
        self._raw_config_entry = None
        self._raw_plugin_options = None
        self._get_options_calls = []
        self._update_count = 0
        
        # State
        self._state = "Starting..."
        
        # Log initialization
        self._log_debug("__init__", {
            "base_name": base_name,
            "unique_id": self._attr_unique_id,
            "name": self._attr_name,
            "defaults": {
                "enable_feature": self._enable_feature,
                "mode": self._mode,
                "custom_text": self._custom_text,
                "test_value": self._test_value
            }
        })
        
        _LOGGER.warning(f"[DEBUG_TEST] Sensor initialized: {self._attr_name}")
    
    def _log_debug(self, event: str, data: Any) -> None:
        """Log debug information."""
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        entry = {
            "timestamp": timestamp,
            "event": event,
            "data": data
        }
        self._debug_log.append(entry)
        
        # Also log to HA logger with WARNING level so it's visible
        _LOGGER.warning(f"[DEBUG_TEST] {timestamp} | {event}: {json.dumps(data, default=str)[:500]}")
    
    def get_plugin_options(self) -> Dict[str, Any]:
        """Override to add debugging."""
        self._log_debug("get_plugin_options_called", {
            "calendar_id": self._calendar_id,
            "config_entry_id": self._config_entry_id
        })
        
        # Call parent method
        options = super().get_plugin_options()
        
        # Log result
        self._get_options_calls.append({
            "timestamp": datetime.now().isoformat(),
            "result": options,
            "calendar_id": self._calendar_id,
            "config_entry_id": self._config_entry_id
        })
        
        self._log_debug("get_plugin_options_result", options)
        
        return options
    
    async def async_added_to_hass(self) -> None:
        """When entity is added to hass."""
        self._log_debug("async_added_to_hass_start", {
            "calendar_id": getattr(self, '_calendar_id', 'NOT_SET'),
            "config_entry_id": getattr(self, '_config_entry_id', 'NOT_SET')
        })
        
        # Call parent
        await super().async_added_to_hass()
        
        # Check IDs after parent call
        self._log_debug("async_added_to_hass_after_parent", {
            "calendar_id": self._calendar_id,
            "config_entry_id": self._config_entry_id
        })
        
        # Try to get config_entry directly
        try:
            from ..sensor import _CONFIG_ENTRIES
            if self._config_entry_id and self._config_entry_id in _CONFIG_ENTRIES:
                config_entry = _CONFIG_ENTRIES[self._config_entry_id]
                self._raw_config_entry = {
                    "entry_id": config_entry.entry_id,
                    "title": config_entry.title,
                    "data_keys": list(config_entry.data.keys()),
                    "has_plugin_options": "plugin_options" in config_entry.data,
                    "plugin_options": config_entry.data.get("plugin_options", {}),
                    "calendars": config_entry.data.get("calendars", [])
                }
                
                # Get our specific options
                plugin_opts = config_entry.data.get("plugin_options", {})
                our_opts = plugin_opts.get(self._calendar_id, {}) if self._calendar_id else {}
                
                self._log_debug("config_entry_found", {
                    "entry_id": config_entry.entry_id[:8] + "...",
                    "our_calendar_id": self._calendar_id,
                    "our_options": our_opts,
                    "all_plugin_options_keys": list(plugin_opts.keys())
                })
                
                # Store raw options
                self._raw_plugin_options = our_opts
                
            else:
                self._log_debug("config_entry_not_found", {
                    "config_entry_id": self._config_entry_id,
                    "available_entries": list(_CONFIG_ENTRIES.keys()) if '_CONFIG_ENTRIES' in locals() else []
                })
        except Exception as e:
            self._log_debug("config_entry_error", {
                "error": str(e),
                "type": type(e).__name__
            })
        
        # Try to load options
        options = self.get_plugin_options()
        if options:
            self._apply_options(options, "async_added_to_hass")
        else:
            self._log_debug("no_options_in_async_added", {
                "calendar_id": self._calendar_id,
                "config_entry_id": self._config_entry_id
            })
    
    def _apply_options(self, options: Dict[str, Any], source: str) -> None:
        """Apply options with detailed logging."""
        self._log_debug(f"apply_options_{source}", {
            "received_options": options,
            "option_keys": list(options.keys()) if options else [],
            "option_types": {k: type(v).__name__ for k, v in options.items()} if options else {}
        })
        
        if not options:
            return
        
        # Store old values
        old_values = {
            "enable_feature": self._enable_feature,
            "mode": self._mode,
            "custom_text": self._custom_text,
            "test_value": self._test_value
        }
        
        # Apply new values
        self._enable_feature = bool(options.get("enable_feature", False))
        self._mode = str(options.get("mode", "mode_a"))
        self._custom_text = str(options.get("custom_text", "Hello World"))
        
        try:
            self._test_value = float(options.get("test_value", 100))
        except (ValueError, TypeError) as e:
            self._log_debug("number_conversion_error", {
                "value": options.get("test_value"),
                "error": str(e)
            })
            self._test_value = 100
        
        # Log changes
        new_values = {
            "enable_feature": self._enable_feature,
            "mode": self._mode,
            "custom_text": self._custom_text,
            "test_value": self._test_value
        }
        
        changes = {}
        for key in old_values:
            if old_values[key] != new_values[key]:
                changes[key] = {
                    "from": old_values[key],
                    "to": new_values[key]
                }
        
        if changes:
            self._log_debug(f"options_changed_{source}", changes)
        else:
            self._log_debug(f"no_changes_{source}", new_values)
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return detailed debug attributes."""
        attrs = super().extra_state_attributes
        
        # Current configuration
        attrs["current_config"] = {
            "enable_feature": self._enable_feature,
            "mode": self._mode,
            "custom_text": self._custom_text,
            "test_value": self._test_value
        }
        
        # IDs and references
        attrs["sensor_info"] = {
            "calendar_id": self._calendar_id,
            "config_entry_id": self._config_entry_id,
            "unique_id": self._attr_unique_id,
            "update_count": self._update_count
        }
        
        # Raw data from config_entry
        if self._raw_config_entry:
            attrs["raw_config_entry"] = self._raw_config_entry
        
        # Raw plugin options
        if self._raw_plugin_options is not None:
            attrs["raw_plugin_options"] = self._raw_plugin_options
        
        # get_plugin_options call history (last 5)
        attrs["get_options_history"] = self._get_options_calls[-5:]
        
        # Debug log (last 20 entries)
        attrs["debug_log"] = self._debug_log[-20:]
        
        # Expected vs actual
        attrs["validation"] = {
            "expected_options": list(CALENDAR_INFO["config_options"].keys()),
            "received_options": list(self._raw_plugin_options.keys()) if self._raw_plugin_options else [],
            "options_match": (
                set(CALENDAR_INFO["config_options"].keys()) == 
                set(self._raw_plugin_options.keys() if self._raw_plugin_options else [])
            )
        }
        
        return attrs
    
    def update(self) -> None:
        """Update the sensor."""
        self._update_count += 1
        
        self._log_debug(f"update_{self._update_count}", {
            "calendar_id": self._calendar_id,
            "config_entry_id": self._config_entry_id
        })
        
        try:
            # Get options
            options = self.get_plugin_options()
            
            if options:
                self._apply_options(options, f"update_{self._update_count}")
                
                # Build state
                parts = [
                    f"✓ Feature:{self._enable_feature}",
                    f"Mode:{self._mode}",
                    f"Text:{self._custom_text[:10]}",
                    f"Val:{self._test_value}"
                ]
                self._state = " | ".join(parts)
            else:
                self._state = f"⚠ No Options | Update #{self._update_count}"
                
        except Exception as e:
            self._log_debug(f"update_error_{self._update_count}", {
                "error": str(e),
                "type": type(e).__name__
            })
            import traceback
            self._log_debug("traceback", traceback.format_exc())
            self._state = f"Error: {e}"