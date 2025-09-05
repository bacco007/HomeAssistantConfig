"""Japanese Era Calendar (和暦, Wareki) implementation - Version 2.5."""
from __future__ import annotations

from datetime import datetime, date, timezone
import logging
from typing import Dict, Any, Optional, Tuple
from zoneinfo import ZoneInfo

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
    "id": "japanese_era",
    "version": "2.5.0",
    "icon": "mdi:torii",
    "category": "cultural",
    "accuracy": "official",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Japanese Era Calendar",
        "de": "Japanischer Ärenkalender",
        "es": "Calendario de Era Japonesa",
        "fr": "Calendrier des Ères Japonaises",
        "it": "Calendario delle Ere Giapponesi",
        "nl": "Japanse Tijdperk Kalender",
        "pl": "Kalendarz Er Japońskich",
        "pt": "Calendário de Eras Japonesas",
        "ru": "Японский календарь эпох",
        "ja": "和暦",
        "zh": "日本年号历",
        "ko": "일본 연호력"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Traditional Japanese calendar system using imperial era names (Reiwa, Heisei, Shōwa, etc.)",
        "de": "Traditionelles japanisches Kalendersystem mit kaiserlichen Äranamen (Reiwa, Heisei, Shōwa usw.)",
        "es": "Sistema de calendario japonés tradicional con nombres de eras imperiales (Reiwa, Heisei, Shōwa, etc.)",
        "fr": "Système de calendrier japonais traditionnel avec noms d'ères impériales (Reiwa, Heisei, Shōwa, etc.)",
        "it": "Sistema di calendario giapponese tradizionale con nomi di ere imperiali (Reiwa, Heisei, Shōwa, ecc.)",
        "nl": "Traditioneel Japans kalendersysteem met keizerlijke tijdperknamen (Reiwa, Heisei, Shōwa, enz.)",
        "pl": "Tradycyjny japoński system kalendarzowy z nazwami cesarskich er (Reiwa, Heisei, Shōwa, itp.)",
        "pt": "Sistema de calendário japonês tradicional com nomes de eras imperiais (Reiwa, Heisei, Shōwa, etc.)",
        "ru": "Традиционная японская календарная система с названиями императорских эпох (Рэйва, Хэйсэй, Сёва и др.)",
        "ja": "元号による日本の伝統的な暦法（令和、平成、昭和など）",
        "zh": "使用天皇年号的日本传统历法（令和、平成、昭和等）",
        "ko": "천황 연호를 사용하는 일본 전통 달력 시스템 (레이와, 헤이세이, 쇼와 등)"
    },
    
    # Extended information for tooltips
    "notes": {
        "en": "The Japanese Era Calendar (和暦, wareki) dates years according to the reign of the current Emperor. Each era begins with a new Emperor's ascension. Time is displayed in Japan Standard Time (JST).",
        "de": "Der japanische Ärenkalender (和暦, wareki) datiert Jahre nach der Herrschaft des aktuellen Kaisers. Jede Ära beginnt mit der Thronbesteigung eines neuen Kaisers. Die Zeit wird in Japan Standard Time (JST) angezeigt.",
        "es": "El Calendario de Era Japonesa (和暦, wareki) fecha los años según el reinado del Emperador actual. Cada era comienza con la ascensión de un nuevo Emperador. La hora se muestra en Hora Estándar de Japón (JST).",
        "fr": "Le calendrier des ères japonaises (和暦, wareki) date les années selon le règne de l'Empereur actuel. Chaque ère commence avec l'ascension d'un nouvel Empereur. L'heure est affichée en heure normale du Japon (JST).",
        "it": "Il Calendario delle Ere Giapponesi (和暦, wareki) data gli anni secondo il regno dell'Imperatore attuale. Ogni era inizia con l'ascesa di un nuovo Imperatore. L'ora è visualizzata in Japan Standard Time (JST).",
        "nl": "De Japanse Tijdperk Kalender (和暦, wareki) dateert jaren volgens de heerschappij van de huidige keizer. Elk tijdperk begint met de troonsbestijging van een nieuwe keizer. De tijd wordt weergegeven in Japan Standard Time (JST).",
        "pl": "Kalendarz Er Japońskich (和暦, wareki) datuje lata zgodnie z panowaniem obecnego cesarza. Każda era rozpoczyna się wraz z wstąpieniem na tron nowego cesarza. Czas jest wyświetlany w Japan Standard Time (JST).",
        "pt": "O Calendário de Eras Japonesas (和暦, wareki) data os anos de acordo com o reinado do Imperador atual. Cada era começa com a ascensão de um novo Imperador. A hora é exibida em Horário Padrão do Japão (JST).",
        "ru": "Японский календарь эпох (和暦, варэки) датирует годы в соответствии с правлением текущего императора. Каждая эпоха начинается с восшествия на престол нового императора. Время отображается в японском стандартном времени (JST).",
        "ja": "和暦は天皇の在位期間に基づいて年を数える日本の伝統的な暦法です。新しい天皇の即位により新たな元号が始まります。時刻は日本標準時（JST）で表示されます。",
        "zh": "日本年号历（和历）根据当前天皇的统治来纪年。每个年号随着新天皇的即位而开始。时间以日本标准时间（JST）显示。",
        "ko": "일본 연호력(와레키)은 현재 천황의 재위 기간에 따라 연도를 매깁니다. 각 연호는 새로운 천황의 즉위와 함께 시작됩니다. 시간은 일본 표준시(JST)로 표시됩니다."
    },
    
    # Configuration options
    "config_options": {
        "timezone": {
            "type": "select",
            "default": "Asia/Tokyo",
            "options": ["Asia/Tokyo", "local", "UTC"],
            "label": {
                "en": "Time Zone",
                "de": "Zeitzone",
                "es": "Zona Horaria",
                "fr": "Fuseau Horaire",
                "it": "Fuso Orario",
                "nl": "Tijdzone",
                "pl": "Strefa Czasowa",
                "pt": "Fuso Horário",
                "ru": "Часовой пояс",
                "ja": "タイムゾーン",
                "zh": "时区",
                "ko": "시간대"
            },
            "description": {
                "en": "Choose timezone for date calculation (JST recommended)",
                "de": "Zeitzone für Datumsberechnung wählen (JST empfohlen)",
                "es": "Elegir zona horaria para el cálculo de fecha (JST recomendado)",
                "fr": "Choisir le fuseau horaire pour le calcul de la date (JST recommandé)",
                "it": "Scegli il fuso orario per il calcolo della data (JST consigliato)",
                "nl": "Kies tijdzone voor datumberekening (JST aanbevolen)",
                "pl": "Wybierz strefę czasową do obliczania daty (zalecane JST)",
                "pt": "Escolher fuso horário para cálculo de data (JST recomendado)",
                "ru": "Выберите часовой пояс для расчета даты (рекомендуется JST)",
                "ja": "日付計算のタイムゾーンを選択（JST推奨）",
                "zh": "选择日期计算的时区（推荐JST）",
                "ko": "날짜 계산을 위한 시간대 선택 (JST 권장)"
            }
        },
        "display_format": {
            "type": "select",
            "default": "full",
            "options": ["full", "kanji", "romaji", "numeric"],
            "label": {
                "en": "Display Format",
                "de": "Anzeigeformat",
                "es": "Formato de Visualización",
                "fr": "Format d'Affichage",
                "it": "Formato di Visualizzazione",
                "nl": "Weergaveformaat",
                "pl": "Format Wyświetlania",
                "pt": "Formato de Exibição",
                "ru": "Формат отображения",
                "ja": "表示形式",
                "zh": "显示格式",
                "ko": "표시 형식"
            },
            "description": {
                "en": "Choose how to display the era date",
                "de": "Wählen Sie, wie das Ärendatum angezeigt werden soll",
                "es": "Elija cómo mostrar la fecha de la era",
                "fr": "Choisissez comment afficher la date de l'ère",
                "it": "Scegli come visualizzare la data dell'era",
                "nl": "Kies hoe de tijdperkdatum wordt weergegeven",
                "pl": "Wybierz sposób wyświetlania daty ery",
                "pt": "Escolha como exibir a data da era",
                "ru": "Выберите формат отображения даты эпохи",
                "ja": "元号日付の表示方法を選択",
                "zh": "选择如何显示年号日期",
                "ko": "연호 날짜 표시 방법 선택"
            }
        },
        "show_gregorian": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Gregorian Date",
                "de": "Gregorianisches Datum anzeigen",
                "es": "Mostrar Fecha Gregoriana",
                "fr": "Afficher la Date Grégorienne",
                "it": "Mostra Data Gregoriana",
                "nl": "Gregoriaanse Datum Tonen",
                "pl": "Pokaż Datę Gregoriańską",
                "pt": "Mostrar Data Gregoriana",
                "ru": "Показать григорианскую дату",
                "ja": "西暦を表示",
                "zh": "显示公历日期",
                "ko": "그레고리력 날짜 표시"
            },
            "description": {
                "en": "Display the Western calendar date alongside the Japanese era date",
                "de": "Zeigt das westliche Kalenderdatum neben dem japanischen Ärendatum an",
                "es": "Muestra la fecha del calendario occidental junto con la fecha de la era japonesa",
                "fr": "Affiche la date du calendrier occidental à côté de la date de l'ère japonaise",
                "it": "Visualizza la data del calendario occidentale accanto alla data dell'era giapponese",
                "nl": "Toont de westerse kalenderdatum naast de Japanse tijdperkdatum",
                "pl": "Wyświetla datę kalendarza zachodniego obok daty ery japońskiej",
                "pt": "Exibe a data do calendário ocidental ao lado da data da era japonesa",
                "ru": "Отображает дату западного календаря рядом с датой японской эпохи",
                "ja": "和暦と併せて西暦を表示します",
                "zh": "在日本年号日期旁显示西历日期",
                "ko": "일본 연호 날짜와 함께 서력 날짜 표시"
            }
        },
        "show_time": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Time",
                "de": "Zeit anzeigen",
                "es": "Mostrar Hora",
                "fr": "Afficher l'Heure",
                "it": "Mostra Ora",
                "nl": "Tijd Tonen",
                "pl": "Pokaż Czas",
                "pt": "Mostrar Hora",
                "ru": "Показать время",
                "ja": "時刻を表示",
                "zh": "显示时间",
                "ko": "시간 표시"
            },
            "description": {
                "en": "Display current time in Japan Standard Time (JST)",
                "de": "Zeigt die aktuelle Zeit in Japan Standard Time (JST) an",
                "es": "Muestra la hora actual en Hora Estándar de Japón (JST)",
                "fr": "Affiche l'heure actuelle en heure normale du Japon (JST)",
                "it": "Visualizza l'ora corrente in Japan Standard Time (JST)",
                "nl": "Toont de huidige tijd in Japan Standard Time (JST)",
                "pl": "Wyświetla aktualny czas w Japan Standard Time (JST)",
                "pt": "Exibe a hora atual em Horário Padrão do Japão (JST)",
                "ru": "Отображает текущее время в японском стандартном времени (JST)",
                "ja": "日本標準時（JST）で現在時刻を表示します",
                "zh": "显示日本标准时间（JST）的当前时间",
                "ko": "일본 표준시(JST)로 현재 시간 표시"
            }
        },
        "show_weekday": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Weekday",
                "de": "Wochentag anzeigen",
                "es": "Mostrar Día de la Semana",
                "fr": "Afficher le Jour de la Semaine",
                "it": "Mostra Giorno della Settimana",
                "nl": "Weekdag Tonen",
                "pl": "Pokaż Dzień Tygodnia",
                "pt": "Mostrar Dia da Semana",
                "ru": "Показать день недели",
                "ja": "曜日を表示",
                "zh": "显示星期",
                "ko": "요일 표시"
            },
            "description": {
                "en": "Display the day of the week in Japanese",
                "de": "Zeigt den Wochentag auf Japanisch an",
                "es": "Muestra el día de la semana en japonés",
                "fr": "Affiche le jour de la semaine en japonais",
                "it": "Visualizza il giorno della settimana in giapponese",
                "nl": "Toont de dag van de week in het Japans",
                "pl": "Wyświetla dzień tygodnia po japońsku",
                "pt": "Exibe o dia da semana em japonês",
                "ru": "Отображает день недели на японском языке",
                "ja": "日本語で曜日を表示します",
                "zh": "用日语显示星期几",
                "ko": "일본어로 요일 표시"
            }
        },
        "show_holidays": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Japanese Holidays",
                "de": "Japanische Feiertage anzeigen",
                "es": "Mostrar Días Festivos Japoneses",
                "fr": "Afficher les Jours Fériés Japonais",
                "it": "Mostra Festività Giapponesi",
                "nl": "Japanse Feestdagen Tonen",
                "pl": "Pokaż Japońskie Święta",
                "pt": "Mostrar Feriados Japoneses",
                "ru": "Показать японские праздники",
                "ja": "祝日を表示",
                "zh": "显示日本节假日",
                "ko": "일본 공휴일 표시"
            },
            "description": {
                "en": "Display national holidays and observances",
                "de": "Zeigt nationale Feiertage und Gedenktage an",
                "es": "Muestra días festivos nacionales y observancias",
                "fr": "Affiche les jours fériés nationaux et les observances",
                "it": "Visualizza festività nazionali e ricorrenze",
                "nl": "Toont nationale feestdagen en herdenkingen",
                "pl": "Wyświetla święta narodowe i obchody",
                "pt": "Exibe feriados nacionais e observâncias",
                "ru": "Отображает национальные праздники и памятные даты",
                "ja": "国民の祝日と記念日を表示します",
                "zh": "显示国定假日和纪念日",
                "ko": "국경일 및 기념일 표시"
            }
        },
        "show_rokuyou": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Rokuyō",
                "de": "Rokuyō anzeigen",
                "es": "Mostrar Rokuyō",
                "fr": "Afficher Rokuyō",
                "it": "Mostra Rokuyō",
                "nl": "Rokuyō Tonen",
                "pl": "Pokaż Rokuyō",
                "pt": "Mostrar Rokuyō",
                "ru": "Показать Рокуё",
                "ja": "六曜を表示",
                "zh": "显示六曜",
                "ko": "육요 표시"
            },
            "description": {
                "en": "Display the six-day lucky/unlucky cycle (先勝, 友引, 先負, 仏滅, 大安, 赤口)",
                "de": "Zeigt den sechstägigen Glücks-/Unglückszyklus an",
                "es": "Muestra el ciclo de seis días de suerte/mala suerte",
                "fr": "Affiche le cycle de six jours de chance/malchance",
                "it": "Visualizza il ciclo di sei giorni fortunati/sfortunati",
                "nl": "Toont de zesdaagse geluk/ongeluk cyclus",
                "pl": "Wyświetla sześciodniowy cykl szczęścia/pecha",
                "pt": "Exibe o ciclo de seis dias de sorte/azar",
                "ru": "Отображает шестидневный цикл удачи/неудачи",
                "ja": "六曜（先勝、友引、先負、仏滅、大安、赤口）を表示します",
                "zh": "显示六曜吉凶周期（先胜、友引、先负、佛灭、大安、赤口）",
                "ko": "육요 길흉 주기 표시 (선승, 우인, 선패, 불멸, 대안, 적구)"
            }
        }
    },
    
    # Japanese era data
    "era_data": {
        "eras": [
            # Modern eras (most commonly used)
            {"name": "令和", "romaji": "Reiwa", "start": date(2019, 5, 1), "end": None},
            {"name": "平成", "romaji": "Heisei", "start": date(1989, 1, 8), "end": date(2019, 4, 30)},
            {"name": "昭和", "romaji": "Shōwa", "start": date(1926, 12, 25), "end": date(1989, 1, 7)},
            {"name": "大正", "romaji": "Taishō", "start": date(1912, 7, 30), "end": date(1926, 12, 24)},
            {"name": "明治", "romaji": "Meiji", "start": date(1868, 1, 25), "end": date(1912, 7, 29)}
        ],
        "weekdays": {
            "en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "ja": ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"],
            "ja_short": ["月", "火", "水", "木", "金", "土", "日"]
        },
        "months": {
            "traditional": ["睦月", "如月", "弥生", "卯月", "皐月", "水無月", 
                          "文月", "葉月", "長月", "神無月", "霜月", "師走"],
            "modern": ["1月", "2月", "3月", "4月", "5月", "6月",
                      "7月", "8月", "9月", "10月", "11月", "12月"]
        },
        "rokuyou": [
            {"name": "先勝", "romaji": "Sensho", "meaning": "Good luck before noon"},
            {"name": "友引", "romaji": "Tomobiki", "meaning": "Good luck except at noon"},
            {"name": "先負", "romaji": "Senbu", "meaning": "Good luck after noon"},
            {"name": "仏滅", "romaji": "Butsumetsu", "meaning": "Unlucky all day"},
            {"name": "大安", "romaji": "Taian", "meaning": "Lucky all day"},
            {"name": "赤口", "romaji": "Shakkou", "meaning": "Bad luck except at noon"}
        ],
        "holidays": {
            "1-1": {"ja": "元日", "en": "New Year's Day"},
            "1-2": {"ja": "成人の日", "en": "Coming of Age Day", "type": "2nd Monday"},
            "2-11": {"ja": "建国記念の日", "en": "National Foundation Day"},
            "2-23": {"ja": "天皇誕生日", "en": "Emperor's Birthday"},
            "3-20": {"ja": "春分の日", "en": "Vernal Equinox Day", "type": "around"},
            "4-29": {"ja": "昭和の日", "en": "Shōwa Day"},
            "5-3": {"ja": "憲法記念日", "en": "Constitution Memorial Day"},
            "5-4": {"ja": "みどりの日", "en": "Greenery Day"},
            "5-5": {"ja": "こどもの日", "en": "Children's Day"},
            "7-3": {"ja": "海の日", "en": "Marine Day", "type": "3rd Monday"},
            "8-11": {"ja": "山の日", "en": "Mountain Day"},
            "9-3": {"ja": "敬老の日", "en": "Respect for the Aged Day", "type": "3rd Monday"},
            "9-23": {"ja": "秋分の日", "en": "Autumnal Equinox Day", "type": "around"},
            "10-2": {"ja": "スポーツの日", "en": "Sports Day", "type": "2nd Monday"},
            "11-3": {"ja": "文化の日", "en": "Culture Day"},
            "11-23": {"ja": "勤労感謝の日", "en": "Labor Thanksgiving Day"}
        }
    },
    
    # Additional metadata
    "reference_url": "https://www.japanesecalendar.net/",
    "documentation_url": "https://en.wikipedia.org/wiki/Japanese_calendar",
    "created_by": "Japanese Imperial System",
    "introduced": "645 CE (first era: Taika)",
    
    # Example format
    "example": "令和6年12月15日（日）15:30 JST",
    "example_meaning": "Reiwa 6 (2024), December 15th (Sunday) 15:30 Japan Standard Time",
    
    # Related calendars
    "related": ["chinese_lunar", "taiwan_minguo", "korean"],
    
    # Tags for searching and filtering
    "tags": [
        "japanese", "era", "imperial", "wareki", "reiwa", "heisei",
        "showa", "cultural", "official", "asia", "japan", "jst"
    ],
    
    # Special features
    "features": {
        "supports_eras": True,
        "supports_holidays": True,
        "supports_rokuyou": True,
        "supports_weekdays": True,
        "supports_timezone": True,
        "precision": "minute"
    }
}


class JapaneseEraCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Japanese Era Calendar (Wareki)."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Japanese Era calendar sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable for _translate method
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Japanese Era Calendar')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_japanese_era"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:torii")
        
        # Configuration options with defaults from CALENDAR_INFO
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._timezone = config_defaults.get("timezone", {}).get("default", "Asia/Tokyo")
        self._display_format = config_defaults.get("display_format", {}).get("default", "full")
        self._show_gregorian = config_defaults.get("show_gregorian", {}).get("default", True)
        self._show_time = config_defaults.get("show_time", {}).get("default", True)
        self._show_weekday = config_defaults.get("show_weekday", {}).get("default", True)
        self._show_holidays = config_defaults.get("show_holidays", {}).get("default", True)
        self._show_rokuyou = config_defaults.get("show_rokuyou", {}).get("default", False)
        
        # Era data
        self._era_data = CALENDAR_INFO["era_data"]
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        # Initialize state
        self._state = None
        self._japanese_date = {}
        
        _LOGGER.debug(f"Initialized Japanese Era Calendar sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        # Get plugin options from config entry
        plugin_options = self.get_plugin_options()
        
        if plugin_options:
            _LOGGER.debug(f"Loading Japanese Era options: {plugin_options}")
            
            # Apply options using set_options method
            self.set_options(
                timezone=plugin_options.get("timezone"),
                display_format=plugin_options.get("display_format"),
                show_gregorian=plugin_options.get("show_gregorian"),
                show_time=plugin_options.get("show_time"),
                show_weekday=plugin_options.get("show_weekday"),
                show_holidays=plugin_options.get("show_holidays"),
                show_rokuyou=plugin_options.get("show_rokuyou")
            )
        
        self._options_loaded = True
    
    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()
        
        # Load options after entity is registered
        self._load_options()
        
        _LOGGER.debug(f"Japanese Era sensor added to hass with options: "
                     f"timezone={self._timezone}, format={self._display_format}, "
                     f"gregorian={self._show_gregorian}, time={self._show_time}")
    
    def set_options(
        self,
        *,
        timezone: Optional[str] = None,
        display_format: Optional[str] = None,
        show_gregorian: Optional[bool] = None,
        show_time: Optional[bool] = None,
        show_weekday: Optional[bool] = None,
        show_holidays: Optional[bool] = None,
        show_rokuyou: Optional[bool] = None
    ) -> None:
        """Set calendar options from config flow."""
        if timezone is not None and timezone in ["Asia/Tokyo", "local", "UTC"]:
            self._timezone = timezone
            _LOGGER.debug(f"Set timezone to: {timezone}")
        
        if display_format is not None and display_format in ["full", "kanji", "romaji", "numeric"]:
            self._display_format = display_format
            _LOGGER.debug(f"Set display_format to: {display_format}")
        
        if show_gregorian is not None:
            self._show_gregorian = bool(show_gregorian)
            _LOGGER.debug(f"Set show_gregorian to: {show_gregorian}")
        
        if show_time is not None:
            self._show_time = bool(show_time)
            _LOGGER.debug(f"Set show_time to: {show_time}")
        
        if show_weekday is not None:
            self._show_weekday = bool(show_weekday)
            _LOGGER.debug(f"Set show_weekday to: {show_weekday}")
        
        if show_holidays is not None:
            self._show_holidays = bool(show_holidays)
            _LOGGER.debug(f"Set show_holidays to: {show_holidays}")
        
        if show_rokuyou is not None:
            self._show_rokuyou = bool(show_rokuyou)
            _LOGGER.debug(f"Set show_rokuyou to: {show_rokuyou}")
    
    def _get_timezone(self) -> ZoneInfo:
        """Get the configured timezone."""
        if self._timezone == "Asia/Tokyo":
            return ZoneInfo("Asia/Tokyo")
        elif self._timezone == "UTC":
            return ZoneInfo("UTC")
        else:  # local
            # Try to get system timezone, fallback to UTC
            try:
                import tzlocal
                return tzlocal.get_localzone()
            except:
                return ZoneInfo("UTC")
    
    def _get_current_era(self, current_date: date) -> Tuple[Dict, int]:
        """Get the current era and year within that era."""
        for era in self._era_data["eras"]:
            if era["end"] is None:  # Current era
                if current_date >= era["start"]:
                    year_in_era = current_date.year - era["start"].year + 1
                    return era, year_in_era
            elif era["start"] <= current_date <= era["end"]:
                year_in_era = current_date.year - era["start"].year + 1
                return era, year_in_era
        
        # Default to Reiwa if no era found (shouldn't happen with correct data)
        return self._era_data["eras"][0], 1
    
    def _get_weekday(self, current_date: date) -> Dict[str, str]:
        """Get weekday in different formats."""
        weekday_idx = current_date.weekday()
        return {
            "en": self._era_data["weekdays"]["en"][weekday_idx],
            "ja": self._era_data["weekdays"]["ja"][weekday_idx],
            "ja_short": self._era_data["weekdays"]["ja_short"][weekday_idx]
        }
    
    def _get_holiday(self, current_date: date) -> Optional[Dict[str, str]]:
        """Check if current date is a holiday."""
        date_key = f"{current_date.month}-{current_date.day}"
        if date_key in self._era_data["holidays"]:
            return self._era_data["holidays"][date_key]
        
        # Check for movable holidays (2nd Monday, etc.)
        # This is a simplified implementation
        return None
    
    def _get_rokuyou(self, current_date: date) -> Dict[str, str]:
        """Calculate Rokuyō for the given date."""
        # Simplified calculation - actual calculation is more complex
        # and involves lunar calendar
        day_count = (current_date - date(2000, 1, 1)).days
        rokuyou_idx = day_count % 6
        return self._era_data["rokuyou"][rokuyou_idx]
    
    def _format_japanese_date(self, era: Dict, year: int, japan_time: datetime) -> str:
        """Format the Japanese date according to display settings."""
        month = japan_time.month
        day = japan_time.day
        weekday = self._get_weekday(japan_time.date())
        
        if self._display_format == "kanji":
            # Full kanji format: 令和六年十二月十五日
            result = f"{era['name']}{year}年{month}月{day}日"
        elif self._display_format == "romaji":
            # Romaji format: Reiwa 6-nen 12-gatsu 15-nichi
            result = f"{era['romaji']} {year}-nen {month}-gatsu {day}-nichi"
        elif self._display_format == "numeric":
            # Numeric format: R6.12.15
            era_initial = era['romaji'][0].upper()
            result = f"{era_initial}{year}.{month:02d}.{day:02d}"
        else:  # full
            # Full format: 令和6年12月15日（日）
            result = f"{era['name']}{year}年{month}月{day}日"
            if self._show_weekday:
                result += f"（{weekday['ja_short']}）"
        
        # Add time if enabled
        if self._show_time:
            result += f" {japan_time.hour:02d}:{japan_time.minute:02d} JST"
        
        # Add Gregorian date if enabled
        if self._show_gregorian:
            result += f" [{japan_time.year}/{month:02d}/{day:02d}]"
        
        return result
    
    def _calculate_japanese_date(self, now: datetime) -> Dict[str, Any]:
        """Calculate the Japanese era date."""
        # Convert to configured timezone
        tz = self._get_timezone()
        japan_time = now.astimezone(tz)
        
        # If using JST, ensure we're getting Japan time
        if self._timezone == "Asia/Tokyo":
            japan_time = now.astimezone(ZoneInfo("Asia/Tokyo"))
        
        current_date = japan_time.date()
        era, year_in_era = self._get_current_era(current_date)
        weekday = self._get_weekday(current_date)
        
        result = {
            "era_name": era["name"],
            "era_romaji": era["romaji"],
            "year": year_in_era,
            "month": current_date.month,
            "day": current_date.day,
            "hour": japan_time.hour,
            "minute": japan_time.minute,
            "weekday": weekday,
            "gregorian_year": current_date.year,
            "timezone": str(tz) if self._timezone != "Asia/Tokyo" else "JST",
            "formatted": self._format_japanese_date(era, year_in_era, japan_time)
        }
        
        # Add holiday if applicable
        if self._show_holidays:
            holiday = self._get_holiday(current_date)
            if holiday:
                result["holiday"] = holiday
        
        # Add Rokuyō if enabled
        if self._show_rokuyou:
            result["rokuyou"] = self._get_rokuyou(current_date)
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded (in case async_added_to_hass hasn't run yet)
        if not self._options_loaded:
            self._load_options()
        
        now = datetime.now(timezone.utc)
        self._japanese_date = self._calculate_japanese_date(now)
        
        # Set state to formatted Japanese date
        self._state = self._japanese_date["formatted"]
        
        _LOGGER.debug(f"Updated Japanese Era Calendar to {self._state}")
    
    @property
    def state(self) -> str:
        """Return the state of the sensor."""
        return self._state or "Unknown"
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return additional attributes."""
        if not self._japanese_date:
            return {}
        
        # Build attributes dictionary
        attrs = {
            "era_name": self._japanese_date.get("era_name"),
            "era_romaji": self._japanese_date.get("era_romaji"),
            "year_in_era": self._japanese_date.get("year"),
            "month": self._japanese_date.get("month"),
            "day": self._japanese_date.get("day"),
            "hour": self._japanese_date.get("hour"),
            "minute": self._japanese_date.get("minute"),
            "gregorian_year": self._japanese_date.get("gregorian_year"),
            "weekday_ja": self._japanese_date.get("weekday", {}).get("ja"),
            "weekday_en": self._japanese_date.get("weekday", {}).get("en"),
            "timezone": self._japanese_date.get("timezone"),
            "icon": self._attr_icon,
            "calendar_type": "Japanese Era Calendar",
            "accuracy": CALENDAR_INFO.get("accuracy", "official"),
            "reference": CALENDAR_INFO.get("reference_url"),
            "notes": self._translate("notes")
        }
        
        # Add optional attributes
        if "holiday" in self._japanese_date:
            attrs["holiday_ja"] = self._japanese_date["holiday"].get("ja")
            attrs["holiday_en"] = self._japanese_date["holiday"].get("en")
        
        if "rokuyou" in self._japanese_date:
            rokuyou = self._japanese_date["rokuyou"]
            attrs["rokuyou"] = rokuyou.get("name")
            attrs["rokuyou_romaji"] = rokuyou.get("romaji")
            attrs["rokuyou_meaning"] = rokuyou.get("meaning")
        
        # Add configuration state
        attrs["config_timezone"] = self._timezone
        attrs["config_display_format"] = self._display_format
        attrs["config_show_gregorian"] = self._show_gregorian
        attrs["config_show_time"] = self._show_time
        attrs["config_show_weekday"] = self._show_weekday
        attrs["config_show_holidays"] = self._show_holidays
        attrs["config_show_rokuyou"] = self._show_rokuyou
        
        return attrs


# ============================================
# MODULE EXPORTS
# ============================================

# Export the sensor class
__all__ = ["JapaneseEraCalendarSensor"]