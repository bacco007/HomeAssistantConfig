"""Météo France forecast provider via the Météo Concept API (API key required)."""

from __future__ import annotations

import logging
from typing import Any

import aiohttp

from .base import ForecastProvider

_LOGGER = logging.getLogger(__name__)

# Météo Concept integer weather codes -> nearest WMO equivalent
# Full code table: https://api.meteo-concept.com/documentation
_MF_TO_WMO: dict[int, int] = {
    0: 0,  # Soleil -> clear sky
    1: 1,  # Peu nuageux -> mainly clear
    2: 2,  # Ciel voilé -> partly cloudy
    3: 2,  # Nuageux -> partly cloudy
    4: 3,  # Très nuageux -> overcast
    5: 3,  # Couvert -> overcast
    6: 45,  # Brouillard -> fog
    7: 48,  # Brouillard givrant -> depositing rime fog
    10: 61,  # Pluie faible -> slight rain
    11: 63,  # Pluie modérée -> moderate rain
    12: 65,  # Pluie forte -> heavy rain
    13: 66,  # Pluie faible verglaçante -> light freezing rain
    14: 67,  # Pluie modérée verglaçante -> heavy freezing rain
    15: 67,  # Pluie forte verglaçante -> heavy freezing rain
    16: 51,  # Bruine -> drizzle
    20: 71,  # Neige faible -> slight snow
    21: 73,  # Neige modérée -> moderate snow
    22: 75,  # Neige forte -> heavy snow
    30: 77,  # Pluie et neige faibles -> snow grains / mixed
    31: 77,  # Pluie et neige modérées
    32: 77,  # Pluie et neige fortes
    40: 80,  # Averses pluie locales peu fréquentes -> slight rain showers
    41: 80,
    42: 81,  # Averses locales fréquentes -> moderate rain showers
    43: 80,
    44: 81,
    45: 82,  # Averses fréquentes -> violent rain showers
    46: 80,
    47: 80,
    48: 81,
    60: 85,  # Averses neige locales -> slight snow showers
    61: 85,
    62: 86,
    63: 85,
    64: 85,
    65: 86,
    66: 85,
    67: 85,
    68: 86,
    70: 77,  # Averses pluie/neige mêlées
    71: 77,
    72: 77,
    73: 77,
    74: 77,
    75: 77,
    100: 95,  # Orages faibles -> slight thunderstorm
    101: 95,
    102: 96,  # Orages forts -> thunderstorm with hail
    103: 95,
    104: 95,
    105: 96,
    106: 96,  # Orages + risque grêle
    107: 96,
    200: 45,  # Brouillard (duplicate code)
    201: 48,  # Brouillard givrant (duplicate code)
}


class MeteoFranceProvider(ForecastProvider):
    """Météo France provider via Météo Concept API. API key required (free tier available)."""

    PROVIDER_ID = "meteo_france"
    PROVIDER_NAME = "Météo France"
    REQUIRES_API_KEY = True

    _BASE_URL = "https://api.meteo-concept.com/api"

    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        lat: float,
        lon: float,
        api_key: str | None = None,
    ) -> dict[str, Any]:
        if not api_key:
            raise ValueError("Météo France requires an API key (Météo Concept token)")

        headers = {"Authorization": f"Bearer {api_key}"}
        params = {"latlng": f"{lat},{lon}"}

        daily_url = f"{self._BASE_URL}/forecast/daily"
        hourly_url = f"{self._BASE_URL}/forecast/hourly"

        async with session.get(
            daily_url, headers=headers, params=params, timeout=aiohttp.ClientTimeout(total=20)
        ) as resp:
            if resp.status == 401:
                raise ValueError("Météo France: invalid or unauthorized API key")
            if resp.status == 429:
                raise ValueError("Météo France: API rate limit exceeded")
            if resp.status != 200:
                raise aiohttp.ClientResponseError(resp.request_info, resp.history, status=resp.status)
            daily_data = await resp.json(content_type=None)

        async with session.get(
            hourly_url, headers=headers, params=params, timeout=aiohttp.ClientTimeout(total=20)
        ) as resp:
            if resp.status == 401:
                raise ValueError("Météo France: invalid or unauthorized API key")
            if resp.status == 429:
                raise ValueError("Météo France: API rate limit exceeded")
            if resp.status != 200:
                raise aiohttp.ClientResponseError(resp.request_info, resp.history, status=resp.status)
            hourly_data = await resp.json(content_type=None)

        daily_out: list[dict[str, Any]] = []
        for d in (daily_data.get("forecast") or [])[:7]:
            mf_code = d.get("weather")
            daily_out.append(
                {
                    "date": d.get("datetime"),
                    "tmax_c": d.get("tmax"),
                    "tmin_c": d.get("tmin"),
                    "precip_mm": d.get("rr10"),
                    "wind_kmh": round(d.get("wind10m", 0) * 3.6, 1) if d.get("wind10m") is not None else None,
                    "gust_kmh": round(d.get("gust10m", 0) * 3.6, 1) if d.get("gust10m") is not None else None,
                    "weathercode": _MF_TO_WMO.get(mf_code) if mf_code is not None else None,
                    "precip_prob": d.get("probarain"),
                }
            )

        hourly_out: list[dict[str, Any]] = []
        for h in (hourly_data.get("forecast") or [])[:24]:
            mf_code = h.get("weather")
            hourly_out.append(
                {
                    "datetime": h.get("datetime"),
                    "temp_c": h.get("temp2m"),
                    "apparent_temp_c": None,  # not provided by Météo Concept
                    "dewpoint_c": None,  # not provided by Météo Concept
                    "precip_prob": h.get("probarain"),
                    "precip_mm": h.get("rr1"),
                    "weathercode": _MF_TO_WMO.get(mf_code) if mf_code is not None else None,
                    "wind_kmh": round(h.get("wind10m", 0) * 3.6, 1) if h.get("wind10m") is not None else None,
                    "gust_kmh": round(h.get("gust10m", 0) * 3.6, 1) if h.get("gust10m") is not None else None,
                    "humidity": h.get("rh2m"),
                    "cloud_cover": h.get("nebulosity"),
                }
            )

        return {"provider": self.PROVIDER_ID, "daily": daily_out, "hourly": hourly_out}
