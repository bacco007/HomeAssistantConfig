"""Historical climate normals (day-of-year), for Adaptive Sensor Calibration's
sibling feature: Climate Normals. (v2.7)

Distinct from the existing self-referential 30d/90d temperature/rain anomaly
sensors (which compare today against the *station's own* recent rolling
average - see learning_state.py's climatology_stats), this compares today
against the long-term historical average for *this specific day of the year*
at this location, sourced from Open-Meteo's archive (ERA5 reanalysis) API.

Design:
  - Fetched once, infrequently (const.py CLIMATE_NORMALS_REFRESH_DAYS), not
    on every coordinator cycle - climate normals do not change day to day.
  - A single archive-api request spanning CLIMATE_NORMALS_LOOKBACK_YEARS years
    is parsed into daily (t_max, t_min, precip) records, then binned into 365
    day-of-year buckets, each smoothed over a +/- CLIMATE_NORMALS_WINDOW_DAYS
    circular calendar window (so a single wet/dry or hot/cold day doesn't
    dominate that day's normal).
  - Feb 29 collapses onto Feb 28 so the bucket key space is always exactly
    365 days regardless of leap years in the source data.
"""

from __future__ import annotations

from datetime import date as _date
from typing import Any

CLIMATE_NORMAL_REF_YEAR = 2001  # non-leap reference year for canonical day-of-year math


def _canonical_yday(month: int, day: int) -> int:
    """Day-of-year (1-365) for (month, day) in a fixed non-leap reference year."""
    if month == 2 and day == 29:
        day = 28
    return _date(CLIMATE_NORMAL_REF_YEAR, month, day).timetuple().tm_yday


def parse_archive_daily_response(payload: dict) -> list[dict[str, Any]]:
    """Convert an Open-Meteo archive-api JSON payload into a flat record list.

    Expects the `daily` block requested with temperature_2m_max,
    temperature_2m_min, precipitation_sum. Missing/short arrays degrade
    gracefully to None for that field rather than raising.
    """
    daily = payload.get("daily") or {}
    times = daily.get("time") or []
    t_max = daily.get("temperature_2m_max") or []
    t_min = daily.get("temperature_2m_min") or []
    precip = daily.get("precipitation_sum") or []
    records: list[dict[str, Any]] = []
    for i, date_str in enumerate(times):
        records.append(
            {
                "date": date_str,
                "t_max": t_max[i] if i < len(t_max) else None,
                "t_min": t_min[i] if i < len(t_min) else None,
                "precip": precip[i] if i < len(precip) else None,
            }
        )
    return records


def compute_climate_normals(
    daily_records: list[dict[str, Any]],
    window_days: int = 5,
) -> dict[str, dict[str, Any]]:
    """Bin historical daily records into 365 day-of-year normals.

    `daily_records`: [{"date": "YYYY-MM-DD", "t_max": float|None,
    "t_min": float|None, "precip": float|None}, ...] - as returned by
    `parse_archive_daily_response`.

    Returns {str(canonical_yday 1-365): {"t_high": mean|None, "t_low": mean|None,
    "rain": mean|None, "n": sample_count}}. String keys throughout (rather
    than int) so the table round-trips cleanly through JSON storage. A
    day-of-year with no usable samples anywhere in its window is omitted.
    """
    tagged: list[tuple[int, float | None, float | None, float | None]] = []
    for rec in daily_records:
        try:
            d = _date.fromisoformat(rec["date"])
        except (KeyError, TypeError, ValueError):
            continue
        tagged.append((_canonical_yday(d.month, d.day), rec.get("t_max"), rec.get("t_min"), rec.get("precip")))

    normals: dict[str, dict[str, Any]] = {}
    if not tagged:
        return normals

    for target in range(1, 366):
        highs: list[float] = []
        lows: list[float] = []
        rains: list[float] = []
        for yday, t_max, t_min, precip in tagged:
            dist = abs(yday - target)
            circular_dist = min(dist, 365 - dist)
            if circular_dist > window_days:
                continue
            if t_max is not None:
                highs.append(t_max)
            if t_min is not None:
                lows.append(t_min)
            if precip is not None:
                rains.append(precip)
        if not highs and not lows and not rains:
            continue
        normals[str(target)] = {
            "t_high": round(sum(highs) / len(highs), 1) if highs else None,
            "t_low": round(sum(lows) / len(lows), 1) if lows else None,
            "rain": round(sum(rains) / len(rains), 1) if rains else None,
            "n": max(len(highs), len(lows), len(rains)),
        }
    return normals


def climate_normal_for_date(normals: dict[str, dict[str, Any]], target: _date) -> dict[str, Any] | None:
    """Look up the day-of-year normal for `target` (a date/datetime.date)."""
    return normals.get(str(_canonical_yday(target.month, target.day)))
