"""Radarr2 integration for Mediarr."""
from ..common.sensor import MediarrSensor 
from datetime import datetime, timedelta 
import async_timeout 
import logging


_LOGGER = logging.getLogger(__name__)

class Radarr2MediarrSensor(MediarrSensor):
    def __init__(self, session, api_key, url, max_items, days_to_check):
        """Initialize the sensor."""
        self._session = session
        self._radarr2_api_key = api_key
        self._url = url.rstrip('/')
        self._max_items = max_items
        self._days_to_check = days_to_check
        self._name = "Radarr2 Mediarr"
        self._state = 0
        
        

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID."""
        return f"radarr2_mediarr_{self._url}"

    async def async_update(self):
        """Update the sensor."""
        try:
            headers = {'X-Api-Key': self._radarr2_api_key}
            now = datetime.now().astimezone()
            max_date = now + timedelta(days=self._days_to_check)
            
            async with async_timeout.timeout(10):
                async with self._session.get(
                    f"{self._url}/api/v3/movie",
                    headers=headers
                ) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to connect to Radarr2. Status: {response.status}")
                    
                    movies = await response.json()
                    card_json = []
                    upcoming_movies = []

                    for movie in movies:
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
                                    if now < release_date <= max_date:
                                        release_dates.append((date_type, release_date))
                                except ValueError:
                                    continue

                        if release_dates:
                            release_dates.sort(key=lambda x: x[1])
                            release_type, release_date = release_dates[0]

                            images = {img['coverType']: img['remoteUrl'] for img in movie.get('images', [])}
                            
                            movie_data = {
                                "title": str(movie["title"]),
                                "release": f"{release_type} - {release_date.strftime('%Y-%m-%d')}",
                                "aired": release_date.strftime("%Y-%m-%d"),
                                "year": str(movie["year"]),
                                "poster": images.get('poster', ''),
                                "fanart": images.get('fanart', ''),
                                "banner": images.get('banner', ''),
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
            _LOGGER.error("Error updating Radarr2 sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False