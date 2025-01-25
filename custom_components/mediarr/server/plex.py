# mediarr/server/plex.py
"""The Plex integration for Mediarr."""

import logging
from datetime import datetime
from plexapi.server import PlexServer
import voluptuous as vol
from homeassistant.const import CONF_TOKEN, CONF_HOST, CONF_PORT
import homeassistant.helpers.config_validation as cv
from ..common.const import CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS
from ..common.sensor import MediarrSensor

_LOGGER = logging.getLogger(__name__)

DEFAULT_HOST = 'localhost'
DEFAULT_PORT = 32400

PLEX_SCHEMA = {
    vol.Required(CONF_TOKEN): cv.string,
    vol.Optional(CONF_HOST, default=DEFAULT_HOST): cv.string,
    vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
    vol.Optional(CONF_MAX_ITEMS, default=DEFAULT_MAX_ITEMS): cv.positive_int,
}

class PlexMediarrSensor(MediarrSensor):
    """Representation of a Plex recently added sensor."""

    def __init__(self, server, max_items):
        """Initialize the sensor."""
        super().__init__()
        self._server = server
        self._max_items = max_items
        self._name = "Plex Mediarr"

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID for the sensor."""
        return f"plex_mediarr_{self._server.machineIdentifier}"

    @classmethod
    async def create_sensors(cls, hass, config):
        """Create Plex sensor entities."""
        try:
            base_url = f"http://{config[CONF_HOST]}:{config[CONF_PORT]}"
            server = await hass.async_add_executor_job(
                lambda: PlexServer(base_url, config[CONF_TOKEN])
            )
            return [cls(server, config[CONF_MAX_ITEMS])]
        except Exception as error:
            _LOGGER.error("Error connecting to Plex server: %s", error)
            return []

    def process_media(self, item, section_type):
        """Process media items from Plex."""
        try:
            if section_type == 'show':
                return self._process_show(item)
            return self._process_movie(item)
        except Exception as e:
            _LOGGER.error("Error processing media item: %s", e)
            return None

    def _process_show(self, item):
        """Process a TV show episode."""
        show_title = getattr(item, 'grandparentTitle', item.title)
        episode_title = getattr(item, 'title', None)
        season_num = getattr(item, 'seasonNumber', None)
        episode_num = getattr(item, 'episodeNumber', None)

        return {
            'title': show_title,
            'episode': episode_title,
            'number': f"S{season_num:02d}E{episode_num:02d}" if season_num and episode_num else None,
            'aired': item.originallyAvailableAt.strftime('%Y-%m-%d') if hasattr(item, 'originallyAvailableAt') and item.originallyAvailableAt else '',
            'added': item.addedAt.strftime('%Y-%m-%d') if hasattr(item, 'addedAt') else '',
            'runtime': int(getattr(item, 'duration', 0) / 60000),
            'type': 'show',
            'poster': getattr(item, 'thumbUrl', None),
            'fanart': getattr(item, 'artUrl', None),
            'key': getattr(item, 'key', None),
            'ratingKey': getattr(item, 'ratingKey', None),
            'summary': getattr(item, 'summary', '')
        }

    def _process_movie(self, item):
        """Process a movie."""
        return {
            'title': getattr(item, 'title', 'Unknown'),
            'year': getattr(item, 'year', ''),
            'added': item.addedAt.strftime('%Y-%m-%d') if hasattr(item, 'addedAt') else '',
            'runtime': int(getattr(item, 'duration', 0) / 60000),
            'type': 'movie',
            'poster': getattr(item, 'thumbUrl', None),
            'fanart': getattr(item, 'artUrl', None),
            'key': getattr(item, 'key', None),
            'ratingKey': getattr(item, 'ratingKey', None),
            'summary': getattr(item, 'summary', '')
        }

    def update(self):
        """Update sensor data."""
        try:
            recently_added = []
            
            for section in self._server.library.sections():
                if section.type in ['show', 'movie']:
                    items = section.recentlyAdded()
                    for item in items:
                        media_data = self.process_media(item, section.type)
                        if media_data:
                            recently_added.append(media_data)

            recently_added.sort(key=lambda x: x.get('added', ''), reverse=True)
            self._state = len(recently_added)
            self._attributes = {'data': recently_added[:self._max_items]}
            self._available = True

        except Exception as err:
            _LOGGER.error("Error updating Plex sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False