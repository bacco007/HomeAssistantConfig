"""define the weather class"""

from datetime import date, datetime, timezone
import json

#from pyowm import OWM
import logging
from os.path import exists, join
import pickle
import re

import pytz

from homeassistant.const import (
    CONF_API_KEY,
    CONF_LATITUDE,
    CONF_LOCATION,
    CONF_LONGITUDE,
    CONF_NAME,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_INTIAL_DAYS,
    CONF_MAX_CALLS,
    CONF_MAX_DAYS,
    CONST_API_CALL,
    CONST_API_FORECAST,
    CONST_CALLS,
)
from .data import RestData

_LOGGER = logging.getLogger(__name__)

DEFAULT_NAME = "OpenWeatherMap History"

class Weather():
    """weather class."""
    
    def __init__(
        self,
        hass: HomeAssistant,
        config,
    ) -> None:

        self._timezone     = hass.config.time_zone
        self._hass         = hass
        self._config       = config
        self._processed    = {}
        self._num_days     = 0
        self._name      = config.get(CONF_NAME,DEFAULT_NAME)
        self._lat       = config[CONF_LOCATION].get(CONF_LATITUDE,hass.config.latitude)
        self._lon       = config[CONF_LOCATION].get(CONF_LONGITUDE,hass.config.longitude)
        self._key       = config[CONF_API_KEY]
        self._initdays  = config.get(CONF_INTIAL_DAYS,5)
        self._maxdays   = config.get(CONF_MAX_DAYS,5)
        self._maxcalls  = config.get(CONF_MAX_CALLS,1000)
        self._backlog   = 0
        self._processing_type = None
        self._daily_count     = 1
        self._cumulative_rain = 0
        self._cumulative_snow = 0

    def get_stored_data(self, name):
        """Return stored data."""
        file = join(self._hass.config.path(), cv.slugify(name)  + '.pickle')
        if not exists(file):
            return {}
        with open(file, 'rb') as myfile:
            content = pickle.load(myfile)
        myfile.close()
        return content

    def store_data(self, content, name):
        """Store uri timestamp to file."""

        keys = list(content.keys())
        keys.sort()
        sorted_dict = {i: content[i] for i in keys}

        file = join(self._hass.config.path(), cv.slugify(name) + '.pickle')
        with open(file, 'wb') as myfile:
            pickle.dump(sorted_dict, myfile, pickle.HIGHEST_PROTOCOL)
        myfile.close()

    def validate_data(self, data) -> bool:
        """check if the call was successful"""
        jdata = json.loads(data)
        try:
            code    = jdata["cod"]
            message = jdata["message"]
            _LOGGER.error('OpenWeatherMap call failed code: %s: %s', code, message)
            return data
        except KeyError:
            return data

    def remaining_backlog(self):
        "return remaining days to collect"
        return self._backlog

    async def get_forecastdata(self):
        """get forecast data"""
        url = CONST_API_FORECAST % (self._lat,self._lon, self._key)
        rest = RestData()
        await rest.set_resource(self._hass, url)
        await rest.async_update(log_errors=True)
        data = self.validate_data(rest.data)
        try:
            data = json.loads(data)
            #check if the call was successful
            days = data.get('daily',{})
            current = data.get('current',{})
        except TypeError:
            _LOGGER.warning('OpenWeatherMap forecast call failed %s', rest.data)
            return
        self._daily_count += 1

        #current observations
        currentdata = {"rain":current.get('rain',{}).get('1h',0)
                    , "snow":current.get('snow',{}).get('1h',0)
                    , "temp":current.get("temp",0)
                    , "humidity":current.get("humidity",0)
                    , "pressure":current.get("pressure",0)}
        #build forecast
        forecastdaily = {}
        for day in days:
            temp = day.get('temp',{})
            daydata = {'max_temp':temp.get('max',0),
                       'min_temp':temp.get('min',0),
                       'pressure':day.get('pressure',0),
                       'humidity':day.get('humidity',0),
                       'pop':day.get('pop',0),
                       'rain': day.get('rain',0),
                       'snow':day.get('snow',0)}
            forecastdaily.update({day.get('dt') : daydata})

        return currentdata, forecastdaily

    async def processcurrent(self,current):
        """process the currrent data"""
        current_data ={ 'current': {'rain': current.get('rain')
                                   , 'snow': current.get('snow')
                                   , 'humidity': current.get('humidity')
                                   , 'temp': current.get('temp')
                                   , 'pressure': current.get('pressure')}
                                   }
        return current_data

    async def processdailyforecast(self,dailydata):
        "process daily forecast data"
        processed_data = {}
        i = 0
        for data in dailydata.values():
            #get the days data
            day = {}
            #update the days data
            day.update({"pop":data.get('pop',0)})
            day.update({"rain":data.get('rain',0)})
            day.update({"snow":data.get('snow',0)})
            day.update({"min_temp":data.get('min_temp',0)})
            day.update({"max_temp":data.get('max_temp',0)})
            day.update({"humidity":data.get('humidity',0)})
            day.update({"pressure":data.get('pressure',0)})
            processed_data.update({f'f{i}':day})
            i += 1
        return processed_data

    async def processhistory(self,historydata):
        """process history data"""
        removehours = []
        localtimezone = pytz.timezone(self._timezone)
        processed_data = {}
        for hour, data in historydata.items():
            localday = datetime.utcfromtimestamp(hour).replace(tzinfo=timezone.utc).astimezone(tz=localtimezone)
            localnow = datetime.now(localtimezone)
            localdaynum = (localnow - localday).days
            self._num_days = max(self._num_days,localdaynum)
            if localdaynum > self._maxdays-1:
                #identify data to age out
                removehours.append(hour)
                continue
            #get the days data
            day = processed_data.get(localdaynum,{})
            #process the new data
            rain = day.get('rain',0) + data["rain"]
            snow = day.get('snow',0) + data["snow"]
            mintemp = min(data["temp"],day.get('min_temp',999), 999)
            maxtemp = max(data["temp"],day.get('max_temp',-999), -999)
            #update the days data
            day.update({"rain":rain})
            day.update({"snow":snow})
            day.update({"min_temp":mintemp})
            day.update({"max_temp":maxtemp})
            processed_data.update({localdaynum:day})
        #age out old data
        for hour in removehours:
            historydata.pop(hour)
        return historydata,processed_data

    def set_processing_type(self,option):
        """allow setting of the processing type"""
        self._processing_type = option

    def num_days(self) -> int:
        """ return how many days of data has been collected"""
        return self._num_days

    def daily_count(self) -> int:
        """ return how many days of data has been collected"""
        return self._daily_count


    def cumulative_rain(self) -> float:
        """ return how many days of data has been collected"""
        return self._cumulative_rain

    def cumulative_snow(self) -> float:
        """ return how many days of data has been collected"""
        return self._cumulative_snow

    def processed_value(self, period, value) -> float:
        """return the days current rainfall"""
        data = self._processed.get(period,{})
        return data.get(value,0)

    async def show_call_data(self):
        """call the api and show the result"""
        hour = datetime(date.today().year, date.today().month, date.today().day,datetime.now().hour)
        thishour = int(datetime.timestamp(hour))
        url = CONST_API_CALL % (self._lat,self._lon, thishour, self._key) #self._key
        rest = RestData()
        await rest.set_resource(self._hass, url)
        await rest.async_update(log_errors=True)

        _LOGGER.warning(self.validate_data(rest.data))

    async def async_update(self):
        '''update the weather stats'''
        hour = datetime(date.today().year, date.today().month, date.today().day,datetime.now().hour)
        thishour = int(datetime.timestamp(hour))
        day = datetime(date.today().year, date.today().month, date.today().day)
        #GMT midnight
        midnight = int(datetime.timestamp(day))
        #restore saved data
        storeddata = self.get_stored_data(self._name)
        historydata = storeddata.get("history",{})
        currentdata = storeddata.get('current',{})
        dailydata = storeddata.get('dailyforecast',{})
        self._cumulative_rain = storeddata.get('cumulativerain',0)
        self._cumulative_snow = storeddata.get('cumulativesnow',0)

        dailycalls = self.get_stored_data('owm_api_count').get('dailycalls',{})
        self._daily_count = dailycalls.get('count',0)

        #reset the daily count on new UTC day
        if dailycalls.get('time',0) < midnight:
            #it is a new day
            self._daily_count = 0
            dailycalls = {'time': midnight,'count':self._daily_count}
            self.store_data({ 'dailycalls':dailycalls},'owm_api_count')
            warning_issued = False

        #do not process when no calls remaining
        if self._daily_count > self._maxcalls:
            #only issue a single warning each day
            if not warning_issued:
                _LOGGER.warning('Maximum daily allowance of API calls have been used')
                warning_issued = True
            return
        warning_issued = False

        match self._processing_type:
            case 'initial':
                #on start up just get the latest hour
                try:
                    lastdt = max(historydata)
                except ValueError:
                    #just get one hour
                    lastdt = thishour - 3600
            case 'backload':
                #just process the history data
                lastdt = thishour
                historydata = await self.async_backload(historydata)
            case _:
                try:
                    lastdt = max(historydata)
                except ValueError:
                    #backdate the required number of days
                    lastdt = thishour - 3600*CONST_CALLS

        #get new data if required
        if lastdt < thishour:
            data = await self.get_forecastdata()
            if data is None:
                #httpx request failed
                return
            currentdata = data[0]
            dailydata = data[1]
            historydata = await self.get_historydata(historydata)

        #recaculate the backlog
        data = historydata
        hour = datetime(date.today().year, date.today().month, date.today().day,datetime.now().hour)
        thishour = int(datetime.timestamp(hour))
        try:
            earliestdata = min(data)
        except ValueError:
            earliestdata = thishour

        self._backlog = max(0,((self._initdays*24*3600) - (thishour - earliestdata))/3600)
        #Process the available data
        processedcurrent = await self.processcurrent(currentdata)
        processeddaily = await  self.processdailyforecast(dailydata)
        data = await self.processhistory(historydata)
        historydata = data[0]
        processedweather = data[1]
        #build data to support template variables
        self._processed = {**processeddaily, **processedcurrent, **processedweather}
        dailycalls = {'time':midnight,'count':self._daily_count}
        #write persistent data
        self.store_data({ 'dailycalls':dailycalls},'owm_api_count')
        self.store_data({'history':historydata,
                         'current':currentdata,
                         'dailyforecast':dailydata,
                         'dailycalls':dailycalls,
                         'cumulativerain':self._cumulative_rain,
                         'cumulativesnow':self._cumulative_snow},self._name)

    async def get_historydata(self,historydata):
        """get history data from the newest data forward"""
        hour = datetime(date.today().year, date.today().month, date.today().day,datetime.now().hour)
        thishour = int(datetime.timestamp(hour))
        data = historydata
        try:
            lastdt = max(data)
        except ValueError:
            #no data yet just get this hours dataaset
            lastdt = int(thishour)
        #iterate until caught up to current hour
        #or exceeded the call limit
        target = min(thishour,thishour+CONST_CALLS*3600)
        while lastdt < target:
            #increment last date by an hour
            lastdt += 3600
            hourdata = await self.gethourdata(lastdt)

            if hourdata == {}:
                return historydata

            self._cumulative_rain += hourdata.get("rain",0)
            self._cumulative_snow += hourdata.get("snow",0)

            data.update({lastdt : hourdata })
        #end rest loop
        return data

    async def async_backload(self,historydata):
        """backload data from the oldest data backward"""
        data = historydata

        hour = datetime(date.today().year, date.today().month, date.today().day,datetime.now().hour)
        thishour = int(datetime.timestamp(hour))
        try:
            earliestdata = min(data)
        except ValueError:
            earliestdata = thishour
        self._backlog = max(0,((self._initdays*24*3600) - (thishour - earliestdata))/3600)
        #no data yet just get this hours dataaset
        if  self._backlog < 1:
            return

        #the most recent data avaialble less on hour
        try:
            startdp = min(data) - 3600
        except ValueError:
            hour = datetime(date.today().year, date.today().month, date.today().day,datetime.now().hour)
            thishour = int(datetime.timestamp(hour))
            #no data yet just get this hours dataaset
            startdp = int(thishour - 3600)

        if data == {}:
            targetdp = thishour - (self._initdays*3600*24)
        else:
            #the time required to back load until
            targetdp = max(data) - ((self._initdays*3600*24)+1)

        #determine last time to get data for in this iteration
        end = max(targetdp, startdp-(3600*CONST_CALLS))
        while startdp > end :
            #decrement start data point time by an hour
            self._backlog -= 1
            startdp -= 3600
            hourdata = await self.gethourdata(startdp)
            if hourdata == {}:
                return
            data.update({startdp : hourdata })
        return data

    async def gethourdata(self,timestamp):
        """get one hours data"""
        url = CONST_API_CALL % (self._lat,self._lon, timestamp, self._key)
        rest = RestData()
        await rest.set_resource(self._hass, url)
        await rest.async_update(log_errors=True)
        data = self.validate_data(rest.data)

        try:
            data = json.loads(data)
            current = data.get('data')[0]
            if current is None:
                current = {}
        except TypeError:
            _LOGGER.warning('OpenWeatherMap history call failed')
            return {}
        self._daily_count += 1

        #build this hours data
        precipval = {}
        preciptypes = ['rain','snow']
        for preciptype in preciptypes:
            if preciptype in current:
                #get the rain/snow eg 'rain': {'1h':0.89}
                precip = current[preciptype]
                #get the first key eg 1h, 3h
                key = next(iter(precip))
                #get the number component assuming only a singe digit
                divby = float(re.search(r'\d+', key).group())
                try:
                    volume = precip.get(key,0)/divby
                except ZeroDivisionError:
                    volume = 0
                precipval.update({preciptype:volume})

        rain = precipval.get('rain',0)
        snow = precipval.get('snow',0)
        hourdata = {"rain": rain
                    ,"snow":snow
                    ,"temp":current.get("temp",0)
                    ,"humidity":current.get("humidity",0)
                    ,"pressure":current.get("pressure",0)}
        return hourdata
