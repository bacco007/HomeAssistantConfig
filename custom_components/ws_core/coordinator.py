"""Coordinator for Weather Station Core -- v1.6.0.

The _compute() method is broken into focused sub-methods:
  _compute_raw_readings()          Unit conversion of all source sensors
  _compute_derived_temperature()   Dew point, frost point, wet-bulb, feels-like, 24h stats
  _compute_derived_pressure()      MSLP, pressure trend, Zambretti
  _compute_derived_wind()          Beaufort, quadrant, smoothing
  _compute_derived_precipitation() Rain rate, Kalman filter, rain display
  _compute_condition()             36-condition classifier
  _compute_rain_probability()      Local + API probability
  _compute_et0()                   ET₀ Hargreaves-Samani
  _compute_health()                Staleness, package status, alerts
  _compute()                       Orchestrator -- calls all sub-methods

v0.3.0 cleanup notes:
  - Removed METAR family entirely (cross-validation, learned biases, calibration suggestions)
  - Removed lifestyle scores (laundry, running, stargazing)
  - Removed degree-day accumulators (HDD/CDD/GDD - kept code path for streaks only)
  - Removed CWOP upload, CSV/JSON export
  - Pollen now fetched via Open-Meteo Air Quality API instead of Tomorrow.io
"""

from __future__ import annotations

import asyncio
import contextlib
import json as _json
import logging
import math
import pathlib as _pathlib
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from . import localize
from .algorithms import (
    CONDITION_COLORS,
    CONDITION_DESCRIPTIONS,
    CONDITION_ICONS,
    NOWCAST_BUCKET_THRESHOLD_MM,
    ZAMBRETTI_RAIN_PCT,
    KalmanFilter,
    aqi_level,
    beaufort_description,
    calculate_absolute_humidity,
    calculate_air_density,
    calculate_apparent_temperature,
    calculate_cdd_contribution,
    calculate_clearness_index,
    calculate_cloud_base_m,
    calculate_delta_t,
    calculate_dew_point,
    calculate_dominant_wind_direction,
    calculate_ffdi,
    calculate_ffwi,
    calculate_freezing_level_m,
    calculate_frost_point,
    calculate_gdd_contribution,
    calculate_hdd_contribution,
    calculate_heat_index,
    calculate_humidex,
    calculate_irrigation_deficit,
    calculate_leaf_wetness,
    calculate_max_solar_radiation,
    calculate_moon_illumination,
    calculate_net_radiation,
    calculate_rain_probability,
    calculate_specific_humidity,
    calculate_thsw_index,
    calculate_thw_index,
    calculate_us_aqi,
    calculate_utci,
    calculate_vpd,
    calculate_wbgt_outdoor,
    calculate_wbgt_simplified,
    calculate_wet_bulb,
    calculate_wind_chill,
    calculate_wind_direction_variability,
    calculate_wind_gust_factor,
    classify_precip_phase,
    clearness_to_cloud_cover,
    combine_rain_probability,
    compute_fwi,
    cross_sensor_consistency_flags,
    derive_nowcast,
    determine_current_condition,
    direction_to_quadrant,
    estimate_snowfall_cm,
    et0_hargreaves,
    et0_hourly_estimate,
    et0_penman_monteith,
    ffdi_danger_level,
    fog_probability,
    format_rain_display,
    get_condition_severity,
    humidity_level,
    indoor_comfort_score,
    least_squares_pressure_trend,
    linear_regression_slope,
    moon_next_phase_days,
    moon_phase_days,
    moon_phase_from_age,
    pressure_trend_arrow,
    pressure_trend_display,
    smooth_wind_direction,
    thunderstorm_risk_index,
    uv_burn_time_minutes,
    uv_level,
    uv_recommendation,
    wind_speed_to_beaufort,
    zambretti_forecast,
)
from .const import (
    ALERT_DEBOUNCE_OFF_TICKS,
    ALERT_DEBOUNCE_ON_TICKS,
    CONF_ALTITUDE_UNIT,
    CONF_AQI_INTERVAL_MIN,
    CONF_AWEKAS_INTERVAL_MIN,
    CONF_AWEKAS_PASSWORD,
    CONF_AWEKAS_USERNAME,
    CONF_CDD_BASE_C,
    CONF_CHILL_HOUR_BASE_C,
    CONF_CHILL_SEASON_RESET_DAY,
    CONF_CHILL_SEASON_RESET_MONTH,
    CONF_CLIMATE_REGION,
    CONF_CWOP_CALLSIGN,
    CONF_CWOP_INTERVAL_MIN,
    CONF_CWOP_PASSCODE,
    CONF_CWOP_PORT,
    CONF_CWOP_SERVER,
    CONF_DISTANCE_UNIT,
    CONF_ELEVATION_M,
    CONF_ENABLE_AIR_QUALITY,
    CONF_ENABLE_AUTO_CALIBRATION,
    CONF_ENABLE_AWEKAS,
    CONF_ENABLE_CLIMATE_NORMALS,
    CONF_ENABLE_COMFORT_INDICES,
    CONF_ENABLE_CWOP,
    CONF_ENABLE_DEGREE_DAYS,
    CONF_ENABLE_FIRE_RISK,
    # v0.6.0 new
    # v0.5.0 new
    CONF_ENABLE_FOG,
    CONF_ENABLE_INDOOR,
    CONF_ENABLE_LIGHTNING,
    CONF_ENABLE_MOON,
    CONF_ENABLE_MQTT,
    CONF_ENABLE_NOWCAST,
    CONF_ENABLE_OWM_STATIONS,
    CONF_ENABLE_POLLEN,
    CONF_ENABLE_PWSWEATHER,
    CONF_ENABLE_SEA_TEMP,
    CONF_ENABLE_SNOW,
    CONF_ENABLE_SOIL,
    CONF_ENABLE_SOLAR_FORECAST,
    CONF_ENABLE_THUNDERSTORM,
    CONF_ENABLE_VIGICRUES,
    CONF_ENABLE_VIGILANCE_METEO,
    CONF_ENABLE_WEATHERCLOUD,
    CONF_ENABLE_WINDY,
    CONF_ENABLE_WOW,
    CONF_ENABLE_WUNDERGROUND,
    CONF_FORECAST_API_KEY,
    CONF_FORECAST_ENABLED,
    CONF_FORECAST_ENTITY,
    CONF_FORECAST_INTERVAL_MIN,
    CONF_FORECAST_LAT,
    CONF_FORECAST_LON,
    CONF_FORECAST_PROVIDER,
    CONF_GDD_BASE_C,
    CONF_GDD_CAP_C_V2,
    CONF_HDD_BASE_C,
    CONF_HEMISPHERE,
    CONF_INDOOR_ROOMS,
    CONF_LIGHTNING_PROXIMITY_KM,
    CONF_MQTT_DISCOVERY_PREFIX,
    CONF_MQTT_INTERVAL_MIN,
    CONF_MQTT_STATE_PREFIX,
    CONF_NOWCAST_INTERVAL_MIN,
    CONF_OWM_STATIONS_API_KEY,
    CONF_OWM_STATIONS_INTERVAL_MIN,
    CONF_OWM_STATIONS_STATION_ID,
    # Tuning numbers (previously no-op, now wired)
    CONF_PRESSURE_TREND_WINDOW_H,
    CONF_PRESSURE_UNIT,
    CONF_PWS_API_KEY,
    CONF_PWS_INTERVAL_MIN,
    CONF_PWS_STATION_ID,
    CONF_RAIN_FILTER_ALPHA,
    CONF_RAIN_UNIT,
    CONF_SEA_TEMP_LAT,
    CONF_SEA_TEMP_LON,
    CONF_SOLAR_INTERVAL_MIN,
    CONF_SOLAR_PANEL_AZIMUTH,
    CONF_SOLAR_PANEL_TILT,
    CONF_SOLAR_PEAK_KW,
    CONF_SOURCES,
    CONF_STALENESS_S,
    CONF_SUPPRESS_NOTIFICATIONS,
    CONF_THRESH_FREEZE_C,
    CONF_THRESH_HEAT_DAY_C,
    CONF_THRESH_RAIN_RATE_MMPH,
    CONF_THRESH_WIND_GUST_MS,
    CONF_UNITS_MODE,
    CONF_VIGICRUES_RIVER_NAME,
    CONF_VIGICRUES_STATION_CODE,
    CONF_VIGICRUES_STATION_NAME,
    CONF_VIGICRUES_STATIONS,
    CONF_WC_API_KEY,
    CONF_WC_INTERVAL_MIN,
    CONF_WC_STATION_ID,
    CONF_WIND_UNIT,
    CONF_WINDY_API_KEY,
    CONF_WINDY_INTERVAL_MIN,
    CONF_WINDY_STATION_ID,
    CONF_WOW_AUTH_KEY,
    CONF_WOW_INTERVAL_MIN,
    CONF_WOW_SITE_ID,
    CONF_WU_API_KEY,
    CONF_WU_INTERVAL_MIN,
    CONF_WU_STATION_ID,
    DEFAULT_ALTITUDE_UNIT,
    DEFAULT_AQI_INTERVAL_MIN,
    DEFAULT_AWEKAS_INTERVAL_MIN,
    DEFAULT_CDD_BASE_C,
    DEFAULT_CHILL_HOUR_BASE_C,
    DEFAULT_CHILL_SEASON_RESET_DAY,
    DEFAULT_CHILL_SEASON_RESET_MONTH,
    DEFAULT_CLIMATE_REGION,
    DEFAULT_CWOP_INTERVAL_MIN,
    DEFAULT_CWOP_PORT,
    DEFAULT_CWOP_SERVER,
    DEFAULT_DISTANCE_UNIT,
    DEFAULT_ENABLE_AIR_QUALITY,
    DEFAULT_ENABLE_AUTO_CALIBRATION,
    DEFAULT_ENABLE_AWEKAS,
    DEFAULT_ENABLE_CLIMATE_NORMALS,
    DEFAULT_ENABLE_COMFORT_INDICES,
    DEFAULT_ENABLE_CWOP,
    DEFAULT_ENABLE_DEGREE_DAYS,
    DEFAULT_ENABLE_FIRE_RISK,
    DEFAULT_ENABLE_FOG,
    DEFAULT_ENABLE_INDOOR,
    DEFAULT_ENABLE_LIGHTNING,
    DEFAULT_ENABLE_MOON,
    DEFAULT_ENABLE_MQTT,
    DEFAULT_ENABLE_NOWCAST,
    DEFAULT_ENABLE_OWM_STATIONS,
    DEFAULT_ENABLE_POLLEN,
    DEFAULT_ENABLE_PWSWEATHER,
    DEFAULT_ENABLE_SNOW,
    DEFAULT_ENABLE_SOIL,
    DEFAULT_ENABLE_SOLAR_FORECAST,
    DEFAULT_ENABLE_THUNDERSTORM,
    DEFAULT_ENABLE_VIGICRUES,
    DEFAULT_ENABLE_VIGILANCE_METEO,
    DEFAULT_ENABLE_WEATHERCLOUD,
    DEFAULT_ENABLE_WINDY,
    DEFAULT_ENABLE_WOW,
    DEFAULT_ENABLE_WUNDERGROUND,
    DEFAULT_FORECAST_INTERVAL_MIN,
    DEFAULT_FORECAST_PROVIDER,
    DEFAULT_GDD_BASE_C,
    DEFAULT_GDD_CAP_C_V2,
    DEFAULT_HDD_BASE_C,
    DEFAULT_HEMISPHERE,
    DEFAULT_LIGHTNING_PROXIMITY_KM,
    DEFAULT_MQTT_DISCOVERY_PREFIX,
    DEFAULT_MQTT_INTERVAL_MIN,
    DEFAULT_MQTT_STATE_PREFIX,
    DEFAULT_NOWCAST_INTERVAL_MIN,
    DEFAULT_OWM_STATIONS_INTERVAL_MIN,
    DEFAULT_PRESSURE_TREND_WINDOW_H,
    DEFAULT_PRESSURE_UNIT,
    DEFAULT_PWS_INTERVAL_MIN,
    DEFAULT_RAIN_FILTER_ALPHA,
    DEFAULT_RAIN_UNIT,
    DEFAULT_SOLAR_INTERVAL_MIN,
    DEFAULT_SOLAR_PANEL_AZIMUTH,
    DEFAULT_SOLAR_PANEL_TILT,
    DEFAULT_SOLAR_PEAK_KW,
    DEFAULT_STALENESS_S,
    DEFAULT_SUPPRESS_NOTIFICATIONS,
    DEFAULT_THRESH_FREEZE_C,
    DEFAULT_THRESH_HEAT_DAY_C,
    DEFAULT_THRESH_RAIN_RATE_MMPH,
    DEFAULT_THRESH_WIND_GUST_MS,
    DEFAULT_WC_INTERVAL_MIN,
    DEFAULT_WIND_UNIT,
    DEFAULT_WINDY_INTERVAL_MIN,
    DEFAULT_WOW_INTERVAL_MIN,
    DEFAULT_WU_INTERVAL_MIN,
    DRIFT_R_SQ_THRESH,
    DRIFT_SLOPE_HUMIDITY_PCT_H,
    DRIFT_SLOPE_PRESSURE_HPA_H,
    DRIFT_SLOPE_TEMP_C_H,
    DRIFT_STUCK_BUCKET_MIN_RATE,
    DRIFT_STUCK_BUCKET_SAMPLES,
    DRIFT_STUCK_RATE_RANGE_MAX,
    FORECAST_AGREEMENT_ALIGNED_PP,
    FORECAST_AGREEMENT_CONFLICT_PP,
    FORECAST_MAX_RETRY_S,
    FORECAST_MIN_RETRY_S,
    FORECAST_PROVIDER_HA_ENTITY,
    # v1.5.0
    KEY_ABSOLUTE_HUMIDITY,
    KEY_AIR_DENSITY,
    KEY_ALERT_MESSAGE,
    KEY_ALERT_STATE,
    # v0.7.0
    KEY_AQI,
    KEY_AQI_LEVEL,
    KEY_AUTO_CAL_BIAS_HUMIDITY,
    KEY_AUTO_CAL_BIAS_PRESSURE_HPA,
    KEY_AUTO_CAL_BIAS_TEMP_C,
    KEY_AUTO_CAL_LAST_APPLIED,
    KEY_AUTO_CAL_N_SAMPLES,
    KEY_AUTO_CAL_STATUS,
    KEY_AWEKAS_STATUS,
    KEY_BATTERY_DISPLAY,
    KEY_BATTERY_PCT,
    KEY_CDD_SEASON,
    KEY_CDD_TODAY_MM,
    KEY_CHILL_HOURS_SEASON,
    KEY_CHILL_HOURS_TODAY,
    KEY_CLEARNESS_INDEX,
    KEY_CLIMATE_NORMALS_FETCHED,
    KEY_CLIMATE_NORMALS_YEARS,
    KEY_CLIMATOLOGY_30D,
    KEY_CLIMATOLOGY_90D,
    KEY_CLOUD_BASE_M,
    KEY_CLOUD_COVER_PCT,
    KEY_CONDITIONS_SUMMARY,
    KEY_CONSISTENCY_FLAGS,
    KEY_CURRENT_CONDITION,
    KEY_CWOP_STATUS_V2,
    KEY_DATA_QUALITY,
    KEY_DATA_QUALITY_SCORE,
    KEY_DELTA_T,
    KEY_DEW_POINT_C,
    KEY_DOMINANT_WIND_DIR,
    KEY_DRY_STREAK,
    KEY_DRY_STREAK_RECORD,
    KEY_ET0_DAILY_MM,
    KEY_ET0_HOURLY_MM,
    KEY_ET0_PM_DAILY_MM,
    KEY_FEELS_LIKE_C,
    KEY_FFDI,
    KEY_FFWI,
    KEY_FIRE_DANGER_VIGILANCE,
    KEY_FIRE_RISK_SCORE,
    KEY_FOG_PROBABILITY,
    KEY_FORECAST,
    KEY_FORECAST_AGREEMENT,
    KEY_FORECAST_BLEND_WEIGHT_LOCAL,
    KEY_FORECAST_BRIER_API,
    KEY_FORECAST_BRIER_LOCAL,
    KEY_FORECAST_PROVIDER,
    KEY_FORECAST_SKILL,
    KEY_FORECAST_TILES,
    KEY_FREEZING_LEVEL_M,
    KEY_FROST_POINT_C,
    KEY_FROST_RISK,
    KEY_FROST_STREAK,
    KEY_FROST_STREAK_RECORD,
    KEY_FWI,
    KEY_FWI_BUI,
    KEY_FWI_DC,
    KEY_FWI_DMC,
    KEY_FWI_DSR,
    KEY_FWI_FFMC,
    KEY_FWI_ISI,
    KEY_GDD_SEASON_V2,
    KEY_GDD_TODAY_V2,
    KEY_HDD_SEASON,
    KEY_HDD_TODAY_MM,
    KEY_HEALTH_DISPLAY,
    KEY_HEAT_INDEX,
    KEY_HEAT_STREAK,
    KEY_HEAT_STREAK_RECORD,
    KEY_HUMIDEX,
    KEY_HUMIDITY_LEVEL_DISPLAY,
    KEY_INDOOR_CO2_PPM,
    KEY_INDOOR_COMFORT,
    KEY_INDOOR_HUMIDITY,
    KEY_INDOOR_HUMIDITY_DELTA,
    KEY_INDOOR_ROOMS_DATA,
    KEY_INDOOR_TEMP_C,
    KEY_INDOOR_TEMP_DELTA,
    KEY_IRRIGATION_DEFICIT,
    KEY_IRRIGATION_NEED,
    KEY_IRRIGATION_NEED_SCORE,
    KEY_LEAF_WETNESS,
    KEY_LIGHTNING_AZIMUTH,
    KEY_LIGHTNING_CLEARANCE_MIN,
    KEY_LIGHTNING_COUNT_1H,
    KEY_LIGHTNING_DISTANCE_KM,
    KEY_LIGHTNING_PROXIMITY,
    KEY_LIGHTNING_RATE_1H,
    KEY_LUX,
    KEY_MAX_SOLAR_RADIATION,
    KEY_MINUTES_UNTIL_DRY,
    KEY_MINUTES_UNTIL_RAIN,
    KEY_MOON_AGE_DAYS,
    KEY_MOON_DISPLAY,
    KEY_MOON_ILLUMINATION_PCT,
    KEY_MOON_NEXT_FULL,
    KEY_MOON_NEXT_NEW,
    KEY_MOON_PHASE,
    KEY_NEIGHBOR_QC,
    KEY_NET_RADIATION,
    # v0.8.0
    KEY_NO2,
    KEY_NORM_HUMIDITY,
    KEY_NORM_PRESSURE_HPA,
    KEY_NORM_RAIN_TOTAL_MM,
    KEY_NORM_TEMP_C,
    KEY_NORM_WIND_DIR_DEG,
    KEY_NORM_WIND_GUST_MS,
    KEY_NORM_WIND_SPEED_MS,
    KEY_NOWCAST_CONFIDENCE,
    KEY_NOWCAST_INTENSITY,
    KEY_OWM_STATIONS_STATUS,
    KEY_OZONE,
    KEY_PACKAGE_OK,
    KEY_PACKAGE_STATUS,
    KEY_PEAK_SUN_HOURS,
    KEY_PM2_5,
    KEY_PM10,
    KEY_POLLEN_GRASS,
    KEY_POLLEN_OVERALL,
    KEY_POLLEN_TREE,
    KEY_POLLEN_WEED,
    KEY_PRESSURE_CHANGE_WINDOW_HPA,
    KEY_PRESSURE_TREND_DISPLAY,
    KEY_PRESSURE_TREND_HPAH,
    KEY_PWS_STATUS,
    KEY_RAIN_ACCUM_1H,
    KEY_RAIN_ACCUM_24H,
    KEY_RAIN_ANOMALY_30D,
    KEY_RAIN_ANOMALY_90D,
    KEY_RAIN_ANOMALY_NORMAL,
    KEY_RAIN_DISPLAY,
    KEY_RAIN_EXPECTED_1H,
    KEY_RAIN_NEXT_60MIN,
    KEY_RAIN_NORMAL_MM,
    KEY_RAIN_PROBABILITY,
    KEY_RAIN_PROBABILITY_COMBINED,
    KEY_RAIN_RATE_FILT,
    KEY_RAIN_RATE_MAX_24H,
    KEY_RAIN_THIS_MONTH_MM,
    KEY_RAIN_THIS_WEEK_MM,
    KEY_RAIN_THIS_YEAR_MM,
    KEY_RAIN_TODAY_MM,
    KEY_SEA_LEVEL_PRESSURE_HPA,
    KEY_SEA_SURFACE_TEMP,
    KEY_SENSOR_DRIFT_FLAGS,
    KEY_SENSOR_QUALITY_FLAGS,
    KEY_SENSOR_SPIKE,
    KEY_SENSOR_STUCK,
    KEY_SNOW_FALLING,
    KEY_SNOW_PHASE,
    KEY_SNOW_RATE_CM_H,
    KEY_SNOW_RECORD_DAY_CM,
    KEY_SNOW_THIS_MONTH_CM,
    KEY_SNOW_THIS_YEAR_CM,
    KEY_SNOW_TODAY_CM,
    KEY_SOIL_MOISTURE,
    KEY_SOIL_MOISTURE_DEFICIT,
    KEY_SOIL_TEMP_C,
    KEY_SOLAR_ENERGY_TODAY_WHM2,
    KEY_SOLAR_FORECAST_STATUS,
    # v0.9.0
    KEY_SOLAR_FORECAST_TODAY_KWH,
    KEY_SOLAR_FORECAST_TOMORROW_KWH,
    KEY_SOLAR_LUX_FACTOR,
    KEY_SPECIFIC_HUMIDITY,
    KEY_TEMP_ANOMALY_30D,
    KEY_TEMP_ANOMALY_90D,
    KEY_TEMP_ANOMALY_NORMAL,
    KEY_TEMP_AVG_24H,
    KEY_TEMP_DISPLAY,
    KEY_TEMP_HIGH_24H,
    KEY_TEMP_HIGH_ALL_TIME,
    KEY_TEMP_HIGH_MONTH,
    KEY_TEMP_HIGH_NORMAL,
    KEY_TEMP_HIGH_WEEK,
    KEY_TEMP_HIGH_YEAR,
    KEY_TEMP_LOW_24H,
    KEY_TEMP_LOW_ALL_TIME,
    KEY_TEMP_LOW_MONTH,
    KEY_TEMP_LOW_NORMAL,
    KEY_TEMP_LOW_WEEK,
    KEY_TEMP_LOW_YEAR,
    KEY_TEMP_MONTH_REF,
    KEY_TEMP_WEEK_REF,
    KEY_TEMP_YEAR_REF,
    KEY_THSW_INDEX,
    KEY_THUNDERSTORM_RISK,
    KEY_THW_INDEX,
    KEY_UTCI,
    KEY_UV,
    KEY_UV_LEVEL_DISPLAY,
    KEY_VIGILANCE_MAX_LEVEL,
    KEY_VPD,
    KEY_WBGT,
    KEY_WC_STATUS,
    KEY_WET_BULB_C,
    KEY_WIND_BEAUFORT,
    KEY_WIND_BEAUFORT_DESC,
    KEY_WIND_CHILL,
    KEY_WIND_DIR_SMOOTH_DEG,
    KEY_WIND_DIR_VARIABILITY,
    KEY_WIND_GUST_FACTOR,
    KEY_WIND_GUST_MAX_24H,
    KEY_WIND_GUST_MAX_ALL_TIME,
    KEY_WIND_GUST_MAX_MONTH,
    KEY_WIND_GUST_MAX_YEAR,
    KEY_WIND_GUST_MONTH_REF,
    KEY_WIND_GUST_YEAR_REF,
    KEY_WIND_QUADRANT,
    KEY_WIND_RUN_KM,
    KEY_WIND_RUN_MONTH_KM,
    KEY_WINDY_STATUS,
    KEY_WOW_STATUS,
    KEY_WU_STATUS,
    KEY_ZAMBRETTI_FORECAST,
    KEY_ZAMBRETTI_NUMBER,
    LEARNING_SAVE_INTERVAL_S,
    PRESSURE_HISTORY_INTERVAL_MIN,
    PRESSURE_HISTORY_SAMPLES,
    RAIN_RATE_PHYSICAL_CAP_MMPH,
    RAIN_RATE_WINDOW_H,
    REQUIRED_SOURCES,
    SPIKE_MIN_SAMPLES,
    SPIKE_SIGMA_THRESHOLD,
    SRC_BATTERY,
    SRC_DEW_POINT,
    SRC_GUST,
    SRC_HUM,
    SRC_INDOOR_CO2,
    SRC_INDOOR_HUMIDITY,
    SRC_INDOOR_TEMP,
    SRC_LIGHTNING_AZIMUTH,
    SRC_LIGHTNING_COUNT,
    SRC_LIGHTNING_DISTANCE,
    SRC_LUX,
    SRC_PRESS,
    SRC_RAIN_TOTAL,
    SRC_SOIL_MOISTURE,
    SRC_SOIL_TEMP,
    SRC_TEMP,
    SRC_UV,
    SRC_WIND,
    SRC_WIND_DIR,
    STALENESS_CHECK_SOURCES,
    VALID_HUMIDITY_MAX,
    VALID_HUMIDITY_MIN,
    VALID_PRESSURE_MAX_HPA,
    VALID_PRESSURE_MIN_HPA,
    VALID_TEMP_MAX_C,
    VALID_TEMP_MIN_C,
    WIND_SMOOTH_ALPHA,
    normalize_indoor_rooms,
)
from .models import WsData
from .providers import get_provider

try:
    from homeassistant.helpers import issue_registry as ir

    HAS_REPAIRS = True
except ImportError:
    HAS_REPAIRS = False

_LOGGER = logging.getLogger(__name__)

# Read the integration version without blocking the HA event loop.
# pathlib.read_text() is a synchronous I/O call; performing it at module-level
# triggers HA's "Detected blocking call" warning because the module is first
# imported inside async_setup_entry (i.e. within the event loop).  We therefore
# read the file once in a thread-safe, non-blocking way: read_bytes() on the
# manifest is tiny and fast, but we still use executor so the call is explicit.
# The value is cached in a module-level variable after the first read.
_INTEGRATION_VERSION: str = "unknown"


def _load_integration_version() -> str:
    """Return the version string from manifest.json (blocking, run via executor)."""
    try:
        return _json.loads((_pathlib.Path(__file__).parent / "manifest.json").read_bytes()).get("version", "unknown")
    except Exception:  # noqa: BLE001
        return "unknown"


# ---------------------------------------------------------------------------
# Runtime state
# ---------------------------------------------------------------------------


@dataclass
class WSStationRuntime:
    """Mutable runtime state that persists across compute cycles."""

    # Rain tracking
    last_rain_total_mm: float | None = None
    last_rain_ts: Any | None = None
    last_rain_rate_filt: float = 0.0
    last_rain_event_ts: Any | None = None

    # Pressure tracking
    pressure_history: deque = field(default_factory=lambda: deque(maxlen=PRESSURE_HISTORY_SAMPLES))
    pressure_history_ts: Any | None = None

    # Wind direction smoothing
    smoothed_wind_dir: float | None = None

    # Kalman filter for rain rate
    kalman: KalmanFilter = field(default_factory=KalmanFilter)

    # 24h rolling windows (timestamp-based)
    temp_history_24h: deque = field(default_factory=deque)
    gust_history_24h: deque = field(default_factory=deque)
    rain_total_history_24h: deque = field(default_factory=deque)

    # Forecast cache
    last_forecast_fetch: Any | None = None
    last_sea_temp_fetch: Any | None = None
    forecast_inflight: bool = False
    forecast_consecutive_failures: int = 0

    # MSLP cached for Zambretti
    last_mslp: float | None = None

    # Compute timing (for diagnostics)
    last_compute_ms: float = 0.0

    # v0.7.0 Air Quality / Pollen fetch tracking
    last_aqi_fetch: Any | None = None
    last_pollen_fetch: Any | None = None

    # v0.9.0 Solar forecast fetch tracking
    last_solar_fetch: Any | None = None


# ---------------------------------------------------------------------------
# Coordinator
# ---------------------------------------------------------------------------


class WSStationCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Keeps all derived values up to date."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry_data: dict[str, Any],
        entry_options: dict[str, Any] | None = None,
    ):
        self.hass = hass
        self.entry_data = entry_data
        # entry_options is deliberately pre-merged (data as base, options
        # overriding) rather than left as a bare copy of entry.options. The
        # *initial* config flow writes every enable_* toggle into entry.data
        # only (entry.options starts as {} until the user opens Configure and
        # saves once - see OptionsFlow.async_create_entry), so a bare
        # `entry_options or {}` here meant every per-cycle gate that reads
        # `self.entry_options.get(CONF_ENABLE_X, DEFAULT)` directly (e.g.
        # _compute_soil, _maybe_update_auto_calibration, the calibration/
        # threshold reads below) silently fell back to DEFAULT (usually off)
        # on a freshly created entry, even for a feature the user enabled in
        # the wizard - until Configure was opened once. sensor.py's
        # async_setup_entry already merges `{**entry.data, **entry.options}`
        # for entity creation, so entities existed but sat unavailable. This
        # merge makes self.entry_options behave the same way everywhere,
        # matching the _get() closure below (which already did this merge
        # manually, just not for direct self.entry_options.get(...) callers).
        self.entry_options: dict[str, Any] = {**entry_data, **(entry_options or {})}
        self.runtime = WSStationRuntime()

        self.sources: dict[str, str] = dict((entry_options or {}).get(CONF_SOURCES) or entry_data.get(CONF_SOURCES, {}))

        def _get(key: str, default: Any) -> Any:
            return self.entry_options.get(key, entry_data.get(key, default))

        self.units_mode = str(_get(CONF_UNITS_MODE, "auto"))
        self._wind_unit_conf = str(_get(CONF_WIND_UNIT, DEFAULT_WIND_UNIT))
        self._pressure_unit_conf = str(_get(CONF_PRESSURE_UNIT, DEFAULT_PRESSURE_UNIT))
        self._rain_unit_conf = str(_get(CONF_RAIN_UNIT, DEFAULT_RAIN_UNIT))
        self._distance_unit_conf = str(_get(CONF_DISTANCE_UNIT, DEFAULT_DISTANCE_UNIT))
        self._altitude_unit_conf = str(_get(CONF_ALTITUDE_UNIT, DEFAULT_ALTITUDE_UNIT))
        self.elevation_m = float(_get(CONF_ELEVATION_M, 0.0))
        self.hemisphere = str(_get(CONF_HEMISPHERE, DEFAULT_HEMISPHERE))
        self.climate_region = str(_get(CONF_CLIMATE_REGION, DEFAULT_CLIMATE_REGION))
        self.staleness_s = int(_get(CONF_STALENESS_S, DEFAULT_STALENESS_S))
        self.forecast_enabled = bool(_get(CONF_FORECAST_ENABLED, True))
        self.forecast_lat = _get(CONF_FORECAST_LAT, None)
        self.forecast_lon = _get(CONF_FORECAST_LON, None)
        self.forecast_interval_min = int(_get(CONF_FORECAST_INTERVAL_MIN, DEFAULT_FORECAST_INTERVAL_MIN))

        # Sea surface temperature (Open-Meteo Marine API)
        self.sea_temp_enabled = bool(_get(CONF_ENABLE_SEA_TEMP, False))
        self.sea_temp_lat = _get(CONF_SEA_TEMP_LAT, None)
        self.sea_temp_lon = _get(CONF_SEA_TEMP_LON, None)
        self._sea_temp_cache: dict[str, Any] | None = None

        # v2.0: additional upload targets
        self.weathercloud_enabled = bool(_get(CONF_ENABLE_WEATHERCLOUD, DEFAULT_ENABLE_WEATHERCLOUD))
        self.wc_station_id: str = str(_get(CONF_WC_STATION_ID, "") or "")
        self.wc_api_key: str = str(_get(CONF_WC_API_KEY, "") or "")
        self.wc_interval_min = int(_get(CONF_WC_INTERVAL_MIN, DEFAULT_WC_INTERVAL_MIN))
        self._wc_last_upload: Any = None
        self._wc_status: str = "disabled"

        self.pwsweather_enabled = bool(_get(CONF_ENABLE_PWSWEATHER, DEFAULT_ENABLE_PWSWEATHER))
        self.pws_station_id: str = str(_get(CONF_PWS_STATION_ID, "") or "")
        self.pws_api_key: str = str(_get(CONF_PWS_API_KEY, "") or "")
        self.pws_interval_min = int(_get(CONF_PWS_INTERVAL_MIN, DEFAULT_PWS_INTERVAL_MIN))
        self._pws_last_upload: Any = None
        self._pws_status: str = "disabled"

        self.wow_enabled = bool(_get(CONF_ENABLE_WOW, DEFAULT_ENABLE_WOW))
        self.wow_site_id: str = str(_get(CONF_WOW_SITE_ID, "") or "")
        self.wow_auth_key: str = str(_get(CONF_WOW_AUTH_KEY, "") or "")
        self.wow_interval_min = int(_get(CONF_WOW_INTERVAL_MIN, DEFAULT_WOW_INTERVAL_MIN))
        self._wow_last_upload: Any = None
        self._wow_status: str = "disabled"

        self.awekas_enabled = bool(_get(CONF_ENABLE_AWEKAS, DEFAULT_ENABLE_AWEKAS))
        self.awekas_username: str = str(_get(CONF_AWEKAS_USERNAME, "") or "")
        self.awekas_password: str = str(_get(CONF_AWEKAS_PASSWORD, "") or "")
        self.awekas_interval_min = int(_get(CONF_AWEKAS_INTERVAL_MIN, DEFAULT_AWEKAS_INTERVAL_MIN))
        self._awekas_last_upload: Any = None
        self._awekas_status: str = "disabled"

        # v2.0: OpenWeatherMap Stations API upload
        self.owm_stations_enabled = bool(_get(CONF_ENABLE_OWM_STATIONS, DEFAULT_ENABLE_OWM_STATIONS))
        self.owm_stations_api_key: str = str(_get(CONF_OWM_STATIONS_API_KEY, "") or "")
        self.owm_stations_station_id: str = str(_get(CONF_OWM_STATIONS_STATION_ID, "") or "")
        self.owm_stations_interval_min = int(_get(CONF_OWM_STATIONS_INTERVAL_MIN, DEFAULT_OWM_STATIONS_INTERVAL_MIN))
        self._owm_stations_last_upload: Any = None
        self._owm_stations_status: str = "disabled"

        # v2.0: Windy.com upload
        self.windy_enabled = bool(_get(CONF_ENABLE_WINDY, DEFAULT_ENABLE_WINDY))
        self.windy_api_key: str = str(_get(CONF_WINDY_API_KEY, "") or "")
        self.windy_station_id: str = str(_get(CONF_WINDY_STATION_ID, "") or "")
        self.windy_interval_min = int(_get(CONF_WINDY_INTERVAL_MIN, DEFAULT_WINDY_INTERVAL_MIN))
        self._windy_last_upload: Any = None
        self._windy_status: str = "disabled"

        # v2.0: monthly wind run accumulator + spike-detection history
        self._wind_run_month_km: float = 0.0
        self._wind_run_month_key: str = ""
        self._spike_history: dict[str, deque] = {
            "temp": deque(maxlen=48),
            "humidity": deque(maxlen=48),
            "pressure": deque(maxlen=48),
        }

        # v2.0: CWOP upload
        self.cwop_enabled = bool(_get(CONF_ENABLE_CWOP, DEFAULT_ENABLE_CWOP))
        self.cwop_callsign: str = str(_get(CONF_CWOP_CALLSIGN, "") or "").upper().strip()
        self.cwop_passcode: str = str(_get(CONF_CWOP_PASSCODE, "-1") or "-1").strip()
        self.cwop_server: str = str(_get(CONF_CWOP_SERVER, DEFAULT_CWOP_SERVER)).strip()
        self.cwop_port: int = int(_get(CONF_CWOP_PORT, DEFAULT_CWOP_PORT))
        self.cwop_interval_min = int(_get(CONF_CWOP_INTERVAL_MIN, DEFAULT_CWOP_INTERVAL_MIN))
        self._cwop_last_upload: Any = None
        self._cwop_status: str = "disabled"

        # v2.0: MQTT Discovery republishing
        self.mqtt_enabled = bool(_get(CONF_ENABLE_MQTT, DEFAULT_ENABLE_MQTT))
        self._mqtt_discovery_prefix: str = str(_get(CONF_MQTT_DISCOVERY_PREFIX, DEFAULT_MQTT_DISCOVERY_PREFIX))
        self._mqtt_state_prefix: str = str(_get(CONF_MQTT_STATE_PREFIX, DEFAULT_MQTT_STATE_PREFIX))
        self._mqtt_interval_min = int(_get(CONF_MQTT_INTERVAL_MIN, DEFAULT_MQTT_INTERVAL_MIN))
        self._mqtt_discovery_published: bool = False

        # v2.0: indoor sensor group
        self.indoor_enabled = bool(_get(CONF_ENABLE_INDOOR, DEFAULT_ENABLE_INDOOR))
        # Previous indoor readings for stuck-value detection
        self._indoor_temp_prev: float | None = None
        self._indoor_hum_prev: float | None = None
        # Named indoor rooms (v2.6.0). Normalized to the room-dict shape so the
        # coordinator tolerates both legacy list[str] and the new model even
        # before async_migrate_entry has run.
        self._indoor_rooms: list[dict] = normalize_indoor_rooms(_get(CONF_INDOOR_ROOMS, []))

        # v2.0: lightning sensor integration
        self.lightning_enabled = bool(_get(CONF_ENABLE_LIGHTNING, DEFAULT_ENABLE_LIGHTNING))
        self._lightning_proximity_km = float(_get(CONF_LIGHTNING_PROXIMITY_KM, DEFAULT_LIGHTNING_PROXIMITY_KM))
        # Rolling 1h lightning strike count history [(ts, cumulative_count)]
        self._lightning_count_history_1h: deque = deque()
        self._lightning_last_count: float | None = None
        self._lightning_last_strike_ts: Any = None  # timestamp of last detected increase
        # Entities from the Blitzortung HA integration, used as fallback when no physical sensor is mapped
        self._blitzortung_sources: dict[str, str] = {}
        if self.lightning_enabled:
            self._discover_blitzortung()

        # v2.0: degree days restored with improved implementation
        self.degree_days_enabled = bool(_get(CONF_ENABLE_DEGREE_DAYS, DEFAULT_ENABLE_DEGREE_DAYS))
        self._hdd_base_c = float(_get(CONF_HDD_BASE_C, DEFAULT_HDD_BASE_C))
        self._cdd_base_c = float(_get(CONF_CDD_BASE_C, DEFAULT_CDD_BASE_C))
        self._gdd_base_c = float(_get(CONF_GDD_BASE_C, DEFAULT_GDD_BASE_C))
        self._gdd_cap_c = float(_get(CONF_GDD_CAP_C_V2, DEFAULT_GDD_CAP_C_V2))

        # HDD/CDD accumulators: today (rolling from sub-daily samples) + season
        self._hdd_today: float = 0.0
        self._hdd_today_date: str = ""
        self._hdd_today_samples: int = 0
        self._cdd_today: float = 0.0
        self._cdd_today_date: str = ""
        self._cdd_today_samples: int = 0
        # HDD/CDD season (Jul 1 for northern hemisphere heating season)
        self._hdd_season: float = 0.0
        self._hdd_season_key: str = ""  # "YYYY-Hs" heating-season year
        self._cdd_season: float = 0.0
        self._cdd_season_key: str = ""

        # GDD accumulator: single season with configurable reset
        self._gdd_today: float = 0.0
        self._gdd_today_date: str = ""
        self._gdd_season: float = 0.0
        self._gdd_season_key: str = ""

        # v0.3.0: Fire risk score (kept; opt-in via wizard)
        self.fire_risk_enabled = bool(_get(CONF_ENABLE_FIRE_RISK, DEFAULT_ENABLE_FIRE_RISK))

        # Rain today - resets at local midnight
        self._rain_today_mm: float = 0.0
        self._rain_today_date: str = ""
        self._rain_today_last_total: float | None = None

        # v2.0 rain accumulators: weekly (Mon reset), monthly (1st reset), yearly
        self._rain_this_week_mm: float = 0.0
        self._rain_this_week_isoweek: str = ""  # "YYYY-Www"
        self._rain_this_week_last_total: float | None = None

        self._rain_this_month_mm: float = 0.0
        self._rain_this_month_key: str = ""  # "YYYY-MM"
        self._rain_this_month_last_total: float | None = None

        self._rain_this_year_mm: float = 0.0
        self._rain_this_year_key: str = ""  # "YYYY"
        self._rain_this_year_last_total: float | None = None

        # v2.7 - Snow (opt-in): estimated depth, integrated locally from the
        # liquid rain rate (not a cumulative-sensor delta like rain above,
        # since no snow gauge exists) so it never touches the rain accumulators.
        self.snow_enabled = bool(_get(CONF_ENABLE_SNOW, DEFAULT_ENABLE_SNOW))
        self._snow_last_calc_ts: Any = None
        self._snow_today_cm: float = 0.0
        self._snow_today_date: str = ""
        self._snow_this_month_cm: float = 0.0
        self._snow_this_month_key: str = ""  # "YYYY-MM"
        self._snow_this_year_cm: float = 0.0
        self._snow_this_year_key: str = ""  # "YYYY"
        self._snowiest_day_cm: float = 0.0  # all-time snowiest single day (issue #144)
        self._snowiest_day_date: str = ""  # "YYYY-MM-DD" of that record day

        # Yearly / all-time temperature extremes (issue #124). Yearly resets
        # when the current year no longer matches _temp_year_key; all-time
        # never resets automatically.
        self._temp_high_year: float | None = None
        self._temp_low_year: float | None = None
        self._temp_year_key: str = ""  # "YYYY"
        self._temp_high_all_time: float | None = None
        self._temp_low_all_time: float | None = None

        # Weekly / monthly temperature extremes (issue #127).
        self._temp_high_week: float | None = None
        self._temp_low_week: float | None = None
        self._temp_week_isoweek: str = ""  # "GGGG-Www"
        self._temp_high_month: float | None = None
        self._temp_low_month: float | None = None
        self._temp_month_key: str = ""  # "YYYY-MM"

        # Monthly / yearly / all-time wind gust max (issue #127).
        self._gust_max_month: float | None = None
        self._gust_month_key: str = ""  # "YYYY-MM"
        self._gust_max_year: float | None = None
        self._gust_year_key: str = ""  # "YYYY"
        self._gust_max_all_time: float | None = None

        # v2.0 max rain rate over rolling 24h window
        self._rain_rate_history_24h: deque = deque()
        # Completed (previous) day snapshot - captured at midnight rollover so
        # streak counters can evaluate the finished day's final rain total
        # rather than the freshly-reset current day (issue #15).
        self._rain_prev_day_mm: float = 0.0
        self._rain_prev_day_date: str = ""

        # --- Tuning parameters (wired from number entities) ---
        rain_filter_alpha = float(_get(CONF_RAIN_FILTER_ALPHA, DEFAULT_RAIN_FILTER_ALPHA))
        # Higher alpha = more smoothing → higher Kalman measurement_noise (less responsive to jumps)
        self.runtime.kalman = KalmanFilter(measurement_noise=float(rain_filter_alpha))

        pressure_trend_window_h = float(_get(CONF_PRESSURE_TREND_WINDOW_H, DEFAULT_PRESSURE_TREND_WINDOW_H))
        # Dynamic sample count: window(h) * 60 / interval(min), min 2, max 96
        self._pressure_history_samples = max(
            2, min(96, round(pressure_trend_window_h * 60 / PRESSURE_HISTORY_INTERVAL_MIN))
        )
        self.runtime.pressure_history = type(self.runtime.pressure_history)(maxlen=self._pressure_history_samples)

        # v0.3.0: removed METAR cross-validation, CWOP upload, CSV/JSON export

        # Weather Underground upload (kept disabled-by-default for v0.6 roadmap)
        self.wu_enabled = bool(_get(CONF_ENABLE_WUNDERGROUND, DEFAULT_ENABLE_WUNDERGROUND))
        self.wu_station_id: str = str(_get(CONF_WU_STATION_ID, "") or "")
        self.wu_api_key: str = str(_get(CONF_WU_API_KEY, "") or "")
        self.wu_interval_min = int(_get(CONF_WU_INTERVAL_MIN, DEFAULT_WU_INTERVAL_MIN))
        self._wu_last_upload: Any = None
        self._wu_status: str = "disabled"

        # Air Quality + Pollen (Open-Meteo Air Quality API, single fetch)
        self.aqi_enabled = bool(_get(CONF_ENABLE_AIR_QUALITY, DEFAULT_ENABLE_AIR_QUALITY))
        self.aqi_interval_min = int(_get(CONF_AQI_INTERVAL_MIN, DEFAULT_AQI_INTERVAL_MIN))
        self._aqi_cache: dict[str, Any] | None = None

        # Pollen (v0.3.0: now via Open-Meteo Air Quality API; piggybacks on AQI fetch)
        self.pollen_enabled = bool(_get(CONF_ENABLE_POLLEN, DEFAULT_ENABLE_POLLEN))
        self._pollen_cache: dict[str, Any] | None = None

        # v2.7 - Historical climate normals (day-of-year; Open-Meteo archive API)
        self.climate_normals_enabled = bool(_get(CONF_ENABLE_CLIMATE_NORMALS, DEFAULT_ENABLE_CLIMATE_NORMALS))
        self._climate_normals: dict[str, dict[str, Any]] = {}
        self._climate_normals_fetched_at: str = ""
        self._climate_normals_years: int = 0
        self._climate_normals_store: Any = None

        # Moon (calculated, no external API)
        self.moon_enabled = bool(_get(CONF_ENABLE_MOON, DEFAULT_ENABLE_MOON))

        # Solar forecast (forecast.solar, free)
        self.solar_forecast_enabled = bool(_get(CONF_ENABLE_SOLAR_FORECAST, DEFAULT_ENABLE_SOLAR_FORECAST))
        self.solar_peak_kw = float(_get(CONF_SOLAR_PEAK_KW, DEFAULT_SOLAR_PEAK_KW))
        self.solar_panel_azimuth = int(_get(CONF_SOLAR_PANEL_AZIMUTH, DEFAULT_SOLAR_PANEL_AZIMUTH))
        self.solar_panel_tilt = int(_get(CONF_SOLAR_PANEL_TILT, DEFAULT_SOLAR_PANEL_TILT))
        self.solar_interval_min = int(_get(CONF_SOLAR_INTERVAL_MIN, DEFAULT_SOLAR_INTERVAL_MIN))
        self._solar_cache: dict[str, Any] | None = None

        # Risk feature toggles (all default-off, opt-in via wizard)
        self.fog_enabled = bool(_get(CONF_ENABLE_FOG, DEFAULT_ENABLE_FOG))
        self.thunderstorm_enabled = bool(_get(CONF_ENABLE_THUNDERSTORM, DEFAULT_ENABLE_THUNDERSTORM))

        # v1.5.0 Comfort indices + agrometeorological sensors
        self.comfort_indices_enabled = bool(_get(CONF_ENABLE_COMFORT_INDICES, DEFAULT_ENABLE_COMFORT_INDICES))
        self._chill_hour_base_c = float(_get(CONF_CHILL_HOUR_BASE_C, DEFAULT_CHILL_HOUR_BASE_C))
        self._chill_season_reset_month = int(_get(CONF_CHILL_SEASON_RESET_MONTH, DEFAULT_CHILL_SEASON_RESET_MONTH))
        self._chill_season_reset_day = int(_get(CONF_CHILL_SEASON_RESET_DAY, DEFAULT_CHILL_SEASON_RESET_DAY))

        # v1.6.0 French regional sources
        self.vigilance_meteo_enabled = bool(_get(CONF_ENABLE_VIGILANCE_METEO, DEFAULT_ENABLE_VIGILANCE_METEO))
        self._vigilance_cache: dict[str, Any] | None = None

        self.vigicrues_enabled = bool(_get(CONF_ENABLE_VIGICRUES, DEFAULT_ENABLE_VIGICRUES))

        # v1.9.0: multi-station.  Load from CONF_VIGICRUES_STATIONS (list of
        # {code, name, river} dicts); fall back to legacy single-station keys.
        _new_stations: list[dict[str, str]] = list(_get(CONF_VIGICRUES_STATIONS, []) or [])
        if not _new_stations:
            _conf_code = (_get(CONF_VIGICRUES_STATION_CODE, "") or "").strip()
            if _conf_code:
                _new_stations = [
                    {
                        "code": _conf_code,
                        "name": (_get(CONF_VIGICRUES_STATION_NAME, "") or _conf_code),
                        "river": (_get(CONF_VIGICRUES_RIVER_NAME, "") or ""),
                    }
                ]
        # Each entry: {"code": str, "name": str, "river": str}
        # Empty list means auto-detect nearest station.
        self._vigicrues_stations: list[dict[str, str]] = _new_stations
        # Per-station caches keyed by station code (or "" for auto-detected)
        self._vigicrues_caches: dict[str, dict[str, Any]] = {}
        # For auto-detect mode, remember the discovered code across fetches
        self._vigicrues_auto_code: str | None = None
        self._vigicrues_auto_name: str | None = None
        self._vigicrues_auto_river: str | None = None

        # v1.7.0 Precipitation nowcast (Open-Meteo minutely_15, independent of provider)
        self.nowcast_enabled = bool(_get(CONF_ENABLE_NOWCAST, DEFAULT_ENABLE_NOWCAST))
        self.nowcast_interval_min = int(_get(CONF_NOWCAST_INTERVAL_MIN, DEFAULT_NOWCAST_INTERVAL_MIN))
        self._nowcast_cache: dict[str, Any] | None = None

        # v1.8.4 Suppress HA Repairs notifications (issue #20)
        self.suppress_notifications = bool(_get(CONF_SUPPRESS_NOTIFICATIONS, DEFAULT_SUPPRESS_NOTIFICATIONS))

        # Alert hysteresis: count consecutive ticks above/below threshold
        self._alert_debounce_raw: dict[str, int] = {}  # ticks above threshold
        self._alert_debounce_clear: dict[str, int] = {}  # ticks below threshold
        self._alert_active: dict[str, bool] = {}  # hysteresis state

        # Wind run accumulator - resets at local midnight (like rain_today)
        self._wind_run_km: float = 0.0
        self._wind_run_date: str = ""
        self._wind_run_last_ts: Any = None

        # v2.0 Solar energy accumulation (Wh/m²) - resets at midnight
        self._solar_energy_today_whm2: float = 0.0
        self._solar_energy_date: str = ""
        self._solar_energy_last_ts: Any = None

        # v2.0 Wind direction history for dominant direction + variability (24h)
        self._wind_dir_history_24h: deque = deque()

        # Chill hour accumulators
        self._chill_hours_today: float = 0.0
        self._chill_hours_today_date: str = ""
        self._chill_hours_season: float = 0.0
        self._chill_hours_season_date: str = ""  # date of last season-reset check
        self._chill_hours_last_ts: Any = None

        # Streak threshold (kept; was previously bundled with degree days)
        self.thresh_heat_day_c = float(_get(CONF_THRESH_HEAT_DAY_C, DEFAULT_THRESH_HEAT_DAY_C))

        # Persistent learning state (loaded async in async_start)
        from .learning_state import LearningState as _LS

        self._learning_state: Any = _LS()
        self._learning_store: Any = None
        self._learning_last_save: Any = None
        # v1.7.1: persist rolling-window history + daily accumulators so they
        # survive HA restarts/upgrades instead of resetting (issue #16)
        self._history_store: Any = None
        # v1.6.6: streak once-per-day guard now persisted in LearningState
        # (streak_last_counted_date); the old in-memory guard was lost on
        # restart, causing repeated increments within one day (issue #15).

        # v1.2.0 Drift detection buffers (timestamp, value) - 72-h in-memory
        self._drift_temp: deque = deque(maxlen=288)
        self._drift_humidity: deque = deque(maxlen=288)
        self._drift_pressure: deque = deque(maxlen=288)
        self._drift_rain_rate: deque = deque(maxlen=288)

        # v1.2.0 Forecast skill 6-h outcome window
        self._skill_window_start: Any = None
        self._skill_window_local_prob: float | None = None
        self._skill_window_api_prob: float | None = None
        self._skill_window_rain_seen: bool = False

        # v1.2.0 Lux / wind 1-h history for thunderstorm index
        self._lux_1h_ago: float | None = None
        self._lux_1h_ts: Any = None
        self._wind_ms_1h_ago: float | None = None
        self._wind_ms_1h_ts: Any = None

        # v1.2.0 Pressure-stuck detection
        self._pressure_stuck_start: Any = None
        self._pressure_stuck_ref: float | None = None

        # v1.2.0 Rain total/rate consistency tracking
        self._rain_total_for_consistency: float | None = None
        self._rain_total_ts_consistency: Any = None
        self._rain_rate_nonzero_since: Any = None

        super().__init__(
            hass,
            logger=_LOGGER,
            name="WS Station",
            update_interval=timedelta(seconds=60),
        )
        self._unsubs: list = []

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    @property
    def forecast_provider(self) -> str:
        """Forecast provider ID (default: open_meteo)."""
        opts = {**self.config_entry.data, **self.config_entry.options}
        return opts.get(CONF_FORECAST_PROVIDER, DEFAULT_FORECAST_PROVIDER)

    @property
    def forecast_api_key(self) -> str | None:
        """API key for forecast providers that require one."""
        opts = {**self.config_entry.data, **self.config_entry.options}
        return opts.get(CONF_FORECAST_API_KEY) or None

    @property
    def forecast_entity(self) -> str | None:
        """Entity ID of the HA weather.* entity used as forecast provider."""
        opts = {**self.config_entry.data, **self.config_entry.options}
        return opts.get(CONF_FORECAST_ENTITY) or None

    def _is_imperial(self) -> bool:
        m = (self.units_mode or "auto").lower()
        if m == "imperial":
            return True
        if m == "metric":
            return False
        try:
            return not self.hass.config.units.is_metric
        except Exception:
            return False

    def _resolve_unit(self, conf_val: str, metric_unit: str, imperial_unit: str) -> str:
        if conf_val != "auto":
            return conf_val
        return imperial_unit if self._is_imperial() else metric_unit

    @property
    def wind_unit(self) -> str:
        return self._resolve_unit(self._wind_unit_conf, "m/s", "mph")

    @property
    def pressure_unit(self) -> str:
        return self._resolve_unit(self._pressure_unit_conf, "hPa", "inHg")

    @property
    def rain_unit(self) -> str:
        return self._resolve_unit(self._rain_unit_conf, "mm", "in")

    @property
    def rain_rate_unit(self) -> str:
        return "in/h" if self.rain_unit == "in" else "mm/h"

    @property
    def distance_unit(self) -> str:
        return self._resolve_unit(self._distance_unit_conf, "km", "mi")

    @property
    def altitude_unit(self) -> str:
        return self._resolve_unit(self._altitude_unit_conf, "m", "ft")

    @property
    def snow_unit(self) -> str:
        """Snow depth follows the rain unit preference (mm/in) - no separate
        setting - since both are the same metric/imperial choice."""
        return "in" if self.rain_unit == "in" else "cm"

    @property
    def snow_rate_unit(self) -> str:
        return "in/h" if self.rain_unit == "in" else "cm/h"

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def async_start(self) -> None:
        # Resolve the integration version without blocking the event loop.
        global _INTEGRATION_VERSION
        if _INTEGRATION_VERSION == "unknown":
            _INTEGRATION_VERSION = await self.hass.async_add_executor_job(_load_integration_version)

        # Load persistent learning state from HA storage
        from homeassistant.helpers.storage import Store

        from .learning_state import async_load_learning

        entry_id = self.entry_data.get("entry_id") or id(self)
        # v0.3.0: bumped Store version to 2 to match LearningState schema_version.
        # Old v1 state files contain METAR bias/GDD fields; from_dict will discard them.
        self._learning_store = Store(self.hass, 2, f"ws_core_{entry_id}_learning")
        self._learning_state = await async_load_learning(self._learning_store)
        _LOGGER.debug(
            "ws_core learning state loaded (solar_factor_n=%s, dry_streak=%s)",
            self._learning_state.solar_factor_n,
            self._learning_state.dry_streak_days,
        )

        # v1.7.1: rehydrate rolling-window history + daily accumulators (issue #16)
        self._history_store = Store(self.hass, 1, f"ws_core_{entry_id}_history")
        try:
            hist = await self._history_store.async_load()
            if hist:
                self._restore_history_state(hist)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("ws_core: failed to restore history state (starting fresh): %s", err)

        # v2.7 - Climate normals table (its own store: infrequently written,
        # ~365 entries, kept separate from the frequently-saved learning blob)
        if self.climate_normals_enabled:
            self._climate_normals_store = Store(self.hass, 1, f"ws_core_{entry_id}_climate_normals")
            try:
                saved = await self._climate_normals_store.async_load()
                if saved:
                    self._climate_normals = saved.get("normals") or {}
                    self._climate_normals_fetched_at = saved.get("fetched_at") or ""
                    self._climate_normals_years = int(saved.get("years") or 0)
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("ws_core: failed to restore climate normals (starting fresh): %s", err)

        entity_ids = [eid for eid in self.sources.values() if eid]
        if entity_ids:
            self._unsubs.append(async_track_state_change_event(self.hass, entity_ids, self._handle_source_change))
        self._unsubs.append(async_track_time_interval(self.hass, self._handle_tick, timedelta(seconds=60)))

        # v0.3.0: removed METAR fetch, CWOP upload, CSV/JSON export schedulers.
        # v0.3.0: pollen no longer has its own scheduler - it piggybacks on
        # the Open-Meteo Air Quality fetch (same API, same call).

        # Weather Underground periodic upload (kept disabled-by-default for v0.6 roadmap)
        if self.wu_enabled and self.wu_station_id and self.wu_api_key:

            async def _wu_upload_loop() -> None:
                await asyncio.sleep(self.wu_interval_min * 60)
                while True:
                    await self._async_upload_wunderground()
                    await asyncio.sleep(self.wu_interval_min * 60)

            _wu_task = self.hass.async_create_background_task(_wu_upload_loop(), "ws_core_wu_upload")
            self._unsubs.append(_wu_task.cancel)

        # v2.0: Weathercloud upload
        if self.weathercloud_enabled and self.wc_station_id and self.wc_api_key:

            async def _wc_upload_loop() -> None:
                await asyncio.sleep(self.wc_interval_min * 60)
                while True:
                    await self._async_upload_weathercloud()
                    await asyncio.sleep(self.wc_interval_min * 60)

            _wc_task = self.hass.async_create_background_task(_wc_upload_loop(), "ws_core_wc_upload")
            self._unsubs.append(_wc_task.cancel)

        # v2.0: PWSWeather upload
        if self.pwsweather_enabled and self.pws_station_id and self.pws_api_key:

            async def _pws_upload_loop() -> None:
                await asyncio.sleep(self.pws_interval_min * 60)
                while True:
                    await self._async_upload_pwsweather()
                    await asyncio.sleep(self.pws_interval_min * 60)

            _pws_task = self.hass.async_create_background_task(_pws_upload_loop(), "ws_core_pws_upload")
            self._unsubs.append(_pws_task.cancel)

        # v2.0: WOW (UK Met Office) upload
        if self.wow_enabled and self.wow_site_id and self.wow_auth_key:

            async def _wow_upload_loop() -> None:
                await asyncio.sleep(self.wow_interval_min * 60)
                while True:
                    await self._async_upload_wow()
                    await asyncio.sleep(self.wow_interval_min * 60)

            _wow_task = self.hass.async_create_background_task(_wow_upload_loop(), "ws_core_wow_upload")
            self._unsubs.append(_wow_task.cancel)

        # v2.0: AWEKAS upload
        if self.awekas_enabled and self.awekas_username and self.awekas_password:

            async def _awekas_upload_loop() -> None:
                await asyncio.sleep(self.awekas_interval_min * 60)
                while True:
                    await self._async_upload_awekas()
                    await asyncio.sleep(self.awekas_interval_min * 60)

            _awekas_task = self.hass.async_create_background_task(_awekas_upload_loop(), "ws_core_awekas_upload")
            self._unsubs.append(_awekas_task.cancel)

        # v2.0: OpenWeatherMap Stations API upload
        if self.owm_stations_enabled and self.owm_stations_api_key and self.owm_stations_station_id:

            async def _owm_upload_loop() -> None:
                await asyncio.sleep(self.owm_stations_interval_min * 60)
                while True:
                    await self._async_upload_owm_stations()
                    await asyncio.sleep(self.owm_stations_interval_min * 60)

            _owm_task = self.hass.async_create_background_task(_owm_upload_loop(), "ws_core_owm_upload")
            self._unsubs.append(_owm_task.cancel)

        # v2.0: Windy.com upload
        if self.windy_enabled and self.windy_api_key:

            async def _windy_upload_loop() -> None:
                await asyncio.sleep(self.windy_interval_min * 60)
                while True:
                    await self._async_upload_windy()
                    await asyncio.sleep(self.windy_interval_min * 60)

            _windy_task = self.hass.async_create_background_task(_windy_upload_loop(), "ws_core_windy_upload")
            self._unsubs.append(_windy_task.cancel)

        # Air quality + pollen periodic fetch (Open-Meteo Air Quality API, single call)
        if (
            (self.aqi_enabled or self.pollen_enabled)
            and self.forecast_lat is not None
            and self.forecast_lon is not None
        ):

            async def _aqi_fetch_loop() -> None:
                await asyncio.sleep(self.aqi_interval_min * 60)
                while True:
                    await self._async_fetch_aqi()
                    await asyncio.sleep(self.aqi_interval_min * 60)

            _aqi_task = self.hass.async_create_background_task(_aqi_fetch_loop(), "ws_core_aqi_fetch")
            self._unsubs.append(_aqi_task.cancel)

            async def _deferred_aqi():
                await asyncio.sleep(10)
                try:
                    await self._async_fetch_aqi()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: deferred AQI fetch failed (will retry): %s", err)

            self.hass.async_create_task(_deferred_aqi())

        # Solar forecast periodic fetch
        if self.solar_forecast_enabled and self.forecast_lat is not None and self.forecast_lon is not None:

            async def _solar_fetch_loop() -> None:
                await asyncio.sleep(self.solar_interval_min * 60)
                while True:
                    await self._async_fetch_solar_forecast()
                    await asyncio.sleep(self.solar_interval_min * 60)

            _solar_task = self.hass.async_create_background_task(_solar_fetch_loop(), "ws_core_solar_fetch")
            self._unsubs.append(_solar_task.cancel)

            async def _deferred_solar():
                await asyncio.sleep(30)
                try:
                    await self._async_fetch_solar_forecast()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: deferred solar forecast fetch failed (will retry): %s", err)

            self.hass.async_create_task(_deferred_solar())

        # Météo Vigilance periodic fetch (every 30 min; alerts rarely change faster)
        if self.vigilance_meteo_enabled and self.forecast_lat is not None and self.forecast_lon is not None:

            async def _vigilance_fetch_loop() -> None:
                await asyncio.sleep(30 * 60)
                while True:
                    await self._async_fetch_vigilance()
                    await asyncio.sleep(30 * 60)

            _vigilance_task = self.hass.async_create_background_task(_vigilance_fetch_loop(), "ws_core_vigilance_fetch")
            self._unsubs.append(_vigilance_task.cancel)

            async def _deferred_vigilance():
                await asyncio.sleep(45)
                try:
                    await self._async_fetch_vigilance()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: deferred vigilance fetch failed (will retry): %s", err)

            self.hass.async_create_task(_deferred_vigilance())

        # Vigicrues periodic fetch (every 15 min; river levels update frequently)
        if self.vigicrues_enabled and self.forecast_lat is not None and self.forecast_lon is not None:

            async def _vigicrues_fetch_loop() -> None:
                await asyncio.sleep(15 * 60)
                while True:
                    await self._async_fetch_vigicrues()
                    await asyncio.sleep(15 * 60)

            _vigicrues_task = self.hass.async_create_background_task(_vigicrues_fetch_loop(), "ws_core_vigicrues_fetch")
            self._unsubs.append(_vigicrues_task.cancel)

            async def _deferred_vigicrues():
                await asyncio.sleep(60)
                try:
                    await self._async_fetch_vigicrues()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: deferred Vigicrues fetch failed (will retry): %s", err)

            self.hass.async_create_task(_deferred_vigicrues())

        # v1.7.0 Precipitation nowcast (Open-Meteo minutely_15; refresh often)
        if self.nowcast_enabled and self.forecast_lat is not None and self.forecast_lon is not None:

            async def _nowcast_fetch_loop() -> None:
                await asyncio.sleep(self.nowcast_interval_min * 60)
                while True:
                    await self._async_fetch_nowcast()
                    await asyncio.sleep(self.nowcast_interval_min * 60)

            _nowcast_task = self.hass.async_create_background_task(_nowcast_fetch_loop(), "ws_core_nowcast_fetch")
            self._unsubs.append(_nowcast_task.cancel)

            async def _deferred_nowcast():
                await asyncio.sleep(20)
                try:
                    await self._async_fetch_nowcast()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: deferred nowcast fetch failed (will retry): %s", err)

            self.hass.async_create_task(_deferred_nowcast())

        # v2.0: spatial neighbor QC (hourly fetch from Open-Meteo)
        self._neighbor_qc_cache: dict | None = None
        if self.forecast_lat is not None and self.forecast_lon is not None:

            async def _neighbor_qc_fetch_loop() -> None:
                await asyncio.sleep(60 * 60)
                while True:
                    await self._async_fetch_neighbor_qc()
                    await asyncio.sleep(60 * 60)

            _neighbor_qc_task = self.hass.async_create_background_task(
                _neighbor_qc_fetch_loop(), "ws_core_neighbor_qc_fetch"
            )
            self._unsubs.append(_neighbor_qc_task.cancel)

            async def _deferred_neighbor_qc():
                await asyncio.sleep(60)
                try:
                    await self._async_fetch_neighbor_qc()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.debug("ws_core: neighbor QC fetch failed: %s", err)

            self.hass.async_create_task(_deferred_neighbor_qc())

        # v2.7 - Climate normals: fetch/refresh once, then check daily whether
        # it's stale (CLIMATE_NORMALS_REFRESH_DAYS) rather than a fixed-interval
        # re-fetch - normals barely change, so there's no value in polling hourly.
        if self.climate_normals_enabled and self.forecast_lat is not None and self.forecast_lon is not None:

            async def _climate_normals_loop() -> None:
                await asyncio.sleep(120)  # let the first regular update land first
                while True:
                    await self._async_maybe_refresh_climate_normals()
                    await asyncio.sleep(24 * 60 * 60)

            _climate_normals_task = self.hass.async_create_background_task(
                _climate_normals_loop(), "ws_core_climate_normals_fetch"
            )
            self._unsubs.append(_climate_normals_task.cancel)

        # v2.0: CWOP upload
        if self.cwop_enabled and self.cwop_callsign:

            async def _cwop_upload_loop() -> None:
                await asyncio.sleep(self.cwop_interval_min * 60)
                while True:
                    await self._async_upload_cwop()
                    await asyncio.sleep(self.cwop_interval_min * 60)

            _cwop_task = self.hass.async_create_background_task(_cwop_upload_loop(), "ws_core_cwop_upload")
            self._unsubs.append(_cwop_task.cancel)

        # v2.0: MQTT Discovery periodic state publishing
        if self.mqtt_enabled:

            async def _mqtt_publish_loop() -> None:
                await asyncio.sleep(self._mqtt_interval_min * 60)
                while True:
                    await self._async_mqtt_publish()
                    await asyncio.sleep(self._mqtt_interval_min * 60)

            _mqtt_task = self.hass.async_create_background_task(_mqtt_publish_loop(), "ws_core_mqtt_publish")
            self._unsubs.append(_mqtt_task.cancel)

            async def _deferred_mqtt_discovery():
                await asyncio.sleep(15)
                try:
                    await self._async_mqtt_discovery()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: MQTT discovery publish failed: %s", err)

            self.hass.async_create_task(_deferred_mqtt_discovery())

        # Defer first refresh by 5s so config entry creation completes before any network calls.
        async def _deferred_refresh():
            await asyncio.sleep(5)
            try:
                await self.async_refresh()
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("ws_core: deferred first refresh failed (will retry on next tick): %s", err)

        self.hass.async_create_task(_deferred_refresh())

    async def async_stop(self) -> None:
        for u in self._unsubs:
            with contextlib.suppress(Exception):
                u()
        self._unsubs.clear()
        # Persist learning state one last time on clean shutdown
        if self._learning_store is not None:
            from .learning_state import async_save_learning

            await async_save_learning(self._learning_store, self._learning_state)
        # v1.7.1: persist rolling-window history + accumulators (issue #16).
        # Clean restarts/upgrades go through here, so the windows survive.
        if self._history_store is not None:
            with contextlib.suppress(Exception):
                await self._history_store.async_save(self._dump_history_state())
        # v2.0: remove MQTT Discovery entries on clean shutdown
        if self.mqtt_enabled and self._mqtt_discovery_published:
            from .mqtt_publisher import async_unpublish_discovery

            with contextlib.suppress(Exception):
                await async_unpublish_discovery(
                    self.hass,
                    self._mqtt_discovery_prefix,
                    self.entry_options.get("prefix", "ws"),
                )

    @callback
    def _handle_source_change(self, event) -> None:
        self.async_set_updated_data(self._compute())

    @callback
    def _handle_tick(self, _now) -> None:
        self.async_set_updated_data(self._compute())

    async def _async_update_data(self) -> dict[str, Any]:
        return self._compute()

    # ------------------------------------------------------------------
    # Rolling window helpers (24h timestamp-based)
    # ------------------------------------------------------------------

    @staticmethod
    def _append_and_prune_24h(history: deque, now: Any, value: float) -> None:
        history.append((now, value))
        cutoff = now - timedelta(hours=24)
        while history and history[0][0] < cutoff:
            history.popleft()

    @staticmethod
    def _rolling_values(history: deque) -> list[float]:
        return [v for _, v in history]

    @staticmethod
    def _mean_window(history: deque, now: Any, hours: float, min_samples: int = 1) -> float | None:
        """Mean of ``(ts, value)`` samples within the last ``hours``.

        Returns ``None`` when fewer than ``min_samples`` samples fall inside the
        window, so callers can fall back to an instantaneous value instead of a
        misleading average built from too little history.
        """
        cutoff = now - timedelta(hours=hours)
        vals = [v for ts, v in history if ts >= cutoff]
        if len(vals) < min_samples:
            return None
        return sum(vals) / len(vals)

    @staticmethod
    def _rain_accum_24h_from_totals(history: deque) -> float:
        vals = [v for _, v in history]
        total = 0.0
        for prev, cur in zip(vals, vals[1:], strict=False):
            dv = cur - prev
            if dv < -0.1:
                dv = 0.0
            if dv > 0:
                total += dv
        return total

    @staticmethod
    def _rain_accum_window_from_totals(history: deque, now: Any, window_h: float) -> float:
        """Rain accumulation over a sliding window (e.g. 1h)."""
        from datetime import timedelta

        cutoff = now - timedelta(hours=window_h)
        vals = [(ts, v) for ts, v in history if ts >= cutoff]
        total = 0.0
        for (_, prev), (_, cur) in zip(vals, vals[1:], strict=False):
            dv = cur - prev
            if dv < -0.1:
                dv = 0.0
            if dv > 0:
                total += dv
        return total

    @staticmethod
    def _rain_rate_from_totals_window(history: deque, now: Any, window_h: float) -> float:
        """Rain rate (mm/h) averaged over a short sliding window.

        Using the delta since only the *previous* poll cycle makes the rate
        track individual bucket-tip increments: when the rain-total source
        only updates in discrete steps, a tip that lands inside one ~60s poll
        produces a brief huge spike that decays back to zero before the next
        tip, i.e. a sawtooth (issue #132). Averaging accumulation over the
        last ``window_h`` hours instead smooths that out.

        The window naturally shrinks to however much history is actually
        available (e.g. right after startup or right as rain begins), so
        this doesn't under-report the rate before a full window has
        accumulated.
        """
        from datetime import timedelta

        cutoff = now - timedelta(hours=window_h)
        vals = [(ts, v) for ts, v in history if ts >= cutoff]
        if len(vals) < 2:
            return 0.0
        accum = 0.0
        for (_, prev), (_, cur) in zip(vals, vals[1:], strict=False):
            dv = cur - prev
            if dv < -0.1:
                dv = 0.0
            if dv > 0:
                accum += dv
        span_h = (vals[-1][0] - vals[0][0]).total_seconds() / 3600.0
        if span_h <= 1e-6:
            return 0.0
        return accum / span_h

    # ------------------------------------------------------------------
    # Unit conversion helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _uom(hass: HomeAssistant, eid: str | None) -> str:
        if not eid:
            return ""
        st = hass.states.get(eid)
        return str(st.attributes.get("unit_of_measurement") or "") if st else ""

    @staticmethod
    def _num(hass: HomeAssistant, eid: str | None) -> float | None:
        if not eid:
            return None
        st = hass.states.get(eid)
        if st is None:
            return None
        try:
            v = float(st.state)
        except (ValueError, TypeError):
            return None
        if math.isnan(v) or math.isinf(v):
            return None
        return v

    @staticmethod
    def _to_celsius(v: float, unit: str) -> float:
        u = unit.lower().replace(" ", "")
        if u in ("f", "\u00b0f") or ("f" in u and "\u00b0" in u):
            return (v - 32.0) * 5.0 / 9.0
        if u in ("k", "kelvin"):
            return v - 273.15
        return v

    @staticmethod
    def _to_ms(v: float, unit: str) -> float:
        u = unit.lower().replace(" ", "")
        if u in ("km/h", "kmh", "kph"):
            return v / 3.6
        if u == "mph":
            return v * 0.44704
        if u in ("kn", "knot", "knots"):
            return v * 0.514444
        return v

    @staticmethod
    def _to_hpa(v: float, unit: str) -> float:
        u = unit.lower().replace(" ", "")
        if u == "pa":
            return v / 100.0
        if u == "inhg":
            return v * 33.8638866667
        if u in ("mmhg", "torr"):
            return v * 1.33322
        return v

    @staticmethod
    def _to_mm(v: float, unit: str) -> float:
        u = unit.lower().replace(" ", "")
        if u in ("in", "inch", "inches"):
            return v * 25.4
        return v

    # ------------------------------------------------------------------
    # Sensor quality / physics validation
    # ------------------------------------------------------------------

    @staticmethod
    def _validate_readings(
        tc: float | None,
        rh: float | None,
        pressure_hpa: float | None,
        wind_ms: float | None,
        gust_ms: float | None,
        dew_c: float | None,
    ) -> list[str]:
        flags: list[str] = []
        if tc is not None and not (VALID_TEMP_MIN_C <= tc <= VALID_TEMP_MAX_C):
            flags.append(f"temperature {tc:.1f}\u00b0C outside physical range")
        if rh is not None and not (VALID_HUMIDITY_MIN <= rh <= VALID_HUMIDITY_MAX):
            flags.append(f"humidity {rh:.0f}% outside valid range")
        if pressure_hpa is not None and not (VALID_PRESSURE_MIN_HPA <= pressure_hpa <= VALID_PRESSURE_MAX_HPA):
            flags.append(f"pressure {pressure_hpa:.1f} hPa outside physical range")
        if tc is not None and dew_c is not None and dew_c > tc + 0.5:
            flags.append("dew point exceeds temperature (check humidity sensor)")
        if wind_ms is not None and gust_ms is not None and gust_ms < wind_ms * 0.9:
            flags.append("wind gust below wind speed (check anemometer)")
        return flags

    # ------------------------------------------------------------------
    # Sub-methods
    # ------------------------------------------------------------------

    def _compute_raw_readings(self, data: dict, now: Any) -> tuple[float | None, ...]:
        """Read and unit-convert all source sensors."""
        hass = self.hass

        def num(key: str) -> float | None:
            return self._num(hass, self.sources.get(key))

        def uom(key: str) -> str:
            return self._uom(hass, self.sources.get(key))

        t_raw = num(SRC_TEMP)
        tc = round(self._to_celsius(t_raw, uom(SRC_TEMP)), 2) if t_raw is not None else None
        if tc is not None:
            tc = round(tc + float(self.entry_options.get("cal_temp_c", 0.0)), 2)
            data[KEY_NORM_TEMP_C] = tc

        h_raw = num(SRC_HUM)
        rh = round(h_raw, 2) if h_raw is not None else None
        if rh is not None:
            rh = round(max(0.0, min(100.0, rh + float(self.entry_options.get("cal_humidity", 0.0)))), 2)
            data[KEY_NORM_HUMIDITY] = rh

        p_raw = num(SRC_PRESS)
        pressure_hpa = round(self._to_hpa(p_raw, uom(SRC_PRESS)), 2) if p_raw is not None else None
        if pressure_hpa is not None:
            pressure_hpa = round(pressure_hpa + float(self.entry_options.get("cal_pressure_hpa", 0.0)), 2)
            data[KEY_NORM_PRESSURE_HPA] = pressure_hpa

        ws_raw = num(SRC_WIND)
        wind_ms = round(self._to_ms(ws_raw, uom(SRC_WIND)), 2) if ws_raw is not None else None
        if wind_ms is not None:
            wind_ms = round(max(0.0, wind_ms + float(self.entry_options.get("cal_wind_ms", 0.0))), 2)
            data[KEY_NORM_WIND_SPEED_MS] = wind_ms

        wg_raw = num(SRC_GUST)
        gust_ms = round(self._to_ms(wg_raw, uom(SRC_GUST)), 2) if wg_raw is not None else None
        if gust_ms is not None:
            data[KEY_NORM_WIND_GUST_MS] = gust_ms

        wd_raw = num(SRC_WIND_DIR)
        wind_dir = round(float(wd_raw), 2) if wd_raw is not None else None
        if wind_dir is not None:
            data[KEY_NORM_WIND_DIR_DEG] = wind_dir

        rtot_raw = num(SRC_RAIN_TOTAL)
        rain_total_mm = round(self._to_mm(rtot_raw, uom(SRC_RAIN_TOTAL)), 2) if rtot_raw is not None else None
        if rain_total_mm is not None:
            data[KEY_NORM_RAIN_TOTAL_MM] = rain_total_mm

        lux_raw = num(SRC_LUX)
        lux = round(lux_raw, 2) if lux_raw is not None else None
        if lux is not None:
            data[KEY_LUX] = lux

        uv_raw = num(SRC_UV)
        uv = round(uv_raw, 2) if uv_raw is not None else None
        if uv is not None:
            data[KEY_UV] = uv

        bat_raw = num(SRC_BATTERY)
        if bat_raw is not None:
            data[KEY_BATTERY_PCT] = round(bat_raw)
            data[KEY_BATTERY_DISPLAY] = f"{int(bat_raw)}%"

        # Optional: external dew point sensor
        dp_ext = num(SRC_DEW_POINT)
        if dp_ext is not None:
            dp_c = round(self._to_celsius(dp_ext, self._uom(hass, self.sources.get(SRC_DEW_POINT))), 2)
            data[KEY_DEW_POINT_C] = dp_c

        # Optional: soil moisture sensor (normalize 0-1 volumetric to 0-100%)
        soil_m_raw = num(SRC_SOIL_MOISTURE)
        if soil_m_raw is not None:
            soil_pct = float(soil_m_raw) if float(soil_m_raw) > 1.0 else float(soil_m_raw) * 100.0
            data[KEY_SOIL_MOISTURE] = round(soil_pct, 2)

        # Optional: soil temperature sensor (unit-detected conversion to °C)
        soil_t_raw = num(SRC_SOIL_TEMP)
        if soil_t_raw is not None:
            soil_tc = round(self._to_celsius(float(soil_t_raw), self._uom(hass, self.sources.get(SRC_SOIL_TEMP))), 2)
            data[KEY_SOIL_TEMP_C] = soil_tc

        return tc, rh, pressure_hpa, wind_ms, gust_ms, wind_dir, rain_total_mm, lux, uv

    def _compute_derived_temperature(
        self, data: dict, now: Any, tc: float | None, rh: float | None, wind_ms: float | None
    ) -> float | None:
        """Dew point, frost point, wet-bulb, feels-like, 24h stats. Returns dew_c."""
        rt = self.runtime

        # Compute dew point if not already set by external sensor
        dew_c: float | None = data.get(KEY_DEW_POINT_C)
        if dew_c is None and tc is not None and rh is not None:
            dew_c = calculate_dew_point(float(tc), float(rh))
            data[KEY_DEW_POINT_C] = dew_c

        # Frost point (uses ice constants below 0 C)
        if tc is not None and rh is not None:
            data[KEY_FROST_POINT_C] = calculate_frost_point(float(tc), float(rh))

        # Wet-bulb temperature (Stull 2011)
        if tc is not None and rh is not None:
            data[KEY_WET_BULB_C] = calculate_wet_bulb(float(tc), float(rh))

        # Apparent temperature (Australian BOM)
        if tc is not None and rh is not None and wind_ms is not None:
            data[KEY_FEELS_LIKE_C] = calculate_apparent_temperature(float(tc), float(rh), float(wind_ms))

        # v2.0 — Cloud base, freezing level, air density, specific humidity
        if tc is not None and dew_c is not None:
            data[KEY_CLOUD_BASE_M] = calculate_cloud_base_m(float(tc), float(dew_c))
        if tc is not None:
            data[KEY_FREEZING_LEVEL_M] = calculate_freezing_level_m(float(tc), self.elevation_m)
        pressure_hpa_now = data.get(KEY_NORM_PRESSURE_HPA)
        if tc is not None and pressure_hpa_now is not None:
            data[KEY_AIR_DENSITY] = calculate_air_density(float(tc), float(pressure_hpa_now))
        if tc is not None and rh is not None and pressure_hpa_now is not None:
            data[KEY_SPECIFIC_HUMIDITY] = calculate_specific_humidity(float(tc), float(rh), float(pressure_hpa_now))

        # Yearly / all-time temperature extremes (issue #124). Hooked into the
        # raw reading before it feeds the 24h rolling window below, so these
        # track every accepted reading rather than the 24h-windowed subset.
        self._update_temp_year_all_time(data, tc)
        self._update_temp_week_month(data, tc)

        # 24h rolling stats
        if tc is not None:
            self._append_and_prune_24h(rt.temp_history_24h, now, float(tc))
        if rt.temp_history_24h:
            temps = self._rolling_values(rt.temp_history_24h)
            data[KEY_TEMP_HIGH_24H] = round(max(temps), 1)
            data[KEY_TEMP_LOW_24H] = round(min(temps), 1)
            data[KEY_TEMP_AVG_24H] = round(sum(temps) / len(temps), 1)

        # Display strings
        if tc is not None:
            data[KEY_TEMP_DISPLAY] = f"{float(tc):.1f}\u00b0C"
            # bar_percent: map temperature onto a -20°C…+40°C scale (0-100%)
            _t = float(tc)
            _pct = max(0.0, min(100.0, (_t - (-20.0)) / 60.0 * 100.0))
            data["_temp_bar_percent"] = round(_pct, 1)
            # color ramp: cold → cool → comfortable → warm → hot
            if _t <= 0:
                data["_temp_color"] = "#60A5FA"  # cold - blue
            elif _t <= 10:
                data["_temp_color"] = "#34D399"  # cool - teal
            elif _t <= 20:
                data["_temp_color"] = "#4ADE80"  # comfortable - green
            elif _t <= 30:
                data["_temp_color"] = "#FBBF24"  # warm - amber
            else:
                data["_temp_color"] = "#EF4444"  # hot - red
        if rh is not None:
            data[KEY_HUMIDITY_LEVEL_DISPLAY] = humidity_level(float(rh))
        # v0.3.0 fix: previously `if uv := data.get(KEY_UV):` was a truthy check,
        # so when UV was 0.0 (nighttime) the level was never set and the entity
        # showed "unknown". Now we explicitly check for None.
        uv_val = data.get(KEY_UV)
        if uv_val is not None:
            data[KEY_UV_LEVEL_DISPLAY] = uv_level(float(uv_val))
            # Populate the UV-level sensor's advertised attributes (previously
            # referenced by attrs_fn but never set → always showed empty).
            data["_uv_recommendation"] = uv_recommendation(float(uv_val))
            data["_uv_burn_fair_skin"] = uv_burn_time_minutes(float(uv_val), skin_type=2)

        # --- v1.5.0 comfort / humidity / vapour indices ---
        if self.comfort_indices_enabled and tc is not None and rh is not None:
            data[KEY_HEAT_INDEX] = calculate_heat_index(float(tc), float(rh))
            data[KEY_VPD] = calculate_vpd(float(tc), float(rh))
            data[KEY_ABSOLUTE_HUMIDITY] = calculate_absolute_humidity(float(tc), float(rh))
            if dew_c is not None:
                data[KEY_HUMIDEX] = calculate_humidex(float(tc), float(dew_c))
            if wind_ms is not None:
                data[KEY_WIND_CHILL] = calculate_wind_chill(float(tc), float(wind_ms))
                data[KEY_THW_INDEX] = calculate_thw_index(float(tc), float(rh), float(wind_ms))
                solar_rad = self._get_solar_radiation()
                if solar_rad is not None:
                    data[KEY_THSW_INDEX] = calculate_thsw_index(float(tc), float(rh), float(wind_ms), float(solar_rad))
            wet_bulb = data.get(KEY_WET_BULB_C)
            if wet_bulb is not None:
                data[KEY_DELTA_T] = calculate_delta_t(float(tc), float(wet_bulb))
                # WBGT: prefer outdoor formula when solar radiation is available
                solar_rad = self._get_solar_radiation()
                if solar_rad is not None and solar_rad > 0:
                    data[KEY_WBGT] = calculate_wbgt_outdoor(float(tc), float(wet_bulb), float(solar_rad))
                else:
                    data[KEY_WBGT] = calculate_wbgt_simplified(float(tc), float(wet_bulb))

        # v2.0 UTCI — uses solar-corrected mean radiant temperature when available
        if self.comfort_indices_enabled and tc is not None and rh is not None and wind_ms is not None:
            solar_rad = self._get_solar_radiation()
            # Estimate mean radiant temperature: tr ≈ ta when shaded; correct for solar
            if solar_rad is not None and solar_rad > 50:
                # Simple Tmrt estimation: globe temp formula gives delta above air temp
                tr = float(tc) + 0.393 * max(0.0, float(solar_rad)) ** 0.4 - 4.0
            else:
                tr = float(tc)
            utci = calculate_utci(float(tc), tr, float(wind_ms), float(rh))
            if utci is not None:
                data[KEY_UTCI] = utci

        return dew_c

    def _update_temp_year_all_time(self, data: dict, tc: float | None) -> None:
        """Update yearly and all-time temperature high/low extremes (issue #124).

        Yearly extremes reset the first time a reading arrives in a new
        calendar year (detected via ``_temp_year_key``, exposed as the
        ``year_ref`` attribute on the yearly sensors). All-time extremes never
        reset automatically - they persist for the life of the config entry.
        """
        if tc is None:
            return
        temp = float(tc)

        year_key = dt_util.now().strftime("%Y")
        if year_key != self._temp_year_key:
            self._temp_high_year = temp
            self._temp_low_year = temp
            self._temp_year_key = year_key
        else:
            if self._temp_high_year is None or temp > self._temp_high_year:
                self._temp_high_year = temp
            if self._temp_low_year is None or temp < self._temp_low_year:
                self._temp_low_year = temp
        data[KEY_TEMP_HIGH_YEAR] = round(self._temp_high_year, 1)
        data[KEY_TEMP_LOW_YEAR] = round(self._temp_low_year, 1)
        data[KEY_TEMP_YEAR_REF] = self._temp_year_key

        if self._temp_high_all_time is None or temp > self._temp_high_all_time:
            self._temp_high_all_time = temp
        if self._temp_low_all_time is None or temp < self._temp_low_all_time:
            self._temp_low_all_time = temp
        data[KEY_TEMP_HIGH_ALL_TIME] = round(self._temp_high_all_time, 1)
        data[KEY_TEMP_LOW_ALL_TIME] = round(self._temp_low_all_time, 1)

    def _update_temp_week_month(self, data: dict, tc: float | None) -> None:
        """Update this-week and this-month temperature high/low extremes (issue #127).

        Weekly extremes reset on the ISO week boundary (Monday), exposed as
        the ``week_ref`` attribute. Monthly extremes reset on the 1st,
        exposed as ``month_ref``.
        """
        if tc is None:
            return
        temp = float(tc)
        now_local = dt_util.now()
        iso_week = now_local.strftime("%G-W%V")
        month_key = now_local.strftime("%Y-%m")

        if iso_week != self._temp_week_isoweek:
            self._temp_high_week = temp
            self._temp_low_week = temp
            self._temp_week_isoweek = iso_week
        else:
            if self._temp_high_week is None or temp > self._temp_high_week:
                self._temp_high_week = temp
            if self._temp_low_week is None or temp < self._temp_low_week:
                self._temp_low_week = temp
        data[KEY_TEMP_HIGH_WEEK] = round(self._temp_high_week, 1)
        data[KEY_TEMP_LOW_WEEK] = round(self._temp_low_week, 1)
        data[KEY_TEMP_WEEK_REF] = self._temp_week_isoweek

        if month_key != self._temp_month_key:
            self._temp_high_month = temp
            self._temp_low_month = temp
            self._temp_month_key = month_key
        else:
            if self._temp_high_month is None or temp > self._temp_high_month:
                self._temp_high_month = temp
            if self._temp_low_month is None or temp < self._temp_low_month:
                self._temp_low_month = temp
        data[KEY_TEMP_HIGH_MONTH] = round(self._temp_high_month, 1)
        data[KEY_TEMP_LOW_MONTH] = round(self._temp_low_month, 1)
        data[KEY_TEMP_MONTH_REF] = self._temp_month_key

    def _compute_derived_pressure(
        self, data: dict, now: Any, tc: float | None, pressure_hpa: float | None, rh: float | None
    ) -> tuple[float, float]:
        """MSLP, pressure history, trend, Zambretti. Returns (trend_3h, mslp_or_0)."""
        from .algorithms import calculate_sea_level_pressure

        rt = self.runtime

        mslp: float | None = None
        if pressure_hpa is not None and tc is not None:
            # WMO reduces station pressure with a 12h mean temperature to avoid a
            # spurious diurnal wave. Use the mean over the last 12h of samples
            # when we have a meaningful amount of history; otherwise fall back to
            # the instantaneous reading (e.g. shortly after first setup).
            mean_temp = self._mean_window(rt.temp_history_24h, now, hours=12.0, min_samples=6)
            mslp = calculate_sea_level_pressure(float(pressure_hpa), self.elevation_m, float(tc), mean_temp_c=mean_temp)
            data[KEY_SEA_LEVEL_PRESSURE_HPA] = mslp
            rt.last_mslp = mslp

        # Pressure history (sampled every PRESSURE_HISTORY_INTERVAL_MIN minutes)
        if pressure_hpa is not None:
            if rt.pressure_history_ts is None:
                rt.pressure_history.append(float(pressure_hpa))
                rt.pressure_history_ts = now
            else:
                elapsed_min = (now - rt.pressure_history_ts).total_seconds() / 60.0
                if elapsed_min >= PRESSURE_HISTORY_INTERVAL_MIN:
                    rt.pressure_history.append(float(pressure_hpa))
                    rt.pressure_history_ts = now

            if len(rt.pressure_history) >= 2:
                trend_3h = least_squares_pressure_trend(list(rt.pressure_history))
                data[KEY_PRESSURE_TREND_HPAH] = trend_3h
                data[KEY_PRESSURE_CHANGE_WINDOW_HPA] = round(rt.pressure_history[-1] - rt.pressure_history[0], 2)
            else:
                data[KEY_PRESSURE_TREND_HPAH] = 0.0
                data[KEY_PRESSURE_CHANGE_WINDOW_HPA] = 0.0

        trend_3h: float = data.get(KEY_PRESSURE_TREND_HPAH, 0.0)
        data[KEY_PRESSURE_TREND_DISPLAY] = pressure_trend_display(float(trend_3h))
        data["_pressure_trend_arrow"] = pressure_trend_arrow(float(trend_3h))
        # Color ramp: rising=green, steady=white/grey, falling=amber/red
        _pt_color: str
        if trend_3h >= 0.8:
            _pt_color = "#4ADE80"  # rising - green
        elif trend_3h > -0.8:
            _pt_color = "rgba(255,255,255,0.75)"  # steady - white
        elif trend_3h > -1.6:
            _pt_color = "#FBBF24"  # falling - amber
        else:
            _pt_color = "#EF4444"  # falling rapidly - red
        data["_pressure_trend_color"] = _pt_color

        # Zambretti forecast (real N&Z lookup table)
        wind_quad = data.get(KEY_WIND_QUADRANT, "N")
        if mslp is not None and rh is not None:
            forecast_text, z_number = zambretti_forecast(
                mslp=mslp,
                pressure_trend_3h=float(trend_3h),
                wind_quadrant=str(wind_quad),
                humidity=float(rh),
                month=dt_util.now().month,
                hemisphere=self.hemisphere,
                climate=self.climate_region,
                # v0.3.0: pass wind_speed_ms so the function can suppress
                # wind direction influence at very low wind speeds, and
                # pass rain_24h_mm so it can apply the dry-fair sanity guard.
                wind_speed_ms=data.get(KEY_NORM_WIND_SPEED_MS),
                rain_24h_mm=data.get(KEY_RAIN_ACCUM_24H),
            )
            data[KEY_ZAMBRETTI_FORECAST] = forecast_text
            data[KEY_ZAMBRETTI_NUMBER] = z_number
        else:
            data[KEY_ZAMBRETTI_FORECAST] = "insufficient_data"
            data[KEY_ZAMBRETTI_NUMBER] = None

        return trend_3h, (mslp or 0.0)

    def _compute_derived_wind(
        self, data: dict, now: Any, wind_ms: float | None, gust_ms: float | None, wind_dir: float | None
    ) -> None:
        """Beaufort, quadrant, smoothed direction, 24h gust max."""
        rt = self.runtime

        if wind_dir is not None:
            if rt.smoothed_wind_dir is None:
                rt.smoothed_wind_dir = float(wind_dir)
            else:
                rt.smoothed_wind_dir = smooth_wind_direction(
                    float(wind_dir), rt.smoothed_wind_dir, alpha=WIND_SMOOTH_ALPHA
                )
            data[KEY_WIND_DIR_SMOOTH_DEG] = rt.smoothed_wind_dir

        smooth_dir = data.get(KEY_WIND_DIR_SMOOTH_DEG, wind_dir)
        if smooth_dir is not None:
            data[KEY_WIND_QUADRANT] = direction_to_quadrant(float(smooth_dir))

        if wind_ms is not None:
            bft = wind_speed_to_beaufort(float(wind_ms))
            data[KEY_WIND_BEAUFORT] = bft
            data[KEY_WIND_BEAUFORT_DESC] = beaufort_description(bft)

        if gust_ms is not None:
            self._append_and_prune_24h(rt.gust_history_24h, now, float(gust_ms))
        if rt.gust_history_24h:
            gust_vals = self._rolling_values(rt.gust_history_24h)
            if gust_vals:
                data[KEY_WIND_GUST_MAX_24H] = round(max(gust_vals), 1)

        # Monthly / yearly / all-time gust max (issue #127)
        self._update_gust_month_year_all_time(data, gust_ms)

        # v2.0 wind gust factor
        if wind_ms is not None and gust_ms is not None:
            gf = calculate_wind_gust_factor(float(gust_ms), float(wind_ms))
            if gf is not None:
                data[KEY_WIND_GUST_FACTOR] = gf

        # v2.0 dominant wind direction + variability (24h circular stats)
        if wind_dir is not None:
            self._append_and_prune_24h(self._wind_dir_history_24h, now, float(wind_dir))
        if self._wind_dir_history_24h:
            dir_vals = [v for _, v in self._wind_dir_history_24h]
            dom = calculate_dominant_wind_direction(dir_vals)
            if dom is not None:
                data[KEY_DOMINANT_WIND_DIR] = dom
            var = calculate_wind_direction_variability(dir_vals)
            if var is not None:
                data[KEY_WIND_DIR_VARIABILITY] = var

    def _update_gust_month_year_all_time(self, data: dict, gust_ms: float | None) -> None:
        """Update monthly, yearly and all-time wind gust max (issue #127).

        Monthly resets on the 1st, yearly on Jan 1st (each exposing a
        ``*_ref`` attribute with the period key). All-time never resets
        automatically.
        """
        if gust_ms is None:
            return
        gust = float(gust_ms)
        now_local = dt_util.now()
        month_key = now_local.strftime("%Y-%m")
        year_key = now_local.strftime("%Y")

        if month_key != self._gust_month_key:
            self._gust_max_month = gust
            self._gust_month_key = month_key
        elif self._gust_max_month is None or gust > self._gust_max_month:
            self._gust_max_month = gust
        data[KEY_WIND_GUST_MAX_MONTH] = round(self._gust_max_month, 1)
        data[KEY_WIND_GUST_MONTH_REF] = self._gust_month_key

        if year_key != self._gust_year_key:
            self._gust_max_year = gust
            self._gust_year_key = year_key
        elif self._gust_max_year is None or gust > self._gust_max_year:
            self._gust_max_year = gust
        data[KEY_WIND_GUST_MAX_YEAR] = round(self._gust_max_year, 1)
        data[KEY_WIND_GUST_YEAR_REF] = self._gust_year_key

        if self._gust_max_all_time is None or gust > self._gust_max_all_time:
            self._gust_max_all_time = gust
        data[KEY_WIND_GUST_MAX_ALL_TIME] = round(self._gust_max_all_time, 1)

    def _compute_derived_precipitation(self, data: dict, now: Any, rain_total_mm: float | None) -> float:
        """Rain rate (Kalman-filtered), rain display. Returns rain_rate (filtered)."""
        rt = self.runtime

        if rain_total_mm is not None:
            self._append_and_prune_24h(rt.rain_total_history_24h, now, float(rain_total_mm))

            if rt.last_rain_total_mm is None or rt.last_rain_ts is None:
                rt.last_rain_total_mm = float(rain_total_mm)
                rt.last_rain_ts = now
                data[KEY_RAIN_RATE_FILT] = 0.0
            else:
                raw = self._rain_rate_from_totals_window(rt.rain_total_history_24h, now, RAIN_RATE_WINDOW_H)
                raw = max(0.0, min(raw, RAIN_RATE_PHYSICAL_CAP_MMPH))
                filtered = rt.kalman.update(raw)
                rt.last_rain_total_mm = float(rain_total_mm)
                rt.last_rain_ts = now
                data[KEY_RAIN_RATE_FILT] = filtered

        rain_rate: float = data.get(KEY_RAIN_RATE_FILT, 0.0)
        data[KEY_RAIN_DISPLAY] = format_rain_display(float(rain_rate))

        # Rain accumulations (1h / 24h)
        if rt.rain_total_history_24h:
            data[KEY_RAIN_ACCUM_1H] = round(self._rain_accum_window_from_totals(rt.rain_total_history_24h, now, 1.0), 1)
            data[KEY_RAIN_ACCUM_24H] = round(self._rain_accum_24h_from_totals(rt.rain_total_history_24h), 1)

        # Rain today - resets at local midnight (use local time, not UTC)
        rain_total_mm: float | None = data.get(KEY_NORM_RAIN_TOTAL_MM)
        date_str = dt_util.now().strftime("%Y-%m-%d")
        if date_str != self._rain_today_date:
            # Day rolled over - snapshot the day that just ended (with its final
            # rain total) so streak counters can evaluate the completed day
            # before we zero the running total (issue #15).
            if self._rain_today_date:
                self._rain_prev_day_date = self._rain_today_date
                self._rain_prev_day_mm = self._rain_today_mm
            self._rain_today_mm = 0.0
            self._rain_today_date = date_str
            self._rain_today_last_total = rain_total_mm
        elif rain_total_mm is not None and self._rain_today_last_total is not None:
            delta = float(rain_total_mm) - float(self._rain_today_last_total)
            if delta > 0:
                self._rain_today_mm += delta
            self._rain_today_last_total = float(rain_total_mm)
        elif rain_total_mm is not None and self._rain_today_last_total is None:
            self._rain_today_last_total = float(rain_total_mm)
        data["_rain_today_mm"] = round(self._rain_today_mm, 1)

        # Track last rain event timestamp (used by streak counters)
        if float(rain_rate) > 0.0:
            rt.last_rain_event_ts = now

        # v2.0 — Weekly / monthly / yearly rain accumulators
        now_local = dt_util.now()
        iso_week = now_local.strftime("%G-W%V")  # ISO 8601 week (Mon start)
        month_key = now_local.strftime("%Y-%m")
        year_key = now_local.strftime("%Y")

        # Weekly
        if iso_week != self._rain_this_week_isoweek:
            self._rain_this_week_mm = 0.0
            self._rain_this_week_isoweek = iso_week
            self._rain_this_week_last_total = rain_total_mm
        elif rain_total_mm is not None and self._rain_this_week_last_total is not None:
            delta = float(rain_total_mm) - float(self._rain_this_week_last_total)
            if delta > 0:
                self._rain_this_week_mm += delta
            self._rain_this_week_last_total = float(rain_total_mm)
        elif rain_total_mm is not None and self._rain_this_week_last_total is None:
            self._rain_this_week_last_total = float(rain_total_mm)
        data[KEY_RAIN_THIS_WEEK_MM] = round(self._rain_this_week_mm, 1)

        # Monthly
        if month_key != self._rain_this_month_key:
            self._rain_this_month_mm = 0.0
            self._rain_this_month_key = month_key
            self._rain_this_month_last_total = rain_total_mm
        elif rain_total_mm is not None and self._rain_this_month_last_total is not None:
            delta = float(rain_total_mm) - float(self._rain_this_month_last_total)
            if delta > 0:
                self._rain_this_month_mm += delta
            self._rain_this_month_last_total = float(rain_total_mm)
        elif rain_total_mm is not None and self._rain_this_month_last_total is None:
            self._rain_this_month_last_total = float(rain_total_mm)
        data[KEY_RAIN_THIS_MONTH_MM] = round(self._rain_this_month_mm, 1)

        # Yearly
        if year_key != self._rain_this_year_key:
            self._rain_this_year_mm = 0.0
            self._rain_this_year_key = year_key
            self._rain_this_year_last_total = rain_total_mm
        elif rain_total_mm is not None and self._rain_this_year_last_total is not None:
            delta = float(rain_total_mm) - float(self._rain_this_year_last_total)
            if delta > 0:
                self._rain_this_year_mm += delta
            self._rain_this_year_last_total = float(rain_total_mm)
        elif rain_total_mm is not None and self._rain_this_year_last_total is None:
            self._rain_this_year_last_total = float(rain_total_mm)
        data[KEY_RAIN_THIS_YEAR_MM] = round(self._rain_this_year_mm, 1)

        # v2.0 — Max rain rate in rolling 24h window
        self._append_and_prune_24h(self._rain_rate_history_24h, now, float(rain_rate))
        if self._rain_rate_history_24h:
            data[KEY_RAIN_RATE_MAX_24H] = round(max(v for _, v in self._rain_rate_history_24h), 1)

        return rain_rate

    def _compute_condition(
        self,
        data: dict,
        tc: float | None,
        rh: float | None,
        wind_ms: float | None,
        gust_ms: float | None,
        rain_rate: float,
        dew_c: float | None,
        lux: float | None,
        uv: float | None,
    ) -> str:
        """Determine current weather condition (36-condition classifier)."""
        sun_state = self.hass.states.get("sun.sun")
        sun_elev = 0.0
        sun_azimuth = 180.0
        is_day = True
        if sun_state:
            sun_elev = float(sun_state.attributes.get("elevation", 0))
            sun_azimuth = float(sun_state.attributes.get("azimuth", 180))
            is_day = sun_state.state == "above_horizon"

        if tc is None or rh is None:
            return "sunny" if is_day else "clear-night"

        condition = determine_current_condition(
            temp_c=float(tc),
            humidity=float(rh),
            wind_speed_ms=float(wind_ms or 0),
            wind_gust_ms=float(gust_ms or 0),
            rain_rate_mmph=float(rain_rate),
            dew_point_c=float(dew_c or 0),
            illuminance_lx=float(lux or 50000),
            uv_index=float(uv or 0),
            zambretti=str(data.get(KEY_ZAMBRETTI_FORECAST, "")),
            pressure_trend=float(data.get(KEY_PRESSURE_TREND_HPAH, 0)),
            sun_elevation=sun_elev,
            sun_azimuth=sun_azimuth,
            is_day=is_day,
            current_hour=dt_util.now().hour,
        )
        data[KEY_CURRENT_CONDITION] = condition
        data["_condition_icon"] = CONDITION_ICONS.get(condition, "mdi:weather-partly-cloudy")
        data["_condition_color"] = CONDITION_COLORS.get(condition, "#FCD34D")
        data["_condition_description"] = CONDITION_DESCRIPTIONS.get(condition, condition)
        data["_condition_severity"] = get_condition_severity(condition)
        return condition

    def _compute_rain_probability(self, data: dict, mslp: float, trend_3h: float, rh: float | None) -> None:
        """Local + API-blended rain probability."""
        wind_quad = data.get(KEY_WIND_QUADRANT, "N")
        if mslp and rh is not None:
            local_prob = calculate_rain_probability(
                mslp=float(mslp),
                pressure_trend=float(trend_3h),
                humidity=float(rh),
                wind_quadrant=str(wind_quad),
                climate_region=self.climate_region,
            )
            data[KEY_RAIN_PROBABILITY] = local_prob

            api_prob = None
            fc = getattr(self, "_forecast_cache", None)
            if fc and fc.get("daily"):
                pp = (fc["daily"][0] or {}).get("precip_prob")
                if pp is not None:
                    api_prob = int(pp)

            outcomes = self._learning_state.forecast_outcomes
            learned_local = self._learning_state.blend_local if len(outcomes) >= 10 else None
            learned_api = self._learning_state.blend_openmeteo if len(outcomes) >= 10 else None
            combined = combine_rain_probability(
                local_prob,
                api_prob,
                dt_util.now().hour,
                learned_local_w=learned_local,
                learned_api_w=learned_api,
            )
            data[KEY_RAIN_PROBABILITY_COMBINED] = combined

    def _compute_forecast_agreement(self, data: dict) -> None:
        """Compare Zambretti local outlook vs Open-Meteo precip probability.

        Derives an implied rain likelihood from the Z-number (using the
        ZAMBRETTI_RAIN_PCT lookup table) and compares it to Open-Meteo's
        daily precipitation_probability for today.  The difference drives a
        three-state agreement sensor:
          • aligned   - difference < 20 pp  (both sources agree)
          • diverging - difference 20-40 pp (moderate disagreement)
          • conflict  - difference > 40 pp  (sources fundamentally disagree)

        When sources conflict, forecasts should be treated with lower
        confidence; the discrepancy itself is often meaningful (e.g. a
        rapidly-falling barometer that the NWP model hasn't captured yet).
        """
        z_number = data.get(KEY_ZAMBRETTI_NUMBER)
        if z_number is None:
            return

        try:
            z_idx = int(z_number) - 1  # Z-numbers are 1-indexed
            if not (0 <= z_idx < len(ZAMBRETTI_RAIN_PCT)):
                return
            z_rain_pct = ZAMBRETTI_RAIN_PCT[z_idx]
        except (TypeError, ValueError):
            return

        fc = getattr(self, "_forecast_cache", None)
        if not fc or not fc.get("daily"):
            return
        api_precip_prob = (fc["daily"][0] or {}).get("precip_prob")
        if api_precip_prob is None:
            return

        api_precip_prob = float(api_precip_prob)
        delta = abs(z_rain_pct - api_precip_prob)

        if delta < FORECAST_AGREEMENT_ALIGNED_PP:
            state = "aligned"
        elif delta < FORECAST_AGREEMENT_CONFLICT_PP:
            state = "diverging"
        else:
            state = "conflict"

        data[KEY_FORECAST_AGREEMENT] = state
        data["_forecast_agreement_z_rain_pct"] = z_rain_pct
        data["_forecast_agreement_api_precip_prob"] = round(api_precip_prob)
        data["_forecast_agreement_delta"] = round(delta)

    def _compute_degree_days(
        self, data: dict, now: Any, tc: float | None, dew_c: float | None, rh: float | None
    ) -> None:
        """Heating / Cooling / Growing Degree Days and leaf wetness.  (v2.0)

        HDD and CDD accumulate from sub-hourly temperature samples throughout
        the day (averaged contribution per sample).  GDD uses the daily
        max/min from the 24h rolling window, consistent with agronomic practice.
        """
        if not self.degree_days_enabled or tc is None:
            return

        date_str = dt_util.now().strftime("%Y-%m-%d")
        now_local = dt_util.now()

        # --- HDD today (rolling mean of per-sample contributions) ---
        hdd_contrib = calculate_hdd_contribution(float(tc), self._hdd_base_c)
        if date_str != self._hdd_today_date:
            self._hdd_today = 0.0
            self._hdd_today_date = date_str
            self._hdd_today_samples = 0
        self._hdd_today_samples += 1
        # Welford-style running mean to avoid overflow
        self._hdd_today += (hdd_contrib - self._hdd_today) / self._hdd_today_samples
        data[KEY_HDD_TODAY_MM] = round(self._hdd_today, 2)

        # --- CDD today ---
        cdd_contrib = calculate_cdd_contribution(float(tc), self._cdd_base_c)
        if date_str != self._cdd_today_date:
            self._cdd_today = 0.0
            self._cdd_today_date = date_str
            self._cdd_today_samples = 0
        self._cdd_today_samples += 1
        self._cdd_today += (cdd_contrib - self._cdd_today) / self._cdd_today_samples
        data[KEY_CDD_TODAY_MM] = round(self._cdd_today, 2)

        # --- GDD today (from 24h rolling max/min; only meaningful after warmup) ---
        t_max = data.get(KEY_TEMP_HIGH_24H)
        t_min = data.get(KEY_TEMP_LOW_24H)
        if t_max is not None and t_min is not None:
            gdd = calculate_gdd_contribution(float(t_max), float(t_min), self._gdd_base_c, self._gdd_cap_c)
            if date_str != self._gdd_today_date:
                self._gdd_today = gdd
                self._gdd_today_date = date_str
            else:
                self._gdd_today = gdd  # refresh with latest 24h window
            data[KEY_GDD_TODAY_V2] = round(self._gdd_today, 2)

        # --- HDD / CDD season accumulators (reset Jan 1) ---
        year_key = now_local.strftime("%Y")
        if year_key != self._hdd_season_key:
            self._hdd_season = 0.0
            self._hdd_season_key = year_key
        # Accumulate once per day (use today's completed HDD/CDD when day ticks over)
        if hasattr(self, "_hdd_prev_date") and self._hdd_prev_date != date_str:
            self._hdd_season += self._hdd_today
            self._cdd_season += self._cdd_today
        self._hdd_prev_date = date_str  # type: ignore[attr-defined]
        data[KEY_HDD_SEASON] = round(self._hdd_season, 1)
        data[KEY_CDD_SEASON] = round(self._cdd_season, 1)

        # --- GDD season ---
        gdd_season_key = now_local.strftime("%Y")
        if gdd_season_key != self._gdd_season_key:
            self._gdd_season = 0.0
            self._gdd_season_key = gdd_season_key
        if (
            hasattr(self, "_gdd_prev_date")
            and self._gdd_prev_date != date_str
            and data.get(KEY_GDD_TODAY_V2) is not None
        ):
            self._gdd_season += data[KEY_GDD_TODAY_V2]
        self._gdd_prev_date = date_str  # type: ignore[attr-defined]
        data[KEY_GDD_SEASON_V2] = round(self._gdd_season, 1)

        # --- Leaf wetness (boolean → text) ---
        if dew_c is not None and rh is not None:
            rain_rate = data.get(KEY_RAIN_RATE_FILT, 0.0) or 0.0
            wet = calculate_leaf_wetness(float(tc), float(dew_c), float(rh)) or float(rain_rate) > 0.0
            data[KEY_LEAF_WETNESS] = "wet" if wet else "dry"

    def _compute_et0(self, data: dict, now: Any) -> None:
        """Calculate ET₀ (reference evapotranspiration) via Hargreaves-Samani.  (v0.6.0)

        Requires: today's temp high/low from 24h stats + location.
        Falls back gracefully if 24h stats aren't populated yet (first hour of runtime).
        """
        lat = self.forecast_lat
        if lat is None:
            return
        try:
            lat_f = float(lat)
        except (TypeError, ValueError):
            return

        t_max = data.get(KEY_TEMP_HIGH_24H)
        t_min = data.get(KEY_TEMP_LOW_24H)
        t_mean = data.get(KEY_NORM_TEMP_C)

        # Hargreaves needs valid t_max, t_min, t_mean
        if None in (t_max, t_min, t_mean):
            return
        if t_max <= t_min:  # pathological - sensor noise
            return

        doy = now.timetuple().tm_yday
        et0_daily = et0_hargreaves(
            t_max_c=float(t_max),
            t_min_c=float(t_min),
            t_mean_c=float(t_mean),
            lat_deg=lat_f,
            day_of_year=doy,
        )
        data[KEY_ET0_DAILY_MM] = et0_daily
        data[KEY_ET0_HOURLY_MM] = et0_hourly_estimate(et0_daily, now.hour)

        # v2.0 Max theoretical (clear-sky) solar radiation
        doy = now.timetuple().tm_yday
        max_solar = calculate_max_solar_radiation(lat_f, doy, self.elevation_m)
        data[KEY_MAX_SOLAR_RADIATION] = max_solar

        # v2.0 Irrigation water deficit (ET₀ − today's rain)
        rain_today = data.get("_rain_today_mm", 0.0) or 0.0
        data[KEY_IRRIGATION_DEFICIT] = calculate_irrigation_deficit(float(et0_daily), float(rain_today))

        # v2.0 Solar energy accumulation (Wh/m²) — requires solar radiation sensor
        solar_rad = self._get_solar_radiation()
        if solar_rad is not None:
            now_local = dt_util.now()
            solar_date = now_local.strftime("%Y-%m-%d")
            if solar_date != self._solar_energy_date:
                self._solar_energy_today_whm2 = 0.0
                self._solar_energy_date = solar_date
                self._solar_energy_last_ts = None
            if self._solar_energy_last_ts is not None:
                dt_h = (now_local - self._solar_energy_last_ts).total_seconds() / 3600.0
                if 0 < dt_h < 2:  # guard against stale readings or restarts
                    self._solar_energy_today_whm2 += float(solar_rad) * dt_h
            self._solar_energy_last_ts = now_local
            data[KEY_SOLAR_ENERGY_TODAY_WHM2] = round(self._solar_energy_today_whm2, 0)
            data[KEY_PEAK_SUN_HOURS] = round(self._solar_energy_today_whm2 / 1000.0, 2)

            # v2.0 Net radiation (FAO-56) — needs temp + humidity
            tc_now = data.get(KEY_NORM_TEMP_C)
            rh_now = data.get(KEY_NORM_HUMIDITY)
            if tc_now is not None and rh_now is not None:
                data[KEY_NET_RADIATION] = calculate_net_radiation(
                    float(solar_rad), float(tc_now), float(rh_now), max_solar_wm2=max_solar
                )

    def _compute_indoor(self, data: dict) -> None:
        """Read and derive indoor sensor group.  (v2.0)"""
        if not self.indoor_enabled:
            return

        indoor_temp_raw = self._num(self.hass, self.sources.get(SRC_INDOOR_TEMP))
        indoor_hum_raw = self._num(self.hass, self.sources.get(SRC_INDOOR_HUMIDITY))
        indoor_co2_raw = self._num(self.hass, self.sources.get(SRC_INDOOR_CO2))

        if indoor_temp_raw is not None:
            indoor_t_unit = self._uom(self.hass, self.sources.get(SRC_INDOOR_TEMP))
            indoor_tc = round(self._to_celsius(float(indoor_temp_raw), indoor_t_unit), 2)
            data[KEY_INDOOR_TEMP_C] = indoor_tc
            outdoor_tc = data.get(KEY_NORM_TEMP_C)
            if outdoor_tc is not None:
                data[KEY_INDOOR_TEMP_DELTA] = round(float(indoor_tc) - float(outdoor_tc), 2)

        if indoor_hum_raw is not None:
            data[KEY_INDOOR_HUMIDITY] = round(float(indoor_hum_raw), 2)
            outdoor_rh = data.get(KEY_NORM_HUMIDITY)
            if outdoor_rh is not None:
                data[KEY_INDOOR_HUMIDITY_DELTA] = round(float(indoor_hum_raw) - float(outdoor_rh), 2)

        if indoor_co2_raw is not None:
            data[KEY_INDOOR_CO2_PPM] = round(float(indoor_co2_raw))

        # Composite indoor comfort (shared scoring with per-room comfort below).
        comfort = indoor_comfort_score(
            data.get(KEY_INDOOR_TEMP_C) if indoor_temp_raw is not None else None,
            float(indoor_hum_raw) if indoor_hum_raw is not None else None,
            float(indoor_co2_raw) if indoor_co2_raw is not None else None,
        )
        if comfort is not None:
            data[KEY_INDOOR_COMFORT] = comfort

        # Per-room indoor monitoring (named rooms, v2.6.0; issue #115).
        # Each room may carry temp / humidity / CO2 sensors; we derive
        # outdoor-relative deltas and a per-room comfort score.
        if self._indoor_rooms:
            outdoor_tc = data.get(KEY_NORM_TEMP_C)
            outdoor_rh = data.get(KEY_NORM_HUMIDITY)
            rooms: dict[str, dict] = {}
            for room in self._indoor_rooms:
                rid = room.get("id")
                if not rid:
                    continue
                rd: dict[str, Any] = {"name": room.get("name") or rid}

                temp_eid = room.get("temp")
                tc = None
                if temp_eid:
                    val = self._num(self.hass, temp_eid)
                    if val is not None:
                        tc = round(self._to_celsius(float(val), self._uom(self.hass, temp_eid)), 2)
                        rd["temp_c"] = tc
                        if outdoor_tc is not None:
                            rd["delta_c"] = round(tc - float(outdoor_tc), 2)

                hum_eid = room.get("humidity")
                rh = None
                if hum_eid:
                    hval = self._num(self.hass, hum_eid)
                    if hval is not None:
                        rh = round(float(hval), 2)
                        rd["humidity_pct"] = rh
                        if outdoor_rh is not None:
                            rd["humidity_delta_pct"] = round(rh - float(outdoor_rh), 2)

                co2_eid = room.get("co2")
                co2 = None
                if co2_eid:
                    cval = self._num(self.hass, co2_eid)
                    if cval is not None:
                        co2 = round(float(cval))
                        rd["co2_ppm"] = co2

                room_comfort = indoor_comfort_score(tc, rh, co2)
                if room_comfort is not None:
                    rd["comfort"] = room_comfort

                rooms[rid] = rd
            if rooms:
                data[KEY_INDOOR_ROOMS_DATA] = rooms

    def _compute_soil(self, data: dict) -> None:
        """Derive irrigation need from soil moisture, ET₀, and recent rain.  (v2.1)"""
        if not self.entry_options.get(CONF_ENABLE_SOIL, DEFAULT_ENABLE_SOIL):
            return

        soil_pct = data.get(KEY_SOIL_MOISTURE)
        if soil_pct is None:
            return

        # Field capacity ~40% is typical for loam soil
        FIELD_CAPACITY = 40.0
        deficit = round(max(0.0, FIELD_CAPACITY - float(soil_pct)), 1)
        data[KEY_SOIL_MOISTURE_DEFICIT] = deficit

        # Irrigation need: combine deficit with ET₀ and rain today
        et0 = data.get(KEY_ET0_DAILY_MM) or data.get(KEY_ET0_PM_DAILY_MM) or 0.0
        rain_today = data.get(KEY_RAIN_TODAY_MM) or 0.0
        net_demand = max(0.0, float(et0) - float(rain_today))

        # Score 0-100: weighted soil deficit + net ET₀ demand
        score = min(100, deficit * 1.5 + net_demand * 5)
        data[KEY_IRRIGATION_NEED_SCORE] = round(score, 0)

        if score < 10:
            need_label = "none"
        elif score < 25:
            need_label = "low"
        elif score < 50:
            need_label = "moderate"
        elif score < 75:
            need_label = "high"
        else:
            need_label = "critical"
        data[KEY_IRRIGATION_NEED] = need_label

    def _compute_snow(self, data: dict, now: Any) -> None:
        """Estimate precipitation phase and snow accumulation.  (v2.7, opt-in)

        Heuristic, not a measurement: no station-agnostic snow gauge exists.
        See algorithms.py's classify_precip_phase / estimate_snowfall_cm for
        the method (wet-bulb phase threshold + temperature-dependent
        snow-to-liquid ratio) and its caveats. Snow depth is integrated
        locally from the smoothed liquid rain rate over elapsed real time -
        deliberately *not* a delta of the cumulative rain-total sensor like
        the rain accumulators use, since there is no cumulative snow sensor
        to delta against, and this keeps it fully isolated from (never
        touches) the existing rain sensors' behaviour.
        """
        if not self.snow_enabled:
            return
        tc = data.get(KEY_NORM_TEMP_C)
        rh = data.get(KEY_NORM_HUMIDITY)
        rain_rate = float(data.get(KEY_RAIN_RATE_FILT) or 0.0)
        if tc is None or rh is None:
            return

        wet_bulb = calculate_wet_bulb(float(tc), float(rh))
        phase = classify_precip_phase(wet_bulb) if rain_rate > 0.1 else "none"
        data[KEY_SNOW_PHASE] = phase
        data[KEY_SNOW_FALLING] = phase == "snow"

        # Elapsed time since the last cycle this ran, capped so a long gap
        # (HA restart, a missed tick) can't attribute hours of accumulation
        # to a single sample.
        elapsed_h = 0.0
        if self._snow_last_calc_ts is not None:
            elapsed_h = max(0.0, (now - self._snow_last_calc_ts).total_seconds() / 3600.0)
            elapsed_h = min(elapsed_h, 0.5)
        self._snow_last_calc_ts = now

        new_snow_cm = 0.0
        if phase == "snow":
            data[KEY_SNOW_RATE_CM_H] = round(estimate_snowfall_cm(rain_rate, float(tc)), 2)
            if elapsed_h > 0:
                new_snow_cm = estimate_snowfall_cm(rain_rate * elapsed_h, float(tc))
        else:
            data[KEY_SNOW_RATE_CM_H] = 0.0

        date_str = dt_util.now().strftime("%Y-%m-%d")
        if date_str != self._snow_today_date:
            self._snow_today_cm = 0.0
            self._snow_today_date = date_str
        self._snow_today_cm += new_snow_cm
        data[KEY_SNOW_TODAY_CM] = round(self._snow_today_cm, 1)

        # All-time "snowiest day" record (issue #144). Compared every tick so
        # the record updates live as today accumulates; never resets.
        if self._snow_today_cm > self._snowiest_day_cm:
            self._snowiest_day_cm = self._snow_today_cm
            self._snowiest_day_date = self._snow_today_date
        data[KEY_SNOW_RECORD_DAY_CM] = round(self._snowiest_day_cm, 1)
        data["_snow_record_day_date"] = self._snowiest_day_date or None

        month_key = dt_util.now().strftime("%Y-%m")
        if month_key != self._snow_this_month_key:
            self._snow_this_month_cm = 0.0
            self._snow_this_month_key = month_key
        self._snow_this_month_cm += new_snow_cm
        data[KEY_SNOW_THIS_MONTH_CM] = round(self._snow_this_month_cm, 1)

        year_key = dt_util.now().strftime("%Y")
        if year_key != self._snow_this_year_key:
            self._snow_this_year_cm = 0.0
            self._snow_this_year_key = year_key
        self._snow_this_year_cm += new_snow_cm
        data[KEY_SNOW_THIS_YEAR_CM] = round(self._snow_this_year_cm, 1)

    async def _async_fetch_neighbor_qc(self) -> None:
        """Fetch Open-Meteo current weather as a spatial QC reference.  (v2.0)

        Compares local station readings against the nearest NWP grid point.
        Flags large deviations (>5°C temperature, >20 hPa pressure, >20% humidity)
        as potential sensor errors. Runs hourly; results cached in coordinator.
        """
        lat = self.forecast_lat
        lon = self.forecast_lon
        if lat is None or lon is None:
            return
        try:
            url = (
                "https://api.open-meteo.com/v1/forecast"
                f"?latitude={lat:.4f}&longitude={lon:.4f}"
                "&current=temperature_2m,relative_humidity_2m,surface_pressure"
                "&wind_speed_unit=ms&timezone=auto"
            )
            session = async_get_clientsession(self.hass)
            async with session.get(url, timeout=15) as resp:
                if resp.status != 200:
                    return
                payload = await resp.json()
            current = payload.get("current", {})
            self._neighbor_qc_cache = {
                "temp_c": current.get("temperature_2m"),
                "humidity": current.get("relative_humidity_2m"),
                "pressure_hpa": current.get("surface_pressure"),
                "fetched_at": dt_util.utcnow().isoformat(),
            }
            await self._maybe_update_auto_calibration(self._neighbor_qc_cache)
        except Exception:  # noqa: BLE001
            pass  # QC is advisory; never block main flow

    async def _maybe_update_auto_calibration(self, nwp: dict) -> None:
        """Fold one neighbor-QC sample into the adaptive calibration bias EMA,
        and - once confident - nudge cal_temp_c/cal_humidity/cal_pressure_hpa a
        small bounded step toward canceling a persistent bias.  (v2.7)

        Opt-in via enable_auto_calibration. Runs on the same hourly cadence as
        the neighbor-QC fetch it reuses (~240 samples ≈ 10 days before the
        first possible nudge), applies at most one nudge per calendar day, and
        never overshoots the learned bias in a single step - see const.py
        AUTO_CAL_* for the tuning constants and rationale.
        """
        if not self.entry_options.get(CONF_ENABLE_AUTO_CALIBRATION, DEFAULT_ENABLE_AUTO_CALIBRATION):
            return
        local = self.data or {}
        from .const import AUTO_CAL_BIAS_ALPHA, AUTO_CAL_DEADBAND, AUTO_CAL_MIN_SAMPLES, AUTO_CAL_STEP
        from .learning_state import compute_auto_calibration_step, update_calibration_bias

        update_calibration_bias(
            self._learning_state,
            local.get(KEY_NORM_TEMP_C),
            nwp.get("temp_c"),
            local.get(KEY_NORM_HUMIDITY),
            nwp.get("humidity"),
            local.get(KEY_NORM_PRESSURE_HPA),
            nwp.get("pressure_hpa"),
            alpha=AUTO_CAL_BIAS_ALPHA,
        )

        today_str = dt_util.now().date().isoformat()
        if self._learning_state.cal_last_auto_apply_date == today_str:
            return  # already nudged today

        deltas = compute_auto_calibration_step(
            self._learning_state, AUTO_CAL_MIN_SAMPLES, AUTO_CAL_DEADBAND, AUTO_CAL_STEP
        )
        if not deltas:
            return

        # Bounds mirror number.py's WSNumberDesc native_min/native_max for these
        # same options, so an auto-nudge can never push a field further than a
        # user could push it manually.
        bounds = {
            "cal_temp_c": (-10.0, 10.0),
            "cal_humidity": (-20.0, 20.0),
            "cal_pressure_hpa": (-10.0, 10.0),
        }
        new_options = dict(self.config_entry.options)
        applied: dict[str, float] = {}
        for cal_field, delta in deltas.items():
            lo, hi = bounds[cal_field]
            current_val = float(new_options.get(cal_field, 0.0))
            new_val = round(max(lo, min(hi, current_val + delta)), 2)
            if abs(new_val - current_val) < 1e-9:
                continue  # already at the bound; nothing to write
            new_options[cal_field] = new_val
            applied[cal_field] = new_val
        if not applied:
            return

        self._learning_state.cal_last_auto_apply_date = today_str
        _LOGGER.info(
            "ws_core: auto-calibration nudged %s (learned bias vs regional reference, "
            "%d samples) - review under Configure → Features if unexpected",
            applied,
            self._learning_state.cal_bias_n,
        )
        # Persist the learning state *before* triggering the reload below - the
        # reload tears down this coordinator and a fresh one loads learning
        # state from storage, so the save must land first or today's
        # cal_last_auto_apply_date (and the nudged bias EMA) would be lost and
        # tomorrow's fetch could double-nudge.
        from .learning_state import async_save_learning

        await async_save_learning(self._learning_store, self._learning_state)
        self.hass.config_entries.async_update_entry(self.config_entry, options=new_options)

    def _compute_neighbor_qc(self, data: dict) -> None:
        """Compare local readings against cached NWP grid point; populate flags."""
        cache = getattr(self, "_neighbor_qc_cache", None)
        flags: list[str] = []
        if cache:
            local_tc = data.get(KEY_NORM_TEMP_C)
            local_rh = data.get(KEY_NORM_HUMIDITY)
            local_press = data.get(KEY_NORM_PRESSURE_HPA)
            nwp_tc = cache.get("temp_c")
            nwp_rh = cache.get("humidity")
            nwp_press = cache.get("pressure_hpa")
            if local_tc is not None and nwp_tc is not None:
                delta_t = abs(float(local_tc) - float(nwp_tc))
                if delta_t > 8.0:
                    flags.append(f"temperature: local {local_tc:.1f}°C vs NWP {nwp_tc:.1f}°C (Δ={delta_t:.1f}°C > 8°C)")
            if local_rh is not None and nwp_rh is not None:
                delta_rh = abs(float(local_rh) - float(nwp_rh))
                if delta_rh > 25.0:
                    flags.append(f"humidity: local {local_rh:.0f}% vs NWP {nwp_rh:.0f}% (Δ={delta_rh:.0f}% > 25%)")
            if local_press is not None and nwp_press is not None:
                delta_p = abs(float(local_press) - float(nwp_press))
                if delta_p > 15.0:
                    flags.append(
                        f"pressure: local {local_press:.1f} hPa vs NWP {nwp_press:.1f} hPa (Δ={delta_p:.1f} > 15 hPa)"
                    )
        data[KEY_NEIGHBOR_QC] = flags

    async def _async_maybe_refresh_climate_normals(self) -> None:
        """Fetch/rebuild the day-of-year climate normals table if stale.  (v2.7)

        One Open-Meteo archive-api call spanning CLIMATE_NORMALS_LOOKBACK_YEARS
        years, parsed and binned into 365 day-of-year buckets. Cheap to skip:
        only runs if there's no cached table yet, or the cached one is older
        than CLIMATE_NORMALS_REFRESH_DAYS - climate normals don't meaningfully
        change day to day, so this is not on the hourly/60s cadence like the
        other fetches.
        """
        from .const import CLIMATE_NORMALS_LOOKBACK_YEARS, CLIMATE_NORMALS_REFRESH_DAYS, CLIMATE_NORMALS_WINDOW_DAYS

        if self._climate_normals and self._climate_normals_fetched_at:
            try:
                fetched = dt_util.parse_datetime(self._climate_normals_fetched_at)
                if fetched and (dt_util.utcnow() - fetched).days < CLIMATE_NORMALS_REFRESH_DAYS:
                    return  # still fresh
            except (TypeError, ValueError):
                pass

        lat = self.forecast_lat
        lon = self.forecast_lon
        if lat is None or lon is None:
            return
        try:
            from .climate_normals import compute_climate_normals, parse_archive_daily_response

            end = dt_util.now().date() - timedelta(days=1)  # archive API lags a few days behind "today"
            # timedelta rather than replace(year=...): avoids a Feb-29 ValueError
            # if `end` happens to land on a leap day and year-N isn't a leap year.
            start = end - timedelta(days=365 * CLIMATE_NORMALS_LOOKBACK_YEARS)
            url = (
                "https://archive-api.open-meteo.com/v1/archive"
                f"?latitude={lat:.4f}&longitude={lon:.4f}"
                f"&start_date={start.isoformat()}&end_date={end.isoformat()}"
                "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
                "&timezone=auto"
            )
            session = async_get_clientsession(self.hass)
            async with session.get(url, timeout=60) as resp:
                if resp.status != 200:
                    _LOGGER.warning("ws_core: climate normals fetch HTTP %s", resp.status)
                    return
                payload = await resp.json()
            records = parse_archive_daily_response(payload)
            if not records:
                _LOGGER.warning("ws_core: climate normals fetch returned no daily records")
                return
            normals = compute_climate_normals(records, window_days=CLIMATE_NORMALS_WINDOW_DAYS)
            if not normals:
                return
            self._climate_normals = normals
            self._climate_normals_fetched_at = dt_util.utcnow().isoformat()
            self._climate_normals_years = CLIMATE_NORMALS_LOOKBACK_YEARS
            if self._climate_normals_store is not None:
                await self._climate_normals_store.async_save(
                    {
                        "normals": normals,
                        "fetched_at": self._climate_normals_fetched_at,
                        "years": self._climate_normals_years,
                    }
                )
            _LOGGER.info(
                "ws_core: climate normals refreshed (%d day-of-year buckets, %d years of history)",
                len(normals),
                CLIMATE_NORMALS_LOOKBACK_YEARS,
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("ws_core: climate normals fetch failed (will retry tomorrow): %s", err)

    def _compute_climate_normal_anomaly(self, data: dict, tc: float | None, rain_today_mm: float | None) -> None:
        """Compare today against the historical day-of-year normal.  (v2.7)

        Distinct from KEY_TEMP_ANOMALY_30D/90D (self-referential, vs. this
        station's own recent rolling average): this is vs. the long-term
        historical average for today's specific calendar date.
        """
        if not self.climate_normals_enabled or not self._climate_normals:
            return
        from .climate_normals import climate_normal_for_date

        normal = climate_normal_for_date(self._climate_normals, dt_util.now().date())
        data[KEY_CLIMATE_NORMALS_YEARS] = self._climate_normals_years
        data[KEY_CLIMATE_NORMALS_FETCHED] = self._climate_normals_fetched_at or None
        if not normal:
            return

        t_high = normal.get("t_high")
        t_low = normal.get("t_low")
        rain_normal = normal.get("rain")
        data[KEY_TEMP_HIGH_NORMAL] = t_high
        data[KEY_TEMP_LOW_NORMAL] = t_low
        data[KEY_RAIN_NORMAL_MM] = rain_normal

        if tc is not None and t_high is not None and t_low is not None:
            normal_mean = round((float(t_high) + float(t_low)) / 2.0, 1)
            data[KEY_TEMP_ANOMALY_NORMAL] = round(float(tc) - normal_mean, 1)
        if rain_today_mm is not None and rain_normal is not None:
            data[KEY_RAIN_ANOMALY_NORMAL] = round(float(rain_today_mm) - float(rain_normal), 1)

    def _compute_data_quality_score(self, data: dict) -> None:
        """Compute overall data quality score (0-100) and stuck-sensor flags.  (v2.0)"""
        stuck_flags: list[str] = []

        # Stuck-at detection: check if key sensors have the same value as the last cycle.
        # We compare against saved '_prev' values in data (set each cycle).
        for src_key, data_key, threshold in [
            (SRC_TEMP, KEY_NORM_TEMP_C, 0.01),
            (SRC_HUM, KEY_NORM_HUMIDITY, 0.1),
            (SRC_PRESS, KEY_NORM_PRESSURE_HPA, 0.01),
        ]:
            curr = data.get(data_key)
            prev_key = f"_prev_{data_key}"
            prev = data.get(prev_key)
            if curr is not None and prev is not None:
                if abs(float(curr) - float(prev)) < threshold:
                    # Also require that the sensor has been "stuck" for at least one prior cycle
                    stuck_count_key = f"_stuck_count_{data_key}"
                    stuck_count = data.get(stuck_count_key, 0) + 1
                    data[stuck_count_key] = stuck_count
                    if stuck_count >= 3:  # ≥3 consecutive identical readings
                        stuck_flags.append(src_key)
                else:
                    data[f"_stuck_count_{data_key}"] = 0
            # Always record current as next cycle's prev
            if curr is not None:
                data[f"_prev_{data_key}"] = curr

        data[KEY_SENSOR_STUCK] = stuck_flags

        # Temporal spike detection: flag readings > Nσ from the rolling mean.
        spike_flags: list[str] = []
        for label, data_key in (
            ("temp", KEY_NORM_TEMP_C),
            ("humidity", KEY_NORM_HUMIDITY),
            ("pressure", KEY_NORM_PRESSURE_HPA),
        ):
            curr = data.get(data_key)
            hist = self._spike_history.get(label)
            if curr is not None and hist is not None:
                if len(hist) >= SPIKE_MIN_SAMPLES:
                    mean = sum(hist) / len(hist)
                    variance = sum((x - mean) ** 2 for x in hist) / len(hist)
                    sigma = variance**0.5
                    if sigma > 1e-6 and abs(float(curr) - mean) > SPIKE_SIGMA_THRESHOLD * sigma:
                        spike_flags.append(
                            f"{label}: {float(curr):.1f} is {abs(float(curr) - mean) / sigma:.1f}σ from mean {mean:.1f}"
                        )
                # Append after the test so the current spike doesn't poison the window
                hist.append(float(curr))
        data[KEY_SENSOR_SPIKE] = spike_flags

        # Per-sensor stuck flags for binary sensors
        data["_temp_stuck"] = (
            KEY_NORM_TEMP_C.replace("norm_temperature_c", "temperature") in stuck_flags or SRC_TEMP in stuck_flags
        )
        data["_humidity_stuck"] = SRC_HUM in stuck_flags
        data["_pressure_stuck"] = SRC_PRESS in stuck_flags

        # Per-sensor out-of-range from quality flags (parse the existing list)
        quality_flags = data.get(KEY_SENSOR_QUALITY_FLAGS) or []
        data["_temp_out_of_range"] = any("temperature" in f.lower() and "outside" in f.lower() for f in quality_flags)
        data["_humidity_out_of_range"] = any("humidity" in f.lower() and "outside" in f.lower() for f in quality_flags)
        data["_pressure_out_of_range"] = any("pressure" in f.lower() and "outside" in f.lower() for f in quality_flags)
        data["_wind_gust_below_wind"] = any("gust" in f.lower() and "below" in f.lower() for f in quality_flags)
        data["_dew_exceeds_temp"] = any("dew" in f.lower() and "exceeds" in f.lower() for f in quality_flags)

        # Score: start at 100, deduct for issues
        score = 100
        existing_flags = data.get(KEY_SENSOR_QUALITY_FLAGS) or []
        score -= min(40, len(existing_flags) * 10)  # range/consistency flags
        score -= min(30, len(stuck_flags) * 15)  # stuck sensors
        existing_drift = data.get(KEY_SENSOR_DRIFT_FLAGS) or []
        score -= min(20, len(existing_drift) * 10)  # drift
        neighbor_flags = data.get(KEY_NEIGHBOR_QC) or []
        score -= min(20, len(neighbor_flags) * 10)  # spatial neighbor QC
        score -= min(15, len(spike_flags) * 8)  # temporal spikes
        if data.get(KEY_PACKAGE_STATUS) not in (None, "ok"):
            score -= 10
        data[KEY_DATA_QUALITY_SCORE] = max(0, min(100, score))

    def _discover_blitzortung(self) -> None:
        """Scan the entity registry for Blitzortung integration entities.

        Used as an automatic fallback source for lightning count and distance
        when no physical sensor is mapped by the user.
        """
        from homeassistant.helpers import entity_registry as er  # local import to avoid circular

        registry = er.async_get(self.hass)
        for entry in registry.entities.values():
            eid = entry.entity_id
            # Match by platform name OR entity_id prefix (covers renamed/forked installs)
            if entry.platform != "blitzortung" and not eid.startswith("sensor.blitzortung_"):
                continue
            # Coerce unique_id to str before .lower(): some integrations (e.g. nuki)
            # store unique_id as an int, which would otherwise raise AttributeError.
            uid = str(entry.unique_id or "").lower()
            if SRC_LIGHTNING_COUNT not in self._blitzortung_sources and (
                "counter" in uid or "count" in uid or "counter" in eid or "count" in eid
            ):
                self._blitzortung_sources[SRC_LIGHTNING_COUNT] = eid
                _LOGGER.debug("Blitzortung lightning counter auto-detected: %s", eid)
            if SRC_LIGHTNING_DISTANCE not in self._blitzortung_sources and ("distance" in uid or "distance" in eid):
                self._blitzortung_sources[SRC_LIGHTNING_DISTANCE] = eid
                _LOGGER.debug("Blitzortung lightning distance auto-detected: %s", eid)
            if SRC_LIGHTNING_AZIMUTH not in self._blitzortung_sources and ("azimuth" in uid or "azimuth" in eid):
                self._blitzortung_sources[SRC_LIGHTNING_AZIMUTH] = eid
                _LOGGER.debug("Blitzortung lightning azimuth auto-detected: %s", eid)

    def _compute_lightning(self, data: dict, now: Any) -> None:
        """Derive lightning sensors from optional strike count + distance inputs.  (v2.0)"""
        if not self.lightning_enabled:
            return

        # Retry Blitzortung discovery on every tick until at least count or distance is found;
        # the initial __init__ call may run before Blitzortung has registered its entities.
        if len(self._blitzortung_sources) < 1:
            self._discover_blitzortung()

        # Use physical sensor if mapped; fall back to auto-detected Blitzortung entity
        count_raw = self._num(
            self.hass,
            self.sources.get(SRC_LIGHTNING_COUNT) or self._blitzortung_sources.get(SRC_LIGHTNING_COUNT),
        )
        dist_raw = self._num(
            self.hass,
            self.sources.get(SRC_LIGHTNING_DISTANCE) or self._blitzortung_sources.get(SRC_LIGHTNING_DISTANCE),
        )
        azimuth_raw = self._num(
            self.hass,
            self.sources.get(SRC_LIGHTNING_AZIMUTH) or self._blitzortung_sources.get(SRC_LIGHTNING_AZIMUTH),
        )

        # Strike distance and azimuth passthrough
        if dist_raw is not None:
            data[KEY_LIGHTNING_DISTANCE_KM] = round(float(dist_raw), 1)
        if azimuth_raw is not None:
            data[KEY_LIGHTNING_AZIMUTH] = int(float(azimuth_raw))
        if dist_raw is not None:
            prox_km = self._lightning_proximity_km
            data[KEY_LIGHTNING_PROXIMITY] = "near" if float(dist_raw) <= prox_km else "clear"

        # 1h rolling strike count (accumulates increases in cumulative counter)
        if count_raw is not None:
            if self._lightning_last_count is not None:
                delta = float(count_raw) - float(self._lightning_last_count)
                if delta > 0:
                    self._lightning_last_strike_ts = now
                    # Record each delta as (now, delta) in the 1h window
                    self._append_and_prune_24h(self._lightning_count_history_1h, now, delta)
            self._lightning_last_count = float(count_raw)

            # Prune 1h window
            cutoff_1h = now - timedelta(hours=1)
            while self._lightning_count_history_1h and self._lightning_count_history_1h[0][0] < cutoff_1h:
                self._lightning_count_history_1h.popleft()

            count_1h = sum(v for _, v in self._lightning_count_history_1h)
            data[KEY_LIGHTNING_COUNT_1H] = int(count_1h)
            # Rate in strikes/min over the 1h window
            data[KEY_LIGHTNING_RATE_1H] = round(count_1h / 60.0, 2)

        # Clearance timer (minutes since last detected strike)
        if self._lightning_last_strike_ts is not None:
            elapsed_min = (now - self._lightning_last_strike_ts).total_seconds() / 60.0
            data[KEY_LIGHTNING_CLEARANCE_MIN] = round(elapsed_min, 0)

    def _compute_health(self, data: dict, now: Any, missing: list, missing_entities: list) -> None:
        """Staleness, package status, data quality, configurable alerts."""
        stale = []
        for k, eid in self.sources.items():
            if not eid:
                continue
            # Only check frequently-updating core sensors for staleness.
            # Exclude rain_total (static when dry), UV (zero at night), battery
            # (slow-reporting), etc.
            if k not in STALENESS_CHECK_SOURCES:
                continue
            st = self.hass.states.get(eid)
            if st is None:
                continue
            if (now - st.last_updated).total_seconds() > self.staleness_s:
                stale.append(k)

        n_unavailable = len(missing_entities)
        n_healthy = len(self.sources) - n_unavailable - len(stale)

        station_health = (
            "offline"
            if n_unavailable >= 3
            else "online"
            if n_healthy >= len(REQUIRED_SOURCES)
            else "degraded"
            if n_healthy >= 1
            else "stale"
        )
        health_color = {
            "online": "rgba(74,222,128,0.8)",
            "degraded": "rgba(251,191,36,0.9)",
            "stale": "rgba(249,115,22,0.9)",
            "offline": "rgba(239,68,68,0.9)",
        }.get(station_health, "rgba(239,68,68,0.9)")

        data[KEY_HEALTH_DISPLAY] = station_health
        data["_health_color"] = health_color

        ok = not missing and not missing_entities
        parts: list[str] = []
        if missing:
            parts.append("Missing mappings: " + ", ".join(missing))
        if missing_entities:
            parts.append("Entities not found: " + ", ".join(missing_entities))
        if stale:
            parts.append("Stale: " + ", ".join(stale))
        data[KEY_PACKAGE_OK] = bool(ok)
        data[KEY_PACKAGE_STATUS] = " | ".join(parts) if parts else "ok"

        if missing or missing_entities:
            dq = "ERROR: Weather station not configured (missing sources)"
        elif stale:
            dq = f"WARN: Stale data from {', '.join(stale)}"
        else:
            dq = "ok"
        data[KEY_DATA_QUALITY] = dq

        # Configurable alerts with hysteresis to prevent chatty automations
        gust_thr = float(self.entry_options.get(CONF_THRESH_WIND_GUST_MS, DEFAULT_THRESH_WIND_GUST_MS))
        rain_thr = float(self.entry_options.get(CONF_THRESH_RAIN_RATE_MMPH, DEFAULT_THRESH_RAIN_RATE_MMPH))
        freeze_thr = float(self.entry_options.get(CONF_THRESH_FREEZE_C, DEFAULT_THRESH_FREEZE_C))

        gust_ms = data.get(KEY_NORM_WIND_GUST_MS)
        rain_rate = data.get(KEY_RAIN_RATE_FILT) or 0.0
        tc = data.get(KEY_NORM_TEMP_C)

        lang = self.hass.config.language

        # Raw trigger flags \u2014 one per alert type (before hysteresis)
        raw_triggers: dict[str, dict] = {}
        if gust_ms is not None and float(gust_ms) >= gust_thr:
            raw_triggers["wind"] = {
                "type": "wind",
                "severity": "warning",
                "message": localize.alert(lang, "wind", v=f"{float(gust_ms):.1f}"),
                "icon": "mdi:weather-windy",
                "color": "rgba(239,68,68,0.9)",
            }
        if float(rain_rate) >= rain_thr:
            raw_triggers["rain"] = {
                "type": "rain",
                "severity": "warning",
                "message": localize.alert(lang, "rain", v=f"{float(rain_rate):.1f}"),
                "icon": "mdi:weather-pouring",
                "color": "rgba(59,130,246,0.9)",
            }
        if tc is not None and float(tc) <= freeze_thr:
            raw_triggers["freeze"] = {
                "type": "freeze",
                "severity": "advisory",
                "message": localize.alert(lang, "freeze", v=f"{float(tc):.1f}"),
                "icon": "mdi:snowflake-alert",
                "color": "rgba(147,197,253,0.9)",
            }

        # Apply hysteresis: alert fires after ALERT_DEBOUNCE_ON_TICKS consecutive
        # ticks above threshold and clears after ALERT_DEBOUNCE_OFF_TICKS consecutive
        # ticks below threshold.  This prevents chatty automations from sensor noise.
        for alert_type in ("wind", "rain", "freeze"):
            if alert_type in raw_triggers:
                self._alert_debounce_raw[alert_type] = self._alert_debounce_raw.get(alert_type, 0) + 1
                self._alert_debounce_clear[alert_type] = 0
                if self._alert_debounce_raw[alert_type] >= ALERT_DEBOUNCE_ON_TICKS:
                    self._alert_active[alert_type] = True
            else:
                self._alert_debounce_clear[alert_type] = self._alert_debounce_clear.get(alert_type, 0) + 1
                self._alert_debounce_raw[alert_type] = 0
                if self._alert_debounce_clear[alert_type] >= ALERT_DEBOUNCE_OFF_TICKS:
                    self._alert_active[alert_type] = False

        active_alerts: list[dict] = [
            info for alert_type, info in raw_triggers.items() if self._alert_active.get(alert_type, False)
        ]

        if active_alerts:
            # Highest severity wins for state; warnings > advisories
            has_warning = any(a["severity"] == "warning" for a in active_alerts)
            alert_state = "warning" if has_warning else "advisory"
            alert_msg = " | ".join(a["message"] for a in active_alerts)
            # Use the highest-severity alert for icon/color
            primary = next((a for a in active_alerts if a["severity"] == "warning"), active_alerts[0])
            data["_alert_icon"] = primary["icon"]
            data["_alert_color"] = primary["color"]
        else:
            alert_state = "clear"
            alert_msg = localize.alert(lang, "clear")
            data["_alert_icon"] = "mdi:check-circle-outline"
            data["_alert_color"] = "rgba(74,222,128,0.8)"

        data[KEY_ALERT_STATE] = alert_state
        data[KEY_ALERT_MESSAGE] = alert_msg
        data["_active_alerts"] = active_alerts

        # HA Repairs integration: create/clear issues for missing sources
        if HAS_REPAIRS:
            from .const import DOMAIN

            if self.suppress_notifications:
                # User has disabled notifications - clear any existing issues immediately
                ir.async_delete_issue(self.hass, DOMAIN, "missing_source_entities")
                ir.async_delete_issue(self.hass, DOMAIN, "stale_sensors")
                ir.async_delete_issue(self.hass, DOMAIN, "forecast_api_failures")
                ir.async_delete_issue(self.hass, DOMAIN, "stuck_sensors")
                ir.async_delete_issue(self.hass, DOMAIN, "sensor_drift_detected")
            else:
                if missing_entities:
                    ir.async_create_issue(
                        self.hass,
                        DOMAIN,
                        "missing_source_entities",
                        is_fixable=False,
                        severity=ir.IssueSeverity.ERROR,
                        translation_key="missing_source_entities",
                        translation_placeholders={"entities": ", ".join(missing_entities)},
                    )
                else:
                    ir.async_delete_issue(self.hass, DOMAIN, "missing_source_entities")

                if stale:
                    ir.async_create_issue(
                        self.hass,
                        DOMAIN,
                        "stale_sensors",
                        is_fixable=False,
                        severity=ir.IssueSeverity.WARNING,
                        translation_key="stale_sensors",
                        translation_placeholders={"sensors": ", ".join(stale)},
                    )
                else:
                    ir.async_delete_issue(self.hass, DOMAIN, "stale_sensors")

                if self.runtime.forecast_consecutive_failures >= 3:
                    provider = get_provider(self.forecast_provider)
                    ir.async_create_issue(
                        self.hass,
                        DOMAIN,
                        "forecast_api_failures",
                        is_fixable=False,
                        severity=ir.IssueSeverity.WARNING,
                        translation_key="forecast_api_failures",
                        translation_placeholders={
                            "failures": str(self.runtime.forecast_consecutive_failures),
                            "provider": provider.PROVIDER_NAME,
                        },
                    )
                else:
                    ir.async_delete_issue(self.hass, DOMAIN, "forecast_api_failures")

                # Stuck sensors (data quality; gated on CONF_ENABLE_DIAGNOSTICS not
                # required — hardware failures affect all users)
                stuck_flags = data.get(KEY_SENSOR_STUCK) or []
                if stuck_flags:
                    ir.async_create_issue(
                        self.hass,
                        DOMAIN,
                        "stuck_sensors",
                        is_fixable=False,
                        severity=ir.IssueSeverity.WARNING,
                        translation_key="stuck_sensors",
                        translation_placeholders={"sensors": ", ".join(str(s) for s in stuck_flags)},
                    )
                else:
                    ir.async_delete_issue(self.hass, DOMAIN, "stuck_sensors")

                # Drifting sensors
                drift_status = data.get(KEY_SENSOR_DRIFT_FLAGS)
                drift_details = data.get("_drift_details") or []
                if drift_status == "warning" and drift_details:
                    ir.async_create_issue(
                        self.hass,
                        DOMAIN,
                        "sensor_drift_detected",
                        is_fixable=False,
                        severity=ir.IssueSeverity.WARNING,
                        translation_key="sensor_drift_detected",
                        translation_placeholders={"sensors": ", ".join(str(s) for s in drift_details)},
                    )
                else:
                    ir.async_delete_issue(self.hass, DOMAIN, "sensor_drift_detected")

    # ------------------------------------------------------------------
    # v1.2.0 - Fog, precipitation type, thunderstorm index
    # ------------------------------------------------------------------

    def _compute_fog_and_thunderstorm(
        self,
        data: dict,
        now: Any,
        tc: float | None,
        dew_c: float | None,
        wind_ms: float | None,
        rain_rate: float,
    ) -> None:
        """Fog probability and thunderstorm risk.

        v0.3.0: precipitation_type removed (was redundant with rain_rate +
        temperature; trivially derivable in dashboard if needed).
        """
        sun_state = self.hass.states.get("sun.sun")
        is_day = True
        if sun_state:
            is_day = sun_state.state == "above_horizon"
        is_night = not is_day

        # ── Fog probability ────────────────────────────────────────────────
        if self.fog_enabled and tc is not None and dew_c is not None:
            prob, label = fog_probability(
                float(tc),
                float(dew_c),
                float(wind_ms or 0),
                float(rain_rate),
                is_night,
            )
            data[KEY_FOG_PROBABILITY] = prob
            data["_fog_risk_level"] = label
            data["_fog_dew_point_depression"] = round(float(tc) - float(dew_c), 1)

        # ── Thunderstorm risk ──────────────────────────────────────────────
        if self.thunderstorm_enabled and tc is not None and dew_c is not None:
            lux_now = data.get(KEY_LUX)
            wind_now = data.get(KEY_NORM_WIND_SPEED_MS)
            trend = data.get(KEY_PRESSURE_TREND_HPAH, 0.0)

            # Update 1-hour history buffers
            if self._lux_1h_ts is None or (now - self._lux_1h_ts).total_seconds() >= 3600:
                self._lux_1h_ago = lux_now
                self._lux_1h_ts = now
            if self._wind_ms_1h_ts is None or (now - self._wind_ms_1h_ts).total_seconds() >= 3600:
                self._wind_ms_1h_ago = wind_now
                self._wind_ms_1h_ts = now

            idx, level, factors = thunderstorm_risk_index(
                temp_c=float(tc),
                dew_c=float(dew_c),
                pressure_trend_3h=float(trend),
                wind_ms=float(wind_now or 0),
                wind_ms_1h_ago=self._wind_ms_1h_ago,
                lux_current=float(lux_now) if lux_now is not None else None,
                lux_1h_ago=float(self._lux_1h_ago) if self._lux_1h_ago is not None else None,
                is_day=is_day,
            )
            data[KEY_THUNDERSTORM_RISK] = idx
            data["_thunderstorm_level"] = level
            data["_thunderstorm_factors"] = factors
            data["_thunderstorm_caveat"] = (
                "Surface proxy only. No upper-air data. Many false positives possible on hot/humid days."
            )

    # ------------------------------------------------------------------
    # v1.2.0 - GDD accumulation, streak counters
    # ------------------------------------------------------------------

    def _compute_frost_risk(self, data: dict, tc: float | None) -> None:
        if tc is None:
            return

        forecast = data.get(KEY_FORECAST)
        forecast_min = None
        if forecast and isinstance(forecast, dict) and forecast.get("daily"):
            daily = forecast["daily"]
            if len(daily) > 0:
                forecast_min = daily[0].get("templow")
                if forecast_min is None:
                    forecast_min = daily[0].get("temperature")

        min_temp = float(tc)
        if forecast_min is not None:
            min_temp = min(min_temp, float(forecast_min))

        if min_temp < 0:
            data[KEY_FROST_RISK] = "high"
        elif min_temp < 2:
            data[KEY_FROST_RISK] = "probable"
        elif min_temp < 4:
            data[KEY_FROST_RISK] = "unlikely"
        else:
            data[KEY_FROST_RISK] = "no_risk"

    def _compute_streaks(self, data: dict, now: Any) -> None:
        """Update dry/heat/frost streak counters (RestoreEntity-backed in v0.3.0).

        Cut from the previous _compute_gdd_and_streaks: GDD/HDD/CDD computation
        was removed in v0.3.0 because the baselines were never properly seeded
        (they reset to install date rather than Jan 1 / season start).
        """
        from .learning_state import update_daily_streaks

        t_high = data.get(KEY_TEMP_HIGH_24H)
        t_low = data.get(KEY_TEMP_LOW_24H)

        # Streaks are evaluated for the COMPLETED calendar day, using that day's
        # final rain total snapshotted at the midnight rollover. This fixes two
        # bugs (issue #15):
        #   1. Reading the freshly-reset current-day rain (~0) right after
        #      midnight, so a rainy day never reset the dry streak.
        #   2. Re-counting the same day after a restart, because the guard was
        #      an in-memory field that reset on reload.
        # The guard (streak_last_counted_date) is now persisted in LearningState.
        prev_date = self._rain_prev_day_date
        if (
            prev_date
            and prev_date != self._learning_state.streak_last_counted_date
            and t_high is not None
            and t_low is not None
        ):
            rain_completed = float(self._rain_prev_day_mm)
            thresh_freeze = float(self.entry_options.get(CONF_THRESH_FREEZE_C, DEFAULT_THRESH_FREEZE_C))
            update_daily_streaks(
                self._learning_state,
                prev_date,
                t_high=float(t_high),
                t_low=float(t_low),
                rain_today_mm=rain_completed,
                thresh_heat_c=self.thresh_heat_day_c,
                thresh_freeze_c=thresh_freeze,
            )
            self._learning_state.streak_last_counted_date = prev_date
            # Also update climatology (30-day rolling buffer for anomalies)
            from .learning_state import update_climatology

            update_climatology(self._learning_state, prev_date, float(t_high), float(t_low), rain_completed)

        # Publish streak counters
        data[KEY_DRY_STREAK] = self._learning_state.dry_streak_days
        data["_dry_streak_last_rain"] = self._learning_state.dry_streak_last_rain_date
        data[KEY_HEAT_STREAK] = self._learning_state.heat_streak_days
        data["_heat_streak_threshold_c"] = self.thresh_heat_day_c
        data[KEY_FROST_STREAK] = self._learning_state.frost_streak_days
        data["_frost_streak_threshold_c"] = float(self.entry_options.get(CONF_THRESH_FREEZE_C, DEFAULT_THRESH_FREEZE_C))

        # All-time longest streak ever recorded (issue #127); never resets.
        data[KEY_DRY_STREAK_RECORD] = self._learning_state.dry_streak_record
        data[KEY_HEAT_STREAK_RECORD] = self._learning_state.heat_streak_record
        data[KEY_FROST_STREAK_RECORD] = self._learning_state.frost_streak_record

    # ------------------------------------------------------------------
    # v1.2.0 - 30-day rolling climatology
    # ------------------------------------------------------------------

    def _compute_climatology(self, data: dict) -> None:
        """Publish rolling 30-day stats and today-vs-normal anomalies."""
        from .learning_state import climatology_stats, climatology_stats_by_window

        stats = climatology_stats(self._learning_state)
        if stats is None:
            data[KEY_CLIMATOLOGY_30D] = "building"
            return

        data[KEY_CLIMATOLOGY_30D] = stats.get("n_days", 0)
        data["_climatology_stats"] = stats

        # Anomaly sensors (D2)
        tc = data.get(KEY_NORM_TEMP_C)
        avg_high = stats.get("temp_high_avg")
        avg_low = stats.get("temp_low_avg")
        if tc is not None and avg_high is not None and avg_low is not None:
            normal_mean = round((float(avg_high) + float(avg_low)) / 2.0, 1)
            data[KEY_TEMP_ANOMALY_30D] = round(float(tc) - normal_mean, 1)
            data["_temp_normal_30d"] = normal_mean

        rain_avg = stats.get("rain_total_avg_day")
        rain_today = data.get("_rain_today_mm")
        if rain_today is not None and rain_avg is not None:
            data[KEY_RAIN_ANOMALY_30D] = round(float(rain_today) - float(rain_avg), 1)
            data["_rain_normal_30d_avg"] = rain_avg

        # 90-day anomaly (requires ≥60 days of data for meaningful stats)
        if len(self._learning_state.climatology_days) >= 60:
            stats_90d = climatology_stats_by_window(self._learning_state, 90)
            if stats_90d:
                data[KEY_CLIMATOLOGY_90D] = stats_90d
                # Anomaly = current 30d mean vs 90d "normal" baseline
                stats_baseline = stats_90d  # full 90d as normal
                stats_recent = climatology_stats_by_window(self._learning_state, 30)  # last 30d
                if stats_recent and stats_baseline:
                    baseline_high = stats_baseline.get("temp_high_avg")
                    baseline_low = stats_baseline.get("temp_low_avg")
                    recent_high = stats_recent.get("temp_high_avg")
                    recent_low = stats_recent.get("temp_low_avg")
                    if (
                        baseline_high is not None
                        and baseline_low is not None
                        and recent_high is not None
                        and recent_low is not None
                    ):
                        data[KEY_TEMP_ANOMALY_90D] = round(
                            (float(recent_high) + float(recent_low)) / 2
                            - (float(baseline_high) + float(baseline_low)) / 2,
                            1,
                        )
                    baseline_rain = stats_baseline.get("rain_total_avg_day")
                    recent_rain = stats_recent.get("rain_total_avg_day")
                    if baseline_rain is not None and recent_rain is not None:
                        data[KEY_RAIN_ANOMALY_90D] = round(float(recent_rain) - float(baseline_rain), 1)

    # ------------------------------------------------------------------
    # v1.2.0 - Sensor drift detection (C1)
    # ------------------------------------------------------------------

    def _compute_drift_detection(self, data: dict, now: Any) -> None:
        """Detect slow monotonic sensor trends that indicate hardware faults."""
        tc = data.get(KEY_NORM_TEMP_C)
        rh = data.get(KEY_NORM_HUMIDITY)
        pres = data.get(KEY_NORM_PRESSURE_HPA)
        rain_r = data.get(KEY_RAIN_RATE_FILT, 0.0)

        # Append to drift buffers (one sample per compute call, ~1 min intervals)
        if tc is not None:
            self._drift_temp.append((now, float(tc)))
        if rh is not None:
            self._drift_humidity.append((now, float(rh)))
        if pres is not None:
            self._drift_pressure.append((now, float(pres)))
        if rain_r is not None:
            self._drift_rain_rate.append((now, float(rain_r)))

        flags: list[dict] = []

        def _check_slope(buf, max_slope_abs: float, r_sq_thresh: float, sensor_name: str, unit: str) -> None:
            if len(buf) < 20:
                return
            first_ts = buf[0][0]
            vals = [v for _, v in buf]
            times_h = [(ts - first_ts).total_seconds() / 3600.0 for ts, _ in buf]
            slope, r_sq = linear_regression_slope(vals, times_h)
            if abs(slope) >= max_slope_abs and r_sq >= r_sq_thresh:
                flags.append(
                    {
                        "sensor": sensor_name,
                        "slope_per_h": round(slope, 4),
                        "r_squared": r_sq,
                        "unit": unit,
                        "direction": "rising" if slope > 0 else "falling",
                    }
                )

        _check_slope(self._drift_temp, DRIFT_SLOPE_TEMP_C_H, DRIFT_R_SQ_THRESH, "temperature", "°C/h")
        _check_slope(self._drift_humidity, DRIFT_SLOPE_HUMIDITY_PCT_H, DRIFT_R_SQ_THRESH, "humidity", "%/h")
        _check_slope(self._drift_pressure, DRIFT_SLOPE_PRESSURE_HPA_H, DRIFT_R_SQ_THRESH, "pressure", "hPa/h")

        # Stuck rain bucket: rain_rate non-zero but constant at same non-zero value for >4h
        if len(self._drift_rain_rate) >= DRIFT_STUCK_BUCKET_SAMPLES:
            recent_rates = [v for _, v in list(self._drift_rain_rate)[-DRIFT_STUCK_BUCKET_SAMPLES:]]
            nonzero = [r for r in recent_rates if r > DRIFT_STUCK_BUCKET_MIN_RATE]
            if len(nonzero) >= DRIFT_STUCK_BUCKET_SAMPLES * 0.8:
                rate_range = max(nonzero) - min(nonzero)
                if rate_range < DRIFT_STUCK_RATE_RANGE_MAX and len(nonzero) > 50:
                    flags.append(
                        {
                            "sensor": "rain_rate",
                            "slope_per_h": 0.0,
                            "r_squared": 1.0,
                            "unit": "mm/h",
                            "direction": "stuck",
                        }
                    )

        status = "warning" if flags else "ok"
        data[KEY_SENSOR_DRIFT_FLAGS] = status
        data["_drift_details"] = flags

    # ------------------------------------------------------------------
    # v1.2.0 - Cross-sensor consistency checks (C2)
    # ------------------------------------------------------------------

    def _compute_consistency_checks(self, data: dict, now: Any) -> None:
        """Check for physically impossible sensor combinations."""
        uv = data.get(KEY_UV)
        lux = data.get(KEY_LUX)
        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS)
        gust_ms = data.get(KEY_NORM_WIND_GUST_MS)
        tc = data.get(KEY_NORM_TEMP_C)
        dew_c = data.get(KEY_DEW_POINT_C)
        rain_rate = float(data.get(KEY_RAIN_RATE_FILT) or 0.0)

        # Track whether pressure is stuck (>8h within ±0.1 hPa while wind > 1 m/s)
        pres = data.get(KEY_NORM_PRESSURE_HPA)
        if pres is not None and (self._pressure_stuck_ref is None or abs(float(pres) - self._pressure_stuck_ref) > 0.1):
            self._pressure_stuck_ref = float(pres)
            self._pressure_stuck_start = now
        pressure_stuck = (
            self._pressure_stuck_start is not None
            and (now - self._pressure_stuck_start).total_seconds() > 8 * 3600
            and (wind_ms is not None and float(wind_ms) > 1.0)
        )

        # Track rain total increments vs rain rate
        rain_total = data.get(KEY_NORM_RAIN_TOTAL_MM)
        if rain_total is not None:
            if self._rain_total_for_consistency is not None:
                delta = float(rain_total) - self._rain_total_for_consistency
                if rain_rate > 0.1 and delta < 0.001:
                    if self._rain_rate_nonzero_since is None:
                        self._rain_rate_nonzero_since = now
                else:
                    self._rain_rate_nonzero_since = None
            self._rain_total_for_consistency = float(rain_total)
            self._rain_total_ts_consistency = now

        rain_total_not_incrementing = (
            self._rain_rate_nonzero_since is not None
            and (now - self._rain_rate_nonzero_since).total_seconds() > 30 * 60
        )

        flags = cross_sensor_consistency_flags(
            uv=uv,
            lux=lux,
            wind_ms=wind_ms,
            gust_ms=gust_ms,
            temp_c=tc,
            dew_c=dew_c,
            pressure_history_stable=pressure_stuck,
            rain_rate=rain_rate,
            rain_total_increasing=not rain_total_not_incrementing,
        )

        data[KEY_CONSISTENCY_FLAGS] = "warning" if flags else "ok"
        data["_consistency_details"] = flags

    # ------------------------------------------------------------------
    # Conditions summary — human-readable text for voice assistants
    # ------------------------------------------------------------------

    def _compute_conditions_summary(self, data: dict) -> None:
        """Compose a single-line current conditions string.

        Combines temperature, feels-like (when meaningfully different), rain,
        and wind into a terse sentence suitable for Alexa/Google/HA Assist and
        Lovelace display cards.
        """
        lang = self.hass.config.language
        parts: list[str] = []
        tc = data.get(KEY_NORM_TEMP_C)
        feels = data.get(KEY_FEELS_LIKE_C)
        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS)
        gust_ms = data.get(KEY_NORM_WIND_GUST_MS)
        wind_dir = data.get(KEY_WIND_QUADRANT)
        rain_rate = data.get(KEY_RAIN_RATE_FILT) or 0.0
        humidity = data.get(KEY_NORM_HUMIDITY)
        zambretti = data.get(KEY_ZAMBRETTI_FORECAST)

        if tc is not None:
            parts.append(f"{float(tc):.1f}°C")
            if feels is not None and abs(float(feels) - float(tc)) >= 2.0:
                parts.append(localize.summary(lang, "feels_like", v=f"{float(feels):.1f}"))

        if float(rain_rate) > 0:
            parts.append(localize.summary(lang, "rain", v=f"{float(rain_rate):.1f}"))
        elif zambretti and zambretti not in ("Settled fine", "Fine", "Becoming fine"):
            # Only include forecast if it's not obviously sunny
            pass  # zambretti already in forecast_tiles

        if wind_ms is not None and float(wind_ms) >= 1.0:
            wind_str = f"{float(wind_ms):.0f} m/s"
            if wind_dir:
                wind_str += f" {wind_dir}"
            if gust_ms is not None and float(gust_ms) >= float(wind_ms) * 1.5 and float(gust_ms) >= 5.0:
                wind_str += " " + localize.summary(lang, "gusting", v=f"{float(gust_ms):.0f}")
            parts.append(wind_str)

        if humidity is not None:
            parts.append(localize.summary(lang, "humidity", v=f"{float(humidity):.0f}"))

        data[KEY_CONDITIONS_SUMMARY] = ", ".join(parts) if parts else localize.summary(lang, "no_data")

    # ------------------------------------------------------------------
    # v1.2.0 - Learning sensors: publish EMA results into data dict
    # ------------------------------------------------------------------

    def _compute_learning_sensors(self, data: dict) -> None:
        """Publish learning state values into coordinator data.

        v0.3.0: METAR-gated cal_suggestion / learned_bias sensors removed
        with the rest of the METAR family. Only forecast skill and solar lux
        factor remain in the learning loop.
        """
        from .learning_state import brier_score as _bs
        from .learning_state import compute_blend_weights as _bw

        outcomes = self._learning_state.forecast_outcomes
        if len(outcomes) >= 10:
            bs_local = _bs(outcomes, "local_prob")
            bs_api = _bs(outcomes, "openmeteo_prob")
            wl, wa = _bw(outcomes)
            # Skill relative to naive climatology (~0.25 Brier for 50% events)
            skill_score = round(max(0.0, 1.0 - (((bs_local or 0.25) + (bs_api or 0.25)) / 2) / 0.25), 3)
            data[KEY_FORECAST_SKILL] = skill_score
            data["_forecast_skill_bs_local"] = bs_local
            data["_forecast_skill_bs_openmeteo"] = bs_api
            data["_forecast_blend_local"] = wl
            data["_forecast_blend_openmeteo"] = wa
            data["_forecast_skill_n_outcomes"] = len(outcomes)
            # Individual sensor keys (Task A)
            data[KEY_FORECAST_BRIER_LOCAL] = bs_local
            data[KEY_FORECAST_BRIER_API] = bs_api
            data[KEY_FORECAST_BLEND_WEIGHT_LOCAL] = round(wl * 100, 1)

        # Solar lux factor (always published)
        data[KEY_SOLAR_LUX_FACTOR] = self._learning_state.solar_lux_factor
        data["_solar_lux_factor_n_days"] = self._learning_state.solar_factor_n

        # v2.7 - Adaptive calibration bias (opt-in via enable_auto_calibration)
        if self.entry_options.get(CONF_ENABLE_AUTO_CALIBRATION, DEFAULT_ENABLE_AUTO_CALIBRATION):
            from .const import AUTO_CAL_MIN_SAMPLES

            ls = self._learning_state
            data[KEY_AUTO_CAL_BIAS_TEMP_C] = ls.cal_bias_temp_c
            data[KEY_AUTO_CAL_BIAS_HUMIDITY] = ls.cal_bias_humidity
            data[KEY_AUTO_CAL_BIAS_PRESSURE_HPA] = ls.cal_bias_pressure_hpa
            data[KEY_AUTO_CAL_N_SAMPLES] = ls.cal_bias_n
            data[KEY_AUTO_CAL_LAST_APPLIED] = ls.cal_last_auto_apply_date or None
            if ls.cal_bias_n < AUTO_CAL_MIN_SAMPLES:
                data[KEY_AUTO_CAL_STATUS] = "learning"
            elif ls.cal_last_auto_apply_date:
                data[KEY_AUTO_CAL_STATUS] = "adjusted"
            else:
                data[KEY_AUTO_CAL_STATUS] = "stable"

    # ------------------------------------------------------------------
    # v1.2.0 - Learning state persistence (called from _compute)
    # ------------------------------------------------------------------

    def _update_forecast_skill_window(self, data: dict, now: Any) -> None:
        """Track rolling 6-hour forecast outcomes for Brier skill scoring (A3)."""
        from .learning_state import record_forecast_outcome

        # Start a new window if none active
        if self._skill_window_start is None:
            self._skill_window_start = now
            self._skill_window_local_prob = data.get(KEY_RAIN_PROBABILITY)
            fc = getattr(self, "_forecast_cache", None)
            self._skill_window_api_prob = None
            if fc and fc.get("daily"):
                pp = (fc["daily"][0] or {}).get("precip_prob")
                if pp is not None:
                    self._skill_window_api_prob = float(pp)
            self._skill_window_rain_seen = False
            return

        # Track rain in this window
        rain_rate = float(data.get(KEY_RAIN_RATE_FILT) or 0.0)
        if rain_rate > 0.1:
            self._skill_window_rain_seen = True

        # Close window after 6h and record outcome
        window_age_h = (now - self._skill_window_start).total_seconds() / 3600.0
        if window_age_h >= 6.0:
            record_forecast_outcome(
                self._learning_state,
                local_prob=self._skill_window_local_prob,
                openmeteo_prob=self._skill_window_api_prob,
                rained=self._skill_window_rain_seen,
            )
            # Reset for next window
            self._skill_window_start = None

    async def _async_maybe_save_learning(self) -> None:
        """Save learning state at most once per LEARNING_SAVE_INTERVAL_S."""
        if self._learning_store is None:
            return
        now = dt_util.utcnow()
        if (
            self._learning_last_save is None
            or (now - self._learning_last_save).total_seconds() >= LEARNING_SAVE_INTERVAL_S
        ):
            from .learning_state import async_save_learning

            await async_save_learning(self._learning_store, self._learning_state)
            self._learning_last_save = now
            # Backstop save of history/accumulators on the same cadence, so a
            # hard crash (no clean async_stop) loses at most one interval.
            if self._history_store is not None:
                with contextlib.suppress(Exception):
                    await self._history_store.async_save(self._dump_history_state())

    # ------------------------------------------------------------------
    # v1.7.1 - rolling-window history + accumulator persistence (issue #16)
    # ------------------------------------------------------------------
    def _dump_history_state(self) -> dict[str, Any]:
        """Serialize rolling-window deques and daily accumulators for storage."""
        rt = self.runtime

        def _dq(history) -> list:
            out = []
            for ts, v in history:
                try:
                    out.append([ts.isoformat(), float(v)])
                except (AttributeError, TypeError, ValueError):
                    continue
            return out

        pts = rt.pressure_history_ts
        return {
            "temp_history_24h": _dq(rt.temp_history_24h),
            "gust_history_24h": _dq(rt.gust_history_24h),
            "rain_total_history_24h": _dq(rt.rain_total_history_24h),
            "rain_rate_history_24h": _dq(self._rain_rate_history_24h),
            "pressure_history": [float(v) for v in rt.pressure_history],
            "pressure_history_ts": pts.isoformat() if hasattr(pts, "isoformat") else None,
            "rain_today_mm": self._rain_today_mm,
            "rain_today_date": self._rain_today_date,
            "rain_today_last_total": self._rain_today_last_total,
            "rain_prev_day_mm": self._rain_prev_day_mm,
            "rain_prev_day_date": self._rain_prev_day_date,
            "wind_run_km": self._wind_run_km,
            "wind_run_date": self._wind_run_date,
            "wind_run_month_km": self._wind_run_month_km,
            "wind_run_month_key": self._wind_run_month_key,
            "chill_hours_today": self._chill_hours_today,
            "chill_hours_today_date": self._chill_hours_today_date,
            "chill_hours_season": self._chill_hours_season,
            "chill_hours_season_date": self._chill_hours_season_date,
            # v2.0 rain accumulators
            "rain_this_week_mm": self._rain_this_week_mm,
            "rain_this_week_isoweek": self._rain_this_week_isoweek,
            "rain_this_week_last_total": self._rain_this_week_last_total,
            "rain_this_month_mm": self._rain_this_month_mm,
            "rain_this_month_key": self._rain_this_month_key,
            "rain_this_month_last_total": self._rain_this_month_last_total,
            "rain_this_year_mm": self._rain_this_year_mm,
            "rain_this_year_key": self._rain_this_year_key,
            "rain_this_year_last_total": self._rain_this_year_last_total,
            # Yearly / all-time temperature extremes (issue #124)
            "temp_high_year": self._temp_high_year,
            "temp_low_year": self._temp_low_year,
            "temp_year_key": self._temp_year_key,
            "temp_high_all_time": self._temp_high_all_time,
            "temp_low_all_time": self._temp_low_all_time,
            # Weekly / monthly temperature extremes (issue #127)
            "temp_high_week": self._temp_high_week,
            "temp_low_week": self._temp_low_week,
            "temp_week_isoweek": self._temp_week_isoweek,
            "temp_high_month": self._temp_high_month,
            "temp_low_month": self._temp_low_month,
            "temp_month_key": self._temp_month_key,
            # Monthly / yearly / all-time wind gust max (issue #127)
            "gust_max_month": self._gust_max_month,
            "gust_month_key": self._gust_month_key,
            "gust_max_year": self._gust_max_year,
            "gust_year_key": self._gust_year_key,
            "gust_max_all_time": self._gust_max_all_time,
            # v2.0 degree-day accumulators (season totals must survive restarts)
            "hdd_today": self._hdd_today,
            "hdd_today_date": self._hdd_today_date,
            "hdd_today_samples": self._hdd_today_samples,
            "cdd_today": self._cdd_today,
            "cdd_today_date": self._cdd_today_date,
            "cdd_today_samples": self._cdd_today_samples,
            "gdd_today": self._gdd_today,
            "gdd_today_date": self._gdd_today_date,
            "hdd_season": self._hdd_season,
            "hdd_season_key": self._hdd_season_key,
            "cdd_season": self._cdd_season,
            "cdd_season_key": self._cdd_season_key,
            "gdd_season": self._gdd_season,
            "gdd_season_key": self._gdd_season_key,
            # v2.0 solar energy accumulation (Wh/m², resets at midnight)
            "solar_energy_today_whm2": self._solar_energy_today_whm2,
            "solar_energy_date": self._solar_energy_date,
            # v2.7 - snow accumulation (opt-in)
            "snow_today_cm": self._snow_today_cm,
            "snow_today_date": self._snow_today_date,
            "snow_this_month_cm": self._snow_this_month_cm,
            "snow_this_month_key": self._snow_this_month_key,
            "snow_this_year_cm": self._snow_this_year_cm,
            "snow_this_year_key": self._snow_this_year_key,
            "snowiest_day_cm": self._snowiest_day_cm,
            "snowiest_day_date": self._snowiest_day_date,
        }

    def _restore_history_state(self, data: dict[str, Any]) -> None:
        """Rehydrate rolling-window deques and daily accumulators on startup.

        24h deques are pruned to the trailing 24h. Daily accumulators are only
        restored when their saved date matches today (local), so they continue
        the current day instead of carrying a stale total into a new one.
        """
        if not data:
            return
        rt = self.runtime
        now = dt_util.utcnow()
        cutoff = now - timedelta(hours=24)

        def _load_dq(key: str) -> deque:
            out: deque = deque()
            for item in data.get(key) or []:
                try:
                    ts = datetime.fromisoformat(item[0])
                    v = float(item[1])
                except (ValueError, TypeError, IndexError):
                    continue
                if ts >= cutoff:
                    out.append((ts, v))
            return out

        rt.temp_history_24h = _load_dq("temp_history_24h")
        rt.gust_history_24h = _load_dq("gust_history_24h")
        rt.rain_total_history_24h = _load_dq("rain_total_history_24h")
        # v2.6.8 (issue #139): rain rate max 24h lives in a plain instance deque
        # rather than the runtime dataclass, and was missing from this restore
        # pair entirely - it always started empty on restart, so the very first
        # coordinator tick after restart replaced the sensor's restored display
        # value with a fresh single-sample "max" (whatever the current rain
        # rate happened to be), which looks like a reset to zero.
        self._rain_rate_history_24h = _load_dq("rain_rate_history_24h")

        ph: deque = deque(maxlen=PRESSURE_HISTORY_SAMPLES)
        for v in data.get("pressure_history") or []:
            try:
                ph.append(float(v))
            except (TypeError, ValueError):
                continue
        rt.pressure_history = ph
        pts = data.get("pressure_history_ts")
        try:
            rt.pressure_history_ts = datetime.fromisoformat(pts) if pts else None
        except (ValueError, TypeError):
            rt.pressure_history_ts = None

        today = dt_util.now().strftime("%Y-%m-%d")

        # Streak day-boundary snapshot (used by _compute_streaks); safe to restore always.
        self._rain_prev_day_mm = float(data.get("rain_prev_day_mm") or 0.0)
        self._rain_prev_day_date = data.get("rain_prev_day_date") or ""

        # Daily accumulators: continue only if still the same calendar day.
        if data.get("rain_today_date") == today:
            self._rain_today_mm = float(data.get("rain_today_mm") or 0.0)
            self._rain_today_date = today
            lt = data.get("rain_today_last_total")
            self._rain_today_last_total = float(lt) if lt is not None else None
        if data.get("wind_run_date") == today:
            self._wind_run_km = float(data.get("wind_run_km") or 0.0)
            self._wind_run_date = today
        # Monthly wind run: restore when still the same month
        this_month = dt_util.now().strftime("%Y-%m")
        if data.get("wind_run_month_key") == this_month:
            self._wind_run_month_km = float(data.get("wind_run_month_km") or 0.0)
            self._wind_run_month_key = this_month
        if data.get("chill_hours_today_date") == today:
            self._chill_hours_today = float(data.get("chill_hours_today") or 0.0)
            self._chill_hours_today_date = today
        # Season chill total persists across days; its own reset logic handles rollover.
        self._chill_hours_season = float(data.get("chill_hours_season") or 0.0)
        self._chill_hours_season_date = data.get("chill_hours_season_date") or ""

        # v2.0 rain accumulators: restore across restarts
        now_local = dt_util.now()
        iso_week = now_local.strftime("%G-W%V")
        month_key = now_local.strftime("%Y-%m")
        year_key = now_local.strftime("%Y")

        if data.get("rain_this_week_isoweek") == iso_week:
            self._rain_this_week_mm = float(data.get("rain_this_week_mm") or 0.0)
            self._rain_this_week_isoweek = iso_week
            lt = data.get("rain_this_week_last_total")
            self._rain_this_week_last_total = float(lt) if lt is not None else None
        if data.get("rain_this_month_key") == month_key:
            self._rain_this_month_mm = float(data.get("rain_this_month_mm") or 0.0)
            self._rain_this_month_key = month_key
            lt = data.get("rain_this_month_last_total")
            self._rain_this_month_last_total = float(lt) if lt is not None else None
        if data.get("rain_this_year_key") == year_key:
            self._rain_this_year_mm = float(data.get("rain_this_year_mm") or 0.0)
            self._rain_this_year_key = year_key
            lt = data.get("rain_this_year_last_total")
            self._rain_this_year_last_total = float(lt) if lt is not None else None

        # Yearly / all-time temperature extremes (issue #124): restored
        # unconditionally, even if the saved year_key is stale - the first
        # reading processed by _update_temp_year_all_time compares the saved
        # key against the current year and resets the yearly high/low itself
        # if a year boundary was crossed while HA was stopped. All-time
        # extremes are restored unconditionally and never reset.
        th_year = data.get("temp_high_year")
        self._temp_high_year = float(th_year) if th_year is not None else None
        tl_year = data.get("temp_low_year")
        self._temp_low_year = float(tl_year) if tl_year is not None else None
        self._temp_year_key = data.get("temp_year_key") or ""
        th_all = data.get("temp_high_all_time")
        self._temp_high_all_time = float(th_all) if th_all is not None else None
        tl_all = data.get("temp_low_all_time")
        self._temp_low_all_time = float(tl_all) if tl_all is not None else None

        # Weekly / monthly temperature extremes (issue #127): restore only
        # when still the same period, mirroring the rain week/month restore.
        if data.get("temp_week_isoweek") == iso_week:
            th_week = data.get("temp_high_week")
            self._temp_high_week = float(th_week) if th_week is not None else None
            tl_week = data.get("temp_low_week")
            self._temp_low_week = float(tl_week) if tl_week is not None else None
            self._temp_week_isoweek = iso_week
        if data.get("temp_month_key") == month_key:
            th_month = data.get("temp_high_month")
            self._temp_high_month = float(th_month) if th_month is not None else None
            tl_month = data.get("temp_low_month")
            self._temp_low_month = float(tl_month) if tl_month is not None else None
            self._temp_month_key = month_key

        # Monthly / yearly / all-time wind gust max (issue #127): monthly and
        # yearly restore only within the same period; all-time is unconditional.
        if data.get("gust_month_key") == month_key:
            gm = data.get("gust_max_month")
            self._gust_max_month = float(gm) if gm is not None else None
            self._gust_month_key = month_key
        if data.get("gust_year_key") == year_key:
            gy = data.get("gust_max_year")
            self._gust_max_year = float(gy) if gy is not None else None
            self._gust_year_key = year_key
        ga = data.get("gust_max_all_time")
        self._gust_max_all_time = float(ga) if ga is not None else None

        # v2.0 degree days: 'today' values continue only within the same day;
        # 'season' totals are restored unconditionally (their own reset logic,
        # keyed by year, handles the seasonal rollover) so a restart never wipes
        # an accumulated growing/heating/cooling season.
        if data.get("hdd_today_date") == today:
            self._hdd_today = float(data.get("hdd_today") or 0.0)
            self._hdd_today_date = today
            self._hdd_today_samples = int(data.get("hdd_today_samples") or 0)
        if data.get("cdd_today_date") == today:
            self._cdd_today = float(data.get("cdd_today") or 0.0)
            self._cdd_today_date = today
            self._cdd_today_samples = int(data.get("cdd_today_samples") or 0)
        if data.get("gdd_today_date") == today:
            self._gdd_today = float(data.get("gdd_today") or 0.0)
            self._gdd_today_date = today
        self._hdd_season = float(data.get("hdd_season") or 0.0)
        self._hdd_season_key = data.get("hdd_season_key") or ""
        self._cdd_season = float(data.get("cdd_season") or 0.0)
        self._cdd_season_key = data.get("cdd_season_key") or ""
        self._gdd_season = float(data.get("gdd_season") or 0.0)
        self._gdd_season_key = data.get("gdd_season_key") or ""

        # v2.0 solar energy: continue only if still the same calendar day.
        if data.get("solar_energy_date") == today:
            self._solar_energy_today_whm2 = float(data.get("solar_energy_today_whm2") or 0.0)
            self._solar_energy_date = today

        # v2.7 - snow accumulation: restore only within the same period,
        # mirroring the rain day/month/year restore above.
        if data.get("snow_today_date") == today:
            self._snow_today_cm = float(data.get("snow_today_cm") or 0.0)
            self._snow_today_date = today
        if data.get("snow_this_month_key") == month_key:
            self._snow_this_month_cm = float(data.get("snow_this_month_cm") or 0.0)
            self._snow_this_month_key = month_key
        if data.get("snow_this_year_key") == year_key:
            self._snow_this_year_cm = float(data.get("snow_this_year_cm") or 0.0)
            self._snow_this_year_key = year_key
        # All-time snowiest-day record (issue #144): restored unconditionally,
        # never reset - mirrors the all-time temperature / gust extremes.
        self._snowiest_day_cm = float(data.get("snowiest_day_cm") or 0.0)
        self._snowiest_day_date = data.get("snowiest_day_date") or ""

    # ------------------------------------------------------------------
    # Main orchestrator
    # ------------------------------------------------------------------

    def _compute(self) -> dict[str, Any]:
        import time

        t0 = time.monotonic()
        data: WsData = WsData()
        now = dt_util.utcnow()

        missing = [k for k in REQUIRED_SOURCES if not self.sources.get(k)]
        missing_entities = [
            k for k in REQUIRED_SOURCES if self.sources.get(k) and self.hass.states.get(self.sources[k]) is None
        ]

        tc, rh, pressure_hpa, wind_ms, gust_ms, wind_dir, rain_total_mm, lux, uv = self._compute_raw_readings(data, now)
        self._compute_derived_wind(data, now, wind_ms, gust_ms, wind_dir)
        rain_rate = self._compute_derived_precipitation(data, now, rain_total_mm)
        dew_c = self._compute_derived_temperature(data, now, tc, rh, wind_ms)
        trend_3h, mslp = self._compute_derived_pressure(data, now, tc, pressure_hpa, rh)
        self._compute_rain_probability(data, mslp, trend_3h, rh)
        self._compute_forecast_agreement(data)

        flags = self._validate_readings(tc, rh, pressure_hpa, wind_ms, gust_ms, dew_c)
        data[KEY_SENSOR_QUALITY_FLAGS] = flags

        self._compute_condition(data, tc, rh, wind_ms, gust_ms, rain_rate, dew_c, lux, uv)
        # v0.3.0: removed _compute_activity_scores (laundry, running, stargazing)
        # v0.3.0: removed _compute_degree_days (HDD/CDD)
        # Fire risk: full Canadian FWI system (Van Wagner 1987).
        if self.fire_risk_enabled and tc is not None and rh is not None:
            rain_24h = float(data.get(KEY_RAIN_ACCUM_24H, 0.0) or 0.0)
            data["_fire_rain_24h_mm"] = rain_24h
            wind_kmh = float(wind_ms or 0) * 3.6

            # FWI daily update - once per calendar day
            local_now = dt_util.now()
            fwi_date_str = local_now.strftime("%Y-%m-%d")
            fwi_month = local_now.month

            if fwi_date_str != self._learning_state.fwi_last_date:
                fwi_result = compute_fwi(
                    ffmc_prev=self._learning_state.fwi_ffmc,
                    dmc_prev=self._learning_state.fwi_dmc,
                    dc_prev=self._learning_state.fwi_dc,
                    temp_c=float(tc),
                    rh_pct=float(rh),
                    wind_kmh=wind_kmh,
                    rain_24h_mm=rain_24h,
                    month=fwi_month,
                    hemisphere=self.hemisphere,
                )
                self._learning_state.fwi_ffmc = fwi_result["ffmc"]
                self._learning_state.fwi_dmc = fwi_result["dmc"]
                self._learning_state.fwi_dc = fwi_result["dc"]
                self._learning_state.fwi_last_date = fwi_date_str
            else:
                # Re-compute ISI/BUI/FWI/DSR with current wind/conditions but
                # use the already-updated moisture codes for today.
                fwi_result = compute_fwi(
                    ffmc_prev=self._learning_state.fwi_ffmc,
                    dmc_prev=self._learning_state.fwi_dmc,
                    dc_prev=self._learning_state.fwi_dc,
                    temp_c=float(tc),
                    rh_pct=float(rh),
                    wind_kmh=wind_kmh,
                    rain_24h_mm=0.0,  # rain already applied today
                    month=fwi_month,
                    hemisphere=self.hemisphere,
                )

            data[KEY_FWI_FFMC] = fwi_result["ffmc"]
            data[KEY_FWI_DMC] = fwi_result["dmc"]
            data[KEY_FWI_DC] = fwi_result["dc"]
            data[KEY_FWI_ISI] = fwi_result["isi"]
            data[KEY_FWI_BUI] = fwi_result["bui"]
            data[KEY_FWI] = fwi_result["fwi"]
            data[KEY_FWI_DSR] = fwi_result["dsr"]

            # Map FWI to 1-10 fire_risk_score for backward sensor compatibility
            fwi_val = fwi_result["fwi"]
            if fwi_val < 5.0:
                f_score = 1
                danger = "Very Low"
            elif fwi_val < 12.0:
                f_score = 2
                danger = "Low"
            elif fwi_val < 22.0:
                f_score = round(3 + (fwi_val - 12.0) / 10.0)
                danger = "Moderate"
            elif fwi_val < 33.0:
                f_score = round(5 + (fwi_val - 22.0) / 11.0)
                danger = "High"
            elif fwi_val < 50.0:
                f_score = round(7 + (fwi_val - 33.0) / 17.0)
                danger = "Very High"
            else:
                f_score = 10
                danger = "Extreme"
            f_score = max(1, min(10, f_score))

            data[KEY_FIRE_RISK_SCORE] = f_score
            data["_fire_danger_level"] = danger

            # v2.0 FFDI (McArthur - Australian) + FFWI (Fosberg - US/global)
            if tc is not None and rh is not None and wind_ms is not None:
                ffdi_val = calculate_ffdi(float(tc), float(rh), float(wind_ms) * 3.6)
                data[KEY_FFDI] = ffdi_val
                data["_ffdi_danger"] = ffdi_danger_level(ffdi_val)
                data[KEY_FFWI] = calculate_ffwi(float(tc), float(rh), float(wind_ms))

        self._compute_et0(data, now)
        self._compute_degree_days(data, now, tc, dew_c, rh)
        self._compute_lightning(data, now)
        self._compute_indoor(data)
        self._compute_soil(data)
        self._compute_snow(data, now)
        self._compute_neighbor_qc(data)
        self._compute_data_quality_score(data)
        self._compute_health(data, now, missing, missing_entities)

        # v0.3.0: renamed _compute_fog_precip_type -> _compute_fog_and_thunderstorm
        # (precipitation_type was redundant with rain_rate + temperature)
        self._compute_fog_and_thunderstorm(data, now, tc, dew_c, wind_ms, rain_rate)
        # v0.3.0: streaks now run unconditionally (used to be gated behind
        # the now-removed `degree_days_enabled` flag, which was wrong - streaks
        # are independent of GDD).
        self._compute_streaks(data, now)
        self._compute_climatology(data)
        self._compute_climate_normal_anomaly(data, tc, data.get("_rain_today_mm"))
        self._compute_drift_detection(data, now)
        self._compute_consistency_checks(data, now)
        self._compute_learning_sensors(data)
        self._compute_conditions_summary(data)

        # Solar lux factor learning (A4): update on clear days near solar noon
        if lux is not None and self._learning_state.solar_lux_factor:
            sun_state = self.hass.states.get("sun.sun")
            if sun_state:
                try:
                    sun_elev = float(sun_state.attributes.get("elevation", 0))
                    hour = dt_util.now().hour
                    # Only update within 2h of solar noon (approx. 10-14 local)
                    if 10 <= hour <= 14 and sun_elev >= 20:
                        # Check cloud cover proxy: lux should be >70% of theoretical max
                        from .const import LEARNING_SOLAR_BETA, LEARNING_SOLAR_MAX, LEARNING_SOLAR_MIN
                        from .learning_state import update_solar_lux_factor

                        new_factor = update_solar_lux_factor(
                            self._learning_state.solar_lux_factor,
                            float(lux),
                            sun_elev,
                            beta=LEARNING_SOLAR_BETA,
                            factor_min=LEARNING_SOLAR_MIN,
                            factor_max=LEARNING_SOLAR_MAX,
                        )
                        if abs(new_factor - self._learning_state.solar_lux_factor) > 0.01:
                            self._learning_state.solar_lux_factor = new_factor
                            self._learning_state.solar_factor_n += 1
                except (TypeError, ValueError):
                    pass

        # Forecast skill: track 6h outcome windows (A3)
        self._update_forecast_skill_window(data, now)

        # Periodic save of learning state (async, fire-and-forget)
        with contextlib.suppress(RuntimeError):
            self.hass.async_create_task(self._async_maybe_save_learning())

        provider = get_provider(self.forecast_provider)
        data[KEY_FORECAST_PROVIDER] = self.forecast_provider
        data["_forecast_provider_name"] = provider.PROVIDER_NAME
        data["_forecast_provider_enabled"] = self.forecast_enabled

        if self.forecast_enabled:
            data[KEY_FORECAST] = self._get_cached_or_schedule_forecast(now)
        else:
            data[KEY_FORECAST] = None

        # Apply nowcast correction to first 3 hourly slots
        fc = getattr(self, "_forecast_cache", None)
        if fc:
            corrected_hourly = self._apply_nowcast_correction(fc.get("hourly", []), data)
            if corrected_hourly is not fc.get("hourly"):
                fc = {**fc, "hourly": corrected_hourly}
            data[KEY_FORECAST] = fc

        # Sea temperature: independent fetch schedule (every forecast interval)
        if self.sea_temp_enabled:
            self._schedule_sea_temp_fetch(now)

        fc = getattr(self, "_forecast_cache", None)
        if fc and fc.get("daily"):
            data[KEY_FORECAST_TILES] = self._build_forecast_tiles(fc["daily"])

        # Frost risk
        self._compute_frost_risk(data, tc)
        # Rain today (resets at local midnight)
        data[KEY_RAIN_TODAY_MM] = self._rain_today_mm

        # Sea surface temperature
        if self.sea_temp_enabled and self._sea_temp_cache:
            data[KEY_SEA_SURFACE_TEMP] = self._sea_temp_cache.get("current_c")
            data["_sea_temp_comfort"] = self._sea_temp_cache.get("comfort")
            data["_sea_temp_hourly"] = self._sea_temp_cache.get("hourly")
            data["_sea_temp_grid_lat"] = self._sea_temp_cache.get("grid_lat")
            data["_sea_temp_grid_lon"] = self._sea_temp_cache.get("grid_lon")
            data["_sea_temp_disclaimer"] = self._sea_temp_cache.get("disclaimer")

        if self.wu_enabled:
            data[KEY_WU_STATUS] = self._wu_status
            data["_wu_last_upload"] = self._wu_last_upload.isoformat() if self._wu_last_upload else None

        # v2.0 upload status sensors
        if self.weathercloud_enabled:
            data[KEY_WC_STATUS] = self._wc_status
            data["_wc_last_upload"] = self._wc_last_upload.isoformat() if self._wc_last_upload else None
        if self.pwsweather_enabled:
            data[KEY_PWS_STATUS] = self._pws_status
            data["_pws_last_upload"] = self._pws_last_upload.isoformat() if self._pws_last_upload else None
        if self.wow_enabled:
            data[KEY_WOW_STATUS] = self._wow_status
            data["_wow_last_upload"] = self._wow_last_upload.isoformat() if self._wow_last_upload else None
        if self.awekas_enabled:
            data[KEY_AWEKAS_STATUS] = self._awekas_status
            data["_awekas_last_upload"] = self._awekas_last_upload.isoformat() if self._awekas_last_upload else None
        if self.cwop_enabled:
            data[KEY_CWOP_STATUS_V2] = self._cwop_status
            data["_cwop_last_upload"] = self._cwop_last_upload.isoformat() if self._cwop_last_upload else None
        if self.owm_stations_enabled:
            data[KEY_OWM_STATIONS_STATUS] = self._owm_stations_status
            data["_owm_stations_last_upload"] = (
                self._owm_stations_last_upload.isoformat() if self._owm_stations_last_upload else None
            )
        if self.windy_enabled:
            data[KEY_WINDY_STATUS] = self._windy_status
            data["_windy_last_upload"] = self._windy_last_upload.isoformat() if self._windy_last_upload else None

        # Air Quality (Open-Meteo Air Quality API)
        if self.aqi_enabled and self._aqi_cache:
            aq = self._aqi_cache
            data[KEY_AQI] = aq.get("aqi")
            data[KEY_AQI_LEVEL] = aq.get("aqi_level")
            data[KEY_PM2_5] = aq.get("pm2_5")
            data[KEY_PM10] = aq.get("pm10")
            data[KEY_NO2] = aq.get("no2")
            data[KEY_OZONE] = aq.get("ozone")

        # Pollen (now from Open-Meteo Air Quality API; same fetch as AQI)
        if self.pollen_enabled and self._pollen_cache:
            pol = self._pollen_cache
            data[KEY_POLLEN_GRASS] = pol.get("grass_index")
            data[KEY_POLLEN_TREE] = pol.get("tree_index")
            data[KEY_POLLEN_WEED] = pol.get("weed_index")
            data[KEY_POLLEN_OVERALL] = pol.get("overall_level")
            data["_pollen_grass_level"] = pol.get("grass_level")
            data["_pollen_tree_level"] = pol.get("tree_level")
            data["_pollen_weed_level"] = pol.get("weed_level")

        # v1.6.0 - Météo Vigilance (France only, no API key)
        if self.vigilance_meteo_enabled and self._vigilance_cache:
            vc = self._vigilance_cache
            data[KEY_VIGILANCE_MAX_LEVEL] = vc.get("max_color")
            data["_vigilance_phenomena"] = vc.get("phenomena", {})
            data["_vigilance_dept"] = vc.get("dept")
            data["_vigilance_fetched_at"] = vc.get("fetched_at")

            phenomena: dict[str, str] = vc.get("phenomena", {})
            fire_color = None
            for ph_name, color in phenomena.items():
                if "feux" in ph_name.lower():
                    fire_color = color
                    break
            data[KEY_FIRE_DANGER_VIGILANCE] = fire_color if fire_color else "vert"

        # v1.9.0 - Vigicrues multi-station (France only, no API key)
        if self.vigicrues_enabled and self._vigicrues_caches:
            # Expose auto-detected code so WSRiverSensor can resolve it
            if self._vigicrues_auto_code:
                data["_vigicrues_auto_code"] = self._vigicrues_auto_code
            for code, vr in self._vigicrues_caches.items():
                data[f"river_level_m_{code}"] = vr.get("level_m")
                data[f"river_flow_m3s_{code}"] = vr.get("flow_m3s")
                data[f"_river_station_name_{code}"] = vr.get("station_name")
                data[f"_river_name_{code}"] = vr.get("river_name")
                data[f"_river_obs_time_{code}"] = vr.get("obs_time")
                data[f"_river_flow_obs_time_{code}"] = vr.get("flow_obs_time")
                data[f"_river_station_code_{code}"] = vr.get("station_code")

        # v1.7.0 - Precipitation nowcast (Open-Meteo minutely_15)
        if self.nowcast_enabled and self._nowcast_cache:
            nc = self._nowcast_cache

            # Local rain rate blending for the first 2 x 15-min buckets (0–30 min window)
            # Local gauge is ground truth for current conditions; NWP leads at t+30min+
            raw_times = nc.get("_raw_times")
            raw_precip = nc.get("_raw_precip")
            if raw_times and raw_precip and len(raw_precip) >= 2:
                local_rate_mmph = float(data.get(KEY_RAIN_RATE_FILT) or 0.0)
                local_rate_per_15min = local_rate_mmph / 4.0  # mm/h → mm per 15-min bucket

                # Work on a mutable copy — never mutate the cached NWP data
                blended_precip = list(raw_precip)
                nwp_bucket_0 = blended_precip[0]
                nwp_bucket_1 = blended_precip[1]

                if local_rate_per_15min > 0.05:
                    # Local gauge confirms rain: 70% local / 30% NWP for bucket 0,
                    # 50/50 for bucket 1 (gauge influence fades at t+30 min)
                    blended_precip[0] = round(0.7 * local_rate_per_15min + 0.3 * nwp_bucket_0, 2)
                    blended_precip[1] = round(0.5 * local_rate_per_15min + 0.5 * nwp_bucket_1, 2)
                    nowcast_confidence = "high"
                elif local_rate_per_15min == 0.0 and nwp_bucket_0 > 0.1:
                    # Gauge is dry but NWP says rain is here — low confidence
                    nowcast_confidence = "low"
                else:
                    # Gauge and NWP broadly agree
                    nowcast_confidence = "high" if abs(local_rate_per_15min - nwp_bucket_0) < 0.2 else "medium"

                # Re-derive nowcast from the blended bucket list
                nc_blended = derive_nowcast(raw_times, blended_precip, dt_util.now())
                nc_blended["rain_expected_1h"] = bool(
                    nc_blended.get("next_60min_mm", 0.0) >= NOWCAST_BUCKET_THRESHOLD_MM
                )

                data[KEY_RAIN_NEXT_60MIN] = nc_blended.get("next_60min_mm")
                data[KEY_MINUTES_UNTIL_RAIN] = nc_blended.get("minutes_until_rain")
                data[KEY_MINUTES_UNTIL_DRY] = nc_blended.get("minutes_until_dry")
                data[KEY_NOWCAST_INTENSITY] = nc_blended.get("intensity")
                data[KEY_RAIN_EXPECTED_1H] = nc_blended.get("rain_expected_1h")
                data["_nowcast_peak_rate_mmph"] = nc_blended.get("peak_rate_mmph")
                data["_nowcast_raining_now"] = nc_blended.get("raining_now")
                data[KEY_NOWCAST_CONFIDENCE] = nowcast_confidence
            else:
                # No raw buckets available — fall back to cached derived values as-is
                data[KEY_RAIN_NEXT_60MIN] = nc.get("next_60min_mm")
                data[KEY_MINUTES_UNTIL_RAIN] = nc.get("minutes_until_rain")
                data[KEY_MINUTES_UNTIL_DRY] = nc.get("minutes_until_dry")
                data[KEY_NOWCAST_INTENSITY] = nc.get("intensity")
                data[KEY_RAIN_EXPECTED_1H] = nc.get("rain_expected_1h")
                data["_nowcast_peak_rate_mmph"] = nc.get("peak_rate_mmph")
                data["_nowcast_raining_now"] = nc.get("raining_now")

            data["_nowcast_fetched_at"] = nc.get("fetched_at")

        # Moon (pure calculation, no external API)
        if self.moon_enabled:
            local_now = dt_util.now()
            age = moon_phase_days(local_now.year, local_now.month, local_now.day)
            phase_key = moon_phase_from_age(age)
            illum_frac = calculate_moon_illumination(local_now.year, local_now.month, local_now.day)
            illum_pct = round(illum_frac * 100)
            data[KEY_MOON_PHASE] = phase_key
            data[KEY_MOON_ILLUMINATION_PCT] = illum_pct
            data[KEY_MOON_DISPLAY] = phase_key
            data[KEY_MOON_AGE_DAYS] = age
            data[KEY_MOON_NEXT_FULL] = moon_next_phase_days(local_now.year, local_now.month, local_now.day, 14.77)
            data[KEY_MOON_NEXT_NEW] = moon_next_phase_days(local_now.year, local_now.month, local_now.day, 0.0)

        # Solar forecast
        if self.solar_forecast_enabled and self._solar_cache:
            sol = self._solar_cache
            data[KEY_SOLAR_FORECAST_TODAY_KWH] = sol.get("today_kwh")
            data[KEY_SOLAR_FORECAST_TOMORROW_KWH] = sol.get("tomorrow_kwh")
            data[KEY_SOLAR_FORECAST_STATUS] = sol.get("status", "OK")

        # Penman-Monteith ET₀ - uses solar radiation sensor if configured
        # v0.3.0: ungated from removed degree_days_enabled flag; runs whenever
        # forecast_lat is configured and the required inputs are available.
        if self.forecast_lat is not None:
            tc = data.get(KEY_NORM_TEMP_C)
            rh = data.get(KEY_NORM_HUMIDITY)
            ws = data.get(KEY_NORM_WIND_SPEED_MS)
            sol_rad = self._get_solar_radiation()
            if tc is not None and rh is not None and ws is not None and sol_rad is not None:
                high = data.get(KEY_TEMP_HIGH_24H) or tc
                low = data.get(KEY_TEMP_LOW_24H) or tc
                doy = dt_util.now().timetuple().tm_yday
                et0_pm = et0_penman_monteith(
                    temp_mean_c=float(tc),
                    temp_max_c=float(high),
                    temp_min_c=float(low),
                    humidity=float(rh),
                    wind_speed_ms=float(ws),
                    solar_radiation_wm2=float(sol_rad),
                    elevation_m=self.elevation_m,
                    day_of_year=doy,
                    latitude_deg=float(self.forecast_lat),
                )
                data[KEY_ET0_PM_DAILY_MM] = et0_pm

        # --- v1.5.0 wind run, chill hours, clearness index ---
        if self.comfort_indices_enabled:
            self._compute_wind_run(data, now)
            self._compute_chill_hours(data, now)
            self._compute_clearness_and_cloud(data)

        self.runtime.last_compute_ms = round((time.monotonic() - t0) * 1000, 1)

        # v2.0: fire HA Event entities for weather transitions
        self._fire_ws_events(data)

        return data

    def _fire_ws_events(self, data: dict) -> None:
        """Notify event entities of transitions detected in this compute cycle."""
        from .const import DOMAIN

        try:
            entry_id = self.config_entry.entry_id
        except Exception:  # noqa: BLE001
            return
        events = self.hass.data.get(DOMAIN, {}).get(f"{entry_id}_events", {})
        if not events:
            return
        freeze_thresh = float(self.entry_options.get("thresh_freeze_c", 0.0))
        rain_ent = events.get("WSRainEvent")
        frost_ent = events.get("WSFrostEvent")
        lightning_ent = events.get("WSLightningEvent")
        if rain_ent:
            with contextlib.suppress(Exception):
                rain_ent.check_and_fire(data)
        if frost_ent:
            with contextlib.suppress(Exception):
                frost_ent.check_and_fire(data, threshold_c=freeze_thresh)
        if lightning_ent and self.lightning_enabled:
            with contextlib.suppress(Exception):
                lightning_ent.check_and_fire(data)

    # ------------------------------------------------------------------
    # Moon / forecast helpers
    # ------------------------------------------------------------------

    def _build_forecast_tiles(self, daily: list) -> list:
        labels = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5"]
        return [
            {
                "label": labels[i] if i < len(labels) else f"Day {i + 1}",
                "date": day.get("date", ""),
                "tmax": day.get("tmax_c"),
                "tmin": day.get("tmin_c"),
                "precip_mm": day.get("precip_mm"),
                "wind_kmh": day.get("wind_kmh"),
                "weathercode": day.get("weathercode"),
            }
            for i, day in enumerate(daily[:5])
        ]

    def _get_cached_or_schedule_forecast(self, now: Any) -> dict[str, Any] | None:
        cached = getattr(self, "_forecast_cache", None)
        last = self.runtime.last_forecast_fetch
        if cached is not None and last is not None:
            # Exponential backoff: normal interval unless consecutive failures
            failures = self.runtime.forecast_consecutive_failures
            if failures > 0:
                backoff_s = min(
                    FORECAST_MAX_RETRY_S,
                    FORECAST_MIN_RETRY_S * (2 ** min(failures - 1, 6)),
                )
                min_interval_s = backoff_s
            else:
                min_interval_s = max(300, self.forecast_interval_min * 60)

            age_s = (now - last).total_seconds()
            if age_s < min_interval_s:
                return cached

        if not self.forecast_enabled:
            return cached

        rt = self.runtime
        if rt.forecast_inflight:
            return cached

        try:
            rt.forecast_inflight = True
            self.hass.async_create_task(self._async_fetch_forecast())
        except RuntimeError:
            # Event loop shutting down - reset flag so next tick can retry.
            rt.forecast_inflight = False

        return cached

    def _schedule_sea_temp_fetch(self, now: Any) -> None:
        """Schedule a sea temp fetch if cache is stale or empty."""
        rt = self.runtime
        if getattr(rt, "sea_temp_inflight", False):
            return
        last = rt.last_sea_temp_fetch
        if last is not None and self._sea_temp_cache is not None:
            age_s = (now - last).total_seconds()
            # Reuse forecast interval; sea temp changes slowly
            min_interval_s = max(300, self.forecast_interval_min * 60)
            if age_s < min_interval_s:
                return
        rt.sea_temp_inflight = True
        self.hass.async_create_task(self._async_fetch_sea_temp())

    async def _async_fetch_forecast(self) -> None:
        rt = self.runtime
        if not self.forecast_enabled:
            rt.forecast_inflight = False
            return
        lat = self.forecast_lat or float(self.hass.config.latitude)
        lon = self.forecast_lon or float(self.hass.config.longitude)

        session = async_get_clientsession(self.hass)
        is_ha_entity = self.forecast_provider == FORECAST_PROVIDER_HA_ENTITY
        provider = get_provider(self.forecast_provider, hass=self.hass if is_ha_entity else None)
        api_key = self.forecast_entity if is_ha_entity else self.forecast_api_key
        try:
            result = await provider.async_fetch(session, lat, lon, api_key=api_key)
        except (aiohttp.ClientError, TimeoutError, ValueError, KeyError) as exc:
            _LOGGER.warning("Forecast fetch failed (%s): %s", provider.PROVIDER_NAME, exc)
            rt.forecast_consecutive_failures += 1
            rt.forecast_inflight = False
            return
        except Exception as exc:
            _LOGGER.error("Forecast fetch unexpected error (%s): %s", provider.PROVIDER_NAME, exc, exc_info=True)
            rt.forecast_consecutive_failures += 1
            rt.forecast_inflight = False
            return

        self._forecast_cache = {
            **result,
            "lat": lat,
            "lon": lon,
        }
        self.runtime.last_forecast_fetch = dt_util.utcnow()
        rt.forecast_consecutive_failures = 0
        self.async_set_updated_data(self._compute())
        rt.forecast_inflight = False

    def _apply_nowcast_correction(self, hourly: list[dict], data: dict) -> list[dict]:
        """Blend current local readings into the first 0-3 hourly forecast slots.

        Tapering weights: 70 % local at hour 0, 40 % at hour 1, 10 % at hour 2,
        pure NWP from hour 3 onwards. Only numeric fields that both sides supply
        are blended; missing values are left unchanged.
        """
        if not hourly:
            return hourly

        local_temp = data.get(KEY_NORM_TEMP_C)
        local_hum = data.get(KEY_NORM_HUMIDITY)
        local_wind_ms = data.get(KEY_NORM_WIND_SPEED_MS)
        local_dew = data.get(KEY_DEW_POINT_C)

        # Nothing to blend if all local readings are missing
        if all(v is None for v in [local_temp, local_hum, local_wind_ms, local_dew]):
            return hourly

        local_wind_kmh = local_wind_ms * 3.6 if local_wind_ms is not None else None
        weights = [0.70, 0.40, 0.10]

        result = []
        for i, slot in enumerate(hourly):
            if i < 3:
                w_local = weights[i]
                w_nwp = 1.0 - w_local
                slot = dict(slot)  # copy before mutating
                if local_temp is not None and slot.get("temp_c") is not None:
                    slot["temp_c"] = round(w_local * local_temp + w_nwp * slot["temp_c"], 1)
                if local_hum is not None and slot.get("humidity") is not None:
                    slot["humidity"] = round(w_local * local_hum + w_nwp * slot["humidity"], 1)
                if local_wind_kmh is not None and slot.get("wind_kmh") is not None:
                    slot["wind_kmh"] = round(w_local * local_wind_kmh + w_nwp * slot["wind_kmh"], 1)
                if local_dew is not None and slot.get("dewpoint_c") is not None:
                    slot["dewpoint_c"] = round(w_local * local_dew + w_nwp * slot["dewpoint_c"], 1)
            result.append(slot)
        return result

    async def _async_fetch_sea_temp(self) -> None:
        """Fetch sea surface temperature from Open-Meteo Marine API."""
        rt = self.runtime
        try:
            lat = self.sea_temp_lat or float(self.hass.config.latitude)
            lon = self.sea_temp_lon or float(self.hass.config.longitude)

            url = (
                "https://marine-api.open-meteo.com/v1/marine"
                f"?latitude={lat}&longitude={lon}"
                "&current=sea_surface_temperature"
                "&hourly=sea_surface_temperature"
                "&forecast_hours=24"
                "&cell_selection=sea"
                "&timezone=auto"
            )

            session = async_get_clientsession(self.hass)
            async with session.get(url, timeout=20) as resp:
                if resp.status != 200:
                    _LOGGER.warning("Open-Meteo Marine returned HTTP %s", resp.status)
                    return
                js = await resp.json()

            # Try current block first, fall back to first hourly value
            current = js.get("current") or {}
            sst_c = current.get("sea_surface_temperature")

            # Parse hourly SST
            hourly = js.get("hourly") or {}
            h_times = hourly.get("time") or []
            h_sst = hourly.get("sea_surface_temperature") or []
            hourly_out = [
                {"datetime": h_times[i], "sst_c": h_sst[i]}
                for i in range(min(len(h_times), 24))
                if i < len(h_sst) and h_sst[i] is not None
            ]

            # Fallback: if current block didn't have SST, use first hourly value
            if sst_c is None and h_sst:
                for v in h_sst:
                    if v is not None:
                        sst_c = v
                        break

            if sst_c is None:
                _LOGGER.warning("Open-Meteo Marine returned no SST data for %.4f,%.4f", lat, lon)
                return

            # Swimming comfort label
            if sst_c < 16:
                comfort = "Cold"
            elif sst_c < 20:
                comfort = "Cool"
            elif sst_c < 24:
                comfort = "Comfortable"
            elif sst_c < 28:
                comfort = "Warm"
            else:
                comfort = "Hot"

            self._sea_temp_cache = {
                "current_c": round(sst_c, 1) if sst_c is not None else None,
                "comfort": comfort,
                "hourly": hourly_out,
                "grid_lat": js.get("latitude"),
                "grid_lon": js.get("longitude"),
                "disclaimer": (
                    "Satellite-derived SST for nearest sea grid cell. "
                    "Coastal accuracy limited by grid resolution (~5 km). "
                    "Not a direct measurement."
                ),
            }
            rt.last_sea_temp_fetch = dt_util.utcnow()
            self.async_set_updated_data(self._compute())

        except (aiohttp.ClientError, TimeoutError, ValueError, KeyError) as exc:
            _LOGGER.warning("Open-Meteo Marine fetch failed: %s", exc)
        except Exception as exc:
            _LOGGER.error("Open-Meteo Marine fetch unexpected error: %s", exc, exc_info=True)
        finally:
            rt.sea_temp_inflight = False

    # ------------------------------------------------------------------
    # v1.7.0 - Precipitation nowcast (Open-Meteo minutely_15, free/no key)
    # ------------------------------------------------------------------
    async def _async_fetch_nowcast(self) -> None:
        """Fetch 15-minute precipitation buckets and derive a nowcast.

        Uses Open-Meteo's forecast API directly (independent of the chosen
        forecast provider) so "rain starts/stops in N minutes" works even when
        the user selected Met.no / NWS / OWM as their main provider. Any
        failure is swallowed so it can never break the main coordinator update.
        """
        try:
            lat = self.forecast_lat
            lon = self.forecast_lon
            if lat is None or lon is None:
                return

            url = (
                "https://api.open-meteo.com/v1/forecast"
                f"?latitude={lat}&longitude={lon}"
                "&minutely_15=precipitation"
                "&forecast_minutely_15=24"
                "&timezone=auto"
            )

            session = async_get_clientsession(self.hass)
            async with session.get(url, timeout=20) as resp:
                if resp.status != 200:
                    _LOGGER.warning("Open-Meteo nowcast returned HTTP %s", resp.status)
                    return
                js = await resp.json()

            minutely = js.get("minutely_15") or {}
            times = minutely.get("time") or []
            precip = minutely.get("precipitation") or []
            if not times or not precip:
                _LOGGER.debug("ws_core: nowcast returned no minutely_15 data")
                return

            nc = derive_nowcast(times, precip, dt_util.now())
            nc["rain_expected_1h"] = bool(nc.get("next_60min_mm", 0.0) >= NOWCAST_BUCKET_THRESHOLD_MM)
            nc["fetched_at"] = dt_util.now().isoformat()
            # Store raw NWP buckets so _compute() can apply local-gauge blending
            nc["_raw_times"] = list(times)
            nc["_raw_precip"] = [float(p) if p is not None else 0.0 for p in precip]
            self._nowcast_cache = nc
            self.async_set_updated_data(self._compute())

        except (aiohttp.ClientError, TimeoutError, ValueError, KeyError) as exc:
            _LOGGER.warning("Open-Meteo nowcast fetch failed: %s", exc)
        except Exception as exc:
            _LOGGER.error("Open-Meteo nowcast fetch unexpected error: %s", exc, exc_info=True)

    # ------------------------------------------------------------------
    # METAR cross-validation  (v0.5.0)
    # ------------------------------------------------------------------

    # ------------------------------------------------------------------
    # CWOP APRS-IS upload  (v0.6.0)
    # ------------------------------------------------------------------

    # ------------------------------------------------------------------
    # Weather Underground upload  (v0.6.0)
    # ------------------------------------------------------------------

    async def _async_upload_wunderground(self) -> None:
        """Upload observation to Weather Underground Personal Weather Station API."""
        data = self.data
        if not data or not self.wu_station_id or not self.wu_api_key:
            return

        now_utc = dt_util.utcnow()
        date_utc = now_utc.strftime("%Y-%m-%d %H:%M:%S")

        temp_c = data.get(KEY_NORM_TEMP_C)
        dew_c = data.get(KEY_DEW_POINT_C)
        humidity = data.get(KEY_NORM_HUMIDITY)
        press = data.get(KEY_SEA_LEVEL_PRESSURE_HPA) or data.get(KEY_NORM_PRESSURE_HPA)
        wind_dir = data.get(KEY_NORM_WIND_DIR_DEG) or 0
        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS) or 0
        gust_ms = data.get(KEY_NORM_WIND_GUST_MS) or 0
        rain_1h = data.get(KEY_RAIN_ACCUM_1H) or 0
        rain_24h = data.get(KEY_RAIN_ACCUM_24H) or 0

        def _c_to_f(c: float) -> float:
            return round(c * 9 / 5 + 32, 1)

        def _ms_to_mph(ms: float) -> float:
            return round(float(ms) * 2.23694, 1)

        def _mm_to_in(mm: float) -> float:
            return round(float(mm) / 25.4, 3)

        def _hpa_to_inhg(hpa: float) -> float:
            return round(float(hpa) / 33.8639, 2)

        params = {
            "ID": self.wu_station_id,
            "PASSWORD": self.wu_api_key,
            "dateutc": date_utc,
            "winddir": int(wind_dir),
            "windspeedmph": _ms_to_mph(wind_ms),
            "windgustmph": _ms_to_mph(gust_ms),
            "rainin": _mm_to_in(rain_1h),
            "dailyrainin": _mm_to_in(rain_24h),
            "action": "updateraw",
            "softwaretype": f"ws_core_{_INTEGRATION_VERSION}",
        }
        if temp_c is not None:
            params["tempf"] = _c_to_f(float(temp_c))
        if dew_c is not None:
            params["dewptf"] = _c_to_f(float(dew_c))
        if humidity is not None:
            params["humidity"] = int(float(humidity))
        if press is not None:
            params["baromin"] = _hpa_to_inhg(float(press))

        url = "https://weatherstation.wunderground.com/weatherstation/updateweatherstation.php"
        try:
            session = async_get_clientsession(self.hass)
            async with session.get(url, params=params, timeout=15) as resp:
                body = await resp.text()
                if resp.status == 200 and "success" in body.lower():
                    self._wu_last_upload = now_utc
                    self._wu_status = "ok"
                    _LOGGER.debug("WUnderground upload OK")
                else:
                    self._wu_status = "error_http"
                    _LOGGER.warning("WUnderground upload failed HTTP %d: %s", resp.status, body[:120])
        except (aiohttp.ClientError, TimeoutError) as exc:
            self._wu_status = "error_network"
            _LOGGER.warning("WUnderground upload error: %s", exc)
        except Exception as exc:
            self._wu_status = "error"
            _LOGGER.error("WUnderground upload unexpected error: %s", exc, exc_info=True)

    # ------------------------------------------------------------------
    # v2.0 - CWOP (Citizen Weather Observer Program) upload via APRS TCP
    # ------------------------------------------------------------------

    async def _async_upload_cwop(self) -> None:
        """Upload observation to CWOP network using APRS protocol over TCP.

        Protocol:
          1. Connect to cwop.aprs.net:14580
          2. Send login: user {CALLSIGN} pass {PASSCODE} vers ws_core {VERSION}
          3. Send APRS weather packet
          4. Close connection

        APRS weather packet format:
          {CALLSIGN}>APRS,TCPXX*,qAX,{CALLSIGN}:@{TIME}z{LAT}/{LON}_{WIND}
        """
        import asyncio

        data = self.data
        if not data or not self.cwop_callsign:
            return

        now_utc = dt_util.utcnow()
        lat = self.forecast_lat
        lon = self.forecast_lon
        if lat is None or lon is None:
            return

        temp_c = data.get(KEY_NORM_TEMP_C)
        humidity = data.get(KEY_NORM_HUMIDITY)
        press = data.get(KEY_SEA_LEVEL_PRESSURE_HPA) or data.get(KEY_NORM_PRESSURE_HPA)
        wind_dir = data.get(KEY_NORM_WIND_DIR_DEG) or 0
        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS) or 0
        gust_ms = data.get(KEY_NORM_WIND_GUST_MS) or 0
        rain_1h = data.get(KEY_RAIN_ACCUM_1H) or 0
        rain_24h = data.get(KEY_RAIN_ACCUM_24H) or 0

        # APRS uses hundredths of degrees, N/S E/W format
        lat_f = float(lat)
        lon_f = float(lon)
        lat_deg = int(abs(lat_f))
        lat_min = (abs(lat_f) - lat_deg) * 60
        lon_deg = int(abs(lon_f))
        lon_min = (abs(lon_f) - lon_deg) * 60
        lat_str = f"{lat_deg:02d}{lat_min:05.2f}{'N' if lat_f >= 0 else 'S'}"
        lon_str = f"{lon_deg:03d}{lon_min:05.2f}{'E' if lon_f >= 0 else 'W'}"

        time_str = now_utc.strftime("%d%H%M")

        def _ms_to_mph(ms: float) -> int:
            return round(float(ms) * 2.23694)

        def _mm_to_hundredths_in(mm: float) -> int:
            return round(float(mm) / 25.4 * 100)

        def _c_to_f(c: float) -> int:
            return round(float(c) * 9 / 5 + 32)

        # APRS weather body
        wind_dir_s = f"{int(wind_dir):03d}"
        wind_spd_s = f"{_ms_to_mph(wind_ms):03d}"
        gust_s = f"g{_ms_to_mph(gust_ms):03d}"
        temp_s = f"t{_c_to_f(float(temp_c)):03d}" if temp_c is not None else "t..."
        rain1h_s = f"r{_mm_to_hundredths_in(float(rain_1h)):03d}"
        rain24h_s = f"p{_mm_to_hundredths_in(float(rain_24h)):03d}"
        hum_s = f"h{int(float(humidity)):02d}" if humidity is not None else ""
        baro_s = f"b{round(float(press) * 10):05d}" if press is not None else ""

        weather_body = (
            f"_{wind_dir_s}/{wind_spd_s}{gust_s}{temp_s}"
            f"{rain1h_s}{rain24h_s}{hum_s}{baro_s}"
            f" ws_core/{_INTEGRATION_VERSION}"
        )

        packet = (
            f"{self.cwop_callsign}>APRS,TCPXX*,qAX,{self.cwop_callsign}:"
            f"@{time_str}z{lat_str}/{lon_str}{weather_body}\r\n"
        )
        login = f"user {self.cwop_callsign} pass {self.cwop_passcode} vers ws_core {_INTEGRATION_VERSION}\r\n"

        try:
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(self.cwop_server, self.cwop_port),
                timeout=15,
            )
            try:
                writer.write(login.encode("ascii"))
                await writer.drain()
                # Give server 1 second to respond (it sends a banner)
                with contextlib.suppress(TimeoutError):
                    await asyncio.wait_for(reader.read(256), timeout=1.5)
                writer.write(packet.encode("ascii"))
                await writer.drain()
                self._cwop_last_upload = now_utc
                self._cwop_status = "ok"
                _LOGGER.debug("CWOP upload OK: %s", packet.strip())
            finally:
                writer.close()
                with contextlib.suppress(Exception):
                    await writer.wait_closed()
        except (TimeoutError, OSError) as exc:
            self._cwop_status = "error_network"
            _LOGGER.warning("CWOP upload error: %s", exc)
        except Exception as exc:  # noqa: BLE001
            self._cwop_status = "error"
            _LOGGER.error("CWOP upload unexpected error: %s", exc)

    # ------------------------------------------------------------------
    # v2.0 - MQTT Discovery republishing
    # ------------------------------------------------------------------

    async def _async_mqtt_discovery(self) -> None:
        """Publish MQTT Discovery payloads (called once on startup + after reconnect)."""
        from .mqtt_publisher import async_publish_discovery

        entity_prefix = self.entry_options.get("prefix") or self.entry_data.get("prefix") or "ws"
        station_name = self.entry_data.get("name") or "Weather Station"
        await async_publish_discovery(
            self.hass,
            discovery_prefix=self._mqtt_discovery_prefix,
            state_prefix=self._mqtt_state_prefix,
            entity_prefix=entity_prefix,
            station_name=station_name,
            integration_version=_INTEGRATION_VERSION,
        )
        self._mqtt_discovery_published = True

    async def _async_mqtt_publish(self) -> None:
        """Publish current sensor states to MQTT state topics."""
        if not self.data:
            return
        from .mqtt_publisher import async_publish_states

        entity_prefix = self.entry_options.get("prefix") or self.entry_data.get("prefix") or "ws"

        # Ensure discovery was published at least once
        if not self._mqtt_discovery_published:
            await self._async_mqtt_discovery()

        await async_publish_states(
            self.hass,
            state_prefix=self._mqtt_state_prefix,
            entity_prefix=entity_prefix,
            coordinator_data=self.data,
        )

    # ------------------------------------------------------------------
    # v2.0 - Weathercloud upload
    # ------------------------------------------------------------------

    async def _async_upload_weathercloud(self) -> None:
        """Upload observation to Weathercloud."""
        data = self.data
        if not data or not self.wc_station_id or not self.wc_api_key:
            return

        now_utc = dt_util.utcnow()
        temp_c = data.get(KEY_NORM_TEMP_C)
        dew_c = data.get(KEY_DEW_POINT_C)
        humidity = data.get(KEY_NORM_HUMIDITY)
        press = data.get(KEY_SEA_LEVEL_PRESSURE_HPA) or data.get(KEY_NORM_PRESSURE_HPA)
        wind_dir = data.get(KEY_NORM_WIND_DIR_DEG) or 0
        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS) or 0
        gust_ms = data.get(KEY_NORM_WIND_GUST_MS) or 0
        rain_1h = data.get(KEY_RAIN_ACCUM_1H) or 0
        uv = data.get(KEY_UV)

        def _ms_to_kmh(ms: float) -> float:
            return round(float(ms) * 3.6, 1)

        def _hpa_to_hpa(v: float) -> float:
            return round(float(v), 1)

        # Weathercloud API v1 (HTTP GET)
        params: dict = {
            "wid": self.wc_station_id,
            "key": self.wc_api_key,
            "per": int(self.wc_interval_min),
        }
        if temp_c is not None:
            params["temp"] = round(float(temp_c) * 10)  # Weathercloud uses tenths of °C
        if dew_c is not None:
            params["dew"] = round(float(dew_c) * 10)
        if humidity is not None:
            params["hum"] = int(float(humidity))
        if press is not None:
            params["bar"] = round(float(press) * 10)
        params["wspdavg"] = round(_ms_to_kmh(wind_ms) * 10)
        params["wgust"] = round(_ms_to_kmh(gust_ms) * 10)
        params["wdir"] = int(wind_dir)
        params["rain"] = round(float(rain_1h) * 10)
        if uv is not None:
            params["uvi"] = round(float(uv) * 10)

        url = "https://api.weathercloud.net/v01/set"
        try:
            session = async_get_clientsession(self.hass)
            async with session.get(url, params=params, timeout=15) as resp:
                body = await resp.text()
                if resp.status == 200:
                    self._wc_last_upload = now_utc
                    self._wc_status = "ok"
                else:
                    self._wc_status = "error_http"
                    _LOGGER.warning("Weathercloud upload HTTP %d: %s", resp.status, body[:120])
        except (aiohttp.ClientError, TimeoutError) as exc:
            self._wc_status = "error_network"
            _LOGGER.warning("Weathercloud upload error: %s", exc)
        except Exception as exc:  # noqa: BLE001
            self._wc_status = "error"
            _LOGGER.error("Weathercloud upload unexpected error: %s", exc)

    # ------------------------------------------------------------------
    # v2.0 - PWSWeather upload
    # ------------------------------------------------------------------

    async def _async_upload_pwsweather(self) -> None:
        """Upload observation to PWSWeather (WU-compatible API)."""
        data = self.data
        if not data or not self.pws_station_id or not self.pws_api_key:
            return

        now_utc = dt_util.utcnow()
        date_utc = now_utc.strftime("%Y-%m-%d %H:%M:%S")
        temp_c = data.get(KEY_NORM_TEMP_C)
        dew_c = data.get(KEY_DEW_POINT_C)
        humidity = data.get(KEY_NORM_HUMIDITY)
        press = data.get(KEY_SEA_LEVEL_PRESSURE_HPA) or data.get(KEY_NORM_PRESSURE_HPA)
        wind_dir = data.get(KEY_NORM_WIND_DIR_DEG) or 0
        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS) or 0
        gust_ms = data.get(KEY_NORM_WIND_GUST_MS) or 0
        rain_1h = data.get(KEY_RAIN_ACCUM_1H) or 0
        rain_24h = data.get(KEY_RAIN_ACCUM_24H) or 0

        def _c_to_f(c: float) -> float:
            return round(float(c) * 9 / 5 + 32, 1)

        def _ms_to_mph(ms: float) -> float:
            return round(float(ms) * 2.23694, 1)

        def _mm_to_in(mm: float) -> float:
            return round(float(mm) / 25.4, 3)

        def _hpa_to_inhg(hpa: float) -> float:
            return round(float(hpa) / 33.8639, 2)

        params: dict = {
            "ID": self.pws_station_id,
            "PASSWORD": self.pws_api_key,
            "dateutc": date_utc,
            "winddir": int(wind_dir),
            "windspeedmph": _ms_to_mph(wind_ms),
            "windgustmph": _ms_to_mph(gust_ms),
            "rainin": _mm_to_in(rain_1h),
            "dailyrainin": _mm_to_in(rain_24h),
            "action": "updateraw",
            "softwaretype": f"ws_core_{_INTEGRATION_VERSION}",
        }
        if temp_c is not None:
            params["tempf"] = _c_to_f(float(temp_c))
        if dew_c is not None:
            params["dewptf"] = _c_to_f(float(dew_c))
        if humidity is not None:
            params["humidity"] = int(float(humidity))
        if press is not None:
            params["baromin"] = _hpa_to_inhg(float(press))

        url = "https://www.pwsweather.com/weatherstation/updateweatherstation.php"
        try:
            session = async_get_clientsession(self.hass)
            async with session.get(url, params=params, timeout=15) as resp:
                body = await resp.text()
                if resp.status == 200 and "success" in body.lower():
                    self._pws_last_upload = now_utc
                    self._pws_status = "ok"
                else:
                    self._pws_status = "error_http"
                    _LOGGER.warning("PWSWeather upload HTTP %d: %s", resp.status, body[:120])
        except (aiohttp.ClientError, TimeoutError) as exc:
            self._pws_status = "error_network"
            _LOGGER.warning("PWSWeather upload error: %s", exc)
        except Exception as exc:  # noqa: BLE001
            self._pws_status = "error"
            _LOGGER.error("PWSWeather upload unexpected error: %s", exc)

    # ------------------------------------------------------------------
    # v2.0 - WOW (UK Met Office Weather Observations Website) upload
    # ------------------------------------------------------------------

    async def _async_upload_wow(self) -> None:
        """Upload observation to UK Met Office WOW."""
        data = self.data
        if not data or not self.wow_site_id or not self.wow_auth_key:
            return

        now_utc = dt_util.utcnow()
        date_utc = now_utc.strftime("%Y-%m-%d %H:%M:%S")
        temp_c = data.get(KEY_NORM_TEMP_C)
        dew_c = data.get(KEY_DEW_POINT_C)
        humidity = data.get(KEY_NORM_HUMIDITY)
        press = data.get(KEY_SEA_LEVEL_PRESSURE_HPA) or data.get(KEY_NORM_PRESSURE_HPA)
        wind_dir = data.get(KEY_NORM_WIND_DIR_DEG)
        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS)
        gust_ms = data.get(KEY_NORM_WIND_GUST_MS)
        rain_1h = data.get(KEY_RAIN_ACCUM_1H) or 0

        params: dict = {
            "siteid": self.wow_site_id,
            "siteAuthenticationKey": self.wow_auth_key,
            "dateutc": date_utc,
            "softwaretype": f"ws_core_{_INTEGRATION_VERSION}",
        }
        if temp_c is not None:
            params["tempf"] = round(float(temp_c) * 9 / 5 + 32, 1)
        if dew_c is not None:
            params["dewptf"] = round(float(dew_c) * 9 / 5 + 32, 1)
        if humidity is not None:
            params["humidity"] = int(float(humidity))
        if press is not None:
            params["baromin"] = round(float(press) / 33.8639, 2)
        if wind_dir is not None:
            params["winddir"] = int(float(wind_dir))
        if wind_ms is not None:
            params["windspeedmph"] = round(float(wind_ms) * 2.23694, 1)
        if gust_ms is not None:
            params["windgustmph"] = round(float(gust_ms) * 2.23694, 1)
        params["rainin"] = round(float(rain_1h) / 25.4, 3)

        url = "https://wow.metoffice.gov.uk/automaticreading"
        try:
            session = async_get_clientsession(self.hass)
            async with session.get(url, params=params, timeout=15) as resp:
                if resp.status in (200, 201):
                    self._wow_last_upload = now_utc
                    self._wow_status = "ok"
                else:
                    self._wow_status = "error_http"
                    _LOGGER.warning("WOW upload HTTP %d", resp.status)
        except (aiohttp.ClientError, TimeoutError) as exc:
            self._wow_status = "error_network"
            _LOGGER.warning("WOW upload error: %s", exc)
        except Exception as exc:  # noqa: BLE001
            self._wow_status = "error"
            _LOGGER.error("WOW upload unexpected error: %s", exc)

    # ------------------------------------------------------------------
    # v2.0 - AWEKAS upload
    # ------------------------------------------------------------------

    async def _async_upload_awekas(self) -> None:
        """Upload observation to AWEKAS (Automatisches WEtterKArtenSystem)."""
        data = self.data
        if not data or not self.awekas_username or not self.awekas_password:
            return

        now_utc = dt_util.utcnow()
        temp_c = data.get(KEY_NORM_TEMP_C)
        humidity = data.get(KEY_NORM_HUMIDITY)
        press = data.get(KEY_SEA_LEVEL_PRESSURE_HPA) or data.get(KEY_NORM_PRESSURE_HPA)
        wind_dir = data.get(KEY_NORM_WIND_DIR_DEG)
        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS)
        gust_ms = data.get(KEY_NORM_WIND_GUST_MS)
        rain_1h = data.get(KEY_RAIN_ACCUM_1H) or 0
        snow_mm = None  # snow depth not yet available in ws_core

        # AWEKAS upload format (semicolon-delimited, UTF-8)
        # username;password;date;time;temp;humidity;pressure;rain;wind;winddir;windgust;;snow;
        date_str = now_utc.strftime("%d.%m.%Y")
        time_str = now_utc.strftime("%H:%M")
        values = [
            self.awekas_username,
            self.awekas_password,
            date_str,
            time_str,
            f"{float(temp_c):.1f}" if temp_c is not None else "",
            f"{int(float(humidity))}" if humidity is not None else "",
            f"{float(press):.1f}" if press is not None else "",
            f"{float(rain_1h):.1f}",
            f"{round(float(wind_ms) * 3.6, 1)}" if wind_ms is not None else "",
            f"{int(float(wind_dir))}" if wind_dir is not None else "",
            f"{round(float(gust_ms) * 3.6, 1)}" if gust_ms is not None else "",
            "",
            "" if snow_mm is None else f"{snow_mm:.1f}",
        ]
        payload = ";".join(values)

        url = "https://data.awekas.at/eingabe_pruefung.php"
        try:
            session = async_get_clientsession(self.hass)
            async with session.post(
                url,
                data={"val": payload},
                timeout=20,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            ) as resp:
                if resp.status == 200:
                    self._awekas_last_upload = now_utc
                    self._awekas_status = "ok"
                else:
                    self._awekas_status = "error_http"
                    _LOGGER.warning("AWEKAS upload HTTP %d", resp.status)
        except (aiohttp.ClientError, TimeoutError) as exc:
            self._awekas_status = "error_network"
            _LOGGER.warning("AWEKAS upload error: %s", exc)
        except Exception as exc:  # noqa: BLE001
            self._awekas_status = "error"
            _LOGGER.error("AWEKAS upload unexpected error: %s", exc)

    # ------------------------------------------------------------------
    # v2.0 - OpenWeatherMap Stations API upload
    # ------------------------------------------------------------------

    async def _async_upload_owm_stations(self) -> None:
        """Upload a measurement to the OpenWeatherMap Stations API (v3)."""
        data = self.data
        if not data or not self.owm_stations_api_key or not self.owm_stations_station_id:
            return

        now_utc = dt_util.utcnow()
        temp_c = data.get(KEY_NORM_TEMP_C)
        humidity = data.get(KEY_NORM_HUMIDITY)
        press = data.get(KEY_SEA_LEVEL_PRESSURE_HPA) or data.get(KEY_NORM_PRESSURE_HPA)
        wind_dir = data.get(KEY_NORM_WIND_DIR_DEG)
        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS)
        gust_ms = data.get(KEY_NORM_WIND_GUST_MS)
        rain_1h = data.get(KEY_RAIN_ACCUM_1H)

        # OWM Stations API expects a JSON array of measurement objects.
        measurement: dict[str, Any] = {
            "station_id": self.owm_stations_station_id,
            "dt": int(now_utc.timestamp()),
        }
        if temp_c is not None:
            measurement["temperature"] = round(float(temp_c), 1)
        if humidity is not None:
            measurement["humidity"] = int(float(humidity))
        if press is not None:
            measurement["pressure"] = round(float(press), 1)  # hPa
        if wind_ms is not None:
            measurement["wind_speed"] = round(float(wind_ms), 1)  # m/s
        if gust_ms is not None:
            measurement["wind_gust"] = round(float(gust_ms), 1)
        if wind_dir is not None:
            measurement["wind_deg"] = int(float(wind_dir))
        if rain_1h is not None:
            measurement["rain_1h"] = round(float(rain_1h), 1)

        url = f"https://api.openweathermap.org/data/3.0/measurements?appid={self.owm_stations_api_key}"
        try:
            session = async_get_clientsession(self.hass)
            async with session.post(url, json=[measurement], timeout=15) as resp:
                if resp.status in (200, 201, 204):
                    self._owm_stations_last_upload = now_utc
                    self._owm_stations_status = "ok"
                elif resp.status in (401, 403):
                    self._owm_stations_status = "error_auth"
                    _LOGGER.warning("OWM Stations upload auth error HTTP %d", resp.status)
                else:
                    self._owm_stations_status = "error_http"
                    _LOGGER.warning("OWM Stations upload HTTP %d", resp.status)
        except (aiohttp.ClientError, TimeoutError) as exc:
            self._owm_stations_status = "error_network"
            _LOGGER.warning("OWM Stations upload error: %s", exc)
        except Exception as exc:  # noqa: BLE001
            self._owm_stations_status = "error"
            _LOGGER.error("OWM Stations upload unexpected error: %s", exc)

    # ------------------------------------------------------------------
    # v2.0 - Windy.com upload (stations.windy.com)
    # ------------------------------------------------------------------

    async def _async_upload_windy(self) -> None:
        """Upload an observation to Windy.com Stations API."""
        data = self.data
        if not data or not self.windy_api_key:
            return

        now_utc = dt_util.utcnow()
        temp_c = data.get(KEY_NORM_TEMP_C)
        dew_c = data.get(KEY_DEW_POINT_C)
        humidity = data.get(KEY_NORM_HUMIDITY)
        press = data.get(KEY_SEA_LEVEL_PRESSURE_HPA) or data.get(KEY_NORM_PRESSURE_HPA)
        wind_dir = data.get(KEY_NORM_WIND_DIR_DEG)
        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS)
        gust_ms = data.get(KEY_NORM_WIND_GUST_MS)
        rain_1h = data.get(KEY_RAIN_ACCUM_1H)

        obs: dict[str, Any] = {"dateutc": now_utc.strftime("%Y-%m-%d %H:%M:%S")}
        try:
            obs["station"] = int(self.windy_station_id) if self.windy_station_id else 0
        except (TypeError, ValueError):
            obs["station"] = 0
        if temp_c is not None:
            obs["temp"] = round(float(temp_c), 1)  # Windy accepts °C
        if dew_c is not None:
            obs["dewpoint"] = round(float(dew_c), 1)
        if humidity is not None:
            obs["rh"] = int(float(humidity))
        if press is not None:
            obs["pressure"] = round(float(press) * 100.0)  # Windy wants Pa
        if wind_ms is not None:
            obs["wind"] = round(float(wind_ms), 1)  # m/s
        if gust_ms is not None:
            obs["gust"] = round(float(gust_ms), 1)
        if wind_dir is not None:
            obs["winddir"] = int(float(wind_dir))
        if rain_1h is not None:
            obs["precip"] = round(float(rain_1h), 1)  # mm last hour

        url = f"https://stations.windy.com/pws/update/{self.windy_api_key}"
        try:
            session = async_get_clientsession(self.hass)
            async with session.post(url, json={"observations": [obs]}, timeout=15) as resp:
                if resp.status in (200, 201, 204):
                    self._windy_last_upload = now_utc
                    self._windy_status = "ok"
                elif resp.status in (401, 403):
                    self._windy_status = "error_auth"
                    _LOGGER.warning("Windy upload auth error HTTP %d", resp.status)
                else:
                    self._windy_status = "error_http"
                    _LOGGER.warning("Windy upload HTTP %d", resp.status)
        except (aiohttp.ClientError, TimeoutError) as exc:
            self._windy_status = "error_network"
            _LOGGER.warning("Windy upload error: %s", exc)
        except Exception as exc:  # noqa: BLE001
            self._windy_status = "error"
            _LOGGER.error("Windy upload unexpected error: %s", exc)

    # ------------------------------------------------------------------
    # CSV / JSON export  (v0.6.0)
    # ------------------------------------------------------------------

    # ------------------------------------------------------------------
    # v1.5.0 - Wind run, chill hours, clearness / cloud cover
    # ------------------------------------------------------------------

    def _compute_wind_run(self, data: dict, now: Any) -> None:
        """Accumulate daily wind run (km).  Resets at local midnight."""
        local_now = dt_util.now()
        date_str = local_now.strftime("%Y-%m-%d")

        if date_str != self._wind_run_date:
            self._wind_run_km = 0.0
            self._wind_run_date = date_str
            self._wind_run_last_ts = None

        # Monthly accumulator resets on the 1st of each month
        month_key = local_now.strftime("%Y-%m")
        if month_key != self._wind_run_month_key:
            self._wind_run_month_km = 0.0
            self._wind_run_month_key = month_key

        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS)
        if wind_ms is not None and self._wind_run_last_ts is not None:
            dt_s = (now - self._wind_run_last_ts).total_seconds()
            increment_km = float(wind_ms) * dt_s / 1000.0  # m/s * s → m → km
            self._wind_run_km += increment_km
            self._wind_run_month_km += increment_km
        if wind_ms is not None:
            self._wind_run_last_ts = now

        data[KEY_WIND_RUN_KM] = round(self._wind_run_km, 2)
        data[KEY_WIND_RUN_MONTH_KM] = round(self._wind_run_month_km, 2)

    def _compute_chill_hours(self, data: dict, now: Any) -> None:
        """Accumulate chill hours today and season.

        A chill hour is one hour spent at or below ``_chill_hour_base_c``.
        Fractional hours are accumulated using actual elapsed seconds.
        Season counter resets on ``_chill_season_reset_month``/``_chill_season_reset_day``.
        """
        local_now = dt_util.now()
        date_str = local_now.strftime("%Y-%m-%d")
        season_reset_key = f"{local_now.year}-{self._chill_season_reset_month:02d}-{self._chill_season_reset_day:02d}"

        # Daily reset
        if date_str != self._chill_hours_today_date:
            self._chill_hours_today = 0.0
            self._chill_hours_today_date = date_str

        # Season reset (once per year on the configured date)
        if season_reset_key != self._chill_hours_season_date and date_str == season_reset_key:
            self._chill_hours_season = 0.0
            self._chill_hours_season_date = season_reset_key

        tc = data.get(KEY_NORM_TEMP_C)
        if tc is not None and self._chill_hours_last_ts is not None:
            dt_h = (now - self._chill_hours_last_ts).total_seconds() / 3600.0
            if float(tc) <= self._chill_hour_base_c:
                self._chill_hours_today += dt_h
                self._chill_hours_season += dt_h
        if tc is not None:
            self._chill_hours_last_ts = now

        data[KEY_CHILL_HOURS_TODAY] = round(self._chill_hours_today, 2)
        data[KEY_CHILL_HOURS_SEASON] = round(self._chill_hours_season, 1)

    def _compute_clearness_and_cloud(self, data: dict) -> None:
        """Compute clearness index Kt and approximate cloud cover %."""
        solar_rad = self._get_solar_radiation()
        if solar_rad is None:
            return

        sun_state = self.hass.states.get("sun.sun")
        if sun_state is None:
            return
        sun_elev = float(sun_state.attributes.get("elevation", 0))

        kt = calculate_clearness_index(float(solar_rad), sun_elev)
        if kt is not None:
            data[KEY_CLEARNESS_INDEX] = kt
            data[KEY_CLOUD_COVER_PCT] = clearness_to_cloud_cover(kt)

    # ------------------------------------------------------------------
    # v0.9.0 - Solar radiation source helper
    # ------------------------------------------------------------------

    def _get_solar_radiation(self) -> float | None:
        """Read optional solar radiation sensor (W/m²) from sources."""
        from .const import SRC_SOLAR_RADIATION

        eid = self.sources.get(SRC_SOLAR_RADIATION)
        if not eid:
            return None
        return self._num(self.hass, eid)

    # ------------------------------------------------------------------
    # v0.7.0 - Air Quality fetch (Open-Meteo AQI API, free, no key)
    # ------------------------------------------------------------------

    async def _async_fetch_aqi(self) -> None:
        """Fetch air quality + pollen from Open-Meteo Air Quality API.

        v0.3.0: pollen now comes from this same API (single fetch) instead of
        Tomorrow.io. Open-Meteo's pollen fields use European Aerobiology
        Network / Copernicus levels in grains/m³ for alder, birch, grass,
        mugwort, olive, ragweed.
        """
        if not (self.forecast_lat is not None and self.forecast_lon is not None):
            return
        if not (self.aqi_enabled or self.pollen_enabled):
            return

        lat = self.forecast_lat
        lon = self.forecast_lon
        # Build params depending on what's enabled
        current_params = []
        if self.aqi_enabled:
            current_params.extend(["pm10", "pm2_5", "carbon_monoxide", "nitrogen_dioxide", "ozone"])
        if self.pollen_enabled:
            current_params.extend(
                ["alder_pollen", "birch_pollen", "grass_pollen", "mugwort_pollen", "olive_pollen", "ragweed_pollen"]
            )
        url = (
            "https://air-quality-api.open-meteo.com/v1/air-quality"
            f"?latitude={lat}&longitude={lon}"
            f"&current={','.join(current_params)}"
            "&timezone=auto"
        )
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                    if resp.status != 200:
                        _LOGGER.warning("ws_core AQI/pollen fetch failed: HTTP %s", resp.status)
                        return
                    raw = await resp.json()
            cur = raw.get("current", {})

            # AQI side
            if self.aqi_enabled:
                pm25 = cur.get("pm2_5")
                pm10 = cur.get("pm10")
                no2 = cur.get("nitrogen_dioxide")
                ozone = cur.get("ozone")
                co = cur.get("carbon_monoxide")
                aqi_val = calculate_us_aqi(pm25, pm10)
                self._aqi_cache = {
                    "pm2_5": pm25,
                    "pm10": pm10,
                    "no2": no2,
                    "ozone": ozone,
                    "co": co,
                    "aqi": aqi_val,
                    "aqi_level": aqi_level(aqi_val) if aqi_val is not None else None,
                    "fetched_at": dt_util.utcnow().isoformat(),
                }
                self.runtime.last_aqi_fetch = dt_util.utcnow()
                _LOGGER.debug("ws_core AQI fetched: AQI=%s (%s)", aqi_val, self._aqi_cache.get("aqi_level"))

            # Pollen side: Open-Meteo grains/m³ -> 0-5 index per WHO/EAN bands
            if self.pollen_enabled:
                # Tree pollen = max of alder, birch, olive (these are the active
                # tree species in Open-Meteo; not all are active everywhere)
                tree_grains = max((cur.get(k) or 0) for k in ("alder_pollen", "birch_pollen", "olive_pollen"))
                grass_grains = cur.get("grass_pollen") or 0
                # Weed = max of mugwort, ragweed
                weed_grains = max(cur.get("mugwort_pollen") or 0, cur.get("ragweed_pollen") or 0)

                # WHO/EAN bands for grains/m³ (index 0-5):
                # 0 = none/not detected
                # 1 = very low (<10 trees, <5 grass, <10 weed)
                # 2 = low
                # 3 = moderate
                # 4 = high
                # 5 = very high
                def _grains_to_index(grains: float, scale: str) -> int:
                    """Convert grains/m³ to 0-5 index using species-appropriate bands."""
                    if grains is None or grains <= 0:
                        return 0
                    bands = {
                        "tree": [10, 50, 90, 1500, 2500],  # birch-dominated bands
                        "grass": [5, 20, 50, 200, 500],
                        "weed": [10, 50, 100, 200, 500],
                    }[scale]
                    for i, threshold in enumerate(bands, start=1):
                        if grains < threshold:
                            return i
                    return 5

                tree_idx = _grains_to_index(tree_grains, "tree")
                grass_idx = _grains_to_index(grass_grains, "grass")
                weed_idx = _grains_to_index(weed_grains, "weed")
                overall_idx = max(tree_idx, grass_idx, weed_idx)
                _idx_to_key = {0: "none", 1: "very_low", 2: "low", 3: "medium", 4: "high", 5: "very_high"}
                level_text = _idx_to_key[overall_idx]

                self._pollen_cache = {
                    "tree_index": tree_idx,
                    "grass_index": grass_idx,
                    "weed_index": weed_idx,
                    "overall_index": overall_idx,
                    "overall_level": level_text,
                    "tree_grains_m3": tree_grains,
                    "grass_grains_m3": grass_grains,
                    "weed_grains_m3": weed_grains,
                    "fetched_at": dt_util.utcnow().isoformat(),
                    "grass_level": _idx_to_key[grass_idx],
                    "tree_level": _idx_to_key[tree_idx],
                    "weed_level": _idx_to_key[weed_idx],
                }
                _LOGGER.debug("ws_core pollen fetched: overall=%s (%s)", overall_idx, level_text)

            await self.async_request_refresh()
        except (aiohttp.ClientError, TimeoutError, ValueError, KeyError) as exc:
            _LOGGER.warning("ws_core AQI/pollen fetch error: %s", exc)
        except Exception as exc:
            _LOGGER.error("ws_core AQI/pollen fetch unexpected error: %s", exc, exc_info=True)

    # ------------------------------------------------------------------
    # v0.9.0 - Solar forecast fetch (forecast.solar, free, no key)
    # ------------------------------------------------------------------

    async def _async_fetch_solar_forecast(self) -> None:
        """Fetch PV generation forecast from forecast.solar API."""
        if not (self.forecast_lat is not None and self.forecast_lon is not None):
            return

        lat = self.forecast_lat
        lon = self.forecast_lon
        declination = self.solar_panel_tilt
        azimuth = self.solar_panel_azimuth - 180  # forecast.solar uses -180..180 (0=south)
        kwp = self.solar_peak_kw

        # API endpoint: /estimate/<lat>/<lon>/<declination>/<azimuth>/<kwp>
        url = f"https://api.forecast.solar/estimate/{lat}/{lon}/{declination}/{azimuth}/{kwp}"

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                    if resp.status == 429:
                        _LOGGER.warning("ws_core solar forecast: forecast.solar rate limit hit")
                        return
                    if resp.status != 200:
                        _LOGGER.warning("ws_core solar forecast fetch failed: HTTP %s", resp.status)
                        return
                    raw = await resp.json()

            result = raw.get("result", {})
            # watt_hours_day: {"YYYY-MM-DD": wh, ...}
            wh_day = result.get("watt_hours_day", {})
            days = sorted(wh_day.keys())
            local_today = dt_util.now().date().isoformat()

            today_kwh = None
            tomorrow_kwh = None
            for _i, d in enumerate(days):
                if d >= local_today:
                    if today_kwh is None:
                        today_kwh = round(wh_day[d] / 1000, 2)
                    elif tomorrow_kwh is None:
                        tomorrow_kwh = round(wh_day[d] / 1000, 2)
                        break

            self._solar_cache = {
                "today_kwh": today_kwh,
                "tomorrow_kwh": tomorrow_kwh,
                "watt_hours_day": wh_day,
                "status": "OK",
                "fetched_at": dt_util.utcnow().isoformat(),
            }
            self.runtime.last_solar_fetch = dt_util.utcnow()
            _LOGGER.debug(
                "ws_core solar forecast: today=%.2f kWh, tomorrow=%.2f kWh", today_kwh or 0, tomorrow_kwh or 0
            )
            await self.async_request_refresh()
        except (aiohttp.ClientError, TimeoutError, ValueError, KeyError) as exc:
            _LOGGER.warning("ws_core solar forecast fetch error: %s", exc)
            if self._solar_cache:
                self._solar_cache["status"] = f"Error: {exc}"
        except Exception as exc:
            _LOGGER.error("ws_core solar forecast unexpected error: %s", exc, exc_info=True)
            if self._solar_cache:
                self._solar_cache["status"] = f"Error: {exc}"

    # ------------------------------------------------------------------
    # v1.6.0 - Météo Vigilance (France, OpenDataSoft, no key)
    # ------------------------------------------------------------------

    async def _async_fetch_vigilance(self) -> None:
        """Fetch Météo-France Vigilance alerts for the configured department.

        Uses the OpenDataSoft public dataset (no API key required).
        Extracts the worst alert level across all phenomena and stores
        per-phenomenon levels as attributes.
        """
        if not (self.forecast_lat is not None and self.forecast_lon is not None):
            return

        lat = self.forecast_lat
        lon = self.forecast_lon

        # Step 1: reverse-geocode to French department code via BAN API
        ban_url = f"https://api-adresse.data.gouv.fr/reverse/?lon={lon}&lat={lat}"
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(ban_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status != 200:
                        _LOGGER.debug("ws_core vigilance: BAN geocode failed HTTP %s", resp.status)
                        return
                    geo = await resp.json()
        except (aiohttp.ClientError, TimeoutError) as exc:
            _LOGGER.debug("ws_core vigilance: BAN geocode error: %s", exc)
            return

        features = geo.get("features", [])
        if not features:
            _LOGGER.debug("ws_core vigilance: no BAN result for lat=%s lon=%s (not in France?)", lat, lon)
            return

        # context = "75, Paris, Ile-de-France" - dept is the first token
        context = features[0].get("properties", {}).get("context", "")
        dept = context.split(",")[0].strip() if context else None
        if not dept:
            _LOGGER.debug("ws_core vigilance: could not extract dept from context=%r", context)
            return

        # Step 2: query Météo Vigilance dataset for today's alerts (echeance=J)
        ods_url = (
            "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/"
            "weatherref-france-vigilance-meteo-departement/records"
            f"?where=domain_id%3D%22{dept}%22%20AND%20echeance%3D%22J%22"
            "&limit=20&select=phenomenon_id,phenomenon,color_id,color"
        )
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(ods_url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                    if resp.status != 200:
                        _LOGGER.warning("ws_core vigilance: ODS fetch failed HTTP %s", resp.status)
                        return
                    raw = await resp.json()
        except (aiohttp.ClientError, TimeoutError, ValueError) as exc:
            _LOGGER.warning("ws_core vigilance: ODS fetch error: %s", exc)
            return

        records = raw.get("results", [])
        if not records:
            _LOGGER.debug("ws_core vigilance: no records for dept=%s (may be outside France)", dept)
            return

        # color_id: 1=vert, 2=jaune, 3=orange, 4=rouge
        _COLOR_RANK = {"vert": 1, "jaune": 2, "orange": 3, "rouge": 4}
        phenomena: dict[str, str] = {}
        max_rank = 1
        max_color = "vert"
        for rec in records:
            ph = (rec.get("phenomenon") or "").strip()
            color = (rec.get("color") or "vert").strip()
            rank = rec.get("color_id") or _COLOR_RANK.get(color, 1)
            if ph:
                phenomena[ph] = color
            if rank > max_rank:
                max_rank = rank
                max_color = color

        self._vigilance_cache = {
            "max_color": max_color,
            "max_rank": max_rank,
            "phenomena": phenomena,
            "dept": dept,
            "fetched_at": dt_util.utcnow().isoformat(),
        }
        _LOGGER.debug(
            "ws_core vigilance fetched: dept=%s max=%s phenomena=%s",
            dept,
            max_color,
            list(phenomena.keys()),
        )
        await self.async_request_refresh()

    # ------------------------------------------------------------------
    # v1.9.0 - Vigicrues multi-station (Hub'Eau v2, France, no key)
    # ------------------------------------------------------------------

    async def _async_fetch_vigicrues(self) -> None:
        """Fetch real-time water level for all configured Vigicrues stations.

        If no stations are configured (auto-detect mode), finds the nearest
        active station within 50 km and monitors it.
        """
        if self.forecast_lat is None or self.forecast_lon is None:
            return

        stations = list(self._vigicrues_stations)  # configured stations
        need_refresh = False

        try:
            async with aiohttp.ClientSession() as session:
                # Auto-detect mode: no stations configured → find nearest
                if not stations:
                    if not self._vigicrues_auto_code:
                        lat, lon = self.forecast_lat, self.forecast_lon
                        url = (
                            "https://hubeau.eaufrance.fr/api/v2/hydrometrie/referentiel/stations"
                            f"?format=json&longitude={lon}&latitude={lat}&distance=50"
                            "&en_service=true&size=1"
                            "&fields=code_station,libelle_station,libelle_cours_eau"
                        )
                        async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                            # Hub'Eau's referentiel/stations endpoint returns
                            # HTTP 206 (Partial Content) whenever the result set
                            # doesn't include every matching station -- routine,
                            # not an error. Treat it the same as 200, matching
                            # the observations_tr fetch below (see issue #133).
                            if resp.status not in (200, 206):
                                _LOGGER.warning("ws_core Vigicrues: auto-detect HTTP %s", resp.status)
                                return
                            sdata = await resp.json()
                        found = sdata.get("data", [])
                        if not found:
                            _LOGGER.debug("ws_core Vigicrues: no station within 50 km (outside France?)")
                            return
                        st = found[0]
                        self._vigicrues_auto_code = st.get("code_station", "")
                        self._vigicrues_auto_name = st.get("libelle_station") or self._vigicrues_auto_code
                        self._vigicrues_auto_river = st.get("libelle_cours_eau") or ""
                        _LOGGER.debug(
                            "ws_core Vigicrues auto-detected: %s (%s) on %s",
                            self._vigicrues_auto_code,
                            self._vigicrues_auto_name,
                            self._vigicrues_auto_river,
                        )
                    stations = [
                        {
                            "code": self._vigicrues_auto_code or "",
                            "name": self._vigicrues_auto_name or "",
                            "river": self._vigicrues_auto_river or "",
                        }
                    ]

                for st_info in stations:
                    code = st_info.get("code", "").strip()
                    if not code:
                        continue
                    obs_url = (
                        "https://hubeau.eaufrance.fr/api/v2/hydrometrie/observations_tr"
                        f"?format=json&code_entite={code}"
                        "&grandeur_hydro=H&size=1"
                        "&fields=code_station,date_obs,resultat_obs"
                    )
                    async with session.get(obs_url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                        if resp.status not in (200, 206):
                            _LOGGER.warning("ws_core Vigicrues: observations HTTP %s for %s", resp.status, code)
                            continue
                        odata = await resp.json()

                    observations = odata.get("data", [])
                    if not observations:
                        _LOGGER.debug("ws_core Vigicrues: no observations for station %s", code)
                        continue

                    obs = observations[0]
                    raw_mm = obs.get("resultat_obs")
                    level_m = round(float(raw_mm) / 1000.0, 3) if raw_mm is not None else None

                    self._vigicrues_caches[code] = {
                        "level_m": level_m,
                        "station_code": code,
                        "station_name": st_info.get("name", code),
                        "river_name": st_info.get("river", ""),
                        "obs_time": obs.get("date_obs"),
                        "fetched_at": dt_util.utcnow().isoformat(),
                    }
                    _LOGGER.debug(
                        "ws_core Vigicrues: %s (%s) level=%.3f m at %s",
                        st_info.get("name", code),
                        code,
                        level_m or 0,
                        obs.get("date_obs"),
                    )

                    # Try to fetch flow data (Q) — not all stations provide it
                    flow_url = (
                        "https://hubeau.eaufrance.fr/api/v2/hydrometrie/observations_tr"
                        f"?format=json&code_entite={code}"
                        "&grandeur_hydro=Q&size=1"
                        "&fields=code_station,date_obs,resultat_obs"
                    )
                    try:
                        async with session.get(flow_url, timeout=aiohttp.ClientTimeout(total=15)) as fresp:
                            if fresp.status in (200, 206):
                                fdata = await fresp.json()
                                fobs = fdata.get("data", [])
                                if fobs:
                                    raw_q = fobs[0].get("resultat_obs")
                                    flow_m3s = round(float(raw_q), 3) if raw_q is not None else None
                                    self._vigicrues_caches[code]["flow_m3s"] = flow_m3s
                                    self._vigicrues_caches[code]["flow_obs_time"] = fobs[0].get("date_obs")
                                    _LOGGER.debug(
                                        "ws_core Vigicrues: %s flow=%.3f m³/s",
                                        code,
                                        flow_m3s or 0,
                                    )
                    except (aiohttp.ClientError, TimeoutError, ValueError):
                        pass  # Flow data is optional; level data still reported

                    need_refresh = True

        except (aiohttp.ClientError, TimeoutError, ValueError) as exc:
            _LOGGER.warning("ws_core Vigicrues fetch error: %r", exc)
            return
        except Exception as exc:
            _LOGGER.error("ws_core Vigicrues unexpected error: %s", exc, exc_info=True)
            return

        if need_refresh:
            await self.async_request_refresh()
