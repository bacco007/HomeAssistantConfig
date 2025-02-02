# mediarr/discovery/tmdb.py
"""TMDB integration for Mediarr."""

import logging
from ..common.sensor import MediarrSensor

_LOGGER = logging.getLogger(__name__)

TMDB_ENDPOINTS = {
    'trending': 'trending/all/week',
    'now_playing': 'movie/now_playing',
    'upcoming': 'movie/upcoming',
    'on_air': 'tv/on_the_air',
    'airing_today': 'tv/airing_today'
}

class TMDBMediarrSensor(MediarrSensor):
    def __init__(self, session, api_key, max_items, endpoint='trending'):
        super().__init__()
        self._session = session
        self._api_key = api_key
        self._max_items = max_items
        self._endpoint = endpoint
        self._name = f"TMDB Mediarr {endpoint.replace('_', ' ').title()}"

    @property
    def name(self):
        return self._name

    @property
    def unique_id(self):
        return f"tmdb_mediarr_{self._endpoint}"

    async def async_update(self):
        try:
            headers = {
                'Authorization': f'Bearer {self._api_key}',
                'accept': 'application/json'
            }
            
            endpoint_url = TMDB_ENDPOINTS.get(self._endpoint, TMDB_ENDPOINTS['trending'])
            async with self._session.get(
                f"https://api.themoviedb.org/3/{endpoint_url}",
                headers=headers
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    results = []
                    
                    for item in data.get('results', []):
                        media_type = self._get_media_type(item)
                        if media_type in ['movie', 'tv']:
                            results.append({
                                'title': item.get('title') if media_type == 'movie' else item.get('name'),
                                'type': 'movie' if media_type == 'movie' else 'show',
                                'year': self._get_year(item, media_type),
                                'overview': item.get('overview'),
                                'poster': f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else None,
                                'backdrop': f"https://image.tmdb.org/t/p/original{item.get('backdrop_path')}" if item.get('backdrop_path') else None,
                                'tmdb_id': item.get('id'),
                                'popularity': item.get('popularity'),
                                'vote_average': item.get('vote_average')
                            })
                    
                    self._state = len(results)
                    self._attributes = {'data': results[:self._max_items]}
                    self._available = True
                else:
                    raise Exception(f"Failed to fetch TMDB {self._endpoint}. Status: {response.status}")

        except Exception as err:
            _LOGGER.error("Error updating TMDB sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False

    def _get_media_type(self, item):
        """Determine media type based on endpoint and item data."""
        if self._endpoint in ['now_playing', 'upcoming']:
            return 'movie'
        elif self._endpoint in ['on_air', 'airing_today']:
            return 'tv'
        return item.get('media_type', 'movie')

    def _get_year(self, item, media_type):
        """Extract year based on media type."""
        if media_type == 'movie':
            date = item.get('release_date', '')
        else:
            date = item.get('first_air_date', '')
        return date.split('-')[0] if date else ''