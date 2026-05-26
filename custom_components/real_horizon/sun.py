"""Body-vs-horizon math, generalised over any sky body."""

from __future__ import annotations

from collections.abc import Callable
from datetime import date, datetime, timedelta, tzinfo

from astral import Observer
from astral.sun import azimuth as sun_azimuth, elevation as sun_elevation

from .pvgis import HorizonProfile

PosFn = Callable[[datetime], tuple[float, float]]
"""A callable returning (compass_azimuth_deg, altitude_deg) for a given datetime."""


def sun_pos_fn(observer: Observer) -> PosFn:
    return lambda t: (sun_azimuth(observer, t), sun_elevation(observer, t))


def find_crossings(
    pos: PosFn,
    horizon: HorizonProfile,
    day: date,
    tz: tzinfo,
    step_minutes: int = 1,
) -> list[tuple[datetime, str]]:
    """All horizon crossings over a single local day. Wrapper for find_crossings_window."""
    start = datetime.combine(day, datetime.min.time(), tzinfo=tz)
    end = start + timedelta(days=1)
    return find_crossings_window(pos, horizon, start, end, step_minutes)


def find_crossings_window(
    pos: PosFn,
    horizon: HorizonProfile,
    start: datetime,
    end: datetime,
    step_minutes: int = 1,
) -> list[tuple[datetime, str]]:
    """All sign changes of `altitude - horizon_at(azimuth)` over an arbitrary window.

    Returns `[(time, 'rise'|'set'), ...]`, bisected to ~1 s. Handles multi-peak
    horizons -- a notch can produce multiple rises/sets.
    """
    step = timedelta(minutes=step_minutes)

    times: list[datetime] = []
    t = start
    while t <= end:
        times.append(t)
        t += step

    def clearance(when: datetime) -> float:
        az, alt = pos(when)
        return alt - horizon.elevation_at(az)

    clearances = [clearance(t) for t in times]
    crossings: list[tuple[datetime, str]] = []
    for i in range(1, len(times)):
        c0, c1 = clearances[i - 1], clearances[i]
        if c0 == 0 or (c0 < 0) != (c1 < 0):
            kind = "rise" if c1 > c0 else "set"
            lo, hi = times[i - 1], times[i]
            f_lo = c0
            for _ in range(20):
                mid = lo + (hi - lo) / 2
                f_mid = clearance(mid)
                if (f_lo < 0) == (f_mid < 0):
                    lo, f_lo = mid, f_mid
                else:
                    hi = mid
            crossings.append((lo + (hi - lo) / 2, kind))
    return crossings


def first_rise_last_set(
    crossings: list[tuple[datetime, str]],
) -> tuple[datetime | None, datetime | None]:
    """Pick the canonical sunrise (first 'rise') and sunset (last 'set')."""
    rise = next((t for t, k in crossings if k == "rise"), None)
    set_ = next((t for t, k in reversed(crossings) if k == "set"), None)
    return rise, set_
