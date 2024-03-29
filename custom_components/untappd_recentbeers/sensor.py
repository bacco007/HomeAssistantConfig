"""Sensor platform for Untappd Recent Beers"""
import datetime
import json
import logging

import homeassistant.helpers.config_validation as cv
import requests
import voluptuous as vol
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import ATTR_ATTRIBUTION, CONF_NAME
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle
from requests.exceptions import HTTPError

__version__ = "0.1"
_LOGGER = logging.getLogger(__name__)

REQUIREMENTS = []

DEFAULT_UOM = "Beers"
DEFAULT_SORT = "date"
DEFAULT_LIMIT = "25"

BASEURL = "https://api.untappd.com/v4/user/beers/"
CONF_CLIENT_ID = "client_id"
CONF_CLIENT_SECRET = "client_secret"
CONF_USER = "username"
CONF_SORT = "sort"
CONF_LIMIT = "limit"
DATA = []
ATTR_USER = "username"
ATTR_DATA = "beerlist"
ATTR_TYPE = "type"

# DEFAULT_SCAN_INTERVAL = timedelta(hours=1)
# SCAN_INTERVAL = timedelta(hours=1)

ICON = "mdi:untappd"

MIN_TIME_BETWEEN_UPDATES = datetime.timedelta(minutes=300)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_CLIENT_ID): cv.string,
        vol.Required(CONF_CLIENT_SECRET): cv.string,
        vol.Required(CONF_USER): cv.string,
        vol.Optional(CONF_SORT, default=DEFAULT_SORT): cv.string,
        vol.Optional(CONF_LIMIT, default=DEFAULT_LIMIT): cv.string,
    }
)


def setup_platform(hass, config, add_entities, discovery_info=None):
    "Setup Platform"
    client_id = config.get(CONF_CLIENT_ID)
    client_secret = config.get(CONF_CLIENT_SECRET)
    user = config.get(CONF_USER)
    limit = config.get(CONF_LIMIT)
    sort = config.get(CONF_SORT)

    add_entities([UntappdRBSensor(client_id, client_secret, user, sort, limit)])


class UntappdRBSensor(Entity):
    def __init__(self, client_id, client_secret, user, sort, limit):
        self._state = None
        self._client_id = client_id
        self._client_secret = client_secret
        self._user = user
        self._sort = sort
        self._limit = limit
        self._attributes = {}

    def _build_url(self):
        url = (
            BASEURL
            + self._user
            + "?client_id="
            + self._client_id
            + "&client_secret="
            + self._client_secret
            + "&sort="
            + self._sort
            + "&limit="
            + self._limit
        )
        _LOGGER.debug("Untapped_RecentBeers: URL {}".format(url))
        return url

    @property
    def name(self):
        state_match = {
            "date": "Recent",
            "checkin": "Most Checked In",
            "highest_rated_you": "Highest Rated",
            "lowest_rated_you": "Lowest Rated",
        }
        stype = state_match.get(self._sort)
        stype2 = "Untappd: {} Beers".format(stype)
        return stype2 + " - {}".format(self._user)

    @property
    def state(self):
        return self._state

    @property
    def icon(self):
        return ICON

    @property
    def state_attributes(self):
        return self._attributes

    @property
    def unit_of_measurement(self):
        return DEFAULT_UOM

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    def update(self):
        result = requests.get(self._build_url(), timeout=10).json()
        beer_data = result["response"]["beers"]["items"]
        for beer in beer_data:
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
                    "first_checkin": [beer][0]["first_created_at"],
                    "recent_checkin": [beer][0]["recent_created_at"],
                }
            )
        self._attributes[ATTR_ATTRIBUTION] = "Data from Untappd"
        self._attributes[ATTR_USER] = self._user
        self._attributes[ATTR_TYPE] = self._sort
        self._attributes[ATTR_DATA] = DATA
        self._state = len(beer_data)
