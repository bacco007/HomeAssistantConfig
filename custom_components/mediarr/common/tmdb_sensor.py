"""TMDB-based media sensor for Mediarr."""
import logging
from abc import ABC, abstractmethod
import async_timeout
from datetime import datetime
from ..common.sensor import MediarrSensor

_LOGGER = logging.getLogger(__name__)
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

class TMDBMediaSensor(MediarrSensor, ABC):
    """Base class for TMDB-based media sensors."""
    
    def __init__(self, session, tmdb_api_key):
        """Initialize the sensor."""
        super().__init__()
        self._session = session
        self._tmdb_api_key = tmdb_api_key
        self._available = True
        self._cache = {}

    # In tmdb_sensor.py, update _format_date method
    def _format_date(self, date_str):
        """Format date string to YYYY-MM-DD format."""
        if not date_str or date_str == 'Unknown':
            return 'Unknown'
        try:
            # Remove any timezone info and clean the string
            date_str = str(date_str).split('T')[0].split('.')[0].strip()
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                return date_str
            except ValueError:
                return 'Unknown'
        except Exception:
            return 'Unknown'

    async def _fetch_tmdb_data(self, endpoint, params=None):
        """Fetch data from TMDB API."""
        try:
            if not self._tmdb_api_key:
                _LOGGER.error("No TMDB API key provided")
                return None

            headers = {
                "Authorization": f"Bearer {self._tmdb_api_key}",
                "Accept": "application/json"
            }

            url = f"{TMDB_BASE_URL}/{endpoint}"
            
            if params:
                params = {k: str(v) if v is not None else "" for k, v in params.items()}
            
            async with async_timeout.timeout(10):
                async with self._session.get(
                    url,
                    params=params,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    elif response.status == 404:
                        _LOGGER.debug("TMDB resource not found: %s", url)
                        return None
                    else:
                        _LOGGER.error("TMDB API error: %s for URL: %s", response.status, url)
                        return None
        except Exception as err:
            _LOGGER.error("Error fetching TMDB data: %s", err)
            return None

    async def _get_tmdb_images(self, tmdb_id, media_type='movie'):
        """Get TMDB image URLs with varied options."""
        if not tmdb_id:
            return None, None, None

        cache_key = f"images_{media_type}_{tmdb_id}"
        if cache_key in self._cache:
            return self._cache[cache_key]
            
        try:
            data = await self._fetch_tmdb_data(f"{media_type}/{tmdb_id}/images")
            _LOGGER.debug("Raw TMDB data for %s: %s", tmdb_id, data)  # Add this line
            
            if data:
                # Get posters
                posters = data.get('posters', [])
                _LOGGER.debug("Posters found: %s", len(posters))  # Add this line
                poster_path = posters[0].get('file_path') if posters else None
                
                # Get backdrops
                backdrops = data.get('backdrops', [])
                _LOGGER.debug("Backdrops found: %s", len(backdrops))  # Add this line
                # Sort backdrops by vote count to get the most popular
                backdrops.sort(key=lambda x: x.get('vote_count', 0), reverse=True)
                
                backdrop_path = backdrops[0].get('file_path') if backdrops else None
                main_backdrop_path = backdrops[1].get('file_path') if len(backdrops) > 1 else backdrop_path

                poster_url = f"{TMDB_IMAGE_BASE_URL}/w500{poster_path}" if poster_path else None
                backdrop_url = f"{TMDB_IMAGE_BASE_URL}/w780{backdrop_path}" if backdrop_path else None
                main_backdrop_url = f"{TMDB_IMAGE_BASE_URL}/original{main_backdrop_path}" if main_backdrop_path else None

                result = (poster_url, backdrop_url, main_backdrop_url)
                self._cache[cache_key] = result
                return result
            
            return None, None, None
            
        except Exception as err:
            _LOGGER.error("Error getting TMDB images for %s: %s", tmdb_id, err)
            return None, None, None

    async def _search_tmdb(self, title, year=None, media_type='movie'):
        """Search for a title on TMDB."""
        if not title:
            return None
            
        try:
            cache_key = f"search_{media_type}_{title}_{year}"
            if cache_key in self._cache:
                return self._cache[cache_key]

            params = {"query": title}
            if year:
                params["year"] = year
            
            endpoint = f"search/{media_type}"
            results = await self._fetch_tmdb_data(endpoint, params)
            
            if results and results.get("results"):
                tmdb_id = results["results"][0]["id"]
                self._cache[cache_key] = tmdb_id
                return tmdb_id
            
            return None
            
        except Exception as err:
            _LOGGER.error("Error searching TMDB for %s: %s", title, err)
            return None
    async def _get_tmdb_details(self, tmdb_id, media_type):
        """Fetch title and overview from TMDB."""
        try:
            if not tmdb_id:
                return None
                
            cache_key = f"details_{media_type}_{tmdb_id}"
            if cache_key in self._cache:
                return self._cache[cache_key]

            endpoint = f"{media_type}/{tmdb_id}"
            data = await self._fetch_tmdb_data(endpoint)
            
            if data:
                details = {
                    'title': data.get('title' if media_type == 'movie' else 'name', 'Unknown'),
                    'overview': data.get('overview', 'No description available.'),
                    'year': data.get('release_date' if media_type == 'movie' else 'first_air_date', '')[:4]
                }
                self._cache[cache_key] = details
                return details
                
            return None
        except Exception as err:
            _LOGGER.error("Error fetching TMDB details for %s: %s", tmdb_id, err)
            return None

    @abstractmethod
    async def async_update(self):
        """Update sensor state."""
        pass