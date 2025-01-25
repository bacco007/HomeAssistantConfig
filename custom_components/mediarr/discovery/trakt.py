# mediarr/discovery/trakt.py
"""Trakt integration for Mediarr."""

import logging
from ..common.sensor import MediarrSensor

_LOGGER = logging.getLogger(__name__)

class TraktMediarrSensor(MediarrSensor):
    def __init__(self, session, client_id, client_secret, trending_type, max_items, tmdb_api_key):
        super().__init__()
        self._session = session
        self._client_id = client_id
        self._client_secret = client_secret
        self._trending_type = trending_type
        self._max_items = max_items
        self._tmdb_api_key = tmdb_api_key
        self._name = "Trakt Mediarr"
        self._access_token = None
        self._headers = {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': client_id
        }

    @property
    def name(self):
        return self._name

    @property
    def unique_id(self):
        return f"trakt_mediarr_{self._trending_type}"

    async def _get_access_token(self):
        try:
            data = {
                'client_id': self._client_id,
                'client_secret': self._client_secret,
                'grant_type': 'client_credentials'
            }

            async with self._session.post(
                'https://api.trakt.tv/oauth/token',
                json=data,
                headers=self._headers
            ) as response:
                if response.status == 200:
                    token_data = await response.json()
                    self._access_token = token_data.get('access_token')
                    if self._access_token:
                        self._headers['Authorization'] = f'Bearer {self._access_token}'
                        self._available = True
                        return True
                return False
        except Exception as err:
            _LOGGER.error("Error getting Trakt access token: %s", err)
            return False

    async def _fetch_popular(self, media_type):
        try:
            params = {'limit': self._max_items}
            
            async with self._session.get(
                f"https://api.trakt.tv/{media_type}/popular",
                headers=self._headers,
                params=params
            ) as response:
                if response.status == 200:
                    return await response.json()
                elif response.status in [401, 403]:
                    if await self._get_access_token():
                        return await self._fetch_popular(media_type)
                return []
        except Exception as err:
            _LOGGER.error("Error fetching Trakt %s: %s", media_type, err)
            return []

    async def _fetch_tmdb_data(self, tmdb_id, media_type):
        try:
            endpoint = 'tv' if media_type == 'show' else 'movie'
            headers = {
                'Authorization': f'Bearer {self._tmdb_api_key}',
                'accept': 'application/json'
            }
            
            async with self._session.get(
                f"https://api.themoviedb.org/3/{endpoint}/{tmdb_id}",
                headers=headers
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'poster': f"https://image.tmdb.org/t/p/w500{data.get('poster_path')}" if data.get('poster_path') else None,
                        'backdrop': f"https://image.tmdb.org/t/p/original{data.get('backdrop_path')}" if data.get('backdrop_path') else None,
                        'overview': data.get('overview'),
                        'genres': [g['name'] for g in data.get('genres', [])]
                    }
                return {}
        except Exception as err:
            _LOGGER.error("Error fetching TMDB data: %s", err)
            return {}

    async def _process_item(self, item, media_type):
        try:
            base_item = {
                'title': item['title'],
                'year': item.get('year'),
                'type': media_type,
                'ids': item.get('ids', {}),
                'slug': item.get('ids', {}).get('slug'),
                'tmdb_id': item.get('ids', {}).get('tmdb'),
                'imdb_id': item.get('ids', {}).get('imdb'),
                'trakt_id': item.get('ids', {}).get('trakt')
            }

            if base_item['tmdb_id']:
                tmdb_data = await self._fetch_tmdb_data(base_item['tmdb_id'], media_type)
                base_item.update(tmdb_data)

            return base_item
        except Exception as err:
            _LOGGER.error("Error processing Trakt item: %s", err)
            return None

    async def async_update(self):
        try:
            if not self._access_token and not await self._get_access_token():
                self._state = None
                self._attributes = {}
                self._available = False
                return

            all_items = []
            
            if self._trending_type in ['shows', 'both']:
                shows = await self._fetch_popular('shows')
                for item in shows:
                    processed = await self._process_item(item, 'show')
                    if processed:
                        all_items.append(processed)
            
            if self._trending_type in ['movies', 'both']:
                movies = await self._fetch_popular('movies')
                for item in movies:
                    processed = await self._process_item(item, 'movie')
                    if processed:
                        all_items.append(processed)
            
            if all_items:
                self._state = len(all_items)
                self._attributes = {'data': all_items}
                self._available = True
            else:
                self._state = 0
                self._attributes = {'data': []}
                self._available = False

        except Exception as err:
            _LOGGER.error("Error updating Trakt sensor: %s", err)
            self._state = None
            self._attributes = {'data': []}
            self._available = False