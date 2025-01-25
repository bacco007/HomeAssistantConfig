# mediarr/discovery/tmdb.py
"""TMDB integration for Mediarr."""

import logging
from ..common.sensor import MediarrSensor

_LOGGER = logging.getLogger(__name__)

class TMDBMediarrSensor(MediarrSensor):
    def __init__(self, session, api_key, max_items):
        super().__init__()
        self._session = session
        self._api_key = api_key
        self._max_items = max_items
        self._name = "TMDB Mediarr"

    @property
    def name(self):
        return self._name

    @property
    def unique_id(self):
        return "tmdb_mediarr_trending"

    async def async_update(self):
        try:
            headers = {
                'Authorization': f'Bearer {self._api_key}',
                'accept': 'application/json'
            }
            
            async with self._session.get(
                "https://api.themoviedb.org/3/trending/all/week",
                headers=headers
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    results = []
                    
                    for item in data.get('results', []):
                        media_type = item.get('media_type')
                        if media_type in ['movie', 'tv']:
                            results.append({
                                'title': item.get('title') if media_type == 'movie' else item.get('name'),
                                'type': 'movie' if media_type == 'movie' else 'show',
                                'year': item.get('release_date', '').split('-')[0] if media_type == 'movie' else item.get('first_air_date', '').split('-')[0],
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
                    raise Exception(f"Failed to fetch TMDB trending. Status: {response.status}")

        except Exception as err:
            _LOGGER.error("Error updating TMDB sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False