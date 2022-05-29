from typing import Any, Dict

import aiohttp

from custom_components.trakt_tv.const import TMDB_HOST, TMDB_TOKEN


async def get_media_data(kind: str, tmbd_id: int, language: str) -> Dict[str, Any]:
    """
    Get information from TMDB about a kind of media.

    :param kind: The kind of media
    :param tmbd_id: The ID of the media
    :param language: The favorite language of the user
    """
    url = f"{TMDB_HOST}/3/{kind}/{tmbd_id}?api_key={TMDB_TOKEN}&language={language}"
    async with aiohttp.request("GET", url) as response:
        return await response.json()


async def get_movie_data(tmbd_id: int, language: str) -> Dict[str, Any]:
    """
    Get information from TMDB about a movie.

    :param tmbd_id: The ID of the movie
    :param language: The favorite language of the user
    """
    return await get_media_data("movie", tmbd_id, language)


async def get_show_data(tmbd_id: int, language: str) -> Dict[str, Any]:
    """
    Get information from TMDB about a show.

    :param tmbd_id: The ID of the show
    :param language: The favorite language of the user
    """
    return await get_media_data("tv", tmbd_id, language)
