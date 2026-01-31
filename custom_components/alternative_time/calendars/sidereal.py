"""Sidereal Time Calendar implementation - Version 1.0.0.

Provides Greenwich Mean Sidereal Time (GMST), Greenwich Apparent Sidereal Time (GAST),
Local Mean Sidereal Time (LMST), Local Apparent Sidereal Time (LAST), and
Earth Rotation Angle (ERA).

Formulas based on USNO Circular No. 179 (2005) and IAU 2000 resolutions.
Reference: https://aa.usno.navy.mil/faq/GAST
"""
from __future__ import annotations

from datetime import datetime, timezone
import math
import logging
from typing import Dict, Any

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (1 second for live sidereal time)
UPDATE_INTERVAL = 1

# J2000.0 epoch as Julian Date
J2000_JD = 2451545.0

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "sidereal",
    "version": "1.0.0",
    "icon": "mdi:star-shooting",
    "category": "technical",
    "accuracy": "subsecond",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Sidereal Time",
        "de": "Sternzeit",
        "es": "Tiempo Sidéreo",
        "fr": "Temps Sidéral",
        "it": "Tempo Siderale",
        "nl": "Sterrentijd",
        "pl": "Czas Gwiazdowy",
        "pt": "Tempo Sideral",
        "ru": "Звёздное время",
        "ja": "恒星時",
        "zh": "恒星时",
        "ko": "항성시"
    },
    
    # Translations for compatibility
    "translations": {
        "en": {
            "name": "Sidereal Time",
            "description": "Astronomical time based on Earth's rotation relative to distant stars. Includes GMST, GAST, LMST, LAST, and ERA."
        },
        "de": {
            "name": "Sternzeit",
            "description": "Astronomische Zeit basierend auf der Erdrotation relativ zu fernen Sternen. Enthält GMST, GAST, LMST, LAST und ERA."
        },
        "es": {
            "name": "Tiempo Sidéreo",
            "description": "Tiempo astronómico basado en la rotación de la Tierra relativa a estrellas distantes. Incluye GMST, GAST, LMST, LAST y ERA."
        },
        "fr": {
            "name": "Temps Sidéral",
            "description": "Temps astronomique basé sur la rotation de la Terre par rapport aux étoiles lointaines. Inclut GMST, GAST, LMST, LAST et ERA."
        },
        "it": {
            "name": "Tempo Siderale",
            "description": "Tempo astronomico basato sulla rotazione terrestre rispetto alle stelle distanti. Include GMST, GAST, LMST, LAST ed ERA."
        },
        "nl": {
            "name": "Sterrentijd",
            "description": "Astronomische tijd gebaseerd op de aardrotatie ten opzichte van verre sterren. Bevat GMST, GAST, LMST, LAST en ERA."
        },
        "pl": {
            "name": "Czas Gwiazdowy",
            "description": "Czas astronomiczny oparty na rotacji Ziemi względem odległych gwiazd. Zawiera GMST, GAST, LMST, LAST i ERA."
        },
        "pt": {
            "name": "Tempo Sideral",
            "description": "Tempo astronômico baseado na rotação da Terra em relação a estrelas distantes. Inclui GMST, GAST, LMST, LAST e ERA."
        },
        "ru": {
            "name": "Звёздное время",
            "description": "Астрономическое время, основанное на вращении Земли относительно далёких звёзд. Включает GMST, GAST, LMST, LAST и ERA."
        },
        "ja": {
            "name": "恒星時",
            "description": "遠方の恒星に対する地球の自転に基づく天文時間。GMST、GAST、LMST、LAST、ERAを含みます。"
        },
        "zh": {
            "name": "恒星时",
            "description": "基于地球相对于遥远恒星自转的天文时间。包括GMST、GAST、LMST、LAST和ERA。"
        },
        "ko": {
            "name": "항성시",
            "description": "먼 별들에 대한 지구 자전을 기반으로 한 천문 시간. GMST, GAST, LMST, LAST 및 ERA 포함."
        }
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Astronomical time based on Earth's rotation relative to distant stars. Includes GMST, GAST, LMST, LAST, and ERA.",
        "de": "Astronomische Zeit basierend auf der Erdrotation relativ zu fernen Sternen. Enthält GMST, GAST, LMST, LAST und ERA.",
        "es": "Tiempo astronómico basado en la rotación de la Tierra relativa a estrellas distantes. Incluye GMST, GAST, LMST, LAST y ERA.",
        "fr": "Temps astronomique basé sur la rotation de la Terre par rapport aux étoiles lointaines. Inclut GMST, GAST, LMST, LAST et ERA.",
        "it": "Tempo astronomico basato sulla rotazione terrestre rispetto alle stelle distanti. Include GMST, GAST, LMST, LAST ed ERA.",
        "nl": "Astronomische tijd gebaseerd op de aardrotatie ten opzichte van verre sterren. Bevat GMST, GAST, LMST, LAST en ERA.",
        "pl": "Czas astronomiczny oparty na rotacji Ziemi względem odległych gwiazd. Zawiera GMST, GAST, LMST, LAST i ERA.",
        "pt": "Tempo astronômico baseado na rotação da Terra em relação a estrelas distantes. Inclui GMST, GAST, LMST, LAST e ERA.",
        "ru": "Астрономическое время, основанное на вращении Земли относительно далёких звёзд. Включает GMST, GAST, LMST, LAST и ERA.",
        "ja": "遠方の恒星に対する地球の自転に基づく天文時間。GMST、GAST、LMST、LAST、ERAを含みます。",
        "zh": "基于地球相对于遥远恒星自转的天文时间。包括GMST、GAST、LMST、LAST和ERA。",
        "ko": "먼 별들에 대한 지구 자전을 기반으로 한 천문 시간. GMST, GAST, LMST, LAST 및 ERA 포함."
    },
    
    # Detailed information for documentation
    "detailed_info": {
        "en": {
            "overview": "Sidereal time is a time scale based on Earth's rotation relative to distant stars, not the Sun",
            "sidereal_day": "A sidereal day is approximately 23 hours, 56 minutes, 4.091 seconds",
            "gmst": "Greenwich Mean Sidereal Time - sidereal time at Greenwich using mean equinox",
            "gast": "Greenwich Apparent Sidereal Time - includes nutation correction (equation of equinoxes)",
            "lmst": "Local Mean Sidereal Time - GMST adjusted for observer's longitude",
            "last": "Local Apparent Sidereal Time - GAST adjusted for observer's longitude",
            "era": "Earth Rotation Angle - modern replacement for GAST, directly proportional to UT1",
            "usage": "Essential for telescope pointing, astronomical observations, and celestial navigation",
            "formula_source": "USNO Circular No. 179 (2005) and IAU 2000 resolutions"
        },
        "de": {
            "overview": "Sternzeit ist eine Zeitskala basierend auf der Erdrotation relativ zu fernen Sternen, nicht zur Sonne",
            "sidereal_day": "Ein Sterntag dauert etwa 23 Stunden, 56 Minuten und 4,091 Sekunden",
            "gmst": "Greenwich Mean Sidereal Time - Sternzeit in Greenwich mit mittlerem Frühlingspunkt",
            "gast": "Greenwich Apparent Sidereal Time - enthält Nutationskorrektur (Äquinoktialgleichung)",
            "lmst": "Local Mean Sidereal Time - GMST angepasst an den Längengrad des Beobachters",
            "last": "Local Apparent Sidereal Time - GAST angepasst an den Längengrad des Beobachters",
            "era": "Earth Rotation Angle - moderner Ersatz für GAST, direkt proportional zu UT1",
            "usage": "Unverzichtbar für Teleskopsteuerung, astronomische Beobachtungen und Astronavigation",
            "formula_source": "USNO Circular Nr. 179 (2005) und IAU 2000 Resolutionen"
        }
    },
    
    # Sidereal time specific data
    "sidereal_data": {
        # Sidereal day length
        "sidereal_day_seconds": 86164.0905,  # 23h 56m 4.0905s
        "solar_to_sidereal_ratio": 1.00273781191135448,
        
        # Time system explanations
        "time_systems": {
            "GMST": "Greenwich Mean Sidereal Time",
            "GAST": "Greenwich Apparent Sidereal Time",
            "LMST": "Local Mean Sidereal Time",
            "LAST": "Local Apparent Sidereal Time",
            "ERA": "Earth Rotation Angle"
        },
        
        # Relationships
        "relationships": {
            "gast_gmst": "GAST = GMST + equation_of_equinoxes",
            "lmst_gmst": "LMST = GMST + longitude/15",
            "last_gast": "LAST = GAST + longitude/15",
            "era_to_gast": "ERA ≈ GAST (for most practical purposes)"
        }
    },
    
    # Additional metadata
    "reference_url": "https://en.wikipedia.org/wiki/Sidereal_time",
    "documentation_url": "https://aa.usno.navy.mil/faq/GAST",
    "origin": "International Astronomical Union (IAU)",
    "created_by": "IAU / USNO",
    "introduced": "Ancient (formalized by IAU)",
    
    # Example format
    "example": "14:23:45.67 LMST",
    "example_meaning": "Local Mean Sidereal Time at observer's location",
    
    # Related calendars
    "related": ["ut1", "tai", "julian"],
    
    # Tags for searching and filtering
    "tags": [
        "technical", "astronomy", "stars", "telescope", "navigation",
        "equinox", "rotation", "celestial", "observatory", "scientific"
    ],
    
    # Special features
    "features": {
        "earth_rotation_based": True,
        "location_dependent": True,
        "uses_ha_location": True,
        "nutation_correction": True,
        "astronomical_standard": True
    },
    
    # Configuration options for this calendar
    "config_options": {
        "primary_display": {
            "type": "select",
            "default": "lmst",
            "options": ["gmst", "gast", "lmst", "last", "era"],
            "label": {
                "en": "Primary Display",
                "de": "Hauptanzeige",
                "es": "Pantalla Principal",
                "fr": "Affichage Principal",
                "it": "Display Principale",
                "nl": "Primaire Weergave",
                "pl": "Główny Wyświetlacz",
                "pt": "Exibição Principal",
                "ru": "Основной дисплей",
                "ja": "メイン表示",
                "zh": "主显示",
                "ko": "기본 표시"
            },
            "description": {
                "en": "Which sidereal time to show as main state (GMST, GAST, LMST, LAST, or ERA)",
                "de": "Welche Sternzeit als Hauptstatus angezeigt werden soll (GMST, GAST, LMST, LAST oder ERA)",
                "es": "Qué tiempo sidéreo mostrar como estado principal (GMST, GAST, LMST, LAST o ERA)",
                "fr": "Quel temps sidéral afficher comme état principal (GMST, GAST, LMST, LAST ou ERA)",
                "it": "Quale tempo siderale mostrare come stato principale (GMST, GAST, LMST, LAST o ERA)",
                "nl": "Welke sterrentijd als hoofdstatus tonen (GMST, GAST, LMST, LAST of ERA)",
                "pl": "Który czas gwiazdowy pokazać jako główny stan (GMST, GAST, LMST, LAST lub ERA)",
                "pt": "Qual tempo sideral mostrar como estado principal (GMST, GAST, LMST, LAST ou ERA)",
                "ru": "Какое звёздное время показывать как основное состояние (GMST, GAST, LMST, LAST или ERA)",
                "ja": "メイン状態として表示する恒星時（GMST、GAST、LMST、LAST、またはERA）",
                "zh": "显示为主状态的恒星时（GMST、GAST、LMST、LAST或ERA）",
                "ko": "기본 상태로 표시할 항성시 (GMST, GAST, LMST, LAST 또는 ERA)"
            }
        },
        "use_ha_location": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Use Home Assistant Location",
                "de": "Home Assistant Standort verwenden",
                "es": "Usar Ubicación de Home Assistant",
                "fr": "Utiliser la Position de Home Assistant",
                "it": "Usa Posizione di Home Assistant",
                "nl": "Gebruik Home Assistant Locatie",
                "pl": "Użyj Lokalizacji Home Assistant",
                "pt": "Usar Localização do Home Assistant",
                "ru": "Использовать местоположение Home Assistant",
                "ja": "Home Assistantの位置を使用",
                "zh": "使用Home Assistant位置",
                "ko": "Home Assistant 위치 사용"
            },
            "description": {
                "en": "Use coordinates from Home Assistant configuration for local sidereal time",
                "de": "Koordinaten aus der Home Assistant Konfiguration für lokale Sternzeit verwenden",
                "es": "Usar coordenadas de la configuración de Home Assistant para tiempo sidéreo local",
                "fr": "Utiliser les coordonnées de la configuration Home Assistant pour le temps sidéral local",
                "it": "Usa le coordinate dalla configurazione di Home Assistant per il tempo siderale locale",
                "nl": "Gebruik coördinaten uit Home Assistant configuratie voor lokale sterrentijd",
                "pl": "Użyj współrzędnych z konfiguracji Home Assistant dla lokalnego czasu gwiazdowego",
                "pt": "Usar coordenadas da configuração do Home Assistant para tempo sideral local",
                "ru": "Использовать координаты из конфигурации Home Assistant для местного звёздного времени",
                "ja": "ローカル恒星時のためにHome Assistant設定の座標を使用",
                "zh": "使用Home Assistant配置中的坐标计算本地恒星时",
                "ko": "지역 항성시를 위해 Home Assistant 구성의 좌표 사용"
            }
        },
        "custom_longitude": {
            "type": "float",
            "default": 0.0,
            "min": -180.0,
            "max": 180.0,
            "label": {
                "en": "Custom Longitude",
                "de": "Benutzerdefinierter Längengrad",
                "es": "Longitud Personalizada",
                "fr": "Longitude Personnalisée",
                "it": "Longitudine Personalizzata",
                "nl": "Aangepaste Lengtegraad",
                "pl": "Niestandardowa Długość Geograficzna",
                "pt": "Longitude Personalizada",
                "ru": "Пользовательская долгота",
                "ja": "カスタム経度",
                "zh": "自定义经度",
                "ko": "사용자 정의 경도"
            },
            "description": {
                "en": "Custom longitude in degrees (-180 to +180, East positive). Only used if HA location is disabled.",
                "de": "Benutzerdefinierter Längengrad in Grad (-180 bis +180, Ost positiv). Wird nur verwendet, wenn HA-Standort deaktiviert ist.",
                "es": "Longitud personalizada en grados (-180 a +180, Este positivo). Solo se usa si la ubicación HA está desactivada.",
                "fr": "Longitude personnalisée en degrés (-180 à +180, Est positif). Utilisé uniquement si la position HA est désactivée.",
                "it": "Longitudine personalizzata in gradi (-180 a +180, Est positivo). Usata solo se la posizione HA è disabilitata.",
                "nl": "Aangepaste lengtegraad in graden (-180 tot +180, Oost positief). Alleen gebruikt als HA locatie uitgeschakeld is.",
                "pl": "Niestandardowa długość geograficzna w stopniach (-180 do +180, wschód dodatni). Używana tylko gdy lokalizacja HA jest wyłączona.",
                "pt": "Longitude personalizada em graus (-180 a +180, Leste positivo). Usado apenas se a localização HA estiver desativada.",
                "ru": "Пользовательская долгота в градусах (-180 до +180, восток положительный). Используется только если местоположение HA отключено.",
                "ja": "カスタム経度（度単位、-180から+180、東が正）。HA位置が無効の場合のみ使用。",
                "zh": "自定义经度（度数，-180到+180，东为正）。仅在禁用HA位置时使用。",
                "ko": "사용자 정의 경도(도 단위, -180~+180, 동쪽 양수). HA 위치가 비활성화된 경우에만 사용."
            }
        },
        "display_format": {
            "type": "select",
            "default": "hms",
            "options": ["hms", "decimal_hours", "decimal_degrees"],
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
                "en": "Hours:Minutes:Seconds | Decimal Hours | Decimal Degrees",
                "de": "Stunden:Minuten:Sekunden | Dezimalstunden | Dezimalgrad",
                "es": "Horas:Minutos:Segundos | Horas Decimales | Grados Decimales",
                "fr": "Heures:Minutes:Secondes | Heures Décimales | Degrés Décimaux",
                "it": "Ore:Minuti:Secondi | Ore Decimali | Gradi Decimali",
                "nl": "Uren:Minuten:Seconden | Decimale Uren | Decimale Graden",
                "pl": "Godziny:Minuty:Sekundy | Godziny Dziesiętne | Stopnie Dziesiętne",
                "pt": "Horas:Minutos:Segundos | Horas Decimais | Graus Decimais",
                "ru": "Часы:Минуты:Секунды | Десятичные часы | Десятичные градусы",
                "ja": "時:分:秒 | 10進時間 | 10進度",
                "zh": "时:分:秒 | 十进制小时 | 十进制度",
                "ko": "시:분:초 | 십진 시간 | 십진 도"
            }
        },
        "show_era": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Earth Rotation Angle",
                "de": "Erdrotationswinkel anzeigen",
                "es": "Mostrar Ángulo de Rotación Terrestre",
                "fr": "Afficher l'Angle de Rotation Terrestre",
                "it": "Mostra Angolo di Rotazione Terrestre",
                "nl": "Toon Aardrotatiehoek",
                "pl": "Pokaż Kąt Obrotu Ziemi",
                "pt": "Mostrar Ângulo de Rotação Terrestre",
                "ru": "Показать угол вращения Земли",
                "ja": "地球回転角を表示",
                "zh": "显示地球自转角",
                "ko": "지구 자전각 표시"
            },
            "description": {
                "en": "Display ERA (Earth Rotation Angle) in attributes",
                "de": "ERA (Earth Rotation Angle) in Attributen anzeigen",
                "es": "Mostrar ERA (Ángulo de Rotación Terrestre) en atributos",
                "fr": "Afficher ERA (Angle de Rotation Terrestre) dans les attributs",
                "it": "Mostra ERA (Angolo di Rotazione Terrestre) negli attributi",
                "nl": "Toon ERA (Aardrotatiehoek) in attributen",
                "pl": "Wyświetl ERA (Kąt Obrotu Ziemi) w atrybutach",
                "pt": "Mostrar ERA (Ângulo de Rotação Terrestre) nos atributos",
                "ru": "Показывать ERA (угол вращения Земли) в атрибутах",
                "ja": "属性にERA（地球回転角）を表示",
                "zh": "在属性中显示ERA（地球自转角）",
                "ko": "속성에 ERA(지구 자전각) 표시"
            }
        },
        "show_equation_of_equinoxes": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Equation of Equinoxes",
                "de": "Äquinoktialgleichung anzeigen",
                "es": "Mostrar Ecuación de los Equinoccios",
                "fr": "Afficher l'Équation des Équinoxes",
                "it": "Mostra Equazione degli Equinozi",
                "nl": "Toon Equinoxvergelijking",
                "pl": "Pokaż Równanie Równonocy",
                "pt": "Mostrar Equação dos Equinócios",
                "ru": "Показать уравнение равноденствий",
                "ja": "分点差を表示",
                "zh": "显示分点方程",
                "ko": "분점 방정식 표시"
            },
            "description": {
                "en": "Display the difference between GAST and GMST (nutation correction)",
                "de": "Differenz zwischen GAST und GMST anzeigen (Nutationskorrektur)",
                "es": "Mostrar la diferencia entre GAST y GMST (corrección de nutación)",
                "fr": "Afficher la différence entre GAST et GMST (correction de nutation)",
                "it": "Mostra la differenza tra GAST e GMST (correzione di nutazione)",
                "nl": "Toon het verschil tussen GAST en GMST (nutatiecorrectie)",
                "pl": "Wyświetl różnicę między GAST a GMST (korekcja nutacji)",
                "pt": "Mostrar a diferença entre GAST e GMST (correção de nutação)",
                "ru": "Показать разницу между GAST и GMST (коррекция нутации)",
                "ja": "GASTとGMSTの差（章動補正）を表示",
                "zh": "显示GAST和GMST的差值（章动校正）",
                "ko": "GAST와 GMST의 차이(장동 보정) 표시"
            }
        },
        "show_julian_date": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Julian Date",
                "de": "Julianisches Datum anzeigen",
                "es": "Mostrar Fecha Juliana",
                "fr": "Afficher la Date Julienne",
                "it": "Mostra Data Giuliana",
                "nl": "Toon Juliaanse Datum",
                "pl": "Pokaż Datę Juliańską",
                "pt": "Mostrar Data Juliana",
                "ru": "Показать юлианскую дату",
                "ja": "ユリウス日を表示",
                "zh": "显示儒略日",
                "ko": "율리우스 날짜 표시"
            },
            "description": {
                "en": "Display current Julian Date in attributes",
                "de": "Aktuelles Julianisches Datum in Attributen anzeigen",
                "es": "Mostrar Fecha Juliana actual en atributos",
                "fr": "Afficher la Date Julienne actuelle dans les attributs",
                "it": "Mostra la Data Giuliana corrente negli attributi",
                "nl": "Toon huidige Juliaanse Datum in attributen",
                "pl": "Wyświetl aktualną Datę Juliańską w atrybutach",
                "pt": "Mostrar Data Juliana atual nos atributos",
                "ru": "Показать текущую юлианскую дату в атрибутах",
                "ja": "属性に現在のユリウス日を表示",
                "zh": "在属性中显示当前儒略日",
                "ko": "속성에 현재 율리우스 날짜 표시"
            }
        },
        "precision": {
            "type": "select",
            "default": "centisecond",
            "options": ["second", "centisecond", "millisecond"],
            "label": {
                "en": "Time Precision",
                "de": "Zeitpräzision",
                "es": "Precisión de Tiempo",
                "fr": "Précision Temporelle",
                "it": "Precisione Temporale",
                "nl": "Tijdprecisie",
                "pl": "Precyzja Czasu",
                "pt": "Precisão de Tempo",
                "ru": "Точность времени",
                "ja": "時間精度",
                "zh": "时间精度",
                "ko": "시간 정밀도"
            },
            "description": {
                "en": "How many decimal places to show for seconds",
                "de": "Wie viele Dezimalstellen für Sekunden angezeigt werden sollen",
                "es": "Cuántos decimales mostrar para los segundos",
                "fr": "Combien de décimales afficher pour les secondes",
                "it": "Quante cifre decimali mostrare per i secondi",
                "nl": "Hoeveel decimalen voor seconden te tonen",
                "pl": "Ile miejsc po przecinku pokazać dla sekund",
                "pt": "Quantas casas decimais mostrar para segundos",
                "ru": "Сколько десятичных знаков показывать для секунд",
                "ja": "秒の小数点以下の桁数",
                "zh": "秒的小数位数",
                "ko": "초에 표시할 소수점 자릿수"
            }
        }
    }
}


class SiderealTimeSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Sidereal Time (GMST, GAST, LMST, LAST, ERA)."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Sidereal Time sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Sidereal Time')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_sidereal"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:star-shooting")
        
        # Configuration options with defaults from CALENDAR_INFO
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._primary_display = config_defaults.get("primary_display", {}).get("default", "lmst")
        self._use_ha_location = config_defaults.get("use_ha_location", {}).get("default", True)
        self._custom_longitude = config_defaults.get("custom_longitude", {}).get("default", 0.0)
        self._display_format = config_defaults.get("display_format", {}).get("default", "hms")
        self._show_era = config_defaults.get("show_era", {}).get("default", True)
        self._show_equation_of_equinoxes = config_defaults.get("show_equation_of_equinoxes", {}).get("default", True)
        self._show_julian_date = config_defaults.get("show_julian_date", {}).get("default", False)
        self._precision = config_defaults.get("precision", {}).get("default", "centisecond")
        
        # Initialize state
        self._state = None
        self._sidereal_data = {}
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized Sidereal Time sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._primary_display = options.get("primary_display", self._primary_display)
                self._use_ha_location = options.get("use_ha_location", self._use_ha_location)
                self._custom_longitude = options.get("custom_longitude", self._custom_longitude)
                self._display_format = options.get("display_format", self._display_format)
                self._show_era = options.get("show_era", self._show_era)
                self._show_equation_of_equinoxes = options.get("show_equation_of_equinoxes", self._show_equation_of_equinoxes)
                self._show_julian_date = options.get("show_julian_date", self._show_julian_date)
                self._precision = options.get("precision", self._precision)
                
                _LOGGER.debug(f"Sidereal sensor loaded options: primary={self._primary_display}, "
                            f"ha_location={self._use_ha_location}, format={self._display_format}")
            else:
                _LOGGER.debug("Sidereal sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"Sidereal sensor could not load options yet: {e}")
    
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
        
        # Add sidereal-specific attributes
        if self._sidereal_data:
            attrs.update(self._sidereal_data)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('documentation_url', '')
        
        return attrs
    
    def _get_longitude(self) -> float:
        """Get the longitude to use for local sidereal time calculation.
        
        Returns longitude in degrees (East positive).
        """
        if self._use_ha_location and self.hass:
            # Use Home Assistant configured location
            longitude = self.hass.config.longitude
            _LOGGER.debug(f"Using HA longitude: {longitude}°")
            return longitude
        else:
            # Use custom longitude
            _LOGGER.debug(f"Using custom longitude: {self._custom_longitude}°")
            return self._custom_longitude
    
    def _get_latitude(self) -> float:
        """Get the latitude from Home Assistant (for display purposes)."""
        if self._use_ha_location and self.hass:
            return self.hass.config.latitude
        return 0.0
    
    def _datetime_to_jd(self, dt: datetime) -> float:
        """Convert datetime to Julian Date.
        
        Algorithm from Meeus, Astronomical Algorithms, Chapter 7.
        """
        # Ensure UTC
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        
        year = dt.year
        month = dt.month
        day = dt.day + (dt.hour + dt.minute / 60.0 + dt.second / 3600.0 + 
                        dt.microsecond / 3600000000.0) / 24.0
        
        if month <= 2:
            year -= 1
            month += 12
        
        a = int(year / 100)
        b = 2 - a + int(a / 4)
        
        jd = int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + b - 1524.5
        
        return jd
    
    def _calculate_gmst(self, jd_ut1: float) -> float:
        """Calculate Greenwich Mean Sidereal Time (GMST).
        
        Based on USNO Circular No. 179, Section 2.6.2.
        
        Args:
            jd_ut1: Julian Date in UT1
            
        Returns:
            GMST in hours (0-24)
        """
        # Calculate JD at 0h UT
        jd0 = math.floor(jd_ut1 - 0.5) + 0.5
        
        # Hours elapsed since 0h UT
        h = (jd_ut1 - jd0) * 24.0
        
        # Days since J2000.0 at 0h UT
        d_ut = jd0 - J2000_JD
        
        # Centuries since J2000.0 (for T² term)
        t = (jd_ut1 - J2000_JD) / 36525.0
        
        # GMST formula from USNO Circular No. 179
        # GMST = 6.697375 + 0.065709824279 * D_UT + 1.0027379 * H + 0.0000258 * T²
        gmst = 6.697375 + 0.065709824279 * d_ut + 1.0027379 * h + 0.0000258 * t * t
        
        # Normalize to 0-24 hours
        gmst = gmst % 24.0
        if gmst < 0:
            gmst += 24.0
        
        return gmst
    
    def _calculate_equation_of_equinoxes(self, jd_tt: float) -> float:
        """Calculate the equation of equinoxes (nutation in right ascension).
        
        Based on USNO Circular No. 179.
        
        Args:
            jd_tt: Julian Date in TT (Terrestrial Time)
            
        Returns:
            Equation of equinoxes in hours
        """
        # Days since J2000.0 in TT
        d_tt = jd_tt - J2000_JD
        
        # Longitude of ascending node of the Moon (degrees)
        omega = 125.04 - 0.052954 * d_tt
        
        # Mean longitude of the Sun (degrees)
        l_sun = 280.47 + 0.98565 * d_tt
        
        # Obliquity of the ecliptic (degrees)
        epsilon = 23.4393 - 0.0000004 * d_tt
        
        # Convert to radians for trig functions
        omega_rad = math.radians(omega)
        l_sun_rad = math.radians(l_sun)
        epsilon_rad = math.radians(epsilon)
        
        # Nutation in longitude (approximate, in hours)
        delta_psi = -0.000319 * math.sin(omega_rad) - 0.000024 * math.sin(2 * l_sun_rad)
        
        # Equation of equinoxes
        eq_eq = delta_psi * math.cos(epsilon_rad)
        
        return eq_eq
    
    def _calculate_gast(self, gmst: float, eq_eq: float) -> float:
        """Calculate Greenwich Apparent Sidereal Time (GAST).
        
        GAST = GMST + equation_of_equinoxes
        
        Args:
            gmst: Greenwich Mean Sidereal Time in hours
            eq_eq: Equation of equinoxes in hours
            
        Returns:
            GAST in hours (0-24)
        """
        gast = gmst + eq_eq
        
        # Normalize to 0-24 hours
        gast = gast % 24.0
        if gast < 0:
            gast += 24.0
        
        return gast
    
    def _calculate_local_sidereal_time(self, greenwich_st: float, longitude: float) -> float:
        """Calculate local sidereal time from Greenwich sidereal time.
        
        LST = GST + longitude/15
        
        Args:
            greenwich_st: Greenwich sidereal time in hours
            longitude: Observer's longitude in degrees (East positive)
            
        Returns:
            Local sidereal time in hours (0-24)
        """
        # Convert longitude from degrees to hours (15° = 1 hour)
        longitude_hours = longitude / 15.0
        
        lst = greenwich_st + longitude_hours
        
        # Normalize to 0-24 hours
        lst = lst % 24.0
        if lst < 0:
            lst += 24.0
        
        return lst
    
    def _calculate_era(self, jd_ut1: float) -> float:
        """Calculate Earth Rotation Angle (ERA).
        
        Based on IAU 2000 resolution.
        ERA = 2π(0.7790572732640 + 1.00273781191135448 × Tu) radians
        where Tu = JD(UT1) - 2451545.0
        
        Args:
            jd_ut1: Julian Date in UT1
            
        Returns:
            ERA in degrees (0-360)
        """
        tu = jd_ut1 - J2000_JD
        
        # ERA in radians (full rotations)
        era_radians = 2.0 * math.pi * (0.7790572732640 + 1.00273781191135448 * tu)
        
        # Normalize to 0-2π
        era_radians = era_radians % (2.0 * math.pi)
        if era_radians < 0:
            era_radians += 2.0 * math.pi
        
        # Convert to degrees
        era_degrees = math.degrees(era_radians)
        
        return era_degrees
    
    def _hours_to_hms(self, hours: float) -> tuple:
        """Convert decimal hours to hours, minutes, seconds.
        
        Args:
            hours: Time in decimal hours
            
        Returns:
            Tuple of (hours, minutes, seconds)
        """
        h = int(hours)
        minutes_decimal = (hours - h) * 60.0
        m = int(minutes_decimal)
        s = (minutes_decimal - m) * 60.0
        
        return h, m, s
    
    def _format_time(self, hours: float, suffix: str = "") -> str:
        """Format time value according to display_format setting.
        
        Args:
            hours: Time in decimal hours
            suffix: Optional suffix (e.g., "LMST", "GMST")
            
        Returns:
            Formatted time string
        """
        if self._display_format == "decimal_hours":
            return f"{hours:.6f}h {suffix}".strip()
        elif self._display_format == "decimal_degrees":
            degrees = hours * 15.0  # 1 hour = 15 degrees
            return f"{degrees:.6f}° {suffix}".strip()
        else:  # hms (default)
            h, m, s = self._hours_to_hms(hours)
            
            if self._precision == "millisecond":
                return f"{h:02d}:{m:02d}:{s:06.3f} {suffix}".strip()
            elif self._precision == "centisecond":
                return f"{h:02d}:{m:02d}:{s:05.2f} {suffix}".strip()
            else:  # second
                return f"{h:02d}:{m:02d}:{int(s):02d} {suffix}".strip()
    
    def _calculate_sidereal_time(self, utc_time: datetime) -> Dict[str, Any]:
        """Calculate all sidereal time values.
        
        Args:
            utc_time: Current UTC time
            
        Returns:
            Dictionary with all sidereal time values
        """
        # Ensure we're working with UTC
        if utc_time.tzinfo is None:
            utc_time = utc_time.replace(tzinfo=timezone.utc)
        else:
            utc_time = utc_time.astimezone(timezone.utc)
        
        # Get Julian Date
        jd = self._datetime_to_jd(utc_time)
        
        # For high precision, we should use UT1 and TT separately
        # For this implementation, we'll use UTC ≈ UT1 ≈ TT (error < 1 second)
        jd_ut1 = jd
        jd_tt = jd  # TT ≈ UTC + 69.184s, but for ~1s accuracy this is fine
        
        # Calculate GMST
        gmst = self._calculate_gmst(jd_ut1)
        
        # Calculate equation of equinoxes
        eq_eq = self._calculate_equation_of_equinoxes(jd_tt)
        
        # Calculate GAST
        gast = self._calculate_gast(gmst, eq_eq)
        
        # Get longitude for local calculations
        longitude = self._get_longitude()
        latitude = self._get_latitude()
        
        # Calculate local sidereal times
        lmst = self._calculate_local_sidereal_time(gmst, longitude)
        last = self._calculate_local_sidereal_time(gast, longitude)
        
        # Calculate ERA
        era_degrees = self._calculate_era(jd_ut1)
        era_hours = era_degrees / 15.0  # Convert to hours for display
        
        # Build result dictionary
        result = {
            # Greenwich sidereal times
            "gmst": self._format_time(gmst, "GMST"),
            "gmst_hours": round(gmst, 8),
            "gmst_degrees": round(gmst * 15.0, 6),
            
            "gast": self._format_time(gast, "GAST"),
            "gast_hours": round(gast, 8),
            "gast_degrees": round(gast * 15.0, 6),
            
            # Local sidereal times
            "lmst": self._format_time(lmst, "LMST"),
            "lmst_hours": round(lmst, 8),
            "lmst_degrees": round(lmst * 15.0, 6),
            
            "last": self._format_time(last, "LAST"),
            "last_hours": round(last, 8),
            "last_degrees": round(last * 15.0, 6),
            
            # Location info
            "longitude": round(longitude, 6),
            "latitude": round(latitude, 6),
            "location_source": "Home Assistant" if self._use_ha_location else "Custom",
            
            # UTC reference
            "utc_datetime": utc_time.strftime("%Y-%m-%d %H:%M:%S UTC")
        }
        
        # Add ERA if enabled
        if self._show_era:
            result["era_degrees"] = round(era_degrees, 6)
            result["era_radians"] = round(math.radians(era_degrees), 8)
            result["era"] = self._format_time(era_hours, "ERA")
            result["era_hours"] = round(era_hours, 8)
        
        # Add equation of equinoxes if enabled
        if self._show_equation_of_equinoxes:
            eq_eq_seconds = eq_eq * 3600.0  # Convert to seconds
            result["equation_of_equinoxes_seconds"] = round(eq_eq_seconds, 4)
            result["equation_of_equinoxes"] = f"{eq_eq_seconds:+.4f}s"
            result["gast_minus_gmst"] = result["equation_of_equinoxes"]
        
        # Add Julian Date if enabled
        if self._show_julian_date:
            result["julian_date"] = round(jd, 8)
            result["modified_julian_date"] = round(jd - 2400000.5, 8)
            result["days_since_j2000"] = round(jd - J2000_JD, 8)
        
        # Add sidereal day progress
        sidereal_day_progress = (lmst / 24.0) * 100.0
        result["sidereal_day_progress"] = f"{sidereal_day_progress:.2f}%"
        
        # Set the primary display value based on configuration
        primary_values = {
            "gmst": result["gmst"],
            "gast": result["gast"],
            "lmst": result["lmst"],
            "last": result["last"],
            "era": result.get("era", self._format_time(era_hours, "ERA"))
        }
        result["primary_display"] = primary_values.get(self._primary_display, result["lmst"])
        result["primary_display_type"] = self._primary_display.upper()
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded
        if not self._options_loaded:
            self._load_options()
        
        try:
            now = datetime.now(timezone.utc)
            self._sidereal_data = self._calculate_sidereal_time(now)
            
            # Set state to primary display value
            self._state = self._sidereal_data.get("primary_display", "Sidereal ERROR")
            
            _LOGGER.debug(f"Updated Sidereal Time: {self._state}")
        except Exception as e:
            _LOGGER.error(f"Error updating Sidereal Time: {e}", exc_info=True)
            self._state = "Sidereal ERROR"
    
    async def async_update(self) -> None:
        """Update sensor asynchronously."""
        # Run synchronous update in executor
        await self.hass.async_add_executor_job(self.update)
