"""DataUpdateCoordinator for the Open-Meteo Solar Forecast integration."""

from __future__ import annotations

from datetime import timedelta

from open_meteo_solar_forecast import Estimate, OpenMeteoSolarForecast

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY, CONF_LATITUDE, CONF_LONGITUDE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    CONF_AZIMUTH,
    CONF_BASE_URL,
    CONF_DECLINATION,
    CONF_EFFICIENCY_FACTOR,
    CONF_MODULES_POWER,
    DOMAIN,
    LOGGER,
)


class OpenMeteoSolarForecastDataUpdateCoordinator(DataUpdateCoordinator[Estimate]):
    """The Solar Forecast Data Update Coordinator."""

    config_entry: ConfigEntry

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the Solar Forecast coordinator."""
        self.config_entry = entry

        # Our option flow may cause it to be an empty string,
        # this if statement is here to catch that.
        api_key = entry.options.get(CONF_API_KEY) or None

        self.forecast = OpenMeteoSolarForecast(
            base_url=entry.data.get(CONF_BASE_URL),
            api_key=api_key,
            session=async_get_clientsession(hass),
            latitude=entry.data[CONF_LATITUDE],
            longitude=entry.data[CONF_LONGITUDE],
            declination=entry.options[CONF_DECLINATION],
            efficiency_factor=entry.options[CONF_EFFICIENCY_FACTOR],
            azimuth=entry.options[CONF_AZIMUTH] - 180,
            kwp=(entry.options[CONF_MODULES_POWER] / 1000),
        )

        update_interval = timedelta(minutes=30)

        super().__init__(hass, LOGGER, name=DOMAIN, update_interval=update_interval)

    async def _async_update_data(self) -> Estimate:
        """Fetch Open-Meteo Solar Forecast estimates."""
        return await self.forecast.estimate()
