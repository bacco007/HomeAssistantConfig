from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from aiohttp import web, ClientError
from homeassistant.helpers.aiohttp_client import async_get_clientsession
import requests
import os
import logging

_LOGGER = logging.getLogger(__name__)

from homeassistant.const import (
    CONF_API_KEY, 
    CONF_NAME, 
    CONF_HOST, 
    CONF_PORT, 
    CONF_SSL
    )

from .const import DOMAIN

class ImagesRedirect(HomeAssistantView):
    def __init__(self, hass, config_entry: ConfigEntry):
        super().__init__()
        self._token = config_entry.data[CONF_API_KEY]
        self._base_url = f'http{'s' if config_entry.data[CONF_SSL] else ''}://{config_entry.data[CONF_HOST]}:{config_entry.data[CONF_PORT]}'
        self.name = f'{self._token}_Plex_Recently_Added'
        self.url = f'/{config_entry.data[CONF_NAME].lower() + "_" if len(config_entry.data[CONF_NAME]) > 0 else ""}plex_recently_added'
        self._session = async_get_clientsession(hass)

    async def get(self, request):
        metadataId = int(request.query.get("metadata", 0))
        thumbId = int(request.query.get("thumb", 0))
        artId = int(request.query.get("art", 0))
        
        if metadataId == 0:
            return web.HTTPNotFound()
        image_type = "thumb" if thumbId != 0 else "art"
        image_id = thumbId if thumbId != 0 else artId if artId != 0 else ""

        url = f'{self._base_url}/library/metadata/{metadataId}/{image_type}/{image_id}?X-Plex-Token={self._token}'

        fwd_headers = {}
        if_modified = request.headers.get("If-Modified-Since")
        if_none = request.headers.get("If-None-Match")
        if if_modified:
            fwd_headers["If-Modified-Since"] = if_modified
        if if_none:
            fwd_headers["If-None-Match"] = if_none

        try:
            async with self._session.get(url, headers=fwd_headers, timeout=10) as res:
                if res.status == 304:
                    return web.Response(status=304)

                ctype = res.headers.get("Content-Type", "")
                if res.status == 200 and ctype.startswith("image/"):
                    body = await res.read()
                    headers = {
                        "Content-Type": ctype or "image/jpeg",
                        "Cache-Control": "public, max-age=31536000, immutable",
                    }
                    etag = res.headers.get("ETag")
                    last_mod = res.headers.get("Last-Modified")
                    if etag:
                        headers["ETag"] = etag
                    if last_mod:
                        headers["Last-Modified"] = last_mod
                    return web.Response(body=body, headers=headers)

                _LOGGER.debug("Missing artwork (status=%s, ctype=%s) url=%s", res.status, ctype, url)
                return web.HTTPNotFound()
        except ClientError:
            _LOGGER.debug("Upstream image fetch failed url=%s", url)
            return web.HTTPBadGateway()


