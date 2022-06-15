"""The jellyfin component."""
import asyncio
import json
import logging
import time
import re
import traceback
import collections.abc
from datetime import datetime, timedelta
import dateutil.parser as dt
from typing import Mapping, MutableMapping, Optional, Sequence, Iterable, List, Tuple

import voluptuous as vol

from homeassistant import util
from homeassistant.exceptions import ConfigEntryNotReady
from jellyfin_apiclient_python import JellyfinClient
from jellyfin_apiclient_python.connection_manager import CONNECTION_STATE

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (  # pylint: disable=import-error
    ATTR_ENTITY_ID,
    ATTR_ID,
    CONF_URL,
    CONF_USERNAME,
    CONF_PASSWORD,
    CONF_VERIFY_SSL,
    CONF_CLIENT_ID,
    EVENT_HOMEASSISTANT_STOP,
)
import homeassistant.helpers.config_validation as cv  # pylint: disable=import-error
from homeassistant.helpers.device_registry import DeviceEntry
from homeassistant.helpers import entity_registry

from homeassistant.helpers.dispatcher import (  # pylint: disable=import-error
    async_dispatcher_send,
)

from .const import (
    DOMAIN,
    USER_APP_NAME,
    CLIENT_VERSION,
    SIGNAL_STATE_UPDATED,
    SERVICE_SCAN,
    SERVICE_BROWSE,
    SERVICE_DELETE,
    SERVICE_SEARCH,
    SERVICE_YAMC_SETPAGE,
    SERVICE_YAMC_SETPLAYLIST,
    ATTR_PAGE,
    ATTR_PLAYLIST,
    ATTR_SEARCH_TERM,
    STATE_OFF,
    STATE_IDLE,
    STATE_PAUSED,
    STATE_PLAYING,
    CONF_GENERATE_UPCOMING,
    CONF_GENERATE_YAMC,
    YAMC_PAGE_SIZE,
    PLAYLISTS,
)

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor", "media_player"]
UPDATE_UNLISTENER = None
MIN_TIME_BETWEEN_UPDATES = timedelta(minutes=30)

PATH_REGEX = re.compile("^(https?://)?([^/:]+)(:[0-9]+)?(/.*)?$")

SERVICE_SCHEMA = vol.Schema({
})

SCAN_SERVICE_SCHEMA = SERVICE_SCHEMA.extend(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_id,
    }
)
YAMC_SETPAGE_SERVICE_SCHEMA = SERVICE_SCHEMA.extend(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_id,
        vol.Required(ATTR_PAGE): vol.All(vol.Coerce(int))
    }
)
YAMC_SETPLAYLIST_SERVICE_SCHEMA = SERVICE_SCHEMA.extend(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_id,
        vol.Required(ATTR_PLAYLIST): cv.string
    }
)
DELETE_SERVICE_SCHEMA = SERVICE_SCHEMA.extend(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_id,
        vol.Required(ATTR_ID): cv.string
    }
)
SEARCH_SERVICE_SCHEMA = SERVICE_SCHEMA.extend(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_id,
        vol.Required(ATTR_SEARCH_TERM): cv.string
    }
)
BROWSE_SERVICE_SCHEMA = SERVICE_SCHEMA.extend(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_id,
        vol.Required(ATTR_ID): cv.string
    }
)

SERVICE_TO_METHOD = {
    SERVICE_SCAN: {'method': 'async_trigger_scan', 'schema': SCAN_SERVICE_SCHEMA},
    SERVICE_BROWSE: {'method': 'async_browse_item', 'schema': BROWSE_SERVICE_SCHEMA},
    SERVICE_DELETE: {'method': 'async_delete_item', 'schema': DELETE_SERVICE_SCHEMA},
    SERVICE_SEARCH: {'method': 'async_search_item', 'schema': SEARCH_SERVICE_SCHEMA},
    SERVICE_YAMC_SETPAGE: {'method': 'async_yamc_setpage', 'schema': YAMC_SETPAGE_SERVICE_SCHEMA},
    SERVICE_YAMC_SETPLAYLIST: {'method': 'async_yamc_setplaylist', 'schema': YAMC_SETPLAYLIST_SERVICE_SCHEMA},
}

def autolog(message):
    "Automatically log the current function details."
    import inspect
    # Get the previous frame in the stack, otherwise it would
    # be this function!!!
    func = inspect.currentframe().f_back.f_code
    # Dump the message + the name of this function to the log.
    _LOGGER.debug("%s: %s in %s:%i" % (
        message, 
        func.co_name, 
        func.co_filename, 
        func.co_firstlineno
    ))

async def async_setup(hass: HomeAssistant, config: dict):
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}

    return True


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry):
    autolog("<<<")

    global UPDATE_UNLISTENER
    if UPDATE_UNLISTENER:
        UPDATE_UNLISTENER()

    if not config_entry.unique_id:
        hass.config_entries.async_update_entry(
            config_entry, unique_id=config_entry.title
        )

    config = {}
    for key, value in config_entry.data.items():
        config[key] = value
    for key, value in config_entry.options.items():
        config[key] = value
    if config_entry.options:
        hass.config_entries.async_update_entry(config_entry, data=config, options={})

    UPDATE_UNLISTENER = config_entry.add_update_listener(_update_listener)

    hass.data[DOMAIN][config.get(CONF_URL)] = {}
    _jelly = JellyfinClientManager(hass, config)
    try:
        await _jelly.connect()
        hass.data[DOMAIN][config.get(CONF_URL)]["manager"] = _jelly
    except:
        _LOGGER.error("Cannot connect to Jellyfin server.")
        raise ConfigEntryNotReady

    async def async_service_handler(service):
        """Map services to methods"""
        method = SERVICE_TO_METHOD.get(service.service)
        params = {key: value for key, value in service.data.items() if key != "entity_id"}

        entity_id = service.data.get(ATTR_ENTITY_ID)

        for sensor in hass.data[DOMAIN][config.get(CONF_URL)]["sensor"]["entities"]:
            if sensor.entity_id == entity_id:
                await getattr(sensor, method['method'])(**params)

        for media_player in hass.data[DOMAIN][config.get(CONF_URL)]["media_player"]["entities"]:
            if media_player.entity_id == entity_id:
                await getattr(media_player, method['method'])(**params)

    for my_service in SERVICE_TO_METHOD:
        schema = SERVICE_TO_METHOD[my_service].get('schema', SERVICE_SCHEMA)
        hass.services.async_register(
            DOMAIN, my_service, async_service_handler, schema=schema)

    await _jelly.start()

    for platform in PLATFORMS:
        hass.data[DOMAIN][config.get(CONF_URL)][platform] = {}
        hass.data[DOMAIN][config.get(CONF_URL)][platform]["entities"] = []
        hass.async_create_task(
            hass.config_entries.async_forward_entry_setup(config_entry, platform)
        )

    async_dispatcher_send(hass, SIGNAL_STATE_UPDATED)

    async def stop_jellyfin(event):
        """Stop Jellyfin connection."""
        await _jelly.stop()

    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, stop_jellyfin)
    
    return True

async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry):
    _LOGGER.info("Unloading jellyfin")

    unload_ok = all(
        await asyncio.gather(
            *[
                hass.config_entries.async_forward_entry_unload(config_entry, component)
                for component in PLATFORMS
            ]
        )
    )

    _jelly: JellyfinClientManager = hass.data[DOMAIN][config_entry.data.get(CONF_URL)]["manager"]
    await _jelly.stop()

    return unload_ok

async def _update_listener(hass: HomeAssistant, config_entry):
    """Update listener."""
    _LOGGER.debug("reload triggered")
    await hass.config_entries.async_reload(config_entry.entry_id)

async def async_remove_config_entry_device(
    hass: HomeAssistant, config_entry: ConfigEntry, device_entry: DeviceEntry
) -> bool:
    """Remove a config entry from a device."""
    entreg = entity_registry.async_get(hass)
    if entity_registry.async_entries_for_device(entreg, device_entry.id):
        return False
    return True

class JellyfinDevice(object):
    """ Represents properties of an Jellyfin Device. """

    def __init__(self, session, jf_manager):
        """Initialize Jellyfin device object."""
        self.jf_manager = jf_manager
        self.is_active = True
        self.update_session(session)

    def update_session(self, session):
        """ Update session object. """
        self.session = session

    def set_active(self, active):
        """ Mark device as on/off. """
        self.is_active = active

    @property
    def session_raw(self):
        """ Return raw session data. """
        return self.session

    @property
    def session_id(self):
        """ Return current session Id. """
        try:
            return self.session['Id']
        except KeyError:
            return None

    @property
    def unique_id(self):
        """ Return device id."""
        try:
            return self.session['DeviceId']
        except KeyError:
            return None

    @property
    def name(self):
        """ Return device name."""
        try:
            return self.session['DeviceName']
        except KeyError:
            return None

    @property
    def client(self):
        """ Return client name. """
        try:
            return self.session['Client']
        except KeyError:
            return None

    @property
    def username(self):
        """ Return device name."""
        try:
            return self.session['UserName']
        except KeyError:
            return None

    @property
    def media_title(self):
        """ Return title currently playing."""
        try:
            return self.session['NowPlayingItem']['Name']
        except KeyError:
            return None

    @property
    def media_season(self):
        """Season of curent playing media (TV Show only)."""
        try:
            return self.session['NowPlayingItem']['ParentIndexNumber']
        except KeyError:
            return None

    @property
    def media_series_title(self):
        """The title of the series of current playing media (TV Show only)."""
        try:
            return self.session['NowPlayingItem']['SeriesName']
        except KeyError:
            return None

    @property
    def media_episode(self):
        """Episode of current playing media (TV Show only)."""
        try:
            return self.session['NowPlayingItem']['IndexNumber']
        except KeyError:
            return None

    @property
    def media_album_name(self):
        """Album name of current playing media (Music track only)."""
        try:
            return self.session['NowPlayingItem']['Album']
        except KeyError:
            return None

    @property
    def media_artist(self):
        """Artist of current playing media (Music track only)."""
        try:
            artists = self.session['NowPlayingItem']['Artists']
            if len(artists) > 1:
                return artists[0]
            else:
                return artists
        except KeyError:
            return None

    @property
    def media_album_artist(self):
        """Album artist of current playing media (Music track only)."""
        try:
            return self.session['NowPlayingItem']['AlbumArtist']
        except KeyError:
            return None

    @property
    def media_id(self):
        """ Return title currently playing."""
        try:
            return self.session['NowPlayingItem']['Id']
        except KeyError:
            return None

    @property
    def media_type(self):
        """ Return type currently playing."""
        try:
            return self.session['NowPlayingItem']['Type']
        except KeyError:
            return None

    @property
    def media_image_url(self):
        """Image url of current playing media."""
        if self.is_nowplaying:
            try:
                image_id = self.session['NowPlayingItem']['ImageTags']['Thumb']
                image_type = 'Thumb'
            except KeyError:
                try:
                    image_id = self.session[
                        'NowPlayingItem']['ImageTags']['Primary']
                    image_type = 'Primary'
                except KeyError:
                    return None
            url = self.jf_manager.api.artwork(self.media_id, image_type, 500)
            return url
        else:
            return None

    @property
    def media_position(self):
        """ Return position currently playing."""
        try:
            return int(self.session['PlayState']['PositionTicks']) / 10000000
        except KeyError:
            return None

    @property
    def media_runtime(self):
        """ Return total runtime length."""
        try:
            return int(
                self.session['NowPlayingItem']['RunTimeTicks']) / 10000000
        except KeyError:
            return None

    @property
    def media_percent_played(self):
        """ Return media percent played. """
        try:
            return (self.media_position / self.media_runtime) * 100
        except TypeError:
            return None

    @property
    def state(self):
        """ Return current playstate of the device. """
        if self.is_active:
            if 'NowPlayingItem' in self.session:
                if self.session['PlayState']['IsPaused']:
                    return STATE_PAUSED
                else:
                    return STATE_PLAYING
            else:
                return STATE_IDLE
        else:
            return STATE_OFF

    @property
    def is_nowplaying(self):
        """ Return true if an item is currently active. """
        if self.state == 'Idle' or self.state == 'Off':
            return False
        else:
            return True

    @property
    def supports_remote_control(self):
        """ Return remote control status. """
        return self.session['SupportsRemoteControl']

    async def get_item(self, id):
        return await self.jf_manager.get_item(id)

    async def get_items(self, query=None):
        return await self.jf_manager.get_items(query)

    async def get_artwork(self, media_id) -> Tuple[Optional[str], Optional[str]]:
        return await self.jf_manager.get_artwork(media_id)

    def get_artwork_url(self, media_id, type="Primary") -> str:
        return self.jf_manager.get_artwork_url(media_id, type)

    async def set_playstate(self, state, pos=0):
        """ Send media commands to server. """
        params = {}
        if state == 'Seek':
            params['SeekPositionTicks'] = int(pos * 10000000)
            params['static'] = 'true'

        await self.jf_manager.set_playstate(self.session_id, state, params)

    def media_play(self):
        """ Send play command to device. """
        return self.set_playstate('Unpause')

    def media_pause(self):
        """ Send pause command to device. """
        return self.set_playstate('Pause')

    def media_stop(self):
        """ Send stop command to device. """
        return self.set_playstate('Stop')

    def media_next(self):
        """ Send next track command to device. """
        return self.set_playstate('NextTrack')

    def media_previous(self):
        """ Send previous track command to device. """
        return self.set_playstate('PreviousTrack')

    def media_seek(self, position):
        """ Send seek command to device. """
        return self.set_playstate('Seek', position)

    async def play_media(self, media_id):
        await self.jf_manager.play_media(self.session_id, media_id)

    async def browse_item(self, media_id):
        await self.jf_manager.view_media(self.session_id, media_id)

class JellyfinClientManager(object):
    def __init__(self, hass: HomeAssistant, config_entry):
        self.hass = hass
        self.callback = lambda client, event_name, data: None
        self.jf_client: JellyfinClient = None
        self.is_stopping = True
        self._event_loop = hass.loop
        
        self.host = config_entry[CONF_URL]
        self._info = None
        self._data = None
        self._yamc = None
        self._yamc_cur_page = 1
        self._last_playlist = ""
        self._last_search = ""

        self.config_entry = config_entry
        self.server_url = ""

        self._sessions = None
        self._devices: Mapping[str, JellyfinDevice] = {}

        # Callbacks
        self._new_devices_callbacks = []
        self._stale_devices_callbacks = []
        self._update_callbacks = []

    @staticmethod
    def expo(max_value = None):
        n = 0
        while True:
            a = 2 ** n
            if max_value is None or a < max_value:
                yield a
                n += 1
            else:
                yield max_value

    @staticmethod
    def clean_none_dict_values(obj):
        """
        Recursively remove keys with a value of None
        """
        if not isinstance(obj, collections.abc.Iterable) or isinstance(obj, str):
            return obj

        queue = [obj]

        while queue:
            item = queue.pop()

            if isinstance(item, collections.abc.Mapping):
                mutable = isinstance(item, collections.abc.MutableMapping)
                remove = []

                for key, value in item.items():
                    if value is None and mutable:
                        remove.append(key)

                    elif isinstance(value, str):
                        continue

                    elif isinstance(value, collections.abc.Iterable):
                        queue.append(value)

                if mutable:
                    # Remove keys with None value
                    for key in remove:
                        item.pop(key)

            elif isinstance(item, collections.abc.Iterable):
                for value in item:
                    if value is None or isinstance(value, str):
                        continue
                    elif isinstance(value, collections.abc.Iterable):
                        queue.append(value)

        return obj

    async def connect(self):
        autolog(">>>")

        is_logged_in = await self.hass.async_add_executor_job(self.login)

        if is_logged_in:
            _LOGGER.info("Successfully added server.")
        else:
            raise ConfigEntryNotReady

    @staticmethod
    def client_factory(config_entry):
        client = JellyfinClient(allow_multiple_clients=True)
        client.config.data["app.default"] = True
        client.config.app(
            USER_APP_NAME, CLIENT_VERSION, USER_APP_NAME, config_entry[CONF_CLIENT_ID]
        )
        client.config.data["auth.ssl"] = config_entry[CONF_VERIFY_SSL]
        return client

    def login(self):
        autolog(">>>")

        self.server_url = self.config_entry[CONF_URL]

        if self.server_url.endswith("/"):
            self.server_url = self.server_url[:-1]

        protocol, host, port, path = PATH_REGEX.match(self.server_url).groups()

        if not protocol:
            _LOGGER.warning("Adding http:// because it was not provided.")
            protocol = "http://"

        if protocol == "http://" and not port:
            _LOGGER.warning("Adding port 8096 for insecure local http connection.")
            _LOGGER.warning(
                "If you want to connect to standard http port 80, use :80 in the url."
            )
            port = ":8096"

        if protocol == "https://" and not port:
            port = ":443"

        self.server_url = "".join(filter(bool, (protocol, host, port, path)))

        self.jf_client = self.client_factory(self.config_entry)
        status = self.jf_client.auth.connect_to_address(self.server_url)
        if (status["State"] == 0): # Unavailable 
            return False

        result = self.jf_client.auth.login(self.server_url, self.config_entry[CONF_USERNAME], self.config_entry[CONF_PASSWORD])
        if "AccessToken" not in result:
            return False

        credentials = self.jf_client.auth.credentials.get_credentials()
        self.jf_client.authenticate(credentials)
        return True

    async def start(self):
        autolog(">>>")

        def event(event_name, data):
            _LOGGER.debug("Event: %s", event_name)
            if event_name == "WebSocketConnect":
                self.jf_client.wsc.send("SessionsStart", "0,1500")
            elif event_name == "WebSocketDisconnect":
                timeout_gen = self.expo(100)
                while not self.is_stopping:
                    timeout = next(timeout_gen)
                    _LOGGER.warning(
                        "No connection to server. Next try in {0} second(s)".format(
                            timeout
                        )
                    )
                    self.jf_client.stop()
                    time.sleep(timeout)
                    if self.login():
                        self.jf_client.callback = event
                        self.jf_client.callback_ws = event
                        self.jf_client.start(True)
                        break
            elif event_name in ("LibraryChanged", "UserDataChanged"):
                for sensor in self.hass.data[DOMAIN][self.host]["sensor"]["entities"]:
                    autolog("LibraryChanged: trigger update")
                    sensor.schedule_update_ha_state(force_refresh=True)
            elif event_name == "Sessions":
                self._sessions = self.clean_none_dict_values(data)["value"]
                self.update_device_list()
            else:
                self.callback(self.jf_client, event_name, data)

        self.jf_client.callback = event
        self.jf_client.callback_ws = event

        await self.hass.async_add_executor_job(self.jf_client.start, True)
        self.is_stopping = False

        self._info = await self.hass.async_add_executor_job(self.jf_client.jellyfin._get, "System/Info")
        self._sessions = self.clean_none_dict_values(await self.hass.async_add_executor_job(self.jf_client.jellyfin.get_sessions))
        await self.update_data()

    async def stop(self):
        autolog("<<<")

        self.is_stopping = True
        await self.hass.async_add_executor_job(self.jf_client.stop)

    async def update_data(self):
        autolog("<<<")
        
        if self.config_entry[CONF_GENERATE_UPCOMING]:
            self._data = await self.hass.async_add_executor_job(self.jf_client.jellyfin.shows, "/NextUp", {
                'Limit': YAMC_PAGE_SIZE,
                'UserId': "{UserId}",
                "fields": "DateCreated,Studios,Genres",
                'excludeItemTypes': 'Folder',
            })
            #_LOGGER.debug("update data: %s", str(self._data))

        if self.config_entry[CONF_GENERATE_YAMC]:
            query = {
                'startIndex': (self._yamc_cur_page - 1) * YAMC_PAGE_SIZE,
                'limit': YAMC_PAGE_SIZE,
                'userId': "{UserId}",
                'recursive': 'true',
                "fields": "DateCreated,Studios,Genres,Taglines,ProviderIds,Ratings,MediaStreams",
                'collapseBoxSetItems': 'false',
                'excludeItemTypes': 'Folder',
            }

            if not self._last_playlist:
                self._last_playlist = "latest_movies"

            if self._last_search:
                query["searchTerm"] = self._last_search
            elif self._last_playlist:
                for pl in PLAYLISTS:
                    if pl["name"] == self._last_playlist:
                        query.update(pl["query"] )

            if self._last_playlist == "nextup":
                self._yamc = await self.hass.async_add_executor_job(self.jf_client.jellyfin.shows, "/NextUp", query)
            else:
                self._yamc = await self.hass.async_add_executor_job(self.jf_client.jellyfin.items, "", "GET", query)        

            if self._yamc is None or "Items" not in self._yamc:
                _LOGGER.error("Cannot update data")
                return

            for item in self._yamc["Items"]:
                stream_info = await self.get_stream_url(item["Id"], item["Type"])
                item["stream_url"] = stream_info[0]
                item["info"] = stream_info[2]
            
            _LOGGER.debug("update yamc query: %s", str(query))
            _LOGGER.debug("         response: %s", str(self._yamc))

    def update_device_list(self):
        """ Update device list. """
        autolog(">>>")
        # _LOGGER.debug("sessions: %s", str(sessions))
        if self._sessions is None:
            _LOGGER.error('Error updating Jellyfin devices.')
            return

        try:
            new_devices = []
            active_devices = []
            dev_update = False
            for device in self._sessions:
                # _LOGGER.debug("device: %s", str(device))
                dev_name = '{}.{}'.format(device['DeviceId'], device['Client'])

                try:
                    _LOGGER.debug('Session msg on %s of type: %s, themeflag: %s',
                                dev_name, device['NowPlayingItem']['Type'],
                                device['NowPlayingItem']['IsThemeMedia'])
                except KeyError:
                    pass

                active_devices.append(dev_name)
                if dev_name not in self._devices and \
                        device['DeviceId'] != self.config_entry[CONF_CLIENT_ID]:
                    _LOGGER.debug('New Jellyfin DeviceID: %s. Adding to device list.',
                                dev_name)
                    new = JellyfinDevice(device, self)
                    self._devices[dev_name] = new
                    new_devices.append(new)
                elif device['DeviceId'] != self.config_entry[CONF_CLIENT_ID]:
                    # Before we send in new data check for changes to state
                    # to decide if we need to fire the update callback
                    if not self._devices[dev_name].is_active:
                        # Device wasn't active on the last update
                        # We need to fire a device callback to let subs now
                        dev_update = True

                    do_update = self.update_check(
                        self._devices[dev_name], device)
                    self._devices[dev_name].update_session(device)
                    self._devices[dev_name].set_active(True)
                    if dev_update:
                        self._do_new_devices_callback(0)
                        dev_update = False
                    if do_update:
                        self._do_update_callback(dev_name)

            # Need to check for new inactive devices and flag
            for dev_id in self._devices:
                if dev_id not in active_devices:
                    # Device no longer active
                    if self._devices[dev_id].is_active:
                        self._devices[dev_id].set_active(False)
                        self._do_update_callback(dev_id)
                        self._do_stale_devices_callback(dev_id)

            # Call device callback if new devices were found.
            if new_devices:
                self._do_new_devices_callback(0)
        except Exception as e:
            _LOGGER.critical(traceback.format_exc())
            raise

    def update_check(self, existing: JellyfinDevice, new: JellyfinDevice):
        """ Check device state to see if we need to fire the callback.
        True if either state is 'Playing'
        False if both states are: 'Paused', 'Idle', or 'Off'
        True on any state transition.
        """
        autolog(">>>")

        old_state = existing.state
        if 'NowPlayingItem' in existing.session_raw:
            try:
                old_theme = existing.session_raw['NowPlayingItem']['IsThemeMedia']
            except KeyError:
                old_theme = False
        else:
            old_theme = False

        if 'NowPlayingItem' in new:
            if new['PlayState']['IsPaused']:
                new_state = STATE_PAUSED
            else:
                new_state = STATE_PLAYING

            try:
                new_theme = new['NowPlayingItem']['IsThemeMedia']
            except KeyError:
                new_theme = False

        else:
            new_state = STATE_IDLE
            new_theme = False

        if old_theme or new_theme:
            return False
        elif old_state == STATE_PLAYING or new_state == STATE_PLAYING:
            return True
        elif old_state != new_state:
            return True
        else:
            return False

    @property
    def info(self):
        if self.is_stopping:
            return None

        return self._info
        
    @property
    def data(self):
        """Upcoming card data"""
        if self.config_entry[CONF_GENERATE_UPCOMING] == False or self.is_stopping:
            return None

        data = []
        data.append({
            "title_default": "$title",
            "line1_default": "$episode",
            "line2_default": "$release",
            "line3_default": "$rating - $runtime",
            "line4_default": "$number - $studio",
            "icon": "mdi:arrow-down-bold-circle"
        })

        if self._data is None or "Items" not in self._data:
            return data

        for item in self._data["Items"]:
            data.append({
                "title": item["SeriesName"],
                "episode": item["Name"],
                "flag": False,
                "airdate": item["DateCreated"],
                "number": f'S{item["ParentIndexNumber"]}E{item["IndexNumber"]}',
                "runtime": int(item["RunTimeTicks"] / 10000000 / 60) if "RunTimeTicks" in item else None,
                "studio": ",".join(o["Name"] for o in item["Studios"]),
                "release": dt.parse(item["PremiereDate"]).__format__("%d/%m/%Y") if "PremiereDate" in item else None,
                "poster": self.get_artwork_url(item["Id"]),
                "fanart": self.get_artwork_url(item["Id"], "Backdrop"),
                "genres": ",".join(item["Genres"]),
                "rating": None,
                "stream_url": None,
                "info_url": None,
            })

        return data

    @property
    def yamc(self):
        """Upcoming card data"""
        if self.config_entry[CONF_GENERATE_YAMC] == False or self.is_stopping:
            return None

        data = []
        data.append({
            'title_default': '$title',
            'line1_default': '$tagline',
            'line2_default': '$empty',
            'line3_default': '$release - $genres',
            'line4_default': '$runtime - $rating - $info',
            'line5_default': '$date',
            'text_link_default': '$info_url',
            'link_default': '$stream_url',
        })

        if self._yamc is None or "Items" not in self._yamc:
            return data

        for item in self._yamc["Items"]:
            provid = None

            progress = 0
            if "PlayedPercentage" in item["UserData"]:
                progress = item["UserData"]["PlayedPercentage"]
            elif item["UserData"]["Played"]:
                progress = 100

            rating = None
            if "CommunityRating" in item:
                rating = '\N{BLACK STAR} {}'.format(round(item["CommunityRating"], 1))
            elif "CriticRating" in item:
                rating = '\N{BLACK STAR} {}'.format(round(item["CriticRating"] / 10, 1))

            if item["Type"] == "Movie":
                if "ProviderIds" in item and "Imdb" in item["ProviderIds"]:
                    provid = item["ProviderIds"]["Imdb"]

                data.append({
                    "id": item["Id"],
                    "type": item["Type"],
                    "title": item["Name"],
                    "tagline": item["Taglines"][0] if "Taglines" in item and len(item["Taglines"]) > 0 else "",
                    "flag": item["UserData"]["Played"],
                    "airdate": item["DateCreated"],
                    #"number": f'S{item["ParentIndexNumber"]}E{item["IndexNumber"]}',
                    "runtime": int(item["RunTimeTicks"] / 10000000 / 60) if "RunTimeTicks" in item else None,
                    "studio": ",".join(o["Name"] for o in item["Studios"]),
                    "release": dt.parse(item["PremiereDate"]).__format__("%Y") if "PremiereDate" in item else None,
                    "poster": self.get_artwork_url(item["Id"]),
                    "fanart": self.get_artwork_url(item["Id"], "Backdrop"),
                    "genres": ",".join(item["Genres"]),
                    "progress": progress,
                    "rating": rating,
                    "info": item["info"],
                    "stream_url": item["stream_url"] if "stream_url" in item else None,
                    'info_url': f"https://trakt.tv/search/imdb/{provid}?id_type=movie" if provid else "",
                })
            elif item["Type"] == "Series":
                if "ProviderIds" in item and "Imdb" in item["ProviderIds"]:
                    provid = item["ProviderIds"]["Imdb"]

                data.append({
                    "id": item["Id"],
                    "type": item["Type"],
                    "title": item["SeriesName"] if "SeriesName" in item else item["Name"],
                    "episode": item["Name"],
                    "tagline": item["Name"],
                    "flag": item["UserData"]["Played"],
                    "airdate": item["DateCreated"],
                    "number": f'S{item["ParentIndexNumber"]}E{item["IndexNumber"]}',
                    "runtime": int(item["RunTimeTicks"] / 10000000 / 60) if "RunTimeTicks" in item else None,
                    "studio": ",".join(o["Name"] for o in item["Studios"]),
                    "release": dt.parse(item["PremiereDate"]).__format__("%d/%m/%Y") if "PremiereDate" in item else None,
                    "poster": self.get_artwork_url(item["Id"]),
                    "fanart": self.get_artwork_url(item["Id"], "Backdrop"),
                    "genres": ",".join(item["Genres"]),
                    "progress": progress,
                    "rating": rating,
                    "stream_url": item["stream_url"] if "stream_url" in item else None,
                    'info_url': f"https://trakt.tv/search/imdb/{provid}?id_type=series" if provid else "",
                })
            elif item["Type"] == "Episode":
                if "ProviderIds" in item and "Imdb" in item["ProviderIds"]:
                    provid = item["ProviderIds"]["Imdb"]

                data.append({
                    "id": item["Id"],
                    "type": item["Type"],
                    "title": item["SeriesName"] if "SeriesName" in item else item["Name"],
                    "episode": item["Name"],
                    "tagline": item["Name"],
                    "flag": item["UserData"]["Played"],
                    "airdate": item["DateCreated"],
                    "number": f'S{item["ParentIndexNumber"]}E{item["IndexNumber"]}',
                    "runtime": int(item["RunTimeTicks"] / 10000000 / 60) if "RunTimeTicks" in item else None,
                    "studio": ",".join(o["Name"] for o in item["Studios"]),
                    "release": dt.parse(item["PremiereDate"]).__format__("%d/%m/%Y") if "PremiereDate" in item else None,
                    "poster": self.get_artwork_url(item["Id"]),
                    "fanart": self.get_artwork_url(item["Id"], "Primary"),
                    "genres": ",".join(item["Genres"]),
                    "progress": progress,
                    "rating": rating,
                    "info": item["info"],
                    "stream_url": item["stream_url"] if "stream_url" in item else None,
                    'info_url': f"https://trakt.tv/search/imdb/{provid}?id_type=episode" if provid else "",
                })
            elif item["Type"] == "MusicAlbum":
                if "ProviderIds" in item and "MusicBrainzAlbum" in item["ProviderIds"]:
                    provid = item["ProviderIds"]["MusicBrainzAlbum"]

                data.append({
                    "id": item["Id"],
                    "type": item["Type"],
                    "title": item["Name"],
                    "tagline": ",".join(item["Artists"]) if "Artists" in item else None,
                    "flag": False,
                    "airdate": item["DateCreated"],
                    "runtime": int(item["RunTimeTicks"] / 10000000 / 60) if "RunTimeTicks" in item else None,
                    "studio": ",".join(o["Name"] for o in item["Studios"]),
                    "release": dt.parse(item["PremiereDate"]).__format__("%Y") if "PremiereDate" in item else None,
                    "poster": self.get_artwork_url(item["Id"]),
                    "fanart": self.get_artwork_url(item["Id"], "Primary"),
                    "genres": ",".join(item["Genres"]),
                    "progress": 0,
                    "rating": rating,
                    "stream_url": item["stream_url"] if "stream_url" in item else None,
                    'info_url': f"https://musicbrainz.org/album/{provid}" if provid else "",
                })
            elif item["Type"] == "MusicArtist":
                if "ProviderIds" in item and "MusicBrainzArtist" in item["ProviderIds"]:
                    provid = item["ProviderIds"]["MusicBrainzArtist"]

                data.append({
                    "id": item["Id"],
                    "type": item["Type"],
                    "title": item["Name"],
                    "tagline": ",".join(item["Artists"]) if "Artists" in item else None,
                    "flag": False,
                    "airdate": item["DateCreated"],
                    "runtime": None,
                    "studio": ",".join(o["Name"] for o in item["Studios"]),
                    "release": dt.parse(item["DateCreated"]).__format__("%Y") if "DateCreated" in item else None,
                    "poster": self.get_artwork_url(item["Id"]),
                    "fanart": self.get_artwork_url(item["Id"], "Primary"),
                    "genres": ",".join(item["Genres"]),
                    "progress": 0,
                    "rating": rating,
                    "stream_url": item["stream_url"] if "stream_url" in item else None,
                    'info_url': f"https://musicbrainz.org/artist/{provid}" if provid else "",
                })
            else:
                data.append({
                    "id": item["Id"],
                    "type": item["Type"],
                    "title": item["SeriesName"] if "SeriesName" in item else item["Name"],
                    "episode": item["Name"],
                    "tagline": item["Name"],
                    "flag": False,
                    "airdate": item["DateCreated"],
                    "runtime": int(item["RunTimeTicks"] / 10000000 / 60) if "RunTimeTicks" in item else None,
                    "studio": ",".join(o["Name"] for o in item["Studios"]) if "Studios" in item else None,
                    "release": dt.parse(item["PremiereDate"]).__format__("%d/%m/%Y") if "PremiereDate" in item else None,
                    "poster": self.get_artwork_url(item["Id"]),
                    "fanart": self.get_artwork_url(item["Id"], "Primary"),
                    "genres": ",".join(item["Genres"]) if "Genres" in item else None,
                    "progress": 0,
                    "rating": rating,
                    "info": item["info"] if "info" in item else None,
                    "stream_url": item["stream_url"] if "stream_url" in item else None,
                    'info_url': None,
                })

        attrs = {}
        attrs["last_search"] = self._last_search
        attrs["last_playlist"] = self._last_playlist
        attrs["playlists"] = json.dumps(PLAYLISTS)
        attrs['total_items'] = min(50, self._yamc["TotalRecordCount"])
        attrs["page"] = self._yamc_cur_page
        attrs["page_size"] = YAMC_PAGE_SIZE
        attrs['data'] = json.dumps(data)

        return attrs

    async def trigger_scan(self):
        await self.hass.async_add_executor_job(self.jf_client.jellyfin._post, "Library/Refresh")

    async def delete_item(self, id):
        await self.hass.async_add_executor_job(self.jf_client.jellyfin.items, f"/{id}", "DELETE")
        await self.update_data()

    async def search_item(self, search_term):
        self._yamc_cur_page = 1
        self._last_search = search_term
        await self.update_data()

    async def yamc_set_page(self, page):
        self._yamc_cur_page = page
        await self.update_data()

    async def yamc_set_playlist(self, playlist):
        self._last_search = ""
        self._last_playlist = playlist
        await self.update_data()

    def get_server_url(self) -> str:
        return self.jf_client.config.data["auth.server"]

    def get_auth_token(self) -> str:
        return self.jf_client.config.data["auth.token"]

    async def get_item(self, id):
        return await self.hass.async_add_executor_job(self.jf_client.jellyfin.get_item, id)

    async def get_items(self, query=None):
        response = await self.hass.async_add_executor_job(self.jf_client.jellyfin.users, "/Items", "GET", query)
        #_LOGGER.debug("get_items: %s | %s", str(query), str(response))
        return response["Items"]

    async def set_playstate(self, session_id, state, params):
        await self.hass.async_add_executor_job(self.jf_client.jellyfin.post_session, session_id, "Playing/%s" % state,  params)

    async def play_media(self, session_id, media_id):
        params = {
            "playCommand": "PlayNow",
            "itemIds": media_id
        }
        await self.hass.async_add_executor_job(self.jf_client.jellyfin.post_session, session_id, "Playing", params)

    async def view_media(self, session_id, media_id):
        item = await self.hass.async_add_executor_job(self.jf_client.jellyfin.get_item, media_id)
        _LOGGER.debug(f'view_media: {str(item)}')

        params = {
            "itemId": media_id,
            "itemType": item["Type"],
            "itemName": item["Name"]
        }
        await self.hass.async_add_executor_job(self.jf_client.jellyfin.post_session, session_id, "Viewing", params)

    async def get_artwork(self, media_id, type="Primary") -> Tuple[Optional[str], Optional[str]]:
        query = {
            "format": "PNG",
            "maxWidth": 500,
            "maxHeight": 500
        }
        image = await self.hass.async_add_executor_job(self.jf_client.jellyfin.items, "GET", "%s/Images/%s" % (media_id, type), query)
        if image is not None:
            return (image, "image/png")

        return (None, None)

    def get_artwork_url(self, media_id, type="Primary") -> str:
        return self.jf_client.jellyfin.artwork(media_id, type, 500)

    async def get_play_info(self, media_id, profile):
        return await self.hass.async_add_executor_job(self.jf_client.jellyfin.get_play_info, media_id, profile)

    async def get_stream_url(self, media_id, media_content_type) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        profile = {
            "Name": USER_APP_NAME,
            "MaxStreamingBitrate": 25000 * 1000,
            "MusicStreamingTranscodingBitrate": 1920000,
            "TimelineOffsetSeconds": 5,
            "TranscodingProfiles": [
                {
                    "Type": "Audio",
                    "Container": "mp3",
                    "Protocol": "http",
                    "AudioCodec": "mp3",
                    "MaxAudioChannels": "2",
                },
                {
                    "Type": "Video",
                    "Container": "mp4",
                    "Protocol": "http",
                    "AudioCodec": "aac,mp3,opus,flac,vorbis",
                    "VideoCodec": "h264,mpeg4,mpeg2video",
                    "MaxAudioChannels": "6",
                },
                {"Container": "jpeg", "Type": "Photo"},
            ],
            "DirectPlayProfiles": [
                {
                    "Type": "Audio",
                    "Container": "mp3",
                    "AudioCodec": "mp3"
                },
                {
                    "Type": "Audio",
                    "Container": "m4a,m4b",
                    "AudioCodec": "aac"
                },
                {
                    "Type": "Video",
                    "Container": "mp4,m4v",
                    "AudioCodec": "aac,mp3,opus,flac,vorbis",
                    "VideoCodec": "h264,mpeg4,mpeg2video",
                    "MaxAudioChannels": "6",
                },
            ],
            "ResponseProfiles": [],
            "ContainerProfiles": [],
            "CodecProfiles": [],
            "SubtitleProfiles": [
                {"Format": "srt", "Method": "External"},
                {"Format": "srt", "Method": "Embed"},
                {"Format": "ass", "Method": "External"},
                {"Format": "ass", "Method": "Embed"},
                {"Format": "sub", "Method": "Embed"},
                {"Format": "sub", "Method": "External"},
                {"Format": "ssa", "Method": "Embed"},
                {"Format": "ssa", "Method": "External"},
                {"Format": "smi", "Method": "Embed"},
                {"Format": "smi", "Method": "External"},
                # Jellyfin currently refuses to serve these subtitle types as external.
                {"Format": "pgssub", "Method": "Embed"},
                # {
                #    "Format": "pgssub",
                #    "Method": "External"
                # },
                {"Format": "dvdsub", "Method": "Embed"},
                # {
                #    "Format": "dvdsub",
                #    "Method": "External"
                # },
                {"Format": "pgs", "Method": "Embed"},
                # {
                #    "Format": "pgs",
                #    "Method": "External"
                # }
            ],
        }

        playback_info = await self.get_play_info(media_id, profile)
        _LOGGER.debug("playbackinfo: %s", str(playback_info))
        if playback_info is None or "MediaSources" not in playback_info:
            _LOGGER.error(f"No playback info for item id {media_id}")
            return (None, None, None)

        selected = None
        weight_selected = 0
        for media_source in playback_info["MediaSources"]:
            weight = (media_source.get("SupportsDirectStream") or 0) * 50000 + (
                media_source.get("Bitrate") or 0
            ) / 1000
            if weight > weight_selected:
                weight_selected = weight
                selected = media_source
        
        if selected is None:
            return (None, None, None)

        url = ""
        mimetype = "none/none"
        info = "Not playable"
        if selected["SupportsDirectStream"]:
            if media_content_type in ("Audio", "track"):
                mimetype = "audio/" + selected["Container"]
                url = self.get_server_url() + "/Audio/%s/stream?static=true&MediaSourceId=%s&api_key=%s" % (
                        media_id,
                        selected["Id"],
                        self.get_auth_token()
                    )
            else:
                mimetype = "video/" + selected["Container"]
                url = self.get_server_url() + "/Videos/%s/stream?static=true&MediaSourceId=%s&api_key=%s" % (
                        media_id,
                        selected["Id"],
                        self.get_auth_token()
                    )

        elif selected["SupportsTranscoding"]:
            url = self.get_server_url() + selected.get("TranscodingUrl")
            container = selected["TranscodingContainer"] if "TranscodingContainer" in selected else selected["Container"]
            if media_content_type in ("Audio", "track"):
                mimetype = "audio/" + container
            else:
                mimetype = "video/" + container
       
        if media_content_type in ("Audio", "track"):
            for stream in selected["MediaStreams"]:
                if stream["Type"] == "Audio":
                    info = f'{stream["Codec"]} {stream["SampleRate"]}Hz'
                    break
        else:
            for stream in selected["MediaStreams"]:
                if stream["Type"] == "Video":
                    info = f'{stream["Width"]}x{stream["Height"]} {stream["Codec"]}'
                    break

        _LOGGER.debug("stream info: %s - url: %s", info, url)
        return (url, mimetype, info)

    @property
    def api(self):
        """ Return the api. """
        return self.jf_client.jellyfin

    @property
    def devices(self) -> Mapping[str, JellyfinDevice]:
        """ Return devices dictionary. """
        return self._devices

    @property
    def is_available(self):
        return not self.is_stopping

    # Callbacks

    def add_new_devices_callback(self, callback):
        """Register as callback for when new devices are added. """
        self._new_devices_callbacks.append(callback)
        _LOGGER.debug('Added new devices callback to %s', callback)

    def _do_new_devices_callback(self, msg):
        """Call registered callback functions."""
        for callback in self._new_devices_callbacks:
            _LOGGER.debug('Devices callback %s', callback)
            self._event_loop.call_soon(callback, msg)

    def add_stale_devices_callback(self, callback):
        """Register as callback for when stale devices exist. """
        self._stale_devices_callbacks.append(callback)
        _LOGGER.debug('Added stale devices callback to %s', callback)

    def _do_stale_devices_callback(self, msg):
        """Call registered callback functions."""
        for callback in self._stale_devices_callbacks:
            _LOGGER.debug('Stale Devices callback %s', callback)
            self._event_loop.call_soon(callback, msg)

    def add_update_callback(self, callback, device):
        """Register as callback for when a matching device changes."""
        self._update_callbacks.append([callback, device])
        _LOGGER.debug('Added update callback to %s on %s', callback, device)

    def remove_update_callback(self, callback, device):
        """ Remove a registered update callback. """
        if [callback, device] in self._update_callbacks:
            self._update_callbacks.remove([callback, device])
            _LOGGER.debug('Removed update callback %s for %s',
                          callback, device)

    def _do_update_callback(self, msg):
        """Call registered callback functions."""
        for callback, device in self._update_callbacks:
            if device == msg:
                _LOGGER.debug('Update callback %s for device %s by %s',
                              callback, device, msg)
                self._event_loop.call_soon(callback, msg)
