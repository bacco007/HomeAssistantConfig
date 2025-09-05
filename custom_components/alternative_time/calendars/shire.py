"""Shire Calendar (Hobbit/LOTR) implementation - Version 3.0."""
from __future__ import annotations

from datetime import datetime
import logging
from typing import Dict, Any, Optional

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
    "id": "shire",
    "version": "3.0.0",
    "icon": "mdi:pipe",
    "category": "fantasy",
    "accuracy": "fictional",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Shire Calendar (LOTR)",
        "de": "Auenland-Kalender (HdR)",
        "es": "Calendario de la Comarca (ESDLA)",
        "fr": "Calendrier de la Comté (SdA)",
        "it": "Calendario della Contea (SdA)",
        "nl": "Gouw Kalender (LOTR)",
        "pl": "Kalendarz Shire (WP)",
        "pt": "Calendário do Condado (SdA)",
        "ru": "Календарь Шира (ВК)",
        "ja": "ホビット庄暦",
        "zh": "夏尔历",
        "ko": "샤이어 달력"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Hobbit calendar from Lord of the Rings with seven meals and special days",
        "de": "Hobbit-Kalender aus Herr der Ringe mit sieben Mahlzeiten und besonderen Tagen",
        "es": "Calendario hobbit de El Señor de los Anillos con siete comidas y días especiales",
        "fr": "Calendrier hobbit du Seigneur des Anneaux avec sept repas et jours spéciaux",
        "it": "Calendario hobbit del Signore degli Anelli con sette pasti e giorni speciali",
        "nl": "Hobbit kalender uit Lord of the Rings met zeven maaltijden en speciale dagen",
        "pl": "Kalendarz hobbitów z Władcy Pierścieni z siedmioma posiłkami i specjalnymi dniami",
        "pt": "Calendário hobbit do Senhor dos Anéis com sete refeições e dias especiais",
        "ru": "Календарь хоббитов из Властелина Колец с семью приемами пищи и особыми днями",
        "ja": "7つの食事と特別な日を含むロード・オブ・ザ・リングのホビット暦",
        "zh": "指环王霍比特人日历，包含七餐和特殊节日",
        "ko": "반지의 제왕 호빗 달력 (일곱 끼니와 특별한 날 포함)"
    },
    
    # Detailed information for documentation
    "detailed_info": {
        "en": {
            "overview": "The Shire Calendar is used by Hobbits in Middle-earth",
            "structure": "12 months of 30 days each, plus special days (Yule and Lithe)",
            "year_start": "Year begins at 2 Yule (around December 21)",
            "weeks": "7-day weeks from Sterday to Highday",
            "reckoning": "Shire Reckoning (S.R.) counts from colonization of the Shire",
            "meals": "Seven daily meals: First Breakfast, Second Breakfast, Elevenses, Luncheon, Afternoon Tea, Dinner, Supper",
            "special": "Bilbo and Frodo's birthday on September 22",
            "note": "LOTR ends in T.A. 3021 = S.R. 1421"
        },
        "de": {
            "overview": "Der Auenland-Kalender wird von Hobbits in Mittelerde verwendet",
            "structure": "12 Monate mit je 30 Tagen, plus Sondertage (Jul und Lithe)",
            "year_start": "Jahr beginnt am 2. Jul (um den 21. Dezember)",
            "weeks": "7-Tage-Wochen von Sterntag bis Hochtag",
            "reckoning": "Auenland-Zeitrechnung (A.Z.) zählt seit Besiedlung des Auenlandes",
            "meals": "Sieben tägliche Mahlzeiten: Erstes Frühstück, Zweites Frühstück, Elfuhrtee, Mittagessen, Nachmittagstee, Abendessen, Nachtmahl",
            "special": "Bilbos und Frodos Geburtstag am 22. September",
            "note": "HdR endet in D.Z. 3021 = A.Z. 1421"
        }
    },
    
    # Configuration options
    "config_options": {
        "show_meals": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Hobbit Meals",
                "de": "Hobbit-Mahlzeiten anzeigen",
                "es": "Mostrar comidas hobbit",
                "fr": "Afficher les repas hobbits",
                "it": "Mostra pasti hobbit",
                "nl": "Toon hobbit maaltijden",
                "pl": "Pokaż posiłki hobbitów",
                "pt": "Mostrar refeições hobbit",
                "ru": "Показать трапезы хоббитов",
                "ja": "ホビットの食事を表示",
                "zh": "显示霍比特人餐食",
                "ko": "호빗 식사 표시"
            },
            "description": {
                "en": "Display current Hobbit meal time (7 meals per day)",
                "de": "Aktuelle Hobbit-Mahlzeit anzeigen (7 Mahlzeiten pro Tag)",
                "es": "Mostrar la hora de comida hobbit actual (7 comidas al día)",
                "fr": "Afficher l'heure du repas hobbit actuel (7 repas par jour)",
                "it": "Mostra l'ora del pasto hobbit attuale (7 pasti al giorno)",
                "nl": "Toon huidige hobbit maaltijd (7 maaltijden per dag)",
                "pl": "Pokaż aktualny posiłek hobbitów (7 posiłków dziennie)",
                "pt": "Mostrar hora da refeição hobbit atual (7 refeições por dia)",
                "ru": "Показать текущее время трапезы хоббитов (7 раз в день)",
                "ja": "現在のホビットの食事時間を表示（1日7回）",
                "zh": "显示当前霍比特人用餐时间（每天7餐）",
                "ko": "현재 호빗 식사 시간 표시 (하루 7끼)"
            }
        },
        "show_moon": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Moon Phase",
                "de": "Mondphase anzeigen",
                "es": "Mostrar fase lunar",
                "fr": "Afficher la phase lunaire",
                "it": "Mostra fase lunare",
                "nl": "Toon maanfase",
                "pl": "Pokaż fazę księżyca",
                "pt": "Mostrar fase da lua",
                "ru": "Показать фазу луны",
                "ja": "月相を表示",
                "zh": "显示月相",
                "ko": "달의 위상 표시"
            },
            "description": {
                "en": "Display current moon phase in Middle-earth style",
                "de": "Aktuelle Mondphase im Mittelerde-Stil anzeigen",
                "es": "Mostrar la fase lunar actual al estilo de la Tierra Media",
                "fr": "Afficher la phase lunaire actuelle dans le style de la Terre du Milieu",
                "it": "Mostra la fase lunare attuale in stile Terra di Mezzo",
                "nl": "Toon huidige maanfase in Midden-aarde stijl",
                "pl": "Pokaż aktualną fazę księżyca w stylu Śródziemia",
                "pt": "Mostrar fase lunar atual no estilo da Terra-média",
                "ru": "Показать текущую фазу луны в стиле Средиземья",
                "ja": "中つ国スタイルで現在の月相を表示",
                "zh": "以中土世界风格显示当前月相",
                "ko": "중간계 스타일로 현재 달의 위상 표시"
            }
        },
        "show_name_day": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Name Days",
                "de": "Namenstage anzeigen",
                "es": "Mostrar días del nombre",
                "fr": "Afficher les jours de nom",
                "it": "Mostra giorni del nome",
                "nl": "Toon naamdagen",
                "pl": "Pokaż imieniny",
                "pt": "Mostrar dias do nome",
                "ru": "Показать именины",
                "ja": "名前の日を表示",
                "zh": "显示姓名日",
                "ko": "이름의 날 표시"
            },
            "description": {
                "en": "Display Hobbit family name days (Baggins, Took, etc.)",
                "de": "Hobbit-Familiennamentage anzeigen (Beutlin, Tuk, etc.)",
                "es": "Mostrar días de nombres de familias hobbit (Bolsón, Tuk, etc.)",
                "fr": "Afficher les jours de noms de familles hobbits (Sacquet, Touque, etc.)",
                "it": "Mostra giorni dei nomi delle famiglie hobbit (Baggins, Took, etc.)",
                "nl": "Toon hobbit familie naamdagen (Balings, Toek, etc.)",
                "pl": "Pokaż dni imion rodzin hobbitów (Baggins, Took, itp.)",
                "pt": "Mostrar dias de nomes de famílias hobbit (Baggins, Took, etc.)",
                "ru": "Показать дни имен хоббитских семей (Бэггинс, Тук и т.д.)",
                "ja": "ホビット家の名前の日を表示（バギンズ、トゥックなど）",
                "zh": "显示霍比特家族姓名日（巴金斯、图克等）",
                "ko": "호빗 가문 이름의 날 표시 (배긴스, 툭 등)"
            }
        },
        "display_format": {
            "type": "select",
            "default": "full",
            "options": ["full", "short", "detailed"],
            "label": {
                "en": "Display Format",
                "de": "Anzeigeformat",
                "es": "Formato de visualización",
                "fr": "Format d'affichage",
                "it": "Formato di visualizzazione",
                "nl": "Weergaveformaat",
                "pl": "Format wyświetlania",
                "pt": "Formato de exibição",
                "ru": "Формат отображения",
                "ja": "表示形式",
                "zh": "显示格式",
                "ko": "표시 형식"
            },
            "description": {
                "en": "Choose how the date is displayed",
                "de": "Wählen Sie, wie das Datum angezeigt wird",
                "es": "Elija cómo se muestra la fecha",
                "fr": "Choisissez comment la date est affichée",
                "it": "Scegli come viene visualizzata la data",
                "nl": "Kies hoe de datum wordt weergegeven",
                "pl": "Wybierz sposób wyświetlania daty",
                "pt": "Escolha como a data é exibida",
                "ru": "Выберите формат отображения даты",
                "ja": "日付の表示方法を選択",
                "zh": "选择日期显示方式",
                "ko": "날짜 표시 방법 선택"
            },
            "options_label": {
                "full": {
                    "en": "Full (S.R. 1624, Afteryule 16)",
                    "de": "Vollständig (A.Z. 1624, Nachjul 16)",
                    "es": "Completo (C.C. 1624, Postyule 16)",
                    "fr": "Complet (C.C. 1624, Après-Yule 16)",
                    "it": "Completo (C.C. 1624, Doponatale 16)",
                    "nl": "Volledig (G.R. 1624, Najoel 16)",
                    "pl": "Pełny (L.S. 1624, Postrzędny 16)",
                    "pt": "Completo (C.C. 1624, Pós-Yule 16)",
                    "ru": "Полный (Л.Ш. 1624, Послейул 16)",
                    "ja": "完全 (S.R. 1624, アフターユール 16)",
                    "zh": "完整 (夏尔历 1624, 冬后月 16)",
                    "ko": "전체 (S.R. 1624, 애프터율 16)"
                },
                "short": {
                    "en": "Short (16 Afteryule 1624)",
                    "de": "Kurz (16 Nachjul 1624)",
                    "es": "Corto (16 Postyule 1624)",
                    "fr": "Court (16 Après-Yule 1624)",
                    "it": "Breve (16 Doponatale 1624)",
                    "nl": "Kort (16 Najoel 1624)",
                    "pl": "Krótki (16 Postrzędny 1624)",
                    "pt": "Curto (16 Pós-Yule 1624)",
                    "ru": "Короткий (16 Послейул 1624)",
                    "ja": "短縮 (16 アフターユール 1624)",
                    "zh": "简短 (冬后月16日 1624)",
                    "ko": "짧게 (16 애프터율 1624)"
                },
                "detailed": {
                    "en": "Detailed (with weekday and season)",
                    "de": "Detailliert (mit Wochentag und Jahreszeit)",
                    "es": "Detallado (con día y estación)",
                    "fr": "Détaillé (avec jour et saison)",
                    "it": "Dettagliato (con giorno e stagione)",
                    "nl": "Gedetailleerd (met weekdag en seizoen)",
                    "pl": "Szczegółowy (z dniem tygodnia i porą roku)",
                    "pt": "Detalhado (com dia da semana e estação)",
                    "ru": "Подробный (с днем недели и сезоном)",
                    "ja": "詳細（曜日と季節付き）",
                    "zh": "详细（包含星期和季节）",
                    "ko": "상세 (요일과 계절 포함)"
                }
            }
        }
    },
    
    # Shire-specific data
    "shire_data": {
        # Shire months
        "months": [
            {"name": "Afteryule", "days": 30, "season": "Winter"},
            {"name": "Solmath", "days": 30, "season": "Winter"},
            {"name": "Rethe", "days": 30, "season": "Spring"},
            {"name": "Astron", "days": 30, "season": "Spring"},
            {"name": "Thrimidge", "days": 30, "season": "Spring"},
            {"name": "Forelithe", "days": 30, "season": "Summer"},
            {"name": "Afterlithe", "days": 30, "season": "Summer"},
            {"name": "Wedmath", "days": 30, "season": "Summer"},
            {"name": "Halimath", "days": 30, "season": "Harvest"},
            {"name": "Winterfilth", "days": 30, "season": "Harvest"},
            {"name": "Blotmath", "days": 30, "season": "Harvest"},
            {"name": "Foreyule", "days": 30, "season": "Winter"}
        ],
        
        # Shire weekdays
        "weekdays": [
            "Sterday",    # Saturday (Stars)
            "Sunday",     # Sunday (Sun)
            "Monday",     # Monday (Moon)
            "Trewsday",   # Tuesday (Trees)
            "Hevensday",  # Wednesday (Heavens)
            "Mersday",    # Thursday (Sea)
            "Highday"     # Friday (High day)
        ],
        
        # Special days
        "special_days": {
            (1, 1): "🎊 2 Yule - New Year's Day",
            (3, 25): "🌸 Elven New Year",
            (6, 21): "☀️ 1 Lithe - Midsummer's Eve",
            (6, 22): "🎉 Mid-year's Day",
            (6, 23): "🎊 Overlithe (leap years only)",
            (6, 24): "☀️ 2 Lithe",
            (9, 22): "🎂 Bilbo & Frodo's Birthday!",
            (12, 21): "❄️ 1 Yule - Midwinter"
        },
        
        # Hobbit meals
        "meals": {
            (6, 8): {"name": "First Breakfast", "emoji": "🍳"},
            (8, 9): {"name": "Second Breakfast", "emoji": "🥐"},
            (11, 12): {"name": "Elevenses", "emoji": "☕"},
            (12, 14): {"name": "Luncheon", "emoji": "🍽️"},
            (15, 16): {"name": "Afternoon Tea", "emoji": "🫖"},
            (18, 20): {"name": "Dinner", "emoji": "🍖"},
            (20, 22): {"name": "Supper", "emoji": "🍷"}
        },
        
        # Time periods
        "time_periods": {
            (5, 7): "Dawn - The Shire awakens",
            (7, 12): "Morning - Time for adventures",
            (12, 17): "Afternoon - Pleasant walking weather",
            (17, 20): "Evening - Smoke rings and tales",
            (20, 23): "Night - Stars are out",
            (23, 5): "Late Night - All respectable hobbits abed"
        },
        
        # Hobbit family names for name days
        "name_days": {
            1: "Baggins", 5: "Took", 10: "Brandybuck",
            15: "Gamgee", 20: "Cotton", 25: "Proudfoot", 30: "Bracegirdle"
        },
        
        # Shire Reckoning base year
        "sr_base": 1600,  # Year 2000 = S.R. 1600 for our conversion
        "earth_base": 2000
    },
    
    # Additional metadata
    "reference_url": "https://tolkiengateway.net/wiki/Shire_Calendar",
    "documentation_url": "http://shire-reckoning.com/calendar.html",
    "origin": "J.R.R. Tolkien's Middle-earth",
    "created_by": "J.R.R. Tolkien",
    "introduced": "The Hobbit (1937) / The Lord of the Rings (1954-1955)",
    
    # Example format
    "example": "S.R. 1624, Afteryule 16 (Trewsday)",
    "example_meaning": "Shire Reckoning year 1624, 16th of Afteryule, Trewsday",
    
    # Related calendars
    "related": ["rivendell", "gregorian"],
    
    # Tags for searching and filtering
    "tags": [
        "fantasy", "tolkien", "hobbit", "lotr", "shire",
        "middle_earth", "bilbo", "frodo", "gandalf", "seven_meals"
    ],
    
    # Special features
    "features": {
        "seven_meals": True,
        "special_days": True,
        "moon_phases": True,
        "hobbit_customs": True,
        "precision": "day"
    }
}


class ShireCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Shire Calendar from Middle-earth."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Shire calendar sensor."""
        super().__init__(base_name, hass)
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Shire Calendar')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_shire_calendar"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:pipe")
        
        # Configuration options with defaults
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._show_meals = config_defaults.get("show_meals", {}).get("default", True)
        self._show_moon = config_defaults.get("show_moon", {}).get("default", True)
        self._show_name_day = config_defaults.get("show_name_day", {}).get("default", True)
        self._display_format = config_defaults.get("display_format", {}).get("default", "full")
        
        # Shire data
        self._shire_data = CALENDAR_INFO["shire_data"]
        
        # Initialize state
        self._state = None
        self._shire_date = {}
        
        _LOGGER.debug(f"Initialized Shire Calendar sensor: {self._attr_name}")
    
    def set_options(self, options: Dict[str, Any]) -> None:
        """Set options from config flow."""
        if options:
            self._show_meals = options.get("show_meals", self._show_meals)
            self._show_moon = options.get("show_moon", self._show_moon)
            self._show_name_day = options.get("show_name_day", self._show_name_day)
            self._display_format = options.get("display_format", self._display_format)
            
            _LOGGER.debug(f"Shire sensor options updated: show_meals={self._show_meals}, "
                         f"show_moon={self._show_moon}, show_name_day={self._show_name_day}, "
                         f"display_format={self._display_format}")
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        # Add Shire-specific attributes
        if self._shire_date:
            attrs.update(self._shire_date)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add configuration status
            attrs["config"] = {
                "show_meals": self._show_meals,
                "show_moon": self._show_moon,
                "show_name_day": self._show_name_day,
                "display_format": self._display_format
            }
        
        return attrs
    
    def _get_meal_time(self, hour: int) -> Dict[str, str]:
        """Get current Hobbit meal time."""
        for (start, end), meal in self._shire_data["meals"].items():
            if start <= hour < end:
                return meal
        return {"name": "Resting Time", "emoji": "🌙"}
    
    def _get_time_period(self, hour: int) -> str:
        """Get time of day description."""
        for (start, end), period in self._shire_data["time_periods"].items():
            if start <= hour or (start > end and hour < end):
                return period
        return "Time for adventures"
    
    def _get_moon_phase(self, day: int) -> str:
        """Calculate simplified moon phase."""
        day_in_lunar = day % 29.5
        if day_in_lunar < 2:
            return "🌑 New Moon"
        elif day_in_lunar < 7:
            return "🌒 Waxing Crescent"
        elif day_in_lunar < 9:
            return "🌓 First Quarter"
        elif day_in_lunar < 14:
            return "🌔 Waxing Gibbous"
        elif day_in_lunar < 16:
            return "🌕 Full Moon"
        elif day_in_lunar < 21:
            return "🌖 Waning Gibbous"
        elif day_in_lunar < 23:
            return "🌗 Last Quarter"
        else:
            return "🌘 Waning Crescent"
    
    def _format_date(self, shire_date: Dict[str, Any]) -> str:
        """Format the date according to display_format setting."""
        year = shire_date["year"]
        month = shire_date["month"]
        day = shire_date["day"]
        weekday = shire_date["weekday"]
        season = shire_date["season"]
        
        if self._display_format == "short":
            return f"{day} {month} {year}"
        elif self._display_format == "detailed":
            return f"S.R. {year}, {month} {day} ({weekday}) - {season}"
        else:  # full (default)
            return f"S.R. {year}, {month} {day}"
    
    def _calculate_shire_date(self, earth_date: datetime) -> Dict[str, Any]:
        """Calculate Shire Reckoning date from Earth date."""
        # Calculate Shire year
        years_since_base = earth_date.year - self._shire_data["earth_base"]
        shire_year = self._shire_data["sr_base"] + years_since_base
        
        # Map Earth months to Shire months (simplified)
        month_index = min(earth_date.month - 1, 11)
        month_data = self._shire_data["months"][month_index]
        
        # Shire day (1-30 for regular days)
        shire_day = min(earth_date.day, 30)
        
        # Weekday (shift to make Sterday = Saturday)
        weekday_index = (earth_date.weekday() + 2) % 7
        shire_weekday = self._shire_data["weekdays"][weekday_index]
        
        # Check for special days
        special_day = self._shire_data["special_days"].get((earth_date.month, earth_date.day), "")
        
        # Meal time
        meal_data = self._get_meal_time(earth_date.hour) if self._show_meals else {}
        
        # Time period
        time_of_day = self._get_time_period(earth_date.hour)
        
        # Moon phase
        moon_phase = self._get_moon_phase(earth_date.day) if self._show_moon else ""
        
        # Hobbit name day
        name_day = self._shire_data["name_days"].get(shire_day, "") if self._show_name_day else ""
        
        result = {
            "year": shire_year,
            "month": month_data["name"],
            "day": shire_day,
            "weekday": shire_weekday,
            "season": month_data["season"],
            "time_of_day": time_of_day,
            "gregorian_date": earth_date.strftime("%Y-%m-%d"),
            "full_date": f"S.R. {shire_year}, {month_data['name']} {shire_day}"
        }
        
        if special_day:
            result["special_day"] = special_day
        
        if meal_data:
            result["meal_time"] = f"{meal_data['emoji']} {meal_data['name']}"
        
        if moon_phase:
            result["moon_phase"] = moon_phase
        
        if name_day:
            result["hobbit_name_day"] = f"Name day of {name_day}"
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        now = datetime.now()
        self._shire_date = self._calculate_shire_date(now)
        
        # Set state to formatted Shire date
        self._state = self._format_date(self._shire_date)
        
        _LOGGER.debug(f"Updated Shire Calendar to {self._state}")