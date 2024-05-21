from homeassistant.core import HomeAssistant
from .plex_api import PlexApi

async def setup_client(
    hass: HomeAssistant,
    name: str,
    ssl: bool,
    token: str,
    max: int,
    on_deck: bool,
    host: str,
    port: int,
    section_types: list,
    section_libraries: list,
    exclude_keywords: list,
    verify_ssl: bool,
    ):
    client = PlexApi(hass, name, ssl, token, max, on_deck, host, port, section_types, section_libraries, exclude_keywords, verify_ssl)

    await client.update()
    return client