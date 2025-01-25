# mediarr/manager/sonarr.py
"""Sonarr integration for Mediarr."""

import logging
from datetime import datetime, timedelta
import asyncio
import async_timeout
from zoneinfo import ZoneInfo
from ..common.sensor import MediarrSensor

_LOGGER = logging.getLogger(__name__)

class SonarrMediarrSensor(MediarrSensor):
    def __init__(self, session, api_key, url, max_items, days_to_check):
        """Initialize the sensor."""
        super().__init__()
        self._session = session
        self._api_key = api_key
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
            headers = {'X-Api-Key': self._api_key}
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
                        shows_dict = {}

                        for episode in upcoming_episodes:
                            # Process episode data
                            if not episode.get('monitored', False):
                                continue

                            series = episode.get('series', {})
                            if not series.get('monitored', False):
                                continue

                            try:
                                air_date = self.parse_date(episode['airDate'])
                                if air_date < now:
                                    continue
                            except ValueError as e:
                                _LOGGER.warning("Error parsing date: %s", e)
                                continue

                            series_id = series['id']
                            show_data = {
                                'title': series['title'],
                                'episodes': [{
                                    'title': episode.get('title', 'Unknown'),
                                    'number': f"S{episode.get('seasonNumber', 0):02d}E{episode.get('episodeNumber', 0):02d}",
                                    'airdate': episode['airDate'],
                                    'overview': episode.get('overview', '')
                                }],
                                'runtime': series.get('runtime', 0),
                                'network': series.get('network', ''),
                                'poster': f"{self._url}/api/v3/mediacover/{series['id']}/poster.jpg?apikey={self._api_key}",
                                'fanart': f"{self._url}/api/v3/mediacover/{series['id']}/fanart.jpg?apikey={self._api_key}",
                                'airdate': episode['airDate'],
                                'monitored': True,
                                'next_episode': {
                                    'title': episode.get('title', 'Unknown'),
                                    'number': f"S{episode.get('seasonNumber', 0):02d}E{episode.get('episodeNumber', 0):02d}"
                                }
                            }

                            if series_id in shows_dict:
                                shows_dict[series_id]['episodes'].append(show_data['episodes'][0])
                            else:
                                shows_dict[series_id] = show_data

                        upcoming_shows = list(shows_dict.values())
                        upcoming_shows.sort(key=lambda x: self.parse_date(x['airdate']))

                        self._state = len(upcoming_shows)
                        self._attributes = {'data': upcoming_shows[:self._max_items]}
                        self._available = True
                    else:
                        raise Exception(f"Failed to connect to Sonarr. Status: {response.status}")

        except Exception as err:
            _LOGGER.error("Error updating Sonarr sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False