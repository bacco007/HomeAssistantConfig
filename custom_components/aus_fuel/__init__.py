"""The Australia Fuel Prices integration."""
from __future__ import annotations

import logging

from numpy import empty

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE, Platform
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.core import HomeAssistant

from .const import DOMAIN, SCAN_INTERVAL
from .aus_fuel_api import AusFuelAPI

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Australia Fuel Prices from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    search_distance = entry.data["search_distance"]
    latitude = entry.data[CONF_LATITUDE]
    longitude = entry.data[CONF_LONGITUDE]

    async def async_update_data():
        api = AusFuelAPI(search_distance, latitude, longitude)
        result = await hass.async_add_executor_job(api.refresh_data)
        if result:
            return api.get_data()
        else:
            return None

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name="Australian Fuel Prices",
        update_method=async_update_data,
        update_interval=SCAN_INTERVAL,
    )

    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = coordinator

    hass.config_entries.async_setup_platforms(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
