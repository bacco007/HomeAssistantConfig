"""Custom actions (previously known as services) for the Music Assistant integration."""

from __future__ import annotations

from typing import TYPE_CHECKING, cast

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
    callback,
)
from homeassistant.exceptions import HomeAssistantError
from music_assistant_client.helpers import searchresults_as_compact_dict
from music_assistant_models.enums import MediaType

from .const import DOMAIN

if TYPE_CHECKING:
    from music_assistant_client import MusicAssistantClient

    from . import MusicAssistantConfigEntry

SERVICE_SEARCH = "search"
SERVICE_GET_QUEUE = "get_queue"
SERVICE_GET_LIBRARY = "get_library"
ATTR_MEDIA_TYPE = "media_type"
ATTR_SEARCH_NAME = "name"
ATTR_SEARCH_ARTIST = "artist"
ATTR_SEARCH_ALBUM = "album"
ATTR_LIMIT = "limit"
ATTR_LIBRARY_ONLY = "library_only"
ATTR_QUEUE_ID = "queue_id"


@callback
def get_music_assistant_client(hass: HomeAssistant) -> MusicAssistantClient:
    """Get the (first) Music Assistant client from the (loaded) config entries."""
    entry: MusicAssistantConfigEntry
    for entry in hass.config_entries.async_entries(DOMAIN, False, False):
        if entry.state != ConfigEntryState.LOADED:
            continue
        return entry.runtime_data.mass
    raise HomeAssistantError("Music Assistant is not loaded")


@callback
def register_actions(hass: HomeAssistant) -> None:
    """Register custom actions."""
    register_search_action(hass)
    register_get_queue_action(hass)
    register_get_library_action(hass)


def register_search_action(hass: HomeAssistant) -> None:
    """Register search action."""

    async def handle_search(call: ServiceCall) -> ServiceResponse:
        """Handle queue_command action."""
        mass = get_music_assistant_client(hass)
        search_name = call.data[ATTR_SEARCH_NAME]
        search_artist = call.data.get(ATTR_SEARCH_ARTIST)
        search_album = call.data.get(ATTR_SEARCH_ALBUM)
        if search_album and search_artist:
            search_name = f"{search_artist} - {search_album} - {search_name}"
        elif search_album:
            search_name = f"{search_album} - {search_name}"
        elif search_artist:
            search_name = f"{search_artist} - {search_name}"
        search_results = await mass.music.search(
            search_query=search_name,
            media_types=call.data.get(ATTR_MEDIA_TYPE, MediaType.ALL),
            limit=call.data[ATTR_LIMIT],
            library_only=call.data[ATTR_LIBRARY_ONLY],
        )
        # return limited result to prevent it being too verbose
        return cast(ServiceResponse, searchresults_as_compact_dict(search_results))

    hass.services.async_register(
        DOMAIN,
        SERVICE_SEARCH,
        handle_search,
        schema=vol.Schema(
            {
                vol.Required(ATTR_SEARCH_NAME): cv.string,
                vol.Optional(ATTR_MEDIA_TYPE): vol.All(
                    cv.ensure_list, [vol.Coerce(MediaType)]
                ),
                vol.Optional(ATTR_SEARCH_ARTIST): cv.string,
                vol.Optional(ATTR_SEARCH_ALBUM): cv.string,
                vol.Optional(ATTR_LIMIT, default=5): vol.Coerce(int),
                vol.Optional(ATTR_LIBRARY_ONLY, default=False): cv.boolean,
            }
        ),
        supports_response=SupportsResponse.ONLY,
    )


def register_get_queue_action(hass: HomeAssistant) -> None:
    """Register get_queue action."""

    async def handle_get_queue(call: ServiceCall) -> ServiceResponse:
        """Handle get_queue action."""
        mass = get_music_assistant_client(hass)
        queue_id = call.data.get(ATTR_QUEUE_ID)
        if queue_id and (queue := mass.player_queues.get(queue_id)):
            return cast(ServiceResponse, queue.to_dict())
        raise HomeAssistantError(f"Queue with ID {queue_id} not found")

    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_QUEUE,
        handle_get_queue,
        schema=vol.Schema(
            {
                vol.Required(ATTR_QUEUE_ID): cv.string,
            }
        ),
        supports_response=SupportsResponse.ONLY,
    )


def register_get_library_action(hass: HomeAssistant) -> None:
    """Register get_library action."""

    async def handle_get_library(call: ServiceCall) -> ServiceResponse:
        """Handle get_library action."""
        mass = get_music_assistant_client(hass)
        media_type = call.data[ATTR_MEDIA_TYPE]
        base_params = {
            "favorite": call.data.get("favorite"),
            "search": call.data.get("search"),
            "limit": call.data.get("limit"),
            "offset": call.data.get("offset"),
            "order_by": call.data.get("order_by"),
        }
        if media_type == MediaType.ALBUM:
            library_result = await mass.music.get_library_albums(
                **base_params,
                album_types=call.data.get("album_type"),
            )
        elif media_type == MediaType.ARTIST:
            library_result = await mass.music.get_library_artists(
                **base_params,
                album_artists_only=call.data.get("album_artists_only"),
            )
        elif media_type == MediaType.TRACK:
            library_result = await mass.music.get_library_tracks(
                **base_params,
            )
        elif media_type == MediaType.RADIO:
            library_result = await mass.music.get_library_radios(
                **base_params,
            )
        elif media_type == MediaType.PLAYLIST:
            library_result = await mass.music.get_library_playlists(
                **base_params,
            )
        else:
            raise HomeAssistantError(f"Unsupported media type {media_type}")
        # result must be a dict so we return the media item (+s) as key
        result = {f"{media_type.value}s": [item.to_dict() for item in library_result]}
        return cast(ServiceResponse, result)

    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_LIBRARY,
        handle_get_library,
        schema=vol.Schema(
            {
                vol.Required(ATTR_MEDIA_TYPE): vol.Coerce(MediaType),
                vol.Optional("favorite"): cv.boolean,
                vol.Optional("search"): cv.string,
                vol.Optional("limit"): cv.positive_int,
                vol.Optional("offset"): int,
                vol.Optional("order_by"): cv.string,
                vol.Optional("album_types"): cv.ensure_list,
            }
        ),
        supports_response=SupportsResponse.ONLY,
    )
