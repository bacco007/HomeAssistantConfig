from dataclasses import dataclass, field
from datetime import date, datetime

from dateutil.relativedelta import relativedelta

# Generation Alpha is ongoing, estimated end year
GEN_ALPHA_END_YEAR = 2025


_BIRTHSTONES = {
    1: "Garnet",
    2: "Amethyst",
    3: "Aquamarine",
    4: "Diamond",
    5: "Emerald",
    6: "Pearl",
    7: "Ruby",
    8: "Peridot",
    9: "Sapphire",
    10: "Opal",
    11: "Topaz",
    12: "Turquoise",
}

_BIRTH_FLOWERS = {
    1: "Carnation",
    2: "Violet",
    3: "Daffodil",
    4: "Daisy",
    5: "Lily of the Valley",
    6: "Rose",
    7: "Larkspur",
    8: "Gladiolus",
    9: "Aster",
    10: "Marigold",
    11: "Chrysanthemum",
    12: "Narcissus",
}

_GENERATIONS = (
    ("Silent Generation", 1928, 1945),
    ("Baby Boomers", 1946, 1964),
    ("Gen X", 1965, 1980),
    ("Millennials", 1981, 1996),
    ("Gen Z", 1997, 2012),
    ("Gen Alpha", 2013, GEN_ALPHA_END_YEAR),
)

def get_zodiac_sign(day, month):
    """Return the zodiac sign for a given date."""
    if (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return "Aquarius"
    if (month == 2 and day >= 19) or (month == 3 and day <= 20):
        return "Pisces"
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "Aries"
    if (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "Taurus"
    if (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "Gemini"
    if (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "Cancer"
    if (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "Leo"
    if (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "Virgo"
    if (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "Libra"
    if (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "Scorpio"
    if (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "Sagittarius"
    if (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "Capricorn"


@dataclass
class AnniversaryData:
    """A class to hold anniversary data."""

    name: str
    date: date
    is_one_time: bool = False
    show_half_anniversary: bool = False
    category: str = "other"
    emoji: str = "🎉"
    unknown_year: bool = False
    config: dict = field(default_factory=dict)

    @property
    def birthstone(self) -> str | None:
        """Return the birthstone for the anniversary month."""
        return _BIRTHSTONES.get(self.date.month)

    @property
    def birth_flower(self) -> str | None:
        """Return the birth flower for the anniversary month."""
        return _BIRTH_FLOWERS.get(self.date.month)

    @property
    def zodiac_sign(self) -> str | None:
        """Return the zodiac sign of the anniversary."""
        return get_zodiac_sign(self.date.day, self.date.month)

    @property
    def named_anniversary(self) -> str | None:
        """Return the name of the anniversary if it's a known one."""
        named_anniversaries = {
            1: "Paper",
            5: "Wood",
            10: "Tin",
            15: "Crystal",
            20: "China",
            25: "Silver",
            30: "Pearl",
            40: "Ruby",
            50: "Golden",
            60: "Diamond",
        }
        return named_anniversaries.get(self.next_years)

    @property
    def category_default_icon(self) -> str:
        """Return the default icon for this anniversary's category."""
        from .const import CATEGORY_ICONS, DEFAULT_ICON_NORMAL
        return CATEGORY_ICONS.get(self.category, DEFAULT_ICON_NORMAL)

    @property
    def generation(self) -> str | None:
        """Return the generation of the person."""
        if self.unknown_year:
            return None
        year = self.date.year

        for name, start, end in _GENERATIONS:
            if start <= year <= end:
                return name

        return None

    @property
    def is_milestone(self) -> bool:
        """Return true if the anniversary is a milestone."""
        milestone_years = [1, 5, 10, 18, 21, 25, 50, 75, 100]
        if self.next_years in milestone_years:
            return True
        if self.next_years is not None and self.next_years > 0 and self.next_years % 10 == 0:
            return True
        return False

    @property
    def days_remaining(self) -> int:
        """Calculate the number of days remaining until the next anniversary."""
        today = date.today()
        next_anniversary = self.next_anniversary_date
        return (next_anniversary - today).days

    @property
    def next_anniversary_date(self) -> date:
        """Calculate the date of the next anniversary."""
        today = date.today()
        anniversary_date = self.date
        if self.unknown_year:
            anniversary_date = anniversary_date.replace(year=today.year)

        if self.is_one_time and anniversary_date < today:
            return anniversary_date  # Past one-time event

        next_date = anniversary_date
        if today >= next_date:
            next_date = next_date.replace(year=today.year)
        if today > next_date:
            next_date = next_date.replace(year=today.year + 1)
        return next_date

    @property
    def last_anniversary_date(self) -> date:
        """Calculate the date of the last anniversary."""
        today = date.today()
        anniversary_date = self.date
        if self.unknown_year:
            anniversary_date = anniversary_date.replace(year=today.year)

        last_date = anniversary_date.replace(year=today.year)
        if today < last_date:
            last_date = last_date.replace(year=today.year - 1)
        return last_date

    @property
    def current_years(self) -> int | None:
        """Calculate the current number of years."""
        if self.unknown_year:
            return None
        return relativedelta(date.today(), self.date).years

    @property
    def next_years(self) -> int | None:
        """Calculate the number of years at the next anniversary."""
        if self.unknown_year:
            return None
        return relativedelta(self.next_anniversary_date, self.date).years

    @property
    def weeks_remaining(self) -> int:
        """Calculate the number of weeks remaining."""
        return self.days_remaining // 7

    @property
    def half_anniversary_date(self) -> date | None:
        """Calculate the half anniversary date."""
        if not self.show_half_anniversary:
            return None

        today = date.today()
        half_date = self.date + relativedelta(months=+6)

        next_half_date = half_date
        if today >= next_half_date:
            next_half_date = next_half_date.replace(year=today.year)
        if today > next_half_date:
            next_half_date = next_half_date.replace(year=today.year + 1)

        return next_half_date

    @property
    def days_until_half_anniversary(self) -> int | None:
        """Calculate the number of days until the half anniversary."""
        if not self.show_half_anniversary:
            return None

        half_date = self.half_anniversary_date
        if half_date:
            return (half_date - date.today()).days
        return None

    @property
    def days_since_last(self) -> int:
        """Calculate days since last anniversary (positive) or days until one-time event (negative for future)."""
        today = date.today()
        
        if self.is_one_time:
            # For one-time events: negative if future, positive if past
            return (today - self.date).days
        else:
            # For recurring anniversaries: always positive days since last occurrence
            last_anniversary = self.last_anniversary_date
            return (today - last_anniversary).days

    @property
    def years_since_last(self) -> int | None:
        """Calculate years since last anniversary. Returns None for unknown year anniversaries."""
        if self.unknown_year:
            return None
        
        if self.is_one_time:
            # For one-time events: return years from the event date
            return relativedelta(date.today(), self.date).years
        else:
            # For recurring anniversaries: return years at last anniversary
            last_anniversary = self.last_anniversary_date
            return relativedelta(last_anniversary, self.date).years

    @classmethod
    def from_config(cls, config: dict) -> "AnniversaryData":
        """Create AnniversaryData from config entry."""
        from .const import (
            CONF_DATE, CONF_NAME, CONF_ONE_TIME, CONF_HALF_ANNIVERSARY, 
            CONF_CATEGORY, DEFAULT_CATEGORY, CATEGORY_OPTIONS,
            CONF_EMOJI, DEFAULT_EMOJI, CATEGORY_EMOJIS
        )
        
        # Debug logging
        import logging
        _LOGGER = logging.getLogger(__name__)
        _LOGGER.debug(f"Creating anniversary from config: {config}")
        
        # Parse the date
        date_str = config.get(CONF_DATE, "")
        if not date_str:
            # Check for alternative date fields that might exist
            possible_date_fields = ['date', 'anniversary_date', 'event_date']
            for field in possible_date_fields:
                if field in config and config[field]:
                    date_str = config[field]
                    break
        
        if not date_str:
            raise ValueError(f"Date is required. Config keys: {list(config.keys())}")
            
        try:
            anniversary_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            unknown_year = False
        except ValueError:
            try:
                anniversary_date = datetime.strptime(date_str, "%m-%d").date().replace(year=1900)
                unknown_year = True
            except ValueError:
                raise ValueError(f"Invalid date format: {date_str}")
        
        # Validate and sanitize category
        category = config.get(CONF_CATEGORY, DEFAULT_CATEGORY)
        if category not in CATEGORY_OPTIONS:
            _LOGGER.warning(f"Invalid category '{category}', using default '{DEFAULT_CATEGORY}'")
            category = DEFAULT_CATEGORY
        
        # Get emoji - use custom emoji if provided, otherwise use category default
        emoji = config.get(CONF_EMOJI)
        if not emoji:
            emoji = CATEGORY_EMOJIS.get(category, DEFAULT_EMOJI)
        
        return cls(
            name=config.get(CONF_NAME, "Unknown Anniversary"),
            date=anniversary_date,
            is_one_time=config.get(CONF_ONE_TIME, False),
            show_half_anniversary=config.get(CONF_HALF_ANNIVERSARY, False),
            category=category,
            emoji=emoji,
            unknown_year=unknown_year,
            config=config
        )
