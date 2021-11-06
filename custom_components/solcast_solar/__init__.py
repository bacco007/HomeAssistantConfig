"""Support for Solcast PV forecast."""
import asyncio
import json
import logging
import traceback
from datetime import datetime, timedelta
from enum import Enum
from operator import and_, itemgetter

import aiohttp
import homeassistant.util.dt as dt_util
from homeassistant.components.recorder.models import Events
from homeassistant.components.recorder.purge import _purge_event_ids
from homeassistant.components.recorder.util import session_scope
from homeassistant.const import (ATTR_FRIENDLY_NAME, CONF_API_KEY,
                                    EVENT_STATE_CHANGED, STATE_UNAVAILABLE,
                                    STATE_UNKNOWN, SUN_EVENT_SUNSET)
from homeassistant.core import EventOrigin, HomeAssistant, State, callback
from homeassistant.helpers.config_validation import date
from homeassistant.helpers.event import (async_call_later, async_track_sunrise,
                                            async_track_utc_time_change)
from homeassistant.helpers.sun import (get_astral_location,
                                        get_location_astral_event_next)
from isodate import parse_datetime, parse_duration
from sqlalchemy import and_

from .const import CONF_API_LIMIT, CONF_RESOURCE_ID, CONF_SSL_DISABLE, DOMAIN

PLATFORMS = ["sensor"]

_LOGGER = logging.getLogger(__name__)

_SERVICE_MAP = {
    "update_forecast": "update_forecast_service",
    "delete_all_forecast_data": "delete_all_forecast_data_service",
}


async def async_setup_entry(hass: HomeAssistant, entry) -> bool:
    """Set up solcast parameters."""

    try:
        hass.config_entries
        api_key = entry.options[CONF_API_KEY]
        resource_id = entry.options[CONF_RESOURCE_ID]
        api_limit = entry.options[CONF_API_LIMIT]
        disable_ssl = entry.options[CONF_SSL_DISABLE]

        _LOGGER.debug("Setting up Solcast for rooftop id %s",resource_id)

        rooftop_site = SolcastRooftopSite(hass, api_key, resource_id, api_limit, disable_ssl,entry.entry_id)

        hass.data[entry.entry_id] = rooftop_site

        # Register services to hass
        async def execute_service(call):
            """Execute a service to Solcast rooftop site.
            """

            function_name = _SERVICE_MAP[call.service]
            function_call = getattr(rooftop_site, function_name)
            await function_call(call.data)

        for service in _SERVICE_MAP:
            hass.services.async_register(DOMAIN, service, execute_service)

        hass.config_entries.async_setup_platforms(entry, PLATFORMS)

        # start periodic request of new data
        await rooftop_site.start_periodic_update()

        
        return True
    except Exception as err:
        _LOGGER.error("async_setup_entry: %s",traceback.format_exc())

    return False

class SensorType(Enum):
    """Representation of Solcast SensorTypes."""
    api_count = 1
    forecast_today = 2
    forecast_today_remaining = 3
    forecast_tomorrow = 4
    last_updated = 5
    
    
class SolcastAPI:
    """Representation of the Solcast API."""

    def __init__(self, api_key, api_limit):
        """Initialize solcast API."""

        self._api_key = api_key
        self._base_url = "https://api.solcast.com.au/"
        self._api_limit = api_limit
        self._api_remaining = self._api_limit

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
                self._api_remaining = 0
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
                if self._api_remaining == 0:
                    self._api_remaining = self._api_limit
                self._api_remaining = self._api_remaining - 1
                return json
        except Exception:
            _LOGGER.error("request_data: %s", traceback.format_exc())

    def reset_api_limit(self, *args):
        _LOGGER.debug("reset_api_limit has been reset back to its limit")
        self._api_remaining = self._api_limit


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

    

    def __init__(self, hass, api_key, resource_id, api_limit, disable_ssl, entryId):
        """Initialize solcast rooftop site."""

        super().__init__(api_key, api_limit)
        self._hass = hass
        self._entry_id = entryId
        self._resource_id = resource_id
        self._disable_ssl = disable_ssl
        self._forecast_entity_id = None
        self._api_limit = api_limit
        self._api_remaining = self._api_limit
        self._last_updated = dt_util.now()
        self._update_listeners = []
        self._forecasts = self.get_stored_forecast_data()

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
                    session.query(Events.event_data).filter( 
                    and_(
                        Events.event_type == self._entry_id, 
                        Events.time_fired >= fromDatetime,
                        Events.time_fired <= toDatetime
                        )
                    )
                )
                event_s: list[int] = [event.event_data for event in events]

                if event_s:
                    f = []
                    for forecast in event_s:
                        forecast = json.loads(forecast)
                        # Convert period_end and period. All other fields should already be the correct type
                        forecast["period_end"] = parse_datetime(forecast["period_end"])
                        forecast["period"] = parse_duration(forecast["period"])
                        forecast["period_start"] = forecast["period_end"] - forecast["period"]
                        forecast["pv_estimate"] = float(forecast["pv_estimate"])

                        f.append(forecast)

                    return f
                else:
                    #_LOGGER.warn("add nothing to get_stored_forecast_data")
                    return None

        except Exception:
            _LOGGER.error("get_stored_forecast_data: %s", traceback.format_exc())
            return None

    def delete_stored_forecast_data(self, fromDatetime:str):
        try:
            with session_scope(hass=self._hass) as session:
                events: list[Events] = (
                    session.query(Events.event_id).filter( 
                    and_(
                            Events.event_type == self._entry_id, 
                            Events.time_fired > fromDatetime
                        )
                    )
                    .all()
                )
                event_ids: list[int] = [event.event_id for event in events]
                #_LOGGER.debug(
                #    "Selected %s old DB records to remove", len(event_ids)
                #)

                if event_ids:
                    _purge_event_ids(session, event_ids)
                    #_LOGGER.debug("_purge_event_ids complete")

        except Exception:
            _LOGGER.error("delete_stored_forecast_data: %s", traceback.format_exc())
    
    async def start_periodic_update(self):
        """Start periodic data polling."""

        try:
            # Register API limit reset
            _LOGGER.debug("registering API limit reset")
            async_track_utc_time_change(self._hass, self.reset_api_limit, hour=0, minute=0, second=0, local=True)

            if self._forecasts is None:
                #first run
                #database was deleted but integration still active
                async_call_later(self._hass, 1, self.update_forecast)

            @callback
            def sunrise_call_action(now=None):
                try:
                    """Call action with right context."""
                    last_api_call_datetime = self.get_last_update_datetime()
                    
                    ac = self._states[SensorType.api_count]
                    if isinstance(ac, int):
                        self._api_remaining = int(ac)
                    else:
                        ac = int(ac)
                        
                    location, elevation = get_astral_location(self._hass)
                    next_setting = get_location_astral_event_next(
                        location, elevation, SUN_EVENT_SUNSET, dt_util.utcnow()
                    ) + timedelta(hours=1)
                    
                    #_LOGGER.warn(next_setting)
                    #_LOGGER.warn(dt_util.utcnow())
                    
                    if next_setting < dt_util.utcnow():
                        _LOGGER.debug("No updates to schedule for today. Sunset already. Will create a new schedule at sunrise tomorrow. You can use the Solcast PV Forecast: update_forecast service call to get call the API right now.")
                    else:
                        remove = 6
                        if ac > 0:
                            if (ac - remove) == 0:
                                remove = 7

                            _LOGGER.debug(f"Sun will set at {next_setting - timedelta(hours=1)}")

                            _LOGGER.debug("setting up the times to run forecast updates")

                            ## if last update time was more than an hour
                            ## if it was less than an hour add to delay
                            s = (dt_util.now().timestamp() - last_api_call_datetime.timestamp())

                            delay = (next_setting - dt_util.utcnow()) / (ac - remove)

                            _LOGGER.debug(f"During the day, there will be {ac} updates delayed by {delay} each")

                            s = delay.total_seconds() - s

                            time_before_start = False
                            if s > 0:
                                time_before_start = True
                            # Schedule updates over the day (starting on 0 to process early morning update)
                            for i in range(0, ac):
                                exec_delay = (delay.total_seconds() * i)
                                exec_time = dt_util.utcnow() + timedelta(seconds=exec_delay) 

                                if time_before_start:
                                    exec_delay = exec_delay + s
                                    exec_time = dt_util.utcnow() + timedelta(seconds=exec_delay) 
                                
                                _LOGGER.debug(f"Forecast update scheduled update at {exec_time.astimezone().isoformat()}")
                                async_call_later(self._hass, exec_delay, self.update_forecast)
                        else:
                            _LOGGER.debug("Zero API calls remain for use today. Will create a new schedule tomorrow when the API limit is reset")
                except Exception:
                    _LOGGER.error("sunrise_call_action: %s", traceback.format_exc())

            async_call_later(self._hass, 1, sunrise_call_action)
            async_track_sunrise(self._hass, sunrise_call_action)

            _LOGGER.debug("registering daily forecast update at 00:00:00")
            async_track_utc_time_change(self._hass, self.update_forecast, hour=0, minute=0, second=0, local=True)

            
        except Exception as err:
            _LOGGER.error("start_periodic_update : %s", err)

    async def update_forecast_service(self, param=None):
        """Update forecast state service call."""
        _LOGGER.debug("Update forecast service called")
        await self.update_forecast()

    async def delete_all_forecast_data_service(self, param=None):
        """Delete all forecast data service"""
        try:
            _LOGGER.warn("All Forecast data is being deleted")
            with session_scope(hass=self._hass) as session:
                events: list[Events] = (
                    session.query(Events.event_id)
                            .filter(Events.event_type == self._entry_id)
                            .all()
                )
                event_ids: list[int] = [event.event_id for event in events]

                if event_ids:
                    _purge_event_ids(session, event_ids)
                    _LOGGER.warn("All Forecast data has been purged")

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
            #_LOGGER.error("set_forecast_states : %s", traceback.format_exc())
            pass
    
    async def update_forecast(self, *args):
        """Update forecast state."""

        try:
            if self._forecast_entity_id is None:
                    _LOGGER.warning(
                        "Solcast entities not yet registered, try again next day"
                    )
            else:
                # Process it in case of successful fetching
                if not await self._fetch_forecasts():
                    _LOGGER.warning("Could not fetch data from Solcast, try again next day")
                    self.set_forecast_states()
                else:
                    # Process data in case the forecast entity is already registered
                    _LOGGER.debug("Forecast successfully fetched and entity available")

                    #delete old forecast values that fit within this data set
                    d = self._forecasts[0]["period_end"]
                    self.delete_stored_forecast_data(d.strftime("%Y-%m-%d %H:%M"))
                    #_LOGGER.debug("Updating the DB with %s records", len(self._forecasts))

                    # Process forecast data
                    for forecasts in self._forecasts:
                        d  = {"period_start": forecasts["period_start"].isoformat(), 
                                "period_end": forecasts["period_end"].isoformat(), 
                                "pv_estimate": forecasts["pv_estimate"],
                                "period": "PT30M"}

                        self._hass.bus.async_fire(
                            self._entry_id,
                            d,
                            EventOrigin.local,
                            time_fired=forecasts["period_end"]
                        )

                        await asyncio.sleep(5e-3)  # Wait 5ms for database persistence

                    ##self.set_forecast_states()
                    ##self._update_last_updated_sensor()

                    _LOGGER.debug("Updated forecasts from Solcast API")
                
                    self.set_forecast_states()
                    self._notify_listeners()

        except Exception:
            _LOGGER.error("update_forecast: %s", traceback.format_exc())

    def add_update_listener(self, listener):
        """Add a listener for update notifications."""
        try:
            self._update_listeners.append(listener)

            if listener.get_type() is SensorType.forecast_today:
                _LOGGER.debug(f"registered forecast_today sensor {listener.entity_id}")
            elif listener.get_type() is SensorType.forecast_today_remaining:
                _LOGGER.debug(f"registered forecast_today_remaining sensor {listener.entity_id}")
            elif listener.get_type() is SensorType.forecast_tomorrow:
                _LOGGER.debug(f"registered forecast_tomorrow sensor {listener.entity_id}")
            elif listener.get_type() is SensorType.api_count:
                _LOGGER.debug(f"registered API count sensor {listener.entity_id}")
                self._forecast_entity_id = listener.entity_id
            elif listener.get_type() is SensorType.last_updated:
                _LOGGER.debug(f"registered last_update sensor {listener.entity_id}")
            else:
                _LOGGER.warning("Try to register unknown sensor type")
            
            # initial data is already loaded, thus update the component
            listener.update_callback()
        except Exception:
            _LOGGER.error("add_update_listener: %s", traceback.format_exc())

    def _notify_listeners(self, type=None):
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
            _LOGGER.debug("Notified %d sensor listeners", d)
        except Exception:
            _LOGGER.error("_notify_listeners: %s", traceback.format_exc())

    def _calculate_energy_forecast(self, addDays:int = 0):
        """Calculate the total forecasted energy for the given day."""
        try:
            #_LOGGER.error("_calculate_energy_forecast: %s", addDays)
            e_total = 0.0
            startdate = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).astimezone() + timedelta(days=addDays)
            enddate = startdate.replace(hour=23, minute=59, second=59, microsecond=0).astimezone()
            for forecast in self._forecasts:
                f_start = forecast["period_start"]
                f_end = forecast["period_end"]
                if f_start >= startdate and f_end <= enddate:
                    #hours = forecast["period"].total_seconds() / 3600
                    #power = forecast["pv_estimate"]  # in kW
                    #energy = power * 0.5
                    #_LOGGER.error("found start: %s end: %s gross: %s", f_start, f_end, power)
                    e_total += forecast["pv_estimate"]
            #_LOGGER.error("_calculate_energy_forecast: %s start: %s end: %s gross: %s", startdate, enddate, e_total)
            return e_total
        except Exception:
            #_LOGGER.error("_calculate_energy_forecast: %s", traceback.format_exc())
            return

    def _calculate_energy_forecast_remaing_today(self):
        """Calculate the total forecasted energy for the given day."""
        try:
            e_total = 0.0
            startdate = datetime.now().replace(second=0,microsecond=0).astimezone()
            enddate = startdate.replace(hour=23, minute=59, second=59, microsecond=0).astimezone()
            for forecast in self._forecasts:
                f_start = forecast["period_start"]
                f_end = forecast["period_end"]
                if f_start >= startdate and f_end <= enddate:
                    #hours = forecast["period"].total_seconds() / 3600
                    #power = forecast["pv_estimate"]  # in kW
                    #energy = power * hours
                    e_total += forecast["pv_estimate"]
            #_LOGGER.debug("_calculate_energy_forecast_remaing_today: start: %s  end: %s,  total: %s",startdate, enddate, e_total)
            return e_total
        except Exception:
            #_LOGGER.error("_calculate_energy_forecast_remaing_today: %s", traceback.format_exc())
            return

    def _update_API_call_sensor(self):
        try:
            self._states[SensorType.api_count] = self._api_remaining
            _LOGGER.debug("Updated API count sensor")
        except Exception:
            _LOGGER.error("_update_API_call_sensor: %s", traceback.format_exc())

    def _update_last_updated_sensor(self):
        try:
            self._states[SensorType.last_updated] = dt_util.now().isoformat() #dt_util.now().strftime("%Y%m%d%H%M%S")
            _LOGGER.debug("Updated last_update (datetime) that successfully called Solcast API sensor")
        except Exception:
            _LOGGER.error("_update_last_updated_sensor: %s", traceback.format_exc())

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
                        f"/rooftop_sites/{self._resource_id}/estimated_actuals", ssl=not self._disable_ssl,hours=24
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
                    forecast["period"] = parse_duration(forecast["period"])
                    forecast["period_start"] = forecast["period_end"] - forecast["period"]
                    forecast["pv_estimate"] = round(float(forecast["pv_estimate"])*0.5,6)
                    f.append(forecast)

            self._forecasts = f

            self._update_API_call_sensor()
            self._update_last_updated_sensor()

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
                        energy = int(item["pv_estimate"]*1000) #* 0.5
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


