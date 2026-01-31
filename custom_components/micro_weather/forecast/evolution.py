"""Weather system evolution modeling.

This module handles modeling how weather systems evolve over time:
- Weather system transition prediction based on pressure trends
- Evolution path determination from meteorological state
- Confidence level calculation based on trend agreement

Key improvements:
- Evolution paths are dynamically generated from pressure trends
- Confidence decreases with trend disagreement (short vs long term)
- Transition probabilities reflect actual atmospheric stability
"""

import logging
from typing import Any, Dict

from ..meteorological_constants import DiurnalPatternConstants, EvolutionConstants

_LOGGER = logging.getLogger(__name__)

# Type alias
EvolutionModel = Dict[str, Any]


class EvolutionModeler:
    """Models weather system evolution over time based on trends."""

    def __init__(self):
        """Initialize evolution modeler."""

    def model_system_evolution(
        self, meteorological_state: Dict[str, Any]
    ) -> EvolutionModel:
        """Model how weather systems are likely to evolve based on pressure trends.

        Instead of using fixed evolution paths based on system type, this version
        dynamically generates evolution paths based on pressure trend direction
        and magnitude. This produces more accurate predictions when trends are
        active.

        Args:
            meteorological_state: Current meteorological state including:
                - pressure_analysis: with current_trend, long_term_trend, storm_probability
                - weather_system: with type classification
                - atmospheric_stability: 0-1 stability index

        Returns:
            Evolution model with:
            - evolution_path: List of predicted system states
            - confidence_levels: Confidence in each stage (0-1)
            - transition_probabilities: Likelihood of different change rates
        """
        stability = meteorological_state.get("atmospheric_stability", 0.5)
        pressure_analysis = meteorological_state.get("pressure_analysis", {})

        # Get trend information
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

        # Generate evolution path based on trend trajectory
        evolution_path = self._generate_trend_based_path(
            current_trend, long_term_trend, storm_probability, stability
        )

        # Calculate confidence levels based on trend agreement
        confidence_levels = self._calculate_trend_confidence_levels(
            current_trend, long_term_trend, stability
        )

        # Calculate transition probabilities
        transition_probabilities = self._calculate_transition_probabilities(
            current_trend, stability, storm_probability
        )

        return {
            "evolution_path": evolution_path,
            "confidence_levels": confidence_levels,
            "transition_probabilities": transition_probabilities,
        }

    def _generate_trend_based_path(
        self,
        current_trend: float,
        long_term_trend: float,
        storm_probability: float,
        stability: float,
    ) -> list[str]:
        """Generate evolution path based on pressure trends.

        Trend-based evolution:
        - Falling pressure: stable -> deteriorating -> frontal/storm -> post-frontal
        - Rising pressure: active -> clearing -> stabilizing -> stable_high
        - Stable: current -> current -> gradual transition

        Args:
            current_trend: Current pressure trend (inHg/3h)
            long_term_trend: 24h pressure trend
            storm_probability: Storm probability percentage
            stability: Atmospheric stability (0-1)

        Returns:
            List of evolution stage names
        """
        # High storm probability overrides normal evolution
        if storm_probability > 70:
            return ["active_low", "frontal_passage", "post_frontal", "clearing"]
        elif storm_probability > 50:
            return [
                "frontal_approach",
                "frontal_passage",
                "post_frontal",
                "stabilizing",
            ]

        # Trend-based evolution
        if current_trend < -0.5:  # Rapid fall
            if long_term_trend < -0.3:  # Sustained fall
                return [
                    "frontal_approach",
                    "frontal_passage",
                    "post_frontal",
                    "clearing",
                ]
            else:  # Short-term fall
                return [
                    "transitional",
                    "frontal_approach",
                    "frontal_passage",
                    "post_frontal",
                ]
        elif current_trend < -0.2:  # Moderate fall
            return [
                "weakening_high",
                "transitional",
                "frontal_approach",
                "frontal_passage",
            ]
        elif current_trend > 0.5:  # Rapid rise
            if long_term_trend > 0.3:  # Sustained rise
                return ["post_frontal", "clearing", "stabilizing", "stable_high"]
            else:
                return ["post_frontal", "clearing", "transitional", "new_pattern"]
        elif current_trend > 0.2:  # Moderate rise
            return ["clearing", "stabilizing", "stable_high", "weakening_high"]
        else:  # Stable pressure
            if stability > 0.7:
                return ["stable_high", "stable_high", "weakening_high", "transitional"]
            elif stability < 0.3:
                return ["transitional", "new_pattern", "transitional", "stabilizing"]
            else:
                return ["current", "transitioning", "new_pattern", "stabilizing"]

    def _calculate_trend_confidence_levels(
        self, current_trend: float, long_term_trend: float, stability: float
    ) -> list[float]:
        """Calculate confidence levels based on trend agreement.

        Confidence is higher when:
        - Short and long-term trends agree (same direction)
        - Atmospheric stability is high
        - Trends are strong (easier to predict continuation)

        Args:
            current_trend: Current pressure trend
            long_term_trend: Long-term pressure trend
            stability: Atmospheric stability

        Returns:
            List of confidence values for each forecast day
        """
        # Base confidence from stability (stable = predictable)
        base_confidence = 0.5 + (stability * 0.3)

        # Trend agreement bonus
        if (current_trend >= 0 and long_term_trend >= 0) or (
            current_trend <= 0 and long_term_trend <= 0
        ):
            # Trends agree - higher confidence
            trend_agreement = min(1.0, abs(current_trend) * 0.5 + 0.5)
        else:
            # Trends disagree - lower confidence (reversal likely)
            trend_agreement = max(0.3, 0.8 - abs(current_trend - long_term_trend) * 0.2)

        day1_confidence = min(0.95, base_confidence * trend_agreement)

        # Confidence decays with each day
        return [
            day1_confidence,
            day1_confidence * 0.75,
            day1_confidence * 0.55,
            day1_confidence * 0.35,
        ]

    def _calculate_transition_probabilities(
        self, current_trend: float, stability: float, storm_probability: float
    ) -> Dict[str, float]:
        """Calculate transition probabilities based on current state.

        Args:
            current_trend: Current pressure trend
            stability: Atmospheric stability
            storm_probability: Storm probability

        Returns:
            Dict with persistence, gradual_change, rapid_change probabilities
        """
        # Base persistence from stability
        persistence = stability * 0.8

        # Strong trends reduce persistence
        trend_magnitude = abs(current_trend)
        if trend_magnitude > 0.5:
            persistence *= 0.5
        elif trend_magnitude > 0.2:
            persistence *= 0.7

        # Storm probability indicates rapid change
        rapid_change = 0.0
        if storm_probability > 60:
            rapid_change = (storm_probability - 40) / 100.0
            persistence *= 0.5

        gradual_change = 1.0 - persistence - rapid_change

        return {
            "persistence": max(0.1, min(0.9, persistence)),
            "gradual_change": max(0.1, gradual_change),
            "rapid_change": max(0.0, rapid_change),
        }

    def model_hourly_evolution(
        self, meteorological_state: Dict[str, Any], hours: int = 24
    ) -> Dict[str, Any]:
        """Model hourly weather evolution based on pressure trends.

        Predicts hour-by-hour evolution rate based on pressure trend magnitude.
        Rapid trends = rapid evolution, stable = slow evolution.

        Args:
            meteorological_state: Current meteorological state
            hours: Number of hours to model (default: 24)

        Returns:
            Hourly evolution model with:
            - hourly_changes: List of per-hour predictions
            - confidence: Overall confidence
            - evolution_phase: Current evolution phase
        """
        # Get system evolution model
        system_model = self.model_system_evolution(meteorological_state)

        # Get pressure trend for evolution rate
        pressure_analysis = meteorological_state.get("pressure_analysis", {})
        current_trend = pressure_analysis.get("current_trend", 0)
        if not isinstance(current_trend, (int, float)):
            current_trend = 0.0

        # Evolution rate based on trend magnitude
        trend_magnitude = abs(current_trend)
        if trend_magnitude > 0.5:
            base_change_rate = "rapid"
        elif trend_magnitude > 0.2:
            base_change_rate = "moderate"
        else:
            base_change_rate = "gradual"

        base_confidence = (
            system_model["confidence_levels"][0]
            if system_model["confidence_levels"]
            else 0.8
        )

        hourly_changes = []
        for hour_idx in range(hours):
            # Confidence degrades with each hour
            hour_confidence = base_confidence * (
                EvolutionConstants.HOURLY_CONFIDENCE_DECAY**hour_idx
            )

            # Change rate accelerates as weather system moves through
            if hour_idx < 6:
                expected_change = base_change_rate
            elif hour_idx < 12:
                # Mid-period often shows maximum change
                expected_change = (
                    "moderate" if base_change_rate == "gradual" else base_change_rate
                )
            else:
                # Later hours trend toward stability
                expected_change = "gradual"

            hourly_changes.append(
                {
                    "hour": hour_idx,
                    "confidence": round(hour_confidence, 3),
                    "expected_change": expected_change,
                }
            )

        return {
            "hourly_changes": hourly_changes,
            "confidence": base_confidence,
            "evolution_phase": (
                system_model["evolution_path"][0]
                if system_model["evolution_path"]
                else "stable"
            ),
        }

    def calculate_micro_patterns(self, hour_idx: int) -> Dict[str, float]:
        """Calculate micro-pattern adjustments for hourly forecasts.

        Provides small adjustments based on typical diurnal and micro-scale patterns.

        Args:
            hour_idx: Hour index (0-23)

        Returns:
            Micro-pattern adjustments for temperature and cloud cover
        """
        # Simple sinusoidal micro-pattern for demonstration
        # Real implementation would use learned patterns from historical data
        import math

        # Temperature micro-pattern (small variations)
        temp_adjustment = (
            math.sin(hour_idx * math.pi / DiurnalPatternConstants.TEMP_MICRO_PERIOD)
            * DiurnalPatternConstants.TEMP_MICRO_AMPLITUDE
        )

        # Cloud micro-pattern (small variations)
        cloud_adjustment = (
            math.cos(hour_idx * math.pi / DiurnalPatternConstants.CLOUD_MICRO_PERIOD)
            * DiurnalPatternConstants.CLOUD_MICRO_AMPLITUDE
        )

        return {
            "temperature_adjustment": temp_adjustment,
            "cloud_adjustment": cloud_adjustment,
        }
