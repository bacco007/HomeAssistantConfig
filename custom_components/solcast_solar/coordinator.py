"""The Solcast Solar integration."""
from __future__ import annotations

import logging
import traceback
from contextlib import suppress
from datetime import timedelta

import async_timeout
import homeassistant.util.dt as dt_util
from homeassistant.components.recorder import get_instance, history
from homeassistant.const import MAJOR_VERSION, MINOR_VERSION, SUN_EVENT_SUNSET
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.event import async_track_utc_time_change
from homeassistant.helpers.sun import (get_astral_location,
                                       get_location_astral_event_next)
from homeassistant.helpers.update_coordinator import (DataUpdateCoordinator,
                                                      UpdateFailed)

from .const import DOMAIN
from .solcastapi import SolcastApi

_LOGGER = logging.getLogger(__name__)

class SolcastUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data from Solcast Solar API."""

    def __init__(self, hass: HomeAssistant, solcast: SolcastApi, autopolling: bool) -> None:
        """Initialize."""
        self.solcast = solcast
        self._hass = hass
        #self.config_entry
        self._auto_fetch_tracker = None
        self._starthour = 6
        self._finishhour = 19
        self._previousenergy = None
        self._autopollingdisabled = autopolling
        self._version = ""

        self._v = f"{MAJOR_VERSION}.{MINOR_VERSION}"

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
        )


    async def _async_update_data(self):
        """Update data via library."""
        if self._autopollingdisabled:
            _LOGGER.debug("coordinator _async_update_data stopped because autopolling is disabled")
            _LOGGER.debug("The log will now show the coordinator default debug message 'Finished fetching solcast_solar data in 0.000 seconds (success: True)', but the api was NOT polled.. i repeat NOT POLLED!!")
            return self.solcast._data
        
        async with async_timeout.timeout(60):
            try:
                await self.update_forecast()
            except Exception as error:
                raise UpdateFailed(error) from error
            return self.solcast._data

    async def reset_api_counter(self, *args):
        try:
            _LOGGER.debug("SOLCAST - resetting api counter")
            await self.solcast.reset_api_counter()
        except Exception as error:
            _LOGGER.error("SOLCAST - Error resetting API counter")
            
    async def reset_past_data(self, *args):
        try:
            await get_instance(self._hass).async_add_executor_job(self.gethistory)
        except Exception as error:
            _LOGGER.error("SOLCAST - reset_past_data: Error resetting past data")

    async def setup(self):
        try:
            await get_instance(self._hass).async_add_executor_job(self.gethistory)
        except Exception:
            _LOGGER.error("SOLCAST - Error coordinator setup to get past history data")
            d={}
            self._previousenergy = d

        try:
            if self._autopollingdisabled:
                _LOGGER.info("SOLCAST - Auto poll the solcast API for data is disabled.")
                _LOGGER.debug("SOLCAST - You must manually setup a call to the service to get new data")
            else:
                _LOGGER.debug("SOLCAST - Registering HA to auto poll the solcast API for data")
                await self.setup_auto_fetch()

            async_track_utc_time_change(self._hass, self.reset_api_counter, hour=0, minute=0, second=10, local=False)
            async_track_utc_time_change(self._hass, self.reset_past_data, hour=0, minute=10, second=15, local=True)
            async_track_utc_time_change(self._hass, self.update_integration_listeners, minute=0, second=15, local=True)
        except Exception as error:
            _LOGGER.error("SOLCAST - Error coordinator setup: %s", traceback.format_exc())

    async def setup_auto_fetch(self):
        try:
            _LOGGER.debug("SOLCAST - Registering API auto fetching hourly between sun up and sun set")
            location, elevation = get_astral_location(self._hass)
            next_setting = get_location_astral_event_next(
                location, elevation, SUN_EVENT_SUNSET, dt_util.utcnow()
            ) + timedelta(hours=1)
            
            self._finishhour= next_setting.astimezone().hour # already one hour ahead
            
            self._auto_fetch_tracker = async_track_utc_time_change(self._hass, self.update_forecast, minute=10, second=10, local=True)

            _LOGGER.debug("SOLCAST - API will only connect between the hours %s and %s and at midnight",self._starthour,self._finishhour)

        except Exception:
            _LOGGER.error("SOLCAST - setup_auto_fetch: %s", traceback.format_exc())


    async def update_integration_listeners(self,*args):
        try:
            _LOGGER.debug("SOLCAST - updating sensors")
            self.async_update_listeners()
        except Exception:
            _LOGGER.error("SOLCAST - update_integration_listeners: %s", traceback.format_exc())


    async def update_forecast(self,*args):
        """Update forecast state."""

        try:
            #_LOGGER.info("SOLCAST: Update forcast data called. Is the time is right")
            last_update = self.solcast.get_last_updated_datetime() 
            date_now = dt_util.now() - timedelta(seconds=3500)
            if last_update < date_now:
                #been a long time since last update so update it
                date_now = dt_util.now().replace(hour=0, minute=0, second=0, microsecond=0)
                if last_update < date_now:
                    #more than a day since uopdate
                    _LOGGER.debug("SOLCAST - Longer than a day since last update. Updating forecast and actual data.")
                    await self.solcast.force_api_poll(True)
                else:
                    #sometime today.. 
                    _hournow = dt_util.now().hour
                    if _hournow == 0 or _hournow == self._starthour or _hournow == self._finishhour:
                        #if midnight, or sunrise hour or sunset set run it
                        if  _hournow == self._finishhour:
                            _LOGGER.debug("SOLCAST - its finish hour, update forecast and actual data")
                            await self.solcast.force_api_poll(True)
                        else:
                            _LOGGER.debug("SOLCAST - its midnight - update api data call")
                            await self.solcast.force_api_poll(False)
                    elif (_hournow > self._starthour and _hournow < self._finishhour):
                        #else its between sun rise and set
                        _LOGGER.debug("SOLCAST - between sun rise/set. Calling forcast_update")
                        if self.solcast._sites:
                            #if we have sites to even poll
                            #if _hournow % 3 == 0: 
                            if _hournow == 12: 
                                _LOGGER.debug("SOLCAST - The call for forecast and actual")
                                await self.solcast.force_api_poll(True) #also do the actual past values
                            else:
                                _LOGGER.debug("SOLCAST - The call for forecast only")
                                await self.solcast.force_api_poll(False) #just update forecast values
                                
            else:
                _LOGGER.debug("SOLCAST - API poll called, but did not happen as the last update is less than an hour old")
            
            await self.update_integration_listeners()

        except Exception:
            _LOGGER.error("SOLCAST - update_forecast: %s", traceback.format_exc())

    async def service_event_update(self, *args):
        _LOGGER.debug("SOLCAST - Event called to force an update of data from Solcast API")
        await self.solcast.force_api_poll()
        await self.update_integration_listeners()

    async def service_event_update_actuals(self, *args):
        _LOGGER.debug("SOLCAST - Event called to force an update of data from Solcast API")
        await self.solcast.force_api_poll(True)
        await self.update_integration_listeners()

    async def service_event_delete_old_solcast_json_file(self, *args):
        _LOGGER.debug("SOLCAST - Event called to delete the solcast.json file. The data will poll the Solcast API refresh")
        await self.solcast.delete_solcast_file()

    def get_energy_tab_data(self):
        return self.solcast.get_energy_data()

    def get_sensor_value(self, key=""):
        if key == "total_kwh_forecast_today":
            return self.solcast.get_total_kwh_forecast_today()
        elif key == "peak_w_today":
            return self.solcast.get_peak_w_today()
        elif key == "peak_w_time_today":
            return self.solcast.get_peak_w_time_today()
        elif key == "forecast_this_hour":
            return self.solcast.get_forecast_this_hour()
        elif key == "forecast_next_hour":
            return self.solcast.get_forecast_next_hour()
        elif key == "total_kwh_forecast_tomorrow":
            return self.solcast.get_total_kwh_forecast_furture_for_day(1) 
        elif key == "total_kwh_forecast_d3":
            return self.solcast.get_total_kwh_forecast_furture_for_day(2)
        elif key == "total_kwh_forecast_d4":
            return self.solcast.get_total_kwh_forecast_furture_for_day(3)
        elif key == "total_kwh_forecast_d5":
            return self.solcast.get_total_kwh_forecast_furture_for_day(4)
        elif key == "total_kwh_forecast_d6":
            return self.solcast.get_total_kwh_forecast_furture_for_day(5)
        elif key == "total_kwh_forecast_d7":
            return self.solcast.get_total_kwh_forecast_furture_for_day(6)
        elif key == "peak_w_tomorrow":
            return self.solcast.get_peak_w_tomorrow()
        elif key == "peak_w_time_tomorrow":
            return self.solcast.get_peak_w_time_tomorrow()
        elif key == "get_remaining_today":
            return self.solcast.get_remaining_today()
        elif key == "api_counter":
            return self.solcast.get_api_used_count()
        elif key == "lastupdated":
            return self.solcast.get_last_updated_datetime()

        #just in case
        return None

    def get_sensor_extra_attributes(self, key=""):
        if key == "total_kwh_forecast_today":
            return self.solcast.get_forecast_today()
        elif key == "total_kwh_forecast_tomorrow":
            return self.solcast.get_forecast_future_day(1)
        elif key == "total_kwh_forecast_d3":
            return self.solcast.get_forecast_future_day(2)
        elif key == "total_kwh_forecast_d4":
            return self.solcast.get_forecast_future_day(3)
        elif key == "total_kwh_forecast_d5":
            return self.solcast.get_forecast_future_day(4)
        elif key == "total_kwh_forecast_d6":
            return self.solcast.get_forecast_future_day(5)
        elif key == "total_kwh_forecast_d7":
            return self.solcast.get_forecast_future_day(6)

        #just in case
        return None

    def get_site_value(self, key=""):
        return self.solcast.get_rooftop_site_total_today(key)

    def get_site_extra_attributes(self, key=""):
        return self.solcast.get_rooftop_site_extra_data(key)
        
    def gethistory(self):
        try:
            start_date = dt_util.now().astimezone().replace(hour=0,minute=0,second=0,microsecond=0) - timedelta(days=7)
            end_date = dt_util.now().astimezone().replace(hour=23,minute=59,second=59,microsecond=0) - timedelta(days=1)
            _LOGGER.debug(f"SOLCAST - gethistory: from- {start_date} to- {end_date}")

            lower_entity_id = "sensor.solcast_forecast_this_hour"
            history_list = history.state_changes_during_period(
                self._hass,
                start_time=dt_util.as_utc(start_date),
                end_time=dt_util.as_utc(end_date),
                entity_id=lower_entity_id,
                no_attributes=True,
                descending=True,
            )

            d={}
            for state in history_list.get(lower_entity_id, []):
                # filter out all None, NaN and "unknown" states
                # only keep real values
                with suppress(ValueError):
                    d[state.last_updated.replace(minute=0,second=0,microsecond=0).astimezone().isoformat()] = float(state.state)

            _LOGGER.debug(f"SOLCAST - gethistory got {len(d)} items")
            self._previousenergy = d
        except Exception:
            _LOGGER.error("SOLCAST - gethistory: %s", traceback.format_exc())