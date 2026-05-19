"""Met.no (Norwegian Meteorological Institute) forecast provider.

Free, no API key required, global coverage.
API: https://api.met.no/weatherapi/locationforecast/2.0/compact
Requires a User-Agent header identifying the application.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

import aiohttp

from .base import ForecastProvider

_LOGGER = logging.getLogger(__name__)

# Met.no symbol code → approximate WMO weather code
_SYMBOL_TO_WMO: dict[str, int] = {
    "clearsky": 0,
    "fair": 1,
    "partlycloudy": 2,
    "cloudy": 3,
    "fog": 45,
    "lightrain": 61,
    "rain": 63,
    "heavyrain": 65,
    "lightrainshowers": 80,
    "rainshowers": 81,
    "heavyrainshowers": 82,
    "lightsleet": 68,
    "sleet": 68,
    "heavysleet": 69,
    "lightsnow": 71,
    "snow": 73,
    "heavysnow": 75,
    "lightsnowshowers": 85,
    "snowshowers": 86,
    "heavysnowshowers": 86,
    "thunder": 95,
    "lightrainandthunder": 95,
    "rainandthunder": 95,
    "heavyrainandthunder": 96,
    "lightsleetandthunder": 95,
    "sleetandthunder": 95,
    "lightsnowandthunder": 95,
    "snowandthunder": 95,
}


def _symbol_to_wmo(symbol: str | None) -> int | None:
    """Convert a Met.no symbol_code to an approximate WMO code."""
    if not symbol:
        return None
    # Strip time-of-day suffix (_day, _night, _polartwilight)
    base = symbol.split("_")[0]
    return _SYMBOL_TO_WMO.get(base)


class MetNoProvider(ForecastProvider):
    """Forecast provider backed by Met.no (free, no API key, global)."""

    PROVIDER_ID = "met_no"
    PROVIDER_NAME = "Met.no"
    REQUIRES_API_KEY = False

    _USER_AGENT = "ha_ws_core/1.2.0 github.com/kmich/ha_ws_core"

    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        lat: float,
        lon: float,
        api_key: str | None = None,
    ) -> dict[str, Any]:
        url = f"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat={lat:.4f}&lon={lon:.4f}"
        headers = {"User-Agent": self._USER_AGENT}
        async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=20)) as resp:
            if resp.status != 200:
                raise aiohttp.ClientResponseError(resp.request_info, resp.history, status=resp.status)
            js = await resp.json(content_type=None)

        timeseries = js.get("properties", {}).get("timeseries", [])

        # Build hourly list (next 24h from now)
        now = datetime.now(tz=UTC)
        hourly_out: list[dict[str, Any]] = []
        daily_by_date: dict[str, list[dict[str, Any]]] = {}

        for entry in timeseries:
            time_str = entry.get("time", "")
            try:
                dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
            except ValueError:
                continue

            data = entry.get("data", {})
            instant = data.get("instant", {}).get("details", {})
            next1 = data.get("next_1_hours", {})
            next6 = data.get("next_6_hours", {})

            temp_c = instant.get("air_temperature")
            humidity = instant.get("relative_humidity")
            wind_ms = instant.get("wind_speed")
            wind_kmh = round(wind_ms * 3.6, 1) if wind_ms is not None else None
            dew_c = instant.get("dew_point_temperature")
            cloud = instant.get("cloud_area_fraction")

            # Precipitation from next_1_hours if available, else next_6_hours / 6
            precip_mm: float | None = None
            symbol: str | None = None
            if next1:
                precip_mm = next1.get("details", {}).get("precipitation_amount")
                symbol = next1.get("summary", {}).get("symbol_code")
            elif next6:
                p6 = next6.get("details", {}).get("precipitation_amount")
                precip_mm = round(p6 / 6, 2) if p6 is not None else None
                symbol = next6.get("summary", {}).get("symbol_code")

            wmo = _symbol_to_wmo(symbol)
            date_str = dt.strftime("%Y-%m-%d")

            # Hourly: only take entries within next 24 h
            delta_h = (dt - now).total_seconds() / 3600
            if 0 <= delta_h < 24 and len(hourly_out) < 24:
                hourly_out.append(
                    {
                        "datetime": dt.strftime("%Y-%m-%dT%H:%M"),
                        "temp_c": temp_c,
                        "apparent_temp_c": None,  # not provided by Met.no
                        "dewpoint_c": dew_c,
                        "precip_prob": None,  # not provided by Met.no
                        "precip_mm": precip_mm,
                        "weathercode": wmo,
                        "wind_kmh": wind_kmh,
                        "gust_kmh": None,  # not in compact endpoint
                        "humidity": humidity,
                        "cloud_cover": cloud,
                    }
                )

            # Accumulate into daily buckets (up to 7 days)
            if date_str not in daily_by_date and len(daily_by_date) < 7:
                daily_by_date[date_str] = []
            if date_str in daily_by_date:
                daily_by_date[date_str].append(
                    {
                        "temp_c": temp_c,
                        "precip_mm": precip_mm,
                        "wind_kmh": wind_kmh,
                        "wmo": wmo,
                    }
                )

        # Aggregate daily buckets
        daily_out: list[dict[str, Any]] = []
        for date_str, slots in list(daily_by_date.items())[:7]:
            temps = [s["temp_c"] for s in slots if s["temp_c"] is not None]
            precips = [s["precip_mm"] for s in slots if s["precip_mm"] is not None]
            winds = [s["wind_kmh"] for s in slots if s["wind_kmh"] is not None]
            wmos = [s["wmo"] for s in slots if s["wmo"] is not None]
            daily_out.append(
                {
                    "date": date_str,
                    "tmax_c": max(temps) if temps else None,
                    "tmin_c": min(temps) if temps else None,
                    "precip_mm": round(sum(precips), 1) if precips else None,
                    "wind_kmh": round(max(winds), 1) if winds else None,
                    "gust_kmh": None,
                    "weathercode": max(wmos) if wmos else None,  # most severe
                    "precip_prob": None,  # Met.no compact does not provide probability
                }
            )

        return {
            "provider": self.PROVIDER_ID,
            "daily": daily_out,
            "hourly": hourly_out,
        }
