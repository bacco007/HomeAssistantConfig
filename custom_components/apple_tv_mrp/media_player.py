"""Support for Apple TV media player."""
import logging
import asyncio

from homeassistant.components.media_player import MediaPlayerDevice
from homeassistant.components.media_player.const import (
    MEDIA_TYPE_MUSIC,
    MEDIA_TYPE_TVSHOW,
    MEDIA_TYPE_VIDEO,
    SUPPORT_NEXT_TRACK,
    SUPPORT_PAUSE,
    SUPPORT_PLAY,
    SUPPORT_PLAY_MEDIA,
    SUPPORT_PREVIOUS_TRACK,
    SUPPORT_SEEK,
    SUPPORT_STOP,
    SUPPORT_TURN_OFF,
    SUPPORT_TURN_ON,
)
from homeassistant.const import (
    CONF_HOST,
    CONF_NAME,
    EVENT_HOMEASSISTANT_STOP,
    STATE_IDLE,
    STATE_OFF,
    STATE_PAUSED,
    STATE_PLAYING,
    STATE_STANDBY,
)
from homeassistant.core import callback
import homeassistant.util.dt as dt_util

from . import ATTR_ATV, ATTR_POWER, DATA_APPLE_TV, DATA_ENTITIES

_LOGGER = logging.getLogger(__name__)

SUPPORT_APPLE_TV = (
    SUPPORT_TURN_ON
    | SUPPORT_TURN_OFF
    | SUPPORT_PLAY_MEDIA
    | SUPPORT_PAUSE
    | SUPPORT_PLAY
    | SUPPORT_SEEK
    | SUPPORT_STOP
    | SUPPORT_NEXT_TRACK
    | SUPPORT_PREVIOUS_TRACK
)


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the Apple TV platform."""
    if not discovery_info:
        return

    # Manage entity cache for service handler
    if DATA_ENTITIES not in hass.data:
        hass.data[DATA_ENTITIES] = []

    name = discovery_info[CONF_NAME]
    host = discovery_info[CONF_HOST]
    atv = hass.data[DATA_APPLE_TV][host][ATTR_ATV]
    power = hass.data[DATA_APPLE_TV][host][ATTR_POWER]
    entity = AppleTvDevice(atv, name, power, host, hass.loop)

    @callback
    def on_hass_stop(event):
        """Stop push updates when hass stops."""
        atv.push_updater.stop()

    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, on_hass_stop)

    if entity not in hass.data[DATA_ENTITIES]:
        hass.data[DATA_ENTITIES].append(entity)

    async_add_entities([entity])


class AppleTvDevice(MediaPlayerDevice):
    """Representation of an Apple TV device."""

    def __init__(self, atv, name, power, host, loop):
        """Initialize the Apple TV device."""
        self.atv = atv
        self._name = name
        self._playing = None
        self._power = power
        self._power.listeners.append(self)
        self._host = host
        self._loop = loop
        self.atv.push_updater.listener = self

        asyncio.ensure_future(self.update_playing(), loop=self._loop)

    async def update_playing(self):
        self._playing = await self.atv.metadata.playing()

    async def async_added_to_hass(self):
        """Handle when an entity is about to be added to Home Assistant."""
        self._power.init()

    @property
    def name(self):
        """Return the name of the device."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID."""
        return f"apple_tv_{self._host}"

    @property
    def should_poll(self):
        """No polling needed."""
        return False

    @property
    def state(self):
        """Return the state of the device."""
        if not self._power.turned_on:
            return STATE_OFF

        if self._playing:
            from .pyatv_mrp import const

            state = self._playing.play_state
            if state in (
                const.PLAY_STATE_IDLE,
                const.PLAY_STATE_NO_MEDIA,
                const.PLAY_STATE_LOADING,
            ):
                return STATE_IDLE
            if state == const.PLAY_STATE_PLAYING:
                return STATE_PLAYING
            if state in (
                const.PLAY_STATE_PAUSED,
                const.PLAY_STATE_FAST_FORWARD,
                const.PLAY_STATE_FAST_BACKWARD,
            ):
                # Catch fast forward/backward here so "play" is default action
                return STATE_PAUSED
            return STATE_STANDBY  # Bad or unknown state?

    @callback
    def playstatus_update(self, updater, playing):
        """Print what is currently playing when it changes."""
        self._playing = playing
        self.async_schedule_update_ha_state()

    @callback
    def playstatus_error(self, updater, exception):
        """Inform about an error and restart push updates."""
        _LOGGER.warning("A %s error occurred: %s", exception.__class__, exception)

        # This will wait 10 seconds before restarting push updates. If the
        # connection continues to fail, it will flood the log (every 10
        # seconds) until it succeeds. A better approach should probably be
        # implemented here later.
        updater.start(initial_delay=10)
        self._playing = None
        self.async_schedule_update_ha_state()

    @property
    def media_content_type(self):
        """Content type of current playing media."""
        if self._playing:
            from .pyatv_mrp import const

            media_type = self._playing.media_type
            if media_type == const.MEDIA_TYPE_VIDEO:
                return MEDIA_TYPE_VIDEO
            if media_type == const.MEDIA_TYPE_MUSIC:
                return MEDIA_TYPE_MUSIC
            if media_type == const.MEDIA_TYPE_TV:
                return MEDIA_TYPE_TVSHOW

    @property
    def media_duration(self):
        """Duration of current playing media in seconds."""
        if self._playing:
            return self._playing.total_time

    @property
    def media_position(self):
        """Position of current playing media in seconds."""
        if self._playing:
            return self._playing.position

    @property
    def media_position_updated_at(self):
        """Last valid time of media position."""
        state = self.state
        if state in (STATE_PLAYING, STATE_PAUSED):
            return dt_util.utcnow()

    async def async_play_media(self, media_type, media_id, **kwargs):
        """Send the play_media command to the media player."""
        await self.atv.airplay.play_url(media_id)

    @property
    def media_image_hash(self):
        """Hash value for media image."""
        state = self.state
        if self._playing and state not in [STATE_OFF, STATE_IDLE]:
            return self._playing.hash

    async def async_get_media_image(self):
        """Fetch media image of current playing image."""
        state = self.state
        if self._playing and state not in [STATE_OFF, STATE_IDLE]:
            return (await self.atv.metadata.artwork()), "image/png"

        return None, None

    @property
    def media_title(self):
        """Title of current playing media."""
        if self._playing:
            if self.state == STATE_IDLE:
                return "Nothing playing"
            title = self._playing.title
            return title if title else "No title"

        return "Establishing a connection to {0}...".format(self._name)

    @property
    def supported_features(self):
        """Flag media player features that are supported."""
        return SUPPORT_APPLE_TV

    async def async_turn_on(self):
        """Turn the media player on."""
        self._power.set_power_on(True)

        await update_playing()

    async def async_turn_off(self):
        """Turn the media player off."""
        self._playing = None
        self._power.set_power_on(False)

    def async_media_play_pause(self):
        """Pause media on media player.

        This method must be run in the event loop and returns a coroutine.
        """
        if self._playing:
            state = self.state
            if state == STATE_PAUSED:
                return self.atv.remote_control.play()
            if state == STATE_PLAYING:
                return self.atv.remote_control.pause()

    def async_media_play(self):
        """Play media.

        This method must be run in the event loop and returns a coroutine.
        """
        if self._playing:
            return self.atv.remote_control.play()

    def async_media_stop(self):
        """Stop the media player.

        This method must be run in the event loop and returns a coroutine.
        """
        if self._playing:
            return self.atv.remote_control.stop()

    def async_media_pause(self):
        """Pause the media player.

        This method must be run in the event loop and returns a coroutine.
        """
        if self._playing:
            return self.atv.remote_control.pause()

    def async_media_next_track(self):
        """Send next track command.

        This method must be run in the event loop and returns a coroutine.
        """
        if self._playing:
            return self.atv.remote_control.next()

    def async_media_previous_track(self):
        """Send previous track command.

        This method must be run in the event loop and returns a coroutine.
        """
        if self._playing:
            return self.atv.remote_control.previous()

    def async_media_seek(self, position):
        """Send seek command.

        This method must be run in the event loop and returns a coroutine.
        """
        if self._playing:
            return self.atv.remote_control.set_position(position)