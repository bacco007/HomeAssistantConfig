"""Daily forecast generation module.

This module provides comprehensive 5-day daily forecast generation using:
- Multi-factor meteorological analysis with trend extrapolation
- Pressure trend acceleration for weather system evolution
- Temperature/humidity/wind trend integration
- Storm probability with trend-based adjustments

Key improvements:
- Trends are extrapolated forward, not just used as multipliers
- Pressure trend acceleration predicts system arrival/departure
- Historical volatility affects confidence, not random variation
- Condition evolution follows pressure/moisture trajectory
"""

from datetime import timedelta
import logging
from typing import Any, Dict, List

from homeassistant.components.weather import (
    ATTR_CONDITION_CLOUDY,
    ATTR_CONDITION_FOG,
    ATTR_CONDITION_LIGHTNING_RAINY,
    ATTR_CONDITION_PARTLYCLOUDY,
    ATTR_CONDITION_POURING,
    ATTR_CONDITION_RAINY,
    ATTR_CONDITION_SNOWY,
    ATTR_CONDITION_SUNNY,
)
from homeassistant.util import dt as dt_util

from ..analysis.trends import TrendsAnalyzer
from ..const import (
    KEY_CONDITION,
    KEY_HUMIDITY,
    KEY_OUTDOOR_TEMP,
    KEY_PRECIPITATION,
    KEY_TEMPERATURE,
    KEY_WIND_SPEED,
)
from ..meteorological_constants import (
    ForecastConstants,
    HumidityTargetConstants,
    PrecipitationConstants,
    PrecipitationModelConstants,
    WindAdjustmentConstants,
)
from ..weather_utils import convert_to_kmh

_LOGGER = logging.getLogger(__name__)


class DailyForecastGenerator:
    """Handles generation of 5-day daily forecasts."""

    def __init__(self, trends_analyzer: TrendsAnalyzer):
        """Initialize daily forecast generator.

        Args:
            trends_analyzer: TrendsAnalyzer instance for historical data
        """
        self.trends_analyzer = trends_analyzer

    def generate_forecast(
        self,
        current_condition: str,
        sensor_data: Dict[str, Any],
        altitude: float | None,
        meteorological_state: Dict[str, Any],
        historical_patterns: Dict[str, Any],
        system_evolution: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate comprehensive 5-day daily forecast.

        Args:
            current_condition: Current weather condition
            sensor_data: Current sensor data in imperial units
            altitude: Altitude in meters above sea level
            meteorological_state: Comprehensive meteorological analysis
            historical_patterns: Historical weather patterns
            system_evolution: Weather system evolution model

        Returns:
            List[Dict[str, Any]]: 5-day forecast with enhanced accuracy
        """
        forecast = []

        # Current baseline values
        current_temp = (
            sensor_data.get(KEY_TEMPERATURE)
            or sensor_data.get(KEY_OUTDOOR_TEMP)
            or ForecastConstants.DEFAULT_TEMPERATURE
        )
        current_humidity = sensor_data.get(
            KEY_HUMIDITY, ForecastConstants.DEFAULT_HUMIDITY
        )
        current_wind = sensor_data.get(
            KEY_WIND_SPEED, ForecastConstants.DEFAULT_WIND_SPEED
        )

        for day_idx in range(5):
            date = dt_util.now() + timedelta(days=day_idx)

            # Advanced temperature forecasting using multi-factor analysis
            forecast_temp = self.forecast_temperature(
                day_idx,
                current_temp,
                meteorological_state,
                historical_patterns,
                system_evolution,
            )

            # Advanced condition forecasting using all meteorological factors
            forecast_condition = self.forecast_condition(
                day_idx,
                current_condition,
                meteorological_state,
                historical_patterns,
                system_evolution,
            )

            # Advanced precipitation forecasting using atmospheric analysis
            precipitation = self._forecast_precipitation(
                day_idx,
                forecast_condition,
                meteorological_state,
                historical_patterns,
                sensor_data,
            )

            # Advanced wind forecasting using pressure gradients and historical patterns
            wind_forecast = self._forecast_wind(
                day_idx,
                current_wind,
                forecast_condition,
                meteorological_state,
                historical_patterns,
            )

            # Advanced humidity forecasting using moisture analysis
            humidity_forecast = self._forecast_humidity(
                day_idx,
                current_humidity,
                meteorological_state,
                historical_patterns,
                forecast_condition,
            )

            forecast.append(
                {
                    "datetime": date.isoformat(),
                    KEY_TEMPERATURE: round(
                        forecast_temp or ForecastConstants.DEFAULT_TEMPERATURE, 1
                    ),
                    "templow": round(
                        (forecast_temp or ForecastConstants.DEFAULT_TEMPERATURE)
                        - self._calculate_temperature_range(
                            forecast_condition, meteorological_state
                        ),
                        1,
                    ),
                    KEY_CONDITION: forecast_condition,
                    KEY_PRECIPITATION: precipitation,
                    KEY_WIND_SPEED: wind_forecast,
                    KEY_HUMIDITY: humidity_forecast,
                }
            )

        return forecast

    def forecast_temperature(
        self,
        day_idx: int,
        current_temp: float,
        meteorological_state: Dict[str, Any],
        historical_patterns: Dict[str, Any],
        system_evolution: Dict[str, Any],
    ) -> float:
        """Forecast temperature for a specific day using trend extrapolation.

        Uses linear trend extrapolation as the primary method, with pressure
        system influences as secondary adjustments. The key insight is that
        temperature trends from the last 24h are often good predictors of
        the next 1-2 days, with decreasing confidence thereafter.

        Args:
            day_idx: Day index (0-4)
            current_temp: Current temperature in °F
            meteorological_state: Meteorological state analysis
            historical_patterns: Historical patterns with trend data
            system_evolution: System evolution model

        Returns:
            float: Forecasted temperature in °F
        """
        # Get temperature trend from historical data (°F per hour)
        temp_pattern = historical_patterns.get(KEY_TEMPERATURE, {})
        temp_trend_per_hour = temp_pattern.get("trend", 0)
        if not isinstance(temp_trend_per_hour, (int, float)):
            temp_trend_per_hour = 0.0

        # Get historical volatility for natural variation
        temp_volatility = temp_pattern.get("volatility", 3.0)
        if not isinstance(temp_volatility, (int, float)):
            temp_volatility = 3.0

        # Extrapolate trend forward (24 hours per day)
        # But dampen the extrapolation for distant days
        hours_forward = (day_idx + 1) * 24
        trend_confidence = self._calculate_trend_confidence(day_idx, temp_pattern)

        # Linear extrapolation with confidence dampening
        trend_extrapolation = temp_trend_per_hour * hours_forward * trend_confidence
        forecast_temp = current_temp + trend_extrapolation

        # Pressure system influence (modifies the trend direction)
        pressure_influence = self._calculate_pressure_temperature_influence(
            meteorological_state, day_idx
        )
        forecast_temp += pressure_influence

        # Seasonal adjustment (warming in spring, cooling in fall)
        seasonal_adjustment = self._calculate_seasonal_temperature_adjustment(day_idx)
        forecast_temp += seasonal_adjustment

        # Natural day-to-day variation based on historical volatility
        # Use the observed temperature variability to create realistic daily swings
        # The pattern oscillates around the trend using volatility as amplitude
        # Day 0: baseline, Day 1-4: oscillate based on volatility
        variation_amplitude = min(temp_volatility, 5.0)  # Cap at 5°F variation
        # Create oscillating pattern: 0, +amp*0.6, -amp*0.4, +amp*0.8, -amp*0.3
        # This mimics real weather's tendency to warm/cool in waves
        variation_pattern = [0.0, 0.6, -0.4, 0.8, -0.3]
        day_variation = variation_amplitude * variation_pattern[day_idx]
        forecast_temp += day_variation

        # Clamp unreasonable extrapolations
        # Max reasonable change: ±30°F over 5 days in extreme conditions
        max_change = 6.0 * (day_idx + 1)  # ±6°F per day maximum
        forecast_temp = max(
            current_temp - max_change, min(current_temp + max_change, forecast_temp)
        )

        return forecast_temp

    def _calculate_trend_confidence(
        self, day_idx: int, pattern_data: Dict[str, Any]
    ) -> float:
        """Calculate confidence in trend extrapolation.

        Confidence decreases with:
        - Distance from current time
        - High volatility in historical data
        - Low sample count

        Args:
            day_idx: Day index (0-4)
            pattern_data: Historical pattern data with volatility info

        Returns:
            float: Confidence factor 0.0-1.0
        """
        volatility = pattern_data.get("volatility", 5.0)
        if not isinstance(volatility, (int, float)):
            volatility = 5.0

        # Base confidence decay: Day 0=0.9, Day 1=0.7, Day 2=0.5, Day 3=0.3, Day 4=0.15
        base_confidence = max(0.15, 0.9 - (day_idx * 0.2))

        # High volatility reduces confidence (volatility of 10+ halves confidence)
        volatility_factor = max(0.3, 1.0 - (volatility / 20.0))

        return base_confidence * volatility_factor

    def forecast_condition(
        self,
        day_idx: int,
        current_condition: str,
        meteorological_state: Dict[str, Any],
        historical_patterns: Dict[str, Any],
        system_evolution: Dict[str, Any],
    ) -> str:
        """Forecast condition using pressure/humidity trend trajectory.

        The key insight is that weather conditions follow predictable
        trajectories based on pressure and humidity trends:
        - Falling pressure + rising humidity → deteriorating conditions
        - Rising pressure + falling humidity → improving conditions
        - The rate of change predicts timing of system arrival

        Args:
            day_idx: Day index (0-4)
            current_condition: Current weather condition
            meteorological_state: Meteorological state analysis
            historical_patterns: Historical patterns with trends
            system_evolution: System evolution model

        Returns:
            str: Forecasted weather condition
        """
        # Calculate trend-based trajectory score
        # Negative = deteriorating, Positive = improving
        trajectory_score = self._calculate_condition_trajectory(
            meteorological_state, historical_patterns, day_idx
        )

        # Start with current condition, then evolve based on trajectory
        forecast_condition = self._evolve_condition_by_trajectory(
            current_condition, trajectory_score, day_idx
        )

        # Apply storm probability overrides (highest priority)
        forecast_condition = self._apply_storm_probability_overrides(
            forecast_condition, day_idx, meteorological_state
        )

        return forecast_condition

    def _calculate_condition_trajectory(
        self,
        meteorological_state: Dict[str, Any],
        historical_patterns: Dict[str, Any],
        day_idx: int,
    ) -> float:
        """Calculate weather trajectory score from trends.

        Combines pressure and humidity trends to predict condition evolution.
        Score ranges from -100 (severe deterioration) to +100 (major improvement).

        Key factors:
        - Pressure trend: Falling = -20 to -50 per inHg/3h, Rising = +20 to +50
        - Humidity trend: Rising = -10 to -30, Falling = +10 to +30
        - Storm probability: Adds -20 to -60 for high probabilities

        Args:
            meteorological_state: Meteorological state analysis
            historical_patterns: Historical patterns
            day_idx: Day index for dampening

        Returns:
            float: Trajectory score (-100 to +100)
        """
        pressure_analysis = meteorological_state.get("pressure_analysis", {})
        current_trend = pressure_analysis.get("current_trend", 0)
        long_term_trend = pressure_analysis.get("long_term_trend", 0)
        storm_probability = pressure_analysis.get("storm_probability", 0)

        # Ensure numeric values
        if not isinstance(current_trend, (int, float)):
            current_trend = 0.0
        if not isinstance(long_term_trend, (int, float)):
            long_term_trend = 0.0
        if not isinstance(storm_probability, (int, float)):
            storm_probability = 0.0

        # Pressure contribution: -1.0 inHg/3h trend = -40 score
        pressure_score = current_trend * 40.0

        # Long-term trend reinforcement (smaller weight)
        pressure_score += long_term_trend * 20.0

        # Get humidity trend from patterns
        humidity_pattern = historical_patterns.get(KEY_HUMIDITY, {})
        humidity_trend = humidity_pattern.get("trend", 0)
        if not isinstance(humidity_trend, (int, float)):
            humidity_trend = 0.0

        # Humidity contribution: Rising humidity = deteriorating
        humidity_score = -humidity_trend * 5.0  # °%/hour * 5

        # Storm probability penalty
        storm_penalty = 0.0
        if storm_probability > 60:
            storm_penalty = -(storm_probability - 40)  # -20 to -60

        # Combine scores
        total_score = pressure_score + humidity_score + storm_penalty

        # Dampen for future days (less certain)
        confidence = max(0.3, 1.0 - (day_idx * 0.15))
        total_score *= confidence

        return max(-100, min(100, total_score))

    def _evolve_condition_by_trajectory(
        self, current_condition: str, trajectory_score: float, day_idx: int
    ) -> str:
        """Evolve condition based on trajectory score.

        Condition ladder (worst to best):
        pouring → lightning-rainy → rainy → cloudy → partly-cloudy → sunny

        Args:
            current_condition: Starting condition
            trajectory_score: -100 (deteriorating) to +100 (improving)
            day_idx: Day index for step calculation

        Returns:
            str: Evolved condition
        """
        # Define condition ladder
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
            # Fog typically clears during the day - evolve toward sunny over time
            # Day 0: likely still foggy/cloudy, Day 1+: progressively clearer
            fog_clearing_bonus = day_idx * 15  # +15 per day as fog clears
            adjusted_score = trajectory_score + fog_clearing_bonus
            if adjusted_score > 30:
                return ATTR_CONDITION_SUNNY
            elif adjusted_score > 10:
                return ATTR_CONDITION_PARTLYCLOUDY
            else:
                return ATTR_CONDITION_CLOUDY

        if current_condition == ATTR_CONDITION_SNOWY:
            # Snow evolves based on trajectory - may continue, turn to rain, or clear
            # Day 0-1: likely continues, Day 2+: may transition based on trajectory
            snow_clearing_bonus = day_idx * 10  # +10 per day
            adjusted_score = trajectory_score + snow_clearing_bonus
            if adjusted_score > 40:
                return ATTR_CONDITION_PARTLYCLOUDY  # Snow ended, clearing
            elif adjusted_score > 20:
                return ATTR_CONDITION_CLOUDY  # Snow ended, still cloudy
            elif adjusted_score > 0:
                return ATTR_CONDITION_RAINY  # Warming, snow turning to rain
            else:
                return ATTR_CONDITION_SNOWY  # Still cold, snow continues

        # Find current position on ladder
        try:
            current_idx = condition_ladder.index(current_condition)
        except ValueError:
            current_idx = 3  # Default to cloudy if unknown

        # Calculate steps to move (max 2 steps per day for realism)
        # Score of ±50 = 1 step, ±100 = 2 steps
        steps = int(trajectory_score / 50)
        steps = max(-2, min(2, steps))  # Clamp to ±2

        # Apply steps with day dampening (smaller steps for distant days)
        if day_idx > 2:
            steps = max(-1, min(1, steps))

        new_idx = max(0, min(len(condition_ladder) - 1, current_idx + steps))
        return condition_ladder[new_idx]

    def _apply_storm_probability_overrides(
        self,
        forecast_condition: str,
        day_idx: int,
        meteorological_state: Dict[str, Any],
    ) -> str:
        """Apply storm probability overrides (highest priority).

        Args:
            forecast_condition: Current forecast condition
            day_idx: Day index (0-4)
            meteorological_state: Meteorological state analysis

        Returns:
            str: Updated forecast condition based on storm probability
        """
        storm_probability = meteorological_state["pressure_analysis"].get(
            "storm_probability", 0
        )
        pressure_system = meteorological_state["pressure_analysis"].get(
            "pressure_system", "normal"
        )

        # Storm probability override (highest priority)
        if storm_probability >= ForecastConstants.STORM_THRESHOLD_SEVERE:
            if day_idx >= ForecastConstants.POURING_DAY_THRESHOLD:
                forecast_condition = ATTR_CONDITION_POURING
            else:
                forecast_condition = ATTR_CONDITION_LIGHTNING_RAINY
        elif (
            storm_probability > ForecastConstants.STORM_THRESHOLD_MODERATE
            and pressure_system == "low_pressure"
        ):
            if forecast_condition in [
                ATTR_CONDITION_SUNNY,
                ATTR_CONDITION_PARTLYCLOUDY,
                ATTR_CONDITION_CLOUDY,
            ]:
                forecast_condition = ATTR_CONDITION_RAINY

        return forecast_condition

    def _calculate_seasonal_temperature_adjustment(self, day_index: int) -> float:
        """Calculate seasonal temperature adjustment for forecast days.

        Uses actual date to determine seasonal trend direction.
        Spring/early summer: warming trend (+0.5°F/day)
        Late summer/fall: cooling trend (-0.5°F/day)

        Args:
            day_index: Day index (0-4)

        Returns:
            float: Temperature adjustment in degrees F
        """
        now = dt_util.now()
        day_of_year = now.timetuple().tm_yday

        # Determine seasonal trend based on day of year
        # Days 1-172 (Jan 1 - Jun 21): Warming trend
        # Days 173-355 (Jun 22 - Dec 21): Cooling trend
        if day_of_year < 172:
            # Spring: warming at ~0.3°F per day
            seasonal_rate = 0.3
        elif day_of_year < 265:
            # Summer: relatively stable
            seasonal_rate = 0.1
        elif day_of_year < 355:
            # Fall: cooling at ~0.3°F per day
            seasonal_rate = -0.3
        else:
            # Winter: relatively stable (already cold)
            seasonal_rate = -0.1

        # Apply rate for the forecast day
        adjustment = seasonal_rate * day_index

        return max(-2.0, min(2.0, adjustment))

    def _calculate_pressure_temperature_influence(
        self, meteorological_state: Dict[str, Any], day_idx: int
    ) -> float:
        """Calculate temperature influence from pressure trends.

        Pressure trends indicate air mass changes:
        - Rapid pressure fall often precedes cooler air (cold front approach)
        - Rapid pressure rise often follows cooler air (cold front passage)
        - Slow pressure rise typically means warming (high pressure building)

        Args:
            meteorological_state: Meteorological state analysis
            day_idx: Day index (0-4)

        Returns:
            float: Temperature influence in degrees F
        """
        pressure_analysis = meteorological_state.get("pressure_analysis", {})
        pressure_system = pressure_analysis.get("pressure_system", "normal")
        current_trend = pressure_analysis.get("current_trend", 0)
        long_term_trend = pressure_analysis.get("long_term_trend", 0)

        # Ensure numeric values
        if not isinstance(current_trend, (int, float)):
            current_trend = 0.0
        if not isinstance(long_term_trend, (int, float)):
            long_term_trend = 0.0

        influence = 0.0

        # Rapid pressure fall (< -0.5 inHg/3h) often means approaching cold front
        if current_trend < -0.5:
            # Expect cooling after the front passes
            influence = -3.0 * (day_idx + 1)  # More cooling for distant days
        elif current_trend < -0.2:
            influence = -1.0 * (day_idx + 1)
        # Rising pressure after a fall often means post-frontal clearing
        elif current_trend > 0.3:
            influence = 1.5 * max(0, 2 - day_idx)  # Warming on first days only

        # Pressure system base effect
        if pressure_system == "high_pressure":
            influence += 2.0  # High pressure = warmer (clear skies, solar heating)
        elif pressure_system == "low_pressure":
            influence -= 2.0  # Low pressure = cooler (clouds block sun)

        # Dampen for distant days
        distance_dampening = max(0.3, 1.0 - (day_idx * 0.15))
        influence *= distance_dampening

        return max(-8.0, min(8.0, influence))

    def _calculate_historical_pattern_influence(
        self, historical_patterns: Dict[str, Any], day_idx: int, variable: str
    ) -> float:
        """Calculate influence from historical trend patterns.

        Uses actual trend data to extrapolate forward, not random variation.
        The trend from historical data is applied with decreasing confidence.

        Args:
            historical_patterns: Historical weather patterns with trend data
            day_idx: Day index (0-4)
            variable: Variable name (e.g., KEY_TEMPERATURE)

        Returns:
            float: Pattern influence value (trend-based extrapolation)
        """
        if variable not in historical_patterns:
            return 0.0

        pattern_data = historical_patterns[variable]
        trend = pattern_data.get("trend", 0)

        if not isinstance(trend, (int, float)):
            return 0.0

        # Extrapolate trend forward with dampening
        # Trend is in units per hour, extrapolate for (day_idx+1)*24 hours
        hours_forward = (day_idx + 1) * 24
        confidence = self._calculate_trend_confidence(day_idx, pattern_data)

        # Apply trend with dampening
        influence = (
            trend * hours_forward * confidence * 0.5
        )  # 50% weight vs temperature

        return max(-5.0, min(5.0, influence))

    def _calculate_system_evolution_influence(
        self, system_evolution: Dict[str, Any], day_idx: int, variable: str
    ) -> float:
        """Calculate influence from weather system evolution.

        Uses evolution confidence to modulate forecast uncertainty.
        Low confidence means we should stay closer to current values.

        Args:
            system_evolution: System evolution model
            day_idx: Day index (0-4)
            variable: Variable name (e.g., KEY_TEMPERATURE)

        Returns:
            float: Evolution influence value (small adjustment for uncertainty)
        """
        confidence_levels = system_evolution.get("confidence_levels", [])

        if day_idx >= len(confidence_levels):
            return 0.0

        # Get confidence for this day
        confidence = confidence_levels[min(day_idx, len(confidence_levels) - 1)]

        # Low confidence = small random-like variation to express uncertainty
        # This is the only place where we add uncertainty variation
        uncertainty = 1.0 - confidence
        variation = uncertainty * 2.0 * ((day_idx % 2) - 0.5)  # ±1°F for low confidence

        return variation

    def _forecast_precipitation(
        self,
        day_idx: int,
        condition: str,
        meteorological_state: Dict[str, Any],
        historical_patterns: Dict[str, Any],
        sensor_data: Dict[str, Any],
    ) -> float:
        """Forecast precipitation using condition and trend trajectory.

        Precipitation forecast is primarily driven by:
        1. The forecasted condition (rainy, etc.)
        2. Humidity and pressure trends (are we trending wetter?)
        3. Storm probability from pressure analysis

        Args:
            day_idx: Day index (0-4)
            condition: Forecasted weather condition
            meteorological_state: Meteorological state analysis
            historical_patterns: Historical patterns
            sensor_data: Current sensor data

        Returns:
            float: Forecasted precipitation in mm (or inches based on sensor units)
        """
        # Get base precipitation by condition
        precipitation = self._get_base_precipitation_by_condition(condition)

        # Get humidity trend - rising humidity increases precipitation chance
        humidity_pattern = historical_patterns.get(KEY_HUMIDITY, {})
        humidity_trend = humidity_pattern.get("trend", 0)
        if (
            isinstance(humidity_trend, (int, float))
            and humidity_trend > PrecipitationModelConstants.HUMIDITY_RISING_THRESHOLD
        ):
            # Rising humidity increases precipitation
            precipitation *= 1.0 + min(
                PrecipitationModelConstants.HUMIDITY_MAX_BOOST,
                humidity_trend / PrecipitationModelConstants.HUMIDITY_DIVISOR,
            )

        # Apply pressure trend adjustments
        pressure_analysis = meteorological_state.get("pressure_analysis", {})
        pressure_trend = pressure_analysis.get("current_trend", 0)

        if isinstance(pressure_trend, (int, float)):
            if pressure_trend < PrecipitationModelConstants.PRESSURE_RAPID_FALL:
                # Rapidly falling pressure
                precipitation *= PrecipitationModelConstants.PRESSURE_RAPID_MULT
            elif pressure_trend < PrecipitationModelConstants.PRESSURE_SLOW_FALL:
                # Slowly falling pressure
                precipitation *= PrecipitationModelConstants.PRESSURE_SLOW_MULT
            elif pressure_trend > PrecipitationModelConstants.PRESSURE_RISING_THRESHOLD:
                # Rising pressure (clearing)
                precipitation *= PrecipitationModelConstants.PRESSURE_RISING_MULT

        # Storm probability enhancement
        storm_probability = pressure_analysis.get("storm_probability", 0)
        if isinstance(storm_probability, (int, float)):
            if storm_probability > PrecipitationModelConstants.STORM_HIGH_THRESHOLD:
                precipitation *= PrecipitationModelConstants.STORM_HIGH_MULT
            elif storm_probability > PrecipitationModelConstants.STORM_MEDIUM_THRESHOLD:
                precipitation *= PrecipitationModelConstants.STORM_MEDIUM_MULT

        # Condensation potential for today only
        if day_idx == 0:
            moisture_analysis = meteorological_state.get("moisture_analysis", {})
            condensation_potential = moisture_analysis.get("condensation_potential", 0)
            if isinstance(condensation_potential, (int, float)):
                precipitation *= (
                    1.0
                    + condensation_potential
                    * PrecipitationModelConstants.CONDENSATION_MULT
                )

        # Cap total multiplier effect to prevent runaway values
        base_precip = self._get_base_precipitation_by_condition(condition)
        if base_precip > 0:
            max_precip = base_precip * PrecipitationModelConstants.MAX_PRECIP_MULTIPLIER
            if precipitation > max_precip:
                precipitation = max_precip

        # Distance dampening - less confident about distant precipitation
        distance_factor = max(0.3, 1.0 - (day_idx * 0.15))
        precipitation *= distance_factor

        # Convert to sensor units if needed
        rain_rate_unit = sensor_data.get("rain_rate_unit")
        if (
            rain_rate_unit
            and isinstance(rain_rate_unit, str)
            and any(unit in rain_rate_unit.lower() for unit in ["in", "inch", "inches"])
        ):
            precipitation /= PrecipitationConstants.MM_TO_INCHES

        return round(max(0.0, precipitation), 2)

    def _get_base_precipitation_by_condition(self, condition: str) -> float:
        """Get base precipitation amount based on weather condition.

        Args:
            condition: Weather condition string

        Returns:
            float: Base precipitation amount in mm
        """
        condition_precip = {
            ATTR_CONDITION_LIGHTNING_RAINY: PrecipitationConstants.LIGHTNING_RAINY,
            ATTR_CONDITION_POURING: PrecipitationConstants.POURING,
            ATTR_CONDITION_RAINY: PrecipitationConstants.RAINY,
            ATTR_CONDITION_SNOWY: PrecipitationConstants.SNOWY,
            ATTR_CONDITION_CLOUDY: PrecipitationConstants.CLOUDY,
            ATTR_CONDITION_FOG: PrecipitationConstants.FOG,
        }
        return condition_precip.get(condition, 0.0)

    def _forecast_wind(
        self,
        day_idx: int,
        current_wind: float,
        condition: str,
        meteorological_state: Dict[str, Any],
        historical_patterns: Dict[str, Any],
    ) -> float:
        """Forecast wind using trend extrapolation and condition modifiers.

        Wind forecasting uses:
        1. Current wind as baseline
        2. Wind trend extrapolation
        3. Condition-based modifiers (storms increase wind)
        4. Pressure gradient effects

        Args:
            day_idx: Day index (0-4)
            current_wind: Current wind speed in mph
            condition: Forecasted weather condition
            meteorological_state: Meteorological state analysis
            historical_patterns: Historical patterns

        Returns:
            float: Forecasted wind speed in km/h
        """
        # Convert current wind to km/h
        current_wind_kmh = convert_to_kmh(current_wind) or convert_to_kmh(
            ForecastConstants.DEFAULT_WIND_SPEED
        )
        if current_wind_kmh is None:
            # Final fallback if conversion still fails
            current_wind_kmh = convert_to_kmh(5.0)  # 5 mph in km/h

        # Get wind trend from historical data
        wind_pattern = historical_patterns.get("wind", {})
        wind_trend = wind_pattern.get("trend", 0)
        if not isinstance(wind_trend, (int, float)):
            wind_trend = 0.0

        # Extrapolate wind trend (trend is in units/hour)
        hours_forward = (day_idx + 1) * 24
        trend_confidence = self._calculate_trend_confidence(day_idx, wind_pattern)
        trend_adjustment = wind_trend * hours_forward * trend_confidence * 0.3

        forecast_wind = current_wind_kmh + trend_adjustment

        # Condition-based adjustments
        condition_wind_multiplier = {
            ATTR_CONDITION_LIGHTNING_RAINY: WindAdjustmentConstants.LIGHTNING_RAINY,
            ATTR_CONDITION_POURING: WindAdjustmentConstants.POURING,
            ATTR_CONDITION_RAINY: WindAdjustmentConstants.RAINY,
            ATTR_CONDITION_CLOUDY: WindAdjustmentConstants.CLOUDY,
            ATTR_CONDITION_PARTLYCLOUDY: WindAdjustmentConstants.PARTLYCLOUDY,
            ATTR_CONDITION_SUNNY: WindAdjustmentConstants.SUNNY,
            ATTR_CONDITION_FOG: WindAdjustmentConstants.FOG,
            ATTR_CONDITION_SNOWY: WindAdjustmentConstants.SNOWY,
        }
        multiplier = condition_wind_multiplier.get(condition, 1.0)
        forecast_wind *= multiplier

        # Pressure system influence
        pressure_analysis = meteorological_state.get("pressure_analysis", {})
        pressure_system = pressure_analysis.get("pressure_system", "normal")

        if pressure_system == "low_pressure":
            forecast_wind *= WindAdjustmentConstants.LOW_PRESSURE_MULT
        elif pressure_system == "high_pressure":
            forecast_wind *= WindAdjustmentConstants.HIGH_PRESSURE_MULT

        # Pressure gradient effect from wind pattern analysis
        wind_pattern_analysis = meteorological_state.get("wind_pattern_analysis", {})
        gradient_effect = wind_pattern_analysis.get("gradient_wind_effect", 0)
        if isinstance(gradient_effect, (int, float)):
            forecast_wind += gradient_effect * 0.5

        return round(max(ForecastConstants.MIN_WIND_SPEED, forecast_wind), 1)

    def _forecast_humidity(
        self,
        day_idx: int,
        current_humidity: float,
        meteorological_state: Dict[str, Any],
        historical_patterns: Dict[str, Any],
        condition: str,
    ) -> int:
        """Forecast humidity using trend extrapolation toward condition target.

        Humidity forecasting combines:
        1. Current humidity trending toward condition-appropriate target
        2. Humidity trend from historical data
        3. Pressure system moisture effects

        Args:
            day_idx: Day index (0-4)
            current_humidity: Current humidity percentage
            meteorological_state: Meteorological state analysis
            historical_patterns: Historical patterns
            condition: Forecasted weather condition

        Returns:
            int: Forecasted humidity percentage (10-100)
        """
        # Get humidity trend
        humidity_pattern = historical_patterns.get(KEY_HUMIDITY, {})
        humidity_trend = humidity_pattern.get("trend", 0)
        if not isinstance(humidity_trend, (int, float)):
            humidity_trend = 0.0

        # Extrapolate trend
        hours_forward = (day_idx + 1) * 24
        trend_confidence = self._calculate_trend_confidence(day_idx, humidity_pattern)
        trend_change = humidity_trend * hours_forward * trend_confidence * 0.3

        # Target humidity by condition
        condition_humidity = {
            ATTR_CONDITION_LIGHTNING_RAINY: HumidityTargetConstants.LIGHTNING_RAINY,
            ATTR_CONDITION_POURING: HumidityTargetConstants.POURING,
            ATTR_CONDITION_RAINY: HumidityTargetConstants.RAINY,
            ATTR_CONDITION_SNOWY: HumidityTargetConstants.SNOWY,
            ATTR_CONDITION_CLOUDY: HumidityTargetConstants.CLOUDY,
            ATTR_CONDITION_PARTLYCLOUDY: HumidityTargetConstants.PARTLYCLOUDY,
            ATTR_CONDITION_SUNNY: HumidityTargetConstants.SUNNY,
            ATTR_CONDITION_FOG: HumidityTargetConstants.FOG,
        }
        target_humidity = condition_humidity.get(condition, current_humidity)

        # Blend current + trend toward target
        # Weight: 50% trend-extrapolated, 50% move toward target
        trend_extrapolated = current_humidity + trend_change

        # Convergence rate: 30% per day toward target
        convergence_rate = min(0.9, 0.3 * (day_idx + 1))
        target_pull = target_humidity * convergence_rate + current_humidity * (
            1 - convergence_rate
        )

        # Blend the two approaches
        forecast_humidity = (trend_extrapolated + target_pull) / 2

        # Moisture trend direction from analysis
        moisture_analysis = meteorological_state.get("moisture_analysis", {})
        trend_direction = moisture_analysis.get("trend_direction", "stable")

        if trend_direction == "increasing":
            forecast_humidity += 3
        elif trend_direction == "decreasing":
            forecast_humidity -= 3

        return int(
            max(
                ForecastConstants.MIN_HUMIDITY,
                min(ForecastConstants.MAX_HUMIDITY, round(forecast_humidity)),
            )
        )

    def _calculate_temperature_range(
        self, condition: str, meteorological_state: Dict[str, Any]
    ) -> float:
        """Calculate expected daily temperature range based on conditions.

        Args:
            condition: Weather condition
            meteorological_state: Meteorological state analysis

        Returns:
            float: Temperature range in degrees
        """
        base_range = ForecastConstants.DEFAULT_TEMP_RANGE  # Default range

        # Condition-based range adjustments
        condition_ranges = {
            ATTR_CONDITION_SUNNY: ForecastConstants.TEMP_RANGE_SUNNY,  # Large diurnal range on clear days
            ATTR_CONDITION_PARTLYCLOUDY: ForecastConstants.TEMP_RANGE_PARTLYCLOUDY,
            ATTR_CONDITION_CLOUDY: ForecastConstants.TEMP_RANGE_CLOUDY,  # Small range on cloudy days
            ATTR_CONDITION_RAINY: ForecastConstants.TEMP_RANGE_RAINY,  # Very small range during rain
            ATTR_CONDITION_LIGHTNING_RAINY: ForecastConstants.TEMP_RANGE_LIGHTNING_RAINY,
            ATTR_CONDITION_FOG: ForecastConstants.TEMP_RANGE_FOG,  # Minimal range in fog
        }

        condition_range = condition_ranges.get(condition, base_range)

        # Atmospheric stability influence
        stability = meteorological_state["atmospheric_stability"]
        stability_factor = (
            ForecastConstants.TEMP_RANGE_STABILITY_BASE + stability
        )  # Stable air = larger range, unstable = smaller range
        condition_range *= stability_factor

        # Humidity dampening (High humidity reduces diurnal range)
        # This counteracts the stability boost from humidity and reflects
        # the greenhouse effect of water vapor preventing cooling at night.
        current_humidity = meteorological_state["current_conditions"][KEY_HUMIDITY]
        if current_humidity > 70:
            # Reduce range by up to 50% for high humidity (e.g. 90% -> 0.6 factor)
            humidity_factor = max(0.5, 1.0 - ((current_humidity - 70) / 50.0))
            condition_range *= humidity_factor

        return max(
            ForecastConstants.MIN_TEMP_RANGE,
            min(ForecastConstants.MAX_TEMP_RANGE, condition_range),
        )
