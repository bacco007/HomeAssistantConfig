"""OpenWeatherMap One Call 3.0 forecast provider (free tier, API key required)."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

import aiohttp

from .base import ForecastProvider

_LOGGER = logging.getLogger(__name__)


# OWM condition ID → WMO code (approximate)
def _owm_to_wmo(owm_id: int | None) -> int | None:
    if owm_id is None:
        return None
    if 200 <= owm_id < 300:
        return 95
    if 300 <= owm_id < 400:
        return 51
    if 500 <= owm_id < 510:
        mapping = {500: 61, 501: 63, 502: 65, 503: 65, 504: 65, 511: 66}
        return mapping.get(owm_id, 63)
    if owm_id == 511:
        return 66
    if 520 <= owm_id < 532:
        return 80
    if 600 <= owm_id < 623:
        mapping = {
            600: 71,
            601: 73,
            602: 75,
            611: 68,
            612: 68,
            613: 68,
            615: 68,
            616: 68,
            620: 85,
            621: 86,
            622: 86,
        }
        return mapping.get(owm_id, 73)
    if 700 <= owm_id < 800:
        return 45
    if owm_id == 800:
        return 0
    if owm_id == 801:
        return 1
    if owm_id == 802:
        return 2
    if owm_id in (803, 804):
        return 3
    return None


class OpenWeatherMapProvider(ForecastProvider):
    """OpenWeatherMap One Call 3.0 provider (free tier: 1000 calls/day, API key required)."""

    PROVIDER_ID = "openweathermap"
    PROVIDER_NAME = "OpenWeatherMap"
    REQUIRES_API_KEY = True

    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        lat: float,
        lon: float,
        api_key: str | None = None,
    ) -> dict[str, Any]:
        if not api_key:
            raise ValueError("OpenWeatherMap requires an API key")

        url = (
            f"https://api.openweathermap.org/data/3.0/onecall"
            f"?lat={lat}&lon={lon}&appid={api_key}&units=metric&exclude=minutely,alerts"
        )
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=20)) as resp:
            if resp.status == 401:
                raise ValueError("OpenWeatherMap: invalid API key")
            if resp.status == 429:
                raise ValueError("OpenWeatherMap: API rate limit exceeded")
            if resp.status != 200:
                raise aiohttp.ClientResponseError(resp.request_info, resp.history, status=resp.status)
            js = await resp.json()

        # Daily forecast (up to 8 days, take 7)
        daily_out: list[dict[str, Any]] = []
        for day in (js.get("daily") or [])[:7]:
            dt = day.get("dt", 0)
            date_str = datetime.fromtimestamp(dt, tz=UTC).strftime("%Y-%m-%d")
            temp = day.get("temp", {})
            weather = (day.get("weather") or [{}])[0]
            daily_out.append(
                {
                    "date": date_str,
                    "tmax_c": temp.get("max"),
                    "tmin_c": temp.get("min"),
                    "precip_mm": day.get("rain", day.get("snow", 0.0)),
                    "wind_kmh": round(day.get("wind_speed", 0) * 3.6, 1),
                    "gust_kmh": round(day.get("wind_gust", 0) * 3.6, 1) if day.get("wind_gust") else None,
                    "weathercode": _owm_to_wmo(weather.get("id")),
                    "precip_prob": int(day.get("pop", 0) * 100),
                }
            )

        # Hourly forecast (up to 48h, take 24)
        hourly_out: list[dict[str, Any]] = []
        for hour in (js.get("hourly") or [])[:24]:
            dt = hour.get("dt", 0)
            dt_str = datetime.fromtimestamp(dt, tz=UTC).strftime("%Y-%m-%dT%H:%M")
            weather = (hour.get("weather") or [{}])[0]
            rain_1h = (hour.get("rain") or {}).get("1h", 0.0)
            hourly_out.append(
                {
                    "datetime": dt_str,
                    "temp_c": hour.get("temp"),
                    "apparent_temp_c": hour.get("feels_like"),
                    "dewpoint_c": hour.get("dew_point"),
                    "precip_prob": int(hour.get("pop", 0) * 100),
                    "precip_mm": rain_1h,
                    "weathercode": _owm_to_wmo(weather.get("id")),
                    "wind_kmh": round(hour.get("wind_speed", 0) * 3.6, 1),
                    "gust_kmh": round(hour.get("wind_gust", 0) * 3.6, 1) if hour.get("wind_gust") else None,
                    "humidity": hour.get("humidity"),
                    "cloud_cover": hour.get("clouds"),
                }
            )

        return {"provider": self.PROVIDER_ID, "daily": daily_out, "hourly": hourly_out}
