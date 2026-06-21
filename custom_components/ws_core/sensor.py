"""Sensors for Weather Station Core -- v1.7.1."""

from __future__ import annotations

import contextlib
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
    # v2.0
    CONF_ENABLE_AWEKAS,
    # v1.5.0
    CONF_ENABLE_COMFORT_INDICES,
    CONF_ENABLE_CWOP,
    CONF_ENABLE_DEGREE_DAYS,
    # v1.6.2
    CONF_ENABLE_DIAGNOSTICS,
    CONF_ENABLE_DISPLAY_SENSORS,
    CONF_ENABLE_FIRE_RISK,
    # v1.2.0
    CONF_ENABLE_FOG,
    # v1.6.2
    CONF_ENABLE_FWI_COMPONENTS,
    CONF_ENABLE_INDOOR,
    CONF_ENABLE_LIGHTNING,
    # v0.8.0
    CONF_ENABLE_MOON,
    # v1.7.0
    CONF_ENABLE_NOWCAST,
    CONF_ENABLE_OWM_STATIONS,
    CONF_ENABLE_POLLEN,
    CONF_ENABLE_PWSWEATHER,
    CONF_ENABLE_SEA_TEMP,
    # v2.1
    CONF_ENABLE_SOIL,
    # v0.9.0
    CONF_ENABLE_SOLAR_FORECAST,
    CONF_ENABLE_THUNDERSTORM,
    CONF_ENABLE_VIGICRUES,
    # v1.6.0
    CONF_ENABLE_VIGILANCE_METEO,
    CONF_ENABLE_WEATHERCLOUD,
    CONF_ENABLE_WINDY,
    CONF_ENABLE_WOW,
    CONF_ENABLE_WUNDERGROUND,
    CONF_INDOOR_ROOMS,
    CONF_PREFIX,
    CONF_VIGICRUES_RIVER_NAME,
    CONF_VIGICRUES_STATION_CODE,
    CONF_VIGICRUES_STATION_NAME,
    CONF_VIGICRUES_STATIONS,
    DEFAULT_PREFIX,
    DOMAIN,
    # v1.5.0
    KEY_ABSOLUTE_HUMIDITY,
    KEY_AIR_DENSITY,
    KEY_ALERT_MESSAGE,
    KEY_ALERT_STATE,
    # v0.7.0
    KEY_AQI,
    KEY_AQI_LEVEL,
    KEY_AWEKAS_STATUS,
    KEY_BATTERY_PCT,
    KEY_CDD_SEASON,
    KEY_CDD_TODAY_MM,
    KEY_CHILL_HOURS_SEASON,
    KEY_CHILL_HOURS_TODAY,
    KEY_CLEARNESS_INDEX,
    KEY_CLIMATOLOGY_30D,
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
    # v0.6.0
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
    KEY_FROST_STREAK,
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
    # v0.8.0
    KEY_MOON_PHASE,
    KEY_NEIGHBOR_QC,
    KEY_NET_RADIATION,
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
    KEY_RAIN_DISPLAY,
    KEY_RAIN_NEXT_60MIN,
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
    KEY_TEMP_AVG_24H,
    KEY_TEMP_DISPLAY,
    KEY_TEMP_HIGH_24H,
    KEY_TEMP_LOW_24H,
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
    KEY_WIND_QUADRANT,
    KEY_WIND_RUN_KM,
    KEY_WIND_RUN_MONTH_KM,
    KEY_WINDY_STATUS,
    KEY_WOW_STATUS,
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
    suggested_display_precision: int | None = None
    value_fn: Callable[[dict[str, Any]], Any] | None = None
    attrs_fn: Callable[[dict[str, Any]], dict[str, Any]] | None = None
    unit_group: str | None = None
    options: list[str] | None = None


# Conversion factors from canonical internal (metric) value to configured unit.
# wind: from m/s; pressure: from hPa; distance: from km; altitude: from m.
# Rain accumulation (mm->in) and rain rate (mm/h->in/h) share the 1/25.4 factor.
_WIND_FACTORS: dict[str, float] = {"m/s": 1.0, "km/h": 3.6, "mph": 2.23694, "kn": 1.94384}
_PRESSURE_FACTORS: dict[str, float] = {"hPa": 1.0, "inHg": 0.02953, "mmHg": 0.75006}
_DISTANCE_FACTORS: dict[str, float] = {"km": 1.0, "mi": 0.621371}
_ALTITUDE_FACTORS: dict[str, float] = {"m": 1.0, "ft": 3.28084}

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
        suggested_display_precision=1,
    ),
    WSSensorDescription(
        key=KEY_DEW_POINT_C,
        translation_key="dew_point",
        name="WS Dew Point",
        icon="mdi:weather-fog",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
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
        unit_group="pressure",
    ),
    WSSensorDescription(
        key=KEY_SEA_LEVEL_PRESSURE_HPA,
        translation_key="sea_level_pressure",
        name="WS Sea-Level Pressure",
        icon="mdi:gauge-full",
        device_class=SensorDeviceClass.PRESSURE,
        native_unit=UNIT_PRESSURE_HPA,
        state_class=SensorStateClass.MEASUREMENT,
        unit_group="pressure",
    ),
    WSSensorDescription(
        key=KEY_NORM_WIND_SPEED_MS,
        translation_key="wind_speed",
        name="WS Wind Speed",
        icon="mdi:weather-windy",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit=UNIT_WIND_MS,
        state_class=SensorStateClass.MEASUREMENT,
        unit_group="wind",
    ),
    WSSensorDescription(
        key=KEY_NORM_WIND_GUST_MS,
        translation_key="wind_gust",
        name="WS Wind Gust",
        icon="mdi:weather-windy-variant",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit=UNIT_WIND_MS,
        state_class=SensorStateClass.MEASUREMENT,
        unit_group="wind",
    ),
    WSSensorDescription(
        key=KEY_NORM_WIND_DIR_DEG,
        translation_key="wind_direction",
        name="WS Wind Direction",
        icon="mdi:compass",
        device_class=SensorDeviceClass.WIND_DIRECTION,
        native_unit="\u00b0",
        state_class=SensorStateClass.MEASUREMENT_ANGLE,
    ),
    WSSensorDescription(
        key=KEY_NORM_RAIN_TOTAL_MM,
        translation_key="rain_total",
        name="WS Rain Total",
        icon="mdi:water",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.TOTAL_INCREASING,  # FIX: cumulative counter
        unit_group="rain",
    ),
    WSSensorDescription(
        key=KEY_RAIN_RATE_FILT,
        translation_key="rain_rate",
        name="WS Rain Rate",
        icon="mdi:weather-pouring",
        device_class=SensorDeviceClass.PRECIPITATION_INTENSITY,
        native_unit="mm/h",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        unit_group="rain_rate",
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
        unit_group="pressure",
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
    # v2.0 — Stuck-sensor flags (always computed; gated by diagnostics)
    WSSensorDescription(
        key=KEY_SENSOR_STUCK,
        translation_key="sensor_stuck",
        name="WS Sensor Stuck Flags",
        icon="mdi:shield-lock-outline",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: len(d.get(KEY_SENSOR_STUCK) or []),
        attrs_fn=lambda d: {
            "stuck_sensors": d.get(KEY_SENSOR_STUCK) or [],
            "all_clear": len(d.get(KEY_SENSOR_STUCK) or []) == 0,
        },
    ),
    # v2.0 — Spatial neighbor QC (compare vs Open-Meteo NWP grid)
    WSSensorDescription(
        key=KEY_NEIGHBOR_QC,
        translation_key="neighbor_qc",
        name="WS Neighbor QC Flags",
        icon="mdi:map-check-outline",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: len(d.get(KEY_NEIGHBOR_QC) or []),
        attrs_fn=lambda d: {
            "flags": d.get(KEY_NEIGHBOR_QC) or [],
            "all_clear": len(d.get(KEY_NEIGHBOR_QC) or []) == 0,
        },
    ),
    # v2.0 — Temporal spike (σ-based step-change) detection
    WSSensorDescription(
        key=KEY_SENSOR_SPIKE,
        translation_key="sensor_spike",
        name="WS Sensor Spike Flags",
        icon="mdi:pulse",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: len(d.get(KEY_SENSOR_SPIKE) or []),
        attrs_fn=lambda d: {
            "flags": d.get(KEY_SENSOR_SPIKE) or [],
            "all_clear": len(d.get(KEY_SENSOR_SPIKE) or []) == 0,
        },
    ),
    # v2.0 — Overall data quality score (0-100)
    WSSensorDescription(
        key=KEY_DATA_QUALITY_SCORE,
        translation_key="data_quality_score",
        name="WS Data Quality Score",
        icon="mdi:star-check-outline",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {
            "quality_flags": len(d.get(KEY_SENSOR_QUALITY_FLAGS) or []),
            "stuck_flags": len(d.get(KEY_SENSOR_STUCK) or []),
            "spike_flags": len(d.get(KEY_SENSOR_SPIKE) or []),
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
        attrs_fn=lambda d: {"forecast": (d.get(KEY_FORECAST) or {}).get("daily", [])},
    ),
    WSSensorDescription(
        key=KEY_FORECAST_PROVIDER,
        translation_key="forecast_provider",
        name="WS Forecast Provider",
        icon="mdi:cloud-search",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {
            "provider_name": d.get("_forecast_provider_name"),
            "forecast_enabled": d.get("_forecast_provider_enabled"),
        },
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
        suggested_display_precision=1,
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
        entity_registry_enabled_default=False,
        translation_key="wet_bulb_temperature",
        name="WS Wet-Bulb Temperature",
        icon="mdi:thermometer-water",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
    ),
    # Frost point (below 0 C uses ice constants)
    WSSensorDescription(
        key=KEY_FROST_POINT_C,
        entity_registry_enabled_default=False,
        translation_key="frost_point",
        name="WS Frost Point",
        icon="mdi:snowflake-thermometer",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
    ),
    # v2.0 Cloud base altitude (LCL / Espy formula)
    WSSensorDescription(
        key=KEY_CLOUD_BASE_M,
        entity_registry_enabled_default=False,
        translation_key="cloud_base",
        name="WS Cloud Base",
        icon="mdi:cloud-arrow-up",
        native_unit="m",
        state_class=SensorStateClass.MEASUREMENT,
        unit_group="altitude",
        attrs_fn=lambda d: {
            "temp_c": d.get(KEY_NORM_TEMP_C),
            "dew_point_c": d.get(KEY_DEW_POINT_C),
            "spread_c": round(float(d[KEY_NORM_TEMP_C]) - float(d[KEY_DEW_POINT_C]), 1)
            if d.get(KEY_NORM_TEMP_C) is not None and d.get(KEY_DEW_POINT_C) is not None
            else None,
        },
    ),
    # v2.0 Freezing level altitude estimate
    WSSensorDescription(
        key=KEY_FREEZING_LEVEL_M,
        entity_registry_enabled_default=False,
        translation_key="freezing_level",
        name="WS Freezing Level",
        icon="mdi:snowflake",
        native_unit="m",
        state_class=SensorStateClass.MEASUREMENT,
        unit_group="altitude",
        attrs_fn=lambda d: {
            "temp_c": d.get(KEY_NORM_TEMP_C),
        },
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
        entity_registry_enabled_default=False,
        translation_key="vpd",
        name="WS Vapour Pressure Deficit",
        icon="mdi:water-percent-alert",
        native_unit="kPa",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # Absolute Humidity (g/m³)
    WSSensorDescription(
        key=KEY_ABSOLUTE_HUMIDITY,
        entity_registry_enabled_default=False,
        translation_key="absolute_humidity",
        name="WS Absolute Humidity",
        icon="mdi:water",
        native_unit="g/m³",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # Delta-T (dry-bulb minus wet-bulb)
    WSSensorDescription(
        key=KEY_DELTA_T,
        entity_registry_enabled_default=False,
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
        entity_registry_enabled_default=False,
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
        entity_registry_enabled_default=False,
        translation_key="thsw_index",
        name="WS THSW Index",
        icon="mdi:sun-thermometer",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # v2.0 — Air density (comfort indices group)
    WSSensorDescription(
        key=KEY_AIR_DENSITY,
        entity_registry_enabled_default=False,
        translation_key="air_density",
        name="WS Air Density",
        icon="mdi:air-humidifier",
        native_unit="kg/m³",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "temp_c": d.get(KEY_NORM_TEMP_C),
            "pressure_hpa": d.get(KEY_NORM_PRESSURE_HPA),
        },
    ),
    # v2.0 — Specific humidity (comfort indices group)
    WSSensorDescription(
        key=KEY_SPECIFIC_HUMIDITY,
        entity_registry_enabled_default=False,
        translation_key="specific_humidity",
        name="WS Specific Humidity",
        icon="mdi:water-percent",
        native_unit="g/kg",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "absolute_humidity_gm3": d.get(KEY_ABSOLUTE_HUMIDITY),
        },
    ),
    # v2.0 — WBGT (comfort indices group; uses outdoor formula when solar available)
    WSSensorDescription(
        key=KEY_WBGT,
        translation_key="wbgt",
        name="WS WBGT",
        icon="mdi:sun-thermometer-outline",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "heat_risk": (
                "extreme"
                if (d.get(KEY_WBGT) or 0) >= 32
                else "high"
                if (d.get(KEY_WBGT) or 0) >= 28
                else "moderate"
                if (d.get(KEY_WBGT) or 0) >= 25
                else "low"
            ),
            "wet_bulb_c": d.get(KEY_WET_BULB_C),
        },
    ),
    # v2.0 — UTCI (Universal Thermal Climate Index, Bröde 2012)
    WSSensorDescription(
        key=KEY_UTCI,
        translation_key="utci",
        name="WS UTCI",
        icon="mdi:human-handsup",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "stress_category": (
                "extreme_heat_stress"
                if (d.get(KEY_UTCI) or -99) >= 46
                else "very_strong_heat_stress"
                if (d.get(KEY_UTCI) or -99) >= 38
                else "strong_heat_stress"
                if (d.get(KEY_UTCI) or -99) >= 32
                else "moderate_heat_stress"
                if (d.get(KEY_UTCI) or -99) >= 26
                else "no_thermal_stress"
                if (d.get(KEY_UTCI) or -99) >= 9
                else "slight_cold_stress"
                if (d.get(KEY_UTCI) or -99) >= 0
                else "moderate_cold_stress"
                if (d.get(KEY_UTCI) or -99) >= -13
                else "strong_cold_stress"
                if (d.get(KEY_UTCI) or -99) >= -27
                else "very_strong_cold_stress"
                if (d.get(KEY_UTCI) or -99) >= -40
                else "extreme_cold_stress"
            ),
        },
    ),
    # =========================================================================
    # v1.5.0 AGROMETEOROLOGICAL / ACCUMULATION SENSORS
    # =========================================================================
    # Wind Run (daily km accumulator)
    WSSensorDescription(
        key=KEY_WIND_RUN_KM,
        entity_registry_enabled_default=False,
        translation_key="wind_run",
        name="WS Wind Run",
        icon="mdi:weather-windy",
        native_unit="km",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    # v2.0 Wind Run (monthly km accumulator)
    WSSensorDescription(
        key=KEY_WIND_RUN_MONTH_KM,
        translation_key="wind_run_month",
        name="WS Wind Run This Month",
        icon="mdi:weather-windy",
        native_unit="km",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    # Chill Hours Today
    WSSensorDescription(
        key=KEY_CHILL_HOURS_TODAY,
        entity_registry_enabled_default=False,
        translation_key="chill_hours_today",
        name="WS Chill Hours Today",
        icon="mdi:snowflake",
        native_unit="h",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    # Chill Hours Season
    WSSensorDescription(
        key=KEY_CHILL_HOURS_SEASON,
        entity_registry_enabled_default=False,
        translation_key="chill_hours_season",
        name="WS Chill Hours Season",
        icon="mdi:snowflake-variant",
        native_unit="h",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    # =========================================================================
    # v2.0 DEGREE DAYS + LEAF WETNESS (opt-in group)
    # =========================================================================
    WSSensorDescription(
        key=KEY_HDD_TODAY_MM,
        translation_key="hdd_today",
        name="WS Heating Degree Day",
        icon="mdi:thermometer-chevron-down",
        native_unit="°C·d",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {"base_c": 18.0},
    ),
    WSSensorDescription(
        key=KEY_HDD_SEASON,
        translation_key="hdd_season",
        name="WS Heating Degree Days Season",
        icon="mdi:thermometer-chevron-down",
        native_unit="°C·d",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    WSSensorDescription(
        key=KEY_CDD_TODAY_MM,
        translation_key="cdd_today",
        name="WS Cooling Degree Day",
        icon="mdi:thermometer-chevron-up",
        native_unit="°C·d",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_CDD_SEASON,
        translation_key="cdd_season",
        name="WS Cooling Degree Days Season",
        icon="mdi:thermometer-chevron-up",
        native_unit="°C·d",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    WSSensorDescription(
        key=KEY_GDD_TODAY_V2,
        translation_key="gdd_today",
        name="WS Growing Degree Day",
        icon="mdi:sprout",
        native_unit="°C·d",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {"base_c": 10.0, "cap_c": 30.0},
    ),
    WSSensorDescription(
        key=KEY_GDD_SEASON_V2,
        translation_key="gdd_season",
        name="WS Growing Degree Days Season",
        icon="mdi:sprout-outline",
        native_unit="°C·d",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    WSSensorDescription(
        key=KEY_LEAF_WETNESS,
        translation_key="leaf_wetness",
        name="WS Leaf Wetness",
        icon="mdi:leaf-maple",
        attrs_fn=lambda d: {
            "dew_point_c": d.get(KEY_DEW_POINT_C),
            "humidity_pct": d.get(KEY_NORM_HUMIDITY),
            "rain_rate_mmph": d.get(KEY_RAIN_RATE_FILT),
        },
    ),
    # =========================================================================
    # v1.5.0 SOLAR / CLOUD SENSORS
    # =========================================================================
    # Clearness Index (Kt) - requires solar radiation sensor
    WSSensorDescription(
        key=KEY_CLEARNESS_INDEX,
        entity_registry_enabled_default=False,
        translation_key="clearness_index",
        name="WS Clearness Index",
        icon="mdi:white-balance-sunny",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # Cloud Cover Percent - derived from clearness index
    WSSensorDescription(
        key=KEY_CLOUD_COVER_PCT,
        entity_registry_enabled_default=False,
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
    WSSensorDescription(
        key=KEY_FIRE_DANGER_VIGILANCE,
        translation_key="fire_danger_vigilance",
        name="WS Fire Danger (Vigilance)",
        icon="mdi:fire-alert",
        attrs_fn=lambda d: {
            "department": d.get("_vigilance_dept"),
            "all_phenomena": d.get("_vigilance_phenomena"),
            "fetched_at": d.get("_vigilance_fetched_at"),
        },
    ),
    # Vigicrues: sensors are created dynamically per station in async_setup_entry
    # (v1.9.0 multi-station). No static WSSensorDescription here.
    # v1.7.0 - Precipitation nowcast (Open-Meteo minutely_15)
    WSSensorDescription(
        key=KEY_RAIN_NEXT_60MIN,
        translation_key="rain_next_60min",
        name="WS Rain Next 60 min",
        icon="mdi:weather-pouring",
        native_unit="mm",
        state_class=SensorStateClass.MEASUREMENT,
        unit_group="rain",
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
    WSSensorDescription(
        key=KEY_NOWCAST_CONFIDENCE,
        translation_key="nowcast_confidence",
        name="WS Nowcast Confidence",
        icon="mdi:weather-partly-rainy",
        state_class=None,
        native_unit=None,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # =========================================================================
    # v2.0 - Lightning sensors (opt-in group, enable_lightning)
    # =========================================================================
    WSSensorDescription(
        key=KEY_LIGHTNING_COUNT_1H,
        translation_key="lightning_count_1h",
        name="WS Lightning Strikes (1h)",
        icon="mdi:lightning-bolt",
        native_unit="strikes",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "rate_per_min": d.get(KEY_LIGHTNING_RATE_1H),
        },
    ),
    WSSensorDescription(
        key=KEY_LIGHTNING_DISTANCE_KM,
        translation_key="lightning_distance",
        name="WS Lightning Distance",
        icon="mdi:lightning-bolt-circle",
        native_unit="km",
        state_class=SensorStateClass.MEASUREMENT,
        unit_group="distance",
        attrs_fn=lambda d: {
            "proximity": d.get(KEY_LIGHTNING_PROXIMITY),
        },
    ),
    WSSensorDescription(
        key=KEY_LIGHTNING_AZIMUTH,
        translation_key="lightning_azimuth",
        name="WS Lightning Azimuth",
        icon="mdi:compass",
        native_unit="°",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_LIGHTNING_RATE_1H,
        translation_key="lightning_rate",
        name="WS Lightning Rate",
        icon="mdi:lightning-bolt-outline",
        native_unit="strikes/min",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_LIGHTNING_CLEARANCE_MIN,
        translation_key="lightning_clearance",
        name="WS Lightning Clearance",
        icon="mdi:shield-check-outline",
        native_unit="min",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "safe": (d.get(KEY_LIGHTNING_CLEARANCE_MIN) or 0) >= 30,
        },
    ),
    WSSensorDescription(
        key=KEY_LIGHTNING_PROXIMITY,
        translation_key="lightning_proximity",
        name="WS Lightning Proximity",
        icon="mdi:lightning-bolt",
        attrs_fn=lambda d: {
            "distance_km": d.get(KEY_LIGHTNING_DISTANCE_KM),
            "clearance_min": d.get(KEY_LIGHTNING_CLEARANCE_MIN),
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
        entity_registry_enabled_default=False,
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
        suggested_display_precision=1,
        unit_group="rain",
    ),
    WSSensorDescription(
        key=KEY_RAIN_ACCUM_24H,
        translation_key="rain_last_24h",
        name="WS Rain Last 24h",
        icon="mdi:weather-pouring",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        unit_group="rain",
    ),
    WSSensorDescription(
        key=KEY_RAIN_TODAY_MM,
        name="WS Rain Today",
        translation_key="rain_today",
        icon="mdi:weather-rainy",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        unit_group="rain",
    ),
    # v2.0 — Weekly / monthly / yearly rain accumulators.
    # TOTAL_INCREASING: they accumulate within the period and reset to 0 at the
    # boundary — HA's statistics engine handles the reset as a new cycle (matches
    # wind_run / chill_hours_season), whereas MEASUREMENT would compute a
    # meaningless mean/min/max over a running total.
    WSSensorDescription(
        key=KEY_RAIN_THIS_WEEK_MM,
        translation_key="rain_this_week",
        name="WS Rain This Week",
        icon="mdi:calendar-week",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=1,
        unit_group="rain",
    ),
    WSSensorDescription(
        key=KEY_RAIN_THIS_MONTH_MM,
        translation_key="rain_this_month",
        name="WS Rain This Month",
        icon="mdi:calendar-month",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=1,
        unit_group="rain",
    ),
    WSSensorDescription(
        key=KEY_RAIN_THIS_YEAR_MM,
        translation_key="rain_this_year",
        name="WS Rain This Year",
        icon="mdi:calendar",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit=UNIT_RAIN_MM,
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=1,
        unit_group="rain",
    ),
    # v2.0 — Max rain rate in rolling 24h window
    WSSensorDescription(
        key=KEY_RAIN_RATE_MAX_24H,
        translation_key="rain_rate_max_24h",
        name="WS Rain Rate Max 24h",
        icon="mdi:weather-pouring",
        device_class=SensorDeviceClass.PRECIPITATION_INTENSITY,
        native_unit="mm/h",
        state_class=SensorStateClass.MEASUREMENT,
        unit_group="rain_rate",
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
        value_fn=lambda d: len(d.get(KEY_FORECAST_TILES) or []),
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
        suggested_display_precision=1,
    ),
    WSSensorDescription(
        key=KEY_TEMP_LOW_24H,
        translation_key="temperature_low_24h",
        name="WS Temperature Low 24h",
        icon="mdi:thermometer-low",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
    ),
    WSSensorDescription(
        key=KEY_TEMP_AVG_24H,
        translation_key="temperature_average_24h",
        name="WS Temperature Average 24h",
        icon="mdi:thermometer",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
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
        unit_group="wind",
    ),
    # v2.0 Wind gust factor (gust / mean speed ratio)
    WSSensorDescription(
        key=KEY_WIND_GUST_FACTOR,
        entity_registry_enabled_default=False,
        translation_key="wind_gust_factor",
        name="WS Wind Gust Factor",
        icon="mdi:weather-windy",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "gust_ms": d.get(KEY_NORM_WIND_GUST_MS),
            "wind_ms": d.get(KEY_NORM_WIND_SPEED_MS),
        },
    ),
    # v2.0 Dominant wind direction (circular mean over 24h).
    # MEASUREMENT_ANGLE (matches the live wind_direction sensor) so HA computes a
    # circular mean for statistics — plain MEASUREMENT would average 350°+10° as
    # 180° instead of 0°.
    WSSensorDescription(
        key=KEY_DOMINANT_WIND_DIR,
        entity_registry_enabled_default=False,
        translation_key="dominant_wind_direction",
        name="WS Dominant Wind Direction",
        icon="mdi:compass-rose",
        device_class=SensorDeviceClass.WIND_DIRECTION,
        native_unit="°",
        state_class=SensorStateClass.MEASUREMENT_ANGLE,
        attrs_fn=lambda d: {
            "variability_deg": d.get(KEY_WIND_DIR_VARIABILITY),
        },
    ),
    # v2.0 Wind direction variability (circular std dev over 24h)
    WSSensorDescription(
        key=KEY_WIND_DIR_VARIABILITY,
        entity_registry_enabled_default=False,
        translation_key="wind_direction_variability",
        name="WS Wind Direction Variability",
        icon="mdi:compass-outline",
        native_unit="°",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
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
    # v2.0 — McArthur FFDI (Australian fire danger index)
    WSSensorDescription(
        key=KEY_FFDI,
        translation_key="ffdi",
        name="WS Forest Fire Danger Index",
        icon="mdi:fire-alert",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "danger_level": d.get("_ffdi_danger"),
            "temperature_c": d.get(KEY_NORM_TEMP_C),
            "humidity_pct": d.get(KEY_NORM_HUMIDITY),
            "wind_kmh": round(float(d[KEY_NORM_WIND_SPEED_MS]) * 3.6, 1)
            if d.get(KEY_NORM_WIND_SPEED_MS) is not None
            else None,
        },
    ),
    # v2.0 — Fosberg FFWI (US/global fire weather index)
    WSSensorDescription(
        key=KEY_FFWI,
        translation_key="ffwi",
        name="WS Fire Weather Index (Fosberg)",
        icon="mdi:fire-circle",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "temperature_c": d.get(KEY_NORM_TEMP_C),
            "humidity_pct": d.get(KEY_NORM_HUMIDITY),
            "wind_ms": d.get(KEY_NORM_WIND_SPEED_MS),
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
        unit_group="rain",
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
        unit_group="rain",
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
    # v2.0 additional upload status sensors
    WSSensorDescription(
        key=KEY_WC_STATUS,
        translation_key="wc_upload_status",
        name="WS Weathercloud Status",
        icon="mdi:cloud-upload",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {"last_upload": d.get("_wc_last_upload")},
    ),
    WSSensorDescription(
        key=KEY_PWS_STATUS,
        translation_key="pws_upload_status",
        name="WS PWSWeather Status",
        icon="mdi:cloud-upload-outline",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {"last_upload": d.get("_pws_last_upload")},
    ),
    WSSensorDescription(
        key=KEY_WOW_STATUS,
        translation_key="wow_upload_status",
        name="WS WOW Status",
        icon="mdi:cloud-upload",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {"last_upload": d.get("_wow_last_upload")},
    ),
    WSSensorDescription(
        key=KEY_AWEKAS_STATUS,
        translation_key="awekas_upload_status",
        name="WS AWEKAS Status",
        icon="mdi:cloud-upload-outline",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {"last_upload": d.get("_awekas_last_upload")},
    ),
    WSSensorDescription(
        key=KEY_CWOP_STATUS_V2,
        translation_key="cwop_status",
        name="WS CWOP Status",
        icon="mdi:radio-tower",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {"last_upload": d.get("_cwop_last_upload")},
    ),
    WSSensorDescription(
        key=KEY_OWM_STATIONS_STATUS,
        translation_key="owm_stations_status",
        name="WS OpenWeatherMap Status",
        icon="mdi:cloud-upload",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {"last_upload": d.get("_owm_stations_last_upload")},
    ),
    WSSensorDescription(
        key=KEY_WINDY_STATUS,
        translation_key="windy_status",
        name="WS Windy Status",
        icon="mdi:cloud-upload-outline",
        entity_category=EntityCategory.DIAGNOSTIC,
        attrs_fn=lambda d: {"last_upload": d.get("_windy_last_upload")},
    ),
    # =========================================================================
    # v2.0 - Indoor sensor group (opt-in)
    # =========================================================================
    WSSensorDescription(
        key=KEY_INDOOR_TEMP_C,
        translation_key="indoor_temperature",
        name="WS Indoor Temperature",
        icon="mdi:home-thermometer",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "outdoor_temp_c": d.get(KEY_NORM_TEMP_C),
            "delta_c": d.get(KEY_INDOOR_TEMP_DELTA),
        },
    ),
    WSSensorDescription(
        key=KEY_INDOOR_HUMIDITY,
        translation_key="indoor_humidity",
        name="WS Indoor Humidity",
        icon="mdi:home-humidity",
        device_class=SensorDeviceClass.HUMIDITY,
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "outdoor_humidity_pct": d.get(KEY_NORM_HUMIDITY),
            "delta_pct": d.get(KEY_INDOOR_HUMIDITY_DELTA),
        },
    ),
    WSSensorDescription(
        key=KEY_INDOOR_CO2_PPM,
        translation_key="indoor_co2",
        name="WS Indoor CO₂",
        icon="mdi:molecule-co2",
        device_class=SensorDeviceClass.CO2,
        native_unit="ppm",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_INDOOR_TEMP_DELTA,
        translation_key="indoor_temp_delta",
        name="WS Indoor/Outdoor Temp Delta",
        icon="mdi:thermometer-lines",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_INDOOR_HUMIDITY_DELTA,
        translation_key="indoor_humidity_delta",
        name="WS Indoor/Outdoor Humidity Delta",
        icon="mdi:water-percent-alert",
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_INDOOR_COMFORT,
        translation_key="indoor_comfort",
        name="WS Indoor Comfort Score",
        icon="mdi:home-heart",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "co2_ppm": d.get(KEY_INDOOR_CO2_PPM),
            "temp_c": d.get(KEY_INDOOR_TEMP_C),
            "humidity_pct": d.get(KEY_INDOOR_HUMIDITY),
        },
    ),
    # =========================================================================
    # v2.1 - Soil sensor group (opt-in)
    # =========================================================================
    WSSensorDescription(
        key=KEY_SOIL_MOISTURE,
        translation_key="soil_moisture",
        name="WS Soil Moisture",
        icon="mdi:water-percent",
        device_class=SensorDeviceClass.MOISTURE,
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {
            "deficit_pct": d.get(KEY_SOIL_MOISTURE_DEFICIT),
        },
    ),
    WSSensorDescription(
        key=KEY_SOIL_TEMP_C,
        translation_key="soil_temperature",
        name="WS Soil Temperature",
        icon="mdi:thermometer",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_SOIL_MOISTURE_DEFICIT,
        translation_key="soil_moisture_deficit",
        name="WS Soil Moisture Deficit",
        icon="mdi:water-minus",
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    WSSensorDescription(
        key=KEY_IRRIGATION_NEED,
        translation_key="irrigation_need",
        name="WS Irrigation Need",
        icon="mdi:sprinkler",
        device_class=SensorDeviceClass.ENUM,
        options=["none", "low", "moderate", "high", "critical"],
        native_unit=None,
        state_class=None,
        attrs_fn=lambda d: {
            "score": d.get(KEY_IRRIGATION_NEED_SCORE),
            "soil_moisture_pct": d.get(KEY_SOIL_MOISTURE),
            "soil_moisture_deficit_pct": d.get(KEY_SOIL_MOISTURE_DEFICIT),
        },
    ),
    WSSensorDescription(
        key=KEY_IRRIGATION_NEED_SCORE,
        translation_key="irrigation_need_score",
        name="WS Irrigation Need Score",
        icon="mdi:sprinkler-variant",
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
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
        entity_registry_enabled_default=False,
        name="WS NO2",
        translation_key="no2",
        icon="mdi:molecule",
        native_unit="µg/m³",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_OZONE,
        entity_registry_enabled_default=False,
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
        device_class=SensorDeviceClass.ENUM,
        options=[
            "new_moon",
            "waxing_crescent",
            "first_quarter",
            "waxing_gibbous",
            "full_moon",
            "waning_gibbous",
            "last_quarter",
            "waning_crescent",
        ],
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
        entity_registry_enabled_default=False,
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
        unit_group="rain",
        attrs_fn=lambda d: {
            "hargreaves_et0": d.get(KEY_ET0_DAILY_MM),
        },
    ),
    # v2.0 — Irrigation water deficit (ET₀ − rain today)
    WSSensorDescription(
        key=KEY_IRRIGATION_DEFICIT,
        entity_registry_enabled_default=False,
        translation_key="irrigation_deficit",
        name="WS Irrigation Deficit",
        icon="mdi:water-sync",
        device_class=SensorDeviceClass.PRECIPITATION,
        native_unit="mm",
        state_class=SensorStateClass.MEASUREMENT,
        unit_group="rain",
        attrs_fn=lambda d: {
            "et0_daily_mm": d.get(KEY_ET0_DAILY_MM),
            "rain_today_mm": d.get("_rain_today_mm"),
        },
    ),
    # v2.0 — Max theoretical solar radiation (clear-sky model)
    WSSensorDescription(
        key=KEY_MAX_SOLAR_RADIATION,
        translation_key="max_solar_radiation",
        name="WS Max Solar Radiation",
        icon="mdi:sun-wireless",
        native_unit="W/m²",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    # v2.0 — Daily solar energy accumulation (Wh/m²) — when solar radiation sensor mapped.
    # NOTE: Wh/m² is solar irradiation density, NOT an HA ENERGY-class unit
    # (Wh/kWh), so no device_class is set — otherwise HA rejects the unit.
    WSSensorDescription(
        key=KEY_SOLAR_ENERGY_TODAY_WHM2,
        translation_key="solar_energy_today",
        name="WS Solar Energy Today",
        icon="mdi:solar-power",
        native_unit="Wh/m²",
        state_class=SensorStateClass.TOTAL_INCREASING,
        attrs_fn=lambda d: {
            "peak_sun_hours": d.get(KEY_PEAK_SUN_HOURS),
        },
    ),
    # v2.0 — Peak sun hours (Wh/m² / 1000)
    WSSensorDescription(
        key=KEY_PEAK_SUN_HOURS,
        translation_key="peak_sun_hours",
        name="WS Peak Sun Hours",
        icon="mdi:weather-sunny",
        native_unit="h",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # v2.0 — Net radiation (FAO-56), requires solar radiation sensor
    WSSensorDescription(
        key=KEY_NET_RADIATION,
        entity_registry_enabled_default=False,
        translation_key="net_radiation",
        name="WS Net Radiation",
        icon="mdi:sun-thermometer",
        native_unit="W/m²",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # =========================================================================
    # v1.2.0 - NEW METEOROLOGICAL SENSORS
    # =========================================================================
    # B1 Fog probability
    WSSensorDescription(
        key=KEY_FOG_PROBABILITY,
        entity_registry_enabled_default=False,
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
        entity_registry_enabled_default=False,
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
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {"last_rain_date": d.get("_dry_streak_last_rain")},
    ),
    WSSensorDescription(
        key=KEY_HEAT_STREAK,
        translation_key="heat_streak",
        name="WS Heat Streak",
        icon="mdi:thermometer-high",
        native_unit=None,
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {"threshold_c": d.get("_heat_streak_threshold_c")},
    ),
    WSSensorDescription(
        key=KEY_FROST_STREAK,
        translation_key="frost_streak",
        name="WS Frost Streak",
        icon="mdi:snowflake",
        native_unit=None,
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
        entity_category=EntityCategory.DIAGNOSTIC,
        translation_key="climatology_30d",
        name="WS Climatology (30-day)",
        icon="mdi:calendar-month",
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
    # 90-day seasonal anomaly sensors
    WSSensorDescription(
        key=KEY_TEMP_ANOMALY_90D,
        translation_key="temp_anomaly_90d",
        name="WS Temperature Anomaly (90d)",
        icon="mdi:thermometer-alert",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit=UNIT_TEMP_C,
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    WSSensorDescription(
        key=KEY_RAIN_ANOMALY_90D,
        translation_key="rain_anomaly_90d",
        name="WS Rain Anomaly (90d)",
        icon="mdi:weather-rainy",
        native_unit="mm/d",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # =========================================================================
    # v1.2.0 - SELF-LEARNING SENSORS (METAR-gated + always-on)
    # =========================================================================
    # A4 Solar lux factor (always on)
    WSSensorDescription(
        key=KEY_SOLAR_LUX_FACTOR,
        entity_category=EntityCategory.DIAGNOSTIC,
        translation_key="solar_lux_factor",
        name="WS Solar Lux Factor",
        icon="mdi:sun-wireless",
        native_unit="lx/(W/m²)",
        state_class=SensorStateClass.MEASUREMENT,
        attrs_fn=lambda d: {"calibration_days": d.get("_solar_lux_factor_n_days", 0)},
    ),
    # Forecast agreement: Zambretti vs Open-Meteo
    WSSensorDescription(
        key=KEY_FORECAST_AGREEMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
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
    # A3a Individual Brier score — local rain probability model
    # Lower Brier score = better calibration (0 = perfect, 0.25 = naive)
    WSSensorDescription(
        key=KEY_FORECAST_BRIER_LOCAL,
        translation_key="forecast_brier_local",
        name="WS Forecast Brier Score (Local)",
        icon="mdi:chart-scatter-plot",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # A3b Individual Brier score — API (Open-Meteo) model
    WSSensorDescription(
        key=KEY_FORECAST_BRIER_API,
        translation_key="forecast_brier_api",
        name="WS Forecast Brier Score (API)",
        icon="mdi:chart-scatter-plot-hexbin",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # A3c Blend weight allocated to the local model (0–100%)
    WSSensorDescription(
        key=KEY_FORECAST_BLEND_WEIGHT_LOCAL,
        translation_key="forecast_blend_weight_local",
        name="WS Forecast Blend Weight (Local)",
        icon="mdi:scale-balance",
        native_unit="%",
        state_class=SensorStateClass.MEASUREMENT,
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    # Current conditions text summary (always-on, voice/Lovelace)
    WSSensorDescription(
        key=KEY_CONDITIONS_SUMMARY,
        translation_key="conditions_summary",
        name="WS Current Conditions",
        icon="mdi:weather-partly-cloudy",
        attrs_fn=lambda d: {
            "temperature_c": d.get("norm_temperature_c"),
            "feels_like_c": d.get("feels_like_c"),
            "rain_rate_mmph": d.get("rain_rate_mmph_filtered"),
            "wind_speed_ms": d.get("norm_wind_speed_ms"),
            "wind_direction": d.get("wind_quadrant"),
            "condition": d.get("current_condition"),
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
    # v2.0 - comfort indices additions
    KEY_AIR_DENSITY: CONF_ENABLE_COMFORT_INDICES,
    KEY_SPECIFIC_HUMIDITY: CONF_ENABLE_COMFORT_INDICES,
    KEY_WBGT: CONF_ENABLE_COMFORT_INDICES,
    KEY_UTCI: CONF_ENABLE_COMFORT_INDICES,
    # v2.0 - fire danger additions (gated by fire risk toggle)
    KEY_FFDI: CONF_ENABLE_FIRE_RISK,
    KEY_FFWI: CONF_ENABLE_FIRE_RISK,
    # v2.0 - lightning sensors
    KEY_LIGHTNING_COUNT_1H: CONF_ENABLE_LIGHTNING,
    KEY_LIGHTNING_DISTANCE_KM: CONF_ENABLE_LIGHTNING,
    KEY_LIGHTNING_AZIMUTH: CONF_ENABLE_LIGHTNING,
    KEY_LIGHTNING_RATE_1H: CONF_ENABLE_LIGHTNING,
    KEY_LIGHTNING_CLEARANCE_MIN: CONF_ENABLE_LIGHTNING,
    KEY_LIGHTNING_PROXIMITY: CONF_ENABLE_LIGHTNING,
    # v2.0 - upload status sensors
    KEY_WU_STATUS: CONF_ENABLE_WUNDERGROUND,
    KEY_WC_STATUS: CONF_ENABLE_WEATHERCLOUD,
    KEY_PWS_STATUS: CONF_ENABLE_PWSWEATHER,
    KEY_WOW_STATUS: CONF_ENABLE_WOW,
    KEY_AWEKAS_STATUS: CONF_ENABLE_AWEKAS,
    KEY_CWOP_STATUS_V2: CONF_ENABLE_CWOP,
    KEY_OWM_STATIONS_STATUS: CONF_ENABLE_OWM_STATIONS,
    KEY_WINDY_STATUS: CONF_ENABLE_WINDY,
    # v2.0 - indoor sensor group
    KEY_INDOOR_TEMP_C: CONF_ENABLE_INDOOR,
    KEY_INDOOR_HUMIDITY: CONF_ENABLE_INDOOR,
    KEY_INDOOR_CO2_PPM: CONF_ENABLE_INDOOR,
    KEY_INDOOR_TEMP_DELTA: CONF_ENABLE_INDOOR,
    KEY_INDOOR_HUMIDITY_DELTA: CONF_ENABLE_INDOOR,
    KEY_INDOOR_COMFORT: CONF_ENABLE_INDOOR,
    # v2.1 - soil sensor group
    KEY_SOIL_MOISTURE: CONF_ENABLE_SOIL,
    KEY_SOIL_TEMP_C: CONF_ENABLE_SOIL,
    KEY_SOIL_MOISTURE_DEFICIT: CONF_ENABLE_SOIL,
    KEY_IRRIGATION_NEED: CONF_ENABLE_SOIL,
    KEY_IRRIGATION_NEED_SCORE: CONF_ENABLE_SOIL,
    # v2.0 - data quality expansion (diagnostics group)
    KEY_SENSOR_STUCK: CONF_ENABLE_DIAGNOSTICS,
    KEY_DATA_QUALITY_SCORE: CONF_ENABLE_DIAGNOSTICS,
    KEY_NEIGHBOR_QC: CONF_ENABLE_DIAGNOSTICS,
    KEY_SENSOR_SPIKE: CONF_ENABLE_DIAGNOSTICS,
    # v2.0 - degree days + leaf wetness (new opt-in group)
    KEY_HDD_TODAY_MM: CONF_ENABLE_DEGREE_DAYS,
    KEY_HDD_SEASON: CONF_ENABLE_DEGREE_DAYS,
    KEY_CDD_TODAY_MM: CONF_ENABLE_DEGREE_DAYS,
    KEY_CDD_SEASON: CONF_ENABLE_DEGREE_DAYS,
    KEY_GDD_TODAY_V2: CONF_ENABLE_DEGREE_DAYS,
    KEY_GDD_SEASON_V2: CONF_ENABLE_DEGREE_DAYS,
    KEY_LEAF_WETNESS: CONF_ENABLE_DEGREE_DAYS,
    # v2.0 - solar energy (comfort indices group, needs solar radiation sensor)
    KEY_SOLAR_ENERGY_TODAY_WHM2: CONF_ENABLE_COMFORT_INDICES,
    KEY_MAX_SOLAR_RADIATION: CONF_ENABLE_COMFORT_INDICES,
    KEY_PEAK_SUN_HOURS: CONF_ENABLE_COMFORT_INDICES,
    KEY_IRRIGATION_DEFICIT: CONF_ENABLE_COMFORT_INDICES,
    KEY_NET_RADIATION: CONF_ENABLE_COMFORT_INDICES,
    KEY_WIND_RUN_MONTH_KM: CONF_ENABLE_COMFORT_INDICES,
    # v1.6.0 French regional
    KEY_VIGILANCE_MAX_LEVEL: CONF_ENABLE_VIGILANCE_METEO,
    KEY_FIRE_DANGER_VIGILANCE: CONF_ENABLE_VIGILANCE_METEO,
    # KEY_RIVER_LEVEL_M: handled dynamically in async_setup_entry (multi-station)
    # v1.6.2 - station diagnostics (opt-in)
    KEY_SENSOR_DRIFT_FLAGS: CONF_ENABLE_DIAGNOSTICS,
    KEY_CONSISTENCY_FLAGS: CONF_ENABLE_DIAGNOSTICS,
    KEY_SENSOR_QUALITY_FLAGS: CONF_ENABLE_DIAGNOSTICS,
    KEY_FORECAST_SKILL: CONF_ENABLE_DIAGNOSTICS,
    KEY_FORECAST_BRIER_LOCAL: CONF_ENABLE_DIAGNOSTICS,
    KEY_FORECAST_BRIER_API: CONF_ENABLE_DIAGNOSTICS,
    KEY_FORECAST_BLEND_WEIGHT_LOCAL: CONF_ENABLE_DIAGNOSTICS,
    KEY_FORECAST_AGREEMENT: CONF_ENABLE_DIAGNOSTICS,
    KEY_SOLAR_LUX_FACTOR: CONF_ENABLE_DIAGNOSTICS,
    KEY_CLIMATOLOGY_30D: CONF_ENABLE_DIAGNOSTICS,
    KEY_TEMP_ANOMALY_90D: CONF_ENABLE_DIAGNOSTICS,
    KEY_RAIN_ANOMALY_90D: CONF_ENABLE_DIAGNOSTICS,
    # v1.6.2 - advanced / derived representations (opt-in)
    KEY_ZAMBRETTI_NUMBER: CONF_ENABLE_ADVANCED_SENSORS,
    KEY_ET0_HOURLY_MM: CONF_ENABLE_ADVANCED_SENSORS,
    KEY_WIND_DIR_SMOOTH_DEG: CONF_ENABLE_ADVANCED_SENSORS,
    # v1.7.0 - precipitation nowcast (opt-in)
    KEY_RAIN_NEXT_60MIN: CONF_ENABLE_NOWCAST,
    KEY_MINUTES_UNTIL_RAIN: CONF_ENABLE_NOWCAST,
    KEY_MINUTES_UNTIL_DRY: CONF_ENABLE_NOWCAST,
    KEY_NOWCAST_INTENSITY: CONF_ENABLE_NOWCAST,
    KEY_NOWCAST_CONFIDENCE: CONF_ENABLE_NOWCAST,
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

    entities: list[SensorEntity] = [WSSensor(coordinator, entry, desc, prefix) for desc in filtered]

    # v2.0.5: dynamic per-room indoor temperature delta sensors
    if opts.get(CONF_ENABLE_INDOOR, False):
        room_temps: list[str] = list(opts.get(CONF_INDOOR_ROOMS) or [])
        for eid in room_temps:
            slug = eid.split(".", 1)[-1] if "." in eid else eid
            state = hass.states.get(eid)
            friendly = (state.attributes.get("friendly_name") if state else None) or slug.replace("_", " ").title()
            desc = WSSensorDescription(
                key=f"indoor_room_delta_{slug}",
                name=f"Temp Delta - {friendly}",
                icon="mdi:thermometer-lines",
                device_class=SensorDeviceClass.TEMPERATURE,
                native_unit=UNIT_TEMP_C,
                state_class=SensorStateClass.MEASUREMENT,
                entity_category=EntityCategory.DIAGNOSTIC,
                value_fn=lambda d, _eid=eid: (d.get(KEY_INDOOR_ROOMS_DATA) or {}).get(_eid, {}).get("delta_c"),
                attrs_fn=lambda d, _eid=eid: {
                    "indoor_temp_c": (d.get(KEY_INDOOR_ROOMS_DATA) or {}).get(_eid, {}).get("temp_c"),
                    "source_entity": _eid,
                },
            )
            entities.append(WSSensor(coordinator, entry, desc, prefix))

    # v1.9.0: dynamic Vigicrues river sensors — one per configured station
    if opts.get(CONF_ENABLE_VIGICRUES, False):
        stations: list[dict] = list(opts.get(CONF_VIGICRUES_STATIONS) or [])
        if not stations:
            # Migrate legacy single-station config
            code = (opts.get(CONF_VIGICRUES_STATION_CODE) or "").strip()
            if code:
                stations = [
                    {
                        "code": code,
                        "name": opts.get(CONF_VIGICRUES_STATION_NAME) or code,
                        "river": opts.get(CONF_VIGICRUES_RIVER_NAME) or "",
                    }
                ]
            else:
                # Auto-detect — use a placeholder; the coordinator will fill the name
                stations = [{"code": "", "name": "", "river": ""}]
        for st in stations:
            entities.append(WSRiverSensor(coordinator, entry, prefix, st))
            entities.append(WSRiverFlowSensor(coordinator, entry, prefix, st))

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
        # v2.0 accumulators
        KEY_RAIN_THIS_WEEK_MM,
        KEY_RAIN_THIS_MONTH_MM,
        KEY_RAIN_THIS_YEAR_MM,
        KEY_RAIN_RATE_MAX_24H,
        KEY_SOLAR_ENERGY_TODAY_WHM2,
        KEY_PEAK_SUN_HOURS,
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
        self._unit_group = desc.unit_group
        if desc.unit_group:
            self._attr_native_unit_of_measurement = {
                "wind": coordinator.wind_unit,
                "pressure": coordinator.pressure_unit,
                "rain": coordinator.rain_unit,
                "rain_rate": coordinator.rain_rate_unit,
                "distance": coordinator.distance_unit,
                "altitude": coordinator.altitude_unit,
            }.get(desc.unit_group, desc.native_unit)
        else:
            self._attr_native_unit_of_measurement = desc.native_unit
        self._attr_state_class = desc.state_class
        if desc.suggested_display_precision is not None:
            self._attr_suggested_display_precision = desc.suggested_display_precision
        if desc.entity_category is not None:
            self._attr_entity_category = desc.entity_category
        if desc.options is not None:
            self._attr_options = desc.options

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
                # If the unit changed (e.g. user switched from mm to in), the
                # stored state value is in the old unit. Discard it to avoid
                # showing a stale value in the wrong unit until the coordinator
                # provides the first real reading.
                last_unit = last_state.attributes.get("unit_of_measurement")
                if self._unit_group and last_unit and last_unit != self._attr_native_unit_of_measurement:
                    self._restored_value = None
                else:
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
            KEY_TEMP_ANOMALY_90D: "temp_anomaly_90d",
            KEY_RAIN_ANOMALY_90D: "rain_anomaly_90d",
            KEY_FORECAST_AGREEMENT: "forecast_agreement",
            KEY_FORECAST_SKILL: "forecast_skill",
            KEY_FORECAST_BRIER_LOCAL: "forecast_brier_local",
            KEY_FORECAST_BRIER_API: "forecast_brier_api",
            KEY_FORECAST_BLEND_WEIGHT_LOCAL: "forecast_blend_weight_local",
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
            # river_level slugs are handled in WSRiverSensor directly
            KEY_RAIN_NEXT_60MIN: "rain_next_60min",
            KEY_MINUTES_UNTIL_RAIN: "minutes_until_rain",
            KEY_MINUTES_UNTIL_DRY: "minutes_until_dry",
            KEY_NOWCAST_INTENSITY: "nowcast_intensity",
            # v2.0
            KEY_CLOUD_BASE_M: "cloud_base",
            KEY_FREEZING_LEVEL_M: "freezing_level",
            KEY_WIND_GUST_FACTOR: "wind_gust_factor",
            KEY_AIR_DENSITY: "air_density",
            KEY_SPECIFIC_HUMIDITY: "specific_humidity",
            KEY_WBGT: "wbgt",
            KEY_RAIN_THIS_WEEK_MM: "rain_this_week",
            KEY_RAIN_THIS_MONTH_MM: "rain_this_month",
            KEY_RAIN_THIS_YEAR_MM: "rain_this_year",
            KEY_RAIN_RATE_MAX_24H: "rain_rate_max_24h",
            KEY_HDD_TODAY_MM: "hdd_today",
            KEY_HDD_SEASON: "hdd_season",
            KEY_CDD_TODAY_MM: "cdd_today",
            KEY_CDD_SEASON: "cdd_season",
            KEY_GDD_TODAY_V2: "gdd_today",
            KEY_GDD_SEASON_V2: "gdd_season",
            KEY_LEAF_WETNESS: "leaf_wetness",
            # v2.0 batch 3
            KEY_DOMINANT_WIND_DIR: "dominant_wind_direction",
            KEY_WIND_DIR_VARIABILITY: "wind_direction_variability",
            KEY_SOLAR_ENERGY_TODAY_WHM2: "solar_energy_today",
            KEY_MAX_SOLAR_RADIATION: "max_solar_radiation",
            KEY_PEAK_SUN_HOURS: "peak_sun_hours",
            KEY_IRRIGATION_DEFICIT: "irrigation_deficit",
            # v2.0 batch 4
            KEY_FFDI: "ffdi",
            KEY_FFWI: "ffwi",
            KEY_UTCI: "utci",
            # v2.0 batch 5 (lightning)
            KEY_LIGHTNING_COUNT_1H: "lightning_count_1h",
            KEY_LIGHTNING_DISTANCE_KM: "lightning_distance",
            KEY_LIGHTNING_RATE_1H: "lightning_rate",
            KEY_LIGHTNING_CLEARANCE_MIN: "lightning_clearance",
            KEY_LIGHTNING_PROXIMITY: "lightning_proximity",
            # v2.0 upload targets
            KEY_WC_STATUS: "wc_upload_status",
            KEY_PWS_STATUS: "pws_upload_status",
            KEY_WOW_STATUS: "wow_upload_status",
            KEY_AWEKAS_STATUS: "awekas_upload_status",
            KEY_CWOP_STATUS_V2: "cwop_upload_status",
            KEY_OWM_STATIONS_STATUS: "owm_stations_upload_status",
            KEY_WINDY_STATUS: "windy_upload_status",
            # v2.0 indoor sensors
            KEY_INDOOR_TEMP_C: "indoor_temperature",
            KEY_INDOOR_HUMIDITY: "indoor_humidity",
            KEY_INDOOR_CO2_PPM: "indoor_co2",
            KEY_INDOOR_TEMP_DELTA: "indoor_temp_delta",
            KEY_INDOOR_HUMIDITY_DELTA: "indoor_humidity_delta",
            KEY_INDOOR_COMFORT: "indoor_comfort",
            # v2.0 data quality
            KEY_SENSOR_STUCK: "sensor_stuck",
            KEY_DATA_QUALITY_SCORE: "data_quality_score",
            KEY_NEIGHBOR_QC: "neighbor_qc",
            KEY_SENSOR_SPIKE: "sensor_spike",
            # v2.0 finishing items
            KEY_WIND_RUN_MONTH_KM: "wind_run_month",
            KEY_NET_RADIATION: "net_radiation",
            KEY_RAIN_TODAY_MM: "rain_today_mm",
            KEY_CONDITIONS_SUMMARY: "conditions_summary",
        }
        if key in overrides:
            return overrides[key]
        # Fallback: strip common prefixes/suffixes for a clean slug
        return key.replace("_mmph", "").replace("_ms", "").replace("_hpa", "").replace("_c", "")

    def _apply_unit_conversion(self, val: float) -> float:
        unit = self._attr_native_unit_of_measurement
        group = self._unit_group
        if group == "wind":
            return val * _WIND_FACTORS.get(unit, 1.0)
        if group == "pressure":
            return val * _PRESSURE_FACTORS.get(unit, 1.0)
        if group == "rain":
            return val / 25.4 if unit == "in" else val
        if group == "rain_rate":
            return val / 25.4 if unit == "in/h" else val
        if group == "distance":
            return val * _DISTANCE_FACTORS.get(unit, 1.0)
        if group == "altitude":
            return val * _ALTITUDE_FACTORS.get(unit, 1.0)
        return val

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

        if self._unit_group and val is not None:
            with contextlib.suppress(TypeError, ValueError):
                val = self._apply_unit_conversion(float(val))

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


# ---------------------------------------------------------------------------
# v1.9.0 - Dynamic river-level sensor (one per Vigicrues station)
# ---------------------------------------------------------------------------


_RIVER_SLUG_MAP = str.maketrans("éèêëàâäôöùûüîïç", "eeeeaaaoouuuiic")


def _river_slug(name: str) -> str:
    """Return a safe ASCII slug from a river or station name for use in entity IDs."""
    slug = name.lower().translate(_RIVER_SLUG_MAP).replace(" ", "_").replace("-", "_").replace("'", "")
    return "".join(c for c in slug if c.isalnum() or c == "_").strip("_")


class WSRiverSensor(CoordinatorEntity, SensorEntity):
    """Real-time water level for a single Vigicrues hydrometric station.

    One entity is created per configured station.  The station code is used as
    part of the unique_id; the river name (once known) is embedded in the entity
    name so users can tell stations apart at a glance.
    """

    _attr_has_entity_name = True
    _attr_icon = "mdi:waves"
    _attr_native_unit_of_measurement = "m"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_device_class = None

    def __init__(
        self,
        coordinator,
        entry: ConfigEntry,
        prefix: str,
        station: dict,
    ) -> None:
        super().__init__(coordinator)
        self._entry = entry
        self._prefix = prefix
        # station dict: {code, name, river} — code may be "" for auto-detect
        self._station_code: str = (station.get("code") or "").strip()
        self._station_name: str = station.get("name") or self._station_code
        self._river_name: str = station.get("river") or ""

        # Unique ID uses station code; fall back to "auto" for auto-detect mode
        uid_suffix = self._station_code if self._station_code else "auto"
        self._attr_unique_id = f"{entry.entry_id}_river_level_{uid_suffix}"
        name_slug = _river_slug(self._river_name or self._station_name)
        slug = (
            f"river_level_{name_slug}"
            if name_slug
            else (f"river_level_{uid_suffix}" if uid_suffix != "auto" else "river_level")
        )
        self._attr_suggested_object_id = f"{prefix}_{slug}"

    @property
    def _cache_key(self) -> str:
        """Coordinator data key prefix for this station."""
        code = self._station_code
        if not code:
            # Auto-detect: use whatever code the coordinator resolved
            code = (self.coordinator.data or {}).get("_vigicrues_auto_code", "")
        return code

    def _resolved_code(self) -> str:
        """Return the actual station code (resolved for auto-detect)."""
        if self._station_code:
            return self._station_code
        return (self.coordinator.data or {}).get("_vigicrues_auto_code", "")

    @property
    def translation_key(self) -> str:
        return "vigicrues_river_level"

    @property
    def translation_placeholders(self) -> dict[str, str]:
        d = self.coordinator.data or {}
        code = self._resolved_code()
        river = d.get(f"_river_name_{code}") or self._river_name
        station = d.get(f"_river_station_name_{code}") or self._station_name
        return {"river": river or station or "Unknown"}

    @property
    def native_value(self):
        d = self.coordinator.data or {}
        code = self._resolved_code()
        return d.get(f"river_level_m_{code}")

    @property
    def extra_state_attributes(self) -> dict:
        d = self.coordinator.data or {}
        code = self._resolved_code()
        return {
            "station": d.get(f"_river_station_name_{code}") or self._station_name,
            "river": d.get(f"_river_name_{code}") or self._river_name,
            "station_code": d.get(f"_river_station_code_{code}") or code,
            "observed_at": d.get(f"_river_obs_time_{code}"),
        }

    @property
    def device_info(self) -> dict:
        return {"identifiers": {(DOMAIN, self._entry.entry_id)}}


class WSRiverFlowSensor(CoordinatorEntity, SensorEntity):
    """Real-time river flow (discharge) for a single Vigicrues hydrometric station.

    Flow data (grandeur_hydro=Q) is optional — not all stations provide it.
    The sensor is always created but returns None when the API has no Q data.
    """

    _attr_has_entity_name = True
    _attr_icon = "mdi:water-sync"
    _attr_native_unit_of_measurement = "m³/s"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_device_class = None

    def __init__(
        self,
        coordinator,
        entry: ConfigEntry,
        prefix: str,
        station: dict,
    ) -> None:
        super().__init__(coordinator)
        self._entry = entry
        self._prefix = prefix
        self._station_code: str = (station.get("code") or "").strip()
        self._station_name: str = station.get("name") or self._station_code
        self._river_name: str = station.get("river") or ""

        uid_suffix = self._station_code if self._station_code else "auto"
        self._attr_unique_id = f"{entry.entry_id}_river_flow_{uid_suffix}"
        name_slug = _river_slug(self._river_name or self._station_name)
        slug = (
            f"river_flow_{name_slug}"
            if name_slug
            else (f"river_flow_{uid_suffix}" if uid_suffix != "auto" else "river_flow")
        )
        self._attr_suggested_object_id = f"{prefix}_{slug}"

    @property
    def _resolved_code(self) -> str:
        if self._station_code:
            return self._station_code
        return (self.coordinator.data or {}).get("_vigicrues_auto_code", "")

    @property
    def translation_key(self) -> str:
        return "vigicrues_river_flow"

    @property
    def translation_placeholders(self) -> dict[str, str]:
        d = self.coordinator.data or {}
        code = self._resolved_code
        river = d.get(f"_river_name_{code}") or self._river_name
        station = d.get(f"_river_station_name_{code}") or self._station_name
        return {"river": river or station or "Unknown"}

    @property
    def native_value(self):
        d = self.coordinator.data or {}
        return d.get(f"river_flow_m3s_{self._resolved_code}")

    @property
    def extra_state_attributes(self) -> dict:
        d = self.coordinator.data or {}
        code = self._resolved_code
        return {
            "station": d.get(f"_river_station_name_{code}") or self._station_name,
            "river": d.get(f"_river_name_{code}") or self._river_name,
            "station_code": d.get(f"_river_station_code_{code}") or code,
            "observed_at": d.get(f"_river_flow_obs_time_{code}"),
        }

    @property
    def device_info(self) -> dict:
        return {"identifiers": {(DOMAIN, self._entry.entry_id)}}
