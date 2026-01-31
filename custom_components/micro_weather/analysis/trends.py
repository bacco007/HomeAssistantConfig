"""Historical data trends and pattern analysis.

This module handles:
- Historical data storage
- Trend calculation and analysis
- Pattern recognition
- Seasonal factors
"""

from collections import deque
from datetime import datetime, timedelta
import logging
import statistics
from typing import Any, Dict, List, Optional

_LOGGER = logging.getLogger(__name__)


class TrendsAnalyzer:
    """Analyzes historical sensor data for trends and patterns."""

    def __init__(
        self, sensor_history: Optional[Dict[str, deque[Dict[str, Any]]]] = None
    ):
        """Initialize with sensor history.

        Args:
            sensor_history: Dictionary of sensor historical data deques
        """
        self._sensor_history = sensor_history or {}

    def store_historical_data(
        self, sensor_data: Dict[str, Any], weather_condition: Optional[str] = None
    ) -> None:
        """Store current sensor readings in historical buffer.

        Args:
            sensor_data: Current sensor readings to store
            weather_condition: Current weather condition (optional)
        """
        timestamp = datetime.now()

        for sensor_key, value in sensor_data.items():
            if sensor_key in self._sensor_history and value is not None:
                self._sensor_history[sensor_key].append(
                    {"timestamp": timestamp, "value": value}
                )

        # Store weather condition if provided
        if weather_condition:
            if "weather_condition" not in self._sensor_history:
                self._sensor_history["weather_condition"] = deque(maxlen=50)
            self._sensor_history["weather_condition"].append(
                {"timestamp": timestamp, "value": weather_condition}
            )

    def get_historical_trends(self, sensor_key: str, hours: int = 24) -> Dict[str, Any]:
        """Calculate historical trends for a sensor.

        Args:
            sensor_key: The sensor key to analyze
            hours: Number of hours to look back

        Returns:
            Dictionary with trend analysis including:
            - current: Most recent value
            - average: Average over the period
            - trend: Rate of change per hour
            - min/max: Min/max values
            - volatility: Standard deviation
        """
        if sensor_key not in self._sensor_history:
            return {}

        # Get data from the last N hours
        if sensor_key not in self._sensor_history:
            return {}

        if not self._sensor_history[sensor_key]:
            return {}

        # Separate numeric and datetime timestamps to handle mixed data
        # (some tests inject numeric timestamps)
        numeric_data = []
        datetime_data = []

        for entry in self._sensor_history[sensor_key]:
            timestamp = entry["timestamp"]
            if isinstance(timestamp, (int, float)):
                numeric_data.append(entry)
            elif isinstance(timestamp, datetime):
                datetime_data.append(entry)

        # Prefer datetime data if we have enough, otherwise use numeric
        cutoff_time = datetime.now() - timedelta(hours=hours)
        if datetime_data:
            recent_data = [
                entry for entry in datetime_data if entry["timestamp"] > cutoff_time
            ]
            is_numeric_timestamp = False
        elif numeric_data:
            recent_data = numeric_data
            is_numeric_timestamp = True
        else:
            return {}

        if len(recent_data) < 2:
            return {}

        values = [entry["value"] for entry in recent_data]
        timestamps = [entry["timestamp"] for entry in recent_data]

        # Calculate time differences in hours
        if is_numeric_timestamp:
            # For numeric timestamps (testing), use values directly as hours
            time_diffs = [float(t - timestamps[0]) for t in timestamps]
        else:
            # For datetime timestamps, calculate time differences
            time_diffs = [
                (t - timestamps[0]).total_seconds() / 3600 for t in timestamps
            ]

        try:
            # Basic statistics
            current = values[-1]
            average = statistics.mean(values)
            minimum = min(values)
            maximum = max(values)
            volatility = statistics.stdev(values) if len(values) > 1 else 0

            # Trend calculation (linear regression slope)
            trend = self.calculate_trend(time_diffs, values)

            return {
                "current": current,
                "average": average,
                "trend": trend,  # Change per hour
                "min": minimum,
                "max": maximum,
                "volatility": volatility,
                "sample_count": len(values),
            }
        except statistics.StatisticsError:
            return {}

    def calculate_trend(self, x_values: List[float], y_values: List[float]) -> float:
        """Calculate linear trend (slope) using simple linear regression.

        Args:
            x_values: Independent variable values (time)
            y_values: Dependent variable values (sensor readings)

        Returns:
            Slope of the trend line (change per unit time)
        """
        if len(x_values) != len(y_values) or len(x_values) < 2:
            return 0.0

        n = len(x_values)
        sum_x = sum(x_values)
        sum_y = sum(y_values)
        sum_xy = sum(x * y for x, y in zip(x_values, y_values))
        sum_x2 = sum(x * x for x in x_values)

        denominator = n * sum_x2 - sum_x * sum_x
        if denominator == 0:
            return 0.0

        slope = (n * sum_xy - sum_x * sum_y) / denominator
        return slope

    def analyze_historical_patterns(self) -> Dict[str, Any]:
        """Analyze historical weather patterns for pattern recognition.

        Returns:
            Dictionary with pattern analysis
        """
        # Get extended historical data
        temp_history = self.get_historical_trends("outdoor_temp", hours=168)  # 1 week
        pressure_history = self.get_historical_trends("pressure", hours=168)
        humidity_history = self.get_historical_trends("humidity", hours=168)

        patterns: Dict[str, Any] = {}

        # Temperature patterns
        if temp_history:
            temp_volatility = temp_history.get("volatility", 5)
            temp_trend = temp_history.get("trend", 0)
            patterns["temperature"] = {
                "volatility": temp_volatility,
                "trend_strength": (
                    abs(temp_trend) if isinstance(temp_trend, (int, float)) else 0
                ),
                "seasonal_factor": self.calculate_seasonal_factor(),
            }
            patterns["temperature_trend"] = (
                temp_trend if isinstance(temp_trend, (int, float)) else 0
            )
            patterns["daily_temperature_variation"] = temp_volatility * 2

        # Seasonal pattern detection
        if temp_history or pressure_history or humidity_history:
            month = datetime.now().month
            if month in [12, 1, 2]:
                patterns["seasonal_pattern"] = "winter"
            elif month in [3, 4, 5]:
                patterns["seasonal_pattern"] = "spring"
            elif month in [6, 7, 8]:
                patterns["seasonal_pattern"] = "summer"
            elif month in [9, 10, 11]:
                patterns["seasonal_pattern"] = "fall"
            else:
                patterns["seasonal_pattern"] = "normal"
        else:
            patterns["seasonal_pattern"] = "normal"

        # Pressure patterns
        if pressure_history:
            pressure_volatility = pressure_history.get("volatility", 0.5)
            patterns["pressure"] = {
                "volatility": pressure_volatility,
                "cyclical_patterns": self.detect_pressure_cycles(pressure_history),
            }

        # Correlation analysis
        correlations = self.analyze_weather_correlations(
            temp_history, pressure_history, humidity_history
        )
        patterns["correlations"] = correlations

        return patterns

    def calculate_seasonal_factor(self) -> float:
        """Calculate seasonal temperature variation factor.

        Returns:
            Seasonal factor (0-1, higher = more variable)
        """
        from ..meteorological_constants import TrendConstants

        month = datetime.now().month
        return TrendConstants.SEASONAL_FACTORS.get(month, 0.5)

    def detect_pressure_cycles(
        self, pressure_history: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Detect pressure system cycles and patterns.

        Args:
            pressure_history: Historical pressure data

        Returns:
            Dictionary with cycle analysis
        """
        from ..meteorological_constants import TrendConstants

        volatility = pressure_history.get("volatility", 0.5)

        if volatility > TrendConstants.VOLATILITY_ACTIVE:
            cycle_type = "active"  # Frequent system changes
        elif volatility > TrendConstants.VOLATILITY_MODERATE:
            cycle_type = "moderate"  # Normal system changes
        else:
            cycle_type = "stable"  # Persistent systems

        return {
            "cycle_type": cycle_type,
            "cycle_frequency": volatility * 2,  # Rough estimate
        }

    def analyze_weather_correlations(
        self,
        temp_history: Optional[Dict[str, Any]],
        pressure_history: Optional[Dict[str, Any]],
        humidity_history: Optional[Dict[str, Any]],
    ) -> Dict[str, float]:
        """Analyze correlations between weather variables.

        NOTE: This is a placeholder implementation. Real correlation analysis
        would require Pearson correlation coefficient calculation on the actual
        historical data points, not just trend directions.

        Args:
            temp_history: Temperature history data
            pressure_history: Pressure history data
            humidity_history: Humidity history data

        Returns:
            Dictionary of estimated correlation indicators (not true correlations)
            Values indicate general relationship direction, not statistical correlation
        """
        correlations = {}

        # Simplified correlation indicators based on trend alignment
        # These are NOT true Pearson correlation coefficients
        # TODO: Implement actual correlation calculation using historical data arrays

        # Temperature-pressure inverse relationship indicator
        if temp_history and pressure_history:
            temp_trend = temp_history.get("trend", 0)
            pressure_trend = pressure_history.get("trend", 0)
            if isinstance(temp_trend, (int, float)) and isinstance(
                pressure_trend, (int, float)
            ):
                # Indicate inverse relationship if both trends are non-zero
                correlations["temp_pressure"] = (
                    -0.6 if abs(temp_trend) > 0 and abs(pressure_trend) > 0 else 0.0
                )

        # Temperature-humidity inverse relationship indicator
        if temp_history and humidity_history:
            temp_trend = temp_history.get("trend", 0)
            humidity_trend = humidity_history.get("trend", 0)
            if isinstance(temp_trend, (int, float)) and isinstance(
                humidity_trend, (int, float)
            ):
                # Indicate inverse relationship if both trends are non-zero
                correlations["temp_humidity"] = (
                    -0.4 if abs(temp_trend) > 0 and abs(humidity_trend) > 0 else 0.0
                )

        return correlations

    def analyze_pressure_trends(self, altitude: float = 0.0) -> Dict[str, Any]:
        """Analyze historical pressure trends.

        Args:
            altitude: Altitude in meters (for future pressure correction)

        Returns:
            Dictionary with pressure trend analysis
        """
        return self.get_historical_trends("pressure", hours=24)

    def calculate_circular_mean(self, directions: List[float]) -> float:
        """Calculate the circular mean of wind directions.

        Args:
            directions: List of wind directions in degrees (0-360)

        Returns:
            Circular mean direction in degrees
        """
        if not directions:
            return 0.0

        import math

        # Convert to radians
        radians = [math.radians(d) for d in directions]

        # Calculate circular mean
        sin_sum = sum(math.sin(r) for r in radians)
        cos_sum = sum(math.cos(r) for r in radians)

        mean_radians = math.atan2(sin_sum, cos_sum)

        # Convert back to degrees (0-360)
        mean_degrees = math.degrees(mean_radians) % 360

        return mean_degrees
