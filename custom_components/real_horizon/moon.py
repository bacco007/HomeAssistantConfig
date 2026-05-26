"""Low-precision geocentric moon ephemeris.

astral 2.2 (HA-pinned) does not provide moon position. We implement a
simplified Meeus algorithm (Astronomical Algorithms, Ch. 47): main periodic
terms only. Accuracy is a few arcminutes — fine for visual display.

Phase is reported as a normalized fraction in [0, 1):
    0   = new moon
    0.25 = first quarter
    0.5 = full moon
    0.75 = last quarter
"""

from __future__ import annotations

import math
from datetime import datetime, timezone

_RAD = math.pi / 180.0


def _julian_day(utc: datetime) -> float:
    utc = utc.astimezone(timezone.utc)
    y, m = utc.year, utc.month
    if m <= 2:
        y -= 1
        m += 12
    a = y // 100
    b = 2 - a + a // 4
    day = utc.day + (utc.hour + utc.minute / 60 + utc.second / 3600) / 24
    return math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1)) + day + b - 1524.5


def moon_position(when: datetime, lat_deg: float, lon_deg: float) -> tuple[float, float, float]:
    """Return (compass_azimuth_deg, altitude_deg, phase_fraction)."""
    JD = _julian_day(when)
    T = (JD - 2451545.0) / 36525.0

    # Mean elements (degrees, reduced).
    Lp = (218.3164477 + 481267.88123421 * T) % 360
    D = (297.8501921 + 445267.1114034 * T) % 360
    M = (357.5291092 + 35999.0502909 * T) % 360
    Mp = (134.9633964 + 477198.8675055 * T) % 360
    F = (93.272 + 483202.0175233 * T) % 360

    Dr, Mr, Mpr, Fr = (x * _RAD for x in (D, M, Mp, F))

    # Geocentric ecliptic longitude (main terms from Meeus 47.A).
    dL = (
        6.288774 * math.sin(Mpr)
        + 1.274027 * math.sin(2 * Dr - Mpr)
        + 0.658314 * math.sin(2 * Dr)
        + 0.213618 * math.sin(2 * Mpr)
        - 0.185116 * math.sin(Mr)
        - 0.114332 * math.sin(2 * Fr)
        + 0.058793 * math.sin(2 * Dr - 2 * Mpr)
        + 0.057066 * math.sin(2 * Dr - Mr - Mpr)
        + 0.053322 * math.sin(2 * Dr + Mpr)
        + 0.045758 * math.sin(2 * Dr - Mr)
        - 0.040923 * math.sin(Mr - Mpr)
        - 0.034720 * math.sin(Dr)
        - 0.030383 * math.sin(Mr + Mpr)
    )
    lam_deg = (Lp + dL) % 360

    # Ecliptic latitude (main terms from Meeus 47.B).
    bet_deg = (
        5.128122 * math.sin(Fr)
        + 0.280602 * math.sin(Mpr + Fr)
        + 0.277693 * math.sin(Mpr - Fr)
        + 0.173237 * math.sin(2 * Dr - Fr)
        + 0.055413 * math.sin(2 * Dr - Mpr + Fr)
        + 0.046271 * math.sin(2 * Dr - Mpr - Fr)
    )

    eps = (23.4393 - 0.013 * T) * _RAD
    lam = lam_deg * _RAD
    bet = bet_deg * _RAD

    sin_dec = math.sin(bet) * math.cos(eps) + math.cos(bet) * math.sin(eps) * math.sin(lam)
    dec = math.asin(sin_dec)
    ra = math.atan2(
        math.sin(lam) * math.cos(eps) - math.tan(bet) * math.sin(eps),
        math.cos(lam),
    )

    # Greenwich Mean Sidereal Time (Meeus 12.4).
    JD0 = math.floor(JD - 0.5) + 0.5
    H = (JD - JD0) * 24
    T0 = (JD0 - 2451545.0) / 36525.0
    gmst_h = (
        6.697374558
        + 0.06570982441908 * (JD0 - 2451545.0)
        + 1.00273790935 * H
        + 0.000026 * T0 * T0
    ) % 24
    lst = ((gmst_h * 15 + lon_deg) % 360) * _RAD

    h = lst - ra  # hour angle
    phi = lat_deg * _RAD

    sin_alt = math.sin(phi) * math.sin(dec) + math.cos(phi) * math.cos(dec) * math.cos(h)
    alt = math.asin(sin_alt)
    az = math.atan2(
        -math.cos(dec) * math.sin(h),
        math.sin(dec) * math.cos(phi) - math.cos(dec) * math.sin(phi) * math.cos(h),
    )
    az_compass = (math.degrees(az) + 360) % 360

    # Phase = sun-moon elongation along the ecliptic, normalized to [0, 1).
    # Sun's geocentric ecliptic longitude (low-precision, Meeus 25):
    sun_lon = (
        280.46646
        + 36000.76983 * T
        + 1.9146 * math.sin(Mr)
        + 0.020 * math.sin(2 * Mr)
    ) % 360
    elongation = (lam_deg - sun_lon) % 360
    phase = elongation / 360.0

    return az_compass, math.degrees(alt), phase
