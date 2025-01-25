# mediarr/server/jellyfin.py or mediarr/server/emby.py
"""The Jellyfin/Emby integration for Mediarr."""

import logging
from datetime import datetime
import voluptuous as vol
from homeassistant.const import CONF_URL, CONF_TOKEN
import homeassistant.helpers.config_validation as cv
from ..common.const import CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS
from ..common.sensor import MediarrSensor

_LOGGER = logging.getLogger(__name__)

SERVER_SCHEMA = {
    vol.Required(CONF_URL): cv.url,
    vol.Required(CONF_TOKEN): cv.string,
    vol.Optional(CONF_MAX_ITEMS, default=DEFAULT_MAX_ITEMS): cv.positive_int,
}

class BaseMediaServerSensor(MediarrSensor):
    """Base class for Jellyfin/Emby sensors."""

    def __init__(self, session, url, token, max_items):
        """Initialize the sensor."""
        super().__init__()
        self._session = session
        self._url = url.rstrip('/')
        self._token = token
        self._max_items = max_items
        self._name = "Media Server"  # Override in child class

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique ID for the sensor."""
        return f"mediarr_{self._url}"

    @classmethod
    async def create_sensors(cls, hass, config):
        """Create sensor entities."""
        session = hass.helpers.aiohttp_client.async_get_clientsession()
        return [cls(
            session,
            config[CONF_URL],
            config[CONF_TOKEN],
            config[CONF_MAX_ITEMS]
        )]

    async def process_media(self, item):
        """Process media items. Override in child class."""
        raise NotImplementedError()

    async def async_update(self):
        """Update sensor data. Override in child class."""
        raise NotImplementedError()