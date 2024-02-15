import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN

logger = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Entry point to instantiate an inverter, based on a config."""

    # TODO: this is also called on "reload"! In that case it fails!
    # Maybe because unload didn't do its job?

    logger.debug(f"async_setup_entry(entry={entry})")

    # We'll be collecting some persistent data in hass.data
    hass.data.setdefault(DOMAIN, {})

    # Forward the setup to the sensor platform (sensor.py)
    return await hass.config_entries.async_forward_entry_setup(entry, Platform.SENSOR)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Entry point to delete an inverter, based on a config."""

    logger.debug(f"async_unload_entry(entry={entry})")

    # Forward the unloading to the sensor platform (sensor.py)
    return await hass.config_entries.async_unload_platforms(entry, Platform.SENSOR)
