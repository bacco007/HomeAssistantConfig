"""MQTT Discovery republishing for Weather Station Core.  (v2.0)

Publishes all derived sensor values as MQTT Discovery-compatible payloads so
that external consumers (Node-RED, Telegraf, custom dashboards, other HA
instances) can subscribe without needing ws_core installed.

Discovery topics follow the standard HA MQTT Discovery schema:
  {discovery_prefix}/sensor/{unique_id}/config   (retained, published once)
  {state_prefix}/{entity_prefix}/{slug}/state     (updated every interval)

No external MQTT broker is required — uses HA's built-in mqtt component.
Enable via: switch.ws_enable_mqtt  (disabled by default).
"""

from __future__ import annotations

import contextlib
import json
import logging
from typing import Any

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

# Sensor publish spec: (coordinator_data_key, slug, name, unit, device_class, icon)
# unit=None → no unit_of_measurement in discovery payload.
# device_class=None → omitted from discovery payload.
MQTT_SENSORS: list[tuple[str, str, str, str | None, str | None, str]] = [
    # Core measurements
    ("norm_temperature_c", "temperature", "Temperature", "°C", "temperature", "mdi:thermometer"),
    ("dew_point_c", "dew_point", "Dew Point", "°C", "temperature", "mdi:weather-fog"),
    ("norm_humidity", "humidity", "Humidity", "%", "humidity", "mdi:water-percent"),
    ("norm_pressure_hpa", "station_pressure", "Station Pressure", "hPa", "pressure", "mdi:gauge"),
    ("sea_level_pressure_hpa", "sea_level_pressure", "Sea-Level Pressure", "hPa", "pressure", "mdi:gauge-full"),
    ("norm_wind_speed_ms", "wind_speed", "Wind Speed", "m/s", "wind_speed", "mdi:weather-windy"),
    ("norm_wind_gust_ms", "wind_gust", "Wind Gust", "m/s", "wind_speed", "mdi:weather-windy-variant"),
    ("norm_wind_dir_deg", "wind_direction", "Wind Direction", "°", "wind_direction", "mdi:compass"),
    ("norm_rain_total_mm", "rain_total", "Rain Total", "mm", "precipitation", "mdi:weather-rainy"),
    ("rain_rate_mmph_filtered", "rain_rate", "Rain Rate", "mm/h", "precipitation_intensity", "mdi:water"),
    ("illuminance_lx", "illuminance", "Illuminance", "lx", "illuminance", "mdi:brightness-7"),
    ("uv_index", "uv_index", "UV Index", None, None, "mdi:sun-wireless"),
    # Advanced met
    ("feels_like_c", "feels_like", "Feels Like", "°C", "temperature", "mdi:thermometer-lines"),
    ("wet_bulb_c", "wet_bulb", "Wet Bulb", "°C", "temperature", "mdi:thermometer-water"),
    ("frost_point_c", "frost_point", "Frost Point", "°C", "temperature", "mdi:snowflake-thermometer"),
    ("cloud_base_m", "cloud_base", "Cloud Base", "m", None, "mdi:cloud-arrow-up"),
    ("freezing_level_m", "freezing_level", "Freezing Level", "m", None, "mdi:snowflake"),
    ("wind_gust_factor", "wind_gust_factor", "Wind Gust Factor", None, None, "mdi:weather-windy"),
    (
        "dominant_wind_direction_deg",
        "dominant_wind_direction",
        "Dominant Wind Direction",
        "°",
        "wind_direction",
        "mdi:compass-rose",
    ),
    (
        "wind_direction_variability_deg",
        "wind_direction_variability",
        "Wind Direction Variability",
        "°",
        None,
        "mdi:compass-outline",
    ),
    # Rain accumulators
    ("rain_accum_1h_mm", "rain_1h", "Rain Last 1h", "mm", "precipitation", "mdi:weather-pouring"),
    ("rain_accum_24h_mm", "rain_24h", "Rain Last 24h", "mm", "precipitation", "mdi:weather-pouring"),
    ("_rain_today_mm", "rain_today", "Rain Today", "mm", "precipitation", "mdi:weather-rainy"),
    ("rain_this_week_mm", "rain_this_week", "Rain This Week", "mm", "precipitation", "mdi:calendar-week"),
    ("rain_this_month_mm", "rain_this_month", "Rain This Month", "mm", "precipitation", "mdi:calendar-month"),
    ("rain_this_year_mm", "rain_this_year", "Rain This Year", "mm", "precipitation", "mdi:calendar"),
    (
        "rain_rate_max_24h_mmph",
        "rain_rate_max_24h",
        "Rain Rate Max 24h",
        "mm/h",
        "precipitation_intensity",
        "mdi:weather-pouring",
    ),
    # Pressure trend
    ("pressure_trend_display", "pressure_trend", "Pressure Trend", None, None, "mdi:trending-up"),
    ("pressure_trend_hpah", "pressure_trend_raw", "Pressure Trend Rate", "hPa/h", None, "mdi:chart-line"),
    # Zambretti
    ("zambretti_forecast", "zambretti_forecast", "Zambretti Forecast", None, None, "mdi:crystal-ball"),
    ("zambretti_number", "zambretti_number", "Zambretti Number", None, None, "mdi:numeric"),
    # Comfort indices
    ("heat_index_c", "heat_index", "Heat Index", "°C", "temperature", "mdi:thermometer-chevron-up"),
    ("wind_chill_c", "wind_chill", "Wind Chill", "°C", "temperature", "mdi:thermometer-chevron-down"),
    ("humidex", "humidex", "Humidex", "°C", "temperature", "mdi:thermometer-lines"),
    ("vpd_kpa", "vpd", "Vapour Pressure Deficit", "kPa", None, "mdi:water-minus"),
    ("absolute_humidity_gm3", "absolute_humidity", "Absolute Humidity", "g/m³", None, "mdi:water-percent"),
    ("air_density_kg_m3", "air_density", "Air Density", "kg/m³", None, "mdi:air-humidifier"),
    ("specific_humidity_g_kg", "specific_humidity", "Specific Humidity", "g/kg", None, "mdi:water-percent"),
    ("wbgt_c", "wbgt", "WBGT", "°C", "temperature", "mdi:sun-thermometer-outline"),
    ("utci_c", "utci", "UTCI", "°C", "temperature", "mdi:human-handsup"),
    # ET₀ / irrigation
    ("et0_daily_mm", "et0_daily", "ET₀ Daily", "mm", "precipitation", "mdi:sprout"),
    ("et0_pm_daily_mm", "et0_penman_monteith", "ET₀ Penman-Monteith", "mm", "precipitation", "mdi:water-pump"),
    ("irrigation_deficit_mm", "irrigation_deficit", "Irrigation Deficit", "mm", "precipitation", "mdi:water-sync"),
    # Solar
    ("solar_energy_today_whm2", "solar_energy_today", "Solar Energy Today", "Wh/m²", "energy", "mdi:solar-power"),
    ("max_solar_radiation_wm2", "max_solar_radiation", "Max Solar Radiation", "W/m²", None, "mdi:sun-wireless"),
    ("peak_sun_hours", "peak_sun_hours", "Peak Sun Hours", "h", None, "mdi:weather-sunny"),
    ("clearness_index_kt", "clearness_index", "Clearness Index", None, None, "mdi:weather-sunny"),
    ("cloud_cover_pct", "cloud_cover", "Cloud Cover", "%", None, "mdi:cloud"),
    # Wind & agro
    ("wind_run_km", "wind_run", "Wind Run", "km", None, "mdi:weather-windy"),
    ("wind_beaufort", "wind_beaufort", "Beaufort Scale", None, None, "mdi:weather-windy"),
    # Degree days & leaf wetness
    ("hdd_today_degc", "hdd_today", "Heating Degree Day", "°C·d", None, "mdi:thermometer-chevron-down"),
    ("hdd_season_degc", "hdd_season", "Heating Degree Days Season", "°C·d", None, "mdi:thermometer-chevron-down"),
    ("cdd_today_degc", "cdd_today", "Cooling Degree Day", "°C·d", None, "mdi:thermometer-chevron-up"),
    ("cdd_season_degc", "cdd_season", "Cooling Degree Days Season", "°C·d", None, "mdi:thermometer-chevron-up"),
    ("gdd_today_v2_degc", "gdd_today", "Growing Degree Day", "°C·d", None, "mdi:sprout"),
    ("gdd_season_v2_degc", "gdd_season", "Growing Degree Days Season", "°C·d", None, "mdi:sprout-outline"),
    ("leaf_wetness", "leaf_wetness", "Leaf Wetness", None, None, "mdi:leaf-maple"),
    # Fire
    ("fire_risk_score", "fire_risk_score", "Fire Risk Score", None, None, "mdi:fire"),
    ("ffdi", "ffdi", "FFDI", None, None, "mdi:fire-alert"),
    ("ffwi", "ffwi", "FFWI", None, None, "mdi:fire-circle"),
    # Rain probability
    ("rain_probability", "rain_probability", "Rain Probability", "%", None, "mdi:weather-rainy"),
    (
        "rain_probability_combined",
        "rain_probability_combined",
        "Rain Probability Combined",
        "%",
        None,
        "mdi:weather-rainy",
    ),
    # Current condition
    ("current_condition", "current_condition", "Current Condition", None, None, "mdi:weather-partly-cloudy"),
    # Air quality & pollen
    ("air_quality_index", "aqi", "Air Quality Index", "AQI", None, "mdi:air-filter"),
    ("pm2_5_ug_m3", "pm2_5", "PM2.5", "µg/m³", None, "mdi:smoke"),
    ("pm10_ug_m3", "pm10", "PM10", "µg/m³", None, "mdi:smoke"),
    # Indoor (if available)
    ("indoor_temp_c", "indoor_temperature", "Indoor Temperature", "°C", "temperature", "mdi:home-thermometer"),
    ("indoor_humidity_pct", "indoor_humidity", "Indoor Humidity", "%", "humidity", "mdi:home-humidity"),
    ("indoor_co2_ppm", "indoor_co2", "Indoor CO₂", "ppm", "carbon_dioxide", "mdi:molecule-co2"),
    # Lightning
    ("lightning_count_1h", "lightning_count_1h", "Lightning Strikes (1h)", None, None, "mdi:lightning-bolt"),
    ("lightning_distance_km", "lightning_distance", "Lightning Distance", "km", None, "mdi:lightning-bolt-circle"),
    # Data quality
    ("data_quality_score", "data_quality_score", "Data Quality Score", None, None, "mdi:star-check-outline"),
]


async def async_publish_discovery(
    hass: HomeAssistant,
    discovery_prefix: str,
    state_prefix: str,
    entity_prefix: str,
    station_name: str,
    integration_version: str,
) -> None:
    """Publish MQTT Discovery payloads for all ws_core sensors."""
    try:
        from homeassistant.components import mqtt as mqtt_component
    except ImportError:
        _LOGGER.warning("ws_core MQTT: homeassistant.components.mqtt not available")
        return

    if not mqtt_component.is_connected(hass):
        _LOGGER.debug("ws_core MQTT: broker not connected, skipping discovery")
        return

    device_payload = {
        "identifiers": [f"ws_core_{entity_prefix}"],
        "name": station_name,
        "manufacturer": "ws_core",
        "model": f"v{integration_version}",
        "sw_version": integration_version,
    }

    for _data_key, slug, name, unit, device_class, icon in MQTT_SENSORS:
        unique_id = f"ws_core_{entity_prefix}_{slug}"
        state_topic = f"{state_prefix}/{entity_prefix}/{slug}/state"

        config: dict[str, Any] = {
            "name": name,
            "unique_id": unique_id,
            "state_topic": state_topic,
            "icon": icon,
            "device": device_payload,
        }
        if unit:
            config["unit_of_measurement"] = unit
        if device_class:
            config["device_class"] = device_class

        discovery_topic = f"{discovery_prefix}/sensor/{unique_id}/config"
        payload = json.dumps(config)

        try:
            await mqtt_component.async_publish(hass, discovery_topic, payload, retain=True)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.debug("ws_core MQTT discovery publish failed for %s: %s", slug, exc)


async def async_publish_states(
    hass: HomeAssistant,
    state_prefix: str,
    entity_prefix: str,
    coordinator_data: dict[str, Any],
) -> None:
    """Publish current sensor states to MQTT state topics."""
    try:
        from homeassistant.components import mqtt as mqtt_component
    except ImportError:
        return

    if not mqtt_component.is_connected(hass):
        return

    for data_key, slug, _name, _unit, _dc, _icon in MQTT_SENSORS:
        value = coordinator_data.get(data_key)
        if value is None:
            continue

        state_topic = f"{state_prefix}/{entity_prefix}/{slug}/state"
        # Publish numeric values rounded to 2dp; everything else as string
        payload = f"{value:.2f}" if isinstance(value, float) else str(value)

        try:
            await mqtt_component.async_publish(hass, state_topic, payload, retain=False)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.debug("ws_core MQTT state publish failed for %s: %s", slug, exc)


async def async_unpublish_discovery(
    hass: HomeAssistant,
    discovery_prefix: str,
    entity_prefix: str,
) -> None:
    """Remove MQTT Discovery entries (publish empty retained messages)."""
    try:
        from homeassistant.components import mqtt as mqtt_component
    except ImportError:
        return

    for _data_key, slug, *_ in MQTT_SENSORS:
        unique_id = f"ws_core_{entity_prefix}_{slug}"
        discovery_topic = f"{discovery_prefix}/sensor/{unique_id}/config"
        with contextlib.suppress(Exception):
            await mqtt_component.async_publish(hass, discovery_topic, "", retain=True)
