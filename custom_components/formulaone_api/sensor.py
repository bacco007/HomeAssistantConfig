""""
Based on the good work from @JayBlackedOut
https://github.com/JayBlackedOut/hass-nhlapi/blob/master/README.md
"""

import logging
from datetime import timedelta, datetime as dt
import random
import requests
import voluptuous as vol
import json

from typing import Optional
from dataclasses import dataclass

from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (CONF_NAME, CONF_ID, CONF_SCAN_INTERVAL)
import homeassistant.helpers.config_validation as cv
import homeassistant.util.dt as dt_util
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.event import track_point_in_time

_LOGGER = logging.getLogger(__name__)

__version__ = '0.8.1'

CONF_NAME = 'name'
CONF_SCAN_INTERVAL = 'scan_interval'

DEFAULT_NAME = 'Formula One Sensor'
DEFAULT_SCAN_INTERVAL = timedelta(seconds=600)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_ID, default=0): cv.positive_int,
    vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
    vol.Optional(
        CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL
    ): cv.time_period,
})


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the Formula One sensor."""
    name = config.get(CONF_NAME, DEFAULT_NAME)
    scan_interval = config.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
    add_entities([FormulaOneSensor(name, scan_interval, hass)])

@dataclass
class ErgastResponse(object):
    """
    makes the request to the api
    url: [str] request url
    offset: [int] starting point of elements from API request
    limit: [int] number of items to return per request
    """

    url: str
    offset: Optional[int] = None
    limit: Optional[int] = None
    _json = None
    _xml = None
    _text = None

    def make_request(self, format_):
        self.url = f"{self.url}{format_}"
        if self.limit and self.offset:
            querystring = {"limit": self.limit, "offset": self.offset}
        else:
            querystring = None
        return requests.get(self.url, params=querystring)

    @property
    def xml(self):
        if self._xml is None:
            self._xml = self.make_request(".xml")
        return self._xml.text

    @property
    def json(self):
        if self._json is None:
            self._json = self.make_request(".json")
        return self._json.json()

    @property
    def text(self):
        if self._text is None:
            self._text = self.make_request(".xml")
        return self._text.text

@dataclass
class F1(object):
    secure: Optional[bool] = False
    offset: Optional[int] = None
    limit: Optional[int] = None

    __all__ = {
        "all_drivers": "drivers",
        "all_circuits": "circuits",
        "all_seasons": "seasons",
        "current_schedule": "current",
        "season_schedule": "{season}",
        "all_constructors": "constructors",
        "race_standings": "{season}/driverStandings",
        "constructor_standings": "{season}/constructorStandings",
        "driver_standings": "{season}/driverStandings",
        "driver_season": "{season}/drivers",
    }

    def __getattr__(self, attr):
        path = self.__all__.get(attr)
        if path is None:
            raise AttributeError

        def outer(path):
            def inner(**kwargs):
                url = self._build_url(path, **kwargs)
                return ErgastResponse(url)

            return inner

        return outer(self.__all__[attr])

    def random(self, **kwargs):
        applicable_actions = []
        for action in self.__all__.keys():
            applicable_actions.append(action)
        choice = getattr(self, random.choice(applicable_actions))
        return choice(**kwargs)

    def _build_url(self, path, **kwargs) -> str:
        url = "{protocol}://ergastcache.mobiusmedia.ca/f1/{path}".format(
            protocol="http" if self.secure else "http", path=path.format(**kwargs)
        )
        return url
        
class FormulaOneSensor(Entity):
    """Representation of a Formula One sensor."""

    def __init__(self, name, scan_interval, hass):
        """Initialize Formula One sensor."""
        self.entity_id = "sensor." + name.replace(" ", "_").lower()
        self.hass = hass
        self._state = None
        self._name = name
        self._scan_interval = scan_interval
        self._icon = 'mdi:car'
        self._last_scan = dt.today()
        self._state_attributes = {}
        self.timer(dt.today())

    @property
    def should_poll(self):
        """Polling not required."""
        return False

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def icon(self):
        """Return the icon to use in the frontend."""
        return self._icon

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def extra_state_attributes(self):
        """Return the extra attributes of the sensor."""
        return self._state_attributes

    def timer(self, nowtime):
        self.schedule_update_ha_state(True)
        polling_delta = self.set_polling()
        nexttime = nowtime + polling_delta
        # Setup timer to run again at polling delta
        # track_point_in_time(self.hass, self.timer, nexttime)

    def get_race_data(self):
        """Get the latest data from the http://ergast.com/ via a custom formulaonepy."""
        # Get race info
        f1 = F1()

        now = dt.now()
        races = f1.current_schedule().json
        drivers = f1.driver_standings(season=now.year).json
        constructors = f1.constructor_standings(season=now.year).json
        next_race = None

        found = False
        for race in races['MRData']['RaceTable']['Races']:
            if (not found): 
                #print(race)
                #r = json.loads(race)
                if (dt.strptime(race['date'], '%Y-%m-%d') == dt.today()):
                    next_race = race
                    found = True
                elif (dt.strptime(race['date'], '%Y-%m-%d') > dt.today()):
                    next_race = race
                    found = True

        # # Merge all attributes to a single dict.
        all_attr = {
            'next_race': next_race,
            'races': races['MRData']['RaceTable']['Races'],
            'drivers': drivers['MRData']['StandingsTable']['StandingsLists'][0]['DriverStandings'],
            'constructors': constructors['MRData']['StandingsTable']['StandingsLists'][0]['ConstructorStandings']
        }

        return all_attr

    def set_state(self):
        """Set sensor state to race state and set polling interval."""
        all_attr = self.get_race_data()

        # Set sensor state attributes.
        if all_attr['next_race'] == None:
            self._state = 'None'
        elif dt.strptime(all_attr['next_race']['date'], '%Y-%m-%d') == dt.today():
            self._state = 'Race Day'
        else:
            self._state = 'Scheduled'

        self._state_attributes = all_attr

        return self._state

    def set_polling(self):
        race_state = self._state
        polling_delta = DEFAULT_SCAN_INTERVAL
        return polling_delta

    def update(self):
        """Update the sensor."""
        self.set_state()
