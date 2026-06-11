"""Constants for Weather Station Core."""

DOMAIN = "ws_core"

PLATFORMS = ["sensor", "binary_sensor", "weather", "select", "switch", "number", "event"]

# ---------------------------------------------------------------------------
# Configuration keys
# ---------------------------------------------------------------------------
CONF_NAME = "name"
CONF_PREFIX = "prefix"
CONF_SOURCES = "sources"
CONF_UNITS_MODE = "units_mode"  # auto | metric | imperial
CONF_TEMP_UNIT = "temp_unit"  # auto | C | F
CONF_ELEVATION_M = "elevation_m"
CONF_HEMISPHERE = "hemisphere"  # Northern | Southern
CONF_CLIMATE_REGION = "climate_region"  # for Zambretti wind pattern
CONF_STALENESS_S = "staleness_s"
CONF_FORECAST_ENABLED = "forecast_enabled"
CONF_FORECAST_LAT = "forecast_lat"
CONF_FORECAST_LON = "forecast_lon"
CONF_FORECAST_INTERVAL_MIN = "forecast_interval_min"
CONF_FORECAST_PROVIDER = "forecast_provider"
CONF_FORECAST_API_KEY = "forecast_api_key"
FORECAST_PROVIDER_OPEN_METEO = "open_meteo"
FORECAST_PROVIDER_MET_NO = "met_no"
FORECAST_PROVIDER_NWS = "nws_noaa"
FORECAST_PROVIDER_OWM = "openweathermap"
FORECAST_PROVIDER_PIRATE = "pirate_weather"
FORECAST_PROVIDER_METEO_FRANCE = "meteo_france"
FORECAST_PROVIDER_HA_ENTITY = "ha_weather_entity"
PROVIDERS_REQUIRING_API_KEY: set[str] = {"openweathermap", "pirate_weather", "meteo_france"}
PROVIDERS_REQUIRING_ENTITY: set[str] = {"ha_weather_entity"}
DEFAULT_FORECAST_PROVIDER = FORECAST_PROVIDER_OPEN_METEO
CONF_FORECAST_ENTITY = "forecast_entity"  # entity_id of the HA weather.* entity used as provider

# Alert & heuristic options (stored in canonical metric units internally)
CONF_THRESH_WIND_GUST_MS = "thresh_wind_gust_ms"
CONF_THRESH_RAIN_RATE_MMPH = "thresh_rain_rate_mmph"
CONF_THRESH_FREEZE_C = "thresh_freeze_c"
CONF_RAIN_FILTER_ALPHA = "rain_filter_alpha"
CONF_PRESSURE_TREND_WINDOW_H = "pressure_trend_window_h"

# Feature toggles
CONF_ENABLE_ZAMBRETTI = "enable_zambretti"
CONF_ENABLE_DISPLAY_SENSORS = "enable_display_sensors"
CONF_ENABLE_FIRE_RISK = "enable_fire_risk_score"
CONF_ENABLE_SEA_TEMP = "enable_sea_temp"
CONF_SEA_TEMP_LAT = "sea_temp_lat"
CONF_SEA_TEMP_LON = "sea_temp_lon"
CONF_RAIN_PENALTY_LIGHT_MMPH = "rain_penalty_light_mmph"
CONF_RAIN_PENALTY_HEAVY_MMPH = "rain_penalty_heavy_mmph"

# Weather Underground upload
CONF_ENABLE_WUNDERGROUND = "enable_wunderground"
CONF_WU_STATION_ID = "wu_station_id"
CONF_WU_API_KEY = "wu_api_key"
CONF_WU_INTERVAL_MIN = "wu_interval_min"

# Calibration offsets (applied after unit conversion, in canonical metric units)
CONF_CAL_TEMP_C = "cal_temp_c"
CONF_CAL_HUMIDITY = "cal_humidity"
CONF_CAL_PRESSURE_HPA = "cal_pressure_hpa"
CONF_CAL_WIND_MS = "cal_wind_ms"

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
DEFAULT_NAME = "Weather Station"
DEFAULT_PREFIX = "ws"
DEFAULT_UNITS_MODE = "auto"
DEFAULT_TEMP_UNIT = "auto"
DEFAULT_ELEVATION_M = 0.0
DEFAULT_HEMISPHERE = "Northern"
DEFAULT_CLIMATE_REGION = "Atlantic Europe"
DEFAULT_STALENESS_S = 7200  # 2 hours - many sensors (humidity, pressure) update slowly
DEFAULT_FORECAST_ENABLED = True
DEFAULT_FORECAST_INTERVAL_MIN = 30

DEFAULT_THRESH_WIND_GUST_MS = 17.0
DEFAULT_THRESH_RAIN_RATE_MMPH = 20.0
DEFAULT_THRESH_FREEZE_C = 0.0
DEFAULT_RAIN_FILTER_ALPHA = 0.7
DEFAULT_PRESSURE_TREND_WINDOW_H = 3
DEFAULT_ENABLE_ZAMBRETTI = True
DEFAULT_ENABLE_DISPLAY_SENSORS = True
DEFAULT_ENABLE_FIRE_RISK = False
DEFAULT_ENABLE_SEA_TEMP = False
DEFAULT_RAIN_PENALTY_LIGHT_MMPH = 0.2
DEFAULT_RAIN_PENALTY_HEAVY_MMPH = 5.0

DEFAULT_ENABLE_WUNDERGROUND = False
DEFAULT_WU_INTERVAL_MIN = 5

DEFAULT_CAL_TEMP_C = 0.0
DEFAULT_CAL_HUMIDITY = 0.0
DEFAULT_CAL_PRESSURE_HPA = 0.0
DEFAULT_CAL_WIND_MS = 0.0

# ---------------------------------------------------------------------------
# Selectable option lists
# ---------------------------------------------------------------------------
HEMISPHERE_OPTIONS = ["Northern", "Southern"]

CLIMATE_REGION_OPTIONS = [
    "Atlantic Europe",
    "Mediterranean",
    "Continental Europe",
    "Scandinavia",
    "North America East",
    "North America West",
    "Australia",
    "Custom",
]

UNITS_MODE_OPTIONS = ["auto", "metric", "imperial"]
TEMP_UNIT_OPTIONS = ["auto", "C", "F"]

# ---------------------------------------------------------------------------
# Physical validation limits (WMO / ICAO records)
# ---------------------------------------------------------------------------
VALID_TEMP_MIN_C = -60.0
VALID_TEMP_MAX_C = 60.0
VALID_TEMP_WARN_MIN_C = -40.0
VALID_TEMP_WARN_MAX_C = 50.0

VALID_PRESSURE_MIN_HPA = 870.0
VALID_PRESSURE_MAX_HPA = 1085.0
VALID_PRESSURE_WARN_MIN_HPA = 940.0
VALID_PRESSURE_WARN_MAX_HPA = 1060.0

VALID_ELEVATION_MIN_M = -500.0
VALID_ELEVATION_MAX_M = 9000.0

VALID_HUMIDITY_MIN = 0.0
VALID_HUMIDITY_MAX = 100.0

VALID_WIND_GUST_MAX_MS = 113.0
VALID_RAIN_RATE_MAX_MMPH = 500.0

# ---------------------------------------------------------------------------
# Canonical internal units
# ---------------------------------------------------------------------------
UNIT_TEMP_C = "\u00b0C"
UNIT_WIND_MS = "m/s"
UNIT_PRESSURE_HPA = "hPa"
UNIT_RAIN_MM = "mm"

# ---------------------------------------------------------------------------
# Coordinator data keys - BASIC SENSORS
# ---------------------------------------------------------------------------
KEY_NORM_TEMP_C = "norm_temperature_c"
KEY_NORM_HUMIDITY = "norm_humidity"
KEY_NORM_PRESSURE_HPA = "norm_pressure_hpa"
KEY_SEA_LEVEL_PRESSURE_HPA = "sea_level_pressure_hpa"
KEY_PRESSURE_CHANGE_WINDOW_HPA = "pressure_change_window_hpa"
KEY_NORM_WIND_SPEED_MS = "norm_wind_speed_ms"
KEY_NORM_WIND_GUST_MS = "norm_wind_gust_ms"
KEY_NORM_WIND_DIR_DEG = "norm_wind_dir_deg"
KEY_NORM_RAIN_TOTAL_MM = "norm_rain_total_mm"
KEY_DEW_POINT_C = "dew_point_c"
KEY_LUX = "illuminance_lx"
KEY_UV = "uv_index"
KEY_BATTERY_PCT = "battery_pct"
KEY_RAIN_RATE_RAW = "rain_rate_mmph_raw"
KEY_RAIN_RATE_FILT = "rain_rate_mmph_filtered"
KEY_ALERT_STATE = "alert_state"
KEY_ALERT_MESSAGE = "alert_message"
KEY_DATA_QUALITY = "data_quality"
KEY_PACKAGE_STATUS = "package_status"
KEY_PACKAGE_OK = "package_ok"
KEY_FORECAST = "forecast"
KEY_FORECAST_PROVIDER = "forecast_provider"

# Keys for ADVANCED METEOROLOGICAL SENSORS
KEY_FEELS_LIKE_C = "feels_like_c"
KEY_WET_BULB_C = "wet_bulb_c"
KEY_FROST_POINT_C = "frost_point_c"
KEY_ZAMBRETTI_FORECAST = "zambretti_forecast"
KEY_ZAMBRETTI_NUMBER = "zambretti_number"
KEY_WIND_BEAUFORT = "wind_beaufort"
KEY_WIND_BEAUFORT_DESC = "wind_beaufort_desc"
KEY_WIND_QUADRANT = "wind_quadrant"
KEY_WIND_DIR_SMOOTH_DEG = "wind_dir_smooth_deg"
KEY_CURRENT_CONDITION = "current_condition"
KEY_RAIN_PROBABILITY = "rain_probability"
KEY_RAIN_PROBABILITY_COMBINED = "rain_probability_combined"
KEY_FORECAST_AGREEMENT = "forecast_agreement"
KEY_RAIN_DISPLAY = "rain_display"
KEY_RAIN_ACCUM_1H = "rain_accum_1h_mm"
KEY_RAIN_ACCUM_24H = "rain_accum_24h_mm"
KEY_RAIN_TODAY_MM = "rain_today_mm"
KEY_TIME_SINCE_RAIN = "time_since_rain"
KEY_PRESSURE_TREND_DISPLAY = "pressure_trend_display"
KEY_HEALTH_DISPLAY = "health_display"
KEY_FORECAST_TILES = "forecast_tiles"

# Keys for 24H STATISTICS
KEY_TEMP_HIGH_24H = "temp_high_24h"
KEY_TEMP_LOW_24H = "temp_low_24h"
KEY_TEMP_AVG_24H = "temp_avg_24h"
KEY_WIND_GUST_MAX_24H = "wind_gust_max_24h"

# Keys for DISPLAY/FORMAT SENSORS
KEY_UV_LEVEL_DISPLAY = "uv_level_display"
KEY_HUMIDITY_LEVEL_DISPLAY = "humidity_level_display"
KEY_TEMP_DISPLAY = "temp_display"
KEY_BATTERY_DISPLAY = "battery_display"

# Activity / derived heuristics (optional, disabled by default)
KEY_LAUNDRY_SCORE = "laundry_drying_score"
KEY_STARGAZE_SCORE = "stargazing_quality"
KEY_FIRE_RISK_SCORE = "fire_risk_score"
KEY_RUNNING_SCORE = "running_score"
KEY_PRESSURE_TREND_HPAH = "pressure_trend_hpah"

# Sea surface temperature (Open-Meteo Marine API)
KEY_SEA_SURFACE_TEMP = "sea_surface_temperature"

# Sensor quality / validation flags
KEY_SENSOR_QUALITY_FLAGS = "sensor_quality_flags"

# Degree days (v0.5.0)
KEY_HDD_TODAY = "hdd_today"
KEY_CDD_TODAY = "cdd_today"
KEY_HDD_RATE = "hdd_rate"
KEY_CDD_RATE = "cdd_rate"

# METAR cross-validation (v0.5.0)
KEY_METAR_TEMP_C = "metar_temp_c"
KEY_METAR_PRESSURE_HPA = "metar_pressure_hpa"
KEY_METAR_WIND_MS = "metar_wind_ms"
KEY_METAR_WIND_DIR = "metar_wind_dir_deg"
KEY_METAR_CONDITION = "metar_condition"
KEY_METAR_DELTA_TEMP = "metar_delta_temp_c"
KEY_METAR_DELTA_PRESSURE = "metar_delta_pressure_hpa"
KEY_METAR_VALIDATION = "metar_validation"
KEY_METAR_STATION = "metar_station_id"
KEY_METAR_AGE_MIN = "metar_age_min"

# ET₀ irrigation (v0.6.0)
KEY_ET0_DAILY_MM = "et0_daily_mm"
KEY_ET0_HOURLY_MM = "et0_hourly_mm"

# Upload status (v0.6.0)
KEY_CWOP_STATUS = "cwop_upload_status"
KEY_WU_STATUS = "wu_upload_status"
KEY_LAST_EXPORT_TIME = "last_export_time"

# ---------------------------------------------------------------------------
# Source mapping keys
# ---------------------------------------------------------------------------
SRC_TEMP = "temperature"
SRC_HUM = "humidity"
SRC_PRESS = "pressure"
SRC_WIND = "wind_speed"
SRC_GUST = "wind_gust"
SRC_WIND_DIR = "wind_direction"
SRC_RAIN_TOTAL = "rain_total"
SRC_LUX = "illuminance"
SRC_UV = "uv_index"
SRC_DEW_POINT = "dew_point"
SRC_BATTERY = "battery"
SRC_SOLAR_RADIATION = "solar_radiation"  # W/m², optional
# v2.0 optional source inputs (defined here so OPTIONAL_SOURCES can reference
# them; the v2.0 feature sections below reuse these same names).
SRC_LIGHTNING_COUNT = "lightning_count"  # cumulative strike count
SRC_LIGHTNING_DISTANCE = "lightning_dist"  # nearest strike distance (km)
SRC_INDOOR_TEMP = "indoor_temp"
SRC_INDOOR_HUMIDITY = "indoor_humidity"
SRC_INDOOR_CO2 = "indoor_co2"

REQUIRED_SOURCES = [SRC_TEMP, SRC_HUM, SRC_PRESS, SRC_WIND, SRC_GUST, SRC_WIND_DIR, SRC_RAIN_TOTAL]
OPTIONAL_SOURCES = [
    SRC_LUX,
    SRC_UV,
    SRC_DEW_POINT,
    SRC_BATTERY,
    SRC_SOLAR_RADIATION,
    SRC_LIGHTNING_COUNT,
    SRC_LIGHTNING_DISTANCE,
    SRC_INDOOR_TEMP,
    SRC_INDOOR_HUMIDITY,
    SRC_INDOOR_CO2,
]

# Only these sources trigger staleness warnings. Excluded: rain_total (static
# when dry), lux/uv (zero at night), dew_point, battery (slow-reporting).
STALENESS_CHECK_SOURCES = {SRC_TEMP, SRC_PRESS, SRC_WIND, SRC_WIND_DIR}  # SRC_HUM removed: humidity is stable

# ---------------------------------------------------------------------------
# Named physical / algorithm constants
# ---------------------------------------------------------------------------
SLP_GAS_CONSTANT_RATIO: float = 29.263

MAGNUS_A: float = 17.625
MAGNUS_B: float = 243.04

MAGNUS_A_ICE: float = 22.587
MAGNUS_B_ICE: float = 273.86

BEAUFORT_BOUNDARIES = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7]

PRESSURE_HISTORY_SAMPLES = 12
PRESSURE_HISTORY_INTERVAL_MIN = 15

PRESSURE_TREND_RISING_RAPID: float = 1.6
PRESSURE_TREND_RISING: float = 0.8
PRESSURE_TREND_FALLING: float = -0.8
PRESSURE_TREND_FALLING_RAPID: float = -1.6

RAIN_RATE_PHYSICAL_CAP_MMPH: float = 500.0
WIND_SMOOTH_ALPHA: float = 0.3

ZAMBRETTI_UPPER_PRESSURE: float = 1050.0
ZAMBRETTI_LOWER_PRESSURE: float = 950.0

FORECAST_MIN_RETRY_S: int = 300
FORECAST_MAX_RETRY_S: int = 3600

# Forecast agreement thresholds (percentage points)
FORECAST_AGREEMENT_ALIGNED_PP: int = 20  # delta < 20 pp  -> aligned
FORECAST_AGREEMENT_CONFLICT_PP: int = 40  # delta >= 40 pp -> conflict

# Sensor drift detection - slope thresholds (per hour) and R² floor
DRIFT_SLOPE_TEMP_C_H: float = 0.1  # °C/h monotonic drift flag
DRIFT_SLOPE_HUMIDITY_PCT_H: float = 0.5  # %/h
DRIFT_SLOPE_PRESSURE_HPA_H: float = 1.5  # hPa/h
DRIFT_R_SQ_THRESH: float = 0.85  # minimum R² to flag as drift

# Stuck rain-bucket detection (samples at ~1 min intervals)
DRIFT_STUCK_BUCKET_SAMPLES: int = 240  # 4-hour rolling window
DRIFT_STUCK_BUCKET_MIN_RATE: float = 0.1  # mm/h minimum to count as non-zero
DRIFT_STUCK_RATE_RANGE_MAX: float = 0.1  # mm/h max spread to flag as stuck

CONFIG_VERSION = 2

# ---------------------------------------------------------------------------
# v0.7.0 - Air Quality (Open-Meteo AQI, free/no key)
# ---------------------------------------------------------------------------
CONF_ENABLE_AIR_QUALITY = "enable_air_quality"
CONF_AQI_INTERVAL_MIN = "aqi_interval_min"
DEFAULT_ENABLE_AIR_QUALITY = False
DEFAULT_AQI_INTERVAL_MIN = 60

# v0.7.0 - Pollen (Tomorrow.io, free API key required)
CONF_ENABLE_POLLEN = "enable_pollen"
CONF_TOMORROW_IO_KEY = "tomorrow_io_key"
CONF_POLLEN_INTERVAL_MIN = "pollen_interval_min"
DEFAULT_ENABLE_POLLEN = False
DEFAULT_POLLEN_INTERVAL_MIN = 360  # 6 h; Tomorrow.io free tier: 500 calls/day

# ---------------------------------------------------------------------------
# v0.8.0 - Astronomical (Moon)
# ---------------------------------------------------------------------------
CONF_ENABLE_MOON = "enable_moon"
DEFAULT_ENABLE_MOON = False

# ---------------------------------------------------------------------------
# v0.9.0 - Solar forecast (forecast.solar, free/no key) + Penman-Monteith ET₀
# ---------------------------------------------------------------------------
CONF_ENABLE_SOLAR_FORECAST = "enable_solar_forecast"
CONF_SOLAR_PEAK_KW = "solar_peak_kw"
CONF_SOLAR_PANEL_AZIMUTH = "solar_panel_azimuth"
CONF_SOLAR_PANEL_TILT = "solar_panel_tilt"
CONF_SOLAR_INTERVAL_MIN = "solar_interval_min"
DEFAULT_ENABLE_SOLAR_FORECAST = False
DEFAULT_SOLAR_PEAK_KW = 5.0
DEFAULT_SOLAR_PANEL_AZIMUTH = 180  # south-facing
DEFAULT_SOLAR_PANEL_TILT = 30  # degrees from horizontal
DEFAULT_SOLAR_INTERVAL_MIN = 60

# ---------------------------------------------------------------------------
# Data keys - v0.7.0 Air Quality
# ---------------------------------------------------------------------------
KEY_AQI = "air_quality_index"
KEY_AQI_LEVEL = "air_quality_level"
KEY_PM2_5 = "pm2_5_ug_m3"
KEY_PM10 = "pm10_ug_m3"
KEY_NO2 = "no2_ug_m3"
KEY_OZONE = "ozone_ug_m3"
KEY_CO = "co_ug_m3"

# Data keys - v0.7.0 Pollen
KEY_POLLEN_GRASS = "pollen_grass_index"
KEY_POLLEN_TREE = "pollen_tree_index"
KEY_POLLEN_WEED = "pollen_weed_index"
KEY_POLLEN_OVERALL = "pollen_overall_level"

# Data keys - v0.8.0 Moon
KEY_MOON_PHASE = "moon_phase"
KEY_MOON_ILLUMINATION_PCT = "moon_illumination_pct"
KEY_MOON_DISPLAY = "moon_display"
KEY_MOON_AGE_DAYS = "moon_age_days"
KEY_MOON_NEXT_FULL = "moon_next_full_days"
KEY_MOON_NEXT_NEW = "moon_next_new_days"

# Data keys - v0.9.0 Solar forecast
KEY_SOLAR_FORECAST_TODAY_KWH = "solar_forecast_today_kwh"
KEY_SOLAR_FORECAST_TOMORROW_KWH = "solar_forecast_tomorrow_kwh"
KEY_SOLAR_FORECAST_STATUS = "solar_forecast_status"
KEY_ET0_PM_DAILY_MM = "et0_pm_daily_mm"  # Penman-Monteith (when solar available)

# ---------------------------------------------------------------------------
# v1.2.0 - Self-learning, new met sensors, station intelligence, climatology
# ---------------------------------------------------------------------------

# Config keys - GDD growing season reset
CONF_GDD_RESET_MONTH = "gdd_reset_month"
CONF_GDD_RESET_DAY = "gdd_reset_day"
CONF_GDD_CAP_C = "gdd_cap_c"
CONF_THRESH_HEAT_DAY_C = "thresh_heat_day_c"

# Config keys - optional new sensor groups
CONF_ENABLE_FOG = "enable_fog"
CONF_ENABLE_THUNDERSTORM = "enable_thunderstorm_risk"

# Defaults
DEFAULT_GDD_RESET_MONTH = 1
DEFAULT_GDD_RESET_DAY = 1
DEFAULT_GDD_CAP_C = 30.0
DEFAULT_THRESH_HEAT_DAY_C = 30.0
DEFAULT_ENABLE_FOG = False
DEFAULT_ENABLE_THUNDERSTORM = False

# Learning algorithm constants
LEARNING_EMA_ALPHA = 0.05  # ~20 observation halflife
LEARNING_MIN_SAMPLES_MEDIUM = 48  # ~2 days of hourly METAR
LEARNING_MIN_SAMPLES_HIGH = 168  # 7 days
LEARNING_SOLAR_BETA = 0.02  # slow solar factor adaptation
LEARNING_SOLAR_DEFAULT = 126.0  # standard photopic lux→W/m²
LEARNING_SOLAR_MIN = 80.0
LEARNING_SOLAR_MAX = 200.0
LEARNING_SAVE_INTERVAL_S = 3600  # persist to storage once per hour

# Data keys - v1.2.0 Learning sensors (METAR-gated)
KEY_LEARNED_TEMP_BIAS = "learned_temp_bias"
KEY_CAL_SUGGESTION_TEMP = "cal_suggestion_temp"
KEY_LEARNED_PRESSURE_BIAS = "learned_pressure_bias"
KEY_CAL_SUGGESTION_PRESSURE = "cal_suggestion_pressure"
KEY_FORECAST_SKILL = "forecast_skill"
KEY_SOLAR_LUX_FACTOR = "solar_lux_factor"

# Data keys - v1.2.0 New meteorological sensors
KEY_FOG_PROBABILITY = "fog_probability"
KEY_THUNDERSTORM_RISK = "thunderstorm_risk"
KEY_PRECIP_TYPE = "precipitation_type"
KEY_GDD_TODAY = "gdd_today"
KEY_GDD_SEASON = "gdd_season"
KEY_DRY_STREAK = "dry_streak_days"
KEY_HEAT_STREAK = "heat_streak_days"
KEY_FROST_STREAK = "frost_streak_days"

# Data keys - v1.2.0 Station intelligence
KEY_SENSOR_DRIFT_FLAGS = "sensor_drift_flags"
KEY_CONSISTENCY_FLAGS = "consistency_flags"

# Data keys - v1.2.0 Rolling climatology
KEY_CLIMATOLOGY_30D = "climatology_30d"
KEY_TEMP_ANOMALY_30D = "temp_anomaly_30d"
KEY_RAIN_ANOMALY_30D = "rain_anomaly_30d"

# ---------------------------------------------------------------------------
# v1.3.0 - Canadian FWI (Fire Weather Index) system
# ---------------------------------------------------------------------------
KEY_FWI_FFMC = "fwi_ffmc"
KEY_FWI_DMC = "fwi_dmc"
KEY_FWI_DC = "fwi_dc"
KEY_FWI_ISI = "fwi_isi"
KEY_FWI_BUI = "fwi_bui"
KEY_FWI = "fwi"
KEY_FWI_DSR = "fwi_dsr"

# ---------------------------------------------------------------------------
# v1.5.0 - Extended comfort / agrometeorological sensors
# ---------------------------------------------------------------------------

# Config keys
CONF_ENABLE_COMFORT_INDICES = "enable_comfort_indices"
CONF_CHILL_HOUR_BASE_C = "chill_hour_base_c"
CONF_CHILL_SEASON_RESET_MONTH = "chill_season_reset_month"
CONF_CHILL_SEASON_RESET_DAY = "chill_season_reset_day"

# Defaults
DEFAULT_ENABLE_COMFORT_INDICES = False
DEFAULT_CHILL_HOUR_BASE_C = 7.2  # standard base for apple/pear chill models
DEFAULT_CHILL_SEASON_RESET_MONTH = 7  # July 1 for Northern Hemisphere
DEFAULT_CHILL_SEASON_RESET_DAY = 1

# Data keys - heat / cold stress indices
KEY_HEAT_INDEX = "heat_index_c"
KEY_WIND_CHILL = "wind_chill_c"
KEY_HUMIDEX = "humidex"

# Data keys - humidity / vapour
KEY_VPD = "vpd_kpa"
KEY_ABSOLUTE_HUMIDITY = "absolute_humidity_gm3"

# Data keys - agrometeorological
KEY_DELTA_T = "delta_t_c"
KEY_WIND_RUN_KM = "wind_run_km"
KEY_CHILL_HOURS_TODAY = "chill_hours_today"
KEY_CHILL_HOURS_SEASON = "chill_hours_season"

# Data keys - Davis comfort indices
KEY_THW_INDEX = "thw_index_c"
KEY_THSW_INDEX = "thsw_index_c"

# Data keys - solar / cloud
KEY_CLEARNESS_INDEX = "clearness_index_kt"
KEY_CLOUD_COVER_PCT = "cloud_cover_pct"

# ---------------------------------------------------------------------------
# v1.6.0 - French regional data sources (no API key required)
# ---------------------------------------------------------------------------

# Feature toggles
CONF_ENABLE_VIGILANCE_METEO = "enable_vigilance_meteo"
CONF_ENABLE_VIGICRUES = "enable_vigicrues"

# ---------------------------------------------------------------------------
# v1.8.0 - Vigicrues station picker (issue #13)
# v1.9.0 - Multi-station support (issue #27)
# ---------------------------------------------------------------------------
CONF_VIGICRUES_STATION_CODE = "vigicrues_station_code"  # legacy single-station (kept for migration)
CONF_VIGICRUES_STATION_NAME = "vigicrues_station_name"  # legacy (kept for migration)
CONF_VIGICRUES_RIVER_NAME = "vigicrues_river_name"  # legacy (kept for migration)

# v1.9.0: replaces the three legacy keys above.  Stored as a list of dicts:
#   [{"code": "V123456", "name": "Station libellé", "river": "La Seine"}, ...]
# An empty list means auto-detect the nearest station.
CONF_VIGICRUES_STATIONS = "vigicrues_stations"

# Defaults
DEFAULT_ENABLE_VIGILANCE_METEO = False
DEFAULT_ENABLE_VIGICRUES = False

# Data keys - Météo-France Vigilance (department-level weather alerts)
KEY_VIGILANCE_MAX_LEVEL = "vigilance_max_level"  # overall worst: vert/jaune/orange/rouge

# v1.8.0 - Fire danger from Vigilance phenomena (issue #13)
KEY_FIRE_DANGER_VIGILANCE = "fire_danger_vigilance"

# Data keys - Vigicrues (real-time river level via Hub'Eau v2)
# v1.9.0: per-station key pattern is f"river_level_m_{code}" where code is the
# Hub'Eau station code (e.g. "V123456").  KEY_RIVER_LEVEL_M kept for compat.
KEY_RIVER_LEVEL_M = "river_level_m"

# ---------------------------------------------------------------------------
# v1.6.2 - Opt-in toggles for previously disabled-by-default sensor groups
# ---------------------------------------------------------------------------
# Replaces the old _DISABLED_BY_DEFAULT mechanism (which created dead entities
# that had to be manually enabled). These toggles gate entity creation instead:
# off = not created (no clutter, no recorder cost); on = created and working.
CONF_ENABLE_DIAGNOSTICS = (
    "enable_diagnostics"  # drift/consistency/quality, forecast skill/agreement, solar lux factor, climatology 30d
)
CONF_ENABLE_FWI_COMPONENTS = "enable_fwi_components"  # FWI intermediate codes (FFMC/DMC/DC/ISI/BUI); needs fire risk
CONF_ENABLE_ADVANCED_SENSORS = "enable_advanced_sensors"  # Zambretti number, ET0 hourly, wind direction smoothed
DEFAULT_ENABLE_DIAGNOSTICS = False
DEFAULT_ENABLE_FWI_COMPONENTS = False
DEFAULT_ENABLE_ADVANCED_SENSORS = False

# ---------------------------------------------------------------------------
# v1.7.0 - Precipitation nowcast (Open-Meteo minutely_15, free/no key)
# ---------------------------------------------------------------------------
# Independent of the chosen forecast provider: always hits Open-Meteo for
# 15-minute precipitation buckets to derive "rain starts/stops in N minutes".
CONF_ENABLE_NOWCAST = "enable_nowcast"
CONF_NOWCAST_INTERVAL_MIN = "nowcast_interval_min"
DEFAULT_ENABLE_NOWCAST = False
DEFAULT_NOWCAST_INTERVAL_MIN = 15

# Suppress HA Repairs notifications (issue #20)
CONF_SUPPRESS_NOTIFICATIONS = "suppress_notifications"
DEFAULT_SUPPRESS_NOTIFICATIONS = False

# Data keys - nowcast
KEY_RAIN_NEXT_60MIN = "rain_next_60min_mm"
KEY_MINUTES_UNTIL_RAIN = "minutes_until_rain"
KEY_MINUTES_UNTIL_DRY = "minutes_until_dry"
KEY_NOWCAST_INTENSITY = "nowcast_intensity"
KEY_RAIN_EXPECTED_1H = "rain_expected_1h"

# ---------------------------------------------------------------------------
# v2.0 - Degree days + leaf wetness (new agrometeorological group)
# ---------------------------------------------------------------------------

CONF_ENABLE_DEGREE_DAYS = "enable_degree_days"
CONF_HDD_BASE_C = "hdd_base_c"
CONF_CDD_BASE_C = "cdd_base_c"
CONF_GDD_BASE_C = "gdd_base_c"
CONF_GDD_CAP_C_V2 = "gdd_cap_c_v2"  # renamed to avoid clash with legacy CONF_GDD_CAP_C

DEFAULT_ENABLE_DEGREE_DAYS = False
DEFAULT_HDD_BASE_C = 18.0  # standard WMO base for heating/cooling degree days
DEFAULT_CDD_BASE_C = 18.0
DEFAULT_GDD_BASE_C = 10.0  # standard base for most crops; user can tune
DEFAULT_GDD_CAP_C_V2 = 30.0

# Data keys - degree days (daily accumulators)
KEY_HDD_TODAY_MM = "hdd_today_degc"  # Heating Degree Day (today)
KEY_HDD_SEASON = "hdd_season_degc"  # Heating Degree Day (seasonal total)
KEY_CDD_TODAY_MM = "cdd_today_degc"  # Cooling Degree Day (today)
KEY_CDD_SEASON = "cdd_season_degc"  # Cooling Degree Day (seasonal total)
KEY_GDD_TODAY_V2 = "gdd_today_v2_degc"  # Growing Degree Day (today)
KEY_GDD_SEASON_V2 = "gdd_season_v2_degc"  # Growing Degree Day (seasonal total)
KEY_LEAF_WETNESS = "leaf_wetness"  # Leaf wetness indicator (bool→text)

# ---------------------------------------------------------------------------
# v2.0 - New derived sensors (always-on or comfort-group opt-in)
# ---------------------------------------------------------------------------

# Always-on advanced met
KEY_CLOUD_BASE_M = "cloud_base_m"
KEY_FREEZING_LEVEL_M = "freezing_level_m"
KEY_WIND_GUST_FACTOR = "wind_gust_factor"

# Solar / agro extensions (comfort indices or solar group)
KEY_SOLAR_ENERGY_TODAY_WHM2 = "solar_energy_today_whm2"  # Wh/m² — daily accumulation
KEY_MAX_SOLAR_RADIATION = "max_solar_radiation_wm2"  # Clear-sky theoretical max
KEY_PEAK_SUN_HOURS = "peak_sun_hours"  # Wh/m² / 1000
KEY_IRRIGATION_DEFICIT = "irrigation_deficit_mm"  # ET₀ - rain today

# Wind statistics (always-on wind group)
KEY_DOMINANT_WIND_DIR = "dominant_wind_direction_deg"
KEY_WIND_DIR_VARIABILITY = "wind_direction_variability_deg"
KEY_WIND_RUN_MONTH_KM = "wind_run_month_km"  # monthly wind run accumulator

# Fire danger (fire risk group)
KEY_FFDI = "ffdi"
KEY_FFWI = "ffwi"

# Human comfort (comfort indices group)
KEY_UTCI = "utci_c"

# Net radiation (exposed; previously internal to Penman-Monteith ET₀)
KEY_NET_RADIATION = "net_radiation_wm2"

# ---------------------------------------------------------------------------
# v2.0 - Lightning sensor integration (new opt-in group)
# ---------------------------------------------------------------------------

CONF_ENABLE_LIGHTNING = "enable_lightning"
# SRC_LIGHTNING_COUNT / SRC_LIGHTNING_DISTANCE defined near OPTIONAL_SOURCES above.

DEFAULT_ENABLE_LIGHTNING = False
DEFAULT_LIGHTNING_PROXIMITY_KM = 15.0  # threshold for proximity alert

CONF_LIGHTNING_PROXIMITY_KM = "lightning_proximity_km"

# ---------------------------------------------------------------------------
# v2.0 - Additional upload targets
# ---------------------------------------------------------------------------

# Weathercloud
CONF_ENABLE_WEATHERCLOUD = "enable_weathercloud"
CONF_WC_STATION_ID = "wc_station_id"
CONF_WC_API_KEY = "wc_api_key"
CONF_WC_INTERVAL_MIN = "wc_interval_min"
DEFAULT_ENABLE_WEATHERCLOUD = False
DEFAULT_WC_INTERVAL_MIN = 10

# PWSWeather
CONF_ENABLE_PWSWEATHER = "enable_pwsweather"
CONF_PWS_STATION_ID = "pws_station_id"
CONF_PWS_API_KEY = "pws_api_key"
CONF_PWS_INTERVAL_MIN = "pws_interval_min"
DEFAULT_ENABLE_PWSWEATHER = False
DEFAULT_PWS_INTERVAL_MIN = 10

# WOW (UK Met Office Weather Observations Website)
CONF_ENABLE_WOW = "enable_wow"
CONF_WOW_SITE_ID = "wow_site_id"
CONF_WOW_AUTH_KEY = "wow_auth_key"
CONF_WOW_INTERVAL_MIN = "wow_interval_min"
DEFAULT_ENABLE_WOW = False
DEFAULT_WOW_INTERVAL_MIN = 10

# AWEKAS
CONF_ENABLE_AWEKAS = "enable_awekas"
CONF_AWEKAS_USERNAME = "awekas_username"
CONF_AWEKAS_PASSWORD = "awekas_password"
CONF_AWEKAS_INTERVAL_MIN = "awekas_interval_min"
DEFAULT_ENABLE_AWEKAS = False
DEFAULT_AWEKAS_INTERVAL_MIN = 15

# OpenWeatherMap Stations API (measurement contribution endpoint)
CONF_ENABLE_OWM_STATIONS = "enable_owm_stations"
CONF_OWM_STATIONS_API_KEY = "owm_stations_api_key"
CONF_OWM_STATIONS_STATION_ID = "owm_stations_station_id"  # OWM internal station id
CONF_OWM_STATIONS_INTERVAL_MIN = "owm_stations_interval_min"
DEFAULT_ENABLE_OWM_STATIONS = False
DEFAULT_OWM_STATIONS_INTERVAL_MIN = 10

# Windy.com (Windguru-compatible community upload via stations.windy.com)
CONF_ENABLE_WINDY = "enable_windy"
CONF_WINDY_API_KEY = "windy_api_key"
CONF_WINDY_STATION_ID = "windy_station_id"  # integer station id from windy account
CONF_WINDY_INTERVAL_MIN = "windy_interval_min"
DEFAULT_ENABLE_WINDY = False
DEFAULT_WINDY_INTERVAL_MIN = 10

# Upload status data keys
KEY_WC_STATUS = "wc_upload_status"
KEY_PWS_STATUS = "pws_upload_status"
KEY_WOW_STATUS = "wow_upload_status"
KEY_AWEKAS_STATUS = "awekas_upload_status"
KEY_OWM_STATIONS_STATUS = "owm_stations_upload_status"
KEY_WINDY_STATUS = "windy_upload_status"

# ---------------------------------------------------------------------------
# v2.0 - Indoor sensor group
# ---------------------------------------------------------------------------

CONF_ENABLE_INDOOR = "enable_indoor"
# SRC_INDOOR_TEMP / SRC_INDOOR_HUMIDITY / SRC_INDOOR_CO2 defined near OPTIONAL_SOURCES above.
DEFAULT_ENABLE_INDOOR = False

KEY_INDOOR_TEMP_C = "indoor_temp_c"
KEY_INDOOR_HUMIDITY = "indoor_humidity_pct"
KEY_INDOOR_CO2_PPM = "indoor_co2_ppm"
KEY_INDOOR_TEMP_DELTA = "indoor_temp_delta_c"
KEY_INDOOR_HUMIDITY_DELTA = "indoor_humidity_delta_pct"
KEY_INDOOR_COMFORT = "indoor_comfort"  # composite score

# Multiple indoor rooms: each entry is a temp sensor entity_id; one delta sensor is created per room
CONF_INDOOR_ROOMS = "indoor_rooms"
KEY_INDOOR_ROOMS_DATA = "indoor_rooms_data"  # dict[entity_id, {"temp_c": float, "delta_c": float}]

# ---------------------------------------------------------------------------
# v2.0 - Data quality expansion
# ---------------------------------------------------------------------------

KEY_SENSOR_STUCK = "sensor_stuck_flags"  # list of stuck sensor names
KEY_DATA_QUALITY_SCORE = "data_quality_score"  # 0-100 composite
KEY_NEIGHBOR_QC = "neighbor_qc_flags"  # list of neighbor-comparison flags
KEY_SENSOR_SPIKE = "sensor_spike_flags"  # list of σ-based step-change flags

# Spike detection thresholds (sigma multiplier + minimum samples)
SPIKE_SIGMA_THRESHOLD = 3.0  # flag a reading > 3σ from rolling mean
SPIKE_MIN_SAMPLES = 12  # need at least this many samples to compute σ

# ---------------------------------------------------------------------------
# v2.0 - CWOP (Citizen Weather Observer Program) upload
# ---------------------------------------------------------------------------

CONF_ENABLE_CWOP = "enable_cwop"
CONF_CWOP_CALLSIGN = "cwop_callsign"
CONF_CWOP_PASSCODE = "cwop_passcode"  # -1 for receive-only; set by CWOP on registration
CONF_CWOP_SERVER = "cwop_server"  # default: cwop.aprs.net
CONF_CWOP_PORT = "cwop_port"  # default: 14580
CONF_CWOP_INTERVAL_MIN = "cwop_interval_min"

DEFAULT_ENABLE_CWOP = False
DEFAULT_CWOP_SERVER = "cwop.aprs.net"
DEFAULT_CWOP_PORT = 14580
DEFAULT_CWOP_INTERVAL_MIN = 15  # CWOP requests no faster than 5 min; 15 is polite

KEY_CWOP_STATUS_V2 = "cwop_upload_status_v2"

# ---------------------------------------------------------------------------
# v2.0 - MQTT Discovery republishing
# ---------------------------------------------------------------------------

CONF_ENABLE_MQTT = "enable_mqtt"
CONF_MQTT_DISCOVERY_PREFIX = "mqtt_discovery_prefix"
CONF_MQTT_STATE_PREFIX = "mqtt_state_prefix"
CONF_MQTT_INTERVAL_MIN = "mqtt_interval_min"

DEFAULT_ENABLE_MQTT = False
DEFAULT_MQTT_DISCOVERY_PREFIX = "homeassistant"
DEFAULT_MQTT_STATE_PREFIX = "ws_core"
DEFAULT_MQTT_INTERVAL_MIN = 1

# Data keys
KEY_LIGHTNING_COUNT_1H = "lightning_count_1h"
KEY_LIGHTNING_DISTANCE_KM = "lightning_distance_km"
KEY_LIGHTNING_RATE_1H = "lightning_rate_1h"  # strikes per minute (avg)
KEY_LIGHTNING_CLEARANCE_MIN = "lightning_clearance_min"  # minutes since last strike
KEY_LIGHTNING_PROXIMITY = "lightning_proximity"  # binary "near" / "clear"

# Comfort indices group (opt-in via CONF_ENABLE_COMFORT_INDICES)
KEY_AIR_DENSITY = "air_density_kg_m3"
KEY_SPECIFIC_HUMIDITY = "specific_humidity_g_kg"
KEY_WBGT = "wbgt_c"

# Rain accumulators (always-on)
KEY_RAIN_THIS_WEEK_MM = "rain_this_week_mm"
KEY_RAIN_THIS_MONTH_MM = "rain_this_month_mm"
KEY_RAIN_THIS_YEAR_MM = "rain_this_year_mm"
KEY_RAIN_RATE_MAX_24H = "rain_rate_max_24h_mmph"

# ---------------------------------------------------------------------------
# Migration - v0.3.0 deprecated entity keys and config keys
# ---------------------------------------------------------------------------
DEPRECATED_KEYS_V030 = (
    "metar_validation",
    "metar_delta_temp_c",
    "metar_delta_pressure_hpa",
    "learned_temp_bias",
    "cal_suggestion_temp",
    "learned_pressure_bias",
    "cal_suggestion_pressure",
    "last_export_time",
    "cwop_upload_status",
    "running_score",
    "laundry_drying_score",
    "stargazing_quality",
    "gdd_today",
    "gdd_season",
    "hdd_today",
    "cdd_today",
    "moon_phase",
    "air_quality_level",
    "pressure_trend_hpah_raw",
    "rain_rate_mmph_raw",
    "precipitation_type",
    "time_since_rain",
)

DEPRECATED_CONF_KEYS_V030 = (
    "enable_laundry_score",
    "enable_stargazing_score",
    "enable_running_score",
    "enable_degree_days",
    "degree_day_base_c",
    "enable_metar",
    "metar_icao",
    "metar_interval_min",
    "enable_cwop",
    "cwop_callsign",
    "cwop_passcode",
    "cwop_interval_min",
    "enable_export",
    "export_path",
    "export_format",
    "export_interval_min",
    "enable_activity_scores",
    "enable_extended_sensors",
    "rain_penalty_light_mmph",
    "rain_penalty_heavy_mmph",
)
