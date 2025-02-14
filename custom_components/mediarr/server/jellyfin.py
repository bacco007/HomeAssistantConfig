"""Jellyfin integration for Mediarr using TMDB images with WebSocket updates."""
import logging
import json
import aiohttp
import asyncio
import aiofiles
import async_timeout
import voluptuous as vol
from datetime import timedelta
from pathlib import Path
from homeassistant.const import CONF_TOKEN, CONF_URL
import homeassistant.helpers.config_validation as cv
from ..common.const import CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS
from ..common.tmdb_sensor import TMDBMediaSensor
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.core import callback
from homeassistant.helpers.event import async_track_time_interval

_LOGGER = logging.getLogger(__name__)


UPDATE_INTERVAL = timedelta(minutes=1)


JELLYFIN_SCHEMA = {
     vol.Required(CONF_TOKEN): cv.string,
     vol.Required('tmdb_api_key'): cv.string,
     vol.Required(CONF_URL): cv.url,
     vol.Optional(CONF_MAX_ITEMS, default=DEFAULT_MAX_ITEMS): cv.positive_int,
}

class JellyfinWebSocket:
    """Jellyfin WebSocket client."""

    def __init__(self, sensor, server_url, token, user_id):
        """Initialize the WebSocket client."""
        self._sensor = sensor
        self._ws = None
        self._base_url = server_url.replace('http', 'ws', 1)
        self._token = token
        self._user_id = user_id
        self._connected = False
        self._session = None
        self._hass = sensor.hass
        self._retry_task = None
        self._connection_retry_count = 0
        self._disconnect_handle = None
        self._scheduled_retry = None

    async def connect(self):
        """Connect to the Jellyfin WebSocket."""
        if self._connected:
            return

        try:
            if not self._session:
                self._session = aiohttp.ClientSession()
                
            headers = {
                "Authorization": f'MediaBrowser Token="{self._token}"'
            }
            
            url = f"{self._base_url}/socket?api_key={self._token}&deviceId=mediarr"
            self._ws = await self._session.ws_connect(url, headers=headers, heartbeat=30)
            self._connected = True
            self._connection_retry_count = 0
            
            # Send initial messages required by Jellyfin
            await self._ws.send_str(json.dumps({
                "MessageType": "SessionsStart",
                "Data": "0,1500"
            }))

            _LOGGER.info("Connected to Jellyfin WebSocket")
            
            # Start listening for messages
            self._hass.async_create_task(self._listen())
            
        except Exception as err:
            _LOGGER.error("WebSocket connection failed: %s", err)
            self._connected = False
            await self.cleanup()
            await self._schedule_reconnect()

    async def _schedule_reconnect(self):
        """Schedule a reconnection attempt with exponential backoff."""
        if self._scheduled_retry:
            self._scheduled_retry.cancel()

        if self._connection_retry_count < 5:  # Maximum retry limit
            delay = min(30, 2 ** self._connection_retry_count)
            self._connection_retry_count += 1
            _LOGGER.info(f"Scheduling reconnection attempt in {delay} seconds...")
            self._scheduled_retry = self._hass.loop.call_later(
                delay, lambda: self._hass.async_create_task(self.connect())
            )

    async def _listen(self):
        """Listen for WebSocket messages."""
        try:
            async with async_timeout.timeout(30):  # Add timeout
                async for msg in self._ws:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        data = json.loads(msg.data)
                        
                        # Handle different message types
                        if data.get("MessageType") == "Library":
                            # Library changed, trigger an update
                            if "ItemsAdded" in data.get("Data", {}) or "ItemsRemoved" in data.get("Data", {}):
                                _LOGGER.debug("Library changed, triggering update")
                                await self._sensor.async_update()
                                
                        elif data.get("MessageType") == "ForceKeepAlive":
                            # Respond to keep-alive messages
                            await self._ws.send_str(json.dumps({
                                "MessageType": "KeepAlive"
                            }))
                    elif msg.type in (aiohttp.WSMsgType.CLOSED, aiohttp.WSMsgType.ERROR):
                        _LOGGER.warning("WebSocket connection closed or error")
                        break

        except asyncio.TimeoutError:
            _LOGGER.warning("WebSocket listener timeout")
        except Exception as err:
            _LOGGER.error("WebSocket listener error: %s", err)
        finally:
            self._connected = False
            await self.cleanup()
            await self._schedule_reconnect()

    async def cleanup(self):
        """Clean up WebSocket resources."""
        self._connected = False
        if self._scheduled_retry:
            self._scheduled_retry.cancel()
            self._scheduled_retry = None
            
        if self._ws and not self._ws.closed:
            await self._ws.close()
            
        if self._session:
            await self._session.close()
            self._session = None

class JellyfinMediarrSensor(TMDBMediaSensor):
    """Representation of a Jellyfin recently added sensor using TMDB images."""

    def __init__(self, hass, session, config, user_id):
        """Initialize the sensor."""
        super().__init__(session, config['tmdb_api_key'])
        self.hass = hass
        self._base_url = config[CONF_URL].rstrip('/')
        self._jellyfin_token = config[CONF_TOKEN]
        self._max_items = config[CONF_MAX_ITEMS]
        self._name = "Jellyfin Mediarr"
        self._user_id = user_id
        self._session = session
        self._state = 0
        self._attributes = {'data': []}
        self._ws_client = None
        self._config = config
        self._available = True
        self._remove_update_interval = None

    

    @callback
    def _update_callback(self, now):
        """Handle the update interval callback."""
        self.hass.loop.create_task(self.async_update())

    async def async_added_to_hass(self):
        """Handle entity which will be added."""
        await super().async_added_to_hass()
        
        # Do an initial update
        await self.async_update()
        
        # Initialize WebSocket client
        self._ws_client = JellyfinWebSocket(
            self,
            self._base_url,
            self._jellyfin_token,
            self._user_id
        )
        await self._ws_client.connect()

        # Set up periodic updates as fallback
        self._remove_update_interval = async_track_time_interval(
            self.hass, 
            self._update_callback,  # Use the callback method
            UPDATE_INTERVAL
        )

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID for the sensor."""
        return "jellyfin_mediarr"

    @property
    def available(self):
        """Return True if entity is available."""
        return self._available

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def extra_state_attributes(self):
        """Return the state attributes."""
        return self._attributes

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
                        
                        # Use aiofiles for async file operations
                        async with aiofiles.open(cached_path, 'wb') as f:
                            await f.write(content)
                            
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
            "Fields": "ProviderIds,Overview,PremiereDate,RunTimeTicks,Genres,ParentIndexNumber,IndexNumber,SeriesName,SeriesId,ProductionYear,DateCreated",  # Added DateCreated
            "EnableImages": "true",
            "ImageTypeLimit": 1,
            "SortBy": "DateCreated,SortName",  # Changed primary sort to DateCreated
            "SortOrder": "Descending"
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
            date_added = item.get('DateCreated', '')  # Get the date added
            
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
                    'added': self._format_date(date_added),  # Add date_added
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
                    'added': self._format_date(date_added),  # Add date_added
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
            show_episodes = {}  # Dictionary to track episodes per show
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
                        
                        # Handle TV show episodes differently for grouping
                        if 'S' in processed.get('number', ''):  # It's a TV episode
                            show_title = processed['title']
                            if show_title not in show_episodes:
                                show_episodes[show_title] = {
                                    **processed,
                                    'episodes': [processed['number']],
                                    'added_at': processed.get('added', '')  # Use added date instead of release
                                }
                            else:
                                show_episodes[show_title]['episodes'].append(processed['number'])
                                # Update if this episode was added more recently
                                if processed.get('added', '') > show_episodes[show_title]['added_at']:
                                    show_episodes[show_title]['added_at'] = processed.get('added', '')
                                    show_episodes[show_title]['episode'] = processed['episode']
                                    show_episodes[show_title]['number'] = processed['number']
                        else:
                            recently_added.append(processed)

            # Process grouped shows
            for show_data in show_episodes.values():
                episode_count = len(show_data['episodes'])
                if episode_count > 1:
                    show_data['episode'] = f"{episode_count} new episodes ({show_data['number']})"
                del show_data['episodes']  # Remove the episodes list before adding to final results
                recently_added.append(show_data)

            # Clean up unused cached images
            self._clean_unused_images(current_item_ids)

            # Sort by added date instead of release date
            recently_added.sort(key=lambda x: x.get('added', ''), reverse=True)
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
            token = config[CONF_TOKEN]
            headers = {
                "Authorization": f'MediaBrowser Token="{token}"',
                "Accept": "application/json"
            }
            
            url = f"{config[CONF_URL].rstrip('/')}/Users"
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

            return [cls(hass, async_get_clientsession(hass), config, user_id)]

        except Exception as error:
            _LOGGER.error("Error initializing Jellyfin sensors: %s", error)
            return []


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the Jellyfin sensor."""
    sensors = await JellyfinMediarrSensor.create_sensors(hass, config)
    async_add_entities(sensors, True)
    