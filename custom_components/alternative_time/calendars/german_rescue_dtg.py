"""German Rescue Date Time Group (DTG) implementation - Version 1.0.0
German emergency services date-time format with configurable timezone support.

Displays time in German Rescue DTG format: DD HHMM MON YYYY
Example: 24 1530 DEZ 2025
Used by German emergency services, fire departments, and rescue organizations.
"""
from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Dict, Any, Optional

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

try:
    import pytz
    HAS_PYTZ = True
except ImportError:
    HAS_PYTZ = False
    _LOGGER.warning("pytz not installed, German Rescue DTG timezone support will be limited")

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (1 second for real-time display)
UPDATE_INTERVAL = 1

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "german_rescue_dtg",
    "version": "1.0.0",
    "icon": "mdi:ambulance",
    "category": "military",
    "accuracy": "precise",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "German Rescue DTG",
        "de": "Deutsche Rettungsdienst DTG",
        "es": "DTG de Rescate Alemán",
        "fr": "DTG de Secours Allemand",
        "it": "DTG di Soccorso Tedesco",
        "nl": "Duitse Reddingsdienst DTG",
        "pl": "Niemiecki DTG Ratowniczy",
        "pt": "DTG de Resgate Alemão",
        "ru": "Немецкая спасательная DTG",
        "ja": "ドイツ救助DTG",
        "zh": "德国救援DTG",
        "ko": "독일 구조 DTG"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "German emergency services date-time group format",
        "de": "Datum-Zeit-Gruppen-Format der deutschen Rettungsdienste",
        "es": "Formato de grupo fecha-hora de servicios de emergencia alemanes",
        "fr": "Format de groupe date-heure des services d'urgence allemands",
        "it": "Formato gruppo data-ora dei servizi di emergenza tedeschi",
        "nl": "Datum-tijd groepsformaat van Duitse hulpdiensten",
        "pl": "Format grupy data-czas niemieckich służb ratunkowych",
        "pt": "Formato de grupo data-hora dos serviços de emergência alemães",
        "ru": "Формат группы даты-времени немецких аварийных служб",
        "ja": "ドイツ緊急サービスの日時グループ形式",
        "zh": "德国紧急服务日期时间组格式",
        "ko": "독일 응급 서비스 날짜-시간 그룹 형식"
    },
    
    # German Rescue DTG specific data
    "rescue_dtg_data": {
        # German month abbreviations (3 letters)
        "months": {
            "01": "JAN", "02": "FEB", "03": "MÄR", "04": "APR",
            "05": "MAI", "06": "JUN", "07": "JUL", "08": "AUG",
            "09": "SEP", "10": "OKT", "11": "NOV", "12": "DEZ"
        },
        
        # International month abbreviations for other languages
        "months_international": {
            "en": {
                "01": "JAN", "02": "FEB", "03": "MAR", "04": "APR",
                "05": "MAY", "06": "JUN", "07": "JUL", "08": "AUG",
                "09": "SEP", "10": "OCT", "11": "NOV", "12": "DEC"
            },
            "es": {
                "01": "ENE", "02": "FEB", "03": "MAR", "04": "ABR",
                "05": "MAY", "06": "JUN", "07": "JUL", "08": "AGO",
                "09": "SEP", "10": "OCT", "11": "NOV", "12": "DIC"
            },
            "fr": {
                "01": "JAN", "02": "FÉV", "03": "MAR", "04": "AVR",
                "05": "MAI", "06": "JUN", "07": "JUL", "08": "AOÛ",
                "09": "SEP", "10": "OCT", "11": "NOV", "12": "DÉC"
            },
            "it": {
                "01": "GEN", "02": "FEB", "03": "MAR", "04": "APR",
                "05": "MAG", "06": "GIU", "07": "LUG", "08": "AGO",
                "09": "SET", "10": "OTT", "11": "NOV", "12": "DIC"
            },
            "nl": {
                "01": "JAN", "02": "FEB", "03": "MRT", "04": "APR",
                "05": "MEI", "06": "JUN", "07": "JUL", "08": "AUG",
                "09": "SEP", "10": "OKT", "11": "NOV", "12": "DEC"
            },
            "pl": {
                "01": "STY", "02": "LUT", "03": "MAR", "04": "KWI",
                "05": "MAJ", "06": "CZE", "07": "LIP", "08": "SIE",
                "09": "WRZ", "10": "PAŹ", "11": "LIS", "12": "GRU"
            },
            "pt": {
                "01": "JAN", "02": "FEV", "03": "MAR", "04": "ABR",
                "05": "MAI", "06": "JUN", "07": "JUL", "08": "AGO",
                "09": "SET", "10": "OUT", "11": "NOV", "12": "DEZ"
            },
            "ru": {
                "01": "ЯНВ", "02": "ФЕВ", "03": "МАР", "04": "АПР",
                "05": "МАЙ", "06": "ИЮН", "07": "ИЮЛ", "08": "АВГ",
                "09": "СЕН", "10": "ОКТ", "11": "НОЯ", "12": "ДЕК"
            },
            "ja": {
                "01": "1月", "02": "2月", "03": "3月", "04": "4月",
                "05": "5月", "06": "6月", "07": "7月", "08": "8月",
                "09": "9月", "10": "10月", "11": "11月", "12": "12月"
            },
            "zh": {
                "01": "一月", "02": "二月", "03": "三月", "04": "四月",
                "05": "五月", "06": "六月", "07": "七月", "08": "八月",
                "09": "九月", "10": "十月", "11": "十一月", "12": "十二月"
            },
            "ko": {
                "01": "1월", "02": "2월", "03": "3월", "04": "4월",
                "05": "5월", "06": "6월", "07": "7월", "08": "8월",
                "09": "9월", "10": "10월", "11": "11월", "12": "12월"
            }
        },
        
        # Common German timezones
        "timezones": {
            "Europe/Berlin": {
                "name": "Berlin/German Time",
                "dropdown_label": {
                    "en": "Europe/Berlin - Central European Time (CET/CEST)",
                    "de": "Europa/Berlin - Mitteleuropäische Zeit (MEZ/MESZ)",
                    "es": "Europa/Berlín - Hora de Europa Central (CET/CEST)",
                    "fr": "Europe/Berlin - Heure d'Europe Centrale (CET/CEST)",
                    "it": "Europa/Berlino - Ora dell'Europa Centrale (CET/CEST)",
                    "nl": "Europa/Berlijn - Midden-Europese Tijd (CET/CEST)",
                    "pl": "Europa/Berlin - Czas Środkowoeuropejski (CET/CEST)",
                    "pt": "Europa/Berlim - Hora da Europa Central (CET/CEST)",
                    "ru": "Европа/Берлин - Центральноевропейское время (CET/CEST)",
                    "ja": "ヨーロッパ/ベルリン - 中央ヨーロッパ時間 (CET/CEST)",
                    "zh": "欧洲/柏林 - 中欧时间 (CET/CEST)",
                    "ko": "유럽/베를린 - 중앙 유럽 시간 (CET/CEST)"
                }
            },
            "Europe/Vienna": {
                "name": "Vienna/Austrian Time",
                "dropdown_label": {
                    "en": "Europe/Vienna - Austrian Time (CET/CEST)",
                    "de": "Europa/Wien - Österreichische Zeit (MEZ/MESZ)",
                    "es": "Europa/Viena - Hora de Austria (CET/CEST)",
                    "fr": "Europe/Vienne - Heure Autrichienne (CET/CEST)",
                    "it": "Europa/Vienna - Ora Austriaca (CET/CEST)",
                    "nl": "Europa/Wenen - Oostenrijkse Tijd (CET/CEST)",
                    "pl": "Europa/Wiedeń - Czas Austriacki (CET/CEST)",
                    "pt": "Europa/Viena - Hora da Áustria (CET/CEST)",
                    "ru": "Европа/Вена - Австрийское время (CET/CEST)",
                    "ja": "ヨーロッパ/ウィーン - オーストリア時間 (CET/CEST)",
                    "zh": "欧洲/维也纳 - 奥地利时间 (CET/CEST)",
                    "ko": "유럽/비엔나 - 오스트리아 시간 (CET/CEST)"
                }
            },
            "Europe/Zurich": {
                "name": "Zurich/Swiss Time",
                "dropdown_label": {
                    "en": "Europe/Zurich - Swiss Time (CET/CEST)",
                    "de": "Europa/Zürich - Schweizer Zeit (MEZ/MESZ)",
                    "es": "Europa/Zúrich - Hora de Suiza (CET/CEST)",
                    "fr": "Europe/Zurich - Heure Suisse (CET/CEST)",
                    "it": "Europa/Zurigo - Ora Svizzera (CET/CEST)",
                    "nl": "Europa/Zürich - Zwitserse Tijd (CET/CEST)",
                    "pl": "Europa/Zurych - Czas Szwajcarski (CET/CEST)",
                    "pt": "Europa/Zurique - Hora da Suíça (CET/CEST)",
                    "ru": "Европа/Цюрих - Швейцарское время (CET/CEST)",
                    "ja": "ヨーロッパ/チューリッヒ - スイス時間 (CET/CEST)",
                    "zh": "欧洲/苏黎世 - 瑞士时间 (CET/CEST)",
                    "ko": "유럽/취리히 - 스위스 시간 (CET/CEST)"
                }
            },
            "Europe/Luxembourg": {
                "name": "Luxembourg Time",
                "dropdown_label": {
                    "en": "Europe/Luxembourg - Luxembourg Time (CET/CEST)",
                    "de": "Europa/Luxemburg - Luxemburgische Zeit (MEZ/MESZ)",
                    "es": "Europa/Luxemburgo - Hora de Luxemburgo (CET/CEST)",
                    "fr": "Europe/Luxembourg - Heure Luxembourgeoise (CET/CEST)",
                    "it": "Europa/Lussemburgo - Ora del Lussemburgo (CET/CEST)",
                    "nl": "Europa/Luxemburg - Luxemburgse Tijd (CET/CEST)",
                    "pl": "Europa/Luksemburg - Czas Luksemburski (CET/CEST)",
                    "pt": "Europa/Luxemburgo - Hora de Luxemburgo (CET/CEST)",
                    "ru": "Европа/Люксембург - Люксембургское время (CET/CEST)",
                    "ja": "ヨーロッパ/ルクセンブルク - ルクセンブルク時間 (CET/CEST)",
                    "zh": "欧洲/卢森堡 - 卢森堡时间 (CET/CEST)",
                    "ko": "유럽/룩셈부르크 - 룩셈부르크 시간 (CET/CEST)"
                }
            },
            "UTC": {
                "name": "UTC/Zulu Time",
                "dropdown_label": {
                    "en": "UTC - Coordinated Universal Time",
                    "de": "UTC - Koordinierte Weltzeit",
                    "es": "UTC - Tiempo Universal Coordinado",
                    "fr": "UTC - Temps Universel Coordonné",
                    "it": "UTC - Tempo Coordinato Universale",
                    "nl": "UTC - Gecoördineerde Wereldtijd",
                    "pl": "UTC - Uniwersalny Czas Koordynowany",
                    "pt": "UTC - Tempo Universal Coordenado",
                    "ru": "UTC - Всемирное координированное время",
                    "ja": "UTC - 協定世界時",
                    "zh": "UTC - 协调世界时",
                    "ko": "UTC - 협정 세계시"
                }
            }
        }
    },
    
    # Reference URL
    "reference_url": "https://de.wikipedia.org/wiki/Zeitangabe",
    
    # Plugin configuration options
    "plugin_options": {
        "timezone": {
            "type": "select",
            "default": "Europe/Berlin",
            "label": {
                "en": "Timezone",
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
                "en": "Select the timezone for DTG display",
                "de": "Zeitzone für DTG-Anzeige auswählen",
                "es": "Seleccione la zona horaria para la visualización DTG",
                "fr": "Sélectionnez le fuseau horaire pour l'affichage DTG",
                "it": "Seleziona il fuso orario per la visualizzazione DTG",
                "nl": "Selecteer de tijdzone voor DTG-weergave",
                "pl": "Wybierz strefę czasową dla wyświetlania DTG",
                "pt": "Selecione o fuso horário para exibição DTG",
                "ru": "Выберите часовой пояс для отображения DTG",
                "ja": "DTG表示用のタイムゾーンを選択",
                "zh": "选择DTG显示的时区",
                "ko": "DTG 표시를 위한 시간대 선택"
            },
            "options": [
                {"value": "Europe/Berlin", "label": {"en": "Europe/Berlin (CET/CEST)", "de": "Europa/Berlin (MEZ/MESZ)"}},
                {"value": "Europe/Vienna", "label": {"en": "Europe/Vienna (CET/CEST)", "de": "Europa/Wien (MEZ/MESZ)"}},
                {"value": "Europe/Zurich", "label": {"en": "Europe/Zurich (CET/CEST)", "de": "Europa/Zürich (MEZ/MESZ)"}},
                {"value": "Europe/Luxembourg", "label": {"en": "Europe/Luxembourg (CET/CEST)", "de": "Europa/Luxemburg (MEZ/MESZ)"}},
                {"value": "UTC", "label": {"en": "UTC - Coordinated Universal Time", "de": "UTC - Koordinierte Weltzeit"}}
            ]
        },
        "month_language": {
            "type": "select",
            "default": "de",
            "label": {
                "en": "Month Language",
                "de": "Monatssprache",
                "es": "Idioma del Mes",
                "fr": "Langue du Mois",
                "it": "Lingua del Mese",
                "nl": "Maandtaal",
                "pl": "Język Miesiąca",
                "pt": "Idioma do Mês",
                "ru": "Язык месяца",
                "ja": "月の言語",
                "zh": "月份语言",
                "ko": "월 언어"
            },
            "description": {
                "en": "Select language for month abbreviations",
                "de": "Sprache für Monatsabkürzungen auswählen",
                "es": "Seleccionar idioma para abreviaturas de meses",
                "fr": "Sélectionner la langue pour les abréviations de mois",
                "it": "Seleziona la lingua per le abbreviazioni dei mesi",
                "nl": "Selecteer taal voor maandafkortingen",
                "pl": "Wybierz język dla skrótów miesięcy",
                "pt": "Selecionar idioma para abreviações de meses",
                "ru": "Выберите язык для сокращений месяцев",
                "ja": "月の略語の言語を選択",
                "zh": "选择月份缩写的语言",
                "ko": "월 약어 언어 선택"
            },
            "options": {
                "de": {
                    "en": "German (JAN, FEB, MÄR, ...)",
                    "de": "Deutsch (JAN, FEB, MÄR, ...)",
                    "es": "Alemán (JAN, FEB, MÄR, ...)",
                    "fr": "Allemand (JAN, FEB, MÄR, ...)",
                    "it": "Tedesco (JAN, FEB, MÄR, ...)",
                    "nl": "Duits (JAN, FEB, MÄR, ...)",
                    "pl": "Niemiecki (JAN, FEB, MÄR, ...)",
                    "pt": "Alemão (JAN, FEB, MÄR, ...)",
                    "ru": "Немецкий (JAN, FEB, MÄR, ...)",
                    "ja": "ドイツ語 (JAN, FEB, MÄR, ...)",
                    "zh": "德语 (JAN, FEB, MÄR, ...)",
                    "ko": "독일어 (JAN, FEB, MÄR, ...)"
                },
                "en": {
                    "en": "English (JAN, FEB, MAR, ...)",
                    "de": "Englisch (JAN, FEB, MAR, ...)",
                    "es": "Inglés (JAN, FEB, MAR, ...)",
                    "fr": "Anglais (JAN, FEB, MAR, ...)",
                    "it": "Inglese (JAN, FEB, MAR, ...)",
                    "nl": "Engels (JAN, FEB, MAR, ...)",
                    "pl": "Angielski (JAN, FEB, MAR, ...)",
                    "pt": "Inglês (JAN, FEB, MAR, ...)",
                    "ru": "Английский (JAN, FEB, MAR, ...)",
                    "ja": "英語 (JAN, FEB, MAR, ...)",
                    "zh": "英语 (JAN, FEB, MAR, ...)",
                    "ko": "영어 (JAN, FEB, MAR, ...)"
                },
                "local": {
                    "en": "Local Language",
                    "de": "Lokale Sprache",
                    "es": "Idioma Local",
                    "fr": "Langue Locale",
                    "it": "Lingua Locale",
                    "nl": "Lokale Taal",
                    "pl": "Język Lokalny",
                    "pt": "Idioma Local",
                    "ru": "Местный язык",
                    "ja": "現地語",
                    "zh": "本地语言",
                    "ko": "현지 언어"
                }
            }
        },
        "uppercase": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Use Uppercase",
                "de": "Großbuchstaben verwenden",
                "es": "Usar Mayúsculas",
                "fr": "Utiliser les Majuscules",
                "it": "Usa Maiuscole",
                "nl": "Gebruik Hoofdletters",
                "pl": "Użyj Wielkich Liter",
                "pt": "Usar Maiúsculas",
                "ru": "Использовать заглавные буквы",
                "ja": "大文字を使用",
                "zh": "使用大写",
                "ko": "대문자 사용"
            },
            "description": {
                "en": "Display DTG in uppercase format",
                "de": "DTG in Großbuchstaben anzeigen",
                "es": "Mostrar DTG en formato de mayúsculas",
                "fr": "Afficher DTG en format majuscules",
                "it": "Visualizza DTG in formato maiuscolo",
                "nl": "DTG in hoofdletters weergeven",
                "pl": "Wyświetl DTG wielkimi literami",
                "pt": "Exibir DTG em formato maiúsculo",
                "ru": "Отображать DTG заглавными буквами",
                "ja": "DTGを大文字形式で表示",
                "zh": "以大写格式显示DTG",
                "ko": "DTG를 대문자 형식으로 표시"
            }
        },
        "show_seconds": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Seconds",
                "de": "Sekunden anzeigen",
                "es": "Mostrar Segundos",
                "fr": "Afficher les Secondes",
                "it": "Mostra Secondi",
                "nl": "Seconden Tonen",
                "pl": "Pokaż Sekundy",
                "pt": "Mostrar Segundos",
                "ru": "Показывать секунды",
                "ja": "秒を表示",
                "zh": "显示秒",
                "ko": "초 표시"
            },
            "description": {
                "en": "Include seconds in time display (HHMMSS)",
                "de": "Sekunden in Zeitanzeige einbeziehen (HHMMSS)",
                "es": "Incluir segundos en la visualización de tiempo (HHMMSS)",
                "fr": "Inclure les secondes dans l'affichage de l'heure (HHMMSS)",
                "it": "Includi secondi nella visualizzazione del tempo (HHMMSS)",
                "nl": "Seconden opnemen in tijdweergave (HHMMSS)",
                "pl": "Uwzględnij sekundy w wyświetlaniu czasu (HHMMSS)",
                "pt": "Incluir segundos na exibição de tempo (HHMMSS)",
                "ru": "Включить секунды в отображение времени (HHMMSS)",
                "ja": "時刻表示に秒を含める (HHMMSS)",
                "zh": "在时间显示中包含秒 (HHMMSS)",
                "ko": "시간 표시에 초 포함 (HHMMSS)"
            }
        },
        "show_timezone": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Timezone",
                "de": "Zeitzone anzeigen",
                "es": "Mostrar Zona Horaria",
                "fr": "Afficher le Fuseau Horaire",
                "it": "Mostra Fuso Orario",
                "nl": "Tijdzone Tonen",
                "pl": "Pokaż Strefę Czasową",
                "pt": "Mostrar Fuso Horário",
                "ru": "Показывать часовой пояс",
                "ja": "タイムゾーンを表示",
                "zh": "显示时区",
                "ko": "시간대 표시"
            },
            "description": {
                "en": "Append timezone abbreviation (MEZ/MESZ)",
                "de": "Zeitzonenabkürzung anhängen (MEZ/MESZ)",
                "es": "Añadir abreviatura de zona horaria (MEZ/MESZ)",
                "fr": "Ajouter l'abréviation du fuseau horaire (MEZ/MESZ)",
                "it": "Aggiungi abbreviazione fuso orario (MEZ/MESZ)",
                "nl": "Tijdzone-afkorting toevoegen (MEZ/MESZ)",
                "pl": "Dodaj skrót strefy czasowej (MEZ/MESZ)",
                "pt": "Adicionar abreviação de fuso horário (MEZ/MESZ)",
                "ru": "Добавить сокращение часового пояса (MEZ/MESZ)",
                "ja": "タイムゾーン略語を追加 (MEZ/MESZ)",
                "zh": "添加时区缩写 (MEZ/MESZ)",
                "ko": "시간대 약어 추가 (MEZ/MESZ)"
            }
        }
    }
}


class GermanRescueDTGSensor(AlternativeTimeSensorBase):
    """Sensor for displaying German Rescue Date Time Group format."""
    
    # Class-level update interval
    UPDATE_INTERVAL = 1  # Update every second
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the German Rescue DTG sensor with standard 2-parameter signature."""
        super().__init__(base_name, hass)
        
        # Get calendar info
        calendar_name = self._translate('name', 'German Rescue DTG')
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"german_rescue_dtg_{base_name.lower().replace(' ', '_')}"
        
        # Set update interval
        self._update_interval = timedelta(seconds=UPDATE_INTERVAL)
        
        # DTG-specific data
        self._rescue_dtg_data = CALENDAR_INFO.get("rescue_dtg_data", {})
        self._months = self._rescue_dtg_data.get("months", {})
        self._months_international = self._rescue_dtg_data.get("months_international", {})
        self._timezones = self._rescue_dtg_data.get("timezones", {})
        
        # Initialize with defaults
        self._timezone_str = "Europe/Berlin"
        self._month_language = "de"
        self._uppercase = True
        self._show_seconds = False
        self._timezone = None
        self._timezone_initialized = False
        
        # Try to initialize pytz timezone
        if HAS_PYTZ:
            try:
                self._timezone = pytz.timezone(self._timezone_str)
                self._timezone_initialized = True
            except Exception as e:
                _LOGGER.error(f"Failed to initialize default timezone: {e}")
        
        # DTG data storage
        self._dtg_info = {}
        self._state = "Initializing..."
        
        # Debug flag
        self._first_update = True
        
        # Get user's language - will be set properly after HA is initialized
        self._user_language = 'en'  # Default, will be updated in update()
    
    @property
    def state(self) -> str:
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        # Add DTG-specific attributes
        if self._dtg_info:
            attrs.update(self._dtg_info)
            
            # Add description
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add timezone info
            attrs["timezone"] = self._timezone_str
            
            # Add config info
            attrs["config"] = {
                "timezone": self._timezone_str,
                "month_language": self._month_language,
                "uppercase": self._uppercase,
                "show_seconds": self._show_seconds
            }
        
        return attrs
    
    def _get_month_abbreviation(self, month_num: int) -> str:
        """Get month abbreviation based on configured language."""
        month_key = f"{month_num:02d}"
        
        if self._month_language == "local":
            # Use user's language
            language = self._user_language
        else:
            language = self._month_language
        
        # Get months for language
        if language == "de":
            months = self._months
        elif language in self._months_international:
            months = self._months_international[language]
        else:
            # Fallback to English
            months = self._months_international.get("en", self._months)
        
        return months.get(month_key, "UNK")
    
    def _format_rescue_dtg(self, dt: datetime) -> str:
        """Format datetime as German Rescue DTG."""
        # Format: DD HHMM MON YYYY or DD HHMMSS MON YYYY
        day = f"{dt.day:02d}"
        hour = f"{dt.hour:02d}"
        minute = f"{dt.minute:02d}"
        
        if self._show_seconds:
            second = f"{dt.second:02d}"
            time_part = f"{hour}{minute}{second}"
        else:
            time_part = f"{hour}{minute}"
        
        month = self._get_month_abbreviation(dt.month)
        year = f"{dt.year:04d}"
        
        # Build DTG string - NO TIMEZONE
        dtg = f"{day} {time_part} {month} {year}"
        
        # Apply uppercase setting
        if self._uppercase:
            dtg = dtg.upper()
        else:
            dtg = dtg.lower()
        
        return dtg
    
    def _calculate_dtg_info(self, dt: datetime) -> Dict[str, Any]:
        """Calculate DTG information."""
        # Get components
        day = dt.day
        hour = dt.hour
        minute = dt.minute
        second = dt.second
        month_num = dt.month
        year = dt.year
        
        # Get month abbreviation
        month_abbr = self._get_month_abbreviation(month_num)
        
        # Format full DTG
        dtg_display = self._format_rescue_dtg(dt)
        
        # Calculate Julian day
        julian_day = dt.timetuple().tm_yday
        
        # Calculate week number
        week_num = dt.isocalendar()[1]
        
        # Determine if DST is active
        is_dst = False
        if HAS_PYTZ and self._timezone and self._timezone_initialized:
            try:
                is_dst = bool(dt.dst())
            except:
                is_dst = False
        
        result = {
            "dtg": dtg_display,
            "components": {
                "day": day,
                "hour": hour,
                "minute": minute,
                "second": second,
                "month": month_abbr,
                "month_number": month_num,
                "year": year,
                "week_number": week_num
            },
            "julian_day": julian_day,
            "is_dst": is_dst,
            "iso_format": dt.isoformat(),
            "unix_timestamp": int(dt.timestamp()),
            "timezone_info": {
                "timezone": self._timezone_str,
                "abbreviation": dt.strftime("%Z") if HAS_PYTZ and self._timezone else "N/A",
                "offset": dt.strftime("%z") if HAS_PYTZ and self._timezone else "+0000"
            }
        }
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Update user language if not set properly
        if self._user_language == 'en' and self.hass and hasattr(self.hass, 'config'):
            self._user_language = self.hass.config.language if hasattr(self.hass.config, 'language') else 'en'
        
        # Load options on every update
        options = self.get_plugin_options()
        
        # Debug on first update
        if self._first_update:
            if options:
                _LOGGER.info(f"German Rescue DTG sensor options in first update: {options}")
            else:
                _LOGGER.debug("German Rescue DTG sensor using defaults (no options configured)")
            self._first_update = False
        
        # Update configuration
        if options:
            new_timezone = options.get("timezone", "Europe/Berlin")
            self._month_language = options.get("month_language", "de")
            self._uppercase = bool(options.get("uppercase", True))
            self._show_seconds = bool(options.get("show_seconds", False))
            
            # Check if timezone changed
            if new_timezone != self._timezone_str and HAS_PYTZ:
                _LOGGER.info(f"Timezone changed from {self._timezone_str} to {new_timezone}")
                self._timezone_str = new_timezone
                try:
                    self._timezone = pytz.timezone(self._timezone_str)
                    self._timezone_initialized = True
                    
                    # Update name
                    calendar_name = self._translate('name', 'German Rescue DTG')
                    tz_short = self._timezone_str.split('/')[-1]
                    self._attr_name = f"{self._base_name} {calendar_name} ({tz_short})"
                except Exception as e:
                    _LOGGER.error(f"Failed to load timezone {self._timezone_str}: {e}")
                    # Fallback to Berlin
                    self._timezone = pytz.timezone("Europe/Berlin")
                    self._timezone_str = "Europe/Berlin"
        
        # Calculate time based on configuration
        try:
            if HAS_PYTZ and self._timezone and self._timezone_initialized:
                # Use configured timezone
                now = datetime.now(self._timezone)
            else:
                # Fallback to system time
                now = datetime.now()
            
            # Calculate DTG info
            self._dtg_info = self._calculate_dtg_info(now)
            self._state = self._dtg_info["dtg"]
            
        except Exception as e:
            _LOGGER.error(f"Error calculating German Rescue DTG: {e}")
            self._state = "Error"
            self._dtg_info = {"error": str(e)}
        
        _LOGGER.debug(f"Updated German Rescue DTG to {self._state}")


# Required for Home Assistant to discover this calendar
__all__ = ['GermanRescueDTGSensor', 'CALENDAR_INFO']