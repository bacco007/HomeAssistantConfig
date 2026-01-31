"""Hexadecimal Time implementation - Version 2.5.1."""
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

# Update interval in seconds (5 seconds for hexadecimal time)
UPDATE_INTERVAL = 5

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "hexadecimal",
    "version": "2.5.1",
    "icon": "mdi:hexadecimal",
    "category": "technical",
    "accuracy": "mathematical",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Hexadecimal Time",
        "de": "Hexadezimalzeit",
        "es": "Tiempo Hexadecimal",
        "fr": "Temps Hexadécimal",
        "it": "Tempo Esadecimale",
        "nl": "Hexadecimale Tijd",
        "pl": "Czas Szesnastkowy",
        "pt": "Tempo Hexadecimal",
        "ru": "Шестнадцатеричное время",
        "ja": "16進時間",
        "zh": "十六进制时间",
        "ko": "16진 시간"
    },
    
    # Translations for compatibility
    "translations": {
        "en": {
            "name": "Hexadecimal Time",
            "description": "Day divided into 65536 parts, displayed in hex (e.g. .8000 = noon)"
        },
        "de": {
            "name": "Hexadezimalzeit",
            "description": "Tag in 65536 Teile geteilt, Anzeige hexadezimal (z.B. .8000 = Mittag)"
        },
        "es": {
            "name": "Tiempo Hexadecimal",
            "description": "Día dividido en 65536 partes, mostrado en hex (ej. .8000 = mediodía)"
        },
        "fr": {
            "name": "Temps Hexadécimal",
            "description": "Jour divisé en 65536 parties, affiché en hex (ex. .8000 = midi)"
        },
        "it": {
            "name": "Tempo Esadecimale",
            "description": "Giorno diviso in 65536 parti, visualizzato in hex (es. .8000 = mezzogiorno)"
        },
        "nl": {
            "name": "Hexadecimale Tijd",
            "description": "Dag verdeeld in 65536 delen, weergegeven in hex (bijv. .8000 = middag)"
        },
        "pl": {
            "name": "Czas Szesnastkowy",
            "description": "Dzień podzielony na 65536 części, wyświetlany w hex (np. .8000 = południe)"
        },
        "pt": {
            "name": "Tempo Hexadecimal",
            "description": "Dia dividido em 65536 partes, exibido em hex (ex. .8000 = meio-dia)"
        },
        "ru": {
            "name": "Шестнадцатеричное время",
            "description": "День разделен на 65536 частей, отображается в hex (напр. .8000 = полдень)"
        },
        "ja": {
            "name": "16進時間",
            "description": "1日を65536分割し、16進数で表示（例：.8000 = 正午）"
        },
        "zh": {
            "name": "十六进制时间",
            "description": "一天分为65536部分，以十六进制显示（例：.8000 = 正午）"
        },
        "ko": {
            "name": "16진 시간",
            "description": "하루를 65536부분으로 나누어 16진수로 표시 (예: .8000 = 정오)"
        }
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Day divided into 65536 parts, displayed in hex (e.g. .8000 = noon)",
        "de": "Tag in 65536 Teile geteilt, Anzeige hexadezimal (z.B. .8000 = Mittag)",
        "es": "Día dividido en 65536 partes, mostrado en hex (ej. .8000 = mediodía)",
        "fr": "Jour divisé en 65536 parties, affiché en hex (ex. .8000 = midi)",
        "it": "Giorno diviso in 65536 parti, visualizzato in hex (es. .8000 = mezzogiorno)",
        "nl": "Dag verdeeld in 65536 delen, weergegeven in hex (bijv. .8000 = middag)",
        "pl": "Dzień podzielony na 65536 części, wyświetlany w hex (np. .8000 = południe)",
        "pt": "Dia dividido em 65536 partes, exibido em hex (ex. .8000 = meio-dia)",
        "ru": "День разделен на 65536 частей, отображается в hex (напр. .8000 = полдень)",
        "ja": "1日を65536分割し、16進数で表示（例：.8000 = 正午）",
        "zh": "一天分为65536部分，以十六进制显示（例：.8000 = 正午）",
        "ko": "하루를 65536부분으로 나누어 16진수로 표시 (예: .8000 = 정오)"
    },
    
    # Hexadecimal time specific data
    "hex_data": {
        "units_per_day": 65536,  # 2^16
        "seconds_per_unit": 1.318359375,  # 86400 / 65536
        
        # Notable times in hex
        "notable_times": {
            ".0000": {"time": "00:00", "description": "Midnight"},
            ".2000": {"time": "03:00", "description": "Late Night"},
            ".4000": {"time": "06:00", "description": "Dawn"},
            ".6000": {"time": "09:00", "description": "Morning"},
            ".8000": {"time": "12:00", "description": "Noon"},
            ".A000": {"time": "15:00", "description": "Afternoon"},
            ".C000": {"time": "18:00", "description": "Evening"},
            ".E000": {"time": "21:00", "description": "Night"},
            ".FFFF": {"time": "23:59:59", "description": "End of Day"}
        },
        
        # Conversion factors
        "conversions": {
            "hex_to_seconds": 1.318359375,
            "seconds_to_hex": 0.7585070008320739,
            "hex_to_minutes": 0.021972656,
            "minutes_to_hex": 45.51111111
        }
    },
    
    # Configuration options for this calendar
    "config_options": {
        "show_decimal": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Decimal Equivalent",
                "de": "Dezimaläquivalent anzeigen",
                "es": "Mostrar equivalente decimal",
                "fr": "Afficher l'équivalent décimal",
                "it": "Mostra equivalente decimale",
                "nl": "Toon decimaal equivalent",
                "pl": "Pokaż równoważnik dziesiętny",
                "pt": "Mostrar equivalente decimal",
                "ru": "Показать десятичный эквивалент",
                "ja": "10進数表示",
                "zh": "显示十进制等值",
                "ko": "10진수 표시"
            },
            "description": {
                "en": "Display decimal value alongside hex (e.g. .8000 = 32768)",
                "de": "Dezimalwert neben Hex anzeigen (z.B. .8000 = 32768)",
                "es": "Mostrar valor decimal junto a hex (ej. .8000 = 32768)",
                "fr": "Afficher la valeur décimale à côté de l'hex (ex. .8000 = 32768)",
                "it": "Mostra valore decimale accanto a hex (es. .8000 = 32768)",
                "nl": "Toon decimale waarde naast hex (bijv. .8000 = 32768)",
                "pl": "Wyświetl wartość dziesiętną obok hex (np. .8000 = 32768)",
                "pt": "Exibir valor decimal ao lado do hex (ex. .8000 = 32768)",
                "ru": "Показать десятичное значение рядом с hex (напр. .8000 = 32768)",
                "ja": "16進数と10進数を並べて表示（例：.8000 = 32768）",
                "zh": "在十六进制旁显示十进制值（例：.8000 = 32768）",
                "ko": "16진수 옆에 10진수 표시 (예: .8000 = 32768)"
            },
            "translations": {
                "en": {"label": "Show Decimal Equivalent", "description": "Display decimal value alongside hex"},
                "de": {"label": "Dezimaläquivalent anzeigen", "description": "Dezimalwert neben Hex anzeigen"},
                "fr": {"label": "Afficher l'équivalent décimal", "description": "Afficher la valeur décimale à côté de l'hex"}
            }
        },
        "show_binary": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Binary Representation",
                "de": "Binärdarstellung anzeigen",
                "es": "Mostrar representación binaria",
                "fr": "Afficher la représentation binaire",
                "it": "Mostra rappresentazione binaria",
                "nl": "Toon binaire weergave",
                "pl": "Pokaż reprezentację binarną",
                "pt": "Mostrar representação binária",
                "ru": "Показать двоичное представление",
                "ja": "2進数表示",
                "zh": "显示二进制表示",
                "ko": "2진수 표시"
            },
            "description": {
                "en": "Display binary format (16 bits)",
                "de": "Binärformat anzeigen (16 Bit)",
                "es": "Mostrar formato binario (16 bits)",
                "fr": "Afficher le format binaire (16 bits)",
                "it": "Mostra formato binario (16 bit)",
                "nl": "Toon binair formaat (16 bits)",
                "pl": "Wyświetl format binarny (16 bitów)",
                "pt": "Exibir formato binário (16 bits)",
                "ru": "Показать двоичный формат (16 бит)",
                "ja": "バイナリ形式を表示（16ビット）",
                "zh": "显示二进制格式（16位）",
                "ko": "바이너리 형식 표시 (16비트)"
            },
            "translations": {
                "en": {"label": "Show Binary Representation", "description": "Display binary format (16 bits)"},
                "de": {"label": "Binärdarstellung anzeigen", "description": "Binärformat anzeigen (16 Bit)"},
                "fr": {"label": "Afficher la représentation binaire", "description": "Afficher le format binaire (16 bits)"}
            }
        },
        "uppercase": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Use Uppercase Hex",
                "de": "Großbuchstaben für Hex",
                "es": "Usar mayúsculas en hex",
                "fr": "Utiliser des majuscules hex",
                "it": "Usa maiuscole hex",
                "nl": "Gebruik hoofdletters hex",
                "pl": "Użyj wielkich liter hex",
                "pt": "Usar maiúsculas hex",
                "ru": "Использовать заглавные hex",
                "ja": "大文字の16進数",
                "zh": "使用大写十六进制",
                "ko": "대문자 16진수 사용"
            },
            "description": {
                "en": "Use uppercase letters A-F instead of a-f",
                "de": "Großbuchstaben A-F statt a-f verwenden",
                "es": "Usar letras mayúsculas A-F en lugar de a-f",
                "fr": "Utiliser les lettres majuscules A-F au lieu de a-f",
                "it": "Usa lettere maiuscole A-F invece di a-f",
                "nl": "Gebruik hoofdletters A-F in plaats van a-f",
                "pl": "Użyj wielkich liter A-F zamiast a-f",
                "pt": "Usar letras maiúsculas A-F em vez de a-f",
                "ru": "Использовать заглавные буквы A-F вместо a-f",
                "ja": "小文字a-fの代わりに大文字A-Fを使用",
                "zh": "使用大写字母A-F而不是a-f",
                "ko": "소문자 a-f 대신 대문자 A-F 사용"
            },
            "translations": {
                "en": {"label": "Use Uppercase Hex", "description": "Use uppercase letters A-F instead of a-f"},
                "de": {"label": "Großbuchstaben für Hex", "description": "Großbuchstaben A-F statt a-f verwenden"},
                "fr": {"label": "Utiliser des majuscules hex", "description": "Utiliser les lettres majuscules A-F au lieu de a-f"}
            }
        }
    }
}


class HexadecimalTimeSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Hexadecimal Time."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the hexadecimal time sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Hexadecimal Time')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_hexadecimal"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:hexadecimal")
        
        # Configuration options with defaults
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._show_decimal = config_defaults.get("show_decimal", {}).get("default", False)
        self._show_binary = config_defaults.get("show_binary", {}).get("default", False)
        self._uppercase = config_defaults.get("uppercase", {}).get("default", True)
        
        # Hex data
        self._hex_data = CALENDAR_INFO["hex_data"]
        
        # Initialize state
        self._state = ".0000"
        self._hex_time = {}
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        _LOGGER.debug(f"Initialized Hexadecimal Time sensor: {self._attr_name}")
        _LOGGER.debug(f"  Default settings: uppercase={self._uppercase}, decimal={self._show_decimal}, binary={self._show_binary}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        try:
            options = self.get_plugin_options()
            if options:
                # Update configuration from plugin options
                self._show_decimal = options.get("show_decimal", self._show_decimal)
                self._show_binary = options.get("show_binary", self._show_binary)
                self._uppercase = options.get("uppercase", self._uppercase)
                
                _LOGGER.debug(f"Hexadecimal sensor loaded options: uppercase={self._uppercase}, decimal={self._show_decimal}, binary={self._show_binary}")
            else:
                _LOGGER.debug("Hexadecimal sensor using default options - no custom options found")
                
            self._options_loaded = True
        except Exception as e:
            _LOGGER.debug(f"Hexadecimal sensor could not load options yet: {e}")
    
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
        
        # Add Hexadecimal-specific attributes
        if self._hex_time:
            attrs.update(self._hex_time)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add conversion info
            attrs["units_per_day"] = self._hex_data["units_per_day"]
            attrs["seconds_per_unit"] = self._hex_data["seconds_per_unit"]
            
            # Add current configuration
            attrs["uppercase_setting"] = self._uppercase
            attrs["show_decimal_setting"] = self._show_decimal
            attrs["show_binary_setting"] = self._show_binary
        
        return attrs
    
    def _calculate_hex_time(self, earth_time: datetime) -> Dict[str, Any]:
        """Calculate Hexadecimal Time from standard time."""
        
        # Calculate seconds since midnight local time
        local_time = earth_time.astimezone()
        midnight = local_time.replace(hour=0, minute=0, second=0, microsecond=0)
        seconds_since_midnight = (local_time - midnight).total_seconds()
        
        # Convert to hexadecimal units (65536 units per day)
        hex_value = int(seconds_since_midnight * self._hex_data["units_per_day"] / 86400)
        
        # Ensure value is within range
        hex_value = max(0, min(65535, hex_value))
        
        # Format as hexadecimal
        if self._uppercase:
            hex_string = f"{hex_value:04X}"
        else:
            hex_string = f"{hex_value:04x}"
        
        formatted = f".{hex_string}"
        
        # Calculate percentage through day
        day_progress = (hex_value / self._hex_data["units_per_day"]) * 100
        
        # Find closest notable time
        closest_notable = None
        min_diff = float('inf')
        for notable_hex, data in self._hex_data["notable_times"].items():
            notable_value = int(notable_hex[1:], 16)
            diff = abs(notable_value - hex_value)
            if diff < min_diff:
                min_diff = diff
                closest_notable = f"{data['description']} ({notable_hex})"
        
        result = {
            "hex_value": hex_value,
            "hex_string": hex_string,
            "formatted": formatted,
            "day_progress": f"{day_progress:.1f}%",
            "standard_time": local_time.strftime("%H:%M:%S"),
            "closest_notable": closest_notable,
            "full_display": formatted
        }
        
        # Add decimal if enabled
        if self._show_decimal:
            result["decimal_value"] = hex_value
            result["full_display"] += f" ({hex_value})"
        
        # Add binary if enabled
        if self._show_binary:
            binary = f"{hex_value:016b}"
            result["binary"] = binary
            result["binary_formatted"] = f"{binary[:4]} {binary[4:8]} {binary[8:12]} {binary[12:]}"
            if self._show_binary and not self._show_decimal:
                result["full_display"] += f" [b{binary}]"
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded (in case async_added_to_hass hasn't run yet)
        if not self._options_loaded:
            self._load_options()
        
        try:
            now = datetime.now()
            self._hex_time = self._calculate_hex_time(now)
            
            # Set state to formatted hex time or full display if options are enabled
            if self._show_decimal or self._show_binary:
                self._state = self._hex_time.get("full_display", ".0000")
            else:
                self._state = self._hex_time.get("formatted", ".0000")
            
            _LOGGER.debug(f"Updated Hexadecimal Time to {self._state}")
        except Exception as e:
            _LOGGER.error(f"Error updating Hexadecimal time: {e}", exc_info=True)
            self._state = ".ERROR"
    
    async def async_update(self) -> None:
        """Update sensor asynchronously."""
        # Run synchronous update in executor
        await self.hass.async_add_executor_job(self.update)