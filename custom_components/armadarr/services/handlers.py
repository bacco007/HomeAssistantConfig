"""Service handlers for Armadarr."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant, ServiceCall


class ArmadarrServiceError(Exception):
    """Base class for Armadarr service exceptions."""


async def async_get_client(hass: HomeAssistant, entry_id: str) -> Any:
    """Get client for entry_id."""
    entry = hass.config_entries.async_get_entry(entry_id)
    if not entry:
        msg = f"Entry {entry_id} not found"
        raise ArmadarrServiceError(msg)
    return entry.runtime_data.client


async def async_handle_system_task(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle system task service call."""
    entry_id = call.data["entry_id"]
    task = str(call.data["task"])
    client = await async_get_client(hass, entry_id)

    if task.isdigit():
        # It's a task ID, trigger via ExecuteStoredTask command
        await client.command.execute(name="ExecuteStoredTask", taskId=int(task))
    else:
        # It's a command name, use the command endpoint
        await client.command.execute(name=task)


async def async_handle_search_missing(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle search missing service call."""
    entry_id = call.data["entry_id"]
    entry = hass.config_entries.async_get_entry(entry_id)
    if not entry:
        msg = f"Entry {entry_id} not found"
        raise ArmadarrServiceError(msg)

    client = entry.runtime_data.client
    app_type = entry.data["app_type"]

    command = "MissingSeriesSearch"
    if app_type == "Radarr":
        command = "MissingMoviesSearch"
    elif app_type == "Lidarr":
        command = "ArtistSearch"
    elif app_type == "Readarr":
        command = "AuthorSearch"

    await client.command.execute(name=command)


async def async_handle_add_series(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle add series service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id)

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
    client = await async_get_client(hass, entry_id)

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
    client = await async_get_client(hass, entry_id)

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
    client = await async_get_client(hass, entry_id)

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
    client = await async_get_client(hass, entry_id)

    results = await client.series.lookup(term=term)
    return {"data": results}


async def async_handle_lookup_movie(
    hass: HomeAssistant, call: ServiceCall
) -> dict[str, Any]:
    """Handle lookup movie service call."""
    entry_id = call.data["entry_id"]
    term = call.data["term"]
    client = await async_get_client(hass, entry_id)

    results = await client.movie.lookup(term=term)
    return {"data": results}


async def async_handle_lookup_artist(
    hass: HomeAssistant, call: ServiceCall
) -> dict[str, Any]:
    """Handle lookup artist service call."""
    entry_id = call.data["entry_id"]
    term = call.data["term"]
    client = await async_get_client(hass, entry_id)

    results = await client.artist.lookup(term=term)
    return {"data": results}


async def async_handle_lookup_author(
    hass: HomeAssistant, call: ServiceCall
) -> dict[str, Any]:
    """Handle lookup author service call."""
    entry_id = call.data["entry_id"]
    term = call.data["term"]
    client = await async_get_client(hass, entry_id)

    results = await client.author.lookup(term=term)
    return {"data": results}


async def async_handle_get_config_data(
    hass: HomeAssistant, call: ServiceCall
) -> dict[str, Any]:
    """Handle get config data service call."""
    entry_id = call.data["entry_id"]
    entry = hass.config_entries.async_get_entry(entry_id)
    if not entry:
        msg = f"Entry {entry_id} not found"
        raise ArmadarrServiceError(msg)

    client = entry.runtime_data.client
    app_type = entry.data["app_type"]

    data: dict[str, Any] = {}
    if app_type not in ["Bazarr", "Prowlarr"]:
        data["root_folders"] = await client.root_folder.get()
        data["quality_profiles"] = await client.quality_profile.get()

    if app_type in ["Lidarr", "Readarr"]:
        data["metadata_profiles"] = await client.metadata_profile.get()

    return {"data": data}


async def async_handle_delete_queue_item(
    hass: HomeAssistant, call: ServiceCall
) -> None:
    """Handle delete queue item service call."""
    entry_id = call.data["entry_id"]
    item_id = call.data["item_id"]
    client = await async_get_client(hass, entry_id)

    await client.queue.delete(item_id=item_id)


async def async_handle_search_item(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle search item service call."""
    entry_id = call.data["entry_id"]
    item_id = call.data["item_id"]
    entry = hass.config_entries.async_get_entry(entry_id)
    if not entry:
        msg = f"Entry {entry_id} not found"
        raise ArmadarrServiceError(msg)

    client = entry.runtime_data.client
    app_type = entry.data["app_type"]

    if app_type in ["Sonarr", "Whisparr"]:
        await client.command.execute(name="EpisodeSearch", episodeIds=[item_id])
    elif app_type == "Radarr":
        await client.command.execute(name="MovieSearch", movieIds=[item_id])
    elif app_type == "Lidarr":
        await client.command.execute(name="ArtistSearch", artistIds=[item_id])
    elif app_type == "Readarr":
        await client.command.execute(name="AuthorSearch", authorIds=[item_id])


async def async_handle_sync_indexers(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle sync indexers service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id)
    await client.command.execute(name="AppIndexerSync")


async def async_handle_dispatcharr_refresh_m3u(
    hass: HomeAssistant, call: ServiceCall
) -> None:
    """Handle Dispatcharr refresh M3U service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id)
    await client.m3u.refresh(data=call.data.get("data", {}))


async def async_handle_dispatcharr_refresh_epg(
    hass: HomeAssistant, call: ServiceCall
) -> None:
    """Handle Dispatcharr refresh EPG service call."""
    entry_id = call.data["entry_id"]
    client = await async_get_client(hass, entry_id)
    await client.epg.import_epg(data=call.data.get("data", {}))


async def async_handle_dispatcharr_run_plugin(
    hass: HomeAssistant, call: ServiceCall
) -> None:
    """Handle Dispatcharr run plugin service call."""
    entry_id = call.data["entry_id"]
    plugin_id = call.data["plugin_id"]
    client = await async_get_client(hass, entry_id)
    await client.plugins.run(item_id=plugin_id, data=call.data.get("data", {}))


async def async_handle_dispatcharr_proxy_action(
    hass: HomeAssistant, call: ServiceCall
) -> None:
    """Handle Dispatcharr proxy action service call."""
    entry_id = call.data["entry_id"]
    action = call.data["action"]
    channel_id = call.data["channel_id"]
    client = await async_get_client(hass, entry_id)

    if action == "change_stream":
        await client.proxy.change_ts_stream(channel_id=channel_id)
    elif action == "next_stream":
        await client.proxy.next_ts_stream(channel_id=channel_id)
    elif action == "stop_stream":
        await client.proxy.stop_ts_stream(channel_id=channel_id)
