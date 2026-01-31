"""Swatch Internet Time Calendar implementation - Version 2.9.1."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import logging
from typing import Dict, Any

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

try:
    import pytz
    HAS_PYTZ = True
except ImportError:
    HAS_PYTZ = False
    _LOGGER.warning("pytz not installed, using UTC+1 approximation for Biel Mean Time")

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (1 second for smooth beat transitions)
UPDATE_INTERVAL = 1

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "swatch",
    "version": "2.9.1",
    "icon": "mdi:web-clock",
    "category": "technical",
    "accuracy": "commercial",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Swatch Internet Time",
        "de": "Swatch Internet-Zeit",
        "es": "Hora Internet Swatch",
        "fr": "Temps Internet Swatch",
        "it": "Ora Internet Swatch",
        "nl": "Swatch Internet Tijd",
        "pl": "Czas Internetowy Swatch",
        "pt": "Hora da Internet Swatch",
        "ru": "Интернет-время Swatch",
        "ja": "スウォッチ・インターネットタイム",
        "zh": "斯沃琪互联网时间",
        "ko": "스와치 인터넷 시간"
    },
    
    # Translations for compatibility
    "translations": {
        "en": {
            "name": "Swatch Internet Time",
            "description": "Internet Time in Beats @000-@999. One day = 1000 beats, no time zones"
        },
        "de": {
            "name": "Swatch Internet-Zeit",
            "description": "Internet-Zeit in Beats @000-@999. Ein Tag = 1000 Beats, keine Zeitzonen"
        },
        "es": {
            "name": "Hora Internet Swatch",
            "description": "Tiempo de Internet en Beats @000-@999. Un día = 1000 beats, sin zonas horarias"
        },
        "fr": {
            "name": "Temps Internet Swatch",
            "description": "Temps Internet en Beats @000-@999. Un jour = 1000 beats, pas de fuseaux horaires"
        },
        "it": {
            "name": "Ora Internet Swatch",
            "description": "Tempo Internet in Beat @000-@999. Un giorno = 1000 beat, nessun fuso orario"
        },
        "nl": {
            "name": "Swatch Internet Tijd",
            "description": "Internet Tijd in Beats @000-@999. Eén dag = 1000 beats, geen tijdzones"
        },
        "pl": {
            "name": "Czas Internetowy Swatch",
            "description": "Czas internetowy w bitach @000-@999. Jeden dzień = 1000 bitów, bez stref czasowych"
        },
        "pt": {
            "name": "Hora da Internet Swatch",
            "description": "Tempo da Internet em Beats @000-@999. Um dia = 1000 beats, sem fusos horários"
        },
        "ru": {
            "name": "Интернет-время Swatch",
            "description": "Интернет-время в битах @000-@999. Один день = 1000 битов, без часовых поясов"
        },
        "ja": {
            "name": "スウォッチ・インターネットタイム",
            "description": "インターネットタイムをビート@000-@999で表示。1日=1000ビート、タイムゾーンなし"
        },
        "zh": {
            "name": "斯沃琪互联网时间",
            "description": "互联网时间以节拍@000-@999表示。一天=1000节拍，无时区"
        },
        "ko": {
            "name": "스와치 인터넷 시간",
            "description": "비트 @000-@999로 표시되는 인터넷 시간. 하루 = 1000비트, 시간대 없음"
        }
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Internet Time in Beats @000-@999. One day = 1000 beats, no time zones",
        "de": "Internet-Zeit in Beats @000-@999. Ein Tag = 1000 Beats, keine Zeitzonen",
        "es": "Tiempo de Internet en Beats @000-@999. Un día = 1000 beats, sin zonas horarias",
        "fr": "Temps Internet en Beats @000-@999. Un jour = 1000 beats, pas de fuseaux horaires",
        "it": "Tempo Internet in Beat @000-@999. Un giorno = 1000 beat, nessun fuso orario",
        "nl": "Internet Tijd in Beats @000-@999. Eén dag = 1000 beats, geen tijdzones",
        "pl": "Czas internetowy w bitach @000-@999. Jeden dzień = 1000 bitów, bez stref czasowych",
        "pt": "Tempo da Internet em Beats @000-@999. Um dia = 1000 beats, sem fusos horários",
        "ru": "Интернет-время в битах @000-@999. Один день = 1000 битов, без часовых поясов",
        "ja": "インターネットタイムをビート@000-@999で表示。1日=1000ビート、タイムゾーンなし",
        "zh": "互联网时间以节拍@000-@999表示。一天=1000节拍，无时区",
        "ko": "비트 @000-@999로 표시되는 인터넷 시간. 하루 = 1000비트, 시간대 없음"
    },
    
    # Swatch-specific data
    "swatch_data": {
        "base_timezone": "Europe/Zurich",  # BMT (Biel Mean Time)
        "beats_per_day": 1000,
        "seconds_per_beat": 86.4,  # 86400 seconds / 1000 beats
        "reference_meridian": 7.5,  # Biel/Bienne longitude
    },
    
    # Configuration options for this calendar
    "config_options": {
        "precision": {
            "type": "select",
            "default": "beat",
            "options": ["beat", "decibeat", "centibeat"],
            "label": {
                "en": "Display Precision",
                "de": "Anzeigegenauigkeit",
                "es": "Precisión de Visualización",
                "fr": "Précision d'Affichage",
                "it": "Precisione di Visualizzazione",
                "nl": "Weergaveprecisie",
                "pl": "Precyzja Wyświetlania",
                "pt": "Precisão de Exibição",
                "ru": "Точность отображения",
                "ja": "表示精度",
                "zh": "显示精度",
                "ko": "표시 정밀도"
            },
            "description": {
                "en": "Standard (@500) | Decibeat (@500.5) | Centibeat (@500.50)",
                "de": "Standard (@500) | Decibeat (@500.5) | Centibeat (@500.50)",
                "es": "Estándar (@500) | Decibeat (@500.5) | Centibeat (@500.50)",
                "fr": "Standard (@500) | Decibeat (@500.5) | Centibeat (@500.50)",
                "it": "Standard (@500) | Decibeat (@500.5) | Centibeat (@500.50)",
                "nl": "Standaard (@500) | Decibeat (@500.5) | Centibeat (@500.50)",
                "pl": "Standard (@500) | Decibeat (@500.5) | Centibeat (@500.50)",
                "pt": "Padrão (@500) | Decibeat (@500.5) | Centibeat (@500.50)",
                "ru": "Стандарт (@500) | Децибит (@500.5) | Сантибит (@500.50)",
                "ja": "標準 (@500) | デシビート (@500.5) | センチビート (@500.50)",
                "zh": "标准 (@500) | 分节拍 (@500.5) | 厘节拍 (@500.50)",
                "ko": "표준 (@500) | 데시비트 (@500.5) | 센티비트 (@500.50)"
            },
            "translations": {
                "en": {
                    "label": "Display Precision",
                    "description": "Standard (@500) | Decibeat (@500.5) | Centibeat (@500.50)"
                },
                "de": {
                    "label": "Anzeigegenauigkeit",
                    "description": "Standard (@500) | Decibeat (@500.5) | Centibeat (@500.50)"
                },
                "es": {
                    "label": "Precisión de Visualización",
                    "description": "Estándar (@500) | Decibeat (@500.5) | Centibeat (@500.50)"
                },
                "fr": {
                    "label": "Précision d'Affichage",
                    "description": "Standard (@500) | Decibeat (@500.5) | Centibeat (@500.50)"
                },
                "it": {
                    "label": "Precisione di Visualizzazione",
                    "description": "Standard (@500) | Decibeat (@500.5) | Centibeat (@500.50)"
                },
                "nl": {
                    "label": "Weergaveprecisie",
                    "description": "Standaard (@500) | Decibeat (@500.5) | Centibeat (@500.50)"
                },
                "pl": {
                    "label": "Precyzja Wyświetlania",
                    "description": "Standard (@500) | Decibeat (@500.5) | Centibeat (@500.50)"
                },
                "pt": {
                    "label": "Precisão de Exibição",
                    "description": "Padrão (@500) | Decibeat (@500.5) | Centibeat (@500.50)"
                },
                "ru": {
                    "label": "Точность отображения",
                    "description": "Стандарт (@500) | Децибит (@500.5) | Сантибит (@500.50)"
                },
                "ja": {
                    "label": "表示精度",
                    "description": "標準 (@500) | デシビート (@500.5) | センチビート (@500.50)"
                },
                "zh": {
                    "label": "显示精度",
                    "description": "标准 (@500) | 分节拍 (@500.5) | 厘节拍 (@500.50)"
                },
                "ko": {
                    "label": "표시 정밀도",
                    "description": "표준 (@500) | 데시비트 (@500.5) | 센티비트 (@500.50)"
                }
            }
        }
    }
}


class SwatchTimeSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Swatch Internet Time."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Swatch time sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Swatch Internet Time')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_swatch"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:web-clock")
        
        # Configuration option with default
        config_defaults = CALENDAR_INFO.get("config_options", {})
        precision_default = config_defaults.get("precision", {}).get("default", "beat")
        self._precision = precision_default
        
        # Swatch data
        self._swatch_data = CALENDAR_INFO["swatch_data"]
        
        # Timezone will be loaded later
        self._bmt = None
        self._bmt_initialized = False
        
        # Initialize state to a default value
        self._state = "@000"
        self._swatch_time = {}
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized Swatch Internet Time sensor: {self._attr_name}")
        _LOGGER.debug(f"  Default Precision: {self._precision}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._precision = options.get("precision", self._precision)
                
                _LOGGER.debug(f"Swatch sensor loaded options: precision={self._precision}")
            else:
                _LOGGER.debug("Swatch sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"Swatch sensor could not load options yet: {e}")
    
    async def async_added_to_hass(self) -> None:
        """When entity is added to hass."""
        await super().async_added_to_hass()
        
        # Try to load options now that IDs should be set
        self._load_options()
        
        # Initialize Timezone async
        if HAS_PYTZ and not self._bmt_initialized:
            try:
                # Execute blocking operation in executor
                self._bmt = await self.hass.async_add_executor_job(
                    pytz.timezone, self._swatch_data["base_timezone"]
                )
                self._bmt_initialized = True
                _LOGGER.debug(f"Loaded timezone {self._swatch_data['base_timezone']}")
            except Exception as e:
                _LOGGER.warning(f"Could not load timezone {self._swatch_data['base_timezone']}: {e}")
                self._bmt = None
                self._bmt_initialized = True  # Prevent retry
        
        # Perform initial update
        self.update()
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes or {}
        
        # Add Swatch-specific attributes
        if self._swatch_time:
            attrs.update(self._swatch_time)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add calculation info
            attrs["seconds_per_beat"] = self._swatch_data["seconds_per_beat"]
            attrs["beats_per_day"] = self._swatch_data["beats_per_day"]
            
            # Add current configuration
            attrs["precision_setting"] = self._precision
        
        return attrs
    
    def _calculate_swatch_time(self, earth_time: datetime) -> Dict[str, Any]:
        """Calculate Swatch Internet Time from standard time."""
        # Get time in BMT (Biel Mean Time)
        if HAS_PYTZ and self._bmt and self._bmt_initialized:
            bmt_time = earth_time.astimezone(self._bmt)
        else:
            # Fallback: use UTC+1 as approximation
            bmt_time = earth_time.astimezone(timezone(timedelta(hours=1)))
        
        # Calculate seconds since midnight BMT
        midnight_bmt = bmt_time.replace(hour=0, minute=0, second=0, microsecond=0)
        seconds_since_midnight = (bmt_time - midnight_bmt).total_seconds()
        
        # Calculate beats (with high precision)
        beats_raw = seconds_since_midnight / self._swatch_data["seconds_per_beat"]
        beats = int(beats_raw)
        fractional_beat = beats_raw - beats
        
        # Calculate subdivisions
        centibeats = int(fractional_beat * 100)
        decibeats = int(fractional_beat * 10)
        
        # Format based on precision setting
        if self._precision == "decibeat":
            formatted = f"@{beats:03d}.{decibeats:01d}"
        elif self._precision == "centibeat":
            formatted = f"@{beats:03d}.{centibeats:02d}"
        else:  # beat (default)
            formatted = f"@{beats:03d}"
        
        # Calculate percentage of day
        day_progress = (beats_raw / self._swatch_data["beats_per_day"]) * 100
        
        result = {
            "beats": beats,
            "centibeats": centibeats,
            "decibeats": decibeats,
            "fractional": round(fractional_beat, 4),
            "formatted": formatted,
            "bmt_time": bmt_time.strftime("%H:%M:%S BMT"),
            "local_time": earth_time.strftime("%H:%M:%S %Z"),
            "seconds_since_midnight_bmt": round(seconds_since_midnight, 2),
            "day_progress": f"{day_progress:.1f}%"
        }
        
        # Add time conversions
        utc_time = earth_time.astimezone(timezone.utc)
        result["utc_time"] = utc_time.strftime("%H:%M:%S UTC")
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded (in case async_added_to_hass hasn't run yet)
        if not self._options_loaded:
            self._load_options()
        
        try:
            now = datetime.now().astimezone()
            self._swatch_time = self._calculate_swatch_time(now)
            
            # Set state to formatted Swatch time
            self._state = self._swatch_time.get("formatted", "@000")
            
            _LOGGER.debug(f"Updated Swatch Internet Time to {self._state}")
        except Exception as e:
            _LOGGER.error(f"Error updating Swatch time: {e}", exc_info=True)
            self._state = "@ERROR"
    
    async def async_update(self) -> None:
        """Update sensor asynchronously."""
        # Run synchronous update in executor
        await self.hass.async_add_executor_job(self.update)