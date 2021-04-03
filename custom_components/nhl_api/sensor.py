""""
Support for the undocumented NHL API.
For more details about this platform, please refer to the documentation at
https://github.com/JayBlackedOut/hass-nhlapi/blob/master/README.md
"""

import logging
from datetime import timedelta, datetime as dt
from pynhl import Schedule, Scoring, Linescore, Broadcasts
import voluptuous as vol

from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (CONF_NAME, CONF_ID, CONF_SCAN_INTERVAL)
import homeassistant.helpers.config_validation as cv
import homeassistant.util.dt as dt_util
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.event import track_point_in_time

_LOGGER = logging.getLogger(__name__)

__version__ = '0.8.1'

CONF_ID = 'team_id'
CONF_NAME = 'name'
CONF_SCAN_INTERVAL = 'scan_interval'

DEFAULT_NAME = 'NHL Sensor'

LOGO_URL = 'https://www-league.nhlstatic.com/images/logos/'\
    'teams-current-primary-light/{}.svg'

PREGAME_SCAN_INTERVAL = timedelta(seconds=10)
LIVE_SCAN_INTERVAL = timedelta(seconds=1)
POSTGAME_SCAN_INTERVAL = timedelta(seconds=600)
DEFAULT_SCAN_INTERVAL = LIVE_SCAN_INTERVAL.seconds

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_ID, default=0): cv.positive_int,
    vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
    vol.Optional(
        CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL
    ): cv.time_period,
})


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the NHL API sensor."""
    team_id = config.get(CONF_ID)
    name = config.get(CONF_NAME, DEFAULT_NAME)
    scan_interval = config.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
    add_entities([NHLSensor(team_id, name, scan_interval, hass)])


class NHLSensor(Entity):
    """Representation of a NHL API sensor."""

    def __init__(self, team_id, name, scan_interval, hass):
        """Initialize NHL API sensor."""
        self.entity_id = "sensor." + name.replace(" ", "_").lower()
        self.hass = hass
        self._state = None
        self._team_id = team_id
        self._name = name
        self._scan_interval = scan_interval
        self._icon = 'mdi:hockey-sticks'
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
    def device_state_attributes(self):
        """Return the state attributes of the sensor."""
        return self._state_attributes

    def timer(self, nowtime):
        self.schedule_update_ha_state(True)
        polling_delta = self.set_polling()
        nexttime = nowtime + polling_delta
        # Setup timer to run again at polling delta
        track_point_in_time(self.hass, self.timer, nexttime)

    def get_game_data(self):
        """Get the latest data from the NHL API via pynhl."""
        # Get game info
        games = Schedule(self._team_id).game_info()
        # Get date and time info
        dates = Schedule(self._team_id).datetime_info()
        # Get scoring info
        if Scoring(self._team_id).scoring_info() is not None:
            plays = Scoring(self._team_id).scoring_info()
        else:
            plays = {}
        # Get linescore info
        if Linescore(self._team_id).linescore_info() is not None:
            linescore = Linescore(self._team_id).linescore_info()
        else:
            linescore = {}
        # Get broadcast info
        if Broadcasts(self._team_id).broadcast_info() is not None:
            broadcasts = Broadcasts(self._team_id).broadcast_info()
        else:
            broadcasts = {}
        # Localize the returned UTC time values.
        if dates['next_game_datetime'] != "None":
            dttm = dt.strptime(dates['next_game_datetime'],
                               '%Y-%m-%dT%H:%M:%SZ')
            dttm_local = dt_util.as_local(dttm)
            time = {'next_game_time': dttm_local.strftime('%-I:%M %p')}
            # If next game is scheduled Today or Tomorrow,
            # return "Today" or "Tomorrow". Else, return
            # the actual date of the next game.
            next_game_date = dttm_local.strftime('%B %-d, %Y')
            now = dt_util.as_local(dt.now())
            pick = {
                now.strftime("%Y-%m-%d"): "Today,",
                (now + timedelta(days=1)).strftime("%Y-%m-%d"): "Tomorrow,"
            }
            game_date = pick.get(dttm_local.strftime("%Y-%m-%d"),
                                 next_game_date)
        else:
            time = {
                'next_game_time': ''
            }
            game_date = 'No Game Scheduled'
            next_game_date = ''
        next = {'next_game_date': next_game_date}
        # Merge all attributes to a single dict.
        all_attr = {
            **broadcasts,
            **linescore,
            **games,
            **plays,
            **time,
            **next
            }
        next_date_time = game_date + " " + time['next_game_time']
        return all_attr, next_date_time

    def set_state(self):
        """Set sensor state to game state and set polling interval."""
        all_attr = self.get_game_data()[0]
        next_date_time = self.get_game_data()[1]
        if all_attr.get('game_state') == "Scheduled":
            # Display next game date and time if none today.
            self._state = next_date_time
        else:
            self._state = all_attr.get('game_state', next_date_time)
        # Set sensor state attributes.
        self._state_attributes = all_attr
        # Set away team logo url as attribute 'away_logo'.
        self._state_attributes['away_logo'] = \
            LOGO_URL.format(self._state_attributes.get('away_id'))
        # Set home team logo url as attribute 'home_logo'.
        self._state_attributes['home_logo'] = \
            LOGO_URL.format(self._state_attributes.get('home_id'))
        # Set attribute for goal scored by tracked team.
        if self._state_attributes.get('goal_team_id', None) == self._team_id:
            self._state_attributes['goal_tracked_team'] = True
        else:
            self._state_attributes['goal_tracked_team'] = False
        # Send the event to the goal event handler.
        goal_team_id = self._state_attributes.get('goal_team_id', None)
        goal_event_id = self._state_attributes.get('goal_event_id', None)
        goal_event_handler(goal_team_id, goal_event_id, self.hass)
        # Clear the event list at game end.
        if self._state == "Game Over":
            event_list(0, True)
        return self._state

    def set_polling(self):
        game_state = self._state
        if game_state == "Pre-Game":
            polling_delta = PREGAME_SCAN_INTERVAL
        elif game_state in [None, "In Progress", "In Progress - Critical"]:
            if self._scan_interval > LIVE_SCAN_INTERVAL:
                polling_delta = self._scan_interval
            else:
                polling_delta = LIVE_SCAN_INTERVAL
        else:
            polling_delta = POSTGAME_SCAN_INTERVAL
        return polling_delta

    def update(self):
        """Update the sensor."""
        self.set_state()


def event_list(event_id=0, clear=False, lst=[]):
    """Keep a list of goal event IDs returned by the API."""
    lst.append(event_id)
    lst = list(set(lst))
    if clear:
        lst.clear()
    return lst


def goal_event_handler(goal_team_id, goal_event_id, hass):
    """Handle firing of the goal event."""
    team_id = str(goal_team_id)
    event_id = str(goal_event_id)
    # If the event hasn't yet been fired for this goal, fire it.
    # Else, add the event to the list anyway, in case the list is new.
    if event_list() != [0] and event_id not in event_list():
        hass.bus.fire('nhl_goal', {"team_id": team_id})
        event_list(event_id)
    else:
        event_list(event_id)
