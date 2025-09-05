"""Harptos Calendar (Dungeons & Dragons / Forgotten Realms) implementation - Version 2.6.1."""
from __future__ import annotations

from datetime import datetime, date
import logging
from typing import Dict, Any, List, Optional

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (3600 seconds = 1 hour)
UPDATE_INTERVAL = 3600

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "harptos",
    "version": "2.6.1",
    "icon": "mdi:dice-d20",
    "category": "fantasy",
    "accuracy": "fictional",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "D&D Harptos Calendar",
        "de": "D&D Harptos-Kalender",
        "es": "Calendario Harptos D&D",
        "fr": "Calendrier Harptos D&D",
        "it": "Calendario Harptos D&D",
        "nl": "D&D Harptos Kalender",
        "pl": "Kalendarz Harptos D&D",
        "pt": "Calendário Harptos D&D",
        "ru": "Календарь Харптос D&D",
        "ja": "D&D ハープトス暦",
        "zh": "D&D 哈普托斯历",
        "ko": "D&D 하프토스 달력"
    },
    
    # Translations for compatibility
    "translations": {
        "en": {
            "name": "D&D Harptos Calendar",
            "description": "Forgotten Realms calendar: 12×30 days with festivals, tendays as weeks"
        },
        "de": {
            "name": "D&D Harptos-Kalender",
            "description": "Vergessene Reiche Kalender: 12×30 Tage mit Festen, Zehntage als Wochen"
        },
        "es": {
            "name": "Calendario Harptos D&D",
            "description": "Calendario de Reinos Olvidados: 12×30 días con festivales, décadas como semanas"
        },
        "fr": {
            "name": "Calendrier Harptos D&D",
            "description": "Calendrier des Royaumes Oubliés: 12×30 jours avec festivals, décades comme semaines"
        },
        "it": {
            "name": "Calendario Harptos D&D",
            "description": "Calendario dei Reami Dimenticati: 12×30 giorni con festival, decadi come settimane"
        },
        "nl": {
            "name": "D&D Harptos Kalender",
            "description": "Vergeten Rijken kalender: 12×30 dagen met festivals, tiendagen als weken"
        },
        "pl": {
            "name": "Kalendarz Harptos D&D",
            "description": "Kalendarz Zapomnianych Krain: 12×30 dni z festiwalami, dziesięciodniówki jako tygodnie"
        },
        "pt": {
            "name": "Calendário Harptos D&D",
            "description": "Calendário dos Reinos Esquecidos: 12×30 dias com festivais, décadas como semanas"
        },
        "ru": {
            "name": "Календарь Харптос D&D",
            "description": "Календарь Забытых Королевств: 12×30 дней с фестивалями, десятидневки как недели"
        },
        "ja": {
            "name": "D&D ハープトス暦",
            "description": "フォーゴトン・レルム暦：12×30日と祭り、10日週"
        },
        "zh": {
            "name": "D&D 哈普托斯历",
            "description": "被遗忘国度历法：12×30天带节日，十天为周"
        },
        "ko": {
            "name": "D&D 하프토스 달력",
            "description": "포가튼 렐름 달력: 12×30일과 축제, 10일 주"
        }
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Forgotten Realms calendar: 12×30 days with festivals, tendays as weeks",
        "de": "Vergessene Reiche Kalender: 12×30 Tage mit Festen, Zehntage als Wochen",
        "es": "Calendario de Reinos Olvidados: 12×30 días con festivales, décadas como semanas",
        "fr": "Calendrier des Royaumes Oubliés: 12×30 jours avec festivals, décades comme semaines",
        "it": "Calendario dei Reami Dimenticati: 12×30 giorni con festival, decadi come settimane",
        "nl": "Vergeten Rijken kalender: 12×30 dagen met festivals, tiendagen als weken",
        "pl": "Kalendarz Zapomnianych Krain: 12×30 dni z festiwalami, dziesięciodniówki jako tygodnie",
        "pt": "Calendário dos Reinos Esquecidos: 12×30 dias com festivais, décadas como semanas",
        "ru": "Календарь Забытых Королевств: 12×30 дней с фестивалями, десятидневки как недели",
        "ja": "フォーゴトン・レルム暦：12×30日と祭り、10日週",
        "zh": "被遗忘国度历法：12×30天带节日，十天为周",
        "ko": "포가튼 렐름 달력: 12×30일과 축제, 10일 주"
    },
    
    # Harptos-specific data
    "harptos_data": {
        # 12 months of 30 days each
        "months": [
            {"name": "Hammer", "common": "Deepwinter", "season": "Winter"},
            {"name": "Alturiak", "common": "The Claw of Winter", "season": "Winter"},
            {"name": "Ches", "common": "The Claw of the Sunsets", "season": "Spring"},
            {"name": "Tarsakh", "common": "The Claw of the Storms", "season": "Spring"},
            {"name": "Mirtul", "common": "The Melting", "season": "Spring"},
            {"name": "Kythorn", "common": "The Time of Flowers", "season": "Summer"},
            {"name": "Flamerule", "common": "Summertide", "season": "Summer"},
            {"name": "Eleasis", "common": "Highsun", "season": "Summer"},
            {"name": "Eleint", "common": "The Fading", "season": "Autumn"},
            {"name": "Marpenoth", "common": "Leaffall", "season": "Autumn"},
            {"name": "Uktar", "common": "The Rotting", "season": "Autumn"},
            {"name": "Nightal", "common": "The Drawing Down", "season": "Winter"}
        ],
        
        # Special days (festivals) between months
        "festivals": [
            {"name": "Midwinter", "after_month": 1, "description": "Festival between Hammer and Alturiak"},
            {"name": "Greengrass", "after_month": 4, "description": "Festival between Tarsakh and Mirtul"},
            {"name": "Midsummer", "after_month": 7, "description": "Festival between Flamerule and Eleasis"},
            {"name": "Highharvestide", "after_month": 9, "description": "Festival between Eleint and Marpenoth"},
            {"name": "Feast of the Moon", "after_month": 11, "description": "Festival between Uktar and Nightal"}
        ],
        
        # Leap year festival
        "shieldmeet": {
            "name": "Shieldmeet",
            "after": "Midsummer",
            "frequency": 4,  # Every 4 years
            "description": "Leap year festival after Midsummer"
        },
        
        # Tenday names (10-day weeks)
        "tenday_names": [
            "1st day", "2nd day", "3rd day", "4th day", "5th day",
            "6th day", "7th day", "8th day", "9th day", "10th day"
        ],
        
        # DR (Dalereckoning) offset from CE
        "dr_offset": 531  # 2025 CE = 1494 DR
    },
    
    # Configuration options
    "config_options": {
        "dr_offset": {
            "type": "number",
            "default": 531,
            "min": -2000,
            "max": 5000,
            "label": {
                "en": "DR Year Offset",
                "de": "DR Jahr-Versatz",
                "es": "Desplazamiento Año DR",
                "fr": "Décalage Année DR",
                "it": "Offset Anno DR",
                "nl": "DR Jaar Offset",
                "pl": "Przesunięcie Roku DR",
                "pt": "Deslocamento Ano DR",
                "ru": "Смещение года DR",
                "ja": "DR年オフセット",
                "zh": "DR年偏移",
                "ko": "DR 연도 오프셋"
            },
            "description": {
                "en": "Offset between Common Era and Dalereckoning (DR = CE - offset)",
                "de": "Versatz zwischen Common Era und Dalereckoning (DR = CE - Versatz)",
                "es": "Desplazamiento entre Era Común y Dalereckoning (DR = CE - desplazamiento)",
                "fr": "Décalage entre l'Ère Commune et Dalereckoning (DR = CE - décalage)",
                "it": "Offset tra Era Comune e Dalereckoning (DR = CE - offset)",
                "nl": "Offset tussen Common Era en Dalereckoning (DR = CE - offset)",
                "pl": "Przesunięcie między Erą Wspólną a Dalereckoning (DR = CE - przesunięcie)",
                "pt": "Deslocamento entre Era Comum e Dalereckoning (DR = CE - deslocamento)",
                "ru": "Смещение между нашей эрой и Dalereckoning (DR = CE - смещение)",
                "ja": "西暦とDalereckoningの間のオフセット（DR = CE - オフセット）",
                "zh": "公元与Dalereckoning之间的偏移（DR = CE - 偏移）",
                "ko": "서기와 Dalereckoning 사이의 오프셋 (DR = CE - 오프셋)"
            },
            "translations": {
                "en": {"label": "DR Year Offset", "description": "Offset between Common Era and Dalereckoning"},
                "de": {"label": "DR Jahr-Versatz", "description": "Versatz zwischen Common Era und Dalereckoning"}
            }
        },
        "show_common_name": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Common Names",
                "de": "Gemeine Namen anzeigen",
                "es": "Mostrar Nombres Comunes",
                "fr": "Afficher les Noms Communs",
                "it": "Mostra Nomi Comuni",
                "nl": "Toon Gewone Namen",
                "pl": "Pokaż Nazwy Pospolite",
                "pt": "Mostrar Nomes Comuns",
                "ru": "Показать общие названия",
                "ja": "一般名を表示",
                "zh": "显示通用名称",
                "ko": "일반 이름 표시"
            },
            "description": {
                "en": "Show common month names (e.g., 'Deepwinter' for Hammer)",
                "de": "Zeige gemeine Monatsnamen (z.B. 'Deepwinter' für Hammer)",
                "es": "Mostrar nombres comunes de meses (p.ej., 'Deepwinter' para Hammer)",
                "fr": "Afficher les noms communs des mois (ex: 'Deepwinter' pour Hammer)"
            }
        },
        "show_tenday": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Tenday",
                "de": "Zehntag anzeigen",
                "es": "Mostrar Década",
                "fr": "Afficher la Décade",
                "it": "Mostra Decade",
                "nl": "Toon Tiendaag",
                "pl": "Pokaż Dziesięciodniówkę",
                "pt": "Mostrar Década",
                "ru": "Показать десятидневку",
                "ja": "10日週を表示",
                "zh": "显示十日",
                "ko": "10일 표시"
            },
            "description": {
                "en": "Display which day of the tenday (1st-10th)",
                "de": "Zeige welcher Tag des Zehntages (1.-10.)",
                "es": "Mostrar qué día de la década (1º-10º)",
                "fr": "Afficher quel jour de la décade (1er-10e)"
            }
        }
    }
}


class HarptosCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for the D&D Harptos Calendar."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Harptos calendar sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'D&D Harptos Calendar')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_harptos"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:dice-d20")
        
        # Configuration options with defaults
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._dr_offset = config_defaults.get("dr_offset", {}).get("default", 531)
        self._show_common_name = config_defaults.get("show_common_name", {}).get("default", True)
        self._show_tenday = config_defaults.get("show_tenday", {}).get("default", True)
        
        # Harptos data
        self._harptos_data = CALENDAR_INFO["harptos_data"]
        
        # Initialize state
        self._state = "1 Hammer, 1494 DR"
        self._harptos = {}
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized Harptos Calendar sensor: {self._attr_name}")
        _LOGGER.debug(f"  Default settings: dr_offset={self._dr_offset}, common={self._show_common_name}, tenday={self._show_tenday}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._dr_offset = options.get("dr_offset", self._dr_offset)
                self._show_common_name = options.get("show_common_name", self._show_common_name)
                self._show_tenday = options.get("show_tenday", self._show_tenday)
                
                _LOGGER.debug(f"Harptos sensor loaded options: dr_offset={self._dr_offset}, common={self._show_common_name}, tenday={self._show_tenday}")
            else:
                _LOGGER.debug("Harptos sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"Harptos sensor could not load options yet: {e}")
    
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
        
        # Add Harptos-specific attributes
        if self._harptos:
            attrs.update(self._harptos)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add current configuration
            attrs["dr_offset_setting"] = self._dr_offset
            attrs["show_common_name_setting"] = self._show_common_name
            attrs["show_tenday_setting"] = self._show_tenday
        
        return attrs
    
    def _is_leap_year(self, year: int) -> bool:
        """Check if a year is a leap year (Gregorian rules)."""
        return (year % 4 == 0) and ((year % 100 != 0) or (year % 400 == 0))
    
    def _calculate_harptos_date(self, earth_date: datetime) -> Dict[str, Any]:
        """Calculate Harptos calendar date from Earth date."""
        
        # Get current year and day of year
        year = earth_date.year
        day_of_year = earth_date.timetuple().tm_yday
        
        # Calculate DR year
        dr_year = year - self._dr_offset
        
        # Build calendar structure for the year
        calendar_days = []
        
        # Add months and festivals
        for month_idx, month in enumerate(self._harptos_data["months"], 1):
            # Add 30 days of the month
            for day in range(1, 31):
                calendar_days.append({
                    "type": "month",
                    "month": month_idx,
                    "month_name": month["name"],
                    "common_name": month["common"],
                    "day": day,
                    "season": month["season"]
                })
            
            # Add festival after certain months
            for festival in self._harptos_data["festivals"]:
                if festival["after_month"] == month_idx:
                    calendar_days.append({
                        "type": "festival",
                        "name": festival["name"],
                        "description": festival["description"]
                    })
            
            # Add Shieldmeet after Midsummer (month 7) in leap years
            if month_idx == 7 and self._is_leap_year(year):
                calendar_days.append({
                    "type": "festival",
                    "name": self._harptos_data["shieldmeet"]["name"],
                    "description": self._harptos_data["shieldmeet"]["description"]
                })
        
        # Ensure we don't exceed calendar bounds
        if day_of_year > len(calendar_days):
            day_of_year = len(calendar_days)
        elif day_of_year < 1:
            day_of_year = 1
        
        # Get current calendar day
        current_day = calendar_days[day_of_year - 1]
        
        # Format the display
        if current_day["type"] == "month":
            month_name = current_day["month_name"]
            if self._show_common_name:
                month_name += f" ({current_day['common_name']})"
            
            display = f"{current_day['day']} {month_name}, {dr_year} DR"
            
            # Calculate tenday information
            month_day = current_day["day"]
            tenday = ((month_day - 1) // 10) + 1  # Which tenday (1-3)
            day_of_tenday = ((month_day - 1) % 10) + 1  # Day within tenday (1-10)
            
            if self._show_tenday:
                tenday_name = self._harptos_data["tenday_names"][day_of_tenday - 1]
                display += f" ({tenday_name} of tenday {tenday})"
            
            result = {
                "dr_year": dr_year,
                "month": current_day["month"],
                "month_name": current_day["month_name"],
                "common_name": current_day["common_name"],
                "day": current_day["day"],
                "season": current_day["season"],
                "tenday": tenday,
                "day_of_tenday": day_of_tenday,
                "tenday_name": tenday_name if self._show_tenday else None,
                "is_festival": False,
                "formatted": display
            }
        else:
            # Festival day
            display = f"{current_day['name']}, {dr_year} DR"
            
            result = {
                "dr_year": dr_year,
                "festival_name": current_day["name"],
                "festival_description": current_day["description"],
                "is_festival": True,
                "formatted": display
            }
        
        # Add general information
        result["earth_date"] = earth_date.strftime("%Y-%m-%d")
        result["day_of_year"] = day_of_year
        result["total_days"] = len(calendar_days)
        result["is_leap_year"] = self._is_leap_year(year)
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded
        if not self._options_loaded:
            self._load_options()
        
        try:
            now = datetime.now()
            self._harptos = self._calculate_harptos_date(now)
            
            # Set state to formatted Harptos date
            self._state = self._harptos.get("formatted", "1 Hammer, 1494 DR")
            
            _LOGGER.debug(f"Updated Harptos Calendar to {self._state}")
        except Exception as e:
            _LOGGER.error(f"Error updating Harptos calendar: {e}", exc_info=True)
            self._state = "ERROR"
    
    async def async_update(self) -> None:
        """Update sensor asynchronously."""
        # Run synchronous update in executor
        await self.hass.async_add_executor_job(self.update)