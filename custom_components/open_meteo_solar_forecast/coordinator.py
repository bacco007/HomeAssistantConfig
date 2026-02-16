"""DataUpdateCoordinator for the Open-Meteo Solar Forecast integration."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY, CONF_LATITUDE, CONF_LONGITUDE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util
from open_meteo_solar_forecast import Estimate, OpenMeteoSolarForecast

from .const import (
    CONF_AZIMUTH,
    CONF_BASE_URL,
    CONF_DAMPING_EVENING,
    CONF_DAMPING_MORNING,
    CONF_DECLINATION,
    CONF_EFFICIENCY_FACTOR,
    CONF_MAX_FORECAST_AGE_MINUTES,
    CONF_INVERTER_POWER,
    CONF_USE_HORIZON,
    CONF_PARTIAL_SHADING,
    CONF_MODEL,
    CONF_MODULES_POWER,
    CONF_RETAIN_LATEST_FORECAST_WHEN_UNAVAILABLE,
    DOMAIN,
    LOGGER,
)

import numpy


def _is_sequence(value: Any) -> bool:
    return isinstance(value, Sequence) and not isinstance(value, (str, bytes))


def _normalize_array_value(value: Any, array_count: int, transform: Any = None) -> Any:
    """Normalize scalar or sequence values to scalar or list for the forecast API."""
    if _is_sequence(value):
        normalized = list(value)
        if len(normalized) == 1 and array_count > 1:
            normalized = normalized * array_count
        elif len(normalized) != array_count:
            raise ValueError(
                "Multi-array configuration has inconsistent list lengths "
                f"({len(normalized)} vs {array_count})."
            )
        if transform is not None:
            normalized = [transform(item) for item in normalized]
        return normalized

    if transform is not None:
        value = transform(value)

    if array_count > 1:
        return [value] * array_count
    return value


def _resolve_array_count(*values: Any) -> int:
    lengths = [len(value) for value in values if _is_sequence(value)]
    if not lengths:
        return 1

    array_count = max(lengths)
    for length in lengths:
        if length not in (1, array_count):
            raise ValueError(
                "Multi-array configuration has inconsistent list lengths "
                f"({length} vs {array_count})."
            )

    return array_count


def _entry_value(entry: ConfigEntry, key: str) -> Any:
    """Get config value from options with fallback to entry data."""
    return entry.options.get(key, entry.data.get(key))

def checkHorizonFile(horizon_filepath):
    horizon_data_valid = True
    message = ""
    
    try:
        open(horizon_filepath)
    except FileNotFoundError:
        horizon_data_valid = False
        message = "Invalid horizon file: Horizon file '" + horizon_filepath + "' not found! Specify path like e.g. '/config/www/horizon.txt'"
    
    if horizon_data_valid:
        horizon_data = numpy.genfromtxt(horizon_filepath , delimiter="\t", dtype=float)
        hm = ((0,90),(360,90))
        
        # ... check array shape (error)
        sh = horizon_data.shape
        if isinstance(sh, tuple) and len(sh) == 2:
            if sh[0] < 2 or not sh[1] == 2:
                horizon_data_valid = False
                message = "Invalid horizon file: The array shape is " + str(sh) + ", which is invalid. It has to be at least two rows and exactly two columns (N>1 , 2). Please check (two columns, tab delimiter, decimal points)."
            else:
                hm = tuple([tuple(row) for row in horizon_data])
        else:
            horizon_data_valid = False
            message = "Invalid horizon file: The array shape cannot be determined. It has to be at least two rows and exactly two columns (N>1 , 2). Please check (two columns, tab delimiter, decimal points)."
        
        # ... check for floats (error) - via valid sum of floats or NaN
        if numpy.isnan(numpy.sum(hm)):
            horizon_data_valid = False
            message = "Invalid horizon file: The data seems to contain non-float values. Please check (two columns, tab delimiter, decimal points)."
        
        # ... check range 0...360° (warning only)
        if horizon_data_valid:
            hm_0 = int(hm[0][0])
            hm_n = int(hm[-1][0])
            if not hm_0 == 0 or not hm_n == 360:
                horizon_data_valid = False
                message = "Invalid horizon file: Azimuth values (" + str(hm_0) + "° to " + str(hm_n) + "°) do not contain 0° and/or 360°. I cannot judge whether the full range of applicable azimuths is covered by the horizon file. Please check..."
            
            # ... check ascending azimuths (warning only)
            n = sh[0]
            for i in range(1,n):
                a1 = horizon_data[i-1][0]
                a2 = horizon_data[i][0]
                if not (a2 > a1):
                    message = "Invalid horizon file: Azimuth values are not ascending around value of " + str(a1) + ". Please check..."
                    horizon_data_valid = False
    
    if horizon_data_valid:
        return hm, message
    else:
        return None, message  

class OpenMeteoSolarForecastDataUpdateCoordinator(DataUpdateCoordinator[Estimate]):
    """The Solar Forecast Data Update Coordinator."""

    config_entry: ConfigEntry
    
    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        horizon_map: tuple[tuple[float, float], ...] | list[tuple[tuple[float, float], ...]],
    ) -> None:
        """Initialize the Solar Forecast coordinator."""
        self.config_entry = entry

        # Our option flow may cause it to be an empty string,
        # this if statement is here to catch that.
        api_key = entry.options.get(CONF_API_KEY) or None

        # Handle new options that were added after the initial release
        ac_kwp = entry.options.get(CONF_INVERTER_POWER, 0)
        ac_kwp = ac_kwp / 1000 if ac_kwp else None
        self._retain_latest_forecast_when_unavailable = entry.options.get(
            CONF_RETAIN_LATEST_FORECAST_WHEN_UNAVAILABLE, True
        )
        max_forecast_age_minutes = entry.options.get(CONF_MAX_FORECAST_AGE_MINUTES, 0)
        self._max_forecast_age = (
            timedelta(minutes=max_forecast_age_minutes)
            if max_forecast_age_minutes > 0
            else None
        )
        self._last_successful_update: datetime | None = None

        array_count = _resolve_array_count(
            _entry_value(entry, CONF_LATITUDE),
            _entry_value(entry, CONF_LONGITUDE),
            entry.options[CONF_DECLINATION],
            entry.options[CONF_AZIMUTH],
            entry.options[CONF_MODULES_POWER],
            entry.options.get(CONF_EFFICIENCY_FACTOR, 1.0),
            entry.options.get(CONF_USE_HORIZON, False),
            entry.options.get(CONF_PARTIAL_SHADING, False),
        )

        latitude = _normalize_array_value(
            _entry_value(entry, CONF_LATITUDE), array_count
        )
        longitude = _normalize_array_value(
            _entry_value(entry, CONF_LONGITUDE), array_count
        )
        azimuth = _normalize_array_value(
            entry.options[CONF_AZIMUTH],
            array_count,
            transform=lambda value: value - 180,
        )
        dc_kwp = _normalize_array_value(
            entry.options[CONF_MODULES_POWER],
            array_count,
            transform=lambda value: value / 1000,
        )
        declination = _normalize_array_value(
            entry.options[CONF_DECLINATION],
            array_count,
        )
        efficiency_factor = _normalize_array_value(
            entry.options.get(CONF_EFFICIENCY_FACTOR, 1.0),
            array_count,
        )
        use_horizon = _normalize_array_value(
            entry.options.get(CONF_USE_HORIZON, False),
            array_count,
        )
        partial_shading = _normalize_array_value(
            entry.options.get(CONF_PARTIAL_SHADING, False),
            array_count,
        )

        self.forecast = OpenMeteoSolarForecast(
            api_key=api_key,
            session=async_get_clientsession(hass),
            latitude=latitude,
            longitude=longitude,
            azimuth=azimuth,
            base_url=entry.options[CONF_BASE_URL],
            ac_kwp=ac_kwp,
            dc_kwp=dc_kwp,
            declination=declination,
            efficiency_factor=efficiency_factor,
            damping_morning=entry.options.get(CONF_DAMPING_MORNING, 0.0),
            damping_evening=entry.options.get(CONF_DAMPING_EVENING, 0.0),
            use_horizon=use_horizon,
            partial_shading=partial_shading,
            horizon_map=horizon_map,
            weather_model=entry.options.get(CONF_MODEL, "best_match"),
        )

        update_interval = timedelta(minutes=30)

        super().__init__(hass, LOGGER, name=DOMAIN, update_interval=update_interval)

    async def _async_update_data(self) -> Estimate:
        """Fetch Open-Meteo Solar Forecast estimates."""
        try:
            estimate = await self.forecast.estimate()
        except Exception as err:
            if not self._retain_latest_forecast_when_unavailable or self.data is None:
                raise UpdateFailed(f"Error communicating with API: {err}") from err

            if self._max_forecast_age is not None:
                if self._last_successful_update is None:
                    raise UpdateFailed(
                        "No successful forecast update timestamp available"
                    ) from err

                forecast_age = dt_util.utcnow() - self._last_successful_update
                if forecast_age > self._max_forecast_age:
                    raise UpdateFailed(
                        "Retained forecast exceeded max age "
                        f"({forecast_age} > {self._max_forecast_age})"
                    ) from err

            LOGGER.warning(
                "Unable to refresh forecast data, using retained forecast",
                exc_info=err,
            )
            return self.data

        self._last_successful_update = dt_util.utcnow()
        return estimate
    
    
