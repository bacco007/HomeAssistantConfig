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

from dataclasses import dataclass
import logging
from typing import Any, Dict, List, Optional

from homeassistant.components.weather import (
    ATTR_CONDITION_CLOUDY,
    ATTR_CONDITION_LIGHTNING_RAINY,
    ATTR_CONDITION_PARTLYCLOUDY,
    ATTR_CONDITION_POURING,
    ATTR_CONDITION_RAINY,
    ATTR_CONDITION_SUNNY,
)

from ..meteorological_constants import DiurnalPatternConstants, EvolutionConstants

_LOGGER = logging.getLogger(__name__)

# Type alias
EvolutionModel = Dict[str, Any]


@dataclass
class LifecyclePhase:
    """A named phase in a weather system's lifecycle.

    Attributes:
        name: Phase identifier (stable, pre_frontal, frontal,
              post_frontal, clearing, stabilizing)
        start_hour: Hours from now when this phase begins (0 = present)
        end_hour: Hours from now when this phase ends
        condition: HA weather condition string for this phase
        confidence: Base confidence for this phase (0.0-1.0)
    """

    name: str
    start_hour: float
    end_hour: float
    condition: str
    confidence: float


def find_lifecycle_phase(
    lifecycle: List[LifecyclePhase], slot_hour: float
) -> Optional[LifecyclePhase]:
    """Return the phase that contains slot_hour.

    Returns the phase where start_hour <= slot_hour < end_hour.
    If slot_hour falls beyond all phases, returns the last phase.
    Returns None if lifecycle is empty.

    Args:
        lifecycle: Ordered list of LifecyclePhase objects
        slot_hour: Hours from now to look up

    Returns:
        Matching LifecyclePhase or None
    """
    if not lifecycle:
        return None
    for phase in lifecycle:
        if phase.start_hour <= slot_hour < phase.end_hour:
            return phase
    return lifecycle[-1]


def apply_confidence_clamping(condition: str, confidence: float) -> str:
    """Clamp extreme weather conditions at low confidence levels.

    Confidence tiers:
    - >= 0.6: any condition allowed
    - 0.4-0.59: no extremes (pouring/lightning-rainy -> rainy)
    - < 0.4: only cloudy or partlycloudy

    Args:
        condition: HA weather condition string
        confidence: Confidence score (0.0-1.0)

    Returns:
        Possibly-clamped condition string
    """
    if confidence >= 0.6:
        return condition

    if confidence >= 0.4:
        if condition in (ATTR_CONDITION_POURING, ATTR_CONDITION_LIGHTNING_RAINY):
            return ATTR_CONDITION_RAINY
        return condition

    # Very low confidence — only middle ground
    if condition in (ATTR_CONDITION_POURING, ATTR_CONDITION_LIGHTNING_RAINY):
        return ATTR_CONDITION_CLOUDY
    if condition in (ATTR_CONDITION_RAINY, ATTR_CONDITION_SUNNY):
        return ATTR_CONDITION_PARTLYCLOUDY
    if condition in (ATTR_CONDITION_CLOUDY, ATTR_CONDITION_PARTLYCLOUDY):
        return condition
    return ATTR_CONDITION_PARTLYCLOUDY


class EvolutionModeler:
    """Models weather system evolution over time based on trends."""

    def __init__(self):
        """Initialize evolution modeler."""

    def model_system_evolution(
        self,
        meteorological_state: Dict[str, Any],
        current_condition: str = ATTR_CONDITION_CLOUDY,
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

        acceleration = meteorological_state.get("pressure_acceleration", 0.0)
        if not isinstance(acceleration, (int, float)):
            acceleration = 0.0

        lifecycle = self.compute_lifecycle(
            trend=current_trend,
            acceleration=acceleration,
            storm_prob=storm_probability,
            current_condition=current_condition,
        )

        return {
            "evolution_path": evolution_path,
            "confidence_levels": confidence_levels,
            "transition_probabilities": transition_probabilities,
            "lifecycle": lifecycle,
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

    def compute_lifecycle(
        self,
        trend: float,
        acceleration: float,
        storm_prob: float,
        current_condition: str = ATTR_CONDITION_CLOUDY,
    ) -> List[LifecyclePhase]:
        """Compute weather system lifecycle phases from pressure trend data.

        Uses pressure trend and its acceleration to estimate when incoming
        or outgoing weather system phases occur. All timings are relative
        to "now" (hour 0). The returned list always covers at least 120
        hours (5 days) with no gaps between phases.

        Args:
            trend: Current pressure trend in inHg/3h (negative = falling)
            acceleration: Trend acceleration in inHg/3h^2 (from
                          TrendsAnalyzer.compute_pressure_acceleration)
            storm_prob: Current storm probability 0-100
            current_condition: Current HA condition for the stable phase

        Returns:
            List[LifecyclePhase]: Ordered phases with no gaps
        """
        from ..meteorological_constants import PressureTrendConstants

        total_hours = 120.0

        if abs(trend) < PressureTrendConstants.STABLE_THRESHOLD:
            return [
                LifecyclePhase(
                    name="stable",
                    start_hour=0.0,
                    end_hour=total_hours,
                    condition=current_condition,
                    confidence=0.85,
                )
            ]

        if trend < 0:
            return self._compute_deteriorating_lifecycle(
                trend, acceleration, storm_prob, total_hours
            )
        return self._compute_improving_lifecycle(
            trend, acceleration, storm_prob, total_hours
        )

    def _compute_deteriorating_lifecycle(
        self,
        trend: float,
        acceleration: float,
        storm_prob: float,
        total_hours: float,
    ) -> List[LifecyclePhase]:
        """Build lifecycle phases for a deteriorating (falling pressure) scenario."""
        from ..meteorological_constants import ForecastConstants

        abs_trend = max(abs(trend), 0.1)

        # Hours until storm probability threshold is reached
        hours_to_frontal = max(
            0.0,
            (ForecastConstants.STORM_THRESHOLD_SEVERE - storm_prob) / (abs_trend * 5.0),
        )
        # Fast front (high acceleration magnitude) = short peak
        peak_duration = 6.0 if abs(acceleration) > 0.1 else 12.0
        rebound_hours = max(6.0, peak_duration * (1.0 + abs(acceleration)))

        # Frontal condition severity based on current storm_prob
        if storm_prob > ForecastConstants.STORM_THRESHOLD_SEVERE:
            frontal_condition = ATTR_CONDITION_LIGHTNING_RAINY
        elif storm_prob > ForecastConstants.STORM_THRESHOLD_MODERATE:
            frontal_condition = ATTR_CONDITION_POURING
        else:
            frontal_condition = ATTR_CONDITION_RAINY

        phases: List[LifecyclePhase] = []
        t = 0.0

        # Quiet period before clouds build (6h buffer before frontal arrival)
        pre_frontal_start = max(0.0, hours_to_frontal - 6.0)
        if pre_frontal_start > 0.0:
            phases.append(
                LifecyclePhase(
                    "stable", t, pre_frontal_start, ATTR_CONDITION_PARTLYCLOUDY, 0.85
                )
            )
            t = pre_frontal_start

        # Clouds building ahead of the front
        if hours_to_frontal > t:
            phases.append(
                LifecyclePhase(
                    "pre_frontal", t, hours_to_frontal, ATTR_CONDITION_CLOUDY, 0.80
                )
            )
            t = hours_to_frontal

        # Frontal passage
        frontal_end = t + peak_duration
        phases.append(
            LifecyclePhase("frontal", t, frontal_end, frontal_condition, 0.75)
        )
        t = frontal_end

        # Post-frontal (unsettled)
        post_frontal_end = t + rebound_hours
        phases.append(
            LifecyclePhase(
                "post_frontal", t, post_frontal_end, ATTR_CONDITION_CLOUDY, 0.65
            )
        )
        t = post_frontal_end

        # Clearing
        clearing_end = t + rebound_hours
        phases.append(
            LifecyclePhase(
                "clearing", t, clearing_end, ATTR_CONDITION_PARTLYCLOUDY, 0.55
            )
        )
        t = clearing_end

        # Stabilizing — fill to total_hours
        if t < total_hours:
            phases.append(
                LifecyclePhase(
                    "stabilizing", t, total_hours, ATTR_CONDITION_SUNNY, 0.45
                )
            )

        return phases

    def _compute_improving_lifecycle(
        self,
        trend: float,
        acceleration: float,
        storm_prob: float,
        total_hours: float,
    ) -> List[LifecyclePhase]:
        """Build lifecycle phases for an improving (rising pressure) scenario."""
        abs_trend = max(abs(trend), 0.1)

        # Hours until conditions clear (storm_prob -> 0 at current rate)
        hours_to_clear = max(0.0, storm_prob / (abs_trend * 5.0))
        rebound_hours = max(12.0, 12.0 * (1.0 + abs(acceleration)))

        phases: List[LifecyclePhase] = []
        t = 0.0

        # Still unsettled at the start
        if hours_to_clear > 0.0:
            phases.append(
                LifecyclePhase(
                    "post_frontal", t, hours_to_clear, ATTR_CONDITION_CLOUDY, 0.65
                )
            )
            t = hours_to_clear

        # Clearing
        clearing_end = t + rebound_hours
        phases.append(
            LifecyclePhase(
                "clearing", t, clearing_end, ATTR_CONDITION_PARTLYCLOUDY, 0.55
            )
        )
        t = clearing_end

        # Stabilizing — fill to total_hours
        if t < total_hours:
            phases.append(
                LifecyclePhase(
                    "stabilizing", t, total_hours, ATTR_CONDITION_SUNNY, 0.45
                )
            )

        return phases
