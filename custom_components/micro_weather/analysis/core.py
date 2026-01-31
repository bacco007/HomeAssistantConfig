"""Core weather condition analysis.

This module contains the main weather condition determination logic,
simplified and focused on clarity and maintainability.
"""

import logging
import math
from typing import Any, Dict, Optional

from homeassistant.components.weather import (
    ATTR_CONDITION_CLEAR_NIGHT,
    ATTR_CONDITION_CLOUDY,
    ATTR_CONDITION_FOG,
    ATTR_CONDITION_LIGHTNING,
    ATTR_CONDITION_LIGHTNING_RAINY,
    ATTR_CONDITION_PARTLYCLOUDY,
    ATTR_CONDITION_POURING,
    ATTR_CONDITION_RAINY,
    ATTR_CONDITION_SNOWY,
    ATTR_CONDITION_SUNNY,
    ATTR_CONDITION_WINDY,
)

from ..const import (
    KEY_DEWPOINT,
    KEY_HUMIDITY,
    KEY_OUTDOOR_TEMP,
    KEY_PRESSURE,
    KEY_RAIN_RATE,
    KEY_SOLAR_LUX_INTERNAL,
    KEY_SOLAR_RADIATION,
    KEY_UV_INDEX,
    KEY_WIND_GUST,
    KEY_WIND_SPEED,
)
from ..meteorological_constants import (
    PrecipitationThresholds,
    TemperatureThresholds,
    WindThresholds,
)

_LOGGER = logging.getLogger(__name__)


class WeatherConditionAnalyzer:
    """Analyzes weather conditions based on sensor data.

    This class focuses on the core logic of determining weather conditions
    from sensor readings, using a priority-based approach:
    1. Active precipitation (highest priority)
    2. Fog conditions
    3. Severe weather (thunderstorms, gales)
    4. Daytime/nighttime conditions (cloud cover)
    5. Default conditions
    """

    def __init__(self, atmospheric_analyzer, solar_analyzer, trends_analyzer):
        """Initialize with required analyzers.

        Args:
            atmospheric_analyzer: AtmosphericAnalyzer instance for pressure/fog
            solar_analyzer: SolarAnalyzer instance for cloud cover
            trends_analyzer: TrendsAnalyzer instance for historical trends
        """
        self.atmospheric = atmospheric_analyzer
        self.solar = solar_analyzer
        self.trends = trends_analyzer

    def determine_condition(
        self,
        sensor_data: Dict[str, Any],
        altitude: Optional[float] = 0.0,
    ) -> str:
        """Determine weather condition from sensor data.

        Uses a priority-based approach to determine the most appropriate
        weather condition. Each priority level can override lower priorities.

        Args:
            sensor_data: Dictionary of current sensor readings
            altitude: Altitude in meters for pressure correction

        Returns:
            Weather condition string (e.g., "sunny", "rainy", "cloudy")
        """
        # Extract and validate sensor data
        sensors = self._extract_sensors(sensor_data)

        # Calculate derived parameters
        params = self._calculate_parameters(sensors, altitude)

        # Priority 1: Active precipitation
        if condition := self._check_precipitation(sensors, params):
            return condition

        # Priority 2: Fog conditions
        if condition := self._check_fog(sensors, params):
            return condition

        # Priority 3: Severe weather (no precipitation)
        if condition := self._check_severe_weather(sensors, params):
            return condition

        # Priority 4: Daytime/nighttime cloud-based conditions
        if params["is_daytime"]:
            return self._determine_daytime_condition(sensors, params)
        elif params["is_twilight"]:
            return self._determine_twilight_condition(sensors, params)
        else:
            return self._determine_nighttime_condition(sensors, params)

    def _extract_sensors(self, sensor_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and validate sensor values with defaults.

        Extracts all relevant sensor readings from the sensor data dictionary
        and applies default values for missing or None values to ensure
        consistent processing downstream.

        Args:
            sensor_data: Dictionary containing raw sensor readings

        Returns:
            Dictionary with normalized sensor values (never None)
        """
        # Safely extract rain rate - ensure it's a valid number
        rain_rate = sensor_data.get(KEY_RAIN_RATE)
        if rain_rate is None or (isinstance(rain_rate, float) and rain_rate < 0):
            rain_rate = 0.0
        else:
            rain_rate = float(rain_rate) if rain_rate else 0.0

        # Safely extract rain state - normalize to lowercase
        rain_state = sensor_data.get("rain_state", "dry")
        if rain_state is None:
            rain_state = "dry"
        rain_state = str(rain_state).lower().strip()
        # Normalize common rain state variations
        if rain_state in ["raining", "rain", "precipitation", "1", "true", "on"]:
            rain_state = "wet"
        elif rain_state in ["not raining", "no rain", "0", "false", "off"]:
            rain_state = "dry"

        return {
            "rain_rate": rain_rate,
            "rain_state": rain_state,
            "wind_speed": float(sensor_data.get(KEY_WIND_SPEED) or 0.0),
            "wind_gust": float(sensor_data.get(KEY_WIND_GUST) or 0.0),
            "solar_radiation": float(sensor_data.get(KEY_SOLAR_RADIATION) or 0.0),
            "solar_lux": float(sensor_data.get(KEY_SOLAR_LUX_INTERNAL) or 0.0),
            "uv_index": float(sensor_data.get(KEY_UV_INDEX) or 0.0),
            "outdoor_temp": float(sensor_data.get(KEY_OUTDOOR_TEMP) or 70.0),
            "humidity": float(sensor_data.get(KEY_HUMIDITY) or 50.0),
            "pressure": float(sensor_data.get(KEY_PRESSURE) or 29.92),
            "dewpoint_raw": sensor_data.get(KEY_DEWPOINT),
            "solar_elevation": sensor_data.get("solar_elevation"),
        }

    def _calculate_parameters(
        self, sensors: Dict[str, float], altitude: Optional[float]
    ) -> Dict[str, Any]:
        """Calculate derived meteorological parameters.

        Computes derived values needed for condition determination including
        dewpoint temperature, temperature-dewpoint spread, freezing status,
        time-of-day classification, pressure corrections, and gust factors.

        Args:
            sensors: Dictionary of normalized sensor values
            altitude: Station altitude in meters for pressure correction

        Returns:
            Dictionary of calculated parameters including dewpoint, spreads,
            boolean flags, and adjusted thresholds
        """
        # Calculate dewpoint (use sensor if available, otherwise calculate)
        if sensors["dewpoint_raw"] is not None:
            dewpoint = float(sensors["dewpoint_raw"])
        else:
            dewpoint = self.calculate_dewpoint(
                sensors["outdoor_temp"], sensors["humidity"]
            )

        return {
            "dewpoint": dewpoint,
            "temp_dewpoint_spread": sensors["outdoor_temp"] - dewpoint,
            "is_freezing": sensors["outdoor_temp"] <= TemperatureThresholds.FREEZING,
            "is_daytime": (
                sensors["solar_radiation"] > 5
                or sensors["solar_lux"] > 50
                or sensors["uv_index"] > 0.1
            ),
            "is_twilight": (
                (sensors["solar_lux"] > 10 and sensors["solar_lux"] < 100)
                or (sensors["solar_radiation"] > 1 and sensors["solar_radiation"] < 50)
            ),
            "adjusted_pressure": self.atmospheric.adjust_pressure_for_altitude(
                sensors["pressure"], altitude or 0.0, "relative"
            ),
            "pressure_thresholds": self.atmospheric.get_altitude_adjusted_pressure_thresholds(
                altitude or 0.0
            ),
            "gust_factor": sensors["wind_gust"] / max(sensors["wind_speed"], 1),
        }

    def _check_precipitation(
        self, sensors: Dict[str, float], params: Dict[str, Any]
    ) -> Optional[str]:
        """Check for active precipitation conditions.

        Determines if precipitation is occurring and classifies its type
        (rain, snow, thunderstorm) and intensity based on temperature,
        rain rate, and atmospheric conditions.

        Priority logic:
        1. Rain rate sensor is the primary indicator when available and > threshold
        2. Rain state (wet/dry) is used as confirmation or when rate is unavailable
        3. We explicitly avoid false positives from dew/condensation by requiring
           either a meaningful rain rate OR wet state with supporting conditions

        Args:
            sensors: Dictionary of sensor values
            params: Dictionary of calculated parameters

        Returns:
            Weather condition string if precipitation detected, None otherwise
            Possible returns: rainy, pouring, snowy, lightning-rainy
        """
        rain_rate = sensors["rain_rate"]
        rain_state = sensors["rain_state"]
        humidity = sensors["humidity"]
        wind_speed = sensors["wind_speed"]

        # Primary check: Significant rain rate (most reliable indicator)
        has_significant_rain_rate = rain_rate > PrecipitationThresholds.SIGNIFICANT

        # Secondary check: Rain state sensor reports wet
        is_wet = rain_state == "wet"

        # Determine if we have actual precipitation vs just moisture/dew
        # If rain_rate is measurable, trust it
        # If only wet sensor with no rate, check if conditions support precipitation
        if not has_significant_rain_rate and is_wet:
            # Check if this might be dew/condensation rather than rain:
            # - Very calm conditions (wind < 2 mph) favor dew formation
            # - Very high humidity without other precipitation indicators
            # - Tight dewpoint spread in calm conditions = likely dew
            # - Low rain rate (below significant threshold) with other dew indicators
            is_likely_dew = (
                wind_speed < 2.0
                and humidity >= 95
                and params["temp_dewpoint_spread"] < 2.0
                and rain_rate < PrecipitationThresholds.SIGNIFICANT
            )
            if is_likely_dew:
                # This is probably dew/condensation, not rain - check fog instead
                _LOGGER.debug(
                    "Wet sensor detected but likely dew/condensation "
                    "(wind=%.1f, humidity=%.1f%%, spread=%.1f°F, rate=%.3f)",
                    wind_speed,
                    humidity,
                    params["temp_dewpoint_spread"],
                    rain_rate,
                )
                return None

        # Now determine if we have confirmed precipitation
        has_precipitation = has_significant_rain_rate or (
            is_wet and rain_rate >= PrecipitationThresholds.SIGNIFICANT / 2
        )

        if not has_precipitation:
            # No precipitation detected
            return None

        # Determine precipitation type based on temperature
        if params["is_freezing"]:
            return ATTR_CONDITION_SNOWY

        # Check for thunderstorm conditions
        if self._is_thunderstorm(sensors, params):
            return ATTR_CONDITION_LIGHTNING_RAINY

        # Classify rain intensity based on rate
        if rain_rate >= PrecipitationThresholds.HEAVY:
            return ATTR_CONDITION_POURING
        elif rain_rate >= PrecipitationThresholds.MODERATE:
            return ATTR_CONDITION_POURING
        elif rain_rate >= PrecipitationThresholds.LIGHT:
            return ATTR_CONDITION_RAINY
        else:
            # Light rain or wet sensor with minimal rate
            return ATTR_CONDITION_RAINY

    def _is_thunderstorm(
        self, sensors: Dict[str, float], params: Dict[str, Any]
    ) -> bool:
        """Determine if conditions indicate thunderstorm activity.

        Analyzes multiple indicators including extremely low pressure,
        strong winds, high wind gusts, severe turbulence, and heavy
        precipitation to detect thunderstorm conditions.

        Args:
            sensors: Dictionary of sensor values
            params: Dictionary of calculated parameters including pressure thresholds

        Returns:
            True if thunderstorm conditions are detected, False otherwise
        """
        thresholds = params["pressure_thresholds"]
        pressure = params["adjusted_pressure"]
        gust_factor = params["gust_factor"]

        # Severe storm pressure
        if pressure < thresholds["extremely_low"]:
            return True

        # Storm pressure + strong winds + moderate+ rain
        if (
            pressure < thresholds["very_low"]
            and sensors["wind_speed"] >= WindThresholds.FRESH_BREEZE
            and sensors["rain_rate"] > PrecipitationThresholds.LIGHT
        ):
            return True

        # Storm pressure + very gusty + heavy rain
        if (
            pressure < thresholds["very_low"]
            and gust_factor > WindThresholds.GUST_FACTOR_STRONG
            and sensors["rain_rate"] > PrecipitationThresholds.MODERATE
        ):
            return True

        # Severe turbulence indicator
        is_severe_turbulence = (
            gust_factor > WindThresholds.GUST_FACTOR_SEVERE
            and sensors["wind_gust"] > WindThresholds.GUST_SEVERE
        ) or sensors["wind_gust"] > WindThresholds.GUST_EXTREME

        if (
            is_severe_turbulence
            and sensors["rain_rate"] > PrecipitationThresholds.STORM_MIN_RATE
        ):
            return True

        return False

    def _check_fog(
        self, sensors: Dict[str, float], params: Dict[str, Any]
    ) -> Optional[str]:
        """Check for fog conditions using atmospheric analyzer.

        Delegates to atmospheric analyzer to check for fog using a
        comprehensive scoring system based on humidity, dewpoint spread,
        wind speed, and solar radiation.

        Important: We apply additional validation to prevent false fog
        detection during normal humid mornings. True fog significantly
        reduces visibility and solar radiation.

        Args:
            sensors: Dictionary of sensor values
            params: Dictionary of calculated parameters including dewpoint

        Returns:
            ATTR_CONDITION_FOG if fog detected, None otherwise
        """
        # Quick pre-check: fog requires very high humidity
        # Skip fog analysis if humidity is below 88%
        if sensors["humidity"] < 88:
            return None

        # Additional pre-check: during daytime, fog should significantly
        # reduce solar radiation. If solar radiation is close to clear-sky
        # values for the current solar elevation, it's not fog.
        if params["is_daytime"]:
            solar_elevation = sensors.get("solar_elevation", 45.0)
            solar_rad = sensors.get("solar_radiation", 0)

            if solar_elevation and solar_elevation > 0:
                # Calculate expected clear-sky radiation for this elevation
                # At low angles, use a proportional calculation
                # At high angles, fog should reduce radiation significantly
                if solar_elevation <= 15:
                    # At low sun angles (sunrise/sunset), expected radiation is low
                    # Use a formula that accounts for atmospheric path length
                    # Clear-sky at 6°: ~60 W/m², at 10°: ~120 W/m², at 15°: ~200 W/m²
                    # Fog would reduce these by 50-80%
                    expected_clear_sky = solar_elevation * 13  # Rough linear estimate
                    # If actual radiation is > 60% of clear-sky, probably not fog
                    if solar_rad > expected_clear_sky * 0.6:
                        _LOGGER.debug(
                            "Skipping fog check: solar %.1f W/m² is %.0f%% of "
                            "expected clear-sky %.1f W/m² at elevation %.1f°",
                            solar_rad,
                            (
                                (solar_rad / expected_clear_sky * 100)
                                if expected_clear_sky > 0
                                else 0
                            ),
                            expected_clear_sky,
                            solar_elevation,
                        )
                        return None
                elif solar_elevation > 15:
                    # At higher angles, fog would significantly reduce radiation
                    expected_min_radiation = min(200.0, solar_elevation * 8)
                    if solar_rad > expected_min_radiation:
                        _LOGGER.debug(
                            "Skipping fog check: solar radiation %.1f W/m² too high "
                            "for fog (expected < %.1f at elevation %.1f°)",
                            solar_rad,
                            expected_min_radiation,
                            solar_elevation,
                        )
                        return None

        # Check temperature trend - fog often forms when temperature is falling
        # toward dewpoint (evening/night radiational cooling)
        # This is a bonus factor, not a requirement
        temp_trend = self.trends.get_historical_trends("outdoor_temp", hours=3)
        is_cooling = False
        if temp_trend and "trend" in temp_trend:
            trend_value = temp_trend.get("trend", 0)
            if isinstance(trend_value, (int, float)):
                # Negative trend = temperature falling (favorable for fog)
                is_cooling = trend_value < -0.5  # Dropping more than 0.5°F/hour

        # Check if it was a clear day - fog doesn't appear immediately after sunset
        # If conditions were sunny/clear during the day, be more skeptical of fog
        # in the early evening hours
        was_clear_day = self._was_recent_day_clear()
        if was_clear_day and not params["is_daytime"]:
            _LOGGER.debug(
                "Skipping fog check: day was clear, fog unlikely in early evening"
            )
            return None

        fog_result = self.atmospheric.analyze_fog_conditions(
            sensors["outdoor_temp"],
            sensors["humidity"],
            params["dewpoint"],
            params["temp_dewpoint_spread"],
            sensors["wind_speed"],
            sensors["solar_radiation"],
            params["is_daytime"],
        )

        # If atmospheric analysis says fog and conditions are favorable, return fog
        # If temperature is rising (not cooling), require stricter fog conditions
        if fog_result == ATTR_CONDITION_FOG:
            # Log temperature trend influence
            if is_cooling:
                _LOGGER.debug(
                    "Fog confirmed with favorable cooling trend (temp trend: %.2f°F/hr)",
                    temp_trend.get("trend", 0) if temp_trend else 0,
                )
            return fog_result

        return None

    def _was_recent_day_clear(self) -> bool:
        """Check if conditions were predominantly clear during the recent daytime.

        Fog formation takes time - it typically develops in the early morning
        hours after prolonged radiative cooling. If the day was sunny/clear,
        fog is unlikely to appear immediately after sunset.

        Uses the solar analyzer's condition history to check recent daytime
        conditions.

        Returns:
            True if the recent day was predominantly clear/sunny, False otherwise
        """
        try:
            # Access the condition history from the solar analyzer
            condition_history = getattr(self.solar, "_condition_history", None)
            if not condition_history:
                return False

            # Look at conditions from the last 12 hours
            from datetime import datetime, timedelta

            cutoff_time = datetime.now() - timedelta(hours=12)

            # Filter to daytime clear conditions (sunny, partlycloudy with low cloud cover)
            daytime_clear_count = 0
            daytime_total_count = 0

            for entry in condition_history:
                if entry.get("timestamp", datetime.min) > cutoff_time:
                    condition = entry.get("condition", "")
                    cloud_cover = entry.get("cloud_cover", 50.0)

                    # Only count daytime conditions (not clear-night)
                    if condition in {"sunny", "partlycloudy"}:
                        daytime_total_count += 1
                        # Consider it "clear" if cloud cover was low
                        if cloud_cover < 40:
                            daytime_clear_count += 1

            # If we had at least 3 daytime readings and most were clear
            if daytime_total_count >= 3:
                clear_ratio = daytime_clear_count / daytime_total_count
                if clear_ratio >= 0.6:  # 60% or more clear conditions
                    _LOGGER.debug(
                        "Recent day was predominantly clear (%.0f%% clear, %d readings)",
                        clear_ratio * 100,
                        daytime_total_count,
                    )
                    return True

            return False

        except Exception as e:
            _LOGGER.debug("Error checking recent day conditions: %s", e)
            return False

    def _check_severe_weather(
        self, sensors: Dict[str, float], params: Dict[str, Any]
    ) -> Optional[str]:
        """Check for severe weather without precipitation.

        Detects severe weather conditions such as thunderstorms without
        rain (dry thunderstorms) or gale-force winds based on pressure,
        wind speed, gusts, and turbulence indicators.

        Args:
            sensors: Dictionary of sensor values
            params: Dictionary of calculated parameters including pressure thresholds

        Returns:
            Weather condition string if severe weather detected, None otherwise
            Possible returns: lightning, windy
        """
        thresholds = params["pressure_thresholds"]
        pressure = params["adjusted_pressure"]
        gust_factor = params["gust_factor"]

        # Severe turbulence or very low pressure with strong winds
        is_severe = (
            gust_factor > WindThresholds.GUST_FACTOR_SEVERE
            and sensors["wind_gust"] > WindThresholds.GUST_EXTREME
        ) or sensors["wind_gust"] > WindThresholds.GUST_EXTREME

        wind_strong = (
            WindThresholds.FRESH_BREEZE
            <= sensors["wind_speed"]
            < WindThresholds.NEAR_GALE
        )

        if (
            pressure < thresholds["very_low"]
            and wind_strong
            and gust_factor > WindThresholds.GUST_FACTOR_STRONG
        ) or is_severe:
            return ATTR_CONDITION_LIGHTNING

        # Gale force winds
        if sensors["wind_speed"] >= WindThresholds.NEAR_GALE:
            return ATTR_CONDITION_WINDY

        return None

    def _determine_daytime_condition(
        self, sensors: Dict[str, float], params: Dict[str, Any]
    ) -> str:
        """Determine daytime condition based on cloud cover.

        Analyzes solar measurements to estimate cloud cover and maps it
        to appropriate daytime weather conditions (sunny, partly cloudy,
        cloudy, windy). Includes hysteresis to prevent rapid oscillation.

        Args:
            sensors: Dictionary of sensor values including solar measurements
            params: Dictionary of calculated parameters

        Returns:
            Daytime weather condition string (sunny, partlycloudy, cloudy, windy)
        """
        # Get solar elevation with fallback
        solar_elevation = sensors["solar_elevation"]
        has_solar_data = (
            sensors["solar_radiation"] > 0
            or sensors["solar_lux"] > 0
            or sensors["uv_index"] > 0
        )

        if solar_elevation is None:
            if has_solar_data:
                # Estimate solar elevation based on radiation intensity
                # Higher radiation = higher sun typically
                if sensors["solar_radiation"] > 600:
                    solar_elevation = 60.0  # High sun
                elif sensors["solar_radiation"] > 300:
                    solar_elevation = 45.0  # Mid-day
                elif sensors["solar_radiation"] > 100:
                    solar_elevation = 25.0  # Morning/afternoon
                else:
                    solar_elevation = 15.0  # Early morning/late afternoon
            else:
                # Fallback to atmospheric analysis
                return self._atmospheric_fallback_condition(sensors, params)

        # Analyze pressure trends for cloud prediction
        pressure_trends = self.trends.analyze_pressure_trends(
            params.get("altitude", 0.0)
        )

        # Analyze cloud cover
        cloud_cover = self.solar.analyze_cloud_cover(
            sensors["solar_radiation"],
            sensors["solar_lux"],
            sensors["uv_index"],
            solar_elevation,
            pressure_trends,
        )

        # Log the cloud cover analysis for debugging
        _LOGGER.debug(
            "Cloud cover analysis: %.1f%% (radiation=%.1f W/m², lux=%.0f, "
            "uv=%.1f, elevation=%.1f°)",
            cloud_cover,
            sensors["solar_radiation"],
            sensors["solar_lux"],
            sensors["uv_index"],
            solar_elevation,
        )

        # Map cloud cover to condition with hysteresis
        proposed = self.solar.map_cloud_cover_to_condition(cloud_cover)
        final = self.solar.apply_condition_hysteresis(proposed, cloud_cover)

        # Override with windy if conditions are right
        # Windy only applies on sunny days - cloudy + wind = cloudy
        wind_strong = (
            WindThresholds.FRESH_BREEZE
            <= sensors["wind_speed"]
            < WindThresholds.NEAR_GALE
        )
        gust_factor = params["gust_factor"]
        is_very_gusty = (
            gust_factor > WindThresholds.GUST_FACTOR_STRONG
            and sensors["wind_gust"] > WindThresholds.GUST_STRONG
        )

        if final == ATTR_CONDITION_SUNNY and (
            wind_strong
            or (is_very_gusty and sensors["wind_speed"] >= WindThresholds.LIGHT_BREEZE)
        ):
            return ATTR_CONDITION_WINDY

        return final

    def _atmospheric_fallback_condition(
        self, sensors: Dict[str, float], params: Dict[str, Any]
    ) -> str:
        """Fallback condition determination using atmospheric data.

        Used when solar data is unavailable or unreliable. Estimates
        weather condition based on humidity, dewpoint spread, and
        atmospheric pressure patterns.

        Args:
            sensors: Dictionary of sensor values
            params: Dictionary of calculated parameters including pressure

        Returns:
            Weather condition string based on atmospheric indicators
        """
        humidity = sensors["humidity"]
        spread = params["temp_dewpoint_spread"]
        pressure = params["adjusted_pressure"]
        thresholds = params["pressure_thresholds"]

        # Clear conditions
        if (
            humidity < TemperatureThresholds.HUMIDITY_MODERATE
            and spread > TemperatureThresholds.SPREAD_MODERATE
        ):
            return ATTR_CONDITION_SUNNY
        elif (
            humidity < TemperatureThresholds.HUMIDITY_MODERATE_HIGH
            and spread > TemperatureThresholds.SPREAD_HUMID
            and thresholds["normal_low"] <= pressure <= thresholds["normal_high"]
        ):
            return ATTR_CONDITION_SUNNY
        elif (
            pressure > thresholds["high"]
            and humidity < TemperatureThresholds.HUMIDITY_FALLBACK_LOW
        ):
            return ATTR_CONDITION_SUNNY
        elif (
            pressure < thresholds["low"]
            and humidity < TemperatureThresholds.HUMIDITY_FALLBACK_MEDIUM
        ):
            return ATTR_CONDITION_PARTLYCLOUDY
        elif humidity >= TemperatureThresholds.HUMIDITY_FALLBACK_HIGH:
            return ATTR_CONDITION_CLOUDY
        else:
            return ATTR_CONDITION_PARTLYCLOUDY

    def _determine_twilight_condition(
        self, sensors: Dict[str, float], params: Dict[str, Any]
    ) -> str:
        """Determine twilight condition.

        Handles the transition period between day and night (dawn/dusk)
        when solar measurements are low but non-zero. Uses limited solar
        data combined with pressure to estimate conditions.

        Args:
            sensors: Dictionary of sensor values
            params: Dictionary of calculated parameters including pressure

        Returns:
            Weather condition string for twilight (partlycloudy or cloudy)
        """
        thresholds = params["pressure_thresholds"]
        pressure = params["adjusted_pressure"]

        if (
            sensors["solar_lux"] > 50
            and thresholds["normal_low"] <= pressure <= thresholds["normal_high"]
        ):
            return ATTR_CONDITION_PARTLYCLOUDY
        else:
            return ATTR_CONDITION_CLOUDY

    def _determine_nighttime_condition(
        self, sensors: Dict[str, float], params: Dict[str, Any]
    ) -> str:
        """Determine nighttime condition based on atmospheric data.

        Estimates nighttime conditions using pressure, humidity, wind,
        and atmospheric stability indicators since solar data is not
        available. Distinguishes between clear-night, partly cloudy,
        and cloudy conditions.

        Args:
            sensors: Dictionary of sensor values
            params: Dictionary of calculated parameters

        Returns:
            Nighttime weather condition string (clear-night, partlycloudy, cloudy)
        """
        humidity = sensors["humidity"]
        pressure = params["adjusted_pressure"]
        thresholds = params["pressure_thresholds"]
        wind_speed = sensors["wind_speed"]
        gust_factor = params["gust_factor"]

        # Most specific: Combined conditions
        if (
            pressure < thresholds["low"]
            and humidity > TemperatureThresholds.HUMIDITY_HIGH
            and wind_speed < 3
        ):
            return ATTR_CONDITION_CLOUDY

        # Clear night conditions
        if (
            pressure > thresholds["very_high"]
            and wind_speed < WindThresholds.CALM
            and humidity < TemperatureThresholds.HUMIDITY_MODERATE_HIGH
        ):
            return ATTR_CONDITION_CLEAR_NIGHT
        elif (
            pressure > thresholds["high"]
            and gust_factor <= WindThresholds.GUST_FACTOR_MODERATE
            and humidity < 80
        ):
            return ATTR_CONDITION_CLEAR_NIGHT
        elif pressure < thresholds["low"] and humidity < 65:
            return ATTR_CONDITION_CLEAR_NIGHT

        # Partly cloudy night
        if (
            thresholds["normal_low"] <= pressure <= thresholds["normal_high"]
            and WindThresholds.CALM <= wind_speed < WindThresholds.LIGHT_BREEZE
            and humidity < 85
        ):
            return ATTR_CONDITION_PARTLYCLOUDY
        elif pressure < thresholds["low"] and humidity < 90:
            return ATTR_CONDITION_PARTLYCLOUDY

        # Cloudy night
        if humidity > 90:
            return ATTR_CONDITION_CLOUDY

        # Default night condition
        return ATTR_CONDITION_PARTLYCLOUDY

    def calculate_dewpoint(self, temp_f: float, humidity: Optional[float]) -> float:
        """Calculate dewpoint using Magnus formula.

        Args:
            temp_f: Temperature in Fahrenheit
            humidity: Relative humidity as percentage (0-100), or None

        Returns:
            Dewpoint temperature in Fahrenheit
        """
        if humidity is None or humidity <= 0:
            return temp_f - 50  # Approximate for very dry conditions

        # Convert to Celsius
        temp_c = (temp_f - 32) * 5 / 9

        # Magnus formula constants
        a = 17.27
        b = 237.7

        # Calculate dewpoint in Celsius
        gamma = (a * temp_c) / (b + temp_c) + math.log(humidity / 100.0)
        dewpoint_c = (b * gamma) / (a - gamma)

        # Convert back to Fahrenheit
        return dewpoint_c * 9 / 5 + 32

    def classify_precipitation_intensity(self, rain_rate: float) -> str:
        """Classify precipitation intensity.

        Args:
            rain_rate: Rain rate in inches/hour or mm/hour

        Returns:
            Intensity classification: "trace", "light", "moderate", or "heavy"
        """
        if rain_rate >= PrecipitationThresholds.HEAVY:
            return "heavy"
        elif rain_rate >= PrecipitationThresholds.LIGHT:
            return "moderate"
        elif rain_rate >= PrecipitationThresholds.SIGNIFICANT:
            return "light"
        else:
            return "trace"

    def estimate_visibility(self, condition: str, sensor_data: Dict[str, Any]) -> float:
        """Estimate visibility based on weather condition.

        Args:
            condition: Current weather condition
            sensor_data: Current sensor readings

        Returns:
            Estimated visibility in kilometers
        """
        sensors = self._extract_sensors(sensor_data)

        # Fog has most reduced visibility
        if condition == ATTR_CONDITION_FOG:
            if (
                sensors["humidity"] >= 98
                and (
                    sensors["outdoor_temp"]
                    - self.calculate_dewpoint(
                        sensors["outdoor_temp"], sensors["humidity"]
                    )
                )
                <= 0.5
            ):
                return 0.2  # Dense fog
            elif sensors["humidity"] >= 95:
                return 0.5  # Thick fog
            elif sensors["humidity"] >= 92:
                return 1.0  # Moderate fog
            else:
                return 2.0  # Light fog

        # Precipitation reduces visibility
        if condition in [ATTR_CONDITION_RAINY, ATTR_CONDITION_SNOWY]:
            base = 15.0 if condition == ATTR_CONDITION_RAINY else 8.0
            intensity_factor = 0.3 if sensors["rain_rate"] > 0.5 else 0.7
            wind_factor = max(0.6, 1.0 - (sensors["wind_speed"] / 50))
            return round(max(0.5, base * intensity_factor * wind_factor), 1)

        # Thunderstorms
        if condition == ATTR_CONDITION_LIGHTNING_RAINY:
            if sensors["rain_rate"] > 0.1:
                return round(max(0.8, 3.0 - (sensors["rain_rate"] * 2)), 1)
            else:
                return round(max(0.8, 8.0 - (sensors["wind_gust"] / 10)), 1)

        # Clear conditions
        if condition == ATTR_CONDITION_CLEAR_NIGHT:
            if sensors["humidity"] < 50:
                return 25.0
            elif sensors["humidity"] < 70:
                return 20.0
            else:
                return 15.0

        # Sunny conditions
        if condition == ATTR_CONDITION_SUNNY:
            if sensors["solar_radiation"] > 800:
                return 30.0
            elif sensors["solar_radiation"] >= 600:
                return 25.0
            elif sensors["solar_radiation"] > 400:
                return 20.0
            else:
                return 15.0

        # Cloudy/partly cloudy
        if condition in [ATTR_CONDITION_PARTLYCLOUDY, ATTR_CONDITION_CLOUDY]:
            is_daytime = (
                sensors["solar_radiation"] > 5
                or sensors["solar_lux"] > 50
                or sensors["uv_index"] > 0.1
            )
            if is_daytime:
                if sensors["solar_lux"] > 50000:
                    return 25.0
                elif sensors["solar_lux"] > 20000:
                    return 20.0
                elif sensors["solar_lux"] > 5000:
                    return 15.0
                else:
                    return 12.0
            else:
                if sensors["humidity"] < 75:
                    return 18.0
                elif sensors["humidity"] < 85:
                    return 15.0
                else:
                    return 12.0

        # Default
        return 15.0
