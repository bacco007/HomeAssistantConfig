"""Weather platform for Weather Station Core (weather.* entity)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.weather import WeatherEntity

try:
    from homeassistant.components.weather import WeatherEntityFeature
except Exception:  # pragma: no cover
    WeatherEntityFeature = None  # type: ignore
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_ATTRIBUTION,
    UnitOfPressure,
    UnitOfSpeed,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CONF_PREFIX,
    DEFAULT_PREFIX,
    DOMAIN,
    KEY_CURRENT_CONDITION,
    KEY_DEW_POINT_C,
    KEY_FEELS_LIKE_C,
    KEY_FORECAST,
    KEY_NORM_HUMIDITY,
    KEY_NORM_PRESSURE_HPA,
    KEY_NORM_TEMP_C,
    KEY_NORM_WIND_DIR_DEG,
    KEY_NORM_WIND_GUST_MS,
    KEY_NORM_WIND_SPEED_MS,
    KEY_PACKAGE_OK,
    KEY_RAIN_RATE_FILT,
    KEY_SEA_LEVEL_PRESSURE_HPA,
    KEY_UV,
)

# Nowcast taper: local sensor weight for hours 0, 1, 2 of the hourly forecast.
# By hour 3 the NWP model is fully trusted (weight 0.0).
_NOWCAST_LOCAL_WEIGHTS = [0.7, 0.4, 0.2]


def _nowcast_blend(local_val: float | None, api_val: float | None, local_w: float) -> float | None:
    """Weighted blend of a local reading and an API value."""
    if local_val is None:
        return api_val
    if api_val is None:
        return local_val
    result = local_val * local_w + api_val * (1.0 - local_w)
    return round(result, 1)


def _weathercode_to_condition(code: int | None) -> str | None:
    if code is None:
        return None
    c = int(code)
    if c == 0:
        return "sunny"
    if c in (1, 2, 3):
        return "partlycloudy" if c != 3 else "cloudy"
    if c in (45, 48):
        return "fog"
    if c in (51, 53, 55, 56, 57):
        return "rainy"
    if c in (61, 63, 65, 66, 67):
        return "rainy"
    if c in (71, 73, 75, 77):
        return "snowy"
    if c in (80, 81, 82):
        return "pouring"
    if c in (85, 86):
        return "snowy-rainy"
    if c in (95, 96, 99):
        return "lightning-rainy"
    return None


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    coordinator = hass.data[DOMAIN][entry.entry_id]
    prefix = (entry.options.get(CONF_PREFIX) or entry.data.get(CONF_PREFIX) or DEFAULT_PREFIX).strip().lower()
    async_add_entities([WSStationWeather(coordinator, entry, prefix)])


class WSStationWeather(CoordinatorEntity, WeatherEntity):
    """Weather entity derived from the coordinator."""

    _attr_native_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_native_pressure_unit = UnitOfPressure.HPA
    _attr_native_wind_speed_unit = UnitOfSpeed.METERS_PER_SECOND

    def __init__(self, coordinator, entry: ConfigEntry, prefix: str) -> None:
        super().__init__(coordinator)
        self._entry = entry
        self._prefix = prefix
        self._attr_unique_id = f"{entry.entry_id}_weather"
        self._attr_suggested_object_id = f"{prefix}"
        self._attr_name = "Weather Station Core"
        if WeatherEntityFeature is not None:
            self._attr_supported_features = WeatherEntityFeature.FORECAST_DAILY | WeatherEntityFeature.FORECAST_HOURLY

    @property
    def device_info(self):
        return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        desired = f"weather.{self._prefix}"
        if self.entity_id and self.entity_id != desired:
            reg = er.async_get(self.hass)
            current = reg.async_get(self.entity_id)
            if current and current.unique_id == self.unique_id and reg.async_get(desired) is None:
                reg.async_update_entity(self.entity_id, new_entity_id=desired)

    @property
    def available(self) -> bool:
        d = self.coordinator.data or {}
        return bool(d.get(KEY_PACKAGE_OK))

    @property
    def native_temperature(self) -> float | None:
        return (self.coordinator.data or {}).get(KEY_NORM_TEMP_C)

    @property
    def humidity(self) -> float | None:
        return (self.coordinator.data or {}).get(KEY_NORM_HUMIDITY)

    @property
    def native_pressure(self) -> float | None:
        d = self.coordinator.data or {}
        return d.get(KEY_SEA_LEVEL_PRESSURE_HPA) or d.get(KEY_NORM_PRESSURE_HPA)

    @property
    def native_wind_speed(self) -> float | None:
        return (self.coordinator.data or {}).get(KEY_NORM_WIND_SPEED_MS)

    @property
    def wind_bearing(self) -> float | None:
        return (self.coordinator.data or {}).get(KEY_NORM_WIND_DIR_DEG)

    @property
    def native_apparent_temperature(self) -> float | None:
        return (self.coordinator.data or {}).get(KEY_FEELS_LIKE_C)

    @property
    def native_dew_point(self) -> float | None:
        return (self.coordinator.data or {}).get(KEY_DEW_POINT_C)

    @property
    def native_wind_gust_speed(self) -> float | None:
        return (self.coordinator.data or {}).get(KEY_NORM_WIND_GUST_MS)

    @property
    def uv_index(self) -> float | None:
        return (self.coordinator.data or {}).get(KEY_UV)

    @property
    def attribution(self) -> str | None:
        fc = (self.coordinator.data or {}).get(KEY_FORECAST) or {}
        if fc.get("provider") == "open-meteo":
            return "Forecast by Open-Meteo"
        return None

    _LOCAL_CONDITION_MAP = {
        "sunny": "sunny",
        "partly-cloudy": "partlycloudy",
        "cloudy": "cloudy",
        "overcast": "cloudy",
        "overcast-night": "cloudy",
        "clear-night": "clear-night",
        "rainy": "rainy",
        "drizzle": "rainy",
        "heavy-rain": "pouring",
        "thunderstorm": "lightning-rainy",
        "pre-storm": "lightning-rainy",
        "severe-storm": "lightning-rainy",
        "hurricane": "lightning-rainy",
        "snowy": "snowy",
        "snow-accumulation": "snowy",
        "sleet": "snowy-rainy",
        "fog": "fog",
        "misty-morning": "fog",
        "windy": "windy",
        "windy-night": "windy",
        "hot": "sunny",
        "cold": "clear-night",
        "sunrise": "sunny",
        "sunset": "sunny",
        "golden-hour": "sunny",
        "clearing-after-rain": "partlycloudy",
    }

    @property
    def condition(self) -> str | None:
        """Determine the current weather condition.

        v0.3.0 fix: prefer the local-sensor-driven KEY_CURRENT_CONDITION
        (which integrates illuminance, rain rate, wind, etc. in real time)
        over Open-Meteo's daily weathercode summary. Open-Meteo's *hourly*
        weathercode is used as a fallback when local data is unavailable.
        Previously, the daily weathercode for *the whole day* was returned
        as the current condition, causing "cloudy" when the sun was clearly
        out.
        """
        d = self.coordinator.data or {}

        # 1. Local condition (computed by determine_current_condition).
        # This integrates real-time illuminance, rain rate, wind gust, etc.
        local = d.get(KEY_CURRENT_CONDITION)
        if local:
            return self._LOCAL_CONDITION_MAP.get(local, "partlycloudy")

        # 2. Open-Meteo hourly weathercode for the current hour.
        fc = d.get(KEY_FORECAST) or {}
        hourly = fc.get("hourly") or []
        if hourly:
            now_iso = datetime.now().strftime("%Y-%m-%dT%H:00")
            for item in hourly:
                if str(item.get("datetime", "")).startswith(now_iso[:13]):
                    h_cond = _weathercode_to_condition(item.get("weathercode"))
                    if h_cond:
                        return h_cond
                    break

        # 3. Fallback: Open-Meteo daily summary (least-preferred).
        daily = fc.get("daily") or []
        if daily:
            api_cond = _weathercode_to_condition(daily[0].get("weathercode"))
            if api_cond:
                return api_cond
        return None

    def _build_daily_forecast(self) -> list[dict[str, Any]] | None:
        d = self.coordinator.data or {}
        fc = d.get(KEY_FORECAST) or {}
        daily = fc.get("daily") or []
        if not daily:
            return None
        out: list[dict[str, Any]] = []
        for item in daily:
            date_s = item.get("date")
            if not date_s:
                continue
            dt = f"{date_s}T12:00:00"
            wind_kmh = item.get("wind_kmh")
            wind_ms = (float(wind_kmh) / 3.6) if wind_kmh is not None else None
            gust_kmh = item.get("gust_kmh")
            gust_ms = (float(gust_kmh) / 3.6) if gust_kmh is not None else None
            out.append(
                {
                    "datetime": dt,
                    "temperature": item.get("tmax_c"),
                    "templow": item.get("tmin_c"),
                    "precipitation": item.get("precip_mm"),
                    "precipitation_probability": item.get("precip_prob"),
                    "wind_speed": wind_ms,
                    "native_wind_gust_speed": gust_ms,
                    "condition": _weathercode_to_condition(item.get("weathercode")),
                    ATTR_ATTRIBUTION: self.attribution,
                }
            )
        return out

    def _build_hourly_forecast(self) -> list[dict[str, Any]] | None:
        d = self.coordinator.data or {}
        fc = d.get(KEY_FORECAST) or {}
        hourly = fc.get("hourly") or []
        if not hourly:
            return None

        # Nowcast: gather current local sensor readings for 0-2h blending
        local_temp = d.get(KEY_NORM_TEMP_C)
        local_humidity = d.get(KEY_NORM_HUMIDITY)
        local_dew = d.get(KEY_DEW_POINT_C)
        local_apparent = d.get(KEY_FEELS_LIKE_C)
        local_wind_ms = d.get(KEY_NORM_WIND_SPEED_MS)
        local_gust_ms = d.get(KEY_NORM_WIND_GUST_MS)
        local_condition = d.get(KEY_CURRENT_CONDITION)
        local_rain_rate = d.get(KEY_RAIN_RATE_FILT)  # mm/h  → approx mm in 1h
        now_hour_iso = datetime.now().strftime("%Y-%m-%dT%H")
        nowcast_slot = 0  # counts how many hourly slots we've applied local data to

        out: list[dict[str, Any]] = []
        for item in hourly:
            dt_s = item.get("datetime")
            if not dt_s:
                continue
            # Ensure ISO format
            dt = f"{dt_s}:00" if len(dt_s) == 16 else dt_s
            wind_kmh = item.get("wind_kmh")
            wind_ms = (float(wind_kmh) / 3.6) if wind_kmh is not None else None
            gust_kmh = item.get("gust_kmh")
            gust_ms = (float(gust_kmh) / 3.6) if gust_kmh is not None else None

            # Determine if this slot falls within the nowcast window (hours 0-2)
            is_nowcast = nowcast_slot < len(_NOWCAST_LOCAL_WEIGHTS) and str(dt_s)[:13] >= now_hour_iso

            if is_nowcast:
                lw = _NOWCAST_LOCAL_WEIGHTS[nowcast_slot]
                temperature = _nowcast_blend(local_temp, item.get("temp_c"), lw)
                apparent = _nowcast_blend(local_apparent, item.get("apparent_temp_c"), lw)
                dew = _nowcast_blend(local_dew, item.get("dewpoint_c"), lw)
                humidity = _nowcast_blend(local_humidity, item.get("humidity"), lw)
                # Wind: local sensors are more accurate than NWP for immediate hours
                wind_ms = _nowcast_blend(local_wind_ms, wind_ms, lw)
                gust_ms = _nowcast_blend(local_gust_ms, gust_ms, lw)
                # For hour 0 use local condition; beyond that use API
                if nowcast_slot == 0 and local_condition:
                    condition = self._LOCAL_CONDITION_MAP.get(local_condition, "partlycloudy")
                else:
                    condition = _weathercode_to_condition(item.get("weathercode"))
                # Precipitation: use rain rate as a 1h proxy for slot 0
                if nowcast_slot == 0 and local_rain_rate is not None:
                    precip = _nowcast_blend(local_rain_rate, item.get("precip_mm"), lw)
                else:
                    precip = item.get("precip_mm")
                nowcast_slot += 1
            else:
                temperature = item.get("temp_c")
                apparent = item.get("apparent_temp_c")
                dew = item.get("dewpoint_c")
                humidity = item.get("humidity")
                condition = _weathercode_to_condition(item.get("weathercode"))
                precip = item.get("precip_mm")

            out.append(
                {
                    "datetime": dt,
                    "temperature": temperature,
                    "native_apparent_temperature": apparent,
                    "native_dew_point": dew,
                    "precipitation_probability": item.get("precip_prob"),
                    "precipitation": precip,
                    "wind_speed": wind_ms,
                    "native_wind_gust_speed": gust_ms,
                    "humidity": humidity,
                    "cloud_coverage": item.get("cloud_cover"),
                    "condition": condition,
                    ATTR_ATTRIBUTION: self.attribution,
                }
            )
        return out

    @property
    def forecast(self) -> list[dict[str, Any]] | None:
        return self._build_daily_forecast()

    async def async_forecast_daily(self) -> list[dict[str, Any]] | None:
        return self._build_daily_forecast()

    async def async_forecast_hourly(self) -> list[dict[str, Any]] | None:
        return self._build_hourly_forecast()
