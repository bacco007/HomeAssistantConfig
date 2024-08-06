"""Coordinator for the Moon Phase integration."""

from datetime import timedelta
import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN
from .moon import MoonCalc

_LOGGER = logging.getLogger(__name__)


class MoonUpdateCoordinator(DataUpdateCoordinator):
    """Class to calculate the Moon phase."""

    def __init__(self, hass: HomeAssistant, moon_calc: MoonCalc) -> None:
        """Initialize the coordinator."""
        self.hass = hass
        self.moon_calc = moon_calc

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=1),
            always_update=True,
        )

    async def _async_update_data(self):
        """Fetch data from the source."""
        try:
            await self.hass.async_add_executor_job(self.moon_calc.update)
            moon_phase = await self.hass.async_add_executor_job(
                self.moon_calc.get_moon_phase_name
            )
            attributes = await self.hass.async_add_executor_job(
                self.moon_calc.get_moon_attributes
            )

            extra_attributes = await self.hass.async_add_executor_job(
                self.moon_calc.get_extra_attributes
            )

        except Exception as err:
            raise UpdateFailed(f"Error updating data: {err}") from err
        else:
            return {
                "moon_phase": moon_phase,
                "attributes": attributes,
                "extra_attributes": extra_attributes,
            }
