"""Astronomical calculations for the SolsticeHub integration.

This module contains all calculation logic for seasons, equinoxes,
solstices, and daylight trends. It is independent of Home Assistant
to allow for easier testing and maintenance.

Uses the ephem library for precise astronomical calculations.
"""

from datetime import date, datetime, timedelta, timezone
from typing import TypedDict

import ephem

from .const import (
    HEMISPHERE_NORTHERN,
    HEMISPHERE_SOUTHERN,
    MODE_ASTRONOMICAL,
    SEASON_AUTUMN,
    SEASON_SPRING,
    SEASON_SUMMER,
    SEASON_WINTER,
    TREND_LONGER,
    TREND_SHORTER,
    TREND_SOLSTICE,
)


class AstronomicalEvents(TypedDict):
    """Type definition for astronomical events."""

    march_equinox: datetime
    june_solstice: datetime
    september_equinox: datetime
    december_solstice: datetime


class BaseData(TypedDict):
    """Type definition for base device sensor data (global/shared)."""

    solar_longitude: float
    daylight_trend: str
    next_trend_change: datetime
    days_until_trend_change: int
    next_trend_event_type: str


class SeasonData(TypedDict):
    """Type definition for season calculation results."""

    current_season: str
    season_age: int
    season_progress: float
    spring_equinox: datetime
    summer_solstice: datetime
    autumn_equinox: datetime
    winter_solstice: datetime
    previous_spring_equinox: datetime
    previous_summer_solstice: datetime
    previous_autumn_equinox: datetime
    previous_winter_solstice: datetime
    days_until_spring: int
    days_until_summer: int
    days_until_autumn: int
    days_until_winter: int
    # Base data fields (shared with all calendar device types)
    solar_longitude: float
    daylight_trend: str
    next_trend_change: datetime
    days_until_trend_change: int
    next_trend_event_type: str
    next_season_change: datetime
    next_season_change_event_type: str
    days_until_season_change: int


# Mapping of seasons to astronomical events per hemisphere
SEASON_MAPPING = {
    HEMISPHERE_NORTHERN: {
        SEASON_SPRING: "march_equinox",
        SEASON_SUMMER: "june_solstice",
        SEASON_AUTUMN: "september_equinox",
        SEASON_WINTER: "december_solstice",
    },
    HEMISPHERE_SOUTHERN: {
        SEASON_SPRING: "september_equinox",
        SEASON_SUMMER: "december_solstice",
        SEASON_AUTUMN: "march_equinox",
        SEASON_WINTER: "june_solstice",
    },
}

# Meteorological season start dates (month, day) per hemisphere
METEOROLOGICAL_SEASONS = {
    HEMISPHERE_NORTHERN: {
        SEASON_SPRING: (3, 1),
        SEASON_SUMMER: (6, 1),
        SEASON_AUTUMN: (9, 1),
        SEASON_WINTER: (12, 1),
    },
    HEMISPHERE_SOUTHERN: {
        SEASON_SPRING: (9, 1),
        SEASON_SUMMER: (12, 1),
        SEASON_AUTUMN: (3, 1),
        SEASON_WINTER: (6, 1),
    },
}


def _ephem_date_to_datetime(ephem_date: ephem.Date) -> datetime:
    """Convert an ephem.Date to a timezone-aware UTC datetime.

    Args:
        ephem_date: An ephem.Date object.

    Returns:
        A timezone-aware datetime in UTC.
    """
    return ephem_date.datetime().replace(tzinfo=timezone.utc)


def calculate_solar_longitude(now: datetime) -> float:
    """Calculate the ecliptic longitude of the Sun.

    The ecliptic longitude is the angular position of the Sun along
    the ecliptic plane, measured from the vernal equinox point (0°).

    Reference points:
    - 0° = Vernal (March) Equinox
    - 90° = Summer (June) Solstice
    - 180° = Autumnal (September) Equinox
    - 270° = Winter (December) Solstice

    Args:
        now: Current datetime in UTC.

    Returns:
        Solar longitude in degrees (0.0 - 359.9), rounded to 1 decimal place.
    """
    sun = ephem.Sun()
    sun.compute(ephem.Date(now))

    # Get ecliptic longitude in radians and convert to degrees
    # ephem uses radians for hlon (heliocentric ecliptic longitude)
    longitude_rad = float(ephem.Ecliptic(sun).lon)
    longitude_deg = longitude_rad * 180.0 / 3.14159265358979

    # Normalize to 0-360 range and round to 1 decimal place
    longitude_deg = longitude_deg % 360.0
    return round(longitude_deg, 1)


def get_astronomical_events(year: int) -> AstronomicalEvents:
    """Get all astronomical events for a given year.

    Uses ephem library to calculate precise equinox and solstice times.
    The calculation starts from January 1st of the given year and finds
    the next occurrence of each event.

    Args:
        year: The year to calculate events for.

    Returns:
        Dictionary containing all four astronomical events with UTC datetimes.
    """
    jan_first = ephem.Date(f"{year}/1/1")

    march_equinox = _ephem_date_to_datetime(ephem.next_vernal_equinox(jan_first))
    june_solstice = _ephem_date_to_datetime(ephem.next_summer_solstice(jan_first))
    september_equinox = _ephem_date_to_datetime(ephem.next_autumnal_equinox(jan_first))
    december_solstice = _ephem_date_to_datetime(ephem.next_winter_solstice(jan_first))

    return AstronomicalEvents(
        march_equinox=march_equinox,
        june_solstice=june_solstice,
        september_equinox=september_equinox,
        december_solstice=december_solstice,
    )


def calculate_days_until(target_date: date, reference_date: date) -> int:
    """Calculate days until a target date.

    Args:
        target_date: The target date to calculate days until.
        reference_date: The reference date to calculate from.

    Returns:
        Number of days until the target date, minimum 0.
    """
    delta = target_date - reference_date
    return max(0, delta.days)


def get_next_event_date(
    event_name: str,
    current_year_events: AstronomicalEvents,
    next_year_events: AstronomicalEvents,
    now: datetime,
) -> datetime:
    """Get the next occurrence of an astronomical event.

    Args:
        event_name: Name of the event (march_equinox, june_solstice, etc.).
        current_year_events: Events for the current year.
        next_year_events: Events for the next year.
        now: Current datetime.

    Returns:
        The next occurrence of the event.
    """
    current_event = current_year_events[event_name]
    if now < current_event:
        return current_event
    return next_year_events[event_name]


def get_previous_event_date(
    event_name: str,
    current_year_events: AstronomicalEvents,
    previous_year_events: AstronomicalEvents,
    now: datetime,
) -> datetime:
    """Get the most recent past occurrence of an astronomical event.

    Args:
        event_name: Name of the event (march_equinox, june_solstice, etc.).
        current_year_events: Events for the current year.
        previous_year_events: Events for the previous year.
        now: Current datetime.

    Returns:
        The most recent past occurrence of the event.
    """
    current_event = current_year_events[event_name]
    if now >= current_event:
        return current_event
    return previous_year_events[event_name]


def determine_current_season_astronomical(
    hemisphere: str, now: datetime, events: AstronomicalEvents
) -> str:
    """Determine the current season using astronomical calculation.

    Args:
        hemisphere: Either 'northern' or 'southern'.
        now: Current datetime.
        events: Astronomical events for the current year.

    Returns:
        Current season as string (spring, summer, autumn, winter).
    """
    mapping = SEASON_MAPPING[hemisphere]

    spring_start = events[mapping[SEASON_SPRING]]
    summer_start = events[mapping[SEASON_SUMMER]]
    autumn_start = events[mapping[SEASON_AUTUMN]]
    winter_start = events[mapping[SEASON_WINTER]]

    if hemisphere == HEMISPHERE_NORTHERN:
        if now >= winter_start:
            return SEASON_WINTER
        if now >= autumn_start:
            return SEASON_AUTUMN
        if now >= summer_start:
            return SEASON_SUMMER
        if now >= spring_start:
            return SEASON_SPRING
        return SEASON_WINTER
    else:
        if now >= summer_start:
            return SEASON_SUMMER
        if now >= spring_start:
            return SEASON_SPRING
        if now >= winter_start:
            return SEASON_WINTER
        if now >= autumn_start:
            return SEASON_AUTUMN
        return SEASON_SUMMER


def get_meteorological_events(year: int, hemisphere: str) -> AstronomicalEvents:
    """Get meteorological season start dates for a given year.

    Returns fixed calendar dates (1st of month) at 00:00 UTC for each season.
    Uses the same key structure as astronomical events for compatibility.

    Args:
        year: The year to get dates for.
        hemisphere: Either 'northern' or 'southern'.

    Returns:
        Dictionary containing all four season start dates with UTC datetimes.
    """
    seasons = METEOROLOGICAL_SEASONS[hemisphere]

    # Map seasons to the astronomical event keys based on hemisphere
    # Northern: spring=march, summer=june, autumn=september, winter=december
    # Southern: spring=september, summer=december, autumn=march, winter=june
    if hemisphere == HEMISPHERE_NORTHERN:
        march_month, march_day = seasons[SEASON_SPRING]
        june_month, june_day = seasons[SEASON_SUMMER]
        september_month, september_day = seasons[SEASON_AUTUMN]
        december_month, december_day = seasons[SEASON_WINTER]
    else:
        march_month, march_day = seasons[SEASON_AUTUMN]
        june_month, june_day = seasons[SEASON_WINTER]
        september_month, september_day = seasons[SEASON_SPRING]
        december_month, december_day = seasons[SEASON_SUMMER]

    return AstronomicalEvents(
        march_equinox=datetime(year, march_month, march_day, 0, 0, 0, tzinfo=timezone.utc),
        june_solstice=datetime(year, june_month, june_day, 0, 0, 0, tzinfo=timezone.utc),
        september_equinox=datetime(year, september_month, september_day, 0, 0, 0, tzinfo=timezone.utc),
        december_solstice=datetime(year, december_month, december_day, 0, 0, 0, tzinfo=timezone.utc),
    )


def determine_current_season_meteorological(hemisphere: str, now: datetime) -> str:
    """Determine the current season using meteorological calculation.

    Meteorological seasons are based on fixed calendar dates:
    - Northern: Spring Mar 1, Summer Jun 1, Autumn Sep 1, Winter Dec 1
    - Southern: Spring Sep 1, Summer Dec 1, Autumn Mar 1, Winter Jun 1

    Args:
        hemisphere: Either 'northern' or 'southern'.
        now: Current datetime.

    Returns:
        Current season as string (spring, summer, autumn, winter).
    """
    month = now.month
    seasons = METEOROLOGICAL_SEASONS[hemisphere]

    season_starts = [(seasons[s][0], s) for s in seasons]
    season_starts.sort(key=lambda x: x[0])

    current_season = season_starts[-1][1]
    for start_month, season in season_starts:
        if month >= start_month:
            current_season = season

    return current_season


def calculate_daylight_trend(
    now: datetime,
    june_solstice: datetime,
    december_solstice: datetime,
) -> str:
    """Determine if days are getting longer or shorter.

    The daylight trend is hemisphere-independent as it only depends on
    the position relative to the solstices.

    Args:
        now: Current datetime.
        june_solstice: June solstice datetime for current year.
        december_solstice: December solstice datetime for current year.

    Returns:
        Trend state (days_getting_longer, days_getting_shorter, solstice_today).
    """
    today = now.date()

    if today == june_solstice.date() or today == december_solstice.date():
        return TREND_SOLSTICE

    if now < june_solstice:
        return TREND_LONGER
    if now < december_solstice:
        return TREND_SHORTER
    return TREND_LONGER


def get_next_solstice(
    hemisphere: str,
    now: datetime,
    current_year_events: AstronomicalEvents,
    next_year_events: AstronomicalEvents,
) -> tuple[datetime, str]:
    """Get the next solstice and its type relative to the hemisphere.

    Args:
        hemisphere: Either 'northern' or 'southern'.
        now: Current datetime.
        current_year_events: Events for the current year.
        next_year_events: Events for the next year.

    Returns:
        Tuple of (next solstice datetime, event type for hemisphere).
    """
    june = current_year_events["june_solstice"]
    december = current_year_events["december_solstice"]

    if now < june:
        next_solstice = june
        event_type = (
            "summer_solstice"
            if hemisphere == HEMISPHERE_NORTHERN
            else "winter_solstice"
        )
    elif now < december:
        next_solstice = december
        event_type = (
            "winter_solstice"
            if hemisphere == HEMISPHERE_NORTHERN
            else "summer_solstice"
        )
    else:
        next_solstice = next_year_events["june_solstice"]
        event_type = (
            "summer_solstice"
            if hemisphere == HEMISPHERE_NORTHERN
            else "winter_solstice"
        )

    return next_solstice, event_type


def get_next_season_change(
    current_season: str,
    hemisphere: str,
    current_year_events: AstronomicalEvents,
    next_year_events: AstronomicalEvents,
    now: datetime,
) -> tuple[datetime, str]:
    """Get the next season change datetime and the upcoming season.

    Args:
        current_season: The current season (spring, summer, autumn, winter).
        hemisphere: Either 'northern' or 'southern'.
        current_year_events: Events for the current year.
        next_year_events: Events for the next year.
        now: Current datetime.

    Returns:
        Tuple of (next season change datetime, upcoming season name).
    """
    # Define the season order
    season_order = [SEASON_SPRING, SEASON_SUMMER, SEASON_AUTUMN, SEASON_WINTER]

    # Find current season index and determine next season
    current_index = season_order.index(current_season)
    next_index = (current_index + 1) % 4
    next_season = season_order[next_index]

    # Get the event name for the next season
    mapping = SEASON_MAPPING[hemisphere]
    event_name = mapping[next_season]

    # Get the datetime for that event
    next_change = get_next_event_date(
        event_name, current_year_events, next_year_events, now
    )

    return next_change, next_season


def get_current_season_start(
    current_season: str,
    hemisphere: str,
    current_year_events: AstronomicalEvents,
    previous_year_events: AstronomicalEvents,
    now: datetime,
) -> datetime:
    """Get the start date of the currently running season.

    This returns the actual start date of the current season, even if it
    started in the previous year (e.g., winter starting in December).

    Args:
        current_season: The current season (spring, summer, autumn, winter).
        hemisphere: Either 'northern' or 'southern'.
        current_year_events: Events for the current year.
        previous_year_events: Events for the previous year.
        now: Current datetime.

    Returns:
        The datetime when the current season started.
    """
    mapping = SEASON_MAPPING[hemisphere]
    event_name = mapping[current_season]

    # Get the event from current year
    current_year_start = current_year_events[event_name]

    # If we're past this year's event, current season started this year
    if now >= current_year_start:
        return current_year_start

    # Otherwise, the current season started last year
    return previous_year_events[event_name]


def calculate_season_data(hemisphere: str, mode: str, now: datetime) -> SeasonData:
    """Calculate all season-related data.

    This is the main entry point for all calculations. It returns all
    data needed by the sensors.

    Args:
        hemisphere: Either 'northern' or 'southern'.
        mode: Either 'astronomical' or 'meteorological'.
        now: Current datetime in UTC.

    Returns:
        Dictionary containing all calculated season data.
    """
    year = now.year

    # Get events based on calculation mode for season determination
    if mode == MODE_ASTRONOMICAL:
        previous_events = get_astronomical_events(year - 1)
        current_events = get_astronomical_events(year)
        next_events = get_astronomical_events(year + 1)
        current_season = determine_current_season_astronomical(
            hemisphere, now, current_events
        )
    else:
        previous_events = get_meteorological_events(year - 1, hemisphere)
        current_events = get_meteorological_events(year, hemisphere)
        next_events = get_meteorological_events(year + 1, hemisphere)
        current_season = determine_current_season_meteorological(hemisphere, now)

    mapping = SEASON_MAPPING[hemisphere]

    spring_event = get_next_event_date(
        mapping[SEASON_SPRING], current_events, next_events, now
    )
    summer_event = get_next_event_date(
        mapping[SEASON_SUMMER], current_events, next_events, now
    )
    autumn_event = get_next_event_date(
        mapping[SEASON_AUTUMN], current_events, next_events, now
    )
    winter_event = get_next_event_date(
        mapping[SEASON_WINTER], current_events, next_events, now
    )

    # Get previous (most recent past) events for last_start attribute
    previous_spring_event = get_previous_event_date(
        mapping[SEASON_SPRING], current_events, previous_events, now
    )
    previous_summer_event = get_previous_event_date(
        mapping[SEASON_SUMMER], current_events, previous_events, now
    )
    previous_autumn_event = get_previous_event_date(
        mapping[SEASON_AUTUMN], current_events, previous_events, now
    )
    previous_winter_event = get_previous_event_date(
        mapping[SEASON_WINTER], current_events, previous_events, now
    )

    today = now.date()
    days_until_spring = calculate_days_until(spring_event.date(), today)
    days_until_summer = calculate_days_until(summer_event.date(), today)
    days_until_autumn = calculate_days_until(autumn_event.date(), today)
    days_until_winter = calculate_days_until(winter_event.date(), today)

    # Base data (solar_longitude + daylight trend) is shared with all calendars
    base = calculate_base_data(hemisphere, now)

    next_season_change, next_season_change_event_type = get_next_season_change(
        current_season, hemisphere, current_events, next_events, now
    )
    days_until_season_change = calculate_days_until(next_season_change.date(), today)

    current_season_start = get_current_season_start(
        current_season, hemisphere, current_events, previous_events, now
    )
    season_age = (today - current_season_start.date()).days

    # Calculate season progress as percentage (0.0 - 100.0)
    season_duration = season_age + days_until_season_change
    season_progress = (
        round((season_age / season_duration) * 100, 1) if season_duration > 0 else 0.0
    )

    return SeasonData(
        current_season=current_season,
        season_age=season_age,
        season_progress=season_progress,
        spring_equinox=spring_event,
        summer_solstice=summer_event,
        autumn_equinox=autumn_event,
        winter_solstice=winter_event,
        previous_spring_equinox=previous_spring_event,
        previous_summer_solstice=previous_summer_event,
        previous_autumn_equinox=previous_autumn_event,
        previous_winter_solstice=previous_winter_event,
        days_until_spring=days_until_spring,
        days_until_summer=days_until_summer,
        days_until_autumn=days_until_autumn,
        days_until_winter=days_until_winter,
        next_season_change=next_season_change,
        next_season_change_event_type=next_season_change_event_type,
        days_until_season_change=days_until_season_change,
        **base,
    )


def calculate_base_data(hemisphere: str, now: datetime) -> BaseData:
    """Calculate the shared base-data fields.

    This includes hemisphere-independent astronomical data (solar_longitude)
    and hemisphere-dependent interpretation (daylight_trend). These fields are
    merged into every calendar device type's sensor data.

    Args:
        hemisphere: Either 'northern' or 'southern' for daylight trend interpretation.
        now: Current datetime in UTC.

    Returns:
        Dictionary containing all base device sensor data.
    """
    year = now.year
    today = now.date()

    # Calculate solar longitude (global, hemisphere-independent)
    solar_longitude = calculate_solar_longitude(now)

    # Get astronomical events for daylight trend calculation
    astronomical_events = get_astronomical_events(year)
    astronomical_events_next = get_astronomical_events(year + 1)

    # Daylight trend (interpretation depends on hemisphere)
    daylight_trend = calculate_daylight_trend(
        now,
        astronomical_events["june_solstice"],
        astronomical_events["december_solstice"],
    )

    # Apply hemisphere interpretation to daylight trend
    # The base calculation gives trend for northern hemisphere
    # For southern hemisphere, the interpretation is reversed
    if hemisphere == HEMISPHERE_SOUTHERN:
        if daylight_trend == TREND_LONGER:
            daylight_trend = TREND_SHORTER
        elif daylight_trend == TREND_SHORTER:
            daylight_trend = TREND_LONGER
        # TREND_SOLSTICE stays the same

    # Next daylight trend change (next solstice)
    next_trend_change, next_trend_event_type = get_next_solstice(
        hemisphere, now, astronomical_events, astronomical_events_next
    )
    days_until_trend_change = calculate_days_until(next_trend_change.date(), today)

    return BaseData(
        solar_longitude=solar_longitude,
        daylight_trend=daylight_trend,
        next_trend_change=next_trend_change,
        days_until_trend_change=days_until_trend_change,
        next_trend_event_type=next_trend_event_type,
    )


# =============================================================================
# Cross-Quarter Calendar Calculations
# =============================================================================

# Cross-Quarter event names (Celtic names)
CELTIC_IMBOLC = "imbolc"
CELTIC_OSTARA = "ostara"
CELTIC_BELTANE = "beltane"
CELTIC_LITHA = "litha"
CELTIC_LUGHNASADH = "lughnasadh"
CELTIC_MABON = "mabon"
CELTIC_SAMHAIN = "samhain"
CELTIC_YULE = "yule"

# Solar longitudes for Cross-Quarter events
CROSS_QUARTER_LONGITUDES = {
    CELTIC_OSTARA: 0,       # Spring Equinox
    CELTIC_BELTANE: 45,     # Cross-Quarter
    CELTIC_LITHA: 90,       # Summer Solstice
    CELTIC_LUGHNASADH: 135, # Cross-Quarter
    CELTIC_MABON: 180,      # Autumn Equinox
    CELTIC_SAMHAIN: 225,    # Cross-Quarter
    CELTIC_YULE: 270,       # Winter Solstice
    CELTIC_IMBOLC: 315,     # Cross-Quarter
}

# Traditional fixed dates for Cross-Quarter events (month, day)
TRADITIONAL_CROSS_QUARTER_DATES = {
    CELTIC_IMBOLC: (2, 1),      # February 1
    CELTIC_OSTARA: None,       # Use astronomical calculation
    CELTIC_BELTANE: (5, 1),     # May 1
    CELTIC_LITHA: None,        # Use astronomical calculation
    CELTIC_LUGHNASADH: (8, 1),  # August 1
    CELTIC_MABON: None,        # Use astronomical calculation
    CELTIC_SAMHAIN: (11, 1),    # November 1
    CELTIC_YULE: None,         # Use astronomical calculation
}

# Order of Cross-Quarter events through the year (starting from Yule)
CROSS_QUARTER_ORDER = [
    CELTIC_YULE,        # ~Dec 21 (270°)
    CELTIC_IMBOLC,      # ~Feb 4 (315°)
    CELTIC_OSTARA,      # ~Mar 20 (0°)
    CELTIC_BELTANE,     # ~May 5 (45°)
    CELTIC_LITHA,       # ~Jun 21 (90°)
    CELTIC_LUGHNASADH,  # ~Aug 7 (135°)
    CELTIC_MABON,       # ~Sep 22 (180°)
    CELTIC_SAMHAIN,     # ~Nov 7 (225°)
]


class CrossQuarterEvents(TypedDict):
    """Type definition for Cross-Quarter events."""

    imbolc: datetime
    ostara: datetime
    beltane: datetime
    litha: datetime
    lughnasadh: datetime
    mabon: datetime
    samhain: datetime
    yule: datetime


class CrossQuarterData(TypedDict):
    """Type definition for Cross-Quarter calendar sensor data."""

    current_period: str
    period_age: int
    next_period_change: datetime
    next_period_event_type: str
    days_until_next_change: int
    events: dict[str, datetime]
    # Base data fields (shared with all calendar device types)
    solar_longitude: float
    daylight_trend: str
    next_trend_change: datetime
    days_until_trend_change: int
    next_trend_event_type: str


def find_date_for_solar_longitude(target_longitude: float, year: int) -> datetime:
    """Find the date when the Sun reaches a specific ecliptic longitude.

    Uses binary search to find the precise moment when the Sun's
    ecliptic longitude equals the target value.

    Args:
        target_longitude: Target solar longitude in degrees (0-360).
        year: The year to search in.

    Returns:
        UTC datetime when the Sun reaches the target longitude.
    """
    # Estimate starting point based on longitude
    # 0° is around March 20, so offset accordingly
    day_of_year = int((target_longitude / 360.0) * 365.25) + 80  # ~March 20 offset
    if day_of_year > 365:
        day_of_year -= 365

    # Start date for search
    start_date = datetime(year, 1, 1, tzinfo=timezone.utc)
    estimated_date = start_date + timedelta(days=day_of_year - 1)

    # Binary search with a range of ±15 days
    low = estimated_date - timedelta(days=15)
    high = estimated_date + timedelta(days=15)

    # Iterate to find precise moment (within 1 minute accuracy)
    for _ in range(20):  # Max 20 iterations
        mid = low + (high - low) / 2
        current_longitude = calculate_solar_longitude(mid)

        # Handle wrap-around at 0°/360°
        diff = (current_longitude - target_longitude + 180) % 360 - 180

        if abs(diff) < 0.01:  # Close enough (about 15 minutes)
            return mid
        elif diff > 0:
            high = mid
        else:
            low = mid

    return low + (high - low) / 2  # pragma: no cover - binary search converges within 20 iterations


def get_cross_quarter_events_astronomical(year: int) -> CrossQuarterEvents:
    """Get all Cross-Quarter events for a year using astronomical calculation.

    Calculates the exact moments when the Sun reaches the ecliptic
    longitudes for each Cross-Quarter event.

    Args:
        year: The year to calculate events for.

    Returns:
        Dictionary containing all eight Cross-Quarter events with UTC datetimes.
    """
    # Get the four main events from existing calculation
    astro_events = get_astronomical_events(year)

    events = CrossQuarterEvents(
        ostara=astro_events["march_equinox"],
        litha=astro_events["june_solstice"],
        mabon=astro_events["september_equinox"],
        yule=astro_events["december_solstice"],
        # Calculate cross-quarter points
        imbolc=find_date_for_solar_longitude(315, year),
        beltane=find_date_for_solar_longitude(45, year),
        lughnasadh=find_date_for_solar_longitude(135, year),
        samhain=find_date_for_solar_longitude(225, year),
    )

    return events


def get_cross_quarter_events_traditional(year: int) -> CrossQuarterEvents:
    """Get all Cross-Quarter events for a year using traditional fixed dates.

    Uses the traditional Celtic festival dates for cross-quarter days
    and astronomical calculation for solstices/equinoxes.

    Args:
        year: The year to calculate events for.

    Returns:
        Dictionary containing all eight Cross-Quarter events with UTC datetimes.
    """
    # Get the four main events from existing calculation
    astro_events = get_astronomical_events(year)

    # Traditional dates are at midnight UTC
    events = CrossQuarterEvents(
        ostara=astro_events["march_equinox"],
        litha=astro_events["june_solstice"],
        mabon=astro_events["september_equinox"],
        yule=astro_events["december_solstice"],
        # Traditional fixed dates
        imbolc=datetime(year, 2, 1, 0, 0, 0, tzinfo=timezone.utc),
        beltane=datetime(year, 5, 1, 0, 0, 0, tzinfo=timezone.utc),
        lughnasadh=datetime(year, 8, 1, 0, 0, 0, tzinfo=timezone.utc),
        samhain=datetime(year, 11, 1, 0, 0, 0, tzinfo=timezone.utc),
    )

    return events


def determine_current_celtic_period(
    now: datetime, events: CrossQuarterEvents
) -> tuple[str, datetime]:
    """Determine the current Celtic period based on Cross-Quarter events.

    Args:
        now: Current datetime.
        events: Cross-Quarter events for the current year.

    Returns:
        Tuple of (current period name, start datetime of current period).
    """
    # Build list of (event_name, datetime) sorted by date
    event_list = [
        (CELTIC_YULE, events["yule"]),
        (CELTIC_IMBOLC, events["imbolc"]),
        (CELTIC_OSTARA, events["ostara"]),
        (CELTIC_BELTANE, events["beltane"]),
        (CELTIC_LITHA, events["litha"]),
        (CELTIC_LUGHNASADH, events["lughnasadh"]),
        (CELTIC_MABON, events["mabon"]),
        (CELTIC_SAMHAIN, events["samhain"]),
    ]

    # Sort by date
    event_list.sort(key=lambda x: x[1])

    # Find current period
    current_period = CELTIC_YULE  # Default if before first event
    period_start = events["yule"]

    for event_name, event_date in event_list:
        if now >= event_date:
            current_period = event_name
            period_start = event_date
        else:
            break

    return current_period, period_start


def get_next_cross_quarter_event(
    now: datetime,
    current_year_events: CrossQuarterEvents,
    next_year_events: CrossQuarterEvents,
) -> tuple[datetime, str]:
    """Get the next Cross-Quarter event.

    Args:
        now: Current datetime.
        current_year_events: Events for the current year.
        next_year_events: Events for the next year.

    Returns:
        Tuple of (next event datetime, event name).
    """
    # Build sorted list of all events
    events_list = []
    for event_name in CROSS_QUARTER_ORDER:
        events_list.append((event_name, current_year_events[event_name]))
        events_list.append((event_name, next_year_events[event_name]))

    # Sort by date
    events_list.sort(key=lambda x: x[1])

    # Find next event
    for event_name, event_date in events_list:
        if event_date > now:
            return event_date, event_name

    # Fallback (should never happen)
    return next_year_events["yule"], CELTIC_YULE


def calculate_cross_quarter_data(
    hemisphere: str,
    mode: str,
    now: datetime,
) -> CrossQuarterData:
    """Calculate data for Cross-Quarter calendar sensors.

    Args:
        hemisphere: Either 'northern' or 'southern' (for daylight trend).
        mode: Either 'astronomical' or 'traditional'.
        now: Current datetime in UTC.

    Returns:
        Dictionary containing all Cross-Quarter calendar sensor data.
    """
    year = now.year
    today = now.date()

    # Get events based on mode
    if mode == MODE_ASTRONOMICAL:
        current_events = get_cross_quarter_events_astronomical(year)
        next_events = get_cross_quarter_events_astronomical(year + 1)
        prev_events = get_cross_quarter_events_astronomical(year - 1)
    else:  # traditional
        current_events = get_cross_quarter_events_traditional(year)
        next_events = get_cross_quarter_events_traditional(year + 1)
        prev_events = get_cross_quarter_events_traditional(year - 1)

    # Determine current period
    current_period, period_start = determine_current_celtic_period(now, current_events)

    # If we're before the first event of the year, check previous year
    if period_start > now:
        current_period, period_start = determine_current_celtic_period(now, prev_events)

    # Calculate period age
    period_age = (today - period_start.date()).days

    # Get next event
    next_change, next_event_type = get_next_cross_quarter_event(
        now, current_events, next_events
    )
    days_until_next = calculate_days_until(next_change.date(), today)

    # Build events dict with next occurrences
    events_dict = {}
    for event_name in CROSS_QUARTER_ORDER:
        event_date = current_events[event_name]
        if event_date <= now:
            event_date = next_events[event_name]
        events_dict[event_name] = event_date

    # Base data (solar_longitude + daylight trend) is shared with all calendars
    base = calculate_base_data(hemisphere, now)

    return CrossQuarterData(
        current_period=current_period,
        period_age=period_age,
        next_period_change=next_change,
        next_period_event_type=next_event_type,
        days_until_next_change=days_until_next,
        events=events_dict,
        **base,
    )


# =============================================================================
# Chinese Solar Terms Calendar
# =============================================================================

# Chinese Solar Terms - 24 terms at 15° intervals
# Starting from Xiaohan (Minor Cold) at 285° which is around January 6
CHINESE_SOLAR_TERMS: list[tuple[str, float]] = [
    ("xiaohan", 285.0),      # Minor Cold - ~Jan 6
    ("dahan", 300.0),        # Major Cold - ~Jan 20
    ("lichun", 315.0),       # Start of Spring - ~Feb 4
    ("yushui", 330.0),       # Rain Water - ~Feb 19
    ("jingzhe", 345.0),      # Awakening of Insects - ~Mar 6
    ("chunfen", 0.0),        # Spring Equinox - ~Mar 21
    ("qingming", 15.0),      # Clear and Bright - ~Apr 5
    ("guyu", 30.0),          # Grain Rain - ~Apr 20
    ("lixia", 45.0),         # Start of Summer - ~May 6
    ("xiaoman", 60.0),       # Grain Buds - ~May 21
    ("mangzhong", 75.0),     # Grain in Ear - ~Jun 6
    ("xiazhi", 90.0),        # Summer Solstice - ~Jun 21
    ("xiaoshu", 105.0),      # Minor Heat - ~Jul 7
    ("dashu", 120.0),        # Major Heat - ~Jul 23
    ("liqiu", 135.0),        # Start of Autumn - ~Aug 8
    ("chushu", 150.0),       # End of Heat - ~Aug 23
    ("bailu", 165.0),        # White Dew - ~Sep 8
    ("qiufen", 180.0),       # Autumn Equinox - ~Sep 23
    ("hanlu", 195.0),        # Cold Dew - ~Oct 8
    ("shuangjiang", 210.0),  # Frost's Descent - ~Oct 24
    ("lidong", 225.0),       # Start of Winter - ~Nov 8
    ("xiaoxue", 240.0),      # Minor Snow - ~Nov 22
    ("daxue", 255.0),        # Major Snow - ~Dec 7
    ("dongzhi", 270.0),      # Winter Solstice - ~Dec 22
]

# 8 Major Solar Terms (the seasonal markers)
CHINESE_MAJOR_TERMS: list[str] = [
    "lichun",    # Start of Spring - 315°
    "chunfen",   # Spring Equinox - 0°
    "lixia",     # Start of Summer - 45°
    "xiazhi",    # Summer Solstice - 90°
    "liqiu",     # Start of Autumn - 135°
    "qiufen",    # Autumn Equinox - 180°
    "lidong",    # Start of Winter - 225°
    "dongzhi",   # Winter Solstice - 270°
]

# All term names in order for iteration
CHINESE_TERM_NAMES: list[str] = [term[0] for term in CHINESE_SOLAR_TERMS]

# Map from term name to solar longitude
CHINESE_TERM_LONGITUDES: dict[str, float] = {
    term[0]: term[1] for term in CHINESE_SOLAR_TERMS
}


class ChineseSolarTermsEvents(TypedDict):
    """Type definition for Chinese Solar Terms events."""

    xiaohan: datetime
    dahan: datetime
    lichun: datetime
    yushui: datetime
    jingzhe: datetime
    chunfen: datetime
    qingming: datetime
    guyu: datetime
    lixia: datetime
    xiaoman: datetime
    mangzhong: datetime
    xiazhi: datetime
    xiaoshu: datetime
    dashu: datetime
    liqiu: datetime
    chushu: datetime
    bailu: datetime
    qiufen: datetime
    hanlu: datetime
    shuangjiang: datetime
    lidong: datetime
    xiaoxue: datetime
    daxue: datetime
    dongzhi: datetime


class ChineseSolarTermsData(TypedDict):
    """Type definition for Chinese Solar Terms calendar sensor data."""

    current_term: str
    term_age: int
    next_term_change: datetime
    next_term_event_type: str
    days_until_next_change: int
    events: dict[str, datetime]
    # Base data fields (shared with all calendar device types)
    solar_longitude: float
    daylight_trend: str
    next_trend_change: datetime
    days_until_trend_change: int
    next_trend_event_type: str


def get_chinese_solar_terms_events(year: int) -> dict[str, datetime]:
    """Get all Chinese Solar Terms events for a year.

    Args:
        year: The year to calculate events for.

    Returns:
        Dictionary containing all 24 solar terms with UTC datetimes.
    """
    events: dict[str, datetime] = {}

    for term_name, longitude in CHINESE_SOLAR_TERMS:
        events[term_name] = find_date_for_solar_longitude(longitude, year)

    return events


def get_chinese_major_terms_events(year: int) -> dict[str, datetime]:
    """Get the 8 major Chinese Solar Terms events for a year.

    Args:
        year: The year to calculate events for.

    Returns:
        Dictionary containing the 8 major solar terms with UTC datetimes.
    """
    events: dict[str, datetime] = {}

    for term_name in CHINESE_MAJOR_TERMS:
        longitude = CHINESE_TERM_LONGITUDES[term_name]
        events[term_name] = find_date_for_solar_longitude(longitude, year)

    return events


def calculate_chinese_solar_terms_data(
    hemisphere: str,
    scope: str,
    now: datetime,
) -> ChineseSolarTermsData:
    """Calculate data for Chinese Solar Terms calendar sensors.

    Args:
        hemisphere: Either 'northern' or 'southern' (for daylight trend).
        scope: Either 'all_24' for all terms or '8_major' for major terms only.
        now: Current datetime in UTC.

    Returns:
        Dictionary containing all calculated Chinese Solar Terms data.
    """
    year = now.year

    # Get term list based on scope
    if scope == "8_major":
        term_list = CHINESE_MAJOR_TERMS
        current_events = get_chinese_major_terms_events(year)
        next_events = get_chinese_major_terms_events(year + 1)
    else:
        term_list = CHINESE_TERM_NAMES
        current_events = get_chinese_solar_terms_events(year)
        next_events = get_chinese_solar_terms_events(year + 1)

    # Build sorted list of all events for the year and next
    all_events: list[tuple[str, datetime]] = []
    for term_name in term_list:
        all_events.append((term_name, current_events[term_name]))
        all_events.append((term_name, next_events[term_name]))

    # Sort by datetime
    all_events.sort(key=lambda x: x[1])

    # Find current term
    current_term = term_list[-1]  # Default to last term
    current_term_start = current_events[term_list[-1]]

    for i, (term_name, event_date) in enumerate(all_events):
        if event_date > now:
            # The previous event is the current term
            if i > 0:
                current_term = all_events[i - 1][0]
                current_term_start = all_events[i - 1][1]
            break
    else:  # pragma: no cover - next-year events always exist, so the loop always breaks
        # now is after all events
        current_term = all_events[-1][0]
        current_term_start = all_events[-1][1]

    # Calculate term age
    term_age = (now - current_term_start).days

    # Find next term change
    next_change = None
    next_event_type = term_list[0]

    for term_name, event_date in all_events:
        if event_date > now:
            next_change = event_date
            next_event_type = term_name
            break

    if next_change is None:  # pragma: no cover - unreachable, next-year events always exist
        # Should not happen, but fallback to next year's first term
        next_change = next_events[term_list[0]]
        next_event_type = term_list[0]

    days_until_next = (next_change - now).days

    # Build events dict with next occurrences (rolling)
    events_dict: dict[str, datetime] = {}
    for term_name in term_list:
        event_date = current_events[term_name]
        if event_date <= now:
            event_date = next_events[term_name]
        events_dict[term_name] = event_date

    # Base data (solar_longitude + daylight trend) is shared with all calendars
    base = calculate_base_data(hemisphere, now)

    return ChineseSolarTermsData(
        current_term=current_term,
        term_age=term_age,
        next_term_change=next_change,
        next_term_event_type=next_event_type,
        days_until_next_change=days_until_next,
        events=events_dict,
        **base,
    )
