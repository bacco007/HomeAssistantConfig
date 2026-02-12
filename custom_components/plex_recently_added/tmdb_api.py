import aiohttp

TMDB_API_KEY = '1f7708bb9a218ab891a5d438b1b63992'
TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/{media_type}?api_key={api_key}&query={query}'
TMDB_DETAILS_URL = 'https://api.themoviedb.org/3/{media_type}/{tmdb_id}?api_key={api_key}&append_to_response=videos'

EMPTY_TMDB_RESULT = {'trailer': None, 'tmdb_rating': None, 'tmdb_genres': None, 'tmdb_id': None}

async def get_tmdb_trailer_url(hass, title, media_type):
    if media_type == 'show':
        media_type = 'tv'
    elif media_type == 'movie':
        media_type = 'movie'
    else:
        return EMPTY_TMDB_RESULT.copy()

    async with aiohttp.ClientSession() as session:
        # Search for the movie or TV show
        search_url = TMDB_SEARCH_URL.format(media_type=media_type, api_key=TMDB_API_KEY, query=title)
        async with session.get(search_url) as response:
            search_data = await response.json()
            if not search_data.get('results'):
                return EMPTY_TMDB_RESULT.copy()

            tmdb_id = search_data['results'][0]['id']

        # Get details including videos
        details_url = TMDB_DETAILS_URL.format(media_type=media_type, tmdb_id=tmdb_id, api_key=TMDB_API_KEY)
        async with session.get(details_url) as response:
            details_data = await response.json()

            tmdb_rating = details_data.get('vote_average', 0)
            tmdb_genres = [g['name'] for g in details_data.get('genres', [])]

            trailer_url = None
            videos = details_data.get('videos', {}).get('results', [])
            for video in videos:
                if video['type'] == 'Trailer' and video['site'] == 'YouTube':
                    trailer_url = f'https://www.youtube.com/watch?v={video["key"]}'
                    break

            return {'trailer': trailer_url, 'tmdb_rating': tmdb_rating, 'tmdb_genres': tmdb_genres, 'tmdb_id': tmdb_id}

    return EMPTY_TMDB_RESULT.copy()
