"""
Weather calculation functions for HA WeatherSense.

@license: CC BY-NC-SA 4.0 International
@author: SMKRV
@github: https://github.com/smkrv/ha-weathersense
@source: https://github.com/smkrv/ha-weathersense
"""
import logging
import math
from datetime import datetime
from typing import Optional, Tuple

_LOGGER = logging.getLogger(__name__)

# Constants for calculations
STANDARD_PRESSURE = 101.3  # kPa


def calculate_heat_index(temperature: float, humidity: float) -> float:
    """
    Calculate Heat Index (HI) for high temperatures (≥ 27°C).

    Uses the NWS algorithm with adjustments for edge cases.
    """
    t = temperature
    rh = humidity

    # Simple formula for lower humidity or temperature conditions
    if rh < 40 or t < 27:
        hi = 0.5 * (t + 61.0 + ((t - 68.0) * 1.2) + (rh * 0.094))
        return (hi + t) / 2  # Average with actual temperature for more reasonable results

    # Full Rothfusz regression formula
    hi = -42.379
    hi += 2.04901523 * t
    hi += 10.14333127 * rh
    hi -= 0.22475541 * t * rh
    hi -= 0.00683783 * t * t
    hi -= 0.05481717 * rh * rh
    hi += 0.00122874 * t * t * rh
    hi += 0.00085282 * t * rh * rh
    hi -= 0.00000199 * t * t * rh * rh

    # Adjustments for extreme conditions
    if rh < 13 and t >= 27 and t <= 37:
        adjustment = ((13 - rh) / 4) * math.sqrt((17 - abs(t - 95)) / 17)
        hi -= adjustment
    elif rh > 85 and t >= 27 and t <= 31:
        adjustment = ((rh - 85) / 10) * ((31 - t) / 4)
        hi += adjustment

    # Sanity check - heat index should not be unreasonably high
    if hi > 70:  # Extremely high value in Celsius
        hi = min(hi, t + 25)  # Limit to 25 degrees above actual temperature

    return hi


def calculate_wind_chill(temperature: float, wind_speed: float) -> float:
    """Calculate Wind Chill Temperature (WCT) for low temperatures (≤ 10°C)."""
    t = temperature
    v = max(wind_speed, 1.34)  # Wind speed must be at least 1.34 m/s

    wct = 13.12
    wct += 0.6215 * t
    wct -= 11.37 * math.pow(v, 0.16)
    wct += 0.3965 * t * math.pow(v, 0.16)

    return wct


def calculate_steadman_apparent_temp(
    temperature: float, humidity: float, wind_speed: float
) -> float:
    """Calculate Steadman Apparent Temperature for universal range."""
    t = temperature
    v = wind_speed

    # Calculate vapor pressure (e) in kPa
    e = (humidity / 100) * 6.105 * math.exp((17.27 * t) / (237.7 + t))

    at = t + 0.33 * e - 0.70 * v - 4.00
    return at


def apply_solar_correction(
    feels_like: float, time_of_day: Optional[datetime] = None, cloudiness: float = 0
) -> float:
    """Apply solar radiation correction based on time of day and cloudiness."""
    if time_of_day is None:
        time_of_day = datetime.now()

    hour = time_of_day.hour

    # Simple day/night model
    if 10 <= hour <= 16:  # Daytime (10 AM - 4 PM)
        # Adjust for cloudiness (0 = clear sky, 100 = fully cloudy)
        solar_factor = 8 * (1 - (cloudiness / 100))
        return feels_like + solar_factor
    elif 22 <= hour or hour <= 4:  # Night (10 PM - 4 AM)
        return feels_like - 2
    else:  # Dawn/Dusk
        return feels_like

    return feels_like


def apply_pressure_correction(feels_like: float, pressure: Optional[float] = None) -> float:
    """Apply pressure correction to feels-like temperature."""
    if pressure is None or pressure <= 0:
        return feels_like

    if pressure < 80 or pressure > 110:
        return feels_like

    correction = 0.1 * (STANDARD_PRESSURE - pressure)
    return feels_like + correction


def calculate_feels_like(
    temperature: float,
    humidity: float,
    wind_speed: float = 0,
    pressure: Optional[float] = None,
    is_outdoor: bool = True,
    time_of_day: Optional[datetime] = None,
    cloudiness: float = 0,
) -> Tuple[float, str, str]:
    """
    Calculate the feels-like temperature and determine comfort level.

    Returns:
        Tuple of (feels_like_temp, calculation_method, comfort_level)
    """
    method = ""

    if is_outdoor:
        # Outdoor calculation
        if temperature >= 27 and humidity >= 40:
            feels_like = calculate_heat_index(temperature, humidity)
            method = "Heat Index"
        elif temperature <= 10 and wind_speed > 1.34:
            feels_like = calculate_wind_chill(temperature, wind_speed)
            method = "Wind Chill"
        else:
            feels_like = calculate_steadman_apparent_temp(temperature, humidity, wind_speed)
            method = "Steadman Apparent Temperature"

        # Apply solar and pressure corrections
        original_feels_like = feels_like
        feels_like = apply_solar_correction(feels_like, time_of_day, cloudiness)
        if pressure is not None:
            feels_like = apply_pressure_correction(feels_like, pressure)

        if abs(feels_like - original_feels_like) > 0.1:
            _LOGGER.debug(
                "Applied corrections: original=%s°C, after corrections=%s°C",
                original_feels_like, feels_like
            )

        # Sanity check for unreasonable values
        if feels_like > temperature + 25 or feels_like < temperature - 25:
            _LOGGER.warning(
                "Calculated feels-like temperature (%s°C) is far from actual temperature (%s°C). "
                "This may indicate an issue with input data or calculation method.",
                feels_like, temperature
            )

        # Determine comfort level for outdoor
        comfort_level = determine_outdoor_comfort(feels_like, method)
    else:
        # Indoor calculation - simplified approach
        feels_like = calculate_indoor_feels_like(temperature, humidity)
        method = "Indoor Comfort Model"
        comfort_level = determine_indoor_comfort(feels_like, humidity)

    return feels_like, method, comfort_level


def calculate_indoor_feels_like(temperature: float, humidity: float) -> float:
    """Calculate indoor feels-like temperature (simplified model)."""

    humidity_factor = 0
    if humidity < 30:
        humidity_factor = (humidity - 30) * 0.05
    elif humidity > 60:
        humidity_factor = (humidity - 60) * 0.05

    return temperature + humidity_factor


def determine_outdoor_comfort(feels_like: float, method: str) -> str:
    """Determine comfort level based on outdoor feels-like temperature."""
    from .const import (
        COMFORT_EXTREME_COLD, COMFORT_VERY_COLD, COMFORT_COLD,
        COMFORT_COOL, COMFORT_SLIGHTLY_COOL, COMFORT_COMFORTABLE,
        COMFORT_SLIGHTLY_WARM, COMFORT_WARM, COMFORT_HOT,
        COMFORT_VERY_HOT, COMFORT_EXTREME_HOT
    )

    # Sanity check - if feels_like is unreasonable, use more conservative estimate
    if feels_like > 60:  # Unreasonably high temperature
        _LOGGER.warning("Calculated feels-like temperature is unreasonably high: %s°C. Using more conservative estimate.", feels_like)
        feels_like = min(feels_like, 50)  # Cap at 50°C which is still extremely hot

    if method == "Heat Index":
        if feels_like >= 54:
            return COMFORT_EXTREME_HOT
        elif feels_like >= 41:
            return COMFORT_VERY_HOT
        elif feels_like >= 32:
            return COMFORT_HOT
        elif feels_like >= 27:
            return COMFORT_WARM
        else:
            return COMFORT_COMFORTABLE

    elif method == "Wind Chill":
        if feels_like <= -48:
            return COMFORT_EXTREME_COLD
        elif feels_like <= -40:
            return COMFORT_VERY_COLD
        elif feels_like <= -28:
            return COMFORT_COLD
        elif feels_like <= -10:
            return COMFORT_COOL
        else:
            return COMFORT_SLIGHTLY_COOL

    else:  # Steadman or other
        if feels_like > 46:
            return COMFORT_EXTREME_HOT
        elif feels_like > 38:
            return COMFORT_VERY_HOT
        elif feels_like > 32:
            return COMFORT_HOT
        elif feels_like > 29:
            return COMFORT_WARM
        elif feels_like > 26:
            return COMFORT_SLIGHTLY_WARM
        elif feels_like > 9:
            return COMFORT_COMFORTABLE
        elif feels_like > 0:
            return COMFORT_SLIGHTLY_COOL
        elif feels_like > -13:
            return COMFORT_COOL
        elif feels_like > -27:
            return COMFORT_COLD
        elif feels_like > -40:
            return COMFORT_VERY_COLD
        else:
            return COMFORT_EXTREME_COLD


def determine_indoor_comfort(temperature: float, humidity: float) -> str:
    """Determine comfort level for indoor environment."""
    from .const import (
        COMFORT_COLD, COMFORT_COOL, COMFORT_SLIGHTLY_COOL,
        COMFORT_COMFORTABLE, COMFORT_SLIGHTLY_WARM, COMFORT_WARM, COMFORT_HOT
    )

    # Simplified indoor comfort model
    if temperature < 16:
        return COMFORT_COLD
    elif temperature < 18:
        return COMFORT_COOL
    elif temperature < 20:
        return COMFORT_SLIGHTLY_COOL
    elif temperature <= 24:
        if humidity < 30:
            return COMFORT_SLIGHTLY_COOL
        elif humidity > 70:
            return COMFORT_SLIGHTLY_WARM
        else:
            return COMFORT_COMFORTABLE
    elif temperature <= 26:
        return COMFORT_SLIGHTLY_WARM
    elif temperature <= 28:
        return COMFORT_WARM
    else:
        return COMFORT_HOT
