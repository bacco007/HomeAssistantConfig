"""Sonarr integration for Mediarr using TMDB images."""
import logging
from datetime import datetime, timedelta
import async_timeout
from zoneinfo import ZoneInfo
from ..common.tmdb_sensor import TMDBMediaSensor

_LOGGER = logging.getLogger(__name__)

class SonarrMediarrSensor(TMDBMediaSensor):
    def __init__(self, session, api_key, url, tmdb_api_key, max_items, days_to_check):
        """Initialize the sensor."""
        super().__init__(session, tmdb_api_key)
        self._sonarr_api_key = api_key
        self._url = url.rstrip('/')
        self._max_items = max_items
        self._days_to_check = days_to_check
        self._name = "Sonarr Mediarr"

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID."""
        return f"sonarr_mediarr_{self._url}"

    def parse_date(self, date_str: str) -> datetime:
        """Parse date string to timezone-aware datetime."""
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        if not dt.tzinfo:
            dt = dt.replace(tzinfo=ZoneInfo('UTC'))
        return dt

    async def async_update(self):
        """Update the sensor."""
        try:
            headers = {'X-Api-Key': self._sonarr_api_key}
            now = datetime.now(ZoneInfo('UTC'))
            params = {
                'start': now.strftime('%Y-%m-%d'),
                'end': (now + timedelta(days=self._days_to_check)).strftime('%Y-%m-%d'),
                'includeSeries': 'true'
            }

            async with async_timeout.timeout(10):
                async with self._session.get(
                    f"{self._url}/api/v3/calendar",
                    headers=headers,
                    params=params
                ) as response:
                    if response.status == 200:
                        upcoming_episodes = await response.json()
                        card_json = []
                        shows_dict = {}

                        for episode in upcoming_episodes:
                            if not episode.get('monitored', False):
                                continue

                            series = episode.get('series', {})
                            if not series.get('monitored', False):
                                continue

                            try:
                                air_date = self._format_date(episode['airDate'])
                                if air_date == 'Unknown' or datetime.strptime(air_date, '%Y-%m-%d').date() < now.date():
                                    continue
                            except ValueError as e:
                                _LOGGER.warning("Error parsing date: %s", e)
                                continue

                            # In sonarr.py, modify the relevant part:
                            series_id = series['id']
                            tvdb_id = series.get('tvdbId')  # Sonarr uses tvdbId

                            # Try to get TMDB ID using the TVDB external ID
                            if tvdb_id:
                                data = await self._fetch_tmdb_data(f"find/{tvdb_id}?external_source=tvdb_id")
                                if data and data.get('tv_results'):
                                    tmdb_id = data['tv_results'][0]['id']
                            else:
                                # Fallback to search if no TVDB ID or conversion fails
                                tmdb_id = await self._search_tmdb(
                                    series['title'],
                                    None,
                                    'tv'
                                )

                            # Get all three image types
                            poster_url, backdrop_url, main_backdrop_url = await self._get_tmdb_images(tmdb_id, 'tv') if tmdb_id else (None, None, None)

                            show_data = {
                                'title': f"{series['title']} - {episode.get('seasonNumber', 0):02d}x{episode.get('episodeNumber', 0):02d}",  # Show with episode number
                                'episode': str(episode.get('title', 'Unknown')),
                                'release': air_date,
                                'number': f"S{episode.get('seasonNumber', 0):02d}E{episode.get('episodeNumber', 0):02d}",
                                'runtime': str(series.get('runtime', 0)),
                                'network': str(series.get('network', 'N/A')),
                                'poster': str(poster_url or ""),
                                'fanart': str(main_backdrop_url or backdrop_url or ""),
                                'banner': str(backdrop_url or ""),
                                'season': str(episode.get('seasonNumber', 0)),
                                'details': f"{series['title']}\n{episode.get('title', 'Unknown')}\nS{episode.get('seasonNumber', 0):02d}E{episode.get('episodeNumber', 0):02d}",
                                'flag': 1
                            }

                            if series_id not in shows_dict or air_date < shows_dict[series_id]['release']:
                                shows_dict[series_id] = show_data

                        upcoming_shows = list(shows_dict.values())
                        upcoming_shows.sort(key=lambda x: x['release'])
                        card_json.extend(upcoming_shows[:self._max_items])

                        if not card_json:
                            card_json.append({
                                'title_default': '$title',
                                'line1_default': '$episode',
                                'line2_default': '$release',
                                'line3_default': '$number',
                                'line4_default': '$runtime - $network',
                                'icon': 'mdi:arrow-down-circle'
                            })

                        self._state = len(upcoming_shows)
                        self._attributes = {'data': card_json}
                        self._available = True
                    else:
                        raise Exception(f"Failed to connect to Sonarr. Status: {response.status}")

        except Exception as err:
            _LOGGER.error("Error updating Sonarr sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False
