"""Meteorological algorithms for Weather Station Core.

All algorithms are documented with source references, input ranges,
and typical error bounds. Ported from the original ws_station YAML
package (v1.0.3) by Konstantinos, with corrections and additions.

References:
  - Alduchov & Eskridge 1996: Magnus-form dew point constants
  - Buck 1981: Frost point (saturation over ice)
  - Stull 2011: Wet-bulb temperature approximation
  - Steadman 1994 / BOM: Apparent temperature
  - Negretti & Zambra / Zambretti: Barometric forecaster
  - WMO No. 8, No. 306: Pressure tendency, Beaufort scale
  - Van Wagner 1987: Fire weather index structure (simplified)
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Moon phase UI helpers
# ---------------------------------------------------------------------------

# MOON_ILLUMINATION: approximate percentage illumination by phase.
# Used by coordinator to populate KEY_MOON_ILLUMINATION_PCT.
MOON_ILLUMINATION = {
    "new_moon": 0,
    "waxing_crescent": 25,
    "first_quarter": 50,
    "waxing_gibbous": 75,
    "full_moon": 100,
    "waning_gibbous": 75,
    "last_quarter": 50,
    "waning_crescent": 25,
}


# ---------------------------------------------------------------------------
# Dew point, frost point, wet-bulb
# ---------------------------------------------------------------------------


def calculate_dew_point(temp_c: float, humidity: float) -> float:
    """Magnus-formula dew point (Alduchov & Eskridge 1996).

    Uses temperature-dependent constants:
      Over water (T >= 0): a=17.625, b=243.04
      Over ice   (T <  0): a=22.587, b=273.86 (Buck 1981)

    Valid range: -45 C to +60 C, 1%-100% RH.
    Max error < 0.1 C across valid range (over water).
    """
    if temp_c >= 0:
        a, b = 17.625, 243.04
    else:
        a, b = 22.587, 273.86
    rh_clamped = max(1.0, min(100.0, humidity))
    gamma = (a * temp_c) / (b + temp_c) + math.log(rh_clamped / 100.0)
    return round((b * gamma) / (a - gamma), 2)


def calculate_frost_point(temp_c: float, humidity: float) -> float:
    """Frost point using Magnus formula with ice constants (Buck 1981).

    The frost point is the temperature at which air becomes saturated
    with respect to ice. Only physically meaningful below 0 C.
    Above 0 C, returns the standard dew point.

    Constants: a=22.587, b=273.86 (saturation over ice).
    """
    if temp_c >= 0:
        return calculate_dew_point(temp_c, humidity)
    a, b = 22.587, 273.86
    rh_clamped = max(1.0, min(100.0, humidity))
    gamma = (a * temp_c) / (b + temp_c) + math.log(rh_clamped / 100.0)
    return round((b * gamma) / (a - gamma), 2)


def calculate_wet_bulb(temp_c: float, humidity: float) -> float:
    """Wet-bulb temperature approximation (Stull 2011).

    Formula: Tw = T * atan(0.151977 * (RH + 8.313659)^0.5)
             + atan(T + RH) - atan(RH - 1.676331)
             + 0.00391838 * RH^1.5 * atan(0.023101 * RH)
             - 4.686035

    Source: Stull, R. (2011). "Wet-Bulb Temperature from Relative
    Humidity and Air Temperature." J. Appl. Meteor. Climatol., 50,
    2267-2269.

    Valid range: RH 5%-99%, T -20 C to +50 C.
    Max error: +/- 0.3 C within valid range.
    """
    rh = max(5.0, min(99.0, humidity))
    tw = (
        temp_c * math.atan(0.151977 * (rh + 8.313659) ** 0.5)
        + math.atan(temp_c + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * rh**1.5 * math.atan(0.023101 * rh)
        - 4.686035
    )
    return round(tw, 2)


# ---------------------------------------------------------------------------
# Heat / cold / humidity comfort indices
# ---------------------------------------------------------------------------


def calculate_heat_index(tc: float, rh: float) -> float | None:
    """NWS Heat Index (Rothfusz regression).

    Returns apparent temperature in °C, or None when outside valid range.
    Valid range: T >= 27 °C and RH >= 40 %.
    Reference: NWS Technical Attachment SR 90-23 (Rothfusz 1990).
    """
    if tc < 27.0 or rh < 40.0:
        return None
    tf = tc * 9 / 5 + 32
    hi_f = (
        -42.379
        + 2.04901523 * tf
        + 10.14333127 * rh
        - 0.22475541 * tf * rh
        - 0.00683783 * tf**2
        - 0.05481717 * rh**2
        + 0.00122874 * tf**2 * rh
        + 0.00085282 * tf * rh**2
        - 0.00000199 * tf**2 * rh**2
    )
    return round((hi_f - 32) * 5 / 9, 1)


def calculate_wind_chill(tc: float, wind_ms: float) -> float | None:
    """WMO / NWS Wind Chill Index (2001 formula).

    Returns apparent temperature in °C, or None when outside valid range.
    Valid range: T <= 10 °C and wind speed > 1.34 m/s (4.8 km/h).
    Reference: Environment Canada / NWS Joint Wind Chill Index (2001).
    """
    if tc > 10.0 or wind_ms <= 1.34:
        return None
    wind_kmh = wind_ms * 3.6
    wc = 13.12 + 0.6215 * tc - 11.37 * wind_kmh**0.16 + 0.3965 * tc * wind_kmh**0.16
    return round(wc, 1)


def calculate_humidex(tc: float, dew_c: float) -> float | None:
    """Canadian Humidex (Environment Canada).

    Returns the humidex value (°C) or None when humidex <= ambient temperature
    (i.e., no perceived increase in discomfort).
    Reference: Masterson & Richardson 1979.
    """
    e = 6.1078 * math.exp(5417.7530 * (1.0 / 273.16 - 1.0 / (273.16 + dew_c)))
    humidex = tc + 0.5555 * (e - 10.0)
    return round(humidex, 1) if humidex > tc else None


def calculate_vpd(tc: float, rh: float) -> float:
    """Vapour Pressure Deficit (kPa).

    VPD = saturation vapour pressure minus actual vapour pressure.
    Used extensively in plant physiology, greenhouse control, and irrigation.
    Reference: Tetens formula (Allen et al. 1998, FAO-56).
    """
    es = 0.6108 * math.exp(17.27 * tc / (tc + 237.3))
    ea = es * rh / 100.0
    return round(max(0.0, es - ea), 3)


def calculate_absolute_humidity(tc: float, rh: float) -> float:
    """Absolute humidity (g/m³).

    Mass of water vapour per unit volume of moist air.
    Uses the Tetens approximation for saturation vapour pressure.
    """
    es_pa = 611.2 * math.exp(17.67 * tc / (tc + 243.5))
    ah = (es_pa * rh / 100.0) / (461.5 * (tc + 273.15)) * 1000.0
    return round(ah, 2)


def calculate_delta_t(tc: float, tw_c: float) -> float:
    """Delta-T index (dry-bulb minus wet-bulb temperature, °C).

    Used as a spray application suitability index in agriculture:
    Delta-T < 2 °C  -> unsuitable (rapid evaporation, drift risk)
    Delta-T 2-8 °C  -> ideal spray window
    Delta-T > 8 °C  -> unsuitable (rapid evaporation, poor coverage)
    Reference: Australian Pesticides and Veterinary Medicines Authority.
    """
    return round(tc - tw_c, 1)


# ---------------------------------------------------------------------------
# Davis THW / THSW indices
# ---------------------------------------------------------------------------


def calculate_thw_index(tc: float, rh: float, wind_ms: float) -> float | None:
    """Davis THW (Temperature-Humidity-Wind) Index.

    Extends the NWS Heat Index by adding a wind-cooling adjustment.
    Returns None when heat index preconditions are not met (T < 27 °C or RH < 40 %).
    Reference: Davis Instruments WeatherLink documentation.
    """
    hi_c = calculate_heat_index(tc, rh)
    if hi_c is None:
        return None
    hi_f = hi_c * 9 / 5 + 32
    wind_mph = wind_ms * 2.23694
    thw_f = hi_f - (1.072 * wind_mph)
    return round((thw_f - 32) * 5 / 9, 1)


def calculate_thsw_index(tc: float, rh: float, wind_ms: float, solar_rad_wm2: float) -> float | None:
    """Davis THSW (Temperature-Humidity-Sun-Wind) Index.

    Extends THW by adding solar radiation heating.  Requires a solar radiation
    sensor; returns None when THW preconditions are not met.
    Reference: Davis Instruments WeatherLink documentation.
    """
    thw_c = calculate_thw_index(tc, rh, wind_ms)
    if thw_c is None:
        return None
    thw_f = thw_c * 9 / 5 + 32
    solar_term_f = 0.01 * solar_rad_wm2
    thsw_f = thw_f + solar_term_f
    return round((thsw_f - 32) * 5 / 9, 1)


# ---------------------------------------------------------------------------
# Solar / cloud indices
# ---------------------------------------------------------------------------


def calculate_clearness_index(solar_rad_wm2: float, sun_elev_deg: float) -> float | None:
    """Clearness index Kt = observed solar / theoretical clear-sky solar radiation.

    Returns a dimensionless ratio in [0, 1] (values near 1 -> clear sky,
    values near 0 -> overcast).  Returns None when sun elevation < 5° to
    avoid noise near the horizon.
    Reference: Duffie & Beckman (2006), Solar Engineering of Thermal Processes.
    """
    if sun_elev_deg < 5.0:
        return None
    sun_elev_rad = math.radians(sun_elev_deg)
    rs_max = 1361.0 * math.sin(sun_elev_rad) * 0.75  # clear-sky fraction ~0.75
    if rs_max <= 0:
        return None
    return round(min(1.0, solar_rad_wm2 / rs_max), 3)


def clearness_to_cloud_cover(kt: float) -> int:
    """Convert clearness index to approximate cloud cover percentage (0-100).

    Linear inversion: cloud_cover = (1 - Kt) * 100, clamped to [0, 100].
    """
    return max(0, min(100, round((1.0 - kt) * 100)))


# ---------------------------------------------------------------------------
# Sea-level pressure
# ---------------------------------------------------------------------------


def calculate_sea_level_pressure(station_pressure_hpa: float, elevation_m: float, temp_c: float) -> float:
    """Reduce station pressure to mean sea level (MSLP).

    Method: Temperature-corrected hypsometric reduction (WMO No. 8, S3.1.3).
    Formula: MSLP = P_stn * exp(elevation / (T_K * 29.263))

    Accuracy: +/-0.3 hPa below 500 m, +/-1 hPa at 2000 m.
    Limitation: Uses current temperature only; WMO recommends 12h mean
    temperature for better accuracy at high elevations.
    """
    temp_k = temp_c + 273.15
    if temp_k < 1.0:
        temp_k = 1.0  # guard against division by zero
    exponent = elevation_m / (temp_k * 29.263)
    return round(station_pressure_hpa * math.exp(exponent), 1)


# ---------------------------------------------------------------------------
# Apparent / feels-like temperature
# ---------------------------------------------------------------------------


def calculate_apparent_temperature(temp_c: float, humidity: float, wind_speed_ms: float) -> float:
    """Australian Bureau of Meteorology Apparent Temperature.

    Formula: AT = Ta + 0.33*e - 0.70*ws - 4.0
    where e = vapour pressure (hPa), ws = wind speed (m/s).

    Source: Steadman 1994 / BOM operational formula.
    Valid for any temperature range (unlike NWS wind chill/heat index
    which have validity bounds).
    """
    vp = (humidity / 100.0) * 6.105 * math.exp((17.27 * temp_c) / (237.7 + temp_c))
    at = temp_c + (0.33 * vp) - (0.70 * wind_speed_ms) - 4.0
    return round(at, 1)


def feels_like_comfort_level(feels_like_c: float) -> str:
    """Comfort category from apparent temperature."""
    if feels_like_c < -10:
        return "Dangerous Cold"
    if feels_like_c < 0:
        return "Freezing"
    if feels_like_c < 10:
        return "Very Cold"
    if feels_like_c < 15:
        return "Cold"
    if feels_like_c < 20:
        return "Cool"
    if feels_like_c < 25:
        return "Comfortable"
    if feels_like_c < 30:
        return "Warm"
    if feels_like_c < 35:
        return "Hot"
    if feels_like_c < 40:
        return "Very Hot"
    return "Dangerous Heat"


# ---------------------------------------------------------------------------
# Beaufort scale
# ---------------------------------------------------------------------------


def wind_speed_to_beaufort(wind_speed_ms: float) -> int:
    """Convert wind speed (m/s) to Beaufort number (WMO No. 8)."""
    boundaries = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7]
    for i, b in enumerate(boundaries):
        if wind_speed_ms < b:
            return i
    return 12


def beaufort_description(beaufort: int) -> str:
    """WMO Beaufort scale description."""
    descriptions = [
        "Calm",
        "Light Air",
        "Light Breeze",
        "Gentle Breeze",
        "Moderate Breeze",
        "Fresh Breeze",
        "Strong Breeze",
        "Near Gale",
        "Gale",
        "Strong Gale",
        "Storm",
        "Violent Storm",
        "Hurricane",
    ]
    return descriptions[min(beaufort, 12)]


# ---------------------------------------------------------------------------
# Wind direction
# ---------------------------------------------------------------------------


def direction_to_cardinal_16(degrees: float) -> str:
    """Convert degrees to 16-point compass direction."""
    dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    return dirs[int((degrees + 11.25) / 22.5) % 16]


def direction_to_quadrant(degrees: float) -> str:
    """Convert degrees to 4-point quadrant (N/E/S/W)."""
    d = degrees % 360
    if d >= 315 or d < 45:
        return "N"
    if d < 135:
        return "E"
    if d < 225:
        return "S"
    return "W"


def smooth_wind_direction(current_deg: float, previous_deg: float, alpha: float = 0.3) -> float:
    """Circular exponential smoothing for wind direction."""
    diff = current_deg - previous_deg
    if diff > 180:
        diff -= 360
    elif diff < -180:
        diff += 360
    result = previous_deg + alpha * diff
    if result < 0:
        result += 360
    elif result >= 360:
        result -= 360
    return round(result, 1)


# ---------------------------------------------------------------------------
# Pressure trend
# ---------------------------------------------------------------------------


def least_squares_pressure_trend(pressure_readings: list, interval_minutes: int = 15) -> float:
    """Least-squares linear trend over pressure history, extrapolated to 3h."""
    n = len(pressure_readings)
    if n < 2:
        return 0.0
    sum_x = n * (n - 1) / 2
    sum_x2 = n * (n - 1) * (2 * n - 1) / 6
    sum_y = sum(pressure_readings)
    sum_xy = sum(i * pressure_readings[i] for i in range(n))
    denom = (n * sum_x2) - (sum_x * sum_x)
    if denom == 0:
        return 0.0
    slope = ((n * sum_xy) - (sum_x * sum_y)) / denom
    intervals_per_3h = 180 / interval_minutes
    return round(slope * intervals_per_3h, 2)


def pressure_trend_display(trend_3h: float) -> str:
    """Classify 3-hour pressure tendency (WMO No. 306, Table 4680)."""
    if trend_3h >= 1.6:
        return "rising_rapidly"
    if trend_3h >= 0.8:
        return "rising"
    if trend_3h > -0.8:
        return "steady"
    if trend_3h > -1.6:
        return "falling"
    return "falling_rapidly"


def pressure_trend_arrow(trend_3h: float) -> str:
    """Arrow symbol for pressure tendency."""
    if trend_3h >= 1.6:
        return "\u2191\u2191"
    if trend_3h >= 0.8:
        return "\u2191"
    if trend_3h > -0.8:
        return "\u2192"
    if trend_3h > -1.6:
        return "\u2193"
    return "\u2193\u2193"


# ---------------------------------------------------------------------------
# Zambretti Forecaster (real Negretti & Zambra lookup table)
# ---------------------------------------------------------------------------

# Implied rain-likelihood (%) per Z-number (1-26, index 0-25).
# Derived from the qualitative text descriptions - used to compare the
# Zambretti local-sensor outlook against the Open-Meteo precip_prob.
ZAMBRETTI_RAIN_PCT: list[int] = [
    5,  # Z=1  Settled fine
    10,  # Z=2  Fine weather
    15,  # Z=3  Becoming fine
    20,  # Z=4  Fine, becoming less settled
    30,  # Z=5  Fine, possible showers
    15,  # Z=6  Fairly fine, improving
    35,  # Z=7  Fairly fine, possible showers early
    40,  # Z=8  Fairly fine, showery later
    35,  # Z=9  Showery early, improving
    40,  # Z=10 Changeable, mending
    35,  # Z=11 Fairly fine, possible showers
    45,  # Z=12 Rather unsettled clearing later
    50,  # Z=13 Unsettled, probably improving
    55,  # Z=14 Showery, bright intervals
    60,  # Z=15 Showery, becoming rather unsettled
    60,  # Z=16 Changeable, some rain
    65,  # Z=17 Unsettled, short fine intervals
    65,  # Z=18 Unsettled, rain later
    70,  # Z=19 Unsettled, some rain
    75,  # Z=20 Mostly very unsettled
    75,  # Z=21 Occasional rain, worsening
    80,  # Z=22 Rain at times, very unsettled
    85,  # Z=23 Rain at frequent intervals
    90,  # Z=24 Rain, very unsettled
    85,  # Z=25 Stormy, may improve
    95,  # Z=26 Stormy, much rain
]

# The 26 Zambretti forecast texts (Z-number 1-26, indices 0-25).
# Original Negretti & Zambra patent, public domain.
ZAMBRETTI_TEXTS = [
    "settled_fine",  # Z=1
    "fine_weather",  # Z=2
    "becoming_fine",  # Z=3
    "fine_becoming_less_settled",  # Z=4
    "fine_possible_showers",  # Z=5
    "fairly_fine_improving",  # Z=6
    "fairly_fine_possible_showers_early",  # Z=7
    "fairly_fine_showery_later",  # Z=8
    "showery_early_improving",  # Z=9
    "changeable_mending",  # Z=10
    "fairly_fine_possible_showers",  # Z=11
    "rather_unsettled_clearing_later",  # Z=12
    "unsettled_probably_improving",  # Z=13
    "showery_bright_intervals",  # Z=14
    "showery_becoming_rather_unsettled",  # Z=15
    "changeable_some_rain",  # Z=16
    "unsettled_short_fine_intervals",  # Z=17
    "unsettled_rain_later",  # Z=18
    "unsettled_some_rain",  # Z=19
    "mostly_very_unsettled",  # Z=20
    "occasional_rain_worsening",  # Z=21
    "rain_at_times_very_unsettled",  # Z=22
    "rain_at_frequent_intervals",  # Z=23
    "rain_very_unsettled",  # Z=24
    "stormy_may_improve",  # Z=25
    "stormy_much_rain",  # Z=26
]


def zambretti_forecast(
    mslp: float,
    pressure_trend_3h: float,
    wind_quadrant: str,
    humidity: float,
    month: int,
    hemisphere: str = "Northern",
    climate: str = "Mediterranean",
    wind_speed_ms: float | None = None,
    rain_24h_mm: float | None = None,
) -> tuple[str, int]:
    """Zambretti barometric forecaster using the real N&Z lookup method.

    The algorithm maps MSLP to a Z-number (1-26), then applies corrections
    for pressure trend, wind direction, and season.

    v0.3.0 fixes:
      - Recalibrated MSLP→Z scale to match the original Zambretti dial bands.
        Previously a linear 950-1050 hPa map flattened the "fair" zone too
        aggressively, so 1015 hPa MSLP returned Z=10 ("Changeable") instead
        of the expected Z=6-8 ("Fairly fine"). The new piecewise map matches
        the dial's published bands.
      - Wind direction influence is suppressed when wind_speed_ms < 1.0,
        because at very low wind speeds the direction is meteorological
        noise rather than a prevailing-wind signal.
      - Sanity guard: if pressure is high (>1015 hPa) AND humidity is
        moderate (<60%) AND there has been no rain in 24h, do not return
        a "showery/rainy/unsettled" output. The base scale was reading
        these conditions correctly as Z=8-12, but the texts in that range
        still mention rain ("Showery early, improving") when the input
        is clearly stable fair weather. We clamp Z to a fair-weather text
        when these guard conditions hold.

    Returns: (forecast_text, z_number)

    Source: Negretti & Zambra (1915), as documented in:
      - "Weather Forecasting Using a Barometer" by R.N. Denham
      - Various open-source implementations (pywws, Cumulus)

    Accuracy: ~65-75% for 6-12h forecasts in maritime/Mediterranean
    climates. Less reliable in continental interiors and tropics.
    """
    # ----------------------------------------------------------------
    # Base Z-number: piecewise map from MSLP (matches Zambretti dial bands)
    # ----------------------------------------------------------------
    p = max(950.0, min(1060.0, mslp))
    if p >= 1050.0:
        z_base = 1.0 + (1060.0 - p) / 10.0 * 2.0
    elif p >= 1030.0:
        z_base = 3.0 + (1050.0 - p) / 20.0 * 4.0
    elif p >= 1015.0:
        z_base = 7.0 + (1030.0 - p) / 15.0 * 4.0
    elif p >= 1000.0:
        z_base = 11.0 + (1015.0 - p) / 15.0 * 6.0
    elif p >= 985.0:
        z_base = 17.0 + (1000.0 - p) / 15.0 * 5.0
    else:
        z_base = 22.0 + (985.0 - p) / 35.0 * 4.0

    # Seasonal adjustment
    is_winter = (month <= 3 or month >= 10) if hemisphere == "Northern" else (4 <= month <= 9)
    season_adj = 1.0 if is_winter else -1.0

    # Pressure trend adjustment
    if pressure_trend_3h > 1.6:
        trend_adj = -4.0
    elif pressure_trend_3h > 0.8:
        trend_adj = -2.0
    elif pressure_trend_3h > 0.1:
        trend_adj = -1.0
    elif pressure_trend_3h < -1.6:
        trend_adj = 4.0
    elif pressure_trend_3h < -0.8:
        trend_adj = 2.0
    elif pressure_trend_3h < -0.1:
        trend_adj = 1.0
    else:
        trend_adj = 0.0

    # Wind direction adjustment (climate-region-aware, suppressed at low wind)
    wind_patterns = {
        "Atlantic Europe": {"good": ["E", "N"], "bad": ["W", "S"]},
        "Mediterranean": {"good": ["N", "E"], "bad": ["S", "W"]},
        "Continental Europe": {"good": ["E", "N"], "bad": ["W", "S"]},
        "Scandinavia": {"good": ["E", "N"], "bad": ["S", "W"]},
        "North America East": {"good": ["N", "W"], "bad": ["S", "E"]},
        "North America West": {"good": ["E", "N"], "bad": ["W", "S"]},
        "Australia": {"good": ["S", "E"], "bad": ["N", "W"]},
        "Custom": {"good": ["N", "E"], "bad": ["S", "W"]},
    }
    pattern = wind_patterns.get(climate, wind_patterns["Mediterranean"])
    if wind_speed_ms is not None and wind_speed_ms < 1.0:
        wind_adj = 0.0
    elif wind_quadrant in pattern["good"]:
        wind_adj = -1.0
    elif wind_quadrant in pattern["bad"]:
        wind_adj = 1.0
    else:
        wind_adj = 0.0

    # Humidity adjustment
    if humidity > 85:
        hum_adj = 1.0
    elif humidity < 40:
        hum_adj = -0.5
    else:
        hum_adj = 0.0

    # Combine
    z_final = z_base + trend_adj + wind_adj + season_adj + hum_adj
    z_number = max(1, min(26, round(z_final)))

    # Sanity guard: clamp away from rain narratives when inputs are stable fair.
    if (
        mslp > 1015.0
        and humidity < 60.0
        and (rain_24h_mm is None or rain_24h_mm < 0.2)
        and pressure_trend_3h > -1.0
        and 8 <= z_number <= 14
    ):
        z_number = 6

    forecast_text = ZAMBRETTI_TEXTS[z_number - 1]
    return forecast_text, z_number


# ---------------------------------------------------------------------------
# Rain probability (climate-region-aware)
# ---------------------------------------------------------------------------

# Regional pressure thresholds for rain likelihood
_RAIN_PRESSURE_PROFILES = {
    "Atlantic Europe": {"low": 1005, "med": 1012, "high": 1020},
    "Mediterranean": {"low": 1008, "med": 1015, "high": 1022},
    "Continental Europe": {"low": 1005, "med": 1013, "high": 1020},
    "Scandinavia": {"low": 1000, "med": 1010, "high": 1018},
    "North America East": {"low": 1005, "med": 1013, "high": 1020},
    "North America West": {"low": 1008, "med": 1015, "high": 1022},
    "Australia": {"low": 1005, "med": 1013, "high": 1020},
    "Custom": {"low": 1005, "med": 1013, "high": 1020},
}

_RAIN_WIND_BIAS = {
    "Atlantic Europe": {"wet": ["W", "S"], "dry": ["E", "N"]},
    "Mediterranean": {"wet": ["S", "W"], "dry": ["N", "E"]},
    "Continental Europe": {"wet": ["W", "S"], "dry": ["E", "N"]},
    "Scandinavia": {"wet": ["S", "W"], "dry": ["N", "E"]},
    "North America East": {"wet": ["S", "E"], "dry": ["N", "W"]},
    "North America West": {"wet": ["W", "S"], "dry": ["E", "N"]},
    "Australia": {"wet": ["N", "W"], "dry": ["S", "E"]},
    "Custom": {"wet": ["S", "W"], "dry": ["N", "E"]},
}


def calculate_rain_probability(
    mslp: float,
    pressure_trend: float,
    humidity: float,
    wind_quadrant: str,
    climate_region: str = "Mediterranean",
) -> int:
    """Heuristic rain probability estimate from local sensor data.

    Uses climate-region-specific pressure thresholds and wind direction
    biases. This is NOT a calibrated probability; treat as an index
    (0-100) indicating relative likelihood of precipitation.

    Disclaimer: Accuracy depends on sensor quality, local topography,
    and climate patterns. Not suitable as a sole forecast source.
    """
    profile = _RAIN_PRESSURE_PROFILES.get(climate_region, _RAIN_PRESSURE_PROFILES["Custom"])
    wind_bias = _RAIN_WIND_BIAS.get(climate_region, _RAIN_WIND_BIAS["Custom"])

    prob = 0

    # Pressure contribution
    if mslp < profile["low"]:
        prob += 35
    elif mslp < profile["med"]:
        prob += 20
    elif mslp < profile["high"]:
        prob += 10

    # Pressure trend contribution
    if pressure_trend < -3:
        prob += 40
    elif pressure_trend < -1.6:
        prob += 25
    elif pressure_trend < -0.8:
        prob += 15
    elif pressure_trend > 1.6:
        prob -= 15

    # Humidity contribution
    if humidity > 85:
        prob += 25
    elif humidity > 75:
        prob += 15
    elif humidity > 65:
        prob += 5
    elif humidity < 50:
        prob -= 10

    # Wind direction (region-specific)
    if wind_quadrant in wind_bias["wet"]:
        prob += 10
    elif wind_quadrant in wind_bias["dry"]:
        prob -= 10

    return max(0, min(100, prob))


def combine_rain_probability(
    local_prob: float,
    api_prob,
    current_hour: int,
    learned_local_w: float | None = None,
    learned_api_w: float | None = None,
) -> int:
    """Blend local sensor-based probability with API forecast probability.

    When Brier-score-derived learned weights are available (≥10 verified
    outcomes in the rolling 90-day window), those weights are used in place
    of the fixed hour-of-day heuristic.  The learned weights are adaptive:
    whichever source has made better-calibrated predictions recently gets a
    higher weight.

    Fallback (no learned data yet):
    - Hours 6-18 (daytime, convective): local weight 0.5
    - Hours 0-6, 18-24 (stable, frontal): local weight 0.3
    This reflects that local sensors catch convective buildup well
    but frontal systems are better captured by NWP models.
    """
    if api_prob is None:
        return round(local_prob)

    # Use Brier-derived adaptive weights when available; fall back to
    # fixed hour-of-day heuristic otherwise.
    if learned_local_w is not None and learned_api_w is not None:
        local_weight = learned_local_w
    else:
        local_weight = 0.5 if 6 <= current_hour <= 18 else 0.3

    return round(local_prob * local_weight + float(api_prob) * (1.0 - local_weight))


def format_rain_display(rain_rate_mmph: float) -> str:
    """Return a snake_case intensity key for state translation."""
    if rain_rate_mmph > 10:
        return "heavy"
    if rain_rate_mmph > 2:
        return "moderate"
    if rain_rate_mmph > 0.5:
        return "light"
    if rain_rate_mmph > 0:
        return "drizzle"
    return "dry"


# ---------------------------------------------------------------------------
# Kalman filter for rain rate smoothing
# ---------------------------------------------------------------------------


class KalmanFilter:
    """Simple 1D Kalman filter for rain rate de-noising."""

    def __init__(self, process_noise=0.01, measurement_noise=0.5, initial_estimate=0.0, initial_error_variance=0.5):
        self.process_noise = process_noise
        self.measurement_noise = measurement_noise
        self.estimate = initial_estimate
        self.error_variance = initial_error_variance

    def update(self, measurement: float) -> float:
        predicted_error_var = self.error_variance + self.process_noise
        kalman_gain = predicted_error_var / (predicted_error_var + self.measurement_noise)
        self.estimate = self.estimate + kalman_gain * (measurement - self.estimate)
        self.error_variance = (1 - kalman_gain) * predicted_error_var
        return max(0.0, round(self.estimate, 1))

    def filter_quality(self) -> str:
        if self.error_variance < 0.1:
            return "excellent"
        if self.error_variance < 0.3:
            return "good"
        if self.error_variance < 0.6:
            return "fair"
        return "uncertain"


# ---------------------------------------------------------------------------
# Current condition classifier (36 conditions)
# ---------------------------------------------------------------------------


def determine_current_condition(
    temp_c,
    humidity,
    wind_speed_ms,
    wind_gust_ms,
    rain_rate_mmph,
    dew_point_c,
    illuminance_lx,
    uv_index,
    zambretti,
    pressure_trend,
    sun_elevation,
    sun_azimuth,
    is_day,
    pm10=0.0,
    is_wet=False,
) -> str:
    """Classify current weather into one of 36 conditions.

    Priority order: severe > precipitation > temperature extremes >
    visibility > wind > astronomical > cloud cover.

    Limitation: Uses raw illuminance as cloud proxy without solar-angle
    normalization. Cloud cover estimates are approximate -- accuracy
    improves with higher sun elevation angles.
    """
    is_rising = sun_azimuth < 180
    is_golden_hour = -4 < sun_elevation < 10 and is_day
    is_sunrise = is_golden_hour and is_rising
    is_sunset = is_golden_hour and not is_rising

    # Severe weather (highest priority)
    if wind_gust_ms > 32 or "stormy" in str(zambretti):
        return "hurricane"
    if wind_gust_ms > 25 and pressure_trend < -3:
        return "severe-storm"
    if "stormy" in str(zambretti) and rain_rate_mmph > 10:
        return "thunderstorm"
    if "stormy" in str(zambretti) or (rain_rate_mmph > 5 and wind_gust_ms > 15):
        return "pre-storm"

    # Frozen precipitation
    if temp_c < 0 and (rain_rate_mmph > 0 or is_wet):
        if wind_speed_ms > 8 and rain_rate_mmph > 2:
            return "snow-accumulation"
        return "snowy"
    if 0 <= temp_c < 2 and (rain_rate_mmph > 0 or is_wet) and humidity > 85:
        return "sleet"

    # Liquid precipitation
    if rain_rate_mmph > 10:
        return "heavy-rain"
    if rain_rate_mmph > 2 or (is_wet and rain_rate_mmph > 0.5):
        return "rainy"
    if rain_rate_mmph > 0 or is_wet:
        return "drizzle"

    # Temperature extremes & ice
    if temp_c < -5 and wind_speed_ms > 10:
        return "icy-conditions"

    # Visibility
    if humidity > 95 and (temp_c - (dew_point_c or temp_c)) < 1 and wind_speed_ms < 1.5:
        now_h = datetime.now().hour
        return "misty-morning" if (is_sunrise or 5 <= now_h < 9) else "fog"

    # Air quality
    if pm10 > 150 and illuminance_lx < 50000:
        return "sandstorm"
    if pm10 > 80:
        return "african-dust"

    # Wind
    if wind_gust_ms > 17.2:
        return "windy" if is_day else "windy-night"

    # Temperature extremes
    if temp_c >= 38:
        return "hot"
    if temp_c < -10 and not is_day:
        return "cold"

    # Astronomical
    if is_sunrise:
        return "sunrise"
    if is_sunset:
        return "sunset"
    if is_golden_hour:
        return "golden-hour"

    # Post-rain
    if not is_wet and rain_rate_mmph == 0 and humidity > 80 and illuminance_lx > 30000:
        return "clearing-after-rain"

    # Night
    if not is_day:
        return "clear-night" if humidity < 50 and illuminance_lx < 100 else "overcast-night"

    # Cloud cover from illuminance (approximate, no solar-angle correction).
    # Thresholds tuned to match human perception rather than radiometric truth:
    # at low-to-moderate sun angles, partly-cloudy skies often register only
    # 5-15 kLx, so an aggressive "cloudy" band makes the sensor disagree with
    # what you see outside. These bounds favour partly-cloudy over cloudy.
    if illuminance_lx < 1500:
        return "overcast"
    if illuminance_lx < 6000:
        return "cloudy"
    if illuminance_lx < 35000:
        return "partly-cloudy"
    return "sunny"


CONDITION_DESCRIPTIONS = {
    "hurricane": "Hurricane conditions - seek shelter",
    "severe-storm": "Severe storm - dangerous winds",
    "thunderstorm": "Thunderstorm in progress",
    "pre-storm": "Storm approaching",
    "heavy-rain": "Heavy rainfall",
    "rainy": "Rain",
    "drizzle": "Light drizzle",
    "sleet": "Sleet/freezing rain",
    "snow-accumulation": "Heavy snowfall",
    "snowy": "Snow",
    "icy-conditions": "Icy conditions - use caution",
    "misty-morning": "Misty morning",
    "fog": "Foggy",
    "sandstorm": "Sandstorm",
    "african-dust": "Saharan dust event",
    "windy": "Windy",
    "windy-night": "Windy night",
    "smoke": "Smoky conditions",
    "hazy-sun": "Hazy sunshine",
    "hot": "Extreme heat",
    "cold": "Cold",
    "clearing-after-rain": "Clearing after rain",
    "clear-night": "Clear night",
    "overcast-night": "Overcast night",
    "sunrise": "Sunrise",
    "sunset": "Sunset",
    "golden-hour": "Golden hour",
    "overcast": "Overcast",
    "cloudy": "Cloudy",
    "partly-cloudy": "Partly cloudy",
    "sunny": "Sunny",
}

CONDITION_ICONS = {
    "hurricane": "mdi:weather-hurricane",
    "severe-storm": "mdi:weather-lightning",
    "thunderstorm": "mdi:weather-lightning-rainy",
    "pre-storm": "mdi:weather-cloudy-alert",
    "heavy-rain": "mdi:weather-pouring",
    "rainy": "mdi:weather-rainy",
    "drizzle": "mdi:weather-drizzle",
    "sleet": "mdi:weather-snowy-rainy",
    "snow-accumulation": "mdi:weather-snowy-heavy",
    "snowy": "mdi:weather-snowy",
    "icy-conditions": "mdi:snowflake-alert",
    "misty-morning": "mdi:weather-fog",
    "fog": "mdi:weather-fog",
    "sandstorm": "mdi:weather-dust",
    "african-dust": "mdi:weather-dust",
    "windy": "mdi:weather-windy",
    "windy-night": "mdi:weather-windy",
    "hot": "mdi:thermometer-high",
    "cold": "mdi:thermometer-low",
    "clearing-after-rain": "mdi:weather-partly-rainy",
    "clear-night": "mdi:weather-night",
    "overcast-night": "mdi:weather-night-partly-cloudy",
    "sunrise": "mdi:weather-sunset-up",
    "sunset": "mdi:weather-sunset-down",
    "golden-hour": "mdi:weather-sunset",
    "overcast": "mdi:weather-cloudy",
    "cloudy": "mdi:weather-cloudy",
    "partly-cloudy": "mdi:weather-partly-cloudy",
    "sunny": "mdi:weather-sunny",
}

CONDITION_COLORS = {
    "hurricane": "#DC2626",
    "severe-storm": "#991B1B",
    "thunderstorm": "#F87171",
    "pre-storm": "#FB923C",
    "heavy-rain": "#3B82F6",
    "rainy": "#60A5FA",
    "drizzle": "#93C5FD",
    "sleet": "#A5B4FC",
    "snow-accumulation": "#E0E7FF",
    "snowy": "#F1F5F9",
    "icy-conditions": "#BFDBFE",
    "misty-morning": "#D1D5DB",
    "fog": "#9CA3AF",
    "windy": "#A7F3D0",
    "hot": "#F97316",
    "cold": "#7DD3FC",
    "clearing-after-rain": "#86EFAC",
    "clear-night": "#FEF3C7",
    "overcast-night": "#374151",
    "sunrise": "#FDBA74",
    "sunset": "#FB923C",
    "golden-hour": "#FCD34D",
    "overcast": "#94A3B8",
    "cloudy": "#CBD5E1",
    "partly-cloudy": "#E2E8F0",
    "sunny": "#FBBF24",
}


def get_condition_severity(condition: str) -> str:
    """Return severity level for a weather condition."""
    if condition in ("hurricane", "severe-storm"):
        return "critical"
    if condition in ("thunderstorm", "heavy-rain", "icy-conditions"):
        return "warning"
    if condition in ("pre-storm", "sleet", "snow-accumulation", "hot"):
        return "advisory"
    return "normal"


# ---------------------------------------------------------------------------
# Humidity / UV helpers
# ---------------------------------------------------------------------------


def humidity_level(humidity: float) -> str:
    if humidity > 80:
        return "very_humid"
    if humidity > 70:
        return "humid"
    if humidity > 60:
        return "slightly_humid"
    if humidity > 40:
        return "comfortable"
    if humidity > 30:
        return "slightly_dry"
    if humidity > 20:
        return "dry"
    return "very_dry"


def uv_level(uv_index: float) -> str:
    """WMO UV index categories. UV=0 is none (no UV present, e.g. nighttime)."""
    if uv_index <= 0:
        return "none"
    if uv_index >= 11:
        return "extreme"
    if uv_index >= 8:
        return "very_high"
    if uv_index >= 6:
        return "high"
    if uv_index >= 3:
        return "moderate"
    return "low"


def uv_recommendation(uv_index: float) -> str:
    if uv_index <= 0:
        return "No protection needed"
    if uv_index >= 8:
        return "Avoid sun exposure"
    if uv_index >= 6:
        return "Seek shade, wear sunscreen"
    if uv_index >= 3:
        return "Sunscreen recommended"
    return "No protection needed"


def uv_burn_time_minutes(uv_index: float, skin_type: int = 2) -> int:
    if uv_index <= 0:
        return 200
    sensitivity = {1: 67, 2: 100, 3: 133, 4: 167, 5: 200, 6: 240}
    factor = sensitivity.get(skin_type, 100)
    return min(round(factor / (uv_index * 3)), 200)


# ---------------------------------------------------------------------------
# Activity scores
# ---------------------------------------------------------------------------


def compute_fwi(
    ffmc_prev: float,
    dmc_prev: float,
    dc_prev: float,
    temp_c: float,
    rh_pct: float,
    wind_kmh: float,
    rain_24h_mm: float,
    month: int,
) -> dict:
    """Canadian Forest Fire Weather Index (FWI) system - Van Wagner 1987.

    Computes all seven FWI components from yesterday's moisture codes and
    today's noon weather observations.

    Standard initial values (start-of-season): FFMC=85, DMC=6, DC=15.

    Reference:
      Van Wagner, C.E. (1987). Development and structure of the Canadian
      Forest Fire Weather Index System. Forestry Technical Report 35.
      Canadian Forestry Service, Ottawa.

    Args:
        ffmc_prev: Previous day's FFMC (Fine Fuel Moisture Code).
        dmc_prev:  Previous day's DMC (Duff Moisture Code).
        dc_prev:   Previous day's DC (Drought Code).
        temp_c:    Noon temperature (°C).
        rh_pct:    Noon relative humidity (%).
        wind_kmh:  Noon wind speed (km/h).
        rain_24h_mm: 24-hour cumulative rainfall (mm).
        month:     Calendar month (1=January … 12=December), Northern Hemisphere.

    Returns:
        dict with keys: ffmc, dmc, dc, isi, bui, fwi, dsr  (all float, rounded to 1 d.p.)
    """
    T = float(temp_c)
    H = max(0.0, min(100.0, float(rh_pct)))
    W = max(0.0, float(wind_kmh))
    ro = max(0.0, float(rain_24h_mm))
    F0 = float(ffmc_prev)
    P0 = float(dmc_prev)
    D0 = float(dc_prev)
    month_i = max(1, min(12, int(month)))

    # -----------------------------------------------------------------------
    # FFMC - Fine Fuel Moisture Code
    # -----------------------------------------------------------------------
    mo = 147.2 * (101.0 - F0) / (59.5 + F0)

    if ro > 0.5:
        rf = ro - 0.5
        if mo <= 150.0:
            mr = mo + 42.5 * rf * math.exp(-100.0 / (251.0 - mo)) * (1.0 - math.exp(-6.93 / rf))
        else:
            mr = (
                mo
                + 42.5 * rf * math.exp(-100.0 / (251.0 - mo)) * (1.0 - math.exp(-6.93 / rf))
                + 0.0015 * (mo - 150.0) ** 2 * rf**0.5
            )
        mo = min(mr, 250.0)

    Ed = 0.942 * H**0.679 + 11.0 * math.exp((H - 100.0) / 10.0) + 0.18 * (21.1 - T) * (1.0 - math.exp(-0.115 * H))
    Ew = 0.618 * H**0.753 + 10.0 * math.exp((H - 100.0) / 10.0) + 0.18 * (21.1 - T) * (1.0 - math.exp(-0.115 * H))

    if mo > Ed:
        kd = (
            (0.424 * (1.0 - (H / 100.0) ** 1.7) + 0.0694 * W**0.5 * (1.0 - (H / 100.0) ** 8))
            * 0.581
            * math.exp(0.0365 * T)
        )
        m = Ed + (mo - Ed) * 10.0 ** (-kd)
    elif mo < Ew:
        kw = (
            (0.424 * (1.0 - ((100.0 - H) / 100.0) ** 1.7) + 0.0694 * W**0.5 * (1.0 - ((100.0 - H) / 100.0) ** 8))
            * 0.581
            * math.exp(0.0365 * T)
        )
        m = Ew - (Ew - mo) * 10.0 ** (-kw)
    else:
        m = mo

    ffmc = 59.5 * (250.0 - m) / (147.2 + m)
    ffmc = max(0.0, min(101.0, ffmc))

    # -----------------------------------------------------------------------
    # DMC - Duff Moisture Code
    # -----------------------------------------------------------------------
    # Day-length adjustment factors by month (Northern Hemisphere)
    Le = [6.5, 7.5, 9.0, 12.8, 13.9, 13.9, 12.4, 10.9, 9.4, 8.0, 7.0, 6.0]

    if ro > 1.5:
        re = 0.92 * ro - 1.27
        mo_dmc = 20.0 + math.exp(5.6348 - P0 / 43.43)
        if P0 <= 33.0:
            b = 100.0 / (0.5 + 0.3 * P0)
        elif P0 <= 65.0:
            b = 14.0 - 1.3 * math.log(P0)
        else:
            b = 6.2 * math.log(P0) - 17.2
        mr_dmc = mo_dmc + 1000.0 * re / (48.77 + b * re)
        pr = 244.72 - 43.43 * math.log(mr_dmc - 20.0)
        P0 = max(pr, 0.0)

    if T > -1.1:
        K = 1.894 * (T + 1.1) * (100.0 - H) * Le[month_i - 1] * 1e-6
        dmc = P0 + 100.0 * K
    else:
        dmc = P0
    dmc = max(0.0, dmc)

    # -----------------------------------------------------------------------
    # DC - Drought Code
    # -----------------------------------------------------------------------
    # Day-length drying factors by month (Northern Hemisphere)
    Lf = [-1.6, -1.6, -1.6, 0.9, 3.8, 5.8, 6.4, 5.0, 2.4, 0.4, -1.6, -1.6]

    if ro > 2.8:
        rd = 0.83 * ro - 1.27
        Qo = 800.0 * math.exp(-D0 / 400.0)
        Qr = Qo + 3.937 * rd
        Dr = 400.0 * math.log(800.0 / Qr)
        D0 = max(Dr, 0.0)

    V = max(0.0, 0.36 * (T + 2.8) + Lf[month_i - 1]) if T > -2.8 else max(0.0, Lf[month_i - 1])
    dc = D0 + 0.5 * V
    dc = max(0.0, dc)

    # -----------------------------------------------------------------------
    # ISI - Initial Spread Index
    # -----------------------------------------------------------------------
    fm = 147.2 * (101.0 - ffmc) / (59.5 + ffmc)
    ff = 91.9 * math.exp(-0.1386 * fm) * (1.0 + fm**5.31 / 49300000.0)
    isi = 0.208 * ff * math.exp(0.05039 * W)

    # -----------------------------------------------------------------------
    # BUI - Buildup Index
    # -----------------------------------------------------------------------
    if dmc <= 0.4 * dc:
        bui = 0.8 * dmc * dc / (dmc + 0.4 * dc) if (dmc + 0.4 * dc) > 0 else 0.0
    else:
        bui = dmc - (1.0 - 0.8 * dc / (dmc + 0.4 * dc)) * (0.92 + (0.0114 * dmc) ** 1.7)
    bui = max(0.0, bui)

    # -----------------------------------------------------------------------
    # FWI - Fire Weather Index
    # -----------------------------------------------------------------------
    fD = 0.626 * bui**0.809 + 2.0 if bui <= 80.0 else 1000.0 / (25.0 + 108.64 * math.exp(-0.023 * bui))
    B = 0.1 * isi * fD
    S = math.exp(2.72 * (0.434 * math.log(B)) ** 0.647) if B > 1.0 else B
    fwi = S

    # -----------------------------------------------------------------------
    # DSR - Daily Severity Rating
    # -----------------------------------------------------------------------
    dsr = 0.0272 * fwi**1.77

    return {
        "ffmc": round(ffmc, 1),
        "dmc": round(dmc, 1),
        "dc": round(dc, 1),
        "isi": round(isi, 1),
        "bui": round(bui, 1),
        "fwi": round(fwi, 1),
        "dsr": round(dsr, 2),
    }


def fire_risk_score(temp_c: float, humidity: float, wind_speed_ms: float, rain_24h_mm: float) -> float:
    """Simplified fire risk heuristic (0-50 scale).

    IMPORTANT: This is a simplified heuristic inspired by the structure
    of the Canadian FWI (Van Wagner 1987) but does NOT implement the
    full FWI system, which requires daily-accumulated moisture codes
    (FFMC, DMC, DC). Not suitable for operational fire weather decisions.
    Consult official fire services for fire danger ratings.

    Inputs: current temperature, humidity, wind speed, 24h rainfall.
    Higher values = higher fire risk.
    """
    wind_kmh = wind_speed_ms * 3.6
    ffmc_approx = 85 + (temp_c - 20) * 2 - (humidity - 50) / 2
    ffmc_approx = max(40, min(100, round(ffmc_approx)))
    isi_wind = 0.208 * wind_kmh if wind_kmh < 40 else (12 - (60 / wind_kmh))
    isi = 0.208 * isi_wind * ((ffmc_approx - 40) / 20)
    rain_factor = max(rain_24h_mm + 1, 1)
    drought_factor = 1 + (7 / rain_factor)
    return max(0, min(50, round(isi * drought_factor, 1)))


def fire_danger_level(score: float) -> str:
    if score < 5:
        return "Low"
    if score < 12:
        return "Moderate"
    if score < 24:
        return "High"
    if score < 38:
        return "Very High"
    return "Extreme"


# ---------------------------------------------------------------------------
# Stargazing
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Moon phase
# ---------------------------------------------------------------------------


def _julian_day_gregorian(year: int, month: int, day: int) -> float:
    """Julian Day for a Gregorian calendar date at 0h UT."""
    y, m = year, month
    if m <= 2:
        y -= 1
        m += 12
    a = y // 100
    b = 2 - a + (a // 4)
    return int(365.25 * (y + 4716)) + int(30.6001 * (m + 1)) + day + b - 1524.5


def calculate_moon_phase(year: int, month: int, day: int) -> str:
    """Return moon phase label for a given date (UTC). Lightweight approximation."""
    jd = _julian_day_gregorian(year, month, day)
    age = (jd - 2451550.1) % 29.53058867

    if age < 1.85:
        return "new_moon"
    if age < 5.53:
        return "waxing_crescent"
    if age < 9.22:
        return "first_quarter"
    if age < 12.91:
        return "waxing_gibbous"
    if age < 16.61:
        return "full_moon"
    if age < 20.30:
        return "waning_gibbous"
    if age < 23.99:
        return "last_quarter"
    if age < 27.68:
        return "waning_crescent"
    return "new_moon"


# =============================================================================
# DEGREE DAYS  (v0.5.0)
# =============================================================================


# =============================================================================
# EXTRATERRESTRIAL RADIATION & ET₀  (v0.6.0 Hargreaves-Samani)
# =============================================================================


def extraterrestrial_radiation_mj(lat_deg: float, day_of_year: int) -> float:
    """Return extraterrestrial radiation Ra in MJ m⁻² day⁻¹.

    Uses FAO-56 equations 21-24.
    """
    phi = math.radians(lat_deg)
    dr = 1 + 0.033 * math.cos(2 * math.pi * day_of_year / 365)
    delta = 0.409 * math.sin(2 * math.pi * day_of_year / 365 - 1.39)
    ws = math.acos(-math.tan(phi) * math.tan(delta))
    Gsc = 0.0820  # solar constant MJ m⁻² min⁻¹
    Ra = (
        (24 * 60 / math.pi)
        * Gsc
        * dr
        * (ws * math.sin(phi) * math.sin(delta) + math.cos(phi) * math.cos(delta) * math.sin(ws))
    )
    return max(0.0, Ra)


def et0_hargreaves(
    t_max_c: float,
    t_min_c: float,
    t_mean_c: float,
    lat_deg: float,
    day_of_year: int,
) -> float:
    """Calculate reference evapotranspiration ET₀ (mm/day) using Hargreaves-Samani.

    Hargreaves & Samani 1985, validated against Penman-Monteith in FAO-56.
    Accuracy: ±15-20% vs full P-M when solar radiation is unavailable.

    Args:
        t_max_c: Daily max temperature °C
        t_min_c: Daily min temperature °C
        t_mean_c: Daily mean temperature °C (or use (max+min)/2)
        lat_deg: Latitude in decimal degrees
        day_of_year: Day of year (1-365)
    Returns:
        ET₀ in mm/day, or 0.0 if inputs are invalid.
    """
    try:
        if None in (t_max_c, t_min_c, t_mean_c):
            return 0.0
        t_range = max(0.0, t_max_c - t_min_c)
        Ra = extraterrestrial_radiation_mj(lat_deg, day_of_year)
        # Hargreaves-Samani: ET₀ = 0.0023 × Ra × (T_mean + 17.8) × √ΔT
        # Convert Ra from MJ to mm/day equivalent: Ra_mm = Ra / 2.45
        Ra_mm = Ra / 2.45
        et0 = 0.0023 * Ra_mm * (t_mean_c + 17.8) * (t_range**0.5)
        return max(0.0, round(et0, 2))
    except Exception:
        return 0.0


def et0_hourly_estimate(et0_daily_mm: float, hour_utc: int) -> float:
    """Distribute daily ET₀ across hours using a sinusoidal solar curve.

    Assumes ~80 % of daily ET₀ occurs during daylight hours 6-18 UTC.
    Returns mm for the current hour.
    """
    if et0_daily_mm <= 0:
        return 0.0
    if 6 <= hour_utc <= 18:
        daytime_hours = 13
        # Sine curve peaked at noon (hour 12)
        angle = math.pi * (hour_utc - 6) / daytime_hours
        weight = math.sin(angle)
        return round(et0_daily_mm * 0.80 * weight / 6.37, 3)
    return 0.0


# =============================================================================
# METAR PARSING  (v0.5.0)
# =============================================================================


# ===========================================================================
# v0.7.0 - Air Quality helpers
# ===========================================================================

# US EPA AQI breakpoints: (C_low, C_high, AQI_low, AQI_high)
_PM25_BREAKPOINTS = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500),
]

_PM10_BREAKPOINTS = [
    (0, 54, 0, 50),
    (55, 154, 51, 100),
    (155, 254, 101, 150),
    (255, 354, 151, 200),
    (355, 424, 201, 300),
    (425, 504, 301, 400),
    (505, 604, 401, 500),
]


def _aqi_from_breakpoints(c: float, breakpoints: list) -> int | None:
    """Linear interpolation of US EPA AQI from a concentration value."""
    for c_lo, c_hi, aqi_lo, aqi_hi in breakpoints:
        if c_lo <= c <= c_hi:
            return round(((aqi_hi - aqi_lo) / (c_hi - c_lo)) * (c - c_lo) + aqi_lo)
    return 500 if c > breakpoints[-1][1] else None


def calculate_us_aqi(pm2_5: float | None, pm10: float | None) -> int | None:
    """US EPA AQI - highest of PM2.5 and PM10 sub-indices.

    Returns None when both inputs are None.
    Reference: EPA AQI Technical Assistance Document, 2018.
    """
    sub = []
    if pm2_5 is not None:
        v = _aqi_from_breakpoints(float(pm2_5), _PM25_BREAKPOINTS)
        if v is not None:
            sub.append(v)
    if pm10 is not None:
        v = _aqi_from_breakpoints(float(pm10), _PM10_BREAKPOINTS)
        if v is not None:
            sub.append(v)
    return max(sub) if sub else None


def aqi_level(aqi: int) -> str:
    """US EPA AQI category label (i18n key)."""
    if aqi <= 50:
        return "good"
    if aqi <= 100:
        return "moderate"
    if aqi <= 150:
        return "unhealthy_sensitive"
    if aqi <= 200:
        return "unhealthy"
    if aqi <= 300:
        return "very_unhealthy"
    return "hazardous"


def aqi_color(aqi: int) -> str:
    """US EPA AQI colour hex."""
    if aqi <= 50:
        return "#00E400"
    if aqi <= 100:
        return "#FFFF00"
    if aqi <= 150:
        return "#FF7E00"
    if aqi <= 200:
        return "#FF0000"
    if aqi <= 300:
        return "#8F3F97"
    return "#7E0023"


def pollen_level(index: int | None) -> str:
    """Tomorrow.io pollen index (0-5) to level label."""
    if index is None:
        return "unknown"
    labels = ["none", "very_low", "low", "medium", "high", "very_high"]
    return labels[min(int(index), 5)]


def pollen_overall(grass: int | None, tree: int | None, weed: int | None) -> str:
    """Highest single pollen level across all types."""
    vals = [v for v in (grass, tree, weed) if v is not None]
    if not vals:
        return "unknown"
    return pollen_level(max(vals))


# ===========================================================================
# v0.8.0 - Precise moon illumination
# ===========================================================================


def calculate_moon_illumination(year: int, month: int, day: int) -> float:
    """Moon disk illumination fraction (0.0-1.0).

    Uses Jean Meeus "Astronomical Algorithms" Chapter 48 (simplified).
    Accuracy: ~1% for illumination percentage.
    """
    jd = _julian_day_gregorian(year, month, day) + 0.5  # noon

    # Time in Julian centuries from J2000.0
    T = (jd - 2451545.0) / 36525.0

    # Sun's mean longitude (degrees)
    L0 = 280.46646 + 36000.76983 * T
    # Sun's mean anomaly (degrees)
    M_sun = math.radians(357.52911 + 35999.05029 * T - 0.0001537 * T * T)
    # Sun's equation of centre
    C_sun = (1.914602 - 0.004817 * T - 0.000014 * T * T) * math.sin(M_sun)
    C_sun += (0.019993 - 0.000101 * T) * math.sin(2 * M_sun)
    C_sun += 0.000289 * math.sin(3 * M_sun)
    # Sun's true longitude
    sun_lon = L0 + C_sun

    # Moon's mean longitude
    moon_L = 218.3165 + 481267.8813 * T
    # Moon's mean anomaly
    M_moon = math.radians(134.9634 + 477198.8676 * T)
    # Moon's argument of latitude
    F_moon = math.radians(93.2721 + 483202.0175 * T)

    # Moon's longitude (simplified)
    moon_lon = (
        moon_L
        + 6.2886 * math.sin(M_moon)
        + 1.2740 * math.sin(2 * math.radians(moon_L) - M_moon)
        + 0.6583 * math.sin(2 * math.radians(moon_L))
        + 0.2136 * math.sin(2 * M_moon)
        - 0.1851 * math.sin(M_sun)
        - 0.1143 * math.sin(2 * F_moon)
    )

    # Elongation angle between moon and sun
    elong = (moon_lon - sun_lon) % 360.0
    # Illumination fraction
    illumination = (1 - math.cos(math.radians(elong))) / 2
    return round(max(0.0, min(1.0, illumination)), 3)


def moon_phase_days(year: int, month: int, day: int) -> float:
    """Days since last new moon (synodic age 0-29.53)."""
    jd = _julian_day_gregorian(year, month, day) + 0.5
    # Reference new moon: 2000-01-06 18:14 UTC = JD 2451550.259
    synodic = 29.53058867
    age = (jd - 2451550.259) % synodic
    return round(age, 2)


def moon_next_phase_days(year: int, month: int, day: int, target_age: float) -> float:
    """Days until next occurrence of a moon phase (by synodic age target).

    target_age: 0 = new, 7.38 = first quarter, 14.77 = full, 22.15 = last quarter
    """
    current_age = moon_phase_days(year, month, day)
    synodic = 29.53058867
    diff = (target_age - current_age) % synodic
    return round(diff, 1)


def moon_phase_from_age(age_days: float) -> str:
    """Determine phase name from synodic age (0-29.53 days)."""
    synodic = 29.53058867
    pct = age_days / synodic
    if pct < 0.035 or pct >= 0.965:
        return "new_moon"
    if pct < 0.215:
        return "waxing_crescent"
    if pct < 0.285:
        return "first_quarter"
    if pct < 0.465:
        return "waxing_gibbous"
    if pct < 0.535:
        return "full_moon"
    if pct < 0.715:
        return "waning_gibbous"
    if pct < 0.785:
        return "last_quarter"
    return "waning_crescent"


MOON_PHASE_NAMES = {
    "new_moon": "New Moon",
    "waxing_crescent": "Waxing Crescent",
    "first_quarter": "First Quarter",
    "waxing_gibbous": "Waxing Gibbous",
    "full_moon": "Full Moon",
    "waning_gibbous": "Waning Gibbous",
    "last_quarter": "Last Quarter",
    "waning_crescent": "Waning Crescent",
}

MOON_PHASE_EMOJIS = {
    "new_moon": "🌑",
    "waxing_crescent": "🌒",
    "first_quarter": "🌓",
    "waxing_gibbous": "🌔",
    "full_moon": "🌕",
    "waning_gibbous": "🌖",
    "last_quarter": "🌗",
    "waning_crescent": "🌘",
}


def moon_display_string(phase_key: str, illumination_pct: float) -> str:
    """Human-readable moon display: emoji + name + illumination."""
    emoji = MOON_PHASE_EMOJIS.get(phase_key, "🌙")
    name = MOON_PHASE_NAMES.get(phase_key, phase_key.replace("_", " ").title())
    return f"{emoji} {name} ({illumination_pct:.0f}%)"


# ===========================================================================
# v0.9.0 - Penman-Monteith FAO-56 ET₀
# ===========================================================================


def et0_penman_monteith(
    temp_mean_c: float,
    temp_max_c: float,
    temp_min_c: float,
    humidity: float,
    wind_speed_ms: float,
    solar_radiation_wm2: float,
    elevation_m: float = 0.0,
    day_of_year: int = 180,
) -> float:
    """Reference evapotranspiration via FAO-56 Penman-Monteith method.

    Parameters
    ----------
    temp_mean_c : float
        Mean daily air temperature (°C).
    temp_max_c : float
        Daily maximum temperature (°C). Pass mean if only mean available.
    temp_min_c : float
        Daily minimum temperature (°C). Pass mean if only mean available.
    humidity : float
        Relative humidity (%).
    wind_speed_ms : float
        Wind speed at sensor height, converted to 2 m internally (m/s).
    solar_radiation_wm2 : float
        Incoming solar (shortwave) radiation (W/m²), daily mean.
    elevation_m : float
        Station elevation above sea-level (m).
    day_of_year : int
        Julian day of year (1-365), used for net longwave correction.

    Returns
    -------
    float
        ET₀ in mm/day.  Accuracy: ~5-10% vs lysimeter measurements.

    References
    ----------
    Allen et al. 1998: "Crop Evapotranspiration - Guidelines for Computing
    Crop Water Requirements", FAO Irrigation and Drainage Paper 56.
    """
    if any(v is None for v in (temp_mean_c, humidity, wind_speed_ms, solar_radiation_wm2)):
        return 0.0

    T = float(temp_mean_c)
    T_max = float(temp_max_c)
    T_min = float(temp_min_c)
    RH = float(humidity)
    u_z = float(wind_speed_ms)
    Rs_wm2 = float(solar_radiation_wm2)
    z = float(elevation_m)
    doy = int(day_of_year)

    # Convert Rs from W/m² (mean daily) to MJ/m²/d
    Rs = Rs_wm2 * 86400 / 1e6

    # Psychrometric constant γ (kPa/°C)  FAO56 Eq 8
    P = 101.3 * ((293.0 - 0.0065 * z) / 293.0) ** 5.26
    gamma = 0.000665 * P

    # Slope of saturation vapor pressure curve Δ (kPa/°C)  FAO56 Eq 13
    delta = 4098 * (0.6108 * math.exp((17.27 * T) / (T + 237.3))) / ((T + 237.3) ** 2)

    # Saturation vapor pressure (kPa)  FAO56 Eq 11-12
    es_max = 0.6108 * math.exp((17.27 * T_max) / (T_max + 237.3))
    es_min = 0.6108 * math.exp((17.27 * T_min) / (T_min + 237.3))
    es = (es_max + es_min) / 2.0

    # Actual vapor pressure (kPa)  FAO56 Eq 17
    ea = es * (RH / 100.0)

    # Net shortwave radiation Rns  FAO56 Eq 38 (α=0.23 for reference grass)
    Rns = (1 - 0.23) * Rs

    # Extraterrestrial radiation Ra for net longwave estimate  FAO56 Eq 21
    _phi = math.radians(max(-90, min(90, z)))  # use elevation as lat proxy - caller should pass lat
    # Simplified Ra (mean for mid-latitudes when lat not separately passed)
    Ra = extraterrestrial_radiation_mj(37.0, doy)  # fallback 37°N

    # Clear-sky solar radiation Rso  FAO56 Eq 37
    Rso = (0.75 + 2e-5 * z) * Ra

    # Net longwave radiation Rnl  FAO56 Eq 39
    sigma = 4.903e-9  # Stefan-Boltzmann in MJ K⁻⁴ m⁻² d⁻¹
    T_max_K = T_max + 273.16
    T_min_K = T_min + 273.16
    Rs_Rso = min(Rs / Rso, 1.0) if Rso > 0 else 1.0
    Rnl = sigma * ((T_max_K**4 + T_min_K**4) / 2) * (0.34 - 0.14 * math.sqrt(max(ea, 0.001))) * (1.35 * Rs_Rso - 0.35)

    # Net radiation Rn  FAO56 Eq 40
    Rn = Rns - Rnl

    # Wind speed at 2 m height  FAO56 Eq 47 (assuming 10 m sensor)
    u2 = u_z * (4.87 / math.log(67.8 * 10 - 5.42))

    # FAO56 Eq 6 - Penman-Monteith
    numerator = 0.408 * delta * Rn + gamma * (900 / (T + 273)) * u2 * (es - ea)
    denominator = delta + gamma * (1 + 0.34 * u2)
    et0 = numerator / denominator if denominator > 0 else 0.0
    return round(max(0.0, et0), 3)


# =============================================================================
# v1.2.0 - New meteorological algorithms
# =============================================================================


def fog_probability(
    temp_c: float,
    dew_c: float,
    wind_ms: float,
    rain_rate_mmph: float,
    is_night: bool,
) -> tuple[float, str]:
    """Estimate fog formation probability (0-100 %) and risk level.

    Based on dew-point depression, wind speed, time of day, and rain.
    Returns (probability_pct, risk_label).
    """
    depression = temp_c - dew_c  # °C; approaches 0 as RH→100%

    # Base probability from dew-point depression
    if depression > 4.0:
        base = 0.0
    elif depression <= 0.0:
        base = 80.0
    else:
        base = 80.0 * (1.0 - depression / 4.0)

    # Wind penalty: fog disperses in wind above 2 m/s
    wind_penalty = max(0.0, (wind_ms - 2.0) * 15.0)

    # Night / dawn bonus (radiative cooling)
    night_bonus = 10.0 if is_night else 0.0

    # Rain penalty (precipitation clears fog droplets)
    rain_penalty = 40.0 if rain_rate_mmph > 0.2 else 0.0

    prob = max(0.0, min(100.0, base - wind_penalty + night_bonus - rain_penalty))

    if prob >= 75.0:
        label = "probable"
    elif prob >= 50.0:
        label = "likely"
    elif prob >= 20.0:
        label = "possible"
    else:
        label = "unlikely"

    return round(prob, 1), label


def thunderstorm_risk_index(
    temp_c: float,
    dew_c: float,
    pressure_trend_3h: float,
    wind_ms: float,
    wind_ms_1h_ago: float | None,
    lux_current: float | None,
    lux_1h_ago: float | None,
    is_day: bool,
) -> tuple[int, str, list[str]]:
    """Surface-proxy thunderstorm risk index (0-100) and level.

    Returns (index, level, contributing_factors_list).
    NOTE: This is a surface heuristic only, not a true stability index.
          It has no knowledge of upper-level lapse rates or wind shear.
    """
    score = 0.0
    factors: list[str] = []

    # 1. Temperature-dew point gap (smaller gap → more instability/moisture)
    td_gap = temp_c - dew_c
    if td_gap < 3.0 and temp_c > 18.0:
        score += 25.0
        factors.append("High surface moisture (T-Td < 3°C)")
    elif td_gap < 6.0 and temp_c > 20.0:
        score += 12.0
        factors.append("Moderate surface moisture")

    # 2. Surface temperature (convective potential requires heat)
    if temp_c > 30.0:
        score += 20.0
        factors.append("High surface temperature (>30°C)")
    elif temp_c > 25.0:
        score += 10.0
        factors.append("Warm surface temperature (>25°C)")

    # 3. Rapid pressure fall (synoptic forcing / cold front approach)
    if pressure_trend_3h < -1.6:
        score += 25.0
        factors.append("Rapid pressure fall (>1.6 hPa/h)")
    elif pressure_trend_3h < -0.8:
        score += 12.0
        factors.append("Pressure falling (>0.8 hPa/h)")

    # 4. Wind speed increase (surface convergence)
    if wind_ms_1h_ago is not None and wind_ms > wind_ms_1h_ago + 3.0:
        score += 15.0
        factors.append("Wind speed increasing rapidly")

    # 5. Sudden illuminance drop (anvil shadow / cumulonimbus approach)
    if is_day and lux_current is not None and lux_1h_ago is not None and lux_1h_ago > 5000:
        lux_drop_pct = (lux_1h_ago - lux_current) / lux_1h_ago * 100.0
        if lux_drop_pct > 60.0:
            score += 15.0
            factors.append(f"Illuminance drop {lux_drop_pct:.0f}% in 1h (possible anvil shadow)")

    index = max(0, min(100, round(score)))

    if index >= 70:
        level = "high"
    elif index >= 45:
        level = "elevated"
    elif index >= 25:
        level = "moderate"
    elif index >= 10:
        level = "low"
    else:
        level = "negligible"

    return index, level, factors


# ---------------------------------------------------------------------------
# Drift detection (C1) - simple linear regression slope
# ---------------------------------------------------------------------------


def linear_regression_slope(values: list[float], times_h: list[float]) -> tuple[float, float]:
    """Return (slope_per_hour, r_squared) via least-squares.

    Args:
        values: observed values (e.g. temperature readings)
        times_h: corresponding elapsed hours from first observation
    Returns:
        (slope, r_squared) - slope in units/hour
    """
    n = len(values)
    if n < 3:
        return 0.0, 0.0
    sx = sum(times_h)
    sy = sum(values)
    sxy = sum(x * y for x, y in zip(times_h, values, strict=False))
    sxx = sum(x * x for x in times_h)
    denom = n * sxx - sx * sx
    if abs(denom) < 1e-9:
        return 0.0, 0.0
    slope = (n * sxy - sx * sy) / denom
    intercept = (sy - slope * sx) / n
    # R² = 1 - SS_res / SS_tot
    y_mean = sy / n
    ss_tot = sum((y - y_mean) ** 2 for y in values)
    ss_res = sum((y - (slope * x + intercept)) ** 2 for x, y in zip(times_h, values, strict=False))
    r_sq = 1.0 - ss_res / ss_tot if ss_tot > 1e-9 else 0.0
    return round(slope, 6), round(max(0.0, r_sq), 4)


# ---------------------------------------------------------------------------
# Cross-sensor consistency checks (C2) - stateless
# ---------------------------------------------------------------------------


def cross_sensor_consistency_flags(
    uv: float | None,
    lux: float | None,
    wind_ms: float | None,
    gust_ms: float | None,
    temp_c: float | None,
    dew_c: float | None,
    pressure_history_stable: bool,
    rain_rate: float,
    rain_total_increasing: bool,
) -> list[dict]:
    """Return list of consistency violation dicts (empty list = all clear)."""
    flags = []

    # UV > 6 but illuminance < 20,000 lx (midday sun → expect high lux)
    if uv is not None and lux is not None and float(uv) > 6.0 and float(lux) < 20000:
        flags.append(
            {
                "check": "uv_lux_mismatch",
                "sensors": ["uv_index", "illuminance"],
                "detail": f"UV={uv:.1f} but lux={lux:.0f} (expected >20000 lx at UV>6)",
            }
        )

    # Wind gust below wind speed (physically impossible)
    if wind_ms is not None and gust_ms is not None and float(gust_ms) < float(wind_ms) * 0.9:
        flags.append(
            {
                "check": "gust_below_wind",
                "sensors": ["wind_speed", "wind_gust"],
                "detail": f"Gust {gust_ms:.1f} < wind {wind_ms:.1f} m/s",
            }
        )

    # Dew point > temperature (thermodynamically impossible)
    if temp_c is not None and dew_c is not None and float(dew_c) > float(temp_c) + 0.5:
        flags.append(
            {
                "check": "dewpoint_exceeds_temperature",
                "sensors": ["temperature", "dew_point"],
                "detail": f"Dew point {dew_c:.1f}°C > temperature {temp_c:.1f}°C",
            }
        )

    # Pressure stuck but wind is active (barometer malfunction)
    if pressure_history_stable:
        flags.append(
            {
                "check": "pressure_stuck",
                "sensors": ["pressure"],
                "detail": "Pressure unchanged (±0.1 hPa) for >8h with wind present",
            }
        )

    # Rain rate > 0 but total not incrementing
    if rain_rate > 0.1 and not rain_total_increasing:
        flags.append(
            {
                "check": "rain_rate_total_mismatch",
                "sensors": ["rain_rate", "rain_total"],
                "detail": "Rain rate non-zero but cumulative total not incrementing",
            }
        )

    return flags


# ===========================================================================
# v1.7.0 - Precipitation nowcast (from Open-Meteo 15-minute buckets)
# ===========================================================================

# Rain-rate intensity bands (mm/h), standard meteorological classification.
NOWCAST_LIGHT_MMH = 2.5
NOWCAST_HEAVY_MMH = 7.6
# A 15-minute bucket counts as "wet" at or above this many mm.
NOWCAST_BUCKET_THRESHOLD_MM = 0.1


def derive_nowcast(
    times: list[str],
    precip: list[float | None],
    now: datetime,
    threshold_mm: float = NOWCAST_BUCKET_THRESHOLD_MM,
) -> dict:
    """Derive a precipitation nowcast from 15-minute buckets.

    Parameters
    ----------
    times : list[str]
        ISO timestamps (local, naive) at the START of each 15-minute bucket,
        as returned by Open-Meteo ``minutely_15`` with ``timezone=auto``.
    precip : list[float | None]
        Precipitation total (mm) for each corresponding bucket.
    now : datetime
        Reference time (naive local). Tz-aware values are coerced to naive.
    threshold_mm : float
        Minimum mm in a 15-minute bucket to count as rain.

    Returns
    -------
    dict with keys:
        raining_now (bool), minutes_until_rain (int | None),
        minutes_until_dry (int | None), next_60min_mm (float),
        peak_rate_mmph (float), intensity (str: none/light/moderate/heavy).

    A None ``minutes_until_*`` means "not within the available window".
    """
    if now.tzinfo is not None:
        now = now.replace(tzinfo=None)

    # Parse buckets into (start_dt, mm) pairs, skipping malformed/missing.
    buckets: list[tuple[datetime, float]] = []
    for i, t in enumerate(times or []):
        if i >= len(precip or []):
            break
        p = precip[i]
        if p is None:
            p = 0.0
        try:
            start = datetime.fromisoformat(str(t))
        except (ValueError, TypeError):
            continue
        if start.tzinfo is not None:
            start = start.replace(tzinfo=None)
        buckets.append((start, float(p)))

    result = {
        "raining_now": False,
        "minutes_until_rain": None,
        "minutes_until_dry": None,
        "next_60min_mm": 0.0,
        "peak_rate_mmph": 0.0,
        "intensity": "none",
    }
    if not buckets:
        return result

    BUCKET_MIN = 15

    def _minutes_from_now(dt_: datetime) -> int:
        return int(round((dt_ - now).total_seconds() / 60.0))

    # Current bucket = the one whose [start, start+15min) window contains now.
    raining_now = False
    for start, mm in buckets:
        if start <= now < start + timedelta(minutes=BUCKET_MIN):
            raining_now = mm >= threshold_mm
            break
    result["raining_now"] = raining_now

    # Future buckets (start at or after now), in chronological order.
    future = [(s, mm) for (s, mm) in buckets if s >= now - timedelta(minutes=BUCKET_MIN)]

    # next 60 minutes: buckets starting within [now, now+60min)
    next_hour = [(s, mm) for (s, mm) in buckets if now <= s < now + timedelta(minutes=60)]
    next_60 = round(sum(mm for _, mm in next_hour), 2)
    # Only buckets that clear the rain threshold drive intensity, so a trace
    # (e.g. 0.05 mm) does not register as "light".
    peak_bucket = max((mm for _, mm in next_hour if mm >= threshold_mm), default=0.0)
    peak_rate = round(peak_bucket * (60.0 / BUCKET_MIN), 2)  # 15-min mm -> mm/h
    result["next_60min_mm"] = next_60
    result["peak_rate_mmph"] = peak_rate
    if peak_rate <= 0.0:
        result["intensity"] = "none"
    elif peak_rate < NOWCAST_LIGHT_MMH:
        result["intensity"] = "light"
    elif peak_rate < NOWCAST_HEAVY_MMH:
        result["intensity"] = "moderate"
    else:
        result["intensity"] = "heavy"

    if raining_now:
        result["minutes_until_rain"] = 0
        # First future bucket that is dry => when it stops.
        for start, mm in future:
            if start >= now and mm < threshold_mm:
                result["minutes_until_dry"] = max(0, _minutes_from_now(start))
                break
    else:
        # First future bucket that is wet => when it starts.
        for start, mm in future:
            if start >= now and mm >= threshold_mm:
                result["minutes_until_rain"] = max(0, _minutes_from_now(start))
                break

    return result
