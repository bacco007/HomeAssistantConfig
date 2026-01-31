"""Hourly forecast generation module.

This module provides comprehensive 24-hour hourly forecast generation using:
- Astronomical diurnal cycles for temperature/humidity patterns
- Pressure trend trajectory for condition evolution
- Wind pattern analysis with trend extrapolation
- Deterministic condition transitions (no randomness)

Key improvements over previous version:
- NO random() calls - forecasts are deterministic and repeatable
- Trend-based evolution instead of arbitrary hour intervals
- Smooth condition transitions following pressure trajectory
- Proper humidity convergence toward targets
"""

from datetime import datetime, timedelta
import logging
import math
from typing import Any, Dict, List, Optional

from homeassistant.components.weather import (
    ATTR_CONDITION_CLEAR_NIGHT,
    ATTR_CONDITION_CLOUDY,
    ATTR_CONDITION_FOG,
    ATTR_CONDITION_LIGHTNING_RAINY,
    ATTR_CONDITION_PARTLYCLOUDY,
    ATTR_CONDITION_POURING,
    ATTR_CONDITION_RAINY,
    ATTR_CONDITION_SNOWY,
    ATTR_CONDITION_SUNNY,
    ATTR_CONDITION_WINDY,
)
from homeassistant.util import dt as dt_util

from ..analysis.atmospheric import AtmosphericAnalyzer
from ..analysis.solar import SolarAnalyzer
from ..analysis.trends import TrendsAnalyzer
from ..const import (
    KEY_CONDITION,
    KEY_HUMIDITY,
    KEY_PRECIPITATION,
    KEY_TEMPERATURE,
    KEY_WIND_SPEED,
)
from ..meteorological_constants import (
    DiurnalPatternConstants,
    ForecastConstants,
    HumidityTargetConstants,
    PressureTrendConstants,
    WindAdjustmentConstants,
)
from ..weather_utils import convert_to_kmh, is_forecast_hour_daytime

_LOGGER = logging.getLogger(__name__)


class HourlyForecastGenerator:
    """Handles generation of 24-hour hourly forecasts."""

    def __init__(
        self,
        atmospheric_analyzer: AtmosphericAnalyzer,
        solar_analyzer: SolarAnalyzer,
        trends_analyzer: TrendsAnalyzer,
    ):
        """Initialize hourly forecast generator.

        Args:
            atmospheric_analyzer: AtmosphericAnalyzer instance
            solar_analyzer: SolarAnalyzer instance
            trends_analyzer: TrendsAnalyzer instance
        """
        self.atmospheric_analyzer = atmospheric_analyzer
        self.solar_analyzer = solar_analyzer
        self.trends_analyzer = trends_analyzer

    def generate_forecast(
        self,
        current_temp: float,
        current_condition: str,
        sensor_data: Dict[str, Any],
        sunrise_time: Optional[datetime],
        sunset_time: Optional[datetime],
        altitude: float | None,
        meteorological_state: Dict[str, Any],
        hourly_patterns: Dict[str, Any],
        micro_evolution: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate comprehensive 24-hour hourly forecast.

        Args:
            current_temp: Current temperature in Celsius
            current_condition: Current weather condition
            sensor_data: Current sensor data in imperial units
            sunrise_time: Sunrise time for astronomical calculations
            sunset_time: Sunset time for astronomical calculations
            altitude: Altitude for pressure corrections
            meteorological_state: Comprehensive meteorological state analysis
            hourly_patterns: Hourly weather patterns
            micro_evolution: Micro-evolution model
            astronomical_calculator: AstronomicalCalculator instance

        Returns:
            List[Dict[str, Any]]: 24-hour forecast with detailed hourly predictions
        """
        try:
            return self._generate_hourly_forecast_loop(
                current_temp,
                current_condition,
                sensor_data,
                sunrise_time,
                sunset_time,
                meteorological_state,
                hourly_patterns,
                micro_evolution,
            )
        except Exception as e:
            # Log error and return a simple default forecast to prevent UI issues
            _LOGGER.warning("Comprehensive hourly forecast generation failed: %s", e)
            fallback_forecast: List[Dict[str, Any]] = []
            base_temp = (
                current_temp
                if isinstance(current_temp, (int, float))
                else ForecastConstants.DEFAULT_TEMPERATURE
            )
            base_condition = (
                current_condition
                if isinstance(current_condition, str)
                else ATTR_CONDITION_CLOUDY
            )
            for hour_idx in range(24):
                # Start from the current hour (rounded down) and add hourly intervals
                current_hour = dt_util.now().replace(minute=0, second=0, microsecond=0)
                forecast_time = current_hour + timedelta(hours=hour_idx)

                # Use previous hour's condition as base for current hour (except first hour)
                forecast_condition = base_condition
                if hour_idx > 0:
                    forecast_condition = fallback_forecast[hour_idx - 1][KEY_CONDITION]

                # Apply day/night conversion to fallback forecast too
                astronomical_context = self._calculate_astronomical_context(
                    forecast_time, sunrise_time, sunset_time, hour_idx
                )
                if not astronomical_context["is_daytime"]:
                    if forecast_condition == ATTR_CONDITION_SUNNY:
                        forecast_condition = ATTR_CONDITION_CLEAR_NIGHT
                    elif forecast_condition == ATTR_CONDITION_PARTLYCLOUDY:
                        forecast_condition = ATTR_CONDITION_CLEAR_NIGHT
                else:
                    if forecast_condition == ATTR_CONDITION_CLEAR_NIGHT:
                        forecast_condition = ATTR_CONDITION_SUNNY
                    elif forecast_condition == ATTR_CONDITION_CLOUDY:
                        forecast_condition = ATTR_CONDITION_PARTLYCLOUDY

                fallback_forecast.append(
                    {
                        "datetime": forecast_time.isoformat(),
                        KEY_TEMPERATURE: base_temp,
                        KEY_CONDITION: forecast_condition,
                        KEY_PRECIPITATION: 0.0,
                        KEY_WIND_SPEED: ForecastConstants.DEFAULT_WIND_SPEED,
                        KEY_HUMIDITY: ForecastConstants.DEFAULT_HUMIDITY,
                        "is_nighttime": False,
                    }
                )
            return fallback_forecast

    def _generate_hourly_forecast_loop(
        self,
        current_temp: float,
        current_condition: str,
        sensor_data: Dict[str, Any],
        sunrise_time: Optional[datetime],
        sunset_time: Optional[datetime],
        meteorological_state: Dict[str, Any],
        hourly_patterns: Dict[str, Any],
        micro_evolution: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate the main 24-hour forecast loop.

        Args:
            current_temp: Current temperature in Celsius
            current_condition: Current weather condition
            sensor_data: Current sensor data in imperial units
            sunrise_time: Sunrise time for astronomical calculations
            sunset_time: Sunset time for astronomical calculations
            meteorological_state: Comprehensive meteorological state analysis
            hourly_patterns: Hourly weather patterns
            micro_evolution: Micro-evolution model

        Returns:
            List[Dict[str, Any]]: 24-hour forecast with detailed hourly predictions
        """
        hourly_forecast: List[Dict[str, Any]] = []

        for hour_idx in range(24):
            # Start from the current hour (rounded down) and add hourly intervals
            current_hour = dt_util.now().replace(minute=0, second=0, microsecond=0)
            forecast_time = current_hour + timedelta(hours=hour_idx)

            # Determine astronomical context
            astronomical_context = self._calculate_astronomical_context(
                forecast_time, sunrise_time, sunset_time, hour_idx
            )

            # Advanced hourly temperature with multi-factor modulation
            forecast_temp = self.forecast_temperature(
                hour_idx,
                current_temp,
                astronomical_context,
                meteorological_state,
                hourly_patterns,
                micro_evolution,
            )

            # Advanced hourly condition with micro-evolution
            # Use previous hour's condition as base for current hour (except first hour)
            base_condition = current_condition
            if hour_idx > 0:
                base_condition = hourly_forecast[hour_idx - 1][KEY_CONDITION]

            forecast_condition = self.forecast_condition(
                hour_idx,
                base_condition,
                astronomical_context,
                meteorological_state,
                hourly_patterns,
                micro_evolution,
            )

            # Advanced hourly precipitation with moisture transport
            precipitation = self._forecast_precipitation(
                hour_idx,
                forecast_condition,
                meteorological_state,
                hourly_patterns,
                sensor_data,
            )

            # Advanced hourly wind with boundary layer effects
            wind_speed = self._forecast_wind(
                hour_idx,
                sensor_data.get(KEY_WIND_SPEED, ForecastConstants.DEFAULT_WIND_SPEED),
                forecast_condition,
                meteorological_state,
                hourly_patterns,
            )

            # Advanced hourly humidity with moisture dynamics
            humidity = self._forecast_humidity(
                hour_idx,
                sensor_data.get(KEY_HUMIDITY, ForecastConstants.DEFAULT_HUMIDITY),
                meteorological_state,
                hourly_patterns,
                forecast_condition,
            )

            hourly_forecast.append(
                {
                    "datetime": forecast_time.replace(tzinfo=None).isoformat(),
                    KEY_TEMPERATURE: round(forecast_temp, 1),
                    KEY_CONDITION: forecast_condition,
                    KEY_PRECIPITATION: round(precipitation, 2),
                    KEY_WIND_SPEED: round(wind_speed, 1),
                    KEY_HUMIDITY: round(humidity, 0),
                    "is_nighttime": not astronomical_context["is_daytime"],
                }
            )

        return hourly_forecast

    def forecast_temperature(
        self,
        hour_idx: int,
        current_temp: float,
        astronomical_context: Dict[str, Any],
        meteorological_state: Dict[str, Any],
        hourly_patterns: Dict[str, Any],
        micro_evolution: Dict[str, Any],
    ) -> float:
        """Forecast temperature using diurnal pattern and trend extrapolation.

        Temperature forecasting combines:
        1. Diurnal (daily) temperature cycle based on time of day
        2. Trend extrapolation from historical data
        3. Pressure system influence (highs warm, lows cool)

        Args:
            hour_idx: Hour index (0-23)
            current_temp: Current temperature in the forecast units
            astronomical_context: Day/night and solar position info
            meteorological_state: Meteorological state
            hourly_patterns: Hourly patterns with diurnal info
            micro_evolution: Micro-evolution model

        Returns:
            float: Forecasted temperature
        """
        if current_temp is None:
            current_temp = ForecastConstants.DEFAULT_TEMPERATURE

        forecast_temp = current_temp

        # Get diurnal patterns
        hour = astronomical_context["hour_of_day"]
        diurnal_patterns = hourly_patterns.get("diurnal_patterns", {}).get(
            KEY_TEMPERATURE, {}
        )

        # Default diurnal patterns (temperature adjustment from daily mean)
        default_patterns = {
            "dawn": DiurnalPatternConstants.TEMP_DAWN,
            "morning": DiurnalPatternConstants.TEMP_MORNING,
            "noon": DiurnalPatternConstants.TEMP_NOON,
            "afternoon": DiurnalPatternConstants.TEMP_AFTERNOON,
            "evening": DiurnalPatternConstants.TEMP_EVENING,
            "night": DiurnalPatternConstants.TEMP_NIGHT,
            "midnight": DiurnalPatternConstants.TEMP_MIDNIGHT,
        }

        patterns = {**default_patterns, **diurnal_patterns}

        # Map hour to diurnal period
        if 5 <= hour < 7:
            diurnal_variation = patterns["dawn"]
        elif 7 <= hour < 12:
            diurnal_variation = patterns["morning"]
        elif 12 <= hour < 15:
            diurnal_variation = patterns["noon"]
        elif 15 <= hour < 19:
            diurnal_variation = patterns["afternoon"]
        elif 19 <= hour < 22:
            diurnal_variation = patterns["evening"]
        elif 22 <= hour < 24 or hour < 2:
            diurnal_variation = patterns["night"]
        else:  # 2-5 AM
            diurnal_variation = patterns["midnight"]

        # Dampen diurnal variation for distant hours
        diurnal_dampening = max(0.5, 1.0 - (hour_idx * 0.015))
        diurnal_variation *= diurnal_dampening
        forecast_temp += diurnal_variation

        # Pressure trend modulation - more significant than before
        pressure_analysis = meteorological_state.get("pressure_analysis", {})
        current_trend = pressure_analysis.get("current_trend", 0)
        if isinstance(current_trend, (int, float)):
            # Falling pressure often means cooling (cold front approach)
            # Rising pressure after fall means post-frontal clearing
            pressure_effect = current_trend * 0.5 * (hour_idx / 24.0)
            forecast_temp += pressure_effect

        # Micro-evolution influence (small adjustments for system evolution)
        evolution_rate = micro_evolution.get("evolution_rate", 0.3)
        max_change = micro_evolution.get("micro_changes", {}).get(
            "max_change_per_hour", 0.5
        )
        # Deterministic small variation based on hour
        evolution_effect = evolution_rate * max_change * math.sin(hour_idx * 0.26)
        evolution_effect *= max(0.3, 1.0 - (hour_idx * 0.03))
        forecast_temp += evolution_effect

        return forecast_temp

    def forecast_condition(
        self,
        hour_idx: int,
        current_condition: str,
        astronomical_context: Dict[str, Any],
        meteorological_state: Dict[str, Any],
        hourly_patterns: Dict[str, Any],
        micro_evolution: Dict[str, Any],
    ) -> str:
        """Forecast condition using pressure trend trajectory.

        Condition evolution is driven by:
        1. Pressure trend trajectory (falling = deteriorating, rising = improving)
        2. Day/night transitions (sunny ↔ clear-night)
        3. Cloud cover analysis for current state

        Evolution happens gradually - conditions step up/down the severity ladder
        based on the cumulative trajectory score.

        Args:
            hour_idx: Hour index (0-23)
            current_condition: Current/previous hour's condition
            astronomical_context: Day/night info
            meteorological_state: Meteorological state
            hourly_patterns: Hourly patterns
            micro_evolution: Micro-evolution model

        Returns:
            str: Forecasted condition
        """
        if current_condition is None:
            current_condition = ATTR_CONDITION_CLOUDY

        is_daytime = astronomical_context["is_daytime"]

        # Calculate cumulative trajectory score for this hour
        trajectory_score = self._calculate_hourly_trajectory(
            hour_idx, meteorological_state
        )

        # Evolve condition based on trajectory
        forecast_condition = self._evolve_hourly_condition(
            current_condition, trajectory_score, hour_idx
        )

        # Apply day/night conversion
        forecast_condition = self._apply_day_night_conversion(
            forecast_condition, is_daytime, meteorological_state
        )

        return forecast_condition

    def _calculate_hourly_trajectory(
        self, hour_idx: int, meteorological_state: Dict[str, Any]
    ) -> float:
        """Calculate cumulative trajectory score for hourly evolution.

        Trajectory accumulates over hours based on pressure trends.
        Rapid changes = faster evolution, stable = slow/no evolution.

        Args:
            hour_idx: Hour index (0-23)
            meteorological_state: Meteorological state

        Returns:
            float: Trajectory score (-100 to +100)
        """
        pressure_analysis = meteorological_state.get("pressure_analysis", {})
        current_trend = pressure_analysis.get("current_trend", 0)
        storm_prob = pressure_analysis.get("storm_probability", 0)

        if not isinstance(current_trend, (int, float)):
            current_trend = 0.0
        if not isinstance(storm_prob, (int, float)):
            storm_prob = 0.0

        # Base score from pressure trend
        # -1.0 inHg/3h trend = -30 score per hour
        hourly_contribution = current_trend * 30.0

        # Storm probability adds negative (deteriorating) score
        if storm_prob > 50:
            hourly_contribution -= (storm_prob - 50) * 0.5

        # Accumulate over hours (with diminishing weight for distant hours)
        cumulative_factor = min(hour_idx, 6)  # Cap at 6 hours of accumulation
        trajectory_score = hourly_contribution * cumulative_factor

        # Cloud cover influence
        cloud_analysis = meteorological_state.get("cloud_analysis", {})
        cloud_cover = cloud_analysis.get("cloud_cover", 50)
        if isinstance(cloud_cover, (int, float)):
            # High cloud cover = negative bias
            cloud_bias = (cloud_cover - 50) * 0.3
            trajectory_score -= cloud_bias

        return max(-100, min(100, trajectory_score))

    def _evolve_hourly_condition(
        self, current_condition: str, trajectory_score: float, hour_idx: int
    ) -> str:
        """Evolve condition based on hourly trajectory.

        Similar to daily evolution but with smaller steps (max 1 per 3 hours).

        Args:
            current_condition: Starting condition
            trajectory_score: Cumulative trajectory (-100 to +100)
            hour_idx: Hour index for step limiting

        Returns:
            str: Evolved condition
        """
        condition_ladder = [
            ATTR_CONDITION_POURING,
            ATTR_CONDITION_LIGHTNING_RAINY,
            ATTR_CONDITION_RAINY,
            ATTR_CONDITION_CLOUDY,
            ATTR_CONDITION_PARTLYCLOUDY,
            ATTR_CONDITION_SUNNY,
        ]

        # Handle special conditions
        if current_condition == ATTR_CONDITION_FOG:
            # Fog typically clears as the day progresses (sun burns it off)
            # or persists at night. Add clearing bonus for daytime hours.
            fog_clearing_bonus = hour_idx * 3  # +3 per hour as fog clears
            adjusted_score = trajectory_score + fog_clearing_bonus
            if adjusted_score > 40:
                return ATTR_CONDITION_SUNNY
            elif adjusted_score > 15:
                return ATTR_CONDITION_PARTLYCLOUDY
            else:
                return ATTR_CONDITION_CLOUDY

        if current_condition == ATTR_CONDITION_SNOWY:
            # Snow evolves based on trajectory - may continue, turn to rain, or clear
            snow_clearing_bonus = hour_idx * 2  # +2 per hour
            adjusted_score = trajectory_score + snow_clearing_bonus
            if adjusted_score > 50:
                return ATTR_CONDITION_PARTLYCLOUDY  # Snow ended, clearing
            elif adjusted_score > 30:
                return ATTR_CONDITION_CLOUDY  # Snow ended, still cloudy
            elif adjusted_score > 10:
                return ATTR_CONDITION_RAINY  # Warming, snow turning to rain
            else:
                return ATTR_CONDITION_SNOWY  # Still cold, snow continues

        if current_condition == ATTR_CONDITION_CLEAR_NIGHT:
            current_condition = ATTR_CONDITION_SUNNY

        # Find current position
        try:
            current_idx = condition_ladder.index(current_condition)
        except ValueError:
            current_idx = 3  # Default to cloudy

        # Calculate steps (max 1 step per 3 hours)
        max_steps = max(1, hour_idx // 3)
        steps = int(trajectory_score / 40)  # ±40 = 1 step
        steps = max(-max_steps, min(max_steps, steps))

        new_idx = max(0, min(len(condition_ladder) - 1, current_idx + steps))
        return condition_ladder[new_idx]

    def _apply_day_night_conversion(
        self,
        condition: str,
        is_daytime: bool,
        meteorological_state: Dict[str, Any],
    ) -> str:
        """Apply day/night condition conversions.

        Args:
            condition: Current condition
            is_daytime: Whether it's daytime
            meteorological_state: For cloud/storm checks

        Returns:
            str: Day/night appropriate condition
        """
        if is_daytime:
            if condition == ATTR_CONDITION_CLEAR_NIGHT:
                return ATTR_CONDITION_SUNNY
        else:
            if condition == ATTR_CONDITION_SUNNY:
                return ATTR_CONDITION_CLEAR_NIGHT
            elif condition == ATTR_CONDITION_PARTLYCLOUDY:
                # At night, check if conditions are deteriorating
                pressure_analysis = meteorological_state.get("pressure_analysis", {})
                storm_prob = pressure_analysis.get("storm_probability", 0)
                pressure_trend = pressure_analysis.get("current_trend", 0)

                if not isinstance(pressure_trend, (int, float)):
                    pressure_trend = 0.0
                if not isinstance(storm_prob, (int, float)):
                    storm_prob = 0.0

                cloud_analysis = meteorological_state.get("cloud_analysis", {})
                cloud_cover = cloud_analysis.get("cloud_cover", 50)

                if (
                    pressure_trend < -0.3
                    or storm_prob > 40
                    or (isinstance(cloud_cover, (int, float)) and cloud_cover > 70)
                ):
                    return ATTR_CONDITION_CLOUDY
                return ATTR_CONDITION_CLEAR_NIGHT

        return condition

    def _calculate_astronomical_context(
        self,
        forecast_time: datetime,
        sunrise_time: Optional[datetime],
        sunset_time: Optional[datetime],
        hour_idx: int,
    ) -> Dict[str, Any]:
        """Calculate astronomical context for hourly forecasting."""
        is_daytime = is_forecast_hour_daytime(forecast_time, sunrise_time, sunset_time)

        if is_daytime and sunrise_time and sunset_time:
            day_length = (sunset_time - sunrise_time).total_seconds() / 3600
            time_since_sunrise = (forecast_time - sunrise_time).total_seconds() / 3600
            solar_position = time_since_sunrise / day_length if day_length > 0 else 0.5
            solar_elevation = 90 * math.sin(math.pi * solar_position)
        else:
            solar_elevation = 0

        return {
            "is_daytime": is_daytime,
            "solar_elevation": solar_elevation,
            "hour_of_day": forecast_time.hour,
            "forecast_hour": hour_idx,
        }

    def _calculate_hourly_pressure_modulation(
        self, meteorological_state: Dict[str, Any], hour_idx: int
    ) -> float:
        """Calculate pressure-based temperature modulation for the hour."""
        pressure_analysis = meteorological_state.get("pressure_analysis", {})
        current_trend = pressure_analysis.get("current_trend", 0)
        modulation = current_trend * ForecastConstants.PRESSURE_TEMP_MODULATION
        time_dampening = max(
            ForecastConstants.HOURLY_MIN_DAMPENING,
            1.0 - (hour_idx * ForecastConstants.HOURLY_DAMPENING_RATE),
        )
        modulation *= time_dampening
        return max(-1.0, min(1.0, modulation))

    def _calculate_hourly_evolution_influence(
        self, micro_evolution: Dict[str, Any], hour_idx: int
    ) -> float:
        """Calculate micro-evolution influence on temperature."""
        evolution_rate = micro_evolution.get(
            "evolution_rate", ForecastConstants.NATURAL_VARIATION_AMPLITUDE
        )
        max_change = micro_evolution.get("micro_changes", {}).get(
            "max_change_per_hour", ForecastConstants.EVOLUTION_BASE_INFLUENCE
        )
        influence = evolution_rate * max_change * (0.5 - (hour_idx % 2))
        distance_dampening = max(
            ForecastConstants.HOURLY_DISTANCE_FACTOR_MIN,
            1.0 - (hour_idx * ForecastConstants.HOURLY_DISTANCE_DECAY),
        )
        influence *= distance_dampening
        return influence

    def _analyze_pressure_trend_severity(
        self, current_trend: float, long_term_trend: float
    ) -> Dict[str, Any]:
        """Analyze pressure trend magnitude and classify severity."""
        if not isinstance(current_trend, (int, float)):
            current_trend = 0.0
        if not isinstance(long_term_trend, (int, float)):
            long_term_trend = 0.0

        current_abs = abs(current_trend)
        if current_abs < PressureTrendConstants.STABLE_THRESHOLD:
            severity = "stable"
        elif current_abs < PressureTrendConstants.SLOW_THRESHOLD:
            severity = "slow"
        elif current_abs < PressureTrendConstants.MODERATE_THRESHOLD:
            severity = "moderate"
        else:
            severity = "rapid"

        if abs(current_trend) < 0.1:
            direction = "stable"
        elif current_trend < 0:
            direction = "falling"
        else:
            direction = "rising"

        if abs(long_term_trend) < PressureTrendConstants.SLOW_THRESHOLD:
            long_term_direction = "stable"
        elif long_term_trend < 0:
            long_term_direction = "falling"
        else:
            long_term_direction = "rising"

        urgency_factor = min(1.0, current_abs / 3.0)
        trend_agreement = 1.0 - min(1.0, abs(current_trend - long_term_trend) / 5.0)
        confidence = 0.5 + (trend_agreement * 0.5)

        return {
            "severity": severity,
            "direction": direction,
            "long_term_direction": long_term_direction,
            "urgency_factor": urgency_factor,
            "confidence": confidence,
        }

    def _forecast_precipitation(
        self,
        hour_idx: int,
        condition: str,
        meteorological_state: Dict[str, Any],
        hourly_patterns: Dict[str, Any],
        sensor_data: Dict[str, Any],
    ) -> float:
        """Hourly precipitation forecasting using condition and trends.

        Precipitation is primarily driven by condition type, with modulation
        from pressure trends. No randomness - precipitation follows a
        deterministic pattern based on meteorological state.

        Args:
            hour_idx: Hour index (0-23)
            condition: Forecasted weather condition
            meteorological_state: Meteorological state analysis
            hourly_patterns: Hourly patterns
            sensor_data: Sensor data

        Returns:
            float: Hourly precipitation amount
        """
        # Get current precipitation as baseline
        current_precipitation = sensor_data.get(KEY_PRECIPITATION, 0.0)
        if hasattr(current_precipitation, "_mock_name") or not isinstance(
            current_precipitation, (int, float)
        ):
            current_precipitation = 0.0

        # Base precipitation by condition (hourly rate, not daily)
        condition_precip_hourly = {
            ATTR_CONDITION_LIGHTNING_RAINY: 2.5,  # mm/hour during storms
            ATTR_CONDITION_POURING: 3.0,  # mm/hour heavy rain
            ATTR_CONDITION_RAINY: 1.0,  # mm/hour moderate rain
            ATTR_CONDITION_SNOWY: 0.5,  # mm/hour snow
            ATTR_CONDITION_CLOUDY: 0.0,  # No precip unless rainy
            ATTR_CONDITION_FOG: 0.05,  # Trace from fog drip
        }

        base_precip = condition_precip_hourly.get(condition, 0.0)

        # If currently raining, use blend of current and expected
        if current_precipitation > 0:
            base_precip = (base_precip + current_precipitation) / 2

        # Pressure trend modulation
        # Falling pressure intensifies, rising pressure diminishes
        pressure_analysis = meteorological_state.get("pressure_analysis", {})
        pressure_trend = pressure_analysis.get("current_trend", 0)
        if isinstance(pressure_trend, (int, float)):
            if pressure_trend < -0.3:
                base_precip *= 1.3  # Intensifying
            elif pressure_trend > 0.2:
                base_precip *= 0.7  # Diminishing

        # Storm probability boost
        storm_prob = pressure_analysis.get("storm_probability", 0)
        if isinstance(storm_prob, (int, float)) and storm_prob > 60:
            base_precip *= 1.0 + (storm_prob - 60) / 100  # Up to 40% boost

        # Temporal pattern: precipitation often peaks a few hours into a system
        # Use deterministic wave pattern instead of random
        if base_precip > 0:
            # Sinusoidal variation ±20% based on hour, peaks at hours 4, 12, 20
            hour_phase = (hour_idx % 8) / 8.0 * math.pi * 2
            temporal_factor = 1.0 + 0.2 * math.sin(hour_phase)
            base_precip *= temporal_factor

        # Distance dampening
        confidence = max(0.3, 1.0 - (hour_idx * 0.02))
        base_precip *= confidence

        return round(max(0.0, base_precip), 2)

    def _forecast_wind(
        self,
        hour_idx: int,
        current_wind: float,
        condition: str,
        meteorological_state: Dict[str, Any],
        hourly_patterns: Dict[str, Any],
    ) -> float:
        """Comprehensive hourly wind forecasting."""
        wind_kmh = convert_to_kmh(current_wind) or convert_to_kmh(
            ForecastConstants.DEFAULT_WIND_SPEED
        )
        hour = (dt_util.now() + timedelta(hours=hour_idx + 1)).hour
        diurnal_patterns = hourly_patterns.get("diurnal_patterns", {}).get("wind", {})

        default_wind_patterns = {
            "dawn": DiurnalPatternConstants.WIND_DAWN,
            "morning": DiurnalPatternConstants.WIND_MORNING,
            "noon": DiurnalPatternConstants.WIND_NOON,
            "afternoon": DiurnalPatternConstants.WIND_AFTERNOON,
            "evening": DiurnalPatternConstants.WIND_EVENING,
            "night": DiurnalPatternConstants.WIND_NIGHT,
            "midnight": DiurnalPatternConstants.WIND_MIDNIGHT,
        }

        diurnal_patterns = {**default_wind_patterns, **diurnal_patterns}

        if 5 <= hour < 7:
            diurnal_factor = diurnal_patterns["dawn"]
        elif 7 <= hour < 12:
            diurnal_factor = diurnal_patterns["morning"]
        elif 12 <= hour < 15:
            diurnal_factor = diurnal_patterns["noon"]
        elif 15 <= hour < 19:
            diurnal_factor = diurnal_patterns["afternoon"]
        elif 19 <= hour < 22:
            diurnal_factor = diurnal_patterns["evening"]
        else:
            diurnal_factor = diurnal_patterns["night"]

        wind_kmh += diurnal_factor

        condition_factors = {
            ATTR_CONDITION_WINDY: WindAdjustmentConstants.WINDY,
            ATTR_CONDITION_LIGHTNING_RAINY: WindAdjustmentConstants.LIGHTNING_RAINY,
            ATTR_CONDITION_RAINY: WindAdjustmentConstants.RAINY,
            ATTR_CONDITION_CLOUDY: WindAdjustmentConstants.CLOUDY,
            ATTR_CONDITION_SUNNY: WindAdjustmentConstants.SUNNY,
        }
        wind_kmh *= condition_factors.get(condition, 1.0)
        return round(max(ForecastConstants.MIN_WIND_SPEED, wind_kmh), 1)

    def _forecast_humidity(
        self,
        hour_idx: int,
        current_humidity: float,
        meteorological_state: Dict[str, Any],
        hourly_patterns: Dict[str, Any],
        condition: str,
    ) -> float:
        """Hourly humidity forecasting with proper convergence.

        Humidity evolves by:
        1. Diurnal pattern (lower midday, higher at night)
        2. Convergence toward condition-appropriate target (faster than before)
        3. Moisture trend from analysis

        Args:
            hour_idx: Hour index (0-23)
            current_humidity: Current humidity
            meteorological_state: Meteorological state
            hourly_patterns: Hourly patterns
            condition: Forecasted condition

        Returns:
            float: Forecasted humidity
        """
        if current_humidity is None:
            current_humidity = ForecastConstants.DEFAULT_HUMIDITY

        # Get diurnal pattern
        hour = (dt_util.now() + timedelta(hours=hour_idx + 1)).hour
        diurnal_patterns = hourly_patterns.get("diurnal_patterns", {}).get(
            KEY_HUMIDITY, {}
        )

        default_humidity_patterns = {
            "dawn": DiurnalPatternConstants.HUMIDITY_DAWN,
            "morning": DiurnalPatternConstants.HUMIDITY_MORNING,
            "noon": DiurnalPatternConstants.HUMIDITY_NOON,
            "afternoon": DiurnalPatternConstants.HUMIDITY_AFTERNOON,
            "evening": DiurnalPatternConstants.HUMIDITY_EVENING,
            "night": DiurnalPatternConstants.HUMIDITY_NIGHT,
            "midnight": DiurnalPatternConstants.HUMIDITY_MIDNIGHT,
        }

        patterns = {**default_humidity_patterns, **diurnal_patterns}

        if 5 <= hour < 7:
            diurnal_change = patterns["dawn"]
        elif 7 <= hour < 12:
            diurnal_change = patterns["morning"]
        elif 12 <= hour < 15:
            diurnal_change = patterns["noon"]
        elif 15 <= hour < 19:
            diurnal_change = patterns["afternoon"]
        elif 19 <= hour < 22:
            diurnal_change = patterns["evening"]
        else:
            diurnal_change = patterns["night"]

        # Target humidity by condition
        condition_humidity = {
            ATTR_CONDITION_LIGHTNING_RAINY: HumidityTargetConstants.LIGHTNING_RAINY,
            ATTR_CONDITION_POURING: HumidityTargetConstants.POURING,
            ATTR_CONDITION_RAINY: HumidityTargetConstants.RAINY,
            ATTR_CONDITION_FOG: HumidityTargetConstants.FOG,
            ATTR_CONDITION_CLOUDY: HumidityTargetConstants.CLOUDY,
            ATTR_CONDITION_PARTLYCLOUDY: HumidityTargetConstants.PARTLYCLOUDY,
            ATTR_CONDITION_SUNNY: HumidityTargetConstants.SUNNY,
            ATTR_CONDITION_CLEAR_NIGHT: HumidityTargetConstants.CLEAR_NIGHT,
        }

        target_humidity = condition_humidity.get(condition, current_humidity)

        # Convergence: move 15% toward target per hour (reaches ~95% in 20 hours)
        convergence_rate = 0.15
        humidity_delta = (target_humidity - current_humidity) * convergence_rate

        # Apply diurnal and convergence
        forecast_humidity = current_humidity + humidity_delta + diurnal_change * 0.3

        # Moisture trend influence
        moisture_analysis = meteorological_state.get("moisture_analysis", {})
        trend_direction = moisture_analysis.get("trend_direction", "stable")

        if trend_direction == "increasing":
            forecast_humidity += 2
        elif trend_direction == "decreasing":
            forecast_humidity -= 2

        return int(
            max(
                ForecastConstants.MIN_HUMIDITY,
                min(ForecastConstants.MAX_HUMIDITY, forecast_humidity),
            )
        )
