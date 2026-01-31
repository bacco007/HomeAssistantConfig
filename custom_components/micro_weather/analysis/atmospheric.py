"""Atmospheric pressure and fog analysis.

This module handles:
- Pressure altitude corrections
- Fog condition detection
- Pressure trend analysis
- Atmospheric stability calculations
"""

from collections import deque
from datetime import datetime, timedelta
import logging
import statistics
from typing import Any, Dict, List, Optional

from homeassistant.components.weather import ATTR_CONDITION_FOG

from ..meteorological_constants import (
    FogThresholds,
    PhysicsConstants,
    PressureThresholds,
)
from .trends import TrendsAnalyzer

_LOGGER = logging.getLogger(__name__)


class AtmosphericAnalyzer:
    """Analyzes atmospheric conditions including pressure and fog."""

    def __init__(
        self,
        sensor_history: Optional[Dict[str, deque[Dict[str, Any]]]] = None,
        trends_analyzer: Optional[TrendsAnalyzer] = None,
    ):
        """Initialize with sensor history and trends analyzer.

        Args:
            sensor_history: Dictionary of sensor historical data deques
            trends_analyzer: TrendsAnalyzer instance for delegating trend calculations.
                           Required for proper functionality.
        """
        self._sensor_history = sensor_history or {}
        if trends_analyzer is None:
            raise ValueError(
                "trends_analyzer is required. AtmosphericAnalyzer delegates "
                "trend calculations to TrendsAnalyzer to avoid code duplication."
            )
        self._trends_analyzer = trends_analyzer

    def adjust_pressure_for_altitude(
        self, pressure_inhg: float, altitude_m: Optional[float], pressure_type: str
    ) -> float:
        """Adjust pressure for altitude using barometric formula.

        Args:
            pressure_inhg: Pressure reading in inches of mercury
            altitude_m: Altitude in meters above sea level
            pressure_type: "relative" (station) or "atmospheric" (sea-level)

        Returns:
            Pressure adjusted to sea-level equivalent in inHg
        """
        altitude_m = altitude_m or 0.0

        if pressure_type == "atmospheric" or altitude_m == 0:
            return pressure_inhg

        # Convert to hPa for calculation
        pressure_hpa = pressure_inhg * PhysicsConstants.INHG_TO_HPA

        # Barometric formula constants
        L = PhysicsConstants.LAPSE_RATE
        T0 = PhysicsConstants.STD_TEMP_SEA_LEVEL
        g = PhysicsConstants.G
        M = PhysicsConstants.M_AIR
        R = PhysicsConstants.R

        # Calculate exponent
        exponent = (g * M) / (R * L)

        # Calculate sea-level pressure
        if altitude_m > 0:
            sea_level_pressure_hpa = (
                pressure_hpa * (1 - (L * altitude_m) / T0) ** exponent
            )
        else:
            sea_level_pressure_hpa = pressure_hpa

        # Convert back to inHg
        return sea_level_pressure_hpa / PhysicsConstants.INHG_TO_HPA

    def get_altitude_adjusted_pressure_thresholds(
        self, altitude_m: Optional[float]
    ) -> Dict[str, float]:
        """Get pressure thresholds adjusted for altitude.

        Args:
            altitude_m: Altitude in meters above sea level

        Returns:
            Dictionary of pressure thresholds in inHg
        """
        altitude_m = altitude_m or 0.0

        # Base thresholds at sea level
        base_thresholds = {
            "very_high": PressureThresholds.VERY_HIGH,
            "high": PressureThresholds.HIGH,
            "normal_high": PressureThresholds.NORMAL_HIGH,
            "normal_low": PressureThresholds.NORMAL_LOW,
            "low": PressureThresholds.LOW,
            "very_low": PressureThresholds.VERY_LOW,
            "extremely_low": PressureThresholds.EXTREMELY_LOW,
        }

        if altitude_m == 0:
            return base_thresholds

        # Adjust for altitude (~1 hPa per 8 meters)
        altitude_adjustment_hpa = altitude_m / 8.0
        altitude_adjustment_inhg = (
            altitude_adjustment_hpa / PhysicsConstants.INHG_TO_HPA
        )

        # Apply adjustment
        adjusted_thresholds = {}
        for key, threshold_inhg in base_thresholds.items():
            adjusted_thresholds[key] = threshold_inhg - altitude_adjustment_inhg

        return adjusted_thresholds

    def get_altitude_adjusted_pressure_thresholds_hpa(
        self, altitude_m: Optional[float]
    ) -> Dict[str, float]:
        """Get pressure thresholds adjusted for altitude in hPa.

        Args:
            altitude_m: Altitude in meters above sea level

        Returns:
            Dictionary of pressure thresholds in hPa
        """
        # Get thresholds in inHg and convert to hPa
        inhg_thresholds = self.get_altitude_adjusted_pressure_thresholds(altitude_m)
        hpa_thresholds = {}
        for key, value_inhg in inhg_thresholds.items():
            hpa_thresholds[key] = value_inhg * PhysicsConstants.INHG_TO_HPA
        return hpa_thresholds

    def analyze_fog_conditions(
        self,
        temp: float,
        humidity: float,
        dewpoint: float,
        spread: float,
        wind_speed: float,
        solar_rad: float,
        is_daytime: bool,
    ) -> Optional[str]:
        """Analyze atmospheric conditions for fog using scoring system.

        Uses meteorological principles:
        - High humidity (near-saturation)
        - Small temperature-dewpoint spread
        - Light winds (fog formation/persistence)
        - Reduced solar radiation (fog indicator)

        Fog is a visibility-reducing phenomenon that requires very specific
        conditions. We are conservative in detection to avoid false positives
        from normal humid mornings or condensation.

        Args:
            temp: Temperature in Fahrenheit
            humidity: Relative humidity percentage
            dewpoint: Dewpoint temperature in Fahrenheit
            spread: Temperature minus dewpoint in Fahrenheit
            wind_speed: Wind speed in mph
            solar_rad: Solar radiation in W/m²
            is_daytime: Boolean indicating daytime

        Returns:
            ATTR_CONDITION_FOG if fog detected, None otherwise
        """
        fog_score = 0

        # 1. Humidity factor (0-40 points)
        # Fog requires very high humidity - near saturation
        if humidity >= FogThresholds.HUMIDITY_DENSE_FOG:
            fog_score += FogThresholds.SCORE_DENSE
        elif humidity >= FogThresholds.HUMIDITY_PROBABLE_FOG:
            fog_score += FogThresholds.SCORE_PROBABLE
        elif humidity >= FogThresholds.HUMIDITY_POSSIBLE_FOG:
            fog_score += FogThresholds.SCORE_POSSIBLE
        elif humidity >= FogThresholds.HUMIDITY_MARGINAL_FOG:
            fog_score += FogThresholds.SCORE_MARGINAL

        # 2. Temperature-dewpoint spread (0-30 points)
        # Critical for fog - air must be near saturation
        if spread <= FogThresholds.SPREAD_SATURATED:
            fog_score += FogThresholds.SCORE_SPREAD_SATURATED
        elif spread <= FogThresholds.SPREAD_VERY_CLOSE:
            fog_score += FogThresholds.SCORE_SPREAD_VERY_CLOSE
        elif spread <= FogThresholds.SPREAD_CLOSE:
            fog_score += FogThresholds.SCORE_SPREAD_CLOSE
        elif spread <= FogThresholds.SPREAD_MARGINAL:
            fog_score += FogThresholds.SCORE_SPREAD_MARGINAL

        # 3. Wind factor (0-15 points)
        # Fog requires calm to light winds - strong winds disperse fog
        if wind_speed <= FogThresholds.WIND_CALM:
            fog_score += FogThresholds.SCORE_WIND_CALM
        elif wind_speed <= FogThresholds.WIND_LIGHT:
            fog_score += FogThresholds.SCORE_WIND_LIGHT
        elif wind_speed <= FogThresholds.WIND_MODERATE:
            fog_score += FogThresholds.SCORE_WIND_MODERATE
        else:
            # Strong winds are a strong negative indicator for fog
            fog_score += FogThresholds.PENALTY_WIND_STRONG

        # 4. Solar radiation factor (0-15 points)
        # During daytime, fog significantly reduces solar radiation
        # At night, solar radiation is naturally zero - this is NOT evidence of fog
        if is_daytime:
            if solar_rad < FogThresholds.SOLAR_VERY_LOW:
                fog_score += FogThresholds.SCORE_SOLAR_DENSE
            elif solar_rad < FogThresholds.SOLAR_LOW:
                fog_score += FogThresholds.SCORE_SOLAR_MODERATE
            elif solar_rad < FogThresholds.SOLAR_REDUCED:
                fog_score += FogThresholds.SCORE_SOLAR_LIGHT
            else:
                # If solar radiation is normal/high during daytime,
                # this is a strong indicator against fog
                fog_score -= 15
        else:
            # At night, solar radiation being zero is EXPECTED and provides
            # no evidence for or against fog. Only during twilight when we'd
            # expect some light does reduced radiation indicate fog.
            # We no longer give positive points just for being nighttime.
            if solar_rad > FogThresholds.SOLAR_MODERATE_TWILIGHT:
                # Unusual radiation at night - strong lights nearby, not fog
                fog_score += FogThresholds.PENALTY_SOLAR_STRONG

        # 5. Temperature factor (bonus for evaporation fog)
        # Warm temps with high humidity and tight spread = evaporation fog
        # Only apply during daytime when evaporation fog can form
        if (
            is_daytime
            and temp > FogThresholds.TEMP_WARM_THRESHOLD
            and humidity >= FogThresholds.HUMIDITY_PROBABLE_FOG
            and spread <= FogThresholds.SPREAD_CLOSE
        ):
            fog_score += 5

        # 6. Nighttime penalty - high humidity is NORMAL at night
        # Without visibility sensors, we must be very conservative about
        # calling fog at night. Radiative cooling naturally increases
        # humidity and narrows dewpoint spread on clear nights.
        if not is_daytime:
            # Apply a penalty to counteract the naturally high humidity
            # at night. Only truly extreme conditions should trigger fog.
            fog_score -= 10

        _LOGGER.debug(
            "Fog score: %.1f (humidity=%.1f%%, spread=%.2f°F, "
            "wind=%.1f mph, solar=%.1f W/m², temp=%.1f°F, daytime=%s)",
            fog_score,
            humidity,
            spread,
            wind_speed,
            solar_rad,
            temp,
            is_daytime,
        )

        # Determine fog based on score
        # Use conservative thresholds to avoid false positives
        if fog_score >= FogThresholds.THRESHOLD_DENSE_FOG:
            _LOGGER.debug("Dense fog detected (score: %.1f)", fog_score)
            return ATTR_CONDITION_FOG
        elif fog_score >= FogThresholds.THRESHOLD_MODERATE_FOG:
            # For moderate fog, also require tight dewpoint spread as confirmation
            if spread <= FogThresholds.SPREAD_CLOSE:
                _LOGGER.debug("Moderate fog detected (score: %.1f)", fog_score)
                return ATTR_CONDITION_FOG
            else:
                _LOGGER.debug(
                    "Moderate fog score but spread too large (%.1f > %.1f)",
                    spread,
                    FogThresholds.SPREAD_CLOSE,
                )
        elif fog_score >= FogThresholds.THRESHOLD_LIGHT_FOG:
            # For light fog, require both high humidity AND tight spread
            if (
                humidity >= FogThresholds.HUMIDITY_PROBABLE_FOG
                and spread <= FogThresholds.SPREAD_VERY_CLOSE
            ):
                _LOGGER.debug("Light fog detected (score: %.1f)", fog_score)
                return ATTR_CONDITION_FOG
            else:
                _LOGGER.debug(
                    "Light fog score but conditions not met "
                    "(humidity=%.1f, spread=%.1f)",
                    humidity,
                    spread,
                )

        _LOGGER.debug("No fog detected (score: %.1f)", fog_score)
        return None

    def analyze_wind_direction_trends(self) -> Dict[str, Any]:
        """Analyze wind direction trends for weather prediction.

        Returns:
            Dictionary with wind direction analysis
        """
        return self._analyze_wind_direction()

    def _analyze_wind_direction(self) -> Dict[str, Any]:
        """Analyze wind direction for weather prediction.

        Examines recent wind direction history to determine direction
        stability, rate of change, and whether significant wind shifts
        have occurred. Handles both numeric and datetime timestamps.

        Returns:
            Dictionary containing:
            - direction_stability: 0-1, higher = more stable direction
            - direction_change_rate: Degrees per hour wind shift rate
            - significant_shift: Boolean indicating major direction change (>45°)
        """
        if "wind_direction" not in self._sensor_history:
            return {
                "direction_stability": 0.5,
                "direction_change_rate": 0.0,
                "significant_shift": False,
            }

        if not self._sensor_history["wind_direction"]:
            return {
                "direction_stability": 0.5,
                "direction_change_rate": 0.0,
                "significant_shift": False,
            }

        # Separate numeric and datetime timestamps to handle mixed data
        numeric_data = []
        datetime_data = []

        for entry in self._sensor_history["wind_direction"]:
            timestamp = entry["timestamp"]
            if isinstance(timestamp, (int, float)):
                numeric_data.append(entry)
            elif isinstance(timestamp, datetime):
                datetime_data.append(entry)

        # Prefer datetime data if we have enough, otherwise use numeric
        cutoff_time = datetime.now() - timedelta(hours=24)
        if datetime_data:
            recent_data = [
                entry for entry in datetime_data if entry["timestamp"] > cutoff_time
            ]
            is_numeric_timestamp = False
        elif numeric_data:
            recent_data = numeric_data
            is_numeric_timestamp = True
        else:
            return {
                "direction_stability": 0.5,
                "direction_change_rate": 0.0,
                "significant_shift": False,
            }

        if len(recent_data) < 3:
            return {
                "direction_stability": 0.5,
                "direction_change_rate": 0.0,
                "significant_shift": False,
            }

        directions = [entry["value"] for entry in recent_data]
        timestamps = [entry["timestamp"] for entry in recent_data]

        # Calculate stability
        try:
            volatility = statistics.stdev(directions) if len(directions) > 1 else 0
            stability = max(0.0, 1.0 - (volatility / 180.0))
        except statistics.StatisticsError:
            stability = 0.5

        # Calculate change rate
        direction_changes = []
        for i in range(1, len(directions)):
            change = self._calculate_angular_difference(
                directions[i - 1], directions[i]
            )
            direction_changes.append(change)

        # Calculate time span
        if is_numeric_timestamp:
            total_time_hours = float(timestamps[-1] - timestamps[0])
        else:
            total_time_hours = (timestamps[-1] - timestamps[0]).total_seconds() / 3600
        if total_time_hours > 0:
            avg_change_per_hour = (
                sum(abs(c) for c in direction_changes) / total_time_hours
            )
        else:
            avg_change_per_hour = 0.0

        # Detect significant shift
        recent_change = self._calculate_angular_difference(
            directions[0], directions[-1]
        )
        significant_shift = abs(recent_change) > 45

        return {
            "direction_stability": stability,
            "direction_change_rate": avg_change_per_hour,
            "significant_shift": significant_shift,
        }

    def _calculate_angular_difference(self, dir1: float, dir2: float) -> float:
        """Calculate smallest angular difference between two directions.

        Computes the shortest angular path between two compass directions,
        accounting for the circular nature of degrees (e.g., 350° to 10°
        is 20° not 340°).

        Args:
            dir1: First direction in degrees (0-360)
            dir2: Second direction in degrees (0-360)

        Returns:
            Signed angular difference in degrees (-180 to +180)
            Positive = clockwise rotation, Negative = counterclockwise
        """
        diff = (dir2 - dir1) % 360
        if diff > 180:
            diff -= 360
        return diff

    def _get_historical_trends(
        self, sensor_key: str, hours: int = 24
    ) -> Dict[str, Any]:
        """Get historical trends for a sensor.

        Delegates to TrendsAnalyzer to avoid code duplication.

        Args:
            sensor_key: Key of the sensor to analyze
            hours: Number of hours of history to consider

        Returns:
            Dictionary with trend statistics or empty dict if insufficient data
        """
        return self._trends_analyzer.get_historical_trends(sensor_key, hours)

    def _calculate_trend(self, x_values: List[float], y_values: List[float]) -> float:
        """Calculate linear trend (slope) using simple linear regression.

        Delegates to TrendsAnalyzer to avoid code duplication.

        Args:
            x_values: Independent variable (time) values
            y_values: Dependent variable (sensor reading) values

        Returns:
            Slope of linear regression line (rate of change per time unit)
        """
        return self._trends_analyzer.calculate_trend(x_values, y_values)

    def analyze_pressure_trends(self, altitude: float = 0.0) -> Dict[str, Any]:
        """Analyze historical pressure trends.

        Args:
            altitude: Altitude in meters (for future pressure correction)

        Returns:
            Dictionary with pressure trend analysis
        """
        return self._trends_analyzer.analyze_pressure_trends(altitude)
