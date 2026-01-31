"""Weather utility functions for unit conversions and calculations."""

from datetime import datetime
from typing import Optional, cast

from homeassistant.core import HomeAssistant

from .const import (
    PRESSURE_HPA_UNIT,
    PRESSURE_INHG_UNIT,
    PRESSURE_PSI_UNIT,
    PRESSURE_PSI_UNITS,
)


def convert_to_celsius(temp_f: Optional[float]) -> Optional[float]:
    """Convert Fahrenheit to Celsius.

    Formula: (F - 32) * 5/9
    Reference: https://www.nist.gov/pml/weights-and-measures/si-units-temperature
    """
    if temp_f is None:
        return None
    return round((temp_f - 32) * 5 / 9, 1)


def convert_to_fahrenheit(temp_c: Optional[float]) -> Optional[float]:
    """Convert Celsius to Fahrenheit.

    Formula: (C * 9/5) + 32
    Reference: https://www.nist.gov/pml/weights-and-measures/si-units-temperature
    """
    if temp_c is None:
        return None
    return round((temp_c * 9 / 5) + 32, 1)


def convert_to_hpa(
    pressure: Optional[float], unit: str = PRESSURE_INHG_UNIT
) -> Optional[float]:
    """Convert pressure to hPa.

    Supported units:
    - inHg (default): Formula: inHg * 33.8639
      Reference: https://www.weather.gov/media/epz/wxcalc/pressureConversion.pdf
    - psi: Formula: PSI * 68.9476
      Reference: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8
    """
    if pressure is None:
        return None

    if unit.lower() in PRESSURE_PSI_UNITS:
        return round(pressure * 68.9476, 1)

    # Default to inHg
    return round(pressure * 33.8639, 1)


def convert_to_inhg(
    pressure: Optional[float], unit: str = PRESSURE_HPA_UNIT
) -> Optional[float]:
    """Convert pressure to inches of mercury.

    Supported units:
    - hPa (default): Formula: hPa / 33.8639
      Reference: https://www.weather.gov/media/epz/wxcalc/pressureConversion.pdf
    - psi: Converts PSI -> hPa -> inHg.
      Reference: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8
    """
    if pressure is None:
        return None

    if unit.lower() in PRESSURE_PSI_UNITS:
        # Convert PSI -> hPa -> inHg
        hpa = convert_to_hpa(pressure, unit=PRESSURE_PSI_UNIT)
        if hpa is None:
            return None
        return convert_to_inhg(hpa, unit=PRESSURE_HPA_UNIT)

    # Default to hPa
    return round(pressure / 33.8639, 2)


def convert_to_kmh(speed_mph: Optional[float]) -> Optional[float]:
    """Convert miles per hour to kilometers per hour.

    Formula: mph * 1.60934
    Reference: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8
    """
    if speed_mph is None:
        return None
    return round(speed_mph * 1.60934, 1)


def convert_to_mph(speed_kmh: Optional[float]) -> Optional[float]:
    """Convert kilometers per hour to miles per hour.

    Formula: km/h / 1.60934
    Reference: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8
    """
    if speed_kmh is None:
        return None
    return round(speed_kmh / 1.60934, 1)


def convert_ms_to_mph(speed_ms: Optional[float]) -> Optional[float]:
    """Convert meters per second to miles per hour.

    Formula: m/s * 2.23694
    Reference: https://www.weather.gov/media/epz/wxcalc/windConversion.pdf
    """
    if speed_ms is None:
        return None
    return round(speed_ms / 0.44704, 1)


def convert_altitude_to_meters(
    altitude: Optional[float], is_imperial: bool = False
) -> Optional[float]:
    """Convert altitude to meters if it's in feet.

    Formula: ft * 0.3048
    Reference: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8
    """
    if altitude is None:
        return None
    if is_imperial:
        return round(altitude * 0.3048, 1)  # 1 foot = 0.3048 meters
    return round(altitude, 1)


def convert_precipitation_rate(
    rain_rate: Optional[float], unit: Optional[str]
) -> Optional[float]:
    """Convert precipitation rate to mm/h.

    Formula: in/hr * 25.4
    Reference: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8
    """
    if rain_rate is None:
        return None

    try:
        rain_rate = float(rain_rate)
    except (ValueError, TypeError):
        return None

    if unit is None:
        # Assume mm/h if no unit specified
        return round(rain_rate, 1)

    # Convert to mm/h based on input unit
    if unit.lower() in ["in/h", "in/hr", "inh", "inch/h", "inches/h"]:
        return round(rain_rate * 25.4, 1)  # inches to mm
    elif unit.lower() in ["mm/h", "mmh", "mm/hr"]:
        return round(rain_rate, 1)
    else:
        # Unknown unit, assume mm/h
        return round(rain_rate, 1)


def calculate_heat_index(temp_f: float, humidity: float) -> Optional[float]:
    """Calculate Heat Index based on NOAA equation.

    Uses the Rothfusz regression.

    Formula (Simple): 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094))
    Formula (Regression): -42.379 + 2.049T + 10.14R - 0.224TR - 6.83e-3T^2 - 5.48e-2R^2 + 1.22e-3T^2R + 8.52e-4TR^2 - 1.99e-6T^2R^2
    Reference: https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
    """
    if temp_f is None or humidity is None:
        return None

    # NOAA's formula is only valid for temps >= 80F
    if temp_f < 80:
        return temp_f

    # Simple formula first
    hi = 0.5 * (temp_f + 61.0 + ((temp_f - 68.0) * 1.2) + (humidity * 0.094))

    # If simple formula result is >= 80, use full regression
    if hi >= 80:
        hi = (
            -42.379
            + 2.04901523 * temp_f
            + 10.14333127 * humidity
            - 0.22475541 * temp_f * humidity
            - 0.00683783 * temp_f * temp_f
            - 0.05481717 * humidity * humidity
            + 0.00122874 * temp_f * temp_f * humidity
            + 0.00085282 * temp_f * humidity * humidity
            - 0.00000199 * temp_f * temp_f * humidity * humidity
        )

        # Adjustments
        if humidity < 13 and 80 <= temp_f <= 112:
            hi -= ((13 - humidity) / 4) * ((17 - abs(temp_f - 95)) / 17) ** 0.5
        elif humidity > 85 and 80 <= temp_f <= 87:
            hi += ((humidity - 85) / 10) * ((87 - temp_f) / 5)

    return round(hi, 1)


def calculate_wind_chill(temp_f: float, wind_speed_mph: float) -> Optional[float]:
    """Calculate Wind Chill based on NOAA equation.

    Formula: 35.74 + 0.6215T - 35.75(V^0.16) + 0.4275T(V^0.16)
    Reference: https://www.weather.gov/media/epz/wxcalc/windChill.pdf
    """
    if temp_f is None or wind_speed_mph is None:
        return None

    # Wind chill is only defined for temps <= 50F and wind > 3 mph
    if temp_f > 50 or wind_speed_mph <= 3:
        return temp_f

    wc = (
        35.74
        + 0.6215 * temp_f
        - 35.75 * (wind_speed_mph**0.16)
        + 0.4275 * temp_f * (wind_speed_mph**0.16)
    )

    return round(wc, 1)


def calculate_apparent_temperature(
    temp: Optional[float],
    humidity: Optional[float],
    wind_speed: Optional[float],
    temp_unit: str = "F",
    wind_unit: str = "mph",
) -> Optional[float]:
    """Calculate apparent temperature (Feels Like).

    Combines Heat Index and Wind Chill based on NOAA/NWS thresholds.

    - Temps >= 80F: Heat Index (https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml)
    - Temps <= 50F: Wind Chill (https://www.weather.gov/media/epz/wxcalc/windChill.pdf)
    - Reference: https://www.weather.gov/bgm/forecast_terms (Apparent Temperature)

    Supports input in C or F, and mph, km/h, or m/s for wind.
    Returns result in the same unit as temp_unit.
    """
    if temp is None:
        return None

    # Normalize inputs to Imperial (Fahrenheit/mph) for calculation
    # The NOAA formulas require Imperial units.
    temp_f: float = temp
    if temp_unit.lower() in ["c", "celsius", "°c"]:
        temp_f = cast(float, convert_to_fahrenheit(temp))

    wind_speed_mph: Optional[float] = wind_speed
    if wind_speed is not None:
        if wind_unit.lower() in ["km/h", "kmh", "kph"]:
            wind_speed_mph = wind_speed / 1.60934
        elif wind_unit.lower() in ["m/s", "ms"]:
            wind_speed_mph = wind_speed * 2.23694

    apparent_temp_f: Optional[float] = temp_f

    # Wind Chill
    if temp_f <= 50 and wind_speed_mph is not None and wind_speed_mph > 3:
        apparent_temp_f = calculate_wind_chill(temp_f, wind_speed_mph)
    # Heat Index
    elif temp_f >= 80 and humidity is not None:
        apparent_temp_f = calculate_heat_index(temp_f, humidity)

    if apparent_temp_f is None:
        return None

    # Return in requested unit
    if temp_unit.lower() in ["c", "celsius", "°c"]:
        return cast(float, convert_to_celsius(apparent_temp_f))

    return round(apparent_temp_f, 1)


def get_sun_times(hass: HomeAssistant) -> tuple[datetime | None, datetime | None]:
    """Get sunrise and sunset times from the sun.sun entity.

    Args:
        hass: Home Assistant instance

    Returns:
        tuple: (sunrise_time, sunset_time) as datetime objects, or (None, None) if unavailable
    """
    try:
        sun_state = hass.states.get("sun.sun")
        if sun_state and sun_state.attributes:
            next_rising = sun_state.attributes.get("next_rising")
            next_setting = sun_state.attributes.get("next_setting")

            sunrise_time = None
            sunset_time = None

            if next_rising:
                try:
                    sunrise_time = datetime.fromisoformat(
                        next_rising.replace("Z", "+00:00")
                    )
                except (ValueError, AttributeError):
                    pass

            if next_setting:
                try:
                    sunset_time = datetime.fromisoformat(
                        next_setting.replace("Z", "+00:00")
                    )
                except (ValueError, AttributeError):
                    pass

            return sunrise_time, sunset_time
    except (AttributeError, KeyError, TypeError):
        pass

    return None, None


def is_forecast_hour_daytime(
    forecast_time: datetime,
    sunrise_time: datetime | None,
    sunset_time: datetime | None,
) -> bool:
    """Determine if a forecast hour is daytime using sunrise/sunset data.

    Falls back to hardcoded 6 AM/6 PM times if sunrise/sunset data is unavailable
    or if forecast is after the provided sunset date.

    Args:
        forecast_time: The datetime of the forecast hour
        sunrise_time: Sunrise time from sun.sun entity (can be None)
        sunset_time: Sunset time from sun.sun entity (can be None)

    Returns:
        bool: True if the forecast hour is daytime, False if nighttime
    """
    if sunrise_time and sunset_time:
        # Handle timezone awareness mismatches
        if forecast_time.tzinfo is None and sunrise_time.tzinfo is not None:
            # Make forecast_time timezone-aware to match sunrise/sunset
            forecast_time = forecast_time.replace(tzinfo=sunrise_time.tzinfo)
        elif forecast_time.tzinfo is not None and sunrise_time.tzinfo is None:
            # Make sunrise/sunset timezone-aware to match forecast_time
            sunrise_time = sunrise_time.replace(tzinfo=forecast_time.tzinfo)
            sunset_time = sunset_time.replace(tzinfo=forecast_time.tzinfo)

        # Check if forecast_time is on a date after sunset date
        # If forecast is after sunset date, we don't have valid data for that day, so use fallback
        forecast_date = forecast_time.date() if hasattr(forecast_time, "date") else None
        sunset_date = sunset_time.date() if hasattr(sunset_time, "date") else None

        if forecast_date and sunset_date and forecast_date > sunset_date:
            # Forecast is after the provided sunset date - use fallback
            return 6 <= forecast_time.hour < 18

        # If sunrise is after sunset, it means we are currently in the day cycle
        # where the next sunrise is tomorrow and next sunset is today.
        if sunrise_time > sunset_time:
            return forecast_time < sunset_time or forecast_time >= sunrise_time

        # If both are offset-naive or both are offset-aware, compare directly
        return sunrise_time <= forecast_time < sunset_time
    else:
        # Fallback to hardcoded times (6 AM to 6 PM)
        return 6 <= forecast_time.hour < 18
