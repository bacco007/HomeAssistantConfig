"""Support to interface with the Jellyfin API."""
import logging
from typing import Mapping, MutableMapping, Optional, Sequence, Iterable, List, Tuple, Union

from homeassistant.components.media_player import PLATFORM_SCHEMA, MediaPlayerEntity
from homeassistant.components.media_player.const import (
    MEDIA_TYPE_CHANNEL,
    MEDIA_TYPE_MOVIE,
    MEDIA_TYPE_MUSIC,
    MEDIA_TYPE_TVSHOW,
    SUPPORT_PLAY_MEDIA,
    SUPPORT_NEXT_TRACK,
    SUPPORT_PAUSE,
    SUPPORT_PLAY,
    SUPPORT_PREVIOUS_TRACK,
    SUPPORT_SEEK,
    SUPPORT_STOP,
    SUPPORT_BROWSE_MEDIA,
)
from homeassistant.const import (
    CONF_URL,
    DEVICE_DEFAULT_NAME,
    EVENT_HOMEASSISTANT_START,
    EVENT_HOMEASSISTANT_STOP,
    STATE_IDLE,
    STATE_OFF,
    STATE_PAUSED,
    STATE_PLAYING,
)
from homeassistant.core import HomeAssistant, callback
import homeassistant.util.dt as dt_util

from . import JellyfinClientManager, autolog
from .media_source import JellyfinSource, async_library_items

from .const import (
    DOMAIN,
    SIGNAL_STATE_UPDATED,
)
PLATFORM = "media_player"

_LOGGER = logging.getLogger(__name__)

MEDIA_TYPE_TRAILER = "trailer"
MEDIA_TYPE_GENERIC_VIDEO = "video"

DEFAULT_HOST = "localhost"
DEFAULT_PORT = 8096
DEFAULT_SSL_PORT = 8920
DEFAULT_SSL = False

SUPPORT_JELLYFIN = (
    SUPPORT_BROWSE_MEDIA
    | SUPPORT_PLAY_MEDIA
    | SUPPORT_PAUSE
    | SUPPORT_PREVIOUS_TRACK
    | SUPPORT_NEXT_TRACK
    | SUPPORT_STOP
    | SUPPORT_SEEK
    | SUPPORT_PLAY
)


async def async_setup_entry(hass: HomeAssistant, config_entry, async_add_entities):
    """Set up media players dynamically."""
  
    active_jellyfin_devices: List[JellyfinMediaPlayer] = {}
    inactive_jellyfin_devices: List[JellyfinMediaPlayer] = {}

    _jelly: JellyfinClientManager = hass.data[DOMAIN][config_entry.data.get(CONF_URL)]["manager"]
    hass.data[DOMAIN][_jelly.host][PLATFORM]["entities"] = []

    @callback
    def device_update_callback(data):
        """Handle devices which are added to Jellyfin."""
        new_devices = []
        active_devices = []
        for dev_id in _jelly.devices:
            active_devices.append(dev_id)
            if (
                dev_id not in active_jellyfin_devices
                and dev_id not in inactive_jellyfin_devices
            ):
                new = JellyfinMediaPlayer(_jelly, dev_id)
                active_jellyfin_devices[dev_id] = new
                new_devices.append(new)

            elif (
                dev_id in inactive_jellyfin_devices and _jelly.devices[dev_id].state != "Off"
            ):
                add = inactive_jellyfin_devices.pop(dev_id)
                active_jellyfin_devices[dev_id] = add
                _LOGGER.debug("Showing %s, item: %s", dev_id, add)
                add.set_available(True)

        if new_devices:
            _LOGGER.debug("Adding new devices: %s", new_devices)
            async_add_entities(new_devices, True)

    @callback
    def device_removal_callback(data):
        """Handle the removal of devices from Jellyfin."""
        if data in active_jellyfin_devices:
            rem = active_jellyfin_devices.pop(data)
            inactive_jellyfin_devices[data] = rem
            _LOGGER.debug("Inactive %s, item: %s", data, rem)
            rem.set_available(False)

    _jelly.add_new_devices_callback(device_update_callback)
    _jelly.add_stale_devices_callback(device_removal_callback)
    _jelly.update_device_list()

class JellyfinMediaPlayer(MediaPlayerEntity):
    """Representation of an Jellyfin device."""

    def __init__(self, jelly_cm: JellyfinClientManager, device_id):
        """Initialize the Jellyfin device."""
        _LOGGER.debug("New Jellyfin Device initialized with ID: %s", device_id)
        self.jelly_cm = jelly_cm
        self.device_id = device_id
        self.device = self.jelly_cm.devices[self.device_id]

        self._available = True

        self.media_status_last_position = None
        self.media_status_received = None

        self._attr_entity_registry_enabled_default = False

    async def async_added_to_hass(self):
        self.hass.data[DOMAIN][self.jelly_cm.host][PLATFORM]["entities"].append(self)
        self.jelly_cm.add_update_callback(self.async_update_callback, self.device_id)

    async def async_will_remove_from_hass(self):
        self.hass.data[DOMAIN][self.jelly_cm.host][PLATFORM]["entities"].remove(self)
        self.jelly_cm.remove_update_callback(self.async_update_callback, self.device_id)

    @callback
    def async_update_callback(self, msg):
        """Handle device updates."""
        # Check if we should update progress
        if self.device.media_position:
            if self.device.media_position != self.media_status_last_position:
                self.media_status_last_position = self.device.media_position
                self.media_status_received = dt_util.utcnow()
        elif not self.device.is_nowplaying:
            # No position, but we have an old value and are still playing
            self.media_status_last_position = None
            self.media_status_received = None

        self.async_write_ha_state()

    async def async_get_browse_image(
        self,
        media_content_type: str,
        media_content_id: str,
        media_image_id: Optional[str] = None,
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        fetch internally accessible image for media browser.
        """
        autolog("<<<")

        if media_content_id:
            return self.device.get_artwork(media_content_id)

        return (None, None)

    async def async_browse_media(self, media_content_type=None, media_content_id=None):
        """Implement the media source."""
        _LOGGER.debug("-- async_browse_media: %s / %s", media_content_type, media_content_id)
        return await async_library_items(self.jelly_cm, media_content_type, media_content_id)


    @property
    def available(self):
        """Return True if entity is available."""
        return self._available

    def set_available(self, value):
        """Set available property."""
        self._available = value

    @property
    def unique_id(self):
        """Return the id of this jellyfin client."""
        return self.device_id

    @property
    def supports_remote_control(self):
        """Return control ability."""
        return self.device.supports_remote_control

    @property
    def name(self):
        """Return the name of the device."""
        return f"Jellyfin {self.device.name}" or DEVICE_DEFAULT_NAME

    @property
    def should_poll(self):
        """Return True if entity has to be polled for state."""
        return False

    @property
    def state(self):
        """Return the state of the device."""
        state = self.device.state
        if state == "Paused":
            return STATE_PAUSED
        if state == "Playing":
            return STATE_PLAYING
        if state == "Idle":
            return STATE_IDLE
        if state == "Off":
            return STATE_OFF

    @property
    def app_name(self):
        """Return current user as app_name."""
        # Ideally the media_player object would have a user property.
        return self.device.username

    @property
    def media_content_id(self):
        """Content ID of current playing media."""
        return self.device.media_id

    @property
    def media_content_type(self):
        """Content type of current playing media."""
        media_type = self.device.media_type
        if media_type == "Episode":
            return MEDIA_TYPE_TVSHOW
        if media_type == "Movie":
            return MEDIA_TYPE_MOVIE
        if media_type == "Trailer":
            return MEDIA_TYPE_TRAILER
        if media_type == "Music":
            return MEDIA_TYPE_MUSIC
        if media_type == "Video":
            return MEDIA_TYPE_GENERIC_VIDEO
        if media_type == "Audio":
            return MEDIA_TYPE_MUSIC
        if media_type == "TvChannel":
            return MEDIA_TYPE_CHANNEL
        return None

    @property
    def media_duration(self):
        """Return the duration of current playing media in seconds."""
        return self.device.media_runtime

    @property
    def media_position(self):
        """Return the position of current playing media in seconds."""
        return self.media_status_last_position

    @property
    def media_position_updated_at(self):
        """
        When was the position of the current playing media valid.

        Returns value from homeassistant.util.dt.utcnow().
        """
        return self.media_status_received

    @property
    def media_image_url(self):
        """Return the image URL of current playing media."""
        return self.device.media_image_url

    @property
    def media_title(self):
        """Return the title of current playing media."""
        return self.device.media_title

    @property
    def media_season(self):
        """Season of current playing media (TV Show only)."""
        return self.device.media_season

    @property
    def media_series_title(self):
        """Return the title of the series of current playing media (TV)."""
        return self.device.media_series_title

    @property
    def media_episode(self):
        """Return the episode of current playing media (TV only)."""
        return self.device.media_episode

    @property
    def media_album_name(self):
        """Return the album name of current playing media (Music only)."""
        return self.device.media_album_name

    @property
    def media_artist(self):
        """Return the artist of current playing media (Music track only)."""
        return self.device.media_artist

    @property
    def media_album_artist(self):
        """Return the album artist of current playing media (Music only)."""
        return self.device.media_album_artist

    @property
    def supported_features(self):
        """Flag media player features that are supported."""
        if self.supports_remote_control:
            return SUPPORT_JELLYFIN
        return 0

    async def async_media_play(self):
        """Play media."""
        await self.device.media_play()

    async def async_media_pause(self):
        """Pause the media player."""
        await self.device.media_pause()

    async def async_media_stop(self):
        """Stop the media player."""
        await self.device.media_stop()

    async def async_media_next_track(self):
        """Send next track command."""
        await self.device.media_next()

    async def async_media_previous_track(self):
        """Send next track command."""
        await self.device.media_previous()

    async def async_media_seek(self, position):
        """Send seek command."""
        await self.device.media_seek(position)

    async def async_play_media(self, media_type: str, media_id: str, **kwargs) -> None:
        _LOGGER.debug("Play media requested: %s / %s", media_type, media_id)
        _, real_media_id = JellyfinSource.parse_mediasource_identifier(media_id)
        await self.device.play_media(real_media_id)

    async def async_browse_item(self, id):
        _LOGGER.debug(f"async_browse_item triggered {id}")
        _, real_media_id = JellyfinSource.parse_mediasource_identifier(id)
        await self.device.browse_item(real_media_id)
