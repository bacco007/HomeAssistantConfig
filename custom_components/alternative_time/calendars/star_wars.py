"""Star Wars Galactic Calendar implementation - Version 2.6."""
from __future__ import annotations

from datetime import datetime
import logging
from typing import Dict, Any

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (3600 seconds = 1 hour for galactic dates)
UPDATE_INTERVAL = 3600

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "star_wars",
    "version": "2.6.0",
    "icon": "mdi:death-star-variant",
    "category": "scifi",
    "accuracy": "fictional",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Star Wars Galactic Calendar",
        "de": "Star Wars Galaktischer Kalender",
        "es": "Calendario Galáctico de Star Wars",
        "fr": "Calendrier Galactique Star Wars",
        "it": "Calendario Galattico di Star Wars",
        "nl": "Star Wars Galactische Kalender",
        "pt": "Calendário Galáctico Star Wars",
        "ru": "Галактический календарь Звездных войн",
        "ja": "スター・ウォーズ銀河暦",
        "zh": "星球大战银河历",
        "ko": "스타워즈 은하력"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Galactic Standard Calendar with 368-day years (e.g. 35:3:8 ABY)",
        "de": "Galaktischer Standardkalender mit 368-Tage-Jahren (z.B. 35:3:8 NSY)",
        "es": "Calendario Estándar Galáctico con años de 368 días (ej. 35:3:8 DBY)",
        "fr": "Calendrier Standard Galactique avec années de 368 jours (ex. 35:3:8 ABY)",
        "it": "Calendario Standard Galattico con anni di 368 giorni (es. 35:3:8 ABY)",
        "nl": "Galactische Standaard Kalender met 368-dagen jaren (bijv. 35:3:8 ABY)",
        "pt": "Calendário Padrão Galáctico com anos de 368 dias (ex. 35:3:8 DBY)",
        "ru": "Галактический стандартный календарь с 368-дневными годами (напр. 35:3:8 ПБЯ)",
        "ja": "368日年の銀河標準暦（例：35:3:8 ABY）",
        "zh": "368天年的银河标准历（例：35:3:8 ABY）",
        "ko": "368일 연도의 은하 표준 달력 (예: 35:3:8 ABY)"
    },
    
    # Star Wars calendar data
    "star_wars_data": {
        # Galactic Standard Calendar structure
        "days_per_year": 368,
        "months_per_year": 10,
        "weeks_per_month": 7,
        "days_per_week": 5,
        "days_per_month": 35,  # 7 weeks * 5 days
        "festival_weeks": 3,    # 3 festival weeks
        "holidays": 3,          # 3 separate holidays
        
        # Month names
        "months": [
            "Elona", "Kelona", "Selona", "Telona", "Nelona",
            "Helona", "Melona", "Yelona", "Relona", "Welona"
        ],
        
        # Day names (5-day week)
        "weekdays": [
            "Primeday", "Centaxday", "Taungsday", "Zhellday", "Benduday"
        ],
        
        # Festival weeks (between months)
        "festivals": {
            "1": "Festival of Stars",    # After month 1
            "5": "Festival of Life",     # After month 5  
            "9": "Festival of Worlds"    # After month 9
        },
        
        # Holidays (separate days)
        "holidays": {
            "New Year": "Start of Elona",
            "Republic Day": "Mid-year",
            "Empire Day": "End of Welona"
        },
        
        # Era systems
        "eras": {
            "bby": {"name": "Before Battle of Yavin", "abbr": "BBY"},
            "aby": {"name": "After Battle of Yavin", "abbr": "ABY"},
            "brs": {"name": "Before Ruusan Reformation", "abbr": "BRS"},
            "ars": {"name": "After Ruusan Reformation", "abbr": "ARS"},
            "grs": {"name": "Great ReSynchronization", "abbr": "GrS"}
        },
        
        # Current year (relative to Battle of Yavin)
        "current_year_aby": 35,  # 35 years after Episode IV
        
        # Planet time references
        "planets": {
            "Coruscant": {"rotation_hours": 24, "capital": True},
            "Tatooine": {"rotation_hours": 23, "suns": 2},
            "Hoth": {"rotation_hours": 23, "climate": "frozen"},
            "Endor": {"rotation_hours": 18, "moon": True},
            "Naboo": {"rotation_hours": 26, "moons": 3},
            "Dagobah": {"rotation_hours": 23, "force_nexus": True}
        }
    },
    
    # Additional metadata
    "reference_url": "https://starwars.fandom.com/wiki/Galactic_Standard_Calendar",
    "documentation_url": "https://www.starwars.com/databank",
    "origin": "Lucasfilm / Disney",
    "created_by": "George Lucas",
    "introduced": "1977 (in-universe calendar)",
    
    # Related calendars
    "related": ["stardate", "eve_online", "warhammer40k"],
    
    # Tags for searching and filtering
    "tags": [
        "scifi", "star_wars", "galactic", "space", "fictional",
        "movies", "disney", "lucasfilm", "jedi", "empire"
    ],
    
    # Configuration options for this calendar
    "config_options": {
        "era_system": {
            "type": "select",
            "default": "aby",
            "options": ["bby", "aby", "brs", "ars", "grs"],
            "label": {
                "en": "Era System",
                "de": "Ära-System",
                "es": "Sistema de Era",
                "fr": "Système d'Ère",
                "it": "Sistema Era",
                "nl": "Tijdperk Systeem",
                "pt": "Sistema de Era",
                "ru": "Система эр",
                "ja": "時代システム",
                "zh": "纪元系统",
                "ko": "시대 체계"
            },
            "description": {
                "en": "Choose the era reference system (BBY/ABY = Battle of Yavin)",
                "de": "Wähle das Ära-Referenzsystem (VSY/NSY = Schlacht von Yavin)"
            }
        },
        "show_week": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Week Number",
                "de": "Wochennummer anzeigen",
                "es": "Mostrar número de semana",
                "fr": "Afficher le numéro de semaine",
                "it": "Mostra numero settimana",
                "nl": "Toon weeknummer",
                "pt": "Mostrar número da semana",
                "ru": "Показать номер недели",
                "ja": "週番号を表示",
                "zh": "显示周数",
                "ko": "주 번호 표시"
            },
            "description": {
                "en": "Display the week number within the month",
                "de": "Zeige die Wochennummer innerhalb des Monats"
            }
        },
        "show_festivals": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Festivals",
                "de": "Festivals anzeigen",
                "es": "Mostrar festivales",
                "fr": "Afficher les festivals",
                "it": "Mostra festival",
                "nl": "Toon festivals",
                "pt": "Mostrar festivais",
                "ru": "Показать фестивали",
                "ja": "祭りを表示",
                "zh": "显示节日",
                "ko": "축제 표시"
            },
            "description": {
                "en": "Display galactic festival weeks",
                "de": "Zeige galaktische Festivalwochen"
            }
        },
        "planet_time": {
            "type": "select",
            "default": "Coruscant",
            "options": ["Coruscant", "Tatooine", "Hoth", "Endor", "Naboo", "Dagobah"],
            "label": {
                "en": "Planet Time Reference",
                "de": "Planeten-Zeitreferenz",
                "es": "Referencia horaria planetaria",
                "fr": "Référence temporelle planétaire",
                "it": "Riferimento orario planetario",
                "nl": "Planeet tijdreferentie",
                "pt": "Referência de tempo planetário",
                "ru": "Планетарное время",
                "ja": "惑星時間基準",
                "zh": "行星时间参考",
                "ko": "행성 시간 기준"
            },
            "description": {
                "en": "Choose reference planet for local time",
                "de": "Wähle Referenzplanet für Ortszeit"
            }
        }
    }
}


class StarWarsCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Star Wars Galactic Calendar."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Star Wars calendar sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable for _translate method
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Star Wars Galactic Calendar')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_star_wars"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:death-star-variant")
        
        # Configuration options with defaults from CALENDAR_INFO
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._era_system = config_defaults.get("era_system", {}).get("default", "aby")
        self._show_week = config_defaults.get("show_week", {}).get("default", True)
        self._show_festivals = config_defaults.get("show_festivals", {}).get("default", True)
        self._planet_time = config_defaults.get("planet_time", {}).get("default", "Coruscant")
        
        # Star Wars data
        self._star_wars_data = CALENDAR_INFO["star_wars_data"]
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        # Initialize state
        self._state = None
        self._star_wars_date = {}
        
        _LOGGER.debug(f"Initialized Star Wars Calendar sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._era_system = options.get("era_system", self._era_system)
                self._show_week = options.get("show_week", self._show_week)
                self._show_festivals = options.get("show_festivals", self._show_festivals)
                self._planet_time = options.get("planet_time", self._planet_time)
                
                _LOGGER.debug(f"Star Wars sensor loaded options: era={self._era_system}, "
                            f"planet={self._planet_time}, show_week={self._show_week}")
            else:
                _LOGGER.debug("Star Wars sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"Star Wars sensor could not load options yet: {e}")
    
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
        
        # Add Star Wars-specific attributes
        if self._star_wars_date:
            attrs.update(self._star_wars_date)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add current era info
            attrs["era_system"] = self._era_system
            attrs["planet_reference"] = self._planet_time
        
        return attrs
    
    def _calculate_star_wars_date(self, earth_date: datetime) -> Dict[str, Any]:
        """Calculate Star Wars Galactic Standard date from Earth date."""
        
        # Base conversion: Earth year 1977 (A New Hope release) = 0 ABY
        base_year = 1977
        earth_year = earth_date.year
        day_of_year = earth_date.timetuple().tm_yday
        
        # Calculate Galactic year
        years_since_base = earth_year - base_year
        galactic_year = years_since_base
        
        # Adjust for different era systems
        era_data = self._star_wars_data["eras"][self._era_system]
        if self._era_system == "bby":
            galactic_year = -galactic_year if galactic_year <= 0 else None
            if galactic_year is None:
                galactic_year = 0  # Battle of Yavin year
        elif self._era_system == "brs":
            galactic_year += 1000  # Before Ruusan Reformation
        elif self._era_system == "ars":
            galactic_year += 1000  # After Ruusan Reformation  
        elif self._era_system == "grs":
            galactic_year += 35  # Great ReSynchronization
            
        # Convert Earth day of year to Galactic calendar
        # Galactic year has 368 days, Earth has 365/366
        galactic_day_of_year = int((day_of_year / 365) * 368)
        
        # Calculate month and day
        regular_days = self._star_wars_data["days_per_month"]
        
        # Account for festival weeks
        total_regular_days = 0
        month = 0
        day = 0
        week = 0
        is_festival = False
        festival_name = None
        
        # Track through the year
        current_position = galactic_day_of_year
        
        for m in range(1, 11):  # 10 months
            month_days = regular_days
            
            if current_position <= month_days:
                month = m
                day = current_position
                week = ((day - 1) // 5) + 1
                break
            
            current_position -= month_days
            
            # Check for festival week after certain months
            if m in [1, 5, 9] and current_position <= 5:  # Festival week
                is_festival = True
                festival_name = self._star_wars_data["festivals"].get(str(m))
                day = current_position
                break
        
        if month == 0 and not is_festival:
            # Fallback to last month
            month = 10
            day = min(current_position, regular_days)
        
        # Get month name
        month_name = self._star_wars_data["months"][month - 1] if month > 0 else "Festival"
        
        # Get weekday
        weekday_index = (day - 1) % 5
        weekday = self._star_wars_data["weekdays"][weekday_index]
        
        # Format the date
        if is_festival and festival_name:
            formatted = f"{festival_name} Day {day}, Year {galactic_year} {era_data['abbr']}"
        else:
            formatted = f"{galactic_year}:{month}:{day} {era_data['abbr']}"
        
        result = {
            "year": galactic_year,
            "era": era_data["abbr"],
            "era_name": era_data["name"],
            "month": month,
            "month_name": month_name,
            "day": day,
            "weekday": weekday,
            "formatted": formatted,
            "standard_format": f"{galactic_year}:{month}:{day} {era_data['abbr']}"
        }
        
        # Add week number if configured
        if self._show_week and not is_festival:
            result["week"] = week
            result["week_display"] = f"Week {week} of {month_name}"
        
        # Add festival info if configured
        if self._show_festivals and is_festival:
            result["festival"] = festival_name
            result["festival_day"] = day
        
        # Add planet-specific time
        planet_data = self._star_wars_data["planets"].get(self._planet_time, {})
        if planet_data:
            rotation_hours = planet_data.get("rotation_hours", 24)
            # Calculate local planet hour
            earth_hour = earth_date.hour
            planet_hour = int((earth_hour / 24) * rotation_hours)
            result["planet_time"] = f"{planet_hour:02d}:00 {self._planet_time} Time"
            
            # Add planet info
            if planet_data.get("capital"):
                result["planet_note"] = "Galactic Capital"
            elif planet_data.get("suns"):
                result["planet_note"] = f"Binary star system"
            elif planet_data.get("force_nexus"):
                result["planet_note"] = "Strong in the Force"
        
        # Add a Star Wars quote based on day
        quotes = [
            "May the Force be with you",
            "Do or do not, there is no try",
            "The Force will be with you, always",
            "I find your lack of faith disturbing",
            "Never tell me the odds",
            "This is the way",
            "I have a bad feeling about this"
        ]
        quote_index = galactic_day_of_year % len(quotes)
        result["daily_wisdom"] = quotes[quote_index]
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded (in case async_added_to_hass hasn't run yet)
        if not self._options_loaded:
            self._load_options()
        
        now = datetime.now()
        self._star_wars_date = self._calculate_star_wars_date(now)
        
        # Set state to formatted Star Wars date
        self._state = self._star_wars_date["formatted"]
        
        _LOGGER.debug(f"Updated Star Wars Calendar to {self._state}")