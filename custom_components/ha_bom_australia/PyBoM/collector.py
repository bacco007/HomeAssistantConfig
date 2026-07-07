"""BOM data 'collector' that downloads the observation data."""
from __future__ import annotations

import aiohttp
import asyncio
import logging
import math
import time
from typing import Any

from .const import (
    MAP_MDI_ICON, URL_BASE, URL_DAILY, apply_day_night,
    URL_HOURLY, URL_OBSERVATIONS, URL_WARNINGS,
    USER_AGENT
)
from .helpers import (
    flatten_dict, geohash_encode,
)

_LOGGER = logging.getLogger(__name__)

# Constants for retry mechanism
MAX_RETRIES = 3
RETRY_DELAY_BASE = 2  # seconds
MAX_CACHE_AGE = 86400  # 24 hours in seconds

class Collector:
    """Collector for PyBoM."""

    def __init__(self, latitude: float, longitude: float, geohash: str | None = None) -> None:
        """Init collector.

        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            geohash: Optional BOM-provided geohash. If provided, this will be used
                    instead of calculating one. This ensures we use the exact same
                    geohash that BOM's location search returns, which may differ
                    slightly from calculated values. Will be truncated to 6 chars
                    if longer, as observations/hourly endpoints require exactly 6.
        """
        self.latitude = latitude
        self.longitude = longitude
        self.locations_data = None
        self.observations_data = None
        self.daily_forecasts_data = None
        self.hourly_forecasts_data = None
        self.warnings_data = None

        # Use provided geohash if available, otherwise calculate it
        if geohash:
            # BOM postcode search returns 7-char geohashes, but observations and
            # hourly endpoints require exactly 6 chars. Truncate if necessary.
            self.geohash = geohash[:6]
        else:
            # BOM API has inconsistent geohash requirements:
            # - Hourly forecasts: requires 6-character geohash
            # - Daily forecasts/warnings: accepts 6 or 7-character geohash
            # We use 6-char as the common denominator when calculating
            self.geohash = geohash_encode(latitude, longitude, precision=6)
        # Cache storage with timestamps
        self._cache = {
            "locations": {"data": None, "timestamp": 0},
            "observations": {"data": None, "timestamp": 0},
            "daily_forecasts": {"data": None, "timestamp": 0},
            "hourly_forecasts": {"data": None, "timestamp": 0},
            "warnings": {"data": None, "timestamp": 0},
        }

    async def _fetch_with_retry(self, session: aiohttp.ClientSession, url: str, cache_key: str) -> dict[str, Any] | None:
        """Fetch data with retry mechanism and store in cache if successful."""
        for attempt in range(MAX_RETRIES):
            try:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        # Update cache with new data and timestamp
                        self._cache[cache_key]["data"] = data
                        self._cache[cache_key]["timestamp"] = time.time()
                        return data
                    else:
                        _LOGGER.warning(
                            f"Error requesting API data from {url}: {response.status}"
                        )
            except (aiohttp.ClientError, asyncio.TimeoutError) as err:
                wait_time = RETRY_DELAY_BASE ** attempt
                _LOGGER.warning(
                    f"Attempt {attempt+1}/{MAX_RETRIES} failed: {err}. "
                    f"Retrying in {wait_time} seconds..."
                )
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(wait_time)
                else:
                    _LOGGER.error(
                        f"Error requesting API data: {err}. "
                        "Using cached data if available."
                    )
                    # Return cached data if available
                    cached = self._cache[cache_key]["data"]
                    if cached is not None:
                        cache_age = time.time() - self._cache[cache_key]["timestamp"]
                        _LOGGER.info(
                            f"Returning cached {cache_key} data from {int(cache_age/60)} minutes ago"
                        )
                        return cached
                    else:
                        _LOGGER.error(f"No cached {cache_key} data available")
                        return None
        return None

    async def get_locations_data(self) -> None:
        """Get JSON location name from BOM API endpoint."""
        headers = {"User-Agent": USER_AGENT}
        try:
            async with aiohttp.ClientSession(headers=headers) as session:
                data = await self._fetch_with_retry(
                    session, URL_BASE + self.geohash, "locations"
                )
                if data:
                    self.locations_data = data
        except Exception as err:
            _LOGGER.error(f"Unexpected error in get_locations_data: {err}")

    async def format_daily_forecast_data(self) -> None:
        """Format forecast data."""
        if not self.daily_forecasts_data or "data" not in self.daily_forecasts_data:
            _LOGGER.warning("No daily forecast data to format")
            return
            
        days = len(self.daily_forecasts_data["data"])
        for day in range(0, days):
            d = self.daily_forecasts_data["data"][day]

            flatten_dict(["amount"], d["rain"])
            flatten_dict(["rain", "uv", "astronomical"], d)

            if day == 0:
                # Extract 'now' fields with cleaner naming (BOM API has redundant prefixes/suffixes)
                now_data = d.pop("now", {})
                if now_data:
                    # Extract with cleaner names (removing redundant now_ prefix from BOM API)
                    d["now_label"] = now_data.get("now_label")
                    d["temp_now"] = now_data.get("temp_now")
                    d["later_label"] = now_data.get("later_label")
                    d["temp_later"] = now_data.get("temp_later")
                    is_night = now_data.get("is_night")
                else:
                    is_night = False
                d["icon_descriptor"] = apply_day_night(d.get("icon_descriptor"), is_night)

            d["mdi_icon"] = MAP_MDI_ICON.get(d.get("icon_descriptor"))

            # If rain amount max is None, set as rain amount min
            if d["rain_amount_max"] is None:
                d["rain_amount_max"] = d["rain_amount_min"]
                d["rain_amount_range"] = d["rain_amount_min"]
            else:
                d["rain_amount_range"] = f"{d['rain_amount_min']}–{d['rain_amount_max']}"


    async def format_hourly_forecast_data(self) -> None:
        """Format forecast data."""
        if not self.hourly_forecasts_data or "data" not in self.hourly_forecasts_data:
            _LOGGER.warning("No hourly forecast data to format")
            return
            
        hours = len(self.hourly_forecasts_data["data"])
        for hour in range(0, hours):
            d = self.hourly_forecasts_data["data"][hour]

            d["icon_descriptor"] = apply_day_night(
                d.get("icon_descriptor"), d.get("is_night")
            )

            d["mdi_icon"] = MAP_MDI_ICON.get(d.get("icon_descriptor"))

            flatten_dict(["amount"], d["rain"])
            flatten_dict(["rain", "wind"], d)

            # If rain amount max is None, set as rain amount min
            if d["rain_amount_max"] is None:
                d["rain_amount_max"] = d["rain_amount_min"]
                d["rain_amount_range"] = d["rain_amount_min"]
            else:
                d["rain_amount_range"] = f"{d['rain_amount_min']} to {d['rain_amount_max']}"

    async def async_update(self) -> None:
        """Refresh the data on the collector object."""
        headers = {"User-Agent": USER_AGENT}
        
        try:
            async with aiohttp.ClientSession(headers=headers) as session:
                # Get location data if not already available
                if self.locations_data is None:
                    data = await self._fetch_with_retry(
                        session, URL_BASE + self.geohash, "locations"
                    )
                    if data:
                        self.locations_data = data
                
                # Get observations data
                data = await self._fetch_with_retry(
                    session, URL_BASE + self.geohash + URL_OBSERVATIONS, "observations"
                )
                if data:
                    self.observations_data = data
                    if self.observations_data["data"]["wind"] is not None:
                        flatten_dict(["wind"], self.observations_data["data"])
                    else:
                        self.observations_data["data"]["wind_direction"] = "unavailable"
                        self.observations_data["data"]["wind_speed_kilometre"] = "unavailable"
                        self.observations_data["data"]["wind_speed_knot"] = "unavailable"
                    if self.observations_data["data"]["gust"] is not None:
                        flatten_dict(["gust"], self.observations_data["data"])
                    else:
                        self.observations_data["data"]["gust_speed_kilometre"] = "unavailable"
                        self.observations_data["data"]["gust_speed_knot"] = "unavailable"

                    # Calculate dew point using Magnus-Tetens formula
                    temp = self.observations_data["data"].get("temp")
                    humidity = self.observations_data["data"].get("humidity")
                    if temp is not None and humidity is not None:
                        try:
                            # Magnus-Tetens approximation
                            a = 17.27
                            b = 237.7
                            gamma = (a * temp / (b + temp)) + math.log(humidity / 100.0)
                            dew_point = (b * gamma) / (a - gamma)
                            self.observations_data["data"]["dew_point"] = round(dew_point, 1)
                        except (TypeError, ValueError, ZeroDivisionError) as err:
                            _LOGGER.debug(f"Error calculating dew point: {err}")
                            self.observations_data["data"]["dew_point"] = None
                    else:
                        self.observations_data["data"]["dew_point"] = None

                    # Calculate Delta-T (temperature - dew point)
                    temp = self.observations_data["data"].get("temp")
                    dew_point = self.observations_data["data"].get("dew_point")
                    if temp is not None and dew_point is not None:
                        try:
                            self.observations_data["data"]["delta_t"] = round(temp - dew_point, 1)
                        except (TypeError, ValueError):
                            self.observations_data["data"]["delta_t"] = None
                    else:
                        self.observations_data["data"]["delta_t"] = None

                # Get daily forecast data
                data = await self._fetch_with_retry(
                    session, URL_BASE + self.geohash + URL_DAILY, "daily_forecasts"
                )
                if data:
                    self.daily_forecasts_data = data
                    await self.format_daily_forecast_data()

                # Get hourly forecast data
                data = await self._fetch_with_retry(
                    session, URL_BASE + self.geohash + URL_HOURLY, "hourly_forecasts"
                )
                if data:
                    self.hourly_forecasts_data = data
                    await self.format_hourly_forecast_data()

                # Get warnings data
                data = await self._fetch_with_retry(
                    session, URL_BASE + self.geohash + URL_WARNINGS, "warnings"
                )
                if data:
                    self.warnings_data = data
                    
        except Exception as err:
            _LOGGER.error(f"Unexpected error during async_update: {err}")
            # Even if we have an unexpected error, we still have our cached data
