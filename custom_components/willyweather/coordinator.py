"""DataUpdateCoordinator for WillyWeather."""
from __future__ import annotations

import asyncio
from datetime import timedelta
import logging
from typing import TYPE_CHECKING, Any

import aiohttp
import async_timeout

from homeassistant.const import CONF_API_KEY
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .const import (
    API_BASE_URL,
    API_TIMEOUT,
    CONF_STATION_ID,
    CONF_INCLUDE_OBSERVATIONAL,
    CONF_INCLUDE_UV,
    CONF_INCLUDE_TIDES,
    CONF_INCLUDE_WIND,
    CONF_INCLUDE_SWELL,
    CONF_INCLUDE_WARNINGS,
    CONF_INCLUDE_FORECAST_SENSORS,
    CONF_INCLUDE_EXTENDED_FORECAST,
    CONF_FORECAST_DAYS,
    CONF_UPDATE_INTERVAL_DAY,
    CONF_UPDATE_INTERVAL_NIGHT,
    CONF_FORECAST_UPDATE_INTERVAL_DAY,
    CONF_FORECAST_UPDATE_INTERVAL_NIGHT,
    CONF_NIGHT_START_HOUR,
    CONF_NIGHT_END_HOUR,
    DEFAULT_UPDATE_INTERVAL_DAY,
    DEFAULT_UPDATE_INTERVAL_NIGHT,
    DEFAULT_FORECAST_UPDATE_INTERVAL_DAY,
    DEFAULT_FORECAST_UPDATE_INTERVAL_NIGHT,
    DEFAULT_NIGHT_START_HOUR,
    DEFAULT_NIGHT_END_HOUR,
    DOMAIN,
    UPDATE_INTERVAL_OBSERVATION,
)

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)


class WillyWeatherDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching WillyWeather data from the API."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize."""
        self.hass = hass
        self.entry = entry
        self.api_key = entry.data[CONF_API_KEY]
        self.station_id = entry.data[CONF_STATION_ID]
        self._session = aiohttp.ClientSession()
        self._last_forecast_fetch: dt_util.dt.datetime | None = None

        _LOGGER.debug(
            "Initializing WillyWeather coordinator for station %s",
            self.station_id,
        )

        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_{self.station_id}",
            update_interval=self._get_update_interval(),
        )

    def _get_update_interval(self) -> timedelta:
        """Get observational update interval based on time of day."""
        # Get configuration values
        interval_day = self.entry.options.get(CONF_UPDATE_INTERVAL_DAY, DEFAULT_UPDATE_INTERVAL_DAY)
        interval_night = self.entry.options.get(CONF_UPDATE_INTERVAL_NIGHT, DEFAULT_UPDATE_INTERVAL_NIGHT)
        night_start = self.entry.options.get(CONF_NIGHT_START_HOUR, DEFAULT_NIGHT_START_HOUR)
        night_end = self.entry.options.get(CONF_NIGHT_END_HOUR, DEFAULT_NIGHT_END_HOUR)

        now = dt_util.now()
        current_hour = now.hour

        # Check if we're in night time
        if night_start > night_end:  # Night crosses midnight (e.g., 21:00 to 07:00)
            is_night = current_hour >= night_start or current_hour < night_end
        else:  # Night doesn't cross midnight (e.g., 01:00 to 06:00)
            is_night = night_start <= current_hour < night_end

        interval = interval_night if is_night else interval_day
        _LOGGER.debug(
            "Observational update interval: %s minutes (night mode: %s, current hour: %s)",
            interval,
            is_night,
            current_hour,
        )
        return timedelta(minutes=interval)

    def _get_forecast_update_interval(self) -> timedelta:
        """Get forecast update interval based on time of day."""
        # Get configuration values
        interval_day = self.entry.options.get(CONF_FORECAST_UPDATE_INTERVAL_DAY, DEFAULT_FORECAST_UPDATE_INTERVAL_DAY)
        interval_night = self.entry.options.get(CONF_FORECAST_UPDATE_INTERVAL_NIGHT, DEFAULT_FORECAST_UPDATE_INTERVAL_NIGHT)
        night_start = self.entry.options.get(CONF_NIGHT_START_HOUR, DEFAULT_NIGHT_START_HOUR)
        night_end = self.entry.options.get(CONF_NIGHT_END_HOUR, DEFAULT_NIGHT_END_HOUR)

        now = dt_util.now()
        current_hour = now.hour

        # Check if we're in night time
        if night_start > night_end:  # Night crosses midnight (e.g., 21:00 to 07:00)
            is_night = current_hour >= night_start or current_hour < night_end
        else:  # Night doesn't cross midnight (e.g., 01:00 to 06:00)
            is_night = night_start <= current_hour < night_end

        interval = interval_night if is_night else interval_day
        _LOGGER.debug(
            "Forecast update interval: %s minutes (night mode: %s, current hour: %s)",
            interval,
            is_night,
            current_hour,
        )
        return timedelta(minutes=interval)

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from API."""
        # Dynamically adjust update interval based on time of day
        new_interval = self._get_update_interval()
        if new_interval != self.update_interval:
            _LOGGER.info("Adjusting observational update interval to %s", new_interval)
            self.update_interval = new_interval

        _LOGGER.debug("Updating WillyWeather data for station %s", self.station_id)

        try:
            # Always fetch observational data
            observational_data = await self._fetch_observational_data()

            # Determine if we need to fetch forecast data
            now = dt_util.utcnow()
            forecast_interval = self._get_forecast_update_interval()
            should_fetch_forecast = (
                self._last_forecast_fetch is None
                or (now - self._last_forecast_fetch) >= forecast_interval
            )

            forecast_data = None
            if should_fetch_forecast:
                _LOGGER.info("Fetching forecast data (interval elapsed)")
                # Build forecast parameters based on enabled options
                forecast_types = [
                    "weather",
                    "sunrisesunset",
                    "moonphases",
                    "rainfall",
                    "temperature",
                ]

                include_wind = self.entry.options.get(CONF_INCLUDE_WIND, True)
                include_tides = self.entry.options.get(CONF_INCLUDE_TIDES, False)
                include_uv = self.entry.options.get(CONF_INCLUDE_UV, False)
                include_swell = self.entry.options.get(CONF_INCLUDE_SWELL, False)

                _LOGGER.debug("Options - Wind: %s, Tides: %s, UV: %s, Swell: %s",
                             include_wind, include_tides, include_uv, include_swell)

                if include_wind:
                    forecast_types.append("wind")
                    _LOGGER.debug("Added wind to forecast types")
                if include_tides:
                    forecast_types.append("tides")
                    _LOGGER.debug("Added tides to forecast types")
                if include_uv:
                    forecast_types.append("uv")
                if include_swell:
                    forecast_types.append("swell")
                    _LOGGER.debug("Added swell to forecast types")

                _LOGGER.debug("Final forecast types: %s", forecast_types)

                forecast_data = await self._fetch_forecast_data(forecast_types)
                self._last_forecast_fetch = now

                # Fetch regionPrecis data separately (optional extra API call)
                # Only fetch when extended forecast text is enabled
                include_extended_forecast = self.entry.options.get(CONF_INCLUDE_EXTENDED_FORECAST, False)

                if include_extended_forecast:
                    # Fetch 1 day for the forecast_summary observational sensor
                    num_days = 1
                    region_precis = await self._fetch_region_precis(num_days)
                    if region_precis and forecast_data:
                        forecast_data["regionPrecis"] = region_precis
                        _LOGGER.debug("Added regionPrecis data to forecast (%d days)", num_days)

                # Log what we got back
                if forecast_data and "forecasts" in forecast_data:
                    available_forecasts = list(forecast_data["forecasts"].keys())
                    _LOGGER.debug("Available forecasts in response: %s", available_forecasts)
            else:
                # Reuse previous forecast data
                _LOGGER.debug("Skipping forecast fetch (using cached data)")
                if self.data and "forecast" in self.data:
                    forecast_data = self.data["forecast"]
                else:
                    # First run and no cached data, fetch it anyway
                    _LOGGER.info("No cached forecast data, fetching now")
                    forecast_types = [
                        "weather",
                        "sunrisesunset",
                        "moonphases",
                        "rainfall",
                        "temperature",
                    ]

                    include_wind = self.entry.options.get(CONF_INCLUDE_WIND, True)
                    include_tides = self.entry.options.get(CONF_INCLUDE_TIDES, False)
                    include_uv = self.entry.options.get(CONF_INCLUDE_UV, False)
                    include_swell = self.entry.options.get(CONF_INCLUDE_SWELL, False)

                    if include_wind:
                        forecast_types.append("wind")
                    if include_tides:
                        forecast_types.append("tides")
                    if include_uv:
                        forecast_types.append("uv")
                    if include_swell:
                        forecast_types.append("swell")

                    forecast_data = await self._fetch_forecast_data(forecast_types)
                    self._last_forecast_fetch = now

                    # Fetch regionPrecis data separately (first run, optional extra API call)
                    # Only fetch when extended forecast text is enabled
                    include_extended_forecast = self.entry.options.get(CONF_INCLUDE_EXTENDED_FORECAST, False)

                    if include_extended_forecast:
                        # Fetch 1 day for the forecast_summary observational sensor
                        num_days = 1
                        region_precis = await self._fetch_region_precis(num_days)
                        if region_precis and forecast_data:
                            forecast_data["regionPrecis"] = region_precis
                            _LOGGER.debug("Added regionPrecis data to forecast (%d days, first run)", num_days)

            # Fetch warning data if enabled
            warning_data = None
            if self.entry.options.get(CONF_INCLUDE_WARNINGS, False):
                warning_data = await self._fetch_warning_data()

            _LOGGER.debug("Successfully fetched data from WillyWeather API")

            return {
                "observational": observational_data,
                "forecast": forecast_data,
                "warnings": warning_data,
                "last_update": dt_util.utcnow(),
            }

        except aiohttp.ClientResponseError as err:
            _LOGGER.error(
                "HTTP error %s when fetching data: %s",
                err.status,
                err.message,
            )
            raise UpdateFailed(f"HTTP error {err.status}: {err.message}") from err
        except aiohttp.ClientError as err:
            _LOGGER.error("Network error when fetching data: %s", err)
            raise UpdateFailed(f"Network error: {err}") from err
        except Exception as err:
            _LOGGER.error("Unexpected error when fetching data: %s", err, exc_info=True)
            raise UpdateFailed(f"Unexpected error: {err}") from err

    async def _fetch_observational_data(self) -> dict[str, Any]:
        """Fetch observational weather data."""
        url = f"{API_BASE_URL}/{self.api_key}/locations/{self.station_id}/weather.json"
        params = {
            "observational": "true",
            "units": "distance:km,temperature:c,amount:mm,speed:km/h,pressure:hpa,tideHeight:m,swellHeight:m",
        }

        _LOGGER.debug("Fetching observational data from: %s", url)

        try:
            async with async_timeout.timeout(API_TIMEOUT):
                async with self._session.get(url, params=params) as response:
                    response_text = await response.text()
                    
                    if response.status == 401:
                        _LOGGER.error("API key is invalid (401 Unauthorized)")
                        raise UpdateFailed("Invalid API key")
                    elif response.status == 403:
                        _LOGGER.error("API key does not have access (403 Forbidden)")
                        raise UpdateFailed("API key access denied")
                    elif response.status == 404:
                        _LOGGER.error("Station ID %s not found (404)", self.station_id)
                        raise UpdateFailed(f"Station ID {self.station_id} not found")
                    elif response.status == 400:
                        _LOGGER.error("Bad request (400): %s", response_text[:500])
                        raise UpdateFailed(f"Bad request: {response_text[:200]}")
                    elif response.status != 200:
                        _LOGGER.error(
                            "Error fetching observational data: HTTP %s - %s",
                            response.status,
                            response_text[:500],
                        )
                        raise UpdateFailed(f"HTTP error {response.status}")
                    
                    data = await response.json()
                    obs_data = data.get("observational", {})
                    if not obs_data:
                        _LOGGER.warning("No observational data in response")
                    
                    return obs_data
                    
        except asyncio.TimeoutError as err:
            _LOGGER.error("Timeout fetching observational data")
            raise UpdateFailed("Request timeout") from err
        except aiohttp.ClientError as err:
            _LOGGER.error("Network error fetching observational data: %s", err)
            raise UpdateFailed(f"Network error: {err}") from err

    async def _fetch_forecast_data_simple(self, forecast_types: list[str]) -> dict[str, Any]:
        """Fetch forecast data without retry logic (used for fallback requests)."""
        url = f"{API_BASE_URL}/{self.api_key}/locations/{self.station_id}/weather.json"
        params = {
            "forecasts": ",".join(forecast_types),
            "days": "7",
            "units": "distance:km,temperature:c,amount:mm,speed:km/h,pressure:hpa,tideHeight:m,swellHeight:m",
        }

        _LOGGER.info("Retrying forecast fetch with core types only: %s", forecast_types)

        async with async_timeout.timeout(API_TIMEOUT):
            async with self._session.get(url, params=params) as response:
                if response.status != 200:
                    response_text = await response.text()
                    _LOGGER.error("Core forecast types also failed: HTTP %s - %s", response.status, response_text[:500])
                    raise UpdateFailed(f"Forecast fetch failed: HTTP {response.status}")

                data = await response.json()
                location = data.get("location", {})

                if "regionPrecis" in data:
                    _LOGGER.debug("Received regionPrecis data: %s", data["regionPrecis"].get("name"))

                return {
                    "location": location,
                    "forecasts": data.get("forecasts", {}),
                    "regionPrecis": data.get("regionPrecis", {}),
                    "timezone": location.get("timezone"),
                }

    async def _fetch_forecast_data(self, forecast_types: list[str]) -> dict[str, Any]:
        """Fetch forecast weather data.

        If optional forecast types (uv, tides, swell, wind) are not available on the API key,
        they will be automatically removed and the request retried with core types only.
        """
        url = f"{API_BASE_URL}/{self.api_key}/locations/{self.station_id}/weather.json"

        # Core forecast types that should always be available
        core_types = ["weather", "sunrisesunset", "moonphases", "rainfall", "temperature"]
        optional_types = ["uv", "tides", "swell", "wind"]

        params = {
            "forecasts": ",".join(forecast_types),
            "days": "7",
            "units": "distance:km,temperature:c,amount:mm,speed:km/h,pressure:hpa,tideHeight:m,swellHeight:m",
        }

        _LOGGER.debug("Fetching forecast data with types: %s", forecast_types)

        try:
            async with async_timeout.timeout(API_TIMEOUT):
                async with self._session.get(url, params=params) as response:
                    response_text = await response.text()

                    if response.status == 401:
                        _LOGGER.error("API key is invalid (401 Unauthorized)")
                        raise UpdateFailed("Invalid API key")
                    elif response.status == 403:
                        _LOGGER.error("API key does not have access (403 Forbidden)")
                        raise UpdateFailed("API key access denied")
                    elif response.status == 404:
                        _LOGGER.error("Station ID %s not found (404)", self.station_id)
                        raise UpdateFailed(f"Station ID {self.station_id} not found")
                    elif response.status == 400:
                        # Check if this is an invalid forecast parameter error
                        if "invalid-request-parameters" in response_text and any(t in forecast_types for t in optional_types):
                            # Retry with only core forecast types
                            _LOGGER.warning(
                                "Optional forecast types not available on API key. "
                                "Retrying with core types only. "
                                "To enable UV/tides/swell/wind forecasts, visit your WillyWeather API key settings."
                            )
                            # Remove optional types and retry
                            core_only = [t for t in forecast_types if t in core_types]
                            if core_only != forecast_types:
                                return await self._fetch_forecast_data_simple(core_only)
                        _LOGGER.error("Bad request (400): %s", response_text[:500])
                        raise UpdateFailed(f"Bad request: {response_text[:200]}")
                    elif response.status != 200:
                        _LOGGER.error(
                            "Error fetching forecast data: HTTP %s - %s",
                            response.status,
                            response_text[:500],
                        )
                        raise UpdateFailed(f"HTTP error {response.status}")

                    data = await response.json()
                    location = data.get("location", {})

                    # Log if we got regionPrecis data
                    if "regionPrecis" in data:
                        _LOGGER.debug("Received regionPrecis data: %s", data["regionPrecis"].get("name"))

                    return {
                        "location": location,
                        "forecasts": data.get("forecasts", {}),
                        "regionPrecis": data.get("regionPrecis", {}),
                        "timezone": location.get("timezone"),
                    }
                    
        except asyncio.TimeoutError as err:
            _LOGGER.error("Timeout fetching forecast data")
            raise UpdateFailed("Request timeout") from err
        except aiohttp.ClientError as err:
            _LOGGER.error("Network error fetching forecast data: %s", err)
            raise UpdateFailed(f"Network error: {err}") from err

    async def _fetch_region_precis(self, days: int = 5) -> dict[str, Any]:
        """Fetch regionPrecis data separately (requires x-payload header format)."""
        url = f"{API_BASE_URL}/{self.api_key}/locations/{self.station_id}/weather.json"

        # Get today's date in YYYY-MM-DD format
        today = dt_util.now().strftime("%Y-%m-%d")

        # RegionPrecis requires x-payload header with JSON object (not string)
        import json
        headers = {
            "Content-Type": "application/json",
            "x-payload": json.dumps({
                "regionPrecis": True,
                "days": days,
                "startDate": today,
            }),
        }

        _LOGGER.debug("Fetching regionPrecis data for %s days starting from %s", days, today)

        try:
            async with async_timeout.timeout(API_TIMEOUT):
                async with self._session.get(url, headers=headers) as response:
                    if response.status != 200:
                        response_text = await response.text()
                        _LOGGER.warning(
                            "Failed to fetch regionPrecis data: HTTP %s - %s",
                            response.status,
                            response_text[:200],
                        )
                        return {}

                    data = await response.json()
                    region_precis = data.get("regionPrecis", {})

                    if region_precis:
                        days = region_precis.get("days", [])
                        _LOGGER.info(
                            "Received regionPrecis data: %s with %s days",
                            region_precis.get("name"),
                            len(days)
                        )
                        # Log the structure to debug
                        if days:
                            _LOGGER.debug("First day structure: %s", days[0] if days else "none")
                        return region_precis
                    else:
                        _LOGGER.debug("No regionPrecis data available for this location")
                        return {}

        except asyncio.TimeoutError:
            _LOGGER.debug("Timeout fetching regionPrecis data")
            return {}
        except aiohttp.ClientError as err:
            _LOGGER.debug("Network error fetching regionPrecis data: %s", err)
            return {}

    async def _fetch_warning_data(self) -> dict[str, Any]:
        """Fetch warning data for location."""
        url = f"{API_BASE_URL}/{self.api_key}/locations/{self.station_id}/warnings.json"
        
        _LOGGER.debug("Fetching warning data from: %s", url)

        try:
            async with async_timeout.timeout(API_TIMEOUT):
                async with self._session.get(url) as response:
                    if response.status == 401:
                        _LOGGER.error("API key is invalid (401 Unauthorized)")
                        return {"warnings": []}
                    elif response.status == 403:
                        _LOGGER.error("API key does not have access (403 Forbidden)")
                        return {"warnings": []}
                    elif response.status == 404:
                        _LOGGER.debug("No warnings available for this location")
                        return {"warnings": []}
                    elif response.status != 200:
                        _LOGGER.debug(
                            "Warning data not available: HTTP %s",
                            response.status,
                        )
                        return {"warnings": []}
                    
                    data = await response.json()
                    _LOGGER.debug("Received warning data: %s", data)
                    
                    # API returns an array directly, not wrapped in an object
                    if isinstance(data, list):
                        return {"warnings": data}
                    else:
                        _LOGGER.warning("Unexpected warning data format: %s", type(data))
                        return {"warnings": []}
                    
        except asyncio.TimeoutError:
            _LOGGER.debug("Timeout fetching warning data")
            return {"warnings": []}
        except aiohttp.ClientError as err:
            _LOGGER.debug("Network error fetching warning data: %s", err)
            return {"warnings": []}

    async def async_shutdown(self) -> None:
        """Close the aiohttp session."""
        await self._session.close()


async def async_get_station_id(
    hass: HomeAssistant, lat: float, lng: float, api_key: str
) -> str | None:
    """Get the closest station ID based on coordinates."""
    url = f"{API_BASE_URL}/{api_key}/search.json"
    params = {
        "lat": lat,
        "lng": lng,
        "units": "distance:km",
    }

    _LOGGER.debug("Searching for station at lat=%s, lng=%s", lat, lng)

    try:
        # Use 30 second timeout for station search (one-time operation during setup)
        async with async_timeout.timeout(30):
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 401:
                        _LOGGER.error("API key is invalid (401 Unauthorized)")
                        return None
                    elif response.status == 403:
                        _LOGGER.error("API key does not have access (403 Forbidden)")
                        return None
                    elif response.status != 200:
                        _LOGGER.error(
                            "Error finding closest station: HTTP %s",
                            response.status,
                        )
                        return None

                    data = await response.json()
                    location = data.get("location")
                    if location:
                        station_id = str(location.get("id"))
                        station_name = location.get("name")
                        distance = location.get("distance")
                        _LOGGER.info(
                            "Found closest station: %s (ID: %s) at %.1f km",
                            station_name,
                            station_id,
                            distance if distance else 0,
                        )
                        return station_id
                    else:
                        _LOGGER.error("No location data in search response")
                        return None

    except asyncio.TimeoutError:
        _LOGGER.error("Timeout while searching for station (30s limit)")
        return None
    except aiohttp.ClientError as err:
        _LOGGER.error("Network error while searching for station: %s", err)
        return None
    except Exception as err:
        _LOGGER.error("Unexpected error finding closest station: %s", err, exc_info=True)
        return None


async def async_get_station_name(
    hass: HomeAssistant, station_id: str, api_key: str
) -> str | None:
    """Get the station name by fetching weather data."""
    url = f"{API_BASE_URL}/{api_key}/locations/{station_id}/weather.json"
    params = {
        "observational": "true",
        "units": "distance:km,temperature:c,amount:mm,speed:km/h,pressure:hpa",
    }

    _LOGGER.debug("Fetching station name for ID: %s", station_id)

    try:
        # Use 30 second timeout for station name fetch (one-time operation during setup)
        async with async_timeout.timeout(30):
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 401:
                        _LOGGER.error("API key is invalid (401 Unauthorized)")
                        return None
                    elif response.status == 403:
                        _LOGGER.error("API key does not have access (403 Forbidden)")
                        return None
                    elif response.status == 404:
                        _LOGGER.error("Station ID %s not found (404)", station_id)
                        return None
                    elif response.status != 200:
                        _LOGGER.error(
                            "Error fetching station info: HTTP %s",
                            response.status,
                        )
                        return None
                    
                    data = await response.json()
                    location = data.get("location", {})
                    station_name = location.get("name")
                    
                    if station_name:
                        _LOGGER.info("Station name: %s", station_name)
                        return station_name
                    else:
                        _LOGGER.warning("No station name found in response")
                        return f"Station {station_id}"
                    
    except asyncio.TimeoutError:
        _LOGGER.error("Timeout while fetching station info")
        return None
    except aiohttp.ClientError as err:
        _LOGGER.error("Network error while fetching station info: %s", err)
        return None
    except Exception as err:
        _LOGGER.error("Unexpected error fetching station info: %s", err, exc_info=True)
        return None
