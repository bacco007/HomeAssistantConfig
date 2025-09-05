"""Julian Date (JD) implementation - Version 1.0.0
Astronomical Julian Date system for precise time tracking.

Displays continuous day count since January 1, 4713 BCE noon UTC.
Example: JD 2460636.235417 (decimal days since epoch)
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import logging
from typing import Dict, Any, Optional

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (1 second for precise fractional day updates)
UPDATE_INTERVAL = 1

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "julian_date",
    "version": "1.0.0",
    "icon": "mdi:calendar-clock",
    "category": "technical",
    "accuracy": "scientific",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Julian Date",
        "de": "Julianisches Datum",
        "es": "Fecha Juliana",
        "fr": "Date Julienne",
        "it": "Data Giuliana",
        "nl": "Juliaanse Datum",
        "pl": "Data Juliańska",
        "pt": "Data Juliana",
        "ru": "Юлианская дата",
        "ja": "ユリウス日",
        "zh": "儒略日",
        "ko": "율리우스일"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Continuous day count since January 1, 4713 BCE noon UTC",
        "de": "Fortlaufende Tageszählung seit 1. Januar 4713 v. Chr. mittags UTC",
        "es": "Recuento continuo de días desde el 1 de enero de 4713 a.C. mediodía UTC",
        "fr": "Comptage continu des jours depuis le 1er janvier 4713 av. J.-C. midi UTC",
        "it": "Conteggio continuo dei giorni dal 1 gennaio 4713 a.C. mezzogiorno UTC",
        "nl": "Continue dagtelling sinds 1 januari 4713 v.Chr. middag UTC",
        "pl": "Ciągłe liczenie dni od 1 stycznia 4713 p.n.e. południe UTC",
        "pt": "Contagem contínua de dias desde 1 de janeiro de 4713 a.C. meio-dia UTC",
        "ru": "Непрерывный счет дней с 1 января 4713 г. до н.э. полдень UTC",
        "ja": "紀元前4713年1月1日正午UTCからの連続日数",
        "zh": "自公元前4713年1月1日中午UTC起的连续天数",
        "ko": "기원전 4713년 1월 1일 정오 UTC부터의 연속 일수"
    },
    
    # Julian Date specific data
    "julian_data": {
        # Epoch (noon UTC on January 1, 4713 BCE in proleptic Julian calendar)
        "epoch": {
            "year": -4712,  # 4713 BCE in astronomical year numbering
            "month": 1,
            "day": 1,
            "hour": 12,  # Noon UTC
            "description": "Julian Day Zero"
        },
        
        # Important Julian Dates
        "milestones": {
            0.0: "Julian Day Zero (January 1, 4713 BCE noon)",
            1721425.5: "January 1, 1 CE (Gregorian)",
            2299160.5: "October 15, 1582 (Gregorian Reform)",
            2400000.5: "November 16, 1858 (MJD Epoch)",
            2415020.5: "January 1, 1900",
            2440587.5: "January 1, 1970 (Unix Epoch)",
            2451545.0: "January 1, 2000 noon (J2000.0)",
            2460000.5: "February 23, 2023"
        },
        
        # Related systems
        "variants": {
            "MJD": {
                "name": "Modified Julian Date",
                "offset": -2400000.5,
                "description": "MJD = JD - 2400000.5"
            },
            "TJD": {
                "name": "Truncated Julian Date",
                "offset": -2440000.5,
                "description": "TJD = JD - 2440000.5"
            },
            "RJD": {
                "name": "Reduced Julian Date",
                "offset": -2400000.0,
                "description": "RJD = JD - 2400000"
            }
        }
    },
    
    # Reference URL
    "reference_url": "https://en.wikipedia.org/wiki/Julian_day",
    
    # Plugin configuration options
    "plugin_options": {
        "format": {
            "type": "select",
            "default": "jd",
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
                "en": "Select which Julian Date format to display",
                "de": "Wählen Sie das anzuzeigende Julianische Datumsformat",
                "es": "Seleccione qué formato de fecha juliana mostrar",
                "fr": "Sélectionnez le format de date julienne à afficher",
                "it": "Seleziona quale formato di data giuliana visualizzare",
                "nl": "Selecteer welk Juliaans datumformaat moet worden weergegeven",
                "pl": "Wybierz format daty juliańskiej do wyświetlenia",
                "pt": "Selecione qual formato de data juliana exibir",
                "ru": "Выберите формат юлианской даты для отображения",
                "ja": "表示するユリウス日形式を選択",
                "zh": "选择要显示的儒略日格式",
                "ko": "표시할 율리우스 날짜 형식 선택"
            },
            "options": [
                {"value": "jd", "label": {"en": "Julian Date (JD)", "de": "Julianisches Datum (JD)"}},
                {"value": "mjd", "label": {"en": "Modified Julian Date (MJD)", "de": "Modifiziertes Julianisches Datum (MJD)"}},
                {"value": "tjd", "label": {"en": "Truncated Julian Date (TJD)", "de": "Gekürztes Julianisches Datum (TJD)"}},
                {"value": "rjd", "label": {"en": "Reduced Julian Date (RJD)", "de": "Reduziertes Julianisches Datum (RJD)"}}
            ]
        },
        "decimal_places": {
            "type": "select",
            "default": "5",
            "label": {
                "en": "Decimal Places",
                "de": "Dezimalstellen",
                "es": "Lugares Decimales",
                "fr": "Décimales",
                "it": "Cifre Decimali",
                "nl": "Decimalen",
                "pl": "Miejsca Dziesiętne",
                "pt": "Casas Decimais",
                "ru": "Десятичные знаки",
                "ja": "小数点以下の桁数",
                "zh": "小数位数",
                "ko": "소수점 자리"
            },
            "description": {
                "en": "Number of decimal places to display",
                "de": "Anzahl der anzuzeigenden Dezimalstellen",
                "es": "Número de lugares decimales a mostrar",
                "fr": "Nombre de décimales à afficher",
                "it": "Numero di cifre decimali da visualizzare",
                "nl": "Aantal decimalen om weer te geven",
                "pl": "Liczba miejsc dziesiętnych do wyświetlenia",
                "pt": "Número de casas decimais a exibir",
                "ru": "Количество десятичных знаков для отображения",
                "ja": "表示する小数点以下の桁数",
                "zh": "要显示的小数位数",
                "ko": "표시할 소수점 자리 수"
            },
            "options": [
                {"value": "0", "label": {"en": "0 - Integer only", "de": "0 - Nur Ganzzahl"}},
                {"value": "1", "label": {"en": "1 decimal place", "de": "1 Dezimalstelle"}},
                {"value": "2", "label": {"en": "2 decimal places", "de": "2 Dezimalstellen"}},
                {"value": "3", "label": {"en": "3 decimal places", "de": "3 Dezimalstellen"}},
                {"value": "4", "label": {"en": "4 decimal places", "de": "4 Dezimalstellen"}},
                {"value": "5", "label": {"en": "5 decimal places", "de": "5 Dezimalstellen"}},
                {"value": "6", "label": {"en": "6 decimal places", "de": "6 Dezimalstellen"}},
                {"value": "7", "label": {"en": "7 decimal places", "de": "7 Dezimalstellen"}},
                {"value": "8", "label": {"en": "8 decimal places", "de": "8 Dezimalstellen"}},
                {"value": "9", "label": {"en": "9 decimal places", "de": "9 Dezimalstellen"}},
                {"value": "10", "label": {"en": "10 decimal places", "de": "10 Dezimalstellen"}}
            ]
        },
        "show_time": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Time Component",
                "de": "Zeitkomponente anzeigen",
                "es": "Mostrar Componente de Tiempo",
                "fr": "Afficher la Composante Temporelle",
                "it": "Mostra Componente Temporale",
                "nl": "Tijdcomponent Tonen",
                "pl": "Pokaż Komponent Czasu",
                "pt": "Mostrar Componente de Tempo",
                "ru": "Показать временную составляющую",
                "ja": "時間成分を表示",
                "zh": "显示时间分量",
                "ko": "시간 구성 요소 표시"
            },
            "description": {
                "en": "Display fractional day as time (HH:MM:SS)",
                "de": "Bruchteil des Tages als Zeit anzeigen (HH:MM:SS)",
                "es": "Mostrar día fraccionario como tiempo (HH:MM:SS)",
                "fr": "Afficher la fraction de jour comme heure (HH:MM:SS)",
                "it": "Visualizza frazione di giorno come ora (HH:MM:SS)",
                "nl": "Fractionele dag als tijd weergeven (HH:MM:SS)",
                "pl": "Wyświetl ułamek dnia jako czas (HH:MM:SS)",
                "pt": "Exibir dia fracionário como tempo (HH:MM:SS)",
                "ru": "Отображать дробную часть дня как время (ЧЧ:ММ:СС)",
                "ja": "小数日を時刻として表示 (HH:MM:SS)",
                "zh": "将小数天显示为时间 (HH:MM:SS)",
                "ko": "소수 일을 시간으로 표시 (HH:MM:SS)"
            }
        },
        "show_all_variants": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show All Variants",
                "de": "Alle Varianten anzeigen",
                "es": "Mostrar Todas las Variantes",
                "fr": "Afficher Toutes les Variantes",
                "it": "Mostra Tutte le Varianti",
                "nl": "Alle Varianten Tonen",
                "pl": "Pokaż Wszystkie Warianty",
                "pt": "Mostrar Todas as Variantes",
                "ru": "Показать все варианты",
                "ja": "すべてのバリアントを表示",
                "zh": "显示所有变体",
                "ko": "모든 변형 표시"
            },
            "description": {
                "en": "Display JD, MJD, TJD, and RJD in attributes",
                "de": "JD, MJD, TJD und RJD in Attributen anzeigen",
                "es": "Mostrar JD, MJD, TJD y RJD en atributos",
                "fr": "Afficher JD, MJD, TJD et RJD dans les attributs",
                "it": "Visualizza JD, MJD, TJD e RJD negli attributi",
                "nl": "JD, MJD, TJD en RJD in attributen weergeven",
                "pl": "Wyświetl JD, MJD, TJD i RJD w atrybutach",
                "pt": "Exibir JD, MJD, TJD e RJD em atributos",
                "ru": "Отображать JD, MJD, TJD и RJD в атрибутах",
                "ja": "属性にJD、MJD、TJD、RJDを表示",
                "zh": "在属性中显示JD、MJD、TJD和RJD",
                "ko": "속성에 JD, MJD, TJD 및 RJD 표시"
            }
        }
    }
}


class JulianDateSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Julian Date."""
    
    # Class-level update interval
    UPDATE_INTERVAL = 1  # Update every second for precise fractional days
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Julian Date sensor with standard 2-parameter signature."""
        super().__init__(base_name, hass)
        
        # Get calendar info
        calendar_name = self._translate('name', 'Julian Date')
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"julian_date_{base_name.lower().replace(' ', '_')}"
        
        # Set update interval
        self._update_interval = timedelta(seconds=UPDATE_INTERVAL)
        
        # Julian Date specific data
        self._julian_data = CALENDAR_INFO.get("julian_data", {})
        self._variants = self._julian_data.get("variants", {})
        self._milestones = self._julian_data.get("milestones", {})
        
        # Initialize with defaults
        self._format = "jd"
        self._decimal_places = 5
        self._show_time = False
        self._show_all_variants = False
        
        # Julian Date data storage
        self._jd_info = {}
        self._state = "Initializing..."
        
        # Debug flag
        self._first_update = True
    
    @property
    def state(self) -> str:
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        # Add Julian Date specific attributes
        if self._jd_info:
            attrs.update(self._jd_info)
            
            # Add description
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add config info
            attrs["config"] = {
                "format": self._format,
                "decimal_places": self._decimal_places,
                "show_time": self._show_time,
                "show_all_variants": self._show_all_variants
            }
        
        return attrs
    
    def _gregorian_to_julian_date(self, dt: datetime) -> float:
        """Convert Gregorian datetime to Julian Date.
        
        Algorithm from Meeus, "Astronomical Algorithms"
        """
        # Ensure we're working with UTC
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        
        # Extract components
        year = dt.year
        month = dt.month
        day = dt.day
        hour = dt.hour
        minute = dt.minute
        second = dt.second
        microsecond = dt.microsecond
        
        # Calculate fractional day from noon UTC
        # Julian Date starts at noon, so we need to adjust
        fractional_day = (hour - 12) / 24.0 + minute / 1440.0 + second / 86400.0 + microsecond / 86400000000.0
        
        # Algorithm from Meeus
        if month <= 2:
            year -= 1
            month += 12
        
        # Check if date is after Gregorian reform (October 15, 1582)
        gregorian = (year > 1582) or (year == 1582 and month > 10) or (year == 1582 and month == 10 and day >= 15)
        
        if gregorian:
            a = int(year / 100)
            b = 2 - a + int(a / 4)
        else:
            b = 0
        
        jd = int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + b - 1524.5
        jd += fractional_day
        
        return jd
    
    def _fraction_to_time(self, fraction: float) -> str:
        """Convert fractional day to time string."""
        # Fractional part represents time from noon UTC
        # 0.0 = noon, 0.5 = midnight, 1.0 = next noon
        
        # Convert to hours from midnight
        hours_from_noon = fraction * 24
        hours_from_midnight = (hours_from_noon + 12) % 24
        
        hours = int(hours_from_midnight)
        remainder = hours_from_midnight - hours
        
        minutes = int(remainder * 60)
        remainder = (remainder * 60) - minutes
        
        seconds = int(remainder * 60)
        
        return f"{hours:02d}:{minutes:02d}:{seconds:02d} UTC"
    
    def _format_julian_date(self, jd: float, format_type: str, decimal_places: int) -> str:
        """Format Julian Date according to selected format."""
        if format_type == "mjd":
            value = jd - 2400000.5
            prefix = "MJD"
        elif format_type == "tjd":
            value = jd - 2440000.5
            prefix = "TJD"
        elif format_type == "rjd":
            value = jd - 2400000.0
            prefix = "RJD"
        else:  # jd
            value = jd
            prefix = "JD"
        
        return f"{prefix} {value:.{decimal_places}f}"
    
    def _find_nearest_milestone(self, jd: float) -> tuple:
        """Find the nearest milestone Julian Date."""
        nearest_jd = None
        nearest_desc = None
        min_diff = float('inf')
        
        for milestone_jd, description in self._milestones.items():
            diff = abs(jd - milestone_jd)
            if diff < min_diff:
                min_diff = diff
                nearest_jd = milestone_jd
                nearest_desc = description
        
        return (nearest_jd, nearest_desc, jd - nearest_jd if nearest_jd else 0)
    
    def _calculate_jd_info(self, dt: datetime) -> Dict[str, Any]:
        """Calculate Julian Date information."""
        # Calculate Julian Date
        jd = self._gregorian_to_julian_date(dt)
        
        # Get integer and fractional parts
        jd_integer = int(jd)
        jd_fraction = jd - jd_integer
        
        # Format primary display
        formatted = self._format_julian_date(jd, self._format, self._decimal_places)
        
        result = {
            "julian_date": jd,
            "julian_date_integer": jd_integer,
            "julian_date_fraction": jd_fraction,
            "formatted": formatted,
            "gregorian_date": dt.strftime("%Y-%m-%d %H:%M:%S UTC")
        }
        
        # Add time component if configured
        if self._show_time:
            time_str = self._fraction_to_time(jd_fraction)
            result["fraction_as_time"] = time_str
            result["hours_from_noon"] = jd_fraction * 24
        
        # Add all variants if configured
        if self._show_all_variants:
            result["variants"] = {
                "JD": self._format_julian_date(jd, "jd", self._decimal_places),
                "MJD": self._format_julian_date(jd, "mjd", self._decimal_places),
                "TJD": self._format_julian_date(jd, "tjd", self._decimal_places),
                "RJD": self._format_julian_date(jd, "rjd", self._decimal_places)
            }
        
        # Find nearest milestone
        nearest_jd, nearest_desc, diff_days = self._find_nearest_milestone(jd)
        if nearest_desc:
            result["nearest_milestone"] = nearest_desc
            result["days_from_milestone"] = f"{diff_days:+.1f} days"
        
        # Calculate century and millennium from J2000.0
        j2000_jd = 2451545.0  # J2000.0 epoch
        days_from_j2000 = jd - j2000_jd
        julian_century = days_from_j2000 / 36525.0  # Julian century = 36525 days
        julian_millennium = julian_century / 10.0
        
        result["julian_century"] = f"T{julian_century:+.8f}"
        result["julian_millennium"] = f"{julian_millennium:+.8f}"
        
        # Add day of week (JD 0.0 was a Monday)
        day_of_week = int((jd + 0.5)) % 7
        weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        result["day_of_week"] = weekdays[day_of_week]
        
        # Add Julian Day Number (integer part at noon)
        jdn = int(jd + 0.5)
        result["julian_day_number"] = jdn
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Load options on every update
        options = self.get_plugin_options()
        
        # Debug on first update
        if self._first_update:
            if options:
                _LOGGER.info(f"Julian Date sensor options in first update: {options}")
            else:
                _LOGGER.debug("Julian Date sensor using defaults (no options configured)")
            self._first_update = False
        
        # Update configuration
        if options:
            self._format = options.get("format", "jd")
            decimal_str = options.get("decimal_places", "5")
            try:
                self._decimal_places = int(decimal_str)
            except (ValueError, TypeError):
                self._decimal_places = 5
            self._show_time = bool(options.get("show_time", False))
            self._show_all_variants = bool(options.get("show_all_variants", False))
        
        # Calculate Julian Date
        try:
            now = datetime.now(timezone.utc)
            self._jd_info = self._calculate_jd_info(now)
            self._state = self._jd_info["formatted"]
            
        except Exception as e:
            _LOGGER.error(f"Error calculating Julian Date: {e}")
            self._state = "Error"
            self._jd_info = {"error": str(e)}
        
        _LOGGER.debug(f"Updated Julian Date to {self._state}")


# Required for Home Assistant to discover this calendar
__all__ = ['JulianDateSensor', 'CALENDAR_INFO']