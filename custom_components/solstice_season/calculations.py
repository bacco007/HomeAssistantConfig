"""Astronomical calculations for the Solstice Season integration.

This module contains all calculation logic for seasons, equinoxes,
solstices, and daylight trends. It is independent of Home Assistant
to allow for easier testing and maintenance.

Uses the ephem library for precise astronomical calculations.
"""

from datetime import date, datetime, timezone
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


class SeasonData(TypedDict):
    """Type definition for season calculation results."""

    current_season: str
    season_age: int
    spring_start: str
    summer_start: str
    autumn_start: str
    winter_start: str
    spring_equinox: datetime
    summer_solstice: datetime
    autumn_equinox: datetime
    winter_solstice: datetime
    days_until_spring: int
    days_until_summer: int
    days_until_autumn: int
    days_until_winter: int
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

    # Always get astronomical events (needed for daylight trend calculation)
    astronomical_events = get_astronomical_events(year)
    astronomical_events_next = get_astronomical_events(year + 1)

    # Get events based on calculation mode for season determination
    if mode == MODE_ASTRONOMICAL:
        previous_events = get_astronomical_events(year - 1)
        current_events = astronomical_events
        next_events = astronomical_events_next
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

    today = now.date()
    days_until_spring = calculate_days_until(spring_event.date(), today)
    days_until_summer = calculate_days_until(summer_event.date(), today)
    days_until_autumn = calculate_days_until(autumn_event.date(), today)
    days_until_winter = calculate_days_until(winter_event.date(), today)

    spring_start_event = current_events[mapping[SEASON_SPRING]]
    summer_start_event = current_events[mapping[SEASON_SUMMER]]
    autumn_start_event = current_events[mapping[SEASON_AUTUMN]]
    winter_start_event = current_events[mapping[SEASON_WINTER]]

    # Daylight trend is always based on astronomical solstices (physical reality)
    daylight_trend = calculate_daylight_trend(
        now,
        astronomical_events["june_solstice"],
        astronomical_events["december_solstice"],
    )

    next_trend_change, next_trend_event_type = get_next_solstice(
        hemisphere, now, astronomical_events, astronomical_events_next
    )
    days_until_trend_change = calculate_days_until(next_trend_change.date(), today)

    next_season_change, next_season_change_event_type = get_next_season_change(
        current_season, hemisphere, current_events, next_events, now
    )
    days_until_season_change = calculate_days_until(next_season_change.date(), today)

    current_season_start = get_current_season_start(
        current_season, hemisphere, current_events, previous_events, now
    )
    season_age = (today - current_season_start.date()).days

    return SeasonData(
        current_season=current_season,
        season_age=season_age,
        spring_start=spring_start_event.date().isoformat(),
        summer_start=summer_start_event.date().isoformat(),
        autumn_start=autumn_start_event.date().isoformat(),
        winter_start=winter_start_event.date().isoformat(),
        spring_equinox=spring_event,
        summer_solstice=summer_event,
        autumn_equinox=autumn_event,
        winter_solstice=winter_event,
        days_until_spring=days_until_spring,
        days_until_summer=days_until_summer,
        days_until_autumn=days_until_autumn,
        days_until_winter=days_until_winter,
        daylight_trend=daylight_trend,
        next_trend_change=next_trend_change,
        days_until_trend_change=days_until_trend_change,
        next_trend_event_type=next_trend_event_type,
        next_season_change=next_season_change,
        next_season_change_event_type=next_season_change_event_type,
        days_until_season_change=days_until_season_change,
    )
