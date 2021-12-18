"""Support for Solcast PV forecast."""
import json
import logging
import traceback
from datetime import datetime, timedelta
from enum import Enum
from operator import itemgetter

import aiohttp
import homeassistant.util.dt as dt_util
from homeassistant.components.recorder.models import Events
from homeassistant.components.recorder.util import session_scope
from homeassistant.config_entries import ConfigEntry

from homeassistant.const import CONF_API_KEY, SUN_EVENT_SUNSET
from homeassistant.core import HomeAssistant

from homeassistant.helpers.event import async_call_later, async_track_utc_time_change
from homeassistant.helpers.sun import get_astral_location, get_location_astral_event_next
from isodate import parse_datetime

from .const import CONF_RESOURCE_ID, CONF_SOLCAST_URL, CONF_SSL_DISABLE,DOMAIN, CONF_AUTO_FETCH

PLATFORMS = ["sensor"]

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up solcast parameters."""

    try:
        api_key = entry.options[CONF_API_KEY]
        resource_id = entry.options[CONF_RESOURCE_ID]
        auto_fetch = entry.options[CONF_AUTO_FETCH]
        disable_ssl = entry.options[CONF_SSL_DISABLE]

        _LOGGER.debug("Setting up Solcast for rooftop id %s",resource_id)
        _LOGGER.debug("DB id %s",entry.entry_id)

        rooftop_site = SolcastRooftopSite(hass, api_key, resource_id, disable_ssl,entry.entry_id,auto_fetch)

        hass.data.setdefault(DOMAIN, {})[entry.entry_id] = rooftop_site

        hass.config_entries.async_setup_platforms(entry, PLATFORMS)

        entry.async_on_unload(entry.add_update_listener(async_update_options))

        hass.bus.async_listen("solcast_update_all_forecasts", rooftop_site.update_forecast_service)
        hass.bus.async_listen("solcast_delete_all_forecasts", rooftop_site.delete_all_forecast_data_service)
        hass.bus.async_listen("solcast_log_debug_data", rooftop_site.log_debug_data)

        # start periodic request of new data
        await rooftop_site.start_periodic_update()
        
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
        #_LOGGER.debug("async_update_options called")
        #await hass.config_entries.async_reload(entry.entry_id)
        coordinator: SolcastRooftopSite = hass.data[DOMAIN][entry.entry_id]
        coordinator._api_key = entry.options[CONF_API_KEY]
        coordinator._resource_id = entry.options[CONF_RESOURCE_ID]
        coordinator._auto_fetch = entry.options[CONF_AUTO_FETCH]
        coordinator._disable_ssl = entry.options[CONF_SSL_DISABLE]

        coordinator._debugData["api_key"] = entry.options[CONF_API_KEY]
        coordinator._debugData["rooftop_id"] = entry.options[CONF_RESOURCE_ID]
        coordinator._debugData["disable_ssl"] = entry.options[CONF_SSL_DISABLE]
        coordinator._debugData["auto_fetch_enabled"] = entry.options[CONF_AUTO_FETCH]
        coordinator._debugData["auto_fetch_timer_object"] = entry.options[CONF_API_KEY]

        if not entry.options[CONF_AUTO_FETCH]:
            if coordinator._auto_fetch_tracker:
                coordinator._auto_fetch_tracker()
                coordinator._auto_fetch_tracker = None
                coordinator._debugData["auto_fetch_timer_object"] = (coordinator._auto_fetch_tracker is not None)
                _LOGGER.debug("Auto fetch timer disabled")
        else:
            if not coordinator._auto_fetch_tracker:
                await coordinator.setup_auto_fetch()
                coordinator._debugData["auto_fetch_timer_object"] = (coordinator._auto_fetch_tracker is not None)
    except Exception as err:
        _LOGGER.error("async_update_options: %s",traceback.format_exc())

async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle removal of an entry."""
    try:
        coordinator: SolcastRooftopSite = hass.data[DOMAIN][entry.entry_id]
        if coordinator._auto_fetch_tracker:
            #_LOGGER.debug("async_remove_entry removed auto fetch timer")
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
        _LOGGER.debug("api call counter has been reset")
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
        self._update_listeners = []
        self._forecasts = self.get_stored_forecast_data()
        self._starthour = 6
        self._finishhour= 19
        self._auto_fetch = auto_fetch
        self._auto_fetch_tracker = None
        self._do_past_fetch = False
        self._debugData = {"api_key": api_key, 
                            "rooftop_id": resource_id,
                            "disable_ssl": disable_ssl,
                            "auto_fetch_enabled": auto_fetch,
                            "auto_fetch_start_hour": self._starthour,
                            "auto_fetch_end_hour": 18,
                            "auto_fetch_timer_object": False
                            }

    def get_resource_id(self):
        """Get Solcast rooftopsite resource id."""
        return self._resource_id

    def get_state(self, sensor_type):
        """Get Solcast rooftopsite states."""
        #return self._states[sensor_type]
        try:
            if (sensor_type == SensorType.forecast_today) or (sensor_type == SensorType.forecast_tomorrow) or (sensor_type == SensorType.forecast_today_remaining):
                return self.get_forecast_sensor_state(sensor_type)
            else:
                return self._states[sensor_type]
        except Exception:
            _LOGGER.error("get_state: %s", traceback.format_exc())

    def set_state(self, sensor_type, state):
        """Get Solcast rooftopsite states."""
        try:
            if sensor_type == SensorType.api_count:
                self._api_used = int(state)
                self._debugData["api_call_counter"] = int(state)

            self._states[sensor_type] = state
        except Exception:
            _LOGGER.error("set_state: %s", traceback.format_exc())

    def get_attributes(self, sensor_type):
        """Get Solcast rooftopsite attributes."""
        return self._attributes[sensor_type]

    def get_extra_state_attributes(self, sensor_type):
        """Return the attributes."""
        try:
            return {"resource_id": self._resource_id}
        except Exception:
            _LOGGER.error("get_extra_state_attributes: %s", traceback.format_exc())

        return {}

    #def get_last_update_datetime(self):
    #    """return the last time the api was successfully called"""
    #    if self._states[SensorType.last_updated]:
    #        _LOGGER.error("get_last_update_datetime %s",datetime.fromisoformat(self._states[SensorType.last_updated]))
    #        return datetime.fromisoformat(self._states[SensorType.last_updated])
    #    _LOGGER.error("no last update date value in state")
    #    return dt_util.now() - timedelta(hours=1)

    def get_stored_forecast_data(self, fromDatetime:datetime = None, toDatetime:datetime = None):
        try:
            if fromDatetime is None:
                fromDatetime = datetime.now().replace(hour=0,minute=0,second=0,microsecond=0) - timedelta(days=1)
                toDatetime = datetime.now().replace(hour=23,minute=59,second=59,microsecond=0) + timedelta(days=1)

            fromDatetime = fromDatetime.astimezone().strftime("%Y-%m-%d %H:%M")
            toDatetime = toDatetime.astimezone().strftime("%Y-%m-%d %H:%M")

            with session_scope(hass=self._hass) as session:
                events: list[Events] = (

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
                        forecast["period_end"] = parse_datetime(forecast["period_end"])
                        forecast["pv_estimate"] = float(forecast["pv_estimate"])

                        f.append(forecast)

                    return f
                else:
                    return None

        except Exception:
            _LOGGER.error("get_stored_forecast_data: %s", traceback.format_exc())
            return None
    
    async def do_update_been_aloong_time(self):
        """do_update_been_aloong_time"""
        try:

            hn = dt_util.now().astimezone().hour
            
            if hn >= self._starthour and hn <=self._finishhour:
                #first run or database was deleted but integration still active
                #await self.update_forecast(checktime=False)
                async_call_later(self._hass, 1, self.update_forecast_service)
                _LOGGER.debug("been over an hour since the last update, going to call the solcast api to update forecsat data")
            else:
                _LOGGER.debug("been over an hour since the last update, but its outside of api calling time (sun rise-set) no api call")
        except Exception:
            _LOGGER.error("do_update_been_aloong_time: %s", traceback.format_exc())

    async def setup_auto_fetch(self):
        try:
            _LOGGER.debug("registering API auto fetching hourly between sun up and sun set")
            location, elevation = get_astral_location(self._hass)
            next_setting = get_location_astral_event_next(
                location, elevation, SUN_EVENT_SUNSET, dt_util.utcnow()
            ) + timedelta(hours=1)
            
            self._finishhour= next_setting.astimezone().hour # already one hour ahead
            self._debugData["auto_fetch_end_hour"] = self._finishhour

            self._auto_fetch_tracker = async_track_utc_time_change(self._hass, self.update_forecast, minute=0, second=0, local=True)
            self._debugData["auto_fetch_timer_object"] = (self._auto_fetch_tracker is not None)

            _LOGGER.debug("created auto forecast fetch hourly timer")
            _LOGGER.debug("Remember that even though its every hour, the api will only connect between the hours %s and %s and at midnight",self._starthour,self._finishhour)

        except Exception:
            _LOGGER.error("setup_auto_fetch: %s", traceback.format_exc())

    async def start_periodic_update(self):
        """Start periodic data polling."""

        try:
            # Register API limit reset
            _LOGGER.debug("registering API limit reset for UTC midnight")
            async_track_utc_time_change(self._hass, self.reset_api_used, hour=0, minute=0, second=0, local=False)

            if self._forecasts is None:
                #first run or database was deleted but integration still active
                async_call_later(self._hass, 1, self.update_forecast_service)

            if self._auto_fetch:
                await self.setup_auto_fetch()
            else:
                _LOGGER.debug("API auto fetching is disabled")
                
        except Exception:
            _LOGGER.error("start_periodic_update: %s", traceback.format_exc())

    def get_forecast_sensor_state(self, sensor_type:SensorType = None):
        """ update ha values to display"""
        try:
            #use a session to get the data from the database
            with session_scope(hass=self._hass) as session:
                #all today
                if sensor_type == SensorType.forecast_today:
                    e_total = 0.0
                    startdate = dt_util.now().replace(hour=0, minute=0, second=0, microsecond=0).astimezone() #+ timedelta(days=addDays)
                    enddate = startdate.replace(hour=23, minute=59, second=59, microsecond=0).astimezone()

                    startdate = startdate.strftime("%Y-%m-%d %H:%M")
                    enddate = enddate.strftime("%Y-%m-%d %H:%M")

                    events: list[Events] = (
                            session.query(Events.event_data)
                                .filter(Events.event_type == self._entry_id,
                                        Events.time_fired > startdate,
                                        Events.time_fired < enddate)
                                )

                    event_s: list[int] = [event.event_data for event in events]
                    
                    if event_s:
                        for item in event_s:
                            item = json.loads(item)
                            e_total = e_total + float(item["pv_estimate"]) #*1000) #* 0.5
                    #self._states[SensorType.forecast_today] = round(e_total, 3)
                    return round(e_total, 3)

                elif sensor_type == SensorType.forecast_tomorrow:
                    #tomorrow
                    e_total = 0.0
                    startdate = dt_util.now().replace(hour=0, minute=0, second=0, microsecond=0).astimezone() + timedelta(days=1)
                    enddate = startdate.replace(hour=23, minute=59, second=59, microsecond=0).astimezone()

                    startdate = startdate.strftime("%Y-%m-%d %H:%M")
                    enddate = enddate.strftime("%Y-%m-%d %H:%M")

                    events: list[Events] = (
                            session.query(Events.event_data)
                                .filter(Events.event_type == self._entry_id,
                                        Events.time_fired > startdate,
                                        Events.time_fired < enddate)
                                )

                    event_s: list[int] = [event.event_data for event in events]
                    
                    if event_s:
                        for item in event_s:
                            item = json.loads(item)
                            e_total = e_total + float(item["pv_estimate"]) #*1000) #* 0.5
                    #self._states[SensorType.forecast_tomorrow] = round(e_total, 3)
                    return round(e_total, 3)

                elif sensor_type == SensorType.forecast_today_remaining:
                    #left today forecast
                    e_total = 0.0
                    startdate = dt_util.now().replace(second=0,microsecond=0).astimezone()
                    enddate = startdate.replace(hour=23, minute=59, second=59, microsecond=0).astimezone()

                    startdate = startdate.strftime("%Y-%m-%d %H:%M")
                    enddate = enddate.strftime("%Y-%m-%d %H:%M")

                    events: list[Events] = (
                            session.query(Events.event_data)
                                .filter(Events.event_type == self._entry_id,
                                        Events.time_fired > startdate,
                                        Events.time_fired < enddate)
                                )

                    event_s: list[int] = [event.event_data for event in events]
                    
                    if event_s:
                        for item in event_s:
                            item = json.loads(item)
                            e_total = e_total + float(item["pv_estimate"]) #*1000) #* 0.5
                    #self._states[SensorType.forecast_today_remaining] = round(e_total, 3)
                    return round(e_total, 3)

        except Exception:
            _LOGGER.error("get_forecast_sensor_state: %s", traceback.format_exc())

    async def update_forecast_service(self, param=None):
        """Update forecast state service call."""
        try:
            _LOGGER.debug("Update forecast service called for rooftop id %s", self._resource_id)
            self._do_past_fetch = True
            await self.update_forecast(checktime=False)
            
        except Exception:
            _LOGGER.error("update_forecast_service: %s", traceback.format_exc())

    async def delete_all_forecast_data_service(self, param=None):
        """Delete all forecast data service"""
        try:
            with session_scope(hass=self._hass) as session:
                session.query(Events).filter(Events.event_type == self._entry_id).delete(synchronize_session=False)
                session.commit()
            
            _LOGGER.warning("Event: 'solcast_delete_all_forecasts' called.. All Forecast data is being deleted for rooftop id %s", self._resource_id)
            self._forecasts = None
            self.set_state(SensorType.forecast_today, 0.0)
            self.set_state(SensorType.forecast_tomorrow, 0.0)
            self.set_state(SensorType.forecast_today_remaining, 0.0)
            #self._states[SensorType.forecast_today] = 0
            #self._states[SensorType.forecast_today_remaining] = 0
            #self._states[SensorType.forecast_tomorrow] = 0

            await self._notify_listeners(SensorType.forecast_today)
            await self._notify_listeners(SensorType.forecast_today_remaining)
            await self._notify_listeners(SensorType.forecast_tomorrow)
        except Exception:
            _LOGGER.error("delete_all_forecast_data_service: %s", traceback.format_exc())

    async def log_debug_data(self, param=None):
        """log debug data"""
        try:
            _LOGGER.debug(self._debugData)
        except Exception:
            _LOGGER.error("log_debug_data: %s", traceback.format_exc())

    async def update_forecast(self, checktime:bool = True):
        """Update forecast state."""

        try:
            if self._forecast_entity_id is None:
                    _LOGGER.warning(
                        "Solcast entities not yet registered, try again next day"
                    )
                    return
            else:
                _doUpdate = True
                if checktime:
                    _LOGGER.debug("Update forecast by api call has been called.. checking if it is within sun rise/set times to proceed or not")
                    self._debugData["update_forecast_by_time_last_called"] = dt_util.now().astimezone().isoformat()
                    _hournow = dt_util.now().hour
                    if _hournow == 0 or (_hournow > self._starthour and _hournow < self._finishhour):
                        _doUpdate = True
                    else:
                        _doUpdate = False
                else:
                    self._debugData["forced_update_forecast_not_by_time_last_called"] = dt_util.now().astimezone().isoformat()

                if _doUpdate:
                    if not await self._fetch_forecasts():
                        _LOGGER.warning("Could not fetch data from Solcast, try again next day")
                        
                    else:
                        # Process data in case the forecast entity is already registered
                        _LOGGER.debug("Forecast successfully fetched for rooftop id %s", self._resource_id)

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

                        _LOGGER.debug("Updated forecasts from Solcast API for roofop id %s", self._resource_id)

                        self.set_state(SensorType.last_updated, dt_util.now().isoformat())
                        #self._states[SensorType.last_updated] = dt_util.now().isoformat() #dt_util.now().strftime("%Y%m%d%H%M%S")
                        await self._notify_listeners(SensorType.last_updated)  
                        
                        self.set_state(SensorType.api_count, self._api_used)
                        #self._states[SensorType.api_count] = self._api_used
                        await self._notify_listeners(SensorType.api_count)  
                else:
                    _LOGGER.debug("Forecast update called, but was not told to actually make the api call")
                
                #update the ha view of the states every hour  
                await self._notify_listeners(SensorType.forecast_today)
                await self._notify_listeners(SensorType.forecast_today_remaining)
                await self._notify_listeners(SensorType.forecast_tomorrow)

        except Exception:
            _LOGGER.error("update_forecast: %s", traceback.format_exc())

    def add_update_listener(self, listener):
        """Add a listener for update notifications."""
        try:
            self._update_listeners.append(listener)
            self._forecast_entity_id = listener.entity_id

            if listener.get_type() is SensorType.last_updated:
                try:
                    if not listener.state is None:
                        lu = listener.state 
                        if (dt_util.now().astimezone().timestamp() - lu.timestamp()) > 3600:
                            #been over an hour
                            self.do_update_been_aloong_time()
                        else:
                            #its been less than an hour so do nothing
                            _LOGGER.debug("less than an hour since last update successfully called at %s", lu)
                    else:
                        #is none.. first time setup prolly
                        self.do_update_been_aloong_time()
                except Exception:
                    #_LOGGER.error("add_update_listener: %s", traceback.format_exc())
                    pass

            # initial data is already loaded, thus update the component
            listener.update_callback()
        except Exception:
            _LOGGER.error("add_update_listener: %s", traceback.format_exc())

    async def _notify_listeners(self, type=None):
        """ Inform entities about updated values """
        try:
            #d = 0
            for listener in self._update_listeners:
                if type is None:
                    # type is not defined -> inform all sensors
                    listener.update_callback()
                    #d += 1
                elif listener.get_type() is type:
                    # inform only defined type
                    listener.update_callback()
                    #d += 1
            #_LOGGER.debug("Notified %d sensor listeners", d)
        except Exception:
            _LOGGER.error("_notify_listeners: %s", traceback.format_exc())

    async def _fetch_forecasts(self) -> bool:
        """Fetch the forecasts for this rooftop site."""
        try:
            resp = await self.request_data(f"/rooftop_sites/{self._resource_id}/forecasts", ssl=not self._disable_ssl)

            if resp is False:
                return False
            else:
                self._debugData["api_called_forecast_last_called_successfully"] = dt_util.now().astimezone().isoformat()

            fc = resp.get("forecasts")

            #if hour to do past then get that too
            n = dt_util.as_local(dt_util.now())

            if n.hour == 10 or n.hour == 14 or n.hour == 18 or self._forecasts is None or self._do_past_fetch == True:
                _LOGGER.debug("Updating Solcast estimated_actuals data")
                self._do_past_fetch = False #reset it
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
                    self._debugData["api_called_past_forecast_last_called_successfully"] = dt_util.now().astimezone().isoformat()
                else:
                    _LOGGER.info("Didnt get estimated_actuals inside _fetch_forecasts for %s", self._resource_id)

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

            wattsbefore = -1
            lastforecast = None
            f = []
            for forecast in fc["forecasts"]:
                watts = float(forecast["pv_estimate"])
                if not (watts == 0 and wattsbefore == 0):
                    if wattsbefore == 0:
                        lastforecast["period_end"] = parse_datetime(lastforecast["period_end"]).astimezone()
                        f.append(lastforecast)

                    forecast["period_end"] = parse_datetime(forecast["period_end"]).astimezone()
                    forecast["pv_estimate"] = round(float(forecast["pv_estimate"])*0.5,6)
                    f.append(forecast)

                wattsbefore = watts
                lastforecast = forecast

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
                    beforewatts = 0
                    wh_hours = {}
                    for item in event_s:
                        item = json.loads(item)
                        energy = float(item["pv_estimate"]*1000) #* 0.5
                        if energy > 0 or beforewatts > 0:
                            timestamp = parse_datetime(item['period_end']) - timedelta(minutes=30)
                            
                            #wh_hours
                            d = datetime(timestamp.year, timestamp.month, timestamp.day, timestamp.hour , 0, 0)

                            if d in wh_hours:
                                wh_hours[d] += energy
                            else:
                                wh_hours[d] = energy

                            beforewatts = energy

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

