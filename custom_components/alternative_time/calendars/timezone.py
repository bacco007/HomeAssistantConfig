"""Timezone sensor implementation - Version 2.5.3 - Complete IANA timezone list."""
from __future__ import annotations

from datetime import datetime
import logging
from typing import Dict, Any

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

try:
    import pytz
    HAS_PYTZ = True
except ImportError:
    HAS_PYTZ = False
    _LOGGER.warning("pytz not installed, timezone support will be limited")

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (1 second for real-time display)
UPDATE_INTERVAL = 1

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "timezone",
    "version": "2.5.3",
    "icon": "mdi:clock-time-four-outline",
    "category": "technical",
    "accuracy": "precise",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "World Timezones",
        "de": "Weltzeitzonen",
        "es": "Zonas Horarias Mundiales",
        "fr": "Fuseaux Horaires Mondiaux",
        "it": "Fusi Orari Mondiali",
        "nl": "Wereldtijdzones",
        "pt": "Fusos Horários Mundiais",
        "ru": "Мировые часовые пояса",
        "ja": "世界のタイムゾーン",
        "zh": "世界时区",
        "ko": "세계 시간대"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Display time in different timezones around the world",
        "de": "Zeit in verschiedenen Zeitzonen weltweit anzeigen",
        "es": "Mostrar la hora en diferentes zonas horarias del mundo",
        "fr": "Afficher l'heure dans différents fuseaux horaires du monde",
        "it": "Mostra l'ora in diversi fusi orari del mondo",
        "nl": "Tijd weergeven in verschillende tijdzones wereldwijd",
        "pt": "Exibir hora em diferentes fusos horários ao redor do mundo",
        "ru": "Отображение времени в разных часовых поясах мира",
        "ja": "世界中の異なるタイムゾーンの時刻を表示",
        "zh": "显示世界各地不同时区的时间",
        "ko": "전 세계 다양한 시간대의 시간 표시"
    },
    
    # Complete IANA timezone data for dropdown population
    # Organized by region for better usability
    "timezone_data": {
        "regions": {
            "UTC": [
                "UTC",
                "GMT"
            ],
            "Africa": [
                "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers",
                "Africa/Asmara", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul",
                "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura",
                "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry",
                "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala",
                "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare",
                "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum",
                "Africa/Kigali", "Africa/Kinshasa", "Africa/Lagos", "Africa/Libreville",
                "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka",
                "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane",
                "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena",
                "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo",
                "Africa/Sao_Tome", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek"
            ],
            "America": [
                "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua",
                "America/Araguaina", "America/Argentina/Buenos_Aires", "America/Argentina/Catamarca",
                "America/Argentina/Cordoba", "America/Argentina/Jujuy", "America/Argentina/La_Rioja",
                "America/Argentina/Mendoza", "America/Argentina/Rio_Gallegos", "America/Argentina/Salta",
                "America/Argentina/San_Juan", "America/Argentina/San_Luis", "America/Argentina/Tucuman",
                "America/Argentina/Ushuaia", "America/Aruba", "America/Asuncion", "America/Atikokan",
                "America/Bahia", "America/Bahia_Banderas", "America/Barbados", "America/Belem",
                "America/Belize", "America/Blanc-Sablon", "America/Boa_Vista", "America/Bogota",
                "America/Boise", "America/Cambridge_Bay", "America/Campo_Grande", "America/Cancun",
                "America/Caracas", "America/Cayenne", "America/Cayman", "America/Chicago",
                "America/Chihuahua", "America/Costa_Rica", "America/Creston", "America/Cuiaba",
                "America/Curacao", "America/Danmarkshavn", "America/Dawson", "America/Dawson_Creek",
                "America/Denver", "America/Detroit", "America/Dominica", "America/Edmonton",
                "America/Eirunepe", "America/El_Salvador", "America/Fort_Nelson", "America/Fortaleza",
                "America/Glace_Bay", "America/Goose_Bay", "America/Grand_Turk", "America/Grenada",
                "America/Guadeloupe", "America/Guatemala", "America/Guayaquil", "America/Guyana",
                "America/Halifax", "America/Havana", "America/Hermosillo", "America/Indiana/Indianapolis",
                "America/Indiana/Knox", "America/Indiana/Marengo", "America/Indiana/Petersburg",
                "America/Indiana/Tell_City", "America/Indiana/Vevay", "America/Indiana/Vincennes",
                "America/Indiana/Winamac", "America/Inuvik", "America/Iqaluit", "America/Jamaica",
                "America/Juneau", "America/Kentucky/Louisville", "America/Kentucky/Monticello",
                "America/Kralendijk", "America/La_Paz", "America/Lima", "America/Los_Angeles",
                "America/Lower_Princes", "America/Maceio", "America/Managua", "America/Manaus",
                "America/Marigot", "America/Martinique", "America/Matamoros", "America/Mazatlan",
                "America/Menominee", "America/Merida", "America/Metlakatla", "America/Mexico_City",
                "America/Miquelon", "America/Moncton", "America/Monterrey", "America/Montevideo",
                "America/Montreal", "America/Montserrat", "America/Nassau", "America/New_York",
                "America/Nipigon", "America/Nome", "America/Noronha", "America/North_Dakota/Beulah",
                "America/North_Dakota/Center", "America/North_Dakota/New_Salem", "America/Nuuk",
                "America/Ojinaga", "America/Panama", "America/Pangnirtung", "America/Paramaribo",
                "America/Phoenix", "America/Port-au-Prince", "America/Port_of_Spain", "America/Porto_Velho",
                "America/Puerto_Rico", "America/Punta_Arenas", "America/Rainy_River", "America/Rankin_Inlet",
                "America/Recife", "America/Regina", "America/Resolute", "America/Rio_Branco",
                "America/Santarem", "America/Santiago", "America/Santo_Domingo", "America/Sao_Paulo",
                "America/Scoresbysund", "America/Sitka", "America/St_Barthelemy", "America/St_Johns",
                "America/St_Kitts", "America/St_Lucia", "America/St_Thomas", "America/St_Vincent",
                "America/Swift_Current", "America/Tegucigalpa", "America/Thule", "America/Thunder_Bay",
                "America/Tijuana", "America/Toronto", "America/Tortola", "America/Vancouver",
                "America/Whitehorse", "America/Winnipeg", "America/Yakutat", "America/Yellowknife"
            ],
            "Antarctica": [
                "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie",
                "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Palmer", "Antarctica/Rothera",
                "Antarctica/Syowa", "Antarctica/Troll", "Antarctica/Vostok"
            ],
            "Arctic": [
                "Arctic/Longyearbyen"
            ],
            "Asia": [
                "Asia/Aden", "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Aqtau",
                "Asia/Aqtobe", "Asia/Ashgabat", "Asia/Atyrau", "Asia/Baghdad", "Asia/Bahrain",
                "Asia/Baku", "Asia/Bangkok", "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek",
                "Asia/Brunei", "Asia/Chita", "Asia/Choibalsan", "Asia/Colombo", "Asia/Damascus",
                "Asia/Dhaka", "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe", "Asia/Famagusta",
                "Asia/Gaza", "Asia/Hebron", "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Hovd",
                "Asia/Irkutsk", "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem", "Asia/Kabul",
                "Asia/Kamchatka", "Asia/Karachi", "Asia/Kathmandu", "Asia/Khandyga", "Asia/Kolkata",
                "Asia/Krasnoyarsk", "Asia/Kuala_Lumpur", "Asia/Kuching", "Asia/Kuwait", "Asia/Macau",
                "Asia/Magadan", "Asia/Makassar", "Asia/Manila", "Asia/Muscat", "Asia/Nicosia",
                "Asia/Novokuznetsk", "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral", "Asia/Phnom_Penh",
                "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar", "Asia/Qostanay", "Asia/Qyzylorda",
                "Asia/Riyadh", "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai",
                "Asia/Singapore", "Asia/Srednekolymsk", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi",
                "Asia/Tehran", "Asia/Thimphu", "Asia/Tokyo", "Asia/Tomsk", "Asia/Ulaanbaatar",
                "Asia/Urumqi", "Asia/Ust-Nera", "Asia/Vientiane", "Asia/Vladivostok", "Asia/Yakutsk",
                "Asia/Yangon", "Asia/Yekaterinburg", "Asia/Yerevan"
            ],
            "Atlantic": [
                "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape_Verde",
                "Atlantic/Faroe", "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South_Georgia",
                "Atlantic/St_Helena", "Atlantic/Stanley"
            ],
            "Australia": [
                "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken_Hill", "Australia/Currie",
                "Australia/Darwin", "Australia/Eucla", "Australia/Hobart", "Australia/Lindeman",
                "Australia/Lord_Howe", "Australia/Melbourne", "Australia/Perth", "Australia/Sydney"
            ],
            "Europe": [
                "Europe/Amsterdam", "Europe/Andorra", "Europe/Astrakhan", "Europe/Athens",
                "Europe/Belgrade", "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels",
                "Europe/Bucharest", "Europe/Budapest", "Europe/Busingen", "Europe/Chisinau",
                "Europe/Copenhagen", "Europe/Dublin", "Europe/Gibraltar", "Europe/Guernsey",
                "Europe/Helsinki", "Europe/Isle_of_Man", "Europe/Istanbul", "Europe/Jersey",
                "Europe/Kaliningrad", "Europe/Kiev", "Europe/Kirov", "Europe/Lisbon",
                "Europe/Ljubljana", "Europe/London", "Europe/Luxembourg", "Europe/Madrid",
                "Europe/Malta", "Europe/Mariehamn", "Europe/Minsk", "Europe/Monaco",
                "Europe/Moscow", "Europe/Oslo", "Europe/Paris", "Europe/Podgorica",
                "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Samara",
                "Europe/San_Marino", "Europe/Sarajevo", "Europe/Saratov", "Europe/Simferopol",
                "Europe/Skopje", "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn",
                "Europe/Tirane", "Europe/Ulyanovsk", "Europe/Uzhgorod", "Europe/Vaduz",
                "Europe/Vatican", "Europe/Vienna", "Europe/Vilnius", "Europe/Volgograd",
                "Europe/Warsaw", "Europe/Zagreb", "Europe/Zaporozhye", "Europe/Zurich"
            ],
            "Indian": [
                "Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas", "Indian/Cocos",
                "Indian/Comoro", "Indian/Kerguelen", "Indian/Mahe", "Indian/Maldives",
                "Indian/Mauritius", "Indian/Mayotte", "Indian/Reunion"
            ],
            "Pacific": [
                "Pacific/Apia", "Pacific/Auckland", "Pacific/Bougainville", "Pacific/Chatham",
                "Pacific/Chuuk", "Pacific/Easter", "Pacific/Efate", "Pacific/Enderbury",
                "Pacific/Fakaofo", "Pacific/Fiji", "Pacific/Funafuti", "Pacific/Galapagos",
                "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Guam", "Pacific/Honolulu",
                "Pacific/Johnston", "Pacific/Kiritimati", "Pacific/Kosrae", "Pacific/Kwajalein",
                "Pacific/Majuro", "Pacific/Marquesas", "Pacific/Midway", "Pacific/Nauru",
                "Pacific/Niue", "Pacific/Norfolk", "Pacific/Noumea", "Pacific/Pago_Pago",
                "Pacific/Palau", "Pacific/Pitcairn", "Pacific/Pohnpei", "Pacific/Port_Moresby",
                "Pacific/Rarotonga", "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa",
                "Pacific/Tongatapu", "Pacific/Wake", "Pacific/Wallis"
            ]
        }
    },
    
    # Additional metadata
    "reference_url": "https://en.wikipedia.org/wiki/Time_zone",
    "documentation_url": "https://www.timeanddate.com/time/map/",
    "origin": "IANA Time Zone Database",
    "created_by": "International standards",
    
    # Example format
    "example": "14:30:00 CET (UTC+1)",
    "example_meaning": "2:30 PM Central European Time",
    
    # Related calendars
    "related": ["unix", "julian", "gregorian"],
    
    # Tags for searching and filtering
    "tags": [
        "timezone", "world", "clock", "time", "global",
        "utc", "gmt", "dst", "international", "travel", "iana"
    ],
    
    # Special features
    "features": {
        "supports_dst": True,
        "supports_abbreviations": True,
        "supports_offsets": True,
        "precision": "second",
        "real_time": True
    },
    
    # Configuration options for this calendar
    "config_options": {
        "timezone": {
            "type": "select",  # WICHTIG: Muss "select" sein für Dropdown
            "default": "UTC",
            "options": [],  # Wird vom config_flow aus timezone_data befüllt
            "label": {
                "en": "Timezone",
                "de": "Zeitzone",
                "fr": "Fuseau horaire",
                "es": "Zona horaria"
            },
            "description": {
                "en": "Select timezone to display",
                "de": "Zeitzone zur Anzeige auswählen",
                "fr": "Sélectionner le fuseau horaire à afficher",
                "es": "Seleccionar zona horaria para mostrar"
            }
        },
        "show_offset": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show UTC offset",
                "de": "UTC-Versatz anzeigen",
                "fr": "Afficher le décalage UTC",
                "es": "Mostrar desplazamiento UTC"
            },
            "description": {
                "en": "Display UTC offset (e.g. UTC+1)",
                "de": "UTC-Versatz anzeigen (z.B. UTC+1)",
                "fr": "Afficher le décalage UTC (ex. UTC+1)",
                "es": "Mostrar desplazamiento UTC (ej. UTC+1)"
            }
        },
        "show_dst": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show DST indicator",
                "de": "Sommerzeit-Indikator",
                "fr": "Indicateur d'heure d'été",
                "es": "Indicador de horario de verano"
            },
            "description": {
                "en": "Show when daylight saving time is active",
                "de": "Anzeigen wenn Sommerzeit aktiv ist",
                "fr": "Afficher quand l'heure d'été est active",
                "es": "Mostrar cuando el horario de verano está activo"
            }
        },
        "format_24h": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "24-hour format",
                "de": "24-Stunden-Format",
                "fr": "Format 24 heures",
                "es": "Formato 24 horas"
            },
            "description": {
                "en": "Use 24-hour time format",
                "de": "24-Stunden-Zeitformat verwenden",
                "fr": "Utiliser le format 24 heures",
                "es": "Usar formato de 24 horas"
            }
        },
        "show_date": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show date",
                "de": "Datum anzeigen",
                "fr": "Afficher la date",
                "es": "Mostrar fecha"
            },
            "description": {
                "en": "Include date in display",
                "de": "Datum in Anzeige einbeziehen",
                "fr": "Inclure la date dans l'affichage",
                "es": "Incluir fecha en la pantalla"
            }
        }
    }
}


class TimezoneSensor(AlternativeTimeSensorBase):
    """Sensor for displaying time in different timezones."""
    
    # Class-level update interval
    UPDATE_INTERVAL = 1  # Update every second
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the timezone sensor with standard 2-parameter signature."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'World Timezones')
        
        # Defaults - werden in update() überschrieben
        self._timezone_str = "UTC"
        self._show_offset = True
        self._show_dst = True
        self._format_24h = True
        self._show_date = False
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_timezone"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:clock-time-four-outline")
        
        # Timezone wird lazy geladen
        self._timezone = None
        self._timezone_initialized = False
        
        # Timezone data
        self._timezone_data = CALENDAR_INFO["timezone_data"]
        
        # Initialize state
        self._state = "Initializing..."
        self._tz_info = {}
        
        # Flag für erstes Update
        self._first_update = True
        
        _LOGGER.debug(f"Initialized Timezone sensor: {self._attr_name}")
    
    async def async_added_to_hass(self) -> None:
        """When entity is added to hass."""
        await super().async_added_to_hass()
        
        # Lade Optionen beim Hinzufügen
        options = self.get_plugin_options()
        if options:
            _LOGGER.debug(f"Timezone sensor loaded options in async_added_to_hass: {options}")
            self._timezone_str = options.get("timezone", "UTC")
            self._show_offset = bool(options.get("show_offset", True))
            self._show_dst = bool(options.get("show_dst", True))
            self._format_24h = bool(options.get("format_24h", True))
            self._show_date = bool(options.get("show_date", False))
        else:
            # Versuche System-Timezone zu verwenden
            try:
                self._timezone_str = self._hass.config.time_zone or "UTC"
                _LOGGER.info(f"Using system timezone: {self._timezone_str}")
            except:
                self._timezone_str = "UTC"
        
        # Initialisiere Timezone async
        if HAS_PYTZ and not self._timezone_initialized:
            try:
                # Führe die blockierende Operation in einem Executor aus
                self._timezone = await self._hass.async_add_executor_job(
                    pytz.timezone, self._timezone_str
                )
                self._timezone_initialized = True
                _LOGGER.info(f"Loaded timezone: {self._timezone_str}")
                
                # Update Name mit Timezone
                calendar_name = self._translate('name', 'World Timezones')
                self._attr_name = f"{self._base_name} {calendar_name} ({self._timezone_str})"
                
            except Exception as e:
                _LOGGER.warning(f"Could not load timezone {self._timezone_str}: {e}, using UTC")
                try:
                    self._timezone = await self._hass.async_add_executor_job(
                        pytz.timezone, "UTC"
                    )
                    self._timezone_str = "UTC"
                    self._attr_name = f"{self._base_name} {calendar_name} (UTC)"
                except:
                    self._timezone = None
                self._timezone_initialized = True  # Prevent retry
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        # Add timezone-specific attributes
        if hasattr(self, '_tz_info'):
            attrs.update(self._tz_info)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add timezone database info
            attrs["timezone_id"] = self._timezone_str
            attrs["database"] = "IANA tzdata"
            
            # Add config info
            attrs["config"] = {
                "timezone": self._timezone_str,
                "show_offset": self._show_offset,
                "show_dst": self._show_dst,
                "format_24h": self._format_24h,
                "show_date": self._show_date
            }
        
        return attrs
    
    def _calculate_timezone_info(self, now_tz: datetime) -> Dict[str, Any]:
        """Calculate timezone information."""
        # Format time based on configuration
        if self._format_24h:
            time_format = "%H:%M:%S"
            time_display = now_tz.strftime(time_format)
        else:
            time_format = "%I:%M:%S %p"
            time_display = now_tz.strftime(time_format).lstrip('0')
        
        # Get timezone abbreviation
        tz_abbr = now_tz.strftime("%Z")
        
        # Calculate UTC offset
        offset = now_tz.strftime("%z")
        if offset:
            # Parse offset string (e.g., "+0100" or "-0500")
            sign = offset[0]
            hours = int(offset[1:3])
            minutes = int(offset[3:5]) if len(offset) >= 5 else 0
            
            # Format with sign
            if minutes:
                offset_display = f"UTC{sign}{hours:02d}:{minutes:02d}"
            else:
                offset_display = f"UTC{sign}{hours}"
        else:
            offset_display = "UTC"
        
        # Check DST status
        is_dst = False
        if HAS_PYTZ and self._timezone and self._timezone_initialized:
            try:
                is_dst = bool(now_tz.dst())
            except:
                is_dst = False
        
        # Build display string
        display_parts = []
        
        if self._show_date:
            date_str = now_tz.strftime("%Y-%m-%d")
            display_parts.append(date_str)
        
        display_parts.append(time_display)
        display_parts.append(tz_abbr)
        
        if self._show_offset:
            display_parts.append(f"({offset_display})")
        
        if self._show_dst and is_dst:
            display_parts.append("DST")
        
        full_display = " ".join(display_parts)
        
        # Get day info
        weekday = now_tz.strftime("%A")
        date = now_tz.strftime("%Y-%m-%d")
        
        # Determine time period
        hour = now_tz.hour
        if 5 <= hour < 12:
            period = "Morning"
        elif 12 <= hour < 17:
            period = "Afternoon"
        elif 17 <= hour < 21:
            period = "Evening"
        else:
            period = "Night"
        
        result = {
            "time": time_display,
            "timezone_abbr": tz_abbr,
            "utc_offset": offset_display,
            "is_dst": is_dst,
            "date": date,
            "weekday": weekday,
            "period": period,
            "hour_24": now_tz.hour,
            "minute": now_tz.minute,
            "second": now_tz.second,
            "full_display": full_display,
            "iso_format": now_tz.isoformat(),
            "unix_timestamp": int(now_tz.timestamp())
        }
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Lade Optionen bei jedem Update
        options = self.get_plugin_options()
        
        # Debug beim ersten Update
        if self._first_update:
            if options:
                _LOGGER.info(f"Timezone sensor options in first update: {options}")
            else:
                _LOGGER.debug("Timezone sensor using defaults (no options configured)")
            self._first_update = False
        
        # Aktualisiere Konfiguration
        if options:
            new_timezone = options.get("timezone", self._timezone_str)
            self._show_offset = bool(options.get("show_offset", True))
            self._show_dst = bool(options.get("show_dst", True))
            self._format_24h = bool(options.get("format_24h", True))
            self._show_date = bool(options.get("show_date", False))
            
            # Prüfe ob Timezone geändert wurde
            if new_timezone != self._timezone_str and HAS_PYTZ:
                _LOGGER.info(f"Timezone changed from {self._timezone_str} to {new_timezone}")
                self._timezone_str = new_timezone
                try:
                    self._timezone = pytz.timezone(self._timezone_str)
                    # Update Name
                    calendar_name = self._translate('name', 'World Timezones')
                    self._attr_name = f"{self._base_name} {calendar_name} ({self._timezone_str})"
                    self._timezone_initialized = True
                except Exception as e:
                    _LOGGER.error(f"Failed to load timezone {self._timezone_str}: {e}")
                    # Fallback to previous or UTC
                    if not self._timezone:
                        try:
                            self._timezone = pytz.timezone("UTC")
                            self._timezone_str = "UTC"
                        except:
                            self._timezone = None
        
        # Update state
        if HAS_PYTZ and self._timezone:
            try:
                now_tz = datetime.now(self._timezone)
                self._tz_info = self._calculate_timezone_info(now_tz)
                self._state = self._tz_info["full_display"]
            except Exception as e:
                _LOGGER.error(f"Error calculating timezone info: {e}")
                self._state = f"Error: {self._timezone_str}"
                self._tz_info = {"error": str(e)}
        else:
            # Fallback without pytz
            now = datetime.now()
            self._state = now.strftime("%H:%M:%S") + f" {self._timezone_str}"
            self._tz_info = {
                "time": now.strftime("%H:%M:%S"),
                "timezone_id": self._timezone_str,
                "error": "pytz not available or timezone not loaded"
            }
        
        _LOGGER.debug(f"Updated Timezone to {self._state}")