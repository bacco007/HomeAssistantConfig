from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from aiohttp import web, ClientSession
import requests
import os

from homeassistant.const import (
    CONF_API_KEY, 
    CONF_NAME, 
    CONF_HOST, 
    CONF_PORT, 
    CONF_SSL
    )

from .const import DOMAIN

class ImagesRedirect(HomeAssistantView):
    def __init__(self, config_entry: ConfigEntry):
        super().__init__()
        self._token = config_entry.data[CONF_API_KEY]
        self._base_url = f'http{'s' if config_entry.data[CONF_SSL] else ''}://{config_entry.data[CONF_HOST]}:{config_entry.data[CONF_PORT]}'
        self.name = f'{self._token}_Plex_Recently_Added'
        self.url = f'/{config_entry.data[CONF_NAME].lower() + "_" if len(config_entry.data[CONF_NAME]) > 0 else ""}plex_recently_added'

    async def get(self, request):
        metadataId = int(request.query.get("metadata", 0))
        thumbId = int(request.query.get("thumb", 0))
        artId = int(request.query.get("art", 0))
        
        if metadataId == 0:
            return web.HTTPNotFound()
        image_type = "thumb" if thumbId != 0 else "art"
        image_id = thumbId if thumbId != 0 else artId if artId != 0 else ""

        url = f'{self._base_url}/library/metadata/{metadataId}/{image_type}/{image_id}?X-Plex-Token={self._token}'

        async with ClientSession() as session:
            async with session.get(url) as res:
                if res.ok:
                    content = await res.read()
                    return web.Response(body=content, content_type=res.content_type)

                return web.HTTPNotFound()


