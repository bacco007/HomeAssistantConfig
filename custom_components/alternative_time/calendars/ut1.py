"""UT1 (Universal Time 1) Calendar implementation - Version 1.0.0.

Uses IERS REST API to fetch current UT1-UTC (DUT1) values.
"""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
import logging
import asyncio
from typing import Dict, Any, Optional

from homeassistant.core import HomeAssistant

try:
    import aiohttp
    HAS_AIOHTTP = True
except ImportError:
    HAS_AIOHTTP = False

from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (1 second for display, but API is cached)
UPDATE_INTERVAL = 1

# IERS REST API endpoint
IERS_API_BASE = "https://datacenter.iers.org/webservice/REST/timescales/RestController.php"

# Cache duration for IERS data (in seconds) - DUT1 changes slowly
IERS_CACHE_DURATION = 3600  # 1 hour

# Fallback DUT1 value if API is unavailable (updated periodically)
# As of July 2025, DUT1 is approximately +0.1s
FALLBACK_DUT1 = 0.1

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "ut1",
    "version": "1.0.0",
    "icon": "mdi:earth",
    "category": "technical",
    "accuracy": "millisecond",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Universal Time 1 (UT1)",
        "de": "Universalzeit 1 (UT1)",
        "es": "Tiempo Universal 1 (UT1)",
        "fr": "Temps Universel 1 (UT1)",
        "it": "Tempo Universale 1 (UT1)",
        "nl": "Universele Tijd 1 (UT1)",
        "pl": "Czas Uniwersalny 1 (UT1)",
        "pt": "Tempo Universal 1 (UT1)",
        "ru": "Всемирное время 1 (UT1)",
        "ja": "世界時1 (UT1)",
        "zh": "世界时1 (UT1)",
        "ko": "세계시 1 (UT1)"
    },
    
    # Translations for compatibility
    "translations": {
        "en": {
            "name": "Universal Time 1 (UT1)",
            "description": "Earth rotation time based on actual rotation. UT1 = UTC + DUT1 (from IERS)"
        },
        "de": {
            "name": "Universalzeit 1 (UT1)",
            "description": "Erdrotationszeit basierend auf tatsächlicher Rotation. UT1 = UTC + DUT1 (von IERS)"
        },
        "es": {
            "name": "Tiempo Universal 1 (UT1)",
            "description": "Tiempo de rotación terrestre basado en rotación real. UT1 = UTC + DUT1 (de IERS)"
        },
        "fr": {
            "name": "Temps Universel 1 (UT1)",
            "description": "Temps de rotation terrestre basé sur la rotation réelle. UT1 = UTC + DUT1 (de l'IERS)"
        },
        "it": {
            "name": "Tempo Universale 1 (UT1)",
            "description": "Tempo di rotazione terrestre basato sulla rotazione reale. UT1 = UTC + DUT1 (da IERS)"
        },
        "nl": {
            "name": "Universele Tijd 1 (UT1)",
            "description": "Aardrotatietijd gebaseerd op werkelijke rotatie. UT1 = UTC + DUT1 (van IERS)"
        },
        "pl": {
            "name": "Czas Uniwersalny 1 (UT1)",
            "description": "Czas rotacji Ziemi oparty na rzeczywistej rotacji. UT1 = UTC + DUT1 (z IERS)"
        },
        "pt": {
            "name": "Tempo Universal 1 (UT1)",
            "description": "Tempo de rotação terrestre baseado na rotação real. UT1 = UTC + DUT1 (do IERS)"
        },
        "ru": {
            "name": "Всемирное время 1 (UT1)",
            "description": "Время вращения Земли на основе фактического вращения. UT1 = UTC + DUT1 (от IERS)"
        },
        "ja": {
            "name": "世界時1 (UT1)",
            "description": "実際の自転に基づく地球自転時間。UT1 = UTC + DUT1（IERSより）"
        },
        "zh": {
            "name": "世界时1 (UT1)",
            "description": "基于实际自转的地球自转时间。UT1 = UTC + DUT1（来自IERS）"
        },
        "ko": {
            "name": "세계시 1 (UT1)",
            "description": "실제 자전을 기반으로 한 지구 자전 시간. UT1 = UTC + DUT1 (IERS 제공)"
        }
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Earth rotation time based on actual rotation. UT1 = UTC + DUT1 (from IERS)",
        "de": "Erdrotationszeit basierend auf tatsächlicher Rotation. UT1 = UTC + DUT1 (von IERS)",
        "es": "Tiempo de rotación terrestre basado en rotación real. UT1 = UTC + DUT1 (de IERS)",
        "fr": "Temps de rotation terrestre basé sur la rotation réelle. UT1 = UTC + DUT1 (de l'IERS)",
        "it": "Tempo di rotazione terrestre basato sulla rotazione reale. UT1 = UTC + DUT1 (da IERS)",
        "nl": "Aardrotatietijd gebaseerd op werkelijke rotatie. UT1 = UTC + DUT1 (van IERS)",
        "pl": "Czas rotacji Ziemi oparty na rzeczywistej rotacji. UT1 = UTC + DUT1 (z IERS)",
        "pt": "Tempo de rotação terrestre baseado na rotação real. UT1 = UTC + DUT1 (do IERS)",
        "ru": "Время вращения Земли на основе фактического вращения. UT1 = UTC + DUT1 (от IERS)",
        "ja": "実際の自転に基づく地球自転時間。UT1 = UTC + DUT1（IERSより）",
        "zh": "基于实际自转的地球自转时间。UT1 = UTC + DUT1（来自IERS）",
        "ko": "실제 자전을 기반으로 한 지구 자전 시간. UT1 = UTC + DUT1 (IERS 제공)"
    },
    
    # Detailed information for documentation
    "detailed_info": {
        "en": {
            "overview": "Universal Time 1 (UT1) is a time standard based on Earth's rotation, representing the actual angle of Earth relative to distant celestial objects",
            "measurement": "Determined by Very Long Baseline Interferometry (VLBI) observations of quasars",
            "relationship": "UT1 = UTC + DUT1, where DUT1 is kept within ±0.9 seconds by leap seconds",
            "variability": "Earth's rotation is irregular due to tides, atmospheric circulation, and internal effects",
            "usage": "Navigation, astronomy, geodesy, and pointing telescopes",
            "authority": "International Earth Rotation and Reference Systems Service (IERS)",
            "precision": "VLBI can determine UT1 to within 15 microseconds",
            "note": "Unlike atomic time scales, UT1 follows Earth's actual rotation"
        },
        "de": {
            "overview": "Universalzeit 1 (UT1) ist ein Zeitstandard basierend auf der Erdrotation, der den tatsächlichen Winkel der Erde relativ zu fernen Himmelskörpern darstellt",
            "measurement": "Bestimmt durch Very Long Baseline Interferometry (VLBI) Beobachtungen von Quasaren",
            "relationship": "UT1 = UTC + DUT1, wobei DUT1 durch Schaltsekunden innerhalb von ±0,9 Sekunden gehalten wird",
            "variability": "Die Erdrotation ist unregelmäßig aufgrund von Gezeiten, atmosphärischer Zirkulation und internen Effekten",
            "usage": "Navigation, Astronomie, Geodäsie und Teleskopausrichtung",
            "authority": "Internationaler Dienst für Erdrotation und Referenzsysteme (IERS)",
            "precision": "VLBI kann UT1 auf 15 Mikrosekunden genau bestimmen",
            "note": "Im Gegensatz zu atomaren Zeitskalen folgt UT1 der tatsächlichen Erdrotation"
        }
    },
    
    # UT1-specific data
    "ut1_data": {
        "definition": "Earth Rotation Angle converted to time",
        "era_formula": "ERA = 2π(0.7790572732640 + 1.00273781191135448 × Tu) radians",
        
        # DUT1 constraints
        "dut1_range": {
            "min": -0.9,
            "max": 0.9,
            "unit": "seconds"
        },
        
        # Related time systems
        "related_systems": {
            "UTC": "Coordinated Universal Time (UT1 = UTC + DUT1)",
            "TAI": "International Atomic Time (uniform, no leap seconds)",
            "UT0": "UT before polar motion correction",
            "UT2": "UT1 with seasonal variations removed (deprecated)",
            "GMST": "Greenwich Mean Sidereal Time"
        },
        
        # Data sources
        "data_sources": {
            "iers_api": IERS_API_BASE,
            "bulletin_a": "https://datacenter.iers.org/availableVersions.php?id=6",
            "bulletin_b": "https://datacenter.iers.org/availableVersions.php?id=207",
            "bulletin_d": "DUT1 announcements"
        },
        
        # Measurement info
        "measurement": {
            "method": "Very Long Baseline Interferometry (VLBI)",
            "precision": "< 15 microseconds",
            "stations": "Global network of radio telescopes"
        }
    },
    
    # Additional metadata
    "reference_url": "https://en.wikipedia.org/wiki/Universal_Time",
    "documentation_url": "https://www.iers.org/IERS/EN/Science/EarthRotation/UT1LOD.html",
    "origin": "International Earth Rotation and Reference Systems Service (IERS)",
    "created_by": "IERS",
    "introduced": "1956 (as distinct from UT0)",
    
    # Example format
    "example": "2024-12-31 12:00:00.123 UT1",
    "example_meaning": "Earth rotation time, typically within 0.9s of UTC",
    
    # Related calendars
    "related": ["tai", "unix", "julian"],
    
    # Tags for searching and filtering
    "tags": [
        "technical", "earth", "rotation", "astronomy", "navigation",
        "geodesy", "vlbi", "iers", "universal", "time"
    ],
    
    # Special features
    "features": {
        "earth_rotation_based": True,
        "variable_rate": True,
        "requires_network": True,
        "iers_data": True,
        "navigation_standard": True
    },
    
    # Configuration options for this calendar
    "config_options": {
        "show_dut1": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show DUT1 value",
                "de": "DUT1-Wert anzeigen",
                "es": "Mostrar valor DUT1",
                "fr": "Afficher la valeur DUT1",
                "it": "Mostra valore DUT1",
                "nl": "DUT1-waarde tonen",
                "pl": "Pokaż wartość DUT1",
                "pt": "Mostrar valor DUT1",
                "ru": "Показать значение DUT1",
                "ja": "DUT1値を表示",
                "zh": "显示DUT1值",
                "ko": "DUT1 값 표시"
            },
            "description": {
                "en": "Display the current UT1-UTC difference (DUT1) in seconds",
                "de": "Zeigt die aktuelle UT1-UTC Differenz (DUT1) in Sekunden an",
                "es": "Muestra la diferencia actual UT1-UTC (DUT1) en segundos",
                "fr": "Affiche la différence actuelle UT1-UTC (DUT1) en secondes",
                "it": "Mostra la differenza attuale UT1-UTC (DUT1) in secondi",
                "nl": "Toont het huidige UT1-UTC verschil (DUT1) in seconden",
                "pl": "Wyświetla bieżącą różnicę UT1-UTC (DUT1) w sekundach",
                "pt": "Mostra a diferença atual UT1-UTC (DUT1) em segundos",
                "ru": "Показывает текущую разницу UT1-UTC (DUT1) в секундах",
                "ja": "現在のUT1-UTC差（DUT1）を秒単位で表示",
                "zh": "以秒为单位显示当前UT1-UTC差值（DUT1）",
                "ko": "현재 UT1-UTC 차이(DUT1)를 초 단위로 표시"
            },
            "translations": {
                "en": {"label": "Show DUT1 value", "description": "Display the current UT1-UTC difference (DUT1) in seconds"},
                "de": {"label": "DUT1-Wert anzeigen", "description": "Zeigt die aktuelle UT1-UTC Differenz (DUT1) in Sekunden an"},
                "es": {"label": "Mostrar valor DUT1", "description": "Muestra la diferencia actual UT1-UTC (DUT1) en segundos"},
                "fr": {"label": "Afficher la valeur DUT1", "description": "Affiche la différence actuelle UT1-UTC (DUT1) en secondes"},
                "it": {"label": "Mostra valore DUT1", "description": "Mostra la differenza attuale UT1-UTC (DUT1) in secondi"},
                "nl": {"label": "DUT1-waarde tonen", "description": "Toont het huidige UT1-UTC verschil (DUT1) in seconden"},
                "pl": {"label": "Pokaż wartość DUT1", "description": "Wyświetla bieżącą różnicę UT1-UTC (DUT1) w sekundach"},
                "pt": {"label": "Mostrar valor DUT1", "description": "Mostra a diferença atual UT1-UTC (DUT1) em segundos"},
                "ru": {"label": "Показать значение DUT1", "description": "Показывает текущую разницу UT1-UTC (DUT1) в секундах"},
                "ja": {"label": "DUT1値を表示", "description": "現在のUT1-UTC差（DUT1）を秒単位で表示"},
                "zh": {"label": "显示DUT1值", "description": "以秒为单位显示当前UT1-UTC差值（DUT1）"},
                "ko": {"label": "DUT1 값 표시", "description": "현재 UT1-UTC 차이(DUT1)를 초 단위로 표시"}
            }
        },
        "show_utc_comparison": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show UTC comparison",
                "de": "UTC-Vergleich anzeigen",
                "es": "Mostrar comparación UTC",
                "fr": "Afficher la comparaison UTC",
                "it": "Mostra confronto UTC",
                "nl": "UTC-vergelijking tonen",
                "pl": "Pokaż porównanie UTC",
                "pt": "Mostrar comparação UTC",
                "ru": "Показать сравнение с UTC",
                "ja": "UTC比較を表示",
                "zh": "显示UTC比较",
                "ko": "UTC 비교 표시"
            },
            "description": {
                "en": "Also display current UTC time for comparison",
                "de": "Auch aktuelle UTC-Zeit zum Vergleich anzeigen",
                "es": "También mostrar hora UTC actual para comparación",
                "fr": "Afficher également l'heure UTC actuelle pour comparaison",
                "it": "Mostra anche l'ora UTC corrente per confronto",
                "nl": "Ook huidige UTC-tijd tonen ter vergelijking",
                "pl": "Również pokaż aktualny czas UTC do porównania",
                "pt": "Também mostrar hora UTC atual para comparação",
                "ru": "Также показать текущее время UTC для сравнения",
                "ja": "比較のため現在のUTC時刻も表示",
                "zh": "同时显示当前UTC时间以便比较",
                "ko": "비교를 위해 현재 UTC 시간도 표시"
            },
            "translations": {
                "en": {"label": "Show UTC comparison", "description": "Also display current UTC time for comparison"},
                "de": {"label": "UTC-Vergleich anzeigen", "description": "Auch aktuelle UTC-Zeit zum Vergleich anzeigen"},
                "es": {"label": "Mostrar comparación UTC", "description": "También mostrar hora UTC actual para comparación"},
                "fr": {"label": "Afficher la comparaison UTC", "description": "Afficher également l'heure UTC actuelle pour comparaison"},
                "it": {"label": "Mostra confronto UTC", "description": "Mostra anche l'ora UTC corrente per confronto"},
                "nl": {"label": "UTC-vergelijking tonen", "description": "Ook huidige UTC-tijd tonen ter vergelijking"},
                "pl": {"label": "Pokaż porównanie UTC", "description": "Również pokaż aktualny czas UTC do porównania"},
                "pt": {"label": "Mostrar comparação UTC", "description": "Também mostrar hora UTC atual para comparação"},
                "ru": {"label": "Показать сравнение с UTC", "description": "Также показать текущее время UTC для сравнения"},
                "ja": {"label": "UTC比較を表示", "description": "比較のため現在のUTC時刻も表示"},
                "zh": {"label": "显示UTC比较", "description": "同时显示当前UTC时间以便比较"},
                "ko": {"label": "UTC 비교 표시", "description": "비교를 위해 현재 UTC 시간도 표시"}
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
                "en": "ISO (2024-12-31T12:00:00) | Time only (12:00:00 UT1) | Full (31 Dec 2024, 12:00:00 UT1)",
                "de": "ISO (2024-12-31T12:00:00) | Nur Zeit (12:00:00 UT1) | Vollständig (31. Dez. 2024, 12:00:00 UT1)",
                "es": "ISO (2024-12-31T12:00:00) | Solo hora (12:00:00 UT1) | Completo (31 Dic 2024, 12:00:00 UT1)",
                "fr": "ISO (2024-12-31T12:00:00) | Heure seule (12:00:00 UT1) | Complet (31 Déc 2024, 12:00:00 UT1)",
                "it": "ISO (2024-12-31T12:00:00) | Solo ora (12:00:00 UT1) | Completo (31 Dic 2024, 12:00:00 UT1)",
                "nl": "ISO (2024-12-31T12:00:00) | Alleen tijd (12:00:00 UT1) | Volledig (31 Dec 2024, 12:00:00 UT1)",
                "pl": "ISO (2024-12-31T12:00:00) | Tylko czas (12:00:00 UT1) | Pełny (31 Gru 2024, 12:00:00 UT1)",
                "pt": "ISO (2024-12-31T12:00:00) | Só hora (12:00:00 UT1) | Completo (31 Dez 2024, 12:00:00 UT1)",
                "ru": "ISO (2024-12-31T12:00:00) | Только время (12:00:00 UT1) | Полный (31 Дек 2024, 12:00:00 UT1)",
                "ja": "ISO (2024-12-31T12:00:00) | 時刻のみ (12:00:00 UT1) | 完全 (2024年12月31日 12:00:00 UT1)",
                "zh": "ISO (2024-12-31T12:00:00) | 仅时间 (12:00:00 UT1) | 完整 (2024年12月31日 12:00:00 UT1)",
                "ko": "ISO (2024-12-31T12:00:00) | 시간만 (12:00:00 UT1) | 전체 (2024년 12월 31일 12:00:00 UT1)"
            },
            "translations": {
                "en": {"label": "Time Format", "description": "ISO (2024-12-31T12:00:00) | Time only (12:00:00 UT1) | Full (31 Dec 2024, 12:00:00 UT1)"},
                "de": {"label": "Zeitformat", "description": "ISO (2024-12-31T12:00:00) | Nur Zeit (12:00:00 UT1) | Vollständig (31. Dez. 2024, 12:00:00 UT1)"},
                "es": {"label": "Formato de Hora", "description": "ISO (2024-12-31T12:00:00) | Solo hora (12:00:00 UT1) | Completo (31 Dic 2024, 12:00:00 UT1)"},
                "fr": {"label": "Format d'heure", "description": "ISO (2024-12-31T12:00:00) | Heure seule (12:00:00 UT1) | Complet (31 Déc 2024, 12:00:00 UT1)"},
                "it": {"label": "Formato Orario", "description": "ISO (2024-12-31T12:00:00) | Solo ora (12:00:00 UT1) | Completo (31 Dic 2024, 12:00:00 UT1)"},
                "nl": {"label": "Tijdformaat", "description": "ISO (2024-12-31T12:00:00) | Alleen tijd (12:00:00 UT1) | Volledig (31 Dec 2024, 12:00:00 UT1)"},
                "pl": {"label": "Format czasu", "description": "ISO (2024-12-31T12:00:00) | Tylko czas (12:00:00 UT1) | Pełny (31 Gru 2024, 12:00:00 UT1)"},
                "pt": {"label": "Formato de Hora", "description": "ISO (2024-12-31T12:00:00) | Só hora (12:00:00 UT1) | Completo (31 Dez 2024, 12:00:00 UT1)"},
                "ru": {"label": "Формат времени", "description": "ISO (2024-12-31T12:00:00) | Только время (12:00:00 UT1) | Полный (31 Дек 2024, 12:00:00 UT1)"},
                "ja": {"label": "時刻形式", "description": "ISO (2024-12-31T12:00:00) | 時刻のみ (12:00:00 UT1) | 完全 (2024年12月31日 12:00:00 UT1)"},
                "zh": {"label": "时间格式", "description": "ISO (2024-12-31T12:00:00) | 仅时间 (12:00:00 UT1) | 完整 (2024年12月31日 12:00:00 UT1)"},
                "ko": {"label": "시간 형식", "description": "ISO (2024-12-31T12:00:00) | 시간만 (12:00:00 UT1) | 전체 (2024년 12월 31일 12:00:00 UT1)"}
            }
        },
        "cache_duration": {
            "type": "number",
            "default": 3600,
            "min": 300,
            "max": 86400,
            "label": {
                "en": "IERS Cache Duration (seconds)",
                "de": "IERS-Cache-Dauer (Sekunden)",
                "es": "Duración de caché IERS (segundos)",
                "fr": "Durée du cache IERS (secondes)",
                "it": "Durata cache IERS (secondi)",
                "nl": "IERS-cache duur (seconden)",
                "pl": "Czas pamięci podręcznej IERS (sekundy)",
                "pt": "Duração do cache IERS (segundos)",
                "ru": "Длительность кэша IERS (секунды)",
                "ja": "IERSキャッシュ期間（秒）",
                "zh": "IERS缓存持续时间（秒）",
                "ko": "IERS 캐시 지속 시간(초)"
            },
            "description": {
                "en": "How long to cache IERS data (300-86400 seconds). DUT1 changes slowly.",
                "de": "Wie lange IERS-Daten zwischengespeichert werden (300-86400 Sekunden). DUT1 ändert sich langsam.",
                "es": "Tiempo de caché de datos IERS (300-86400 segundos). DUT1 cambia lentamente.",
                "fr": "Durée de mise en cache des données IERS (300-86400 secondes). DUT1 change lentement.",
                "it": "Quanto tempo memorizzare i dati IERS (300-86400 secondi). DUT1 cambia lentamente.",
                "nl": "Hoe lang IERS-gegevens in cache bewaren (300-86400 seconden). DUT1 verandert langzaam.",
                "pl": "Jak długo przechowywać dane IERS (300-86400 sekund). DUT1 zmienia się powoli.",
                "pt": "Quanto tempo armazenar dados IERS em cache (300-86400 segundos). DUT1 muda lentamente.",
                "ru": "Как долго кэшировать данные IERS (300-86400 секунд). DUT1 меняется медленно.",
                "ja": "IERSデータのキャッシュ期間（300-86400秒）。DUT1はゆっくり変化します。",
                "zh": "IERS数据缓存时长（300-86400秒）。DUT1变化缓慢。",
                "ko": "IERS 데이터 캐시 기간(300-86400초). DUT1은 천천히 변합니다."
            },
            "translations": {
                "en": {"label": "IERS Cache Duration (seconds)", "description": "How long to cache IERS data (300-86400 seconds). DUT1 changes slowly."},
                "de": {"label": "IERS-Cache-Dauer (Sekunden)", "description": "Wie lange IERS-Daten zwischengespeichert werden (300-86400 Sekunden). DUT1 ändert sich langsam."},
                "es": {"label": "Duración de caché IERS (segundos)", "description": "Tiempo de caché de datos IERS (300-86400 segundos). DUT1 cambia lentamente."},
                "fr": {"label": "Durée du cache IERS (secondes)", "description": "Durée de mise en cache des données IERS (300-86400 secondes). DUT1 change lentement."},
                "it": {"label": "Durata cache IERS (secondi)", "description": "Quanto tempo memorizzare i dati IERS (300-86400 secondi). DUT1 cambia lentamente."},
                "nl": {"label": "IERS-cache duur (seconden)", "description": "Hoe lang IERS-gegevens in cache bewaren (300-86400 seconden). DUT1 verandert langzaam."},
                "pl": {"label": "Czas pamięci podręcznej IERS (sekundy)", "description": "Jak długo przechowywać dane IERS (300-86400 sekund). DUT1 zmienia się powoli."},
                "pt": {"label": "Duração do cache IERS (segundos)", "description": "Quanto tempo armazenar dados IERS em cache (300-86400 segundos). DUT1 muda lentamente."},
                "ru": {"label": "Длительность кэша IERS (секунды)", "description": "Как долго кэшировать данные IERS (300-86400 секунд). DUT1 меняется медленно."},
                "ja": {"label": "IERSキャッシュ期間（秒）", "description": "IERSデータのキャッシュ期間（300-86400秒）。DUT1はゆっくり変化します。"},
                "zh": {"label": "IERS缓存持续时间（秒）", "description": "IERS数据缓存时长（300-86400秒）。DUT1变化缓慢。"},
                "ko": {"label": "IERS 캐시 지속 시간(초)", "description": "IERS 데이터 캐시 기간(300-86400초). DUT1은 천천히 변합니다."}
            }
        }
    }
}


class Ut1TimeSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Universal Time 1 (UT1) with IERS data."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the UT1 time sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Universal Time 1 (UT1)')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_ut1"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:earth")
        
        # Configuration options with defaults from CALENDAR_INFO
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._show_dut1 = config_defaults.get("show_dut1", {}).get("default", True)
        self._show_utc_comparison = config_defaults.get("show_utc_comparison", {}).get("default", True)
        self._time_format = config_defaults.get("time_format", {}).get("default", "iso")
        self._cache_duration = config_defaults.get("cache_duration", {}).get("default", IERS_CACHE_DURATION)
        
        # UT1 data
        self._ut1_data = CALENDAR_INFO["ut1_data"]
        
        # IERS data cache
        self._dut1_value: float = FALLBACK_DUT1  # Current DUT1 (UT1-UTC) in seconds
        self._dut1_last_fetch: Optional[datetime] = None
        self._dut1_source: str = "fallback"  # "iers_api", "fallback", "cached"
        self._iers_fetch_lock = asyncio.Lock()
        
        # Initialize state
        self._state = None
        self._ut1_time = {}
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized UT1 sensor: {self._attr_name}")
        _LOGGER.debug(f"  Initial DUT1: {self._dut1_value}s (source: {self._dut1_source})")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._show_dut1 = options.get("show_dut1", self._show_dut1)
                self._show_utc_comparison = options.get("show_utc_comparison", self._show_utc_comparison)
                self._time_format = options.get("time_format", self._time_format)
                self._cache_duration = options.get("cache_duration", self._cache_duration)
                
                _LOGGER.debug(f"UT1 sensor loaded options: dut1={self._show_dut1}, "
                            f"utc_compare={self._show_utc_comparison}, format={self._time_format}, "
                            f"cache={self._cache_duration}s")
            else:
                _LOGGER.debug("UT1 sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"UT1 sensor could not load options yet: {e}")
    
    async def async_added_to_hass(self) -> None:
        """When entity is added to hass."""
        await super().async_added_to_hass()
        
        # Try to load options now that IDs should be set
        self._load_options()
        
        # Fetch initial IERS data
        await self._async_fetch_iers_data()
        
        # Perform initial update
        await self.async_update()
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes or {}
        
        # Add UT1-specific attributes
        if self._ut1_time:
            attrs.update(self._ut1_time)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add IERS data source info
            attrs["dut1_source"] = self._dut1_source
            if self._dut1_last_fetch:
                attrs["dut1_last_updated"] = self._dut1_last_fetch.isoformat()
            
            # Add current configuration
            attrs["format_setting"] = self._time_format
        
        return attrs
    
    async def _async_fetch_iers_data(self) -> bool:
        """Fetch DUT1 data from IERS REST API.
        
        Returns True if data was successfully fetched, False otherwise.
        """
        if not HAS_AIOHTTP:
            _LOGGER.warning("aiohttp not available, using fallback DUT1 value")
            return False
        
        # Check if cache is still valid
        if self._dut1_last_fetch:
            cache_age = (datetime.now(timezone.utc) - self._dut1_last_fetch).total_seconds()
            if cache_age < self._cache_duration:
                _LOGGER.debug(f"Using cached DUT1 value (age: {cache_age:.0f}s)")
                self._dut1_source = "cached"
                return True
        
        # Use lock to prevent multiple simultaneous fetches
        async with self._iers_fetch_lock:
            # Double-check cache after acquiring lock
            if self._dut1_last_fetch:
                cache_age = (datetime.now(timezone.utc) - self._dut1_last_fetch).total_seconds()
                if cache_age < self._cache_duration:
                    return True
            
            try:
                # Build API URL with proper URL encoding
                import urllib.parse
                now = datetime.now(timezone.utc)
                datetime_str = now.strftime("%Y-%m-%d %H:%M:%S")
                datetime_encoded = urllib.parse.quote(datetime_str)
                url = f"{IERS_API_BASE}?param=UT1-UTC&datetime={datetime_encoded}"
                
                _LOGGER.debug(f"Fetching IERS data from: {url}")
                
                # Create timeout
                timeout = aiohttp.ClientTimeout(total=10)
                
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.get(url, headers={"Accept": "application/json"}) as response:
                        if response.status == 200:
                            # Try to parse JSON response
                            try:
                                data = await response.json()
                                # The IERS API returns value in seconds
                                if "value" in data:
                                    self._dut1_value = float(data["value"])
                                    self._dut1_last_fetch = datetime.now(timezone.utc)
                                    self._dut1_source = "iers_api"
                                    _LOGGER.info(f"Successfully fetched DUT1 from IERS: {self._dut1_value}s")
                                    return True
                            except (ValueError, KeyError) as e:
                                _LOGGER.warning(f"Failed to parse IERS JSON response: {e}")
                                # Try text parsing as fallback
                                text = await response.text()
                                _LOGGER.debug(f"IERS response text: {text[:200]}")
                        else:
                            _LOGGER.warning(f"IERS API returned status {response.status}")
                
            except asyncio.TimeoutError:
                _LOGGER.warning("IERS API request timed out")
            except aiohttp.ClientError as e:
                _LOGGER.warning(f"IERS API request failed: {e}")
            except Exception as e:
                _LOGGER.error(f"Unexpected error fetching IERS data: {e}", exc_info=True)
        
        # If we get here, fetch failed - use fallback
        if self._dut1_source != "cached":
            self._dut1_source = "fallback"
            _LOGGER.info(f"Using fallback DUT1 value: {self._dut1_value}s")
        
        return False
    
    def _calculate_ut1_time(self, utc_time: datetime) -> Dict[str, Any]:
        """Calculate UT1 from UTC time using DUT1.
        
        UT1 = UTC + DUT1
        """
        # Ensure we're working with UTC
        if utc_time.tzinfo is None:
            utc_time = utc_time.replace(tzinfo=timezone.utc)
        else:
            utc_time = utc_time.astimezone(timezone.utc)
        
        # Calculate UT1 by adding DUT1 to UTC
        # DUT1 = UT1 - UTC, so UT1 = UTC + DUT1
        ut1_time = utc_time + timedelta(seconds=self._dut1_value)
        
        # Format based on user preference
        if self._time_format == "time_only":
            formatted = ut1_time.strftime("%H:%M:%S.%f")[:-3] + " UT1"
        elif self._time_format == "full":
            formatted = ut1_time.strftime("%d %b %Y, %H:%M:%S.%f")[:-3] + " UT1"
        else:  # iso (default)
            formatted = ut1_time.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + " UT1"
        
        # Calculate Earth Rotation Angle (ERA)
        # ERA = 2π(0.7790572732640 + 1.00273781191135448 × Tu) radians
        # where Tu = Julian UT1 date - 2451545.0
        j2000 = datetime(2000, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        days_since_j2000 = (ut1_time - j2000).total_seconds() / 86400.0
        tu = days_since_j2000
        
        import math
        era_radians = 2 * math.pi * (0.7790572732640 + 1.00273781191135448 * tu)
        era_radians = era_radians % (2 * math.pi)  # Normalize to [0, 2π]
        era_degrees = math.degrees(era_radians)
        
        # Calculate Greenwich Mean Sidereal Time approximation
        # GMST ≈ ERA (for most practical purposes)
        gmst_hours = (era_degrees / 15.0)  # Convert degrees to hours
        gmst_h = int(gmst_hours)
        gmst_m = int((gmst_hours - gmst_h) * 60)
        gmst_s = ((gmst_hours - gmst_h) * 60 - gmst_m) * 60
        
        result = {
            "ut1_datetime": ut1_time.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] + " UT1",
            "ut1_iso": ut1_time.isoformat(),
            "formatted": formatted,
            "dut1_seconds": round(self._dut1_value, 4),
            "dut1_milliseconds": round(self._dut1_value * 1000, 1),
            "earth_rotation_angle_deg": round(era_degrees, 6),
            "earth_rotation_angle_rad": round(era_radians, 6),
            "gmst_approx": f"{gmst_h:02d}:{gmst_m:02d}:{gmst_s:05.2f}",
            "days_since_j2000": round(days_since_j2000, 6)
        }
        
        # Add DUT1 display if enabled
        if self._show_dut1:
            sign = "+" if self._dut1_value >= 0 else ""
            result["dut1_display"] = f"DUT1 = {sign}{self._dut1_value:.3f}s"
            result["ut1_utc_relation"] = f"UT1 = UTC {sign}{self._dut1_value:.3f}s"
        
        # Add UTC comparison if enabled
        if self._show_utc_comparison:
            result["utc_datetime"] = utc_time.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] + " UTC"
            result["utc_iso"] = utc_time.isoformat()
            
            # Show the difference clearly
            diff_ms = self._dut1_value * 1000
            if diff_ms >= 0:
                result["comparison"] = f"UT1 is {abs(diff_ms):.1f}ms ahead of UTC"
            else:
                result["comparison"] = f"UT1 is {abs(diff_ms):.1f}ms behind UTC"
        
        return result
    
    def update(self) -> None:
        """Update the sensor (synchronous version)."""
        # Ensure options are loaded
        if not self._options_loaded:
            self._load_options()
        
        try:
            now = datetime.now(timezone.utc)
            self._ut1_time = self._calculate_ut1_time(now)
            
            # Set state to formatted UT1 time
            self._state = self._ut1_time.get("formatted", "UT1 ERROR")
            
            _LOGGER.debug(f"Updated UT1 to {self._state} (DUT1: {self._dut1_value}s)")
        except Exception as e:
            _LOGGER.error(f"Error updating UT1: {e}", exc_info=True)
            self._state = "UT1 ERROR"
    
    async def async_update(self) -> None:
        """Update sensor asynchronously."""
        # Ensure options are loaded
        if not self._options_loaded:
            self._load_options()
        
        # Try to refresh IERS data if cache expired
        await self._async_fetch_iers_data()
        
        # Run time calculation
        await self.hass.async_add_executor_job(self.update)
