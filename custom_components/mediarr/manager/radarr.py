"""Radarr integration for Mediarr using TMDB images."""
import logging
from datetime import datetime
import async_timeout
from ..common.tmdb_sensor import TMDBMediaSensor

_LOGGER = logging.getLogger(__name__)

class RadarrMediarrSensor(TMDBMediaSensor):
    def __init__(self, session, api_key, url, tmdb_api_key, max_items):
        """Initialize the sensor."""
        super().__init__(session, tmdb_api_key)
        self._radarr_api_key = api_key
        self._url = url.rstrip('/')
        self._max_items = max_items
        self._name = "Radarr Mediarr"

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID."""
        return f"radarr_mediarr_{self._url}"

    async def async_update(self):
        """Update the sensor."""
        try:
            headers = {'X-Api-Key': self._radarr_api_key}
            _LOGGER.debug("Fetching Radarr data from %s", self._url)
            now = datetime.now().astimezone()
            
            async with async_timeout.timeout(10):
                async with self._session.get(
                    f"{self._url}/api/v3/movie",
                    headers=headers
                ) as response:
                    if response.status != 200:
                        _LOGGER.error("Radarr API error: %s - Response: %s", 
                                    response.status, await response.text())
                        raise Exception(f"Failed to connect to Radarr. Status: {response.status}")
                    
                    movies = await response.json()
                    _LOGGER.debug("Received %d movies from Radarr", len(movies))
                    card_json = []
                    upcoming_movies = []

                    for movie in movies:
                        if not movie.get('monitored', False) or movie.get('hasFile', False):
                            continue

                        release_dates = []
                        for date_field, date_type in [
                            ('digitalRelease', 'Digital'),
                            ('physicalRelease', 'Physical'),
                            ('inCinemas', 'Theaters')
                        ]:
                            if movie.get(date_field):
                                try:
                                    release_date = datetime.fromisoformat(
                                        movie[date_field].replace('Z', '+00:00')
                                    )
                                    if not release_date.tzinfo:
                                        release_date = release_date.replace(tzinfo=now.tzinfo)
                                    if release_date > now:
                                        release_dates.append((date_type, release_date))
                                except ValueError as e:
                                    _LOGGER.warning("Error parsing date for movie %s: %s", 
                                                movie.get('title', 'Unknown'), e)
                                    continue

                        if release_dates:
                            release_dates.sort(key=lambda x: x[1])
                            release_type, release_date = release_dates[0]

                            # Get TMDB ID or search for it
                            tmdb_id = movie.get('tmdbId')
                            if not tmdb_id:
                                tmdb_id = await self._search_tmdb(
                                    movie['title'],
                                    movie.get('year'),
                                    'movie'
                                )

                            # Get TMDB images
                            poster_url, backdrop_url, main_backdrop_url = await self._get_tmdb_images(tmdb_id, 'movie') if tmdb_id else (None, None, None)

                            movie_data = {
                                "title": str(movie["title"]),
                                "release": f"{release_type} - {release_date.strftime('%Y-%m-%d')}",
                                "aired": release_date.strftime("%Y-%m-%d"),
                                "year": str(movie["year"]),
                                "poster": str(poster_url or ""),  # Thumbnail in list
                                "fanart": str(main_backdrop_url or backdrop_url or ""),  # Main display image
                                "banner": str(backdrop_url or ""),  # Additional image if needed
                                "genres": ", ".join(str(g) for g in movie.get("genres", [])[:3]),
                                "runtime": str(movie.get("runtime", 0)),
                                "rating": str(movie.get("ratings", {}).get("value", "")),
                                "studio": str(movie.get("studio", "N/A")),
                                "flag": 1
                            }
                            upcoming_movies.append(movie_data)

                    upcoming_movies.sort(key=lambda x: x['aired'])
                    card_json.extend(upcoming_movies[:self._max_items])

                    if not card_json:
                        card_json.append({
                            'title_default': '$title',
                            'line1_default': '$release',
                            'line2_default': '$genres',
                            'line3_default': '$rating - $runtime',
                            'line4_default': '$studio',
                            'icon': 'mdi:arrow-down-circle'
                        })

                    self._state = len(upcoming_movies)
                    self._attributes = {'data': card_json}
                    self._available = True

        except Exception as err:
            _LOGGER.error("Error updating Radarr sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False