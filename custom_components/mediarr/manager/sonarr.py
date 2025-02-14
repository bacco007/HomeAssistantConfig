"""Sonarr integration for Mediarr."""
from ..common.sensor import MediarrSensor 
from datetime import datetime, timedelta 
import async_timeout 
from zoneinfo import ZoneInfo 
import logging


_LOGGER = logging.getLogger(__name__)

class SonarrMediarrSensor(MediarrSensor):
    def __init__(self, session, api_key, url, max_items, days_to_check):
        """Initialize the sensor."""
        self._session = session
        self._sonarr_api_key = api_key
        self._url = url.rstrip('/')
        self._max_items = max_items
        self._days_to_check = days_to_check
        self._name = "Sonarr Mediarr"
        self._state = 0
        
        

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID."""
        return f"sonarr_mediarr_{self._url}"

    def _format_date(self, date_str: str) -> str:
        """Format date string."""
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').strftime('%Y-%m-%d')
        except ValueError:
            return 'Unknown'

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
                            series = episode.get('series', {})
                            air_date = self._format_date(episode['airDate'])
                            
                            if air_date == 'Unknown':
                                continue

                            series_id = series['id']
                            images = {img['coverType']: img['remoteUrl'] for img in series.get('images', [])}
                            
                            show_data = {
                                'title': f"{series['title']} - {episode.get('seasonNumber', 0):02d}x{episode.get('episodeNumber', 0):02d}",
                                'episode': str(episode.get('title', 'Unknown')),
                                'release': air_date,
                                'number': f"S{episode.get('seasonNumber', 0):02d}E{episode.get('episodeNumber', 0):02d}",
                                'runtime': str(series.get('runtime', 0)),
                                'network': str(series.get('network', 'N/A')),
                                'poster': images.get('poster', ''),
                                'fanart': images.get('fanart', ''),
                                'banner': images.get('banner', ''),
                                'season': str(episode.get('seasonNumber', 0)),
                                'details': f"{series['title']}\n{episode.get('title', 'Unknown')}\nS{episode.get('seasonNumber', 0):02d}E{episode.get('episodeNumber', 0):02d}",
                                'flag': 1
                            }

                            # Take earliest episode air date for each series
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
