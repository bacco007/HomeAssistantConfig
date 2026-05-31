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
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

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
    calculate_apparent_temperature,
    calculate_clearness_index,
    calculate_delta_t,
    calculate_dew_point,
    calculate_frost_point,
    calculate_heat_index,
    calculate_humidex,
    calculate_moon_illumination,
    calculate_rain_probability,
    calculate_thsw_index,
    calculate_thw_index,
    calculate_us_aqi,
    calculate_vpd,
    calculate_wet_bulb,
    calculate_wind_chill,
    clearness_to_cloud_cover,
    combine_rain_probability,
    compute_fwi,
    cross_sensor_consistency_flags,
    derive_nowcast,
    determine_current_condition,
    direction_to_quadrant,
    et0_hargreaves,
    et0_hourly_estimate,
    et0_penman_monteith,
    fog_probability,
    format_rain_display,
    get_condition_severity,
    humidity_level,
    least_squares_pressure_trend,
    linear_regression_slope,
    moon_display_string,
    moon_next_phase_days,
    moon_phase_days,
    moon_phase_from_age,
    pressure_trend_arrow,
    pressure_trend_display,
    smooth_wind_direction,
    thunderstorm_risk_index,
    uv_level,
    wind_speed_to_beaufort,
    zambretti_forecast,
)
from .const import (
    CONF_AQI_INTERVAL_MIN,
    CONF_CHILL_HOUR_BASE_C,
    CONF_CHILL_SEASON_RESET_DAY,
    CONF_CHILL_SEASON_RESET_MONTH,
    CONF_CLIMATE_REGION,
    CONF_ELEVATION_M,
    CONF_ENABLE_AIR_QUALITY,
    CONF_ENABLE_COMFORT_INDICES,
    CONF_ENABLE_FIRE_RISK,
    # v0.6.0 new
    # v0.5.0 new
    CONF_ENABLE_FOG,
    CONF_ENABLE_MOON,
    CONF_ENABLE_NOWCAST,
    CONF_ENABLE_POLLEN,
    CONF_ENABLE_SEA_TEMP,
    CONF_ENABLE_SOLAR_FORECAST,
    CONF_ENABLE_THUNDERSTORM,
    CONF_ENABLE_VIGICRUES,
    CONF_ENABLE_VIGILANCE_METEO,
    CONF_ENABLE_WUNDERGROUND,
    CONF_FORECAST_API_KEY,
    CONF_FORECAST_ENABLED,
    CONF_FORECAST_INTERVAL_MIN,
    CONF_FORECAST_LAT,
    CONF_FORECAST_LON,
    CONF_FORECAST_PROVIDER,
    CONF_HEMISPHERE,
    CONF_NOWCAST_INTERVAL_MIN,
    # Tuning numbers (previously no-op, now wired)
    CONF_PRESSURE_TREND_WINDOW_H,
    CONF_RAIN_FILTER_ALPHA,
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
    CONF_WU_API_KEY,
    CONF_WU_INTERVAL_MIN,
    CONF_WU_STATION_ID,
    DEFAULT_AQI_INTERVAL_MIN,
    DEFAULT_CHILL_HOUR_BASE_C,
    DEFAULT_CHILL_SEASON_RESET_DAY,
    DEFAULT_CHILL_SEASON_RESET_MONTH,
    DEFAULT_CLIMATE_REGION,
    DEFAULT_ENABLE_AIR_QUALITY,
    DEFAULT_ENABLE_COMFORT_INDICES,
    DEFAULT_ENABLE_FIRE_RISK,
    DEFAULT_ENABLE_FOG,
    DEFAULT_ENABLE_MOON,
    DEFAULT_ENABLE_NOWCAST,
    DEFAULT_ENABLE_POLLEN,
    DEFAULT_ENABLE_SOLAR_FORECAST,
    DEFAULT_ENABLE_THUNDERSTORM,
    DEFAULT_ENABLE_VIGICRUES,
    DEFAULT_ENABLE_VIGILANCE_METEO,
    DEFAULT_ENABLE_WUNDERGROUND,
    DEFAULT_FORECAST_INTERVAL_MIN,
    DEFAULT_FORECAST_PROVIDER,
    DEFAULT_HEMISPHERE,
    DEFAULT_NOWCAST_INTERVAL_MIN,
    DEFAULT_PRESSURE_TREND_WINDOW_H,
    DEFAULT_RAIN_FILTER_ALPHA,
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
    # v1.5.0
    KEY_ABSOLUTE_HUMIDITY,
    KEY_ALERT_MESSAGE,
    KEY_ALERT_STATE,
    # v0.7.0
    KEY_AQI,
    KEY_AQI_LEVEL,
    KEY_BATTERY_DISPLAY,
    KEY_BATTERY_PCT,
    KEY_CHILL_HOURS_SEASON,
    KEY_CHILL_HOURS_TODAY,
    KEY_CLEARNESS_INDEX,
    KEY_CLIMATOLOGY_30D,
    KEY_CLOUD_COVER_PCT,
    KEY_CONSISTENCY_FLAGS,
    KEY_CURRENT_CONDITION,
    KEY_DATA_QUALITY,
    KEY_DELTA_T,
    KEY_DEW_POINT_C,
    KEY_DRY_STREAK,
    KEY_ET0_DAILY_MM,
    KEY_ET0_HOURLY_MM,
    KEY_ET0_PM_DAILY_MM,
    KEY_FEELS_LIKE_C,
    KEY_FIRE_DANGER_VIGILANCE,
    KEY_FIRE_RISK_SCORE,
    KEY_FOG_PROBABILITY,
    KEY_FORECAST,
    KEY_FORECAST_AGREEMENT,
    KEY_FORECAST_SKILL,
    KEY_FORECAST_TILES,
    KEY_FROST_POINT_C,
    KEY_FROST_STREAK,
    KEY_FWI,
    KEY_FWI_BUI,
    KEY_FWI_DC,
    KEY_FWI_DMC,
    KEY_FWI_DSR,
    KEY_FWI_FFMC,
    KEY_FWI_ISI,
    KEY_HEALTH_DISPLAY,
    KEY_HEAT_INDEX,
    KEY_HEAT_STREAK,
    KEY_HUMIDEX,
    KEY_HUMIDITY_LEVEL_DISPLAY,
    KEY_LUX,
    KEY_MINUTES_UNTIL_DRY,
    KEY_MINUTES_UNTIL_RAIN,
    KEY_MOON_AGE_DAYS,
    KEY_MOON_DISPLAY,
    KEY_MOON_ILLUMINATION_PCT,
    KEY_MOON_NEXT_FULL,
    KEY_MOON_NEXT_NEW,
    KEY_MOON_PHASE,
    # v0.8.0
    KEY_NO2,
    KEY_NORM_HUMIDITY,
    KEY_NORM_PRESSURE_HPA,
    KEY_NORM_RAIN_TOTAL_MM,
    KEY_NORM_TEMP_C,
    KEY_NORM_WIND_DIR_DEG,
    KEY_NORM_WIND_GUST_MS,
    KEY_NORM_WIND_SPEED_MS,
    KEY_NOWCAST_INTENSITY,
    KEY_OZONE,
    KEY_PACKAGE_OK,
    KEY_PACKAGE_STATUS,
    KEY_PM2_5,
    KEY_PM10,
    KEY_POLLEN_GRASS,
    KEY_POLLEN_OVERALL,
    KEY_POLLEN_TREE,
    KEY_POLLEN_WEED,
    KEY_PRESSURE_CHANGE_WINDOW_HPA,
    KEY_PRESSURE_TREND_DISPLAY,
    KEY_PRESSURE_TREND_HPAH,
    KEY_RAIN_ACCUM_1H,
    KEY_RAIN_ACCUM_24H,
    KEY_RAIN_ANOMALY_30D,
    KEY_RAIN_DISPLAY,
    KEY_RAIN_EXPECTED_1H,
    KEY_RAIN_NEXT_60MIN,
    KEY_RAIN_PROBABILITY,
    KEY_RAIN_PROBABILITY_COMBINED,
    KEY_RAIN_RATE_FILT,
    KEY_RAIN_TODAY_MM,
    KEY_SEA_LEVEL_PRESSURE_HPA,
    KEY_SEA_SURFACE_TEMP,
    KEY_SENSOR_DRIFT_FLAGS,
    KEY_SENSOR_QUALITY_FLAGS,
    KEY_SOLAR_FORECAST_STATUS,
    # v0.9.0
    KEY_SOLAR_FORECAST_TODAY_KWH,
    KEY_SOLAR_FORECAST_TOMORROW_KWH,
    KEY_SOLAR_LUX_FACTOR,
    KEY_TEMP_ANOMALY_30D,
    KEY_TEMP_AVG_24H,
    KEY_TEMP_DISPLAY,
    KEY_TEMP_HIGH_24H,
    KEY_TEMP_LOW_24H,
    KEY_THSW_INDEX,
    KEY_THUNDERSTORM_RISK,
    KEY_THW_INDEX,
    KEY_UV,
    KEY_UV_LEVEL_DISPLAY,
    KEY_VIGILANCE_MAX_LEVEL,
    KEY_VPD,
    KEY_WET_BULB_C,
    KEY_WIND_BEAUFORT,
    KEY_WIND_BEAUFORT_DESC,
    KEY_WIND_CHILL,
    KEY_WIND_DIR_SMOOTH_DEG,
    KEY_WIND_GUST_MAX_24H,
    KEY_WIND_QUADRANT,
    KEY_WIND_RUN_KM,
    KEY_WU_STATUS,
    KEY_ZAMBRETTI_FORECAST,
    KEY_ZAMBRETTI_NUMBER,
    LEARNING_SAVE_INTERVAL_S,
    PRESSURE_HISTORY_INTERVAL_MIN,
    PRESSURE_HISTORY_SAMPLES,
    RAIN_RATE_PHYSICAL_CAP_MMPH,
    REQUIRED_SOURCES,
    SRC_BATTERY,
    SRC_DEW_POINT,
    SRC_GUST,
    SRC_HUM,
    SRC_LUX,
    SRC_PRESS,
    SRC_RAIN_TOTAL,
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
)
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
        self.entry_options = entry_options or {}
        self.runtime = WSStationRuntime()

        self.sources: dict[str, str] = dict(entry_data.get(CONF_SOURCES, {}))

        def _get(key: str, default: Any) -> Any:
            return self.entry_options.get(key, entry_data.get(key, default))

        self.units_mode = str(_get(CONF_UNITS_MODE, "auto"))
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

        # v0.3.0: degree days removed entirely (HDD/CDD/GDD)
        # v0.3.0: Fire risk score (kept; opt-in via wizard)
        self.fire_risk_enabled = bool(_get(CONF_ENABLE_FIRE_RISK, DEFAULT_ENABLE_FIRE_RISK))

        # Rain today - resets at local midnight
        self._rain_today_mm: float = 0.0
        self._rain_today_date: str = ""
        self._rain_today_last_total: float | None = None
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

        # Wind run accumulator - resets at local midnight (like rain_today)
        self._wind_run_km: float = 0.0
        self._wind_run_date: str = ""
        self._wind_run_last_ts: Any = None

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

        entity_ids = [eid for eid in self.sources.values() if eid]
        if entity_ids:
            self._unsubs.append(async_track_state_change_event(self.hass, entity_ids, self._handle_source_change))
        self._unsubs.append(async_track_time_interval(self.hass, self._handle_tick, timedelta(seconds=60)))

        # v0.3.0: removed METAR fetch, CWOP upload, CSV/JSON export schedulers.
        # v0.3.0: pollen no longer has its own scheduler - it piggybacks on
        # the Open-Meteo Air Quality fetch (same API, same call).

        # Weather Underground periodic upload (kept disabled-by-default for v0.6 roadmap)
        if self.wu_enabled and self.wu_station_id and self.wu_api_key:
            self._unsubs.append(
                async_track_time_interval(
                    self.hass,
                    lambda _now: self.hass.async_create_task(self._async_upload_wunderground()),
                    timedelta(minutes=self.wu_interval_min),
                )
            )

        # Air quality + pollen periodic fetch (Open-Meteo Air Quality API, single call)
        if (
            (self.aqi_enabled or self.pollen_enabled)
            and self.forecast_lat is not None
            and self.forecast_lon is not None
        ):
            self._unsubs.append(
                async_track_time_interval(
                    self.hass,
                    lambda _now: self.hass.async_create_task(self._async_fetch_aqi()),
                    timedelta(minutes=self.aqi_interval_min),
                )
            )

            async def _deferred_aqi():
                await asyncio.sleep(10)
                try:
                    await self._async_fetch_aqi()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: deferred AQI fetch failed (will retry): %s", err)

            self.hass.async_create_task(_deferred_aqi())

        # Solar forecast periodic fetch
        if self.solar_forecast_enabled and self.forecast_lat is not None and self.forecast_lon is not None:
            self._unsubs.append(
                async_track_time_interval(
                    self.hass,
                    lambda _now: self.hass.async_create_task(self._async_fetch_solar_forecast()),
                    timedelta(minutes=self.solar_interval_min),
                )
            )

            async def _deferred_solar():
                await asyncio.sleep(30)
                try:
                    await self._async_fetch_solar_forecast()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: deferred solar forecast fetch failed (will retry): %s", err)

            self.hass.async_create_task(_deferred_solar())

        # Météo Vigilance periodic fetch (every 30 min; alerts rarely change faster)
        if self.vigilance_meteo_enabled and self.forecast_lat is not None and self.forecast_lon is not None:
            self._unsubs.append(
                async_track_time_interval(
                    self.hass,
                    lambda _now: self.hass.async_create_task(self._async_fetch_vigilance()),
                    timedelta(minutes=30),
                )
            )

            async def _deferred_vigilance():
                await asyncio.sleep(45)
                try:
                    await self._async_fetch_vigilance()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: deferred vigilance fetch failed (will retry): %s", err)

            self.hass.async_create_task(_deferred_vigilance())

        # Vigicrues periodic fetch (every 15 min; river levels update frequently)
        if self.vigicrues_enabled and self.forecast_lat is not None and self.forecast_lon is not None:
            self._unsubs.append(
                async_track_time_interval(
                    self.hass,
                    lambda _now: self.hass.async_create_task(self._async_fetch_vigicrues()),
                    timedelta(minutes=15),
                )
            )

            async def _deferred_vigicrues():
                await asyncio.sleep(60)
                try:
                    await self._async_fetch_vigicrues()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: deferred Vigicrues fetch failed (will retry): %s", err)

            self.hass.async_create_task(_deferred_vigicrues())

        # v1.7.0 Precipitation nowcast (Open-Meteo minutely_15; refresh often)
        if self.nowcast_enabled and self.forecast_lat is not None and self.forecast_lon is not None:
            self._unsubs.append(
                async_track_time_interval(
                    self.hass,
                    lambda _now: self.hass.async_create_task(self._async_fetch_nowcast()),
                    timedelta(minutes=self.nowcast_interval_min),
                )
            )

            async def _deferred_nowcast():
                await asyncio.sleep(20)
                try:
                    await self._async_fetch_nowcast()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("ws_core: deferred nowcast fetch failed (will retry): %s", err)

            self.hass.async_create_task(_deferred_nowcast())

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
        rh = round(h_raw, 1) if h_raw is not None else None
        if rh is not None:
            rh = round(max(0.0, min(100.0, rh + float(self.entry_options.get("cal_humidity", 0.0)))), 1)
            data[KEY_NORM_HUMIDITY] = rh

        p_raw = num(SRC_PRESS)
        pressure_hpa = round(self._to_hpa(p_raw, uom(SRC_PRESS)), 1) if p_raw is not None else None
        if pressure_hpa is not None:
            pressure_hpa = round(pressure_hpa + float(self.entry_options.get("cal_pressure_hpa", 0.0)), 1)
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
        wind_dir = round(float(wd_raw), 1) if wd_raw is not None else None
        if wind_dir is not None:
            data[KEY_NORM_WIND_DIR_DEG] = wind_dir

        rtot_raw = num(SRC_RAIN_TOTAL)
        rain_total_mm = round(self._to_mm(rtot_raw, uom(SRC_RAIN_TOTAL)), 2) if rtot_raw is not None else None
        if rain_total_mm is not None:
            data[KEY_NORM_RAIN_TOTAL_MM] = rain_total_mm

        lux_raw = num(SRC_LUX)
        lux = round(lux_raw, 1) if lux_raw is not None else None
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

        return dew_c

    def _compute_derived_pressure(
        self, data: dict, now: Any, tc: float | None, pressure_hpa: float | None, rh: float | None
    ) -> tuple[float, float]:
        """MSLP, pressure history, trend, Zambretti. Returns (trend_3h, mslp_or_0)."""
        from .algorithms import calculate_sea_level_pressure

        rt = self.runtime

        mslp: float | None = None
        if pressure_hpa is not None and tc is not None:
            mslp = calculate_sea_level_pressure(float(pressure_hpa), self.elevation_m, float(tc))
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
                dv = float(rain_total_mm) - float(rt.last_rain_total_mm)
                dt_h = max(1e-6, (now - rt.last_rain_ts).total_seconds() / 3600.0)
                if dv < -0.1:
                    dv = 0.0
                raw = max(0.0, min(dv / dt_h, RAIN_RATE_PHYSICAL_CAP_MMPH))
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

        # Configurable alerts
        gust_thr = float(self.entry_options.get(CONF_THRESH_WIND_GUST_MS, DEFAULT_THRESH_WIND_GUST_MS))
        rain_thr = float(self.entry_options.get(CONF_THRESH_RAIN_RATE_MMPH, DEFAULT_THRESH_RAIN_RATE_MMPH))
        freeze_thr = float(self.entry_options.get(CONF_THRESH_FREEZE_C, DEFAULT_THRESH_FREEZE_C))

        gust_ms = data.get(KEY_NORM_WIND_GUST_MS)
        rain_rate = data.get(KEY_RAIN_RATE_FILT) or 0.0
        tc = data.get(KEY_NORM_TEMP_C)

        active_alerts: list[dict] = []

        if gust_ms is not None and float(gust_ms) >= gust_thr:
            active_alerts.append(
                {
                    "type": "wind",
                    "severity": "warning",
                    "message": f"Extreme wind: {float(gust_ms):.1f} m/s",
                    "icon": "mdi:weather-windy",
                    "color": "rgba(239,68,68,0.9)",
                }
            )
        if float(rain_rate) >= rain_thr:
            active_alerts.append(
                {
                    "type": "rain",
                    "severity": "warning",
                    "message": f"Heavy rain: {float(rain_rate):.1f} mm/h",
                    "icon": "mdi:weather-pouring",
                    "color": "rgba(59,130,246,0.9)",
                }
            )
        if tc is not None and float(tc) <= freeze_thr:
            active_alerts.append(
                {
                    "type": "freeze",
                    "severity": "advisory",
                    "message": f"Freeze risk: {float(tc):.1f}\u00b0C",
                    "icon": "mdi:snowflake-alert",
                    "color": "rgba(147,197,253,0.9)",
                }
            )

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
            alert_msg = "All clear"
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
                    ir.async_create_issue(
                        self.hass,
                        DOMAIN,
                        "forecast_api_failures",
                        is_fixable=False,
                        severity=ir.IssueSeverity.WARNING,
                        translation_key="forecast_api_failures",
                        translation_placeholders={"failures": str(self.runtime.forecast_consecutive_failures)},
                    )
                else:
                    ir.async_delete_issue(self.hass, DOMAIN, "forecast_api_failures")

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

    # ------------------------------------------------------------------
    # v1.2.0 - 30-day rolling climatology
    # ------------------------------------------------------------------

    def _compute_climatology(self, data: dict) -> None:
        """Publish rolling 30-day stats and today-vs-normal anomalies."""
        from .learning_state import climatology_stats

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

        # Solar lux factor (always published)
        data[KEY_SOLAR_LUX_FACTOR] = self._learning_state.solar_lux_factor
        data["_solar_lux_factor_n_days"] = self._learning_state.solar_factor_n

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
            "pressure_history": [float(v) for v in rt.pressure_history],
            "pressure_history_ts": pts.isoformat() if hasattr(pts, "isoformat") else None,
            "rain_today_mm": self._rain_today_mm,
            "rain_today_date": self._rain_today_date,
            "rain_today_last_total": self._rain_today_last_total,
            "rain_prev_day_mm": self._rain_prev_day_mm,
            "rain_prev_day_date": self._rain_prev_day_date,
            "wind_run_km": self._wind_run_km,
            "wind_run_date": self._wind_run_date,
            "chill_hours_today": self._chill_hours_today,
            "chill_hours_today_date": self._chill_hours_today_date,
            "chill_hours_season": self._chill_hours_season,
            "chill_hours_season_date": self._chill_hours_season_date,
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
        if data.get("chill_hours_today_date") == today:
            self._chill_hours_today = float(data.get("chill_hours_today") or 0.0)
            self._chill_hours_today_date = today
        # Season chill total persists across days; its own reset logic handles rollover.
        self._chill_hours_season = float(data.get("chill_hours_season") or 0.0)
        self._chill_hours_season_date = data.get("chill_hours_season_date") or ""

    # ------------------------------------------------------------------
    # Main orchestrator
    # ------------------------------------------------------------------

    def _compute(self) -> dict[str, Any]:
        import time

        t0 = time.monotonic()
        data: dict[str, Any] = {}
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

        self._compute_et0(data, now)
        self._compute_health(data, now, missing, missing_entities)

        # v0.3.0: renamed _compute_fog_precip_type -> _compute_fog_and_thunderstorm
        # (precipitation_type was redundant with rain_rate + temperature)
        self._compute_fog_and_thunderstorm(data, now, tc, dew_c, wind_ms, rain_rate)
        # v0.3.0: streaks now run unconditionally (used to be gated behind
        # the now-removed `degree_days_enabled` flag, which was wrong - streaks
        # are independent of GDD).
        self._compute_streaks(data, now)
        self._compute_climatology(data)
        self._compute_drift_detection(data, now)
        self._compute_consistency_checks(data, now)
        self._compute_learning_sensors(data)

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
                data[f"_river_station_name_{code}"] = vr.get("station_name")
                data[f"_river_name_{code}"] = vr.get("river_name")
                data[f"_river_obs_time_{code}"] = vr.get("obs_time")
                data[f"_river_station_code_{code}"] = vr.get("station_code")

        # v1.7.0 - Precipitation nowcast (Open-Meteo minutely_15)
        if self.nowcast_enabled and self._nowcast_cache:
            nc = self._nowcast_cache
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
            data[KEY_MOON_DISPLAY] = moon_display_string(phase_key, illum_pct)
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
                )
                data[KEY_ET0_PM_DAILY_MM] = et0_pm

        # --- v1.5.0 wind run, chill hours, clearness index ---
        if self.comfort_indices_enabled:
            self._compute_wind_run(data, now)
            self._compute_chill_hours(data, now)
            self._compute_clearness_and_cloud(data)

        self.runtime.last_compute_ms = round((time.monotonic() - t0) * 1000, 1)
        return data

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

        from homeassistant.helpers.aiohttp_client import async_get_clientsession

        session = async_get_clientsession(self.hass)
        provider = get_provider(self.forecast_provider)
        try:
            result = await provider.async_fetch(session, lat, lon, api_key=self.forecast_api_key)
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
            from homeassistant.helpers.aiohttp_client import async_get_clientsession

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
            from homeassistant.helpers.aiohttp_client import async_get_clientsession

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
            session = self.hass.helpers.aiohttp_client.async_get_clientsession()
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

        wind_ms = data.get(KEY_NORM_WIND_SPEED_MS)
        if wind_ms is not None and self._wind_run_last_ts is not None:
            dt_s = (now - self._wind_run_last_ts).total_seconds()
            self._wind_run_km += float(wind_ms) * dt_s / 1000.0  # m/s * s → m → km
        if wind_ms is not None:
            self._wind_run_last_ts = now

        data[KEY_WIND_RUN_KM] = round(self._wind_run_km, 2)

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
                            if resp.status != 200:
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
                    need_refresh = True

        except (aiohttp.ClientError, TimeoutError, ValueError) as exc:
            _LOGGER.warning("ws_core Vigicrues fetch error: %s", exc)
            return
        except Exception as exc:
            _LOGGER.error("ws_core Vigicrues unexpected error: %s", exc, exc_info=True)
            return

        if need_refresh:
            await self.async_request_refresh()
