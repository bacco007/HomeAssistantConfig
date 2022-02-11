""" NFL Team Status """
import logging
from datetime import timedelta
import arrow

import aiohttp
from async_timeout import timeout
from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_registry import (
    async_entries_for_config_entry,
    async_get,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    API_ENDPOINT,
    CONF_TIMEOUT,
    CONF_TEAM_ID,
    COORDINATOR,
    DEFAULT_TIMEOUT,
    DOMAIN,
    ISSUE_URL,
    PLATFORMS,
    USER_AGENT,
    VERSION,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Load the saved entities."""
    # Print startup message
    _LOGGER.info(
        "NFL version %s is starting, if you have any issues please report them here: %s",
        VERSION,
        ISSUE_URL,
    )
    hass.data.setdefault(DOMAIN, {})

    if entry.unique_id is not None:
        hass.config_entries.async_update_entry(entry, unique_id=None)

        ent_reg = async_get(hass)
        for entity in async_entries_for_config_entry(ent_reg, entry.entry_id):
            ent_reg.async_update_entity(entity.entity_id, new_unique_id=entry.entry_id)

    # Setup the data coordinator
    coordinator = AlertsDataUpdateCoordinator(
        hass,
        entry.data,
        entry.data.get(CONF_TIMEOUT)
    )

    # Fetch initial data so we have data when entities subscribe
    await coordinator.async_refresh()

    hass.data[DOMAIN][entry.entry_id] = {
        COORDINATOR: coordinator,
    }

    hass.config_entries.async_setup_platforms(entry, PLATFORMS)
    return True


async def async_unload_entry(hass, config_entry):
    """Handle removal of an entry."""
    try:
        await hass.config_entries.async_forward_entry_unload(config_entry, "sensor")
        _LOGGER.info("Successfully removed sensor from the " + DOMAIN + " integration")
    except ValueError:
        pass
    return True


async def update_listener(hass, entry):
    """Update listener."""
    entry.data = entry.options
    await hass.config_entries.async_forward_entry_unload(entry, "sensor")
    hass.async_add_job(hass.config_entries.async_forward_entry_setup(entry, "sensor"))

async def async_migrate_entry(hass, config_entry):
     """Migrate an old config entry."""
     version = config_entry.version

     # 1-> 2: Migration format
     if version == 1:
         _LOGGER.debug("Migrating from version %s", version)
         updated_config = config_entry.data.copy()

         if CONF_TIMEOUT not in updated_config.keys():
             updated_config[CONF_TIMEOUT] = DEFAULT_TIMEOUT

         if updated_config != config_entry.data:
             hass.config_entries.async_update_entry(config_entry, data=updated_config)

         config_entry.version = 2
         _LOGGER.debug("Migration to version %s complete", config_entry.version)

     return True

class AlertsDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching NFL data."""

    def __init__(self, hass, config, the_timeout: int):
        """Initialize."""
        self.interval = timedelta(minutes=10)
        self.name = config[CONF_NAME]
        self.timeout = the_timeout
        self.config = config
        self.hass = hass

        _LOGGER.debug("Data will be updated every %s", self.interval)

        super().__init__(hass, _LOGGER, name=self.name, update_interval=self.interval)

    async def _async_update_data(self):
        """Fetch data"""
        async with timeout(self.timeout):
            try:
                data = await update_game(self.config)
                # update the interval based on flag
                if data["private_fast_refresh"] == True:
                    self.update_interval = timedelta(seconds=5)
                else:
                    self.update_interval = timedelta(minutes=10)
            except Exception as error:
                raise UpdateFailed(error) from error
            return data
        


async def update_game(config) -> dict:
    """Fetch new state data for the sensor.
    This is the only method that should fetch new data for Home Assistant.
    """

    data = await async_get_state(config)
    return data

async def async_get_state(config) -> dict:
    """Query API for status."""

    values = {}
    headers = {"User-Agent": USER_AGENT, "Accept": "application/ld+json"}
    data = None
    url = API_ENDPOINT
    team_id = config[CONF_TEAM_ID]
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as r:
            _LOGGER.debug("Getting state for %s from %s" % (team_id, url))
            if r.status == 200:
                data = await r.json()

    found_team = False
    if data is not None:
        for event in data["events"]:
            #_LOGGER.debug("Looking at this event: %s" % event)
            if team_id in event["shortName"]:
                _LOGGER.debug("Found event; parsing data.")
                found_team = True
                team_index = 0 if event["competitions"][0]["competitors"][0]["team"]["abbreviation"] == team_id else 1
                oppo_index = abs((team_index-1))
                values["state"] = event["status"]["type"]["state"].upper()
                values["date"] = event["date"]
                values["kickoff_in"] = arrow.get(event["date"]).humanize()
                values["venue"] = event["competitions"][0]["venue"]["fullName"]
                values["location"] = "%s, %s" % (event["competitions"][0]["venue"]["address"]["city"], event["competitions"][0]["venue"]["address"]["state"])
                values["tv_network"] = event["competitions"][0]["broadcasts"][0]["names"][0]
                if event["status"]["type"]["state"].lower() in ['pre']: # odds only exist pre-game
                    values["odds"] = event["competitions"][0]["odds"][0]["details"]
                    values["overunder"] = event["competitions"][0]["odds"][0]["overUnder"]
                else:
                    values["odds"] = None
                    values["overunder"] = None
                if event["status"]["type"]["state"].lower() in ['pre', 'post']: # could use status.completed == true as well
                    values["possession"] = None
                    values["last_play"] = None
                    values["down_distance_text"] = None
                    values["team_timeouts"] = 3
                    values["opponent_timeouts"] = 3
                    values["quarter"] = None
                    values["clock"] = None
                    values["team_win_probability"] = None
                    values["opponent_win_probability"] = None
                else:
                    values["quarter"] = event["status"]["period"]
                    values["clock"] = event["status"]["displayClock"]
                    values["last_play"] = event["competitions"][0]["situation"]["lastPlay"]["text"]
                    try:
                        values["down_distance_text"] = event["competitions"][0]["situation"]["downDistanceText"]
                    except:
                        values["down_distance_text"] = None
                    try:
                        values["possession"] = event["competitions"][0]["situation"]["possession"]
                    except:
                        values["possession"] = None
                    if event["competitions"][0]["competitors"][team_index]["homeAway"] == "home":
                        values["team_timeouts"] = event["competitions"][0]["situation"]["homeTimeouts"]
                        values["opponent_timeouts"] = event["competitions"][0]["situation"]["awayTimeouts"]
                        try:
                            values["team_win_probability"] = event["competitions"][0]["situation"]["lastPlay"]["probability"]["homeWinPercentage"]
                            values["opponent_win_probability"] = event["competitions"][0]["situation"]["lastPlay"]["probability"]["awayWinPercentage"]
                        except:
                            values["team_win_probability"] = None
                            values["opponent_win_probability"] = None
                    else:
                        values["team_timeouts"] = event["competitions"][0]["situation"]["awayTimeouts"]
                        values["opponent_timeouts"] = event["competitions"][0]["situation"]["homeTimeouts"]
                        try:
                            values["team_win_probability"] = event["competitions"][0]["situation"]["lastPlay"]["probability"]["awayWinPercentage"]
                            values["opponent_win_probability"] = event["competitions"][0]["situation"]["lastPlay"]["probability"]["homeWinPercentage"]
                        except:
                            values["team_win_probability"] = None
                            values["opponent_win_probability"] = None
                values["team_abbr"] = event["competitions"][0]["competitors"][team_index]["team"]["abbreviation"]
                values["team_id"] = event["competitions"][0]["competitors"][team_index]["team"]["id"]
                values["team_name"] = event["competitions"][0]["competitors"][team_index]["team"]["shortDisplayName"]
                try:
                    values["team_record"] = event["competitions"][0]["competitors"][team_index]["records"][0]["summary"]
                except:
                    values["team_record"] = None
                values["team_homeaway"] = event["competitions"][0]["competitors"][team_index]["homeAway"]
                values["team_logo"] = event["competitions"][0]["competitors"][team_index]["team"]["logo"]
                try:
                    values["team_colors"] = [''.join(('#',event["competitions"][0]["competitors"][team_index]["team"]["color"])), 
                                         ''.join(('#',event["competitions"][0]["competitors"][team_index]["team"]["alternateColor"]))]
                except:
                    if team_id == 'NFC':
                        values["team_colors"] = ['#013369','#013369']
                    if team_id == 'AFC':
                        values["team_colors"] = ['#D50A0A','#D50A0A']
                values["team_score"] = event["competitions"][0]["competitors"][team_index]["score"]                
                values["opponent_abbr"] = event["competitions"][0]["competitors"][oppo_index]["team"]["abbreviation"]
                values["opponent_id"] = event["competitions"][0]["competitors"][oppo_index]["team"]["id"]
                values["opponent_name"] = event["competitions"][0]["competitors"][oppo_index]["team"]["shortDisplayName"]
                try:
                    values["opponent_record"] = event["competitions"][0]["competitors"][oppo_index]["records"][0]["summary"]
                except:
                    values["opponent_record"] = None
                values["opponent_homeaway"] = event["competitions"][0]["competitors"][oppo_index]["homeAway"]
                values["opponent_logo"] = event["competitions"][0]["competitors"][oppo_index]["team"]["logo"]
                try:
                    values["opponent_colors"] = [''.join(('#',event["competitions"][0]["competitors"][team_index]["team"]["color"])), 
                                         ''.join(('#',event["competitions"][0]["competitors"][team_index]["team"]["alternateColor"]))]
                except:
                    if team_id == 'AFC':
                        values["opponent_colors"] = ['#013369','#013369']
                    if team_id == 'NFC':
                        values["opponent_colors"] = ['#D50A0A','#D50A0A']
                values["opponent_score"] = event["competitions"][0]["competitors"][oppo_index]["score"]
                values["last_update"] = arrow.now().format(arrow.FORMAT_W3C)
                values["private_fast_refresh"] = False
        
        # Never found the team. Either a bye or a post-season condition
        if not found_team:
            _LOGGER.debug("Did not find a game with for the configured team. Checking if it's a bye week.")
            found_bye = False
            values = await async_clear_states(config)
            try: # look for byes in regular season
                for bye_team in data["week"]["teamsOnBye"]:
                    if team_id.lower() == bye_team["abbreviation"].lower():
                        _LOGGER.debug("Bye week confirmed.")
                        found_bye = True
                        values["team_abbr"] = bye_team["abbreviation"]
                        values["team_name"] = bye_team["shortDisplayName"]
                        values["team_logo"] = bye_team["logo"]
                        values["state"] = 'BYE'
                        values["last_update"] = arrow.now().format(arrow.FORMAT_W3C)
                if found_bye == False:
                        _LOGGER.debug("Team not found in active games or bye week list. Have you missed the playoffs?")
                        values["team_abbr"] = None
                        values["team_name"] = None
                        values["team_logo"] = None
                        values["state"] = 'NOT_FOUND'
                        values["last_update"] = arrow.now().format(arrow.FORMAT_W3C)
            except:
                _LOGGER.debug("Team not found in active games or bye week list. Have you missed the playoffs?")
                values["team_abbr"] = None
                values["team_name"] = None
                values["team_logo"] = None
                values["state"] = 'NOT_FOUND'
                values["last_update"] = arrow.now().format(arrow.FORMAT_W3C)

        if values["state"] == 'PRE' and ((arrow.get(values["date"])-arrow.now()).total_seconds() < 1200):
            _LOGGER.debug("Event is within 20 minutes, setting refresh rate to 5 seconds.")
            values["private_fast_refresh"] = True
        elif values["state"] == 'IN':
            _LOGGER.debug("Event in progress, setting refresh rate to 5 seconds.")
            values["private_fast_refresh"] = True
        elif values["state"] in ['POST', 'BYE']: 
            _LOGGER.debug("Event is over, setting refresh back to 10 minutes.")
            values["private_fast_refresh"] = False

    return values

async def async_clear_states(config) -> dict:
    """Clear all state attributes"""
    
    values = {}
    # Reset values
    values = {
        "date": None,
        "kickoff_in": None,
        "quarter": None,
        "clock": None,
        "venue": None,
        "location": None,
        "tv_network": None,
        "odds": None,
        "overunder": None,
        "last_play": None,
        "down_distance_text": None,
        "possession": None,
        "team_id": None,
        "team_record": None,
        "team_homeaway": None,
        "team_colors": None,
        "team_score": None,
        "team_win_probability": None,
        "team_timeouts": None,
        "opponent_abbr": None,
        "opponent_id": None,
        "opponent_name": None,
        "opponent_record": None,
        "opponent_homeaway": None,
        "opponent_logo": None,
        "opponent_colors": None,
        "opponent_score": None,
        "opponent_win_probability": None,
        "opponent_timeouts": None,
        "last_update": None,
        "private_fast_refresh": False
    }

    return values
