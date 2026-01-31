"""Data coordinator for Moon Astro.

This module implements the data coordinator responsible for computing high-precision
Moon position and related ephemerides for Home Assistant.

The code is structured to:
- keep deterministic results and minute-level timestamp stability
- limit redundant heavy computations
- keep full numerical precision while reducing CPU spikes on low-power devices
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable, Iterable
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import logging
import math
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import numpy as np
from skyfield import almanac
from skyfield.api import Loader, wgs84
from skyfield.timelib import Time
from timezonefinder import TimezoneFinder

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    CACHE_DIR_NAME,
    CONF_ALT,
    CONF_HIGH_PRECISION,
    CONF_LAT,
    CONF_LON,
    CONF_USE_HA_TZ,
    DARK_MOON,
    DE440_FILE,
    DEFAULT_HIGH_PRECISION,
    DOMAIN,
    FIRST_QUARTER,
    FULL_MOON,
    FULL_MOON_STRICT_PCT,
    HIGH_PRECISION_BRACKET_EXPAND,
    HIGH_PRECISION_BRACKETS_TO_REFINE,
    HIGH_PRECISION_STEP_HOURS,
    KEY_ABOVE_HORIZON,
    KEY_AZIMUTH,
    KEY_DISTANCE,
    KEY_ECLIPTIC_LATITUDE_GEOCENTRIC,
    KEY_ECLIPTIC_LATITUDE_NEXT_FULL_MOON,
    KEY_ECLIPTIC_LATITUDE_NEXT_NEW_MOON,
    KEY_ECLIPTIC_LATITUDE_PREVIOUS_FULL_MOON,
    KEY_ECLIPTIC_LATITUDE_PREVIOUS_NEW_MOON,
    KEY_ECLIPTIC_LATITUDE_TOPOCENTRIC,
    KEY_ECLIPTIC_LONGITUDE_GEOCENTRIC,
    KEY_ECLIPTIC_LONGITUDE_NEXT_FULL_MOON,
    KEY_ECLIPTIC_LONGITUDE_NEXT_NEW_MOON,
    KEY_ECLIPTIC_LONGITUDE_PREVIOUS_FULL_MOON,
    KEY_ECLIPTIC_LONGITUDE_PREVIOUS_NEW_MOON,
    KEY_ECLIPTIC_LONGITUDE_TOPOCENTRIC,
    KEY_ELEVATION,
    KEY_ILLUMINATION,
    KEY_NEXT_APOGEE,
    KEY_NEXT_FIRST_QUARTER,
    KEY_NEXT_FULL_MOON,
    KEY_NEXT_FULL_MOON_ALT_NAMES,
    KEY_NEXT_FULL_MOON_NAME,
    KEY_NEXT_LAST_QUARTER,
    KEY_NEXT_NEW_MOON,
    KEY_NEXT_PERIGEE,
    KEY_NEXT_RISE,
    KEY_NEXT_SET,
    KEY_PARALLAX,
    KEY_PHASE,
    KEY_PREVIOUS_APOGEE,
    KEY_PREVIOUS_FIRST_QUARTER,
    KEY_PREVIOUS_FULL_MOON,
    KEY_PREVIOUS_FULL_MOON_ALT_NAMES,
    KEY_PREVIOUS_FULL_MOON_NAME,
    KEY_PREVIOUS_LAST_QUARTER,
    KEY_PREVIOUS_NEW_MOON,
    KEY_PREVIOUS_PERIGEE,
    KEY_PREVIOUS_RISE,
    KEY_PREVIOUS_SET,
    KEY_WAXING,
    KEY_ZODIAC_DEGREE_CURRENT_MOON,
    KEY_ZODIAC_DEGREE_NEXT_FULL_MOON,
    KEY_ZODIAC_DEGREE_NEXT_NEW_MOON,
    KEY_ZODIAC_DEGREE_PREVIOUS_FULL_MOON,
    KEY_ZODIAC_DEGREE_PREVIOUS_NEW_MOON,
    KEY_ZODIAC_ICON_CURRENT_MOON,
    KEY_ZODIAC_ICON_NEXT_FULL_MOON,
    KEY_ZODIAC_ICON_NEXT_NEW_MOON,
    KEY_ZODIAC_ICON_PREVIOUS_FULL_MOON,
    KEY_ZODIAC_ICON_PREVIOUS_NEW_MOON,
    KEY_ZODIAC_SIGN_CURRENT_MOON,
    KEY_ZODIAC_SIGN_NEXT_FULL_MOON,
    KEY_ZODIAC_SIGN_NEXT_NEW_MOON,
    KEY_ZODIAC_SIGN_PREVIOUS_FULL_MOON,
    KEY_ZODIAC_SIGN_PREVIOUS_NEW_MOON,
    LAST_QUARTER,
    NEW_MOON_STRICT_PCT,
    QUARTER_TOL_PCT,
    STANDARD_PRECISION_BRACKET_EXPAND,
    STANDARD_PRECISION_STEP_HOURS,
)

# Type aliases to improve readability where the 3rd-party library does not expose stable typing.
type Ephemeris = Any
type Timescale = Any
type Apparent = Any

# Centralize recoverable exception sets to avoid broad-except patterns.
_RECOVERABLE_TZ_ERRORS: tuple[type[Exception], ...] = (ZoneInfoNotFoundError,)
_RECOVERABLE_SKYFIELD_ERRORS: tuple[type[Exception], ...] = (
    ValueError,
    RuntimeError,
)
_RECOVERABLE_NUMERIC_ERRORS: tuple[type[Exception], ...] = (
    ArithmeticError,
    FloatingPointError,
    OverflowError,
    ZeroDivisionError,
    ValueError,
    RuntimeError,
)
# Top-level recoverable errors when wrapping update computations into UpdateFailed
_RECOVERABLE_UPDATE_ERRORS: tuple[type[Exception], ...] = (
    OSError,
    ValueError,
    ArithmeticError,
    RuntimeError,
    KeyError,
    TypeError,
)

_LOGGER = logging.getLogger(__name__)

# Phase values used by Skyfield almanac.moon_phases
_PHASE_VALUES: tuple[int, int, int, int] = (
    DARK_MOON,
    FIRST_QUARTER,
    FULL_MOON,
    LAST_QUARTER,
)

_SHARED_EPHEMERIS_STORE_KEY = "shared_ephemeris_store"
_SHARED_EPHEMERIS_ITEM_KEY = "eph_ts"

# -----------------------------------------------------------------------------
# Timezone and datetime formatting helpers
# -----------------------------------------------------------------------------


def _detect_timezone(lat: float, lon: float) -> ZoneInfo:
    """Return a best-effort ZoneInfo for given coordinates.

    Args:
        lat: Latitude in decimal degrees.
        lon: Longitude in decimal degrees.

    Returns:
        A ZoneInfo instance representing the local timezone or UTC as fallback.
    """
    tzname: str | None = TimezoneFinder().timezone_at(lat=lat, lng=lon)
    try:
        return ZoneInfo(tzname) if tzname else ZoneInfo("UTC")
    except ZoneInfoNotFoundError:
        return ZoneInfo("UTC")


def _tz_for_hass(hass: HomeAssistant) -> ZoneInfo:
    """Return ZoneInfo from Home Assistant configuration with UTC fallback.

    Args:
        hass: Home Assistant instance.

    Returns:
        The configured ZoneInfo or UTC if missing/invalid.
    """
    tzname = hass.config.time_zone
    try:
        return ZoneInfo(tzname) if tzname else ZoneInfo("UTC")
    except _RECOVERABLE_TZ_ERRORS:
        return ZoneInfo("UTC")


def _round_datetime_to_nearest_minute(dt: datetime) -> datetime:
    """Round a timezone-aware datetime to the nearest minute.

    Args:
        dt: Timezone-aware datetime.

    Returns:
        Rounded timezone-aware datetime.
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)

    seconds_in_minute = dt.second + (dt.microsecond / 1_000_000.0)
    base = dt.replace(second=0, microsecond=0)
    return base + timedelta(minutes=1) if seconds_in_minute >= 30.0 else base


def _round_utc_datetime_to_nearest_minute(dt_utc: datetime) -> datetime:
    """Round a datetime (assumed UTC) to the nearest minute.

    Args:
        dt_utc: Datetime expected to represent a UTC instant.

    Returns:
        A timezone-aware UTC datetime rounded to the nearest minute.
    """
    if dt_utc.tzinfo is None:
        dt_utc = dt_utc.replace(tzinfo=UTC)
    dt_utc = dt_utc.astimezone(UTC)
    return _round_datetime_to_nearest_minute(dt_utc).astimezone(UTC)


def _to_local_iso(dt_utc: datetime | None, tz: ZoneInfo | None) -> str | None:
    """Convert a UTC datetime to an ISO 8601 string in the provided timezone.

    This conversion rounds the instant to the nearest minute to maximize stability
    of timestamp sensors without relying on any cache mechanism.

    Args:
        dt_utc: Input datetime expected to be UTC or naive (assumed UTC).
        tz: Target timezone; UTC is used if None.

    Returns:
        The ISO 8601 formatted string rounded to the nearest minute, or None when
        input is None.
    """
    if dt_utc is None:
        return None

    tz = tz or ZoneInfo("UTC")

    if dt_utc.tzinfo is None:
        dt_utc = dt_utc.replace(tzinfo=UTC)

    # Round in UTC to keep behavior deterministic, then convert to target timezone.
    dt_utc_rounded = _round_utc_datetime_to_nearest_minute(dt_utc)
    return dt_utc_rounded.astimezone(tz).isoformat()


def _safe_time_iso(t_obj: Time | None, tz: ZoneInfo | None) -> str | None:
    """Convert a Skyfield Time to a localized ISO 8601 string safely.

    The conversion rounds the resulting datetime to the nearest minute through
    the shared datetime formatting helper.

    Args:
        t_obj: Skyfield Time or None.
        tz: Target timezone; UTC is used if None.

    Returns:
        Localized ISO 8601 string rounded to the nearest minute, or None.
    """
    if t_obj is None:
        return None

    dt_utc_raw = t_obj.utc_datetime()

    if isinstance(dt_utc_raw, datetime):
        dt_utc = dt_utc_raw
    else:
        try:
            dt_utc = dt_utc_raw.item() if hasattr(dt_utc_raw, "item") else dt_utc_raw[0]
        except (IndexError, TypeError, AttributeError):
            dt_utc = datetime.fromisoformat(str(dt_utc_raw))

    if dt_utc.tzinfo is None:
        dt_utc = dt_utc.replace(tzinfo=UTC)

    return _to_local_iso(dt_utc.astimezone(UTC), tz)


def _parse_iso_to_utc(value: Any) -> datetime | None:
    """Parse an ISO 8601 timestamp into a timezone-aware UTC datetime.

    Args:
        value: ISO string or datetime-like value.

    Returns:
        A timezone-aware UTC datetime, or None when parsing fails.
    """
    if value is None:
        return None

    if isinstance(value, datetime):
        dt = value
    else:
        try:
            dt = datetime.fromisoformat(str(value))
        except (ValueError, TypeError):
            return None

    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)

    return dt.astimezone(UTC)


# -----------------------------------------------------------------------------
# Core astronomical helpers
# -----------------------------------------------------------------------------


def _moon_illumination_percentage(eph: Ephemeris, t: Time) -> float:
    """Compute Moon illumination in percent at given time.

    This uses the apparent Moon from Earth's geocenter and the ICRF position
    method. The Sun must be provided as a vector function (e.g., eph["sun"]),
    not as an Apparent/Astrometric, so the method can evaluate it at the same
    instant as the Moon position.

    Args:
        eph: Loaded ephemeris.
        t: Skyfield Time.

    Returns:
        Moon illuminated fraction in percent (0..100).
    """
    earth = eph["earth"]
    moon_app = earth.at(t).observe(eph["moon"]).apparent()
    frac = moon_app.fraction_illuminated(eph["sun"])
    return float(frac * 100.0)


def _topocentric_vectors(
    eph: Ephemeris, t: Time, lat: float, lon: float, alt_m: float
) -> tuple[Apparent, float, float, float]:
    """Compute topocentric apparent vector and basic quantities.

    Args:
        eph: Loaded ephemeris.
        t: Skyfield Time.
        lat: Latitude in degrees.
        lon: Longitude in degrees.
        alt_m: Elevation in meters.

    Returns:
        A tuple of (apparent vector, azimuth in degrees, elevation in degrees, distance in km).
    """
    earth = eph["earth"]
    observer = wgs84.latlon(
        latitude_degrees=lat, longitude_degrees=lon, elevation_m=alt_m
    )
    ap = earth + observer
    apparent = ap.at(t).observe(eph["moon"]).apparent()
    alt, az, distance = apparent.altaz()
    return apparent, float(az.degrees), float(alt.degrees), float(distance.km)


def _geocentric_vector(eph: Ephemeris, t: Time) -> Apparent:
    """Return geocentric apparent vector of the Moon at time t.

    Args:
        eph: Loaded ephemeris.
        t: Skyfield Time.

    Returns:
        Apparent vector seen from geocenter.
    """
    earth = eph["earth"]
    return earth.at(t).observe(eph["moon"]).apparent()


# ---------- High-accuracy nutation (IAU 1980: full 106-term) and ecliptic-of-date ----------


def _julian_centuries_TT_from_tt(tt: float) -> float:
    """Convert TT Julian Date to Julian centuries since J2000.0.

    Args:
        tt: Julian Date (Terrestrial Time).

    Returns:
        Julian centuries from J2000.0.
    """
    return (tt - 2451545.0) / 36525.0


def _deg_to_rad(x: float) -> float:
    """Convert degrees to radians.

    Args:
        x: Angle in degrees.

    Returns:
        Angle in radians.
    """
    return x * math.pi / 180.0


def _arcsec_to_rad(x: float) -> float:
    """Convert arcseconds to radians.

    Args:
        x: Angle in arcseconds.

    Returns:
        Angle in radians.
    """
    return _deg_to_rad(x / 3600.0)


def _mean_obliquity_arcsec(T: float) -> float:
    """Compute mean obliquity (IAU 2006) in arcseconds.

    IAU 2006 polynomial for mean obliquity; accurate for centuries near J2000

    Args:
        T: Julian centuries since J2000.0.

    Returns:
        Mean obliquity in arcseconds.
    """
    U = T / 100.0
    return (
        84381.406
        - 4680.93 * U
        - 1.55 * U**2
        + 1999.25 * U**3
        - 51.38 * U**4
        - 249.67 * U**5
        - 39.05 * U**6
        + 7.12 * U**7
        + 27.87 * U**8
        + 5.79 * U**9
        + 2.45 * U**10
    )


def _fundamental_arguments_deg(T: float) -> tuple[float, float, float, float, float]:
    """Return fundamental Delaunay arguments (degrees) for IAU 1980 nutation.

    Args:
        T: Julian centuries since J2000.0.

    Returns:
        Tuple of (M' lunar anomaly, M solar anomaly, F, D, Ω) in degrees.
    """
    # Mean anomaly of the Moon (M'), of the Sun (M), Moon's argument of latitude (F),
    # Moon's elongation from the Sun (D), and longitude of the ascending node (Ω).
    Lm = (
        134.96298139
        + (1325.0 * 360.0 + 198.8673981) * T
        + 0.0086972 * T**2
        + T**3 / 56250.0
    )
    Ls = (
        357.52772333
        + (99.0 * 360.0 + 359.0503400) * T
        - 0.0001603 * T**2
        - T**3 / 300000.0
    )
    F = (
        93.27191028
        + (1342.0 * 360.0 + 82.0175381) * T
        - 0.0036825 * T**2
        + T**3 / 327270.0
    )
    D = (
        297.85036306
        + (1236.0 * 360.0 + 307.1114800) * T
        - 0.0019142 * T**2
        + T**3 / 189474.0
    )
    Om = (
        125.04452222
        - (5.0 * 360.0 + 134.1362608) * T
        + 0.0020708 * T**2
        + T**3 / 450000.0
    )

    def norm(x: float) -> float:
        """Normalize an angle to [0, 360)."""
        return (x % 360.0 + 360.0) % 360.0

    return norm(Lm), norm(Ls), norm(F), norm(D), norm(Om)


# Full IAU 1980 106-term nutation series
# Format: (D, M, M', F, Ω, Δψ_arcsec, Δψ_t_arcsec_per_century, Δε_arcsec, Δε_t_arcsec_per_century)
_IAU1980_TERMS: list[tuple[int, int, int, int, int, float, float, float, float]] = [
    (0, 0, 0, 0, 1, -171996.0, -174.2, 92025.0, 8.9),
    (0, 0, 2, -2, 2, -13187.0, -1.6, 5736.0, -3.1),
    (0, 0, 2, 0, 2, -2274.0, -0.2, 977.0, -0.5),
    (0, 0, 0, 0, 2, 2062.0, 0.2, -895.0, 0.5),
    (0, 1, 0, 0, 0, 1426.0, -3.4, 54.0, -0.1),
    (1, 0, 0, 0, 0, 712.0, 0.1, -7.0, 0.0),
    (0, 1, 2, -2, 2, -517.0, 1.2, 224.0, -0.6),
    (0, 0, 2, 0, 1, -386.0, -0.4, 200.0, 0.0),
    (1, 0, 2, 0, 2, -301.0, 0.0, 129.0, -0.1),
    (0, -1, 2, -2, 2, 217.0, -0.5, -95.0, 0.3),
    (1, 0, 0, -2, 0, -158.0, 0.0, 0.0, 0.0),
    (0, 0, 2, -2, 1, 129.0, 0.1, -70.0, 0.0),
    (-1, 0, 2, 0, 2, 123.0, 0.0, -53.0, 0.0),
    (0, 0, 0, 2, 0, 63.0, 0.0, 0.0, 0.0),
    (1, 0, 2, -2, 2, 63.0, 0.1, -33.0, 0.0),
    (-1, 0, 0, 2, 0, -58.0, -0.1, 0.0, 0.0),
    (-1, 0, 2, 2, 2, -51.0, 0.0, 27.0, 0.0),
    (1, 0, 2, 0, 1, 48.0, 0.0, -24.0, 0.0),
    (0, 0, 2, 2, 2, -38.0, 0.0, 16.0, 0.0),
    (2, 0, 2, 0, 2, -31.0, 0.0, 13.0, 0.0),
    (2, 0, 0, 0, 0, 29.0, 0.0, 0.0, 0.0),
    (0, 0, 2, 0, 0, 29.0, 0.0, 0.0, 0.0),
    (0, 0, 2, -2, 0, 26.0, 0.0, 0.0, 0.0),
    (-1, 0, 2, 0, 1, 21.0, 0.0, -10.0, 0.0),
    (0, 2, 0, 0, 0, -16.0, 0.0, 0.0, 0.0),
    (1, 0, 0, 0, 1, 16.0, 0.0, -8.0, 0.0),
    (0, 0, 0, 0, 3, -15.0, 0.0, 9.0, 0.0),
    (1, 0, 2, -2, 1, -13.0, 0.0, 7.0, 0.0),
    (0, 1, 0, 0, 1, -12.0, 0.0, 6.0, 0.0),
    (-1, 0, 0, 0, 1, 11.0, 0.0, -5.0, 0.0),
    (0, 1, 2, 0, 2, -10.0, 0.0, 5.0, 0.0),
    (0, -1, 2, 0, 2, -8.0, 0.0, 3.0, 0.0),
    (2, 0, 2, -2, 2, -7.0, 0.0, 3.0, 0.0),
    (1, 1, 0, 0, 0, -7.0, 0.0, 0.0, 0.0),
    (-1, 1, 0, 0, 0, -7.0, 0.0, 0.0, 0.0),
    (0, 1, 2, -2, 2, -7.0, 0.0, 3.0, 0.0),
    (0, 0, 0, 2, 1, 6.0, 0.0, -3.0, 0.0),
    (1, 0, 2, 2, 2, -6.0, 0.0, 3.0, 0.0),
    (1, 0, 0, 2, 0, 6.0, 0.0, 0.0, 0.0),
    (2, 0, 2, 0, 1, -6.0, 0.0, 3.0, 0.0),
    (0, 0, 0, 2, 0, -5.0, 0.0, 0.0, 0.0),
    (0, -1, 2, -2, 2, 5.0, 0.0, -3.0, 0.0),
    (2, 0, 2, -2, 1, 5.0, 0.0, -3.0, 0.0),
    (0, 1, 0, 0, 2, -5.0, 0.0, 3.0, 0.0),
    (1, 0, 2, -2, 0, -4.0, 0.0, 0.0, 0.0),
    (0, 0, 0, 1, 0, -4.0, 0.0, 0.0, 0.0),
    (1, 1, 0, 0, 1, -4.0, 0.0, 2.0, 0.0),
    (1, -1, 0, 0, 1, -4.0, 0.0, 2.0, 0.0),
    (1, 0, 0, -1, 0, -4.0, 0.0, 0.0, 0.0),
    (0, 0, 2, 1, 2, -4.0, 0.0, 2.0, 0.0),
    (1, 0, 0, 1, 0, 3.0, 0.0, 0.0, 0.0),
    (1, -1, 2, 0, 2, -3.0, 0.0, 1.0, 0.0),
    (0, -1, 2, 0, 1, -3.0, 0.0, 1.0, 0.0),
    (1, 1, 2, 0, 2, -3.0, 0.0, 1.0, 0.0),
    (-1, 1, 2, 0, 2, -3.0, 0.0, 1.0, 0.0),
    (3, 0, 2, 0, 2, -3.0, 0.0, 1.0, 0.0),
    (0, 0, 0, 0, 1, 3.0, 0.0, -1.0, 0.0),
    (-1, 0, 2, 2, 1, -3.0, 0.0, 1.0, 0.0),
    (0, 0, 2, 2, 1, -3.0, 0.0, 1.0, 0.0),
    (1, 0, 2, 2, 1, -3.0, 0.0, 1.0, 0.0),
    (-1, 0, 2, -2, 1, -2.0, 0.0, 1.0, 0.0),
    (2, 0, 0, 0, 1, 2.0, 0.0, -1.0, 0.0),
    (1, 0, 0, 0, 2, -2.0, 0.0, 1.0, 0.0),
    (2, 0, 2, -2, 2, -2.0, 0.0, 1.0, 0.0),
    (0, -1, 2, -2, 1, -2.0, 0.0, 1.0, 0.0),
    (0, 1, 2, -2, 1, -2.0, 0.0, 1.0, 0.0),
    (0, -2, 0, 2, 0, -2.0, 0.0, 0.0, 0.0),
    (2, 0, 0, -2, 1, 2.0, 0.0, -1.0, 0.0),
    (-2, 0, 2, 0, 1, 2.0, 0.0, -1.0, 0.0),
    (0, 0, 2, 0, 1, 2.0, 0.0, -1.0, 0.0),
    (2, 0, 2, 0, 1, 2.0, 0.0, -1.0, 0.0),
    (0, 0, 0, 2, 1, 2.0, 0.0, -1.0, 0.0),
    (1, 0, 2, -2, 2, -1.0, 0.0, 0.0, 0.0),
    (1, 0, 0, 0, 0, -1.0, 0.0, 0.0, 0.0),
    (-1, 0, 0, 0, 2, 1.0, 0.0, 0.0, 0.0),
    (1, 0, 0, -2, 1, 1.0, 0.0, 0.0, 0.0),
    (0, 0, 0, 2, 2, -1.0, 0.0, 0.0, 0.0),
    (0, 0, 2, 2, 2, -1.0, 0.0, 0.0, 0.0),
    (1, 0, 2, 0, 2, -1.0, 0.0, 0.0, 0.0),
    (0, 0, 2, 0, 2, -1.0, 0.0, 0.0, 0.0),
    (1, 0, 0, 2, 0, 1.0, 0.0, 0.0, 0.0),
    (0, 0, 0, 2, 1, -1.0, 0.0, 0.0, 0.0),
    (1, 0, 2, -2, 1, -1.0, 0.0, 0.0, 0.0),
    (1, 1, 0, -2, 0, -1.0, 0.0, 0.0, 0.0),
    (1, -1, 0, -2, 0, -1.0, 0.0, 0.0, 0.0),
    (2, 0, 0, 0, 0, -1.0, 0.0, 0.0, 0.0),
    (0, 1, 2, 0, 1, -1.0, 0.0, 0.0, 0.0),
    (-1, 0, 2, 2, 2, -1.0, 0.0, 0.0, 0.0),
    (0, -1, 2, 2, 2, -1.0, 0.0, 0.0, 0.0),
    (1, -1, 2, 0, 1, -1.0, 0.0, 0.0, 0.0),
    (0, 0, 2, -1, 2, -1.0, 0.0, 0.0, 0.0),
    (1, 0, 0, 0, 1, -1.0, 0.0, 0.0, 0.0),
    (1, 0, 0, -1, 1, -1.0, 0.0, 0.0, 0.0),
    (0, 1, 0, 1, 0, -1.0, 0.0, 0.0, 0.0),
    (0, -1, 0, 1, 0, -1.0, 0.0, 0.0, 0.0),
    # Additional very small terms with time rates (kept for canonical completeness)
    (0, 0, 1, 0, 1, 0.0, 0.1, 0.0, 0.0),
    (0, 0, 1, 0, 1, 0.0, -0.1, 0.0, 0.0),
    (0, 2, 2, -2, 2, 0.0, 0.1, 0.0, 0.0),
    (0, -2, 2, -2, 2, 0.0, 0.1, 0.0, 0.0),
    (2, 0, 0, -2, 0, 0.0, 0.1, 0.0, 0.0),
    (2, 0, 2, -2, 1, 0.0, 0.1, 0.0, 0.0),
    (2, 0, 2, -2, 1, 0.0, -0.1, 0.0, 0.0),
]


def _nutation_iau1980(
    T: float, Lm_deg: float, Ls_deg: float, F_deg: float, D_deg: float, Om_deg: float
) -> tuple[float, float]:
    """Compute nutation in longitude and obliquity using the IAU 1980 106-term series.

    Args:
        T: Julian centuries since J2000.0.
        Lm_deg: Mean anomaly of the Moon (degrees).
        Ls_deg: Mean anomaly of the Sun (degrees).
        F_deg: Moon's argument of latitude (degrees).
        D_deg: Moon's elongation from the Sun (degrees).
        Om_deg: Longitude of the ascending node (degrees).

    Returns:
        Tuple (Δψ, Δε) in arcseconds.
    """
    # Convert arguments to radians
    Lm = _deg_to_rad(Lm_deg)
    Ls = _deg_to_rad(Ls_deg)
    F = _deg_to_rad(F_deg)
    D = _deg_to_rad(D_deg)
    Om = _deg_to_rad(Om_deg)

    dpsi_as = 0.0
    deps_as = 0.0
    for cD, cM, cMp, cF, cOm, ps, ps_t, pe, pe_t in _IAU1980_TERMS:
        arg = cD * D + cM * Ls + cMp * Lm + cF * F + cOm * Om
        s = math.sin(arg)
        c = math.cos(arg)
        # Linear time dependence per century (IAU 1980 convention)
        dpsi_as += ps * s + ps_t * s * T
        deps_as += pe * c + pe_t * c * T
    return dpsi_as, deps_as  # arcseconds


def _true_obliquity_rad(tt: float) -> float:
    """Return true obliquity of the ecliptic at given TT in radians.

    Args:
        tt: Julian Date (TT).

    Returns:
        True obliquity in radians (mean + nutation in obliquity).
    """
    T = _julian_centuries_TT_from_tt(tt)
    Lm, Ls, F, D, Om = _fundamental_arguments_deg(T)
    _dpsi_as, deps_as = _nutation_iau1980(T, Lm, Ls, F, D, Om)
    eps0_as = _mean_obliquity_arcsec(T)
    return _arcsec_to_rad(eps0_as + deps_as)


def _ecliptic_lon_lat_deg_of_date(apparent_vector: Apparent) -> tuple[float, float]:
    """Compute apparent ecliptic-of-date longitude and latitude in degrees.

    Args:
        apparent_vector: Apparent equatorial position of the Moon.

    Returns:
        Tuple of (longitude_deg, latitude_deg) in the true ecliptic of date.
    """
    eps = _true_obliquity_rad(apparent_vector.t.tt)

    # Apparent equatorial Cartesian (km)
    x, y, z = apparent_vector.position.km

    # Rotate around X by +eps (equatorial -> ecliptic of date)
    cos_e = math.cos(eps)
    sin_e = math.sin(eps)

    x_ecl = x
    y_ecl = y * cos_e + z * sin_e
    z_ecl = -y * sin_e + z * cos_e

    r_xy = math.hypot(x_ecl, y_ecl)
    lon = math.degrees(math.atan2(y_ecl, x_ecl))
    lat = math.degrees(math.atan2(z_ecl, r_xy))
    lon = (lon % 360.0 + 360.0) % 360.0
    return float(lon), float(lat)


def _moon_parallax_angle_deg(distance_km: float) -> float:
    """Approximate equatorial horizontal parallax (degrees) from distance.

    Args:
        distance_km: Topocentric distance to the Moon in kilometers.

    Returns:
        Horizontal parallax angle in degrees.
    """
    Re_km = 6378.137
    x = Re_km / max(distance_km, 1e-6)
    x = min(1.0, max(0.0, x))
    return math.degrees(math.asin(x))


# -----------------------------------------------------------------------------
# Phase naming helper
# -----------------------------------------------------------------------------


def _moon_phase_name(eph: Ephemeris, t: Time, ts: Timescale | None = None) -> str:
    """Return a readable moon phase name using events proximity and illumination.

    Args:
        eph: Loaded ephemeris.
        t: Skyfield Time.
        ts: Skyfield Timescale.

    Returns:
        Phase code string.
    """
    illum_now = _moon_illumination_percentage(eph, t)

    if ts is not None:
        t_future = ts.tt_jd(t.tt + 6.0 / 24.0)
        illum_future = _moon_illumination_percentage(eph, t_future)
        waxing = illum_future > illum_now + 1e-6
    else:
        waxing = True

    f = almanac.moon_phases(eph)
    t0 = t - 30.0
    t1 = t + 30.0
    times, phases = almanac.find_discrete(t0, t1, f)

    last_ev: tuple[Time, int] | None = None
    next_ev: tuple[Time, int] | None = None
    for ti, pv in zip(times, phases, strict=False):
        if ti.tt <= t.tt:
            last_ev = (ti, int(pv))
        elif next_ev is None and ti.tt > t.tt:
            next_ev = (ti, int(pv))

    def close_to(pct: float, target: float, tol: float = QUARTER_TOL_PCT) -> bool:
        """Return True when pct is within tolerance of target."""
        return abs(pct - target) <= tol

    WIN_FULL_H = 6.0
    WIN_QUARTER_H = 6.0
    WIN_NEW_H = 6.0

    def _within_hours(t_event: Time | None, hours_window: float) -> bool:
        """Return True if t_event is within hours_window of t."""
        if t_event is None:
            return False
        return abs((t_event.tt - t.tt) * 24.0) <= hours_window

    last_time = last_ev[0] if last_ev else None
    next_time = next_ev[0] if next_ev else None
    last_type = last_ev[1] if last_ev else None
    next_type = next_ev[1] if next_ev else None

    if (last_type == DARK_MOON and _within_hours(last_time, WIN_NEW_H)) or (
        next_type == DARK_MOON and _within_hours(next_time, WIN_NEW_H)
    ):
        return "new_moon"
    if (last_type == FIRST_QUARTER and _within_hours(last_time, WIN_QUARTER_H)) or (
        next_type == FIRST_QUARTER and _within_hours(next_time, WIN_QUARTER_H)
    ):
        return "first_quarter" if waxing else "last_quarter"
    if (last_type == FULL_MOON and _within_hours(last_time, WIN_FULL_H)) or (
        next_type == FULL_MOON and _within_hours(next_time, WIN_FULL_H)
    ):
        return "full_moon"
    if (last_type == LAST_QUARTER and _within_hours(last_time, WIN_QUARTER_H)) or (
        next_type == LAST_QUARTER and _within_hours(next_time, WIN_QUARTER_H)
    ):
        return "last_quarter" if not waxing else "first_quarter"

    if last_ev is not None:
        _, phase_value = last_ev
        if phase_value == DARK_MOON:
            if waxing and illum_now <= NEW_MOON_STRICT_PCT:
                return "new_moon"
        elif phase_value == FIRST_QUARTER:
            if close_to(illum_now, 50.0) and waxing:
                return "first_quarter"
        elif phase_value == LAST_QUARTER:
            if close_to(illum_now, 50.0) and (not waxing):
                return "last_quarter"

    if illum_now <= NEW_MOON_STRICT_PCT:
        return "new_moon" if waxing else "waning_crescent"
    if illum_now <= 45.0:
        return "waxing_crescent" if waxing else "waning_crescent"
    if 45.0 < illum_now < 55.0:
        return "first_quarter" if waxing else "last_quarter"
    if illum_now < FULL_MOON_STRICT_PCT:
        return "waxing_gibbous" if waxing else "waning_gibbous"
    return "waxing_gibbous" if waxing else "waning_gibbous"


# -----------------------------------------------------------------------------
# Rise/Set helpers
# -----------------------------------------------------------------------------


def _next_rise_set(
    eph: Ephemeris, lat: float, lon: float, alt_m: float, t_start: Time
) -> tuple[Time | None, Time | None]:
    """Compute next rise and set times for the Moon at observer location.

    Args:
        eph: Loaded ephemeris.
        lat: Latitude in degrees.
        lon: Longitude in degrees.
        alt_m: Elevation in meters.
        t_start: Start time for the search.

    Returns:
        A tuple (next_rise, next_set) as Skyfield Times or None if not found.
    """
    observer = wgs84.latlon(
        latitude_degrees=lat, longitude_degrees=lon, elevation_m=alt_m
    )
    f = almanac.risings_and_settings(eph, eph["moon"], observer)
    t0 = t_start
    t1 = t_start + 7.0
    times, events = almanac.find_discrete(t0, t1, f)

    next_rise: Time | None = None
    next_set: Time | None = None
    for ti, ei in zip(times, events, strict=False):
        if ei and next_rise is None and ti.tt > t_start.tt:
            next_rise = ti
        if (not ei) and next_set is None and ti.tt > t_start.tt:
            next_set = ti
        if next_rise is not None and next_set is not None:
            break
    return next_rise, next_set


def _previous_rise_set(
    eph: Ephemeris, lat: float, lon: float, alt_m: float, t_start: Time
) -> tuple[Time | None, Time | None]:
    """Compute previous rise and set times for the Moon at observer location.

    Args:
        eph: Loaded ephemeris.
        lat: Latitude in degrees.
        lon: Longitude in degrees.
        alt_m: Elevation in meters.
        t_start: Reference time.

    Returns:
        (previous_rise, previous_set)
    """
    observer = wgs84.latlon(
        latitude_degrees=lat, longitude_degrees=lon, elevation_m=alt_m
    )
    f = almanac.risings_and_settings(eph, eph["moon"], observer)
    t0 = t_start - 7.0
    t1 = t_start
    times, events = almanac.find_discrete(t0, t1, f)

    prev_rise: Time | None = None
    prev_set: Time | None = None
    for ti, ei in zip(times, events, strict=False):
        if ti.tt >= t_start.tt:
            continue
        if ei:
            prev_rise = ti
        else:
            prev_set = ti
    return prev_rise, prev_set


# -----------------------------------------------------------------------------
# Numeric root/extremum helpers
# -----------------------------------------------------------------------------


@dataclass
class _BrentResult:
    """Container for Brent extremum search results."""

    tt: float
    fval: float
    iterations: int


def _brent_extremum(
    f: Callable[[float], float],
    a: float,
    b: float,
    is_min: bool = True,
    tol: float = 1e-6,
    max_iter: int = 100,
) -> _BrentResult:
    """Generic Brent method to find an extremum of a univariate function.

    Args:
        f: Function mapping a scalar to a scalar.
        a: Left bound in the independent variable.
        b: Right bound in the independent variable.
        is_min: If True, search for minimum; otherwise maximum.
        tol: Absolute tolerance on the abscissa.
        max_iter: Maximum number of iterations.

    Returns:
        A _BrentResult containing location (tt), function value and iteration count.
    """
    g: Callable[[float], float] = (lambda x: -f(x)) if not is_min else f

    invphi = (math.sqrt(5) - 1) / 2
    invphi2 = (3 - math.sqrt(5)) / 2

    x = w = v = a + invphi2 * (b - a)
    fx = fw = fv = g(x)
    d = e = 0.0

    for it in range(max_iter):
        m = 0.5 * (a + b)
        tol1 = tol * abs(x) + 1e-12
        tol2 = 2.0 * tol1

        if abs(x - m) <= tol2 - 0.5 * (b - a):
            return _BrentResult(tt=x, fval=(fx if is_min else -fx), iterations=it)

        p = q = r = 0.0
        if abs(e) > tol1:
            r = (x - w) * (fx - fv)
            q = (x - v) * (fx - fw)
            p = (x - v) * q - (x - w) * r
            q = 2.0 * (q - r)
            if q > 0:
                p = -p
            q = abs(q)
            parabolic_ok = (
                (abs(p) < abs(0.5 * q * e)) and (p > q * (a - x)) and (p < q * (b - x))
            )
            if parabolic_ok:
                d = p / q
                u = x + d
                if (u - a) < tol2 or (b - u) < tol2:
                    d = tol1 if (x < m) else -tol1
            else:
                e = (b - a) if (x < m) else (a - b)
                d = invphi * e
        else:
            e = (b - a) if (x < m) else (a - b)
            d = invphi * e

        u = x + (d if abs(d) >= tol1 else (tol1 if d > 0 else -tol1))
        fu = g(u)

        if fu <= fx:
            if u < x:
                b = x
            else:
                a = x
            v, fv = w, fw
            w, fw = x, fx
            x, fx = u, fu
        else:
            if u < x:
                a = u
            else:
                b = u
            if fu <= fw or w == x:
                v, fv = w, fw
                w, fw = u, fu
            elif fu <= fv or v in (x, w):
                v, fv = u, fu

    return _BrentResult(tt=x, fval=(fx if is_min else -fx), iterations=max_iter)


def _brent_root(
    f: Callable[[float], float],
    a: float,
    b: float,
    *,
    tol: float = 1e-10,
    max_iter: int = 200,
) -> float | None:
    """Find a root of f(x)=0 on [a,b] using a Brent-style bracketing method.

    The function requires a sign change over the bracket. The implementation is
    designed to be deterministic and robust for numerical derivatives.

    Args:
        f: Scalar function.
        a: Left bracket bound.
        b: Right bracket bound.
        tol: Absolute tolerance on the abscissa.
        max_iter: Maximum iterations.

    Returns:
        The root location in the independent variable, or None if no sign change.
    """
    fa = float(f(a))
    fb = float(f(b))

    if math.isnan(fa) or math.isnan(fb):
        return None
    if fa == 0.0:
        return a
    if fb == 0.0:
        return b
    if fa * fb > 0.0:
        return None

    c = a
    fc = fa
    d = e = b - a

    for _ in range(max_iter):
        if fb == 0.0:
            return b

        # Ensure |fb| <= |fc|
        if abs(fc) < abs(fb):
            a, b, c = b, c, b
            fa, fb, fc = fb, fc, fb

        tol1 = 2.0 * 1e-12 + 0.5 * tol
        m = 0.5 * (c - b)

        if abs(m) <= tol1:
            return b

        if abs(e) >= tol1 and abs(fa) > abs(fb):
            s = fb / fa
            if a == c:
                # Secant
                p = 2.0 * m * s
                q = 1.0 - s
            else:
                # Inverse quadratic interpolation
                q = fa / fc
                r = fb / fc
                p = s * (2.0 * m * q * (q - r) - (b - a) * (r - 1.0))
                q = (q - 1.0) * (r - 1.0) * (s - 1.0)

            if p > 0.0:
                q = -q
            p = abs(p)

            cond1 = 2.0 * p >= 3.0 * m * q - abs(tol1 * q)
            cond2 = p >= abs(0.5 * e * q)

            if cond1 or cond2 or q == 0.0:
                e = d
                d = m
            else:
                e = d
                d = p / q
        else:
            e = d
            d = m

        a = b
        fa = fb
        if abs(d) > tol1:
            b = b + d
        else:
            b = b + (tol1 if m > 0 else -tol1)

        fb = float(f(b))

        # Maintain the bracket on (b,c)
        if fb * fc > 0.0:
            c = a
            fc = fa
            d = e = b - a

    return None


def _derivative_distance_tt(
    ts: Timescale,
    f_tt: Callable[[float], float],
    tt: float,
    *,
    h_minutes: float,
) -> float:
    """Return a centered finite-difference derivative of distance wrt TT time.

    Args:
        ts: Skyfield Timescale (not used directly, kept for signature symmetry).
        f_tt: Distance function f(tt)->km.
        tt: Evaluation point (TT Julian date).
        h_minutes: Half-step in minutes for centered differences.

    Returns:
        Approximate derivative in km/day (TT days in denominator).
    """
    h_days = h_minutes / 1440.0
    da = float(f_tt(tt - h_days))
    db = float(f_tt(tt + h_days))
    return (db - da) / (2.0 * h_days)


def _find_derivative_sign_brackets(
    ts: Timescale,
    f_tt: Callable[[float], float],
    t_start: Time,
    *,
    search_backward: bool,
    days_window: float,
    step_minutes: float,
    h_minutes: float,
    max_candidates: int = 6,
) -> list[tuple[float, float]]:
    """Find brackets where the distance derivative changes sign.

    The function samples a centered finite-difference derivative on a regular TT grid
    and returns candidate intervals [tt_i, tt_{i+1}] where a sign change occurs.

    The returned brackets are ordered by proximity to t_start to reduce variability
    when multiple sign changes exist inside the search window.

    Args:
        ts: Skyfield Timescale.
        f_tt: Distance function f(tt)->km.
        t_start: Reference time.
        search_backward: Search backward if True, otherwise forward.
        days_window: Search window size in days.
        step_minutes: Sampling step in minutes.
        h_minutes: Half-step for centered derivative in minutes.
        max_candidates: Hard cap on returned brackets.

    Returns:
        A list of (tt_left, tt_right) candidate brackets, ordered by proximity to t_start.
    """
    step_days = step_minutes / 1440.0
    if step_days <= 0.0:
        return []

    tt_ref = float(t_start.tt)
    tt0 = tt_ref - float(days_window) if search_backward else tt_ref
    tt1 = tt_ref if search_backward else tt_ref + float(days_window)

    if not (tt1 > tt0):
        return []

    span = tt1 - tt0
    steps = int(math.ceil(span / step_days)) + 1
    if steps < 3:
        return []

    tts: list[float] = []
    vals: list[float] = []

    for i in range(steps):
        tt_i = min(tt0 + i * step_days, tt1)

        tts.append(tt_i)
        vals.append(_derivative_distance_tt(ts, f_tt, tt_i, h_minutes=h_minutes))

        if tt_i == tt1:
            break

    brackets: list[tuple[float, float]] = []
    for i in range(len(tts) - 1):
        a_tt = tts[i]
        b_tt = tts[i + 1]
        fa = vals[i]
        fb = vals[i + 1]

        if math.isnan(fa) or math.isnan(fb):
            continue

        if fa == 0.0:
            left = max(tt0, a_tt - step_days)
            right = min(tt1, a_tt + step_days)
            if right > left:
                brackets.append((left, right))
        elif fa * fb < 0.0:
            brackets.append((a_tt, b_tt))

    if not brackets:
        return []

    # Filter brackets by direction relative to t_start to avoid selecting "wrong side" candidates.
    # A bracket is kept if its center lies strictly on the expected side of t_start.
    filtered: list[tuple[float, float]] = []
    for a_tt, b_tt in brackets:
        center = 0.5 * (a_tt + b_tt)
        if search_backward:
            if center < tt_ref:
                filtered.append((a_tt, b_tt))
        elif center > tt_ref:
            filtered.append((a_tt, b_tt))

    if not filtered:
        return []

    # Sort by proximity to t_start (deterministic tie-breakers included).
    # Primary: |center - tt_ref|
    # Secondary: smaller bracket width first (tighter bracket is preferred)
    # Tertiary: chronological order for full determinism
    def _sort_key(item: tuple[float, float]) -> tuple[float, float, float]:
        """Return a deterministic sort key for a bracket."""
        a_tt, b_tt = item
        center = 0.5 * (a_tt + b_tt)
        width = max(0.0, b_tt - a_tt)
        return (abs(center - tt_ref), width, a_tt)

    filtered.sort(key=_sort_key)

    # Limit output size after sorting to keep CPU bounded.
    return filtered[: max(1, int(max_candidates))]


def _classify_extremum_kind_at_tt(
    ts: Timescale,
    f_tt: Callable[[float], float],
    tt_center: float,
) -> bool | None:
    """Classify an extremum as minimum or maximum around a candidate center.

    The classification uses a symmetric comparison around the center:
    - if f(center) <= f(center±delta): minimum
    - if f(center) >= f(center±delta): maximum

    Args:
        ts: Skyfield Timescale (not used directly, kept for signature symmetry).
        f_tt: Distance function f(tt)->km.
        tt_center: Candidate TT Julian date.

    Returns:
        True if the extremum is a minimum, False if maximum, or None if undecidable.
    """
    delta_days = 2.0 / 1440.0  # 2 minutes
    y0 = float(f_tt(tt_center))
    yl = float(f_tt(tt_center - delta_days))
    yr = float(f_tt(tt_center + delta_days))

    if math.isnan(y0) or math.isnan(yl) or math.isnan(yr):
        return None

    if y0 <= yl and y0 <= yr:
        return True
    if y0 >= yl and y0 >= yr:
        return False
    return None


def _select_extremum_candidate(
    ts: Timescale,
    f_tt: Callable[[float], float],
    candidates_tt: list[float],
    t_start: Time,
    *,
    is_min: bool,
    search_backward: bool,
) -> float | None:
    """Select the nearest candidate extremum time matching direction and kind.

    This selector is deterministic:
    - it filters candidates by direction relative to t_start
    - it filters by minimum/maximum classification
    - it selects the chronologically nearest valid candidate

    Args:
        ts: Skyfield Timescale.
        f_tt: Distance function f(tt)->km.
        candidates_tt: Candidate TT solutions.
        t_start: Reference time.
        is_min: True for perigee, False for apogee.
        search_backward: True for previous, False for next.

    Returns:
        Selected candidate TT or None.
    """
    ref_tt = float(t_start.tt)
    filtered: list[float] = []

    for tt in candidates_tt:
        if search_backward and not (tt < ref_tt):
            continue
        if (not search_backward) and not (tt > ref_tt):
            continue

        kind = _classify_extremum_kind_at_tt(ts, f_tt, tt)
        if kind is None:
            continue
        if bool(kind) != bool(is_min):
            continue

        filtered.append(tt)

    if not filtered:
        return None

    return max(filtered) if search_backward else min(filtered)


def _minute_validation_extremum(
    ts: Timescale,
    f_tt: Callable[[float], float],
    tt_center: float,
    *,
    is_min: bool,
) -> Time:
    """Snap the extremum to the most extreme minute among {t-1m, t, t+1m}.

    The input is a continuous-time solution (typically from Brent). The output is a
    Skyfield Time exactly on a minute boundary (TT), chosen by evaluating the function
    on the 3 neighboring minute instants.

    Args:
        ts: Skyfield Timescale.
        f_tt: Function evaluated on TT Julian dates.
        tt_center: Candidate solution (TT Julian date).
        is_min: True for perigee, False for apogee.

    Returns:
        A Skyfield Time located on the selected minute.
    """
    # Convert to UTC datetime, round to minute in UTC, and convert back to TT.
    t_center = ts.tt_jd(tt_center)
    dt_utc_raw = t_center.utc_datetime()
    if not isinstance(dt_utc_raw, datetime):
        dt_utc_raw = dt_utc_raw.item() if hasattr(dt_utc_raw, "item") else dt_utc_raw[0]
    if dt_utc_raw.tzinfo is None:
        dt_utc_raw = dt_utc_raw.replace(tzinfo=UTC)

    dt_utc_min = _round_utc_datetime_to_nearest_minute(dt_utc_raw.astimezone(UTC))
    t_min = ts.from_datetime(dt_utc_min)

    minute_days = 1.0 / 1440.0
    candidates = [
        t_min.tt - minute_days,
        t_min.tt,
        t_min.tt + minute_days,
    ]

    best_tt = candidates[1]
    best_val = float(f_tt(best_tt))

    for tt_i in candidates:
        val = float(f_tt(tt_i))
        if is_min:
            if val < best_val:
                best_val = val
                best_tt = tt_i
        elif val > best_val:
            best_val = val
            best_tt = tt_i

    return ts.tt_jd(best_tt)


# -----------------------------------------------------------------------------
# Extremum bracket detection for normal mode
# -----------------------------------------------------------------------------


def _refine_brackets(
    t_list: list[Time],
    y_list: list[float],
    kind: str = "max",
    *,
    expand: int = 1,
) -> list[tuple[float, float, int]]:
    """Return candidate TT brackets for local extrema in a sampled series.

    Args:
        t_list: Monotonic Time samples.
        y_list: Sample values.
        kind: "max" or "min".
        expand: Number of samples added on both sides of the bracket.

    Returns:
        List of (tt_a, tt_b, idx_center) ordered by idx_center.
    """
    if len(t_list) < 3 or len(y_list) < 3:
        return []

    y = np.asarray(y_list, dtype=float)
    slopes = np.diff(y)

    y_scale = float(np.nanmax(np.abs(y))) if np.isfinite(y).any() else 0.0
    eps = max(1e-12, y_scale * 1e-12)

    sgn = np.zeros_like(slopes, dtype=int)
    sgn[slopes > eps] = 1
    sgn[slopes < -eps] = -1

    want_left = 1 if kind == "max" else -1
    want_right = -1 if kind == "max" else 1

    n = len(y)
    candidates: list[int] = []

    for i in range(1, n - 1):
        k = i - 1
        while k >= 0 and sgn[k] == 0:
            k -= 1
        left_eff = sgn[k] if k >= 0 else 0

        j = i
        while j < len(sgn) and sgn[j] == 0:
            j += 1
        right_eff = sgn[j] if j < len(sgn) else 0

        if left_eff == want_left and right_eff == want_right:
            candidates.append(i)

    if not candidates:
        return []

    brackets: list[tuple[float, float, int]] = []
    for idx in candidates:
        left = idx
        while left > 0 and sgn[left - 1] == 0:
            left -= 1

        right = idx
        while right < len(sgn) and sgn[right] == 0:
            right += 1

        i0 = max(0, left - expand)
        i1 = min(n - 1, right + expand)
        if i1 <= i0:
            continue

        brackets.append((t_list[i0].tt, t_list[i1].tt, idx))

    brackets.sort(key=lambda item: item[2])
    return brackets


# -----------------------------------------------------------------------------
# Apsides (apogee/perigee) computation
# -----------------------------------------------------------------------------


def _make_geocentric_distance_tt_function(
    eph: Ephemeris,
    ts: Timescale,
) -> Callable[[float], float]:
    """Build a cached distance function f(tt)->km for geocentric Earth-Moon distance.

    The returned function is bounded-cached using quantized TT values to reduce
    repeated Skyfield evaluations during bracketing and iterative refinement.

    Args:
        eph: Loaded ephemeris.
        ts: Skyfield Timescale.

    Returns:
        A callable mapping TT Julian date to geocentric distance in kilometers.
    """
    earth, moon = eph["earth"], eph["moon"]

    dist_cache: dict[float, float] = {}
    dist_cache_order: list[float] = []
    dist_cache_max = 256

    def _quantize_tt(tt: float) -> float:
        """Quantize a TT Julian date for stable cache keys.

        Args:
            tt: TT Julian date.

        Returns:
            Quantized TT Julian date.
        """
        # 1e-10 day is ~8.64 microseconds; it avoids missing reuse due to tiny float jitter.
        return round(float(tt), 10)

    def _cache_put(key: float, value: float) -> None:
        """Insert a value into the bounded cache.

        Args:
            key: Quantized TT Julian date.
            value: Distance in km.

        Returns:
            None.
        """
        if key in dist_cache:
            return

        dist_cache[key] = value
        dist_cache_order.append(key)

        if len(dist_cache_order) > dist_cache_max:
            old = dist_cache_order.pop(0)
            dist_cache.pop(old, None)

    def f_tt(tt: float) -> float:
        """Return geocentric Earth-Moon distance in km as a function of TT Julian date.

        Args:
            tt: TT Julian date.

        Returns:
            Geocentric distance in kilometers.
        """
        key = _quantize_tt(tt)
        cached = dist_cache.get(key)
        if cached is not None:
            return cached

        value = float(earth.at(ts.tt_jd(tt)).observe(moon).distance().km)
        _cache_put(key, value)
        return value

    return f_tt


def _find_extremum_high_precision(
    ts: Timescale,
    f_tt: Callable[[float], float],
    t_start: Time,
    *,
    is_min: bool,
    search_backward: bool,
    days_window: float,
    tol: float,
    max_iter: int,
) -> Time | None:
    """Find an extremum using derivative sign-change brackets and root refinement.

    Args:
        ts: Skyfield Timescale.
        f_tt: Cached distance function f(tt)->km.
        t_start: Reference time.
        is_min: True to search for a minimum, False for a maximum.
        search_backward: True for previous, False for next.
        days_window: Search window in days.
        tol: Root solver tolerance.
        max_iter: Root solver max iterations.

    Returns:
        Skyfield Time for the extremum, or None if not found.
    """
    step_minutes = 10.0
    h_minutes = 20.0

    brackets = _find_derivative_sign_brackets(
        ts,
        f_tt,
        t_start,
        search_backward=search_backward,
        days_window=days_window,
        step_minutes=step_minutes,
        h_minutes=h_minutes,
        max_candidates=8,
    )

    _LOGGER.debug(
        "Distance extremum: mode=high_precision is_min=%s search_backward=%s brackets_found=%s",
        is_min,
        search_backward,
        len(brackets),
    )

    if not brackets:
        _LOGGER.debug("Distance extremum: no brackets found")
        return None

    def g_tt(tt: float) -> float:
        """Return derivative proxy d(distance)/d(TT day) at tt.

        Args:
            tt: TT Julian date.

        Returns:
            Derivative estimate.
        """
        return _derivative_distance_tt(ts, f_tt, tt, h_minutes=h_minutes)

    roots_tt: list[float] = []
    refined = 0

    for a_tt, b_tt in brackets:
        if refined >= HIGH_PRECISION_BRACKETS_TO_REFINE:
            break
        refined += 1

        root = _brent_root(g_tt, a_tt, b_tt, tol=tol, max_iter=max_iter)
        if root is None or not math.isfinite(root):
            continue

        roots_tt.append(float(root))

    _LOGGER.debug(
        "Distance extremum: refined_brackets=%s candidate_roots_found=%s",
        refined,
        len(roots_tt),
    )

    selected_tt = _select_extremum_candidate(
        ts,
        f_tt,
        roots_tt,
        t_start,
        is_min=is_min,
        search_backward=search_backward,
    )

    if selected_tt is None:
        _LOGGER.debug("Distance extremum: no candidate matched direction/kind filters")
        return None

    _LOGGER.debug(
        "Distance extremum: selected_candidate_tt=%s (search_backward=%s)",
        selected_tt,
        search_backward,
    )
    try:
        selected_distance_km = float(f_tt(selected_tt))
    except (ValueError, ArithmeticError, OverflowError) as exc:
        _LOGGER.debug(
            "Distance extremum: failed to evaluate distance at selected_tt (error=%r)",
            exc,
        )
    else:
        _LOGGER.debug(
            "Distance extremum: selected_distance_km=%.3f (expected_kind=%s)",
            selected_distance_km,
            "minimum" if is_min else "maximum",
        )

    t_ext = _minute_validation_extremum(ts, f_tt, selected_tt, is_min=is_min)

    _LOGGER.debug(
        "Distance extremum: selected_time_utc=%s",
        t_ext.utc_datetime().isoformat()
        if hasattr(t_ext, "utc_datetime")
        else "unknown",
    )
    return t_ext


def _find_extremum_standard(
    ts: Timescale,
    f_tt: Callable[[float], float],
    eph: Ephemeris,
    t_start: Time,
    *,
    is_min: bool,
    search_backward: bool,
    days_window: float,
    step_hours: float,
    bracket_expand: int,
    tol: float,
    max_iter: int,
) -> Time | None:
    """Find an extremum by sampling distance and refining a local bracket.

    Args:
        ts: Skyfield Timescale.
        f_tt: Cached distance function f(tt)->km.
        eph: Loaded ephemeris (used for direct distance sampling on Time objects).
        t_start: Reference time.
        is_min: True to search for a minimum, False for a maximum.
        search_backward: True for previous, False for next.
        days_window: Search window in days.
        step_hours: Sampling step in hours.
        bracket_expand: Bracket expansion in samples.
        tol: Extremum solver tolerance.
        max_iter: Extremum solver max iterations.

    Returns:
        Skyfield Time for the extremum, or None if not found.
    """
    earth, moon = eph["earth"], eph["moon"]

    def geocentric_distance_km(t: Time) -> float:
        """Return geocentric Earth-Moon distance at time t in kilometers.

        Args:
            t: Skyfield Time.

        Returns:
            Geocentric distance in kilometers.
        """
        return earth.at(t).observe(moon).distance().km

    steps = int(days_window * 24.0 / step_hours) + 1
    t0 = (t_start - days_window) if search_backward else t_start

    t_list: list[Time] = []
    d_list: list[float] = []
    for i in range(steps):
        dt_days = i * (step_hours / 24.0)
        t_i = t0 + dt_days
        t_list.append(t_i)
        d_list.append(geocentric_distance_km(t_i))

    bracket_kind = "min" if is_min else "max"
    brackets = _refine_brackets(
        t_list, d_list, kind=bracket_kind, expand=bracket_expand
    )

    _LOGGER.debug(
        "Distance extremum: mode=standard is_min=%s search_backward=%s brackets_found=%s",
        is_min,
        search_backward,
        len(brackets),
    )
    if not brackets:
        return None

    t0_tt = t_start.tt
    chosen: tuple[float, float, int] | None = None

    if search_backward:
        for tt_a, tt_b, idx_center in brackets:
            if t_list[idx_center].tt < t0_tt:
                chosen = (tt_a, tt_b, idx_center)
            else:
                break
    else:
        for tt_a, tt_b, idx_center in brackets:
            if t_list[idx_center].tt > t0_tt:
                chosen = (tt_a, tt_b, idx_center)
                break

    if chosen is None:
        return None

    _LOGGER.debug(
        "Distance extremum: chosen_bracket_tt=(%s, %s) idx_center=%s",
        chosen[0],
        chosen[1],
        chosen[2],
    )

    tt_a, tt_b, _idx_center = chosen
    res = _brent_extremum(f_tt, tt_a, tt_b, is_min=is_min, tol=tol, max_iter=max_iter)
    t_ext = ts.tt_jd(res.tt)

    if search_backward:
        return t_ext if t_ext.tt < t_start.tt else None
    return t_ext if t_ext.tt > t_start.tt else None


def _find_geocentric_distance_extremum(
    eph: Ephemeris,
    ts: Timescale,
    t_start: Time,
    *,
    is_min: bool,
    search_backward: bool,
    days_window: float = 40.0,
    step_hours: float = STANDARD_PRECISION_STEP_HOURS,
    bracket_expand: int = STANDARD_PRECISION_BRACKET_EXPAND,
    tol: float = 1e-7,
    max_iter: int = 200,
) -> Time | None:
    """Find a local extremum of the geocentric Earth-Moon distance around a reference time.

    In high precision mode, a derivative-based strategy is used:
    - detect sign-change brackets for d(distance)/dt on a TT grid
    - refine root times using a bracketing root solver
    - classify each root as minimum/maximum
    - select the nearest candidate in the required direction
    - snap to a deterministic minute-aligned extremum

    In normal mode, the original distance-extremum strategy is preserved.

    Args:
        eph: Loaded ephemeris.
        ts: Skyfield Timescale.
        t_start: Reference time for the search.
        is_min: True to search for a minimum (perigee), False for a maximum (apogee).
        search_backward: True to search in the past window, False to search in the future window.
        days_window: Search window size in days.
        step_hours: Coarse sampling step in hours used to locate a bracketing interval (normal mode).
        bracket_expand: Extra samples included on each side of the detected bracket (normal mode).
        tol: Absolute tolerance on TT Julian date during refinement.
        max_iter: Maximum number of refinement iterations.

    Returns:
        A Skyfield Time for the extremum, or None if not found.
    """
    f_tt = _make_geocentric_distance_tt_function(eph, ts)

    use_high_precision_refine = (
        step_hours <= HIGH_PRECISION_STEP_HOURS
        and bracket_expand >= HIGH_PRECISION_BRACKET_EXPAND
    )

    if use_high_precision_refine:
        return _find_extremum_high_precision(
            ts,
            f_tt,
            t_start,
            is_min=is_min,
            search_backward=search_backward,
            days_window=days_window,
            tol=tol,
            max_iter=max_iter,
        )

    return _find_extremum_standard(
        ts,
        f_tt,
        eph,
        t_start,
        is_min=is_min,
        search_backward=search_backward,
        days_window=days_window,
        step_hours=step_hours,
        bracket_expand=bracket_expand,
        tol=tol,
        max_iter=max_iter,
    )


def _find_next_apogee(
    eph: Ephemeris,
    ts: Timescale,
    t_start: Time,
    *,
    step_hours: float = STANDARD_PRECISION_STEP_HOURS,
    bracket_expand: int = STANDARD_PRECISION_BRACKET_EXPAND,
) -> Time | None:
    """Find the next apogee after t_start using distance maximization.

    Args:
        eph: Loaded ephemeris.
        ts: Skyfield Timescale.
        t_start: Start time for the search.
        step_hours: Coarse sampling step in hours.
        bracket_expand: Extra samples included on each side of the detected bracket.

    Returns:
        Skyfield Time at apogee, or None if not found in the window.
    """
    return _find_geocentric_distance_extremum(
        eph,
        ts,
        t_start,
        is_min=False,
        search_backward=False,
        step_hours=step_hours,
        bracket_expand=bracket_expand,
    )


def _find_next_perigee(
    eph: Ephemeris,
    ts: Timescale,
    t_start: Time,
    *,
    step_hours: float = STANDARD_PRECISION_STEP_HOURS,
    bracket_expand: int = STANDARD_PRECISION_BRACKET_EXPAND,
) -> Time | None:
    """Find the next perigee after t_start using distance minimization.

    Args:
        eph: Loaded ephemeris.
        ts: Skyfield Timescale.
        t_start: Start time for the search.
        step_hours: Coarse sampling step in hours.
        bracket_expand: Extra samples included on each side of the detected bracket.

    Returns:
        Skyfield Time at perigee, or None if not found in the window.
    """
    return _find_geocentric_distance_extremum(
        eph,
        ts,
        t_start,
        is_min=True,
        search_backward=False,
        step_hours=step_hours,
        bracket_expand=bracket_expand,
    )


def _find_previous_apogee(
    eph: Ephemeris,
    ts: Timescale,
    t_start: Time,
    *,
    step_hours: float = STANDARD_PRECISION_STEP_HOURS,
    bracket_expand: int = STANDARD_PRECISION_BRACKET_EXPAND,
) -> Time | None:
    """Find the previous apogee before t_start using distance maximization.

    Args:
        eph: Loaded ephemeris.
        ts: Skyfield Timescale.
        t_start: Reference time for the search.
        step_hours: Coarse sampling step in hours.
        bracket_expand: Extra samples included on each side of the detected bracket.

    Returns:
        Skyfield Time at apogee, or None if not found in the window.
    """
    return _find_geocentric_distance_extremum(
        eph,
        ts,
        t_start,
        is_min=False,
        search_backward=True,
        step_hours=step_hours,
        bracket_expand=bracket_expand,
    )


def _find_previous_perigee(
    eph: Ephemeris,
    ts: Timescale,
    t_start: Time,
    *,
    step_hours: float = STANDARD_PRECISION_STEP_HOURS,
    bracket_expand: int = STANDARD_PRECISION_BRACKET_EXPAND,
) -> Time | None:
    """Find the previous perigee before t_start using distance minimization.

    Args:
        eph: Loaded ephemeris.
        ts: Skyfield Timescale.
        t_start: Reference time for the search.
        step_hours: Coarse sampling step in hours.
        bracket_expand: Extra samples included on each side of the detected bracket.

    Returns:
        Skyfield Time at perigee, or None if not found in the window.
    """
    return _find_geocentric_distance_extremum(
        eph,
        ts,
        t_start,
        is_min=True,
        search_backward=True,
        step_hours=step_hours,
        bracket_expand=bracket_expand,
    )


# -----------------------------------------------------------------------------
# Phase events extraction (single find_discrete call) and full moon naming
# -----------------------------------------------------------------------------


@dataclass(frozen=True)
class _PhaseEvents:
    """Container for phase events used across computations."""

    next_new: Time | None
    next_first: Time | None
    next_full: Time | None
    next_last: Time | None
    prev_new: Time | None
    prev_first: Time | None
    prev_full: Time | None
    prev_last: Time | None


def _iter_phase_pairs(
    times: Iterable[Time], phases: Iterable[int]
) -> Iterable[tuple[Time, int]]:
    """Yield (Time, phase_value) pairs with int conversion.

    Args:
        times: Iterable of Time objects.
        phases: Iterable of phase values.

    Yields:
        (time, phase_value)
    """
    for ti, pv in zip(times, phases, strict=False):
        yield ti, int(pv)


def _extract_phase_events_from_discrete(
    t_ref: Time, times: list[Time], phases: list[int]
) -> _PhaseEvents:
    """Extract next/previous phase events from a discrete event list.

    Args:
        t_ref: Reference time.
        times: Event times.
        phases: Event phase values.

    Returns:
        Phase events container.
    """
    next_map: dict[int, Time | None] = dict.fromkeys(_PHASE_VALUES, None)
    prev_map: dict[int, Time | None] = dict.fromkeys(_PHASE_VALUES, None)

    for ti, pv in _iter_phase_pairs(times, phases):
        if ti.tt > t_ref.tt and next_map.get(pv) is None:
            next_map[pv] = ti
        if ti.tt < t_ref.tt:
            prev_map[pv] = ti

        if all(next_map[p] is not None for p in _PHASE_VALUES):
            # We still want complete prev_map, but it is safe to stop early if we already
            # crossed t_ref and have found all next values and the list is ordered.
            pass

    return _PhaseEvents(
        next_new=next_map[DARK_MOON],
        next_first=next_map[FIRST_QUARTER],
        next_full=next_map[FULL_MOON],
        next_last=next_map[LAST_QUARTER],
        prev_new=prev_map[DARK_MOON],
        prev_first=prev_map[FIRST_QUARTER],
        prev_full=prev_map[FULL_MOON],
        prev_last=prev_map[LAST_QUARTER],
    )


def _time_to_local_datetime(t_obj: Time, tz: ZoneInfo) -> datetime:
    """Convert a Skyfield Time to a timezone-aware datetime in a given timezone.

    Args:
        t_obj: Skyfield Time instance.
        tz: Target timezone.

    Returns:
        A timezone-aware datetime in the requested timezone.
    """
    dt_utc_raw = t_obj.utc_datetime()

    # Skyfield may return a scalar datetime or an array-like container.
    if isinstance(dt_utc_raw, datetime):
        dt_utc = dt_utc_raw
    else:
        dt_utc = dt_utc_raw.item() if hasattr(dt_utc_raw, "item") else dt_utc_raw[0]

    if dt_utc.tzinfo is None:
        dt_utc = dt_utc.replace(tzinfo=UTC)

    return dt_utc.astimezone(tz)


def _is_second_full_moon_in_same_month_local(
    first_full: Time | None,
    second_full: Time | None,
    tz: ZoneInfo,
) -> bool:
    """Return True if second_full is the second full moon within the same local calendar month.

    Args:
        first_full: The first full moon candidate (chronologically before second_full).
        second_full: The second full moon candidate.
        tz: Timezone used to define the calendar month boundary.

    Returns:
        True if both full moons occur in the same local (year, month) and are ordered in time.
    """
    if first_full is None or second_full is None:
        return False

    # Ensure strict ordering and guard against accidental equality.
    if not (first_full.tt < second_full.tt):
        return False

    dt1 = _time_to_local_datetime(first_full, tz)
    dt2 = _time_to_local_datetime(second_full, tz)

    # Blue moon only when both events fall within the same local calendar month.
    return (dt1.year, dt1.month) == (dt2.year, dt2.month)


def _full_moon_name_code(month: int) -> str:
    """Return the canonical full moon name code for a given month.

    Args:
        month: Month number [1..12].

    Returns:
        Name code.
    """
    mapping: dict[int, str] = {
        1: "wolf_moon",
        2: "snow_moon",
        3: "worm_moon",
        4: "pink_moon",
        5: "flower_moon",
        6: "strawberry_moon",
        7: "buck_moon",
        8: "sturgeon_moon",
        9: "harvest_moon",
        10: "hunters_moon",
        11: "beaver_moon",
        12: "cold_moon",
    }
    return mapping.get(month, "unknown")


def _full_moon_alt_names_state_code(full_moon_name_code: str | None) -> str | None:
    """Return the translation state code for full moon alternative names.

    Args:
        full_moon_name_code: Full moon name code.

    Returns:
        Translation state code or None.
    """
    if not full_moon_name_code:
        return None
    if full_moon_name_code == "blue_moon":
        return ""
    if full_moon_name_code == "unknown":
        return "unknown"
    return f"{full_moon_name_code}_alt_names"


def _previous_full_moon_name_code_from_events(
    tz: ZoneInfo, *, prev_full: Time | None
) -> str | None:
    """Compute previous full moon name code from a previous full moon event.

    Args:
        tz: Timezone used for month boundaries.
        prev_full: Previous full moon time.

    Returns:
        Name code or None.
    """
    if prev_full is None:
        return None

    dt_local = _time_to_local_datetime(prev_full, tz)
    return _full_moon_name_code(dt_local.month)


def _next_full_moon_name_code_from_events(
    tz: ZoneInfo, *, next_full: Time | None, prev_full: Time | None
) -> str | None:
    """Compute next full moon name code using next_full and prev_full.

    Args:
        tz: Timezone used for month boundaries.
        next_full: Next full moon time.
        prev_full: Previous full moon time relative to next_full.

    Returns:
        Name code or None.
    """
    if next_full is None:
        return None

    if _is_second_full_moon_in_same_month_local(prev_full, next_full, tz):
        return "blue_moon"

    dt_local = _time_to_local_datetime(next_full, tz)
    return _full_moon_name_code(dt_local.month)


# -----------------------------------------------------------------------------
# Zodiac helpers
# -----------------------------------------------------------------------------


def _zodiac_sign_from_longitude_deg(lon_deg: float) -> str | None:
    """Map ecliptic longitude to a zodiac sign name.

    Args:
        lon_deg: Ecliptic longitude in degrees.

    Returns:
        Lowercase zodiac sign name or None for NaN inputs.
    """
    idx = int((lon_deg % 360.0) // 30) % 12
    names = [
        "aries",
        "taurus",
        "gemini",
        "cancer",
        "leo",
        "virgo",
        "libra",
        "scorpio",
        "sagittarius",
        "capricorn",
        "aquarius",
        "pisces",
    ]
    return names[idx]


def _degree_within_sign(lon_deg: float) -> float:
    """Return the degree within the current zodiac sign.

    This function is intended to be fed with an unrounded ecliptic longitude to
    avoid boundary artifacts when the value is close to a sign cusp.

    Args:
        lon_deg: Ecliptic longitude in degrees.

    Returns:
        Degree within the sign in [0, 30).
    """
    lon_norm = (float(lon_deg) % 360.0 + 360.0) % 360.0
    return lon_norm - (math.floor(lon_norm / 30.0) * 30.0)


def _zodiac_icon(sign: str | None) -> str | None:
    """Return an MDI icon name for a zodiac sign.

    Args:
        sign: Lowercase zodiac sign name.

    Returns:
        Corresponding icon string or None if unknown.
    """
    if not sign:
        return None
    return {
        "aries": "mdi:zodiac-aries",
        "taurus": "mdi:zodiac-taurus",
        "gemini": "mdi:zodiac-gemini",
        "cancer": "mdi:zodiac-cancer",
        "leo": "mdi:zodiac-leo",
        "virgo": "mdi:zodiac-virgo",
        "libra": "mdi:zodiac-libra",
        "scorpio": "mdi:zodiac-scorpio",
        "sagittarius": "mdi:zodiac-sagittarius",
        "capricorn": "mdi:zodiac-capricorn",
        "aquarius": "mdi:zodiac-aquarius",
        "pisces": "mdi:zodiac-pisces",
    }.get(sign)


# -----------------------------------------------------------------------------
# Computation grouping helpers
# -----------------------------------------------------------------------------


class _Calc:
    """Private computation namespace.

    This class groups coordinator computation helpers to reduce the number of module-level
    symbols and to keep call sites compact.
    """

    @staticmethod
    def _round_or_none(value: float | None, ndigits: int) -> float | None:
        """Round a float value or return None.

        Args:
            value: Input float or None.
            ndigits: Decimal digits.

        Returns:
            Rounded float or None.
        """
        if value is None:
            return None
        return round(float(value), ndigits)

    @staticmethod
    def current(
        eph: Ephemeris,
        ts: Timescale,
        t: Time,
        t_future: Time,
        *,
        lat: float,
        lon: float,
        elev_m: float,
    ) -> tuple[dict[str, Any], dict[str, float]]:
        """Compute current topocentric/geocentric coordinates and derived quantities.

        This function returns both:
        - rounded values intended for sensor states
        - raw values intended for downstream computations requiring maximal precision

        Args:
            eph: Loaded ephemeris.
            ts: Skyfield Timescale.
            t: Current time.
            t_future: Future time used to infer waxing/waning.
            lat: Observer latitude in degrees.
            lon: Observer longitude in degrees.
            elev_m: Observer elevation in meters.

        Returns:
            A tuple:
              - payload dictionary fragment for current observations (rounded)
              - raw dictionary containing unrounded values used for internal calculations
        """
        topo_vec, az_deg, el_deg, dist_km = _topocentric_vectors(
            eph, t, lat, lon, elev_m
        )
        geo_vec = _geocentric_vector(eph, t)

        ecl_lon_topo, ecl_lat_topo = _ecliptic_lon_lat_deg_of_date(topo_vec)
        ecl_lon_geo, ecl_lat_geo = _ecliptic_lon_lat_deg_of_date(geo_vec)

        illum_now = _moon_illumination_percentage(eph, t)
        illum_future = _moon_illumination_percentage(eph, t_future)
        waxing = illum_future > illum_now + 1e-6

        payload = {
            KEY_PHASE: _moon_phase_name(eph, t, ts),
            KEY_AZIMUTH: round(float(az_deg), 4),
            KEY_ELEVATION: round(float(el_deg), 4),
            KEY_ILLUMINATION: round(float(illum_now), 3),
            KEY_DISTANCE: round(float(dist_km), 3),
            KEY_PARALLAX: round(float(_moon_parallax_angle_deg(dist_km)), 4),
            KEY_ECLIPTIC_LONGITUDE_TOPOCENTRIC: round(float(ecl_lon_topo), 6),
            KEY_ECLIPTIC_LATITUDE_TOPOCENTRIC: round(float(ecl_lat_topo), 6),
            KEY_ECLIPTIC_LONGITUDE_GEOCENTRIC: round(float(ecl_lon_geo), 6),
            KEY_ECLIPTIC_LATITUDE_GEOCENTRIC: round(float(ecl_lat_geo), 6),
            KEY_ABOVE_HORIZON: float(el_deg) > 0.0,
            KEY_WAXING: bool(waxing),
        }

        raw: dict[str, float] = {
            "ecl_lon_geo": float(ecl_lon_geo),
        }

        return payload, raw

    @staticmethod
    def rise_set(
        eph: Ephemeris,
        t: Time,
        tz: ZoneInfo | None,
        *,
        lat: float,
        lon: float,
        elev_m: float,
    ) -> dict[str, Any]:
        """Compute next and previous rise/set times.

        Args:
            eph: Loaded ephemeris.
            t: Reference time.
            tz: Target timezone for formatting.
            lat: Observer latitude in degrees.
            lon: Observer longitude in degrees.
            elev_m: Observer elevation in meters.

        Returns:
            A payload dictionary fragment for rise and set times.
        """
        try:
            next_rise, next_set = _next_rise_set(eph, lat, lon, elev_m, t)
        except _RECOVERABLE_SKYFIELD_ERRORS:
            next_rise, next_set = None, None

        try:
            prev_rise, prev_set = _previous_rise_set(eph, lat, lon, elev_m, t)
        except _RECOVERABLE_SKYFIELD_ERRORS:
            prev_rise, prev_set = None, None

        return {
            KEY_NEXT_RISE: _safe_time_iso(next_rise, tz),
            KEY_NEXT_SET: _safe_time_iso(next_set, tz),
            KEY_PREVIOUS_RISE: _safe_time_iso(prev_rise, tz),
            KEY_PREVIOUS_SET: _safe_time_iso(prev_set, tz),
        }

    @staticmethod
    def apsis(
        eph: Ephemeris,
        ts: Timescale,
        t: Time,
        tz: ZoneInfo | None,
        *,
        high_precision: bool,
    ) -> dict[str, Any]:
        """Compute next and previous apogee/perigee times.

        Args:
            eph: Loaded ephemeris.
            ts: Skyfield Timescale.
            t: Reference time.
            tz: Target timezone for formatting.
            high_precision: Enable higher CPU usage to improve stability/accuracy.

        Returns:
            A payload dictionary fragment for apogee/perigee times.
        """
        step_hours = HIGH_PRECISION_STEP_HOURS if high_precision else 2.0
        bracket_expand = HIGH_PRECISION_BRACKET_EXPAND if high_precision else 1
        _LOGGER.debug(
            "Apsis computation: high_precision=%s step_hours=%s bracket_expand=%s",
            high_precision,
            step_hours,
            bracket_expand,
        )

        try:
            next_apogee = _find_next_apogee(
                eph,
                ts,
                t,
                step_hours=step_hours,
                bracket_expand=bracket_expand,
            )
        except _RECOVERABLE_NUMERIC_ERRORS:
            next_apogee = None

        try:
            next_perigee = _find_next_perigee(
                eph,
                ts,
                t,
                step_hours=step_hours,
                bracket_expand=bracket_expand,
            )
        except _RECOVERABLE_NUMERIC_ERRORS:
            next_perigee = None

        try:
            prev_apogee = _find_previous_apogee(
                eph,
                ts,
                t,
                step_hours=step_hours,
                bracket_expand=bracket_expand,
            )
        except _RECOVERABLE_NUMERIC_ERRORS:
            prev_apogee = None

        try:
            prev_perigee = _find_previous_perigee(
                eph,
                ts,
                t,
                step_hours=step_hours,
                bracket_expand=bracket_expand,
            )
        except _RECOVERABLE_NUMERIC_ERRORS:
            prev_perigee = None

        _LOGGER.debug(
            "Apsis computation: results next_apogee=%s next_perigee=%s prev_apogee=%s prev_perigee=%s",
            _safe_time_iso(next_apogee, tz),
            _safe_time_iso(next_perigee, tz),
            _safe_time_iso(prev_apogee, tz),
            _safe_time_iso(prev_perigee, tz),
        )
        return {
            KEY_NEXT_APOGEE: _safe_time_iso(next_apogee, tz),
            KEY_NEXT_PERIGEE: _safe_time_iso(next_perigee, tz),
            KEY_PREVIOUS_APOGEE: _safe_time_iso(prev_apogee, tz),
            KEY_PREVIOUS_PERIGEE: _safe_time_iso(prev_perigee, tz),
        }

    @staticmethod
    def phases_and_names(
        eph: Ephemeris,
        ts: Timescale,
        t: Time,
        tz: ZoneInfo | None,
    ) -> tuple[dict[str, Any], dict[str, Time | None]]:
        """Compute phase event timestamps and full moon name codes.

        This implementation performs a single discrete search for moon phases and extracts
        all next/previous events from that result.

        Args:
            eph: Loaded ephemeris.
            ts: Skyfield Timescale.
            t: Reference time.
            tz: Target timezone for formatting.

        Returns:
            A tuple:
              - payload dictionary fragment for phase-related keys
              - raw event times dictionary used downstream (ecliptic/zodiac)
        """
        tz_effective = tz or ZoneInfo("UTC")

        try:
            f = almanac.moon_phases(eph)
            t0 = t - 40.0
            t1 = t + 40.0
            times, phases = almanac.find_discrete(t0, t1, f)

            times_list = times if isinstance(times, list) else list(times)
            phases_list = phases if isinstance(phases, list) else list(phases)

            events_obj = _extract_phase_events_from_discrete(t, times_list, phases_list)
        except _RECOVERABLE_SKYFIELD_ERRORS:
            events_obj = _PhaseEvents(
                next_new=None,
                next_first=None,
                next_full=None,
                next_last=None,
                prev_new=None,
                prev_first=None,
                prev_full=None,
                prev_last=None,
            )

        next_full_name = _next_full_moon_name_code_from_events(
            tz_effective, next_full=events_obj.next_full, prev_full=events_obj.prev_full
        )
        prev_full_name = _previous_full_moon_name_code_from_events(
            tz_effective, prev_full=events_obj.prev_full
        )

        payload = {
            KEY_NEXT_NEW_MOON: _safe_time_iso(events_obj.next_new, tz),
            KEY_NEXT_FIRST_QUARTER: _safe_time_iso(events_obj.next_first, tz),
            KEY_NEXT_FULL_MOON: _safe_time_iso(events_obj.next_full, tz),
            KEY_NEXT_LAST_QUARTER: _safe_time_iso(events_obj.next_last, tz),
            KEY_PREVIOUS_NEW_MOON: _safe_time_iso(events_obj.prev_new, tz),
            KEY_PREVIOUS_FIRST_QUARTER: _safe_time_iso(events_obj.prev_first, tz),
            KEY_PREVIOUS_FULL_MOON: _safe_time_iso(events_obj.prev_full, tz),
            KEY_PREVIOUS_LAST_QUARTER: _safe_time_iso(events_obj.prev_last, tz),
            KEY_NEXT_FULL_MOON_NAME: next_full_name,
            KEY_NEXT_FULL_MOON_ALT_NAMES: _full_moon_alt_names_state_code(
                next_full_name
            ),
            KEY_PREVIOUS_FULL_MOON_NAME: prev_full_name,
            KEY_PREVIOUS_FULL_MOON_ALT_NAMES: _full_moon_alt_names_state_code(
                prev_full_name
            ),
        }

        raw_events: dict[str, Time | None] = {
            "next_new": events_obj.next_new,
            "next_first": events_obj.next_first,
            "next_full": events_obj.next_full,
            "next_last": events_obj.next_last,
            "prev_new": events_obj.prev_new,
            "prev_first": events_obj.prev_first,
            "prev_full": events_obj.prev_full,
            "prev_last": events_obj.prev_last,
        }
        return payload, raw_events

    @staticmethod
    def lunation_ecliptics(
        eph: Ephemeris,
        events: dict[str, Time | None],
    ) -> tuple[dict[str, Any], dict[str, float | None]]:
        """Compute lunation ecliptic coordinates for next/previous new and full moons.

        This function returns both:
        - rounded values for sensor states
        - raw longitudes for downstream computations (e.g., zodiac)

        Args:
            eph: Loaded ephemeris.
            events: Raw event times dictionary.

        Returns:
            A tuple:
              - payload dictionary fragment containing lunation ecliptic keys (rounded)
              - raw longitude mapping used for zodiac computation (unrounded)
        """

        def lunation_ecliptic(
            t_event: Time | None,
        ) -> tuple[float | None, float | None]:
            """Compute geocentric ecliptic lon/lat for a given event time.

            Args:
                t_event: Event time (or None).

            Returns:
                A tuple (lon_deg, lat_deg) or (None, None).
            """
            if t_event is None:
                return None, None
            try:
                v = _geocentric_vector(eph, t_event)
                return _ecliptic_lon_lat_deg_of_date(v)
            except _RECOVERABLE_NUMERIC_ERRORS as exc:
                _LOGGER.debug("Failed lunation ecliptic computation: %r", exc)
                return None, None

        lon_next_new, lat_next_new = lunation_ecliptic(events.get("next_new"))
        lon_next_full, lat_next_full = lunation_ecliptic(events.get("next_full"))
        lon_prev_new, lat_prev_new = lunation_ecliptic(events.get("prev_new"))
        lon_prev_full, lat_prev_full = lunation_ecliptic(events.get("prev_full"))

        payload = {
            KEY_ECLIPTIC_LONGITUDE_NEXT_NEW_MOON: _Calc._round_or_none(lon_next_new, 6),
            KEY_ECLIPTIC_LATITUDE_NEXT_NEW_MOON: _Calc._round_or_none(lat_next_new, 6),
            KEY_ECLIPTIC_LONGITUDE_NEXT_FULL_MOON: _Calc._round_or_none(
                lon_next_full, 6
            ),
            KEY_ECLIPTIC_LATITUDE_NEXT_FULL_MOON: _Calc._round_or_none(
                lat_next_full, 6
            ),
            KEY_ECLIPTIC_LONGITUDE_PREVIOUS_NEW_MOON: _Calc._round_or_none(
                lon_prev_new, 6
            ),
            KEY_ECLIPTIC_LATITUDE_PREVIOUS_NEW_MOON: _Calc._round_or_none(
                lat_prev_new, 6
            ),
            KEY_ECLIPTIC_LONGITUDE_PREVIOUS_FULL_MOON: _Calc._round_or_none(
                lon_prev_full, 6
            ),
            KEY_ECLIPTIC_LATITUDE_PREVIOUS_FULL_MOON: _Calc._round_or_none(
                lat_prev_full, 6
            ),
        }

        raw_lons: dict[str, float | None] = {
            "next_new": lon_next_new,
            "next_full": lon_next_full,
            "prev_new": lon_prev_new,
            "prev_full": lon_prev_full,
        }

        return payload, raw_lons

    @staticmethod
    def zodiac(
        current_lon_geo: float,
        *,
        lon_next_new: float | None,
        lon_next_full: float | None,
        lon_prev_new: float | None,
        lon_prev_full: float | None,
    ) -> dict[str, Any]:
        """Compute zodiac sign/degree/icon keys for current and lunation longitudes.

        Args:
            current_lon_geo: Current geocentric ecliptic longitude of the Moon in degrees.
            lon_next_new: Ecliptic longitude at next new moon in degrees (or None).
            lon_next_full: Ecliptic longitude at next full moon in degrees (or None).
            lon_prev_new: Ecliptic longitude at previous new moon in degrees (or None).
            lon_prev_full: Ecliptic longitude at previous full moon in degrees (or None).

        Returns:
            A payload dictionary fragment containing only zodiac keys.
        """

        def zodiac_from_lon(
            lon_deg: float | None,
        ) -> tuple[str | None, float | None, str | None]:
            """Return zodiac sign, degree in sign and icon from longitude.

            Args:
                lon_deg: Ecliptic longitude in degrees.

            Returns:
                A tuple (sign, degree_in_sign, icon) where each item may be None.
            """
            if lon_deg is None:
                return None, None, None
            try:
                lon_raw = float(lon_deg)
                sign = _zodiac_sign_from_longitude_deg(lon_raw)
                degree_raw = _degree_within_sign(lon_raw)
                degree = round(degree_raw, 4)
                return sign, degree, _zodiac_icon(sign)
            except (ValueError, ArithmeticError) as exc:
                _LOGGER.debug("Failed zodiac computation: %r", exc)
                return None, None, None

        sign_cur, deg_cur, icon_cur = zodiac_from_lon(current_lon_geo)
        sign_nn, deg_nn, icon_nn = zodiac_from_lon(lon_next_new)
        sign_nf, deg_nf, icon_nf = zodiac_from_lon(lon_next_full)
        sign_pn, deg_pn, icon_pn = zodiac_from_lon(lon_prev_new)
        sign_pf, deg_pf, icon_pf = zodiac_from_lon(lon_prev_full)

        return {
            KEY_ZODIAC_SIGN_CURRENT_MOON: sign_cur,
            KEY_ZODIAC_DEGREE_CURRENT_MOON: deg_cur,
            KEY_ZODIAC_ICON_CURRENT_MOON: icon_cur,
            KEY_ZODIAC_SIGN_NEXT_NEW_MOON: sign_nn,
            KEY_ZODIAC_DEGREE_NEXT_NEW_MOON: deg_nn,
            KEY_ZODIAC_ICON_NEXT_NEW_MOON: icon_nn,
            KEY_ZODIAC_SIGN_NEXT_FULL_MOON: sign_nf,
            KEY_ZODIAC_DEGREE_NEXT_FULL_MOON: deg_nf,
            KEY_ZODIAC_ICON_NEXT_FULL_MOON: icon_nf,
            KEY_ZODIAC_SIGN_PREVIOUS_NEW_MOON: sign_pn,
            KEY_ZODIAC_DEGREE_PREVIOUS_NEW_MOON: deg_pn,
            KEY_ZODIAC_ICON_PREVIOUS_NEW_MOON: icon_pn,
            KEY_ZODIAC_SIGN_PREVIOUS_FULL_MOON: sign_pf,
            KEY_ZODIAC_DEGREE_PREVIOUS_FULL_MOON: deg_pf,
            KEY_ZODIAC_ICON_PREVIOUS_FULL_MOON: icon_pf,
        }


def _get_shared_ephemeris_store(hass: HomeAssistant) -> dict[str, Any]:
    """Return the shared store used to reuse loaded ephemeris objects.

    Args:
        hass: Home Assistant instance.

    Returns:
        A dictionary stored in hass.data used to share heavy Skyfield objects.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})
    raw = domain_data.get(_SHARED_EPHEMERIS_STORE_KEY)
    if isinstance(raw, dict):
        return raw

    store: dict[str, Any] = {}
    domain_data[_SHARED_EPHEMERIS_STORE_KEY] = store
    return store


def _get_cached_ephemeris_tuple(
    store: dict[str, Any],
) -> tuple[Ephemeris, Timescale] | None:
    """Return a cached (ephemeris, timescale) tuple from the shared store.

    Args:
        store: Shared store dictionary.

    Returns:
        A (ephemeris, timescale) tuple or None if not available/invalid.
    """
    cached = store.get(_SHARED_EPHEMERIS_ITEM_KEY)
    if not (isinstance(cached, tuple) and len(cached) == 2):
        return None

    eph, ts = cached
    if eph is None or ts is None:
        return None

    return eph, ts


# -----------------------------------------------------------------------------
# Coordinator
# -----------------------------------------------------------------------------


class MoonAstroCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator computing lunar ephemerides and derived quantities for HA sensors."""

    def __init__(
        self,
        hass: HomeAssistant,
        lat: float,
        lon: float,
        elev: float,
        interval: timedelta,
    ) -> None:
        """Initialize the coordinator with observer and scheduling settings.

        Args:
            hass: Home Assistant instance.
            lat: Observer latitude in degrees.
            lon: Observer longitude in degrees.
            elev: Observer elevation in meters.
            interval: Update interval for the coordinator.
        """
        super().__init__(
            hass,
            logger=logging.getLogger(__name__),
            name="Moon Astro",
            update_interval=interval,
        )
        self._lat: float = float(lat)
        self._lon: float = float(lon)
        self._elev: float = float(elev)
        self._eph: Ephemeris | None = None
        self._ts: Timescale | None = None
        self._tz: ZoneInfo | None = None
        self._use_ha_tz: bool = False
        self._high_precision: bool = DEFAULT_HIGH_PRECISION
        self._hass: HomeAssistant = hass

    @classmethod
    def from_config_entry(
        cls, hass: HomeAssistant, entry: ConfigEntry, interval: timedelta
    ) -> MoonAstroCoordinator:
        """Build the coordinator from a ConfigEntry.

        Args:
            hass: Home Assistant instance.
            entry: Config entry containing coordinates and options.
            interval: Update interval for the coordinator.

        Returns:
            A fully configured MoonAstroCoordinator instance.
        """
        data = entry.data
        c = cls(
            hass=hass,
            lat=float(data.get(CONF_LAT, hass.config.latitude)),
            lon=float(data.get(CONF_LON, hass.config.longitude)),
            elev=float(data.get(CONF_ALT, hass.config.elevation or 0)),
            interval=interval,
        )
        c._use_ha_tz = entry.options.get(CONF_USE_HA_TZ, True)
        c._tz = _tz_for_hass(hass) if c._use_ha_tz else _detect_timezone(c._lat, c._lon)
        c._high_precision = entry.options.get(CONF_HIGH_PRECISION, True)
        return c

    async def _async_load_ephemeris(self) -> tuple[Ephemeris, Timescale]:
        """Load ephemerides and timescale asynchronously with caching.

        Returns:
            A tuple (ephemeris, timescale).
        """
        store = _get_shared_ephemeris_store(self._hass)

        cached_tuple = _get_cached_ephemeris_tuple(store)
        if cached_tuple is not None:
            return cached_tuple

        def _load() -> tuple[Ephemeris, Timescale]:
            """Blocking loader executed in the executor.

            Returns:
                A tuple (ephemeris, timescale).
            """
            cache_dir = self._hass.config.path(CACHE_DIR_NAME)
            Path(cache_dir).mkdir(parents=True, exist_ok=True)
            load = Loader(cache_dir)
            eph: Ephemeris = load(DE440_FILE)
            ts: Timescale = load.timescale()
            return eph, ts

        eph, ts = await self._hass.async_add_executor_job(_load)
        store[_SHARED_EPHEMERIS_ITEM_KEY] = (eph, ts)
        return eph, ts

    async def _async_ensure_ephemeris_loaded(self) -> tuple[Ephemeris, Timescale]:
        """Ensure ephemeris and timescale are loaded and return them.

        Returns:
            A tuple (ephemeris, timescale).
        """
        if self._eph is None or self._ts is None:
            self._eph, self._ts = await self._async_load_ephemeris()

        assert self._eph is not None, "Ephemeris must be loaded"
        assert self._ts is not None, "Timescale must be loaded"
        return self._eph, self._ts

    async def _async_exec(self, func: Callable[[], Any]) -> Any:
        """Run a blocking callable in Home Assistant executor.

        Args:
            func: A zero-argument callable performing blocking work.

        Returns:
            The callable return value.
        """
        return await self._hass.async_add_executor_job(func)

    async def _async_compute_payload(
        self, eph: Ephemeris, ts: Timescale
    ) -> dict[str, Any]:
        """Compute the coordinator payload using concurrent executor tasks.

        The computation is split into independent blocking parts to reduce the time a
        single executor job monopolizes the threadpool and to allow better scheduling.

        Args:
            eph: Loaded ephemeris.
            ts: Loaded timescale.

        Returns:
            A dictionary with all computed keys ready to be exposed by entities.
        """
        now_utc = _round_utc_datetime_to_nearest_minute(datetime.now(UTC))
        t = ts.from_datetime(now_utc)
        t_future = ts.from_datetime(now_utc + timedelta(hours=6))

        # Prepare blocking callables. Each callable must be pure and return its data.
        def _calc_current() -> tuple[dict[str, Any], dict[str, float]]:
            """Compute current observation payload and raw values.

            Returns:
                Tuple (payload, raw_values).
            """
            return _Calc.current(
                eph,
                ts,
                t,
                t_future,
                lat=self._lat,
                lon=self._lon,
                elev_m=self._elev,
            )

        def _calc_rise_set() -> dict[str, Any]:
            """Compute rise and set payload.

            Returns:
                Payload dictionary fragment.
            """
            return _Calc.rise_set(
                eph,
                t,
                self._tz,
                lat=self._lat,
                lon=self._lon,
                elev_m=self._elev,
            )

        # Launch independent computations concurrently.
        current_task = self._hass.async_create_task(self._async_exec(_calc_current))
        rise_set_task = self._hass.async_create_task(self._async_exec(_calc_rise_set))

        # Await the independent results.
        current_payload, current_raw = await current_task
        rise_set_payload = await rise_set_task

        # Zodiac depends on current longitude and lunation longitudes.
        def _calc_zodiac() -> dict[str, Any]:
            """Compute zodiac payload for the current Moon position.

            Returns:
                Payload dictionary fragment.
            """
            return _Calc.zodiac(
                current_raw["ecl_lon_geo"],
                lon_next_new=None,
                lon_next_full=None,
                lon_prev_new=None,
                lon_prev_full=None,
            )

        zodiac_payload = await self._async_exec(_calc_zodiac)

        # Merge only frequently changing payload fragments.
        payload: dict[str, Any] = {}
        payload.update(current_payload)
        payload.update(rise_set_payload)
        payload.update(zodiac_payload)

        return payload

    async def _async_update_data(self) -> dict[str, Any]:
        """Compute current lunar data and upcoming events for sensors.

        Returns:
            A dictionary with all computed keys ready to be exposed by entities.

        Raises:
            UpdateFailed: If an unexpected error occurs during calculations.
        """
        try:
            eph, ts = await self._async_ensure_ephemeris_loaded()
            return await self._async_compute_payload(eph, ts)
        except _RECOVERABLE_UPDATE_ERRORS as err:
            raise UpdateFailed(str(err)) from err


# -----------------------------------------------------------------------------
# Events Coordinator
# -----------------------------------------------------------------------------


class MoonAstroEventsCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator computing rare event-based lunar values.

    This coordinator focuses on values that only change when crossing an astronomical
    event boundary. A lightweight periodic fallback is kept to ensure eventual
    resynchronization.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        lat: float,
        lon: float,
        elev: float,
        interval: timedelta,
    ) -> None:
        """Initialize the coordinator with observer and scheduling settings.

        Args:
            hass: Home Assistant instance.
            lat: Observer latitude in degrees.
            lon: Observer longitude in degrees.
            elev: Observer elevation in meters.
            interval: Fallback update interval.

        Returns:
            None.
        """
        super().__init__(
            hass,
            logger=logging.getLogger(__name__),
            name="Moon Astro Events",
            update_interval=interval,
        )
        self._lat: float = float(lat)
        self._lon: float = float(lon)
        self._elev: float = float(elev)
        self._hass: HomeAssistant = hass

        self._eph: Ephemeris | None = None
        self._ts: Timescale | None = None
        self._tz: ZoneInfo | None = None
        self._use_ha_tz: bool = False
        self._high_precision: bool = DEFAULT_HIGH_PRECISION

        self._unsub_next_event: Callable[[], None] | None = None
        self._next_refresh_utc: datetime | None = None

        # Dedicated executor to avoid monopolizing Home Assistant's shared thread pool.
        # A single worker enforces determinism and prevents concurrent heavy computations.
        self._executor: ThreadPoolExecutor = ThreadPoolExecutor(
            max_workers=1,
            thread_name_prefix="moon_astro_events",
        )

        # Lock used to prevent concurrent event-based computations.
        self._compute_lock: asyncio.Lock = asyncio.Lock()

        # Track an in-flight refresh task to avoid spawning multiple long-running
        # computations when many refresh requests happen close together.
        self._inflight_task: asyncio.Task[None] | None = None

    @classmethod
    def from_config_entry(
        cls, hass: HomeAssistant, entry: ConfigEntry, interval: timedelta
    ) -> MoonAstroEventsCoordinator:
        """Build the coordinator from a ConfigEntry.

        Args:
            hass: Home Assistant instance.
            entry: Config entry containing coordinates and options.
            interval: Fallback update interval.

        Returns:
            A fully configured MoonAstroEventsCoordinator instance.
        """
        data = entry.data
        c = cls(
            hass=hass,
            lat=float(data.get(CONF_LAT, hass.config.latitude)),
            lon=float(data.get(CONF_LON, hass.config.longitude)),
            elev=float(data.get(CONF_ALT, hass.config.elevation or 0)),
            interval=interval,
        )
        c._use_ha_tz = entry.options.get(CONF_USE_HA_TZ, True)
        c._tz = _tz_for_hass(hass) if c._use_ha_tz else _detect_timezone(c._lat, c._lon)
        c._high_precision = entry.options.get(CONF_HIGH_PRECISION, True)
        return c

    async def _async_load_ephemeris(self) -> tuple[Ephemeris, Timescale]:
        """Load ephemerides and timescale asynchronously with caching.

        Returns:
            A tuple (ephemeris, timescale).
        """
        store = _get_shared_ephemeris_store(self._hass)

        cached_tuple = _get_cached_ephemeris_tuple(store)
        if cached_tuple is not None:
            return cached_tuple

        def _load() -> tuple[Ephemeris, Timescale]:
            """Blocking loader executed in the executor.

            Returns:
                A tuple (ephemeris, timescale).
            """
            cache_dir = self._hass.config.path(CACHE_DIR_NAME)
            Path(cache_dir).mkdir(parents=True, exist_ok=True)
            load = Loader(cache_dir)
            eph: Ephemeris = load(DE440_FILE)
            ts: Timescale = load.timescale()
            return eph, ts

        eph, ts = await self._hass.async_add_executor_job(_load)
        store[_SHARED_EPHEMERIS_ITEM_KEY] = (eph, ts)
        return eph, ts

    async def _async_ensure_ephemeris_loaded(self) -> tuple[Ephemeris, Timescale]:
        """Ensure ephemeris and timescale are loaded and return them.

        Returns:
            A tuple (ephemeris, timescale).
        """
        if self._eph is None or self._ts is None:
            self._eph, self._ts = await self._async_load_ephemeris()

        assert self._eph is not None, "Ephemeris must be loaded"
        assert self._ts is not None, "Timescale must be loaded"
        return self._eph, self._ts

    async def _async_exec(self, func: Callable[[], Any]) -> Any:
        """Run a blocking callable in a dedicated executor.

        This avoids monopolizing Home Assistant's shared thread pool when event-based
        computations take a long time.

        Args:
            func: A zero-argument callable performing blocking work.

        Returns:
            The callable return value.
        """
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self._executor, func)

    @property
    def next_refresh_utc(self) -> datetime | None:
        """Return the next scheduled refresh time in UTC.

        This timestamp represents when the coordinator expects to refresh event-based
        values next (either after the next event boundary or via the periodic fallback).

        Returns:
            A timezone-aware UTC datetime, or None if not scheduled.
        """
        if self._next_refresh_utc is not None:
            return self._next_refresh_utc

        interval = self.update_interval
        if interval is None:
            return None

        return datetime.now(UTC) + interval

    def _cancel_next_event_timer(self) -> None:
        """Cancel the scheduled next event refresh timer.

        Returns:
            None.
        """
        if self._unsub_next_event is not None:
            self._unsub_next_event()
            self._unsub_next_event = None
        self._next_refresh_utc = None

    def _schedule_next_event_refresh(self, data: dict[str, Any]) -> None:
        """Schedule a refresh shortly after the next computed astronomical event.

        Args:
            data: Coordinator data containing timestamp keys.

        Returns:
            None.
        """
        self._cancel_next_event_timer()

        candidates: list[datetime] = []
        for key in (
            KEY_NEXT_NEW_MOON,
            KEY_NEXT_FIRST_QUARTER,
            KEY_NEXT_FULL_MOON,
            KEY_NEXT_LAST_QUARTER,
            KEY_NEXT_APOGEE,
            KEY_NEXT_PERIGEE,
        ):
            dt = _parse_iso_to_utc(data.get(key))
            if dt is None:
                continue
            candidates.append(dt)

        if not candidates:
            interval = self.update_interval
            if interval is not None:
                self._next_refresh_utc = datetime.now(UTC) + interval
            else:
                self._next_refresh_utc = None
            return

        next_dt = min(candidates)
        _LOGGER.debug(
            "Events scheduler: next_event_candidate_utc=%s candidates_count=%s",
            next_dt.isoformat(),
            len(candidates),
        )

        # Schedule slightly after the event boundary to avoid edge instability.
        when = next_dt + timedelta(minutes=2)

        # If the event is already in the past (clock jump or delayed startup), refresh soon.
        now = datetime.now(UTC)
        if when <= now:
            when = now + timedelta(seconds=30)

        self._next_refresh_utc = when.astimezone(UTC)

        def _cb(_: datetime) -> None:
            """Callback scheduled at the next event boundary.

            Args:
                _: The trigger time provided by the scheduler.

            Returns:
                None.
            """
            _LOGGER.debug("Events scheduler: triggering refresh task")
            self._unsub_next_event = None
            self._hass.async_create_task(self.async_request_refresh())

        _LOGGER.debug(
            "Events scheduler: scheduling refresh at when_utc=%s (now_utc=%s)",
            when.isoformat(),
            datetime.now(UTC).isoformat(),
        )
        self._unsub_next_event = async_track_point_in_time(self._hass, _cb, when)

    async def _async_compute_events_payload(
        self, eph: Ephemeris, ts: Timescale
    ) -> dict[str, Any]:
        """Compute the events-only payload in an executor thread.

        Args:
            eph: Loaded ephemeris.
            ts: Loaded timescale.

        Returns:
            A dictionary containing only rare event-based keys.
        """
        now_utc = _round_utc_datetime_to_nearest_minute(datetime.now(UTC))
        t = ts.from_datetime(now_utc)

        def _calc() -> dict[str, Any]:
            """Heavy event computations executed in the executor.

            Returns:
                Payload dictionary fragment.
            """
            payload: dict[str, Any] = {}

            phase_payload, events = _Calc.phases_and_names(eph, ts, t, self._tz)
            payload.update(phase_payload)

            payload.update(
                _Calc.apsis(
                    eph,
                    ts,
                    t,
                    self._tz,
                    high_precision=self._high_precision,
                )
            )

            ecl_payload, ecl_raw_lons = _Calc.lunation_ecliptics(eph, events)
            payload.update(ecl_payload)

            # Compute zodiac only for lunation longitudes. The "current" zodiac remains
            # handled by the main coordinator.
            payload.update(
                _Calc.zodiac(
                    current_lon_geo=float("nan"),
                    lon_next_new=ecl_raw_lons["next_new"],
                    lon_next_full=ecl_raw_lons["next_full"],
                    lon_prev_new=ecl_raw_lons["prev_new"],
                    lon_prev_full=ecl_raw_lons["prev_full"],
                )
            )

            # Remove keys that should not be produced by this coordinator.
            payload.pop(KEY_ZODIAC_SIGN_CURRENT_MOON, None)
            payload.pop(KEY_ZODIAC_DEGREE_CURRENT_MOON, None)
            payload.pop(KEY_ZODIAC_ICON_CURRENT_MOON, None)

            return payload

        return await self._async_exec(_calc)

    async def _async_run_refresh_job(self) -> None:
        """Run a full refresh job without blocking the update caller.

        This method is responsible for:
        - computing event-based payload in the dedicated executor
        - updating self.data through DataUpdateCoordinator mechanisms
        - scheduling the next event-based refresh time

        Returns:
            None.
        """
        if self._compute_lock.locked():
            _LOGGER.debug(
                "Events coordinator: refresh job skipped (computation already running)"
            )
            return

        async with self._compute_lock:
            try:
                eph, ts = await self._async_ensure_ephemeris_loaded()
                data = await self._async_compute_events_payload(eph, ts)

                # Store and notify listeners.
                self.async_set_updated_data(data)

                # Schedule next refresh around the next computed event.
                self._schedule_next_event_refresh(data)
            except asyncio.CancelledError:
                raise
            except _RECOVERABLE_UPDATE_ERRORS as err:
                _LOGGER.debug("Events coordinator: refresh job failed: %r", err)
                # Keep old data when a job fails to avoid oscillating states.

    async def _async_update_data(self) -> dict[str, Any]:
        """Compute rare event-based lunar data.

        This implementation ensures Home Assistant stays responsive by not awaiting
        long-running computations inside the coordinator update path. The actual
        work is performed by a background task using a dedicated executor.

        Returns:
            The latest available event-based data (possibly stale if a job is running).
        """
        # If a refresh job is already in-flight, do not spawn another one.
        if self._inflight_task is not None and not self._inflight_task.done():
            _LOGGER.debug(
                "Events coordinator: returning cached data (refresh already running)"
            )
            return self.data or {}

        # Start a background refresh job and immediately return the last data.
        self._inflight_task = self._hass.async_create_task(
            self._async_run_refresh_job(),
            name=f"{DOMAIN}-events-refresh",
        )

        interval = self.update_interval
        if interval is not None and self._next_refresh_utc is None:
            self._next_refresh_utc = datetime.now(UTC) + interval

        return self.data or {}

    async def async_shutdown(self) -> None:
        """Release scheduled callbacks and executor resources held by this coordinator.

        Returns:
            None.
        """
        self._cancel_next_event_timer()

        task = self._inflight_task
        if task is not None and not task.done():
            task.cancel()

        executor = self._executor

        def _shutdown() -> None:
            """Shutdown the dedicated executor."""
            executor.shutdown(wait=True, cancel_futures=True)

        await self._hass.async_add_executor_job(_shutdown)
