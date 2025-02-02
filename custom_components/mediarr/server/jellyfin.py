"""Jellyfin integration for Mediarr using TMDB images."""
import logging
import aiohttp
import async_timeout
import voluptuous as vol
from pathlib import Path
from homeassistant.const import CONF_TOKEN, CONF_HOST, CONF_PORT
import homeassistant.helpers.config_validation as cv
from ..common.const import CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS
from ..common.tmdb_sensor import TMDBMediaSensor
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)

DEFAULT_HOST = 'localhost'
DEFAULT_PORT = 8096

JELLYFIN_SCHEMA = {
    vol.Required(CONF_TOKEN): cv.string,
    vol.Required('tmdb_api_key'): cv.string,
    vol.Optional(CONF_HOST, default=DEFAULT_HOST): cv.string,
    vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
    vol.Optional(CONF_MAX_ITEMS, default=DEFAULT_MAX_ITEMS): cv.positive_int,
}

class JellyfinMediarrSensor(TMDBMediaSensor):
    """Representation of a Jellyfin recently added sensor using TMDB images."""

    def __init__(self, session, config, user_id):
        """Initialize the sensor."""
        super().__init__(session, config['tmdb_api_key'])
        self._base_url = f"http://{config[CONF_HOST]}:{config[CONF_PORT]}"
        self._jellyfin_token = config[CONF_TOKEN]
        self._max_items = config[CONF_MAX_ITEMS]
        self._name = "Jellyfin Mediarr"
        self._user_id = user_id
        self._session = session
        self._state = 0
        self._attributes = {'data': []}

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID for the sensor."""
        return "jellyfin_mediarr"

    async def _download_and_cache_image(self, url, item_id, image_type):
        """Download and cache an image from Jellyfin."""
        try:
            headers = {
                "Authorization": f'MediaBrowser Token="{self._jellyfin_token}"',
                "Accept": "image/jpeg"
            }
            
            async with async_timeout.timeout(10):
                async with self._session.get(url, headers=headers) as response:
                    if response.status == 200:
                        cache_dir = Path(self.hass.config.path("www/mediarr/cache"))
                        cache_dir.mkdir(parents=True, exist_ok=True)
                        
                        file_name = f"{item_id}_{image_type}.jpg"
                        cached_path = cache_dir / file_name
                        
                        content = await response.read()
                        with open(cached_path, 'wb') as f:
                            f.write(content)
                        _LOGGER.debug("Successfully cached image for %s: %s", item_id, image_type)
                        return f"/local/mediarr/cache/{file_name}"
                    else:
                        _LOGGER.warning("Failed to download image %s for %s: %s", image_type, item_id, response.status)
        except Exception as err:
            _LOGGER.error("Error caching image %s for %s: %s", image_type, item_id, err)
        return None

    def _clean_unused_images(self, current_ids):
        """Clean up cached images that aren't in the current item list."""
        try:
            cache_dir = Path(self.hass.config.path("www/mediarr/cache"))
            if not cache_dir.exists():
                return

            for image_file in cache_dir.glob("*.jpg"):
                item_id = image_file.stem.split('_')[0]
                if item_id not in current_ids:
                    try:
                        image_file.unlink()
                        _LOGGER.debug("Removed unused image: %s", image_file.name)
                    except Exception as err:
                        _LOGGER.error("Error removing image %s: %s", image_file.name, err)
        except Exception as err:
            _LOGGER.error("Error cleaning cached images: %s", err)

    async def _get_jellyfin_images(self, item_id):
        """Get and cache images from Jellyfin."""
        base_img_url = f"{self._base_url}/Items/{item_id}/Images"
        poster_url = f"{base_img_url}/Primary"
        backdrop_url = f"{base_img_url}/Backdrop"

        try:
            cached_poster = await self._download_and_cache_image(poster_url, item_id, "poster")
            cached_backdrop = await self._download_and_cache_image(backdrop_url, item_id, "backdrop")
            
            if cached_poster or cached_backdrop:
                _LOGGER.debug("Successfully cached images for item %s", item_id)
            return cached_poster, cached_backdrop, cached_backdrop
        except Exception as err:
            _LOGGER.error("Error getting Jellyfin images: %s", err)
        return None, None, None

    async def _get_libraries(self):
        """Fetch movie and TV show libraries."""
        url = f"{self._base_url}/Users/{self._user_id}/Views"
        headers = {
            "Authorization": f'MediaBrowser Token="{self._jellyfin_token}"',
            "Accept": "application/json"
        }

        libraries = {'movies': [], 'tvshows': []}
        
        try:
            async with async_timeout.timeout(10):
                async with self._session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        for lib in data['Items']:
                            if lib['CollectionType'] == 'movies':
                                libraries['movies'].append(lib['Id'])
                            elif lib['CollectionType'] == 'tvshows':
                                libraries['tvshows'].append(lib['Id'])
                        return libraries
        except Exception as err:
            _LOGGER.error("Error fetching libraries: %s", err)
        return libraries

    async def _fetch_recently_added(self, library_id):
        """Fetch recently added items from a library."""
        url = f"{self._base_url}/Users/{self._user_id}/Items/Latest"
        params = {
            "ParentId": library_id,
            "Limit": self._max_items,
            "Fields": "ProviderIds,Overview,PremiereDate,RunTimeTicks,Genres,ParentIndexNumber,IndexNumber,SeriesName,SeriesId,ProductionYear",
            "EnableImages": "true",
            "ImageTypeLimit": 1
        }
        headers = {
            "Authorization": f'MediaBrowser Token="{self._jellyfin_token}"',
            "Accept": "application/json"
        }

        try:
            async with async_timeout.timeout(10):
                async with self._session.get(url, params=params, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    return []
        except Exception as err:
            _LOGGER.error("Error fetching recently added items: %s", err)
            return []

    async def _process_item(self, item):
        """Process a single item from Jellyfin."""
        try:
            is_episode = item.get('Type') == 'Episode'
            item_id = item.get('Id')
            
            if is_episode:
                # Get TMDB ID for the series
                series_name = str(item.get('SeriesName', '')).strip()
                tmdb_id = item.get('ProviderIds', {}).get('Tmdb')
                if not tmdb_id:
                    tmdb_id = await self._search_tmdb(series_name, None, 'tv')
                    if not tmdb_id:
                        clean_title = series_name.split('(')[0].strip()
                        tmdb_id = await self._search_tmdb(clean_title, None, 'tv')
                
                # Try TMDB images first
                poster_url = backdrop_url = main_backdrop_url = None
                if tmdb_id:
                    poster_url, backdrop_url, main_backdrop_url = await self._get_tmdb_images(tmdb_id, 'tv')
                
                # Fallback to Jellyfin images if needed
                if not (poster_url and backdrop_url and main_backdrop_url):
                    poster_url, backdrop_url, main_backdrop_url = await self._get_jellyfin_images(item_id)
                
                return {
                    'title': str(item.get('SeriesName', '')),
                    'episode': str(item.get('Name', '')),
                    'release': self._format_date(item.get('PremiereDate')),
                    'number': f"S{item.get('ParentIndexNumber', 0):02d}E{item.get('IndexNumber', 0):02d}",
                    'runtime': str(int(item.get('RunTimeTicks', 0)) // 600000000),
                    'genres': ', '.join(str(g) for g in item.get('Genres', [])),
                    'poster': str(poster_url or ""),
                    'fanart': str(main_backdrop_url or backdrop_url or ""),
                    'banner': str(backdrop_url or ""),
                    'flag': 1
                }
            else:
                # Process movie
                title = str(item.get('Name', '')).strip()
                year = item.get('ProductionYear')
                
                # Try TMDB ID from provider IDs first
                tmdb_id = item.get('ProviderIds', {}).get('Tmdb')
                if not tmdb_id:
                    tmdb_id = await self._search_tmdb(title, year, 'movie')
                    if not tmdb_id:
                        clean_title = title.split('(')[0].strip()
                        tmdb_id = await self._search_tmdb(clean_title, None, 'movie')
                
                # Try TMDB images first
                poster_url = backdrop_url = main_backdrop_url = None
                if tmdb_id:
                    poster_url, backdrop_url, main_backdrop_url = await self._get_tmdb_images(tmdb_id, 'movie')
                
                # Fallback to Jellyfin images if needed
                if not (poster_url and backdrop_url and main_backdrop_url):
                    poster_url, backdrop_url, main_backdrop_url = await self._get_jellyfin_images(item_id)
                
                return {
                    'title': str(item.get('Name', 'Unknown')),
                    'episode': str(item.get('Overview', 'N/A')[:100] + '...' if item.get('Overview') else 'N/A'),
                    'release': self._format_date(item.get('PremiereDate')),
                    'number': str(item.get('ProductionYear', '')),
                    'runtime': str(int(item.get('RunTimeTicks', 0)) // 600000000),
                    'genres': ', '.join(str(g) for g in item.get('Genres', [])),
                    'poster': str(poster_url or ""),
                    'fanart': str(main_backdrop_url or backdrop_url or ""),
                    'banner': str(backdrop_url or ""),
                    'flag': 1
                }
            
        except Exception as err:
            _LOGGER.error("Error processing item: %s", err)
            return None

    async def async_update(self):
        """Update sensor data."""
        try:
            recently_added = []
            current_item_ids = set()
            libraries = await self._get_libraries()
            
            # Get all libraries (both movies and TV)
            all_libraries = libraries['movies'] + libraries['tvshows']
            
            # Fetch recent items from all libraries
            for library_id in all_libraries:
                items = await self._fetch_recently_added(library_id)
                for item in items:
                    processed = await self._process_item(item)
                    if processed:
                        item_id = item.get('Id')
                        if item_id:
                            current_item_ids.add(item_id)
                        recently_added.append(processed)

            # Clean up unused cached images
            self._clean_unused_images(current_item_ids)

            # Sort and update state
            recently_added.sort(key=lambda x: x.get('release', ''), reverse=True)
            recently_added = recently_added[:self._max_items]

            if recently_added:
                self._state = len(recently_added)
                self._attributes = {'data': recently_added}
            else:
                self._state = 0
                self._attributes = {'data': [{
                    'title_default': '$title',
                    'line1_default': '$episode',
                    'line2_default': '$release',
                    'line3_default': '$number - $rating - $runtime',
                    'line4_default': '$genres',
                    'icon': 'mdi:eye-off'
                }]}
            
            self._available = True

        except Exception as err:
            _LOGGER.error("Error updating Jellyfin sensor: %s", err)
            self._state = 0
            self._attributes = {'data': []}
            self._available = False

    @classmethod
    async def create_sensors(cls, hass, config):
        """Create a single Jellyfin sensor for all libraries."""
        try:
            base_url = f"http://{config[CONF_HOST]}:{config[CONF_PORT]}"
            token = config[CONF_TOKEN]

            headers = {
                "Authorization": f'MediaBrowser Token="{token}"',
                "Accept": "application/json"
            }
            
            url = f"{base_url}/Users"
            async with aiohttp.ClientSession() as session:
                async with async_timeout.timeout(10):
                    async with session.get(url, headers=headers) as response:
                        if response.status != 200:
                            raise Exception(f"Error fetching user info: {response.status}")
                        users = await response.json()
                        if not users:
                            raise Exception("No users found")
                        user = next((u for u in users if u.get('Policy', {}).get('IsAdministrator')), users[0])
                        user_id = user['Id']

            return [cls(async_get_clientsession(hass), config, user_id)]

        except Exception as error:
            _LOGGER.error("Error initializing Jellyfin sensors: %s", error)
            return []