from __future__ import annotations

import logging
from typing import Tuple

from homeassistant.components.media_source.error import MediaSourceError, Unresolvable
from homeassistant.components.media_source.models import (
    BrowseMediaSource,
    MediaSource,
    MediaSourceItem,
    PlayMedia,
)
from homeassistant.core import HomeAssistant, callback

from homeassistant.components.media_player import BrowseError, BrowseMedia
from homeassistant.components.media_source.const import MEDIA_MIME_TYPES, URI_SCHEME

from homeassistant.const import (  # pylint: disable=import-error
    CONF_URL,
)
from homeassistant.components.media_player.const import (
    MEDIA_CLASS_ALBUM,
    MEDIA_CLASS_ARTIST,
    MEDIA_CLASS_CHANNEL,
    MEDIA_CLASS_DIRECTORY,
    MEDIA_CLASS_EPISODE,
    MEDIA_CLASS_MOVIE,
    MEDIA_CLASS_MUSIC,
    MEDIA_CLASS_PLAYLIST,
    MEDIA_CLASS_SEASON,
    MEDIA_CLASS_TRACK,
    MEDIA_CLASS_TV_SHOW,
    MEDIA_TYPE_ALBUM,
    MEDIA_TYPE_ARTIST,
    MEDIA_TYPE_CHANNEL,
    MEDIA_TYPE_EPISODE,
    MEDIA_TYPE_MOVIE,
    MEDIA_TYPE_PLAYLIST,
    MEDIA_TYPE_SEASON,
    MEDIA_TYPE_TRACK,
    MEDIA_TYPE_TVSHOW,
)

from . import JellyfinClientManager, JellyfinDevice, autolog

from .const import (
    DOMAIN,
    USER_APP_NAME,
)

PLAYABLE_MEDIA_TYPES = [
    MEDIA_TYPE_ALBUM,
    MEDIA_TYPE_ARTIST,
    MEDIA_TYPE_TRACK,
]

CONTAINER_TYPES_SPECIFIC_MEDIA_CLASS = {
    MEDIA_TYPE_ALBUM: MEDIA_CLASS_ALBUM,
    MEDIA_TYPE_ARTIST: MEDIA_CLASS_ARTIST,
    MEDIA_TYPE_PLAYLIST: MEDIA_CLASS_PLAYLIST,
    MEDIA_TYPE_SEASON: MEDIA_CLASS_SEASON,
    MEDIA_TYPE_TVSHOW: MEDIA_CLASS_TV_SHOW,
}

CHILD_TYPE_MEDIA_CLASS = {
    MEDIA_TYPE_SEASON: MEDIA_CLASS_SEASON,
    MEDIA_TYPE_ALBUM: MEDIA_CLASS_ALBUM,
    MEDIA_TYPE_ARTIST: MEDIA_CLASS_ARTIST,
    MEDIA_TYPE_MOVIE: MEDIA_CLASS_MOVIE,
    MEDIA_TYPE_PLAYLIST: MEDIA_CLASS_PLAYLIST,
    MEDIA_TYPE_TRACK: MEDIA_CLASS_TRACK,
    MEDIA_TYPE_TVSHOW: MEDIA_CLASS_TV_SHOW,
    MEDIA_TYPE_CHANNEL: MEDIA_CLASS_CHANNEL,
    MEDIA_TYPE_EPISODE: MEDIA_CLASS_EPISODE,
}

IDENTIFIER_SPLIT = "~~"

_LOGGER = logging.getLogger(__name__)

class UnknownMediaType(BrowseError):
    """Unknown media type."""

async def async_get_media_source(hass: HomeAssistant):
    """Set up Jellyfin media source."""
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    jelly_cm: JellyfinClientManager = hass.data[DOMAIN][entry.data[CONF_URL]]["manager"] if "manager" in hass.data[DOMAIN][entry.data[CONF_URL]] else None
    return JellyfinSource(hass, jelly_cm)

class JellyfinSource(MediaSource):
    """Media source for Jellyfin"""

    @staticmethod
    def parse_mediasource_identifier(identifier: str):
        prefix = f"{URI_SCHEME}{DOMAIN}/"
        text = identifier
        if identifier.startswith(prefix):
            text = identifier[len(prefix):]
        if IDENTIFIER_SPLIT in text:
            return text.split(IDENTIFIER_SPLIT, 2)

        return "", text

    def __init__(self, hass: HomeAssistant, manager: JellyfinClientManager):
        """Initialize Netatmo source."""
        super().__init__(DOMAIN)
        self.hass = hass
        self.jelly_cm = manager

    async def async_resolve_media(self, item: MediaSourceItem) -> PlayMedia:
        """Resolve a media item to a playable item."""
        autolog("<<<")

        if not item or not item.identifier:
            return None

        media_content_type, media_content_id = self.parse_mediasource_identifier(item.identifier)
        t = await self.jelly_cm.get_stream_url(media_content_id, media_content_type)
        return PlayMedia(t[0], t[1])

    async def async_browse_media(
        self, item: MediaSourceItem, media_types: Tuple[str] = MEDIA_MIME_TYPES
    ) -> BrowseMediaSource:
        """Browse media."""
        autolog("<<<")

        media_content_type, media_content_id = async_parse_identifier(item)
        return await async_library_items(self.jelly_cm, media_content_type, media_content_id, canPlayList=False)

@callback
def async_parse_identifier(
    item: MediaSourceItem,
) -> tuple[str | None, str | None]:
        """Parse identifier."""
        if not item.identifier:
            # Empty source_dir_id and location
            return None, None

        return item.identifier, item.identifier

def Type2Mediatype(type):
    switcher = {
        "Movie": MEDIA_TYPE_MOVIE,
        "Series": MEDIA_TYPE_TVSHOW,
        "Season": MEDIA_TYPE_SEASON,
        "Episode": MEDIA_TYPE_EPISODE,
        "Music": MEDIA_TYPE_ALBUM,
        "Audio": MEDIA_TYPE_TRACK,
        "BoxSet": MEDIA_CLASS_DIRECTORY,
        "Folder": MEDIA_CLASS_DIRECTORY,
        "CollectionFolder": MEDIA_CLASS_DIRECTORY,
        "Playlist": MEDIA_CLASS_DIRECTORY,
        "PlaylistsFolder": MEDIA_CLASS_DIRECTORY,
        "MusicArtist": MEDIA_TYPE_ARTIST,
        "MusicAlbum": MEDIA_TYPE_ALBUM,
    }
    return switcher[type]

def Type2Mimetype(type):
    switcher = {
        "Movie": "video/mp4",
        "Series": MEDIA_TYPE_TVSHOW,
        "Season": MEDIA_TYPE_SEASON,
        "Episode": "video/mp4",
        "Music": MEDIA_TYPE_ALBUM,
        "Audio": "audio/mp3",
        "BoxSet": MEDIA_CLASS_DIRECTORY,
        "Folder": MEDIA_CLASS_DIRECTORY,
        "CollectionFolder": MEDIA_CLASS_DIRECTORY,
        "Playlist": MEDIA_CLASS_DIRECTORY,
        "PlaylistsFolder": MEDIA_CLASS_DIRECTORY,
        "MusicArtist": MEDIA_TYPE_ARTIST,
        "MusicAlbum": MEDIA_TYPE_ALBUM,
    }
    return switcher[type]

def Type2Mediaclass(type):
    switcher = {
        "Movie": MEDIA_CLASS_MOVIE,
        "Series": MEDIA_CLASS_TV_SHOW,
        "Season": MEDIA_CLASS_SEASON,
        "Episode": MEDIA_CLASS_EPISODE,
        "Music": MEDIA_CLASS_DIRECTORY,
        "BoxSet": MEDIA_CLASS_DIRECTORY,
        "Folder": MEDIA_CLASS_DIRECTORY,
        "CollectionFolder": MEDIA_CLASS_DIRECTORY,
        "Playlist": MEDIA_CLASS_DIRECTORY,
        "PlaylistsFolder": MEDIA_CLASS_DIRECTORY,
        "MusicArtist": MEDIA_CLASS_ARTIST,
        "MusicAlbum": MEDIA_CLASS_ALBUM,
        "Audio": MEDIA_CLASS_TRACK,
    }
    return switcher[type]

def IsPlayable(type, canPlayList):
    switcher = {
        "Movie": True,
        "Series": canPlayList,
        "Season": canPlayList,
        "Episode": True,
        "Music": False,
        "BoxSet": canPlayList,
        "Folder": False,
        "CollectionFolder": False,
        "Playlist": canPlayList,
        "PlaylistsFolder": False,
        "MusicArtist": canPlayList,
        "MusicAlbum": canPlayList,
        "Audio": True,
    }
    return switcher[type]

async def async_library_items(jelly_cm: JellyfinClientManager, 
            media_content_type_in=None, 
            media_content_id_in=None,
            canPlayList=True
        ) -> BrowseMediaSource:
    """
    Create response payload to describe contents of a specific library.

    Used by async_browse_media.
    """
    _LOGGER.debug(f'>> async_library_items: {media_content_id_in} / {canPlayList}')

    library_info = None
    query = None

    if (media_content_type_in is None):
        media_content_type = None
        media_content_id = None
    else:
        media_content_type, media_content_id = JellyfinSource.parse_mediasource_identifier(media_content_id_in)
    _LOGGER.debug(f'-- async_library_items: {media_content_type} / {media_content_id}')

    if media_content_type in [None, "library"]:
        library_info = BrowseMediaSource(
            domain=DOMAIN,
            identifier=f'library{IDENTIFIER_SPLIT}library',
            media_class=MEDIA_CLASS_DIRECTORY,
            media_content_type="library",
            title="Media Library",
            can_play=False,
            can_expand=True,
            children=[],
        )
    elif media_content_type in [MEDIA_CLASS_DIRECTORY, MEDIA_TYPE_ARTIST, MEDIA_TYPE_ALBUM, MEDIA_TYPE_PLAYLIST, MEDIA_TYPE_TVSHOW, MEDIA_TYPE_SEASON]:
        query = {
            "ParentId": media_content_id,
            "sortBy": "SortName",
            "sortOrder": "Ascending"
        }

        parent_item = await jelly_cm.get_item(media_content_id)
        library_info = BrowseMediaSource(
            domain=DOMAIN,
            identifier=f'{media_content_type}{IDENTIFIER_SPLIT}{media_content_id}',
            media_class=media_content_type,
            media_content_type=media_content_type,
            title=parent_item["Name"],
            can_play=IsPlayable(parent_item["Type"], canPlayList),
            can_expand=True,
            thumbnail=jelly_cm.get_artwork_url(media_content_id),
            children=[],
        )
    else:
        query = {
            "Id": media_content_id
        }
        library_info = BrowseMediaSource(
            domain=DOMAIN,
            identifier=f'{media_content_type}{IDENTIFIER_SPLIT}{media_content_id}',
            media_class=MEDIA_CLASS_DIRECTORY,
            media_content_type=media_content_type,
            title="",
            can_play=True,
            can_expand=False,
            thumbnail=jelly_cm.get_artwork_url(media_content_id),
            children=[],
        )
    _LOGGER.debug(f'-- async_library_items: 1')

    items = await jelly_cm.get_items(query)
    for item in items:
        if media_content_type in [None, "library", MEDIA_CLASS_DIRECTORY, MEDIA_TYPE_ARTIST, MEDIA_TYPE_ALBUM, MEDIA_TYPE_PLAYLIST, MEDIA_TYPE_TVSHOW, MEDIA_TYPE_SEASON]:
            if item["IsFolder"]:
                library_info.children_media_class = MEDIA_CLASS_DIRECTORY
                library_info.children.append(BrowseMediaSource(
                    domain=DOMAIN,
                    identifier=f'{Type2Mediatype(item["Type"])}{IDENTIFIER_SPLIT}{item["Id"]}',
                    media_class=Type2Mediaclass(item["Type"]),
                    media_content_type=Type2Mimetype(item["Type"]),
                    title=item["Name"],
                    can_play=IsPlayable(item["Type"], canPlayList),
                    can_expand=True,
                    children=[],
                    thumbnail=jelly_cm.get_artwork_url(item["Id"])
                ))
            else:
                library_info.children_media_class = Type2Mediaclass(item["Type"])
                library_info.children.append(BrowseMediaSource(
                    domain=DOMAIN,
                    identifier=f'{Type2Mediatype(item["Type"])}{IDENTIFIER_SPLIT}{item["Id"]}',
                    media_class=Type2Mediaclass(item["Type"]),
                    media_content_type=Type2Mimetype(item["Type"]),
                    title=item["Name"],
                    can_play=IsPlayable(item["Type"], canPlayList),
                    can_expand=False,
                    children=[],
                    thumbnail=jelly_cm.get_artwork_url(item["Id"])
                ))
        else:
            library_info.domain=DOMAIN
            library_info.identifier=f'{Type2Mediatype(item["Type"])}{IDENTIFIER_SPLIT}{item["Id"]}',
            library_info.title = item["Name"]
            library_info.media_content_type = Type2Mimetype(item["Type"])
            library_info.media_class = Type2Mediaclass(item["Type"])
            library_info.can_expand = False
            library_info.can_play=IsPlayable(item["Type"], canPlayList),
            break

    _LOGGER.debug(f'<< async_library_items {library_info.as_dict()}')
    return library_info

