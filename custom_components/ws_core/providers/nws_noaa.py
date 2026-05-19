"""NWS/NOAA forecast provider (US National Weather Service, free, no API key, US only)."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

import aiohttp

from .base import ForecastProvider

_LOGGER = logging.getLogger(__name__)

_SHORTFORECAST_TO_WMO: dict[str, int] = {
    "sunny": 0,
    "clear": 0,
    "mostly clear": 1,
    "mostly sunny": 1,
    "partly cloudy": 2,
    "partly sunny": 2,
    "mostly cloudy": 3,
    "cloudy": 3,
    "overcast": 3,
    "fog": 45,
    "freezing fog": 45,
    "drizzle": 51,
    "light drizzle": 51,
    "freezing drizzle": 56,
    "light rain": 61,
    "rain": 63,
    "heavy rain": 65,
    "freezing rain": 66,
    "rain showers": 80,
    "light rain showers": 80,
    "heavy rain showers": 82,
    "sleet": 68,
    "light snow": 71,
    "snow": 73,
    "heavy snow": 75,
    "blizzard": 75,
    "snow showers": 85,
    "thunderstorm": 95,
    "thunderstorms": 95,
}


def _forecast_to_wmo(short_forecast: str | None) -> int | None:
    if not short_forecast:
        return None
    lower = short_forecast.lower()
    for key, code in _SHORTFORECAST_TO_WMO.items():
        if key in lower:
            return code
    return None


def _parse_wind_speed(wind_speed_str: str | None) -> float | None:
    """Parse '10 mph' or '5 to 15 mph' → average km/h."""
    if not wind_speed_str:
        return None
    try:
        parts = wind_speed_str.lower().replace("mph", "").strip().split("to")
        speeds_mph = [float(p.strip()) for p in parts if p.strip()]
        avg_mph = sum(speeds_mph) / len(speeds_mph)
        return round(avg_mph * 1.60934, 1)
    except (ValueError, ZeroDivisionError):
        return None


def _f_to_c(f: float | None) -> float | None:
    if f is None:
        return None
    return round((f - 32) * 5 / 9, 1)


class NwsNoaaProvider(ForecastProvider):
    """NWS/NOAA forecast provider. Free, no API key required. US only."""

    PROVIDER_ID = "nws_noaa"
    PROVIDER_NAME = "NWS/NOAA"
    REQUIRES_API_KEY = False

    _USER_AGENT = "ha_ws_core/1.2.0 github.com/kmich/ha_ws_core"

    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        lat: float,
        lon: float,
        api_key: str | None = None,
    ) -> dict[str, Any]:
        headers = {"User-Agent": self._USER_AGENT, "Accept": "application/geo+json"}

        # Step 1: resolve grid point
        points_url = f"https://api.weather.gov/points/{lat:.4f},{lon:.4f}"
        async with session.get(points_url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as resp:
            if resp.status == 404:
                raise ValueError(f"NWS/NOAA: coordinates ({lat}, {lon}) are outside the US coverage area")
            if resp.status != 200:
                raise aiohttp.ClientResponseError(resp.request_info, resp.history, status=resp.status)
            points = await resp.json()

        props = points.get("properties", {})
        forecast_url = props.get("forecast")
        hourly_url = props.get("forecastHourly")

        if not forecast_url or not hourly_url:
            raise ValueError("NWS/NOAA: could not resolve forecast URLs from grid point")

        # Step 2: fetch daily (12h period) forecast
        async with session.get(forecast_url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as resp:
            if resp.status != 200:
                raise aiohttp.ClientResponseError(resp.request_info, resp.history, status=resp.status)
            daily_raw = await resp.json()

        # Step 3: fetch hourly forecast
        async with session.get(hourly_url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as resp:
            if resp.status != 200:
                raise aiohttp.ClientResponseError(resp.request_info, resp.history, status=resp.status)
            hourly_raw = await resp.json()

        # Parse daily: pair day/night periods → one entry per calendar day
        periods = daily_raw.get("properties", {}).get("periods", [])
        daily_by_date: dict[str, dict[str, Any]] = {}
        for period in periods:
            start = period.get("startTime", "")
            try:
                dt = datetime.fromisoformat(start)
            except ValueError:
                continue
            date_str = dt.strftime("%Y-%m-%d")
            if date_str not in daily_by_date:
                daily_by_date[date_str] = {
                    "date": date_str,
                    "tmax_c": None,
                    "tmin_c": None,
                    "precip_mm": None,
                    "wind_kmh": None,
                    "gust_kmh": None,
                    "weathercode": None,
                    "precip_prob": None,
                }
            entry = daily_by_date[date_str]
            temp_f = period.get("temperature")
            temp_c = _f_to_c(temp_f) if isinstance(temp_f, (int, float)) else None
            is_day = period.get("isDaytime", True)
            if is_day:
                entry["tmax_c"] = temp_c
            else:
                entry["tmin_c"] = temp_c
            if entry["wind_kmh"] is None:
                entry["wind_kmh"] = _parse_wind_speed(period.get("windSpeed"))
            if entry["weathercode"] is None:
                entry["weathercode"] = _forecast_to_wmo(period.get("shortForecast"))
            pop = period.get("probabilityOfPrecipitation", {})
            if isinstance(pop, dict) and pop.get("value") is not None:
                cur = entry.get("precip_prob")
                val = int(pop["value"])
                entry["precip_prob"] = max(cur, val) if cur is not None else val

        daily_out = list(daily_by_date.values())[:7]

        # Parse hourly
        now = datetime.now(tz=UTC)
        hourly_periods = hourly_raw.get("properties", {}).get("periods", [])
        hourly_out: list[dict[str, Any]] = []
        for period in hourly_periods:
            if len(hourly_out) >= 24:
                break
            start = period.get("startTime", "")
            try:
                dt = datetime.fromisoformat(start)
            except ValueError:
                continue
            delta_h = (dt.astimezone(UTC) - now).total_seconds() / 3600
            if not (0 <= delta_h < 24):
                continue
            temp_f = period.get("temperature")
            temp_c = _f_to_c(temp_f) if isinstance(temp_f, (int, float)) else None
            wind_kmh = _parse_wind_speed(period.get("windSpeed"))
            pop_obj = period.get("probabilityOfPrecipitation", {})
            precip_prob = (
                int(pop_obj["value"]) if isinstance(pop_obj, dict) and pop_obj.get("value") is not None else None
            )
            hourly_out.append(
                {
                    "datetime": dt.astimezone(UTC).strftime("%Y-%m-%dT%H:%M"),
                    "temp_c": temp_c,
                    "apparent_temp_c": None,
                    "dewpoint_c": None,
                    "precip_prob": precip_prob,
                    "precip_mm": None,
                    "weathercode": _forecast_to_wmo(period.get("shortForecast")),
                    "wind_kmh": wind_kmh,
                    "gust_kmh": None,
                    "humidity": (
                        period.get("relativeHumidity", {}).get("value")
                        if isinstance(period.get("relativeHumidity"), dict)
                        else None
                    ),
                    "cloud_cover": None,
                }
            )

        return {"provider": self.PROVIDER_ID, "daily": daily_out, "hourly": hourly_out}
