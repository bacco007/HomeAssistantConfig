import logging
import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
import aiohttp
import urllib.parse
import async_timeout

_LOGGER = logging.getLogger(__name__)

from ..common.const import (
    ATTR_REQUEST_NAME,
    ATTR_REQUEST_SEASON,
    ATTR_REQUEST_ID,
    ATTR_REQUEST_STATUS,
    ATTR_REQUEST_TYPE,
    DEFAULT_REQUEST_SEASON,
    SERVICE_MOVIE_REQUEST,
    SERVICE_TV_REQUEST,
    SERVICE_UPDATE_REQUEST,
    REQUEST_STATUS_APPROVED,
    REQUEST_STATUS_DECLINED,
    REQUEST_STATUS_REMOVE,
    SEER_TV_DETAILS_ENDPOINT,
    SEARCH_TYPE_MOVIE,
    SEARCH_TYPE_TV,
)

# Schema Definitions
MOVIE_REQUEST_SCHEMA = vol.Schema({
    vol.Required(ATTR_REQUEST_NAME): cv.string,
})

TV_REQUEST_SCHEMA = vol.Schema({
    vol.Required(ATTR_REQUEST_NAME): cv.string,
    vol.Optional(ATTR_REQUEST_SEASON, default=DEFAULT_REQUEST_SEASON): vol.In(
        ["first", "latest", "all"]
    ),
})

# New combined schema for update/remove  
UPDATE_REQUEST_SCHEMA = vol.Schema({
    vol.Required(ATTR_REQUEST_NAME): cv.string,
    vol.Required(ATTR_REQUEST_TYPE): vol.In(["movie", "tv"]),
    vol.Required(ATTR_REQUEST_STATUS): vol.In([
        REQUEST_STATUS_APPROVED,  
        REQUEST_STATUS_DECLINED,
        REQUEST_STATUS_REMOVE,
    ]),
    vol.Optional(ATTR_REQUEST_ID): cv.positive_int,
})


class SeerRequestHandler:
    """Handler for Jellyseerr/Overseerr requests."""

    def __init__(self, hass: HomeAssistant, url: str, api_key: str):
        """Initialize the request handler."""
        self.hass = hass
        self._url = url.rstrip('/')
        self._api_key = api_key
        self._session = aiohttp.ClientSession()
        self._headers = {'X-Api-Key': self._api_key}

    async def async_search_media(self, query: str, media_type: str = None) -> dict:
        """Search for media in Jellyseerr/Overseerr."""
        try:
            # URL encode the query properly
            encoded_query = urllib.parse.quote(query)
            params = {'query': encoded_query}
            search_url = f"{self._url}/api/v1/search"
                
            _LOGGER.debug("Searching with URL: %s, params: %s", search_url, params)
                
            async with async_timeout.timeout(10):
                async with self._session.get(search_url, headers=self._headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        _LOGGER.debug("Search response: %s", data)
                        if data and data.get('results'):
                            if media_type:
                                filtered = [r for r in data['results'] if r.get('mediaType') == media_type]
                                _LOGGER.debug("Filtered results for type %s: %s", media_type, filtered)
                                if filtered:
                                    return filtered[0]
                            return data['results'][0]
                    return None
        except Exception as err:
            _LOGGER.error("Error searching for media: %s", err)
            return None
        
    async def async_find_request_by_title(self, title: str, media_type: str = None) -> dict:
        """Find a request by title and optionally media type."""
        # First check sensor data
        try:
            for entity_id in self.hass.states.async_entity_ids("sensor"):
                if "seer_mediarr" in entity_id:
                    state = self.hass.states.get(entity_id)
                    if state and state.attributes.get("data"):
                        for item in state.attributes["data"]:
                            current_title = item.get("title", "").lower().strip()
                            if current_title == title.lower().strip():
                                # If we have a request_id, return a request-like structure
                                if item.get("request_id"):
                                    return {
                                        "id": item["request_id"],
                                        "media": {
                                            "title": item["title"],
                                            "mediaType": item["type"].lower()
                                        }
                                    }
        except Exception as err:
            _LOGGER.error("Error checking sensor data: %s", err)

        # If not found in sensor data, fall back to API search
        try:
            url = f"{self._url}/api/v1/request"
            async with async_timeout.timeout(10):
                async with self._session.get(url, headers=self._headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        for request in data.get('results', []):
                            media = request.get('media', {})
                            current_title = media.get('title', '').lower().strip()
                            current_type = media.get('mediaType', '').lower()
                            
                            if current_title == title.lower().strip():
                                if not media_type or current_type == media_type.lower():
                                    return request
                        _LOGGER.debug("Request not found in API data")
                        return None
                    else:
                        _LOGGER.error("Failed to fetch requests from API. Status: %s", response.status)
                        return None
        except Exception as err:
            _LOGGER.error("Error searching API for request: %s", err)
            return None
    
    async def async_update_request(self, call: ServiceCall) -> bool:
        """Handle request status update service calls."""
        name = call.data[ATTR_REQUEST_NAME]
        media_type = call.data[ATTR_REQUEST_TYPE]
        new_status = call.data[ATTR_REQUEST_STATUS]
        request_id = call.data.get(ATTR_REQUEST_ID)

        try:
            if not request_id:
                # First check if we can find the request in sensor data
                request = await self.async_find_request_by_title(name, media_type)
                if not request:
                    _LOGGER.error("Could not find request for: %s", name)
                    return False
                request_id = request.get('id')

            # If this is a remove request
            if new_status == REQUEST_STATUS_REMOVE:
                # Handle removal
                url = f"{self._url}/api/v1/request/{request_id}"
                async with async_timeout.timeout(10):
                    async with self._session.delete(url, headers=self._headers) as response:
                        success = response.status in [200, 204]
                        if success:
                            _LOGGER.info("Successfully removed request for: %s", name)
                        else:
                            response_text = await response.text()
                            _LOGGER.error("Failed to remove request. Status: %s, Response: %s", 
                                        response.status, response_text)
                        return success
            else:
                # Convert status to endpoint action
                status_mapping = {
                    REQUEST_STATUS_APPROVED: "approve",
                    REQUEST_STATUS_DECLINED: "decline"
                }
                status_value = status_mapping.get(new_status)
                
                if not status_value:
                    _LOGGER.error("Invalid status: %s. Must be 'approve' or 'decline'", new_status)
                    return False
                    
                url = f"{self._url}/api/v1/request/{request_id}/{status_value}"
                
                async with async_timeout.timeout(10):
                    async with self._session.post(url, headers=self._headers) as response:
                        success = response.status in [200, 201, 202]
                        if success:
                            _LOGGER.info("Successfully updated request status for: %s", name)
                        else:
                            response_text = await response.text()
                            _LOGGER.error("Failed to update request status. Status: %s, Response: %s", 
                                        response.status, response_text)
                        return success

        except Exception as err:
            _LOGGER.error("Error updating request: %s - Error: %s", name, err)
            return False

    async def async_request_movie(self, call: ServiceCall) -> bool:
        """Handle movie request service calls."""
        name = call.data[ATTR_REQUEST_NAME]
        movie = await self.async_search_media(name, SEARCH_TYPE_MOVIE)
        if not movie:
            _LOGGER.error("No movie found with name: %s", name)
            return False

        request_data = {
            "mediaType": "movie",
            "mediaId": movie['id']
        }
        
        url = f"{self._url}/api/v1/request"
        headers = {**self._headers, 'Content-Type': 'application/json'}
        
        try:
            async with async_timeout.timeout(10):
                async with self._session.post(url, headers=headers, json=request_data) as response:
                    success = response.status in [200, 201, 202]
                    if success:
                        _LOGGER.info("Successfully requested movie: %s", name)
                    else:
                        response_text = await response.text()
                        _LOGGER.error("Failed to request movie. Status: %s, Response: %s", 
                                    response.status, response_text)
                    return success
        except Exception as err:
            _LOGGER.error("Error requesting movie: %s - Error: %s", name, err)
            return False

    async def async_request_tv(self, call: ServiceCall) -> bool:
        """Handle TV show request service calls."""
        name = call.data[ATTR_REQUEST_NAME]
        season = call.data.get(ATTR_REQUEST_SEASON, DEFAULT_REQUEST_SEASON)
        
        show = await self.async_search_media(name, SEARCH_TYPE_TV)
        if not show:
            _LOGGER.error("No TV show found with name: %s", name)
            return False
        
        # Convert season selection to API format
        if season == "all":
            seasons = "all"
        elif season == "latest":
            # Get all seasons to find latest
            url = f"{self._url}/api/v1/tv/{show['id']}"
            async with async_timeout.timeout(10):
                async with self._session.get(url, headers=self._headers) as response:
                    if response.status == 200:
                        details = await response.json()
                        latest = max((s["seasonNumber"] for s in details.get("seasons", [])), default=1)
                        seasons = [latest]
                    else:
                        seasons = [1]
        else:  # first
            seasons = [1]
        
        request_data = {
            "mediaType": "tv",
            "mediaId": show['id'],
            "seasons": seasons
        }
        
        url = f"{self._url}/api/v1/request"
        headers = {**self._headers, 'Content-Type': 'application/json'}
        
        try:
            async with async_timeout.timeout(10):
                async with self._session.post(url, headers=headers, json=request_data) as response:
                    success = response.status in [200, 201, 202]
                    if success:
                        _LOGGER.info("Successfully requested TV show: %s (Season: %s)", name, season)
                    else:
                        response_text = await response.text()
                        _LOGGER.error("Failed to request TV show. Status: %s, Response: %s", 
                                    response.status, response_text)
                    return success
        except Exception as err:
            _LOGGER.error("Error requesting TV show: %s - Error: %s", name, err)
            return False

    async def async_get_tv_details(self, tv_id: int) -> dict:
        """Get TV show details including seasons."""
        try:
            url = f"{self._url}{SEER_TV_DETAILS_ENDPOINT}/{tv_id}"
            async with async_timeout.timeout(10):
                async with self._session.get(url, headers=self._headers) as response:
                    if response.status == 200:
                        return await response.json()
                    return None
        except Exception as err:
            _LOGGER.error("Error getting TV details: %s", err)
            return None

    async def close(self):
        """Close the session."""
        if self._session:
            await self._session.close()


async def async_setup_services(hass: HomeAssistant, domain: str) -> bool:
    """Register custom services for Mediarr integration."""
    
    async def handle_movie_request(call: ServiceCall):
        """Handle a movie request service call."""
        handler = hass.data[domain].get("seer_request_handler")
        if handler:
            await handler.async_request_movie(call)

    async def handle_tv_request(call: ServiceCall):
        """Handle a TV show request service call."""
        handler = hass.data[domain].get("seer_request_handler")
        if handler:
            await handler.async_request_tv(call)

    async def handle_update_request(call: ServiceCall):
        """Handle an update request service call."""
        handler = hass.data[domain].get("seer_request_handler")
        if handler:
            await handler.async_update_request(call)

    try:
        hass.services.async_register(domain, SERVICE_MOVIE_REQUEST, handle_movie_request, schema=MOVIE_REQUEST_SCHEMA)
        hass.services.async_register(domain, SERVICE_TV_REQUEST, handle_tv_request, schema=TV_REQUEST_SCHEMA)
        hass.services.async_register(domain, SERVICE_UPDATE_REQUEST, handle_update_request, schema=UPDATE_REQUEST_SCHEMA)
        
        
        _LOGGER.info("Successfully registered all Mediarr services")
        return True
    except Exception as err:
        _LOGGER.error("Error setting up Mediarr services: %s", err)
        return False


async def async_unload_services(hass: HomeAssistant, domain: str) -> bool:
    """Unload Mediarr services."""
    handler = hass.data[domain].get("seer_request_handler")
    if handler:
        await handler.close()
    
    hass.services.async_remove(domain, SERVICE_MOVIE_REQUEST)
    hass.services.async_remove(domain, SERVICE_TV_REQUEST)
    hass.services.async_remove(domain, SERVICE_UPDATE_REQUEST)
    
    
    return True