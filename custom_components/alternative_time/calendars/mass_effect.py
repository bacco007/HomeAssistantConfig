"""Mass Effect - Galactic Standard Time & Year - Version 3.0
Config Flow Compatible with Enhanced Features

Galactic Standard Time (GST):
- 20 hours per day
- 100 minutes per hour  
- 100 seconds per minute
- 1 GST second = 0.5 Earth seconds

Galactic Standard Year (GSY):
- Approximately 398.1 Earth days
- Used throughout Citadel space
"""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
import logging
from typing import Dict, Any, Optional

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

UPDATE_INTERVAL = 1  # 1 second for smooth clock

CALENDAR_INFO = {
    "id": "mass_effect",
    "version": "3.0.0",
    "icon": "mdi:rocket-launch",
    "category": "scifi",
    "accuracy": "fictional",
    "update_interval": UPDATE_INTERVAL,

    # Multi-language names
    "name": {
        "en": "Mass Effect – Galactic Standard",
        "de": "Mass Effect – Galaktischer Standard",
        "es": "Mass Effect – Estándar Galáctico",
        "fr": "Mass Effect – Standard Galactique",
        "it": "Mass Effect – Standard Galattico",
        "nl": "Mass Effect – Galactische Standaard",
        "pt": "Mass Effect – Padrão Galáctico",
        "ru": "Mass Effect – Галактический стандарт",
        "ja": "マスエフェクト – 銀河標準",
        "zh": "质量效应 – 银河标准",
        "ko": "매스 이펙트 – 은하 표준"
    },

    # Descriptions
    "description": {
        "en": "Shows Galactic Standard Time (GST 20:100:100; 1 GST s = 0.5 s) and optional Galactic Standard Year (GSY) counter.",
        "de": "Zeigt die Galactic Standard Time (GST 20:100:100; 1 GST s = 0,5 s) sowie optional einen Galactic Standard Year (GSY) Zähler.",
        "es": "Muestra el Tiempo Estándar Galáctico (GST 20:100:100; 1 GST s = 0,5 s) y, opcionalmente, el contador del Año Estándar Galáctico (GSY).",
        "fr": "Affiche l'heure standard galactique (GST 20:100:100 ; 1 s GST = 0,5 s) et, en option, le compteur d'année standard galactique (GSY).",
        "it": "Mostra il Tempo Standard Galattico (GST 20:100:100; 1 s GST = 0,5 s) e opzionalmente il contatore dell'Anno Standard Galattico (GSY).",
        "nl": "Toont de Galactic Standard Time (GST 20:100:100; 1 GST s = 0,5 s) en optioneel de Galactic Standard Year (GSY).",
        "pt": "Mostra o Tempo Padrão Galáctico (GST 20:100:100; 1 s GST = 0,5 s) e, opcionalmente, o contador do Ano Padrão Galáctico (GSY).",
        "ru": "Показывает Галактическое стандартное время (GST 20:100:100; 1 с GST = 0,5 с) и опциональный счётчик Галактического стандартного года (GSY).",
        "ja": "銀河標準時 (GST 20:100:100、1 GST 秒 = 0.5 秒) と、オプションの銀河標準年 (GSY) カウンターを表示します。",
        "zh": "显示银河标准时间（GST 20:100:100；1 GST 秒 = 0.5 秒）以及可选的银河标准年（GSY）计数器。",
        "ko": "은하 표준 시간(GST 20:100:100; 1 GST초 = 0.5초)과 선택적인 은하 표준 연도(GSY) 카운터를 표시합니다."
    },

    # Configuration options for config_flow
    "config_options": {
        "enable_gst": {
            "type": "boolean",
            "default": True,
            "label": { 
                "en": "Show GST Clock",
                "de": "GST-Uhr anzeigen",
                "es": "Mostrar reloj GST",
                "fr": "Afficher l'horloge GST",
                "it": "Mostra orologio GST",
                "nl": "Toon GST klok",
                "pt": "Mostrar relógio GST",
                "ru": "Показать часы GST",
                "ja": "GSTクロックを表示",
                "zh": "显示GST时钟",
                "ko": "GST 시계 표시"
            },
            "description": { 
                "en": "Display the Galactic Standard Time clock",
                "de": "Zeige die Galactic Standard Time Uhr",
                "es": "Mostrar el reloj de Tiempo Estándar Galáctico",
                "fr": "Afficher l'horloge de l'heure standard galactique",
                "it": "Mostra l'orologio del Tempo Standard Galattico",
                "nl": "Toon de Galactische Standaard Tijd klok",
                "pt": "Mostrar o relógio de Tempo Padrão Galáctico",
                "ru": "Показывать часы Галактического стандартного времени",
                "ja": "銀河標準時時計を表示",
                "zh": "显示银河标准时间时钟",
                "ko": "은하 표준 시간 시계 표시"
            }
        },
        "precision": {
            "type": "select",
            "default": "second",
            "options": ["second", "centisecond", "millisecond"],
            "label": { 
                "en": "Clock Precision",
                "de": "Uhr-Präzision",
                "es": "Precisión del reloj",
                "fr": "Précision de l'horloge",
                "it": "Precisione orologio",
                "nl": "Klok precisie",
                "pt": "Precisão do relógio",
                "ru": "Точность часов",
                "ja": "時計の精度",
                "zh": "时钟精度",
                "ko": "시계 정밀도"
            },
            "description": { 
                "en": "How precise should the GST clock display be",
                "de": "Wie präzise soll die GST-Uhr angezeigt werden",
                "es": "Qué tan preciso debe ser el reloj GST",
                "fr": "Précision d'affichage de l'horloge GST",
                "it": "Quanto preciso deve essere l'orologio GST",
                "nl": "Hoe precies moet de GST klok zijn",
                "pt": "Quão preciso deve ser o relógio GST",
                "ru": "Насколько точными должны быть часы GST",
                "ja": "GSTクロックの表示精度",
                "zh": "GST时钟的显示精度",
                "ko": "GST 시계 표시 정밀도"
            }
        },
        "show_period": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Time Period",
                "de": "Tagesabschnitt anzeigen",
                "es": "Mostrar período del día",
                "fr": "Afficher la période du jour",
                "it": "Mostra periodo del giorno",
                "nl": "Toon dagdeel",
                "pt": "Mostrar período do dia",
                "ru": "Показать период дня",
                "ja": "時間帯を表示",
                "zh": "显示时段",
                "ko": "시간대 표시"
            },
            "description": { 
                "en": "Show time period (Night/Morning/Afternoon/etc.)",
                "de": "Tagesabschnitt anzeigen (Nacht/Morgen/Nachmittag/usw.)",
                "es": "Mostrar período del día (Noche/Mañana/Tarde/etc.)",
                "fr": "Afficher la période (Nuit/Matin/Après-midi/etc.)",
                "it": "Mostra periodo (Notte/Mattina/Pomeriggio/ecc.)",
                "nl": "Toon dagdeel (Nacht/Ochtend/Middag/etc.)",
                "pt": "Mostrar período (Noite/Manhã/Tarde/etc.)",
                "ru": "Показывать период (Ночь/Утро/День/и т.д.)",
                "ja": "時間帯を表示（夜/朝/午後など）",
                "zh": "显示时段（夜晚/早晨/下午等）",
                "ko": "시간대 표시 (밤/아침/오후 등)"
            }
        },
        "enable_gsy": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Enable GSY Counter",
                "de": "GSY-Zähler aktivieren",
                "es": "Habilitar contador GSY",
                "fr": "Activer le compteur GSY",
                "it": "Abilita contatore GSY",
                "nl": "GSY teller inschakelen",
                "pt": "Ativar contador GSY",
                "ru": "Включить счетчик GSY",
                "ja": "GSYカウンターを有効化",
                "zh": "启用GSY计数器",
                "ko": "GSY 카운터 활성화"
            },
            "description": { 
                "en": "Enable Galactic Standard Year counter (approximate)",
                "de": "Galactic Standard Year Zähler aktivieren (annähernd)",
                "es": "Habilitar contador de Año Estándar Galáctico (aproximado)",
                "fr": "Activer le compteur d'année standard galactique (approximatif)",
                "it": "Abilita contatore Anno Standard Galattico (approssimativo)",
                "nl": "Galactische Standaard Jaar teller inschakelen (bij benadering)",
                "pt": "Ativar contador de Ano Padrão Galáctico (aproximado)",
                "ru": "Включить счетчик Галактического стандартного года (приблизительно)",
                "ja": "銀河標準年カウンターを有効化（概算）",
                "zh": "启用银河标准年计数器（近似值）",
                "ko": "은하 표준 연도 카운터 활성화 (근사치)"
            }
        },
        "epoch_gs0_utc": {
            "type": "text",
            "default": "2183-01-01T00:00:00Z",
            "label": {
                "en": "GSY Epoch",
                "de": "GSY-Epoche",
                "es": "Época GSY",
                "fr": "Époque GSY",
                "it": "Epoca GSY",
                "nl": "GSY Epoch",
                "pt": "Época GSY",
                "ru": "Эпоха GSY",
                "ja": "GSYエポック",
                "zh": "GSY纪元",
                "ko": "GSY 기원"
            },
            "description": { 
                "en": "Epoch for 0 GSY in UTC ISO-8601 format (default: First Contact War)",
                "de": "Epoche für 0 GSY im UTC ISO-8601 Format (Standard: Erstkontaktkrieg)",
                "es": "Época para 0 GSY en formato UTC ISO-8601 (predeterminado: Guerra del Primer Contacto)",
                "fr": "Époque pour 0 GSY au format UTC ISO-8601 (par défaut: Guerre du Premier Contact)",
                "it": "Epoca per 0 GSY in formato UTC ISO-8601 (predefinito: Guerra del Primo Contatto)",
                "nl": "Epoch voor 0 GSY in UTC ISO-8601 formaat (standaard: Eerste Contact Oorlog)",
                "pt": "Época para 0 GSY em formato UTC ISO-8601 (padrão: Guerra do Primeiro Contato)",
                "ru": "Эпоха для 0 GSY в формате UTC ISO-8601 (по умолчанию: Война первого контакта)",
                "ja": "0 GSYのエポック（UTC ISO-8601形式、デフォルト：ファーストコンタクト戦争）",
                "zh": "0 GSY的纪元（UTC ISO-8601格式，默认：第一次接触战争）",
                "ko": "0 GSY 기원 (UTC ISO-8601 형식, 기본값: 첫 접촉 전쟁)"
            }
        },
        "gsy_length_days": {
            "type": "number",
            "default": 398.1,
            "min": 300,
            "max": 500,
            "label": {
                "en": "GSY Length (days)",
                "de": "GSY-Länge (Tage)",
                "es": "Duración GSY (días)",
                "fr": "Durée GSY (jours)",
                "it": "Durata GSY (giorni)",
                "nl": "GSY Lengte (dagen)",
                "pt": "Duração GSY (dias)",
                "ru": "Длина GSY (дней)",
                "ja": "GSY期間（日）",
                "zh": "GSY长度（天）",
                "ko": "GSY 길이 (일)"
            },
            "description": { 
                "en": "Length of 1 GSY in Earth days (approximately 398.1)",
                "de": "Länge von 1 GSY in Erdtagen (ca. 398,1)",
                "es": "Duración de 1 GSY en días terrestres (aproximadamente 398,1)",
                "fr": "Durée de 1 GSY en jours terrestres (environ 398,1)",
                "it": "Durata di 1 GSY in giorni terrestri (circa 398,1)",
                "nl": "Lengte van 1 GSY in Aardse dagen (ongeveer 398,1)",
                "pt": "Duração de 1 GSY em dias terrestres (aproximadamente 398,1)",
                "ru": "Длина 1 GSY в земных днях (примерно 398,1)",
                "ja": "1 GSYの地球日数（約398.1）",
                "zh": "1 GSY的地球天数（约398.1）",
                "ko": "1 GSY의 지구 일수 (약 398.1)"
            }
        },
        "show_citadel_time": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Citadel Time",
                "de": "Citadel-Zeit anzeigen",
                "es": "Mostrar hora de la Ciudadela",
                "fr": "Afficher l'heure de la Citadelle",
                "it": "Mostra ora della Cittadella",
                "nl": "Toon Citadel tijd",
                "pt": "Mostrar hora da Cidadela",
                "ru": "Показать время Цитадели",
                "ja": "シタデル時間を表示",
                "zh": "显示神堡时间",
                "ko": "시타델 시간 표시"
            },
            "description": {
                "en": "Show current time at the Citadel station",
                "de": "Zeige die aktuelle Zeit auf der Citadel-Station",
                "es": "Mostrar la hora actual en la estación Ciudadela",
                "fr": "Afficher l'heure actuelle à la station Citadelle",
                "it": "Mostra l'ora attuale alla stazione Cittadella",
                "nl": "Toon huidige tijd op het Citadel station",
                "pt": "Mostrar hora atual na estação Cidadela",
                "ru": "Показывать текущее время на станции Цитадель",
                "ja": "シタデルステーションの現在時刻を表示",
                "zh": "显示神堡空间站的当前时间",
                "ko": "시타델 정거장의 현재 시간 표시"
            }
        }
    },

    # Mass Effect specific data
    "mass_effect_data": {
        # GST constants
        "gst_seconds_per_sec": 2.0,  # 1 GST sec = 0.5 Earth sec
        "gst_seconds_per_min": 100,
        "gst_minutes_per_hour": 100,
        "gst_hours_per_day": 20,
        
        # Species and their homeworld time systems
        "species": {
            "Human": {"homeworld": "Earth", "joined_citadel": 2157},
            "Asari": {"homeworld": "Thessia", "joined_citadel": -580},
            "Turian": {"homeworld": "Palaven", "joined_citadel": -700},
            "Salarian": {"homeworld": "Sur'Kesh", "joined_citadel": -500},
            "Krogan": {"homeworld": "Tuchanka", "joined_citadel": -700},
            "Quarian": {"homeworld": "Rannoch", "joined_citadel": 200},
            "Volus": {"homeworld": "Irune", "joined_citadel": 200},
            "Elcor": {"homeworld": "Dekuuna", "joined_citadel": 250},
            "Hanar": {"homeworld": "Kahje", "joined_citadel": 200},
            "Drell": {"homeworld": "Rakhana", "joined_citadel": 250}
        },
        
        # Important events in the Mass Effect timeline
        "events": {
            "2157": "First Contact War",
            "2183": "Battle of the Citadel",
            "2185": "Collector Attacks",
            "2186": "Reaper War begins",
            "2187": "Reaper War ends"
        }
    },

    # Additional metadata
    "reference_url": "https://masseffect.fandom.com/wiki/Galactic_Standard",
    "documentation_url": "https://masseffect.fandom.com/wiki/Timeline",
    "origin": "BioWare / Electronic Arts",
    "created_by": "Mass Effect Universe",
    "introduced": "2007",
    
    # Related calendars
    "related": ["stardate", "star_wars", "eve_online"],
    
    # Tags for searching and filtering
    "tags": [
        "scifi", "mass_effect", "galactic", "space", "bioware",
        "citadel", "commander_shepard", "normandy", "fictional"
    ],
    
    # Extended notes
    "notes": {
        "en": (
            "Galactic Standard Time is used throughout Citadel space. "
            "1 GST second equals 0.5 Earth seconds, making GST days shorter. "
            "The Citadel Council established this system for interspecies coordination."
        ),
        "de": (
            "Die Galaktische Standardzeit wird im gesamten Citadel-Raum verwendet. "
            "1 GST-Sekunde entspricht 0,5 Erdsekunden, wodurch GST-Tage kürzer sind. "
            "Der Citadel-Rat etablierte dieses System für die Koordination zwischen Spezies."
        )
    }
}


class MassEffectGalacticStandardSensor(AlternativeTimeSensorBase):
    """Sensor for Mass Effect Galactic Standard Time/Year."""

    UPDATE_INTERVAL = UPDATE_INTERVAL

    # GST Constants
    GST_SECONDS_PER_SEC = 2.0  # 1 GST sec = 0.5 Earth sec
    GST_SECONDS_PER_MIN = 100
    GST_MINUTES_PER_HOUR = 100
    GST_HOURS_PER_DAY = 20
    GST_SECONDS_PER_HOUR = GST_SECONDS_PER_MIN * GST_MINUTES_PER_HOUR  # 10,000
    GST_SECONDS_PER_DAY = GST_SECONDS_PER_HOUR * GST_HOURS_PER_DAY     # 200,000

    EARTH_SECONDS_PER_GST_SECOND = 0.5
    EARTH_SECONDS_PER_GST_DAY = GST_SECONDS_PER_DAY * EARTH_SECONDS_PER_GST_SECOND  # 100,000s

    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Mass Effect sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO

        calendar_name = self._translate('name', 'Mass Effect – Galactic Standard')
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_mass_effect_gs"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:rocket-launch")

        # Configuration options with defaults
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._enable_gst = config_defaults.get("enable_gst", {}).get("default", True)
        self._precision = config_defaults.get("precision", {}).get("default", "second")
        self._show_period = config_defaults.get("show_period", {}).get("default", True)
        self._enable_gsy = config_defaults.get("enable_gsy", {}).get("default", False)
        self._epoch_gs0_utc = config_defaults.get("epoch_gs0_utc", {}).get("default", "2183-01-01T00:00:00Z")
        self._gsy_length_days = config_defaults.get("gsy_length_days", {}).get("default", 398.1)
        self._show_citadel_time = config_defaults.get("show_citadel_time", {}).get("default", False)

        # State variables
        self._data: Dict[str, Any] = {}
        self._state = "Initializing..."
        
        # Flag for options loading
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized Mass Effect sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        # Get plugin options from config entry
        plugin_options = self._get_plugin_options()
        
        if plugin_options:
            _LOGGER.debug(f"Loading Mass Effect options: {plugin_options}")
            
            # Apply options using set_options method
            self.set_options(
                enable_gst=plugin_options.get("enable_gst"),
                precision=plugin_options.get("precision"),
                show_period=plugin_options.get("show_period"),
                enable_gsy=plugin_options.get("enable_gsy"),
                epoch_gs0_utc=plugin_options.get("epoch_gs0_utc"),
                gsy_length_days=plugin_options.get("gsy_length_days"),
                show_citadel_time=plugin_options.get("show_citadel_time")
            )
        
        self._options_loaded = True
    
    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()
        
        # Load options after entity is registered
        self._load_options()
        
        _LOGGER.debug(f"Mass Effect sensor added to hass with options: "
                     f"gst={self._enable_gst}, precision={self._precision}, "
                     f"gsy={self._enable_gsy}, citadel={self._show_citadel_time}")

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return additional attributes."""
        attrs = super().extra_state_attributes
        if self._data:
            attrs.update(self._data)
            attrs["calendar_type"] = "Mass Effect Galactic Standard"
            attrs["accuracy"] = CALENDAR_INFO.get("accuracy", "fictional")
            attrs["reference"] = CALENDAR_INFO.get("reference_url")
            attrs["notes"] = self._translate('notes')
        return attrs
    
    def set_options(
        self,
        *,
        enable_gst: Optional[bool] = None,
        precision: Optional[str] = None,
        show_period: Optional[bool] = None,
        enable_gsy: Optional[bool] = None,
        epoch_gs0_utc: Optional[str] = None,
        gsy_length_days: Optional[float] = None,
        show_citadel_time: Optional[bool] = None
    ) -> None:
        """Set calendar options from config flow."""
        if enable_gst is not None:
            self._enable_gst = bool(enable_gst)
            _LOGGER.debug(f"Set enable_gst to: {enable_gst}")
        
        if precision is not None and precision in ["second", "centisecond", "millisecond"]:
            self._precision = precision
            _LOGGER.debug(f"Set precision to: {precision}")
        
        if show_period is not None:
            self._show_period = bool(show_period)
            _LOGGER.debug(f"Set show_period to: {show_period}")
        
        if enable_gsy is not None:
            self._enable_gsy = bool(enable_gsy)
            _LOGGER.debug(f"Set enable_gsy to: {enable_gsy}")
        
        if epoch_gs0_utc is not None:
            self._epoch_gs0_utc = str(epoch_gs0_utc)
            _LOGGER.debug(f"Set epoch_gs0_utc to: {epoch_gs0_utc}")
        
        if gsy_length_days is not None:
            if 300 <= gsy_length_days <= 500:
                self._gsy_length_days = float(gsy_length_days)
                _LOGGER.debug(f"Set gsy_length_days to: {gsy_length_days}")
            else:
                _LOGGER.warning(f"Invalid gsy_length_days: {gsy_length_days}, keeping {self._gsy_length_days}")
        
        if show_citadel_time is not None:
            self._show_citadel_time = bool(show_citadel_time)
            _LOGGER.debug(f"Set show_citadel_time to: {show_citadel_time}")

    # ---------- Helper methods ----------
    def _parse_epoch(self, txt: str) -> datetime:
        """Parse ISO8601 epoch string to datetime."""
        try:
            if txt.endswith('Z'):
                # Strip Z and set timezone
                base = txt[:-1]
                dt = datetime.fromisoformat(base)
                return dt.replace(tzinfo=timezone.utc)
            dt = datetime.fromisoformat(txt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except Exception as e:
            _LOGGER.warning("Invalid epoch_gs0_utc '%s': %s, using default 2183-01-01T00:00:00Z", txt, e)
            return datetime(2183, 1, 1, 0, 0, 0, tzinfo=timezone.utc)

    def _format_gst(self, gst_total_seconds: float) -> Dict[str, Any]:
        """Format GST seconds into readable time."""
        # Normalize to [0, day)
        gst_in_day = gst_total_seconds % self.GST_SECONDS_PER_DAY

        h = int(gst_in_day // self.GST_SECONDS_PER_HOUR)
        rem = gst_in_day - h * self.GST_SECONDS_PER_HOUR
        m = int(rem // self.GST_SECONDS_PER_MIN)
        s_float = rem - m * self.GST_SECONDS_PER_MIN
        s = int(s_float)

        # Sub-second precision
        centi = int((s_float - s) * 100)
        milli = int((s_float - s) * 1000)

        # Format based on precision
        if self._precision == "millisecond":
            formatted = f"{h:02d}:{m:03d}:{s:03d}.{milli:03d} GST"
        elif self._precision == "centisecond":
            formatted = f"{h:02d}:{m:03d}:{s:03d}.{centi:02d} GST"
        else:
            formatted = f"{h:02d}:{m:03d}:{s:03d} GST"

        # Time period (5 segments)
        period = ""
        if self._show_period:
            if h < 4:
                period = "Night Cycle"
            elif h < 8:
                period = "Dawn Cycle"
            elif h < 12:
                period = "Day Cycle"
            elif h < 16:
                period = "Dusk Cycle"
            else:
                period = "Evening Cycle"

        progress = (gst_in_day / self.GST_SECONDS_PER_DAY) * 100.0

        return {
            "gst_formatted": formatted,
            "gst_hours": h,
            "gst_minutes": m,
            "gst_seconds": s,
            "gst_centiseconds": centi if self._precision in ["centisecond", "millisecond"] else None,
            "gst_milliseconds": milli if self._precision == "millisecond" else None,
            "gst_day_progress": f"{progress:.1f}%",
            "gst_period": period if self._show_period else None
        }
    
    def _get_event_for_year(self, year: int) -> Optional[str]:
        """Get historical event for a given year."""
        events = CALENDAR_INFO["mass_effect_data"]["events"]
        return events.get(str(year))

    # ---------- Update method ----------
    def update(self) -> None:
        """Update the sensor state."""
        # Ensure options are loaded
        if not self._options_loaded:
            self._load_options()
        
        try:
            now_utc = datetime.now(timezone.utc)

            # Initialize data
            display_parts = []
            data: Dict[str, Any] = {
                "now_utc": now_utc.strftime("%Y-%m-%d %H:%M:%S UTC"),
                "config": {
                    "gst_enabled": self._enable_gst,
                    "gsy_enabled": self._enable_gsy,
                    "precision": self._precision,
                    "show_period": self._show_period,
                    "show_citadel": self._show_citadel_time
                }
            }

            # GST Clock
            if self._enable_gst:
                # Total GST seconds since Unix epoch
                unix_seconds = now_utc.timestamp()
                gst_total_seconds = unix_seconds * self.GST_SECONDS_PER_SEC
                gst_block = self._format_gst(gst_total_seconds)
                data.update(gst_block)
                display_parts.append(gst_block["gst_formatted"])

            # GSY Counter
            if self._enable_gsy:
                epoch_dt = self._parse_epoch(self._epoch_gs0_utc)
                delta = now_utc - epoch_dt
                earth_days = delta.total_seconds() / 86400.0
                gsy_float = earth_days / self._gsy_length_days
                gsy_year = int(gsy_float)
                gsy_frac = gsy_float - gsy_year

                # GST days in year
                gst_days_total = delta.total_seconds() / self.EARTH_SECONDS_PER_GST_DAY
                gst_days_in_year = self._gsy_length_days / (self.EARTH_SECONDS_PER_GST_DAY / 86400.0)
                doy_gst = gst_days_total - (int(gst_days_total / gst_days_in_year) * gst_days_in_year)

                # Check for historical event
                current_earth_year = epoch_dt.year + gsy_year
                event = self._get_event_for_year(current_earth_year)

                data.update({
                    "gsy_epoch_utc": epoch_dt.isoformat(),
                    "gsy_year": gsy_year,
                    "gsy_progress": f"{gsy_frac*100:.2f}%",
                    "gsy_length_days_earth": self._gsy_length_days,
                    "gsy_day_of_year_gst": round(doy_gst, 2),
                    "earth_year_equivalent": current_earth_year
                })
                
                if event:
                    data["historical_event"] = event
                
                display_parts.append(f"GSY {gsy_year}")

            # Citadel Time (optional)
            if self._show_citadel_time:
                # Citadel operates on a standard 24-hour cycle synced with GST
                citadel_hour = int((now_utc.hour * 20) / 24)
                citadel_min = int((now_utc.minute * 100) / 60)
                citadel_time = f"Citadel: {citadel_hour:02d}:{citadel_min:03d}"
                data["citadel_time"] = citadel_time
                display_parts.append(citadel_time)

            # Build state string
            if display_parts:
                self._state = " | ".join(display_parts)
            elif not self._enable_gst and not self._enable_gsy:
                self._state = "Disabled (enable GST or GSY)"
            else:
                self._state = "No data"
                
            self._data = data
            
            _LOGGER.debug(f"Updated Mass Effect to: {self._state}")

        except Exception as exc:
            _LOGGER.exception("Failed to update Mass Effect Galactic Standard: %s", exc)
            self._state = "Error"
            self._data = {"error": str(exc)}


# ============================================
# MODULE EXPORTS
# ============================================

# Export the sensor class
__all__ = ["MassEffectGalacticStandardSensor"]