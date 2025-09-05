"""Decimal Time (French Revolutionary Time) implementation - Version 2.5.1."""
from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Dict, Any

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (1 second for smooth time display)
UPDATE_INTERVAL = 1

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "decimal",
    "version": "2.5.1",
    "icon": "mdi:clock-digital",
    "category": "technical",
    "accuracy": "mathematical",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Decimal Time",
        "de": "Dezimalzeit",
        "es": "Tiempo Decimal",
        "fr": "Temps Décimal",
        "it": "Tempo Decimale",
        "nl": "Decimale Tijd",
        "pl": "Czas Dziesiętny",
        "pt": "Tempo Decimal",
        "ru": "Десятичное время",
        "ja": "十進時間",
        "zh": "十进制时间",
        "ko": "십진 시간"
    },
    
    # Translations for compatibility
    "translations": {
        "en": {
            "name": "Decimal Time",
            "description": "French Revolutionary time: 10 hours, 100 minutes, 100 seconds per day"
        },
        "de": {
            "name": "Dezimalzeit",
            "description": "Französische Revolutionszeit: 10 Stunden, 100 Minuten, 100 Sekunden pro Tag"
        },
        "es": {
            "name": "Tiempo Decimal",
            "description": "Tiempo revolucionario francés: 10 horas, 100 minutos, 100 segundos por día"
        },
        "fr": {
            "name": "Temps Décimal",
            "description": "Temps révolutionnaire français : 10 heures, 100 minutes, 100 secondes par jour"
        },
        "it": {
            "name": "Tempo Decimale",
            "description": "Tempo rivoluzionario francese: 10 ore, 100 minuti, 100 secondi al giorno"
        },
        "nl": {
            "name": "Decimale Tijd",
            "description": "Franse revolutionaire tijd: 10 uur, 100 minuten, 100 seconden per dag"
        },
        "pl": {
            "name": "Czas Dziesiętny",
            "description": "Francuski czas rewolucyjny: 10 godzin, 100 minut, 100 sekund dziennie"
        },
        "pt": {
            "name": "Tempo Decimal",
            "description": "Tempo revolucionário francês: 10 horas, 100 minutos, 100 segundos por dia"
        },
        "ru": {
            "name": "Десятичное время",
            "description": "Французское революционное время: 10 часов, 100 минут, 100 секунд в день"
        },
        "ja": {
            "name": "十進時間",
            "description": "フランス革命暦時間：1日10時間、100分、100秒"
        },
        "zh": {
            "name": "十进制时间",
            "description": "法国革命时间：每天10小时，100分钟，100秒"
        },
        "ko": {
            "name": "십진 시간",
            "description": "프랑스 혁명 시간: 하루 10시간, 100분, 100초"
        }
    },
    
    # Short descriptions for UI
    "description": {
        "en": "French Revolutionary time: 10 hours, 100 minutes, 100 seconds per day",
        "de": "Französische Revolutionszeit: 10 Stunden, 100 Minuten, 100 Sekunden pro Tag",
        "es": "Tiempo revolucionario francés: 10 horas, 100 minutos, 100 segundos por día",
        "fr": "Temps révolutionnaire français : 10 heures, 100 minutes, 100 secondes par jour",
        "it": "Tempo rivoluzionario francese: 10 ore, 100 minuti, 100 secondi al giorno",
        "nl": "Franse revolutionaire tijd: 10 uur, 100 minuten, 100 seconden per dag",
        "pl": "Francuski czas rewolucyjny: 10 godzin, 100 minut, 100 sekund dziennie",
        "pt": "Tempo revolucionário francês: 10 horas, 100 minutos, 100 segundos por dia",
        "ru": "Французское революционное время: 10 часов, 100 минут, 100 секунд в день",
        "ja": "フランス革命暦時間：1日10時間、100分、100秒",
        "zh": "法国革命时间：每天10小时，100分钟，100秒",
        "ko": "프랑스 혁명 시간: 하루 10시간, 100분, 100초"
    },
    
    # Decimal time specific data
    "decimal_data": {
        "hours_per_day": 10,
        "minutes_per_hour": 100,
        "seconds_per_minute": 100,
        "total_seconds": 100000,
        "standard_seconds": 86400,
        
        # Conversion factors
        "conversions": {
            "decimal_hour_to_minutes": 144,  # standard minutes
            "decimal_minute_to_seconds": 86.4,  # standard seconds
            "decimal_second_to_seconds": 0.864,  # standard seconds
            "standard_hour_to_decimal": 0.41667,  # decimal hours
            "standard_minute_to_decimal": 0.00694,  # decimal hours
        },
        
        # Notable times
        "notable_times": {
            "0:00:00": "Midnight",
            "2:50:00": "Dawn (6:00 AM)",
            "3:75:00": "Morning (9:00 AM)",
            "5:00:00": "Noon",
            "6:25:00": "Afternoon (3:00 PM)",
            "7:50:00": "Evening (6:00 PM)",
            "8:75:00": "Night (9:00 PM)",
            "9:58:33": "11:00 PM"
        }
    },
    
    # Configuration options for this calendar
    "config_options": {
        "show_conversion": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Standard Time Conversion",
                "de": "Standardzeit-Umrechnung anzeigen",
                "es": "Mostrar conversión a tiempo estándar",
                "fr": "Afficher la conversion en temps standard",
                "it": "Mostra conversione al tempo standard",
                "nl": "Toon standaardtijd conversie",
                "pl": "Pokaż konwersję na czas standardowy",
                "pt": "Mostrar conversão para tempo padrão",
                "ru": "Показать преобразование в стандартное время",
                "ja": "標準時変換を表示",
                "zh": "显示标准时间转换",
                "ko": "표준 시간 변환 표시"
            },
            "description": {
                "en": "Display the equivalent standard time alongside decimal time",
                "de": "Zeigt die entsprechende Standardzeit neben der Dezimalzeit an",
                "es": "Muestra el tiempo estándar equivalente junto al tiempo decimal",
                "fr": "Affiche l'heure standard équivalente à côté de l'heure décimale",
                "it": "Mostra il tempo standard equivalente accanto al tempo decimale",
                "nl": "Toont de equivalente standaardtijd naast de decimale tijd",
                "pl": "Wyświetla równoważny czas standardowy obok czasu dziesiętnego",
                "pt": "Exibe o tempo padrão equivalente ao lado do tempo decimal",
                "ru": "Отображает эквивалентное стандартное время рядом с десятичным временем",
                "ja": "十進時間と並べて同等の標準時を表示",
                "zh": "在十进制时间旁边显示等效的标准时间",
                "ko": "십진 시간과 함께 해당하는 표준 시간 표시"
            },
            "translations": {
                "en": {
                    "label": "Show Standard Time Conversion",
                    "description": "Display the equivalent standard time alongside decimal time"
                },
                "de": {
                    "label": "Standardzeit-Umrechnung anzeigen",
                    "description": "Zeigt die entsprechende Standardzeit neben der Dezimalzeit an"
                },
                "fr": {
                    "label": "Afficher la conversion en temps standard",
                    "description": "Affiche l'heure standard équivalente à côté de l'heure décimale"
                }
            }
        },
        "precision": {
            "type": "select",
            "default": "second",
            "options": ["hour", "minute", "second"],
            "label": {
                "en": "Display Precision",
                "de": "Anzeigegenauigkeit",
                "es": "Precisión de visualización",
                "fr": "Précision d'affichage",
                "it": "Precisione di visualizzazione",
                "nl": "Weergaveprecisie",
                "pl": "Precyzja wyświetlania",
                "pt": "Precisão de exibição",
                "ru": "Точность отображения",
                "ja": "表示精度",
                "zh": "显示精度",
                "ko": "표시 정밀도"
            },
            "description": {
                "en": "Hour (5h) | Minute (5:42) | Second (5:42:36)",
                "de": "Stunde (5h) | Minute (5:42) | Sekunde (5:42:36)",
                "es": "Hora (5h) | Minuto (5:42) | Segundo (5:42:36)",
                "fr": "Heure (5h) | Minute (5:42) | Seconde (5:42:36)",
                "it": "Ora (5h) | Minuto (5:42) | Secondo (5:42:36)",
                "nl": "Uur (5h) | Minuut (5:42) | Seconde (5:42:36)",
                "pl": "Godzina (5h) | Minuta (5:42) | Sekunda (5:42:36)",
                "pt": "Hora (5h) | Minuto (5:42) | Segundo (5:42:36)",
                "ru": "Час (5h) | Минута (5:42) | Секунда (5:42:36)",
                "ja": "時 (5h) | 分 (5:42) | 秒 (5:42:36)",
                "zh": "小时 (5h) | 分钟 (5:42) | 秒 (5:42:36)",
                "ko": "시 (5h) | 분 (5:42) | 초 (5:42:36)"
            },
            "translations": {
                "en": {
                    "label": "Display Precision",
                    "description": "Hour (5h) | Minute (5:42) | Second (5:42:36)"
                },
                "de": {
                    "label": "Anzeigegenauigkeit",
                    "description": "Stunde (5h) | Minute (5:42) | Sekunde (5:42:36)"
                },
                "fr": {
                    "label": "Précision d'affichage",
                    "description": "Heure (5h) | Minute (5:42) | Seconde (5:42:36)"
                }
            }
        },
        "show_period_name": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Period Name",
                "de": "Tageszeitname anzeigen",
                "es": "Mostrar nombre del período",
                "fr": "Afficher le nom de la période",
                "it": "Mostra nome del periodo",
                "nl": "Toon periode naam",
                "pl": "Pokaż nazwę okresu",
                "pt": "Mostrar nome do período",
                "ru": "Показать название периода",
                "ja": "期間名を表示",
                "zh": "显示时段名称",
                "ko": "기간 이름 표시"
            },
            "description": {
                "en": "Show time period name (Dawn, Noon, Evening, etc.)",
                "de": "Tageszeitname anzeigen (Morgengrauen, Mittag, Abend, usw.)",
                "es": "Mostrar nombre del período (Amanecer, Mediodía, Tarde, etc.)",
                "fr": "Afficher le nom de la période (Aube, Midi, Soir, etc.)",
                "it": "Mostra nome del periodo (Alba, Mezzogiorno, Sera, ecc.)",
                "nl": "Toon periode naam (Dageraad, Middag, Avond, etc.)",
                "pl": "Pokaż nazwę okresu (Świt, Południe, Wieczór, itp.)",
                "pt": "Mostrar nome do período (Amanhecer, Meio-dia, Noite, etc.)",
                "ru": "Показать название периода (Рассвет, Полдень, Вечер и т.д.)",
                "ja": "期間名を表示（夜明け、正午、夕方など）",
                "zh": "显示时段名称（黎明、正午、傍晚等）",
                "ko": "기간 이름 표시 (새벽, 정오, 저녁 등)"
            },
            "translations": {
                "en": {
                    "label": "Show Period Name",
                    "description": "Show time period name (Dawn, Noon, Evening, etc.)"
                },
                "de": {
                    "label": "Tageszeitname anzeigen",
                    "description": "Tageszeitname anzeigen (Morgengrauen, Mittag, Abend, usw.)"
                },
                "fr": {
                    "label": "Afficher le nom de la période",
                    "description": "Afficher le nom de la période (Aube, Midi, Soir, etc.)"
                }
            }
        }
    }
}


class DecimalTimeSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Decimal Time (French Revolutionary)."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the decimal time sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Decimal Time')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_decimal"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:clock-digital")
        
        # Configuration options with defaults
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._show_conversion = config_defaults.get("show_conversion", {}).get("default", True)
        self._precision = config_defaults.get("precision", {}).get("default", "second")
        self._show_period_name = config_defaults.get("show_period_name", {}).get("default", False)
        
        # Decimal data
        self._decimal_data = CALENDAR_INFO["decimal_data"]
        
        # Initialize state
        self._state = "0:00:00"
        self._decimal_time = {}
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized Decimal Time sensor: {self._attr_name}")
        _LOGGER.debug(f"  Default settings: precision={self._precision}, show_conversion={self._show_conversion}, show_period={self._show_period_name}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._show_conversion = options.get("show_conversion", self._show_conversion)
                self._precision = options.get("precision", self._precision)
                self._show_period_name = options.get("show_period_name", self._show_period_name)
                
                _LOGGER.debug(f"Decimal sensor loaded options: precision={self._precision}, conversion={self._show_conversion}, period={self._show_period_name}")
            else:
                _LOGGER.debug("Decimal sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"Decimal sensor could not load options yet: {e}")
    
    async def async_added_to_hass(self) -> None:
        """When entity is added to hass."""
        await super().async_added_to_hass()
        
        # Try to load options now that IDs should be set
        self._load_options()
        
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
        
        # Add Decimal-specific attributes
        if self._decimal_time:
            attrs.update(self._decimal_time)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add conversion info
            attrs["decimal_seconds_per_day"] = self._decimal_data["total_seconds"]
            attrs["standard_seconds_per_day"] = self._decimal_data["standard_seconds"]
            
            # Add current configuration
            attrs["precision_setting"] = self._precision
            attrs["show_conversion_setting"] = self._show_conversion
            attrs["show_period_name_setting"] = self._show_period_name
        
        return attrs
    
    def _get_period_name(self, decimal_hours: float) -> str:
        """Get the period name for decimal time."""
        periods = {
            (0, 2.5): "Night",
            (2.5, 3.75): "Dawn",
            (3.75, 5): "Morning",
            (5, 6.25): "Afternoon",
            (6.25, 7.5): "Evening",
            (7.5, 8.75): "Dusk",
            (8.75, 10): "Night"
        }
        
        for (start, end), name in periods.items():
            if start <= decimal_hours < end:
                return name
        return "Night"
    
    def _calculate_decimal_time(self, earth_time: datetime) -> Dict[str, Any]:
        """Calculate decimal time from standard time."""
        # Get local time
        local_time = earth_time.astimezone()
        
        # Calculate seconds since midnight local time
        midnight = local_time.replace(hour=0, minute=0, second=0, microsecond=0)
        seconds_since_midnight = (local_time - midnight).total_seconds()
        
        # Calculate decimal seconds since midnight
        decimal_seconds_total = (seconds_since_midnight / self._decimal_data["standard_seconds"]) * self._decimal_data["total_seconds"]
        
        # Calculate decimal hours, minutes, seconds
        decimal_hours = int(decimal_seconds_total // (self._decimal_data["minutes_per_hour"] * self._decimal_data["seconds_per_minute"]))
        remaining = decimal_seconds_total % (self._decimal_data["minutes_per_hour"] * self._decimal_data["seconds_per_minute"])
        
        decimal_minutes = int(remaining // self._decimal_data["seconds_per_minute"])
        decimal_seconds = int(remaining % self._decimal_data["seconds_per_minute"])
        
        # Format based on precision
        if self._precision == "hour":
            formatted = f"{decimal_hours}h"
        elif self._precision == "minute":
            formatted = f"{decimal_hours}:{decimal_minutes:02d}"
        else:  # second
            formatted = f"{decimal_hours}:{decimal_minutes:02d}:{decimal_seconds:02d}"
        
        # Calculate decimal hours with fraction for period calculation
        decimal_hours_exact = decimal_seconds_total / (self._decimal_data["minutes_per_hour"] * self._decimal_data["seconds_per_minute"])
        
        # Get period name
        period_name = self._get_period_name(decimal_hours_exact)
        
        # Calculate percentage of day
        day_progress = (decimal_seconds_total / self._decimal_data["total_seconds"]) * 100
        
        result = {
            "decimal_hours": decimal_hours,
            "decimal_minutes": decimal_minutes,
            "decimal_seconds": decimal_seconds,
            "decimal_total_seconds": round(decimal_seconds_total, 2),
            "formatted": formatted,
            "standard_time": local_time.strftime("%H:%M:%S"),
            "period_name": period_name,
            "day_progress": f"{day_progress:.1f}%"
        }
        
        # Add conversion if enabled
        if self._show_conversion:
            result["standard_equivalent"] = f"{local_time.strftime('%H:%M:%S')} = {formatted}"
        
        # Add period name to formatted if enabled
        if self._show_period_name:
            result["formatted_with_period"] = f"{formatted} ({period_name})"
            if self._show_period_name:
                formatted = result["formatted_with_period"]
        
        # Find closest notable time
        min_diff = float('inf')
        closest_notable = ""
        for notable_time, description in self._decimal_data["notable_times"].items():
            parts = notable_time.split(":")
            notable_hours = int(parts[0])
            notable_minutes = int(parts[1]) if len(parts) > 1 else 0
            notable_seconds = int(parts[2]) if len(parts) > 2 else 0
            
            notable_total = (notable_hours * self._decimal_data["minutes_per_hour"] * self._decimal_data["seconds_per_minute"] +
                           notable_minutes * self._decimal_data["seconds_per_minute"] +
                           notable_seconds)
            
            diff = abs(decimal_seconds_total - notable_total)
            if diff < min_diff:
                min_diff = diff
                closest_notable = description
        
        if closest_notable:
            result["closest_notable_time"] = closest_notable
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded (in case async_added_to_hass hasn't run yet)
        if not self._options_loaded:
            self._load_options()
        
        try:
            now = datetime.now()
            self._decimal_time = self._calculate_decimal_time(now)
            
            # Set state based on configuration
            if self._show_period_name and "formatted_with_period" in self._decimal_time:
                self._state = self._decimal_time["formatted_with_period"]
            else:
                self._state = self._decimal_time.get("formatted", "0:00:00")
            
            _LOGGER.debug(f"Updated Decimal Time to {self._state}")
        except Exception as e:
            _LOGGER.error(f"Error updating Decimal time: {e}", exc_info=True)
            self._state = "ERROR"
    
    async def async_update(self) -> None:
        """Update sensor asynchronously."""
        # Run synchronous update in executor
        await self.hass.async_add_executor_job(self.update)