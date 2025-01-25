# mediarr/manager/radarr.py
"""Radarr integration for Mediarr."""

import logging
from datetime import datetime
import asyncio
import async_timeout
from ..common.sensor import MediarrSensor

_LOGGER = logging.getLogger(__name__)

class RadarrMediarrSensor(MediarrSensor):
    def __init__(self, session, api_key, url, max_items):
        """Initialize the sensor."""
        super().__init__()
        self._session = session
        self._api_key = api_key
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
            headers = {'X-Api-Key': self._api_key}
            now = datetime.now().astimezone()

            async with async_timeout.timeout(10):
                async with self._session.get(
                    f"{self._url}/api/v3/movie",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        movies = await response.json()
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
                                        _LOGGER.warning("Error parsing date: %s", e)
                                        continue

                            if release_dates:
                                release_dates.sort(key=lambda x: x[1])
                                release_type, release_date = release_dates[0]

                                movie_data = {
                                    "title": movie["title"],
                                    "year": movie["year"],
                                    "poster": f"{self._url}/api/v3/mediacover/{movie['id']}/poster.jpg?apikey={self._api_key}",
                                    "fanart": f"{self._url}/api/v3/mediacover/{movie['id']}/fanart.jpg?apikey={self._api_key}",
                                    "overview": movie["overview"],
                                    "runtime": movie.get("runtime", 0),
                                    "monitored": True,
                                    "releaseDate": release_date.isoformat(),
                                    "releaseType": release_type,
                                    "studio": movie.get("studio", ""),
                                    "genres": movie.get("genres", []),
                                    "ratings": movie.get("ratings", {})
                                }
                                upcoming_movies.append(movie_data)

                        upcoming_movies.sort(key=lambda x: x['releaseDate'])
                        self._state = len(upcoming_movies)
                        self._attributes = {'data': upcoming_movies[:self._max_items]}
                        self._available = True
                    else:
                        raise Exception(f"Failed to connect to Radarr. Status: {response.status}")

        except Exception as err:
            _LOGGER.error("Error updating Radarr sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False