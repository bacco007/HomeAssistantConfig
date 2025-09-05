"""Ancient Egyptian Calendar implementation - Version 2.5."""
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

# Update interval in seconds (3600 seconds = 1 hour)
UPDATE_INTERVAL = 3600

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "egyptian",
    "version": "2.5.0",
    "icon": "mdi:pyramid",
    "category": "historical",
    "accuracy": "approximate",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Egyptian Calendar",
        "de": "Ägyptischer Kalender",
        "es": "Calendario Egipcio",
        "fr": "Calendrier Égyptien",
        "it": "Calendario Egiziano",
        "nl": "Egyptische Kalender",
        "pt": "Calendário Egípcio",
        "ru": "Египетский календарь",
        "ja": "エジプト暦",
        "zh": "埃及历",
        "ko": "이집트 달력",
        "ar": "التقويم المصري"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Ancient Egyptian civil calendar with 365 days (e.g. Dynasty 1 Year 25, 15 Thoth)",
        "de": "Altägyptischer Zivilkalender mit 365 Tagen (z.B. Dynastie 1 Jahr 25, 15 Thoth)",
        "es": "Calendario civil egipcio antiguo con 365 días (ej. Dinastía 1 Año 25, 15 Thoth)",
        "fr": "Calendrier civil égyptien antique avec 365 jours (ex. Dynastie 1 An 25, 15 Thoth)",
        "it": "Calendario civile egiziano antico con 365 giorni (es. Dinastia 1 Anno 25, 15 Thoth)",
        "nl": "Oude Egyptische burgerlijke kalender met 365 dagen (bijv. Dynastie 1 Jaar 25, 15 Thoth)",
        "pt": "Calendário civil egípcio antigo com 365 dias (ex. Dinastia 1 Ano 25, 15 Thoth)",
        "ru": "Древнеегипетский гражданский календарь с 365 днями (напр. Династия 1 Год 25, 15 Тот)",
        "ja": "365日の古代エジプト市民暦（例：第1王朝25年、トート月15日）",
        "zh": "365天的古埃及民用历（例：第1王朝25年，透特月15日）",
        "ko": "365일의 고대 이집트 민간 달력 (예: 1왕조 25년, 토트 15일)",
        "ar": "التقويم المدني المصري القديم بـ 365 يومًا"
    },
    
    # Detailed information for documentation
    "detailed_info": {
        "en": {
            "overview": "The Egyptian civil calendar was one of the first solar calendars",
            "structure": "365 days: 12 months of 30 days + 5 epagomenal days",
            "seasons": "3 seasons: Akhet (Inundation), Peret (Emergence), Shemu (Harvest)",
            "weeks": "Each month divided into 3 decans (10-day weeks)",
            "new_year": "New Year: Heliacal rising of Sirius (around July 19)",
            "drift": "Calendar drifted through seasons (Sothic cycle of 1,461 years)",
            "hours": "24 hours per day (12 day hours + 12 night hours)",
            "epagomenal": "5 extra days were birthdays of gods: Osiris, Horus, Set, Isis, Nephthys"
        },
        "de": {
            "overview": "Der ägyptische Zivilkalender war einer der ersten Sonnenkalender",
            "structure": "365 Tage: 12 Monate à 30 Tage + 5 Epagomenaltage",
            "seasons": "3 Jahreszeiten: Achet (Überschwemmung), Peret (Aussaat), Schemu (Ernte)",
            "weeks": "Jeder Monat in 3 Dekane (10-Tage-Wochen) unterteilt",
            "new_year": "Neujahr: Heliakischer Aufgang des Sirius (um den 19. Juli)",
            "drift": "Kalender driftete durch die Jahreszeiten (Sothis-Zyklus von 1.461 Jahren)",
            "hours": "24 Stunden pro Tag (12 Tagesstunden + 12 Nachtstunden)",
            "epagomenal": "5 Zusatztage waren Geburtstage der Götter: Osiris, Horus, Seth, Isis, Nephthys"
        },
        "ar": {
            "overview": "كان التقويم المدني المصري أحد أوائل التقاويم الشمسية",
            "structure": "365 يوم: 12 شهر من 30 يوم + 5 أيام نسيء",
            "seasons": "3 فصول: آخت (الفيضان)، بيريت (الإنبات)، شمو (الحصاد)",
            "weeks": "كل شهر مقسم إلى 3 عشريات (أسابيع من 10 أيام)",
            "new_year": "رأس السنة: الشروق الاحتراقي للشعرى اليمانية (حوالي 19 يوليو)",
            "drift": "انحرف التقويم عبر الفصول (دورة سوثية من 1461 سنة)",
            "hours": "24 ساعة في اليوم (12 ساعة نهار + 12 ساعة ليل)",
            "epagomenal": "5 أيام إضافية كانت أعياد ميلاد الآلهة: أوزوريس، حورس، ست، إيزيس، نفتيس"
        }
    },
    
    # Egyptian-specific data
    "egyptian_data": {
        # Egyptian months with seasons
        "months": [
            # Akhet (Inundation/Flood)
            {"name": "Thoth", "hieroglyph": "𓊖", "season": "Akhet", "season_emoji": "🌊", "god": "Thoth"},
            {"name": "Phaophi", "hieroglyph": "𓊖", "season": "Akhet", "season_emoji": "🌊", "god": "Ptah"},
            {"name": "Athyr", "hieroglyph": "𓊖", "season": "Akhet", "season_emoji": "🌊", "god": "Hathor"},
            {"name": "Choiak", "hieroglyph": "𓊖", "season": "Akhet", "season_emoji": "🌊", "god": "Sekhmet"},
            # Peret (Emergence/Winter)
            {"name": "Tybi", "hieroglyph": "🌱", "season": "Peret", "season_emoji": "🌱", "god": "Min"},
            {"name": "Mechir", "hieroglyph": "🌱", "season": "Peret", "season_emoji": "🌱", "god": "Bastet"},
            {"name": "Phamenoth", "hieroglyph": "🌱", "season": "Peret", "season_emoji": "🌱", "god": "Khnum"},
            {"name": "Pharmuthi", "hieroglyph": "🌱", "season": "Peret", "season_emoji": "🌱", "god": "Renenutet"},
            # Shemu (Harvest/Summer)
            {"name": "Pachons", "hieroglyph": "☀️", "season": "Shemu", "season_emoji": "🌾", "god": "Khonsu"},
            {"name": "Payni", "hieroglyph": "☀️", "season": "Shemu", "season_emoji": "🌾", "god": "Horus"},
            {"name": "Epiphi", "hieroglyph": "☀️", "season": "Shemu", "season_emoji": "🌾", "god": "Isis"},
            {"name": "Mesore", "hieroglyph": "☀️", "season": "Shemu", "season_emoji": "🌾", "god": "Ra"}
        ],
        
        # Decan names (10-day weeks)
        "decans": [
            {"name": "First Decan", "symbol": "𓇳"},
            {"name": "Second Decan", "symbol": "𓇴"},
            {"name": "Third Decan", "symbol": "𓇵"}
        ],
        
        # Epagomenal days (birthdays of gods)
        "epagomenal_gods": ["Osiris", "Horus", "Set", "Isis", "Nephthys"],
        
        # Hieroglyphic numbers
        "hieroglyphs": {
            1: "𓏤", 2: "𓏥", 3: "𓏦", 4: "𓏧", 5: "𓏨",
            6: "𓏩", 7: "𓏪", 8: "𓏫", 9: "𓏬",
            10: "𓎆", 20: "𓎇", 30: "𓎈"
        },
        
        # Egyptian hours
        "day_hours": [
            "First Hour of Day", "Second Hour of Day", "Third Hour of Day",
            "Fourth Hour of Day", "Fifth Hour of Day", "Sixth Hour of Day",
            "Seventh Hour of Day", "Eighth Hour of Day", "Ninth Hour of Day",
            "Tenth Hour of Day", "Eleventh Hour of Day", "Twelfth Hour of Day"
        ],
        "night_hours": [
            "First Hour of Night", "Second Hour of Night", "Third Hour of Night",
            "Fourth Hour of Night", "Fifth Hour of Night", "Sixth Hour of Night",
            "Seventh Hour of Night", "Eighth Hour of Night", "Ninth Hour of Night",
            "Tenth Hour of Night", "Eleventh Hour of Night", "Twelfth Hour of Night"
        ],
        
        # Nile status
        "nile_status": {
            "Akhet": {"status": "Nile Flooding", "emoji": "🌊"},
            "Peret": {"status": "Fields Emerging", "emoji": "🌱"},
            "Shemu": {"status": "Harvest Time", "emoji": "🌾"}
        },
        
        # New year
        "new_year": {
            "month": 7,
            "day": 19,
            "description": "Heliacal rising of Sirius"
        }
    },
    
    # Additional metadata
    "reference_url": "https://en.wikipedia.org/wiki/Egyptian_calendar",
    "documentation_url": "https://www.britannica.com/science/Egyptian-calendar",
    "origin": "Ancient Egypt",
    "created_by": "Ancient Egyptians",
    "period": "3000 BCE - 641 CE",
    
    # Example format
    "example": "Dynasty 1 Year 25, 𓏤𓏨 15 Thoth (Akhet)",
    "example_meaning": "Dynasty 1, Year 25, 15th day of Thoth month, Inundation season",
    
    # Related calendars
    "related": ["coptic", "julian", "sothic"],
    
    # Tags for searching and filtering
    "tags": [
        "historical", "ancient", "egyptian", "solar", "civil",
        "nile", "pharaoh", "hieroglyphic", "decan", "sothic"
    ],
    
    # Special features
    "features": {
        "solar_calendar": True,
        "epagomenal_days": True,
        "decans": True,
        "no_leap_year": True,
        "sothic_cycle": True,
        "hieroglyphic_numbers": True,
        "precision": "day"
    },
    
    # Configuration options for this calendar
    "config_options": {
        "show_hieroglyphs": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Hieroglyphic Numbers",
                "de": "Hieroglyphische Zahlen anzeigen",
                "es": "Mostrar números jeroglíficos",
                "fr": "Afficher les nombres hiéroglyphiques",
                "it": "Mostra numeri geroglifici",
                "nl": "Toon hiëroglifische nummers",
                "pt": "Mostrar números hieroglíficos",
                "ru": "Показывать иероглифические числа",
                "ja": "ヒエログリフ数字を表示",
                "zh": "显示象形文字数字",
                "ko": "상형문자 숫자 표시",
                "ar": "عرض الأرقام الهيروغليفية"
            },
            "description": {
                "en": "Display day numbers using ancient Egyptian hieroglyphs",
                "de": "Tageszahlen mit altägyptischen Hieroglyphen anzeigen",
                "es": "Mostrar números de días usando jeroglíficos del antiguo Egipto",
                "fr": "Afficher les numéros de jour en hiéroglyphes égyptiens anciens",
                "ar": "عرض أرقام الأيام باستخدام الهيروغليفية المصرية القديمة"
            }
        },
        "show_dynasty": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Dynasty Information",
                "de": "Dynastie-Informationen anzeigen",
                "es": "Mostrar información de dinastía",
                "fr": "Afficher les informations de dynastie",
                "it": "Mostra informazioni sulla dinastia",
                "nl": "Toon dynastie informatie",
                "pt": "Mostrar informações da dinastia",
                "ru": "Показывать информацию о династии",
                "ja": "王朝情報を表示",
                "zh": "显示王朝信息",
                "ko": "왕조 정보 표시",
                "ar": "عرض معلومات السلالة"
            },
            "description": {
                "en": "Include dynasty and regnal year in the display",
                "de": "Dynastie und Regierungsjahr in der Anzeige einbeziehen",
                "es": "Incluir dinastía y año de reinado en la pantalla",
                "fr": "Inclure la dynastie et l'année de règne dans l'affichage",
                "ar": "تضمين السلالة وسنة الحكم في العرض"
            }
        },
        "show_nile_status": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Nile Status",
                "de": "Nil-Status anzeigen",
                "es": "Mostrar estado del Nilo",
                "fr": "Afficher l'état du Nil",
                "it": "Mostra stato del Nilo",
                "nl": "Toon Nijl status",
                "pt": "Mostrar status do Nilo",
                "ru": "Показывать статус Нила",
                "ja": "ナイル川の状態を表示",
                "zh": "显示尼罗河状态",
                "ko": "나일강 상태 표시",
                "ar": "عرض حالة النيل"
            },
            "description": {
                "en": "Display the seasonal Nile flood status (Inundation/Emergence/Harvest)",
                "de": "Saisonalen Nil-Flutstatus anzeigen (Überschwemmung/Aussaat/Ernte)",
                "es": "Mostrar el estado estacional de la inundación del Nilo",
                "fr": "Afficher l'état saisonnier de la crue du Nil",
                "ar": "عرض حالة فيضان النيل الموسمية (الفيضان/الإنبات/الحصاد)"
            }
        },
        "format": {
            "type": "select",
            "default": "full",
            "options": ["full", "medium", "short"],
            "label": {
                "en": "Display Format",
                "de": "Anzeigeformat",
                "es": "Formato de visualización",
                "fr": "Format d'affichage",
                "it": "Formato di visualizzazione",
                "nl": "Weergaveformaat",
                "pt": "Formato de exibição",
                "ru": "Формат отображения",
                "ja": "表示形式",
                "zh": "显示格式",
                "ko": "표시 형식",
                "ar": "تنسيق العرض"
            },
            "description": {
                "en": "Choose how detailed the calendar display should be",
                "de": "Wählen Sie, wie detailliert die Kalenderanzeige sein soll",
                "es": "Elija qué tan detallada debe ser la visualización del calendario",
                "fr": "Choisissez le niveau de détail de l'affichage du calendrier",
                "ar": "اختر مدى تفصيل عرض التقويم"
            }
        },
        "dynasty_offset": {
            "type": "number",
            "default": 0,
            "min": -30,
            "max": 30,
            "label": {
                "en": "Dynasty Offset",
                "de": "Dynastie-Versatz",
                "es": "Desplazamiento de dinastía",
                "fr": "Décalage de dynastie",
                "it": "Offset dinastia",
                "nl": "Dynastie verschuiving",
                "pt": "Deslocamento de dinastia",
                "ru": "Смещение династии",
                "ja": "王朝オフセット",
                "zh": "王朝偏移",
                "ko": "왕조 오프셋",
                "ar": "إزاحة السلالة"
            },
            "description": {
                "en": "Adjust the simulated dynasty number (for role-playing or historical scenarios)",
                "de": "Simulierte Dynastienummer anpassen (für Rollenspiele oder historische Szenarien)",
                "es": "Ajustar el número de dinastía simulado (para juegos de rol o escenarios históricos)",
                "fr": "Ajuster le numéro de dynastie simulé (pour jeux de rôle ou scénarios historiques)",
                "ar": "ضبط رقم السلالة المحاكاة (للعب الأدوار أو السيناريوهات التاريخية)"
            }
        }
    }
}


class EgyptianCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Ancient Egyptian Calendar."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Egyptian calendar sensor."""
        super().__init__(base_name, hass)
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Egyptian Calendar')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_egyptian"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:pyramid")
        
        # Default configuration options
        self._show_hieroglyphs = True
        self._show_dynasty = True
        self._show_nile_status = True
        self._format = "full"
        self._dynasty_offset = 0
        
        # Egyptian data
        self._egyptian_data = CALENDAR_INFO["egyptian_data"]
        
        # Track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized Egyptian Calendar sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load configuration options from config entry."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._show_hieroglyphs = options.get("show_hieroglyphs", self._show_hieroglyphs)
                self._show_dynasty = options.get("show_dynasty", self._show_dynasty)
                self._show_nile_status = options.get("show_nile_status", self._show_nile_status)
                self._format = options.get("format", self._format)
                self._dynasty_offset = options.get("dynasty_offset", self._dynasty_offset)
                
                _LOGGER.debug(f"Egyptian sensor loaded options: hieroglyphs={self._show_hieroglyphs}, "
                            f"dynasty={self._show_dynasty}, nile={self._show_nile_status}, "
                            f"format={self._format}, dynasty_offset={self._dynasty_offset}")
            else:
                _LOGGER.debug("Egyptian sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"Egyptian sensor could not load options yet: {e}")
    
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
        
        # Add Egyptian-specific attributes
        if hasattr(self, '_egyptian_date'):
            attrs.update(self._egyptian_date)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add configuration status
            attrs["config"] = {
                "show_hieroglyphs": self._show_hieroglyphs,
                "show_dynasty": self._show_dynasty,
                "show_nile_status": self._show_nile_status,
                "format": self._format,
                "dynasty_offset": self._dynasty_offset
            }
        
        return attrs
    
    def _get_hieroglyphic_number(self, num: int) -> str:
        """Convert number to hieroglyphic representation."""
        if not self._show_hieroglyphs:
            return str(num)
        
        hieroglyphs = self._egyptian_data["hieroglyphs"]
        result = ""
        
        if num <= 9:
            result = hieroglyphs.get(num, str(num))
        elif num <= 19:
            result = hieroglyphs[10] + hieroglyphs.get(num - 10, "")
        elif num <= 29:
            result = hieroglyphs[20] + hieroglyphs.get(num - 20, "")
        else:
            result = hieroglyphs[30]
        
        return result
    
    def _calculate_egyptian_date(self, earth_date: datetime) -> Dict[str, Any]:
        """Calculate Ancient Egyptian Calendar date from standard date."""
        
        # Load options if not loaded yet
        self._load_options()
        
        # Egyptian new year around July 19 (Sirius rising)
        new_year_data = self._egyptian_data["new_year"]
        egyptian_new_year = datetime(earth_date.year, new_year_data["month"], new_year_data["day"])
        if earth_date < egyptian_new_year:
            egyptian_new_year = datetime(earth_date.year - 1, new_year_data["month"], new_year_data["day"])
        
        days_since_new_year = (earth_date - egyptian_new_year).days
        
        # Simulate dynasty and regnal year with offset
        dynasty = (earth_date.year - 2000) // 30 + 1 + self._dynasty_offset
        regnal_year = ((earth_date.year - 2000) % 30) + 1
        
        # Check for epagomenal days (last 5 days of year)
        if days_since_new_year >= 360:
            epagomenal_day = days_since_new_year - 359
            if epagomenal_day <= 5 and epagomenal_day > 0:
                god_birthday = self._egyptian_data["epagomenal_gods"][epagomenal_day - 1]
                
                # Format based on display setting
                if self._format == "short":
                    full_date = f"Epagomenal {epagomenal_day} - {god_birthday}"
                elif self._format == "medium":
                    full_date = f"Year {regnal_year} | Epagomenal Day {epagomenal_day} - {god_birthday}"
                else:  # full
                    full_date = f"Dynasty {dynasty}, Year {regnal_year} | Epagomenal Day {epagomenal_day} - Birthday of {god_birthday} 🎉"
                
                result = {
                    "epagomenal": True,
                    "epagomenal_day": epagomenal_day,
                    "epagomenal_god": god_birthday,
                    "dynasty": dynasty,
                    "regnal_year": regnal_year,
                    "gregorian_date": earth_date.strftime("%Y-%m-%d"),
                    "full_date": full_date
                }
                return result
            
            days_since_new_year = days_since_new_year % 365
        
        # Calculate month and day
        month_index = min(days_since_new_year // 30, 11)
        day_of_month = (days_since_new_year % 30) + 1
        
        month_data = self._egyptian_data["months"][month_index]
        
        # Calculate decan (10-day week)
        decan_index = min((day_of_month - 1) // 10, 2)
        decan_data = self._egyptian_data["decans"][decan_index]
        day_in_decan = ((day_of_month - 1) % 10) + 1
        
        # Get hieroglyphic day
        hieroglyph_day = self._get_hieroglyphic_number(day_of_month)
        
        # Determine Egyptian hour
        hour = earth_date.hour
        is_night = hour < 6 or hour >= 18
        
        if is_night:
            if hour >= 18:
                egyptian_hour_index = hour - 18
            else:
                egyptian_hour_index = hour + 6
            egyptian_hour = self._egyptian_data["night_hours"][min(egyptian_hour_index, 11)]
            time_symbol = "🌙"
            time_period = "Night"
        else:
            egyptian_hour_index = hour - 6
            egyptian_hour = self._egyptian_data["day_hours"][min(egyptian_hour_index, 11)]
            time_symbol = "☀️"
            time_period = "Day"
        
        # Get Nile status
        nile_data = self._egyptian_data["nile_status"][month_data["season"]]
        
        # Format the date based on format setting
        date_parts = []
        
        if self._format == "short":
            # Short format: just day and month
            date_parts.append(f"{day_of_month} {month_data['name']}")
            if self._show_nile_status:
                date_parts.append(f"{nile_data['emoji']}")
        elif self._format == "medium":
            # Medium format: month, day, season
            if self._show_dynasty:
                date_parts.append(f"Year {regnal_year}")
            date_parts.append(f"{hieroglyph_day if self._show_hieroglyphs else day_of_month} {month_data['name']}")
            date_parts.append(f"({month_data['season']})")
            if self._show_nile_status:
                date_parts.append(f"{nile_data['emoji']}")
        else:  # full
            # Full format: all details
            if self._show_dynasty:
                date_parts.append(f"Dynasty {dynasty} Year {regnal_year}")
            
            date_parts.append(f"{hieroglyph_day if self._show_hieroglyphs else ''} {day_of_month} {month_data['name']} ({month_data['season']})")
            date_parts.append(f"{decan_data['name']} Day {day_in_decan}")
            date_parts.append(f"{time_symbol} {egyptian_hour}")
            date_parts.append(month_data['god'])
            
            if self._show_nile_status:
                date_parts.append(f"{nile_data['emoji']} {nile_data['status']}")
        
        full_date = " | ".join(date_parts)
        
        result = {
            "dynasty": dynasty,
            "regnal_year": regnal_year,
            "month": month_data["name"],
            "month_index": month_index + 1,
            "day": day_of_month,
            "day_hieroglyph": hieroglyph_day,
            "season": month_data["season"],
            "season_emoji": month_data["season_emoji"],
            "decan": decan_data["name"],
            "decan_symbol": decan_data["symbol"],
            "decan_day": day_in_decan,
            "patron_god": month_data["god"],
            "egyptian_hour": egyptian_hour,
            "time_period": time_period,
            "time_symbol": time_symbol,
            "nile_status": nile_data["status"],
            "nile_emoji": nile_data["emoji"],
            "gregorian_date": earth_date.strftime("%Y-%m-%d"),
            "epagomenal": False,
            "full_date": full_date
        }
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        now = datetime.now()
        self._egyptian_date = self._calculate_egyptian_date(now)
        
        # Set state to full Egyptian date
        self._state = self._egyptian_date["full_date"]
        
        _LOGGER.debug(f"Updated Egyptian Calendar to {self._state}")