"""The Airzone integration."""
from __future__ import annotations

import logging
import traceback
from datetime import timedelta

import async_timeout
import homeassistant.util.dt as dt_util
from homeassistant.components.recorder import get_instance, history
from contextlib import suppress
from homeassistant.exceptions import HomeAssistantError

from homeassistant.const import SUN_EVENT_SUNSET
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_utc_time_change
from homeassistant.helpers.sun import (get_astral_location,
                                       get_location_astral_event_next)
from homeassistant.helpers.update_coordinator import (DataUpdateCoordinator,
                                                      UpdateFailed)

from .const import DOMAIN
from .solcastapi import SolcastApi

_LOGGER = logging.getLogger(__name__)


class SolcastUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data from the Airzone device."""

    def __init__(self, hass: HomeAssistant, solcast: SolcastApi) -> None:
        """Initialize."""
        self.solcast = solcast
        self._hass = hass
        self._auto_fetch_tracker = None
        self._starthour = 6
        self._finishhour = 19
        self._previousenergy = None

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
        )


    async def _async_update_data(self):
        """Update data via library."""
        async with async_timeout.timeout(30):
            try:
                await self.update_forecast()
            except Exception as error:
                raise UpdateFailed(error) from error
            return self.solcast._data

    async def reset_api_counter(self, *args):
        try:
            await self.solcast.reset_api_counter()
        except Exception as error:
            _LOGGER.error("Solcast - Error resetting API counter")
            
    async def reset_past_data(self, *args):
        try:
            await get_instance(self._hass).async_add_executor_job(self.gethistory)
        except Exception as error:
            _LOGGER.error("Solcast - Error resetting past data")

    async def setup(self):
        await get_instance(self._hass).async_add_executor_job(self.gethistory)

        await self.setup_auto_fetch()
        async_track_utc_time_change(self._hass, self.reset_api_counter, hour=0, minute=0, second=10, local=False)
        async_track_utc_time_change(self._hass, self.reset_past_data, hour=0, minute=0, second=15, local=True)

    async def setup_auto_fetch(self):
        try:
            _LOGGER.debug("Solcast - Registering API auto fetching hourly between sun up and sun set")
            location, elevation = get_astral_location(self._hass)
            next_setting = get_location_astral_event_next(
                location, elevation, SUN_EVENT_SUNSET, dt_util.utcnow()
            ) + timedelta(hours=1)
            
            self._finishhour= next_setting.astimezone().hour # already one hour ahead
            
            self._auto_fetch_tracker = async_track_utc_time_change(self._hass, self.update_forecast, minute=0, second=10, local=True)

            _LOGGER.debug("Solcast - API will only connect between the hours %s and %s and at midnight",self._starthour,self._finishhour)

        except Exception:
            _LOGGER.error("Solcast - setup_auto_fetch: %s", traceback.format_exc())

    async def update_forecast(self,*args):
        """Update forecast state."""

        try:
            last_update = self.solcast.get_last_updated_datetime() 
            date_now = dt_util.now() - timedelta(seconds=3500)
            if last_update < date_now:
                #been a long time since last update so update it
                date_now = dt_util.now().replace(hour=0, minute=0, second=0, microsecond=0)
                if last_update < date_now:
                    #more than a day since uopdate
                    await self.solcast.force_api_poll(True)
                else:
                    #sometime today.. 
                    _hournow = dt_util.now().hour
                    if _hournow == 0 or _hournow == self._starthour or _hournow == self._finishhour:
                        #if midnight, or sunrise hour or sunset set run it
                        if  _hournow == self._finishhour:
                            await self.solcast.force_api_poll(True)
                        else:
                            await self.solcast.force_api_poll(False)
                    elif (_hournow > self._starthour and _hournow < self._finishhour):
                        #else its between sun rise and set
                        if self.solcast._sites:
                            #if we have sites to even poll
                            # if _hournow % 2 == 0: 
                            #     await self.solcast.force_api_poll(True) #also do the actual past values
                            # else:
                            await self.solcast.force_api_poll(False) #just update forecast values
                                
            else:
                _LOGGER.debug("Solcast - API poll called, but did not happen as the last update is less than an hour old")
            
            #self.async_set_updated_data(True)
            for update_callback in self._listeners:
                update_callback()

        except Exception:
            _LOGGER.error("update_forecast: %s", traceback.format_exc())

    async def service_event_update(self, *args):
        _LOGGER.debug("Solcast - Event called to force an update of data from Solcast API")
        await self.solcast.force_api_poll()
        for update_callback in self._listeners:
                update_callback()

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
            return self.solcast.get_total_kwh_forecast_tomorrow()
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
            return self.solcast.get_forecast_tomorrow()

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

            lower_entity_id = "sensor.solcast_forecast_this_hour"
            history_list = history.state_changes_during_period(
                self._hass,
                dt_util.as_utc(start_date),
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
                    d[state.last_updated.replace(minute=0,second=0,microsecond=0).isoformat()] = float(state.state)
            
            self._previousenergy = d
        except Exception:
            _LOGGER.error("Solcast - testhistory: %s", traceback.format_exc())
        


