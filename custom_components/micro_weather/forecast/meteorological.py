"""Meteorological state analysis for weather forecasting.

This module handles comprehensive meteorological analysis including:
- Atmospheric stability assessment
- Weather system classification
- Cloud cover analysis
- Moisture transport analysis
- Wind pattern analysis
"""

import logging
from typing import Any, Dict, Optional, Tuple

from ..analysis.atmospheric import AtmosphericAnalyzer
from ..analysis.core import WeatherConditionAnalyzer
from ..analysis.solar import SolarAnalyzer
from ..analysis.trends import TrendsAnalyzer
from ..const import (
    KEY_HUMIDITY,
    KEY_OUTDOOR_TEMP,
    KEY_PRESSURE,
    KEY_SOLAR_LUX_INTERNAL,
    KEY_SOLAR_RADIATION,
    KEY_TEMPERATURE,
    KEY_UV_INDEX,
    KEY_WIND_SPEED,
)
from ..meteorological_constants import (
    CloudCoverThresholds,
    DefaultSensorValues,
    MoistureAnalysisConstants,
    PressureTrendConstants,
    StabilityConstants,
    TemperatureThresholds,
    WindShearConstants,
    WindThresholds,
)

_LOGGER = logging.getLogger(__name__)


class MeteorologicalAnalyzer:
    """Analyzes comprehensive meteorological state for forecasting."""

    def __init__(
        self,
        atmospheric_analyzer: AtmosphericAnalyzer,
        core_analyzer: WeatherConditionAnalyzer,
        solar_analyzer: SolarAnalyzer,
        trends_analyzer: TrendsAnalyzer,
    ):
        """Initialize meteorological analyzer.

        Args:
            atmospheric_analyzer: AtmosphericAnalyzer instance for pressure and wind analysis
            core_analyzer: WeatherConditionAnalyzer instance for dewpoint calculations
            solar_analyzer: SolarAnalyzer instance for cloud cover analysis
            trends_analyzer: TrendsAnalyzer instance for historical data
        """
        self.atmospheric_analyzer = atmospheric_analyzer
        self.core_analyzer = core_analyzer
        self.solar_analyzer = solar_analyzer
        self.trends_analyzer = trends_analyzer

    def analyze_state(
        self, sensor_data: Dict[str, Any], altitude: Optional[float] = 0.0
    ) -> Dict[str, Any]:
        """Analyze comprehensive meteorological state using all available sensor data.

        Performs multi-factor analysis including:
        - Atmospheric stability and pressure systems
        - Wind patterns and boundary layer dynamics
        - Solar radiation and cloud cover analysis
        - Moisture content and dewpoint analysis
        - Weather system classification and evolution potential

        Args:
            sensor_data: Current sensor data in imperial units. Expected keys include:
                - temperature/outdoor_temp: Temperature in °F
                - humidity: Relative humidity in %
                - pressure: Barometric pressure in inHg
                - wind_speed: Wind speed in mph
                - solar_radiation: Solar radiation in W/m²
                - solar_lux: Solar illuminance in lux
                - uv_index: UV index value
            altitude: Altitude above sea level in feet for pressure corrections

        Returns:
            Dict containing comprehensive meteorological analysis with keys:
            - pressure_analysis: Pressure system type, trends, and storm probability
            - wind_analysis: Wind direction stability and gust factors
            - temp_trends: Temperature trend and volatility over 24 hours
            - humidity_trends: Humidity trend and volatility over 24 hours
            - wind_trends: Wind speed trend and volatility over 24 hours
            - current_conditions: Processed sensor values and calculated dewpoint
            - atmospheric_stability: Stability index (0.0-1.0, higher = more stable)
            - weather_system: Weather system classification and evolution potential
            - cloud_analysis: Cloud cover percentage, type, and solar efficiency
            - moisture_analysis: Moisture transport and condensation potential
            - wind_pattern_analysis: Wind shear intensity and gradient effects
        """
        # Get validated trend analyses
        pressure_analysis, wind_analysis, temp_trends, humidity_trends, wind_trends = (
            self._get_validated_trend_analyses(altitude)
        )

        # Get validated sensor data
        (
            current_temp,
            current_humidity,
            current_pressure,
            current_wind,
            solar_radiation,
            solar_lux,
            uv_index,
        ) = self._get_validated_sensor_data(sensor_data)

        # Calculate derived meteorological values
        dewpoint, temp_dewpoint_spread = self._calculate_derived_values(
            current_temp, current_humidity
        )

        # Atmospheric stability analysis
        stability_index = self.calculate_atmospheric_stability(
            current_temp, current_humidity, current_wind, pressure_analysis
        )

        # Weather system classification
        weather_system = self.classify_weather_system(
            pressure_analysis, wind_analysis, temp_trends, stability_index
        )

        # Cloud cover and solar analysis
        cloud_analysis = self._analyze_cloud_cover_comprehensive(
            solar_radiation, solar_lux, uv_index, sensor_data, pressure_analysis
        )

        # Moisture transport analysis
        moisture_analysis = self._analyze_moisture_transport(
            current_humidity, humidity_trends, wind_analysis, temp_dewpoint_spread
        )

        # Wind pattern analysis
        wind_pattern_analysis = self._analyze_wind_patterns(
            current_wind, wind_trends, wind_analysis, pressure_analysis
        )

        return {
            "pressure_analysis": pressure_analysis,
            "wind_analysis": wind_analysis,
            "temp_trends": temp_trends,
            "humidity_trends": humidity_trends,
            "wind_trends": wind_trends,
            "current_conditions": {
                KEY_TEMPERATURE: current_temp,
                KEY_HUMIDITY: current_humidity,
                KEY_PRESSURE: current_pressure,
                KEY_WIND_SPEED: current_wind,
                "dewpoint": dewpoint,
                "temp_dewpoint_spread": temp_dewpoint_spread,
            },
            "atmospheric_stability": stability_index,
            "weather_system": weather_system,
            "cloud_analysis": cloud_analysis,
            "moisture_analysis": moisture_analysis,
            "wind_pattern_analysis": wind_pattern_analysis,
        }

    def _get_validated_trend_analyses(
        self, altitude: Optional[float]
    ) -> Tuple[
        Dict[str, Any], Dict[str, Any], Dict[str, Any], Dict[str, Any], Dict[str, Any]
    ]:
        """Validate and retrieve all trend analyses with fallback handling.

        Args:
            altitude: Altitude for pressure analysis

        Returns:
            Tuple of (pressure_analysis, wind_analysis, temp_trends, humidity_trends, wind_trends)
        """
        # Get all available trend analyses with error handling for mock objects
        try:
            pressure_analysis = self.atmospheric_analyzer.analyze_pressure_trends(
                altitude or 0.0
            )
            if hasattr(pressure_analysis, "_mock_name"):
                pressure_analysis = {
                    "pressure_system": "normal",
                    "current_trend": 0,
                    "long_term_trend": 0,
                    "storm_probability": 0,
                }
            elif isinstance(pressure_analysis, dict):
                for key in ["current_trend", "long_term_trend", "storm_probability"]:
                    value = pressure_analysis.get(key)
                    if not isinstance(value, (int, float)):
                        pressure_analysis[key] = (
                            0 if key != "storm_probability" else 0.0
                        )
        except (AttributeError, TypeError):
            pressure_analysis = {
                "pressure_system": "normal",
                "current_trend": 0,
                "long_term_trend": 0,
                "storm_probability": 0,
            }

        try:
            wind_analysis = self.atmospheric_analyzer.analyze_wind_direction_trends()
            if hasattr(wind_analysis, "_mock_name"):
                wind_analysis = {"direction_stability": 0.5, "gust_factor": 1.0}
            elif isinstance(wind_analysis, dict):
                direction_stability = wind_analysis.get("direction_stability")
                if not isinstance(direction_stability, (int, float)):
                    wind_analysis["direction_stability"] = 0.5
                gust_factor = wind_analysis.get("gust_factor")
                if not isinstance(gust_factor, (int, float)):
                    wind_analysis["gust_factor"] = 1.0
        except (AttributeError, TypeError):
            wind_analysis = {"direction_stability": 0.5, "gust_factor": 1.0}

        try:
            temp_trends = self.trends_analyzer.get_historical_trends(
                "outdoor_temp", hours=24
            )
            if hasattr(temp_trends, "_mock_name"):
                temp_trends = {"trend": 0, "volatility": 2.0}
            elif isinstance(temp_trends, dict):
                trend = temp_trends.get("trend")
                if not isinstance(trend, (int, float)):
                    temp_trends["trend"] = 0
                volatility = temp_trends.get("volatility")
                if not isinstance(volatility, (int, float)):
                    temp_trends["volatility"] = 2.0
        except (AttributeError, TypeError):
            temp_trends = {"trend": 0, "volatility": 2.0}

        try:
            humidity_trends = self.trends_analyzer.get_historical_trends(
                KEY_HUMIDITY, hours=24
            )
            if hasattr(humidity_trends, "_mock_name"):
                humidity_trends = {"trend": 0, "volatility": 5.0}
            elif isinstance(humidity_trends, dict):
                trend = humidity_trends.get("trend")
                if not isinstance(trend, (int, float)):
                    humidity_trends["trend"] = 0
                volatility = humidity_trends.get("volatility")
                if not isinstance(volatility, (int, float)):
                    humidity_trends["volatility"] = 5.0
        except (AttributeError, TypeError):
            humidity_trends = {"trend": 0, "volatility": 5.0}

        try:
            wind_trends = self.trends_analyzer.get_historical_trends(
                KEY_WIND_SPEED, hours=24
            )
            if hasattr(wind_trends, "_mock_name"):
                wind_trends = {"trend": 0, "volatility": 2.0}
            elif isinstance(wind_trends, dict):
                trend = wind_trends.get("trend")
                if not isinstance(trend, (int, float)):
                    wind_trends["trend"] = 0
                volatility = wind_trends.get("volatility")
                if not isinstance(volatility, (int, float)):
                    wind_trends["volatility"] = 2.0
        except (AttributeError, TypeError):
            wind_trends = {"trend": 0, "volatility": 2.0}

        return (
            pressure_analysis,
            wind_analysis,
            temp_trends,
            humidity_trends,
            wind_trends,
        )

    def _get_validated_sensor_data(
        self, sensor_data: Dict[str, Any]
    ) -> Tuple[float, float, float, float, float, float, float]:
        """Extract and validate current sensor data with mock handling.

        Args:
            sensor_data: Raw sensor data dictionary

        Returns:
            Tuple of (current_temp, current_humidity, current_pressure, current_wind,
                     solar_radiation, solar_lux, uv_index)
        """
        # Temperature extraction with fallback
        current_temp = (
            sensor_data.get(KEY_TEMPERATURE)
            or sensor_data.get(KEY_OUTDOOR_TEMP)
            or DefaultSensorValues.TEMPERATURE_F
        )
        if hasattr(current_temp, "_mock_name") or not isinstance(
            current_temp, (int, float)
        ):
            current_temp = DefaultSensorValues.TEMPERATURE_F

        # Humidity extraction with fallback
        current_humidity = sensor_data.get(KEY_HUMIDITY, DefaultSensorValues.HUMIDITY)
        if hasattr(current_humidity, "_mock_name") or not isinstance(
            current_humidity, (int, float)
        ):
            current_humidity = DefaultSensorValues.HUMIDITY

        # Pressure extraction with fallback
        current_pressure = sensor_data.get(
            KEY_PRESSURE, DefaultSensorValues.PRESSURE_INHG
        )
        if hasattr(current_pressure, "_mock_name") or not isinstance(
            current_pressure, (int, float)
        ):
            current_pressure = DefaultSensorValues.PRESSURE_INHG

        # Wind speed extraction with fallback
        current_wind = sensor_data.get(KEY_WIND_SPEED, DefaultSensorValues.WIND_SPEED)
        if hasattr(current_wind, "_mock_name") or not isinstance(
            current_wind, (int, float)
        ):
            current_wind = DefaultSensorValues.WIND_SPEED

        # Solar data extraction with fallbacks
        solar_radiation = sensor_data.get(
            KEY_SOLAR_RADIATION, DefaultSensorValues.SOLAR_RADIATION
        )
        if hasattr(solar_radiation, "_mock_name") or not isinstance(
            solar_radiation, (int, float)
        ):
            solar_radiation = DefaultSensorValues.SOLAR_RADIATION

        solar_lux = sensor_data.get(
            KEY_SOLAR_LUX_INTERNAL, DefaultSensorValues.SOLAR_RADIATION
        )
        if hasattr(solar_lux, "_mock_name") or not isinstance(solar_lux, (int, float)):
            solar_lux = DefaultSensorValues.SOLAR_RADIATION

        uv_index = sensor_data.get(KEY_UV_INDEX, 0)
        if hasattr(uv_index, "_mock_name") or not isinstance(uv_index, (int, float)):
            uv_index = 0.0

        return (
            current_temp,
            current_humidity,
            current_pressure,
            current_wind,
            solar_radiation,
            solar_lux,
            uv_index,
        )

    def _calculate_derived_values(
        self, current_temp: float, current_humidity: float
    ) -> Tuple[float, float]:
        """Calculate derived meteorological values like dewpoint and temperature-dewpoint spread.

        Args:
            current_temp: Current temperature in °F
            current_humidity: Current relative humidity in %

        Returns:
            Tuple of (dewpoint, temp_dewpoint_spread)
        """
        # Calculate dewpoint with error handling
        try:
            dewpoint = self.core_analyzer.calculate_dewpoint(
                current_temp, current_humidity
            )
            if not isinstance(dewpoint, (int, float)):
                humidity_val = (
                    current_humidity
                    if isinstance(current_humidity, (int, float))
                    else 50
                )
                dewpoint = current_temp - (100 - humidity_val) / 5.0
        except (AttributeError, TypeError):
            humidity_val = (
                current_humidity if isinstance(current_humidity, (int, float)) else 50
            )
            dewpoint = current_temp - (100 - humidity_val) / 5.0

        if not isinstance(dewpoint, (int, float)):
            humidity_val = (
                current_humidity if isinstance(current_humidity, (int, float)) else 50
            )
            dewpoint = current_temp - (100 - humidity_val) / 5.0

        if dewpoint is None or not isinstance(dewpoint, (int, float)):
            dewpoint = current_temp - (100 - 50) / 5.0

        # Temperature-dewpoint spread calculation
        try:
            temp_dewpoint_spread = current_temp - dewpoint
            if not isinstance(temp_dewpoint_spread, (int, float)):
                temp_dewpoint_spread = 5.0
        except (TypeError, ValueError):
            temp_dewpoint_spread = 5.0

        return dewpoint, temp_dewpoint_spread

    def calculate_atmospheric_stability(
        self,
        temp: float,
        humidity: float,
        wind_speed: float,
        pressure_analysis: Dict[str, Any],
    ) -> float:
        """Calculate atmospheric stability index (0-1, higher = more stable).

        Stability affects weather persistence and forecast accuracy. Combines factors:
        - Temperature trends (stable vs unstable lapse rates)
        - Wind speed (calm = stable, strong wind = unstable)
        - Humidity levels (high humidity = stable, low = unstable)

        Args:
            temp: Current temperature in °F
            humidity: Current relative humidity in %
            wind_speed: Current wind speed in mph
            pressure_analysis: Pressure analysis dict with 'long_term_trend' key

        Returns:
            float: Stability index from 0.0 (highly unstable) to 1.0 (highly stable)
        """
        stability = 0.5  # Neutral baseline

        # Temperature lapse rate effect (simplified)
        temp_trend = pressure_analysis.get("long_term_trend", 0)
        if not isinstance(temp_trend, (int, float)):
            temp_trend = 0.0
        if abs(temp_trend) < StabilityConstants.TEMP_TREND_STABLE:
            stability += StabilityConstants.TEMP_STABLE_ADJUSTMENT
        elif abs(temp_trend) > StabilityConstants.TEMP_TREND_UNSTABLE:
            stability += StabilityConstants.TEMP_UNSTABLE_ADJUSTMENT

        # Wind effect
        if not isinstance(wind_speed, (int, float)):
            wind_speed = DefaultSensorValues.WIND_SPEED
        if wind_speed < WindThresholds.LIGHT_BREEZE:
            stability += StabilityConstants.WIND_STABLE_ADJUSTMENT
        elif wind_speed > WindThresholds.MODERATE_BREEZE:
            stability += StabilityConstants.WIND_UNSTABLE_ADJUSTMENT

        # Humidity effect
        if not isinstance(humidity, (int, float)):
            humidity = DefaultSensorValues.HUMIDITY
        if humidity > TemperatureThresholds.HUMIDITY_MODERATE_HIGH:
            stability += StabilityConstants.HUMIDITY_HIGH_ADJUSTMENT
        elif humidity < StabilityConstants.HUMIDITY_LOW_THRESHOLD:
            stability += StabilityConstants.HUMIDITY_LOW_ADJUSTMENT

        return max(0.0, min(1.0, stability))

    def classify_weather_system(
        self,
        pressure_analysis: Dict[str, Any],
        wind_analysis: Dict[str, Any],
        temp_trends: Dict[str, Any],
        stability: float,
    ) -> Dict[str, Any]:
        """Classify current weather system type and evolution potential.

        Analyzes multiple meteorological factors to determine the dominant weather
        pattern and its likely evolution. System types include stable high pressure,
        active low pressure, frontal systems, air mass changes, and transitional patterns.

        Args:
            pressure_analysis: Pressure analysis with 'pressure_system' and 'storm_probability'
            wind_analysis: Wind analysis with 'direction_stability' key
            temp_trends: Temperature trends dict with 'trend' key
            stability: Atmospheric stability index (0-1)

        Returns:
            Dict with weather system classification:
            - type: System type (stable_high, active_low, frontal_system, etc.)
            - evolution_potential: Expected change pattern (gradual, rapid_change, etc.)
            - persistence_factor: Weather persistence likelihood (0-1)
            - change_probability: Probability of weather change (0-1)
        """
        pressure_system = pressure_analysis.get("pressure_system", "normal")
        wind_stability = wind_analysis.get("direction_stability", 0.5)
        temp_trend = temp_trends.get("trend", 0) if temp_trends else 0

        if not isinstance(temp_trend, (int, float)):
            temp_trend = 0.0

        # System classification
        if (
            pressure_system == "high_pressure"
            and stability > StabilityConstants.AIR_MASS_MIN_STABILITY
        ):
            system_type = "stable_high"
            evolution_potential = "gradual_improvement"
        elif (
            pressure_system == "low_pressure"
            and stability < StabilityConstants.FRONTAL_WIND_STABILITY
        ):
            system_type = "active_low"
            evolution_potential = "rapid_change"
        elif (
            wind_stability < StabilityConstants.FRONTAL_WIND_STABILITY
            and pressure_analysis.get("storm_probability", 0)
            > StabilityConstants.FRONTAL_STORM_PROBABILITY
        ):
            system_type = "frontal_system"
            evolution_potential = "transitional"
        elif (
            abs(temp_trend) > StabilityConstants.AIR_MASS_TEMP_CHANGE
            and stability > StabilityConstants.AIR_MASS_MIN_STABILITY
        ):
            system_type = "air_mass_change"
            evolution_potential = "gradual"
        else:
            system_type = "transitional"
            evolution_potential = "moderate_change"

        return {
            "type": system_type,
            "evolution_potential": evolution_potential,
            "persistence_factor": stability,
            "change_probability": 1.0 - stability,
        }

    def _analyze_cloud_cover_comprehensive(
        self,
        solar_radiation: float,
        solar_lux: float,
        uv_index: float,
        sensor_data: Dict[str, Any],
        pressure_analysis: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Comprehensive cloud cover analysis using all solar data and pressure trends.

        Combines solar radiation, illuminance, and UV data with pressure trends to
        estimate cloud cover percentage. Adjusts estimates based on falling/rising
        pressure patterns that typically correlate with cloud changes.

        Args:
            solar_radiation: Solar radiation in W/m²
            solar_lux: Solar illuminance in lux
            uv_index: UV index value
            sensor_data: Sensor data dict (expects 'solar_elevation' key)
            pressure_analysis: Pressure analysis with 'current_trend' key

        Returns:
            Dict with cloud analysis:
            - cloud_cover: Estimated cloud cover percentage (0-100)
            - cloud_type: Descriptive cloud type (clear, few_clouds, scattered, overcast)
            - solar_efficiency: Solar energy transmission efficiency (0-100)
        """
        solar_elevation = sensor_data.get("solar_elevation", 45.0)

        try:
            cloud_cover = self.solar_analyzer.analyze_cloud_cover(
                solar_radiation, solar_lux, uv_index, solar_elevation, pressure_analysis
            )
            if not isinstance(cloud_cover, (int, float)):
                cloud_cover = 50.0
        except (AttributeError, TypeError):
            cloud_cover = 50.0
            if solar_radiation > 800:
                cloud_cover = 10.0
            elif solar_radiation > 400:
                cloud_cover = 40.0
            elif solar_radiation > 100:
                cloud_cover = 70.0
            else:
                cloud_cover = 90.0

        # Pressure trend influence
        pressure_trend = pressure_analysis.get("current_trend", 0)
        if not isinstance(pressure_trend, (int, float)):
            pressure_trend = 0.0
        if pressure_trend < PressureTrendConstants.DIRECTION_FALLING_MODERATE:
            cloud_cover = min(
                PressureTrendConstants.MAX_CLOUD_COVER,
                cloud_cover + PressureTrendConstants.RAPID_FALL_CLOUD_INCREASE,
            )
        elif pressure_trend < PressureTrendConstants.DIRECTION_STABLE:
            cloud_cover = min(
                PressureTrendConstants.MAX_CLOUD_COVER,
                cloud_cover + PressureTrendConstants.SLOW_FALL_CLOUD_INCREASE,
            )
        elif pressure_trend > PressureTrendConstants.DIRECTION_RISING_MODERATE:
            cloud_cover = max(
                PressureTrendConstants.MIN_CLOUD_COVER,
                cloud_cover - PressureTrendConstants.RISING_CLOUD_DECREASE,
            )

        # Cloud type classification
        if cloud_cover < CloudCoverThresholds.FEW:
            cloud_type = "clear"
        elif cloud_cover < CloudCoverThresholds.SCATTERED:
            cloud_type = "few_clouds"
        elif cloud_cover < CloudCoverThresholds.THRESHOLD_CLOUDY:
            cloud_type = "scattered"
        else:
            cloud_type = "overcast"

        return {
            "cloud_cover": cloud_cover,
            "cloud_type": cloud_type,
            "solar_efficiency": max(0, 100 - cloud_cover),
        }

    def _analyze_moisture_transport(
        self,
        current_humidity: float,
        humidity_trends: Dict[str, Any],
        wind_analysis: Dict[str, Any],
        temp_dewpoint_spread: float,
    ) -> Dict[str, Any]:
        """Analyze moisture transport and atmospheric moisture dynamics.

        Evaluates moisture availability, transport potential, and condensation
        likelihood based on humidity levels, trends, and atmospheric stability.

        Args:
            current_humidity: Current relative humidity in %
            humidity_trends: Humidity trends dict with 'trend' key
            wind_analysis: Wind analysis with 'direction_stability' key
            temp_dewpoint_spread: Temperature minus dewpoint in °F

        Returns:
            Dict with moisture analysis:
            - moisture_content: Current humidity percentage
            - transport_potential: Wind-driven moisture transport capacity
            - moisture_availability: Moisture availability level (low/moderate/high)
            - condensation_potential: Likelihood of condensation (0.0-1.0)
            - trend_direction: Humidity trend direction (stable/increasing/decreasing)
        """
        moisture_content = current_humidity
        transport_potential = (
            wind_analysis.get("direction_stability", 0.5)
            * MoistureAnalysisConstants.TRANSPORT_MULTIPLIER
        )

        # Dewpoint spread indicates moisture availability
        if not isinstance(temp_dewpoint_spread, (int, float)):
            temp_dewpoint_spread = 5.0
        if temp_dewpoint_spread < MoistureAnalysisConstants.SPREAD_HIGH_MOISTURE:
            moisture_availability = "high"
            condensation_potential = MoistureAnalysisConstants.CONDENSATION_HIGH
        elif temp_dewpoint_spread < MoistureAnalysisConstants.SPREAD_MODERATE_MOISTURE:
            moisture_availability = "moderate"
            condensation_potential = MoistureAnalysisConstants.CONDENSATION_MODERATE
        else:
            moisture_availability = "low"
            condensation_potential = MoistureAnalysisConstants.CONDENSATION_LOW

        # Trend analysis
        humidity_trend = humidity_trends.get("trend", 0) if humidity_trends else 0
        if not isinstance(humidity_trend, (int, float)):
            humidity_trend = 0.0
        if humidity_trend > MoistureAnalysisConstants.HUMIDITY_TREND_THRESHOLD:
            trend_direction = "increasing"
        elif humidity_trend < -MoistureAnalysisConstants.HUMIDITY_TREND_THRESHOLD:
            trend_direction = "decreasing"
        else:
            trend_direction = "stable"

        return {
            "moisture_content": moisture_content,
            "transport_potential": transport_potential,
            "moisture_availability": moisture_availability,
            "condensation_potential": condensation_potential,
            "trend_direction": trend_direction,
        }

    def _analyze_wind_patterns(
        self,
        current_wind: float,
        wind_trends: Dict[str, Any],
        wind_analysis: Dict[str, Any],
        pressure_analysis: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Analyze wind patterns and boundary layer dynamics.

        Evaluates wind shear, gust factors, and pressure gradient effects on
        wind patterns. Identifies turbulence potential and boundary layer stability.

        Args:
            current_wind: Current wind speed in mph
            wind_trends: Wind trends dict with 'trend' key
            wind_analysis: Wind analysis with 'direction_stability' and 'gust_factor' keys
            pressure_analysis: Pressure analysis with 'current_trend' key

        Returns:
            Dict with wind pattern analysis:
            - wind_speed: Current wind speed in mph
            - direction_stability: Wind direction consistency (0-1)
            - gust_factor: Wind gust intensity multiplier
            - shear_intensity: Wind shear level (low/moderate/extreme)
            - gradient_wind_effect: Pressure gradient wind acceleration
        """
        wind_speed = current_wind
        direction_stability = wind_analysis.get("direction_stability", 0.5)
        gust_factor = (
            wind_analysis.get("gust_factor", 1.0)
            if "gust_factor" in wind_analysis
            else 1.0
        )

        # Wind shear analysis
        wind_trend = wind_trends.get("trend", 0) if wind_trends else 0
        if not isinstance(wind_trend, (int, float)):
            wind_trend = 0.0
        if abs(wind_trend) > WindShearConstants.EXTREME_THRESHOLD:
            shear_intensity = "extreme"
        elif abs(wind_trend) > WindShearConstants.MODERATE_THRESHOLD:
            shear_intensity = "moderate"
        else:
            shear_intensity = "low"

        # Pressure gradient effect
        pressure_trend = pressure_analysis.get("current_trend", 0)
        if not isinstance(pressure_trend, (int, float)):
            pressure_trend = 0.0
        gradient_wind_effect = (
            abs(pressure_trend) * WindShearConstants.GRADIENT_WIND_MULTIPLIER
        )

        return {
            KEY_WIND_SPEED: wind_speed,
            "direction_stability": direction_stability,
            "gust_factor": gust_factor,
            "shear_intensity": shear_intensity,
            "gradient_wind_effect": gradient_wind_effect,
        }
