"""Solar radiation and cloud cover analysis.

This module handles:
- Cloud cover estimation from solar radiation
- Astronomical calculations for solar elevation
- Clear-sky radiation calculations
- Cloud cover to weather condition mapping
- Hysteresis for stable condition reporting
"""

from collections import deque
from datetime import datetime, timedelta
import logging
import math
from typing import Any, Dict, Optional

from homeassistant.components.weather import (
    ATTR_CONDITION_CLOUDY,
    ATTR_CONDITION_PARTLYCLOUDY,
    ATTR_CONDITION_SUNNY,
)

from ..const import DEFAULT_ZENITH_MAX_RADIATION
from ..meteorological_constants import (
    CloudCoverThresholds,
    PressureThresholds,
    SolarAnalysisConstants,
    SolarPhysicsConstants,
)

_LOGGER = logging.getLogger(__name__)


class SolarAnalyzer:
    """Analyzes solar radiation for cloud cover assessment."""

    def __init__(
        self,
        sensor_history: Optional[Dict[str, deque[Dict[str, Any]]]] = None,
        zenith_max_radiation: float = DEFAULT_ZENITH_MAX_RADIATION,
    ):
        """Initialize with sensor history and calibration data.

        Args:
            sensor_history: Dictionary of sensor historical data deques
            zenith_max_radiation: Maximum solar radiation at zenith (W/m²)
        """
        self._sensor_history = sensor_history or {}
        self._condition_history: deque[Dict[str, Any]] = deque()
        self.zenith_max_radiation = zenith_max_radiation

    def analyze_cloud_cover(
        self,
        solar_radiation: float,
        solar_lux: float,
        uv_index: float,
        solar_elevation: float = 45.0,
        pressure_trends: Optional[Dict[str, Any]] = None,
    ) -> float:
        """Estimate cloud cover percentage using solar radiation.

        Uses advanced astronomical calculations:
        - Solar constant variation throughout the year
        - Air mass correction for atmospheric path length
        - Atmospheric extinction (Rayleigh scattering, ozone)
        - Elevation-based scaling
        - Pressure trend integration

        Args:
            solar_radiation: Current solar radiation in W/m²
            solar_lux: Current solar illuminance in lux
            uv_index: Current UV index value
            solar_elevation: Solar elevation angle in degrees
            pressure_trends: Optional pressure trend analysis

        Returns:
            Estimated cloud cover percentage (0-100)
        """
        # Handle None values
        solar_radiation = solar_radiation or 0.0
        solar_lux = solar_lux or 0.0
        uv_index = uv_index or 0.0

        # Use moving average to filter fluctuations
        avg_solar_radiation = self._get_solar_radiation_average(solar_radiation)

        # Calculate theoretical clear-sky maximum
        max_solar_radiation = self._calculate_clear_sky_max_radiation(solar_elevation)

        # Handle very low radiation with historical bias
        relative_threshold = (
            max_solar_radiation * SolarAnalysisConstants.LOW_RADIATION_THRESHOLD_RATIO
        )
        if (
            avg_solar_radiation < relative_threshold
            and solar_lux < SolarAnalysisConstants.MIN_SOLAR_LUX
            and uv_index < SolarAnalysisConstants.MIN_UV_INDEX
            and solar_elevation < SolarAnalysisConstants.LOW_ELEVATION_THRESHOLD
        ):
            historical_bias = self._get_historical_weather_bias(
                hours=SolarAnalysisConstants.HISTORICAL_BIAS_HOURS
            )
            bias_adjustment = 0.0

            if (
                historical_bias["bias_strength"]
                > SolarAnalysisConstants.BIAS_STRENGTH_THRESHOLD_STRONG
            ):
                bias_adjustment = (
                    SolarAnalysisConstants.BIAS_ADJUSTMENT_STRONG
                    * historical_bias["bias_strength"]
                )
            elif (
                historical_bias["bias_strength"]
                > SolarAnalysisConstants.BIAS_STRENGTH_THRESHOLD_MODERATE
            ):
                bias_adjustment = (
                    SolarAnalysisConstants.BIAS_ADJUSTMENT_MODERATE
                    * historical_bias["bias_strength"]
                )

            if (
                (
                    avg_solar_radiation
                    < max_solar_radiation
                    * SolarAnalysisConstants.VERY_LOW_RADIATION_THRESHOLD_RATIO
                    or avg_solar_radiation < SolarAnalysisConstants.MIN_SOLAR_RADIATION
                )
                and (solar_lux < 5000 or solar_lux < max_solar_radiation * 6)
                and uv_index == 0
            ):
                cloud_cover = 85.0
            elif (
                avg_solar_radiation
                < max_solar_radiation
                * SolarAnalysisConstants.EXTREME_LOW_RADIATION_THRESHOLD_RATIO
                or avg_solar_radiation < 100
            ) and solar_lux < 10000:
                cloud_cover = 70.0
            else:
                cloud_cover = 40.0

            cloud_cover = max(
                SolarAnalysisConstants.MIN_CLOUD_COVER, cloud_cover + bias_adjustment
            )
        else:
            # Calculate cloud cover from solar measurements
            cloud_cover = self._calculate_cloud_cover_from_solar(
                avg_solar_radiation,
                solar_lux,
                uv_index,
                max_solar_radiation,
                solar_elevation,
            )

        # Apply pressure trend adjustment
        if pressure_trends:
            pressure_adjustment = self._calculate_pressure_trend_cloud_adjustment(
                pressure_trends
            )
            cloud_cover = max(
                SolarAnalysisConstants.MIN_CLOUD_COVER,
                min(
                    SolarAnalysisConstants.MAX_CLOUD_COVER,
                    cloud_cover + pressure_adjustment,
                ),
            )

        # Apply hysteresis to prevent extreme jumps
        cloud_cover = self._apply_cloud_cover_hysteresis(cloud_cover)

        # Store for future reference
        if "cloud_cover" not in self._sensor_history:
            self._sensor_history["cloud_cover"] = deque(maxlen=50)
        self._sensor_history["cloud_cover"].append(
            {"timestamp": datetime.now(), "value": cloud_cover}
        )

        return cloud_cover

    def _calculate_cloud_cover_from_solar(
        self,
        avg_solar_radiation: float,
        solar_lux: float,
        uv_index: float,
        max_solar_radiation: float,
        solar_elevation: float,
    ) -> float:
        """Calculate cloud cover from solar measurements.

        Combines multiple solar sensors (radiation, lux, UV) with intelligent
        weighting to estimate cloud cover percentage. Includes UV consistency
        checking and dynamic weight adjustment based on sensor availability.

        Args:
            avg_solar_radiation: Averaged solar radiation in W/m²
            solar_lux: Solar illuminance in lux
            uv_index: UV index value
            max_solar_radiation: Theoretical clear-sky maximum in W/m²
            solar_elevation: Sun angle above horizon in degrees

        Returns:
            Cloud cover percentage (0-100)
        """
        # Safety check for miscalibration
        radiation_ratio = avg_solar_radiation / max_solar_radiation

        if (
            radiation_ratio > SolarAnalysisConstants.CLEAR_SKY_EXCESS_THRESHOLD_RATIO
            and (avg_solar_radiation - max_solar_radiation)
            > SolarAnalysisConstants.CLEAR_SKY_EXCESS_THRESHOLD_ABS
        ):
            _LOGGER.warning(
                "Solar radiation (%.1f W/m²) exceeds clear-sky max (%.1f W/m²). "
                "Consider increasing zenith_max_radiation from %.1f W/m².",
                avg_solar_radiation,
                max_solar_radiation,
                self.zenith_max_radiation,
            )
            radiation_ratio = 1.0

        # Calculate cloud cover from each measurement
        solar_cloud_cover = max(
            SolarAnalysisConstants.MIN_CLOUD_COVER,
            min(
                SolarAnalysisConstants.MAX_CLOUD_COVER,
                SolarAnalysisConstants.MAX_CLOUD_COVER - (radiation_ratio * 100),
            ),
        )

        # Calculate lux and UV maximums
        max_solar_lux = max_solar_radiation * SolarPhysicsConstants.MAX_LUX_MULTIPLIER
        air_mass = self._calculate_air_mass(solar_elevation)
        max_uv_index = max(
            0.5,
            SolarPhysicsConstants.UV_MAX_BASE
            * math.exp(SolarPhysicsConstants.UV_ATTENUATION * air_mass),
        )

        lux_cloud_cover = max(
            SolarAnalysisConstants.MIN_CLOUD_COVER,
            min(
                SolarAnalysisConstants.MAX_CLOUD_COVER,
                SolarAnalysisConstants.MAX_CLOUD_COVER
                - (solar_lux / max_solar_lux * 100),
            ),
        )
        uv_cloud_cover = max(
            SolarAnalysisConstants.MIN_CLOUD_COVER,
            min(
                SolarAnalysisConstants.MAX_CLOUD_COVER,
                SolarAnalysisConstants.MAX_CLOUD_COVER
                - (uv_index / max_uv_index * 100),
            ),
        )

        # Weight the measurements
        if avg_solar_radiation > 10:
            # Check UV consistency
            if uv_index > 0:
                uv_solar_diff = abs(solar_cloud_cover - uv_cloud_cover)
                if uv_solar_diff > SolarAnalysisConstants.UV_INCONSISTENCY_THRESHOLD:
                    _LOGGER.debug(
                        "UV inconsistent with solar (UV: %.1f%%, Solar: %.1f%%), ignoring UV",
                        uv_cloud_cover,
                        solar_cloud_cover,
                    )
                    cloud_cover = (
                        solar_cloud_cover
                        * SolarAnalysisConstants.SOLAR_RADIATION_WEIGHT
                        + lux_cloud_cover * SolarAnalysisConstants.SOLAR_LUX_WEIGHT
                    )
                else:
                    cloud_cover = (
                        solar_cloud_cover
                        * SolarAnalysisConstants.SOLAR_RADIATION_WEIGHT
                        + lux_cloud_cover * SolarAnalysisConstants.SOLAR_LUX_WEIGHT
                        + uv_cloud_cover * SolarAnalysisConstants.UV_INDEX_WEIGHT
                    )
            else:
                cloud_cover = (
                    solar_cloud_cover * SolarAnalysisConstants.SOLAR_RADIATION_WEIGHT
                    + lux_cloud_cover * SolarAnalysisConstants.SOLAR_LUX_WEIGHT
                )
        elif solar_lux > 100:
            cloud_cover = (
                lux_cloud_cover * SolarPhysicsConstants.LUX_WEIGHT_SECONDARY
                + uv_cloud_cover * SolarPhysicsConstants.UV_WEIGHT_SECONDARY
                if uv_index > 0
                else lux_cloud_cover
            )
        elif uv_index > 0:
            cloud_cover = uv_cloud_cover
        else:
            cloud_cover = solar_cloud_cover

        return cloud_cover

    def _calculate_clear_sky_max_radiation(
        self, solar_elevation: float, current_date: Optional[datetime] = None
    ) -> float:
        """Calculate theoretical clear-sky maximum solar radiation.

        Args:
            solar_elevation: Solar elevation angle in degrees
            current_date: Optional datetime for seasonal calculations

        Returns:
            Theoretical clear-sky maximum in W/m²
        """
        if solar_elevation <= 0:
            return 50.0

        # Get current date for seasonal calculations
        now = current_date if current_date is not None else datetime.now()
        day_of_year = now.timetuple().tm_yday

        # Solar constant variation (±3.3% due to elliptical orbit)
        solar_constant_variation = (
            1
            + SolarPhysicsConstants.SOLAR_CONSTANT_VARIATION
            * math.cos(2 * math.pi * (day_of_year - 4) / 365.25)
        )

        # Calculate air mass and atmospheric transmission
        air_mass = self._calculate_air_mass(solar_elevation)

        # Atmospheric extinction components
        rayleigh_extinction = math.exp(
            SolarPhysicsConstants.EXTINCTION_RAYLEIGH * air_mass
        )
        ozone_extinction = math.exp(SolarPhysicsConstants.EXTINCTION_OZONE * air_mass)
        water_vapor_extinction = math.exp(
            SolarPhysicsConstants.EXTINCTION_WATER * air_mass
        )
        aerosol_extinction = math.exp(
            SolarPhysicsConstants.EXTINCTION_AEROSOL * air_mass
        )

        atmospheric_transmission = (
            rayleigh_extinction
            * ozone_extinction
            * water_vapor_extinction
            * aerosol_extinction
        )

        # Calculate astronomical scaling
        astronomical_scaling = atmospheric_transmission * math.sin(
            math.radians(solar_elevation)
        )

        # Apply calibration
        calibrated_max_radiation = (
            self.zenith_max_radiation * solar_constant_variation * astronomical_scaling
        )

        # Ensure reasonable bounds
        calibrated_max_radiation = max(
            SolarAnalysisConstants.MIN_CLEAR_SKY_RADIATION,
            min(
                SolarAnalysisConstants.MAX_CLEAR_SKY_RADIATION, calibrated_max_radiation
            ),
        )

        _LOGGER.debug(
            "Clear-sky max: %.1f W/m² (elevation: %.1f°, air_mass: %.3f, "
            "zenith_max: %.1f, scaling: %.3f)",
            calibrated_max_radiation,
            solar_elevation,
            air_mass,
            self.zenith_max_radiation,
            astronomical_scaling,
        )

        return calibrated_max_radiation

    def _calculate_air_mass(self, solar_elevation: float) -> float:
        """Calculate air mass using Gueymard 2003 formula."""
        if solar_elevation <= 0:
            return SolarAnalysisConstants.MAX_AIR_MASS

        zenith_angle = 90.0 - solar_elevation
        zenith_rad = math.radians(zenith_angle)
        cos_z = math.cos(zenith_rad)

        # Gueymard 2003 formula
        cos_z_squared = cos_z * cos_z
        cos_z_cubed = cos_z_squared * cos_z

        numerator = 1.002432 * cos_z_squared + 0.148386 * cos_z + 0.0096467
        denominator = (
            cos_z_cubed + 0.149864 * cos_z_squared + 0.0102963 * cos_z + 0.000303978
        )

        air_mass = numerator / denominator
        return max(1.0, air_mass)

    def _get_solar_radiation_average(self, current_radiation: float) -> float:
        """Calculate moving average of solar radiation.

        Applies a weighted moving average over recent readings to smooth
        out rapid fluctuations (e.g., passing clouds). More recent readings
        receive higher weight.

        Args:
            current_radiation: Most recent radiation reading in W/m²

        Returns:
            Weighted average radiation in W/m², or current value if
            insufficient history
        """
        if current_radiation is None:
            current_radiation = 0.0

        if "solar_radiation" not in self._sensor_history:
            return current_radiation

        cutoff_time = datetime.now() - timedelta(
            minutes=SolarAnalysisConstants.AVERAGING_WINDOW_MINUTES
        )
        recent_readings = [
            entry["value"]
            for entry in self._sensor_history["solar_radiation"]
            if entry["timestamp"] > cutoff_time and entry["value"] > 0
        ]

        if len(recent_readings) < SolarAnalysisConstants.MINIMUM_SAMPLES_FOR_AVERAGE:
            return current_radiation

        # Weighted average favoring recent readings
        weights = []
        for i in range(len(recent_readings)):
            weight = SolarAnalysisConstants.RECENT_READING_WEIGHT_MIN + (
                SolarAnalysisConstants.RECENT_READING_WEIGHT_MAX
                * i
                / (len(recent_readings) - 1)
            )
            weights.append(weight)

        weighted_sum = sum(
            value * weight for value, weight in zip(recent_readings, weights)
        )
        total_weight = sum(weights)

        if total_weight > 0:
            return weighted_sum / total_weight

        return current_radiation

    def _calculate_pressure_trend_cloud_adjustment(
        self, pressure_trends: Dict[str, Any]
    ) -> float:
        """Calculate cloud cover adjustment based on pressure trends.

        Modifies cloud cover estimate based on atmospheric pressure patterns.
        Falling pressure typically indicates increasing cloudiness; rising
        pressure suggests clearing skies. Considers both short-term (3h) and
        long-term (24h) trends plus pressure system type.

        Args:
            pressure_trends: Dictionary with trend analysis from TrendsAnalyzer

        Returns:
            Cloud cover adjustment in percentage points (-40 to +35)
            Negative = clearer than solar suggests, Positive = cloudier
        """
        if not pressure_trends:
            return 0.0

        current_trend = pressure_trends.get("current_trend", 0.0)
        long_term_trend = pressure_trends.get("long_term_trend", 0.0)
        pressure_system = pressure_trends.get("pressure_system", "normal")

        # Short-term adjustment
        short_term_adjustment = 0.0
        if current_trend < PressureThresholds.TREND_3H_RAPID_FALL:
            short_term_adjustment = max(
                -20.0, current_trend * PressureThresholds.SHORT_TERM_MULTIPLIER_FALL
            )
        elif current_trend > PressureThresholds.TREND_3H_MODERATE_RISE:
            short_term_adjustment = min(
                20.0, current_trend * PressureThresholds.SHORT_TERM_MULTIPLIER_RISE
            )

        # Long-term adjustment
        long_term_adjustment = 0.0
        if long_term_trend < PressureThresholds.TREND_24H_RAPID_FALL:
            long_term_adjustment = max(
                -25.0, long_term_trend * PressureThresholds.LONG_TERM_MULTIPLIER_FALL
            )
        elif long_term_trend > PressureThresholds.TREND_24H_MODERATE_RISE:
            long_term_adjustment = min(
                25.0, long_term_trend * PressureThresholds.LONG_TERM_MULTIPLIER_RISE
            )

        # System adjustment
        system_adjustment = 0.0
        if pressure_system == "low_pressure":
            system_adjustment = PressureThresholds.LOW_PRESSURE_CLOUD_INCREASE
        elif pressure_system == "high_pressure":
            system_adjustment = PressureThresholds.HIGH_PRESSURE_CLOUD_REDUCTION
        elif pressure_system == "storm":
            system_adjustment = PressureThresholds.STORM_CLOUD_INCREASE

        # Combine adjustments
        total_adjustment = (
            short_term_adjustment * SolarPhysicsConstants.PRESSURE_SHORT_TERM_WEIGHT
            + long_term_adjustment * SolarPhysicsConstants.PRESSURE_LONG_TERM_WEIGHT
            + system_adjustment * PressureThresholds.SYSTEM_WEIGHT
        )

        total_adjustment = max(-40.0, min(35.0, total_adjustment))

        _LOGGER.debug(
            "Pressure cloud adjustment: %.1f%% (short: %.1f%%, long: %.1f%%, system: %.1f%%)",
            total_adjustment,
            short_term_adjustment,
            long_term_adjustment,
            system_adjustment,
        )

        return total_adjustment

    def _apply_cloud_cover_hysteresis(self, cloud_cover: float) -> float:
        """Apply hysteresis to prevent extreme cloud cover jumps.

        Limits the maximum change in cloud cover between consecutive readings
        to prevent unrealistic rapid changes that might result from sensor
        noise or brief cloud passages.

        Args:
            cloud_cover: Newly calculated cloud cover percentage

        Returns:
            Cloud cover percentage limited to reasonable change rate
        """
        recent_readings = self._sensor_history.get("cloud_cover", deque())

        if len(recent_readings) > 0:
            last_reading = None
            for entry in reversed(list(recent_readings)[-10:]):
                if entry["value"] is not None:
                    last_reading = entry["value"]
                    break

            if last_reading is not None:
                cover_change = abs(cloud_cover - last_reading)
                if (
                    cover_change
                    > SolarAnalysisConstants.CLOUD_COVER_HYSTERESIS_MAX_CHANGE
                ):
                    max_change = SolarAnalysisConstants.CLOUD_COVER_HYSTERESIS_LIMIT
                    if cloud_cover > last_reading:
                        cloud_cover = min(cloud_cover, last_reading + max_change)
                    else:
                        cloud_cover = max(cloud_cover, last_reading - max_change)

                    _LOGGER.debug(
                        "Cloud cover change limited: %.1f%% → %.1f%%",
                        last_reading,
                        cloud_cover,
                    )

        return cloud_cover

    def _get_historical_weather_bias(self, hours: int = 6) -> Dict[str, Any]:
        """Calculate historical weather bias for low-elevation adjustments.

        Analyzes recent weather condition history to apply bias when solar
        measurements are unreliable (low sun angles, twilight). If conditions
        have been persistently clear, bias toward continuing clear conditions.

        Args:
            hours: Number of hours of history to analyze

        Returns:
            Dictionary containing:
            - clear_percentage: Percent of recent readings that were clear
            - bias_strength: 0-1 strength of bias toward clear conditions
            - recent_conditions: List of recent condition strings
            - is_morning: Boolean indicating morning hours (more conservative)
        """
        if "weather_condition" not in self._sensor_history:
            return {
                "clear_percentage": 0.0,
                "bias_strength": 0.0,
                "recent_conditions": [],
                "pressure_trend": None,
                "is_morning": False,
            }

        current_hour = datetime.now().hour
        is_morning = current_hour < 12

        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_conditions = [
            entry["value"]
            for entry in self._sensor_history["weather_condition"]
            if entry["timestamp"] > cutoff_time
        ]

        if not recent_conditions:
            return {
                "clear_percentage": 0.0,
                "bias_strength": 0.0,
                "recent_conditions": [],
                "pressure_trend": None,
                "is_morning": is_morning,
            }

        # Count clear conditions
        from homeassistant.components.weather import (
            ATTR_CONDITION_CLEAR_NIGHT,
            ATTR_CONDITION_SUNNY,
        )

        clear_conditions = [ATTR_CONDITION_SUNNY, ATTR_CONDITION_CLEAR_NIGHT]
        clear_count = sum(
            1 for condition in recent_conditions if condition in clear_conditions
        )
        total_count = len(recent_conditions)
        clear_percentage = (clear_count / total_count) * 100 if total_count > 0 else 0.0

        # Calculate bias strength (simplified without atmospheric analyzer reference)
        base_bias = min(1.0, clear_percentage / 100.0)

        # Apply morning conservatism
        if is_morning and base_bias > 0.5:
            base_bias = max(0.5, base_bias * 0.8)

        return {
            "clear_percentage": clear_percentage,
            "bias_strength": base_bias,
            "recent_conditions": recent_conditions[-10:],
            "is_morning": is_morning,
        }

    def map_cloud_cover_to_condition(self, cloud_cover: float) -> str:
        """Map cloud cover percentage to weather condition.

        Uses the CloudCoverThresholds constants for consistent mapping:
        - < 30% = Sunny (clear skies with few clouds)
        - 30-60% = Partly cloudy (mix of sun and clouds)
        - 60-85% = Cloudy (mostly overcast)
        - > 85% = Overcast (handled same as cloudy for current conditions)

        Note: The THRESHOLD_CLOUDY constant (85%) represents the upper bound
        of "cloudy" before it becomes "overcast". For the sunny->partly cloudy
        and partly cloudy->cloudy transitions, we use the thresholds directly.
        """
        if cloud_cover <= CloudCoverThresholds.THRESHOLD_SUNNY:
            return ATTR_CONDITION_SUNNY
        elif cloud_cover <= CloudCoverThresholds.THRESHOLD_PARTLY_CLOUDY:
            return ATTR_CONDITION_PARTLYCLOUDY
        else:
            # Everything above THRESHOLD_PARTLY_CLOUDY (60%) is cloudy
            # THRESHOLD_CLOUDY (85%) represents "very cloudy/overcast" which
            # still maps to CLOUDY condition (precipitation would override)
            return ATTR_CONDITION_CLOUDY

    def apply_condition_hysteresis(
        self, proposed_condition: str, current_cloud_cover: float
    ) -> str:
        """Apply hysteresis to prevent rapid condition changes.

        This method ensures weather conditions are stable before reporting
        a change. It requires a meaningful change in cloud cover before
        allowing a condition transition.
        """
        # Clean up old entries (keep last 24 hours)
        cutoff_time = datetime.now() - timedelta(hours=24)
        self._condition_history = deque(
            [
                entry
                for entry in self._condition_history
                if entry["timestamp"] > cutoff_time
            ]
        )

        # Get recent history (last 1 hour)
        hysteresis_cutoff = datetime.now() - timedelta(hours=1)
        recent_history = [
            entry
            for entry in self._condition_history
            if entry["timestamp"] > hysteresis_cutoff
        ]

        if not recent_history:
            self._condition_history.append(
                {
                    "condition": proposed_condition,
                    "cloud_cover": current_cloud_cover,
                    "timestamp": datetime.now(),
                }
            )
            return proposed_condition

        last_entry = recent_history[-1]
        last_condition = last_entry["condition"]
        last_cloud_cover = last_entry["cloud_cover"]

        if proposed_condition == last_condition:
            self._condition_history.append(
                {
                    "condition": proposed_condition,
                    "cloud_cover": current_cloud_cover,
                    "timestamp": datetime.now(),
                }
            )
            return proposed_condition

        # Calculate cloud cover difference
        cloud_cover_change = abs(current_cloud_cover - last_cloud_cover)

        # Define hysteresis thresholds - require larger changes for stability
        # These thresholds prevent oscillation between conditions
        hysteresis_thresholds = {
            # Transitioning from sunny to other conditions requires more confidence
            (ATTR_CONDITION_SUNNY, ATTR_CONDITION_PARTLYCLOUDY): 15.0,
            (ATTR_CONDITION_PARTLYCLOUDY, ATTR_CONDITION_SUNNY): 12.0,
            # Transitioning between partly cloudy and cloudy
            (ATTR_CONDITION_PARTLYCLOUDY, ATTR_CONDITION_CLOUDY): 15.0,
            (ATTR_CONDITION_CLOUDY, ATTR_CONDITION_PARTLYCLOUDY): 12.0,
            # Direct transitions between sunny and cloudy require significant change
            (ATTR_CONDITION_SUNNY, ATTR_CONDITION_CLOUDY): 25.0,
            (ATTR_CONDITION_CLOUDY, ATTR_CONDITION_SUNNY): 20.0,
        }

        transition_key = (last_condition, proposed_condition)
        hysteresis_threshold = hysteresis_thresholds.get(transition_key, 10.0)

        # Also check trend - if multiple recent readings support the change, allow it
        # Count how many recent readings match the proposed condition
        recent_matches = sum(
            1
            for entry in recent_history[-5:]
            if entry["condition"] == proposed_condition
        )
        if recent_matches >= 2:
            # The trend supports this change, use lower threshold
            hysteresis_threshold = hysteresis_threshold * 0.7

        if cloud_cover_change >= hysteresis_threshold:
            _LOGGER.debug(
                "Condition change: %s -> %s (cloud cover: %.1f -> %.1f, change: %.1f >= %.1f)",
                last_condition,
                proposed_condition,
                last_cloud_cover,
                current_cloud_cover,
                cloud_cover_change,
                hysteresis_threshold,
            )
            self._condition_history.append(
                {
                    "condition": proposed_condition,
                    "cloud_cover": current_cloud_cover,
                    "timestamp": datetime.now(),
                }
            )
            return proposed_condition
        else:
            _LOGGER.debug(
                "Condition stable: keeping %s (proposed: %s, cloud cover: %.1f -> %.1f, change: %.1f < %.1f)",
                last_condition,
                proposed_condition,
                last_cloud_cover,
                current_cloud_cover,
                cloud_cover_change,
                hysteresis_threshold,
            )
            self._condition_history.append(
                {
                    "condition": last_condition,
                    "cloud_cover": current_cloud_cover,
                    "timestamp": datetime.now(),
                }
            )
            return last_condition
