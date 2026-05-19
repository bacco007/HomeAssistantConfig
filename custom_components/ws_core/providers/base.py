"""Abstract base class for forecast providers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

import aiohttp


class ForecastProvider(ABC):
    """Abstract base for weather forecast providers.

    To add a new provider:
      1. Subclass ForecastProvider in a new file under providers/
      2. Set PROVIDER_ID (snake_case), PROVIDER_NAME (display name), REQUIRES_API_KEY
      3. Implement async_fetch() returning the normalized dict format below
      4. Register in providers/__init__.py PROVIDERS dict

    Normalized return format from async_fetch():
    {
        "provider": str,          # matches PROVIDER_ID
        "daily": [                # exactly 7 entries
            {
                "date": str,          # ISO date "YYYY-MM-DD"
                "tmax_c": float|None,
                "tmin_c": float|None,
                "precip_mm": float|None,
                "wind_kmh": float|None,
                "gust_kmh": float|None,
                "weathercode": int|None,   # WMO code; None if provider doesn't supply
                "precip_prob": int|None,   # 0-100 %; None if not available
            },
            ...
        ],
        "hourly": [               # up to 24 entries (next 24 h)
            {
                "datetime": str,       # ISO datetime "YYYY-MM-DDTHH:MM"
                "temp_c": float|None,
                "apparent_temp_c": float|None,
                "dewpoint_c": float|None,
                "precip_prob": int|None,
                "precip_mm": float|None,
                "weathercode": int|None,
                "wind_kmh": float|None,
                "gust_kmh": float|None,
                "humidity": float|None,
                "cloud_cover": float|None,
            },
            ...
        ],
    }
    """

    PROVIDER_ID: str = ""
    PROVIDER_NAME: str = ""
    REQUIRES_API_KEY: bool = False

    @abstractmethod
    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        lat: float,
        lon: float,
        api_key: str | None = None,
    ) -> dict[str, Any]:
        """Fetch forecast and return normalized dict."""
