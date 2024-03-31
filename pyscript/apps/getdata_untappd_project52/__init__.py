import json
from datetime import datetime, timedelta
import pandas as pd
import pytz
import requests
from requests.exceptions import HTTPError
import calendar

@service
def getdata_untappd_project52():

    def build_url():
        url = (
                BASEURL
                + CONF_USER
                + "?client_id="
                + CLIENT_ID
                + "&client_secret="
                + CLIENT_SECRET
                + "&sort="
                + CONF_SORT
                + "&limit="
                + CONF_LIMIT
                + "&offset="
                + CONF_OFFSET
                + "&startdate=" + datetime.strftime(CONF_STARTDATE,"%Y%m%d") + "&enddate=" + datetime.strftime(CONF_ENDDATE,"%Y%m%d")
        )
        return url

    def countOccurrence(a):
        k = {}
        for j in a:
            if j in k:
                k[j] +=1
            else:
                k[j] =1
        return k

    BASEURL = "https://api.untappd.com/v4/user/beers/"
    CLIENT_ID = "1CF20E6CFC7C38CDF4A19B25046246B326511D74"
    CLIENT_SECRET = "8B1F6AB3E84ACA936B194F15051FB03E3D2582E1"
    CONF_USER = "bacco007"
    CONF_SORT = "sort"
    CONF_LIMIT = "50"
    CONF_OFFSET = "0"
    CONF_CHECKIN_CNT = 0
    CONF_LAST_CNT = 1
    CONF_AVGRATING = 0
    CONF_MAXRATING = 0
    CONF_MINRATING = 10
    CONF_AVGRATING_52 = 0
    CONF_MAXRATING_52 = 0
    CONF_MINRATING_52 = 10
    CONF_STARTDATE = datetime(year = 2016, month=1, day=22, tzinfo=pytz.UTC)
    CONF_STARTYEAR = datetime(year = datetime.now().year, month=1, day=1, tzinfo=pytz.UTC)
    CONF_ENDDATE = datetime.now()
    DATA = []
    DATA_52 = []
    BREWERY = []
    BREWERY_COUNTRY = []
    BEER_STYLE = []
    BEER_NAME = []
    RATING_COUNT = []
    ABV_COUNT = []
    BEER_COUNT = {}
    BEER_YEAR = []
    BEER_MONTH = []

    while CONF_LAST_CNT >= 1:
        URL = build_url()
        # log.error(URL)
        r = task.executor(requests.get, URL)
        rd = r.json()
        response = rd["response"]
        if response != []:
            beer_data = rd["response"]["beers"]["items"]
            CONF_CHECKIN_CNT += len(beer_data)
            CONF_LAST_CNT = len(beer_data)
            CONF_OFFSET = str(int(CONF_OFFSET)+50)
            x = 0
            for beer in beer_data:
                date_firstcheckin = datetime.strptime(
                    [beer][0]["first_created_at"], "%a, %d %b %Y %H:%M:%S %z"
                )
                date_recentcheckin = datetime.strptime(
                    [beer][0]["recent_created_at"], "%a, %d %b %Y %H:%M:%S %z"
                )
                DATA.append({
                                "beer_name": [beer][0]["beer"]["beer_name"],
                                "beer_style": [beer][0]["beer"]["beer_style"],
                                "beer_abv": [beer][0]["beer"]["beer_abv"],
                                "beer_ibu": [beer][0]["beer"]["beer_ibu"],
                                "beer_rating": [beer][0]["beer"]["rating_score"],
                                "beer_label": [beer][0]["beer"]["beer_label"],
                                "brewery": [beer][0]["brewery"]["brewery_name"],
                                "brewery_country": [beer][0]["brewery"]["country_name"],
                                "rating": [beer][0]["rating_score"],
                                "count": [beer][0]["count"],
                                "first_checkin": datetime.strftime(date_firstcheckin, "%a %-d %b %Y"),
                                "recent_checkin": datetime.strftime(date_recentcheckin, "%a %-d %b %Y"),
                })
                if date_firstcheckin >= CONF_STARTYEAR:
                    DATA_52.append({
                                    "beer_name": [beer][0]["beer"]["beer_name"],
                                    "beer_style": [beer][0]["beer"]["beer_style"],
                                    "beer_abv": [beer][0]["beer"]["beer_abv"],
                                    "beer_ibu": [beer][0]["beer"]["beer_ibu"],
                                    "beer_rating": [beer][0]["beer"]["rating_score"],
                                    "beer_label": [beer][0]["beer"]["beer_label"],
                                    "brewery": [beer][0]["brewery"]["brewery_name"],
                                    "brewery_country": [beer][0]["brewery"]["country_name"],
                                    "rating": [beer][0]["rating_score"],
                                    "count": [beer][0]["count"],
                                    "first_checkin": datetime.strftime(date_firstcheckin, "%a %-d %b %Y"),
                                    "recent_checkin": datetime.strftime(date_recentcheckin, "%a %-d %b %Y"),
                    })
                    CONF_AVGRATING_52 += float([beer][0]["rating_score"])
                    if float([beer][0]["rating_score"]) > CONF_MAXRATING_52:
                        CONF_MAXRATING_52 = float([beer][0]["rating_score"])
                    if float([beer][0]["rating_score"]) < CONF_MINRATING_52:
                        CONF_MINRATING_52 = float([beer][0]["rating_score"])
                BEER_BREWERY = [beer][0]["brewery"]["brewery_name"] + " - " + [beer][0]["beer"]["beer_name"]
                BEER_NAME.append(BEER_BREWERY)
                BEER_STYLE.append([beer][0]["beer"]["beer_style"])
                BREWERY.append([beer][0]["brewery"]["brewery_name"])
                BREWERY_COUNTRY.append([beer][0]["brewery"]["country_name"])
                BEER_COUNT[BEER_BREWERY] = BEER_COUNT.get(BEER_BREWERY,[beer][0]["count"])
                RATING_COUNT.append([beer][0]["rating_score"])
                ABV_COUNT.append([beer][0]["beer"]["beer_abv"])
                BEER_YEAR.append(date_firstcheckin.year)
                BEER_MONTH.append(date_firstcheckin.month)
                CONF_AVGRATING += float([beer][0]["rating_score"])
                if float([beer][0]["rating_score"]) > CONF_MAXRATING:
                    CONF_MAXRATING = float([beer][0]["rating_score"])
                if float([beer][0]["rating_score"]) < CONF_MINRATING:
                    CONF_MINRATING = float([beer][0]["rating_score"])
                x = x + 1;
        else:
            log.error("Untappd_Project52: Error!")
            CONF_LAST_CNT = 0

    df = pd.DataFrame(DATA)
    df['year'] = pd.DatetimeIndex(df['first_checkin']).year
    agg_func_math = {
        'beer_name':[pd.Series.nunique],
        'beer_style':[pd.Series.nunique],
        'brewery':[pd.Series.nunique],
        'brewery_country':[pd.Series.nunique],
        'rating':['mean', 'median', 'min', 'max'],
        'beer_abv': ['mean', 'median', 'min', 'max'],
        'year': ['min', 'max']
    }    

    ATTR_TARGET = 52 - len(DATA_52)
    ATTR_STARTDATE = datetime.strftime(CONF_STARTDATE,"%d/%m/%Y")
    ATTR_ENDDATE = datetime.strftime(CONF_ENDDATE,"%d/%m/%Y")
    try:
        CONF_AVGRATING = round(CONF_AVGRATING/len(DATA),2)
    except:
        CONF_AVGRATING = 0.0
    try:
        CONF_AVGRATING_52 = round(CONF_AVGRATING_52/len(DATA_52),2)
    except:
        CONF_AVGRATING_52 = 0.0
    if CONF_MINRATING == 10:
        CONF_MINRATING = 0
    else:
        CONF_MINRATING = CONF_MINRATING
    if CONF_MINRATING_52 == 10:
        CONF_MINRATING_52 = 0
    else:
        CONF_MINRATING_52 = CONF_MINRATING_52

    ATTR_BEER = DATA
    ATTR_BEER_52 = DATA_52
    ATTR_STATS_BREWERY = []
    for x in sorted(countOccurrence(BREWERY).items(), key=lambda x: x[1], reverse=True):
        ATTR_STATS_BREWERY.append({
                    "item": x[0],
                    "count": x[1],
        })
    ATTR_STATS_BREWERY_COUNTRY = []
    for x in sorted(countOccurrence(BREWERY_COUNTRY).items(), key=lambda x: x[1], reverse=True):
        ATTR_STATS_BREWERY_COUNTRY.append({
                    "item": x[0],
                    "count": x[1],
        })
    ATTR_STATS_BEERSTYLE = []
    for x in sorted(countOccurrence(BEER_STYLE).items(), key=lambda x: x[1], reverse=True):
        ATTR_STATS_BEERSTYLE.append({
                    "item": x[0],
                    "count": x[1],
        })
    ATTR_STATS_BEERNAME = []
    for x in sorted(countOccurrence(BEER_NAME).items(), key=lambda x: x[1], reverse=True):
        ATTR_STATS_BEERNAME.append({
                    "item": x[0],
                    "count": x[1],
        })
    ATTR_STATS_RATING = []
    for x in sorted(countOccurrence(RATING_COUNT).items(), key=lambda x: float(x[0])):
        ATTR_STATS_RATING.append({
                    "item": x[0],
                    "count": x[1],
        })
    ATTR_STATS_ABV = []
    for x in sorted(countOccurrence(ABV_COUNT).items(), key=lambda x: float(x[0])):
        ATTR_STATS_ABV.append({
                    "item": x[0],
                    "count": x[1],
        })
    ATTR_STATS_BEER_COUNT = []
    for x in sorted(BEER_COUNT.items(), key=lambda x: x[1], reverse=True):
        ATTR_STATS_BEER_COUNT.append({
                    "item": x[0],
                    "count": x[1],
        })

    ATTR_STATS_YEAR = []
    for x in sorted(countOccurrence(BEER_YEAR).items(), key=lambda x: x[0], reverse=False):
        ATTR_STATS_YEAR.append({
                    "item": x[0],
                    "count": x[1],
        })

    ATTR_STATS_MONTH = []
    for x in sorted(countOccurrence(BEER_MONTH).items(), key=lambda x: x[0], reverse=False):
        ATTR_STATS_MONTH.append({
                    "item": calendar.month_name[x[0]],
                    "count": x[1],
        })        

    # Project 52
    attributes_project52 = {}
    attributes_project52["data"] = ATTR_BEER_52
    attributes_project52["count"] = len(DATA_52)
    attributes_project52["target"] = ATTR_TARGET
    attributes_project52["rating_average"] = CONF_AVGRATING_52
    attributes_project52["rating_minimum"] = CONF_MINRATING_52
    attributes_project52["rating_maximum"] = CONF_MAXRATING_52
    attributes_project52["datefrom"] = datetime.strftime(CONF_STARTYEAR, "%d/%m/%Y")
    attributes_project52["datend"] = datetime.strftime(CONF_ENDDATE, "%d/%m/%Y")
    attributes_project52["icon"] = "mdi:untappd"
    attributes_project52["unit_of_measurement"] = "beers"
    attributes_project52["friendly_name"] = "Untappd: Project 52"
    state.set("sensor.untappd_project_52", value=len(DATA_52), new_attributes=attributes_project52)

    # Stats by Brewery
    attributes_brewery = {}
    attributes_brewery["data"] = ATTR_STATS_BREWERY
    max_new = 0
    for b in sorted(countOccurrence(BREWERY).items(), key=lambda x: x[1], reverse=True):
        attributes_brewery[b[0]] = b[1]
        if b[1] > max_new:
            max_new = b[1]
            max_new_value = b[0]
    #attributes_brewery["count"] = ATTR_STATS_BREWERY[0]['count']
    attributes_brewery["max"] = max_new
    attributes_brewery["max_desc"] = max_new_value
    attributes_brewery["icon"] = "mdi:untappd"
    attributes_brewery["unit_of_measurement"] = "beers"
    attributes_brewery["friendly_name"] = "Untappd: Stats by Brewery"
    state.set("sensor.untappd_stats_by_brewery", value=len(ATTR_STATS_BREWERY), new_attributes=attributes_brewery)

    # Stats by Brewery Country
    attributes_brewerycountry = {}
    attributes_brewerycountry["data"] = ATTR_STATS_BREWERY_COUNTRY
    max_new = 0
    for b in sorted(countOccurrence(BREWERY_COUNTRY).items(), key=lambda x: x[1], reverse=True):
        attributes_brewerycountry[b[0]] = b[1]
        if b[1] > max_new:
            max_new = b[1]
            max_new_value = b[0]
    #attributes_brewerycountry["count"] = ATTR_STATS_BREWERY_COUNTRY[0]['count']
    attributes_brewerycountry["max"] = max_new
    attributes_brewerycountry["max_desc"] = max_new_value
    attributes_brewerycountry["icon"] = "mdi:untappd"
    attributes_brewerycountry["unit_of_measurement"] = "beers"
    attributes_brewerycountry["friendly_name"] = "Untappd: Stats by Brewery Country"
    state.set("sensor.untappd_stats_by_brewerycountry", value=len(ATTR_STATS_BREWERY_COUNTRY), new_attributes=attributes_brewerycountry)

    # Stats by Beer Style
    attributes_beerstyle = {}
    attributes_beerstyle["data"] = ATTR_STATS_BEERSTYLE
    max_new = 0
    for b in sorted(countOccurrence(BEER_STYLE).items(), key=lambda x: x[1], reverse=True):
        attributes_beerstyle[b[0]] = b[1]
        if b[1] > max_new:
            max_new = b[1]
            max_new_value = b[0]
    #attributes_beerstyle["count"] = ATTR_STATS_BEERSTYLE[0]['count']
    attributes_beerstyle["max"] = max_new
    attributes_beerstyle["max_desc"] = max_new_value
    attributes_beerstyle["icon"] = "mdi:untappd"
    attributes_beerstyle["unit_of_measurement"] = "beers"
    attributes_beerstyle["friendly_name"] = "Untappd: Stats by Beer Style"
    state.set("sensor.untappd_stats_by_beerstyle", value=len(ATTR_STATS_BEERSTYLE), new_attributes=attributes_beerstyle)

    # Stats by Beer Rating
    attributes_beerrating = {}
    attributes_beerrating["data"] = ATTR_STATS_RATING
    max_new = 0
    for b in sorted(countOccurrence(RATING_COUNT).items(), key=lambda x: float(x[0])):
        attributes_beerrating[b[0]] = b[1]
        if b[1] > max_new:
            max_new = b[1]
            max_new_value = b[0]
    #attributes_beerrating["count"] = len(ATTR_STATS_RATING)
    attributes_beerrating["max"] = max_new
    attributes_beerrating["max_desc"] = max_new_value
    attributes_beerrating["icon"] = "mdi:untappd"
    attributes_beerrating["unit_of_measurement"] = "beers"
    attributes_beerrating["friendly_name"] = "Untappd: Stats by Beer Rating"
    state.set("sensor.untappd_stats_by_beerrating", value=len(ATTR_STATS_RATING), new_attributes=attributes_beerrating)

    # Stats by Beer ABV
    attributes_beerabv = {}
    attributes_beerabv["data"] = ATTR_STATS_ABV
    max_new = 0
    for b in sorted(countOccurrence(ABV_COUNT).items(), key=lambda x: float(x[0])):
        attributes_beerabv[b[0]] = b[1]
        if b[1] > max_new:
            max_new = b[1]
            max_new_value = b[0]
    #attributes_beerabv["count"] = len(ATTR_STATS_ABV)
    attributes_beerabv["max"] = max_new
    attributes_beerabv["max_desc"] = max_new_value
    attributes_beerabv["icon"] = "mdi:untappd"
    attributes_beerabv["unit_of_measurement"] = "beers"
    attributes_beerabv["friendly_name"] = "Untappd: Stats by Beer ABV"
    state.set("sensor.untappd_stats_by_beerabv", value=len(ATTR_STATS_ABV), new_attributes=attributes_beerabv)

    # Stats by Beer Check-in Count
    attributes_beercheckincnt = {}
    attributes_beercheckincnt["data"] = ATTR_STATS_BEER_COUNT
    #attributes_beercheckincnt["count"] = ATTR_STATS_BEER_COUNT[0]['count']
    attributes_beercheckincnt["icon"] = "mdi:untappd"
    attributes_beercheckincnt["unit_of_measurement"] = "beers"
    attributes_beercheckincnt["friendly_name"] = "Untappd: Stats by Beer Check-in Count"
    state.set("sensor.untappd_stats_by_beercheckincnt", value=len(ATTR_STATS_BEER_COUNT), new_attributes=attributes_beercheckincnt)

    # Recent Beers
    attributes_recentbeers = {}
    attributes_recentbeers["data"] = ATTR_BEER[:25]
    attributes_recentbeers["count"] = len(ATTR_BEER[:25])
    attributes_recentbeers["icon"] = "mdi:untappd"
    attributes_recentbeers["unit_of_measurement"] = "beers"
    attributes_recentbeers["friendly_name"] = "Untappd: Recent Beers"
    state.set("sensor.untappd_recent_beers", value=len(ATTR_BEER[:25]), new_attributes=attributes_recentbeers)

    # Highest Rated Beers
    attributes_highestratedbeers = {}
    attributes_highestratedbeers["data"] = sorted(ATTR_BEER, key=lambda x: x["rating"], reverse=True)[:25]
    attributes_highestratedbeers["count"] = len(sorted(ATTR_BEER, key=lambda x: x["rating"], reverse=True)[:25])
    attributes_highestratedbeers["icon"] = "mdi:untappd"
    attributes_highestratedbeers["unit_of_measurement"] = "beers"
    attributes_highestratedbeers["friendly_name"] = "Untappd: Highest Rated Beers"
    state.set("sensor.untappd_highest_rated_beers", value=len(sorted(ATTR_BEER, key=lambda x: x["rating"], reverse=True)[:25]), new_attributes=attributes_highestratedbeers)

    # Lowest Rated Beers
    attributes_lowestratedbeers = {}
    attributes_lowestratedbeers["data"] = sorted(ATTR_BEER, key=lambda x: x["rating"], reverse=False)[:25]
    attributes_lowestratedbeers["count"] = len(sorted(ATTR_BEER, key=lambda x: x["rating"], reverse=False)[:25])
    attributes_lowestratedbeers["icon"] = "mdi:untappd"
    attributes_lowestratedbeers["unit_of_measurement"] = "beers"
    attributes_lowestratedbeers["friendly_name"] = "Untappd: Lowest Rated Beers"
    state.set("sensor.untappd_lowest_rated_beers", value=len(sorted(ATTR_BEER, key=lambda x: x["rating"], reverse=False)[:25]), new_attributes=attributes_lowestratedbeers)

    # Most Checked In Beers
    attributes_mostcheckedinbeers = {}
    attributes_mostcheckedinbeers["data"] = sorted(ATTR_BEER, key=lambda x: x["count"], reverse=True)[:25]
    attributes_mostcheckedinbeers["count"] = len(sorted(ATTR_BEER, key=lambda x: x["count"], reverse=True)[:25])
    attributes_mostcheckedinbeers["icon"] = "mdi:untappd"
    attributes_mostcheckedinbeers["unit_of_measurement"] = "beers"
    attributes_mostcheckedinbeers["friendly_name"] = "Untappd: Most Checked In Beers"
    state.set("sensor.untappd_most_checked_in_beers", value=len(sorted(ATTR_BEER, key=lambda x: x["count"], reverse=True)[:25]), new_attributes=attributes_mostcheckedinbeers)

    # Highest ABV Beers
    attributes_highestabvbeers = {}
    attributes_highestabvbeers["data"] = sorted(ATTR_BEER, key=lambda x: x["beer_abv"], reverse=True)[:25]
    attributes_highestabvbeers["count"] = len(sorted(ATTR_BEER, key=lambda x: x["beer_abv"], reverse=True)[:25])
    attributes_highestabvbeers["icon"] = "mdi:untappd"
    attributes_highestabvbeers["unit_of_measurement"] = "beers"
    attributes_highestabvbeers["friendly_name"] = "Untappd: Highest ABV Beers"
    state.set("sensor.untappd_highest_abv_beers", value=len(sorted(ATTR_BEER, key=lambda x: x["beer_abv"], reverse=True)[:25]), new_attributes=attributes_highestabvbeers)

    # Lowest ABV Beers
    attributes_lowestabvbeers = {}
    attributes_lowestabvbeers["data"] = sorted(ATTR_BEER, key=lambda x: x["beer_abv"], reverse=False)[:25]
    attributes_lowestabvbeers["count"] = len(sorted(ATTR_BEER, key=lambda x: x["beer_abv"], reverse=False)[:25])
    attributes_lowestabvbeers["icon"] = "mdi:untappd"
    attributes_lowestabvbeers["unit_of_measurement"] = "beers"
    attributes_lowestabvbeers["friendly_name"] = "Untappd: Lowest ABV Beers"
    state.set("sensor.untappd_lowest_abv_beers", value=len(sorted(ATTR_BEER, key=lambda x: x["beer_abv"], reverse=False)[:25]), new_attributes=attributes_lowestabvbeers)

    # Check-Ins by Year
    attributes_firstcheckin_year = {}
    attributes_firstcheckin_year["data"] = ATTR_STATS_YEAR
    max_new = 0
    for b in sorted(countOccurrence(BEER_YEAR).items(), key=lambda x: x[0], reverse=False):
        attributes_firstcheckin_year[b[0]] = b[1]
        if b[1] > max_new:
            max_new = b[1]
            max_new_value = b[0]
    #attributes_firstcheckin_year["count"] = len(sorted(countOccurrence(BEER_YEAR).items(), key=lambda x: x[0], reverse=False))
    attributes_firstcheckin_year["max"] = max_new
    attributes_firstcheckin_year["max_desc"] = max_new_value
    attributes_firstcheckin_year["icon"] = "mdi:untappd"
    attributes_firstcheckin_year["unit_of_measurement"] = "beers"
    attributes_firstcheckin_year["friendly_name"] = "Untappd: Check-ins by Year"
    state.set("sensor.untappd_stats_by_checkinsbyyear", value=len(sorted(countOccurrence(BEER_YEAR).items(), key=lambda x: x[0], reverse=False)), new_attributes=attributes_firstcheckin_year)

    # Check-Ins by Month
    attributes_firstcheckin_month = {}
    attributes_firstcheckin_month["data"] = ATTR_STATS_MONTH
    max_new = 0
    for b in sorted(countOccurrence(BEER_MONTH).items(), key=lambda x: x[0], reverse=False):
        attributes_firstcheckin_month[calendar.month_name[b[0]]] = b[1]
        if b[1] > max_new:
            max_new = b[1]
            max_new_value = calendar.month_name[b[0]]
    #attributes_firstcheckin_month["count"] = len(sorted(countOccurrence(BEER_MONTH).items(), key=lambda x: x[0], reverse=False))
    attributes_firstcheckin_month["max"] = max_new
    attributes_firstcheckin_month["max_desc"] = max_new_value
    attributes_firstcheckin_month["icon"] = "mdi:untappd"
    attributes_firstcheckin_month["unit_of_measurement"] = "beers"
    attributes_firstcheckin_month["friendly_name"] = "Untappd: Check-ins by Month"
    state.set("sensor.untappd_stats_by_checkinsbymonth", value=len(sorted(countOccurrence(BEER_MONTH).items(), key=lambda x: x[0], reverse=False)), new_attributes=attributes_firstcheckin_month)

    # Testing - Check-In by Year
    t = df.groupby(['year']).agg(agg_func_math).round(2)
    t.columns = t.columns.map('_'.join)
    jd = t.to_json(orient="index")
    jd2 = json.loads(jd)
    attributes_test = {}
    attributes_test["data"] = jd2
    attributes_test["icon"] = "mdi:untappd"
    attributes_test["unit_of_measurement"] = "beers"
    attributes_test["friendly_name"] = "Untappd: Testing, by Year"
    state.set("sensor.untappd_test_by_year", value="Test", new_attributes = attributes_test)

def get_config(name):
    value = pyscript.app_config.get(name)

    if value is None:
        log.error(
            '"'
            + name
            + '" is required parameter but not defined in Pyscript configuration for application'
        )

    return value


# Pyscript startup and app reload
# https://hacs-pyscript.readthedocs.io/en/latest/reference.html?highlight=load#time-trigger
@time_trigger("startup")
def load():
    log.info(f"app has started")

    # Check required configuration
    get_config("clientid")
    get_config("clientsecret")


def build_url():

    return url
