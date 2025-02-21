from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from aiohttp import web, ClientSession
import requests
import os

from .parser import CACHE_FOLDER
os.makedirs(CACHE_FOLDER, exist_ok=True)

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
        self.name = f'{self._token}_Plex_Recently_Added'
        self.url = f'/{config_entry.data[CONF_NAME].lower() + "_" if len(config_entry.data[CONF_NAME]) > 0 else ""}plex_recently_added'

    async def get(self, request):
        filename = request.query.get("filename")
        if not filename:
            return web.Response(status=404)
        file_path = os.path.join(CACHE_FOLDER, filename)

        if not os.path.isfile(file_path):
            return web.Response(status=404)

        return web.FileResponse(file_path)


