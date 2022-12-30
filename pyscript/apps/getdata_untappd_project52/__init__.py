import json
from datetime import datetime, timedelta

import pytz
import requests
from requests.exceptions import HTTPError

@service
def getdata_untappd_project52(
    entity_id=None,
    user=None,
    sort="date",
    limit="50",
    offset="0",
    unit_of_measurement="beers",
    icon="mdi:untappd",
):

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

    BASEURL = "https://api.untappd.com/v4/user/beers/"
    CLIENT_ID = "1CF20E6CFC7C38CDF4A19B25046246B326511D74"
    CLIENT_SECRET = "8B1F6AB3E84ACA936B194F15051FB03E3D2582E1"
    CONF_STARTDATE = datetime(year=datetime.now().year, month=1, day=1, tzinfo=pytz.UTC)
    CONF_ENDDATE = datetime.now()
    CONF_OFFSET = offset
    CONF_LIMIT = limit
    CONF_CHECKIN_CNT = 0
    CONF_LAST_CNT = 1
    CONF_AVGRATING = 0
    CONF_MAXRATING = 0
    CONF_MINRATING = 10
    CONF_USER = user
    CONF_SORT = sort
    DATA = []
    attributes = {}

    if entity_id is None:
        log.error("No Entity ID Provided")
        return

    if user is None:
        log.error("No User Provided")
        return

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
                if date_firstcheckin >= CONF_STARTDATE:
                    DATA.append(
                        {
                            "beer_name": [beer][0]["beer"]["beer_name"],
                            "beer_style": [beer][0]["beer"]["beer_style"],
                            "beer_abv": [beer][0]["beer"]["beer_abv"],
                            "beer_ibu": [beer][0]["beer"]["beer_ibu"],
                            "beer_rating": [beer][0]["beer"]["rating_score"],
                            "brewery": [beer][0]["brewery"]["brewery_name"],
                            "brewery_country": [beer][0]["brewery"]["country_name"],
                            "rating": [beer][0]["rating_score"],
                            "count": [beer][0]["count"],
                            "first_checkin": datetime.strftime(date_firstcheckin, "%a %-d %b %Y"),
                            "recent_checkin": datetime.strftime(
                                date_recentcheckin, "%a %-d %b %Y"
                            ),
                        }
                    )
                    CONF_AVGRATING += float([beer][0]["rating_score"])
                    if float([beer][0]["rating_score"]) > CONF_MAXRATING:
                        CONF_MAXRATING = float([beer][0]["rating_score"])
                    if float([beer][0]["rating_score"]) < CONF_MINRATING:
                        CONF_MINRATING = float([beer][0]["rating_score"])
                x = x + 1
        else:
            log.error("Untappd_Project52: Error!")
            CONF_LAST_CNT = 0

    ATTR_COUNT = len(DATA)

    if unit_of_measurement:
        attributes["unit_of_measurement"] = unit_of_measurement

    attributes["friendly_name"] = "Untappd: Project 52"

    if icon:
        attributes["icon"] = icon

    attributes["data"] = DATA
    attributes["count"] = ATTR_COUNT
    attributes["target"] = 52 - ATTR_COUNT
    try:
        avgrat = round(CONF_AVGRATING / ATTR_COUNT, 2)
    except:
        avgrat = 0.0
    attributes["rating_average"] = avgrat
    attributes["rating_minimum"] = CONF_MINRATING
    if CONF_MINRATING == 10:
        minrat = 0
    else:
        minrat = CONF_MINRATING
    attributes["rating_maximum"] = CONF_MAXRATING
    attributes["datefrom"] = datetime.strftime(CONF_STARTDATE, "%d/%m/%Y")
    attributes["datend"] = datetime.strftime(CONF_ENDDATE, "%d/%m/%Y")
    state.set(entity_id, value=ATTR_COUNT, new_attributes=attributes)


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
