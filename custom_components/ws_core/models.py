"""Typed coordinator data model for ws_core."""

from __future__ import annotations

from typing import Any


class WsData(dict):
    """Coordinator data with typed field annotations for IDE support.

    Subclasses dict for full backward compatibility with all existing
    ``data["key"] = value``, ``data.get("key")``, and ``data.get("key", default)``
    access patterns in coordinator.py and sensor.py.  The typed annotations
    below are documentation + IDE hints only — actual storage is in the dict
    base class and nothing in the runtime changes.
    """

    # ------------------------------------------------------------------
    # Basic sensor readings
    # ------------------------------------------------------------------
    norm_temperature_c: float | None
    norm_humidity: float | None
    norm_pressure_hpa: float | None
    sea_level_pressure_hpa: float | None
    pressure_change_window_hpa: float | None
    norm_wind_speed_ms: float | None
    norm_wind_gust_ms: float | None
    norm_wind_dir_deg: float | None
    norm_rain_total_mm: float | None
    dew_point_c: float | None
    illuminance_lx: float | None
    uv_index: float | None
    battery_pct: float | None
    rain_rate_mmph_raw: float | None
    rain_rate_mmph_filtered: float | None

    # ------------------------------------------------------------------
    # Alert & package health
    # ------------------------------------------------------------------
    alert_state: str | None
    alert_message: str | None
    data_quality: str | None
    package_status: str | None
    package_ok: bool | None

    # ------------------------------------------------------------------
    # Forecast
    # ------------------------------------------------------------------
    forecast: list[Any] | None
    forecast_provider: str | None

    # ------------------------------------------------------------------
    # Advanced meteorological sensors
    # ------------------------------------------------------------------
    feels_like_c: float | None
    wet_bulb_c: float | None
    frost_point_c: float | None
    zambretti_forecast: str | None
    zambretti_number: int | None
    wind_beaufort: int | None
    wind_beaufort_desc: str | None
    wind_quadrant: str | None
    wind_dir_smooth_deg: float | None
    current_condition: str | None
    rain_probability: float | None
    rain_probability_combined: float | None
    forecast_agreement: str | None
    rain_display: str | None
    rain_accum_1h_mm: float | None
    rain_accum_24h_mm: float | None
    rain_today_mm: float | None
    time_since_rain: str | None
    pressure_trend_display: str | None
    health_display: str | None
    forecast_tiles: list[Any] | None

    # ------------------------------------------------------------------
    # 24-hour statistics
    # ------------------------------------------------------------------
    temp_high_24h: float | None
    temp_low_24h: float | None
    temp_avg_24h: float | None
    wind_gust_max_24h: float | None

    # ------------------------------------------------------------------
    # Display / format sensors
    # ------------------------------------------------------------------
    uv_level_display: str | None
    humidity_level_display: str | None
    temp_display: str | None
    battery_display: str | None

    # ------------------------------------------------------------------
    # Activity / derived heuristics
    # ------------------------------------------------------------------
    laundry_drying_score: float | None
    stargazing_quality: float | None
    fire_risk_score: float | None
    running_score: float | None
    pressure_trend_hpah: float | None

    # ------------------------------------------------------------------
    # Sea surface temperature
    # ------------------------------------------------------------------
    sea_surface_temperature: float | None

    # ------------------------------------------------------------------
    # Text summaries
    # ------------------------------------------------------------------
    conditions_summary: str | None

    # ------------------------------------------------------------------
    # Sensor quality / validation flags
    # ------------------------------------------------------------------
    sensor_quality_flags: list[str] | None

    # ------------------------------------------------------------------
    # Degree days (legacy v0.5.0 keys, replaced in v2.0)
    # ------------------------------------------------------------------
    hdd_today: float | None
    cdd_today: float | None
    hdd_rate: float | None
    cdd_rate: float | None

    # ------------------------------------------------------------------
    # METAR cross-validation (v0.5.0, deprecated in v0.3.0 cleanup)
    # ------------------------------------------------------------------
    metar_temp_c: float | None
    metar_pressure_hpa: float | None
    metar_wind_ms: float | None
    metar_wind_dir_deg: float | None
    metar_condition: str | None
    metar_delta_temp_c: float | None
    metar_delta_pressure_hpa: float | None
    metar_validation: str | None
    metar_station_id: str | None
    metar_age_min: float | None

    # ------------------------------------------------------------------
    # ET0 irrigation (v0.6.0)
    # ------------------------------------------------------------------
    et0_daily_mm: float | None
    et0_hourly_mm: float | None

    # ------------------------------------------------------------------
    # Upload status (v0.6.0)
    # ------------------------------------------------------------------
    cwop_upload_status: str | None
    wu_upload_status: str | None
    last_export_time: str | None

    # ------------------------------------------------------------------
    # Air quality (v0.7.0)
    # ------------------------------------------------------------------
    air_quality_index: int | None
    air_quality_level: str | None
    pm2_5_ug_m3: float | None
    pm10_ug_m3: float | None
    no2_ug_m3: float | None
    ozone_ug_m3: float | None
    co_ug_m3: float | None

    # ------------------------------------------------------------------
    # Pollen (v0.7.0)
    # ------------------------------------------------------------------
    pollen_grass_index: int | None
    pollen_tree_index: int | None
    pollen_weed_index: int | None
    pollen_overall_level: str | None

    # ------------------------------------------------------------------
    # Moon (v0.8.0)
    # ------------------------------------------------------------------
    moon_phase: str | None
    moon_illumination_pct: float | None
    moon_display: str | None
    moon_age_days: float | None
    moon_next_full_days: float | None
    moon_next_new_days: float | None

    # ------------------------------------------------------------------
    # Solar forecast & Penman-Monteith ET0 (v0.9.0)
    # ------------------------------------------------------------------
    solar_forecast_today_kwh: float | None
    solar_forecast_tomorrow_kwh: float | None
    solar_forecast_status: str | None
    et0_pm_daily_mm: float | None

    # ------------------------------------------------------------------
    # Learning / self-calibration (v1.2.0)
    # ------------------------------------------------------------------
    learned_temp_bias: float | None
    cal_suggestion_temp: float | None
    learned_pressure_bias: float | None
    cal_suggestion_pressure: float | None
    forecast_skill: float | None
    solar_lux_factor: float | None

    # ------------------------------------------------------------------
    # New meteorological sensors (v1.2.0)
    # ------------------------------------------------------------------
    fog_probability: float | None
    thunderstorm_risk: float | None
    precipitation_type: str | None
    gdd_today: float | None
    gdd_season: float | None
    dry_streak_days: int | None
    heat_streak_days: int | None
    frost_streak_days: int | None

    # ------------------------------------------------------------------
    # Station intelligence (v1.2.0)
    # ------------------------------------------------------------------
    sensor_drift_flags: list[str] | None
    consistency_flags: list[str] | None

    # ------------------------------------------------------------------
    # Rolling climatology (v1.2.0)
    # ------------------------------------------------------------------
    climatology_30d: dict[str, Any] | None
    temp_anomaly_30d: float | None
    rain_anomaly_30d: float | None

    # ------------------------------------------------------------------
    # Canadian FWI (v1.3.0)
    # ------------------------------------------------------------------
    fwi_ffmc: float | None
    fwi_dmc: float | None
    fwi_dc: float | None
    fwi_isi: float | None
    fwi_bui: float | None
    fwi: float | None
    fwi_dsr: float | None

    # ------------------------------------------------------------------
    # Extended comfort / agrometeorological (v1.5.0)
    # ------------------------------------------------------------------
    heat_index_c: float | None
    wind_chill_c: float | None
    humidex: float | None
    vpd_kpa: float | None
    absolute_humidity_gm3: float | None
    delta_t_c: float | None
    wind_run_km: float | None
    chill_hours_today: float | None
    chill_hours_season: float | None
    thw_index_c: float | None
    thsw_index_c: float | None
    clearness_index_kt: float | None
    cloud_cover_pct: float | None

    # ------------------------------------------------------------------
    # Meteo-France Vigilance & Vigicrues (v1.6.0)
    # ------------------------------------------------------------------
    vigilance_max_level: str | None
    fire_danger_vigilance: str | None
    river_level_m: float | None

    # ------------------------------------------------------------------
    # Precipitation nowcast (v1.7.0)
    # ------------------------------------------------------------------
    rain_next_60min_mm: float | None
    minutes_until_rain: int | None
    minutes_until_dry: int | None
    nowcast_intensity: str | None
    rain_expected_1h: bool | None

    # ------------------------------------------------------------------
    # Degree days v2.0 (renamed keys)
    # ------------------------------------------------------------------
    hdd_today_degc: float | None
    hdd_season_degc: float | None
    cdd_today_degc: float | None
    cdd_season_degc: float | None
    gdd_today_v2_degc: float | None
    gdd_season_v2_degc: float | None
    leaf_wetness: str | None

    # ------------------------------------------------------------------
    # New derived sensors (v2.0 always-on / comfort-group)
    # ------------------------------------------------------------------
    cloud_base_m: float | None
    freezing_level_m: float | None
    wind_gust_factor: float | None
    solar_energy_today_whm2: float | None
    max_solar_radiation_wm2: float | None
    peak_sun_hours: float | None
    irrigation_deficit_mm: float | None
    dominant_wind_direction_deg: float | None
    wind_direction_variability_deg: float | None
    wind_run_month_km: float | None
    ffdi: float | None
    ffwi: float | None
    utci_c: float | None
    net_radiation_wm2: float | None

    # ------------------------------------------------------------------
    # Additional upload targets (v2.0)
    # ------------------------------------------------------------------
    wc_upload_status: str | None
    pws_upload_status: str | None
    wow_upload_status: str | None
    awekas_upload_status: str | None
    owm_stations_upload_status: str | None
    windy_upload_status: str | None
    cwop_upload_status_v2: str | None

    # ------------------------------------------------------------------
    # Lightning (v2.0)
    # ------------------------------------------------------------------
    lightning_count_1h: int | None
    lightning_distance_km: float | None
    lightning_rate_1h: float | None
    lightning_clearance_min: int | None
    lightning_proximity: str | None

    # ------------------------------------------------------------------
    # Comfort indices group (v2.0)
    # ------------------------------------------------------------------
    air_density_kg_m3: float | None
    specific_humidity_g_kg: float | None
    wbgt_c: float | None

    # ------------------------------------------------------------------
    # Rain accumulators (v2.0 always-on)
    # ------------------------------------------------------------------
    rain_this_week_mm: float | None
    rain_this_month_mm: float | None
    rain_this_year_mm: float | None
    rain_rate_max_24h_mmph: float | None

    # ------------------------------------------------------------------
    # Indoor sensor group (v2.0)
    # ------------------------------------------------------------------
    indoor_temp_c: float | None
    indoor_humidity_pct: float | None
    indoor_co2_ppm: float | None
    indoor_temp_delta_c: float | None
    indoor_humidity_delta_pct: float | None
    indoor_comfort: float | None
    indoor_rooms_data: dict[str, Any] | None

    # ------------------------------------------------------------------
    # Data quality expansion (v2.0)
    # ------------------------------------------------------------------
    sensor_stuck_flags: list[str] | None
    data_quality_score: int | None
    neighbor_qc_flags: list[str] | None
    sensor_spike_flags: list[str] | None
