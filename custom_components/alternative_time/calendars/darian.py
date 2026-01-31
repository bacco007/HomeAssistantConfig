"""Darian Calendar (Mars) implementation - Version 2.5.1."""
from __future__ import annotations

from datetime import datetime
import logging
import math
from typing import Dict, Any

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
    "id": "darian",
    "version": "2.5.1",
    "icon": "mdi:rocket-launch",
    "category": "space",
    "accuracy": "scientific",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Darian Calendar (Mars)",
        "de": "Darischer Kalender (Mars)",
        "es": "Calendario Dariano (Marte)",
        "fr": "Calendrier Darien (Mars)",
        "it": "Calendario Dariano (Marte)",
        "nl": "Dariaanse Kalender (Mars)",
        "pl": "Kalendarz Dariański (Mars)",
        "pt": "Calendário Dariano (Marte)",
        "ru": "Дарианский календарь (Марс)",
        "ja": "ダリアン暦（火星）",
        "zh": "达里安历（火星）",
        "ko": "다리안 달력 (화성)"
    },
    
    # Translations for compatibility
    "translations": {
        "en": {
            "name": "Darian Calendar (Mars)",
            "description": "Mars calendar with 24 months and 668 sols per year"
        },
        "de": {
            "name": "Darischer Kalender (Mars)",
            "description": "Mars-Kalender mit 24 Monaten und 668 Sols pro Jahr"
        },
        "es": {
            "name": "Calendario Dariano (Marte)",
            "description": "Calendario marciano con 24 meses y 668 soles por año"
        },
        "fr": {
            "name": "Calendrier Darien (Mars)",
            "description": "Calendrier martien avec 24 mois et 668 sols par an"
        },
        "it": {
            "name": "Calendario Dariano (Marte)",
            "description": "Calendario marziano con 24 mesi e 668 sol per anno"
        },
        "nl": {
            "name": "Dariaanse Kalender (Mars)",
            "description": "Mars kalender met 24 maanden en 668 sols per jaar"
        },
        "pl": {
            "name": "Kalendarz Dariański (Mars)",
            "description": "Kalendarz marsjański z 24 miesiącami i 668 solami rocznie"
        },
        "pt": {
            "name": "Calendário Dariano (Marte)",
            "description": "Calendário marciano com 24 meses e 668 sóis por ano"
        },
        "ru": {
            "name": "Дарианский календарь (Марс)",
            "description": "Марсианский календарь с 24 месяцами и 668 солами в году"
        },
        "ja": {
            "name": "ダリアン暦（火星）",
            "description": "24ヶ月、年間668ソルの火星暦"
        },
        "zh": {
            "name": "达里安历（火星）",
            "description": "24个月，每年668火星日的火星历"
        },
        "ko": {
            "name": "다리안 달력 (화성)",
            "description": "24개월, 연간 668솔의 화성 달력"
        }
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Mars calendar with 24 months and 668 sols per year (e.g. 15 Gemini 217)",
        "de": "Mars-Kalender mit 24 Monaten und 668 Sols pro Jahr (z.B. 15 Gemini 217)",
        "es": "Calendario marciano con 24 meses y 668 soles por año (ej. 15 Gemini 217)",
        "fr": "Calendrier martien avec 24 mois et 668 sols par an (ex. 15 Gemini 217)",
        "it": "Calendario marziano con 24 mesi e 668 sol per anno (es. 15 Gemini 217)",
        "nl": "Mars kalender met 24 maanden en 668 sols per jaar (bijv. 15 Gemini 217)",
        "pl": "Kalendarz marsjański z 24 miesiącami i 668 solami rocznie (np. 15 Gemini 217)",
        "pt": "Calendário marciano com 24 meses e 668 sóis por ano (ex. 15 Gemini 217)",
        "ru": "Марсианский календарь с 24 месяцами и 668 солами в году (напр. 15 Gemini 217)",
        "ja": "24ヶ月、年間668ソルの火星暦（例：15 Gemini 217）",
        "zh": "24个月，每年668火星日的火星历（例：15 Gemini 217）",
        "ko": "24개월, 연간 668솔의 화성 달력 (예: 15 Gemini 217)"
    },
    
    # Darian-specific data
    "darian_data": {
        # Constants
        "mars_tropical_year": 668.5991,  # Mars sols
        "mars_sol_seconds": 88775.244,  # seconds
        "earth_day_seconds": 86400.0,
        "sols_per_year": 668,  # standard year
        "sols_per_leap_year": 669,
        
        # Darian months (24 months)
        "months": [
            {"name": "Sagittarius", "sols": 28, "type": "zodiac", "season": "Spring (North)"},
            {"name": "Dhanus", "sols": 28, "type": "sanskrit", "season": "Spring (North)"},
            {"name": "Capricornus", "sols": 28, "type": "zodiac", "season": "Spring (North)"},
            {"name": "Makara", "sols": 28, "type": "sanskrit", "season": "Spring (North)"},
            {"name": "Aquarius", "sols": 28, "type": "zodiac", "season": "Spring (North)"},
            {"name": "Kumbha", "sols": 28, "type": "sanskrit", "season": "Spring (North)"},
            {"name": "Pisces", "sols": 28, "type": "zodiac", "season": "Summer (North)"},
            {"name": "Mina", "sols": 27, "type": "sanskrit", "season": "Summer (North)"},
            {"name": "Aries", "sols": 28, "type": "zodiac", "season": "Summer (North)"},
            {"name": "Mesha", "sols": 28, "type": "sanskrit", "season": "Summer (North)"},
            {"name": "Taurus", "sols": 28, "type": "zodiac", "season": "Summer (North)"},
            {"name": "Vrishabha", "sols": 27, "type": "sanskrit", "season": "Summer (North)"},
            {"name": "Gemini", "sols": 28, "type": "zodiac", "season": "Autumn (North)"},
            {"name": "Mithuna", "sols": 28, "type": "sanskrit", "season": "Autumn (North)"},
            {"name": "Cancer", "sols": 28, "type": "zodiac", "season": "Autumn (North)"},
            {"name": "Karka", "sols": 27, "type": "sanskrit", "season": "Autumn (North)"},
            {"name": "Leo", "sols": 28, "type": "zodiac", "season": "Autumn (North)"},
            {"name": "Simha", "sols": 28, "type": "sanskrit", "season": "Autumn (North)"},
            {"name": "Virgo", "sols": 28, "type": "zodiac", "season": "Winter (North)"},
            {"name": "Kanya", "sols": 27, "type": "sanskrit", "season": "Winter (North)"},
            {"name": "Libra", "sols": 28, "type": "zodiac", "season": "Winter (North)"},
            {"name": "Tula", "sols": 28, "type": "sanskrit", "season": "Winter (North)"},
            {"name": "Scorpius", "sols": 28, "type": "zodiac", "season": "Winter (North)"},
            {"name": "Vrishchika", "sols": 27, "type": "sanskrit", "season": "Winter (North)"}
        ],
        
        # Week sols (7-sol week)
        "week_sols": [
            {"name": "Sol Solis", "meaning": "Sun's day"},
            {"name": "Sol Lunae", "meaning": "Moon's day"},
            {"name": "Sol Martis", "meaning": "Mars' day"},
            {"name": "Sol Mercurii", "meaning": "Mercury's day"},
            {"name": "Sol Jovis", "meaning": "Jupiter's day"},
            {"name": "Sol Veneris", "meaning": "Venus' day"},
            {"name": "Sol Saturni", "meaning": "Saturn's day"}
        ],
        
        # MSD epoch for calculations
        "msd_epoch_jd": 2405522.0,  # December 29, 1873
        "j2000_jd": 2451545.0  # January 1, 2000, 12:00 UTC
    },
    
    # Configuration options for this calendar
    "config_options": {
        "month_names": {
            "type": "select",
            "default": "zodiac",
            "options": ["zodiac", "sanskrit", "both"],
            "label": {
                "en": "Month Name Style",
                "de": "Monatsnamen-Stil",
                "es": "Estilo de Nombres de Mes",
                "fr": "Style de Noms de Mois",
                "it": "Stile Nomi dei Mesi",
                "nl": "Maandnaam Stijl",
                "pl": "Styl Nazw Miesięcy",
                "pt": "Estilo de Nomes de Mês",
                "ru": "Стиль названий месяцев",
                "ja": "月名スタイル",
                "zh": "月份名称样式",
                "ko": "월 이름 스타일"
            },
            "description": {
                "en": "Zodiac (Latin), Sanskrit, or both",
                "de": "Tierkreis (Latein), Sanskrit oder beide",
                "es": "Zodíaco (Latín), Sánscrito o ambos",
                "fr": "Zodiaque (Latin), Sanskrit ou les deux",
                "it": "Zodiaco (Latino), Sanscrito o entrambi",
                "nl": "Dierenriem (Latijn), Sanskriet of beide",
                "pl": "Zodiak (łacina), sanskryt lub oba",
                "pt": "Zodíaco (Latim), Sânscrito ou ambos",
                "ru": "Зодиак (латынь), санскрит или оба",
                "ja": "黄道十二宮（ラテン語）、サンスクリット語、または両方",
                "zh": "黄道（拉丁文）、梵文或两者",
                "ko": "황도대 (라틴어), 산스크리트어 또는 둘 다"
            },
            "translations": {
                "en": {"label": "Month Name Style", "description": "Zodiac (Latin), Sanskrit, or both"},
                "de": {"label": "Monatsnamen-Stil", "description": "Tierkreis (Latein), Sanskrit oder beide"},
                "fr": {"label": "Style de Noms de Mois", "description": "Zodiaque (Latin), Sanskrit ou les deux"}
            }
        },
        "show_week_sol": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Week Sol Name",
                "de": "Wochensol-Name anzeigen",
                "es": "Mostrar Nombre del Sol Semanal",
                "fr": "Afficher le Nom du Sol de la Semaine",
                "it": "Mostra Nome del Sol Settimanale",
                "nl": "Toon Week Sol Naam",
                "pl": "Pokaż nazwę tygodniowego sola",
                "pt": "Mostrar Nome do Sol Semanal",
                "ru": "Показать название недельного сола",
                "ja": "週ソル名を表示",
                "zh": "显示周火星日名称",
                "ko": "주 솔 이름 표시"
            },
            "description": {
                "en": "Display day of week (Sol Solis, Sol Lunae, etc.)",
                "de": "Wochentag anzeigen (Sol Solis, Sol Lunae, usw.)",
                "es": "Mostrar día de la semana (Sol Solis, Sol Lunae, etc.)",
                "fr": "Afficher le jour de la semaine (Sol Solis, Sol Lunae, etc.)"
            }
        },
        "show_msd": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Mars Sol Date",
                "de": "Mars Sol-Datum anzeigen",
                "es": "Mostrar Fecha Sol de Marte",
                "fr": "Afficher la Date Sol de Mars",
                "it": "Mostra Data Sol di Marte",
                "nl": "Toon Mars Sol Datum",
                "pl": "Pokaż datę Sol Marsa",
                "pt": "Mostrar Data Sol de Marte",
                "ru": "Показать марсианскую солнечную дату",
                "ja": "火星ソル日付を表示",
                "zh": "显示火星太阳日期",
                "ko": "화성 솔 날짜 표시"
            },
            "description": {
                "en": "Display MSD (Mars Sol Date) number",
                "de": "MSD (Mars Sol-Datum) Nummer anzeigen",
                "es": "Mostrar número MSD (Fecha Sol de Marte)",
                "fr": "Afficher le numéro MSD (Date Sol de Mars)"
            }
        }
    }
}


class DarianCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Darian Mars Calendar."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Darian calendar sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Darian Calendar')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_darian_calendar"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:rocket-launch")
        
        # Configuration options with defaults
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._month_names = config_defaults.get("month_names", {}).get("default", "zodiac")
        self._show_week_sol = config_defaults.get("show_week_sol", {}).get("default", True)
        self._show_msd = config_defaults.get("show_msd", {}).get("default", True)
        
        # Darian data
        self._darian_data = CALENDAR_INFO["darian_data"]
        
        # Initialize state
        self._state = "0 Sagittarius 1"
        self._darian_date = {}
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized Darian Calendar sensor: {self._attr_name}")
        _LOGGER.debug(f"  Default settings: month_names={self._month_names}, week_sol={self._show_week_sol}, msd={self._show_msd}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._month_names = options.get("month_names", self._month_names)
                self._show_week_sol = options.get("show_week_sol", self._show_week_sol)
                self._show_msd = options.get("show_msd", self._show_msd)
                
                _LOGGER.debug(f"Darian sensor loaded options: month_names={self._month_names}, week_sol={self._show_week_sol}, msd={self._show_msd}")
            else:
                _LOGGER.debug("Darian sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"Darian sensor could not load options yet: {e}")
    
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
        
        # Add Darian-specific attributes
        if self._darian_date:
            attrs.update(self._darian_date)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add current configuration
            attrs["month_names_setting"] = self._month_names
            attrs["show_week_sol_setting"] = self._show_week_sol
            attrs["show_msd_setting"] = self._show_msd
        
        return attrs
    
    def _calculate_darian_date(self, earth_date: datetime) -> Dict[str, Any]:
        """Calculate Darian calendar date from Earth date."""
        
        # Calculate days since J2000 epoch
        j2000_epoch = datetime(2000, 1, 1, 12, 0, 0)
        delta = earth_date - j2000_epoch
        days_since_j2000 = delta.total_seconds() / self._darian_data["earth_day_seconds"]
        
        # Calculate current Julian Date
        current_jd = self._darian_data["j2000_jd"] + days_since_j2000
        
        # Calculate Mars Sol Date (MSD)
        # MSD = (JD - 2405522.0) / 1.02749125
        sol_per_earth_day = self._darian_data["earth_day_seconds"] / self._darian_data["mars_sol_seconds"]
        msd = (current_jd - self._darian_data["msd_epoch_jd"]) / sol_per_earth_day
        total_sols = int(msd)
        
        # Calculate Darian date
        # Starting from year 0 (1608 CE)
        mars_years_elapsed = int(total_sols / self._darian_data["sols_per_year"])
        sols_in_current_year = total_sols % self._darian_data["sols_per_year"]
        
        # Determine month and sol
        sols_counted = 0
        current_month_index = 0
        current_sol = 0
        
        for i, month_data in enumerate(self._darian_data["months"]):
            if sols_counted + month_data["sols"] > sols_in_current_year:
                current_month_index = i
                current_sol = sols_in_current_year - sols_counted + 1
                break
            sols_counted += month_data["sols"]
        else:
            # Last month of year
            current_month_index = 23
            current_sol = sols_in_current_year - sols_counted + 1
        
        month_data = self._darian_data["months"][current_month_index]
        
        # Get month name based on configuration
        if self._month_names == "sanskrit":
            # Use Sanskrit names (odd indices)
            if month_data["type"] == "zodiac":
                month_name = self._darian_data["months"][current_month_index + 1]["name"] if current_month_index < 23 else month_data["name"]
            else:
                month_name = month_data["name"]
        elif self._month_names == "both":
            # Show both names
            if month_data["type"] == "zodiac" and current_month_index < 23:
                sanskrit_name = self._darian_data["months"][current_month_index + 1]["name"]
                month_name = f"{month_data['name']}/{sanskrit_name}"
            elif month_data["type"] == "sanskrit" and current_month_index > 0:
                zodiac_name = self._darian_data["months"][current_month_index - 1]["name"]
                month_name = f"{zodiac_name}/{month_data['name']}"
            else:
                month_name = month_data["name"]
        else:  # zodiac
            # Use Zodiac names (even indices)
            if month_data["type"] == "sanskrit":
                month_name = self._darian_data["months"][current_month_index - 1]["name"] if current_month_index > 0 else month_data["name"]
            else:
                month_name = month_data["name"]
        
        # Calculate week sol
        week_sol_index = total_sols % 7
        week_sol_data = self._darian_data["week_sols"][week_sol_index]
        
        # Determine season
        season = month_data["season"]
        
        # Calculate approximate Ls (solar longitude)
        ls = (sols_in_current_year / self._darian_data["sols_per_year"]) * 360
        
        # Format the date
        full_date = f"{current_sol} {month_name} {mars_years_elapsed}"
        if self._show_week_sol:
            full_date += f" ({week_sol_data['name']})"
        
        result = {
            "year": mars_years_elapsed,
            "month_number": current_month_index + 1,
            "month_name": month_name,
            "month_type": month_data["type"],
            "sol": current_sol,
            "sols_in_month": month_data["sols"],
            "week_sol": week_sol_index + 1,
            "week_sol_name": week_sol_data["name"],
            "week_sol_meaning": week_sol_data["meaning"],
            "season": season,
            "total_sols": total_sols,
            "sols_in_year": self._darian_data["sols_per_year"],
            "earth_date": earth_date.strftime("%Y-%m-%d"),
            "full_date": full_date
        }
        
        if self._show_msd:
            result["mars_sol_date"] = round(msd, 4)
            result["msd_integer"] = total_sols
        
        # Add solar longitude
        result["solar_longitude"] = round(ls, 1)
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded
        if not self._options_loaded:
            self._load_options()
        
        try:
            now = datetime.now()
            self._darian_date = self._calculate_darian_date(now)
            
            # Set state to formatted Darian date
            self._state = self._darian_date.get("full_date", "0 Sagittarius 1")
            
            _LOGGER.debug(f"Updated Darian Calendar to {self._state}")
        except Exception as e:
            _LOGGER.error(f"Error updating Darian calendar: {e}", exc_info=True)
            self._state = "ERROR"
    
    async def async_update(self) -> None:
        """Update sensor asynchronously."""
        # Run synchronous update in executor
        await self.hass.async_add_executor_job(self.update)