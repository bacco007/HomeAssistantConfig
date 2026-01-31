"""Meteorological constants and thresholds for weather analysis.

This module contains scientifically-based thresholds and constants used
throughout the weather analysis system. Values are based on meteorological
research and observational standards.
"""

from dataclasses import dataclass, field
from typing import Dict


@dataclass(frozen=True)
class FogThresholds:
    """Fog detection thresholds based on meteorological research.

    Fog forms when air near the surface becomes saturated (RH near 100%)
    and the temperature-dewpoint spread approaches zero. Light winds
    allow fog to form, while strong winds disperse it.

    References:
        - National Weather Service fog criteria
        - WMO fog classification guidelines
    """

    # Humidity thresholds (%)
    HUMIDITY_DENSE_FOG = 98  # Near saturation - dense fog highly likely
    HUMIDITY_PROBABLE_FOG = 95  # Very high - fog probable
    HUMIDITY_POSSIBLE_FOG = 92  # High - fog possible
    HUMIDITY_MARGINAL_FOG = 88  # Moderately high - marginal conditions

    # Scoring weights for humidity factor (max 40 points)
    SCORE_DENSE = 40
    SCORE_PROBABLE = 30
    SCORE_POSSIBLE = 20
    SCORE_MARGINAL = 10

    # Temperature-dewpoint spread thresholds (°F)
    SPREAD_SATURATED = 0.5  # Nearly saturated
    SPREAD_VERY_CLOSE = 1.0  # Very close to dewpoint
    SPREAD_CLOSE = 2.0  # Close to dewpoint
    SPREAD_MARGINAL = 3.0  # Marginal spread

    # Scoring weights for spread factor (max 30 points)
    SCORE_SPREAD_SATURATED = 30
    SCORE_SPREAD_VERY_CLOSE = 25
    SCORE_SPREAD_CLOSE = 15
    SCORE_SPREAD_MARGINAL = 5

    # Wind thresholds (mph)
    WIND_CALM = 2  # Calm - ideal for dense fog
    WIND_LIGHT = 5  # Light - fog can persist
    WIND_MODERATE = 8  # Moderate - fog may form but lighter

    # Scoring weights for wind factor (max 15 points)
    SCORE_WIND_CALM = 15
    SCORE_WIND_LIGHT = 10
    SCORE_WIND_MODERATE = 5
    PENALTY_WIND_STRONG = -10  # Strong winds disperse fog

    # Solar radiation thresholds (W/m²)
    SOLAR_VERY_LOW = 50  # Dense fog blocking sun
    SOLAR_LOW = 150  # Moderate fog or heavy overcast
    SOLAR_REDUCED = 300  # Light fog or overcast
    SOLAR_MINIMAL_NIGHT = 2  # No radiation at night
    SOLAR_TWILIGHT = 10  # Minimal twilight radiation
    SOLAR_MODERATE_TWILIGHT = 50  # Moderate twilight

    # Scoring weights for solar factor (max 15 points)
    SCORE_SOLAR_DENSE = 15
    SCORE_SOLAR_MODERATE = 10
    SCORE_SOLAR_LIGHT = 5
    SCORE_SOLAR_NIGHT = 10
    SCORE_SOLAR_TWILIGHT = 5
    PENALTY_SOLAR_STRONG = -15  # Strong radiation unlikely with fog

    # Temperature bonus thresholds
    TEMP_WARM_THRESHOLD = 40  # °F - warm enough for evaporation fog

    # Detection thresholds (fog score 0-100)
    THRESHOLD_DENSE_FOG = 70  # Dense fog
    THRESHOLD_MODERATE_FOG = 55  # Moderate fog
    THRESHOLD_LIGHT_FOG = 45  # Light fog (requires high humidity confirmation)


@dataclass(frozen=True)
class WindThresholds:
    """Wind speed thresholds based on Beaufort Wind Scale.

    The Beaufort scale is an empirical measure relating wind speed to
    observed conditions. Adapted for mph (US standard).

    References:
        - Beaufort Wind Scale (UK Met Office)
        - National Weather Service wind classification
    """

    # Wind speed thresholds (mph)
    CALM = 1  # Beaufort 0-1: Calm to light air
    LIGHT_BREEZE = 8  # Beaufort 2-3: Light to gentle breeze
    MODERATE_BREEZE = 13  # Beaufort 4: Moderate breeze
    FRESH_BREEZE = 19  # Beaufort 5-6: Fresh to strong breeze
    NEAR_GALE = 32  # Beaufort 7-8: Near gale to gale
    STRONG_GALE = 47  # Beaufort 9-10: Strong gale to storm
    VIOLENT_STORM = 64  # Beaufort 11-12: Violent storm to hurricane

    # Gust factor thresholds (ratio of gust to sustained wind)
    GUST_FACTOR_MODERATE = 1.5  # Moderate turbulence
    GUST_FACTOR_STRONG = 2.0  # Strong turbulence
    GUST_FACTOR_SEVERE = 3.0  # Severe turbulence (thunderstorm indicator)

    # Absolute gust thresholds (mph)
    GUST_MODERATE = 10  # Moderate gusts
    GUST_STRONG = 15  # Strong gusts
    GUST_SEVERE = 20  # Severe gusts
    GUST_EXTREME = 40  # Extreme gusts (likely thunderstorm)


@dataclass(frozen=True)
class PressureThresholds:
    """Atmospheric pressure thresholds and trend analysis parameters.

    Pressure values in inches of mercury (inHg) at sea level.
    Trends measured in hectopascals (hPa) or millibars (mb).

    References:
        - NOAA pressure system definitions
        - Aviation weather standards (altimeter settings)
    """

    # Absolute pressure thresholds (inHg at sea level)
    EXTREMELY_LOW = 29.20  # Severe storm/hurricane
    VERY_LOW = 29.50  # Strong storm system
    LOW = 29.80  # Low pressure system
    NORMAL_LOW = 29.90  # Lower end of normal
    NORMAL_HIGH = 30.20  # Upper end of normal
    HIGH = 30.40  # High pressure system
    VERY_HIGH = 30.70  # Very high pressure

    # Pressure change thresholds (hPa/period)
    # 3-hour trends (short-term)
    TREND_3H_RAPID_FALL = -0.5  # Rapid fall
    TREND_3H_MODERATE_FALL = -0.2  # Moderate fall
    TREND_3H_MODERATE_RISE = 0.2  # Moderate rise
    TREND_3H_RAPID_RISE = 0.5  # Rapid rise

    # 24-hour trends (long-term)
    TREND_24H_RAPID_FALL = -1.0  # Rapid fall
    TREND_24H_MODERATE_FALL = -0.3  # Moderate fall
    TREND_24H_MODERATE_RISE = 0.1  # Moderate rise
    TREND_24H_RAPID_RISE = 0.5  # Rapid rise

    # Cloud cover adjustment parameters
    CLOUD_ADJUSTMENT_MAX = 50.0  # Maximum adjustment (%)
    SHORT_TERM_MULTIPLIER_FALL = 8.0  # For falling pressure
    SHORT_TERM_MULTIPLIER_RISE = 15.0  # For rising pressure
    LONG_TERM_MULTIPLIER_FALL = 6.0  # For sustained fall
    LONG_TERM_MULTIPLIER_RISE = 12.0  # For sustained rise

    # System type adjustments (%)
    HIGH_PRESSURE_CLOUD_REDUCTION = -50.0  # Clear skies
    LOW_PRESSURE_CLOUD_INCREASE = 20.0  # Cloudy
    STORM_CLOUD_INCREASE = 40.0  # Very cloudy

    # System adjustment weight
    SYSTEM_WEIGHT = 0.30  # 30% weight for pressure system type


@dataclass(frozen=True)
class PrecipitationThresholds:
    """Precipitation intensity classification thresholds.

    All values are in inches per hour (in/h), the standard US unit for rain rate.
    These thresholds are based on NWS precipitation intensity classifications.

    Conversion reference:
        - 0.01 in/h ≈ 0.25 mm/h (trace)
        - 0.10 in/h ≈ 2.5 mm/h (light)
        - 0.25 in/h ≈ 6.4 mm/h (moderate)
        - 0.50 in/h ≈ 12.7 mm/h (heavy)
        - 1.00 in/h ≈ 25.4 mm/h (very heavy)

    References:
        - National Weather Service precipitation classification
        - NOAA rainfall intensity guidelines
    """

    # Rain rate thresholds (in/h - inches per hour)
    SIGNIFICANT = 0.01  # Minimum detectable precipitation (trace)
    LIGHT = 0.1  # Light rain threshold
    MODERATE = 0.25  # Moderate rain threshold
    HEAVY = 0.5  # Heavy rain threshold
    VERY_HEAVY = 1.0  # Very heavy rain/pouring

    # Storm detection thresholds (in/h)
    STORM_MIN_RATE = 0.05  # Minimum rate for severe weather with turbulence
    STORM_MODERATE_RATE = 0.1  # Moderate rate for storm classification
    STORM_HEAVY_RATE = 0.25  # Heavy rate for storm classification


@dataclass(frozen=True)
class TemperatureThresholds:
    """Temperature-related thresholds for weather classification.

    Temperatures in Fahrenheit.
    """

    # Phase change thresholds
    FREEZING = 32.0  # Water freezing point

    # Fog-related temperature thresholds
    WARM_FOG_THRESHOLD = 40.0  # Warm enough for evaporation fog

    # Dewpoint spread thresholds (for various analyses)
    SPREAD_SATURATED = 2.0  # Nearly saturated (fog/precipitation likely)
    SPREAD_HUMID = 5.0  # High moisture content
    SPREAD_MODERATE = 10.0  # Moderate moisture
    SPREAD_DRY = 15.0  # Dry air

    # Humidity thresholds for condition analysis (%)
    HUMIDITY_HIGH = 90  # High humidity - fog/rain likely
    HUMIDITY_MODERATE_HIGH = 70  # Moderately high humidity
    HUMIDITY_MODERATE = 50  # Moderate humidity - comfortable

    # Humidity thresholds for atmospheric fallback conditions (%)
    HUMIDITY_FALLBACK_HIGH = 85  # Very high humidity threshold
    HUMIDITY_FALLBACK_MEDIUM = 80  # Medium-high humidity threshold
    HUMIDITY_FALLBACK_LOW = 75  # Moderate-high humidity threshold


@dataclass(frozen=True)
class CloudCoverThresholds:
    """Cloud cover percentage thresholds for condition classification.

    Based on okta scale (0-8 eighths) converted to percentages.

    References:
        - WMO cloud classification (okta scale)
        - Aviation weather reporting standards (SKC/FEW/SCT/BKN/OVC)
    """

    # Cloud cover percentages
    CLEAR = 12.5  # 0-1 okta (0-12.5%) - Clear/Sunny
    FEW = 25.0  # 1-2 okta (12.5-25%) - Few clouds
    SCATTERED = 50.0  # 3-4 okta (25-50%) - Scattered/Partly cloudy
    BROKEN = 87.5  # 5-7 okta (50-87.5%) - Broken/Mostly cloudy
    OVERCAST = 100.0  # 8 okta (87.5-100%) - Overcast

    # Thresholds for condition mapping
    # These are more relaxed to avoid over-reporting cloudy conditions
    THRESHOLD_SUNNY = 30.0  # < 30% = Sunny/Clear (was 20%, too aggressive)
    THRESHOLD_PARTLY_CLOUDY = 60.0  # 30-60% = Partly cloudy (was 50%)
    THRESHOLD_CLOUDY = 85.0  # 60-85% = Cloudy (was 75%)
    # > 85% = Overcast (rainy if precipitation present)

    # Neutral threshold for unreliable measurements
    NEUTRAL = 50.0  # Neutral point (neither clear nor cloudy)
    RELIABILITY_BUFFER = 10.0  # +/- buffer around neutral (40-60% = unreliable)


@dataclass(frozen=True)
class SolarAnalysisConstants:
    """Constants for solar radiation analysis and cloud cover estimation.

    These constants govern the behavior of cloud cover estimation from
    solar radiation measurements, including sensor weighting, averaging,
    and threshold calculations.
    """

    # Solar radiation averaging parameters
    AVERAGING_WINDOW_MINUTES = 15  # Moving average window
    MINIMUM_SAMPLES_FOR_AVERAGE = 3  # Minimum readings for averaging
    RECENT_READING_WEIGHT_MIN = 0.3  # Minimum weight for recent readings
    RECENT_READING_WEIGHT_MAX = 0.7  # Maximum weight for recent readings

    # Cloud cover calculation thresholds (as fraction of clear-sky max)
    LOW_RADIATION_THRESHOLD_RATIO = 0.3  # 30% of clear-sky max
    VERY_LOW_RADIATION_THRESHOLD_RATIO = 0.1  # 10% of clear-sky max
    EXTREME_LOW_RADIATION_THRESHOLD_RATIO = 0.2  # 20% of clear-sky max

    # Solar validation thresholds
    CLEAR_SKY_EXCESS_THRESHOLD_RATIO = 1.10  # Warn if > 110% of theoretical max
    CLEAR_SKY_EXCESS_THRESHOLD_ABS = 20.0  # And absolute difference > 20 W/m²

    # Solar measurement thresholds for fallback logic
    MIN_SOLAR_RADIATION = 50  # W/m² - Minimum significant radiation
    MIN_SOLAR_LUX = 20000  # lux - Minimum significant illuminance
    MIN_UV_INDEX = 1  # Minimum significant UV index
    LOW_ELEVATION_THRESHOLD = 15  # degrees - Low sun angle threshold

    # Multi-sensor weighting factors (must sum to 1.0)
    SOLAR_RADIATION_WEIGHT = 0.8  # Primary measurement weight
    SOLAR_LUX_WEIGHT = 0.15  # Secondary measurement weight
    UV_INDEX_WEIGHT = 0.05  # Tertiary measurement weight
    UV_INCONSISTENCY_THRESHOLD = 30.0  # % - UV/solar disagreement threshold

    # Cloud cover bounds
    MIN_CLOUD_COVER = 0.0  # % - Clear sky
    MAX_CLOUD_COVER = 100.0  # % - Complete overcast
    CLOUD_COVER_HYSTERESIS_MAX_CHANGE = 40  # % - Maximum jump between readings
    CLOUD_COVER_HYSTERESIS_LIMIT = 30  # % - Hysteresis damping limit

    # Historical bias parameters
    HISTORICAL_BIAS_HOURS = 6  # Hours of history to consider
    BIAS_ADJUSTMENT_STRONG = -50.0  # % - Strong clearing bias
    BIAS_ADJUSTMENT_MODERATE = -30.0  # % - Moderate clearing bias
    BIAS_STRENGTH_THRESHOLD_STRONG = 0.7  # Strong bias threshold
    BIAS_STRENGTH_THRESHOLD_MODERATE = 0.5  # Moderate bias threshold

    # Astronomical calculation bounds
    MIN_CLEAR_SKY_RADIATION = 50.0  # W/m² - Minimum theoretical max
    MAX_CLEAR_SKY_RADIATION = 2000.0  # W/m² - Maximum theoretical max
    MAX_AIR_MASS = 38.0  # Air mass at horizon


@dataclass(frozen=True)
class DefaultSensorValues:
    """Default values for missing or unavailable sensors.

    These values are used as fallbacks when sensor data is unavailable
    or invalid. Values represent typical moderate conditions.
    """

    TEMPERATURE_F = 70.0  # °F - Typical moderate temperature
    HUMIDITY = 50.0  # % - Mid-range humidity
    PRESSURE_INHG = 29.92  # inHg - Standard sea level pressure
    WIND_SPEED = 0.0  # mph - Calm conditions
    SOLAR_RADIATION = 0.0  # W/m² - No radiation (night/clouds)
    ZENITH_MAX_RADIATION = 1000.0  # W/m² - Typical maximum at zenith


@dataclass(frozen=True)
class ForecastConstants:
    """Constants for weather forecasting algorithms.

    These values are used in daily and hourly forecast generation to model
    weather system evolution, temperature trends, and atmospheric dynamics.
    """

    # Seasonal temperature adjustments (°C)
    MAX_SEASONAL_ADJUSTMENT: float = 2.0  # Maximum daily temperature shift
    MIN_SEASONAL_ADJUSTMENT: float = -2.0  # Minimum daily temperature shift

    # Pressure system temperature influence (°C)
    HIGH_PRESSURE_TEMP_INFLUENCE: float = 2.0  # Warming effect of high pressure
    LOW_PRESSURE_TEMP_INFLUENCE: float = -3.0  # Cooling effect of low pressure

    # Trend calculation weights
    CURRENT_TREND_WEIGHT: float = 0.5  # Weight for current trend
    LONG_TERM_TREND_WEIGHT: float = 0.3  # Weight for long-term trend

    # Distance dampening factors (forecast confidence decay)
    DAILY_MIN_DAMPENING: float = 0.3  # Minimum confidence for distant days
    DAILY_DAMPENING_RATE: float = 0.15  # Confidence decay per day
    HOURLY_MIN_DAMPENING: float = 0.5  # Minimum confidence for distant hours
    HOURLY_DAMPENING_RATE: float = 0.02  # Confidence decay per hour
    HOURLY_NATURAL_VARIATION_DAMPENING: float = 0.3  # Min dampening for variation
    HOURLY_VARIATION_DECAY: float = 0.05  # Decay rate for natural variation

    # Uncertainty factors (exponential confidence decay)
    UNCERTAINTY_DECAY_RATE: float = 0.5  # Exponential decay rate
    MAX_FORECAST_CONFIDENCE: float = 0.95  # Day 1 confidence (95%)
    MIN_FORECAST_CONFIDENCE: float = 0.05  # Baseline minimum confidence

    # Storm probability thresholds (%)
    STORM_THRESHOLD_SEVERE: int = 70  # Severe storm threshold
    STORM_THRESHOLD_MODERATE: int = 40  # Moderate storm threshold
    STORM_THRESHOLD_HIGH: int = 60  # High storm probability

    # Pressure trend thresholds (inHg/3h or hPa/3h)
    PRESSURE_RAPID_FALL: float = -1.0  # Rapid pressure fall
    PRESSURE_SLOW_FALL: float = -0.5  # Slow pressure fall
    PRESSURE_MODERATE_RISE: float = 1.0  # Moderate pressure rise
    PRESSURE_RAPID_RISE: float = 1.5  # Rapid pressure rise

    # Precipitation multipliers
    PRECIP_MULT_STORM_HIGH: float = 1.8  # Storm probability >70%
    PRECIP_MULT_STORM_MODERATE: float = 1.4  # Storm probability >40%
    PRECIP_MULT_RAPID_FALL: float = 1.5  # Rapidly falling pressure
    PRECIP_MULT_SLOW_FALL: float = 1.25  # Slowly falling pressure
    PRECIP_MULT_RISING: float = 0.4  # Rising pressure (clearing)

    # Atmospheric stability adjustments
    STABILITY_DAMPENING_FACTOR: float = 0.3  # Stability impact on variation
    INSTABILITY_PRECIP_MULT: float = 0.5  # Unstable air precipitation boost

    # Moisture transport multiplier
    MOISTURE_TRANSPORT_DIVISOR: float = 10.0  # Normalize transport potential

    # Pressure influence multipliers
    PRESSURE_TREND_INFLUENCE_MULT: float = 0.5  # Current trend influence
    PRESSURE_LONG_TREND_MULT: float = 0.3  # Long-term trend influence
    PRESSURE_TEMP_MODULATION: float = 0.1  # Hourly pressure modulation

    # Distance-based reductions
    DAILY_DISTANCE_FACTOR_MIN: float = 0.2  # Minimum distance factor
    DAILY_DISTANCE_DECAY: float = 0.15  # Distance decay per day
    HOURLY_DISTANCE_FACTOR_MIN: float = 0.2  # Minimum hourly distance factor
    HOURLY_DISTANCE_DECAY: float = 0.03  # Distance decay per hour
    WIND_DISTANCE_FACTOR_MIN: float = 0.4  # Minimum wind distance factor
    WIND_DISTANCE_DECAY: float = 0.12  # Wind forecast decay per day

    # Natural variation parameters
    NATURAL_VARIATION_AMPLITUDE: float = 0.3  # Natural variation amplitude
    NATURAL_VARIATION_PERIOD: int = 3  # Natural variation period (hours)

    # Additional constants for daily forecast calculations
    # Default values (using DefaultSensorValues as reference)
    DEFAULT_TEMPERATURE: float = 70.0  # °F - Fallback temperature
    DEFAULT_HUMIDITY: float = 50.0  # % - Fallback humidity
    DEFAULT_WIND_SPEED: float = 5.0  # mph - Fallback wind speed

    # Confidence thresholds
    CONFIDENCE_THRESHOLD_HIGH: float = 0.7  # High confidence threshold
    DAY_ZERO_MIN_CONFIDENCE: float = 0.8  # Minimum confidence for day 0

    # Temperature range calculations (°F)
    # Note: Forecasts are generated in Fahrenheit internally
    DEFAULT_TEMP_RANGE: float = 10.0  # Default diurnal temperature range
    TEMP_RANGE_SUNNY: float = 12.0  # Large range on clear days
    TEMP_RANGE_PARTLYCLOUDY: float = 10.0
    TEMP_RANGE_CLOUDY: float = 7.0  # Small range on cloudy days
    TEMP_RANGE_RAINY: float = 5.0  # Very small range during rain
    TEMP_RANGE_LIGHTNING_RAINY: float = 4.0
    TEMP_RANGE_FOG: float = 3.0  # Minimal range in fog
    TEMP_RANGE_STABILITY_BASE: float = 0.5  # Base stability factor
    MIN_TEMP_RANGE: float = 3.0  # Minimum temperature range
    MAX_TEMP_RANGE: float = 20.0  # Maximum temperature range

    # Wind speed bounds (km/h)
    MIN_WIND_SPEED: float = 1.0  # Minimum reported wind speed

    # Humidity bounds (%)
    MIN_HUMIDITY: int = 10
    MAX_HUMIDITY: int = 100

    # Cloud cover thresholds
    CLOUD_COVER_CLOUDY_THRESHOLD: float = 40.0  # % - Threshold for cloudy condition

    # Condensation and precipitation thresholds
    CONDENSATION_RAIN_THRESHOLD: float = 0.7  # Condensation potential for rain
    STORM_PRECIPITATION_THRESHOLD: int = 60  # Storm probability for precipitation
    POURING_DAY_THRESHOLD: int = 2  # Day index for pouring vs lightning-rainy

    # Pressure trend thresholds for conditions
    PRESSURE_TREND_FALLING_THRESHOLD: float = 0.3  # Falling pressure threshold
    PRESSURE_TREND_RISING_THRESHOLD: float = 0.3  # Rising pressure threshold

    # Seasonal adjustment parameters
    SEASONAL_ADJUSTMENT_CENTER: float = 2.0  # Center point for adjustment
    SEASONAL_ADJUSTMENT_BASE_RATE: float = 0.3  # Base rate per day
    SEASONAL_ADJUSTMENT_VARIATION: float = 0.5  # Variation amplitude
    SEASONAL_ADJUSTMENT_CYCLE: int = 3  # Cycle period
    SEASONAL_ADJUSTMENT_CYCLE_OFFSET: int = 1  # Cycle offset
    SEASONAL_ADJUSTMENT_MAX_RANGE: float = 2.0  # Maximum adjustment range

    # Pattern influence parameters
    PATTERN_VOLATILITY_MULTIPLIER: float = 2.0  # Volatility scaling
    MIN_PATTERN_INFLUENCE: float = 0.2  # Minimum pattern influence
    PATTERN_DISTANCE_DECAY: float = 0.2  # Pattern decay per day
    PATTERN_ALTERNATION_BASELINE: float = 0.5  # Alternation baseline

    # Evolution influence
    EVOLUTION_BASE_INFLUENCE: float = 1.0  # Base evolution influence

    # Precipitation calculation factors
    RAIN_HISTORY_NORMALIZER: float = 10.0  # Rain history normalization
    MIN_PRECIPITATION_DISTANCE_FACTOR: float = 0.2  # Min precipitation distance factor

    # Humidity forecasting
    HUMIDITY_CHANGE_DAMPENING: float = 0.15  # Humidity change dampening

    # Wind forecasting
    MIN_WIND_DISTANCE_DAMPENING: float = 0.4  # Minimum wind distance dampening
    WIND_DISTANCE_DAMPENING_RATE: float = 0.12  # Wind distance decay rate


@dataclass(frozen=True)
class PrecipitationConstants:
    """Base precipitation amounts by weather condition.

    These values represent typical precipitation rates for different
    weather conditions. Units are in mm/day for daily forecasts.
    """

    # Base daily precipitation by condition (mm/day)
    LIGHTNING_RAINY: float = 7.0  # Thunderstorms with heavy rain
    POURING: float = 10.0  # Heavy continuous rain
    RAINY: float = 5.0  # Moderate rain
    SNOWY: float = 3.0  # Snow (liquid equivalent)
    CLOUDY: float = 0.5  # Overcast with possible drizzle
    FOG: float = 0.1  # Fog/mist

    # Conversion factor
    MM_TO_INCHES: float = 25.4  # Millimeters to inches conversion


@dataclass(frozen=True)
class PrecipitationModelConstants:
    """Constants for precipitation forecast modeling adjustments.

    Multipliers applied to base precipitation based on atmospheric trends.
    """

    # Humidity trends
    HUMIDITY_RISING_THRESHOLD: float = 0.5  # Trend threshold
    HUMIDITY_MAX_BOOST: float = 0.2  # Max boost (+20%)
    HUMIDITY_DIVISOR: float = 10.0  # Scaling divisor

    # Pressure trends (Falling)
    PRESSURE_RAPID_FALL: float = -0.5  # Threshold
    PRESSURE_RAPID_MULT: float = 1.25  # Multiplier (reduced from 1.5)
    PRESSURE_SLOW_FALL: float = -0.2  # Threshold
    PRESSURE_SLOW_MULT: float = 1.15  # Multiplier (reduced from 1.25)

    # Pressure trends (Rising/Clearing)
    PRESSURE_RISING_THRESHOLD: float = 0.3
    PRESSURE_RISING_MULT: float = 0.5  # Clearing multiplier

    # Storm probability
    STORM_HIGH_THRESHOLD: int = 70
    STORM_HIGH_MULT: float = 1.2  # Reduced from 1.8
    STORM_MEDIUM_THRESHOLD: int = 40
    STORM_MEDIUM_MULT: float = 1.15  # Reduced from 1.4

    # Condensation potential
    CONDENSATION_MULT: float = 0.2  # Multiplier for Day 0 boost (reduced from 0.5)

    # Global safety cap
    MAX_PRECIP_MULTIPLIER: float = 2.0  # Cap total forecast at 2x base amount


@dataclass(frozen=True)
class WindAdjustmentConstants:
    """Wind speed adjustment factors by weather condition.

    Multipliers applied to base wind speed based on weather conditions.
    Also includes pressure system effects on wind speed.
    """

    # Condition-based wind multipliers
    LIGHTNING_RAINY: float = 1.6  # Strong winds with thunderstorms
    POURING: float = 1.4  # Increased winds with heavy rain
    RAINY: float = 1.3  # Moderate wind increase with rain
    WINDY: float = 2.2  # Explicitly windy conditions
    CLOUDY: float = 0.9  # Slightly reduced winds
    PARTLYCLOUDY: float = 0.95  # Minimal wind reduction
    SUNNY: float = 0.8  # Calm sunny conditions
    CLEAR_NIGHT: float = 0.8  # Calm clear nights
    FOG: float = 0.7  # Light winds in fog
    SNOWY: float = 1.1  # Moderate winds with snow

    # Pressure system effects
    LOW_PRESSURE_MULT: float = 1.3  # Stronger winds in low pressure
    HIGH_PRESSURE_MULT: float = 0.8  # Lighter winds in high pressure

    # Wind stability effects
    DIRECTION_UNSTABLE_THRESHOLD: float = 0.3  # Threshold for unstable direction
    DIRECTION_STABLE_THRESHOLD: float = 0.8  # Threshold for stable direction
    DIRECTION_UNSTABLE_MULTIPLIER: float = 1.2  # Variable direction = stronger
    DIRECTION_STABLE_MULTIPLIER: float = 0.9  # Steady direction = lighter

    # Gradient wind effect multiplier
    GRADIENT_WIND_MULTIPLIER: float = 2.0  # Pressure gradient influence


@dataclass(frozen=True)
class HumidityTargetConstants:
    """Target humidity levels by weather condition.

    These represent typical humidity percentages for different
    weather conditions, used in forecast humidity calculations.
    """

    # Target humidity by condition (%)
    LIGHTNING_RAINY: int = 85  # High humidity with thunderstorms
    POURING: int = 90  # Very high humidity with heavy rain
    RAINY: int = 80  # High humidity with rain
    SNOWY: int = 75  # Moderate-high with snow
    CLOUDY: int = 70  # Elevated humidity
    PARTLYCLOUDY: int = 60  # Moderate humidity
    SUNNY: int = 50  # Lower humidity
    CLEAR_NIGHT: int = 65  # Night moisture increase
    WINDY: int = 55  # Moderate with wind
    FOG: int = 95  # Near saturation in fog

    # Moisture trend adjustments (%)
    MOISTURE_TREND_ADJUSTMENT: int = 5  # Moisture trend adjustment magnitude
    INCREASING_ADJUSTMENT: int = 5  # Added when moisture increasing
    DECREASING_ADJUSTMENT: int = -5  # Subtracted when moisture decreasing

    # Stability effects (%)
    STABILITY_HUMIDITY_ADJUSTMENT: int = 3  # Humidity adjustment for stability
    STABLE_ADJUSTMENT: int = 3  # Stable air retains moisture
    UNSTABLE_ADJUSTMENT: int = -3  # Unstable air mixes and reduces humidity

    # Stability thresholds
    STABILITY_HIGH_THRESHOLD: float = 0.7  # High stability threshold
    STABILITY_LOW_THRESHOLD: float = 0.3  # Low stability threshold


@dataclass(frozen=True)
class DiurnalPatternConstants:
    """Diurnal (time-of-day) variation patterns.

    Typical daily cycles for temperature, wind, and humidity based
    on solar heating and boundary layer dynamics.
    """

    # Temperature patterns (°C adjustment by time of day)
    TEMP_DAWN: float = -2.0  # Coolest period before sunrise
    TEMP_MORNING: float = 1.0  # Warming period
    TEMP_NOON: float = 3.0  # Peak heating
    TEMP_AFTERNOON: float = 2.0  # Still warm but decreasing
    TEMP_EVENING: float = -1.0  # Cooling begins
    TEMP_NIGHT: float = -3.0  # Cool night period
    TEMP_MIDNIGHT: float = -2.0  # Late night cooling

    # Wind patterns (km/h adjustment by time of day)
    WIND_DAWN: float = -1.0  # Light winds at dawn
    WIND_MORNING: float = 0.5  # Winds picking up
    WIND_NOON: float = 1.0  # Peak daytime winds
    WIND_AFTERNOON: float = 1.5  # Maximum boundary layer mixing
    WIND_EVENING: float = 0.5  # Winds decreasing
    WIND_NIGHT: float = -0.5  # Light night winds
    WIND_MIDNIGHT: float = -1.0  # Calm late night

    # Humidity patterns (% adjustment by time of day)
    HUMIDITY_DAWN: int = 5  # High morning moisture
    HUMIDITY_MORNING: int = -5  # Evaporation begins
    HUMIDITY_NOON: int = -10  # Lowest humidity
    HUMIDITY_AFTERNOON: int = -5  # Still relatively dry
    HUMIDITY_EVENING: int = 5  # Moisture increases
    HUMIDITY_NIGHT: int = 10  # High night humidity
    HUMIDITY_MIDNIGHT: int = 5  # Elevated late night

    # Micro-pattern parameters for fine-grained variations
    TEMP_MICRO_AMPLITUDE: float = 0.5  # Temperature micro-variation (°C)
    TEMP_MICRO_PERIOD: int = 12  # Temperature cycle period (hours)
    CLOUD_MICRO_AMPLITUDE: float = 2.0  # Cloud cover micro-variation (%)
    CLOUD_MICRO_PERIOD: int = 8  # Cloud cycle period (hours)


@dataclass(frozen=True)
class EvolutionConstants:
    """Weather system evolution confidence levels and transition rates.

    Defines how weather systems evolve over time and the confidence
    we have in predicting different evolution stages.
    """

    # Confidence levels by system type (tuple of confidence for each stage)
    # Format: (Day 1, Day 2, Day 3, Day 4)
    STABLE_HIGH_CONFIDENCE: tuple[float, float, float, float] = (0.9, 0.7, 0.5, 0.3)
    ACTIVE_LOW_CONFIDENCE: tuple[float, float, float, float] = (0.8, 0.6, 0.4, 0.3)
    FRONTAL_SYSTEM_CONFIDENCE: tuple[float, float, float, float] = (0.7, 0.8, 0.6, 0.4)
    TRANSITIONAL_CONFIDENCE: tuple[float, float, float, float] = (0.8, 0.5, 0.3, 0.2)

    # Confidence decay rates
    HOURLY_CONFIDENCE_DECAY: float = 0.98  # Per-hour confidence decay (2% per hour)
    RAPID_CHANGE_THRESHOLD: float = 0.5  # Threshold for rapid system change

    # Evolution frequency by pressure trend severity (hours between updates)
    EVOLUTION_FREQ_RAPID: int = 2  # Rapid pressure changes
    EVOLUTION_FREQ_MODERATE: int = 3  # Moderate pressure changes
    EVOLUTION_FREQ_SLOW: int = 6  # Slow/stable pressure changes


@dataclass(frozen=True)
class StabilityConstants:
    """Atmospheric stability calculation thresholds.

    Used to determine how stable or unstable the atmosphere is,
    which affects forecast persistence and weather patterns.
    """

    # Temperature trend thresholds (°C/12h)
    TEMP_TREND_STABLE: float = 2.0  # Below this = stable
    TEMP_TREND_UNSTABLE: float = 5.0  # Above this = unstable

    # Stability adjustments (added/subtracted from base 0.5)
    TEMP_STABLE_ADJUSTMENT: float = 0.2  # Stable temperature boost
    TEMP_UNSTABLE_ADJUSTMENT: float = -0.2  # Unstable temperature penalty
    WIND_STABLE_ADJUSTMENT: float = 0.15  # Light wind stability boost
    WIND_UNSTABLE_ADJUSTMENT: float = -0.15  # Strong wind stability penalty
    HUMIDITY_HIGH_ADJUSTMENT: float = 0.1  # High humidity stability boost
    HUMIDITY_LOW_ADJUSTMENT: float = -0.1  # Low humidity stability penalty

    # Humidity thresholds (%)
    HUMIDITY_LOW_THRESHOLD: int = 30  # Below this = dry/unstable

    # Weather system classification thresholds
    FRONTAL_WIND_STABILITY: float = 0.4  # Wind instability for frontal system
    FRONTAL_STORM_PROBABILITY: int = 50  # Storm probability for frontal system
    AIR_MASS_TEMP_CHANGE: float = 2.0  # Temperature trend for air mass change
    AIR_MASS_MIN_STABILITY: float = 0.6  # Minimum stability for air mass change


@dataclass(frozen=True)
class PressureTrendConstants:
    """Pressure trend classification and severity thresholds.

    Used to classify pressure trends and determine their impact
    on weather evolution and condition changes.
    """

    # Severity classification thresholds (inHg/3h)
    STABLE_THRESHOLD: float = 0.2  # Below this = stable
    SLOW_THRESHOLD: float = 0.5  # Slow change threshold
    MODERATE_THRESHOLD: float = 1.5  # Moderate change threshold
    # Above MODERATE_THRESHOLD = rapid

    # Trend direction thresholds (inHg/3h)
    DIRECTION_STABLE: float = 0.1  # Below this = stable
    DIRECTION_FALLING_MODERATE: float = -0.5  # Moderate falling
    DIRECTION_RISING_MODERATE: float = 0.5  # Moderate rising

    # Urgency calculation
    MAX_URGENCY_RATE: float = 3.0  # Maximum trend for urgency calculation

    # Cloud cover adjustments by pressure trend
    MAX_CLOUD_COVER: float = 95.0  # Maximum cloud cover limit
    MIN_CLOUD_COVER: float = 5.0  # Minimum cloud cover limit
    RAPID_FALL_CLOUD_INCREASE: float = 60.0  # Cloud increase for rapid fall
    SLOW_FALL_CLOUD_INCREASE: float = 40.0  # Cloud increase for slow fall
    RISING_CLOUD_DECREASE: float = 40.0  # Cloud decrease for rising pressure


@dataclass(frozen=True)
class WindShearConstants:
    """Wind shear intensity classification thresholds.

    Used to classify wind shear based on wind speed changes
    over time, important for storm development and aviation.
    """

    # Shear intensity thresholds (mph/hour)
    EXTREME_THRESHOLD: float = 5.0  # Extreme wind shear
    MODERATE_THRESHOLD: float = 2.0  # Moderate wind shear
    # Below MODERATE = low shear

    # Gradient wind calculation
    GRADIENT_WIND_MULTIPLIER: float = 2.0  # Pressure gradient to wind effect


@dataclass(frozen=True)
class MoistureAnalysisConstants:
    """Moisture transport and condensation analysis.

    Constants for analyzing atmospheric moisture content,
    transport potential, and condensation likelihood.
    """

    # Transport calculation
    TRANSPORT_MULTIPLIER: float = 10.0  # Wind stability to transport conversion

    # Dewpoint spread thresholds (°F)
    SPREAD_HIGH_MOISTURE: float = 5.0  # High moisture availability
    SPREAD_MODERATE_MOISTURE: float = 10.0  # Moderate moisture availability
    # Above SPREAD_MODERATE = low moisture

    # Condensation potentials (0.0-1.0)
    CONDENSATION_HIGH: float = 0.8  # High condensation likelihood
    CONDENSATION_MODERATE: float = 0.5  # Moderate condensation likelihood
    CONDENSATION_LOW: float = 0.2  # Low condensation likelihood

    # Humidity trend threshold (% change)
    HUMIDITY_TREND_THRESHOLD: float = 5.0  # Significant humidity change


@dataclass(frozen=True)
class PhysicsConstants:
    """Fundamental physical constants for meteorological calculations.

    Standard values for Earth's atmosphere and gravity.
    """

    G: float = 9.80665  # Gravitational acceleration (m/s²)
    R: float = 8.31432  # Universal gas constant (J/(mol·K))
    M_AIR: float = 0.0289644  # Molar mass of dry air (kg/mol)
    LAPSE_RATE: float = 0.0065  # Standard temperature lapse rate (K/m)
    STD_TEMP_SEA_LEVEL: float = 288.15  # Standard temperature at sea level (K)
    STD_PRESS_SEA_LEVEL_HPA: float = 1013.25  # Standard pressure at sea level (hPa)
    INHG_TO_HPA: float = 33.8639  # Conversion factor inHg to hPa


@dataclass(frozen=True)
class SolarPhysicsConstants:
    """Constants for solar radiation physics and atmospheric extinction.

    Used in clear-sky radiation models and cloud cover estimation.
    """

    # Orbital parameters
    SOLAR_CONSTANT_VARIATION: float = 0.033  # Variation due to elliptical orbit

    # Atmospheric extinction coefficients (Beer-Lambert law exponents)
    EXTINCTION_RAYLEIGH: float = -0.1  # Rayleigh scattering
    EXTINCTION_OZONE: float = -0.02  # Ozone absorption
    EXTINCTION_WATER: float = -0.05  # Water vapor absorption
    EXTINCTION_AEROSOL: float = -0.1  # Aerosol scattering

    # Conversion factors
    MAX_LUX_MULTIPLIER: float = 120.0  # W/m² to Lux conversion factor for clear sky

    # UV Index calculation
    UV_MAX_BASE: float = 12.0  # Base max UV index
    UV_ATTENUATION: float = -0.05  # UV attenuation coefficient

    # Cloud cover estimation weights
    LUX_WEIGHT_SECONDARY: float = 0.9  # Weight when only Lux is available
    UV_WEIGHT_SECONDARY: float = 0.1  # Weight for UV when only Lux is available

    # Pressure trend adjustment weights
    PRESSURE_SHORT_TERM_WEIGHT: float = 0.3
    PRESSURE_LONG_TERM_WEIGHT: float = 0.4


@dataclass(frozen=True)
class TrendConstants:
    """Constants for trend analysis and seasonal factors."""

    # Seasonal factors (0-1 scale, higher = more variable)
    SEASONAL_FACTORS: Dict[int, float] = field(
        default_factory=lambda: {
            12: 0.8,
            1: 0.9,
            2: 0.7,  # Winter
            3: 0.6,
            4: 0.5,
            5: 0.4,  # Spring
            6: 0.3,
            7: 0.4,
            8: 0.5,  # Summer
            9: 0.6,
            10: 0.7,
            11: 0.8,  # Fall
        }
    )

    # Volatility thresholds
    VOLATILITY_ACTIVE: float = 1.0  # Threshold for active weather
    VOLATILITY_MODERATE: float = 0.5  # Threshold for moderate weather

    # Correlation coefficients (estimated)
    CORRELATION_TEMP_PRESSURE: float = -0.6  # Inverse relationship
    CORRELATION_TEMP_HUMIDITY: float = -0.4  # Inverse relationship
