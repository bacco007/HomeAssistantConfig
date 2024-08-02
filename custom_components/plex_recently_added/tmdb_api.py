import aiohttp

TMDB_API_KEY = '1f7708bb9a218ab891a5d438b1b63992'
TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/{media_type}?api_key={api_key}&query={query}'
TMDB_DETAILS_URL = 'https://api.themoviedb.org/3/{media_type}/{tmdb_id}?api_key={api_key}&append_to_response=videos'

async def get_tmdb_trailer_url(hass, title, media_type):
    if media_type == 'show':
        media_type = 'tv'
    elif media_type == 'movie':
        media_type = 'movie'
    else:
        return None

    async with aiohttp.ClientSession() as session:
        # Search for the movie or TV show
        search_url = TMDB_SEARCH_URL.format(media_type=media_type, api_key=TMDB_API_KEY, query=title)
        async with session.get(search_url) as response:
            search_data = await response.json()
            if not search_data.get('results'):
                return None
            
            tmdb_id = search_data['results'][0]['id']

        # Get details including videos
        details_url = TMDB_DETAILS_URL.format(media_type=media_type, tmdb_id=tmdb_id, api_key=TMDB_API_KEY)
        async with session.get(details_url) as response:
            details_data = await response.json()
            
            videos = details_data.get('videos', {}).get('results', [])
            for video in videos:
                if video['type'] == 'Trailer' and video['site'] == 'YouTube':
                    return f'https://www.youtube.com/watch?v={video["key"]}'

    return None
