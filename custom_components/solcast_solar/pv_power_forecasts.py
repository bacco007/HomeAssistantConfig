"""Asynchronous Python client for the Solcast Solar API."""
from __future__ import annotations

import logging
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from operator import itemgetter
from typing import Any

from aiohttp import ClientSession
from isodate import parse_datetime, parse_duration
from yarl import URL

from .estimate import Estimate


@dataclass
class PvPowerForecasts:
    
    api_key : str
    rooftop : str
    format: str | None = 'json'
    close_session: bool = False
    session: ClientSession | None = None
    end_point: str | None = ''
    savedata: dict | None = None
    _apilimit: bool | None = False
    _lastcheck: datetime | None = datetime.now() - timedelta(seconds=360)
    _apicount: int | None = 0
    _firstrun: bool | None = True


    async def _request(self, params: Mapping[str, str] | None = None,):# -> dict[str, Any]:

        # Connect as normal
        url = URL.build(scheme="https", host="api.solcast.com.au")

        url = url.join(URL(self.end_point))

        if self.session is None:
            self.session = ClientSession()
            self.close_session = True

        response = await self.session.request(
            "GET",
            url,
            params=params,
            headers={"Host": "api.solcast.com.au"},
            ssl=False,
        )   
        
        #response.raise_for_status()

        content_type = response.headers.get("Content-Type", "")
        if "application/json" not in content_type:
            text = await response.text()
            raise Exception(
                "Unexpected response from the Solcast Solar API",
                {"Content-Type": content_type, "response": text},
            )

        status = response.status
        if status == 429:
            logging.warning("Exceeded Solcast API rate limit. Trying again after midnight UTC")
            self._apilimit = True
            self._apicount = 50
            return False
        elif status == 400:
            logging.error(
                "The rooftop site missing capacity, please specify capacity."
            )
            return False
        elif status == 404:
            logging.error("The rooftop site cannot be found or is not accessible.")
            return False
        elif status == 200:
            logging.debug("Solcast API data request successful")
            if self._apicount < 0 or self._apicount == 50:
                self._apicount = 0
            self._apicount = self._apicount + 1
            return await response.json()

    def get_API_count(self):
        return self._apicount

    async def estimate(self) -> Estimate:

        self.end_point = 'rooftop_sites/' + self.rooftop + '/forecasts' 
        n = datetime.now()

        logging.debug("Solcast Forecast Estimate Called")

        fd = parse_datetime(f"2001-01-01T08:00:00.0000000Z").replace(tzinfo=timezone.utc).astimezone(tz=None)
        fp = parse_duration("PT30M")
        blankdata = dict({"forecasts":[{"pv_estimate":0.0,"period_end":fd,"period":fp}], "api_count": self._apicount})

        diff = n - self._lastcheck
        if diff.seconds < 3000 and self._firstrun == False:
            #to make sure the API isnt call over and over if there is an error.. only have 50 calls to use a day
            if self.savedata == None:
                return Estimate.from_dict(blankdata)
            else:
                return Estimate.from_dict(self.savedata)

        doData2 = False

        if self._firstrun == False:
            if n.hour < 5 or n.hour > 19:
                #the API is only polled between 5am and 7pm
                if self.savedata == None:
                    return Estimate.from_dict(blankdata)
                else:
                    return Estimate.from_dict(self.savedata)
        else:
            doData2 = True

        self._lastcheck = datetime.now()

        if self._lastcheck.hour == 10 or self._lastcheck.hour == 12 or self._lastcheck.hour == 14 or self._lastcheck.hour == 16 or self._lastcheck.hour == 19:
            doData2 = True

        #data1 = await self._request(
        #    params={"latitude": self.latitude, "longitude": self.longitude, "capacity": self.capacity, "tilt": self.tilt, "azimuth": self.azimuth, "loss_factor":self.efficiencyfactor, "format": "json", "api_key":self.api_key},
        #)
        data1 = await self._request(
            params={"hours": 168, "format": "json", "api_key":self.api_key},
        )

        if data1 is False:
            if self.savedata == None:
                return Estimate.from_dict(blankdata)
            else:
                #failed to get data1 so returning last known data
                return Estimate.from_dict(self.savedata)
        
        #if first run time load last prevous week data too
        if doData2:
            #self.end_point = 'pv_power/estimated_actuals'
            #data2 = await self._request(
            #    params={"latitude": self.latitude, "longitude": self.longitude, "capacity": self.capacity, "tilt": self.tilt, "azimuth": self.azimuth, "loss_factor":self.efficiencyfactor, "format": "json", "api_key":self.api_key},
            #)
            self.end_point = 'rooftop_sites/' + self.rooftop + '/estimated_actuals'
            data2 = await self._request(
                params={"hours": 168, "format": "json", "api_key":self.api_key},
            )
            if not data2 is False:
                #mixing data1 and data2
                data1 = dict({"forecasts": (data1.get("forecasts") + data2.get("estimated_actuals"))})

        midnightsevenago = datetime(self._lastcheck.year, self._lastcheck.month, self._lastcheck.day, 0, 0, 0, 0) + timedelta(days=-6)
        midnightsevenago = datetime.astimezone(midnightsevenago,tz=timezone.utc)

        midnightinsevendays = datetime(self._lastcheck.year, self._lastcheck.month, self._lastcheck.day, 0, 0, 0, 0) + timedelta(days=6)
        midnightinsevendays = datetime.astimezone(midnightinsevendays,tz=timezone.utc)

        if self.savedata == None:
            self.savedata = dict({"forecasts": []})

        wattsbefore = -1
        for forecast in data1.get("forecasts"):
            # Convert period_end and period. All other fields should already be the correct type
            forecastdate = parse_datetime(forecast["period_end"]).replace(tzinfo=timezone.utc).astimezone(tz=None)
            watts = float(forecast["pv_estimate"]) * 1000.0
            if (forecastdate > midnightsevenago and forecastdate < midnightinsevendays) and not (watts == 0 and wattsbefore == 0):
                forecast["pv_estimate"] = float(forecast["pv_estimate"]) * 1000.0
                forecast["period_end"] = forecastdate
                forecast["period"] = parse_duration(forecast["period"])
                starttime = forecast["period_end"] - forecast["period"]
                forecast["period_start"] = starttime
                found_index = next((index for (index, d) in enumerate(self.savedata.get("forecasts")) if d["period_end"] == forecastdate), None)
                if found_index == None:
                    self.savedata["forecasts"].append(forecast)
                else:
                    self.savedata["forecasts"][found_index] = forecast
            wattsbefore = watts

        forecasts = self.savedata.get("forecasts")

        #if len(forecasts) > 700:
        #    logging.warn("trimming the forecast data")
        #    over = len(forecasts) - 700
        #    del forecasts[:over]

        #sort the list by date - this is to make sure the next part of the code
        #can remove that first or last item is they are of the half hour mark
        f = itemgetter('period_end')
        forecasts = sorted(forecasts, key=itemgetter('period_end'))

        #remove odd hour elements from first and last because it messes up the KWh values
        if len(forecasts) > 2:
            if forecasts[0]['period_end'].minute == 30:
                del forecasts[0]
            #if forecasts[-1]['period_end'].minute == 0:
            #    del forecasts[-1]

        self._firstrun = False

        self.savedata = dict({"forecasts": forecasts, "api_count": self._apicount})

        return Estimate.from_dict(self.savedata)

    async def close(self) -> None:
        """Close open client session."""
        if self.session and self.close_session:
            await self.session.close()

    async def __aenter__(self) -> PvPowerForecasts:
        """Async enter.

        Returns:
            The SolcastSolar object.
        """
        return self

    async def __aexit__(self, *_exc_info) -> None:
        """Async exit.

        Args:
            _exc_info: Exec type.
        """
        await self.close()
