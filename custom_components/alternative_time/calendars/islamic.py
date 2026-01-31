"""Islamic (Hijri) Calendar implementation - Version 2.5."""
from __future__ import annotations

from datetime import datetime
import logging
import math
from typing import Dict, Any

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (3600 seconds = 1 hour)
UPDATE_INTERVAL = 3600

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "islamic",
    "version": "2.5.0",
    "icon": "mdi:star-and-crescent",
    "category": "religious",
    "accuracy": "tabular",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Islamic (Hijri) Calendar",
        "de": "Islamischer (Hidschri) Kalender",
        "ar": "التقويم الهجري",
        "fr": "Calendrier islamique (Hégirien)",
        "tr": "İslami (Hicri) Takvim",
        "id": "Kalender Islam (Hijriah)",
        "fa": "تقویم هجری قمری"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Lunar Islamic calendar with 12 months and 30-year leap cycle (tabular method)",
        "de": "Islamischer Mondkalender mit 12 Monaten und 30-jährigem Schaltzyklus (tabellarische Methode)",
        "ar": "تقويم قمري مكوّن من 12 شهرًا مع دورة كبيسة كل 30 سنة (طريقة حسابية)"
    },
    
    # Detailed information for documentation
    "detailed_info": {
        "en": {
            "overview": "The Islamic (Hijri) calendar is a purely lunar calendar of 12 months and 354 or 355 days.",
            "epoch": "Epoch = 1 Muḥarram AH 1 (Friday, July 16, 622 Julian).",
            "structure": "Months alternate 30/29 days; Dhū al-Ḥijjah has 30 days in leap years.",
            "leap_years": "Leap years in a 30-year cycle: 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29.",
            "method": "This sensor uses the tabular (civil) Hijri algorithm; astronomical visibility is not used.",
            "note": "Regional calendars (e.g., Umm al-Qura) may differ by ±1 day."
        },
        "de": {
            "overview": "Der islamische (Hidschri) Kalender ist ein reiner Mondkalender mit 12 Monaten und 354 bzw. 355 Tagen.",
            "epoch": "Epoche = 1. Muḥarram 1 AH (Freitag, 16. Juli 622 jul.).",
            "structure": "Monate wechseln 30/29 Tage; Dhū al-Ḥiddscha hat 30 Tage in Schaltjahren.",
            "leap_years": "Schaltjahre im 30-Jahres-Zyklus: 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29.",
            "method": "Verwendet die tabellarische (zivile) Hijri-Berechnung; keine astronomische Mondsichtung.",
            "note": "Regionale Kalender (z. B. Umm al-Qura) können um ±1 Tag abweichen."
        }
    },
    
    # Islamic-specific data
    "islamic_data": {
        # Months with Arabic, transliteration, typical days (non-leap; Dhu al-Hijjah varies)
        "months": [
            {"num": 1,  "ar": "مُحَرَّم", "en": "Muharram", "days": 30},
            {"num": 2,  "ar": "صَفَر", "en": "Safar", "days": 29},
            {"num": 3,  "ar": "رَبيع الأوّل", "en": "Rabi' al-Awwal", "days": 30},
            {"num": 4,  "ar": "رَبيع الآخر", "en": "Rabi' ath-Thani", "days": 29},
            {"num": 5,  "ar": "جُمادى الأولى", "en": "Jumada al-Ula", "days": 30},
            {"num": 6,  "ar": "جُمادى الآخرة", "en": "Jumada al-Akhirah", "days": 29},
            {"num": 7,  "ar": "رَجَب", "en": "Rajab", "days": 30},
            {"num": 8,  "ar": "شَعْبان", "en": "Sha'ban", "days": 29},
            {"num": 9,  "ar": "رَمَضان", "en": "Ramadan", "days": 30},
            {"num": 10, "ar": "شَوّال", "en": "Shawwal", "days": 29},
            {"num": 11, "ar": "ذو القعدة", "en": "Dhu al-Qa'dah", "days": 30},
            {"num": 12, "ar": "ذو الحجة", "en": "Dhu al-Hijjah", "days": 29}  # 30 in leap years
        ],
        
        # Weekdays (Sunday first to align with HA)
        "weekdays": [
            {"en": "Sunday", "ar": "الأحد"},
            {"en": "Monday", "ar": "الإثنين"},
            {"en": "Tuesday", "ar": "الثلاثاء"},
            {"en": "Wednesday", "ar": "الأربعاء"},
            {"en": "Thursday", "ar": "الخميس"},
            {"en": "Friday", "ar": "الجمعة"},
            {"en": "Saturday", "ar": "السبت"}
        ],
        
        # Events (common observances; dates may vary regionally)
        "events": {
            "(1,1)": "Islamic New Year (Ras as-Sana)",
            "(1,10)": "Ashura",
            "(3,12)": "Mawlid",
            "(9,27)": "Laylat al-Qadr (est.)",
            "(10,1)": "Eid al-Fitr",
            "(12,8)": "Start of Hajj (est.)",
            "(12,10)": "Eid al-Adha"
        },
        
        # Epoch JDN for 1 Muharram AH 1 (civil/tabular)
        "epoch_jdn": 1948439
    },
    
    # Additional metadata
    "reference_url": "https://en.wikipedia.org/wiki/Islamic_calendar",
    "documentation_url": "https://www.crescentmoonfoundation.org/islamic-calendar-basics",
    "origin": "Early Islamic era",
    "created_by": "Traditional Islamic timekeeping",
    
    # Example format
    "example": "10 Ramadan 1447 AH (al-Jum'a)",
    "example_meaning": "10th of Ramadan, year 1447 Anno Hegirae (Friday)",
    
    # Related calendars
    "related": ["gregorian", "julian"],
    
    # Tags for searching and filtering
    "tags": [
        "religion", "islamic", "hijri", "lunar", "calendar", "ramadan", "eid", "tabular"
    ],
    
    # Special features
    "features": {
        "lunar": True,
        "thirty_year_cycle": True,
        "regional_variation": True,
        "precision": "day"
    },
    
    # Configuration options for this calendar
    "config_options": {
        "show_arabic_names": {
            "type": "boolean",
            "default": True,
            "description": {
                "en": "Show Arabic month/weekday names",
                "de": "Arabische Monats-/Wochentagsnamen anzeigen",
                "ar": "عرض أسماء الأشهر/الأيام بالعربية"
            }
        },
        "calculation_method": {
            "type": "select",
            "default": "tabular",
            "options": ["tabular"],
            "description": {
                "en": "Calculation method (tabular civil Hijri)",
                "de": "Berechnungsmethode (tabellarischer ziviler Hidschri)"
            }
        },
        "offset_days": {
            "type": "integer",
            "default": 0,
            "min": -2,
            "max": 2,
            "description": {
                "en": "Manual offset in days (-2..+2) to match local announcement",
                "de": "Manueller Offset in Tagen (-2..+2) zur lokalen Anpassung"
            }
        }
    }
}


class IslamicCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying the Islamic (Hijri) calendar."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL  # Inherit from metadata
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Islamic calendar sensor."""
        super().__init__(base_name, hass)
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Islamic (Hijri) Calendar')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_islamic_calendar"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:star-and-crescent")
        
        # Configuration options
        self._show_arabic_names = True
        self._calculation_method = "tabular"
        self._offset_days = 0
        
        # Islamic data
        self._islamic_data = CALENDAR_INFO["islamic_data"]
        
        _LOGGER.debug(f"Initialized Islamic Calendar sensor: {self._attr_name}")
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        # Add Islamic-specific attributes
        if hasattr(self, '_islamic_date'):
            attrs.update(self._islamic_date)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add epoch info
            attrs["epoch_jdn"] = self._islamic_data["epoch_jdn"]
        
        return attrs
    
    # ===============================
    # Helpers: Hijri calculations
    # ===============================
    
    @staticmethod
    def _gregorian_to_jdn(y: int, m: int, d: int) -> int:
        """Convert Gregorian date to Julian Day Number (at 00:00)."""
        a = (14 - m) // 12
        y2 = y + 4800 - a
        m2 = m + 12 * a - 3
        jdn = d + ((153 * m2 + 2) // 5) + 365 * y2 + y2 // 4 - y2 // 100 + y2 // 400 - 32045
        return jdn
    
    def _islamic_to_jdn(self, year: int, month: int, day: int) -> int:
        """Convert Islamic (tabular) date to Julian Day Number (civil)."""
        # Month lengths alternate 30/29, using ceil(29.5*(month-1))
        return (
            day
            + int(math.ceil(29.5 * (month - 1)))
            + (year - 1) * 354
            + ((3 + 11 * year) // 30)  # leap days
            + self._islamic_data["epoch_jdn"]
        )
    
    def _jdn_to_islamic(self, jdn: int) -> Dict[str, int]:
        """Convert Julian Day Number to Islamic (tabular) date."""
        year = (30 * (jdn - self._islamic_data["epoch_jdn"]) + 10646) // 10631
        # Month estimate
        first_of_year = self._islamic_to_jdn(year, 1, 1)
        month = int(math.ceil((jdn - 29 - first_of_year) / 29.5) + 1)
        if month < 1:
            month = 1
        if month > 12:
            month = 12
        first_of_month = self._islamic_to_jdn(year, month, 1)
        day = jdn - first_of_month + 1
        return {"year": int(year), "month": int(month), "day": int(day)}
    
    @staticmethod
    def _is_leap_year(year: int) -> bool:
        """Return True if Hijri year is leap in the 30-year cycle."""
        return ((11 * year + 14) % 30) < 11
    
    def _days_in_month(self, year: int, month: int) -> int:
        """Days in given Hijri month for tabular calendar."""
        if month == 12:
            return 30 if self._is_leap_year(year) else 29
        # Alternate 30/29 starting with 30 for Muharram
        return 30 if month % 2 == 1 else 29
    
    def _weekday_from_jdn(self, jdn: int) -> int:
        """0 = Monday ... 6 = Sunday in ISO; we map to 0 = Sunday for consistency with HA week lists above."""
        # Python's datetime.weekday is 0=Monday, but we have only JDN here.
        # JDN 0 was Monday; so (jdn + 1) % 7 gives 0=Tuesday; adjust:
        # Simpler: compute same as datetime by referencing known epoch: 1970-01-01 (JDN 2440588) was Thursday.
        # We'll map to 0=Sunday:
        weekday_monday0 = (jdn + 1) % 7  # Monday=0
        # Convert Monday=0 to Sunday=0
        return (weekday_monday0 + 1) % 7
    
    # ===============================
    # Core calculation
    # ===============================
    
    def _calculate_islamic_date(self, earth_date: datetime) -> Dict[str, Any]:
        """Calculate Islamic date from Gregorian date (tabular)."""
        # Convert to JDN at local date (ignore time component -> date only)
        jdn = self._gregorian_to_jdn(earth_date.year, earth_date.month, earth_date.day)
        jdn += self._offset_days  # user offset to match local announcements
        
        hijri = self._jdn_to_islamic(jdn)
        year, month, day = hijri["year"], hijri["month"], hijri["day"]
        
        # Clamp day into valid range in case of offsets
        dim = self._days_in_month(year, month)
        if day < 1:
            # Borrow from previous month
            if month == 1:
                prev_year, prev_month = year - 1, 12
            else:
                prev_year, prev_month = year, month - 1
            day = self._days_in_month(prev_year, prev_month) + day
            month, year = prev_month, prev_year
            dim = self._days_in_month(year, month)
        elif day > dim:
            day = day - dim
            if month == 12:
                month = 1
                year += 1
            else:
                month += 1
            dim = self._days_in_month(year, month)
        
        # Names
        months = self._islamic_data["months"]
        month_info = months[month - 1]
        month_name_en = month_info["en"]
        month_name_ar = month_info["ar"]
        
        # Weekday
        weekday_index = self._weekday_from_jdn(jdn)  # 0=Sunday .. 6=Saturday
        weekday_info = self._islamic_data["weekdays"][weekday_index]
        weekday_en = weekday_info["en"]
        weekday_ar = weekday_info["ar"]
        
        is_leap = self._is_leap_year(year)
        
        # Events (string keys in metadata)
        events = self._islamic_data["events"]
        event_key = f"({month},{day})"
        event_name = events.get(event_key, "")
        
        # Build state and attributes
        state_text = f"{day} {month_name_en} {year} AH"
        if self._show_arabic_names:
            state_text = f"{day} {month_name_ar} {year} هـ"  # 'هـ' = Hijri sign
        
        # Return attributes
        return {
            "hijri_year": year,
            "hijri_month": month,
            "hijri_day": day,
            "month_name_en": month_name_en,
            "month_name_ar": month_name_ar,
            "weekday_en": weekday_en,
            "weekday_ar": weekday_ar,
            "is_leap_year": is_leap,
            "days_in_month": dim,
            "event": event_name,
            "state_text": state_text,
            "gregorian_date": earth_date.strftime("%Y-%m-%d")
        }
    
    # ===============================
    # Update loop hook
    # ===============================
    
    def update(self) -> None:
        """Update the sensor state and attributes."""
        try:
            now = datetime.now()
            self._islamic_date = self._calculate_islamic_date(now)
            # State shown on the badge
            self._state = self._islamic_date.get("state_text")
        except Exception as exc:
            _LOGGER.exception("Failed to calculate Islamic date: %s", exc)
            self._state = "error"
    
    # ===============================
    # Config handling (optional hooks)
    # ===============================
    
    def set_options(self, *, show_arabic_names: bool | None = None, 
                     calculation_method: str | None = None, 
                     offset_days: int | None = None) -> None:
        """Allow runtime configuration from integration options."""
        if show_arabic_names is not None:
            self._show_arabic_names = bool(show_arabic_names)
        if calculation_method is not None:
            if calculation_method != "tabular":
                _LOGGER.warning("Only 'tabular' method is implemented; got '%s'", calculation_method)
            self._calculation_method = "tabular"
        if offset_days is not None:
            try:
                val = int(offset_days)
            except Exception:
                val = 0
            self._offset_days = max(-2, min(2, val))