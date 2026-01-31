"""World of Warcraft Calendar implementation - Version 2.7."""
from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Dict, Any, Optional

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (3600 seconds = 1 hour for game world dates)
UPDATE_INTERVAL = 3600

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "warcraft",
    "version": "2.7.0",
    "icon": "mdi:sword",
    "category": "gaming",
    "accuracy": "fictional",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "World of Warcraft Calendar",
        "de": "World of Warcraft Kalender",
        "es": "Calendario de World of Warcraft",
        "fr": "Calendrier World of Warcraft",
        "it": "Calendario di World of Warcraft",
        "nl": "World of Warcraft Kalender",
        "pt": "Calendário World of Warcraft",
        "ru": "Календарь World of Warcraft",
        "ja": "ワールド・オブ・ウォークラフト暦",
        "zh": "魔兽世界日历",
        "ko": "월드 오브 워크래프트 달력"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Azeroth calendar with seasonal events and moon phases",
        "de": "Azeroth-Kalender mit saisonalen Events und Mondphasen",
        "es": "Calendario de Azeroth con eventos estacionales y fases lunares",
        "fr": "Calendrier d'Azeroth avec événements saisonniers et phases lunaires",
        "it": "Calendario di Azeroth con eventi stagionali e fasi lunari",
        "nl": "Azeroth kalender met seizoensgebonden evenementen en maanfasen",
        "pt": "Calendário de Azeroth com eventos sazonais e fases da lua",
        "ru": "Календарь Азерота с сезонными событиями и фазами луны",
        "ja": "季節のイベントと月相を含むアゼロスカレンダー",
        "zh": "包含季节活动和月相的艾泽拉斯日历",
        "ko": "계절 이벤트와 달의 위상이 포함된 아제로스 달력"
    },
    
    # Configuration options for config_flow
    "config_options": {
        "faction": {
            "type": "select",
            "default": "Neutral",
            "options": ["Alliance", "Horde", "Neutral"],
            "label": {
                "en": "Faction",
                "de": "Fraktion",
                "es": "Facción",
                "fr": "Faction",
                "it": "Fazione",
                "nl": "Factie",
                "pt": "Facção",
                "ru": "Фракция",
                "ja": "陣営",
                "zh": "阵营",
                "ko": "진영"
            },
            "description": {
                "en": "Choose your faction for specific holidays",
                "de": "Wähle deine Fraktion für spezifische Feiertage",
                "es": "Elige tu facción para días festivos específicos",
                "fr": "Choisissez votre faction pour des fêtes spécifiques",
                "it": "Scegli la tua fazione per festività specifiche",
                "nl": "Kies je factie voor specifieke feestdagen",
                "pt": "Escolha sua facção para feriados específicos",
                "ru": "Выберите фракцию для праздников",
                "ja": "特定の祝日のための陣営を選択",
                "zh": "选择你的阵营以获得特定节日",
                "ko": "특정 휴일을 위한 진영 선택"
            }
        },
        "region": {
            "type": "select",
            "default": "Eastern Kingdoms",
            "options": ["Eastern Kingdoms", "Kalimdor", "Northrend", "Pandaria", "Broken Isles", "Shadowlands", "Dragon Isles"],
            "label": {
                "en": "Region",
                "de": "Region",
                "es": "Región",
                "fr": "Région",
                "it": "Regione",
                "nl": "Regio",
                "pt": "Região",
                "ru": "Регион",
                "ja": "地域",
                "zh": "地区",
                "ko": "지역"
            },
            "description": {
                "en": "Select your current region in Azeroth",
                "de": "Wähle deine aktuelle Region in Azeroth",
                "es": "Selecciona tu región actual en Azeroth",
                "fr": "Sélectionnez votre région actuelle à Azeroth",
                "it": "Seleziona la tua regione attuale in Azeroth",
                "nl": "Selecteer je huidige regio in Azeroth",
                "pt": "Selecione sua região atual em Azeroth",
                "ru": "Выберите текущий регион в Азероте",
                "ja": "アゼロスの現在の地域を選択",
                "zh": "选择你在艾泽拉斯的当前地区",
                "ko": "아제로스의 현재 지역 선택"
            }
        },
        "show_events": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Events",
                "de": "Events anzeigen",
                "es": "Mostrar eventos",
                "fr": "Afficher les événements",
                "it": "Mostra eventi",
                "nl": "Toon evenementen",
                "pt": "Mostrar eventos",
                "ru": "Показать события",
                "ja": "イベントを表示",
                "zh": "显示事件",
                "ko": "이벤트 표시"
            },
            "description": {
                "en": "Display seasonal events and holidays",
                "de": "Zeige saisonale Events und Feiertage",
                "es": "Mostrar eventos estacionales y días festivos",
                "fr": "Afficher les événements saisonniers et les fêtes",
                "it": "Mostra eventi stagionali e festività",
                "nl": "Toon seizoensgebonden evenementen en feestdagen",
                "pt": "Mostrar eventos sazonais e feriados",
                "ru": "Показывать сезонные события и праздники",
                "ja": "季節のイベントと祝日を表示",
                "zh": "显示季节性活动和节日",
                "ko": "계절 이벤트 및 휴일 표시"
            }
        },
        "show_moons": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Moon Phases",
                "de": "Mondphasen anzeigen",
                "es": "Mostrar fases lunares",
                "fr": "Afficher les phases lunaires",
                "it": "Mostra fasi lunari",
                "nl": "Toon maanfasen",
                "pt": "Mostrar fases da lua",
                "ru": "Показать фазы луны",
                "ja": "月相を表示",
                "zh": "显示月相",
                "ko": "달의 위상 표시"
            },
            "description": {
                "en": "Display the phases of Azeroth's moons",
                "de": "Zeige die Phasen von Azeroths Monden",
                "es": "Mostrar las fases de las lunas de Azeroth",
                "fr": "Afficher les phases des lunes d'Azeroth",
                "it": "Mostra le fasi delle lune di Azeroth",
                "nl": "Toon de fasen van Azeroths manen",
                "pt": "Mostrar as fases das luas de Azeroth",
                "ru": "Показывать фазы лун Азерота",
                "ja": "アゼロスの月の相を表示",
                "zh": "显示艾泽拉斯卫星的相位",
                "ko": "아제로스 달의 위상 표시"
            }
        },
        "show_dragon_aspect": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Dragon Aspect",
                "de": "Drachenaspekt anzeigen",
                "es": "Mostrar aspecto de dragón",
                "fr": "Afficher l'aspect du dragon",
                "it": "Mostra aspetto del drago",
                "nl": "Toon drakenaspect",
                "pt": "Mostrar aspecto do dragão",
                "ru": "Показать аспект дракона",
                "ja": "ドラゴンアスペクトを表示",
                "zh": "显示龙族守护者",
                "ko": "용의 위상 표시"
            },
            "description": {
                "en": "Show the Dragon Aspect of the day",
                "de": "Zeige den Drachenaspekt des Tages",
                "es": "Mostrar el aspecto de dragón del día",
                "fr": "Afficher l'aspect du dragon du jour",
                "it": "Mostra l'aspetto del drago del giorno",
                "nl": "Toon het drakenaspect van de dag",
                "pt": "Mostrar o aspecto do dragão do dia",
                "ru": "Показывать аспект дракона дня",
                "ja": "その日のドラゴンアスペクトを表示",
                "zh": "显示当日的龙族守护者",
                "ko": "오늘의 용의 위상 표시"
            }
        }
    },
    
    # Warcraft-specific calendar data
    "warcraft_data": {
        # Months in Azeroth
        "months": [
            {"name": "January", "days": 31, "season": "Winter"},
            {"name": "February", "days": 28, "season": "Winter"},
            {"name": "March", "days": 31, "season": "Spring"},
            {"name": "April", "days": 30, "season": "Spring"},
            {"name": "May", "days": 31, "season": "Spring"},
            {"name": "June", "days": 30, "season": "Summer"},
            {"name": "July", "days": 31, "season": "Summer"},
            {"name": "August", "days": 31, "season": "Summer"},
            {"name": "September", "days": 30, "season": "Fall"},
            {"name": "October", "days": 31, "season": "Fall"},
            {"name": "November", "days": 30, "season": "Fall"},
            {"name": "December", "days": 31, "season": "Winter"}
        ],
        
        # Days of the week in Azeroth
        "weekdays": [
            "Day of the Sun",
            "Day of the Moon", 
            "Day of the Earth",
            "Day of the Storm",
            "Day of the Sky",
            "Day of the Stars",
            "Day of the Wisp"
        ],
        
        # Special annual events
        "events": {
            "1-1": "New Year",
            "1-23": "Lunar Festival Start",
            "2-14": "Love is in the Air",
            "3-17": "Noblegarden",
            "4-30": "Children's Week Start",
            "6-21": "Midsummer Fire Festival Start",
            "7-4": "Fireworks Spectacular",
            "9-19": "Harvest Festival",
            "9-20": "Brewfest Start",
            "10-18": "Hallow's End Start",
            "11-1": "Day of the Dead",
            "11-7": "Pilgrim's Bounty Start",
            "12-15": "Winter Veil Start"
        },
        
        # Faction-specific events
        "faction_events": {
            "Alliance": {
                "7-30": "Operation: Gnomeregan",
                "8-15": "Remembrance of Varian Wrynn"
            },
            "Horde": {
                "7-30": "Zalazane's Fall",
                "8-15": "Remembrance of Vol'jin"
            }
        },
        
        # Moons of Azeroth
        "moons": {
            "white_lady": {
                "name": "The White Lady",
                "cycle_days": 28,
                "phases": ["New", "Waxing Crescent", "First Quarter", "Waxing Gibbous", 
                          "Full", "Waning Gibbous", "Last Quarter", "Waning Crescent"]
            },
            "blue_child": {
                "name": "The Blue Child",
                "cycle_days": 35,
                "phases": ["Hidden", "Visible"]
            }
        },
        
        # Timeline reference (Years since the Dark Portal opened)
        "epoch_event": "Opening of the Dark Portal",
        "current_year": 35,  # Year 35 after the Dark Portal
        
        # Dragon Aspects and their domains
        "dragon_aspects": {
            "Alexstrasza": "Life",
            "Ysera": "Dreams",
            "Nozdormu": "Time",
            "Kalecgos": "Magic",
            "Wrathion": "Earth"
        }
    },
    
    # Additional metadata
    "reference_url": "https://wowpedia.fandom.com/wiki/Calendar",
    "documentation_url": "https://worldofwarcraft.com/",
    "origin": "Blizzard Entertainment",
    "created_by": "World of Warcraft Team",
    "introduced": "2004",
    
    # Related calendars
    "related": ["elder_scrolls", "star_wars"],
    
    # Tags for searching and filtering
    "tags": [
        "gaming", "fantasy", "warcraft", "azeroth", "blizzard",
        "mmorpg", "seasonal", "events", "moons", "dragon"
    ],
    
    # Extended description
    "notes": {
        "en": "The World of Warcraft calendar follows Earth months but includes Azeroth-specific events, dual moon phases, and Dragon Aspect influences. Years are counted from the opening of the Dark Portal.",
        "de": "Der World of Warcraft Kalender folgt Erdmonaten, enthält aber Azeroth-spezifische Events, duale Mondphasen und Drachenaspekt-Einflüsse. Jahre werden seit der Öffnung des Dunklen Portals gezählt."
    }
}


# ============================================
# SENSOR CLASS
# ============================================

class WarcraftCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying World of Warcraft calendar dates."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Warcraft calendar sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable for _translate method
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'World of Warcraft Calendar')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_warcraft"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:sword")
        
        # Configuration options with defaults from CALENDAR_INFO
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._faction = config_defaults.get("faction", {}).get("default", "Neutral")
        self._region = config_defaults.get("region", {}).get("default", "Eastern Kingdoms")
        self._show_events = config_defaults.get("show_events", {}).get("default", True)
        self._show_moons = config_defaults.get("show_moons", {}).get("default", True)
        self._show_dragon_aspect = config_defaults.get("show_dragon_aspect", {}).get("default", True)
        
        # Warcraft data
        self._warcraft_data = CALENDAR_INFO["warcraft_data"]
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        # Initialize state
        self._state = None
        self._warcraft_date = {}
        
        _LOGGER.debug(f"Initialized Warcraft Calendar sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        # Get plugin options from config entry
        plugin_options = self._get_plugin_options()
        
        if plugin_options:
            _LOGGER.debug(f"Loading Warcraft options: {plugin_options}")
            
            # Apply options using set_options method
            self.set_options(
                faction=plugin_options.get("faction"),
                region=plugin_options.get("region"),
                show_events=plugin_options.get("show_events"),
                show_moons=plugin_options.get("show_moons"),
                show_dragon_aspect=plugin_options.get("show_dragon_aspect")
            )
        
        self._options_loaded = True
    
    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()
        
        # Load options after entity is registered
        self._load_options()
        
        _LOGGER.debug(f"Warcraft Calendar sensor added to hass with options: "
                     f"faction={self._faction}, region={self._region}, "
                     f"show_events={self._show_events}, show_moons={self._show_moons}, "
                     f"show_dragon_aspect={self._show_dragon_aspect}")
    
    def set_options(
        self,
        *,
        faction: Optional[str] = None,
        region: Optional[str] = None,
        show_events: Optional[bool] = None,
        show_moons: Optional[bool] = None,
        show_dragon_aspect: Optional[bool] = None
    ) -> None:
        """Set calendar options from config flow."""
        if faction is not None and faction in ["Alliance", "Horde", "Neutral"]:
            self._faction = faction
            _LOGGER.debug(f"Set faction to: {faction}")
        
        if region is not None and region in ["Eastern Kingdoms", "Kalimdor", "Northrend", 
                                              "Pandaria", "Broken Isles", "Shadowlands", "Dragon Isles"]:
            self._region = region
            _LOGGER.debug(f"Set region to: {region}")
        
        if show_events is not None:
            self._show_events = bool(show_events)
            _LOGGER.debug(f"Set show_events to: {show_events}")
        
        if show_moons is not None:
            self._show_moons = bool(show_moons)
            _LOGGER.debug(f"Set show_moons to: {show_moons}")
        
        if show_dragon_aspect is not None:
            self._show_dragon_aspect = bool(show_dragon_aspect)
            _LOGGER.debug(f"Set show_dragon_aspect to: {show_dragon_aspect}")
    
    def _calculate_warcraft_date(self, dt: datetime) -> Dict[str, Any]:
        """Calculate the Warcraft date from a datetime."""
        # Get current date parts
        year = self._warcraft_data["current_year"]
        month_idx = dt.month - 1
        month_data = self._warcraft_data["months"][month_idx]
        month_name = month_data["name"]
        day = dt.day
        weekday_idx = dt.weekday()
        weekday = self._warcraft_data["weekdays"][weekday_idx]
        
        # Format main date
        formatted = f"{weekday}, {month_name} {day}, Year {year}"
        
        # Calculate current event
        event = None
        if self._show_events:
            date_key = f"{dt.month}-{dt.day}"
            event = self._warcraft_data["events"].get(date_key)
            
            # Check faction-specific events
            if self._faction in self._warcraft_data["faction_events"]:
                faction_event = self._warcraft_data["faction_events"][self._faction].get(date_key)
                if faction_event:
                    event = faction_event
        
        # Calculate moon phases
        moon_phases = {}
        if self._show_moons:
            # White Lady (28-day cycle)
            white_lady = self._warcraft_data["moons"]["white_lady"]
            days_since_epoch = (dt - datetime(2024, 1, 1)).days
            white_lady_phase_idx = (days_since_epoch % white_lady["cycle_days"]) // (white_lady["cycle_days"] // 8)
            moon_phases["White Lady"] = white_lady["phases"][white_lady_phase_idx]
            
            # Blue Child (35-day cycle, visible/hidden)
            blue_child = self._warcraft_data["moons"]["blue_child"]
            blue_child_visible = (days_since_epoch % blue_child["cycle_days"]) < (blue_child["cycle_days"] // 2)
            moon_phases["Blue Child"] = "Visible" if blue_child_visible else "Hidden"
        
        # Get Dragon Aspect of the day
        dragon_aspect = None
        if self._show_dragon_aspect:
            aspects = list(self._warcraft_data["dragon_aspects"].keys())
            aspect_idx = dt.day % len(aspects)
            dragon_aspect = aspects[aspect_idx]
            dragon_domain = self._warcraft_data["dragon_aspects"][dragon_aspect]
        
        # Build result
        result = {
            "formatted": formatted,
            "year": year,
            "month": month_name,
            "day": day,
            "weekday": weekday,
            "season": month_data["season"],
            "region": self._region,
            "faction": self._faction,
            "epoch_event": self._warcraft_data["epoch_event"]
        }
        
        if event and self._show_events:
            result["event"] = event
        
        if moon_phases and self._show_moons:
            result["moon_phases"] = moon_phases
        
        if dragon_aspect and self._show_dragon_aspect:
            result["dragon_aspect"] = f"{dragon_aspect} ({dragon_domain})"
        
        # Add faction-specific greeting
        faction_greetings = {
            "Alliance": "For the Alliance!",
            "Horde": "For the Horde!",
            "Neutral": "Safe travels, adventurer"
        }
        result["greeting"] = faction_greetings.get(self._faction, "Safe travels")
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded (in case async_added_to_hass hasn't run yet)
        if not self._options_loaded:
            self._load_options()
        
        now = datetime.now()
        self._warcraft_date = self._calculate_warcraft_date(now)
        
        # Set state to formatted Warcraft date
        self._state = self._warcraft_date["formatted"]
        
        _LOGGER.debug(f"Updated Warcraft Calendar to {self._state}")
    
    @property
    def state(self) -> str:
        """Return the state of the sensor."""
        return self._state or "Unknown"
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return additional attributes."""
        if not self._warcraft_date:
            return {}
        
        # Build attributes dictionary
        attrs = {
            "year": self._warcraft_date.get("year"),
            "month": self._warcraft_date.get("month"),
            "day": self._warcraft_date.get("day"),
            "weekday": self._warcraft_date.get("weekday"),
            "season": self._warcraft_date.get("season"),
            "region": self._warcraft_date.get("region"),
            "faction": self._warcraft_date.get("faction"),
            "epoch_event": self._warcraft_date.get("epoch_event"),
            "greeting": self._warcraft_date.get("greeting"),
            "icon": self._attr_icon,
            "calendar_type": "World of Warcraft",
            "accuracy": CALENDAR_INFO.get("accuracy", "fictional"),
            "reference": CALENDAR_INFO.get("reference_url"),
            "notes": self._translate("notes")
        }
        
        # Add optional attributes
        if "event" in self._warcraft_date:
            attrs["current_event"] = self._warcraft_date["event"]
        
        if "moon_phases" in self._warcraft_date:
            attrs["moon_phases"] = self._warcraft_date["moon_phases"]
        
        if "dragon_aspect" in self._warcraft_date:
            attrs["dragon_aspect"] = self._warcraft_date["dragon_aspect"]
        
        # Add configuration state
        attrs["config_faction"] = self._faction
        attrs["config_region"] = self._region
        attrs["config_show_events"] = self._show_events
        attrs["config_show_moons"] = self._show_moons
        attrs["config_show_dragon_aspect"] = self._show_dragon_aspect
        
        return attrs


# ============================================
# MODULE EXPORTS
# ============================================

# Export the sensor class
__all__ = ["WarcraftCalendarSensor"]