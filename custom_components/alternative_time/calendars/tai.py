"""TAI (International Atomic Time) Calendar implementation - Version 1.0.0."""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
import logging
from typing import Dict, Any

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (1 second for live timestamp)
UPDATE_INTERVAL = 1

# Current TAI-UTC offset (leap seconds as of 2017-01-01)
# TAI = UTC + TAI_UTC_OFFSET
# This value should be updated when new leap seconds are announced
TAI_UTC_OFFSET = 37  # seconds

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "tai",
    "version": "1.0.0",
    "icon": "mdi:atom",
    "category": "technical",
    "accuracy": "nanosecond",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "International Atomic Time (TAI)",
        "de": "Internationale Atomzeit (TAI)",
        "es": "Tiempo Atómico Internacional (TAI)",
        "fr": "Temps Atomique International (TAI)",
        "it": "Tempo Atomico Internazionale (TAI)",
        "nl": "Internationale Atoomtijd (TAI)",
        "pl": "Międzynarodowy Czas Atomowy (TAI)",
        "pt": "Tempo Atômico Internacional (TAI)",
        "ru": "Международное атомное время (TAI)",
        "ja": "国際原子時 (TAI)",
        "zh": "国际原子时 (TAI)",
        "ko": "국제원자시 (TAI)"
    },
    
    # Translations for compatibility
    "translations": {
        "en": {
            "name": "International Atomic Time (TAI)",
            "description": "High-precision atomic time scale. TAI = UTC + 37 seconds (no leap seconds)"
        },
        "de": {
            "name": "Internationale Atomzeit (TAI)",
            "description": "Hochpräzise atomare Zeitskala. TAI = UTC + 37 Sekunden (keine Schaltsekunden)"
        },
        "es": {
            "name": "Tiempo Atómico Internacional (TAI)",
            "description": "Escala de tiempo atómico de alta precisión. TAI = UTC + 37 segundos (sin segundos intercalares)"
        },
        "fr": {
            "name": "Temps Atomique International (TAI)",
            "description": "Échelle de temps atomique de haute précision. TAI = UTC + 37 secondes (pas de secondes intercalaires)"
        },
        "it": {
            "name": "Tempo Atomico Internazionale (TAI)",
            "description": "Scala temporale atomica ad alta precisione. TAI = UTC + 37 secondi (nessun secondo intercalare)"
        },
        "nl": {
            "name": "Internationale Atoomtijd (TAI)",
            "description": "Hoogprecisie atomaire tijdschaal. TAI = UTC + 37 seconden (geen schrikkelseconden)"
        },
        "pl": {
            "name": "Międzynarodowy Czas Atomowy (TAI)",
            "description": "Wysokoprecyzyjna atomowa skala czasu. TAI = UTC + 37 sekund (bez sekund przestępnych)"
        },
        "pt": {
            "name": "Tempo Atômico Internacional (TAI)",
            "description": "Escala de tempo atômico de alta precisão. TAI = UTC + 37 segundos (sem segundos bissextos)"
        },
        "ru": {
            "name": "Международное атомное время (TAI)",
            "description": "Высокоточная атомная шкала времени. TAI = UTC + 37 секунд (без високосных секунд)"
        },
        "ja": {
            "name": "国際原子時 (TAI)",
            "description": "高精度原子時間スケール。TAI = UTC + 37秒（うるう秒なし）"
        },
        "zh": {
            "name": "国际原子时 (TAI)",
            "description": "高精度原子时间尺度。TAI = UTC + 37秒（无闰秒）"
        },
        "ko": {
            "name": "국제원자시 (TAI)",
            "description": "고정밀 원자 시간 척도. TAI = UTC + 37초 (윤초 없음)"
        }
    },
    
    # Short descriptions for UI
    "description": {
        "en": "High-precision atomic time scale. TAI = UTC + 37 seconds (no leap seconds)",
        "de": "Hochpräzise atomare Zeitskala. TAI = UTC + 37 Sekunden (keine Schaltsekunden)",
        "es": "Escala de tiempo atómico de alta precisión. TAI = UTC + 37 segundos (sin segundos intercalares)",
        "fr": "Échelle de temps atomique de haute précision. TAI = UTC + 37 secondes (pas de secondes intercalaires)",
        "it": "Scala temporale atomica ad alta precisione. TAI = UTC + 37 secondi (nessun secondo intercalare)",
        "nl": "Hoogprecisie atomaire tijdschaal. TAI = UTC + 37 seconden (geen schrikkelseconden)",
        "pl": "Wysokoprecyzyjna atomowa skala czasu. TAI = UTC + 37 sekund (bez sekund przestępnych)",
        "pt": "Escala de tempo atômico de alta precisão. TAI = UTC + 37 segundos (sem segundos bissextos)",
        "ru": "Высокоточная атомная шкала времени. TAI = UTC + 37 секунд (без високосных секунд)",
        "ja": "高精度原子時間スケール。TAI = UTC + 37秒（うるう秒なし）",
        "zh": "高精度原子时间尺度。TAI = UTC + 37秒（无闰秒）",
        "ko": "고정밀 원자 시간 척도. TAI = UTC + 37초 (윤초 없음)"
    },
    
    # Detailed information for documentation
    "detailed_info": {
        "en": {
            "overview": "International Atomic Time (TAI) is a high-precision atomic coordinate time standard based on the notional passage of proper time on Earth's geoid",
            "epoch": "January 1, 1958, 00:00:00 UT2",
            "structure": "Continuous time scale without leap seconds, defined by averaging over 450+ atomic clocks worldwide",
            "relationship": "TAI = UTC + leap seconds (currently 37 seconds ahead of UTC)",
            "usage": "Scientific research, GPS systems, international timekeeping, precision metrology",
            "precision": "Better than 1 nanosecond per day",
            "authority": "Bureau International des Poids et Mesures (BIPM)",
            "note": "TAI continues uninterrupted while UTC adjusts for Earth's irregular rotation"
        },
        "de": {
            "overview": "Die Internationale Atomzeit (TAI) ist ein hochpräziser atomarer Koordinatenzeit-Standard basierend auf dem nominellen Ablauf der Eigenzeit auf dem Erdgeoid",
            "epoch": "1. Januar 1958, 00:00:00 UT2",
            "structure": "Kontinuierliche Zeitskala ohne Schaltsekunden, definiert durch Mittelung über 450+ Atomuhren weltweit",
            "relationship": "TAI = UTC + Schaltsekunden (derzeit 37 Sekunden vor UTC)",
            "usage": "Wissenschaftliche Forschung, GPS-Systeme, internationale Zeitmessung, Präzisionsmetrologie",
            "precision": "Besser als 1 Nanosekunde pro Tag",
            "authority": "Bureau International des Poids et Mesures (BIPM)",
            "note": "TAI läuft ununterbrochen weiter, während UTC für die unregelmäßige Erdrotation angepasst wird"
        }
    },
    
    # TAI-specific data
    "tai_data": {
        "epoch": {
            "date": "1958-01-01 00:00:00 UT2",
            "description": "TAI Epoch - Beginning of International Atomic Time"
        },
        
        # Current TAI-UTC offset
        "current_offset": TAI_UTC_OFFSET,
        
        # Leap second history (when leap seconds were introduced)
        "leap_second_history": {
            "1972-01-01": 10,  # Initial offset when UTC started
            "1972-07-01": 11,
            "1973-01-01": 12,
            "1974-01-01": 13,
            "1975-01-01": 14,
            "1976-01-01": 15,
            "1977-01-01": 16,
            "1978-01-01": 17,
            "1979-01-01": 18,
            "1980-01-01": 19,
            "1981-07-01": 20,
            "1982-07-01": 21,
            "1983-07-01": 22,
            "1985-07-01": 23,
            "1988-01-01": 24,
            "1990-01-01": 25,
            "1991-01-01": 26,
            "1992-07-01": 27,
            "1993-07-01": 28,
            "1994-07-01": 29,
            "1996-01-01": 30,
            "1997-07-01": 31,
            "1999-01-01": 32,
            "2006-01-01": 33,
            "2009-01-01": 34,
            "2012-07-01": 35,
            "2015-07-01": 36,
            "2017-01-01": 37
        },
        
        # Related time systems
        "related_systems": {
            "UTC": "Coordinated Universal Time (UTC = TAI - leap seconds)",
            "GPS": "GPS Time (GPS = TAI - 19 seconds, no leap seconds since 1980)",
            "TT": "Terrestrial Time (TT = TAI + 32.184 seconds)",
            "TCG": "Geocentric Coordinate Time",
            "TCB": "Barycentric Coordinate Time"
        },
        
        # Precision info
        "precision": {
            "clocks": "450+ atomic clocks worldwide",
            "accuracy": "< 1 nanosecond/day",
            "definition": "Based on cesium-133 hyperfine transition"
        }
    },
    
    # Additional metadata
    "reference_url": "https://en.wikipedia.org/wiki/International_Atomic_Time",
    "documentation_url": "https://www.bipm.org/en/time-metrology",
    "origin": "Bureau International des Poids et Mesures (BIPM)",
    "created_by": "BIPM",
    "introduced": "January 1, 1958",
    
    # Example format
    "example": "2024-12-31 12:00:37 TAI",
    "example_meaning": "37 seconds ahead of UTC (due to accumulated leap seconds)",
    
    # Related calendars
    "related": ["unix", "julian", "swatch"],
    
    # Tags for searching and filtering
    "tags": [
        "technical", "atomic", "precision", "scientific", "gps",
        "timekeeping", "metrology", "physics", "bipm", "cesium"
    ],
    
    # Special features
    "features": {
        "continuous_count": True,
        "no_leap_seconds": True,
        "atomic_precision": True,
        "gps_compatible": True,
        "scientific_standard": True
    },
    
    # Configuration options for this calendar
    "config_options": {
        "show_utc_offset": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show UTC offset",
                "de": "UTC-Offset anzeigen",
                "es": "Mostrar diferencia con UTC",
                "fr": "Afficher le décalage UTC",
                "it": "Mostra differenza UTC",
                "nl": "Toon UTC-verschil",
                "pl": "Pokaż różnicę UTC",
                "pt": "Mostrar diferença UTC",
                "ru": "Показать смещение от UTC",
                "ja": "UTCとの差を表示",
                "zh": "显示UTC偏移",
                "ko": "UTC 오프셋 표시"
            },
            "description": {
                "en": "Display the current TAI-UTC offset in seconds",
                "de": "Zeigt den aktuellen TAI-UTC Offset in Sekunden an",
                "es": "Muestra la diferencia actual TAI-UTC en segundos",
                "fr": "Affiche le décalage actuel TAI-UTC en secondes",
                "it": "Mostra la differenza attuale TAI-UTC in secondi",
                "nl": "Toont het huidige TAI-UTC verschil in seconden",
                "pl": "Wyświetla bieżącą różnicę TAI-UTC w sekundach",
                "pt": "Mostra a diferença atual TAI-UTC em segundos",
                "ru": "Показывает текущее смещение TAI-UTC в секундах",
                "ja": "現在のTAI-UTC差を秒単位で表示",
                "zh": "以秒为单位显示当前TAI-UTC偏移",
                "ko": "현재 TAI-UTC 오프셋을 초 단위로 표시"
            },
            "translations": {
                "en": {
                    "label": "Show UTC offset",
                    "description": "Display the current TAI-UTC offset in seconds"
                },
                "de": {
                    "label": "UTC-Offset anzeigen",
                    "description": "Zeigt den aktuellen TAI-UTC Offset in Sekunden an"
                },
                "es": {
                    "label": "Mostrar diferencia con UTC",
                    "description": "Muestra la diferencia actual TAI-UTC en segundos"
                },
                "fr": {
                    "label": "Afficher le décalage UTC",
                    "description": "Affiche le décalage actuel TAI-UTC en secondes"
                },
                "it": {
                    "label": "Mostra differenza UTC",
                    "description": "Mostra la differenza attuale TAI-UTC in secondi"
                },
                "nl": {
                    "label": "Toon UTC-verschil",
                    "description": "Toont het huidige TAI-UTC verschil in seconden"
                },
                "pl": {
                    "label": "Pokaż różnicę UTC",
                    "description": "Wyświetla bieżącą różnicę TAI-UTC w sekundach"
                },
                "pt": {
                    "label": "Mostrar diferença UTC",
                    "description": "Mostra a diferença atual TAI-UTC em segundos"
                },
                "ru": {
                    "label": "Показать смещение от UTC",
                    "description": "Показывает текущее смещение TAI-UTC в секундах"
                },
                "ja": {
                    "label": "UTCとの差を表示",
                    "description": "現在のTAI-UTC差を秒単位で表示"
                },
                "zh": {
                    "label": "显示UTC偏移",
                    "description": "以秒为单位显示当前TAI-UTC偏移"
                },
                "ko": {
                    "label": "UTC 오프셋 표시",
                    "description": "현재 TAI-UTC 오프셋을 초 단위로 표시"
                }
            }
        },
        "show_gps_time": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show GPS Time",
                "de": "GPS-Zeit anzeigen",
                "es": "Mostrar Hora GPS",
                "fr": "Afficher l'heure GPS",
                "it": "Mostra Ora GPS",
                "nl": "GPS-tijd tonen",
                "pl": "Pokaż czas GPS",
                "pt": "Mostrar Hora GPS",
                "ru": "Показать время GPS",
                "ja": "GPS時刻を表示",
                "zh": "显示GPS时间",
                "ko": "GPS 시간 표시"
            },
            "description": {
                "en": "Also display GPS Time (TAI - 19 seconds)",
                "de": "Auch GPS-Zeit anzeigen (TAI - 19 Sekunden)",
                "es": "También mostrar Hora GPS (TAI - 19 segundos)",
                "fr": "Afficher également l'heure GPS (TAI - 19 secondes)",
                "it": "Mostra anche Ora GPS (TAI - 19 secondi)",
                "nl": "Ook GPS-tijd tonen (TAI - 19 seconden)",
                "pl": "Również pokaż czas GPS (TAI - 19 sekund)",
                "pt": "Também mostrar Hora GPS (TAI - 19 segundos)",
                "ru": "Также показать время GPS (TAI - 19 секунд)",
                "ja": "GPS時刻も表示（TAI - 19秒）",
                "zh": "同时显示GPS时间（TAI - 19秒）",
                "ko": "GPS 시간도 표시 (TAI - 19초)"
            },
            "translations": {
                "en": {
                    "label": "Show GPS Time",
                    "description": "Also display GPS Time (TAI - 19 seconds)"
                },
                "de": {
                    "label": "GPS-Zeit anzeigen",
                    "description": "Auch GPS-Zeit anzeigen (TAI - 19 Sekunden)"
                },
                "es": {
                    "label": "Mostrar Hora GPS",
                    "description": "También mostrar Hora GPS (TAI - 19 segundos)"
                },
                "fr": {
                    "label": "Afficher l'heure GPS",
                    "description": "Afficher également l'heure GPS (TAI - 19 secondes)"
                },
                "it": {
                    "label": "Mostra Ora GPS",
                    "description": "Mostra anche Ora GPS (TAI - 19 secondi)"
                },
                "nl": {
                    "label": "GPS-tijd tonen",
                    "description": "Ook GPS-tijd tonen (TAI - 19 seconden)"
                },
                "pl": {
                    "label": "Pokaż czas GPS",
                    "description": "Również pokaż czas GPS (TAI - 19 sekund)"
                },
                "pt": {
                    "label": "Mostrar Hora GPS",
                    "description": "Também mostrar Hora GPS (TAI - 19 segundos)"
                },
                "ru": {
                    "label": "Показать время GPS",
                    "description": "Также показать время GPS (TAI - 19 секунд)"
                },
                "ja": {
                    "label": "GPS時刻を表示",
                    "description": "GPS時刻も表示（TAI - 19秒）"
                },
                "zh": {
                    "label": "显示GPS时间",
                    "description": "同时显示GPS时间（TAI - 19秒）"
                },
                "ko": {
                    "label": "GPS 시간 표시",
                    "description": "GPS 시간도 표시 (TAI - 19초)"
                }
            }
        },
        "time_format": {
            "type": "select",
            "default": "iso",
            "options": ["iso", "time_only", "full"],
            "label": {
                "en": "Time Format",
                "de": "Zeitformat",
                "es": "Formato de Hora",
                "fr": "Format d'heure",
                "it": "Formato Orario",
                "nl": "Tijdformaat",
                "pl": "Format czasu",
                "pt": "Formato de Hora",
                "ru": "Формат времени",
                "ja": "時刻形式",
                "zh": "时间格式",
                "ko": "시간 형식"
            },
            "description": {
                "en": "ISO (2024-12-31T12:00:37) | Time only (12:00:37 TAI) | Full (31 Dec 2024, 12:00:37 TAI)",
                "de": "ISO (2024-12-31T12:00:37) | Nur Zeit (12:00:37 TAI) | Vollständig (31. Dez. 2024, 12:00:37 TAI)",
                "es": "ISO (2024-12-31T12:00:37) | Solo hora (12:00:37 TAI) | Completo (31 Dic 2024, 12:00:37 TAI)",
                "fr": "ISO (2024-12-31T12:00:37) | Heure seule (12:00:37 TAI) | Complet (31 Déc 2024, 12:00:37 TAI)",
                "it": "ISO (2024-12-31T12:00:37) | Solo ora (12:00:37 TAI) | Completo (31 Dic 2024, 12:00:37 TAI)",
                "nl": "ISO (2024-12-31T12:00:37) | Alleen tijd (12:00:37 TAI) | Volledig (31 Dec 2024, 12:00:37 TAI)",
                "pl": "ISO (2024-12-31T12:00:37) | Tylko czas (12:00:37 TAI) | Pełny (31 Gru 2024, 12:00:37 TAI)",
                "pt": "ISO (2024-12-31T12:00:37) | Só hora (12:00:37 TAI) | Completo (31 Dez 2024, 12:00:37 TAI)",
                "ru": "ISO (2024-12-31T12:00:37) | Только время (12:00:37 TAI) | Полный (31 Дек 2024, 12:00:37 TAI)",
                "ja": "ISO (2024-12-31T12:00:37) | 時刻のみ (12:00:37 TAI) | 完全 (2024年12月31日 12:00:37 TAI)",
                "zh": "ISO (2024-12-31T12:00:37) | 仅时间 (12:00:37 TAI) | 完整 (2024年12月31日 12:00:37 TAI)",
                "ko": "ISO (2024-12-31T12:00:37) | 시간만 (12:00:37 TAI) | 전체 (2024년 12월 31일 12:00:37 TAI)"
            },
            "translations": {
                "en": {
                    "label": "Time Format",
                    "description": "ISO (2024-12-31T12:00:37) | Time only (12:00:37 TAI) | Full (31 Dec 2024, 12:00:37 TAI)"
                },
                "de": {
                    "label": "Zeitformat",
                    "description": "ISO (2024-12-31T12:00:37) | Nur Zeit (12:00:37 TAI) | Vollständig (31. Dez. 2024, 12:00:37 TAI)"
                },
                "es": {
                    "label": "Formato de Hora",
                    "description": "ISO (2024-12-31T12:00:37) | Solo hora (12:00:37 TAI) | Completo (31 Dic 2024, 12:00:37 TAI)"
                },
                "fr": {
                    "label": "Format d'heure",
                    "description": "ISO (2024-12-31T12:00:37) | Heure seule (12:00:37 TAI) | Complet (31 Déc 2024, 12:00:37 TAI)"
                },
                "it": {
                    "label": "Formato Orario",
                    "description": "ISO (2024-12-31T12:00:37) | Solo ora (12:00:37 TAI) | Completo (31 Dic 2024, 12:00:37 TAI)"
                },
                "nl": {
                    "label": "Tijdformaat",
                    "description": "ISO (2024-12-31T12:00:37) | Alleen tijd (12:00:37 TAI) | Volledig (31 Dec 2024, 12:00:37 TAI)"
                },
                "pl": {
                    "label": "Format czasu",
                    "description": "ISO (2024-12-31T12:00:37) | Tylko czas (12:00:37 TAI) | Pełny (31 Gru 2024, 12:00:37 TAI)"
                },
                "pt": {
                    "label": "Formato de Hora",
                    "description": "ISO (2024-12-31T12:00:37) | Só hora (12:00:37 TAI) | Completo (31 Dez 2024, 12:00:37 TAI)"
                },
                "ru": {
                    "label": "Формат времени",
                    "description": "ISO (2024-12-31T12:00:37) | Только время (12:00:37 TAI) | Полный (31 Дек 2024, 12:00:37 TAI)"
                },
                "ja": {
                    "label": "時刻形式",
                    "description": "ISO (2024-12-31T12:00:37) | 時刻のみ (12:00:37 TAI) | 完全 (2024年12月31日 12:00:37 TAI)"
                },
                "zh": {
                    "label": "时间格式",
                    "description": "ISO (2024-12-31T12:00:37) | 仅时间 (12:00:37 TAI) | 完整 (2024年12月31日 12:00:37 TAI)"
                },
                "ko": {
                    "label": "시간 형식",
                    "description": "ISO (2024-12-31T12:00:37) | 시간만 (12:00:37 TAI) | 전체 (2024년 12월 31일 12:00:37 TAI)"
                }
            }
        }
    }
}


class TaiTimeSensor(AlternativeTimeSensorBase):
    """Sensor for displaying International Atomic Time (TAI)."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    # GPS Time offset from TAI (GPS time started on 1980-01-06 with TAI-GPS = 19 seconds)
    GPS_TAI_OFFSET = 19  # seconds
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the TAI time sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'International Atomic Time (TAI)')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_tai"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:atom")
        
        # Configuration options with defaults from CALENDAR_INFO
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._show_utc_offset = config_defaults.get("show_utc_offset", {}).get("default", True)
        self._show_gps_time = config_defaults.get("show_gps_time", {}).get("default", False)
        self._time_format = config_defaults.get("time_format", {}).get("default", "iso")
        
        # TAI data
        self._tai_data = CALENDAR_INFO["tai_data"]
        self._tai_utc_offset = self._tai_data.get("current_offset", TAI_UTC_OFFSET)
        
        # Initialize state
        self._state = None
        self._tai_time = {}
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized TAI sensor: {self._attr_name}")
        _LOGGER.debug(f"  TAI-UTC offset: {self._tai_utc_offset} seconds")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._show_utc_offset = options.get("show_utc_offset", self._show_utc_offset)
                self._show_gps_time = options.get("show_gps_time", self._show_gps_time)
                self._time_format = options.get("time_format", self._time_format)
                
                _LOGGER.debug(f"TAI sensor loaded options: utc_offset={self._show_utc_offset}, "
                            f"gps_time={self._show_gps_time}, format={self._time_format}")
            else:
                _LOGGER.debug("TAI sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"TAI sensor could not load options yet: {e}")
    
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
        
        # Add TAI-specific attributes
        if self._tai_time:
            attrs.update(self._tai_time)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add epoch information
            attrs["epoch"] = self._tai_data["epoch"]["date"]
            
            # Add current configuration
            attrs["format_setting"] = self._time_format
        
        return attrs
    
    def _calculate_tai_time(self, utc_time: datetime) -> Dict[str, Any]:
        """Calculate TAI from UTC time."""
        
        # Ensure we're working with UTC
        if utc_time.tzinfo is None:
            utc_time = utc_time.replace(tzinfo=timezone.utc)
        else:
            utc_time = utc_time.astimezone(timezone.utc)
        
        # Calculate TAI by adding the leap second offset
        tai_time = utc_time + timedelta(seconds=self._tai_utc_offset)
        
        # Calculate GPS time (TAI - 19 seconds)
        gps_time = tai_time - timedelta(seconds=self.GPS_TAI_OFFSET)
        
        # Calculate Terrestrial Time (TT = TAI + 32.184 seconds)
        tt_offset = 32.184
        tt_time = tai_time + timedelta(seconds=tt_offset)
        
        # Format based on user preference
        if self._time_format == "time_only":
            formatted = tai_time.strftime("%H:%M:%S TAI")
        elif self._time_format == "full":
            formatted = tai_time.strftime("%d %b %Y, %H:%M:%S TAI")
        else:  # iso (default)
            formatted = tai_time.strftime("%Y-%m-%dT%H:%M:%S TAI")
        
        # Calculate Modified Julian Date (MJD)
        # MJD = JD - 2400000.5
        # JD for J2000.0 = 2451545.0 (2000-01-01 12:00:00 TT)
        j2000 = datetime(2000, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        days_since_j2000 = (tai_time - j2000).total_seconds() / 86400.0
        jd = 2451545.0 + days_since_j2000
        mjd = jd - 2400000.5
        
        result = {
            "tai_datetime": tai_time.strftime("%Y-%m-%d %H:%M:%S TAI"),
            "tai_iso": tai_time.isoformat(),
            "utc_datetime": utc_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "formatted": formatted,
            "tai_utc_offset_seconds": self._tai_utc_offset,
            "total_leap_seconds": self._tai_utc_offset,
            "modified_julian_date": round(mjd, 6),
            "julian_date": round(jd, 6)
        }
        
        # Add UTC offset display if enabled
        if self._show_utc_offset:
            result["offset_display"] = f"TAI = UTC + {self._tai_utc_offset}s"
        
        # Add GPS time if enabled
        if self._show_gps_time:
            result["gps_datetime"] = gps_time.strftime("%Y-%m-%d %H:%M:%S GPS")
            result["gps_tai_offset"] = f"GPS = TAI - {self.GPS_TAI_OFFSET}s"
            result["gps_utc_offset"] = self._tai_utc_offset - self.GPS_TAI_OFFSET
        
        # Add Terrestrial Time
        result["tt_datetime"] = tt_time.strftime("%Y-%m-%d %H:%M:%S.%f TT")[:26] + " TT"
        result["tt_offset"] = f"TT = TAI + {tt_offset}s"
        
        # Calculate time since TAI epoch (1958-01-01)
        tai_epoch = datetime(1958, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        seconds_since_epoch = (tai_time - tai_epoch).total_seconds()
        days_since_epoch = int(seconds_since_epoch / 86400)
        years_since_epoch = seconds_since_epoch / (365.25 * 86400)
        
        result["seconds_since_epoch"] = int(seconds_since_epoch)
        result["days_since_epoch"] = days_since_epoch
        result["years_since_epoch"] = round(years_since_epoch, 4)
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded (in case async_added_to_hass hasn't run yet)
        if not self._options_loaded:
            self._load_options()
        
        try:
            now = datetime.now(timezone.utc)
            self._tai_time = self._calculate_tai_time(now)
            
            # Set state to formatted TAI time
            self._state = self._tai_time.get("formatted", "TAI ERROR")
            
            _LOGGER.debug(f"Updated TAI to {self._state}")
        except Exception as e:
            _LOGGER.error(f"Error updating TAI: {e}", exc_info=True)
            self._state = "TAI ERROR"
    
    async def async_update(self) -> None:
        """Update sensor asynchronously."""
        # Run synchronous update in executor
        await self.hass.async_add_executor_job(self.update)
