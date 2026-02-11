"""DataUpdateCoordinator for the Open-Meteo Solar Forecast integration."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY, CONF_LATITUDE, CONF_LONGITUDE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from open_meteo_solar_forecast import Estimate, OpenMeteoSolarForecast

from .const import (
    CONF_AZIMUTH,
    CONF_BASE_URL,
    CONF_DAMPING_EVENING,
    CONF_DAMPING_MORNING,
    CONF_DECLINATION,
    CONF_EFFICIENCY_FACTOR,
    CONF_INVERTER_POWER,
    CONF_USE_HORIZON,
    CONF_PARTIAL_SHADING,
    CONF_HORIZON_FILEPATH,
    CONF_MODEL,
    CONF_MODULES_POWER,
    DOMAIN,
    LOGGER,
)

import numpy

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
    
    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the Solar Forecast coordinator."""
        self.config_entry = entry

        # Our option flow may cause it to be an empty string,
        # this if statement is here to catch that.
        api_key = entry.options.get(CONF_API_KEY) or None

        # Handle new options that were added after the initial release
        ac_kwp = entry.options.get(CONF_INVERTER_POWER, 0)
        ac_kwp = ac_kwp / 1000 if ac_kwp else None
        
        # Read horizon data from text file and check for integrity
        if entry.options.get(CONF_USE_HORIZON) == True:
            horizon_filepath = entry.options.get(CONF_HORIZON_FILEPATH)
            hm, message = checkHorizonFile(horizon_filepath)
            if hm == None:
                raise ValueError(message)
        else:
            hm = ((0.0,0.0),(360.0,0.0))
        
        #horizon_data = numpy.genfromtxt(entry.options.get(CONF_HORIZON_FILEPATH) , delimiter="\t", dtype=float)
        #hm = tuple([tuple(row) for row in horizon_data])

        self.forecast = OpenMeteoSolarForecast(
            api_key=api_key,
            session=async_get_clientsession(hass),
            latitude=entry.data[CONF_LATITUDE],
            longitude=entry.data[CONF_LONGITUDE],
            azimuth=entry.options[CONF_AZIMUTH] - 180,
            base_url=entry.options[CONF_BASE_URL],
            ac_kwp=ac_kwp,
            dc_kwp=(entry.options[CONF_MODULES_POWER] / 1000),
            declination=entry.options[CONF_DECLINATION],
            efficiency_factor=entry.options[CONF_EFFICIENCY_FACTOR],
            damping_morning=entry.options.get(CONF_DAMPING_MORNING, 0.0),
            damping_evening=entry.options.get(CONF_DAMPING_EVENING, 0.0),
            use_horizon=entry.options.get(CONF_USE_HORIZON),
            partial_shading=entry.options.get(CONF_PARTIAL_SHADING),
            horizon_map=hm,
            weather_model=entry.options.get(CONF_MODEL, "best_match"),
        )

        update_interval = timedelta(minutes=30)

        super().__init__(hass, LOGGER, name=DOMAIN, update_interval=update_interval)

    async def _async_update_data(self) -> Estimate:
        """Fetch Open-Meteo Solar Forecast estimates."""
        return await self.forecast.estimate()
    
    
