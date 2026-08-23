"""Service handlers for Armadarr."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant, ServiceCall


class ArmadarrServiceError(Exception):
    """Base class for Armadarr service exceptions."""


# Which app types can service each kind of call. Services are registered once
# per domain, so any of them can be called with any entry_id regardless of the
# app type it was registered for.
SERIES_APPS = ["Sonarr"]
MOVIE_APPS = ["Radarr", "Whisparr"]
ARTIST_APPS = ["Lidarr"]
AUTHOR_APPS = ["Readarr"]
MEDIA_APPS = ["Sonarr", "Radarr", "Lidarr", "Readarr", "Whisparr"]
# Bazarr and Dispatcharr expose no command component.
COMMAND_APPS = ["Sonarr", "Radarr", "Lidarr", "Readarr", "Whisparr", "Prowlarr"]
INDEXER_APPS = ["Prowlarr"]
DISPATCHARR_APPS = ["Dispatcharr"]


def _validate_app_type(entry: Any, app_types: list[str] | None) -> str:
    """Return the entry's app type, or raise if this service cannot serve it."""
    app_type = str(entry.data["app_type"])
    if app_types is not None and app_type not in app_types:
        msg = (
            f"This service supports {', '.join(app_types)}, "
            f"but entry {entry.entry_id} is a {app_type} instance"
        )
        raise ArmadarrServiceError(msg)
    return app_type


def _get_entry(hass: HomeAssistant, entry_id: str) -> Any:
    """Return the config entry for ``entry_id``, or raise."""
    entry = hass.config_entries.async_get_entry(entry_id)
    if not entry:
        msg = f"Entry {entry_id} not found"
        raise ArmadarrServiceError(msg)
    return entry


async def async_get_client(
    hass: HomeAssistant, entry_id: str, app_types: list[str] | None = None
) -> Any:
    """
    Get client for entry_id, rejecting app types this service cannot serve.

    Without ``app_types`` any entry is accepted. With it, a mismatched entry
    raises ArmadarrServiceError rather than letting the call reach pyarr and
    fail with AttributeError on a component that app does not have.
    """
    entry = _get_entry(hass, entry_id)
    _validate_app_type(entry, app_types)
    return entry.runtime_data.client


async def async_handle_system_task(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle system task service call."""
    entry_id = call.data["entry_id"]
    task = str(call.data["task"])
    client = await async_get_client(hass, entry_id, COMMAND_APPS)

    if task.isdigit():
        # It's a task ID, trigger via ExecuteStoredTask command
        await client.command.execute(name="ExecuteStoredTask", taskId=int(task))
    else:
        # It's a command name, use the command endpoint
        await client.command.execute(name=task)


async def async_handle_search_missing(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle search missing service call."""
    entry_id = call.data["entry_id"]
    entry = _get_entry(hass, entry_id)
    app_type = _validate_app_type(entry, MEDIA_APPS)
    client = entry.runtime_data.client

    command = "MissingSeriesSearch"
    if app_type in ["Radarr", "Whisparr"]:
        command = "MissingMoviesSearch"
    elif app_type == "Lidarr":
        command = "ArtistSearch"
    elif app_type == "Readarr":
        command = "AuthorSearch"

    await client.command.execute(name=command)


async def async_handle_add_series(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle add series service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id, SERIES_APPS)

    tvdb_id = call.data.get("tvdb_id")
    title = call.data.get("title")

    if tvdb_id:
        series_lookup = await client.series.lookup(item_id=tvdb_id)
    elif title:
        series_lookup = await client.series.lookup(term=title)
    else:
        msg = "Either tvdb_id or title must be provided"
        raise ArmadarrServiceError(msg)

    if not series_lookup:
        msg = f"Series not found: {tvdb_id or title}"
        raise ArmadarrServiceError(msg)

    if len(series_lookup) > 1 and not tvdb_id:
        options = [
            f"{s.get('title')} (TVDB: {s.get('tvdbId')})" for s in series_lookup[:5]
        ]
        msg = (
            f"Multiple series found for '{title}'. Please use tvdb_id. "
            f"Options: {', '.join(options)}"
        )
        raise ArmadarrServiceError(msg)

    await client.series.add(
        series=series_lookup[0],
        root_dir=call.data["root_folder_path"],
        quality_profile_id=call.data["quality_profile_id"],
        language_profile_id=1,  # Default to 1
    )


async def async_handle_add_movie(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle add movie service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id, MOVIE_APPS)

    tmdb_id = call.data.get("tmdb_id")
    title = call.data.get("title")

    if tmdb_id:
        movie_lookup = await client.movie.lookup(term=f"tmdb:{tmdb_id}")
    elif title:
        movie_lookup = await client.movie.lookup(term=title)
    else:
        msg = "Either tmdb_id or title must be provided"
        raise ArmadarrServiceError(msg)

    if not movie_lookup:
        msg = f"Movie not found: {tmdb_id or title}"
        raise ArmadarrServiceError(msg)

    if len(movie_lookup) > 1 and not tmdb_id:
        options = [
            f"{m.get('title')} (TMDB: {m.get('tmdbId')})" for m in movie_lookup[:5]
        ]
        msg = (
            f"Multiple movies found for '{title}'. Please use tmdb_id. "
            f"Options: {', '.join(options)}"
        )
        raise ArmadarrServiceError(msg)

    await client.movie.add(
        movie=movie_lookup[0],
        root_dir=call.data["root_folder_path"],
        quality_profile_id=call.data["quality_profile_id"],
    )


async def async_handle_add_artist(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle add artist service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id, ARTIST_APPS)

    mb_id = call.data.get("mb_id")
    name = call.data.get("name")

    if mb_id:
        artist_lookup = await client.artist.lookup(term=f"lidarr:{mb_id}")
    elif name:
        artist_lookup = await client.artist.lookup(term=name)
    else:
        msg = "Either mb_id or name must be provided"
        raise ArmadarrServiceError(msg)

    if not artist_lookup:
        msg = f"Artist not found: {mb_id or name}"
        raise ArmadarrServiceError(msg)

    if len(artist_lookup) > 1 and not mb_id:
        options = [
            f"{a.get('artistName')} (MBID: {a.get('foreignArtistId')})"
            for a in artist_lookup[:5]
        ]
        msg = (
            f"Multiple artists found for '{name}'. Please use mb_id. "
            f"Options: {', '.join(options)}"
        )
        raise ArmadarrServiceError(msg)

    await client.artist.add(
        artist=artist_lookup[0],
        root_dir=call.data["root_folder_path"],
        quality_profile_id=call.data["quality_profile_id"],
        metadata_profile_id=call.data["metadata_profile_id"],
    )


async def async_handle_add_author(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle add author service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id, AUTHOR_APPS)

    author_id = call.data.get("author_id")
    name = call.data.get("name")

    if author_id:
        # Readarr lookup term can be the ID directly or prefixed
        author_lookup = await client.author.lookup(term=author_id)
    elif name:
        author_lookup = await client.author.lookup(term=name)
    else:
        msg = "Either author_id or name must be provided"
        raise ArmadarrServiceError(msg)

    if not author_lookup:
        msg = f"Author not found: {author_id or name}"
        raise ArmadarrServiceError(msg)

    if len(author_lookup) > 1 and not author_id:
        options = [
            f"{a.get('authorName')} (ID: {a.get('foreignAuthorId')})"
            for a in author_lookup[:5]
        ]
        msg = (
            f"Multiple authors found for '{name}'. Please use author_id. "
            f"Options: {', '.join(options)}"
        )
        raise ArmadarrServiceError(msg)

    await client.author.add(
        author=author_lookup[0],
        root_dir=call.data["root_folder_path"],
        quality_profile_id=call.data["quality_profile_id"],
        metadata_profile_id=call.data["metadata_profile_id"],
    )


async def async_handle_lookup_series(
    hass: HomeAssistant, call: ServiceCall
) -> dict[str, Any]:
    """Handle lookup series service call."""
    entry_id = call.data["entry_id"]
    term = call.data["term"]
    client = await async_get_client(hass, entry_id, SERIES_APPS)

    results = await client.series.lookup(term=term)
    return {"data": results}


async def async_handle_lookup_movie(
    hass: HomeAssistant, call: ServiceCall
) -> dict[str, Any]:
    """Handle lookup movie service call."""
    entry_id = call.data["entry_id"]
    term = call.data["term"]
    client = await async_get_client(hass, entry_id, MOVIE_APPS)

    results = await client.movie.lookup(term=term)
    return {"data": results}


async def async_handle_lookup_artist(
    hass: HomeAssistant, call: ServiceCall
) -> dict[str, Any]:
    """Handle lookup artist service call."""
    entry_id = call.data["entry_id"]
    term = call.data["term"]
    client = await async_get_client(hass, entry_id, ARTIST_APPS)

    results = await client.artist.lookup(term=term)
    return {"data": results}


async def async_handle_lookup_author(
    hass: HomeAssistant, call: ServiceCall
) -> dict[str, Any]:
    """Handle lookup author service call."""
    entry_id = call.data["entry_id"]
    term = call.data["term"]
    client = await async_get_client(hass, entry_id, AUTHOR_APPS)

    results = await client.author.lookup(term=term)
    return {"data": results}


async def async_handle_get_config_data(
    hass: HomeAssistant, call: ServiceCall
) -> dict[str, Any]:
    """Handle get config data service call."""
    entry_id = call.data["entry_id"]
    entry = _get_entry(hass, entry_id)
    # Every app type can answer this; the payload just varies by app.
    app_type = _validate_app_type(entry, None)
    client = entry.runtime_data.client

    data: dict[str, Any] = {}
    if app_type not in ["Bazarr", "Prowlarr", "Dispatcharr"]:
        data["root_folders"] = await client.root_folder.get()
        data["quality_profiles"] = await client.quality_profile.get()

    if app_type == "Readarr":
        data["metadata_profiles"] = await client.metadata_profile.get()

    return {"data": data}


async def async_handle_delete_queue_item(
    hass: HomeAssistant, call: ServiceCall
) -> None:
    """Handle delete queue item service call."""
    entry_id = call.data["entry_id"]
    item_id = call.data["item_id"]
    client = await async_get_client(hass, entry_id, MEDIA_APPS)

    await client.queue.delete(item_id=item_id)


async def async_handle_search_item(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle search item service call."""
    entry_id = call.data["entry_id"]
    item_id = call.data["item_id"]
    entry = _get_entry(hass, entry_id)
    app_type = _validate_app_type(entry, MEDIA_APPS)
    client = entry.runtime_data.client

    if app_type == "Sonarr":
        await client.command.execute(name="EpisodeSearch", episodeIds=[item_id])
    elif app_type in ["Radarr", "Whisparr"]:
        await client.command.execute(name="MovieSearch", movieIds=[item_id])
    elif app_type == "Lidarr":
        await client.command.execute(name="ArtistSearch", artistIds=[item_id])
    elif app_type == "Readarr":
        await client.command.execute(name="AuthorSearch", authorIds=[item_id])


async def async_handle_sync_indexers(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle sync indexers service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id, INDEXER_APPS)
    await client.command.execute(name="AppIndexerSync")


async def async_handle_dispatcharr_refresh_m3u(
    hass: HomeAssistant, call: ServiceCall
) -> None:
    """Handle Dispatcharr refresh M3U service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id, DISPATCHARR_APPS)
    await client.m3u.refresh(data=call.data.get("data", {}))


async def async_handle_dispatcharr_refresh_epg(
    hass: HomeAssistant, call: ServiceCall
) -> None:
    """Handle Dispatcharr refresh EPG service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id, DISPATCHARR_APPS)
    await client.epg.import_epg(data=call.data.get("data", {}))


async def async_handle_dispatcharr_run_plugin(
    hass: HomeAssistant, call: ServiceCall
) -> None:
    """Handle Dispatcharr run plugin service call."""
    entry_id = call.data["entry_id"]
    plugin_id = call.data["plugin_id"]
    client = await async_get_client(hass, entry_id, DISPATCHARR_APPS)
    await client.plugins.run(item_id=plugin_id, data=call.data.get("data", {}))


async def async_handle_dispatcharr_proxy_action(
    hass: HomeAssistant, call: ServiceCall
) -> None:
    """Handle Dispatcharr proxy action service call."""
    entry_id = call.data["entry_id"]
    action = call.data["action"]
    channel_id = call.data["channel_id"]
    client = await async_get_client(hass, entry_id, DISPATCHARR_APPS)

    if action == "change_stream":
        await client.proxy.change_ts_stream(channel_id=channel_id)
    elif action == "next_stream":
        await client.proxy.next_ts_stream(channel_id=channel_id)
    elif action == "stop_stream":
        await client.proxy.stop_ts_stream(channel_id=channel_id)
