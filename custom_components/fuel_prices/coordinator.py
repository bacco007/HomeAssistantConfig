"""Fuel Prices data hub."""

import logging
from datetime import timedelta

import async_timeout

from homeassistant.core import HomeAssistant
from pyfuelprices import FuelPrices, UpdateExceptionGroup
from pyfuelprices.sources import UpdateFailedError
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
            _LOGGER.exception(
                "Timeout updating fuel price data, will retry later: %s", err)
        except TypeError as err:
            _LOGGER.exception(
                "Error updating fuel price data, will retry later: %s", err)
        except UpdateFailedError as err:
            _LOGGER.exception(
                "Error communicating with a service %s", err.status, exc_info=err)
        except UpdateExceptionGroup as err:
            for e, v in err.failed_providers.items():
                _LOGGER.exception(
                    "Error communicating with service %s - %s", e, v, exc_info=v
                )
        except Exception as err:
            raise UpdateFailed(f"Error communicating with API {err}") from err
