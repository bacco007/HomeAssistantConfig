from datetime import timedelta
import logging
from typing import Dict, Any

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError

from .const import DOMAIN
from .sonarr_api import (
    SonarrApi,
    FailedToLogin,
    SonarrCannotBeReached
)

_LOGGER = logging.getLogger(__name__)

class SonarrDataCoordinator(DataUpdateCoordinator[Dict[str, Any]]):
    def __init__(self, hass: HomeAssistant, client: SonarrApi):
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
            return await self.hass.async_add_executor_job(self._client.update)
        except FailedToLogin as err:
            raise ConfigEntryError("Failed to Log-in") from err
        except SonarrCannotBeReached as err:
            raise ConfigEntryError("Sonarr cannot be reached") from err
        except Exception as err:
            raise ConfigEntryError("Sonarr encoutered unknown") from err