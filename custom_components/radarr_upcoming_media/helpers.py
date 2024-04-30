from homeassistant.core import HomeAssistant
from .radarr_api import RadarrApi

def setup_client(
    hass: HomeAssistant,
    api: str,
    days: int,
    host: str,
    port: int,
    ssl: bool,
    urlbase: str,
    theaters: bool,
    max: int
) -> RadarrApi:
    client = RadarrApi(hass, api, days, host, port, ssl, urlbase, theaters, max)

    client.update()
    return client