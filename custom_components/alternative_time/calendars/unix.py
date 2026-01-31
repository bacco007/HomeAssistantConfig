"""Unix Timestamp Calendar implementation - Version 2.6."""
from __future__ import annotations

from datetime import datetime
import logging
import time
from typing import Dict, Any

from homeassistant.core import HomeAssistant
# WICHTIG: Import der Basis-Klasse direkt aus sensor.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from ..sensor import AlternativeTimeSensorBase
except ImportError:
    # Fallback für direkten Import
    from sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (1 second for live timestamp)
UPDATE_INTERVAL = 1

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "unix",
    "version": "2.6.0",
    "icon": "mdi:counter",
    "category": "technical",
    "accuracy": "millisecond",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Unix Timestamp",
        "de": "Unix-Zeitstempel",
        "es": "Marca de Tiempo Unix",
        "fr": "Horodatage Unix",
        "it": "Timestamp Unix",
        "nl": "Unix Tijdstempel",
        "pt": "Carimbo de Tempo Unix",
        "ru": "Unix метка времени",
        "ja": "Unix タイムスタンプ",
        "zh": "Unix时间戳",
        "ko": "유닉스 타임스탬프"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Seconds since January 1, 1970, 00:00 UTC (e.g. 1735689600)",
        "de": "Sekunden seit 1. Januar 1970, 00:00 UTC (z.B. 1735689600)",
        "es": "Segundos desde el 1 de enero de 1970, 00:00 UTC (ej. 1735689600)",
        "fr": "Secondes depuis le 1er janvier 1970, 00:00 UTC (ex. 1735689600)",
        "it": "Secondi dal 1 gennaio 1970, 00:00 UTC (es. 1735689600)",
        "nl": "Seconden sinds 1 januari 1970, 00:00 UTC (bijv. 1735689600)",
        "pt": "Segundos desde 1 de janeiro de 1970, 00:00 UTC (ex. 1735689600)",
        "ru": "Секунды с 1 января 1970, 00:00 UTC (напр. 1735689600)",
        "ja": "1970年1月1日00:00 UTCからの秒数（例：1735689600）",
        "zh": "自1970年1月1日00:00 UTC以来的秒数（例：1735689600）",
        "ko": "1970년 1월 1일 00:00 UTC 이후 초 (예: 1735689600)"
    },
    
    # Detailed information for documentation
    "detailed_info": {
        "en": {
            "overview": "Unix time is a system for describing a point in time as the number of seconds since the Unix epoch",
            "epoch": "January 1, 1970, 00:00:00 UTC",
            "structure": "Linear count of seconds, ignoring leap seconds",
            "range": "32-bit systems: 1901-12-13 to 2038-01-19 (Y2K38 problem)",
            "range_64": "64-bit systems: ±292 billion years",
            "usage": "Standard in Unix/Linux, programming languages, databases, and APIs",
            "precision": "Can be extended to milliseconds (×1000) or microseconds (×1000000)",
            "note": "Negative values represent times before 1970"
        },
        "de": {
            "overview": "Unix-Zeit ist ein System zur Beschreibung eines Zeitpunkts als Anzahl der Sekunden seit der Unix-Epoche",
            "epoch": "1. Januar 1970, 00:00:00 UTC",
            "structure": "Lineare Zählung von Sekunden, ignoriert Schaltsekunden",
            "range": "32-Bit-Systeme: 13.12.1901 bis 19.01.2038 (Y2K38-Problem)",
            "range_64": "64-Bit-Systeme: ±292 Milliarden Jahre",
            "usage": "Standard in Unix/Linux, Programmiersprachen, Datenbanken und APIs",
            "precision": "Kann auf Millisekunden (×1000) oder Mikrosekunden (×1000000) erweitert werden",
            "note": "Negative Werte stellen Zeiten vor 1970 dar"
        }
    },
    
    # Unix-specific data
    "unix_data": {
        "epoch": {
            "timestamp": 0,
            "date": "1970-01-01 00:00:00 UTC",
            "description": "Unix Epoch - Beginning of Unix time"
        },
        
        # Important Unix timestamps
        "milestones": {
            0: "Unix Epoch (1970-01-01)",
            1000000000: "Unix Billion (2001-09-09)",
            1234567890: "Unix Sequential (2009-02-13)",
            1500000000: "Unix 1.5 Billion (2017-07-14)",
            2000000000: "Unix 2 Billion (2033-05-18)",
            2147483647: "32-bit Max (2038-01-19)",
            -2147483648: "32-bit Min (1901-12-13)"
        },
        
        # Common conversions
        "conversions": {
            "second": 1,
            "minute": 60,
            "hour": 3600,
            "day": 86400,
            "week": 604800,
            "month_avg": 2629746,  # Average month
            "year": 31536000,      # 365 days
            "leap_year": 31622400   # 366 days
        },
        
        # Y2K38 problem
        "y2k38": {
            "problem": "32-bit integer overflow",
            "date": "2038-01-19 03:14:07 UTC",
            "timestamp": 2147483647,
            "solution": "Use 64-bit integers"
        },
        
        # Formats
        "formats": {
            "standard": "10 digits",
            "milliseconds": "13 digits",
            "microseconds": "16 digits",
            "nanoseconds": "19 digits"
        }
    },
    
    # Additional metadata
    "reference_url": "https://en.wikipedia.org/wiki/Unix_time",
    "documentation_url": "https://www.unixtimestamp.com/",
    "origin": "Unix operating system",
    "created_by": "AT&T Bell Laboratories",
    "introduced": "January 1, 1970",
    
    # Example format
    "example": "1735689600",
    "example_meaning": "1735689600 seconds since Unix epoch (December 31, 2024)",
    
    # Related calendars
    "related": ["julian", "swatch", "hexadecimal"],
    
    # Tags for searching and filtering
    "tags": [
        "technical", "unix", "linux", "posix", "epoch",
        "timestamp", "programming", "database", "api"
    ],
    
    # Special features
    "features": {
        "continuous_count": True,
        "no_timezone": True,
        "no_leap_seconds": True,
        "precision": "second",
        "extendable_precision": True,
        "machine_readable": True
    },
    
    # Configuration options for this calendar
    "config_options": {
        "show_milliseconds": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show milliseconds",
                "de": "Millisekunden anzeigen"
            },
            "description": {
                "en": "Show millisecond precision",
                "de": "Millisekunden-Präzision anzeigen"
            }
        },
        "show_human_readable": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show human-readable date",
                "de": "Lesbares Datum anzeigen"
            },
            "description": {
                "en": "Show human-readable date",
                "de": "Menschenlesbares Datum anzeigen"
            }
        },
        "show_milestone": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show milestones",
                "de": "Meilensteine anzeigen"
            },
            "description": {
                "en": "Show nearest milestone",
                "de": "Nächsten Meilenstein anzeigen"
            }
        }
    }
}


class UnixTimestampSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Unix Timestamp."""
    
    # Class-level update interval
    UPDATE_INTERVAL = 1  # Update every second
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Unix timestamp sensor."""
        super().__init__(base_name, hass)
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Unix Timestamp')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_unix"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:counter")
        
        # Configuration options with defaults from CALENDAR_INFO
        # Options will be loaded later in async_added_to_hass
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._show_milliseconds = config_defaults.get("show_milliseconds", {}).get("default", False)
        self._show_human_readable = config_defaults.get("show_human_readable", {}).get("default", True)
        self._show_milestone = config_defaults.get("show_milestone", {}).get("default", True)
        
        # Unix data
        self._unix_data = CALENDAR_INFO["unix_data"]
        
        # Initialize state
        self._state = None
        self._unix_time = {}
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized Unix Timestamp sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._show_milliseconds = options.get("show_milliseconds", self._show_milliseconds)
                self._show_human_readable = options.get("show_human_readable", self._show_human_readable)
                self._show_milestone = options.get("show_milestone", self._show_milestone)
                
                _LOGGER.debug(f"Unix sensor loaded options: milliseconds={self._show_milliseconds}, "
                            f"human_readable={self._show_human_readable}, milestone={self._show_milestone}")
            else:
                _LOGGER.debug("Unix sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"Unix sensor could not load options yet: {e}")
    
    async def async_added_to_hass(self) -> None:
        """When entity is added to hass."""
        await super().async_added_to_hass()
        
        # Try to load options now that IDs should be set
        self._load_options()
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        # Add Unix-specific attributes
        if self._unix_time:
            attrs.update(self._unix_time)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add epoch information
            attrs["epoch"] = self._unix_data["epoch"]["date"]
        
        return attrs
    
    def _find_nearest_milestone(self, timestamp: int) -> Dict[str, Any]:
        """Find the nearest Unix milestone."""
        milestones = self._unix_data["milestones"]
        
        nearest = None
        min_diff = float('inf')
        
        for milestone_ts, description in milestones.items():
            diff = abs(timestamp - milestone_ts)
            if diff < min_diff:
                min_diff = diff
                nearest = {
                    "timestamp": milestone_ts,
                    "description": description,
                    "difference": timestamp - milestone_ts
                }
        
        return nearest
    
    def _calculate_unix_time(self, earth_time: datetime) -> Dict[str, Any]:
        """Calculate Unix timestamp from standard time."""
        
        # Calculate Unix timestamp
        timestamp = int(time.time())
        timestamp_float = time.time()
        
        # Calculate milliseconds if needed
        milliseconds = int(timestamp_float * 1000)
        microseconds = int(timestamp_float * 1000000)
        
        # Calculate time since epoch
        days_since_epoch = timestamp // self._unix_data["conversions"]["day"]
        years_since_epoch = timestamp // self._unix_data["conversions"]["year"]
        
        # Y2K38 countdown
        y2k38_timestamp = self._unix_data["y2k38"]["timestamp"]
        seconds_until_y2k38 = y2k38_timestamp - timestamp
        days_until_y2k38 = seconds_until_y2k38 // self._unix_data["conversions"]["day"]
        
        # Find nearest milestone
        milestone = self._find_nearest_milestone(timestamp)
        
        # Format the timestamp
        if self._show_milliseconds:
            formatted = str(milliseconds)
            display_value = f"{milliseconds:,}"
        else:
            formatted = str(timestamp)
            display_value = f"{timestamp:,}"
        
        result = {
            "timestamp": timestamp,
            "timestamp_float": timestamp_float,
            "milliseconds": milliseconds,
            "microseconds": microseconds,
            "formatted": formatted,
            "display_value": display_value,
            "days_since_epoch": days_since_epoch,
            "years_since_epoch": years_since_epoch,
            "full_display": formatted
        }
        
        # Add human-readable if enabled
        if self._show_human_readable:
            human_readable = earth_time.strftime("%Y-%m-%d %H:%M:%S UTC")
            result["human_readable"] = human_readable
            result["full_display"] = f"{formatted} ({human_readable})"
        
        # Add milestone if enabled
        if self._show_milestone and milestone:
            if milestone["difference"] == 0:
                result["milestone"] = f"🎉 {milestone['description']}"
            else:
                if abs(milestone["difference"]) < 86400:  # Within a day
                    result["milestone"] = f"Near {milestone['description']}"
        
        # Add Y2K38 info for 32-bit systems
        if timestamp > 2000000000:  # Getting close to Y2K38
            result["y2k38_warning"] = f"⚠️ Y2K38 in {days_until_y2k38} days"
            result["y2k38_date"] = self._unix_data["y2k38"]["date"]
        
        # Binary representation
        result["binary"] = bin(timestamp)
        result["hexadecimal"] = hex(timestamp)
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded (in case async_added_to_hass hasn't run yet)
        if not self._options_loaded:
            self._load_options()
        
        now = datetime.now()
        self._unix_time = self._calculate_unix_time(now)
        
        # Set state to Unix timestamp
        self._state = self._unix_time["formatted"]
        
        _LOGGER.debug(f"Updated Unix Timestamp to {self._state}")