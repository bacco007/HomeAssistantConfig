############################################################
#
# This class aims to get the ASX pricing information for the stock
#
# written to be run from AppDaemon for a HASS or HASSIO install
#
# created: 14/08/2020
# 
############################################################

############################################################
# 
# In the apps.yaml file you will need the following
# updated for your database path, stop ids and name of your flag
#
# asx_sensor:
#   module: asx_sensor
#   class: Get_ASX_info
#   TICKER: "CBA,TLS,BHP"
#   TICK_FLAG" "input_boolean.asx_check"
#
############################################################

# import the function libraries
import requests
import datetime
import json
import appdaemon.plugins.hass.hassapi as hass

class Get_ASX_info(hass.Hass):

    # the name of the flag in HA (input_boolean.xxx) that will be watched/turned off
    
    TICKER = ""
    TICK_FLAG = ""
    URLc = "https://www.asx.com.au/asx/1/company/"
    URLs = "https://www.asx.com.au/asx/1/share/"
    URLch = "https://www.asx.com.au/asx/1/chart/highcharts?years=10&asx_code="
    SYM = ""

    s_price = "/prices?interval=daily&count=1"    
    c_fields = "?fields=primary_share,latest_annual_reports,last_dividend,primary_share.indices"
    c_similar = "/similar?compare=marketcap"
    c_announcements = "/announcements?count=10&market_sensitive=false"
    c_dividends = "/dividends/history?years=1"
    c_dividends_b = "/dividends"
    c_options = "/options?count=5000"
    c_warrants = "/warrants?count=5000"
    c_people = "/people"

    tick_up_mdi = "mdi:arrow-top-right"
    tick_down_mdi = "mdi:arrow-bottom-left"
    tick_mdi = "mdi:progress-check"
    up_sensor = "sensor.asx_data_last_updated"
    asx_sensor = "sensor.asx_sensor_"
    up_mdi = "mdi:timeline-clock-outline"
    payload = {}
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }

    # run each step against the database
    def initialize(self):

        # get the values from the app.yaml that has the relevant personal settings
        self.TICKER = self.args["TICKER"]
        self.TICK_FLAG = self.args["TICK_FLAG"]

        # create the original sensor
        self.load()

        # listen to HA for the flag to update the sensor
        self.listen_state(self.main, self.TICK_FLAG, new="on")

        # set to run each morning at 5.17am
        runtime = datetime.time(5,17,0)
        self.run_daily(self.daily_load, runtime)

    # run the app
    def main(self, entity, attribute, old, new, kwargs):
        """ create the sensor and turn off the flag
            
        """
        # create the sensor with the information 
        self.load()
        
        # turn off the flag in HA to show completion
        self.turn_off(self.TICK_FLAG)

    # run the app
    def daily_load(self, kwargs):
        """ scheduled run
        """
        # create the sensor with the dam information 
        self.load()

    def load(self):
        """ parse the ASX JSON datasets
        """

        #create a sensor to keep track last time this was run
        tim = datetime.datetime.now()
        #tomorrow = tim - datetime.timedelta(days=-1)
        date_time = tim.strftime("%d/%m/%Y, %H:%M:%S")
        #date_date = tim.strftime("%d/%m/%Y")
        #tomorrow_date = tomorrow.strftime("%d/%m/%Y")
        self.set_state(self.up_sensor, state=date_time, replace=True, attributes= {"icon": self.up_mdi, "friendly_name": "ASX Data last sourced", "Companies": self.TICKER })

        #split the tickers into an array
        ticks = self.TICKER.split(",")

        for tick in ticks:

            #connect to the website and get the JSON dataset for that symbol
            url = self.URLs + tick.strip() + self.s_price
            response = requests.request("GET", url, headers=self.headers, data = self.payload)
        
            #convert output to JSON
            jtags = json.loads(response.text)

            sym = jtags['data'][0]['code']
            c_date = jtags['data'][0]['close_date']
            c_price = jtags['data'][0]['close_price']
            ch_price = jtags['data'][0]['change_price']
            #volume = jtags['data'][0]['volume']
            day_high = jtags['data'][0]['day_high_price']
            day_low = jtags['data'][0]['day_low_price']
            ch_perc =  jtags['data'][0]['change_in_percent']

            #connect to the website and get the JSON dataset for that symbol
            url = self.URLc + tick + self.c_dividends
            response = requests.request("GET", url, headers=self.headers, data = self.payload)
        
            #convert output to JSON
            jtags = json.loads(response.text)

            if jtags:
                div_y = jtags[0]['year']
                div_a = jtags[0]['amount']
            else:
                div_y = ""
                div_a = ""

            #connect to the website and get the JSON dataset for that symbol
            url = self.URLc + tick + self.c_fields
            response = requests.request("GET", url, headers=self.headers, data = self.payload)
        
            #convert output to JSON
            jtags = json.loads(response.text)

            nam = jtags['name_short']
            year_high = jtags['primary_share']['year_high_price']
            year_h_date = jtags['primary_share']['year_high_date']
            year_low = jtags['primary_share']['year_low_price']
            year_l_date = jtags['primary_share']['year_low_date']
            year_ch_perc = jtags['primary_share']['year_change_in_percentage']
            susp = jtags['primary_share']['suspended']

            diff = float(ch_price)

            if diff > 0:
                icon_mdi = self.tick_up_mdi
            elif diff < 0:
                icon_mdi = self.tick_down_mdi
            else:
                icon_mdi = self.tick_mdi

            self.set_state(self.asx_sensor + sym, state=str(c_price), replace=True, attributes= {"icon": icon_mdi, "friendly_name": nam, "close_date": str(c_date), "change_price": str(ch_price), "suspended": str(susp), "day_high": str(day_high), "day_low": str(day_low), "day_perc": str(ch_perc), "year_high": str(year_high), "year_high_date": str(year_h_date), "year_low": str(year_low), "year_low_date": str(year_l_date), "year_change_perc": str(year_ch_perc), "year_dividend": str(div_y), "amount_dividend": str(div_a) })

            
        

#
