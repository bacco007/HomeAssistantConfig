"""Support for Solcast PV forecast."""
import asyncio
import json
import logging
import traceback
from datetime import datetime, timedelta
from enum import Enum
from operator import itemgetter

import aiohttp
import homeassistant.util.dt as dt_util
import voluptuous as vol
from homeassistant.components.recorder.models import Events
#from homeassistant.components.recorder.purge import _purge_event_ids
from homeassistant.components.recorder.util import session_scope
from homeassistant.config_entries import ConfigEntry

from homeassistant.const import (CONF_API_KEY, CONF_NAME, EVENT_STATE_CHANGED,
                                    STATE_UNAVAILABLE, STATE_UNKNOWN,
                                    SUN_EVENT_SUNSET)
from homeassistant.core import Event, EventOrigin, HomeAssistant

from homeassistant.helpers.event import (async_call_later,
                                            async_track_time_change,
                                            async_track_utc_time_change)
from homeassistant.helpers.sun import (get_astral_location,
                                        get_location_astral_event_next)
from isodate import parse_datetime

from .const import (CONF_RESOURCE_ID, CONF_SOLCAST_URL, CONF_SSL_DISABLE,
                    DOMAIN, CONF_AUTO_FETCH)

#from sqlalchemy.sql.functions import count


PLATFORMS = ["sensor"]

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up solcast parameters."""

    try:
        #hass.config_entries
        api_key = entry.options[CONF_API_KEY]
        resource_id = entry.options[CONF_RESOURCE_ID]
        auto_fetch = entry.options[CONF_AUTO_FETCH]
        disable_ssl = entry.options[CONF_SSL_DISABLE]
        #integration_name = DOMAIN + "-" + entry.title

        _LOGGER.debug("Setting up Solcast for rooftop id %s",resource_id)
        _LOGGER.debug("DB id %s",entry.entry_id)

        rooftop_site = SolcastRooftopSite(hass, api_key, resource_id, disable_ssl,entry.entry_id,auto_fetch)

        #hass.data[entry.entry_id] = rooftop_site
        hass.data.setdefault(DOMAIN, {})[entry.entry_id] = rooftop_site

        hass.config_entries.async_setup_platforms(entry, PLATFORMS)

        # start periodic request of new data
        await rooftop_site.start_periodic_update()
        #async_call_later(hass, 1, rooftop_site.start_periodic_update())

        entry.async_on_unload(entry.add_update_listener(async_update_options))

        hass.bus.async_listen("solcast_update_all_forecasts", rooftop_site.update_forecast_service)
        hass.bus.async_listen("solcast_delete_all_forecasts", rooftop_site.delete_all_forecast_data_service)
        
        return True
    except Exception as err:
        _LOGGER.error("async_setup_entry: %s",traceback.format_exc())
        return False

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    integrationrooftop: SolcastRooftopSite = hass.data[DOMAIN][entry.entry_id]
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        integrationrooftop.delete_all_forecast_data_service()
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok

async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Update options."""
    try:
        _LOGGER.debug("async_update_options called")
        #await hass.config_entries.async_reload(entry.entry_id)
        coordinator: SolcastRooftopSite = hass.data[DOMAIN][entry.entry_id]
        coordinator._api_key = entry.options[CONF_API_KEY]
        coordinator._resource_id = entry.options[CONF_RESOURCE_ID]
        coordinator._auto_fetch = entry.options[CONF_AUTO_FETCH]
        coordinator._disable_ssl = entry.options[CONF_SSL_DISABLE]
        if not entry.options[CONF_AUTO_FETCH]:
            if coordinator._auto_fetch_tracker:
                coordinator._auto_fetch_tracker()
                coordinator._auto_fetch_tracker = None
                _LOGGER.debug("Auto fetch timer disabled")
        else:
            if not coordinator._auto_fetch_tracker:
                await coordinator.setup_auto_fetch()
    except Exception as err:
        _LOGGER.error("async_update_options: %s",traceback.format_exc())

async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle removal of an entry."""
    try:
        coordinator: SolcastRooftopSite = hass.data[DOMAIN][entry.entry_id]
        if coordinator._auto_fetch_tracker:
            _LOGGER.debug("async_remove_entry removed auto fetch timer")
            coordinator._auto_fetch_tracker()
            coordinator._auto_fetch_tracker = None

    except Exception as err:
        _LOGGER.error("async_remove_entry: %s",traceback.format_exc())


class SensorType(Enum):
    """Representation of Solcast SensorTypes."""
    api_count = 1
    forecast_today = 2
    forecast_today_remaining = 3
    forecast_tomorrow = 4
    last_updated = 5

class SolcastAPI:
    """Representation of the Solcast API."""

    def __init__(self, api_key):
        """Initialize solcast API."""

        self._api_key = api_key
        self._base_url = CONF_SOLCAST_URL
        self._api_used = 0

    async def request_data(self, path, ssl=True, hours=168):
        """Request data via the Solcast API."""
        try:
            params = {"format": "json", "api_key": self._api_key, "hours": hours}

            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url=f"{self._base_url}{path}", params=params, ssl=ssl
                ) as resp:
                    json = await resp.json()
                    status = resp.status
            if status == 429:
                _LOGGER.warning("Exceeded Solcast API allowed polling limit")
                self._api_used = 50
                return False
            elif status == 400:
                _LOGGER.error(
                    "The rooftop site missing capacity, please specify capacity or provide historic data for tuning."
                )
                return False
            elif status == 404:
                _LOGGER.error("The rooftop site cannot be found or is not accessible.")
                return False
            elif status == 200:
                self._api_used = self._api_used + 1
                return json
        except Exception:
            _LOGGER.error("request_data: %s", traceback.format_exc())

    def reset_api_used(self, *args):
        _LOGGER.debug("reset_api_used has been reset back to its limit")
        self._api_used = 0

class SolcastRooftopSite(SolcastAPI):
    """Representation of a Solcast rooftop site."""

    _states = {
        SensorType.api_count: None,
        SensorType.forecast_today: None,
        SensorType.forecast_today_remaining: None,
        SensorType.forecast_tomorrow: None,
        SensorType.last_updated: None
    }

    _attributes = {
        SensorType.api_count: {},
        SensorType.forecast_today: {},
        SensorType.forecast_today_remaining: {},
        SensorType.forecast_tomorrow: {},
        SensorType.last_updated: {}
    }

    

    def __init__(self, hass, api_key, resource_id, disable_ssl, entryId, auto_fetch):
        """Initialize solcast rooftop site."""

        super().__init__(api_key)
        self._hass = hass
        self._entry_id = entryId
        self._resource_id = resource_id
        self._disable_ssl = disable_ssl
        self._forecast_entity_id = None
        self._api_used = 0
        self._last_updated = dt_util.now()
        self._update_listeners = []
        self._forecasts = self.get_stored_forecast_data()
        self._starthour = 6
        self._finishhour= 19
        self._auto_fetch = auto_fetch
        self._auto_fetch_tracker = None

    def get_resource_id(self):
        """Get Solcast rooftopsite resource id."""
        return self._resource_id

    def get_state(self, sensor_type):
        """Get Solcast rooftopsite states."""
        return self._states[sensor_type]

    def set_state(self, sensor_type, state):
        """Get Solcast rooftopsite states."""
        self._states[sensor_type] = state

    def get_attributes(self, sensor_type):
        """Get Solcast rooftopsite attributes."""
        return self._attributes[sensor_type]

    def get_extra_state_attributes(self, sensor_type):
        """Return the attributes."""
        try:
            return {"resource_id": self._resource_id}
        except Exception as err:
            _LOGGER.error("get_extra_state_attributes: %s", err)

        return {}

    def get_last_update_datetime(self):
        """return the last time the api was successfully called"""
        if self._states[SensorType.last_updated]:
            return datetime.fromisoformat(self._states[SensorType.last_updated])

        return dt_util.now() - timedelta(hours=1)

    def get_stored_forecast_data(self, fromDatetime:datetime = None, toDatetime:datetime = None):
        try:
            if fromDatetime is None:
                fromDatetime = datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)
                toDatetime = datetime.now().replace(hour=23,minute=59,second=59,microsecond=0) + timedelta(days=1)

            fromDatetime = fromDatetime.astimezone().strftime("%Y-%m-%d %H:%M")
            toDatetime = toDatetime.astimezone().strftime("%Y-%m-%d %H:%M")

            with session_scope(hass=self._hass) as session:
                events: list[Events] = (
                    #session.query(Events.event_data).filter( 
                    #and_(
                    #    Events.event_type == self._entry_id, 
                    #    Events.time_fired >= fromDatetime,
                    #    Events.time_fired <= toDatetime
                    #    )
                    #)
                    session.query(Events.event_data).filter( 
                        Events.event_type == self._entry_id, 
                        Events.time_fired >= fromDatetime,
                        Events.time_fired <= toDatetime
                    )
                )
                event_s: list[int] = [event.event_data for event in events]

                if event_s:
                    f = []
                    for forecast in event_s:
                        forecast = json.loads(forecast)
                        # Convert period_end and period. All other fields should already be the correct type
                        forecast["period_end"] = parse_datetime(forecast["period_end"])
                        #forecast["period"] = parse_duration(forecast["period"])
                        #forecast["period_start"] = forecast["period_end"] - forecast["period"]
                        forecast["pv_estimate"] = float(forecast["pv_estimate"])

                        f.append(forecast)

                    return f
                else:
                    #_LOGGER.warn("add nothing to get_stored_forecast_data")
                    return None

        except Exception:
            _LOGGER.error("get_stored_forecast_data: %s", traceback.format_exc())
            return None
    
    async def setup_auto_fetch(self):
        try:
            _LOGGER.debug("registering API auto fetching hourly between sun up and sun set")
            location, elevation = get_astral_location(self._hass)
            next_setting = get_location_astral_event_next(
                location, elevation, SUN_EVENT_SUNSET, dt_util.utcnow()
            ) + timedelta(hours=1)
            
            self._finishhour= next_setting.hour # already one hour ahead

            self._auto_fetch_tracker = async_track_time_change(self._hass, self.update_forecast, minute=0, second=0)
            
        except Exception:
            _LOGGER.error("setup_auto_fetch: %s", traceback.format_exc())

    async def start_periodic_update(self):
        """Start periodic data polling."""

        try:
            # Register API limit reset
            _LOGGER.debug("registering API limit reset")
            async_track_utc_time_change(self._hass, self.reset_api_used, hour=0, minute=0, second=0, local=True)

            if self._forecasts is None:
                #first run or database was deleted but integration still active
                #await self.update_forecast(checktime=False)
                async_call_later(self._hass, 1, self.update_forecast_service)

            if self._auto_fetch:
                await self.setup_auto_fetch()
            else:
                _LOGGER.debug("API auto fetching is disabled")
            
        except Exception:
            _LOGGER.error("start_periodic_update: %s", traceback.format_exc())

    async def update_forecast_service(self, param=None):
        """Update forecast state service call."""
        try:
            await self.update_forecast(checktime=False)
            _LOGGER.debug("Update forecast service called for rooftop id %s", self._resource_id)
            #self._hass.bus.fire("solcast_update_forecast_service", {"answer": 42})
            self._notify_listeners()
        except Exception:
            _LOGGER.error("update_forecast_service: %s", traceback.format_exc())

    async def delete_all_forecast_data_service(self, param=None):
        """Delete all forecast data service"""
        try:
            with session_scope(hass=self._hass) as session:
                session.query(Events).filter(Events.event_type == self._entry_id).delete(synchronize_session=False)
                session.commit()
            
            _LOGGER.warn("All Forecast data is being deleted for %s", self._resource_id)
            self._forecasts = None
            self._states[SensorType.forecast_today] = 0
            self._states[SensorType.forecast_today_remaining] = 0
            self._states[SensorType.forecast_tomorrow] = 0

            await self._notify_listeners(SensorType.forecast_today)
            await self._notify_listeners(SensorType.forecast_today_remaining)
            await self._notify_listeners(SensorType.forecast_tomorrow)
        except Exception:
            _LOGGER.error("delete_all_forecast_data_service: %s", traceback.format_exc())

    def set_forecast_states(self):
        try:
            if not self._forecast_entity_id is None:
                self._states[SensorType.forecast_today] = round(
                        self._calculate_energy_forecast(0),
                        3
                    )

            
                self._states[SensorType.forecast_today_remaining] = round(
                        self._calculate_energy_forecast_remaing_today(),
                        3
                    )
                
                self._states[SensorType.forecast_tomorrow] = round(
                        self._calculate_energy_forecast(1),
                        3
                    )

                self._notify_listeners(SensorType.forecast_today)
                self._notify_listeners(SensorType.forecast_today_remaining)
                self._notify_listeners(SensorType.forecast_tomorrow)
                
                # All data processed -> notify sensors for updated values
                
            #_LOGGER.debug("set forecast state complete")
        except Exception as err:
            _LOGGER.error("set_forecast_states : %s", traceback.format_exc())

    
    async def update_forecast(self, checktime:bool = True):
        """Update forecast state."""

        try:
            if self._forecast_entity_id is None:
                    _LOGGER.warning(
                        "Solcast entities not yet registered, try again next day"
                    )
            else:
                _doUpdate = True
                if checktime:
                    _hournow = dt_util.now().hour
                    if _hournow == 0 or (_hournow > self._starthour and _hournow < self._finishhour):
                        _doUpdate = True
                    else:
                        _doUpdate = False

                if _doUpdate:
                    if not await self._fetch_forecasts():
                        _LOGGER.warning("Could not fetch data from Solcast, try again next day")
                        
                    else:
                        # Process data in case the forecast entity is already registered
                        _LOGGER.debug("Forecast successfully fetched and entity available")

                        _insert_items = []
                        with session_scope(hass=self._hass) as session:
                            eventdata = session.query(Events).filter(Events.event_type == self._entry_id)

                            # Process forecast data
                            for forecasts in self._forecasts:
                                d = {"period_end": forecasts["period_end"].isoformat(),
                                        "pv_estimate": forecasts["pv_estimate"]}
                                
                                found = eventdata.filter(Events.time_fired == forecasts["period_end"])
                                foundcount = len(found.all())

                                if foundcount == 0:
                                    # we add a new record
                                    e = Events(
                                            event_type=self._entry_id,
                                            event_data=json.dumps(d),
                                            origin="LOCAL",
                                            time_fired=forecasts["period_end"],
                                        )
                                    _insert_items.append(e)
                                elif foundcount == 1:
                                    #update this one
                                    found.update({Events.event_data: json.dumps(d)}, synchronize_session=False)
                                else:
                                    # there are too many
                                    _LOGGER.error("Too many records found for Solcast Forecast: %s  count: %s !!This should not happen!!", self._resource_id,found.count)

                            if len(_insert_items) > 0:
                                session.add_all(_insert_items)
                                    
                        session.commit()

                        _LOGGER.debug("Updated forecasts from Solcast API")

                        self._states[SensorType.last_updated] = dt_util.now().isoformat() #dt_util.now().strftime("%Y%m%d%H%M%S")
                        await self._notify_listeners(SensorType.last_updated)  

                #update the ha view of the states every hour  
                #self._update_API_call_sensor()
                #self._update_last_updated_sensor()  

                self._states[SensorType.api_count] = self._api_used
                await self._notify_listeners(SensorType.api_count)
                
                self._states[SensorType.forecast_today] = round(
                        self._calculate_energy_forecast(0),
                        3
                    )

            
                self._states[SensorType.forecast_today_remaining] = round(
                        self._calculate_energy_forecast_remaing_today(),
                        3
                    )
                
                self._states[SensorType.forecast_tomorrow] = round(
                        self._calculate_energy_forecast(1),
                        3
                    )

                await self._notify_listeners(SensorType.forecast_today)
                await self._notify_listeners(SensorType.forecast_today_remaining)
                await self._notify_listeners(SensorType.forecast_tomorrow)

        except Exception:
            _LOGGER.error("update_forecast: %s", traceback.format_exc())

    def add_update_listener(self, listener):
        """Add a listener for update notifications."""
        try:
            self._update_listeners.append(listener)

            #if listener.get_type() is SensorType.forecast_today:
            #    _LOGGER.debug(f"registered forecast_today sensor {listener.entity_id}")
            #elif listener.get_type() is SensorType.forecast_today_remaining:
            #    _LOGGER.debug(f"registered forecast_today_remaining sensor {listener.entity_id}")
            #elif listener.get_type() is SensorType.forecast_tomorrow:
            #    _LOGGER.debug(f"registered forecast_tomorrow sensor {listener.entity_id}")
            if listener.get_type() is SensorType.api_count:
            #    _LOGGER.debug(f"registered API count sensor {listener.entity_id}")
                self._forecast_entity_id = listener.entity_id
            #elif listener.get_type() is SensorType.last_updated:
            #    _LOGGER.debug(f"registered last_update sensor {listener.entity_id}")
            #else:
            #    _LOGGER.warning("Try to register unknown sensor type")
            
            # initial data is already loaded, thus update the component
            listener.update_callback()
        except Exception:
            _LOGGER.error("add_update_listener: %s", traceback.format_exc())

    async def _notify_listeners(self, type=None):
        """ Inform entities about updated values """
        try:
            d = 0
            for listener in self._update_listeners:
                if type is None:
                    # type is not defined -> inform all sensors
                    listener.update_callback()
                    d += 1
                elif listener.get_type() is type:
                    # inform only defined type
                    listener.update_callback()
                    d += 1
            #_LOGGER.debug("Notified %d sensor listeners", d)
        except Exception:
            _LOGGER.error("_notify_listeners: %s", traceback.format_exc())

    def _calculate_energy_forecast(self, addDays:int = 0):
        """Calculate the total forecasted energy for the given day."""
        try:
            #_LOGGER.error("_calculate_energy_forecast: %s", addDays)
            e_total = 0.0
            startdate = dt_util.now().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=addDays)
            enddate = startdate.replace(hour=23, minute=59, second=59, microsecond=0)
            for forecast in self._forecasts:
                #f_start = forecast["period_start"]
                f_end = forecast["period_end"]
                #if f_start >= startdate and f_end <= enddate:
                if f_end >= startdate and f_end <= enddate:
                    #hours = forecast["period"].total_seconds() / 3600
                    #power = forecast["pv_estimate"]  # in kW
                    #energy = power * 0.5
                    #_LOGGER.error("found start: %s end: %s gross: %s", f_start, f_end, power)
                    e_total += forecast["pv_estimate"]
            #_LOGGER.error("_calculate_energy_forecast: %s start: %s end: %s gross: %s", startdate, enddate, e_total)
            return e_total
        except Exception:
            #_LOGGER.error("_calculate_energy_forecast: %s", traceback.format_exc())
            return 0

    def _calculate_energy_forecast_remaing_today(self):
        """Calculate the total forecasted energy for the given day."""
        try:
            e_total = 0.0
            startdate = dt_util.now().replace(second=0,microsecond=0) #.astimezone()
            enddate = startdate.replace(hour=23, minute=59, second=59, microsecond=0) #.astimezone()
            for forecast in self._forecasts:
                #f_start = forecast["period_start"]
                f_end = forecast["period_end"]
                #if f_start >= startdate and f_end <= enddate:
                if f_end >= startdate and f_end <= enddate:
                    #hours = forecast["period"].total_seconds() / 3600
                    #power = forecast["pv_estimate"]  # in kW
                    #energy = power * hours
                    e_total += forecast["pv_estimate"]
            #_LOGGER.debug("_calculate_energy_forecast_remaing_today: start: %s  end: %s,  total: %s",startdate, enddate, e_total)
            return e_total
        except Exception:
            #_LOGGER.error("_calculate_energy_forecast_remaing_today: %s", traceback.format_exc())
            return 0

    #async def _update_API_call_sensor(self):
    #    try:
    #        self._states[SensorType.api_count] = self._api_used
    #        await self._notify_listeners(SensorType.api_count)
    #        _LOGGER.debug("Updated API count sensor")
    #    except Exception:
    #        _LOGGER.error("_update_API_call_sensor: %s", traceback.format_exc())

    #async def _update_last_updated_sensor(self):
    #    try:
    #        self._states[SensorType.last_updated] = dt_util.now().isoformat() #dt_util.now().strftime("%Y%m%d%H%M%S")
    #        await self._notify_listeners(SensorType.last_updated)
    #        _LOGGER.debug("Updated last_update (datetime) that successfully called Solcast API sensor")
    #    except Exception:
    #        _LOGGER.error("_update_last_updated_sensor: %s", traceback.format_exc())

    async def _fetch_forecasts(self) -> bool:
        """Fetch the forecasts for this rooftop site."""
        try:
            resp = await self.request_data(f"/rooftop_sites/{self._resource_id}/forecasts", ssl=not self._disable_ssl)

            if resp is False:
                return False

            fc = resp.get("forecasts")

            #if hour to do past then get that too
            n = dt_util.as_local(dt_util.now())

            if n.hour == 10 or n.hour == 14 or n.hour == 18 or self._forecasts is None:
                _LOGGER.debug("Updating Solcast estimated_actuals data")
                resp = None
                if self._forecasts is None:
                    resp = await self.request_data(
                        f"/rooftop_sites/{self._resource_id}/estimated_actuals", ssl=not self._disable_ssl
                    )
                else:
                    resp = await self.request_data(
                        f"/rooftop_sites/{self._resource_id}/estimated_actuals", ssl=not self._disable_ssl,hours=48
                    )
                if not resp is False:
                    fc = fc + resp.get("estimated_actuals")
                else:
                    _LOGGER.info("Didnt get estimated_actuals inside _fetch_forecasts")

            if resp is False:
                return False

            forecastssorted = sorted(fc, key=itemgetter("period_end"))
            if len(forecastssorted) > 2:
                pd = parse_datetime(forecastssorted[0]["period_end"])
                if pd.minute == 30:
                    del forecastssorted[0]
                pd = parse_datetime(forecastssorted[-1]["period_end"])
                if pd.minute == 0:
                    del forecastssorted[-1]

            fc = dict({"forecasts": forecastssorted})

            f = []
            for forecast in fc["forecasts"]:
                # Convert period_end and period. All other fields should already be the correct type
                if float(forecast["pv_estimate"]) > 0:
                    forecast["period_end"] = parse_datetime(forecast["period_end"]).astimezone()
                    #forecast["period"] = parse_duration(forecast["period"])
                    #forecast["period_start"] = forecast["period_end"] - forecast["period"]
                    forecast["pv_estimate"] = round(float(forecast["pv_estimate"])*0.5,6)
                    f.append(forecast)

            self._forecasts = f

            

            return True
        except Exception:
            _LOGGER.error("_fetch_forecasts: %s", traceback.format_exc())

    def get_energy_tab_data(self):
        """Get solar forecast for a config entry ID."""
        try:
            with session_scope(hass=self._hass) as session:
                events: list[Events] = (
                        session.query(Events.event_data)
                        .filter(Events.event_type == self._entry_id)
                        .order_by(Events.time_fired.asc())
                )

                event_s: list[int] = [event.event_data for event in events]
                
                if event_s:
                    wh_hours = {}
                    for item in event_s:
                        item = json.loads(item)

                        timestamp = parse_datetime(item['period_end'])
                        energy = float(item["pv_estimate"]*1000) #* 0.5
                        #wh_hours
                        d = datetime(timestamp.year, timestamp.month, timestamp.day, timestamp.hour , 0, 0)

                        if d in wh_hours:
                            wh_hours[d] += energy
                        else:
                            wh_hours[d] = energy

                    return {
                        "wh_hours": {
                            timestamp.isoformat(): val
                            for timestamp, val in wh_hours.items()
                        }
                    }
                else:
                    return None
        except Exception:
            _LOGGER.error("get_energy_tab_data: %s", traceback.format_exc())


