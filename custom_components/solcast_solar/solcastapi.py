"""Solcast API."""
from __future__ import annotations

import asyncio
import copy
import json
import logging
import os
import traceback
from dataclasses import dataclass
from datetime import datetime as dt
from datetime import timedelta, timezone
from operator import itemgetter
from os.path import exists as file_exists
from typing import Any, cast

import async_timeout
from aiohttp import ClientConnectionError, ClientSession
from aiohttp.client_reqrep import ClientResponse
from isodate import parse_datetime

_JSON_VERSION = 2
_LOGGER = logging.getLogger(__name__)

class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, dt):
            return o.isoformat()

class JSONDecoder(json.JSONDecoder):
    def __init__(self, *args, **kwargs):
        json.JSONDecoder.__init__(
            self, object_hook=self.object_hook, *args, **kwargs)

    def object_hook(self, obj):
        ret = {}
        for key, value in obj.items():
            if key in {'period_start'}:
                ret[key] = dt.fromisoformat(value) 
            else:
                ret[key] = value
        return ret

@dataclass
class ConnectionOptions:
    """Solcast API options for connection."""

    api_key: str 
    host: str
    file_path: str


class SolcastApi:
    """Solcast API rooftop."""

    def __init__(
        self,
        aiohttp_session: ClientSession,
        options: ConnectionOptions,
        apiCacheEnabled: bool = False
    ):
        """Device init."""
        self.aiohttp_session = aiohttp_session
        self.options = options
        self.apiCacheEnabled = apiCacheEnabled
        self._sites = []
        self._data = dict({'forecasts':[], 'energy': {}, 'api_used':0, 'last_updated': dt.now(timezone.utc).replace(year=2000,month=1,day=1).isoformat()})
        self._api_used = 0
        self._filename = options.file_path
        self._apiallusedup = False

    async def sites_data(self):
        """Request data via the Solcast API."""
        
        try:
            sp = self.options.api_key.split(",")
            for spl in sp:
                #params = {"format": "json", "api_key": self.options.api_key}
                params = {"format": "json", "api_key": spl.strip()}
                _LOGGER.debug(f"SOLCAST - trying to connect to - {self.options.host}/rooftop_sites?format=json&api_key=REDACTED")
                async with async_timeout.timeout(60):
                    apiCacheFileName = "sites.json"
                    if self.apiCacheEnabled and file_exists(apiCacheFileName):
                        status = 404
                        with open(apiCacheFileName) as f:
                            resp_json = json.load(f)
                            status = 200
                    else:
                        resp: ClientResponse = await self.aiohttp_session.get(
                            url=f"{self.options.host}/rooftop_sites", params=params, ssl=False
                        )
        
                        resp_json = await resp.json(content_type=None)
                        status = resp.status
                        if self.apiCacheEnabled:
                            with open(apiCacheFileName, 'w') as f:
                                json.dump(resp_json, f, ensure_ascii=False)
                            
                    _LOGGER.debug(f"SOLCAST - sites_data code http_session returned data type is {type(resp_json)}")
                    _LOGGER.debug(f"SOLCAST - sites_data code http_session returned status {status}")

                if status == 200:
                    d = cast(dict, resp_json)
                    _LOGGER.debug(f"SOLCAST - sites_data returned data: {d}")
                    for i in d['sites']:
                        i['apikey'] = spl.strip()

                    self._sites = self._sites + d['sites']
                else:
                    _LOGGER.error(
                        f"SOLCAST - sites_data http status Error {status} - Gathering rooftop sites data."
                    )
                    raise Exception(f"SOLCAST - HTTP sites_data error: Solcast Error gathering rooftop sites data.")
        except ConnectionRefusedError as err:
            _LOGGER.error("SOLCAST - sites_data Error.. %s",err)
        except ClientConnectionError as e:
            _LOGGER.error('SOLCAST - sites_data Connection Error', str(e))
        except asyncio.TimeoutError:
            _LOGGER.error("SOLCAST - sites_data Connection Error - Timed out connection to solcast server")
        except Exception as e:
            _LOGGER.error("SOLCAST - sites_data sites_data error: %s", traceback.format_exc())

    async def load_saved_data(self):
        try:
            if len(self._sites) > 0:
                loadedData = False
                if not self.apiCacheEnabled and file_exists(self._filename):
                    with open(self._filename) as data_file:
                        jsonData = json.load(data_file, cls=JSONDecoder)
                        _LOGGER.debug(f"SOLCAST - load_saved_data file exists.. file type is {type(jsonData)}")
                        if jsonData.get("version", 1) == _JSON_VERSION:
                            loadedData = True
                            self._data = jsonData
                            if "api_used" in self._data:
                                self._api_used = self._data["api_used"]
                if not loadedData:
                    #no file to load
                    _LOGGER.debug(f"SOLCAST - load_saved_data there is no existing file to load")
                    await self.http_data(True)
            else:
                _LOGGER.debug(f"SOLCAST - load_saved_data site count is zero! ")
        except Exception as e:
            _LOGGER.error("SOLCAST - load_saved_data error: %s", traceback.format_exc())

    async def force_api_poll(self, *args):
        _LOGGER.debug(f"SOLCAST - force_api_poll called. Update actual data too: {args}")
        if args:
            await self.http_data(args[0])
        else:
            await self.http_data()

    async def delete_solcast_file(self, *args):
        _LOGGER.debug(f"SOLCAST - service event to delete old solcast.json file")
        try:
            if file_exists(self._filename):
                os.remove(self._filename)
                await self.sites_data()
                await self.load_saved_data()
        except Exception:
            _LOGGER.error(f"SOLCAST - service event to delete old solcast.json file failed")


    def get_api_used_count(self):
        """Return API polling count for this UTC 24hr period"""
        try:
            # sites = len(self._sites)
            # polls = self._api_used
            # if sites==1:
            #     #only one site
            #     return 50 - int(self._api_used)
            # elif sites%2 == 0:
            #     #even number of sites
            #     return 50 - int((polls / sites) * 2)
            # else:
            #     #odd number of sites.. max 2 sites per api_key.. so max polls for 2 sites
            #     return 50 - int((polls - (polls / sites)))
            if self._apiallusedup:
                return "Exceeded API Allowance"
            return self._api_used
        except Exception:
            return 50

    def get_last_updated_datetime(self) -> dt:
        """Return date time with the data was last updated"""
        try:
            return dt.fromisoformat(self._data["last_updated"])
        except Exception:
            _LOGGER.debug(f"SOLCAST - get_last_update_datetime try failed so returning year 2000")
            return dt.now(timezone.utc).replace(year=2000,month=1,day=1).isoformat()

    async def reset_api_counter(self):
        try:
            _LOGGER.debug(f"SOLCAST - API counter reset to zero in reset_api_counter code")
            _LOGGER.debug(f"SOLCAST - UTC midnight is when the counter resets to 0")
            self._apiallusedup = False
            self._api_used = 0

            self._data['api_used'] = self._api_used

            with open(self._filename, 'w') as f:
                json.dump(self._data, f, ensure_ascii=False, cls=DateTimeEncoder)

        except Exception as e:
            _LOGGER.error("SOLCAST - reset_api_counter error: %s", traceback.format_exc())

    def get_rooftop_site_total_today(self, rooftopid = "") -> float:
        """Return a rooftop sites total kw for today"""
        #g = [d for d in self._sites if d['resource_id'] == rooftopid]   
        try:
            return self._data["siteinfo"][rooftopid]['tally']
        except Exception:
            return 0

    def get_rooftop_site_extra_data(self, rooftopid = "") -> float:
        """Return a rooftop sites total kw for today"""
        try:
            g = [d for d in self._sites if d['resource_id'] == rooftopid]   
            site = g[0]
            d = {}

            if "name" in site:
                d["name"] = site["name"]
            if "resource_id" in site:
                d["resource_id"] = site["resource_id"]
            if "capacity" in site:
                d["capacity"] = site["capacity"]
            if "capacity_dc" in site:
                d["capacity_dc"] = site["capacity_dc"]
            if "longitude" in site:
                d["longitude"] = site["longitude"]
            if "latitude" in site:
                d["latitude"] = site["latitude"]
            if "azimuth" in site:
                d["azimuth"] = site["azimuth"]
            if "tilt" in site:
                d["tilt"] = site["tilt"]
            if "install_date" in site:
                d["install_date"] = site["install_date"]
            if "loss_factor" in site:
                d["loss_factor"] = site["loss_factor"]

            return d
        except Exception:
            return {}

    def get_remaining_today(self):
        """Return Remaining Forecasts data for today"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0)
            h = da.hour
            da = da.date()
            g = [d for d in self._data["forecasts"] if d['period_start'].date() == da]
            tot = 0
            for p in g:
                if p["period_start"].hour >= h:
                    tot += p["pv_estimate"]
            
            return round(tot,2)
        except Exception:
            return 0
    
    def get_forecast_today(self) -> dict[str, Any]:
        """Return Solcast Forecasts data for today"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date()
            g = [d for d in self._data["forecasts"]         if d['period_start'].date() == da]
            h = [d for d in self._data["detailedForecasts"] if d['period_start'].date() == da]
            return {"forecast":         g,
                    "detailedForecast": h,
                    "dayname":da.strftime("%A")}
        except Exception:
            return {}

    # def get_forecast_tomorrow(self) -> dict[str, Any]:
    #     """Return Solcast Forecasts data for tomorrow"""
    #     try:
    #         da = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=1)
    #         g = [d for d in self._data["forecasts"]         if d['period_start'].date() == da]
    #         h = [d for d in self._data["detailedForecasts"] if d['period_start'].date() == da]
    #         return {"forecast":         g,
    #                 "detailedForecast": h}
    #     except Exception:
    #         return {}
        
    def get_forecast_future_day(self, futureday = 1) -> dict[str, Any]:
        """Return Solcast Forecasts data for tomorrow"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=futureday)
            g = [d for d in self._data["forecasts"]         if d['period_start'].date() == da]
            h = [d for d in self._data["detailedForecasts"] if d['period_start'].date() == da]
            return {"forecast":         g,
                    "detailedForecast": h,
                    "dayname":da.strftime("%A")}
        except Exception:
            return {}
    

    def get_forecast_this_hour(self) -> int:
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).astimezone()
            g = [d for d in self._data["forecasts"] if d['period_start'] == da]   
            return int(g[0]['pv_estimate'] * 1000)
        except Exception:
            return 0

    def get_forecast_next_hour(self) -> int:
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).astimezone() + timedelta(hours=1)
            g = [d for d in self._data["forecasts"] if d['period_start'] == da]   
            return int(g[0]['pv_estimate'] * 1000)
        except Exception:
            return 0

    def get_total_kwh_forecast_today(self) -> float:
        """Return total kwh total for rooftop site today"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date()
            g = [d for d in self._data["forecasts"] if d['period_start'].date() == da]
            return round(sum(z['pv_estimate'] for z in g if z),2)
        except Exception:
            return 0

    def get_peak_w_today(self) -> int:
        """Return hour of max kw for rooftop site today"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date()
            g = [d for d in self._data["forecasts"] if d['period_start'].date() == da]
            m = max(z['pv_estimate'] for z in g if z) 
            return int(m * 1000)
        except Exception:
            return 0

    def get_peak_w_time_today(self) -> dt:
        """Return hour of max kw for rooftop site today"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date()
            g = [d for d in self._data["forecasts"] if d['period_start'].date() == da]
            m = max(z['pv_estimate'] for z in g if z) 

            for v in g:
                if v['pv_estimate'] == m:
                    va = v['period_start']
                    return va.time()
                    #return p.isoformat()
            return None
        except Exception:
            return None

    # def get_total_kwh_forecast_tomorrow(self) -> float:
    #     """Return total kwh total for rooftop site tomorrow"""
    #     try:
    #         da = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=1)
    #         g = [d for d in self._data["forecasts"] if d['period_start'].date() == da]
    #         return round(sum(z['pv_estimate'] for z in g if z),2)
    #     except Exception:
    #         return 0
        
    def get_total_kwh_forecast_furture_for_day(self, dayincrement = 1) -> float:
        """Return total kwh total for rooftop site tomorrow"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=dayincrement)
            g = [d for d in self._data["forecasts"] if d['period_start'].date() == da]
            return round(sum(z['pv_estimate'] for z in g if z),2)
        except Exception:
            return 0

    def get_peak_w_tomorrow(self) -> int:
        """Return hour of max kw for rooftop site tomorrow"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=1)
            g = [d for d in self._data["forecasts"] if d['period_start'].date() == da]
            m = max(z['pv_estimate'] for z in g if z) 
            return int(m * 1000)
        except Exception:
            return 0

    def get_peak_w_time_tomorrow(self) -> dt:
        """Return hour of max kw for rooftop site tomorrow"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=1)
            g = [d for d in self._data["forecasts"] if d['period_start'].date() == da]
            m = max(z['pv_estimate'] for z in g if z) 

            for v in g:
                if v['pv_estimate'] == m:
                    va = v['period_start']
                    return va.time()
                    #  return p.isoformat() ??
            return None
        except Exception:
            return None
    
    def get_energy_data(self) -> dict[str, Any]:
        try:
            return self._data["energy"]
        except Exception as e:
            _LOGGER.error(f"SOLCAST - get_energy_data: {e}")
            return None

    async def http_data(self, dopast = False):
        """Request data via the Solcast API."""
        
        try:
            
            today = dt.now().date()
            lastday = dt.now().date() + timedelta(days=7)

            #if dopast:
            _detailedForcast = []

            _s = {}

            _LOGGER.debug(f"SOLCAST - Polling API. Including past actual data: {dopast}")

            for site in self._sites:
                _LOGGER.debug(f"SOLCAST - API polling for rooftop {site['resource_id']}")
                # _LOGGER.debug(f" getting site: {site['resource_id']}")
                _data = []

                ae = None
                if dopast:
                    ae = await self.fetch_data("estimated_actuals", 28, site=site['resource_id'],  apikey=site['apikey'])
                    if not type(ae) is dict:
                        return

                    for x in ae['estimated_actuals']:
                        z = parse_datetime(x['period_end']).astimezone() - timedelta(minutes=30)
                        if z.date() == today:
                            # The pv_estimate from solcast is an average power figure. This code assumes
                            # each slot is 30 minutes long so *0.5 to convert to an energy figure in kwh 
                            _data.append({"period_start": z,"pv_estimate": x["pv_estimate"]*0.5})

                    _data = sorted(_data, key=itemgetter("period_start"))
                    #_s.update({site['resource_id']:{'estimated_actuals': _data}})

                af = await self.fetch_data("forecasts", 168, site=site['resource_id'], apikey=site['apikey'])
                if not type(af) is dict:
                    return

                _data2 = []
                for x in af['forecasts']:
                    z = parse_datetime(x['period_end']).astimezone() - timedelta(minutes=30)
                    if z.date() < lastday:
                        _data2.append({"period_start": z,"pv_estimate": x["pv_estimate"]*0.5,
                                                         "pv_estimate10": x["pv_estimate10"]*0.5,
                                                         "pv_estimate90": x["pv_estimate90"]*0.5})

                # _data2 = sorted(_data2, key=itemgetter("period_start"))
                # _s.update({site['resource_id']:{'forecasts': _data2}})
                
                if dopast:
                    # There can be some overlap between the estimated actuals and the forecast, so only add
                    # a forcast sample if we don't already have that data point.
                    actualsTimestamps = list(map(lambda x: x["period_start"], _data))
                    _data.extend(filter(lambda x: x["period_start"] not in actualsTimestamps, _data2))
                else:
                    #_LOGGER.debug("not doing past data so fill ion the blanks")
                    _data = self._data['siteinfo'][site['resource_id']]['forecasts']

                    #v3.0.26 change for issue 83
                    if not _data2:
                        _LOGGER.debug(f"SOLCAST - No new data. Solcast returned {_data2}")
                    else:
                        for item in _data2:
                            item = dict(item)
                            found_data = [d for d in _data if d['period_start'] == item['period_start']]
                            if len(found_data) > 0:
                                #_LOGGER.warn(f"found this to update {found_data[0]} with {item}")
                                found_data[0].update(item)
                            else:
                                #_LOGGER.warn(f"did not found update so adding to list: {item}")
                                _data.append(item)

                _data = sorted(_data, key=itemgetter("period_start"))
                _s.update({site['resource_id']:{'forecasts': copy.deepcopy(_data)}})

                # _LOGGER.debug("OK up to here now.. should be midnight today")
                # _LOGGER.debug(_data[0])

                for n in range(len(_data)-1):
                    _sec = _data[n+1]["period_start"] - _data[n]["period_start"]
                    if _sec.seconds > 1800:  #more than 30min then we are missing data
                        #_LOGGER.warn(f"Solcast missing forecast interval item from {_data[n]['period_start']} to {_data[n+1]['period_start']}")
                        findme = _data[n]["period_start"] + timedelta(minutes=30)
                        if site['resource_id'] in self._data:
                            if 'forecasts' in self._data[site['resource_id']] :
                                
                                inset_data = [d for d in self._data[site['resource_id']]["forecasts"] if d['period_start'] == findme.isoformat()]
                                if len(inset_data) > 0:
                                    inset_data = inset_data[0]
                                    z = parse_datetime(inset_data['period_start']).astimezone() 
                                    #_LOGGER.debug("adding missing solcast item {inset_data}")
                                    newElement = {"period_start": z,"pv_estimate": inset_data["pv_estimate"]}
                                    if "pv_estimate10" in inset_data and "pv_estimate90" in inset_data:
                                        newElement["pv_estimate10"] = inset_data["pv_estimate10"]
                                        newElement["pv_estimate90"] = inset_data["pv_estimate90"]
                                    else:
                                        newElement["pv_estimate10"] = 0
                                        newElement["pv_estimate90"] = 0
                                    _data.append(newElement)
                                else:
                                    #_LOGGER.debug("IS old data to fill in the missing data but didnt find any match so adding empty item as 0 value")
                                    _data.append({"period_start": findme.astimezone(),"pv_estimate": 0, "pv_estimate10": 0, "pv_estimate90": 0})
                        else:
                            #_LOGGER.debug("No old data to fill in the missing data so adding empty item as 0 value")
                            _data.append({"period_start": findme.astimezone(),"pv_estimate": 0, "pv_estimate10": 0, "pv_estimate90": 0})

                _data = sorted(_data, key=itemgetter("period_start"))

                if not (len(_data) % 2) == 0:
                    del _data[-1]

                tally_today = 0
                for x in _data:
                    if x['period_start'].date() == today:
                        tally_today += x["pv_estimate"]

                _s[site['resource_id']]['tally'] = round(tally_today,2)

                # _LOGGER.debug("next data check.. should be midnight today")
                # _LOGGER.debug(_data[0])

                # Combine the data from the current solar array with the previous ones
                if len(_detailedForcast) == 0:
                    #_LOGGER.debug("_detailedForcost len is zero")
                    _detailedForcast = _data
                else:
                    #_LOGGER.debug("hmmm _detailedForcost len is not zero")
                    for number in range(len(_detailedForcast)):
                        p = _detailedForcast[number]
                        p["pv_estimate"] = float(p["pv_estimate"]) + float(_data[number]["pv_estimate"])
                        # Merge the 10 and 90 % estimates. But only leave the keys in the dict if they are present in both the sources
                        has10 = "pv_estimate10" in p
                        has90 = "pv_estimate90" in p
                        if has10 and has90 and "pv_estimate10" in p and "pv_estimate90" in p:
                            p["pv_estimate10"] = float(p["pv_estimate10"]) + float(_data[number]["pv_estimate10"])
                            p["pv_estimate90"] = float(p["pv_estimate90"]) + float(_data[number]["pv_estimate90"])
                        else:
                            if has10:
                                del p["pv_estimate10"]
                            if has90:
                                del p["pv_estimate90"]

            # Combine pairs of samples to get slot lengths of 1 hour
            _newData = []
            it       = iter(_detailedForcast)
            for x in it:
                a = x
                b = next(it)
                # if not a['period_start'].hour == b['period_start'].hour:
                #     #_LOGGER.error(f"not same hour for {a} and {b}")
                #     _LOGGER.warn(f"solcast - api error.. dam it! still missing data from solcast api between hours {a} and {b}")
                if a['period_start'].minute == 0:
                    _newData.append({"period_start": a['period_start'],"pv_estimate": (a["pv_estimate"] + b["pv_estimate"])})
                else:
                    #_LOGGER.warn("hmm this should not have data at the 30min mark.. should be on the hour values")
                    _t = a['period_start'].replace(minute=0)
                    _newData.append({"period_start": _t,"pv_estimate": (a["pv_estimate"] + b["pv_estimate"])})

            if _newData == []:
                self._data['api_used'] = self._api_used
            else:
                #self._data = sorted(self._data, key=itemgetter("period_start"))
                self._data = dict({"forecasts": _newData,
                                    "detailedForecasts": _detailedForcast})

                self._data["energy"] = {"wh_hours": self.makeenergydict()}

                self._data["siteinfo"] = _s

                self._data["last_updated"] = dt.now(timezone.utc).replace(second=0 ,microsecond=0).isoformat()
                self._data['api_used'] = self._api_used
                self._data['version'] = _JSON_VERSION

            with open(self._filename, 'w') as f:
                json.dump(self._data, f, ensure_ascii=False, cls=DateTimeEncoder)


        except Exception as e:
            _LOGGER.error("SOLCAST - http_data error: %s", traceback.format_exc())

    async def fetch_data(self, path= "error", hours=50, site="", apikey="") -> dict[str, Any]:
        """fetch data via the Solcast API."""
        
        try:
            params = {"format": "json", "api_key": apikey, "hours": hours}
            url=f"{self.options.host}/rooftop_sites/{site}/{path}"
            _LOGGER.debug(f"SOLCAST - fetch_data code url - {url}")

            async with async_timeout.timeout(60):
                apiCacheFileName = path + "_" + site + ".json"
                if self.apiCacheEnabled and file_exists(apiCacheFileName):
                    status = 404
                    with open(apiCacheFileName) as f:
                        resp_json = json.load(f)
                        status = 200
                else:
                    _LOGGER.debug(f"SOLCAST - OK REAL API CALL HAPPENING RIGHT NOW")
                    resp: ClientResponse = await self.aiohttp_session.get(
                        url=url, params=params, ssl=False
                    )
                    status = resp.status

                    if status == 200:
                        _LOGGER.debug(f"SOLCAST - API returned data. API Counter incremented from {self._api_used} to {self._api_used + 1}")
                        self._api_used = self._api_used + 1
    
                    resp_json = await resp.json(content_type=None)

                    if self.apiCacheEnabled:
                        with open(apiCacheFileName, 'w') as f:
                            json.dump(resp_json, f, ensure_ascii=False)
                        
                _LOGGER.debug(f"SOLCAST - fetch_data code http_session returned data type is {type(resp_json)}")
                _LOGGER.debug(f"SOLCAST - fetch_data code http_session status is {status}")

            if status == 429:
                _LOGGER.warning("SOLCAST - Exceeded Solcast API allowed polling limit")
                self._apiallusedup = True
                self._api_used = 50
                #raise Exception(f"HTTP error: Exceeded Solcast API allowed polling limit")
            elif status == 400:
                _LOGGER.warning(
                    "SOLCAST - The rooftop site missing capacity, please specify capacity or provide historic data for tuning."
                )
                #raise Exception(f"HTTP error: The rooftop site missing capacity, please specify capacity or provide historic data for tuning.")
            elif status == 404:
                _LOGGER.error("SOLCAST - Error 404. The rooftop site cannot be found or is not accessible.")
                #raise Exception(f"HTTP error: The rooftop site cannot be found or is not accessible.")
            elif status == 200:
                d = cast(dict, resp_json)
                _LOGGER.debug(f"SOLCAST - fetch_data Returned: {d}")
                return d
                #await self.format_json_data(d)
        except ConnectionRefusedError as err:
            _LOGGER.error("SOLCAST - Error. Connection Refused. %s",err)
        except ClientConnectionError as e:
            _LOGGER.error('SOLCAST - Connection Error', str(e))
        except asyncio.TimeoutError:
            _LOGGER.error("SOLCAST - Connection Timeout Error - Timed out connectng to Solcast API server")
        except Exception as e:
            _LOGGER.error("SOLCAST - fetch_data error: %s", traceback.format_exc())

        return None

    def makeenergydict(self) -> dict:
        wh_hours = {}

        try:
            lastv = -1
            lastk = -1
            for v in self._data["forecasts"]:
                d = v['period_start'].astimezone().isoformat() #.isoformat()
                if v['pv_estimate'] == 0.0:
                    if lastv > 0.0:
                        wh_hours[d] = round(v['pv_estimate'] * 1000,0)
                    lastk = d
                    lastv = v['pv_estimate']
                else:
                    if lastv == 0.0:
                        #add the last one
                        wh_hours[lastk] = round(lastv * 1000,0)

                    wh_hours[d] = round(v['pv_estimate'] * 1000,0)
                    
                    lastk = d
                    lastv = v['pv_estimate']
        except Exception as e:
            _LOGGER.error("SOLCAST - makeenergydict: %s", traceback.format_exc())

        return wh_hours