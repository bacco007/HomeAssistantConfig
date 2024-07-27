"""Fuel Prices data hub."""

import logging
from datetime import timedelta

import async_timeout

from homeassistant.core import HomeAssistant
from pyfuelprices import FuelPrices
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

_LOGGER = logging.getLogger(__name__)


class FuelPricesCoordinator(DataUpdateCoordinator):
    """Fuel Prices data coordinator."""

    def __init__(self, hass: HomeAssistant, api: FuelPrices, name: str) -> None:
        """Init the coordinator."""
        super().__init__(
            hass=hass,
            logger=_LOGGER,
            name=name,
            update_interval=timedelta(minutes=30),
        )
        self.api: FuelPrices = api

    async def _async_update_data(self):
        """Fetch and update data from the API."""
        try:
            async with async_timeout.timeout(240):
                return await self.api.update()
        except TimeoutError as err:
            _LOGGER.error("Timeout updating fuel price data: %s", err)
        except TypeError as err:
            _LOGGER.error("Error updating fuel price data: %s", err)
        except Exception as err:
            raise UpdateFailed(f"Error communicating with API {err}") from err
