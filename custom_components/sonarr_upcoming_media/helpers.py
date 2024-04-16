from homeassistant.core import HomeAssistant
from .sonarr_api import SonarrApi

def setup_client(
    hass: HomeAssistant, 
    api: str, 
    days: int, 
    host: str, 
    port: int, 
    ssl: bool, 
    urlbase: str, 
    max: int
) -> SonarrApi:
    client = SonarrApi(hass, api, days, host, port, ssl, urlbase, max)

    client.update()
    return client
