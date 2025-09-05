"""Mars Time (MSD & Local Solar Time) implementation - Version 3.0.
Improved config options with better defaults and user-friendly timezone display.

Mars Sol Date (MSD) tracking and local solar time with multiple timezone support.
Includes mission sol counters for rover landing sites.
"""
from __future__ import annotations

from datetime import datetime
import math
import logging
from typing import Dict, Any, Optional

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (60 seconds = 1 minute)
UPDATE_INTERVAL = 60

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "mars",
    "version": "3.0.0",
    "icon": "mdi:rocket-launch",
    "category": "space",
    "accuracy": "scientific",
    "update_interval": UPDATE_INTERVAL,

    # Multi-language names
    "name": {
        "en": "Mars Sol Time",
        "de": "Mars Sol-Zeit",
        "es": "Tiempo Sol de Marte",
        "fr": "Temps Sol de Mars",
        "it": "Tempo Sol di Marte",
        "nl": "Mars Sol Tijd",
        "pt": "Tempo Sol de Marte",
        "ru": "Марсианское солнечное время",
        "ja": "火星ソル時間",
        "zh": "火星太阳时",
        "ko": "화성 솔 시간",
    },

    # Short descriptions for UI
    "description": {
        "en": "Mars Sol Date (MSD) and local solar time on Mars",
        "de": "Mars Sol-Datum (MSD) und lokale Sonnenzeit auf dem Mars",
        "es": "Fecha Sol de Marte (MSD) y hora solar local en Marte",
        "fr": "Date Sol de Mars (MSD) et heure solaire locale sur Mars",
        "it": "Data Sol di Marte (MSD) e ora solare locale su Marte",
        "nl": "Mars Sol Datum (MSD) en lokale zonnetijd op Mars",
        "pt": "Data Sol de Marte (MSD) e hora solar local em Marte",
        "ru": "Марсианская солнечная дата (MSD) и местное солнечное время на Марсе",
        "ja": "火星ソル日付（MSD）と火星の地方太陽時",
        "zh": "火星太阳日（MSD）和火星当地太阳时",
        "ko": "화성 솔 날짜(MSD)와 화성 현지 태양시",
    },

    # Mars-specific data
    "mars_data": {
        # Physical constants
        "sol_duration_seconds": 88775.244147,  # Mars solar day in Earth seconds
        "tropical_year_sols": 668.5991,        # Mars year in sols
        "j2000_epoch": 946727935.816,          # J2000 epoch in Unix timestamp
        "mars_epoch_msd": 44796.0,             # MSD at J2000 epoch

        # Mars timezones with full descriptions for dropdown
        "timezones": {
            # Standard Time
            "MTC": {
                "abbr": "MTC",
                "longitude": 0,
                "group": "Standard",
                "name": "Mars Coordinated Time",
                "dropdown_label": {
                    "en": "MTC - Mars Coordinated Time (Prime Meridian 0°)",
                    "de": "MTC - Mars-Koordinierte Zeit (Nullmeridian 0°)",
                    "es": "MTC - Tiempo Coordinado de Marte (Meridiano Principal 0°)",
                    "fr": "MTC - Temps Coordonné Martien (Méridien Principal 0°)",
                }
            },
            
            # Geographic Locations
            "AMT": {
                "abbr": "AMT",
                "longitude": -158,
                "group": "Provinces",
                "name": "Amazonis Time",
                "dropdown_label": {
                    "en": "AMT - Amazonis Time (Amazonis Planitia ~158°W)",
                    "de": "AMT - Amazonis-Zeit (Amazonis Planitia ~158°W)",
                    "es": "AMT - Hora de Amazonis (Amazonis Planitia ~158°O)",
                    "fr": "AMT - Heure d'Amazonis (Amazonis Planitia ~158°O)",
                }
            },
            "OLY": {
                "abbr": "OLY",
                "longitude": -134,
                "group": "Provinces",
                "name": "Olympus Time",
                "dropdown_label": {
                    "en": "OLY - Olympus Time (Olympus Mons ~134°W)",
                    "de": "OLY - Olympus-Zeit (Olympus Mons ~134°W)",
                    "es": "OLY - Hora del Olimpo (Olympus Mons ~134°O)",
                    "fr": "OLY - Heure d'Olympus (Olympus Mons ~134°O)",
                }
            },
            "ELY": {
                "abbr": "ELY",
                "longitude": 147,
                "group": "Provinces",
                "name": "Elysium Time",
                "dropdown_label": {
                    "en": "ELY - Elysium Time (Elysium Planitia ~147°E)",
                    "de": "ELY - Elysium-Zeit (Elysium Planitia ~147°O)",
                    "es": "ELY - Hora del Elíseo (Elysium Planitia ~147°E)",
                    "fr": "ELY - Heure d'Elysium (Elysium Planitia ~147°E)",
                }
            },
            "CHA": {
                "abbr": "CHA",
                "longitude": -30,
                "group": "Provinces",
                "name": "Chryse Time",
                "dropdown_label": {
                    "en": "CHA - Chryse Time (Chryse Planitia ~30°W)",
                    "de": "CHA - Chryse-Zeit (Chryse Planitia ~30°W)",
                    "es": "CHA - Hora de Chryse (Chryse Planitia ~30°O)",
                    "fr": "CHA - Heure de Chryse (Chryse Planitia ~30°O)",
                }
            },
            "MAR": {
                "abbr": "MAR",
                "longitude": -70,
                "group": "Provinces",
                "name": "Mariner Time",
                "dropdown_label": {
                    "en": "MAR - Mariner Time (Mariner Valley ~70°W)",
                    "de": "MAR - Mariner-Zeit (Mariner-Tal ~70°W)",
                    "es": "MAR - Hora del Mariner (Valle Mariner ~70°O)",
                    "fr": "MAR - Heure de Mariner (Vallée Mariner ~70°O)",
                }
            },
            "ARA": {
                "abbr": "ARA",
                "longitude": 20,
                "group": "Provinces",
                "name": "Arabia Time",
                "dropdown_label": {
                    "en": "ARA - Arabia Time (Arabia Terra ~20°E)",
                    "de": "ARA - Arabia-Zeit (Arabia Terra ~20°O)",
                    "es": "ARA - Hora de Arabia (Arabia Terra ~20°E)",
                    "fr": "ARA - Heure d'Arabia (Arabia Terra ~20°E)",
                }
            },
            "THR": {
                "abbr": "THR",
                "longitude": -110,
                "group": "Provinces",
                "name": "Tharsis Time",
                "dropdown_label": {
                    "en": "THR - Tharsis Time (Tharsis Region ~110°W)",
                    "de": "THR - Tharsis-Zeit (Tharsis-Region ~110°W)",
                    "es": "THR - Hora de Tharsis (Región Tharsis ~110°O)",
                    "fr": "THR - Heure de Tharsis (Région Tharsis ~110°O)",
                }
            },
            "HEL": {
                "abbr": "HEL",
                "longitude": 70,
                "group": "Provinces",
                "name": "Hellas Time",
                "dropdown_label": {
                    "en": "HEL - Hellas Time (Hellas Basin ~70°E)",
                    "de": "HEL - Hellas-Zeit (Hellas-Becken ~70°O)",
                    "es": "HEL - Hora de Hellas (Cuenca Hellas ~70°E)",
                    "fr": "HEL - Heure d'Hellas (Bassin Hellas ~70°E)",
                }
            },
            
            # Mission Landing Sites
            "VIK": {
                "abbr": "VIK",
                "longitude": -48,
                "group": "Missions",
                "name": "Viking 1 Site",
                "mission": "Viking 1",
                "dropdown_label": {
                    "en": "VIK - Viking 1 Landing Site (Chryse Planitia ~48°W)",
                    "de": "VIK - Viking 1 Landeplatz (Chryse Planitia ~48°W)",
                    "es": "VIK - Sitio de Viking 1 (Chryse Planitia ~48°O)",
                    "fr": "VIK - Site de Viking 1 (Chryse Planitia ~48°O)",
                }
            },
            "PTH": {
                "abbr": "PTH",
                "longitude": -33.5,
                "group": "Missions",
                "name": "Pathfinder Site",
                "mission": "Pathfinder",
                "dropdown_label": {
                    "en": "PTH - Pathfinder Landing Site (Ares Vallis ~33.5°W)",
                    "de": "PTH - Pathfinder Landeplatz (Ares Vallis ~33.5°W)",
                    "es": "PTH - Sitio del Pathfinder (Ares Vallis ~33.5°O)",
                    "fr": "PTH - Site de Pathfinder (Ares Vallis ~33.5°O)",
                }
            },
            "OPP": {
                "abbr": "OPP",
                "longitude": -5.5,
                "group": "Missions",
                "name": "Opportunity Site",
                "mission": "Opportunity",
                "dropdown_label": {
                    "en": "OPP - Opportunity Landing Site (Meridiani Planum ~5.5°W)",
                    "de": "OPP - Opportunity Landeplatz (Meridiani Planum ~5.5°W)",
                    "es": "OPP - Sitio de Opportunity (Meridiani Planum ~5.5°O)",
                    "fr": "OPP - Site d'Opportunity (Meridiani Planum ~5.5°O)",
                }
            },
            "SPI": {
                "abbr": "SPI",
                "longitude": 175.5,
                "group": "Missions",
                "name": "Spirit Site",
                "mission": "Spirit",
                "dropdown_label": {
                    "en": "SPI - Spirit Landing Site (Gusev Crater ~175.5°E)",
                    "de": "SPI - Spirit Landeplatz (Gusev-Krater ~175.5°O)",
                    "es": "SPI - Sitio de Spirit (Cráter Gusev ~175.5°E)",
                    "fr": "SPI - Site de Spirit (Cratère Gusev ~175.5°E)",
                }
            },
            "CUR": {
                "abbr": "CUR",
                "longitude": 137.4,
                "group": "Missions",
                "name": "Curiosity Site",
                "mission": "Curiosity",
                "dropdown_label": {
                    "en": "CUR - Curiosity Landing Site (Gale Crater ~137.4°E)",
                    "de": "CUR - Curiosity Landeplatz (Gale-Krater ~137.4°O)",
                    "es": "CUR - Sitio de Curiosity (Cráter Gale ~137.4°E)",
                    "fr": "CUR - Site de Curiosity (Cratère Gale ~137.4°E)",
                }
            },
            "PER": {
                "abbr": "PER",
                "longitude": 77.5,
                "group": "Missions",
                "name": "Perseverance Site",
                "mission": "Perseverance",
                "dropdown_label": {
                    "en": "PER - Perseverance Landing Site (Jezero Crater ~77.5°E)",
                    "de": "PER - Perseverance Landeplatz (Jezero-Krater ~77.5°O)",
                    "es": "PER - Sitio de Perseverance (Cráter Jezero ~77.5°E)",
                    "fr": "PER - Site de Perseverance (Cratère Jezero ~77.5°E)",
                }
            },
        },

        # Mission landing dates (MSD) for sol counters
        "missions": {
            "Viking 1": 34809,
            "Viking 2": 34895,
            "Pathfinder": 46236,
            "Spirit": 49269,
            "Opportunity": 49290,
            "Curiosity": 49269,
            "Perseverance": 52304,
        },

        # Mars seasons (Northern Hemisphere)
        "seasons": {
            "spring": {"ls_start": 0, "ls_end": 90, "name": {"en": "Northern Spring", "de": "Nördlicher Frühling"}},
            "summer": {"ls_start": 90, "ls_end": 180, "name": {"en": "Northern Summer", "de": "Nördlicher Sommer"}},
            "autumn": {"ls_start": 180, "ls_end": 270, "name": {"en": "Northern Autumn", "de": "Nördlicher Herbst"}},
            "winter": {"ls_start": 270, "ls_end": 360, "name": {"en": "Northern Winter", "de": "Nördlicher Winter"}},
        },
    },

    # Configuration options for config_flow
    "config_options": {
        "timezone": {
            "type": "select",
            "default": "MTC",
            "options": ["MTC", "AMT", "OLY", "ELY", "CHA", "MAR", "ARA", "THR", "HEL", "VIK", "PTH", "OPP", "SPI", "CUR", "PER"],
            "label": {
                "en": "Mars Timezone",
                "de": "Mars-Zeitzone",
                "es": "Zona horaria de Marte",
                "fr": "Fuseau horaire martien",
                "it": "Fuso orario marziano",
                "nl": "Mars tijdzone",
                "pt": "Fuso horário de Marte",
                "ru": "Часовой пояс Марса",
                "ja": "火星タイムゾーン",
                "zh": "火星时区",
                "ko": "화성 시간대",
            },
            "description": {
                "en": "Choose Mars timezone or mission landing site",
                "de": "Wähle Mars-Zeitzone oder Missions-Landeplatz",
                "es": "Elige zona horaria de Marte o sitio de aterrizaje",
                "fr": "Choisissez le fuseau horaire martien ou le site d'atterrissage",
                "it": "Scegli il fuso orario marziano o il sito di atterraggio",
                "nl": "Kies Mars tijdzone of missie landingsplaats",
                "pt": "Escolha o fuso horário de Marte ou local de pouso",
                "ru": "Выберите часовой пояс Марса или место посадки миссии",
                "ja": "火星のタイムゾーンまたは着陸地点を選択",
                "zh": "选择火星时区或任务着陆点",
                "ko": "화성 시간대 또는 임무 착륙 지점 선택",
            },
        },
        "display_format": {
            "type": "select",
            "default": "time_with_sol",
            "options": ["time_only", "time_with_sol", "full_date"],
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
            },
            "description": {
                "en": "Choose how to display Mars time",
                "de": "Wähle wie die Marszeit angezeigt wird",
                "es": "Elige cómo mostrar la hora de Marte",
                "fr": "Choisissez comment afficher l'heure martienne",
                "it": "Scegli come visualizzare l'ora marziana",
                "nl": "Kies hoe Mars tijd wordt weergegeven",
                "pt": "Escolha como exibir a hora de Marte",
                "ru": "Выберите формат отображения марсианского времени",
                "ja": "火星時間の表示方法を選択",
                "zh": "选择如何显示火星时间",
                "ko": "화성 시간 표시 방법 선택",
            },
        },
        "show_season": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Season",
                "de": "Jahreszeit anzeigen",
                "es": "Mostrar estación",
                "fr": "Afficher la saison",
                "it": "Mostra stagione",
                "nl": "Toon seizoen",
                "pt": "Mostrar estação",
                "ru": "Показать сезон",
                "ja": "季節を表示",
                "zh": "显示季节",
                "ko": "계절 표시",
            },
            "description": {
                "en": "Display current Martian season",
                "de": "Zeige aktuelle Mars-Jahreszeit",
                "es": "Mostrar la estación marciana actual",
                "fr": "Afficher la saison martienne actuelle",
                "it": "Mostra la stagione marziana attuale",
                "nl": "Toon huidige Mars seizoen",
                "pt": "Mostrar estação marciana atual",
                "ru": "Показывать текущий марсианский сезон",
                "ja": "現在の火星の季節を表示",
                "zh": "显示当前火星季节",
                "ko": "현재 화성 계절 표시",
            },
        },
        "show_mission_sol": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Mission Sol",
                "de": "Missions-Sol anzeigen",
                "es": "Mostrar sol de misión",
                "fr": "Afficher sol de mission",
                "it": "Mostra sol missione",
                "nl": "Toon missie sol",
                "pt": "Mostrar sol da missão",
                "ru": "Показать сол миссии",
                "ja": "ミッションソルを表示",
                "zh": "显示任务火星日",
                "ko": "임무 솔 표시",
            },
            "description": {
                "en": "Show sol count for mission landing sites",
                "de": "Zeige Sol-Zähler für Missions-Landeplätze",
                "es": "Mostrar contador de sol para sitios de aterrizaje",
                "fr": "Afficher le compteur de sol pour les sites d'atterrissage",
                "it": "Mostra contatore sol per i siti di atterraggio",
                "nl": "Toon sol teller voor missie landingsplaatsen",
                "pt": "Mostrar contador de sol para locais de pouso",
                "ru": "Показывать счетчик солов для мест посадки миссий",
                "ja": "着陸地点のソルカウンターを表示",
                "zh": "显示任务着陆点的火星日计数",
                "ko": "임무 착륙 지점의 솔 카운터 표시",
            },
        },
        "show_earth_time": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Earth Time",
                "de": "Erdzeit anzeigen",
                "es": "Mostrar hora terrestre",
                "fr": "Afficher l'heure terrestre",
                "it": "Mostra ora terrestre",
                "nl": "Toon Aardse tijd",
                "pt": "Mostrar hora terrestre",
                "ru": "Показать земное время",
                "ja": "地球時間を表示",
                "zh": "显示地球时间",
                "ko": "지구 시간 표시",
            },
            "description": {
                "en": "Also display Earth UTC time",
                "de": "Zeige auch Erd-UTC Zeit",
                "es": "Mostrar también hora UTC terrestre",
                "fr": "Afficher aussi l'heure UTC terrestre",
                "it": "Mostra anche l'ora UTC terrestre",
                "nl": "Toon ook Aardse UTC tijd",
                "pt": "Mostrar também hora UTC terrestre",
                "ru": "Показывать также земное время UTC",
                "ja": "地球のUTC時間も表示",
                "zh": "同时显示地球UTC时间",
                "ko": "지구 UTC 시간도 표시",
            },
        },
    },

    # Additional metadata
    "reference_url": "https://en.wikipedia.org/wiki/Timekeeping_on_Mars",
    "documentation_url": "https://www.giss.nasa.gov/tools/mars24/",
    "origin": "NASA/JPL",
    "created_by": "Various Mars missions",
    
    # Related calendars
    "related": ["darian", "julian", "gregorian"],
    
    # Tags for searching and filtering
    "tags": [
        "mars", "space", "planetary", "sol", "msd", "nasa", "jpl",
        "scientific", "astronomical", "mission", "exploration", "rover",
        "perseverance", "curiosity", "mtc"
    ],
    
    # Extended notes
    "notes": {
        "en": (
            "Mars Sol Date (MSD) counts sols since December 29, 1873. "
            "A sol is approximately 24 hours 39 minutes. "
            "Mission sols count from each rover's landing date."
        ),
        "de": (
            "Mars Sol Date (MSD) zählt Sols seit dem 29. Dezember 1873. "
            "Ein Sol dauert etwa 24 Stunden 39 Minuten. "
            "Missions-Sols zählen ab dem Landedatum jedes Rovers."
        ),
    },
}


# ============================================
# SENSOR CLASS
# ============================================

class MarsTimeSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Mars time with timezone support."""

    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL

    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Mars time sensor."""
        super().__init__(base_name, hass)

        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO

        # Localized name for the entity
        calendar_name = self._translate("name", "Mars Sol Time")

        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_mars_time"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:rocket-launch")

        # Configuration options with defaults
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._mars_timezone = config_defaults.get("timezone", {}).get("default", "MTC")
        self._display_format = config_defaults.get("display_format", {}).get("default", "time_with_sol")
        self._show_season = config_defaults.get("show_season", {}).get("default", True)
        self._show_mission_sol = config_defaults.get("show_mission_sol", {}).get("default", True)
        self._show_earth_time = config_defaults.get("show_earth_time", {}).get("default", False)

        # Mars data
        self._mars_data = CALENDAR_INFO["mars_data"]

        # Flag to track if options have been loaded
        self._options_loaded = False

        # Initialize state
        self._state = None
        self._mars_time_info: Dict[str, Any] = {}

        _LOGGER.debug(f"Initialized Mars Time sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        # Get plugin options from config entry
        plugin_options = self._get_plugin_options()
        
        if plugin_options:
            _LOGGER.debug(f"Loading Mars options: {plugin_options}")
            
            # Apply options using set_options method
            self.set_options(
                timezone=plugin_options.get("timezone"),
                display_format=plugin_options.get("display_format"),
                show_season=plugin_options.get("show_season"),
                show_mission_sol=plugin_options.get("show_mission_sol"),
                show_earth_time=plugin_options.get("show_earth_time")
            )
        
        self._options_loaded = True
    
    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()
        
        # Load options after entity is registered
        self._load_options()
        
        _LOGGER.debug(f"Mars sensor added to hass with options: "
                     f"timezone={self._mars_timezone}, format={self._display_format}, "
                     f"season={self._show_season}, mission_sol={self._show_mission_sol}")
    
    def set_options(
        self,
        *,
        timezone: Optional[str] = None,
        display_format: Optional[str] = None,
        show_season: Optional[bool] = None,
        show_mission_sol: Optional[bool] = None,
        show_earth_time: Optional[bool] = None
    ) -> None:
        """Set calendar options from config flow."""
        if timezone is not None:
            if timezone in self._mars_data.get("timezones", {}):
                self._mars_timezone = timezone
                _LOGGER.debug(f"Set timezone to: {timezone}")
            else:
                _LOGGER.warning(f"Invalid timezone: {timezone}, keeping {self._mars_timezone}")
        
        if display_format is not None and display_format in ["time_only", "time_with_sol", "full_date"]:
            self._display_format = display_format
            _LOGGER.debug(f"Set display_format to: {display_format}")
        
        if show_season is not None:
            self._show_season = bool(show_season)
            _LOGGER.debug(f"Set show_season to: {show_season}")
        
        if show_mission_sol is not None:
            self._show_mission_sol = bool(show_mission_sol)
            _LOGGER.debug(f"Set show_mission_sol to: {show_mission_sol}")
        
        if show_earth_time is not None:
            self._show_earth_time = bool(show_earth_time)
            _LOGGER.debug(f"Set show_earth_time to: {show_earth_time}")

    # ---------- HA properties ----------

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        if self._mars_time_info:
            attrs.update(self._mars_time_info)
            
            # Add metadata
            attrs["calendar_type"] = "Mars Sol Time"
            attrs["accuracy"] = CALENDAR_INFO.get("accuracy", "scientific")
            attrs["reference"] = CALENDAR_INFO.get("reference_url")
            attrs["notes"] = self._translate("notes")
            
            # Add configuration state
            attrs["config_timezone"] = self._mars_timezone
            attrs["config_display_format"] = self._display_format
            attrs["config_show_season"] = self._show_season
            attrs["config_show_mission_sol"] = self._show_mission_sol
            attrs["config_show_earth_time"] = self._show_earth_time
        
        return attrs

    # ---------- Calculation methods ----------

    def _calculate_mars_time(self, earth_utc: datetime) -> Dict[str, Any]:
        """Calculate Mars time from Earth UTC."""
        # Get timezone data
        tz_data = self._mars_data["timezones"].get(self._mars_timezone, self._mars_data["timezones"]["MTC"])
        timezone_offset = tz_data["longitude"] / 15.0  # Convert degrees to hours
        
        # Calculate MSD (Mars Sol Date)
        unix_timestamp = earth_utc.timestamp()
        seconds_since_j2000 = unix_timestamp - self._mars_data["j2000_epoch"]
        sols_since_j2000 = seconds_since_j2000 / self._mars_data["sol_duration_seconds"]
        msd = self._mars_data["mars_epoch_msd"] + sols_since_j2000
        
        # Calculate MTC (Mars Coordinated Time)
        sol_fraction = msd % 1.0
        mtc_hours = int(sol_fraction * 24)
        mtc_minutes = int((sol_fraction * 24 * 60) % 60)
        mtc_seconds = int((sol_fraction * 24 * 60 * 60) % 60)
        mtc_time = f"{mtc_hours:02d}:{mtc_minutes:02d}:{mtc_seconds:02d}"
        
        # Calculate local Mars time
        local_hours = int((sol_fraction * 24 + timezone_offset) % 24)
        local_time = f"{local_hours:02d}:{mtc_minutes:02d}:{mtc_seconds:02d}"
        
        # Calculate solar longitude (Ls) for seasons
        # Simplified calculation
        mars_year_fraction = (msd / self._mars_data["tropical_year_sols"]) % 1.0
        ls = mars_year_fraction * 360.0
        
        # Determine season
        season = None
        if self._show_season:
            for season_key, season_data in self._mars_data["seasons"].items():
                if season_data["ls_start"] <= ls < season_data["ls_end"]:
                    season = self._translate_dict(season_data["name"], "Northern Spring")
                    break
        
        # Calculate mission sol if applicable
        mission_sol = None
        mission_name = None
        if self._show_mission_sol:
            mission_name = tz_data.get("mission")
            if mission_name and mission_name in self._mars_data["missions"]:
                landing_msd = self._mars_data["missions"][mission_name]
                mission_sol = int(msd - landing_msd)
        
        # Build result
        result: Dict[str, Any] = {
            "msd": round(msd, 4),
            "sol_number": int(msd),
            "mtc": mtc_time,
            "local_time": local_time,
            "timezone": self._mars_timezone,
            "timezone_name": tz_data["name"],
            "timezone_offset": round(timezone_offset, 2),
            "solar_longitude": round(ls, 1),
        }
        
        if season and self._show_season:
            result["season"] = season
        
        if mission_sol is not None and mission_name and self._show_mission_sol:
            result["mission_sol"] = mission_sol
            result["mission_name"] = mission_name
        
        if self._show_earth_time:
            result["earth_time_utc"] = earth_utc.strftime("%Y-%m-%d %H:%M:%S UTC")
        
        return result
    
    def _translate_dict(self, data: Dict[str, str], default: str) -> str:
        """Translate from a dictionary based on current language."""
        if isinstance(data, dict):
            lang = self._get_language()
            return data.get(lang, data.get("en", default))
        return str(data or default)
    
    def _get_language(self) -> str:
        """Get current language setting."""
        try:
            lang = getattr(self._hass.config, "language", "en")
            if "-" in lang:
                lang = lang.split("-")[0]
            if "_" in lang:
                lang = lang.split("_")[0]
            return lang
        except:
            return "en"

    # ---------- Update method ----------

    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded
        if not self._options_loaded:
            self._load_options()
        
        now = datetime.utcnow()
        self._mars_time_info = self._calculate_mars_time(now)
        
        # Format state based on display_format
        if self._display_format == "time_only":
            # Just the time and timezone
            self._state = f"{self._mars_time_info['local_time']} {self._mars_timezone}"
        elif self._display_format == "time_with_sol":
            # Time with sol number
            sol = self._mars_time_info['sol_number']
            self._state = f"Sol {sol}, {self._mars_time_info['local_time']} {self._mars_timezone}"
        else:  # full_date
            # Full format with mission sol if available
            sol = self._mars_time_info['sol_number']
            mission_info = ""
            if "mission_sol" in self._mars_time_info:
                mission_info = f" (Sol {self._mars_time_info['mission_sol']})"
            self._state = f"MSD {sol}, {self._mars_time_info['local_time']} {self._mars_timezone}{mission_info}"
        
        _LOGGER.debug(f"Updated Mars Time to {self._state}")


# ============================================
# MODULE EXPORTS
# ============================================

# Export the sensor class
__all__ = ["MarsTimeSensor"]