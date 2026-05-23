"""Sensors for Weather Station Core -- v1.7.0."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    # v1.6.2
    CONF_ENABLE_ADVANCED_SENSORS,
    # v0.7.0
    CONF_ENABLE_AIR_QUALITY,
    # v1.5.0
    CONF_ENABLE_COMFORT_INDICES,
    # v1.6.2
    CONF_ENABLE_DIAGNOSTICS,
    CONF_ENABLE_DISPLAY_SENSORS,
    CONF_ENABLE_FIRE_RISK,
    # v1.2.0
    CONF_ENABLE_FOG,
    # v1.6.2
    CONF_ENABLE_FWI_COMPONENTS,
    # v0.8.0
    CONF_ENABLE_MOON,
    # v1.7.0
    CONF_ENABLE_NOWCAST,
    CONF_ENABLE_POLLEN,
    CONF_ENABLE_SEA_TEMP,
    # v0.9.0
    CONF_ENABLE_SOLAR_FORECAST,
    CONF_ENABLE_THUNDERSTORM,
    CONF_ENABLE_VIGICRUES,
    # v1.6.0
    CONF_ENABLE_VIGILANCE_METEO,
    CONF_PREFIX,
    DEFAULT_PREFIX,
    DOMAIN,
    # v1.5.0
    KEY_ABSOLUTE_HUMIDITY,
    KEY_ALERT_MESSAGE,
    KEY_ALERT_STATE,
    # v0.7.0
    KEY_AQI,
    KEY_AQI_LEVEL,
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
    # v0.6.0
    KEY_ET0_DAILY_MM,
    KEY_ET0_HOURLY_MM,
    KEY_ET0_PM_DAILY_MM,
    KEY_FEELS_LIKE_C,
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
    # v0.8.0
    KEY_MOON_PHASE,
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
    KEY_RAIN_NEXT_60MIN,
    KEY_RAIN_PROBABILITY,
    KEY_RAIN_PROBABILITY_COMBINED,
    KEY_RAIN_RATE_FILT,
    KEY_RAIN_TODAY_MM,
    KEY_RIVER_LEVEL_M,
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
    UNIT_PRESSURE_HPA,
    UNIT_RAIN_MM,
    UNIT_TEMP_C,
    UNIT_WIND_MS,
)


@dataclass(frozen=True, kw_only=True)
class WSSensorDescription:
    """Describes Weather Station sensor entities."""

    key: str
    device_class: SensorDeviceClass | None = None
    entity_category: EntityCategory | None = None
    entity_registry_enabled_default: bool = True
    icon: str | None = None
    name: str | None = None
    translation_key: str | None = None
    native_unit: str | None = None
    state_class: SensorStateClass | None = None
    value_fn: Callable[[dict[str, Any]], Any] | None = None
    attrs_fn: Callable[[dict[str, Any]], dict[str, Any]] | None = None


SENSORS: list[WSSensorDescription] = [
    # =========================================================================
    # CORE MEASUREMENTS
    # =========================================================================
    WSSensorDescription(
        key=KEY_NORM_TEMP_C,
        translation_key="temperature",
        name="WS Temperature",
        icon="mdi:thermometer",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,  # FIX: was TOTAL_INCREASING
    ),
    WSSensorDescription(
        key=KEY_DEW_POINT_C,
        translation_key="dew_point",
        name="WS Dew Point",
        icon="mdi:weather-fog",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_NORM_HUMIDITY,
        translation_key="humidity",
        name="WS Humidity",
        icon="mdi:water-percent",
        device_class=SensorDeviceClass.HUMIDITY,
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_NORM_PRESSURE_HPA,
        translation_key="station_pressure",
        name="WS Station Pressure",
        icon="mdi:gauge",
        device_class=SensorDeviceClass.PRESSURE,
        native_unit=UNIT_PRESSURE_HPA,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_SEA_LEVEL_PRESSURE_HPA,
        translation_key="sea_level_pressure",
        name="WS Sea-Level Pressure",
        icon="mdi:gauge-full",
        device_class=SensorDeviceClass.PRESSURE,
        native_unit=UNIT_PRESSURE_HPA,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_NORM_WIND_SPEED_MS,
        translation_key="wind_speed",
        name="WS Wind Speed",
        icon="mdi:weather-windy",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit=UNIT_WIND_MS,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_NORM_WIND_GUST_MS,
        translation_key="wind_gust",
        name="WS Wind Gust",
        icon="mdi:weather-windy-variant",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit=UNIT_WIND_MS,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_NORM_WIND_DIR_DEG,
        translation_key="wind_direction",
        name="WS Wind Direction",
        icon="mdi:compass",
        device_class=SensorDeviceClass.WIND_DIRECTION,
        native_unit="\u00b0",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_NORM_RAIN_TOTAL_MM,
        translation_key="rain_total",
        name="WS Rain Total",
        icon="mdi:water",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.TOTAL_INCREASING,  # FIX: cumulative counter
    ),
    WSSensorDescription(
        key=KEY_RAIN_RATE_FILT,
        translation_key="rain_rate",
        name="WS Rain Rate",
        icon="mdi:weather-pouring",
        device_class=SensorDeviceClass.PRECIPITATION_INTENSITY,
        native_unit="mm/h",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_LUX,
        translation_key="illuminance",
        name="WS Illuminance",
        icon="mdi:white-balance-sunny",
        device_class=SensorDeviceClass.ILLUMINANCE,
        native_unit="lx",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_UV,
        translation_key="uv_index",
        name="WS UV Index",
        icon="mdi:weather-sunny-alert",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_BATTERY_PCT,
        translation_key="battery",
        name="WS Battery",
        icon="mdi:battery",
        device_class=SensorDeviceClass.BATTERY,
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {
            "bars": max(1, min(4, -(-int(d.get(KEY_BATTERY_PCT) or 0) // 25)))
            if d.get(KEY_BATTERY_PCT) is not None and d.get(KEY_BATTERY_PCT) > 0
            else 1,
        },
    ),
    WSSensorDescription(
        key=KEY_PRESSURE_TREND_HPAH,
        translation_key="pressure_trend_raw",
        name="WS Pressure Trend Raw",
        icon="mdi:trending-up",
        native_unit="hPa/h",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_PRESSURE_CHANGE_WINDOW_HPA,
        translation_key="pressure_change_window",
        name="WS Pressure Change (window)",
        icon="mdi:swap-vertical",
        native_unit="hPa",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_DATA_QUALITY,
        translation_key="data_quality_banner",
        name="WS Data Quality Banner",
        icon="mdi:clipboard-check-outline",
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_PACKAGE_STATUS,
        translation_key="package_status",
        name="WS Package Status",
        icon="mdi:package-variant-closed",
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_SENSOR_QUALITY_FLAGS,
        translation_key="sensor_quality_flags",
        name="WS Sensor Quality Flags",
        icon="mdi:shield-alert-outline",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: len(d.get(KEY_SENSOR_QUALITY_FLAGS) or []),
        attrs_fn=lambda d: {
            "flags": d.get(KEY_SENSOR_QUALITY_FLAGS) or [],
            "all_clear": len(d.get(KEY_SENSOR_QUALITY_FLAGS) or []) == 0,
        },
    ),
    WSSensorDescription(
        key=KEY_ALERT_STATE,
        translation_key="alert_state",
        name="WS Alert State",
        icon="mdi:alert-circle-outline",
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_ALERT_MESSAGE,
        translation_key="alert_message",
        name="WS Alert Message",
        icon="mdi:message-alert-outline",
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_FORECAST,
        translation_key="forecast_daily",
        name="WS Forecast Daily",
        icon="mdi:calendar-weather",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: (d.get(KEY_FORECAST) or {}).get("provider") if d.get(KEY_FORECAST) else None,
        attrs_fn=lambda d: d.get(KEY_FORECAST) or {},
    ),
    # =========================================================================
    # ADVANCED METEOROLOGICAL SENSORS
    # =========================================================================
    WSSensorDescription(
        key=KEY_FEELS_LIKE_C,
        translation_key="feels_like",
        name="WS Feels Like",
        icon="mdi:thermometer-lines",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "wind_contribution_ms": round(-0.70 * float(d[KEY_NORM_WIND_SPEED_MS]), 1)
            if d.get(KEY_NORM_WIND_SPEED_MS) is not None
            else None,
            "humidity": d.get(KEY_NORM_HUMIDITY),
            "actual_temp_c": d.get(KEY_NORM_TEMP_C),
        },
    ),
    # Wet-bulb temperature (Stull 2011)
    WSSensorDescription(
        key=KEY_WET_BULB_C,
        translation_key="wet_bulb_temperature",
        name="WS Wet-Bulb Temperature",
        icon="mdi:thermometer-water",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # Frost point (below 0 C uses ice constants)
    WSSensorDescription(
        key=KEY_FROST_POINT_C,
        translation_key="frost_point",
        name="WS Frost Point",
        icon="mdi:snowflake-thermometer",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # =========================================================================
    # v1.5.0 COMFORT / COMFORT STRESS INDICES
    # =========================================================================
    # NWS Heat Index (Rothfusz, valid T >= 27 C and RH >= 40 %)
    WSSensorDescription(
        key=KEY_HEAT_INDEX,
        translation_key="heat_index",
        name="WS Heat Index",
        icon="mdi:thermometer-high",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # WMO / NWS Wind Chill (2001, valid T <= 10 C and wind > 1.34 m/s)
    WSSensorDescription(
        key=KEY_WIND_CHILL,
        translation_key="wind_chill",
        name="WS Wind Chill",
        icon="mdi:thermometer-minus",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # Canadian Humidex
    WSSensorDescription(
        key=KEY_HUMIDEX,
        translation_key="humidex",
        name="WS Humidex",
        icon="mdi:water-thermometer",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # Vapour Pressure Deficit (kPa)
    WSSensorDescription(
        key=KEY_VPD,
        translation_key="vpd",
        name="WS Vapour Pressure Deficit",
        icon="mdi:water-percent-alert",
        native_unit="kPa",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # Absolute Humidity (g/m³)
    WSSensorDescription(
        key=KEY_ABSOLUTE_HUMIDITY,
        translation_key="absolute_humidity",
        name="WS Absolute Humidity",
        icon="mdi:water",
        native_unit="g/m³",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # Delta-T (dry-bulb minus wet-bulb)
    WSSensorDescription(
        key=KEY_DELTA_T,
        translation_key="delta_t",
        name="WS Delta-T",
        icon="mdi:thermometer-lines",
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "spray_suitability": (
                "unsuitable_too_low"
                if (d.get(KEY_DELTA_T) or 0) < 2.0
                else "ideal"
                if (d.get(KEY_DELTA_T) or 0) <= 8.0
                else "unsuitable_too_high"
            )
        },
    ),
    # Davis THW Index (Heat Index + wind cooling)
    WSSensorDescription(
        key=KEY_THW_INDEX,
        translation_key="thw_index",
        name="WS THW Index",
        icon="mdi:thermometer-lines",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # Davis THSW Index (THW + solar radiation)
    WSSensorDescription(
        key=KEY_THSW_INDEX,
        translation_key="thsw_index",
        name="WS THSW Index",
        icon="mdi:sun-thermometer",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # =========================================================================
    # v1.5.0 AGROMETEOROLOGICAL / ACCUMULATION SENSORS
    # =========================================================================
    # Wind Run (daily km accumulator)
    WSSensorDescription(
        key=KEY_WIND_RUN_KM,
        translation_key="wind_run",
        name="WS Wind Run",
        icon="mdi:weather-windy",
        native_unit="km",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    # Chill Hours Today
    WSSensorDescription(
        key=KEY_CHILL_HOURS_TODAY,
        translation_key="chill_hours_today",
        name="WS Chill Hours Today",
        icon="mdi:snowflake",
        native_unit="h",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    # Chill Hours Season
    WSSensorDescription(
        key=KEY_CHILL_HOURS_SEASON,
        translation_key="chill_hours_season",
        name="WS Chill Hours Season",
        icon="mdi:snowflake-variant",
        native_unit="h",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    # =========================================================================
    # v1.5.0 SOLAR / CLOUD SENSORS
    # =========================================================================
    # Clearness Index (Kt) - requires solar radiation sensor
    WSSensorDescription(
        key=KEY_CLEARNESS_INDEX,
        translation_key="clearness_index",
        name="WS Clearness Index",
        icon="mdi:white-balance-sunny",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # Cloud Cover Percent - derived from clearness index
    WSSensorDescription(
        key=KEY_CLOUD_COVER_PCT,
        translation_key="cloud_cover",
        name="WS Cloud Cover",
        icon="mdi:cloud-percent",
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # =========================================================================
    # v1.6.0 FRENCH REGIONAL SENSORS (Météo Vigilance + Vigicrues)
    # =========================================================================
    # Météo-France Vigilance - worst alert level for the station's department
    WSSensorDescription(
        key=KEY_VIGILANCE_MAX_LEVEL,
        translation_key="vigilance_max_level",
        name="WS Vigilance Météo",
        icon="mdi:alert-octagon",
        state_class=None,
        native_unit=None,
        attrs_fn=lambda d: {
            "phenomena": d.get("_vigilance_phenomena", {}),
            "department": d.get("_vigilance_dept"),
            "fetched_at": d.get("_vigilance_fetched_at"),
        },
    ),
    # Vigicrues - real-time water level at nearest hydrometric station
    WSSensorDescription(
        key=KEY_RIVER_LEVEL_M,
        translation_key="river_level",
        name="WS River Level",
        icon="mdi:waves",
        native_unit="m",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "station": d.get("_river_station_name"),
            "river": d.get("_river_name"),
            "station_code": d.get("_river_station_code"),
            "observed_at": d.get("_river_obs_time"),
        },
    ),
    # v1.7.0 - Precipitation nowcast (Open-Meteo minutely_15)
    WSSensorDescription(
        key=KEY_RAIN_NEXT_60MIN,
        translation_key="rain_next_60min",
        name="WS Rain Next 60 min",
        icon="mdi:weather-pouring",
        native_unit="mm",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "peak_rate_mmph": d.get("_nowcast_peak_rate_mmph"),
            "intensity": d.get(KEY_NOWCAST_INTENSITY),
            "raining_now": d.get("_nowcast_raining_now"),
            "fetched_at": d.get("_nowcast_fetched_at"),
        },
    ),
    WSSensorDescription(
        key=KEY_MINUTES_UNTIL_RAIN,
        translation_key="minutes_until_rain",
        name="WS Minutes Until Rain",
        icon="mdi:weather-rainy",
        native_unit="min",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_MINUTES_UNTIL_DRY,
        translation_key="minutes_until_dry",
        name="WS Minutes Until Dry",
        icon="mdi:weather-partly-rainy",
        native_unit="min",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_NOWCAST_INTENSITY,
        translation_key="nowcast_intensity",
        name="WS Nowcast Intensity",
        icon="mdi:weather-pouring",
        state_class=None,
        native_unit=None,
        attrs_fn=lambda d: {
            "peak_rate_mmph": d.get("_nowcast_peak_rate_mmph"),
            "next_60min_mm": d.get(KEY_RAIN_NEXT_60MIN),
        },
    ),
    # Zambretti barometric forecast
    WSSensorDescription(
        key=KEY_ZAMBRETTI_FORECAST,
        translation_key="zambretti_forecast",
        name="WS Zambretti Forecast",
        icon="mdi:crystal-ball",
        attrs_fn=lambda d: {
            "z_number": d.get(KEY_ZAMBRETTI_NUMBER),
            "mslp_hpa": d.get(KEY_SEA_LEVEL_PRESSURE_HPA),
            "trend_3h_hpa": d.get(KEY_PRESSURE_TREND_HPAH),
            "wind_quadrant": d.get(KEY_WIND_QUADRANT),
            "pressure_trend_display": d.get(KEY_PRESSURE_TREND_DISPLAY),
        },
    ),
    # Zambretti Z-number (numeric, for automations)
    WSSensorDescription(
        key=KEY_ZAMBRETTI_NUMBER,
        translation_key="zambretti_number",
        name="WS Zambretti Number",
        icon="mdi:numeric",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # Beaufort wind scale
    WSSensorDescription(
        key=KEY_WIND_BEAUFORT,
        translation_key="wind_beaufort",
        name="WS Wind Beaufort",
        icon="mdi:weather-windy",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "description": d.get(KEY_WIND_BEAUFORT_DESC),
            "speed_ms": d.get(KEY_NORM_WIND_SPEED_MS),
            "speed_kmh": round(float(d[KEY_NORM_WIND_SPEED_MS]) * 3.6, 1)
            if d.get(KEY_NORM_WIND_SPEED_MS) is not None
            else None,
            "gust_ms": d.get(KEY_NORM_WIND_GUST_MS),
            "gust_kmh": round(float(d[KEY_NORM_WIND_GUST_MS]) * 3.6, 1)
            if d.get(KEY_NORM_WIND_GUST_MS) is not None
            else None,
        },
    ),
    WSSensorDescription(
        key=KEY_WIND_QUADRANT,
        translation_key="wind_quadrant",
        name="WS Wind Quadrant",
        icon="mdi:compass-rose",
        attrs_fn=lambda d: {
            "degrees": d.get(KEY_WIND_DIR_SMOOTH_DEG) or d.get(KEY_NORM_WIND_DIR_DEG),
            "using_smoothed": d.get(KEY_WIND_DIR_SMOOTH_DEG) is not None,
        },
    ),
    WSSensorDescription(
        key=KEY_WIND_DIR_SMOOTH_DEG,
        translation_key="wind_direction_smoothed",
        name="WS Wind Direction Smoothed",
        icon="mdi:compass",
        native_unit="\u00b0",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # Current weather condition
    WSSensorDescription(
        key=KEY_CURRENT_CONDITION,
        translation_key="current_condition",
        name="WS Current Condition",
        icon="mdi:weather-partly-cloudy",
        attrs_fn=lambda d: {
            "icon": d.get("_condition_icon"),
            "mdi_icon": d.get("_condition_icon"),  # keep alias for backward compat
            "color": d.get("_condition_color"),
            "description": d.get("_condition_description"),
            "severity": d.get("_condition_severity"),
            "rain_rate": d.get(KEY_RAIN_RATE_FILT),
            "wind_gust": d.get(KEY_NORM_WIND_GUST_MS),
            "temperature": d.get(KEY_NORM_TEMP_C),
        },
    ),
    # Rain probability
    WSSensorDescription(
        key=KEY_RAIN_PROBABILITY,
        translation_key="rain_probability",
        name="WS Rain Probability",
        icon="mdi:weather-rainy",
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "mslp_hpa": d.get(KEY_SEA_LEVEL_PRESSURE_HPA),
            "pressure_trend_3h": d.get(KEY_PRESSURE_TREND_HPAH),
            "humidity_pct": d.get(KEY_NORM_HUMIDITY),
            "wind_quadrant": d.get(KEY_WIND_QUADRANT),
        },
    ),
    WSSensorDescription(
        key=KEY_RAIN_PROBABILITY_COMBINED,
        translation_key="rain_probability_combined",
        name="WS Rain Probability Combined",
        icon="mdi:weather-rainy",
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "local_probability_pct": d.get(KEY_RAIN_PROBABILITY),
        },
    ),
    # Rain / pressure display
    WSSensorDescription(
        key=KEY_RAIN_DISPLAY,
        translation_key="rain_display",
        name="WS Rain Display",
        icon="mdi:weather-rainy",
        attrs_fn=lambda d: {
            "rain_rate": d.get(KEY_RAIN_RATE_FILT, 0.0),
            "rain_today": d.get("_rain_today_mm", 0.0),
            "rain_24h": d.get(KEY_RAIN_ACCUM_24H, 0.0),
            "is_raining": (d.get(KEY_RAIN_RATE_FILT) or 0.0) > 0,
        },
    ),
    WSSensorDescription(
        key=KEY_RAIN_ACCUM_1H,
        translation_key="rain_last_1h",
        name="WS Rain Last 1h",
        icon="mdi:weather-pouring",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_RAIN_ACCUM_24H,
        translation_key="rain_last_24h",
        name="WS Rain Last 24h",
        icon="mdi:weather-pouring",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_RAIN_TODAY_MM,
        name="WS Rain Today",
        translation_key="rain_today",
        icon="mdi:weather-rainy",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_PRESSURE_TREND_DISPLAY,
        translation_key="pressure_trend",
        name="WS Pressure Trend",
        icon="mdi:trending-up",
        attrs_fn=lambda d: {
            "change_3h_hpa": d.get(KEY_PRESSURE_CHANGE_WINDOW_HPA),
            "change_3h": d.get(KEY_PRESSURE_CHANGE_WINDOW_HPA),  # alias for dashboard compatibility
            "trend_rate_hpah": d.get(KEY_PRESSURE_TREND_HPAH),
            "mslp_hpa": d.get(KEY_SEA_LEVEL_PRESSURE_HPA),
            "arrow": (
                "\u2191\u2191"
                if (d.get(KEY_PRESSURE_TREND_HPAH) or 0) >= 1.6
                else "\u2191"
                if (d.get(KEY_PRESSURE_TREND_HPAH) or 0) >= 0.8
                else "\u2192"
                if (d.get(KEY_PRESSURE_TREND_HPAH) or 0) > -0.8
                else "\u2193"
                if (d.get(KEY_PRESSURE_TREND_HPAH) or 0) > -1.6
                else "\u2193\u2193"
            ),
            "color": (
                "rgba(74,222,128,0.9)"
                if (d.get(KEY_PRESSURE_TREND_HPAH) or 0) >= 0.8
                else "rgba(251,191,36,0.9)"
                if (d.get(KEY_PRESSURE_TREND_HPAH) or 0) <= -0.8
                else "rgba(255,255,255,0.65)"
            ),
        },
    ),
    WSSensorDescription(
        key=KEY_HEALTH_DISPLAY,
        translation_key="station_health",
        name="WS Station Health",
        icon="mdi:heart-pulse",
        attrs_fn=lambda d: {
            "color": d.get("_health_color"),
            "battery_pct": d.get(KEY_BATTERY_PCT),
            "data_quality": d.get(KEY_DATA_QUALITY),
        },
    ),
    WSSensorDescription(
        key=KEY_FORECAST_TILES,
        translation_key="forecast_tiles",
        name="WS Forecast Tiles",
        icon="mdi:calendar-weather",
        value_fn=lambda d: "available" if d.get(KEY_FORECAST_TILES) else "unavailable",
        attrs_fn=lambda d: {
            "tiles": d.get(KEY_FORECAST_TILES) or [],
            "count": len(d.get(KEY_FORECAST_TILES) or []),
        },
    ),
    # =========================================================================
    # 24h ROLLING STATISTICS
    # =========================================================================
    WSSensorDescription(
        key=KEY_TEMP_HIGH_24H,
        translation_key="temperature_high_24h",
        name="WS Temperature High 24h",
        icon="mdi:thermometer-high",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_TEMP_LOW_24H,
        translation_key="temperature_low_24h",
        name="WS Temperature Low 24h",
        icon="mdi:thermometer-low",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_TEMP_AVG_24H,
        translation_key="temperature_average_24h",
        name="WS Temperature Average 24h",
        icon="mdi:thermometer",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_WIND_GUST_MAX_24H,
        translation_key="wind_gust_max_24h",
        name="WS Wind Gust Max 24h",
        icon="mdi:weather-windy-variant",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit=UNIT_WIND_MS,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # =========================================================================
    # DISPLAY / LEVEL SENSORS
    # =========================================================================
    WSSensorDescription(
        key=KEY_HUMIDITY_LEVEL_DISPLAY,
        translation_key="humidity_level",
        name="WS Humidity Level",
        icon="mdi:water-percent",
    ),
    WSSensorDescription(
        key=KEY_UV_LEVEL_DISPLAY,
        translation_key="uv_level",
        name="WS UV Level",
        icon="mdi:sun-wireless",
        attrs_fn=lambda d: {
            "uv_index": d.get(KEY_UV),
            "recommendation": d.get("_uv_recommendation"),
            "burn_time_fair_skin": d.get("_uv_burn_fair_skin"),
        },
    ),
    WSSensorDescription(
        key=KEY_TEMP_DISPLAY,
        translation_key="temperature_display",
        name="WS Temperature Display",
        icon="mdi:thermometer",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {
            "bar_percent": d.get("_temp_bar_percent", 50),
            "color": d.get("_temp_color", "#4ADE80"),
        },
    ),
    WSSensorDescription(
        key=KEY_FIRE_RISK_SCORE,
        translation_key="fire_risk_score",
        name="WS Fire Risk Score",
        icon="mdi:fire",
        native_unit="score",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "danger_level": d.get("_fire_danger_level"),
            "rain_24h_mm": d.get("_fire_rain_24h_mm"),
            "temperature_c": d.get(KEY_NORM_TEMP_C),
            "humidity_pct": d.get(KEY_NORM_HUMIDITY),
            "wind_ms": d.get(KEY_NORM_WIND_SPEED_MS),
            "fwi": d.get(KEY_FWI),
            "bui": d.get(KEY_FWI_BUI),
            "isi": d.get(KEY_FWI_ISI),
        },
    ),
    # =========================================================================
    # v1.3.0 - Canadian FWI components (all disabled by default)
    # =========================================================================
    WSSensorDescription(
        key=KEY_FWI_FFMC,
        translation_key="fwi_ffmc",
        name="WS FWI Fine Fuel Moisture Code",
        icon="mdi:leaf",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        entity_registry_enabled_default=False,
    ),
    WSSensorDescription(
        key=KEY_FWI_DMC,
        translation_key="fwi_dmc",
        name="WS FWI Duff Moisture Code",
        icon="mdi:layers",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        entity_registry_enabled_default=False,
    ),
    WSSensorDescription(
        key=KEY_FWI_DC,
        translation_key="fwi_dc",
        name="WS FWI Drought Code",
        icon="mdi:water-remove",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        entity_registry_enabled_default=False,
    ),
    WSSensorDescription(
        key=KEY_FWI_ISI,
        translation_key="fwi_isi",
        name="WS FWI Initial Spread Index",
        icon="mdi:fire-alert",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        entity_registry_enabled_default=False,
        attrs_fn=lambda d: {
            "ffmc": d.get(KEY_FWI_FFMC),
            "wind_kmh": round(float(d[KEY_NORM_WIND_SPEED_MS]) * 3.6, 1)
            if d.get(KEY_NORM_WIND_SPEED_MS) is not None
            else None,
        },
    ),
    WSSensorDescription(
        key=KEY_FWI_BUI,
        translation_key="fwi_bui",
        name="WS FWI Buildup Index",
        icon="mdi:fire-hydrant",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        entity_registry_enabled_default=False,
        attrs_fn=lambda d: {
            "dmc": d.get(KEY_FWI_DMC),
            "dc": d.get(KEY_FWI_DC),
        },
    ),
    WSSensorDescription(
        key=KEY_FWI,
        translation_key="fwi",
        name="WS Fire Weather Index",
        icon="mdi:fire-circle",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        entity_registry_enabled_default=False,
        attrs_fn=lambda d: {
            "isi": d.get(KEY_FWI_ISI),
            "bui": d.get(KEY_FWI_BUI),
            "dsr": d.get(KEY_FWI_DSR),
            "danger_level": d.get("_fire_danger_level"),
        },
    ),
    WSSensorDescription(
        key=KEY_FWI_DSR,
        translation_key="fwi_dsr",
        name="WS FWI Daily Severity Rating",
        icon="mdi:chart-line",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        entity_registry_enabled_default=False,
        attrs_fn=lambda d: {
            "fwi": d.get(KEY_FWI),
        },
    ),
    # =========================================================================
    # SEA SURFACE TEMPERATURE (Open-Meteo Marine API)
    # =========================================================================
    WSSensorDescription(
        key=KEY_SEA_SURFACE_TEMP,
        translation_key="sea_surface_temperature",
        name="WS Sea Surface Temperature",
        icon="mdi:waves",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "comfort": d.get("_sea_temp_comfort"),
            "hourly_forecast": d.get("_sea_temp_hourly"),
            "grid_latitude": d.get("_sea_temp_grid_lat"),
            "grid_longitude": d.get("_sea_temp_grid_lon"),
        },
    ),
    # ---------------------------------------------------------------
    # ET₀ Evapotranspiration  (v0.6.0)
    # ---------------------------------------------------------------
    WSSensorDescription(
        key=KEY_ET0_DAILY_MM,
        translation_key="et0_daily",
        name="WS ET₀ (Daily)",
        icon="mdi:sprout",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit="mm",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "et0_hourly_mm": d.get(KEY_ET0_HOURLY_MM),
        },
    ),
    WSSensorDescription(
        key=KEY_ET0_HOURLY_MM,
        translation_key="et0_hourly",
        name="WS ET₀ (Hourly)",
        icon="mdi:sprout-outline",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit="mm",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # ---------------------------------------------------------------
    # Upload Status  (v0.6.0)
    # ---------------------------------------------------------------
    WSSensorDescription(
        key=KEY_WU_STATUS,
        translation_key="wu_status",
        name="WS Weather Underground Status",
        icon="mdi:weather-cloudy-clock",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {"last_upload": d.get("_wu_last_upload")},
    ),
    # ---------------------------------------------------------------
    # Air Quality  (v0.7.0, Open-Meteo AQI API)
    # ---------------------------------------------------------------
    WSSensorDescription(
        key=KEY_AQI,
        translation_key="aqi",
        name="WS Air Quality Index",
        icon="mdi:air-filter",
        native_unit="AQI",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "level": d.get(KEY_AQI_LEVEL),
            "pm2_5_ug_m3": d.get(KEY_PM2_5),
            "pm10_ug_m3": d.get(KEY_PM10),
            "no2_ug_m3": d.get(KEY_NO2),
            "ozone_ug_m3": d.get(KEY_OZONE),
        },
    ),
    WSSensorDescription(
        key=KEY_PM2_5,
        translation_key="pm2_5",
        name="WS PM2.5",
        icon="mdi:smoke",
        native_unit="µg/m³",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_PM10,
        translation_key="pm10",
        name="WS PM10",
        icon="mdi:smoke",
        native_unit="µg/m³",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_NO2,
        name="WS NO2",
        translation_key="no2",
        icon="mdi:molecule",
        native_unit="µg/m³",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_OZONE,
        name="WS Ozone",
        translation_key="ozone",
        icon="mdi:air-filter",
        native_unit="µg/m³",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # ---------------------------------------------------------------
    # Pollen  (v0.7.0, Open-Meteo)
    # ---------------------------------------------------------------
    WSSensorDescription(
        key=KEY_POLLEN_OVERALL,
        translation_key="pollen_level",
        name="WS Pollen Level",
        icon="mdi:flower-pollen",
        attrs_fn=lambda d: {
            "grass_index": d.get(KEY_POLLEN_GRASS),
            "grass_level": "None" if d.get(KEY_POLLEN_GRASS) == 0 else d.get("_pollen_grass_level"),
            "tree_index": d.get(KEY_POLLEN_TREE),
            "tree_level": "None" if d.get(KEY_POLLEN_TREE) == 0 else d.get("_pollen_tree_level"),
            "weed_index": d.get(KEY_POLLEN_WEED),
            "weed_level": "None" if d.get(KEY_POLLEN_WEED) == 0 else d.get("_pollen_weed_level"),
        },
    ),
    WSSensorDescription(
        key=KEY_POLLEN_GRASS,
        translation_key="pollen_grass",
        name="WS Pollen Grass",
        icon="mdi:flower-pollen-outline",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_POLLEN_TREE,
        translation_key="pollen_tree",
        name="WS Pollen Tree",
        icon="mdi:tree",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_POLLEN_WEED,
        translation_key="pollen_weed",
        name="WS Pollen Weed",
        icon="mdi:flower-pollen-outline",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # ---------------------------------------------------------------
    # Moon  (v0.8.0, calculated)
    # ---------------------------------------------------------------
    WSSensorDescription(
        key=KEY_MOON_DISPLAY,
        translation_key="moon",
        name="WS Moon",
        icon="mdi:moon-waxing-crescent",
        attrs_fn=lambda d: {
            "phase": d.get(KEY_MOON_PHASE),
            "illumination_pct": d.get(KEY_MOON_ILLUMINATION_PCT),
            "age_days": d.get(KEY_MOON_AGE_DAYS),
            "days_to_full_moon": d.get(KEY_MOON_NEXT_FULL),
            "days_to_new_moon": d.get(KEY_MOON_NEXT_NEW),
        },
    ),
    WSSensorDescription(
        key=KEY_MOON_ILLUMINATION_PCT,
        translation_key="moon_illumination",
        name="WS Moon Illumination",
        icon="mdi:moon-full",
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # ---------------------------------------------------------------
    # Solar forecast  (v0.9.0, forecast.solar)
    # ---------------------------------------------------------------
    WSSensorDescription(
        key=KEY_SOLAR_FORECAST_TODAY_KWH,
        translation_key="solar_forecast_today",
        name="WS Solar Forecast Today",
        icon="mdi:solar-power",
        native_unit="kWh",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "tomorrow_kwh": d.get(KEY_SOLAR_FORECAST_TOMORROW_KWH),
            "status": d.get(KEY_SOLAR_FORECAST_STATUS),
        },
    ),
    WSSensorDescription(
        key=KEY_SOLAR_FORECAST_TOMORROW_KWH,
        translation_key="solar_forecast_tomorrow",
        name="WS Solar Forecast Tomorrow",
        icon="mdi:solar-power-variant",
        native_unit="kWh",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # Penman-Monteith ET₀ (v0.9.0, when solar radiation sensor available)
    WSSensorDescription(
        key=KEY_ET0_PM_DAILY_MM,
        translation_key="et0_pm_daily",
        name="WS ET₀ Penman-Monteith (Daily)",
        icon="mdi:water-pump",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit="mm",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "hargreaves_et0": d.get(KEY_ET0_DAILY_MM),
        },
    ),
    # =========================================================================
    # v1.2.0 - NEW METEOROLOGICAL SENSORS
    # =========================================================================
    # B1 Fog probability
    WSSensorDescription(
        key=KEY_FOG_PROBABILITY,
        translation_key="fog_probability",
        name="WS Fog Probability",
        icon="mdi:weather-fog",
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "risk_level": d.get("_fog_risk_level"),
            "dew_point_depression_c": d.get("_fog_dew_point_depression"),
        },
    ),
    # B2 Thunderstorm risk
    WSSensorDescription(
        key=KEY_THUNDERSTORM_RISK,
        translation_key="thunderstorm_risk",
        name="WS Thunderstorm Risk",
        icon="mdi:weather-lightning",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "risk_level": d.get("_thunderstorm_level"),
            "contributing_factors": d.get("_thunderstorm_factors", []),
            "caveat": d.get("_thunderstorm_caveat"),
        },
    ),
    # B5 Streak counters
    WSSensorDescription(
        key=KEY_DRY_STREAK,
        translation_key="dry_streak",
        name="WS Dry Streak",
        icon="mdi:water-off",
        native_unit="d",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {"last_rain_date": d.get("_dry_streak_last_rain")},
    ),
    WSSensorDescription(
        key=KEY_HEAT_STREAK,
        translation_key="heat_streak",
        name="WS Heat Streak",
        icon="mdi:thermometer-high",
        native_unit="d",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {"threshold_c": d.get("_heat_streak_threshold_c")},
    ),
    WSSensorDescription(
        key=KEY_FROST_STREAK,
        translation_key="frost_streak",
        name="WS Frost Streak",
        icon="mdi:snowflake",
        native_unit="d",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {"threshold_c": d.get("_frost_streak_threshold_c")},
    ),
    # =========================================================================
    # v1.2.0 - STATION INTELLIGENCE
    # =========================================================================
    # C1 Sensor drift detection
    WSSensorDescription(
        key=KEY_SENSOR_DRIFT_FLAGS,
        translation_key="sensor_drift",
        name="WS Sensor Drift",
        icon="mdi:chart-timeline-variant-shimmer",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {
            "drifting_sensors": d.get("_drift_details", []),
            "all_clear": len(d.get("_drift_details") or []) == 0,
        },
    ),
    # C2 Cross-sensor consistency
    WSSensorDescription(
        key=KEY_CONSISTENCY_FLAGS,
        translation_key="sensor_consistency",
        name="WS Sensor Consistency",
        icon="mdi:compare-horizontal",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {
            "flags": d.get("_consistency_details", []),
            "all_clear": len(d.get("_consistency_details") or []) == 0,
        },
    ),
    # =========================================================================
    # v1.2.0 - ROLLING CLIMATOLOGY
    # =========================================================================
    # D1 30-day stats
    WSSensorDescription(
        key=KEY_CLIMATOLOGY_30D,
        translation_key="climatology_30d",
        name="WS Climatology (30-day)",
        icon="mdi:calendar-month",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: d.get("_climatology_stats") or {},
    ),
    # D2 Anomaly sensors
    WSSensorDescription(
        key=KEY_TEMP_ANOMALY_30D,
        translation_key="temperature_anomaly_30d",
        name="WS Temperature Anomaly (30-day)",
        icon="mdi:thermometer-alert",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {"normal_30d_c": d.get("_temp_normal_30d")},
    ),
    WSSensorDescription(
        key=KEY_RAIN_ANOMALY_30D,
        translation_key="rain_anomaly_30d",
        name="WS Rain Anomaly (30-day)",
        icon="mdi:water-percent-alert",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {"normal_30d_avg_mm": d.get("_rain_normal_30d_avg")},
    ),
    # =========================================================================
    # v1.2.0 - SELF-LEARNING SENSORS (METAR-gated + always-on)
    # =========================================================================
    # A4 Solar lux factor (always on)
    WSSensorDescription(
        key=KEY_SOLAR_LUX_FACTOR,
        translation_key="solar_lux_factor",
        name="WS Solar Lux Factor",
        icon="mdi:sun-wireless",
        native_unit="lx/(W/m²)",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {"calibration_days": d.get("_solar_lux_factor_n_days", 0)},
    ),
    # Forecast agreement: Zambretti vs Open-Meteo
    WSSensorDescription(
        key=KEY_FORECAST_AGREEMENT,
        translation_key="forecast_agreement",
        name="WS Forecast Agreement",
        icon="mdi:scale-balance",
        attrs_fn=lambda d: {
            "zambretti_implied_rain_pct": d.get("_forecast_agreement_z_rain_pct"),
            "openmeteo_precip_prob": d.get("_forecast_agreement_api_precip_prob"),
            "delta_pp": d.get("_forecast_agreement_delta"),
            "zambretti_forecast": d.get(KEY_ZAMBRETTI_FORECAST),
        },
    ),
    # A3 Forecast skill (always on once enough data)
    WSSensorDescription(
        key=KEY_FORECAST_SKILL,
        translation_key="forecast_skill",
        name="WS Forecast Skill",
        icon="mdi:chart-bar",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {
            "brier_score_local": d.get("_forecast_skill_bs_local"),
            "brier_score_openmeteo": d.get("_forecast_skill_bs_openmeteo"),
            "blend_local": d.get("_forecast_blend_local"),
            "blend_openmeteo": d.get("_forecast_blend_openmeteo"),
            "n_outcomes": d.get("_forecast_skill_n_outcomes", 0),
        },
    ),
]

# Sensor-to-feature-toggle mapping for granular control
_FEATURE_TOGGLE_MAP: dict[str, str] = {
    # Display sensors
    KEY_HUMIDITY_LEVEL_DISPLAY: CONF_ENABLE_DISPLAY_SENSORS,
    KEY_UV_LEVEL_DISPLAY: CONF_ENABLE_DISPLAY_SENSORS,
    KEY_TEMP_DISPLAY: CONF_ENABLE_DISPLAY_SENSORS,
    KEY_RAIN_DISPLAY: CONF_ENABLE_DISPLAY_SENSORS,
    KEY_PRESSURE_TREND_DISPLAY: CONF_ENABLE_DISPLAY_SENSORS,
    KEY_HEALTH_DISPLAY: CONF_ENABLE_DISPLAY_SENSORS,
    KEY_FORECAST_TILES: CONF_ENABLE_DISPLAY_SENSORS,
    # Risk sensors (fire). FWI composite + DSR are primary outputs (with fire
    # risk); the 5 intermediate codes are gated separately (v1.6.2) and need
    # fire risk enabled to produce data.
    KEY_FIRE_RISK_SCORE: CONF_ENABLE_FIRE_RISK,
    KEY_FWI: CONF_ENABLE_FIRE_RISK,
    KEY_FWI_DSR: CONF_ENABLE_FIRE_RISK,
    KEY_FWI_FFMC: CONF_ENABLE_FWI_COMPONENTS,
    KEY_FWI_DMC: CONF_ENABLE_FWI_COMPONENTS,
    KEY_FWI_DC: CONF_ENABLE_FWI_COMPONENTS,
    KEY_FWI_ISI: CONF_ENABLE_FWI_COMPONENTS,
    KEY_FWI_BUI: CONF_ENABLE_FWI_COMPONENTS,
    # Sea temperature
    KEY_SEA_SURFACE_TEMP: CONF_ENABLE_SEA_TEMP,
    # Air Quality  (v0.7.0)
    KEY_AQI: CONF_ENABLE_AIR_QUALITY,
    KEY_PM2_5: CONF_ENABLE_AIR_QUALITY,
    KEY_PM10: CONF_ENABLE_AIR_QUALITY,
    KEY_NO2: CONF_ENABLE_AIR_QUALITY,
    KEY_OZONE: CONF_ENABLE_AIR_QUALITY,
    # Pollen  (v0.7.0)
    KEY_POLLEN_OVERALL: CONF_ENABLE_POLLEN,
    KEY_POLLEN_GRASS: CONF_ENABLE_POLLEN,
    KEY_POLLEN_TREE: CONF_ENABLE_POLLEN,
    KEY_POLLEN_WEED: CONF_ENABLE_POLLEN,
    # Moon  (v0.8.0)
    KEY_MOON_DISPLAY: CONF_ENABLE_MOON,
    KEY_MOON_ILLUMINATION_PCT: CONF_ENABLE_MOON,
    # Solar forecast  (v0.9.0)
    KEY_SOLAR_FORECAST_TODAY_KWH: CONF_ENABLE_SOLAR_FORECAST,
    KEY_SOLAR_FORECAST_TOMORROW_KWH: CONF_ENABLE_SOLAR_FORECAST,
    KEY_ET0_PM_DAILY_MM: CONF_ENABLE_SOLAR_FORECAST,
    # v1.2.0 - optional new sensors
    KEY_FOG_PROBABILITY: CONF_ENABLE_FOG,
    KEY_THUNDERSTORM_RISK: CONF_ENABLE_THUNDERSTORM,
    # v1.3.0: streaks are ungated (always on, no switch required)
    # KEY_GDD_TODAY, KEY_GDD_SEASON removed (degree days cut in v1.3.0)
    # KEY_LEARNED_*, KEY_CAL_SUGGESTION_* removed (METAR cut in v1.3.0)
    # v1.5.0 - comfort indices + agrometeorological sensors
    KEY_HEAT_INDEX: CONF_ENABLE_COMFORT_INDICES,
    KEY_WIND_CHILL: CONF_ENABLE_COMFORT_INDICES,
    KEY_HUMIDEX: CONF_ENABLE_COMFORT_INDICES,
    KEY_VPD: CONF_ENABLE_COMFORT_INDICES,
    KEY_ABSOLUTE_HUMIDITY: CONF_ENABLE_COMFORT_INDICES,
    KEY_DELTA_T: CONF_ENABLE_COMFORT_INDICES,
    KEY_THW_INDEX: CONF_ENABLE_COMFORT_INDICES,
    KEY_THSW_INDEX: CONF_ENABLE_COMFORT_INDICES,
    KEY_WIND_RUN_KM: CONF_ENABLE_COMFORT_INDICES,
    KEY_CHILL_HOURS_TODAY: CONF_ENABLE_COMFORT_INDICES,
    KEY_CHILL_HOURS_SEASON: CONF_ENABLE_COMFORT_INDICES,
    KEY_CLEARNESS_INDEX: CONF_ENABLE_COMFORT_INDICES,
    KEY_CLOUD_COVER_PCT: CONF_ENABLE_COMFORT_INDICES,
    # v1.6.0 French regional
    KEY_VIGILANCE_MAX_LEVEL: CONF_ENABLE_VIGILANCE_METEO,
    KEY_RIVER_LEVEL_M: CONF_ENABLE_VIGICRUES,
    # v1.6.2 - station diagnostics (opt-in)
    KEY_SENSOR_DRIFT_FLAGS: CONF_ENABLE_DIAGNOSTICS,
    KEY_CONSISTENCY_FLAGS: CONF_ENABLE_DIAGNOSTICS,
    KEY_SENSOR_QUALITY_FLAGS: CONF_ENABLE_DIAGNOSTICS,
    KEY_FORECAST_SKILL: CONF_ENABLE_DIAGNOSTICS,
    KEY_FORECAST_AGREEMENT: CONF_ENABLE_DIAGNOSTICS,
    KEY_SOLAR_LUX_FACTOR: CONF_ENABLE_DIAGNOSTICS,
    KEY_CLIMATOLOGY_30D: CONF_ENABLE_DIAGNOSTICS,
    # v1.6.2 - advanced / derived representations (opt-in)
    KEY_ZAMBRETTI_NUMBER: CONF_ENABLE_ADVANCED_SENSORS,
    KEY_ET0_HOURLY_MM: CONF_ENABLE_ADVANCED_SENSORS,
    KEY_WIND_DIR_SMOOTH_DEG: CONF_ENABLE_ADVANCED_SENSORS,
    # v1.7.0 - precipitation nowcast (opt-in)
    KEY_RAIN_NEXT_60MIN: CONF_ENABLE_NOWCAST,
    KEY_MINUTES_UNTIL_RAIN: CONF_ENABLE_NOWCAST,
    KEY_MINUTES_UNTIL_DRY: CONF_ENABLE_NOWCAST,
    KEY_NOWCAST_INTENSITY: CONF_ENABLE_NOWCAST,
}


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    coordinator = hass.data[DOMAIN][entry.entry_id]
    prefix = (entry.options.get(CONF_PREFIX) or entry.data.get(CONF_PREFIX) or DEFAULT_PREFIX).strip().lower()

    opts = {**entry.data, **entry.options}

    filtered: list[WSSensorDescription] = []
    for desc in SENSORS:
        toggle_key = _FEATURE_TOGGLE_MAP.get(desc.key)
        if toggle_key is not None and not opts.get(toggle_key, False):
            continue
        filtered.append(desc)

    entities: list[WSSensor] = [WSSensor(coordinator, entry, desc, prefix) for desc in filtered]
    async_add_entities(entities)


class WSSensor(RestoreEntity, CoordinatorEntity, SensorEntity):
    """A single derived sensor for Weather Station Core.

    Mixes in RestoreEntity so that sensors that warm up slowly (24h stats,
    Kalman filter, degree days, ET₀) report their last-known value on HA
    restart until the coordinator computes a fresh value.
    """

    _attr_has_entity_name = True

    # Keys that benefit from restore (slow-to-warm-up or accumulating sensors)
    _RESTORE_KEYS = {
        KEY_ET0_DAILY_MM,
        KEY_TEMP_HIGH_24H,
        KEY_TEMP_LOW_24H,
        KEY_TEMP_AVG_24H,
        KEY_WIND_GUST_MAX_24H,
        KEY_RAIN_ACCUM_1H,
        KEY_RAIN_ACCUM_24H,
        # v1.3.0: removed cut keys (HDD/CDD/METAR) from restore set
        # v1.5.0: accumulation sensors
        KEY_WIND_RUN_KM,
        KEY_CHILL_HOURS_TODAY,
        KEY_CHILL_HOURS_SEASON,
    }

    # v1.6.2: _DISABLED_BY_DEFAULT removed. Previously-disabled sensors are now
    # gated by opt-in feature toggles (enable_diagnostics, enable_fwi_components,
    # enable_advanced_sensors) via _FEATURE_TOGGLE_MAP, so they are created and
    # working when their group is enabled rather than created in a dead state.

    def __init__(self, coordinator, entry: ConfigEntry, desc: WSSensorDescription, prefix: str):
        super().__init__(coordinator)
        self._desc = desc
        self._entry = entry
        self._prefix = prefix
        self._restored_value: Any = None  # populated by async_added_to_hass for restore-capable sensors

        self._attr_unique_id = f"{entry.entry_id}_{desc.key}"
        self._attr_suggested_object_id = f"{prefix}_{self._slug_for_key(desc.key)}"
        if desc.translation_key:
            self._attr_translation_key = desc.translation_key
        else:
            self._attr_name = desc.name
        self._attr_icon = desc.icon
        self._attr_device_class = desc.device_class
        self._attr_native_unit_of_measurement = desc.native_unit
        self._attr_state_class = desc.state_class
        if desc.entity_category is not None:
            self._attr_entity_category = desc.entity_category

    @property
    def device_info(self):
        return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        desired = f"sensor.{self._attr_suggested_object_id}"
        if self.entity_id and self.entity_id != desired:
            reg = er.async_get(self.hass)
            current = reg.async_get(self.entity_id)
            if current and current.unique_id == self.unique_id and reg.async_get(desired) is None:
                reg.async_update_entity(self.entity_id, new_entity_id=desired)

        # Restore last known value for sensors that are slow to warm up
        if self._desc.key in self._RESTORE_KEYS:
            last_state = await self.async_get_last_state()
            if last_state is not None and last_state.state not in ("unknown", "unavailable", None, ""):
                try:
                    self._restored_value = float(last_state.state)
                except (ValueError, TypeError):
                    self._restored_value = last_state.state
            else:
                self._restored_value = None

    @staticmethod
    def _slug_for_key(key: str) -> str:
        overrides = {
            KEY_DATA_QUALITY: "data_quality_banner",
            KEY_FORECAST: "forecast_daily",
            KEY_NORM_TEMP_C: "temperature",
            KEY_DEW_POINT_C: "dew_point",
            KEY_FROST_POINT_C: "frost_point",
            KEY_WET_BULB_C: "wet_bulb",
            KEY_NORM_HUMIDITY: "humidity",
            KEY_NORM_PRESSURE_HPA: "station_pressure",
            KEY_SEA_LEVEL_PRESSURE_HPA: "sea_level_pressure",
            KEY_NORM_WIND_SPEED_MS: "wind_speed",
            KEY_NORM_WIND_GUST_MS: "wind_gust",
            KEY_NORM_WIND_DIR_DEG: "wind_direction",
            KEY_NORM_RAIN_TOTAL_MM: "rain_total",
            KEY_RAIN_RATE_FILT: "rain_rate",
            KEY_BATTERY_PCT: "battery",
            KEY_FEELS_LIKE_C: "feels_like",
            KEY_ZAMBRETTI_FORECAST: "zambretti_forecast",
            KEY_ZAMBRETTI_NUMBER: "zambretti_number",
            KEY_WIND_BEAUFORT: "wind_beaufort",
            KEY_WIND_QUADRANT: "wind_quadrant",
            KEY_WIND_DIR_SMOOTH_DEG: "wind_direction_smooth",
            KEY_CURRENT_CONDITION: "current_condition",
            KEY_RAIN_PROBABILITY: "rain_probability",
            KEY_RAIN_PROBABILITY_COMBINED: "rain_probability_combined",
            KEY_RAIN_DISPLAY: "rain_display",
            KEY_RAIN_ACCUM_1H: "rain_last_1h",
            KEY_RAIN_ACCUM_24H: "rain_last_24h",
            KEY_PRESSURE_TREND_DISPLAY: "pressure_trend",
            KEY_HEALTH_DISPLAY: "station_health",
            KEY_FORECAST_TILES: "forecast_tiles",
            KEY_TEMP_HIGH_24H: "temperature_high_24h",
            KEY_TEMP_LOW_24H: "temperature_low_24h",
            KEY_TEMP_AVG_24H: "temperature_avg_24h",
            KEY_WIND_GUST_MAX_24H: "wind_gust_max_24h",
            KEY_HUMIDITY_LEVEL_DISPLAY: "humidity_level",
            KEY_UV_LEVEL_DISPLAY: "uv_level",
            KEY_TEMP_DISPLAY: "temperature_display",
            KEY_FIRE_RISK_SCORE: "fire_risk_score",
            KEY_SENSOR_QUALITY_FLAGS: "sensor_quality_flags",
            KEY_LUX: "illuminance",
            KEY_UV: "uv_index",
            KEY_ALERT_STATE: "alert_state",
            KEY_ALERT_MESSAGE: "alert_message",
            KEY_PACKAGE_STATUS: "package_status",
            KEY_PRESSURE_CHANGE_WINDOW_HPA: "pressure_change_window",
            KEY_PRESSURE_TREND_HPAH: "pressure_trend_raw",
            KEY_SEA_SURFACE_TEMP: "sea_surface_temperature",
            # v0.6.0
            KEY_ET0_DAILY_MM: "et0_daily",
            KEY_ET0_HOURLY_MM: "et0_hourly",
            KEY_WU_STATUS: "wu_upload_status",
            # v0.7.0
            KEY_AQI: "air_quality_index",
            KEY_PM2_5: "pm2_5",
            KEY_PM10: "pm10",
            KEY_NO2: "no2",
            KEY_OZONE: "ozone",
            KEY_POLLEN_OVERALL: "pollen_level",
            KEY_POLLEN_GRASS: "pollen_grass",
            KEY_POLLEN_TREE: "pollen_tree",
            KEY_POLLEN_WEED: "pollen_weed",
            # v0.8.0
            KEY_MOON_DISPLAY: "moon",
            KEY_MOON_ILLUMINATION_PCT: "moon_illumination",
            # v0.9.0
            KEY_SOLAR_FORECAST_TODAY_KWH: "solar_forecast_today",
            KEY_SOLAR_FORECAST_TOMORROW_KWH: "solar_forecast_tomorrow",
            KEY_ET0_PM_DAILY_MM: "et0_penman_monteith",
            # v1.2.0
            KEY_FOG_PROBABILITY: "fog_probability",
            KEY_THUNDERSTORM_RISK: "thunderstorm_risk",
            KEY_DRY_STREAK: "dry_streak_days",
            KEY_HEAT_STREAK: "heat_streak_days",
            KEY_FROST_STREAK: "frost_streak_days",
            KEY_SENSOR_DRIFT_FLAGS: "sensor_drift",
            KEY_CONSISTENCY_FLAGS: "sensor_consistency",
            KEY_CLIMATOLOGY_30D: "climatology_30d",
            KEY_TEMP_ANOMALY_30D: "temperature_anomaly_30d",
            KEY_RAIN_ANOMALY_30D: "rain_anomaly_30d",
            KEY_FORECAST_AGREEMENT: "forecast_agreement",
            KEY_FORECAST_SKILL: "forecast_skill",
            KEY_SOLAR_LUX_FACTOR: "solar_lux_factor",
            # v1.3.0 - FWI components
            KEY_FWI_FFMC: "fwi_ffmc",
            KEY_FWI_DMC: "fwi_dmc",
            KEY_FWI_DC: "fwi_dc",
            KEY_FWI_ISI: "fwi_isi",
            KEY_FWI_BUI: "fwi_bui",
            KEY_FWI: "fwi",
            KEY_FWI_DSR: "fwi_dsr",
            # v1.5.0 - comfort indices + agrometeorological
            KEY_HEAT_INDEX: "heat_index",
            KEY_WIND_CHILL: "wind_chill",
            KEY_HUMIDEX: "humidex",
            KEY_VPD: "vpd",
            KEY_ABSOLUTE_HUMIDITY: "absolute_humidity",
            KEY_DELTA_T: "delta_t",
            KEY_THW_INDEX: "thw_index",
            KEY_THSW_INDEX: "thsw_index",
            KEY_WIND_RUN_KM: "wind_run",
            KEY_CHILL_HOURS_TODAY: "chill_hours_today",
            KEY_CHILL_HOURS_SEASON: "chill_hours_season",
            KEY_CLEARNESS_INDEX: "clearness_index",
            KEY_CLOUD_COVER_PCT: "cloud_cover",
            KEY_VIGILANCE_MAX_LEVEL: "vigilance",
            KEY_RIVER_LEVEL_M: "river_level",
            KEY_RAIN_NEXT_60MIN: "rain_next_60min",
        }
        if key in overrides:
            return overrides[key]
        # Fallback: strip common prefixes/suffixes for a clean slug
        return key.replace("_mmph", "").replace("_ms", "").replace("_hpa", "").replace("_c", "")

    @property
    def native_value(self):
        d = self.coordinator.data or {}
        if self._desc.value_fn is not None:
            try:
                val = self._desc.value_fn(d)
            except Exception:
                val = None
        else:
            val = d.get(self._desc.key)

        # Fall back to last-restored value for slow-warm-up sensors during startup
        if val is None and self._restored_value is not None and self._desc.key in self._RESTORE_KEYS:
            return self._restored_value

        # Once the coordinator provides a real value, clear the restore cache
        if val is not None and self._restored_value is not None:
            self._restored_value = None

        return val

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        d = self.coordinator.data or {}
        if self._desc.attrs_fn is not None:
            try:
                return {k: v for k, v in (self._desc.attrs_fn(d) or {}).items() if v is not None}
            except Exception:
                return {}
        if self._desc.key == KEY_ALERT_STATE:
            alerts = d.get("_active_alerts", [])
            return {
                "message": d.get(KEY_ALERT_MESSAGE, "All clear"),
                "icon": d.get("_alert_icon", "mdi:check-circle-outline"),
                "color": d.get("_alert_color", "rgba(74,222,128,0.8)"),
                "active_alerts": alerts,
                "alert_count": len(alerts),
            }
        if self._desc.key == KEY_ALERT_MESSAGE:
            return {
                "alert_state": d.get(KEY_ALERT_STATE, "clear"),
                "icon": d.get("_alert_icon", "mdi:check-circle-outline"),
                "color": d.get("_alert_color", "rgba(74,222,128,0.8)"),
            }
        if self._desc.key in (KEY_DATA_QUALITY, KEY_PACKAGE_STATUS):
            return {
                "package_ok": d.get("package_ok"),
                "data_quality": d.get(KEY_DATA_QUALITY),
                "alert_state": d.get(KEY_ALERT_STATE),
            }
        return {}
