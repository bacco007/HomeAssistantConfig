"""Warhammer 40,000 - Imperial Dating System calendar (Old Style) - v2.0.0

This sensor renders dates in the classic Imperial format:
    C.FFF.YYY.M##
where:
- C   = Check number (0-9), indicating accuracy/source (0 = Terra/most accurate).
- FFF = Year fraction (000-999), i.e., 1,000 equal parts of the year.
- YYY = Year within the millennium (000-999).
- M## = Millennium designator (e.g., M41).

By default we convert the **current Terran (Gregorian) date** per the
Old Style method described in the 3rd Ed. rulebook, summarized on Lexicanum.
You can optionally apply a positive "year_offset" (e.g., 38000) to give the
sensor that M41/M42 feel during present-day years.

References:
- Lexicanum: "Imperial Dating System" (check numbers, year fraction, Makr constant).
- 1000 fractions per year ≈ 8h 45m 36s per fraction; "Makr constant" 0.11407955.

Note: We only implement Old Style here. New Style (post-Great Rift "Vigilus template")
would require a local rift epoch anchor and is not included to keep the sensor lean.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
import logging
from typing import Any, Dict, Optional

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

UPDATE_INTERVAL = 300  # seconds; ~5 min is plenty (fraction ticks every ~8h45m)

CALENDAR_INFO: Dict[str, Any] = {
    "id": "warhammer40k_imperial",
    "version": "2.0.0",
    "icon": "mdi:sword-cross",
    "category": "scifi",
    "accuracy": "lore-accurate (Old Style)",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Warhammer 40,000 - Imperial Date (Old Style)",
        "de": "Warhammer 40.000 - Imperiales Datum (Old Style)",
        "es": "Warhammer 40.000 - Fecha Imperial (Estilo Antiguo)",
        "fr": "Warhammer 40.000 - Date Impériale (Ancien Style)",
        "it": "Warhammer 40.000 - Data Imperiale (Vecchio Stile)",
        "nl": "Warhammer 40.000 - Keizerlijke Datum (Oude Stijl)",
        "pt": "Warhammer 40.000 - Data Imperial (Estilo Antigo)",
        "ru": "Warhammer 40.000 - Имперская дата (Старый стиль)",
        "ja": "ウォーハンマー40,000 - 帝国暦（旧式）",
        "zh": "战锤40,000 - 帝国历法（旧式）",
        "ko": "워해머 40,000 - 제국력 (구식)"
    },
    
    # Descriptions
    "description": {
        "en": "Formats current Terran time into the Imperial Dating System (C.FFF.YYY.M##).",
        "de": "Formatiert die aktuelle terranische Zeit ins Imperiale Datumsformat (C.FFF.YYY.M##).",
        "es": "Formatea el tiempo terrano actual en el Sistema de Datación Imperial (C.FFF.YYY.M##).",
        "fr": "Formate l'heure terrienne actuelle dans le Système de Datation Impérial (C.FFF.YYY.M##).",
        "it": "Formatta l'ora terrestre corrente nel Sistema di Datazione Imperiale (C.FFF.YYY.M##).",
        "nl": "Formatteert de huidige Terraanse tijd in het Keizerlijke Dateringssysteem (C.FFF.YYY.M##).",
        "pt": "Formata o tempo terrano atual no Sistema de Datação Imperial (C.FFF.YYY.M##).",
        "ru": "Форматирует текущее терранское время в Имперскую систему датирования (C.FFF.YYY.M##).",
        "ja": "現在の地球時間を帝国暦システムに変換します (C.FFF.YYY.M##).",
        "zh": "将当前地球时间格式化为帝国历法系统 (C.FFF.YYY.M##).",
        "ko": "현재 지구 시간을 제국 날짜 체계로 변환합니다 (C.FFF.YYY.M##)."
    },
    
    # Configuration options for config_flow
    "config_options": {
        "check_number": {
            "type": "number",
            "default": 0,
            "min": 0,
            "max": 9,
            "label": {
                "en": "Check Number",
                "de": "Prüfziffer",
                "es": "Número de Verificación",
                "fr": "Numéro de Vérification",
                "it": "Numero di Verifica",
                "nl": "Controlegetal",
                "pt": "Número de Verificação",
                "ru": "Контрольный номер",
                "ja": "チェック番号",
                "zh": "校验码",
                "ko": "확인 번호"
            },
            "description": {
                "en": "Imperial check number 0-9 (0 = Terra/most accurate).",
                "de": "Imperiale Prüfziffer 0-9 (0 = Terra/höchste Genauigkeit).",
                "es": "Número de verificación imperial 0-9 (0 = Terra/más preciso).",
                "fr": "Numéro de vérification impérial 0-9 (0 = Terra/plus précis).",
                "it": "Numero di verifica imperiale 0-9 (0 = Terra/più accurato).",
                "nl": "Keizerlijk controlegetal 0-9 (0 = Terra/meest nauwkeurig).",
                "pt": "Número de verificação imperial 0-9 (0 = Terra/mais preciso).",
                "ru": "Имперский контрольный номер 0-9 (0 = Терра/наиболее точный).",
                "ja": "帝国チェック番号 0-9 (0 = テラ/最も正確).",
                "zh": "帝国校验码 0-9 (0 = 泰拉/最准确).",
                "ko": "제국 확인 번호 0-9 (0 = 테라/가장 정확함)."
            }
        },
        "year_offset": {
            "type": "number",
            "default": 0,
            "min": 0,
            "max": 50000,
            "label": {
                "en": "Year Offset",
                "de": "Jahr-Versatz",
                "es": "Desplazamiento de Año",
                "fr": "Décalage d'Année",
                "it": "Offset Anno",
                "nl": "Jaar Offset",
                "pt": "Deslocamento de Ano",
                "ru": "Смещение года",
                "ja": "年オフセット",
                "zh": "年份偏移",
                "ko": "연도 오프셋"
            },
            "description": {
                "en": "Add this many years before converting (e.g., 38000 to map 2025 → 40025 → M41).",
                "de": "So viele Jahre vor der Umrechnung addieren (z.B. 38000, um 2025 → 40025 → M41 zu erhalten).",
                "es": "Añadir estos años antes de convertir (ej., 38000 para mapear 2025 → 40025 → M41).",
                "fr": "Ajouter ce nombre d'années avant la conversion (ex., 38000 pour mapper 2025 → 40025 → M41).",
                "it": "Aggiungi questi anni prima della conversione (es., 38000 per mappare 2025 → 40025 → M41).",
                "nl": "Voeg dit aantal jaren toe voor conversie (bijv. 38000 om 2025 → 40025 → M41 te krijgen).",
                "pt": "Adicionar estes anos antes de converter (ex., 38000 para mapear 2025 → 40025 → M41).",
                "ru": "Добавить столько лет перед преобразованием (напр., 38000 для 2025 → 40025 → M41).",
                "ja": "変換前にこの年数を追加 (例: 38000で2025 → 40025 → M41にマップ).",
                "zh": "转换前添加这些年份（例如，38000将2025 → 40025 → M41）.",
                "ko": "변환 전에 이 년수를 추가 (예: 38000으로 2025 → 40025 → M41 매핑)."
            }
        },
        "system_designator": {
            "type": "text",
            "default": "SOL",
            "label": {
                "en": "System Designator",
                "de": "System-Bezeichnung",
                "es": "Designador de Sistema",
                "fr": "Désignateur de Système",
                "it": "Designatore di Sistema",
                "nl": "Systeem Aanduiding",
                "pt": "Designador de Sistema",
                "ru": "Обозначение системы",
                "ja": "システム指定子",
                "zh": "系统标识符",
                "ko": "시스템 지정자"
            },
            "description": {
                "en": "Optional system/sector code to append (e.g., SOL, VCM, CAD).",
                "de": "Optionaler System-/Sektorkürzel zum Anhängen (z.B. SOL, VCM, CAD).",
                "es": "Código opcional de sistema/sector para añadir (ej., SOL, VCM, CAD).",
                "fr": "Code système/secteur optionnel à ajouter (ex., SOL, VCM, CAD).",
                "it": "Codice sistema/settore opzionale da aggiungere (es., SOL, VCM, CAD).",
                "nl": "Optionele systeem/sector code om toe te voegen (bijv. SOL, VCM, CAD).",
                "pt": "Código opcional de sistema/setor para adicionar (ex., SOL, VCM, CAD).",
                "ru": "Дополнительный код системы/сектора (напр., SOL, VCM, CAD).",
                "ja": "追加するオプションのシステム/セクターコード（例：SOL、VCM、CAD）.",
                "zh": "要附加的可选系统/扇区代码（例如，SOL、VCM、CAD）.",
                "ko": "추가할 선택적 시스템/섹터 코드 (예: SOL, VCM, CAD)."
            }
        },
        "fraction_method": {
            "type": "select",
            "default": "precise",
            "options": ["precise", "lexicanum"],
            "label": {
                "en": "Fraction Method",
                "de": "Fraktions-Methode",
                "es": "Método de Fracción",
                "fr": "Méthode de Fraction",
                "it": "Metodo di Frazione",
                "nl": "Fractie Methode",
                "pt": "Método de Fração",
                "ru": "Метод дроби",
                "ja": "分数計算方法",
                "zh": "分数方法",
                "ko": "분수 방법"
            },
            "description": {
                "en": "Year-fraction method: precise (elapsed seconds ÷ total seconds) or Lexicanum (Makr constant).",
                "de": "Berechnung der Jahresfraktion: precise (verstrichene Sekunden ÷ Gesamtsekunden) oder Lexicanum (Makr-Konstante).",
                "es": "Método de fracción del año: preciso (segundos transcurridos ÷ segundos totales) o Lexicanum (constante Makr).",
                "fr": "Méthode de fraction d'année: précise (secondes écoulées ÷ secondes totales) ou Lexicanum (constante Makr).",
                "it": "Metodo frazione dell'anno: preciso (secondi trascorsi ÷ secondi totali) o Lexicanum (costante Makr).",
                "nl": "Jaar-fractie methode: precies (verstreken seconden ÷ totale seconden) of Lexicanum (Makr constante).",
                "pt": "Método de fração do ano: preciso (segundos decorridos ÷ segundos totais) ou Lexicanum (constante Makr).",
                "ru": "Метод расчета дроби года: точный (прошедшие секунды ÷ общие секунды) или Lexicanum (константа Макр).",
                "ja": "年分数方法：正確（経過秒÷合計秒）またはLexicanum（Makr定数）.",
                "zh": "年份分数方法：精确（经过的秒数÷总秒数）或Lexicanum（Makr常数）.",
                "ko": "연도 분수 방법: 정확 (경과 초 ÷ 총 초) 또는 Lexicanum (Makr 상수)."
            }
        }
    },
    
    # Constants from the lore
    "imperial": {
        "makr_constant": 0.11407955,  # per Lexicanum; 1 fraction ≈ 8h 45m 36s
        "fractions_per_year": 1000
    },
    
    # Additional metadata
    "reference_url": "https://wh40k.lexicanum.com/wiki/Imperial_Dating_System",
    "documentation_url": "https://warhammer40k.fandom.com/wiki/Imperial_Dating_System",
    "origin": "Games Workshop",
    "created_by": "Warhammer 40,000 Universe",
    "introduced": "1987",
    
    # Related calendars
    "related": ["stardate", "star_wars", "eve"],
    
    # Tags for searching and filtering
    "tags": [
        "scifi", "warhammer", "40k", "imperial", "grimdark",
        "millennium", "games_workshop", "fictional"
    ],
    
    # Extended notes
    "notes": {
        "en": (
            "Uses Gregorian AD for year/millennium. Set a positive year_offset "
            "(e.g., 38000) to emulate M41/M42 in present day. "
            "In the grim darkness of the far future, there is only war."
        ),
        "de": (
            "Verwendet gregorianisches AD für Jahr/Jahrtausend. Mit year_offset "
            "(z.B. 38000) lässt sich M41/M42 im Jetzt emulieren. "
            "In der grimmigen Dunkelheit der fernen Zukunft gibt es nur Krieg."
        ),
        "es": (
            "Utiliza AD gregoriano para año/milenio. Con year_offset "
            "(ej., 38000) se puede emular M41/M42 en el presente. "
            "En la oscura penumbra del futuro lejano, solo hay guerra."
        ),
        "fr": (
            "Utilise l'AD grégorien pour l'année/millénaire. Avec year_offset "
            "(ex., 38000) on peut émuler M41/M42 dans le présent. "
            "Dans les ténèbres sinistres du futur lointain, il n'y a que la guerre."
        )
    }
}


@dataclass
class ImperialDate:
    """Imperial Date data structure."""
    check: int
    fraction: int  # 0..999
    year_in_millennium: int  # 0..999
    millennium: int  # e.g., 41
    system: Optional[str] = None

    def format(self) -> str:
        """Format the Imperial Date."""
        sys = f" {self.system}" if self.system else ""
        return f"{self.check}.{self.fraction:03d}.{self.year_in_millennium:03d}.M{self.millennium:02d}{sys}"


class WarhammerImperialCalendarSensor(AlternativeTimeSensorBase):
    """Sensor that exposes the Imperial Dating System (Old Style)."""

    UPDATE_INTERVAL = UPDATE_INTERVAL

    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Warhammer Imperial Calendar sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable for _translate method
        self._calendar_info = CALENDAR_INFO
        
        calendar_name = self._translate('name', 'Warhammer 40,000 - Imperial Date (Old Style)')
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_warhammer40k_imperial_date"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:sword-cross")

        # Configuration options with defaults from CALENDAR_INFO
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._check_number: int = config_defaults.get("check_number", {}).get("default", 0)
        self._year_offset: int = config_defaults.get("year_offset", {}).get("default", 0)
        self._system_designator: str | None = config_defaults.get("system_designator", {}).get("default", "SOL")
        self._fraction_method: str = config_defaults.get("fraction_method", {}).get("default", "precise")
        
        # State variables
        self._imperial: Optional[ImperialDate] = None
        self._terran_year: int = 0
        self._leap_year: bool = False
        self._state: Optional[str] = None
        
        # Flag to track if options have been loaded
        self._options_loaded = False

        _LOGGER.debug("Initialized %s", self._attr_name)
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        # Get plugin options from config entry
        plugin_options = self._get_plugin_options()
        
        if plugin_options:
            _LOGGER.debug(f"Loading Warhammer Imperial options: {plugin_options}")
            
            # Apply options using set_options method
            self.set_options(
                check_number=plugin_options.get("check_number"),
                year_offset=plugin_options.get("year_offset"),
                system_designator=plugin_options.get("system_designator"),
                fraction_method=plugin_options.get("fraction_method")
            )
        
        self._options_loaded = True
    
    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()
        
        # Load options after entity is registered
        self._load_options()
        
        _LOGGER.debug(f"Warhammer Imperial sensor added to hass with options: "
                     f"check={self._check_number}, offset={self._year_offset}, "
                     f"system={self._system_designator}, method={self._fraction_method}")

    # -------------------------------
    # Public properties
    # -------------------------------
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state or "Unknown"

    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return additional attributes."""
        attrs = super().extra_state_attributes
        if self._imperial:
            attrs.update({
                "imperial_check": self._imperial.check,
                "imperial_fraction": self._imperial.fraction,
                "imperial_year_in_millennium": self._imperial.year_in_millennium,
                "imperial_millennium": self._imperial.millennium,
                "system_designator": self._imperial.system,
                "terran_year": self._terran_year,
                "leap_year": self._leap_year,
                "fraction_method": self._fraction_method,
                "year_offset": self._year_offset,
                "calendar_type": "Warhammer 40K Imperial",
                "accuracy": CALENDAR_INFO.get("accuracy", "lore-accurate"),
                "reference": CALENDAR_INFO.get("reference_url"),
                "notes": self._translate("notes"),
                "thought_of_the_day": self._get_thought_of_the_day()
            })
        return attrs

    # -------------------------------
    # Options handling
    # -------------------------------
    def set_options(
        self,
        *,
        check_number: int | None = None,
        year_offset: int | None = None,
        system_designator: str | None = None,
        fraction_method: str | None = None
    ) -> None:
        """Set calendar options from config flow."""
        if check_number is not None:
            if 0 <= check_number <= 9:
                self._check_number = int(check_number)
                _LOGGER.debug(f"Set check_number to: {check_number}")
            else:
                _LOGGER.warning(f"Invalid check_number: {check_number}, keeping {self._check_number}")
        
        if year_offset is not None:
            if 0 <= year_offset <= 50000:
                self._year_offset = int(year_offset)
                _LOGGER.debug(f"Set year_offset to: {year_offset}")
            else:
                _LOGGER.warning(f"Invalid year_offset: {year_offset}, keeping {self._year_offset}")
        
        if system_designator is not None:
            self._system_designator = str(system_designator) if system_designator else None
            _LOGGER.debug(f"Set system_designator to: {system_designator}")
        
        if fraction_method is not None and fraction_method in ["precise", "lexicanum"]:
            self._fraction_method = fraction_method
            _LOGGER.debug(f"Set fraction_method to: {fraction_method}")

    # -------------------------------
    # Calculation methods
    # -------------------------------
    def _is_leap_year(self, year: int) -> bool:
        """Check if a year is a leap year."""
        return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)

    def _millennium_of_year(self, year: int) -> int:
        """Get the millennium number for a year (e.g., 40025 -> 41)."""
        return (year // 1000) + 1

    def _year_in_millennium(self, year: int) -> int:
        """Get the year within its millennium (0-999)."""
        return year % 1000

    def _calc_fraction_precise(self, dt: datetime) -> int:
        """Calculate year fraction using precise method (elapsed seconds / total seconds)."""
        year_start = datetime(dt.year, 1, 1, tzinfo=dt.tzinfo)
        elapsed = dt - year_start
        
        # Total seconds in the year
        days_in_year = 366 if self._is_leap_year(dt.year) else 365
        total_seconds = days_in_year * 86400
        
        # Calculate fraction (0-999)
        fraction = int((elapsed.total_seconds() / total_seconds) * 1000)
        return min(999, max(0, fraction))

    def _calc_fraction_lexicanum(self, dt: datetime) -> int:
        """Calculate year fraction using Lexicanum method (Makr constant)."""
        # Day of year (1-based)
        day_of_year = dt.timetuple().tm_yday
        
        # Apply Makr constant
        makr = CALENDAR_INFO["imperial"]["makr_constant"]
        fraction = int((day_of_year - 1 + makr) * (1000 / 365))
        
        return min(999, max(0, fraction))

    def _to_imperial(self, dt: datetime) -> ImperialDate:
        """Convert a datetime to Imperial Date."""
        # Apply year offset
        terran_year = dt.year + self._year_offset
        millennium = self._millennium_of_year(terran_year)
        yim = self._year_in_millennium(terran_year)  # 0..999
        leap = self._is_leap_year(terran_year if self._year_offset else dt.year)

        # Calculate fraction based on selected method
        if self._fraction_method == "lexicanum":
            fraction = self._calc_fraction_lexicanum(dt)
        else:
            fraction = self._calc_fraction_precise(dt)

        self._leap_year = leap
        self._terran_year = terran_year

        return ImperialDate(
            check=self._check_number,
            fraction=fraction,
            year_in_millennium=yim,
            millennium=millennium,
            system=self._system_designator
        )
    
    def _get_thought_of_the_day(self) -> str:
        """Get a random Thought of the Day."""
        thoughts = [
            "The Emperor protects.",
            "Faith is your shield.",
            "Vigilance is your sword.",
            "Knowledge is power, guard it well.",
            "An open mind is like a fortress with its gates unbarred and unguarded.",
            "Hope is the first step on the road to disappointment.",
            "There is no innocence, only degrees of guilt.",
            "A small mind is easily filled with faith.",
            "Blessed is the mind too small for doubt.",
            "To admit defeat is to blaspheme against the Emperor.",
            "Prayer cleanses the soul, Pain cleanses the body.",
            "Burn the heretic. Kill the mutant. Purge the unclean.",
            "In the darkness, follow the light of Terra.",
            "The difference between heresy and treachery is ignorance.",
            "Success is commemorated; Failure merely remembered.",
            "Only in death does duty end.",
            "Through the destruction of our enemies do we earn our salvation.",
            "War is Peace. Freedom is Slavery. Ignorance is Strength.",
            "Suffer not the witch to live.",
            "Even a man who has nothing can still offer his life."
        ]
        
        # Use day of year as seed for consistent daily thought
        import hashlib
        dt = datetime.now()
        day_seed = f"{dt.year}-{dt.month}-{dt.day}"
        hash_val = int(hashlib.md5(day_seed.encode()).hexdigest(), 16)
        return thoughts[hash_val % len(thoughts)]

    # -------------------------------
    # Update hook
    # -------------------------------
    def update(self) -> None:
        """Update the sensor state."""
        # Ensure options are loaded (in case async_added_to_hass hasn't run yet)
        if not self._options_loaded:
            self._load_options()
        
        try:
            now = datetime.now()
            self._imperial = self._to_imperial(now)
            self._state = self._imperial.format()
            _LOGGER.debug(f"Updated Imperial Date to {self._state}")
        except Exception as exc:
            _LOGGER.exception("Failed to compute Imperial date: %s", exc)
            self._state = "Error"


# ============================================
# MODULE EXPORTS
# ============================================

# Export the sensor class
__all__ = ["WarhammerImperialCalendarSensor"]