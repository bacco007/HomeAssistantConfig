"""Pirate Weather forecast provider (Dark Sky-compatible API, free tier, API key required)."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

import aiohttp

from .base import ForecastProvider

_LOGGER = logging.getLogger(__name__)

_ICON_TO_WMO: dict[str, int] = {
    "clear-day": 0,
    "clear-night": 0,
    "partly-cloudy-day": 2,
    "partly-cloudy-night": 2,
    "cloudy": 3,
    "fog": 45,
    "wind": 1,
    "rain": 63,
    "sleet": 68,
    "snow": 73,
    "hail": 89,
    "thunderstorm": 95,
    "tornado": 99,
}


class PirateWeatherProvider(ForecastProvider):
    """Pirate Weather provider. Free tier available, API key required."""

    PROVIDER_ID = "pirate_weather"
    PROVIDER_NAME = "Pirate Weather"
    REQUIRES_API_KEY = True

    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        lat: float,
        lon: float,
        api_key: str | None = None,
    ) -> dict[str, Any]:
        if not api_key:
            raise ValueError("Pirate Weather requires an API key")

        url = f"https://api.pirateweather.net/forecast/{api_key}/{lat},{lon}?units=si&exclude=minutely,alerts,flags"
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=20)) as resp:
            if resp.status == 403:
                raise ValueError("Pirate Weather: invalid or unauthorized API key")
            if resp.status == 429:
                raise ValueError("Pirate Weather: API rate limit exceeded")
            if resp.status != 200:
                raise aiohttp.ClientResponseError(resp.request_info, resp.history, status=resp.status)
            js = await resp.json(content_type=None)

        # Daily
        daily_out: list[dict[str, Any]] = []
        for day in (js.get("daily", {}).get("data") or [])[:7]:
            dt = day.get("time", 0)
            date_str = datetime.fromtimestamp(dt, tz=UTC).strftime("%Y-%m-%d")
            daily_out.append(
                {
                    "date": date_str,
                    "tmax_c": day.get("temperatureHigh"),
                    "tmin_c": day.get("temperatureLow"),
                    "precip_mm": day.get("precipAccumulation", 0.0),
                    "wind_kmh": round(day.get("windSpeed", 0) * 3.6, 1),
                    "gust_kmh": round(day.get("windGust", 0) * 3.6, 1) if day.get("windGust") else None,
                    "weathercode": _ICON_TO_WMO.get(day.get("icon", "")),
                    "precip_prob": int(day.get("precipProbability", 0) * 100),
                }
            )

        # Hourly
        hourly_out: list[dict[str, Any]] = []
        for hour in (js.get("hourly", {}).get("data") or [])[:24]:
            dt = hour.get("time", 0)
            dt_str = datetime.fromtimestamp(dt, tz=UTC).strftime("%Y-%m-%dT%H:%M")
            hourly_out.append(
                {
                    "datetime": dt_str,
                    "temp_c": hour.get("temperature"),
                    "apparent_temp_c": hour.get("apparentTemperature"),
                    "dewpoint_c": hour.get("dewPoint"),
                    "precip_prob": int(hour.get("precipProbability", 0) * 100),
                    "precip_mm": hour.get("precipIntensity", 0.0),
                    "weathercode": _ICON_TO_WMO.get(hour.get("icon", "")),
                    "wind_kmh": round(hour.get("windSpeed", 0) * 3.6, 1),
                    "gust_kmh": round(hour.get("windGust", 0) * 3.6, 1) if hour.get("windGust") else None,
                    "humidity": (round(hour.get("humidity", 0) * 100, 1) if hour.get("humidity") is not None else None),
                    "cloud_cover": (
                        round(hour.get("cloudCover", 0) * 100, 1) if hour.get("cloudCover") is not None else None
                    ),
                }
            )

        return {"provider": self.PROVIDER_ID, "daily": daily_out, "hourly": hourly_out}
