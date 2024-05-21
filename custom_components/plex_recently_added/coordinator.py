from datetime import timedelta
import logging
from typing import Dict, Any

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError

from .const import DOMAIN
from .plex_api import (
    PlexApi,
    FailedToLogin,
)

_LOGGER = logging.getLogger(__name__)

class PlexDataCoordinator(DataUpdateCoordinator[Dict[str, Any]]):
    def __init__(self, hass: HomeAssistant, client: PlexApi):
        self._client = client

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_method=self._async_update_data,
            update_interval=timedelta(minutes=10),
        )
    
    async def _async_update_data(self) -> Dict[str, Any]:
        try:
            return await self._client.update()
        except FailedToLogin:
            raise ConfigEntryError("Failed to Log-in") from err