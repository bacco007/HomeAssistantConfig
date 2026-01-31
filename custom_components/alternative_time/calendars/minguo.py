"""Minguo Calendar (Republic of China/Taiwan) implementation - Version 2.5."""
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
    "id": "minguo_taiwan",
    "version": "2.5.0",
    "icon": "mdi:calendar-text",
    "category": "cultural",
    "accuracy": "official",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names (English primary)
    "name": {
        "en": "Minguo Calendar (Taiwan)",
        "de": "Minguo-Kalender (Taiwan)",
        "es": "Calendario Minguo (Taiwán)",
        "fr": "Calendrier Minguo (Taïwan)",
        "it": "Calendario Minguo (Taiwan)",
        "nl": "Minguo Kalender (Taiwan)",
        "pt": "Calendário Minguo (Taiwan)",
        "ru": "Календарь Миньго (Тайвань)",
        "ja": "民国紀元（台湾）",
        "zh": "民國紀年",
        "zh-tw": "中華民國曆",
        "ko": "민국 달력 (대만)"
    },
    
    # Short descriptions for UI (English primary)
    "description": {
        "en": "Taiwan/ROC calendar, Year 1 = 1912 CE (founding of Republic of China)",
        "de": "Taiwan/ROC Kalender, Jahr 1 = 1912 n.Chr. (Gründung der Republik China)",
        "es": "Calendario de Taiwán/ROC, Año 1 = 1912 EC (fundación de la República de China)",
        "fr": "Calendrier de Taïwan/ROC, Année 1 = 1912 EC (fondation de la République de Chine)",
        "it": "Calendario Taiwan/ROC, Anno 1 = 1912 EC (fondazione della Repubblica di Cina)",
        "nl": "Taiwan/ROC kalender, Jaar 1 = 1912 CE (stichting Republiek China)",
        "pt": "Calendário de Taiwan/ROC, Ano 1 = 1912 EC (fundação da República da China)",
        "ru": "Календарь Тайвань/КР, Год 1 = 1912 н.э. (основание Китайской Республики)",
        "ja": "台湾/中華民国暦、元年 = 西暦1912年（中華民国建国）",
        "zh": "台湾/中华民国历法，元年 = 公元1912年（中华民国成立）",
        "zh-tw": "中華民國曆法，民國元年 = 西元1912年（中華民國成立）",
        "ko": "대만/중화민국 달력, 1년 = 서기 1912년 (중화민국 건국)"
    },
    
    # Detailed information for documentation
    "detailed_info": {
        "en": {
            "overview": "The Minguo calendar is the official calendar used in Taiwan (Republic of China)",
            "epoch": "Year 1 corresponds to 1912 CE, the founding year of the Republic of China",
            "structure": "Uses the same months and days as the Gregorian calendar, only the year numbering differs",
            "usage": "Official documents, government records, and daily life in Taiwan",
            "conversion": "Minguo year = Gregorian year - 1911",
            "before_epoch": "Years before 1912 are denoted as 民前 (before the Republic)",
            "holidays": "Includes traditional Chinese festivals and ROC national holidays"
        },
        "de": {
            "overview": "Der Minguo-Kalender ist der offizielle Kalender in Taiwan (Republik China)",
            "epoch": "Jahr 1 entspricht 1912 n.Chr., dem Gründungsjahr der Republik China",
            "structure": "Verwendet die gleichen Monate und Tage wie der gregorianische Kalender, nur die Jahreszählung unterscheidet sich",
            "usage": "Offizielle Dokumente, Regierungsunterlagen und tägliches Leben in Taiwan",
            "conversion": "Minguo-Jahr = Gregorianisches Jahr - 1911",
            "before_epoch": "Jahre vor 1912 werden als 民前 (vor der Republik) bezeichnet",
            "holidays": "Umfasst traditionelle chinesische Feste und ROC-Nationalfeiertage"
        },
        "zh-tw": {
            "overview": "民國紀年是中華民國（臺灣）的官方曆法",
            "epoch": "民國元年對應西元1912年，即中華民國成立之年",
            "structure": "使用與公曆相同的月份和日期，僅年份編號不同",
            "usage": "用於官方文件、政府記錄和臺灣日常生活",
            "conversion": "民國年 = 西元年 - 1911",
            "before_epoch": "1912年之前的年份標記為民前",
            "holidays": "包含傳統中國節日和中華民國國定假日"
        }
    },
    
    # Minguo-specific data
    "minguo_data": {
        # Chinese months (traditional names)
        "months": [
            {"chinese": "一月", "formal": "正月", "english": "January"},
            {"chinese": "二月", "formal": "二月", "english": "February"},
            {"chinese": "三月", "formal": "三月", "english": "March"},
            {"chinese": "四月", "formal": "四月", "english": "April"},
            {"chinese": "五月", "formal": "五月", "english": "May"},
            {"chinese": "六月", "formal": "六月", "english": "June"},
            {"chinese": "七月", "formal": "七月", "english": "July"},
            {"chinese": "八月", "formal": "八月", "english": "August"},
            {"chinese": "九月", "formal": "九月", "english": "September"},
            {"chinese": "十月", "formal": "十月", "english": "October"},
            {"chinese": "十一月", "formal": "十一月", "english": "November"},
            {"chinese": "十二月", "formal": "十二月", "english": "December"}
        ],
        
        # Chinese weekdays
        "weekdays": [
            {"chinese": "星期日", "short": "日", "english": "Sunday"},
            {"chinese": "星期一", "short": "一", "english": "Monday"},
            {"chinese": "星期二", "short": "二", "english": "Tuesday"},
            {"chinese": "星期三", "short": "三", "english": "Wednesday"},
            {"chinese": "星期四", "short": "四", "english": "Thursday"},
            {"chinese": "星期五", "short": "五", "english": "Friday"},
            {"chinese": "星期六", "short": "六", "english": "Saturday"}
        ],
        
        # ROC National Holidays
        "holidays": {
            (1, 1): {"chinese": "元旦", "english": "New Year's Day"},
            (2, 28): {"chinese": "和平紀念日", "english": "Peace Memorial Day"},
            (3, 29): {"chinese": "青年節", "english": "Youth Day"},
            (4, 4): {"chinese": "兒童節", "english": "Children's Day"},
            (4, 5): {"chinese": "清明節", "english": "Tomb Sweeping Day"},
            (5, 1): {"chinese": "勞動節", "english": "Labor Day"},
            (10, 10): {"chinese": "國慶日", "english": "National Day (Double Ten)"},
            (10, 25): {"chinese": "光復節", "english": "Retrocession Day"},
            (11, 12): {"chinese": "國父誕辰", "english": "Sun Yat-sen's Birthday"},
            (12, 25): {"chinese": "行憲紀念日", "english": "Constitution Day"}
        },
        
        # Chinese number system
        "chinese_numbers": {
            0: "零", 1: "一", 2: "二", 3: "三", 4: "四",
            5: "五", 6: "六", 7: "七", 8: "八", 9: "九",
            10: "十", 100: "百", 1000: "千"
        },
        
        # Era information
        "era": {
            "chinese": "民國",
            "english": "Republic",
            "abbreviation": "ROC",
            "founding_year": 1912
        }
    },
    
    # Additional metadata
    "reference_url": "https://en.wikipedia.org/wiki/Minguo_calendar",
    "documentation_url": "https://www.taiwan.gov.tw",
    "origin": "Republic of China (Taiwan)",
    "created_by": "Republic of China government",
    "official_since": "1912 CE",
    
    # Example format
    "example": "Republic Year 114, December 25 | 民國114年12月25日",
    "example_meaning": "December 25, 2025 CE in Minguo calendar",
    
    # Related calendars
    "related": ["gregorian", "chinese", "lunar"],
    
    # Tags for searching and filtering
    "tags": [
        "cultural", "taiwan", "roc", "minguo", "chinese",
        "official", "asian", "republic", "formosa"
    ],
    
    # Special features
    "features": {
        "era_based": True,
        "chinese_characters": True,
        "dual_numbering": True,
        "precision": "day"
    },
    
    # Configuration options for this calendar
    "config_options": {
        "display_language": {
            "type": "select",
            "default": "english",
            "options": ["english", "chinese", "combined"],
            "label": {
                "en": "Display Language",
                "de": "Anzeigesprache",
                "es": "Idioma de visualización",
                "fr": "Langue d'affichage",
                "it": "Lingua di visualizzazione",
                "nl": "Weergavetaal",
                "pt": "Idioma de exibição",
                "ru": "Язык отображения",
                "ja": "表示言語",
                "zh": "显示语言",
                "zh-tw": "顯示語言",
                "ko": "표시 언어"
            },
            "description": {
                "en": "Choose how to display the date (English, Chinese characters, or combined)",
                "de": "Wählen Sie, wie das Datum angezeigt werden soll (Englisch, chinesische Zeichen oder kombiniert)",
                "zh-tw": "選擇日期顯示方式（英文、中文或混合）"
            }
        },
        "use_chinese_numbers": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Use Chinese Numbers",
                "de": "Chinesische Zahlen verwenden",
                "es": "Usar números chinos",
                "fr": "Utiliser les chiffres chinois",
                "it": "Usa numeri cinesi",
                "nl": "Gebruik Chinese cijfers",
                "pt": "Usar números chineses",
                "ru": "Использовать китайские цифры",
                "ja": "漢数字を使用",
                "zh": "使用中文数字",
                "zh-tw": "使用中文數字",
                "ko": "한자 숫자 사용"
            },
            "description": {
                "en": "Display numbers using Chinese characters (一二三)",
                "de": "Zahlen mit chinesischen Zeichen anzeigen (一二三)",
                "zh-tw": "使用中文數字顯示（一二三）"
            }
        },
        "show_holidays": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show ROC Holidays",
                "de": "ROC-Feiertage anzeigen",
                "es": "Mostrar días festivos de ROC",
                "fr": "Afficher les jours fériés ROC",
                "it": "Mostra festività ROC",
                "nl": "Toon ROC feestdagen",
                "pt": "Mostrar feriados ROC",
                "ru": "Показывать праздники КР",
                "ja": "中華民国の祝日を表示",
                "zh": "显示中华民国节日",
                "zh-tw": "顯示中華民國節日",
                "ko": "중화민국 공휴일 표시"
            },
            "description": {
                "en": "Display Republic of China national holidays",
                "de": "Nationalfeiertage der Republik China anzeigen",
                "zh-tw": "顯示中華民國國定假日"
            }
        },
        "format": {
            "type": "select",
            "default": "full",
            "options": ["full", "medium", "short", "formal"],
            "label": {
                "en": "Date Format",
                "de": "Datumsformat",
                "es": "Formato de fecha",
                "fr": "Format de date",
                "it": "Formato data",
                "nl": "Datumformaat",
                "pt": "Formato de data",
                "ru": "Формат даты",
                "ja": "日付形式",
                "zh": "日期格式",
                "zh-tw": "日期格式",
                "ko": "날짜 형식"
            },
            "description": {
                "en": "Choose how detailed the date display should be",
                "de": "Wählen Sie, wie detailliert die Datumsanzeige sein soll",
                "zh-tw": "選擇日期顯示的詳細程度"
            }
        },
        "show_before_epoch": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Pre-Republic Years",
                "de": "Vor-Republik-Jahre anzeigen",
                "es": "Mostrar años pre-República",
                "fr": "Afficher les années pré-République",
                "it": "Mostra anni pre-Repubblica",
                "nl": "Toon pre-Republiek jaren",
                "pt": "Mostrar anos pré-República",
                "ru": "Показывать годы до Республики",
                "ja": "民国前を表示",
                "zh": "显示民前年份",
                "zh-tw": "顯示民前年份",
                "ko": "민국 이전 연도 표시"
            },
            "description": {
                "en": "Display years before 1912 as 民前 (before the Republic)",
                "de": "Jahre vor 1912 als 民前 (vor der Republik) anzeigen",
                "zh-tw": "將1912年之前的年份顯示為民前"
            }
        }
    }
}


class MinguoCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Minguo Calendar (Taiwan/ROC)."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Minguo calendar sensor."""
        super().__init__(base_name, hass)
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Minguo Calendar (Taiwan)')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_minguo_taiwan"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:calendar-text")
        
        # Default configuration options
        self._display_language = "english"
        self._use_chinese_numbers = False
        self._show_holidays = True
        self._format = "full"
        self._show_before_epoch = False
        
        # Minguo data
        self._minguo_data = CALENDAR_INFO["minguo_data"]
        
        # Track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized Minguo Calendar sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load configuration options from config entry."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._display_language = options.get("display_language", self._display_language)
                self._use_chinese_numbers = options.get("use_chinese_numbers", self._use_chinese_numbers)
                self._show_holidays = options.get("show_holidays", self._show_holidays)
                self._format = options.get("format", self._format)
                self._show_before_epoch = options.get("show_before_epoch", self._show_before_epoch)
                
                _LOGGER.debug(f"Minguo calendar loaded options: language={self._display_language}, "
                            f"chinese_numbers={self._use_chinese_numbers}, holidays={self._show_holidays}, "
                            f"format={self._format}, before_epoch={self._show_before_epoch}")
            else:
                _LOGGER.debug("Minguo calendar using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"Minguo calendar could not load options yet: {e}")
    
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
        
        # Add Minguo-specific attributes
        if hasattr(self, '_minguo_date'):
            attrs.update(self._minguo_date)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add configuration status
            attrs["config"] = {
                "display_language": self._display_language,
                "use_chinese_numbers": self._use_chinese_numbers,
                "show_holidays": self._show_holidays,
                "format": self._format,
                "show_before_epoch": self._show_before_epoch
            }
        
        return attrs
    
    def _to_chinese_number(self, n: int) -> str:
        """Convert number to Chinese characters."""
        if not self._use_chinese_numbers:
            return str(n)
        
        chinese_nums = self._minguo_data["chinese_numbers"]
        
        if n == 0:
            return chinese_nums[0]
        
        result = ""
        
        # Handle thousands
        if n >= 1000:
            thousands = n // 1000
            if thousands > 1:
                result += self._to_chinese_number(thousands)
            result += chinese_nums[1000]
            n %= 1000
        
        # Handle hundreds
        if n >= 100:
            hundreds = n // 100
            if hundreds > 1:
                result += chinese_nums[hundreds]
            result += chinese_nums[100]
            n %= 100
        
        # Handle tens
        if n >= 10:
            tens = n // 10
            if tens > 1 or result:  # Add tens digit if > 1 or if we have higher places
                result += chinese_nums[tens]
            result += chinese_nums[10]
            n %= 10
        
        # Handle ones
        if n > 0:
            result += chinese_nums[n]
        
        return result
    
    def _calculate_minguo_date(self, earth_date: datetime) -> Dict[str, Any]:
        """Calculate Minguo Calendar date from standard date."""
        
        # Load options if not loaded yet
        self._load_options()
        
        # Calculate Minguo year
        founding_year = self._minguo_data["era"]["founding_year"]
        minguo_year = earth_date.year - founding_year + 1
        
        # Handle years before the Republic
        is_before_epoch = minguo_year < 1
        if is_before_epoch:
            minguo_year = abs(minguo_year - 1)  # Convert to positive years before
        
        # Get month and weekday data
        month_data = self._minguo_data["months"][earth_date.month - 1]
        weekday_index = (earth_date.weekday() + 1) % 7  # Adjust for Sunday = 0
        weekday_data = self._minguo_data["weekdays"][weekday_index]
        
        # Check for holidays
        holiday_data = self._minguo_data["holidays"].get((earth_date.month, earth_date.day))
        
        # Format date based on display language and format
        if self._format == "short":
            # Short format
            if self._display_language == "chinese":
                if is_before_epoch and self._show_before_epoch:
                    formatted = f"民前{self._to_chinese_number(minguo_year)}年{earth_date.month}月{earth_date.day}日"
                else:
                    formatted = f"民國{self._to_chinese_number(minguo_year)}年{earth_date.month}月{earth_date.day}日"
            else:
                if is_before_epoch and self._show_before_epoch:
                    formatted = f"Before ROC {minguo_year}, {earth_date.month}/{earth_date.day}"
                else:
                    formatted = f"ROC {minguo_year}, {earth_date.month}/{earth_date.day}"
        elif self._format == "medium":
            # Medium format
            if self._display_language == "chinese":
                if is_before_epoch and self._show_before_epoch:
                    formatted = f"民前{self._to_chinese_number(minguo_year)}年{month_data['chinese']}{earth_date.day}日"
                else:
                    formatted = f"民國{self._to_chinese_number(minguo_year)}年{month_data['chinese']}{earth_date.day}日"
            else:
                if is_before_epoch and self._show_before_epoch:
                    formatted = f"Before Republic Year {minguo_year}, {month_data['english']} {earth_date.day}"
                else:
                    formatted = f"Republic Year {minguo_year}, {month_data['english']} {earth_date.day}"
        elif self._format == "formal":
            # Formal format (official style)
            if self._display_language == "chinese":
                if is_before_epoch and self._show_before_epoch:
                    formatted = f"中華民國前{self._to_chinese_number(minguo_year)}年{month_data['formal']}{self._to_chinese_number(earth_date.day)}日"
                else:
                    formatted = f"中華民國{self._to_chinese_number(minguo_year)}年{month_data['formal']}{self._to_chinese_number(earth_date.day)}日"
            else:
                if is_before_epoch and self._show_before_epoch:
                    formatted = f"Before Republic of China Year {minguo_year}, {month_data['english']} {earth_date.day}"
                else:
                    formatted = f"Republic of China Year {minguo_year}, {month_data['english']} {earth_date.day}"
        else:  # full
            # Full format
            if self._display_language == "chinese":
                if is_before_epoch and self._show_before_epoch:
                    formatted = f"民前{self._to_chinese_number(minguo_year)}年{month_data['chinese']}{earth_date.day}日 {weekday_data['chinese']}"
                else:
                    formatted = f"民國{self._to_chinese_number(minguo_year)}年{month_data['chinese']}{earth_date.day}日 {weekday_data['chinese']}"
            elif self._display_language == "combined":
                if is_before_epoch and self._show_before_epoch:
                    formatted = f"Before ROC {minguo_year}, {month_data['english']} {earth_date.day} | 民前{minguo_year}年{earth_date.month}月{earth_date.day}日"
                else:
                    formatted = f"ROC {minguo_year}, {month_data['english']} {earth_date.day} | 民國{minguo_year}年{earth_date.month}月{earth_date.day}日"
            else:  # english
                if is_before_epoch and self._show_before_epoch:
                    formatted = f"Before Republic Year {minguo_year}, {weekday_data['english']}, {month_data['english']} {earth_date.day}"
                else:
                    formatted = f"Republic Year {minguo_year}, {weekday_data['english']}, {month_data['english']} {earth_date.day}"
        
        # Handle years not in Minguo era for display
        if is_before_epoch and not self._show_before_epoch:
            # Fallback to showing Gregorian year
            formatted = f"{earth_date.year} CE (Pre-ROC)"
        
        result = {
            "minguo_year": minguo_year if not is_before_epoch else f"-{minguo_year}",
            "gregorian_year": earth_date.year,
            "is_before_epoch": is_before_epoch,
            "day": earth_date.day,
            "month": earth_date.month,
            "month_chinese": month_data["chinese"],
            "month_formal": month_data["formal"],
            "month_english": month_data["english"],
            "weekday_chinese": weekday_data["chinese"],
            "weekday_english": weekday_data["english"],
            "formatted": formatted,
            "gregorian_date": earth_date.strftime("%Y-%m-%d")
        }
        
        # Add Chinese numbers if enabled
        if self._use_chinese_numbers:
            result["day_chinese"] = self._to_chinese_number(earth_date.day)
            result["year_chinese"] = self._to_chinese_number(minguo_year)
        
        # Add holiday if applicable and enabled
        if self._show_holidays and holiday_data:
            result["holiday_chinese"] = holiday_data["chinese"]
            result["holiday_english"] = holiday_data["english"]
        
        # Add era information
        result["era_chinese"] = self._minguo_data["era"]["chinese"]
        result["era_english"] = self._minguo_data["era"]["english"]
        result["era_abbreviation"] = self._minguo_data["era"]["abbreviation"]
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        now = datetime.now()
        self._minguo_date = self._calculate_minguo_date(now)
        
        # Set state to formatted date
        self._state = self._minguo_date["formatted"]
        
        _LOGGER.debug(f"Updated Minguo Calendar to {self._state}")