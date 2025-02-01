"""Plex integration for Mediarr using TMDB images."""
import logging
import xml.etree.ElementTree as ET
import aiohttp
import async_timeout
import voluptuous as vol
from homeassistant.const import CONF_TOKEN, CONF_HOST, CONF_PORT
import homeassistant.helpers.config_validation as cv
from ..common.const import CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS
from ..common.tmdb_sensor import TMDBMediaSensor
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)

DEFAULT_HOST = 'localhost'
DEFAULT_PORT = 32400

PLEX_SCHEMA = {
    vol.Required(CONF_TOKEN): cv.string,
    vol.Required('tmdb_api_key'): cv.string,
    vol.Optional(CONF_HOST, default=DEFAULT_HOST): cv.string,
    vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
    vol.Optional(CONF_MAX_ITEMS, default=DEFAULT_MAX_ITEMS): cv.positive_int,
}

class PlexMediarrSensor(TMDBMediaSensor):
    """Representation of a Plex recently added sensor using TMDB images."""

    def __init__(self, session, config, sections):
        """Initialize the sensor."""
        super().__init__(session, config['tmdb_api_key'])
        self._base_url = f"http://{config[CONF_HOST]}:{config[CONF_PORT]}"
        self._token = config[CONF_TOKEN]
        self._max_items = config[CONF_MAX_ITEMS]
        self._name = "Plex Mediarr"
        self._sections = sections
        self._session = session

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID for the sensor."""
        return "plex_mediarr"

    async def _fetch_recently_added(self, section_id):
        """Fetch recently added items from a Plex section."""
        url = f"{self._base_url}/library/sections/{section_id}/recentlyAdded"
        headers = {"X-Plex-Token": self._token}
        try:
            async with async_timeout.timeout(10):
                async with self._session.get(url, headers=headers) as response:
                    if response.status == 200:
                        xml_content = await response.text()
                        return ET.fromstring(xml_content)
                    else:
                        raise Exception(f"Failed to fetch recently added: {response.status}")
        except Exception as err:
            _LOGGER.error("Error fetching recently added: %s", err)
            return None

    async def _get_metadata(self, rating_key):
        """Fetch detailed metadata for an item."""
        try:
            url = f"{self._base_url}/library/metadata/{rating_key}"
            headers = {"X-Plex-Token": self._token}
            async with async_timeout.timeout(5):
                async with self._session.get(url, headers=headers) as response:
                    if response.status == 200:
                        xml_content = await response.text()
                        return ET.fromstring(xml_content)
                    return None
        except Exception as error:
            _LOGGER.error("Error fetching metadata: %s", error)
            return None

    async def _process_item(self, item):
        """Process a single Plex item and get TMDB images."""
        try:
            is_episode = item.get('type') == 'episode'
            
            if is_episode:
                show_title = item.get('grandparentTitle', '')
                episode_title = item.get('title', '')
                season_number = item.get('parentIndex', '')
                episode_number = item.get('index', '')
                
                show_guid = item.get('grandparentGuid', '')
                tmdb_id = None
                
                if show_guid and 'themoviedb://' in show_guid:
                    tmdb_id = show_guid.split('themoviedb://')[1].split('?')[0]
                
                if not tmdb_id:
                    tmdb_id = await self._search_tmdb(
                        show_title,
                        None,
                        'tv'
                    )

                # Get different images for the show
                poster_url, backdrop_url, main_backdrop_url = await self._get_tmdb_images(tmdb_id, 'tv') if tmdb_id else (None, None, None)

                number = f"S{int(season_number):02d}E{int(episode_number):02d}" if season_number and episode_number else str(episode_number)
                air_date = self._format_date(item.get('originallyAvailableAt', 'Unknown'))

                return {
                    'title': str(show_title),
                    'episode': str(episode_title),
                    'release': air_date,
                    'number': number,
                    'runtime': str(int(item.get('duration', 0)) // 60000),
                    'genres': ', '.join(str(genre.get('tag', '')) for genre in item.findall('.//Genre')),
                    'poster': str(poster_url or ""),  # Thumbnail in list
                    'fanart': str(main_backdrop_url or backdrop_url or ""),  # Main display image
                    'banner': str(backdrop_url or ""),  # Additional image if needed
                    'flag': 1
                }
            else:
                # Process movie
                guid = item.get('guid', '')
                tmdb_id = None
                
                if guid and 'themoviedb://' in guid:
                    tmdb_id = guid.split('themoviedb://')[1].split('?')[0]
                
                if not tmdb_id:
                    tmdb_id = await self._search_tmdb(
                        str(item.get('title', '')),
                        item.get('year'),
                        'movie'
                    )

                # Get different images for the movie
                poster_url, backdrop_url, main_backdrop_url = await self._get_tmdb_images(tmdb_id, 'movie') if tmdb_id else (None, None, None)
                release_date = self._format_date(item.get('originallyAvailableAt', 'Unknown'))

                return {
                    'title': str(item.get('title', 'Unknown')),
                    'episode': str(item.get('summary', 'N/A')[:100] + '...' if item.get('summary') else 'N/A'),
                    'release': release_date,
                    'number': str(item.get('year', '')),
                    'runtime': str(int(item.get('duration', 0)) // 60000),
                    'genres': ', '.join(str(genre.get('tag', '')) for genre in item.findall('.//Genre')),
                    'poster': str(poster_url or ""),  # Thumbnail in list
                    'fanart': str(main_backdrop_url or backdrop_url or ""),  # Main display image
                    'banner': str(backdrop_url or ""),  # Additional image if needed
                    'flag': 1
                }
            

        except Exception as err:
            _LOGGER.error("Error processing Plex item: %s", err)
            return None

    async def async_update(self):
        """Update sensor data."""
        try:
            recently_added = []
            card_json = []

            for section_id in self._sections:
                try:
                    data = await self._fetch_recently_added(section_id)
                    if data is not None:
                        for item in data.findall(".//Video"):
                            processed_item = await self._process_item(item)
                            if processed_item:
                                recently_added.append(processed_item)

                except Exception as section_err:
                    _LOGGER.error("Error updating section %s: %s", section_id, section_err)

            recently_added.sort(key=lambda x: x.get('release', ''), reverse=True)
            card_json.extend(recently_added[:self._max_items])

            if not card_json:
                card_json.append({
                    'title_default': '$title',
                    'line1_default': '$episode',
                    'line2_default': '$release',
                    'line3_default': '$number - $rating - $runtime',
                    'line4_default': '$genres',
                    'icon': 'mdi:eye-off'
                })

            self._state = len(recently_added)
            self._attributes = {'data': card_json}
            self._available = True

        except Exception as err:
            _LOGGER.error("Error updating Plex sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False

    @classmethod
    async def create_sensors(cls, hass, config):
        """Create a single Plex sensor for all sections."""
        try:
            base_url = f"http://{config[CONF_HOST]}:{config[CONF_PORT]}"
            token = config[CONF_TOKEN]

            # Fetch sections
            url = f"{base_url}/library/sections"
            headers = {"X-Plex-Token": token, "Accept": "application/xml"}
            
            async with aiohttp.ClientSession() as session:
                async with async_timeout.timeout(10):
                    async with session.get(url, headers=headers) as response:
                        if response.status != 200:
                            raise Exception(f"Error fetching library sections: {response.status}")
                        xml_content = await response.text()

            # Parse XML
            root = ET.fromstring(xml_content)
            sections = [directory.get("key") for directory in root.findall(".//Directory") 
                       if directory.get("key")]

            return [cls(async_get_clientsession(hass), config, sections)]

        except Exception as error:
            _LOGGER.error("Error initializing Plex sensors: %s", error)
            return []