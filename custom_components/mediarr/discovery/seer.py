"""Jellyseerr/Overseerr integration for Mediarr using TMDB images."""
import logging
from datetime import datetime
from ..common.tmdb_sensor import TMDBMediaSensor
import async_timeout
import aiofiles

_LOGGER = logging.getLogger(__name__)

class SeerMediarrSensor(TMDBMediaSensor):
    def __init__(self, session, api_key, url, tmdb_api_key, max_items):
        """Initialize the sensor."""
        super().__init__(session, tmdb_api_key)
        self._seer_api_key = api_key
        self._url = url.rstrip('/')
        self._max_items = max_items
        self._name = "Seer Mediarr"

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID."""
        return f"seer_mediarr_{self._url}"

    async def _get_tmdb_details(self, tmdb_id, media_type):
        """Fetch title and overview from TMDB."""
        try:
            url = f"https://api.themoviedb.org/3/{media_type}/{tmdb_id}"
            headers = {'Authorization': f'Bearer {self._tmdb_api_key}'}
            
            async with async_timeout.timeout(10):
                async with self._session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            'title': data.get('title' if media_type == 'movie' else 'name', 'Unknown'),
                            'overview': data.get('overview', 'No description available.'),
                            'year': data.get('release_date' if media_type == 'movie' else 'first_air_date', '')[:4]
                        }
            return None
        except Exception as err:
            _LOGGER.error("Error fetching TMDB details: %s", err)
            return None

    async def async_update(self):
        """Update the sensor."""
        try:
            headers = {'X-Api-Key': self._seer_api_key}

            async with async_timeout.timeout(10):
                async with self._session.get(
                    f"{self._url}/api/v1/request",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        requests = await response.json()
                        card_json = []
                        
                        for request in requests['results'][:self._max_items]:
                            media = request.get('media', {})

                            is_movie = media.get('mediaType') == 'movie'
                            tmdb_id = media.get('tmdbId')
                            media_type = 'movie' if is_movie else 'tv'

                            # Always fetch TMDB details since we need the title
                            tmdb_details = await self._get_tmdb_details(tmdb_id, media_type) if tmdb_id else None
                            
                            # Fetch images using parent class method
                            poster_url, backdrop_url, main_backdrop_url = await self._get_tmdb_images(
                                tmdb_id, media_type
                            ) if tmdb_id else (None, None, None)

                            # Get title from TMDB details
                            title = tmdb_details.get('title', 'Unknown') if tmdb_details else 'Unknown'
                            overview = tmdb_details.get('overview', 'No description available.') if tmdb_details else 'No description available.'
                            year = tmdb_details.get('year', '') if tmdb_details else ''

                            # Fix date handling
                            requested_date = request.get('createdAt')
                            if requested_date:
                                try:
                                    formatted_date = datetime.fromisoformat(requested_date.replace('Z', '+00:00')).strftime('%Y-%m-%d')
                                except ValueError:
                                    formatted_date = "Unknown Date"
                            else:
                                formatted_date = "Unknown Date"

                            # Extract season & episode (if TV show)
                            season = media.get('seasonNumber')
                            episode = media.get('episodeNumber')
                            episode_info = f"S{season:02d}E{episode:02d}" if season and episode else ""

                            request_data = {
                                'title': title,
                                'type': 'Movie' if is_movie else 'TV Show',
                                'status': request.get('status', 'Unknown'),
                                'requested_by': request.get('requestedBy', {}).get('displayName', 'Unknown User'),
                                'requested_date': formatted_date,
                                'overview': overview,
                                'year': year,
                                'season_episode': episode_info,
                                'poster': str(poster_url or ""),
                                'fanart': str(main_backdrop_url or backdrop_url or ""),
                                'banner': str(backdrop_url or ""),
                                'release': formatted_date,
                                'details': (
                                    f"{title} {episode_info}\n"
                                    f"Requested by: {request.get('requestedBy', {}).get('displayName', 'Unknown User')}\n"
                                    f"Status: {request.get('status', 'Unknown')}"
                                ),
                                'flag': 1
                            }

                            card_json.append(request_data)

                        if not card_json:
                            card_json.append({
                                'title_default': '$title',
                                'line1_default': '$type',
                                'line2_default': '$status',
                                'line3_default': '$requested_by',
                                'line4_default': '$requested_date',
                                'icon': 'mdi:movie-search'
                            })

                        self._state = len(card_json)
                        self._attributes = {'data': card_json}
                        self._available = True
                    else:
                        raise Exception(f"Failed to connect to Jellyseerr/Overseerr. Status: {response.status}")

        except Exception as err:
            _LOGGER.error("Error updating Jellyseerr/Overseerr sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False