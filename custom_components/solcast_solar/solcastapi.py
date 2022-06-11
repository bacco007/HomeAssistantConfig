"""Solcast API."""
from __future__ import annotations
#from calendar import month

import json
import logging
#from threading import local
import traceback
from dataclasses import dataclass
from datetime import datetime as dt
from datetime import timedelta, timezone
from operator import itemgetter
from os.path import exists as file_exists
from typing import Any, cast

from aiohttp import ClientConnectionError, ClientSession
from aiohttp.client_reqrep import ClientResponse
from isodate import parse_datetime
#from pytz import HOUR, utc

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
            if key in {'period_end'}:
                ret[key] = dt.fromisoformat(value) 
            else:
                ret[key] = value
        return ret

@dataclass
class ConnectionOptions:
    """Solcast API options for connection."""

    api_key: str 
    host: str


class SolcastApi:
    """Solcast API rooftop."""

    def __init__(
        self,
        aiohttp_session: ClientSession,
        options: ConnectionOptions,
    ):
        """Device init."""
        self.aiohttp_session = aiohttp_session
        self.options = options
        self._sites = []
        self._data = dict({'forecasts':[], 'energy': {}, 'api_used':0, 'last_updated': dt.now(timezone.utc).replace(year=2000,month=1,day=1).isoformat()})
        self._api_used = 0
        self._filename = f'solcast.json'

    async def sites_data(self):
        """Request data via the Solcast API."""
        
        try:
            params = {"format": "json", "api_key": self.options.api_key}

            resp: ClientResponse = await self.aiohttp_session.get(
                url=f"{self.options.host}/rooftop_sites", params=params, ssl=False
            )

            resp_json = await resp.json(content_type=None)
            status = resp.status

            if status == 200:
                #self._api_used = self._api_used + 1
                d = cast(dict, resp_json)
                self._sites = d["sites"]
            else:
                _LOGGER.error(
                    f"Solcast Error {status} - Gathering rooftop sites data."
                )
                raise Exception(f"HTTP error: Solcast Error gathering rooftop sites data.")
        except ConnectionRefusedError as err:
            _LOGGER.error("Solcast Error.. %s",err)
        except ClientConnectionError as e:
            _LOGGER.error('Solcast Connection Error', str(e))
        except Exception as e:
            _LOGGER.error("Solcast http_data error: %s", traceback.format_exc())

    async def load_saved_data(self):

        if len(self._sites) > 0:
            if file_exists(self._filename):
                with open(self._filename) as data_file:
                    self._data = json.load(data_file, cls=JSONDecoder)
                if self._data and "api_used" in self._data:
                    self._api_used = self._data["api_used"]
            else:
                #no file to load
                await self.http_data()

    async def force_api_poll(self, *args):
        await self.http_data()

    def get_api_used_count(self) -> int:
        """Return API polling count for this UTC 24hr period"""
        try:
            return self._api_used
        except Exception:
            return -1

    def get_last_updated_datetime(self) -> dt:
        """Return date time with the data was last updated"""
        try:
            return dt.fromisoformat(self._data["last_updated"])
        except Exception:
            return dt.now(timezone.utc).replace(year=2000,month=1,day=1).isoformat()

    async def reset_api_counter(self):
        self._api_used = 0

    def get_rooftop_site_total_today(self, rooftopid = "") -> float:
        """Return a rooftop sites total kw for today"""
        #g = [d for d in self._sites if d['resource_id'] == rooftopid]   
        try:
            return self._data["siteinfo"][rooftopid]
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
            g = [d for d in self._data["forecasts"] if d['period_end'].date() == da]
            tot = 0
            for p in g:
                if p["period_end"].hour >= h:
                    tot += p["pv_estimate"]
            
            return round(tot,2)
        except Exception:
            return 0
    
    def get_forecast_today(self) -> dict[str, Any]:
        """Return Solcast Forecasts data for today"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date()
            g = [d for d in self._data["forecasts"] if d['period_end'].date() == da]
            return {"forecast": g}
        except Exception:
            return {}

    def get_forecast_tomorrow(self) -> dict[str, Any]:
        """Return Solcast Forecasts data for tomorrow"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=1)
            g = [d for d in self._data["forecasts"] if d['period_end'].date() == da]
            return {"forecast": g}
        except Exception:
            return {}

    def get_forecast_this_hour(self) -> int:
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).astimezone()
            g = [d for d in self._data["forecasts"] if d['period_end'] == da]   
            return int(g[0]['pv_estimate'] * 1000)
        except Exception:
            return 0

    def get_forecast_next_hour(self) -> int:
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).astimezone() + timedelta(hours=1)
            g = [d for d in self._data["forecasts"] if d['period_end'] == da]   
            return int(g[0]['pv_estimate'] * 1000)
        except Exception:
            return 0

    def get_total_kwh_forecast_today(self) -> float:
        """Return total kwh total for rooftop site today"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date()
            g = [d for d in self._data["forecasts"] if d['period_end'].date() == da]
            return round(sum(z['pv_estimate'] for z in g if z),2)
        except Exception:
            return 0

    def get_peak_w_today(self) -> int:
        """Return hour of max kw for rooftop site today"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date()
            g = [d for d in self._data["forecasts"] if d['period_end'].date() == da]
            m = max(z['pv_estimate'] for z in g if z) 
            return int(m * 1000)
        except Exception:
            return 0

    def get_peak_w_time_today(self) -> dt:
        """Return hour of max kw for rooftop site today"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date()
            g = [d for d in self._data["forecasts"] if d['period_end'].date() == da]
            m = max(z['pv_estimate'] for z in g if z) 

            for v in g:
                if v['pv_estimate'] == m:
                    return v['period_end']
                    #return p.isoformat()
            return None
        except Exception:
            return None

    def get_total_kwh_forecast_tomorrow(self) -> float:
        """Return total kwh total for rooftop site tomorrow"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=1)
            g = [d for d in self._data["forecasts"] if d['period_end'].date() == da]
            return round(sum(z['pv_estimate'] for z in g if z),2)
        except Exception:
            return 0

    def get_peak_w_tomorrow(self) -> int:
        """Return hour of max kw for rooftop site tomorrow"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=1)
            g = [d for d in self._data["forecasts"] if d['period_end'].date() == da]
            m = max(z['pv_estimate'] for z in g if z) 
            return int(m * 1000)
        except Exception:
            return 0

    def get_peak_w_time_tomorrow(self) -> dt:
        """Return hour of max kw for rooftop site tomorrow"""
        try:
            da = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=1)
            g = [d for d in self._data["forecasts"] if d['period_end'].date() == da]
            m = max(z['pv_estimate'] for z in g if z) 

            for v in g:
                if v['pv_estimate'] == m:
                    return v['period_end']
                    #  return p.isoformat() ??
            return None
        except Exception:
            return None
    
    def get_energy_data(self) -> dict[str, Any]:
        try:
            return self._data["energy"]
        except Exception as e:
            _LOGGER.error(e)
            return None

    async def http_data(self):
        """Request data via the Solcast API."""
        
        try:
            
            today = dt.now().date()

            _olddata = self._data

            self._data = []

            _s = {}

            for site in self._sites:
                _data = []
                
                ae = await self.fetch_data("estimated_actuals", 28, site['resource_id'])
                if not type(ae) is dict:
                    self._data = _olddata
                    return

                for x in ae['estimated_actuals']:
                    z = parse_datetime(x['period_end']).astimezone() - timedelta(minutes=30)
                    if z.date() == today:
                        _data.append({"period_end": z,"pv_estimate": x["pv_estimate"]*0.5})

                af = await self.fetch_data("forecasts", 168, site['resource_id'])
                if not type(af) is dict:
                    self._data = _olddata
                    return

                for x in af['forecasts']:
                    z = parse_datetime(x['period_end']).astimezone() - timedelta(minutes=30)
                    _data.append({"period_end": z,"pv_estimate": x["pv_estimate"]*0.5})
                
                _data = sorted(_data, key=itemgetter("period_end"))

                if not (len(_data) % 2) == 0:
                    del _data[-1]

                tally_today = 0
                for x in _data:
                    if x['period_end'].date() == today:
                        tally_today += x["pv_estimate"]

                _d = []
                it = iter(_data)
                for x in it:
                    _d.append({"period_end": x['period_end'],"pv_estimate": (x["pv_estimate"] + next(it)["pv_estimate"])})

                if len(self._data) == 0:
                    self._data = _d
                else:
                    for number in range(len(self._data)):
                        p = self._data[number]
                        p["pv_estimate"] = float(p["pv_estimate"]) + float(_d[number]["pv_estimate"])

                _s[site['resource_id']] = round(tally_today,2)
                
            

            self._data = sorted(self._data, key=itemgetter("period_end"))
            self._data = dict({"forecasts": self._data})

            self._data["energy"] = {"wh_hours": self.makeenergydict()}

            self._data["siteinfo"] = _s

            self._data["last_updated"] = dt.now(timezone.utc).isoformat()
            self._data['api_used'] = self._api_used

            with open(self._filename, 'w') as f:
                json.dump(self._data, f, ensure_ascii=False, cls=DateTimeEncoder)


        except Exception as e:
            _LOGGER.error("Solcast http_data error: %s", traceback.format_exc())

    async def fetch_data(self, path= "error", hours=50, site = "") -> dict[str, Any]:
        """fetch data via the Solcast API."""
        
        try:
            params = {"format": "json", "api_key": self.options.api_key, "hours": hours}

            resp: ClientResponse = await self.aiohttp_session.get(
                url=f"{self.options.host}/rooftop_sites/{site}/{path}", params=params, ssl=False
            )

            resp_json = await resp.json(content_type=None)
            status = resp.status

            if status == 429:
                _LOGGER.warning("Exceeded Solcast API allowed polling limit")
                self._api_used = 50
                raise Exception(f"HTTP error: Exceeded Solcast API allowed polling limit")
            elif status == 400:
                _LOGGER.error(
                    "The rooftop site missing capacity, please specify capacity or provide historic data for tuning."
                )
                raise Exception(f"HTTP error: The rooftop site missing capacity, please specify capacity or provide historic data for tuning.")
            elif status == 404:
                _LOGGER.error("The rooftop site cannot be found or is not accessible.")
                raise Exception(f"HTTP error: The rooftop site cannot be found or is not accessible.")
            elif status == 200:
                self._api_used = self._api_used + 1
                d = cast(dict, resp_json)
                return d
                #await self.format_json_data(d)
        except ConnectionRefusedError as err:
            _LOGGER.error("Solcast Error.. %s",err)
        except ClientConnectionError as e:
            _LOGGER.error('Solcast Connection Error', str(e))
        except Exception as e:
            _LOGGER.error("Solcast fetch_data error: %s", traceback.format_exc())

    def makeenergydict(self) -> dict:
        wh_hours = {}

        lastv = -1
        lastk = -1
        for v in self._data["forecasts"]:
            d = v['period_end'].isoformat()
            if v['pv_estimate'] == 0.0:
                if lastv > 0.0:
                    wh_hours[d] = v['pv_estimate'] * 1000
                lastk = d
                lastv = v['pv_estimate']
            else:
                if lastv == 0.0:
                    #add the last one
                    wh_hours[lastk] = lastv * 1000

                wh_hours[d] = v['pv_estimate'] * 1000
                
                lastk = d
                lastv = v['pv_estimate']

        return wh_hours
