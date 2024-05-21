from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from aiohttp import web
import requests

from homeassistant.const import (
    CONF_API_KEY, 
    CONF_NAME, 
    CONF_HOST, 
    CONF_PORT, 
    CONF_SSL
    )

from .const import DOMAIN

class ImagesRedirect(HomeAssistantView):
    requires_auth = False

    def __init__(self, config_entry: ConfigEntry):
        super().__init__()
        self._token = config_entry.data[CONF_API_KEY]
        self._base_url = f'http{'s' if config_entry.data[CONF_SSL] else ''}://{config_entry.data[CONF_HOST]}:{config_entry.data[CONF_PORT]}'
        self.name = f'{self._token}_Plex_Recently_Added'
        self.url = f'/{config_entry.data[CONF_NAME].lower() + "_" if len(config_entry.data[CONF_NAME]) > 0 else ""}plex_recently_added'

    async def get(self, request):
        path = request.query.get("path", "")
        url = f'{self._base_url}{path}?X-Plex-Token={self._token}'
        return web.HTTPFound(url)

